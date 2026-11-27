'use strict';

// content contracts of the phase workflows, skills and their chains

const { assert, fs, path, sync, update, runtime, REPO_ROOT, tests, test, readWorkflowDefinitions, arrowChain, readRepoFile, internalReviewers, canonText, headingBody, sectionOf, jsonOf, stepOf, spans, canonMarkdownFiles, canonAgents, FORM_CATEGORIES, scriptedWait } = require('./lib.js');

test('AC-2/4/6/8: the External Review CLI command settings exist in the config template and asd-init, and each provider view carries its own key and the unavailable-status literal', () => {
  const init = fs.readFileSync(path.join(REPO_ROOT, '.asd', 'skills/asd-init/SKILL.md'), 'utf8');
  const config = fs.readFileSync(path.join(REPO_ROOT, '.asd', 'templates/t_config.yaml'), 'utf8');
  const claudeAgent = fs.readFileSync(path.join(REPO_ROOT, '.claude/agents/asd-external-review.md'), 'utf8');
  const codexAgent = fs.readFileSync(path.join(REPO_ROOT, '.codex/agents/asd-external-review.toml'), 'utf8');
  assert.match(init, /external-preflight --input <path>/);
  assert.ok(init.includes('review.codex_profile') && init.includes('system.tools'));
  assert.ok(config.includes('codex_command: ""') && config.includes('claude_command: ""'));
  assert.ok(claudeAgent.includes('system.tools.codex_command') && claudeAgent.includes('external review unavailable: <specific status>'));
  assert.ok(codexAgent.includes('system.tools.claude_command') && codexAgent.includes('external review unavailable: <specific status>'));
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

test('sprint-028 AC-1: cleanup sits directly before retro in every workflow definition and routes only to retro', () => {
  for (const { name, phases, next } of readWorkflowDefinitions()) {
    const at = phases.indexOf('cleanup');
    assert.ok(at > 0, `${name}: the chain must hold a cleanup phase after its first phase`);
    assert.strictEqual(phases[at + 1], 'retro', `${name}: cleanup runs directly before retro`);
    assert.deepStrictEqual(next.cleanup, ['retro'], `${name}: cleanup routes only to retro`);
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
      const promote = block.split('\n').find((line) => line.startsWith('- design-promote')) || '';
      const designDocs = Object.keys(JSON.parse(readRepoFile('.asd/templates/t_state.json')).documents).filter((doc) => doc !== 'audit');
      const optionalDocs = sectionOf('.asd/rules/sprint-lifecycle.md', 'Optional documents');
      const noOpRow = /^\| design \| (.*?) \|$/m.exec(optionalDocs)?.[1] ?? '';
      assert.ok(designDocs.every((doc) => spans(noOpRow).includes(doc)), 'the no-op table identifies every frozen design document');
      assert.match(promote, /\bNo-op (?:when|with) all five design doc(?:ument)?s (?:are )?disabled and (?:there are )?no in-scope mockups\b/, `sprint-020 AC-5, sprint-040 AC-1: ${name} promotes a mockup-only sprint and skips only empty combined scope`);
      assert.strictEqual(designDocs.length, 5, 'the Lite no-op clause counts every design document');
      const inputsOf = (text) => [...text.replace(/`[^`]+\.md` "[^"]+"/g, '').matchAll(/`([^`]+\.md)`/g)].map((match) => path.posix.basename(match[1])).sort();
      const promoteInputs = inputsOf(promote.split(/\.(?=\s)/).find((sentence) => sentence.includes('"Design-promote phase"')) || '');
      const inputSites = canonMarkdownFiles().filter((rel) => rel !== '.asd/rules/sprint-lifecycle.md' && rel !== '.asd/workflows/asd-phase-design-promote.md').flatMap((rel) => canonText(rel).split('\n').filter((line) => line.includes('in place of drafts')).map((line) => [rel, inputsOf(line.slice(line.lastIndexOf('lite', line.indexOf('in place of drafts')), line.indexOf('in place of drafts')))]));
      assert.ok(promoteInputs.length > 0, 'sanity: the "Workflows" design-promote bullet must name the files it reads');
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

test('sprint-011 AC-3/AC-5/AC-7, sprint-013 AC-14, sprint-040 AC-1: audit, plan and resume agree on the frozen design-block collapse and audit records every skip in one exit write', () => {
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
  assert.match(condition, /all `false` and the effective mockup format is `none`/, 'a Standard sprint with standalone mockups still goes through design, review and promotion');
  assert.ok(spans(designRow[1]).includes('none'), 'the no-op table also requires that mockups are disabled');
  assert.ok(!condition.includes('skipped_phases'), `the collapse test's condition in ${citation} must not read skipped_phases - that array is a historical record, so a stale entry left by a rollback would pass a real, interrupted promotion as collapsed (COR-2)`);
  assert.ok(!condition.includes('skip_design_phases'), `sprint-013 AC-14: the collapse test's condition in ${citation} ignores the removed legacy setting`);

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

test('AC-15: .asd/sync.js and .asd/skills/asd-update/update.js carry no non-Latin-script text - workflow infrastructure is English always (language-policy.md)', () => {
  const nonLatinScript = /[Ͱ-ϿЀ-ӿ֐-׿؀-ۿऀ-ॿ฀-๿぀-ヿ㐀-䶿一-鿿가-힯]/;
  for (const rel of ['.asd/sync.js', '.asd/skills/asd-update/update.js']) {
    const content = fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');
    const offender = content.match(nonLatinScript);
    assert.strictEqual(offender, null, `${rel} must contain no non-Latin-script character (found "${offender && offender[0]}") - this round removed the Russian comments quoting a project plan document (AC-15); a future re-introduction must fail here, not wait for direct read`);
  }
});

test('AC-8/sprint-010 AC-4/sprint-014 AC-1: the External Review interrupted and availability-skip literals and the carried unreviewed-files line are the ones external-review.md "Outcome contract" and "Iteration semantics" define', () => {
  const contract = sectionOf('.asd/rules/external-review.md', 'Outcome contract');
  const interrupted = spans(contract).filter((span) => span.startsWith('external review interrupted: '));
  assert.ok(interrupted.includes('external review interrupted: <cause>'), 'the contract defines the general interrupted return');
  const SKIP = 'APPROVE (skipped: external review unavailable: <specific status>)';
  const agentEscalation = jsonOf('.asd/agents/asd-external-review.md', 'Escalation');
  assert.ok(agentEscalation.some((row) => row.signal === SKIP), 'the agent\'s Escalation must carry the availability skip literal exactly as external-review.md defines it');
  assert.deepStrictEqual(agentEscalation.map((row) => row.signal).filter((signal) => signal.startsWith('external review interrupted: ')), interrupted, 'the agent Escalation carries the canonical interrupted literals');
  const report = canonText('.asd/templates/external-review/t_review-report.md');
  assert.ok(report.includes(SKIP), 't_review-report.md\'s first-line alternatives must admit the skip token');
  const carried = 'Unreviewed files';
  const iteration = sectionOf('.asd/rules/external-review.md', 'Iteration semantics');
  const field = iteration.split('\n').find((line) => line.startsWith(`**${carried}.**`)) ?? '';
  assert.ok(spans(field).includes(carried), 'external-review.md must define the Unreviewed files field');
  assert.ok(report.includes(`**${carried}**`), 'the report must provide the Unreviewed files field the next iteration reads');
});

test('AC-15: the decisions-log tail checkpoints.md counts fix rounds by is the one asd-phase-impl.md emits', () => {
  const checkpoints = readRepoFile('.asd/rules/checkpoints.md');
  const matchedTail = 'for <id>: findings resolved';
  assert.ok(checkpoints.includes(`matched on the stable tail \`${matchedTail}\``), 'the fix-rounds-charged unit must state the literal it matches decisions-log entries on');
  const emitted = readRepoFile('.asd/workflows/asd-phase-impl.md').split('\n').map((line) => /append decisions-log entry "([^"]*<id>[^"]*)"/.exec(line)).filter(Boolean);
  assert.strictEqual(emitted.length, 1, 'exactly one place in asd-phase-impl.md may emit the per-iteration fix-round entry - two emitters means two wordings, and the counter can only match one');
  assert.ok(emitted[0][1].endsWith(matchedTail), `the entry asd-phase-impl.md emits ("${emitted[0][1]}") must END WITH the tail checkpoints.md matches on ("${matchedTail}"), or the count silently drops to zero`);
});

test('sprint-012 AC-14/AC-18: the reserved subsystem ids are exactly the names the decomposed docs/architecture/ path map occupies, README mirrors that tree, and the registry templates exist with responsibility frontmatter', () => {
  const layout = '.asd/rules/artifact-layout.md';
  const registrySection = sectionOf(layout, 'Subsystem registry');
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
  assert.deepStrictEqual([...reserved].sort(), [...occupied].sort(), 'AC-14: subsystem files sit flat in docs/architecture/ beside everything else there, so the reserved ids must be exactly the names the path map already occupies');
  assert.deepStrictEqual(architectureTree(canonText('README.md')), children, "AC-18: README.md's folder map mirrors artifact-layout.md's decomposed docs/architecture/ tree entry for entry, in order");

  const templates = [...new Set([...registrySection.matchAll(/`(t_[^`]+)`/g)].map((match) => match[1]))];
  assert.ok(templates.length >= 2, 'AC-18: "Subsystem registry" must name a template for the registry and for the subsystem file');
  for (const name of templates) {
    const rel = `.asd/templates/${name}`;
    assert.ok(fs.existsSync(path.join(REPO_ROOT, rel)), `${rel} is named as a template and must exist`);
    const front = canonText(rel).split('\n---')[0];
    assert.ok(front.startsWith('---\nresponsibility:') && ['owns:', 'excludes:', 'delegates_to:'].every((key) => front.includes(key)), `${rel}: a persistent Markdown doc declares ownership in responsibility frontmatter`);
  }
});

test('sprint-014 AC-7: every test-plan.<token>.md / decisions-log.<token>.md mention in canon carries the rotation token artifact-layout.md defines', () => {
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
  assert.deepStrictEqual(mentions.filter((entry) => ![names.test, names.decisions].includes(entry.split(': ')[1])), [], 'every segment-name mention must carry the canonical token - a reader globbing another name reads nothing');
});

test('sprint-015 AC-2/AC-3: INTERNAL_REVIEWERS is the asd-reviewer-* agent set, the runtime hands Quality and Combined the scope plus the --test-plan paths and every other reviewer the scope, review-policy.md "Reviewer responsibility" has one row per reviewer, and every emit-manifest flag a workflow passes is one the CLI reads', () => {
  assert.deepStrictEqual(runtime.INTERNAL_REVIEWERS.slice().sort(), internalReviewers().sort(), 'INTERNAL_REVIEWERS drives the per-reviewer manifests, so it must name exactly the asd-reviewer-* agents');
  const testFiles = ['tests/run.js', 'test/a.js', 'src/__tests__/a.js', 'spec/a.rb', 'pkg/specs/a.rb', 'src/a.test.ts', 'src/a.spec.js', 'src/test_a.py', 'src/a_test.go', 'src/ATest.java', 'src/ATests.cs', 'Assets/Tests/EditMode/Fixture.cs', 'Core.Tests/Fixture.cs', 'src/Game.Tests.Unit/Fixture.cs', 'lib/Api.Specs/helper.rb'];
  const plan = ['.asd/sprints/015-x/test-plan.md', '.asd/sprints/015-x/test-plan.entry-01.md'];
  const otherFiles = ['src/contest.js', 'src/latest/a.js', 'src/testing.js', 'docs/protests.md', 'README.md', 'src/Contest.Data/a.cs', 'src/latest.config/a.js', ...plan];
  assert.deepStrictEqual(testFiles.filter((file) => !runtime.isTest(file)), [], 'each path-segment and basename convention the plan names must classify as a test file, or Testing never receives it');
  assert.deepStrictEqual(otherFiles.filter(runtime.isTest), [], 'a name merely containing "test" is not a test file');
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
  assert.deepStrictEqual(rows.filter((row) => row.length !== 3 || !row[1] || !row[2]).map((row) => row[0]), [], 'AC-3: every reviewer row must state both phases');

  const source = canonText('.asd/runtime.js');
  for (const rel of ['.asd/workflows/asd-phase-impl-review.md', '.asd/workflows/asd-phase-design-review.md']) {
    const line = canonText(rel).split('\n').find((candidate) => candidate.includes('node .asd/runtime.js emit-manifest'));
    const flags = [...line.matchAll(/ --([a-z-]+)/g)].map((match) => match[1]);
    assert.deepStrictEqual(flags.filter((flag) => !source.includes(`flags['${flag}']`) && !source.includes(`flags.${flag} `) && !source.includes(`flags.${flag})`) && !source.includes(`flags.${flag},`)), [], `${rel}: every emit-manifest flag the workflow passes must be one the CLI reads - an unread --test-plan or --base drops Testing's plan or every .diff without an error`);
  }
});

test('sprint-017 AC-1/AC-6 (D3): t_state.json seeds reviews.impl as one wave node of exactly the fields the review-wave definition names', () => {
  const counters = sectionOf('.asd/rules/sprint-lifecycle.md', 'Review iteration counters');
  const definition = counters.split('\n').find((line) => line.startsWith('**Review wave**'));
  assert.ok(definition, 'sprint-lifecycle.md "Review iteration counters" must carry the review-wave definition');
  const nodeFields = [...definition.split(' — ')[1].split('(`t_state.json`)')[0].matchAll(/`([a-z_]+)`/g)].map((match) => match[1]);
  assert.ok(nodeFields.includes('iteration') && nodeFields.includes('latched'), `sanity: the definition must name the wave node's fields, got ${JSON.stringify(nodeFields)}`);
  const impl = JSON.parse(readRepoFile('.asd/templates/t_state.json')).reviews.impl;
  assert.deepStrictEqual(Object.keys(impl).sort(), ['wave', 'waves'], 'D3: reviews.impl is the wave pointer plus the wave nodes - a flat counter beside them would be a second, unwaved iteration count');
  assert.strictEqual(impl.wave, 1, 'D3: the seed points at wave 1');
  assert.ok(Array.isArray(impl.waves) && impl.waves.length === 1, 'D3: the seed is one wave node - the division point adds the rest, and a rollback reset restores exactly this');
  assert.deepStrictEqual(Object.keys(impl.waves[0]).sort(), nodeFields.slice().sort(), 'D3: the seed node carries exactly the fields the review-wave definition names');
  assert.deepStrictEqual(impl.waves[0], { iteration: 0, verdicts: {}, iteration_heads: {}, latched: {} }, 'D3: a fresh wave node starts at iteration 0 with nothing recorded - the division point is keyed on that 0');
});

test('sprint-018 AC-2/AC-4/AC-8/AC-9: no agent grants AskUserQuestion, web access is granted whole or withheld whole with its Tools scope, and every shell is bounded with commit holders matching git-strategy.md', () => {
  const agents = canonAgents();
  assert.deepStrictEqual(agents.filter((a) => a.meta.claude.tools.includes('AskUserQuestion')).map((a) => a.name), [], 'AC-4: a dispatched agent never reaches the user, so no canonical agent may carry the user-prompting tool');

  const webTools = ['WebFetch', 'WebSearch'];
  const hasWeb = (a) => webTools.every((tool) => a.meta.claude.tools.includes(tool));
  assert.deepStrictEqual(agents.filter((a) => !hasWeb(a) && webTools.some((tool) => a.meta.claude.tools.includes(tool))).map((a) => a.name), [], 'AC-2: web access is one grant - WebFetch without WebSearch (or the reverse) has no Codex equivalent, which renders only live or disabled');
  assert.deepStrictEqual(agents.filter((a) => !hasWeb(a)).map((a) => a.name), ['asd-external-review', 'asd-reviewer-efficiency', 'asd-scout'], 'AC-2: exactly these three keep web withheld; every other agent carries it');
  for (const a of agents) {
    const denied = webTools.filter((tool) => a.meta.claude.disallowedTools.includes(tool));
    if (hasWeb(a)) assert.deepStrictEqual(denied, [], `AC-2: ${a.name} grants web, so its disallowedTools must not deny it`);
    else assert.ok(denied.includes('WebFetch'), `AC-2: ${a.name} keeps WebFetch in disallowedTools`);
    const web = jsonOf(a.rel, 'Tools').web;
    if (hasWeb(a)) assert.ok(typeof web === 'string' && web.length > 0, `AC-9: ${a.name} carries web tools, so its Tools "web" must scope what it may look up`);
    else assert.strictEqual(web, undefined, `AC-9: ${a.name} withholds web, so its Tools must carry no "web" scope`);
  }

  const shells = agents.filter((a) => a.meta.claude.tools.includes('Bash'));
  const runLine = (a) => (jsonOf(a.rel, 'Tools').run || []).join('\n');
  assert.deepStrictEqual(shells.filter((a) => !runLine(a)).map((a) => a.name), [], 'AC-8: every Bash grant is bounded by a Tools run list');
  const holders = shells.filter((a) => runLine(a).includes('git commit')).map((a) => a.name);
  const policy = canonText('.asd/rules/git-strategy.md');
  const start = policy.indexOf('Holding a commit tool');
  assert.ok(start >= 0 && policy.indexOf('hold one', start) > start, 'AC-8: git-strategy.md must define who holds a commit tool by role policy');
  const named = [...policy.slice(start, policy.indexOf('hold one', start)).matchAll(/`(asd-[a-z-]+)`/g)].map((match) => match[1]).sort();
  assert.deepStrictEqual(holders, named, 'AC-8: git-strategy.md names the commit-tool holders and each agent\'s Run command line grants `git commit` - the two sites must agree');
});

test('sprint-019 AC-9/AC-10, sprint-023 AC-1: every agent handed a turn budget declares a maxTurns that leaves the report turn and the turn plan\'s earlier ledger turn', () => {
  const rule = sectionOf('.asd/rules/agent-protocol.md', 'Dispatch payload');
  const keys = Object.keys(jsonOf('.asd/rules/agent-protocol.md', 'Dispatch payload'));
  assert.ok(keys.includes('repo_root') && keys.includes('turn_budget'), `the payload object must define the repo_root and turn_budget keys, got ${JSON.stringify(keys)}`);
  const reserve = /"report_by": <maxTurns − (\d+)>/.exec(rule);
  assert.ok(reserve, 'the turn_budget key must state the turn the report is due by, relative to maxTurns');
  const turnPlan = rule.split(/(?<=\.)\s/).find((sentence) => spans(sentence).includes('LARGE_WAVE_FILES')) || '';
  const ledgerTurns = [...turnPlan.matchAll(/<maxTurns − (\d+)>/g)].map((match) => Number(match[1]));
  assert.strictEqual(ledgerTurns.length, 1, 'the sentence naming LARGE_WAVE_FILES is the turn plan, and it must give the one turn the coverage ledger is due by, relative to maxTurns');
  assert.ok(ledgerTurns[0] > Number(reserve[1]), `the ledger is due by turn maxTurns - ${ledgerTurns[0]}, which must come before the report turn maxTurns - ${reserve[1]}`);
  for (const name of [...internalReviewers().map((reviewer) => `asd-reviewer-${reviewer}`), 'asd-external-review', 'asd-advisor']) {
    const cap = sync.parseCanonicalFrontmatter(sync.readNormalized(path.join(REPO_ROOT, '.asd/agents', `${name}.md`))).meta.claude.maxTurns;
    assert.ok(Number.isInteger(cap) && cap > Number(reserve[1]), `${name}: the Turn budget line is filled from canon maxTurns and reports by turn maxTurns - ${reserve[1]}, so the cap must be an integer above ${reserve[1]} (got ${cap})`);
    assert.ok(cap > ledgerTurns[0], `${name}: the turn plan puts the ledger at turn maxTurns - ${ledgerTurns[0]}, so the cap must exceed ${ledgerTurns[0]} (got ${cap})`);
  }
});

test('sprint-021/sprint-022/sprint-032: the pr chain exits agree across the definitions, runtime CHAIN_EXITS, asd-sprint, README and the Phase table, and the merge outcomes and bounds "Merging a PR" names are the ones checks-wait runs', async () => {
  const definitions = readWorkflowDefinitions();
  const exits = [...new Set(definitions.flatMap(({ phases, next }) => Object.values(next).flat().filter((target) => !phases.includes(target))))].sort();
  assert.ok(exits.length > 0, 'sanity: the definitions must route pr to at least one chain exit');
  const chainExits = /^const CHAIN_EXITS = (\[[^\]]*\]);/m.exec(canonText('.asd/runtime.js'));
  assert.ok(chainExits, 'sanity: .asd/runtime.js must declare CHAIN_EXITS as a one-line array literal');
  assert.deepStrictEqual(JSON.parse(chainExits[1].replace(/'/g, '"')).sort(), exits, 'runtime.js CHAIN_EXITS must be exactly the exits the definitions route pr to - loadWorkflow accepts any CHAIN_EXITS member as a target, so a stale extra token stays loadable and routable');
  const sprintSkill = canonText('.asd/skills/asd-sprint/SKILL.md');
  const skillExits = /^SKILL: asd-sprint \| .*\bNEXT:\s*<([^>]+)>/m.exec(sprintSkill);
  assert.ok(skillExits && exits.every((exit) => skillExits[1].split('|').includes(exit)), 'asd-sprint must offer every chain exit in its return contract - an exit it cannot relay halts the sprint with no route');
  const readmePr = canonText('README.md').split('\n').find((line) => line.startsWith('| **pr** |') && line.includes('`gh pr create`')) || '';
  assert.deepStrictEqual(exits.filter((exit) => !readmePr.includes(`\`${exit}\``)), [], 'README\'s pr row must name every chain exit the definitions route pr to');
  const tablePr = sectionOf('.asd/rules/sprint-lifecycle.md', 'Phase table').split('\n').find((line) => line.startsWith('| pr |')) || '';
  assert.ok(exits.includes((/→ `([^`]+)`/.exec(tablePr) || [])[1]), `sprint-lifecycle.md "Phase table" pr row must exit to a chain exit the definitions route pr to; got: ${tablePr}`);

  const rule = sectionOf('.asd/rules/git-strategy.md', 'Merging a PR');
  const outcomes = [...new Set((await Promise.all([['pass'], ['none'], ['fail'], ['pending']].map(scriptedWait))).map(({ checks }) => checks))];
  assert.strictEqual(outcomes.length, 4, 'sanity: the four scripted waits end in four distinct outcomes');
  assert.deepStrictEqual(outcomes.filter((outcome) => !rule.includes(`\`${outcome}\``)), [], '"Merging a PR" names every outcome checks-wait returns');
  const bounds = [`${runtime.CHECKS_GRACE_MS / 1000} s`, `${runtime.CHECKS_LIMIT_MS / 60000} min`];
  for (const [site, text] of [['git-strategy.md "Merging a PR"', rule], ['README.md pr row', readmePr]]) {
    assert.deepStrictEqual(bounds.filter((bound) => !text.includes(bound)), [], `${site} states the bounds checks-wait runs`);
  }
});

test('sprint-025 AC-3, sprint-028 AC-12: every phase skill pre-approves the tools its steps run, and README mirrors the timing commands and ledger', () => {
  const INLINE_RESEARCH_PHASES = ['audit', 'plan', 'scope', 'design', 'design-promote'];
  const rawToolsOf = (name) => sync.parseCanonicalFrontmatter(canonText(`.asd/skills/${name}/SKILL.md`)).meta.claude['allowed-tools'];
  const toolsOf = (name) => rawToolsOf(name).split(/\s+/);
  const phaseSkills = fs.readdirSync(path.join(REPO_ROOT, '.asd/skills')).filter((skill) => /^asd-phase-/.test(skill));
  assert.ok(INLINE_RESEARCH_PHASES.every((phase) => phaseSkills.includes(`asd-phase-${phase}`)), 'the research phase list names only existing phase skills');
  for (const name of phaseSkills) {
    const tools = toolsOf(name);
    assert.ok(/(^|\s)Bash(\s|$)/.test(rawToolsOf(name)) || rawToolsOf(name).includes('Bash(node .asd/runtime.js:*)'),`${name} runs runtime.js timing commands, so its allowed-tools must pre-approve them`);
    assert.ok(tools.includes('Grep'), `${name}: allowed-tools must hold Grep`);
    if (INLINE_RESEARCH_PHASES.includes(name.slice('asd-phase-'.length))) {
      for (const tool of ['WebSearch', 'WebFetch']) assert.ok(tools.includes(tool), `${name}: its inline research and fetch steps need ${tool} pre-approved`);
    }
  }
  const readme = canonText('README.md');
  for (const token of ['timing-recover', 'timing-summary', 'timing.jsonl']) {
    assert.ok(readme.includes(token), `README.md must mirror ${token}`);
  }
});

test('sprint-026 AC-13 (E1/E2), sprint-041 AC-3/AC-4: conditional agent inputs and standalone researcher delegation preserve the no-sprint preconditions', () => {
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
    assert.deepStrictEqual(jsonOf(rel, 'Delegates').agents, ['asd-researcher'], `E2: ${skill} delegates research to the standalone-capable researcher (AC-3/AC-4)`);
  }
});

test('sprint-026 AC-15, sprint-040 AC-6: the context check and skill form enumerate the same standalone skills', () => {
  const skills = FORM_CATEGORIES.skills.files();
  const workflows = FORM_CATEGORIES.workflows.files();
  const { standaloneSkillFiles } = runtime;
  assert.strictEqual(skills.length, 7, 'the seven standalone skills');
  assert.ok(workflows.length >= 11, 'the phase workflows');
  assert.deepStrictEqual(standaloneSkillFiles(), [...skills].sort(), 'the context check and skill form use the same canonical files');
});

test('sprint-028 AC-2: the cleanup workflow Owner line names exactly the agents its Dispatch section lists', () => {
  const owner = canonText('.asd/workflows/asd-phase-cleanup.md').split('\n').find((line) => line.startsWith('Owner:')) || '';
  const agents = fs.readdirSync(path.join(REPO_ROOT, '.asd/agents')).map((file) => file.replace(/\.md$/, ''));
  const dispatched = jsonOf('.asd/workflows/asd-phase-cleanup.md', 'Dispatch').map((row) => row.agent).sort();
  assert.ok(dispatched.length > 0, 'sanity: cleanup must declare its dispatched agents');
  assert.deepStrictEqual(agents.filter((agent) => owner.includes(`\`${agent}\``)), dispatched, 'the Owner line names exactly the agents the Dispatch section lists');
});

test('sprint-028 AC-6 (D6/D14): scope step 3a fills the placeholders t_state.json freezes the cleanup and design_system flags with', () => {
  const seed = stepOf(sectionOf('.asd/workflows/asd-phase-scope.md', 'Steps'), '3a');
  const state = readRepoFile('.asd/templates/t_state.json');
  for (const key of ['cleanup', 'design_system']) {
    const placeholder = new RegExp(`"${key}":\\s*"(\\{\\{[A-Z_]+\\}\\})"`).exec(state);
    assert.ok(placeholder, `t_state.json must freeze ${key} as a placeholder`);
    assert.ok(seed.includes(placeholder[1]), `scope step 3a must fill ${placeholder[1]}, or the literal survives into state.json and reads as an enabled ${key} whatever the config says`);
  }
});

test('sprint-040 AC-1: frozen mockup selection reaches Standard drafts and Lite promotion independently of the UX spec', () => {
  const state = JSON.parse(readRepoFile('.asd/templates/t_state.json'));
  assert.strictEqual(state.mockup_format, '{{MOCKUP_FORMAT}}');
  const steps = (phase) => sectionOf(`.asd/workflows/asd-phase-${phase}.md`, 'Steps');
  const scope = steps('scope');
  assert.ok(stepOf(scope, '3a').includes(state.mockup_format));
  const rule = headingBody('.asd/rules/sprint-lifecycle.md', 'Mockup format');
  assert.match(rule, /`none \| html \| claude_design \| figma`/);
  assert.match(rule, /`none` for a non-UI scope/);
  assert.match(rule, /lacks `mockup_format`[^\n]*frozen legacy UX flag[^\n]*ux_spec: true/);
  assert.match(rule, /recorded provider first[^\n]*configured non-`none` format[^\n]*snapshot take precedence/);
  const lite = stepOf(scope, '3b');
  assert.match(lite, /`lite` mockups[^\n]*frozen (?:mockup )?format[^\n]*`none`/);
  assert.doesNotMatch(lite, /ux_spec/);
  const design = steps('design');
  assert.match(stepOf(design, '2'), /all five design documents are disabled and the effective mockup format is `none`/);
  const authoring = stepOf(design, '8');
  assert.match(authoring, /Mockups:[^\n]*other than `none`[^\n]*<sprint>\/design\/mockups\//);
  assert.match(authoring, /UX-spec:[^\n]*`ux_spec` is enabled[^\n]*link available mockups/);
  assert.match(stepOf(steps('design-review'), '1'), /other than `none`[^\n]*every file under `<sprint>\/design\/mockups\//);
  const promote = steps('design-promote');
  assert.match(stepOf(promote, '1'), /other than `none`[^\n]*include existing mockups[^\n]*Empty combined scope/);
  assert.match(stepOf(promote, '4'), /Copy the mockups[^\n]*independently of UX-spec/);
  assert.ok(jsonOf('.asd/workflows/asd-phase-design-promote.md', 'Exit').writes.includes('docs/ux/mockups/ (in-scope mockups)'));

  const ux = canonText('.asd/templates/t_ux-spec.html');
  assert.match(ux, /<a href="\{\{relative mockup path or stable remote URL\}\}">/);
  assert.doesNotMatch(ux, /<iframe\b|\bsrcdoc=/i);
});

test('sprint-040 AC-8: sprint startup and direct phase entry reach the shared context and fail closed', () => {
  const providerPath = '.asd/rules/providers.md';
  const protocolPath = '.asd/rules/agent-protocol.md';
  const branch = 'Orchestrator branch references';
  const entry = 'Orchestrator phase entry';
  const sprintSteps = sectionOf('.asd/skills/asd-sprint/SKILL.md', 'Steps');
  const phases = [...new Set(readWorkflowDefinitions().flatMap(({ phases }) => phases))];
  const providers = readRepoFile(providerPath);
  const procedure = headingBody(protocolPath, entry);
  const branchRules = headingBody(providerPath, branch);
  const gaps = [];

  if (!sprintSteps.split('### Step 1:')[0].includes(`\`providers.md\` "${branch}"`)) gaps.push('sprint startup before sprint detection');
  if (!/context --role orchestrator --phase <phase> --out /.test(procedure) ||
      !procedure.includes('orchestrator-scope.context.md') ||
      !/build failure.*`FAILED`.*before executing phase steps/i.test(procedure)) gaps.push('phase bundle and build failure guard');
  if (!procedure.includes('section --file <path> --heading <text>') ||
      !/missing required text blocks/i.test(branchRules)) gaps.push('required section failure guard');

  for (const phase of phases) {
    const refs = runtime.contextRefs(providers, 'orchestrator', phase);
    const { ops } = jsonOf(`.asd/workflows/asd-phase-${phase}.md`, 'Entry');
    if (!ops.some((op) => op.startsWith(`context: agent-protocol.md '${entry}'`))) gaps.push(`${phase}: entry operation`);
    if (!refs.includes(`${providerPath}#${branch}`)) gaps.push(`${phase}: branch bundle`);
  }
  assert.deepStrictEqual(gaps, [], 'both sprint workflows and direct phase runs must reach the shared failure guards before acting');
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

test('sprint-035 AC-14: the config template ships safety_valve enabled at top level, and the README config schema and asd-init name the key', () => {
  assert.ok(/^safety_valve: enabled(?: +#.*)?$/m.test(canonText('.asd/templates/t_config.yaml')), 'the config template carries the key at top level, enabled');
  assert.deepStrictEqual(['README.md', '.asd/skills/asd-init/SKILL.md'].filter((rel) => !canonText(rel).includes('safety_valve')), [], 'the config schema mirrors name the key');
});
