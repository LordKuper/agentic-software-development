'use strict';

// content contracts of templates and README

const { assert, fs, path, sync, update, runtime, REPO_ROOT, tests, test, loadManifest, declaredScopeFields, readWorkflowDefinitions, arrowChain, readRepoFile, canonText, sectionOf, jsonOf, canonMarkdownFiles, migrateConfig900 } = require('./lib.js');

test('README.md agent-count claims match the actual .asd/agents/*.md file count', () => {
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

  const plan = sync.buildSyncPlan(REPO_ROOT);
  const definitionMatches = [...readmeText.matchAll(/(\d+) agent definitions/g)];
  const providerCounts = ['agent-claude', 'agent-codex'].map((kind) => plan.filter((item) => item.kind === kind).length);
  assert.deepStrictEqual(definitionMatches.map((match) => Number(match[1])), providerCounts, 'Sprint 038 AC-12: README counts both provider rosters, including the Codex-only quota alternatives');
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

test('AC-2/4/6/7/sprint-017 AC-8: t_review-scope.json key set matches external-review.md\'s declared manifest fields exactly', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, '.asd/templates/external-review/t_review-scope.json'), 'utf8'));
  const declared = declaredScopeFields();
  assert.ok(declared.includes('files') && declared.includes('diff'), `sanity: the declared set must carry the list and the precomputed diff (AC-8 triple), got ${JSON.stringify(declared)}`);
  assert.deepStrictEqual(Object.keys(manifest).sort(), declared.slice().sort(), 'the template and external-review.md must declare the same scope-manifest fields - the runtime writes the template shape, the wrapped CLI is told the rule shape');
});

// iteration-3 review (sprint 006): the scope bounds what the reviewer
// judges, not what it may read - a prior wording pass over-reached and
// implied the named project-context reference paths (PRD, ADR, stack, etc.)
// were unreadable. Since sprint 017 the per-agent list alone is the scope (no
// exclude_paths[]); guards the distinction in the hand-off home and both
// prompts.
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

test("AC-8, sprint-020 AC-7: README's phase table, per-workflow phase table, chains, flowchart nodes and rosters, folder-map counts, and every phase-count word match the workflow definitions", () => {
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
  for (const [file, minSites] of [['README.md', 3], ['AGENTS.md', 0]]) {
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
    if (minSites > 0) assert.deepStrictEqual(names.filter((name) => !seen.has(name)), [], `${file} must state the phase count of every workflow at least once, bound to its name - with two chains an unbound count no longer says which one it describes`);
  }
});

test('sprint-013 AC-13..AC-18/AC-20: t_config.yaml and the README config schema are already in the 9.0.0 migration\'s shape', () => {
  const readme = /^## Configuration$[\s\S]*?```yaml\n([\s\S]*?)```/m.exec(readRepoFile('README.md'));
  assert.ok(readme, 'README.md must keep its "## Configuration" yaml schema block');
  for (const [label, text] of [['.asd/templates/t_config.yaml', canonText('.asd/templates/t_config.yaml')], ['README.md config schema', readme[1]]]) {
    const { report } = migrateConfig900(text);
    assert.deepStrictEqual([report.status, report.changes, report.reason], ['unchanged', [], null], `${label} must already be in the 9.0.0 shape - asd-init writes config from t_config.yaml and README mirrors it, so a removed key, a legacy value or a shipped stale comment there reaches every new project`);
  }
});

