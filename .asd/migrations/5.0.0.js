'use strict';

const fs = require('fs');
const path = require('path');

const RETIRED_TARGETS = [
  ['.claude', 'agents', 'asd-pm.md'],
  ['.codex', 'agents', 'asd-pm.toml'],
];

function removeIfEmpty(sync, directory) {
  if (typeof sync.removeIfEmptyDir === 'function') return sync.removeIfEmptyDir(directory);
  if (fs.existsSync(directory) && fs.readdirSync(directory).length === 0) fs.rmdirSync(directory);
}

function intactGeneratedView(sync, target) {
  if (sync.isSymlink(target)) return false;
  const text = sync.readNormalized(target);
  const lines = text.split('\n');
  const markerIndex = lines[0] === '---' ? 1 : 0;
  const marker = sync.parseFullFileMarker(lines[markerIndex] || '');
  if (!marker) return false;
  const body = markerIndex === 1 ? [lines[0]].concat(lines.slice(2)).join('\n') : lines.slice(1).join('\n');
  return sync.sha256Hex(body) === marker.contentDigest;
}

module.exports = function migrate(ctx) {
  const sync = require(path.join(ctx.repoRoot, '.asd', 'sync.js'));
  const report = { deleted: [], missing: [], skippedUnmarked: [], skippedModified: [] };
  for (const parts of RETIRED_TARGETS) {
    const target = path.join(ctx.repoRoot, ...parts);
    const rel = path.relative(ctx.repoRoot, target).replace(/\\/g, '/');
    if (!fs.existsSync(target)) { report.missing.push(rel); continue; }
    if (!sync.hasOwnershipMarker(target)) { report.skippedUnmarked.push(rel); continue; }
    if (!intactGeneratedView(sync, target)) { report.skippedModified.push(rel); continue; }
    fs.rmSync(target, { force: true });
    removeIfEmpty(sync, path.dirname(target));
    report.deleted.push(rel);
  }
  return report;
};
