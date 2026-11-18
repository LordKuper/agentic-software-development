'use strict';

// content contracts of the phase workflows, skills and their chains

const { assert, fs, path, sync, update, runtime, REPO_ROOT, tests, test, loadManifest, readWorkflowDefinitions, workflowReviewerAgents, arrowChain, readRepoFile, internalReviewers, canonText, headingBody, sectionOf, jsonOf, jsonText, subOf, stepOf, spans, canonMarkdownFiles, canonAgents, FORM_CATEGORIES, scriptedWait } = require('./lib.js');

test('AC-2/4/6/8: External Review CLI availability stays provider-symmetric', () => {
  const init = fs.readFileSync(path.join(REPO_ROOT, '.asd', 'skills/asd-init/SKILL.md'), 'utf8');
  const config = fs.readFileSync(path.join(REPO_ROOT, '.asd', 'templates/t_config.yaml'), 'utf8');
  const claudeAgent = fs.readFileSync(path.join(REPO_ROOT, '.claude/agents/asd-external-review.md'), 'utf8');
  const codexAgent = fs.readFileSync(path.join(REPO_ROOT, '.codex/agents/asd-external-review.toml'), 'utf8');
  assert.ok(init.includes('system.tools.codex_command') && init.includes('system.tools.claude_command') && init.includes('resolved command and availability'));
  assert.ok(config.includes('codex_command: ""') && config.includes('claude_command: ""'));
  assert.ok(claudeAgent.includes('system.tools.codex_command') && claudeAgent.includes('phase-supplied preflight') && claudeAgent.includes('external review unavailable: <specific status>'));
  assert.ok(codexAgent.includes('system.tools.claude_command') && codexAgent.includes('phase-supplied preflight') && codexAgent.includes('external review unavailable: <specific status>'));
});

test('AC-2/4/6/7: review workflow contracts retain Correctness and incremental diff scope', () => {
  const workflow = fs.readFileSync(path.join(REPO_ROOT, '.asd/workflows/asd-phase-design-review.md'), 'utf8');
  const prompt = fs.readFileSync(path.join(REPO_ROOT, '.asd/templates/external-review/t_prompt-external-impl.md'), 'utf8');
  const designPrompt = fs.readFileSync(path.join(REPO_ROOT, '.asd/templates/external-review/t_prompt-external-design.md'), 'utf8');
  const implReview = fs.readFileSync(path.join(REPO_ROOT, '.asd/workflows/asd-phase-impl-review.md'), 'utf8');
  assert.ok(/`asd-reviewer-combined`[^.]*is dispatched when not latch-skipped[^.]*counted toward DoD/.test(workflow));
  assert.ok(sectionOf('.asd/workflows/asd-phase-design-review.md', 'Rules').includes('with no ux-spec/design-system draft in scope, its UI conformance entry is `n/a: outside phase gate`'));
  for (const [name, text] of [['impl', prompt], ['design', designPrompt]]) {
    assert.ok(text.includes('files[]') && text.includes('`diff`') && text.includes('`.asd/rules/review-policy.md` "Scope hand-off"'), `sprint-017 AC-8: t_prompt-external-${name}.md must hand the wrapped CLI the list and the precomputed diff file, linking the one hand-off home`);
    assert.ok(/never derive, widen or narrow the scope yourself/i.test(text), `sprint-017 AC-8: t_prompt-external-${name}.md must forbid the wrapped CLI deriving its own scope`);
    assert.ok(!/\bgit (diff|log|show)\b|base_ref|head_ref|exclude_paths/.test(text), `sprint-017 AC-8: t_prompt-external-${name}.md must no longer grant a git diff or carry a ref pair to compute one`);
  }
  assert.ok(/`diff` is `null` at iteration 1/.test(designPrompt), 'sprint-017 D9e: the design-review prompt must say iteration 1 carries no diff, so a null field reads as "read each draft whole", not as a broken hand-off');
  const scopePerIteration = sectionOf('.asd/rules/sprint-lifecycle.md', 'Review iteration counters').split('\n').find((line) => line.startsWith('- **Scope per iteration**'));
  assert.ok(scopePerIteration && scopePerIteration.includes('iteration_heads["iter-(NN-1)"]...HEAD'), 'incremental scope guarantee (iter 2+ diffs from the same wave\'s prior iteration head) must survive the move of the diff into the runtime');
  assert.ok(implReview.includes('run command') && !implReview.includes('via Bash'));
});

test('AC-7: no canonical rule, workflow, agent, or skill file references the retired asd-pm role', () => {
  const labels = ['rules', 'workflows', 'agents', 'skills'];
  const offenders = [];
  for (const label of labels) {
    const dir = path.join(REPO_ROOT, '.asd', label);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir, { recursive: true })) {
      if (!f.endsWith('.md')) continue;
      const text = fs.readFileSync(path.join(dir, f), 'utf8');
      if (/asd-pm/.test(text)) offenders.push(`${label}/${f}`);
    }
  }
  assert.deepStrictEqual(offenders, [], `canonical files still reference retired asd-pm: ${offenders.join(', ')}`);
});

const FRICTION_APPEND_REF = /append friction: F-N (?:entries )?to <sprint>\/friction-log\.md (?:\(|per )sprint-lifecycle\.md 'Friction log'/;

function readWorkflow(phase) {
  return fs.readFileSync(path.join(REPO_ROOT, `.asd/workflows/asd-phase-${phase}.md`), 'utf8');
}

function readReturnContractTargets(phase, src) {
  const contract = new RegExp(`^PHASE: ${phase} \\|.*\\bNEXT:\\s*(.+?)\\s*$`, 'm').exec(src);
  assert.ok(contract, `asd-phase-${phase}.md must keep its single-line "PHASE: ${phase} | ... | NEXT: <...>" return contract`);
  return contract[1].replace(/[<>`]/g, '').split('|').map((target) => target.trim());
}

test('AC-8/G-11, sprint-020 AC-1: the workflow definitions are the single source for the phase set - every chain successor is an allowed NEXT target, retro runs directly before pr and pr ends every chain, every definition is documented in sprint-lifecycle.md "Workflows", and the union of their phases is in bijection with the phase skills and workflows', () => {
  const definitions = readWorkflowDefinitions();
  const documented = sectionOf('.asd/rules/sprint-lifecycle.md', 'Workflows');
  const union = new Set();
  for (const { name, phases, next } of definitions) {
    assert.ok(documented.includes(`\`${name}\``), `${name}.json is a workflow sprint-lifecycle.md "Workflows" never names - the definition contract and every per-workflow delta live there, so an undocumented definition runs on rules nobody wrote`);
    assert.deepStrictEqual(phases.slice(-2), ['retro', 'pr'], `${name}: retro runs directly before pr, and pr ends the chain - its NEXT targets are the chain exits`);
    phases.slice(0, -1).forEach((phase, index) => {
      assert.ok(next[phase].includes(phases[index + 1]), `${name}: next["${phase}"] must allow its chain successor "${phases[index + 1]}" - asd-sprint relays a NEXT outside the frozen definition's next as FAILED, so the chain would halt there (got: ${next[phase].join(', ')})`);
    });
    phases.forEach((phase) => union.add(phase));
  }
  const glossary = canonText('.asd/rules/core.md').split('\n').find((line) => line.startsWith('- **Workflow**')) || '';
  assert.ok(glossary.includes('`sprint-lifecycle.md` "Workflows"') && definitions.every(({ name }) => glossary.includes(`\`${name}\``)), 'core.md glossary must define Workflow - naming every definition and citing its rule - since "workflow" also names ASD itself and the asd-phase-*.md bodies sharing the folder');

  const phases = [...union];
  const missing = [];
  for (const phase of phases) {
    if (!fs.existsSync(path.join(REPO_ROOT, `.asd/skills/asd-phase-${phase}/SKILL.md`))) missing.push(`skill for ${phase}`);
    if (!fs.existsSync(path.join(REPO_ROOT, `.asd/workflows/asd-phase-${phase}.md`))) missing.push(`workflow for ${phase}`);
  }
  assert.deepStrictEqual(missing, [], `a phase in a chain with no dispatch target routes into nothing: ${missing.join(', ')}`);

  const workflowPhases = fs
    .readdirSync(path.join(REPO_ROOT, '.asd/workflows'))
    .filter((name) => name.startsWith('asd-phase-') && name.endsWith('.md'))
    .map((name) => name.slice('asd-phase-'.length, -'.md'.length));
  const skillPhases = fs
    .readdirSync(path.join(REPO_ROOT, '.asd/skills'))
    .filter((name) => name.startsWith('asd-phase-'))
    .map((name) => name.slice('asd-phase-'.length));
  assert.deepStrictEqual(
    [...workflowPhases].sort(),
    [...phases].sort(),
    "phase workflows and the union of every definition's phases must be in bijection - an orphaned workflow means a chain was edited or reverted without its dispatch targets, the same desync mirrored"
  );
  assert.deepStrictEqual([...skillPhases].sort(), [...phases].sort(), "phase skills and the union of every definition's phases must be in bijection, for the same reason");
});

test('sprint-028 AC-1: cleanup sits directly before retro in every workflow definition, is entered from its review or promote predecessor, and routes only to retro', () => {
  for (const { name, phases, next } of readWorkflowDefinitions()) {
    const at = phases.indexOf('cleanup');
    assert.ok(at > 0, `${name}: the chain must hold a cleanup phase after its first phase`);
    assert.strictEqual(phases[at + 1], 'retro', `${name}: cleanup runs directly before retro`);
    assert.deepStrictEqual(next.cleanup, ['retro'], `${name}: cleanup routes only to retro`);
    assert.ok(next[phases[at - 1]].includes('cleanup'), `${name}: next["${phases[at - 1]}"] must allow cleanup, or asd-sprint relays the NEXT as FAILED`);
  }
});

test("AC-2/AC-3/AC-6/AC-8, sprint-020 AC-1/AC-6: every phase workflow offers exactly the NEXT targets its workflows' definitions route it to and carries the friction-append reference - NEXT is what routes the sprint, and asd-sprint accepts only a target in the frozen definition's next", () => {
  const definitions = readWorkflowDefinitions();
  for (const phase of new Set(definitions.flatMap((definition) => definition.phases))) {
    const src = readWorkflow(phase);
    assert.ok(
      FRICTION_APPEND_REF.test(src),
      `asd-phase-${phase}.md must carry the friction-append reference line verbatim: the orchestrator running a phase with no such line records no friction at all, the retro phase then analyses a log that is silently partial, and every other assertion stays green (sprint-lifecycle.md "Friction log" states the mechanism once and every phase workflow references it)`
    );
    const offered = readReturnContractTargets(phase, src).filter((target) => target !== 'halted');
    const routed = [...new Set(definitions.filter((definition) => definition.phases.includes(phase)).flatMap((definition) => definition.next[phase]))];
    assert.deepStrictEqual(
      offered.sort(),
      routed.sort(),
      `asd-phase-${phase}.md's return contract must offer exactly the union of next["${phase}"] over the definitions holding ${phase} ("halted" aside, a stop that routes nowhere) - a stale token skips a phase silently, and a definition target no contract offers is a route no orchestrator emits`
    );
  }
});

