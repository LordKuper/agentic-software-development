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
| 3 | 0bd998c | delta since entry 2 |

## Risk → check decisions

Entry 3 (delta since entry 2: `git diff 67cc9a8...HEAD`, the review-fix wave-1/iter-01 round). Impacted set: the **full suite**. The safety valve fires because the delta touches `sync.js`, `review-policy.md`, `sprint-lifecycle.md` and `release-manifest.json`. Most of the delta is already pinned by bd266c7: stalemate options, UX allowlist and the providers carve-out (rotated `test-plan.entry-02.md`).

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `review-policy.md` "Reviewer question carrier": an open question means at least `CONCERNS` (4afdbb4) | a reviewer with an open question returns `APPROVE`, gets latched, and the question never reaches a fix route. The rule states this failure mode itself, and nothing pinned the sentence | static | add (carriers test) | Some sentence of the carrier paragraph must hold `CONCERNS`, `APPROVE` and `never` together, checked per token so it is not a phrase pin (rewording R4 stays green). The workflows' "(such a report is at least CONCERNS, per that carrier)" is a pointer back to this home, so it is not pinned separately |
| `sprint-lifecycle.md` ADVICE_NEEDED steps 4/6 reviewer carve-out (5746479) | a reviewer whose advisor consult ends in gate uncertainty returns a bare `QUESTION`, read as an interrupted dispatch. This is the D-1 class a second time | static | add (carriers test, sweep) | Every `.asd/rules/*.md` line where an agent "returns `QUESTION`" must carve out the reviewer to its carrier on the same line. Scoped to rule docs because they apply to every role; workflow and agent lines are role-specific (for example the UX token `QUESTION` in `asd-phase-design.md`). This covers core.md, providers.md and ADVICE steps 4/6 today, and any new generic line automatically |
| `sync.js` in-body comment removed (682f4f7) | none — comment-only | — | none | No behaviour changed. The `web_search` validation and render tests (rotated `test-plan.entry-01.md`) pass unchanged |
| BA/UX/Architect web search scope, README, dev memory (d802f2c, f590a76) | a web grant loses its scoped policy line | static | keep | The entry-1 grants test still requires a web/URL policy bullet on every web-granted agent. README is prose owned by the documentation reviewer (entry-1 `none`). Agent memory is not canon |
| review-fix wave-1/iter-02 `testing.md TST-2-1`: rules sweep widened beyond literal "returns `QUESTION`" (dev 3ee9f24, `core.md:47`) | the entry-3 row's "any new generic line automatically" was false: `core.md:47` routed "a dispatched agent via `QUESTION`" with no carve-out and passed. That is the D-1 class a third time | static | add (supersedes the entry-3 sweep row's claim) | The sweep now matches any `.asd/rules/*.md` line routing to `QUESTION` (`returns`/`via`/`as`). Lines that name an agent must carry the reviewer + carrier carve-out. Lines naming no agent are creator-scoped and exempt, and that exempt set is compared exactly against `['design-principles.md']`, so rewording a generic subject cannot drop a line out silently |
| review-fix wave-1/iter-02 `testing.md TST-2-2`: workflow stalemate lines (dev d12ece2) | the entry-02 `keep` said the workflows no longer restated option names while both still did; a home rename would leave stale names offered to the user with the test green | static | add (carriers test) | Each workflow stalemate line must cite the home **and** contain none of the options derived from `external-review.md` "Stalemate detection" (word match). Citation plus absence now makes the entry-02 reason true |
| review-fix wave-1/iter-02 `testing.md TST-2-3`: BA/UX/Architect search scope (dev d802f2c) | a web-granted agent whose policy scopes only URL fetch leaves web search unbounded; the old assert needed only a `web`/`URL` word | static | add (grants test) | The `<fetch> / <search> only for` structure, derived from `asd-dev`'s line and the `providers.md` op rows, now runs on every web-granted agent whose policy names the fetch op (derived set, today five) |
| round-2 canon: `answer:` line (dev 099cf64: `review-policy.md` carrier, `t_review.md`, both review workflows, `asd-phase-impl.md` step 3) | the user's answer lands only in decisions-log and the fixer never reads it: the round-2 correctness failure mode | static | add (carriers test) | Relation checks: the carrier's `answer:` form equals the `t_review.md` item shape; impl step 3 review-fix collects `answer:` lines citing the carrier; each review workflow's question bullet writes into the reviewer's file |
| round-2 canon: `designmd-install` orchestrator step (dev 9409e90: design step 8, design-promote step 4, `asd-design-system`) | UX may not run the install (pinned by TST-1-2), so a cited orchestrator site missing the step leaves DESIGN.md lint unable to run on Windows | static | add (grants test) | Derived from the citations on `asd-ux.md`'s "Never run `designmd-install`" line: each cited workflow step, or the cited skill, must "run command `designmd-install`". This resolves a citation, not a phrase pin |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

