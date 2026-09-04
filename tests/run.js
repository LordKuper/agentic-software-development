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
  assert.ok(claudeAgent.includes('codex exec --sandbox read-only -'), 'Claude-side must invoke the wrapped Codex CLI with an explicit --sandbox read-only, not rely on ambient project config');
  assert.ok(codexAgent.includes('--allowedTools "Read,Grep,Glob"'), 'Codex-side must invoke the wrapped Claude CLI with explicit read-only tool restriction, not rely on ambient project permissions');
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
  fs.writeFileSync(path.join(root, '.asd', 'agents', name + '.md'), canonText, 'utf8');
}

const GOOD_AGENT_CANON = fs.readFileSync(path.join(FIXTURES, 'canon/agents/demo-agent.md'), 'utf8');

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

test('buildSyncPlan: WITHOUT .asd/project/config.yaml (the framework repo itself), AGENTS.md stays self-sourced', () => {
  const root = makeMiniRepo(); // no .asd/project/config.yaml - matches this framework's own repo
  fs.mkdirSync(path.join(root, '.asd', 'templates'), { recursive: true });
  fs.writeFileSync(path.join(root, '.asd', 'templates', 't_AGENTS.md'), 'consumer-only content that must NOT leak into a self-sourced AGENTS.md\n', 'utf8');

  const authored = '<!-- asd:begin v=1 -->\nHand-authored framework-dev guidance, unrelated to t_AGENTS.md.\n<!-- asd:end -->\n';
  fs.writeFileSync(path.join(root, 'AGENTS.md'), authored, 'utf8');
  const state = JSON.parse(fs.readFileSync(path.join(root, '.asd', 'sync-state.json'), 'utf8'));
  state.entries['AGENTS.md'] = { kind: 'managed-block', content_digest: sync.digestTag('Hand-authored framework-dev guidance, unrelated to t_AGENTS.md.\n') };
  fs.writeFileSync(path.join(root, '.asd', 'sync-state.json'), JSON.stringify(state, null, 2));

  const status = sync.runCheck(root).find((i) => i.target === 'AGENTS.md').status;
  assert.strictEqual(status, 'current', 'self-sourced AGENTS.md must never be compared against t_AGENTS.md');
  sync.runApply(root, ['AGENTS.md']); // self-sourced: apply is a documented no-op
  assert.strictEqual(fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8'), authored, 'self-sourced AGENTS.md is never overwritten by --apply');
});

// ===========================================================================
// 3d. self_hosting field detection (fail-closed line scanner, no YAML dep)
// ===========================================================================

test('readSelfHostingField: config.yaml absent -> disabled', () => {
  const dir = mkTempDir();
  assert.strictEqual(sync.readSelfHostingField(dir), 'disabled');
  assert.strictEqual(sync.isSelfHostingRepo(dir), false);
});

test('readSelfHostingField: config.yaml exists but field absent -> disabled', () => {
  const dir = mkTempDir();
  fs.mkdirSync(path.join(dir, '.asd', 'project'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.asd', 'project', 'config.yaml'), 'language:\n  chat: en\n', 'utf8');
  assert.strictEqual(sync.readSelfHostingField(dir), 'disabled');
});

test('readSelfHostingField: self_hosting: disabled -> disabled', () => {
  const dir = mkTempDir();
  fs.mkdirSync(path.join(dir, '.asd', 'project'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.asd', 'project', 'config.yaml'), 'self_hosting: disabled\n', 'utf8');
  assert.strictEqual(sync.readSelfHostingField(dir), 'disabled');
});

test('readSelfHostingField: self_hosting: enabled -> enabled', () => {
  const dir = mkTempDir();
  fs.mkdirSync(path.join(dir, '.asd', 'project'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.asd', 'project', 'config.yaml'), 'self_hosting: enabled # ASD develops itself\n', 'utf8');
  assert.strictEqual(sync.readSelfHostingField(dir), 'enabled');
  assert.strictEqual(sync.isSelfHostingRepo(dir), true);
});

test('readSelfHostingField: malformed/unknown value fails closed to disabled', () => {
  const dir = mkTempDir();
  fs.mkdirSync(path.join(dir, '.asd', 'project'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.asd', 'project', 'config.yaml'), 'self_hosting: yes-please\n', 'utf8');
  assert.strictEqual(sync.readSelfHostingField(dir), 'disabled');
});

test('readSelfHostingField: duplicated top-level key is ambiguous, fails closed to disabled (never "first" or "last" wins)', () => {
  const dir = mkTempDir();
  fs.mkdirSync(path.join(dir, '.asd', 'project'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.asd', 'project', 'config.yaml'), 'self_hosting: enabled\nself_hosting: disabled\n', 'utf8');
  assert.strictEqual(sync.readSelfHostingField(dir), 'disabled');

  const dir2 = mkTempDir();
  fs.mkdirSync(path.join(dir2, '.asd', 'project'), { recursive: true });
  fs.writeFileSync(path.join(dir2, '.asd', 'project', 'config.yaml'), 'self_hosting: enabled\nself_hosting: enabled\n', 'utf8');
  assert.strictEqual(sync.readSelfHostingField(dir2), 'disabled', 'even two IDENTICAL duplicates are ambiguous malformed YAML, not a confirmation');
});

test('isSelfSourcedAgentsMd: no config -> self-sourced; consumer config -> generated; self_hosting:enabled -> self-sourced even though config exists', () => {
  const noConfig = mkTempDir();
  assert.strictEqual(sync.isSelfSourcedAgentsMd(noConfig), true);

  const consumer = mkTempDir();
  fs.mkdirSync(path.join(consumer, '.asd', 'project'), { recursive: true });
  fs.writeFileSync(path.join(consumer, '.asd', 'project', 'config.yaml'), 'self_hosting: disabled\n', 'utf8');
  assert.strictEqual(sync.isSelfSourcedAgentsMd(consumer), false);

  const framework = mkTempDir();
  fs.mkdirSync(path.join(framework, '.asd', 'project'), { recursive: true });
  fs.writeFileSync(path.join(framework, '.asd', 'project', 'config.yaml'), 'self_hosting: enabled\n', 'utf8');
  assert.strictEqual(sync.isSelfSourcedAgentsMd(framework), true);
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
  // `--check` always exits 0 with `ok: true`; drift only shows as a per-item
  // `status` string, so `ok`/`items` alone cannot catch a stale/modified
  // generated view. Assert every item is actually `current` - no exemption.
  // `AGENTS.md` is self-sourced/hand-edited under `self_hosting: enabled`
  // (per AGENTS.md's own documented rule) but MUST still be re-baselined to
  // `current` after each hand-edit (sprint 003 plan.md Task 13 / DoD: "not
  // merely tolerated"); previously this assertion allowlisted it out
  // entirely, which would have silently accepted permanent drift instead of
  // proving the re-baseline actually happened. Fails at parent 317aa50
  // (AGENTS.md was `modified-foreign`); passes at HEAD.
  const drifted = parsed.items.filter((item) => item.status !== 'current');
  assert.deepStrictEqual(drifted, []);
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
  const WORD_TO_NUMBER = { Twelve: 12, Fourteen: 14, Fifteen: 15, Sixteen: 16, Seventeen: 17, Eighteen: 18 };
  const wordMatch = readmeText.match(/(\w+) specialized agents are canonically defined/);
  assert.ok(wordMatch, 'README.md must state "<Word> specialized agents are canonically defined"');
  assert.ok(Object.prototype.hasOwnProperty.call(WORD_TO_NUMBER, wordMatch[1]), `README.md word-form agent count "${wordMatch[1]}" is not in the known word->number map - update the map or the wording`);
  assert.strictEqual(WORD_TO_NUMBER[wordMatch[1]], actualCount, `README.md claims "${wordMatch[1]}" agents, .asd/agents/ has ${actualCount}`);

  const specsMatch = readmeText.match(/(\d+) canonical agent specs/);
  assert.ok(specsMatch, 'README.md folder map must state "N canonical agent specs"');
  assert.strictEqual(Number(specsMatch[1]), actualCount, `README.md folder map claims ${specsMatch[1]} agent specs, .asd/agents/ has ${actualCount}`);

  const definitionMatches = [...readmeText.matchAll(/(\d+) agent definitions/g)];
  assert.strictEqual(definitionMatches.length, 2, `README.md folder map must state "N agent definitions" exactly twice (one per provider view), found ${definitionMatches.length}`);
  for (const m of definitionMatches) {
    assert.strictEqual(Number(m[1]), actualCount, `README.md folder map claims ${m[1]} agent definitions, .asd/agents/ has ${actualCount}`);
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
// 6c. .asd/templates/*.json must stay valid JSON - sync.js --check never
// parses .asd/templates/ (it only classifies generated provider-view
// targets), so nothing else in the pipeline would catch a template edit that
// broke JSON syntax (e.g. a stray trailing comma left behind when deleting a
// field). Placeholders like "{{SPRINT_ID}}" are quoted string values, so a
// well-formed template parses fine as-is - this only guards syntax, not
// placeholder semantics.
// ===========================================================================

test('every .asd/templates/*.json file parses as valid JSON', () => {
  const templatesDir = path.join(REPO_ROOT, '.asd', 'templates');
  const jsonFiles = fs.readdirSync(templatesDir).filter((f) => f.endsWith('.json'));
  assert.ok(jsonFiles.length > 0, 'sanity: at least one template JSON file must exist for this guard to mean anything');
  for (const f of jsonFiles) {
    const abs = path.join(templatesDir, f);
    assert.doesNotThrow(() => JSON.parse(fs.readFileSync(abs, 'utf8')), `.asd/templates/${f} must parse as valid JSON`);
  }
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
