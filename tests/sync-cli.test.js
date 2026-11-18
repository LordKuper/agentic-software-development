'use strict';

// sync.js command line: --check, --apply and orphan detection

const { assert, fs, path, execFileSync, spawnSync, sync, REPO_ROOT, test, loadManifest, makeMiniRepo, writeAgentCanon, GOOD_AGENT_CANON, markedFileContent, canonText, subOf, spans, disabledAttributionRepo, linkedLedgerCases } = require('./lib.js');

test('`node .asd/sync.js --check` reports every item current (no drift), including AGENTS.md', () => {
  const { execFileSync } = require('node:child_process');
  const out = execFileSync(process.execPath, [path.join(REPO_ROOT, '.asd', 'sync.js'), '--check'], { cwd: REPO_ROOT, encoding: 'utf8' });
  const parsed = JSON.parse(out);
  assert.strictEqual(parsed.ok, true);
  assert.ok(Array.isArray(parsed.items));
  // Coverage guard: the drift filter below only inspects items `--check`
  // actually enumerated, so it passes vacuously on an empty or partial
  // plan (e.g. a canon dir silently dropped from buildSyncPlan()'s
  // enumeration). Independently enumerate the expected full-file targets
  // straight from disk (not via sync.js) and assert each one was planned.
  const targets = new Set(parsed.items.map((item) => item.target));
  const agentsDir = path.join(REPO_ROOT, '.asd', 'agents');
  for (const f of fs.readdirSync(agentsDir)) {
    if (!f.endsWith('.md')) continue;
    const name = f.slice(0, -3);
    assert.ok(targets.has(`.claude/agents/${name}.md`), `sync plan missing .claude/agents/${name}.md`);
    assert.ok(targets.has(`.codex/agents/${name}.toml`), `sync plan missing .codex/agents/${name}.toml`);
  }
  const skillsDir = path.join(REPO_ROOT, '.asd', 'skills');
  for (const name of fs.readdirSync(skillsDir)) {
    if (!fs.existsSync(path.join(skillsDir, name, 'SKILL.md'))) continue;
    assert.ok(targets.has(`.claude/skills/${name}/SKILL.md`), `sync plan missing .claude/skills/${name}/SKILL.md`);
    assert.ok(targets.has(`.agents/skills/${name}/SKILL.md`), `sync plan missing .agents/skills/${name}/SKILL.md`);
  }
  const drifted = parsed.items.filter((item) => item.status !== 'current');
  assert.deepStrictEqual(drifted, [], '`--check` always exits 0 with `ok: true`; drift only shows as a per-item `status` string, so `ok`/`items` alone cannot catch a stale/modified generated view. AGENTS.md is an ordinary managed-block target (sprint 006 removed the self-sourced carve-out) and must be current here too.');
});

test('sync.js orphan detection (AC-14): --check reports a marked orphan as "orphan" (fails) and an unmarked one as "orphan-unmarked" (informational, never a failure)', () => {
  const root = makeMiniRepo();
  const manifest = loadManifest();
  const markedAbs = path.join(root, '.claude', 'agents', 'asd-reviewer-quality.md');
  const unmarkedAbs = path.join(root, '.claude', 'agents', 'consumer-owned.md');
  fs.mkdirSync(path.dirname(markedAbs), { recursive: true });
  fs.writeFileSync(markedAbs, markedFileContent('md', manifest), 'utf8');
  fs.writeFileSync(unmarkedAbs, "# a consumer's own hand-authored agent, no ownership marker\n", 'utf8');

  const report = sync.runCheck(root);
  assert.strictEqual(report.find((i) => i.target === '.claude/agents/asd-reviewer-quality.md').status, 'orphan');
  assert.strictEqual(report.find((i) => i.target === '.claude/agents/consumer-owned.md').status, 'orphan-unmarked');
  // Mirrors main()'s own CLI exit-code rule: only a marked orphan fails --check.
  assert.strictEqual(report.some((i) => i.status === 'orphan'), true, 'a marked orphan must fail the check');
});

