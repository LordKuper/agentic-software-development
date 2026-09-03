---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint {{SPRINT_ID}}

<!--
Written in impl-test, after the implementation exists. First entry writes this file fresh;
every re-entry AMENDS it (append/update rows) — never a full rewrite. Defects rows persist
(resolved ones kept for the record). Change surface is not restated here — it's the diff
itself (`git diff --stat`), computed by asd-phase-impl-test.md step 2 (full on entry 1, delta
since the prior entry's `HEAD analysed` on re-entry).
Rules: .asd/rules/sprint-lifecycle.md (impl-test phase), .asd/rules/code-style.md §17.
-->

## Entry log

Appended each entry, never rewritten. `HEAD analysed` is the commit the strategy/prune passes
were scoped through; the next re-entry's delta is `git diff <this sha>...HEAD`.

| Entry | HEAD analysed | Scope |
|---|---|---|
| {{N}} | {{sha}} | {{full change surface \| delta since entry N-1}} |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| {{file or behaviour}} | {{what can break}} | {{static/arch \| unit/property \| component/contract \| e2e}} | {{add \| keep \| none}} | {{why this is the cheapest reliable check; for `none`: no behaviour added, or which existing check covers it}} |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| {{file:name}} | {{trivial \| duplicate of <test> \| mock-confirming \| implementation-coupled \| flaky}} | {{yes \| no — user approved <date>}} |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path, comment) — not restated here.

| Test | Regression proof |
|---|---|
| {{file:name}} | {{n/a \| fail-first vs D-N \| mutation <what was mutated>}} |

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once every reviewer is APPROVE/latched. The `pr` gate
always reads whatever is recorded here last — the full-suite record, by the time `pr` runs.

- Command: {{`test` from commands.yaml, impacted-scoped or unscoped per Scope below}}
- Scope: {{impacted \| full}}
- Result: {{pass \| fail}} — {{passed/failed/skipped counts}}
- Lint / build: {{pass \| fail}}
- HEAD: {{sha}} — commit this run was verified at; pr phase compares current HEAD against this to decide whether to skip re-running

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