Mutations were run with `MUT=./mut3.js node <scratchpad>/mutate.js`: one anchor-exact edit or a `git show <sha>~1` revert, restored in `finally` with a byte compare. `upstream_hashes` noise is not listed.

| Test | Regression proof |
|---|---|
| tests/run.js:`sprint-018 AC-4/AC-5/AC-7: a reviewer's question and External Review's stalemate …` (at-least-CONCERNS assert) | C1: the carrier's CONCERNS sentence deleted → exit 1, "AC-4: a reviewer holding an open question returns at least CONCERNS, never APPROVE". Rewording R4 ("keeps a reviewer's verdict at `CONCERNS` or worse - it may never be `APPROVE`") → only `upstream_hashes` failed; this test stayed green |
| tests/run.js:`sprint-018 AC-4/AC-5/AC-7: a reviewer's question and External Review's stalemate …` (generic returns-QUESTION sweep) | C2: `sprint-lifecycle.md` reverted to `5746479~1` (the fix commit) → exit 1, "AC-4/AC-5: a rule line telling any agent to return QUESTION reaches reviewers too, so it must carve them out to their carrier on the same line"; C3: only step 6's carve-out removed (a later line than step 4) → exit 1, same message |
| tests/run.js:`sprint-018 AC-4/AC-5/AC-7: a reviewer's question and External Review's stalemate …` (TST-2-1 widened sweep + exempt set) | Q1: `core.md` reverted to `3ee9f24~1` → exit 1, "AC-4/AC-5: a rule line telling any agent to return QUESTION reaches reviewers too, so it must carve them out to their carrier on the same line". The old "returns `QUESTION`"-only sweep, applied to that same blob, finds 0 offenders, so it stayed green. Q2: `design-principles.md:47` given an agent subject → exit 1, "TST-2-1: a QUESTION route whose line names no agent is creator-scoped and exempt; the exempt set is compared exactly" |
| same test (TST-2-2 option absence; S4/S5 re-recorded) | W1: `asd-phase-design-review.md` reverted to `d12ece2~1` → exit 1, "AC-4 (TST-2-2): .asd/workflows/asd-phase-design-review.md takes the stalemate options from external-review.md and must not restate them"; W2: names re-inserted in the impl-review line (second loop member) → exit 1, same message for impl-review. S4/S5 re-recorded at this HEAD: citation dropped from the design-review / impl-review stalemate line → exit 1, "AC-4: .asd/workflows/asd-phase-design-review.md must recognise External Review's Stalemate block, ask the user and take the options from their home" (and the impl-review message) |
| tests/run.js:`sprint-018 AC-1/AC-2/AC-4/AC-8/AC-9: …grants…` (TST-2-3 structural scope) | B1/B2/B3: `asd-ba.md`, `asd-ux.md`, `asd-architect.md` each reverted separately to `d802f2c~1` → exit 1, "AC-9 (TST-2-3): asd-ba holds both web tools, so its scoped policy line must bound search as well as fetch" (the same message for asd-ux and asd-architect) |
| same test (`designmd-install` orchestrator sites) | I1: `asd-phase-design-promote.md` reverted to `9409e90~1` → exit 1, "AC-8: asd-ux cites .asd/workflows/asd-phase-design-promote.md step 4 as where the orchestrator runs designmd-install - that site must run it"; I2: `asd-design-system/SKILL.md` reverted to `9409e90~1` → exit 1, same assert for the skill |
| tests/run.js:`sprint-018 AC-4/AC-5/AC-7: a reviewer's question and External Review's stalemate …` (`answer:` relation) | A1: the `answer:` line removed from `t_review.md` → exit 1, "AC-4: the carrier must state where the user's answer is written, and t_review.md must ship that line under the question item"; A2: `asd-phase-impl.md` reverted to `099cf64~1` → exit 1, "AC-4: impl review-fix must collect the answer lines with the findings, citing the carrier". A3 (impl-review) and A4 (design-review): the write-into-file clause set back to its pre-fix wording → exit 1, "AC-4: … must write each answer into that reviewer's file". A first draft of this assert matched the bare word `answer`, which the pre-fix "append the answers to decisions-log" already contained; a full `099cf64~1` revert of impl-review showed it proved nothing, so it was tightened before commit |

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
