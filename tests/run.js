#!/usr/bin/env node
// Stage-0 fixture tests for .asd/sync.js. Plain Node, zero deps/frameworks.
// Run: node tests/run.js

'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const { execFileSync } = require('node:child_process');

const sync = require('../.asd/sync.js');
const update = require('../.asd/skills/asd-update/update.js');
const migration400 = require('../.asd/migrations/4.0.0.js');
const migration500 = require('../.asd/migrations/5.0.0.js');
const migration600 = require('../.asd/migrations/6.0.0.js');
const migration900 = require('../.asd/migrations/9.0.0.js');
const runtime = require('../.asd/runtime.js');

const REPO_ROOT = path.resolve(__dirname, '..');
const FIXTURES = path.join(__dirname, 'fixtures');

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

function mkTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'asd-sync-test-'));
}

// ---------------------------------------------------------------------------
// Helpers shared across tests
// ---------------------------------------------------------------------------

function loadManifest() {
  return sync.loadReleaseManifest(REPO_ROOT);
}

function readExpectedFixture(expectedPath, manifest) {
  // Expected fixtures bake the ownership marker's asd_version field as the
  // placeholder token below rather than a literal version string, so any
  // future self-hosting asd_version bump (release-manifest.json) does not
  // require touching these fixtures - the live manifest value is substituted
  // in at comparison time, mirroring how sync.js stamps it into real output.
  const raw = sync.readNormalized(expectedPath);
  return raw.replace(/\{\{FIXTURE_ASD_VERSION\}\}/g, manifest.asd_version);
}

function renderFixture(kind, canonPath, sourceRelPath, manifest) {
  const canonRawNormalized = sync.readNormalized(canonPath);
  const { meta, body } = sync.parseCanonicalFrontmatter(canonRawNormalized);
  return sync.renderFullFile({
    kind,
    sourceRelPath,
    canonRawNormalized,
    meta,
    body,
    manifest,
    asdVersion: manifest.asd_version,
  });
}

// ===========================================================================
// 1. Canonical -> provider-view transforms (byte-for-byte against fixtures)
// ===========================================================================

test('canonical agent -> Claude .md matches fixture', () => {
  const manifest = loadManifest();
  const rendered = renderFixture(
    'agent-claude',
    path.join(FIXTURES, 'canon/agents/demo-agent.md'),
    'agents/demo-agent.md',
    manifest
  );
  const expected = readExpectedFixture(path.join(FIXTURES, 'expected/agents/demo-agent.claude.md'), manifest);
  assert.strictEqual(rendered.output, expected);
  assert.ok(rendered.output.startsWith('---\n# ASD generated. Edit .asd/agents/demo-agent.md.'));
});

test('canonical agent -> Codex .toml matches fixture', () => {
  const manifest = loadManifest();
  const rendered = renderFixture(
    'agent-codex',
    path.join(FIXTURES, 'canon/agents/demo-agent.md'),
    'agents/demo-agent.md',
    manifest
  );
  const expected = readExpectedFixture(path.join(FIXTURES, 'expected/agents/demo-agent.codex.toml'), manifest);
  assert.strictEqual(rendered.output, expected);
  assert.ok(rendered.output.startsWith('# ASD generated. Edit .asd/agents/demo-agent.md.'));
  assert.ok(rendered.output.includes('model = "gpt-5.6-sol"'), 'codex model family alias must resolve via release-manifest table');
  assert.ok(rendered.output.includes('developer_instructions = """'));
});

test('canonical skill -> Claude SKILL.md matches fixture', () => {
  const manifest = loadManifest();
  const rendered = renderFixture(
    'skill-claude',
    path.join(FIXTURES, 'canon/skills/demo-skill/SKILL.md'),
    'skills/demo-skill/SKILL.md',
    manifest
  );
  const expected = readExpectedFixture(path.join(FIXTURES, 'expected/skills/demo-skill/SKILL.claude.md'), manifest);
  assert.strictEqual(rendered.output, expected);
  assert.ok(rendered.output.includes('allowed-tools: "Read Grep"'));
});

test('canonical skill -> Codex SKILL.md matches fixture', () => {
  const manifest = loadManifest();
  const rendered = renderFixture(
    'skill-codex',
    path.join(FIXTURES, 'canon/skills/demo-skill/SKILL.md'),
    'skills/demo-skill/SKILL.md',
    manifest
  );
  const expected = readExpectedFixture(path.join(FIXTURES, 'expected/skills/demo-skill/SKILL.codex.md'), manifest);
  assert.strictEqual(rendered.output, expected);
  // Codex skill frontmatter must NOT carry Claude-only fields.
  assert.ok(!rendered.output.includes('allowed-tools'));
});

test('AC-1/3/5/6/7: Codex renderer rejects invalid delegate config with context', () => {
  const manifest = loadManifest();
  const meta = {
    name: 'runtime-fixture',
    description: 'fixture',
    codex: { model: 'sol', model_reasoning_effort: 'high', sandbox_mode: 'workspace-write' },
  };
  const cases = [
    ['missing Codex block', { ...meta, codex: null }, manifest, 'missing or malformed Codex configuration'],
    ['unknown family', { ...meta, codex: { ...meta.codex, model: 'unknown' } }, manifest, 'unknown model family'],
    ['legacy unsuffixed model', meta, { ...manifest, model_families: { ...manifest.model_families, codex: { ...manifest.model_families.codex, sol: 'gpt-5.6' } } }, 'unsupported ChatGPT-runtime model mapping'],
    ['mismatched family model', meta, { ...manifest, model_families: { ...manifest.model_families, codex: { ...manifest.model_families.codex, sol: 'gpt-5.6-terra' } } }, 'unsupported ChatGPT-runtime model mapping'],
    ['invalid effort', { ...meta, codex: { ...meta.codex, model_reasoning_effort: 'fast' } }, manifest, 'invalid model reasoning effort'],
    ['invalid sandbox', { ...meta, codex: { ...meta.codex, sandbox_mode: 'unsafe' } }, manifest, 'invalid sandbox mode'],
  ];
  for (const [label, invalidMeta, invalidManifest, reason] of cases) {
    assert.throws(
      () => sync.transformAgentCodexToml(invalidMeta, '', invalidManifest),
      err => err.message.includes(reason) && err.message.includes('runtime-fixture') && err.message.includes('family') && err.message.includes('resolved model') && err.message.includes('effort'),
      label
    );
  }
});

test('AC-3/6/7: every canonical Codex agent renders a supported delegate config', () => {
  const manifest = loadManifest();
  const agentsDir = path.join(REPO_ROOT, '.asd', 'agents');
  const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
  assert.strictEqual(files.length, 11, 'sanity: every dispatched role must be covered');
  for (const file of files) {
    const { meta, body } = sync.parseCanonicalFrontmatter(sync.readNormalized(path.join(agentsDir, file)));
    const output = sync.transformAgentCodexToml(meta, body, manifest);
    assert.match(output, /^model = "gpt-5\.6-(sol|terra|luna)"$/m, `${meta.name}: supported model`);
    assert.match(output, /^model_reasoning_effort = "(low|medium|high|xhigh|max|ultra)"$/m, `${meta.name}: supported effort`);
    assert.match(output, /^sandbox_mode = "(workspace-write|read-only)"$/m, `${meta.name}: supported sandbox`);
  }
});

test('AC-2/4/5/7/8: Codex skill rendering rewrites only standalone invocations', () => {
  const meta = { name: 'fixture', description: 'Run /asd-sprint; preserve /guide/asd-sprint, /asd-sprint/usage, /asd-sprint.md, /asd-sprintGuide, /asd-sprint_guide, and https://example.test/asd-sprint.' };
  const body = 'Then run (/asd-init). Existing $asd-sync, /docs/asd-sync, /asd-sync/usage, /asd-sync.md, /asd-syncGuide, /asd-sync_guide, and https://example.test/asd-sync stay unchanged.';
  const codex = sync.transformSkillCodex(meta, body);
  const claude = sync.transformSkillClaude(meta, body);
  assert.ok(codex.includes('$asd-sprint') && codex.includes('($asd-init)'), 'Codex standalone invocations must use skill syntax');
  assert.ok(codex.includes('/guide/asd-sprint') && codex.includes('/asd-sprint/usage') && codex.includes('/asd-sprint.md') && codex.includes('/asd-sprintGuide') && codex.includes('/asd-sprint_guide') && codex.includes('https://example.test/asd-sprint') && codex.includes('/docs/asd-sync') && codex.includes('/asd-sync/usage') && codex.includes('/asd-sync.md') && codex.includes('/asd-syncGuide') && codex.includes('/asd-sync_guide'), 'paths, continuations, and URLs must remain literal');
  assert.ok(claude.includes('/asd-sprint') && claude.includes('(/asd-init)'), 'Claude commands must remain slash commands');
  assert.ok(!claude.includes('$asd-sprint'), 'Claude output must not inherit Codex syntax');
});

// ===========================================================================
// 1b. {{wraps_cli}}/{{wraps_config_key}} per-provider body substitution
//     (asd-sync.js generic templating step - asd-external-review.md is the
//     only real consumer today, but the mechanism itself is generic).
// ===========================================================================

test('substitutePlaceholders: known key substituted, unknown/typo placeholders left untouched', () => {
  const out = sync.substitutePlaceholders('a {{wraps_cli}} b {{SPRINT}} c {{typo_key}}', { wraps_cli: 'codex' });
  // {{SPRINT}} etc. are resolved at dispatch time by the runtime, never by
  // sync.js - they must pass through untouched because they're simply never
  // present as keys in the values object, not because of special-casing.
  assert.strictEqual(out, 'a codex b {{SPRINT}} c {{typo_key}}');
});

test('agent-claude / agent-codex transforms resolve {{wraps_cli}}/{{wraps_config_key}} from claude{}/codex{} respectively', () => {
  const manifest = loadManifest();
  const canonPath = path.join(FIXTURES, 'canon/agents/demo-wraps-agent.md');

  const claudeRendered = renderFixture('agent-claude', canonPath, 'agents/demo-wraps-agent.md', manifest);
  assert.ok(claudeRendered.output.includes('Wraps `codex` CLI.'), 'claude-side body must resolve {{wraps_cli}} to claude.wraps_cli');
  assert.ok(claudeRendered.output.includes('Override via `system.tools.codex_command`.'));

  const codexRendered = renderFixture('agent-codex', canonPath, 'agents/demo-wraps-agent.md', manifest);
  assert.ok(codexRendered.output.includes('Wraps `claude` CLI.'), 'codex-side body must resolve {{wraps_cli}} to codex.wraps_cli');
  assert.ok(codexRendered.output.includes('Override via `system.tools.claude_command`.'));

  assert.notStrictEqual(claudeRendered.body, codexRendered.body, 'the two provider bodies must differ once substituted');
});

test('asd-external-review: the wrapped CLI subprocess carries an explicit read-only flag on both providers', () => {
  const claudeAgent = fs.readFileSync(path.join(REPO_ROOT, '.claude/agents/asd-external-review.md'), 'utf8');
  const codexAgent = fs.readFileSync(path.join(REPO_ROOT, '.codex/agents/asd-external-review.toml'), 'utf8');
  assert.ok(claudeAgent.includes('codex exec --model gpt-5.6-sol -c model_reasoning_effort="high" --sandbox read-only -'), 'Claude-side must invoke the wrapped Codex CLI with explicit model, effort, and read-only sandbox');
  assert.ok(codexAgent.includes('--restricted --tools "Read,Grep,Glob" --strict-mcp-config'), 'Codex-side must invoke the wrapped Claude CLI with explicit read-only tool restriction, not rely on ambient project permissions');
});

test('AC-2/4/6/8: External Review CLI availability stays provider-symmetric', () => {
  const init = fs.readFileSync(path.join(REPO_ROOT, '.asd', 'skills/asd-init/SKILL.md'), 'utf8');
  const config = fs.readFileSync(path.join(REPO_ROOT, '.asd', 'templates/t_config.yaml'), 'utf8');
  const claudeAgent = fs.readFileSync(path.join(REPO_ROOT, '.claude/agents/asd-external-review.md'), 'utf8');
  const codexAgent = fs.readFileSync(path.join(REPO_ROOT, '.codex/agents/asd-external-review.toml'), 'utf8');
  assert.ok(init.includes('system.tools.codex_command') && init.includes('system.tools.claude_command') && init.includes('resolved command and availability'));
  assert.ok(config.includes('codex_command: ""') && config.includes('claude_command: ""'));
  assert.ok(claudeAgent.includes('system.tools.codex_command') && claudeAgent.includes('phase-supplied preflight') && claudeAgent.includes('external review unavailable: <specific status>'));
  assert.ok(codexAgent.includes('system.tools.claude_command') && codexAgent.includes('phase-supplied preflight') && codexAgent.includes('external review unavailable: <specific status>'));
});

test('AC-3: wrapped model aliases resolve through the wrapped provider table', () => {
  const manifest = loadManifest();
  const raw = sync.readNormalized(path.join(REPO_ROOT, '.asd', 'agents', 'asd-external-review.md'));
  const { meta, body } = sync.parseCanonicalFrontmatter(raw);
  assert.ok(!raw.includes('gpt-5.6-sol'), 'canonical wrapper source must store family aliases only');
  const changed = structuredClone(manifest);
  changed.model_families.codex.sol = 'gpt-5.6-sol';
  const rendered = sync.transformAgentClaude(meta, body, changed);
  assert.ok(rendered.includes('--model gpt-5.6-sol'), 'nested wrapper arguments must receive the resolved wrapped model');
  assert.ok(!rendered.includes('{{wraps_model}}'));
});

test('agents whose meta never sets wraps_cli/wraps_config_key are unaffected (substitution is a no-op)', () => {
  const manifest = loadManifest();
  const rendered = renderFixture('agent-claude', path.join(FIXTURES, 'canon/agents/demo-agent.md'), 'agents/demo-agent.md', manifest);
  assert.ok(!rendered.output.includes('{{'), 'demo-agent body carries no placeholders to begin with - render must stay byte-identical to its existing fixture');
});

// ===========================================================================
// 2. CRLF / BOM normalization
// ===========================================================================

test('CRLF+BOM canonical input normalizes to the same output as LF/no-BOM', () => {
  const manifest = loadManifest();
  const cleanPath = path.join(FIXTURES, 'canon/agents/demo-agent.md');
  const cleanRaw = fs.readFileSync(cleanPath, 'utf8');
  const dirtyPath = path.join(mkTempDir(), 'demo-agent.crlf-bom.md');
  fs.writeFileSync(dirtyPath, `\ufeff${cleanRaw.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n')}`, 'utf8');

  const dirtyRaw = fs.readFileSync(dirtyPath, 'utf8');
  assert.ok(dirtyRaw.charCodeAt(0) === 0xfeff, 'fixture sanity: input must actually carry a BOM - this input is built here at runtime because a committed CRLF blob cannot survive .gitattributes `* text=auto eol=lf` and would reach a fresh clone as LF');
  assert.ok(dirtyRaw.includes('\r\n'), 'fixture sanity: input must actually carry CRLF');
  assert.ok(!dirtyRaw.includes('\r\r'), 'fixture sanity: the LF-to-CRLF conversion must not double a CR when the clean fixture is already CRLF in this working tree');

  const clean = renderFixture('agent-claude', cleanPath, 'agents/demo-agent.md', manifest);
  const dirty = renderFixture('agent-claude', dirtyPath, 'agents/demo-agent.md', manifest);

  assert.strictEqual(dirty.output, clean.output, 'rendered output must be byte-identical regardless of input CRLF/BOM');
  assert.strictEqual(dirty.sourceDigest, clean.sourceDigest, 'source_digest must be computed post-normalization');
  assert.strictEqual(dirty.contentDigest, clean.contentDigest);
  assert.ok(!dirty.output.includes('\r'), 'generated output must never contain CR');
  assert.ok(!/^\uFEFF/.test(dirty.output), 'generated output must never carry a BOM');
});

// ===========================================================================
// 3. Full-file class: status classification + apply + idempotency
// ===========================================================================

test('full-file status: missing target', () => {
  const manifest = loadManifest();
  const rendered = renderFixture('agent-claude', path.join(FIXTURES, 'canon/agents/demo-agent.md'), 'agents/demo-agent.md', manifest);
  const dir = mkTempDir();
  const target = path.join(dir, 'demo-agent.md');
  assert.strictEqual(sync.statusFullFile(target, rendered.contentDigest), 'missing');
});

test('full-file status: current after apply, then idempotent (zero byte diff) on re-check', () => {
  const manifest = loadManifest();
  const rendered = renderFixture('agent-claude', path.join(FIXTURES, 'canon/agents/demo-agent.md'), 'agents/demo-agent.md', manifest);
  const dir = mkTempDir();
  const target = path.join(dir, 'demo-agent.md');

  assert.strictEqual(sync.statusFullFile(target, rendered.contentDigest), 'missing');
  sync.applyFullFile(target, rendered.output);
  assert.strictEqual(sync.statusFullFile(target, rendered.contentDigest), 'current');

  const bytesAfterFirstApply = fs.readFileSync(target);

  // Simulate a second sync run: status is 'current' so a well-behaved caller
  // must skip the write entirely. Prove that IF it were re-applied anyway,
  // the output would still be byte-identical (the idempotency guarantee),
  // and that skipping leaves the file untouched.
  assert.strictEqual(sync.statusFullFile(target, rendered.contentDigest), 'current');
  const bytesBeforeSecondRun = fs.readFileSync(target);
  assert.deepStrictEqual(bytesBeforeSecondRun, bytesAfterFirstApply, 'no write occurred on the second run (status was current)');

  sync.applyFullFile(target, rendered.output); // re-apply anyway, to prove idempotency of the render itself
  const bytesAfterReapply = fs.readFileSync(target);
  assert.deepStrictEqual(bytesAfterReapply, bytesAfterFirstApply, 'reapplying the same render produced zero byte changes');
});

test('full-file status: stale when an UNTAMPERED body just needs re-render (canon changed)', () => {
  const manifest = loadManifest();
  const rendered = renderFixture('agent-claude', path.join(FIXTURES, 'canon/agents/demo-agent.md'), 'agents/demo-agent.md', manifest);
  const dir = mkTempDir();
  const target = path.join(dir, 'demo-agent.md');

  // Simulate: sync wrote this file for an OLDER render of the same source -
  // marker's own recorded content_digest matches the on-disk body exactly
  // (untampered). Canon has since changed, so today's fresh render digest
  // (rendered.contentDigest) differs from what's on disk -> stale, safe to
  // regenerate. This must NOT be confused with a hand-edit (see the
  // modified-foreign test below) - that distinction is the whole point of
  // checking the marker's own digest before comparing to a fresh render.
  const oldBody = rendered.body.replace('Demo agent.', 'Old demo agent copy.');
  const oldContentDigest = sync.sha256Hex(oldBody);
  const oldMarker = sync.buildFullFileMarker({
    format: 'md',
    sourceRelPath: 'agents/demo-agent.md',
    sourceDigest: rendered.sourceDigest,
    contentDigest: oldContentDigest,
    asdVersion: manifest.asd_version,
  });
  fs.writeFileSync(target, '---\n' + oldMarker + '\n' + oldBody.slice(4), 'utf8');

  assert.strictEqual(sync.statusFullFile(target, rendered.contentDigest), 'stale');

  sync.applyFullFile(target, rendered.output);
  assert.strictEqual(sync.statusFullFile(target, rendered.contentDigest), 'current');
});

test('full-file status: modified-foreign when body no longer matches ITS OWN marker digest (tampered)', () => {
  const manifest = loadManifest();
  const rendered = renderFixture('agent-claude', path.join(FIXTURES, 'canon/agents/demo-agent.md'), 'agents/demo-agent.md', manifest);
  const dir = mkTempDir();
  const target = path.join(dir, 'demo-agent.md');

  sync.applyFullFile(target, rendered.output);
  assert.strictEqual(sync.statusFullFile(target, rendered.contentDigest), 'current');

  // A human hand-edits the body without going through sync - the marker line
  // is left exactly as sync wrote it, so a check that only re-renders and
  // compares (ignoring the marker's OWN recorded digest) would wrongly call
  // this "stale" and silently regenerate over the human's edit.
  const onDisk = fs.readFileSync(target, 'utf8');
  const tampered = onDisk.replace('Demo agent.', 'Hand-edited by a human, not sync.');
  fs.writeFileSync(target, tampered, 'utf8');

  const before = fs.readFileSync(target);
  const status = sync.statusFullFile(target, rendered.contentDigest);
  assert.strictEqual(status, 'modified-foreign');
  if (status === 'missing' || status === 'stale') sync.applyFullFile(target, rendered.output);
  assert.deepStrictEqual(fs.readFileSync(target), before, 'modified-foreign target must not be silently overwritten');
});

test('full-file status: modified-foreign when target has no ownership marker (conflict, refuse to overwrite)', () => {
  const manifest = loadManifest();
  const rendered = renderFixture('agent-claude', path.join(FIXTURES, 'canon/agents/demo-agent.md'), 'agents/demo-agent.md', manifest);
  const dir = mkTempDir();
  const target = path.join(dir, 'demo-agent.md');
  fs.copyFileSync(path.join(FIXTURES, 'targets/agent-claude-foreign.md'), target);

  const before = fs.readFileSync(target);
  const status = sync.statusFullFile(target, rendered.contentDigest);
  assert.strictEqual(status, 'modified-foreign');

  // Contract: a foreign status must never be applied. Simulate a sync run
  // that only writes on missing/stale and prove the file is untouched.
  if (status === 'missing' || status === 'stale') sync.applyFullFile(target, rendered.output);
  const after = fs.readFileSync(target);
  assert.deepStrictEqual(after, before, 'modified-foreign target must not be written to');
});

test('full-file status: invalid JSON frontmatter fails closed before any write', () => {
  const badCanon = '---\n{ "name": "broken", oops }\n---\nbody\n';
  assert.throws(() => sync.parseCanonicalFrontmatter(sync.normalizeText(badCanon)), /not valid JSON/);
});

// ===========================================================================
// 3b. runApply layer: preflight validation across a batch + confirmed force
// ===========================================================================

function makeMiniRepo() {
  const root = mkTempDir();
  fs.mkdirSync(path.join(root, '.asd', 'agents'), { recursive: true });
  const manifest = loadManifest();
  fs.writeFileSync(path.join(root, '.asd', 'release-manifest.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(root, '.asd', 'sync-state.json'), JSON.stringify({ schema_version: 1, entries: {} }, null, 2));
  return root;
}

function writeAgentCanon(root, name, canonText) {
  fs.writeFileSync(path.join(root, '.asd', 'agents', name + '.md'), canonText.replace('"name": "asd-demo"', `"name": "${name}"`), 'utf8');
}

const GOOD_AGENT_CANON = sync.readNormalized(path.join(FIXTURES, 'canon/agents/demo-agent.md'));

test('runApply: force overwrites a modified-foreign target only after explicit confirmation', () => {
  const root = makeMiniRepo();
  writeAgentCanon(root, 'demo-agent', GOOD_AGENT_CANON);
  const targetRel = '.claude/agents/demo-agent.md';
  const targetAbs = path.join(root, targetRel);
  fs.mkdirSync(path.dirname(targetAbs), { recursive: true });
  fs.writeFileSync(targetAbs, '# hand-written, no ownership marker\n', 'utf8');

  const checkBefore = sync.runCheck(root);
  assert.strictEqual(checkBefore.find((i) => i.target === targetRel).status, 'modified-foreign');

  // Without force: refuses, file untouched (the default - never silent).
  const before = fs.readFileSync(targetAbs);
  const noForce = sync.runApply(root, [targetRel]);
  assert.strictEqual(noForce[0].applied, false);
  assert.deepStrictEqual(fs.readFileSync(targetAbs), before);

  // With force: the user-confirmed override actually writes.
  const forced = sync.runApply(root, [targetRel], { force: [targetRel] });
  assert.strictEqual(forced[0].applied, true);
  assert.strictEqual(forced[0].forced, true);
  assert.strictEqual(sync.runCheck(root).find((i) => i.target === targetRel).status, 'current');
});

test('runApply: preflight aborts the WHOLE batch before any write when one canon source is invalid', () => {
  const root = makeMiniRepo();
  writeAgentCanon(root, 'good-agent', GOOD_AGENT_CANON);
  writeAgentCanon(root, 'bad-agent', '---\n{ not valid json }\n---\nbody\n');

  const goodTargetRel = '.claude/agents/good-agent.md';
  const badTargetRel = '.claude/agents/bad-agent.md';

  assert.throws(() => sync.runApply(root, [goodTargetRel, badTargetRel]), /not valid JSON/);

  // The good file would have rendered fine on its own - proves it was never
  // written just because it happened to be processed before the bad one.
  assert.strictEqual(fs.existsSync(path.join(root, goodTargetRel)), false, 'no partial write from an aborted batch');
});

// ===========================================================================
// 3c. AGENTS.md/CLAUDE.md as real generator sources (buildSyncPlan) - editing
// the template must actually propagate through check/stale/apply, not sit
// inert behind a hardcoded copy or an unconditional self-sourced flag.
// ===========================================================================

test('buildSyncPlan: CLAUDE.md tracks t_CLAUDE.md - editing the template makes it stale', () => {
  const root = makeMiniRepo();
  fs.mkdirSync(path.join(root, '.asd', 'templates'), { recursive: true });
  fs.writeFileSync(path.join(root, '.asd', 'templates', 't_CLAUDE.md'), '@AGENTS.md\n', 'utf8');

  sync.runApply(root, ['CLAUDE.md']);
  assert.strictEqual(sync.runCheck(root).find((i) => i.target === 'CLAUDE.md').status, 'current');

  fs.writeFileSync(path.join(root, '.asd', 'templates', 't_CLAUDE.md'), '@AGENTS.md\n@some-new-line.md\n', 'utf8');
  assert.strictEqual(sync.runCheck(root).find((i) => i.target === 'CLAUDE.md').status, 'stale', 'editing t_CLAUDE.md must be visible to sync --check');

  sync.runApply(root, ['CLAUDE.md']);
  assert.ok(fs.readFileSync(path.join(root, 'CLAUDE.md'), 'utf8').includes('@some-new-line.md'));
});

test('buildSyncPlan: an INITIALIZED CONSUMER project generates AGENTS.md from t_AGENTS.md, and tracks edits to it', () => {
  const root = makeMiniRepo();
  fs.mkdirSync(path.join(root, '.asd', 'templates'), { recursive: true });
  fs.mkdirSync(path.join(root, '.asd', 'project'), { recursive: true });
  fs.writeFileSync(path.join(root, '.asd', 'project', 'config.yaml'), 'language:\n  chat: en\n', 'utf8'); // presence alone is the signal
  fs.writeFileSync(path.join(root, '.asd', 'templates', 't_AGENTS.md'), '### Core rules\n\nRead .asd/rules/core.md.\n', 'utf8');

  assert.strictEqual(sync.runCheck(root).find((i) => i.target === 'AGENTS.md').status, 'missing');
  sync.runApply(root, ['AGENTS.md']);
  assert.ok(fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8').includes('Read .asd/rules/core.md.'));
  assert.strictEqual(sync.runCheck(root).find((i) => i.target === 'AGENTS.md').status, 'current');

  fs.writeFileSync(path.join(root, '.asd', 'templates', 't_AGENTS.md'), '### Core rules\n\nRead .asd/rules/core.md AND providers.md.\n', 'utf8');
  assert.strictEqual(sync.runCheck(root).find((i) => i.target === 'AGENTS.md').status, 'stale', 'a consumer AGENTS.md must track template edits - the whole point of canon -> provider view');

  sync.runApply(root, ['AGENTS.md']);
  assert.ok(fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8').includes('providers.md'));
});

test('buildSyncPlan: WITHOUT .asd/project/config.yaml (the framework repo itself), AGENTS.md is an ordinary managed-block target rendered from t_AGENTS.md', () => {
  const root = makeMiniRepo(); // no .asd/project/config.yaml - matches this framework's own repo
  fs.mkdirSync(path.join(root, '.asd', 'templates'), { recursive: true });
  fs.writeFileSync(path.join(root, '.asd', 'templates', 't_AGENTS.md'), 'Framework-dev guidance from the template.\n', 'utf8');

  assert.strictEqual(sync.runCheck(root).find((i) => i.target === 'AGENTS.md').status, 'missing', 'no self-sourced carve-out: a repo without config.yaml must still report AGENTS.md as missing, not silently skip/pass it');
  sync.runApply(root, ['AGENTS.md']);
  assert.ok(fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8').includes('Framework-dev guidance from the template.'), '--apply must actually create AGENTS.md from t_AGENTS.md, not report applied:false');
  assert.strictEqual(sync.runCheck(root).find((i) => i.target === 'AGENTS.md').status, 'current');
});

test('buildSyncPlan: with t_AGENTS.md absent, AGENTS.md drops out of the plan entirely and --apply reports not-found instead of throwing ENOENT', () => {
  const root = makeMiniRepo(); // no .asd/templates/t_AGENTS.md at all

  assert.strictEqual(sync.runCheck(root).find((i) => i.target === 'AGENTS.md'), undefined, 'AGENTS.md must not appear in the plan when its template source is missing');
  const results = sync.runApply(root, ['AGENTS.md']);
  assert.strictEqual(results[0].status, 'not-found');
  assert.strictEqual(results[0].applied, false);
});

// ===========================================================================
// 4. Managed-block class (AGENTS.md / CLAUDE.md)
// ===========================================================================

function freshSyncState() {
  return { schema_version: 1, entries: {} };
}

test('managed-block: missing file -> apply creates it containing just the block', () => {
  const dir = mkTempDir();
  const target = path.join(dir, 'CLAUDE.md');
  const state = freshSyncState();
  const body = '@AGENTS.md\n';

  assert.strictEqual(sync.statusManagedBlock(target, 'CLAUDE.md', body, state), 'missing');
  sync.applyManagedBlock(target, 'CLAUDE.md', body, state);
  const text = fs.readFileSync(target, 'utf8');
  assert.ok(text.includes(sync.BLOCK_BEGIN) && text.includes(sync.BLOCK_END));
  assert.ok(text.includes('@AGENTS.md'));
  assert.strictEqual(sync.statusManagedBlock(target, 'CLAUDE.md', body, state), 'current');
});

test('managed-block: inserted into existing foreign content without touching it', () => {
  const dir = mkTempDir();
  const target = path.join(dir, 'CLAUDE.md');
  // CRLF + BOM on purpose: proves foreign content survives byte-for-byte,
  // not just "survives because it happened to already be LF/no-BOM".
  const userContent = '﻿# My project notes\r\n\r\nDo not lose this paragraph.\r\n';
  fs.writeFileSync(target, userContent, 'utf8');
  const state = freshSyncState();
  const body = '@AGENTS.md\n';

  assert.strictEqual(sync.statusManagedBlock(target, 'CLAUDE.md', body, state), 'missing');
  sync.applyManagedBlock(target, 'CLAUDE.md', body, state);
  const rawText = fs.readFileSync(target, 'utf8');
  assert.ok(rawText.startsWith(userContent), 'pre-existing user content (incl. its own BOM/CRLF) must be preserved byte-for-byte');
  assert.ok(rawText.includes(sync.BLOCK_BEGIN));
});

test('managed-block: stale when tracked block content no longer matches a fresh render', () => {
  const dir = mkTempDir();
  const target = path.join(dir, 'CLAUDE.md');
  const oldBody = '@AGENTS.md (old)\n';
  const newBody = '@AGENTS.md\n';
  const state = freshSyncState();

  fs.writeFileSync(target, sync.BLOCK_BEGIN + '\n' + oldBody + sync.BLOCK_END + '\n', 'utf8');
  state.entries['CLAUDE.md'] = { kind: 'managed-block', content_digest: sync.digestTag(oldBody) };

  assert.strictEqual(sync.statusManagedBlock(target, 'CLAUDE.md', newBody, state), 'stale');
  sync.applyManagedBlock(target, 'CLAUDE.md', newBody, state);
  assert.strictEqual(sync.statusManagedBlock(target, 'CLAUDE.md', newBody, state), 'current');

  const before = fs.readFileSync(target);
  sync.applyManagedBlock(target, 'CLAUDE.md', newBody, state); // second run
  const after = fs.readFileSync(target);
  assert.deepStrictEqual(after, before, 'second sync run on an already-current block is a zero-byte no-op');
});

test('managed-block: CRLF around a pre-existing block does not corrupt the boundary or double the line break', () => {
  const dir = mkTempDir();
  const target = path.join(dir, 'CLAUDE.md');
  const oldBody = '@AGENTS.md (old)\n';
  const newBody = '@AGENTS.md\n';
  const userTail = 'trailing user content\r\nmore lines\r\n';
  const state = freshSyncState();

  // Raw file uses CRLF around the block markers - applyManagedBlock reads
  // RAW (not normalized) to preserve foreign bytes, so findManagedBlock must
  // correctly skip a `\r\n` boundary, not just `\n`.
  const raw = sync.BLOCK_BEGIN + '\r\n' + oldBody + sync.BLOCK_END + '\r\n' + userTail;
  fs.writeFileSync(target, raw, 'utf8');
  state.entries['CLAUDE.md'] = { kind: 'managed-block', content_digest: sync.digestTag(oldBody) };

  sync.applyManagedBlock(target, 'CLAUDE.md', newBody, state);
  const after = fs.readFileSync(target, 'utf8');

  assert.ok(!after.includes('\n\r\n'), 'must never produce a doubled line break at the block-end boundary');
  assert.ok(after.endsWith(userTail), 'user tail must survive completely untouched, immediately after the block');
  assert.strictEqual(sync.statusManagedBlock(target, 'CLAUDE.md', newBody, state), 'current');
});

test('managed-block: modified-foreign when block exists but sync-state has no record (refuse to overwrite)', () => {
  const dir = mkTempDir();
  const target = path.join(dir, 'CLAUDE.md');
  const body = '@AGENTS.md\n';
  fs.writeFileSync(target, sync.BLOCK_BEGIN + '\n' + 'something a human typed by hand\n' + sync.BLOCK_END + '\n', 'utf8');
  const state = freshSyncState(); // no entry for CLAUDE.md at all

  const before = fs.readFileSync(target);
  const status = sync.statusManagedBlock(target, 'CLAUDE.md', body, state);
  assert.strictEqual(status, 'modified-foreign');
  if (status === 'missing' || status === 'stale') sync.applyManagedBlock(target, 'CLAUDE.md', body, state);
  assert.deepStrictEqual(fs.readFileSync(target), before);
});

test('managed-block: modified-foreign when block was hand-edited after last tracked write', () => {
  const dir = mkTempDir();
  const target = path.join(dir, 'CLAUDE.md');
  const writtenBody = '@AGENTS.md\n';
  const state = freshSyncState();
  fs.writeFileSync(target, sync.BLOCK_BEGIN + '\n' + writtenBody + sync.BLOCK_END + '\n', 'utf8');
  state.entries['CLAUDE.md'] = { kind: 'managed-block', content_digest: sync.digestTag(writtenBody) };

  // Human hand-edits inside the block without going through sync.js.
  const handEdited = sync.BLOCK_BEGIN + '\n' + '@AGENTS.md\nplus a hand-added line\n' + sync.BLOCK_END + '\n';
  fs.writeFileSync(target, handEdited, 'utf8');

  const before = fs.readFileSync(target);
  const status = sync.statusManagedBlock(target, 'CLAUDE.md', writtenBody, state);
  assert.strictEqual(status, 'modified-foreign');
  if (status === 'missing' || status === 'stale') sync.applyManagedBlock(target, 'CLAUDE.md', writtenBody, state);
  assert.deepStrictEqual(fs.readFileSync(target), before);
});

// ===========================================================================
// 5. Structural JSON-merge class (.claude/settings.json / .codex/hooks.json)
// ===========================================================================

const HOOK_PATH = ['hooks', 'SessionStart'];

function demoAsdEntries() {
  return [{ _asd: true, type: 'command', command: 'node .asd/hooks/session-start.js --provider claude' }];
}

test('json-merge: missing file -> apply creates it with only the owned entries', () => {
  const dir = mkTempDir();
  const target = path.join(dir, 'settings.json');
  const state = freshSyncState();
  const entries = demoAsdEntries();

  assert.strictEqual(sync.statusJsonMerge(target, 'settings.json', HOOK_PATH, entries, state), 'missing');
  sync.applyJsonMerge(target, 'settings.json', HOOK_PATH, entries, state);
  const parsed = JSON.parse(fs.readFileSync(target, 'utf8'));
  assert.deepStrictEqual(parsed.hooks.SessionStart, entries);
  assert.strictEqual(sync.statusJsonMerge(target, 'settings.json', HOOK_PATH, entries, state), 'current');
});

test('json-merge: unrelated keys are preserved BYTE-FOR-BYTE, including unusual formatting', () => {
  const dir = mkTempDir();
  const target = path.join(dir, 'settings.json');
  const state = freshSyncState();
  // Hand-written, deliberately NOT what our own JSON.stringify(_, null, 2)
  // would produce - 4-space indent, a compact one-line nested array, unusual
  // spacing after ':' - so any accidental reformatting is immediately
  // visible as a raw-string diff, not hidden behind a structural comparison.
  const raw = [
    '{',
    '    "$schema":   "https://example.com/schema.json",',
    '    "permissions": {"allow": ["Bash(git *)", "Bash(npm *)"]},',
    '    "hooks": {',
    '        "SessionStart": [',
    '            { "type": "command", "command": "my-own-script.sh" }',
    '        ]',
    '    }',
    '}',
    '',
  ].join('\n');
  fs.writeFileSync(target, raw, 'utf8');

  const entries = demoAsdEntries();
  assert.strictEqual(sync.statusJsonMerge(target, 'settings.json', HOOK_PATH, entries, state), 'missing');
  sync.applyJsonMerge(target, 'settings.json', HOOK_PATH, entries, state);

  const after = fs.readFileSync(target, 'utf8');
  const parsed = JSON.parse(after);

  // Byte-for-byte: everything OUTSIDE the hooks.SessionStart array's own
  // span - key order, 4-space indent, the compact "allow" array, the
  // unusual spacing after "$schema": - survives exactly as typed.
  assert.ok(after.startsWith('{\n    "$schema":   "https://example.com/schema.json",\n    "permissions": {"allow": ["Bash(git *)", "Bash(npm *)"]},\n    "hooks": {\n        "SessionStart": '), 'everything before the owned array must be byte-identical to the original, unusual formatting included');
  assert.ok(after.endsWith('\n    }\n}\n'), 'everything after the owned array must be byte-identical to the original');

  assert.deepStrictEqual(parsed.permissions, { allow: ['Bash(git *)', 'Bash(npm *)'] });
  assert.deepStrictEqual(
    parsed.hooks.SessionStart,
    [{ type: 'command', command: 'my-own-script.sh' }, ...entries],
    'foreign hook entries must be kept alongside the ASD-owned ones'
  );
});

test('json-merge: a leading BOM on the target file survives untouched', () => {
  const dir = mkTempDir();
  const target = path.join(dir, 'settings.json');
  const state = freshSyncState();
  const raw = '﻿' + JSON.stringify({ permissions: { allow: ['Bash(git *)'] } }, null, 2) + '\n';
  fs.writeFileSync(target, raw, 'utf8');

  sync.applyJsonMerge(target, 'settings.json', HOOK_PATH, demoAsdEntries(), state);

  const after = fs.readFileSync(target, 'utf8');
  assert.strictEqual(after.charCodeAt(0), 0xfeff, 'leading BOM must survive the merge');
});

test('json-merge: EACH foreign array element keeps its own exact bytes, even with unusual internal formatting', () => {
  const dir = mkTempDir();
  const target = path.join(dir, 'settings.json');
  const state = freshSyncState();
  // Two foreign hook entries, deliberately formatted differently from each
  // other and from anything our own JSON.stringify(_, null, 2) would ever
  // produce - proves per-ELEMENT preservation, not just per-key.
  const raw = [
    '{',
    '  "hooks": {',
    '    "SessionStart": [',
    '      {"type": "command", "command": "compact-one-liner.sh"},',
    '      {',
    '        "type":    "command",',
    '        "command": "spaced-out-multiline.sh",',
    '        "timeout": 30',
    '      }',
    '    ]',
    '  }',
    '}',
    '',
  ].join('\n');
  fs.writeFileSync(target, raw, 'utf8');

  sync.applyJsonMerge(target, 'settings.json', HOOK_PATH, demoAsdEntries(), state);
  const after = fs.readFileSync(target, 'utf8');

  assert.ok(after.includes('{"type": "command", "command": "compact-one-liner.sh"}'), 'first foreign element must survive byte-for-byte, compact form and all');
  assert.ok(after.includes('"type":    "command",\n        "command": "spaced-out-multiline.sh",\n        "timeout": 30'), 'second foreign element must survive byte-for-byte, unusual spacing and all');
});

test('json-merge: missing key path is spliced in, not a whole-document reformat', () => {
  const dir = mkTempDir();
  const target = path.join(dir, 'settings.json');
  const state = freshSyncState();
  // "hooks" itself is absent - a project with settings.json that predates
  // ASD. 4-space indent, deliberately non-standard so a full reformat would
  // be immediately visible.
  const raw = [
    '{',
    '    "$schema": "https://example.com/schema.json",',
    '    "permissions": {"allow": ["Bash(git *)"]}',
    '}',
    '',
  ].join('\n');
  fs.writeFileSync(target, raw, 'utf8');

  assert.strictEqual(sync.statusJsonMerge(target, 'settings.json', HOOK_PATH, demoAsdEntries(), state), 'missing');
  sync.applyJsonMerge(target, 'settings.json', HOOK_PATH, demoAsdEntries(), state);

  const after = fs.readFileSync(target, 'utf8');
  const parsed = JSON.parse(after);
  assert.ok(after.startsWith('{\n    "$schema": "https://example.com/schema.json",\n    "permissions": {"allow": ["Bash(git *)"]}'), 'everything before the insertion point must survive byte-for-byte, unusual indent included');
  assert.deepStrictEqual(parsed.hooks.SessionStart, demoAsdEntries());
});

test('json-merge: invalid pre-existing JSON with --force still aborts the WHOLE runApply batch before any write', () => {
  const root = makeMiniRepo();
  writeAgentCanon(root, 'good-agent', GOOD_AGENT_CANON);
  const goodTargetRel = '.claude/agents/good-agent.md';
  const settingsRel = '.claude/settings.json';

  // .claude/settings.json is a real plan target (buildSyncPlan always
  // includes it) - make it invalid JSON, so its status is 'modified-foreign'
  // (statusJsonMerge is try/catch-safe) but a forced overwrite requires
  // actually rendering it, which must throw.
  const settingsAbs = path.join(root, '.claude', 'settings.json');
  fs.mkdirSync(path.dirname(settingsAbs), { recursive: true });
  fs.writeFileSync(settingsAbs, '{ not valid json', 'utf8');

  const check = sync.runCheck(root);
  assert.strictEqual(check.find((i) => i.target === settingsRel).status, 'modified-foreign');

  // good-agent.md would render and write fine on its own - proves the good
  // target was never written just because the preflight loop reached it
  // before the broken one.
  assert.throws(
    () => sync.runApply(root, [goodTargetRel, settingsRel], { force: [settingsRel] }),
    /Unexpected token|JSON/
  );
  assert.strictEqual(fs.existsSync(path.join(root, goodTargetRel)), false, 'no partial write when a later force-targeted item is invalid JSON');
  assert.strictEqual(fs.readFileSync(settingsAbs, 'utf8'), '{ not valid json', 'the invalid file itself must be untouched');
});

test('json-merge: statusJsonMerge stays safe (modified-foreign) on invalid JSON even though renderJsonMerge throws', () => {
  const dir = mkTempDir();
  const target = path.join(dir, 'settings.json');
  fs.writeFileSync(target, '{ not valid json', 'utf8');
  const state = freshSyncState();

  assert.strictEqual(sync.statusJsonMerge(target, 'settings.json', HOOK_PATH, demoAsdEntries(), state), 'modified-foreign');
  assert.throws(() => sync.renderJsonMerge(target, HOOK_PATH, demoAsdEntries()));
});

test('json-merge: stale when tracked owned entries differ from a fresh render', () => {
  const dir = mkTempDir();
  const target = path.join(dir, 'settings.json');
  const state = freshSyncState();
  const oldEntries = [{ _asd: true, type: 'command', command: 'node .asd/hooks/session-start.js --provider claude --old' }];
  const newEntries = demoAsdEntries();

  fs.writeFileSync(target, JSON.stringify({ hooks: { SessionStart: oldEntries } }, null, 2) + '\n', 'utf8');
  state.entries['settings.json'] = { kind: 'json-merge', content_digest: sync.digestTag(sync.stableStringify(oldEntries)) };

  assert.strictEqual(sync.statusJsonMerge(target, 'settings.json', HOOK_PATH, newEntries, state), 'stale');
  sync.applyJsonMerge(target, 'settings.json', HOOK_PATH, newEntries, state);
  assert.strictEqual(sync.statusJsonMerge(target, 'settings.json', HOOK_PATH, newEntries, state), 'current');

  const before = fs.readFileSync(target);
  sync.applyJsonMerge(target, 'settings.json', HOOK_PATH, newEntries, state);
  const after = fs.readFileSync(target);
  assert.deepStrictEqual(after, before, 'second sync run on already-current owned entries is a zero-byte no-op');
});

test('json-merge: modified-foreign when owned-looking entries exist but sync-state has no record', () => {
  const dir = mkTempDir();
  const target = path.join(dir, 'settings.json');
  const state = freshSyncState();
  fs.writeFileSync(target, JSON.stringify({ hooks: { SessionStart: demoAsdEntries() } }, null, 2) + '\n', 'utf8');

  const before = fs.readFileSync(target);
  const status = sync.statusJsonMerge(target, 'settings.json', HOOK_PATH, demoAsdEntries(), state);
  assert.strictEqual(status, 'modified-foreign');
  if (status === 'missing' || status === 'stale') sync.applyJsonMerge(target, 'settings.json', HOOK_PATH, demoAsdEntries(), state);
  assert.deepStrictEqual(fs.readFileSync(target), before);
});

test('json-merge: invalid JSON target fails closed (treated as foreign, never parsed/written)', () => {
  const dir = mkTempDir();
  const target = path.join(dir, 'settings.json');
  fs.writeFileSync(target, '{ this is not json', 'utf8');
  const state = freshSyncState();
  const status = sync.statusJsonMerge(target, 'settings.json', HOOK_PATH, demoAsdEntries(), state);
  assert.strictEqual(status, 'modified-foreign');
});

// ===========================================================================
// 6. Path safety
// ===========================================================================

test('isSafeRelPath rejects traversal, absolute, drive, and UNC paths; accepts plain relative paths', () => {
  assert.strictEqual(sync.isSafeRelPath('agents/demo.md'), true);
  assert.strictEqual(sync.isSafeRelPath('../escape.md'), false);
  assert.strictEqual(sync.isSafeRelPath('agents/../../escape.md'), false);
  assert.strictEqual(sync.isSafeRelPath('/etc/passwd'), false);
  assert.strictEqual(sync.isSafeRelPath('C:\\Windows\\system.ini'), false);
  assert.strictEqual(sync.isSafeRelPath('\\\\server\\share\\file'), false);
  assert.strictEqual(sync.isSafeRelPath('//server/share/file'), false);
});

test('symlinked target is treated as foreign for full-file, managed-block and json-merge', () => {
  const dir = mkTempDir();
  const realFile = path.join(dir, 'real.md');
  const linkFile = path.join(dir, 'link.md');
  fs.writeFileSync(realFile, 'irrelevant', 'utf8');
  let symlinkSupported = true;
  try {
    fs.symlinkSync(realFile, linkFile, 'file');
  } catch (_) {
    symlinkSupported = false; // e.g. Windows without dev mode / elevated perms
  }
  if (!symlinkSupported) {
    console.log('  (skipped symlink assertions: fs.symlinkSync unsupported in this environment)');
    return;
  }
  assert.strictEqual(sync.statusFullFile(linkFile, 'irrelevant-digest'), 'foreign');
  assert.strictEqual(sync.statusManagedBlock(linkFile, 'link.md', 'body', freshSyncState()), 'foreign');
  assert.strictEqual(sync.statusJsonMerge(linkFile, 'link.md', HOOK_PATH, [], freshSyncState()), 'foreign');
});

// ===========================================================================
// 7. release-manifest / sync-state schema_version fail-closed
// ===========================================================================

test('unknown release-manifest schema_version fails closed', () => {
  const dir = mkTempDir();
  fs.mkdirSync(path.join(dir, '.asd'));
  fs.writeFileSync(
    path.join(dir, '.asd', 'release-manifest.json'),
    JSON.stringify({ schema_version: 999, asd_version: '0.0.0', model_families: {} }),
    'utf8'
  );
  assert.throws(() => sync.loadReleaseManifest(dir), /schema_version 999.*not supported/);
});

test('unknown sync-state schema_version fails closed', () => {
  const dir = mkTempDir();
  fs.mkdirSync(path.join(dir, '.asd'));
  fs.writeFileSync(path.join(dir, '.asd', 'sync-state.json'), JSON.stringify({ schema_version: 999, entries: {} }), 'utf8');
  assert.throws(() => sync.loadSyncState(dir), /schema_version 999.*not supported/);
});

test("this repo's own release-manifest.json and sync-state.json load cleanly", () => {
  const manifest = sync.loadReleaseManifest(REPO_ROOT);
  assert.strictEqual(manifest.schema_version, 1);
  assert.ok(manifest.model_families.claude.opus);
  assert.ok(manifest.model_families.codex.sol);
  const state = sync.loadSyncState(REPO_ROOT);
  assert.strictEqual(state.schema_version, 1);
});

// ===========================================================================
// 8. update.js state machine (classifyUpdateItem)
// ===========================================================================

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

// ===========================================================================
// 9. sync.js --check CLI is green with no real canon trees yet (Stage 0)
// ===========================================================================

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

// ===========================================================================
// 9a. Read-only agent contract (AC-6): the 5 reviewers + asd-advisor must
// never carry a write tool and must declare sandbox_mode read-only on Codex.
// Directory-driven (derives the read-only set from .asd/agents/ filenames,
// not a hardcoded list) so a future 7th read-only agent is covered for free.
// Count updated 9 -> 6 for sprint 004's reviewer-merge roster (AC-7/AC-11):
// asd-advisor, asd-external-review, asd-reviewer-correctness,
// asd-reviewer-documentation, asd-reviewer-efficiency, asd-reviewer-testing.
// ===========================================================================

test('read-only agents (5 reviewers + asd-advisor): no Write/Edit tool, codex sandbox_mode read-only', () => {
  const agentsDir = path.join(REPO_ROOT, '.asd', 'agents');
  const files = fs.readdirSync(agentsDir).filter((f) => f.endsWith('.md'));
  const readOnlyNames = files
    .map((f) => f.slice(0, -3))
    .filter((name) => name === 'asd-external-review' || name === 'asd-advisor' || name.startsWith('asd-reviewer-'));
  assert.strictEqual(readOnlyNames.length, 6, `expected 6 read-only agents (5 reviewers + advisor), found ${readOnlyNames.length}: ${readOnlyNames.join(', ')}`);
  for (const name of readOnlyNames) {
    const raw = sync.readNormalized(path.join(agentsDir, `${name}.md`));
    const { meta } = sync.parseCanonicalFrontmatter(raw);
    // Assert tools is an EXPLICIT allowlist before checking absence below - a
    // Claude subagent with no explicit claude.tools inherits the full parent
    // tool set (incl. Write/Edit/Bash), so a deleted `tools` key would make
    // the absence assertions below pass vacuously against a fallback [].
    assert.ok(Array.isArray(meta.claude && meta.claude.tools), `${name}: claude.tools must be an explicit allowlist`);
    const claudeTools = meta.claude.tools;
    assert.ok(!claudeTools.includes('Write'), `${name}: claude.tools must not include "Write"`);
    assert.ok(!claudeTools.includes('Edit'), `${name}: claude.tools must not include "Edit"`);
    // asd-external-review is the one read-only agent that legitimately needs
    // Bash: it invokes the wrapped Codex CLI as a subprocess (`codex exec
    // --sandbox read-only -`), which is not itself a write capability.
    if (name !== 'asd-external-review') {
      assert.ok(!claudeTools.includes('Bash'), `${name}: claude.tools must not include "Bash"`);
    }
    assert.strictEqual(meta.codex && meta.codex.sandbox_mode, 'read-only', `${name}: codex.sandbox_mode must be "read-only"`);
  }
});

// ===========================================================================
// 9b. Roster-count guard (AC-7): README.md / AGENTS.md's stated agent count
// must match the actual number of files under .asd/agents/ - directory-driven,
// same pattern as the sync-plan coverage guard above (section 9), so a future
// added/removed agent fails loud here instead of only via manual review.
// ===========================================================================

test('README.md / AGENTS.md agent-count claims match the actual .asd/agents/*.md file count', () => {
  const agentsDir = path.join(REPO_ROOT, '.asd', 'agents');
  const actualCount = fs.readdirSync(agentsDir).filter((f) => f.endsWith('.md')).length;

  const readmeText = fs.readFileSync(path.join(REPO_ROOT, 'README.md'), 'utf8');

  const readmeMatch = readmeText.match(/dispatches (\d+) specialized agents/);
  assert.ok(readmeMatch, 'README.md must state "dispatches N specialized agents"');
  assert.strictEqual(Number(readmeMatch[1]), actualCount, `README.md claims ${readmeMatch[1]} agents, .asd/agents/ has ${actualCount}`);

  // Word-form count in the "## Agents" section intro. A plain literal match
  // on the current word (not a general number-word parser) - it's a guard
  // against silent drift, not a parser: bumping the count must also bump
  // this literal, or the assertion fails loud instead of staying vacuous.
  const WORD_TO_NUMBER = { Eleven: 11, Twelve: 12, Fourteen: 14, Fifteen: 15, Sixteen: 16, Seventeen: 17, Eighteen: 18 };
  const wordMatch = readmeText.match(/(\w+) specialized agents are canonically defined/);
  assert.ok(wordMatch, 'README.md must state "<Word> specialized agents are canonically defined"');
  assert.ok(Object.prototype.hasOwnProperty.call(WORD_TO_NUMBER, wordMatch[1]), `README.md word-form agent count "${wordMatch[1]}" is not in the known word->number map - update the map or the wording`);
  assert.strictEqual(WORD_TO_NUMBER[wordMatch[1]], actualCount, `README.md claims "${wordMatch[1]}" agents, .asd/agents/ has ${actualCount}`);

  const specsMatch = readmeText.match(/(\d+) canonical agent specs/);
  assert.ok(specsMatch, 'README.md folder map must state "N canonical agent specs"');
  assert.strictEqual(Number(specsMatch[1]), actualCount, `README.md folder map claims ${specsMatch[1]} agent specs, .asd/agents/ has ${actualCount}`);

  const generatedAgentCount = sync.buildSyncPlan(REPO_ROOT).filter((item) => item.kind === 'agent-claude').length;
  const definitionMatches = [...readmeText.matchAll(/(\d+) agent definitions/g)];
  assert.strictEqual(definitionMatches.length, 2, `README.md folder map must state "N agent definitions" exactly twice (one per provider view), found ${definitionMatches.length}`);
  for (const m of definitionMatches) {
    assert.strictEqual(Number(m[1]), generatedAgentCount, `README.md folder map claims ${m[1]} agent definitions, generated provider roster has ${generatedAgentCount}`);
  }

  const agentsMdText = fs.readFileSync(path.join(REPO_ROOT, 'AGENTS.md'), 'utf8');
  const agentsMdMatch = agentsMdText.match(/\*\*Agents\*\* \(`\.asd\/agents\/\*\.md`, canonical\) — (\d+):/);
  assert.ok(agentsMdMatch, 'AGENTS.md must state "**Agents** (`.asd/agents/*.md`, canonical) — N:"');
  assert.strictEqual(Number(agentsMdMatch[1]), actualCount, `AGENTS.md claims ${agentsMdMatch[1]} agents, .asd/agents/ has ${actualCount}`);
});

// ===========================================================================
// 9c. release-manifest.json canon_hashes completeness for the agents tree
// (T-5): the existing "every recorded entry matches its file" check (6b) is
// vacuous for a MISSING entry - exactly the risk a new agent file introduces.
// Assert every .asd/agents/*.md file has a canon_hashes["agents/<name>.md"]
// entry (not the reverse - a stale-but-present entry for a deleted file is
// already caught by 6b, since sync.js's normalizeText read would throw).
// ===========================================================================

test('release-manifest.json canon_hashes has an entry for every .asd/agents/*.md file', () => {
  const manifest = loadManifest();
  const agentsDir = path.join(REPO_ROOT, '.asd', 'agents');
  const missing = fs
    .readdirSync(agentsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => `agents/${f}`)
    .filter((key) => !(key in (manifest.canon_hashes || {})));
  assert.deepStrictEqual(missing, [], `canon_hashes missing entries for: ${missing.join(', ')}`);
});

// ===========================================================================
// 10. update.js driver (fetch-classify-report-apply layer wrapping
//     classifyUpdateItem - Stage 0 only unit-tested the pure function, not
//     the file-system driver). "Upstream" is simulated as a second local
//     temp directory; no real network fetch happens in these tests.
// ===========================================================================

function writeFile(root, relPath, content) {
  const abs = path.join(root, ...relPath.split('/'));
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf8');
}

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

// ===========================================================================
// 11. sync.js orphan detection (plan.md Task 12, AC-14): generated views whose
// canonical source no longer exists. Marker-gated - only a file carrying the
// ASD ownership marker may ever be deleted; an unmarked file sharing the same
// path is indistinguishable from a consumer's own hand-authored agent/skill
// and must survive untouched. Built on makeMiniRepo() (empty .asd/agents), so
// ANY file dropped into one of the four generated trees is automatically
// unexpected by buildSyncPlan() - no need to first delete a real canon source.
// ===========================================================================

// Builds ownership-marker-bearing file content for a generated-view fixture.
// 'md' format needs the marker on line 2 (after the opening '---' fence,
// splitMarkerAndBody's frontmatter-safe convention); 'toml' keeps it as the
// literal first line. Uses the real buildFullFileMarker/sha256Hex so this
// stays byte-compatible with whatever sync.js itself considers a valid
// marker, instead of hand-rolling a regex-matching string that could drift.
function markedFileContent(format, manifest) {
  const marker = sync.buildFullFileMarker({
    format,
    sourceRelPath: 'agents/retired-fixture-agent.md',
    sourceDigest: sync.sha256Hex('fixture-source'),
    contentDigest: sync.sha256Hex('fixture-content'),
    asdVersion: manifest.asd_version,
  });
  if (format === 'md') return '---\n' + marker + '\nbody\n---\nrest of body\n';
  return marker + '\nbody\n';
}

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

// ===========================================================================
// 12. update.js migration runner (listMigrations/pendingMigrations/
// runMigrations, Task 13, AC-12) - ordering, skip-already-applied,
// stop-on-first-failure, no-migrations-needed, and fresh-tree loading.
// Fixture migrations are plain Node scripts written directly under
// <root>/.asd/migrations/<version>.js - no network, same local-fixture
// convention already used for the update driver above.
// ===========================================================================

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

// ===========================================================================
// 13. .asd/migrations/4.0.0.js (Task 14, AC-7/AC-10/AC-11 roster cleanup) -
// the sprint's one piece of destructive, outside-managed_paths code. Fixture
// repos carry a real copy of .asd/sync.js (the migration requires it from
// ctx.repoRoot, not from this test file's own location) so hasOwnershipMarker/
// readNormalized/writeNormalized behave exactly as in a real consumer tree.
// ===========================================================================

function makeMigrationFixtureRepo() {
  const root = mkTempDir();
  fs.mkdirSync(path.join(root, '.asd'), { recursive: true });
  fs.writeFileSync(path.join(root, '.asd', 'sync.js'), fs.readFileSync(path.join(REPO_ROOT, '.asd', 'sync.js'), 'utf8'), 'utf8');
  return root;
}

// Stub engine lacking removeIfEmptyDir entirely - stands in for a consumer's
// pre-4.0.0 sync.js, the shape the migration's own local fallback must handle.
function makeMigrationFixtureRepoWithPreRemoveIfEmptyDirSync() {
  const root = mkTempDir();
  fs.mkdirSync(path.join(root, '.asd'), { recursive: true });
  fs.writeFileSync(path.join(root, '.asd', 'sync.js'), [
    "module.exports = {",
    "  hasOwnershipMarker: () => true,",
    "  readNormalized: (p) => require('fs').readFileSync(p, 'utf8'),",
    "  writeNormalized: (p, c) => require('fs').writeFileSync(p, c, 'utf8'),",
    "};",
  ].join('\n'), 'utf8');
  return root;
}

test('4.0.0 migration: falls back to a local removeIfEmptyDir when the consumer\'s sync.js predates the helper - delete still completes, directory still pruned', async () => {
  const root = makeMigrationFixtureRepoWithPreRemoveIfEmptyDirSync();
  const skillName = 'asd-test-engineer';
  const skillAbs = path.join(root, '.agents', 'skills', skillName, 'SKILL.md');
  const skillDirAbs = path.dirname(skillAbs);
  fs.mkdirSync(skillDirAbs, { recursive: true });
  fs.writeFileSync(skillAbs, 'stub hasOwnershipMarker always returns true for this fixture\n', 'utf8');

  const report = await migration400({ repoRoot: root });

  assert.ok(report.deleted.includes(`.agents/skills/${skillName}/SKILL.md`));
  assert.strictEqual(fs.existsSync(skillAbs), false);
  assert.strictEqual(fs.existsSync(skillDirAbs), false, 'the local fallback must still prune the now-empty directory, never leave a half-applied delete');
});

test('4.0.0 migration (AC-7/AC-10/AC-11): deletes marked generated views of a retired agent, including the per-skill directory once emptied; a missing target is success; a surviving non-retired sibling is untouched; re-running is a no-op', async () => {
  const root = makeMigrationFixtureRepo();
  const manifest = loadManifest();
  const name = 'asd-reviewer-quality'; // one of the nine retired agent names
  const claudeAbs = path.join(root, '.claude', 'agents', `${name}.md`);
  const codexAbs = path.join(root, '.codex', 'agents', `${name}.toml`);
  // The third target (.agents/skills/<name>/SKILL.md) is deliberately left
  // absent, to prove a missing target is reported as success, not failure.
  fs.mkdirSync(path.dirname(claudeAbs), { recursive: true });
  fs.writeFileSync(claudeAbs, markedFileContent('md', manifest), 'utf8');
  fs.mkdirSync(path.dirname(codexAbs), { recursive: true });
  fs.writeFileSync(codexAbs, markedFileContent('toml', manifest), 'utf8');

  // A second retired agent's skill target, to exercise the directory-prune
  // branch (removeIfEmptyDir on the per-skill dir once its one file is gone),
  // alongside a surviving non-retired sibling agent in the SAME .claude/agents
  // tree, proving the delete never widens beyond its explicit target list.
  const skillName = 'asd-test-engineer';
  const skillAbs = path.join(root, '.agents', 'skills', skillName, 'SKILL.md');
  const skillDirAbs = path.dirname(skillAbs);
  fs.mkdirSync(skillDirAbs, { recursive: true });
  fs.writeFileSync(skillAbs, markedFileContent('md', manifest), 'utf8');
  const survivingSiblingAbs = path.join(root, '.claude', 'agents', 'asd-dev.md');
  fs.writeFileSync(survivingSiblingAbs, '# a current, non-retired agent living alongside deleted ones\n', 'utf8');

  const report = await migration400({ repoRoot: root });
  assert.ok(report.deleted.includes(`.claude/agents/${name}.md`));
  assert.ok(report.deleted.includes(`.codex/agents/${name}.toml`));
  assert.ok(report.deleted.includes(`.agents/skills/${skillName}/SKILL.md`));
  assert.ok(report.missing.includes(`.agents/skills/${name}/SKILL.md`));
  assert.strictEqual(fs.existsSync(claudeAbs), false);
  assert.strictEqual(fs.existsSync(codexAbs), false);
  assert.strictEqual(fs.existsSync(skillAbs), false);
  assert.strictEqual(fs.existsSync(skillDirAbs), false, 'the emptied per-skill directory must be pruned');
  assert.strictEqual(fs.existsSync(survivingSiblingAbs), true, 'a surviving non-retired sibling in the same generated tree must never be touched');

  // Idempotency: re-running after everything is already gone is success, never an error.
  const rerun = await migration400({ repoRoot: root });
  assert.deepStrictEqual(rerun.deleted, []);
  assert.ok(rerun.missing.includes(`.claude/agents/${name}.md`));
});

test('4.0.0 migration: leaves an unmarked (consumer-owned) file sharing a retired agent name untouched', async () => {
  const root = makeMigrationFixtureRepo();
  const name = 'asd-ux-designer';
  const claudeAbs = path.join(root, '.claude', 'agents', `${name}.md`);
  fs.mkdirSync(path.dirname(claudeAbs), { recursive: true });
  const handAuthored = "# hand-authored, no ownership marker - a consumer coincidentally reused this name\n";
  fs.writeFileSync(claudeAbs, handAuthored, 'utf8');

  const report = await migration400({ repoRoot: root });
  assert.ok(report.skippedUnmarked.includes(`.claude/agents/${name}.md`));
  assert.strictEqual(fs.readFileSync(claudeAbs, 'utf8'), handAuthored, "consumer-owned file must survive byte-for-byte");
});

// Shaped like a real /asd-init-generated commands.yaml (t_commands.yaml): a
// COMMENTED `# test_affected:` line living above `custom:`. The active-vs-
// comment distinction is exactly what /^test_affected\s*:/m must tell apart -
// every real consumer's file carries this commented line, never none at all.
function realisticCommandsYaml() {
  return [
    'test: "npm test"',
    'lint: "eslint ."',
    'build: "npm run build"',
    'run: "npm start"',
    '',
    '# test_affected: "{{command to run only tests affected since <BASE_REF>, e.g. jest --changedSince=<BASE_REF>}}"',
    '',
    'custom:',
    '  something: true',
    '',
  ].join('\n');
}

test('4.0.0 migration (AC-5): adds test_affected to a realistic commands.yaml (commented placeholder line present) additively when a supported test runner is detected; never touches config.yaml/sprints/custom rules', async () => {
  const root = makeMigrationFixtureRepo();
  fs.mkdirSync(path.join(root, '.asd', 'project'), { recursive: true });
  const commandsYamlBefore = realisticCommandsYaml();
  fs.writeFileSync(path.join(root, '.asd', 'project', 'commands.yaml'), commandsYamlBefore, 'utf8');
  fs.writeFileSync(path.join(root, '.asd', 'project', 'config.yaml'), 'language:\n  chat: en\n', 'utf8');
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ devDependencies: { jest: '^29.0.0' } }), 'utf8');
  const configYamlBefore = fs.readFileSync(path.join(root, '.asd', 'project', 'config.yaml'), 'utf8');

  const report = await migration400({ repoRoot: root });
  assert.strictEqual(report.commandsYaml.status, 'added');
  assert.strictEqual(report.commandsYaml.value, 'jest --changedSince=<BASE_REF>');
  const commandsYamlAfter = fs.readFileSync(path.join(root, '.asd', 'project', 'commands.yaml'), 'utf8');
  const activeLines = commandsYamlAfter.split('\n').filter((l) => /^test_affected\s*:/.test(l));
  assert.strictEqual(activeLines.length, 1, 'exactly one ACTIVE test_affected line, the pre-existing commented one must not count');
  assert.ok(commandsYamlAfter.includes('test_affected: "jest --changedSince=<BASE_REF>"'));
  assert.ok(commandsYamlAfter.includes('# test_affected:'), 'the original commented placeholder line must survive untouched');
  assert.ok(commandsYamlAfter.includes('test: "npm test"'), 'pre-existing test command must survive');
  assert.ok(commandsYamlAfter.includes('something: true'), 'pre-existing custom block content must survive');
  assert.strictEqual(fs.readFileSync(path.join(root, '.asd', 'project', 'config.yaml'), 'utf8'), configYamlBefore, 'config.yaml must never be touched');

  // Additive-only guarantee: a second run must never overwrite the now-present field.
  const rerun = await migration400({ repoRoot: root });
  assert.strictEqual(rerun.commandsYaml.status, 'already-present');
});

test('4.0.0 migration: commands.yaml test_affected -> "undetectable" when no supported test runner is present, file left byte-for-byte untouched', async () => {
  const root = makeMigrationFixtureRepo();
  fs.mkdirSync(path.join(root, '.asd', 'project'), { recursive: true });
  const commandsYamlBefore = realisticCommandsYaml();
  fs.writeFileSync(path.join(root, '.asd', 'project', 'commands.yaml'), commandsYamlBefore, 'utf8');
  // No package.json/pyproject.toml/requirements*.txt at all - nothing to detect.

  const report = await migration400({ repoRoot: root });
  assert.strictEqual(report.commandsYaml.status, 'undetectable');
  assert.strictEqual(fs.readFileSync(path.join(root, '.asd', 'project', 'commands.yaml'), 'utf8'), commandsYamlBefore, 'no supported runner detected -> file must be left untouched, never a guessed value');
});

test('4.0.0 migration: commands.yaml test_affected -> "missing" status when the file does not exist at all', async () => {
  const root = makeMigrationFixtureRepo();
  const report = await migration400({ repoRoot: root });
  assert.strictEqual(report.commandsYaml.status, 'missing');
});

test('4.0.0 migration: reports (never rewrites) an active sprint sitting in a review phase', async () => {
  const root = makeMigrationFixtureRepo();
  const sprintDir = path.join(root, '.asd', 'sprints', '999-fixture');
  fs.mkdirSync(sprintDir, { recursive: true });
  const stateBefore = JSON.stringify({
    sprint_id: '999-fixture',
    phase: 'impl-review',
    reviews: { impl: { verdicts: { 'iter-01': { quality: 'APPROVE' } } } },
  });
  fs.writeFileSync(path.join(sprintDir, 'state.json'), stateBefore, 'utf8');

  const report = await migration400({ repoRoot: root });
  assert.ok(report.activeReviewSprints.includes('999-fixture'));
  assert.strictEqual(fs.readFileSync(path.join(sprintDir, 'state.json'), 'utf8'), stateBefore, 'state.json must never be rewritten by the migration');
});

// ===========================================================================
// 6b. release-manifest.json integrity: canon_hashes/upstream_hashes must
// match the files they claim to describe - not just look like a checksum.
// A stale ledger entry means the very NEXT real upstream release will
// misclassify an untouched consumer file as a conflict (or, for canon_hashes,
// silently hide the fact that a canon source changed).
// ===========================================================================

test('release-manifest.json: every canon_hashes entry matches the actual file (relative to .asd/)', () => {
  const manifest = loadManifest();
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

// ===========================================================================
// 6c. .asd/templates/**/*.json must stay valid JSON - sync.js --check never
// parses .asd/templates/ (it only classifies generated provider-view
// targets), so nothing else in the pipeline would catch a template edit that
// broke JSON syntax (e.g. a stray trailing comma left behind when deleting a
// field). Placeholders like "{{SPRINT_ID}}" are quoted string values, so a
// well-formed template parses fine as-is - this only guards syntax, not
// placeholder semantics. Recursive: templates live in subdirectories too
// (e.g. external-review/), and a top-level-only scan would silently skip them
// (testing F3, sprint 006 iter-02: this is exactly how t_review-scope.json
// shipped missing exclude_paths[] undetected).
// ===========================================================================

test('every .asd/templates/**/*.json file parses as valid JSON', () => {
  const templatesDir = path.join(REPO_ROOT, '.asd', 'templates');
  const jsonFiles = fs.readdirSync(templatesDir, { recursive: true }).filter((f) => f.endsWith('.json'));
  assert.ok(jsonFiles.length > 1, 'sanity: at least one nested template JSON file must exist for the recursive scan to mean anything');
  for (const f of jsonFiles) {
    const abs = path.join(templatesDir, f);
    assert.doesNotThrow(() => JSON.parse(fs.readFileSync(abs, 'utf8')), `.asd/templates/${f} must parse as valid JSON`);
  }
});

test('AC-2/4/6/7: t_review-scope.json key set matches external-review.md\'s declared manifest fields exactly', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, '.asd/templates/external-review/t_review-scope.json'), 'utf8'));
  assert.deepStrictEqual(Object.keys(manifest).sort(), ['base_ref', 'exclude_paths', 'files', 'head_ref', 'iteration', 'phase'].sort(), 'manifest fields must exactly match external-review.md\'s declared set: phase, iteration, base_ref, head_ref, files[], exclude_paths[]');
  assert.ok(!Object.hasOwn(manifest, 'mode'), '"mode" was removed from the transport this wave and must never reappear');
  assert.ok(!Object.hasOwn(manifest, 'commits'), '"commits[]" was removed this wave in favor of files[] + base_ref/head_ref and must never reappear');
});

// ===========================================================================
// 7. SessionStart hook: --provider must change the printed skill form
// ===========================================================================

function runHook(provider) {
  const out = execFileSync('node', [path.join(REPO_ROOT, '.asd/hooks/session-start.js'), '--provider', provider], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  return JSON.parse(out).hookSpecificOutput.additionalContext;
}

test('SessionStart hook: Claude gets /asd-* slash-command form', () => {
  const text = runHook('claude');
  assert.ok(text.includes('/asd-sprint'), 'Claude Code has no $skill form - must see /asd-sprint');
  assert.ok(!text.includes('$asd-sprint'));
});

test('SessionStart hook: Codex gets $asd-* form, never a Claude-only slash command', () => {
  const text = runHook('codex');
  assert.ok(text.includes('$asd-sprint'), 'Codex has no /asd-sprint slash command - must see $asd-sprint');
  assert.ok(!text.includes('/asd-sprint'));
});

test('AC-2/4/5/6/7: SessionStart recovers only archived active sprints and reports conflicts', () => {
  const tempRoot = mkTempDir();
  const hookPath = path.join(tempRoot, '.asd/hooks/session-start.js');
  writeFile(tempRoot, '.asd/hooks/session-start.js', fs.readFileSync(path.join(REPO_ROOT, '.asd/hooks/session-start.js'), 'utf8'));
  writeFile(tempRoot, '.asd/sprints/archived/777-open/state.json', JSON.stringify({ sprint_id: '777-open', phase: 'pr', branch: 'sprint/777-open' }));
  writeFile(tempRoot, '.asd/sprints/archived/778-done/state.json', JSON.stringify({ sprint_id: '778-done', phase: 'done', branch: 'sprint/778-done' }));
  writeFile(tempRoot, '.asd/sprints/archived/779-bad/state.json', '{');
  const run = () => JSON.parse(execFileSync('node', [hookPath, '--provider', 'codex'], { cwd: tempRoot, encoding: 'utf8' })).hookSpecificOutput.additionalContext;
  const recovered = run();
  assert.ok(recovered.includes('Active sprint: 777-open'), `expected archived non-done sprint, got: ${recovered}`);
  assert.ok(!recovered.includes('778-done') && !recovered.includes('779-bad'));
  writeFile(tempRoot, '.asd/sprints/111-current/state.json', JSON.stringify({ sprint_id: '111-current', phase: 'impl', branch: 'sprint/111-current' }));
  const conflict = run();
  assert.ok(conflict.includes('WARNING: multiple active sprints found (111-current, 777-open)'), `expected active/archive conflict warning, got: ${conflict}`);
});

test('AC-2/4/6/7: review workflow contracts retain Correctness and incremental diff scope', () => {
  const workflow = fs.readFileSync(path.join(REPO_ROOT, '.asd/workflows/asd-phase-design-review.md'), 'utf8');
  const prompt = fs.readFileSync(path.join(REPO_ROOT, '.asd/templates/external-review/t_prompt-external-impl.md'), 'utf8');
  const designPrompt = fs.readFileSync(path.join(REPO_ROOT, '.asd/templates/external-review/t_prompt-external-design.md'), 'utf8');
  const implReview = fs.readFileSync(path.join(REPO_ROOT, '.asd/workflows/asd-phase-impl-review.md'), 'utf8');
  assert.ok(workflow.includes('Every internal reviewer is dispatched when not latch-skipped'));
  assert.ok(workflow.includes('reviewer still dispatches and is counted toward DoD'));
  assert.ok(prompt.includes('files[]') && prompt.includes('exclude_paths[]'), 'External Review now receives a files-mode scope manifest, not a rendered diff');
  assert.ok(prompt.includes('reviews.impl.iteration_heads["iter-(N-1)"]'), 'incremental scope guarantee (iter 2+ diffs from the prior iteration head) must survive the transport change');
  assert.ok(designPrompt.includes('files[]') && designPrompt.includes('exclude_paths[]'), 'design-review prompt must document the same files-mode scope manifest transport');
  assert.ok(designPrompt.includes('base_ref') && designPrompt.includes('head_ref') && designPrompt.includes('empty'), 'design-review prompt must document that base_ref/head_ref travel empty (draft-snapshot scope, not a commit range)');
  assert.ok(implReview.includes('run command') && !implReview.includes('via Bash'));
});

// iteration-3 review (sprint 006): exclude_paths[] bounds what the reviewer
// judges, not what it may read - a prior wording pass over-reached and
// implied the named project-context reference paths (PRD, ADR, stack, etc.)
// were unreadable. Guards the scope-vs-readability distinction against
// reappearing in any of the three places that state it.
test('AC-2/4/6/7: exclude_paths[] scope-vs-readability distinction holds in the rule doc and both prompts', () => {
  const rule = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/external-review.md'), 'utf8');
  const implPrompt = fs.readFileSync(path.join(REPO_ROOT, '.asd/templates/external-review/t_prompt-external-impl.md'), 'utf8');
  const designPrompt = fs.readFileSync(path.join(REPO_ROOT, '.asd/templates/external-review/t_prompt-external-design.md'), 'utf8');
  const carveOut = 'the project-context reference paths below, which are always readable and are never valid finding locations either';

  assert.ok(rule.includes('bounds what the reviewer judges, not what it may read'), 'external-review.md must state exclude_paths[] bounds judgment scope, not readability');
  assert.ok(rule.includes('stay readable regardless and are never valid finding locations either'), 'external-review.md must state the named project-context reference paths remain readable and are never findable-against');

  for (const [name, prompt, placeholders] of [
    ['impl', implPrompt, ['{{PRD_PATH}}', '{{ADR_PATH}}', '{{STACK_PATH}}', '{{CUSTOM_RULES_PATH}}', '{{COMMANDS_PATH}}']],
    ['design', designPrompt, ['{{CONCEPT_PATH}}', '{{CUSTOM_RULES_PATH}}', '{{ACCESSIBILITY_PATH}}']],
  ]) {
    assert.ok(prompt.includes(carveOut), `t_prompt-external-${name}.md must state the exclude_paths readability carve-out`);
    for (const ph of placeholders) {
      assert.ok(prompt.includes(ph), `t_prompt-external-${name}.md must still pass ${ph} as project context (readability carve-out is meaningless without it)`);
    }
  }
});

test('SessionStart hook: a "skipped: <predicate>" verdict counts as satisfied, not "mixed"', () => {
  // A fresh temp repo with its own copy of the hook, so resolveRepoRoot's
  // findUp(__dirname) walks up from the temp script location and finds this
  // temp .asd/ - never the real repo's own active sprint state.
  const tempRoot = mkTempDir();
  const hookSrc = fs.readFileSync(path.join(REPO_ROOT, '.asd/hooks/session-start.js'), 'utf8');
  writeFile(tempRoot, '.asd/hooks/session-start.js', hookSrc);
  writeFile(tempRoot, '.asd/sprints/999-fixture/state.json', JSON.stringify({
    sprint_id: '999-fixture',
    phase: 'impl-review',
    branch: 'feat/999-fixture',
    reviews: {
      impl: {
        iteration: 1,
        verdicts: {
          'iter-01': {
            quality: 'APPROVE',
            ui: 'skipped: no UI surface in scope',
            performance: 'skipped: no perf budgets section and no executable file in scope',
          },
        },
      },
    },
  }));
  const out = execFileSync('node', [path.join(tempRoot, '.asd/hooks/session-start.js'), '--provider', 'claude'], {
    cwd: tempRoot,
    encoding: 'utf8',
  });
  const text = JSON.parse(out).hookSpecificOutput.additionalContext;
  assert.ok(text.includes('Last review verdict: green'), `expected an all-satisfied verdict map (APPROVE + skipped) to print "green", got: ${text}`);
});

test('SessionStart hook: an availability-skip "APPROVE (skipped: <reason>)" or partial "APPROVE (partial: <n>/<m> files; <cause>)" value counts as satisfied - verdict map reads "green"', () => {
  const tempRoot = mkTempDir();
  const hookSrc = fs.readFileSync(path.join(REPO_ROOT, '.asd/hooks/session-start.js'), 'utf8');
  writeFile(tempRoot, '.asd/hooks/session-start.js', hookSrc);
  for (const external of ['APPROVE (skipped: codex quota exhausted)', 'APPROVE (partial: 25/40 files; codex timeout)']) {
    writeFile(tempRoot, '.asd/sprints/999-fixture/state.json', JSON.stringify({
      sprint_id: '999-fixture',
      phase: 'impl-review',
      branch: 'feat/999-fixture',
      reviews: { impl: { iteration: 1, verdicts: { 'iter-01': { correctness: 'APPROVE', external } } } },
    }));
    const out = execFileSync('node', [path.join(tempRoot, '.asd/hooks/session-start.js'), '--provider', 'claude'], {
      cwd: tempRoot,
      encoding: 'utf8',
    });
    const text = JSON.parse(out).hookSpecificOutput.additionalContext;
    assert.ok(text.includes('Last review verdict: green'), `External Review's "${external}" must count as satisfied (sprint-lifecycle.md "State recovery"), got: ${text}`);
  }
});

test('SessionStart hook: an all-legacy-"skipped:" verdict map (no bare APPROVE anywhere) reads "mixed", not "green"', () => {
  const tempRoot = mkTempDir();
  const hookSrc = fs.readFileSync(path.join(REPO_ROOT, '.asd/hooks/session-start.js'), 'utf8');
  writeFile(tempRoot, '.asd/hooks/session-start.js', hookSrc);
  writeFile(tempRoot, '.asd/sprints/999-fixture/state.json', JSON.stringify({
    sprint_id: '999-fixture',
    phase: 'impl-review',
    branch: 'feat/999-fixture',
    reviews: {
      impl: {
        iteration: 1,
        verdicts: {
          'iter-01': {
            ui: 'skipped: no UI surface in scope',
            performance: 'skipped: no perf budgets section and no executable file in scope',
          },
        },
      },
    },
  }));
  const out = execFileSync('node', [path.join(tempRoot, '.asd/hooks/session-start.js'), '--provider', 'claude'], {
    cwd: tempRoot,
    encoding: 'utf8',
  });
  const text = JSON.parse(out).hookSpecificOutput.additionalContext;
  assert.ok(text.includes('Last review verdict: mixed'), `an all-legacy-skip verdict map with no genuine approval must read "mixed", got: ${text}`);
});

test('AC-21: SessionStart reports "Next phase: await-user-closure" when pr.state is closure-pending', () => {
  const tempRoot = mkTempDir();
  const hookSrc = fs.readFileSync(path.join(REPO_ROOT, '.asd/hooks/session-start.js'), 'utf8');
  writeFile(tempRoot, '.asd/hooks/session-start.js', hookSrc);
  writeFile(tempRoot, '.asd/sprints/999-fixture/state.json', JSON.stringify({
    sprint_id: '999-fixture',
    phase: 'pr',
    branch: 'sprint/999-fixture',
    pr: { state: 'closure-pending' },
  }));
  const out = execFileSync('node', [path.join(tempRoot, '.asd/hooks/session-start.js'), '--provider', 'claude'], {
    cwd: tempRoot,
    encoding: 'utf8',
  });
  const text = JSON.parse(out).hookSpecificOutput.additionalContext;
  assert.ok(text.includes('Next phase: await-user-closure'), `expected the mandatory closure gate to report await-user-closure, got: ${text}`);
});

test('AC-21: SessionStart reports "Next phase: await-merge" for an ordinary pr phase without pr.state', () => {
  const tempRoot = mkTempDir();
  const hookSrc = fs.readFileSync(path.join(REPO_ROOT, '.asd/hooks/session-start.js'), 'utf8');
  writeFile(tempRoot, '.asd/hooks/session-start.js', hookSrc);
  writeFile(tempRoot, '.asd/sprints/999-fixture/state.json', JSON.stringify({
    sprint_id: '999-fixture',
    phase: 'pr',
    branch: 'sprint/999-fixture',
  }));
  const out = execFileSync('node', [path.join(tempRoot, '.asd/hooks/session-start.js'), '--provider', 'claude'], {
    cwd: tempRoot,
    encoding: 'utf8',
  });
  const text = JSON.parse(out).hookSpecificOutput.additionalContext;
  assert.ok(text.includes('Next phase: await-merge'), `expected the default pr-phase path to report await-merge, got: ${text}`);
});

test('sprint-013 AC-14: SessionStart reports "Next phase: plan" after audit exactly when every frozen design document is the boolean false - a legacy skip_design_phases moves nothing, a document true, absent or unseeded falls back to design, a non-object documents value never breaks the hook, and no other phase moves', () => {
  const template = JSON.parse(readRepoFile('.asd/templates/t_state.json'));
  const designDocs = Object.keys(template.documents || {}).filter((name) => name !== 'audit');
  assert.ok(designDocs.length >= 4, `t_state.json "documents" must still freeze the design documents the collapse test reads - only [${designDocs.join(', ')}] found, so the cases below assert nothing`);
  const off = Object.fromEntries(designDocs.map((name) => [name, false]));
  const hookSrc = readRepoFile('.asd/hooks/session-start.js');
  const cases = [
    ['audit', { documents: { audit: true, ...off } }, 'plan'],
    ['audit', { documents: off, skip_design_phases: true }, 'plan'],
    ...designDocs.map((doc) => ['audit', { documents: { ...off, [doc]: true }, skip_design_phases: true }, 'design']),
    ['audit', { documents: Object.fromEntries(designDocs.slice(1).map((name) => [name, false])) }, 'design'],
    ['audit', { documents: template.documents }, 'design'],
    ['audit', {}, 'design'],
    ['audit', { documents: null }, 'design'],
    ['audit', { documents: 'false' }, 'design'],
    ['scope', { documents: off }, 'audit'],
  ];
  const label = ([phase, fields, next]) => `${phase} + ${JSON.stringify(fields)} -> ${next}`;

  const observed = cases.map(([phase, fields]) => {
    const tempRoot = mkTempDir();
    writeFile(tempRoot, '.asd/hooks/session-start.js', hookSrc);
    writeFile(tempRoot, '.asd/sprints/999-fixture/state.json', JSON.stringify({ sprint_id: '999-fixture', phase, branch: 'sprint/999-fixture', ...fields }));
    const out = execFileSync('node', [path.join(tempRoot, '.asd/hooks/session-start.js'), '--provider', 'claude'], { cwd: tempRoot, encoding: 'utf8' });
    const next = /Next phase: (\S+)/.exec(JSON.parse(out).hookSpecificOutput.additionalContext);
    return label([phase, fields, next ? next[1] : '<no Next phase line>']);
  });

  assert.deepStrictEqual(observed, cases.map(label), 'the session hook must agree with the audit exit (sprint-lifecycle.md "Design/design-review/design-promote collapse"): plan only when every frozen design document is a bare false, whatever a legacy skip_design_phases says, and only while phase is audit - any other phase keeps its PHASE_CHAIN successor');
});

test('AC-7: no canonical rule, workflow, agent, or skill file references the retired asd-pm role', () => {
  const labels = ['rules', 'workflows', 'agents', 'skills'];
  const offenders = [];
  for (const label of labels) {
    const dir = path.join(REPO_ROOT, '.asd', label);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir, { recursive: true })) {
      if (!f.endsWith('.md')) continue;
      const text = fs.readFileSync(path.join(dir, f), 'utf8');
      if (/asd-pm/.test(text)) offenders.push(`${label}/${f}`);
    }
  }
  assert.deepStrictEqual(offenders, [], `canonical files still reference retired asd-pm: ${offenders.join(', ')}`);
});

// ===========================================================================
// 15. Sprint 006 deterministic runtime contracts
// ===========================================================================

function buildManifest(files, rules, sections) {
  return {
    files, rules, sections,
    n_a: {
      files: Object.fromEntries(files.map((id) => [id, [`no-${id}`]])),
      rules: Object.fromEntries(rules.map((id) => [id, [`no-${id}`]])),
      sections: Object.fromEntries(sections.map((id) => [id, [`no-${id}`]])),
    },
  };
}

function validCoverageFixture() {
  const manifest = buildManifest(['f-1'], ['r-1'], ['s-1']);
  manifest.digest = runtime.coverageManifestDigest(manifest);
  return {
    manifest,
    ledger: {
      manifest_digest: manifest.digest, findings: ['F-1'],
      files: [{ i: 'f-1', s: 'checked' }],
      rules: [{ i: 'r-1', s: 'finding', f: 'F-1' }],
      sections: [{ i: 's-1', s: 'reviewed' }],
    },
  };
}

test('AC-1/2: compact coverage ledger rejects identity, completeness, predicate, and finding-reference fraud', () => {
  const { manifest, ledger } = validCoverageFixture();
  assert.deepStrictEqual(runtime.validateCoverageLedger(manifest, ledger, ['F-1']), { ok: true });
  const cases = [
    ['wrong digest', () => { const x = structuredClone(ledger); x.manifest_digest = '0'.repeat(64); return x; }, /identity/],
    ['missing row', () => { const x = structuredClone(ledger); x.files = []; return x; }, /incomplete/],
    ['duplicate row', () => { const x = structuredClone(ledger); x.files.push({ i: 'f-1', s: 'checked' }); return x; }, /identity/],
    ['unknown row', () => { const x = structuredClone(ledger); x.files[0].i = 'unknown'; return x; }, /identity/],
    ['invalid n/a predicate', () => { const x = structuredClone(ledger); x.files[0] = { i: 'f-1', s: 'n/a', p: 'invented' }; return x; }, /predicate/],
    ['missing finding reference', () => { const x = structuredClone(ledger); x.rules[0] = { i: 'r-1', s: 'finding', f: 'F-2' }; return x; }, /finding reference/],
  ];
  for (const [label, makeLedger, message] of cases) assert.throws(() => runtime.validateCoverageLedger(manifest, makeLedger(), ['F-1']), message, label);
  const forgeryCases = [
    ['ledger claims an extra finding not actually raised', { findings: ['F-1', 'F-2'] }, ['F-1']],
    ['ledger claims a finding while none was actually raised', { findings: [] }, ['F-1']],
    ['ledger duplicates the same finding id', { findings: ['F-1', 'F-1'] }, ['F-1']],
  ];
  for (const [label, override, actualFindings] of forgeryCases) {
    const forged = structuredClone(ledger);
    Object.assign(forged, override);
    assert.throws(() => runtime.validateCoverageLedger(manifest, forged, actualFindings), /ledger findings invalid/, label);
  }
  const duplicateManifest = structuredClone(manifest);
  duplicateManifest.files.push('f-1');
  duplicateManifest.digest = runtime.coverageManifestDigest(duplicateManifest);
  const duplicateLedger = structuredClone(ledger);
  duplicateLedger.manifest_digest = duplicateManifest.digest;
  assert.throws(() => runtime.validateCoverageLedger(duplicateManifest, duplicateLedger, ['F-1']), /duplicates/);
});

test('AC-10/11: routing is monotonic and only verified deterministic work is a command', () => {
  const base = { objectiveInputs: true, failedObjectiveCheck: false, risks: [], correctionAttempts: 0 };
  assert.deepStrictEqual(runtime.routeTask({ ...base, kind: 'command', checks: ['deterministic-state'] }).execution, 'command');
  assert.deepStrictEqual(runtime.routeTask({ ...base, kind: 'mechanical', checks: ['deterministic-check', 'exhaustive-match-validation'] }).execution, 'agent');
  assert.strictEqual(runtime.routeTask({ ...base, kind: 'standard', checks: [] }).tier, 'standard');
  assert.strictEqual(runtime.routeTask({ ...base, kind: 'mechanical', checks: ['deterministic-check', 'exhaustive-match-validation'], priorTier: 'critical' }).tier, 'critical');
  assert.strictEqual(runtime.routeTask({ ...base, kind: 'standard', checks: [], failedObjectiveCheck: true, correctionAttempts: 1 }).tier, 'critical');
  assert.notStrictEqual(runtime.routeTask({ ...base, kind: 'mechanical', objectiveInputs: false, checks: ['deterministic-check', 'exhaustive-match-validation'] }).tier, 'mechanical', 'a mechanical claim without objective inputs must never route mechanical');
  assert.strictEqual(runtime.routeTask({ ...base, kind: 'command', checks: [] }).execution, 'agent', 'a command with no deterministic-state check is not deterministic and must not execute as a bare command');
  assert.strictEqual(runtime.routeTask({ ...base, kind: 'command', objectiveInputs: false, checks: ['deterministic-state'] }).execution, 'agent', 'a command without objective inputs must never auto-execute even with the deterministic-state check present');
  assert.strictEqual(runtime.routeTask({ ...base, kind: 'standard', checks: [], failedObjectiveCheck: true, correctionAttempts: 0 }).tier, 'standard', 'a single failed objective check with zero correction attempts must not yet escalate to critical');
  assert.deepStrictEqual(runtime.routeTask({ ...base, kind: 'mechanical', checks: ['deterministic-check', 'exhaustive-match-validation'], risks: ['auth'] }), { tier: 'critical', execution: 'agent', reason: 'risk:auth' }, 'any named risk must escalate to critical regardless of otherwise-mechanical evidence');
});

test('AC-3/4/5: preflight permits only fixed local probes and negative cache is bounded and expires', () => {
  const root = mkTempDir();
  const cachePath = path.join(root, 'external-cache.json');
  const command = process.platform === 'win32' ? path.join(root, 'ready.cmd') : path.join(root, 'ready');
  fs.writeFileSync(command, process.platform === 'win32' ? '@echo off\r\nexit /b 0\r\n' : '#!/bin/sh\nexit 0\n', 'utf8');
  if (process.platform !== 'win32') fs.chmodSync(command, 0o755);
  const input = { provider: 'codex', command, model: 'gpt-5.6-sol', cachePath, now: 1000 };
  assert.throws(() => runtime.externalPreflight({ ...input, provider: 'unknown' }), /provider/);
  assert.throws(() => runtime.externalPreflight({ ...input, authArgs: ['exec', 'paid prompt'] }), /authArgs/);
  const fingerprint = 'a'.repeat(64);
  for (const retryAfter of [1000, Infinity, 1000 + 3600001]) {
    assert.throws(() => runtime.recordExternalFailure({ fingerprint, status: 'quota', cachePath, now: 1000, retryAfter }), /bounded future/);
  }
  const ready = runtime.externalPreflight(input);
  assert.strictEqual(ready.status, 'local-ready');
  const externalRows = canonText('.asd/rules/external-review.md').split(/\r?\n/);
  assert.ok(externalRows.some((line) => line.startsWith('| Claude Code, any') && line.includes("<<'EOF'")) && externalRows.some((line) => line.startsWith('| Codex, `win32`') && line.includes("@'")) && ready.platform === process.platform, `sprint-013 AC-16 (COR-1-1): External Review keys stdin syntax on the host shell plus the preflight output's \`platform\` (external-review.md "OS-specific invocation") - Claude Code always heredoc, Codex here-string on win32 else heredoc - so the table's Claude Code row must name the heredoc form, its Codex win32 row the here-string, and the preflight must report the host platform under that name - got ${JSON.stringify(ready.platform)}`);
  runtime.recordExternalFailure({ fingerprint: ready.fingerprint, status: 'quota', cachePath, now: 1000, retryAfter: 1001 });
  assert.strictEqual(runtime.externalPreflight(input).status, 'negative-cache');
  assert.strictEqual(runtime.externalPreflight({ ...input, now: 1001 }).status, 'local-ready', 'an expired entry must be ignored in-memory on read, even before any write persists the pruning');
  assert.ok(Object.hasOwn(JSON.parse(fs.readFileSync(cachePath, 'utf8')).entries, ready.fingerprint), 'a read-only preflight call must not itself rewrite the cache file - the expired entry is still on disk');
  runtime.recordExternalFailure({ fingerprint: 'b'.repeat(64), status: 'quota', cachePath, now: 1001, retryAfter: 1002 });
  assert.ok(!Object.hasOwn(JSON.parse(fs.readFileSync(cachePath, 'utf8')).entries, ready.fingerprint), 'the expired entry is pruned from disk on the NEXT actual write, not before');
});

test('AC-5: negative-cache recovers when the fingerprint changes because model, command, or credential state changed - not only on TTL expiry', () => {
  const root = mkTempDir();
  const cachePath = path.join(root, 'external-cache.json');
  const command = process.platform === 'win32' ? path.join(root, 'ready.cmd') : path.join(root, 'ready');
  const otherCommand = process.platform === 'win32' ? path.join(root, 'other.cmd') : path.join(root, 'other');
  const scriptBody = process.platform === 'win32' ? '@echo off\r\nexit /b 0\r\n' : '#!/bin/sh\nexit 0\n';
  fs.writeFileSync(command, scriptBody, 'utf8');
  fs.writeFileSync(otherCommand, scriptBody, 'utf8');
  if (process.platform !== 'win32') {
    fs.chmodSync(command, 0o755);
    fs.chmodSync(otherCommand, 0o755);
  }
  const credentialPath = path.join(root, 'credential.json');
  fs.writeFileSync(credentialPath, '{"token":"x"}', 'utf8');

  const input = { provider: 'codex', command, model: 'gpt-5.6-sol', credentialPath, cachePath, now: 1000 };
  const ready = runtime.externalPreflight(input);
  assert.strictEqual(ready.status, 'local-ready');
  runtime.recordExternalFailure({ fingerprint: ready.fingerprint, status: 'quota', cachePath, now: 1000, retryAfter: 1000 + 60000 });
  assert.strictEqual(runtime.externalPreflight(input).status, 'negative-cache', 'sanity: the exact same input must hit the cached entry');

  assert.strictEqual(runtime.externalPreflight({ ...input, model: 'gpt-5.6-terra' }).status, 'local-ready', 'a different model must produce a different fingerprint, never reuse a stale negative-cache entry');
  assert.strictEqual(runtime.externalPreflight({ ...input, command: otherCommand }).status, 'local-ready', 'a different command must produce a different fingerprint');

  fs.writeFileSync(credentialPath, '{"token":"rotated"}', 'utf8');
  const stat = fs.statSync(credentialPath);
  fs.utimesSync(credentialPath, new Date(stat.atimeMs + 1000), new Date(stat.mtimeMs + 1000));
  assert.strictEqual(runtime.externalPreflight(input).status, 'local-ready', 'a rotated credential (changed mtime) must produce a different auth generation and recover, not stay stuck on the old negative-cache entry');
});

test('AC-5: the persisted negative-cache entry never carries anything beyond {status, retry_after} - no secrets or command output', () => {
  const root = mkTempDir();
  const cachePath = path.join(root, 'external-cache.json');
  const command = process.platform === 'win32' ? path.join(root, 'ready.cmd') : path.join(root, 'ready');
  fs.writeFileSync(command, process.platform === 'win32' ? '@echo off\r\nexit /b 0\r\n' : '#!/bin/sh\nexit 0\n', 'utf8');
  if (process.platform !== 'win32') fs.chmodSync(command, 0o755);
  const input = { provider: 'codex', command, model: 'gpt-5.6-sol', cachePath, now: 1000 };
  const ready = runtime.externalPreflight(input);
  runtime.recordExternalFailure({ fingerprint: ready.fingerprint, status: 'quota', cachePath, now: 1000, retryAfter: 1000 + 60000 });
  const persisted = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  const entry = persisted.entries[ready.fingerprint];
  assert.deepStrictEqual(Object.keys(entry).sort(), ['retry_after', 'status'], 'the persisted entry must carry exactly {status, retry_after} - no secrets, command output, or other input echoed back');
});

test('buildInvocation: direct path keeps a metacharacter-containing command as a literal argv element (D-2 security property)', () => {
  const direct = runtime.buildInvocation('win32', '/path/with;metachar/cmd', ['a b']);
  assert.deepStrictEqual(direct, { file: '/path/with;metachar/cmd', args: ['a b'] });
  assert.strictEqual(direct.input, undefined, 'the direct shape must never carry a shell-interpreted input string');
});

test('buildInvocation: .cmd/.bat/.ps1 on win32 route through PowerShell, metacharacters reach only the JSON stdin payload', () => {
  for (const ext of ['cmd', 'bat', 'ps1']) {
    const command = `x.${ext}`;
    const plan = runtime.buildInvocation('win32', command, ['a']);
    assert.strictEqual(plan.file, 'powershell.exe', `${ext}: must dispatch through powershell.exe`);
    assert.ok(Array.isArray(plan.args) && plan.args.every((arg) => typeof arg === 'string' && !arg.includes(command)), `${ext}: fixed PowerShell args must never interpolate the command`);
    assert.strictEqual(plan.input, JSON.stringify({ command, args: ['a'] }), `${ext}: command/args travel only via JSON stdin, never an interpolated command string`);
  }
});

test('buildInvocation: viaPowerShell forces the PowerShell shape on win32 regardless of extension (the ENOENT-retry path, previously unreachable off Windows)', () => {
  const command = 'plain-exe-with;metachar';
  const plan = runtime.buildInvocation('win32', command, ['a'], true);
  assert.strictEqual(plan.file, 'powershell.exe');
  assert.ok(plan.args.every((arg) => typeof arg === 'string' && !arg.includes(command)), 'the metacharacter-bearing command must never appear inside an argument string');
  assert.strictEqual(plan.input, JSON.stringify({ command, args: ['a'] }));
});

test('buildInvocation: non-win32 platforms always stay direct, even when viaPowerShell is true', () => {
  for (const platform of ['linux', 'darwin']) {
    const plan = runtime.buildInvocation(platform, 'x.cmd', ['a'], true);
    assert.deepStrictEqual(plan, { file: 'x.cmd', args: ['a'] }, `${platform}: the PowerShell fallback is locked to win32`);
  }
});

test('AC-4: Windows .cmd preflight executes a metacharacter-containing path literally (end-to-end bonus, buildInvocation above is the host-independent evidence)', () => {
  if (process.platform !== 'win32') {
    console.log('  (skipped: end-to-end spawn proof for the .cmd/metacharacter PowerShell fallback branch - only runs on win32; buildInvocation tests above cover the branch shape on any host)');
    return;
  }
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'asd & runtime-'));
  const shim = path.join(root, 'external & shim.cmd');
  fs.writeFileSync(shim, '@echo off\r\nexit /b 0\r\n', 'utf8');
  const result = runtime.externalPreflight({ provider: 'codex', command: shim, model: 'gpt-5.6-sol', cachePath: path.join(root, 'cache.json') });
  assert.strictEqual(result.status, 'local-ready');
});

function runtimeCli(args, options) {
  return execFileSync(process.execPath, [path.join(REPO_ROOT, '.asd', 'runtime.js'), ...args], { encoding: 'utf8', ...options });
}

test('runtime.js CLI: validate-ledger exits 0 with {"ok":true} stdout on valid fixtures', () => {
  const root = mkTempDir();
  const { manifest, ledger } = validCoverageFixture();
  const manifestPath = path.join(root, 'manifest.json');
  const ledgerPath = path.join(root, 'ledger.json');
  const findingsPath = path.join(root, 'findings.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest), 'utf8');
  fs.writeFileSync(ledgerPath, JSON.stringify(ledger), 'utf8');
  fs.writeFileSync(findingsPath, JSON.stringify(['F-1']), 'utf8');

  const out = runtimeCli(['validate-ledger', '--manifest', manifestPath, '--ledger', ledgerPath, '--findings', findingsPath]);
  assert.deepStrictEqual(JSON.parse(out), { ok: true });
});

test('runtime.js CLI: validate-ledger on a tampered ledger exits non-zero and prints no "ok" to stdout', () => {
  const root = mkTempDir();
  const { manifest, ledger } = validCoverageFixture();
  const tampered = structuredClone(ledger);
  tampered.findings = ['F-1', 'F-2'];
  const manifestPath = path.join(root, 'manifest.json');
  const ledgerPath = path.join(root, 'ledger.json');
  const findingsPath = path.join(root, 'findings.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest), 'utf8');
  fs.writeFileSync(ledgerPath, JSON.stringify(tampered), 'utf8');
  fs.writeFileSync(findingsPath, JSON.stringify(['F-1']), 'utf8');

  let error = null;
  try {
    runtimeCli(['validate-ledger', '--manifest', manifestPath, '--ledger', ledgerPath, '--findings', findingsPath]);
  } catch (e) {
    error = e;
  }
  assert.ok(error, 'a tampered ledger must exit non-zero, never silently pass a blocking gate');
  assert.notStrictEqual(error.status, 0);
  assert.ok(!(error.stdout || '').includes('ok'), 'a rejected ledger must never print an "ok" payload to stdout');
});

test('runtime.js CLI: external-preflight exits 1 on command-unavailable', () => {
  const root = mkTempDir();
  const inputPath = path.join(root, 'input.json');
  fs.writeFileSync(inputPath, JSON.stringify({ provider: 'codex', command: path.join(root, 'does-not-exist'), model: 'gpt-5.6-sol', cachePath: path.join(root, 'cache.json') }), 'utf8');

  let error = null;
  let stdout = '';
  try {
    stdout = runtimeCli(['external-preflight', '--input', inputPath]);
  } catch (e) {
    error = e;
    stdout = e.stdout;
  }
  assert.ok(error, 'a missing/unavailable CLI must exit non-zero, not report local-ready');
  assert.strictEqual(error.status, 1);
  assert.strictEqual(JSON.parse(stdout).status, 'command-unavailable');
});

test('runtime.js CLI: manifest-digest digests a manifest exactly as written and never rewrites it - stamping belongs to emit-manifest alone', () => {
  const root = mkTempDir();
  const manifest = buildManifest(['f-1'], ['r-1'], ['s-1']);
  const manifestPath = path.join(root, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest), 'utf8');

  const out = runtimeCli(['manifest-digest', '--manifest', manifestPath]).trim();
  assert.strictEqual(out, runtime.coverageManifestDigest(manifest), 'the CLI must print exactly what the exported digester computes - a workflow verifies through the CLI while the validator checks through the library, so the two must never disagree');
  assert.strictEqual(out, runtime.fingerprint(manifest), 'a manifest carrying no `vocabulary` must digest to the plain stable hash of its own content: the pre-vocabulary identity, expressed here through the untouched `fingerprint` primitive so the expectation cannot drift with the function under test. Digesting an implied field instead would move the identity of every manifest stamped before that field existed (correctness F-2)');

  let restamp;
  try {
    restamp = runtimeCli(['manifest-digest', '--manifest', manifestPath, '--write'], { stdio: 'pipe' }).trim();
  } catch (error) {
    restamp = `exit ${error.status}`;
  }
  assert.strictEqual(fs.readFileSync(manifestPath, 'utf8'), JSON.stringify(manifest), `EFF-1-1: manifest-digest only verifies - a dispatched manifest is immutable to the orchestrator too (review-policy.md "Coverage ledger"), so no flag may re-stamp the file on disk. Got: ${restamp}`);
});

test('AC-12/14: variants inherit their canonical permissions and malformed or colliding variants fail closed', () => {
  const root = makeMiniRepo();
  const base = GOOD_AGENT_CANON.replace('"name": "asd-demo"', '"name": "worker"').replace('\n}\n---', ',\n  "variants": {"mechanical": {"claude": {"model": "haiku"}, "codex": {"model": "luna", "model_reasoning_effort": "low"}}}\n}\n---');
  writeAgentCanon(root, 'worker', base);
  const targets = sync.runCheck(root).map((item) => item.target);
  assert.ok(targets.includes('.claude/agents/worker-mechanical.md'));
  assert.ok(targets.includes('.codex/agents/worker-mechanical.toml'));
  sync.runApply(root, ['.claude/agents/worker-mechanical.md', '.codex/agents/worker-mechanical.toml']);
  const claude = fs.readFileSync(path.join(root, '.claude/agents/worker-mechanical.md'), 'utf8');
  assert.ok(claude.includes('model: haiku') && claude.includes('tools: [Read, Grep]'), 'tier may change model only; inherited permissions/body survive');
  assert.ok(!/^effort:/m.test(claude), 'AC-10: haiku variant with no unsupported effort override must drop the inherited effort line entirely');
  writeAgentCanon(root, 'worker', base.replace('"model": "haiku"', '"tools": ["Write"]'));
  assert.throws(() => sync.runCheck(root), /permission metadata/);
  writeAgentCanon(root, 'worker', base.replace('"mechanical"', '"unknown"'));
  assert.throws(() => sync.runCheck(root), /unsupported variant suffix/);
  writeAgentCanon(root, 'worker-mechanical', GOOD_AGENT_CANON.replace('"name": "asd-demo"', '"name": "worker-mechanical"'));
  writeAgentCanon(root, 'worker', base);
  assert.throws(() => sync.runCheck(root), /agent name collision/);
});

test('AC-14: PM migration deletes only intact generated views and remains idempotent', async () => {
  const root = makeMigrationFixtureRepo();
  const manifest = loadManifest();
  const intact = path.join(root, '.claude', 'agents', 'asd-pm.md');
  const modified = path.join(root, '.codex', 'agents', 'asd-pm.toml');
  const pmCanon = GOOD_AGENT_CANON.replace('"name": "asd-demo"', '"name": "asd-pm"');
  const { meta, body } = sync.parseCanonicalFrontmatter(pmCanon);
  const makeView = (kind) => sync.renderFullFile({ kind, sourceRelPath: 'agents/asd-pm.md', canonRawNormalized: pmCanon, meta, body, manifest, asdVersion: manifest.asd_version }).output;
  fs.mkdirSync(path.dirname(intact), { recursive: true });
  fs.writeFileSync(intact, makeView('agent-claude'), 'utf8');
  fs.mkdirSync(path.dirname(modified), { recursive: true });
  fs.writeFileSync(modified, makeView('agent-codex') + 'edited', 'utf8');
  const first = await migration500({ repoRoot: root });
  assert.ok(first.deleted.includes('.claude/agents/asd-pm.md'));
  assert.ok(first.skippedModified.includes('.codex/agents/asd-pm.toml'));
  const second = await migration500({ repoRoot: root });
  assert.deepStrictEqual(second.deleted, []);
  assert.ok(second.missing.includes('.claude/agents/asd-pm.md'));

  const unmarkedRoot = makeMigrationFixtureRepo();
  const unmarked = path.join(unmarkedRoot, '.claude', 'agents', 'asd-pm.md');
  fs.mkdirSync(path.dirname(unmarked), { recursive: true });
  fs.writeFileSync(unmarked, 'consumer-owned\n', 'utf8');
  const unmarkedReport = await migration500({ repoRoot: unmarkedRoot });
  assert.ok(unmarkedReport.skippedUnmarked.includes('.claude/agents/asd-pm.md'));
  assert.strictEqual(fs.readFileSync(unmarked, 'utf8'), 'consumer-owned\n');

  const unsafeRoot = makeMigrationFixtureRepo();
  const outside = path.join(mkTempDir(), 'asd-pm.md');
  fs.writeFileSync(outside, makeView('agent-claude'), 'utf8');
  const unsafe = path.join(unsafeRoot, '.claude', 'agents', 'asd-pm.md');
  fs.mkdirSync(path.dirname(unsafe), { recursive: true });
  fs.symlinkSync(outside, unsafe, 'file');
  const unsafeReport = await migration500({ repoRoot: unsafeRoot });
  assert.ok(unsafeReport.skippedUnsafe.includes('.claude/agents/asd-pm.md'));
  assert.strictEqual(fs.existsSync(outside), true, 'migration must not follow or delete a target outside the consumer repo');
});

// ===========================================================================
// 15. .asd/migrations/6.0.0.js - retirement of state.json.escalations.
// The migration rewrites a consumer's LIVE sprint state file, so the risk is
// data loss, not feature absence: every other member must survive with the
// file's own line endings, only the TOP-LEVEL key may go, archived sprints
// must not be touched at all, and input that does not parse must be left
// byte-for-byte alone.
// ===========================================================================

test('6.0.0 migration: strips "escalations" from an ACTIVE sprint state, preserving every other member and CRLF line endings; archived sprints untouched; re-run is a no-op', async () => {
  const root = mkTempDir();
  const activeBefore = [
    '{',
    '  "sprint_id": "007-live",',
    '  "phase": "impl",',
    '  "escalations": [{"id": "E-1", "note": "tool would not launch"}],',
    '  "skipped_phases": [],',
    '  "updated_at": "2026-09-07"',
    '}',
    '',
  ].join('\r\n');
  const activeExpected = [
    '{',
    '  "sprint_id": "007-live",',
    '  "phase": "impl",',
    '  "skipped_phases": [],',
    '  "updated_at": "2026-09-07"',
    '}',
    '',
  ].join('\r\n');
  const archivedBefore = '{\n  "sprint_id": "006-old",\n  "escalations": [],\n  "phase": "done"\n}\n';
  writeFile(root, '.asd/sprints/007-live/state.json', activeBefore);
  writeFile(root, '.asd/sprints/archived/006-old/state.json', archivedBefore);

  const report = await migration600({ repoRoot: root });

  const activePath = path.join(root, '.asd/sprints/007-live/state.json');
  const archivedPath = path.join(root, '.asd/sprints/archived/006-old/state.json');
  assert.deepStrictEqual(report.stripped, ['.asd/sprints/007-live/state.json']);
  assert.strictEqual(
    fs.readFileSync(activePath, 'utf8'),
    activeExpected,
    'only the escalations line may go - every other byte, CRLF included, must survive'
  );
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(activePath, 'utf8')), {
    sprint_id: '007-live',
    phase: 'impl',
    skipped_phases: [],
    updated_at: '2026-09-07',
  });
  assert.strictEqual(
    fs.readFileSync(archivedPath, 'utf8'),
    archivedBefore,
    'archived sprints are immutable history - the migration must never enter the archive subtree'
  );
  assert.ok(
    ![...report.stripped, ...report.absent, ...report.skipped].some((p) => p.includes('/archived/')),
    'no archived path may appear in the report at all'
  );

  const rerun = await migration600({ repoRoot: root });
  assert.deepStrictEqual(rerun.stripped, [], 're-running an applied migration must be a no-op, never an error');
  assert.deepStrictEqual(rerun.absent, ['.asd/sprints/007-live/state.json']);
  assert.strictEqual(fs.readFileSync(activePath, 'utf8'), activeExpected, 'idempotent: second run leaves the file identical');
});

test('6.0.0 migration: removes the TOP-LEVEL "escalations" whatever shape it is written in - last member, populated array spanning lines, or shadowed by a nested member of the same name; only unparsable JSON is left byte-for-byte untouched and reported as skipped', async () => {
  const root = mkTempDir();
  const lastMember = '{\n  "sprint_id": "a",\n  "phase": "pr",\n  "escalations": []\n}\n';
  const broken = '{\n  "sprint_id": "b",\n  "escalations": [],\n';
  const multiLine = '{\n  "sprint_id": "c",\n  "escalations": [\n    {"id": "E-1"}\n  ],\n  "phase": "impl"\n}\n';
  const nestedFirst = '{\n  "sprint_id": "d",\n  "reviews": {\n    "escalations": [],\n    "iteration": 1\n  },\n  "escalations": [{"id": "E-1"}],\n  "phase": "impl"\n}\n';
  writeFile(root, '.asd/sprints/a/state.json', lastMember);
  writeFile(root, '.asd/sprints/b/state.json', broken);
  writeFile(root, '.asd/sprints/c/state.json', multiLine);
  writeFile(root, '.asd/sprints/d/state.json', nestedFirst);

  const report = await migration600({ repoRoot: root });

  assert.deepStrictEqual(
    JSON.parse(fs.readFileSync(path.join(root, '.asd/sprints/a/state.json'), 'utf8')),
    { sprint_id: 'a', phase: 'pr' },
    'dropping the final member must leave the state file parsable, with no dangling comma'
  );
  assert.deepStrictEqual(
    JSON.parse(fs.readFileSync(path.join(root, '.asd/sprints/c/state.json'), 'utf8')),
    { sprint_id: 'c', phase: 'impl' },
    'an escalations array that actually accumulated entries is pretty-printed across lines - the most likely live shape, and it must still be removed'
  );
  assert.deepStrictEqual(
    JSON.parse(fs.readFileSync(path.join(root, '.asd/sprints/d/state.json'), 'utf8')),
    { sprint_id: 'd', reviews: { escalations: [], iteration: 1 }, phase: 'impl' },
    'the retired key is the top-level one only - a same-named member at any other depth belongs to its owner and must survive'
  );
  assert.deepStrictEqual(report.stripped.sort(), ['.asd/sprints/a/state.json', '.asd/sprints/c/state.json', '.asd/sprints/d/state.json']);
  assert.deepStrictEqual(
    report.skipped,
    ['.asd/sprints/b/state.json'],
    'only input that cannot be parsed is skipped - nothing else is guessed at'
  );
  assert.strictEqual(fs.readFileSync(path.join(root, '.asd/sprints/b/state.json'), 'utf8'), broken, 'unparsable input left untouched');
});

test('AC-9: the 6.0.0 migration prints the escalations it dropped and where to re-record them - the run\'s only data-recovery affordance', async () => {
  const root = mkTempDir();
  const dropped = [{ id: 'E-1', note: 'tool would not launch' }, { id: 'E-2', note: 'gate fired at the wrong time' }];
  const live = JSON.stringify({ sprint_id: '007-live', escalations: dropped, phase: 'impl' }, null, 2) + '\n';
  writeFile(root, '.asd/sprints/007-live/state.json', live);
  writeFile(root, '.asd/sprints/007-broken/state.json', '{\n  "sprint_id": "007-broken",\n  "escalations": [],\n');

  const captured = [];
  const realWrite = process.stdout.write;
  process.stdout.write = (chunk) => {
    captured.push(String(chunk));
    return true;
  };
  let report;
  try {
    report = await migration600({ repoRoot: root });
  } finally {
    process.stdout.write = realWrite;
  }
  const output = captured.join('');

  assert.deepStrictEqual(report.stripped, ['.asd/sprints/007-live/state.json']);
  assert.ok(
    output.includes(JSON.stringify(dropped)),
    'the dropped escalations must be printed verbatim - the rewritten state file was their only other copy and it no longer holds them'
  );
  assert.ok(
    /friction-log\.md/.test(output),
    'the warning must name where the consumer re-records them, or the data is gone with no pointer to its replacement home'
  );
  assert.ok(
    /007-broken\/state\.json.*by hand/.test(output),
    'a state file left untouched because it does not parse must say so - silence reads as a successful migration'
  );
});

// ===========================================================================
// 16. Phase-chain consistency (AC-8, audit gap G-11). PHASE_CHAIN in the
// SessionStart hook is the machine-readable phase set; roughly twenty other
// sites mirror it by hand. These tests derive the chain from the hook source
// and assert every mirror that is machine-checkable: the skill and workflow
// files a phase needs to exist at all, the `NEXT:` token that does the actual
// routing, the friction-append reference every workflow carries, the ordered
// phase sequences in the rule docs, and the phase table, flowchart and count
// words in README and AGENTS.md. PHASE_CHAIN only drives the session
// hook's display, so a green chain array over a stale `NEXT:` or a stale
// user-facing doc is exactly the silent desync these assertions exist for.
// ===========================================================================

const PHASE_COUNT_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen',
];
const FRICTION_APPEND_REF = 'friction: `F-N` entries to `<sprint>/friction-log.md` per `sprint-lifecycle.md` "Friction log"';

function readTocH2Threshold() {
  const layout = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/artifact-layout.md'), 'utf8');
  const stated = /^\|\s*`\{\{TOC_NAV\}\}`.*?\*\*(\d+) or more\*\* `<h2>` sections/m.exec(layout);
  assert.ok(stated, 'artifact-layout.md "Placeholder fill" owns the {{TOC_NAV}} h2 threshold - these tests derive it from there, never restate it');
  return Number(stated[1]);
}

function readPhaseChain() {
  const src = fs.readFileSync(path.join(REPO_ROOT, '.asd/hooks/session-start.js'), 'utf8');
  const block = /const PHASE_CHAIN = \[([\s\S]*?)\];/.exec(src);
  assert.ok(block, 'session-start.js must keep PHASE_CHAIN as a literal array - it is the chain SSoT');
  return (block[1].match(/'([^']+)'/g) || []).map((quoted) => quoted.slice(1, -1));
}

function readWorkflow(phase) {
  return fs.readFileSync(path.join(REPO_ROOT, `.asd/workflows/asd-phase-${phase}.md`), 'utf8');
}

function readReturnContractTargets(phase, src) {
  const contract = new RegExp(`^PHASE: ${phase} \\|.*\\bNEXT:\\s*(.+?)\\s*$`, 'm').exec(src);
  assert.ok(contract, `asd-phase-${phase}.md must keep its single-line "PHASE: ${phase} | ... | NEXT: <...>" return contract`);
  return contract[1].replace(/[<>`]/g, '').split('|').map((target) => target.trim());
}

test('AC-8/G-11: PHASE_CHAIN is the single source for the phase set - every phase has a skill AND a workflow, every phase skill/workflow is in the chain, and retro sits between impl-review and pr', () => {
  const chain = readPhaseChain();
  assert.deepStrictEqual([...new Set(chain)], chain, 'PHASE_CHAIN must not repeat a phase');
  assert.strictEqual(chain[chain.length - 1], 'done', 'the chain terminates at the pseudo-phase "done"');

  const retro = chain.indexOf('retro');
  assert.ok(retro > 0, 'retro must be in the chain');
  assert.strictEqual(chain[retro - 1], 'impl-review', 'retro runs directly after impl-review');
  assert.strictEqual(chain[retro + 1], 'pr', 'retro runs directly before pr');

  const phases = chain.filter((phase) => phase !== 'done');
  const missing = [];
  for (const phase of phases) {
    if (!fs.existsSync(path.join(REPO_ROOT, `.asd/skills/asd-phase-${phase}/SKILL.md`))) missing.push(`skill for ${phase}`);
    if (!fs.existsSync(path.join(REPO_ROOT, `.asd/workflows/asd-phase-${phase}.md`))) missing.push(`workflow for ${phase}`);
  }
  assert.deepStrictEqual(missing, [], `a phase in the chain with no dispatch target routes into nothing: ${missing.join(', ')}`);

  const workflowPhases = fs
    .readdirSync(path.join(REPO_ROOT, '.asd/workflows'))
    .filter((name) => name.startsWith('asd-phase-') && name.endsWith('.md'))
    .map((name) => name.slice('asd-phase-'.length, -'.md'.length));
  const skillPhases = fs
    .readdirSync(path.join(REPO_ROOT, '.asd/skills'))
    .filter((name) => name.startsWith('asd-phase-'))
    .map((name) => name.slice('asd-phase-'.length));
  assert.deepStrictEqual(
    [...workflowPhases].sort(),
    [...phases].sort(),
    'phase workflows and PHASE_CHAIN must be in bijection - an orphaned workflow means the chain was edited or reverted without its dispatch targets, the same desync mirrored'
  );
  assert.deepStrictEqual([...skillPhases].sort(), [...phases].sort(), 'phase skills and PHASE_CHAIN must be in bijection, for the same reason');
});

test('AC-2/AC-3/AC-6/AC-8: every phase workflow offers its PHASE_CHAIN successor as a NEXT target and carries the friction-append reference - NEXT is what routes the sprint, PHASE_CHAIN only what the session hook displays', () => {
  const chain = readPhaseChain();
  const phases = chain.filter((phase) => phase !== 'done');
  const knownTargets = new Set([...chain, 'await-merge', 'halted']);

  for (const [index, phase] of phases.entries()) {
    const successor = chain[index + 1];
    const src = readWorkflow(phase);
    assert.ok(
      src.includes(FRICTION_APPEND_REF),
      `asd-phase-${phase}.md must carry the friction-append reference line verbatim: the orchestrator running a phase with no such line records no friction at all, the retro phase then analyses a log that is silently partial, and every other assertion stays green (sprint-lifecycle.md "Friction log" states the mechanism once and every phase workflow references it)`
    );
    const targets = readReturnContractTargets(phase, src);
    assert.ok(
      targets.includes(successor),
      `asd-phase-${phase}.md must offer "NEXT: ${successor}": PHASE_CHAIN routes ${phase} there, and a stale NEXT token skips the successor phase silently, with every chain assertion still green (got: ${targets.join(', ')})`
    );
    const unknown = targets.filter((target) => !knownTargets.has(target));
    assert.deepStrictEqual(unknown, [], `asd-phase-${phase}.md names a NEXT target that is neither a phase nor a known terminal: ${unknown.join(', ')}`);
  }
});

test('AC-8/G-11: the ordered phase-chain mirrors in core.md, sprint-lifecycle.md and checkpoints.md match PHASE_CHAIN exactly', () => {
  const phases = readPhaseChain().filter((phase) => phase !== 'done');

  const core = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/core.md'), 'utf8');
  const glossary = /mandatory:\s*([^.]+)\./.exec(core);
  assert.ok(glossary, 'core.md glossary must keep its "N mandatory: <phase>, <phase>, ..." phase list');
  assert.deepStrictEqual(
    glossary[1].split(',').map((phase) => phase.trim()),
    phases,
    'core.md glossary phase list drifted from PHASE_CHAIN'
  );

  const lifecycle = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/sprint-lifecycle.md'), 'utf8');
  const arrowLine = /^scope\s*(?:→|⇄).*$/m.exec(lifecycle);
  assert.ok(arrowLine, 'sprint-lifecycle.md must keep its "scope → ... → pr" chain line');
  assert.deepStrictEqual(
    arrowLine[0].split(/\s*(?:→|⇄)\s*/).map((phase) => phase.trim()),
    phases,
    'sprint-lifecycle.md chain line drifted from PHASE_CHAIN'
  );

  const checkpoints = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/checkpoints.md'), 'utf8');
  const preconditions = /## Precondition chain\s*```\s*([\s\S]*?)\s*```/.exec(checkpoints);
  assert.ok(preconditions, 'checkpoints.md must keep its fenced "## Precondition chain" block');
  assert.deepStrictEqual(
    preconditions[1].split(/\s*(?:→|⇄)\s*/).map((phase) => phase.trim()),
    phases.slice(1),
    'checkpoints.md precondition chain drifted from PHASE_CHAIN - it lists every phase that HAS a predecessor, so the first phase is excluded by construction'
  );
});

test('AC-8: the always-loaded mirrors of PHASE_CHAIN - README\'s phase table and flowchart, and every phase-count word in README and AGENTS.md', () => {
  const phases = readPhaseChain().filter((phase) => phase !== 'done');
  const readme = fs.readFileSync(path.join(REPO_ROOT, 'README.md'), 'utf8');

  const tableRows = [...readme.matchAll(/^\| \*\*([a-z-]+)\*\* \|/gm)].map((row) => row[1]);
  assert.deepStrictEqual(tableRows, phases, 'README phase table drifted from PHASE_CHAIN - it is the user-facing entry point, and a stale row describes a workflow that no longer exists');

  const graphNodes = [...new Set([...readme.matchAll(/\w+\["([a-z-]+)<br\//g)].map((node) => node[1]))];
  assert.deepStrictEqual(
    graphNodes.sort(),
    [...phases].sort(),
    'the README flowchart must declare a node for exactly the phases in PHASE_CHAIN - declaration order belongs to the graph author, the node set does not'
  );

  const countPattern = new RegExp(`\\b(\\d+|${PHASE_COUNT_WORDS.join('|')})\\s+(?:mandatory |sprint )?phases\\b`, 'gi');
  const expected = new Set([String(phases.length), PHASE_COUNT_WORDS[phases.length]]);
  for (const [file, minSites] of [['README.md', 3], ['AGENTS.md', 2]]) {
    const counts = [...fs.readFileSync(path.join(REPO_ROOT, file), 'utf8').matchAll(countPattern)].map((count) => count[1].toLowerCase());
    assert.ok(counts.length >= minSites, `${file} states the phase count in prose in at least ${minSites} places - only ${counts.length} found, so this pattern has itself drifted and asserts nothing`);
    const stale = counts.filter((count) => !expected.has(count));
    assert.deepStrictEqual(stale, [], `${file} phase-count word disagrees with PHASE_CHAIN's ${phases.length}: ${stale.join(', ')} - README is the user-facing entry point and AGENTS.md is loaded as project instructions on every turn, so a stale count in either describes a workflow that no longer exists`);
  }
});

test('sprint-011 AC-3/AC-5/AC-7, sprint-013 AC-14: the audit exit that emits NEXT: plan is keyed on the documents-only collapse test, lands phase on the chain predecessor of plan, records exactly the phases between audit and plan as skipped in the one exit write that also carries a skipped audit and logs the skip, and the plan precondition, checkpoints chain and resume flow accept that state through the same frozen collapse test', () => {
  const chain = readPhaseChain();
  const between = chain.slice(chain.indexOf('audit') + 1, chain.indexOf('plan'));
  const audit = readWorkflow('audit');
  const lifecycle = readRepoFile('.asd/rules/sprint-lifecycle.md');
  const homes = lifecycle.split('\n').map((line) => /^\*\*([^*]+)\*\*:\s*(.*)$/.exec(line)).filter((match) => match && match[1].toLowerCase().includes(between.join('/')));
  assert.strictEqual(homes.length, 1, `sprint-lifecycle.md must hold exactly one bold-labelled rule for the ${between.join('/')} collapse - it is the home the audit exit, the plan precondition and resume all cite`);
  const [, collapseLabel, collapseBody] = homes[0];
  const citation = `\`sprint-lifecycle.md\` "${collapseLabel}"`;

  assert.ok(readReturnContractTargets('audit', audit).includes('plan'), "asd-phase-audit.md's return contract must offer NEXT: plan - asd-sprint follows NEXT as authoritative, so without it the collapse has no route and design is dispatched anyway");
  const exits = audit.split('\n').filter((line) => /^\d+\.\s/.test(line) && line.includes('NEXT: plan'));
  assert.strictEqual(exits.length, 1, 'exactly one numbered audit step must emit NEXT: plan - it is the single site of the design-block skip write');
  const [exit] = exits;
  assert.ok(exit.includes(citation), `the audit step emitting NEXT: plan must be conditioned on the collapse test cited as ${citation} - an unconditioned route skips design for every sprint`);
  const landed = /phase="([a-z-]+)"/.exec(exit);
  assert.ok(landed, 'the audit skip write must set phase="<name>" explicitly');
  assert.strictEqual(chain[chain.indexOf(landed[1]) + 1], 'plan', `the skip write must land phase on the PHASE_CHAIN predecessor of plan (sprint-lifecycle.md "Multi-phase skip": the LAST subsumed phase) - the session hook and resume derive the next phase from it, so phase="${landed[1]}" would re-enter the skipped block`);
  const appended = /\[\s*("[a-z-]+"(?:\s*,\s*"[a-z-]+")*)\s*\]/.exec(exit);
  assert.ok(appended, 'the audit skip write must name the skipped_phases it appends as a literal array');
  assert.deepStrictEqual(JSON.parse(`[${appended[1]}]`), between, 'the skip write must record exactly the phases PHASE_CHAIN places between audit and plan, in order - a missing name is a phase a later audit cannot tell from one that ran and produced nothing');
  const logged = exit.split(/;\s|\.\s/).filter((clause) => clause.includes('decisions-log')).flatMap((clause) => [...clause.matchAll(/"([^"]*)"/g)].map((match) => match[1]));
  assert.ok(logged.some((line) => between.every((phase) => line.includes(phase))), `the audit skip write must add a quoted decisions-log line naming the skipped ${between.join('/')} - sprint-lifecycle.md "Optional documents" records every skip as state plus one decisions-log line`);

  const exitStep = /^(\d+)\./.exec(exit)[1];
  const auditOff = audit.split('\n').find((line) => /^\d+\.\s/.test(line) && line.includes('false audit'));
  assert.ok(auditOff && auditOff.includes(`step ${exitStep}`), `the audit step reading the frozen documents must route a false audit to step ${exitStep}, the exit write`);
  assert.ok(!/phase=|skipped_phases|record it\b/.test(auditOff), 'the audit step reading `documents.audit` must not write state of its own (no phase=, no skipped_phases, no "record it") - with the setting on, an audit-skip write followed by the exit write is two non-atomic writes, and an interruption between them leaves phase="audit" for resume to re-enter design (EXT-1)');
  const auditRecord = exit.indexOf('`"audit"`');
  assert.ok(auditRecord !== -1 && auditRecord < appended.index, "the exit write must carry a skipped audit's \"audit\" record ahead of the design-block names it appends - it is the one write for both skips, so the audit record cannot land on its own (EXT-1, sprint-lifecycle.md \"Multi-phase skip\")");
  const auditOnly = exit.split(/\.\s+/).find((sentence) => sentence.includes(`NEXT: ${chain[chain.indexOf('audit') + 1]}`));
  assert.ok(auditOnly && auditOnly.includes('phase="audit"'), 'the exit branch emitting NEXT: design must set phase="audit" - with step 1 carrying no write, it is the only write that advances phase past a skipped audit, and a skip recorded without that advance is the state "Skip record" forbids');

  const designRow = /^\| Phase \| No-op when \|[\s\S]*?^\| design \| (.*?) \|\s*$/m.exec(lifecycle);
  const designDocs = designRow ? [...designRow[1].matchAll(/`([a-z0-9_]+)`/g)].map((token) => token[1]) : [];
  assert.ok(designDocs.length >= 4, `the no-op table's design row must still enumerate the design documents - only [${designDocs.join(', ')}] found, so this derivation has drifted and the collapse-test check below asserts nothing`);
  const collapseTest = collapseBody.split(/\.\s+/).find((sentence) => designDocs.every((doc) => new RegExp(`\\b${doc}\\b`).test(sentence)));
  assert.ok(collapseTest, `${citation} must state one collapse test naming every design document [${designDocs.join(', ')}] - resume and plan decide from it, so a dropped document resumes a collapsed sprint into design-promote`);
  const condition = collapseTest.slice(collapseTest.lastIndexOf(':') + 1);
  assert.ok(!condition.includes('skipped_phases'), `the collapse test's condition in ${citation} must not read skipped_phases - that array is a historical record, so a stale entry left by a rollback would pass a real, interrupted promotion as collapsed (COR-2)`);
  assert.ok(!condition.includes('skip_design_phases'), `sprint-013 AC-14: the collapse test's condition in ${citation} is documents-only - the removed setting may survive only as a legacy state field the rule ignores`);

  const planPreconditions = /## Preconditions([\s\S]*?)\n## /.exec(readWorkflow('plan'));
  assert.ok(planPreconditions, 'asd-phase-plan.md must keep its "## Preconditions" section');
  const promoted = planPreconditions[1].split('\n').find((line) => line.includes(citation));
  assert.ok(promoted, `asd-phase-plan.md preconditions must accept the collapse test by citing ${citation} - the collapse promotes nothing, so without it plan ABORTs on the state audit just wrote`);
  assert.ok(!promoted.includes('skipped_phases'), 'asd-phase-plan.md must not accept a design-promote recorded in skipped_phases - a stale skip entry left by a rollback would let plan run on unpromoted docs (COR-2)');
  const planRequires = /`plan` requires ([^;]+);/.exec(readRepoFile('.asd/rules/checkpoints.md'));
  assert.ok(planRequires, 'checkpoints.md must keep its "`plan` requires ...;" precondition clause');
  assert.ok(/\bcollapse\b/.test(planRequires[1]) && !planRequires[1].includes('skip_design_phases'), "checkpoints.md's plan precondition must accept the design-block collapse, not a removed setting - it is the chain whose miss emits ABORT");

  const resume = /### Step 2B[\s\S]*?\n### /.exec(readRepoFile('.asd/skills/asd-sprint/SKILL.md'));
  assert.ok(resume, 'asd-sprint SKILL.md must keep its "### Step 2B" resume flow');
  const successor = resume[0].split('\n').find((line) => line.includes(`phase="${landed[1]}"`));
  assert.ok(successor && successor.includes(citation) && successor.includes('`plan`'), `the asd-sprint resume flow must dispatch \`plan\` for phase="${landed[1]}" under the collapse test cited as ${citation} - re-entering phase as written would load asd-phase-${landed[1]} after the skip, which AC-3 forbids`);
  assert.ok(!successor.includes('skipped_phases'), `the asd-sprint resume exception for phase="${landed[1]}" must not read skipped_phases - a stale skip entry left by a rollback would skip a real, interrupted promotion (COR-2)`);
});

test('sprint-013 AC-13..AC-18/AC-20: no config key the 9.0.0 migration removes survives - t_config.yaml and the README config schema are already migrated, and no canon reader names a removed key except a state field t_state.json still freezes or a line stating its legacy handling', () => {
  const removed = readRemovedConfigKeys();
  const readme = /^## Configuration$[\s\S]*?```yaml\n([\s\S]*?)```/m.exec(readRepoFile('README.md'));
  assert.ok(readme, 'README.md must keep its "## Configuration" yaml schema block');
  for (const [label, text] of [['.asd/templates/t_config.yaml', canonText('.asd/templates/t_config.yaml')], ['README.md config schema', readme[1]]]) {
    const { report } = migrateConfig900(text);
    assert.deepStrictEqual([report.status, report.changes, report.reason], ['unchanged', [], null], `${label} must already be in the 9.0.0 shape - asd-init writes config from t_config.yaml and README mirrors it, so a removed key, a legacy value or a shipped stale comment there reaches every new project`);
  }

  const state = JSON.parse(readRepoFile('.asd/templates/t_state.json'));
  const frozenInState = (key) => key.split('.').reduce((node, part) => (node && typeof node === 'object' && Object.hasOwn(node, part) ? node[part] : undefined), state) !== undefined;
  const leafIsUnambiguous = (leaf) => leaf.includes('_');
  const spellings = (key) => [key, key.split('.').pop()].filter((name, index) => index === 0 || leafIsUnambiguous(name));
  const needles = [...new Set(removed.flatMap(spellings))];
  const hooks = fs.readdirSync(path.join(REPO_ROOT, '.asd/hooks')).map((file) => `.asd/hooks/${file}`);
  const [offenders, legacyLines, frozenReaders] = [[], [], []];
  for (const rel of [...canonMarkdownFiles(), 'README.md', 'AGENTS.md', '.asd/templates/t_state.json', '.asd/runtime.js', ...hooks]) {
    canonText(rel).split('\n').forEach((line, index) => {
      for (const needle of needles.filter((name) => new RegExp(`(?<![\\w-])${name.replace(/\./g, '\\.')}(?![\\w-])`).test(line))) {
        if (/legacy/i.test(line)) legacyLines.push(`${rel}: ${needle}`);
        else if (frozenInState(needle)) frozenReaders.push(`${rel}: ${needle}`);
        else offenders.push(`${rel}:${index + 1}: ${needle}`);
      }
    });
  }
  assert.deepStrictEqual(offenders, [], `removed config keys [${needles.join(', ')}] must have no reader left - an agent told to read one acts on a setting nothing writes. Allowed only: a state field t_state.json still carries, and a line that states legacy handling`);
  assert.deepStrictEqual(legacyLines.sort(), ['.asd/rules/sprint-lifecycle.md: scoped_fan_out', '.asd/rules/sprint-lifecycle.md: skip_design_phases'], 'a line mentioning "legacy" is exempt as a whole, so every exempted hit is pinned - the collapse paragraph ignoring a legacy skip_design_phases state field and the legacy skipped-verdict note on scoped_fan_out. A new hit may be a reader hidden in a legacy paragraph; review it and re-pin');
  assert.deepStrictEqual(frozenReaders.sort(), [
    ...Array(4).fill('.asd/rules/sprint-lifecycle.md: documents.c4'),
    '.asd/workflows/asd-phase-design-promote.md: documents.c4',
    ...Array(5).fill('.asd/workflows/asd-phase-design.md: documents.c4'),
  ], 'documents.c4 survives only as the state.json field scope freezes, so its reader lines are pinned - a new line may read the removed config key; confirm it reads state.json and re-pin');
});

// ===========================================================================
// 17. release-manifest.json reverse coverage (AC-5, audit gap G-12). Section
// 6b asserts the forward direction (every recorded hash matches its file); an
// added-but-unregistered file is invisible to it, and update.js only ships
// what upstream_hashes lists - so a new template would never reach a consumer.
// ===========================================================================

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

// ===========================================================================
// 18. t_retrospective.html section contract (AC-4, AC-5, AC-7, AC-10). The
// retro phase has two branches and the template is the only place their
// section sets are written down: an unclassified section leaves the empty-log
// branch undefined, a dropped systemic section makes an entry-free log an
// empty retrospective, and the h2 count on each branch is what decides
// whether {{TOC_NAV}} is filled or correctly left empty.
// ===========================================================================

test('AC-4/AC-5/AC-7/AC-10: t_retrospective.html classifies every section for the empty-log branch, keeps the systemic class there, and sits on the right side of the TOC threshold on both branches', () => {
  const template = fs.readFileSync(path.join(REPO_ROOT, '.asd/templates/t_retrospective.html'), 'utf8');
  const sections = [...template.matchAll(/<section id="([a-z-]+)"[^>]*>\s*<h2>([^<]+)<\/h2>/g)].map((section) => section[2]);
  assert.ok(sections.length > 0, 't_retrospective.html must keep its <section id> + <h2> fragment shape - every other assertion here reads it');

  const branchNote = /<!-- EMPTY-LOG BRANCH:([\s\S]*?)-->/.exec(template);
  assert.ok(branchNote, 't_retrospective.html must state which sections the empty-log branch keeps - it is the only written home for that split');
  const omitAt = branchNote[1].indexOf('OMIT');
  assert.ok(omitAt > 0, 'the empty-log note must separate kept from omitted sections with OMIT');

  const unclassified = sections.filter((title) => !branchNote[1].includes(title));
  assert.deepStrictEqual(unclassified, [], `a section the empty-log branch neither keeps nor omits leaves that branch's output to guesswork: ${unclassified.join(', ')}`);
  const kept = sections.filter((title) => branchNote[1].indexOf(title) < omitAt);

  assert.ok(
    kept.some((title) => /systemic/i.test(title)),
    'the systemic-proposals class ships on the empty-log branch too - an entry-free friction log is not an empty retrospective'
  );
  const threshold = readTocH2Threshold();
  assert.ok(
    kept.length < threshold,
    `the empty-log branch keeps ${kept.length} h2 sections; at ${threshold} or more the manual AC-5 check must expect a TOC nav on this branch as well`
  );
  assert.ok(
    sections.length >= threshold,
    `the full branch has ${sections.length} h2 sections; below ${threshold} the shell omits the nav and the manual AC-5 check expecting one is wrong`
  );

  const actions = /<section id="actions">([\s\S]*?)<\/section>/.exec(template);
  assert.ok(actions, 't_retrospective.html must keep the actions section - it is where recommendations live');
  assert.ok(/F-\d/.test(actions[1]), 'every recommendation traces to the friction entry it addresses (AC-4), so the actions table carries an F-N reference');
  assert.ok(/consumer\s*\|\s*asd/.test(actions[1]), 'recommendations split consumer-project vs ASD-framework (AC-4), so the actions table names the acting side');
});

// ===========================================================================
// 19. Sprint 008 retro-007 remediation: split-dispatch partition proof
// (AC-1/AC-6), typed risk routing (AC-10), and derived_handoff (AC-11).
// ===========================================================================

const SECTIONED_RUBRIC = '# Reviewer\n\n## Review rubric\n\n### Alpha\n\n- **Nested label**: never an id of its own\n\n### Beta\n\n## Signals emitted\n\n### Not a rubric entry\n';

test('AC-1/6/sprint-012 AC-3: emit-manifest partitions a scope above SPLIT_THRESHOLD_FILES into ceil(files / threshold) disjoint near-even parts in manifest order, each a stamped whole manifest carrying the out-of-part predicate and validating on its own; --halve splits an unsplit scope in two and fails closed when parts would outnumber files', () => {
  const threshold = runtime.SPLIT_THRESHOLD_FILES;
  const scope = (count) => Array.from({ length: count }, (_, index) => `src/file-${index + 1}.md`);
  const emit = (files, halve) => runtime.emitCoverageManifests({ reviewer: 'testing', phase: 'impl-review', rubric: SECTIONED_RUBRIC, files, halve });
  const vocabulary = runtime.LEDGER_VOCABULARY;
  const outOfPart = runtime.NA_PREDICATES.outOfPart;

  for (const [count, halve, expectedParts] of [[threshold, false, 1], [threshold + 1, false, 2], [2 * threshold + 1, false, 3], [2, true, 2]]) {
    const files = scope(count);
    const parts = emit(files, halve);
    const label = `${count} file(s)${halve ? ' with --halve' : ''}`;
    assert.strictEqual(parts.length, expectedParts, `${label}: AC-3 fixes the part count at ceil(files / ${threshold}) above the threshold, one at or below it, two on the interruption trigger`);
    assert.deepStrictEqual(parts.flatMap((part) => part.files), files, `${label}: the parts' file lists must concatenate back to the scope exactly - disjoint, in manifest order, nothing dropped - or union property (a) blocks every merge and a dropped file is reviewed by nobody`);
    const sizes = parts.map((part) => part.files.length);
    assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1, `${label}: parts must be near-even (${sizes}), since the split exists because one dispatch could not hold the whole scope`);
    parts.forEach((part, index) => {
      assert.deepStrictEqual([part.rules, part.sections], [['Alpha', 'Beta'], ['Alpha', 'Beta']], `${label} part ${index + 1}: every part carries the full rubric - union property (b)`);
      assert.strictEqual(part.digest, runtime.coverageManifestDigest(part), `${label} part ${index + 1}: each part is stamped with its own digest by the emitter, never by a later manifest-digest --write`);
      for (const kind of ['rules', 'sections']) {
        for (const id of part[kind]) {
          assert.strictEqual((part.n_a[kind][id] || []).includes(outOfPart), expectedParts > 1, `${label} part ${index + 1}: ${kind} "${id}" must carry the out-of-part predicate exactly when the scope is split - it is the only truthful n/a for an id whose evidence sits in another part, and meaningless on an unsplit manifest`);
        }
      }
      const resolve = (done) => (index === 0 ? { s: done } : { s: vocabulary.p, p: outOfPart });
      const ledger = {
        manifest_digest: part.digest, findings: [],
        files: part.files.map((i) => ({ i, s: vocabulary.files[0] })),
        rules: part.rules.map((i) => Object.assign({ i }, resolve(vocabulary.rules[0]))),
        sections: part.sections.map((i) => Object.assign({ i }, resolve(vocabulary.sections[0]))),
      };
      let verdict;
      try {
        verdict = runtime.validateCoverageLedger(part, ledger, []);
      } catch (error) {
        verdict = `rejected: ${error.message}`;
      }
      assert.deepStrictEqual(verdict, { ok: true }, `${label} part ${index + 1}: a part is a whole manifest over its own subset, so validate-ledger must accept it unchanged${expectedParts > 1 && index > 0 ? ' - including the out-of-part n/a rows of a part that reviewed nothing itself' : ''}`);
    });
  }

  let verdict;
  try {
    verdict = emit(scope(1), true);
  } catch (error) {
    verdict = `rejected: ${error.message}`;
  }
  assert.ok(String(verdict).startsWith('rejected:'), `--halve on a one-file scope must fail closed: a part holding no file validates vacuously and reports a review that never happened. Got: ${JSON.stringify(verdict)}`);
});

test('AC-10: a typed target:"change" risk routes exactly like the legacy bare-string form', () => {
  const base = { objectiveInputs: true, failedObjectiveCheck: false, correctionAttempts: 0, kind: 'mechanical', checks: ['deterministic-check', 'exhaustive-match-validation'] };
  const legacy = runtime.routeTask({ ...base, risks: ['auth'] });
  const typed = runtime.routeTask({ ...base, risks: [{ name: 'auth', target: 'change' }] });
  assert.deepStrictEqual(typed, legacy, 'a typed target:"change" entry must be indistinguishable in output from the legacy bare-string form');
});

test('AC-10: a typed target:"artifact" risk never escalates by itself - it routes on the task\'s own evidence and only annotates the reason', () => {
  const mechanicalEvidence = { objectiveInputs: true, failedObjectiveCheck: false, correctionAttempts: 0, kind: 'mechanical', checks: ['deterministic-check', 'exhaustive-match-validation'], risks: [{ name: 'critical-config', target: 'artifact' }] };
  assert.deepStrictEqual(
    runtime.routeTask(mechanicalEvidence),
    { tier: 'mechanical', execution: 'agent', reason: 'artifact-risk:critical-config' },
    'otherwise-mechanical evidence plus an artifact risk must still route mechanical, with the reason recording that a risk was seen and deliberately not escalated'
  );
  const standardEvidence = { objectiveInputs: true, failedObjectiveCheck: false, correctionAttempts: 0, kind: 'standard', checks: [], risks: [{ name: 'critical-config', target: 'artifact' }] };
  assert.deepStrictEqual(
    runtime.routeTask(standardEvidence),
    { tier: 'standard', execution: 'agent', reason: 'artifact-risk:critical-config' },
    'standard evidence plus an artifact risk must route standard, not escalate'
  );
});

test('AC-10: the no-downgrade clamp outranks an artifact-risk reason, and any declared risk - change or artifact - forces execution:agent even for an otherwise-deterministic command', () => {
  const clamped = runtime.routeTask({
    objectiveInputs: true, failedObjectiveCheck: false, correctionAttempts: 0, kind: 'mechanical',
    checks: ['deterministic-check', 'exhaustive-match-validation'], risks: [{ name: 'critical-config', target: 'artifact' }], priorTier: 'critical',
  });
  assert.deepStrictEqual(clamped, { tier: 'critical', execution: 'agent', reason: 'no-downgrade' }, 'an artifact risk must never let a task fall out of a priorTier it already earned - the clamp reason wins over the artifact-risk reason');

  const commandBase = { objectiveInputs: true, failedObjectiveCheck: false, correctionAttempts: 0, kind: 'command', checks: ['deterministic-state'] };
  assert.strictEqual(runtime.routeTask({ ...commandBase, risks: [{ name: 'auth', target: 'change' }] }).execution, 'agent', 'a change risk on an otherwise-deterministic command must still force execution:agent');
  assert.strictEqual(runtime.routeTask({ ...commandBase, risks: [{ name: 'audit-log', target: 'artifact' }] }).execution, 'agent', 'an artifact risk on an otherwise-deterministic command must still force execution:agent - no declared risk of either kind ever auto-executes');
});

test('AC-10: routing fails closed on every malformed risks shape - a task never routes lower on invalid evidence', () => {
  const base = { objectiveInputs: true, failedObjectiveCheck: false, correctionAttempts: 0, kind: 'standard', checks: [] };
  const cases = [
    ['non-array risks', 'not-an-array', /risks must be an array of risks/],
    ['null entry', [null], /risks entry must be a name or a typed risk/],
    ['number entry', [5], /risks entry must be a name or a typed risk/],
    ['array entry', [[]], /risks entry must be a name or a typed risk/],
    ['empty name', [{ name: '', target: 'change' }], /risks entry name must be a non-empty string/],
    ['NUL-bearing name', [{ name: 'a\0b', target: 'change' }], /risks entry name must be a non-empty string/],
    ['missing target', [{ name: 'x' }], /risks entry target must be change or artifact/],
    ['unknown target', [{ name: 'x', target: 'other' }], /risks entry target must be change or artifact/],
  ];
  for (const [label, risks, message] of cases) {
    assert.throws(() => runtime.routeTask({ ...base, risks }), message, label);
  }
});

test('AC-10: a mixed array of one change risk and one artifact risk still routes critical, with the reason naming the change risk', () => {
  const result = runtime.routeTask({
    objectiveInputs: true, failedObjectiveCheck: false, correctionAttempts: 0, kind: 'mechanical',
    checks: ['deterministic-check', 'exhaustive-match-validation'],
    risks: [{ name: 'auth', target: 'change' }, { name: 'config-file', target: 'artifact' }],
  });
  assert.deepStrictEqual(result, { tier: 'critical', execution: 'agent', reason: 'risk:auth' }, 'a change risk anywhere in the array must win the tier and the reason over a co-occurring artifact risk');
});

test('AC-10: a failed objective check with a correction attempt outranks a co-occurring artifact risk in the reason, so state.json.task_routing never mislabels an escalated task as merely risk-annotated', () => {
  const result = runtime.routeTask({
    objectiveInputs: true, failedObjectiveCheck: true, correctionAttempts: 1, kind: 'standard',
    checks: [], risks: [{ name: 'config-file', target: 'artifact' }],
  });
  assert.deepStrictEqual(result, { tier: 'critical', execution: 'agent', reason: 'failed-objective-check' }, 'a failed objective check with at least one correction attempt must win the reason over a co-occurring artifact risk');
});

test('AC-10: an artifact risk whose priorTier does not outrank the computed tier keeps the artifact-risk reason - the no-downgrade clamp must not fire merely because priorTier is set', () => {
  const result = runtime.routeTask({
    objectiveInputs: true, failedObjectiveCheck: false, correctionAttempts: 0, kind: 'mechanical',
    checks: ['deterministic-check', 'exhaustive-match-validation'], risks: [{ name: 'critical-config', target: 'artifact' }], priorTier: 'mechanical',
  });
  assert.deepStrictEqual(result, { tier: 'mechanical', execution: 'agent', reason: 'artifact-risk:critical-config' }, 'priorTier equal to the computed tier must not clamp - the reason must still name the artifact risk, not no-downgrade');
});

test('AC-6/sprint-010 AC-6a: review-policy.md states the bounded one-transcription enforcement branch and keeps an interrupted dispatch out of it; both *-review workflows cite that branch and still route an interrupted dispatch to reject-and-re-dispatch', () => {
  const policy = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/review-policy.md'), 'utf8');
  assert.ok(policy.includes('is re-dispatched fresh in the same iteration'), 'review-policy.md must state the re-dispatch outcome for an interrupted reviewer - never a skip, never an APPROVE');
  assert.ok(policy.includes('Interrupted attempts: <count> (<cause>)'), 'review-policy.md must state the durable per-file record an interrupted dispatch leaves on the written review file');

  assert.ok(policy.includes('A first failure earns one transcription'), 'sprint-010 AC-6a: the enforcement paragraph must split by failure class - a ledger resolving every row in the wrong shape costs a whole re-dispatch under a single reject rule, which is the friction F-6 recorded');
  assert.ok(policy.includes('never runs twice on one return'), 'the transcription must be bounded at one attempt, or a workflow can iterate on a reviewer\'s return until it passes - re-encoding the gate away rather than through');
  assert.ok(policy.includes('Transcription never supplies a status, predicate or finding id the return did not carry'), 'the branch is only safe while it re-encodes evidence the reviewer actually returned; supplying a missing status is the workflow forging the coverage the ledger exists to prove');
  assert.ok(policy.includes('never the transcription branch, which has no returned ledger to re-encode'), 'AC-6a: an interrupted dispatch returns no ledger at all, so it must stay on the reject path - routed into transcription, a dispatch that produced nothing would be re-encoded into a verdict');

  const citation = 'sole SSoT for trigger, partition, union property, merge rule and durable record';
  const reDispatchPhrase = 'takes the same reject-and-re-dispatch-fresh path as a failed validation above';
  for (const file of ['asd-phase-design-review.md', 'asd-phase-impl-review.md']) {
    const workflow = fs.readFileSync(path.join(REPO_ROOT, `.asd/workflows/${file}`), 'utf8');
    assert.ok(workflow.includes(citation), `${file} must cite review-policy.md as sole SSoT for the interrupted/split-dispatch contract, including the durable record, rather than restating it`);
    assert.ok(workflow.includes(reDispatchPhrase), `${file} must route an interrupted dispatch (no verdict token, no ledger) through the same reject-and-re-dispatch-fresh handling as a failed ledger validation - a future edit dropping this from one workflow while review-policy.md still claims it must fail here`);
    assert.ok(workflow.includes('A failure earns one transcription and re-run per `review-policy.md` "Coverage ledger" enforcement'), `${file} is the acting site for AC-6a: the validation step must carry the transcription branch and cite its owner, or the rule's second case exists in prose and never in any workflow that could perform it`);
    assert.ok(workflow.includes('never that step\'s transcription branch'), `${file} must exclude an interrupted dispatch from transcription at the branch itself - the exclusion holds only where the two paths are adjacent`);
  }
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

test('AC-10: a reserved change-risk class name declared target:"artifact" fails closed, case- and separator-normalized, without over-matching a merely-similar name', () => {
  const base = { objectiveInputs: true, failedObjectiveCheck: false, correctionAttempts: 0, kind: 'standard', checks: [] };
  const reservedAsArtifact = ['security', 'SECURITY', 'Authentication', 'migration', 'public contract', 'public-contract', 'public_contract', 'Workflow  Gate'];
  for (const name of reservedAsArtifact) {
    assert.throws(() => runtime.routeTask({ ...base, risks: [{ name, target: 'artifact' }] }), /reserved risk class is change by definition/, name);
  }
  assert.doesNotThrow(() => runtime.routeTask({ ...base, risks: [{ name: 'security', target: 'change' }] }), 'the same reserved name typed target:"change" is exactly the intended usage, never rejected');
  assert.doesNotThrow(() => runtime.routeTask({ ...base, risks: [{ name: 'security-audit-tool', target: 'artifact' }] }), 'a name that merely contains a reserved word must not be caught - the reserved check is exact-match after normalization, not substring');
  assert.doesNotThrow(() => runtime.routeTask({ ...base, risks: [{ name: 'config-file', target: 'artifact' }] }), 'a non-reserved artifact risk name must keep routing on evidence, unaffected by the new guard');
});

test('AC-13a: artifact-layout.md "Agent memory" is the one owner of agent memory\'s review-surface status in both modes, and each site it names cites it instead of keeping a mode-specific restatement', () => {
  const owner = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/artifact-layout.md'), 'utf8');
  const ownerStatement = owner.split('\n').find((line) => line.includes('In the review surface, both modes'));
  assert.ok(ownerStatement, 'artifact-layout.md "Agent memory" must carry the mode-independent statement of the property');
  assert.ok(ownerStatement.includes('never an exclusion in any review scope'), 'the property must be stated of any review scope, not from inside the self-hosting carve-out it used to live in');
  assert.ok(ownerStatement.includes('Sole statement of the property'), 'the owner must claim sole ownership, so a restatement reappearing elsewhere is a visible contract break rather than a silent fifth copy');

  const restatement = /`\.claude\/agent-memory\/\*\*`[^\n]*?not[^\n]*?excluded/i;
  assert.ok(!restatement.test(owner.replace(ownerStatement, '')), 'the owner file itself must not also carry the old exclusion-list restatement. Keyed on the owner-plus-citations shape rather than on a copy count - the count is what the deliberate collapse to one owner turned red. Scope limit: this matches inside ONE line (these rule docs keep a paragraph on a single line), so a restatement split across two paragraphs is out of its reach');
  for (const rel of ['.asd/rules/sprint-lifecycle.md', '.asd/rules/external-review.md', '.asd/templates/external-review/t_prompt-external-impl.md']) {
    const base = path.basename(rel);
    assert.ok(ownerStatement.includes(base), `the owner statement must name ${base} as one of its citing sites - an unnamed citer is how a fifth copy gets written`);
    const content = fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');
    assert.ok(/artifact-layout\.md`? "Agent memory"/.test(content), `${rel} must cite artifact-layout.md "Agent memory" for agent memory's review-surface status`);
    assert.ok(!restatement.test(content), `${rel} must not restate the property - the four mode-specific copies were collapsed into the single owner, and any of them growing back is the drift this shape catches`);
  }
});

test('T-2: AGENTS.md is sole SSoT for the --apply <generated-view-path...> explanatory parenthetical; asd-dev.md, asd-update/SKILL.md, asd-phase-impl.md, custom-coding-rules.md and README.md cite providers.md instead of restating it', () => {
  const fullParenthetical = 'pass generated view paths, never `.asd/` canon: `.claude/agents/<name>.md`, `.codex/agents/<name>.toml`, `.claude/skills/<name>/SKILL.md`, `.agents/skills/<name>/SKILL.md`';
  const citation = 'Canonical path -> per-provider path';
  const agents = fs.readFileSync(path.join(REPO_ROOT, 'AGENTS.md'), 'utf8');
  assert.ok(agents.includes(fullParenthetical), 'AGENTS.md must carry the full --apply explanatory parenthetical - the sole owner');

  const otherSites = [
    '.asd/agents/asd-dev.md',
    '.asd/skills/asd-update/SKILL.md',
    '.asd/workflows/asd-phase-impl.md',
    '.asd/project/custom-coding-rules.md',
    'README.md',
  ];
  for (const rel of otherSites) {
    const content = fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');
    assert.ok(!content.includes(fullParenthetical), `${rel} must not restate the full --apply explanatory parenthetical - AGENTS.md is the sole SSoT`);
    assert.ok(content.includes(citation), `${rel} must cite providers.md "${citation}" instead of restating the parenthetical`);
  }
});

test('T-2/AC-3: artifact-layout.md documents the <reviewer>.part-N.md split-review naming and the sprint-folder-purity statement alongside the Agent-memory carve-out; README.md and t_review.md carry the matching mirrors', () => {
  const artifactLayout = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/artifact-layout.md'), 'utf8');
  assert.ok(artifactLayout.includes('design/iter-NN/<reviewer>.md, <reviewer>.part-N.md, <reviewer>.late.md'), 'artifact-layout.md path map must name every review-file variant under design reviews');
  assert.ok(artifactLayout.includes('impl/iter-NN/<reviewer>.md, <reviewer>.part-N.md, <reviewer>.late.md'), 'artifact-layout.md path map must name every review-file variant under impl reviews');
  assert.ok(artifactLayout.includes('A sprint folder holds **only** the artifacts named above'), 'artifact-layout.md must state the sprint-folder-purity contract');
  assert.ok(artifactLayout.includes('`agent-memory/` has no canonical source under `.asd/` and `sync.js` neither generates nor reconciles it'), 'artifact-layout.md must state the Agent-memory read-only carve-out reasoning');

  const readme = fs.readFileSync(path.join(REPO_ROOT, 'README.md'), 'utf8');
  assert.ok(readme.includes('is hand-authored, not generated'), 'README.md must mirror the agent-memory hand-authored exception to the generated-view read-only rule');

  const reviewTemplate = fs.readFileSync(path.join(REPO_ROOT, '.asd/templates/t_review.md'), 'utf8');
  assert.ok(reviewTemplate.includes('Interrupted attempts: {{count}} ({{cause}})'), 't_review.md must ship the interrupted-attempts placeholder line the durable-record rule (review-policy.md) depends on');
  assert.ok(reviewTemplate.includes('<reviewer>.part-N.md'), 't_review.md must ship the split-form note pointing to <reviewer>.part-N.md');
});

test('T-3/AC-2: providers.md states the never-heredoc file-write rule for artifact content', () => {
  const providers = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/providers.md'), 'utf8');
  assert.ok(providers.includes('never a shell heredoc/here-string'), 'providers.md must state that writing an artifact never goes through a shell heredoc/here-string');
});

test('T-3/AC-7: providers.md\'s asd-dev role-scoped-context row cites the review-policy.md over-engineering/structure-cohesion checklists', () => {
  const providers = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/providers.md'), 'utf8');
  assert.ok(providers.includes('`review-policy.md` over-engineering and structure/cohesion checklists'), 'providers.md must cite the over-engineering/structure-cohesion checklists in asd-dev\'s role-scoped-context row');
});

test('T-2: feedback_no-shell-review-method.md cites asd-reviewer-testing.md\'s frontmatter for the reviewer\'s tool grant instead of re-enumerating it, and that frontmatter really is read-only - guards the stale-grant regression (D-2) that once claimed a Write tool this reviewer does not have', () => {
  const memory = fs.readFileSync(path.join(REPO_ROOT, '.claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md'), 'utf8');
  assert.ok(memory.includes('.asd/agents/asd-reviewer-testing.md` frontmatter'), 'must cite the agent frontmatter as the tool-grant home rather than restating a tool list that can drift from it');

  const agentSrc = sync.readNormalized(path.join(REPO_ROOT, '.asd/agents/asd-reviewer-testing.md'));
  const { meta } = sync.parseCanonicalFrontmatter(agentSrc);
  assert.deepStrictEqual(meta.claude.tools, ['Read', 'Glob', 'Grep', 'AskUserQuestion'], 'the frontmatter this memory now cites must actually be the read-only grant it claims, or the citation points somewhere false');
  assert.ok(!meta.claude.tools.includes('Write') && !meta.claude.tools.includes('Edit') && !meta.claude.tools.includes('Bash'), 'this reviewer must have no Write/Edit/Bash grant to cite');

  const grantedLower = meta.claude.tools.map((t) => t.toLowerCase());
  const toolToken = '(?:Read|Glob|Grep|Write|Edit|Bash|AskUserQuestion|WebFetch|WebSearch|NotebookEdit|TodoWrite|Task)';
  const enumerationPattern = new RegExp(`\\b${toolToken}\\b(?:\\s*[/,]\\s*\\b${toolToken}\\b)+`, 'gi');
  const enumerations = memory.match(enumerationPattern) || [];
  for (const group of enumerations) {
    for (const name of group.split(/[/,]/).map((s) => s.trim())) {
      assert.ok(grantedLower.includes(name.toLowerCase()), `memory re-enumerates tool "${name}" (in "${group}"), which is not in the cited frontmatter's grant [${meta.claude.tools.join(', ')}] - a re-enumerated grant must never disagree with what it cites, in any casing`);
    }
  }
});

test('T-2/C-2: canon_hashes covers only .asd/agents/*.md and .asd/skills/*/SKILL.md - the tree scope feedback_no-shell-review-method.md\'s per-tree collateral-failure count (three/two/one) depends on', () => {
  const entries = sync.computeCanonHashes(REPO_ROOT);
  assert.ok(entries.length > 0, 'sanity: computeCanonHashes must find at least one entry in this repo');
  for (const [key] of entries) {
    assert.ok(/^agents\/[^/]+\.md$/.test(key) || /^skills\/[^/]+\/SKILL\.md$/.test(key), `canon_hashes key "${key}" must be under agents/*.md or skills/*/SKILL.md - a third tree here would silently invalidate the memory's per-tree collateral-count claim`);
  }
  assert.strictEqual(entries.some(([key]) => key.startsWith('hooks/')), false, 'session-start.js and other hooks must never appear in canon_hashes - the memory\'s "hooks/t_AGENTS.md/t_CLAUDE.md -> two, not three" claim depends on this exclusion');
});

test('T-2/T-4/sprint-010 TST-01: in every agent-memory directory a dispatchable agent can load, MEMORY.md and the files beside it are a bijection - an index line landing without its target, and a memory file no index points at, both fail here', () => {
  const roster = fs.readdirSync(path.join(REPO_ROOT, '.claude/agents')).filter((name) => name.endsWith('.md')).map((name) => name.slice(0, -3)).sort();
  assert.ok(roster.length > 0, 'sanity: the agent roster must be derived from .claude/agents/*.md, or every check below passes vacuously - the hardcoded two-directory list this replaced is what let three of one round\'s six memory writes go unchecked');
  const memoryRoot = path.join(REPO_ROOT, '.claude/agent-memory');
  const written = fs.readdirSync(memoryRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  assert.deepStrictEqual(written.filter((dir) => !roster.includes(dir)), ['asd-pm'], 'retired asd-pm must stay the only memory directory outside the roster: a directory no agent name matches is loaded by nobody, so a new name here is a memory write that reaches no dispatch - and it silently drops out of the loop below, which is the vacuity this comparison closes');

  for (const agent of written.filter((dir) => roster.includes(dir))) {
    const dir = path.join(memoryRoot, agent);
    const memories = fs.readdirSync(dir).filter((name) => name.endsWith('.md') && name !== 'MEMORY.md').sort();
    const indexPath = path.join(dir, 'MEMORY.md');
    if (!fs.existsSync(indexPath)) {
      assert.deepStrictEqual(memories, [], `${agent}/ holds memory files with no MEMORY.md beside them - nothing indexes them, so every one of them is a write no dispatch ever reads`);
      continue;
    }
    const index = fs.readFileSync(indexPath, 'utf8');
    const links = [...index.matchAll(/\]\(([^)]+\.md)\)/g)].map((m) => m[1]);
    assert.ok(links.length > 0, `${agent}/MEMORY.md must list at least one memory file`);
    for (const link of links) {
      assert.ok(fs.existsSync(path.join(dir, link)), `${agent}/MEMORY.md links to "${link}" which does not exist`);
    }
    for (const memory of memories) {
      assert.ok(links.includes(memory), `${agent}/${memory} is written but not indexed by its MEMORY.md - only the index is always in context, so an unindexed memory is one the agent never loads and writing it was a no-op`);
    }
  }
  const devIndex = fs.readFileSync(path.join(REPO_ROOT, '.claude/agent-memory/asd-dev-critical/MEMORY.md'), 'utf8');
  assert.ok(devIndex.includes('project_crlf-canon-edits.md'), 'asd-dev-critical/MEMORY.md must index the CRLF canon-edit hazard file added this sprint');
});

test('AC-15: review-policy.md is sole SSoT for the reviewer read-only reconciliation (artifact-write scope vs. the memory:project write channel), and providers.md cites it instead of restating it', () => {
  const policy = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/review-policy.md'), 'utf8');
  assert.ok(policy.includes('Reviewers write no review artifact, code or doc'), 'review-policy.md must state the scoped (non-absolute) claim of what reviewers cannot write');
  assert.ok(policy.includes('memory: project` is a separate write channel reviewers do use'), 'review-policy.md must reconcile the artifact-level claim with the memory:project write channel the host actually grants, or a future edit could re-widen the claim back to a false absolute');

  const providers = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/providers.md'), 'utf8');
  assert.ok(providers.includes('Reviewer agents carry no artifact-write grant on either host'), 'providers.md must state the artifact-level grant fact it owns (tool config), distinct from the reconciliation review-policy.md owns');
  assert.ok(providers.includes('Gate Verdict Format'), 'providers.md must cite review-policy.md "Gate Verdict Format" for what the read-only claim covers and excludes, rather than restating the reconciliation independently');
  assert.ok(!providers.includes('memory: project` is a separate write channel reviewers do use'), 'providers.md must not restate the reconciliation sentence itself - that duplication is exactly what the citation exists to prevent');
  assert.ok(!policy.includes('Sole statement of this claim'), 'the unscoped sole-statement claim was false the moment it was written (iter-03 DOC-1b): both review workflows and a rule doc also state that the reviewer itself performs no write, so an owning-side claim that every other site merely links contradicted them and invited a cut at whichever site was read next. Scope limit: this guards the literal from coming back, never the truth of a reworded ownership claim - over this corpus no derivable proxy separates a true declaration from a false one (test-plan.md, entry 5). The two assertions above are what keep it from going vacuous: they require the scoped statement to still be here');

  const scopeLine = policy.split('\n').find((line) => line.includes('Reviewers write no review artifact, code or doc')) || '';
  assert.ok(/agent memory/i.test(scopeLine) && scopeLine.includes('`artifact-layout.md`'), 'the scoped claim was STILL false after iter-03 (iter-04 EXT-1): a reviewer\'s own hand-authored memory file restated both halves this line claims only it states. A declaration must therefore bound its reach and name the surface it excludes. Asserted here: the line keeps a carve-out for agent memory AND a pointer to the rule that owns that surface - deliberately NOT the "in canon" qualifier the fix happened to word it with, which a synonym defeats and a correct rewording reddens. That the pointer resolves is the citation sweep\'s job; that this declaration still carries one is this assert\'s');
});

test('AC-15: providers.md records which emitted agent frontmatter fields are host-verified vs. emitted on trust', () => {
  const providers = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/providers.md'), 'utf8');
  assert.ok(providers.includes('Host-honoured, and observable in dispatch'), 'providers.md must name the frontmatter fields the host actually verifies/observes at dispatch');
  assert.ok(providers.includes('Emitted on trust: `effort` and `maxTurns`'), 'providers.md must record that effort/maxTurns are emitted by sync.js on trust, not verified by either host, so they are never relied on as an enforcement boundary');
});

test('AC-15: .asd/sync.js and .asd/skills/asd-update/update.js carry no non-Latin-script text - workflow infrastructure is English always (language-policy.md)', () => {
  const nonLatinScript = /[Ͱ-ϿЀ-ӿ֐-׿؀-ۿऀ-ॿ฀-๿぀-ヿ㐀-䶿一-鿿가-힯]/;
  for (const rel of ['.asd/sync.js', '.asd/skills/asd-update/update.js']) {
    const content = fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');
    const offender = content.match(nonLatinScript);
    assert.strictEqual(offender, null, `${rel} must contain no non-Latin-script character (found "${offender && offender[0]}") - this round removed the Russian comments quoting a project plan document (AC-15); a future re-introduction must fail here, not wait for direct read`);
  }
});

test('AC-15/iter-05: providers.md names External Review as the sole Bash carve-out among read-only reviewers, and that claim matches actual frontmatter grants', () => {
  const providers = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/providers.md'), 'utf8');
  assert.ok(providers.includes('Reviewer agents carry no artifact-write grant on either host, with one carve-out.'), 'providers.md must state the carve-out, not the unqualified universal it replaced');
  assert.ok(providers.includes('Config-enforced for the four internal reviewers'), 'providers.md must scope the config-enforced guarantee to the four internal reviewers, not all reviewer agents');
  assert.ok(providers.includes('External Review is the carve-out'), 'providers.md must name External Review as the exception, not leave the carve-out unattributed');
  assert.ok(providers.includes('needs `Bash` to invoke the wrapped CLI'), 'providers.md must state why the carve-out needs Bash');
  assert.ok(!providers.includes('Enforced by config, not by a textual instruction repeated in reviewer bodies.'), 'the prior blanket enforcement sentence (true only for the four internal reviewers) must not survive verbatim now that a fifth reviewer agent is carved out');

  const externalRaw = sync.readNormalized(path.join(REPO_ROOT, '.asd/agents/asd-external-review.md'));
  const { meta: externalMeta, body: externalBody } = sync.parseCanonicalFrontmatter(externalRaw);
  assert.ok(externalMeta.claude.tools.includes('Bash'), 'the agent providers.md names as the carve-out must actually carry the Bash grant the prose claims');

  const writeBan = externalBody.split('\n').find((line) => line.includes('no file writes at all')) || '';
  assert.ok(/memory/i.test(writeBan), 'External Review is the only reviewer whose body carries a blanket file-write prohibition, and its own frontmatter grants `memory: project` - so the prohibition must carve that channel out on the same bullet, where a reader of the ban sees it (iter-04 companion fix). Left unscoped it tells the agent its memory writes are forbidden while the host grants them, and that contradiction is invisible to every tool-grant assertion in this test');
  assert.strictEqual(externalMeta.claude.memory, 'project', 'the carve-out cites `memory: project` as a grant this agent holds; if the frontmatter stops granting it, the body points at a channel that does not exist - the config-side twin of a dangling citation, and unasserted anywhere before this');

  for (const name of ['asd-reviewer-correctness', 'asd-reviewer-documentation', 'asd-reviewer-efficiency', 'asd-reviewer-testing']) {
    const raw = sync.readNormalized(path.join(REPO_ROOT, '.asd/agents', `${name}.md`));
    const { meta } = sync.parseCanonicalFrontmatter(raw);
    assert.ok(!meta.claude.tools.includes('Bash'), `${name}: providers.md claims the four internal reviewers are config-enforced with no Bash - ${name} must not carry it`);
  }
});

test('T-2/iter-05: asd-reviewer-correctness memory cites review-policy.md/providers.md for the reviewer write scope instead of restating the unqualified "reviewers are read-only on both providers" claim providers.md just corrected', () => {
  const memory = fs.readFileSync(path.join(REPO_ROOT, '.claude/agent-memory/asd-reviewer-correctness/feedback_review-method-no-shell.md'), 'utf8');
  assert.ok(!memory.includes('reviewers are read-only on both providers'), 'must not restate the unqualified universal claim providers.md corrected this round');
  assert.ok(memory.includes('review-policy.md') && memory.includes('Gate Verdict Format'), 'must cite review-policy.md "Gate Verdict Format" for write scope rather than restating it');
  assert.ok(memory.includes('.asd/rules/providers.md'), 'must cite providers.md for the tool mapping rather than re-enumerating tool names');
  assert.ok(!/\b(Write|Edit|Bash)\b(\s*[/,]\s*`?\b(Write|Edit|Bash)\b){1,}/.test(memory), 'must not re-enumerate a tool-name list that can silently drift from the cited frontmatter');
});

// ===========================================================================
// 20. Sprint 009 retro-008 remediation. Two kinds of contract: the ledger
// vocabulary runtime.js now publishes and enforces from one constant (AC-5),
// and the single-home/citation contracts the sprint's rule edits depend on -
// each of which is a two-site coupling that rots silently when only one site
// is edited. Wording is asserted by token, never by whole sentence or copy
// count: the over-tight `totalMatches === 4` assertion this sprint had to
// rewrite is the failure class these are written against.
// ===========================================================================

function readRepoFile(rel) {
  return fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');
}

/** Every internal reviewer, named as `emit-manifest --reviewer` takes it, derived from the canonical agents it reads rubrics from. */
function internalReviewers() {
  return fs.readdirSync(path.join(REPO_ROOT, '.asd/agents')).map((file) => /^asd-reviewer-([a-z]+)\.md$/.exec(file)).filter(Boolean).map((match) => match[1]);
}

/** A canon file with line endings normalized, so `^`/`$` anchors hold in a CRLF working tree. */
function canonText(rel) {
  return readRepoFile(rel).replace(/\r\n/g, '\n');
}

/** The body of the first `## <heading>` section, prefix-matched as canon citations are. */
function sectionOf(rel, heading) {
  const body = canonText(rel).split(`\n## ${heading}`)[1];
  assert.ok(body !== undefined, `${rel} must keep its "${heading}" section`);
  return body.split('\n## ')[0];
}

/** One numbered step of a workflow section, sub-bullets included. */
function stepOf(section, step) {
  const block = section.split(/\n(?=\d+[a-z]?\. )/).find((candidate) => candidate.startsWith(`${step}. `));
  assert.ok(block, `step ${step} must still exist`);
  return block;
}

/** Every canonical Markdown file ASD ships - the search space for a "sole home" claim. */
function canonMarkdownFiles() {
  const out = [];
  for (const root of ['.asd/rules', '.asd/workflows', '.asd/agents', '.asd/skills', '.asd/templates']) {
    for (const entry of fs.readdirSync(path.join(REPO_ROOT, root), { recursive: true })) {
      const rel = `${root}/${String(entry).split(path.sep).join('/')}`;
      if (rel.endsWith('.md') && fs.statSync(path.join(REPO_ROOT, rel)).isFile()) out.push(rel);
    }
  }
  return out;
}

test('AC-5: LEDGER_VOCABULARY is the single source validateCoverageLedger enforces - each status is accepted only for its own row type, `p`/`f` sit exactly where the constant says, and widening the constant widens the validator', () => {
  const vocabulary = runtime.LEDGER_VOCABULARY;
  const rowTypes = ['files', 'rules', 'sections'];
  const plainStatus = (rowType) => vocabulary[rowType].find((s) => s !== vocabulary.p && s !== vocabulary.f);

  function fixture(rowType, row) {
    const manifest = buildManifest(['files-1'], ['rules-1'], ['sections-1']);
    manifest.digest = runtime.coverageManifestDigest(manifest);
    const ledger = { manifest_digest: manifest.digest, findings: ['F-1'] };
    for (const type of rowTypes) ledger[type] = [type === rowType ? row : { i: `${type}-1`, s: plainStatus(type) }];
    return { manifest, ledger };
  }
  const decorate = (rowType, status) => {
    const row = { i: `${rowType}-1`, s: status };
    if (status === vocabulary.p) row.p = `no-${rowType}-1`;
    if (status === vocabulary.f) row.f = 'F-1';
    return row;
  };
  const validate = ({ manifest, ledger }) => runtime.validateCoverageLedger(manifest, ledger, ['F-1']);

  for (const rowType of rowTypes) {
    for (const status of vocabulary[rowType]) {
      assert.deepStrictEqual(validate(fixture(rowType, decorate(rowType, status))), { ok: true }, `${rowType}: status "${status}" is published by LEDGER_VOCABULARY, so the validator must accept it. Each fixture carries exactly one id per row type, so a rejection can only come from the row type under test`);
    }
    for (const foreign of [...new Set(rowTypes.flatMap((t) => vocabulary[t]))].filter((s) => !vocabulary[rowType].includes(s))) {
      assert.throws(() => validate(fixture(rowType, decorate(rowType, foreign))), /status invalid/, `${rowType}: status "${foreign}" belongs to another row type only - accepting it would let a reviewer report coverage in a vocabulary its own manifest never offered`);
    }
    const naRow = decorate(rowType, vocabulary.p);
    delete naRow.p;
    assert.throws(() => validate(fixture(rowType, naRow)), /predicate/, `${rowType}: "${vocabulary.p}" must require its predicate - the constant names it as the one status carrying \`p\``);
    const strayP = Object.assign(decorate(rowType, plainStatus(rowType)), { p: `no-${rowType}-1` });
    assert.throws(() => validate(fixture(rowType, strayP)), /predicate only allowed/, `${rowType}: only "${vocabulary.p}" may carry \`p\``);
    if (vocabulary[rowType].includes(vocabulary.f)) {
      const findingRow = decorate(rowType, vocabulary.f);
      delete findingRow.f;
      assert.throws(() => validate(fixture(rowType, findingRow)), /finding reference/, `${rowType}: "${vocabulary.f}" must require its finding reference`);
    }
    const strayF = Object.assign(decorate(rowType, plainStatus(rowType)), { f: 'F-1' });
    assert.throws(() => validate(fixture(rowType, strayF)), /finding reference only allowed/, `${rowType}: only "${vocabulary.f}" may carry \`f\``);
  }

  const savedFiles = vocabulary.files.slice();
  try {
    vocabulary.files.push('provisionally-checked');
    assert.deepStrictEqual(validate(fixture('files', { i: 'files-1', s: 'provisionally-checked' })), { ok: true }, 'the validator must read LEDGER_VOCABULARY itself - a status list re-hardcoded beside the constant is exactly the drift AC-5 exists to prevent');
  } finally {
    vocabulary.files.length = 0;
    vocabulary.files.push(...savedFiles);
  }
  assert.deepStrictEqual(vocabulary.files, savedFiles, 'the constant must be restored - later tests digest manifests through it');
});

test('AC-5/AC-6b/sprint-012 AC-1: validate-ledger tolerates a manifest predating each published constant - every publication-order prefix of them, none included - and rejects a divergent one even when its digest was recomputed', () => {
  const ledgerFor = (manifest) => ({
    manifest_digest: manifest.digest, findings: [],
    files: [{ i: 'f-1', s: 'checked' }], rules: [{ i: 'r-1', s: 'pass' }], sections: [{ i: 's-1', s: 'reviewed' }],
  });

  const prePublicationDigest = (manifest) => {
    const copy = Object.assign({}, manifest);
    delete copy.digest;
    return runtime.fingerprint(copy);
  };
  const validate = (manifest) => runtime.validateCoverageLedger(manifest, ledgerFor(manifest), []);

  const published = [
    ['vocabulary', runtime.LEDGER_VOCABULARY, (value) => { value.files = [...value.files, 'provisionally-checked']; }, /vocabulary/],
    ['row_example', runtime.LEDGER_ROW_EXAMPLE, (value) => { value.p = 'invented predicate'; }, /row example/],
    ['n_a_shape', runtime.LEDGER_NA_SHAPE, (value) => { delete value[Object.keys(value)[0]]; }, /n_a shape/],
  ];

  for (let count = 0; count < published.length; count += 1) {
    const legacy = buildManifest(['f-1'], ['r-1'], ['s-1']);
    for (const [field, constant] of published.slice(0, count)) legacy[field] = structuredClone(constant);
    for (const [field] of published.slice(count)) assert.strictEqual(legacy[field], undefined, `sanity: the backward-tolerance fixture must genuinely lack \`${field}\``);
    legacy.digest = prePublicationDigest(legacy);
    assert.deepStrictEqual(validate(legacy), { ok: true }, `a manifest stamped before \`${published[count][0]}\` was published carries only the ${count} constant(s) ahead of it AND a digest stamped without it - reproduced from the untouched \`fingerprint\` primitive, so the fixture stays a legacy artefact instead of tracking whatever the digester does today. Each published constant must be independently optional, or publishing the next one silently invalidates every manifest the previous ones stamped (correctness F-2)`);
  }

  for (const [field, constant, diverge, rejection] of published) {
    const current = buildManifest(['f-1'], ['r-1'], ['s-1']);
    current[field] = structuredClone(constant);
    current.digest = runtime.coverageManifestDigest(current);
    assert.deepStrictEqual(validate(current), { ok: true }, `a manifest publishing \`${field}\` must validate against a ledger written in it`);

    const divergent = buildManifest(['f-1'], ['r-1'], ['s-1']);
    divergent[field] = structuredClone(constant);
    diverge(divergent[field]);
    divergent.digest = runtime.coverageManifestDigest(divergent);
    assert.throws(() => runtime.validateCoverageLedger(divergent, ledgerFor(divergent), []), rejection, `a hand-edited manifest publishing a \`${field}\` the validator does not enforce must be rejected outright - recomputing its digest makes it self-consistent, so the digest check alone never catches it`);
  }
});

test('AC-6b: the published row example is a row validateCoverageLedger accepts once its placeholders are filled, carries exactly the decoration its own status requires, and review-policy.md publishes the same key set', () => {
  const example = runtime.LEDGER_ROW_EXAMPLE;
  const manifest = buildManifest(['f-1'], ['r-1'], ['s-1']);
  manifest.row_example = structuredClone(example);
  manifest.digest = runtime.coverageManifestDigest(manifest);
  const ledgerWith = (fileRow) => ({
    manifest_digest: manifest.digest, findings: [],
    files: [fileRow], rules: [{ i: 'r-1', s: 'pass' }], sections: [{ i: 's-1', s: 'reviewed' }],
  });
  const placeholders = { i: 'f-1', p: 'no-f-1' };
  const filled = Object.fromEntries(Object.entries(example).map(([key, value]) => [key, key in placeholders ? placeholders[key] : value]));

  assert.strictEqual(example.s, runtime.LEDGER_VOCABULARY.p, 'the example must publish the one status the vocabulary names as carrying `p` - that pairing is the whole reason a single row can demonstrate the shape. Keyed to the vocabulary constant rather than to the status literal, so renaming the status moves both sides together');
  let verdict;
  try {
    verdict = runtime.validateCoverageLedger(manifest, ledgerWith(filled), []);
  } catch (error) {
    verdict = `rejected: ${error.message}`;
  }
  assert.deepStrictEqual(verdict, { ok: true }, 'AC-6b: every reviewer copies this row shape out of its own manifest, so an example the validator rejects would teach every reviewer to return a ledger that fails the blocking gate - a failure visible only as a re-dispatch, never as a bad example. The rejection reason is reported in place of the verdict so the break names itself');

  const undecorated = Object.assign({}, filled);
  delete undecorated.p;
  assert.throws(() => runtime.validateCoverageLedger(manifest, ledgerWith(undecorated), []), /predicate/, 'the example must carry the decorating key its status REQUIRES: dropping `p` from the filled row is rejected, which is what proves the published `p` is load-bearing rather than ornamental');

  const policyLine = readRepoFile('.asd/rules/review-policy.md').split('\n').find((line) => line.includes('"row_example"'));
  assert.ok(policyLine, 'review-policy.md "Coverage ledger" must publish the row example beside `vocabulary` - the orchestrator building a manifest reads the rule, the reviewer reads the manifest');
  for (const key of Object.keys(example)) {
    assert.ok(policyLine.includes(`"${key}"`), `review-policy.md's published example must name every key \`.asd/runtime.js\` actually stamps, \`${key}\` included - a documented shape short of the emitted one is the drift AC-6b's single-constant seam exists to prevent`);
  }
});

test('sprint-010 T-1/D-2: a manifest keying `n_a` by row type - the shape a phase workflow emits - authorizes an n/a row of every row type, while any other keying is rejected by name instead of degrading to no authorized predicate', () => {
  const vocabulary = runtime.LEDGER_VOCABULARY;
  const rowTypes = Object.keys(vocabulary).filter((key) => Array.isArray(vocabulary[key]));
  const ids = { files: ['f-1'], rules: ['r-1'], sections: ['s-1'] };
  const stamp = (manifest) => { manifest.digest = runtime.coverageManifestDigest(manifest); return manifest; };
  const ledgerFor = (manifest, rows) => Object.assign({ manifest_digest: manifest.digest, findings: [] }, rows);
  const verdictOf = (manifest, ledger) => {
    try { return `accepted: ${JSON.stringify(runtime.validateCoverageLedger(manifest, ledger, []))}`; } catch (error) { return `rejected: ${error.message}`; }
  };

  assert.deepStrictEqual(rowTypes, Object.keys(ids), 'both sides derive the row types from the vocabulary constant, so a fourth one must reach this fixture in the same change - otherwise every sweep below silently stops covering it');
  const naRows = Object.fromEntries(rowTypes.map((type) => [type, ids[type].map((id) => ({ i: id, s: vocabulary.p, p: `no-${id}` }))]));
  const plainRows = Object.fromEntries(rowTypes.map((type) => [type, ids[type].map((id) => ({ i: id, s: vocabulary[type][0] }))]));
  assert.ok(rowTypes.every((type) => vocabulary[type][0] !== vocabulary.p), 'the plain ledger must genuinely carry no n/a row: a malformed manifest paired with one is the combination that passed silently before D-2, and a plain status equal to the n/a status would collapse that case into the rejection case beside it');

  const emitted = stamp(buildManifest(ids.files, ids.rules, ids.sections));
  assert.strictEqual(verdictOf(emitted, ledgerFor(emitted, naRows)), 'accepted: {"ok":true}', 'D-2: `n_a` is the one manifest field an orchestrator hand-builds per dispatch (review-policy.md "Coverage ledger": the allowed n/a predicates per individual ID), and nothing bound the shape it writes - row type, then id, then predicate list - to the shape validateCoverageLedger reads back out. One truthful n/a row per row type is what binds them');

  const unauthorized = Object.assign({}, naRows, { files: [{ i: ids.files[0], s: vocabulary.p, p: 'a predicate this manifest never authorized' }] });
  assert.ok(verdictOf(emitted, ledgerFor(emitted, unauthorized)).startsWith('rejected:'), "the predicate must be checked against that id's own list rather than merely be present, or the acceptance above proves only that a well-shaped manifest is ignored consistently");

  const flat = buildManifest(ids.files, ids.rules, ids.sections);
  flat.n_a = Object.fromEntries(rowTypes.flatMap((type) => ids[type].map((id) => [id, [`no-${id}`]])));
  stamp(flat);
  const flatVerdict = verdictOf(flat, ledgerFor(flat, plainRows));
  assert.ok(flatVerdict.startsWith('rejected:') && flatVerdict.includes(ids.files[0]), `D-2: keyed by id instead of by row type, every lookup missed and each id resolved to an empty predicate set - truthful n/a rows rejected as unauthorized while the malformed manifest itself validated, the unknown-id guard iterating an empty object. This exact pairing, a plain ledger over a mis-keyed manifest, is the silent pass, and the rejection must name the offending key or the orchestrator that wrote it has nothing to correct. Got: ${flatVerdict}`);

  for (const malformed of [[], 'files', null, 42]) {
    const broken = stamp(Object.assign(buildManifest(ids.files, ids.rules, ids.sections), { n_a: malformed }));
    assert.ok(verdictOf(broken, ledgerFor(broken, plainRows)).startsWith('rejected:'), `an n_a that is no object of row types (${JSON.stringify(malformed)}) must fail closed: read through the label lookup with its empty-object fallback it degrades to the same empty predicate set as the mis-keyed one above, which rejects truthful rows instead of the manifest`);
  }

  const legacy = buildManifest(ids.files, ids.rules, ids.sections);
  delete legacy.n_a;
  stamp(legacy);
  assert.strictEqual(verdictOf(legacy, ledgerFor(legacy, plainRows)), 'accepted: {"ok":true}', 'a manifest authorizing no n/a at all omits `n_a` entirely, so the shape check must stay conditional on its presence - made mandatory, the fix for D-2 rejects every manifest whose review needed no n/a row');
});

test('AC-1/AC-2: git-strategy.md "Commit before review" is the sole home of the staging prohibition, asd-dev.md carries the git grant that makes it followable, and asd-phase-impl.md states the shared worktree while citing the rule', () => {
  const gitStrategy = readRepoFile('.asd/rules/git-strategy.md');
  assert.ok(gitStrategy.includes('stages only the paths it authored'), 'git-strategy.md must state the staging half of commit ownership (F-1)');
  assert.ok(gitStrategy.includes('commits every path it authored before signalling completion'), 'git-strategy.md must state the ownerless-file half of commit ownership (F-3) - the two halves are one sentence precisely so neither can be dropped alone');

  const prohibition = 'git add -A';
  assert.ok(gitStrategy.includes(prohibition), 'git-strategy.md must carry the broad-stage prohibition itself');
  for (const rel of canonMarkdownFiles()) {
    if (rel === '.asd/rules/git-strategy.md') continue;
    assert.ok(!readRepoFile(rel).includes(prohibition), `${rel} must not restate the broad-stage prohibition - git-strategy.md "Commit before review" is its sole home and every other site cites it`);
  }

  const dev = sync.readNormalized(path.join(REPO_ROOT, '.asd/agents/asd-dev.md'));
  assert.ok(dev.includes('`git add`/`git commit` for its own work'), 'asd-dev.md must grant the commands the new rule obliges it to run, or the rule is unfollowable by the agent it governs');
  assert.ok(dev.includes('never push, never `--no-verify`'), 'the grant must carry the same bounds asd-tester.md already states');
  assert.ok(dev.includes('git-strategy.md'), 'the grant must cite the rule rather than restate its ownership contract');

  const workflow = readRepoFile('.asd/workflows/asd-phase-impl.md');
  assert.ok(workflow.includes('concurrently dispatched tasks share one worktree'), 'AC-2: the dispatch payload must tell a dev why staging discipline matters before a collision teaches it');
  assert.ok(workflow.includes('`git-strategy.md` "Commit before review" — do not restate here'), 'the workflow must cite the rule, not restate it');

  const wholeTreeClause = gitStrategy.split('never a whole-tree command — ')[1];
  assert.ok(wholeTreeClause, 'sprint 010 AC-2: git-strategy.md must name the whole-tree commands as a class, since the ban now covers forms (`--renormalize`, `stash`) that no path-scoped equivalent replaces');
  const wholeTreeCommands = [...wholeTreeClause.split(' — even where')[0].matchAll(/`([^`]+)`/g)].map((match) => match[1]);
  assert.ok(wholeTreeCommands.length >= 4, 'the clause must enumerate the banned commands - an unenumerated "whole-tree command" is not a rule an agent can check its own command against');
  assert.ok(gitStrategy.includes('unconditional for a dispatched agent'), 'AC-2/G-3: the agent-facing half must be unconditional - a dispatched agent cannot observe whether a sibling dispatch is in flight, so a conditional ban would be unfollowable by the role it governs');

  const mirror = readRepoFile('.asd/project/custom-coding-rules.md');
  for (const command of wholeTreeCommands) {
    assert.ok(mirror.includes(command), `custom-coding-rules.md is the one permitted mirror of the staging rule, so it must name every command git-strategy.md bans, \`${command}\` included. Derived from the owner's own clause rather than re-listed here, so extending the ban fails on the un-mirrored side instead of passing on a stale copy`);
  }
  assert.ok(mirror.includes('git-strategy.md'), 'the mirror must hand the full contract back to its owner rather than reading as a second, self-contained rule');
});

test('AC-13b/sprint-010 AC-3: git-strategy.md "Commit before review" names every agent-memory write whose author cannot commit it - the reviewer\'s and a concurrent co-author\'s - and both *-review workflows name that commit at the step that writes the review file', () => {
  const bookkeeping = readRepoFile('.asd/rules/git-strategy.md').split('\n').find((line) => line.includes('The main orchestrator commits its own bookkeeping'));
  assert.ok(bookkeeping, 'git-strategy.md must still enumerate the bookkeeping the orchestrator commits - it is the sole home of commit ownership');
  assert.ok(/agent-memory writes/.test(bookkeeping), 'AC-13b: the memory class must be named in the list the committer reads. Stated only where the reviewer reads it, the write never reaches a commit and the change-surface rule never sees it - the exact one-sided obligation this sprint exists to close');
  assert.ok(bookkeeping.includes('a reviewer holds no commit tool'), 'the reason the orchestrator commits a file it did not author must stand beside the obligation: the same sentence otherwise obliges every dispatched agent to commit its own paths, which a read-only reviewer cannot do');
  assert.ok(bookkeeping.includes('`review-policy.md` "Change-surface rule"'), 'the entry must cite the rule that puts agent memory in the surface, or it reads as an arbitrary extra file and gets dropped by the next editor');

  assert.ok(bookkeeping.includes('concurrent co-author'), 'sprint-010 AC-3: the reviewer carve-out covers a reviewer holding no commit tool; it does not reach an author who HAS one but cannot stage a file a concurrent co-author holds mid-edit. Unnamed, that file is committed by nobody and never reaches the reviewed diff - the same one-sided obligation AC-13b closed for reviewers');
  assert.ok(bookkeeping.includes('`artifact-layout.md` "Agent memory"'), 'the co-author case must cite the file that defines when two agents share one memory file, or "concurrent co-author" is a condition with no definition an agent can evaluate');
  assert.ok(bookkeeping.split(/\.\s/).some((sentence) => /agent-memory writes/.test(sentence) && /\bauthored\b/.test(sentence) && /\bcommits them\b/.test(sentence)), "sprint-012 AC-7: the orchestrator clause names only a memory write whose author cannot commit it, so a dispatched agent holding a commit tool must be told its own memory writes are paths it authored and commits - otherwise each side reads the other as owner and the write reaches no commit (011 F-1)");

  const memoryOwner = readRepoFile('.asd/rules/artifact-layout.md');
  assert.ok(memoryOwner.includes('co-authorship arises only between concurrent dispatches of the same agent'), 'sprint-010 AC-3: artifact-layout.md "Agent memory" defines memory as per-agent, so it must also say when two agents can hold one file - otherwise the collision the commit rule now handles has no stated trigger');

  const reachability = readRepoFile('.asd/rules/review-policy.md');
  assert.ok(reachability.includes('`git-strategy.md` "Commit before review", which owns that bookkeeping'), 'review-policy.md states the obligation but must hand the bookkeeping to its owner rather than keeping a second copy of it');
  assert.ok(/concurrent co-author holds[^\n]*the same rule assigns it/.test(reachability), 'sprint-010 AC-3: "Diff reachability" is where the ownerless-file class is enumerated, so the co-author case belongs in that enumeration as a pointer - a class named only in git-strategy.md is invisible where reviewers and workflows read the reachability rule');

  for (const rel of ['.asd/workflows/asd-phase-impl-review.md', '.asd/workflows/asd-phase-design-review.md']) {
    const writeStep = readRepoFile(rel).split('\n').find((line) => line.includes('the reviewer itself performs no write'));
    assert.ok(writeStep, `${rel} must still carry the review-file write step`);
    assert.ok(writeStep.includes('any agent memory that reviewer authored'), `${rel}: the review-file write step is the acting site - this is the only point in the phase where the orchestrator is holding both the reviewer's output and a commit tool`);
    assert.ok(writeStep.includes('`git-strategy.md` "Commit before review"'), `${rel} must cite the ownership home instead of restating the bookkeeping rule`);
  }
});

test('AC-4/AC-11/AC-14: review-policy.md carries the correlated-interruption branch, the late-duplicate-return evidence exception and the verify-before-applying obligation, and asd-phase-impl.md cites the last rather than restating it', () => {
  const policy = readRepoFile('.asd/rules/review-policy.md');

  assert.ok(policy.includes('**Correlated interruption.**'), 'AC-4: the interrupted-dispatch contract must carry a correlated-failure branch');
  assert.ok(policy.includes('iteration <N> interrupted (<cause>), all dispatches'), 'the iteration-level event needs its own literal log line, since a resume rebuilds the per-iteration count from those entries');
  assert.ok(/raises no reviewer.s attempt count/.test(policy), 'the whole point of the branch is that one session-wide cause must not arm the split trigger once per reviewer');

  assert.ok(policy.includes('**Late duplicate return.**'), 'AC-14: a late-returning replaced dispatch needs a stated disposal');
  assert.ok(policy.includes('<reviewer>.late.md'), 'the admitted late return needs a named artefact home, or the evidence has nowhere to land');
  const layout = readRepoFile('.asd/rules/artifact-layout.md');
  for (const phase of ['design', 'impl']) {
    const row = layout.split('\n').find((line) => line.includes(`${phase}/iter-NN/<reviewer>.md`));
    assert.ok(row && row.includes('<reviewer>.late.md'), `artifact-layout.md's ${phase} reviews row must carry the artefact name review-policy.md mandates: that path map is exhaustive ("A sprint folder holds **only** the artifacts named above"), so a late-return file it omits is one the orchestrator is told to write and a Documentation reviewer is told to flag as stray`);
  }
  const policyReach = policy.split('\n').find((line) => line.includes('**Late duplicate return**') && line.includes('holds for any replaced dispatch'));
  assert.ok(policyReach && policyReach.includes('External Review included'), 'review-policy.md scopes the whole section to the 4 internal reviewers, so the late-duplicate branch only reaches a replaced External Review dispatch while this carve-out stays attached to it - it is the SSoT the two workflow mirrors below are checked against, never a second copy of the reach');
  assert.ok(policyReach.includes('Applies to the 4 internal reviewers, except where a branch states its own reach'), 'the section default plus its delegation clause are what make every acting bullet below load-bearing: a branch silent on reach is not unscoped, it inherits the 4-internal-reviewers default - so a bullet that drops its own reach is wrong rather than merely vague');
  const importedWhole = readRepoFile('.asd/rules/external-review.md').split('\n').find((line) => line.includes('`review-policy.md` "Interrupted dispatch"') && line.includes('imported here whole'));
  assert.ok(importedWhole, 'external-review.md must hand a non-outcome to review-policy.md "Interrupted dispatch" as a WHOLE import: that import is the only thing placing External Review inside a branch whose section default is the 4 internal reviewers, so it is the source the two interrupted-bullet mirrors below are derived from - narrow it and their reach becomes an unsourced claim (the AC-8 test checks only that the boundary is named, never that the import is whole)');
  for (const [phase, rel] of [['design', '.asd/workflows/asd-phase-design-review.md'], ['impl', '.asd/workflows/asd-phase-impl-review.md']]) {
    const reviewFlow = readRepoFile(rel);
    const lateLine = reviewFlow.split('\n').find((line) => line.includes('per `review-policy.md` "Late duplicate return" (sole SSoT'));
    assert.ok(lateLine, `${rel} must bind the branch at the step that records verdicts and cite the rule as its sole home: review-policy.md names the phase workflow, never the returning agent, as the actor, so a workflow that never mentions it is an obligation with no acting site`);
    assert.ok(lateLine.includes('External Review included'), `${rel}: the acting bullet must state review-policy.md's reach carve-out on the same line as its citation. Reach is delegated to each branch and never inherited from the enclosing step header, and the section default behind that delegation is the 4 internal reviewers, so a bullet silent on reach discards precisely the late External Review the branch exists to admit (iteration 3 finding: at that point the header itself claimed "internal reviewers only" and the silent bullet inherited it outright). Line-scoped on purpose: a carve-out parked elsewhere in the file satisfies a file-level check while the acting site stays narrow`);
    const artefacts = reviewFlow.split('## Artefacts produced')[1];
    assert.ok(artefacts && artefacts.includes(`<sprint>/reviews/${phase}/iter-NN/<reviewer>.late.md`), `${rel} must name the late-return file in its Artefacts produced list - that list is what the orchestrator writes from, and an artefact a rule mandates but no workflow declares is one nobody ever produces`);
    const interruptedLine = reviewFlow.split('\n').find((line) => line.trimStart().startsWith('- Interrupted dispatch'));
    assert.ok(interruptedLine, `${rel}: the interrupted branch must be written out as its own bullet at the acting step - review-policy.md delegates reach to each branch, so a branch that is not written out at the acting step has its reach stated nowhere the orchestrator reads`);
    assert.ok(interruptedLine.includes('External Review included'), `${rel}: the interrupted bullet must carry its own reach on its own line, for the same reason the late-duplicate bullet does. Re-narrowed to the section default, it tells the orchestrator NOT to re-dispatch a cut-short External Review dispatch and not to log the attempt, and step 8/9 then blocks on an absent \`external\` key with nothing in decisions-log to explain it`);
    assert.ok(interruptedLine.includes('`external-review.md` "Outcome contract"'), `${rel}: the reach and the rule it is derived from must be one sentence - external-review.md imports "Interrupted dispatch" whole, and a wider reach asserted with no citation back to that import reads as contradicting the section default and gets edited out`);
    const splitLine = reviewFlow.split('\n').find((line) => line.trimStart().startsWith('- Split dispatch'));
    assert.ok(splitLine && splitLine.includes('internal reviewers only'), `${rel}: the split bullet must keep the section default stated explicitly - with both neighbouring bullets now reading "External Review included", harmonizing the third is the plausible edit, and widened it authorizes partitioning a dispatch that returns no coverage ledger to merge at all (step 7/8: External Review is exempt from validate-ledger)`);
  }
  assert.ok(policy.includes('more severe of the two tokens'), 'the recorded verdict must move to the more severe token, never to whichever returned last');
  assert.ok(policy.includes('any APPROVE latch for that reviewer cleared'), 'an admitted late return must clear that reviewer\'s latch, or it stays dispatch-skipped on the strength of an APPROVE its own admitted evidence just overturned');
  const lifecycle = readRepoFile('.asd/rules/sprint-lifecycle.md');
  const latchRoute = lifecycle.split('\n').find((line) => line.includes('clearing route') && line.includes('`review-policy.md` "Late duplicate return"'));
  assert.ok(latchRoute, 'sprint-lifecycle.md "APPROVE latch" is the sole home of latch persistence and claims to name EVERY route that clears it, so the late-return route must appear there - matched by its citation, never by its ordinal, which this sprint already reworded once ("A THIRD" -> "A further")');
  assert.ok(/clears that reviewer.s latch, that one key only/.test(latchRoute), 'the route must state its blast radius: clearing more than the one key would silently re-dispatch reviewers whose verdicts nothing contradicted');
  assert.ok(/late APPROVE never displaces a recorded CONCERNS\/FAIL/.test(policy), 'the exception is evidence-only and one-directional - without this the branch becomes a way to launder a FAIL into an APPROVE');

  assert.ok(policy.includes('**Verify before applying.**'), 'AC-11: a reviewer\'s proposed fix must be verified against source before it is applied');
  assert.ok(policy.includes('An equivalent correct fix stays permitted'), 'verification must not narrow the existing autofix latitude');
  const workflow = readRepoFile('.asd/workflows/asd-phase-impl.md');
  assert.ok(workflow.includes('`review-policy.md` "Verify before applying" — do not restate here'), 'the impl side of AC-11 must cite the rule at the point the dev reads its fix instruction; a rule no dispatched agent reads is the failure mode this sprint exists to fix');
  const verify = sectionOf('.asd/rules/review-policy.md', 'Autofix vs escalation').split('\n').find((line) => line.startsWith('**Verify before applying.**'));
  assert.ok(verify && /non-binding/.test(verify),'sprint-012 AC-8: the suggested fix must be non-binding at its home, so a creator may resolve the finding another way without every dispatch payload having to grant that');
  const reviewFixPayload = workflow.split('\n').find((line) => line.includes('review-fix — grouped finding list'));
  assert.ok(reviewFixPayload && !reviewFixPayload.includes('suggested fix'), 'sprint-012 AC-8: the review-fix payload must no longer hand the dev a suggested fix as a payload field - carried there, it reads as the instruction the rule just made non-binding');
  assert.ok(!readRepoFile('.asd/workflows/asd-phase-design-review.md').includes('(no escalation needed)'), 'sprint-012 AC-8: the design-review autofix bullet must cite "Autofix vs escalation" instead of restating a latitude the rule now owns');
});

test('AC-8/sprint-010 AC-4/sprint-014 AC-1: external-review.md "Outcome contract" is the sole home of what a dispatched External Review may return - a verdict, the preflight-only availability skip or the partial - an availability skip reaches the friction log as well as the decisions log, review-policy.md hands the whole question to it, and the agent, report template, latch rule and both review workflows carry the outcome literals the contract defines', () => {
  const external = readRepoFile('.asd/rules/external-review.md');
  assert.ok(external.includes('## Outcome contract'), 'external-review.md must carry the outcome contract as its own named section, since review-policy.md and the agent both cite it by name');
  assert.ok(/awaits the wrapped CLI inside its own dispatch and never backgrounds it/.test(external), 'F-8 was a dispatch that returned while its CLI was still running - the await obligation is the fix');
  assert.ok(external.includes('is not permitted and is not a verdict'), 'an empty return must be named as none of the outcomes, or it stays an undefined extra state');
  assert.ok(external.includes('"Interrupted dispatch"'), 'the contract must name where a non-outcome is disposed, rather than leaving the boundary with review-policy.md a hole');
  assert.ok(external.includes('a precondition missing before any invocation (prompt template absent) aborts the dispatch instead'), 'the outcome contract is scoped to a dispatch that reached the invocation; drop this carve-out and a missing prompt template returns an availability skip, which passes a review gate on an artefact that was never reviewed - the F-8 class itself');

  const skipBullet = external.split('\n').find((line) => line.includes('APPROVE (skipped: external review unavailable: <specific status>)`; the dispatching workflow persists'));
  assert.ok(skipBullet, 'external-review.md must state what the workflow does with an availability skip on the same bullet that defines the skip');
  assert.ok(/friction entry/.test(skipBullet) && skipBullet.includes(FRICTION_APPEND_REF.split(' per ')[1]), 'sprint-010 AC-4: a skipped External Review is a review that did not happen, so it must reach the friction log as well as the decisions log - recorded nowhere durable, the retro cannot see that a required reviewer never ran. Keyed to the same `sprint-lifecycle.md` "Friction log" citation every phase workflow carries, so the writer mechanism stays stated once');

  const contract = sectionOf('.asd/rules/external-review.md', 'Outcome contract');
  const partial = /`\[REVIEW-<phase>-external\]: (APPROVE \(partial: [^`]+\))`/.exec(contract);
  const interrupted = /`(external review interrupted: [^`]+)`/.exec(contract);
  assert.ok(partial && interrupted, 'sprint-014 AC-1: the contract must define the partial outcome and the interrupted return as literals, the shapes every other site below is checked against');
  const partialBullet = contract.split('\n').find((line) => line.includes(partial[1]));
  assert.ok(/never\b[^.]*latch/.test(partialBullet) &&partialBullet.includes('`F-N`'), 'sprint-014 AC-1: the partial outcome satisfies its iteration without latching and gets an `F-N` entry - a partial left undurable, or latched, removes External Review from the sprint while files it never read stay unreviewed');
  assert.ok(!contract.includes('**any** inability to complete'), 'sprint-014 AC-1: the skip is narrowed to a non-ready preflight or negative cache - a post-invocation failure returning the skip passes the gate on a review that did not happen');

  const policy = readRepoFile('.asd/rules/review-policy.md');
  assert.ok(!policy.includes("External Review's unavailability path is"), 'the old scoping line handed off only the unavailability path, which is what left an empty return undisposed on both sides');
  assert.ok(policy.includes('`external-review.md` "Outcome contract"'), 'review-policy.md must point at the outcome contract as a whole');
  const grammarLink = /external-review\.md`? (?:"|§ )Outcome contract/;
  assert.ok(sectionOf('.asd/rules/review-policy.md', 'Gate Verdict Format').split('\n').some((line) => line.startsWith('- ') && grammarLink.test(line)), 'EXT-5: the review-policy.md verdict grammar must link the skip/partial carve-out, or a literal grammar match rejects a valid External Review return');
  assert.ok(readRepoFile('README.md').split('\n').some((line) => line.includes('[REVIEW-<phase>-<reviewer>]') && grammarLink.test(line)), 'EXT-5: the README verdict-token grammar mirror must link the skip/partial carve-out on the line that states the grammar');
  const stalemateInput = sectionOf('.asd/rules/external-review.md', 'Stalemate detection').split('\n').find((line) => /\bpartial\b/.test(line));
  assert.ok(stalemateInput && /\bskip\b/.test(stalemateInput) && /phase skill/i.test(stalemateInput), 'TST-1-1: "Stalemate detection" must have the phase skill exclude partial and skip iterations from the finding set it supplies - compared against a partial, a real stalemate is missed');
  for (const rel of ['.asd/workflows/asd-phase-impl-review.md', '.asd/workflows/asd-phase-design-review.md']) {
    assert.ok(canonText(rel).includes('`external-review.md` "Stalemate detection"'), `TST-1-1: ${rel} supplies the stalemate finding set, so it must cite external-review.md "Stalemate detection"`);
  }

  const agent = sync.readNormalized(path.join(REPO_ROOT, '.asd/agents/asd-external-review.md'));
  assert.ok(agent.includes('Never background or detach the `{{wraps_cli}}` run'), 'the never-background Don\'t must be stated on the placeholder token both views render');
  const outcomeDont = agent.split('\n').find((line) => line.startsWith('- Never return anything but') && line.includes('`external-review.md` "Outcome contract"'));
  assert.ok(outcomeDont, 'the agent must carry the outcome contract as a Don\'t citing its home, not only the rule doc it may not read');
  for (const literal of ['APPROVE (skipped: external review unavailable: <specific status>)', partial[1], interrupted[1]]) {
    assert.ok(outcomeDont.includes(literal), `the agent's outcome Don't must carry \`${literal}\` exactly as external-review.md defines it, or that return parses as prose`);
  }
  const abortSignal = agent.split('\n').find((line) => line.includes('ABORT — precondition not met: <artefact>'));
  assert.ok(abortSignal && abortSignal.includes('only before any `{{wraps_cli}}` invocation'), 'the acting half of the rule\'s carve-out: the agent\'s ABORT must be scoped to the pre-invocation window, or the agent emits an outcome the contract forbids');
  assert.ok(abortSignal && abortSignal.includes(interrupted[1]) && abortSignal.includes('`external-review.md` "Outcome contract"') && !abortSignal.includes('returns the availability skip'), 'sprint-014 AC-1: the post-invocation half must stay on the signal line, return the interrupted form rather than the availability skip, and cite the contract as its home');

  for (const rel of ['.asd/agents/asd-external-review.md', '.asd/templates/external-review/t_review-report.md', '.asd/workflows/asd-phase-impl-review.md', '.asd/workflows/asd-phase-design-review.md', '.asd/rules/sprint-lifecycle.md']) {
    assert.ok(canonText(rel).includes(partial[1]), `sprint-014 AC-1: ${rel} must carry the partial outcome as external-review.md defines it - the agent returns it, the report template renders it, the workflows write it verbatim to verdicts, the latch rule excludes it`);
  }
  const carried = /as its `([^`]+)` line/.exec(sectionOf('.asd/rules/external-review.md', 'Iteration semantics'));
  assert.ok(carried, 'external-review.md "Iteration semantics" must name the line a partial, skip or stopped iteration records its unreviewed files on');
  assert.ok(canonText('.asd/templates/external-review/t_review-report.md').includes(`**${carried[1]}**`), `sprint-014 AC-1: t_review-report.md must slot the \`${carried[1]}\` line the next iteration reads`);
  assert.ok(canonText('.asd/templates/external-review/t_review-report.md').includes('APPROVE (skipped: external review unavailable: <specific status>)'), "EXT-5: t_review-report.md's first-line alternatives must admit the skip token the skip's external.md carries");
  assert.ok(skipBullet.includes(`\`${carried[1]}\``) && skipBullet.includes('`files[]`'), `COR-4: the availability skip must persist a \`${carried[1]}\` line naming the files[] it never reviewed - on a skip no agent runs, so nothing else writes it and those files never reach External Review`);
  for (const [rel, step] of [['.asd/workflows/asd-phase-impl-review.md', '1b. '], ['.asd/workflows/asd-phase-design-review.md', '3a. ']]) {
    const sentences = canonText(rel).split('\n').find((line) => line.startsWith(step)).split(/(?<=\.) /);
    assert.ok(sentences.some((sentence) => sentence.includes('non-ready') && sentence.includes('`files[]`') && sentence.includes(`\`${carried[1]}\``)), `COR-4: ${rel} step ${step.slice(0, -2)} must still compute files[] on a non-ready preflight as the skip's \`${carried[1]}\` - skipped with the manifest, the skip has no list to write`);
  }
  for (const rel of ['.asd/workflows/asd-phase-impl-review.md', '.asd/workflows/asd-phase-design-review.md']) {
    assert.ok(canonText(rel).split('\n').some((line) => line.includes('`files[]`') && line.includes(`previous iteration's \`${carried[1]}\``)), `sprint-014 AC-1: ${rel} must union the previous iteration's \`${carried[1]}\` into the External Review files[] - dropped, a partial's unreviewed files are never reviewed while the partial satisfies DoD`);
  }
  const latch = sectionOf('.asd/rules/sprint-lifecycle.md', 'APPROVE latch');
  assert.ok(latch.includes(partial[1]) && latch.includes('only for the bare `"APPROVE"` token'), 'sprint-014 AC-1: the latch rule both workflows cite must name the partial as a non-latching value and keep the bare-token-only latch write that excludes it');
});

test('AC-6: code-style.md §19 names the line-ending editing hazard platform-neutrally and requires the staged pre-commit lint, and this repo\'s own commands.yaml configures that form', () => {
  const style = readRepoFile('.asd/rules/code-style.md');
  assert.ok(/Preserve a file.s existing line endings/.test(style), 'F-7 was a scripted edit that assumed \\n on a CRLF file - the rule must name the hazard where the dev reads it');
  assert.ok(style.includes('Symptom: a whole-file diff for a small edit'), 'the rule must name the observable symptom, or it cannot be acted on mid-edit');
  assert.ok(style.includes('`git diff --cached --check`'), 'the measured blind spot: the bare form exits 0 once the damage is staged');
  assert.ok(/a project.s configured `lint` command must be the staged form/.test(style), 'the rule must bind a project\'s configured lint to the staged form, not merely suggest it');
  assert.ok(!/CRLF on disk|canon is CRLF/i.test(style), 'code-style.md ships to every consumer through managed_paths, so it must not assert this repository\'s own worktree line endings as universal');

  const lintLine = readRepoFile('.asd/project/commands.yaml').split('\n').find((line) => line.startsWith('lint:'));
  assert.ok(lintLine && lintLine.includes('--cached'), 'commands.yaml must configure the staged form the rule requires. `.asd/project/**` is outside every review surface, so this assertion is the only automated check that rule and configured command agree');
});

test('AC-7: a root .gitattributes normalizes line endings for the whole repository, and no tracked blob is CRLF in the index', () => {
  assert.ok(/^\*\s+text=auto\s+eol=lf\s*$/m.test(readRepoFile('.gitattributes')), 'the root .gitattributes must declare `* text=auto eol=lf`, so line endings stop depending on each machine\'s core.autocrlf');

  let listing;
  try {
    listing = execFileSync('git', ['ls-files', '--eol'], { cwd: REPO_ROOT, encoding: 'utf8' });
  } catch (error) {
    assert.fail(`this assertion needs the \`git\` binary and a git work tree at ${REPO_ROOT}: the index line ending is the property under test and nothing in the worktree can show it. Run from a clone with git on PATH, or this criterion is unverifiable here. Underlying: ${error.message}`);
  }
  const offenders = listing.split('\n').filter(Boolean).filter((line) => /^i\/(crlf|mixed)\b/.test(line)).map((line) => line.split('\t').pop());
  assert.deepStrictEqual(offenders, [], 'every tracked blob must be LF in the index; a CRLF blob here is the committed form of the F-7 damage, invisible in a worktree that shows CRLF for every file anyway');
});

test('AC-3/AC-12: sprint-lifecycle.md owns retro-criterion re-verification and the conditional Reachability declaration, asd-phase-scope.md implements the first, and t_plan.md mirrors the second without making it per-task mandatory', () => {
  const lifecycle = readRepoFile('.asd/rules/sprint-lifecycle.md');
  assert.ok(lifecycle.includes('Retrospective-derived criteria are re-verified at scope'), 'AC-3: the obligation must be stated where the orchestrator reads its scope rules');
  assert.ok(/Recording home is `decisions-log.md` alone/.test(lifecycle), 'the recording half is what makes the verification reviewable rather than assumed');
  assert.ok(lifecycle.includes('`sprint.md` gains no section for this'), 'the audit-gate decision that no new sprint-artefact section is invented must survive in the rule, or a later sprint re-invents one');
  const scope = readRepoFile('.asd/workflows/asd-phase-scope.md');
  assert.ok(scope.includes('retrospective-derived criterion against current `HEAD`'), 'the scope workflow must implement the obligation, not merely leave it in a rule doc');
  assert.ok(scope.includes('"Orchestration and adaptive gates"'), 'the workflow must cite sprint-lifecycle.md rather than restate the obligation');

  assert.ok(lifecycle.includes('**Reachability declaration**'), 'AC-12: reachability must be part of the plan grammar');
  assert.ok(lifecycle.includes('Reachability: <phase> writes <value> at <point>; <phase> reads it at <point>'), 'the declaration needs a stated shape, or "which two phases agree" is unreviewable');
  assert.ok(/an absent `Reachability` line asserts the task has no cross-phase dependency/.test(lifecycle), 'the absence semantics must be stated explicitly - the neighbouring `Material risk` line fails closed to critical, and the two must never be conflated');

  const template = readRepoFile('.asd/templates/t_plan.md');
  assert.ok(template.includes('`Reachability:` line'), 't_plan.md must mirror the declaration in its parser-critical format rules');
  const taskBlocks = template.split(/^### Task /m).slice(1);
  assert.ok(taskBlocks.length >= 2, 'sanity: t_plan.md must ship more than one example Task block');
  for (const block of taskBlocks) assert.ok(/^Material risk:/m.test(block), 'every example Task block must carry the mandatory Material risk line');
  assert.ok(taskBlocks.some((block) => !/^Reachability:/m.test(block)), 't_plan.md must ship at least one example Task without a Reachability line - the template is where an author reads whether the line is conditional or mandatory, and a copy on every block teaches the wrong one');
});

test('AC-15: checkpoints.md surfaces a criterion\'s running cost from artefacts the sprint already writes, and the decisions-log literal it counts is the one asd-phase-impl.md actually emits', () => {
  const checkpoints = readRepoFile('.asd/rules/checkpoints.md');
  const heading = '## Criterion cost surfacing';
  assert.strictEqual(checkpoints.split('\n').filter((line) => line.trim() === heading).length, 1, 'checkpoints.md must carry the surfacing obligation exactly once');
  for (const rel of canonMarkdownFiles()) {
    if (rel === '.asd/rules/checkpoints.md') continue;
    assert.ok(!readRepoFile(rel).includes(heading), `${rel} must not carry a second copy of the surfacing obligation - it hangs off gates checkpoints.md already owns`);
  }
  assert.ok(checkpoints.includes('no counter is stored'), 'the mechanism was accepted at the audit gate on the condition that it adds no new state; a stored counter is the thing that can drift out of sync with the artefacts');
  assert.ok(checkpoints.includes('`<sprint>/reviews/<phase>/iter-NN/`'), 'the iterations-charged unit must name the artefact it is derived from');

  const matchedTail = 'for iter-NN: findings resolved';
  assert.ok(checkpoints.includes(`matched on the stable tail \`${matchedTail}\``), 'the fix-rounds-charged unit must state the literal it matches decisions-log entries on, or the count is unreproducible');
  assert.ok(checkpoints.includes('however the mode is named'), 'the tail is mode-agnostic on purpose: the orchestrator really writes "impl review-fix for iter-NN: findings resolved", which a match keyed to the mode name does not select - that miss is what made the previous whole-heading literal read zero on real data');

  const citedStep = /`asd-phase-impl\.md` step (\d+) is the emitting SSoT/.exec(checkpoints);
  assert.ok(citedStep, 'checkpoints.md must cite the workflow step that emits the entry it counts; without a named emitter the tail is a literal accountable to nobody');
  const workflowLines = readRepoFile('.asd/workflows/asd-phase-impl.md').split('\n');
  const emitted = workflowLines.map((line) => /append decisions-log entry "([^"]*iter-NN[^"]*)"/.exec(line)).filter(Boolean);
  assert.strictEqual(emitted.length, 1, 'exactly one place in asd-phase-impl.md may emit the per-iteration fix-round entry - two emitters means two wordings, and the counter can only match one');
  assert.ok(emitted[0][1].endsWith(matchedTail), `the entry asd-phase-impl.md emits ("${emitted[0][1]}") must END WITH the tail checkpoints.md matches on ("${matchedTail}"): the property is that what the emitter writes is selected by what the counter matches, so a rewording on either side that breaks the containment silently drops the count to zero and no gate notices`);
  const emitIndex = workflowLines.findIndex((line) => line.includes(`append decisions-log entry "${emitted[0][1]}"`));
  const owningStep = workflowLines.slice(0, emitIndex + 1).reverse().find((line) => /^\d+[a-z]?\. /.test(line));
  assert.ok(owningStep && owningStep.startsWith(`${citedStep[1]}. `), `checkpoints.md cites step ${citedStep[1]} as the emitting SSoT, so the emitting line must sit inside that step - a renumbered workflow leaves the citation pointing at a step that emits nothing`);
});

test('AC-10: asd-phase-impl.md builds fix modes as one ordered chain with no parallelism, while the initial dispatch step keeps its own parallel-where-independent wording', () => {
  const lines = readRepoFile('.asd/workflows/asd-phase-impl.md').split('\n');
  const fixModes = lines.find((line) => line.trim().startsWith('- fix modes'));
  assert.ok(fixModes, 'the execution-graph step must still carry a fix-modes bullet');
  assert.ok(fixModes.includes('one ordered chain, never a concurrent set'), 'sprint 008\'s two parallel fix rounds each cost a review iteration; the graph must build fix tasks sequentially');
  for (const removed of ['parallel where independent', 'sequential where they collide', 'parallelisable']) {
    assert.ok(!fixModes.includes(removed), `the fix-modes bullet must authorize no parallelism: "${removed}" is the wording AC-10 removes, and it reading as history rather than instruction is not enough`);
  }
  assert.ok(fixModes.includes('dispatched only after the dev chain completes'), 'one ordered chain per half is not enough: the two halves must also be ordered against each other, or a tester chain runs while the dev chain is still editing the shared worktree and tests a tree nobody committed');
  assert.ok(fixModes.includes('exactly one agent is in flight across the whole round'), 'the round-level invariant is the reviewable claim; without it "one ordered chain" reads as scoped to each chain separately, which is exactly the reading sprint 009 iter-01 ran on');

  const dispatchLine = lines.find((line) => line.includes('sequential where dependent; parallel where independent'));
  assert.ok(dispatchLine, 'the dispatch step\'s own parallelism, shared with initial mode, must survive - AC-10 narrows fix modes only, and losing this line would serialize the whole phase');
  assert.ok(dispatchLine.includes('initial mode only'), 'the surviving parallelism must be scoped where it is stated: unscoped, the dispatch step reads as authorizing in a fix mode precisely what step 5 forbids, and a reader reaching step 6 first follows it');
});

test('sprint-010 AC-9 (C-10): a Claude reasoning effort outside its vocabulary fails the render closed wherever the field is emitted, symmetrically with the Codex check - `ultra` being a Codex-only value', () => {
  const check = (canon) => {
    const root = makeMiniRepo();
    writeAgentCanon(root, 'effort-probe', canon);
    return () => sync.runCheck(root);
  };
  const withClaudeEffort = (value) => GOOD_AGENT_CANON.replace('"effort": "high"', `"effort": ${JSON.stringify(value)}`);

  assert.doesNotThrow(check(withClaudeEffort('xhigh')), 'the vocabulary must admit every value the host accepts - a check narrower than the host silently forbids a legitimate retier');
  assert.doesNotThrow(check(GOOD_AGENT_CANON.replace('"effort": "high",\n', '')), 'effort is optional (the haiku tier declares none), so an absent field must stay valid - a required-field check would reject every mechanical variant');
  assert.doesNotThrow(check(GOOD_AGENT_CANON.replace('"model_reasoning_effort": "high"', '"model_reasoning_effort": "ultra"')), 'the two vocabularies differ by exactly this member: `ultra` is valid on a non-luna Codex model, so a Claude check copied onto the Codex side (or vice versa) breaks one of them');
  assert.throws(check(withClaudeEffort('ultra')), /invalid effort/, 'C-10: `ultra` is a Codex-only value. Emitted for Claude it is silently ignored by the host, so the agent runs at the host default while canon, README and the tier matrix all claim otherwise - the failure mode is invisible in every artefact anyone reads');
  assert.throws(check(withClaudeEffort('very-high')), /invalid effort/, 'a typo in the effort field must fail the render, exactly as an unknown model family already does - the Codex side has validated this since it shipped and the Claude side is the asymmetry C-10 recorded');

  const effortWithoutModel = GOOD_AGENT_CANON.replace('"model": "opus",\n    "effort": "high"', '"effort": "bogus"');
  assert.ok(!effortWithoutModel.includes('"model": "opus"') && effortWithoutModel.includes('"effort": "bogus"'), 'the fixture is a literal replace over the shared canon, so a reformatted canon silently makes it a no-op - the case below would then re-run the model-present path the assertions above already cover and stay green while the emission-site path went untested');
  assert.throws(check(effortWithoutModel), /invalid.*effort/i, 'the emitted `effort:` line is guarded by `claude.effort` alone, so its validation must be too. Guarded instead by a sibling field (`claude.model`), the check misses every agent that declares an effort without a model family - the render writes `effort: bogus` into the generated view unchallenged, which is precisely the silent-ignore failure C-10 asked to close');

  assert.throws(check(withClaudeEffort('')), /invalid effort/, 'an empty effort must reach the validator and fail closed. Guarded on truthiness the emission skipped it entirely: canon declared an effort, the generated view carried none, and `--check` stayed green over that mismatch - the same silent-ignore class C-10 opened, arrived at from the emitter side rather than the vocabulary side');
  assert.throws(check(GOOD_AGENT_CANON.replace('"model": "opus"', '"model": "opus-xl"')), /effort-probe.*opus-xl.*effort "high"/, 'the unknown-family diagnostic must name the agent, the family, the resolved model and the effort on the Claude path too. Special-cased by provider, the Claude branch built its message without the agent argument it was handed, leaving a reader debugging it with no agent name and no route to the effort check that lives beside it');
});

test('sprint-010 AC-9 (G-12): `core.md` "See also" is the rule-doc index - it lists every other `.asd/rules/*.md` and nothing else - and neither AGENTS.md nor t_AGENTS.md keeps a second copy of that list', () => {
  const ruleDocs = fs.readdirSync(path.join(REPO_ROOT, '.asd/rules'))
    .filter((name) => name.endsWith('.md') && name !== 'core.md')
    .sort();
  const seeAlso = readRepoFile('.asd/rules/core.md').split('## See also')[1];
  assert.ok(seeAlso, 'core.md must keep its "See also" section: every other site now points at it instead of carrying its own list, so its absence leaves the rule-doc set indexed nowhere');
  const indexed = [...seeAlso.matchAll(/^- `([a-z0-9-]+\.md)`/gm)].map((match) => match[1]).sort();
  assert.deepStrictEqual(indexed, ruleDocs, 'G-12: the index must be a bijection with the directory. Checked both ways deliberately - a new rule doc nobody indexed is unreachable for any agent reading the index, and an indexed doc that no longer exists sends a reader to a missing file. This is the mirror class that drifted for whole sprints under a green suite, because only the phase-chain and agent-count mirrors were machine-checked');

  for (const rel of ['AGENTS.md', '.asd/templates/t_AGENTS.md']) {
    const content = readRepoFile(rel);
    const headings = content.split('\n').filter((line) => line.startsWith('### Rule docs'));
    assert.strictEqual(headings.length, 1, `${rel} must carry exactly one "Rule docs" section - two would put this check on one of them while the other drifts`);
    const section = content.split(headings[0])[1].split('\n### ')[0];
    assert.ok(section.includes('`core.md` "See also"'), `${rel} "Rule docs" must point at the index, or the reader has no route from here to the rule-doc set`);
    assert.deepStrictEqual(ruleDocs.filter((doc) => section.includes(doc)), [], `${rel} "Rule docs" must not re-list the docs beside the pointer: the copy that used to live here drifted two entries behind core.md and shipped that way to every consumer through t_AGENTS.md. Naming core.md alone is what keeps this section a pointer`);
  }
});

test('sprint-010 AC-7/G-9: artifact-layout.md "Documentation economy" is the rule\'s sole home, AGENTS.md and code-style.md §7 point at it, and it is a derivable rubric id of the documentation reviewer - the only path into the blocking coverage ledger', () => {
  const home = '.asd/rules/artifact-layout.md';
  const rule = readRepoFile(home).split('## Documentation economy')[1];
  assert.ok(rule, 'AC-7: the rule needs one canonical home with a named section, since its enforcement and both pointers cite it by name');
  const decisionTests = ['**removal**', '**provenance**', '**enforcement**'];
  for (const decisionTest of decisionTests) {
    assert.ok(rule.split('\n## ')[0].includes(decisionTest), `AC-7/G-7: the rule must state its decision procedure - ${decisionTest} is one of the three tests a reviewer applies. A rule saying only what to exclude, with no procedure, decides nothing and is enforced as taste`);
  }
  assert.ok(rule.includes('Never cut, whatever the length'), 'AC-7: the preserve-list is what stops the rule cutting the text it protects - a machine-parsed token, an enumeration whose completeness is the rule, a stated failure mode. Without it the rule authorizes exactly the deletions that break the suite');
  const section = rule.split('\n## ')[0];
  assert.ok(/removal[^.]*necessary/i.test(section) && /corroborate/.test(section), 'AC-7: removal must be the controlling test rather than one of three alternatives. OR-joined, a line no logged defect happens to cite is cuttable on provenance alone even where a reading agent genuinely acts differently without it - provenance and enforcement can only corroborate a cut removal already allows');
  const preserve = section.split('Never cut')[1] || '';
  assert.ok(/normative/.test(preserve) && /at its home/.test(preserve), 'AC-7: the preserve-list must keep normative prose - a gate, safety boundary, ownership assignment, precondition, recovery duty - and keep it scoped to its home. Unscoped, that class shields every restatement elsewhere from the SSoT rule this same file declares above it');
  assert.ok(/prohibition/.test(preserve), "AC-7: a standalone safety, security, authority or irreversible-action prohibition has no paired positive rule by construction, so the preserve-list must name it; the cut-on-sight bullet as first worded authorised deleting this framework's own such bans");

  for (const rel of canonMarkdownFiles()) {
    if (rel === home) continue;
    for (const decisionTest of decisionTests) {
      assert.ok(!readRepoFile(rel).includes(`${decisionTest} —`), `${rel} must cite the economy rule rather than restating its three tests - a second copy of a cut-or-keep procedure is the SSoT violation the rule itself makes a FAIL`);
    }
  }

  for (const [rel, marker] of [['AGENTS.md', 'minimize runtime tokens'], ['.asd/rules/code-style.md', 'Comments concise and clear']]) {
    const pointer = readRepoFile(rel).split('\n').find((line) => line.includes(marker));
    assert.ok(pointer, `${rel} must keep its economy line - reduced to a pointer, not deleted: it is where a dev or reviewer working in that file meets the rule at all`);
    assert.ok(pointer.includes('artifact-layout.md') && pointer.includes('Documentation economy'), `${rel}'s economy line must cite the new home by section, or the two former paragraphs grow back into second homes`);
  }

  const rubricIds = (reviewer) => {
    try {
      return runtime.emitCoverageManifests({ reviewer, phase: 'impl-review', rubric: readRepoFile(`.asd/agents/asd-reviewer-${reviewer}.md`), files: [] })[0].rules;
    } catch (error) {
      return `rejected: ${error.message}`;
    }
  };
  for (const reviewer of internalReviewers()) {
    const ids = rubricIds(reviewer);
    assert.ok(Array.isArray(ids), `G-9: review-policy.md derives every manifest's rubric ids from this reviewer's \`## Review rubric\` - sectioned rubrics by their \`###\` headings, else by each bullet's bold lead-in - and since sprint 012 \`emit-manifest\` is the one place that derivation runs. A rubric matching neither shape yields no ids, and no manifest can be emitted for that reviewer at all. ${reviewer}: ${ids}`);
  }
  assert.ok(rubricIds('documentation').includes('Documentation economy'), 'AC-7: the rubric bullet is the rule\'s only path into the blocking coverage ledger, and it counts only if the emitter\'s derivation yields it as an id. Stated in prose the reviewer would read it; emitted as an id it must resolve a row before any verdict counts');
});

test('sprint-010 AC-1: the wave declaration is defined once in sprint-lifecycle.md "Plan file format", written by asd-phase-plan.md, dispatched from by asd-phase-impl.md steps 5-6, and slotted in t_plan.md', () => {
  const lifecycle = readRepoFile('.asd/rules/sprint-lifecycle.md');
  const declaration = lifecycle.split('\n').find((line) => line.startsWith('**Wave declaration**'));
  assert.ok(declaration, 'AC-1/G-2: `wave` was vocabulary no canon file defined. It needs exactly one definition, in the section that owns the plan format, before either workflow can cite it');
  assert.ok(declaration.includes('is alone in its wave'), 'AC-1 is the ordering rule itself: a task changing the dispatch or commit contract runs ahead of everything dispatched under it, alone. Without "alone", a contract change may share a wave with a task dispatched under the contract it is changing - the F-1 failure this criterion exists to prevent');
  assert.ok(declaration.includes('Every Task appears in exactly one wave'), 'the partition property is what makes the table a schedule: a task in no wave is never dispatched, a task in two is dispatched twice');
  assert.ok(declaration.includes('`asd-phase-impl.md` steps 5-6'), 'the definition must name its consumer, since the rule binds only where impl actually schedules');

  const planWorkflow = readRepoFile('.asd/workflows/asd-phase-plan.md');
  assert.ok(planWorkflow.includes('assign every Task to a wave and write the wave table into `## Dependencies`'), 'AC-1/G-1: the plan phase had no step that computed any ordering, so the criterion had nothing to attach to. The waves must be assigned where the plan is authored - impl cannot invent an ordering the plan never declared');
  assert.ok(planWorkflow.includes('`sprint-lifecycle.md` "Plan file format"'), 'the plan step must cite the definition rather than restate the isolation rule');

  const implLines = readRepoFile('.asd/workflows/asd-phase-impl.md').split('\n');
  const graphLine = implLines.find((line) => line.trim().startsWith('- initial —'));
  assert.ok(graphLine && graphLine.includes("the plan's wave table is the graph"), 'AC-1: impl must schedule from the declared waves. Re-deriving its own topological sort discards the isolation rule silently - the plan would say "alone in wave 2" and impl would dispatch it beside anything it shares no dependency line with');
  assert.ok(graphLine.includes('never re-derived from the dependency lines'), 'the dependency lines survive as explanation; saying so is what keeps a reader from treating them as a second, competing schedule');
  assert.ok(graphLine.includes('fall back'), 'a plan authored before this rule carries no table, so the old topological sort must remain reachable as the stated fallback - an in-flight sprint would otherwise be unschedulable');
  const dispatchLine = implLines.find((line) => line.includes('the next wave opening only once all their signals are in'));
  assert.ok(dispatchLine, 'AC-1: the barrier between waves is the enforcement. Waves that overlap make isolation nominal - a contract-changing task still in flight while the next wave dispatches is the same failure as sharing its wave');

  const template = readRepoFile('.asd/templates/t_plan.md');
  assert.ok(template.includes('| Wave | Tasks |'), 'AC-1/G-1: the section was optional and free-form, and an ordering rule cannot be enforced from an optional section. The table needs a slot the author fills and the impl parser reads');
  assert.ok(/^- `## Dependencies` is required/m.test(template), 'the parser-critical comment block enumerates every line rule the plan parser depends on; a required section missing from that enumeration is a rule the author never sees');
});

test('sprint-010 AC-5a/AC-5b: the authorised-paths diff read is a condition of asd-phase-impl.md\'s all-modes completion gate, not of its fix-mode-only bookkeeping step, the workflow declares the git operation that gate runs on, and code-style.md §17 keeps the fail-first restore obligation the gate exists to catch', () => {
  const implLines = readRepoFile('.asd/workflows/asd-phase-impl.md').split('\n');
  const start = implLines.findIndex((line) => line.startsWith('9. **Impl completion gate**'));
  assert.ok(start >= 0, 'the completion gate must keep its step number: every other step cites it by number, and this check locates the gate that way');
  assert.ok(implLines[start].includes('(all modes)'), 'AC-5b: the gate must stay all-modes. A review-fix or test-fix round is exactly where an agent edits a path nobody assigned it, so a gate scoped to initial mode misses the rounds that need it');
  const gate = implLines.slice(start, implLines.findIndex((line, index) => index > start && /^1[0-9]\. /.test(line))).join('\n');

  const condition = 'every path it touches is one those agents were authorised to touch';
  assert.ok(gate.includes(condition), 'AC-5b/F-5: the round\'s diff must be read before committing or advancing. Unread, an unrestored mutation or a scripted edit that rewrote more than its target rides into the commit and reaches review as authored work');
  assert.ok(gate.includes('what its agents committed plus anything still uncommitted'), 'the read must span both, or the one thing it is aimed at - a mutation left on disk, never staged - is exactly what it cannot see');
  assert.ok(gate.includes('Distinct from `code-style.md` §19'), 'the two checks share a tool and differ in question: §19 lints staged CONTENT, this gate asks which PATHS moved. Unmarked, one gets deleted as a duplicate of the other');
  assert.strictEqual(readRepoFile('.asd/workflows/asd-phase-impl.md').split(condition).length - 1, 1, 'the condition must live in exactly one step. Copied into the fix-mode step as well, the two drift; moved there instead, initial mode loses the gate entirely');

  const operations = readRepoFile('.asd/workflows/asd-phase-impl.md').split('\n## Operations used')[1].split('\n## ')[0];
  const runGrant = operations.split('\n').find((line) => line.startsWith('- run command:'));
  assert.ok(runGrant && runGrant.includes('git diff'), 'AC-5b: the gate asks which paths moved across committed AND uncommitted work, which only git answers, so `## Operations used` must declare that operation. Stated at the acting site with no tool declared behind it, the gate is an obligation the phase cannot discharge');

  const tests17 = readRepoFile('.asd/rules/code-style.md').split('\n## 17. Tests')[1].split('\n## ')[0];
  assert.ok(/restored before the agent's next tool call/.test(tests17), 'AC-5a: §17 is the sole home of the fail-first restore obligation and no file mirrors it, so nothing but this assertion stands between the bullet and an economy pass reading it as procedural detail. Deleted, a mutation left on disk stops being a defect anyone can cite');
  assert.ok(/mutation left on disk is a defect/.test(tests17), 'AC-5a states the consequence separately from the instruction deliberately: without it a green suite reads as evidence that the tree is clean, which is exactly what an unrestored mutation makes it not (F-5)');
});

test('sprint-010 AC-10: the documentation economy rule carries both its authoring obligation and its review consequence in its own home, code-style.md §1 sends an author to every iron rule, and providers.md grants that home to every role whose context is a fixed list', () => {
  const layout = readRepoFile('.asd/rules/artifact-layout.md');
  const rule = layout.split('## Documentation economy')[1].split('\n## ')[0];
  assert.ok(/tests bind while authoring/.test(rule), 'AC-10: stated only as something a reviewer judges, the rule reaches an author after the text is already written, and applying it costs a whole review round. The authoring obligation belongs in the rule\'s own home - the one file every authoring role is granted - not in a file half of them never load');
  assert.ok(rule.includes('Violation = `FAIL` from Documentation reviewer'), 'AC-10 is two-sided: the authoring sentence must not displace the enforcement one, or the rule degrades to advice with no blocking gate behind it');

  const ironRules = [...layout.matchAll(/^## (.+) \(iron rule\)$/gm)].map((match) => match[1]);
  assert.strictEqual(ironRules.length, 2, 'artifact-layout.md declares the iron rules code-style.md §1 sends authors to, and that bullet enumerates them by name. A third iron rule added here must be named there in the same change, or it inherits the review-only reading AC-10 exists to remove');
  const economy = ironRules.find((heading) => /economy/i.test(heading));
  assert.ok(economy, 'the economy rule must stay an iron-rule heading: the §1 bullet, the documentation reviewer\'s rubric id and both pointer sites all select it by that section');

  const proactive = readRepoFile('.asd/rules/code-style.md').split('\n').find((line) => line.includes('PROACTIVELY while authoring'));
  assert.ok(proactive, 'code-style.md §1 must keep a proactive-authoring bullet: it is where a dev or tester meets an authoring obligation at all, and every reviewer-side rule reaches them only after the text exists');
  assert.ok(proactive.includes('iron rules'), `AC-10: the bullet must send authors to both of artifact-layout.md's iron rules; naming one of ${ironRules.length} in the singular implies the other is review-only, which is how the economy rule read before this criterion`);
  assert.ok(proactive.toLowerCase().includes(economy.toLowerCase()), `the bullet must name "${economy}" alongside SSoT - a list that names only SSoT is exactly the omission that left the economy rule enforceable but never authored against`);

  const table = readRepoFile('.asd/rules/providers.md').split('## Role-scoped context')[1].split('\n## ')[0];
  const rows = [...table.matchAll(/^\| (.+?) \| (.+?) \|$/gm)].filter(([, role]) => role !== 'Role');
  assert.ok(rows.length >= 10, 'the role table must parse into rows, or every grant assertion below passes vacuously over an empty list - the failure mode that makes a reach check worthless');
  const exemptPhrase = 'files named by the consulting question';
  const exempt = rows.filter(([, , context]) => context.includes(exemptPhrase)).map(([, role]) => role.trim());
  assert.deepStrictEqual(exempt, ['`asd-advisor`'], "exactly one row is exempt and it is the advisor's - granted the files its consulting question names rather than a fixed list, it has no fixed grant to assert against. Left uncounted, any number of rows could adopt that wording and drop out of the sweep below in silence: a role reading the economy rule nowhere, reported as covered");
  for (const [, role, context] of rows) {
    if (context.includes(exemptPhrase)) continue;
    assert.ok(context.includes('artifact-layout.md'), `AC-10: ${role} writes text a later agent reads, so its row must grant artifact-layout.md - the rule's home, and the only route to it for a role that never loads code-style.md`);
  }
});

test('sprint-010 iter-02: review-policy.md "Nitpick drop list" is the only enumeration inside the rule set every nitpick-instructed agent is granted, and the outbound external prompts are the sole exempt copies', () => {
  const policy = readRepoFile('.asd/rules/review-policy.md');
  const section = policy.split('## Nitpick drop list')[1];
  assert.ok(section, 'review-policy.md must keep the drop list as its own named section: every reviewer body now says only "never raise nitpick categories", so this section is the sole place those category names exist for an agent that reads our rules');
  const categories = [...section.split('\n## ')[0].matchAll(/^- (.+)$/gm)].map((match) => match[1].trim());
  assert.ok(categories.length >= 5, `the section must enumerate the categories rather than name the class: a reviewer told to drop "nitpick categories" with nothing to resolve them against cannot check a finding against the rule. Found ${categories.length}`);

  const table = readRepoFile('.asd/rules/providers.md').split('## Role-scoped context')[1].split('\n## ')[0];
  const grants = new Map([...table.matchAll(/^\| (.+?) \| (.+?) \|$/gm)]
    .filter(([, role]) => role !== 'Role')
    .map(([, role, context]) => [role.trim().replace(/`/g, ''), context]));
  assert.ok(grants.size >= 10, 'the role table must parse into rows, or every grant assertion below passes vacuously over an empty map - the failure mode that makes a reach check worthless');

  const agentFiles = fs.readdirSync(path.join(REPO_ROOT, '.asd/agents')).filter((file) => file.endsWith('.md'));
  const instructed = agentFiles.filter((file) => /nitpick/i.test(readRepoFile(`.asd/agents/${file}`))).map((file) => file.replace(/\.md$/, '')).sort();
  const reviewers = agentFiles.filter((file) => file.startsWith('asd-reviewer-') || file === 'asd-external-review.md').map((file) => file.replace(/\.md$/, '')).sort();
  assert.deepStrictEqual(instructed, reviewers, 'the set carrying the nitpick prohibition must be exactly the review agents - derived from the agent file set, never a hardcoded list, so a new reviewer that never received the instruction fails here instead of shipping as a silently permissive gate');
  for (const name of instructed) {
    const context = grants.get(name);
    assert.ok(context, `providers.md must carry a Role-scoped context row for ${name}, or the grant its prohibition depends on is stated nowhere`);
    assert.ok(context.includes('review-policy.md'), `${name} is told to drop nitpick categories without being given the category names, so its row must grant review-policy.md - the file holding the only enumeration. Ungranted, the instruction resolves to nothing at dispatch`);
  }

  assert.ok(categories.some((category) => category.includes('you could also')), 'the list must keep its most distinctive category, the token the sole-home sweep below selects on');
  const copies = canonMarkdownFiles().filter((rel) => rel !== '.asd/rules/review-policy.md' && readRepoFile(rel).includes('you could also')).sort();
  assert.deepStrictEqual(copies, [
    '.asd/templates/external-review/t_prompt-external-design.md',
    '.asd/templates/external-review/t_prompt-external-impl.md'
  ], 'the two outbound prompt templates are the one legitimate second copy - the wrapped CLI is handed that text and cannot read review-policy.md - and both must keep it, or an external reviewer is told to drop categories it is never shown. Any other file reproducing them is the drifted copy this round deleted from asd-reviewer-correctness.md, which had aged to four of the five. Scoped to this one token deliberately: a reworded copy evades it, so this proves the token is sole-homed, never that no paraphrase exists');
});

test('sprint-010 iter-02: each latch non-restatement declaration denies only what its own site omits - the red-full-suite invalidation keeps its rule home and both step-9 acting sites while review-policy.md stops restating it, and neither review workflow denies the mechanic it spells out', () => {
  const latchSection = readRepoFile('.asd/rules/sprint-lifecycle.md').split('## APPROVE latch')[1].split('\n## ')[0];
  assert.ok(latchSection.includes('**Red-full-suite invalidation.**'), 'sprint-lifecycle.md "APPROVE latch" is the sole home of latch persistence and claims to name every route that clears it, so the red-suite route must live here - review-policy.md just dropped its copy, which leaves this the only rule-level statement of it');
  assert.ok(/clear BOTH `reviews\.design\.latched` and `reviews\.impl\.latched` to `\{\}`/.test(latchSection), 'the route must state its blast radius: a red suite invalidates approvals in both review phases, and a rule saying only "clear the latch" is satisfied by clearing one of the two maps');

  const policy = readRepoFile('.asd/rules/review-policy.md');
  const dod = policy.split('\n').find((line) => line.includes("impl-review's DoD has a second, non-reviewer condition"));
  assert.ok(dod, 'review-policy.md must keep the DoD half it owns - the green full suite as a second, non-reviewer DoD condition');
  assert.ok(!dod.includes('clears every APPROVE latch sprint-wide'), 'the DoD paragraph must not re-acquire the clearing rule: that copy sat two lines above a declaration that the clearing is not restated here, so the file contradicted itself and either copy could drift out of step with the acting sites');

  const implReview = readRepoFile('.asd/workflows/asd-phase-impl-review.md');
  const redBranches = implReview.split('\n').filter((line) => /^\s+- \*\*Red, (test|code) defect\*\*/.test(line));
  assert.strictEqual(redBranches.length, 2, 'step 9 must keep both red triage branches; a regex that stops matching them would make the clearing assertion below pass over an empty list');
  for (const branch of redBranches) {
    assert.ok(branch.includes('latch'), 'both step-9 red branches are acting sites for the red-full-suite invalidation - sprint-lifecycle.md calls that paragraph "the contract the full-suite step must satisfy", and now that review-policy.md no longer restates the clearing, a branch that stops performing it leaves the rule with no site that ever runs it');
  }

  const policyLatch = policy.split('\n').find((line) => line.startsWith('**APPROVE latch**'));
  assert.ok(policyLatch && policyLatch.includes('not restated here'), 'review-policy.md must keep handing the mechanism to its SSoT instead of describing it');
  assert.ok(!/not restated here\s*(,\s*)?(or|nor|and not)\b/i.test(policyLatch), 'a non-restatement declaration may speak for its own site only: both review workflows do spell the dispatch-skip mechanic out at the step that applies it (asserted below), so extending the denial across them made it false and told an editor those copies did not exist. Keyed on the denial being extended by a conjunction, not on the words "review workflow" - this bullet may legitimately name the workflows for anything else, and the extension is false whichever artefact it reaches');

  for (const rel of ['.asd/workflows/asd-phase-impl-review.md', '.asd/workflows/asd-phase-design-review.md']) {
    const body = readRepoFile(rel);
    const filter = body.split('\n').find((line) => line.includes('APPROVE latch filter first'));
    assert.ok(filter, `${rel} must keep the latch filter as the first act of its dispatch step`);
    assert.ok(filter.includes('skipped entirely this iteration'), `${rel}: the filter bullet must spell out what a latched key does at the point the orchestrator acts on it - that restatement is what keeps the absence assertion on the next line from being vacuous`);
    assert.ok(!filter.includes('not restated here'), `${rel}: this bullet restates the mechanic in the same breath, so its citation may claim sole SSoT and nothing more. A false "not restated here" reads as licence to delete the SSoT copy, which is the one an agent that never opens this workflow depends on`);

    const writeStep = body.split('\n').find((line) => line.includes('sole SSoT for the every-reviewer-gets-an-entry invariant'));
    assert.ok(writeStep, `${rel} must keep the verdict-write step's citation of the latch SSoT`);
    assert.ok(writeStep.includes("External Review's availability skip is recorded as"), `${rel}: the write step states the availability-skip form itself, being the step that writes it`);
    assert.ok(!writeStep.includes('availability-skip carve-out'), `${rel}: having just stated the availability skip, the step must not also list that carve-out among the things it declares un-restated - the same self-contradiction removed above`);
  }
});

test("sprint-010 iter-02: sprint-lifecycle.md's ADVICE_NEEDED step cites the asd-advisor.md section that actually carries the no-log rule, derived from the agent rather than restated", () => {
  const advisor = readRepoFile('.asd/agents/asd-advisor.md');
  const sections = ["Do's", "Don'ts"].map((heading) => {
    const body = advisor.split(`## ${heading}`)[1];
    assert.ok(body, `asd-advisor.md must keep its ${heading} section - the lifecycle citation selects one of the two by name`);
    return { heading, holdsRule: /Never log the consult/.test(body.split('\n## ')[0]) };
  });
  const holders = sections.filter((section) => section.holdsRule).map((section) => section.heading);
  assert.strictEqual(holders.length, 1, `the no-log rule must live in exactly one of the advisor's two instruction sections; stated in both, or in neither, the citation below has no single correct target to be checked against. Holders: ${JSON.stringify(holders)}`);

  const step = readRepoFile('.asd/rules/sprint-lifecycle.md').split('\n').find((line) => line.includes('No halt, no user contact, no logged trail'));
  assert.ok(step, "sprint-lifecycle.md must keep the ADVICE_NEEDED round-trip's no-log step - it is the only place the protocol states that the consult leaves no artefact");
  assert.ok(step.includes(`\`asd-advisor.md\` ${holders[0]}`), `the step must cite the advisor section that holds the rule (${holders[0]}), derived here from the agent file itself: this citation pointed at Do's until 2ae44c6, and an agent that follows a citation into a section holding nothing of the kind proceeds unguided while the sprint reads as documented`);
});

test('sprint-010 iter-03: the clean-worktree precondition is a reciprocal pair - sprint-lifecycle.md owns the rule and names the workflow section that performs it, and that section keeps the command and the failure signal while no longer denying that it restates anything', () => {
  const home = readRepoFile('.asd/rules/sprint-lifecycle.md').split('\n').find((line) => line.includes('**Impl-review clean-worktree precondition**'));
  assert.ok(home, 'sprint-lifecycle.md must keep the clean-worktree home statement: the workflow precondition cites it as sole SSoT, so a home that is cut leaves that citation pointing at nothing while the phase still refuses to start');
  const delegated = /mechanic in `asd-phase-impl-review\.md` "([^"]+)"/.exec(home);
  assert.ok(delegated, 'the home must name the workflow section it hands the mechanic to; this test derives the acting site from that name rather than hardcoding a heading either side may rename');

  const workflow = readRepoFile('.asd/workflows/asd-phase-impl-review.md');
  const parts = workflow.split(`\n## ${delegated[1]}`);
  assert.strictEqual(parts.length, 2, `asd-phase-impl-review.md must carry exactly one "## ${delegated[1]}" section: its home delegates the mechanic to that heading by name, and a rename on one side only sends every reader to a section that does not exist`);
  const precondition = parts[1].split('\n## ')[0].split('\n').find((line) => line.includes('Clean worktree at phase entry'));
  assert.ok(precondition, `the clean-worktree gate must live inside "${delegated[1]}", the section its home names as the mechanic site`);
  assert.ok(precondition.includes('`git status --porcelain`'), 'the acting site must name the command it runs. Its home states the same trigger and timing, so this line reads as a restatement and is a standing deletion candidate for an economy pass - but it is the only executable instruction either file carries, and the home delegates it here on purpose');
  assert.ok(precondition.includes('`FAILED`'), 'the acting site must name the signal a dirty worktree raises: without it the gate states a trigger and no consequence, and the phase proceeds into a diff computed from commits that no reviewer can see the uncommitted half of');
  assert.ok(precondition.includes('sole SSoT'), 'the precondition must keep citing its home rather than growing into a second rule statement - that citation is what makes the split above readable as a split instead of as two rules');
  assert.ok(!precondition.includes('not restated here'), 'this bullet restates the home trigger and timing in the same breath, so its citation may claim sole SSoT and nothing more. The denial was false when written (iter-03 DOC-1a), and a false denial reads as licence to delete the home copy - the one a reader who never opens this workflow depends on');
});

test('sprint-010 iter-03: every section a canon file cites by name resolves in the file it names, with no dangling pointer left anywhere in canon', () => {
  const canon = canonMarkdownFiles();
  const byBase = new Map(canon.map((rel) => [rel.split('/').pop(), rel]));
  const resolveTarget = (base) => [byBase.get(base), base, `.asd/templates/t_${base}`].find((candidate) => {
    if (!candidate) return false;
    const abs = path.join(REPO_ROOT, candidate);
    return fs.existsSync(abs) && fs.statSync(abs).isFile();
  });
  const citation = /`([a-z0-9_.-]+\.md)`(?:'s)?\s+"([^"]+)"/g;

  let cited = 0;
  const dangling = [];
  for (const rel of canon) {
    readRepoFile(rel).split('\n').forEach((line) => {
      for (const [, file, heading] of line.matchAll(citation)) {
        cited += 1;
        const target = resolveTarget(file);
        const anchor = new RegExp(`^#{2,4} ${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}|\\*\\*${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.?\\*\\*`, 'm');
        if (!target || !anchor.test(readRepoFile(target))) dangling.push(`${rel} -> ${file} "${heading}"`);
      }
    });
  }

  assert.ok(cited >= 150, `the sweep must still reach the citation grammar it checks; only ${cited} citations matched, low enough that the pattern has probably stopped reaching canon and the comparison below would pass over an empty list`);

  assert.deepStrictEqual(dangling, [], 'every section a canon file cites must resolve in the file it names. An entry here is a citation renamed on one side only - the failure this sweep exists for, four instances on record: sprint 006 documentation F5 fixed two by hand, and D-3 / D-4 of sprint 010 fixed the two that survived it. Resolution accepts a `## heading` or a `**bold label**`, both attested citation targets in this canon; heading matching is prefix-anchored so a parenthetical suffix still resolves. Should a dangler ever turn up pre-existing and outside the change surface, pin it here as a named exemption carrying its own D-N row rather than dropping the sweep - except on a line that denies restating the content, which may never be pinned: that denial tells the reader the content lives at the target and nowhere else, so a pointer resolving to nothing leaves it reachable from no site at all');
});

test("sprint-012 AC-1: the published n_a shape keys exactly the vocabulary's row types, is an n_a the validator accepts once its placeholders are filled, and review-policy.md publishes the same row types", () => {
  const shape = runtime.LEDGER_NA_SHAPE;
  const vocabulary = runtime.LEDGER_VOCABULARY;
  const rowTypes = Object.keys(vocabulary).filter((key) => Array.isArray(vocabulary[key]));
  assert.deepStrictEqual(Object.keys(shape), rowTypes, 'the shape must key n_a by exactly the row types the vocabulary publishes - a missing type teaches every reader of the manifest that its ids can never be n/a, an extra one is rejected by the validator as an unknown row type');

  let verdict;
  try {
    const filled = Object.fromEntries(Object.entries(shape).map(([type, byId]) => [type, Object.fromEntries(Object.values(byId).map((predicates) => [`${type}-1`, predicates.map(() => `no-${type}-1`)]))]));
    const manifest = Object.assign(buildManifest(['files-1'], ['rules-1'], ['sections-1']), { n_a: filled, n_a_shape: structuredClone(shape) });
    manifest.digest = runtime.coverageManifestDigest(manifest);
    const ledger = Object.assign({ manifest_digest: manifest.digest, findings: [] }, Object.fromEntries(rowTypes.map((type) => [type, [{ i: `${type}-1`, s: vocabulary.p, p: `no-${type}-1` }]])));
    verdict = runtime.validateCoverageLedger(manifest, ledger, []);
  } catch (error) {
    verdict = `rejected: ${error.message}`;
  }
  assert.deepStrictEqual(verdict, { ok: true }, 'the shape is published so an n_a written to it is one the validator reads back: filled from its own entries - row type, then id, then predicate list - it must authorize an n/a row of every row type. A shape the validator rejects teaches the D-2 mis-keying all over again, now from the manifest itself');

  const policyLine = canonText('.asd/rules/review-policy.md').split('\n').find((line) => line.includes('"n_a_shape"'));
  const published = policyLine && /"n_a_shape": \{"<([^>]+)>"/.exec(policyLine);
  assert.ok(published, 'review-policy.md "Coverage ledger" must publish the n_a shape beside `vocabulary` and `row_example` - the orchestrator reads the rule, the reviewer reads the manifest');
  assert.deepStrictEqual(published[1].split('|'), rowTypes, "review-policy.md's published shape must name the row types the runtime constant keys by, derived from the vocabulary rather than re-listed, so a fourth row type reddens the prose that forgot it");
});

test("sprint-012 AC-12: emit-manifest derives rule and section ids from a reviewer's own rubric, appends custom-rule paths, and grants each standing n/a predicate only where its condition holds - checked against every internal reviewer's real rubric in both phases", () => {
  const fixture = (rubric, customRules) => runtime.emitCoverageManifests({ reviewer: 'testing', phase: 'impl-review', rubric, files: ['a.md'], customRules })[0];
  const sectioned = fixture(SECTIONED_RUBRIC, { '.asd/project/custom-coding-rules.md': '# Custom Coding Rules\n' });
  assert.deepStrictEqual([sectioned.rules, sectioned.sections], [['Alpha', 'Beta', '.asd/project/custom-coding-rules.md'], ['Alpha', 'Beta']], 'review-policy.md "Rubric ID derivation": a sectioned rubric yields its `###` headings as rule and section ids in file order - nothing nested under a heading, nothing under the next `##` - and a custom rule is enumerated by the path passed');
  const bullets = fixture("## Review rubric\n\n- **Alpha**: detail\n  - **Nested**: not an id\n- **Beta**: detail\n\n## Do's\n\n- **Not a rubric entry**\n", {});
  assert.deepStrictEqual([bullets.rules, bullets.sections], [['Alpha', 'Beta'], []], "an unsectioned rubric yields each top-level bullet's bold lead-in label and no section ids");
  assert.throws(() => fixture('# Reviewer\n\n## Signals emitted\n', {}), /Review rubric/, 'a reviewer file with no `## Review rubric` must fail the emit closed: a manifest with no rubric rows validates while proving nothing was reviewed');

  const agent = (reviewer) => readRepoFile(`.asd/agents/asd-reviewer-${reviewer}.md`);
  const emitReal = (reviewer, phase, files, extra) => runtime.emitCoverageManifests(Object.assign({ reviewer, phase, rubric: agent(reviewer), files, customRules: {} }, extra))[0];
  const holders = (manifest, predicate) => Object.entries(manifest.n_a.rules).filter(([, predicates]) => predicates.includes(predicate)).map(([id]) => id);
  const predicates = runtime.NA_PREDICATES;

  const uiHolders = (files) => holders(emitReal('correctness', 'impl-review', files, {}), predicates.uiSurface);
  const uiIds = uiHolders(['README.md', '.asd/runtime.js']);
  assert.strictEqual(uiIds.length, 1, 'with no UI surface in scope exactly the one UI conformance entry is n/a - diff-scoped fan-out is always on, with no flag to pass (sprint-013 AC-17)');
  for (const surface of ['.asd/templates/t_prd.html', 'docs/site/index.html', 'app/theme.scss', 'src/components/button.ts', 'src/App.tsx']) {
    assert.deepStrictEqual(uiHolders(['README.md', surface]), [], `${surface} is a UI surface, so it must keep UI conformance reviewed - framework .asd/templates/*.html included, the whole subject of the correctness reviewer's self-hosting carve-out`);
  }
  assert.strictEqual(uiHolders(['README.md', '.asd/rules/notes.html']).length, 1, 'an .html under .asd/ outside .asd/templates/ is framework infrastructure, not a UI surface');

  const htmlHolders = (manifest) => holders(manifest, predicates.noHtml);
  const htmlIds = htmlHolders(emitReal('documentation', 'impl-review', ['README.md', '.asd/runtime.js'], {}));
  assert.ok(htmlIds.length > 0, 'a scope with no HTML file must n/a the documentation entries whose evidence lives only in HTML docs, or every split part can record only out-of-part for them and union check (c) fails by construction (ORC-1)');
  assert.deepStrictEqual(htmlHolders(emitReal('documentation', 'design-review', ['s/design/adr.md'], {})), htmlIds, 'the no-HTML predicate is phase-independent: a design-review scope of Markdown drafts only (prd and ux-spec disabled) carries it too');
  for (const html of ['docs/product/requirements/core.html', '.asd/rules/notes.html']) {
    assert.deepStrictEqual(htmlHolders(emitReal('documentation', 'impl-review', ['README.md', html], {})), [], `${html}: any HTML file in scope keeps the HTML-evidence entries reviewed - framework .asd/ HTML included, since the predicate is about HTML evidence, not about UI surfaces`);
  }
  const manyFiles = Array.from({ length: runtime.SPLIT_THRESHOLD_FILES + 1 }, (_, index) => `docs/file-${index + 1}.md`);
  const documentationParts = (files) => runtime.emitCoverageManifests({ reviewer: 'documentation', phase: 'impl-review', rubric: agent('documentation'), files, customRules: {} });
  const proseParts = documentationParts(manyFiles);
  assert.deepStrictEqual(proseParts.map(htmlHolders), proseParts.map(() => htmlIds), `ORC-1: with no HTML anywhere in a split scope every one of the ${proseParts.length} parts must carry the no-HTML predicate - a standing n/a may sit in every part, an out-of-part one may not (review-policy.md "Union property", check (c))`);
  const oneHtml = documentationParts(manyFiles.slice(0, -1).concat('docs/last.html'));
  assert.deepStrictEqual(oneHtml.map(htmlHolders), oneHtml.map(() => []), 'the no-HTML predicate is decided over the whole scope before partitioning: one HTML file in the last part withholds it from every part - decided from any narrower slice, the part holding that HTML could n/a its entries under a standing predicate and union check (c) would pass with nobody reviewing them');

  const frameworkHolders = (extra) => holders(emitReal('documentation', 'impl-review', ['README.md'], extra), predicates.noSelfHosting);
  assert.strictEqual(frameworkHolders({}).length, 1, 'sprint-014 AC-4: without self-hosting exactly the Framework mode entry is n/a, or every split part records only out-of-part for it and union check (c) fails by construction');
  assert.deepStrictEqual(frameworkHolders({ selfHosting: true }), [], 'sprint-014 AC-4: a self-hosting review keeps Framework mode reviewed - the README/rule-mirror check is its whole subject');
  const templatedHolders = (files) => holders(emitReal('documentation', 'impl-review', files, { templates: ['plan.md'] }), predicates.noTemplated);
  assert.strictEqual(templatedHolders(['README.md', '.asd/runtime.js', 'mydocs/guide.md', 'x/myplan.md']).length, 1, 'sprint-014 AC-4: a scope with no templated artefact n/a\'s exactly the Template adherence entry - a docs-like prefix and a basename merely containing a template name are not templated');
  for (const file of ['x/plan.md', '.asd/templates/t_new.md', 'docs/architecture/core.md', '.asd/sprints/001-x/sprint.md']) {
    assert.deepStrictEqual(templatedHolders(['README.md', file]), [], `sprint-014 AC-4: ${file} is a templated artefact, so Template adherence must stay reviewed`);
  }

  const budgets = { '.asd/project/custom-coding-rules.md': '# Custom Coding Rules\n\n## Perf budgets\n\n- p95 under 200ms\n' };
  const efficiency = (files, customRules) => emitReal('efficiency', 'impl-review', files, { customRules });
  const prose = efficiency(['README.md'], {});
  const perfIds = holders(prose, predicates.perf);
  const budgetIds = holders(prose, predicates.noBudgets);
  assert.ok(perfIds.length > 1 && budgetIds.length === 1 && perfIds.includes(budgetIds[0]), `no budgets section and no executable file: every performance entry is n/a, and the budget-compliance one among them also carries "${predicates.noBudgets}". perf: ${perfIds}; no budgets: ${budgetIds}`);
  const executable = efficiency(['README.md', '.asd/runtime.js'], {});
  assert.deepStrictEqual([holders(executable, predicates.perf), holders(executable, predicates.noBudgets)], [[], budgetIds], 'an executable file in scope keeps every performance entry reviewed - the perf predicate is conjunctive - while budget compliance alone stays n/a for want of budgets');
  const budgeted = efficiency(['README.md'], budgets);
  assert.deepStrictEqual([holders(budgeted, predicates.perf), holders(budgeted, predicates.noBudgets)], [[], []], 'a perf-budgets heading in custom-coding-rules.md defeats both predicates');
  assert.deepStrictEqual(holders(efficiency(['tool.unknownext'], {}), predicates.perf), [], 'an unrecognised extension counts as executable, so the emitter fails toward reviewing more');

  const correctnessGated = (files) => holders(emitReal('correctness', 'design-review', files, {}), predicates.phaseGate);
  for (const draft of ['s/design/ux-spec.html', 's/design/design-md-delta.yaml']) {
    assert.deepStrictEqual(correctnessGated(['s/design/prd.html']).filter((id) => !correctnessGated(['s/design/prd.html', draft]).includes(id)), uiIds, `${draft}: a ux-spec or design-system draft in design-review scope must lift exactly the UI conformance entry out of the phase gate; without either that entry is \`outside phase gate\` and token proposals go unreviewed (asd-phase-design-review.md step 7)`);
  }
  let gatedAnywhere = 0;
  for (const reviewer of internalReviewers()) {
    const designGated = holders(emitReal(reviewer, 'design-review', ['s/design/prd.html'], {}), predicates.phaseGate);
    const implGated = holders(emitReal(reviewer, 'impl-review', ['README.md'], {}), predicates.phaseGate);
    gatedAnywhere += designGated.length + implGated.length;
    assert.deepStrictEqual(designGated.filter((id) => implGated.includes(id)), [], `${reviewer}: no rubric entry may sit outside the phase gate in both phases - reviewed by nobody, ever, while every ledger validates`);
  }
  assert.ok(gatedAnywhere > 0, "the phase gate is assigned by the phase named in each rubric entry, so at least one real entry must be gated - zero means the name match stopped reaching the rubrics and the sweep above compared empty sets");

  const orphaned = agent('correctness').replace(`### ${uiIds[0]}`, '### Renamed entry');
  assert.notStrictEqual(orphaned, agent('correctness'), 'sanity: the rename must hit the heading the UI predicate targets');
  assert.throws(() => runtime.emitCoverageManifests({ reviewer: 'correctness', phase: 'impl-review', rubric: orphaned, files: ['README.md'] }), /rubric entry missing/, 'renaming a rubric entry a standing predicate targets must fail every emit closed, naming the entry - silently dropping the predicate would force a full review where the rule allows n/a, and every run of the loop above proves the real rubrics still resolve');
});

test("runtime.js CLI: emit-manifest writes one stamped manifest per part under the file names both review workflows dispatch from, and validate-ledger reads the ledger straight out of a reviewer's returned text", () => {
  const root = mkTempDir();
  const reviewer = 'correctness';
  const unsplitName = '<reviewer>.manifest.json';
  const partName = '<reviewer>.part-N.manifest.json';
  const selfHostingFlag = /\[(--self-hosting)\]/.exec(sectionOf('.asd/rules/review-policy.md', 'Coverage ledger'))[1];
  for (const rel of ['.asd/workflows/asd-phase-impl-review.md', '.asd/workflows/asd-phase-design-review.md']) {
    const flow = canonText(rel);
    assert.ok(flow.split('\n').some((line) => line.includes('self_hosting: enabled') && line.includes(`\`${selfHostingFlag}\``) && line.includes('emit-manifest')), `TST-2-1: ${rel} must add review-policy.md's \`${selfHostingFlag}\` to its emit-manifest step when self_hosting: enabled - dropped, a self-hosting review n/a's Documentation's Framework mode and validate-ledger accepts it`);
    assert.ok(flow.includes(`\`${unsplitName}\``) && flow.includes(`\`${partName}\``), `${rel} must name the manifest files it dispatches from exactly as emit-manifest writes them, or the orchestrator looks for a path that never appears`);
  }
  const emit = (count, dir, extra = [], name = reviewer) => {
    fs.mkdirSync(dir, { recursive: true });
    const scopePath = path.join(dir, 'scope.txt');
    fs.writeFileSync(scopePath, `${Array.from({ length: count }, (_, index) => `src/file-${index + 1}.md`).join('\n')}\n\n`, 'utf8');
    return JSON.parse(runtimeCli(['emit-manifest', '--reviewer', name, '--phase', 'impl-review', ...extra, '--files', scopePath, '--out', dir], { stdio: 'pipe' }));
  };
  const read = (entry) => JSON.parse(fs.readFileSync(entry.manifest, 'utf8'));

  const split = emit(runtime.SPLIT_THRESHOLD_FILES + 1, path.join(root, 'split'));
  assert.deepStrictEqual(split.map((entry) => path.basename(entry.manifest)), split.map((_, index) => partName.replace('<reviewer>', reviewer).replace('N', String(index + 1))), 'a scope above the threshold must be written as numbered parts, one file per part, each reported on stdout');
  const single = emit(runtime.SPLIT_THRESHOLD_FILES, path.join(root, 'single'));
  assert.deepStrictEqual(single.map((entry) => path.basename(entry.manifest)), [unsplitName.replace('<reviewer>', reviewer)], 'a scope at the threshold must be one unsplit manifest file');
  const halved = emit(2, path.join(root, 'halved'), ['--halve']);
  assert.deepStrictEqual(halved.map((entry) => path.basename(entry.manifest)), [1, 2].map((part) => partName.replace('<reviewer>', reviewer).replace('N', String(part))), 'the interruption trigger re-emits with --halve (review-policy.md "Split trigger"), so --halve ahead of --files must parse as a boolean and split even a scope under the threshold into two parts');

  const published = { vocabulary: runtime.LEDGER_VOCABULARY, row_example: runtime.LEDGER_ROW_EXAMPLE, n_a_shape: runtime.LEDGER_NA_SHAPE };
  const content = ['reviewer', 'phase', 'n_a', ...Object.keys(runtime.LEDGER_NA_SHAPE)];
  for (const entry of [...split, ...single, ...halved]) {
    const label = path.basename(entry.manifest);
    const onDisk = read(entry);
    assert.strictEqual(onDisk.digest, entry.digest, `${label}: the digest printed must be the digest written`);
    assert.strictEqual(onDisk.digest, runtime.coverageManifestDigest(onDisk), `${label}: a written manifest must carry its own digest, since validate-ledger recomputes it from the file`);
    assert.deepStrictEqual(Object.keys(onDisk).filter((key) => !content.includes(key) && key !== 'digest').sort(), Object.keys(published).sort(), `sprint-012 AC-1: ${label} must stamp exactly the published constants this test knows - one stamped without landing here would move every digest while the per-constant checks below never saw it`);
    for (const [field, constant] of Object.entries(published)) {
      assert.deepStrictEqual(onDisk[field], constant, `AC-6b/sprint-012 AC-1: ${label} must publish \`${field}\` from the validator's own constant, so the reviewer reads statuses, row shape and n_a shape off its own input instead of recalling rule prose`);
    }
    const withoutDigest = Object.assign({}, onDisk);
    delete withoutDigest.digest;
    assert.strictEqual(onDisk.digest, runtime.fingerprint(withoutDigest), `AC-6b: ${label}'s digest must be the hash of every field it carries but \`digest\`, published constants included - a field outside the identity could be edited on disk after stamping while every ledger citing that digest still validates. Expressed through the untouched \`fingerprint\` primitive so a change to the digester cannot move this expectation with it`);
  }
  assert.strictEqual(runtimeCli(['manifest-digest', '--manifest', single[0].manifest]).trim(), single[0].digest, 'review-policy.md "Coverage ledger": `manifest-digest --manifest <path>` verifies what emit-manifest stamped, so the two must agree on every emitted file');

  const customCommon = path.join(root, 'custom-common-rules.md');
  const customCoding = path.join(root, 'custom-coding-rules.md');
  fs.writeFileSync(customCommon, '# Custom Common Rules\n', 'utf8');
  fs.writeFileSync(customCoding, '# Custom Coding Rules\n\n## Perf budgets\n\n- p95 under 200ms\n', 'utf8');
  const perfHolders = (manifest) => Object.keys(manifest.n_a.rules).filter((id) => manifest.n_a.rules[id].includes(runtime.NA_PREDICATES.perf));
  const withoutRules = read(emit(1, path.join(root, 'no-custom'), [], 'efficiency')[0]);
  assert.ok(perfHolders(withoutRules).length > 0, 'sanity: without --custom-rules a prose-only scope must n/a the performance sections, or the budgeted run below proves nothing');
  const withRules = read(emit(1, path.join(root, 'custom'), ['--custom-rules', `${customCommon},${customCoding}`], 'efficiency')[0]);
  assert.deepStrictEqual(withRules.rules.slice(-2), [customCommon, customCoding], 'TST-1-1/TST-2-2: both review workflows pass --custom-rules as one comma-separated value, so each path must become its own custom-rule id, verbatim and in the order passed - otherwise every manifest silently drops its custom-rule rows');
  assert.deepStrictEqual(perfHolders(withRules), [], 'TST-1-1: the --custom-rules files must be read as the emitter\'s budgets input - a perf-budgets heading in the passed custom-coding-rules.md keeps every performance section reviewed');

  const nested = fs.readdirSync(path.join(REPO_ROOT, '.asd/templates'), { recursive: true }).map((entry) => String(entry).split(path.sep)).find((parts) => parts.length > 1 && parts[parts.length - 1].startsWith('t_'));
  assert.ok(nested, 'sanity: .asd/templates must hold a nested t_ file for the recursion check below');
  const documentation = (name, files, extra = []) => {
    const dir = path.join(root, name);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'scope.txt'), files.join('\n'), 'utf8');
    const [entry] = JSON.parse(runtimeCli(['emit-manifest', '--reviewer', 'documentation', '--phase', 'impl-review', ...extra, '--files', path.join(dir, 'scope.txt'), '--out', dir], { stdio: 'pipe' }));
    const onDisk = read(entry);
    return (predicate) => Object.keys(onDisk.n_a.rules).filter((id) => onDisk.n_a.rules[id].includes(predicate));
  };
  const plain = documentation('doc-plain', ['src/a.md']);
  assert.ok(plain(runtime.NA_PREDICATES.noSelfHosting).length === 1 && plain(runtime.NA_PREDICATES.noTemplated).length === 1, 'sprint-014 AC-4: a CLI emit without --self-hosting over an untemplated scope carries both new standing predicates');
  const hosted = documentation('doc-hosted', ['src/a.md', `reviews/${nested[nested.length - 1].slice(2)}`], ['--self-hosting']);
  assert.deepStrictEqual([hosted(runtime.NA_PREDICATES.noSelfHosting), hosted(runtime.NA_PREDICATES.noTemplated)], [[], []], `sprint-014 AC-4: --self-hosting ahead of --files must parse as a boolean both review workflows pass, and the CLI must read template names from every depth of .asd/templates - ${nested.join('/')} included`);
  for (const file of ['AGENTS.md', 'CLAUDE.md', 'src/AGENTS.md']) {
    assert.deepStrictEqual(documentation(`doc-${file.replace(/\W/g, '-')}`, ['src/a.md', file])(runtime.NA_PREDICATES.noTemplated), [], `TST-1-2: against the real .asd/templates list ${file} is templated by basename at any depth, so Template adherence must stay reviewed - the rule isTemplated's doc comment states`);
  }

  const manifest = JSON.parse(fs.readFileSync(single[0].manifest, 'utf8'));
  const vocabulary = runtime.LEDGER_VOCABULARY;
  const ledger = {
    manifest_digest: manifest.digest, findings: [],
    files: manifest.files.map((i) => ({ i, s: vocabulary.files[0] })),
    rules: manifest.rules.map((i) => (manifest.n_a.rules[i] ? { i, s: vocabulary.p, p: manifest.n_a.rules[i][0] } : { i, s: vocabulary.rules[0] })),
    sections: manifest.sections.map((i) => ({ i, s: vocabulary.sections[0] })),
  };
  const findingsPath = path.join(root, 'findings.json');
  fs.writeFileSync(findingsPath, '[]', 'utf8');
  const block = `\`\`\`json\n${JSON.stringify(ledger, null, 2)}\n\`\`\`\n`;
  const returnedText = (ledgerBlocks) => `[REVIEW-impl-${reviewer}]: APPROVE\n\nNo findings.\n\nA row looks like:\n\n\`\`\`json\n${JSON.stringify(runtime.LEDGER_ROW_EXAMPLE)}\n\`\`\`\n\n${ledgerBlocks}`;
  const validate = (text, name) => {
    const ledgerPath = path.join(root, name);
    fs.writeFileSync(ledgerPath, text, 'utf8');
    try {
      return JSON.parse(runtimeCli(['validate-ledger', '--manifest', single[0].manifest, '--ledger', ledgerPath, '--findings', findingsPath], { stdio: 'pipe' }));
    } catch (error) {
      return `exit ${error.status}: ${String(error.stderr).trim()}`;
    }
  };
  assert.deepStrictEqual(validate(returnedText(block), 'returned.md'), { ok: true }, "AC-12: --ledger must take the reviewer's returned text as-is and read its one fenced block carrying `manifest_digest`, skipping every other fenced block - a quoted JSON excerpt such as a row example included - so the orchestrator no longer extracts the block to bare JSON before validating");
  const twice = validate(returnedText(`${block}\n${block}`), 'twice.md');
  assert.ok(typeof twice === 'string' && twice.startsWith('exit 2'), `returned text carrying two ledger blocks must be rejected rather than resolved by picking one - a reviewer could otherwise ship a ledger the orchestrator never validated. Got: ${JSON.stringify(twice)}`);
});

test('sprint-012 AC-3/AC-12: every `.asd/runtime.js` symbol canon cites is declared there, every `node .asd/runtime.js` subcommand canon invokes is one the CLI dispatches, and every quoted `n/a: <predicate>` literal is a predicate the emitter can authorize', () => {
  const source = canonText('.asd/runtime.js');
  const declared = new Set([...source.matchAll(/^(?:const|function) ([A-Za-z_]\w*)/gm)].map((match) => match[1]));
  const subcommands = new Set([...source.matchAll(/command === '([a-z-]+)'/g)].map((match) => match[1]));
  const authorizable = new Set(Object.values(runtime.NA_PREDICATES));
  const citers = new Map();
  const invoked = [];
  const quoted = [];
  for (const rel of [...canonMarkdownFiles(), 'README.md', 'AGENTS.md']) {
    const text = canonText(rel);
    for (const [, list] of text.matchAll(/`\.asd\/runtime\.js`\s*\(?((?:`\w+`(?:\s*[,/]\s*)?)+)/g)) {
      for (const [, symbol] of list.matchAll(/`(\w+)`/g)) citers.set(symbol, (citers.get(symbol) || []).concat(rel));
    }
    for (const [, subcommand] of text.matchAll(/node \.asd\/runtime\.js ([a-z-]+)/g)) invoked.push(`${rel}: ${subcommand}`);
    for (const [, predicate] of text.matchAll(/`n\/a: ([^`<][^`]*)`/g)) quoted.push(`${rel}: ${predicate}`);
  }
  assert.ok(citers.size > 0 && invoked.length > 0 && quoted.length > 0, `each sweep must still reach its citation form - an empty one makes its comparison below pass over nothing (symbols ${citers.size}, invocations ${invoked.length}, predicates ${quoted.length})`);
  assert.deepStrictEqual([...citers.keys()].filter((symbol) => !declared.has(symbol)), [], 'canon hands member lists and predicate text to named runtime.js symbols instead of restating them, so a cited symbol must exist - renamed on one side only, the prose points at nothing and the next editor restates the list');
  assert.deepStrictEqual(invoked.filter((entry) => !subcommands.has(entry.split(': ')[1])), [], 'every subcommand canon tells an orchestrator to run must be one main() dispatches - anything else exits on the usage error at the moment a review gate needs it');
  assert.deepStrictEqual(quoted.filter((entry) => !authorizable.has(entry.slice(entry.indexOf(': ') + 2))), [], 'a reviewer copies a quoted `n/a: <predicate>` into its ledger row, and validate-ledger accepts only a predicate the emitted manifest authorizes - a literal outside NA_PREDICATES teaches a row the blocking gate rejects');
  for (const rel of ['.asd/rules/review-policy.md', '.asd/workflows/asd-phase-plan.md']) {
    assert.ok((citers.get('SPLIT_THRESHOLD_FILES') || []).includes(rel), `AC-3: ${rel} must cite the split threshold by its runtime symbol - review-policy.md for the pre-dispatch split, asd-phase-plan.md for the plan's review-scope estimate`);
  }
  for (const [symbol, rel] of [['DISPATCH_CEILING', '.asd/rules/sprint-lifecycle.md'], ['AUDIT_BATCH_THRESHOLD_FILES', '.asd/workflows/asd-phase-audit.md'], ['reviewerFiles', '.asd/rules/review-policy.md']]) {
    assert.ok((citers.get(symbol) || []).includes(rel), `sprint-015 AC-2/AC-9/AC-11: ${rel} must cite \`${symbol}\` by its runtime symbol rather than restate the value or selector it holds`);
  }
  assert.ok((citers.get('SURFACE_CAP_FILES') || []).includes('.asd/rules/sprint-lifecycle.md'), 'sprint-014 AC-5: the change-surface cap is one runtime constant, so sprint-lifecycle.md "Plan file format" must cite it by symbol rather than restate a number that drifts from the one surface-check applies');
});

test('sprint-012 AC-2/AC-4/AC-12: both review workflows emit manifests through emit-manifest and never stamp one by hand, keep a dispatched manifest immutable per review-policy.md "Coverage ledger", and carry the interrupted-attempt record the "Clean-context review iteration" payload list admits', () => {
  const policy = '.asd/rules/review-policy.md';
  assert.ok(/\*\*Immutability\*\*[^\n]*orchestrator[^\n]*re-stamp/.test(sectionOf(policy, 'Coverage ledger')), 'AC-2: "Coverage ledger" must make a dispatched manifest immutable to the orchestrator as well as the reviewer, and send a correction through a fresh dispatch rather than a re-stamp (010 F-2)');
  const payloadRule = sectionOf(policy, 'Clean-context review iteration').split('\n').find((line) => line.startsWith('- Reviewer payload carries only'));
  assert.ok(payloadRule && /interrupted-attempt record/.test(payloadRule), 'AC-4: the exhaustive reviewer payload list must admit the interrupted-attempt record, or a workflow adding it breaks the clean-context rule it cites');
  for (const [rel, phase] of [['.asd/workflows/asd-phase-impl-review.md', 'impl-review'], ['.asd/workflows/asd-phase-design-review.md', 'design-review']]) {
    const flow = sectionOf(rel, 'Workflow');
    assert.ok(flow.includes(`node .asd/runtime.js emit-manifest --reviewer <name> --phase ${phase}`), `${rel}: AC-12 - manifests must come from emit-manifest for this workflow's own phase`);
    assert.ok(!canonText(rel).includes('manifest-digest --manifest <path> --write'), `${rel}: the hand-stamping instruction the emitter replaced must be gone, or a split half is still assembled and stamped by hand beside the emitted parts`);
    const validateStep = flow.split('\n').find((line) => line.includes('validate-ledger --manifest'));
    assert.ok(validateStep && /never re-stamped/.test(validateStep) && validateStep.includes('`review-policy.md` "Coverage ledger"'), `${rel}: AC-2 - the ledger-validation step, where a failing manifest tempts a fix, must forbid the re-stamp and cite the rule`);
    const payload = flow.split('\n').find((line) => line.includes('payload to each internal reviewer'));
    assert.ok(payload && /interrupted-attempt record/.test(payload) && payload.includes('`review-policy.md` "Clean-context review iteration"'), `${rel}: AC-4 - a re-dispatched reviewer's payload must carry its own interrupted-attempt record, citing the list that admits it`);
  }
});

test('sprint-012 AC-5/AC-6: providers.md "Role-scoped context" defines the declared tool policy with its refusal signal, and core.md "Autonomy and escalation" and artifact-layout.md "Agent memory" hand their obligations to it', () => {
  const definition = sectionOf('.asd/rules/providers.md', 'Role-scoped context').split('\n').find((line) => line.startsWith('**Declared tool policy**'));
  assert.ok(definition, 'AC-5: the declared tool policy needs one definition an agent can check a payload against');
  assert.ok(definition.includes('`QUESTION`'), 'AC-5: the refusal must name the signal an agent returns, or "does not comply" ends in silence (010 F-5)');
  for (const component of ['`sprint-lifecycle.md` "Self-hosting"', '`artifact-layout.md` "Agent memory"']) {
    assert.ok(definition.includes(component), `AC-5: the policy is the definition plus its grants, so it must cite ${component} - without it a self-hosting write or a memory write reads as outside policy and gets refused`);
  }
  const pointer = '`providers.md` "Role-scoped context"';
  for (const [rel, heading] of [['.asd/rules/core.md', 'Autonomy and escalation'], ['.asd/rules/artifact-layout.md', 'Agent memory']]) {
    assert.ok(sectionOf(rel, heading).includes(pointer), `${rel} "${heading}" must point at the declared tool policy - core.md is where every agent meets the refusal, "Agent memory" is where a write is checked against the definition before it lands (AC-6)`);
  }
});

test('sprint-012 AC-9/AC-10: code-style.md §17 obliges a set-naming test or rule to derive the set from its source, and sprint-lifecycle.md "Impacted test set" owns the per-entry suite-record lag that t_test-plan.md cites', () => {
  const tests17 = canonText('.asd/rules/code-style.md').split('\n## 17.')[1].split('\n## ')[0];
  assert.ok(tests17.split('\n').some((line) => line.startsWith('- ') && /deriv/i.test(line) && /enumerat/i.test(line)), 'AC-9: §17 must require deriving a named set from its source rather than enumerating it (010 P5)');
  const home = sectionOf('.asd/rules/sprint-lifecycle.md', 'Impacted test set');
  assert.ok(/entry analysed/.test(home) && /final tree/.test(home), 'AC-10: "Impacted test set" must say a per-entry record measures the tree its entry analysed and only the terminal full-suite run the final tree (010 P6)');
  const suiteRun = sectionOf('.asd/templates/t_test-plan.md', 'Suite run').replace(/\n/g, ' ');
  assert.ok(/per-entry record[^.]*\(`\.asd\/rules\/sprint-lifecycle\.md` "Impacted test set"\)/.test(suiteRun), 'AC-10: t_test-plan.md "Suite run", where the record is written, must carry the lag as a pointer to its home');
});

test('sprint-012 AC-11: the report field asd-dev.md COMPLETED carries is the literal asd-phase-impl.md collects at step 6, gates the adaptive pass on at step 10 under checkpoints.md "Gate policy", and resolves before the fix-mode finalize at step 11', () => {
  const signal = sectionOf('.asd/agents/asd-dev.md', 'Signals emitted').split('\n').find((line) => line.startsWith('- `COMPLETED`'));
  const field = signal && (/`([^`]+:)`/.exec(signal) || [])[1];
  assert.ok(field, 'asd-dev.md COMPLETED must name the report field a dev flags choices in');
  const flow = sectionOf('.asd/workflows/asd-phase-impl.md', 'Workflow');
  for (const step of ['6', '10', '11']) {
    assert.ok(stepOf(flow, step).includes(`\`${field}\``), `asd-phase-impl.md step ${step} must read the literal \`${field}\` the dev emits - renamed on one side, a flagged choice passes the assessment unseen (011 P1)`);
  }
  const gateLine = stepOf(flow, '10').split('\n').find((line) => line.includes(`\`${field}\``));
  assert.ok(gateLine.includes('`checkpoints.md` "Gate policy"'), 'step 10 must classify a flagged choice under the gate policy that blocks an adaptive pass on an unresolved material alternative');
});

test("sprint-012 AC-13: the settings-change line sprint-lifecycle.md \"Plan file format\" defines is the one t_plan.md mirrors and asd-phase-impl.md applies as its Task's wave opens, ahead of that wave's dev dispatch, through the asd-init mode that type-checks it - a mode in asd-init's return contract, in asd-sprint's dispatchable skills, and exempt from the managed-block sync its authorised paths exclude", () => {
  const grammar = sectionOf('.asd/rules/sprint-lifecycle.md', 'Plan file format').split('\n').find((line) => line.startsWith('**Settings change declaration**'));
  const literal = grammar && /`([^`:]+:) <key>=<value>/.exec(grammar);
  assert.ok(literal, 'sprint-lifecycle.md "Plan file format" must define the settings-change line grammar');
  const token = literal[1];
  const templateLine = canonText('.asd/templates/t_plan.md').split('\n').find((line) => line.includes(`\`${token} <key>=<value>`));
  assert.ok(templateLine, "t_plan.md's parser-critical format comment must mirror the line a planner writes");
  assert.ok(!grammar.includes('never one a same-sprint task adds'), 'COR-2: the grammar must admit a key an earlier-wave Task of the same sprint adds to t_config.yaml - excluding it strands 011 P3, the add-then-enable case AC-13 exists for, on an MS-N halt');
  const planLine = sectionOf('.asd/workflows/asd-phase-plan.md', 'Workflow').split('\n').find((line) => /settings-change Task/.test(line));
  for (const [site, line] of [['t_plan.md', templateLine], ['asd-phase-plan.md', planLine]]) {
    assert.ok(line && line.includes('t_config.yaml'), `COR-2: ${site} must place the settings-change Task by whether t_config.yaml already carries its keys - a wave-1-only placement puts it ahead of the Task adding its key, and asd-init then fails the pair`);
  }

  const init = '.asd/skills/asd-init/SKILL.md';
  const modes = [...sectionOf(init, 'Modes').matchAll(/^- \*\*([A-Za-z-]+)\*\*/gm)].map((match) => match[1].toLowerCase());
  const contract = /INIT: <([^>]+)>/.exec(sectionOf(init, 'Return contract'));
  assert.deepStrictEqual(contract && contract[1].split('|'), modes, "asd-init's return contract must enumerate exactly the modes it declares");
  const reader = sectionOf(init, 'Modes').split('\n').find((line) => line.includes(`\`${token}\``));
  assert.ok(reader, `one asd-init mode must take the declared \`${token}\` pairs as its input`);
  const mode = /^- \*\*([A-Za-z-]+)\*\*/.exec(reader)[1].toLowerCase();
  const mediatedSteps = sectionOf(init, `Workflow (${mode})`).split(/\n(?=\d+\. )/);
  const stepNumber = (predicate) => mediatedSteps.findIndex(predicate);
  const validates = stepNumber((block) => block.includes('`.asd/templates/t_config.yaml`') && block.includes('`FAILED`'));
  const sets = stepNumber((block) => block.includes('`<key>=<value>`'));
  assert.ok(validates !== -1 && sets !== -1 && validates < sets, `COR-1-3: asd-init ${mode} mode must validate every declared pair against t_config.yaml, failing with \`FAILED\`, before the step that sets the pairs - an unknown key or out-of-range value otherwise lands in config.yaml, where nothing reads it`);
  const leafValues = [...canonText('.asd/templates/t_config.yaml').matchAll(/^\s*\w+:[ \t]+([^#\s][^#\n]*?)\s*(?:#.*)?$/gm)].map((match) => match[1]);
  const valueTypes = [...new Set(leafValues.map((value) => (/^(true|false)$/.test(value) ? 'boolean' : /^\d+$/.test(value) ? 'integer' : 'string')))];
  assert.ok(valueTypes.length > 1, `the t_config.yaml leaf sweep must still reach its fields (types found: ${valueTypes})`);
  for (const type of valueTypes) {
    assert.ok(new RegExp(`\\b${type}\\b`).test(mediatedSteps[validates]), `external iter-02 #1: asd-init ${mode} mode's validation step must say what value fits a ${type} field of t_config.yaml - most of its fields carry no enumeration, so without a type rule \`iterations_low=maybe\` or \`iterations_low=-3\` passes and is written`);
  }
  const configLeaves = (text) => {
    const leaves = new Map();
    const sections = [];
    let comments = [];
    for (const line of text.split('\n')) {
      const comment = /^\s*#(.*)$/.exec(line);
      if (comment) { comments.push(comment[1]); continue; }
      const field = /^(\s*)(\w+):[ \t]*([^#\n]*?)\s*(?:#(.*))?$/.exec(line);
      if (!field) { comments = []; continue; }
      const [, indent, key, value, inline = ''] = field;
      while (sections.length && sections[sections.length - 1].indent >= indent.length) sections.pop();
      const parent = sections[sections.length - 1];
      if (!value) {
        sections.push({ indent: indent.length, key: parent ? `${parent.key}.${key}` : key, comments });
      } else {
        const block = [...(parent ? parent.comments : []), ...comments].join('\n');
        const listed = /^\s*(\w+(?:\s*\|\s*\w+)+)/.exec(inline) || /Values:\s*(\w+(?:\s*\|\s*\w+)+)/.exec(block);
        const described = comments.map((text) => /^\s*(\w+)\s+—\s/.exec(text)).filter(Boolean).map((match) => match[1]);
        leaves.set(parent ? `${parent.key}.${key}` : key, { value: value.replace(/^"(.*)"$/, '$1'), raw: value, enumeration: listed ? listed[1].split(/\s*\|\s*/) : null, described });
      }
      comments = [];
    }
    return leaves;
  };
  const templateLeaves = configLeaves(canonText('.asd/templates/t_config.yaml'));
  const freeStrings = [...templateLeaves].filter(([, leaf]) => !leaf.enumeration && !/^(true|false|\d+)$/.test(leaf.raw)).map(([key]) => key);
  assert.deepStrictEqual(freeStrings, ['system.tools.codex_command', 'system.tools.claude_command', 'git.base_branch', 'git.branch_pattern'], `external iter-03 #2: asd-init ${mode} mode checks a string field of t_config.yaml against its \`Values:\` or inline \`a | b\` enumeration and otherwise accepts any string, so only genuinely free-form strings may carry neither - \`documents.prd=maybe\` or \`backward_compat=whatever\` is otherwise written to config.yaml. A new free-form field joins this list deliberately`);
  for (const [key, leaf] of templateLeaves) {
    if (!leaf.enumeration) continue;
    assert.ok(leaf.enumeration.includes(leaf.value), `t_config.yaml \`${key}\` ships the default \`${leaf.value}\`, which its own enumeration (${leaf.enumeration.join(' | ')}) would make asd-init reject`);
    if (leaf.described.length) assert.deepStrictEqual([...leaf.described].sort(), [...leaf.enumeration].sort(), `t_config.yaml \`${key}\` describes the values ${leaf.described.join(', ')} above the field, and asd-init validates against its enumeration - the two lists must name the same values`);
  }
  const readmeSchema = /^## Configuration$[\s\S]*?```yaml\n([\s\S]*?)```/m.exec(readRepoFile('README.md'));
  const readmeEnumerated = [...configLeaves(readmeSchema ? readmeSchema[1] : '')].filter(([, leaf]) => leaf.enumeration);
  assert.ok(readmeEnumerated.some(([key]) => key === 'backward_compat'), "the README config-schema sweep must still reach the schema block's enumerated fields");
  for (const [key, leaf] of readmeEnumerated) {
    const template = templateLeaves.get(key);
    assert.deepStrictEqual(template && template.enumeration, leaf.enumeration, `README.md's config schema mirrors t_config.yaml, so \`${key}\`'s values (${leaf.enumeration.join(' | ')}) must be the enumeration asd-init validates against there`);
  }

  const impl = '.asd/workflows/asd-phase-impl.md';
  const flow = sectionOf(impl, 'Workflow');
  const dispatchInit = `\`asd-init\` ${mode} mode`;
  const applying = flow.split(/\n(?=\d+[a-z]?\. )/).filter((block) => block.includes(`\`${token}\``) && block.includes(dispatchInit));
  assert.strictEqual(applying.length, 1, `exactly one asd-phase-impl.md step must apply the declared line through asd-init ${mode} mode instead of registering a manual step (011 P3)`);
  const applyStep = /^(\d+[a-z]?)\. /.exec(applying[0])[1];
  assert.ok(flow.indexOf(dispatchInit) < flow.indexOf('delegate to `asd-dev`'), `COR-2-2/DOC-2-1: a wave's bullets run in order, so the settings change (step ${applyStep}) must be applied ahead of that wave's dev delegation - applied after it, the settings Task reaches a dev before asd-init writes config.yaml`);
  const applyLine = applying[0].split('\n').find((line) => line.includes(`\`${token}\``) && line.includes(dispatchInit));
  assert.ok(/\bwave\b/.test(applyLine) && !/\bwave 1\b/.test(applyLine), `COR-2: step ${applyStep} must apply the settings change as its own Task's wave opens, never keyed to wave 1 - the grammar lets that Task follow the one adding its key, and applied at wave 1 the key is not in t_config.yaml yet`);
  assert.ok(applyLine.includes('`FAILED`'), `DOC-1: step ${applyStep} must say what the wave does when asd-init ${mode} mode returns \`FAILED\` - the mode writes nothing then, and dispatching the wave anyway runs its Tasks against a setting that never landed`);
  const failedClause = applyLine.slice(applyLine.indexOf('`FAILED`')).split(';')[0];
  assert.ok(/\b(?:halt|stop|abort)/i.test(failedClause) && /\bblocker\b/.test(failedClause) && /\bbefore\b[^;]*\bdispatch/.test(failedClause), `external iter-04 #1: step ${applyStep}'s \`FAILED\` clause ("${failedClause}") must halt as a blocker before any of that wave's dispatch - naming \`FAILED\` alone lets "on \`FAILED\`, continue dispatching" pass, and Execution mode halts only on a blocker`);
  const blockers = /^A blocker is exactly one of:\n((?:- .*\n?)+)/m.exec(sectionOf(impl, 'Execution mode'));
  assert.ok(blockers && blockers[1].split('\n').some((line) => line.includes('`asd-init`') && line.includes('`FAILED`') && line.includes(`step ${applyStep}`)), `DOC-1: impl's closed blocker list must admit asd-init's \`FAILED\` at step ${applyStep} - "exactly one of" leaves any other signal no halt path, so the autonomous phase has no rule to stop on`);
  const citation = `\`asd-phase-impl.md\` step ${applyStep}`;
  const sprintSkills = sectionOf('.asd/skills/asd-sprint/SKILL.md', 'Skills dispatched');
  for (const [site, text] of [['asd-init "Modes"', reader], ['asd-sprint "Skills dispatched"', sprintSkills], ['sprint-lifecycle.md "Plan file format"', grammar]]) {
    assert.ok(text.includes(citation), `${site} must cite the step that applies the settings change (${citation}) - a stale step number sends the reader to a step that no longer does it`);
  }
  assert.ok(sectionOf(impl, 'Operations used').split('\n').some((line) => line.includes(dispatchInit) && line.includes(`step ${applyStep}`)), `asd-phase-impl.md "Operations used" must name step ${applyStep} for the asd-init dispatch`);
  const gateLine = stepOf(flow, '9').split('\n').find((line) => line.includes('`.asd/project/config.yaml`'));
  assert.ok(gateLine && gateLine.includes(`step ${applyStep}`), `the completion gate must count config.yaml as authorised when step ${applyStep} wrote it, or the settings change fails the gate that follows it`);
  assert.ok(sprintSkills.includes(dispatchInit), 'asd-sprint "Skills dispatched" must admit asd-init in that mode - it otherwise forbids every skill but the phase skills');
  assert.ok(!canonText(init).includes('## Always first (both modes)') && new RegExp(`${mode} mode skips`, 'i').test(sectionOf(init, 'Always first')), `the managed-block sync writes AGENTS.md/CLAUDE.md, paths step 9 does not authorise, so "Always first" must exempt ${mode} mode`);
  assert.ok(sectionOf('.asd/rules/core.md', 'Invariants').includes('`sprint-lifecycle.md` "Plan file format"'), 'core.md "Invariants" names /asd-init the only settings writer, so its sprint-mediated exception must point at the grammar');
  const hardRule = canonText('.asd/templates/t_AGENTS.md').split('\n').find((line) => line.includes('edits settings'));
  assert.ok(hardRule && hardRule.includes('`impl`'), "t_AGENTS.md's hard rule, synced into every consumer's AGENTS.md, must name impl as the settings writer's second caller");
});

test("sprint-012 AC-14..AC-18: docs/architecture/subsystems.md is the one subsystem registry every consuming site names and asd-architect may write, its reserved ids are exactly the other names in the decomposed docs/architecture/ path map, its templates exist with responsibility frontmatter, the retired mermaid registry survives only as audit's migration source, and deleting a legacy c4/ is a hard gate", () => {
  const layout = '.asd/rules/artifact-layout.md';
  const registrySection = sectionOf(layout, 'Subsystem registry');
  const [registry, subsystemFile] = [...registrySection.matchAll(/`(docs\/architecture\/[^`]+\.md)`/g)].map((match) => match[1]);
  assert.ok(registry && subsystemFile && subsystemFile.includes('<'), 'artifact-layout.md "Subsystem registry" must name the registry and its per-subsystem file form');

  const sites = [
    ['core.md Glossary "Subsystem"', sectionOf('.asd/rules/core.md', 'Glossary').split('\n').find((line) => line.startsWith('- **Subsystem**'))],
    ['sprint-lifecycle.md "Audit phase"', sectionOf('.asd/rules/sprint-lifecycle.md', 'Audit phase')],
    ['sprint-lifecycle.md "Design-promote phase"', sectionOf('.asd/rules/sprint-lifecycle.md', 'Design-promote phase')],
    ['asd-phase-plan.md step 3', stepOf(sectionOf('.asd/workflows/asd-phase-plan.md', 'Workflow'), '3')],
    ['asd-phase-design-promote.md', canonText('.asd/workflows/asd-phase-design-promote.md')],
    ['t_audit.md "Subsystems map"', sectionOf('.asd/templates/t_audit.md', 'Subsystems map')],
    ['asd-init fresh step 13', stepOf(sectionOf('.asd/skills/asd-init/SKILL.md', 'Workflow (fresh)'), '13')],
  ];
  for (const [site, text] of sites) {
    assert.ok(text && text.includes(registry), `AC-14/AC-17: ${site} must name ${registry} - a site still naming the old registry leaves two homes for which subsystems exist`);
  }
  const grant = canonText('.asd/agents/asd-architect.md').split('\n').find((line) => line.startsWith('- Write access restricted to:'));
  assert.ok(grant && grant.includes(`\`${registry}\``) && grant.includes(`\`${subsystemFile}\``), 'AC-17: audit and design-promote dispatch asd-architect to write the registry and each subsystem file, so its own write grant must cover both - otherwise the dispatch sits outside its declared tool policy and must be refused (AC-5)');

  const reservedClause = registrySection.split(/Reserved[^:]*:/)[1];
  const reserved = reservedClause ? [...reservedClause.split(/\.(?:\s|$)/)[0].matchAll(/`([^`]+)`/g)].map((match) => match[1]) : [];
  const architectureTree = (text) => {
    const lines = text.split('\n');
    const root = lines.findIndex((line) => /── architecture\/\s*$/.test(line));
    assert.ok(root !== -1, 'a folder map must keep its docs/architecture/ tree');
    const depth = lines[root].search(/[├└]/);
    const children = [];
    for (const line of lines.slice(root + 1)) {
      const at = line.search(/[├└]/);
      if (at === -1) continue;
      if (at <= depth) break;
      if (at === depth + 4) children.push(line.slice(at + 4).trim().split(/\s/)[0]);
    }
    return children;
  };
  const children = architectureTree(sectionOf(layout, 'Paths (decomposition enabled)'));
  const occupied = children.filter((entry) => !entry.startsWith('<')).map((entry) => entry.split('/')[0].replace(/\.[a-z]+$/, ''));
  assert.deepStrictEqual([...reserved].sort(), [...occupied].sort(), 'AC-14: subsystem files sit flat in docs/architecture/ beside everything else there, so the reserved ids must be exactly the names the path map already occupies - derived from the map, so a new entry reddens until it is reserved');
  assert.deepStrictEqual(architectureTree(canonText('README.md')), children, "AC-18: README.md's folder map mirrors artifact-layout.md's decomposed docs/architecture/ tree entry for entry, in order");

  const templates = [...new Set([...registrySection.matchAll(/`(t_[^`]+)`/g)].map((match) => match[1]))];
  assert.ok(templates.length >= 2, 'AC-18: "Subsystem registry" must name a template for the registry and for the subsystem file');
  for (const name of templates) {
    const rel = `.asd/templates/${name}`;
    assert.ok(fs.existsSync(path.join(REPO_ROOT, rel)), `${rel} is named as a template and must exist`);
    const front = canonText(rel).split('\n---')[0];
    assert.ok(front.startsWith('---\nresponsibility:') && ['owns:', 'excludes:', 'delegates_to:'].every((key) => front.includes(key)), `${rel}: a persistent Markdown doc declares ownership in responsibility frontmatter - the ADR fold rule and the SSoT review both read it`);
  }

  const surfaces = [...canonMarkdownFiles(), 'README.md', 'AGENTS.md', '.gitignore', '.asd/templates/t_config.yaml', '.asd/release-manifest.json'];
  const retired = ['t_subsystems.yaml', 'architecture.html'];
  assert.deepStrictEqual(surfaces.flatMap((rel) => retired.filter((name) => canonText(rel).includes(name)).map((name) => `${rel}: ${name}`)), [], 'AC-16: the mermaid registry template and the architecture.html build output are retired everywhere - a surviving mention tells init to seed or ignore a file nothing produces');
  assert.ok(!fs.existsSync(path.join(REPO_ROOT, '.asd/templates/t_subsystems.yaml')), 'AC-16: t_subsystems.yaml must be deleted, not merely unreferenced');
  const docTypes = canonText(layout).split('\n').find((line) => line.startsWith('| `{{DOC_TYPE}}`'));
  assert.ok(docTypes && !docTypes.includes('`Architecture`'), 'AC-16: no architecture.html is written any more, so its DOC_TYPE value goes with it');
  const lifecycle = '.asd/rules/sprint-lifecycle.md';
  const legacyMentions = (text) => text.split('subsystems.yaml').length - 1;
  assert.deepStrictEqual(surfaces.filter((rel) => legacyMentions(canonText(rel)) > 0), [lifecycle], 'AC-16/AC-17: subsystems.yaml may survive only where audit migrates a pre-registry project from it');
  assert.strictEqual(legacyMentions(sectionOf(lifecycle, 'Audit phase')), legacyMentions(canonText(lifecycle)), 'every remaining subsystems.yaml mention must sit in "Audit phase", the migration source');

  const hard = sectionOf('.asd/rules/checkpoints.md', 'Gate policy').split('\n').find((line) => line.startsWith('Hard in both modes:'));
  assert.ok(hard && /deletion[^;]*migration/.test(hard), 'deleting a legacy c4/ at audit removes project files, so checkpoints.md "Gate policy" - the one home of hard gates - must list migration deletion');
  assert.ok(sectionOf(lifecycle, 'Audit phase').includes('`checkpoints.md` "Gate policy"'), '"Audit phase" must send its confirmation and deletion gates to that hard list');

  const seed = stepOf(sectionOf('.asd/skills/asd-init/SKILL.md', 'Workflow (fresh)'), '13');
  const gitignore = stepOf(sectionOf('.asd/skills/asd-init/SKILL.md', 'Workflow (fresh)'), '14');
  const diagramCondition = seed.indexOf('`diagram_tool`');
  assert.ok(seed.indexOf(registry) !== -1 && seed.indexOf(registry) < diagramCondition && diagramCondition < seed.indexOf('c4/model'), 'AC-16/AC-18, sprint-013 AC-13: asd-init must seed c4/ only under the diagram_tool condition, while the registry seed precedes it unconditionally');
  assert.ok(gitignore.includes('likec4'), 'sprint-013 AC-13: the .gitignore entry for c4 build output must carry the same likec4 condition as the seed that creates c4/');
  assert.deepStrictEqual([seed, gitignore].filter((step) => step.includes('documents.c4')), [], 'sprint-013 AC-13: asd-init steps 13 and 14 must not key on the removed documents.c4 - init writes config, which no longer carries it');
});

// ===========================================================================
// 21. Sprint 013: the impl-test stalemate comparer and the 9.0.0 config
// migration. The comparer decides whether a defect loop escalates, so a set
// it misreads either loops uncapped or stops a sprint for nothing; the
// migration rewrites a consumer's config.yaml without a YAML parser.
// ===========================================================================

/** A test plan whose Defects table is t_test-plan.md's own header, plus a row builder keyed by that header's column names. */
function defectPlanFixture() {
  const table = sectionOf('.asd/templates/t_test-plan.md', 'Defects').split('\n').filter((line) => line.startsWith('|'));
  assert.ok(table.length >= 2, 't_test-plan.md "Defects" must keep its table header and separator');
  const columns = table[0].split('|').slice(1, -1).map((cell) => cell.trim());
  const row = (id, entry, [location, symptom, failingTest], status = 'pending') => {
    const cells = { ID: id, Entry: entry, Location: location, Symptom: symptom, 'Failing test': failingTest, Status: status };
    return `| ${columns.map((name) => (Object.hasOwn(cells, name) ? cells[name] : '')).join(' | ')} |`;
  };
  const plan = (rows, eol = '\n') => ['# Test plan', '', '## Defects', '', table[0], table[1], ...rows, '', '## Manual verification (optional)', ''].join(eol);
  return { row, plan };
}

const DEFECT_PARSER = ['tests/run.js:120', 'AssertionError [ERR_ASSERTION]: expected a \\| b', 'parser: rejects a tab indent'];
const DEFECT_SPLITTER = ['.asd/runtime.js:40:7', 'TypeError: Cannot read properties of undefined', 'runtime: splits a table row'];

/** The key list 9.0.0.js drops, read from its literal array as §16 reads PHASE_CHAIN - the removed-key checks take their set from the migration itself. */
function readRemovedConfigKeys() {
  const block = /const REMOVED_KEYS = \[([\s\S]*?)\];/.exec(canonText('.asd/migrations/9.0.0.js'));
  assert.ok(block, '9.0.0.js must keep REMOVED_KEYS as a literal array');
  const keys = (block[1].match(/'([^']+)'/g) || []).map((quoted) => quoted.slice(1, -1));
  assert.ok(keys.length > 0, 'REMOVED_KEYS must still list keys, or every removed-key check passes over nothing');
  return keys;
}

/** Runs 9.0.0.js on `text` as a project's config.yaml; stdout is captured, `rerun` migrates the same project again. */
function migrateConfig900(text) {
  const root = mkTempDir();
  const configPath = path.join(root, '.asd', 'project', 'config.yaml');
  if (text !== undefined) writeFile(root, '.asd/project/config.yaml', text);
  const run = () => {
    const captured = [];
    const realWrite = process.stdout.write;
    process.stdout.write = (chunk) => {
      captured.push(String(chunk));
      return true;
    };
    let report;
    try {
      report = migration900({ repoRoot: root });
    } finally {
      process.stdout.write = realWrite;
    }
    return { report, output: captured.join(''), text: fs.existsSync(configPath) ? fs.readFileSync(configPath, 'utf8') : undefined, rerun: run };
  };
  return run();
}

test('sprint-013 AC-1/AC-2: defect-stalemate compares the identity sets of two consecutive impl-test entries that routed defects - file path without its line, verbatim runner line, failing test - never D-N ids, row order or impl-review rows, and its digest names the latest set', () => {
  const { row, plan } = defectPlanFixture();
  const verdict = (rows, eol) => runtime.defectStalemate(plan(rows, eol));
  const moved = (tuple, location) => [location, tuple[1], tuple[2]];
  const latest = [row('D-3', '2', moved(DEFECT_SPLITTER, '`.asd/runtime.js:88`')), row('D-4', '2', moved(DEFECT_PARSER, 'tests/run.js:131'))];
  const repeat = [row('D-1', '1', DEFECT_PARSER, 'fixed'), row('D-2', '1', DEFECT_SPLITTER, 'fixed'), ...latest];

  const repeated = verdict(repeat);
  assert.strictEqual(repeated.stalemate, true, 'the same file paths, runner lines and failing tests routed twice are a stalemate, although every line number moved, the ids differ and the rows are reordered');
  assert.deepStrictEqual(verdict([...latest].reverse()), { stalemate: false, digest: repeated.digest }, 'the digest is the latest set alone, independent of row order - a decisions-log answer is keyed to it');
  assert.deepStrictEqual(verdict(repeat, '\r\n'), repeated, 'a CRLF test plan must compare exactly as its LF form');

  for (const [field, index, value] of [['file path', 0, 'tests/other.js:131'], ['runner failure line', 1, 'AssertionError [ERR_ASSERTION]: expected a'], ['failing test', 2, 'parser: rejects a tab']]) {
    const changed = DEFECT_PARSER.map((cell, at) => (at === index ? value : cell));
    assert.strictEqual(verdict([row('D-1', '1', DEFECT_PARSER), row('D-2', '2', changed)]).stalemate, false, `a changed ${field} is a different defect - AC-2 compares the runner's text verbatim, so a reworded symptom fails open by design`);
  }
  assert.strictEqual(verdict([row('D-1', '1', DEFECT_PARSER), row('D-2', '1', DEFECT_SPLITTER), row('D-3', '2', DEFECT_PARSER)]).stalemate, false, 'a subset of the previous set is progress, not a stalemate');
  assert.strictEqual(verdict([row('D-1', '1', DEFECT_PARSER), row('D-2', '2', DEFECT_PARSER), row('D-3', '2', DEFECT_SPLITTER)]).stalemate, false, 'a superset of the previous set is not a stalemate');

  assert.strictEqual(verdict([row('D-1', '1', DEFECT_PARSER), row('D-2', '2', DEFECT_PARSER), row('D-3', 'impl-review', DEFECT_SPLITTER)]).stalemate, true, 'an impl-review row never joins an entry set, the latest included');
  assert.strictEqual(verdict([row('D-1', 'impl-review', DEFECT_PARSER), row('D-2', '1', DEFECT_PARSER)]).stalemate, false, 'an impl-review row is not an impl-test entry, so one routing entry has nothing to repeat');
  assert.strictEqual(verdict([row('D-1', '1', DEFECT_SPLITTER), row('D-2', '2', DEFECT_PARSER), row('D-3', '3', DEFECT_PARSER)]).stalemate, true, 'only the last two entries are compared - an older entry routing a different set does not break a consecutive repeat');
  assert.strictEqual(verdict([row('D-1', '1', DEFECT_SPLITTER), row('D-2', '2', DEFECT_PARSER), row('D-3', '4', DEFECT_PARSER)]).stalemate, false, 'a green entry between two routings of the same set breaks the run - entries 2 and 4 are not consecutive (sprint-lifecycle.md "Impl-test phase")');
  assert.strictEqual(verdict([row('D-1', '9', DEFECT_PARSER), row('D-2', '10', DEFECT_PARSER), row('D-3', '2', DEFECT_SPLITTER)]).stalemate, true, 'entries order by number, so entry 10 follows entry 9');

  const single = verdict([row('D-1', '1', DEFECT_PARSER)]);
  assert.ok(single.stalemate === false && /^[0-9a-f]{64}$/.test(single.digest), `a first routing is never a stalemate but still names its set: ${JSON.stringify(single)}`);
  assert.deepStrictEqual(verdict([]), { stalemate: false, digest: null }, 'no defect rows: nothing to compare');
  assert.deepStrictEqual(runtime.defectStalemate(readRepoFile('.asd/templates/t_test-plan.md')), { stalemate: false, digest: null }, 't_test-plan.md as shipped must parse - its placeholder row routes no entry');

  assert.throws(() => runtime.defectStalemate('# Test plan\n'), /Defects/, 'a plan without a Defects section must fail, never report no stalemate');
  assert.throws(() => runtime.defectStalemate(plan([row('D-1', '1', DEFECT_PARSER)]).replace('| Entry |', '| Round |')), /Entry/, 'a Defects table missing an identity column must fail closed');
  assert.throws(() => verdict([row('D-1', '1', ['a.js', 'expected a | b', 'parser'])]), /malformed/, 'an unescaped pipe in a cell shifts every column after it, so the row must fail rather than compare the wrong fields');
});

test('sprint-013 AC-2 D-1: defect-stalemate rejects a Defects row whose Entry is neither an Entry log number nor impl-review - skipping it drops that entry\'s set and a real stalemate fails open', () => {
  const { row, plan } = defectPlanFixture();
  assert.doesNotThrow(() => runtime.defectStalemate(plan([row('D-1', '1', DEFECT_PARSER), row('D-2', 'impl-review', DEFECT_PARSER)])), 'sanity: the two Entry forms t_test-plan.md defines must parse');
  for (const entry of ['Entry 2', '#2', 'impl review', '']) {
    assert.throws(() => runtime.defectStalemate(plan([row('D-1', '1', DEFECT_PARSER), row('D-2', entry, DEFECT_PARSER)])), Error, `Entry ${JSON.stringify(entry)} is off-template (t_test-plan.md: \`Entry log\` N or impl-review) - read as "not an impl-test entry" it hides entry 2's repeat of entry 1 and the loop runs on uncapped`);
  }
});

test('sprint-014 AC-3: defect-stalemate fails closed on a second ## Defects section, exact or suffixed, naming every heading line, and names the line of a missing column, a malformed separator or a malformed row', () => {
  const { row, plan } = defectPlanFixture();
  const rejection = (text) => {
    try {
      return `accepted: ${JSON.stringify(runtime.defectStalemate(text))}`;
    } catch (error) {
      return error.message;
    }
  };
  const lineOf = (text, match) => text.split('\n').findIndex(match) + 1;
  const first = plan([row('D-1', '1', DEFECT_PARSER)]);
  for (const heading of ['## Defects', '## Defects (entry 2)']) {
    const second = plan([row('D-2', '2', DEFECT_PARSER)]).split('\n').slice(2).join('\n').replace('## Defects', heading);
    const doubled = `${first}\n${second}`;
    const lines = doubled.split('\n').flatMap((line, index) => (line.startsWith('## Defects') ? [index + 1] : []));
    assert.strictEqual(lines.length, 2, 'sanity: the fixture must carry exactly two Defects headings');
    const message = rejection(doubled);
    assert.ok(new RegExp(`^test-plan has 2 ## Defects sections at lines ${lines.join(', ')}$`).test(message), `"${heading}": entry 2 repeats entry 1 across two sections, so reading either one alone reports no stalemate and the impl-test loop runs uncapped - more than one section must fail closed and name each heading's line so the author can merge them. Got: ${message}`);
  }

  const rows = [row('D-1', '1', DEFECT_PARSER), row('D-2', '2', DEFECT_PARSER)];
  const readable = plan(rows);
  const headerLine = lineOf(readable, (line) => line.includes('| Entry |'));
  const renamed = readable.replace('| Entry |', '| Round |');
  assert.match(rejection(renamed), new RegExp(`^line ${headerLine}: .*Entry`), 'a missing identity column must name the header line');
  const noSeparator = readable.split('\n').filter((_, index) => index !== headerLine).join('\n');
  assert.match(rejection(noSeparator), new RegExp(`^line ${headerLine + 1}: .*separator`), 'without a separator the first data row would be consumed as one and its defect silently dropped from the entry set - the line that stands where the separator belongs must be named instead');
  const extraCell = plan([rows[0], `${rows[1]} extra |`]);
  assert.match(rejection(extraCell), new RegExp(`^line ${lineOf(extraCell, (line) => line.endsWith('extra |'))}: .*malformed`), 'a malformed row must name its own line, not only its cells');
});

test('sprint-014 AC-5: surface-check counts distinct paths against SURFACE_CAP_FILES or a positive override bound, exits 1 with the result on breach and 2 on unusable input, and the plan declaration and override gate it measures read the same literals at plan and at impl-review entry', () => {
  const cap = runtime.SURFACE_CAP_FILES;
  const paths = (count) => Array.from({ length: count }, (_, index) => `src/file-${index + 1}.md`);
  const result = (files, bound, breach) => ({ files, cap: bound, breach, dispatches: runtime.surfaceCheck([], bound).dispatches });
  assert.deepStrictEqual(runtime.surfaceCheck(paths(cap)), result(cap, cap, false), 'a surface at the cap is within it');
  assert.deepStrictEqual(runtime.surfaceCheck(paths(cap + 1)), result(cap + 1, cap, true), 'one file over the cap is a breach');
  assert.strictEqual(runtime.surfaceCheck(paths(cap).concat('src/file-1.md')).breach, false, 'a path listed twice is one file of change surface - counting it twice escalates a sprint that is within its cap');
  assert.deepStrictEqual(runtime.surfaceCheck(paths(cap + 1), cap + 1), result(cap + 1, cap + 1, false), 'an approved override bound replaces the cap');
  for (const bound of [0, -1, 1.5, Number.NaN]) {
    assert.throws(() => runtime.surfaceCheck(paths(1), bound), /bound/, `bound ${bound}: an unusable override must fail closed, never silently fall back to a bound that admits the surface`);
  }

  const root = mkTempDir();
  const run = (args) => {
    try {
      return { status: 0, stdout: runtimeCli(['surface-check', ...args], { stdio: 'pipe' }) };
    } catch (error) {
      return { status: error.status, stdout: String(error.stdout) };
    }
  };
  const list = (name, count) => {
    const file = path.join(root, name);
    fs.writeFileSync(file, `${paths(count).join('\r\n')}\r\n\r\n`, 'utf8');
    return file;
  };
  assert.deepStrictEqual(run(['--files', list('within.txt', cap)]), { status: 0, stdout: `${JSON.stringify(result(cap, cap, false))}\n` }, 'a CRLF git diff --name-only list with a trailing blank line at the cap exits 0 and prints the result');
  assert.deepStrictEqual(run(['--files', list('over.txt', cap + 1)]), { status: 1, stdout: `${JSON.stringify(result(cap + 1, cap, true))}\n` }, 'a breach exits 1 and still prints the result both gates read');
  assert.deepStrictEqual(run(['--files', list('bounded.txt', cap + 1), '--bound', String(cap + 1)]), { status: 0, stdout: `${JSON.stringify(result(cap + 1, cap + 1, false))}\n` }, '--bound carries the recorded override into the CLI');
  for (const [label, args] of [['missing --files', []], ['non-numeric --bound', ['--files', list('any.txt', 1), '--bound', 'many']]]) {
    assert.deepStrictEqual(run(args), { status: 2, stdout: '' }, `${label}: no result may be read from input the check could not use`);
  }

  const declaration = sectionOf('.asd/rules/sprint-lifecycle.md', 'Plan file format').split('\n').find((line) => line.startsWith('**Change surface declaration**'));
  const declared = declaration && /`(Change surface: <n> files)`/.exec(declaration);
  const gate = declaration && /`gate: ([a-z-]+)`, `evidence: (bound=<n>)`/.exec(declaration);
  assert.ok(declared && gate, 'sprint-lifecycle.md "Plan file format" must define the plan declaration line and the override record as literals');
  assert.ok(sectionOf('.asd/templates/t_plan.md', 'Overview').includes(declared[1].replace('<n>', '{{n}}')), 't_plan.md Overview must slot the declaration sprint-lifecycle.md defines, or plans stop carrying it and impl-review grandfathers every sprint');
  assert.ok(canonText('.asd/workflows/asd-phase-plan.md').includes(declared[1]), 'asd-phase-plan.md must write the declaration in its defined form');
  const gateName = /hard `([^`]+)` gate \(`checkpoints\.md`\)/.exec(declaration);
  const checkpoints = canonText('.asd/rules/checkpoints.md').split('\n');
  assert.ok(gateName && checkpoints.some((line) => line.startsWith('Hard in both modes:') && line.includes(gateName[1])) && checkpoints.some((line) => line.startsWith(`| ${gateName[1]} `) && line.includes('| hard')), 'the override sprint-lifecycle.md sends to checkpoints.md must be in its hard-in-both-modes list and hard in the gate inventory - listed nowhere, an adaptive orchestrator may approve its own cap override');
  const entryCheck = canonText('.asd/workflows/asd-phase-impl-review.md').split('\n').find((line) => line.includes('surface-check --files'));
  assert.ok(entryCheck && entryCheck.includes(`\`${declared[1].split('<n>')[0].trim()}\``) && entryCheck.includes(`gate: ${gate[1]}`) && entryCheck.includes('--bound <n>'), `plan Reachability: impl-review entry must detect the plan's declaration by its prefix and read the override bound from the \`gate: ${gate[1]}\` record plan writes - a renamed gate on either side leaves every approved override unread and the entry check escalates again`);
});

test('sprint-014 AC-2: a failed creator or tester dispatch is reconstructed from the ASD-Task trailer git-strategy.md defines, anchored on the dispatch HEAD both dispatching workflows log, and the git log command State recovery runs reports that trailer', () => {
  const commits = sectionOf('.asd/rules/git-strategy.md', 'Commits');
  const trailer = /`(ASD-Task): <id>`/.exec(commits);
  assert.ok(trailer, 'git-strategy.md "Commits" must define the ASD-Task trailer literal');
  const ids = [...commits.split('\n').find((line) => line.includes(trailer[0])).split(' — ')[1].matchAll(/`([^`]+)`/g)].map((match) => match[1]);
  const testerId = ids.find((id) => id.startsWith('impl-test '));
  const suiteId = ids.find((id) => id.startsWith('impl-review '));
  assert.ok(testerId && suiteId, `COR-2/EXT-3: git-strategy.md "Commits" must list an id for impl-test's own commits and for impl-review step 9's in-place test fix. Got: ${JSON.stringify(ids)}`);
  const failed = sectionOf('.asd/rules/sprint-lifecycle.md', 'State recovery').split('\n').find((line) => line.startsWith('**Failed dispatch**'));
  const anchor = failed && /`(dispatch HEAD <sha>)`/.exec(failed);
  const command = failed && /`(git log [^`]+)`/.exec(failed);
  const reconstruction = failed && /`- YYYY-MM-DD — (reconstruction: [^`]+)`/.exec(failed);
  assert.ok(anchor && command && reconstruction, 'sprint-lifecycle.md "State recovery" must keep the failed-dispatch anchor, git log command and decisions-log line as literals');
  assert.ok(canonText('.asd/templates/t_decisions-log.md').includes(reconstruction[1]), 't_decisions-log.md carries the normative one-line forms, so it must carry the reconstruction line State recovery appends');
  const testerException = failed.split(/(?<=\.) /).find((sentence) => sentence.includes(`\`${testerId}\``));
  assert.ok(testerException && /\bnever\b[^.:]*landed/.test(testerException) && testerException.includes('(`asd-phase-impl-test.md` step 1)'), `COR-2: reconstruction must never read \`${testerId}\` as landed and must resume via asd-phase-impl-test.md step 1 - dropped as landed after the test commit, the entry's suite gate never runs`);
  assert.ok(canonText('.asd/workflows/asd-phase-impl-test.md').split('\n').some((line) => line.startsWith('1. ') && line.includes('interrupted current entry')), 'COR-2: asd-phase-impl-test.md step 1, which reconstruction resumes through, must handle the interrupted current entry');
  const defectId = ids.find((id) => id.startsWith('D-'));
  const fixedStatus = /`Status` to `([^`]+)`/.exec(canonText('.asd/workflows/asd-phase-impl.md'));
  assert.ok(defectId && fixedStatus, `COR-1: git-strategy.md "Commits" must list the D-N id and asd-phase-impl.md test-fix must name the Status it sets. Got: ${JSON.stringify(ids)}`);
  const defectSentence = failed.split(/(?<=\.) /).find((sentence) => sentence.includes(`\`${defectId}\``));
  const [defectLands = '', defectOtherwise = ''] = defectSentence ? defectSentence.slice(defectSentence.indexOf(`\`${defectId}\``)).split(/\botherwise\b/) : [];
  assert.ok(defectLands.includes('Defects') && defectLands.includes(`\`${fixedStatus[1]}\``), `COR-1: reconstruction must read a \`${defectId}\` trailer as landed only once its Defects row reads \`${fixedStatus[1]}\` - test-fix commits the fix before flipping the row, so a dispatch dying between them leaves the row pending`);
  assert.ok(/\bsha\b/.test(defectOtherwise) && /\b(?:no|never|not)\b[^.]*\bfix/.test(defectOtherwise), `COR-1: otherwise the re-dispatch must only set the \`${defectId}\` row from the trailer commit's sha, without a second fix`);
  const ledgerKey = /\bledger\.(\w+)\)\s*\?\s*ledger\.\1\b/.exec(canonText('.asd/runtime.js'));
  const partFile = /<reviewer>(\.part-)N(\.md)`/.exec(canonText('.asd/rules/review-policy.md'));
  assert.ok(ledgerKey && ids.includes(ledgerKey[1]), `DOC-1: git-strategy.md "Commits" must define a review finding id as its id in the reviewer's ledger \`${ledgerKey && ledgerKey[1]}\` - undefined, a dev writes a trailer reconstruction cannot match. Got: ${JSON.stringify(ids)}`);
  assert.ok(partFile && ids.some((id) => new RegExp(`^[a-z-]+${partFile[1].replace('.', '\\.')}\\d+${partFile[2].replace('.', '\\.')} [A-Z]+-\\d+$`).test(id)), `DOC-1: git-strategy.md "Commits" must show a review finding id prefixed by its <reviewer>.part-N.md file - split parts' findings are a union, never renumbered, so a bare shared id reads the other part's fix as landed. Got: ${JSON.stringify(ids)}`);
  const reviewFixPayload = (canonText('.asd/workflows/asd-phase-impl.md').split('\n').find((line) => line.trimStart().startsWith('- initial —') && line.includes('review-fix —')) || '').split(/;\s*test-fix\b/)[0].split('review-fix —')[1] || '';
  assert.ok(/\bid\b[^;]*`git-strategy\.md` "Commits"/.test(reviewFixPayload), 'DOC-1: the review-fix payload must carry each finding\'s id per git-strategy.md "Commits" - without it the dev has no id for its ASD-Task trailer');
  const leftovers = failed.split(/(?<=\.) /).find((sentence) => /\buncommitted\b/i.test(sentence));
  const [payload = '', orchestrator = ''] = leftovers ? leftovers.split(/;\s*/) : [];
  assert.ok(/\bauthori[sz]ed\b/.test(payload), 'TST-1: the failed-dispatch payload must limit uncommitted leftovers to the paths the failed dispatch was authorised to touch');
  assert.ok(/\bnever\b[^;]*\bbookkeeping\b/.test(payload) && /\bnever\b[^;]*\bsibling\b/.test(payload), 'TST-1: the failed-dispatch payload must never name orchestrator bookkeeping or an in-flight sibling dispatch\'s paths - the agent would finish or revert state.json, decisions-log.md or sibling work');
  assert.ok(/\borchestrator\b/.test(orchestrator) && /\bnever\b/.test(orchestrator) && /\bstag/.test(orchestrator) && /\bdiscard/.test(orchestrator), 'TST-1: the orchestrator must never stage or discard a failed dispatch\'s leftovers - author-only staging');
  for (const rel of ['.asd/templates/t_decisions-log.md', '.asd/workflows/asd-phase-impl.md', '.asd/workflows/asd-phase-impl-test.md']) {
    assert.ok(canonText(rel).split('\n').some((line) => /route <taskIds?>/.test(line) && line.includes(anchor[1])), `${rel}: the routing line must carry \`${anchor[1]}\` - without it a failed dispatch has no anchor and every commit on the branch reads as landed`);
  }
  for (const rel of ['.asd/workflows/asd-phase-impl.md', '.asd/workflows/asd-phase-impl-test.md']) {
    assert.ok(canonText(rel).split('\n').some((line) => line.includes('`sprint-lifecycle.md` "State recovery" failed dispatch')), `${rel}: the no-signal branch must hand off to State recovery's failed-dispatch rule before any re-dispatch`);
  }
  for (const rel of ['.asd/agents/asd-dev.md', '.asd/agents/asd-tester.md']) {
    assert.ok(canonText(rel).includes(`\`${trailer[1]}\` trailer (\`git-strategy.md\` "Commits")`), `${rel}: the agent that commits must be told to write the trailer reconstruction reads`);
  }

  const repo = mkTempDir();
  const git = (...args) => execFileSync('git', ['-c', 'user.name=asd-test', '-c', 'user.email=asd-test@example.invalid', '-c', 'commit.gpgsign=false', ...args], { cwd: repo, encoding: 'utf8' });
  git('init', '-q');
  writeFile(repo, 'src/base.js', 'base\n');
  git('add', '-A');
  git('commit', '-q', '-m', 'chore: base');
  const start = git('rev-parse', 'HEAD').trim();
  writeFile(repo, 'src/landed.js', 'landed\n');
  git('add', '-A');
  git('commit', '-q', '-m', `feat: land task\n\n${trailer[1]}: Task 3`);
  const grouped = ['Task 4', 'D-1'];
  writeFile(repo, 'src/grouped.js', 'grouped\n');
  git('add', '-A');
  git('commit', '-q', '-m', `fix: grouped\n\n${grouped.map((id) => `${trailer[1]}: ${id}`).join('\n')}`);
  const sprintOnly = suiteId.replace('NN', '01');
  writeFile(repo, '.asd/sprints/001-x/test-plan.md', 'suite\n');
  git('add', '-A');
  git('commit', '-q', '-m', `test: sprint path only\n\n${trailer[1]}: ${sprintOnly}`);
  writeFile(repo, 'src/uncommitted.js', 'left over\n');
  const args = command[1].replace('<anchor>', start).match(/(?:[^\s']+|'[^']*')+/g).map((token) => token.replace(/'/g, ''));
  const landed = git(...args.slice(1)).split('\n');
  assert.ok(landed.includes('Task 3'), `the State recovery git log must print each landed commit's ${trailer[1]} value on its own line, or every landed task is re-dispatched. Got: ${JSON.stringify(landed)}`);
  assert.ok(grouped.every((id) => landed.includes(id)), `COR-3: a commit covering several ids carries one ${trailer[1]} line per id, and the git log must print every one - an unprinted id re-dispatches landed work. Got: ${JSON.stringify(landed)}`);
  assert.ok(landed.includes(sprintOnly), `EXT-2: a commit touching only .asd/sprints/** (a tester's test-plan.md, impl-review's suite fix) must still report its ${trailer[1]} - a pathspec that hides it re-dispatches landed work. Got: ${JSON.stringify(landed)}`);
});

test('sprint-014 AC-7: decisions-log.md and test-plan.md rotate into the segment names artifact-layout.md defines, every canon mention uses those names, live test-plan.md keeps the sections its per-entry readers need, and each cross-span reader points at the rotation rule', () => {
  const rotation = (heading) => sectionOf('.asd/rules/artifact-layout.md', heading).split('\n').find((line) => line.startsWith('**Rotation**'));
  const testPlan = rotation('Test plan');
  const decisions = rotation('Decisions log');
  assert.ok(testPlan && decisions, 'artifact-layout.md "Test plan" and "Decisions log" must each own a Rotation paragraph');
  const names = { test: /`(test-plan\.[^`]+\.md)`/.exec(testPlan)[1], decisions: /`(decisions-log\.[^`]+\.md)`/.exec(decisions)[1] };
  const mentions = [];
  for (const rel of [...canonMarkdownFiles(), '.asd/rules/artifact-layout.md', 'README.md']) {
    for (const [mention] of canonText(rel).matchAll(/(?:test-plan|decisions-log)\.[^\s.`'"()]+\.md/g)) mentions.push(`${rel}: ${mention}`);
  }
  assert.ok(mentions.length > 2, 'sanity: the sweep must reach the segment names canon uses');
  assert.deepStrictEqual(mentions.filter((entry) => ![names.test, names.decisions].includes(entry.split(': ')[1])), [], 'EXT-6: every test-plan.<token>.md / decisions-log.<token>.md mention must carry the canonical token - a reader globbing a segment name other than the one the rotating writer produces reads nothing and reports a short history');

  const trigger = decisions.split(' renames ')[0];
  assert.ok(trigger.includes('`state.json.phase`'), 'TST-2-2: decisions-log rotation must be conditioned on the delegated phase differing from `state.json.phase` - unconditioned, a resume rotates the live file away from its within-phase readers');
  const neverRotates = decisions.split(/(?<=\.) (?=[A-Z])/).find((sentence) => /never rotates/.test(sentence));
  assert.ok(neverRotates && /resume/i.test(neverRotates), 'TST-2-2: the Decisions log Rotation paragraph must state that a resume or re-run of the current phase never rotates');
  for (const reader of ['`review-policy.md` "Interrupted dispatch"', '`sprint-lifecycle.md` "State recovery"']) {
    assert.ok(neverRotates && neverRotates.includes(reader), `TST-2-2: the resume-never-rotates sentence must name its within-phase reader ${reader} - rotated mid-phase, that reader loses its count or routing line`);
  }
  assert.ok(/\bresum[^.;]*\(`asd-phase-impl-test\.md` step 1\)/.test(testPlan), 'TST-2-2: test-plan rotation must carve out resuming an interrupted current entry, citing asd-phase-impl-test.md step 1 - rotated on resume, the interrupted entry loses its rows');
  assert.ok(!canonText('.asd/skills/asd-sprint/SKILL.md').includes('Before every phase-skill delegation below: rotate'), 'TST-2-2: asd-sprint must rotate only when artifact-layout.md "Decisions log" requires it, never before every delegation');

  const listed = (text) => [...text.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
  const moved = listed(testPlan.split('moves the ')[1].split(' rows of')[0]);
  const kept = listed(testPlan.split('keeps the ')[1].split('.')[0]);
  const headings = canonText('.asd/templates/t_test-plan.md').split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3));
  assert.ok(moved.length > 0 && kept.length > 0, 'sanity: the rotation paragraph must still list what moves and what stays');
  for (const name of [...moved, ...kept]) {
    assert.ok(headings.some((heading) => heading.startsWith(name)), `"${name}" must be a t_test-plan.md section, or rotation moves or keeps a table no plan has`);
  }
  for (const needed of ['Entry log', 'Defects']) {
    assert.ok(kept.includes(needed) && !moved.includes(needed), `live test-plan.md must keep "${needed}": impl-test step 1 reads the Entry log and defect-stalemate reads the Defects table from the live file alone, so rotating either away drops prior entries and a real stalemate fails open`);
  }

  for (const [rel, heading] of [
    ['.asd/rules/checkpoints.md', 'Decisions log'],
    ['.asd/skills/asd-sprint/SKILL.md', 'Decisions log'],
    ['.asd/workflows/asd-phase-impl.md', 'Decisions log'],
    ['.asd/workflows/asd-phase-retro.md', 'Decisions log'],
    ['.asd/rules/sprint-lifecycle.md', 'Test plan'],
    ['.asd/workflows/asd-phase-impl-test.md', 'Test plan'],
    ['.asd/workflows/asd-phase-pr.md', 'Test plan'],
    ['.asd/agents/asd-reviewer-testing.md', 'Test plan'],
    ['.asd/agents/asd-tester.md', 'Test plan'],
  ]) {
    assert.ok(canonText(rel).includes(`artifact-layout.md\` "${heading}"`), `${rel} writes or reads across rotated ${heading === 'Test plan' ? 'test-plan' : 'decisions-log'} segments, so it must point at artifact-layout.md "${heading}" - without the pointer it reads the live file alone and misses every rotated entry`);
  }
});

test('sprint-013 AC-3: the defect-stalemate CLI prints {stalemate, digest} and exits 0 on a readable plan, and exits 2 with nothing on stdout when --plan is missing or the Defects table is malformed', () => {
  const root = mkTempDir();
  const { row, plan } = defectPlanFixture();
  const write = (name, text) => {
    const file = path.join(root, name);
    fs.writeFileSync(file, text, 'utf8');
    return file;
  };
  const readable = plan([row('D-1', '1', DEFECT_PARSER), row('D-2', '2', DEFECT_PARSER)]);
  assert.deepStrictEqual(JSON.parse(runtimeCli(['defect-stalemate', '--plan', write('plan.md', readable)])), runtime.defectStalemate(readable), 'the CLI step 9 runs must print what the comparer returns');

  const run = (args) => {
    try {
      return { status: 0, stdout: runtimeCli(['defect-stalemate', ...args], { stdio: 'pipe' }) };
    } catch (error) {
      return { status: error.status, stdout: String(error.stdout) };
    }
  };
  for (const [label, args] of [
    ['missing --plan', []],
    ['no Defects section', ['--plan', write('none.md', '# Test plan\n')]],
    ['row with an extra cell', ['--plan', write('bad.md', plan([`${row('D-1', '1', DEFECT_PARSER)} extra |`]))]],
    ['two Defects sections', ['--plan', write('two.md', `${readable}\n${plan([row('D-3', '3', DEFECT_PARSER)]).split('\n').slice(2).join('\n')}`)]],
  ]) {
    assert.deepStrictEqual(run(args), { status: 2, stdout: '' }, `${label}: step 9 must never read a verdict from a plan the comparer could not parse`);
  }
});

test('sprint-013 AC-19: the 9.0.0 migration rewrites a config built from the 8.0.0 t_config.yaml into the 9.0.0 t_config.yaml byte for byte - LF, or CRLF with a BOM - reports every removed key, and a second run changes nothing', () => {
  const fixture = (name) => fs.readFileSync(path.join(FIXTURES, 'migrations', '9.0.0', name), 'utf8').replace(/\r\n/g, '\n');
  const before = fixture('t_config-8.0.0.yaml');
  const after = fixture('t_config-9.0.0.yaml');
  const removed = readRemovedConfigKeys();
  for (const [label, encode] of [['LF', (text) => text], ['CRLF+BOM', (text) => `﻿${text.replace(/\n/g, '\r\n')}`]]) {
    const first = migrateConfig900(encode(before));
    assert.strictEqual(first.report.status, 'migrated', `${label}: ${first.report.reason}`);
    assert.strictEqual(first.text, encode(after), `${label}: every byte the migration does not own - comments, blank lines, comment columns, line endings, BOM - must survive, and every key it owns must land in the 9.0.0 template shape`);
    assert.deepStrictEqual(removed.filter((key) => !first.report.changes.includes(`${key}: removed`)), [], `${label}: the report must name every removed key the 8.0.0 template carried`);
    const second = first.rerun();
    assert.deepStrictEqual([second.report.status, second.text], ['unchanged', encode(after)], `${label}: /asd-update may run a migration again, so a migrated config must be left alone - a documents group without c4 must not now read as diagram_tool: none`);
  }
});

test('sprint-013 AC-19: the 9.0.0 migration maps c4, skip_design_phases and legacy audit values without losing intent, and leaves a config with no pre-9.0.0 key unchanged', () => {
  const cases = [
    ['c4 enabled keeps the diagram tool', 'documents:\n  prd: enabled\n  c4: enabled\nproject:\n  diagram_tool: mermaid\n', 'documents:\n  prd: enabled\nproject:\n  diagram_tool: mermaid\n'],
    ['c4 enabled without diagram_tool takes the likec4 default', 'documents:\n  prd: enabled\n  c4: enabled\nproject:\n  subsystem_decomposition: enabled\n', 'documents:\n  prd: enabled\nproject:\n  subsystem_decomposition: enabled\n  diagram_tool: likec4\n'],
    ['c4 disabled is none', 'documents:\n  prd: enabled\n  c4: disabled\nproject:\n  diagram_tool: likec4\n', 'documents:\n  prd: enabled\nproject:\n  diagram_tool: none\n'],
    ['c4 absent from a present documents group is disabled', 'documents:\n  prd: enabled\nproject:\n  diagram_tool: mermaid\ngit:\n  base_branch: main\n  gh_enabled: true\n', 'documents:\n  prd: enabled\nproject:\n  diagram_tool: none\ngit:\n  base_branch: main\n'],
    ['an absent documents group is all enabled', 'project:\n  diagram_tool: mermaid\nsystem:\n  os: linux\n  tools:\n    codex_command: ""\n', 'project:\n  diagram_tool: mermaid\nsystem:\n  tools:\n    codex_command: ""\n'],
    ['skip_design_phases enabled disables the design documents and the diagram', 'skip_design_phases: enabled\ndocuments:\n  audit: auto\n  prd: enabled\n  ux_spec: enabled\n  adr: enabled\n  c4: enabled\nproject:\n  diagram_tool: likec4\n', 'documents:\n  audit: auto\n  prd: disabled\n  ux_spec: disabled\n  adr: disabled\nproject:\n  diagram_tool: none\n'],
    ['skip_design_phases enabled with no documents group creates it', 'skip_design_phases: enabled\nproject:\n  subsystem_decomposition: enabled\n', 'project:\n  subsystem_decomposition: enabled\n  diagram_tool: none\n\ndocuments:\n  audit: always\n  prd: disabled\n  ux_spec: disabled\n  adr: disabled\n'],
    ['skip_design_phases disabled only goes', 'skip_design_phases: disabled\ndocuments:\n  prd: enabled\n  c4: enabled\nproject:\n  diagram_tool: likec4\n', 'documents:\n  prd: enabled\nproject:\n  diagram_tool: likec4\n'],
    ['legacy audit enabled is always', 'documents:\n  audit: enabled\n  prd: enabled\n', 'documents:\n  audit: always\n  prd: enabled\n'],
    ['legacy audit disabled is off, its inline comment kept on its column', 'documents:\n  audit: disabled # mine\n  prd: enabled\n', 'documents:\n  audit: off      # mine\n  prd: enabled\n'],
    ['no pre-9.0.0 key', 'documents:\n  audit: auto\n  prd: enabled\nproject:\n  diagram_tool: likec4\n', 'documents:\n  audit: auto\n  prd: enabled\nproject:\n  diagram_tool: likec4\n'],
  ];
  const observed = cases.map(([label, input]) => {
    const first = migrateConfig900(input);
    const second = first.rerun();
    return [label, first.report.status, first.text, second.report.status];
  });
  assert.deepStrictEqual(observed, cases.map(([label, input, expected]) => [label, expected === input ? 'unchanged' : 'migrated', expected, 'unchanged']), 'each AC-19 mapping and audit.md "Migration gaps" boundary, with a second run leaving the result alone');
  assert.deepStrictEqual(migrateConfig900(undefined).report, { status: 'absent', changes: [], reason: null }, 'a project without config.yaml has nothing to migrate');
});

test('sprint-013 AC-19: the 9.0.0 migration leaves a config it cannot read line by line byte-identical and says how to re-run it', () => {
  const rerunCommand = 'node -e "require(\'./.asd/migrations/9.0.0.js\')({ repoRoot: process.cwd() })"';
  for (const [label, input] of [
    ['flow map', 'documents: { c4: enabled }\n'],
    ['duplicate key', 'documents:\n  c4: enabled\n  c4: disabled\n'],
    ['mixed line endings', 'documents:\r\n  prd: enabled\n  c4: enabled\r\n'],
    ['value outside the enumeration', 'documents:\n  c4: maybe\n'],
    ['tab indent', 'documents:\n\tc4: enabled\n'],
  ]) {
    const { report, text, output } = migrateConfig900(input);
    assert.strictEqual(report.status, 'skipped', `${label}: a shape the line-based rewrite does not understand must be skipped, not guessed`);
    assert.strictEqual(text, input, `${label}: a skipped config must stay byte-identical`);
    assert.ok(report.reason && output.includes('left untouched') && output.includes(rerunCommand), `${label}: the warning must say the file was left untouched and name the re-run command - got ${JSON.stringify(output)}`);
  }
});

test('sprint-015 AC-2/AC-3: the impl-review Testing reviewer receives only the isTest scope files plus the --test-plan paths, every other reviewer the whole scope, and review-policy.md "Reviewer responsibility" gives each of the five reviewers both phases', () => {
  assert.deepStrictEqual(runtime.INTERNAL_REVIEWERS.slice().sort(), internalReviewers().sort(), 'INTERNAL_REVIEWERS drives the per-reviewer manifests and the surface-check dispatch count, so it must name exactly the asd-reviewer-* agents');
  const testFiles = ['tests/run.js', 'test/a.js', 'src/__tests__/a.js', 'spec/a.rb', 'pkg/specs/a.rb', 'src/a.test.ts', 'src/a.spec.js', 'src/test_a.py', 'src/a_test.go', 'src/ATest.java', 'src/ATests.cs', 'Assets/Tests/EditMode/Fixture.cs'];
  const plan = ['.asd/sprints/015-x/test-plan.md', '.asd/sprints/015-x/test-plan.entry-01.md'];
  const otherFiles = ['src/contest.js', 'src/latest/a.js', 'src/testing.js', 'docs/protests.md', 'README.md', ...plan];
  assert.deepStrictEqual(testFiles.filter((file) => !runtime.isTest(file)), [], 'each path-segment and basename convention the plan names must classify as a test file, or Testing never receives it');
  assert.deepStrictEqual(otherFiles.filter(runtime.isTest), [], 'a name merely containing "test" is not a test file - misclassified, Testing reviews code it does not own; test-plan.md reaches Testing only through --test-plan');
  const scope = [...otherFiles.slice(0, -plan.length), ...testFiles];
  assert.deepStrictEqual(runtime.reviewerFiles('impl-review', 'testing', scope, plan), [...testFiles, ...plan], 'impl-review Testing receives the scope test files in scope order, then the --test-plan paths the scope pathspec excludes');
  for (const phase of ['design-review', 'impl-review']) {
    for (const reviewer of runtime.INTERNAL_REVIEWERS.filter((name) => name !== 'testing')) {
      assert.deepStrictEqual(runtime.reviewerFiles(phase, reviewer, scope, plan), scope, `${phase} ${reviewer}: every reviewer but impl-review Testing receives the whole scope, never the test-plan paths`);
    }
  }

  const table = sectionOf('.asd/rules/review-policy.md', 'Reviewer responsibility').split('\n').filter((line) => line.startsWith('|')).map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));
  assert.ok(table.length > 2 && /design-review/.test(table[0][1]) && /impl-review/.test(table[0][2]), 'the responsibility table must keep one design-review and one impl-review column');
  const rows = table.slice(2);
  const expected = [...internalReviewers(), 'external-review'].map((slug) => slug.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' '));
  assert.deepStrictEqual(rows.map((row) => row[0]).sort(), expected.sort(), 'AC-3: one row per reviewer agent - a reviewer without a row has no owner map, a row without an agent owns concerns nobody reviews');
  assert.deepStrictEqual(rows.filter((row) => row.length !== 3 || !row[1] || !row[2]).map((row) => row[0]), [], 'AC-3: every reviewer row must state both phases, an unowned phase included');
  const testing = rows.find((row) => row[0] === 'Testing');
  assert.ok(testing[2].includes('`isTest`') && testing[2].includes('`--test-plan`'), 'AC-2: the Testing impl-review cell must name the runtime classifier and the flag reviewerFiles narrows by');

  for (const reviewer of internalReviewers()) {
    const inputs = sectionOf(`.asd/agents/asd-reviewer-${reviewer}.md`, 'Inputs');
    assert.ok(inputs.includes('`.diff`') && !/\bgit (diff|log|show)\b|diff payload/.test(inputs), `AC-4: asd-reviewer-${reviewer} has no shell, so its Inputs must read the manifest's .diff and never a git command or a diff payload`);
  }
  const source = canonText('.asd/runtime.js');
  for (const rel of ['.asd/workflows/asd-phase-impl-review.md', '.asd/workflows/asd-phase-design-review.md']) {
    const line = canonText(rel).split('\n').find((candidate) => candidate.includes('node .asd/runtime.js emit-manifest'));
    const flags = [...line.matchAll(/ --([a-z-]+)/g)].map((match) => match[1]);
    assert.deepStrictEqual(flags.filter((flag) => !source.includes(`flags['${flag}']`) && !source.includes(`flags.${flag} `) && !source.includes(`flags.${flag})`) && !source.includes(`flags.${flag},`)), [], `${rel}: every emit-manifest flag the workflow passes must be one the CLI reads - an unread --test-plan or --base drops Testing's plan or every .diff without an error`);
  }
});

test('sprint-015 AC-4/AC-5: emit-manifest --base/--head writes each manifest\'s .diff over its own files, grants the pure-rename n/a only to a rename git reports with identical content and mode, validate-ledger accepts that row nowhere else, and the range is refused outside impl-review', () => {
  const repo = mkTempDir();
  const emptyGlobalConfig = path.join(mkTempDir(), 'gitconfig');
  fs.writeFileSync(emptyGlobalConfig, '', 'utf8');
  const env = { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: emptyGlobalConfig };
  const git = (...args) => execFileSync('git', ['-c', 'user.name=asd-test', '-c', 'user.email=asd-test@example.invalid', '-c', 'commit.gpgsign=false', '-c', 'core.autocrlf=false', ...args], { cwd: repo, env, encoding: 'utf8' });
  const body = (tag) => Array.from({ length: 20 }, (_, index) => `${tag} line ${index + 1}`).join('\n') + '\n';
  git('init', '-q');
  for (const name of ['pure', 'edited', 'chmod', 'kept']) writeFile(repo, `src/${name}.js`, body(name));
  writeFile(repo, 'tests/kept.test.js', body('test'));
  git('add', '-A');
  git('commit', '-q', '-m', 'base');
  const base = git('rev-parse', 'HEAD').trim();
  fs.mkdirSync(path.join(repo, 'lib'));
  for (const name of ['pure', 'edited', 'chmod']) git('mv', `src/${name}.js`, `lib/${name}.js`);
  writeFile(repo, 'lib/edited.js', body('edited').replace('line 1\n', 'line one\n'));
  writeFile(repo, 'src/kept.js', `${body('kept')}appended\n`);
  writeFile(repo, 'tests/kept.test.js', `${body('test')}appended\n`);
  git('add', '-A');
  git('update-index', '--chmod=+x', 'lib/chmod.js');
  git('commit', '-q', '-m', 'head');
  const head = git('rev-parse', 'HEAD').trim();
  const range = ['--base', base, '--head', head];

  const work = mkTempDir();
  const list = (name, files) => {
    const file = path.join(work, name);
    fs.writeFileSync(file, `${files.join('\n')}\n`, 'utf8');
    return file;
  };
  const scope = git('diff', '--name-only', '-M', `${base}...${head}`).trim().split('\n');
  assert.deepStrictEqual(scope.slice().sort(), ['lib/chmod.js', 'lib/edited.js', 'lib/pure.js', 'src/kept.js', 'tests/kept.test.js'], 'sanity: the scope is the renamed destinations plus the edits');
  const emit = (reviewer, files, extra, phase = 'impl-review') => {
    const out = fs.mkdtempSync(path.join(work, `${reviewer}-`));
    return JSON.parse(runtimeCli(['emit-manifest', '--reviewer', reviewer, '--phase', phase, '--files', list(`${path.basename(out)}.txt`, files), '--out', out, ...extra], { cwd: repo, env, stdio: 'pipe' }));
  };
  const read = (entry) => JSON.parse(fs.readFileSync(entry.manifest, 'utf8'));
  const headers = (entry) => Object.fromEntries([...fs.readFileSync(entry.diff, 'utf8').matchAll(/^diff --git a\/(\S+) b\/(\S+)$/gm)].map((match) => [match[2], match[1]]));
  const pure = { 'lib/pure.js': [runtime.NA_PREDICATES.pureRename] };

  const [whole] = emit('correctness', scope, range);
  const manifest = read(whole);
  assert.deepStrictEqual(manifest.n_a.files, pure, 'AC-5: only the identical-content, identical-mode rename is behaviour-neutral by proof - an edited rename, a mode-changing rename and a plain edit keep their full review');
  assert.deepStrictEqual(headers(whole), { 'lib/chmod.js': 'src/chmod.js', 'lib/edited.js': 'src/edited.js', 'lib/pure.js': 'src/pure.js', 'src/kept.js': 'src/kept.js', 'tests/kept.test.js': 'tests/kept.test.js' }, 'AC-4: the patch covers every listed file, each rename paired with its source so the reviewer sees a rename, not an add');

  const [testing] = emit('testing', scope, ['--test-plan', '.asd/sprints/015-x/test-plan.md', ...range]);
  assert.deepStrictEqual(read(testing).files, ['tests/kept.test.js', '.asd/sprints/015-x/test-plan.md'], 'AC-2: the CLI builds Testing\'s list through reviewerFiles, test-plan path appended');
  assert.deepStrictEqual(Object.keys(headers(testing)), ['tests/kept.test.js'], 'AC-4: a manifest\'s patch covers only its own files the range changed - the appended test-plan path is not in the range');
  const [empty] = emit('testing', ['src/kept.js'], range);
  assert.deepStrictEqual([read(empty).files, fs.readFileSync(empty.diff, 'utf8')], [[], ''], 'an empty list still gets its .diff, empty, so the payload path always resolves');

  const parts = emit('correctness', scope, ['--halve', ...range]);
  assert.strictEqual(parts.length, 2, 'sanity: --halve splits the scope in two');
  for (const part of parts) {
    const files = read(part).files;
    assert.deepStrictEqual(Object.keys(headers(part)).sort(), files.slice().sort(), `${path.basename(part.diff)}: each part's patch covers exactly its own files`);
    assert.deepStrictEqual(read(part).n_a.files, files.includes('lib/pure.js') ? pure : {}, `${path.basename(part.manifest)}: the pure-rename grant travels with the part holding the file`);
  }

  const vocabulary = runtime.LEDGER_VOCABULARY;
  const ledger = (naFile) => ({
    manifest_digest: manifest.digest, findings: [],
    files: manifest.files.map((i) => (i === naFile ? { i, s: vocabulary.p, p: runtime.NA_PREDICATES.pureRename } : { i, s: vocabulary.files[0] })),
    rules: manifest.rules.map((i) => (manifest.n_a.rules[i] ? { i, s: vocabulary.p, p: manifest.n_a.rules[i][0] } : { i, s: vocabulary.rules[0] })),
    sections: manifest.sections.map((i) => ({ i, s: vocabulary.sections[0] })),
  });
  assert.deepStrictEqual(runtime.validateCoverageLedger(manifest, ledger('lib/pure.js'), []), { ok: true }, 'AC-5: the compact row validates on the file the runtime proved');
  for (const file of scope.filter((name) => name !== 'lib/pure.js')) {
    assert.throws(() => runtime.validateCoverageLedger(manifest, ledger(file), []), /predicate/, `AC-5: ${file}: a reviewer asserting the pure-rename row on a file the runtime did not prove is an unauthorized n/a`);
  }

  const out = mkTempDir();
  let refused = null;
  try {
    runtimeCli(['emit-manifest', '--reviewer', 'correctness', '--phase', 'design-review', '--files', list('design.txt', scope), '--out', out, ...range], { cwd: repo, env, stdio: 'pipe' });
  } catch (error) {
    refused = { status: error.status, stderr: String(error.stderr).trim() };
  }
  assert.ok(refused && refused.status === 2 && /impl-review only/.test(refused.stderr) && fs.readdirSync(out).length === 0, `design-review has no git range, so --base/--head must exit 2 before writing anything. Got: ${JSON.stringify(refused)}`);
});

test('sprint-015 AC-11: surface-check dispatches bounds the impl-review dispatches its bound implies - every internal reviewer\'s emitted parts, Testing\'s --test-plan path included, plus External Review - and the override request quotes that field', () => {
  const planPath = '.asd/sprints/015-x/test-plan.md';
  let tight = 0;
  for (const bound of [1, runtime.SPLIT_THRESHOLD_FILES - 1, runtime.SPLIT_THRESHOLD_FILES, runtime.SPLIT_THRESHOLD_FILES + 1, runtime.SURFACE_CAP_FILES]) {
    const scope = Array.from({ length: bound }, (_, index) => `tests/file-${index + 1}.test.js`);
    const parts = runtime.INTERNAL_REVIEWERS.reduce((sum, reviewer) => sum + runtime.emitCoverageManifests({ reviewer, phase: 'impl-review', rubric: readRepoFile(`.asd/agents/asd-reviewer-${reviewer}.md`), files: runtime.reviewerFiles('impl-review', reviewer, scope, [planPath]), customRules: {} }).length, 0);
    const { dispatches } = runtime.surfaceCheck(scope, bound);
    assert.ok(parts + 1 <= dispatches, `bound ${bound}: a scope of ${bound} test files emits ${parts} internal-review parts plus External Review, above the ${dispatches} dispatches the cap-override request tells the user to approve`);
    if (parts + 1 === dispatches) tight += 1;
  }
  assert.ok(tight > 0, 'the bound must be reached somewhere, or any over-count passes');
  const declaration = sectionOf('.asd/rules/sprint-lifecycle.md', 'Plan file format').split('\n').find((line) => line.startsWith('**Change surface declaration**'));
  const field = declaration && /the `(\w+)` count `surface-check --bound <n>` returns/.exec(declaration);
  assert.ok(field && field[1] in runtime.surfaceCheck([]), 'the cap-override request "Plan file format" defines must quote a field surface-check returns, or the request states a count nobody computes');
});

test('sprint-015 AC-1/AC-6/AC-7/AC-8/AC-10/AC-12: no canon tells anyone to clear context, compaction keeps its preserve list, free-form input never goes through a decision prompt, BA/UX renames route to the orchestrator, the per-sprint document skip is hard, scope asks the cleanup criteria, and the changelog heads the released version', () => {
  const clear = /\bclear(?:s|ed|ing)?\b(?: the)? (?:session|context|transcript)|clear over compaction|then clear|clearable|\/clear\b/i;
  assert.deepStrictEqual([...canonMarkdownFiles(), 'README.md', 'AGENTS.md'].filter((rel) => clear.test(canonText(rel))), [], 'AC-1: context compaction is automatic and host-driven - no canon or README line may tell anyone to clear the session');
  const hygiene = sectionOf('.asd/rules/core.md', 'Context hygiene');
  const preserve = hygiene.split(/\n\d\. /).find((item) => /compaction summary MUST preserve/.test(item));
  assert.ok(preserve && ['sprint id', 'phase and mode', '`QUESTION`', '`BLOCKED_MANUAL`', '`ADVICE_NEEDED`', 'gate answer', 'paths written', 'task/finding/defect ids'].every((item) => preserve.includes(item)), 'AC-1: the compaction summary keeps its preserve list');
  assert.ok(/gate answer[^.]*`decisions-log\.md`\/`state\.json` before any further work/.test(hygiene) && hygiene.includes('"State recovery"'), 'AC-1: the gate answer is written to disk before any further work, and a lost session recovers from state.json');

  const freeForm = sectionOf('.asd/rules/core.md', 'Request user decision');
  assert.ok(freeForm.split(/(?<=[.;])\s/).some((clause) => /free-form/i.test(clause) && /\bnever\b/.test(clause)), 'AC-7: "Request user decision" must never be used for free-form input');
  assert.ok(canonText('.asd/skills/asd-sprint/SKILL.md').split('\n').some((line) => /^\d\. Collect scope as a plain chat message/.test(line)) && canonText('.asd/workflows/asd-phase-scope.md').split('\n').some((line) => line.startsWith('1. ') && line.includes('plain chat message')), 'AC-7: asd-sprint and the scope workflow collect raw scope as a plain chat message');

  const promote = stepOf(canonText('.asd/workflows/asd-phase-design-promote.md'), 4);
  assert.ok(/\borchestrator\b[^.]*`git mv`[^.]*`git rm`/.test(promote), 'AC-6: design-promote routes a BA/UX doc rename or deletion to the main orchestrator');
  for (const name of ['asd-ba', 'asd-ux']) {
    const claude = JSON.parse(canonText(`.asd/agents/${name}.md`).split('---\n')[1]).claude;
    assert.ok(claude.disallowedTools.includes('Bash') && !claude.tools.includes('Bash'), `AC-6: ${name} stays shell-less - its git operations route through the orchestrator instead`);
  }

  const checkpoints = canonText('.asd/rules/checkpoints.md').split('\n');
  const skipGate = 'per-sprint document skip';
  assert.ok(checkpoints.some((line) => line.startsWith('Hard in both modes:') && line.includes(skipGate)) && checkpoints.some((line) => line.startsWith(`| ${skipGate} `) && line.includes('| hard')), 'AC-8: the per-sprint document skip is hard in both modes and in the inventory - otherwise an adaptive orchestrator skips a document on its own');
  const skip = sectionOf('.asd/rules/sprint-lifecycle.md', 'Optional documents').split('\n').find((line) => line.startsWith('**Per-sprint skip**'));
  const logLine = skip && /"<doc> (skipped this sprint by user)"/.exec(skip);
  assert.ok(skip && /Record: the frozen `false` plus/.test(skip), 'AC-8: the skip records the frozen `false` later phases read - the log line alone leaves the document produced');
  assert.ok(logLine && /`config\.yaml` is untouched/.test(skip) && canonText('.asd/workflows/asd-phase-scope.md').includes(logLine[1]), 'AC-8: the skip records a decisions-log line the scope workflow writes verbatim and never touches config.yaml');

  assert.ok(['legacy removal', 'warning budget', 'doc consolidation'].every((item) => stepOf(canonText('.asd/workflows/asd-phase-scope.md'), 2).includes(item)), 'AC-10: before the scope gate the scope workflow asks for the cleanup and quality criteria');

  const released = /^## v(\S+)$/m.exec(canonText('CHANGELOG.md'));
  assert.strictEqual(released && released[1], loadManifest().asd_version, 'AC-12: the newest CHANGELOG heading is the asd_version release-manifest.json ships');
});

// ===========================================================================
// Runner
// ===========================================================================

// Test bodies may be sync or async (`update.applyPlan`/migration-runner tests
// need to `await` real async production functions) - `await`ing a plain
// (non-Promise) return value is a no-op, so this loop stays correct for
// every existing sync test body too, zero behavior change for them.
async function runAll() {
  let failures = 0;
  for (const t of tests) {
    try {
      await t.fn();
      console.log(`ok - ${t.name}`);
    } catch (err) {
      failures++;
      console.error(`FAIL - ${t.name}`);
      console.error('   ' + (err && err.stack ? err.stack.split('\n').join('\n   ') : String(err)));
    }
  }

  console.log(`\n${tests.length - failures}/${tests.length} passed`);
  process.exitCode = failures > 0 ? 1 : 0;
}

runAll();
