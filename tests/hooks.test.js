'use strict';

// SessionStart hook output

const { assert, fs, path, execFileAsync, REPO_ROOT, test, mkTempDir, writeFile, readWorkflowDefinitions, readRepoFile, disabledAttributionRepo } = require('./lib.js');

const HOOK_REL = '.asd/hooks/session-start.js';

/** Installs a copy of the SessionStart hook plus every workflow definition it reads its chain from into a temp repo root, so a run never sees the live sprint. */
function installHook(tempRoot) {
  writeFile(tempRoot, HOOK_REL, readRepoFile(HOOK_REL));
  for (const file of fs.readdirSync(path.join(REPO_ROOT, '.asd/workflows')).filter((name) => name.endsWith('.json'))) {
    writeFile(tempRoot, `.asd/workflows/${file}`, readRepoFile(`.asd/workflows/${file}`));
  }
}

/** Runs a copy of the hook in a fresh temp repo root holding `sprints` (id to state object, or raw text) so the output never depends on the live sprint - whose branch name may itself contain `/asd-sprint` - and resolves its `additionalContext`. `git` writes a `.git/HEAD` or a `.git` file, `workflows` adds or overrides a definition, `definitions: false` installs the hook alone. Independent runs overlap under `Promise.all`; a non-zero exit rejects with its `code`. */
async function hookContext(sprints, { provider = 'claude', git = {}, workflows = {}, definitions = true } = {}) {
  const tempRoot = mkTempDir();
  if (definitions) installHook(tempRoot);
  else writeFile(tempRoot, HOOK_REL, readRepoFile(HOOK_REL));
  for (const [rel, state] of Object.entries(sprints)) writeFile(tempRoot, `.asd/sprints/${rel}/state.json`, typeof state === 'string' ? state : JSON.stringify(state));
  for (const [name, text] of Object.entries(workflows)) writeFile(tempRoot, `.asd/workflows/${name}.json`, text);
  if (git.head !== undefined) writeFile(tempRoot, '.git/HEAD', git.head);
  if (git.file !== undefined) writeFile(tempRoot, '.git', git.file);
  const { stdout } = await execFileAsync('node', [path.join(tempRoot, HOOK_REL), '--provider', provider], { cwd: tempRoot, encoding: 'utf8' });
  return JSON.parse(stdout).hookSpecificOutput.additionalContext;
}

const FIXTURE_SPRINT = '999-fixture';

/** One fixture sprint's state in `phase`, on a feature branch unless `fields` say otherwise. */
function fixtureState(phase, fields = {}) {
  return { sprint_id: FIXTURE_SPRINT, phase, branch: `feat/${FIXTURE_SPRINT}`, ...fields };
}

/** The `Next phase:` value a summary prints, or undefined when it prints none. */
function nextPhaseOf(text) {
  return (/Next phase: (\S+)/.exec(text) || [])[1];
}

test('SessionStart hook: the skill form follows the provider - Claude gets /asd-*, Codex gets $asd-* and never a Claude-only slash command', async () => {
  const [claude, codex] = await Promise.all([hookContext({ [FIXTURE_SPRINT]: fixtureState('impl') }), hookContext({ [FIXTURE_SPRINT]: fixtureState('impl') }, { provider: 'codex' })]);
  assert.ok(claude.includes('/asd-sprint'), 'Claude Code has no $skill form - must see /asd-sprint');
  assert.ok(!claude.includes('$asd-sprint'));
  assert.ok(codex.includes('$asd-sprint'), 'Codex has no /asd-sprint slash command - must see $asd-sprint');
  assert.ok(!codex.includes('/asd-sprint'));
});

