'use strict';

// sync.js provider-view rendering: full-file, managed-block and json-merge classes, path safety, schema versions

const { assert, fs, path, sync, runtime, REPO_ROOT, FIXTURES, test, mkTempDir, loadManifest, makeMiniRepo, writeAgentCanon, GOOD_AGENT_CANON, writeFile, workflowReviewerAgents, canonText, sectionOf, disabledAttributionRepo, OFF_VALUE, recordedOwnedKeys } = require('./lib.js');

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
    codex: { model: 'sol', model_reasoning_effort: 'high' },
  };
  const cases = [
    ['missing Codex block', { ...meta, codex: null }, manifest, 'missing or malformed Codex configuration'],
    ['unknown family', { ...meta, codex: { ...meta.codex, model: 'unknown' } }, manifest, 'unknown model family'],
    ['legacy unsuffixed model', meta, { ...manifest, model_families: { ...manifest.model_families, codex: { ...manifest.model_families.codex, sol: 'gpt-5.6' } } }, 'unsupported ChatGPT-runtime model mapping'],
    ['mismatched family model', meta, { ...manifest, model_families: { ...manifest.model_families, codex: { ...manifest.model_families.codex, sol: 'gpt-6-luna' } } }, 'unsupported ChatGPT-runtime model mapping'],
    ['invalid effort', { ...meta, codex: { ...meta.codex, model_reasoning_effort: 'fast' } }, manifest, 'invalid model reasoning effort'],
    ['invalid web_search', { ...meta, codex: { ...meta.codex, web_search: 'on' } }, manifest, 'invalid web_search mode'],
  ];
  for (const [label, invalidMeta, invalidManifest, reason] of cases) {
    assert.throws(
      () => sync.transformAgentCodexToml(invalidMeta, '', invalidManifest),
      err => err.message.includes(reason) && err.message.includes('runtime-fixture') && err.message.includes('family') && err.message.includes('resolved model') && err.message.includes('effort'),
      label
    );
  }

  const documented = /agent-TOML `web_search` mode \(`([a-z|]+)`/.exec(canonText('.asd/rules/providers.md'));
  assert.ok(documented, 'sprint-018 AC-3: providers.md must document the Codex web_search modes canon may set - the one statement of what Codex can express');
  for (const mode of documented[1].split('|')) {
    let rendered;
    try {
      rendered = sync.transformAgentCodexToml({ ...meta, codex: { ...meta.codex, web_search: mode } }, '', manifest);
    } catch (error) {
      rendered = `rejected: ${error.message}`;
    }
    assert.ok(rendered.split('\n').includes(`web_search = "${mode}"`), `sprint-018 AC-3: providers.md documents web_search mode "${mode}", so sync.js must accept and render it - the documented set and the validator drift apart otherwise. Got: ${rendered.split('\n')[0]}`);
  }
});