test('AC-4/AC-5/AC-7/AC-10: t_retrospective.html sits on the right side of the TOC threshold on both the full and the empty-log branch', () => {
  const template = fs.readFileSync(path.join(REPO_ROOT, '.asd/templates/t_retrospective.html'), 'utf8');
  const sections = [...template.matchAll(/<section id="([a-z-]+)"[^>]*>\s*<h2>([^<]+)<\/h2>/g)].map((section) => section[2]);
  assert.ok(sections.length > 0, 't_retrospective.html must keep its <section id> + <h2> fragment shape - every other assertion here reads it');
  const branchNote = /<!-- EMPTY-LOG BRANCH:([\s\S]*?)-->/.exec(template);
  assert.ok(branchNote, 't_retrospective.html must state which sections the empty-log branch keeps');
  const omitAt = branchNote[1].indexOf('OMIT');
  assert.ok(omitAt > 0, 'the empty-log note must separate kept from omitted sections with OMIT');
  const kept = sections.filter((title) => branchNote[1].indexOf(title) !== -1 && branchNote[1].indexOf(title) < omitAt);
  const threshold = readTocH2Threshold();
  assert.ok(kept.length >= threshold, `the empty-log branch keeps ${kept.length} h2 sections; below ${threshold} the shell omits the nav, yet the empty-log comment says the TOC is filled`);
  assert.ok(sections.length >= threshold, `the full branch has ${sections.length} h2 sections; below ${threshold} the shell omits the nav`);
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

test('sprint-021 AC-7/AC-10: the reviewer return-file path agrees at its home, README and both review workflows, and the liveness cadence at rule and host mapping', () => {
  const returnFile = /`(\.asd\/tmp\/[^`]*\.return\.md)`/;
  const home = (returnFile.exec(sectionOf('.asd/rules/review-policy.md', 'Coverage ledger')) || [])[1];
  assert.strictEqual(home, '.asd/tmp/<sprint>-<phase>-<iteration id>-<reviewer>.return.md', 'review-policy.md "Coverage ledger" Persistence is the home of the internal reviewer\'s return-file path');
  assert.ok(canonText('README.md').includes(`\`${home}\``), 'README.md must name the return file exactly as its home does');
  for (const rel of ['.asd/workflows/asd-phase-design-review.md', '.asd/workflows/asd-phase-impl-review.md']) {
    const flow = canonText(rel);
    const phase = (/persist-review --phase ([a-z]+)/.exec(flow) || [])[1];
    const named = (returnFile.exec(flow) || [])[1] || '';
    assert.ok(phase && new RegExp(`^\\.asd/tmp/<NNN-slug>-${phase}-.+-<reviewer>\\.return\\.md$`).test(named), `${rel}: the payload names the return file persist-review --in reads, so it must instantiate the home's path with this workflow's own --phase (${phase}); got ${named}`);
  }
  const liveness = sectionOf('.asd/rules/sprint-lifecycle.md', 'Agent liveness');
  const cadenceMinutes = Number((/at least every (\d+) minutes/.exec(liveness) || [])[1]);
  const intervalSeconds = Number((/agent-liveness --interval (\d+)/.exec(canonText('.asd/rules/providers.md')) || [])[1]);
  assert.ok(cadenceMinutes > 0 && intervalSeconds === cadenceMinutes * 60, `providers.md "Agent liveness per host" must run agent-liveness at the cadence "Agent liveness" sets - ${cadenceMinutes} min vs --interval ${intervalSeconds} s`);
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

test('sprint-032 AC-11: t_prd.html renders the story connectives as the placeholders {{story_as}}, {{story_i_want}} and {{story_so_that}} instead of literal English', () => {
  const story = (canonText('.asd/templates/t_prd.html').split('\n').find((line) => line.includes('<li>') && line.includes('{{role}}')) || '');
  assert.deepStrictEqual(['{{story_as}}', '{{story_i_want}}', '{{story_so_that}}'].filter((placeholder) => !story.includes(placeholder)), [], `AC-11: the story line carries all three connective placeholders; got: ${story}`);
  assert.ok(!/<b>(?:as|I want|so that)<\/b>/.test(story), 'AC-11: no connective stays literal English');
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

test('sprint-035 AC-2: the reliability checklist template exists, the README folder map lists it, and retro runs checklist-hits', () => {
  assert.ok(fs.existsSync(path.join(REPO_ROOT, '.asd/templates/t_reliability-checklist.md')), 'the template exists');
  assert.ok(canonText('README.md').includes('reliability-checklist.md'), 'the README folder map lists it');
  assert.ok(canonText('.asd/workflows/asd-phase-retro.md').includes('node .asd/runtime.js checklist-hits'), 'retro runs checklist-hits');
});
