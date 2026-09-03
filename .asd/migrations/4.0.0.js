#!/usr/bin/env node
/*
 * ASD migration -> 4.0.0. Cleanup for sprint 004-review-scoping-and-test-audit's agent-roster
 * churn (AC-13): five internal code reviewers merged into asd-reviewer-correctness /
 * asd-reviewer-efficiency (AC-7), the two dev agents merged into asd-dev (AC-10), and
 * asd-test-engineer / asd-ux-designer renamed to asd-tester / asd-ux (AC-11). Consumer projects
 * only - this repo does its own equivalent cleanup by editing canon and running
 * `sync.js --apply` (decisions-log 2026-09-03), never by running this script.
 *
 * Contract (see .asd/skills/asd-update/update.js's own header comment + SKILL.md "Migrations"):
 * filename (minus .js) is the target asd_version; module.exports = (ctx) => void | Promise<void>
 * with ctx.repoRoot = the consumer project root; zero-dependency Node; idempotent - re-running an
 * already-applied migration is a no-op, never an error.
 *
 * Scope, in order:
 *   1. Delete the generated provider views of the nine agents this release retires, gated on the
 *      ASD ownership marker so a consumer's own hand-authored agent of the same name is never
 *      touched (audit.md's own stated mitigation for this being the sprint's only destructive
 *      code: an explicit hardcoded name list, never a generic scan of the generated trees - that
 *      broader scan already exists, marker-gated, in `.asd/sync.js`'s orphan detection, which a
 *      consumer reaches via a separate `sync.js --apply`, not this migration).
 *   2. Delete any other file this release retires that sits outside `managed_paths` (same
 *      hardcoded, marker-gated mechanism) - empty for 4.0.0: nothing besides the nine agent views
 *      falls out of managed_paths this release.
 *   3. Add `test_affected` to the consumer's `.asd/project/commands.yaml` when absent and a
 *      supported test runner is detected; leave it alone otherwise (AC-5).
 *   4. Warn (never rewrite) when an active sprint sits in a review phase, since its
 *      `state.json.reviews.*.verdicts` may carry retired reviewer keys - sprint state is out of
 *      migration scope.
 * Never touches: `.asd/project/config.yaml` values, `.asd/sprints/**` content, `docs/**`, custom
 * rules, custom skills/agents/hooks.
 */
'use strict';

const fs = require('fs');
const path = require('path');

// The nine agent names this release retires - AC-7 (five reviewers merged), AC-10 (two devs
// merged), AC-11 (two renamed). Hardcoded rather than derived from current canon, so a later
// canon edit can never silently change what THIS migration deletes.
const RETIRED_AGENTS = [
  'asd-reviewer-quality',
  'asd-reviewer-implementation',
  'asd-reviewer-ui',
  'asd-reviewer-simplification',
  'asd-reviewer-performance',
  'asd-backend-dev',
  'asd-frontend-dev',
  'asd-test-engineer',
  'asd-ux-designer',
];

// Any other generated-view path this release leaves behind outside `managed_paths`, beyond the
// nine retired agents above. Empty for 4.0.0 (audit.md/plan.md found no other file dropped from
// `managed_paths` this release) - kept as its own list so a future migration copying this file's
// structure has a named place for its own leftovers rather than overloading RETIRED_AGENTS.
const OTHER_STALE_RELPATHS = [];

function retiredAgentTargets(repoRoot) {
  const targets = [];
  for (const name of RETIRED_AGENTS) {
    targets.push(path.join(repoRoot, '.claude', 'agents', `${name}.md`));
    targets.push(path.join(repoRoot, '.codex', 'agents', `${name}.toml`));
    targets.push(path.join(repoRoot, '.agents', 'skills', name, 'SKILL.md'));
  }
  return targets;
}

function toRepoRel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).replace(/\\/g, '/');
}

// Removes the parent directory only when deleting its file left it empty - safe because an empty
// directory has no content to lose, and covers the `.agents/skills/<name>/SKILL.md` case where the
// per-skill directory would otherwise survive the file it existed to hold.
function removeIfEmptyDir(absDir) {
  if (!fs.existsSync(absDir)) return;
  if (fs.readdirSync(absDir).length > 0) return;
  fs.rmdirSync(absDir);
}

// Deletes exactly one generated-view file, gated on the ASD ownership marker. A missing file is
// success (idempotency: re-running after a prior successful run finds nothing left to delete). A
// file without the marker is a consumer's own agent/skill sharing the retired name by coincidence
// - left alone and reported, never touched.
function deleteMarkedView(sync, repoRoot, absPath, report) {
  const rel = toRepoRel(repoRoot, absPath);
  if (!fs.existsSync(absPath)) {
    report.missing.push(rel);
    return;
  }
  if (!sync.hasOwnershipMarker(absPath)) {
    report.skippedUnmarked.push(rel);
    return;
  }
  fs.rmSync(absPath, { force: true });
  removeIfEmptyDir(path.dirname(absPath));
  report.deleted.push(rel);
}

function deleteRetiredAgentViews(sync, repoRoot, report) {
  for (const absPath of retiredAgentTargets(repoRoot)) {
    deleteMarkedView(sync, repoRoot, absPath, report);
  }
}

