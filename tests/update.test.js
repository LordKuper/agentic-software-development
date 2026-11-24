'use strict';

// update.js state machine, driver and migration runner; release-manifest integrity

const { assert, fs, path, execFileSync, spawnSync, sync, update, REPO_ROOT, test, mkTempDir, loadManifest, writeFile, canonText, headingBody, jsonOf, sectionOf, stepOf } = require('./lib.js');

test('sprint-040 AC-2: only real update completion offers missing settings through installed asd-init', () => {
  const skill = '.asd/skills/asd-update/SKILL.md';
  const steps = sectionOf(skill, 'Steps');
  assert.doesNotMatch(canonText('.asd/skills/asd-sprint/SKILL.md'), /\bconfig-check\b/);
  const completion = stepOf(steps, '5');
  assert.match(stepOf(steps, '2'), /--dry-run/);
  assert.match(stepOf(steps, '3'), /run pending migrations/);
  assert.match(completion, /final real attempt in either mode[^\n]*`Applied <N> change\(s\)\.`[^\n]*`Already up to date\.`/);
  assert.match(completion, /partial updates with a failed migration or declined conflict/);
  assert.match(completion, /Preview, version lookup and failures before either result do not qualify/);
  assert.match(completion, /node \.asd\/runtime\.js config-check[^\n]*installed template/);
  assert.match(completion, /`missing`, `duplicates`, and `invalid` by dotted path/);
  assert.match(completion, /\bIf keys are missing,[^\n]*`Run asd-init for missing settings` \| `Leave settings`[^\n]*On opt-in[^\n]*"Update completion"/);
  assert.match(headingBody(skill, 'Sprint-mediated mode'), /Run steps 2–7[^\n]*missing settings/);
  assert.match(sectionOf(skill, 'Reference'), /--check-version` is read-only/);
  assert.deepStrictEqual(jsonOf(skill, 'Delegates').skills, ['asd-sync', 'asd-init']);
  const adoption = headingBody('.asd/skills/asd-init/SKILL.md', 'Update completion');
  assert.match(adoption, /`accept-all` \| `edit-missing-values` \| `abort`/);
  const write = stepOf(adoption, '3');
  assert.match(write, /\bacceptance\b/i);
  assert.match(write, /\bexactly\b[^\n]*\bapproved missing leaves\b/i);
});

test('update state machine: upstream unchanged / local untouched -> noop', () => {
  const h = 'h1';
  assert.strictEqual(
    sync.classifyUpdateItem({ relPath: 'a.md', existsLocally: true, localHash: h, oldReleaseHash: h, newUpstreamHash: h, upstreamExists: true }),
    'noop'
  );
});

test('update state machine: new upstream file, not present locally -> add', () => {
  assert.strictEqual(
    sync.classifyUpdateItem({ relPath: 'a.md', existsLocally: false, localHash: null, oldReleaseHash: null, newUpstreamHash: 'h2', upstreamExists: true }),
    'add'
  );
});

test('update state machine: local unchanged since last release, upstream changed -> update', () => {
  assert.strictEqual(
    sync.classifyUpdateItem({ relPath: 'a.md', existsLocally: true, localHash: 'h1', oldReleaseHash: 'h1', newUpstreamHash: 'h2', upstreamExists: true }),
    'update'
  );
});

test('update state machine: local changed vs old release hash -> conflict (must not silently overwrite)', () => {
  const status = sync.classifyUpdateItem({
    relPath: 'a.md',
    existsLocally: true,
    localHash: 'h-local-edit',
    oldReleaseHash: 'h1',
    newUpstreamHash: 'h2',
    upstreamExists: true,
  });
  assert.strictEqual(status, 'conflict');
});

test('update state machine: new upstream path lands on pre-existing untracked local file -> conflict-foreign', () => {
  assert.strictEqual(
    sync.classifyUpdateItem({ relPath: 'a.md', existsLocally: true, localHash: 'h-foreign', oldReleaseHash: null, newUpstreamHash: 'h2', upstreamExists: true }),
    'conflict-foreign'
  );
});

test('update state machine: upstream removed the file, local matches old release -> delete', () => {
  assert.strictEqual(
    sync.classifyUpdateItem({ relPath: 'a.md', existsLocally: true, localHash: 'h1', oldReleaseHash: 'h1', newUpstreamHash: null, upstreamExists: false }),
    'delete'
  );
});

test('update state machine: upstream removed the file, local diverged -> keep-local-modified', () => {
  assert.strictEqual(
    sync.classifyUpdateItem({
      relPath: 'a.md',
      existsLocally: true,
      localHash: 'h-local-edit',
      oldReleaseHash: 'h1',
      newUpstreamHash: null,
      upstreamExists: false,
    }),
    'keep-local-modified'
  );
});

test('update state machine: unsafe manifest path is rejected regardless of hashes', () => {
  assert.strictEqual(
    sync.classifyUpdateItem({ relPath: '../escape.md', existsLocally: false, localHash: null, oldReleaseHash: null, newUpstreamHash: 'h2', upstreamExists: true }),
    'reject'
  );
  assert.strictEqual(
    sync.classifyUpdateItem({ relPath: 'C:\\escape.md', existsLocally: false, localHash: null, oldReleaseHash: null, newUpstreamHash: 'h2', upstreamExists: true }),
    'reject'
  );
});

function writeManifest(root, overrides) {
  const manifest = Object.assign(
    {
      schema_version: 1,
      asd_version: '1.0.0',
      managed_paths: ['.asd/rules', '.asd/sync.js'],
      model_families: { claude: {}, codex: {} },
      canon_hashes: {},
      upstream_hashes: {},
    },
    overrides
  );
  writeFile(root, '.asd/release-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

function hashOf(text) {
  return sync.sha256Hex(sync.normalizeText(text));
}

test('sprint-040 AC-1 and AC-2: update CLI retries a pending migration with zero managed writes', () => {
  const localRoot = mkTempDir();
  const releaseRoot = mkTempDir();
  const upstreamRoot = path.join(releaseRoot, 'upstream');
  const config = '.asd/project/config.yaml';
  const manifest = '.asd/release-manifest.json';
  const migration = '.asd/migrations/14.12.0.js';
  const oldVersion = '14.11.0';
  const targetVersion = '14.12.0';
  const metadata = { repo: 'https://github.com/fixture/upstream', managed_paths: [migration] };
  const input = 'project:\n  claude_design: disabled\n';
  const invalid = input.replace('disabled', 'unknown');
  const readLocal = (relative) => fs.readFileSync(path.join(localRoot, relative), 'utf8');
  const archive = path.join(releaseRoot, 'upstream.tar.gz');
  const preload = path.join(releaseRoot, 'local-download.js');
  const cli = path.join(REPO_ROOT, '.asd/skills/asd-update/update.js');

  writeManifest(localRoot, { ...metadata, asd_version: oldVersion });
  writeManifest(upstreamRoot, { ...metadata, asd_version: targetVersion });
  writeFile(localRoot, config, invalid);
  for (const relative of ['.asd/runtime.js', '.asd/sync.js']) writeFile(localRoot, relative, canonText(relative));
  writeFile(upstreamRoot, migration, canonText(migration));
  execFileSync('tar', ['-czf', archive, 'upstream'], { cwd: releaseRoot });
  writeFile(releaseRoot, 'local-download.js', `
require('node:https').get = (_url, _options, receive) => {
  const response = require('node:fs').createReadStream(${JSON.stringify(archive)});
  response.statusCode = 200;
  queueMicrotask(() => receive(response));
  return response;
};
`);
  const run = (...args) => spawnSync(process.execPath, ['--require', preload, cli, ...args], {
    cwd: localRoot, encoding: 'utf8', timeout: 10_000,
  });

  const failed = run();
  assert.strictEqual(failed.status, 1, failed.stderr);
  assert.match(failed.stderr, /migration 14\.12\.0 failed/);
  assert.strictEqual(readLocal(config), invalid);
  assert.strictEqual(JSON.parse(readLocal(manifest)).asd_version, oldVersion);
  assert.strictEqual(readLocal(migration), canonText(migration));

  writeFile(localRoot, config, input);
  const before = readLocal(manifest);
  const preview = run('--dry-run');
  assert.strictEqual(preview.status, 0, preview.stderr);
  assert.match(preview.stdout, /^Planned writes: 0$/m);
  assert.match(preview.stdout, /^Migrations that will run: 14\.12\.0$/m);
  assert.strictEqual(readLocal(manifest), before);
  assert.strictEqual(readLocal(config), input);

  const retried = run();
  assert.strictEqual(retried.status, 0, retried.stderr);
  assert.match(retried.stdout, /^Applied 0 change\(s\)\.$/m);
  assert.strictEqual(readLocal(config), 'project:\n  mockup_format: html\n');
  assert.strictEqual(JSON.parse(readLocal(manifest)).asd_version, targetVersion);
  assert.match(preview.stdout, /^\[dry-run\] no files written\.$/m);
});

test('update driver: new upstream file with nothing local -> add, written on apply', async () => {
  const localRoot = mkTempDir();
  const upstreamRoot = mkTempDir();
  writeManifest(localRoot, {});
  writeManifest(upstreamRoot, {});
  writeFile(upstreamRoot, '.asd/rules/new-rule.md', 'hello upstream\n');

  const plan = update.planUpdate(localRoot, upstreamRoot);
  const item = plan.classifications.find((c) => c.relPath === '.asd/rules/new-rule.md');
  assert.strictEqual(item.status, 'add');
  assert.strictEqual(fs.existsSync(path.join(localRoot, '.asd/rules/new-rule.md')), false, 'planUpdate must not write anything');

  const result = await update.applyPlan(localRoot, plan, { dryRun: false });
  assert.strictEqual(result.applied.some((a) => a.relPath === '.asd/rules/new-rule.md' && a.action === 'add'), true);
  assert.strictEqual(fs.readFileSync(path.join(localRoot, '.asd/rules/new-rule.md'), 'utf8'), 'hello upstream\n');

  const newManifest = JSON.parse(fs.readFileSync(path.join(localRoot, '.asd/release-manifest.json'), 'utf8'));
  assert.strictEqual(newManifest.upstream_hashes['.asd/rules/new-rule.md'], hashOf('hello upstream\n'));
});

test('update driver: local unchanged since last release, upstream changed -> update overwrites', async () => {
  const localRoot = mkTempDir();
  const upstreamRoot = mkTempDir();
  const oldContent = 'v1\n';
  const newContent = 'v2\n';
  writeFile(localRoot, '.asd/rules/a.md', oldContent);
  writeFile(upstreamRoot, '.asd/rules/a.md', newContent);
  writeManifest(localRoot, { upstream_hashes: { '.asd/rules/a.md': hashOf(oldContent) } });
  writeManifest(upstreamRoot, {});

  const plan = update.planUpdate(localRoot, upstreamRoot);
  const item = plan.classifications.find((c) => c.relPath === '.asd/rules/a.md');
  assert.strictEqual(item.status, 'update');

  await update.applyPlan(localRoot, plan, { dryRun: false });
  assert.strictEqual(fs.readFileSync(path.join(localRoot, '.asd/rules/a.md'), 'utf8'), newContent);
});

test('update driver: local hand-edited vs old release hash -> conflict, never overwritten', async () => {
  const localRoot = mkTempDir();
  const upstreamRoot = mkTempDir();
  const oldContent = 'v1\n';
  const localEdit = 'v1 but a human changed it\n';
  const upstreamNew = 'v2\n';
  writeFile(localRoot, '.asd/rules/a.md', localEdit);
  writeFile(upstreamRoot, '.asd/rules/a.md', upstreamNew);
  writeManifest(localRoot, { upstream_hashes: { '.asd/rules/a.md': hashOf(oldContent) } });
  writeManifest(upstreamRoot, {});

  const plan = update.planUpdate(localRoot, upstreamRoot);
  const item = plan.classifications.find((c) => c.relPath === '.asd/rules/a.md');
  assert.strictEqual(item.status, 'conflict');
  assert.ok(plan.report.needsAttention.some((n) => n.relPath === '.asd/rules/a.md' && n.status === 'conflict'));

  const result = await update.applyPlan(localRoot, plan, { dryRun: false });
  assert.strictEqual(result.applied.some((a) => a.relPath === '.asd/rules/a.md'), false, 'conflicted file must not be applied');
  assert.strictEqual(fs.readFileSync(path.join(localRoot, '.asd/rules/a.md'), 'utf8'), localEdit, 'local edit must survive untouched');

  const newManifest = JSON.parse(fs.readFileSync(path.join(localRoot, '.asd/release-manifest.json'), 'utf8'));
  assert.strictEqual(newManifest.upstream_hashes['.asd/rules/a.md'], hashOf(oldContent), 'ledger keeps the OLD hash for an unresolved conflict');
});

test('update driver: --force overwrites a conflict only when the caller explicitly names it', async () => {
  const localRoot = mkTempDir();
  const upstreamRoot = mkTempDir();
  const oldContent = 'v1\n';
  const localEdit = 'v1 but a human changed it\n';
  const upstreamNew = 'v2\n';
  writeFile(localRoot, '.asd/rules/a.md', localEdit);
  writeFile(upstreamRoot, '.asd/rules/a.md', upstreamNew);
  writeManifest(localRoot, { upstream_hashes: { '.asd/rules/a.md': hashOf(oldContent) } });
  writeManifest(upstreamRoot, {});

  const plan = update.planUpdate(localRoot, upstreamRoot);
  assert.strictEqual(plan.classifications.find((c) => c.relPath === '.asd/rules/a.md').status, 'conflict');

  const result = await update.applyPlan(localRoot, plan, { dryRun: false, force: ['.asd/rules/a.md'] });
  assert.strictEqual(result.applied.some((a) => a.relPath === '.asd/rules/a.md' && a.action === 'conflict-forced'), true);
  assert.strictEqual(fs.readFileSync(path.join(localRoot, '.asd/rules/a.md'), 'utf8'), upstreamNew, 'forced conflict is overwritten with upstream content');

  const newManifest = JSON.parse(fs.readFileSync(path.join(localRoot, '.asd/release-manifest.json'), 'utf8'));
  assert.strictEqual(newManifest.upstream_hashes['.asd/rules/a.md'], hashOf(upstreamNew), 'ledger advances to the new hash once forced through');
});

test('update driver: new upstream path lands on a pre-existing untracked local file -> conflict-foreign', async () => {
  const localRoot = mkTempDir();
  const upstreamRoot = mkTempDir();
  writeFile(localRoot, '.asd/rules/foreign.md', 'a human wrote this, never tracked\n');
  writeFile(upstreamRoot, '.asd/rules/foreign.md', 'upstream content\n');
  writeManifest(localRoot, {}); // no upstream_hashes entry for this path
  writeManifest(upstreamRoot, {});

  const plan = update.planUpdate(localRoot, upstreamRoot);
  const item = plan.classifications.find((c) => c.relPath === '.asd/rules/foreign.md');
  assert.strictEqual(item.status, 'conflict-foreign');

  await update.applyPlan(localRoot, plan, { dryRun: false });
  assert.strictEqual(fs.readFileSync(path.join(localRoot, '.asd/rules/foreign.md'), 'utf8'), 'a human wrote this, never tracked\n');
});

test('update driver: upstream removed the file, local untouched -> deleted on apply', async () => {
  const localRoot = mkTempDir();
  const upstreamRoot = mkTempDir();
  const content = 'to be removed upstream\n';
  writeFile(localRoot, '.asd/rules/gone.md', content);
  writeManifest(localRoot, { upstream_hashes: { '.asd/rules/gone.md': hashOf(content) } });
  writeManifest(upstreamRoot, {}); // file absent upstream

  const plan = update.planUpdate(localRoot, upstreamRoot);
  const item = plan.classifications.find((c) => c.relPath === '.asd/rules/gone.md');
  assert.strictEqual(item.status, 'delete');

  const result = await update.applyPlan(localRoot, plan, { dryRun: false });
  assert.strictEqual(result.applied.some((a) => a.relPath === '.asd/rules/gone.md' && a.action === 'delete'), true);
  assert.strictEqual(fs.existsSync(path.join(localRoot, '.asd/rules/gone.md')), false);
});

test('update driver: upstream removed the file, local diverged -> kept + reported, nothing deleted', async () => {
  const localRoot = mkTempDir();
  const upstreamRoot = mkTempDir();
  const oldContent = 'v1\n';
  const localEdit = 'v1 with local notes\n';
  writeFile(localRoot, '.asd/rules/gone.md', localEdit);
  writeManifest(localRoot, { upstream_hashes: { '.asd/rules/gone.md': hashOf(oldContent) } });
  writeManifest(upstreamRoot, {});

  const plan = update.planUpdate(localRoot, upstreamRoot);
  const item = plan.classifications.find((c) => c.relPath === '.asd/rules/gone.md');
  assert.strictEqual(item.status, 'keep-local-modified');

  await update.applyPlan(localRoot, plan, { dryRun: false });
  assert.strictEqual(fs.readFileSync(path.join(localRoot, '.asd/rules/gone.md'), 'utf8'), localEdit);
});

test('update driver: --dry-run mode reports the full plan but writes nothing at all', async () => {
  const localRoot = mkTempDir();
  const upstreamRoot = mkTempDir();
  writeFile(localRoot, '.asd/rules/a.md', 'v1\n');
  writeFile(upstreamRoot, '.asd/rules/a.md', 'v2\n');
  writeFile(upstreamRoot, '.asd/rules/b.md', 'new file\n');
  writeManifest(localRoot, { upstream_hashes: { '.asd/rules/a.md': hashOf('v1\n') } });
  writeManifest(upstreamRoot, {});

  const before = fs.readFileSync(path.join(localRoot, '.asd/release-manifest.json'), 'utf8');
  const plan = update.planUpdate(localRoot, upstreamRoot);
  assert.strictEqual(plan.report.plannedWrites, 2);

  const result = await update.applyPlan(localRoot, plan, { dryRun: true });
  assert.strictEqual(result.dryRun, true);
  assert.strictEqual(result.applied.length, 0);
  assert.strictEqual(fs.readFileSync(path.join(localRoot, '.asd/rules/a.md'), 'utf8'), 'v1\n', 'dry-run must not touch existing files');
  assert.strictEqual(fs.existsSync(path.join(localRoot, '.asd/rules/b.md')), false, 'dry-run must not create new files');
  assert.strictEqual(fs.readFileSync(path.join(localRoot, '.asd/release-manifest.json'), 'utf8'), before, 'dry-run must not rewrite the manifest');
});

test('update driver: order of operations - every conflict is knowable from the plan before any write occurs', async () => {
  const localRoot = mkTempDir();
  const upstreamRoot = mkTempDir();
  writeFile(localRoot, '.asd/rules/conflict.md', 'human edit\n');
  writeFile(upstreamRoot, '.asd/rules/conflict.md', 'upstream v2\n');
  writeFile(upstreamRoot, '.asd/rules/add.md', 'brand new\n');
  writeManifest(localRoot, { upstream_hashes: { '.asd/rules/conflict.md': hashOf('human edit\n baseline') } });
  writeManifest(upstreamRoot, {});

  // planUpdate alone must fully classify (add + conflict both visible) with zero writes.
  const plan = update.planUpdate(localRoot, upstreamRoot);
  const statuses = plan.classifications.reduce((m, c) => { m[c.relPath] = c.status; return m; }, {});
  assert.strictEqual(statuses['.asd/rules/add.md'], 'add');
  assert.strictEqual(statuses['.asd/rules/conflict.md'], 'conflict');
  assert.strictEqual(fs.existsSync(path.join(localRoot, '.asd/rules/add.md')), false);

  await update.applyPlan(localRoot, plan, { dryRun: false });
  assert.strictEqual(fs.readFileSync(path.join(localRoot, '.asd/rules/add.md'), 'utf8'), 'brand new\n');
  assert.strictEqual(fs.readFileSync(path.join(localRoot, '.asd/rules/conflict.md'), 'utf8'), 'human edit\n', 'conflict left untouched even though add in the same run succeeded');
});

test('update driver: unsafe managed_paths entry aborts the whole run before any write', () => {
  const localRoot = mkTempDir();
  const upstreamRoot = mkTempDir();
  writeFile(upstreamRoot, '.asd/rules/x.md', 'x\n');
  writeManifest(localRoot, { managed_paths: ['../escape'] });
  writeManifest(upstreamRoot, { managed_paths: ['../escape'] });

  assert.throws(() => update.planUpdate(localRoot, upstreamRoot), /unsafe managed_paths/);
});

test('update driver: case-collision between managed paths is rejected fail-closed', () => {
  assert.throws(
    () => update.checkCaseCollisions(['.asd/rules/Foo.md', '.asd/rules/foo.md']),
    /case-collision/
  );
  assert.doesNotThrow(() => update.checkCaseCollisions(['.asd/rules/foo.md', '.asd/rules/bar.md']));
});

test('update driver: symlinked local target is treated as foreign, never overwritten', async () => {
  const localRoot = mkTempDir();
  const upstreamRoot = mkTempDir();
  const realFile = path.join(localRoot, 'real.md');
  fs.writeFileSync(realFile, 'irrelevant', 'utf8');
  const linkPath = path.join(localRoot, '.asd', 'rules', 'linked.md');
  fs.mkdirSync(path.dirname(linkPath), { recursive: true });
  let symlinkSupported = true;
  try {
    fs.symlinkSync(realFile, linkPath, 'file');
  } catch (_) {
    symlinkSupported = false;
  }
  writeManifest(localRoot, {});
  writeFile(upstreamRoot, '.asd/rules/linked.md', 'upstream would like to write here\n');
  writeManifest(upstreamRoot, {});

  if (!symlinkSupported) {
    console.log('  (skipped: fs.symlinkSync unsupported in this environment)');
    return;
  }
  const plan = update.planUpdate(localRoot, upstreamRoot);
  const item = plan.classifications.find((c) => c.relPath === '.asd/rules/linked.md');
  assert.strictEqual(item.status, 'foreign');
  await update.applyPlan(localRoot, plan, { dryRun: false });
  assert.strictEqual(fs.readFileSync(linkPath, 'utf8'), 'irrelevant', 'symlink target must never be overwritten by update');
});

test('update driver: unknown schema_version in fetched upstream manifest fails closed, zero writes', () => {
  const localRoot = mkTempDir();
  const upstreamRoot = mkTempDir();
  writeManifest(localRoot, {});
  writeFile(upstreamRoot, '.asd/release-manifest.json', JSON.stringify({ schema_version: 999, asd_version: '9.9.9' }));
  writeFile(upstreamRoot, '.asd/rules/a.md', 'should never be read\n');

  assert.throws(() => update.planUpdate(localRoot, upstreamRoot), /schema_version 999.*not supported/);
});

test('update driver: sync.js --check runs automatically after a real apply', async () => {
  const localRoot = mkTempDir();
  const upstreamRoot = mkTempDir();
  fs.mkdirSync(path.join(localRoot, '.claude'), { recursive: true }); // repo-root marker consumed by sync.findRepoRoot elsewhere; not required by runCheck itself
  // A real .asd/sync.js must exist at localRoot for the post-apply check to
  // load fresh from disk (see loadFreshSync) - copy the actual engine.
  writeFile(localRoot, '.asd/sync.js', fs.readFileSync(path.join(REPO_ROOT, '.asd/sync.js'), 'utf8'));
  writeManifest(localRoot, {});
  writeManifest(upstreamRoot, {});
  writeFile(upstreamRoot, '.asd/rules/a.md', 'v1\n');

  const plan = update.planUpdate(localRoot, upstreamRoot);
  const result = await update.applyPlan(localRoot, plan, { dryRun: false });
  assert.ok(Array.isArray(result.syncCheck), 'applyPlan must run sync.js --check (runCheck) after a real apply and surface its report');
});

test('update driver: post-apply check loads the FRESHLY WRITTEN sync.js, never a stale require() cache', async () => {
  const localRoot = mkTempDir();
  const upstreamRoot = mkTempDir();

  // .asd/sync.js is itself a managed_paths entry that this same apply call
  // overwrites. If the post-apply check used update.js's own module-level
  // `sync` (require'd once, from THIS repo's real .asd/sync.js, at process
  // start) instead of re-reading from the target repoRoot, it would run the
  // wrong engine entirely - never even touching these fixture stubs.
  const oldSyncJs = "module.exports = { runCheck: () => 'OLD_ENGINE_RAN' };\n";
  const newSyncJs = "module.exports = { runCheck: () => 'NEW_ENGINE_RAN' };\n";
  writeFile(localRoot, '.asd/sync.js', oldSyncJs);
  writeFile(upstreamRoot, '.asd/sync.js', newSyncJs);
  writeManifest(localRoot, { upstream_hashes: { '.asd/sync.js': hashOf(oldSyncJs) } });
  writeManifest(upstreamRoot, {});

  const plan = update.planUpdate(localRoot, upstreamRoot);
  assert.strictEqual(plan.classifications.find((c) => c.relPath === '.asd/sync.js').status, 'update');

  const result = await update.applyPlan(localRoot, plan, { dryRun: false });
  assert.strictEqual(fs.readFileSync(path.join(localRoot, '.asd/sync.js'), 'utf8'), newSyncJs, 'sanity: the new engine was actually written');
  assert.strictEqual(result.syncCheck, 'NEW_ENGINE_RAN', 'post-apply check must reflect the JUST-WRITTEN engine, not a cached stale one');
});

test('update driver: a genuinely BROKEN freshly-written sync.js fails loud, never masked by the old engine', async () => {
  const localRoot = mkTempDir();
  const upstreamRoot = mkTempDir();

  const oldSyncJs = "module.exports = { runCheck: () => 'OLD_ENGINE_RAN' };\n";
  const brokenSyncJs = 'this is not valid javascript {{{';
  writeFile(localRoot, '.asd/sync.js', oldSyncJs);
  writeFile(upstreamRoot, '.asd/sync.js', brokenSyncJs);
  writeManifest(localRoot, { upstream_hashes: { '.asd/sync.js': hashOf(oldSyncJs) } });
  writeManifest(upstreamRoot, {});

  const plan = update.planUpdate(localRoot, upstreamRoot);
  // A broken engine must surface as a thrown error from applyPlan - never
  // silently fall back to running the OLD engine and reporting a false-green
  // syncCheck as if the update were fine.
  await assert.rejects(() => update.applyPlan(localRoot, plan, { dryRun: false }));
  assert.strictEqual(fs.readFileSync(path.join(localRoot, '.asd/sync.js'), 'utf8'), brokenSyncJs, 'the broken file was still written - that part of the update is honest; only the post-check must fail loud, not lie');
});

test('update driver: applyPlan writes the manifest at the LAST SUCCESSFUL migration version, never the unreached target, and names which migration failed', async () => {
  const localRoot = mkTempDir();
  const upstreamRoot = mkTempDir();
  writeManifest(localRoot, { asd_version: '5.0.0' });
  writeManifest(upstreamRoot, { asd_version: '5.2.0' });
  writeMigrationScript(localRoot, '5.1.0', "module.exports = (ctx) => { require('fs').writeFileSync(require('path').join(ctx.repoRoot, 'ran-5.1.0'), 'x'); };");
  writeMigrationScript(localRoot, '5.2.0', "module.exports = () => { throw new Error('boom-5.2.0'); };");

  const plan = update.planUpdate(localRoot, upstreamRoot);
  const result = await update.applyPlan(localRoot, plan, { dryRun: false });

  assert.strictEqual(result.migrations.failure.version, '5.2.0', 'result must name which migration failed');
  const writtenManifest = JSON.parse(fs.readFileSync(path.join(localRoot, '.asd/release-manifest.json'), 'utf8'));
  assert.strictEqual(writtenManifest.asd_version, '5.1.0', 'written manifest must record the LAST SUCCESSFUL version, never the unreached target or an unrecorded intermediate one');
});

test('update driver: planUpdate\'s pending-migration preview unions migrations from BOTH the pre-update local tree and the incoming upstream tree', () => {
  const localRoot = mkTempDir();
  const upstreamRoot = mkTempDir();
  writeManifest(localRoot, { asd_version: '6.0.0' });
  writeManifest(upstreamRoot, { asd_version: '6.2.0' });
  writeMigrationScript(upstreamRoot, '6.1.0', "module.exports = () => {};");
  writeMigrationScript(localRoot, '6.2.0', "module.exports = () => {};");

  const plan = update.planUpdate(localRoot, upstreamRoot);
  assert.deepStrictEqual(plan.pendingMigrationVersions, ['6.1.0', '6.2.0'], 'both the upstream-only and the local-only migration must appear in the preview');
});

function writeMigrationScript(root, version, scriptSrc) {
  writeFile(root, `.asd/migrations/${version}.js`, scriptSrc);
}

test('update.js migration runner (AC-12): pending migrations execute in ascending version order', async () => {
  const root = mkTempDir();
  const logPath = path.join(root, 'order.log');
  writeMigrationScript(root, '1.1.0', "module.exports = (ctx) => { require('fs').appendFileSync(require('path').join(ctx.repoRoot, 'order.log'), '1.1.0\\n'); };");
  writeMigrationScript(root, '1.0.1', "module.exports = (ctx) => { require('fs').appendFileSync(require('path').join(ctx.repoRoot, 'order.log'), '1.0.1\\n'); };");

  const result = await update.runMigrations(root, '1.0.0', '1.1.0');
  assert.deepStrictEqual(result.ran, ['1.0.1', '1.1.0']);
  assert.strictEqual(result.reachedVersion, '1.1.0');
  assert.strictEqual(fs.readFileSync(logPath, 'utf8'), '1.0.1\n1.1.0\n', 'the older-versioned migration must have run FIRST, regardless of filesystem listing order');
});

test('update.js migration runner (AC-12): a migration at or below the consumer\'s current version is skipped, never run', async () => {
  const root = mkTempDir();
  // Version equal to oldVersion must be skipped (compareVersions > 0 excludes
  // it) - if it ran anyway, this script would throw and fail the whole run.
  writeMigrationScript(root, '1.0.0', "module.exports = () => { throw new Error('must never run - at-or-below current version'); };");
  writeMigrationScript(root, '1.1.0', "module.exports = (ctx) => { require('fs').writeFileSync(require('path').join(ctx.repoRoot, 'ran.log'), 'yes'); };");

  const result = await update.runMigrations(root, '1.0.0', '1.1.0');
  assert.deepStrictEqual(result.ran, ['1.1.0']);
  assert.strictEqual(result.failure, null);
  assert.strictEqual(fs.readFileSync(path.join(root, 'ran.log'), 'utf8'), 'yes');
});

test('update.js migration runner (AC-12): stop-on-first-failure pins reachedVersion at the last success, not the target', async () => {
  const root = mkTempDir();
  writeMigrationScript(root, '1.0.1', "module.exports = (ctx) => { require('fs').writeFileSync(require('path').join(ctx.repoRoot, 'ran-1.0.1'), 'x'); };");
  writeMigrationScript(root, '1.0.2', "module.exports = () => { throw new Error('boom'); };");
  writeMigrationScript(root, '1.0.3', "module.exports = (ctx) => { require('fs').writeFileSync(require('path').join(ctx.repoRoot, 'ran-1.0.3'), 'x'); };");

  const result = await update.runMigrations(root, '1.0.0', '1.0.3');
  assert.strictEqual(result.reachedVersion, '1.0.1', 'must pin to the last SUCCESSFUL version, never the target version');
  assert.deepStrictEqual(result.ran, ['1.0.1']);
  assert.strictEqual(result.failure.version, '1.0.2');
  assert.ok(result.failure.error.includes('boom'));
  assert.strictEqual(fs.existsSync(path.join(root, 'ran-1.0.3')), false, 'a migration after the failed one must never run');
});

test('update.js migration runner (AC-12): no pending migrations advances reachedVersion straight to the target', async () => {
  const root = mkTempDir(); // no .asd/migrations directory at all
  const result = await update.runMigrations(root, '2.0.0', '2.1.0');
  assert.strictEqual(result.reachedVersion, '2.1.0');
  assert.deepStrictEqual(result.ran, []);
  assert.strictEqual(result.failure, null);
});

test('update.js applyPlan (regression): a migration requiring .asd/sync.js from ctx.repoRoot sees the JUST-WRITTEN engine, never a require.cache copy poisoned before this same apply ran', async () => {
  const localRoot = mkTempDir();
  const upstreamRoot = mkTempDir();

  // The OLD engine lacks newHelper entirely - the exact shape of the real
  // defect (a stale sync.js missing hasOwnershipMarker threw a TypeError).
  const oldSyncJs = "module.exports = { newHelper: undefined, runCheck: () => [] };\n";
  const newSyncJs = "module.exports = { newHelper: () => 'NEW_ENGINE_HELPER', runCheck: () => [] };\n";
  writeFile(localRoot, '.asd/sync.js', oldSyncJs);
  writeFile(upstreamRoot, '.asd/sync.js', newSyncJs);
  writeManifest(localRoot, { asd_version: '9.9.8', upstream_hashes: { '.asd/sync.js': hashOf(oldSyncJs) } });
  writeManifest(upstreamRoot, { asd_version: '9.9.9' });
  writeMigrationScript(localRoot, '9.9.9', [
    "module.exports = (ctx) => {",
    "  const path = require('path');",
    "  const sync = require(path.join(ctx.repoRoot, '.asd', 'sync.js'));",
    "  return { helperResult: sync.newHelper() };",
    "};",
  ].join('\n'));

  // Poison require.cache for this fixture's OWN <repoRoot>/.asd/sync.js path
  // with the OLD content BEFORE applyPlan runs - mirrors a real asd-update
  // process where this exact path was already required earlier (the module-
  // level `sync` in update.js, or an earlier migration in the same apply).
  const syncPath = path.join(localRoot, '.asd', 'sync.js');
  require(syncPath);

  const plan = update.planUpdate(localRoot, upstreamRoot);
  const result = await update.applyPlan(localRoot, plan, { dryRun: false });

  assert.strictEqual(result.migrations.failure, null, `migration must succeed against the freshly-written engine: ${JSON.stringify(result.migrations.failure)}`);
  assert.ok(result.migrations.ran.includes('9.9.9'));
  assert.strictEqual(result.migrations.reports['9.9.9'].helperResult, 'NEW_ENGINE_HELPER', 'must observe the JUST-WRITTEN engine export, never a cached stale copy missing it');
});

test('release-manifest.json: canon_hashes has an entry for every .asd/agents/*.md file and every entry matches the actual file (relative to .asd/)', () => {
  const manifest = loadManifest();
  const missing = fs
    .readdirSync(path.join(REPO_ROOT, '.asd', 'agents'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => `agents/${f}`)
    .filter((key) => !(key in (manifest.canon_hashes || {})));
  assert.deepStrictEqual(missing, [], `canon_hashes missing entries for: ${missing.join(', ')}`);
  const stale = [];
  for (const [relToAsd, recorded] of Object.entries(manifest.canon_hashes || {})) {
    const abs = path.join(REPO_ROOT, '.asd', relToAsd);
    const actual = sync.digestTag(sync.readNormalized(abs));
    if (actual !== recorded) stale.push(relToAsd);
  }
  assert.deepStrictEqual(stale, [], `canon_hashes entries out of date (recompute after editing): ${stale.join(', ')}`);
});

test('release-manifest.json: every upstream_hashes entry matches the actual file (relative to repo root)', () => {
  const manifest = loadManifest();
  const stale = [];
  for (const [relToRepo, recorded] of Object.entries(manifest.upstream_hashes || {})) {
    const abs = path.join(REPO_ROOT, relToRepo);
    if (!fs.existsSync(abs)) { stale.push(`${relToRepo} (missing on disk)`); continue; }
    const actual = sync.sha256Hex(sync.readNormalized(abs)); // upstream_hashes are bare hex, no "sha256:" prefix
    if (actual !== recorded) stale.push(relToRepo);
  }
  assert.deepStrictEqual(stale, [], `upstream_hashes entries out of date (recompute after editing): ${stale.join(', ')}`);
});

test('AC-5/G-12: every file under release-manifest managed_paths HAS an upstream_hashes entry (reverse direction - an unregistered new template would otherwise never reach a consumer)', () => {
  const manifest = loadManifest();
  const recorded = new Set(Object.keys(manifest.upstream_hashes || {}));
  const unregistered = [];

  function walk(relPath) {
    const abs = path.join(REPO_ROOT, relPath);
    if (!fs.existsSync(abs)) return;
    if (fs.statSync(abs).isFile()) {
      if (!recorded.has(relPath)) unregistered.push(relPath);
      return;
    }
    for (const entry of fs.readdirSync(abs).sort()) walk(`${relPath}/${entry}`);
  }
  for (const managed of manifest.managed_paths) walk(managed);

  assert.deepStrictEqual(
    unregistered,
    [],
    `managed files with no upstream_hashes entry (update.js would never deliver them): ${unregistered.join(', ')}`
  );
});

test('T-2/C-2: canon_hashes covers only .asd/agents/*.md and .asd/skills/*/SKILL.md - the tree scope the per-tree collateral-failure counts depend on', () => {
  const entries = sync.computeCanonHashes(REPO_ROOT);
  assert.ok(entries.length > 0, 'sanity: computeCanonHashes must find at least one entry in this repo');
  for (const [key] of entries) {
    assert.ok(/^agents\/[^/]+\.md$/.test(key) || /^skills\/[^/]+\/SKILL\.md$/.test(key), `canon_hashes key "${key}" must be under agents/*.md or skills/*/SKILL.md - a third tree here would silently invalidate the memory's per-tree collateral-count claim`);
  }
  assert.strictEqual(entries.some(([key]) => key.startsWith('hooks/')), false, 'session-start.js and other hooks must never appear in canon_hashes - the memory\'s "hooks/t_AGENTS.md/t_CLAUDE.md -> two, not three" claim depends on this exclusion');
});