test('AC-2/4/5/6/7: SessionStart recovers only archived active sprints and reports conflicts', async () => {
  const archivedSprints = {
    'archived/777-open': { sprint_id: '777-open', phase: 'pr', branch: 'sprint/777-open' },
    'archived/778-done': { sprint_id: '778-done', phase: 'done', branch: 'sprint/778-done' },
    'archived/779-bad': '{',
  };
  const degraded = { '780-stale': { phase: 'bogus' }, '781-unknown': { workflow: 'nope', phase: 'impl' }, '782-unknown-done': { workflow: 'nope', phase: 'done' } };
  const [recovered, conflict, degradedText] = await Promise.all([
    hookContext(archivedSprints, { provider: 'codex' }),
    hookContext({ ...archivedSprints, '111-current': { sprint_id: '111-current', phase: 'impl', branch: 'sprint/111-current' } }, { provider: 'codex' }),
    hookContext(Object.fromEntries(Object.entries(degraded).map(([id, fields]) => [`archived/${id}`, { sprint_id: id, ...fields }])), { provider: 'codex' }),
  ]);
  assert.ok(recovered.includes('Active sprint: 777-open'), `expected archived non-done sprint, got: ${recovered}`);
  assert.ok(!recovered.includes('778-done') && !recovered.includes('779-bad'));
  assert.ok(conflict.includes('WARNING: multiple active sprints found (111-current, 777-open)'), `expected active/archive conflict warning, got: ${conflict}`);
  assert.deepStrictEqual(Object.keys(degraded).filter((id) => degradedText.includes(id)), ['781-unknown'], `sprint-lifecycle.md "State recovery": an archived sprint is recovered only while non-done - a phase outside its resolved chain is not active, and an unresolvable definition drops only the chain check, never the done check (got: ${degradedText})`);
});

test('SessionStart hook: a verdict map reads "green" when each verdict is an approval, a "skipped: <predicate>", an availability skip or a partial, and "mixed" when only legacy skips are in it', async () => {
  const verdicts = (map) => ({ [FIXTURE_SPRINT]: fixtureState('impl-review', { reviews: { impl: { iteration: 1, verdicts: { 'iter-01': map } } } }) });
  const legacySkips = { ui: 'skipped: no UI surface in scope', performance: 'skipped: no perf budgets section and no executable file in scope' };
  const externals = ['APPROVE (skipped: codex quota exhausted)', 'APPROVE (partial: 25/40 files; codex timeout)'];
  const [predicate, allLegacy, ...external] = await Promise.all([
    hookContext(verdicts({ quality: 'APPROVE', ...legacySkips })),
    hookContext(verdicts(legacySkips)),
    ...externals.map((value) => hookContext(verdicts({ quality: 'APPROVE', external: value }))),
  ]);
  assert.ok(predicate.includes('Last review verdict: green'), `expected an all-satisfied verdict map (APPROVE + skipped) to print "green", got: ${predicate}`);
  externals.forEach((value, index) => assert.ok(external[index].includes('Last review verdict: green'), `External Review's "${value}" must count as satisfied (sprint-lifecycle.md "State recovery"), got: ${external[index]}`));
  assert.ok(allLegacy.includes('Last review verdict: mixed'), `an all-legacy-skip verdict map with no genuine approval must read "mixed", got: ${allLegacy}`);
});

