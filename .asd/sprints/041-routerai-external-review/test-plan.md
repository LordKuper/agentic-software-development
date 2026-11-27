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
| 2 | | delta since entry 1 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| D-1 README agent roster | A numeric or word-form count disagrees with the actual roster | README template contract | keep | Existing check validates all README count sites. Add the missing `Nine` fixture and retain every assertion. |
| D-2 researcher context ceilings | A fresh seed lacks a required key or silently changes existing values | Context CLI contract | keep | Existing checks cover key membership and value preservation. Compare key membership without imposing an order on JSON object properties. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|

## Suite run

Entry 1 post-authoring evidence: 295/297 (exit 1) at `f7970f63bf4ac9d8c39281a26053c071c0a0d8a4`. D-1 and D-2 were routed from that result. The first entry's test decisions and regression proof are in `test-plan.entry-01.md`.

Entry 2 pre-strategy: 247/249 (exit 1) at `d230fa29a62f162d7beba786e82da592b09e977d`. The roster test omitted the valid word `Nine`, and the ceiling test treated JSON property order as membership. Both test defects are repaired. Isolated runner read mutations changed `Nine` to `Eight` and removed `asd-researcher@scope`. The original filtered roster and context checks each matched one test and failed with exit 1. Proof logs end in `proof-roster.runner.log` and `proof-ceilings.runner.log` in `.asd/tmp/`.

- Command: `node tests/run.js contract-agents contract-rules contract-templates contract-workflows runtime-review runtime-routing runtime-timing runtime-tools sync-render`
- Scope: impacted
- Scope evidence: README contract readers and context-ceiling checks cover the delta. Changes are bounded to roster documentation, researcher keys and two existing assertions. Runtime and runner setup are unchanged in this entry.
- Result: pass — 249/249, runner exit 0
- Lint / build: pass
- HEAD: 92994e99604ffd26524841d380e8a953ff8b4033
- Runner log: `.asd/tmp/041-routerai-external-review-impl-test-entry-2-suite-impl-test#2-post-repair.runner.log`

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | `README.md` | `AssertionError [ERR_ASSERTION]: README.md must state "dispatches N specialized agents"` | `README.md agent-count claims match the actual .asd/agents/*.md file count` | fixed | ea193353 |
| D-2 | 1 | `.asd/project/context-ceilings.json` | `AssertionError [ERR_ASSERTION]: the committed ceilings cover exactly the role-phase pairs and project rule files a fresh seed derives - a role or phase added without a ceiling fails here` | `sprint-037 AC-1: context-check exits 0 over the committed ceilings, exits 1 naming the one bundle whose ceiling a seeded edit lowered below its size, and --seed --bundles writes a ceiling for the same role-phase keys the committed file holds, which a clean check then passes` | fixed | 8d6a0839 |