test('sync.js orphan detection: --apply deletes an explicitly-requested marked orphan but refuses an unmarked one, unmarked file survives', () => {
  const root = makeMiniRepo();
  const manifest = loadManifest();
  const markedAbs = path.join(root, '.claude', 'agents', 'asd-reviewer-quality.md');
  const unmarkedAbs = path.join(root, '.claude', 'agents', 'consumer-owned.md');
  fs.mkdirSync(path.dirname(markedAbs), { recursive: true });
  fs.writeFileSync(markedAbs, markedFileContent('md', manifest), 'utf8');
  fs.writeFileSync(unmarkedAbs, "# a consumer's own hand-authored agent, no ownership marker\n", 'utf8');

  const results = sync.runApply(root, ['.claude/agents/asd-reviewer-quality.md', '.claude/agents/consumer-owned.md']);
  const markedResult = results.find((r) => r.target === '.claude/agents/asd-reviewer-quality.md');
  const unmarkedResult = results.find((r) => r.target === '.claude/agents/consumer-owned.md');

  assert.strictEqual(markedResult.status, 'orphan');
  assert.strictEqual(markedResult.applied, true);
  assert.strictEqual(fs.existsSync(markedAbs), false, 'marked orphan must be deleted');

  assert.strictEqual(unmarkedResult.status, 'orphan-unmarked');
  assert.strictEqual(unmarkedResult.applied, false);
  assert.strictEqual(fs.existsSync(unmarkedAbs), true, 'unmarked file sharing the path must never be deleted');
});

test('sync.js orphan detection: a symlinked orphan target fails closed - treated as unmarked, never deleted', () => {
  const root = makeMiniRepo();
  const manifest = loadManifest();
  const realFile = path.join(root, 'real-marked-elsewhere.md');
  fs.writeFileSync(realFile, markedFileContent('md', manifest), 'utf8');
  const linkAbs = path.join(root, '.claude', 'agents', 'symlinked-orphan.md');
  fs.mkdirSync(path.dirname(linkAbs), { recursive: true });
  let symlinkSupported = true;
  try {
    fs.symlinkSync(realFile, linkAbs, 'file');
  } catch (_) {
    symlinkSupported = false; // e.g. Windows without dev mode / elevated perms
  }
  if (!symlinkSupported) {
    console.log('  (skipped symlink assertions: fs.symlinkSync unsupported in this environment)');
    return;
  }

  const report = sync.runCheck(root);
  const item = report.find((i) => i.target === '.claude/agents/symlinked-orphan.md');
  assert.strictEqual(item.status, 'orphan-unmarked', 'a symlink must fail closed to "no marker", never be treated as deletable, regardless of what it points at');

  const results = sync.runApply(root, ['.claude/agents/symlinked-orphan.md']);
  assert.strictEqual(results[0].applied, false);
  assert.strictEqual(fs.existsSync(linkAbs), true, 'symlinked target must never be deleted');
});

test('sync.js runApply (fail-open fix, decisions-log 2026-09-04): a target matching no plan entry and no orphan reports not-found, aborts the WHOLE batch (no partial write)', () => {
  const root = makeMiniRepo();
  writeAgentCanon(root, 'good-agent', GOOD_AGENT_CANON);
  const goodTargetRel = '.claude/agents/good-agent.md';
  const bogusTargetRel = '.claude/agents/typo-target-matching-nothing.md';

  const results = sync.runApply(root, [goodTargetRel, bogusTargetRel]);
  const bogusResult = results.find((r) => r.target === bogusTargetRel);
  const goodResult = results.find((r) => r.target === goodTargetRel);

  assert.strictEqual(bogusResult.status, 'not-found');
  assert.strictEqual(bogusResult.applied, false);
  assert.strictEqual(goodResult.applied, false, 'a bogus target anywhere in the batch must abort the whole batch, not just its own entry - previously this reported a false-green apply');
  assert.strictEqual(fs.existsSync(path.join(root, goodTargetRel)), false, 'no partial write from an aborted batch');
});