test('sprint-017 AC-6 (D3/D10): SessionStart reads the current review wave\'s node and the legacy flat reviews.impl alike, picks the highest iteration numerically, shows wave K/n only past one wave, and never throws on a malformed wave shape', async () => {
  const hook = (impl) => hookContext({ [FIXTURE_SPRINT]: fixtureState('impl-review', { reviews: { design: { iteration: 0, verdicts: {} }, impl } }) });
  const node = (iteration, verdicts) => ({ iteration, verdicts, iteration_heads: {}, latched: {} });
  const seed = JSON.parse(readRepoFile('.asd/templates/t_state.json')).reviews.impl;
  const waves = { wave: 2, waves: [node(3, { 'iter-03': { quality: 'APPROVE' } }), node(2, { 'iter-01': { quality: 'FAIL' }, 'iter-02': { quality: 'CONCERNS' } })] };
  const malformed = [{ wave: 7, waves: [node(1, {})] }, { wave: 1, waves: [null] }, { wave: 1, waves: 'x' }, { waves: [] }, [], 'x', null];

  const [single, multi, legacy, numeric, ...broken] = await Promise.all([
    hook(seed),
    hook(waves),
    hook(node(2, { 'iter-01': { quality: 'FAIL' }, 'iter-02': { quality: 'APPROVE' } })),
    hook(node(100, { 'iter-99': { quality: 'FAIL' }, 'iter-100': { quality: 'APPROVE' } })),
    ...malformed.map((impl) => hook(impl).catch((error) => `exit ${error.code}`)),
  ]);
  assert.ok(single.includes('Phase: impl-review (iter 0)'), `the t_state.json seed is one wave, so it must read as the unchanged single-wave text, got: ${single}`);
  assert.ok(multi.includes('Phase: impl-review (wave 2/2, iter 2)') && multi.includes('Last review verdict: yellow'), `past one wave the summary names the current wave and reads that wave's own counter and latest verdicts, never wave 1's, got: ${multi}`);
  assert.ok(legacy.includes('Phase: impl-review (iter 2)') && legacy.includes('Last review verdict: green'), `AC-6: a pre-wave flat reviews.impl reads as one wave, got: ${legacy}`);
  assert.ok(numeric.includes('Last review verdict: green'), `iter-100 is later than iter-99 - a lexical sort reads iter-99's FAIL as the latest verdict, got: ${numeric}`);
  malformed.forEach((impl, index) => assert.ok(broken[index].includes('Active sprint: 999-fixture'), `malformed reviews.impl ${JSON.stringify(impl)} must never make the hook exit non-zero and must still print the summary, got: ${broken[index]}`));
});

test('sprint-017 (COR-6): outside a review phase, SessionStart prefers the impl-review wave node over design\'s once any wave has iterated, and design\'s own node otherwise, rather than comparing per-wave counters directly', async () => {
  const node = (iteration, verdicts) => ({ iteration, verdicts, iteration_heads: {}, latched: {} });
  const summaryFor = (phase, reviews) => hookContext({ [FIXTURE_SPRINT]: fixtureState(phase, { reviews }) });
  const [beforeAnyWave, afterWaveIterated] = await Promise.all([
    summaryFor('impl', { design: node(2, { 'iter-02': { quality: 'APPROVE' } }), impl: { wave: 1, waves: [node(0, {})] } }),
    summaryFor('impl', { design: node(2, { 'iter-02': { quality: 'APPROVE' } }), impl: { wave: 2, waves: [node(3, { 'iter-03': { quality: 'APPROVE' } }), node(1, { 'iter-01': { quality: 'CONCERNS' } })] } }),
  ]);
  assert.ok(beforeAnyWave.includes('Last review verdict: green'), `COR-6: no impl wave has iterated yet, so an impl-phase summary must still read design's own verdict, got: ${beforeAnyWave}`);
  assert.ok(afterWaveIterated.includes('Last review verdict: yellow'), `COR-6: once any wave has iterated, an impl-phase summary must prefer the impl wave node over design's - comparing counters directly would compare wave 2's iteration 1 to design's iteration 2 and wrongly pick design's green, got: ${afterWaveIterated}`);
});

test('sprint-021 AC-3 (D3), sprint-022 AC-3, AC-21: SessionStart reports "Next phase: done" for a merged-unclosed sprint read offline - phase pr, a PR number, and a checked-out branch other than the sprint\'s - legacy closure-pending included, and degrades to await-merge on the sprint branch, a detached HEAD, a worktree .git file or an ordinary pr phase without pr.state', async () => {
  const sprintBranch = 'sprint/999-fixture';
  const onBase = { head: 'ref: refs/heads/main\n' };
  const cases = [
    ['merged, back on the base branch', { number: 7, state: 'open' }, onBase, 'done'],
    ['legacy closure-pending with a PR number (D2)', { number: 7, state: 'closure-pending' }, onBase, 'done'],
    ['PR open, still on the sprint branch', { number: 7, state: 'open' }, { head: `ref: refs/heads/${sprintBranch}\n` }, 'await-merge'],
    ['no PR number yet', { state: 'open' }, onBase, 'await-merge'],
    ['detached HEAD', { number: 7, state: 'open' }, { head: `${'a'.repeat(40)}\n` }, 'await-merge'],
    ['worktree .git file', { number: 7, state: 'open' }, { file: 'gitdir: /elsewhere/.git/worktrees/x\n' }, 'await-merge'],
    ['AC-21: an ordinary pr phase with no pr.state', undefined, {}, 'await-merge'],
  ];
  const observed = await Promise.all(cases.map(async ([label, pr, git]) => {
    try {
      return nextPhaseOf(await hookContext({ [FIXTURE_SPRINT]: fixtureState('pr', { branch: sprintBranch, ...(pr === undefined ? {} : { pr }) }) }, { git }));
    } catch (error) {
      return `${label}: the hook must exit 0 on any .git shape - it fails silently by design (exit ${error.code})`;
    }
  }));
  cases.forEach(([label, , , expected], index) => assert.strictEqual(observed[index], expected, `${label}: merged-unclosed is phase pr + pr.number + a readable current branch other than state.branch (sprint-lifecycle.md "PR phase"); any shape the hook cannot read offline degrades to await-merge, never a false done; merged-unclosed reports done, pr merge mode's terminal exit (sprint-022 AC-3)`));
});

