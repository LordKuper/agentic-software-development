'use strict';

// one-time removal sweeps of past sprints

const { assert, fs, path, sync, update, runtime, REPO_ROOT, tests, test, canonText, canonMarkdownFiles, AGENT_MEMORY_ROOT, assertSweepReachesMemory, retiredAgentNames1400, legacyReviewerKeys1400 } = require('./lib.js');

test('sprint-021 AC-13: no canon, README, AGENTS.md, runtime, hook, workflow definition or agent-memory line keeps a sentence or term the sprint removed - the companion finalize PR, the closure-pending record, await-user-closure, the temp file outside the repo, a dev running --apply, NEGATIVE_TTL_MS - except the legacy-recovery lines D2 keeps', () => {
  const removed = [
    'await-user-closure',
    'companion PR',
    'companion closure PR',
    'companion branch',
    'Finalize after closure',
    'approve-before-finalize',
    'creates `chore/finalize-sprint-',
    'records `pr.state="closure-pending"`',
    'Set `pr.state="closure-pending"`',
    "state.pr.state === 'closure-pending'",
    'temp file outside the repo',
    'in the same task before marking it done',
    'after any canonical edit, run `node .asd/sync.js --apply',
    'for a dev to fix via `sync-apply`',
    'the explanatory parenthetical naming the four view path shapes lives only in `AGENTS.md`',
    'const NEGATIVE_TTL_MS',
    'now + NEGATIVE_TTL_MS',
  ];
  const memoryFiles = fs.readdirSync(path.join(REPO_ROOT, AGENT_MEMORY_ROOT), { recursive: true }).map((entry) => `${AGENT_MEMORY_ROOT}/${String(entry).split(path.sep).join('/')}`).filter((rel) => rel.endsWith('.md'));
  assertSweepReachesMemory(memoryFiles);
  const swept = [...canonMarkdownFiles(), 'README.md', 'AGENTS.md', '.asd/project/custom-coding-rules.md', '.asd/hooks/session-start.js', '.asd/runtime.js', '.asd/workflows/standard.json', '.asd/workflows/lite.json', ...memoryFiles];
  const hits = swept.flatMap((rel) => canonText(rel).split('\n').flatMap((line, index) => removed.filter((phrase) => line.includes(phrase)).map((phrase) => ({ at: `${rel}:${index + 1}`, rel, phrase, legacy: /\blegacy\b/i.test(line) }))));
  assert.deepStrictEqual(hits.filter((hit) => !hit.legacy).map((hit) => `${hit.at} ${hit.phrase}`), [], 'each phrase is a line this sprint deleted (git diff main...HEAD) - one surviving elsewhere restates the companion finalize flow, the closure-pending record, the per-task dev sync or the 5-minute retry default the sprint removed. CHANGELOG.md and sprint folders are history and stay out of the sweep');
  assert.deepStrictEqual(hits.filter((hit) => hit.legacy).map((hit) => `${hit.rel} ${hit.phrase}`), ['.asd/skills/asd-sprint/SKILL.md companion PR'], 'the exemption is exactly D2\'s legacy-recovery sentence in asd-sprint Step 1 (a legacy finalize PR found by gh pr list) - a new line may not escape the sweep by calling itself legacy');
});

