# External Review

External Review agent runs the wrapped CLI — Codex when running under Claude Code, Claude CLI when running under Codex (`.asd/rules/providers.md` § External review symmetry) — in parallel with internal reviewers during `design-review` and `impl-review`, merging findings into the common issue pool.

## Enablement

Controlled by `review.external_review` in config (`enabled` | `disabled`). If `disabled`: agent does nothing, no log entry.

## OS-specific invocation

OS read from `system.os` in config (set by `/asd-init`).

Prompt passed via **heredoc/here-string straight into the wrapped CLI's stdin — never written to disk**. This agent runs read-only on both providers, so no step in the invocation may touch the filesystem. The wrapped CLI's own stdout is captured directly as its final message (the text verdict) — no `-o <out-file>`, no temp file, no cleanup step, because nothing was ever created on disk.

The command TAIL differs per wrapped CLI — this is a real syntax difference. Canonical tail per CLI, including explicit model, effort, and read-only boundary, lives once in the agent file's `wraps_invoke_args` (`asd-external-review.md` frontmatter) — not restated here.

The tails were verified against local Codex CLI 0.150.1 (`exec --help`: `--model`, `--config`, `--sandbox`) and Claude CLI 2.1.250 (`--help`: `--model`, `--effort`, `--restricted`, `--tools`, `--strict-mcp-config`, `--disable-slash-commands`, `--no-session-persistence`), and Anthropic's CLI reference for print/model/tool flags. `--allowedTools` alone is not a read-only boundary.

| OS | Preflight | Review command |
|---|---|---|
| windows | runtime helper with direct arguments or its fixed PowerShell shim | `@'<rendered prompt + diff payload>'@ \| <resolved-command> <wraps_invoke_args>` (here-string piped to stdin) |
| linux | runtime helper with direct arguments | `<resolved-command> <wraps_invoke_args> <<'EOF'` / `<rendered prompt + diff payload>` / `EOF` (heredoc piped to stdin) |
| macos | runtime helper with direct arguments | same as linux |

Both forms read prompt+diff from stdin; the command's own stdout is the final message text verdict. No `-o <out-file>` for either CLI.

`<wrapped-cli>` is `codex` under Claude Code / `claude` under Codex — command name on every OS (each ships a shell shim plus OS-specific wrappers on Windows; no compiled `.exe`). `<resolved-command>` is that default unless the config override (`system.tools.codex_command` under Claude, `system.tools.claude_command` under Codex) is non-empty, in which case it replaces the lookup path for both probe and review.

## Detection and negative cache

Before wrapper dispatch or diff assembly, phase orchestration calls `node .asd/runtime.js external-preflight --input <json>`. Input supplies provider, strong wrapped model, resolved command, cache path, and non-secret authentication generation or credential-file metadata reference; custom authentication arguments are rejected. The helper uses direct bounded process arguments, never a shell-interpolated command; on Windows it uses only a fixed PowerShell shim when direct executable lookup fails. It runs `--version`, then fixed `codex login status` or `claude auth status --json`; command/auth text is never persisted. `local-ready` means only that the executable and local authentication status were observed. Model access, quota, and reachability remain `unknown` until the first real review request.

On a real-request authentication, quota, reachability, or command failure, phase orchestration calls `node .asd/runtime.js external-record-failure --input <json>` with the preflight fingerprint and a finite retry-after of at most one hour. The cache stores only status and retry-after. Its identity binds the selected model, resolved command, fixed auth check, auth status, and non-secret auth generation; expiry or a changed identity restores an attempt. Preflight always reruns local executable and auth checks before honoring a negative cache. It never sends a paid probe.

On command/auth failure or an active negative cache:

- Return `APPROVE (skipped: external review unavailable: <specific status>)`; the dispatching workflow persists the exact status in the external review output and appends it to `<sprint>/decisions-log.md` for sprint `<NNN-slug>` iteration `<N>`
- Continue without external review, no user prompt

An availability skip satisfies only that iteration and never creates an APPROVE latch. A later local-ready result dispatches External Review normally.

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
| impl-review | 2+ | `git diff <state.json reviews.impl.iteration_heads["iter-(N-1)"]>...HEAD <pathspec>` |

Iteration 1 covers all sprint work in that phase; later iterations cover every commit since the sha recorded at the start of the previous iteration — not just the last commit, so a multi-commit review-fix cycle stays fully covered. Absent-key fallback (sprint in flight when `iteration_heads` shipped): `sprint-lifecycle.md` "State recovery" (sole SSoT). design-review persists a file snapshot each iteration; next iteration reads it to compute its diff.

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