test('sprint-013 AC-14: SessionStart reports "Next phase: plan" after audit exactly when every frozen design document is the boolean false - a legacy skip_design_phases moves nothing, a document true, absent or unseeded falls back to design, a non-object documents value never breaks the hook, and no other phase moves', async () => {
  const template = JSON.parse(readRepoFile('.asd/templates/t_state.json'));
  const designDocs = Object.keys(template.documents || {}).filter((name) => name !== 'audit');
  assert.ok(designDocs.length >= 4, `t_state.json "documents" must still freeze the design documents the collapse test reads - only [${designDocs.join(', ')}] found, so the cases below assert nothing`);
  const off = Object.fromEntries(designDocs.map((name) => [name, false]));
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

  const observed = await Promise.all(cases.map(async ([phase, fields]) => {
    const next = nextPhaseOf(await hookContext({ [FIXTURE_SPRINT]: fixtureState(phase, { branch: 'sprint/999-fixture', ...fields }) }));
    return label([phase, fields, next || '<no Next phase line>']);
  }));

  assert.deepStrictEqual(observed, cases.map(label), 'the session hook must agree with the audit exit (sprint-lifecycle.md "Design/design-review/design-promote collapse"): plan only when every frozen design document is a bare false, whatever a legacy skip_design_phases says, and only while phase is audit - any other phase keeps its successor in the standard definition');
});

test('sprint-020 AC-1/AC-6: SessionStart takes its chain from the frozen workflow definition - an absent workflow reads standard, every phase of every definition reports its successor, the design collapse moves only a chain holding design, and a missing, unknown, invalid or malformed definition drops the Next phase line with exit 0 and the summary intact', async () => {
  const definitions = readWorkflowDefinitions();
  const off = Object.fromEntries(Object.keys(JSON.parse(readRepoFile('.asd/templates/t_state.json')).documents).filter((name) => name !== 'audit').map((name) => [name, false]));
  const none = '<no Next phase line>';
  const cases = [];
  for (const { name, phases } of definitions) {
    phases.slice(0, -1).forEach((phase, index) => {
      cases.push([{ phase, workflow: name }, {}, true, phases[index + 1]]);
      if (name === 'standard') cases.push([{ phase }, {}, true, phases[index + 1]]);
    });
    if (!phases.includes('design')) cases.push([{ phase: 'audit', workflow: name, documents: off }, {}, true, phases[phases.indexOf('audit') + 1]]);
  }
  cases.push(
    [{ phase: 'audit', workflow: 'probe', documents: off }, { probe: JSON.stringify({ phases: ['scope', 'audit', 'impl', 'retro', 'pr'] }) }, true, 'impl'],
    [{ phase: 'audit', workflow: 'nope' }, {}, true, none],
    [{ phase: 'audit', workflow: 'Lite' }, {}, true, none],
    [{ phase: 'audit', workflow: '../workflows/lite' }, {}, true, none],
    [{ phase: 'audit', workflow: 'lite' }, { lite: '{' }, true, none],
    [{ phase: 'audit', workflow: 'lite' }, { lite: '{"phases":"scope"}' }, true, none],
    [{ phase: 'audit', workflow: 'lite' }, { lite: '{"phases":[1,2]}' }, true, none],
    [{ phase: 'audit' }, {}, false, none],
  );
  const label = ([fields, overrides, withDefinitions, next]) => `${JSON.stringify(fields)} ${JSON.stringify(overrides)}${withDefinitions ? '' : ' without definitions'} -> ${next}`;

  const observed = await Promise.all(cases.map(async ([fields, overrides, withDefinitions]) => {
    let text;
    try {
      text = await hookContext({ [FIXTURE_SPRINT]: { sprint_id: FIXTURE_SPRINT, branch: 'sprint/999-fixture', ...fields } }, { workflows: overrides, definitions: withDefinitions });
    } catch (error) {
      return label([fields, overrides, withDefinitions, `exit ${error.code}`]);
    }
    return label([fields, overrides, withDefinitions, !text.includes('Active sprint: 999-fixture') ? `<no summary: ${text}>` : nextPhaseOf(text) || none]);
  }));

  assert.deepStrictEqual(observed, cases.map(label), 'sprint-lifecycle.md "Workflows": the hook resolves .asd/workflows/<state.workflow || standard>.json and shows the successor in its phases - a sprint in flight before this field (sprint 020 itself) must still resolve standard, a lite sprint must never be told its next phase is a standard one, the collapse to plan is derived from a chain that holds design and never applied to one without it, and any unreadable definition must degrade to no chain info rather than a wrong phase, a throw or a lost summary (hooks must never block a session)');
});

