'use strict';

// runtime.js gate commands: commit and attribution checks, memory-check, retro intake, stubs, checks-wait, scratch-dir, design-tokens

const { assert, fs, path, execFileSync, spawnSync, sync, update, runtime, REPO_ROOT, tests, test, FIXTURE_ROOT, mkTempDir, loadManifest, makeMiniRepo, writeFile, runtimeCli, runtimeCliResult, runtimeCliResultAsync, sandboxGitRepo, sandboxGitRepoFrom, importCommits, execFileAsync, readRepoFile, canonText, headingBody, sectionOf, jsonOf, stepOf, spans, scriptedWait, RUNTIME_JS, runtimeSpawn, runtimeSpawnAsync, disabledAttributionRepo, OFF_VALUE, linkedLedgerCases, recordedOwnedKeys } = require('./lib.js');

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
  assert.ok(jsonOf('.asd/workflows/asd-phase-impl-test.md', 'Entry').modes.resume.includes('interrupted current entry') && stepOf(sectionOf('.asd/workflows/asd-phase-impl-test.md', 'Steps'), '1').includes('**Resume**'), 'COR-2: asd-phase-impl-test.md step 1, which reconstruction resumes through, must handle the interrupted current entry');
  const defectId = ids.find((id) => id.startsWith('D-'));
  const fixedStatus = /set the defect row `Status` to `([^`]+)`/.exec(canonText('.asd/workflows/asd-phase-impl.md'));
  assert.ok(defectId && fixedStatus, `COR-1: git-strategy.md "Commits" must list the D-N id and asd-phase-impl.md test-fix must name the Status it sets. Got: ${JSON.stringify(ids)}`);
  const defectSentence = failed.split(/(?<=\.) /).find((sentence) => sentence.includes(`\`${defectId}\``));
  const [defectLands = '', defectOtherwise = ''] = defectSentence ? defectSentence.slice(defectSentence.indexOf(`\`${defectId}\``)).split(/\botherwise\b/) : [];
  assert.ok(defectLands.includes('Defects') && defectLands.includes(`\`${fixedStatus[1]}\``), `COR-1: reconstruction must read a \`${defectId}\` trailer as landed only once its Defects row reads \`${fixedStatus[1]}\` - test-fix commits the fix before flipping the row, so a dispatch dying between them leaves the row pending`);
  assert.ok(/\bsha\b/.test(defectOtherwise) && /\b(?:no|never|not)\b[^.]*\bfix/.test(defectOtherwise), `COR-1: otherwise the re-dispatch must only set the \`${defectId}\` row from the trailer commit's sha, without a second fix`);
  const ledgerKey = /\bledger\.(\w+)\)\s*\?\s*ledger\.\1\b/.exec(canonText('.asd/runtime.js'));
  assert.ok(ledgerKey && ids.includes(ledgerKey[1]), `DOC-1: git-strategy.md "Commits" must define a review finding id as its id in the reviewer's ledger \`${ledgerKey && ledgerKey[1]}\` - undefined, a dev writes a trailer reconstruction cannot match. Got: ${JSON.stringify(ids)}`);
  assert.ok(ids.some((id) => /^[a-z-]+\.md [A-Z]+-\d+$/.test(id)), `DOC-1: git-strategy.md "Commits" must show a review finding id prefixed by its <reviewer>.md review file - each reviewer numbers its own findings, so a bare shared id reads another reviewer's fix as landed. Got: ${JSON.stringify(ids)}`);
  assert.ok(ids.includes('impl-review wave-<K>/iter-NN suite'), `sprint-017 D4: the impl-review suite trailer carries the iteration id, or two waves' iteration-NN suite fixes share one trailer. Got: ${JSON.stringify(ids)}`);
  const reviewFixPayload = (canonText('.asd/workflows/asd-phase-impl.md').split('\n').find((line) => line.includes('review-fix: grouped finding list')) || '').split(/;\s*test-fix\b/)[0].split('review-fix:')[1] || '';
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

const RETRO_BACKLOG = '.asd/project/retro-backlog.md';

/** A retrospective built from t_retrospective.html itself, so the parser is checked against the rows the retro phase emits. Rows are `[guardrail html, acts on, home]`; `actions: null` drops the Actions section (empty-log branch); `ids: false` writes legacy rows without `<tr id>`. */
function retroFixture({ actions, proposals, ids = true }) {
  let html = canonText('.asd/templates/t_retrospective.html');
  for (const [section, prefix, rows] of [['actions', 'A', actions], ['systemic-proposals', 'P', proposals]]) {
    const block = new RegExp(`<section id="${section}"[^>]*>[\\s\\S]*?</section>`).exec(html);
    assert.ok(block, `sanity: t_retrospective.html must keep its ${section} section`);
    const rowTemplate = new RegExp(`<tr id="${prefix}-1">.*</tr>`).exec(block[0]);
    assert.ok(rowTemplate, `sanity: t_retrospective.html's ${section} row must carry id="${prefix}-1"`);
    const body = (rows || []).map(([guardrail, actsOn, home], index) => rowTemplate[0].replace(` id="${prefix}-1"`, ids ? ` id="${prefix}-${index + 1}"` : '').replace(/\{\{([^}]*)\}\}/g, (_, inner) => (inner.includes('consumer | asd') ? actsOn : inner.includes('imperative line') ? guardrail : inner.includes('home per') ? home : '')));
    const filled = rows === null ? '' : block[0].replace(/<tbody>[\s\S]*?<\/tbody>/, () => `<tbody>\n${body.join('\n')}\n</tbody>`);
    html = html.replace(block[0], () => filled);
  }
  return html;
}

/** A project root holding `.asd/sprints/archived/<id>/{state.json, retrospective.html}` per `sprints` (`state` is raw state.json text) and, when `backlog` is given, `.asd/project/retro-backlog.md` built from t_retro-backlog.md plus those rows. */
function retroIntakeFixture(sprints, backlog) {
  const root = mkTempDir();
  fs.mkdirSync(path.join(root, '.asd/sprints'), { recursive: true });
  for (const [id, { state, retro }] of Object.entries(sprints)) {
    writeFile(root, `.asd/sprints/archived/${id}/state.json`, state);
    if (retro !== undefined) writeFile(root, `.asd/sprints/archived/${id}/retrospective.html`, retroFixture(retro));
  }
  if (backlog !== undefined) writeFile(root, RETRO_BACKLOG, canonText('.asd/templates/t_retro-backlog.md') + backlog.map((row) => `| ${row.join(' | ')} |\n`).join(''));
  const sprintsDir = path.join(root, '.asd/sprints');
  const backlogPath = path.join(root, RETRO_BACKLOG);
  const candidates = (selfHosting) => {
    try {
      return [...runtime.retroCandidates(sprintsDir, backlogPath, selfHosting)].sort((a, b) => a.row.localeCompare(b.row));
    } catch (error) {
      return `rejected: ${error.message}`;
    }
  };
  return { root, sprintsDir, backlogPath, candidates };
}

const DONE_STATE = JSON.stringify({ phase: 'done' });

const RETRO_016 = { actions: [['Deferred consumer action', 'consumer', 'h016A1']], proposals: [['Old proposal', 'asd', 'h016P1'], ['Deferred asd proposal', 'asd', 'h016P2']] };

const RETRO_017 = { actions: [['Included action', 'asd', 'h017A1'], ['covered by: <code>x.md</code> step 2', 'asd', 'h017A2'], ['Fresh consumer action', 'consumer', 'h017A3'], ['Deferred latest action', 'asd', 'h017A4']], proposals: [['Rejected proposal', 'asd', 'h017P1'], ['Fresh asd proposal', 'asd', 'h017P2'], ['Closed proposal', 'consumer', 'h017P3']] };

const INTAKE_SPRINTS = {
  '016-a': { state: DONE_STATE, retro: RETRO_016 },
  '017-b': { state: DONE_STATE, retro: RETRO_017 },
  '018-c': { state: DONE_STATE },
  '019-d': { state: JSON.stringify({ phase: 'pr' }), retro: { actions: null, proposals: [['Not closed yet', 'consumer', 'h019P1']] } },
};

const INTAKE_BACKLOG = [
  ['017-b#A-1', 'asd', 'included', '019-z', 'Included action'],
  ['017-b#P-1', 'asd', 'rejected', '019-z', 'Rejected proposal'],
  ['017-b#P-3', 'consumer', 'closed', '019-z', 'Closed proposal'],
  ['017-b#A-4', 'consumer', 'deferred', '019-z', 'Deferred latest action, as the backlog words it'],
  ['016-a#A-1', 'consumer', 'deferred', '019-z', 'Deferred consumer action'],
  ['016-a#P-2', 'asd', 'deferred', '019-z', 'Deferred asd proposal'],
  ['016-a#P-1', 'asd', 'included', '019-z', 'Old proposal'],
];

test('sprint-019 AC-7: retroRows reads the rows t_retrospective.html emits as A-N/P-N by 1-based ordinal - covered-by rows counted, legacy rows without <tr id> addressed identically - and fails closed on a declared id off its ordinal, a missing systemic table, an unknown Acts on or a reshaped row', () => {
  const rows = { actions: [['Use <code>git</code> &amp; stop', 'consumer', 'h1'], ['covered by: <code>x.md</code>', 'asd', 'h2'], ['Third', 'asd', 'h3']], proposals: [['Propose', 'asd', 'h4']] };
  const parsed = runtime.retroRows(retroFixture(rows));
  assert.deepStrictEqual(parsed.map((row) => row.id), ['A-1', 'A-2', 'A-3', 'P-1'], 'the covered-by row keeps its ordinal, so the row after it is A-3 - dropping it from the count would readdress every later row and the backlog would dispose the wrong one');
  assert.deepStrictEqual(parsed[0], { id: 'A-1', acts_on: 'consumer', guardrail: 'Use `git` & stop', home: 'h1' }, 'a guardrail keeps its code spans as backticks and decodes entities, so the backlog text and the retro text compare equal');
  assert.deepStrictEqual(runtime.retroRows(retroFixture({ ...rows, ids: false })), parsed, 'AC-7: a legacy retro without row ids derives the same ids from the same ordinal - one algorithm reads both');
  assert.deepStrictEqual(runtime.retroRows(retroFixture({ ...rows, actions: null })).map((row) => row.id), ['P-1'], 'the empty-log branch omits Actions, which is not an error');

  const rejection = (html) => {
    try {
      return `accepted: ${JSON.stringify(runtime.retroRows(html))}`;
    } catch (error) {
      return error.message;
    }
  };
  assert.match(rejection(retroFixture(rows).replace('<tr id="A-1">', '<tr id="A-2">')), /actions row 1 declares id A-2, expected A-1/, 'a declared id off its ordinal means rows were inserted or reordered - trusting either number disposes the wrong row');
  assert.match(rejection(retroFixture(rows).replace(/<section id="systemic-proposals"[^>]*>[\s\S]*?<\/section>/, '')), /no systemic-proposals section/, 'the systemic class ships on every branch, so its absence is a malformed retro, never an empty one');
  assert.match(rejection(retroFixture({ ...rows, proposals: [['Propose', 'both', 'h4']] })), /Acts on must be consumer or asd: both/, 'Acts on drives the consumer filter, so a value outside the English literals must fail rather than drop the row from both project types');
  assert.match(rejection(retroFixture(rows).replace('<td>h1</td>', '').replace(/<td><code>h1<\/code><\/td>/, '')), /has 3 cells, expected 4/, 'cells are read by position, so a row with a column missing must fail rather than read Home as Acts on');
});