test('sprint-022 AC-2/AC-3/AC-5 leftover-term check: no canon, README, AGENTS.md, template, runtime, hook, workflow definition or agent-memory line keeps a sentence or term the sprint removed - await-closure, Step 1A, the sprint-closure hard gate and its approval, the closure-write release, dev plan ticking', () => {
  const removed = [
    'await-closure',
    'Step 1A',
    '; and sprint closure',
    '| sprint closure |',
    'closure approval',
    'closure always requires user approval',
    'whose closure the user approves',
    'sprint-closure approval',
    'hard closure gate',
    'Merging is not closure',
    'Sprint closure is requested',
    'Sprint closure (finalization and archival)',
    'until you approve its closure',
    'the closure request belongs to',
    'tag and release at the closure write',
    'At the closure write, after its commit',
    'hands closure back to asd-sprint',
    'initial — tick corresponding checkboxes',
    'finish `BLOCKED:` subtasks, tick `plan.md` checkboxes',
  ];
  const memoryFiles = fs.readdirSync(path.join(REPO_ROOT, AGENT_MEMORY_ROOT), { recursive: true }).map((entry) => `${AGENT_MEMORY_ROOT}/${String(entry).split(path.sep).join('/')}`).filter((rel) => rel.endsWith('.md'));
  assertSweepReachesMemory(memoryFiles);
  const swept = [...canonMarkdownFiles(), 'README.md', 'AGENTS.md', '.asd/templates/t_config.yaml', '.asd/hooks/session-start.js', '.asd/runtime.js', '.asd/workflows/standard.json', '.asd/workflows/lite.json', ...memoryFiles];
  const hits = swept.flatMap((rel) => canonText(rel).split('\n').flatMap((line, index) => removed.filter((phrase) => line.includes(phrase)).map((phrase) => `${rel}:${index + 1} ${phrase}`)));
  assert.deepStrictEqual(hits, [], 'each phrase is from a line this sprint deleted (git diff main...HEAD) - one surviving restates the closure gate, its approval, the await-closure exit, the release at the closure write or dev plan ticking. CHANGELOG.md and sprint folders are history and stay out of the sweep');
});

test('sprint-023 leftover-term check: no canon, README, AGENTS.md, template, runtime, hook, workflow definition or agent-memory line keeps a sentence or term the sprint removed - the tier matrix heading, the inline scope manifest, the clamped priorTier and its re-entry wording, the line-only wave division and its waves.json shape, the dropped asd intake rows, the unconditional branch fast-forward, the unqualified "impl writes no tests" and the change-surface cap - its constant, subcommand, plan line and override gate', () => {
  const removed = [
    'Agent tier matrix',
    'Re-entry passes its prior `tier` as `priorTier`',
    '`priorTier` prevents a task from being downgraded',
    'reuse its tier on re-entry',
    'supplying its tier as `priorTier` on re-entry',
    'correction attempts and prior tier',
    'critical and never later downgraded',
    'tier never lowers',
    'fresh `asd-tester`, its payload opening with the header',
    'wave division, never resume, is the lever',
    'one per `.asd/runtime.js` `WAVE_THRESHOLD_LINES` begun',
    'one per WAVE_THRESHOLD_LINES begun, at least one',
    '`lines`, `threshold`',
    'the measured `lines` and each wave',
    '`covered by:` rows are dropped, and so are `asd` rows unless `--self-hosting`',
    'and `asd` rows outside a self-hosting project',
    'never applied) when it is not',
    'retro intake candidates ("Retro intake" above) |',
    'sole SSoT, not restated here): run',
    'verify each candidate at `HEAD`; the unresolved rest',
    'include/defer/reject; creates the sprint branch',
    'Before creating: `git fetch origin`, fast-forward local',
    'fast-forward the base branch, require a clean tree',
    '`/asd-sprint` reads `state.json`, detects',
    'SCOPE_MANIFEST_JSON',
    'scope manifest (above, JSON',
    '<rendered prompt + scope manifest>',
    'prompt+scope manifest',
    'stdin-piped prompt+diff',
    'scope manifest provided via stdin above',
    'The scope manifest is rendered into the prompt',
    '`external-review/t_review-scope.json`, rendered into the prompt',
    'rendering of the runtime-emitted scope manifest',
    'inject scope manifest',
    'prompt goes in via heredoc/here-string stdin',
    'heredoc/here-string stdin only',
    'impl writes **no tests** — its gate is build + lint',
    'All test work belongs to `impl-test`.',
    'Production source code in repo (no tests — see `impl-test`)',
    'no test-authoring Tasks or subtasks —',
    'no tests written here; run build/lint',
    '`impl` writes production code only — its gate is build + lint',
    'Written and run in `impl-test`, never in `impl`. Selection',
    'one full-suite check. Each impl-test entry',
    'PRD ACs, existing tests |',
    '| impl | Dev | `plan.md`',
    'index lines its devs returned',
    'delegate to `asd-dev` (`asd-tester` only for review findings',
    'dispatches `asd-dev-<tier>` for `mechanical`/`critical`, or the base `asd-dev` for `tier: standard`',
    'SURFACE_CAP_FILES',
    'surface-check',
    'surfaceCheck',
    'Change surface: <n> files',
    'Change surface: {{n}} files',
    'Change surface declaration',
    'change-surface cap override',
    'change-surface-cap-override',
  ];
  const memoryFiles = fs.readdirSync(path.join(REPO_ROOT, AGENT_MEMORY_ROOT), { recursive: true }).map((entry) => `${AGENT_MEMORY_ROOT}/${String(entry).split(path.sep).join('/')}`).filter((rel) => rel.endsWith('.md'));
  assertSweepReachesMemory(memoryFiles);
  const swept = [...canonMarkdownFiles(), 'README.md', 'AGENTS.md', '.asd/templates/t_config.yaml', '.asd/hooks/session-start.js', '.asd/runtime.js', '.asd/workflows/standard.json', '.asd/workflows/lite.json', ...memoryFiles];
  const hits = swept.flatMap((rel) => canonText(rel).split('\n').flatMap((line, index) => removed.filter((phrase) => line.includes(phrase)).map((phrase) => `${rel}:${index + 1} ${phrase}`)));
  assert.deepStrictEqual(hits, [], 'each phrase is from a line this sprint deleted (git diff 86e7706 HEAD), taken exactly - one surviving restates the tier table, the manifest in the prompt, the re-entry tier clamp, the change-surface cap or a removed shape as current. A later sprint that re-adopts a phrase deletes its entry here. CHANGELOG.md and sprint folders are history and stay out of the sweep');
});

