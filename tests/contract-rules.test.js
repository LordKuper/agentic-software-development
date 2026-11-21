'use strict';

// content contracts of the rule docs

const { assert, fs, path, execFileSync, sync, update, runtime, REPO_ROOT, tests, test, mkTempDir, writeFile, runtimeCliResult, sandboxGitRepo, readWorkflowDefinitions, readRepoFile, internalReviewers, reviewerRubric, canonText, headingBody, sectionOf, jsonOf, spans, canonMarkdownFiles, headingsOf, FORM_CATEGORIES } = require('./lib.js');

test('AC-6: commands.yaml configures the staged pre-commit lint, `git diff --cached --check`', () => {
  const lintLine = readRepoFile('.asd/project/commands.yaml').split('\n').find((line) => line.startsWith('lint:'));
  assert.ok(lintLine && lintLine.includes('--cached'), 'commands.yaml lint must be the staged form: the bare `git diff --check` exits 0 once the damage is staged, and `.asd/project/**` is outside every review surface');
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

test('sprint-010 AC-9 (G-12): `core.md` "See also" is the rule-doc index - it lists every other `.asd/rules/*.md` and nothing else', () => {
  const ruleDocs = fs.readdirSync(path.join(REPO_ROOT, '.asd/rules'))
    .filter((name) => name.endsWith('.md') && name !== 'core.md')
    .sort();
  const seeAlso = readRepoFile('.asd/rules/core.md').split('## See also')[1];
  assert.ok(seeAlso, 'core.md must keep its "See also" section');
  const indexed = [...seeAlso.matchAll(/^- `([a-z0-9-]+\.md)`/gm)].map((match) => match[1]).sort();
  assert.deepStrictEqual(indexed, ruleDocs, 'G-12: the index must be a bijection with the directory - a new rule doc nobody indexed is unreachable, an indexed doc that no longer exists sends a reader to a missing file');
});

test('sprint-010 AC-7/G-9: every internal reviewer rubric yields manifest ids, and the efficiency reviewer emits a Documentation economy id', () => {
  const rubricIds = (reviewer) => {
    try {
      return runtime.emitCoverageManifest({ reviewer, phase: 'impl-review', rubric: reviewerRubric(reviewer), files: [] }).rules;
    } catch (error) {
      return `rejected: ${error.message}`;
    }
  };
  for (const reviewer of internalReviewers()) {
    const ids = rubricIds(reviewer);
    assert.ok(Array.isArray(ids), `${reviewer}: a rubric matching neither derivation shape (sectioned by \`###\`, else a bullet's bold lead-in) yields no ids, and no manifest can be emitted for it. Got: ${ids}`);
  }
  assert.ok(rubricIds('efficiency').some((id) => id.startsWith('Documentation economy')), 'the rubric bullet is the economy rule\'s only path into the blocking coverage ledger, and it counts only as an emitted id');
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
  for (const [symbol, rel] of [['WAVE_THRESHOLD_LINES', '.asd/rules/sprint-lifecycle.md'], ['WAVE_THRESHOLD_FILES', '.asd/rules/sprint-lifecycle.md'], ['WAVE_THRESHOLD_BYTES', '.asd/rules/sprint-lifecycle.md'], ['LARGE_WAVE_FILES', '.asd/rules/agent-protocol.md'], ['AUDIT_BATCH_THRESHOLD_FILES', '.asd/workflows/asd-phase-audit.md'], ['reviewerFiles', '.asd/rules/review-policy.md']]) {
    assert.ok((citers.get(symbol) || []).includes(rel), `sprint-015 AC-2/AC-9/sprint-017 AC-1/sprint-023 AC-1: ${rel} must cite \`${symbol}\` by its runtime symbol rather than restate the value or selector it holds`);
  }
  assert.ok(invoked.some((entry) => entry === '.asd/workflows/asd-phase-impl-review.md: review-waves'), 'sprint-017 AC-1: the wave count is a runtime check, so impl-review must run `review-waves` rather than judge the division size itself');
});

test("sprint-020 AC-2/AC-4/AC-6: every definition's roster and rollback reset follow their rules - each review key is a verdict key with an agent and a matching token, each review phase has its DoD row naming exactly its roster, INTERNAL_REVIEWERS is the internal union, and rollback_reset is the phases before each review's input-producing phase", () => {
  const definitions = readWorkflowDefinitions();
  const nodes = ['design', 'impl'];
  const counters = sectionOf('.asd/rules/sprint-lifecycle.md', 'Review iteration counters');
  const inputs = /Input-producing phases: ([^.]+)\./.exec(counters);
  assert.ok(inputs, 'sprint-lifecycle.md "Review iteration counters" must name each review\'s input-producing phase - the rollback reset is defined against it');
  const inputOf = Object.fromEntries([...inputs[1].matchAll(/`([a-z-]+)` for ([a-z-]+)/g)].map((match) => [match[2], match[1]]));
  const reset = counters.split('\n').find((line) => line.includes('**Rollback reset.**')) || '';
  assert.ok(reset.includes('`rollback_reset.<node>`') && reset.includes('"Workflows"'), 'sprint-lifecycle.md "Rollback reset" must read the phases that reset a review from the frozen definition\'s rollback_reset, citing "Workflows" - the resume menu resets from there');
  assert.deepStrictEqual(counters.split('\n').filter((line) => /^\s*\|/.test(line)), [], 'sprint-020: the rollback-reset table moved into each definition\'s rollback_reset - a table back in "Review iteration counters" is a second source that drifts from the one the resume menu reads');
  for (const { name, phases, reviewers, rollback_reset: rollbackReset } of definitions) {
    for (const node of nodes) {
      const review = `${node}-review`;
      const runs = phases.includes(review);
      assert.strictEqual(reviewers[node].length > 0, runs, `${name}: reviewers.${node} must be non-empty exactly when ${review} is in its chain`);
      const expected = runs ? phases.slice(0, phases.indexOf(inputOf[review])) : [];
      assert.deepStrictEqual(rollbackReset[node], expected, `${name}: rollback_reset.${node} must be exactly the phases before ${review}'s input-producing phase (${inputOf[review]}), per "Rollback reset" - a later phase would wipe a live review (a lite design-promote re-run resetting reviews.impl), a missing one keeps stale verdicts across a rollback`);
    }
  }

  const keys = new Map();
  for (const definition of definitions) {
    for (const node of nodes) definition.reviewers[node].forEach((key) => keys.set(key, (keys.get(key) || new Set()).add(node)));
  }
  const external = runtime.EXTERNAL_REVIEWER;
  assert.deepStrictEqual(runtime.INTERNAL_REVIEWERS.slice().sort(), [...keys.keys()].filter((key) => key !== external).sort(), 'INTERNAL_REVIEWERS must be exactly the internal keys the definitions dispatch - persist-review validates a ledger only for these, and emit-manifest emits a coverage manifest only for these');
  const enumerated = /^- `<reviewer>` = `([^`]+)`/m.exec(sectionOf('.asd/rules/review-policy.md', 'Gate Verdict Format'));
  assert.ok(enumerated, 'review-policy.md "Gate Verdict Format" must enumerate the <reviewer> verdict keys');
  assert.deepStrictEqual(enumerated[1].split('|').map((key) => key.trim()).sort(), [...keys.keys()].sort(), 'the verdict-key enum must be exactly the union of every definition\'s rosters - an unlisted key is a verdict nobody parses, a listed one no roster dispatches is dead');
  for (const [key, where] of keys) {
    const agent = key === external ? 'asd-external-review' : `asd-reviewer-${key}`;
    const phase = where.size === nodes.length ? '<phase>' : [...where][0];
    assert.ok(sectionOf(`.asd/agents/${agent}.md`, 'Gate Verdict Format').includes(`\`[REVIEW-${phase}-${key}]: <APPROVE | CONCERNS | FAIL>\``), `${agent} is dispatched in ${[...where].join(' and ')}-review, so its Gate Verdict Format must state the token [REVIEW-${phase}-${key}] - persist-review rejects any other first line`);
  }

  const cells = (line) => line.split('|').slice(1, -1).map((cell) => cell.trim());
  const responsibility = sectionOf('.asd/rules/review-policy.md', 'Reviewer responsibility').split('\n').filter((line) => line.startsWith('|')).slice(2).map((line) => cells(line)[0]);
  const labels = responsibility.map((label) => [label, label === 'External Review' ? external : label.toLowerCase()]);
  assert.deepStrictEqual(labels.map(([, key]) => key).sort(), [...keys.keys()].sort(), 'review-policy.md "Reviewer responsibility" must hold one row per roster key, labelled by its reviewer name');
  const dod = sectionOf('.asd/rules/review-policy.md', 'DoD per review phase').split('\n').filter((line) => line.startsWith('|')).slice(2).map(cells);
  for (const { name, phases, reviewers } of definitions) {
    for (const node of nodes) {
      const row = dod.find((candidate) => candidate[0] === `${node}-review (${name})`);
      if (!phases.includes(`${node}-review`)) {
        assert.ok(!row, `review-policy.md "DoD per review phase" has a ${node}-review (${name}) row, but ${name} runs no ${node}-review`);
        continue;
      }
      assert.ok(row, `review-policy.md "DoD per review phase" must carry a "${node}-review (${name})" row - the pr gate checks the reviewers this table requires`);
      const named = labels.filter(([label]) => new RegExp(`\\b${label}\\b`).test(row[1])).map(([, key]) => key);
      assert.deepStrictEqual(named.sort(), [...reviewers[node]].sort(), `review-policy.md "DoD per review phase": the ${node}-review (${name}) row must require exactly ${name}.json's reviewers.${node}`);
    }
  }
});

