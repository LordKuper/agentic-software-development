---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 027-staged-design-retro-intake

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 |  | full change surface (`git diff main...HEAD`, 43 files, Tasks 1-6) |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Pre-strategy impacted run (`tests/run.js` is shared infrastructure, so the full suite) | canon wording the plan replaced (D1, D7, D8, D10) left 5 pins red | component/contract (existing) | keep, retarget | 291/296 at entry; the 5 red tests asserted superseded text: memory `D-N` route and Status flip, impl step 3 memory routing, first-match `Status` lookup, "without asking"/"undecided → deferred", placeholder findings row. Retargeted to the new canon in place, none reverted |
| Staged design: `sprint-lifecycle.md` "Staged solution design", scope step 2, approach-choice gate, `asd-ba` scope mode, `research` input key (AC-3, AC-4, AC-5) | gate or stage dropped or reordered after `AC-N`; BA dispatch without a mode; later phase misses `research.md` | static contract | add | one test over the home's stage tokens, the step-2 gate tag against the checkpoints inventory row, Dispatch and `Inputs` modes, the three reader workflows, and the re-entry evidence names against the template |
| `t_research.md` (AC-5) | section rename breaks scope re-entry and readers | static contract | add | headings, source field, Recommended/Chosen lines, offline skip line equal to the home's, artifact-layout map |
| Retro intake explicit choice (AC-1, AC-2, D1) | row disposed by default; gate accepted with a row lacking a choice | static contract | keep, retarget, extend | sprint-019 intake test now pins `closed` shown with evidence, "none by default", `deferred` offered again; extended with the step 4 block, the inventory row and the backlog template line |
| `providers.md` route-task keys (AC-7, D7) | key or enum drifts from `routeTask`; stdin form unusable | component/contract | add | keys and `kind` enum derived from `routeTask` source, `--input -` run once, impl step 5a cites instead of restating |
| `--filter` (AC-9, D9; Task 5 commit 131c046a) | fragment treated as regex, zero or empty match green | component (spawn of the runner) | add | substring match, matched count, zero and empty exit 1; `code-style.md` §17 names the flag |
| In-phase memory-fix (AC-10, D10) | a memory hit left with no acting site, or routed through `D-N` | static contract | add, retarget | acting phases derived from the home's phase list and compared with the workflows that cite it; never-`D-N` at impl-test 7a, impl-review step 9, tester; `memory-fix` resolved kind. sprint-019 AC-14/16 and AC-13b retargeted: impl review-fix/test-fix carry no memory branch, impl step 7 carries the `memory-check` clause |
| Empty findings table (AC-8, D8) | template re-teaches the placeholder row; parser drops legacy tolerance | component | keep, retarget | sprint-021 F-4/F-5 asserts header+separator parses to `[]`, no comment row, legacy `—` row still `[]`; persist-review fixtures drop the placeholder |
| Phase-workflow byte cap removal (D6, Task 5) | n/a | none | none | assertion deleted by the plan's user decision; the skills cap and D13 load ceilings still run |
| README mirrors (Task 6) | mirror drift | static contract | none | already covered by the existing §16 README/phase-chain checks, green |
| Removed terms (sprint removes mechanisms) | superseded rule survives as current text | static contract | add | leftover-term check over canon, README, AGENTS.md, templates, runtime, hooks, workflow definitions and agent memory, exact removed sentences; scope Owner line pinned apart |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no test removed; superseded asserts were replaced inside their tests | yes |

## Added tests

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-027 AC-3/AC-4/AC-5 (D2-D4) staged design | mutation (scope step 2 loses `[GATE hard: approach choice]`): `node tests/run.js --filter "sprint-027 AC-3/AC-4/AC-5"` → exit 1, FAIL "sprint-027 AC-3/AC-4/AC-5 (D2-D4)", matched 1/302; control (rewords "fixes the file with its own write tool" in review-policy.md, tokens kept): `--filter "sprint-019 AC-14/AC-16"` → exit 0, matched 1/302; runs: 2 |
| tests/run.js: sprint-027 AC-5 (D4/D5) t_research.md | mutation (`## Approaches` → `## Options`): `--filter "sprint-027 AC-5 (D4/D5)"` → exit 1, FAIL "sprint-027 AC-5 (D4/D5)", matched 1/302; runs: 1 |
| tests/run.js: sprint-027 AC-7 (D7) route-task keys | mutation (`kind` enum removed from providers.md): `--filter "sprint-027 AC-7"` → exit 1, FAIL "sprint-027 AC-7 (D7)", matched 1/302; runs: 1 |
| tests/run.js: sprint-027 AC-9 (D9) runner `--filter` | mutation (zero-match exit check removed from `runAll`): `--filter "sprint-027 AC-9"` → exit 1, FAIL "sprint-027 AC-9 (D9)", matched 1/302; runs: 1 |
| tests/run.js: sprint-027 AC-10 (D10) memory-fix acting sites | mutation (design-review step 9 loses its "Memory-fix dispatch" citation): `--filter "sprint-027 AC-10"` → exit 1, FAIL "sprint-027 AC-10 (D10)", matched 1/302; runs: 1 |
| tests/run.js: sprint-027 leftover-term check | mutation (`undecided → \`deferred\`` added to checkpoints.md): `--filter "sprint-027 leftover-term"` → exit 1, FAIL "sprint-027 leftover-term check", matched 1/302; runs: 1 |
| tests/run.js: retargeted pins, superseded text restored as the mutation | sprint-019 intake test: "written `closed` without asking" restored → exit 1, FAIL "sprint-019 AC-1/AC-3/AC-4/AC-5/AC-6, sprint-023 AC-8", 1/302; step 4 block clause removed → same exit and test; runs: 2. sprint-019 AC-14/AC-16: "never through a test-fix `D-N`" clause replaced by the old `D-N` route → exit 1, FAIL "sprint-019 AC-14/AC-16", 1/302; runs: 1. AC-13b: impl review-fix memory routing restored → exit 1; `memory-check` clause removed from step 7 → exit 1; FAIL "AC-13b/sprint-010 AC-3/sprint-019 AC-14", 1/302 each; runs: 2. sprint-014 AC-2: test-fix "set the defect row `Status` to `fixed`" clause removed → exit 1, FAIL "sprint-014 AC-2", 1/302; runs: 1. sprint-021 F-4/F-5: placeholder comment row restored in t_review.md → exit 1, FAIL "sprint-021 F-4/F-5, sprint-027 D8", 1/302; runs: 1 |

All mutations ran through the filter only and were restored in the same command; `git status` showed only `tests/run.js` modified afterwards.

## Suite run

- Command: `node tests/run.js` (full suite: `tests/run.js` is the shared-infrastructure file, so the safety valve degrades the impacted set to everything)
- Scope: full
- Result: pass — 302/302 passed, exit 0 (entry started at 291/296)
- Lint / build: pass — `git diff --cached --check` clean; `node .asd/sync.js --check` exit 0, `ok: true`
- HEAD: 0d6bfe1b0f0dbb33812a658f24aa7a35c964e050

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
