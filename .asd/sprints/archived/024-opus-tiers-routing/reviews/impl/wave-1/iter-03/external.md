[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-03
- **Severity floor (this iter)**: low
- **Unreviewed files**: none

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `tests/run.js:7614`, `tests/run.js:7617` | Codex finding F1 (CLI severity minor). The new AC-8 and AC-9 asserts pin rewordable prose, which `code-style.md` §17 (line 126) forbids: a pin is meant to name a token that cannot be reworded, "never the surrounding prose". Line 7614 pins `meeting the decision` and `never an adaptive acceptance`. Line 7617 pins `restores the superseded rule text` and `keeping its citation`. Rewording "meeting" to "fulfilling" or "restores" to "reinstates" would fail these asserts although the contract is unchanged. The recorded reword control edits text the pins don't match, so it doesn't exercise them. | Restrict the pins to stable tokens: the heading, the `` `new or changed scope` `` class, and the `Hard in both modes:` anchor already checked on line 7615. Check the semantic clauses by targeted source comparison. Make the reword control rewrite the matched phrase, so it proves the assert stays green. |

## Dropped findings (counts only)

- Below severity floor (iter wave-1/iter-03, floor low): 0
- Nitpick, by category: none

## Verdict
CONCERNS: 1

## Next action
Loosen the `tests/run.js` AC-8 and AC-9 pins to stable tokens and rerun the reword control against the matched text.

Stalemate evaluation: none. The prior iteration (wave-1/iter-02) was APPROVE with no findings; F1 is new.