test('sync.js orphan detection: --apply on a NESTED per-skill orphan (.agents/skills/<name>/SKILL.md) removes the now-emptied skill directory too, via sync.js\'s OWN removeIfEmptyDir call - not just the 4.0.0 migration\'s', () => {
  // removeIfEmptyDir is one shared implementation (sync.js) called from two
  // different sites with independently-constructed absolute paths: this
  // orphan-apply path (findOrphans' recursive walk over ORPHAN_TREES, which
  // includes .agents/skills) and the 4.0.0 migration's hardcoded target list
  // (already covered by its own test). Proving THIS caller's path-construction
  // also reaches a real, now-empty nested directory is not redundant with
  // that other test - the two callers compute absOrphan/absPath differently
  // and only this one is reachable through --apply's orphan branch at all.
  const root = makeMiniRepo();
  const manifest = loadManifest();
  const skillAbs = path.join(root, '.agents', 'skills', 'asd-reviewer-quality', 'SKILL.md');
  const skillDirAbs = path.dirname(skillAbs);
  fs.mkdirSync(skillDirAbs, { recursive: true });
  fs.writeFileSync(skillAbs, markedFileContent('md', manifest), 'utf8');

  const results = sync.runApply(root, ['.agents/skills/asd-reviewer-quality/SKILL.md']);
  const result = results.find((r) => r.target === '.agents/skills/asd-reviewer-quality/SKILL.md');

  assert.strictEqual(result.status, 'orphan');
  assert.strictEqual(result.applied, true);
  assert.strictEqual(fs.existsSync(skillAbs), false, 'marked orphan file must be deleted');
  assert.strictEqual(fs.existsSync(skillDirAbs), false, 'the now-empty per-skill directory must be pruned too, not left behind');
});

test('sync.js CLI: --check exits 1 when a marked orphan is present, 0 when only an unmarked one is', () => {
  const root = makeMiniRepo();
  const manifest = loadManifest();
  const markedAbs = path.join(root, '.claude', 'agents', 'asd-reviewer-quality.md');
  const unmarkedAbs = path.join(root, '.claude', 'agents', 'consumer-owned.md');
  fs.mkdirSync(path.dirname(markedAbs), { recursive: true });
  fs.writeFileSync(markedAbs, markedFileContent('md', manifest), 'utf8');
  fs.writeFileSync(unmarkedAbs, "# a consumer's own hand-authored agent, no ownership marker\n", 'utf8');

  let error = null;
  try {
    execFileSync(process.execPath, [path.join(REPO_ROOT, '.asd', 'sync.js'), '--check'], { cwd: root, encoding: 'utf8' });
  } catch (e) {
    error = e;
  }
  assert.ok(error, '--check must exit non-zero when a marked orphan is present');
  assert.strictEqual(error.status, 1);
  const report = JSON.parse(error.stdout);
  assert.strictEqual(report.ok, false);
  assert.ok(report.items.some((i) => i.status === 'orphan'));

  fs.rmSync(markedAbs, { force: true });
  const out = execFileSync(process.execPath, [path.join(REPO_ROOT, '.asd', 'sync.js'), '--check'], { cwd: root, encoding: 'utf8' });
  const secondReport = JSON.parse(out);
  assert.strictEqual(secondReport.ok, true, 'an unmarked orphan alone must never fail --check');
  assert.ok(secondReport.items.some((i) => i.target === '.claude/agents/consumer-owned.md' && i.status === 'orphan-unmarked'), 'the unmarked file must still be reported as orphan-unmarked, just never as a failure');
});

test('sync.js CLI: a hand-edited marked orphan reports orphan-modified and fails --check, --apply leaves it alone without --force and deletes it with --force; providers.md states the status', () => {
  const { spawnSync } = require('node:child_process');
  const root = makeMiniRepo();
  const manifest = loadManifest();
  const rel = '.claude/agents/asd-reviewer-quality.md';
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, markedFileContent('md', manifest, { edited: true }), 'utf8');
  const cli = (...args) => spawnSync(process.execPath, [path.join(REPO_ROOT, '.asd', 'sync.js'), ...args], { cwd: root, encoding: 'utf8' });

  const checked = cli('--check');
  const status = JSON.parse(checked.stdout).items.find((i) => i.target === rel).status;
  assert.strictEqual(status, 'orphan-modified');
  assert.strictEqual(checked.status, 1, 'a hand-edited marked orphan fails --check like an unedited one');

  const refused = JSON.parse(cli('--apply', rel).stdout).applied.find((r) => r.target === rel);
  assert.deepStrictEqual([refused.status, refused.applied], ['orphan-modified', false]);
  assert.strictEqual(fs.existsSync(abs), true, 'without --force the hand-edited orphan survives');

  const forced = JSON.parse(cli('--apply', rel, '--force').stdout).applied.find((r) => r.target === rel);
  assert.deepStrictEqual([forced.status, forced.applied], ['orphan-modified', true]);
  assert.strictEqual(fs.existsSync(abs), false, 'with --force the confirmed orphan is deleted');

  assert.ok(subOf(canonText('.asd/rules/providers.md'), 'Orphan detection').includes(`\`${status}\``), 'providers.md "Orphan detection" names the status --check reports for a hand-edited orphan');
});

