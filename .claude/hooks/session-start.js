#!/usr/bin/env node
// ASD SessionStart hook.
// Detect active sprint, inject summary into Claude context.
// Silent fail on any error (hooks must not block session).

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
  'impl-review',
  'pr',
  'done',
];

function findActiveSprints() {
  const sprintsDir = path.join(process.cwd(), '.asd', 'sprints');
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

function lastReviewVerdict(reviews) {
  if (!reviews || typeof reviews !== 'object') return 'n/a';
  const iters = Object.keys(reviews).sort();
  if (iters.length === 0) return 'n/a';
  const latest = reviews[iters[iters.length - 1]];
  if (!latest || typeof latest !== 'object') return 'n/a';
  const verdicts = Object.values(latest);
  if (verdicts.some(v => v === 'red' || v === 'FAIL')) return 'red';
  if (verdicts.some(v => v === 'yellow' || v === 'CONCERNS')) return 'yellow';
  if (verdicts.length > 0 && verdicts.every(v => v === 'green' || v === 'APPROVE')) return 'green';
  return 'mixed';
}

function summary(active) {
  if (active.length === 0) {
    return '[ASD] No active sprint. Run /asd-sprint to begin, or /asd-init to set up the workflow.';
  }
  if (active.length > 1) {
    const ids = active.map(a => a.state.sprint_id || a.folder).join(', ');
    return `[ASD] WARNING: multiple active sprints found (${ids}). Manual cleanup needed in .asd/sprints/.`;
  }
  const { state, folder } = active[0];
  const id = state.sprint_id || folder;
  const phase = state.phase || 'unknown';
  const iter = state.iteration != null ? state.iteration : 0;
  const branch = state.branch || 'unknown';
  const verdict = lastReviewVerdict(state.reviews);
  const next = nextPhase(phase);
  const iterPart = phase.endsWith('-review') ? ` (iter ${iter})` : '';
  return [
    `[ASD] Active sprint: ${id}`,
    `  Phase: ${phase}${iterPart}`,
    `  Branch: ${branch}`,
    `  Last review verdict: ${verdict}`,
    `  Next phase: ${next}`,
    '  Continue with /asd-sprint.',
  ].join('\n');
}

(function main() {
  try {
    const active = findActiveSprints();
    const text = summary(active);
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
