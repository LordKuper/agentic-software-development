---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 024-opus-tiers-routing

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | | full change surface (`git diff main...HEAD`, sprint/project/generated paths excluded) |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-1 opus tiers (4 agents, README rows, manifest hashes, providers.md/README variant sentences) | rendered tier and README or the family list drift | static/arch | none | the sprint-022/023 tier test already compares README rows, the per-provider family list and both variant sentences' word sets to the rendered tiers; opus now rendered, so a missing row or family fails it. No gap |
| AC-2 Material risk criteria (`sprint-lifecycle.md` "Plan file format", providers.md citation, plan step, t_plan.md) | a reserved class loses its definition, or the rule is uncited | static/arch | add | one content-contract test pins each reserved name's definition and the two citations; the criteria's wording is judgment and stays unpinned; t_plan.md placeholders are prose |
| AC-3 derived dispatch routes on its own declaration; suite never critical | inheritance wording returns, or a suite run routes critical | static/arch | keep + adjust, add | sprint-023 AC-9 test repointed to the own-declaration rule; the suite-never-critical sentence pinned in the new test |
| AC-4 retro intake presentation, scope step 4 citation | the gate asks for a disposition on a bare row id | static/arch | add | token pins (root cause, proposed edits, consequences, Expected saving) and the step 4 citation; the sprint-019 intake test's sentence regexes still pass (run) |
| AC-5 `.gitattributes` `-whitespace`, code-style §19 | review diffs flag the staged lint, or the attribute leaks to other files | component | add | `git check-attr` behaviour (review diff unset, README unspecified) plus the literal line and the §19 clause; the runner already shells out to git |
| AC-6 Scope amendment ordering, impl citations | the amendment is lost or a ticked Task re-dispatched | static/arch | add | pins `review_fixes_pending` in "Scope amendment" and its citation in impl step 5 and the review-fix bullet; the existing step-3 amendment test stays green |
| AC-7 per-entry fail-first bound | bound unrecorded or reverted | static/arch | keep + adjust | sprint-023 AC-6 test retitled and pinned on the `runs: <n>` literal |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no test pins the deleted per-relation or inherited-risk wording beyond the two adjusted below; the "entry 1 and the first terminal run: every Task's" clause has no pin | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-024 AC-2/AC-3/AC-4/AC-5/AC-6 | mutation per assert, each `node tests/run.js` → exit 1, this test failing (A1 reserved definition, A2 plan citation, A3 suite never critical, A4 retro intake "proposed edits", A5 scope step 4 citation, A6 gitattributes line, A7 `README.md -whitespace` leak via check-attr, A8 code-style §19 clause, A9 `review_fixes_pending` in amendment, A10 impl citation); reword control (`is only ever named when`) stays green; runs: 11 |
| tests/run.js: sprint-023 AC-6, sprint-024 AC-7 (adjusted) | mutation `runs: <n>` → `a count` in code-style §17: `node tests/run.js` → exit 1, this test failing; runs: 1 |
| tests/run.js: sprint-023 AC-9 (adjusted, message and title only) | n/a — no assert added; wording repointed to the own-declaration rule |

Every canon mutation also fails the unrelated `release-manifest.json: every upstream_hashes entry` test (hash of the mutated file); that is incidental, not evidence. Each mutation was restored before the next run.

## Suite run

- Command: `node tests/run.js`
- Scope: impacted (the whole runner; every content contract of this repo lives in it)
- Result: pass — 273 passed, 0 failed, 0 skipped (exit 0; pre-run 272/272 before additions)
- Lint / build: pass — `node .asd/sync.js --check` exit 0; `git diff --cached --check` run in the commit
- HEAD: 0790022

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
