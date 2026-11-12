#!/usr/bin/env node
/*
 * ASD migration -> 14.5.0. Two stale-state cleanups in a consumer project: the hand-authored
 * `.claude/agent-memory/<agent>/` directories of agents earlier releases retired are dead state, and
 * the design.md install command no longer writes the project's package manifest. Consumer projects
 * only - this repo edits canon directly and never runs this script.
 *
 * Contract (see .asd/skills/asd-update/update.js's own header comment): filename (minus .js) is
 * the target asd_version; module.exports = (ctx) => MigrationReport | Promise<MigrationReport>
 * with ctx.repoRoot = the consumer project root; zero-dependency Node; idempotent - re-running an
 * already-applied migration is a no-op, never an error. This script's MigrationReport shape is
 * `{ deleted, missing, rewritten, unchanged }`.
 *
 * Scope, in order:
 *   1. Delete `.claude/agent-memory/<name>/` for every name in the retired lists of migrations 4.0.0,
 *      5.0.0 and 14.0.0 that is not a live canonical agent or tier variant (`asd-reviewer-quality` was
 *      retired in 4.0.0 and is live again). When the canonical agents directory is unreadable no
 *      directory is deleted: a live agent's memory is never guessed at.
 *   2. Rewrite `.asd/project/commands.yaml` `designmd-install` from exactly
 *      `npm install @google/design.md` to `npm install --no-save @google/design.md`; any other value,
 *      or an absent file or key, is left untouched.
 * Never touches config values, `docs/**`, custom rules, sprints or any other agent memory.
 */
'use strict';

const fs = require('fs');
const path = require('path');

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
  'asd-pm',
  'asd-ba',
  'asd-ux',
  'asd-architect',
  'asd-reviewer-correctness',
  'asd-reviewer-testing',
  'asd-reviewer-documentation',
  'asd-dev-critical',
  'asd-tester-critical',
  'asd-tester-mechanical',
];
const MEMORY_PARTS = ['.claude', 'agent-memory'];
const AGENTS_PARTS = ['.asd', 'agents'];
const COMMANDS_PARTS = ['.asd', 'project', 'commands.yaml'];
const OLD_INSTALL_VALUE = /^([ \t]*designmd-install:[ \t]*)(["'])npm install @google\/design\.md\2(?=[ \t]*(?:#.*)?\r?$)/gm;
const NEW_INSTALL_VALUE = 'npm install --no-save @google/design.md';

function toRepoRel(parts) {
  return parts.join('/');
}

/** Names of every canonical agent and its tier variants, or null when the agents directory is unreadable. */
function liveAgentNames(repoRoot, sync) {
  const agentsDir = path.join(repoRoot, ...AGENTS_PARTS);
  if (!fs.existsSync(agentsDir)) return null;
  const names = new Set();
  for (const entry of fs.readdirSync(agentsDir).filter((file) => file.endsWith('.md'))) {
    const base = entry.slice(0, -'.md'.length);
    names.add(base);
    try {
      const { meta } = sync.parseCanonicalFrontmatter(sync.normalizeText(fs.readFileSync(path.join(agentsDir, entry), 'utf8')));
      for (const suffix of Object.keys(meta.variants || {})) names.add(`${base}-${suffix}`);
    } catch (_) {
      names.add(base);
    }
  }
  return names;
}

function removeRetiredMemory(repoRoot, sync, report, warn) {
  const live = liveAgentNames(repoRoot, sync);
  if (live === null) {
    warn(`${toRepoRel(AGENTS_PARTS)} is missing - retired agent memory directories left untouched.`);
    return;
  }
  for (const name of RETIRED_AGENTS.filter((agent) => !live.has(agent))) {
    const rel = `${toRepoRel(MEMORY_PARTS)}/${name}`;
    const absPath = path.join(repoRoot, ...MEMORY_PARTS, name);
    if (!fs.existsSync(absPath)) {
      report.missing.push(rel);
      continue;
    }
    fs.rmSync(absPath, { recursive: true, force: true });
    report.deleted.push(rel);
  }
}

function replaceFileAtomically(filePath, text) {
  const tempPath = `${filePath}.asd-migration.tmp`;
  fs.writeFileSync(tempPath, text, { encoding: 'utf8' });
  fs.renameSync(tempPath, filePath);
}

function rewriteInstallCommand(repoRoot, report) {
  const absPath = path.join(repoRoot, ...COMMANDS_PARTS);
  const rel = toRepoRel(COMMANDS_PARTS);
  if (!fs.existsSync(absPath)) {
    report.missing.push(rel);
    return;
  }
  const raw = fs.readFileSync(absPath, 'utf8');
  const next = raw.replace(OLD_INSTALL_VALUE, (_, key, quote) => `${key}${quote}${NEW_INSTALL_VALUE}${quote}`);
  if (next === raw) {
    report.unchanged.push(rel);
    return;
  }
  replaceFileAtomically(absPath, next);
  report.rewritten.push(rel);
}

/** Removes retired agents' memory directories and makes the design.md install command manifest-free. */
module.exports = function migrate(ctx) {
  const repoRoot = ctx.repoRoot;
  const sync = require(path.join(repoRoot, '.asd', 'sync.js'));
  const warn = (m) => process.stdout.write(`asd-migration 14.5.0: warning: ${m}\n`);
  const report = { deleted: [], missing: [], rewritten: [], unchanged: [] };

  removeRetiredMemory(repoRoot, sync, report, warn);
  rewriteInstallCommand(repoRoot, report);
  return report;
};
