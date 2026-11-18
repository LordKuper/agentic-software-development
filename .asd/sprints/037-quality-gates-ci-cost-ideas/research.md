---
responsibility:
  owns: staged-design research for sprint scope (functional requirements, best-practice findings with sources, conceptual approaches and the chosen one)
  excludes: acceptance criteria, technical design, plan, code
  delegates_to: sprint.md (AC-N), design/ docs or plan.md (technical detail), decisions-log.md (decisions)
---

# Research

## Requirements
- Raw scope: analyse https://github.com/mokevnin/dev-quality-gates and https://vincent.build/openclaw-ci-cost-reduction/ and find what is applicable and useful for ASD; read the practices as principles that transfer beyond CI, not as "put it into CI".
- Problem: ASD spends agent time and tokens the way a CI fleet spends runner-hours; both sources describe levers ASD has not been checked against.
- Actors: the main orchestrator and dispatched agents (who pay the cost), the framework maintainer, consumer projects running ASD.
- Functional requirements: each transferable practice is classified as already covered (with its rule home), a gap (with evidence from this repo), or not applicable; gaps become adoption candidates.
- Constraints: every change must minimise runtime tokens (`artifact-layout.md` "Documentation economy"); the repo stays zero-dependency; no CI-literal adoption.
- Success criteria: the maintainer picks candidates from an evidence-backed list; the picked ones become `AC-N`.
- Added at the scope gate (user): (1) scope considers every open PR and takes a decision on each; (2) a procedure that lightens the test suite — a revision of tests for real necessity, and speed-ups such as shared steps run once; (3) unnecessary tests must not enter the project at all.
- Constraint added at the scope gate (user): everything this sprint delivers works in ASD consumer projects, not only in this repo.

## Findings
Sources: [DQG] https://github.com/mokevnin/dev-quality-gates (README, `docs/adopt.md`, `docs/patterns.md`, `CONTRIBUTING.md`); [OC] https://vincent.build/openclaw-ci-cost-reduction/. Repo evidence measured at `4ee1b611`.

Already covered (no action):
- Checks at the right stage, full suite not repeated [OC §2] — build+lint at `impl`, impacted set at `impl-test`, one full suite at the end of `impl-review`, reuse keyed on `HEAD` (`sprint-lifecycle.md` "Impacted test set").
- Test the change, widen on uncertainty [OC §4] — "Impacted test set" with its safety valve and the `test_affected` override.
- Every test earns its place, deletion is a deliverable, fail-first proof [OC §1; DQG adopt step 6] — `code-style.md` §17, tester prune pass.
- Do not pay for the same review twice [OC §3] — APPROVE latch, incremental ranges, severity floors (`review-policy.md`).
- Generated-code gate, cheap failures before the expensive step [DQG patterns; OC §5] — `sync.js --check` as build, `commit-check`, the impl build+lint gate.
- Two clocks, measure before claiming [OC "Did the cheaper factory also get faster?"] — timing ledger and `timing-summary` (time only; see gap G2).

