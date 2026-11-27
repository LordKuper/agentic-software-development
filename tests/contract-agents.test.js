'use strict';

// content contracts of agent definitions and agent memory

const { assert, fs, path, sync, REPO_ROOT, test, workflowReviewerAgents, readRepoFile, canonText, sectionOf, jsonOf, canonMarkdownFiles, canonAgents, headingsOf, FORM_CATEGORIES } = require('./lib.js');

test('read-only agents (AC-3): an explicit claude.tools allowlist with no Write/Edit, and no Bash but External Review\'s', () => {
  const agentsDir = path.join(REPO_ROOT, '.asd', 'agents');
  const files = fs.readdirSync(agentsDir).filter((f) => f.endsWith('.md'));
  const nonReviewers = ['asd-advisor', 'asd-researcher', 'asd-scout'];
  const readOnlyNames = files
    .map((f) => f.slice(0, -3))
    .filter((name) => name === 'asd-external-review' || nonReviewers.includes(name) || name.startsWith('asd-reviewer-'));
  assert.deepStrictEqual(readOnlyNames.sort(), [...workflowReviewerAgents(), ...nonReviewers].sort(), 'the read-only set includes every dispatched reviewer, the advisor, researcher and scout');
  for (const name of readOnlyNames) {
    const { meta } = sync.parseCanonicalFrontmatter(sync.readNormalized(path.join(agentsDir, `${name}.md`)));
    assert.ok(Array.isArray(meta.claude && meta.claude.tools), `${name}: claude.tools must be an explicit allowlist - a subagent with none inherits the full parent tool set, so the absence checks below would pass vacuously`);
    assert.ok(!meta.claude.tools.includes('Write'), `${name}: claude.tools must not include "Write"`);
    assert.ok(!meta.claude.tools.includes('Edit'), `${name}: claude.tools must not include "Edit"`);
    assert.strictEqual(meta.claude.tools.includes('Bash'), name === 'asd-external-review', `${name}: Bash only for the External Review wrapper, which invokes the wrapped CLI as a subprocess`);
  }
});

test('sprint-028 AC-11: .claude/agents and .codex/agents hold exactly the generated definitions of the canonical agents and their variants - no retired agent view survives', () => {
  const expected = (kind) => sync.buildSyncPlan(REPO_ROOT).filter((item) => item.kind === kind).map((item) => path.basename(item.targetPath)).sort();
  const canonical = fs.readdirSync(path.join(REPO_ROOT, '.asd/agents')).filter((file) => file.endsWith('.md')).length;
  for (const [dir, kind] of [['.claude/agents', 'agent-claude'], ['.codex/agents', 'agent-codex']]) {
    const planned = expected(kind);
    assert.ok(planned.length > canonical, `${dir}: the plan must carry the variant beside the canonical agents, or the count below compares one side with nothing`);
    assert.deepStrictEqual(fs.readdirSync(path.join(REPO_ROOT, dir)).sort(), planned, `${dir} holds exactly the definitions the sync plan generates - a surviving retired view is dispatchable and loads a deleted role`);
  }
});


test('T-2/T-4/sprint-010 TST-01: in every agent-memory directory a dispatchable agent can load, MEMORY.md and the files beside it are a bijection - an index line landing without its target, and a memory file no index points at, both fail here', () => {
  const roster = fs.readdirSync(path.join(REPO_ROOT, '.claude/agents')).filter((name) => name.endsWith('.md')).map((name) => name.slice(0, -3)).sort();
  assert.ok(roster.length > 0, 'sanity: the agent roster must be derived from .claude/agents/*.md, or every check below passes vacuously - the hardcoded two-directory list this replaced is what let three of one round\'s six memory writes go unchecked');
  const memoryRoot = path.join(REPO_ROOT, '.claude/agent-memory');
  const written = fs.readdirSync(memoryRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  assert.deepStrictEqual(written.filter((dir) => !roster.includes(dir)), [], 'no memory directory may sit outside the roster - the directory of a removed agent is deleted with it: a directory no agent name matches is loaded by nobody, so a new name here is a memory write that reaches no dispatch - and it silently drops out of the loop below, which is the vacuity this comparison closes');

  for (const agent of written.filter((dir) => roster.includes(dir))) {
    const dir = path.join(memoryRoot, agent);
    const memories = fs.readdirSync(dir).filter((name) => name.endsWith('.md') && name !== 'MEMORY.md').sort();
    const indexPath = path.join(dir, 'MEMORY.md');
    if (!fs.existsSync(indexPath)) {
      assert.deepStrictEqual(memories, [], `${agent}/ holds memory files with no MEMORY.md beside them - nothing indexes them, so every one of them is a write no dispatch ever reads`);
      continue;
    }
    const index = fs.readFileSync(indexPath, 'utf8');
    const links = [...index.matchAll(/\]\(([^)]+\.md)\)/g)].map((m) => m[1]);
    assert.ok(links.length > 0, `${agent}/MEMORY.md must list at least one memory file`);
    for (const link of links) {
      assert.ok(fs.existsSync(path.join(dir, link)), `${agent}/MEMORY.md links to "${link}" which does not exist`);
    }
    for (const memory of memories) {
      assert.ok(links.includes(memory), `${agent}/${memory} is written but not indexed by its MEMORY.md - only the index is always in context, so an unindexed memory is one the agent never loads and writing it was a no-op`);
    }
  }
});

