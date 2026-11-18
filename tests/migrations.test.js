'use strict';

// release migrations under .asd/migrations

const { assert, fs, path, sync, update, REPO_ROOT, FIXTURES, tests, test, mkTempDir, loadManifest, GOOD_AGENT_CANON, writeFile, markedFileContent, canonText, readRemovedConfigKeys, migrateConfig900, canonAgents, retiredAgentNames1400, legacyReviewerKeys1400 } = require('./lib.js');

const migration400 = require('../.asd/migrations/4.0.0.js');

const migration500 = require('../.asd/migrations/5.0.0.js');

const migration600 = require('../.asd/migrations/6.0.0.js');

const migration1400 = require('../.asd/migrations/14.0.0.js');

const migration1450 = require('../.asd/migrations/14.5.0.js');

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
  const name = 'asd-reviewer-implementation'; // one of the nine names 4.0.0 retired, none a live agent name now
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

/** Runs the 14.0.0 migration with stdout captured, so its warnings are asserted instead of printed. */
async function runMigration1400(root) {
  const captured = [];
  const realWrite = process.stdout.write;
  process.stdout.write = (chunk) => {
    captured.push(String(chunk));
    return true;
  };
  try {
    const report = await migration1400({ repoRoot: root });
    return { report, output: captured.join('') };
  } finally {
    process.stdout.write = realWrite;
  }
}

test('sprint-028 AC-18 (D13): the 14.0.0 migration deletes the ASD-marked generated views of exactly its nine retired agents - none a live canonical agent - keeps an unmarked consumer file of a retired name and every live sibling, and a re-run is a no-op', async () => {
  const retired = retiredAgentNames1400();
  const liveAgents = fs.readdirSync(path.join(REPO_ROOT, '.asd/agents')).map((file) => file.replace(/\.md$/, ''));
  assert.strictEqual(retired.length, 9, 'AC-11 retires nine agent names, and the migration must delete the views of each');
  assert.deepStrictEqual(retired.filter((name) => liveAgents.includes(name)), [], 'a retired name that is a live canonical agent would have its regenerated view deleted by every consumer update');

  const root = makeMigrationFixtureRepo();
  const manifest = loadManifest();
  const [unmarkedName, ...markedNames] = retired;
  const claudeView = (name) => `.claude/agents/${name}.md`;
  const codexView = (name) => `.codex/agents/${name}.toml`;
  for (const name of markedNames) {
    writeFile(root, claudeView(name), markedFileContent('md', manifest));
    writeFile(root, codexView(name), markedFileContent('toml', manifest));
  }
  const handAuthored = '# a consumer agent that happens to share a retired name\n';
  writeFile(root, claudeView(unmarkedName), handAuthored);
  const sibling = '.claude/agents/asd-dev.md';
  writeFile(root, sibling, '# a live agent in the same generated tree\n');

  const { report, output } = await runMigration1400(root);
  assert.deepStrictEqual(report.deleted.slice().sort(), markedNames.flatMap((name) => [claudeView(name), codexView(name)]).sort(), 'every marked view of a retired agent, on both providers, and nothing else');
  assert.deepStrictEqual(report.skippedUnmarked, [claudeView(unmarkedName)]);
  assert.ok(report.missing.includes(codexView(unmarkedName)), 'an absent view is success, never an error');
  assert.ok(output.includes(claudeView(unmarkedName)), 'a kept unmarked file must be named in a warning - silence reads as a clean migration');
  assert.strictEqual(fs.readFileSync(path.join(root, claudeView(unmarkedName)), 'utf8'), handAuthored, 'a consumer-owned file survives byte for byte');
  assert.ok(markedNames.every((name) => !fs.existsSync(path.join(root, claudeView(name))) && !fs.existsSync(path.join(root, codexView(name)))));
  assert.ok(fs.existsSync(path.join(root, sibling)), 'a live sibling in the same tree is never touched');

  const rerun = (await runMigration1400(root)).report;
  assert.deepStrictEqual(rerun.deleted, [], 'an applied migration re-runs as a no-op');
});

