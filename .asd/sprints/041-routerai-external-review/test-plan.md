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
| 3 | | delta since entry 2 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Review fix 1, AC-11 timing context | A retry silently drops context bytes or double-counts the shared bundle | Timing CLI contract | keep | The prior review-fix pass already extended the owning wave test. It supplies the same real context file to two dispatch IDs, checks one byte contribution and confirms both outcomes. The seeded regression fails in entry 02 evidence. |
| Review fix 2, AC-9/AC-15 terminal Git guard | The expected SHA is accepted for a different worktree | Git CLI boundary contract | keep | The review-fix test verifies the same SHA under a valid Git directory and a wrong worktree. The runtime guard must reject it. Keep the existing invalid-directory and normal controls. |
| Review fix 3, AC-1/AC-8/AC-14 external-review wrapper | Wrong provider flags or shell, retried hold or dropped scope | Actual wrapper dispatch against local CLI fixtures | keep | Both controlled dispatches and JSON skip persistence were verified during review-fix. Their evidence is recorded in entry 02. This re-entry adds no wrapper behavior. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|

## Suite run

- Command: `node tests/run.js contract-agents contract-rules contract-templates contract-workflows runtime-review runtime-routing runtime-timing runtime-tools sync-cli sync-render update`
- Scope: impacted
- Scope evidence: the delta from `1b1e8fd2` changes runtime timing context lookup, terminal Git-root checks, their workflow consumers, tests and documentation. The runner and common test setup did not change. The selected areas cover all named consumers and preserve the sprint-wide impacted set without requiring the full suite.
- Result: pass — 297/297, runner exit 0. Reuse the entry 3 pre-strategy run for the impacted gate at the same checked code and test revision. This entry changes only the test-plan narrative.
- Lint / build: pass
- HEAD: a6148e3c90d789ddd294cf24367a350b50e9852e
- Runner log: `.asd/tmp/041-routerai-external-review-impl-test-entry-3-suite-impl-test#3-pre-strategy.runner.log`

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