test('AC-8/G-11, sprint-020 AC-7: the ordered chain mirrors match their definitions - standard in core.md, sprint-lifecycle.md and checkpoints.md, every other workflow in sprint-lifecycle.md "Workflows" and as the predecessor deltas of checkpoints.md "Precondition chain"', () => {
  const definitions = readWorkflowDefinitions();
  const standard = definitions.find((definition) => definition.name === 'standard');
  const phases = standard.phases;

  const core = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/core.md'), 'utf8');
  const glossary = /mandatory:\s*([^.]+)\./.exec(core);
  assert.ok(glossary, 'core.md glossary must keep its "... mandatory: <phase>, <phase>, ..." phase list');
  assert.deepStrictEqual(
    glossary[1].split(',').map((phase) => phase.trim()),
    phases,
    'core.md glossary phase list drifted from standard.json'
  );

  const lifecycle = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/sprint-lifecycle.md'), 'utf8');
  const arrowLine = /^scope\s*(?:→|⇄).*$/m.exec(lifecycle);
  assert.ok(arrowLine, 'sprint-lifecycle.md must keep its "scope → ... → pr" chain line');
  assert.deepStrictEqual(
    arrowLine[0].split(/\s*(?:→|⇄)\s*/).map((phase) => phase.trim()),
    phases,
    'sprint-lifecycle.md chain line drifted from standard.json'
  );

  const checkpoints = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/checkpoints.md'), 'utf8');
  const preconditions = /## Precondition chain\s*```\s*([\s\S]*?)\s*```/.exec(checkpoints);
  assert.ok(preconditions, 'checkpoints.md must keep its fenced "## Precondition chain" block');
  assert.deepStrictEqual(
    preconditions[1].split(/\s*(?:→|⇄)\s*/).map((phase) => phase.trim()),
    phases.slice(1),
    'checkpoints.md precondition chain drifted from standard.json - it lists every phase that HAS a predecessor, so the first phase is excluded by construction'
  );

  const documented = sectionOf('.asd/rules/sprint-lifecycle.md', 'Workflows');
  const precondition = sectionOf('.asd/rules/checkpoints.md', 'Precondition chain');
  for (const { name, phases: chain } of definitions.filter((definition) => definition !== standard)) {
    const block = documented.split(`**\`${name}\`**`)[1];
    assert.ok(block, `sprint-lifecycle.md "Workflows" must carry a **\`${name}\`** block - it is the one home of that workflow's deltas`);
    assert.deepStrictEqual(arrowChain(block), chain, `sprint-lifecycle.md "Workflows" states ${name}'s chain in prose, and it drifted from ${name}.json`);
    if (chain.indexOf('design-promote') > chain.indexOf('impl-review')) {
      const designDocs = Object.keys(JSON.parse(readRepoFile('.asd/templates/t_state.json')).documents).filter((doc) => doc !== 'audit');
      const promote = block.split('\n').find((line) => line.startsWith('- design-promote')) || '';
      assert.ok(/\bNo-op\b/.test(promote) && designDocs.every((doc) => promote.includes(`\`${doc}\``)), `sprint-020 AC-5: ${name} promotes after impl-review, so its "Workflows" design-promote bullet must state the no-op over every frozen design document (${designDocs.join(', ')}) - a dropped one runs creators for a document the sprint disabled, or skips one it enabled`);
      const inputsOf = (text) => [...text.slice(0, text.indexOf('in place of drafts')).replace(/`[^`]+\.md` "[^"]+"/g, '').matchAll(/`([^`]+\.md)`/g)].map((match) => path.posix.basename(match[1])).sort();
      const promoteInputs = inputsOf(promote);
      const inputSites = canonMarkdownFiles().filter((rel) => rel !== '.asd/rules/sprint-lifecycle.md' && rel !== '.asd/workflows/asd-phase-design-promote.md').flatMap((rel) => canonText(rel).split('\n').filter((line) => line.includes('in place of drafts')).map((line) => [rel, inputsOf(line.slice(line.lastIndexOf('lite', line.indexOf('in place of drafts'))))]));
      assert.ok(promoteInputs.length > 0, `sanity: the "Workflows" design-promote bullet must name the files read "in place of drafts", or the input comparison below compares nothing`);
      const promoteItem = jsonOf('.asd/workflows/asd-phase-design-promote.md', 'Inputs').find((item) => item.startsWith(`${name}:`)) || '';
      inputSites.push(['.asd/workflows/asd-phase-design-promote.md Inputs', [...promoteItem.matchAll(/([\w-]+\.md)/g)].map((match) => match[1]).sort()]);
      assert.deepStrictEqual(inputSites.filter(([, inputs]) => inputs.join() !== promoteInputs.join()), [], `documentation.md F-3 (wave-1/iter-01): every site stating what ${name}'s design-promote reads in place of drafts must name the same files as its "Workflows" home (${promoteInputs.join(', ')}) - a wider acting site reads what its cited rule never grants, a narrower one promotes without it`);
    }
    const deltas = precondition.split('\n').find((line) => line.includes(`In \`${name}\``));
    assert.ok(deltas, `checkpoints.md "Precondition chain" fences standard's chain only, so it must state ${name}'s differing predecessors on an "In \`${name}\`" line`);
    chain.slice(1).forEach((phase, index) => {
      const predecessor = chain[index];
      const standardPredecessor = phases[phases.indexOf(phase) - 1];
      if (predecessor === standardPredecessor) return;
      const clause = new RegExp(`\`${phase}\` requires ([^,;]+)`).exec(deltas);
      assert.ok(clause && new RegExp(`^${predecessor}\\b`).test(clause[1]), `checkpoints.md: in ${name}, ${phase} follows ${predecessor}, not standard's ${standardPredecessor} - its "In \`${name}\`" line must say \`${phase}\` requires ${predecessor}, or the precondition check aborts a valid sprint (got: ${clause ? clause[1] : 'no clause'})`);
      const acting = new RegExp(`advanced from [^;\\n]*?\`${predecessor}\` \\(\`${name}\`\\)|\`${name}\`:[^;\\n]*?advanced from \`${predecessor}\`|advanced from [^;"\\n]*?\\b${predecessor} \\(${name}\\)|\\b${name}: [^"]*?advanced from ${predecessor}\\b`);
      assert.ok(acting.test(readWorkflow(phase)), `asd-phase-${phase}.md emits the ABORT for a missing predecessor, so its state.json.phase check must bind ${name} to ${predecessor} - as "advanced from ... \`${predecessor}\` (\`${name}\`)" or in a "\`${name}\`: ..." clause - or a lite sprint aborts at a valid transition while checkpoints.md stays right`);
    });
  }
});

test('sprint-011 AC-3/AC-5/AC-7, sprint-013 AC-14: the audit exit that emits NEXT: plan is keyed on the documents-only collapse test, lands phase on the chain predecessor of plan, records exactly the phases between audit and plan as skipped in the one exit write that also carries a skipped audit and logs the skip, and the plan precondition, checkpoints chain and resume flow accept that state through the same frozen collapse test', () => {
  const definitions = readWorkflowDefinitions();
  const chain = definitions.find((definition) => definition.name === 'standard').phases;
  const between = chain.slice(chain.indexOf('audit') + 1, chain.indexOf('plan'));
  const audit = readWorkflow('audit');
  const lifecycle = readRepoFile('.asd/rules/sprint-lifecycle.md');
  const homes = lifecycle.replace(/\r\n/g, '\n').split('\n').map((line) => /^###\s+(.*?)\s*$/.exec(line)).filter((match) => match && match[1].toLowerCase().includes(between.join('/')));
  assert.strictEqual(homes.length, 1, `sprint-lifecycle.md must hold exactly one ### heading for the ${between.join('/')} collapse - it is the home the audit exit, the plan precondition and resume all cite`);
  const collapseLabel = homes[0][1];
  const collapseBody = runtime.markdownSection(lifecycle, collapseLabel).split('\n').slice(1).join('\n');
  const citation = `\`sprint-lifecycle.md\` "${collapseLabel}"`;

  assert.ok(readReturnContractTargets('audit', audit).includes('plan'), "asd-phase-audit.md's return contract must offer NEXT: plan - asd-sprint follows NEXT as authoritative, so without it the collapse has no route and design is dispatched anyway");
  const auditNext = jsonOf('.asd/workflows/asd-phase-audit.md', 'Exit').next;
  assert.ok(auditNext.some((route) => /collapse/.test(route.if) && route.next === 'plan'), 'the audit Exit must route the design-block collapse to plan');
  const exits = audit.split('\n').filter((line) => /^\d+\.\s/.test(line) && line.includes('skipped_phases') && line.includes('phase="design-promote"'));
  assert.strictEqual(exits.length, 1, 'exactly one numbered audit step must carry the design-block skip write - it is its single site');
  const [exit] = exits;
  assert.ok(exit.includes(citation), `the audit step emitting NEXT: plan must be conditioned on the collapse test cited as ${citation} - an unconditioned route skips design for every sprint`);
  const landed = /phase="([a-z-]+)"/.exec(exit);
  assert.ok(landed, 'the audit skip write must set phase="<name>" explicitly');
  assert.strictEqual(chain[chain.indexOf(landed[1]) + 1], 'plan', `the skip write must land phase on the standard chain's predecessor of plan (sprint-lifecycle.md "Multi-phase skip": the LAST subsumed phase) - the session hook and resume derive the next phase from it, so phase="${landed[1]}" would re-enter the skipped block`);
  const appended = /\[\s*("[a-z-]+"(?:\s*,\s*"[a-z-]+")*)\s*\]/.exec(exit);
  assert.ok(appended, 'the audit skip write must name the skipped_phases it appends as a literal array');
  assert.deepStrictEqual(JSON.parse(`[${appended[1]}]`), between, 'the skip write must record exactly the phases standard.json places between audit and plan, in order - a missing name is a phase a later audit cannot tell from one that ran and produced nothing');
  const logged = exit.split(/;\s|\.\s/).filter((clause) => clause.includes('decisions-log')).flatMap((clause) => [...clause.matchAll(/"([^"]*)"/g)].map((match) => match[1]));
  assert.ok(logged.some((line) => between.every((phase) => line.includes(phase))), `the audit skip write must add a quoted decisions-log line naming the skipped ${between.join('/')} - sprint-lifecycle.md "Optional documents" records every skip as state plus one decisions-log line`);

  const exitStep = /^(\d+)\./.exec(exit)[1];
  const auditOff = audit.split('\n').find((line) => /^\d+\.\s/.test(line) && line.includes('false audit'));
  assert.ok(auditOff && auditOff.includes(`step ${exitStep}`), `the audit step reading the frozen documents must route a false audit to step ${exitStep}, the exit write`);
  assert.ok(!/phase=|skipped_phases|record it\b/.test(auditOff), 'the audit step reading `documents.audit` must not write state of its own (no phase=, no skipped_phases, no "record it") - with the setting on, an audit-skip write followed by the exit write is two non-atomic writes, and an interruption between them leaves phase="audit" for resume to re-enter design (EXT-1)');
  const auditRecord = exit.indexOf('`"audit"`');
  assert.ok(auditRecord !== -1 && auditRecord < appended.index, "the exit write must carry a skipped audit's \"audit\" record ahead of the design-block names it appends - it is the one write for both skips, so the audit record cannot land on its own (EXT-1, sprint-lifecycle.md \"Multi-phase skip\")");
  const auditOnly = exit.split(/\.\s+/).find((sentence) => sentence.includes('phase="audit"'));
  assert.ok(auditOnly && auditNext.some((route) => route.if === 'otherwise' && route.next === chain[chain.indexOf('audit') + 1]), 'the exit branch routing to design (Exit "otherwise") must set phase="audit" - with step 1 carrying no write, it is the only write that advances phase past a skipped audit, and a skip recorded without that advance is the state "Skip record" forbids');
  const skipSentence = exit.split(/\.\s+/).find((sentence) => sentence.includes(citation));
  for (const { name, phases, next } of definitions) {
    assert.strictEqual(skipSentence.includes(`\`${name}\``), phases.includes('design'), `sprint-020 AC-3: sprint-lifecycle.md "Workflows" derives the collapse from phases, so the audit skip write must name exactly the workflows whose chain holds design - ${name} ${phases.includes('design') ? 'holds' : 'has no'} design`);
    if (!phases.includes('design')) assert.ok(next.audit.every((target) => auditNext.some((route) => route.if === name && route.next === target)), `sprint-020 AC-3: ${name} has no design block and never takes the collapse write, so the Exit must route it to its next.audit (${next.audit.join(', ')})`);
  }

  const designRow = /^\| Phase \| No-op when \|[\s\S]*?^\| design \| (.*?) \|\s*$/m.exec(lifecycle);
  const designDocs = designRow ? [...designRow[1].matchAll(/`([a-z0-9_]+)`/g)].map((token) => token[1]) : [];
  assert.ok(designDocs.length >= 4, `the no-op table's design row must still enumerate the design documents - only [${designDocs.join(', ')}] found, so this derivation has drifted and the collapse-test check below asserts nothing`);
  const collapseTest = collapseBody.split(/\.\s+/).find((sentence) => designDocs.every((doc) => new RegExp(`\\b${doc}\\b`).test(sentence)));
  assert.ok(collapseTest, `${citation} must state one collapse test naming every design document [${designDocs.join(', ')}] - resume and plan decide from it, so a dropped document resumes a collapsed sprint into design-promote`);
  const condition = collapseTest.slice(collapseTest.lastIndexOf(':') + 1);
  assert.ok(!condition.includes('skipped_phases'), `the collapse test's condition in ${citation} must not read skipped_phases - that array is a historical record, so a stale entry left by a rollback would pass a real, interrupted promotion as collapsed (COR-2)`);
  assert.ok(!condition.includes('skip_design_phases'), `sprint-013 AC-14: the collapse test's condition in ${citation} is documents-only - the removed setting may survive only as a legacy state field the rule ignores`);

  const promoted = jsonOf('.asd/workflows/asd-phase-plan.md', 'Entry').requires.find((item) => item.includes(`sprint-lifecycle.md '${collapseLabel}'`));
  assert.ok(promoted, `asd-phase-plan.md preconditions must accept the collapse test by citing ${citation} - the collapse promotes nothing, so without it plan ABORTs on the state audit just wrote`);
  assert.ok(!promoted.includes('skipped_phases'), 'asd-phase-plan.md must not accept a design-promote recorded in skipped_phases - a stale skip entry left by a rollback would let plan run on unpromoted docs (COR-2)');
  const planRequires = /`plan` requires ([^;]+);/.exec(readRepoFile('.asd/rules/checkpoints.md'));
  assert.ok(planRequires, 'checkpoints.md must keep its "`plan` requires ...;" precondition clause');
  assert.ok(/\bcollapse\b/.test(planRequires[1]) && !planRequires[1].includes('skip_design_phases'), "checkpoints.md's plan precondition must accept the design-block collapse, not a removed setting - it is the chain whose miss emits ABORT");

  const resume = /### Step 2B[\s\S]*?\n### /.exec(readRepoFile('.asd/skills/asd-sprint/SKILL.md'));
  assert.ok(resume, 'asd-sprint SKILL.md must keep its "### Step 2B" resume flow');
  const successor = resume[0].split('\n').find((line) => line.includes(`phase="${landed[1]}"`));
  assert.ok(successor && successor.includes(citation) && successor.includes('`plan`'), `the asd-sprint resume flow must dispatch \`plan\` for phase="${landed[1]}" under the collapse test cited as ${citation} - re-entering phase as written would load asd-phase-${landed[1]} after the skip, which AC-3 forbids`);
  assert.ok(!successor.includes('skipped_phases'), `the asd-sprint resume exception for phase="${landed[1]}" must not read skipped_phases - a stale skip entry left by a rollback would skip a real, interrupted promotion (COR-2)`);
});

test('AC-6/sprint-010 AC-6a: review-policy.md states the bounded one-transcription enforcement branch and keeps an interrupted dispatch out of it; both *-review workflows cite that branch and still route an interrupted dispatch to reject-and-re-dispatch', () => {
  const policy = fs.readFileSync(path.join(REPO_ROOT, '.asd/rules/review-policy.md'), 'utf8');
  assert.ok(policy.includes('is re-dispatched fresh in the same iteration'), 'review-policy.md must state the re-dispatch outcome for an interrupted reviewer - never a skip, never an APPROVE');
  assert.ok(policy.includes('Interrupted attempts: <count> (<cause>)'), 'review-policy.md must state the durable per-file record an interrupted dispatch leaves on the written review file');

  assert.ok(policy.includes('A first failure earns one transcription'), 'sprint-010 AC-6a: the enforcement paragraph must split by failure class - a ledger resolving every row in the wrong shape costs a whole re-dispatch under a single reject rule, which is the friction F-6 recorded');
  assert.ok(policy.includes('never runs twice on one return'), 'the transcription must be bounded at one attempt, or a workflow can iterate on a reviewer\'s return until it passes - re-encoding the gate away rather than through');
  assert.ok(policy.includes('Transcription never supplies a status, predicate or finding id the return did not carry'), 'the branch is only safe while it re-encodes evidence the reviewer actually returned; supplying a missing status is the workflow forging the coverage the ledger exists to prove');
  assert.ok(policy.includes('never the transcription branch, which has no returned ledger to re-encode'), 'AC-6a: an interrupted dispatch returns no ledger at all, so it must stay on the reject path - routed into transcription, a dispatch that produced nothing would be re-encoded into a verdict');

  const escalation = policy.split('\n').find((line) => line.startsWith('**Escalation.**'));
  assert.ok(escalation && escalation.includes('second consecutive interruption') && escalation.includes('request') && /never split or narrowed/.test(escalation), 'sprint-017 AC-5 (D7): with no split to fall back on, a reviewer interrupted twice in a row on one manifest must escalate to the user, and the manifest must never be split or narrowed');

  const citation = 'is the sole SSoT for the durable record, the escalation and the correlated branch';
  const reDispatchPhrase = 'takes the same reject-and-re-dispatch-fresh path as a failed validation above';
  for (const file of ['asd-phase-design-review.md', 'asd-phase-impl-review.md']) {
    const workflow = fs.readFileSync(path.join(REPO_ROOT, `.asd/workflows/${file}`), 'utf8');
    assert.ok(workflow.includes(citation), `${file} must cite review-policy.md as sole SSoT for the interrupted-dispatch contract, including the durable record and the escalation, rather than restating it`);
    const interrupted = workflow.split('\n').find((line) => line.trimStart().startsWith('- Interrupted dispatch'));
    assert.ok(interrupted && interrupted.includes('second consecutive interruption') && interrupted.includes('never a split'), `sprint-017 AC-5: ${file}'s interrupted bullet must bind the twice-interrupted escalation and exclude a split - the old acting site re-split the manifest`);
    assert.ok(workflow.includes(reDispatchPhrase), `${file} must route an interrupted dispatch (no verdict token, no ledger) through the same reject-and-re-dispatch-fresh handling as a failed ledger validation - a future edit dropping this from one workflow while review-policy.md still claims it must fail here`);
    const persistStep = workflow.split('\n').find((line) => line.includes('persist-review --phase'));
    assert.ok(persistStep && /\bone transcription\b/.test(persistStep) && persistStep.includes('`review-policy.md` "Coverage ledger" enforcement'), `${file} is the acting site for AC-6a: the validation step must carry the transcription branch and cite its owner, or the rule's second case exists in prose and never in any workflow that could perform it`);
    assert.ok(workflow.includes('never that step\'s transcription branch'), `${file} must exclude an interrupted dispatch from transcription at the branch itself - the exclusion holds only where the two paths are adjacent`);
  }
});

test('AC-15: .asd/sync.js and .asd/skills/asd-update/update.js carry no non-Latin-script text - workflow infrastructure is English always (language-policy.md)', () => {
  const nonLatinScript = /[Ͱ-ϿЀ-ӿ֐-׿؀-ۿऀ-ॿ฀-๿぀-ヿ㐀-䶿一-鿿가-힯]/;
  for (const rel of ['.asd/sync.js', '.asd/skills/asd-update/update.js']) {
    const content = fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');
    const offender = content.match(nonLatinScript);
    assert.strictEqual(offender, null, `${rel} must contain no non-Latin-script character (found "${offender && offender[0]}") - this round removed the Russian comments quoting a project plan document (AC-15); a future re-introduction must fail here, not wait for direct read`);
  }
});

test('AC-13b/sprint-010 AC-3/sprint-019 AC-14: git-strategy.md "Commit before review" names every agent-memory write whose author cannot commit it - the reviewer\'s and a concurrent co-author\'s - and the acting sites are the review-file commit (memory written while reviewing) and impl\'s memory-fix routing', () => {
  const bookkeeping = readRepoFile('.asd/rules/git-strategy.md').split('\n').find((line) => line.includes('The main orchestrator commits its own bookkeeping'));
  assert.ok(bookkeeping, 'git-strategy.md must still enumerate the bookkeeping the orchestrator commits - it is the sole home of commit ownership');
  assert.ok(/agent-memory writes/.test(bookkeeping), 'AC-13b: the memory class must be named in the list the committer reads. Stated only where the reviewer reads it, the write never reaches a commit and the change-surface rule never sees it - the exact one-sided obligation this sprint exists to close');
  assert.ok(bookkeeping.includes('a reviewer holds no commit tool'), 'the reason the orchestrator commits a file it did not author must stand beside the obligation: the same sentence otherwise obliges every dispatched agent to commit its own paths, which a read-only reviewer cannot do');
  assert.ok(bookkeeping.includes('`review-policy.md` "Change-surface rule"'), 'the entry must cite the rule that puts agent memory in the surface, or it reads as an arbitrary extra file and gets dropped by the next editor');

  assert.ok(bookkeeping.includes('concurrent co-author'), 'sprint-010 AC-3: the reviewer carve-out covers a reviewer holding no commit tool; it does not reach an author who HAS one but cannot stage a file a concurrent co-author holds mid-edit. Unnamed, that file is committed by nobody and never reaches the reviewed diff - the same one-sided obligation AC-13b closed for reviewers');
  assert.ok(bookkeeping.includes('`artifact-layout.md` "Agent memory"'), 'the co-author case must cite the file that defines when two agents share one memory file, or "concurrent co-author" is a condition with no definition an agent can evaluate');
  assert.ok(bookkeeping.split(/\.\s/).some((sentence) => /agent-memory writes/.test(sentence) && /\bauthored\b/.test(sentence) && /\bcommits them\b/.test(sentence)), "sprint-012 AC-7: the orchestrator clause names only a memory write whose author cannot commit it, so a dispatched agent holding a commit tool must be told its own memory writes are paths it authored and commits - otherwise each side reads the other as owner and the write reaches no commit (011 F-1)");

  const memoryOwner = readRepoFile('.asd/rules/artifact-layout.md');
  assert.ok(memoryOwner.includes('co-authorship arises only between concurrent dispatches of the same agent'), 'sprint-010 AC-3: artifact-layout.md "Agent memory" defines memory as per-agent, so it must also say when two agents can hold one file - otherwise the collision the commit rule now handles has no stated trigger');

  const reachability = readRepoFile('.asd/rules/review-policy.md');
  assert.ok(reachability.includes('`git-strategy.md` "Commit before review", which owns that bookkeeping'), 'review-policy.md states the obligation but must hand the bookkeeping to its owner rather than keeping a second copy of it');
  assert.ok(/concurrent co-author holds[^\n]*the same rule assigns it/.test(reachability), 'sprint-010 AC-3: "Diff reachability" is where the ownerless-file class is enumerated, so the co-author case belongs in that enumeration as a pointer - a class named only in git-strategy.md is invisible where reviewers and workflows read the reachability rule');

  for (const rel of ['.asd/workflows/asd-phase-impl-review.md', '.asd/workflows/asd-phase-design-review.md']) {
    const writeStep = readRepoFile(rel).split('\n').find((line) => line.includes('the commit carrying it also carries any agent memory that reviewer authored'));
    assert.ok(writeStep, `${rel} must still carry the review-file write step`);
    const carried = writeStep.slice(writeStep.indexOf('the commit carrying it'));
    assert.ok(/agent memory/.test(carried) && carried.includes('`git-strategy.md` "Commit before review"'), `sprint-019 AC-14 (iter-01 answer b): ${rel}: on Claude \`memory: project\` serves a reviewer Write, so memory it writes while reviewing is committed with its review file - the write step must say its commit carries that memory and point at the bookkeeping rule, or the write reaches no reviewed diff`);
  }

  const impl = canonText('.asd/workflows/asd-phase-impl.md');
  const reviewFix = stepOf(impl, 3).split('\n').find((line) => line.includes('**review-fix**')) || '';
  assert.ok(reviewFix && !reviewFix.includes('.claude/agent-memory/<owner>/'), 'sprint-027 D1: a memory finding is fixed in the phase that found it, so impl review-fix mode no longer routes one - its home is review-policy.md "Memory-fix dispatch"');
  const indexCommit = stepOf(impl, 7).split(/;\s/).find((clause) => clause.includes('`memory-check` hit')) || '';
  assert.ok(indexCommit.includes('memory-fix dispatch') && indexCommit.includes('`review-policy.md` "Memory-fix dispatch"'), 'sprint-027 D1/AC-14: impl step 7 commits the MEMORY.md index lines, so a memory-check hit on that commit meets its owner there - it must route to the memory-fix dispatch its review-policy.md home defines');
  assert.ok(stepOf(impl, 9).split('\n').some((line) => line.includes('the round\'s diff') && line.includes('memory-fix dispatch')), 'sprint-019 AC-14: step 9\'s authorised-paths gate must admit the memory file the orchestrator applied, or the memory-fix round fails its own completion gate');
});

test('AC-4/AC-11/AC-14: review-policy.md carries the correlated-interruption branch, the late-duplicate-return evidence exception and the verify-before-applying obligation, and asd-phase-impl.md cites the last rather than restating it', () => {
  const policy = readRepoFile('.asd/rules/review-policy.md');

  assert.ok(policy.includes('**Correlated interruption.**'), 'AC-4: the interrupted-dispatch contract must carry a correlated-failure branch');
  assert.ok(policy.includes('iteration <id> interrupted (<cause>), all dispatches'), 'the iteration-level event needs its own literal log line, since a resume rebuilds the per-iteration count from those entries - keyed by the iteration id, which in impl-review names the wave (sprint-017 D4)');
  assert.ok(/raises no reviewer.s attempt count/.test(policy), 'the whole point of the branch is that one session-wide cause must not arm the twice-interrupted escalation once per reviewer');

  assert.ok(policy.includes('**Late duplicate return.**'), 'AC-14: a late-returning replaced dispatch needs a stated disposal');
  assert.ok(policy.includes('<reviewer>.late.md'), 'the admitted late return needs a named artefact home, or the evidence has nowhere to land');
  const layout = readRepoFile('.asd/rules/artifact-layout.md');
  for (const [phase, dir] of [['design', 'design/iter-NN'], ['impl', 'impl/wave-<K>/iter-NN']]) {
    const row = layout.split('\n').find((line) => line.includes(`${dir}/<reviewer>.md`));
    assert.ok(row && row.includes('<reviewer>.late.md'), `artifact-layout.md's ${phase} reviews row must carry the artefact name review-policy.md mandates: that path map is exhaustive ("A sprint folder holds **only** the artifacts named above"), so a late-return file it omits is one the orchestrator is told to write and a Documentation reviewer is told to flag as stray`);
  }
  const policyReach = policy.split('\n').find((line) => line.includes('**Late duplicate return**') && line.includes('holds for any replaced dispatch'));
  assert.ok(policyReach && policyReach.includes('External Review included'), 'review-policy.md scopes the whole section to the internal reviewers, so the late-duplicate branch only reaches a replaced External Review dispatch while this carve-out stays attached to it - it is the SSoT the two workflow mirrors below are checked against, never a second copy of the reach');
  assert.ok(/^Applies to [^,.]*\binternal reviewers?\b/.test(policyReach) && policyReach.includes('except where a branch states its own reach'), 'the section default plus its delegation clause are what make every acting bullet below load-bearing: a branch silent on reach is not unscoped, it inherits the internal-reviewers default - so a bullet that drops its own reach is wrong rather than merely vague');
  const importedWhole = readRepoFile('.asd/rules/external-review.md').split('\n').find((line) => line.includes('`review-policy.md` "Interrupted dispatch"') && line.includes('imported here whole'));
  assert.ok(importedWhole, 'external-review.md must hand a non-outcome to review-policy.md "Interrupted dispatch" as a WHOLE import: that import is the only thing placing External Review inside a branch whose section default is the 4 internal reviewers, so it is the source the two interrupted-bullet mirrors below are derived from - narrow it and their reach becomes an unsourced claim (the AC-8 test checks only that the boundary is named, never that the import is whole)');
  for (const [dir, rel] of [['design/iter-NN', '.asd/workflows/asd-phase-design-review.md'], ['impl/<id>', '.asd/workflows/asd-phase-impl-review.md']]) {
    const reviewFlow = readRepoFile(rel);
    const lateLine = reviewFlow.split('\n').find((line) => line.includes('per `review-policy.md` "Late duplicate return" (sole SSoT'));
    assert.ok(lateLine, `${rel} must bind the branch at the step that records verdicts and cite the rule as its sole home: review-policy.md names the phase workflow, never the returning agent, as the actor, so a workflow that never mentions it is an obligation with no acting site`);
    assert.ok(lateLine.includes('External Review included'), `${rel}: the acting bullet must state review-policy.md's reach carve-out on the same line as its citation. Reach is delegated to each branch and never inherited from the enclosing step header, and the section default behind that delegation is the 4 internal reviewers, so a bullet silent on reach discards precisely the late External Review the branch exists to admit (iteration 3 finding: at that point the header itself claimed "internal reviewers only" and the silent bullet inherited it outright). Line-scoped on purpose: a carve-out parked elsewhere in the file satisfies a file-level check while the acting site stays narrow`);
    const artefacts = jsonOf(rel, 'Exit').writes.join('\n');
    assert.ok(artefacts && artefacts.includes(`<sprint>/reviews/${dir}/<reviewer>.late.md`), `${rel} must name the late-return file in its Artefacts produced list - that list is what the orchestrator writes from, and an artefact a rule mandates but no workflow declares is one nobody ever produces`);
    const interruptedLine = reviewFlow.split('\n').find((line) => line.trimStart().startsWith('- Interrupted dispatch'));
    assert.ok(interruptedLine, `${rel}: the interrupted branch must be written out as its own bullet at the acting step - review-policy.md delegates reach to each branch, so a branch that is not written out at the acting step has its reach stated nowhere the orchestrator reads`);
    assert.ok(interruptedLine.includes('External Review included'), `${rel}: the interrupted bullet must carry its own reach on its own line, for the same reason the late-duplicate bullet does. Re-narrowed to the section default, it tells the orchestrator NOT to re-dispatch a cut-short External Review dispatch and not to log the attempt, and step 8/9 then blocks on an absent \`external\` key with nothing in decisions-log to explain it`);
    assert.ok(interruptedLine.includes('`external-review.md` "Outcome contract"'), `${rel}: the reach and the rule it is derived from must be one sentence - external-review.md imports "Interrupted dispatch" whole, and a wider reach asserted with no citation back to that import reads as contradicting the section default and gets edited out`);
  }
  assert.ok(policy.includes('more severe of the two tokens'), 'the recorded verdict must move to the more severe token, never to whichever returned last');
  assert.ok(policy.includes('any APPROVE latch for that reviewer cleared'), 'an admitted late return must clear that reviewer\'s latch, or it stays dispatch-skipped on the strength of an APPROVE its own admitted evidence just overturned');
  const lifecycle = readRepoFile('.asd/rules/sprint-lifecycle.md');
  const latchRoute = lifecycle.split('\n').find((line) => line.includes('clearing route') && line.includes('`review-policy.md` "Late duplicate return"'));
  assert.ok(latchRoute, 'sprint-lifecycle.md "APPROVE latch" is the sole home of latch persistence and claims to name EVERY route that clears it, so the late-return route must appear there - matched by its citation, never by its ordinal, which this sprint already reworded once ("A THIRD" -> "A further")');
  assert.ok(/clears that reviewer.s latch, that one key only/.test(latchRoute), 'the route must state its blast radius: clearing more than the one key would silently re-dispatch reviewers whose verdicts nothing contradicted');
  assert.ok(/late APPROVE never displaces a recorded CONCERNS\/FAIL/.test(policy), 'the exception is evidence-only and one-directional - without this the branch becomes a way to launder a FAIL into an APPROVE');

  assert.ok(policy.includes('**Verify before applying.**'), 'AC-11: a reviewer\'s proposed fix must be verified against source before it is applied');
  assert.ok(policy.includes('An equivalent correct fix stays permitted'), 'verification must not narrow the existing autofix latitude');
  const workflow = readRepoFile('.asd/workflows/asd-phase-impl.md');
  assert.ok(sectionOf('.asd/workflows/asd-phase-impl.md', 'Rules').includes('applying `review-policy.md` "Verify before applying"'), 'the impl side of AC-11 must cite the rule at the point the dev reads its fix instruction; a rule no dispatched agent reads is the failure mode this sprint exists to fix');
  const verify = sectionOf('.asd/rules/review-policy.md', 'Autofix vs escalation').split('\n').find((line) => line.startsWith('**Verify before applying.**'));
  assert.ok(verify && /non-binding/.test(verify),'sprint-012 AC-8: the suggested fix must be non-binding at its home, so a creator may resolve the finding another way without every dispatch payload having to grant that');
  const reviewFixPayload = workflow.split('\n').find((line) => line.includes('review-fix: grouped finding list'));
  assert.ok(reviewFixPayload && !reviewFixPayload.includes('suggested fix'), 'sprint-012 AC-8: the review-fix payload must no longer hand the dev a suggested fix as a payload field - carried there, it reads as the instruction the rule just made non-binding');
  assert.ok(!readRepoFile('.asd/workflows/asd-phase-design-review.md').includes('(no escalation needed)'), 'sprint-012 AC-8: the design-review autofix bullet must cite "Autofix vs escalation" instead of restating a latitude the rule now owns');
});

test('AC-8/sprint-010 AC-4/sprint-014 AC-1/sprint-017 AC-5: external-review.md "Outcome contract" is the sole home of what a dispatched External Review may return - a verdict or the preflight-only availability skip, never a partial - an availability skip reaches the friction log as well as the decisions log, review-policy.md hands the whole question to it, and the agent, report template, latch rule and both review workflows carry the outcome literals the contract defines', () => {
  const external = readRepoFile('.asd/rules/external-review.md');
  assert.ok(external.includes('## Outcome contract'), 'external-review.md must carry the outcome contract as its own named section, since review-policy.md and the agent both cite it by name');
  assert.ok(/awaits the wrapped CLI inside its own dispatch and never backgrounds it/.test(external), 'F-8 was a dispatch that returned while its CLI was still running - the await obligation is the fix');
  assert.ok(external.includes('is not permitted and is not a verdict'), 'an empty return must be named as none of the outcomes, or it stays an undefined extra state');
  assert.ok(external.includes('"Interrupted dispatch"'), 'the contract must name where a non-outcome is disposed, rather than leaving the boundary with review-policy.md a hole');
  assert.ok(external.includes('a precondition missing before any invocation (prompt template absent) aborts the dispatch instead'), 'the outcome contract is scoped to a dispatch that reached the invocation; drop this carve-out and a missing prompt template returns an availability skip, which passes a review gate on an artefact that was never reviewed - the F-8 class itself');

  const skipBullet = external.split('\n').find((line) => line.includes('APPROVE (skipped: external review unavailable: <specific status>)`; the dispatching workflow persists'));
  assert.ok(skipBullet, 'external-review.md must state what the workflow does with an availability skip on the same bullet that defines the skip');
  assert.ok(/friction entry/.test(skipBullet) && skipBullet.includes('`sprint-lifecycle.md` "Friction log"'), 'sprint-010 AC-4: a skipped External Review is a review that did not happen, so it must reach the friction log as well as the decisions log - recorded nowhere durable, the retro cannot see that a required reviewer never ran. Keyed to the same `sprint-lifecycle.md` "Friction log" citation every phase workflow carries, so the writer mechanism stays stated once');

  const contract = sectionOf('.asd/rules/external-review.md', 'Outcome contract');
  const outcomes = contract.split('\n').filter((line) => /^- \*\*[a-z ]+\*\* — /.test(line)).map((line) => /^- \*\*([a-z ]+)\*\*/.exec(line)[1]);
  assert.deepStrictEqual(outcomes, ['verdict', 'availability skip'], 'sprint-017 AC-5: the contract must define exactly two outcomes - the partial went with External Review\'s file batches');
  const interrupted = /`(external review interrupted: [^`]+)`/.exec(contract);
  assert.ok(interrupted, 'sprint-014 AC-1: the contract must define the interrupted return as a literal, the shape every other site below is checked against');
  assert.ok(/one wrapped-CLI invocation over its whole `files\[\]`, retried once — never batched or split/.test(contract), 'sprint-017 AC-5 (D7): one dispatch is one invocation over the whole list - a batch boundary is exactly what used to produce the partial outcome');
  assert.ok(!contract.includes('**any** inability to complete'), 'sprint-014 AC-1: the skip is narrowed to a non-ready preflight or negative cache - a post-invocation failure returning the skip passes the gate on a review that did not happen');

  const policy = readRepoFile('.asd/rules/review-policy.md');
  assert.ok(!policy.includes("External Review's unavailability path is"), 'the old scoping line handed off only the unavailability path, which is what left an empty return undisposed on both sides');
  assert.ok(policy.includes('`external-review.md` "Outcome contract"'), 'review-policy.md must point at the outcome contract as a whole');
  const grammarLink = /external-review\.md`? (?:"|§ )Outcome contract/;
  assert.ok(sectionOf('.asd/rules/review-policy.md', 'Gate Verdict Format').split('\n').some((line) => line.startsWith('- ') && grammarLink.test(line)), 'EXT-5: the review-policy.md verdict grammar must link the skip carve-out, or a literal grammar match rejects a valid External Review return');
  assert.ok(readRepoFile('README.md').split('\n').some((line) => line.includes('[REVIEW-<phase>-<reviewer>]') && grammarLink.test(line)), 'EXT-5: the README verdict-token grammar mirror must link the skip carve-out on the line that states the grammar');
  const stalemateInput = sectionOf('.asd/rules/external-review.md', 'Stalemate detection').split('\n').find((line) => /\bskip\b/.test(line));
  assert.ok(stalemateInput && /phase skill/i.test(stalemateInput), 'TST-1-1: "Stalemate detection" must have the phase skill exclude skip iterations from the finding set it supplies - compared against a skip, a real stalemate is missed');
  for (const rel of ['.asd/workflows/asd-phase-impl-review.md', '.asd/workflows/asd-phase-design-review.md']) {
    assert.ok(canonText(rel).includes('`external-review.md` "Stalemate detection"'), `TST-1-1: ${rel} supplies the stalemate finding set, so it must cite external-review.md "Stalemate detection"`);
  }

  const agent = sync.readNormalized(path.join(REPO_ROOT, '.asd/agents/asd-external-review.md'));
  const agentTools = jsonOf('.asd/agents/asd-external-review.md', 'Tools');
  assert.ok(agentTools.run.some((item) => item.includes('{{wraps_cli}}') && item.includes('in the foreground, awaited inside this dispatch')) && agentTools.deny.some((item) => item.startsWith('backgrounding, detaching or polling the run, or returning while it still runs')), 'the never-background ban must be stated on the placeholder token both views render');
  const agentEscalation = jsonOf('.asd/agents/asd-external-review.md', 'Escalation');
  const outcomeDont = sectionOf('.asd/agents/asd-external-review.md', 'Rules').split('\n').find((line) => line.startsWith('- never: return anything but') && line.includes('`external-review.md` "Outcome contract"'));
  assert.ok(outcomeDont, 'the agent must carry the outcome contract as a never rule citing its home, not only the rule doc it may not read');
  assert.ok(outcomeDont.includes(interrupted[1]), `the agent's outcome rule must carry \`${interrupted[1]}\` exactly as external-review.md defines it, or that return parses as prose`);
  assert.ok(agentEscalation.some((row) => row.signal === 'APPROVE (skipped: external review unavailable: <specific status>)'), 'the agent\'s Escalation must carry the availability skip literal exactly as external-review.md defines it, or that return parses as prose');
  const abortSignal = agentEscalation.find((row) => row.signal === 'ABORT');
  assert.ok(abortSignal && abortSignal.when.includes('before any invocation'), 'the acting half of the rule\'s carve-out: the agent\'s ABORT must be scoped to the pre-invocation window, or the agent emits an outcome the contract forbids');
  const interruptedRow = agentEscalation.find((row) => row.signal === interrupted[1]);
  assert.ok(interruptedRow && interruptedRow.note.includes('external-review.md \'Outcome contract\'') && interruptedRow.when.includes('after its one retry'), 'sprint-014 AC-1: the post-invocation half must stay an Escalation row, return the interrupted form rather than the availability skip, and cite the contract as its home');

  const partialToken = 'APPROVE (partial:';
  const partialSites = [...canonMarkdownFiles(), 'README.md'].flatMap((rel) => canonText(rel).split('\n').filter((line) => line.includes(partialToken)).map((line) => `${rel}: ${line}`));
  assert.ok(partialSites.length > 0 && partialSites.every((site) => site.startsWith('.asd/rules/sprint-lifecycle.md: ') && /\blegacy\b/.test(site)), `sprint-017 AC-5/D7: no current-version site may emit, render or parse the partial outcome; the one survivor is sprint-lifecycle.md "State recovery"'s legacy satisfied value, an in-flight sprint may still hold. Got: ${JSON.stringify(partialSites)}`);

  const carried = /as its `([^`]+)` line/.exec(sectionOf('.asd/rules/external-review.md', 'Iteration semantics'));
  assert.ok(carried, 'external-review.md "Iteration semantics" must name the line a skipped iteration records its unreviewed files on');
  assert.ok(canonText('.asd/templates/external-review/t_review-report.md').includes(`**${carried[1]}**`), `sprint-014 AC-1: t_review-report.md must slot the \`${carried[1]}\` line the next iteration reads`);
  assert.ok(canonText('.asd/templates/external-review/t_review-report.md').includes('APPROVE (skipped: external review unavailable: <specific status>)'), "EXT-5: t_review-report.md's first-line alternatives must admit the skip token the skip's external.md carries");
  assert.ok(skipBullet.includes(`\`${carried[1]}\``) && skipBullet.includes('`files[]`'), `COR-4: the availability skip must persist a \`${carried[1]}\` line naming the files[] it never reviewed - on a skip no agent runs, so nothing else writes it and those files never reach External Review`);
  for (const [rel, step] of [['.asd/workflows/asd-phase-impl-review.md', '1b. '], ['.asd/workflows/asd-phase-design-review.md', '3a. ']]) {
    const sentences = canonText(rel).split('\n').find((line) => line.startsWith(step)).split(/(?<=\.) /);
    assert.ok(sentences.some((sentence) => sentence.includes('non-ready') && sentence.includes('`files[]`') && sentence.includes(`\`${carried[1]}\``)), `COR-4: ${rel} step ${step.slice(0, -2)} must still compute files[] on a non-ready preflight as the skip's \`${carried[1]}\` - skipped with the manifest, the skip has no list to write`);
  }
  for (const rel of ['.asd/workflows/asd-phase-impl-review.md', '.asd/workflows/asd-phase-design-review.md']) {
    assert.ok(canonText(rel).split('\n').some((line) => line.includes('`files[]`') && line.includes(`previous iteration's \`${carried[1]}\``)), `sprint-014 AC-1: ${rel} must union the previous iteration's \`${carried[1]}\` into the External Review files[] - dropped, a skip's unreviewed files are never reviewed while the skip satisfies DoD`);
  }
  const latch = sectionOf('.asd/rules/sprint-lifecycle.md', 'APPROVE latch');
  assert.ok(latch.includes('only for the bare `"APPROVE"` token') && latch.includes('never for the `"APPROVE (skipped: ...)"` form'), 'sprint-014 AC-1: the latch rule both workflows cite must keep the bare-token-only latch write that excludes the skip');
});

test('AC-15: checkpoints.md surfaces a criterion\'s running cost from artefacts the sprint already writes, and the decisions-log literal it counts is the one asd-phase-impl.md actually emits', () => {
  const checkpoints = readRepoFile('.asd/rules/checkpoints.md');
  const heading = '## Criterion cost surfacing';
  assert.strictEqual(checkpoints.split('\n').filter((line) => line.trim() === heading).length, 1, 'checkpoints.md must carry the surfacing obligation exactly once');
  for (const rel of canonMarkdownFiles()) {
    if (rel === '.asd/rules/checkpoints.md') continue;
    assert.ok(!readRepoFile(rel).includes(heading), `${rel} must not carry a second copy of the surfacing obligation - it hangs off gates checkpoints.md already owns`);
  }
  assert.ok(checkpoints.includes('no counter is stored'), 'the mechanism was accepted at the audit gate on the condition that it adds no new state; a stored counter is the thing that can drift out of sync with the artefacts');
  assert.ok(checkpoints.includes('`<sprint>/reviews/<phase>/iter-NN/`'), 'the iterations-charged unit must name the artefact it is derived from');
  assert.ok(checkpoints.includes('`<sprint>/reviews/impl/wave-*/iter-NN/`') && checkpoints.includes('legacy `<sprint>/reviews/impl/iter-NN/`'), 'sprint-017 AC-6 (D10): impl-review iterations live in per-wave dirs, so the count must glob them and still read the legacy dirs - keyed on the old path alone it reads zero for every wave-era iteration');

  const matchedTail = 'for <id>: findings resolved';
  assert.ok(checkpoints.includes(`matched on the stable tail \`${matchedTail}\``), 'the fix-rounds-charged unit must state the literal it matches decisions-log entries on, or the count is unreproducible');
  assert.ok(checkpoints.includes('however the mode is named'), 'the tail is mode-agnostic on purpose: the orchestrator really writes "impl review-fix for <id>: findings resolved", which a match keyed to the mode name does not select - that miss is what made the previous whole-heading literal read zero on real data');
  assert.ok(checkpoints.includes('`wave-<K>/iter-NN`, legacy `iter-NN`'), 'sprint-017 D4: the tail matches on the iteration id, so checkpoints.md must name both id forms it resolves');

  const citedStep = /`asd-phase-impl\.md` step (\d+) is the emitting SSoT/.exec(checkpoints);
  assert.ok(citedStep, 'checkpoints.md must cite the workflow step that emits the entry it counts; without a named emitter the tail is a literal accountable to nobody');
  const workflowLines = readRepoFile('.asd/workflows/asd-phase-impl.md').split('\n');
  const emitted = workflowLines.map((line) => /append decisions-log entry "([^"]*<id>[^"]*)"/.exec(line)).filter(Boolean);
  assert.strictEqual(emitted.length, 1, 'exactly one place in asd-phase-impl.md may emit the per-iteration fix-round entry - two emitters means two wordings, and the counter can only match one');
  assert.ok(emitted[0][1].endsWith(matchedTail), `the entry asd-phase-impl.md emits ("${emitted[0][1]}") must END WITH the tail checkpoints.md matches on ("${matchedTail}"): the property is that what the emitter writes is selected by what the counter matches, so a rewording on either side that breaks the containment silently drops the count to zero and no gate notices`);
  const emitIndex = workflowLines.findIndex((line) => line.includes(`append decisions-log entry "${emitted[0][1]}"`));
  const owningStep = workflowLines.slice(0, emitIndex + 1).reverse().find((line) => /^\d+[a-z]?\. /.test(line));
  assert.ok(owningStep && owningStep.startsWith(`${citedStep[1]}. `), `checkpoints.md cites step ${citedStep[1]} as the emitting SSoT, so the emitting line must sit inside that step - a renumbered workflow leaves the citation pointing at a step that emits nothing`);
});

test('AC-10: asd-phase-impl.md builds fix modes as one ordered chain with no parallelism, while the initial dispatch step keeps its own parallel-where-independent wording', () => {
  const lines = readRepoFile('.asd/workflows/asd-phase-impl.md').split('\n');
  const fixModes = lines.find((line) => line.trim().startsWith('- fix modes'));
  assert.ok(fixModes, 'the execution-graph step must still carry a fix-modes bullet');
  assert.ok(fixModes.includes('one ordered chain, never a concurrent set'), 'sprint 008\'s two parallel fix rounds each cost a review iteration; the graph must build fix tasks sequentially');
  for (const removed of ['parallel where independent', 'sequential where they collide', 'parallelisable']) {
    assert.ok(!fixModes.includes(removed), `the fix-modes bullet must authorize no parallelism: "${removed}" is the wording AC-10 removes, and it reading as history rather than instruction is not enough`);
  }
  assert.ok(fixModes.includes('dispatched only after the dev chain completes'), 'one ordered chain per half is not enough: the two halves must also be ordered against each other, or a tester chain runs while the dev chain is still editing the shared worktree and tests a tree nobody committed');
  assert.ok(fixModes.includes('exactly one agent is in flight across the whole round'), 'the round-level invariant is the reviewable claim; without it "one ordered chain" reads as scoped to each chain separately, which is exactly the reading sprint 009 iter-01 ran on');

  const dispatchLine = lines.find((line) => line.includes('initial mode: waves ascending, every task of a wave dispatched concurrently'));
  assert.ok(dispatchLine, 'the dispatch step\'s own parallelism, shared with initial mode, must survive - AC-10 narrows fix modes only, and losing this line would serialize the whole phase');
  assert.ok(dispatchLine.includes("a fix mode: step 5's single ordered chain"), 'the surviving parallelism must be scoped where it is stated: unscoped, the dispatch step reads as authorizing in a fix mode precisely what step 5 forbids, and a reader reaching step 6 first follows it');
});

