'use strict';

// content contracts of agent definitions and agent memory

const { assert, fs, path, sync, update, runtime, REPO_ROOT, tests, test, readWorkflowDefinitions, workflowReviewerAgents, readRepoFile, canonText, grantedRefs, sectionOf, jsonOf, jsonText, stepOf, spans, canonMarkdownFiles, REPLACED_REVIEW_MECHANISMS, AGENT_MEMORY_ROOT, assertSweepReachesMemory, rosterMemoryFiles, canonAgents, headingsOf, FORM_CATEGORIES } = require('./lib.js');

test('read-only agents (every workflow reviewer + asd-advisor): no Write/Edit tool on Claude, and the internal reviewers carry a policy line bounding their writes to the return file and own memory (sprint-021 D6)', () => {
  const agentsDir = path.join(REPO_ROOT, '.asd', 'agents');
  const files = fs.readdirSync(agentsDir).filter((f) => f.endsWith('.md'));
  const readOnlyNames = files
    .map((f) => f.slice(0, -3))
    .filter((name) => name === 'asd-external-review' || name === 'asd-advisor' || name.startsWith('asd-reviewer-'));
  assert.deepStrictEqual(readOnlyNames.sort(), [...workflowReviewerAgents(), 'asd-advisor'].sort(), 'the read-only set is every reviewer a workflow definition dispatches plus asd-advisor - a reviewer agent no roster names is dead canon, and a roster key whose agent is missing here escapes the read-only check');
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
    if (!name.startsWith('asd-reviewer-')) continue;
    const tools = jsonOf(`.asd/agents/${name}.md`, 'Tools');
    const bound = (tools.write || []).some((item) => /return file/.test(item)) && (tools.write || []).some((item) => /own memory/.test(item)) && (tools.deny || []).length > 0;
    assert.ok(bound, `${name}: a Codex subagent inherits the parent grant and cannot scope it to a path, so the Tools write list naming the return file and the agent's own memory, with a deny for any other write, is the only bound on its writes (plan.md Risks, D6)`);
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

test('T-3/AC-7: providers.md\'s asd-dev role-scoped-context row cites the review-policy.md over-engineering/structure-cohesion checklists', () => {
  const refs = grantedRefs('asd-dev');
  for (const heading of ['Over-engineering checklist (critical, undroppable)', 'Structure / cohesion checklist (critical, undroppable)']) assert.ok(refs.includes(`.asd/rules/review-policy.md#${heading}`), `providers.md must grant asd-dev review-policy.md "${heading}" in its role-scoped-context rows`);
});

/** Every memory file of every reviewer agent a workflow definition dispatches (External Review included), with the agent's canonical frontmatter meta. */
function reviewerMemoryFiles() {
  return workflowReviewerAgents().flatMap((agent) => {
    const dir = path.join(REPO_ROOT, AGENT_MEMORY_ROOT, agent);
    const { meta } = sync.parseCanonicalFrontmatter(sync.readNormalized(path.join(REPO_ROOT, '.asd/agents', `${agent}.md`)));
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((name) => name.endsWith('.md')) : [];
    return files.map((name) => ({ agent, rel: `${AGENT_MEMORY_ROOT}/${agent}/${name}`, meta, text: fs.readFileSync(path.join(dir, name), 'utf8') }));
  });
}

test('T-2: a reviewer memory that enumerates tools never disagrees with its agent frontmatter, and no reviewer frontmatter grants Edit - guards the stale-grant regression (D-2) that once claimed a Write tool a reviewer does not have', () => {
  const memories = reviewerMemoryFiles();
  assert.ok(new Set(memories.map((memory) => memory.agent)).size >= 2, 'sanity: the sweep must reach more than one reviewer memory directory, or the enumeration check below passes over nothing');
  const toolToken = '(?:Read|Glob|Grep|Write|Edit|Bash|AskUserQuestion|WebFetch|WebSearch|NotebookEdit|TodoWrite|Task)';
  const enumerationPattern = new RegExp(`\\b${toolToken}\\b(?:\\s*[/,]\\s*\\b${toolToken}\\b)+`, 'gi');
  for (const { agent, rel, meta, text } of memories) {
    assert.ok(!meta.claude.tools.includes('Edit') && !meta.claude.tools.includes('Write'), `${agent}: a reviewer has no Edit/Write in its tools - its own memory write comes from memory: project`);
    const granted = [...meta.claude.tools, ...(meta.claude.memory === 'project' ? ['Write'] : [])].map((tool) => tool.toLowerCase());
    for (const group of text.match(enumerationPattern) || []) {
      for (const name of group.split(/[/,]/).map((part) => part.trim())) {
        assert.ok(granted.includes(name.toLowerCase()), `${rel} re-enumerates tool "${name}" (in "${group}"), which is not in ${agent}'s frontmatter grant [${granted.join(', ')}] - a re-enumerated grant must never disagree with what it cites, in any casing`);
      }
    }
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

test('AC-15/sprint-019 AC-10: providers.md records which emitted agent frontmatter fields are host-verified vs. emitted on trust, and its host-scoped maxTurns claim matches what sync.js renders per host', () => {
  const providers = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/providers.md'), 'utf8');
  const fields = providers.split('\n').find((line) => line.startsWith('Host-honoured, and observable in dispatch')) || '';
  assert.ok(fields, 'providers.md must name the frontmatter fields the host actually verifies/observes at dispatch');
  const trusted = fields.split('Emitted on trust:')[1];
  assert.ok(trusted && trusted.includes('`effort`') && !trusted.includes('maxTurns'), 'sprint-019 AC-10: `effort` stays emitted on trust, but `maxTurns` is host-enforced on Claude - listing it as trusted is the statement this sprint corrected');
  assert.ok(fields.split(/(?<=\.)\s/).some((sentence) => sentence.includes('`maxTurns`') && sentence.includes('Claude') && sentence.includes('Codex')), 'sprint-019 AC-10: the maxTurns claim is host-scoped, so the sentence stating it must name both hosts');

  const canonAgents = fs.readdirSync(path.join(REPO_ROOT, '.asd/agents')).filter((file) => file.endsWith('.md')).map((file) => file.slice(0, -3));
  const declared = canonAgents.filter((name) => sync.parseCanonicalFrontmatter(sync.readNormalized(path.join(REPO_ROOT, '.asd/agents', `${name}.md`))).meta.claude.maxTurns !== undefined);
  assert.ok(declared.length > 0, 'sanity: some canon agent must declare claude.maxTurns, or the render checks below pass over nothing');
  for (const name of declared) {
    const cap = sync.parseCanonicalFrontmatter(sync.readNormalized(path.join(REPO_ROOT, '.asd/agents', `${name}.md`))).meta.claude.maxTurns;
    assert.ok(canonText(`.claude/agents/${name}.md`).includes(`\nmaxTurns: ${cap}\n`), `${name}: providers.md says Claude enforces maxTurns, so the Claude view must render the canon cap ${cap}`);
  }
  const codexWithCap = fs.readdirSync(path.join(REPO_ROOT, '.codex/agents')).filter((file) => /max_?turns/i.test(readRepoFile(`.codex/agents/${file}`)));
  assert.deepStrictEqual(codexWithCap, [], 'providers.md says Codex renders no maxTurns and the Turn budget there is advisory - a rendered cap would make that statement false');
});

test('AC-15/iter-05: providers.md names External Review as the sole Bash carve-out among read-only reviewers, and that claim matches actual frontmatter grants', () => {
  const providers = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/providers.md'), 'utf8');
  assert.ok(providers.includes('Config-enforced for the'), 'providers.md must scope the config-enforced guarantee to the internal reviewers, not all reviewer agents');
  assert.ok(providers.includes('External Review is the carve-out'), 'providers.md must name External Review as the exception, not leave the carve-out unattributed');
  assert.ok(providers.includes('needs `Bash` to invoke the wrapped CLI'), 'providers.md must state why the carve-out needs Bash');
  assert.ok(!providers.includes('Enforced by config, not by a textual instruction repeated in reviewer bodies.'), 'the prior blanket enforcement sentence (true only for the internal reviewers) must not survive verbatim now that External Review is carved out');

  const externalRaw = sync.readNormalized(path.join(REPO_ROOT, '.asd/agents/asd-external-review.md'));
  const { meta: externalMeta, body: externalBody } = sync.parseCanonicalFrontmatter(externalRaw);
  assert.ok(externalMeta.claude.tools.includes('Bash'), 'the agent providers.md names as the carve-out must actually carry the Bash grant the prose claims');

  const writeBan = (jsonOf('.asd/agents/asd-external-review.md', 'Tools').write || []).find((item) => /own memory/.test(item)) || '';
  assert.ok(/own memory/.test(writeBan) && writeBan.includes('Write') && writeBan.includes('memory-fix dispatch') && writeBan.includes("'Autofix vs escalation'"), 'sprint-019 AC-14 (iter-01 answer b): External Review\'s write ban is blanket for the review itself, yet `memory: project` serves it `Write` for its own memory - the same bullet must name that one exception and route a finding in that memory through the memory-fix dispatch, pointed at its home, as the other reviewers are routed');
  assert.strictEqual(externalMeta.claude.memory, 'project', 'the bullet cites `memory: project` as what loads this agent\'s memory; if the frontmatter stops granting it, the body points at a channel that does not exist - the config-side twin of a dangling citation');

  for (const name of workflowReviewerAgents().filter((agent) => agent !== 'asd-external-review')) {
    const raw = sync.readNormalized(path.join(REPO_ROOT, '.asd/agents', `${name}.md`));
    const { meta } = sync.parseCanonicalFrontmatter(raw);
    assert.ok(!meta.claude.tools.includes('Bash'), `${name}: providers.md claims the internal reviewers are config-enforced with no Bash - ${name} must not carry it`);
  }
});

test('T-2/iter-05: no reviewer memory restates the unqualified "reviewers are read-only on both providers" claim providers.md corrected, nor re-enumerates a Write/Edit/Bash tool list that can silently drift from the cited frontmatter', () => {
  const memories = reviewerMemoryFiles();
  assert.ok(memories.length > 0, 'sanity: the sweep must reach reviewer memory files');
  for (const { rel, text } of memories) {
    assert.ok(!text.includes('reviewers are read-only on both providers'), `${rel} must not restate the unqualified universal claim providers.md corrected`);
    assert.ok(!/\b(Write|Edit|Bash)\b(\s*[/,]\s*`?\b(Write|Edit|Bash)\b){1,}/.test(text), `${rel} must not re-enumerate a tool-name list that can silently drift from the cited frontmatter`);
  }
});

test('AC-1/AC-2: git-strategy.md "Commit before review" is the sole home of the staging prohibition, asd-dev.md carries the git grant that makes it followable, and asd-phase-impl.md states the shared worktree while citing the rule', () => {
  const gitStrategy = readRepoFile('.asd/rules/git-strategy.md');
  assert.ok(gitStrategy.includes('stages only the paths it authored'), 'git-strategy.md must state the staging half of commit ownership (F-1)');
  assert.ok(gitStrategy.includes('commits every path it authored before signalling completion'), 'git-strategy.md must state the ownerless-file half of commit ownership (F-3) - the two halves are one sentence precisely so neither can be dropped alone');

  const prohibition = 'git add -A';
  assert.ok(gitStrategy.includes(prohibition), 'git-strategy.md must carry the broad-stage prohibition itself');
  for (const rel of canonMarkdownFiles()) {
    if (rel === '.asd/rules/git-strategy.md') continue;
    assert.ok(!readRepoFile(rel).includes(prohibition), `${rel} must not restate the broad-stage prohibition - git-strategy.md "Commit before review" is its sole home and every other site cites it`);
  }

  const devTools = jsonOf('.asd/agents/asd-dev.md', 'Tools');
  assert.ok(devTools.run.some((item) => item.includes('git add/git commit of its own work')), 'asd-dev.md must grant the commands the new rule obliges it to run, or the rule is unfollowable by the agent it governs');
  assert.ok(devTools.deny.includes('push') && devTools.deny.some((item) => item.startsWith('--no-verify')), 'the grant must carry the same bounds asd-tester.md already states');
  assert.ok(devTools.run.some((item) => item.includes('git-strategy.md')), 'the grant must cite the rule rather than restate its ownership contract');

  const workflow = sectionOf('.asd/workflows/asd-phase-impl.md', 'Rules');
  assert.ok(workflow.includes('concurrently dispatched tasks share one worktree'), 'AC-2: the phase rules must tell a dev why staging discipline matters before a collision teaches it');
  assert.ok(workflow.includes('per `git-strategy.md` "Commit before review"') && !workflow.includes('git add -A'), 'the workflow must cite the rule, not restate it');

  const wholeTreeClause = gitStrategy.split('never a whole-tree command — ')[1];
  assert.ok(wholeTreeClause, 'sprint 010 AC-2: git-strategy.md must name the whole-tree commands as a class, since the ban now covers forms (`--renormalize`, `stash`) that no path-scoped equivalent replaces');
  const wholeTreeCommands = [...wholeTreeClause.split(' — even where')[0].matchAll(/`([^`]+)`/g)].map((match) => match[1]);
  assert.ok(wholeTreeCommands.length >= 4, 'the clause must enumerate the banned commands - an unenumerated "whole-tree command" is not a rule an agent can check its own command against');
  assert.ok(gitStrategy.includes('unconditional for a dispatched agent'), 'AC-2/G-3: the agent-facing half must be unconditional - a dispatched agent cannot observe whether a sibling dispatch is in flight, so a conditional ban would be unfollowable by the role it governs');

  const mirror = readRepoFile('.asd/project/custom-coding-rules.md');
  for (const command of wholeTreeCommands) {
    assert.ok(mirror.includes(command), `custom-coding-rules.md is the one permitted mirror of the staging rule, so it must name every command git-strategy.md bans, \`${command}\` included. Derived from the owner's own clause rather than re-listed here, so extending the ban fails on the un-mirrored side instead of passing on a stale copy`);
  }
  assert.ok(mirror.includes('git-strategy.md'), 'the mirror must hand the full contract back to its owner rather than reading as a second, self-contained rule');
});

test("sprint-010 iter-02: sprint-lifecycle.md's ADVICE_NEEDED step cites the asd-advisor.md section that actually carries the no-log rule, derived from the agent rather than restated", () => {
  const advisor = readRepoFile('.asd/agents/asd-advisor.md');
  assert.ok(/log the consult/.test(sectionOf('.asd/agents/asd-advisor.md', 'Rules')), 'asd-advisor.md "Rules" must carry the no-log rule - the one section the agent form leaves for it');
  assert.ok(!/^## (Do's|Don'ts)/m.test(advisor), "asd-advisor.md must not regrow the Do's/Don'ts split: the protocol step cites the agent file, and two instruction sections leave the rule without one correct target");

  const step = readRepoFile('.asd/rules/agent-protocol.md').split('\n').find((line) => line.includes('No halt, no user contact, no logged trail'));
  assert.ok(step, 'agent-protocol.md "Relay" must keep the ADVICE_NEEDED round-trip\'s no-log step - it is the only place the protocol states that the consult leaves no artefact');
  assert.ok(step.includes('`asd-advisor.md`') && !/asd-advisor\.md`? (Do's|Don'ts)/.test(step), 'the step must cite the advisor file, not a section the agent form no longer has: an agent that follows a citation into a section holding nothing of the kind proceeds unguided while the sprint reads as documented');
});

test('sprint-017 AC-5/AC-7 (COR-4): no agent memory a dispatched agent loads names a review mechanism review waves replaced as live - only right after a negation in the same clause, or on a line naming it legacy', () => {
  const memoryRoot = AGENT_MEMORY_ROOT;
  const files = rosterMemoryFiles();
  assert.ok(files.some((rel) => rel.startsWith(`${memoryRoot}/asd-reviewer-`)) && files.some((rel) => rel.startsWith(`${memoryRoot}/asd-external-review/`)), 'sanity: the sweep must reach the reviewer and External Review memories COR-4 found stale');
  const negated = (line, at) => /\b(?:no|never|not|without|removed|retired|superseded)\b/i.test(line.slice(Math.max(0, at - 40), at).split(/[.;]\s|—/).pop());
  const leftovers = files.flatMap((rel) => canonText(rel).split('\n').flatMap((line, index) => (/\blegacy\b/i.test(line) ? [] : REPLACED_REVIEW_MECHANISMS.flatMap((needle) => [...line.matchAll(new RegExp(needle.source, `${needle.flags}g`))].filter((match) => !negated(line, match.index)).map((match) => `${rel}:${index + 1} ${match[0]}`)))));
  assert.deepStrictEqual(leftovers, [], 'COR-4/AC-7: agent memory is loaded on every dispatch, so a line describing a removed split, part or External batch as current contract reloads a false contract that "Scope hand-off" and the wave state contradict. A memory may name one only as absent ("no .part-N") or legacy; its owner rewrites or deletes the rest');
});

test('sprint-019 AC-11/AC-12/AC-13/AC-15/AC-16: each review-fix, rotation and tester-lifecycle rule keeps its single home and every acting site points at it', () => {
  const consumerSearch = sectionOf('.asd/rules/review-policy.md', 'Autofix vs escalation').split('\n').find((line) => line.startsWith('**Consumer search.**')) || '';
  assert.ok(/every consumer/.test(consumerSearch) && /same commit/.test(consumerSearch) && /completion signal/.test(consumerSearch), 'AC-11: the consumer search must name its three duties - find every consumer, update them in the same commit, list them in the completion signal');
  const dispatch = sectionOf('.asd/workflows/asd-phase-impl.md', 'Rules').split('\n');
  assert.ok(dispatch.some((line) => line.includes('consumer search') && line.includes('"Autofix vs escalation"')) && dispatch.some((line) => line.includes('COMPLETED') && line.includes('consumers')), 'AC-11: impl "Rules" hand the consumer search to the review-fix dev and ask for the updated consumers in its COMPLETED report');

  const rotation = sectionOf('.asd/rules/artifact-layout.md', 'Decisions log').split('\n').find((line) => line.startsWith('**Rotation**')) || '';
  const cycle = /\{([^}]+)\}/.exec(rotation);
  for (const { name, phases: chain } of readWorkflowDefinitions()) {
    assert.deepStrictEqual(cycle && [...cycle[1].matchAll(/`([a-z-]+)`/g)].map((match) => match[1]), chain.slice(chain.indexOf('impl'), chain.indexOf('impl-review') + 1), `AC-12: the no-rotation cycle must be exactly the impl..impl-review span of ${name}.json - a phase missing rotates mid-cycle, one extra keeps the log growing across the cycle exit`);
  }
  assert.deepStrictEqual(canonMarkdownFiles().filter((rel) => canonText(rel).includes('newest `decisions-log.NNN.md`')), [], 'AC-12: a within-cycle reader (the stalemate answer) reads the live file now that the cycle never rotates');
  const anchor = sectionOf('.asd/rules/sprint-lifecycle.md', 'State recovery').split(/(?<=\.)\s/).find((sentence) => sentence.startsWith('Anchor:')) || '';
  assert.ok(/\blatest\b/.test(anchor) && anchor.includes('routing line'), 'AC-12: with no rotation inside the cycle the live log holds every routing line of the cycle, so the failed-dispatch anchor must be the latest one naming the ids');

  const implTest = canonText('.asd/workflows/asd-phase-impl-test.md');
  const owner = implTest.split('\n').find((line) => line.startsWith('Owner:')) || '';
  const stepsIntro = sectionOf('.asd/workflows/asd-phase-impl-test.md', 'Steps').split('\n').find((line) => /^Autonomous:/.test(line)) || '';
  assert.ok(/\bone fresh `asd-tester` per entry\b/.test(owner) && /never resumed/.test(stepsIntro) && /only hand-off/.test(stepsIntro), 'AC-13: the impl-test owner line and Steps preamble are the home of the fresh-tester lifecycle (the Impl-test phase section moved there, D9) - fresh per entry, never resumed, test-plan.md the only hand-off');
  for (const rel of ['.asd/workflows/asd-phase-impl-review.md', '.asd/agents/asd-tester.md']) {
    assert.ok(canonText(rel).split('\n').some((line) => /\bfresh\b/.test(line) && /never resumed/.test(line)), `AC-13: ${rel} dispatches or is the tester, so it must state the fresh, never-resumed instance`);
  }
  assert.ok(canonText('.asd/agents/asd-tester.md').includes('`asd-phase-impl-test.md`'), 'AC-13: asd-tester.md must point the fresh-instance line at the impl-test workflow that now owns the lifecycle');

  const templateHeadings = canonText('.asd/templates/t_test-plan.md').split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3));
  const grant = sectionOf('.asd/rules/artifact-layout.md', 'Test plan').split(/(?<=\.)\s/).find((sentence) => sentence.includes('review-fix tester')) || '';
  const granted = [...grant.matchAll(/`([^`]+)`/g)].map((match) => match[1]).filter((token) => !token.endsWith('.md'));
  assert.deepStrictEqual(granted, ['Risk → check decisions', 'Added tests', 'Suite run'], 'AC-15, sprint-034 AC-11: a review-fix tester amends only the risk and added-test rows, plus Suite run for a check a finding requires');
  assert.ok(granted.every((name) => templateHeadings.includes(name)) && templateHeadings.includes('Entry log'), 'AC-15: the granted rows must be t_test-plan.md sections, or the grant names tables no plan has');
  for (const rel of ['.asd/workflows/asd-phase-impl.md', '.asd/agents/asd-tester.md']) {
    assert.ok(canonText(rel).split('\n').some((line) => /review-fix|tester chain/.test(line) && line.includes('`artifact-layout.md` "Test plan"')), `AC-15: ${rel} must bound the review-fix tester by pointing at the "Test plan" grant`);
  }
  assert.ok(canonText('.asd/agents/asd-tester.md').split('\n').some((line) => /in-place/.test(line) && line.includes('`artifact-layout.md` "Test plan"')) && sectionOf('.asd/rules/artifact-layout.md', 'Test plan').split(/(?<=\.)\s/).some((sentence) => /in-place tester/.test(sentence) && sentence.includes('`review-policy.md` "Minor test-only findings"')), 'documentation.md F-2 (wave-1/iter-01): asd-tester.md bounds its in-place test fix by the "Test plan" grant alone, so that grant must state the in-place tester\'s reach, citing the route it serves');
  assert.ok(sectionOf('.asd/rules/artifact-layout.md', 'Test plan').split(/(?<=\.)\s/).some((sentence) => sentence.includes('`Removed tests`') && /\bnever\b/.test(sentence) && /\bdelet/.test(sentence) && /\bnext\b/.test(sentence) && sentence.includes('`impl-test`')), 'sprint-019 COR-4: the review-fix tester may not touch Removed tests, the home of why a test went, so the grant must say it never deletes a test and that the next impl-test entry removes it and records the reason there');
  assert.ok(canonText('.asd/agents/asd-tester.md').split('\n').some((line) => /^In review-fix\b/.test(line) && /\bdelet/.test(line) && /\bno test\b|\bnever\b/.test(line)), 'sprint-019 COR-4: the tester body bounds its review-fix pass, so it must say that pass deletes no test');
  const testPlanRotation = sectionOf('.asd/rules/artifact-layout.md', 'Test plan').split('\n').find((line) => line.startsWith('**Rotation**')) || '';
  assert.ok(testPlanRotation.split(/(?<=\.)\s/).some((sentence) => /\bmoves\b/.test(sentence) && /review-fix/.test(sentence) && sentence.includes('`test-plan.entry-NN.md`')), 'sprint-019 DOC-2-1: review-fix tester rows have no Entry log row of their own, so Rotation must name the segment they move into');
  const reEntry = stepOf(sectionOf('.asd/workflows/asd-phase-impl-test.md', 'Steps'), 4).split('\n').find((line) => line.includes('**re-entry**')) || '';
  const beforeRotation = reEntry.split('`test-plan.entry-NN.md`')[0];
  assert.ok(/review-fix/.test(beforeRotation) && beforeRotation.includes('`Removed tests`') && /\bstep 5\b/.test(reEntry),'sprint-019 DOC-2-1: impl-test step 4 rotates the live tables empty before step 5 reads removals, so a review-fix removal row must reach live Removed tests first, for step 5 to collect - rotated first, the removal is never performed');
  const testerDescription = sync.parseCanonicalFrontmatter(sync.readNormalized(path.join(REPO_ROOT, '.asd/agents/asd-tester.md'))).meta.description;
  assert.ok(testerDescription.split(/[.,]\s/).some((clause) => /review-fix/.test(clause) && /test files/.test(clause)) && stepOf(canonText('.asd/workflows/asd-phase-impl.md'), 3).includes('findings in test files route to `asd-tester`'), "sprint-019 DOC-5: impl step 3 dispatches the tester in review-fix for findings located in test files, so the tester's description must name that purpose in its review-fix clause - the row limit only bounds what it touches");

  const leftover = sectionOf('.asd/rules/artifact-layout.md', 'Agent memory').split('\n').find((line) => line.startsWith('**Leftover-term check**')) || '';
  assert.ok(leftover.includes('`.claude/agent-memory/**`') && /\bfirst\b/.test(leftover) && leftover.includes('`impl-test`') && /no longer existing agents/.test(leftover), 'AC-16: the leftover-term check covers all agent memory, orphan directories included, at the first impl-test entry');
  assert.ok(!/\bfrom (?:its|the) first\b/.test(leftover), 'sprint-019 DOC-3: both acting sites run the check at entry 1 only, so the home must not say it runs from the first entry on');
  for (const rel of ['.asd/workflows/asd-phase-impl-test.md', '.asd/agents/asd-tester.md']) {
    const acting = canonText(rel).split('\n').filter((line) => /leftover-term check/.test(line) && line.includes('`artifact-layout.md` "Agent memory"'));
    assert.ok(acting.length > 0, `AC-16: ${rel} runs the check on entry 1, so it must point at its home`);
    assert.ok(acting.every((line) => !line.includes('`.claude/agent-memory/**`')), `sprint-019 DOC-3: ${rel} must cite the whole check, not restate a scope - a restated agent-memory-only scope left the canon and README half with no one acting on it`);
  }
});

test('sprint-019 AC-14/AC-16: review-policy.md "Autofix vs escalation" routes a memory finding to its owner through the in-phase memory-fix dispatch (sprint-027 D1), and no canon, README or agent-memory file - orphan agent directories included - still claims the host serves a reviewer no memory write tool', () => {
  const memoryFix = sectionOf('.asd/rules/review-policy.md', 'Autofix vs escalation').split('\n').find((line) => line.startsWith('**Memory-fix dispatch**')) || '';
  const clauses = memoryFix.split(/(?<=[.;])\s/);
  assert.ok(clauses.some((clause) => clause.includes('`.claude/agent-memory/<owner>/`') && clause.includes('`<owner>`')), 'AC-14: a memory finding routes to the memory\'s owner');
  assert.ok(clauses.some((clause) => /non-owner/.test(clause) && /\bnever\b/.test(clause)), 'AC-14: a non-owner never authors memory text');
  assert.ok(clauses.some((clause) => /own write tool/.test(clause) && clause.includes('`providers.md`')), 'AC-14 (iter-01 answer b) / DOC-2-3: the owner fixes the file with its own write tool, pointed at providers.md for the host grant - without that clause a reviewer owner reads the MEMORY-FIX fallback as its route');
  assert.ok(!memoryFix.includes('`memory: project`'), 'sprint-019 DOC-2-3: the host grant lives in providers.md alone - restated here it widened to "every owner" with no home, and a copy is another place for a stale host claim to survive');
  assert.ok(memoryFix.split(/(?<=\.)\s(?=[A-Z])/).some((clause) => clause.includes('`MEMORY-FIX <path>`') && /no verdict token/.test(clause) && /withh[oe]ld/.test(clause) && clause.includes('`disallowedTools`')), 'AC-14 / DOC-2-2: the MEMORY-FIX fallback is conditioned on an owner whose definition withholds a write tool (e.g. `Write` in its `disallowedTools`), and it returns no verdict token - a token would be parsed as a review; "no write tool at all" named a case `memory: project` never produces');
  assert.ok(clauses.some((clause) => /never through a test-fix `D-N`/.test(clause) && /review-fix route/.test(clause)), 'sprint-027 D1: a memory finding is fixed inside the phase that found it, never through a test-fix `D-N` or a review-fix route - the superseded rule parked it on a `D-N` row the owner cannot write');
  assert.ok(clauses.some((clause) => /\bverbatim\b/.test(clause)) && clauses.some((clause) => /\bcommits\b/.test(clause)) && /decisions-log/.test(memoryFix), 'AC-14: the orchestrator applies that text verbatim, commits it and records it in the decisions log');
  assert.ok(clauses.some((clause) => clause.includes('`resolved: <finding id, …> — memory-fix, <YYYY-MM-DD>`')), 'sprint-027 D1: an in-phase memory fix closes its findings with the resolved: line the review-fix collector skips, or the next round dispatches it again');
  assert.ok(clauses.some((clause) => /\bowner\b/.test(clause) && /\ball\b/.test(clause) && /\bfindings\b/.test(clause)), 'sprint-019 external #1: each distinct owner gets one memory-fix dispatch carrying all its findings - unstated, a round with several owners has no rule for how many dispatches it makes');
  assert.ok(clauses.some((clause) => /one at a time/.test(clause)), 'sprint-019 external #1: memory-fix dispatches run one at a time, so no two owners write concurrently');
  assert.ok(clauses.some((clause) => /\blowest\b/.test(clause) && /\bfinding id\b/.test(clause) && !/\bD-N\b/.test(clause)), "sprint-027 D1: the owners' dispatches are ordered by each owner's lowest finding id - without an order key the sequence is the orchestrator's guess, and a D-N id no longer exists to order by");
  const ownerless = memoryFix.split(/(?<=\.)\s/).find((sentence) => /no longer exists?/.test(sentence)) || '';
  assert.ok(/no owner/.test(ownerless) && /\bdeletes\b/.test(ownerless) && /\bcommits\b/.test(ownerless) && /decisions-log/.test(ownerless) && /no memory text/.test(ownerless), 'sprint-019 COR-3: a finding in the memory directory of an agent that no longer exists has no owner to dispatch - the orchestrator deletes the stale file or directory, commits the deletion and logs one line, authoring no memory text; unstated, the leftover-term check finds an orphan hit and the round stalls');
  const impl = canonText('.asd/workflows/asd-phase-impl.md');
  for (const mode of ['review-fix', 'test-fix']) {
    const modeLine = stepOf(impl, 3).split('\n').find((line) => line.includes(`**${mode}**`)) || '';
    assert.ok(modeLine && !modeLine.includes('agent-memory'), `sprint-027 D1: impl ${mode} routes no memory finding - a memory finding is fixed in the phase that found it, so the fix round carries no memory-fix branch`);
  }
  assert.ok(!/memory-fix/i.test(stepOf(impl, 5)), 'sprint-027 D1: impl step 5 runs no memory-fix dispatch - the fix chain holds only dev and tester fixes');
  assert.ok(!sectionOf('.asd/rules/artifact-layout.md', 'Test plan').split(/(?<=\.)\s/).some((sentence) => sentence.includes('`Status`') && /\bmemory\b/.test(sentence)), 'sprint-027 D1: "Test plan" names no orchestrator-set Status for a memory D-N - a memory hit never becomes a Defects row');

  const memoryFiles = fs.readdirSync(path.join(REPO_ROOT, '.claude/agent-memory'), { recursive: true }).map((entry) => `.claude/agent-memory/${String(entry).split(path.sep).join('/')}`).filter((rel) => rel.endsWith('.md'));
  assertSweepReachesMemory(memoryFiles);
  const claim = /\b(?:serves|gives) (?:a reviewer|it|this agent) no write tool|only loads (?:it|its memory)/i;
  const leftovers = [...canonMarkdownFiles(), 'README.md', 'AGENTS.md', ...memoryFiles].flatMap((rel) => canonText(rel).split('\n').flatMap((line, index) => (claim.test(line.replace(/`[^`]*`/g, '')) ? [`${rel}:${index + 1}`] : [])));
  assert.deepStrictEqual(leftovers, [], `AC-14/AC-16 (iter-01 answer b): on Claude \`memory: project\` serves a reviewer Write, so a line saying the host serves it no write tool, or that \`memory: project\` only loads its memory, restates the claim iter-01 refuted - its owner rewrites it through the memory-fix dispatch; an orphan directory's file is deleted. If you ever exempt a file here, name its finding id in this message and delete the exemption once the fix lands. Found: ${leftovers.join(', ')}`);
});

test('sprint-020 AC-3: every agent reading acceptance criteria from docs/product/requirements/ cites sprint-lifecycle.md "Workflows" on that input - under lite the promoted requirements are last sprint\'s until design-promote, so the AC source is always sprint.md', () => {
  const inputRow = sectionOf('.asd/rules/sprint-lifecycle.md', 'Optional documents').split('\n').find((line) => line.startsWith('| `requirements`')) || '';
  assert.ok(/always under `lite` \("Workflows"\)/.test(inputRow) && inputRow.includes('`sprint.md`'), 'sprint-lifecycle.md "Input sources" must resolve `requirements` to sprint.md under lite and cite "Workflows" - the one place the lite AC source is stated');
  const agentFiles = fs.readdirSync(path.join(REPO_ROOT, '.asd/agents')).filter((file) => file.endsWith('.md'));
  const keyReaders = agentFiles.filter((file) => sectionOf(`.asd/agents/${file}`, 'Inputs').includes('payload.inputs.requirements'));
  assert.ok(keyReaders.length >= 4, 'sanity: the agents checking work against AC-N must read the payload.inputs.requirements key, or the check below compares nothing');
  const direct = agentFiles.flatMap((file) => jsonText(sectionOf(`.asd/agents/${file}`, 'Inputs')).filter((item) => item.includes('docs/product/requirements/')).map((item) => [file, item]));
  const uncited = direct.filter(([, item]) => !item.includes("sprint-lifecycle.md 'Workflows'") && !item.includes("'Input sources'")).map(([file]) => file);
  assert.deepStrictEqual(uncited, [], `sprint-lifecycle.md "Workflows" makes sprint.md the lite AC source, so an Inputs item reading ACs straight from docs/product/requirements/ must cite it - an agent without the clause checks a lite sprint against the previous sprint's requirements; agents take the AC-N through payload.inputs.requirements instead. Uncited: ${uncited.join(', ')}`);
});

test('sprint-020 AC-8: review-policy.md "Minor test-only findings" states its whole trigger and fix once, every resolved: kind canon writes is one "State recovery" admits, and each acting site cites the home', () => {
  const home = sectionOf('.asd/rules/review-policy.md', 'Autofix vs escalation').split('\n### Minor test-only findings')[1];
  assert.ok(home, 'review-policy.md "Autofix vs escalation" must hold the "### Minor test-only findings" subsection - the one home of AC-8');
  const sentences = home.split('\n### ')[0].split(/(?<=\.)\s+/);
  const trigger = sentences.find((sentence) => /\bFires when\b/.test(sentence)) || '';
  for (const [property, token] of [['no FAIL verdict', '`FAIL`'], ['low or medium severity only', '`low` or `medium`'], ['test files by the runtime classifier', '`isTest`'], ['test-plan.md and its segments', '`test-plan.md`'], ["External Review's findings included", 'External Review'], ['read from the persisted findings JSON', 'findings JSON']]) {
    assert.ok(trigger.includes(token), `AC-8: the trigger sentence must state its condition "${property}" (${token}) - each clause dropped widens the route to findings a tester alone must not fix`);
  }
  assert.ok(sentences.some((sentence) => /no parseable path/.test(sentence) && /does not qualify/.test(sentence)), 'AC-8: an unparseable location must fall to review-fix, never to the tester');
  assert.ok(sentences.some((sentence) => /^Otherwise\b/.test(sentence) && /review-fix/.test(sentence)), 'AC-8: a wave that does not qualify routes to review-fix as before');
  assert.ok(sentences.some((sentence) => sentence.includes('`asd-tester`') && sentence.includes('`ASD-Task: <finding id>`')), 'AC-8: the tester fixes in place and commits with the finding-id trailer, so a reconstruction can tell which finding landed');
  assert.ok(sentences.some((sentence) => /not re-reviewed/.test(sentence) && /full suite/.test(sentence)), 'AC-8: an unreviewed fix is caught only by the terminal full suite, and the home must say so');

  const recovery = sectionOf('.asd/rules/sprint-lifecycle.md', 'State recovery').split('\n').find((line) => line.startsWith('**User-resolved findings**')) || '';
  const kinds = (/`resolved: [^`]*? — <([^>]+)>, <YYYY-MM-DD>`/.exec(recovery) || [])[1];
  assert.ok(trigger.includes('no `FAIL` verdict short of satisfied') && trigger.includes('"User-resolved findings"'), 'AC-8 (mixed findings): a FAIL whose findings are all resolved is satisfied, so the trigger must not exclude it by verdict alone - a resolved FAIL beside test-only low findings would otherwise never reach the tester');
  assert.ok(/\bFAIL\b[^.]*\bsatisfied\b/.test(recovery), 'AC-8 (mixed findings): User-resolved findings declares a fully resolved FAIL satisfied');
  assert.ok(kinds && kinds.split('|').map((kind) => kind.trim()).includes('test-fix'), 'sprint-lifecycle.md "State recovery" "User-resolved findings" must admit the test-fix kind, or a verdict whose findings the tester fixed never counts as satisfied');
  const admitted = kinds.split('|').map((kind) => kind.trim());
  const written = canonMarkdownFiles().flatMap((rel) => [...canonText(rel).matchAll(/`resolved: [^`]*? — ([a-z-]+), <YYYY-MM-DD>`/g)].map((match) => `${rel}: ${match[1]}`));
  assert.ok(written.some((entry) => entry.endsWith(': test-fix')), 'sanity: the resolved: line sweep must reach the test-fix writers');
  assert.deepStrictEqual(written.filter((entry) => !admitted.includes(entry.slice(entry.lastIndexOf(': ') + 2))), [], 'every resolved: kind canon tells the orchestrator to write must be one "User-resolved findings" admits - any other leaves the verdict blocking with its findings fixed');

  const citation = '`review-policy.md` "Minor test-only findings"';
  const acting = stepOf(sectionOf('.asd/workflows/asd-phase-impl-review.md', 'Steps'), 8).split('\n').find((line) => line.includes(citation)) || '';
  assert.ok(acting.includes('`asd-tester`') && /test-fix/.test(acting), 'asd-phase-impl-review.md step 8 is where the route fires, so it must cite the home, dispatch asd-tester and write the test-fix resolution');
  for (const rel of ['.asd/rules/git-strategy.md', '.asd/agents/asd-tester.md', '.asd/rules/sprint-lifecycle.md']) {
    assert.ok(canonText(rel).includes(citation), `${rel} acts on the in-place tester fix (commit trailer, tester contract, the cycle's review-fix exception), so it must cite the home rather than restate it`);
  }
});

test('sprint-020 AC-1: no canon, README, AGENTS.md or agent-memory line still names a mechanism the workflow definitions replaced - the PHASE_CHAIN literal or the rollback-reset table', () => {
  const memoryFiles = fs.readdirSync(path.join(REPO_ROOT, '.claude/agent-memory'), { recursive: true }).map((entry) => `.claude/agent-memory/${String(entry).split(path.sep).join('/')}`).filter((rel) => rel.endsWith('.md'));
  assert.ok(memoryFiles.length > 0, 'sanity: the sweep must reach agent memory (artifact-layout.md "Agent memory" leftover-term check)');
  const removed = /\bPHASE_CHAIN\b|rollback[- ]reset table/i;
  const hits = [...canonMarkdownFiles(), 'README.md', 'AGENTS.md', '.asd/hooks/session-start.js', '.asd/runtime.js', ...memoryFiles].flatMap((rel) => canonText(rel).split('\n').flatMap((line, index) => (removed.test(line) ? [`${rel}:${index + 1}`] : [])));
  assert.deepStrictEqual(hits, [], `sprint 020 moved the chain into .asd/workflows/<name>.json and the reset phases into each definition's rollback_reset, so a line still naming PHASE_CHAIN or the rollback-reset table points a reader at something that no longer exists (CHANGELOG.md and .asd/project/decisions-log.md are history and stay out of the sweep). Found: ${hits.join(', ')}`);
});

test('sprint-021 AC-11: no dev memory, nor README\'s self-hosting answer, has a dev run sync.js --apply - sprint-lifecycle.md "Self-hosting" gives the view sync to the orchestrator, once per wave or fix round, and a dev\'s --apply rewrites the hash ledgers repo-wide under a sibling\'s commits', () => {
  const selfHosting = sectionOf('.asd/rules/sprint-lifecycle.md', 'Self-hosting');
  assert.ok(selfHosting.split(/(?<=\.)\s/).some((sentence) => /\bDev\b/.test(sentence) && /\bnever\b/.test(sentence) && sentence.includes('`sync.js --apply`') && /orchestrator/.test(sentence)), 'sanity: sprint-lifecycle.md "Self-hosting" must still say a dev never runs `sync.js --apply` and the orchestrator does, or the sweep below guards a rule that no longer exists');
  const files = rosterMemoryFiles().filter((rel) => rel.startsWith(`${AGENT_MEMORY_ROOT}/asd-dev`));
  assert.ok(files.some((rel) => rel.startsWith(`${AGENT_MEMORY_ROOT}/asd-dev/`)), 'sanity: the sweep must reach the dispatched dev memory');
  const instructions = files.flatMap((rel) => {
    const paragraph = canonText(rel).split(/\*\*How to apply:?\*\*:?/)[1];
    return paragraph === undefined ? [] : paragraph.split(/\n\s*\n/)[0].split(/(?<=\.)\s/).map((sentence) => ({ rel, sentence }));
  });
  const readmeSelfHosting = canonText('README.md').split('\n').filter((line) => line.includes('`self_hosting: enabled`')).flatMap((line) => line.split(/(?<=\.)\s/).map((sentence) => ({ rel: 'README.md', sentence })));
  const offending = [...instructions, ...readmeSelfHosting].filter(({ sentence }) => sentence.includes('--apply') && !/\b(?:never|not|no)\b|orchestrator/i.test(sentence)).map(({ rel }) => rel);
  assert.deepStrictEqual(offending, [], `a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md): ${offending.join(', ')}`);
});

test('sprint-023 AC-5: the Test-only declaration is defined once in sprint-lifecycle.md "Plan file format", t_plan.md mirrors its shape in a conditional example Task, impl routes such a Task to asd-tester, impl-test recognises its commits by the ASD-Task trailer, and every canon site that says impl writes no tests names the carve-out', () => {
  const declaration = sectionOf('.asd/rules/sprint-lifecycle.md', 'Plan file format').split('\n').find((line) => line.startsWith('**Test-only declaration**')) || '';
  const shape = /`(Test-only: <[^`]+>)`/.exec(declaration);
  assert.ok(shape, 'sprint-lifecycle.md "Plan file format" must define the Test-only declaration as a code-span literal `Test-only: <...>`');
  const label = shape[1].split('<')[0].trim();
  const homes = canonMarkdownFiles().filter((rel) => !rel.startsWith('.asd/templates/') && canonText(rel).includes(shape[1]));
  assert.deepStrictEqual(homes, ['.asd/rules/sprint-lifecycle.md'], 'the declaration shape is defined once - every other site cites "Plan file format" instead of restating it, so a changed shape is one edit');

  const template = canonText('.asd/templates/t_plan.md');
  assert.ok(template.includes(shape[1]), 't_plan.md must mirror the declaration shape in its parser-critical format rules, or plan authors never see the line');
  const linePattern = new RegExp(`^${label}`, 'm');
  const blocks = template.split(/^### Task /m).slice(1);
  const declaring = blocks.filter((block) => linePattern.test(block));
  assert.ok(declaring.length > 0 && blocks.some((block) => !linePattern.test(block)), 't_plan.md must ship an example Task with the line and one without - the line is conditional, and a copy on every block teaches it as mandatory');
  for (const block of declaring) {
    const reachability = block.search(/^Reachability:/m);
    assert.ok(new RegExp(`^(?:Material risk:[^\\n]*\\n)+${label}`, 'm').test(block) && !new RegExp(`^- \\[.\\] ${label}`, 'm').test(block) && (reachability === -1 || block.search(linePattern) < reachability), `the example's ${label} line must sit directly under the Material risk line(s), ahead of any Reachability line, and never be a checkbox - the placement the rule defines`);
  }

  const planFormat = sectionOf('.asd/rules/sprint-lifecycle.md', 'Plan file format');
  const declarationOf = (name) => planFormat.split('\n').find((line) => line.startsWith(`**${name} declaration**`)) || '';
  const placement = (line) => spans(line.slice(0, line.indexOf('):'))).filter((span) => !span.startsWith('### '));
  const connector = (line) => {
    const head = line.slice(0, line.indexOf('`Reachability`'));
    return head.slice(head.lastIndexOf('`') + 1);
  };
  const lineName = label.replace(/:$/, '');
  const order = ['Material risk', lineName, 'Reachability'];
  for (const [site, line] of [['sprint-lifecycle.md "Plan file format"', declaration], ['t_plan.md\'s format rule', template.split('\n').find((candidate) => candidate.includes(shape[1])) || '']]) {
    assert.ok(line.includes('`Reachability`'), `${site} must name the Reachability line the ${lineName} line sits ahead of - both are plain-text lines under the Material risk lines, so a rule that states no order between them lets a plan put either first`);
    assert.ok(!/\b(?:under|below|after|behind|beneath|following)\b/.test(connector(line)), `${site} must put the ${lineName} line ahead of the Reachability line, not behind it - the reverse order contradicts the Reachability and Settings change declarations, which both place their line under ${lineName}`);
  }
  assert.ok(placement(declarationOf('Reachability')).includes(lineName), `the Reachability declaration must name the ${lineName} line it sits under, or the order between the two is stated at one site only`);
  assert.deepStrictEqual(placement(declarationOf('Settings change')).filter((span) => order.includes(span)), order, `the Settings change declaration must list the lines it sits under in the order the plan carries them (${order.join(' < ')}) - a list in another order contradicts the ${lineName} and Reachability declarations`);
  for (const name of ['Reachability', 'Settings change']) {
    const mirror = template.split('\n').find((candidate) => candidate.startsWith('- ') && candidate.includes(`\`${name}:`)) || '';
    assert.ok(mirror, `t_plan.md's parser-critical format rules must carry a rule for the ${name} line - the template is the text a plan author reads`);
    assert.deepStrictEqual(spans(mirror.split(';')[0]).filter((span) => !span.startsWith(`${name}:`)), placement(declarationOf(name)), `t_plan.md's ${name} rule must place the line under the same lines, in the same order, as sprint-lifecycle.md "Plan file format" - "same placement" chains from the rule above it and can order the line ahead of one the home puts before it; the asserts above read only the ${lineName} rule`);
  }

  const flow = sectionOf('.asd/workflows/asd-phase-impl.md', 'Steps');
  assert.ok(stepOf(flow, '5a').includes(`\`${label}\``) && stepOf(flow, '5a').includes('`asd-tester`'), `asd-phase-impl.md step 5a must name the ${label} line and the asd-tester it routes such a Task to - a dev dispatched for a Task whose paths are tests is the case the sprint closes`);
  const dispatchRows = jsonOf('.asd/workflows/asd-phase-impl.md', 'Dispatch');
  const devRow = dispatchRows.find((row) => row.agent === 'asd-dev') || {};
  const testerRow = dispatchRows.find((row) => row.agent === 'asd-tester') || {};
  assert.ok(/Test-only/.test(devRow.when || '') && /Test-only Task/.test(testerRow.when || '') && /delegate/i.test(stepOf(flow, '6')), 'asd-phase-impl.md "Dispatch" must send a Test-only Task to asd-tester and keep it off asd-dev, step 6 delegating per that table');
  const trailer = /`(ASD-Task): <id>`/.exec(sectionOf('.asd/rules/git-strategy.md', 'Commits'));
  assert.ok(trailer, 'sanity: git-strategy.md "Commits" must define the ASD-Task trailer, the key impl-test reads a Test-only Task\'s commits by');
  assert.ok(declaration.includes(`${trailer[1]}: Task N`) && stepOf(sectionOf('.asd/workflows/asd-phase-impl-test.md', 'Steps'), '2').includes(`${trailer[1]}: Task N`), `the declaration and impl-test step 2 must both name the ${trailer[1]}: Task N trailer a Test-only Task's commits carry - a trailer the tester does not write is one entry 1 cannot recognise`);
  const contract = sectionOf('.asd/agents/asd-tester.md', 'Rules').split('\n').find((line) => line.includes(`${lineName} Task`)) || '';
  assert.ok(contract.includes('`plan.md`') && contract.includes('`test-plan.md`') && contract.includes('"Plan file format"'), 'asd-tester.md Rules must carry the Test-only Task bullet: it cites the declaration and leaves plan.md and test-plan.md untouched, the files its wave and impl-test own');
  const stops = jsonOf('.asd/agents/asd-tester.md', 'Escalation');
  assert.ok((stops.find((row) => /\bimpl COMPLETED\b/.test(row.when)) || { when: '' }).when.includes('impl-test'), `asd-tester.md Escalation: the row that aborts on a missing impl COMPLETED signal must name the impl-test dispatch it binds - the tester also runs a ${lineName} Task inside an impl wave, before impl can complete, so an unscoped abort refuses every such dispatch`);
  const testOnlyStop = stops.find((row) => row.when.includes(lineName)) || { when: '', signal: '' };
  assert.ok(testOnlyStop.signal === 'ABORT' && testOnlyStop.when.includes('Plan file format'), `asd-tester.md Escalation must give a ${lineName} Task dispatch its own ABORT row citing the plan rule - scoping the impl-test row alone leaves that dispatch with no stop condition`);

  const noTests = /production code only|writes? \*\*no tests\*\*|no test-authoring|no tests written|never in `impl`/i;
  const sites = [...canonMarkdownFiles(), 'README.md'].filter((rel) => rel !== '.asd/agents/asd-dev.md').flatMap((rel) => canonText(rel).split('\n').filter((line) => noTests.test(line)).map((line) => [rel, line]));
  assert.ok(['.asd/rules/sprint-lifecycle.md', 'README.md'].every((rel) => sites.some(([site]) => site === rel)), 'sanity: the sweep must reach the rule\'s home and README, or every line check below passes over nothing');
  assert.deepStrictEqual(sites.filter(([, line]) => !/test-only/i.test(line)).map(([rel, line]) => `${rel}: ${line.slice(0, 100)}`), [], 'every canon line that says impl writes no tests or the plan has no test-authoring Tasks must name the Test-only carve-out - a site that does not tells a reader a Test-only Task is forbidden (asd-dev.md is the dev\'s own contract and stays unconditional)');
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
  const creators = FORM_CATEGORIES.agents.files().map((rel) => path.basename(rel, '.md')).filter((name) => !/^asd-(reviewer-|external-review|advisor|scout)/.test(name));
  assert.deepStrictEqual(creators, ['asd-dev', 'asd-tester'], 'sanity: the creators are the two code-and-test agents - every other artifact is the orchestrator\'s');
  for (const rel of FORM_CATEGORIES.agents.files()) {
    const name = path.basename(rel, '.md');
    assert.strictEqual(jsonOf(rel, 'Signals').includes('ADVICE_NEEDED'), creators.includes(name), `${rel}: ADVICE_NEEDED is listed by every creator and by no reviewer or the advisor (C-4)`);
  }
});

test('sprint-032 AC-7: asd-external-review takes its severity floor from the payload and keeps the Kept findings table to the template columns, the wrapped CLI id and source inside Description', () => {
  const rules = sectionOf('.asd/agents/asd-external-review.md', 'Rules');
  assert.ok(rules.includes('`payload.floor`'), 'AC-7: the floor comes from the payload, never one of the wrapper\'s own or the CLI\'s');
  assert.ok(rules.includes('Description cell'), 'AC-7: the CLI finding id and source ride inside the Description cell, a sixth column failing the persist-review parse');
});

test('sprint-034 AC-8 (033#A-3): the External Review Claude Code form feeds the prompt from one named scratch file and deletes it, the agent\'s grants and Invocation name that file, and the Codex forms keep their here-string and heredoc and never write to disk', () => {
  const rule = canonText('.asd/rules/external-review.md');
  const agent = canonText('.asd/agents/asd-external-review.md');
  const fileName = '-external-<phase>-<iteration id, "/" as "-">.prompt.md';
  assert.ok(rule.includes(fileName) && agent.includes(fileName), 'AC-8: the rule and the agent must name the same prompt file under the scratch directory');
  assert.ok(rule.includes('`<scratch-dir>`: the directory of `payload.inputs.context`') && agent.includes('`<scratch-dir>`: the directory of `payload.inputs.context`'), 'AC-8: the file sits in the scratch directory of the context bundle, which is git-ignored');
  const invocation = sectionOf('.asd/agents/asd-external-review.md', 'Invocation');
  const form = (prefix) => invocation.split('\n').find((line) => line.startsWith(prefix)) || '';
  const claude = form('- Claude Code host');
  assert.ok(claude.includes('file-write operation') && claude.includes('< <that file>') && claude.includes('then delete the file whatever the run\'s outcome') && !claude.includes("<<'EOF'"), 'AC-8: the Claude Code form writes the prompt with the file-write operation, redirects the file into stdin, deletes it whatever the outcome, and uses no heredoc');
  assert.ok(form('- Codex host on `win32`').includes("@'") && form('- Codex host on `win32`').includes('never written to disk'), 'AC-8: the Codex win32 form stays the here-string, never written to disk');
  assert.ok(form('- Codex host elsewhere').includes("<<'EOF'") && form('- Codex host elsewhere').includes('never written to disk'), 'AC-8: the other Codex form stays the heredoc, never written to disk');
  const tools = jsonOf('.asd/agents/asd-external-review.md', 'Tools');
  assert.ok(tools.write.some((entry) => entry.startsWith('Claude Code: the one prompt file')) && tools.run.some((entry) => entry.includes('deleting the prompt file after the run, pass or fail')), 'AC-8: the agent\'s tool policy grants the one prompt file write and its deletion');
  assert.ok(tools.deny.every((entry) => !/writing the prompt\b/.test(entry)) && tools.deny.some((entry) => entry.includes('writing the scope manifest or the review file')), 'AC-8: the deny list no longer forbids writing the prompt and still forbids the manifest and the review file');
  const meta = sync.parseCanonicalFrontmatter(agent).meta;
  assert.strictEqual(meta.claude.memory, 'project', 'AC-8: the Write the prompt file needs comes from memory: project, since the tool list names no Write');
  assert.ok(!meta.claude.tools.includes('Write') && meta.claude.tools.includes('Bash'), 'sanity: the tool list still reaches the delete through Bash and holds no standalone Write');
});

test('sprint-035 AC-10: the `suite` scope values "Operation timing" lists are the Scope values the Suite run template names, and the tester attr cites that home', () => {
  const kindsLine = sectionOf('.asd/rules/sprint-lifecycle.md', 'Operation timing').split('\n').find((line) => line.startsWith('Kinds (attrs):')) || '';
  const listed = /`suite` \(`scope`: ([^)]+)\)/.exec(kindsLine);
  assert.ok(listed, 'sanity: "Operation timing" keeps its `suite` (`scope`: …) entry');
  const templateScope = /^- Scope: \{\{([^}]+)\}\}/m.exec(canonText('.asd/templates/t_test-plan.md'));
  assert.ok(templateScope, 'sanity: the Suite run template keeps its Scope line');
  const values = (text) => text.split('|').map((value) => value.replace(/[`\\\s]/g, '')).sort();
  assert.deepStrictEqual(values(listed[1]), values(templateScope[1]), 'AC-10: the scope values of a suite op must equal the Suite run Scope values');
  const duty = canonText('.asd/agents/asd-tester.md').split('\n').find((line) => line.startsWith('- must: bracket every suite run')) || '';
  assert.ok(duty.includes('scope=<Suite run Scope>') && duty.includes('"Operation timing"'), 'AC-10: the tester duty must take the scope attr from the Suite run Scope and cite its home');
});

test('sprint-035 AC-7: the tester\'s Evidence routing carries a blocking differential-test row for a behaviour-preserving refactor or migration', () => {
  const row = canonText('.asd/agents/asd-tester.md').split('\n').find((line) => line.startsWith('| Behaviour-preserving refactor or migration |')) || '';
  assert.ok(row.includes('previous version as oracle') && row.includes('each mismatch triaged') && row.endsWith('| BLOCKING |'), 'AC-7: the row names the oracle, the per-mismatch triage and the BLOCKING gate');
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
