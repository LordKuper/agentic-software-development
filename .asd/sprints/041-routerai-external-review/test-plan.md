---
responsibility:
  owns: test approach, removal reasons, suite evidence, defects and manual verification
  excludes: tasks, requirements, review verdicts, code and change surface
  delegates_to: plan.md (tasks), sprint.md (criteria), reviews/impl/ (verdicts)
---

# Test plan — sprint 041-routerai-external-review

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | c822fed5 | full change surface |
| 2 | 1b1e8fd2 | delta since entry 1 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| D-1 README agent roster | A numeric or word-form count disagrees with the actual roster | README template contract | keep | Existing check validates all README count sites. Add the missing `Nine` fixture and retain every assertion. |
| D-2 researcher context ceilings | A fresh seed lacks a required key or silently changes existing values | Context CLI contract | keep | Existing checks cover key membership and value preservation. Compare key membership without imposing an order on JSON object properties. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| `tests/contract-workflows.test.js`: standalone skill byte-cap assertion | Redundant: survivor `tests/runtime-timing.test.js: context-check exits 0 over the committed ceilings`, branch aggregate standalone skill bytes over the cap | yes — AC-13 |

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|

## Suite run

Entry 1 post-authoring evidence: 295/297 (exit 1) at `f7970f63bf4ac9d8c39281a26053c071c0a0d8a4`. D-1 and D-2 were routed from that result. The first entry's test decisions and regression proof are in `test-plan.entry-01.md`.

Entry 2 pre-strategy: 247/249 (exit 1) at `d230fa29a62f162d7beba786e82da592b09e977d`. The roster test omitted the valid word `Nine`, and the ceiling test treated JSON property order as membership. Both test defects are repaired. Isolated runner read mutations changed `Nine` to `Eight` and removed `asd-researcher@scope`. The original filtered roster and context checks each matched one test and failed with exit 1. Proof logs end in `proof-roster.runner.log` and `proof-ceilings.runner.log` in `.asd/tmp/`.

- Command: `node tests/run.js contract-agents contract-rules contract-templates contract-workflows runtime-review runtime-routing runtime-timing runtime-tools sync-cli sync-render update`
- Scope: impacted
- Scope evidence: after the suite revision, the gate retains the sprint's direct contract, routing, timing, runtime and sync consumers and the executable update cases. Since entry 1, changes are limited to README roster counts, researcher ceilings and existing test assertions. The runner and its setup are unchanged.
- Result: pass — 297/297, runner exit 0
- Lint / build: pass
- HEAD: 48cfcb9b474bdb8d54b728f32127a5f7c8470103
- Runner log: `.asd/tmp/041-routerai-external-review-impl-test-entry-2-suite-suite-impl-test#2-post-revision.runner.log`
- Line delta: tests +112/−28 (net 84); other +289/−128 (net 161)

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | `README.md` | `AssertionError [ERR_ASSERTION]: README.md must state "dispatches N specialized agents"` | `README.md agent-count claims match the actual .asd/agents/*.md file count` | fixed | ea193353 |
| D-2 | 1 | `.asd/project/context-ceilings.json` | `AssertionError [ERR_ASSERTION]: the committed ceilings cover exactly the role-phase pairs and project rule files a fresh seed derives - a role or phase added without a ceiling fails here` | `sprint-037 AC-1: context-check exits 0 over the committed ceilings, exits 1 naming the one bundle whose ceiling a seeded edit lowered below its size, and --seed --bundles writes a ceiling for the same role-phase keys the committed file holds, which a clean check then passes` | fixed | 8d6a0839 |

## Suite revision

AC-13 scope: workflow assertion redundancy and preservation of executable update cases. Measurements cover the selected areas, not the terminal full suite.

- Before: 97 tests, 2,140 lines, 4,870 ms.
- After: 97 tests, 2,138 lines, 4,851 ms. Both passes ran `node tests/run.js contract-workflows contract-agents runtime-timing update` and exited 0. Count includes tests that retained distinct assertions.

| Area | State | Tests before → after | Seeded-defect proof |
|---|---|---|---|
| Workflow assertions and their surviving owners | done | 59 → 59 | With `NODE_OPTIONS=--require=./.asd/tmp/041-routerai-external-review-suite-revision-cap.cjs`, `node tests/run.js runtime-timing --filter 'context-check exits 0 over the committed ceilings'` matched one test and exited 1. The named survivor reported the seeded `standalone-skills` overflow. The preload inflated one skill for this invocation only. Prior cleanup-edge and reviewer-roster owner mutations are recorded in `decisions-log.md` and `test-plan.entry-01.md`. |
| Executable update cases | done | 38 → 38 | All 38 update cases passed in both selected runs, including pending migration retry and managed writes. No update test was removed. |
