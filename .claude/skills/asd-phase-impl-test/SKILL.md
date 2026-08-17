---
name: asd-phase-impl-test
description: "Runs the ASD impl-test phase: dispatches asd-test-engineer to pick the test approach for the whole change scope after the code exists, prune redundant tests, author missing ones, and run the full suite. Green suite routes to impl-review; code defects are recorded in test-plan.md and route back to impl test-fix mode. Use when asd-sprint dispatches the impl-test phase, or when the user explicitly asks to run or re-run impl-test for the active sprint."
metadata:
  asd-role: phase
  asd-order: "8"
  version: "0.1"
allowed-tools: "Read Bash AskUserQuestion Task"
---

# ASD Phase: Impl Test

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- impl COMPLETED signal received (build + lint green); `state.json.phase` advanced from `impl`
- `state.json.review_fixes_pending` and `test_defects_pending` both cleared by the impl fix-mode finalize

## Tool policy
- Read — `.asd/project/config.yaml`, `state.json`, `plan.md`, `test-plan.md`, persistent design/ docs (PRD ACs, api, ux-spec), `commands.yaml`, `custom-common-rules.md`, `custom-coding-rules.md`, existing test sources
- Bash — `git diff` for the change surface; `commands.yaml` `test`/`lint`/`build` for the suite gate
- AskUserQuestion — out-of-scope test removal gate; escalation
- Task — dispatch `asd-test-engineer` (strategy, prune + author, suite run); `asd-pm` for state + decisions-log

## Execution mode

Runs **autonomously**. The only user contacts:

- **removal gate** (step 5) — a proposed deletion of a test outside the sprint change scope;
- a test-engineer blocker — `QUESTION` (AC behaviour genuinely ambiguous), `FAILED` (test runner broken, tech-reference missing), or a Simplicity Default trigger (new test dependency or test infrastructure) needing Complication Approval.

No user gate on a green suite, and none on routing defects back to impl.

## Workflow

1. Read `.asd/project/config.yaml` (`language.chat`, `language.docs`, `backward_compat`), `<sprint>/state.json` → set `phase=impl-test` via `asd-pm` Task
2. **Change surface** — `git diff <git.base_branch>...HEAD --stat` plus file list; add the existing test files that cover those production files (Glob/Grep by test naming convention). This set is the review scope for the whole phase
3. **Strategy pass** — dispatch `asd-test-engineer` via Task with payload: change surface, `plan.md`, PRD AC list, api/ux-spec paths, `commands.yaml`, custom rules, `t_test-plan.md`, `language.docs`. Instruction:
   - test selection happens **now**, after the implementation exists — never speculatively from the plan
   - for each change, name the material risk and pick the cheapest reliable check: static/architecture check → focused unit or property test → component or contract test at a boundary → essential e2e journey only where a full journey is the risk
   - classify every existing covering test: keep / remove (trivial, duplicate, mock-confirming, implementation-coupled, flaky) / adjust
   - record `none` decisions (no behaviour added, or an existing check already covers the risk) with the reason — silence is not a decision
   - coverage numbers may be used to find untested code, never as a target
   - write `<sprint>/test-plan.md` per `t_test-plan.md`; emit COMPLETED
4. Read `test-plan.md` → collect proposed removals; split into in-scope (test file inside the change surface) and out-of-scope
5. **Removal gate** — only when out-of-scope removals exist: AskUserQuestion in `language.chat`, Complication Approval format per `core.md`, one entry per test (what, why, what still covers the risk). Rejected removals are struck from `test-plan.md`; approved ones marked `yes — user approved`
6. **Prune + author pass** — dispatch `asd-test-engineer` via Task (parallel instances per independent area when the plan splits cleanly). Instruction:
   - delete the approved removals; write the `add` decisions at the chosen level
   - every regression test for a known defect must be proven fail-first against the pre-fix behaviour (or an equivalent targeted mutation) — record the proof in the `Added tests` table
   - never assert implementation detail; no sleep-based waits; no test whose only value is a coverage number
   - commit per Conventional Commits; emit COMPLETED
7. **Suite gate** — dispatch `asd-test-engineer` via Task to run `test`, then `lint` and `build` per `commands.yaml`, and write the raw result into the `Suite run` section of `test-plan.md`. Verdict is read from the runner's exit code plus report — an agent's summary alone never satisfies this gate
8. **Triage** on any failure:
   - **test defect** (bad assertion, wrong fixture, flaky pattern) → re-dispatch step 6 for the offending tests, then step 7 again
   - **code defect** → append a `D-N` row to the `Defects` section of `test-plan.md` (location, symptom, failing test, status `pending`); dispatch `asd-pm` via Task: set `state.json.test_defects_pending = true`, append decisions-log "impl-test: defects <D-N list> → impl test-fix"; emit COMPLETED with `NEXT: impl`
   - both kinds present → fix the test defects first, re-run, then route the remaining code defects back
9. **Green suite** — dispatch `asd-pm` via Task: append decisions-log "impl-test: suite green (<counts>), <added>/<removed> tests"; confirm `test_defects_pending` null; emit COMPLETED with `NEXT: impl-review`
10. test-engineer QUESTION / FAILED / ABORT → relay, halt

## Re-entry

Every `impl` exit re-enters this phase. `test-plan.md` is rewritten each entry from the current change surface; `Defects` rows persist — resolved rows stay `fixed` for the record, and a defect that reappears gets a new `D-N` row rather than a reopened one. No iteration cap: the loop ends on a green suite or on an escalated blocker.

## Artefacts produced
- `<sprint>/test-plan.md` (risk→check decisions, removals, added tests, suite run, defects, optional manual verification spec)
- Tests added, adjusted, and deleted in repo
- Updated `state.json` (phase=impl-test; `test_defects_pending` set when routing back to impl)
- Git commits per Conventional Commits
- decisions-log entry on green suite or defect routing

## Agents dispatched
- `asd-test-engineer` (strategy, prune + author, suite run)
- `asd-pm` (state, decisions-log)
- No reviewers — test quality is judged in impl-review by `asd-reviewer-testing`

## Skills dispatched
None.

## Return contract (single line)
```
PHASE: impl-test | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: <impl-review|impl>
```
`NEXT: impl-review` on a green full suite; `NEXT: impl` when code defects route the sprint to impl test-fix mode.

## References
- `.asd/rules/sprint-lifecycle.md` (impl-test phase contract, impl⇄impl-test cycle)
- `.asd/rules/code-style.md` §17 (test rubric)
- `.asd/rules/checkpoints.md` (removal gate, precondition chain)
- `.asd/rules/artifact-layout.md` (test-plan ownership)
- `.asd/rules/git-strategy.md` (commits)
- `.asd/rules/language-policy.md`
- Templates: `t_test-plan.md`
