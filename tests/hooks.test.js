'use strict';

// SessionStart hook output

const { assert, fs, path, execFileSync, sync, runtime, REPO_ROOT, test, mkTempDir, writeFile, readWorkflowDefinitions, readRepoFile, disabledAttributionRepo } = require('./lib.js');

/** Installs a copy of the SessionStart hook plus every workflow definition it reads its chain from into a temp repo root, so a run never sees the live sprint. */
function installHook(tempRoot) {
  writeFile(tempRoot, '.asd/hooks/session-start.js', readRepoFile('.asd/hooks/session-start.js'));
  for (const file of fs.readdirSync(path.join(REPO_ROOT, '.asd/workflows')).filter((name) => name.endsWith('.json'))) {
    writeFile(tempRoot, `.asd/workflows/${file}`, readRepoFile(`.asd/workflows/${file}`));
  }
}

/** Runs a copy of the hook in a temp repo holding one fixture sprint, so the output never depends on the live sprint - whose branch name may itself contain `/asd-sprint`. */
function runHook(provider) {
  const tempRoot = mkTempDir();
  installHook(tempRoot);
  writeFile(tempRoot, '.asd/sprints/999-fixture/state.json', JSON.stringify({ sprint_id: '999-fixture', phase: 'impl', branch: 'feat/999-fixture' }));
  const out = execFileSync('node', [path.join(tempRoot, '.asd/hooks/session-start.js'), '--provider', provider], {
    cwd: tempRoot,
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
  installHook(tempRoot);
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

  const degraded = mkTempDir();
  installHook(degraded);
  const archived = { '780-stale': { phase: 'bogus' }, '781-unknown': { workflow: 'nope', phase: 'impl' }, '782-unknown-done': { workflow: 'nope', phase: 'done' } };
  for (const [id, fields] of Object.entries(archived)) writeFile(degraded, `.asd/sprints/archived/${id}/state.json`, JSON.stringify({ sprint_id: id, ...fields }));
  const text = JSON.parse(execFileSync('node', [path.join(degraded, '.asd/hooks/session-start.js'), '--provider', 'codex'], { cwd: degraded, encoding: 'utf8' })).hookSpecificOutput.additionalContext;
  assert.deepStrictEqual(Object.keys(archived).filter((id) => text.includes(id)), ['781-unknown'], `sprint-lifecycle.md "State recovery": an archived sprint is recovered only while non-done - a phase outside its resolved chain is not active, and an unresolvable definition drops only the chain check, never the done check (got: ${text})`);
});

test('SessionStart hook: a "skipped: <predicate>" verdict counts as satisfied, not "mixed"', () => {
  // A fresh temp repo with its own copy of the hook, so resolveRepoRoot's
  // findUp(__dirname) walks up from the temp script location and finds this
  // temp .asd/ - never the real repo's own active sprint state.
  const tempRoot = mkTempDir();
  installHook(tempRoot);
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
  installHook(tempRoot);
  for (const external of ['APPROVE (skipped: codex quota exhausted)', 'APPROVE (partial: 25/40 files; codex timeout)']) {
    writeFile(tempRoot, '.asd/sprints/999-fixture/state.json', JSON.stringify({
      sprint_id: '999-fixture',
      phase: 'impl-review',
      branch: 'feat/999-fixture',
      reviews: { impl: { iteration: 1, verdicts: { 'iter-01': { quality: 'APPROVE', external } } } },
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
  installHook(tempRoot);
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

test('sprint-017 AC-6 (D3/D10): SessionStart reads the current review wave\'s node and the legacy flat reviews.impl alike, picks the highest iteration numerically, shows wave K/n only past one wave, and never throws on a malformed wave shape', () => {
  const tempRoot = mkTempDir();
  installHook(tempRoot);
  const hook = (impl) => {
    writeFile(tempRoot, '.asd/sprints/999-fixture/state.json', JSON.stringify({ sprint_id: '999-fixture', phase: 'impl-review', branch: 'feat/999-fixture', reviews: { design: { iteration: 0, verdicts: {} }, impl } }));
    const out = execFileSync('node', [path.join(tempRoot, '.asd/hooks/session-start.js'), '--provider', 'claude'], { cwd: tempRoot, encoding: 'utf8' });
    return JSON.parse(out).hookSpecificOutput.additionalContext;
  };
  const node = (iteration, verdicts) => ({ iteration, verdicts, iteration_heads: {}, latched: {} });
  const seed = JSON.parse(readRepoFile('.asd/templates/t_state.json')).reviews.impl;

  assert.ok(hook(seed).includes('Phase: impl-review (iter 0)'), `the t_state.json seed is one wave, so it must read as the unchanged single-wave text, got: ${hook(seed)}`);
  const waves = { wave: 2, waves: [node(3, { 'iter-03': { quality: 'APPROVE' } }), node(2, { 'iter-01': { quality: 'FAIL' }, 'iter-02': { quality: 'CONCERNS' } })] };
  const multi = hook(waves);
  assert.ok(multi.includes('Phase: impl-review (wave 2/2, iter 2)') && multi.includes('Last review verdict: yellow'), `past one wave the summary names the current wave and reads that wave's own counter and latest verdicts, never wave 1's, got: ${multi}`);
  const legacy = hook(node(2, { 'iter-01': { quality: 'FAIL' }, 'iter-02': { quality: 'APPROVE' } }));
  assert.ok(legacy.includes('Phase: impl-review (iter 2)') && legacy.includes('Last review verdict: green'), `AC-6: a pre-wave flat reviews.impl reads as one wave, got: ${legacy}`);
  const numeric = hook(node(100, { 'iter-99': { quality: 'FAIL' }, 'iter-100': { quality: 'APPROVE' } }));
  assert.ok(numeric.includes('Last review verdict: green'), `iter-100 is later than iter-99 - a lexical sort reads iter-99's FAIL as the latest verdict, got: ${numeric}`);

  for (const malformed of [{ wave: 7, waves: [node(1, {})] }, { wave: 1, waves: [null] }, { wave: 1, waves: 'x' }, { waves: [] }, [], 'x', null]) {
    let text;
    assert.doesNotThrow(() => { text = hook(malformed); }, `malformed reviews.impl ${JSON.stringify(malformed)} must never make the hook exit non-zero`);
    assert.ok(text.includes('Active sprint: 999-fixture'), `malformed reviews.impl ${JSON.stringify(malformed)} must still print the summary, got: ${text}`);
  }
});

test('sprint-017 (COR-6): outside a review phase, SessionStart prefers the impl-review wave node over design\'s once any wave has iterated, and design\'s own node otherwise, rather than comparing per-wave counters directly', () => {
  const tempRoot = mkTempDir();
  installHook(tempRoot);
  const node = (iteration, verdicts) => ({ iteration, verdicts, iteration_heads: {}, latched: {} });
  const summaryFor = (phase, reviews) => {
    writeFile(tempRoot, '.asd/sprints/999-fixture/state.json', JSON.stringify({ sprint_id: '999-fixture', phase, branch: 'feat/999-fixture', reviews }));
    const out = execFileSync('node', [path.join(tempRoot, '.asd/hooks/session-start.js'), '--provider', 'claude'], { cwd: tempRoot, encoding: 'utf8' });
    return JSON.parse(out).hookSpecificOutput.additionalContext;
  };

  const beforeAnyWave = summaryFor('impl', { design: node(2, { 'iter-02': { quality: 'APPROVE' } }), impl: { wave: 1, waves: [node(0, {})] } });
  assert.ok(beforeAnyWave.includes('Last review verdict: green'), `COR-6: no impl wave has iterated yet, so an impl-phase summary must still read design's own verdict, got: ${beforeAnyWave}`);

  const afterWaveIterated = summaryFor('impl', { design: node(2, { 'iter-02': { quality: 'APPROVE' } }), impl: { wave: 2, waves: [node(3, { 'iter-03': { quality: 'APPROVE' } }), node(1, { 'iter-01': { quality: 'CONCERNS' } })] } });
  assert.ok(afterWaveIterated.includes('Last review verdict: yellow'), `COR-6: once any wave has iterated, an impl-phase summary must prefer the impl wave node over design's - comparing counters directly would compare wave 2's iteration 1 to design's iteration 2 and wrongly pick design's green, got: ${afterWaveIterated}`);
});

test('sprint-021 AC-3 (D3), sprint-022 AC-3: SessionStart reports "Next phase: done" for a merged-unclosed sprint read offline - phase pr, a PR number, and a checked-out branch other than the sprint\'s - legacy closure-pending included, and degrades to await-merge on the sprint branch, a detached HEAD or a worktree .git file', () => {
  const sprintBranch = 'sprint/999-fixture';
  const nextFor = (pr, git) => {
    const tempRoot = mkTempDir();
    installHook(tempRoot);
    writeFile(tempRoot, '.asd/sprints/999-fixture/state.json', JSON.stringify({ sprint_id: '999-fixture', phase: 'pr', branch: sprintBranch, pr }));
    if (git.head !== undefined) writeFile(tempRoot, '.git/HEAD', git.head);
    if (git.file !== undefined) writeFile(tempRoot, '.git', git.file);
    const out = execFileSync('node', [path.join(tempRoot, '.asd/hooks/session-start.js'), '--provider', 'claude'], { cwd: tempRoot, encoding: 'utf8' });
    return (/Next phase: (\S+)/.exec(JSON.parse(out).hookSpecificOutput.additionalContext) || [])[1];
  };
  const onBase = { head: 'ref: refs/heads/main\n' };
  const cases = [
    ['merged, back on the base branch', { number: 7, state: 'open' }, onBase, 'done'],
    ['legacy closure-pending with a PR number (D2)', { number: 7, state: 'closure-pending' }, onBase, 'done'],
    ['PR open, still on the sprint branch', { number: 7, state: 'open' }, { head: `ref: refs/heads/${sprintBranch}\n` }, 'await-merge'],
    ['no PR number yet', { state: 'open' }, onBase, 'await-merge'],
    ['detached HEAD', { number: 7, state: 'open' }, { head: `${'a'.repeat(40)}\n` }, 'await-merge'],
    ['worktree .git file', { number: 7, state: 'open' }, { file: 'gitdir: /elsewhere/.git/worktrees/x\n' }, 'await-merge'],
  ];
  for (const [label, pr, git, expected] of cases) {
    let next;
    assert.doesNotThrow(() => { next = nextFor(pr, git); }, `${label}: the hook must exit 0 on any .git shape - it fails silently by design`);
    assert.strictEqual(next, expected, `${label}: merged-unclosed is phase pr + pr.number + a readable current branch other than state.branch (sprint-lifecycle.md "PR phase"); any shape the hook cannot read offline degrades to await-merge, never a false done; merged-unclosed reports done, pr merge mode's terminal exit (sprint-022 AC-3)`);
  }
});

test('AC-21: SessionStart reports "Next phase: await-merge" for an ordinary pr phase without pr.state', () => {
  const tempRoot = mkTempDir();
  installHook(tempRoot);
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
    installHook(tempRoot);
    writeFile(tempRoot, '.asd/sprints/999-fixture/state.json', JSON.stringify({ sprint_id: '999-fixture', phase, branch: 'sprint/999-fixture', ...fields }));
    const out = execFileSync('node', [path.join(tempRoot, '.asd/hooks/session-start.js'), '--provider', 'claude'], { cwd: tempRoot, encoding: 'utf8' });
    const next = /Next phase: (\S+)/.exec(JSON.parse(out).hookSpecificOutput.additionalContext);
    return label([phase, fields, next ? next[1] : '<no Next phase line>']);
  });

  assert.deepStrictEqual(observed, cases.map(label), 'the session hook must agree with the audit exit (sprint-lifecycle.md "Design/design-review/design-promote collapse"): plan only when every frozen design document is a bare false, whatever a legacy skip_design_phases says, and only while phase is audit - any other phase keeps its successor in the standard definition');
});

test('sprint-020 AC-1/AC-6: SessionStart takes its chain from the frozen workflow definition - an absent workflow reads standard, every phase of every definition reports its successor, the design collapse moves only a chain holding design, and a missing, unknown, invalid or malformed definition drops the Next phase line with exit 0 and the summary intact', () => {
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

  const observed = cases.map(([fields, overrides, withDefinitions]) => {
    const tempRoot = mkTempDir();
    if (withDefinitions) installHook(tempRoot);
    else writeFile(tempRoot, '.asd/hooks/session-start.js', readRepoFile('.asd/hooks/session-start.js'));
    for (const [name, text] of Object.entries(overrides)) writeFile(tempRoot, `.asd/workflows/${name}.json`, text);
    writeFile(tempRoot, '.asd/sprints/999-fixture/state.json', JSON.stringify({ sprint_id: '999-fixture', branch: 'sprint/999-fixture', ...fields }));
    let out;
    try {
      out = execFileSync('node', [path.join(tempRoot, '.asd/hooks/session-start.js'), '--provider', 'claude'], { cwd: tempRoot, encoding: 'utf8' });
    } catch (error) {
      return label([fields, overrides, withDefinitions, `exit ${error.status}`]);
    }
    const text = JSON.parse(out).hookSpecificOutput.additionalContext;
    const next = /Next phase: (\S+)/.exec(text);
    return label([fields, overrides, withDefinitions, !text.includes('Active sprint: 999-fixture') ? `<no summary: ${text}>` : next ? next[1] : none]);
  });

  assert.deepStrictEqual(observed, cases.map(label), 'sprint-lifecycle.md "Workflows": the hook resolves .asd/workflows/<state.workflow || standard>.json and shows the successor in its phases - a sprint in flight before this field (sprint 020 itself) must still resolve standard, a lite sprint must never be told its next phase is a standard one, the collapse to plan is derived from a chain that holds design and never applied to one without it, and any unreadable definition must degrade to no chain info rather than a wrong phase, a throw or a lost summary (hooks must never block a session)');
});

test('sprint-028 AC-20 (D14): SessionStart reads an absent documents.design_system as the ux_spec value - a group frozen before the key existed collapses and expands the design block exactly as before - and an explicit design_system always counts', () => {
  const allOff = { prd: false, ux_spec: false, adr: false, c4: false };
  const cases = [
    ['absent design_system, every other document off', allOff, 'plan'],
    ['absent design_system, ux_spec on', { ...allOff, ux_spec: true }, 'design'],
    ['absent design_system, ux_spec absent', { prd: false, adr: false, c4: false }, 'design'],
    ['explicit design_system on, every other document off', { ...allOff, design_system: true }, 'design'],
    ['explicit design_system off, every document off', { ...allOff, design_system: false }, 'plan'],
    ['explicit design_system off, ux_spec on', { ...allOff, ux_spec: true, design_system: false }, 'design'],
  ];
  const observed = cases.map(([label, documents]) => {
    const tempRoot = mkTempDir();
    installHook(tempRoot);
    writeFile(tempRoot, '.asd/sprints/999-fixture/state.json', JSON.stringify({ sprint_id: '999-fixture', phase: 'audit', branch: 'sprint/999-fixture', documents }));
    const out = execFileSync('node', [path.join(tempRoot, '.asd/hooks/session-start.js'), '--provider', 'claude'], { cwd: tempRoot, encoding: 'utf8' });
    const next = /Next phase: (\S+)/.exec(JSON.parse(out).hookSpecificOutput.additionalContext);
    return `${label} -> ${next ? next[1] : '<no Next phase line>'}`;
  });
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
