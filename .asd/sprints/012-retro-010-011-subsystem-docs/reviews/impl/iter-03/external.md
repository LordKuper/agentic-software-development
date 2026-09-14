[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: 3
- **Severity floor (this iter)**: high
- **Scope manifest**: [external.scope.json](./external.scope.json)

Wrapped CLI: Codex (`codex exec --model gpt-5.6-sol -c model_reasoning_effort="high" --sandbox read-only -`), incremental scope = self-hosting row (19 files, `896b742..b389e4d`). Both kept findings independently re-verified against current file content (not trusted from Codex's output) before being kept.

**Prior-iteration (iter-2) disposition, re-verified fresh:**
- #1 (asd-init type validation) — **partially fixed, residual carried forward as F2 below**: `asd-init/SKILL.md:91` now type-checks unenumerated boolean/integer fields (`true`/`false`, non-negative integer). Verified via Read. But string fields with no `Values:`/inline `a | b` template comment — confirmed via Read of `t_config.yaml:16-21,32-36`: `documents.prd`/`ux_spec`/`adr`/`c4` and `backward_compat` all lack that comment shape — still only get a bare "is it a string" check, so an arbitrary string (not `enabled`/`disabled`, not `strict`/`migration`/`none`) still passes and gets written. This is the same underlying gap, narrower now that booleans/integers are covered — reported fresh as F2, not re-litigated as the old #1.
- #2 (correctness-memory QUESTION stance) — **confirmed fixed**: `feedback_review-method-no-shell.md:14` now reads "return `QUESTION` naming the contradiction and do not comply," matching `providers.md`'s "Declared tool policy." Verified via Read.
- #3 (review-policy.md sole-home claim) — **confirmed fixed**: `review-policy.md:101` now narrows the exclusivity claim to `NA_TARGETS`/classifier-function definitions ("target ids and classifier member lists live only in `.asd/runtime.js`") and separately states predicate text is "owned by `NA_PREDICATES` there, and any canon quote of it must match" — no longer claims the text itself lives only in `runtime.js`. Verified via Read.

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `.asd/workflows/asd-phase-impl.md:62` | Step 6 dispatches `asd-init` sprint-mediated mode for a declared `Settings change:` line but never states what happens if it returns `FAILED` (which the skill's own sprint-mediated step 2 defines: "Any failing pair → `FAILED` naming it; nothing written"). The Execution-mode blocker list (lines 34-37) only names *dev* `QUESTION`/`FAILED`/Simplicity-Default triggers as blockers — an `asd-init` dispatch is not a dev and isn't covered. No rule doc (`sprint-lifecycle.md` "Settings change declaration") fills the gap either. There is no defined halt path for an invalid settings change at this step. | Add `asd-init` FAILED to the blocker list (or state explicitly that step 6 halts and relays on it before the wave's other subtasks dispatch), and update `sprint-lifecycle.md` "Settings change declaration" to state the halt contract once. |
| 2 | high | `.asd/skills/asd-init/SKILL.md:91` | Sprint-mediated step 2's validation only enforces an enumeration when the template field's comment carries `Values:` or an inline `a \| b` form; otherwise it falls back to bare type-of-template-value. Verified against `t_config.yaml`: `documents.prd`/`ux_spec`/`adr`/`c4` (comments are descriptive prose, no enumeration marker) and `backward_compat` (three descriptive lines above it, not in `Values:`/`a \| b` form) all fall into this gap — a sprint-mediated pair like `documents.prd=maybe` or `backward_compat=whatever` is a syntactically valid string, passes step 2 unchanged, and gets written to `config.yaml`, silently breaking every downstream reader that branches on `enabled`/`disabled`/`strict`/`migration`/`none`. | Either add explicit `Values:`/inline enumeration comments to these `t_config.yaml` fields (matching the pattern already used for `self_hosting`, `skip_design_phases`, `language.chat/docs`), or extend step 2's fallback to recognize a leading block of `X — description` comment lines as an implicit enumeration. |

## Dropped findings (counts only)

- Below severity floor (iter 3, floor high): 0
- Nitpick, by category: none

## Verdict
CONCERNS: 2

## Next action
Relay the 2 kept findings to the dev for a review-fix round. Both are high-severity gaps in the settings-change machinery this sprint's fix rounds have been iterating on: #1 is a missing halt-path definition for an `asd-init` FAILED during step 6's dispatch; #2 is a residual, narrower form of iter-2 finding #1 (booleans/integers now validated correctly; unenumerated strings still are not). Iter-2 findings #2 and #3 are confirmed resolved and should not be re-raised.

Reference paths used: `.asd/sprints/012-retro-010-011-subsystem-docs/sprint.md`, `.asd/project/custom-common-rules.md`, `.asd/project/custom-coding-rules.md`, `.asd/project/commands.yaml`, `.asd/rules/sprint-lifecycle.md`, `.asd/templates/t_config.yaml`, `.asd/workflows/asd-phase-impl.md`, `.asd/skills/asd-init/SKILL.md`.
