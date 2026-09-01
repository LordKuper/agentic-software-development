---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests
  excludes: task breakdown, requirements, review verdicts, code
  delegates_to: plan.md (tasks), docs/ docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint {{SPRINT_ID}}

<!--
Written in impl-test, after the implementation exists. Rewritten on each impl-test entry;
Defects rows persist (resolved ones kept for the record).
Rules: .asd/rules/sprint-lifecycle.md (impl-test phase), .asd/rules/code-style.md §17.
-->

## Change surface
{{files/behaviours changed this sprint, from the diff; one line each}}

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| {{file or behaviour}} | {{what can break}} | {{static/arch \| unit/property \| component/contract \| e2e}} | {{add \| keep \| none}} | {{why this is the cheapest reliable check; for `none`: no behaviour added, or which existing check covers it}} |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| {{file:name}} | {{trivial \| duplicate of <test> \| mock-confirming \| implementation-coupled \| flaky}} | {{yes \| no — user approved <date>}} |

## Added tests

| Test | Level | Covers | Regression proof |
|---|---|---|---|
| {{file:name}} | {{unit \| property \| component \| contract \| e2e}} | {{AC-N or risk}} | {{n/a \| fail-first vs D-N \| mutation <what was mutated>}} |

## Suite run

- Command: {{`test` from commands.yaml}}
- Result: {{pass \| fail}} — {{passed/failed/skipped counts}}
- Lint / build: {{pass \| fail}}

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode.

| ID | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|
| D-1 | {{file:line}} | {{observed wrong behaviour}} | {{test name}} | {{pending \| fixed}} | {{sha}} |

## Manual verification (optional)

Only where automation is impossible (visual UI, third-party live integration, ux feel). Spec consumed by asd-reviewer-testing.

| AC | Steps | Expected observation |
|---|---|---|
| {{AC-N}} | {{steps}} | {{expected}} |