test('sprint-019 AC-4: backlogRows parses the one backlog table t_retro-backlog.md ships - escaped pipes, a multi-span guardrail kept whole, a single code span unwrapped - and fails closed on anything off-template', () => {
  const template = canonText('.asd/templates/t_retro-backlog.md');
  assert.deepStrictEqual(runtime.backlogRows(template), [], 't_retro-backlog.md as shipped must parse to no rows - the orchestrator creates the backlog from it at the first intake write');
  const withRows = (...rows) => template + rows.map((row) => `| ${row.join(' | ')} |\n`).join('');
  assert.deepStrictEqual(runtime.backlogRows(withRows(['`016-a#P-2`', 'asd', 'deferred', '019-z', '`a` then `b` \\| `c`'])), [{ row: '016-a#P-2', acts_on: 'asd', disposition: 'deferred', decided_in: '019-z', guardrail: '`a` then `b` | `c`' }], 'a cell that is one code span is unwrapped; a guardrail that opens and closes with different code spans is kept whole (the shared tableCells once ate its outer backticks and returned "a` then `b` | `c") and `\\|` is a literal pipe');
  const valid = ['016-a#P-2', 'asd', 'deferred', '019-z', 'Text'];
  const cases = [
    ['an unknown disposition', withRows(['016-a#P-2', 'asd', 'maybe', '019-z', 'Text']), /Disposition must be one of deferred, included, rejected, closed: maybe/],
    ['an unknown acting side', withRows(['016-a#P-2', 'both', 'deferred', '019-z', 'Text']), /Acts on must be consumer or asd: both/],
    ['a repeated row', withRows(valid, valid), /Row invalid or repeated: 016-a#P-2/],
    ['an address off the <NNN-slug>#A-N/P-N form', withRows(['016-a#X-1', 'asd', 'deferred', '019-z', 'Text']), /Row invalid or repeated: 016-a#X-1/],
    ['a row with a cell missing', withRows(['016-a#P-2', 'asd', 'deferred', '019-z']), /row malformed/],
    ['a second table', withRows(valid) + '\n' + template.slice(template.indexOf('| Row |')), /exactly one .* table, found 2/],
    ['a broken separator', template.replace('|---|---|---|---|---|', '|---|---|'), /separator malformed/],
  ];
  for (const [label, text, expected] of cases) {
    assert.throws(() => runtime.backlogRows(text), expected, `${label} must fail closed - read leniently, a disposed row is offered again or a deferred one silently never is`);
  }
});

test('sprint-019 AC-1/AC-2/AC-5, sprint-023 AC-8: retroCandidates offers the latest done retro\'s undisposed rows plus every deferred backlog row, drops covered-by rows and - outside self-hosting - the deferred asd rows, keeps the latest retro\'s undisposed asd rows there tagged `upstream: true`, is [] with no prior retro, and fails closed on unreadable input; the CLI prints exactly that', () => {
  const fixture = retroIntakeFixture(INTAKE_SPRINTS, INTAKE_BACKLOG);
  const selfHosting = [
    { row: '016-a#A-1', acts_on: 'consumer', guardrail: 'Deferred consumer action', home: 'h016A1' },
    { row: '016-a#P-2', acts_on: 'asd', guardrail: 'Deferred asd proposal', home: 'h016P2' },
    { row: '017-b#A-3', acts_on: 'consumer', guardrail: 'Fresh consumer action', home: 'h017A3' },
    { row: '017-b#A-4', acts_on: 'asd', guardrail: 'Deferred latest action', home: 'h017A4' },
    { row: '017-b#P-2', acts_on: 'asd', guardrail: 'Fresh asd proposal', home: 'h017P2' },
  ];
  assert.deepStrictEqual(fixture.candidates(true), selfHosting, 'AC-1: 017-b is the latest archived sprint that is done AND has a retro (018-c has none, 019-d is not done); its included/rejected/closed rows and its covered-by row are not offered, its deferred row is offered once as its retrospective states it - Acts on and guardrail read from the retro, never from the backlog\'s human-readable copies, which this fixture words differently (Acts on consumer, extra text) so reading either from the backlog shows - and older deferred rows come back with their own retro\'s home');
  const upstreamProposal = { ...selfHosting[4], upstream: true };
  assert.deepStrictEqual(fixture.candidates(false), [...selfHosting.filter((candidate) => candidate.acts_on === 'consumer'), upstreamProposal], 'AC-2/sprint-023 AC-8: a consumer project gets its own rows, deferred ones included, plus the latest retro\'s undisposed asd row 017-b#P-2 tagged upstream: true - filtered on the retro\'s Acts on, so 017-b#A-4 (asd in its retro, consumer in the backlog copy, disposed) and the deferred asd row 016-a#P-2 stay out, and so does the covered-by asd row 017-b#A-2');
  fs.rmSync(fixture.backlogPath);
  assert.deepStrictEqual(fixture.candidates(true).map((candidate) => candidate.row), ['017-b#A-1', '017-b#A-3', '017-b#A-4', '017-b#P-1', '017-b#P-2', '017-b#P-3'], 'an absent backlog reads as empty - the first intake of a project offers every non-covered row of its latest retro');
  assert.deepStrictEqual(fixture.candidates(false).map((candidate) => [candidate.row, candidate.upstream === true]), [['017-b#A-1', true], ['017-b#A-3', false], ['017-b#A-4', true], ['017-b#P-1', true], ['017-b#P-2', true], ['017-b#P-3', false]], 'sprint-023 AC-8: outside self-hosting the first intake keeps the latest retro\'s asd rows as upstream proposals - tagged exactly the asd rows, never a consumer row');

  assert.deepStrictEqual(retroIntakeFixture({}, INTAKE_BACKLOG.filter(([, , disposition]) => disposition !== 'deferred')).candidates(true), [], 'AC-5: no archived sprint and nothing deferred is the silent no-op');
  assert.deepStrictEqual(retroIntakeFixture({ '019-d': INTAKE_SPRINTS['019-d'] }).candidates(true), [], 'AC-5: a retro whose sprint never reached done is not a prior retrospective');

  const failing = [
    ['a deferred row its retro does not hold', retroIntakeFixture(INTAKE_SPRINTS, [...INTAKE_BACKLOG, ['017-b#A-9', 'asd', 'deferred', '019-z', 'Ghost']]), /not in its retrospective: 017-b#A-9/],
    ['a malformed backlog', retroIntakeFixture(INTAKE_SPRINTS, [['017-b#A-1', 'asd', 'maybe', '019-z', 'Included action']]), /Disposition must be one of/],
    ['an unreadable state.json beside a retro', retroIntakeFixture({ ...INTAKE_SPRINTS, '020-e': { state: '{', retro: RETRO_016 } }, INTAKE_BACKLOG), /state\.json unreadable/],
  ];
  for (const [label, broken, expected] of failing) {
    assert.match(String(broken.candidates(true)), expected, `${label} must fail closed - an intake that skips what it cannot read offers nothing and the rows are lost to every later sprint`);
  }

  const cli = runtimeCliResult(['retro-candidates', '--self-hosting', '--sprints', fixture.sprintsDir, '--backlog', path.join(fixture.root, 'absent.md')]);
  assert.deepStrictEqual(cli, { status: 0, result: runtime.retroCandidates(fixture.sprintsDir, path.join(fixture.root, 'absent.md'), true) }, 'the CLI scope runs must print what the function returns, --self-hosting read as a boolean even before another flag');
  const consumerCli = runtimeCliResult(['retro-candidates', '--sprints', fixture.sprintsDir, '--backlog', path.join(fixture.root, 'absent.md')]).result;
  assert.deepStrictEqual(consumerCli, runtime.retroCandidates(fixture.sprintsDir, path.join(fixture.root, 'absent.md'), false), 'without --self-hosting the CLI prints the consumer-mode result');
  assert.ok(consumerCli.some((candidate) => candidate.acts_on === 'asd') && consumerCli.every((candidate) => (candidate.acts_on === 'asd') === (candidate.upstream === true)), `sprint-023 AC-8: without --self-hosting the CLI keeps the asd rows and tags exactly those upstream: true: ${JSON.stringify(consumerCli)}`);
  assert.ok(cli.result.every((candidate) => !('upstream' in candidate)), 'sprint-023 AC-8: with --self-hosting a row is a candidate of this project, so none carries the upstream tag');
  const missing = runtimeCliResult(['retro-candidates', '--sprints', fixture.sprintsDir]);
  assert.ok(missing.status === 2 && /--backlog <path> required/.test(missing.stderr), `a missing --backlog must exit 2, never read a default path: ${JSON.stringify(missing)}`);
});

test('sprint-019 AC-1/AC-3/AC-4/AC-5/AC-6, sprint-023 AC-8: scope step 2a runs retro intake by the command sprint-lifecycle.md "Retro intake" names - run as written from a project root it prints the candidates, and [] with no prior retro - and the home\'s failure, empty, resolved, disposition and upstream-row clauses and scope step 4\'s backlog write and upstream display each hold', () => {
  const step = stepOf(sectionOf('.asd/workflows/asd-phase-scope.md', 'Steps'), '2a');
  assert.ok(step.startsWith('2a. **Retro intake**') && !canonText('.asd/rules/sprint-lifecycle.md').includes('**Retro intake.**'), 'step 2a is the one home of retro intake since the Retro intake paragraph moved out of sprint-lifecycle.md (D9) - a second statement in the rule doc would be a second home');
  const command = /`(node \.asd\/runtime\.js retro-candidates [^`]+)`/.exec(step);
  assert.ok(command && step.includes('`--self-hosting`'), 'step 2a must name the literal command it runs and when it adds --self-hosting');
  const flags = (text) => [...text.matchAll(/--[a-z-]+/g)].map((match) => match[0]).sort();
  assert.deepStrictEqual(flags(`${command[1]} --self-hosting`), ['--backlog', '--self-hosting', '--sprints'], 'the intake command must name the flags the runtime CLI reads: the sprints dir, the backlog path and the self-hosting switch');

  const run = (root) => {
    const [, script, ...args] = `${command[1]} --self-hosting`.split(/\s+/);
    return execFileSync(process.execPath, [path.join(REPO_ROOT, script), ...args], { cwd: root, encoding: 'utf8', stdio: 'pipe' });
  };
  const fixture = retroIntakeFixture(INTAKE_SPRINTS, INTAKE_BACKLOG);
  const offered = JSON.parse(run(fixture.root));
  assert.deepStrictEqual(offered, runtime.retroCandidates(fixture.sprintsDir, fixture.backlogPath, true), 'the command as the workflow writes it, run from the project root, must reach the sprints and the backlog it names');
  const rowId = sectionOf('.asd/rules/sprint-lifecycle.md', 'Retro row ids');
  const prefix = (/`([^`]+:)`[^.]*\bEnglish\b/.exec(rowId.split(/(?<=\.)\s/).find((sentence) => /\bEnglish\b/.test(sentence)) || '') || [])[1];
  const covered = RETRO_017.actions.findIndex(([text]) => prefix && text.startsWith(prefix));
  assert.ok(covered >= 0 && !offered.some((candidate) => candidate.row === `017-b#A-${covered + 1}`), `sprint-019 74a25b1: "Retro row id" must name the covered-by prefix among its English literals, and it must be the one intake drops - a translated prefix offers covered rows as candidates (got ${JSON.stringify(prefix)})`);
  assert.strictEqual(run(retroIntakeFixture({}).root).trim(), '[]', 'AC-5: a project with no archived sprint and no backlog yet gets [] - the silent no-op');

  const intake = step;
  const sentences = intake.split(/(?<=\.)\s+|\n\s*- /);
  const sentenceWith = (pattern) => sentences.find((sentence) => pattern.test(sentence)) || '';
  const failed = sentenceWith(/non-zero exit/);
  assert.ok(/\bblocks\b/.test(failed) && /stderr/.test(failed) && /re-run/.test(failed) && /\bskip\b/.test(failed) && /decisions-log/.test(failed), 'sprint-019 TST-1-1: a failed retro-candidates run blocks intake and hands its stderr to the user - fix and re-run, or skip with one decisions-log line; unstated, the orchestrator reads a crash as [] and the rows are never offered');
  const empty = sentenceWith(/empty array/);
  assert.ok(/no question/.test(empty) && /no backlog write/.test(empty) && /decisions-log/.test(empty), 'sprint-019 TST-1-1/AC-5: an empty candidate list is a no-op - one decisions-log line, no question, no backlog write');
  const resolved = sentenceWith(/\bresolved\b/);
  assert.ok(resolved.includes('`closed`') && /step 4 gate with its evidence/.test(resolved) && /no question/.test(resolved), 'sprint-027 D1/AC-3: a candidate re-verification finds resolved is written closed and shown at the scope gate with its evidence, no question - asked, or silently dropped, a stale row is re-asked at each scope or its closure is unreviewable');
  const decisions = sentenceWith(/none by default/).split(/[:,]\s/);
  const decision = (stem) => decisions.find((clause) => new RegExp(`\\b${stem}`).test(clause)) || '';
  assert.ok(/one explicit choice/.test(sentenceWith(/none by default/)), 'sprint-027 D1: every row put to the user takes one explicit choice and none a default - a default disposition is chosen by nobody');
  assert.ok(decision('defer').includes('`deferred`') && decisions.some((clause) => /offered again at every later intake/.test(clause)), 'sprint-027 D1/AC-3: a deferred row is written deferred and offered again at every later intake - dropped, it is never written, and retroCandidates stops offering it once the next retro archives, so it is lost for good');
  assert.ok(decision('inclu').includes('`AC-N`'), 'sprint-019 TST-1-1/AC-3: an included row becomes an AC-N of this sprint');
  assert.ok(/never offered again/.test(decision('reject')), 'sprint-019 TST-1-1/AC-3: a rejected row is never offered again');

  const accept = stepOf(sectionOf('.asd/workflows/asd-phase-scope.md', 'Steps'), 4);
  assert.ok(accept.includes('is not accepted while a row, issue, PR or stub put to the user lacks a choice'), 'sprint-027 AC-1/sprint-029 AC-5: scope step 4 blocks the gate while a row or issue put to the user has no choice - unstated, an undecided row is silently disposed');
  assert.ok(headingBody('.asd/rules/checkpoints.md', 'Gate inventory').split('\n').some((row) => row.startsWith('| retro intake dispositions (') && row.includes('one explicit include/reject/defer per retro row, `asd-retro` issue or project issue put to the user')), 'sprint-027 AC-1/sprint-029 AC-5/sprint-034 AC-2: the gate inventory states the per-row-or-issue explicit choice, project issues included');
  assert.ok(canonText('.asd/templates/t_retro-backlog.md').includes('the user\'s explicit choice per row, never a default'), 'sprint-027 AC-1/AC-2: the backlog template states that deferred, included and rejected are explicit choices');
  const backlog = /--backlog (\S+)/.exec(command[1]);
  assert.ok(backlog && accept.includes(`\`${backlog[1]}\``) && /step 2a/.test(accept) && /dispositions/.test(accept), 'sprint-019 TST-1-1/AC-4: scope step 4 writes step 2a\'s dispositions to the backlog path step 2a reads - dropped, included and rejected rows come back at every scope; written elsewhere, the next intake never sees them');

  const proposal = runtime.retroCandidates(fixture.sprintsDir, fixture.backlogPath, false).find((candidate) => candidate.acts_on === 'asd');
  const tag = proposal && Object.keys(proposal).find((key) => !['row', 'acts_on', 'guardrail', 'home'].includes(key));
  assert.ok(tag, 'sprint-023 AC-8: sanity - outside self-hosting retroCandidates must return an asd row with a marker field beside row, acts_on, guardrail and home, or the rule and workflow cannot be compared with the tag it emits');
  const literal = `\`${tag}: true\``;
  assert.ok(empty.slice(0, empty.indexOf('decisions-log')).includes(literal), `sprint-023 AC-8: a list of only ${literal} rows has no candidate to decide, so the empty-array no-op must cover it, named before the no-op's outcome - otherwise a consumer project whose latest retro holds only asd rows is asked about proposals it cannot dispose (a later mention of the tag in the same sentence is not the trigger)`);
  const shown = sentences.find((sentence) => sentence.includes(literal) && /\bAC-N\b/.test(sentence)) || '';
  const noOp = intake.slice(intake.indexOf(empty), intake.indexOf(shown));
  assert.ok(/\bfor dispositions\b/.test(noOp) && !/\b(?:not|never)\b/.test(noOp), `sprint-023 review-fix F4: the no-op sentence must say it is a no-op for dispositions only - "no-op" alone reads as "show nothing" for the ${literal} rows, against scope step 4, which shows them`);
  assert.ok(/no question/.test(shown) && /\bbacklog\b/.test(shown), `sprint-023 AC-8: the sentence on a ${literal} row must say it is shown with no question, is never an AC-N and reaches no backlog - disposed like a candidate, it is either lost to the framework repo it addresses or re-asked at every scope`);
  assert.ok(step.includes(literal) && accept.includes(literal), `sprint-023 AC-8: scope steps 2a and 4 must name the ${literal} tag the runtime emits - step 2a exempts it from verification and step 4 shows it at the gate`);
});

test('sprint-019 AC-4: the live retro backlog parses, each row resolves to its archived retro row with the same Acts on and text, the 019 triage seed stands until a later sprint re-decides a row, /asd-update never manages the file, and live intake re-offers every deferred row and no disposed one', () => {
  const backlog = runtime.backlogRows(readRepoFile(RETRO_BACKLOG));
  assert.ok(backlog.length > 0, 'sanity: the backlog must hold the 019 seed');
  for (const entry of backlog) {
    const [sprint, id] = entry.row.split('#');
    const retro = path.join(REPO_ROOT, '.asd/sprints/archived', sprint, 'retrospective.html');
    const source = fs.existsSync(retro) ? runtime.retroRows(fs.readFileSync(retro, 'utf8')).find((row) => row.id === id) : undefined;
    assert.ok(source, `${entry.row} must address a row of an archived retrospective - an address nothing holds disposes nothing, and the real row is offered again`);
    assert.deepStrictEqual([entry.acts_on, entry.guardrail], [source.acts_on, source.guardrail], `${entry.row}: the backlog's Acts on and Guardrail are the retro row's own (t_retro-backlog.md) - a deferred row is re-offered with the backlog's copy, so a drifted copy offers a different finding`);
  }

  const seed = new Map(Object.entries({
    included: ['016-remove-terra-family#P-2', '017-review-waves#A-2', '017-review-waves#A-3', '017-review-waves#P-2', '018-agent-tool-permissions#A-1', '018-agent-tool-permissions#A-2', '018-agent-tool-permissions#A-3', '018-agent-tool-permissions#P-1', '018-agent-tool-permissions#P-2', '018-agent-tool-permissions#P-3'],
    deferred: ['016-remove-terra-family#P-1', '017-review-waves#P-1', '017-review-waves#P-3'],
    rejected: ['016-remove-terra-family#P-3', '017-review-waves#A-1'],
  }).flatMap(([disposition, rows]) => rows.map((row) => [row, disposition])));
  assert.deepStrictEqual([...seed.keys()].filter((row) => !backlog.some((entry) => entry.row === row)), [], 'AC-4: every row the 019 triage decided keeps its line - the backlog updates rows in place and never drops one, or a rejected row is offered again');
  const stillSeeded = backlog.filter((entry) => entry.decided_in === '019-retro-intake').map((entry) => [entry.row, entry.disposition]);
  assert.deepStrictEqual(stillSeeded, stillSeeded.map(([row]) => [row, seed.get(row)]), 'AC-4: a row still stamped Decided in 019-retro-intake carries the disposition the 019 triage gave it (plan.md DoD, decisions-log.001.md); a later sprint that re-decides a row restamps it and leaves this check');

  assert.deepStrictEqual(loadManifest().managed_paths.filter((managed) => RETRO_BACKLOG === managed || RETRO_BACKLOG.startsWith(`${managed}/`)), [], 'AC-4: /asd-update rewrites every managed path, so a managed path covering the backlog would overwrite a consumer\'s dispositions');

  const live = runtime.retroCandidates(path.join(REPO_ROOT, '.asd/sprints'), path.join(REPO_ROOT, RETRO_BACKLOG), true).map((candidate) => candidate.row);
  assert.deepStrictEqual(backlog.filter((entry) => (entry.disposition === 'deferred') !== live.includes(entry.row)).map((entry) => `${entry.row} (${entry.disposition})`), [], 'AC-1/AC-3: live intake offers every deferred row again and never one the backlog records as included, rejected or closed');
});

test('sprint-019 AC-8: the one-command commit form git-strategy.md "Commit before review" gives a dispatched agent, run as written with its message file (sprint-036 AC-12), commits exactly its own paths - a never-tracked file and both sides of a rename included - never checks or sweeps a sibling\'s staged file, and after a failed check its reset leaves none of its paths staged', async () => {
  const section = sectionOf('.asd/rules/git-strategy.md', 'Commit before review');
  const compound = /`(git add -- <paths> && [^`]+)`/.exec(section);
  const reset = /if the command fails, `(git [^`]+)`/.exec(section);
  assert.ok(compound && reset, 'git-strategy.md must state the compound command and the reset it runs on failure as literal commands');
  const RUNTIME = path.join(REPO_ROOT, '.asd', 'runtime.js');
  const AGENT_MESSAGE = 'chore(test): agent work\n\nWhy the change.\n\nASD-Task: Task 1\nCo-Authored-By: Pair <pair@example.invalid>\n';
  const checkStep = 'node .asd/runtime.js commit-check --message-file <file> -- <paths>';
  const scenario = () => {
    const sandbox = sandboxGitRepoFrom('commit-form', (template) => {
      writeFile(template.repo, 'tracked.txt', 'one\n');
      writeFile(template.repo, 'old.txt', 'moved\n');
      writeFile(template.repo, 'sibling.txt', 'base\n');
      template.git('add', '.');
      template.git('commit', '-q', '-m', 'base');
      writeFile(template.repo, 'sibling.txt', 'sibling edit with a trailing space \n');
      template.git('add', '--', 'sibling.txt');
      return template.git('rev-parse', 'HEAD').trim();
    });
    const { repo, gitAsync } = sandbox;
    const messageFile = path.join(mkTempDir(), 'agent.commit-msg');
    const argsOf = (command, paths) => command.split(/\s+/).slice(1).flatMap((token) => (token === '<paths>' ? paths : [token === '<file>' ? messageFile : token === '.asd/runtime.js' ? RUNTIME : token]));
    const commitAs = async (paths, message = AGENT_MESSAGE) => {
      fs.writeFileSync(messageFile, message, 'utf8');
      for (const part of compound[1].split(' && ')) {
        try {
          if (part.startsWith('node ')) await execFileAsync(process.execPath, argsOf(part, paths), { cwd: repo, env: { ...process.env, GIT_CEILING_DIRECTORIES: path.dirname(repo) } });
          else await gitAsync(...argsOf(part, paths));
        } catch {
          await gitAsync(...argsOf(reset[1], paths));
          return `failed at: ${part}`;
        }
      }
      return 'committed';
    };
    const stagedNow = async () => (await gitAsync('diff', '--cached', '--name-only')).trim();
    const headNow = async () => (await gitAsync('rev-parse', 'HEAD')).trim();
    return { sandbox, put: (rel, text) => fs.writeFileSync(path.join(repo, rel), text, 'utf8'), commitAs, stagedNow, headNow, gitAsync, head: sandbox.shared, repo };
  };

  const happy = async () => {
    const { put, commitAs, stagedNow, gitAsync, repo } = scenario();
    put('tracked.txt', 'two\n');
    put('fresh.txt', 'new\n');
    fs.renameSync(path.join(repo, 'old.txt'), path.join(repo, 'new.txt'));
    const outcome = await commitAs(['tracked.txt', 'fresh.txt', 'old.txt', 'new.txt']);
    return { outcome, files: (await gitAsync('show', '--no-renames', '--name-status', '--format=', 'HEAD')).trim().split('\n').sort(), staged: await stagedNow(), message: (await gitAsync('log', '-1', '--format=%B')).trim() };
  };
  const failedCheck = async () => {
    const { put, commitAs, stagedNow, headNow, head } = scenario();
    put('bad.txt', 'trailing space \n');
    return { outcome: await commitAs(['bad.txt']), head: await headNow(), staged: await stagedNow(), expectedHead: head };
  };
  const failedMessage = async () => {
    const { put, commitAs, stagedNow, headNow, head } = scenario();
    put('long.txt', 'fine\n');
    const longHeader = `chore(test): ${'x'.repeat(40)}\n\nASD-Task: Task 1\n`;
    const long = { outcome: await commitAs(['long.txt'], longHeader), head: await headNow(), staged: await stagedNow() };
    const misplaced = { outcome: await commitAs(['long.txt'], 'chore(test): misplaced\n\nASD-Task: Task 1\n\nA body paragraph after the trailer.\n'), head: await headNow(), staged: await stagedNow() };
    return { long, misplaced, fitting: await commitAs(['long.txt']), expectedHead: head };
  };
  const [committed, check, message] = await Promise.all([happy(), failedCheck(), failedMessage()]);

  assert.strictEqual(committed.outcome, 'committed', 'the check is path-scoped, so a sibling\'s staged whitespace error must not fail this agent\'s commit');
  assert.deepStrictEqual(committed.files, ['A\tfresh.txt', 'A\tnew.txt', 'D\told.txt', 'M\ttracked.txt'], 'the commit carries exactly the agent\'s paths - the never-tracked file and both sides of the rename in, the sibling\'s staged file out');
  assert.strictEqual(committed.staged, 'sibling.txt', 'AC-8: the sibling\'s staged file stays staged for its own commit, and none of the agent\'s paths is left staged');
  assert.strictEqual(committed.message, AGENT_MESSAGE.trim(), 'sprint-036 AC-12: the commit carries the message file whole - body and the final trailer paragraph with its ASD-Task and Co-Authored-By lines');

  assert.strictEqual(check.outcome, 'failed at: git diff --cached --check -- <paths>', 'a whitespace error in the agent\'s own path must stop the commit at the check');
  assert.strictEqual(check.head, check.expectedHead, 'nothing is committed after a failed check');
  assert.strictEqual(check.staged, 'sibling.txt', 'AC-8: after the reset the failed path is unstaged - left staged, the next sibling commit would sweep it under the wrong ASD-Task trailer (018 F-1)');

  assert.strictEqual(message.long.outcome, `failed at: ${checkStep}`, 'sprint-033 AC-12: a header over 50 characters stops the commit at commit-check');
  assert.deepStrictEqual([message.long.head, message.long.staged], [message.expectedHead, 'sibling.txt'], 'nothing is committed after a failed header check, and the reset leaves none of the agent\'s paths staged');
  assert.strictEqual(message.misplaced.outcome, `failed at: ${checkStep}`, 'sprint-036 AC-12: an ASD-Task line outside the last paragraph stops the commit at commit-check');
  assert.deepStrictEqual([message.misplaced.head, message.misplaced.staged], [message.expectedHead, 'sibling.txt'], 'sprint-036 AC-12: a misplaced trailer commits nothing and the reset leaves the path unstaged');
  assert.strictEqual(message.fitting, 'committed', 'the same path commits once its header fits and its trailer sits in the last paragraph');
  assert.ok(section.includes('`--subject "<header>"`'), 'sprint-036 AC-12: a trailer-less commit keeps the --subject form beside the message file');
});

test('sprint-021 AC-10/AC-11 (D5): scratch-dir creates .asd/tmp/ beside the runtime on first use, prints its absolute path wherever it is run from, and the directory ignores itself so nothing written there is ever committed', () => {
  const { repo, env, git } = sandboxGitRepo();
  fs.mkdirSync(path.join(repo, '.asd'));
  fs.copyFileSync(path.join(REPO_ROOT, '.asd/runtime.js'), path.join(repo, '.asd/runtime.js'));
  git('add', '.');
  git('commit', '-q', '-m', 'base');
  const scratch = () => execFileSync(process.execPath, [path.join(repo, '.asd/runtime.js'), 'scratch-dir'], { cwd: mkTempDir(), env, encoding: 'utf8' }).trim();
  const printed = scratch();
  assert.strictEqual(printed, path.join(repo, '.asd', 'tmp'), 'artifact-layout.md "Scratch directory": the path is the runtime\'s own .asd/tmp/, independent of the caller\'s cwd');
  fs.writeFileSync(path.join(printed, 'reviewer.return.md'), 'x\n', 'utf8');
  assert.strictEqual(scratch(), printed, 'a second call on an existing directory prints the same path');
  assert.strictEqual(git('status', '--porcelain', '--untracked-files=all'), '', 'the directory and its own .gitignore must be ignored with no root .gitignore entry - a consumer needs no migration, and a helper or return file never reaches a commit or a review');
});

test('sprint-023 AC-4: memory-check rejects a staged agent-memory write that records a sprint id, Task, wave, iteration or review verdict, passes placeholders and bare verdict words, and reads only the added lines of staged files under .claude/agent-memory - exit 1 with the hits, 0 clean, 2 on bad input', async () => {
  const memory = '.claude/agent-memory/asd-x';
  const fresh = () => {
    const sandbox = sandboxGitRepoFrom('memory-check', (template) => {
      writeFile(template.repo, `${memory}/legacy.md`, 'recorded in sprint 019\nalso wave 7 noted\nkept line\n');
      writeFile(template.repo, 'docs/notes.md', 'plain\n');
      template.git('add', '-A');
      template.git('commit', '-q', '-m', 'base');
    });
    const check = async (args = [], cwd = sandbox.repo) => {
      const ran = await runtimeSpawnAsync(['memory-check', ...args], { cwd, env: sandbox.env });
      return { status: ran.status, hits: ran.stdout ? JSON.parse(ran.stdout) : null };
    };
    return { ...sandbox, check };
  };
  const placeholders = async () => {
    const { repo, gitAsync, check } = fresh();
    writeFile(repo, `${memory}/method.md`, 'placeholders: iter-NN, Task <N>, wave <K>, sprint <NNN-slug>\nbare verdict words: APPROVE, CONCERNS, FAIL\nformat: [REVIEW-<phase>-<reviewer>]: APPROVE|CONCERNS|FAIL\n');
    await gitAsync('add', '--', `${memory}/method.md`);
    const bare = await check();
    fs.appendFileSync(path.join(repo, memory, 'method.md'), 'unstaged: Task 9\n');
    const unstaged = await check();
    await gitAsync('checkout', '--', `${memory}/method.md`);
    writeFile(repo, `${memory}/legacy.md`, 'also wave 7 noted\nkept line\nmethod only\n');
    writeFile(repo, 'docs/notes.md', 'plain\nrecorded in sprint 023\n');
    await gitAsync('add', '--', `${memory}/legacy.md`, 'docs/notes.md');
    return { bare, unstaged, legacy: await check() };
  };
  const violations = [
    ['sprint 023', 'seen in sprint 023 once'], ['023-retro-glings-008-remediation', 'the 023-retro-glings-008-remediation work'], ['Task 3', 'fixed under Task 3'],
    ['wave 2', 'during wave 2'], ['iter-02', 'at iter-02'], ['iteration 4', 'iteration 4 returned'], ['[REVIEW-impl-testing]: APPROVE', '[REVIEW-impl-testing]: APPROVE'],
  ];
  const recorded = async () => {
    const { repo, gitAsync, check } = fresh();
    writeFile(repo, `${memory}/bad.md`, `neutral\n${violations.map(([, line]) => line).join('\n')}\n`);
    await gitAsync('add', '--', `${memory}/bad.md`);
    const [top, subdirectory, badInput] = await Promise.all([check(), check([], path.join(repo, 'docs')), check(['--files', 'x'])]);
    return { top, subdirectory, badInput };
  };
  const named = async () => {
    const { repo, gitAsync, check } = fresh();
    writeFile(repo, `${memory}/project_023-memory-note.md`, 'method only\n');
    await gitAsync('add', '--', `${memory}/project_023-memory-note.md`);
    return check();
  };
  const [clean, flagged, byName] = await Promise.all([placeholders(), recorded(), named()]);

  assert.deepStrictEqual(clean.bare, { status: 0, hits: [] }, 'placeholders carry no digits and a bare verdict word is no recorded verdict - both must pass, or the check rejects the method notes the rule asks for');
  assert.deepStrictEqual(clean.unstaged, { status: 0, hits: [] }, 'only the staged diff is read - the orchestrator commits what it staged, and an unstaged edit is no part of that commit');
  assert.deepStrictEqual(clean.legacy, { status: 0, hits: [] }, 'a violation on a line this commit does not add - a legacy line it keeps, one it deletes - is not the write being checked, and a violation outside the memory tree is not memory');
  const expected = violations.map(([token], index) => ({ path: `${memory}/bad.md`, line: index + 2, token }));
  assert.deepStrictEqual(flagged.top, { status: 1, hits: expected }, 'each concrete ordinal form is a hit at its line of the added file - the sprint id in both spellings, Task, wave, iteration in both spellings, a recorded verdict token - and the exit is 1 with the JSON still printed');
  assert.deepStrictEqual(flagged.subdirectory, { status: 1, hits: expected }, 'the memory tree is addressed from the repo top, so a check run from any directory scans the same files - a relative pathspec would pass a violating write from a subdirectory');
  assert.deepStrictEqual(flagged.badInput, { status: 2, hits: null }, 'bad input exits 2 with no hit list, never 0');
  assert.deepStrictEqual(byName, { status: 1, hits: [{ path: `${memory}/project_023-memory-note.md`, line: null, token: '023-memory-note' }] }, 'a newly added file whose name carries a sprint id is a hit with a null line - the underscore after the prefix is a word break, or project_<id>-topic.md slips through');
});

/** A sprint directory at `phase` whose live decisions log is the shipped template plus `entryLines` (none = a log with no entry). */
function rotationSprint(phase, entryLines = '') {
  const dir = mkTempDir();
  writeFile(dir, 'state.json', JSON.stringify({ phase }));
  writeFile(dir, 'decisions-log.md', `${fs.readFileSync(path.join(REPO_ROOT, '.asd/templates/t_decisions-log.md'), 'utf8')}\n${entryLines}`);
  return dir;
}

test('sprint-030 AC-9: rotate-decisions rotates the live log into the next segment only when the phase changes outside the impl cycle and the log holds an entry - one-line or heading form - and recreates the live file from the template; it never rotates an unchanged phase, a transition inside the cycle or a log of template lines alone, and it fails without --sprint or --to', () => {
  const oneLine = '- 2026-01-02 — plan skipped: fixture\n';
  const heading = '## 2026-01-03 — fixture decision\n\n- **Decision**: x\n';
  const template = fs.readFileSync(path.join(REPO_ROOT, '.asd/templates/t_decisions-log.md'), 'utf8');
  const rotate = (dir, to) => runtimeCliResult(['rotate-decisions', '--sprint', dir, '--to', to]);
  const segments = (dir) => fs.readdirSync(dir).filter((name) => /^decisions-log\.\d+\.md$/.test(name));
  for (const [from, to, entries, why] of [['plan', 'plan', oneLine, 'an unchanged phase'], ['impl', 'impl-test', oneLine, 'a transition inside the cycle'], ['impl-review', 'impl', oneLine, 'a rollback inside the cycle'], ['plan', 'impl', '', 'a log whose only entry-shaped lines are the template\'s placeholders']]) {
    const dir = rotationSprint(from, entries);
    const before = fs.readFileSync(path.join(dir, 'decisions-log.md'), 'utf8');
    assert.deepStrictEqual(rotate(dir, to), { status: 0, result: { rotated: false, from, to, segment: null } }, `AC-9: ${why} must not rotate`);
    assert.strictEqual(fs.readFileSync(path.join(dir, 'decisions-log.md'), 'utf8'), before, `AC-9: ${why} leaves the live log untouched`);
    assert.deepStrictEqual(segments(dir), [], `AC-9: ${why} writes no segment`);
  }

  const dir = rotationSprint('plan', oneLine);
  const live = path.join(dir, 'decisions-log.md');
  const first = fs.readFileSync(live, 'utf8');
  assert.deepStrictEqual(rotate(dir, 'impl'), { status: 0, result: { rotated: true, from: 'plan', to: 'impl', segment: path.join(dir, 'decisions-log.001.md') } }, 'AC-9: the first rotation of a log with an entry takes ordinal 001');
  assert.strictEqual(fs.readFileSync(path.join(dir, 'decisions-log.001.md'), 'utf8'), first, 'AC-9: the segment is the live log renamed, content intact');
  assert.strictEqual(fs.readFileSync(live, 'utf8'), template, 'AC-9: the live file is recreated from the shipped template');

  writeFile(dir, 'state.json', JSON.stringify({ phase: 'impl-review' }));
  writeFile(dir, 'decisions-log.009.md', 'older segment\n');
  fs.appendFileSync(live, heading);
  assert.strictEqual(rotate(dir, 'cleanup').result.segment, path.join(dir, 'decisions-log.010.md'), 'AC-9: the next ordinal is one above the highest segment present, zero-padded to three digits, a heading-form entry counting as an entry');

  assert.strictEqual(sync.findRepoRoot(mkTempDir()), FIXTURE_ROOT, 'runner isolation: a fixture holding no .asd/ of its own resolves the fixture root through the marker, never the live repo (REPO_ROOT)');

  for (const flags of [['--sprint', dir], ['--to', 'impl']]) {
    const missing = runtimeCliResult(['rotate-decisions', ...flags]);
    assert.ok(missing.status !== 0 && /--sprint <sprint dir> and --to <phase> required/.test(missing.stderr), `AC-9: ${flags[0]} alone must fail naming both flags, got ${JSON.stringify(missing)}`);
  }
});

test('sprint-030 AC-9/AC-11: the rotate-decisions command asd-sprint runs and artifact-layout.md names runs as written, asd-sprint commits on its `"rotated": true` result, and the usage message and README list the command', () => {
  const command = 'node .asd/runtime.js rotate-decisions --sprint <sprint> --to <phase>';
  const skillLine = sectionOf('.asd/skills/asd-sprint/SKILL.md', 'Rules').split('\n').find((line) => line.includes('rotate-decisions')) || '';
  assert.ok(skillLine.includes(`\`${command}\``) && skillLine.includes('"rotated": true'), 'AC-9: asd-sprint Rules must call rotate-decisions before a phase-skill delegation and commit on its rotated result - the by-hand check it replaces left the condition to be re-derived on every delegation');
  assert.ok(headingBody('.asd/rules/artifact-layout.md', 'Decisions log').includes(`\`${command}\``), 'AC-9: artifact-layout.md "Decisions log" must name the command as the executor of its rotation condition');
  const dir = rotationSprint('plan');
  const asWritten = command.split(' ').slice(2).map((arg) => ({ '<sprint>': dir, '<phase>': 'plan' })[arg] || arg);
  assert.deepStrictEqual(runtimeCliResult(asWritten), { status: 0, result: { rotated: false, from: 'plan', to: 'plan', segment: null } }, 'AC-9: the documented command line must be accepted as written');
  assert.ok(/rotate-decisions/.test(runtimeCliResult(['no-such-command']).stderr), 'AC-9: the runtime usage message must list rotate-decisions');
  assert.ok(canonText('README.md').includes('`rotate-decisions --sprint'), 'AC-9/AC-11: README\'s runtime.js folder-map line must list rotate-decisions');
});

/** A preload that answers every `gh` spawn from `answers` in order (the last repeats) and logs each argv, and turns sleeping into advancing a fake clock, so a child runs `runtime.js` with no real `gh` and no real wait. */
function ghStub(answers) {
  const work = mkTempDir();
  const preload = path.join(work, 'gh-stub.js');
  const log = path.join(work, 'calls.json');
  fs.writeFileSync(preload, [
    "const cp = require('child_process');",
    "const fs = require('fs');",
    'const answers = JSON.parse(process.env.GH_ANSWERS);',
    'const calls = [];',
    "const timers = require('timers/promises');",
    'let clock = 0;',
    'Date.now = () => clock;',
    'timers.setTimeout = async (ms) => { clock += ms; };',
    "cp.spawnSync = (file, argv) => { calls.push([file, ...argv]); return (answers.length > 1 ? answers.shift() : answers[0]) || { error: { message: 'no answer left' } }; };",
    "process.on('exit', () => fs.writeFileSync(process.env.GH_CALLS, JSON.stringify(calls)));",
  ].join('\n'), 'utf8');
  const { spawnSync } = require('node:child_process');
  return {
    work,
    run: (args, env = {}) => spawnSync(process.execPath, ['--require', preload, ...args], { encoding: 'utf8', env: { ...process.env, ...env, GH_ANSWERS: JSON.stringify(answers), GH_CALLS: log } }),
    calls: () => JSON.parse(fs.readFileSync(log, 'utf8')),
  };
}

const CHECKS_PR = '7';

test('sprint-032 AC-4/AC-5: waitForChecks returns pass and fail at once, polls none through the 60 s grace and pending through the 30 min limit, then gives up as none and timeout, and a failed read propagates', async () => {
  const { CHECKS_GRACE_MS: grace, CHECKS_LIMIT_MS: limit, CHECKS_POLL_MS: poll } = runtime;
  assert.strictEqual(grace, 60 * 1000, 'AC-4: up to 60 s for checks to register');
  assert.strictEqual(limit, 30 * 60 * 1000, 'AC-4: up to 30 min for checks to finish');
  assert.ok(grace % poll === 0 && limit % poll === 0, 'sanity: the poll divides both bounds, so the boundary cases below land on a read');

  assert.deepStrictEqual(await scriptedWait(['pass']), { checks: 'pass', elapsed: 0, polls: 0 }, 'pass returns at once');
  assert.deepStrictEqual(await scriptedWait(['fail']), { checks: 'fail', elapsed: 0, polls: 0 }, 'fail returns at once');
  assert.deepStrictEqual(await scriptedWait(['pending', 'fail']), { checks: 'fail', elapsed: poll, polls: 1 }, 'a failing check ends the wait while others still run');
  assert.deepStrictEqual(await scriptedWait(['none', 'none', 'pending', 'pass']), { checks: 'pass', elapsed: 3 * poll, polls: 3 }, 'none inside the grace polls on, pending then pass merges');

  const registersLast = await scriptedWait([...Array(grace / poll - 1).fill('none'), 'pass']);
  assert.strictEqual(registersLast.checks, 'pass', 'checks registering on the last poll inside the grace still count');
  const none = await scriptedWait(['none']);
  assert.strictEqual(none.checks, 'none', 'AC-4: no check after the grace is none, which merges');
  assert.ok(none.elapsed >= grace && none.elapsed < grace + poll, `none must be returned right past the grace, got ${none.elapsed} ms`);

  const finishesLast = await scriptedWait([...Array(limit / poll - 1).fill('pending'), 'pass']);
  assert.strictEqual(finishesLast.checks, 'pass', 'checks finishing on the last poll inside the limit still pass');
  const timeout = await scriptedWait(['pending']);
  assert.strictEqual(timeout.checks, 'timeout', 'AC-5: pending past the limit is the exceeded wait');
  assert.ok(timeout.elapsed >= limit && timeout.elapsed < limit + poll, `timeout must be returned right past the limit, got ${timeout.elapsed} ms`);

  await assert.rejects(scriptedWait([new Error('gh pr checks 7 failed: boom')]), /boom/, 'an unexpected gh failure is never read as a check state');
});

test('sprint-032 AC-4: readChecks maps gh pr checks output - skipping is pass, any pending is pending, fail and cancel are fail, an empty list or the no-checks message is none whatever stdout holds - and any other gh failure, unparseable or non-array output included, throws and is never none', () => {
  const rows = (...buckets) => JSON.stringify(buckets.map((bucket) => ({ bucket })));
  const cases = [
    [{ status: 0, stdout: rows('pass', 'skipping'), stderr: '' }, 'pass'],
    [{ status: 8, stdout: rows('pass', 'pending'), stderr: '' }, 'pending'],
    [{ status: 1, stdout: rows('pending', 'fail'), stderr: '' }, 'fail'],
    [{ status: 1, stdout: rows('cancel'), stderr: '' }, 'fail'],
    [{ status: 0, stdout: '[]', stderr: '' }, 'none'],
    [{ status: 1, stdout: '', stderr: "no checks reported on the 'sprint/032' branch\n" }, 'none'],
    [{ status: 1, stdout: rows('fail'), stderr: "no checks reported on the 'sprint/032' branch\n" }, 'none'],
    [{ status: 1, stdout: '', stderr: 'HTTP 401: Bad credentials' }, new RegExp(`^throws: gh pr checks ${CHECKS_PR} failed: .*HTTP 401: Bad credentials`)],
    [{ status: 0, stdout: 'not json', stderr: '' }, new RegExp(`^throws: gh pr checks ${CHECKS_PR} failed`)],
    [{ status: 0, stdout: '{"bucket":"pass"}', stderr: '' }, new RegExp(`^throws: gh pr checks ${CHECKS_PR} failed: output is not a check array`)],
    [{ error: { message: 'spawn gh ENOENT' } }, `throws: gh pr checks ${CHECKS_PR} failed: spawn gh ENOENT`],
  ];
  const stub = ghStub(cases.map(([answer]) => answer));
  const driver = path.join(stub.work, 'driver.js');
  fs.writeFileSync(driver, [
    'const runtime = require(process.env.RUNTIME_JS);',
    'const out = [];',
    'for (let index = 0; index < Number(process.env.CASES); index += 1) {',
    `  try { out.push(runtime.readChecks(${CHECKS_PR})); } catch (error) { out.push('throws: ' + error.message); }`,
    '}',
    'console.log(JSON.stringify(out));',
  ].join('\n'), 'utf8');
  const result = stub.run([driver], { RUNTIME_JS, CASES: String(cases.length) });
  assert.strictEqual(result.status, 0, result.stderr);
  const actual = JSON.parse(result.stdout);
  cases.forEach(([, expected], index) => (expected instanceof RegExp ? assert.match(actual[index], expected, `case ${index}`) : assert.strictEqual(actual[index], expected, `case ${index}`)));
  assert.deepStrictEqual(stub.calls()[0], ['gh', 'pr', 'checks', CHECKS_PR, '--json', 'bucket'], 'one read is `gh pr checks <n> --json bucket`');
  assert.strictEqual(stub.calls().length, cases.length, 'exactly one gh call per read');
});

test('sprint-032 AC-4/AC-5: checks-wait prints {"checks":...} and exits 0 on pass and none, 1 on fail and timeout and 2 on a gh failure, and rejects a missing, zero or non-numeric --pr with exit 2 before any gh call', () => {
  const pass = ghStub([{ status: 0, stdout: '[{"bucket":"pass"}]', stderr: '' }]);
  const passed = pass.run([RUNTIME_JS, 'checks-wait', '--pr', CHECKS_PR]);
  assert.deepStrictEqual([passed.status, passed.stdout.trim()], [0, '{"checks":"pass"}']);
  assert.deepStrictEqual(pass.calls(), [['gh', 'pr', 'checks', CHECKS_PR, '--json', 'bucket']]);

  const scoped = ghStub([{ status: 0, stdout: '[{"bucket":"pass"}]', stderr: '' }]);
  assert.strictEqual(scoped.run([RUNTIME_JS, 'checks-wait', '--pr', CHECKS_PR, '--repo', 'owner/repo']).status, 0);
  assert.deepStrictEqual(scoped.calls(), [['gh', 'pr', 'checks', CHECKS_PR, '-R', 'owner/repo', '--json', 'bucket']], '--repo is forwarded as -R');
  const badRepo = ghStub([]);
  const badRepoRun = badRepo.run([RUNTIME_JS, 'checks-wait', '--pr', CHECKS_PR, '--repo', 'not a repo']);
  assert.ok(badRepoRun.status === 2 && badRepoRun.stderr.includes('--repo') && badRepo.calls().length === 0, `a malformed --repo exits 2 before any gh call (got ${badRepoRun.status}: ${badRepoRun.stderr})`);

  const noChecks = ghStub([{ status: 1, stdout: '', stderr: "no checks reported on the 'sprint/032' branch\n" }]).run([RUNTIME_JS, 'checks-wait', '--pr', CHECKS_PR]);
  assert.deepStrictEqual([noChecks.status, noChecks.stdout.trim()], [0, '{"checks":"none"}'], 'AC-4: a PR with no checks after the grace merges, so none exits 0');
  const stuck = ghStub([{ status: 8, stdout: '[{"bucket":"pending"}]', stderr: '' }]).run([RUNTIME_JS, 'checks-wait', '--pr', CHECKS_PR]);
  assert.deepStrictEqual([stuck.status, stuck.stdout.trim()], [1, '{"checks":"timeout"}'], 'AC-5: checks still pending past the limit exit 1');

  const failing = ghStub([{ status: 1, stdout: '[{"bucket":"fail"}]', stderr: '' }]).run([RUNTIME_JS, 'checks-wait', '--pr', CHECKS_PR]);
  assert.deepStrictEqual([failing.status, failing.stdout.trim()], [1, '{"checks":"fail"}']);

  const broken = ghStub([{ status: 1, stdout: '', stderr: 'HTTP 401: Bad credentials' }]).run([RUNTIME_JS, 'checks-wait', '--pr', CHECKS_PR]);
  assert.strictEqual(broken.status, 2, 'a gh failure takes the existing fail path, exit 2');
  assert.strictEqual(broken.stdout, '', 'a gh failure prints no checks value a caller could read as an outcome');
  assert.ok(broken.stderr.includes(`gh pr checks ${CHECKS_PR} failed`), broken.stderr);
  const garbled = ghStub([{ status: 0, stdout: 'not json', stderr: '' }]).run([RUNTIME_JS, 'checks-wait', '--pr', CHECKS_PR]);
  assert.deepStrictEqual([garbled.status, garbled.stdout], [2, ''], 'unparseable gh output is a gh failure, never the merge-permitting none');

  for (const flags of [['--pr', '0'], ['--pr', 'abc'], ['--pr', '1.5'], []]) {
    const stub = ghStub([]);
    const rejected = stub.run([RUNTIME_JS, 'checks-wait', ...flags]);
    assert.strictEqual(rejected.status, 2, `checks-wait ${flags.join(' ')} must exit 2`);
    assert.ok(rejected.stderr.includes('--pr'), rejected.stderr);
    assert.deepStrictEqual(stub.calls(), [], `checks-wait ${flags.join(' ')} must reject before any gh call`);
  }
});

test('sprint-033 AC-12/AC-21: commit-check passes a header of at most 50 characters counted as characters, fails a longer one and a memory-check hit among the named staged paths only, ignores a sibling\'s staged memory hit, and refuses a missing subject', async () => {
  const memory = '.claude/agent-memory/asd-x';
  const { repo, env, git } = sandboxGitRepo();
  writeFile(repo, 'docs/own.md', 'plain\n');
  git('add', '-A');
  git('commit', '-q', '-m', 'base');
  writeFile(repo, `${memory}/note.md`, 'seen in sprint 019\n');
  git('add', '--', `${memory}/note.md`);
  const check = async (subject, paths) => {
    const args = ['commit-check', ...(subject === undefined ? [] : ['--subject', subject]), ...(paths === undefined ? [] : ['--', ...paths])];
    const { status, stdout, stderr } = await runtimeSpawnAsync(args, { cwd: repo, env });
    return status === 0 ? { status, report: JSON.parse(stdout) } : { status, report: stdout ? JSON.parse(stdout) : null, stderr: stderr.trim() };
  };
  const HEADER_MAX = 50;
  const fits = `chore(test): ${'x'.repeat(HEADER_MAX - 'chore(test): '.length)}`;
  const [atLimit, tooLong, chars, hit, directory, everyStaged, missing] = await Promise.all([
    check(fits, ['docs/own.md']),
    check(`${fits}x`, ['docs/own.md']),
    check(`feat: ${'é'.repeat(HEADER_MAX - 'feat: '.length)}`, ['docs/own.md']),
    check(fits, [`${memory}/note.md`]),
    check(fits, [memory]),
    check(fits),
    check(undefined, ['docs/own.md']),
  ]);
  assert.deepStrictEqual(atLimit, { status: 0, report: { ok: true, header: { length: HEADER_MAX, max: HEADER_MAX }, memory: [] } }, 'AC-12: a header of exactly the limit passes');
  assert.deepStrictEqual([tooLong.status, tooLong.report.ok, tooLong.report.header], [1, false, { length: HEADER_MAX + 1, max: HEADER_MAX }], 'AC-12: one character over fails with exit 1 and the measured length');
  assert.strictEqual(chars.status, 0, 'AC-12: the limit counts characters, never bytes');

  assert.deepStrictEqual(atLimit.report.memory, [], 'AC-21: a staged memory hit outside the named paths is a sibling\'s, never this commit\'s');
  assert.deepStrictEqual([hit.status, hit.report.ok, hit.report.memory.map((entry) => [entry.path, entry.token])], [1, false, [[`${memory}/note.md`, 'sprint 019']]], 'AC-21: a hit among the named staged paths fails the commit check');
  assert.strictEqual(directory.status, 1, 'a named directory covers the memory files under it');
  assert.strictEqual(everyStaged.status, 1, 'with no paths named every staged memory write is checked');

  assert.ok(missing.status === 2 && /commit-check takes --subject/.test(missing.stderr), `a missing subject is refused (got ${JSON.stringify(missing)})`);
});

test('sprint-033 AC-27 (issue #109): impl-test-close fills the Entry log HEAD analysed of the named entry with the short HEAD and appends the decisions-log line, touching no other row, and writes neither file when its input is invalid', async () => {
  const { repo, env, git } = sandboxGitRepo();
  git('commit', '-q', '--allow-empty', '-m', 'base');
  const head = git('rev-parse', '--short=8', 'HEAD').trim();
  const work = mkTempDir();
  const entryRow = (entry, analysed, scope) => `| ${entry} | ${analysed} | ${scope} |`;
  const plan = ['# Test plan', '', '## Entry log', '', '| Entry | HEAD analysed | Scope |', '|---|---|---|', entryRow(1, 'abc12345', 'full change surface'), entryRow(2, '', 'delta since entry 1'), '', '## Added tests', '', '| Test | Gap proof |', '|---|---|', '', '## Defects', ''].join('\n');
  let runs = 0;
  const segmentOf = (gapProof) => `## Added tests\n\n| Test | Gap proof |\n|---|---|\n| t.js:t | ${gapProof} |\n`;
  const close = async (log, { segment, ...overrides } = {}, planText = plan) => {
    runs += 1;
    const planFile = path.join(work, `test-plan-${runs}.md`);
    const logFile = path.join(work, `decisions-log-${runs}.md`);
    fs.writeFileSync(planFile, planText, 'utf8');
    fs.writeFileSync(logFile, log, 'utf8');
    if (segment !== undefined) fs.writeFileSync(`${planFile.replace(/\.md$/, '')}.entry-01.md`, segment, 'utf8');
    const flags = { 'test-plan': planFile, entry: '2', decisions: logFile, line: 'impl-test: impacted set green', ...overrides };
    const outcome = await runtimeCliResultAsync(['impl-test-close', ...Object.entries(flags).flatMap(([name, value]) => [`--${name}`, value])], { cwd: repo, env });
    return { ...outcome, files: () => [fs.readFileSync(planFile, 'utf8'), fs.readFileSync(logFile, 'utf8')] };
  };
  const refusals = [
    ['an entry with no row', { entry: '3' }, /holds 0 Entry log rows for entry 3, expected 1/],
    ['a non-integer entry', { entry: 'two' }, /--entry <positive integer> required/],
    ['an empty line', { line: '  ' }, /--line must be one non-empty line/],
    ['a multi-line line', { line: 'a\nb' }, /--line must be one non-empty line/],
    ['a rotated entry-01 segment with an empty Gap proof', { segment: segmentOf('') }, /test-plan-\d+\.entry-01\.md Added tests row has an empty Gap proof cell/],
  ];

  const [filled, noNewline, refused, ambiguous, absent, segmentProven] = await Promise.all([
    close('- 2026-01-01 — earlier line\n'),
    close('- 2026-01-01 — no trailing newline', { entry: '1' }),
    Promise.all(refusals.map(([, overrides]) => close('- 2026-01-01 — kept\n', overrides))),
    close('', {}, `${plan}\n${entryRow(2, '', 'again')}\n`),
    runtimeCliResultAsync(['impl-test-close', '--test-plan', path.join(work, 'test-plan-1.md')], { cwd: repo, env }),
    close('', { segment: segmentOf('seeded x: node tests/run.js -> exit 0') }),
  ]);
  assert.strictEqual(segmentProven.status, 0, 'a rotated segment whose Gap proof is filled closes');
  const [filledPlan, filledLog] = filled.files();
  assert.deepStrictEqual([filled.status, filled.result], [0, { entry: 2, head }], 'the command reports the entry and the HEAD it recorded');
  assert.strictEqual(filledPlan, plan.replace(entryRow(2, '', 'delta since entry 1'), entryRow(2, head, 'delta since entry 1')), 'only the named entry\'s HEAD analysed cell changes');
  assert.ok(/^- 2026-01-01 — earlier line\n- \d{4}-\d{2}-\d{2} — impl-test: impacted set green\n$/.test(filledLog), 'the line is appended after the existing log, dated');

  const [noNewlinePlan, noNewlineLog] = noNewline.files();
  assert.ok(noNewlineLog.startsWith('- 2026-01-01 — no trailing newline\n- '), 'a log without a final newline still gets the line on its own line');
  assert.ok(noNewlinePlan.includes(entryRow(1, head, 'full change surface')), 'a row already holding a sha is refilled with the current HEAD');

  refusals.forEach(([label, , pattern], index) => {
    assert.ok(refused[index].status === 2 && pattern.test(refused[index].stderr), `${label} is refused (got ${JSON.stringify(refused[index])})`);
    assert.deepStrictEqual(refused[index].files(), [plan, '- 2026-01-01 — kept\n'], `${label}: neither file is written`);
  });
  assert.ok(/holds 2 Entry log rows for entry 2/.test(ambiguous.stderr), 'two rows for one entry are ambiguous and refused');
  assert.ok(absent.status === 2 && /requires --entry, --decisions, --line/.test(absent.stderr), 'a missing flag names every flag still required');
});

const DESIGN_FIXTURE = {
  md: ['---', 'name: Demo', 'colors:', '  primary: "#112233"', '  accent: "{colors.primary}"', 'spacing:', '  md: 16px', 'typography:', '  body:', '    fontFamily: Inter', '    fontSize: 14px', '---', '', '# Prose stays out of the tables', ''].join('\n'),
  tokens: [
    ['colors.primary', '#112233', 'color'], ['colors.accent', '{colors.primary}', 'reference'], ['spacing.md', '16px', 'dimension'],
    ['typography.body.fontFamily', 'Inter', 'typography'], ['typography.body.fontSize', '14px', 'typography'],
  ],
  vars: ['--colors-primary: #112233;', '--colors-accent: var(--colors-primary);', '--spacing-md: 16px;', '--typography-body-fontFamily: Inter;', '--typography-body-fontSize: 14px;'],
  html: (eol) => ['<table><tbody>', '<!-- asd:tokens:start -->', 'stale row', '<!-- asd:tokens:end -->', '</tbody></table>', '<style>', '/* asd:vars:start */', ':root { --stale: 1; }', '/* asd:vars:end */', '</style>', '<p>keep me</p>', ''].join(eol),
};

test('sprint-033 AC-32: design-tokens rewrites only the two marked regions of design-system.html from the DESIGN.md front matter - token rows with a type chip, :root variables with references as var() - keeps the file\'s line endings, and a second run changes nothing', () => {
  const work = mkTempDir();
  const designFile = path.join(work, 'DESIGN.md');
  const htmlFile = path.join(work, 'design-system.html');
  fs.writeFileSync(designFile, DESIGN_FIXTURE.md, 'utf8');
  const rows = DESIGN_FIXTURE.tokens.map(([tokenPath, value, type]) => `      <tr><td><code>${tokenPath}</code></td><td>${value}</td><td><span class="chip area">${type}</span></td></tr>`);
  const expected = (eol) => DESIGN_FIXTURE.html(eol).replace('stale row', rows.join(eol)).replace(':root { --stale: 1; }', [':root {', ...DESIGN_FIXTURE.vars.map((declaration) => `  ${declaration}`), '}'].join(eol));
  for (const eol of ['\n', '\r\n']) {
    fs.writeFileSync(htmlFile, DESIGN_FIXTURE.html(eol), 'utf8');
    const run = () => runtimeCliResult(['design-tokens', '--design', designFile, '--html', htmlFile]);
    assert.deepStrictEqual(run(), { status: 0, result: { tokens: DESIGN_FIXTURE.tokens.length } }, 'the grouped tokens are counted, the top-level name is metadata');
    assert.strictEqual(fs.readFileSync(htmlFile, 'utf8'), expected(eol), `AC-32: both regions are rebuilt and every byte outside them, ${JSON.stringify(eol)} line endings included, is untouched`);
    const once = fs.readFileSync(htmlFile, 'utf8');
    run();
    assert.strictEqual(fs.readFileSync(htmlFile, 'utf8'), once, 'a second run is a no-op');
  }
});

test('sprint-033 AC-32: design-tokens fails naming the line on YAML beyond nested maps of scalars, and names the marker pair or the empty front matter it cannot work with, writing nothing', () => {
  const work = mkTempDir();
  const designFile = path.join(work, 'DESIGN.md');
  const htmlFile = path.join(work, 'design-system.html');
  const front = (...lines) => ['---', 'name: Demo', ...lines, '---', ''].join('\n');
  const run = () => runtimeCliResult(['design-tokens', '--design', designFile, '--html', htmlFile]);
  const html = DESIGN_FIXTURE.html('\n');
  for (const [label, text, line] of [
    ['a flow map', front('colors: { primary: "#fff" }'), 3],
    ['a block scalar', front('colors:', '  primary: >'), 4],
    ['a list item', front('colors:', '  - red'), 4],
    ['a duplicate key', front('colors:', '  primary: "#fff"', '  primary: "#000"'), 5],
    ['a tab indent', front('colors:', '\tprimary: "#fff"'), 4],
    ['an unterminated quote', front('colors:', '  primary: "#fff'), 4],
  ]) {
    fs.writeFileSync(designFile, text, 'utf8');
    fs.writeFileSync(htmlFile, html, 'utf8');
    const failed = run();
    assert.ok(failed.status === 2 && failed.stderr.includes(`${designFile}:${line}`), `${label} fails naming line ${line} (got ${JSON.stringify(failed)})`);
    assert.strictEqual(fs.readFileSync(htmlFile, 'utf8'), html, `${label}: the html is untouched`);
  }

  fs.writeFileSync(designFile, DESIGN_FIXTURE.md, 'utf8');
  for (const [label, broken, pattern] of [
    ['a missing vars end marker', html.replace('/* asd:vars:end */', ''), /needs exactly one \/\* asd:vars:start \*\/ \.\.\. \/\* asd:vars:end \*\/ marker pair/],
    ['a repeated tokens marker', html.replace('<!-- asd:tokens:start -->', '<!-- asd:tokens:start --><!-- asd:tokens:start -->'), /needs exactly one <!-- asd:tokens:start -->/],
    ['tokens markers in the wrong order', html.replace('<!-- asd:tokens:start -->', '@@S@@').replace('<!-- asd:tokens:end -->', '<!-- asd:tokens:start -->').replace('@@S@@', '<!-- asd:tokens:end -->'), /needs exactly one <!-- asd:tokens:start --> \.\.\. <!-- asd:tokens:end --> marker pair/],
  ]) {
    fs.writeFileSync(htmlFile, broken, 'utf8');
    const failed = run();
    assert.ok(failed.status === 2 && pattern.test(failed.stderr), `${label} fails naming the pair (got ${JSON.stringify(failed)})`);
    assert.strictEqual(fs.readFileSync(htmlFile, 'utf8'), broken, `${label}: nothing is written, the tokens region included`);
  }

  fs.writeFileSync(htmlFile, html, 'utf8');
  fs.writeFileSync(designFile, front(), 'utf8');
  assert.ok(/holds no tokens/.test(run().stderr), 'a front matter with metadata only has nothing to render');
  fs.writeFileSync(designFile, '# no front matter\n', 'utf8');
  assert.ok(run().stderr.includes(`${designFile}:1`), 'a file not opening with --- fails at line 1');
});

/** A sandbox git repo whose `.asd/project/config.yaml` holds a `git:` group with an `ai_attribution` line of `value`, none when `value` is null. */
function attributionRepo(value) {
  const sandbox = sandboxGitRepo();
  writeFile(sandbox.repo, '.asd/project/config.yaml', `git:\n  base_branch: main\n${value === null ? '' : `  ai_attribution: ${value}\n`}`);
  return sandbox;
}

/** Runs `commit-check --message-file` over `message` written to a fresh file, in the sandbox repo; returns the exit status, the parsed JSON report (null without stdout) and stderr. */
async function commitCheckMessage(sandbox, message) {
  const file = path.join(mkTempDir(), 'check.commit-msg');
  fs.writeFileSync(file, message, 'utf8');
  const { status, stdout, stderr } = await runtimeSpawnAsync(['commit-check', '--message-file', file], { cwd: sandbox.repo, env: sandbox.env });
  return { status, report: stdout === '' ? null : JSON.parse(stdout), stderr };
}

test('sprint-036 AC-12: commit-check --message-file reads the header from the first line, fails an ASD-Task line outside the last paragraph and names it, ignores trailing blank lines and CRLF, and takes exactly one of --subject and --message-file', async () => {
  const sandbox = attributionRepo(null);
  const HEADER = 'feat(x): add y';
  const TRAILERS = 'ASD-Task: Task 1\nASD-Task: D-2\nCo-Authored-By: Pair <pair@example.invalid>';
  const report = (ok, misplaced, length = HEADER.length) => ({ ok, header: { length, max: 50 }, memory: [], misplaced });
  const outcome = async (message) => {
    const { status, report: checked } = await commitCheckMessage(sandbox, message);
    return [status, checked];
  };
  const longHeader = `feat(x): ${'y'.repeat(50)}`;
  const file = path.join(mkTempDir(), 'both.commit-msg');
  fs.writeFileSync(file, `${HEADER}\n`, 'utf8');
  const [full, bare, glued, gluedBody, noBlank, blanks, crlf, long, ...refusals] = await Promise.all([
    outcome(`${HEADER}\n\nWhy.\n\n${TRAILERS}\n`),
    outcome(`${HEADER}\n`),
    outcome(`${HEADER}\n\nASD-Task: Task 1\n\nA body paragraph after the trailer.\n`),
    outcome(`${HEADER}\nASD-Task: Task 1\n\nBody.\n`),
    outcome(`${HEADER}\nASD-Task: Task 1\n`),
    outcome(`${HEADER}\n\nASD-Task: Task 1\n\n\n`),
    outcome(`${HEADER}\r\n\r\nASD-Task: Task 1\r\n`),
    outcome(`${longHeader}\n\nASD-Task: Task 1\n`),
    ...[
      ['both flags', ['commit-check', '--subject', HEADER, '--message-file', file]],
      ['an empty message-file path', ['commit-check', '--message-file', '']],
      ['neither flag', ['commit-check']],
    ].map(async ([label, args]) => [label, await runtimeSpawnAsync(args, { cwd: sandbox.repo, env: sandbox.env })]),
  ]);

  assert.deepStrictEqual(full, [0, report(true, [])], 'AC-12: every ASD-Task line in the final paragraph, beside a Co-Authored-By line, passes');
  assert.deepStrictEqual(bare, [0, report(true, [])], 'AC-12: a message with no trailer has none misplaced');
  assert.deepStrictEqual(glued, [1, report(false, ['ASD-Task: Task 1'])], 'AC-12: an ASD-Task line followed by a body paragraph fails the check and is named');
  assert.deepStrictEqual(gluedBody, [1, report(false, ['ASD-Task: Task 1'])], 'AC-12: an ASD-Task line glued under the header is outside the last paragraph');
  assert.deepStrictEqual(noBlank, [1, report(false, ['ASD-Task: Task 1'])], 'AC-12: a message with no blank line is all subject paragraph, so a trailer directly under the header is misplaced');
  assert.deepStrictEqual(blanks, [0, report(true, [])], 'AC-12: trailing blank lines do not move the last paragraph');
  assert.deepStrictEqual(crlf, [0, report(true, [])], 'AC-12: a CRLF message measures its header without the carriage return and finds its last paragraph');
  assert.deepStrictEqual(long, [1, report(false, [], longHeader.length)], 'AC-12: the header limit applies to the message file\'s first line');

  assert.deepStrictEqual(refusals.map(([label, run]) => [label, run.status, run.stdout, /commit-check takes --subject/.test(run.stderr)]), refusals.map(([label]) => [label, 2, '', true]), 'AC-12: exactly one of --subject and --message-file, never both, neither or an empty path, and nothing is reported');
});

test('sprint-036 AC-16: under git.ai_attribution disabled commit-check fails a Claude or Codex Co-authored-by trailer in any key case and lists it, passes a human co-author, and reports no ai_attribution under enabled or an absent key', async () => {
  const CLAUDE = 'Co-authored-by: Claude <noreply@anthropic.com>';
  const CODEX = 'CO-AUTHORED-BY: Codex <noreply@openai.com>';
  const HUMAN = 'Co-Authored-By: Pair <pair@example.invalid>';
  const message = (...trailers) => `feat(x): add y\n\nASD-Task: Task 1\n${trailers.join('\n')}\n`;
  const disabled = attributionRepo('disabled');
  const CODEX_HOST_HUMAN = 'Co-authored-by: Pat <pat@codex.dev>';
  const NAME_ONLY = 'Co-authored-by: Claude';
  const BOT_ADDRESSES = ['Co-authored-by: Helper <noreply@anthropic.com>', 'Co-authored-by: Helper <NoReply@OpenAI.com>'];
  const [flagged, human, humanOnCodexHost, identities] = await Promise.all([
    commitCheckMessage(disabled, message(CLAUDE, CODEX, HUMAN)),
    commitCheckMessage(disabled, message(HUMAN)),
    commitCheckMessage(disabled, message(CODEX_HOST_HUMAN)),
    commitCheckMessage(disabled, message(NAME_ONLY, ...BOT_ADDRESSES, CODEX_HOST_HUMAN)),
  ]);

  assert.deepStrictEqual([flagged.status, flagged.report.ok, flagged.report.ai_attribution, flagged.report.misplaced], [1, false, [CLAUDE, CODEX], []], 'AC-16: each Claude or Codex trailer is listed whatever its key case, a human co-author beside them is not, and the commit fails');
  assert.deepStrictEqual([human.status, human.report.ok, human.report.ai_attribution], [0, true, []], 'AC-16: a human Co-Authored-By passes under disabled');
  assert.deepStrictEqual([humanOnCodexHost.status, humanOnCodexHost.report.ai_attribution], [0, []], 'AC-16: a human whose address merely contains the word codex is not an AI trailer');
  assert.deepStrictEqual([identities.status, identities.report.ai_attribution], [1, [NAME_ONLY, ...BOT_ADDRESSES]], 'AC-16: the identity is parsed - a name-only Claude and either bot address under any name are rejected, a human beside them is not');
  for (const value of ['enabled', null]) {
    const enabled = await commitCheckMessage(attributionRepo(value), message(CLAUDE, CODEX));
    assert.deepStrictEqual([enabled.status, enabled.report.ok, 'ai_attribution' in enabled.report], [0, true, false], `AC-16: ai_attribution ${value === null ? 'absent' : value} rejects nothing and adds no report field`);
  }
});

test('sprint-036 AC-16: attribution-check is silent under enabled or an absent key; under disabled it resets each re-enabling entry of .claude/settings.json and settings.local.json keeping every other key and the indentation, reports one line per fix, leaves a malformed or non-object file untouched with a stderr warning, and prints the Codex hint only when .codex/ exists', () => {
  const REENABLING = { attribution: { commit: 'Co-authored-by: Claude <noreply@anthropic.com>', pr: 'Generated with Claude Code' }, includeCoAuthoredBy: true, permissions: { allow: ['Bash(git *)'] }, model: 'opus' };
  const textOf = (settings) => `${JSON.stringify(settings, null, 4)}\n`;
  const run = (sandbox) => runtimeSpawn(['attribution-check'], { cwd: sandbox.repo, env: sandbox.env });
  const readFrom = (sandbox, rel) => fs.readFileSync(path.join(sandbox.repo, rel), 'utf8');

  for (const value of ['enabled', null]) {
    const quiet = attributionRepo(value);
    writeFile(quiet.repo, '.claude/settings.json', textOf(REENABLING));
    writeFile(quiet.repo, '.codex/config.toml', '');
    const outcome = run(quiet);
    assert.deepStrictEqual([outcome.status, outcome.stdout, outcome.stderr, readFrom(quiet, '.claude/settings.json')], [0, '', '', textOf(REENABLING)], `AC-16: ai_attribution ${value === null ? 'absent' : value} prints nothing, warns of nothing and rewrites nothing, a Codex view and a re-enabling entry notwithstanding`);
  }

  const sandbox = attributionRepo('disabled');
  writeFile(sandbox.repo, '.claude/settings.json', textOf(REENABLING));
  writeFile(sandbox.repo, '.claude/settings.local.json', textOf({ includeCoAuthoredBy: true, env: { KEEP: '1' } }));
  const first = run(sandbox);
  assert.deepStrictEqual([first.status, first.stdout.trimEnd().split('\n'), first.stderr], [0, [
    'attribution: .claude/settings.json: attribution.commit reset to ""',
    'attribution: .claude/settings.json: attribution.pr reset to ""',
    'attribution: .claude/settings.json: includeCoAuthoredBy set to false',
    'attribution: .claude/settings.local.json: includeCoAuthoredBy set to false',
  ], ''], 'AC-16: one line per fix, project settings first and local settings second, and no Codex hint without a .codex/ directory');
  assert.strictEqual(readFrom(sandbox, '.claude/settings.json'), textOf({ ...REENABLING, attribution: { commit: '', pr: '' }, includeCoAuthoredBy: false }), 'AC-16: only the re-enabling values change - reset, not deleted - and every other key, its order and the 4-space indentation stay');
  assert.strictEqual(readFrom(sandbox, '.claude/settings.local.json'), textOf({ includeCoAuthoredBy: false, env: { KEEP: '1' } }), 'AC-16: the local settings file is cleaned the same way');
  assert.strictEqual(run(sandbox).stdout, '', 'AC-16: a second run finds nothing to fix and prints nothing');

  const broken = attributionRepo('disabled');
  writeFile(broken.repo, '.claude/settings.json', textOf(REENABLING));
  writeFile(broken.repo, '.claude/settings.local.json', '{ not json');
  const malformed = run(broken);
  assert.deepStrictEqual([malformed.status, /settings\.local\.json is not valid JSON, left untouched/.test(malformed.stderr), /attribution\.commit reset/.test(malformed.stdout), readFrom(broken, '.claude/settings.local.json')], [0, true, true, '{ not json'], 'AC-16: a malformed file is left untouched with a warning and the other file is still fixed');
  writeFile(broken.repo, '.claude/settings.local.json', '[]');
  const nonObject = run(broken);
  assert.deepStrictEqual([nonObject.status, /settings\.local\.json is not a JSON object, left untouched/.test(nonObject.stderr), readFrom(broken, '.claude/settings.local.json')], [0, true, '[]'], 'AC-16: a JSON document that is no object is left untouched with a warning');

  const codex = attributionRepo('disabled');
  writeFile(codex.repo, '.codex/config.toml', '');
  const hint = run(codex);
  assert.ok(hint.status === 0 && /^codex: .*workspace setting/.test(hint.stdout) && hint.stdout.trimEnd().split('\n').length === 1, `AC-16: a Codex view alone gets exactly the one-line workspace-setting hint (got ${JSON.stringify(hint)})`);
});

/** `settings.local.json` text for the attribution-check byte-preservation cases: a compact one-line object, an object with an inline array and an irregular-spacing member, and the same with CRLF; each paired with the text expected after the one re-enabling value is reset. */
function byteKeepingCases() {
  const OFF_OBJECT = '{\n    "commit": "",\n    "pr": ""\n  }';
  const compact = '{"permissions":{"allow":["Bash(git *)"]},"includeCoAuthoredBy":true,"model":"opus"}';
  const spaced = '{\n  "permissions": {"allow": ["a",   "b"]},\n  "attribution": {"commit": "x", "pr": "y"},\n  "model":   "opus"\n}\n';
  return [
    ['a compact layout', compact, compact.replace('true', 'false')],
    ['an inline array and irregular spacing', spaced, spaced.replace('{"commit": "x", "pr": "y"}', OFF_OBJECT)],
    ['CRLF line endings', spaced.replace(/\n/g, '\r\n'), spaced.replace('{"commit": "x", "pr": "y"}', OFF_OBJECT).replace(/\n/g, '\r\n')],
  ];
}

test('sprint-036 AC-16: attribution-check splices only the attribution keys it resets into a settings file and keeps every other byte - a compact layout, an inline array, irregular spacing and CRLF included', () => {
  const run = (sandbox) => runtimeSpawn(['attribution-check'], { cwd: sandbox.repo, env: sandbox.env });
  const observed = byteKeepingCases().map(([label, text]) => {
    const sandbox = attributionRepo('disabled');
    writeFile(sandbox.repo, '.claude/settings.local.json', text);
    const outcome = run(sandbox);
    return [label, outcome.status, outcome.stderr, fs.readFileSync(path.join(sandbox.repo, '.claude/settings.local.json'), 'utf8')];
  });
  assert.deepStrictEqual(observed, byteKeepingCases().map(([label, , expected]) => [label, 0, '', expected]), 'AC-16: the reset changes the value span of each re-enabling key and nothing else, the file keeping its layout and line endings');
});

test('sprint-036 AC-16 (external 1, 3): attribution-check whose in-place write of a settings file fails - a thrown or short writeSync, a failed ftruncateSync - restores the original bytes through the same descriptor and warns it is left untouched, and warns it may be damaged only when the restore fails too; both exit 0 and still clean the other file', () => {
  const RE_ENABLING = `${JSON.stringify({ includeCoAuthoredBy: true }, null, 2)}\n`;
  const SCRAMBLED = '#####';
  const stubDir = path.join(mkTempDir(), 'stub dir');
  fs.mkdirSync(stubDir);
  const stub = path.join(stubDir, 'descriptorWrites.js');
  const stubSource = [
    "const fs = require('fs');",
    'const { openSync, closeSync, writeSync, ftruncateSync } = fs;',
    'const targets = new Set();',
    'let failures = Number(process.env.STUB_FAILURES);',
    'const fails = (fd, mode) => process.env.STUB_MODE === mode && targets.has(fd) && failures > 0 && (failures -= 1, true);',
    "fs.openSync = (...args) => { const fd = openSync(...args); if (String(args[0]).endsWith('settings.local.json')) targets.add(fd); return fd; };",
    'fs.closeSync = (fd) => { targets.delete(fd); return closeSync(fd); };',
    `fs.writeSync = (fd, buffer, ...rest) => { if (fails(fd, 'write')) { writeSync(fd, Buffer.from('${SCRAMBLED}'), 0, ${SCRAMBLED.length}, 0); throw new Error('EIO: stubbed writeSync failure'); } if (fails(fd, 'short')) { writeSync(fd, buffer, ...rest); return buffer.length - 1; } return writeSync(fd, buffer, ...rest); };`,
    "fs.ftruncateSync = (fd, length) => { if (fails(fd, 'truncate')) throw new Error('EIO: stubbed ftruncateSync failure'); return ftruncateSync(fd, length); };",
  ].join('\n');
  fs.writeFileSync(stub, `${stubSource}\n`, 'utf8');
  const run = (mode, failures) => {
    const sandbox = attributionRepo('disabled');
    writeFile(sandbox.repo, '.claude/settings.json', RE_ENABLING);
    writeFile(sandbox.repo, '.claude/settings.local.json', RE_ENABLING);
    const outcome = runtimeSpawn(['attribution-check'], { cwd: sandbox.repo, env: { ...sandbox.env, STUB_MODE: mode, STUB_FAILURES: String(failures), NODE_OPTIONS: `--require "${stub.split(path.sep).join('/')}"` } });
    const claudeDir = path.join(sandbox.repo, '.claude');
    return [outcome.status, outcome.stderr, fs.readFileSync(path.join(claudeDir, 'settings.local.json'), 'utf8'), JSON.parse(fs.readFileSync(path.join(claudeDir, 'settings.json'), 'utf8')).includeCoAuthoredBy];
  };
  const untouched = (cause) => `runtime: .claude/settings.local.json could not be rewritten (${cause}), left untouched\n`;
  const damaged = (cause) => `runtime: .claude/settings.local.json could not be rewritten (${cause}) and may be damaged; restore it from git\n`;
  const REWRITTEN_TAIL = RE_ENABLING.replace('true', 'false').slice(-1);

  assert.deepStrictEqual(run('write', 1), [0, untouched('EIO: stubbed writeSync failure'), RE_ENABLING, false], 'AC-16: a write failing after changing the first bytes is restored through the descriptor, the warning states the file untouched and its bytes are the original; the other file is still cleaned');
  assert.deepStrictEqual(run('write', 2), [0, damaged('EIO: stubbed writeSync failure'), SCRAMBLED + RE_ENABLING.slice(SCRAMBLED.length), false], 'AC-16: a failed restore is reported as damage with its remedy, never as untouched');
  assert.deepStrictEqual(run('short', 1), [0, untouched('short write'), RE_ENABLING, false], 'AC-16: a short write count is a failure and the original is restored');
  assert.deepStrictEqual(run('truncate', 1), [0, untouched('EIO: stubbed ftruncateSync failure'), RE_ENABLING, false], 'AC-16: a failed final cut leaves a longer file, which the restore writes over and cuts back to the original');
  assert.deepStrictEqual(run('truncate', 2), [0, damaged('EIO: stubbed ftruncateSync failure'), RE_ENABLING + REWRITTEN_TAIL, false], 'AC-16: a restore whose cut also fails is damage - the original bytes plus the uncut tail');
});

test('sprint-036 AC-16 (external 1): attribution-check overwrites a settings file in place so it holds exactly the new bytes - a shorter replacement leaves no padding, a longer one is complete, multibyte text counted in bytes', () => {
  const COMMIT = 'Co-authored-by: Клод <noreply@anthropic.com>';
  const PR = 'Generated with Claude Code';
  const shorter = `${JSON.stringify({ attribution: { commit: COMMIT, pr: PR }, model: 'opus' }, null, 2)}\n`;
  const longer = '{"includeCoAuthoredBy":true}';
  const shorterExpected = `${JSON.stringify({ attribution: { commit: '', pr: '' }, model: 'opus' }, null, 2)}\n`;
  const sandbox = attributionRepo('disabled');
  writeFile(sandbox.repo, '.claude/settings.json', shorter);
  writeFile(sandbox.repo, '.claude/settings.local.json', longer);
  const outcome = runtimeSpawn(['attribution-check'], { cwd: sandbox.repo, env: sandbox.env });
  const readBytes = (rel) => fs.readFileSync(path.join(sandbox.repo, rel));
  assert.strictEqual(outcome.status, 0, 'AC-16: the check exits 0');
  assert.ok(Buffer.byteLength(shorterExpected) < Buffer.byteLength(shorter) && Buffer.byteLength('{"includeCoAuthoredBy":false}') > Buffer.byteLength(longer), 'sanity: one file shrinks and the other grows');
  assert.deepStrictEqual([readBytes('.claude/settings.json'), readBytes('.claude/settings.local.json')], [Buffer.from(shorterExpected), Buffer.from('{"includeCoAuthoredBy":false}')], 'AC-16: each file is exactly the new text - the shorter one cut where the new text ends, with no trailing spaces, the longer one whole');
});

test('sprint-036 AC-16: attribution-check skips a file named after -- with its stderr warning, still cleans the other file and prints the Codex hint, and exits 2 on a flag other than -- or a path outside the two settings files', () => {
  const RE_ENABLING = `${JSON.stringify({ includeCoAuthoredBy: true }, null, 2)}\n`;
  const sandbox = attributionRepo('disabled');
  writeFile(sandbox.repo, '.claude/settings.json', RE_ENABLING);
  writeFile(sandbox.repo, '.claude/settings.local.json', RE_ENABLING);
  writeFile(sandbox.repo, '.codex/config.toml', '');
  const run = (...args) => runtimeSpawn(['attribution-check', ...args], { cwd: sandbox.repo, env: sandbox.env });
  const read = (rel) => fs.readFileSync(path.join(sandbox.repo, rel), 'utf8');

  const skipped = run('--', '.claude/settings.json');
  const [fixLine, hintLine, ...rest] = skipped.stdout.trimEnd().split('\n');
  assert.deepStrictEqual([skipped.status, skipped.stderr, fixLine, /^codex: .*workspace setting/.test(hintLine), rest, read('.claude/settings.json')], [0, 'runtime: .claude/settings.json has uncommitted changes, left untouched: commit or revert it\n', 'attribution: .claude/settings.local.json: includeCoAuthoredBy set to false', true, [], RE_ENABLING], 'AC-16: the listed file is left untouched with the commit-or-revert warning, the other file is cleaned and the Codex hint still prints');
  assert.strictEqual(JSON.parse(read('.claude/settings.local.json')).includeCoAuthoredBy, false, 'AC-16: the unlisted file is rewritten');

  const refusals = [['a flag', ['--only']], ['a flag before the separator', ['--only', '--', '.claude/settings.json']], ['a path outside the two settings files', ['--', 'package.json']], ['a settings file of another name', ['--', '.claude/settings.other.json']]];
  assert.deepStrictEqual(refusals.map(([label, args]) => [label, run(...args).status]), refusals.map(([label]) => [label, 2]), 'AC-16: only -- followed by the two project settings files is accepted');
});

test('sprint-036 AC-16: attribution-check leaves a settings file untouched with a stderr warning when the file or its .claude directory is a symlink or junction - the target outside the repo or inside it - and cleans a plain file', () => {
  const REENABLING = `${JSON.stringify({ attribution: { commit: 'x', pr: 'y' }, includeCoAuthoredBy: true }, null, 2)}\n`;
  const run = (sandbox) => runtimeSpawn(['attribution-check'], { cwd: sandbox.repo, env: sandbox.env });
  const warning = (settings) => `runtime: .claude/${settings} or its directory is a symlink or junction, left untouched\n`;
  const targetIn = (dir, name) => {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), REENABLING, 'utf8');
    return path.join(dir, name);
  };

  const control = attributionRepo('disabled');
  writeFile(control.repo, '.claude/settings.json', REENABLING);
  const cleaned = run(control);
  assert.deepStrictEqual([cleaned.status, cleaned.stderr, JSON.parse(fs.readFileSync(path.join(control.repo, '.claude/settings.json'), 'utf8')).includeCoAuthoredBy], [0, '', false], 'AC-16: control - the same file in a real .claude directory is cleaned');

  for (const [label, where] of [['outside the repo', () => path.join(mkTempDir(), 'claude-real')], ['inside the repo', (repo) => path.join(repo, 'claude-real')]]) {
    const linkedDir = attributionRepo('disabled');
    const behind = targetIn(where(linkedDir.repo), 'settings.json');
    fs.symlinkSync(path.dirname(behind), path.join(linkedDir.repo, '.claude'), 'junction');
    const refused = run(linkedDir);
    assert.deepStrictEqual([refused.status, refused.stdout, refused.stderr, fs.readFileSync(behind, 'utf8')], [0, '', warning('settings.json'), REENABLING], `AC-16: a .claude directory linked ${label} is refused with a warning and the file behind it is untouched`);
  }

  for (const [label, where] of [['outside the repo', () => mkTempDir()], ['inside the repo', (repo) => path.join(repo, 'local-real')]]) {
    const linkedFile = attributionRepo('disabled');
    const behind = targetIn(where(linkedFile.repo), 'local.json');
    fs.mkdirSync(path.join(linkedFile.repo, '.claude'));
    try {
      fs.symlinkSync(behind, path.join(linkedFile.repo, '.claude', 'settings.local.json'), 'file');
    } catch (_) {
      console.log('  (skipped the file-link assertions: fs.symlinkSync unsupported in this environment)');
      return;
    }
    const fileRefused = run(linkedFile);
    assert.deepStrictEqual([fileRefused.status, fileRefused.stderr, fs.readFileSync(behind, 'utf8')], [0, warning('settings.local.json'), REENABLING], `AC-16: a settings file that is itself a link ${label} is refused and its target untouched`);
  }
});

