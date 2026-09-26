[REVIEW-impl-external]: FAIL

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01
- **Severity floor (this iter)**: low
- **Unreviewed files**: none

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | .asd/workflows/asd-phase-impl.md:60 (step 5, "fix modes" bullet) | The new clause "A memory finding's owner (step 3) runs last, the same way" is singular: it never says how several *distinct* memory-finding owners in one round are sequenced. This is not theoretical for this repo, because this diff's own scope manifest lists memory findings under four different owner dirs (`asd-dev-critical`, `asd-reviewer-documentation`, `asd-reviewer-testing`, `asd-tester-critical`). `review-policy.md` "Autofix vs escalation" (Memory-fix dispatch) is equally singular. Neither canon location says whether each owner gets its own sequential memory-fix dispatch after the dev/tester chain, or how ordering and collisions across owners are resolved. | Add one clause to step 5 (or the memory-fix dispatch bullet in review-policy.md) stating the ordering rule for multiple owners in one round, e.g. "one memory-fix dispatch per distinct owner, run sequentially after the dev/tester chain, in finding-id order" — the same one-at-a-time pattern already used for the dev→tester handoff. |
| 2 | medium | .asd/runtime.js:520-523 (`retroCandidates`, deferred-candidate branch) | For a `deferred` backlog row, the returned `acts_on` comes from the backlog entry (`entry.acts_on`), not from the re-parsed source retro row (`source.acts_on`), although `home` in the same object does come from `source`. If a backlog row's `Acts on` cell is hand-edited or otherwise drifts from its retro row, intake silently offers or withholds it under the wrong acting side (it could surface an `asd` row to a consumer project, or the reverse) with no validation catching the mismatch. | Either validate `entry.acts_on === source.acts_on` (fail loudly on drift, consistent with `backlogRows`' other validations) or use `source.acts_on` directly, matching how `home` is already sourced. |

Dropped as out of scope (not a floor or nitpick drop, noted separately): codex's third item (`.asd/rules/git-strategy.md:41`, the compound command claimed incompatible with PowerShell 5.1 `&&`) targets an unchanged line. The diff only adds a nearby bullet that references the existing command, so previously correct content was not made incorrect (`review-policy.md` "Scope hand-off").

## Dropped findings (counts only)
- Below severity floor (iter 1, floor low): 0
- Nitpick, by category: none: 0
- Out-of-scope (pre-existing, not made incorrect by this diff): 1

## Verdict
FAIL: 2

## Next action
Route to `impl` review-fix mode. Finding 1 needs a rule edit to `asd-phase-impl.md` step 5 (and/or `review-policy.md`'s Memory-fix dispatch bullet) specifying how several owners are sequenced. Finding 2 needs `retroCandidates`'s deferred branch to validate `acts_on` against the re-parsed retro row, or take it from that row, instead of trusting the backlog copy.

---
Invocation notes: `codex exec --model gpt-6-sol -c model_reasoning_effort="high" --sandbox read-only -`, run in the foreground. The prompt and scope-manifest/diff paths went in via heredoc stdin only, and the review text was captured from stdout (no disk writes by the agent). Preflight was `local-ready`. Iteration 1: no prior finding set, no stalemate check.

User decision (step 8 FAIL escalation, 2026-09-26): accept #1 and #2 for fix (#2 merges with efficiency EFF-1).