test('AC-15/sprint-019 AC-10: the Claude view renders each canon maxTurns cap and no Codex view renders one', () => {
  const canonAgents = fs.readdirSync(path.join(REPO_ROOT, '.asd/agents')).filter((file) => file.endsWith('.md')).map((file) => file.slice(0, -3));
  const declared = canonAgents.filter((name) => sync.parseCanonicalFrontmatter(sync.readNormalized(path.join(REPO_ROOT, '.asd/agents', `${name}.md`))).meta.claude.maxTurns !== undefined);
  assert.ok(declared.length > 0, 'sanity: some canon agent must declare claude.maxTurns, or the render checks below pass over nothing');
  for (const name of declared) {
    const cap = sync.parseCanonicalFrontmatter(sync.readNormalized(path.join(REPO_ROOT, '.asd/agents', `${name}.md`))).meta.claude.maxTurns;
    assert.ok(canonText(`.claude/agents/${name}.md`).includes(`\nmaxTurns: ${cap}\n`), `${name}: the Claude view must render the canon cap ${cap}`);
  }
  const codexWithCap = fs.readdirSync(path.join(REPO_ROOT, '.codex/agents')).filter((file) => /max_?turns/i.test(readRepoFile(`.codex/agents/${file}`)));
  assert.deepStrictEqual(codexWithCap, [], 'Codex renders no maxTurns - the Turn budget there is advisory, and a rendered cap would make that false');
});

/** Why `actual` is not an ordered selection of `spec` (`[name, required]`) holding every required entry, or null. */
function specMismatch(actual, spec) {
  let at = 0;
  for (const name of actual) {
    const hit = spec.findIndex(([candidate], index) => index >= at && candidate === name);
    if (hit === -1) return `"${name}" is not allowed here (after "${spec[at - 1] ? spec[at - 1][0] : 'the title'}")`;
    const skipped = spec.slice(at, hit).find(([, required]) => required);
    if (skipped) return `required "${skipped[0]}" is missing or out of order before "${name}"`;
    at = hit + 1;
  }
  const missing = spec.slice(at).find(([, required]) => required);
  return missing ? `required "${missing[0]}" is missing` : null;
}

test('sprint-026 AC-12 (D2/D4/D5): every agent, phase workflow and standalone skill carries exactly its category\'s sections in the category\'s order - optional ones only where the form allows them', () => {
  for (const [category, { files, title, spec }] of Object.entries(FORM_CATEGORIES)) {
    assert.ok(files().length >= 7, `sanity: the ${category} sweep must reach its files (got ${files().length})`);
    for (const rel of files()) {
      const [first, ...rest] = headingsOf(rel);
      assert.ok(first && first[0] === 1 && title.test(first[1]), `${rel}: the ${category} form opens with its level-1 title (got ${JSON.stringify(first)})`);
      assert.deepStrictEqual(rest.filter(([level]) => level === 1), [], `${rel}: one level-1 title only`);
      const mismatch = specMismatch(rest.map(([, name]) => name), spec);
      assert.strictEqual(mismatch, null, `${rel}: ${category} form violated - ${mismatch}`);
    }
  }
});

