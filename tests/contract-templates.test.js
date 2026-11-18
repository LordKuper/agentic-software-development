'use strict';

// content contracts of templates and README

const { assert, fs, path, sync, update, runtime, REPO_ROOT, tests, test, loadManifest, declaredScopeFields, readWorkflowDefinitions, arrowChain, readRepoFile, internalReviewers, canonText, headingBody, grantRows, grantedRefs, sectionOf, jsonOf, subOf, stepOf, canonMarkdownFiles, readRemovedConfigKeys, migrateConfig900, REPLACED_REVIEW_MECHANISMS, rosterMemoryFiles } = require('./lib.js');

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
  const WORD_TO_NUMBER = { Seven: 7, Eight: 8, Eleven: 11, Twelve: 12, Fourteen: 14, Fifteen: 15, Sixteen: 16, Seventeen: 17, Eighteen: 18 };
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

test('every .asd/templates/**/*.json file parses as valid JSON', () => {
  const templatesDir = path.join(REPO_ROOT, '.asd', 'templates');
  const jsonFiles = fs.readdirSync(templatesDir, { recursive: true }).filter((f) => f.endsWith('.json'));
  assert.ok(jsonFiles.length > 1, 'sanity: at least one nested template JSON file must exist for the recursive scan to mean anything');
  for (const f of jsonFiles) {
    const abs = path.join(templatesDir, f);
    assert.doesNotThrow(() => JSON.parse(fs.readFileSync(abs, 'utf8')), `.asd/templates/${f} must parse as valid JSON`);
  }
});

test('AC-2/4/6/7/sprint-017 AC-8: t_review-scope.json key set matches external-review.md\'s declared manifest fields exactly, and no self-diff ref survives', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, '.asd/templates/external-review/t_review-scope.json'), 'utf8'));
  const declared = declaredScopeFields();
  assert.ok(declared.includes('files') && declared.includes('diff'), `sanity: the declared set must carry the list and the precomputed diff (AC-8 triple), got ${JSON.stringify(declared)}`);
  assert.deepStrictEqual(Object.keys(manifest).sort(), declared.slice().sort(), 'the template and external-review.md must declare the same scope-manifest fields - the runtime writes the template shape, the wrapped CLI is told the rule shape');
  for (const removed of ['base_ref', 'head_ref', 'exclude_paths', 'mode', 'commits']) {
    assert.ok(!Object.hasOwn(manifest, removed), `"${removed}" was removed from the transport and must never reappear - a ref pair or exclusion list lets External Review derive its own scope (sprint-017 AC-8)`);
  }
});

// iteration-3 review (sprint 006): the scope bounds what the reviewer
// judges, not what it may read - a prior wording pass over-reached and
// implied the named project-context reference paths (PRD, ADR, stack, etc.)
// were unreadable. Since sprint 017 the per-agent list alone is the scope (no
// exclude_paths[]); guards the distinction in the hand-off home and both
// prompts.
test('AC-2/4/6/7/sprint-017 AC-8: the scope-vs-readability distinction holds in review-policy.md "Scope hand-off" and both prompts', () => {
  const handOff = sectionOf('.asd/rules/review-policy.md', 'Scope hand-off');
  const implPrompt = fs.readFileSync(path.join(REPO_ROOT, '.asd/templates/external-review/t_prompt-external-impl.md'), 'utf8');
  const designPrompt = fs.readFileSync(path.join(REPO_ROOT, '.asd/templates/external-review/t_prompt-external-design.md'), 'utf8');
  const carveOut = 'the project-context reference paths below included — is context only, never a finding location';

  const wholeFiles = handOff.split('\n').find((line) => line.startsWith('3. **Whole files**'));
  assert.ok(wholeFiles && wholeFiles.includes('listed or not, is readable as context') && wholeFiles.includes('An unlisted path stays out of scope'), 'review-policy.md "Scope hand-off" must state that any file stays readable as context while an unlisted one stays out of scope');
  assert.ok(handOff.includes('only normative scope: its ledger file rows and its valid finding locations'), 'review-policy.md "Scope hand-off" must make the list the only bound on finding locations');

  for (const [name, prompt, placeholders] of [
    ['impl', implPrompt, ['{{PRD_PATH}}', '{{ADR_PATH}}', '{{STACK_PATH}}', '{{CUSTOM_RULES_PATH}}', '{{COMMANDS_PATH}}']],
    ['design', designPrompt, ['{{CONCEPT_PATH}}', '{{CUSTOM_RULES_PATH}}', '{{ACCESSIBILITY_PATH}}']],
  ]) {
    assert.ok(prompt.includes(carveOut), `t_prompt-external-${name}.md must state the readability carve-out for paths outside files[]`);
    for (const ph of placeholders) {
      assert.ok(prompt.includes(ph), `t_prompt-external-${name}.md must still pass ${ph} as project context (readability carve-out is meaningless without it)`);
    }
  }
});

const PHASE_COUNT_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen',
];

function readTocH2Threshold() {
  const layout = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/artifact-layout.md'), 'utf8');
  const stated = /^\|\s*`\{\{TOC_NAV\}\}`.*?\*\*(\d+) or more\*\* `<h2>` sections/m.exec(layout);
  assert.ok(stated, 'artifact-layout.md "Placeholder fill" owns the {{TOC_NAV}} h2 threshold - these tests derive it from there, never restate it');
  return Number(stated[1]);
}

