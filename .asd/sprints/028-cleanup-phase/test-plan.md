---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 028-cleanup-phase

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 8359218a | full change surface |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-1 workflow chain (`standard.json`, `lite.json`, chain mirrors) | cleanup absent from a chain, `next` not allowing it | contract | keep | `sprint-028 AC-1` and the §16 mirror checks (Task 12) read both definitions; nothing to add |
| AC-2/AC-4 cleanup workflow and write points | a creator dispatched; checkpoint or record line drifting between workflow, rule home and `t_decisions-log.md`, so re-entry misreads progress | contract | add | `sprint-028 AC-2/AC-4`: Owner names only the advisor, no Dispatch section, the two log-line literals and the `chore(cleanup):` subject agree across their homes |
| AC-3 reach, AC-5 verification and red handling | prose judgement rules, no machine reader | none | none | rule text with no parsed token; a pin would only lock wording, quality review judges it |
| AC-6 frozen `cleanup` flag, no-op | `{{CLEANUP}}` left unseeded so a disabled config reads enabled; no-op not recorded | contract | add | `sprint-028 AC-6/AC-20`: placeholder derived from `t_state.json`, filled by scope step 3a; no-op step and table row key on `skipped_phases` |
| AC-6/AC-20 config keys `cleanup`, `documents.design_system` in `t_config.yaml` and README schema | template and README drift | contract | keep | the existing README-mirrors-`t_config.yaml` leaf checks (sprint-013 family) derive the keys from the template |
| AC-7/AC-19 README and cross-file mirrors | stale counts, tables, roster | contract | keep | §16 chain checks and README tier-table tests, adapted in Task 12 |
| AC-8/AC-9/AC-10 retro-row clauses | clause missing from `asd-external-review.md` or Decomposition rules | contract | add | `sprint-028 AC-8/AC-9/AC-10` pins the clause tokens the ACs require |
| AC-11 roster, `sync.js` `VARIANT_SUFFIXES` | retired view survives, a variant not generated | contract | keep | `sprint-028 AC-11` (views equal canon) and the variant render tests, Task 12 |
| AC-11/AC-12 removed roles, reviewer keys, tier phrases (leftover terms) | live text still naming a removed agent, verdict token or tier | static sweep | add | `sprint-028 leftover-term check`: retired names derived from the migration constant, exact removed phrases, agent memory included (`artifact-layout.md` "Agent memory") |
| AC-13/AC-14 reviewer rosters, rubric split, `INTERNAL_REVIEWERS`, `COMBINED_RUBRICS`, `NA_TARGETS`, `reviewerFiles` | a rubric entry dropped or n/a'd wrongly, a reviewer missing a manifest | unit/contract | keep | sprint-020 AC-2/AC-4/AC-6, sprint-015 AC-2/AC-3, sprint-010 rubric-id checks derive from agents and runtime; Task 12 retargeted them |
| AC-15 models and effort | tier table drift | contract | keep | sprint-022 AC-8/AC-9 and sprint-023 AC-7 resolve the tier through the manifest |
| AC-16 `routeTask`, legacy `priorTier: critical` | critical tier surviving, change risk not forbidding mechanical | unit | keep | existing `routeTask` asserts pin `critical` to `standard` and the change-risk rule; no behaviour left unpinned |
| AC-17 escalation consult (Relay, advisor, workflows) | a user escalation asked without the advisor's recommendation | contract | add | `sprint-028 AC-17`, derived from the `[GATE hard: …]` markers of the failure/question class across all workflows; found D-1 |
| AC-18 `14.0.0.js`: view deletion | deleting a consumer's own or a live agent, partial or non-idempotent delete | unit (fixture repo) | add | `sprint-028 AC-18` views test; names derived from the migration constant, ownership marker, sibling and re-run asserted |
| AC-18 `14.0.0.js`: state rewrite | wrong `quality` verdict resumes a sprint as green or red; latch invented; wave directory misread; critical tier left | unit (fixture repo) | add | verdict/latch/tier test over every legacy combination, both review shapes |
| AC-18 `14.0.0.js`: persistence | data loss on a live state file | unit (fixture repo) | add | CRLF, atomic rewrite, finished/archived/unparsable/migrated files untouched, no-op re-run |
| AC-20 `session-start.js` `design_system` fallback | collapse test misreads a group frozen without the key | unit (hook in temp repo) | add | `sprint-028 AC-20`: absent key follows `ux_spec`, an explicit value wins, six cases |
| Task 6 templates (`t_config.yaml`, `t_state.json`, `t_decisions-log.md`, others) | key or placeholder error | contract | keep | JSON-parse sweep, README leaf mirror and the tests above |
| Task 4/10 role-scoped context caps (D13) | context load over cap | contract | keep | sprint-026 AC-14/AC-15/AC-16 green |
| D11 rule survival (rules moved from removed agents) | a moved rule lost | none | none | relocated prose with no parsed token; quality review traces each audit "Rule survival" row |
| `asd-init` cleanup step and the standalone skills authored inline | skill prose drift | none | none | no machine reader; byte caps already pinned by sprint-026 AC-15 |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no test became obsolete: those naming removed agents, keys or tiers were retargeted by Task 12, none duplicates another | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-028 AC-18 (D13) … deletes the ASD-marked generated views | mutation ownership gate removed in `14.0.0.js` (`if (false)`): `node tests/run.js --filter "deletes the ASD-marked generated views of exactly its nine"` → exit 1, sprint-028 AC-18 (D13): the 14.0.0 migration deletes the ASD-marked generated views…; runs: 1 |
| tests/run.js: sprint-028 AC-18 (D13) … gives every review iteration of an active sprint a quality verdict | mutation `SEVERITY_ORDER` inverted: `node tests/run.js --filter "gives every review iteration"` → exit 1, sprint-028 AC-18 (D13): the 14.0.0 migration gives every review iteration…; runs: 1 |
| tests/run.js: sprint-028 AC-18 (D13) … rewrites an active state file atomically | mutation finished-sprint skip removed: `node tests/run.js --filter "rewrites an active state file atomically"` → exit 1, sprint-028 AC-18 (D13): the 14.0.0 migration rewrites an active state file atomically…; runs: 1 |
| tests/run.js: sprint-028 AC-20 (D14) SessionStart design_system fallback | mutation fallback removed in `session-start.js` (`documents[name] === false`): `node tests/run.js --filter "SessionStart reads an absent documents.design_system"` → exit 1, sprint-028 AC-20 (D14): SessionStart reads an absent documents.design_system…; runs: 1 |
| tests/run.js: sprint-028 AC-2/AC-4 (D3/D4/D7) cleanup workflow and log-line forms | mutations (checkpoint line renamed; Owner line names `asd-dev`; `chore(cleanup):` dropped from the rule home): `node tests/run.js --filter "sprint-028 AC-2/AC-4"` → exit 1 each, sprint-028 AC-2/AC-4 (D3/D4/D7): the cleanup workflow runs inline…; matched 1; runs: 3; controls: reword `this file orders the work` and scope step 3a `Seed` → `Fill` → exit 0 each |
| tests/run.js: sprint-028 AC-6/AC-20 (D6/D14) flag seeding | mutations (`{{CLEANUP}}` not filled in step 3a; no-op no longer names `skipped_phases`; `{{DOC_DESIGN_SYSTEM}}` not filled): `node tests/run.js --filter "sprint-028 AC-6"` → exit 1 each, sprint-028 AC-6/AC-20 (D6/D14): the frozen cleanup and design_system flags are seeded end to end…; matched 1; runs: 3 |
| tests/run.js: sprint-028 AC-8/AC-9/AC-10 retro-row clauses | mutations (placeholder-row wording restored in `asd-external-review.md`; multi-stage bullet removed; universal-reach bullet removed): `node tests/run.js --filter "sprint-028 AC-8/AC-9/AC-10"` → exit 1 each, sprint-028 AC-8/AC-9/AC-10: asd-external-review.md states an empty Kept findings table…; matched 1; runs: 3 |
| tests/run.js: sprint-028 AC-17 (D10) escalation consult at every escalation gate | fail-first vs D-1 at HEAD: `node tests/run.js --filter "sprint-028 AC-17"` → exit 1, sprint-028 AC-17 (D10): every workflow step holding a failure- or question-class hard gate…, impl-review steps 8 and 10 reported; runs: 1 |
| tests/run.js: sprint-028 leftover-term check | mutation `asd-architect` added to README.md line 1: `node tests/run.js --filter "sprint-028 leftover-term check"` → exit 1, sprint-028 leftover-term check: no canon, README…, hit `README.md:1 asd-architect` reported beside the three memory hits; runs: 1 |

