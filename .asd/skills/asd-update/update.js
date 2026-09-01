#!/usr/bin/env node
/*
 * ASD framework updater - per-file state machine (replaces the old wholesale
 * delete+copy driver). See plans/multi-provider-support.md, section
 * "update.js: пофайловая state machine" (SSoT for the contract below).
 *
 * Scope: syncs ONLY the canonical `.asd/` SSoT tree (rules, templates,
 * agents, skills, workflows, hooks, sync.js itself) from the upstream ASD
 * repo into a consumer checkout. It never touches `.claude/`, `.codex/`,
 * `.agents/` or the repo-root AGENTS.md/CLAUDE.md - those are generated
 * *from* canon by `.asd/sync.js`, so update.js hands off to
 * `sync.js --check` once it is done (see runSyncCheck / main()).
 *
 * Classification (delegated to `.asd/sync.js`'s classifyUpdateItem, the
 * Stage-0 pure decision function - this module is the fetch/hash/report/
 * apply driver wrapped around it):
 *   add | update | noop | delete | keep-local-modified | conflict |
 *   conflict-foreign | reject (unsafe path) | foreign (symlink target)
 *
 * Order of operations (plan is explicit about this): fetch the full new
 * file set -> classify EVERY managed path up front -> report ALL conflicts
 * and planned actions -> only THEN write. planUpdate() never touches disk
 * outside of reading; applyPlan() is the only function that writes, and it
 * is always called after the caller has had a chance to see the plan.
 *
 * No writes happen before every conflict is known, and conflicting /
 * foreign paths are never written regardless of mode.
 *
 * Manifest-schema decision: no new "last known upstream state" file was
 * invented. `.asd/release-manifest.json` already ships `canon_hashes` +
 * (empty-until-now) `upstream_hashes` placeholders. `upstream_hashes` is
 * repurposed here as update.js's own per-managed-path hash ledger: the
 * consumer's LOCAL release-manifest.json (before an update run) IS the
 * record of "what I was last updated to" - no third file needed. See the
 * updated $comment in release-manifest.json for the full rationale.
 *
 * Zero deps beyond Node core + `.asd/sync.js` (also zero-dep). Network
 * fetch (fetchUpstreamTarball) requires `tar` on PATH, same as the old
 * script; the plan/classify/apply core takes a plain `sourceRoot` directory
 * and has no network dependency, so it is fully unit-testable against two
 * local fixture directories (see tests/run.js).
 *
 * Manual invocation (consumer project root):
 *   node .asd/skills/asd-update/update.js [--dry-run]
 *   node .asd/skills/asd-update/update.js --force <relPath...>   (after review,
 *     overwrite specific reported conflicts the user has explicitly confirmed)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const { execFileSync } = require('child_process');

const sync = require(path.join(__dirname, '..', '..', 'sync.js'));

// `sync.js` is itself one of the managed_paths this very driver can
// overwrite (an "update" status like any other canonical file). Node's
// require() cache means the module-level `sync` above stays the OLD code for
// the rest of this process even after applyClassifications() writes a new
// `.asd/sync.js` to disk - so a post-apply `sync.runCheck()` call using it
// would silently run the PREVIOUS release's generator logic, missing
// exactly the kind of drift a generator bug fix was meant to catch. Bust the
// cache and re-require fresh from disk right before the post-apply check.
function loadFreshSync(repoRoot) {
  const syncPath = path.join(repoRoot, '.asd', 'sync.js');
  if (!fs.existsSync(syncPath)) {
    // No .asd/sync.js at the target repo at all (shouldn't happen in a real
    // checkout - it's always a managed file, but test fixtures may omit it).
    // Nothing to freshly load; degrade to the already-loaded module-level
    // sync rather than crashing over a missing convenience file.
    return sync;
  }
  // Does NOT catch here: a file that EXISTS but throws on require (syntax
  // error, broken top-level code) means the JUST-WRITTEN engine is broken -
  // that must surface as a loud failure, not be silently masked by falling
  // back to the OLD engine and reporting a false-green post-update check.
  delete require.cache[require.resolve(syncPath)];
  return require(syncPath);
}

const log = (m) => process.stdout.write(m + '\n');
const die = (m) => { process.stderr.write('asd-update: ' + m + '\n'); process.exitCode = 1; };

// ---------------------------------------------------------------------------
// Managed-path expansion: manifest entries may be a file or a directory
// (walked recursively). Every emitted relPath uses '/' separators regardless
// of host OS, so it matches consistently between the local root and the
// fetched-upstream root and can key the upstream_hashes ledger stably.
//
// posixJoin/walkDir/expandManagedPath/hashIfFile live in sync.js (this
// module already requires it, and sync.js's own release-manifest.json
// hash-ledger recompute needs them too - defining them there and aliasing
// here keeps one implementation instead of two, without sync.js requiring
// this module back).
// ---------------------------------------------------------------------------

const { posixJoin, walkDir, expandManagedPath, hashIfFile } = sync;

// Union of every real file under every managed_paths entry, expanded against
// BOTH roots (old local checkout, freshly fetched upstream) so paths that
// exist on only one side (add / delete) are still included. Unsafe entries
// in the manifest's own managed_paths list are collected separately and
// treated as fatal by the caller - a bad top-level entry is a bigger red
// flag than a single bad leaf file, so this fails the whole run before any
// fs access happens under it.
function buildFileUniverse(oldRoot, oldManifest, newRoot, newManifest) {
  const managedPaths = Array.from(new Set([
    ...(oldManifest.managed_paths || []),
    ...(newManifest.managed_paths || []),
  ]));
  const rejectedManagedPaths = [];
  const relSet = new Set();
  for (const mp of managedPaths) {
    if (!sync.isSafeRelPath(mp)) {
      rejectedManagedPaths.push(mp);
      continue;
    }
    for (const f of expandManagedPath(oldRoot, mp)) relSet.add(f);
    for (const f of expandManagedPath(newRoot, mp)) relSet.add(f);
  }
  return { relPaths: Array.from(relSet).sort(), rejectedManagedPaths };
}

// Case-collision guard: two manifest-derived paths differing only by case
// would silently alias on a case-insensitive filesystem (default on Windows
// and macOS). Fail closed before any write rather than let one clobber the
// other.
function checkCaseCollisions(relPaths) {
  const seen = new Map();
  for (const p of relPaths) {
    const lower = p.toLowerCase();
    const prior = seen.get(lower);
    if (prior !== undefined && prior !== p) {
      throw new Error(`case-collision between managed paths "${prior}" and "${p}" - refusing to run`);
    }
    seen.set(lower, p);
  }
}

// ---------------------------------------------------------------------------
// Classification: hash local + upstream, look up the old recorded hash,
// delegate the actual decision to sync.js's classifyUpdateItem.
// ---------------------------------------------------------------------------

function classifyAll(repoRoot, sourceRoot, oldManifest, newManifest, relPaths) {
  const oldHashes = oldManifest.upstream_hashes || {};
  return relPaths.map((relPath) => {
    const localAbs = path.join(repoRoot, relPath);
    const upstreamAbs = path.join(sourceRoot, relPath);
    if (!sync.isSafeRelPath(relPath)) {
      return { relPath, status: 'reject', localAbs, upstreamAbs };
    }
    const existsLocally = fs.existsSync(localAbs);
    const upstreamExists = fs.existsSync(upstreamAbs);
    const localHash = hashIfFile(localAbs);
    const newUpstreamHash = hashIfFile(upstreamAbs);
    const oldReleaseHash = Object.prototype.hasOwnProperty.call(oldHashes, relPath) ? oldHashes[relPath] : null;
    const status = sync.classifyUpdateItem({
      relPath,
      existsLocally,
      localHash,
      oldReleaseHash,
      newUpstreamHash,
      upstreamExists,
      targetPathForSymlinkCheck: localAbs,
    });
    return { relPath, status, localAbs, upstreamAbs, localHash, newUpstreamHash, oldReleaseHash };
  });
}

const WRITE_STATUSES = new Set(['add', 'update', 'delete']);
const NEEDS_ATTENTION = new Set(['conflict', 'conflict-foreign', 'keep-local-modified', 'foreign', 'reject']);

function summarize(classifications) {
  const byStatus = {};
  for (const item of classifications) {
    (byStatus[item.status] = byStatus[item.status] || []).push(item.relPath);
  }
  return {
    byStatus,
    plannedWrites: classifications.filter((c) => WRITE_STATUSES.has(c.status)).length,
    needsAttention: classifications.filter((c) => NEEDS_ATTENTION.has(c.status)).map((c) => ({ relPath: c.relPath, status: c.status })),
  };
}

// ---------------------------------------------------------------------------
// Plan: classify-only, zero writes. Callers MUST show this in full (per the
// plan's ordering requirement) before ever calling applyPlan.
// ---------------------------------------------------------------------------

function planUpdate(repoRoot, sourceRoot) {
  const oldManifest = sync.loadReleaseManifest(repoRoot); // fail-closed on unknown schema_version
  const newManifest = sync.loadReleaseManifest(sourceRoot); // same fail-closed check on fetched upstream
  const { relPaths, rejectedManagedPaths } = buildFileUniverse(repoRoot, oldManifest, sourceRoot, newManifest);
  if (rejectedManagedPaths.length > 0) {
    throw new Error('unsafe managed_paths entries in manifest, aborting before any writes: ' + rejectedManagedPaths.join(', '));
  }
  checkCaseCollisions(relPaths);
  const classifications = classifyAll(repoRoot, sourceRoot, oldManifest, newManifest, relPaths);
  return {
    oldManifest,
    newManifest,
    oldVersion: oldManifest.asd_version,
    newVersion: newManifest.asd_version,
    classifications,
    report: summarize(classifications),
  };
}

// ---------------------------------------------------------------------------
// Apply: writes only add/update/delete. Everything else (conflict*,
// keep-local-modified, foreign, reject) is left untouched, always.
// ---------------------------------------------------------------------------

// `forceRelPaths` is the set of relPaths the USER has explicitly confirmed
// overwriting (plan: "отличается -> conflict, не трогать без явного
// подтверждения" - the second half of that sentence requires a path that
// actually honors a confirmed "yes, overwrite"; add/update/delete are always
// applied because they were never conflicts to begin with).
function applyClassifications(classifications, forceRelPaths) {
  const forceSet = forceRelPaths instanceof Set ? forceRelPaths : new Set(forceRelPaths || []);
  const applied = [];
  for (const item of classifications) {
    const forced = (item.status === 'conflict' || item.status === 'conflict-foreign') && forceSet.has(item.relPath);
    if (item.status === 'add' || item.status === 'update' || forced) {
      const content = sync.readNormalized(item.upstreamAbs);
      sync.writeNormalized(item.localAbs, content);
      applied.push({ relPath: item.relPath, action: forced ? `${item.status}-forced` : item.status });
    } else if (item.status === 'delete') {
      fs.rmSync(item.localAbs, { force: true });
      applied.push({ relPath: item.relPath, action: 'delete' });
    }
  }
  return applied;
}

// Rebuilds the upstream_hashes ledger for the NEXT run: written paths (incl.
// forced conflicts) get the hash we just wrote; deleted paths are dropped;
// everything left untouched (unresolved conflict*/keep-local-modified/
// foreign/reject) keeps its OLD recorded hash, so it keeps surfacing as
// needing attention until a human resolves it.
function buildNextUpstreamHashes(oldManifest, classifications, forceRelPaths) {
  const forceSet = forceRelPaths instanceof Set ? forceRelPaths : new Set(forceRelPaths || []);
  const next = Object.assign({}, oldManifest.upstream_hashes || {});
  for (const item of classifications) {
    const forced = (item.status === 'conflict' || item.status === 'conflict-foreign') && forceSet.has(item.relPath);
    if (item.status === 'add' || item.status === 'update' || item.status === 'noop' || forced) {
      if (item.newUpstreamHash) next[item.relPath] = item.newUpstreamHash;
      else delete next[item.relPath];
    } else if (item.status === 'delete') {
      delete next[item.relPath];
    }
    // Unresolved conflict / conflict-foreign / keep-local-modified / foreign / reject: leave as-is.
  }
  return next;
}

