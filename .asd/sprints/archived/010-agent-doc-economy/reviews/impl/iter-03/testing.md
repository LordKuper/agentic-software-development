[REVIEW-impl-testing]: APPROVE

# Review — testing

- **Phase**: impl-review · **Iteration**: 3 · **Severity floor**: high
- **Manifest**: [testing.manifest.json](./testing.manifest.json) (digest `250234018c…`)
- **Validated ledger**: [testing.ledger.json](./testing.ledger.json) — `validate-ledger` → `{"ok":true}`

## Findings

None at or above the high floor.

## Judgements

**The rejected fix is sound.** TST-01 asked for a two-name extension of a hardcoded array; the tester derived the set instead. The loop is not driven by the roster — it is driven by the memory tree and only *partitioned* by the roster, which is the correct direction: no written directory can be missed, and the roster answers exactly the question the risk asks, whether any dispatch can load this. Deriving from the memory tree alone would re-open the pre-existing retired-agent failure; deriving from the roster alone would miss a directory for a renamed agent. Both sources are used, each for what it knows. The exemption comparison cannot go vacuous: an exact comparison fails on an empty set as loudly as on a wrong one, and a roster-length sanity assertion closes the only route to a degenerate partition. Verified against disk — ten memory directories, nine in-roster and looped, fallout exactly the one retired name. The reported dangling index entry in that retired directory is real, genuinely unloadable and outside the change surface; reporting rather than sweeping it in is correct, and pinning it in the fallout literal makes the exclusion visible and fail-closed instead of an invisible allow-list. All four mutations replay to the transcribed assertion in order.

**The range correction was right and the two gaps were real.** Grepping the pinned tokens over `tests/run.js` returns hits only inside the two new test bodies, so before this entry nothing asserted the drop-list enumeration, nothing asserted its role-row grant, and nothing asserted the red-full-suite invalidation at its rule home or either acting site. The earlier blanket keep was a completeness claim it could not make, and superseding it was correct. Test-count arithmetic corroborates both the before-state and the three-test delta.

**Neither new test pins churn-prone wording.** The nitpick test asserts the enumeration by count rather than member text, derives the instructed set and compares it to the derived reviewer set, and scopes its sweep to one token while saying so in its own message. The latch test verifies its premises at source, guards the branch loop by count, and pairs every must-not-contain assertion with a positive locator that fails closed on a rewording. The advisor test derives the target heading from the agent file, so both mutations fire the same assertion with different derived text — which is what proves derivation rather than a hardcoded literal.

**`none` honesty is complete for this delta**, cross-checked against the fix round's own enumeration: no changed file lacks a row, and both `none`s recorded this entry check out at source. Neither rests on "it is prose".

**Fail-first genuineness and §17.** The self-reported test defect is the strongest evidence the campaign was run: the advisor test's first draft really would have absorbed the moved-rule case under the wrong message, and the split into a count assertion plus a derived citation assertion is the correct repair, re-proven. Ledger-noise accounting matches this repo's per-tree arithmetic exactly — three extra failures for a canonical agent-file mutation, one for a rule doc, zero for agent memory — which a fabricated record does not get right. Every mutation is recorded as backed up and restored inside the call that read the failure, and the worktree was clean at dispatch.

## Below floor, not raised

The workflow-side acting-site assertion catches the stated deletion risk but not a semantic inversion; and one parenthetical claiming the verdict token stays pinned by existing mirrors is true of the cross-file mirrors but not of any test — the `none` stands on its two independent grounds regardless.

## Verdict

APPROVE

## Next action

Reviewer done. Bare APPROVE, so this reviewer latches.