function deleteOtherStaleFiles(sync, repoRoot, report) {
  for (const relPath of OTHER_STALE_RELPATHS) {
    deleteMarkedView(sync, repoRoot, path.join(repoRoot, relPath), report);
  }
}

// Runner keyed on the test runner actually present in the consumer project, mirroring
// asd-init step 8's own detection convention (SKILL.md) so both paths agree on what counts as
// "detectable". No match, or a matched runner with no such flag, returns null - never guess.
function detectTestAffected(repoRoot) {
  const pkgPath = path.join(repoRoot, 'package.json');
  if (fs.existsSync(pkgPath)) {
    let pkg = null;
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    } catch (_) {
      pkg = null;
    }
    if (pkg) {
      const deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);
      if (Object.prototype.hasOwnProperty.call(deps, 'jest')) return 'jest --changedSince=<BASE_REF>';
      if (Object.prototype.hasOwnProperty.call(deps, 'vitest')) return 'vitest run --changed <BASE_REF>';
    }
  }
  const pyManifests = ['pyproject.toml', 'requirements.txt', 'requirements-dev.txt'];
  for (const name of pyManifests) {
    const p = path.join(repoRoot, name);
    if (!fs.existsSync(p)) continue;
    let text = '';
    try {
      text = fs.readFileSync(p, 'utf8');
    } catch (_) {
      continue;
    }
    if (/pytest-testmon/i.test(text)) return 'pytest --testmon';
    if (/pytest-picked/i.test(text)) return 'pytest --picked --mode=branch --parent-branch=<BASE_REF>';
  }
  return null;
}

// Additive only: never overwrites an existing `test_affected` line (active, non-comment), and
// never writes a guessed value when no supported runner is detected - the impacted set then keeps
// falling back to the search-derived definition, exactly as an omitted field already means today.
function migrateCommandsYaml(sync, repoRoot, report) {
  const p = path.join(repoRoot, '.asd', 'project', 'commands.yaml');
  if (!fs.existsSync(p)) {
    report.commandsYaml = { status: 'missing' };
    return;
  }
  const text = sync.readNormalized(p);
  if (/^test_affected\s*:/m.test(text)) {
    report.commandsYaml = { status: 'already-present' };
    return;
  }
  const value = detectTestAffected(repoRoot);
  if (!value) {
    report.commandsYaml = { status: 'undetectable' };
    return;
  }
  const line = `test_affected: "${value}"`;
  const customHeader = /^custom:\s*$/m;
  const next = customHeader.test(text)
    ? text.replace(customHeader, `${line}\n\ncustom:`)
    : `${text.replace(/\n*$/, '\n')}\n${line}\n`;
  sync.writeNormalized(p, next);
  report.commandsYaml = { status: 'added', value };
}

// Warn-only, never rewrites: an active sprint sitting in a review phase may have retired reviewer
// keys under `state.json.reviews.<phase>.verdicts` (AC-2's latch, AC-7's rename). Sprint state is
// out of migration scope (decisions-log 2026-09-03) - the fix is finishing or re-running that
// review iteration, which the consumer does themselves.
const REVIEW_PHASES = new Set(['design-review', 'impl-review']);

function warnActiveReviewSprints(repoRoot, report, warn) {
  const sprintsDir = path.join(repoRoot, '.asd', 'sprints');
  if (!fs.existsSync(sprintsDir)) return;
  for (const entry of fs.readdirSync(sprintsDir)) {
    const statePath = path.join(sprintsDir, entry, 'state.json');
    if (!fs.existsSync(statePath)) continue;
    let state = null;
    try {
      state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    } catch (_) {
      continue;
    }
    if (!state || !REVIEW_PHASES.has(state.phase)) continue;
    report.activeReviewSprints.push(entry);
    warn(
      `sprint "${entry}" is mid-"${state.phase}" and may hold retired reviewer keys under ` +
      'state.json.reviews.*.verdicts (agent roster changed in ASD 4.0.0) - finish or re-run that ' +
      'review iteration before relying on the APPROVE latch for this sprint.'
    );
  }
}

module.exports = function migrate(ctx) {
  const repoRoot = ctx.repoRoot;
  const sync = require(path.join(repoRoot, '.asd', 'sync.js'));
  const warn = (m) => process.stdout.write(`asd-migration 4.0.0: warning: ${m}\n`);

  const report = {
    deleted: [],
    skippedUnmarked: [],
    missing: [],
    commandsYaml: null,
    activeReviewSprints: [],
  };

  deleteRetiredAgentViews(sync, repoRoot, report);
  deleteOtherStaleFiles(sync, repoRoot, report);
  migrateCommandsYaml(sync, repoRoot, report);
  warnActiveReviewSprints(repoRoot, report, warn);

  if (report.skippedUnmarked.length > 0) {
    warn(
      `left ${report.skippedUnmarked.length} unmarked file(s) untouched (not ASD-generated, ` +
      `likely a consumer's own agent/skill sharing a retired name): ${report.skippedUnmarked.join(', ')}`
    );
  }

  return report;
};
