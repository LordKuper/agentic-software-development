# External Review

External Review agent runs Codex CLI in parallel with internal reviewers during `design-review` and `impl-review`, merging findings into the common issue pool.

## Enablement

Controlled by `review.external_review` in config (`enabled` | `disabled`). If `disabled`: agent does nothing, no log entry.

## OS-specific invocation

OS read from `system.os` in config (set by `/asd-init`).

Prompt passed via **temp file**, not inline: agent writes rendered prompt template + diff payload concatenated to `<in-file>` = `<sprint>/reviews/<design|impl>/iter-NN/codex-input.tmp`, pipes it to Codex stdin, deletes it after the run. `<out-file>` = Codex final message (text verdict per prompt), parsed by agent.

| OS | Probe | Review command |
|---|---|---|
| windows | `codex --version` (PowerShell) | `Get-Content <in-file> -Raw \| codex exec -o <out-file> -` |
| linux | `codex --version` (bash) | `cat <in-file> \| codex exec -o <out-file> -` |
| macos | `codex --version` (bash) | `cat <in-file> \| codex exec -o <out-file> -` |

`codex exec -` reads prompt+diff from stdin; `-o <out-file>` writes Codex final message to file. No `--json` — prompt yields text verdict, not event stream.

Command is `codex` on every OS (npm ships a shell shim plus `codex.cmd`/`codex.ps1` on Windows; there is no `codex.exe`). `system.tools.codex_command` in config overrides that path.

## Detection

At review phase start, agent runs the probe. On failure (non-zero exit, command not found):

- Append to `decisions-log.md`: `Codex CLI unavailable, external review skipped for sprint <NNN-slug> iter <N>`
- Continue without external review, no user prompt

## Phase-scoped payload

Diff payload carries only what the phase reviews. Cross-phase artifacts, when needed, go in as **reference paths** (read-only context), never as diff.

| Phase | Diff payload | Reference (paths only, not diffed) |
|---|---|---|
| design-review | sprint design drafts only — `<sprint>/design/**`, minus generated output | concept, custom rules, accessibility baseline |
| impl-review | code and tests only — `.asd/**` and `design/**` excluded | prd.html, adr.html, stack, custom rules, commands |

design-review payload never contains source code; impl-review payload never contains design/doc diffs (a doc-vs-code drift finding belongs to the internal Documentation reviewer). Both exclusions also keep C4 schemas out of impl-review: likec4 lives under `<sprint>/design/c4-full/` and `design/architecture/c4/`.

**Generated output never enters any payload.** Excluded everywhere: `**/dist/**` (likec4 build), `design-system.html`, `architecture.html` — all derived from a source the reviewer already sees (`*.c4`, `DESIGN.md`, `subsystems.yaml`). Review the source, not the build.

`<pathspec>` for impl-review: `-- . ':(exclude).asd/**' ':(exclude)design/**'`

## Iteration-aware diff

| Phase | Iteration | Diff source |
|---|---|---|
| design-review | 1 | full content of `<sprint>/design/` files, minus `c4-full/dist/` |
| design-review | 2+ | per-file diff since previous iteration snapshot |
| impl-review | 1 | `git diff <git.base_branch>...HEAD <pathspec>` |
| impl-review | 2+ | `git diff <pathspec>` (uncommitted) plus last commit (`git show HEAD <pathspec>`) |

Iteration 1 covers all sprint work in that phase; later iterations cover only changes since the last round. design-review persists a file snapshot each iteration; next iteration reads it to compute its diff.

Agent dispatched fresh each iteration (`review-policy.md` clean-context). Incremental diff narrows *input*, not context.

## Output mapping

Codex severity terms in `<out-file>` mapped to ASD severity:

| Codex | ASD |
|---|---|
| blocker, critical | critical |
| major | high |
| minor | medium |
| info, suggestion | low |

Findings rendered to the review output dir supplied by the dispatching phase skill (`reviews/design/iter-NN/external.md` or `reviews/impl/iter-NN/external.md`), using verdict format from `review-policy.md`.

## Stalemate detection

Phase skill supplies previous iteration's finding set as explicit payload input (from iteration 2). Agent compares against that supplied set only — does not read prior `iter-*/` files.

If two consecutive iterations produce an identical issue set (same files, lines, messages), agent emits `FAIL: stalemate after <N> iterations, identical findings` and escalates to user with options: accept findings as-is, override, abort sprint.

## Aggregation

External Review verdict counts as one reviewer in the DoD check. APPROVE from External Review required when `external_review: enabled`.
