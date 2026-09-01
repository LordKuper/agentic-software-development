[REVIEW-impl-quality]: CONCERNS

# Review — quality
- **Phase**: impl-review
- **Iteration**: 3 (floor = high)

## Findings
| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `asd-phase-impl-review.md:24` + `external-review.md:57` + `sprint-lifecycle.md:230` | `iteration_heads["iter-(NN-1)"]` has no defined behavior when absent (e.g. a sprint in flight when this schema shipped) — literal substitution yields `git diff ...HEAD` = `HEAD...HEAD` = empty diff, silently APPROVEing unreviewed code. This repo itself hit this exact gap (had to hand-backfill iteration_heads for iter-01/02). | Add a fail-open fallback: absent/empty key → full `git diff <base_branch>...HEAD <pathspec>`, note the widened scope in decisions-log. CHANGELOG entry for the new field. |
| 2 | high | `asd-reviewer-ui.md:81` + `asd-frontend-dev.md:45` | E-1 carve-out's reduced rubric says "all other rubric items apply" including §6 token usage — but `t_html-shell.html`'s `:root`/dark-mode blocks ARE the primitive-layer exception §6 already allows, so as stated every future carve-out review emits dozens of unfixable findings against the token *definitions themselves*. | Scope §6 explicitly: `:root`/`prefers-color-scheme` blocks are the primitive layer exception; check only that everything outside them references `var(--*)`. |
| 3 | high | `artifact-layout.md:129` | `{{TOC_ASSETS}}` canonical CSS block uses literal two-character `\n` sequences instead of real newlines (markdown table cell can't hold newlines) — copied verbatim, this breaks the CSS parser (`n nav.toc` invalid selector, cascading parse failure). Silent breakage, no error. | See simplification.md#1 — delete the placeholder entirely and merge into the shell's own unconditional `<style>` block. |

## Coverage summary
`files: 33/33 checked, 0 n/a · rules: 11/18 pass, 6 n/a, 3 findings`

## Verdict
CONCERNS: 3

## Next action
Route to `impl` review-fix mode.

## Escalations
None.