test('sprint-025 AC-8 (D8): compareManifestVersions orders versions numerically, ignores every remote field but asd_version, and rejects a malformed or non-numeric version', () => {
  const manifest = (version, extra = {}) => JSON.stringify({ asd_version: version, ...extra });
  assert.deepStrictEqual(update.compareManifestVersions(manifest('1.2.0'), manifest('1.10.0')), { local: '1.2.0', remote: '1.10.0', newer: true }, 'dotted versions compare per component, not as text');
  assert.strictEqual(update.compareManifestVersions(manifest('1.2.0'), manifest('1.2.0')).newer, false);
  assert.strictEqual(update.compareManifestVersions(manifest('2.0'), manifest('1.9.9')).newer, false);
  assert.deepStrictEqual(Object.keys(update.compareManifestVersions(manifest('1.0'), manifest('1.1', { repo: 'https://evil.example/x', branch: 'y' }))), ['local', 'remote', 'newer'], 'the remote text is untrusted data');
  for (const remote of ['{not json', manifest('1.1; rm -rf /'), manifest(2), '{}']) {
    assert.throws(() => update.compareManifestVersions(manifest('1.0'), remote), /remote release-manifest\.json/, `remote ${remote}`);
  }
  assert.throws(() => update.compareManifestVersions('{}', manifest('1.1')), /local release-manifest\.json/);
});