/** A pre-14.0.0 review node tree: every combination of legacy verdicts the merged `quality` verdict must classify, reviews on disk laid out as the migration reads them. */
function legacyReviewsFixture(sprintRoot) {
  const reviewFile = (dir, reviewer, ids, resolved) => {
    writeFile(sprintRoot, `${dir}/${reviewer}.findings.json`, JSON.stringify(ids.map((id) => ({ id, severity: 'high', location: 'a.js:1' }))));
    writeFile(sprintRoot, `${dir}/${reviewer}.md`, `[REVIEW-x-${reviewer}]: CONCERNS\n${resolved.length ? `resolved: ${resolved.join(', ')} — review-fix, 2026-10-01\n` : ''}`);
  };
  reviewFile('reviews/design/iter-03', 'correctness', ['F-1', 'F-2'], ['F-1', 'F-2']);
  reviewFile('reviews/design/iter-04', 'correctness', ['F-1', 'F-2'], ['F-1']);
  reviewFile('reviews/impl/wave-2/iter-01', 'testing', ['F-1'], ['F-1']);
  const legacy = (correctness, testing, documentation) => ({ correctness, testing, documentation, efficiency: 'APPROVE' });
  const legacyDesign = (correctness, documentation) => ({ correctness, documentation, efficiency: 'APPROVE' });
  return {
    design: {
      iteration: 7,
      verdicts: {
        'iter-01': legacyDesign('FAIL', 'APPROVE'),
        'iter-02': legacyDesign('APPROVE', 'APPROVE (skipped: no docs)'),
        'iter-03': legacyDesign('CONCERNS', 'skipped: no docs in scope'),
        'iter-04': legacyDesign('CONCERNS', 'APPROVE'),
        'iter-05': { ...legacyDesign('APPROVE', 'APPROVE'), quality: 'CONCERNS' },
        'iter-06': { efficiency: 'APPROVE' },
        'iter-07': { correctness: 'APPROVE', efficiency: 'APPROVE' },
      },
      latched: { correctness: 1, documentation: 3, efficiency: 1 },
    },
    impl: {
      wave: 2,
      waves: [
        { iteration: 1, verdicts: { 'iter-01': legacy('APPROVE', 'APPROVE', 'APPROVE') }, iteration_heads: {}, latched: { correctness: 1, testing: 1, documentation: 2 } },
        { iteration: 2, verdicts: { 'iter-01': { correctness: 'APPROVE', testing: 'CONCERNS', documentation: 'APPROVE' }, 'iter-02': { correctness: 'APPROVE', testing: 'APPROVE' } }, iteration_heads: {}, latched: { correctness: 1, testing: 1 } },
      ],
    },
  };
}

test('sprint-028 AC-18 (D13): the 14.0.0 migration gives every review iteration of an active sprint a quality verdict - APPROVE only when each legacy verdict present is satisfied (an approval, a skip, or a bare finding verdict whose review file resolves every finding id, read from that wave\'s own directory), else the most severe token, and none when a reviewer its node roster requires is absent - latches quality only when every reviewer of its node roster latched (design: correctness and documentation), keeps the legacy keys, and folds the critical task tier into standard', async () => {
  const root = makeMigrationFixtureRepo();
  const sprintRoot = path.join(root, '.asd/sprints/001-live');
  const reviews = legacyReviewsFixture(sprintRoot);
  const routing = { 'Task 1': { tier: 'critical', execution: 'agent', reason: 'risk:x' }, 'Task 2': { tier: 'standard', execution: 'agent', reason: 'normal' }, 'Task 3': { tier: 'mechanical', execution: 'command', reason: 'deterministic-command' } };
  writeFile(root, '.asd/sprints/001-live/state.json', `${JSON.stringify({ sprint_id: '001-live', phase: 'impl-review', reviews, task_routing: routing }, null, 2)}\n`);
  assert.deepStrictEqual(legacyReviewerKeys1400(), ['correctness', 'testing', 'documentation'], 'sanity: the fixture is built for the three legacy keys AC-14 merges');

  const { report } = await runMigration1400(root);

  const expected = structuredClone(reviews);
  const quality = { 'iter-01': 'FAIL', 'iter-02': 'APPROVE', 'iter-03': 'APPROVE', 'iter-04': 'CONCERNS' };
  for (const [iteration, token] of Object.entries(quality)) expected.design.verdicts[iteration].quality = token;
  expected.design.latched.quality = 3;
  expected.impl.waves[0].verdicts['iter-01'].quality = 'APPROVE';
  expected.impl.waves[0].latched.quality = 2;
  expected.impl.waves[1].verdicts['iter-01'].quality = 'APPROVE';
  const after = JSON.parse(fs.readFileSync(path.join(sprintRoot, 'state.json'), 'utf8'));
  assert.deepStrictEqual(after.reviews, expected, 'quality is the worst unsatisfied legacy token, resolved findings and skips count as satisfied, wave K reads wave-K\'s directory, an existing quality verdict and an efficiency-only iteration are left alone, an iteration lacking a reviewer its node\'s roster required (a lost dispatch) gets no quality key, and only a full roster latch becomes a quality latch');
  assert.deepStrictEqual(after.task_routing, { ...routing, 'Task 1': { ...routing['Task 1'], tier: 'standard' } }, 'only the retired critical tier changes');
  assert.deepStrictEqual(report.rewritten, ['.asd/sprints/001-live/state.json']);
});