test('sprint-027 leftover-term check: no canon, README, AGENTS.md, template, runtime, hook, workflow definition or agent-memory line keeps a sentence or term the sprint removed - the undecided-to-deferred default, closing without asking, the placeholder findings row, the memory D-N route and its Status flip, the memory-fix ordering after the dev and tester chains, the inline JSON route-task input and the scope phase\'s "dispatches none"', () => {
  const removed = [
    'undecided → `deferred`',
    'written `closed` without asking',
    '<!-- when no findings, leave one row: -->',
    '<!-- | — | — | — | no findings | — | -->',
    'is the empty table\'s placeholder',
    'lowest finding or `D-N` id',
    'after the round\'s dev and tester chains',
    'for a memory `D-N`, by the orchestrator',
    'Memory-fix dispatches (step 3) run last',
    'A review finding or test-fix `D-N` located in',
    'exactly as a review-fix memory finding does',
    'a memory finding\'s owner',
    'or deleted as ownerless',
    'with the fix commit sha in `<sprint>/test-plan.md`',
    'route-task --input <json>',
  ];
  const memoryFiles = fs.readdirSync(path.join(REPO_ROOT, AGENT_MEMORY_ROOT), { recursive: true }).map((entry) => `${AGENT_MEMORY_ROOT}/${String(entry).split(path.sep).join('/')}`).filter((rel) => rel.endsWith('.md'));
  assertSweepReachesMemory(memoryFiles);
  const swept = [...canonMarkdownFiles(), 'README.md', 'AGENTS.md', '.asd/templates/t_config.yaml', '.asd/hooks/session-start.js', '.asd/runtime.js', '.asd/workflows/standard.json', '.asd/workflows/lite.json', ...memoryFiles];
  const hits = swept.flatMap((rel) => canonText(rel).split('\n').flatMap((line, index) => removed.filter((phrase) => line.includes(phrase)).map((phrase) => `${rel}:${index + 1} ${phrase}`)));
  assert.deepStrictEqual(hits, [], 'each phrase is from a line this sprint deleted (git diff main...HEAD), taken exactly - one surviving restates the superseded rule as current. A later sprint that re-adopts a phrase deletes its entry here. CHANGELOG.md and sprint folders are history and stay out of the sweep');
  const scopeOwner = canonText('.asd/workflows/asd-phase-scope.md').split('\n').find((line) => line.startsWith('Owner:')) || '';
  assert.ok(scopeOwner.includes('inline orchestrator') && scopeOwner.includes('`asd-advisor`') && !scopeOwner.includes('asd-ba') && !scopeOwner.includes('dispatches none'), 'scope runs its research inline and dispatches only the advisor for an escalation consult, so its Owner line names the orchestrator and the advisor - never a BA dispatch, never "dispatches none" (plan, retro and pr keep theirs)');
});