test('sync.js CLI: --apply on a not-found target aborts the whole batch (exit 1) and skips the hash-ledger recompute - manifest and sync-state.json stay byte-for-byte untouched', () => {
  const root = makeMiniRepo();
  const manifestPath = path.join(root, '.asd', 'release-manifest.json');
  const syncStatePath = path.join(root, '.asd', 'sync-state.json');
  const manifestBefore = fs.readFileSync(manifestPath, 'utf8');
  const syncStateBefore = fs.readFileSync(syncStatePath, 'utf8');

  let error = null;
  try {
    execFileSync(process.execPath, [path.join(REPO_ROOT, '.asd', 'sync.js'), '--apply', '.claude/agents/typo-target-matching-nothing.md'], { cwd: root, encoding: 'utf8' });
  } catch (e) {
    error = e;
  }
  assert.ok(error, '--apply must exit non-zero when a requested target is not-found');
  assert.strictEqual(error.status, 1);
  const report = JSON.parse(error.stdout);
  assert.strictEqual(report.ok, false);
  assert.ok(report.applied.some((a) => a.status === 'not-found'));
  assert.strictEqual(report.hashLedger, null, 'the ledger recompute must be skipped entirely on an aborted batch');
  assert.strictEqual(fs.readFileSync(manifestPath, 'utf8'), manifestBefore, 'an aborted batch must never write release-manifest.json');
  assert.strictEqual(fs.readFileSync(syncStatePath, 'utf8'), syncStateBefore, 'an aborted batch must never write sync-state.json');
});

test('sync.js CLI: bare --apply with no targets fails closed (exit 1) and skips the hash-ledger recompute - a stale generated view can no longer hide behind a green ledger', () => {
  const root = makeMiniRepo();
  const manifestPath = path.join(root, '.asd', 'release-manifest.json');
  const syncStatePath = path.join(root, '.asd', 'sync-state.json');
  const manifestBefore = fs.readFileSync(manifestPath, 'utf8');
  const syncStateBefore = fs.readFileSync(syncStatePath, 'utf8');

  let error = null;
  try {
    execFileSync(process.execPath, [path.join(REPO_ROOT, '.asd', 'sync.js'), '--apply'], { cwd: root, encoding: 'utf8' });
  } catch (e) {
    error = e;
  }
  assert.ok(error, '--apply with an empty target list must exit non-zero, not silently succeed with applied: []');
  assert.strictEqual(error.status, 1);
  const report = JSON.parse(error.stdout);
  assert.strictEqual(report.ok, false);
  assert.deepStrictEqual(report.applied, []);
  assert.strictEqual(report.hashLedger, null, 'the ledger recompute must be skipped when no target was given, exactly like an aborted batch');
  assert.strictEqual(fs.readFileSync(manifestPath, 'utf8'), manifestBefore, 'a bare --apply must never write release-manifest.json');
  assert.strictEqual(fs.readFileSync(syncStatePath, 'utf8'), syncStateBefore, 'a bare --apply must never write sync-state.json');
});

test('sprint-036 AC-16 (external 1, iter-07): sync --check and --apply over a symlinked ledger or a linked .asd directory holding invalid JSON each exit 1 with one "sync: " stderr line naming the link refusal, no stack and no fragment of the linked file, and leave it byte-identical', () => {
  const MARKER = 'LINKED-LEDGER-SECRET-MARKER';
  const FRAGMENT = MARKER.slice(0, 8);
  const invalid = `{ "entries": ${MARKER} `;
  const syncSpawn = (root, args) => spawnSync(process.execPath, [path.join(REPO_ROOT, '.asd', 'sync.js'), ...args], { cwd: root, encoding: 'utf8' });
  const outcomes = [];
  for (const [label, { repo, behind }] of linkedLedgerCases()) {
    fs.writeFileSync(behind, invalid, 'utf8');
    for (const args of [['--check'], ['--apply', '.claude/settings.json']]) {
      const ran = syncSpawn(repo.root, args);
      outcomes.push([label, args[0], ran.status, /^sync: [^\n]*symlink or junction\n$/.test(ran.stderr), `${ran.stdout}${ran.stderr}`.includes(FRAGMENT), fs.readFileSync(behind, 'utf8') === invalid]);
    }
  }
  assert.deepStrictEqual(outcomes, outcomes.map(([label, flag]) => [label, flag, 1, true, false, true]), 'AC-16: the linked ledger is refused before it is parsed - one sync: line, exit 1, no text of the file, bytes unchanged');
});

