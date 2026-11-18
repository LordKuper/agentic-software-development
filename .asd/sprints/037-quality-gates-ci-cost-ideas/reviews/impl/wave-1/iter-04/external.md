[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-04
- **Severity floor (this iter)**: high

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | .asd/runtime.js:2344 | [codex F1, source: codex; GFM table example https://github.github.com/gfm/#example-202] The leading-pipe check scans the whole section for pipe characters. It accepts a one-cell Added-tests row with no Gap proof and rejects a Markdown comment that contains a pipe. | Validate the contiguous Added-tests table and reject malformed rows inside it while allowing comments outside it. Extend the existing noLeadingPipe test to cover both cases. |
| 2 | high | .asd/workflows/asd-phase-impl-test.md:48 | [codex F2, source: codex] Step 6 removes rejected proposals from the test plan while the area stays pending. A fresh tester resuming from that ledger can propose the same removal again, because the ledger no longer records the rejection. | Persist each proposal's approval or rejection by test identity in the ledger, and have every later dispatch honor that decision. |
| 3 | high | .asd/workflows/asd-phase-scope.md:49 | [codex F3, source: codex; cli/cli v2.90.0 pkg/cmd/api/api.go#L382-L462] The paginated PR list emits numbers as pages succeed. If a later page fails, the workflow has no instruction to discard the partial list or to block dispositions for an incomplete set. | Require a successful pagination exit before any PR number is used, and handle failed per-PR reads before accepting scope. |

## Dropped findings (counts only)

- Below severity floor (iter 4, floor high): 0
- Nitpick, by category: none

## Verdict
CONCERNS: 3
dropped: 1