function writeUpdatedManifest(repoRoot, newManifest, nextUpstreamHashes) {
  const merged = Object.assign({}, newManifest, { upstream_hashes: nextUpstreamHashes });
  const p = path.join(repoRoot, '.asd', 'release-manifest.json');
  sync.writeNormalized(p, JSON.stringify(merged, null, 2) + '\n');
}

// Applies a plan from planUpdate(). No-op (report only) when dryRun.
// `options.force`: relPaths (array or Set) whose 'conflict'/'conflict-foreign'
// classification the user has explicitly confirmed overwriting - the other
// half of "never touch a conflict WITHOUT explicit confirmation". Runs
// `sync.js --check` after a real apply (plan: canon changed upstream means
// provider-views are now stale and need a subsequent `sync.js --apply`,
// which this function deliberately does NOT do automatically).
function applyPlan(repoRoot, plan, options) {
  const dryRun = !!(options && options.dryRun);
  const force = (options && options.force) || [];
  if (dryRun) return { dryRun: true, applied: [], syncCheck: null };
  const applied = applyClassifications(plan.classifications, force);
  const nextHashes = buildNextUpstreamHashes(plan.oldManifest, plan.classifications, force);
  writeUpdatedManifest(repoRoot, plan.newManifest, nextHashes);
  const syncCheck = loadFreshSync(repoRoot).runCheck(repoRoot);
  return { dryRun: false, applied, syncCheck };
}