test('sprint-028 AC-18 (D13): the 14.0.0 migration rewrites an active state file atomically with its own line endings, leaves a finished, archived, unparsable or already-migrated one byte for byte (naming the unparsable one), and re-runs as a no-op', async () => {
  const root = makeMigrationFixtureRepo();
  const criticalRouting = { 'Task 1': { tier: 'critical', execution: 'agent', reason: 'risk:x' } };
  const live = { sprint_id: '001-live', phase: 'impl', task_routing: criticalRouting };
  const liveCrlf = `${JSON.stringify(live, null, 2).split('\n').join('\r\n')}\r\n`;
  const migrated = `${JSON.stringify({ sprint_id: '002-migrated', phase: 'impl', task_routing: { 'Task 1': { tier: 'standard' } } }, null, 2)}\n`;
  const finished = `${JSON.stringify({ sprint_id: '003-finished', phase: 'done', task_routing: criticalRouting }, null, 2)}\n`;
  const broken = '{\n  "sprint_id": "004-broken",\n  "task_routing": {\n';
  const archived = `${JSON.stringify({ sprint_id: '005-archived', phase: 'impl', task_routing: criticalRouting }, null, 2)}\n`;
  const files = { '001-live': liveCrlf, '002-migrated': migrated, '003-finished': finished, '004-broken': broken };
  for (const [name, text] of Object.entries(files)) writeFile(root, `.asd/sprints/${name}/state.json`, text);
  writeFile(root, '.asd/sprints/archived/005-archived/state.json', archived);
  fs.mkdirSync(path.join(root, '.asd/sprints/006-no-state'), { recursive: true });
  const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

  const { report, output } = await runMigration1400(root);

  const expectedLive = `${JSON.stringify({ ...live, task_routing: { 'Task 1': { tier: 'standard', execution: 'agent', reason: 'risk:x' } } }, null, 2).split('\n').join('\r\n')}\r\n`;
  assert.strictEqual(read('.asd/sprints/001-live/state.json'), expectedLive, 'CRLF and the trailing newline survive the rewrite');
  assert.deepStrictEqual([report.rewritten, report.unchanged, report.skipped.slice().sort()], [['.asd/sprints/001-live/state.json'], ['.asd/sprints/002-migrated/state.json'], ['.asd/sprints/003-finished/state.json', '.asd/sprints/004-broken/state.json']]);
  assert.ok(/004-broken\/state\.json[^\n]*by hand/.test(output), 'an unparsable state is left alone and says so');
  assert.strictEqual(read('.asd/sprints/002-migrated/state.json'), migrated);
  assert.strictEqual(read('.asd/sprints/003-finished/state.json'), finished, 'a finished sprint is history');
  assert.strictEqual(read('.asd/sprints/004-broken/state.json'), broken);
  assert.strictEqual(read('.asd/sprints/archived/005-archived/state.json'), archived, 'the archive subtree is never entered');
  assert.deepStrictEqual(fs.readdirSync(path.join(root, '.asd/sprints/001-live')), ['state.json'], 'the atomic rewrite leaves no temporary file behind');

  const rerun = (await runMigration1400(root)).report;
  assert.deepStrictEqual([rerun.rewritten, rerun.unchanged.includes('.asd/sprints/001-live/state.json')], [[], true], 'an applied migration re-runs as a no-op');
  assert.strictEqual(read('.asd/sprints/001-live/state.json'), expectedLive);
});

