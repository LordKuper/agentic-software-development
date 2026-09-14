[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: 2
- **Severity floor (this iter)**: medium
- **Scope manifest**: [external.scope.json](./external.scope.json)

Wrapped CLI: Codex (`codex exec --model gpt-5.6-sol -c model_reasoning_effort="high" --sandbox read-only -`), incremental scope = self-hosting row (22 files, `64024f8..896b742`). Every kept finding was independently re-verified against current file content and the actual diff hunks (not trusted from Codex's output) before being kept.

**Prior-iteration disposition, re-verified fresh:**
- iter-1 #1 (empty seeded registry) — excluded by explicit user decision, not re-raised by Codex or by me.
- iter-1 #3 (design-prompt severity wording) — invalid/out-of-scope, not re-raised.
- iter-1 #2 (asd-init return-contract underspecified for sprint-mediated mode) — **confirmed fixed**: `asd-init/SKILL.md` gained step 2 (`t_config.yaml`-backed validation) and the return contract now states `MODE`/every un-probed `TOOLS` entry is `n/a` for sprint-mediated mode. Verified via diff against iter-1 head.
- iter-1 #4 (impl.md step 8 ordering vs step 6/7) — **confirmed fixed**: the settings-change dispatch moved into step 6 as a sub-bullet ("before wave 1 dispatches"), all three cross-references (workflow-mapping line, step 9's authorised-paths clause) renumbered consistently. Verified via diff against iter-1 head.

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `.asd/skills/asd-init/SKILL.md:91` (sprint-mediated step 2, newly added this iteration as the fix for iter-1 #2) | The new pair-validation step checks the dotted key exists in `t_config.yaml` and, only where the field carries an inline enumeration (`Values:`/`a \| b` comment), that the value is one of them. Boolean and numeric fields with no such comment (`gh_enabled`, `documents.designmd`, `review.iterations_low/medium/high/critical`, etc. — confirmed via grep of `t_config.yaml`) get no type/shape check at all: a sprint-mediated pair like `gh_enabled=maybe` or `iterations_low=-3` passes step 2 unchanged and is written to `config.yaml`. Undermines the guarantee step 2 was just added to provide ("Any failing pair → `FAILED` naming it; nothing written"). | Extend step 2 to check each value's YAML scalar type against the field's declared type in `t_config.yaml` (boolean/non-negative integer/string), not only enumerated values. |
| 2 | high | `.claude/agent-memory/asd-reviewer-correctness/feedback_review-method-no-shell.md:14` (new bullet this iteration) | The new bullet instructs: on receiving an out-of-policy instruction (e.g. "run `git diff … yourself`"), "do not run it, review from on-disk reads, and state the contradiction in the report instead of halting." `providers.md` "Declared tool policy" (unchanged, sole SSoT) requires the opposite mechanic for exactly this case: "An agent handed an instruction outside it returns `QUESTION` naming the contradiction and does not comply" — `QUESTION` is defined in `sprint-lifecycle.md`'s signal glossary as "needs user input" (a blocking escalation), not a note folded into a still-completed `REVIEW_DONE` report. The memory tells the reviewer to silently continue and finish the review instead of escalating, contradicting the rule it cites. | Correct the memory bullet to say the reviewer emits `QUESTION` naming the contradiction (per `providers.md`) rather than continuing to review and noting it in the output report. |
| 3 | medium | `.asd/rules/review-policy.md:101` (widened this iteration: "text and conditions" → "text, target ids and classifier member lists live only in `.asd/runtime.js`") | The strengthened "sole-home" claim is verifiably false: the exact predicate literals it claims live only in `runtime.js` (`outside phase gate`, `no budgets defined`, `no UI surface in scope`, `no perf budgets section and no executable file in scope`) are also hardcoded verbatim in `asd-reviewer-correctness.md`, `asd-reviewer-efficiency.md`, `review-policy.md` itself (line 168/171), and asserted as literal fixture/expectation strings in `tests/run.js` (lines 2071-2072, 2127-2128, 4127, 4162). | Narrow the claim to canonical *definitions* (the `NA_PREDICATES`/`NA_TARGETS` source of truth and the classifier functions) rather than "text ... live[s] only in runtime.js," and note that exact literals are intentionally mirrored at consuming/asserting sites. |

## Dropped findings (counts only)

- Below severity floor (iter 2, floor medium): 0
- Nitpick, by category: none
- Narrowed / partially dropped after verification (not below floor, not nitpick): Codex's F2 additionally cited `.claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md:8` as repeating the same workaround. Verified: that line's text ("Do not stall or ABORT on that — review from direct file reads...") is unchanged since before iter-1's head (confirmed via diff against `64024f8`), so it is outside this iteration's change surface — not re-raised as a fresh finding here, kept scoped to the newly-added correctness-memory bullet only.

## Verdict
CONCERNS: 3

## Next action
Relay the 3 kept findings to the dev for a review-fix round. #1 and #2 are the substantive ones (a type-validation gap in the just-added config-write guard, and a reviewer-memory instruction that contradicts the mandatory `QUESTION`-escalation rule it cites); #3 is a small doc-accuracy fix to a "sole home" claim that's now double-wrong after this iteration's own edit widened it. Iter-1 findings #2 and #4 are confirmed resolved and should not be re-raised in the next round.

Reference paths used: `.asd/sprints/012-retro-010-011-subsystem-docs/sprint.md`, `.asd/project/custom-common-rules.md`, `.asd/project/custom-coding-rules.md`, `.asd/project/commands.yaml`, `.asd/rules/providers.md`, `.asd/rules/sprint-lifecycle.md`, `.asd/templates/t_config.yaml`.