// ---------------------------------------------------------------------------
// Network fetch (real upstream tarball). Not exercised by tests/run.js -
// tests point planUpdate/applyPlan at a second local fixture directory
// standing in for "upstream" instead.
// ---------------------------------------------------------------------------

function parseRepo(url) {
  const m = String(url).replace(/\.git$/, '').match(/github\.com[/:]([^/]+)\/([^/]+)/);
  if (!m) throw new Error(`cannot parse owner/repo from repo URL: ${url}`);
  return { owner: m[1], name: m[2] };
}

function get(url, cb) {
  https.get(url, { headers: { 'User-Agent': 'asd-update' } }, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      res.resume();
      return get(res.headers.location, cb);
    }
    cb(res);
  }).on('error', (e) => { throw new Error(`network error: ${e.message}`); });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
      const f = fs.createWriteStream(dest);
      res.pipe(f);
      f.on('finish', () => f.close(() => resolve()));
      f.on('error', reject);
    });
  });
}

function checkTar() {
  try {
    execFileSync('tar', ['--version'], { stdio: 'ignore' });
  } catch {
    throw new Error('`tar` not found on PATH. Install tar (bundled with Win10 1803+, macOS, Linux) and retry.');
  }
}

// Fetches + extracts the upstream tarball named by manifest.repo/branch and
// returns the extracted source root (the directory containing its own
// `.asd/`). Caller is responsible for cleanup (cleanupFetch()).
async function fetchUpstreamTarball(manifest) {
  checkTar();
  const { owner, name } = parseRepo(manifest.repo);
  const branch = manifest.branch || 'main';
  const tarUrl = `https://codeload.github.com/${owner}/${name}/tar.gz/refs/heads/${branch}`;

  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'asd-update-'));
  const exdir = path.join(work, 'x');
  fs.mkdirSync(exdir);

  await download(tarUrl, path.join(work, 'src.tar.gz'));
  execFileSync('tar', ['-xzf', 'src.tar.gz', '-C', 'x'], { cwd: work });

  const top = fs.readdirSync(exdir).filter((d) => fs.statSync(path.join(exdir, d)).isDirectory());
  if (top.length !== 1) throw new Error(`unexpected tarball layout (${top.length} top dirs)`);
  return { sourceRoot: path.join(exdir, top[0]), workDir: work };
}

