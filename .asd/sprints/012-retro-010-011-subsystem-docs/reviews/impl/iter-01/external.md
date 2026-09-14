[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: 1
- **Severity floor (this iter)**: low
- **Scope manifest**: [external.scope.json](./external.scope.json)

Wrapped CLI: Codex (`codex exec --model gpt-5.6-sol -c model_reasoning_effort="high" --sandbox read-only -`), scope = self-hosting row (41 files, `main..64024f8`). Every kept finding below was independently re-verified against current file content (line citations checked, not trusted from Codex's output) before being kept; one Codex finding (F3) was dropped after verification because it mischaracterizes an unused legacy code path as a live contract violation.

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `.asd/skills/asd-init/SKILL.md:62` (step 13) vs `.asd/rules/sprint-lifecycle.md:169` ("Audit phase" subsystem registry) and `.asd/rules/artifact-layout.md:98` | `/asd-init` fresh-mode step 13 unconditionally seeds an **empty** `docs/architecture/subsystems.md` whenever decomposition is enabled and the file is absent — including on a brownfield repo (fresh mode covers both greenfield and brownfield per step 1). Audit's brownfield subsystem-discovery proposal only triggers "when the registry is absent" (file does not exist). Since init already guarantees the file exists (empty) before any sprint runs, audit's absence check can never fire — brownfield subsystem discovery is dead code, defeating the discovery path the registry feature depends on. | Either have init seed the registry only in the detected-greenfield branch, or change audit's trigger condition from "file absent" to "registry has zero entries", so an empty-but-present file still qualifies for discovery. |
| 2 | medium | `.asd/skills/asd-init/SKILL.md:150` (Return contract) vs Workflow (sprint-mediated), lines 86-94 | The single mandatory return-contract line requires `MODE: <greenfield\|brownfield>` and `TOOLS: likec4=<ok\|missing\|skip\|n/a> designmd=<ok\|missing\|skip>` for every `INIT:` invocation, but sprint-mediated mode (steps 1-5) never runs greenfield/brownfield detection and only re-probes tools when a declared pair touches `review.external_review`/`system.tools`. `system.tools.likec4` is a path string and `designmd` a plain boolean in `t_config.yaml` — neither is stored in the `ok\|missing\|skip` vocabulary the contract line demands, so a sprint-mediated return cannot honestly populate these fields most of the time. | Add an explicit sprint-mediated variant of the return line (drop MODE/DIAGRAM/TOOLS, or define what value each carries when not freshly probed — e.g. `n/a` or "last known"). |
| 3 | medium | `.asd/templates/external-review/t_prompt-external-design.md:97` vs `.asd/rules/external-review.md:88-92` (Severity mapping, sole SSoT) | The design-review prompt tells the wrapped CLI to self-map its findings to the ASD target scale ("critical / high / medium / low") before returning them. The wrapper's only defined severity mapping takes the *source* vocabulary (`blocker, critical, major, minor, info, suggestion`) as input; `high`/`medium`/`low` are output-only tokens with no mapping rule as input. A design-review dispatch that follows its own prompt literally hands this agent tokens its mapping table doesn't recognize. The impl prompt does not have this problem — it correctly asks for the source vocabulary. | Change the design prompt's closing line to request the same source vocabulary the mapping table and the impl prompt use (`blocker/critical/major/minor/info`), dropping the "map to ASD scale" instruction — mapping is this agent's job, not the wrapped CLI's. |
| 4 | low | `.asd/workflows/asd-phase-impl.md:83` (step 8 opening sentence) | Step 8 ("Declared settings change") is numbered after step 7 ("wait all task signals"), but its own text requires the settings-change dispatch to happen "when wave 1 opens, before any dispatch" — i.e., before step 6, not after step 7. The doc elsewhere marks an out-of-band trigger point with a lettered sub-step (5a, for route-task inside step 6's loop); this same pattern isn't used here, so a reader following steps 6→7→8 in numeric order could misplace the settings-change dispatch after task completion instead of before wave 1 opens. Text is authoritative and unambiguous on a close read, so this is a structural-clarity issue, not a functional break. | Either renumber as a sub-step near step 5/6 (e.g. `5b`), or add an explicit forward/back-reference note at step 6 pointing to the step-8 clause so the two don't read as sequential. |

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): 0
- Nitpick, by category: none
- Verified-incorrect / miscalibrated (not below floor, not nitpick — dropped after independent verification): 1 — Codex's F3 claimed `manifest-digest --write` (`.asd/runtime.js:399`) "contradicts the immutable-manifest rule" in `review-policy.md`. Verified: this CLI path is legacy, superseded by `emit-manifest` (confirmed via `.claude/agent-memory/asd-tester-critical/project_testability-envelope.md` "Retired mechanism" and `tests/run.js:4259`, which asserts no canon doc still instructs hand-stamping via this flag against a dispatched manifest). It remains only for direct fixture-stamping in unit tests (`tests/run.js:2461-2488`), never invoked by any workflow against a dispatched manifest — not a live contract violation.

## Verdict
CONCERNS: 4

## Next action
Relay the 4 kept findings to the dev for a review-fix round. #1 and #2 are the substantive ones (a dead brownfield-discovery path and an underspecified return contract for a real invocation mode); #3 is a small prompt-template wording fix; #4 is optional documentation-clarity polish and can be deferred without blocking if the round is scoped tightly.

Reference paths used: `.asd/sprints/012-retro-010-011-subsystem-docs/sprint.md`, `.asd/project/custom-common-rules.md`, `.asd/project/custom-coding-rules.md`, `.asd/project/commands.yaml`.