## Suite run

- Command: `node tests/run.js` (shared infrastructure touched: canon rules, `runtime.js`, `sync.js`, `tests/run.js` — the impacted set is the full suite)
- Scope: full
- Result: fail — 311 passed / 2 failed / 0 skipped of 313 (pre-strategy run at 5b98726f: 304/304 pass); failing: `sprint-028 AC-17` (D-1) and `sprint-028 leftover-term check` (memory hits, step 7a: `.claude/agent-memory/asd-reviewer-combined/feedback_enumerated-reach-vs-trigger-sites.md`, `feedback_in-body-comment-sweep.md`, `feedback_dispatch-payload-vs-required.md`)
- Lint / build: pass — `git diff --cached --check` exit 0, `node .asd/sync.js --check` exit 0, 60 items `current`
- HEAD: a8358b2114be0069d677a4700bb48acd400935ec

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/workflows/asd-phase-impl-review.md | AssertionError [ERR_ASSERTION]: AC-17: a user escalation caused by a question or failure is preceded by an advisor recommendation (agent-protocol.md "Relay" Escalation consult); a step that asks the user without it leaves the sprint's recommendation-before-escalation contract unmet at that site | sprint-028 AC-17 (D10): every workflow step holding a failure- or question-class hard gate - reviewer question, FAIL escalation, review-cap override, stalemate - takes the escalation consult before it asks the user | fixed | 043e4301 |