function cleanupFetch(workDir) {
  try { fs.rmSync(workDir, { recursive: true, force: true }); } catch { /* best effort */ }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function printPlan(plan) {
  log(`ASD framework: ${plan.oldVersion || '?'} -> ${plan.newVersion || '?'}`);
  log(`Planned writes: ${plan.report.plannedWrites}`);
  for (const status of Object.keys(plan.report.byStatus)) {
    if (status === 'noop') continue;
    log(`  ${status}: ${plan.report.byStatus[status].length}`);
    for (const relPath of plan.report.byStatus[status]) log(`    - ${relPath}`);
  }
  if (plan.report.needsAttention.length > 0) {
    log('\nNeeds manual attention (left untouched):');
    for (const item of plan.report.needsAttention) log(`  ${item.status}: ${item.relPath}`);
  }
}

// `--force <relPath...>`: every remaining arg after the flag is a relPath the
// user has explicitly confirmed overwriting despite its conflict status.
function parseForceArgs(argv) {
  const idx = argv.indexOf('--force');
  if (idx === -1) return [];
  return argv.slice(idx + 1).filter((a) => a !== '--dry-run');
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const force = parseForceArgs(process.argv);
  const repoRoot = sync.findRepoRoot(process.cwd());
  const oldManifestForFetch = sync.loadReleaseManifest(repoRoot);

  let fetched;
  try {
    fetched = await fetchUpstreamTarball(oldManifestForFetch);
  } catch (e) {
    die(e.message);
    return;
  }

  try {
    const plan = planUpdate(repoRoot, fetched.sourceRoot);
    printPlan(plan);
    if (plan.report.plannedWrites === 0 && plan.report.needsAttention.length === 0) {
      log('\nAlready up to date.');
      return;
    }
    if (dryRun) {
      log('\n[dry-run] no files written.');
      return;
    }
    const result = applyPlan(repoRoot, plan, { dryRun: false, force });
    log(`\nApplied ${result.applied.length} change(s).`);
    const stale = (result.syncCheck || []).filter((i) => i.status === 'stale' || i.status === 'missing');
    if (stale.length > 0) {
      log(`\nCanon changed: ${stale.length} provider-view file(s) are now stale/missing. Run \`node .asd/sync.js --apply <file...>\` to regenerate them:`);
      for (const s of stale) log(`  - ${s.target} (${s.status})`);
    } else {
      log('\nProvider views already current (sync.js --check is clean).');
    }
  } catch (e) {
    die(e.message);
  } finally {
    cleanupFetch(fetched.workDir);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  expandManagedPath,
  buildFileUniverse,
  checkCaseCollisions,
  classifyAll,
  summarize,
  planUpdate,
  applyPlan,
  buildNextUpstreamHashes,
  fetchUpstreamTarball,
  cleanupFetch,
};