test('sprint-028 leftover-term check: no canon, README, AGENTS.md, template, runtime, hook, workflow definition or agent-memory line keeps a name or sentence the sprint removed - the nine retired agents, their reviewer verdict tokens, the critical routing tier phrases, the retired testing review file name and critical-tier prose, the no-PM-agent sentence and the memory claims about creators that no longer exist', () => {
  const retiredAgents = [...retiredAgentNames1400(), 'asd-pm'];
  const verdictTokens = ['design', 'impl'].flatMap((phase) => legacyReviewerKeys1400().map((key) => `[REVIEW-${phase}-${key}]`));
  const removed = [
    ...retiredAgents,
    ...verdictTokens,
    'tier: critical',
    'asd-tester-<tier>',
    '`-critical`',
    '`mechanical` or `critical`',
    'critical: 2',
    'no PM agent is spawned',
    'Correctness\'s UI conformance',
    '(BA/UX/Architect/advisor)',
    'The Documentation rubric entry "In-code doc comments"',
    'design-review\'s creator',
    'iter-NN/testing.md',
    '(reviews `testing.md`)',
    'no longer critical by that fact alone',
    'never `critical`',
  ];
  const memoryFiles = fs.readdirSync(path.join(REPO_ROOT, AGENT_MEMORY_ROOT), { recursive: true }).map((entry) => `${AGENT_MEMORY_ROOT}/${String(entry).split(path.sep).join('/')}`).filter((rel) => rel.endsWith('.md'));
  assertSweepReachesMemory(memoryFiles);
  const swept = [...canonMarkdownFiles(), 'README.md', 'AGENTS.md', '.asd/templates/t_config.yaml', '.asd/templates/t_state.json', '.asd/hooks/session-start.js', '.asd/runtime.js', '.asd/workflows/standard.json', '.asd/workflows/lite.json', ...memoryFiles];
  const hits = swept.flatMap((rel) => canonText(rel).split('\n').flatMap((line, index) => removed.filter((phrase) => line.includes(phrase)).map((phrase) => `${rel}:${index + 1} ${phrase}`)));
  assert.deepStrictEqual(hits, [], 'each phrase is a name or line this sprint removed (git diff main...HEAD) or a memory claim about a role it removed, taken exactly - one surviving restates the superseded roster as current. CHANGELOG.md, migrations, tests and sprint folders are history and stay out of the sweep; README.md\'s "no BA, UX, Architect or PM agent" negation is not a listed phrase');
});

test('sprint-029 AC-10 leftover-term check: no canon, README, AGENTS.md, runtime, hook or agent-memory line keeps the superseded "Low-severity test-only findings" heading, its prose form, or AGENTS.md\'s "No build / lint" statement', () => {
  const removed = ['Low-severity test-only', 'low-severity test-only', 'No build / lint', 'No package.json, compiler, or build step'];
  const memoryFiles = fs.readdirSync(path.join(REPO_ROOT, AGENT_MEMORY_ROOT), { recursive: true }).map((entry) => `${AGENT_MEMORY_ROOT}/${String(entry).split(path.sep).join('/')}`).filter((rel) => rel.endsWith('.md'));
  assertSweepReachesMemory(memoryFiles);
  const swept = [...canonMarkdownFiles(), 'README.md', 'AGENTS.md', '.asd/hooks/session-start.js', '.asd/runtime.js', ...memoryFiles];
  const hits = swept.flatMap((rel) => canonText(rel).split('\n').flatMap((line, index) => removed.filter((phrase) => line.includes(phrase)).map((phrase) => `${rel}:${index + 1} ${phrase}`)));
  assert.deepStrictEqual(hits, [], 'each phrase is a heading or sentence this sprint renamed or removed (git diff main...HEAD), taken exactly - one surviving points a reader at a section that no longer exists. CHANGELOG.md, migrations, tests and sprint folders are history and stay out of the sweep');
});