test('sprint-021 AC-12: the generated provider views sync.js regenerates wholesale are never reviewable change surface - both review pathspecs exclude every provider-tree target and keep the JSON-merge hook registrations in', () => {
  const plan = sync.buildSyncPlan(REPO_ROOT);
  const relOf = (item) => path.relative(REPO_ROOT, item.targetPath).split(path.sep).join('/');
  const targets = [...new Set(plan.map(relOf))];
  const jsonMerge = [...new Set(plan.filter((item) => item.class === 'json-merge').map(relOf))];
  const views = targets.filter((rel) => rel.includes('/') && !jsonMerge.includes(rel));
  assert.ok(views.length > 0 && jsonMerge.length > 0, `sanity: the sync plan must yield provider-tree views and the JSON-merge hook registrations, got ${targets.join(', ')}`);

  const expand = (text) => spans(text).flatMap((glob) => {
    const brace = /\{([^}]+)\}/.exec(glob);
    return brace ? brace[1].split(',').map((part) => glob.replace(brace[0], part)) : [glob];
  });
  const consumerRow = sectionOf('.asd/rules/external-review.md', 'Phase-scoped payload').split('\n').find((line) => line.startsWith('| impl-review, `self_hosting: disabled`')) || '';
  const selfHosting = /the generated provider views \(([^;)]*)/.exec(sectionOf('.asd/rules/sprint-lifecycle.md', 'Self-hosting'));
  assert.ok(selfHosting, 'sanity: sprint-lifecycle.md "Self-hosting" must still list the generated provider views its change surface drops');
  for (const [site, cell] of [['external-review.md "Phase-scoped payload" consumer impl-review row', consumerRow.split('|')[3] || ''], ['sprint-lifecycle.md "Self-hosting" framework change surface', selfHosting[1]]]) {
    const globs = expand(cell);
    const excluded = (rel) => globs.some((glob) => (glob.endsWith('/**') ? rel.startsWith(glob.slice(0, -2)) : rel === glob));
    assert.deepStrictEqual(views.filter((rel) => !excluded(rel)), [], `${site}: the pathspec must exclude every generated provider view, or a review ships regenerated output to every reviewer`);
    assert.deepStrictEqual(jsonMerge.filter(excluded), [], `${site}: the pathspec must keep the JSON-merge hook registrations in - they can hold user content, and a hand edit there would escape review (impl-review wave-1/iter-01 external #1)`);
  }
});

