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
| 3 | ac5fb97c | delta since entry 2 |

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

- Command: `node tests/run.js`
- Scope: full
- Scope evidence: the unscoped configured command ran all tests without a name filter.
- Result: pass — 331/331, runner exit 0.
- Lint / build: pass — `git diff --cached --check` and `node .asd/sync.js --check` exited 0.
- Slowest tests: 1,350 ms — sprint-023 AC-2: `git-strategy.md` Branch brings a base branch up to origin and refuses a diverged one; 1,111 ms — sprint-036 AC-14: `agent-liveness --returns` classifies valid and invalid returns; 1,054 ms — sprint-021 AC-7: `agentLiveness` classifies transcripts and reports stalls; 999 ms — sprint-019 AC-8: named-path commit form commits only its paths and resets them after a failed check; 799 ms — sprint-017 AC-8, sprint-038 AC-20: `draft-snapshot` and `emit-manifest` patch against prior snapshot; 762 ms — Sprint 038 AC-1/AC-2, sprint-040 AC-1: `config-check` validates values and names invalid keys; 742 ms — sprint-027 AC-9: runner filters and area selection validate matches; 724 ms — sprint-017 AC-4/AC-8: `emit-manifest` joins full files and writes external scope; 722 ms — sprint-020 AC-9: `persist-review` validates and writes a review atomically; 694 ms — sprint-033 AC-12/AC-21: `commit-check` enforces the named-path commit contract.
- HEAD: 385a0f33d64874f7085206a007922ec4643a2971
- Line delta: tests +139/−28 (net 111); other +312/−135 (net 177)

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