const LEDGER_LINE = 'attribution: .asd/sync-state.json: recorded the owned attribution of .claude/settings.json\n';

test('sprint-036 AC-15/AC-16 (external 1, 2, 5): attribution-check under disabled inserts the missing owned attribution value into .claude/settings.json with one fix line and records it as sync\'s, keeps the owned-array digest so sync reads current, never writes the release manifest or settings.local.json, and a later enabled apply drops the value with its record', () => {
  const settingsRel = '.claude/settings.json';
  const repo = disabledAttributionRepo();
  const localText = `${JSON.stringify({ env: { KEEP: '1' } }, null, 2)}\n`;
  writeFile(repo.root, '.claude/settings.local.json', localText);
  const before = { settings: repo.read(settingsRel), manifest: repo.read('.asd/release-manifest.json'), entry: repo.entry() };
  assert.strictEqual(repo.statusOf(), 'stale', 'AC-15: control - the owned attribution value is missing, so sync reads the file stale');

  const check = repo.check();
  const after = repo.entry();
  assert.deepStrictEqual([check.status, check.stdout, check.stderr], [0, `attribution: ${settingsRel}: attribution set to {"commit":"","pr":""}\n${LEDGER_LINE}`, ''], 'AC-16: one fix line names the inserted value, a second names the ledger that saved its record, and nothing is warned');
  assert.deepStrictEqual([JSON.parse(repo.read(settingsRel)), after.owned_keys, after.kind, after.content_digest], [{ ...JSON.parse(before.settings), attribution: OFF_VALUE }, ['attribution'], before.entry.kind, before.entry.content_digest], 'AC-15: only the attribution value is inserted, recorded as sync\'s, and the entry keeps its kind and owned-array digest');
  assert.deepStrictEqual([repo.statusOf(), repo.read('.asd/release-manifest.json'), repo.read('.claude/settings.local.json')], ['current', before.manifest, localText], 'AC-15: sync --check reads current afterwards; the release manifest bytes and settings.local.json are untouched');
  assert.strictEqual(repo.check().stdout, '', 'AC-16: a second check finds the value in place and reports nothing');

  writeFile(repo.root, '.asd/project/config.yaml', 'git:\n  ai_attribution: enabled\n');
  sync.runApply(repo.root, [settingsRel]);
  assert.deepStrictEqual([repo.read(settingsRel), repo.statusOf(), recordedOwnedKeys(repo.root)], [before.settings, 'current', undefined], 'AC-15: flipping to enabled and applying drops the inserted value and its record');
});

