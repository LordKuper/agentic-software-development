[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: 4
- **Severity floor (this iter)**: high
- **Scope manifest**: [external.scope.json](./external.scope.json)

Wrapped CLI: Codex (`codex exec --model gpt-5.6-sol -c model_reasoning_effort="high" --sandbox read-only -`), incremental scope = self-hosting row (6 files, `b389e4d..2f346cf`). Both kept findings independently re-verified against current file content before being kept.

**Prior-iteration (iter-3) disposition, re-verified fresh:**
- #1 (asd-init FAILED halt path) — **partially fixed**: `asd-phase-impl.md:63` now states "on `FAILED`, halt as a blocker before any of that wave's dispatch" and the blocker list at line 37 admits `asd-init` sprint-mediated `FAILED`. But the new `tests/run.js:4411` assertion only checks `applyLine.includes('\`FAILED\`')` — a future edit changing the line to e.g. "on `FAILED`, log and continue" would still pass since the substring `FAILED` remains. Reported fresh as F1.
- #2 (un-enumerated string fields) — **confirmed fixed**: `tests/run.js:4372-4399` now derives every leaf of `t_config.yaml`, asserts every free-form string field (only 5: `system.tools.likec4`, `system.tools.codex_command`, `system.tools.claude_command`, `git.base_branch`, `git.branch_pattern`) is deliberate, that every enumerated field's default value is a member of its own enumeration, that described values above a field match its enumeration, and that README's config-schema mirror agrees with `t_config.yaml`'s enumerations. Verified via Read.

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | tests/run.js:4411 | Assertion `applyLine.includes('\`FAILED\`'))` only checks the word `FAILED` is present on the apply line, not that it triggers a halt — an edit reversing the halt semantics (e.g. "on `FAILED`, continue dispatching") still contains the substring `FAILED` and would pass, so the test does not enforce the halt-before-dispatch behavior end to end. | Assert the halt semantics specifically (e.g. require `halt` co-occurring with `FAILED` on the line, or match the exact clause `on \`FAILED\`, halt`), and add a mutation-style negative check confirming a line without halt wording fails the assertion. |
| 2 | high | .claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md:46-47 | New line asserts "Documentation economy's reach lists canon and sprint artifacts, not agent memory — never raise memory bloat as an economy finding," but `artifact-layout.md` "Documentation economy" reach clause covers "every artifact a later agent reads," and the adjacent "Agent memory" section (line 88) states the identical re-paid-per-dispatch rationale documentation economy is built on ("re-paid on every dispatch that loads it" vs "paid again per dispatch until a review catches it") — the memory line instructs the Documentation reviewer to skip applying a mandatory canon rule to a category of artifact canon's own rationale reaches. | Delete lines 46-47, or narrow the claim to cite the specific canon text that actually excludes agent memory from documentation-economy's reach (none was found in `artifact-layout.md`) rather than asserting an exclusion the SSoT does not state. |

## Dropped findings (counts only)

- Below severity floor (iter 4, floor high): 0
- Nitpick, by category: none

## Verdict
CONCERNS: 2

## Next action
Dev fixes F1 (strengthen the halt-behavior test at `tests/run.js:4411` beyond a substring check) and F2 (remove or correctly narrow the documentation-economy exclusion claim in `feedback_no-shell-doc-review-method.md:46-47`, since it currently instructs the Documentation reviewer to skip a check canon's reach clause does not exempt). Re-dispatch impl-review iter-05.