test('sprint-010 AC-1: the wave declaration is defined once in sprint-lifecycle.md "Plan file format", written by asd-phase-plan.md, dispatched from by asd-phase-impl.md steps 5-6, and slotted in t_plan.md', () => {
  const lifecycle = readRepoFile('.asd/rules/sprint-lifecycle.md');
  const declaration = lifecycle.split('\n').find((line) => line.startsWith('**Wave declaration**'));
  assert.ok(declaration, 'AC-1/G-2: `wave` was vocabulary no canon file defined. It needs exactly one definition, in the section that owns the plan format, before either workflow can cite it');
  assert.ok(declaration.includes('is alone in its wave'), 'AC-1 is the ordering rule itself: a task changing the dispatch or commit contract runs ahead of everything dispatched under it, alone. Without "alone", a contract change may share a wave with a task dispatched under the contract it is changing - the F-1 failure this criterion exists to prevent');
  assert.ok(declaration.includes('Every Task appears in exactly one wave'), 'the partition property is what makes the table a schedule: a task in no wave is never dispatched, a task in two is dispatched twice');
  assert.ok(declaration.includes('`asd-phase-impl.md` steps 5-6'), 'the definition must name its consumer, since the rule binds only where impl actually schedules');

  const planWorkflow = readRepoFile('.asd/workflows/asd-phase-plan.md');
  assert.ok(planWorkflow.includes('Wave declaration') && planWorkflow.includes('write the wave table into `## Dependencies`'), 'AC-1/G-1: the plan phase had no step that computed any ordering, so the criterion had nothing to attach to. The waves must be assigned where the plan is authored - impl cannot invent an ordering the plan never declared');
  assert.ok(planWorkflow.includes('`sprint-lifecycle.md` "Plan file format"'), 'the plan step must cite the definition rather than restate the isolation rule');

  const implLines = readRepoFile('.asd/workflows/asd-phase-impl.md').split('\n');
  const graphLine = implLines.find((line) => line.trim().startsWith('- initial —'));
  assert.ok(graphLine && graphLine.includes("the plan's wave table is the graph"), 'AC-1: impl must schedule from the declared waves. Re-deriving its own topological sort discards the isolation rule silently - the plan would say "alone in wave 2" and impl would dispatch it beside anything it shares no dependency line with');
  assert.ok(graphLine.includes('never re-derived from the dependency lines'), 'the dependency lines survive as explanation; saying so is what keeps a reader from treating them as a second, competing schedule');
  assert.ok(graphLine.includes('fall back'), 'a plan authored before this rule carries no table, so the old topological sort must remain reachable as the stated fallback - an in-flight sprint would otherwise be unschedulable');
  const dispatchLine = implLines.find((line) => line.includes('the next wave opening only once all their signals are in'));
  assert.ok(dispatchLine, 'AC-1: the barrier between waves is the enforcement. Waves that overlap make isolation nominal - a contract-changing task still in flight while the next wave dispatches is the same failure as sharing its wave');

  const template = readRepoFile('.asd/templates/t_plan.md');
  assert.ok(template.includes('| Wave | Tasks |'), 'AC-1/G-1: the section was optional and free-form, and an ordering rule cannot be enforced from an optional section. The table needs a slot the author fills and the impl parser reads');
  assert.ok(/^- `## Dependencies` is required/m.test(template), 'the parser-critical comment block enumerates every line rule the plan parser depends on; a required section missing from that enumeration is a rule the author never sees');
});

test('sprint-010 AC-5a/AC-5b: the authorised-paths diff read is a condition of asd-phase-impl.md\'s all-modes completion gate, not of its fix-mode-only bookkeeping step, the workflow declares the git operation that gate runs on, and code-style.md §17 keeps the fail-first restore obligation the gate exists to catch', () => {
  const implLines = readRepoFile('.asd/workflows/asd-phase-impl.md').split('\n');
  const start = implLines.findIndex((line) => line.startsWith('9. **Impl completion gate**'));
  assert.ok(start >= 0, 'the completion gate must keep its step number: every other step cites it by number, and this check locates the gate that way');
  assert.ok(implLines[start].includes('(all modes)'), 'AC-5b: the gate must stay all-modes. A review-fix or test-fix round is exactly where an agent edits a path nobody assigned it, so a gate scoped to initial mode misses the rounds that need it');
  const gate = implLines.slice(start, implLines.findIndex((line, index) => index > start && /^1[0-9]\. /.test(line))).join('\n');

  const condition = 'every path it touches is one those agents were authorised to touch';
  assert.ok(gate.includes(condition), 'AC-5b/F-5: the round\'s diff must be read before committing or advancing. Unread, an unrestored mutation or a scripted edit that rewrote more than its target rides into the commit and reaches review as authored work');
  assert.ok(gate.includes('what its agents committed plus anything still uncommitted'), 'the read must span both, or the one thing it is aimed at - a mutation left on disk, never staged - is exactly what it cannot see');
  assert.ok(gate.includes('Distinct from `code-style.md` §19'), 'the two checks share a tool and differ in question: §19 lints staged CONTENT, this gate asks which PATHS moved. Unmarked, one gets deleted as a duplicate of the other');
  assert.strictEqual(readRepoFile('.asd/workflows/asd-phase-impl.md').split(condition).length - 1, 1, 'the condition must live in exactly one step. Copied into the fix-mode step as well, the two drift; moved there instead, initial mode loses the gate entirely');

  const runGrant = jsonOf('.asd/workflows/asd-phase-impl.md', 'Entry').ops.find((op) => op.startsWith('run command:'));
  assert.ok(runGrant && runGrant.includes('git diff'), 'AC-5b: the gate asks which paths moved across committed AND uncommitted work, which only git answers, so the `## Entry` ops must declare that operation. Stated at the acting site with no tool declared behind it, the gate is an obligation the phase cannot discharge');

  const tests17 = readRepoFile('.asd/rules/code-style.md').split('\n## 17. Tests')[1].split('\n## ')[0];
  assert.ok(/restored before the agent's next tool call/.test(tests17), 'AC-5a: §17 is the sole home of the fail-first restore obligation and no file mirrors it, so nothing but this assertion stands between the bullet and an economy pass reading it as procedural detail. Deleted, a mutation left on disk stops being a defect anyone can cite');
  assert.ok(/mutation left on disk is a defect/.test(tests17), 'AC-5a states the consequence separately from the instruction deliberately: without it a green suite reads as evidence that the tree is clean, which is exactly what an unrestored mutation makes it not (F-5)');
});

test('sprint-010 iter-02: each latch non-restatement declaration denies only what its own site omits - the red-full-suite invalidation keeps its rule home and both step-9 acting sites while review-policy.md stops restating it, and neither review workflow denies the mechanic it spells out', () => {
  const latchSection = readRepoFile('.asd/rules/sprint-lifecycle.md').split('## APPROVE latch')[1].split('\n## ')[0];
  assert.ok(latchSection.includes('**Red-full-suite invalidation.**'), 'sprint-lifecycle.md "APPROVE latch" is the sole home of latch persistence and claims to name every route that clears it, so the red-suite route must live here - review-policy.md just dropped its copy, which leaves this the only rule-level statement of it');
  assert.ok(/clear `reviews\.design\.latched` and every impl-review wave node's `latched` to `\{\}` sprint-wide/.test(latchSection), 'the route must state its blast radius: a red suite invalidates approvals in both review phases and every review wave, and a rule saying only "clear the latch" is satisfied by clearing one of the maps');
  assert.ok(latchSection.includes('A closed wave is never dispatched again, so this re-arms only the current (last) wave'), 'sprint-017 AC-4 (D6): clearing a closed wave\'s latch must not read as reopening it - an approved wave is never reopened');

  const policy = readRepoFile('.asd/rules/review-policy.md');
  const dod = policy.split('\n').find((line) => line.includes("impl-review's DoD has a second, non-reviewer condition"));
  assert.ok(dod, 'review-policy.md must keep the DoD half it owns - the green full suite as a second, non-reviewer DoD condition');
  assert.ok(!dod.includes('clears every APPROVE latch sprint-wide'), 'the DoD paragraph must not re-acquire the clearing rule: that copy sat two lines above a declaration that the clearing is not restated here, so the file contradicted itself and either copy could drift out of step with the acting sites');

  const implReview = readRepoFile('.asd/workflows/asd-phase-impl-review.md');
  const redBranches = implReview.split('\n').filter((line) => /^\s+- \*\*Red, (test|code) defect\*\*/.test(line));
  assert.strictEqual(redBranches.length, 2, 'step 9 must keep both red triage branches; a regex that stops matching them would make the clearing assertion below pass over an empty list');
  for (const branch of redBranches) {
    assert.ok(branch.includes('latch'), 'both step-9 red branches are acting sites for the red-full-suite invalidation - sprint-lifecycle.md calls that paragraph "the contract the full-suite step must satisfy", and now that review-policy.md no longer restates the clearing, a branch that stops performing it leaves the rule with no site that ever runs it');
  }

  const policyLatch = policy.split('\n').find((line) => line.startsWith('**APPROVE latch**'));
  assert.ok(policyLatch && policyLatch.includes('not restated here'), 'review-policy.md must keep handing the mechanism to its SSoT instead of describing it');
  assert.ok(!/not restated here\s*(,\s*)?(or|nor|and not)\b/i.test(policyLatch), 'a non-restatement declaration may speak for its own site only: both review workflows do spell the dispatch-skip mechanic out at the step that applies it (asserted below), so extending the denial across them made it false and told an editor those copies did not exist. Keyed on the denial being extended by a conjunction, not on the words "review workflow" - this bullet may legitimately name the workflows for anything else, and the extension is false whichever artefact it reaches');

  for (const rel of ['.asd/workflows/asd-phase-impl-review.md', '.asd/workflows/asd-phase-design-review.md']) {
    const body = readRepoFile(rel);
    const filter = body.split('\n').find((line) => line.includes('APPROVE latch filter first'));
    assert.ok(filter, `${rel} must keep the latch filter as the first act of its dispatch step`);
    assert.ok(filter.includes('skipped entirely this iteration'), `${rel}: the filter bullet must spell out what a latched key does at the point the orchestrator acts on it - that restatement is what keeps the absence assertion on the next line from being vacuous`);
    assert.ok(!filter.includes('not restated here'), `${rel}: this bullet restates the mechanic in the same breath, so its citation may claim sole SSoT and nothing more. A false "not restated here" reads as licence to delete the SSoT copy, which is the one an agent that never opens this workflow depends on`);

    const writeStep = body.split('\n').find((line) => line.includes('sole SSoT for the every-reviewer-gets-an-entry invariant'));
    assert.ok(writeStep, `${rel} must keep the verdict-write step's citation of the latch SSoT`);
    assert.ok(writeStep.includes("External Review's availability skip is recorded as"), `${rel}: the write step states the availability-skip form itself, being the step that writes it`);
    assert.ok(!writeStep.includes('availability-skip carve-out'), `${rel}: having just stated the availability skip, the step must not also list that carve-out among the things it declares un-restated - the same self-contradiction removed above`);
  }
});

test('sprint-010 iter-03: the clean-worktree precondition is a reciprocal pair - sprint-lifecycle.md owns the rule and names the workflow section that performs it, and that section keeps the command and the failure signal while no longer denying that it restates anything', () => {
  const home = readRepoFile('.asd/rules/sprint-lifecycle.md').split('\n').find((line) => line.includes('**Impl-review clean-worktree precondition**'));
  assert.ok(home, 'sprint-lifecycle.md must keep the clean-worktree home statement: the workflow precondition cites it as sole SSoT, so a home that is cut leaves that citation pointing at nothing while the phase still refuses to start');
  const delegated = /mechanic in `asd-phase-impl-review\.md` "([^"]+)"/.exec(home);
  assert.ok(delegated, 'the home must name the workflow section it hands the mechanic to; this test derives the acting site from that name rather than hardcoding a heading either side may rename');

  const workflow = readRepoFile('.asd/workflows/asd-phase-impl-review.md');
  const parts = workflow.split(`\n## ${delegated[1]}`);
  assert.strictEqual(parts.length, 2, `asd-phase-impl-review.md must carry exactly one "## ${delegated[1]}" section: its home delegates the mechanic to that heading by name, and a rename on one side only sends every reader to a section that does not exist`);
  const precondition = jsonOf('.asd/workflows/asd-phase-impl-review.md', delegated[1]).requires.find((item) => item.startsWith('clean worktree at phase entry'));
  assert.ok(precondition, `the clean-worktree gate must live inside "${delegated[1]}", the section its home names as the mechanic site`);
  assert.ok(precondition.includes('git status --porcelain'), 'the acting site must name the command it runs. Its home states the same trigger and timing, so this line reads as a restatement and is a standing deletion candidate for an economy pass - but it is the only executable instruction either file carries, and the home delegates it here on purpose');
  assert.ok(precondition.includes('FAILED'), 'the acting site must name the signal a dirty worktree raises: without it the gate states a trigger and no consequence, and the phase proceeds into a diff computed from commits that no reviewer can see the uncommitted half of');
  assert.ok(precondition.includes('sole SSoT'), 'the precondition must keep citing its home rather than growing into a second rule statement - that citation is what makes the split above readable as a split instead of as two rules');
  assert.ok(!precondition.includes('not restated here'), 'this bullet restates the home trigger and timing in the same breath, so its citation may claim sole SSoT and nothing more. The denial was false when written (iter-03 DOC-1a), and a false denial reads as licence to delete the home copy - the one a reader who never opens this workflow depends on');
});

test('sprint-012 AC-2/AC-4/AC-12: both review workflows emit manifests through emit-manifest and never stamp one by hand, keep a dispatched manifest immutable per review-policy.md "Coverage ledger", carry the interrupted-attempt record the "Clean-context review iteration" payload list admits, and persist External Review\'s availability skip through persist-review (sprint-020 AC-9)', () => {
  const policy = '.asd/rules/review-policy.md';
  assert.ok(/\*\*Immutability\*\*[^\n]*orchestrator[^\n]*re-stamp/.test(sectionOf(policy, 'Coverage ledger')), 'AC-2: "Coverage ledger" must make a dispatched manifest immutable to the orchestrator as well as the reviewer, and send a correction through a fresh dispatch rather than a re-stamp (010 F-2)');
  const payloadRule = sectionOf(policy, 'Clean-context review iteration').split('\n').find((line) => line.startsWith('- Reviewer payload carries only'));
  assert.ok(payloadRule && /`interrupted` set only on a re-dispatch/.test(payloadRule) && /interrupted-attempt record/.test(readRepoFile('.asd/rules/agent-protocol.md')), 'AC-4: the exhaustive reviewer payload list must admit the interrupted-attempt record, or a workflow adding it breaks the clean-context rule it cites');
  for (const [rel, phase] of [['.asd/workflows/asd-phase-impl-review.md', 'impl-review'], ['.asd/workflows/asd-phase-design-review.md', 'design-review']]) {
    const flow = sectionOf(rel, 'Steps');
    assert.ok(flow.includes(`node .asd/runtime.js emit-manifest --reviewer <name> --phase ${phase}`), `${rel}: AC-12 - manifests must come from emit-manifest for this workflow's own phase`);
    assert.ok(!canonText(rel).includes('manifest-digest --manifest <path> --write'), `${rel}: the hand-stamping instruction the emitter replaced must be gone, or a split half is still assembled and stamped by hand beside the emitted parts`);
    const validateStep = flow.split('\n').find((line) => line.includes(`node .asd/runtime.js persist-review --phase ${phase.replace(/-review$/, '')} `));
    assert.ok(validateStep && /never re-stamped/.test(validateStep) && validateStep.includes('`review-policy.md` "Coverage ledger"'), `${rel}: AC-2 - the ledger-validation step, where a failing manifest tempts a fix, must forbid the re-stamp and cite the rule; since sprint 020 that step is the persist-review run, which validates the ledger before any write`);
    assert.ok(/never re-authored by hand/.test(validateStep) && validateStep.includes('`review-policy.md` "Coverage ledger" Persistence'), `${rel}: sprint-020 AC-9 - the persist-review run is the sole write of a review file for this phase's own --phase node, so the step must say no review file is re-authored by hand and cite the Persistence rule`);
    const skipRecord = flow.split('\n').find((line) => line.includes('`"APPROVE (skipped: <reason>)"`')) || '';
    assert.ok(/`persist-review`/.test(skipRecord) && skipRecord.includes('`review-policy.md` "Coverage ledger" Persistence'), `${rel}: sprint-020 AC-9 - the step recording External Review's availability skip must persist its external.md through persist-review, citing the Persistence rule - the skip has no dispatch, so a hand-written external.md leaves no external.findings.json for the minor test-only route to read`);
    const payload = flow.split('\n').find((line) => line.startsWith('   - payloads per'));
    assert.ok(payload && /`interrupted`[^.]*record/.test(payload) && payload.includes('`review-policy.md` "Clean-context review iteration"'), `${rel}: AC-4 - a re-dispatched reviewer's payload must carry its own interrupted-attempt record, citing the list that admits it`);
  }
  const persistence = sectionOf(policy, 'Coverage ledger').split('\n').find((line) => line.startsWith('**Persistence**')) || '';
  assert.ok(persistence.split(/(?<=\.)\s+/).some((sentence) => /availability skip/.test(sentence) && sentence.includes('`external-review.md` "Detection and negative cache"')), 'sprint-020 AC-9: "Coverage ledger" Persistence must bring External Review\'s availability skip - the one outcome with no returned text - under the persist-review command, pointing at the rule that defines the skip');
  const skipBullet = sectionOf('.asd/rules/external-review.md', 'Detection and negative cache').split('\n').find((line) => line.startsWith('- Return `APPROVE (skipped:')) || '';
  assert.ok(/`persist-review`/.test(skipBullet) && skipBullet.includes('`review-policy.md` "Coverage ledger" Persistence'), 'sprint-020 AC-9: external-review.md "Detection and negative cache" tells the dispatching workflow to persist the skip, so it must route that write through persist-review and cite the Persistence rule, never have the workflow write external.md itself');
});

test('sprint-012 AC-11: the report field asd-dev.md COMPLETED carries is the literal asd-phase-impl.md collects at step 6, gates the adaptive pass on at step 10 under checkpoints.md "Gate policy", and resolves before the fix-mode finalize at step 11', () => {
  const signal = sectionOf('.asd/rules/agent-protocol.md', 'Return').split('\n').find((line) => line.startsWith('| `COMPLETED`'));
  const field = signal && (/"(flagged)"/.exec(signal) || [])[1];
  assert.ok(field, 'agent-protocol.md "Return" COMPLETED must name the report field a dev flags choices in');
  assert.ok(sectionOf('.asd/workflows/asd-phase-impl.md', 'Rules').split('\n').some((line) => line.startsWith('- must: COMPLETED') && line.includes(`\`${field}\``)), `asd-phase-impl.md "Rules" must tell the dev to emit the literal \`${field}\` the protocol defines`);
  const flow = sectionOf('.asd/workflows/asd-phase-impl.md', 'Steps');
  for (const step of ['10', '11']) {
    assert.ok(stepOf(flow, step).includes(`\`${field}\``), `asd-phase-impl.md step ${step} must read the literal \`${field}\` the dev emits - renamed on one side, a flagged choice passes the assessment unseen (011 P1)`);
  }
  const gateLine = stepOf(flow, '10').split('\n').find((line) => line.includes(`\`${field}\``));
  assert.ok(gateLine.includes('`checkpoints.md` "Gate policy"'), 'step 10 must classify a flagged choice under the gate policy that blocks an adaptive pass on an unresolved material alternative');
});

test("sprint-012 AC-14..AC-18: docs/architecture/subsystems.md is the one subsystem registry every consuming site names and only the main orchestrator fills, its reserved ids are exactly the other names in the decomposed docs/architecture/ path map, its templates exist with responsibility frontmatter, the retired mermaid registry survives only as audit's migration source, and deleting a legacy c4/ is a hard gate", () => {
  const layout = '.asd/rules/artifact-layout.md';
  const registrySection = sectionOf(layout, 'Subsystem registry');
  const [registry, subsystemFile] = [...registrySection.matchAll(/`(docs\/architecture\/[^`]+\.md)`/g)].map((match) => match[1]);
  assert.ok(registry && subsystemFile && subsystemFile.includes('<'), 'artifact-layout.md "Subsystem registry" must name the registry and its per-subsystem file form');

  const sites = [
    ['core.md Glossary "Subsystem"', sectionOf('.asd/rules/core.md', 'Glossary').split('\n').find((line) => line.startsWith('- **Subsystem**'))],
    ['asd-phase-audit.md', canonText('.asd/workflows/asd-phase-audit.md')],
    ['sprint-lifecycle.md "Design-promote phase"', sectionOf('.asd/rules/sprint-lifecycle.md', 'Design-promote phase')],
    ['asd-phase-plan.md Inputs', jsonOf('.asd/workflows/asd-phase-plan.md', 'Inputs').join('\n')],
    ['asd-phase-design-promote.md', canonText('.asd/workflows/asd-phase-design-promote.md')],
    ['t_audit.md "Subsystems map"', sectionOf('.asd/templates/t_audit.md', 'Subsystems map')],
    ['asd-init fresh step 13', stepOf(subOf(sectionOf('.asd/skills/asd-init/SKILL.md', 'Steps'), 'Fresh'), '13')],
  ];
  for (const [site, text] of sites) {
    assert.ok(text && text.includes(registry), `AC-14/AC-17: ${site} must name ${registry} - a site still naming the old registry leaves two homes for which subsystems exist`);
  }
  assert.ok(registrySection.includes('only the main orchestrator fills it') && !fs.existsSync(path.join(REPO_ROOT, '.asd/agents/asd-architect.md')), 'AC-17: audit and design-promote have the orchestrator write the registry and each subsystem file, so the rule must say it alone fills the registry and no agent definition may keep a write grant for it');

  const reservedClause = registrySection.split(/Reserved[^:]*:/)[1];
  const reserved = reservedClause ? [...reservedClause.split(/\.(?:\s|$)/)[0].matchAll(/`([^`]+)`/g)].map((match) => match[1]) : [];
  const architectureTree = (text) => {
    const lines = text.split('\n');
    const root = lines.findIndex((line) => /── architecture\/\s*$/.test(line));
    assert.ok(root !== -1, 'a folder map must keep its docs/architecture/ tree');
    const depth = lines[root].search(/[├└]/);
    const children = [];
    for (const line of lines.slice(root + 1)) {
      const at = line.search(/[├└]/);
      if (at === -1) continue;
      if (at <= depth) break;
      if (at === depth + 4) children.push(line.slice(at + 4).trim().split(/\s/)[0]);
    }
    return children;
  };
  const children = architectureTree(sectionOf(layout, 'Paths (decomposition enabled)'));
  const occupied = children.filter((entry) => !entry.startsWith('<')).map((entry) => entry.split('/')[0].replace(/\.[a-z]+$/, ''));
  assert.deepStrictEqual([...reserved].sort(), [...occupied].sort(), 'AC-14: subsystem files sit flat in docs/architecture/ beside everything else there, so the reserved ids must be exactly the names the path map already occupies - derived from the map, so a new entry reddens until it is reserved');
  assert.deepStrictEqual(architectureTree(canonText('README.md')), children, "AC-18: README.md's folder map mirrors artifact-layout.md's decomposed docs/architecture/ tree entry for entry, in order");

  const templates = [...new Set([...registrySection.matchAll(/`(t_[^`]+)`/g)].map((match) => match[1]))];
  assert.ok(templates.length >= 2, 'AC-18: "Subsystem registry" must name a template for the registry and for the subsystem file');
  for (const name of templates) {
    const rel = `.asd/templates/${name}`;
    assert.ok(fs.existsSync(path.join(REPO_ROOT, rel)), `${rel} is named as a template and must exist`);
    const front = canonText(rel).split('\n---')[0];
    assert.ok(front.startsWith('---\nresponsibility:') && ['owns:', 'excludes:', 'delegates_to:'].every((key) => front.includes(key)), `${rel}: a persistent Markdown doc declares ownership in responsibility frontmatter - the ADR fold rule and the SSoT review both read it`);
  }

  const surfaces = [...canonMarkdownFiles(), 'README.md', 'AGENTS.md', '.gitignore', '.asd/templates/t_config.yaml', '.asd/release-manifest.json'];
  const retired = ['t_subsystems.yaml', 'architecture.html'];
  assert.deepStrictEqual(surfaces.flatMap((rel) => retired.filter((name) => canonText(rel).includes(name)).map((name) => `${rel}: ${name}`)), [], 'AC-16: the mermaid registry template and the architecture.html build output are retired everywhere - a surviving mention tells init to seed or ignore a file nothing produces');
  assert.ok(!fs.existsSync(path.join(REPO_ROOT, '.asd/templates/t_subsystems.yaml')), 'AC-16: t_subsystems.yaml must be deleted, not merely unreferenced');
  const docTypes = canonText(layout).split('\n').find((line) => line.startsWith('| `{{DOC_TYPE}}`'));
  assert.ok(docTypes && !docTypes.includes('`Architecture`'), 'AC-16: no architecture.html is written any more, so its DOC_TYPE value goes with it');
  const lifecycle = '.asd/workflows/asd-phase-audit.md';
  const legacyMentions = (text) => text.split('subsystems.yaml').length - 1;
  assert.deepStrictEqual(surfaces.filter((rel) => legacyMentions(canonText(rel)) > 0), [lifecycle], 'AC-16/AC-17: subsystems.yaml may survive only where audit migrates a pre-registry project from it');
  assert.strictEqual(legacyMentions(sectionOf(lifecycle, 'Rules')), legacyMentions(canonText(lifecycle)), 'every remaining subsystems.yaml mention must sit in the audit workflow\'s "Rules", the migration source');

  const hard = sectionOf('.asd/rules/checkpoints.md', 'Gate policy').split('\n').find((line) => line.startsWith('Hard in both modes:'));
  assert.ok(hard && /deletion[^;]*migration/.test(hard), 'deleting a legacy c4/ at audit removes project files, so checkpoints.md "Gate policy" - the one home of hard gates - must list migration deletion');
  assert.ok(canonText(lifecycle).includes('[GATE hard: new subsystem]') && canonText(lifecycle).includes('[GATE hard: migration deletion]') && sectionOf(lifecycle, 'References').includes('`.asd/rules/checkpoints.md`'), 'the audit workflow must mark its confirmation and deletion gates hard and send them to checkpoints.md');

  const freshSteps = subOf(sectionOf('.asd/skills/asd-init/SKILL.md', 'Steps'), 'Fresh');
  const seed = stepOf(freshSteps, '13');
  const gitignore = stepOf(freshSteps, '14');
  const diagramCondition = seed.indexOf('`diagram_tool`');
  assert.ok(seed.indexOf(registry) !== -1 && seed.indexOf(registry) < diagramCondition && diagramCondition < seed.indexOf('c4/model'), 'AC-16/AC-18, sprint-013 AC-13: asd-init must seed c4/ only under the diagram_tool condition, while the registry seed precedes it unconditionally');
  assert.ok(gitignore.includes('likec4'), 'sprint-013 AC-13: the .gitignore entry for c4 build output must carry the same likec4 condition as the seed that creates c4/');
  assert.deepStrictEqual([seed, gitignore].filter((step) => step.includes('documents.c4')), [], 'sprint-013 AC-13: asd-init steps 13 and 14 must not key on the removed documents.c4 - init writes config, which no longer carries it');
});

test('sprint-014 AC-7: decisions-log.md and test-plan.md rotate into the segment names artifact-layout.md defines, every canon mention uses those names, live test-plan.md keeps the sections its per-entry readers need, and each cross-span reader points at the rotation rule', () => {
  const rotation = (heading) => sectionOf('.asd/rules/artifact-layout.md', heading).split('\n').find((line) => line.startsWith('**Rotation**'));
  const testPlan = rotation('Test plan');
  const decisions = rotation('Decisions log');
  assert.ok(testPlan && decisions, 'artifact-layout.md "Test plan" and "Decisions log" must each own a Rotation paragraph');
  const names = { test: /`(test-plan\.[^`]+\.md)`/.exec(testPlan)[1], decisions: /`(decisions-log\.[^`]+\.md)`/.exec(decisions)[1] };
  const mentions = [];
  for (const rel of [...canonMarkdownFiles(), '.asd/rules/artifact-layout.md', 'README.md']) {
    for (const [mention] of canonText(rel).matchAll(/(?:test-plan|decisions-log)\.[^\s.`'"()]+\.md/g)) mentions.push(`${rel}: ${mention}`);
  }
  assert.ok(mentions.length > 2, 'sanity: the sweep must reach the segment names canon uses');
  assert.deepStrictEqual(mentions.filter((entry) => ![names.test, names.decisions].includes(entry.split(': ')[1])), [], 'EXT-6: every test-plan.<token>.md / decisions-log.<token>.md mention must carry the canonical token - a reader globbing a segment name other than the one the rotating writer produces reads nothing and reports a short history');

  const trigger = decisions.split(' renames ')[0];
  assert.ok(trigger.includes('`state.json.phase`'), 'TST-2-2: decisions-log rotation must be conditioned on the delegated phase differing from `state.json.phase` - unconditioned, a resume rotates the live file away from its within-phase readers');
  const neverRotates = decisions.split(/(?<=\.) (?=[A-Z])/).find((sentence) => /never rotates/.test(sentence));
  assert.ok(neverRotates && /resume/i.test(neverRotates), 'TST-2-2: the Decisions log Rotation paragraph must state that a resume or re-run of the current phase never rotates');
  for (const reader of ['`review-policy.md` "Interrupted dispatch"', '`sprint-lifecycle.md` "State recovery"']) {
    assert.ok(neverRotates && neverRotates.includes(reader), `TST-2-2: the resume-never-rotates sentence must name its within-phase reader ${reader} - rotated mid-phase, that reader loses its count or routing line`);
  }
  assert.ok(/\bresum[^.;]*\(`asd-phase-impl-test\.md` step 1\)/.test(testPlan), 'TST-2-2: test-plan rotation must carve out resuming an interrupted current entry, citing asd-phase-impl-test.md step 1 - rotated on resume, the interrupted entry loses its rows');
  assert.ok(!canonText('.asd/skills/asd-sprint/SKILL.md').includes('Before every phase-skill delegation below: rotate'), 'TST-2-2: asd-sprint must rotate only when artifact-layout.md "Decisions log" requires it, never before every delegation');

  const moved = spans(testPlan.split('moves the ')[1].split(' rows of')[0]);
  const kept = spans(testPlan.split('keeps the ')[1].split('.')[0]);
  const headings = canonText('.asd/templates/t_test-plan.md').split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3));
  assert.ok(moved.length > 0 && kept.length > 0, 'sanity: the rotation paragraph must still list what moves and what stays');
  for (const name of [...moved, ...kept]) {
    assert.ok(headings.some((heading) => heading.startsWith(name)), `"${name}" must be a t_test-plan.md section, or rotation moves or keeps a table no plan has`);
  }
  for (const needed of ['Entry log', 'Defects']) {
    assert.ok(kept.includes(needed) && !moved.includes(needed), `live test-plan.md must keep "${needed}": impl-test step 1 reads the Entry log and defect-stalemate reads the Defects table from the live file alone, so rotating either away drops prior entries and a real stalemate fails open`);
  }

  for (const [rel, heading] of [
    ['.asd/rules/checkpoints.md', 'Decisions log'],
    ['.asd/skills/asd-sprint/SKILL.md', 'Decisions log'],
    ['.asd/workflows/asd-phase-impl.md', 'Decisions log'],
    ['.asd/workflows/asd-phase-retro.md', 'Decisions log'],
    ['.asd/workflows/asd-phase-impl-test.md', 'Test plan'],
    ['.asd/workflows/asd-phase-pr.md', 'Test plan'],
    ['.asd/agents/asd-reviewer-quality.md', 'Test plan'],
    ['.asd/agents/asd-tester.md', 'Test plan'],
  ]) {
    assert.ok(canonText(rel).includes(`artifact-layout.md\` "${heading}"`) || canonText(rel).includes(`artifact-layout.md '${heading}'`), `${rel} writes or reads across rotated ${heading === 'Test plan' ? 'test-plan' : 'decisions-log'} segments, so it must point at artifact-layout.md "${heading}" - without the pointer it reads the live file alone and misses every rotated entry`);
  }
});

