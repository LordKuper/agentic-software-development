---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 020-multi-workflow-lite

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 9463f2c35157d12d97a6e91e1285f1407536a101 | full change surface |
| 2 | a4f4e51c0ac79575740a81734986fd9307e59a96 | delta since entry 1 |

Entry 2: the delta is `git diff 9463f2c...HEAD` over the same pathspec. It holds 3 files and 3 changed lines (`.asd/rules/sprint-lifecycle.md`, `README.md`, `.asd/release-manifest.json`) from the D-1/D-2 test-fix commits 52c72ed and 3550328. Those are framework-wide files, so the safety valve applies again and the impacted set is the full suite. The pre-strategy run (full suite, HEAD 7ab8347, tests as found) was `node tests/run.js` → exit 0, 245/245 passed.

Impacted set (entry 1): the change surface (`git diff main...HEAD`, 38 files, commits 848168f..9f29356) touches `.asd/runtime.js`, `.asd/hooks/session-start.js`, the workflow definitions, every rule doc the chain lives in, README and AGENTS.md. That is framework-wide shared infrastructure, so the `sprint-lifecycle.md` "Impacted test set" safety valve applies and the impacted set is the full suite (`node tests/run.js`). `commands.yaml` carries no `test_affected`.

Pre-strategy run (full suite, HEAD 47e0d13, tests as found): `node tests/run.js` → exit 1, 222/238 passed. The 16 failures were stale tests, not code defects: 7 read the removed `PHASE_CHAIN` literal (`session-start.js must keep PHASE_CHAIN as a literal array`); 5 hardcoded the reviewer roster (11 agents, 6 read-only agents, 5 reviewers), which `asd-reviewer-combined` changed; 2 emitted the combined reviewer's own rubric, so emission threw `rubric entry missing for n/a predicate: SSoT`; 2 pinned wording the sprint changed (the `validate-ledger --manifest` step, now the `persist-review` step; "Applies to the 4 internal reviewers").

Leftover-term check (`artifact-layout.md` "Agent memory"; removed: the `PHASE_CHAIN` literal and the rollback-reset table). The whole repo was searched, `.claude/agent-memory/**` included. Hits:
- `.asd/rules/sprint-lifecycle.md:96`: "the rollback-reset table never fires for this route". This is canon, so it is filed as D-1.
- `.claude/agent-memory/asd-tester-critical/project_testability-envelope.md:18`: this tester's own memory. It was rewritten in this entry and the fix is committed with the tests.
- `.asd/project/decisions-log.md:221` and `CHANGELOG.md:399`: historical records of past releases and decisions, true when written. They are not in scope.
- `tests/run.js`: every `PHASE_CHAIN` use in the tests was rewritten in this entry.

`sprint-020 AC-1: no canon, README, AGENTS.md or agent-memory line …` makes the check permanent.

## Risk → check decisions