test("AC-8, sprint-020 AC-7: the always-loaded mirrors of the definitions - README's phase table, per-workflow phase table, chains, flowchart nodes and rosters, folder-map counts, and every phase-count word in README and AGENTS.md bound to its workflow", () => {
  const definitions = readWorkflowDefinitions();
  const standard = definitions.find((definition) => definition.name === 'standard');
  const names = definitions.map((definition) => definition.name);
  const readme = canonText('README.md');
  const lines = readme.split('\n');
  const cells = (line) => line.split('|').slice(1, -1).map((cell) => cell.trim());
  const tableRows = (isHeader) => {
    const at = lines.findIndex(isHeader);
    if (at < 0) return null;
    const rows = [];
    for (let i = at + 2; i < lines.length && lines[i].startsWith('|'); i += 1) rows.push(cells(lines[i]));
    return rows;
  };
  const phaseOf = (row) => (/^\*\*([a-z-]+)\*\*$/.exec(row[0]) || [])[1];

  const described = tableRows((line) => /^\| Phase \| What happens \|/.test(line));
  assert.ok(described, 'README must keep its "| Phase | What happens |" table');
  assert.deepStrictEqual(described.map(phaseOf), standard.phases, 'README phase table drifted from standard.json - it is the user-facing entry point, and a stale row describes a workflow that no longer exists');

  const isMatrixHeader = (line) => line.startsWith('| Phase |') && cells(line).slice(1).sort().join() === [...names].sort().join();
  const matrix = tableRows(isMatrixHeader);
  assert.ok(matrix, `README "Workflows" must keep one phase table with a column per definition (${names.join(', ')})`);
  const columns = cells(lines.find(isMatrixHeader));
  assert.deepStrictEqual(matrix.map(phaseOf).sort(), [...new Set(definitions.flatMap((definition) => definition.phases))].sort(), 'README per-workflow phase table must list every phase some workflow runs, once');
  for (const definition of definitions) {
    const column = columns.indexOf(definition.name);
    assert.deepStrictEqual(matrix.filter((row) => row[column] !== '—').map(phaseOf).sort(), [...definition.phases].sort(), `README per-workflow table: the ${definition.name} column must mark exactly the phases ${definition.name}.json runs, "—" for the rest`);
    const internal = definition.reviewers.impl.filter((key) => key !== runtime.EXTERNAL_REVIEWER).length;
    const reviewCell = (matrix.find((row) => phaseOf(row) === 'impl-review') || [])[column] || '';
    const stated = /^(\d+) .*internal reviewers?\b/.exec(reviewCell);
    assert.ok(stated && Number(stated[1]) === internal, `README per-workflow table: ${definition.name}'s impl-review cell must count the ${internal} internal reviewer(s) of its reviewers.impl (got: ${reviewCell})`);
    if (definition === standard) continue;
    const bullet = lines.find((line) => line.startsWith(`- **\`${definition.name}\`**`));
    assert.ok(bullet, `README "Workflows" must describe ${definition.name} in a **\`${definition.name}\`** bullet`);
    assert.deepStrictEqual(arrowChain(bullet), definition.phases, `README's ${definition.name} bullet states its chain, and it drifted from ${definition.name}.json`);
  }

  const graphNodes = [...new Set([...readme.matchAll(/\w+\["([a-z-]+)<br\//g)].map((node) => node[1]))];
  assert.deepStrictEqual(
    graphNodes.sort(),
    [...standard.phases].sort(),
    'the README flowchart must declare a node for exactly the phases in standard.json - declaration order belongs to the graph author, the node set does not'
  );
  for (const node of ['design', 'impl']) {
    const roster = new RegExp(`\\["${node}-review<br\\/><i>([^<]+)<\\/i>"\\]`).exec(readme);
    const named = roster ? roster[1].split('·').map((reviewer) => reviewer.trim().toLowerCase()).sort() : [];
    assert.deepStrictEqual(named, [...standard.reviewers[node]].sort(), `the README flowchart's ${node}-review node must name exactly standard.json's reviewers.${node} - the one roster a reader sees before any rule doc`);
  }

  const folder = /(\d+) phase orchestration files[^\n]*?(\d+) workflow definitions/.exec(readme);
  const orchestration = fs.readdirSync(path.join(REPO_ROOT, '.asd/workflows')).filter((file) => /^asd-phase-.*\.md$/.test(file)).length;
  assert.ok(folder && Number(folder[1]) === orchestration && Number(folder[2]) === definitions.length, `README folder map must count the ${orchestration} phase orchestration files and ${definitions.length} workflow definitions .asd/workflows/ holds (got: ${folder ? folder[0] : 'no match'})`);

  const lengths = Object.fromEntries(definitions.map((definition) => [definition.name, definition.phases.length]));
  const toNumber = (word) => (/^\d+$/.test(word) ? Number(word) : PHASE_COUNT_WORDS.indexOf(word.toLowerCase()));
  const count = `(\\d+|${PHASE_COUNT_WORDS.join('|')})`;
  const bound = new RegExp(`\\b${count} for \`(${names.join('|')})\``, 'gi');
  const loose = new RegExp(`\\b${count}(?:[- ](?:mandatory |sprint )?phases\\b|-phase\\b)`, 'gi');
  for (const [file, minSites] of [['README.md', 3], ['AGENTS.md', 2]]) {
    const stale = [];
    const seen = new Set();
    let sites = 0;
    for (const line of canonText(file).split('\n')) {
      for (const match of line.matchAll(bound)) {
        sites += 1;
        seen.add(match[2]);
        if (toNumber(match[1]) !== lengths[match[2]]) stale.push(`"${match[0]}" (${match[2]} has ${lengths[match[2]]})`);
      }
      const named = names.filter((name) => line.includes(`\`${name}\``));
      for (const match of line.matchAll(loose)) {
        sites += 1;
        if (named.length === 1) seen.add(named[0]);
        const expected = named.length === 1 ? [lengths[named[0]]] : Object.values(lengths);
        if (!expected.includes(toNumber(match[1]))) stale.push(`"${match[0]}" (expected ${expected.join(' or ')})`);
      }
    }
    assert.ok(sites >= minSites, `${file} states the phase count in prose in at least ${minSites} places - only ${sites} found, so this pattern has itself drifted and asserts nothing`);
    assert.deepStrictEqual(stale, [], `${file} phase-count word disagrees with its workflow's definition: ${stale.join(', ')} - a count on a line naming one workflow must be that workflow's, and README is the user-facing entry point while AGENTS.md is loaded as project instructions on every turn`);
    assert.deepStrictEqual(names.filter((name) => !seen.has(name)), [], `${file} must state the phase count of every workflow at least once, bound to its name - with two chains an unbound count no longer says which one it describes`);
  }
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
    ...Array(2).fill('.asd/rules/sprint-lifecycle.md: documents.c4'),
    '.asd/workflows/asd-phase-design-promote.md: documents.c4',
    ...Array(5).fill('.asd/workflows/asd-phase-design.md: documents.c4'),
  ], 'documents.c4 survives only as the state.json field scope freezes, so its reader lines are pinned - a new line may read the removed config key; confirm it reads state.json and re-pin');
});

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
  assert.ok(
    kept.some((title) => /duration/i.test(title)),
    'sprint-025 D9: the duration section ships on both branches - an entry-free friction log still has a timing ledger to read'
  );
  const threshold = readTocH2Threshold();
  assert.ok(
    kept.length >= threshold,
    `the empty-log branch keeps ${kept.length} h2 sections; below ${threshold} the shell omits the nav, yet the empty-log comment says the TOC is filled`
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

test('T-2/AC-3/sprint-017 AC-6: artifact-layout.md names every review-file variant - per-wave impl dirs, the waves.json division and the legacy read - and the sprint-folder-purity statement alongside the Agent-memory carve-out; README.md and t_review.md carry the matching mirrors', () => {
  const artifactLayout = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/artifact-layout.md'), 'utf8');
  assert.ok(artifactLayout.includes('design/iter-NN/<reviewer>.md, <reviewer>.late.md'), 'artifact-layout.md path map must name every review-file variant under design reviews');
  const implRow = artifactLayout.split('\n').find((line) => line.includes('impl/wave-<K>/iter-NN/<reviewer>.md, <reviewer>.late.md'));
  assert.ok(implRow && implRow.includes('legacy impl/iter-NN/'), 'sprint-017 D4: artifact-layout.md path map must name the per-wave impl review dir and the legacy dir it still reads, or an in-flight sprint\'s reviews are stray files by the purity rule below');
  assert.ok(artifactLayout.includes('impl/waves.json'), 'sprint-017 D2: the division file is written under the sprint folder, so the exhaustive path map must name it');
  assert.ok(artifactLayout.includes('A sprint folder holds **only** the artifacts named above'), 'artifact-layout.md must state the sprint-folder-purity contract');
  assert.ok(artifactLayout.includes('`agent-memory/` has no canonical source under `.asd/` and `sync.js` neither generates nor reconciles it'), 'artifact-layout.md must state the Agent-memory read-only carve-out reasoning');

  const readme = fs.readFileSync(path.join(REPO_ROOT, 'README.md'), 'utf8');
  assert.ok(readme.includes('is hand-authored, not generated'), 'README.md must mirror the agent-memory hand-authored exception to the generated-view read-only rule');

  const reviewTemplate = fs.readFileSync(path.join(REPO_ROOT, '.asd/templates/t_review.md'), 'utf8');
  assert.ok(reviewTemplate.includes('Interrupted attempts: {{count}} ({{cause}})'), 't_review.md must ship the interrupted-attempts placeholder line the durable-record rule (review-policy.md) depends on');
  assert.ok(reviewTemplate.includes('wave-<K>/iter-NN'), 'sprint-017 D4: t_review.md must carry the impl-review iteration in its id form, so a review file names the wave it belongs to');
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

  const reachability = lifecycle.split('\n').find((line) => line.startsWith('**Reachability declaration**')) || '';
  const interrupted = /`(; interrupted at [^`]+)`/.exec(reachability);
  assert.ok(interrupted, 'sprint-022 AC-6: the Reachability declaration must give a value crossing a push or merge a grammar for each interruption point and the value the receiving branch then holds - sprint 021 planned a write/read pair whose interrupted state nobody named');
  const acceptance = reachability.split(/(?<=\.)\s/).find((sentence) => sentence.includes('Accepting the plan')) || '';
  assert.ok(/\binterrupted\b/.test(acceptance), 'sprint-022 AC-6: accepting the plan must also check the reader handles each named interrupted value, before plan acceptance');
  const exampleReach = template.split('\n').find((line) => line.startsWith('Reachability:')) || '';
  assert.ok(exampleReach.includes(interrupted[1]), `sprint-022 AC-6: t_plan.md's example Reachability line must carry the interruption clause in the home's grammar (${interrupted[1]})`);
  const formatRule = template.split('\n').find((line) => line.includes('`Reachability:` line')) || '';
  assert.ok(/\binterruption point\b/.test(formatRule), 'sprint-022 AC-6: t_plan.md\'s parser-critical Reachability rule must mirror the interruption-point clause');
});

test('sprint-010 iter-02: review-policy.md "Nitpick drop list" is the only enumeration inside the rule set every nitpick-instructed agent is granted, and the outbound external prompts are the sole exempt copies', () => {
  const policy = readRepoFile('.asd/rules/review-policy.md');
  const section = policy.split('## Nitpick drop list')[1];
  assert.ok(section, 'review-policy.md must keep the drop list as its own named section: every reviewer body now says only "never raise nitpick categories", so this section is the sole place those category names exist for an agent that reads our rules');
  const categories = [...section.split('\n## ')[0].matchAll(/^- (.+)$/gm)].map((match) => match[1].trim());
  assert.ok(categories.length >= 5, `the section must enumerate the categories rather than name the class: a reviewer told to drop "nitpick categories" with nothing to resolve them against cannot check a finding against the rule. Found ${categories.length}`);

  const grants = new Map(grantRows().map((row) => [row.role, grantedRefs(row.role)]));
  assert.ok(grants.size > fs.readdirSync(path.join(REPO_ROOT, '.asd/agents')).length, 'the grant table must parse into roles, or every grant assertion below passes vacuously over an empty map - the failure mode that makes a reach check worthless');

  const agentFiles = fs.readdirSync(path.join(REPO_ROOT, '.asd/agents')).filter((file) => file.endsWith('.md'));
  const instructed = agentFiles.filter((file) => /nitpick/i.test(readRepoFile(`.asd/agents/${file}`))).map((file) => file.replace(/\.md$/, '')).sort();
  const reviewers = agentFiles.filter((file) => file.startsWith('asd-reviewer-') || file === 'asd-external-review.md').map((file) => file.replace(/\.md$/, '')).sort();
  assert.deepStrictEqual(instructed, reviewers, 'the set carrying the nitpick prohibition must be exactly the review agents - derived from the agent file set, never a hardcoded list, so a new reviewer that never received the instruction fails here instead of shipping as a silently permissive gate');
  for (const name of instructed) {
    const context = grants.get(name);
    assert.ok(context, `providers.md must carry a Role-scoped context row for ${name}, or the grant its prohibition depends on is stated nowhere`);
    assert.ok(context.some((ref) => ref.startsWith('.asd/rules/review-policy.md#Nitpick drop list')), `${name} is told to drop nitpick categories without being given the category names, so its rows must grant review-policy.md "Nitpick drop list" - the section holding the only enumeration. Ungranted, the instruction resolves to nothing at dispatch`);
  }

  assert.ok(categories.some((category) => category.includes('you could also')), 'the list must keep its most distinctive category, the token the sole-home sweep below selects on');
  const copies = canonMarkdownFiles().filter((rel) => rel !== '.asd/rules/review-policy.md' && readRepoFile(rel).includes('you could also')).sort();
  assert.deepStrictEqual(copies, [
    '.asd/templates/external-review/t_prompt-external-design.md',
    '.asd/templates/external-review/t_prompt-external-impl.md'
  ], 'the two outbound prompt templates are the one legitimate second copy - the wrapped CLI is handed that text and cannot read review-policy.md - and both must keep it, or an external reviewer is told to drop categories it is never shown. Any other file reproducing them is the drifted copy this round deleted from asd-reviewer-correctness.md, which had aged to four of the five. Scoped to this one token deliberately: a reworded copy evades it, so this proves the token is sole-homed, never that no paraphrase exists');
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

test('sprint-012 AC-9/AC-10: code-style.md §17 obliges a set-naming test or rule to derive the set from its source, and sprint-lifecycle.md "Impacted test set" owns the per-entry suite-record lag that t_test-plan.md cites', () => {
  const tests17 = canonText('.asd/rules/code-style.md').split('\n## 17.')[1].split('\n## ')[0];
  assert.ok(tests17.split('\n').some((line) => line.startsWith('- ') && /deriv/i.test(line) && /enumerat/i.test(line)), 'AC-9: §17 must require deriving a named set from its source rather than enumerating it (010 P5)');
  const home = sectionOf('.asd/rules/sprint-lifecycle.md', 'Impacted test set');
  assert.ok(/entry analysed/.test(home) && /final tree/.test(home), 'AC-10: "Impacted test set" must say a per-entry record measures the tree its entry analysed and only the terminal full-suite run the final tree (010 P6)');
  const suiteRun = sectionOf('.asd/templates/t_test-plan.md', 'Suite run').replace(/\n/g, ' ');
  assert.ok(/per-entry record[^.]*\(`\.asd\/rules\/sprint-lifecycle\.md` "Impacted test set"\)/.test(suiteRun), 'AC-10: t_test-plan.md "Suite run", where the record is written, must carry the lag as a pointer to its home');
});

test("sprint-012 AC-13: the settings-change line sprint-lifecycle.md \"Plan file format\" defines is the one t_plan.md mirrors and asd-phase-impl.md applies as its Task's wave opens, ahead of that wave's dev dispatch, through the asd-init mode that type-checks it - a mode in asd-init's return contract, in asd-sprint's dispatchable skills, and exempt from the managed-block sync its authorised paths exclude", () => {
  const grammar = sectionOf('.asd/rules/sprint-lifecycle.md', 'Plan file format').split('\n').find((line) => line.startsWith('**Settings change declaration**'));
  const literal = grammar && /`([^`:]+:) <key>=<value>/.exec(grammar);
  assert.ok(literal, 'sprint-lifecycle.md "Plan file format" must define the settings-change line grammar');
  const token = literal[1];
  const templateLine = canonText('.asd/templates/t_plan.md').split('\n').find((line) => line.includes(`\`${token} <key>=<value>`));
  assert.ok(templateLine, "t_plan.md's parser-critical format comment must mirror the line a planner writes");
  assert.ok(!grammar.includes('never one a same-sprint task adds'), 'COR-2: the grammar must admit a key an earlier-wave Task of the same sprint adds to t_config.yaml - excluding it strands 011 P3, the add-then-enable case AC-13 exists for, on an MS-N halt');
  const planLine = sectionOf('.asd/workflows/asd-phase-plan.md', 'Steps').split('\n').find((line) => line.includes('**Task decomposition** per `sprint-lifecycle.md` "Plan file format" (declarations'));
  assert.ok(planLine && planLine.includes('Wave declaration'), 'asd-phase-plan.md must send the planner to the declarations and the Wave declaration, where the settings-change placement lives');
  for (const [site, line] of [['t_plan.md', templateLine], ['sprint-lifecycle.md "Plan file format" (cited by asd-phase-plan.md)', grammar]]) {
    assert.ok(line && line.includes('t_config.yaml'), `COR-2: ${site} must place the settings-change Task by whether t_config.yaml already carries its keys - a wave-1-only placement puts it ahead of the Task adding its key, and asd-init then fails the pair`);
  }

  const init = '.asd/skills/asd-init/SKILL.md';
  const modeMap = jsonOf(init, 'Modes');
  const modes = Object.keys(modeMap);
  const contract = /MODE: <([^>]+)>/.exec(sectionOf(init, 'Return'));
  assert.deepStrictEqual(contract && contract[1].split('|'), modes, "asd-init's return contract must enumerate exactly the modes it declares");
  const mode = modes.find((name) => modeMap[name].includes(token));
  assert.ok(mode, `one asd-init mode must take the declared \`${token}\` pairs as its input`);
  const modeHeading = `### ${mode[0].toUpperCase()}${mode.slice(1)}`;
  const mediatedSteps = subOf(sectionOf(init, 'Steps'), modeHeading.slice(4)).split(/\n(?=\d+\. )/);
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
  const flow = sectionOf(impl, 'Steps');
  const dispatchInit = `\`asd-init\` ${mode} mode`;
  const applying = flow.split(/\n(?=\d+[a-z]?\. )/).filter((block) => block.includes(`\`${token}\``) && block.includes(dispatchInit));
  assert.strictEqual(applying.length, 1, `exactly one asd-phase-impl.md step must apply the declared line through asd-init ${mode} mode instead of registering a manual step (011 P3)`);
  const applyStep = /^(\d+[a-z]?)\. /.exec(applying[0])[1];
  assert.ok(flow.indexOf(dispatchInit) < flow.indexOf('delegate to the agent `## Dispatch` names'), `COR-2-2/DOC-2-1: a wave's bullets run in order, so the settings change (step ${applyStep}) must be applied ahead of that wave's dev delegation - applied after it, the settings Task reaches a dev before asd-init writes config.yaml`);
  const applyLine = applying[0].split('\n').find((line) => line.includes(`\`${token}\``) && line.includes(dispatchInit));
  assert.ok(/\bwave\b/.test(applyLine) && !/\bwave 1\b/.test(applyLine), `COR-2: step ${applyStep} must apply the settings change as its own Task's wave opens, never keyed to wave 1 - the grammar lets that Task follow the one adding its key, and applied at wave 1 the key is not in t_config.yaml yet`);
  assert.ok(applyLine.includes('`FAILED`'), `DOC-1: step ${applyStep} must say what the wave does when asd-init ${mode} mode returns \`FAILED\` - the mode writes nothing then, and dispatching the wave anyway runs its Tasks against a setting that never landed`);
  const failedClause = applyLine.slice(applyLine.indexOf('`FAILED`')).split(';')[0];
  assert.ok(/\b(?:halt|stop|abort)/i.test(failedClause) && /\bblocker\b/.test(failedClause) && /\bbefore\b[^;]*\bdispatch/.test(failedClause), `external iter-04 #1: step ${applyStep}'s \`FAILED\` clause ("${failedClause}") must halt as a blocker before any of that wave's dispatch - naming \`FAILED\` alone lets "on \`FAILED\`, continue dispatching" pass, and Execution mode halts only on a blocker`);
  const failedSignal = jsonOf(impl, 'Signals').FAILED || '';
  assert.ok(failedSignal.includes('asd-init') && failedSignal.includes(`step ${applyStep}`) && /blocker/.test(failedSignal), `DOC-1: impl's Signals must admit asd-init's \`FAILED\` at step ${applyStep} as a blocker - without it any other signal has no halt path, so the autonomous phase has no rule to stop on`);
  const citation = new RegExp(`asd-phase-impl\\.md\`? step ${applyStep}\\b`);
  const sprintSkills = jsonOf('.asd/skills/asd-sprint/SKILL.md', 'Delegates').skills.join('\n');
  for (const [site, text] of [['asd-init "Modes"', modeMap[mode]], ['asd-sprint "Delegates"', sprintSkills], ['sprint-lifecycle.md "Plan file format"', grammar]]) {
    assert.ok(citation.test(text), `${site} must cite the step that applies the settings change (asd-phase-impl.md step ${applyStep}) - a stale step number sends the reader to a step that no longer does it`);
  }
  assert.ok(jsonOf(impl, 'Entry').ops.some((op) => op.includes('asd-init sprint-mediated mode') && op.includes(`step ${applyStep}`)), `asd-phase-impl.md Entry ops must name step ${applyStep} for the asd-init dispatch`);
  const gateLine = stepOf(flow, '9').split('\n').find((line) => line.includes('`.asd/project/config.yaml`'));
  assert.ok(gateLine && gateLine.includes(`step ${applyStep}`), `the completion gate must count config.yaml as authorised when step ${applyStep} wrote it, or the settings change fails the gate that follows it`);
  assert.ok(sprintSkills.includes('asd-init sprint-mediated mode'), 'asd-sprint "Delegates" must admit asd-init in that mode - it otherwise forbids every skill but the phase skills');
  assert.ok(!canonText(init).includes('## Always first (both modes)') && new RegExp(`${mode} mode skips`, 'i').test(subOf(sectionOf(init, 'Steps'), 'Always first')), `the managed-block sync writes AGENTS.md/CLAUDE.md, paths step 9 does not authorise, so "Always first" must exempt ${mode} mode`);
  assert.ok(sectionOf('.asd/rules/core.md', 'Invariants').includes('`sprint-lifecycle.md` "Plan file format"'), 'core.md "Invariants" names /asd-init the only settings writer, so its sprint-mediated exception must point at the grammar');
  const hardRule = canonText('.asd/templates/t_AGENTS.md').split('\n').find((line) => line.includes('edits settings'));
  assert.ok(hardRule && hardRule.includes('`impl`'), "t_AGENTS.md's hard rule, synced into every consumer's AGENTS.md, must name impl as the settings writer's second caller");
});

test('sprint-017 AC-5/AC-7: no live canon, README, runtime or hook keeps a mechanism review waves replaced - split parts, --halve, the out-of-part predicate, the split threshold, the Dispatch ceiling, External batches and their partial outcome, or a self-diff ref pair - except a line naming it as legacy', () => {
  const needles = REPLACED_REVIEW_MECHANISMS;
  const hooks = fs.readdirSync(path.join(REPO_ROOT, '.asd/hooks')).filter((file) => file.endsWith('.js')).map((file) => `.asd/hooks/${file}`);
  const files = [...canonMarkdownFiles(), 'README.md', 'AGENTS.md', '.asd/runtime.js', '.asd/templates/external-review/t_review-scope.json', '.asd/templates/t_state.json', ...hooks];
  assert.ok(files.includes('.asd/rules/sprint-lifecycle.md') && hooks.length > 0, 'sanity: the sweep must reach the rule docs and the hooks');
  const leftovers = files.flatMap((rel) => canonText(rel).split('\n').flatMap((line, index) => needles.filter((needle) => needle.test(line) && !/\blegacy\b/i.test(line)).map((needle) => `${rel}:${index + 1} ${line.match(needle)[0]}`)));
  assert.deepStrictEqual(leftovers, [], 'AC-5: review waves are the one canonical mechanism for splitting a large review scope; a surviving reference to a removed one tells an orchestrator to run a step no runtime supports. Only a line stating legacy handling for an in-flight sprint may name one');
  const partialLegacy = sectionOf('.asd/rules/sprint-lifecycle.md', 'State recovery').split('\n').find((line) => line.includes('APPROVE (partial:'));
  assert.ok(partialLegacy && /satisfied for its iteration, never latched/.test(partialLegacy), 'D7/AC-6: a partial already recorded in an in-flight sprint must still read as satisfied, never latched, under backward_compat: migration');
});

test('sprint-017 (DOC-2): review wave K is 1-based and its state node is reviews.impl.waves[K-1] - no canon, README or agent memory a dispatched agent loads indexes it as waves[K]', () => {
  assert.ok(sectionOf('.asd/rules/sprint-lifecycle.md', 'Review iteration counters').includes('`reviews.impl.waves[K-1].iteration`'), 'sanity: sprint-lifecycle.md "Review iteration counters" is the source defining wave K\'s node as waves[K-1]');
  const files = [...canonMarkdownFiles(), 'README.md', ...rosterMemoryFiles()];
  const offByOne = files.flatMap((rel) => canonText(rel).split('\n').flatMap((line, index) => (/\bwaves\[K\]/.test(line) ? [`${rel}:${index + 1}`] : [])));
  assert.deepStrictEqual(offByOne, [], 'DOC-2: waves[K] names wave K+1\'s node (or none, for the last wave), so a line reading it as wave K\'s iteration, heads, verdicts or latches points the reader at the wrong wave - and a memory line is reloaded on every dispatch');
});

test('sprint-017 AC-8 (D8): review-policy.md "Scope hand-off" is the sole home of the list/diff/whole-files triple, and every workflow, reviewer agent, External Review file and README links to it', () => {
  const heading = '## Scope hand-off';
  const homes = [...canonMarkdownFiles(), 'README.md'].filter((rel) => canonText(rel).split('\n').some((line) => line.trim() === heading));
  assert.deepStrictEqual(homes, ['.asd/rules/review-policy.md'], 'D8: the hand-off must be stated once');
  const handOff = sectionOf('.asd/rules/review-policy.md', 'Scope hand-off');
  assert.ok(['1. **List**', '2. **Diff**', '3. **Whole files**'].every((item) => handOff.includes(item)), 'AC-8: the home must carry the fixed triple in order');
  assert.ok(/No reviewer — the wrapped CLI included — runs git to derive, widen or narrow its scope/.test(handOff), 'AC-8: the agent never derives its own scope, External Review included');
  const link = /review-policy\.md`? (?:"|§ )Scope hand-off/;
  const citers = ['.asd/workflows/asd-phase-impl-review.md', '.asd/workflows/asd-phase-design-review.md', '.asd/rules/external-review.md', '.asd/agents/asd-external-review.md', '.asd/templates/external-review/t_prompt-external-impl.md', '.asd/templates/external-review/t_prompt-external-design.md', 'README.md', ...internalReviewers().map((reviewer) => `.asd/agents/asd-reviewer-${reviewer}.md`)];
  assert.deepStrictEqual(citers.filter((rel) => !link.test(canonText(rel))), [], 'D8: every site handing a reviewer its scope must link the one home instead of restating it');
});

test('sprint-020 AC-6: the workflow is a hard, never-defaulted choice asked only at scope step 1, frozen through the t_state.json seed and gated in checkpoints.md, held by no config key, and no doc calls a workflow the default', () => {
  const definitions = readWorkflowDefinitions();
  const names = definitions.map((definition) => definition.name);
  assert.strictEqual(JSON.parse(readRepoFile('.asd/templates/t_state.json')).workflow, '{{WORKFLOW}}', 't_state.json must seed the frozen workflow, since artifact-layout.md reads state keys only from the template');
  const ask = stepOf(sectionOf('.asd/workflows/asd-phase-scope.md', 'Steps'), '1');
  assert.ok(/request user decision/i.test(ask) && ask.includes('{{WORKFLOW}}') && names.every((name) => ask.includes(`\`${name}\``)), `asd-phase-scope.md step 1 must ask the user to choose among every workflow (${names.join(', ')}) and seed {{WORKFLOW}} from the answer`);
  assert.ok(/never defaulted/.test(ask) && ask.includes('[GATE hard: workflow choice]') && ask.includes('`sprint-lifecycle.md` "Workflows"'), 'scope step 1 is the single home of the ask: it must name the hard gate, forbid a default and cite the rule');
  const selection = sectionOf('.asd/rules/sprint-lifecycle.md', 'Workflows').split('\n').find((line) => line.startsWith('**Selection**')) || '';
  assert.ok(/never defaulted/.test(selection) && /absent field reads `standard`/.test(selection), 'sprint-lifecycle.md "Workflows" Selection: no default at sprint start, while a state.json without the field reads standard - the one rule that keeps an in-flight sprint running');
  const gatePolicy = sectionOf('.asd/rules/checkpoints.md', 'Gate policy');
  assert.ok(gatePolicy.split('\n').some((line) => line.startsWith('Hard in both modes:') && /workflow choice/.test(line) && line.includes('`sprint-lifecycle.md` "Workflows"')), 'checkpoints.md "Gate policy" must list the workflow choice as hard in both modes, citing its rule');
  const inventory = canonText('.asd/rules/checkpoints.md').split('\n').find((line) => line.startsWith('| workflow choice'));
  assert.ok(inventory && /^hard\b/.test(inventory.split('|')[2].trim()), 'checkpoints.md "Gate inventory" must class the workflow choice hard');
  assert.ok(!/^\s*workflow\s*:/m.test(readRepoFile('.asd/templates/t_config.yaml')), 'AC-6: the config holds no workflow default - a workflow key in t_config.yaml would be read as one');
  const sprintSkill = canonText('.asd/skills/asd-sprint/SKILL.md').split('\n');
  const advance = sprintSkill.find((line) => line.startsWith('- `COMPLETED`')) || '';
  assert.ok(advance.includes('`next[<phase>]`') && /relay FAILED/.test(advance), "AC-6: asd-sprint Step 3 dispatches only a NEXT inside the frozen definition's next[<phase>] and relays any other as FAILED - the guard every return-contract check above relies on");
  const menu = sprintSkill.find((line) => /re-run earlier phase/.test(line) && /Re-run options/.test(line)) || '';
  assert.ok(menu.includes("definition's `phases`"), 'AC-6: the resume menu offers only phases of the frozen definition - a lite sprint offered design would re-run a phase its chain lacks');
  const rollback = sprintSkill.find((line) => line.includes('*re-run earlier phase* = rollback')) || '';
  assert.ok(rollback.includes('`rollback_reset`'), "AC-6: the rollback the resume menu triggers must reset per the frozen definition's rollback_reset");
  const resumeFlow = (/### Step 2B[\s\S]*?\n### /.exec(sprintSkill.join('\n')) || [''])[0];
  const collapseSentences = resumeFlow.split(/(?<=\.)\s+/).filter((sentence) => /collapse test/.test(sentence));
  assert.ok(collapseSentences.some((sentence) => /Re-run options/.test(sentence)) && collapseSentences.some((sentence) => /\*resume\* re-enters/.test(sentence)), 'sanity: the asd-sprint resume flow must still apply the collapse test at both acting sites - the re-run menu and the resume exception - or the relation below compares nothing');
  const holders = definitions.filter((definition) => definition.phases.includes('design')).map((definition) => definition.name);
  for (const sentence of collapseSentences) {
    assert.deepStrictEqual(names.filter((name) => sentence.includes(`\`${name}\``)), holders, `AC-6: sprint-lifecycle.md "Workflows" derives the design-block collapse from phases, so each asd-sprint resume-flow collapse clause must name exactly the workflows whose chain holds design (${holders.join(', ')}) - an unscoped clause dispatches plan for a lite sprint resumed at design-promote, which lite's plan precondition aborts. Clause: ${sentence}`);
  }
  const quoted = new RegExp(`\`(?:${names.join('|')})\``);
  const claims = [...canonMarkdownFiles(), 'README.md', 'AGENTS.md'].flatMap((rel) => canonText(rel).split('\n').flatMap((line, index) => (line.split(/(?<=\.)\s+/).some((sentence) => quoted.test(sentence) && /\bthe default\b|\bby default\b|\bdefaults to\b|\(default\)/i.test(sentence)) ? [`${rel}:${index + 1}`] : [])));
  assert.deepStrictEqual(claims, [], `AC-6: the user always chooses the workflow and no config default exists, so no sentence quoting a workflow may call it a default ("the default", "by default", "defaults to", "(default)") - an absent state field reading standard is legacy handling, not a default a user can rely on. Found: ${claims.join(', ')}`);
});