test('sprint-015 AC-2/AC-3: the impl-review Quality and Combined reviewers receive the whole scope plus the --test-plan paths, every other reviewer the whole scope, and review-policy.md "Reviewer responsibility" gives each reviewer both phases', () => {
  assert.deepStrictEqual(runtime.INTERNAL_REVIEWERS.slice().sort(), internalReviewers().sort(), 'INTERNAL_REVIEWERS drives the per-reviewer manifests, so it must name exactly the asd-reviewer-* agents');
  const testFiles = ['tests/run.js', 'test/a.js', 'src/__tests__/a.js', 'spec/a.rb', 'pkg/specs/a.rb', 'src/a.test.ts', 'src/a.spec.js', 'src/test_a.py', 'src/a_test.go', 'src/ATest.java', 'src/ATests.cs', 'Assets/Tests/EditMode/Fixture.cs', 'Core.Tests/Fixture.cs', 'src/Game.Tests.Unit/Fixture.cs', 'lib/Api.Specs/helper.rb'];
  const plan = ['.asd/sprints/015-x/test-plan.md', '.asd/sprints/015-x/test-plan.entry-01.md'];
  const otherFiles = ['src/contest.js', 'src/latest/a.js', 'src/testing.js', 'docs/protests.md', 'README.md', 'src/Contest.Data/a.cs', 'src/latest.config/a.js', ...plan];
  assert.deepStrictEqual(testFiles.filter((file) => !runtime.isTest(file)), [], 'each path-segment and basename convention the plan names must classify as a test file, or Testing never receives it - a dotted test directory (Core.Tests/, Game.Tests.Unit/) included, sprint-021 AC-12');
  assert.deepStrictEqual(otherFiles.filter(runtime.isTest), [], 'a name merely containing "test" is not a test file - misclassified, Testing reviews code it does not own; test-plan.md reaches Testing only through --test-plan');
  const scope = [...otherFiles.slice(0, -plan.length), ...testFiles];
  const planReaders = ['quality', runtime.COMBINED_REVIEWER];
  for (const reviewer of planReaders) {
    assert.deepStrictEqual(runtime.reviewerFiles('impl-review', reviewer, scope, plan), [...scope, ...plan], `impl-review ${reviewer} receives the whole scope in order, then the --test-plan paths the scope pathspec excludes`);
  }
  assert.deepStrictEqual(runtime.reviewerFiles('impl-review', 'quality', [...scope, plan[0]], plan), [...scope, ...plan], 'a test-plan path already in scope is listed once');
  for (const phase of ['design-review', 'impl-review']) {
    for (const reviewer of runtime.INTERNAL_REVIEWERS.filter((name) => phase === 'design-review' || !planReaders.includes(name))) {
      assert.deepStrictEqual(runtime.reviewerFiles(phase, reviewer, scope, plan), scope, `${phase} ${reviewer}: every reviewer but impl-review Quality and Combined receives the whole scope, never the test-plan paths`);
    }
  }

  const table = sectionOf('.asd/rules/review-policy.md', 'Reviewer responsibility').split('\n').filter((line) => line.startsWith('|')).map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));
  assert.ok(table.length > 2 && /design-review/.test(table[0][1]) && /impl-review/.test(table[0][2]), 'the responsibility table must keep one design-review and one impl-review column');
  const rows = table.slice(2);
  const expected = [...internalReviewers(), 'external-review'].map((slug) => slug.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' '));
  assert.deepStrictEqual(rows.map((row) => row[0]).sort(), expected.sort(), 'AC-3: one row per reviewer agent - a reviewer without a row has no owner map, a row without an agent owns concerns nobody reviews');
  assert.deepStrictEqual(rows.filter((row) => row.length !== 3 || !row[1] || !row[2]).map((row) => row[0]), [], 'AC-3: every reviewer row must state both phases, an unowned phase included');
  const quality = rows.find((row) => row[0] === 'Quality');
  assert.ok(quality[2].includes('`--test-plan`') && !quality[1].includes('`--test-plan`'), 'AC-2: only the Quality impl-review cell names the flag reviewerFiles adds the test-plan paths by');

  for (const reviewer of internalReviewers()) {
    const inputs = sectionOf(`.asd/agents/asd-reviewer-${reviewer}.md`, 'Inputs');
    assert.ok(inputs.includes('payload.diff') && !/\bgit (diff|log|show)\b|diff payload/.test(inputs), `AC-4: asd-reviewer-${reviewer} has no shell, so its Inputs must read the manifest's .diff and never a git command or a diff payload`);
  }
  const source = canonText('.asd/runtime.js');
  for (const rel of ['.asd/workflows/asd-phase-impl-review.md', '.asd/workflows/asd-phase-design-review.md']) {
    const line = canonText(rel).split('\n').find((candidate) => candidate.includes('node .asd/runtime.js emit-manifest'));
    const flags = [...line.matchAll(/ --([a-z-]+)/g)].map((match) => match[1]);
    assert.deepStrictEqual(flags.filter((flag) => !source.includes(`flags['${flag}']`) && !source.includes(`flags.${flag} `) && !source.includes(`flags.${flag})`) && !source.includes(`flags.${flag},`)), [], `${rel}: every emit-manifest flag the workflow passes must be one the CLI reads - an unread --test-plan or --base drops Testing's plan or every .diff without an error`);
  }
});

test('sprint-015 AC-1/AC-6/AC-7/AC-8/AC-10/AC-12: no canon tells anyone to clear context, compaction keeps its preserve list, free-form input never goes through a decision prompt, BA/UX renames route to the orchestrator, the per-sprint document skip and retro intake dispositions are hard, scope no longer asks the cleanup criteria, and the changelog heads the released version', () => {
  const clear = /\bclear(?:s|ed|ing)?\b(?: the)? (?:session|context|transcript)|clear over compaction|then clear|clearable|\/clear\b/i;
  assert.deepStrictEqual([...canonMarkdownFiles(), 'README.md', 'AGENTS.md'].filter((rel) => clear.test(canonText(rel))), [], 'AC-1: context compaction is automatic and host-driven - no canon or README line may tell anyone to clear the session');
  const hygiene = sectionOf('.asd/rules/core.md', 'Context hygiene');
  const preserve = hygiene.split(/\n\d\. /).find((item) => /compaction summary MUST preserve/.test(item));
  assert.ok(preserve && ['sprint id', 'phase and mode', '`QUESTION`', '`BLOCKED_MANUAL`', '`ADVICE_NEEDED`', 'gate answer', 'paths written', 'task/finding/defect ids'].every((item) => preserve.includes(item)), 'AC-1: the compaction summary keeps its preserve list');
  assert.ok(/gate answer[^.]*`decisions-log\.md`\/`state\.json` before any further work/.test(hygiene) && hygiene.includes('"State recovery"'), 'AC-1: the gate answer is written to disk before any further work, and a lost session recovers from state.json');

  const freeForm = sectionOf('.asd/rules/core.md', 'Request user decision');
  assert.ok(freeForm.split(/(?<=[.;])\s/).some((clause) => /free-form/i.test(clause) && /\bnever\b/.test(clause)), 'AC-7: "Request user decision" must never be used for free-form input');
  assert.ok(canonText('.asd/skills/asd-sprint/SKILL.md').split('\n').some((line) => /^\d\. Collect scope as a plain chat message/.test(line)) && jsonOf('.asd/workflows/asd-phase-scope.md', 'Inputs').some((item) => item.includes('plain chat message')), 'AC-7: asd-sprint and the scope workflow collect raw scope as a plain chat message');

  const promote = stepOf(canonText('.asd/workflows/asd-phase-design-promote.md'), 4);
  assert.ok(/\borchestrator\b[^.]*`git mv`[^.]*`git rm`/.test(promote), 'AC-6: design-promote routes a BA/UX doc rename or deletion to the main orchestrator');
  const afterGit = promote.slice(promote.indexOf('`git rm`'));
  assert.ok(/inline/.test(afterGit) && /before step 5/.test(afterGit) && !/re-dispatch/.test(afterGit) && promote.includes('[GATE hard: doc deletion]'), 'AC-6: the orchestrator performs the approved rename or deletion itself, inline and before step 5 appends its records - no creator is left to re-dispatch around it, and a deletion stays a hard gate');
  assert.deepStrictEqual(['asd-ba', 'asd-ux'].filter((name) => fs.existsSync(path.join(REPO_ROOT, `.asd/agents/${name}.md`))), [], 'AC-6: no BA/UX agent is left to propose a rename - the orchestrator authors those documents');

  const checkpoints = canonText('.asd/rules/checkpoints.md').split('\n');
  const skipGate = 'per-sprint document skip';
  for (const gate of [skipGate, 'retro intake dispositions']) {
    assert.ok(checkpoints.some((line) => line.startsWith('Hard in both modes:') && line.includes(gate)) && checkpoints.some((line) => line.startsWith(`| ${gate} `) && line.includes('| hard')), `AC-8/sprint-019 AC-3: the ${gate} is hard in both modes and in the inventory - otherwise an adaptive orchestrator decides it on its own`);
  }
  const skip = sectionOf('.asd/rules/sprint-lifecycle.md', 'Optional documents').split('\n').find((line) => line.startsWith('**Per-sprint skip**'));
  const logLine = skip && /"(<doc> skipped this sprint by user)"/.exec(skip);
  assert.ok(skip && /Record: the frozen `false` plus/.test(skip), 'AC-8: the skip records the frozen `false` later phases read - the log line alone leaves the document produced');
  assert.ok(logLine && /`config\.yaml` is untouched/.test(skip) && canonText('.asd/workflows/asd-phase-scope.md').includes(logLine[1]), 'AC-8: the skip records the full "<doc> skipped this sprint by user" decisions-log line the scope workflow writes verbatim, doc placeholder included, and never touches config.yaml');
  const auditSkip = stepOf(canonText('.asd/workflows/asd-phase-audit.md'), 5).split(/(?<=\.)\s/).find((sentence) => sentence.includes('document skip'));
  assert.ok(auditSkip && auditSkip.includes('user request') && /\bnever\b/.test(auditSkip) && auditSkip.includes('prompt'), 'AC-8 (P2-1): the audit-exit document skip is user-initiated, never a standalone prompt on an adaptive or mechanical exit');

  const cleanupQuestion = canonText('.asd/workflows/asd-phase-scope.md').split(/(?<=\.)\s/).filter((sentence) => /\bask/i.test(sentence) && /cleanup|quality criteria/i.test(sentence));
  assert.deepStrictEqual(cleanupQuestion, [], 'sprint-019 AC-6 (supersedes sprint-015 AC-10): scope no longer asks for cleanup and quality criteria - they enter only through the raw scope or an included retro intake candidate');

  const released = /^## v(\S+)$/m.exec(canonText('CHANGELOG.md'));
  assert.strictEqual(released && released[1], loadManifest().asd_version, 'AC-12: the newest CHANGELOG heading is the asd_version release-manifest.json ships');
});

