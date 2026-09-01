[REVIEW-impl-ui]: CONCERNS

# Review — ui
- **Phase**: impl-review
- **Iteration**: 4 (floor = high)

## Findings
| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `asd-reviewer-ui.md:81` | E-1 carve-out's §6 exception directive and its parenthetical gloss disagree: literal reading of "check §6 only against everything outside the two token blocks" would flag ~40 raw px/rem/font-family declarations in t_html-shell.html as violations (no spacing/typography token layer exists); the intended reading (colors only) yields zero. | State explicitly: for t_html-shell.html the whole `<style>` block is the template's own primitive/definition layer — §6 applies there only to colors outside the two token blocks. Fragment templates (t_adr.html etc.) stay fully subject to §6. |
| 2 | high | `asd-reviewer-ui.md:23` vs `asd-phase-impl-review.md:31` | E-1 carve-out (2) triggers on "UI surface sits under .asd/templates/", but step 5's actual UI-surface predicate excludes `.html` under `.asd/` entirely — so under scoped_fan_out's actual predicate, `.asd/templates/*.html` is NOT a UI surface, meaning carve-out (2) is unreachable and carve-out (1) ("no UI surface in scope") is literally true, causing an unconditional skip of framework-template review under the default enabled fan-out setting. | Add `.asd/templates/*.html` when self_hosting:enabled to the step-5 predicate (preferred — auto-fixes the fan-out skip too), or make carve-out (2)'s trigger take precedence explicitly. |

Verified correct this iteration: CSS merge is syntactically valid (real newlines), `.status-accepted` contrast now clears 4.90:1 against its real background, dark `--info` has no collision.

## Coverage summary
`files: 20/20 checked, 0 n/a · rules: 7/7, 2 findings`

## Verdict
CONCERNS: 2

## Next action
Route to `impl` review-fix mode.

## Escalations
None.