test('sprint-036 AC-15/AC-16 (external 5): attribution-check replaces a present attribution value that is not the owned one - a missing pr, a non-object, extra members - and records it, while settings.local.json is never given the owned value or recorded', () => {
  const settingsRel = '.claude/settings.json';
  const localText = `${JSON.stringify({ attribution: { commit: '' }, model: 'opus' }, null, 2)}\n`;
  const shapes = [['a missing pr', { commit: '' }], ['a non-object value', 'none'], ['extra members', { commit: '', pr: '', extra: 1 }]];
  const observed = shapes.map(([label, shape]) => {
    const repo = disabledAttributionRepo({ attribution: shape });
    writeFile(repo.root, '.claude/settings.local.json', localText);
    const check = repo.check();
    return [label, check.status, check.stdout, check.stderr, JSON.parse(repo.read(settingsRel)).attribution, repo.entry().owned_keys, repo.statusOf(), repo.read('.claude/settings.local.json')];
  });
  assert.deepStrictEqual(observed, shapes.map(([label]) => [label, 0, `attribution: ${settingsRel}: attribution replaced by {"commit":"","pr":""}\n${LEDGER_LINE}`, '', OFF_VALUE, ['attribution'], 'current', localText]), 'AC-16: each non-owned shape is replaced by the owned value with a "replaced by" line, recorded, and the local file with its own incomplete attribution stays as it was');
});