test('AC-3/6/7: every canonical Codex agent renders a supported delegate config', () => {
  const manifest = loadManifest();
  const agentsDir = path.join(REPO_ROOT, '.asd', 'agents');
  const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
  assert.deepStrictEqual(workflowReviewerAgents().filter((agent) => !files.includes(`${agent}.md`)), [], 'sprint-020 AC-4: every reviewer key a workflow definition dispatches must have a canonical agent this loop renders - a roster key with no agent is dispatched into nothing');
  const codexFamilies = Object.keys(manifest.model_families.codex).join('|');
  const codexModelRe = new RegExp(`^model = "gpt-\\d+(\\.\\d+)?-(${codexFamilies})"$`, 'm');
  for (const file of files) {
    const { meta, body } = sync.parseCanonicalFrontmatter(sync.readNormalized(path.join(agentsDir, file)));
    const output = sync.transformAgentCodexToml(meta, body, manifest);
    assert.match(output, codexModelRe, `${meta.name}: supported model`);
    assert.match(output, /^model_reasoning_effort = "(low|medium|high|xhigh|max|ultra)"$/m, `${meta.name}: supported effort`);
  }

  const codexItems = sync.buildSyncPlan(REPO_ROOT).filter((item) => item.kind === 'agent-codex');
  assert.ok(codexItems.some((item) => item.metaOverride), 'sanity: the plan must carry the tier variants, or the parity loop below never reaches them');
  for (const item of codexItems) {
    const { meta: base, body } = sync.parseCanonicalFrontmatter(sync.readNormalized(item.canonPath));
    const meta = item.metaOverride || base;
    const web = ['WebFetch', 'WebSearch'].every((tool) => base.claude.tools.includes(tool)) ? 'live' : 'disabled';
    assert.ok(sync.transformAgentCodexToml(meta, body, manifest).split('\n').includes(`web_search = "${web}"`), `sprint-018 AC-3: ${meta.name} must render web_search = "${web}" - Codex parity with its canonical Claude web grant, variants inheriting the base key`);
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
  const wrapper = sync.parseCanonicalFrontmatter(sync.readNormalized(path.join(REPO_ROOT, '.asd', 'agents', 'asd-external-review.md'))).meta;
  const wrappedModel = loadManifest().model_families.codex[wrapper.claude.wraps_model];
  assert.ok(claudeAgent.includes(`exec --model ${wrappedModel} -c model_reasoning_effort="high" --sandbox read-only -`),'Claude-side must invoke the wrapped Codex CLI with explicit model, effort, and read-only sandbox');
  assert.match(claudeAgent, /Bash tool’s `timeout: 600000`/, 'Sprint 038 AC-21: Claude Code supplies the timeout on the foreground Bash call');
  assert.ok(codexAgent.includes('--restricted --tools "Read,Grep,Glob" --strict-mcp-config'), 'Codex-side must invoke the wrapped Claude CLI with explicit read-only tool restriction, not rely on ambient project permissions');
});

test('AC-3: wrapped model aliases resolve through the wrapped provider table', () => {
  const manifest = loadManifest();
  const raw = sync.readNormalized(path.join(REPO_ROOT, '.asd', 'agents', 'asd-external-review.md'));
  const { meta, body } = sync.parseCanonicalFrontmatter(raw);
  const concreteId = new RegExp(`gpt-\\d+(\\.\\d+)?-(${Object.keys(manifest.model_families.codex).join('|')})`);
  assert.ok(!concreteId.test(raw), 'canonical wrapper source must store family aliases only - a concrete Codex id of any version is the pin a model bump would leave stale');
  const override = 'gpt-0-sol';
  const changed = structuredClone(manifest);
  changed.model_families.codex.sol = override;
  const rendered = sync.transformAgentClaude(meta, body, changed);
  assert.ok(rendered.includes(`--model ${override}`), 'nested wrapper arguments must receive the resolved wrapped model from the table the render is given - the override is an id (version 0) no live table holds, so the live table cannot satisfy this');
  assert.ok(!rendered.includes('{{wraps_model}}'));
});

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
  assert.throws(check(withClaudeEffort('ultra')), /invalid effort/, 'C-10: `ultra` is a Codex-only value. Emitted for Claude it is silently ignored by the host, so the agent runs at the host default while canon and README both claim otherwise - the failure mode is invisible in every artefact anyone reads');
  assert.throws(check(withClaudeEffort('very-high')), /invalid effort/, 'a typo in the effort field must fail the render, exactly as an unknown model family already does - the Codex side has validated this since it shipped and the Claude side is the asymmetry C-10 recorded');

  const effortWithoutModel = GOOD_AGENT_CANON.replace('"model": "opus",\n    "effort": "high"', '"effort": "bogus"');
  assert.ok(!effortWithoutModel.includes('"model": "opus"') && effortWithoutModel.includes('"effort": "bogus"'), 'the fixture is a literal replace over the shared canon, so a reformatted canon silently makes it a no-op - the case below would then re-run the model-present path the assertions above already cover and stay green while the emission-site path went untested');
  assert.throws(check(effortWithoutModel), /invalid.*effort/i, 'the emitted `effort:` line is guarded by `claude.effort` alone, so its validation must be too. Guarded instead by a sibling field (`claude.model`), the check misses every agent that declares an effort without a model family - the render writes `effort: bogus` into the generated view unchallenged, which is precisely the silent-ignore failure C-10 asked to close');

  assert.throws(check(withClaudeEffort('')), /invalid effort/, 'an empty effort must reach the validator and fail closed. Guarded on truthiness the emission skipped it entirely: canon declared an effort, the generated view carried none, and `--check` stayed green over that mismatch - the same silent-ignore class C-10 opened, arrived at from the emitter side rather than the vocabulary side');
  assert.throws(check(GOOD_AGENT_CANON.replace('"model": "opus"', '"model": "opus-xl"')), /effort-probe.*opus-xl.*effort "high"/, 'the unknown-family diagnostic must name the agent, the family, the resolved model and the effort on the Claude path too. Special-cased by provider, the Claude branch built its message without the agent argument it was handed, leaving a reader debugging it with no agent name and no route to the effort check that lives beside it');
});