test('sprint-021 AC-7/AC-10/AC-11: each literal the sprint states at two sites agrees - the reviewer return-file path at its home, README and both review workflows, the wrapped-CLI timeout floor at rule and wrapper, the stall decisions-log line at rule and template, and the liveness cadence at rule and host mapping', () => {
  const returnFile = /`(\.asd\/tmp\/[^`]*\.return\.md)`/;
  const home = (returnFile.exec(sectionOf('.asd/rules/review-policy.md', 'Coverage ledger')) || [])[1];
  assert.strictEqual(home, '.asd/tmp/<sprint>-<phase>-<iteration id>-<reviewer>.return.md', 'review-policy.md "Coverage ledger" Persistence is the home of the internal reviewer\'s return-file path');
  assert.ok(canonText('README.md').includes(`\`${home}\``), 'README.md must name the return file exactly as its home does');
  for (const rel of ['.asd/workflows/asd-phase-design-review.md', '.asd/workflows/asd-phase-impl-review.md']) {
    const flow = canonText(rel);
    const phase = (/persist-review --phase ([a-z]+)/.exec(flow) || [])[1];
    const named = (returnFile.exec(flow) || [])[1] || '';
    assert.ok(phase && new RegExp(`^\\.asd/tmp/<NNN-slug>-${phase}-.+-<reviewer>\\.return\\.md$`).test(named), `${rel}: the payload names the return file persist-review --in reads, so it must instantiate the home's <sprint>-<phase>-<iteration id>-<reviewer> with this workflow's own --phase (${phase}) - a reviewer writing one name while the orchestrator reads another loses every return as an interrupted dispatch; got ${named}`);
  }

  const floor = (rel) => Number((/at least (\d+) minutes/.exec(canonText(rel)) || [])[1]);
  assert.ok(floor('.asd/rules/external-review.md') >= 10 && floor('.asd/agents/asd-external-review.md') === floor('.asd/rules/external-review.md'), 'AC-11: the wrapped CLI\'s shell-timeout floor (at least 10 minutes) must be the same number in external-review.md "Outcome contract" and the wrapper\'s Tool policy, which acts on it');

  const liveness = sectionOf('.asd/rules/sprint-lifecycle.md', 'Agent liveness');
  const stallLine = (/`(- YYYY-MM-DD — stall: [^`]+)`/.exec(liveness) || [])[1];
  assert.ok(stallLine && canonText('.asd/templates/t_decisions-log.md').split('\n').includes(stallLine), 'AC-7: a second stall of a dispatch is counted from its decisions-log lines, so t_decisions-log.md must ship the stall line in the exact form "Agent liveness" writes');
  const cadenceMinutes = Number((/at least every (\d+) minutes/.exec(liveness) || [])[1]);
  const intervalSeconds = Number((/agent-liveness --interval (\d+)/.exec(canonText('.asd/rules/providers.md')) || [])[1]);
  assert.ok(cadenceMinutes > 0 && intervalSeconds === cadenceMinutes * 60, `AC-7: providers.md "Agent liveness per host" must run agent-liveness at the cadence "Agent liveness" sets - ${cadenceMinutes} min vs --interval ${intervalSeconds} s`);
});

test('sprint-022 D6: asd-init sprint-mediated mode writes each pair with the template\'s inline comment, and the project config carries the template\'s user_gates comment', () => {
  const mediated = subOf(sectionOf('.asd/skills/asd-init/SKILL.md', 'Steps'), 'Sprint-mediated');
  assert.ok(/inline comment/.test(stepOf(mediated, 3)) && /\btemplate\b/.test(stepOf(mediated, 3)), 'D6: sprint-mediated step 3 - a written pair\'s line takes the template\'s inline comment for its key, or a shipped comment rewrite never reaches an existing config');
  const comment = (rel) => (/^user_gates:[^#\n]*(#.*)$/m.exec(canonText(rel)) || [])[1];
  assert.ok(comment('.asd/templates/t_config.yaml'), 'sanity: t_config.yaml user_gates carries an inline comment');
  assert.strictEqual(comment('.asd/project/config.yaml'), comment('.asd/templates/t_config.yaml'), 'D6 (Task 7): the project config\'s user_gates comment is the template\'s - the stale closure comment was refreshed by a same-value sprint-mediated settings change');
});

test('sprint-022 AC-10: providers.md "Model family resolution" table is release-manifest.json model_families row for row, and README names exactly the concrete Codex ids the manifest maps the families to', () => {
  const { claude, codex } = loadManifest().model_families;
  const families = [...new Set([...Object.keys(claude), ...Object.keys(codex)])];
  const section = sectionOf('.asd/rules/providers.md', 'Model family resolution');
  const rows = section.slice(section.indexOf('| Family |')).split('\n\n')[0].split('\n').slice(2).map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));
  assert.deepStrictEqual(rows.map(([family]) => family).sort(), [...families].sort(), 'providers.md "Model family resolution" table must hold one row per model_families family in release-manifest.json - a family added, dropped or repeated on one side only');
  for (const [family, claudeCell, codexCell] of rows) {
    if (claude[family]) assert.strictEqual(claudeCell, claude[family], `providers.md "Model family resolution" row "${family}": its Claude id must be the one release-manifest.json maps it to`);
    if (codex[family]) assert.strictEqual(codexCell, codex[family], `providers.md "Model family resolution" row "${family}": its Codex id must be the one release-manifest.json maps it to - a model bump edits the manifest and leaves this mirror on the retired id`);
  }
  const named = [...canonText('README.md').matchAll(new RegExp(`gpt-\\d+(?:\\.\\d+)?-(?:${Object.keys(codex).join('|')})\\b`, 'g'))].map(([id]) => id);
  assert.deepStrictEqual([...new Set(named)].sort(), Object.values(codex).sort(), 'README names the concrete Codex ids the manifest maps the families to (AGENTS.md: a change to the family map updates README in the same change) - none retired, none missing');
});

test('sprint-023 AC-3: both external-review prompt templates hand the wrapped CLI the scope manifest by path through one slot, the same in both and outside any code fence', () => {
  const slotsOf = (rel) => [...canonText(rel).matchAll(/\{\{(SCOPE_MANIFEST[A-Z_]*)\}\}/g)].map((match) => match[1]);
  const impl = '.asd/templates/external-review/t_prompt-external-impl.md';
  const design = '.asd/templates/external-review/t_prompt-external-design.md';
  assert.deepStrictEqual(slotsOf(impl), ['SCOPE_MANIFEST_PATH'], `${impl} must carry exactly one scope-manifest slot, the path - an inline-manifest slot puts the whole JSON into the heredoc the Bash length cliff rejects`);
  assert.deepStrictEqual(slotsOf(design), slotsOf(impl), `${design} must name the same slot as the impl prompt - the one agent procedure fills both, and a slot it does not know reaches the wrapped CLI as literal braces`);
  for (const rel of [impl, design]) {
    const text = canonText(rel);
    const fencesBefore = text.slice(0, text.indexOf('{{SCOPE_MANIFEST')).match(/^```/gm) || [];
    assert.strictEqual(fencesBefore.length % 2, 0, `${rel}: the manifest slot must sit outside any code fence - a path in a fenced JSON block is the inline-manifest layout the sprint replaced`);
  }
});