test('sprint-030 leftover-term check: no canon, README, AGENTS.md, .gitignore, runtime, hook or agent-memory line keeps the external-review cache\'s tracked-folder path, the restated suite-op bracketing clauses, the valve applying to every scoped run, or the by-hand decisions-log rotation check', () => {
  const removed = ['.asd/project/external-cache.json', 'gitignored, machine-local retry/failure state', 'bracket each suite run (steps 3, 8)', 'bracket each run with a `suite` op', 'applying its shared-infrastructure safety valve before every scoped run', 'mandatory shared-infrastructure safety valve checked before use', 'subject to its safety valve, never the whole repo —', 'rotate the decisions log when'];
  const memoryFiles = fs.readdirSync(path.join(REPO_ROOT, AGENT_MEMORY_ROOT), { recursive: true }).map((entry) => `${AGENT_MEMORY_ROOT}/${String(entry).split(path.sep).join('/')}`).filter((rel) => rel.endsWith('.md'));
  assertSweepReachesMemory(memoryFiles);
  const swept = [...canonMarkdownFiles(), 'README.md', 'AGENTS.md', '.gitignore', '.asd/hooks/session-start.js', '.asd/runtime.js', '.asd/skills/asd-update/update.js', ...memoryFiles];
  const hits = swept.flatMap((rel) => canonText(rel).split('\n').flatMap((line, index) => removed.filter((phrase) => line.includes(phrase)).map((phrase) => `${rel}:${index + 1} ${phrase}`)));
  assert.deepStrictEqual(hits, [], 'each phrase is a path or sentence this sprint removed (git diff main...HEAD), taken exactly - one surviving points a reader at a cache path the runtime no longer uses or a duty its owner no longer states. CHANGELOG.md, migrations, tests and sprint folders are history and stay out of the sweep');
});

test('sprint-031 leftover-term check: no canon, README, AGENTS.md, runtime, hook or agent-memory line keeps the design-review Quality and Efficiency roster, the impl-review-only Combined wording, the Lite-only Combined row or the findings category column', () => {
  const removed = [
    'impl-review only — never dispatched in design-review', 'Lite impl-review reviewer, one pass', 'dispatched in design-review, impl-review', 'Quality reviewer, dispatched in design-review and impl-review', 'Efficiency reviewer, dispatched in design-review and impl-review',
    'Combined reviewer: the one internal reviewer of an impl-review whose workflow roster names', 'n/a (lite has no design-review)', '| design-review | Quality + Efficiency + External Review |', '(keyed `quality`/`efficiency`/`external`)',
    '"agent": "asd-reviewer-quality, asd-reviewer-efficiency"', 'design-review<br/><i>Quality · Efficiency · External</i>', '2 internal reviewers (Quality, Efficiency) plus External Review iterate to APPROVE', 'design-review + impl-review | Bugs, security', 'design-review + impl-review | Over-engineering',
    'impl-review (`lite` only)', "Quality's UI rubric section is `n/a: outside phase gate` when no ux-spec/design-system artifact is in scope", 'When design-review has no ux-spec/design-system draft, Quality still dispatches', 'always dispatches asd-reviewer-quality + asd-reviewer-efficiency',
    'Every internal reviewer — `asd-reviewer-quality`, `asd-reviewer-efficiency` — is dispatched', 'verified during design-review + impl-review by `asd-reviewer-quality`', 'Binding for the main orchestrator (author) and `asd-reviewer-quality` (verify, UI conformance section)',
    '"role":"asd-reviewer-quality","phase":"design-review"', '"role":"asd-reviewer-efficiency","phase":"design-review"', 'dispatches reviewers (quality, efficiency, External Review)', '(`quality` and `efficiency` in `standard`, `combined` in lite)', 'Quality and the `lite`-only combined reviewer carry', 'category column keep-as-is/simplify/escalate',
    'design-review judges draft correctness (AC completeness, contract/ADR soundness)', 'impl-review adds test-suite cost and perf budgets',
  ];
  const memoryFiles = fs.readdirSync(path.join(REPO_ROOT, AGENT_MEMORY_ROOT), { recursive: true }).map((entry) => `${AGENT_MEMORY_ROOT}/${String(entry).split(path.sep).join('/')}`).filter((rel) => rel.endsWith('.md'));
  assertSweepReachesMemory(memoryFiles);
  const swept = [...canonMarkdownFiles(), 'README.md', 'AGENTS.md', '.asd/hooks/session-start.js', '.asd/runtime.js', '.asd/workflows/standard.json', ...memoryFiles];
  const hits = swept.flatMap((rel) => canonText(rel).split('\n').flatMap((line, index) => removed.filter((phrase) => line.includes(phrase)).map((phrase) => `${rel}:${index + 1} ${phrase}`)));
  assert.deepStrictEqual(hits, [], 'each phrase is a sentence or term this sprint removed (git diff main...HEAD), taken exactly - one surviving still sends standard design-review to Quality and Efficiency or Combined away from drafts. CHANGELOG.md, migrations, tests and sprint folders are history and stay out of the sweep');
});

