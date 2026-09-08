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
  const dirtyPath = path.join(FIXTURES, 'canon/agents/demo-agent.crlf-bom.md');

  const dirtyRaw = fs.readFileSync(dirtyPath, 'utf8');
  assert.ok(dirtyRaw.charCodeAt(0) === 0xfeff, 'fixture sanity: input must actually carry a BOM');
  assert.ok(dirtyRaw.includes('\r\n'), 'fixture sanity: input must actually carry CRLF');

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

test('SessionStart hook: an availability-skip "APPROVE (skipped: <reason>)" value counts as satisfied - verdict map reads "green"', () => {
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
            correctness: 'APPROVE',
            external: 'APPROVE (skipped: codex quota exhausted)',
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
  assert.ok(text.includes('Last review verdict: green'), `an availability-skip "APPROVE (skipped: ...)" value must count as satisfied, got: ${text}`);
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

test('runtime.js CLI: manifest-digest digests a manifest exactly as written, and --write stamps the vocabulary into the file before digesting it', () => {
  const root = mkTempDir();
  const manifest = buildManifest(['f-1'], ['r-1'], ['s-1']);
  const manifestPath = path.join(root, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest), 'utf8');

  const out = runtimeCli(['manifest-digest', '--manifest', manifestPath]).trim();
  assert.strictEqual(out, runtime.coverageManifestDigest(manifest), 'the CLI must print exactly what the exported digester computes - a workflow stamps through the CLI while the validator checks through the library, so the two must never disagree');
  assert.strictEqual(out, runtime.fingerprint(manifest), 'a manifest carrying no `vocabulary` must digest to the plain stable hash of its own content: the pre-vocabulary identity, expressed here through the untouched `fingerprint` primitive so the expectation cannot drift with the function under test. Digesting an implied field instead would move the identity of every manifest stamped before that field existed (correctness F-2)');
  assert.strictEqual(fs.readFileSync(manifestPath, 'utf8'), JSON.stringify(manifest), '--write not passed: file on disk must be untouched');

  const writeOut = runtimeCli(['manifest-digest', '--manifest', manifestPath, '--write']).trim();
  const firstWrite = fs.readFileSync(manifestPath, 'utf8');
  const written = JSON.parse(firstWrite);
  assert.deepStrictEqual(written.vocabulary, runtime.LEDGER_VOCABULARY, '--write must publish the validator\'s own vocabulary constant, so the reviewer reads the statuses off its own input instead of recalling rule prose');
  assert.strictEqual(written.digest, writeOut, '--write must persist exactly the digest it printed, or the workflow that captures stdout stamps one identity while the file carries another');
  assert.strictEqual(written.digest, runtime.fingerprint(Object.assign({}, manifest, { vocabulary: runtime.LEDGER_VOCABULARY })), 'the persisted digest must be the hash of the stamped manifest with `vocabulary` in it: stamping is a real content change and moves the identity by design. What must NOT happen is the reverse - a digester implying the field over a file that lacks it');
  assert.strictEqual(written.digest, runtime.coverageManifestDigest(written), 'round-trip: validateCoverageLedger recomputes the digest from the manifest it reads off disk, so a stamped file whose digest is not its own digest is unvalidatable the moment it is written');
  runtimeCli(['manifest-digest', '--manifest', manifestPath, '--write']);
  assert.strictEqual(fs.readFileSync(manifestPath, 'utf8'), firstWrite, 'a second --write must be byte-idempotent - stamping is how a workflow refreshes a manifest, and a moving file would churn the digest on every refresh');
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

test('AC-1/6: a reviewer split partitions the manifest files list into two disjoint halves that each validate independently against its own complete manifest; two partial ledgers against one unpartitioned manifest are rejected', () => {
  const allFiles = ['f-1', 'f-2', 'f-3', 'f-4'];
  const rules = ['r-1'];
  const sections = ['s-1'];
  const whole = buildManifest(allFiles, rules, sections);
  whole.digest = runtime.coverageManifestDigest(whole);

  const half1Files = ['f-1', 'f-2'];
  const half2Files = ['f-3', 'f-4'];
  const half1 = buildManifest(half1Files, rules, sections);
  half1.digest = runtime.coverageManifestDigest(half1);
  const half2 = buildManifest(half2Files, rules, sections);
  half2.digest = runtime.coverageManifestDigest(half2);

  const ledgerFor = (manifest, files) => ({
    manifest_digest: manifest.digest,
    findings: [],
    files: files.map((i) => ({ i, s: 'checked' })),
    rules: rules.map((i) => ({ i, s: 'pass' })),
    sections: sections.map((i) => ({ i, s: 'reviewed' })),
  });

  assert.deepStrictEqual(runtime.validateCoverageLedger(half1, ledgerFor(half1, half1Files), []), { ok: true }, 'half 1 must validate unchanged against its own complete manifest');
  assert.deepStrictEqual(runtime.validateCoverageLedger(half2, ledgerFor(half2, half2Files), []), { ok: true }, 'half 2 must validate unchanged against its own complete manifest');

  assert.throws(
    () => runtime.validateCoverageLedger(whole, ledgerFor(whole, half1Files), []),
    /files rows incomplete/,
    'a partial ledger covering only half the files must never validate against the unpartitioned manifest - that is the mechanism the split rule explicitly forbids'
  );
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

test('AC-6: the interrupted-dispatch re-dispatch record is stated in review-policy.md and cited (not restated) by both *-review workflows', () => {
  const policy = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/review-policy.md'), 'utf8');
  assert.ok(policy.includes('is re-dispatched fresh in the same iteration'), 'review-policy.md must state the re-dispatch outcome for an interrupted reviewer - never a skip, never an APPROVE');
  assert.ok(policy.includes('Interrupted attempts: <count> (<cause>)'), 'review-policy.md must state the durable per-file record an interrupted dispatch leaves on the written review file');

  const citation = 'sole SSoT for trigger, partition, union property, merge rule and durable record';
  const reDispatchPhrase = 'takes the same reject-and-re-dispatch-fresh path as a failed validation above';
  for (const file of ['asd-phase-design-review.md', 'asd-phase-impl-review.md']) {
    const workflow = fs.readFileSync(path.join(REPO_ROOT, `.asd/workflows/${file}`), 'utf8');
    assert.ok(workflow.includes(citation), `${file} must cite review-policy.md as sole SSoT for the interrupted/split-dispatch contract, including the durable record, rather than restating it`);
    assert.ok(workflow.includes(reDispatchPhrase), `${file} must route an interrupted dispatch (no verdict token, no ledger) through the same reject-and-re-dispatch-fresh handling as a failed ledger validation - a future edit dropping this from one workflow while review-policy.md still claims it must fail here`);
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

test('T-2/T-4: in each agent-memory directory this sprint writes, MEMORY.md and the files beside it are a bijection - an index line landing without its target, and a memory file no index points at, both fail here', () => {
  for (const agent of ['asd-dev-critical', 'asd-tester-critical']) {
    const dir = path.join(REPO_ROOT, '.claude/agent-memory', agent);
    const index = fs.readFileSync(path.join(dir, 'MEMORY.md'), 'utf8');
    const links = [...index.matchAll(/\]\(([^)]+\.md)\)/g)].map((m) => m[1]);
    assert.ok(links.length > 0, `${agent}/MEMORY.md must list at least one memory file`);
    for (const link of links) {
      assert.ok(fs.existsSync(path.join(dir, link)), `${agent}/MEMORY.md links to "${link}" which does not exist`);
    }
    for (const memory of fs.readdirSync(dir).filter((name) => name.endsWith('.md') && name !== 'MEMORY.md')) {
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
  const { meta: externalMeta } = sync.parseCanonicalFrontmatter(externalRaw);
  assert.ok(externalMeta.claude.tools.includes('Bash'), 'the agent providers.md names as the carve-out must actually carry the Bash grant the prose claims');

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

test('AC-5: validate-ledger tolerates a manifest predating the vocabulary field and rejects a divergent one even when its digest was recomputed', () => {
  const ledgerFor = (manifest) => ({
    manifest_digest: manifest.digest, findings: [],
    files: [{ i: 'f-1', s: 'checked' }], rules: [{ i: 'r-1', s: 'pass' }], sections: [{ i: 's-1', s: 'reviewed' }],
  });

  const preVocabularyDigest = (manifest) => {
    const copy = Object.assign({}, manifest);
    delete copy.digest;
    return runtime.fingerprint(copy);
  };

  const legacy = buildManifest(['f-1'], ['r-1'], ['s-1']);
  assert.strictEqual(legacy.vocabulary, undefined, 'sanity: the backward-tolerance fixture must genuinely lack the field');
  legacy.digest = preVocabularyDigest(legacy);
  assert.deepStrictEqual(runtime.validateCoverageLedger(legacy, ledgerFor(legacy), []), { ok: true }, 'every manifest written before this sprint lacks `vocabulary` AND carries a digest stamped the pre-vocabulary way - reproduced here from the untouched `fingerprint` primitive, so the fixture stays a legacy artefact instead of silently tracking whatever the digester does today. Requiring the field, or digesting an implied one, invalidates them all (correctness F-2)');

  const published = buildManifest(['f-1'], ['r-1'], ['s-1']);
  published.vocabulary = structuredClone(runtime.LEDGER_VOCABULARY);
  published.digest = runtime.coverageManifestDigest(published);
  assert.deepStrictEqual(runtime.validateCoverageLedger(published, ledgerFor(published), []), { ok: true }, 'a manifest publishing the vocabulary must validate against a ledger written in that vocabulary');

  const divergent = buildManifest(['f-1'], ['r-1'], ['s-1']);
  divergent.vocabulary = structuredClone(runtime.LEDGER_VOCABULARY);
  divergent.vocabulary.files = [...divergent.vocabulary.files, 'provisionally-checked'];
  divergent.digest = runtime.coverageManifestDigest(divergent);
  assert.throws(() => runtime.validateCoverageLedger(divergent, ledgerFor(divergent), []), /vocabulary/, 'a hand-edited manifest advertising statuses the validator will not accept must be rejected outright - recomputing its digest makes it self-consistent, so the digest check alone never catches it');
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
});

test('AC-13b: git-strategy.md "Commit before review" names the reviewer agent-memory it commits, and both *-review workflows name that commit at the step that writes the review file', () => {
  const bookkeeping = readRepoFile('.asd/rules/git-strategy.md').split('\n').find((line) => line.includes('The main orchestrator commits its own bookkeeping'));
  assert.ok(bookkeeping, 'git-strategy.md must still enumerate the bookkeeping the orchestrator commits - it is the sole home of commit ownership');
  assert.ok(/agent-memory writes/.test(bookkeeping), 'AC-13b: the memory class must be named in the list the committer reads. Stated only where the reviewer reads it, the write never reaches a commit and the change-surface rule never sees it - the exact one-sided obligation this sprint exists to close');
  assert.ok(bookkeeping.includes('a reviewer holds no commit tool'), 'the reason the orchestrator commits a file it did not author must stand beside the obligation: the same sentence otherwise obliges every dispatched agent to commit its own paths, which a read-only reviewer cannot do');
  assert.ok(bookkeeping.includes('`review-policy.md` "Change-surface rule"'), 'the entry must cite the rule that puts agent memory in the surface, or it reads as an arbitrary extra file and gets dropped by the next editor');

  assert.ok(readRepoFile('.asd/rules/review-policy.md').includes('`git-strategy.md` "Commit before review", which owns that bookkeeping'), 'review-policy.md states the obligation but must hand the bookkeeping to its owner rather than keeping a second copy of it');

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
  for (const [phase, rel] of [['design', '.asd/workflows/asd-phase-design-review.md'], ['impl', '.asd/workflows/asd-phase-impl-review.md']]) {
    const reviewFlow = readRepoFile(rel);
    const lateLine = reviewFlow.split('\n').find((line) => line.includes('per `review-policy.md` "Late duplicate return" (sole SSoT'));
    assert.ok(lateLine, `${rel} must bind the branch at the step that records verdicts and cite the rule as its sole home: review-policy.md names the phase workflow, never the returning agent, as the actor, so a workflow that never mentions it is an obligation with no acting site`);
    assert.ok(lateLine.includes('External Review included'), `${rel}: the acting bullet must restate review-policy.md's reach carve-out on its own line, because the step that encloses it scopes itself "internal reviewers only" - a bullet silent on reach inherits that header and discards precisely the late External Review the branch exists to admit (iteration 3 finding). Line-scoped on purpose: the citation and the reach must be the same sentence, or a carve-out parked elsewhere in the file satisfies the check while the acting site stays narrow`);
    const artefacts = reviewFlow.split('## Artefacts produced')[1];
    assert.ok(artefacts && artefacts.includes(`<sprint>/reviews/${phase}/iter-NN/<reviewer>.late.md`), `${rel} must name the late-return file in its Artefacts produced list - that list is what the orchestrator writes from, and an artefact a rule mandates but no workflow declares is one nobody ever produces`);
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
});

test('AC-8: external-review.md "Outcome contract" is the sole home of what a dispatched External Review may return, review-policy.md hands the whole question to it, and the agent forbids both the background run and the empty return', () => {
  const external = readRepoFile('.asd/rules/external-review.md');
  assert.ok(external.includes('## Outcome contract'), 'external-review.md must carry the outcome contract as its own named section, since review-policy.md and the agent both cite it by name');
  assert.ok(/awaits the wrapped CLI inside its own dispatch and never backgrounds it/.test(external), 'F-8 was a dispatch that returned while its CLI was still running - the await obligation is the fix');
  assert.ok(external.includes('is not permitted and is not a verdict'), 'an empty return must be named as neither of the two outcomes, or it stays an undefined third state');
  assert.ok(external.includes('"Interrupted dispatch"'), 'the contract must name where a non-outcome is disposed, rather than leaving the boundary with review-policy.md a hole');
  assert.ok(external.includes('a precondition missing before any invocation (prompt template absent) aborts the dispatch instead'), 'the two-outcome contract is scoped to a dispatch that reached the invocation; drop this carve-out and a missing prompt template returns an availability skip, which passes a review gate on an artefact that was never reviewed - the F-8 class itself');

  const policy = readRepoFile('.asd/rules/review-policy.md');
  assert.ok(!policy.includes("External Review's unavailability path is"), 'the old scoping line handed off only the unavailability path, which is what left an empty return undisposed on both sides');
  assert.ok(policy.includes('`external-review.md` "Outcome contract"'), 'review-policy.md must point at the outcome contract as a whole');

  const agent = sync.readNormalized(path.join(REPO_ROOT, '.asd/agents/asd-external-review.md'));
  assert.ok(agent.includes('Never background or detach the `{{wraps_cli}}` run'), 'the never-background Don\'t must be stated on the placeholder token both views render');
  assert.ok(agent.includes('Never return anything but the two permitted outcomes'), 'the agent must carry the outcome contract as a Don\'t, not only the rule doc it may not read');
  assert.ok(agent.includes('APPROVE (skipped: external review unavailable: <specific status>)'), 'the skip the agent is told to return must be the literal shape external-review.md defines, or a skip parses as prose');
  const abortSignal = agent.split('\n').find((line) => line.includes('ABORT — precondition not met: <artefact>'));
  assert.ok(abortSignal && abortSignal.includes('only before any `{{wraps_cli}}` invocation'), 'the acting half of the rule\'s carve-out: the agent\'s ABORT must be scoped to the pre-invocation window, or the agent emits a third outcome the two-outcome contract forbids');
  assert.ok(abortSignal && abortSignal.includes('once an invocation has started, every failure of it returns the availability skip instead (`external-review.md` "Outcome contract")'), 'the post-invocation half must stay on the signal line AND cite the contract as its home, so the boundary is stated where the agent reads it and is not a second copy that can drift from external-review.md');
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
    assert.fail(`this assertion is the suite's only call to the \`git\` binary and additionally needs a git work tree at ${REPO_ROOT}: the index line ending is the property under test and nothing in the worktree can show it. Run from a clone with git on PATH, or this criterion is unverifiable here. Underlying: ${error.message}`);
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