test('sprint-023 AC-2: the commands git-strategy.md "Branch" gives bring a base branch up to origin - the ref alone when it is not checked out, the worktree when it is - and refuse a diverged one', () => {
  const forward = sectionOf('.asd/rules/git-strategy.md', 'Branch').split('\n').find((line) => line.startsWith('**Fast-forward**')) || '';
  const commands = spans(forward).filter((span) => span.startsWith('git '));
  const refSpec = commands.find((span) => span.includes(':<base_branch>'));
  const fetchAll = commands.find((span) => span === 'git fetch origin');
  const merge = commands.find((span) => span.startsWith('git merge'));
  assert.ok(refSpec && fetchAll && merge, `"Branch" must give the three commands the fast-forward runs - the refspec fetch, the plain fetch and the merge - as code spans (found ${JSON.stringify(commands)})`);
  const { repo: origin, env, git: gitOrigin } = sandboxGitRepo();
  gitOrigin('symbolic-ref', 'HEAD', 'refs/heads/main');
  const commitOrigin = (file) => {
    writeFile(origin, file, `${file}\n`);
    gitOrigin('add', '-A');
    gitOrigin('commit', '-q', '-m', file);
    return gitOrigin('rev-parse', 'HEAD').trim();
  };
  const emptyCommitOrigin = (message) => {
    gitOrigin('commit', '-q', '--allow-empty', '-m', message);
    return gitOrigin('rev-parse', 'HEAD').trim();
  };
  commitOrigin('first.txt');
  const clone = mkTempDir();
  execFileSync('git', ['clone', '-q', origin, clone], { env, stdio: 'pipe' });
  const inClone = (...args) => execFileSync('git', ['-c', 'user.name=asd-test', '-c', 'user.email=asd-test@example.invalid', '-c', 'commit.gpgsign=false', '-c', 'core.autocrlf=false', ...args], { cwd: clone, env, encoding: 'utf8', stdio: 'pipe' });
  const run = (command) => inClone(...command.replace(/<base_branch>/g, 'main').split(' ').slice(1));

  inClone('checkout', '-q', '-b', 'sprint/x');
  writeFile(clone, 'first.txt', 'dirty\n');
  const second = emptyCommitOrigin('second');
  run(refSpec);
  assert.strictEqual(inClone('rev-parse', 'main').trim(), second, 'base not checked out: the refspec fetch must bring the local base to origin\'s');
  assert.ok(inClone('rev-parse', '--abbrev-ref', 'HEAD').trim() === 'sprint/x' && fs.readFileSync(path.join(clone, 'first.txt'), 'utf8') === 'dirty\n', 'base not checked out: the refspec fetch moves the ref alone - the sprint branch stays checked out and its dirty tree untouched');

  inClone('checkout', '-q', '--', 'first.txt');
  inClone('checkout', '-q', 'main');
  const third = commitOrigin('third.txt');
  assert.throws(() => run(refSpec), Error, 'base checked out: git refuses the refspec form into the checked-out branch, which is why "Branch" gives a second command for that case');
  assert.strictEqual(inClone('rev-parse', 'main').trim(), second, 'a refused fetch moves nothing');
  run(fetchAll);
  run(merge);
  assert.ok(inClone('rev-parse', 'HEAD').trim() === third && fs.existsSync(path.join(clone, 'third.txt')), 'base checked out: the fetch and the --ff-only merge bring the worktree to origin\'s');

  writeFile(clone, 'local.txt', 'local\n');
  inClone('add', '-A');
  inClone('commit', '-q', '-m', 'local');
  const local = inClone('rev-parse', 'HEAD').trim();
  gitOrigin('commit', '-q', '--allow-empty', '-m', 'fourth');
  run(fetchAll);
  assert.throws(() => run(merge), Error, 'base checked out and diverged: the --ff-only merge must refuse, so the orchestrator halts and asks instead of merging origin into the base');
  assert.strictEqual(inClone('rev-parse', 'HEAD').trim(), local, 'a refused merge leaves the base where it was');
  inClone('checkout', '-q', 'sprint/x');
  assert.throws(() => run(refSpec), Error, 'base not checked out and diverged: the refspec fetch must refuse a non-fast-forward');
  assert.strictEqual(inClone('rev-parse', 'main').trim(), local, 'a refused fetch leaves the base where it was');
});