test('sprint-028 AC-20 (D14): SessionStart reads an absent documents.design_system as the ux_spec value - a group frozen before the key existed collapses and expands the design block exactly as before - and an explicit design_system always counts', async () => {
  const allOff = { prd: false, ux_spec: false, adr: false, c4: false };
  const cases = [
    ['absent design_system, every other document off', allOff, 'plan'],
    ['absent design_system, ux_spec on', { ...allOff, ux_spec: true }, 'design'],
    ['absent design_system, ux_spec absent', { prd: false, adr: false, c4: false }, 'design'],
    ['explicit design_system on, every other document off', { ...allOff, design_system: true }, 'design'],
    ['explicit design_system off, every document off', { ...allOff, design_system: false }, 'plan'],
    ['explicit design_system off, ux_spec on', { ...allOff, ux_spec: true, design_system: false }, 'design'],
  ];
  const observed = await Promise.all(cases.map(async ([label, documents]) => {
    const next = nextPhaseOf(await hookContext({ [FIXTURE_SPRINT]: fixtureState('audit', { branch: 'sprint/999-fixture', documents }) }));
    return `${label} -> ${next || '<no Next phase line>'}`;
  }));
  assert.deepStrictEqual(observed, cases.map(([label, , next]) => `${label} -> ${next}`), 'the hook must agree with the audit exit: plan only when every frozen design document is a bare false, design_system falling back to ux_spec only while it is absent');
});

test('sprint-036 AC-16 (external 2): a startup check over a .claude junction writes nothing anywhere - not the file behind it, .asd/sync-state.json or the release manifest - and warns of the link', () => {
  const repo = disabledAttributionRepo({ includeCoAuthoredBy: true });
  const real = path.join(repo.root, 'claude-real');
  fs.renameSync(path.join(repo.root, '.claude'), real);
  fs.symlinkSync(real, path.join(repo.root, '.claude'), 'junction');
  const snapshot = () => [fs.readFileSync(path.join(real, 'settings.json'), 'utf8'), repo.read('.asd/sync-state.json'), repo.read('.asd/release-manifest.json'), fs.readdirSync(repo.root).sort(), fs.readdirSync(path.join(repo.root, '.asd')).sort()];
  const before = snapshot();

  const check = repo.check();

  assert.deepStrictEqual([check.status, check.stdout, check.stderr, snapshot()], [0, '', 'runtime: .claude/settings.json or its directory is a symlink or junction, left untouched\n', before], 'AC-16: the link is refused before any write, so no file of the repo changes');
});