test('sprint-030 AC-7: the 14.2.0 migration deletes the legacy external-review cache file and nothing else, reports it, and a re-run is a no-op', () => {
  const migration1420 = require('../.asd/migrations/14.2.0.js');
  const root = mkTempDir();
  const cache = '.asd/project/external-cache.json';
  const neighbours = ['.asd/project/config.yaml', '.asd/project/retro-backlog.md', '.gitignore'];
  writeFile(root, cache, '{"codex":{"retryAfter":1}}\n');
  neighbours.forEach((rel) => writeFile(root, rel, `${rel}\n`));
  assert.deepStrictEqual(migration1420({ repoRoot: root }), { deleted: [cache], missing: [] }, 'AC-7: the present legacy cache is deleted and reported');
  assert.ok(!fs.existsSync(path.join(root, cache)), 'AC-7: the legacy cache file is gone');
  assert.deepStrictEqual(neighbours.filter((rel) => fs.readFileSync(path.join(root, rel), 'utf8') !== `${rel}\n`), [], 'AC-7: the migration touches no neighbouring file, the consumer\'s .gitignore included');
  assert.deepStrictEqual(migration1420({ repoRoot: root }), { deleted: [], missing: [cache] }, 'AC-7: a re-run finds nothing and reports it missing, never an error');
});

/** Runs the 14.5.0 migration over `root`, its stdout captured so the warnings are asserted instead of printed. */
async function runMigration1450(root) {
  const captured = [];
  const realWrite = process.stdout.write;
  process.stdout.write = (chunk) => {
    captured.push(String(chunk));
    return true;
  };
  try {
    const report = await migration1450({ repoRoot: root });
    return { report, output: captured.join('') };
  } finally {
    process.stdout.write = realWrite;
  }
}