test('sprint-036 AC-15/AC-16 (external 5): attribution-check with no sync-state record of .claude/settings.json inserts the value and writes nothing to the sync state - an absent file stays absent, an empty one keeps its bytes', () => {
  const settingsRel = '.claude/settings.json';
  const noState = attributionRepo('disabled');
  writeFile(noState.repo, settingsRel, `${JSON.stringify({ model: 'opus' }, null, 2)}\n`);
  const absent = runtimeSpawn(['attribution-check'], { cwd: noState.repo, env: noState.env });
  assert.deepStrictEqual([absent.status, absent.stdout, absent.stderr, JSON.parse(fs.readFileSync(path.join(noState.repo, settingsRel), 'utf8')).attribution, fs.existsSync(path.join(noState.repo, '.asd', 'sync-state.json'))], [0, `attribution: ${settingsRel}: attribution set to {"commit":"","pr":""}\n`, '', OFF_VALUE, false], 'AC-15: the value is inserted and no sync-state file is created');

  const emptyState = makeMiniRepo();
  writeFile(emptyState, '.asd/project/config.yaml', 'git:\n  ai_attribution: disabled\n');
  writeFile(emptyState, settingsRel, `${JSON.stringify({ model: 'opus' }, null, 2)}\n`);
  const stateBefore = fs.readFileSync(path.join(emptyState, '.asd', 'sync-state.json'), 'utf8');
  const empty = runtimeSpawn(['attribution-check'], { cwd: emptyState });
  assert.deepStrictEqual([empty.status, empty.stderr, JSON.parse(fs.readFileSync(path.join(emptyState, settingsRel), 'utf8')).attribution, fs.readFileSync(path.join(emptyState, '.asd', 'sync-state.json'), 'utf8')], [0, '', OFF_VALUE, stateBefore], 'AC-15: a file sync never applied reads as the user\'s, so its sync-state bytes are unchanged');
});

