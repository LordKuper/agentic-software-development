'use strict';

// content contracts of the rule docs

const { assert, fs, path, execFileSync, sync, update, runtime, REPO_ROOT, tests, test, mkTempDir, writeFile, runtimeCliResult, sandboxGitRepo, readWorkflowDefinitions, workflowReviewerAgents, readRepoFile, internalReviewers, reviewerRubric, canonText, headingBody, grantRows, grantedRefs, sectionOf, jsonOf, subOf, stepOf, spans, canonMarkdownFiles, canonAgents, headingsOf, FORM_CATEGORIES } = require('./lib.js');

test('AC-13a: artifact-layout.md "Agent memory" is the one owner of agent memory\'s review-surface status in both modes, and each site it names cites it instead of keeping a mode-specific restatement', () => {
  const owner = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/artifact-layout.md'), 'utf8');
  const ownerStatement = owner.split('\n').find((line) => line.includes('In the review surface, both modes'));
  assert.ok(ownerStatement, 'artifact-layout.md "Agent memory" must carry the mode-independent statement of the property');
  assert.ok(ownerStatement.includes('never an exclusion in any review scope'), 'the property must be stated of any review scope, not from inside the self-hosting carve-out it used to live in');
  assert.ok(ownerStatement.includes('Sole statement of the property'), 'the owner must claim sole ownership, so a restatement reappearing elsewhere is a visible contract break rather than a silent fifth copy');

  const restatement = /`\.claude\/agent-memory\/\*\*`[^\n]*?not[^\n]*?excluded/i;
  assert.ok(!restatement.test(owner.replace(ownerStatement, '')), 'the owner file itself must not also carry the old exclusion-list restatement. Keyed on the owner-plus-citations shape rather than on a copy count - the count is what the deliberate collapse to one owner turned red. Scope limit: this matches inside ONE line (these rule docs keep a paragraph on a single line), so a restatement split across two paragraphs is out of its reach');
  for (const rel of ['.asd/rules/sprint-lifecycle.md', '.asd/rules/external-review.md', '.asd/templates/external-review/t_prompt-external-impl.md']) {
    const base = path.basename(rel);
    assert.ok(ownerStatement.includes(base), `the owner statement must name ${base} as one of its citing sites - an unnamed citer is how a fifth copy gets written`);
    const content = fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');
    assert.ok(/artifact-layout\.md`? "Agent memory"/.test(content), `${rel} must cite artifact-layout.md "Agent memory" for agent memory's review-surface status`);
    assert.ok(!restatement.test(content), `${rel} must not restate the property - the four mode-specific copies were collapsed into the single owner, and any of them growing back is the drift this shape catches`);
  }
});

test('T-2, sprint-021 AC-11: providers.md "Canonical path -> per-provider path" is the one home of the generated view path shapes - no canon, README or AGENTS.md line restates them - and every site naming the --apply target form cites it; custom-coding-rules.md and AGENTS.md keep only the orchestrator-syncs rule', () => {
  const citation = 'Canonical path -> per-provider path';
  const viewShape = '`.codex/agents/<name>.toml`';
  const holders = [...canonMarkdownFiles(), 'README.md', 'AGENTS.md', '.asd/project/custom-coding-rules.md'].filter((rel) => canonText(rel).includes(viewShape));
  assert.deepStrictEqual(holders, ['.asd/rules/providers.md'], `the generated view path shapes live in providers.md's path table alone - the explanatory parenthetical AGENTS.md used to own is gone since sprint 021 (devs never run --apply), so a restatement anywhere is a second copy. Found in: ${holders.join(', ')}`);
  assert.ok(sectionOf('.asd/rules/providers.md', citation).includes(viewShape), `providers.md "${citation}" must hold the path table the sites below cite`);

  const agents = canonText('AGENTS.md');
  assert.ok(agents.includes('node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply <generated-view-path...>') && agents.includes('`sprint-lifecycle.md` "Self-hosting"'), 'AGENTS.md keeps the self-locating --apply command form and cites the rule that says who runs it');
  for (const rel of ['.asd/agents/asd-dev.md', '.asd/workflows/asd-phase-impl.md', 'README.md']) {
    assert.ok(canonText(rel).includes(citation), `${rel} must cite providers.md "${citation}" for the generated view paths instead of restating them`);
  }
  const coding = canonText('.asd/project/custom-coding-rules.md');
  assert.ok(!coding.includes('--apply <generated-view-path...>') && coding.includes('`.asd/rules/sprint-lifecycle.md` "Self-hosting"'), 'custom-coding-rules.md no longer names an --apply target form - a dev never runs it - so it cites the Self-hosting rule for who syncs instead of providers.md for the path shapes');
});

test('T-3/AC-2: providers.md states the never-heredoc file-write rule for artifact content', () => {
  const providers = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/providers.md'), 'utf8');
  assert.ok(providers.includes('never a shell heredoc/here-string'), 'providers.md must state that writing an artifact never goes through a shell heredoc/here-string');
});

test('AC-15/sprint-019 AC-14: review-policy.md is sole SSoT for the reviewer write scope - its own memory directory the one place it writes, a finding there routed through the memory-fix dispatch - and providers.md cites it instead of restating it', () => {
  const policy = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/review-policy.md'), 'utf8');
  assert.ok(policy.includes('Reviewers write no review artifact, code or doc'), 'review-policy.md must state the scoped (non-absolute) claim of what reviewers cannot write');
  const scopeSentences = (policy.split('\n').find((line) => line.includes('Reviewers write no review artifact, code or doc')) || '').split(/(?<=\.)\s/);
  assert.ok(scopeSentences.some((sentence) => /own memory/.test(sentence) && /\bpolicy\b/.test(sentence) && /\bhost\b/.test(sentence) && sentence.includes('`providers.md`') && sentence.includes('memory-fix dispatch') && sentence.includes('"Autofix vs escalation"')), 'sprint-019 AC-14 (iter-01 answer b) / DOC-2-3: the scope statement bounds a reviewer\'s writes to its own memory, says policy rather than the host keeps it there, points at providers.md for the host grant, and routes a finding in that memory through the memory-fix dispatch pointed at its home "Autofix vs escalation"');
  assert.ok(scopeSentences.every((sentence) => !sentence.includes('`memory: project`')), 'sprint-019 DOC-2-3: the host grant (`memory: project` adds Write) lives in providers.md alone - a restatement here is the third copy iter-02 cut, the kind of host claim iter-01 showed goes stale');

  const providers = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/providers.md'), 'utf8');
  assert.ok(providers.split(/(?<=\.)\s/).some((sentence) => sentence.includes('`memory: project`') && sentence.includes('`Write`') && /\breviewer\b/.test(sentence) && sentence.includes('`disallowedTools`')), 'sprint-019 DOC-2-3: providers.md is the one home of the host grant - `memory: project` adds `Write` to every reviewer, none of whose `disallowedTools` names it');
  for (const name of workflowReviewerAgents()) {
    const { meta } = sync.parseCanonicalFrontmatter(sync.readNormalized(path.join(REPO_ROOT, '.asd/agents', `${name}.md`)));
    assert.ok(meta.claude.memory === 'project' && !(meta.claude.disallowedTools || []).includes('Write'), `sprint-019 AC-14: ${name}: providers.md says \`memory: project\` serves every reviewer Write because no reviewer's disallowedTools names it - the frontmatter must keep both halves true, or the prose states a grant the host no longer serves`);
  }

  assert.ok(providers.includes('Gate Verdict Format'), 'providers.md must cite review-policy.md "Gate Verdict Format" for what the read-only claim covers and excludes, rather than restating the reconciliation independently');
  assert.ok(!providers.includes('MEMORY-FIX'), 'providers.md owns tool grants only; the memory-fix return contract lives in review-policy.md "Autofix vs escalation" and a second copy here is the duplication the citation exists to prevent');
  assert.ok(!policy.includes('Sole statement of this claim'), 'the unscoped sole-statement claim was false the moment it was written (iter-03 DOC-1b): both review workflows and a rule doc also state that the reviewer itself performs no write, so an owning-side claim that every other site merely links contradicted them and invited a cut at whichever site was read next. Scope limit: this guards the literal from coming back, never the truth of a reworded ownership claim - over this corpus no derivable proxy separates a true declaration from a false one (test-plan.md, entry 5). The two assertions above are what keep it from going vacuous: they require the scoped statement to still be here');

  const scopeLine = policy.split('\n').find((line) => line.includes('Reviewers write no review artifact, code or doc')) || '';
  assert.ok(/agent memory/i.test(scopeLine) && scopeLine.includes('`artifact-layout.md`'), 'the scoped claim was STILL false after iter-03 (iter-04 EXT-1): a reviewer\'s own hand-authored memory file restated both halves this line claims only it states. A declaration must therefore bound its reach and name the surface it excludes. Asserted here: the line keeps a carve-out for agent memory AND a pointer to the rule that owns that surface - deliberately NOT the "in canon" qualifier the fix happened to word it with, which a synonym defeats and a correct rewording reddens. That the pointer resolves is the citation sweep\'s job; that this declaration still carries one is this assert\'s');
});

test('AC-6: code-style.md §19 names the line-ending editing hazard platform-neutrally and requires the staged pre-commit lint, and this repo\'s own commands.yaml configures that form', () => {
  const style = readRepoFile('.asd/rules/code-style.md');
  assert.ok(/Preserve a file.s existing line endings/.test(style), 'F-7 was a scripted edit that assumed \\n on a CRLF file - the rule must name the hazard where the dev reads it');
  assert.ok(style.includes('Symptom: a whole-file diff for a small edit'), 'the rule must name the observable symptom, or it cannot be acted on mid-edit');
  assert.ok(style.includes('`git diff --cached --check`'), 'the measured blind spot: the bare form exits 0 once the damage is staged');
  assert.ok(/a project.s configured `lint` command must be the staged form/.test(style), 'the rule must bind a project\'s configured lint to the staged form, not merely suggest it');
  assert.ok(!/CRLF on disk|canon is CRLF/i.test(style), 'code-style.md ships to every consumer through managed_paths, so it must not assert this repository\'s own worktree line endings as universal');

  const lintLine = readRepoFile('.asd/project/commands.yaml').split('\n').find((line) => line.startsWith('lint:'));
  assert.ok(lintLine && lintLine.includes('--cached'), 'commands.yaml must configure the staged form the rule requires. `.asd/project/**` is outside every review surface, so this assertion is the only automated check that rule and configured command agree');
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

test('sprint-010 AC-9 (G-12): `core.md` "See also" is the rule-doc index - it lists every other `.asd/rules/*.md` and nothing else - and neither AGENTS.md nor t_AGENTS.md keeps a second copy of that list', () => {
  const ruleDocs = fs.readdirSync(path.join(REPO_ROOT, '.asd/rules'))
    .filter((name) => name.endsWith('.md') && name !== 'core.md')
    .sort();
  const seeAlso = readRepoFile('.asd/rules/core.md').split('## See also')[1];
  assert.ok(seeAlso, 'core.md must keep its "See also" section: every other site now points at it instead of carrying its own list, so its absence leaves the rule-doc set indexed nowhere');
  const indexed = [...seeAlso.matchAll(/^- `([a-z0-9-]+\.md)`/gm)].map((match) => match[1]).sort();
  assert.deepStrictEqual(indexed, ruleDocs, 'G-12: the index must be a bijection with the directory. Checked both ways deliberately - a new rule doc nobody indexed is unreachable for any agent reading the index, and an indexed doc that no longer exists sends a reader to a missing file. This is the mirror class that drifted for whole sprints under a green suite, because only the phase-chain and agent-count mirrors were machine-checked');

  for (const rel of ['AGENTS.md', '.asd/templates/t_AGENTS.md']) {
    const content = readRepoFile(rel);
    const headings = content.split('\n').filter((line) => line.startsWith('### Rule docs'));
    assert.strictEqual(headings.length, 1, `${rel} must carry exactly one "Rule docs" section - two would put this check on one of them while the other drifts`);
    const section = content.split(headings[0])[1].split('\n### ')[0];
    assert.ok(section.includes('`core.md` "See also"'), `${rel} "Rule docs" must point at the index, or the reader has no route from here to the rule-doc set`);
    assert.deepStrictEqual(ruleDocs.filter((doc) => section.includes(doc)), [], `${rel} "Rule docs" must not re-list the docs beside the pointer: the copy that used to live here drifted two entries behind core.md and shipped that way to every consumer through t_AGENTS.md. Naming core.md alone is what keeps this section a pointer`);
  }
});

test('sprint-010 AC-7/G-9: artifact-layout.md "Documentation economy" is the rule\'s sole home, AGENTS.md and code-style.md §7 point at it, and it is a derivable rubric id of the efficiency reviewer - the only path into the blocking coverage ledger', () => {
  const home = '.asd/rules/artifact-layout.md';
  const rule = readRepoFile(home).split('## Documentation economy')[1];
  assert.ok(rule, 'AC-7: the rule needs one canonical home with a named section, since its enforcement and both pointers cite it by name');
  const decisionTests = ['**removal**', '**provenance**', '**enforcement**'];
  for (const decisionTest of decisionTests) {
    assert.ok(rule.split('\n## ')[0].includes(decisionTest), `AC-7/G-7: the rule must state its decision procedure - ${decisionTest} is one of the three tests a reviewer applies. A rule saying only what to exclude, with no procedure, decides nothing and is enforced as taste`);
  }
  assert.ok(rule.includes('Never cut, whatever the length'), 'AC-7: the preserve-list is what stops the rule cutting the text it protects - a machine-parsed token, an enumeration whose completeness is the rule, a stated failure mode. Without it the rule authorizes exactly the deletions that break the suite');
  const section = rule.split('\n## ')[0];
  assert.ok(/removal[^.]*necessary/i.test(section) && /corroborate/.test(section), 'AC-7: removal must be the controlling test rather than one of three alternatives. OR-joined, a line no logged defect happens to cite is cuttable on provenance alone even where a reading agent genuinely acts differently without it - provenance and enforcement can only corroborate a cut removal already allows');
  const preserve = section.split('Never cut')[1] || '';
  assert.ok(/normative/.test(preserve) && /at its home/.test(preserve), 'AC-7: the preserve-list must keep normative prose - a gate, safety boundary, ownership assignment, precondition, recovery duty - and keep it scoped to its home. Unscoped, that class shields every restatement elsewhere from the SSoT rule this same file declares above it');
  assert.ok(/prohibition/.test(preserve), "AC-7: a standalone safety, security, authority or irreversible-action prohibition has no paired positive rule by construction, so the preserve-list must name it; the cut-on-sight bullet as first worded authorised deleting this framework's own such bans");

  for (const rel of canonMarkdownFiles()) {
    if (rel === home) continue;
    for (const decisionTest of decisionTests) {
      assert.ok(!readRepoFile(rel).includes(`${decisionTest} —`), `${rel} must cite the economy rule rather than restating its three tests - a second copy of a cut-or-keep procedure is the SSoT violation the rule itself makes a FAIL`);
    }
  }

  for (const [rel, marker] of [['AGENTS.md', 'minimize runtime tokens'], ['.asd/rules/code-style.md', 'Comments concise and clear']]) {
    const pointer = readRepoFile(rel).split('\n').find((line) => line.includes(marker));
    assert.ok(pointer, `${rel} must keep its economy line - reduced to a pointer, not deleted: it is where a dev or reviewer working in that file meets the rule at all`);
    assert.ok(pointer.includes('artifact-layout.md') && pointer.includes('Documentation economy'), `${rel}'s economy line must cite the new home by section, or the two former paragraphs grow back into second homes`);
  }

  const rubricIds = (reviewer) => {
    try {
      return runtime.emitCoverageManifest({ reviewer, phase: 'impl-review', rubric: reviewerRubric(reviewer), files: [] }).rules;
    } catch (error) {
      return `rejected: ${error.message}`;
    }
  };
  for (const reviewer of internalReviewers()) {
    const ids = rubricIds(reviewer);
    assert.ok(Array.isArray(ids), `G-9: review-policy.md derives every manifest's rubric ids from this reviewer's \`## Review rubric\` - sectioned rubrics by their \`###\` headings, else by each bullet's bold lead-in - and since sprint 012 \`emit-manifest\` is the one place that derivation runs. A rubric matching neither shape yields no ids, and no manifest can be emitted for that reviewer at all. ${reviewer}: ${ids}`);
  }
  assert.ok(rubricIds('efficiency').some((id) => id.startsWith('Documentation economy')), 'AC-7: the rubric bullet is the rule\'s only path into the blocking coverage ledger, and it counts only if the emitter\'s derivation yields it as an id. Stated in prose the reviewer would read it; emitted as an id it must resolve a row before any verdict counts');
});

test('sprint-010 AC-10: the documentation economy rule carries both its authoring obligation and its review consequence in its own home, code-style.md §1 sends an author to every iron rule, and providers.md grants that home to every role whose context is a fixed list', () => {
  const layout = readRepoFile('.asd/rules/artifact-layout.md');
  const rule = layout.split('## Documentation economy')[1].split('\n## ')[0];
  assert.ok(/tests bind while authoring/.test(rule), 'AC-10: stated only as something a reviewer judges, the rule reaches an author after the text is already written, and applying it costs a whole review round. The authoring obligation belongs in the rule\'s own home - the one file every authoring role is granted - not in a file half of them never load');
  assert.ok(rule.includes('Violation = a finding from `asd-reviewer-efficiency`') && !rule.includes('Violation = `FAIL`'), 'AC-10 is two-sided: the authoring sentence must not displace the enforcement one, or the rule degrades to advice with no reviewed finding behind it - sprint-033 AC-28 makes the consequence a finding, FAIL being reserved for a fix needing a design decision');

  const ironRules = [...layout.matchAll(/^## (.+) \(iron rule\)$/gm)].map((match) => match[1]);
  assert.strictEqual(ironRules.length, 2, 'artifact-layout.md declares the iron rules code-style.md §1 sends authors to, and that bullet enumerates them by name. A third iron rule added here must be named there in the same change, or it inherits the review-only reading AC-10 exists to remove');
  const economy = ironRules.find((heading) => /economy/i.test(heading));
  assert.ok(economy, 'the economy rule must stay an iron-rule heading: the §1 bullet, the efficiency reviewer\'s rubric id and both pointer sites all select it by that section');

  const proactive = readRepoFile('.asd/rules/code-style.md').split('\n').find((line) => line.includes('PROACTIVELY while authoring'));
  assert.ok(proactive, 'code-style.md §1 must keep a proactive-authoring bullet: it is where a dev or tester meets an authoring obligation at all, and every reviewer-side rule reaches them only after the text exists');
  assert.ok(proactive.includes('iron rules'), `AC-10: the bullet must send authors to both of artifact-layout.md's iron rules; naming one of ${ironRules.length} in the singular implies the other is review-only, which is how the economy rule read before this criterion`);
  assert.ok(proactive.toLowerCase().includes(economy.toLowerCase()), `the bullet must name "${economy}" alongside SSoT - a list that names only SSoT is exactly the omission that left the economy rule enforceable but never authored against`);

  const roles = [...new Set(grantRows().map((row) => row.role))];
  assert.ok(roles.length > fs.readdirSync(path.join(REPO_ROOT, '.asd/agents')).length, 'the grant table must parse into roles, or every grant assertion below passes vacuously over an empty list - the failure mode that makes a reach check worthless');
  const without = roles.filter((role) => !grantedRefs(role).includes('.asd/rules/artifact-layout.md#Documentation economy (iron rule)'));
  assert.deepStrictEqual(without, ['asd-advisor', 'asd-scout'], "exactly two roles are exempt - the advisor, granted only the files and sections its consulting question names, and the read-only scout, which writes no file and returns a cited summary to the orchestrator. Every other role writes text a later agent reads, so it must be granted the rule's home section (AC-10); left uncounted, a role reading the economy rule nowhere is reported as covered");
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

test('sprint-012 AC-5/AC-6: providers.md "Role-scoped context" defines the declared tool policy with its refusal signal, and core.md "Autonomy and escalation" and artifact-layout.md "Agent memory" hand their obligations to it', () => {
  const definition = headingBody('.asd/rules/providers.md', 'Declared tool policy');
  assert.ok(definition, 'AC-5: the declared tool policy needs one definition an agent can check a payload against');
  assert.ok(definition.includes('`QUESTION`'), 'AC-5: the refusal must name the signal an agent returns, or "does not comply" ends in silence (010 F-5)');
  for (const component of ['`sprint-lifecycle.md` "Self-hosting"', '`artifact-layout.md` "Agent memory"']) {
    assert.ok(definition.includes(component), `AC-5: the policy is the definition plus its grants, so it must cite ${component} - without it a self-hosting write or a memory write reads as outside policy and gets refused`);
  }
  const pointer = '`providers.md` "Declared tool policy"';
  for (const [rel, heading] of [['.asd/rules/core.md', 'Autonomy and escalation'], ['.asd/rules/artifact-layout.md', 'Agent memory']]) {
    assert.ok(sectionOf(rel, heading).includes(pointer), `${rel} "${heading}" must point at the declared tool policy - core.md is where every agent meets the refusal, "Agent memory" is where a write is checked against the definition before it lands (AC-6)`);
  }
});

test('sprint-018 AC-4/AC-5/AC-7: only the main orchestrator prompts the user - core.md says so, the QUESTION protocol carries every dispatched question, every creator/dev/tester-dispatching workflow cites it, and no agent body, skill or design step hands user contact to a dispatched agent', () => {
  const request = sectionOf('.asd/rules/core.md', 'Request user decision');
  assert.ok(request.split(/(?<=[.;—])\s/).some((clause) => /\bonly\b/i.test(clause) && /main orchestrator/.test(clause)), 'AC-5: core.md must reserve request user decision to the main orchestrator');
  assert.ok(request.includes('`agent-protocol.md` "Relay"'), 'AC-5: core.md must hand a dispatched agent\'s question to the QUESTION protocol');
  assert.ok(!request.includes('Every agent can do this'), 'AC-5: the retired "every agent can prompt" claim must stay gone');
  assert.ok(canonText('.asd/rules/providers.md').split('\n').some((line) => line.startsWith('| request user decision') && line.includes('`core.md` "Request user decision"')), 'AC-5: the providers.md host mapping must point at the orchestrator-only rule');
  for (const [rel, retired] of [['.asd/rules/sprint-lifecycle.md', 'escalates to the user normally'], ['.asd/rules/sprint-lifecycle.md', "escalates per `core.md`'s Autonomy"], ['.asd/rules/design-principles.md', 'request user decision for final choice'], ['.asd/rules/external-review.md', 'escalates to user with options']]) {
    assert.ok(!canonText(rel).includes(retired), `AC-5: ${rel} must not tell a dispatched agent to reach the user itself ("${retired}")`);
  }

  const signal = sectionOf('.asd/rules/agent-protocol.md', 'Signals').split('\n').find((line) => line.startsWith('| `QUESTION`'));
  const protocol = sectionOf('.asd/rules/agent-protocol.md', 'Relay').split('**`QUESTION`**:')[1];
  assert.ok(signal && /\breviewer\b/.test(signal) && signal.includes('`review-policy.md` "Gate Verdict Format"') && signal.includes('"Relay" `QUESTION`'), 'AC-4/AC-7: the QUESTION signal must exclude reviewers (pointing at their carrier) and point at its protocol');
  assert.ok(protocol, 'AC-7: agent-protocol.md "Relay" must carry the QUESTION protocol');
  const steps = protocol.split('\n\n')[0].split('\n').filter((line) => /^\d\. /.test(line));
  assert.ok(steps.length === 3 && /dispatched agent/.test(steps[0]), 'AC-7: step 1 catches QUESTION from a dispatched agent');
  assert.ok(/main orchestrator/.test(steps[1]) && /request user decision/.test(steps[1]), 'AC-7: step 2 - the main orchestrator asks, via request user decision');
  assert.ok(steps[1].includes('`decisions-log.md`') && /before any further work/.test(steps[1]), 'AC-7: step 2 - the answer is on disk before any further work, or a lost session loses it');
  assert.ok(/\bfresh\b/.test(steps[2]) && /original task/.test(steps[2]) && /\banswer\b/.test(steps[2]), 'AC-7: step 3 - a fresh re-dispatch carrying the original task plus the answer; no host resumes a dispatched agent');

  const cites = (text) => text.includes('`agent-protocol.md` "Relay"') || text.includes("agent-protocol.md 'Relay'");
  const creators = canonAgents().map((a) => a.name).filter((name) => !/^asd-(reviewer-|external-review|advisor|scout)/.test(name));
  assert.deepStrictEqual(creators, ['asd-dev', 'asd-tester'], 'sanity: the QUESTION-emitting roles, derived from the agents directory');
  const workflows = fs.readdirSync(path.join(REPO_ROOT, '.asd/workflows')).filter((file) => file.endsWith('.md')).map((file) => `.asd/workflows/${file}`);
  const dispatchers = workflows.filter((rel) => creators.some((name) => canonText(rel).includes(`\`${name}\``)));
  assert.ok(dispatchers.length >= 3, `sanity: the creator/dev/tester-dispatching workflows must be found - got ${dispatchers.join(', ')}`);
  const branches = workflows.flatMap((rel) => canonText(rel).split(/;|\n/).filter((clause) => /QUESTION[^→]*→/.test(clause)).map((clause) => `${rel}: ${clause.trim()}`));
  assert.ok(branches.length >= 2,'sanity: the QUESTION → branch sweep must reach the workflows');
  assert.deepStrictEqual(branches.filter((clause) => !cites(clause)), [], 'AC-7: a QUESTION branch routes through the protocol, never "relay, halt"');

  const selfPrompt = /\brequests? (?:for )?(?:a )?user (?:decision|approval)|\brequests? the user\b/i;
  const offenders = canonAgents().flatMap((a) => a.body.split('\n').filter((line) => !line.startsWith('- never:')).flatMap((line) => line.split(/(?<=[.;])\s/)).filter((clause) => selfPrompt.test(clause) && !/\bnever\b/.test(clause)).map((clause) => `${a.name}: ${clause.trim()}`));
  assert.deepStrictEqual(offenders, [], 'AC-4: no agent body may instruct the agent itself to request a user decision - it returns QUESTION (or its reviewer carrier) instead');
  const delegatedAsk = [...canonMarkdownFiles()].flatMap((rel) => canonText(rel).split('\n').filter((line) => /delegate to agent\b[^.]*\bto ask (?:the )?user/i.test(line)).map((line) => `${rel}: ${line}`));
  assert.deepStrictEqual(delegatedAsk, [], 'AC-7: a skill or workflow collects user input inline before delegating - never delegates the asking');

  const design = sectionOf('.asd/workflows/asd-phase-design.md', 'Steps');
  for (const [n, gate] of [[6, 'PRD'], [8, 'UX-spec'], [9, 'ADR']]) {
    const step = stepOf(design, n);
    assert.ok(step.includes(`[GATE write-then-review-accept: ${gate}]`) && step.includes('"Authoring"'), `AC-7: design step ${n} authors its draft inline under the "Authoring" accept loop, where the orchestrator alone holds user contact`);
    assert.ok(!/delegate to agent|- instruction:/.test(step), `AC-7: design step ${n} dispatches no creator, so it has no instruction that could hand user contact to one`);
  }
  const tokenGate = stepOf(design, 7).split('\n').find((line) => /token gate/.test(line));
  assert.ok(tokenGate && tokenGate.includes('[GATE adaptive: design token]') && !/delegate to agent/.test(tokenGate), 'AC-7: the design token approval is an orchestrator gate in the design-system step, with no creator question to relay');

  assert.deepStrictEqual(dispatchers.filter((rel) => !cites(canonText(rel))), [], 'AC-7: every workflow dispatching a role that can return QUESTION must cite the QUESTION protocol, or that question has no handling path in the phase');
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

test('sprint-022 AC-2: checkpoints.md keeps no sprint-closure hard gate, in its hard list or its inventory', () => {
  const lines = canonText('.asd/rules/checkpoints.md').split('\n');
  const hard = lines.find((line) => line.startsWith('Hard in both modes:')) || '';
  assert.ok(/\babort\b/.test(hard), 'sanity: checkpoints.md must keep its "Hard in both modes:" list');
  assert.ok(!/closure/i.test(hard), 'AC-2: the PR merge completes the sprint - no hard closure gate remains, and a merged sprint is archived by the next scope with no approval');
  const inventory = sectionOf('.asd/rules/checkpoints.md', 'Gate inventory').split('\n').filter((line) => line.startsWith('| '));
  assert.ok(inventory.length > 2, 'sanity: checkpoints.md "Gate inventory" must keep its table');
  assert.deepStrictEqual(inventory.filter((row) => /closure/i.test(row.split('|')[1])), [], 'AC-2: the gate inventory has no sprint-closure row');
});

test('sprint-022 AC-4: a CLOSED head-branch hit counts as no hit, a lookup that cannot reach gh outside phase="pr" warns and resumes, and each gh failure cause names its own fix', () => {
  const unreachable = '"host unreachable, retry online"';
  const home = sectionOf('.asd/rules/sprint-lifecycle.md', 'PR phase').split('**Merged-unclosed**')[1].split('\n\n')[0].split(/(?<=\.)\s/);
  assert.ok(/\bno hit\b/.test(home.find((sentence) => sentence.includes('`CLOSED`')) || ''), '"Merged-unclosed": a CLOSED (unmerged) hit counts as no hit - it is neither merged-unclosed nor adoptable into merge mode');
  const [offline, online = ''] = (home.find((sentence) => sentence.includes(unreachable)) || '').split(/;\s/);
  assert.ok(spans(offline).includes('phase="pr"') && /\bwarns?\b/.test(offline) && /\bresumes?\b/.test(offline), `"Merged-unclosed": a lookup that cannot reach gh outside phase="pr" warns and resumes the sprint, never FAILED - an offline run must not block every non-pr phase; got: ${offline}`);
  assert.ok(online.includes('`FAILED`'), `"Merged-unclosed": at phase="pr" an unreachable host stays FAILED naming ${unreachable}`);
  const stepOne = canonText('.asd/skills/asd-sprint/SKILL.md').split('### Step 1:')[1].split('\n### ')[0].split(/(?<=\.)\s|\n/);
  assert.ok(/\bno hit\b/.test(stepOne.find((sentence) => sentence.includes('`CLOSED`')) || ''), 'asd-sprint Step 1: a CLOSED head-branch hit counts as no hit');
  const skillOffline = stepOne.map((sentence) => sentence.split(/;\s/)[0]).find((clause) => spans(clause).includes('phase="pr"') && /\bwarns?\b/.test(clause)) || '';
  assert.ok(/\bresumes?\b/.test(skillOffline), 'asd-sprint Step 1: a head-branch lookup that cannot reach gh outside phase="pr" warns and resumes');
  const bullet = sectionOf('.asd/rules/git-strategy.md', 'PR creation').split('\n').find((line) => line.includes('`gh auth login`')) || '';
  const fixes = [['not installed', 'install gh'], ['not authenticated', '`gh auth login`'], ['host unreachable', unreachable]];
  for (const [cause, fix] of fixes) {
    const clause = bullet.split(/;\s|:\s/).find((candidate) => candidate.includes(cause)) || '';
    assert.ok(clause.includes(fix) && fixes.every(([, other]) => other === fix || !clause.includes(other)), `git-strategy.md "PR creation": the "${cause}" cause names its own fix (${fix}) and no other cause's - install or auth advice does nothing for an unreachable host (021 F-6); got: ${clause}`);
  }
  assert.ok(spans(bullet).includes('phase="pr"') && bullet.includes('"Merged-unclosed"'), 'git-strategy.md "PR creation" must name the one warn-and-resume exception to FAILED and point at its home');
});

test('sprint-022 AC-7 (D4), iter-01 combined #2: an amendment accepted after the division point records floor_base, impl-review computes floor and cap on iteration minus the base of the latest record since the current waves.json division, and the amendment write clears the wave\'s latch', () => {
  const amendment = stepOf(sectionOf('.asd/rules/sprint-lifecycle.md', 'Scope amendment'), 3);
  const floorBase = spans(amendment).find((span) => span.startsWith('floor_base='));
  const rebased = spans(amendment).find((span) => /^iteration\s*[−-]\s*A$/.test(span));
  assert.ok(floorBase && rebased, 'AC-7: "Scope amendment" step 3 records floor_base in its gate evidence and names the iteration - A the floor and cap are computed on');
  assert.ok(spans(amendment).includes('latched') && amendment.includes('"APPROVE latch"'), 'AC-7: the amendment write clears wave K\'s latched, citing "APPROVE latch" - a latched reviewer would otherwise never see the amended code');
  const latchRoute = sectionOf('.asd/rules/sprint-lifecycle.md', 'APPROVE latch').split('\n').find((line) => /clearing route/.test(line) && line.includes('"Scope amendment"')) || '';
  assert.ok(spans(latchRoute).includes('latched'), 'AC-7: "APPROVE latch" names every route that clears a latch, so the scope-amendment route must be listed there');
  const staleBase = 'iter-01 combined #2: floor_base lives in gate_decisions, which the rollback reset never touches, so a record from before a rollback would rebase the re-divided wave K, pinning its floor at low and extending its cap';
  const selection = amendment.split(/;\s|(?<=\.)\s/).find((clause) => /\blatest\b/.test(clause)) || '';
  const division = spans(selection).find((span) => span.endsWith('waves.json'));
  assert.ok(division && /\bdivision\b/.test(selection), `AC-7: "Scope amendment" step 3 takes A from the latest record accepted since the current waves.json division - ${staleBase}; got: ${selection}`);
  const rollback = canonText('.asd/rules/sprint-lifecycle.md').split('\n').find((line) => line.startsWith('- **Rollback reset.**')) || '';
  assert.ok(spans(rollback).includes(division), `AC-7: the division-scoped A retires pre-rollback records only because the rollback reset overwrites ${division}, the division the scope names (re-division itself: the sprint-017 D3 assert) - ${staleBase}`);
  const policy = sectionOf('.asd/rules/review-policy.md', 'Iteration severity floor');
  assert.ok(policy.includes(`\`${floorBase}\``) && policy.includes('"Scope amendment"'), `AC-7: review-policy.md "Iteration severity floor" subtracts the base the amendment records (${floorBase}) from N`);
  const policyN = policy.split('\n').find((line) => line.includes(`\`${floorBase}\``)) || '';
  assert.ok(!/\blatest\b/.test(policyN) || spans(policyN).includes(division), `AC-7: review-policy.md points at "Scope amendment" for A; a restated selection must carry its ${division} division scope - ${staleBase}`);
  const counters = sectionOf('.asd/rules/sprint-lifecycle.md', 'Review iteration counters').split('\n').find((line) => line.includes('severity floor and iteration cap')) || '';
  assert.ok(counters.includes('"Scope amendment"'), 'AC-7: "Review iteration counters" - floor and cap are per counter less the amendment base');
  const implReview = canonText('.asd/workflows/asd-phase-impl-review.md');
  for (const step of [3, 10]) assert.ok(spans(stepOf(implReview, step)).includes(rebased), `AC-7: asd-phase-impl-review step ${step} computes the floor and cap on ${rebased}, the value "Scope amendment" defines`);
});

test('sprint-023 AC-2: asd-sprint runs Step 0 ahead of Step 1 and keeps Step 2B, the step cites git-strategy.md "Branch" for the mechanics instead of restating them, and the commands "Branch" gives bring a base branch up to origin - the ref alone when it is not checked out, the worktree when it is - and refuse a diverged one', () => {
  const skill = canonText('.asd/skills/asd-sprint/SKILL.md');
  const headings = [...skill.matchAll(/^### (Step [0-9A-Z]+)/gm)].map((match) => match[1]);
  assert.deepStrictEqual(headings.slice(0, 2), ['Step 0', 'Step 1'], 'Step 0 must be the first step, ahead of the detection of the active sprint - a sprint merged on origin after the last pull is invisible to a detection that runs on the stale base');
  assert.ok(headings.includes('Step 2B'), 'adding Step 0 must keep the resume flow Step 2B, which other tests and workflows locate by that heading');
  const stepZero = skill.split('### Step 0')[1].split('\n### ')[0];
  assert.ok(stepZero.includes('`git-strategy.md` "Branch"') && !/--ff-only|git fetch/.test(stepZero), 'Step 0 must point at git-strategy.md "Branch", the one home of the fast-forward mechanics - restated here, the two homes drift');

  const forward = sectionOf('.asd/rules/git-strategy.md', 'Branch').split('\n').find((line) => line.startsWith('**Fast-forward**')) || '';
  for (const [site, text] of [['Step 0', stepZero], ['git-strategy.md "Branch"', forward]]) {
    assert.ok(/\bhalts?\b/.test(text) && /unreachable/i.test(text) && /\bwarns?\b/.test(text) && /local state/.test(text), `${site} must state both failure routes - a refusal halts and asks the user, an unreachable remote warns and continues on local state - or an offline Codex sandbox leaves the orchestrator no rule for a fetch that cannot run`);
  }
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
  commitOrigin('first.txt');
  const clone = mkTempDir();
  execFileSync('git', ['clone', '-q', origin, clone], { env, stdio: 'pipe' });
  const inClone = (...args) => execFileSync('git', ['-c', 'user.name=asd-test', '-c', 'user.email=asd-test@example.invalid', '-c', 'commit.gpgsign=false', '-c', 'core.autocrlf=false', ...args], { cwd: clone, env, encoding: 'utf8', stdio: 'pipe' });
  const run = (command) => inClone(...command.replace(/<base_branch>/g, 'main').split(' ').slice(1));

  inClone('checkout', '-q', '-b', 'sprint/x');
  writeFile(clone, 'first.txt', 'dirty\n');
  const second = commitOrigin('second.txt');
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
  commitOrigin('fourth.txt');
  run(fetchAll);
  assert.throws(() => run(merge), Error, 'base checked out and diverged: the --ff-only merge must refuse, so the orchestrator halts and asks instead of merging origin into the base');
  assert.strictEqual(inClone('rev-parse', 'HEAD').trim(), local, 'a refused merge leaves the base where it was');
  inClone('checkout', '-q', 'sprint/x');
  assert.throws(() => run(refSpec), Error, 'base not checked out and diverged: the refspec fetch must refuse a non-fast-forward');
  assert.strictEqual(inClone('rev-parse', 'main').trim(), local, 'a refused fetch leaves the base where it was');
});

test('sprint-023 AC-4: artifact-layout.md "Agent memory" states the content rule for each kind of work history memory-check catches, and git-strategy.md "Commit before review" runs the check where the orchestrator commits memory writes and sends a violating one to its owner', () => {
  const content = sectionOf('.asd/rules/artifact-layout.md', 'Agent memory').split('\n').find((line) => line.startsWith('**Content**')) || '';
  assert.deepStrictEqual(['sprint', 'Task', 'wave', 'iteration', 'verdict'].filter((kind) => !new RegExp(`\\b${kind}`, 'i').test(content)), [], 'the **Content** rule must name every kind of work history the check scans for - a kind the rule never names is rejected at the commit with no rule to cite');
  const acting = sectionOf('.asd/rules/git-strategy.md', 'Commit before review').split('\n').find((line) => line.includes('`node .asd/runtime.js memory-check`')) || '';
  assert.ok(acting && acting.includes('`review-policy.md` "Memory-fix dispatch"') && acting.includes('`artifact-layout.md` "Agent memory"'), 'git-strategy.md "Commit before review" must run memory-check at the orchestrator\'s memory commit, cite the content rule it enforces, and route a violating write to its owner\'s memory-fix dispatch - run nowhere, the rule has no acting site');
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
  assert.deepStrictEqual(headingsOf('.asd/rules/agent-protocol.md').filter(([level]) => level === 2).map(([, name]) => name), ['Signals', 'Dispatch payload', 'Return', 'Relay'], 'agent-protocol.md holds Signals, Dispatch payload, Return, Relay in that order');
});

test('sprint-026 AC-4/AC-9/AC-10/AC-11/D9: each rule the sprint added or relocated keeps its one home - the HEAD-moving ban with the orchestrator-only squash, the closure-write gate name, the edge-semantics decomposition rule, the protocol load line, and no moved phase section left in sprint-lifecycle.md', () => {
  const gitStrategy = '.asd/rules/git-strategy.md';
  const ban = sectionOf(gitStrategy, 'Forbidden').split('\n').find((line) => line.includes('never moves HEAD')) || '';
  assert.deepStrictEqual(['`commit --amend`', '`rebase`', '`--hard`', '`git reset -q -- <paths>`'].filter((token) => !ban.includes(token)), [], 'AC-10: git-strategy.md "Forbidden" bans a dispatched agent from moving HEAD (reset, amend, rebase) and keeps the index-only reset allowed - a shared worktree has one HEAD, and a sibling agent\'s commit is lost if another moves it');
  const squash = sectionOf(gitStrategy, 'Commits').split('\n').find((line) => line.includes('squash')) || '';
  assert.ok(squash.includes('main orchestrator'), 'AC-10: the "Commits" squash bullet names the main orchestrator as its only actor - the squash is a HEAD move the "Forbidden" ban denies every dispatched agent');
  const closure = sectionOf('.asd/rules/sprint-lifecycle.md', 'PR phase').split('**Closure write**')[1].split('\n\n')[0];
  assert.ok(closure.includes('`sprint-closure` `gate_decisions`'), 'AC-9: the closure write records its gate_decisions entry under the name sprint-closure - the retro finds the closed sprint by it');
  assert.ok(sectionOf('.asd/rules/sprint-lifecycle.md', 'Plan file format').includes('states its edge semantics'), 'AC-11: "Plan file format" Decomposition rules keep the edge-semantics clause for a plan decision defining a computed metric or a bounded fetch');
  const protocolSections = ['Signals', 'Dispatch payload', 'Return'].map((heading) => `.asd/rules/agent-protocol.md#${heading}`);
  const lacking = [...new Set(grantRows().map((row) => row.role))].filter((role) => (role === 'orchestrator' ? !grantedRefs(role).includes('.asd/rules/agent-protocol.md') : protocolSections.some((ref) => !grantedRefs(role).includes(ref))));
  assert.deepStrictEqual(lacking, [], 'AC-4: providers.md "Role-scoped context" loads agent-protocol.md for every role, an agent reading only Signals, Dispatch payload and Return');
  const inputRows = sectionOf('.asd/rules/sprint-lifecycle.md', 'Optional documents').split('\n');
  const flat = [['`requirements`', '`requirements.html`'], ['`ux`', '`ux-spec.html`']].filter(([key, file]) => !(inputRows.find((line) => line.startsWith(`| ${key}`)) || '').includes(file));
  assert.deepStrictEqual(flat, [], 'AC-7: "Input sources" requirements and ux rows name the flat persistent path used with decomposition disabled - without it an agent resolving the input in a non-decomposed project has no path');
  const moved = ['Audit phase', 'Design phase', 'Impl phase', 'Impl-test phase', 'Retro phase', 'Signal vocabulary'];
  const present = canonText('.asd/rules/sprint-lifecycle.md').split('\n').filter((line) => /^## /.test(line)).map((line) => line.slice(3));
  assert.deepStrictEqual(moved.filter((name) => present.includes(name)), [], 'D9: sections moved into the phase workflows and agent-protocol.md stay out of sprint-lifecycle.md - text left in both is two homes that drift');
});

test('sprint-027 AC-7 (D7): providers.md "Task-class variants and routing" states every input key and enum routeTask reads and the --input <path|-> form once, route-task accepts stdin, and impl step 5a cites the keys instead of restating them', () => {
  const source = runtime.routeTask.toString();
  const keys = [...new Set([...source.matchAll(/\binput\.(\w+)/g)].map((match) => match[1]))];
  assert.deepStrictEqual(keys.sort(), ['checks', 'correctionAttempts', 'effortRaised', 'failedObjectiveCheck', 'kind', 'objectiveInputs', 'priorTier', 'risks'], 'sanity: routeTask reads the eight documented keys - a new key needs a providers.md row');
  const section = headingBody('.asd/rules/providers.md', 'Task-class variants and routing');
  for (const key of keys) {
    assert.ok(section.includes(`\`${key}\``), `AC-7: providers.md must name the route-task input key \`${key}\``);
  }
  const kinds = /\[((?:'\w+',? ?)+)\]\.includes\(input\.kind\)/.exec(source)[1].match(/\w+/g);
  assert.ok(section.includes(`\`kind\` (${kinds.map((kind) => `\`${kind}\``).join('|')})`), 'AC-7: the kind enum is stated exactly as routeTask accepts it');
  assert.ok(section.includes('route-task --input <path|->') && section.includes('never inline JSON'), 'AC-7: the --input form is stated once');
  const routed = runtimeCliResult(['route-task', '--input', '-'], { input: JSON.stringify({ kind: 'standard', objectiveInputs: false, failedObjectiveCheck: false, checks: [], correctionAttempts: 0, risks: [] }), stdio: 'pipe' });
  assert.deepStrictEqual(routed.status === 0 && routed.result.tier, 'standard', `AC-7: route-task --input - must read stdin. Got: ${JSON.stringify(routed)}`);
  const step5a = canonText('.asd/workflows/asd-phase-impl.md').split('\n').find((line) => line.startsWith('5a.')) || '';
  assert.ok(step5a.includes('`providers.md` "Task-class variants and routing"') && !step5a.includes('objectiveInputs'), 'AC-7: impl step 5a cites the keys\' home and does not restate them');
});

test('sprint-028 AC-8/AC-9/AC-10: asd-external-review.md states an empty Kept findings table is its header and separator rows only, and "Plan file format" Decomposition rules carry the multi-stage write-point and the universal-reach trigger-site clauses', () => {
  const kept = canonText('.asd/agents/asd-external-review.md').split('\n').find((line) => line.includes('Kept findings table'));
  assert.ok(kept && kept.includes('header and separator rows only') && kept.includes('never a placeholder row'), 'AC-8: the agent\'s own return-format rule must state the empty table shape');
  const rules = sectionOf('.asd/rules/sprint-lifecycle.md', 'Plan file format').split('**Decomposition rules**')[1].split('\n\n')[0].split('\n').filter((line) => line.startsWith('- '));
  const multiStage = rules.find((line) => line.includes('multi-stage'));
  const universal = rules.find((line) => line.includes('universal reach'));
  assert.ok(multiStage && multiStage.includes('write point') && multiStage.includes('re-entry evidence'), 'AC-9: a multi-stage interactive step states each stage\'s on-disk write point and re-entry evidence');
  assert.ok(universal && universal.includes('triggering site') && universal.includes('repo grep'), 'AC-10: a criterion claiming universal reach lists every site a repo grep finds');
});

test('sprint-030 AC-4/AC-5: the 029 retro guardrails stand verbatim in this repo\'s project rules, which sit outside the impl-review change surface', () => {
  const common = canonText('.asd/project/custom-common-rules.md');
  assert.ok(common.includes('file-edit operation') && common.includes('`node -e`'), 'AC-4: custom-common-rules.md must tell every agent to write file content with the file-edit operation, never in a quoted shell or `node -e` argument');
  const coding = canonText('.asd/project/custom-coding-rules.md');
  assert.deepStrictEqual(['external command', 'tool grant', 'target repo explicitly', 'shipped `.asd/` paths'].filter((token) => !coding.includes(token)), [], 'AC-5: custom-coding-rules.md must carry the external-command Task rule - widened tool grant, explicit target repo, shipped paths only');
});

test('sprint-030 AC-7/AC-8/AC-10/AC-12: the external-review cache lives in the scratch directory, the tester definition is the one home of the suite-op duty, the safety valve reaches impl-test\'s step 8 gate only in all three places stating it, and the scratch rule keeps every ASD script off the OS temp directory', () => {
  const cacheRule = headingBody('.asd/rules/external-review.md', 'Detection and negative cache');
  assert.ok(cacheRule.includes('`external-cache.json` in the scratch directory') && cacheRule.includes('`node .asd/runtime.js scratch-dir`'), 'AC-7: the canonical cache path must be external-cache.json in the directory scratch-dir prints, a self-ignoring one - a tracked-folder path shows up untracked in a consumer and breaks the clean-tree check');
  const tester = canonText('.asd/agents/asd-tester.md');
  const duty = tester.split('\n').find((line) => line.startsWith('- must: bracket every suite run')) || '';
  assert.ok(duty.includes('--kind suite') && duty.includes('--attrs scope=') && duty.includes('--parent'), 'AC-8: the tester definition must state the duty with the kind, scope attribute and parent a suite op needs, so it reaches every tester dispatch');
  assert.deepStrictEqual(canonMarkdownFiles().filter((rel) => canonText(rel).includes('--kind suite')), ['.asd/agents/asd-tester.md'], 'AC-8: the suite-op command form has one home, the tester definition - a workflow restating it drifts from it');
  const valve = headingBody('.asd/rules/sprint-lifecycle.md', 'Impacted test set').split('\n').find((line) => line.startsWith('**Safety valve')) || '';
  assert.ok(/step 8 suite gate/.test(valve) && /step 3 pre-authoring run[^.]*without the valve/.test(valve), 'AC-10: the safety valve home must reach impl-test through the step 8 suite gate and exempt the step 3 run and the reruns after an authoring batch');
  assert.ok(/safety valve[^.;]*step 8/.test(tester.split('\n').find((line) => line.startsWith('- must: impl-test:')) || ''), 'AC-10: the tester\'s impl-test line must apply the valve to the step 8 suite gate only');
  assert.ok(/safety valve[^)]*step 8/.test(stepOf(sectionOf('.asd/workflows/asd-phase-impl-test.md', 'Steps'), 2)), 'AC-10: impl-test step 2 must apply the valve to step 8 only');
  assert.ok(/safety valve at this gate only/.test(sectionOf('.asd/workflows/asd-phase-impl-test.md', 'Rules')), 'AC-10: the impl-test suite-gate rule must apply the valve at that gate only');
  const scratch = headingBody('.asd/rules/artifact-layout.md', 'Scratch directory');
  assert.ok(scratch.includes('inside the project') && scratch.includes('after use'), 'AC-12: the scratch rule must put every script, test and agent temp file inside the project and remove it after use');
  assert.ok(scratch.includes('`external-review.md` "Detection and negative cache"'), 'AC-12/AC-7: the remove-after-use rule must carve out the external-review cache it holds, or the rule orders the removal of state meant to outlive its run');
  const walk = (rel) => fs.readdirSync(path.join(REPO_ROOT, rel), { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? (['.asd/sprints', '.asd/tmp'].includes(`${rel}/${entry.name}`) ? [] : walk(`${rel}/${entry.name}`)) : [`${rel}/${entry.name}`]));
  const scripts = [...walk('.asd'), ...walk('tests')].filter((rel) => rel.endsWith('.js'));
  assert.ok(scripts.includes('.asd/runtime.js') && scripts.includes('.asd/skills/asd-update/update.js') && scripts.includes('tests/run.js'), 'sanity: the sweep must reach the runtime, update.js and this runner');
  const osTemp = scripts.flatMap((rel) => canonText(rel).split('\n').map((line, index) => ({ rel, line, index })).filter(({ line }) => /\btmpdir\(/.test(line) && !/^\s*(?:\/\/|\*)/.test(line)).map(({ rel: file, index }) => `${file}:${index + 1}`));
  assert.deepStrictEqual(osTemp, [], 'AC-12: no ASD script may call the OS temp directory - update.js stages under .asd/tmp and the runner keeps its fixtures there');
});

test('sprint-032 AC-6: pr open mode deletes the sprint scratch files by the prefix the dispatch payload writes them under, and artifact-layout.md "Scratch directory" says so', () => {
  const glob = '<scratch-dir>/<NNN-slug>-*';
  const written = (sectionOf('.asd/rules/agent-protocol.md', 'Dispatch payload').match(/<scratch-dir>\/[^`]*?\.context\.md/g) || []).filter((file) => !file.includes('orchestrator-scope'));
  assert.ok(written.length >= 2 && written.every((file) => file.startsWith(glob.slice(0, -1))), `AC-6: every sprint context bundle path the payload writes must start with the prefix the cleanup glob deletes by; got: ${written.join(' | ')}`);
  const open = subOf(sectionOf('.asd/workflows/asd-phase-pr.md', 'Steps'), 'Open mode').split(/\n(?=\d+[a-z]?\. )/);
  const publishAt = open.findIndex((step) => step.includes('"PR creation"'));
  const deleting = open.findIndex((step) => step.includes(`\`${glob}\``));
  assert.ok(publishAt >= 0 && deleting > publishAt, 'AC-6: pr open mode deletes the sprint scratch files in a step after the PR is created and published');
  const merged = open.find((step) => step.includes('Never open a second PR')).split(/(?<=\.)\s/).find((sentence) => sentence.includes('`MERGED`')) || '';
  assert.ok(merged.includes(`step ${open[deleting].match(/\d+/)[0]}`), `AC-6: a MERGED hit continues at the scratch-deleting step, not past it; got: ${merged}`);
  assert.ok(sectionOf('.asd/rules/artifact-layout.md', 'Scratch directory').includes(`\`${glob}\``), 'AC-6: artifact-layout.md "Scratch directory" names the pr deletion');
});

test('sprint-032 AC-12/AC-13: a dev or tester runs memory-check on its own memory commit and loads the rule that says so, and a below-floor observation stays out of the findings table and ledger', () => {
  const acting = sectionOf('.asd/rules/git-strategy.md', 'Commit before review').split('\n').find((line) => line.startsWith('**Memory content check**')) || '';
  assert.ok(acting.includes("a dev's or tester's own") && !acting.includes('not gated'), `AC-12: the check covers a dev's or tester's own memory commit; got: ${acting}`);
  for (const role of ['asd-dev', 'asd-tester']) {
    assert.ok(grantedRefs(role).includes('.asd/rules/git-strategy.md#Commit before review'), `AC-12: ${role} is granted the rule that runs memory-check at its own memory commit`);
  }
  const floor = sectionOf('.asd/rules/review-policy.md', 'Iteration severity floor');
  assert.ok(floor.includes("ledger's `findings`") && floor.includes('Findings table is empty'), 'AC-13: below-floor observations stay out of the findings table and the ledger, and an APPROVE report\'s table is empty');
});

test('sprint-032 AC-8: custom-coding-rules.md states that a runtime parser of a language.docs artifact checks structure - column count, id column, machine tokens - never translated heading text', () => {
  const rule = canonText('.asd/project/custom-coding-rules.md').split('\n').find((line) => line.includes('`language.docs` artifact')) || '';
  assert.deepStrictEqual(['column count', 'id column', 'machine tokens'].filter((token) => !rule.includes(token)), [], `AC-8: the runtime-parser line names the structure it checks; got: ${rule}`);
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
