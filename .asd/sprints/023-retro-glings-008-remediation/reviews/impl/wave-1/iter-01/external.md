[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01
- **Severity floor (this iter)**: low
- **Unreviewed files**: none

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `.asd/rules/sprint-lifecycle.md:384` | Codex finding F1, rated major by Codex and calibrated down to medium. A `Test-only` Task dispatches `asd-tester` during `impl`. The stop conditions in `.asd/agents/asd-tester.md:29` (verified) still say "impl COMPLETED signal not received → ABORT". Read literally, the tester would abort on a Test-only Task, since impl cannot have completed while that Task is still open. `asd-tester.md:27` already describes the Test-only mode. Only the stop-condition line is unscoped, so this is a contradiction, not a missing mode. `asd-tester.md` is outside `files[]`, so the defect is anchored on the in-scope rule that creates the dispatch. | Scope the `asd-tester.md:29` precondition to impl-test dispatches. For a Test-only Task, require an approved plan Task and completed prerequisite code Tasks instead. This fix needs an edit to `asd-tester.md`, which is outside the manifest. |
| 2 | low | `.claude/agent-memory/asd-tester-critical/project_testability-envelope.md:143` | Codex finding F2, rated minor by Codex and calibrated down to low. The memory says to "read `git log -3` before each commit". `asd-tester.md:78` (verified) limits run commands to `commands.yaml`, a diff command, and `git add`/`git commit`. `git log` is not named, so the instruction is arguably outside the tool allowlist. The same memory file already cites `git log` at lines 399 and 439, and `git log` is read-only. The contradiction is therefore soft. | Either route the scope-amendment information through the orchestrator's dispatch message, or widen the `asd-tester.md:78` allowlist to include read-only `git log`. |

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): 0
- Nitpick, by category: none

## Verdict

CONCERNS: 2

## Next action

Orchestrator: dispatch a fix for F1 (reconcile `asd-tester.md:29` with the Test-only dispatch). F2 can be fixed in the same round or accepted as a known soft contradiction. Re-review at iter 2, where the floor is medium and F2 would fall away.