test('sprint-023 AC-6, sprint-024 AC-7: code-style.md §17 bounds the fail-first proof of a content-contract test per entry - a mutation per added assert plus one reword control - and has the run count recorded as runs: <n> in the Added tests cell, which t_test-plan.md gives a count for', () => {
  const added = sectionOf('.asd/templates/t_test-plan.md', 'Added tests');
  const column = (/^\| Test \| Gap proof \| ([^|]+) \|$/m.exec(added) || [])[1];
  assert.ok(column, 't_test-plan.md "Added tests" must keep its two-column table with the proof column header');
  const proof = added.split('\n').find((line) => line.startsWith('| {{file:name}}')) || '';
  const forms = proof.split(' | ').pop().split('\\|').slice(1);
  assert.ok(forms.length > 0 && forms.every((form) => form.includes('runs: <n>')), `the ${column.trim()} cell must give every form of proof a "runs: <n>" count - a proof without it cannot be checked against the bound`);
  const bullet = sectionOf('.asd/rules/code-style.md', '17. Tests').split('\n').find((line) => line.startsWith('- A content-contract test pins')) || '';
  assert.ok(bullet.includes(`\`${column.trim()}\``) && bullet.includes('"Added tests"') && /\bmutation\b/.test(bullet) && /\breword/.test(bullet) && bullet.includes('runs: <n>'), `code-style.md §17's content-contract bullet must bound the proof (a mutation per added assert, a reword control per entry) and name the "Added tests" ${column.trim()} cell that records the run count - unbounded, a proof run is open-ended and unrecorded`);
});