test('sprint-017 AC-1/AC-6 (D3/D4): the review wave and the impl-review iteration id are defined once in sprint-lifecycle.md "Review iteration counters", t_state.json seeds reviews.impl as one wave node of exactly the fields that definition names, and every reader of the counter - review-policy.md\'s severity floor and sprint-lifecycle.md\'s State-recovery readers included - uses the per-wave form', () => {
  const counters = sectionOf('.asd/rules/sprint-lifecycle.md', 'Review iteration counters');
  const definition = counters.split('\n').find((line) => line.startsWith('**Review wave**'));
  assert.ok(definition && definition.includes('sole definition'), 'sprint-lifecycle.md "Review iteration counters" must carry the review-wave definition and claim it as the sole one');
  const redefined = [...canonMarkdownFiles(), 'README.md'].filter((rel) => rel !== '.asd/rules/sprint-lifecycle.md' && canonText(rel).split('\n').some((line) => line.startsWith('**Review wave**')));
  assert.deepStrictEqual(redefined, [], 'D7: "wave" now means only the plan Task wave and the review wave; a second review-wave definition is the drift the sole-home claim forbids');
  const glossary = sectionOf('.asd/rules/core.md', 'Glossary').split('\n').find((line) => line.startsWith('- **Review wave**'));
  assert.ok(glossary && glossary.includes('`sprint-lifecycle.md` "Review iteration counters"'), 'core.md\'s glossary line must point at the definition rather than restate it');

  const nodeFields = [...definition.split(' — ')[1].split('(`t_state.json`)')[0].matchAll(/`([a-z_]+)`/g)].map((match) => match[1]);
  assert.ok(nodeFields.includes('iteration') && nodeFields.includes('latched'), `sanity: the definition must name the wave node's fields, got ${JSON.stringify(nodeFields)}`);
  const impl = JSON.parse(readRepoFile('.asd/templates/t_state.json')).reviews.impl;
  assert.deepStrictEqual(Object.keys(impl).sort(), ['wave', 'waves'], 'D3: reviews.impl is the wave pointer plus the wave nodes - a flat counter beside them would be a second, unwaved iteration count');
  assert.strictEqual(impl.wave, 1, 'D3: the seed points at wave 1');
  assert.ok(Array.isArray(impl.waves) && impl.waves.length === 1, 'D3: the seed is one wave node - the division point adds the rest, and a rollback reset restores exactly this');
  assert.deepStrictEqual(Object.keys(impl.waves[0]).sort(), nodeFields.slice().sort(), 'D3: the seed node carries exactly the fields the review-wave definition names');
  assert.deepStrictEqual(impl.waves[0], { iteration: 0, verdicts: {}, iteration_heads: {}, latched: {} }, 'D3: a fresh wave node starts at iteration 0 with nothing recorded - the division point is keyed on that 0');

  const idLine = counters.split('\n').find((line) => line.startsWith('- **Iteration id**'));
  assert.ok(idLine && idLine.includes('`wave-<K>/iter-NN`') && idLine.includes('Design-review ids stay `iter-NN`'), 'D4: the impl-review iteration id must be defined once, in the id form every impl-review literal cites, with design-review unchanged');
  const implReview = canonText('.asd/workflows/asd-phase-impl-review.md');
  assert.ok(implReview.includes('<id> = this iteration\'s wave-<K>/iter-NN') && implReview.includes('`state.json.review_fixes_pending = "<id>"`'), 'D4 Reachability: impl-review must write review_fixes_pending as the wave-qualified id, or impl review-fix looks for findings in a dir that is not there');
  assert.ok([jsonOf('.asd/workflows/asd-phase-impl.md', 'Entry').modes['review-fix']].some((line) => line.includes('review_fixes_pending') && line.includes('wave-<K>/iter-NN') && /legacy bare iter-NN reads as wave 1/.test(line)), 'D4/AC-6: impl review-fix mode must read the id form, and a legacy bare iter-NN as wave 1');
  const staleImplDirs = [...canonMarkdownFiles(), 'README.md'].flatMap((rel) => canonText(rel).split('\n').filter((line) => /reviews\/impl\/iter-NN/.test(line) && !/\blegacy\b/i.test(line)).map((line) => `${rel}: ${line.slice(0, 80)}`));
  assert.deepStrictEqual(staleImplDirs, [], 'D4: impl-review files live under reviews/impl/wave-<K>/iter-NN/; the flat dir may be named only as the legacy read');

  assert.ok(canonText('.asd/skills/asd-sprint/SKILL.md').includes('`wave <K>/<n>`'), 'D10/AC-6: the asd-sprint resume display must show the wave and that wave\'s counter');
  assert.ok(stepOf(subOf(sectionOf('.asd/workflows/asd-phase-pr.md', 'Steps'), 'Open mode'), 1).includes('equals the wave count') && stepOf(subOf(sectionOf('.asd/workflows/asd-phase-pr.md', 'Steps'), 'Open mode'), 1).includes('every wave node'), 'D10/AC-6: the pr DoD must read reviews-green over every wave, never only the current node');
  const reset = counters.split('\n').find((line) => line.includes('**Rollback reset.**'));
  assert.ok(reset && reset.includes('`reviews.impl` to its `t_state.json` seed') && reset.includes('re-divides'), 'D3: a rollback reset must drop every wave and re-divide at the next entry, not keep a stale division');

  const floor = sectionOf('.asd/rules/review-policy.md', 'Iteration severity floor');
  assert.ok(/or in impl-review the current review wave's counter/.test(floor) && /\(`sprint-lifecycle\.md` "Review iteration counters"\)/.test(floor), 'TST-2: the severity-floor reader must key impl-review\'s N on the current wave\'s counter, citing this definition rather than a phase-flat one');
  assert.ok(/User may override the cap \(per wave in impl-review\)/.test(floor), 'TST-2: the iteration cap the floor reads is per wave, not a single phase-wide cap');
  const reviewsGreen = canonText('.asd/workflows/asd-phase-pr.md').split('\n').find((line) => line.includes('**Reviews-green source**'));
  assert.ok(reviewsGreen && reviewsGreen.includes('state.json.reviews.impl.wave') && reviewsGreen.includes('waves.length'), 'TST-2: the State-recovery reviews-green reader must compare the current wave against the wave count, not a flat iteration');
  assert.ok(/reads only `verdicts\["iter-NN"\]` for the relevant review node \(impl-review: the current wave's, legacy shape included\)/.test(readRepoFile('.asd/rules/sprint-lifecycle.md')), 'TST-2: the hook\'s display-only State-recovery reader must also read the current wave\'s node, legacy shape included');
});

test('sprint-017 TST-1 (AC-2/AC-3): impl-review step 8 sends K<n straight to wave K+1\'s iteration 1 in the same entry with no impl/impl-test between and K=n to the terminal suite, the return contract carries WAVE: <K>, and a division into n > 1 waves leaves its own decisions-log artefact', () => {
  const step8 = stepOf(canonText('.asd/workflows/asd-phase-impl-review.md'), 8);
  assert.ok(/K < n .*wave K\+1.*same entry, no `impl`\/`impl-test` between/.test(step8), 'AC-2/AC-3: an unmet wave under n must advance straight to the next wave\'s iteration 1 in the same entry - cycling through impl/impl-test between waves would silently re-run test-fix machinery no finding asked for');
  assert.ok(/K = n .*reviewer DoD met.*proceed to step 9/.test(step8), 'AC-2/AC-3: only the roster-met last wave may reach the terminal full-suite gate');

  const returnContract = sectionOf('.asd/workflows/asd-phase-impl-review.md', 'Return');
  assert.ok(returnContract.includes('WAVE: <K>'), 'AC-3: the return contract must carry the wave the entry ended on, or a resumed session cannot tell which wave is live');

  const artefacts = jsonOf('.asd/workflows/asd-phase-impl-review.md', 'Exit').writes;
  assert.ok(artefacts.some((line) => /decisions-log entry on a division into n > 1 waves/.test(line)), 'AC-1: a division into more than one wave must leave a decisions-log artefact naming it, or a resumed session cannot tell whether the scope was ever divided');
});

test('sprint-017 (COR-2/DOC-1): a closed wave\'s late-admitted finding lands in the CURRENT iteration\'s dir (never the closed wave\'s), joins step 8\'s unresolved set, step 8 checks for it before the roster-met "Otherwise" branch, and the Artefacts produced line defers that location to review-policy.md instead of restating one', () => {
  const reviewFlow = canonText('.asd/workflows/asd-phase-impl-review.md');
  const step7a = stepOf(reviewFlow, '7a');
  const closedWaveLine = step7a.split('\n').find((line) => line.includes('for a closed wave'));
  assert.ok(closedWaveLine, 'COR-2: step 7a must state a closed-wave branch for a late duplicate return - otherwise a late admission after the wave advanced has nowhere defined to land');
  assert.ok(/its `\.late\.md` goes to this iteration's `<sprint>\/reviews\/impl\/<id>\/` instead/.test(closedWaveLine), 'COR-2: a closed wave\'s late.md must land in the CURRENT iteration\'s dir, not the closed wave\'s own dir - the closed wave is never reopened or re-dispatched');
  assert.ok(/its finding joins step 8's unresolved set/.test(closedWaveLine), 'COR-2: the closed-wave finding must reach step 8\'s routing, or an admitted FAIL/CONCERNS from a closed wave is silently dropped');
  const lateArtefact = jsonOf('.asd/workflows/asd-phase-impl-review.md', 'Exit').writes.find((line) => line.includes('<reviewer>.late.md'));
  assert.ok(lateArtefact && lateArtefact.includes("per review-policy.md 'Late duplicate return'") && !/iteration dir/.test(lateArtefact), `DOC-1: the Exit writes .late.md line must cite review-policy.md "Late duplicate return" for which iteration's dir it lands in, never restate one - a single restated location contradicts step 7a's closed-wave branch, and an orchestrator writing from the list puts the file where review-fix never reads it. Got: ${lateArtefact}`);

  const step8 = stepOf(reviewFlow, 8);
  const unresolvedBullet = step8.split('\n').find((line) => line.includes('Any unresolved finding remains'));
  assert.ok(unresolvedBullet && unresolvedBullet.includes('any closed-wave late finding admitted at step 7a'), 'COR-2: step 8\'s unresolved-finding branch must explicitly name the closed-wave late finding as one of its inputs');
  const bulletOrder = step8.split('\n').map((line) => line.trim()).filter((line) => line.startsWith('- **Any FAIL**') || line.startsWith('- **Any unresolved finding remains**') || line.startsWith('- **Otherwise'));
  assert.ok(bulletOrder.length === 3 && bulletOrder[0].startsWith('- **Any FAIL**') && bulletOrder[1].startsWith('- **Any unresolved finding remains**') && bulletOrder[2].startsWith('- **Otherwise'), `COR-2: step 8's three branches must appear in this order - FAIL escalation, then unresolved findings (closed-wave late finding included), then the roster-met Otherwise branch, or a late admission could be missed by a roster already read as met. Got: ${JSON.stringify(bulletOrder)}`);
});

test('sprint-018 AC-1/AC-2/AC-4/AC-8/AC-9: no agent grants AskUserQuestion, web access is granted whole or withheld whole with every grant scoped by policy, and every shell is bounded with commit holders matching git-strategy.md', () => {
  const agents = canonAgents();
  assert.deepStrictEqual(workflowReviewerAgents().filter((agent) => !agents.some((a) => a.name === agent)), [], 'sprint-020 AC-4: every reviewer a workflow definition dispatches must be a canonical agent this sweep reaches');
  assert.deepStrictEqual(agents.filter((a) => a.meta.claude.tools.includes('AskUserQuestion')).map((a) => a.name), [], 'AC-4: a dispatched agent never reaches the user, so no canonical agent may carry the user-prompting tool');

  const webTools = ['WebFetch', 'WebSearch'];
  const hasWeb = (a) => webTools.every((tool) => a.meta.claude.tools.includes(tool));
  assert.deepStrictEqual(agents.filter((a) => !hasWeb(a) && webTools.some((tool) => a.meta.claude.tools.includes(tool))).map((a) => a.name), [], 'AC-2: web access is one grant - WebFetch without WebSearch (or the reverse) has no Codex equivalent, which renders only live or disabled');
  assert.deepStrictEqual(agents.filter((a) => !hasWeb(a)).map((a) => a.name), ['asd-external-review', 'asd-reviewer-efficiency', 'asd-scout'], 'AC-2: exactly these three keep web withheld; every other agent carries it');
  for (const a of agents) {
    const denied = webTools.filter((tool) => a.meta.claude.disallowedTools.includes(tool));
    if (hasWeb(a)) assert.deepStrictEqual(denied, [], `AC-2: ${a.name} grants web, so its disallowedTools must not deny it`);
    else assert.ok(denied.includes('WebFetch'), `AC-2: ${a.name} keeps WebFetch in disallowedTools`);
  }

  for (const a of agents) {
    const web = jsonOf(a.rel, 'Tools').web;
    if (hasWeb(a)) assert.ok(typeof web === 'string' && web.length > 0, `AC-9: ${a.name} carries web tools, so its Tools "web" must scope what it may look up - one grant covers fetch and search alike`);
    else assert.strictEqual(web, undefined, `AC-9: ${a.name} withholds web, so its Tools must carry no "web" scope`);
  }
  const boundary = sectionOf('.asd/rules/core.md', 'Untrusted-data boundary');
  assert.ok(boundary.includes('search results'), 'AC-9: the untrusted-data rule must cover web search results, not only fetched pages');
  assert.ok(!/WebFetch|WebSearch|web_search/.test(boundary), 'AC-9: the untrusted-data rule applies on both hosts, so it names no host tool (providers.md maps them)');
  const providers = canonText('.asd/rules/providers.md').split('\n');
  for (const op of ['fetch external doc by URL', 'search the web']) {
    assert.ok(providers.some((line) => line.startsWith(`| ${op} |`)), `AC-9: the web grant covers the semantic op "${op}", so providers.md must map it to both hosts`);
  }
  assert.ok(agents.filter(hasWeb).length >= 5, 'sanity: the web-granted agents must be found');
  const installSites = [['.asd/workflows/asd-phase-design.md', stepOf(sectionOf('.asd/workflows/asd-phase-design.md', 'Steps'), 7)], ['.asd/workflows/asd-phase-design-promote.md', stepOf(sectionOf('.asd/workflows/asd-phase-design-promote.md', 'Steps'), 4)], ['.asd/skills/asd-design-system/SKILL.md', canonText('.asd/skills/asd-design-system/SKILL.md')]];
  for (const [rel, text] of installSites) {
    assert.ok(/run (?:command )?`designmd-install`/i.test(text), `AC-8: ${rel} is where the orchestrator runs designmd-install - no agent may run it, so that site must, or DESIGN.md lint fails on Windows with nobody allowed to install`);
  }

  const shells = agents.filter((a) => a.meta.claude.tools.includes('Bash'));
  const runLine = (a) => (jsonOf(a.rel, 'Tools').run || []).join('\n');
  assert.deepStrictEqual(shells.filter((a) => !runLine(a)).map((a) => a.name), [], 'AC-8: every Bash grant is bounded by a Tools run list');
  const holders = shells.filter((a) => runLine(a).includes('git commit')).map((a) => a.name);
  const policy = canonText('.asd/rules/git-strategy.md');
  const start = policy.indexOf('Holding a commit tool');
  assert.ok(start >= 0 && policy.indexOf('hold one', start) > start, 'AC-8: git-strategy.md must define who holds a commit tool by role policy');
  const named = [...policy.slice(start, policy.indexOf('hold one', start)).matchAll(/`(asd-[a-z-]+)`/g)].map((match) => match[1]).sort();
  assert.deepStrictEqual(holders, named, 'AC-8: git-strategy.md names the commit-tool holders and each agent\'s Run command line grants `git commit` - the two sites must agree, or a shell-holding creator reads the commit obligation as its own');
});

test('sprint-018 AC-4/AC-5/AC-7: a reviewer\'s question and External Review\'s stalemate ride the verdict-bearing report - one carrier form across template, rule, agents and both review workflows - and impl-test\'s green exit runs the manual-verification smoke check its one reviewing reader takes from test-plan.md (sprint-021 AC-10)', () => {
  const reviewers = canonAgents().filter((a) => /^asd-(reviewer-|external-review)/.test(a.name));
  assert.deepStrictEqual(reviewers.map((a) => a.name).sort(), workflowReviewerAgents(), 'sanity: exactly the reviewers the workflow definitions dispatch');
  for (const r of reviewers) {
    assert.ok(!jsonOf(r.rel, 'Signals').includes('QUESTION'), `AC-4: ${r.name} never returns a bare QUESTION - without its verdict token it reads as an interrupted dispatch and the question is lost`);
    for (const line of r.body.split('\n').filter((l) => /\bquestion: (?:item|`)/.test(l))) {
      assert.ok(line.includes('`review-policy.md` "Gate Verdict Format"') || line.includes("review-policy.md 'Gate Verdict Format'"), `AC-4: ${r.name} routes a question through the carrier and must cite its home: ${line}`);
    }
  }

  const shape = (text) => text.replace(/\{\{[^}]+\}\}|<[^>]+>/g, 'X').replace(/\s*…\s*$/, '').trim();
  const templateItem = canonText('.asd/templates/t_review.md').split('## Escalations')[1].split('\n').find((line) => line.startsWith('- question:'));
  assert.ok(templateItem, 'AC-4: t_review.md "## Escalations" must ship the question item form');
  const carrier = sectionOf('.asd/rules/review-policy.md', 'Gate Verdict Format').split('\n').find((line) => line.includes('bare `QUESTION`'));
  const form = carrier && /`(question: [^`]+)`/.exec(carrier);
  assert.ok(form && carrier.includes('`## Escalations`'), 'AC-4: review-policy.md must state the reviewer question carrier and its Escalations placement');
  assert.ok(/^question: <[^>]*\bfinding\b[^>]*>/.test(form[1]), 'AC-4: every question names the finding it qualifies (no finding, no question) - an answer with no finding has nothing to ride into the fix route');
  assert.ok(carrier.split(/(?<=\.)\s/).some((sentence) => sentence.includes('`providers.md` "Declared tool policy"') && /\bfinding\b/.test(sentence)), 'AC-4/AC-5: a reviewer\'s out-of-policy refusal must become a finding the carrier question names - "no finding, no question" otherwise leaves the refusal no way to reach the user');
  assert.strictEqual(shape(form[1]), shape(templateItem.slice(2)), 'AC-4: the carrier form in review-policy.md and the item t_review.md ships must be one shape, or a workflow parses one and a reviewer writes the other');
  assert.ok(carrier.split(/(?<=[.;])\s/).some((sentence) => sentence.includes('`CONCERNS`') && sentence.includes('`APPROVE`') && /\bnever\b/.test(sentence)), 'AC-4: a reviewer holding an open question returns at least CONCERNS, never APPROVE - an APPROVE latches the reviewer and the question never reaches a fix route');
  const answerItem = canonText('.asd/templates/t_review.md').split('## Escalations')[1].split('\n').find((line) => /^\s+answer:/.test(line));
  const answerForm = /`(\s*answer: [^`]+)`/.exec(carrier);
  assert.ok(answerItem && answerForm, 'AC-4: the carrier must state where the user\'s answer is written, and t_review.md must ship that line under the question item');
  assert.strictEqual(shape(answerForm[1]), shape(answerItem), 'AC-4: review-policy.md and t_review.md must agree on the answer line form');
  const reviewFix = stepOf(sectionOf('.asd/workflows/asd-phase-impl.md', 'Steps'), 3).split('\n').find((line) => line.includes('**review-fix**'));
  assert.ok(reviewFix && reviewFix.includes('`answer:`') && reviewFix.includes('`review-policy.md` "Gate Verdict Format"'), 'AC-4: impl review-fix must collect the answer lines with the findings, citing the carrier - otherwise the answer sits in decisions-log and the fixer never reads it');
  const routesToQuestion = /\b(?:returns?|via|as) `QUESTION`/;
  const questionRoutes = fs.readdirSync(path.join(REPO_ROOT, '.asd/rules')).flatMap((file) => canonText(`.asd/rules/${file}`).split('\n').filter((line) => routesToQuestion.test(line)).map((line) => ({ file, line })));
  assert.deepStrictEqual(questionRoutes.filter(({ line }) => !/\bagent\b/.test(line)).map(({ file }) => file), ['agent-protocol.md', 'code-style.md', 'design-principles.md'], 'TST-2-1: a QUESTION route whose line names no agent is creator-scoped and exempt; the exempt set is compared exactly, so a generic route cannot drop out of the sweep by rewording its subject');
  assert.ok(questionRoutes.some(({ file, line }) => file === 'agent-protocol.md' && !/\bagent\b/.test(line) && /\bconsulting creator\b/.test(line)), 'TST-2-1: the one agent-protocol.md route outside the sweep must name a consulting creator - a creator is never a reviewer, so it needs no carrier carve-out');
  const genericReturns = questionRoutes.filter(({ line }) => /\bagent\b/.test(line)).map(({ file, line }) => `${file}: ${line}`);
  assert.ok(genericReturns.length >= 4, 'sanity: the rule-doc lines routing any agent to QUESTION must be found');
  assert.ok(sectionOf('.asd/rules/agent-protocol.md', 'Signals').split('\n').some((row) => row.startsWith('| `ADVICE_NEEDED`') && row.includes('Never a reviewer')), 'C-4: the consulting agent of a Relay ADVICE_NEEDED step is a creator because the Signals table bars reviewers from the signal - that bar is what lets those steps skip the reviewer carve-out');
  assert.deepStrictEqual(genericReturns.filter((line) => !(/\breviewer\b/.test(line) && /\bcarrier\b/.test(line)) && !(line.startsWith('agent-protocol.md: ') && /\bconsulting agent\b/.test(line))), [], 'AC-4/AC-5: a rule line telling any agent to return QUESTION reaches reviewers too, so it must carve them out to their carrier on the same line (D-1, then ADVICE_NEEDED steps 4/6 - the class recurs)');

  const external = sectionOf('.asd/rules/external-review.md', 'Stalemate detection');
  const token = /first line `(\[REVIEW-<phase>-external\]: FAIL)`/.exec(external);
  const label = /`(Stalemate:)[^`]*`/.exec(external);
  assert.ok(token && label, 'AC-4: a stalemate returns the FAIL verdict token plus a Stalemate block - a verdict, inside the two-outcome contract');
  const trigger = canonText('.asd/agents/asd-external-review.md').split('\n').find((line) => line.startsWith('- must: on stalemate'));
  assert.ok(trigger && trigger.includes(token[1]) && trigger.includes(`\`${label[1]}`), 'AC-4: External Review\'s stalemate trigger must return the same token and block external-review.md defines');
  const options = [...external.matchAll(/^- \*\*([a-z ]+)\*\* — \S/gm)].map((match) => match[1]);
  assert.strictEqual(options.length, 3, `AC-4: "Stalemate detection" is the one home of the stalemate options, each with its effect - got ${JSON.stringify(options)}`);
  const optionList = (text) => ((/options:? ([a-z /]+?)(?: \(|\.|$)/m.exec(text) || [])[1] || '').split(' / ').map((option) => option.trim());
  const report = sectionOf('.asd/templates/external-review/t_review-report.md', 'Stalemate');
  assert.ok(report.includes('`external-review.md` "Stalemate detection"') || report.includes('external-review.md "Stalemate detection"'), 'AC-4: the report template\'s Stalemate section must point at the options\' home');
  assert.deepStrictEqual(optionList(report.split('\n').find((line) => line.startsWith(label[1])) || ''), options, 'AC-4: the Stalemate block the report template renders must offer exactly the options external-review.md defines');
  assert.deepStrictEqual(optionList(trigger), options, 'AC-4: External Review\'s stalemate trigger must offer exactly the options external-review.md defines');

  for (const rel of ['.asd/workflows/asd-phase-design-review.md', '.asd/workflows/asd-phase-impl-review.md']) {
    const flow = sectionOf(rel, 'Steps').split('\n');
    const q = flow.findIndex((line) => line.includes('`question:`'));
    const fail = flow.findIndex((line) => line.includes('**Any FAIL**'));
    assert.ok(q >= 0 && q < fail, `AC-4: ${rel} must handle reviewer questions before routing the iteration`);
    const clauses = flow[q].split(/(?<=[.;:])\s/);
    assert.ok(flow[q].includes('`review-policy.md` "Gate Verdict Format"'), `AC-4: ${rel} must cite the carrier's home`);
    assert.ok(clauses.some((c) => /\bnever\b/.test(c) && /interrupted/.test(c)), `AC-4: ${rel} must not treat a question-carrying report as an interrupted dispatch`);
    assert.ok(/request user decision/.test(flow[q]) && /decisions-log/.test(flow[q]), `AC-4: ${rel} asks the user per question and logs the answers`);
    const stalemate = flow.find((line) => line.includes(`\`${label[1]}\``));
    assert.ok(stalemate && /request user decision/.test(stalemate) && stalemate.includes('`external-review.md` "Stalemate detection"'), `AC-4: ${rel} must recognise External Review's Stalemate block, ask the user and take the options from their home`);
    assert.deepStrictEqual(options.filter((option) => new RegExp(`\\b${option}\\b`).test(stalemate)), [], `AC-4 (TST-2-2): ${rel} takes the stalemate options from external-review.md and must not restate them - a restated name goes stale on the next rename while the citation keeps this test green`);
    assert.ok(flow[q].split(/(?<=[;.])\s|, and /).some((clause) => /\bwrite\b/.test(clause) && /reviewer's file/.test(clause)), `AC-4: ${rel} must write each answer into that reviewer's file, where the fixer reads it - an answer only in decisions-log never reaches the fix`);
  }

  const smoke = stepOf(sectionOf('.asd/workflows/asd-phase-impl-test.md', 'Steps'), 10);
  assert.ok(smoke.includes('`Manual verification`') && /request(?:s)? (?:a )?user decision/.test(smoke) && smoke.includes('"Test plan" Manual verification') && /decisions-log/.test(smoke), 'AC-7/sprint-021 AC-10: impl-test\'s green exit (step 10) runs the smoke check - a user decision per `Manual verification` row, recorded in test-plan.md and logged - before impl-review, so a failed manual check routes before any reviewer runs');
  assert.ok(!sectionOf('.asd/workflows/asd-phase-impl-review.md', 'Steps').split('\n').some((line) => /Manual verification/i.test(line) && /request user decision/.test(line)), 'sprint-021 AC-10: impl-review no longer collects manual-verification results - a second collection asks the user twice');
  for (const { name, reviewers: roster } of readWorkflowDefinitions()) {
    const inputItems = (key) => jsonText(sectionOf(`.asd/agents/asd-reviewer-${key}.md`, 'Inputs'));
    const readers = roster.impl.filter((key) => key !== runtime.EXTERNAL_REVIEWER && inputItems(key).some((item) => /manual-verification results/.test(item)));
    assert.strictEqual(readers.length, 1, `sprint-020 AC-4: the manual-verification results must reach exactly one reviewer of every workflow - ${name}'s impl-review roster (${roster.impl.join(', ')}) has ${readers.length} whose Inputs read them`);
    const line = inputItems(readers[0]).find((candidate) => /manual-verification results/.test(candidate));
    assert.ok(line.includes('test-plan.md') && !/\bpayload\b/.test(line), `sprint-021 AC-10: asd-reviewer-${readers[0]} reads the results where impl-test records them, test-plan.md, never from a payload no step fills any more`);
  }

  const declared = headingBody('.asd/rules/providers.md', 'Declared tool policy');
  const carveOut = declared && declared.split(/[.;]\s|\s—\s/).find((clause) => /\breviewer\b/.test(clause) && clause.includes('`review-policy.md` "Gate Verdict Format"'));
  assert.ok(carveOut, 'AC-4/AC-5 (TST-1-1): one clause must name the reviewer and route it to its carrier home - the out-of-policy refusal must route a reviewer through its question carrier - "an agent ... returns `QUESTION`" alone makes a reviewer return a bare QUESTION, which reads as an interrupted dispatch');
});

test('sprint-018 AC-4: a finding the user resolves without a fix is recorded by one resolved: line form, every resolving site and the review-fix collector cite its one home, and review-fix skips what it names', () => {
  const home = sectionOf('.asd/rules/sprint-lifecycle.md', 'State recovery').split('\n').find((line) => line.startsWith('**User-resolved findings**'));
  const form = home && /`(resolved: [^`]+)`/.exec(home);
  const reasons = form ? ((/<([a-z-]+(?: \| [a-z-]+)+)>/.exec(form[1]) || [])[1] || '').split(' | ').filter(Boolean) : [];
  assert.ok(form && reasons.length >= 3, 'the user-resolved record must be defined once, as a line form naming every resolving reason');
  assert.ok(/\bskip/.test(home) && /\bsatisfied\b/.test(home), 'the home must state both effects: review-fix skips a named finding, and a fully named CONCERNS/FAIL counts as satisfied');

  const citation = '`sprint-lifecycle.md` "State recovery" user-resolved findings';
  const sites = canonMarkdownFiles().filter((rel) => canonText(rel).includes(citation));
  for (const reason of reasons) {
    const recorders = sites.filter((rel) => canonText(rel).split('\n').some((line) => new RegExp(`\\b${reason}\\b`).test(line) && /\bresolved\b/.test(line)));
    assert.ok(recorders.length > 0, `resolving reason "${reason}" must be recorded at a site that cites the home - otherwise that resolution leaves no resolved: line and the gate stays blocked`);
  }
  const reviewWorkflows = fs.readdirSync(path.join(REPO_ROOT, '.asd/workflows')).filter((file) => /^asd-phase-[a-z]+-review\.md$/.test(file)).map((file) => `.asd/workflows/${file}`);
  assert.strictEqual(reviewWorkflows.length, 2, 'sanity: design-review and impl-review');
  for (const rel of reviewWorkflows) {
    const lines = canonText(rel).split('\n');
    assert.ok(sites.includes(rel), `${rel} resolves findings without a fix, so it must cite the user-resolved home`);
    assert.ok(lines.some((line) => /\boverride\b/.test(line) && /\brecord\b/.test(line) && /\bresolved\b/.test(line)), `${rel}: a FAIL override must be recorded as resolved, or review-fix fixes it anyway`);
    assert.ok(lines.some((line) => line.includes('`cap-accept`') && /\bresolved\b/.test(line)), `${rel}: an iteration-cap accept must record the open findings resolved`);
  }
  const prefix = form[1].split(' ')[0];
  const reviewFix = stepOf(sectionOf('.asd/workflows/asd-phase-impl.md', 'Steps'), 3).split('\n').find((line) => line.includes('**review-fix**'));
  assert.ok(reviewFix && reviewFix.includes(`\`${prefix}\``) && reviewFix.includes(citation), 'impl review-fix must skip each finding a resolved: line names, citing the home - the collector is the consuming end of the record');

  const verdictOnly = [...canonMarkdownFiles(), 'README.md'].flatMap((rel) => canonText(rel).split('\n').filter((line) => line.includes('`verdicts["iter-NN"]` alone')).map((line) => ({ rel, line })));
  assert.ok(verdictOnly.length >= 2, 'sanity: the aggregation steps that read verdicts must be found');
  const dodHeader = sectionOf('.asd/rules/review-policy.md', 'DoD per review phase').split('\n').find((line) => line.startsWith('| Phase |'));
  assert.ok(dodHeader && dodHeader.includes('`sprint-lifecycle.md` "State recovery"') && /user-resolved/.test(dodHeader), 'AC-4: the DoD table says what counts as met, so it must admit a user-resolved verdict with its home');
  assert.ok(/Satisfied-vs-blocking semantics[^.]*`sprint-lifecycle\.md` "State recovery"/.test(stepOf(subOf(sectionOf('.asd/workflows/asd-phase-pr.md', 'Steps'), 'Open mode'), 1)), 'AC-4: the pr gate, the other gating consumer, must judge satisfied-vs-blocking per State recovery, where the user-resolved rule lives');
  assert.deepStrictEqual(verdictOnly.filter(({ line }) => !line.includes('"User-resolved findings"')).map(({ rel, line }) => `${rel}: …${line.slice(Math.max(0, line.indexOf('alone') - 80), line.indexOf('alone') + 40)}…`), [], 'AC-4 (104feda): a line saying a consumer reads verdicts["iter-NN"] alone must carry the user-resolved exception - read literally, it blocks a user-resolved CONCERNS/FAIL forever');
});

test('sprint-019 AC-9/AC-10, sprint-023 AC-1: the dispatch payload header providers.md defines is admitted by both exhaustive reviewer payload lists and cited by both review workflows, and every agent handed a turn budget declares a maxTurns that leaves a report turn and the turn plan\'s earlier ledger turn', () => {
  const rule = sectionOf('.asd/rules/agent-protocol.md', 'Dispatch payload');
  const keys = Object.keys(jsonOf('.asd/rules/agent-protocol.md', 'Dispatch payload'));
  assert.ok(keys.includes('repo_root') && keys.includes('turn_budget'), `AC-9/AC-10: the payload object must define the repo_root and turn_budget keys, got ${JSON.stringify(keys)}`);

  const reviewerPayload = canonText('.asd/rules/review-policy.md').split('\n').find((line) => line.startsWith('- Reviewer payload carries only')) || '';
  const externalPayload = sectionOf('.asd/rules/external-review.md', 'Phase-scoped payload');
  for (const key of ['repo_root', 'turn_budget']) {
    assert.ok(reviewerPayload.includes('`agent-protocol.md` "Dispatch payload"') && reviewerPayload.includes(`\`${key}\``), `review-policy.md's reviewer payload list is exhaustive ("carries only"), so it must admit the \`${key}\` payload key or every dispatch breaks its own contract`);
  }
  assert.ok(externalPayload.includes('reviewer payload object'), 'external-review.md "Phase-scoped payload" must admit the payload object the wrapper is dispatched with, repo_root and turn_budget included');
  for (const [rel, step] of [['.asd/workflows/asd-phase-design-review.md', 7], ['.asd/workflows/asd-phase-impl-review.md', 6]]) {
    assert.ok(stepOf(sectionOf(rel, 'Steps'), step).includes('`agent-protocol.md` "Dispatch payload"'), `${rel} step ${step} builds every reviewer payload, so it must open them with the payload object by citing its home`);
  }
  for (const [rel, step] of [['.asd/workflows/asd-phase-impl.md', 6], ['.asd/workflows/asd-phase-impl-test.md', '1a'], ['.asd/workflows/asd-phase-impl-review.md', 9]]) {
    assert.ok(jsonOf(rel, 'Dispatch').some((row) => /asd-(?:dev|tester)/.test(row.agent)), `sprint-019 COR-6: ${rel} must declare the dev or tester it dispatches`);
    assert.ok(stepOf(sectionOf(rel, 'Steps'), step).split('\n').some((line) => /\bdelegate|\bdispatch/i.test(line) && line.includes('`agent-protocol.md` "Dispatch payload"')), `sprint-019 COR-6: ${rel} step ${step} dispatches a dev or tester, the case 018 F-2 evidenced, so its dispatch line must open the payload with the object by citing its home`);
  }

  const reserve = /"report_by": <maxTurns − (\d+)>/.exec(rule);
  assert.ok(reserve, 'the turn_budget key must state the turn the report is due by, relative to maxTurns');
  const turnPlan = rule.split(/(?<=\.)\s/).find((sentence) => spans(sentence).includes('LARGE_WAVE_FILES')) || '';
  const ledgerTurns = [...turnPlan.matchAll(/<maxTurns − (\d+)>/g)].map((match) => Number(match[1]));
  assert.strictEqual(ledgerTurns.length, 1, 'sprint-023 AC-1: the sentence naming LARGE_WAVE_FILES is the turn plan, and it must give the one turn the coverage ledger is due by, relative to maxTurns');
  assert.ok(ledgerTurns[0] > Number(reserve[1]), `sprint-023 AC-1: the ledger is due by turn maxTurns - ${ledgerTurns[0]}, which must come before the report turn maxTurns - ${reserve[1]} - a ledger due after the report is a plan no reviewer can follow`);
  for (const name of [...internalReviewers().map((reviewer) => `asd-reviewer-${reviewer}`), 'asd-external-review', 'asd-advisor']) {
    const cap = sync.parseCanonicalFrontmatter(sync.readNormalized(path.join(REPO_ROOT, '.asd/agents', `${name}.md`))).meta.claude.maxTurns;
    assert.ok(Number.isInteger(cap) && cap > Number(reserve[1]), `${name}: the Turn budget line is filled from canon maxTurns and reports by turn maxTurns - ${reserve[1]}, so the cap must be an integer above ${reserve[1]} (got ${cap})`);
    assert.ok(cap > ledgerTurns[0], `sprint-023 AC-1: ${name}: the turn plan puts the ledger at turn maxTurns - ${ledgerTurns[0]}, so the cap must exceed ${ledgerTurns[0]} (got ${cap})`);
  }
});

test('sprint-021 AC-1/AC-2 (D1), sprint-022 AC-1/AC-2/AC-3: pr ends at await-merge or done, and runtime CHAIN_EXITS, asd-sprint and README agree; pr open mode commits and pushes its state.json.pr write before it continues into merge mode, pr merge mode, entered on any confirmed MERGED number (only the retry of the missing release and issue-close steps skips open mode\'s DoD gate), skips the merge for a PR already MERGED, republishes it if the PR head lacks it before merging, fetches base before the self-hosting release and, in every project, performs no part of the closure write, which releases nothing and is the orchestrator\'s, and scope step 1 carries every token of it', () => {
  const definitions = readWorkflowDefinitions();
  const exits = [...new Set(definitions.flatMap(({ phases, next }) => Object.values(next).flat().filter((target) => !phases.includes(target))))].sort();
  assert.deepStrictEqual(exits, ['await-merge', 'done'], 'sprint-022 AC-3 (D1): the chain ends at pr merge mode\'s two exits - await-merge (merge blocked) and done (merged); done names completion, not a write, since pr never writes the terminal state');
  const chainExits = /^const CHAIN_EXITS = (\[[^\]]*\]);/m.exec(canonText('.asd/runtime.js'));
  assert.ok(chainExits, 'sanity: .asd/runtime.js must declare CHAIN_EXITS as a one-line array literal');
  assert.deepStrictEqual(JSON.parse(chainExits[1].replace(/'/g, '"')).sort(), exits, 'sprint-022 AC-3: runtime.js CHAIN_EXITS must be exactly the exits the definitions route pr to - loadWorkflow accepts any CHAIN_EXITS member as a target, so a stale extra token stays loadable and routable');
  const sprintSkill = canonText('.asd/skills/asd-sprint/SKILL.md');
  const skillExits = /^SKILL: asd-sprint \| .*\bNEXT:\s*<([^>]+)>/m.exec(sprintSkill);
  assert.ok(skillExits && exits.every((exit) => skillExits[1].split('|').includes(exit)), 'asd-sprint must offer every chain exit in its return contract - an exit it cannot relay halts the sprint with no route');
  const doneRoute = (sprintSkill.split('\n').find((line) => line.includes('`NEXT: done`')) || '').split('`NEXT: done`')[1];
  assert.ok(doneRoute && /\bhalt\b/.test(doneRoute.split(';')[0]), 'sprint-022 AC-2/AC-3: asd-sprint Step 3 must halt on pr\'s `NEXT: done` - no closure request follows the merge, the next sprint\'s scope archives it');
  assert.ok(!/^### Step 1A\b/m.test(sprintSkill), 'sprint-022 AC-2 (D3): asd-sprint Step 1A, the closure request, is deleted - a merged-unclosed sprint goes to the new-sprint flow with no user gate');
  const readmePr = canonText('README.md').split('\n').find((line) => line.startsWith('| **pr** |') && line.includes('`gh pr create`')) || '';
  assert.deepStrictEqual(exits.filter((exit) => !readmePr.includes(`\`${exit}\``)), [], 'sprint-022 AC-3: README\'s pr row must name every chain exit the definitions route pr to');
  const tablePr = sectionOf('.asd/rules/sprint-lifecycle.md', 'Phase table').split('\n').find((line) => line.startsWith('| pr |')) || '';
  assert.ok(exits.includes((/→ `([^`]+)`/.exec(tablePr) || [])[1]), `sprint-022 AC-3: sprint-lifecycle.md "Phase table" pr row must exit to a chain exit the definitions route pr to; got: ${tablePr}`);

  const closure = sectionOf('.asd/rules/sprint-lifecycle.md', 'PR phase').split('**Closure write**')[1].split('\n\n')[0];
  const tokens = [...new Set([...closure.matchAll(/`([^`]+)`/g)].map((match) => match[1]).filter((token) => !token.endsWith('.md')))];
  const writes = ['git mv', 'phase="done"', 'archived_at'];
  assert.deepStrictEqual(writes.filter((token) => !tokens.includes(token)), [], 'sanity: sprint-lifecycle.md "PR phase" "Closure write" must name the archive move and the terminal fields this test holds pr merge mode free of');
  assert.ok(tokens.includes('decision_actor: orchestrator'), 'sprint-022 AC-2 (D3): the closure write records its gate_decisions entry with decision_actor: orchestrator - no user gate precedes it, so a user actor would claim an approval nobody gave');
  assert.ok(!/\b(?:tag|release)\b/i.test(closure), 'sprint-022 AC-1: the closure write no longer tags or releases - pr merge mode publishes the self-hosting release right after the merge');
  const merge = subOf(sectionOf('.asd/workflows/asd-phase-pr.md', 'Steps'), 'Merge mode');
  assert.ok(merge.includes('`NEXT: done`'), 'sprint-022 AC-3: pr merge mode returns `NEXT: done` once the merge is confirmed');
  const release = stepOf(merge, 2);
  const [fetchAt, releaseAt, doneAt] = ['`git fetch origin <git.base_branch>`', '"Versioning & Changelog (self-hosting only)"', '`NEXT: done`'].map((token) => release.indexOf(token));
  assert.ok(fetchAt >= 0 && fetchAt < releaseAt && releaseAt < doneAt, 'sprint-022 AC-1 (D2): pr merge mode step 2 fetches git.base_branch, then publishes the release per git-strategy.md "Versioning & Changelog (self-hosting only)", then emits NEXT: done - the squash merge commit the tag targets is not local on the sprint branch until the fetch');
  const noWrite = release.split(/(?<=\.)\s/).find((sentence) => /\barchive move\b/.test(sentence)) || '';
  const noWriteAt = noWrite ? release.indexOf(noWrite) : -1;
  assert.ok(releaseAt < noWriteAt && noWriteAt < doneAt, 'sprint-022 iter-01 combined #3: pr merge mode step 2 publishes the self-hosting release, then states the no-write rule, then emits NEXT: done');
  assert.ok(!release.startsWith('2. `self_hosting: enabled`:') || /\bevery project\b/i.test(noWrite), `sprint-022 iter-01 combined #3: under a step opening with the self_hosting condition, the no-write rule and NEXT: done must be re-scoped to every project - read literally, a consumer project gets neither, on its most common chain exit; got: ${noWrite}`);
  const mergedSkip = 'sprint-022 iter-01 combined #5: the release retry and open mode\'s MERGED hit enter merge mode for a PR already MERGED';
  assert.ok(/\bstep 2\b/.test(stepOf(merge, 1).split(/(?<=\.)\s/).find((sentence) => sentence.includes('`MERGED`')) || ''), `${mergedSkip} - merge step 1 must send an already-MERGED PR straight to step 2, the release, or it runs gh pr merge on a merged PR and ends FAILED`);
  const modes = sectionOf('.asd/rules/sprint-lifecycle.md', 'PR phase').split('\n\n')[1] || '';
  const override = modes.split(/(?<=\.)\s/).find((sentence) => sentence.includes('`MERGED`') && /merge mode/.test(sentence)) || '';
  assert.ok(override.includes('`pr`') && /\bDoD\b/.test(override), `${mergedSkip} - "PR phase" Modes: a dispatch carrying a confirmed MERGED number enters merge mode whatever pr holds, skipping open mode's DoD gate, which a hand-merged sprint with pr=null could fail; got: ${override}`);
  const openMode = subOf(sectionOf('.asd/workflows/asd-phase-pr.md', 'Steps'), 'Open mode');
  const gateAt = openMode.search(/\bDoD\b/);
  assert.ok(gateAt >= 0 && gateAt < openMode.indexOf('`MERGED` hit'), 'sanity: pr open mode runs its DoD gate (step 1) before the head-branch lookup that finds a MERGED hit (step 2), so a hit found there has passed the gate');
  const skipClause = override.split(/;\s/).find((clause) => /\bDoD\b/.test(clause)) || '';
  const skippers = skipClause.split('merge mode')[0];
  assert.ok(!/open[- ]mode(?:'s)?\s+(?:own\s+)?`MERGED`/i.test(skippers), `${mergedSkip} - "PR phase" Modes: open mode finds its MERGED hit after its DoD gate has run, so it skips nothing and the dispatches the DoD-skip clause lists may not include it, only asd-sprint's release retry (impl-review wave-1/iter-02 combined #1); got: ${skipClause}`);
  assert.deepStrictEqual(writes.filter((token) => merge.includes(token)), [], 'AC-1: pr merge mode makes no write on git.base_branch - the archive move and terminal state belong to the next sprint\'s scope');
  const openSteps = openMode.split(/\n(?=\d+[a-z]?\. )/);
  const writeAt = openSteps.findIndex((step) => step.includes('`state.json.pr`'));
  const nextAt = openSteps.findIndex((step, index) => index > writeAt && /merge mode/.test(step));
  assert.ok(writeAt >= 0 && writeAt < nextAt, 'sanity: pr open mode must write `state.json.pr` in a step before the one handing over to merge mode');
  assert.ok(!openMode.includes('`NEXT: await-merge`'), 'sprint-032 AC-3: pr open mode emits no exit of its own - it continues into merge mode in the same run, and `NEXT: await-merge` is the blocked-merge exit of merge mode');
  const publish = openSteps.slice(writeAt, nextAt).join('\n').split('`state.json.pr`').slice(1).join('').replace(/`[^`]*`/g, '');
  const unpublished = 'merge mode writes nothing, so pr.number reaches git.base_branch only through the squash merge; unpublished, base keeps pr=null and the merged sprint is found only by the head-branch fallback lookup (sprint-lifecycle.md "PR phase" "Merged-unclosed", impl-review wave-1/iter-01 C-1)';
  assert.ok(/\bcommit/i.test(publish), `AC-2: pr open mode must commit its state.json.pr write before merge mode - ${unpublished}`);
  assert.ok(/\bpush/i.test(publish), `AC-2: pr open mode must push the sprint branch carrying its state.json.pr write before merge mode - ${unpublished}`);
  const mergeCall = merge.indexOf('"Merging a PR"');
  assert.ok(mergeCall >= 0, 'sanity: pr merge mode must merge through git-strategy.md "Merging a PR", the site the checks below must precede');
  const beforeMerge = merge.slice(0, mergeCall);
  const unconfirmed = 'an open-mode push that failed or never ran leaves the PR head without pr.number, and the squash merge then lands pr=null on base, so the merged sprint is found only by the head-branch fallback lookup (impl-review wave-1/iter-02 external #1)';
  assert.ok([...beforeMerge.matchAll(/`([^`]+)`/g)].some(([, span]) => span.includes('origin/') && span.includes('state.json')), `AC-2: pr merge mode must read state.json from the remote sprint branch before merging - ${unconfirmed}`);
  const republish = beforeMerge.split(/[;.]\s/).filter((clause) => !clause.includes('`FAILED`')).join(' ').replace(/`[^`]*`/g, '');
  assert.ok(/\bcommit/i.test(republish), `AC-2: pr merge mode must commit a local state.json.pr write the remote branch lacks before merging - ${unconfirmed}`);
  assert.ok(/\bpush/i.test(republish), `AC-2: pr merge mode must push the sprint branch when the remote lacks pr.number, before merging - ${unconfirmed}`);
  const scopeStep = stepOf(sectionOf('.asd/workflows/asd-phase-scope.md', 'Steps'), 1);
  assert.deepStrictEqual(tokens.filter((token) => !scopeStep.includes(token) && !scopeStep.includes(token.replace(/ /g, '-'))), [], 'AC-2: asd-phase-scope.md step 1 performs the closure write "PR phase" defines, so it must name each of its tokens (a gate name as its gate_decisions value, spaces hyphenated) - one dropped is a field the closing sprint never gets');
  assert.ok(!/\b(?:tag|release)\b/i.test(scopeStep), 'sprint-022 AC-1: asd-phase-scope.md step 1 no longer tags or releases - the release moved to pr merge mode');
});

test('sprint-021 AC-2 (iter-03 external #1), AC-14, sprint-022 AC-2: a sprint without pr.number is looked up by head branch at any phase - asd-sprint Step 1 runs the lookup "PR phase" "Merged-unclosed" defines with no phase gate, reads a MERGED hit as merged-unclosed and carries its number through Step 2A to the closure write, and adopts an OPEN hit only at phase="pr"; pr open mode runs the lookup before opening a PR, so it never opens a second one, after committing the phase "Merged-unclosed" says base carries', () => {
  const home = sectionOf('.asd/rules/sprint-lifecycle.md', 'PR phase').split('**Merged-unclosed**')[1];
  assert.ok(home, 'sanity: sprint-lifecycle.md "PR phase" must keep its **Merged-unclosed** paragraph, the lookup\'s home');
  const clauses = (text) => text.split(/[;.]\s/);
  const lookup = spans(home.split('\n\n')[0]).find((span) => span.startsWith('gh pr list --head <state.branch>'));
  const lost = 'a PR merged before open mode\'s state.json.pr write reached the sprint branch leaves base at pr=null, so without the head-branch lookup asd-sprint never archives it and a pr re-run opens a second PR (impl-review wave-1/iter-03 external #1)';
  assert.ok(lookup, `AC-2: "Merged-unclosed" must define the head-branch lookup for a sprint without pr.number - ${lost}`);
  assert.ok(/--state all\b/.test(lookup), `AC-2: the head-branch lookup must list every PR state - gh pr list defaults to open PRs only and would never report the MERGED one - ${lost}`);
  const outcomes = clauses(home.slice(home.indexOf(lookup)));
  const mergedHit = outcomes.find((clause) => clause.includes('`MERGED`') && /merged-unclosed/i.test(clause));
  const openHit = outcomes.find((clause) => clause.includes('`OPEN`') && /merge mode/.test(clause));
  assert.ok(mergedHit, `AC-2: "Merged-unclosed" must read a MERGED head-branch hit as merged-unclosed - ${lost}`);
  assert.ok(openHit, `AC-2: "Merged-unclosed" must resume merge mode on an OPEN head-branch hit - ${lost}`);
  const phaseGated = (text) => spans(text).some((span) => /^phase\s*!?=/.test(span));
  const anyPhase = 'a PR opened and merged by hand before the pr phase leaves the sprint at an earlier phase with pr=null; a phase-gated lookup never runs for it and the sprint resumes that phase on git.base_branch instead of being archived';
  const definition = clauses(home.split('\n\n')[0])[0];
  assert.ok(definition.includes('`MERGED`'), 'sanity: "Merged-unclosed" must open by defining the state as a sprint PR gh reports MERGED');
  assert.deepStrictEqual([definition, clauses(home).find((clause) => spans(clause).includes(lookup)), mergedHit].filter(phaseGated).map((clause) => clause.trim()), [], `AC-14: "Merged-unclosed"'s definition, its head-branch lookup and its MERGED outcome must name no phase="…" condition - ${anyPhase}`);
  assert.ok(spans(openHit).includes('phase="pr"'), 'AC-14: "Merged-unclosed" must adopt an OPEN head-branch hit into merge mode only at phase="pr" - at an earlier phase the sprint has phases left to run, and merge mode would skip them');
  const sprintSkill = canonText('.asd/skills/asd-sprint/SKILL.md');
  const stepOne = sprintSkill.split('### Step 1:')[1].split('\n### ')[0].split('\n');
  const detect = stepOne.find((line) => spans(line).includes(lookup));
  assert.ok(detect && /merged-unclosed/i.test(detect), `AC-2: asd-sprint Step 1 must run the lookup "Merged-unclosed" defines, the same command, and read its MERGED hit as merged-unclosed - ${lost}`);
  assert.ok(!phaseGated(detect), `AC-14: asd-sprint Step 1's merged-unclosed detection must run for every active sprint, with no phase="…" condition - ${anyPhase}`);
  const openLine = stepOne.find((line) => line !== detect && spans(line).includes('OPEN'));
  assert.ok(openLine && spans(openLine).includes('phase="pr"'), 'AC-14: asd-sprint Step 1 must say an OPEN head-branch hit is adopted into merge mode only at phase="pr" - detection now runs at every phase, and without the restriction an earlier-phase sprint with an open PR reads as ready to merge');
  const toNewSprint = stepOne.find((line) => /merged-unclosed/i.test(line) && line.includes('Step 2A')) || '';
  const route = toNewSprint.slice(toNewSprint.indexOf('→'));
  assert.ok(/\bnumber\b/i.test(route.replace(/`[^`]*`/g, '')), "sprint-022 AC-2 (D3): asd-sprint Step 1's merged-unclosed route to the new-sprint flow must carry the head-branch lookup's PR number - scope's closure write has no other source for it when pr is null");
  const carry = clauses(route).filter((clause) => /\bnumber\b/i.test(clause.replace(/`[^`]*`/g, '')));
  assert.deepStrictEqual(carry.filter((clause) => /\bnull\b/.test(clause)), [], "AC-2: asd-sprint Step 1 must carry the confirmed PR number whenever detection found one, not only when the detected copy's pr is null - a sprint-branch copy holding pr.number over a base copy with pr=null reaches scope's closure write, which reads the base copy, with no number (impl-review wave-1/iter-04 #1)");
  const handOff = stepOf(sprintSkill.split('### Step 2A')[1].split('\n### ')[0], 4);
  assert.ok(handOff.includes('`asd-phase-scope`') && /merged-unclosed/i.test(handOff), 'sprint-022 AC-2 (D3): asd-sprint Step 2A.4 must pass the merged-unclosed sprint Step 1 carries to asd-phase-scope, whose step 1 runs the closure write');
  const scopeSpans = spans(stepOf(sectionOf('.asd/workflows/asd-phase-scope.md', 'Steps'), 1));
  assert.ok(scopeSpans.includes('pr.number'), 'AC-2: asd-phase-scope.md step 1\'s closure write must write pr.number as a field of its own, not only inside the gh pr view command - a closing sprint with pr=null is archived with no PR number and no way to read its merge commit');
  const openSteps = subOf(sectionOf('.asd/workflows/asd-phase-pr.md', 'Steps'), 'Open mode').split(/\n(?=\d+[a-z]?\. )/);
  const createAt = openSteps.findIndex((step) => step.includes('"PR creation"'));
  assert.ok(createAt > 0, 'sanity: pr open mode must open the PR through git-strategy.md "PR creation", in a step after its first, the site the lookup must precede');
  const beforeCreate = openSteps.slice(0, createAt).join('\n');
  assert.ok(beforeCreate.includes('"Merged-unclosed"'), `AC-2: pr open mode must run the head-branch lookup ("PR phase" "Merged-unclosed") before opening a PR - ${lost}`);
  assert.ok(clauses(beforeCreate).some((clause) => clause.includes('`MERGED`') && /merge mode/.test(clause)), `sprint-022 AC-1 (D2): pr open mode must continue in merge mode on a MERGED head-branch hit, opening nothing, so the release runs - ${lost}`);
  assert.ok(clauses(beforeCreate).some((clause) => clause.includes('`OPEN`') && /merge mode/.test(clause)), `AC-2: pr open mode must adopt an OPEN head-branch hit into merge mode instead of opening a second PR - ${lost}`);
  const gate = clauses(home.split('\n\n')[0]).map(spans).filter((clauseSpans) => clauseSpans.includes('pr.number')).flat().map((span) => /^phase="([^"]+)"$/.exec(span)).find(Boolean);
  assert.ok(gate, 'sanity: "Merged-unclosed" must name the `phase="…"` a PR carrying pr.number brings to base');
  const unguarded = `"Merged-unclosed" says a PR pr open mode opened carries phase="${gate[1]}" to base because open mode commits that write before any push; the PR head is base's copy after a squash merge, so a write left uncommitted at the push leaves base at retro's phase and makes that statement false (impl-review wave-1/iter-04 #1)`;
  const openPaths = clauses(beforeCreate).filter((clause) => !clause.includes('`MERGED`'));
  const adoptAt = openPaths.findIndex((clause) => clause.includes('`OPEN`') && /merge mode/.test(clause));
  const gateWrites = openPaths.map((clause, at) => ({ clause, at })).filter(({ clause }) => spans(clause).some((span) => span.replace(/"/g, '') === `phase=${gate[1]}`));
  assert.ok(gateWrites.length > 0, `AC-2: pr open mode must write the phase="${gate[1]}" "Merged-unclosed" says base carries, before opening a PR - ${unguarded}`);
  assert.deepStrictEqual(gateWrites.filter(({ clause }) => !/\bcommit/i.test(clause.replace(/`[^`]*`/g, ''))).map(({ clause }) => clause.trim()), [], `AC-2: every pr open mode clause writing phase="${gate[1]}" must commit it on the sprint branch, before step 3's PR-creation push - ${unguarded}`);
  assert.ok(gateWrites.some(({ at }) => at <= adoptAt), `AC-2: pr open mode must commit phase="${gate[1]}" before adopting an OPEN hit into merge mode, so the adopted PR's head carries it too - ${unguarded}`);
  assert.ok(openPaths.slice(0, adoptAt + 1).some((clause) => /self-hosting/i.test(clause) && /\bversion\b/i.test(clause)), 'AC-2: pr open mode must bump the self-hosting version before adopting an OPEN hit into merge mode - an adopted PR merged without it releases under the previous version (impl-review wave-1/iter-04 #1, folded medium)');
});

test('sprint-022 AC-1 (D2), iter-01 external #1/#2, combined #1, iter-02 combined #2: git-strategy.md "Versioning & Changelog (self-hosting only)" publishes the release in pr merge mode after fetching base, on the base commit carrying the sprint\'s bump or FAILED, creating the tag only when absent locally and on origin, pushing it only when absent on origin, and skipping each step already done, and a missing release commit, tag or release makes asd-sprint request a user decision to retry in merge mode or continue without it, at its home and in asd-sprint Step 1', () => {
  const release = sectionOf('.asd/rules/git-strategy.md', 'Versioning & Changelog (self-hosting only)').split('\n\n').find((paragraph) => paragraph.includes('`gh release create')) || '';
  const trigger = release.split(':')[0];
  assert.ok(/merge mode/.test(trigger) && !/closure/i.test(trigger), `AC-1: the release runs in pr merge mode once the merge is confirmed, never at the closure write - the next scope's closure write is no longer gated and may come much later; got: ${trigger}`);
  const [fetchAt, mergeCommitAt] = ['`git fetch origin <git.base_branch>`', '--json mergeCommit`'].map((token) => release.indexOf(token));
  assert.ok(fetchAt >= 0 && fetchAt < mergeCommitAt, 'AC-1 (D2): the release fetches git.base_branch before it reads the merge commit - the squash merge commit is not local on the sprint branch');
  const steps = release.split(/;\s/);
  const tagStep = steps.find((clause) => spans(clause).some((span) => span.startsWith('git push origin v'))) || '';
  const releaseStep = steps.find((clause) => spans(clause).some((span) => span.startsWith('gh release create'))) || '';
  assert.ok(spans(releaseStep).some((span) => span.startsWith('gh release view')), 'AC-1 (D2): the release step is skipped when gh release view finds it - idempotency is per step, so a tag pushed before a failed release still gets its release');
  const tagCreate = tagStep.slice(0, tagStep.indexOf('`git push origin v'));
  const tagPush = tagStep.slice(tagCreate.length);
  assert.ok(spans(tagCreate).some((span) => span.includes('refs/tags/v<asd_version>')), 'external #2: the tag is created only when it is absent locally (refs/tags/v<asd_version>) - a tag created before a failed push makes the retry\'s tag creation fail with "already exists" when creation is keyed to origin alone, so the retry never succeeds');
  assert.ok(spans(tagCreate).some((span) => span.startsWith('git ls-remote --tags origin')), 'iter-02 combined #2: the tag is created only when it is also absent on origin (git ls-remote --tags origin) - a retry from a second clone that finds the tag on origin but not locally would otherwise make a second tag object, and a later git fetch --tags rejects it as clobbering');
  assert.ok(spans(tagPush).some((span) => span === 'origin' || span.startsWith('git ls-remote --tags origin')), 'AC-1 (D2): the tag is pushed only when it is absent on origin - a retry after a failed release must not re-push the tag');
  const mergeRead = spans(release).find((span) => /^git show <merge_commit>:\S+$/.test(span));
  assert.ok(mergeRead, 'sanity: the release reads asd_version at the merge commit with git show <merge_commit>:<manifest>');
  const bumpMissing = 'external #1: a PR merged before open mode\'s bump carries the previous version, whose tag and release already exist, so the sprint reads as released and is archived without its own release';
  assert.ok(spans(release).includes(mergeRead.replace('<merge_commit>:', '<merge_commit>^:')), `${bumpMissing} - the release commit's asd_version must be compared with its parent's`);
  const heading = (/`(## v<version>)`/.exec(sectionOf('.asd/rules/git-strategy.md', 'Versioning & Changelog (self-hosting only)')) || [])[1];
  assert.ok(heading && spans(release).includes(heading.replace('<version>', '<asd_version>')), `${bumpMissing} - the release commit must also carry the CHANGELOG heading open mode adds (${heading})`);
  const followUp = spans(release).find((span) => span.startsWith('git log')) || '';
  assert.ok(/\s--reverse\b/.test(followUp) && followUp.includes('<merge_commit>..origin/<git.base_branch>') && followUp.endsWith(`-- ${mergeRead.split(':')[1]}`), `${bumpMissing} - a merge commit without the bump yields to the FIRST later base commit touching the manifest (git log --reverse <merge_commit>..origin/<git.base_branch> -- <manifest>); newest-first picks a later sprint's bump; got: ${followUp}`);
  const noBump = release.split(/;\s|(?<=\.)\s/).find((clause) => clause.includes('`FAILED`')) || '';
  assert.ok(spans(noBump).includes('asd_version') && /\bCHANGELOG\b/.test(noBump) && /\bfollow-up PR\b/.test(noBump), `${bumpMissing} - with no base commit carrying the bump the release is FAILED naming the recovery, a follow-up PR bumping asd_version with its CHANGELOG section; got: ${noBump}`);
  const releaseCommit = 'external #1: "no release commit" is a missing release - without it in the condition, a merge commit lacking the bump reads as released through the previous version\'s tag';
  assert.ok(release.includes('the release commit'), 'sanity: git-strategy.md defines "the release commit" the release targets');

  const home = sectionOf('.asd/rules/sprint-lifecycle.md', 'PR phase').split('**Merged-unclosed**')[1].split('\n\n')[0];
  const homeRetry = home.split(/(?<=\.)\s/).find((sentence) => spans(sentence).some((span) => span.startsWith('gh release view'))) || '';
  assert.ok(spans(homeRetry).some((span) => span.startsWith('git ls-remote --tags origin')) && /merge mode/.test(homeRetry), '"Merged-unclosed" retry route: a tag absent on origin or a failing gh release view sends the sprint back to merge mode');
  assert.ok(/\brelease commit\b/.test(homeRetry.replace(/`[^`]*`/g, '')), `"Merged-unclosed": ${releaseCommit}`);
  const noExit = 'combined #1 (user answer 2026-09-30): a release that keeps failing held every new sprint behind a retry with no exit, so asd-sprint asks the user each time - retry, or continue without the release, recorded in the closing sprint\'s decisions log';
  assert.ok(/\buser decision\b/.test(homeRetry), `"Merged-unclosed": ${noExit}`);
  const homeContinue = homeRetry.split(/;\s/).find((clause) => /\bcontinue\b/.test(clause)) || '';
  const actor = spans(homeContinue).find((span) => span.startsWith('decision_actor:'));
  assert.ok(actor === 'decision_actor: user' && /\bdecisions log\b/.test(homeContinue), `"Merged-unclosed": the continue option is recorded in the decisions log as the user's decision - ${noExit}; got: ${homeContinue}`);
  const homeSentences = home.split(/(?<=\.)\s/);
  const afterRetry = homeSentences[homeSentences.indexOf(homeRetry) + 1] || '';
  assert.ok(/\bcontinue\b/.test(afterRetry) && /new-sprint flow/.test(afterRetry), `"Merged-unclosed": a continue choice enters the new-sprint flow - ${noExit}`);
  const scopeStep = stepOf(sectionOf('.asd/workflows/asd-phase-scope.md', 'Steps'), 1);
  const logClause = scopeStep.split(/;\s/).find((clause) => clause.includes('`decisions-log.md`')) || '';
  assert.ok(spans(logClause).includes(actor), `asd-phase-scope.md step 1: the closure write's decisions-log entry names a continue choice asd-sprint carries (${actor}) - ${noExit}`);
  const sprintSkill = canonText('.asd/skills/asd-sprint/SKILL.md');
  const stepOne = sprintSkill.split('### Step 1:')[1].split('\n### ')[0].split('\n');
  const skillRetry = stepOne.find((line) => spans(line).includes('self_hosting: enabled') && line.includes('→')) || '';
  const [skillCondition, skillRoute = ''] = skillRetry.split('→');
  assert.ok(/\btag\b/.test(skillCondition.replace(/`[^`]*`/g, '')) && /\brelease\b/.test(skillCondition.replace(/`[^`]*`/g, '')), `asd-sprint Step 1 routes a self-hosting merged-unclosed sprint to the release retry when its tag OR its release is missing; got: ${skillCondition}`);
  assert.ok(/\brelease commit\b/.test(skillCondition.replace(/`[^`]*`/g, '')), `asd-sprint Step 1: ${releaseCommit}`);
  assert.ok(skillRoute.includes('`asd-phase-pr`') && /merge mode/.test(skillRoute), 'asd-sprint Step 1\'s release retry dispatches asd-phase-pr, whose merge mode runs only the missing release and issue-close steps');
  assert.ok(/\buser decision\b/.test(skillRoute), `asd-sprint Step 1: ${noExit}`);
  assert.ok(skillRoute.split(/;\s/).some((clause) => /\bcontinue\b/.test(clause)) && (stepOne[stepOne.indexOf(skillRetry) + 1] || '').includes('Step 2A'), `asd-sprint Step 1: the continue option takes the next route, the new-sprint flow (Step 2A) - ${noExit}`);
  const logHead = followUp.split(' ').slice(0, 2).join(' ');
  assert.ok((jsonOf('.asd/skills/asd-sprint/SKILL.md', 'Preconditions').ops.find((op) => op.startsWith('run command')) || '').includes(logHead), `asd-sprint Preconditions ops: run command must list ${logHead}, the follow-up search Step 1's release-commit check runs`);

  const opening = sectionOf('.asd/rules/sprint-lifecycle.md', 'PR phase').split('\n\n')[1] || '';
  const note = opening.split(/(?<=\.)\s/).find((sentence) => sentence.startsWith('`NEXT: done`')) || '';
  assert.ok(spans(note).includes('phase="pr"'), 'D1: "PR phase" says once that NEXT: done names completion, not a write - phase stays "pr" on base until the closure write, or NEXT: done reads as an early phase="done" write');
});

test('sprint-022 AC-5 (D5): the orchestrator ticks a wave\'s plan.md checkboxes after its last signal and devs never edit plan.md, at the home and in asd-phase-impl steps 7 and 8', () => {
  const home = sectionOf('.asd/workflows/asd-phase-impl.md', 'Rules').split('\n').find((line) => line.includes('`<sprint>/plan.md`') && line.includes('`MEMORY.md`')) || '';
  const clauses = home.split(/;\s/);
  assert.ok(clauses.some((clause) => /\bnever\b/.test(clause) && clause.includes('`<sprint>/plan.md`') && /step 7 ticks it/.test(clause)), 'AC-5: impl "Rules" - devs never edit plan.md, step 7 (the orchestrator) ticks it, so concurrent Tasks never race on one file (021 A-3)');
  assert.ok(clauses.some((clause) => /more than one Task/.test(clause) && clause.includes('`MEMORY.md`') && clause.includes('`memory_index`')), 'AC-5: in a wave of more than one Task, devs leave a shared MEMORY.md untouched and return their index line as memory_index in COMPLETED');
  const impl = sectionOf('.asd/workflows/asd-phase-impl.md', 'Steps');
  const tickedBy = (step) => stepOf(impl, step).split(/(?<=\.)\s|;\s/).filter((clause) => clause.includes('`plan.md`') && /\btick(?:s)?\b/.test(clause));
  assert.ok(tickedBy(7).some((clause) => /last signal/.test(clause)), 'AC-5: asd-phase-impl step 7 - the orchestrator ticks after the wave\'s last signal');
  assert.ok(tickedBy(8).length > 0 && tickedBy(8).every((clause) => /\bstep 7\b/.test(clause) || /\borchestrator\b/.test(clause)), 'AC-5: asd-phase-impl step 8 - a resumed manual-blocked task\'s checkboxes are ticked as step 7 does, by the orchestrator, not the dev');
  assert.ok(stepOf(impl, 9).includes('`<sprint>/plan.md`'), 'AC-5: asd-phase-impl step 9\'s authorised-paths gate must admit the plan.md step 7 writes - otherwise the orchestrator\'s own tick commit fails the gate as an unauthorised path');
});

test('sprint-023 AC-9: providers.md "Task-class variants and routing" gives priorTier only to a re-dispatch of the same task_routing key and routes a review-fix id from its own Material risk declaration while asd-tester stays unrouted, and each acting workflow, the red-test-defect re-run included, cites that rule', () => {
  const sentences = sectionOf('.asd/rules/providers.md', 'Task-class variants and routing').split(/(?<=\.)\s/);
  assert.ok(sentences.some((sentence) => spans(sentence).includes('priorTier') && spans(sentence).includes('task_routing')), 'the rule must tie priorTier to the tier recorded under the same task_routing key - a re-dispatch of that id - or a later entry inherits the first one\'s tier');
  const ids = ['review-fix <id>'];
  const retired = ['impl-test entry N', 'test-fix <D-ids>', 'impl-review <id> test-fix', 'impl-review <id> suite'];
  const fresh = sentences.find((sentence) => ids.every((id) => spans(sentence).includes(id))) || '';
  assert.ok(fresh && spans(fresh).includes('priorTier') && /its `risks` are the orchestrator's own `Material risk` declaration/.test(fresh) && !/Material risk lines of the plan Tasks|Tasks whose paths/.test(fresh) && spans(fresh).includes('standard'), `the rule must name the id ${ids.join(', ')} as new each time - no priorTier - and route it from the orchestrator's own Material risk declaration for that dispatch's delta, none declared meaning standard; unnamed, a prose-only delta inherits the risk of every Task whose paths it touches`);
  assert.deepStrictEqual(retired.filter((id) => sentences.some((sentence) => spans(sentence).some((span) => span.startsWith(id)))), [], 'asd-tester is unrouted, so the rule names no tester-side id - impl-test entries, test-fix rounds, the in-place test fix and terminal-suite runs - as a routed key; a named one would resurrect a task_routing record nothing writes');
  assert.ok(sentences.some((sentence) => spans(sentence).includes('asd-tester') && /\bunrouted\b/.test(sentence) && /\bbase\b/.test(sentence)), 'the rule must say asd-tester is unrouted and dispatches as the base agent');
  const variantNote = /\(no `-standard` variant exists[^)]*\)/;
  for (const [rel, step] of [['.asd/workflows/asd-phase-impl-test.md', '1a'], ['.asd/workflows/asd-phase-impl.md', '5a'], ['.asd/workflows/asd-phase-impl-review.md', 8], ['.asd/workflows/asd-phase-impl-review.md', 9]]) {
    assert.ok(stepOf(sectionOf(rel, 'Steps'), step).replace(variantNote, '').includes('`providers.md` "Task-class variants and routing"'), `${rel} step ${step} must cite the routing rule for its tier and risks beyond the no-standard-variant note - restating the clamp or citing nothing is how the first entry's tier kept clamping later deltas`);
  }
  const redTest = stepOf(sectionOf('.asd/workflows/asd-phase-impl-review.md', 'Steps'), 9).split('\n').find((line) => line.includes('**Red, test defect**')) || '';
  assert.ok(redTest.includes('`providers.md` "Task-class variants and routing"'), `.asd/workflows/asd-phase-impl-review.md step 9 must keep a **Red, test defect** bullet that cites the routing rule for the re-run's own id - the step's dispatch sentence cites it for the first run only, and a re-run left to that one is routed under the first run's id and clamped to its tier`);
});

test('sprint-025 AC-3/AC-7/AC-8: every phase workflow states its timing ops, every phase skill pre-approves the runtime it runs them with, and the commands, ledger, update choice and Sprint-mediated mode keep their homes', () => {
  const phases = fs.readdirSync(path.join(REPO_ROOT, '.asd/workflows')).filter((file) => /^asd-phase-.*\.md$/.test(file));
  assert.ok(phases.length > 0);
  for (const file of phases) {
    const text = canonText(`.asd/workflows/${file}`);
    const token = file === 'asd-phase-retro.md' ? 'timing-summary' : "'Operation timing'";
    assert.ok(text.includes(token) || text.includes(token.replace(/'/g, '"')), `${file} must carry its timing binding (${token})`);
  }
  for (const name of fs.readdirSync(path.join(REPO_ROOT, '.asd/skills')).filter((skill) => /^asd-phase-/.test(skill))) {
    const tools = sync.parseCanonicalFrontmatter(canonText(`.asd/skills/${name}/SKILL.md`)).meta.claude['allowed-tools'];
    assert.ok(/(^|\s)Bash(\s|$)/.test(tools) || tools.includes('Bash(node .asd/runtime.js:*)'), `${name} runs runtime.js timing commands, so its allowed-tools must pre-approve them`);
  }
  const readme = canonText('README.md');
  for (const token of ['timing-recover', 'timing-summary', 'timing.jsonl']) {
    assert.ok(readme.includes(token), `README.md must mirror ${token}`);
  }
  assert.ok(canonText('.asd/rules/artifact-layout.md').includes('timing.jsonl'), 'artifact-layout.md names the ledger path');
  assert.ok(sectionOf('.asd/rules/checkpoints.md', 'Gate policy').split('\n').some((line) => line.startsWith('Hard in both modes:') && line.includes('ASD update')), 'the update choice joins the hard list');
  assert.ok(/ASD update choice[^|]*\|\s*hard approve-before-write/.test(canonText('.asd/rules/checkpoints.md')), 'the gate inventory carries the update choice row');
  assert.ok(/asd-update\/update\.js"? --check-version/.test(canonText('.asd/skills/asd-sprint/SKILL.md')), 'asd-sprint runs the version check');
  assert.ok(canonText('.asd/skills/asd-update/SKILL.md').includes('### Sprint-mediated mode'), 'asd-update keeps its Sprint-mediated mode section');
  assert.ok(canonText('.asd/workflows/asd-phase-scope.md').includes('--create'), 'scope step 1 creates the ledger');
});

test('sprint-026 AC-6 (C-4): every phase workflow whose Dispatch lists ADVICE_NEEDED relays it through agent-protocol.md "Relay"; a workflow that lists none (plan) carries no relay branch', () => {
  for (const rel of FORM_CATEGORIES.workflows.files()) {
    const text = canonText(rel);
    const listed = text.includes('\n## Dispatch') && jsonOf(rel, 'Dispatch').some((row) => (row.signals || []).includes('ADVICE_NEEDED'));
    const relays = text.split('\n').some((line) => line.includes('ADVICE_NEEDED') && /["']Relay["']/.test(line) && line.includes('agent-protocol.md'));
    assert.strictEqual(relays, listed, `${rel}: a Dispatch signals row lists ADVICE_NEEDED exactly when the file relays it per agent-protocol.md "Relay" (C-4) - a listed signal with no relay branch is dropped, a relay branch with no sender is dead`);
  }
});

test('sprint-026 AC-13 (E1/E2): no agent lists a conditional input key (decisions, contracts, audit) as unconditionally required, and the three standalone skills author inline and keep their no-sprint preconditions', () => {
  for (const rel of FORM_CATEGORIES.agents.files()) {
    const inputs = jsonOf(rel, 'Inputs');
    const required = [...inputs.required, ...Object.values(inputs.modes || {}).flatMap((mode) => mode.required)];
    const bare = required.filter((item) => /payload[.]inputs[.](?:decisions|contracts|audit)(?![-a-z])/.test(item) && !item.includes('when present'));
    assert.deepStrictEqual(bare, [], `E1: ${rel} lists a key the orchestrator resolves only under a condition ("Input sources") as required - a dispatch without it would read as a missing required input; list it under optional or qualify it "when present"`);
  }
  for (const skill of ['asd-concept', 'asd-stack', 'asd-design-system']) {
    const rel = `.asd/skills/${skill}/SKILL.md`;
    const requires = jsonOf(rel, 'Preconditions').requires;
    assert.ok(requires.some((item) => item.includes('no active sprint required')), `E2: ${skill} must keep its standalone no-sprint requirement - it authors its document inline for a project with no active sprint`);
    assert.deepStrictEqual(jsonOf(rel, 'Delegates').agents, [], `E2: ${skill} is authored inline by the orchestrator, so it delegates to no agent - a dispatched creator would hit the sprint-only required inputs`);
  }
});

test('sprint-027 AC-3/AC-4/AC-5 (D2-D4): staged solution design has one home, scope step 2 runs it before any AC-N and stops at the approach-choice gate checkpoints.md inventories, the orchestrator performs the research stage itself with no creator dispatch, and every later reader takes research.md through the research input key', () => {
  const home = headingBody('.asd/rules/sprint-lifecycle.md', 'Staged solution design');
  for (const stage of ['(a) **Requirements interview**', '(b) **Research**', '(c) **Refinement interview**']) {
    assert.ok(home.includes(stage), `AC-3: "Staged solution design" must define stage ${stage} - scope step 2 and the template cite the stages, not restate them`);
  }
  assert.ok(home.includes('`<sprint>/research.md`') && home.includes('**Conceptual boundary**') && !home.includes('asd-ba'), 'AC-3/AC-4: the home names the research.md artifact and the conceptual-only boundary, and no BA dispatch - the orchestrator performs stage (b) itself');

  const step = stepOf(sectionOf('.asd/workflows/asd-phase-scope.md', 'Steps'), 2);
  assert.ok(step.includes('`sprint-lifecycle.md` "Staged solution design"'), 'AC-3: scope step 2 must cite the staged-design home');
  const gate = /\[GATE hard: (approach choice)\]/.exec(step);
  assert.ok(gate, 'AC-3: scope step 2 must tag the approach choice as a hard gate');
  assert.ok(step.indexOf(gate[0]) < step.indexOf('stable `AC-N` ids'), 'AC-3: the approach choice is decided before any AC-N is written, or the AC-N cannot follow from the chosen approach');
  assert.ok(headingBody('.asd/rules/checkpoints.md', 'Gate inventory').split('\n').some((row) => row.startsWith(`| ${gate[1]} (`) && row.includes('hard approve-before-write')), `AC-3: checkpoints.md "Gate inventory" must class "${gate[1]}" the way scope step 2 tags it`);
  assert.ok(step.includes('`research.md`'), 'AC-5: scope step 2 must write the research artifact');

  const dispatch = jsonOf('.asd/workflows/asd-phase-scope.md', 'Dispatch');
  assert.deepStrictEqual(dispatch.map((entry) => entry.agent), ['asd-advisor', 'asd-init (skill, sprint-mediated mode)'], 'AC-3, sprint-033 AC-36: scope dispatches the escalation consult and the scope-time settings change through asd-init - research is the own stage (b) of the orchestrator, so no creator is named');
  assert.ok(!fs.existsSync(path.join(REPO_ROOT, '.asd/agents/asd-ba.md')), 'AC-3: no BA agent is left for the research stage to dispatch');

  const readers = headingBody('.asd/rules/sprint-lifecycle.md', 'Input sources').split('\n').find((row) => row.startsWith('| `research` |')) || '';
  assert.ok(readers.includes('`<sprint>/research.md`'), 'AC-5: "Input sources" must resolve the research key to the sprint artifact');
  for (const phase of ['audit', 'design', 'plan']) {
    assert.ok(/research \(sprint-lifecycle\.md 'Input sources'\)/.test(canonText(`.asd/workflows/asd-phase-${phase}.md`)), `AC-5: asd-phase-${phase}.md must read the research input key, or the later phase redoes the stage (b) research`);
  }
  const reentry = step.split('\n').find((line) => line.includes('**Re-entry**')) || '';
  const template = canonText('.asd/templates/t_research.md');
  for (const evidence of ['Requirements', 'Findings', 'Chosen']) {
    assert.ok(reentry.includes(evidence) && template.includes(evidence), `AC-5: the scope re-entry skips a stage only by its ${evidence} evidence in research.md, so t_research.md must carry it`);
  }
  assert.ok(reentry.includes('`{{` placeholder'), 'AC-5: re-entry counts a stage done only when its section holds no template placeholder, or a freshly seeded research.md skips every stage');
  const stageB = step.split('\n').find((line) => line.includes('(b) Research')) || '';
  assert.ok(/write its Findings.*and Approaches to `research.md` at once/.test(stageB), 'AC-5: the research return is written at once, so a session lost before stage (c) re-enters with Findings evidence');
  assert.deepStrictEqual(jsonOf('.asd/workflows/asd-phase-design.md', 'Dispatch').map((entry) => entry.agent), ['asd-advisor'], 'AC-5: design authors its drafts inline from research.md, so it dispatches no creator that would need inputs.research');
});

test('sprint-027 AC-10 (D10): every phase review-policy.md "Memory-fix dispatch" names acts on it at its own step, no other phase does, and each acting site fixes inside the phase - never a D-N, never a transition', () => {
  const home = headingBody('.asd/rules/review-policy.md', 'Autofix vs escalation').split('\n').find((line) => line.startsWith('**Memory-fix dispatch**')) || '';
  const named = /inside the phase that found it — ([^—]+?), at the step its workflow names/.exec(home);
  assert.ok(named, 'AC-10: the home must list the phases that fix a memory finding in place');
  const phases = named[1].split(/, | or /);
  const citing = fs.readdirSync(path.join(REPO_ROOT, '.asd', 'workflows')).filter((file) => /^asd-phase-.+\.md$/.test(file)).filter((file) => canonText(`.asd/workflows/${file}`).includes('"Memory-fix dispatch"')).map((file) => file.replace(/^asd-phase-|\.md$/g, ''));
  assert.deepStrictEqual(citing.sort(), [...phases].sort(), 'AC-10: exactly the phases the home lists cite it - a phase left out silently leaves its memory hit with no owner, one added fixes a hit the rule says it must not');
  assert.ok(home.includes('in a phase whose workflow names no step') && home.includes("at the commit where it arises, before that phase's COMPLETED"), 'AC-10: a phase whose workflow names no memory-fix step (scope, audit, design, design-promote) still meets a memory-check hit at its orchestrator memory commit - the home must say the fix happens there, before that phase COMPLETED, or the hit has no acting site');
  const memoryCheck = headingBody('.asd/rules/git-strategy.md', 'Commit before review').split('\n').find((line) => line.startsWith('**Memory content check**')) || '';
  assert.ok(memoryCheck.includes("before that phase's COMPLETED") && memoryCheck.includes('`review-policy.md` "Memory-fix dispatch"'), 'AC-10: the memory-check sentence must carry the same before-COMPLETED timing as its home, or the commit-site statement and the home disagree');
  const implReviewWrites = jsonOf('.asd/workflows/asd-phase-impl-review.md', 'Exit').writes;
  const memoryFixWrite = implReviewWrites.find((entry) => entry.includes('memory-fix commits')) || '';
  assert.ok(memoryFixWrite.includes('by the owner or orchestrator') && !implReviewWrites.some((entry) => /asd-tester[^"]*and memory-fix/.test(entry)), 'CB-2: impl-review Exit writes attributes memory-fix commits to the owner or orchestrator, never to asd-tester');
  assert.ok(implReviewWrites.some((entry) => entry.startsWith('decisions-log entry') && entry.includes('memory-fix')), 'CB-2: the memory-fix decisions-log line the home requires is listed in impl-review Exit writes');
  assert.ok(jsonOf('.asd/workflows/asd-phase-design-review.md', 'Exit').writes.some((entry) => entry.includes('resolved: lines') && entry.includes('memory-fix commits')), 'CB-2: design-review Exit writes lists the memory-fix resolved: lines and commits its step 9 produces');
  for (const phase of phases) {
    const lines = canonText(`.asd/workflows/asd-phase-${phase}.md`).split('\n').filter((line) => line.includes('"Memory-fix dispatch"') && !line.startsWith('Owner:') && !line.startsWith('impl-review fixes no CODE'));
    assert.ok(lines.length > 0, `AC-10: asd-phase-${phase}.md must act on the dispatch at a step, not only in its header`);
  }
  assert.ok(stepOf(sectionOf('.asd/workflows/asd-phase-impl-test.md', 'Steps'), '7a').includes('never a `D-N`'), 'D10: impl-test step 7a fixes a memory hit in the entry, never through a D-N');
  assert.ok(sectionOf('.asd/workflows/asd-phase-impl-review.md', 'Steps').split('\n').some((line) => line.includes('**Red, memory-caused**') && line.includes('never a `D-N`')), 'D10: impl-review step 9 sends a memory-caused red to its owner, never to a D-N');
  assert.ok(canonText('.asd/agents/asd-tester.md').split('\n').some((line) => line.startsWith('- **memory defect**') && line.includes('never a `D-N`') && line.includes('"Memory-fix dispatch"')), 'D10: the tester reports a memory defect and files no D-N for it');
  const kinds = /`resolved: <finding id, …> — <([^>]+)>, <YYYY-MM-DD>`/.exec(canonText('.asd/rules/sprint-lifecycle.md'))[1].split(' | ');
  assert.ok(kinds.includes('memory-fix') && home.includes('— memory-fix, <YYYY-MM-DD>`'), 'D10: memory-fix is a resolved: kind State recovery admits, or the next review-fix round collects the fixed finding again');
});

const CAP_STANDALONE_SKILLS_BYTES = 62351;

/** Committed (LF) bytes of the canon files `rels` summed. */
function lfBytes(rels) {
  return rels.reduce((sum, rel) => sum + Buffer.byteLength(canonText(rel)), 0);
}

test('sprint-026 AC-15: the standalone skills total at most their baseline of 62,351 bytes (61,051 on main plus the asd-init adoption text of sprint 037)', () => {
  const skills = FORM_CATEGORIES.skills.files();
  const workflows = FORM_CATEGORIES.workflows.files();
  assert.strictEqual(skills.length, 7, 'the seven standalone skills');
  assert.ok(workflows.length >= 11, 'the phase workflows');
  assert.ok(lfBytes(skills) <= CAP_STANDALONE_SKILLS_BYTES, `standalone skills total ${lfBytes(skills)} B, cap ${CAP_STANDALONE_SKILLS_BYTES}`);
});

test('sprint-028 AC-2/AC-4 (D3/D4/D7), sprint-033 AC-5: the cleanup workflow runs inline and dispatches only the read-only scout and the advisor, and its decisions-log checkpoint and record lines and its removal commit subject are the forms the rule home, t_decisions-log.md and git-strategy.md state - the evidence its re-entry reads', () => {
  const workflow = canonText('.asd/workflows/asd-phase-cleanup.md');
  const owner = workflow.split('\n').find((line) => line.startsWith('Owner:')) || '';
  const agents = fs.readdirSync(path.join(REPO_ROOT, '.asd/agents')).map((file) => file.replace(/\.md$/, ''));
  const dispatched = jsonOf('.asd/workflows/asd-phase-cleanup.md', 'Dispatch').map((row) => row.agent).sort();
  assert.ok(owner.includes('inline orchestrator'), 'AC-2: cleanup runs in the orchestrator itself');
  assert.deepStrictEqual(dispatched, ['asd-advisor', 'asd-scout'], 'AC-2, sprint-033 AC-5: the Dispatch section holds the read-only candidate scan and the escalation consult - no creator');
  assert.deepStrictEqual(agents.filter((agent) => owner.includes(`\`${agent}\``)), dispatched, 'AC-2: the Owner line names exactly the agents the Dispatch section lists');
  const home = runtime.markdownSection(canonText('.asd/rules/sprint-lifecycle.md'), 'Cleanup phase');
  for (const [label, text] of [['sprint-lifecycle.md "Cleanup phase"', home], ['asd-phase-cleanup.md', workflow], ['t_decisions-log.md', canonText('.asd/templates/t_decisions-log.md')]]) {
    assert.ok(text.includes('— cleanup checkpoint <'), `AC-4/D7: ${label} must state the checkpoint line re-entry looks for`);
    assert.ok(text.includes('— cleanup: removed <'), `AC-4/D7: ${label} must state the record line that marks the phase done`);
  }
  for (const [label, text] of [['sprint-lifecycle.md "Cleanup phase"', home], ['asd-phase-cleanup.md', workflow], ['git-strategy.md', canonText('.asd/rules/git-strategy.md')]]) {
    assert.ok(text.includes('chore(cleanup):'), `AC-4: ${label} must name the removal commit subject form`);
  }
});

test('sprint-028 AC-6/AC-20 (D6/D14): the frozen cleanup and design_system flags are seeded end to end - scope step 3a fills the placeholders t_state.json carries, the cleanup no-op appends the skipped_phases entry the no-op table row keys on', () => {
  const seed = stepOf(sectionOf('.asd/workflows/asd-phase-scope.md', 'Steps'), '3a');
  const state = readRepoFile('.asd/templates/t_state.json');
  for (const key of ['cleanup', 'design_system']) {
    const placeholder = new RegExp(`"${key}":\\s*"(\\{\\{[A-Z_]+\\}\\})"`).exec(state);
    assert.ok(placeholder, `t_state.json must freeze ${key} as a placeholder`);
    assert.ok(seed.includes(placeholder[1]), `scope step 3a must fill ${placeholder[1]}, or the literal survives into state.json and reads as an enabled ${key} whatever the config says`);
  }
  const noOp = stepOf(sectionOf('.asd/workflows/asd-phase-cleanup.md', 'Steps'), '2');
  assert.ok(noOp.includes('skipped_phases') && noOp.includes('"cleanup"'), 'the disabled no-op must append "cleanup" to skipped_phases');
  const row = runtime.markdownSection(canonText('.asd/rules/sprint-lifecycle.md'), 'No-op phase rule').split('\n').find((line) => line.startsWith('| cleanup |'));
  assert.ok(row && row.includes('`cleanup`') && row.includes('`false`'), 'the no-op phase table must key the cleanup row on the frozen flag being false');
});

test('sprint-028 AC-4/AC-5 (review-fix): cleanup verification runs the configured lint beside build and tests, and a re-entry discards uncommitted paths against HEAD, never the checkpoint sha that would undo committed removals', () => {
  const workflow = sectionOf('.asd/workflows/asd-phase-cleanup.md', 'Steps');
  const home = runtime.markdownSection(canonText('.asd/rules/sprint-lifecycle.md'), 'Cleanup phase');
  const verification = home.split('\n').find((line) => line.startsWith('3. Verification:')) || '';
  for (const [label, text] of [['asd-phase-cleanup.md step 5', stepOf(workflow, '5')], ['sprint-lifecycle.md "Cleanup phase" Verification', verification]]) {
    assert.ok(text.includes('`commands.yaml`') && text.includes('`lint`'), `AC-5: ${label} must run the project's configured lint - a verification of build and tests alone lets a lint-red removal commit`);
  }
  const reentry = stepOf(workflow, '3');
  assert.ok(reentry.includes('git restore --source=HEAD --staged --worktree') && !reentry.includes('--source=<sha>'), 'AC-4: a checkpoint line without a record line discards uncommitted paths against HEAD - restoring from the checkpoint sha would revert the committed removals the re-entry keeps');
});

test('sprint-028 AC-12 (review-fix): the design Authoring loop appends a per-section lock line on Lock in, the evidence a re-entry reads to tell a locked section from a drafted one', () => {
  const authoring = canonText('.asd/workflows/asd-phase-design.md').split('\n').find((line) => line.startsWith('- **Authoring**')) || '';
  assert.ok(authoring.includes('§ `<section>` locked'), 'a section holding content but no lock line is a pending Lock in; without the lock line shape a re-entry silently skips a section the user never locked or re-asks one they did');
});

test('sprint-028 AC-12 (review-fix): every phase skill pre-approves Grep and the inline-research phases pre-approve WebSearch and WebFetch, so their inline steps never stall on a permission prompt', () => {
  const INLINE_RESEARCH_PHASES = ['audit', 'plan', 'scope', 'design', 'design-promote'];
  const toolsOf = (name) => sync.parseCanonicalFrontmatter(canonText(`.asd/skills/${name}/SKILL.md`)).meta.claude['allowed-tools'].split(/\s+/);
  const phaseSkills = fs.readdirSync(path.join(REPO_ROOT, '.asd/skills')).filter((skill) => /^asd-phase-/.test(skill));
  assert.ok(INLINE_RESEARCH_PHASES.every((phase) => phaseSkills.includes(`asd-phase-${phase}`)), 'the research phase list names only existing phase skills');
  for (const name of phaseSkills) {
    const tools = toolsOf(name);
    assert.ok(tools.includes('Grep'), `${name}: allowed-tools must hold Grep`);
    if (INLINE_RESEARCH_PHASES.includes(name.slice('asd-phase-'.length))) {
      for (const tool of ['WebSearch', 'WebFetch']) {
        assert.ok(tools.includes(tool), `${name}: its inline research and fetch steps need ${tool} pre-approved`);
      }
    }
  }
});

test('sprint-028 AC-17 (D10): every workflow step holding a failure- or question-class hard gate - reviewer question, FAIL escalation, review-cap override, stalemate - takes the escalation consult before it asks the user', () => {
  const escalationGate = /\[GATE hard: [^\]]*(?:FAIL escalation|review-cap override|reviewer question|stalemate)[^\]]*\]/;
  const workflows = fs.readdirSync(path.join(REPO_ROOT, '.asd/workflows')).filter((file) => /^asd-phase-.*\.md$/.test(file));
  const gated = workflows.flatMap((file) => sectionOf(`.asd/workflows/${file}`, 'Steps').split(/\n(?=\d+[a-z]?\. )/).filter((block) => escalationGate.test(block)).map((block) => ({ file, step: block.split('. ')[0], consulted: /escalation consult/i.test(block) })));
  assert.ok(gated.length >= 5 && new Set(gated.map(({ file }) => file)).size >= 3, `sanity: the gate scan must reach the steps of at least three workflows (found ${JSON.stringify(gated)})`);
  assert.deepStrictEqual(gated.filter(({ consulted }) => !consulted).map(({ file, step }) => `${file} step ${step}`), [], 'AC-17: a user escalation caused by a question or failure is preceded by an advisor recommendation (agent-protocol.md "Relay" Escalation consult); a step that asks the user without it leaves the sprint\'s recommendation-before-escalation contract unmet at that site');
});

test('sprint-029 AC-1/AC-2/AC-3/AC-4/AC-5/AC-6/AC-7/AC-8: the consumer retro writes the issue shape the self-hosting scope reads, the labels scope applies are the labels it ensures, the `(issue #N)` scope writes is the one pr reads, no self-hosting PR text carries a closing keyword and the consumer form alone does, and upstream_issues is gated, collected and shipped', () => {
  const published = stepOf(sectionOf('.asd/workflows/asd-phase-retro.md', 'Steps'), 7);
  const triage = stepOf(sectionOf('.asd/workflows/asd-phase-scope.md', 'Steps'), '2a');
  const accept = stepOf(sectionOf('.asd/workflows/asd-phase-scope.md', 'Steps'), 4);
  assert.ok(published.includes('`<!-- asd-retro-finding v1 -->`') && published.includes('-t "[asd-retro] '), 'AC-1/AC-2: retro step 7 must write the marker comment line and the [asd-retro] title prefix - scope triage classifies an issue standard by exactly these two literals');
  assert.ok(triage.includes('exact `[asd-retro] ` title prefixes') && triage.includes('`asd-phase-retro.md` step 7 issue shape'), 'AC-4/AC-5: scope triage must filter on the title prefix retro writes and judge the shape by retro step 7, or every published issue reads non-standard or none does');
  assert.ok(/self_hosting` is not `enabled`/.test(published) && published.includes('`upstream_issues` is not `disabled`'), 'AC-1/AC-8: retro publishes only for a non-self-hosting project whose upstream_issues is not disabled');
  assert.ok(/`self_hosting: enabled` only/.test(triage), 'AC-4: issue triage runs under self-hosting only');
  const consumerCheck = 'Check the body holds nothing from the consumer project';
  assert.ok(published.includes(consumerCheck) && published.indexOf(consumerCheck) < published.indexOf('gh issue create'), 'AC-2: retro step 7 must check the body for consumer-project content before gh issue create - without it a published issue can leak the consumer project\'s ids, paths or code');
  const titleStripped = (/first strip from the guardrail text every ([^()]*?) \(/.exec(published) || [])[1];
  assert.ok(titleStripped, 'sanity: retro step 7.3 must state the characters stripped from the title text');
  assert.ok(titleStripped.includes('backtick') && ['$', '\\', '"', '“', '”', '„'].every((char) => spans(titleStripped).includes(char)), 'AC-1: retro step 7.3 must strip backtick, $, backslash, the straight double quote and the typographic double quotes from the guardrail text - a consumer-derived title is double-quoted into a shell, where each expands or closes the quote (PowerShell reads the typographic ones as quotes)');
  assert.ok(!published.includes('docs/'), 'AC-1: retro step 7 runs in a consumer project, where ASD docs/ files are not shipped - a path under docs/ in it points at nothing');
  assert.ok(published.includes('`gh auth status` failing skips every row') &&published.includes('A failing create skips that row; no retry') && published.includes('retro completes whatever is skipped'), 'AC-3: a failing gh auth or create must skip rows and let the retro complete, never block it');
  assert.ok(triage.includes('--duplicate-of <original>') && triage.includes('`-r duplicate -c <link to the row at HEAD>`'), 'AC-4: an issue duplicating a backlog row has no issue number, so triage closes it with -r duplicate and a link instead of --duplicate-of');
  assert.ok(triage.includes('gh issue list -R <repo> -s closed -l asd-retro'), 'AC-4: the duplicate comparison set must include closed asd-retro issues, or a re-filed closed duplicate stays open');
  const issueCalls = [published, triage, accept, sectionOf('.asd/rules/git-strategy.md', 'Versioning & Changelog (self-hosting only)'), canonText('.asd/rules/sprint-lifecycle.md')].flatMap((text) => [...text.matchAll(/gh issue (?:view|close|edit|list|create) [^`]*/g)].map((match) => match[0]));
  assert.ok(issueCalls.some((call) => call.startsWith('gh issue view')) && issueCalls.some((call) => call.startsWith('gh issue close')), 'sanity: the release and triage issue calls must still be found');
  assert.deepStrictEqual(issueCalls.filter((call) => !call.includes(' -R ')), [], 'AC-7: every gh issue call must name the framework repo with -R - the checkout of a consumer or a forked remote is not the repo the issues live in');

  const retroGrants = sync.parseCanonicalFrontmatter(canonText('.asd/skills/asd-phase-retro/SKILL.md')).meta.claude['allowed-tools'];
  const retroGhCalls = [...new Set([...published.matchAll(/\bgh ([a-z]+ [a-z]+)/g)].map((match) => match[1]))];
  assert.ok(retroGhCalls.includes('issue create') && retroGhCalls.includes('auth status'), 'sanity: retro step 7 must still name its gh calls');
  assert.deepStrictEqual(retroGhCalls.filter((call) => !retroGrants.includes(`Bash(gh ${call}:*)`)), [], 'AC-1: every gh call retro step 7 runs must be pre-approved in asd-phase-retro allowed-tools, or the inline step stalls on a permission prompt before any issue is published');

  const ensured = (/Labels to ensure: ([^(;]*?) \(/.exec(triage) || [])[1];
  assert.ok(ensured, 'sanity: scope step 2a must name the labels it ensures');
  const ensuredLabels = spans(ensured);
  const applied = [...labelsAdded(triage), ...labelsAdded(accept)];
  assert.ok(applied.includes('wontfix') && applied.includes('deferred') && applied.includes('duplicate'), 'AC-4/AC-6: scope must apply the duplicate, wontfix and deferred labels');
  assert.deepStrictEqual([...new Set(labelsAdded(triage))].filter((label) => !ensuredLabels.includes(label)), [], 'AC-4/AC-6: every label step 2a applies must be one step 2a first ensures exists, or `gh issue edit --add-label` fails on a fresh repo');
  assert.ok(accept.includes('each label a disposition writes is first ensured') && accept.includes('ensured as in step 2a'), 'AC-4/AC-6: every label step 4 applies (wontfix, deferred) is ensured by step 4 before its write, by the step 2a ensure');

  assert.ok(accept.includes('the `AC-N` text ends `(issue #N)`'), 'AC-6: scope step 4 writes an included issue into its AC-N as (issue #N)');
  const release = sectionOf('.asd/rules/git-strategy.md', 'Versioning & Changelog (self-hosting only)');
  assert.ok(release.includes('each `(issue #N)` in the merged `sprint.md`') && canonText('.asd/workflows/asd-phase-pr.md').includes('each `(issue #N)` in `sprint.md`'), 'AC-7: pr open and merge mode read the (issue #N) marker scope step 4 writes');
  for (const rel of ['.asd/workflows/asd-phase-pr.md', '.asd/templates/t_pr-description.md', '.asd/rules/git-strategy.md']) {
    const text = canonText(rel);
    assert.ok(text.includes('Refs #'), `AC-7: ${rel} must reference an included issue as Refs #N`);
    const keyword = '\\b(?:Closes|Fixes|Resolves) #(?:N|\\{\\{N\\}\\}|\\d+)';
    if (rel === '.asd/rules/git-strategy.md') {
      assert.deepStrictEqual(text.match(new RegExp(keyword, 'gi')) || [], [], `AC-7: ${rel} must never put a closing keyword before an issue number - under self_hosting the merge would close it before the release`);
      continue;
    }
    assert.ok(new RegExp(`${keyword}\`?\\s+(?:\\(consumer project\\)|in a consumer project)`, 'i').test(text), `sprint-034 AC-4: ${rel} must carry the closing keyword for a consumer project's included issue`);
    assert.ok(/Refs #(?:N|\{\{N\}\})`? (?:\(`self_hosting`|under `self_hosting`)/.test(text), `AC-7, sprint-034 AC-4: ${rel} must keep Refs #N, never a closing keyword, for a self_hosting included issue - the merge would close it before the release`);
  }

  const template = canonText('.asd/templates/t_config.yaml');
  assert.ok(/^upstream_issues: enabled\b/m.test(template), 'AC-8: t_config.yaml ships upstream_issues enabled - absent reads enabled');
  for (const rel of ['.asd/skills/asd-init/SKILL.md', '.asd/workflows/asd-phase-retro.md', 'README.md']) {
    assert.ok(canonText(rel).includes('upstream_issues'), `AC-8: ${rel} must name the upstream_issues key`);
  }
});

test('sprint-030 AC-1/AC-2/AC-3/AC-6: the Matrix holds the one ASD-repo issue-language row, every canon site writing issue text cites it, retro renders the published issue in English, scope rewrites a non-English marker issue in place before triage rules 1-4 and logs it, and an interview question defines its framework terms', () => {
  const issueRows = headingBody('.asd/rules/language-policy.md', 'Matrix').split('\n').filter((row) => row.startsWith('|') && /\bissues?\b/i.test(row.split('|')[1]));
  const matrixRows = issueRows.filter((row) => row.split('|')[1].includes('ASD repo'));
  const consumerRows = issueRows.filter((row) => row.split('|')[1].includes('consumer project'));
  assert.strictEqual(matrixRows.length, 1, 'AC-1: the Matrix must hold exactly one ASD-repo issue-language row - its one home');
  assert.ok(consumerRows.length === 1 && consumerRows[0].includes('`language.docs`') && issueRows.length === 2, 'sprint-034 AC-3: the Matrix must hold exactly one more issue row, the consumer project\'s own-repository comments in language.docs - never a second ASD-repo row');
  assert.ok(/English, always/.test(matrixRows[0]) && matrixRows[0].includes('`language.chat`') && matrixRows[0].includes('`language.docs`'), 'AC-1: the row must state English whatever language.chat and language.docs say');
  const cite = '`language-policy.md` "Matrix"';
  const writers = canonMarkdownFiles().filter((rel) => !rel.startsWith('.asd/skills/') && /gh issue (?:create|close) /.test(canonText(rel)));
  assert.ok(['.asd/workflows/asd-phase-retro.md', '.asd/workflows/asd-phase-scope.md', '.asd/rules/git-strategy.md'].every((rel) => writers.includes(rel)), `sanity: the retro, scope and release-close sites must be found among ${JSON.stringify(writers)}`);
  assert.deepStrictEqual(writers.filter((rel) => !canonText(rel).includes(cite)), [], 'AC-1: every canon file that creates or closes an issue must cite the Matrix row, or its text is written in whatever language the session speaks');
  const retro = stepOf(sectionOf('.asd/workflows/asd-phase-retro.md', 'Steps'), 7);
  assert.ok(/in English[^.]*`language\.docs`/.test(retro), 'AC-2: retro step 7 must render the published title and body in English from the row\'s language.docs text');
  const triage = stepOf(sectionOf('.asd/workflows/asd-phase-scope.md', 'Steps'), '2a');
  const edit = 'gh issue edit <n> -R <repo> -t <title> -F <body-file>';
  assert.ok(triage.includes(edit) && triage.indexOf(edit) < triage.indexOf('Per issue, first match'), 'AC-3: scope step 2a must rewrite a non-English issue with gh issue edit -t -F before the first-match rules 1-4 read it');
  assert.ok(triage.slice(0, triage.indexOf(edit)).includes('`<!-- asd-retro-finding v1 -->`'), 'AC-3: the in-place rewrite must be restricted to a listed marker issue (body\'s first line the marker) - the listing also returns hand-filed issues, which rule 1 flags and never auto-closes');
  assert.ok(triage.includes('rewrote #…'),'AC-3: the triage decisions-log line must name the rewritten issues');
  const interview = (sectionOf('.asd/workflows/asd-phase-scope.md', 'Steps').split('\n').find((line) => line.includes('(a) Interview')) || '');
  assert.ok(interview.includes('framework term'), 'AC-6: scope step 2 (a) must have each interview question define the framework terms it uses');
});

test('sprint-031 AC-1/AC-2/AC-3: standard dispatches combined and External Review in design-review while impl-review rosters stay, the design-review workflow and its skill dispatch the agents of that roster under its keys, and a reviewer carries design-review inputs only where a roster dispatches it there', () => {
  const definitions = readWorkflowDefinitions();
  const standard = runtime.loadWorkflow('standard');
  assert.deepStrictEqual(standard.reviewers, { design: ['combined', 'external'], impl: ['quality', 'efficiency', 'external'] }, 'AC-1: standard reviews drafts with combined plus External Review and keeps its impl-review roster');
  assert.deepStrictEqual(runtime.loadWorkflow('lite').reviewers, { design: [], impl: ['combined', 'external'] }, 'AC-1: every lite key stays unchanged');

  const agentOf = (key) => (key === runtime.EXTERNAL_REVIEWER ? 'asd-external-review' : `asd-reviewer-${key}`);
  const dispatched = jsonOf('.asd/workflows/asd-phase-design-review.md', 'Dispatch').map((row) => row.agent).filter((agent) => /^asd-(reviewer|external)/.test(agent));
  assert.deepStrictEqual(dispatched.slice().sort(), standard.reviewers.design.map(agentOf).sort(), 'AC-2: design-review dispatches exactly the agents standard.json names for it - one agent per entry, never a comma-joined pair');
  const keyed = standard.reviewers.design.map((key) => `\`${key}\``).join('/');
  assert.ok(stepOf(canonText('.asd/workflows/asd-phase-design-review.md'), 9).includes(`(keyed ${keyed})`), `AC-2: design-review step 9 keys reviews.design.verdicts ${keyed}`);
  const skill = JSON.parse(/^---\n([\s\S]*?)\n---/.exec(canonText('.asd/skills/asd-phase-design-review/SKILL.md'))[1]);
  assert.deepStrictEqual([...new Set(skill.description.match(/asd-reviewer-[a-z]+/g))].sort(), standard.reviewers.design.filter((key) => key !== runtime.EXTERNAL_REVIEWER).map(agentOf).sort(), 'AC-2: the skill description names the internal reviewers the roster dispatches and no other');

  for (const reviewer of runtime.INTERNAL_REVIEWERS) {
    const modes = Object.keys(jsonOf(`.asd/agents/asd-reviewer-${reviewer}.md`, 'Inputs').modes || {});
    for (const node of ['design', 'impl']) {
      assert.strictEqual(modes.includes(`${node}-review`), definitions.some((definition) => definition.reviewers[node].includes(reviewer)), `AC-3: asd-reviewer-${reviewer} Inputs carries a ${node}-review block exactly when a workflow dispatches it in ${node}-review - a missing block leaves a dispatch without inputs, a leftover one is read by no dispatch`);
    }
  }
});

test('sprint-032 AC-3/AC-4/AC-5: merge mode is the only producer of await-merge, "Merging a PR" waits through checks-wait for exactly the outcomes the runtime returns within the bounds it runs, README mirrors the bounds, and asd-sprint halts on both exits', async () => {
  const workflow = '.asd/workflows/asd-phase-pr.md';
  const steps = sectionOf(workflow, 'Steps');
  assert.ok(stepOf(subOf(steps, 'Merge mode'), 1).includes('`NEXT: await-merge`'), 'AC-5: a blocked merge ends merge mode step 1 with `NEXT: await-merge`');
  const toAwait = jsonOf(workflow, 'Exit').next.filter((entry) => entry.next === 'await-merge');
  assert.ok(toAwait.length === 1 && /merge mode/.test(toAwait[0].if) && !/open mode/.test(toAwait[0].if), `AC-5: the Exit table routes await-merge from merge mode alone, got ${JSON.stringify(toAwait)}`);
  const modesSentence = sectionOf('.asd/rules/sprint-lifecycle.md', 'PR phase').split('\n\n')[1].split(/(?<=\.)\s/).find((sentence) => sentence.includes('`pr=null`')) || '';
  assert.ok(/merge mode/.test(modesSentence) && !modesSentence.includes('`NEXT: await-merge`'), `AC-3: "PR phase" Modes continues pr=null into merge mode instead of exiting at await-merge; got: ${modesSentence}`);

  const rule = sectionOf('.asd/rules/git-strategy.md', 'Merging a PR');
  const outcomes = [...new Set((await Promise.all([['pass'], ['none'], ['fail'], ['pending']].map(scriptedWait))).map(({ checks }) => checks))];
  assert.strictEqual(outcomes.length, 4, 'sanity: the four scripted waits end in four distinct outcomes');
  assert.deepStrictEqual(outcomes.filter((outcome) => !rule.includes(`\`${outcome}\``)), [], 'AC-4/AC-5: "Merging a PR" names every outcome checks-wait returns');
  const mergeSentence = rule.split(/(?<=\.)\s/).find((sentence) => sentence.includes('`gh pr merge <n> --squash`')) || '';
  assert.ok(mergeSentence.includes('`pass`') && mergeSentence.includes('`none`') && !mergeSentence.includes('`fail`'), `AC-4: the merge call is gated on pass or none; got: ${mergeSentence}`);
  const blocked = rule.split('\n\n').find((paragraph) => paragraph.includes('`--admin`')) || '';
  assert.ok(blocked.includes('`fail`') && blocked.includes('`timeout`') && blocked.includes('`NEXT: await-merge`'), `AC-5: the blocked-merge paragraph covers fail and timeout and exits at await-merge; got: ${blocked}`);
  assert.ok(blocked.includes('`MERGED`'), `AC-5: a merge the host accepted that did not land is found by confirming the PR \`MERGED\`; got: ${blocked}`);
  const landing = stepOf(subOf(steps, 'Merge mode'), 1).split(/(?<=\.)\s/).find((sentence) => sentence.includes('`MERGED`') && sentence.includes('blocked merge')) || '';
  const mergeStep = stepOf(subOf(steps, 'Merge mode'), 1);
  assert.ok(landing !== '' && mergeStep.indexOf(landing) > mergeStep.indexOf('"Merging a PR"'), `AC-5: merge mode step 1 states the PR \`MERGED\` after the merge call, a merge that did not land being a blocked merge; got: ${landing}`);

  const bounds = [`${runtime.CHECKS_GRACE_MS / 1000} s`, `${runtime.CHECKS_LIMIT_MS / 60000} min`];
  const readmePr = canonText('README.md').split('\n').find((line) => line.startsWith('| **pr** |') && line.includes('`gh pr create`')) || '';
  for (const [site, text] of [['git-strategy.md "Merging a PR"', rule], ['README.md pr row', readmePr]]) {
    assert.deepStrictEqual(bounds.filter((bound) => !text.includes(bound)), [], `AC-4: ${site} states the bounds checks-wait runs`);
  }
  const prRoute = canonText('.asd/skills/asd-sprint/SKILL.md').split('\n').flatMap((line) => line.split('The `pr` phase').slice(1)).join(' ');
  for (const exit of ['done', 'await-merge']) {
    assert.ok(/\bhalt\b/.test((prRoute.split(`\`NEXT: ${exit}\``)[1] || '').split(';')[0]), `AC-3/AC-5: asd-sprint Step 3 halts on pr's \`NEXT: ${exit}\``);
  }
});

test('sprint-032 AC-1/AC-2: asd-sync applies its unedited group without --force and only the confirmed modified-foreign group with it, asd-update delegates to asd-sync after a real run and leaves no sync step to the user, and the scope update step runs no sync of its own', () => {
  const syncSkill = '.asd/skills/asd-sync/SKILL.md';
  const applies = sectionOf(syncSkill, 'Steps').split('\n').filter((line) => line.includes('--apply <file...>'));
  const unedited = applies.find((line) => !line.includes('--apply <file...> --force')) || '';
  const forced = applies.find((line) => line.includes('--apply <file...> --force')) || '';
  assert.strictEqual(applies.length, 2, 'AC-1: asd-sync applies in exactly two groups');
  assert.ok(unedited.includes('`missing`') && unedited.includes('`stale`') && !unedited.includes('modified-foreign') && !unedited.includes('orphan-modified'),`AC-1: the group applied without --force is the unedited one; got: ${unedited}`);
  assert.ok(forced.includes('`modified-foreign`') && forced.includes('`orphan-modified`') && !forced.includes('`missing`') && !forced.includes('`stale`'), `AC-1: --force reaches only the confirmed hand-edited groups, modified-foreign and orphan-modified; got: ${forced}`);
  const syncRules = sectionOf(syncSkill, 'Rules');
  assert.ok(syncRules.includes('`modified-foreign`') && syncRules.includes('`orphan-modified`'), 'AC-1: the never-rule narrows to the hand-edited statuses, since an unedited file is regenerated with no question');
  const writes = (skill) => jsonText(sectionOf(skill, 'Outputs')).join(' ');
  for (const skill of [syncSkill, '.asd/skills/asd-update/SKILL.md']) {
    assert.deepStrictEqual(['AGENTS.md', 'CLAUDE.md'].filter((file) => !writes(skill).includes(file)), [], `AC-1/AC-2: ${skill} Outputs lists the managed blocks asd-sync writes, which the update run's never-rule must not contradict`);
  }

  const updateSkill = '.asd/skills/asd-update/SKILL.md';
  const delegation = stepOf(sectionOf(updateSkill, 'Steps'), 5);
  assert.ok(delegation.includes('`asd-sync`') && delegation.includes('`--dry-run`'), 'AC-2: step 5 delegates to asd-sync and names --dry-run as the run that never delegates');
  assert.ok(jsonOf(updateSkill, 'Delegates').skills.includes('asd-sync'), 'AC-2: asd-update lists asd-sync among the skills it delegates to');
  assert.ok(sectionOf(updateSkill, 'Return').includes('NEXT: none'), 'AC-2: no next step is left to a manual /asd-sync');
  assert.ok(!stepOf(sectionOf('.asd/workflows/asd-phase-scope.md', 'Steps'), 1).includes('sync.js'), 'AC-2: scope step 1 runs no sync of its own, asd-update covering it');
});

test('sprint-032 AC-9/AC-10: audit writes phase="audit" on every non-collapse exit, treats a criterion deliberately changing a canonical document as a planned change, and sends a step 3b answer changing a criterion through Scope amendment with a new id', () => {
  const audit = '.asd/workflows/asd-phase-audit.md';
  const exit = stepOf(sectionOf(audit, 'Steps'), 5);
  const otherwise = exit.split('Otherwise it sets `phase="audit"`')[1];
  assert.ok(otherwise !== undefined && !/\bonly when\b/.test(otherwise.split('.')[0]), 'AC-9: the non-collapse exit writes phase="audit" unconditionally, the run path as well as the skip path');
  const contradictions = sectionOf(audit, 'Rules').split('\n').find((line) => line.includes('**Contradictions**')) || '';
  assert.ok(contradictions.includes('planned change'), 'AC-10: Contradictions exempts a criterion that deliberately changes a canonical document');
  const answer = stepOf(sectionOf(audit, 'Steps'), '3b');
  assert.ok(answer.includes('"Scope amendment"') && answer.includes('new id'), `AC-10: step 3b routes a criterion-changing answer through Scope amendment with a new id; got: ${answer}`);
  assert.ok(sectionOf('.asd/rules/sprint-lifecycle.md', 'Scope amendment').length > 0, 'sanity: the section step 3b cites exists');
});

test('sprint-033 AC-5: audit step 2, plan step 4 and cleanup step 4 each dispatch the scout for a question plus paths and take COMPLETED or ABORT back, and no other phase workflow names it', () => {
  const dispatchers = fs.readdirSync(path.join(REPO_ROOT, '.asd/workflows')).filter((file) => file.endsWith('.md')).map((file) => `.asd/workflows/${file}`)
    .filter((rel) => canonText(rel).includes('`asd-scout`'));
  assert.deepStrictEqual(dispatchers, ['.asd/workflows/asd-phase-audit.md', '.asd/workflows/asd-phase-cleanup.md', '.asd/workflows/asd-phase-plan.md'], 'AC-5: scouts serve the orchestrator scans of audit, plan and cleanup only');
  for (const rel of dispatchers) {
    const row = jsonOf(rel, 'Dispatch').find((entry) => entry.agent === 'asd-scout');
    assert.ok(row, `${rel}: the Dispatch section lists the scout`);
    assert.deepStrictEqual(row.signals, ['COMPLETED', 'ABORT'], `${rel}: the scout's only signals`);
    assert.ok(row.payload.includes('question and paths'), `${rel}: the payload is a question plus paths`);
  }
});

/** Every label a step's `--add-label` writes, comma lists split. */
function labelsAdded(text) {
  return [...text.matchAll(/--add-label ([a-z,-]+)/g)].flatMap((match) => match[1].split(','));
}

/** True when the `<origin>` lookup is named before the `gh repo view <origin>` that consumes it. */
function originCheckedBeforeRepoView(text) {
  const lookup = text.indexOf('`<origin>` = `git remote get-url origin`');
  return lookup !== -1 && text.indexOf('`gh repo view <origin> --json nameWithOwner -q .nameWithOwner`') > lookup;
}

test('sprint-034 AC-1/AC-2/AC-5/AC-6/AC-7 (issue #110): scope step 2a triages the project repository\'s open issues in every project and sends each to the user without a close, plans every write behind one logged authorisation request and skips on an unusable gh or origin; step 4 writes the dispositions to the project repository', () => {
  const steps = sectionOf('.asd/workflows/asd-phase-scope.md', 'Steps');
  const intake = stepOf(steps, '2a');
  const bullet = (marker) => intake.split('\n').find((line) => line.includes(marker)) || '';
  const project = bullet('**Project-issue triage**');
  assert.ok(project, 'AC-1: step 2a must keep its Project-issue triage bullet');
  assert.ok(project.includes('every project') && !project.includes('`self_hosting: enabled` only'), 'AC-1: project-issue triage runs in every project, consumer and self-hosting alike');
  assert.ok(originCheckedBeforeRepoView(project) && project.includes('gh issue list -R <project> -s open -L 200'), 'AC-1 (combined-2, external-1): the project repo is the one the checked origin URL names - `gh repo view` runs only after the `<origin>` lookup, never on gh\'s bare default, which ranks an upstream remote above origin - listed up to the existing 200 limit');
  assert.ok(!project.includes('asd-retro-finding') && project.includes('an exact `[asd-retro] ` title prefix') && project.includes('a marker issue without the prefix stays here') && bullet('**Issue triage**').includes('keeping exact `[asd-retro] ` title prefixes'), 'AC-1 (external-2): under self-hosting the project list drops exactly the issues the retro list keeps by title prefix, so a marker issue without the prefix goes to the user instead of being dropped by its body marker');
  assert.ok(project.includes('`deferred`-labelled included') && project.includes('every issue taking one explicit choice, none by default'), 'AC-2: every listed issue, deferred included, takes one explicit choice');
  assert.ok(!project.includes('gh issue close') && project.includes('none is rewritten or auto-closed'), 'AC-2: project issues are never auto-closed - the bullet carries no close command');
  assert.ok(project.includes('`gh auth status`') && project.includes('an `<origin>` lookup with a non-zero exit or empty output') && project.includes('skips it with one decisions-log line') && project.includes('scope continues'), 'AC-5 (combined-2, external-1): an unusable gh, a failed or empty origin lookup or a non-GitHub origin skips project triage with one decisions-log line and scope continues');

  const authorisation = bullet('**Triage authorisation**');
  assert.ok(authorisation.includes('request user decision') && authorisation.includes('before the first runs'), 'AC-6: one request user decision lists every planned write before the first runs');
  assert.ok(authorisation.includes('`issue triage authorised: <writes>`') && authorisation.includes('`issue triage declined`') && authorisation.includes('read before any request'), 'AC-6: the authorisation is a logged write point read before any request, so a re-entry never asks twice');
  assert.ok(bullet('**Issue triage**').includes('runs only after "Triage authorisation"') && !/gh (?:issue (?:edit|close)|label)/.test(project), 'AC-6 (combined-4): the retro-issue bullet runs its writes only after the authorisation, and the project bullet plans no write of its own - its dispositions and label ensures are step 4\'s, under the gate');
  assert.ok(/`AC-N` drafted from a retro row or issue/.test(steps) && /change surface/.test(steps) && /undeliverable/.test(steps), 'AC-7: scope checks each AC-N drafted from a retro row or issue against the change surface and the phase that applies it, before the step 4 gate');

  const accept = stepOf(steps, 4);
  assert.ok(accept.includes('project issues included') && accept.includes('`-R <project>` for a project issue'), 'AC-2/AC-3: step 4 puts project issues to the user and writes them to the project repository');
  assert.ok(accept.includes('`gh issue close <n> -R <repo|project> -r "not planned" -c <reason>`') && accept.includes('--add-label wontfix') && accept.includes('--add-label deferred') && accept.includes('the `AC-N` text ends `(issue #N)`'), 'AC-3: include ends the AC-N with (issue #N), reject closes not planned with wontfix, defer labels deferred');
  assert.ok(accept.includes('each label a disposition writes is first ensured, ensured as in step 2a'), 'AC-3 (combined-3, combined-4): step 4 ensures each label a disposition writes before the label write, by the step 2a ensure, so a declined authorisation leaves no missing-label failure');
  assert.ok(accept.includes('`language.docs`') && accept.includes('`language-policy.md` "Matrix"'), 'AC-3: a consumer project\'s issue comment is written in language.docs by the Matrix rows');

  const { inputs, writes } = { inputs: jsonOf('.asd/workflows/asd-phase-scope.md', 'Inputs'), writes: jsonOf('.asd/workflows/asd-phase-scope.md', 'Exit').writes };
  assert.ok(inputs.some((input) => input.includes('open issues and open PRs of the project\'s own GitHub repository')), 'AC-1: the scope Inputs name the project repository\'s open issues');
  assert.ok(writes.some((write) => write.includes('project-repo issue labels and dispositions')), 'AC-3: the scope Exit lists the project-repo issue writes');
  assert.ok(sync.parseCanonicalFrontmatter(canonText('.asd/skills/asd-phase-scope/SKILL.md')).meta.description.includes('in every project'), 'AC-1: the scope skill description, its trigger text, names the every-project triage');
  const reference = canonText('docs/architecture/tech-reference/gh-2.90.md');
  assert.ok(reference.includes('`gh repo view [<repository>] --json nameWithOwner -q .nameWithOwner`') && reference.includes('`<origin>` = `git remote get-url origin`') && reference.includes('a non-zero exit or empty output is unresolved'), 'AC-15 (combined-2): the gh tech reference documents the repository argument and the checked origin URL project triage passes');
});

test('sprint-034 AC-4 (issue #110): pr merge mode closes a consumer project\'s included issues the merge left open from the (issue #N) of the merged sprint.md, skipping a closed one, with no gate and no FAILED; every gh call it names is in the tech reference and its exit writes and the gate inventory name it', () => {
  const merge = stepOf(subOf(canonText('.asd/workflows/asd-phase-pr.md'), 'Merge mode'), 2);
  const consumer = merge.slice(merge.indexOf('Consumer project:'), merge.indexOf('Then, every project:'));
  assert.ok(consumer.startsWith('Consumer project:'), 'AC-4: merge step 2 must keep its consumer-project clause ahead of the every-project tail');
  assert.ok(consumer.includes('git show origin/<git.base_branch>:.asd/sprints/<NNN-slug>/sprint.md') && consumer.includes('`(issue #N)`'), 'AC-4: the included issues are read from the merged sprint.md on base');
  assert.ok(originCheckedBeforeRepoView(consumer) && consumer.includes('an `<origin>` lookup with a non-zero exit or empty output'), 'AC-4 (combined-2, external-1): the consumer close resolves its repository from the checked origin URL, never gh\'s bare default, and names a failed or empty origin lookup as an unresolved `<project>`');
  assert.ok(consumer.includes('`gh issue view <n> -R <project> --json state`') && consumer.includes('`CLOSED`') && consumer.includes('`gh issue close <n> -R <project> -r completed -c "<PR url>"`'), 'AC-4: an issue already closed by the merge is skipped, an open one is closed completed with the PR url');
  assert.ok(consumer.includes('`language.docs`') && consumer.includes('never retried and never `FAILED`') && consumer.includes('No gate (`checkpoints.md` "Gate inventory")'), 'AC-4: the comment is language.docs, a failure is reported never retried or FAILED, and no gate applies');
  const reference = canonText('docs/architecture/tech-reference/gh-2.90.md');
  const calls = [...new Set([...consumer.matchAll(/`gh ([a-z]+ [a-z]+)/g)].map((match) => match[1]))];
  assert.ok(calls.length >= 3, `sanity: the consumer clause must still name its gh calls, got ${JSON.stringify(calls)}`);
  assert.deepStrictEqual(calls.filter((call) => !reference.includes(`gh ${call}`)), [], 'AC-4/AC-15: every gh call the consumer close names must be in the gh tech reference');
  assert.ok(jsonOf('.asd/workflows/asd-phase-pr.md', 'Exit').writes.some((write) => write.includes('consumer included-issue closes')), 'AC-4: the pr Exit lists the consumer included-issue closes');
  const inventory = headingBody('.asd/rules/checkpoints.md', 'Gate inventory');
  assert.ok(inventory.includes('a consumer\'s included-issue and included-PR closes (pr merge)') && inventory.includes('take no gate in either mode'), 'AC-4: the gate inventory lists the consumer close among the ungated writes');
  assert.ok(inventory.includes('Step 2a\'s triage writes are authorised by one request user decision before the first write, which is not a gate-inventory gate'), 'AC-6: the gate inventory separates the one triage authorisation from its gates');
});

test('sprint-034 AC-1/AC-3 (combined-3, combined-4, external-3): every label ensure in canon and the gh reference lists first and creates only a missing label without -f, and step 4 alone ensures the deferred and wontfix labels it writes', () => {
  const sites = [...canonMarkdownFiles(), 'docs/architecture/tech-reference/gh-2.90.md'].flatMap((rel) => [...canonText(rel).matchAll(/gh label create [^`]*/g)].map((match) => ({ rel, command: match[0] })));
  assert.ok(sites.some((site) => site.rel === '.asd/workflows/asd-phase-scope.md'), 'sanity: scope step 2a must still name its label create');
  assert.deepStrictEqual(sites.filter((site) => /(^|\s)(-f|--force)(\s|$)/.test(site.command)).map((site) => `${site.rel}: ${site.command}`), [], 'AC-3 (external-3): no label ensure passes -f, which recolors an existing label and rewrites its description');

  const steps = sectionOf('.asd/workflows/asd-phase-scope.md', 'Steps');
  const intake = stepOf(steps, '2a');
  const accept = stepOf(steps, 4);
  const project = intake.split('\n').find((line) => line.includes('**Project-issue triage**')) || '';
  const ensure = (/Labels to ensure: [^;]*?(?=; list `gh issue list)/.exec(intake) || [])[0] || '';
  assert.ok(ensure.includes('gh label list -R <r> -S <name> --json name -q') && ensure.indexOf('gh label list') < ensure.indexOf('gh label create'), 'AC-3 (combined-3, external-3): the step 2a ensure lists labels first and creates only after that list, so an existing label is never touched');
  assert.ok(/equal to `<name>`, case-insensitive/.test(ensure), 'AC-3 (combined-3): the existing-label test compares exact names case-insensitively, since the list search is a best match');

  const writtenByStep4 = [...new Set(labelsAdded(accept))];
  assert.deepStrictEqual(writtenByStep4.sort(), ['deferred', 'wontfix'], 'sanity: step 4 writes the deferred and wontfix labels');
  assert.deepStrictEqual(spans(ensure).filter((span) => writtenByStep4.includes(span)), [], 'AC-3 (combined-4): step 2a ensures only the labels it writes itself; deferred and wontfix are step 4\'s');
  assert.ok(!/ensur/i.test(project) && !accept.includes('gh label create'), 'AC-3 (combined-4): the project bullet plans no ensure and step 4 restates no create - one home, the step 2a ensure');
  assert.ok(accept.includes('each label a disposition writes is first ensured, ensured as in step 2a'), 'AC-3 (combined-4): step 4 ensures each label its disposition writes, by the step 2a ensure, before the label write');
});

test('sprint-035 AC-14: safety_valve is read live and skipped by impl-test and cleanup, accepted by the pr gate - every restating site names the key, the template ships it enabled at top level and the home states disabled', () => {
  const sites = ['.asd/rules/sprint-lifecycle.md', '.asd/workflows/asd-phase-impl-test.md', '.asd/agents/asd-tester.md', '.asd/workflows/asd-phase-cleanup.md', '.asd/workflows/asd-phase-pr.md', '.asd/templates/t_config.yaml', '.asd/skills/asd-init/SKILL.md', 'README.md'];
  assert.deepStrictEqual(sites.filter((rel) => !canonText(rel).includes('safety_valve')), [], 'AC-14: every site that states the valve names the key');
  assert.ok(/^safety_valve: enabled$/m.test(canonText('.asd/templates/t_config.yaml')), 'AC-14: the config template carries the key at top level, enabled');
  const home = sectionOf('.asd/rules/sprint-lifecycle.md', 'Impacted test set');
  assert.ok(home.includes('`safety_valve: disabled`') && home.includes('absent = `enabled`'), 'AC-14: the home states the disabled value and the absent default');
  assert.ok(canonText('.asd/workflows/asd-phase-pr.md').includes('`safety_valve: disabled`'), 'AC-14: the pr gate names the disabled case it accepts cleanup\'s record under');
});

test('sprint-035 AC-5: the issue resolution kind impl-review writes is one of the kinds "User-resolved findings" lists, and the line it appends has that form', () => {
  const home = sectionOf('.asd/rules/sprint-lifecycle.md', 'State recovery');
  const kinds = /`resolved: <finding id, …> — <([^>]+)>, <YYYY-MM-DD>`/.exec(home);
  assert.ok(kinds, 'sanity: the home keeps its resolved line shape');
  assert.ok(kinds[1].split(' | ').includes('issue'), 'AC-5: issue is a listed kind');
  const step = stepOf(sectionOf('.asd/workflows/asd-phase-impl-review.md', 'Steps'), '7b');
  assert.ok(step.includes('`resolved: <id> — issue #<N>, <YYYY-MM-DD>`') && home.includes('written `issue #<N>`'), 'AC-5: the appended line and the home name the same issue #<N> form');
});

test('sprint-036 AC-8/AC-10/AC-11/AC-13: the refuse-to-implement rule covers every command a diff newly invokes and asd-dev cites it, scope step 3a checks the disabled documents against the scope and offers a Settings change line, and plan step 4 runs the build once and fills Decision coverage', () => {
  const rule = sectionOf('.asd/rules/artifact-layout.md', 'Tech reference docs');
  assert.ok(rule.includes('for each newly used tech') && rule.includes('every command or subcommand the diff newly invokes') && rule.includes('`FAILED — tech-reference missing for <tech>@<version>` or `<command>` per gap; the orchestrator writes each and re-dispatches'), 'AC-8: the rule requires an entry per newly used tech and coverage of every command or subcommand a diff newly invokes, one FAILED line per gap of either kind, and the orchestrator writes the entry and re-dispatches');
  assert.ok(['asd-phase-impl', 'asd-phase-impl-test'].every((name) => canonText(`.asd/workflows/${name}.md`).includes('tech-reference missing: orchestrator writes it')), 'AC-8: the impl and impl-test FAILED lines carry the orchestrator-writes-it handling');
  const dev = canonText('.asd/agents/asd-dev.md');
  assert.ok(dev.includes('command or subcommand the diff newly invokes') && dev.includes('`artifact-layout.md` "Tech reference docs"'), 'AC-8: asd-dev checks each such command against the tech reference, citing the rule\'s home');

  const scope = sectionOf('.asd/workflows/asd-phase-scope.md', 'Steps');
  assert.ok(stepOf(scope, '3a').includes('`Settings change:`') && stepOf(scope, '4').includes('step 3a'), 'AC-10: step 3a offers a Settings change line for a needed disabled document and step 4 shows what step 3a found at the gate');
  assert.ok(/\baudit\b/.test(stepOf(scope, '3a')), 'AC-10: step 3a checks the audit step 3 froze, not only the documents');

  const planStep = stepOf(sectionOf('.asd/workflows/asd-phase-plan.md', 'Steps'), '4');
  assert.ok(planStep.includes('`commands.yaml` `build`') && planStep.includes('`FAILED`') && planStep.includes('`## Decision coverage`'), 'AC-11/AC-13: plan step 4 runs the build once, stops with FAILED and fills Decision coverage');
  const template = canonText('.asd/templates/t_plan.md');
  assert.ok(template.includes('\n## Decision coverage\n') && template.includes('| Decision | Covered by |'), 'AC-13: the plan template carries the Decision coverage table');
});

test('sprint-036 AC-16: asd-sprint runs its attribution check on the sprint branch only - after scope COMPLETED and at resume, never in Step 0 - never runs sync.js, the check itself inserting and recording the owned value, passes the user-modified tracked files to the check to skip each, never skipping the whole check, and commits only tracked files that were clean before it as chore(sprint): reset AI attribution under a granted git ls-files, git add and git commit', () => {
  const skill = '.asd/skills/asd-sprint/SKILL.md';
  const steps = sectionOf(skill, 'Steps');
  const check = subOf(steps, 'Attribution check');
  const SUBJECT = 'chore(sprint): reset AI attribution';
  const SYNC_SCRIPT = 'sync.js';
  const SYNC_STATE = '.asd/sync-state.json';
  const CHECK = 'node .asd/runtime.js attribution-check [-- <listed settings files>]';
  assert.ok(!subOf(steps, 'Step 0').includes('attribution-check'), 'AC-16: Step 0 runs on the base branch, so it never runs the check');
  assert.ok(stepOf(subOf(steps, 'Step 2A'), '5').includes('"Attribution check"') && stepOf(subOf(steps, 'Step 2B'), '1').includes('"Attribution check"'), 'AC-16: it runs after scope COMPLETED in the new-sprint flow and when a sprint resumes');
  assert.ok(check.includes('git status --porcelain --untracked-files=no -- .claude/settings.json .claude/settings.local.json .asd/sync-state.json'), 'AC-16: a tracked settings or sync-state file with a user change is found by status, an untracked file never counting');
  assert.ok(!check.includes(SYNC_SCRIPT), 'AC-16: the check runs without a sync step, which recomputed the release ledger and wrote before the link refusal');
  assert.ok(check.includes(CHECK),'AC-16: the check always runs and takes the user-modified settings files after --, so each is skipped and the rest, with the Codex hint, still handled');
  assert.ok(check.includes('git ls-files --error-unmatch -- <file>') && check.includes('a fix line names') && check.includes(`\`${SUBJECT}\``) && SUBJECT.length <= 50, 'AC-16: it commits only a tracked file that a fix line names, under a header within the commit limit');
  assert.ok(!check.includes('now shows it changed'), 'AC-16: the commit set follows the fix lines alone - the check names the sync state in a line of its own, so no git-status guess adds it');
  const ops = jsonOf(skill, 'Preconditions').ops.join('\n');
  assert.ok(!ops.includes(SYNC_SCRIPT) && ops.includes('node .asd/runtime.js attribution-check') && ops.includes(SYNC_STATE), 'AC-16: the skill grants no sync run, and names the check and the sync-state record it writes');
  assert.ok(ops.includes('git ls-files') && ops.includes('git add/git commit') && ops.includes('git status --porcelain'), 'AC-16: the skill grants the status read, the tracked-file lookup and the commit its step performs');
});