test('sprint-026 AC-12 (D1): every json block of an agent, phase workflow, standalone skill and agent-protocol.md parses, and no agent body carries a backslash', () => {
  const files = [...Object.values(FORM_CATEGORIES).flatMap(({ files }) => files()), '.asd/rules/agent-protocol.md'];
  let blocks = 0;
  for (const rel of files) {
    for (const [, block] of canonText(rel).matchAll(/```json\n([\s\S]*?)\n```/g)) {
      blocks++;
      assert.doesNotThrow(() => JSON.parse(block), `${rel}: a json block must be valid JSON - ${block.slice(0, 60)}`);
    }
  }
  assert.ok(blocks >= 100, `sanity: the json sweep must reach the blocks (got ${blocks})`);
  for (const rel of FORM_CATEGORIES.agents.files()) {
    const body = sync.parseCanonicalFrontmatter(sync.readNormalized(path.join(REPO_ROOT, rel))).body;
    assert.ok(!body.includes('\\'), `${rel}: no backslash in an agent body - the Codex TOML writer escapes it and the rendered view drifts from canon`);
  }
});

test('sprint-026 AC-12 (D2/D3): each agent json section carries its keys, the Signals tokens are the protocol\'s, and the base description fits the 300-char cap', () => {
  const protocolTokens = [...sectionOf('.asd/rules/agent-protocol.md', 'Signals').matchAll(/^\| `([A-Z_]+)` \|/gm)].map((match) => match[1]);
  for (const rel of FORM_CATEGORIES.agents.files()) {
    const inputs = jsonOf(rel, 'Inputs');
    assert.ok(Array.isArray(inputs.rules) && inputs.rules[0] === 'payload.inputs.context' && inputs.rules.slice(1).every((ref) => typeof ref === 'string' && ref.includes('#')) && Array.isArray(inputs.required), `${rel}: Inputs is {rules, required, ...}; rules opens with payload.inputs.context (D12) and adds only section refs`);
    for (const [mode, body] of Object.entries(inputs.modes || {})) assert.ok(typeof body.when === 'string' && Array.isArray(body.required), `${rel}: Inputs mode "${mode}" carries when and required`);
    const outputs = jsonOf(rel, 'Outputs');
    assert.ok(Array.isArray(outputs) && outputs.length > 0 && outputs.every((item) => typeof item === 'string'), `${rel}: Outputs is a non-empty array of strings`);
    const tools = jsonOf(rel, 'Tools');
    assert.ok(tools && !Array.isArray(tools) && Object.keys(tools).every((key) => ['run', 'deny', 'write', 'write_self_hosting', 'web'].includes(key)), `${rel}: Tools holds only run, deny, write, write_self_hosting, web (got ${Object.keys(tools)})`);
    const escalation = jsonOf(rel, 'Escalation');
    assert.ok(Array.isArray(escalation) && escalation.every((row) => typeof row.when === 'string' && typeof row.signal === 'string'), `${rel}: Escalation is an array of {when, signal}`);
    const signals = jsonOf(rel, 'Signals');
    assert.ok(Array.isArray(signals) && signals.length > 0 && signals.every((token) => protocolTokens.includes(token)), `${rel}: Signals lists tokens of agent-protocol.md "Signals" only (got ${JSON.stringify(signals)} against ${protocolTokens})`);
    const { meta } = sync.parseCanonicalFrontmatter(sync.readNormalized(path.join(REPO_ROOT, rel)));
    assert.ok(meta.description.length <= 300, `${rel}: the base description is at most 300 chars (got ${meta.description.length})`);
  }
});