test('sprint-032 leftover-term check: no canon, README, AGENTS.md, runtime, hook, workflow definition or agent-memory line keeps a sentence or term this sprint removed - the manual sync step after an update, the open-mode await-merge exit, the ungated dev memory commit, the human-merge wording and the literal story connectives', () => {
  const removed = [
    'If update changed hook files or added skills, run sync next', 'report this, do not auto-apply', 'NEXT: <asd-sync|none>', 'asking per-file whether to overwrite, keep, or diff before writing anything',
    '- never: overwrite a file without a per-file decision.', 'For each non-`current` item, request user decision', "A dev's or tester's own memory commit is not gated", "Checked at the orchestrator's memory commit",
    'open mode returns `NEXT: await-merge`', 'a later resume re-enters `pr` in merge mode, which returns `NEXT: done`', '(open the PR, `NEXT: await-merge`', 'write before `NEXT: await-merge`',
    'after checks pass and the PR is mergeable; it never waits for a human to click merge', '(only when step 1 skipped audit)', "on pr open mode's return (it closed its own)", 'Emit `NEXT: await-merge`; the active sprint remains',
    '<b>as</b> {{role}}', '`--apply` over the views `--check` reports stale', '"if": "open mode, PR opened"', 'Automatically runs `node .asd/sync.js --check` afterward',
    'it automatically runs `node .asd/sync.js --check` — canon files changed upstream', 'per-file overwrite/keep/diff confirmation, never a silent bulk overwrite', 'then ASD merges the PR itself through `gh` (a `gh` failure',
    'Exit tokens are `await-merge` (PR opened)', "`pr`'s open and merge exits",'A merge blocked by a failing check, a conflict or a branch-protection rule is reported, not forced',
  ];
  const memoryFiles = fs.readdirSync(path.join(REPO_ROOT, AGENT_MEMORY_ROOT), { recursive: true }).map((entry) => `${AGENT_MEMORY_ROOT}/${String(entry).split(path.sep).join('/')}`).filter((rel) => rel.endsWith('.md'));
  assertSweepReachesMemory(memoryFiles);
  const swept = [...canonMarkdownFiles(), 'README.md', 'AGENTS.md', '.asd/hooks/session-start.js', '.asd/runtime.js', '.asd/workflows/standard.json', '.asd/workflows/lite.json', ...memoryFiles];
  const hits = swept.flatMap((rel) => canonText(rel).split('\n').flatMap((line, index) => removed.filter((phrase) => line.includes(phrase)).map((phrase) => `${rel}:${index + 1} ${phrase}`)));
  assert.deepStrictEqual(hits, [], 'each phrase is a sentence or term this sprint removed (git diff main...HEAD), taken exactly - one surviving leaves a rule saying a user runs sync after an update, that pr open mode exits at await-merge, or that a dev memory commit is ungated. CHANGELOG.md and sprint folders are history.');
});

