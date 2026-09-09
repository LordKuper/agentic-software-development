[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review · **Iteration**: 4 · **Severity floor**: high
- **Wrapped provider**: Codex CLI · **Ledger**: External Review is exempt from the coverage-ledger gate.

## Kept findings

### EXT-1 — high — `.asd/rules/review-policy.md:129`

The line declares itself the sole statement of that scope and asserts that the acting sites state only the write they perform — implying they do not restate the read-only and memory-channel scope. But `.claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md:8` restates both halves verbatim: that the agent produces no review artifact, code or doc, *and* that the memory channel is a separate write it does use. The existing guard in `tests/run.js` checks only the retired literal wording, so it passes this rephrased restatement.

This is a sixth instance of the same false-declaration class the sprint has corrected across five sites in three rounds, and it sits in a file that was itself edited during the EX-5 fix — evidence the correction is finding new instances as it touches files rather than having exhausted the corpus.

**Suggested fix**: either narrow the declaration so it is actually true, or strip the restated halves from the memory file to a bare citation, following the pattern used at the other five sites; then widen the guard to catch a rephrasing rather than only the retired literal.

## Dropped findings

- Below floor (iteration 4, floor `high`): 0
- Nitpick: none

## Iteration-1 findings, verified against the current tree

Every one independently corroborated by direct file read rather than taken on the wrapped model's word:

- **EX-1** dead fourth argument — **resolved**; the function now takes three parameters and is invoked with three.
- **EX-2 / EX-6** the OR-joined tests and the unshielded normative obligation — **resolved**; removal is necessary and controlling, neither of the other two authorises a cut alone, and `Never cut` now carries the normative class at its home.
- **EX-3** the missing `run command` grant — **resolved**; granted explicitly for step 9's authorised-paths gate.
- **EX-4** the truthiness guard — **resolved**; the guard is now on definedness, so a falsy declared value reaches the validator and fails closed.
- **EX-5** the out-of-policy command in agent memory — **resolved**; the file now cites the frontmatter as the grant home. The same file independently surfaces EXT-1 above, which is a different defect class, not a recurrence.
- **EX-7** the standalone-prohibition gap — **resolved**; the cut-list bullet is narrowed to a prohibition that only negates a positive rule stated beside it, and standalone safety, security, authority and irreversible-action prohibitions are expressly carved into `Never cut`.

**Not a stalemate**: iteration 1's finding set and this one are not identical, and iteration 2 was a quota skip, so this is only the second real iteration-to-iteration comparison.

## On the two questions asked

**The declaration-correction sweep has not fully converged** — EXT-1 is a sixth instance, found in a file touched by an earlier fix, which suggests instances surface as files are opened rather than the corpus having been exhausted.

**The corrected economy rule itself has no remaining path to authorise cutting something load-bearing**: removal is necessary and controlling, normative-obligation and standalone-prohibition text is explicitly carved into `Never cut`, and the cut-list prohibition bullet is scoped narrowly enough to reach neither.

## Verdict

CONCERNS: 1

## Next action

Creator fixes EXT-1 and the round repeats at iteration 5.