test('sprint-026 AC-12 (D6/D8, C-4): return lines follow one format, agent-protocol.md lists every signal token and no canon names a retired one, and ADVICE_NEEDED is a creator signal only', () => {
  for (const rel of FORM_CATEGORIES.workflows.files()) {
    const phase = /asd-phase-(.+)\.md$/.exec(rel)[1];
    const line = (/## Return\n\n?```\n([\s\S]*?)\n```/.exec(canonText(rel)) || [])[1];
    assert.ok(line && !line.includes('\n'), `${rel}: "Return" is one fenced line`);
    assert.ok(new RegExp(`^PHASE: ${phase} \\| SPRINT: <NNN-slug> \\| (?:WAVE: <K> \\| )?(?:ITER: <N> \\| )?STATUS: \\S.* \\| NEXT: \\S.*$`).test(line), `${rel}: phase return line is "PHASE: ${phase} | SPRINT: <NNN-slug> | [WAVE: <K> | ][ITER: <N> | ]STATUS: <...> | NEXT: <...>" (got ${line})`);
  }
  for (const rel of FORM_CATEGORIES.skills.files()) {
    const name = rel.split('/')[2];
    const line = (/## Return\n\n?```\n([^\n]*)\n/.exec(canonText(rel)) || [])[1];
    assert.ok(line, `${rel}: "Return" opens with one fenced line`);
    assert.ok(new RegExp(`^SKILL: ${name} \\| .*STATUS: \\S.* \\| NEXT: \\S.*$`).test(line), `${rel}: skill return line is "SKILL: ${name} | [MODE: <m> | ]... STATUS: <...> | NEXT: <...>" (got ${line})`);
  }
  const protocolTokens = [...sectionOf('.asd/rules/agent-protocol.md', 'Signals').matchAll(/^\| `([A-Z_]+)` \|/gm)].map((match) => match[1]);
  assert.deepStrictEqual(protocolTokens, ['COMPLETED', 'QUESTION', 'ADVICE_NEEDED', 'BLOCKED_MANUAL', 'FAILED', 'ABORT', 'REVIEW_DONE'], 'agent-protocol.md "Signals" lists the seven tokens of D8');
  const retired = [...canonMarkdownFiles(), 'README.md', 'AGENTS.md'].filter((rel) => /PLAN_DRAFT|PLAN_READY/.test(canonText(rel)));
  assert.deepStrictEqual(retired, [], 'PLAN_DRAFT and PLAN_READY have no emitter or handler (O3) and must stay out of canon');
  const creators = FORM_CATEGORIES.agents.files().map((rel) => path.basename(rel, '.md')).filter((name) => !/^asd-(reviewer-|external-review|advisor|researcher|scout)/.test(name));
  assert.deepStrictEqual(creators, ['asd-dev', 'asd-tester'], 'sanity: the creators are the two code-and-test agents - every other artifact is the orchestrator\'s');
  for (const rel of FORM_CATEGORIES.agents.files()) {
    const name = path.basename(rel, '.md');
    assert.strictEqual(jsonOf(rel, 'Signals').includes('ADVICE_NEEDED'), creators.includes(name), `${rel}: ADVICE_NEEDED is listed by every creator and by no reviewer or the advisor (C-4)`);
  }
});

test('sprint-035 AC-10: the `suite` scope values "Operation timing" lists are the Scope values the Suite run template names', () => {
  const kindsLine = sectionOf('.asd/rules/sprint-lifecycle.md', 'Operation timing').split('\n').find((line) => line.startsWith('Kinds (attrs):')) || '';
  const listed = /`suite` \(`scope`: ([^)]+)\)/.exec(kindsLine);
  assert.ok(listed, 'sanity: "Operation timing" keeps its `suite` (`scope`: …) entry');
  const templateScope = /^- Scope: \{\{([^}]+)\}\}/m.exec(canonText('.asd/templates/t_test-plan.md'));
  assert.ok(templateScope, 'sanity: the Suite run template keeps its Scope line');
  const values = (text) => text.split('|').map((value) => value.replace(/[`\\\s]/g, '')).sort();
  assert.deepStrictEqual(values(listed[1]), values(templateScope[1]), 'the scope values of a suite op must equal the Suite run Scope values');
});

test('Sprint 038 AC-7/AC-22: runner records valid red area results and leaves interrupted rows pending', () => {
  const rules = sectionOf('.asd/agents/asd-tester.md', 'Rules');
  const area = rules.split('\n').find((line) => line.includes('`area-run` runner:')) || '';
  assert.match(area, /captured runner exit.*exit code.*first failure.*mark it `done`.*commit/);
  assert.match(area, /Otherwise leave the row pending.*report a valid red result/);
  assert.match(rules, /`runner` variant.*reports pass\/fail with the runner's first failure lines/);
  const template = canonText('.asd/templates/t_test-plan.md');
  assert.match(template, /Keep this section as first-entry history/);
  assert.match(template, /exit code, counts and first failure line if red/);
});

test('sprint-036 AC-12: every agent granted the commit command writes its dispatch-scoped commit-msg file under its write list, and its deny of writes elsewhere in .asd/ excepts that file', () => {
  const committers = fs.readdirSync(path.join(REPO_ROOT, '.asd/agents')).map((name) => `.asd/agents/${name}`).filter((rel) => (jsonOf(rel, 'Tools').run || []).some((item) => item.startsWith('git add/git commit')));
  assert.ok(committers.length > 0, 'AC-12: the roster has agents that commit');
  const gaps = committers.flatMap((rel) => {
    const tools = jsonOf(rel, 'Tools');
    return [
      ...(tools.write.some((item) => item.startsWith('<scratch-dir>/<NNN-slug>-<dispatch id>.commit-msg')) ? [] : [`${rel}: write lacks the dispatch-scoped commit-msg file`]),
      ...(tools.deny.some((item) => item.startsWith('writes elsewhere in .asd/') && item.endsWith('.commit-msg excepted')) ? [] : [`${rel}: the .asd/ write deny does not except it`]),
    ];
  });
  assert.deepStrictEqual(gaps, [], 'AC-12: the one-command commit form obliges these agents to write the message file, so the grant must allow what the form requires');
});