test('sprint-033 leftover-term check: no canon, README, AGENTS.md, runtime, sync, hook, workflow definition or agent-memory line keeps a sentence or term this sprint removed - the old rotate subject, the duplicate-of removal reason, the one-suffix variant sentence, the wrapper-applied external floor and the severity-driven iron-rule FAIL', () => {
  const removed = [
    'chore(sprint): rotate decisions log for', 'duplicate of <test>', 'The one fixed suffix is `mechanical`', "VARIANT_SUFFIXES = ['mechanical', 'standard']",
    'apply the floor from `payload.floor`, never one of its own or the CLI\'s', 'Dropped findings (below severity floor, nitpick) are never rendered as per-finding rows — only a count per category',
    'Violation = `FAIL` from', 'Violation = FAIL from',
  ];
  const memoryFiles = fs.readdirSync(path.join(REPO_ROOT, AGENT_MEMORY_ROOT), { recursive: true }).map((entry) => `${AGENT_MEMORY_ROOT}/${String(entry).split(path.sep).join('/')}`).filter((rel) => rel.endsWith('.md'));
  assertSweepReachesMemory(memoryFiles);
  const swept = [...canonMarkdownFiles(), 'README.md', 'AGENTS.md', '.asd/hooks/session-start.js', '.asd/runtime.js', '.asd/sync.js', '.asd/workflows/standard.json', '.asd/workflows/lite.json', ...memoryFiles];
  const hits = swept.flatMap((rel) => canonText(rel).split('\n').flatMap((line, index) => removed.filter((phrase) => line.includes(phrase)).map((phrase) => `${rel}:${index + 1} ${phrase}`)));
  assert.deepStrictEqual(hits, [], 'each phrase is a sentence or term this sprint removed (git diff main...HEAD), taken exactly - one surviving restates the old rotate subject, the duplicate-of reason, the single variant suffix, a wrapper that applies the floor itself or an iron rule whose violation is a FAIL. CHANGELOG.md and sprint folders are history.');
});

test('sprint-034 leftover-term check: no canon, README, AGENTS.md, runtime, hook, docs or agent-memory line keeps a sentence this sprint removed - the heredoc-only External Review wording, the hand-written verdict and latch writes, the retro-issue-only triage wording, the unpaired close and the Suite run scope clause', () => {
  const removed = [
    "in the heredoc/here-string form of 'Invocation'",
    'writing the prompt, the scope manifest or the review file',
    'no temp file, no cleanup step needed since nothing was created',
    'never written to disk (required: this agent is read-only on both providers)',
    'the wrapper writes nothing, so no step in the invocation may touch the filesystem',
    'no temp file, no cleanup step, because nothing was ever created on disk',
    'Ensure labels',
    'Closes 2-3 run here, before the gate',
    'under self-hosting it also triages open ASD retro issues at the retro intake',
    'triage closes of one (scope step 2a) and post-release closes (pr merge) take no gate',
    '`asd-retro` issue dispositions live on GitHub, never here',
    "The dispatching phase workflow writes a reviewer's latch entry the moment",
    'write `state.json` `reviews.design.verdicts["iter-NN"]`',
    "write the wave node's `verdicts[\"iter-NN\"]`",
    "carries that section's `verdicts[\"iter-NN\"]`, `latched` and decisions-log writes",
    'Closing an already-closed id is skipped with a warning',
    "(`agent`, `tier`, `model` — `state.json.task_routing`'s when routed);",
    'A new `Suite run` records `HEAD` and scope;',
    'This agent writes nothing to disk',
    'never pre-write anything to scratch',
    '(nothing written to disk)',
    'Only that prompt goes via heredoc/here-string stdin',
    'only the fixed prompt stays in the heredoc',
  ];
  const memoryFiles = fs.readdirSync(path.join(REPO_ROOT, AGENT_MEMORY_ROOT), { recursive: true }).map((entry) => `${AGENT_MEMORY_ROOT}/${String(entry).split(path.sep).join('/')}`).filter((rel) => rel.endsWith('.md'));
  assertSweepReachesMemory(memoryFiles);
  const docs = fs.readdirSync(path.join(REPO_ROOT, 'docs'), { recursive: true }).map((entry) => `docs/${String(entry).split(path.sep).join('/')}`).filter((rel) => rel.endsWith('.md'));
  const swept = [...canonMarkdownFiles(), 'README.md', 'AGENTS.md', '.asd/hooks/session-start.js', '.asd/runtime.js', ...docs, ...memoryFiles];
  const hits = swept.flatMap((rel) => canonText(rel).split('\n').flatMap((line, index) => removed.filter((phrase) => line.includes(phrase)).map((phrase) => `${rel}:${index + 1} ${phrase}`)));
  assert.deepStrictEqual(hits, [], 'each phrase is a sentence this sprint removed (git diff main...HEAD) or a memory claim about the behaviour it removed, taken exactly - one surviving states the superseded rule as current. CHANGELOG.md, migrations, tests and sprint folders are history and stay out of the sweep');
});