Gaps:
- G1 Test growth has no measured pressure [OC §1 "Set a limit on test-code growth"]. §17 states the criterion in prose only. Sprint 036: `tests/run.js` +905/−65 lines, 60% of the 1498 inserted non-sprint lines; the file is 11 555 lines, 430 tests.
- G2 Fixed setup per dispatch is unmeasured and unbounded [OC §6 "a smaller run should need less setup", §1 ratchet]. Context bundle per dispatch: dev 90 KB, combined reviewer 99 KB (impl-review), tester 77-82 KB, external 95 KB, whatever the task size. Sprint 036 ran 49 dispatches. No test bounds bundle growth; the ledger records seconds, not bytes.
- G3 No rule forbids weakening a check to pass [DQG patterns "Exceptions", "Rules for AI agents"]. No canon file mentions suppressions (grep over `.asd/rules`, `.asd/agents`, `.asd/workflows`: 0 hits). `stubs.md` `(accepted-debt)` entries carry no review date [DQG "Review dates on exceptions"].
- G4 Retro remediation has no mechanical-check home for a consumer [DQG "An instruction without a check is advice"]. `asd-phase-retro.md` step 4 Draft lists prose homes only (custom rules, reliability checklist, agent memory, rule doc).
- G5 A red terminal full suite after a green impacted run is not classified [OC "shadow mode", "backtest the selector"]. A test outside the impacted set failing there is a selection miss; nothing records it, so the selection rule is never tuned.
- G6 Deterministic gates in a consumer project are not bootstrapped [DQG `adopt.md`: plan first, baseline, prove each check can fail, one aggregate command]. `asd-init` detects existing commands only; where none exist, reviewers carry lint-class findings at reviewer-model cost on every iteration.
- G7 Concurrent heavy commands [DQG "Several agents on one machine"]. A wave dispatches devs concurrently in one worktree, each running build, lint and impacted tests; no slot or lock. Free here (`sync.js --check`), unverified for a heavy consumer build.
- G8 Agent-config lint [DQG "Agent configuration": agnix]. Generated views for two providers are checked only by `tests/run.js` content contracts; a one-off agnix run would show what those miss. Requires an external binary.

Test suite, measured at `04dcbe0f` (strands 2 and 3 of the gate additions; source [OC] §1, §4, §6):
- T1 Admission is prose only and does not hold. §17's hypothetical-risk criterion and the Efficiency "Test-suite cost" rubric both exist, yet sprint 036's nine `impl-test` entries record 60 added-test rows against 2 removals, and 40 tests carry its tag (earlier sprints: 1-19). Fail-first proves the new test fails on the defect; nothing proves the existing tests do not already catch it.
- T2 Additions follow review rounds: entry 3 alone added 20 tests after the first review iteration. §17 gives every fixed defect a regression test with no carve-out for a prose or document fix; 109 of 430 tests read documents only.
- T3 Time is concentrated: a full run takes 59 s; the 10 slowest tests take 45% of it, the 50 slowest 87%, and 317 tests run under 20 ms. The slow ones build git fixtures or spawn processes (21 and 37 tests). The runner reports no durations, so nothing shows this.
- T4 Selection is nominal here: all tests sit in one 11 555-line file with no native selector, so every impacted run degrades to the full suite (`test-plan.md` of sprint 036: "Scope: full — one file with no native selector").
- T5 No procedure revises tests outside a sprint's change surface: the prune pass is delta-scoped, cleanup never touches tests.

Open PRs (strand 1): scope step 2a triages open issues but never lists open PRs; none is open now.

Not applicable: per-language tool lists (stack-specific, belongs to a consumer via `/asd-stack`), runner sizing and pricing, sharding and shard balancing, blobless checkouts, learned test selection, dependency-update cooldown.

Workflow defect found during intake (not from the sources): `retro-candidates` exits 2 on sprint 036's retrospective, whose Systemic proposals section holds a "None." paragraph and no table (`friction-log.md` F-1).

## Approaches
- **A — measure and guard**: G1, G2 (bundle-size ratchet in `tests/run.js`, bundle bytes in the timing ledger, test-line delta reported per sprint), G3, G4, G5; pros: small canon and `runtime.js` edits, each backed by a check, fits `lite`; cons: measures setup cost without yet reducing it.
- **B — A plus consumer bootstrap**: adds G6 and G7; pros: moves lint-class work off reviewer models, the largest consumer-side saving; cons: touches `asd-init`, `commands.yaml` schema and dispatch concurrency, independent contracts in one sprint.
- **C — cost levers only**: G1 and G2; pros: smallest; cons: leaves the enforcement gaps G3-G5 open.
- Recommended: A — every item is cheap and verifiable; G6 and G7 are independent contracts better scoped as their own sprint once G2's measurements exist; G8 as an optional one-off audit.
- Chosen: B without G7, plus G8 and the F-1 fix — user answer "everything except G7" (stage (c)). Refinement: requirements stand as written; G7 is out of scope.