test('sprint-026 AC-12 (D4/D5/D8): phase workflow, standalone skill and protocol json blocks carry their keys', () => {
  const array = (value) => Array.isArray(value);
  for (const rel of FORM_CATEGORIES.workflows.files()) {
    const entry = jsonOf(rel, 'Entry');
    assert.ok(array(entry.requires) && (entry.ops === undefined || (array(entry.ops) && entry.ops.length > 0)) && (entry.modes === undefined || (typeof entry.modes === 'object' && !array(entry.modes))), `${rel}: Entry is {requires, ops?, modes?} - an empty ops is absent (D14)`);
    assert.ok(array(jsonOf(rel, 'Inputs')), `${rel}: Inputs is an array`);
    const exit = jsonOf(rel, 'Exit');
    assert.ok(array(exit.writes) && array(exit.next) && exit.next.length > 0 && exit.next.every((route) => typeof route.if === 'string' && typeof route.next === 'string'), `${rel}: Exit is {writes, next: [{if, next}]}`);
    if (canonText(rel).includes('\n## Dispatch\n')) {
      const dispatch = jsonOf(rel, 'Dispatch');
      assert.ok(array(dispatch) && dispatch.every((row) => typeof row.agent === 'string' && typeof row.when === 'string' && array(row.payload) && array(row.signals)), `${rel}: Dispatch is an array of {agent, when, payload, signals}`);
    }
    if (canonText(rel).includes('\n## Signals\n')) {
      const signals = jsonOf(rel, 'Signals');
      assert.ok(!array(signals) && Object.values(signals).every((deviation) => typeof deviation === 'string'), `${rel}: Signals is {TOKEN: deviation}`);
    }
  }
  for (const rel of FORM_CATEGORIES.skills.files()) {
    const preconditions = jsonOf(rel, 'Preconditions');
    assert.ok(array(preconditions.requires) && (preconditions.ops === undefined || (array(preconditions.ops) && preconditions.ops.length > 0)), `${rel}: Preconditions is {requires, else?, ops?} - an empty ops is absent (D14)`);
    if (canonText(rel).includes('\n## Modes\n')) assert.ok(Object.values(jsonOf(rel, 'Modes')).every((detection) => typeof detection === 'string'), `${rel}: Modes is {mode: detection}`);
    if (canonText(rel).includes('\n## User decisions\n')) assert.ok(array(jsonOf(rel, 'User decisions')) && jsonOf(rel, 'User decisions').length > 0 && jsonOf(rel, 'User decisions').every((row) => ['step', 'gate', 'class'].every((key) => typeof row[key] === 'string')), `${rel}: User decisions, when present, is a non-empty array of {step, gate, class, options?} (D14)`);
    const delegates = jsonOf(rel, 'Delegates');
    assert.ok(array(delegates.agents) && array(delegates.skills), `${rel}: Delegates is {agents, skills}`);
    assert.ok(array(jsonOf(rel, 'Outputs')), `${rel}: Outputs is an array`);
  }
  const payload = jsonOf('.asd/rules/agent-protocol.md', 'Dispatch payload');
  assert.deepStrictEqual(Object.keys(payload), ['repo_root', 'sprint', 'phase', 'mode', 'task', 'inputs', 'write_scope', 'turn_budget', 'answers', 'advice', 'consults_left'], 'agent-protocol.md "Dispatch payload" is the one object whose keys are exactly the D8 set, in order');
  assert.deepStrictEqual(headingsOf('.asd/rules/agent-protocol.md').filter(([level]) => level === 2).map(([, name]) => name), ['Signals', 'Dispatch payload', 'Model quota retry', 'Return', 'Relay']);
});

