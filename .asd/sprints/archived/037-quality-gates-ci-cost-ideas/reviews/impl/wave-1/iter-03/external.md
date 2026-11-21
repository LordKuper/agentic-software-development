[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-03
- **Severity floor (this iter)**: high

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | critical | .asd/workflows/asd-phase-pr.md:31 | [codex F1] Merge mode closes any open PR referenced by a `(PR #N)` marker in `sprint.md`. A reference in an out-of-scope bullet can trigger a close and comment without the explicit include choice required by AC-12. | Close only PRs whose repository and number match a recorded scope-gate include decision. |
| 2 | high | .asd/workflows/asd-phase-scope.md:49 | [codex F2] The 200-result cap violates AC-12. With 201 open PRs and the oldest 200 deferred, every subsequent intake omits the newest PR. | Paginate the repository's open PRs to exhaustion before collecting dispositions. |
| 3 | high | .asd/workflows/asd-phase-scope.md:48 | [codex F3] The unqualified `gh auth status` prerequisite can skip all project issues and PRs when an unrelated host or inactive account has expired credentials. | Verify the active account on the resolved project host, or use the project-scoped API call to decide whether intake can proceed. |
| 4 | high | .asd/workflows/asd-phase-scope.md:49 | [codex F4] The list captures the merge SHA and a separate view supplies the summary. A push between those calls can show commit B's changes while recording approval for commit A; if the author restores A before execution, the SHA check permits merging it. | Read the summary inputs and `headRefOid` together and bind the disposition to that SHA. |
| 5 | high | .asd/workflows/asd-phase-scope.md:52 | [codex F5] The per-row checklist intake can seed the ceiling after the first addition. If more accepted rows push the new file beyond that initial 10% headroom, the next impl gate fails on the same approved intake. | Apply all accepted checklist edits before seeding its missing ceiling, and commit both files together. |
| 6 | high | .asd/runtime.js:2343 | [codex F6] The gap-proof gate ignores valid Markdown data rows without a leading pipe. A row such as `a.js:t \| \| n/a \|` renders with an empty Gap proof and passes validation. | Parse rows with optional outer pipes, or explicitly refuse unsupported row syntax; extend the existing empty-proof case in `tests/runtime-tools.test.js` to cover this form. |
| 7 | high | .asd/runtime.js:2350 | [codex F7] The anchored regex accepts `{{GAP_PROOF}} (pending)` as evidence and rejects legitimate proof text that starts and ends with two separate placeholders. The existing stand-alone and embedded-placeholder tests miss both cases. | Validate the recorded seeded-run or search proof form, and extend the existing cases to cover both inputs. |
| 8 | high | .asd/workflows/asd-phase-impl-test.md:48 | [codex F8] Step 9a sends uncovered removals to step 6 after step 6 has already run. The generic QUESTION relay redispatches the tester and supplies no route through the adaptive removal gate. | Route uncovered proposals through steps 5–6 before resuming suite revision, and keep the area pending until its dispositions are recorded. |
| 9 | high | .claude/agent-memory/asd-external-review/reference_codex-invocation.md:32 | [codex F9] The prescribed grep-and-sleep wait loop polls the run, against this agent's tool policy. Appending `echo` after the codex call also replaces its shell exit status with success, which can hide a failed invocation from retry logic. | Await the host's completion signal and preserve the wrapped CLI's exit status through prompt cleanup. |

## Dropped findings (counts only)

- Below severity floor (iter 3, floor high): 0
- Nitpick, by category: wording polish: 1

## Verdict
CONCERNS: 9
dropped: 1

resolved: 9 — memory-fix, 2026-11-18