test('sprint-022 AC-8/AC-9, sprint-023 AC-7: the model family and effort each agent renders - both providers, the variants - is the tier README states, the README variant sentence names the same families and efforts, and README names no family no agent renders', () => {
  const manifest = loadManifest();
  const tierOf = (family, effort) => `${family}/${effort || 'none'}`;
  const plan = sync.buildSyncPlan(REPO_ROOT).filter((item) => item.kind === 'agent-claude');
  assert.ok(plan.some((item) => item.metaOverride), 'sanity: the plan must carry the tier variants, or no variant row below is compared');
  const metas = plan.map((item) => item.metaOverride || item.source.meta);
  const tiers = new Map(metas.map((meta) => [meta.name, { claude: tierOf(meta.claude.model, meta.claude.effort), codex: tierOf(meta.codex.model, meta.codex.model_reasoning_effort) }]));
  const baseNames = plan.filter((item) => !item.metaOverride).map((item) => item.source.meta.name);
  const wrapper = plan.find((item) => item.source.meta.name === 'asd-external-review').source.meta;
  const wrappedEffort = (args, flag) => {
    const hit = new RegExp(`${flag}[= ]"?(\\w+)`).exec(args);
    assert.ok(hit, `asd-external-review wraps_invoke_args must state the wrapped reviewer's effort with ${flag}, or the wrapped-reviewer row has nothing to be compared with`);
    return hit[1];
  };
  const wrapped = {
    claude: tierOf(wrapper.claude.wraps_model, wrappedEffort(wrapper.claude.wraps_invoke_args, 'model_reasoning_effort')),
    codex: tierOf(wrapper.codex.wraps_model, wrappedEffort(wrapper.codex.wraps_invoke_args, '--effort')),
  };

  const suffixes = [...new Set([...tiers.keys()].filter((name) => !baseNames.includes(name)).map((name) => name.split('-').pop()))].sort();
  assert.deepStrictEqual(suffixes, ['escalated', 'mechanical', 'runner'], 'sprint-023 AC-7, sprint-033 AC-1/AC-3: the variants are escalated, mechanical and runner, the critical variant is retired; tier standard has no variant and dispatches the base agent - the fact the deleted matrix repeated on its variant rows - so no canon agent may declare a standard variant, which sync.js would otherwise render');

  const agentsSection = sectionOf('README.md', 'Agents');
  const readmeRows = [...agentsSection.matchAll(/^\| `(asd-[a-z-]+)` \| ([^|]+) \| ([^|]+) \|/gm)].map(([, name, claude, codex]) => [name, claude.trim(), codex.trim()]);
  assert.deepStrictEqual(readmeRows.map(([name]) => name).sort(), [...baseNames].sort(), 'README\'s agent tables list each canonical agent once - variants are described in prose, not rows');
  for (const [name, claude, codex] of readmeRows) {
    assert.deepStrictEqual({ claude, codex }, tiers.get(name), `README "Agents" row ${name}: its Claude and Codex cells must be the model/effort canon renders for it (AGENTS.md: a tier change updates the README table in the same change)`);
  }

  const used = { claude: new Set(), codex: new Set() };
  for (const { claude, codex } of tiers.values()) {
    used.claude.add(claude.split('/')[0]);
    used.codex.add(codex.split('/')[0]);
  }
  const listed = /\(Claude: ([a-z/]+); Codex: ([a-z/]+)\)/.exec(agentsSection);
  assert.ok(listed, 'README "Agents" must list the model families its agents declare per provider');
  assert.deepStrictEqual([listed[1].split('/').sort(), listed[2].split('/').sort()], [[...used.claude].sort(), [...used.codex].sort()], 'README\'s per-provider family list is the families the agents render, variants included: a family no agent renders listed (opus after the retier), or a rendered one dropped (haiku), misstates the tiers');
  const unused = ['claude', 'codex'].flatMap((provider) => Object.keys(manifest.model_families[provider]).filter((family) => !used[provider].has(family)));
  assert.deepStrictEqual(unused.filter((family) => new RegExp(`\\b${family}\\b`, 'i').test(agentsSection)), [], 'README "Agents" names a model family no agent renders - a tier sentence still on the retired family');

  const efforts = new Set([...tiers.values(), wrapped].flatMap((tier) => [tier.claude, tier.codex]).map((tier) => tier.split('/')[1]));
  const vocabulary = new Set([...unused, ...used.claude, ...used.codex, ...efforts]);
  vocabulary.delete('none');
  const wordsIn = (sentence) => new Set([...sentence.toLowerCase().matchAll(/[a-z]+/g)].map(([word]) => word).filter((word) => vocabulary.has(word)));
  const wordsOfTiers = (names) => new Set(names.flatMap((name) => [tiers.get(name).claude, tiers.get(name).codex]).flatMap((tier) => tier.split('/')).filter((word) => word !== 'none'));
  const variantNames = [...tiers.keys()].filter((name) => !baseNames.includes(name));
  const variantBases = baseNames.filter((name) => variantNames.some((variant) => variant.startsWith(`${name}-`)));
  const sentencesOf = (rel, isTierSentence) => {
    const hits = canonText(rel).split('\n').filter((line) => !/^[|#]/.test(line)).join('\n').split(/(?<=\.)\s+/).filter(isTierSentence);
    const missing = sync.VARIANT_SUFFIXES.filter((suffix) => !hits.some((sentence) => sentence.includes(`\`${suffix}\``) || sentence.includes(`\`-${suffix}\``)));
    assert.deepStrictEqual(missing, [], `sprint-033 AC-6: ${rel} must state each variant tier in a sentence, or the tier words below are compared with the wrong text`);
    return hits.join(' ');
  };
  const readmeSentence = sentencesOf('README.md', (sentence) => sync.VARIANT_SUFFIXES.some((suffix) => sentence.includes(`\`-${suffix}\``)));
  assert.deepStrictEqual([...wordsIn(readmeSentence)].sort(), [...new Set([...wordsOfTiers(variantNames), ...wordsOfTiers(variantBases)])].sort(), 'AC-9: README\'s variant sentence names exactly the families and efforts the variants and the base agent they fall back to render');
});

test('sprint-036 AC-15: readAiAttribution reads disabled only from exactly one ai_attribution: disabled line of the git group, comments and CRLF included, and every other shape reads enabled', () => {
  const cases = [
    ['an absent config file', null, 'enabled'],
    ['no git group', 'language:\n  chat: en\n', 'enabled'],
    ['the value disabled', 'git:\n  ai_attribution: disabled\n', 'disabled'],
    ['a trailing comment on the line', 'git:\n  ai_attribution: disabled # why\n', 'disabled'],
    ['a trailing comment on the group line', 'git: # c\n  ai_attribution: disabled\n', 'disabled'],
    ['CRLF line endings', 'git:\r\n  base_branch: main\r\n  ai_attribution: disabled\r\n', 'disabled'],
    ['a blank line and a comment before the key', 'git:\n  base_branch: main\n\n  # note\n  ai_attribution: disabled\n', 'disabled'],
    ['the value enabled', 'git:\n  ai_attribution: enabled\n', 'enabled'],
    ['a key of another group before git', 'project:\n  ai_attribution: disabled\ngit:\n  base_branch: main\n', 'enabled'],
    ['a key of a group after git', 'git:\n  base_branch: main\nlanguage:\n  ai_attribution: disabled\n', 'enabled'],
    ['a top-level key', 'ai_attribution: disabled\n', 'enabled'],
    ['a commented key', 'git:\n  # ai_attribution: disabled\n', 'enabled'],
    ['a duplicate line', 'git:\n  ai_attribution: disabled\n  ai_attribution: disabled\n', 'enabled'],
    ['conflicting duplicate lines', 'git:\n  ai_attribution: disabled\n  ai_attribution: enabled\n', 'enabled'],
    ['another letter case of the value', 'git:\n  ai_attribution: Disabled\n', 'enabled'],
    ['a quoted value', 'git:\n  ai_attribution: "disabled"\n', 'enabled'],
    ['the key nested under another git key', 'git:\n  base_branch: main\n  other:\n    ai_attribution: disabled\n', 'enabled'],
    ['a double-quoted duplicate of the key', 'git:\n  ai_attribution: disabled\n  "ai_attribution": enabled\n', 'enabled'],
    ['a single-quoted duplicate of the key', 'git:\n  \'ai_attribution\': enabled\n  ai_attribution: disabled\n', 'enabled'],
    ['an empty git group', 'git:\nlanguage:\n  chat: en\n', 'enabled'],
  ];
  const read = (config) => {
    const root = mkTempDir();
    if (config !== null) writeFile(root, '.asd/project/config.yaml', config);
    return sync.readAiAttribution(root);
  };
  assert.deepStrictEqual(cases.map(([label, config]) => [label, read(config)]), cases.map(([label, , expected]) => [label, expected]), 'AC-15: a missing, malformed or ambiguous config never turns attribution off');
});

test('sprint-036 AC-16 (external 3): recordOwnedKeys saves the ledger atomically - it returns true and leaves no temp file after a save, never deletes a foreign file at the temp name, and a failing rename leaves the original ledger intact with its own temp file removed', () => {
  const settingsRel = '.claude/settings.json';
  const repo = disabledAttributionRepo();
  const asdDir = path.join(repo.root, '.asd');
  const ledgerPath = path.join(asdDir, 'sync-state.json');
  const before = JSON.parse(repo.read(settingsRel));
  const record = () => sync.recordOwnedKeys(repo.root, settingsRel, before, { attribution: OFF_VALUE });
  const tempNames = () => fs.readdirSync(asdDir).filter((name) => name.endsWith('.tmp'));
  const original = repo.read('.asd/sync-state.json');

  const FOREIGN = 'not the ledger';
  const foreign = path.join(asdDir, `sync-state.json.${process.pid}.tmp`);
  fs.writeFileSync(foreign, FOREIGN, 'utf8');
  assert.throws(record, /EEXIST/, 'AC-16: an existing file at the temp name is never opened over');
  assert.deepStrictEqual([fs.readFileSync(foreign, 'utf8'), repo.read('.asd/sync-state.json')], [FOREIGN, original], 'AC-16: the foreign file is kept and the ledger unchanged');
  fs.unlinkSync(foreign);

  const realRename = fs.renameSync;
  fs.renameSync = () => { throw new Error('EPERM: stubbed renameSync failure'); };
  try {
    assert.throws(record, /stubbed renameSync failure/, 'AC-16: a failing rename surfaces its error');
  } finally {
    fs.renameSync = realRename;
  }
  assert.deepStrictEqual([repo.read('.asd/sync-state.json'), tempNames()], [original, []], 'AC-16: the original ledger is intact and the temp file this call created is gone');

  assert.strictEqual(record(), true, 'AC-16: a save returns true');
  assert.deepStrictEqual([JSON.parse(fs.readFileSync(ledgerPath, 'utf8')).entries[settingsRel].owned_keys, tempNames()], [['attribution'], []], 'AC-16: the record is in the ledger and no temp file remains');
});

test('sprint-036 AC-15: a repeated attribution key is spliced at its last occurrence - the one JSON.parse reads - and apply reaches current', () => {
  const settingsRel = '.claude/settings.json';
  const root = makeMiniRepo();
  const settingsPath = path.join(root, settingsRel);
  sync.runApply(root, [settingsRel]);
  const baseline = fs.readFileSync(settingsPath, 'utf8');
  const FIRST = '"attribution": {"commit": "first"}';
  fs.writeFileSync(settingsPath, baseline.replace(/^\{\n/, `{\n  ${FIRST},\n`).replace(/\n\}\n$/, ',\n  "attribution": {"commit": "last"}\n}\n'), 'utf8');
  writeFile(root, '.asd/project/config.yaml', 'git:\n  ai_attribution: disabled\n');
  const statusOf = () => sync.runCheck(root).find((item) => item.target === settingsRel).status;
  assert.strictEqual(statusOf(), 'stale', 'AC-15: the effective (last) value is not the owned one');

  sync.runApply(root, [settingsRel]);
  const applied = fs.readFileSync(settingsPath, 'utf8');
  assert.deepStrictEqual([JSON.parse(applied).attribution, applied.includes(FIRST), statusOf()], [{ commit: '', pr: '' }, true, 'current'], 'AC-15: the last occurrence is replaced, the first stays as written, and apply reaches current');
});

test('sprint-036 AC-15: an attribution-only json-merge re-render leaves the owned hooks array byte-identical - an owned hook followed by a foreign one keeps its order and layout', () => {
  const target = path.join(mkTempDir(), 'settings.json');
  const hooks = `"hooks": {"SessionStart": [${JSON.stringify(demoAsdEntries()[0])}, {"type":"command","command":"mine.sh"}]}`;
  fs.writeFileSync(target, `{\n  ${hooks},\n  "model": "opus"\n}\n`, 'utf8');

  const rendered = sync.renderJsonMerge(target, HOOK_PATH, demoAsdEntries(), { attribution: sync.ATTRIBUTION_OFF });

  assert.deepStrictEqual([rendered.startsWith(`{\n  ${hooks},\n  "model": "opus",\n`), JSON.parse(rendered).attribution], [true, { commit: '', pr: '' }], 'AC-15: the array is not rebuilt (foreign hook first, owned after) when only the attribution key changes');
});

test('sprint-036 AC-15: spliceTopLevelKey appends a member at the indent of the document\'s first member and nests its value by that unit, falling back to two spaces for a compact or empty object', () => {
  const VALUE = { x: 1 };
  assert.deepStrictEqual([
    sync.spliceTopLevelKey('{\n    "a": 1\n}\n', 'b', VALUE),
    sync.spliceTopLevelKey('{"a":1}', 'b', VALUE),
    sync.spliceTopLevelKey('{}', 'b', VALUE),
  ], [
    '{\n    "a": 1,\n    "b": {\n        "x": 1\n    }\n}\n',
    '{"a":1,\n  "b": {\n    "x": 1\n  }}',
    '{\n  "b": {\n    "x": 1\n  }\n}',
  ], 'AC-15: a four-space file gets four-space members and nesting; a compact or empty object gets two');
});

/** A mini repo whose `.claude/settings.json` sync applied with no attribution key, then the user set the off value `{"commit":"","pr":""}` by hand, and only then `git.ai_attribution` is `config` (none when null): a value sync never wrote. */
function handSetAttributionRoot(config) {
  const settingsRel = '.claude/settings.json';
  const root = makeMiniRepo();
  sync.runApply(root, [settingsRel]);
  const settingsPath = path.join(root, settingsRel);
  const handSet = `${JSON.stringify({ ...JSON.parse(fs.readFileSync(settingsPath, 'utf8')), attribution: sync.ATTRIBUTION_OFF }, null, 2)}\n`;
  fs.writeFileSync(settingsPath, handSet, 'utf8');
  if (config !== null) writeFile(root, '.asd/project/config.yaml', `git:\n  ai_attribution: ${config}\n`);
  return { root, settingsPath, handSet, statusOf: () => sync.runCheck(root).find((item) => item.target === settingsRel).status };
}

/** Makes the owned SessionStart hooks of `.claude/settings.json` under `root` read as an older release wrote them: the `_asd` entries changed and the sync-state digest moved with them, so the entry reads `stale`, never `modified-foreign`. */
function ageOwnedHooks(root) {
  const settingsPath = path.join(root, '.claude', 'settings.json');
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  const owned = settings.hooks.SessionStart.filter((entry) => entry._asd === true);
  owned.forEach((entry) => { entry.command = `${entry.command} --older`; });
  fs.writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
  const statePath = path.join(root, '.asd', 'sync-state.json');
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  state.entries['.claude/settings.json'].content_digest = sync.digestTag(sync.stableStringify(owned));
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

test('sprint-036 AC-15: an off attribution value the user set by hand and sync never wrote reads current and stays byte-identical and unrecorded under an absent, enabled or disabled git.ai_attribution, and a later enabled leaves it alone', () => {
  const settingsRel = '.claude/settings.json';
  for (const config of [null, 'enabled', 'disabled']) {
    const label = config === null ? 'absent' : config;
    const { root, settingsPath, handSet, statusOf } = handSetAttributionRoot(config);
    assert.strictEqual(statusOf(), 'current', `AC-15: ai_attribution ${label} - a hand-set off value is the user's own, never stale`);
    sync.runApply(root, [settingsRel]);
    assert.deepStrictEqual([fs.readFileSync(settingsPath, 'utf8'), recordedOwnedKeys(root)], [handSet, undefined], `AC-15: ai_attribution ${label} - apply leaves the hand-set value byte-identical and records no owned key`);
  }

  const { root, settingsPath, handSet, statusOf } = handSetAttributionRoot('disabled');
  sync.runApply(root, [settingsRel]);
  writeFile(root, '.asd/project/config.yaml', 'git:\n  ai_attribution: enabled\n');
  sync.runApply(root, [settingsRel]);
  assert.deepStrictEqual([fs.readFileSync(settingsPath, 'utf8'), statusOf(), recordedOwnedKeys(root)], [handSet, 'current', undefined], 'AC-15: a hand-set value seen under disabled is never released by a later enabled');
});

test('sprint-036 AC-15 (combined F1/F2): a re-render of stale hooks keeps a hand-set off attribution value byte-identical and unrecorded under enabled and disabled, and a write under disabled records the attribution key only when it changed the value - the record surviving a later re-render of stale hooks', () => {
  const settingsRel = '.claude/settings.json';
  for (const config of ['enabled', 'disabled']) {
    const hand = handSetAttributionRoot(config);
    ageOwnedHooks(hand.root);
    assert.strictEqual(hand.statusOf(), 'stale', `AC-15: ai_attribution ${config} - control: older owned hooks make the entry stale, so apply renders`);
    sync.runApply(hand.root, [settingsRel]);
    assert.deepStrictEqual([fs.readFileSync(hand.settingsPath, 'utf8'), hand.statusOf(), recordedOwnedKeys(hand.root)], [hand.handSet, 'current', undefined], `AC-15: ai_attribution ${config} - the hooks are re-rendered to the released ones and the render releases or records no key sync never wrote`);
  }

  const root = makeMiniRepo();
  writeFile(root, '.asd/project/config.yaml', 'git:\n  ai_attribution: disabled\n');
  sync.runApply(root, [settingsRel]);
  assert.deepStrictEqual(recordedOwnedKeys(root), ['attribution'], 'AC-15: control - a write that inserted the key records it');
  ageOwnedHooks(root);
  sync.runApply(root, [settingsRel]);
  assert.deepStrictEqual(recordedOwnedKeys(root), ['attribution'], 'AC-15: a later write that changes only the hooks keeps the key recorded');
});

test('sprint-036 AC-15: sync json-merge carries "attribution": {"commit": "", "pr": ""} in .claude/settings.json only under git.ai_attribution disabled - stale until applied, then current - leaves the file byte-identical under enabled or an absent key, and replaces a re-enabling value without touching its neighbours', () => {
  const settingsRel = '.claude/settings.json';
  const root = makeMiniRepo();
  const settingsPath = path.join(root, '.claude', 'settings.json');
  const configure = (value) => writeFile(root, '.asd/project/config.yaml', `git:\n  ai_attribution: ${value}\n`);
  const statusOf = () => sync.runCheck(root).find((item) => item.target === settingsRel).status;
  const read = () => fs.readFileSync(settingsPath, 'utf8');

  sync.runApply(root, [settingsRel]);
  const baseline = read();
  assert.strictEqual('attribution' in JSON.parse(baseline), false, 'AC-15: an absent key adds no attribution');
  configure('enabled');
  sync.runApply(root, [settingsRel]);
  assert.deepStrictEqual([statusOf(), read()], ['current', baseline], 'AC-15: enabled leaves .claude/settings.json byte-identical');

  configure('disabled');
  assert.strictEqual(statusOf(), 'stale', 'AC-15: the carried key is part of what current means');
  sync.runApply(root, [settingsRel]);
  const carried = JSON.parse(read());
  assert.deepStrictEqual([carried.attribution, carried.hooks, statusOf()], [{ commit: '', pr: '' }, JSON.parse(baseline).hooks, 'current'], 'AC-15: disabled adds the attribution key, the owned hooks stay and the file reads current');
  assert.deepStrictEqual(recordedOwnedKeys(root), ['attribution'], 'AC-15: the sync-state entry records the key sync wrote');
  const applied = read();
  sync.runApply(root, [settingsRel]);
  assert.strictEqual(read(), applied, 'AC-15: a second apply writes nothing');
  configure('enabled');
  assert.strictEqual(statusOf(), 'stale', 'AC-15: flipping back to enabled leaves the still-carried off value stale');
  sync.runApply(root, [settingsRel]);
  assert.deepStrictEqual([read(), statusOf(), recordedOwnedKeys(root)], [baseline, 'current', undefined], 'AC-15: flipping back to enabled drops the attribution key while it deep-equals the owned off value, and the record with it');

  const own = { commit: 'x' };
  fs.writeFileSync(settingsPath, `${JSON.stringify({ ...JSON.parse(baseline), attribution: own }, null, 2)}\n`, 'utf8');
  const userOwned = read();
  assert.strictEqual(statusOf(), 'current', 'AC-15: a user-set attribution value reads current under enabled');
  sync.runApply(root, [settingsRel]);
  assert.deepStrictEqual([read(), statusOf()], [userOwned, 'current'], 'AC-15: enabled keeps a user-set attribution value byte-identical');

  const target = path.join(mkTempDir(), 'settings.json');
  const raw = ['{', '    "permissions": {"allow": ["Bash(git *)"]},', '    "attribution": {"commit": "x", "pr": "y"},', '    "model":   "opus"', '}', ''].join('\n');
  fs.writeFileSync(target, raw, 'utf8');
  const rendered = sync.renderJsonMerge(target, ['hooks', 'SessionStart'], demoAsdEntries(), { attribution: { commit: '', pr: '' } });
  assert.deepStrictEqual([JSON.parse(rendered).attribution, rendered.includes('    "permissions": {"allow": ["Bash(git *)"]},\n'), rendered.includes('    "model":   "opus"')], [{ commit: '', pr: '' }, true, true], 'AC-15: a re-enabling attribution value is replaced in place and its neighbours keep their exact bytes');
});

test('sprint-036 AC-15 (D-1): a json-merge re-render of an owned array in a four-space file nests its elements and its closing bracket by the indent of the line the array opens on, and keeps a foreign element byte-identical', () => {
  const target = path.join(mkTempDir(), 'settings.json');
  const foreign = '{ "type": "command", "command": "my-own-script.sh" }';
  fs.writeFileSync(target, ['{', '    "hooks": {', '        "SessionStart": [', `            ${foreign},`, '            {"_asd": true, "type": "command", "command": "stale"}', '        ]', '    }', '}', ''].join('\n'), 'utf8');

  const rendered = sync.renderJsonMerge(target, HOOK_PATH, demoAsdEntries());

  const pad = ' '.repeat(10);
  const expectedArray = ['[', `${pad}${foreign},`, `${pad}{`, `${pad}  "_asd": true,`, `${pad}  "type": "command",`, `${pad}  "command": "node .asd/hooks/session-start.js --provider claude"`, `${pad}}`, '        ]'].join('\n');
  assert.strictEqual(rendered, ['{', '    "hooks": {', `        "SessionStart": ${expectedArray}`, '    }', '}', ''].join('\n'), 'AC-15: the rebuilt array indents by the depth of its own opening line, not by a fixed width');
});