Entry 1's rows are in `test-plan.entry-01.md`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `sprint-lifecycle.md` "Red-full-suite invalidation": "the rollback-reset table never fires" is now "`rollback_reset` never fires" (52c72ed, D-1) | The line points a reader at a removed mechanism again, or the fix drops the clause saying the red-suite route is not a rollback | static | keep | The leftover-term sweep (sprint-020 AC-1) turned red on this line at 47e0d13 (entry 1's fail-first, `Found: .asd/rules/sprint-lifecycle.md:96`) and is green at this HEAD. The fix reverts to exactly the state that failed, so that proof also covers the revert. The new wording names the live key that `sprint-020 AC-2/AC-4/AC-6` pins. The clause's substance (that the route is not a rollback) is unchanged, and no test pinned the old wording. |
| `README.md` `standard` bullet: "the default when nothing is selected" is now "what a `state.json` without the field reads as — a sprint started before v13.3.0" (3550328, D-2) | README calls a workflow the default again | static | keep | The sprint-020 AC-6 no-default sweep turned red on this line at 47e0d13 (entry 1's fail-first, `Found: README.md:132`) and is green at this HEAD. The absent-field reading the new text states is the hook behaviour pinned by `sprint-020 AC-1/AC-6: SessionStart takes its chain …` (absent-field case). |
| Same README line: the version literal "v13.3.0" | The release named is not the one that introduced `state.json.workflow` | — | none | This is a fact about a release that has already shipped, so a later edit elsewhere cannot make it false. A test could only pin this one literal. Checked by hand at this HEAD: `release-manifest.json` `asd_version` is 13.3.0, the `CHANGELOG.md` v13.3.0 entry adds "Workflows", and main is at 13.2.0. |
| `.asd/release-manifest.json` `upstream_hashes` for the two edited files | The ledger drifts from the edited files | static | keep | The existing `upstream_hashes` test (both directions) is green at this HEAD. |
| asd-sprint SKILL.md Step 2B collapse clauses, scoped to `standard` (1a1a983, 8633052; review-fix wave-1/iter-01, testing.md 1; supersedes entry-01 "AC-6 selection" for the resume flow) | A resume clause applies the collapse to a workflow without `design`, so a lite sprint resumed at design-promote is dispatched to `plan` and aborts | static relation | add | The AC-6 test now takes every Step 2B sentence that applies the collapse test and requires each to name exactly the workflows whose `phases` hold `design`. This is the same derivation as the audit-exit extension. A sanity assert requires both acting sites, the re-run menu and the resume exception. |
| Acting-site predecessors in asd-phase-plan.md, asd-phase-retro.md and asd-phase-design-promote.md (review-fix wave-1/iter-01, testing.md 2; supersedes entry-01 "Rule-doc chain mirrors" for these sites) | A workflow's own `state.json.phase` check drifts from `lite.json`, so a valid lite sprint aborts while checkpoints.md stays right | static relation | add | The chain-mirror loop now checks every predecessor that differs from standard's. For each one, that phase's workflow must bind the predecessor to the workflow name, either as "advanced from … \`<pred>\` (\`<name>\`)" or inside a "\`<name>\`: …" clause. The predecessors are derived from each definition, not listed by hand. |
| Hook `WORKFLOW_NAME_RE` guard (review-fix wave-1/iter-01, testing.md 3; supersedes entry-01's hook row for the invalid-name cases) | The name guard is dropped, so a traversal value loads a definition outside the name space | unit (hook in temp root) | add | The `'../standard'` case was vacuous, because it resolves to `.asd/standard.json`, which the fixture never writes. It is replaced by `'../workflows/lite'`, which resolves to the installed `lite.json` on every platform, so without the guard the hook prints `plan`. The `'Lite'` case stays: it adds coverage on case-insensitive hosts only, and nothing else relies on it. |
| Agent Inputs lines reading ACs from `docs/product/requirements/` (87860ea; review-fix wave-1/iter-01, testing.md 4; supersedes entry-01 "Agent 'under `lite` always `sprint.md`' lines" for the omission risk) | An AC reader omits the lite clause, so under lite it checks the previous sprint's requirements | static sweep | add | New test. The reader set is derived from each agent's `## Inputs`. Every line there that reads `docs/product/requirements/` must cite `.asd/rules/sprint-lifecycle.md` "Workflows". The test pins only the citation, never the wording. Entry 1's `none` still covers drift of the clause wording. |
| AC-6 no-default sweep (review-fix wave-1/iter-01, testing.md 5; supersedes entry-01 "AC-6 selection" for the docs half) | A default claim phrased "by default", "defaults to" or "(default)" passes | static sweep | add | The pattern is widened to `\bdefaults?\b` (case-insensitive) and scoped to the **sentence** that quotes a workflow name, not the whole line. Premise mismatch: the review said a line-scoped widening needs no exemption, but 1a1a983 added `` `standard` `` to SKILL.md:44, which also holds "resume (default)" in another sentence. A line-scoped widening goes red at this HEAD (measured, 1 hit: SKILL.md:44). "never defaulted" matches neither form. |
| External Review availability-skip persistence (d3bcb59; review-fix wave-1/iter-01, testing.md 6; supersedes entry-01 "Review workflows' persist step (AC-9)" for the skip path) | A site has the workflow hand-write `external.md` again, leaving no `external.findings.json` for the AC-8 route | static relation | add | The sprint-012 AC-2/AC-4/AC-12 test now pins four sites. (1) The home, review-policy.md "Coverage ledger" Persistence, must bring the skip under the command and point at `external-review.md` "Detection and negative cache". (2) That section's skip bullet must name `persist-review` and cite Persistence. (3, 4) The skip-recording steps of both review workflows, located by the `"APPROVE (skipped: <reason>)"` literal, must do the same. Premise mismatch: no canon site spells `persist-review --reviewer external`. The command's form lives only at the home, so each site is pinned on routing through `persist-review` plus the Persistence citation. |
| `persistReview` bare-APPROVE-with-findings guard (dde40af, external.md 1) | A bare APPROVE carrying findings is persisted as clean, so its findings are discarded | unit (CLI) | add | One refusal case is added to the persist-review test's `rejected` list, and the list's sanity floor moves from 7 to 8. A write that silently drops findings is a data-loss path, so it gets a case. |
| `standingPredicates` combined no-docs n/a, now derived from the composed Documentation part (dde40af, efficiency.md 2) | The derivation misses or over-reaches a Documentation entry | unit (CLI) | keep | The existing `holders(code)` equality to `idsOf('documentation')` in the sprint-020 AC-4 emit-manifest test is the same property. The derivation replaced a hand list with the same members, so the assertion is unchanged. Proof at this HEAD: mutation R2 (`.slice(1)` on the composed part), exit 1, `with no documentation file in scope every Documentation entry - and nothing else - must carry "n/a: no documentation file in scope" …`. Mutation R3 (combined-only guard dropped) fails 5 tests, first `emit-manifest` throwing `combined manifest composes no documentation rubric`. |
| `loadWorkflow`/`reviewerKeys` `dir` parameter dropped (dde40af, efficiency.md 1) | — | — | none | Behaviour is unchanged: no caller passed `dir`, and every test that loads a definition goes through `readWorkflowDefinitions()` → `runtime.loadWorkflow(name)` and is green at this HEAD. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

None in entry 2.

## Added tests

| Test | Regression proof |
|---|---|
| sprint-020 AC-6: the workflow is a hard, never-defaulted choice … (extended: resume-flow collapse clauses; sweep widened, testing.md 1, 5) | Fail-first for correctness.md 1: mutation F1a restores SKILL.md:44-45 to their 1a1a983~1 text. Exit 1 (242/246), first failure `AC-6: sprint-lifecycle.md "Workflows" derives the design-block collapse from phases, so each asd-sprint resume-flow collapse clause must name exactly the workflows whose chain holds design (standard) … Clause: Re-run options offer only phases …`. F1b unscopes only the resume clause, which proves the loop reaches the second site: exit 1, same message, `Clause: *resume* re-enters \`phase\`, except …`. F5a adds "run by default" to the README `standard` bullet and F5b adds "(default;": each exits 1 (245/246) with `… no sentence quoting a workflow may call it a default … Found: README.md:132`. The old `\bthe default\b` pattern passes both. The other 3 FAIL lines in each SKILL.md run are noise: `canon_hashes`, `upstream_hashes` and `sync --check`. |
| AC-8/G-11, sprint-020 AC-7: the ordered chain mirrors match their definitions … (extended: acting-site predecessors, testing.md 2) | Three mutations, each exit 1 (244/246), each firing `asd-phase-<phase>.md emits the ABORT for a missing predecessor, so its state.json.phase check must bind lite to <pred> …`. F2a: plan `` `audit` (`lite`) `` → `` `design-promote` (`lite`) ``. F2b: design-promote step 1 `advanced from \`impl-review\`` → `` `design-review` ``. F2c: retro `` `design-promote` (`lite`) `` → `` `impl-review` (`lite`) ``. |
| sprint-020 AC-1/AC-6: SessionStart takes its chain from the frozen workflow definition … (case replaced, testing.md 3) | Mutation F3 reduces the guard to `typeof name !== 'string'`. Exit 1 (243/246), first failure the test's deepStrictEqual (`sprint-lifecycle.md "Workflows": the hook resolves .asd/workflows/<state.workflow \|\| standard>.json …`), because the `'../workflows/lite'` case prints `plan`. The ledger and `sync --check` lines are noise. |
| sprint-020 AC-3: every agent reading acceptance criteria from docs/product/requirements/ cites sprint-lifecycle.md "Workflows" … (new, testing.md 4) | Fail-first for correctness.md 2: mutation F4 restores asd-tester.md:40 to its 87860ea~1 text. Exit 1 (242/246), `… every Inputs line reading ACs from docs/product/requirements/ must cite it … Uncited: asd-tester.md`. |
| sprint-012 AC-2/AC-4/AC-12: both review workflows emit manifests … (extended: External skip through persist-review, testing.md 6) | Fail-first for correctness.md 3: each d3bcb59 hunk is reverted on its own, and each run exits 1 (244/246). F6a (Persistence skip sentence removed): `sprint-020 AC-9: "Coverage ledger" Persistence must bring External Review's availability skip …`. F6b (external-review.md bullet pre-fix): `sprint-020 AC-9: external-review.md "Detection and negative cache" … must route that write through persist-review …`. F6c (impl-review step 8 pre-fix): `.asd/workflows/asd-phase-impl-review.md: sprint-020 AC-9 - the step recording External Review's availability skip must persist its external.md through persist-review …`. F6d (design-review step 9 pre-fix): the same message for `asd-phase-design-review.md`, reached because impl-review passes first. |
| sprint-020 AC-9: persist-review validates a returned review … (case added: bare APPROVE with findings) | Fail-first for external.md 1: mutation R1 removes the `APPROVE verdict lists findings` guard. Exit 1 (244/246), `persist-review must refuse a bare APPROVE listing findings, which would persist them as a clean verdict (got: {"status":0,"result":{"token":"APPROVE","findings":[{"id":"1",…}]}})`. |

None in entry 2: the delta changes no behaviour that an existing test does not already guard (see the rows above).

## Suite run

- Command: `node tests/run.js`
- Scope: full (safety valve: shared infrastructure)
- Result: pass — 245/245 passed, 0 failed, 0 skipped (exit 0). This is entry 2's gate. Entry 1's red run (243/245, D-1/D-2) is superseded.
- Lint / build: pass — `git diff --cached --check` exit 0, run on this entry's staged commit; `node .asd/sync.js --check` exit 0, `ok: true`, 74/74 items current
- HEAD: 7ab8347

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/rules/sprint-lifecycle.md | AssertionError [ERR_ASSERTION]: sprint 020 moved the chain into .asd/workflows/<name>.json and the reset phases into each definition's rollback_reset, so a line still naming PHASE_CHAIN or the rollback-reset table points a reader at something that no longer exists (CHANGELOG.md and .asd/project/decisions-log.md are history and stay out of the sweep). Found: .asd/rules/sprint-lifecycle.md:96 | sprint-020 AC-1: no canon, README, AGENTS.md or agent-memory line still names a mechanism the workflow definitions replaced - the PHASE_CHAIN literal or the rollback-reset table | fixed | 52c72ed |
| D-2 | 1 | README.md | AssertionError [ERR_ASSERTION]: AC-6: the user always chooses the workflow and no config default exists, so no line may call a workflow "the default" - an absent state field reading standard is legacy handling, not a default a user can rely on. Found: README.md:132 | sprint-020 AC-6: the workflow is a hard, never-defaulted choice asked only at scope step 1, frozen through the t_state.json seed and gated in checkpoints.md, held by no config key, and no doc calls a workflow the default | fixed | 3550328 |