test('sprint-036 AC-16 (external 3): attribution-check over a symlinked .asd/sync-state.json or a linked .asd directory inserts the value, warns its record could not be saved, names no ledger line and leaves the linked ledger byte-identical', () => {
  const settingsRel = '.claude/settings.json';
  const warning = `runtime: ${settingsRel} was fixed but its record in .asd/sync-state.json could not be saved (.asd/sync-state.json or .asd is a symlink or junction), run /asd-sync\n`;
  const FIX_LINE = `attribution: ${settingsRel}: attribution set to {"commit":"","pr":""}\n`;
  const cases = linkedLedgerCases();
  const outcomes = cases.map(([label, { repo, behind }]) => {
    const ledgerBefore = fs.readFileSync(behind, 'utf8');
    const check = repo.check();
    return [label, check.status, check.stdout, check.stderr, fs.readFileSync(behind, 'utf8') === ledgerBefore, JSON.parse(repo.read(settingsRel)).attribution];
  });
  assert.deepStrictEqual(outcomes, outcomes.map(([label]) => [label, 0, FIX_LINE, warning, true, OFF_VALUE]), 'AC-16: the settings value is inserted, the failed record is a warning, the ledger line is absent and the link\'s target keeps its bytes');
});

test('sprint-036 AC-16 (external 1, iter-06): attribution-check over a linked ledger holding invalid JSON warns its record could not be saved without any text of the linked file in stdout or stderr, and leaves that file byte-identical', () => {
  const MARKER = 'LINKED-LEDGER-SECRET-MARKER';
  const warning = 'could not be saved (.asd/sync-state.json or .asd is a symlink or junction), run /asd-sync\n';
  const outcomes = linkedLedgerCases().map(([label, { repo, behind }]) => {
    const invalid = `{ "entries": ${MARKER} `;
    fs.writeFileSync(behind, invalid, 'utf8');
    const check = repo.check();
    return [label, check.status, check.stderr.endsWith(warning), `${check.stdout}${check.stderr}`.includes(MARKER), fs.readFileSync(behind, 'utf8') === invalid];
  });
  assert.deepStrictEqual(outcomes, outcomes.map(([label]) => [label, 0, true, false, true]), 'AC-16: the linked file is refused before it is parsed, so the warning carries none of its text and its bytes stay');
});

