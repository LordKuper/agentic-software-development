# External Review

External Review agent runs the wrapped CLI — Codex when running under Claude Code, Claude CLI when running under Codex (`.asd/rules/providers.md` § External review symmetry) — in parallel with internal reviewers during `design-review` and `impl-review`, merging findings into the common issue pool.

## Enablement

Controlled by `review.external_review` in config (`enabled` | `disabled`). If `disabled`: agent does nothing, no log entry.

## OS-specific invocation

OS read from `system.os` in config (set by `/asd-init`).

Prompt passed via **heredoc/here-string straight into the wrapped CLI's stdin — never written to disk**. This agent runs read-only on both providers (`codex.sandbox_mode: read-only`, Claude's `tools` drop `Write`), so no step in the invocation may touch the filesystem. The wrapped CLI's own stdout is captured directly as its final message (the text verdict) — no `-o <out-file>`, no temp file, no cleanup step, because nothing was ever created on disk.

The command TAIL differs per wrapped CLI — this is a real syntax difference (each CLI's own non-interactive/scripted mode takes different arguments), not just a binary-name swap:

- Wrapping **Codex** (running under Claude Code): `codex exec -` — `exec` is Codex's non-interactive subcommand; `-` reads the entire prompt+diff from stdin as the task, no separate instruction argument needed.
- Wrapping **Claude CLI** (running under Codex): `claude -p "Follow the review instructions and diff payload provided via stdin above; output only the review report in the required format." --output-format text` — Claude Code CLI has no `exec` subcommand; `-p`/`--print` is its non-interactive mode and always takes an instruction argument, with piped stdin treated as additional context alongside it (`--output-format text` is the default but stated explicitly to guarantee plain text, not JSON).

| OS | Probe | Review command |
|---|---|---|
| windows | `<wrapped-cli> --version` (PowerShell) | `@'<rendered prompt + diff payload>'@ \| <wrapped-cli> <tail above>` (here-string piped to stdin) |
| linux | `<wrapped-cli> --version` (bash) | `<wrapped-cli> <tail above> <<'EOF'` / `<rendered prompt + diff payload>` / `EOF` (heredoc piped to stdin) |
| macos | `<wrapped-cli> --version` (bash) | same as linux |

Both forms read prompt+diff from stdin; the command's own stdout is the final message text verdict. No `-o <out-file>` for either CLI.

`<wrapped-cli>` is `codex` under Claude Code / `claude` under Codex — command name on every OS (each ships a shell shim plus OS-specific wrappers on Windows; no compiled `.exe`). The config override (`system.tools.codex_command` under Claude, `system.tools.claude_command` under Codex) replaces that lookup path.

## Detection

At review phase start, agent runs the probe. On failure (non-zero exit, command not found):

- Return a skip note; the dispatching workflow appends it to `<sprint>/decisions-log.md`: `<wrapped-cli> CLI unavailable, external review skipped for sprint <NNN-slug> iter <N>`
- Continue without external review, no user prompt

## Phase-scoped payload

Diff payload carries only what the phase reviews. Cross-phase artifacts, when needed, go in as **reference paths** (read-only context), never as diff.

| Phase | Diff payload | Reference (paths only, not diffed) |
|---|---|---|
| design-review | sprint design drafts only — `<sprint>/design/**`, minus generated output (only the drafts that exist per `documents.*`) | concept, custom rules, accessibility baseline |
| impl-review, `self_hosting: disabled` (consumer, default) | code and tests only — `.asd/**` and `docs/**` excluded | prd.html (if enabled), adr.html (if enabled), stack, custom rules, commands |
| impl-review, `self_hosting: enabled` (this repo) | everything in the repo IS framework source (`sprint-lifecycle.md` "Self-hosting") — the whole diff, minus `.asd/project/**`, `.asd/sprints/**`, generated `.claude/**`/`.codex/**`/`.agents/skills/**` | sprint.md, custom rules, commands |

design-review payload never contains source code; consumer-mode impl-review payload never contains design/doc diffs (a doc-vs-code drift finding belongs to the internal Documentation reviewer). Both exclusions also keep C4 schemas out of consumer impl-review: likec4 lives under `<sprint>/design/c4-full/` and `docs/architecture/c4/`.

**Generated output never enters any payload.** Excluded everywhere: `**/dist/**` (likec4 build), `design-system.html`, `architecture.html` — all derived from a source the reviewer already sees (`*.c4`, `DESIGN.md`, `subsystems.yaml`). Review the source, not the build.

`<pathspec>` for impl-review: `self_hosting: disabled` → `-- . ':(exclude).asd/**' ':(exclude)docs/**'`; `self_hosting: enabled` → `-- . ':(exclude).asd/project/**' ':(exclude).asd/sprints/**' ':(exclude).claude/**' ':(exclude).codex/**' ':(exclude).agents/skills/**'` — starts from the whole repo, not an allow-list, so any real framework source (CI configs, root-level configs, anything else added later) is included automatically without needing a matching pathspec edit

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

Wrapped-CLI severity terms in the captured stdout mapped to ASD severity:

| Wrapped CLI | ASD |
|---|---|
| blocker, critical | critical |
| major | high |
| minor | medium |
| info, suggestion | low |

Findings rendered to the review output dir supplied by the dispatching phase skill (`reviews/design/iter-NN/external.md` or `reviews/impl/iter-NN/external.md`), using verdict format from `review-policy.md`. Dropped findings (below severity floor, nitpick) are never rendered as per-finding rows — only a count per category, per `t_review-report.md`; nothing downstream reads a dropped finding's detail.

## Stalemate detection

Phase skill supplies previous iteration's finding set as explicit payload input (from iteration 2). Agent compares against that supplied set only — does not read prior `iter-*/` files.

If two consecutive iterations produce an identical issue set (same files, lines, messages), agent emits `FAIL: stalemate after <N> iterations, identical findings` and escalates to user with options: accept findings as-is, override, abort sprint.

## Aggregation

External Review verdict counts as one reviewer in the DoD check. APPROVE from External Review required when `external_review: enabled`.
