# External Review

External Review agent runs Codex CLI in parallel with internal reviewers during both `design-review` and `impl-review` phases, merging findings into the common issue pool.

## Enablement

Controlled by `review.external_review` in config (`enabled` | `disabled`).

If `disabled`: agent does nothing, no log entry needed.

## OS-specific invocation

The OS is read from `system.os` in config (set by `/asd-init`).

| OS | Probe command | Review command |
|---|---|---|
| windows | `codex.exe --version` (PowerShell) | `codex.exe review --json --input <diff-file> --output <out-file>` |
| linux | `codex --version` (bash) | `codex review --json --input <diff-file> --output <out-file>` |
| macos | `codex --version` (bash) | `codex review --json --input <diff-file> --output <out-file>` |

If `system.codex_command` is set in config, it overrides the default command path for all OSes.

## Detection

At review phase start, External Review agent runs the probe. If it fails (non-zero exit, command not found):

- Append entry to `.asd/project/decisions-log.md`: `Codex CLI unavailable, external review skipped for sprint <NNN-slug> iter <N>`
- Continue without external review, no user prompt

## Iteration-aware diff

| Phase | Iteration | Diff source |
|---|---|---|
| design-review | 1 | full content of `<sprint>/design/` files |
| design-review | 2+ | per-file diff since previous iteration snapshot |
| impl-review | 1 | `git diff <git.base_branch>...HEAD` |
| impl-review | 2+ | `git diff` (uncommitted) plus the last commit (`git show HEAD`) |

Rationale: iteration 1 covers all sprint work in that phase; subsequent iterations cover only what changed since last review round. For design-review, the agent snapshots files at iteration N start and diffs at N+1.

## Output mapping

Codex JSON output mapped to ASD severity:

| Codex severity | ASD severity |
|---|---|
| blocker, critical | critical |
| major | high |
| minor | medium |
| info, suggestion | low |

Findings rendered to the review output dir supplied by the dispatching phase skill — `.asd/sprints/<NNN-slug>/reviews/design/iter-NN/external.md` during design-review, `.asd/sprints/<NNN-slug>/reviews/impl/iter-NN/external.md` during impl-review — using the standard verdict format from `review-policy.md`.

## Stalemate detection

If two consecutive iterations produce an identical issue set (same files, lines, messages), External Review agent:

- Emits `FAIL: stalemate after <N> iterations, identical findings`
- Escalates to user with options: accept findings as-is, override, abort sprint

## Aggregation

External Review verdict counts as one reviewer in the DoD check. APPROVE from External Review is required when `external_review: enabled`.
