/*
 * ASD migration -> 6.0.0. Cleanup for this release's retirement of `state.json.escalations`: the
 * per-sprint friction log is now the single channel for workflow malfunction, so the key is gone
 * from `t_state.json` and no writer or reader remains. This strips the leftover key from a
 * consumer's active sprint state. Consumer projects only - this repo does its own equivalent
 * cleanup by editing canon, never by running this script.
 *
 * Contract (see .asd/skills/asd-update/update.js's own header comment): filename (minus .js) is
 * the target asd_version; module.exports = (ctx) => MigrationReport | Promise<MigrationReport>
 * with ctx.repoRoot = the consumer project root; zero-dependency Node; idempotent - re-running an
 * already-applied migration is a no-op, never an error.
 *
 * `.asd/sprints/**` is otherwise out of migration scope (4.0.0 warns about stale sprint state
 * rather than rewriting it). Deliberate exception here: the retired key lives nowhere else, so
 * warn-only would leave a dead field in every live sprint state until that sprint is archived.
 * Only that one member is removed; every other byte of the file, its line endings included, is
 * preserved. Archived sprints keep theirs - closed sprints are immutable history.
 *
 * The release's other breaking change, the new `retro` phase between `impl-review` and `pr`,
 * needs no state mutation: an in-flight sprint routes into `retro` through the new chain and
 * lands on the retro workflow's empty-log branch, which reads an absent log and completes.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ARCHIVE_DIR = 'archived';

// The retired member as it is actually serialized: one line, array value closed on that line.
const ESCALATIONS_MEMBER_RE = /^\s*"escalations"\s*:\s*\[[^\]]*\]\s*(,?)\s*$/;

// Active sprints only - direct children of `.asd/sprints/` holding a `state.json`. The archive
// subtree is skipped whole.
function activeSprintStatePaths(repoRoot) {
  const sprintsDir = path.join(repoRoot, '.asd', 'sprints');
  if (!fs.existsSync(sprintsDir)) return [];
  const statePaths = [];
  for (const entry of fs.readdirSync(sprintsDir)) {
    if (entry === ARCHIVE_DIR) continue;
    const statePath = path.join(sprintsDir, entry, 'state.json');
    if (fs.existsSync(statePath)) statePaths.push(statePath);
  }
  return statePaths;
}

function dropTrailingCommaBefore(lines, fromIndex) {
  for (let i = fromIndex; i >= 0; i--) {
    if (lines[i].trim() === '') continue;
    lines[i] = lines[i].replace(/,(\s*)$/, '$1');
    return;
  }
}

// Returns `raw` without the `escalations` member, or null when this line scanner cannot do it
// safely - member split across lines, or a result that would no longer parse. A null leaves the
// consumer's file untouched rather than risking a broken state file.
function withoutEscalationsMember(raw) {
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(/\r?\n/);
  const index = lines.findIndex((line) => ESCALATIONS_MEMBER_RE.test(line));
  if (index === -1) return null;
  const hasTrailingComma = ESCALATIONS_MEMBER_RE.exec(lines[index])[1] === ',';
  lines.splice(index, 1);
  if (!hasTrailingComma) dropTrailingCommaBefore(lines, index - 1);
  const text = lines.join(eol);
  try {
    JSON.parse(text);
  } catch (_) {
    return null;
  }
  return text;
}

function stripSprintState(repoRoot, statePath, report, warn) {
  const rel = path.relative(repoRoot, statePath).replace(/\\/g, '/');
  const raw = fs.readFileSync(statePath, 'utf8');
  let state = null;
  try {
    state = JSON.parse(raw);
  } catch (_) {
    report.skipped.push(rel);
    warn(`${rel} is not parsable JSON - left untouched, remove the "escalations" key by hand.`);
    return;
  }
  if (!state || !Object.prototype.hasOwnProperty.call(state, 'escalations')) {
    report.absent.push(rel);
    return;
  }
  const next = withoutEscalationsMember(raw);
  if (next === null) {
    report.skipped.push(rel);
    warn(`${rel} holds "escalations" in an unexpected shape - left untouched, remove it by hand.`);
    return;
  }
  if (Array.isArray(state.escalations) && state.escalations.length > 0) {
    warn(
      `${rel} carried ${state.escalations.length} recorded escalation(s), now dropped - re-record ` +
      `them as friction entries in that sprint's friction-log.md: ${JSON.stringify(state.escalations)}`
    );
  }
  fs.writeFileSync(statePath, next, { encoding: 'utf8' });
  report.stripped.push(rel);
}

/** Removes the retired `escalations` key from every active sprint's `state.json`, per-file outcome in the returned report. */
module.exports = function migrate(ctx) {
  const warn = (m) => process.stdout.write(`asd-migration 6.0.0: warning: ${m}\n`);
  const report = { stripped: [], absent: [], skipped: [] };
  for (const statePath of activeSprintStatePaths(ctx.repoRoot)) {
    stripSprintState(ctx.repoRoot, statePath, report, warn);
  }
  return report;
};