test('sprint-036 AC-16 (external 4): attribution-check whose read of one settings file fails warns that file could not be read and is left untouched, exits 0, and still cleans the other file and prints the Codex hint', () => {
  const sandbox = attributionRepo('disabled');
  fs.mkdirSync(path.join(sandbox.repo, '.claude', 'settings.json'), { recursive: true });
  writeFile(sandbox.repo, '.claude/settings.local.json', `${JSON.stringify({ includeCoAuthoredBy: true }, null, 2)}\n`);
  writeFile(sandbox.repo, '.codex/config.toml', '');

  const outcome = runtimeSpawn(['attribution-check'], { cwd: sandbox.repo, env: sandbox.env });

  const [fixLine, hintLine, ...rest] = outcome.stdout.trimEnd().split('\n');
  assert.deepStrictEqual([outcome.status, /^runtime: \.claude\/settings\.json could not be read \(.+\), left untouched\n$/.test(outcome.stderr), fixLine, /^codex: /.test(hintLine), rest], [0, true, 'attribution: .claude/settings.local.json: includeCoAuthoredBy set to false', true, []], 'AC-16: the unreadable first file is a warning, the second file is cleaned and the Codex hint still prints');
});

test('sprint-037 AC-3/AC-13: test-delta splits the sprint diff by the test_paths rule and requires an allowance past 200 net test lines above the other net, and impl-test-close refuses a plan with no Added tests section, an Added tests row with an empty or placeholder Gap proof and, at the green exit, an unallowanced required delta, recording Line delta otherwise', async () => {
  const sandbox = sandboxGitRepo();
  const { repo, env } = sandbox;
  const numbered = (count) => `${Array.from({ length: count }, (unused, index) => `line ${index}`).join('\n')}\n`;
  const [base] = await importCommits(sandbox, [{}, { 'tests/big_test.js': numbered(250), 'src/a.js': numbered(5) }]);
  const work = mkTempDir();
  const commands = path.join(work, 'commands.yaml');
  fs.writeFileSync(commands, 'test_paths: "tests/**"\n', 'utf8');
  const delta = (ref) => runtimeCliResultAsync(['test-delta', '--base', ref, '--commands', commands], { cwd: repo, env });

  const gapRow = (gap) => ['| Test | Gap proof | Regression proof |', '|---|---|---|', `| a.js:t | ${gap} | n/a |`];
  const plan = (added, suiteRun = ['- Command: node tests/run.js']) => ['# Test plan', '', '## Entry log', '', '| Entry | HEAD analysed | Scope |', '|---|---|---|', '| 1 |  | full change surface |', '', '## Added tests', '', ...added, '', '## Suite run', '', ...suiteRun, ''].join('\n');
  let runs = 0;
  const close = async (text, ...extra) => {
    runs += 1;
    const planFile = path.join(work, `test-plan-${runs}.md`);
    const logFile = path.join(work, `decisions-log-${runs}.md`);
    fs.writeFileSync(planFile, text, 'utf8');
    fs.writeFileSync(logFile, '', 'utf8');
    const outcome = await runtimeCliResultAsync(['impl-test-close', '--test-plan', planFile, '--entry', '1', '--decisions', logFile, '--line', 'impl-test: closed', ...extra], { cwd: repo, env });
    return { ...outcome, plan: () => fs.readFileSync(planFile, 'utf8') };
  };
  const green = (text, ref) => close(text, '--green', '--base', ref, '--commands', commands);
  const proven = gapRow('seeded x: node tests/run.js -> exit 0');
  const [measured, empty, emptyGap, noGapColumn, filled, noRow, noAllowance, allowed, notRequired, noBase, noGreen, noSection, placeholder] = await Promise.all([
    delta(base),
    delta('HEAD'),
    close(plan(gapRow(''))),
    close(plan(['| Test | Regression proof |', '|---|---|', '| a.js:t | n/a |'])),
    close(plan(gapRow('search x in tests: no test of the unit'))),
    close(plan(['| Test | Gap proof | Regression proof |', '|---|---|---|'])),
    green(plan(proven), base),
    green(plan(proven, ['- Allowance: covers the AC-3 risk']), base),
    green(plan(proven), 'HEAD'),
    close(plan(gapRow('seeded x')), '--green'),
    close(plan(gapRow('seeded x')), '--base', base),
    close(plan(gapRow('seeded x')).replace('## Added tests', '## Other')),
    close(plan(gapRow('{{seeded defect}}'))),
  ]);
  const refused = (result, pattern, label) => assert.ok(result.status === 2 && pattern.test(result.stderr), `${label} (got ${JSON.stringify(result)})`);

  assert.deepStrictEqual(measured, { status: 0, result: { test: { added: 250, removed: 0, net: 250 }, other: { added: 5, removed: 0, net: 5 }, allowance_required: true } });
  assert.strictEqual(empty.result.allowance_required, false, 'an empty diff needs no allowance');
  refused(emptyGap, /empty Gap proof cell/, 'a row with an empty Gap proof is refused');
  refused(noGapColumn, /no Gap proof column/, 'a table with rows and no Gap proof column is refused');
  refused(noSection, /has no ## Added tests section/, 'a plan with no Added tests section is refused');
  refused(placeholder, /unresolved {{…}} Gap proof placeholder/, 'a template placeholder left as the Gap proof is refused');
  assert.strictEqual(filled.status, 0, 'a filled Gap proof closes');
  assert.strictEqual(noRow.status, 0, 'a table with no row needs no proof');
  refused(noAllowance, /needs a non-empty "- Allowance:" line/, 'a required allowance missing refuses the green exit');
  assert.ok(!noAllowance.plan().includes('Line delta'), 'the refused close recorded no delta');
  assert.strictEqual(allowed.status, 0, 'an allowance line lets the green exit through');
  assert.ok(allowed.plan().includes('- Line delta: tests +250/−0 (net 250); other +5/−0 (net 5)'), 'the delta is recorded in Suite run');
  assert.strictEqual(notRequired.status, 0, 'no allowance is needed when none is required');
  refused(noBase, /--green requires --base/, '--green without --base is refused');
  refused(noGreen, /apply with --green only/, '--base without --green is refused');
});

test('sprint-037 AC-5: stubs-due lists an accepted-debt row with no review date, an impossible calendar date or a date before today, and no row dated today or later, no plain stub and no row of another reason', () => {
  const stubs = path.join(mkTempDir(), 'stubs.md');
  const row = (file, reason) => `| 037-x | ${file} | ${reason} | asd-dev |`;
  fs.writeFileSync(stubs, ['| Sprint | File:Line | Reason | Owner |', '|---|---|---|---|', row('past.js:1', '(accepted-debt) review 2026-11-17: gone'), row('absent.js:1', '(accepted-debt) no date'), row('fake.js:1', '(accepted-debt) review 2026-02-30: impossible'), row('today.js:1', '(accepted-debt) review 2026-11-18: held'), row('future.js:1', '(accepted-debt) review 2027-01-01: held'), row('plain.js:1', 'unfinished'), ''].join('\n'), 'utf8');
  assert.deepStrictEqual(runtimeCliResult(['stubs-due', '--stubs', stubs, '--today', '2026-11-18']), { status: 0, result: { due: [{ file: 'past.js:1', state: 'expired', date: '2026-11-17' }, { file: 'absent.js:1', state: 'missing', date: null }, { file: 'fake.js:1', state: 'invalid', date: '2026-02-30' }] } });
  assert.notStrictEqual(runtimeCliResult(['stubs-due', '--stubs', stubs, '--today', 'later']).status, 0, 'a malformed --today is refused');
});
