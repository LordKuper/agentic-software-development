[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02
- **Severity floor (this iter)**: low
- **Unreviewed files**: none

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | low | tests/run.js:7085 | The assertion pins ordinary prose with `/\beach time\b/`. Replacing "each time" with "on every invocation" keeps the retry behavior but fails the test. Codex confirmed this with an in-memory mutation. This breaks the token-only content-contract rule. | Drop the prose-dependent assertion. Keep the checks on stable commands, route targets and `decision_actor` fields. Record the prose-only semantics as unautomated. |

(Codex reported no severity labels. Its one finding was mapped to low.)

## Dropped findings (counts only)

- Below severity floor (iter 2, floor low): 0
- Nitpick, by category: none reported

## Verdict
CONCERNS: 1

## Next action
The dev fixes finding 1 in tests/run.js and re-runs the impl-review iteration. This is not a stalemate. The iter-01 findings were asd-phase-pr.md:10 and git-strategy.md:82, and iter-02 has a different finding set.
