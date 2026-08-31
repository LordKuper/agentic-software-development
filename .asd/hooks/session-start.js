// ASD SessionStart hook (canonical, provider-agnostic).
// No shebang: this file is never executed directly (`./session-start.js`),
// always invoked as `node <path> --provider ...`, and every generated
// provider-view target prepends an ownership-marker comment as line 1 - a
// shebang on line 2 would not be recognized by Node and breaks parsing.
// Detect active sprint, inject summary into agent context.
// Silent fail on any error (hooks must not block session).
//
// Invocation (wired via .claude/settings.json / .codex/hooks.json):
//   node .asd/hooks/session-start.js --provider claude|codex
// Repo root is resolved by walking up from this script's own location (then,
// as a fallback, from cwd) until a `.asd/` directory is found - never
// `process.cwd()` alone - so this works when invoked from a nested directory.
// The `--provider` argument is required by the wiring contract (no host
// heuristics) and changes the printed skill-invocation form: `/asd-*` for
// Claude Code, `$asd-*` for Codex (providers.md § semantic ops - Codex has
// no slash-command equivalent). Everything else in the summary is identical.

'use strict';

const fs = require('fs');
const path = require('path');

const PHASE_CHAIN = [
  'scope',
  'audit',
  'design',
  'design-review',
  'design-promote',
  'plan',
  'impl',
  'impl-test',
  'impl-review',
  'pr',
  'done',
];

function findUp(startDir) {
  let dir = path.resolve(startDir);
  for (;;) {
    if (fs.existsSync(path.join(dir, '.asd'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

// Prefer resolving from the script's own location (works no matter what cwd
// the host process used to invoke us); fall back to cwd walk-up; fall back to
// raw cwd so the hook never throws even in a non-ASD directory.
function resolveRepoRoot() {
  return findUp(__dirname) || findUp(process.cwd()) || process.cwd();
}

function parseProvider(argv) {
  const idx = argv.indexOf('--provider');
  if (idx === -1 || idx === argv.length - 1) return null;
  const value = argv[idx + 1];
  return value === 'claude' || value === 'codex' ? value : null;
}

function findActiveSprints(repoRoot) {
  const sprintsDir = path.join(repoRoot, '.asd', 'sprints');
  if (!fs.existsSync(sprintsDir)) return [];
  const entries = fs.readdirSync(sprintsDir, { withFileTypes: true });
  const active = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'archived') continue;
    const statePath = path.join(sprintsDir, entry.name, 'state.json');
    if (!fs.existsSync(statePath)) continue;
    try {
      const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      active.push({ folder: entry.name, state });
    } catch (_) {
      // skip malformed state.json
    }
  }
  return active;
}

function nextPhase(current) {
  const idx = PHASE_CHAIN.indexOf(current);
  if (idx < 0 || idx >= PHASE_CHAIN.length - 1) return 'done';
  return PHASE_CHAIN[idx + 1];
}

// Pick the relevant review node for the current phase. In a review phase use
// that phase's node; otherwise use whichever counter advanced most recently.
function reviewNodeForPhase(reviews, phase) {
  if (!reviews || typeof reviews !== 'object') return null;
  if (phase === 'design-review') return reviews.design || null;
  if (phase === 'impl-review') return reviews.impl || null;
  const d = reviews.design || null;
  const i = reviews.impl || null;
  const di = (d && d.iteration) || 0;
  const ii = (i && i.iteration) || 0;
  if (ii > 0 && ii >= di) return i;
  if (di > 0) return d;
  return null;
}

function lastReviewVerdict(node) {
  if (!node || typeof node !== 'object') return 'n/a';
  const verdictsByIter = node.verdicts;
  if (!verdictsByIter || typeof verdictsByIter !== 'object') return 'n/a';
  const iters = Object.keys(verdictsByIter).sort();
  if (iters.length === 0) return 'n/a';
  const latest = verdictsByIter[iters[iters.length - 1]];
  if (!latest || typeof latest !== 'object') return 'n/a';
  const verdicts = Object.values(latest);
  if (verdicts.some(v => v === 'red' || v === 'FAIL')) return 'red';
  if (verdicts.some(v => v === 'yellow' || v === 'CONCERNS')) return 'yellow';
  if (verdicts.length > 0 && verdicts.every(v => v === 'green' || v === 'APPROVE')) return 'green';
  return 'mixed';
}

// Skill invocation form differs per provider (providers.md § semantic ops):
// Claude Code uses `/asd-*` slash commands; Codex has no such form and is
// invoked via `$asd-*` (or the `/skills` picker, or implicit description
// match) - printing `/asd-sprint` into a Codex session names a command that
// doesn't exist there.
function skillRef(provider, name) {
  return provider === 'codex' ? `$${name}` : `/${name}`;
}

function summary(active, provider) {
  if (active.length === 0) {
    return `[ASD] No active sprint. Run ${skillRef(provider, 'asd-sprint')} to begin, or ${skillRef(provider, 'asd-init')} to set up the workflow.`;
  }
  if (active.length > 1) {
    const ids = active.map(a => a.state.sprint_id || a.folder).join(', ');
    return `[ASD] WARNING: multiple active sprints found (${ids}). Manual cleanup needed in .asd/sprints/.`;
  }
  const { state, folder } = active[0];
  const id = state.sprint_id || folder;
  const phase = state.phase || 'unknown';
  const reviewNode = reviewNodeForPhase(state.reviews, phase);
  const iter = reviewNode && reviewNode.iteration != null ? reviewNode.iteration : 0;
  const branch = state.branch || 'unknown';
  const verdict = lastReviewVerdict(reviewNode);
  const next = nextPhase(phase);
  const iterPart = phase.endsWith('-review') ? ` (iter ${iter})` : '';
  return [
    `[ASD] Active sprint: ${id}`,
    `  Phase: ${phase}${iterPart}`,
    `  Branch: ${branch}`,
    `  Last review verdict: ${verdict}`,
    `  Next phase: ${next}`,
    `  Continue with ${skillRef(provider, 'asd-sprint')}.`,
  ].join('\n');
}

(function main() {
  try {
    const provider = parseProvider(process.argv.slice(2)) || 'claude'; // defaults to claude's slash-command form if wiring ever omits the arg
    const repoRoot = resolveRepoRoot();
    const active = findActiveSprints(repoRoot);
    const text = summary(active, provider);
    const output = {
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: text,
      },
    };
    process.stdout.write(JSON.stringify(output));
    process.exit(0);
  } catch (_) {
    // silent fail
    process.exit(0);
  }
})();
