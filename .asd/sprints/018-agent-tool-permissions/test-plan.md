---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 018-agent-tool-permissions

## Entry log

Appended each entry, never rewritten. `HEAD analysed` is the commit the strategy/prune passes
were scoped through; the next re-entry's delta is `git diff <this sha>...HEAD`.

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 6c9d8d7 | full change surface |
| 2 | 67cc9a8 | delta since entry 1 |
| 3 | | delta since entry 2 |

## Risk → check decisions

Entry 3 (delta since entry 2: `git diff 67cc9a8...HEAD`, the review-fix wave-1/iter-01 round). Impacted set: the **full suite**. The safety valve fires because the delta touches `sync.js`, `review-policy.md`, `sprint-lifecycle.md` and `release-manifest.json`. Most of the delta is already pinned by bd266c7: stalemate options, UX allowlist and the providers carve-out (rotated `test-plan.entry-02.md`).

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `review-policy.md` "Reviewer question carrier": an open question means at least `CONCERNS` (4afdbb4) | a reviewer with an open question returns `APPROVE`, gets latched, and the question never reaches a fix route. The rule states this failure mode itself, and nothing pinned the sentence | static | add (carriers test) | Some sentence of the carrier paragraph must hold `CONCERNS`, `APPROVE` and `never` together, checked per token so it is not a phrase pin (rewording R4 stays green). The workflows' "(such a report is at least CONCERNS, per that carrier)" is a pointer back to this home, so it is not pinned separately |
| `sprint-lifecycle.md` ADVICE_NEEDED steps 4/6 reviewer carve-out (5746479) | a reviewer whose advisor consult ends in gate uncertainty returns a bare `QUESTION`, read as an interrupted dispatch. This is the D-1 class a second time | static | add (carriers test, sweep) | Every `.asd/rules/*.md` line where an agent "returns `QUESTION`" must carve out the reviewer to its carrier on the same line. Scoped to rule docs because they apply to every role; workflow and agent lines are role-specific (for example the UX token `QUESTION` in `asd-phase-design.md`). This covers core.md, providers.md and ADVICE steps 4/6 today, and any new generic line automatically |
| `sync.js` in-body comment removed (682f4f7) | none — comment-only | — | none | No behaviour changed. The `web_search` validation and render tests (rotated `test-plan.entry-01.md`) pass unchanged |
| BA/UX/Architect web search scope, README, dev memory (d802f2c, f590a76) | a web grant loses its scoped policy line | static | keep | The entry-1 grants test still requires a web/URL policy bullet on every web-granted agent. README is prose owned by the documentation reviewer (entry-1 `none`). Agent memory is not canon |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

Mutations were run with `MUT=./mut3.js node <scratchpad>/mutate.js`: one anchor-exact edit or a `git show <sha>~1` revert, restored in `finally` with a byte compare. `upstream_hashes` noise is not listed.

| Test | Regression proof |
|---|---|
| tests/run.js:`sprint-018 AC-4/AC-5/AC-7: a reviewer's question and External Review's stalemate …` (at-least-CONCERNS assert) | C1: the carrier's CONCERNS sentence deleted → exit 1, "AC-4: a reviewer holding an open question returns at least CONCERNS, never APPROVE". Rewording R4 ("keeps a reviewer's verdict at `CONCERNS` or worse - it may never be `APPROVE`") → only `upstream_hashes` failed; this test stayed green |
| tests/run.js:`sprint-018 AC-4/AC-5/AC-7: a reviewer's question and External Review's stalemate …` (generic returns-QUESTION sweep) | C2: `sprint-lifecycle.md` reverted to `5746479~1` (the fix commit) → exit 1, "AC-4/AC-5: a rule line telling any agent to return QUESTION reaches reviewers too, so it must carve them out to their carrier on the same line"; C3: only step 6's carve-out removed (a later line than step 4) → exit 1, same message |

## Suite run

- Command: `node tests/run.js`
- Scope: impacted = full (safety valve: the delta touches `sync.js`, `review-policy.md`, `sprint-lifecycle.md` and `release-manifest.json`)
- Result: pass — 228/228 passed, 0 failed, 0 skipped (exit 0), both at the pre-strategy run (step 3, before the two new assertions) and at the suite gate (step 8, with them). The count is unchanged because the assertions went into an existing test
- Lint / build: pass — `git diff --check` exit 0; `node .asd/sync.js --check` exit 0, `"ok": true`
- HEAD: 802cf24, worktree carrying this entry's uncommitted `tests/run.js` assertions; they land in the commit that records this run

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/rules/providers.md | AssertionError [ERR_ASSERTION]: AC-4/AC-5: the out-of-policy refusal must route a reviewer through its question carrier - "an agent ... returns `QUESTION`" alone makes a reviewer return a bare QUESTION, which reads as an interrupted dispatch | sprint-018 AC-4/AC-5/AC-7: a reviewer's question and External Review's stalemate ride the verdict-bearing report - one carrier form across template, rule, agents and both review workflows - and impl-review collects manual-verification results before dispatching the testing reviewer | fixed | 0533ef8 |
| D-2 | 1 | .asd/workflows/asd-phase-audit.md | AssertionError [ERR_ASSERTION]: AC-7: every workflow dispatching a role that can return QUESTION must cite the QUESTION protocol, or that question has no handling path in the phase | sprint-018 AC-4/AC-5/AC-7: only the main orchestrator prompts the user - core.md says so, the QUESTION protocol carries every dispatched question, every creator/dev/tester-dispatching workflow cites it, and no agent body, skill or design step hands user contact to a dispatched agent | fixed | 4df9bf4 |