test('sprint-027 AC-5 (D4/D5): t_research.md keeps the sections the scope workflow writes and later phases read, each finding carries a source, the offline skip line is the one the home states, and artifact-layout.md maps and describes research.md', () => {
  const template = canonText('.asd/templates/t_research.md');
  const headings = [...template.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
  assert.deepStrictEqual(headings, ['Requirements', 'Findings', 'Approaches'], 'AC-5: t_research.md sections, in the order the stages fill them');
  assert.ok(/^responsibility:\n  owns:/.test(template.replace(/^---\n/, '')), 'AC-5: t_research.md opens with the responsibility frontmatter every template carries');
  assert.ok(/^- \{\{finding\}\} — source: \{\{URL\}\}$/m.test(template), 'AC-5: a finding row carries its source URL');
  assert.ok(/^- Recommended: /m.test(template) && /^- Chosen: /m.test(template), 'AC-5: Approaches records the recommendation and the user\'s choice separately');
  assert.ok(/^- Raw scope: /m.test(template) && canonText('.asd/workflows/asd-phase-scope.md').includes('write the raw scope'), 'AC-5: the raw scope the covers-strands-only boundary refers to has a template line and a scope writer');
  const home = headingBody('.asd/rules/sprint-lifecycle.md', 'Staged solution design');
  assert.ok(home.includes('`no web research: <cause>`'), 'D5: the offline skip line is stated at the home');
  assert.ok(canonText('.asd/workflows/asd-phase-scope.md').includes('`no web research: <cause>`'), 'D5: scope step 2 writes the same skip line the home states');
  const layout = canonText('.asd/rules/artifact-layout.md');
  assert.ok(layout.includes('research.md                    # scope, "Research"') && headingBody('.asd/rules/artifact-layout.md', 'Research').includes('`t_research.md`'), 'AC-5: artifact-layout.md maps research.md and names its template');
});

test('sprint-032 AC-11: t_prd.html renders the story connectives as the placeholders {{story_as}}, {{story_i_want}} and {{story_so_that}} instead of literal English', () => {
  const story = (canonText('.asd/templates/t_prd.html').split('\n').find((line) => line.includes('<li>') && line.includes('{{role}}')) || '');
  assert.deepStrictEqual(['{{story_as}}', '{{story_i_want}}', '{{story_so_that}}'].filter((placeholder) => !story.includes(placeholder)), [], `AC-11: the story line carries all three connective placeholders; got: ${story}`);
  assert.ok(!/<b>(?:as|I want|so that)<\/b>/.test(story), 'AC-11: no connective stays literal English');
});

test('sprint-033 AC-25: README no longer says the External Review wrapper applies the severity floor - persist-review does, so its roster row names no wrapper-applied floor', () => {
  const row = canonText('README.md').split('\n').find((line) => line.startsWith('| `asd-external-review` |')) || '';
  assert.ok(row.includes('Wraps the *other* provider\'s CLI'), 'sanity: the README roster row of the wrapper is found');
  assert.ok(!/applies severity floor/.test(row), 'AC-25: persist-review --floor applies the floor, but the README roster row of asd-external-review still says the wrapper does');
});

test('sprint-033 AC-6: README names the orchestrator session-model recommendation and the haiku alias environment variable', () => {
  const readme = canonText('README.md');
  const session = readme.split('\n').find((line) => line.startsWith('**Orchestrator session model.**')) || '';
  assert.ok(session.includes('Opus') && session.includes('Fable') && session.includes('`medium`'), `AC-6: the session-model paragraph recommends Opus at medium effort and Fable for long or large runs; got: ${session}`);
  assert.ok(readme.includes('`ANTHROPIC_DEFAULT_HAIKU_MODEL`') && readme.includes('Haiku 4.5'), 'AC-6: the haiku alias note names Haiku 4.5 and the variable that overrides it');
});

test('sprint-034 AC-10/AC-11 (033#P-1, issues #86, #119): "Impacted test set" defines Suite run Scope full as every test file run with no test-name filter, an impacted set holding them all included, and counts a review-fix tester\'s recorded check for reuse; the template and the tester agent carry the same rule', () => {
  const impacted = sectionOf('.asd/rules/sprint-lifecycle.md', 'Impacted test set');
  const scopeRule = impacted.split('\n').find((line) => line.startsWith('**Scope.**')) || '';
  assert.ok(scopeRule.includes('`full` when every test file ran with no test-name filter') && scopeRule.includes('an impacted set holding all of them') && scopeRule.includes('else `impacted`'), 'AC-10 (combined-1, external-2): "Impacted test set" must define Scope full as every test file run with no test-name filter - the unscoped command, the safety valve or an impacted set holding all of them - else impacted, so an exhaustive impacted run counts as the full suite');
  assert.ok(scopeRule.includes('`named` for a review-fix run of a named test or name-filtered selection, never reused'), 'AC-10 (combined-1): a review-fix run of a named test or filtered selection is Scope named and never reused, so a filtered run cannot gate a suite');
  const reuse = impacted.split('\n').find((line) => line.startsWith('**Reuse.**')) || '';
  assert.ok(reuse.includes('review-fix tester') && reuse.includes('`Suite run` counts on the same terms'), 'AC-11: a review-fix tester\'s recorded `Suite run` counts for reuse on the reuse rule\'s terms');
  const template = canonText('.asd/templates/t_test-plan.md');
  const scopeLine = template.split('\n').find((line) => line.startsWith('- Scope:')) || '';
  assert.ok(scopeLine.includes('`full` when every test file ran with no test-name filter') && scopeLine.includes('`named` for a named test or name-filtered run (never reused)') && scopeLine.includes('"Impacted test set" **Scope.**'), 'AC-10 (combined-1, external-2): the t_test-plan.md Scope line states the full and named rules and cites their home');
  assert.ok(template.includes('review-fix tester also records here the check a finding requires') && template.includes('step 8 reuses it'), 'AC-11: the template\'s Suite run section says the review-fix tester records there and impl-test step 8 reuses it');
  const tester = canonText('.asd/agents/asd-tester.md');
  assert.ok(tester.split('\n').some((line) => line.includes('A new `Suite run` records `HEAD` and Scope (Scope per `sprint-lifecycle.md` "Impacted test set" **Scope.**)') && !line.includes('`full` when the run executed the whole suite')), 'AC-10 (combined-1): the tester agent records Scope by citing the rule\'s home, runner and base alike, never restating a narrower full');
  assert.ok(tester.split('\n').some((line) => line.includes('review-fix') && line.includes('`Suite run` (Command, Scope, Result, HEAD)') && line.includes('`artifact-layout.md` "Test plan"') && line.includes('Scope `named` for a named test or name-filtered run')), 'AC-11 (combined-1): the tester agent\'s review-fix mode writes Suite run inside the Test plan grant, Scope named for a named or filtered run');
});

test('sprint-034 AC-12 (issue #114): every internal reviewer dispatch entry of both review workflows carries findings_header and External Review\'s never does, and the dispatch-payload rule defines it as the t_review.md findings header row for internal reviewers only', () => {
  for (const rel of ['.asd/workflows/asd-phase-design-review.md', '.asd/workflows/asd-phase-impl-review.md']) {
    const dispatch = jsonOf(rel, 'Dispatch');
    const internal = dispatch.filter((entry) => entry.agent.startsWith('asd-reviewer-'));
    const wrapper = dispatch.find((entry) => entry.agent === 'asd-external-review');
    assert.ok(internal.length > 0 && wrapper, `sanity: ${rel} must dispatch an internal reviewer and External Review`);
    assert.deepStrictEqual(internal.filter((entry) => !entry.payload.includes('findings_header')).map((entry) => entry.agent), [], `AC-12: ${rel} must send findings_header to every internal reviewer`);
    assert.ok(!wrapper.payload.includes('findings_header'), `AC-12: ${rel} must not send findings_header to External Review`);
  }
  const rule = canonText('.asd/rules/agent-protocol.md').split('\n').find((line) => line.startsWith('- Role keys a workflow\'s dispatch names')) || '';
  const keyDefinition = /`findings_header` \(([^)]*)\)/.exec(rule);
  assert.ok(keyDefinition && keyDefinition[1].includes('internal reviewers only') && keyDefinition[1].includes('never External Review') && keyDefinition[1].includes('`t_review.md`'), 'AC-12: agent-protocol.md "Dispatch payload" must define findings_header as the t_review.md header row for internal reviewers only');
  const header = canonText('.asd/templates/t_review.md').split('\n').find((line) => /^\|\s*#\s*\|\s*Severity\s*\|/.test(line));
  assert.ok(header, 'AC-12: t_review.md must keep the findings header row findings_header names');
});

test('sprint-035 AC-9: every flag canon passes to a `node .asd/runtime.js` command is one that command reads, so the unknown-flag warning never fires on a documented call', () => {
  const declared = new Map([...canonText('.asd/runtime.js').split('const COMMAND_FLAGS = {')[1].split('\n};')[0].matchAll(/^\s+'?([a-z-]+)'?: \[([^\]]*)\],?$/gm)].map(([, name, list]) => [name, new Set([...list.matchAll(/'([^']+)'/g)].map(([, flag]) => flag))]));
  assert.ok(declared.size > 20 && declared.has('emit-manifest') && declared.get('scratch-dir').size === 0, 'sanity: the declared flag sets parse out of runtime.js, an empty set included');
  const checked = [];
  const stray = [...canonMarkdownFiles(), 'README.md'].flatMap((rel) => canonText(rel).split('\n').flatMap((line, index) => [...line.matchAll(/node \.asd\/runtime\.js ([a-z-]+)([^`"]*)/g)].flatMap(([, command, rest]) => {
    if (!declared.has(command)) return [];
    return [...rest.matchAll(/(?<![\w-])--([a-z][a-z-]*)/g)].flatMap(([, flag]) => {
      checked.push(`${command} --${flag}`);
      return declared.get(command).has(flag) ? [] : [`${rel}:${index + 1} ${command} --${flag}`];
    });
  })));
  assert.ok(checked.length > 50, `sanity: the sweep must reach canon's runtime invocations (reached ${checked.length})`);
  assert.deepStrictEqual(stray, [], 'a documented flag missing from COMMAND_FLAGS warns on every real call - declare it there, or fix the doc');
});

test('sprint-035 AC-3: impl-test step 10 runs `smoke` once at the green exit, records a Smoke line and routes a failure as a code defect with Failing test none (smoke); the tester runner, the Suite run template and the Defects template carry the same line and token', () => {
  const step = stepOf(sectionOf('.asd/workflows/asd-phase-impl-test.md', 'Steps'), 10);
  assert.ok(step.includes('`commands.yaml` carries `smoke`') && step.includes('`Smoke: <command> — pass|fail`') && step.includes('`Failing test: none (smoke)`'), 'AC-3: step 10 runs the key when present, records the Smoke line and names the defect token');
  assert.ok(canonText('.asd/agents/asd-tester.md').includes('`Smoke: <command> — pass|fail`'), 'AC-3: the tester runner records the same Smoke line');
  const template = canonText('.asd/templates/t_test-plan.md');
  assert.ok(/^- Smoke: /m.test(template) && template.includes('none (smoke)'), 'AC-3: the Suite run template has the Smoke line and the Defects template the none (smoke) token');
  assert.ok(/^# smoke: /m.test(canonText('.asd/templates/t_commands.yaml')), 'AC-3: the commands template carries the optional smoke key');
});

test('sprint-035 AC-2: the reliability checklist has a template and a home section, appears in both artifact-layout Paths maps and the README folder map, and scope intake and retro name it', () => {
  assert.ok(fs.existsSync(path.join(REPO_ROOT, '.asd/templates/t_reliability-checklist.md')), 'AC-2: the template exists');
  assert.ok(canonText('.asd/rules/artifact-layout.md').includes('\n## Reliability checklist\n'), 'AC-2: the home section exists');
  const layout = canonText('.asd/rules/artifact-layout.md').split('\n').filter((line) => line.includes('reliability-checklist.md') && line.includes('# lazy, "Reliability checklist"'));
  assert.strictEqual(layout.length, 2, 'AC-2: one Paths line in each of the two maps');
  assert.ok(canonText('README.md').includes('reliability-checklist.md'), 'AC-2: the README folder map lists it');
  assert.ok(canonText('.asd/workflows/asd-phase-scope.md').includes('reliability-checklist.md') && canonText('.asd/workflows/asd-phase-retro.md').includes('node .asd/runtime.js checklist-hits'), 'AC-2, AC-4: scope intake names the file and retro runs checklist-hits');
});

test('sprint-036 AC-1/AC-3: the sol family maps to gpt-6.2-sol with luna unchanged, and the README paragraph naming the concrete Codex ids states the 0.167.0 minimum and the model_not_found refusal an older client gets', () => {
  const { codex } = loadManifest().model_families;
  assert.deepStrictEqual([codex.sol, codex.luna], ['gpt-6.2-sol', 'gpt-6-luna'], 'AC-1: only the sol family moved');
  const paragraph = canonText('README.md').split('\n').find((line) => line.includes('Codex CLI 0.167.0 or later')) || '';
  assert.ok(paragraph.includes('gpt-6.2-sol') && paragraph.includes('model_not_found'), 'AC-3: the README paragraph names gpt-6.2-sol, Codex CLI 0.167.0 or later and the model_not_found refusal together');
});

test('sprint-036 AC-6/AC-15/AC-16: pr open mode lists External Review availability skips and keeps AI attribution out of the body, the template carries the skip section, the commits rule names the rejection, and asd-sprint, asd-init, the config template and the README carry the attribution setting', () => {
  const prStep = stepOf(sectionOf('.asd/workflows/asd-phase-pr.md', 'Steps'), '2');
  assert.ok(prStep.includes('APPROVE (skipped: …)') && prStep.includes('`Unreviewed files`') && prStep.includes('"External Review skipped"'), 'AC-6: pr open mode step 2 lists each skipped wave with its unreviewed files under the template\'s section');
  assert.ok(prStep.includes('`git.ai_attribution: disabled`'), 'AC-16: pr open mode step 2 keeps AI attribution out of the body under disabled');
  assert.ok(canonText('.asd/templates/t_pr-description.md').includes('\n## External Review skipped'), 'AC-6: the PR template carries the External Review skipped section');
  const commits = sectionOf('.asd/rules/git-strategy.md', 'Commits');
  assert.ok(commits.includes('`git.ai_attribution: disabled`') && commits.includes('`commit-check` rejects'), 'AC-16: "Commits" states the commit-check rejection once, under disabled');
  assert.ok(canonText('.asd/skills/asd-sprint/SKILL.md').includes('node .asd/runtime.js attribution-check'), 'AC-16: asd-sprint runs the attribution check');
  assert.ok(canonText('.asd/skills/asd-init/SKILL.md').includes('`git.ai_attribution`'), 'AC-15: asd-init edits the key');
  assert.ok(/^ {2}ai_attribution: enabled$/m.test(canonText('.asd/templates/t_config.yaml')) && canonText('README.md').includes('ai_attribution: enabled'), 'AC-15: the config template ships the key enabled and the README config schema lists it');
});

test('sprint-036 AC-7/AC-12/AC-14: providers.md passes --returns for reviewer dispatches and the README runtime list names agent-liveness --returns and the commit-check message-file form', () => {
  assert.ok(subOf(canonText('.asd/rules/providers.md'), 'Agent liveness per host').includes('--returns <json>'), 'AC-14: the Claude Code wake-up bullet passes --returns for a reviewer dispatch');
  const readme = canonText('README.md');
  assert.ok(readme.includes('[--returns <json>]') && readme.includes('commit-check --message-file <file> -- <paths>'), 'AC-12/AC-14: the README runtime command list carries both forms');
});