test('sprint-027 AC-7 (D7): providers.md "Task-class variants and routing" states every input key and enum routeTask reads, and route-task accepts the --input - stdin form', () => {
  const source = runtime.routeTask.toString();
  const keys = [...new Set([...source.matchAll(/\binput\.(\w+)/g)].map((match) => match[1]))];
  assert.deepStrictEqual(keys.sort(), ['checks', 'correctionAttempts', 'effortRaised', 'failedObjectiveCheck', 'kind', 'objectiveInputs', 'priorTier', 'risks'], 'sanity: routeTask reads the eight documented keys - a new key needs a providers.md row');
  const section = headingBody('.asd/rules/providers.md', 'Task-class variants and routing');
  for (const key of keys) {
    assert.ok(section.includes(`\`${key}\``), `providers.md must name the route-task input key \`${key}\``);
  }
  const kinds = /\[((?:'\w+',? ?)+)\]\.includes\(input\.kind\)/.exec(source)[1].match(/\w+/g);
  assert.ok(section.includes(`\`kind\` (${kinds.map((kind) => `\`${kind}\``).join('|')})`), 'the kind enum is stated exactly as routeTask accepts it');
  const routed = runtimeCliResult(['route-task', '--input', '-'], { input: JSON.stringify({ kind: 'standard', objectiveInputs: false, failedObjectiveCheck: false, checks: [], correctionAttempts: 0, risks: [] }), stdio: 'pipe' });
  assert.deepStrictEqual(routed.status === 0 && routed.result.tier, 'standard', `route-task --input - must read stdin. Got: ${JSON.stringify(routed)}`);
});

test('sprint-030 AC-12: no ASD script calls the OS temp directory', () => {
  const walk = (rel) => fs.readdirSync(path.join(REPO_ROOT, rel), { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? (['.asd/sprints', '.asd/tmp'].includes(`${rel}/${entry.name}`) ? [] : walk(`${rel}/${entry.name}`)) : [`${rel}/${entry.name}`]));
  const scripts = [...walk('.asd'), ...walk('tests')].filter((rel) => rel.endsWith('.js'));
  assert.ok(scripts.includes('.asd/runtime.js') && scripts.includes('.asd/skills/asd-update/update.js') && scripts.includes('tests/run.js'), 'sanity: the sweep must reach the runtime, update.js and this runner');
  const osTemp = scripts.flatMap((rel) => canonText(rel).split('\n').map((line, index) => ({ rel, line, index })).filter(({ line }) => /\btmpdir\(/.test(line) && !/^\s*(?:\/\/|\*)/.test(line)).map(({ rel: file, index }) => `${file}:${index + 1}`));
  assert.deepStrictEqual(osTemp, [], 'no ASD script may call the OS temp directory - update.js stages under .asd/tmp and the runner keeps its fixtures there');
});

test('sprint-033 AC-12: every commit header the canon templates over a phase or a sprint number fits 50 characters for the longest phase and a three-digit sprint number, and git-strategy.md states the limit', () => {
  const longest = ['standard', 'lite'].flatMap((name) => runtime.loadWorkflow(name).phases).reduce((a, b) => (b.length > a.length ? b : a));
  const headerPattern = /`((?:feat|fix|chore|docs|refactor|test)\([a-z-]+\): [^`]*)`/g;
  const templated = [...new Set([...canonMarkdownFiles(), 'README.md'].flatMap((rel) => [...canonText(rel).matchAll(headerPattern)].map((match) => match[1])))].filter((header) => /<phase>|<NNN>/.test(header));
  assert.ok(templated.length >= 2, `sanity: the canon templates at least the rotate and timing headers, got ${JSON.stringify(templated)}`);
  const HEADER_MAX = 50;
  for (const header of templated) {
    const filled = header.replace('<phase>', longest).replace('<NNN>', '999');
    assert.ok(!/<[^>]+>/.test(filled) && filled.length <= HEADER_MAX, `AC-12: "${filled}" is ${filled.length} characters, over ${HEADER_MAX}`);
  }
  assert.ok(sectionOf('.asd/rules/git-strategy.md', 'Commits').split('\n').some((line) => /^- Header .*≤ 50 chars/.test(line)), 'AC-12: "Commits" states the header limit it enforces through commit-check');
});
