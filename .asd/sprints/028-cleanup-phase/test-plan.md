`---
`responsibility:
`  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
`  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
`  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
`---
`
`# Test plan — sprint 028-cleanup-phase
`
`## Entry log
`
`| Entry | HEAD analysed | Scope |
`|---|---|---|
`| 1 | 8359218a | full change surface |
`| 2 | e1fd93a4 | delta since entry 1 |
`| 3 | 9cf1e1f2 | delta since entry 2 (review-fix wave-1/iter-01) |
`| 4 | de11b54e | delta since entry 3 (review-fix wave-1/iter-02) |
`| 5 | 7e38ed1e | delta since entry 4 (amendment AC-21, plan Tasks 13-14) |
`| 6 |  | delta since entry 5 (review-fix wave-1/iter-03, commit 14c8639e, plus the combined memory-fix 5d73b2e5) |
`
`## Risk → check decisions
`
`| Change | Material risk | Chosen check | Decision | Reason |
`|---|---|---|---|---|
`| cleanup workflow step 5 / `sprint-lifecycle.md` "Cleanup phase" step 3 verification gain `commands.yaml` `lint`, and step 3 re-entry restores uncommitted paths against `HEAD`, amendments AC-4/AC-5 (review-fix iter-03) | verification skipping the configured lint lets a lint-red removal commit; a re-entry restoring against the checkpoint sha instead of `HEAD` reverts the committed removals it is meant to keep | content-contract (token pin) | add | both are decisions-log-free rule literals a re-entry or verification executes (`commands.yaml` `lint`, `git restore --source=HEAD --staged --worktree`) that no existing pin reached (the AC-4/D7 test pins only the checkpoint/record line and commit subject forms); one test pins the lint token at both homes and the restore command, rejecting `--source=<sha>` |
`| design `Authoring` bullet: per-section lock line `"<draft path>" § "<section>" locked` appended on `Lock in`, re-entry treats a section as locked only with that line, amendment AC-12 (review-fix iter-03) | a re-entry that cannot tell a locked section from a drafted one silently skips an unreviewed section or re-asks a locked one | content-contract (token pin) | add | the line shape is the on-disk evidence the re-entry reads, a literal that cannot be reworded without changing the contract; one assert on `§ `<section>` locked` in the Authoring bullet; the surrounding re-entry prose stays unpinned |
`| leftover phrases the iter-03 fix removed: `iter-NN/testing.md`, `(reviews `testing.md`)`, `no longer critical by that fact alone`, `never `critical``, the memory-fix of `asd-reviewer-combined` memory (5d73b2e5) | a surviving form of a retired review file name or critical-tier sentence restates the superseded roster as current | existing `sprint-028 leftover-term check` sweep, extended | add | the four exact phrases taken from the diff's removed lines join `removed`; the sweep already reaches agent memory, so the memory fix is covered by the same assert and the run reports no memory hit |
`| `core.md` duplicated glossary clause, `git-strategy.md` drafts-clause and `asd-reviewer-quality` PR-gate line, `artifact-layout.md` `testing.md`→`quality.md`, `sprint-lifecycle.md` tier prose, scope/design/design-promote SKILL `allowed-tools`, design-review dispatch row passing `inputs` | prose or pre-approval drift with no stable token of its own | none | none | existing checks cover the reachable parts (skill allowed-tools and dispatch-payload contracts in the suite, `sync.js --check` exit 0 over the regenerated views); deletions of duplicated prose carry no behaviour; quality review judges the wording |
`
`## Removed tests
`
`| Test | Reason | In change scope |
`|---|---|---|
`| none | no test became obsolete by the delta | yes |
`
`## Added tests
`
`Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.
`
`| Test | Regression proof |
`|---|---|
`| `sprint-028 AC-12 (review-fix): the design Authoring loop appends a per-section lock line on Lock in, the evidence a re-entry reads to tell a locked section from a drafted one` | mutation M4 (removed the `on \`Lock in\` appending ...` clause, keeping the re-entry citation): `node tests/run.js --filter "sprint-028 AC-12 (review-fix)"` exit 1, FAIL of that test, 1/315 matched; control (re-entry prose reworded `counts as locked in solely by its lock line`): same command exit 0, 1/315 matched; runs: 2 |
`| `sprint-028 AC-4/AC-5 (review-fix): cleanup verification runs the configured lint beside build and tests, and a re-entry discards uncommitted paths against HEAD, never the checkpoint sha that would undo committed removals` | mutation M2 (superseded rule restored: `--source=HEAD` → `--source=<sha>` in step 3): `node tests/run.js --filter "sprint-028 AC-4/AC-5 (review-fix)"` exit 1, FAIL of that test, 1/315 matched; mutation M3 (step 5 `build and lint per ... \`lint\`` → `build per \`commands.yaml\` \`build\``): same command exit 1, same test, 1/315 matched; runs: 2 |
`| `sprint-028 leftover-term check` (existing sweep, four phrases added) | mutation M1 (re-inserted `iter-NN/testing.md` in `artifact-layout.md` "Test plan"): `node tests/run.js --filter "sprint-028 leftover-term"` exit 1, FAIL of that test, 1/315 matched; restored in the same command; runs: 1 |
`
`## Suite run
`
`- Command: `node tests/run.js` (shared infrastructure touched: `runtime.js`, `.asd/migrations/`, `tests/run.js` — the impacted set is the full suite)
`- Scope: full
`- Result: pass — 315/315 passed, exit 0
`- Lint / build: pass — `git diff --cached --check` exit 0 at commit, `node .asd/sync.js --check` exit 0 (every item `current`)
`- HEAD: 5d73b2e5d6c9ef218aabc4eacddd649e004b18a2
`
`## Defects
`
`Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.
`
`| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
`|---|---|---|---|---|---|---|
`| D-1 | 1 | .asd/workflows/asd-phase-impl-review.md | AssertionError [ERR_ASSERTION]: AC-17: a user escalation caused by a question or failure is preceded by an advisor recommendation (agent-protocol.md "Relay" Escalation consult); a step that asks the user without it leaves the sprint's recommendation-before-escalation contract unmet at that site | sprint-028 AC-17 (D10): every workflow step holding a failure- or question-class hard gate - reviewer question, FAIL escalation, review-cap override, stalemate - takes the escalation consult before it asks the user | fixed | 043e4301 |