test('sprint-035 leftover-term check: no canon, README, AGENTS.md, runtime, hook, docs or agent-memory line keeps a sentence this sprint removed - the mandatory-valve wording, the user smoke check, the dev-never-prunes parenthetical, the second-derivation clause and the test-plan non-list clause', () => {
  const removed = [
    'mandatory, not heuristic',
    'MUST apply this test',
    'The user smoke check',
    'first, the smoke check (`artifact-layout.md` "Test plan" Manual verification)',
    'devs never author/modify/prune a test',
    "the runner's own answer is used, not a second derivation",
    'Not a task list (`plan.md`) nor a review verdict',
  ];
  const memoryFiles = fs.readdirSync(path.join(REPO_ROOT, AGENT_MEMORY_ROOT), { recursive: true }).map((entry) => `${AGENT_MEMORY_ROOT}/${String(entry).split(path.sep).join('/')}`).filter((rel) => rel.endsWith('.md'));
  assertSweepReachesMemory(memoryFiles);
  const docs = fs.readdirSync(path.join(REPO_ROOT, 'docs'), { recursive: true }).map((entry) => `docs/${String(entry).split(path.sep).join('/')}`).filter((rel) => rel.endsWith('.md'));
  const swept = [...canonMarkdownFiles(), 'README.md', 'AGENTS.md', '.asd/hooks/session-start.js', '.asd/runtime.js', ...docs, ...memoryFiles];
  const hits = swept.flatMap((rel) => canonText(rel).split('\n').flatMap((line, index) => removed.filter((phrase) => line.includes(phrase)).map((phrase) => `${rel}:${index + 1} ${phrase}`)));
  assert.deepStrictEqual(hits, [], 'each phrase is a sentence this sprint removed (git diff main...HEAD), taken exactly - one surviving states the superseded rule as current. CHANGELOG.md, migrations, tests and sprint folders are history and stay out of the sweep');
});

test('sprint-036 leftover-term check: no canon, README, AGENTS.md, runtime, hook, docs, generated view, manifest or agent-memory line keeps a sentence or name this sprint removed - the comment-only latch exception and its lexer, the --subject one-command commit form, the previous sol id', () => {
  const removed = [
    'a hunk of only blank or comment lines does not count',
    'isCommentOnlyChange',
    'projectExecutable',
    'COMMENT_LEXERS',
    'commit-check --subject "<header>" -- <paths> && git commit --only -m "<header>" [-m "<body>"]',
    ['gpt-6', '1-sol'].join('.'),
  ];
  const memoryFiles = fs.readdirSync(path.join(REPO_ROOT, AGENT_MEMORY_ROOT), { recursive: true }).map((entry) => `${AGENT_MEMORY_ROOT}/${String(entry).split(path.sep).join('/')}`).filter((rel) => rel.endsWith('.md'));
  assertSweepReachesMemory(memoryFiles);
  const docs = fs.readdirSync(path.join(REPO_ROOT, 'docs'), { recursive: true }).map((entry) => `docs/${String(entry).split(path.sep).join('/')}`).filter((rel) => rel.endsWith('.md'));
  const views = ['.codex/agents', '.claude/agents'].flatMap((dir) => fs.readdirSync(path.join(REPO_ROOT, dir)).map((name) => `${dir}/${name}`)).filter((rel) => fs.statSync(path.join(REPO_ROOT, rel)).isFile());
  const swept = [...canonMarkdownFiles(), 'README.md', 'AGENTS.md', '.asd/hooks/session-start.js', '.asd/runtime.js', '.asd/sync.js', '.asd/release-manifest.json', 'tests/fixtures/expected/agents/demo-agent.codex.toml', ...docs, ...views, ...memoryFiles];
  const hits = swept.flatMap((rel) => canonText(rel).split('\n').flatMap((line, index) => removed.filter((phrase) => line.includes(phrase)).map((phrase) => `${rel}:${index + 1} ${phrase}`)));
  assert.deepStrictEqual(hits, [], 'each entry is a sentence or name this sprint removed (git diff main...HEAD), taken exactly - one surviving states the superseded rule as current. CHANGELOG.md, migrations, tests and sprint folders are history and stay out of the sweep');
});