test('sprint-036 AC-16 (external 1, iter-07): sync --check over an unlinked ledger of an unsupported schema_version exits 1 with one "sync: " stderr line naming it, no stack and no stdout - the CLI catch-all reports any thrown error, not only a link refusal', () => {
  const repo = disabledAttributionRepo();
  const ledger = path.join(repo.root, '.asd', 'sync-state.json');
  fs.writeFileSync(ledger, JSON.stringify({ schema_version: 99, entries: {} }), 'utf8');
  const ran = spawnSync(process.execPath, [path.join(REPO_ROOT, '.asd', 'sync.js'), '--check'], { cwd: repo.root, encoding: 'utf8' });
  assert.deepStrictEqual([ran.status, ran.stdout, /^sync: [^\n]*schema_version 99[^\n]*\n$/.test(ran.stderr)], [1, '', true], 'AC-16: a non-link thrown error ends as one sync: line and exit 1, not a stack trace');
});

test('sprint-036 AC-16 (external 1, iter-08): sync --check and --apply over a linked .asd directory or symlinked ledger whose release manifest is malformed JSON exit 1 with one "sync: " link-refusal line carrying no fragment of that manifest, and leave manifest and ledger byte-identical', () => {
  const MARKER = 'LINKED-MANIFEST-SECRET-MARKER';
  const FRAGMENT = MARKER.slice(0, 8);
  const invalid = `{ "schema_version": ${MARKER} `;
  const outcomes = [];
  for (const [label, { repo, behind }] of linkedLedgerCases()) {
    const manifestPath = path.join(repo.root, '.asd', 'release-manifest.json');
    fs.writeFileSync(manifestPath, invalid, 'utf8');
    const ledgerBefore = fs.readFileSync(behind, 'utf8');
    for (const args of [['--check'], ['--apply', '.claude/settings.json']]) {
      const ran = spawnSync(process.execPath, [path.join(REPO_ROOT, '.asd', 'sync.js'), ...args], { cwd: repo.root, encoding: 'utf8' });
      outcomes.push([label, args[0], ran.status, /^sync: [^\n]*symlink or junction\n$/.test(ran.stderr), `${ran.stdout}${ran.stderr}`.includes(FRAGMENT), fs.readFileSync(manifestPath, 'utf8') === invalid, fs.readFileSync(behind, 'utf8') === ledgerBefore]);
    }
  }
  assert.deepStrictEqual(outcomes, outcomes.map(([label, flag]) => [label, flag, 1, true, false, true, true]), 'AC-16: the link guard runs before the release manifest is read - one sync: line, exit 1, no manifest text, no byte changed');
});

test('sprint-036 AC-16 (external 2, iter-08): sync --check over an unlinked ledger whose schema_version value spans CR and LF lines exits 1 with exactly one stderr line - the CLI catch-all folds the message to one line', () => {
  const repo = disabledAttributionRepo();
  fs.writeFileSync(path.join(repo.root, '.asd', 'sync-state.json'), JSON.stringify({ schema_version: 'first\r\nsecond\nthird', entries: {} }), 'utf8');
  const ran = spawnSync(process.execPath, [path.join(REPO_ROOT, '.asd', 'sync.js'), '--check'], { cwd: repo.root, encoding: 'utf8' });
  assert.deepStrictEqual([ran.status, ran.stdout, ran.stderr.split('\n').length, /^sync: [^\n\r]*first second third[^\n\r]*\n$/.test(ran.stderr)], [1, '', 2, true], 'AC-16: a multi-line thrown message ends as one stderr line');
});
