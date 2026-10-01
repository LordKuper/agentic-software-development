[REVIEW-impl-external]: FAIL

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01
- **Severity floor (this iter)**: low

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | .asd/workflows/asd-phase-pr.md:10 | A PR merged before open mode's self-hosting version bump goes straight to merge mode. Its merge commit can contain the previous version. The existing tag and release then appear complete, so the sprint can be archived without its own release. | Check that the merge commit contains this sprint's version bump and CHANGELOG section before treating the release as complete. If it does not, stop with an actionable recovery path. |
| 2 | high | .asd/rules/git-strategy.md:82 | An annotated tag is created locally but its push fails. The retry sees no tag on origin and tries to create the same local tag again. Git rejects it, so the release retry is blocked. | When the remote tag is absent, reuse a local tag that points to the confirmed merge commit and push it. Create the tag only if it is also absent locally. |

(Codex ids: none. Codex severity labels were "high" for both, mapped to ASD high per the major→high rule.)

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): 0
- Nitpick, by category: none: 0

## Verdict
FAIL: 2

## Next action
The impl creator fixes both findings. Then re-run impl-review for wave 1 at iter-02 (severity floor medium).
approved change: findings 1 and 2 accepted for fix by the user (2026-09-30); 2 is deduplicated with combined #4