test('sprint-033 AC-19/AC-33: the 14.5.0 migration deletes the agent-memory directory of every name an earlier migration retired that is not a live canonical agent or variant, keeps live and unrelated memory, rewrites exactly the old designmd-install value, and a re-run is a no-op', async () => {
  const constant = (rel) => [...(/const RETIRED_AGENTS = \[([\s\S]*?)\];/.exec(canonText(rel))[1]).matchAll(/'([a-z-]+)'/g)].map((match) => match[1]);
  const retired = [...new Set([...constant('.asd/migrations/4.0.0.js'), ...constant('.asd/migrations/14.0.0.js'), /'(asd-[a-z-]+)\.md'/.exec(canonText('.asd/migrations/5.0.0.js'))[1]])];
  const live = new Set(canonAgents().flatMap((agent) => [agent.name, ...Object.keys(agent.meta.variants || {}).map((suffix) => `${agent.name}-${suffix}`)]));
  const survivors = ['asd-reviewer-quality', 'asd-dev-mechanical', 'asd-tester-runner', 'asd-scout'];
  assert.deepStrictEqual(survivors.filter((name) => !live.has(name)), [], 'sanity: the survivors named below are live canonical names');
  const gone = retired.filter((name) => !live.has(name));
  assert.ok(gone.includes('asd-tester-mechanical') && gone.includes('asd-pm') && retired.includes('asd-reviewer-quality') && !gone.includes('asd-reviewer-quality'), 'sanity: retired names are gathered across the three earlier migrations, and a name retired then live again is not gone');

  const root = makeMigrationFixtureRepo();
  fs.cpSync(path.join(REPO_ROOT, '.asd', 'agents'), path.join(root, '.asd', 'agents'), { recursive: true });
  const memoryDir = (name) => path.join(root, '.claude', 'agent-memory', name);
  for (const name of [...retired, ...survivors, 'custom-project-agent']) writeFile(root, `.claude/agent-memory/${name}/MEMORY.md`, '# memory\n');
  const OLD = 'npm install @google/design.md';
  const NEW = 'npm install --no-save @google/design.md';
  const commands = (install) => `build: "node .asd/sync.js --check"\n  designmd-install: "${install}"\n  designmd-lint: "npx @google/design.md lint"\n`;
  writeFile(root, '.asd/project/commands.yaml', commands(OLD));

  const first = await runMigration1450(root);
  assert.deepStrictEqual([...first.report.deleted].sort(), gone.map((name) => `.claude/agent-memory/${name}`).sort(), 'AC-19: exactly the retired names that are not live lose their memory directory');
  assert.deepStrictEqual(gone.filter((name) => fs.existsSync(memoryDir(name))), [], 'the directories are gone from disk');
  assert.deepStrictEqual([...survivors, 'custom-project-agent'].filter((name) => !fs.existsSync(path.join(memoryDir(name), 'MEMORY.md'))), [], 'AC-19: live agents\' memory - a name retired then live again included - and unrelated memory stay');
  assert.deepStrictEqual([first.report.rewritten, fs.readFileSync(path.join(root, '.asd/project/commands.yaml'), 'utf8')], [['.asd/project/commands.yaml'], commands(NEW)], 'AC-33: only the designmd-install value changes, quoting and neighbours intact');

  const second = await runMigration1450(root);
  assert.deepStrictEqual([second.report.deleted, second.report.rewritten, second.report.unchanged], [[], [], ['.asd/project/commands.yaml']], 'a re-run deletes and rewrites nothing');
  assert.deepStrictEqual([...second.report.missing].sort(), gone.map((name) => `.claude/agent-memory/${name}`).sort(), 'a directory already gone is reported missing, never an error');

  for (const [label, text] of [['a customised value', commands(`${OLD} --save`)], ['a commented-out old value', `build: "x"\n  # designmd-install: "${OLD}"\n`], ['an empty value', commands('')]]) {
    writeFile(root, '.asd/project/commands.yaml', text);
    const left = await runMigration1450(root);
    assert.deepStrictEqual([left.report.rewritten, fs.readFileSync(path.join(root, '.asd/project/commands.yaml'), 'utf8')], [[], text], `AC-33: ${label} is left as the consumer wrote it`);
  }
  fs.rmSync(path.join(root, '.asd', 'project'), { recursive: true });
  assert.ok((await runMigration1450(root)).report.missing.includes('.asd/project/commands.yaml'), 'an absent commands.yaml is reported missing');

  const bare = makeMigrationFixtureRepo();
  writeFile(bare, '.claude/agent-memory/asd-pm/MEMORY.md', '# memory\n');
  const guarded = await runMigration1450(bare);
  assert.deepStrictEqual([guarded.report.deleted, fs.existsSync(path.join(bare, '.claude/agent-memory/asd-pm/MEMORY.md')), /agents is missing/.test(guarded.output)], [[], true, true], 'with no canonical agents directory no live name can be known, so nothing is deleted and the migration warns');

  const broken = makeMigrationFixtureRepo();
  writeFile(broken, '.asd/agents/asd-dev.md', '---\n{ not json\n---\nbody\n');
  writeFile(broken, '.claude/agent-memory/asd-pm/MEMORY.md', '# memory\n');
  const unparsable = await runMigration1450(broken);
  assert.deepStrictEqual([unparsable.report.deleted, fs.existsSync(path.join(broken, '.claude/agent-memory/asd-pm/MEMORY.md')), /asd-dev\.md: frontmatter unparsable/.test(unparsable.output)], [[], true, true], 'AC-19: an agent whose frontmatter fails to parse has unknown variants, so nothing is deleted and the migration names the file');
});
