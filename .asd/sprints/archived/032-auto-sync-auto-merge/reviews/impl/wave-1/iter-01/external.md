[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01
- **Severity floor (this iter)**: low
- **Unreviewed files**: none

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | .asd/skills/asd-sync/SKILL.md:25 | codex F1 (codex severity critical, calibrated down to medium). Step 3 queues ownership-marked `orphan` items for deletion with no question. `findOrphans` in `.asd/sync.js:1087-1105` checks only that the marker is present, not the body digest. A hand-edited generated file whose canonical source was removed is therefore deleted silently. The risk is bounded: the file is a marker-owned generated view, and those are read-only by contract. | Before queuing an orphan for deletion, check that its content still matches the generated body. Route a modified orphan through the same overwrite/keep/show-diff decision as `modified-foreign`. Add regression coverage. |
| 2 | medium | .asd/skills/asd-update/SKILL.md:52 | codex F2 (codex severity major, calibrated down to medium). The `never` rule forbids touching `AGENTS.md` and `CLAUDE.md`, while the update delegates mandatorily to `asd-sync`. `asd-sync` updates their managed blocks when `t_AGENTS.md` changes. The new exception covers only `asd-sync`'s owned-entry merge into `.claude/settings.json` and `.codex/hooks.json`. The skill's Outputs also omit the two root files. This is a self-contradictory obligation. | Extend the exception to cover `asd-sync`'s managed-block updates of `AGENTS.md` and `CLAUDE.md`, and list those two files in the skill's Outputs. |

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): 0
- Nitpick, by category: none

## Verdict
CONCERNS: 2

## Next action
Route both findings to review-fix (`asd-dev`) and re-dispatch impl-review for wave-1, iteration 2. Both locations are canon docs, with F1 needing a possible `sync.js` and test change.
