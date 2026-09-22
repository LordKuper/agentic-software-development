# External Review

External Review agent runs the wrapped CLI — Codex when running under Claude Code, Claude CLI when running under Codex (`.asd/rules/providers.md` § External review symmetry) — in parallel with internal reviewers during `design-review` and `impl-review`, merging findings into the common issue pool.

## Enablement

Controlled by `review.external_review` in config (`enabled` | `disabled`). If `disabled`: agent does nothing, no log entry.

## OS-specific invocation

OS read from the `external-preflight` output's `platform` (`process.platform`). Stdin syntax follows the shell that runs the command, not `platform` alone: Claude Code's run-command shell is POSIX bash on every OS (Git Bash on Windows); Codex's is PowerShell on `win32`.

Prompt passed via **heredoc/here-string straight into the wrapped CLI's stdin — never written to disk**. This agent runs read-only on both providers, so no step in the invocation may touch the filesystem. The wrapped CLI's own stdout is captured directly as its final message (the text verdict) — no `-o <out-file>`, no temp file, no cleanup step, because nothing was ever created on disk.

The command TAIL differs per wrapped CLI — this is a real syntax difference. Canonical tail per CLI, including explicit model, effort, and read-only boundary, lives once in the agent file's `wraps_invoke_args` (`asd-external-review.md` frontmatter) — not restated here.

`--allowedTools` alone is not a read-only boundary.

| Host, `platform` | Preflight | Review command |
|---|---|---|
| Codex, `win32` | runtime helper with direct arguments or its fixed PowerShell shim | `@'<rendered prompt + scope manifest>'@ \| <resolved-command> <wraps_invoke_args>` (here-string piped to stdin) |
| Claude Code, any; Codex, any other (`linux`, `darwin`) | runtime helper with direct arguments (fixed PowerShell shim allowed on `win32`) | `<resolved-command> <wraps_invoke_args> <<'EOF'` / `<rendered prompt + scope manifest>` / `EOF` (heredoc piped to stdin) |
Both forms read prompt+scope manifest from stdin; the wrapped CLI's own read-only filesystem tools resolve `files[]` content from the repo (never from the manifest bytes) — the command's own stdout is the final message text verdict. No `-o <out-file>` for either CLI.

`<wrapped-cli>` is `codex` under Claude Code / `claude` under Codex — command name on every OS (each ships a shell shim plus OS-specific wrappers on Windows; no compiled `.exe`). `<resolved-command>` is that default unless the config override (`system.tools.codex_command` under Claude, `system.tools.claude_command` under Codex) is non-empty, in which case it replaces the lookup path for both probe and review.

## Detection and negative cache

Before wrapper dispatch or scope manifest assembly, phase orchestration calls `node .asd/runtime.js external-preflight --input <json>`. Input supplies provider, strong wrapped model, resolved command, cache path — canonical, single value for every caller: `.asd/project/external-cache.json` (gitignored, machine-local retry/failure state, never committed) — and non-secret authentication generation or credential-file metadata reference; custom authentication arguments are rejected. The helper uses direct bounded process arguments, never a shell-interpolated command; on Windows it uses only a fixed PowerShell shim when direct executable lookup fails. It runs `--version`, then fixed `codex login status` or `claude auth status --json`; command/auth text is never persisted. `local-ready` means only that the executable and local authentication status were observed. Model access, quota, and reachability remain `unknown` until the first real review request.

On a real-request authentication, quota, reachability, or command failure, phase orchestration calls `node .asd/runtime.js external-record-failure --input <json>` with the preflight fingerprint and a finite retry-after of at most one hour. The cache stores only status and retry-after. Its identity binds the selected model, resolved command, fixed auth check, auth status, and non-secret auth generation; expiry or a changed identity restores an attempt. Preflight always reruns local executable and auth checks before honoring a negative cache. It never sends a paid probe.

On a non-ready preflight (command/auth failure) or an active negative cache — never on a failure after invocation (Outcome contract):

- Return `APPROVE (skipped: external review unavailable: <specific status>)`; the dispatching workflow persists the exact status in that iteration's `external.md` — its first-line token plus an `Unreviewed files` line naming the `files[]` the scope manifest would have carried ("Iteration semantics"), no other section — appends it to `<sprint>/decisions-log.md` for sprint `<NNN-slug>` iteration `<N>`, and appends an `F-N` friction entry for it (`sprint-lifecycle.md` "Friction log")
- Continue without external review, no user prompt

An availability skip satisfies only that iteration and never creates an APPROVE latch. A later local-ready result dispatches External Review normally.

## Outcome contract

Sole statement of what a dispatched External Review may return — exactly one of three outcomes:

- **verdict** — findings text whose first content line is `[REVIEW-<phase>-external]: APPROVE|CONCERNS|FAIL` (`review-policy.md` "Gate Verdict Format"), over every file or, after a stopped batch, over the completed batches ("Batching")
- **availability skip** — `APPROVE (skipped: external review unavailable: <specific status>)`, only on a non-ready preflight or an active negative cache (above)
- **partial** — `[REVIEW-<phase>-external]: APPROVE (partial: <n>/<m> files; <cause>)` ("Batching"), never attached to CONCERNS or FAIL. Like the skip, it satisfies only its own iteration, never creates an APPROVE latch, and carries the skip's persistence duties (decisions-log and `F-N` entry, above)

Nothing else. A failure after invocation with no completed batch — wrapped-CLI crash, hang, timeout, unusable output, the one permitted retry exhausted — is an interrupted dispatch, never a skip: the wrapper returns `external review interrupted: <cause>`. An authentication, quota, reachability or command cause is also recorded through `external-record-failure` (above), so the re-dispatch's preflight yields the skip. The wrapper awaits the wrapped CLI inside its own dispatch and never backgrounds it; no outcome means "started, still running". The contract scopes a dispatch that reached that invocation: a precondition missing before any invocation (prompt template absent) aborts the dispatch instead — a framework defect the orchestrator must see, never an availability skip.

An empty return, or prose carrying no outcome, is not permitted and is not a verdict. Its disposal, like the interrupted return's, is `review-policy.md` "Interrupted dispatch", imported here whole.

## Batching

`files[]` above `.asd/runtime.js` `SPLIT_THRESHOLD_FILES` is reviewed in sequential batches of that size, in manifest order, inside one dispatch; a scope at or below it is one batch. Each batch is one wrapped-CLI invocation over the manifest narrowed to that batch's `files[]`. `m` is the `files[]` count, `n` the files in completed batches. A batch failing after its one retry stops the dispatch; no later batch runs. On a stop:

- no completed batch → interrupted dispatch (Outcome contract)
- a completed batch holds a finding at or above floor → verdict over the completed batches
- otherwise → partial, `<cause>` naming the stopped batch's failure

## Phase-scoped payload

The reviewer has direct repo read access and fetches its own content — it is handed a **scope manifest** (`external-review/t_review-scope.json`), never a rendered diff. This is the SSoT for the manifest contract, and the External Review row of `review-policy.md` "Reviewer responsibility"; the agent and both review workflows link here rather than restating it.

Manifest fields: `phase`, `iteration`, `base_ref`, `head_ref` (impl-review only — see below), `files[]` (changed-path list), and `exclude_paths[]` (repo-relative pathspec exclusions on **review scope**: never listed in `files[]`, never a valid finding location, even if reachable another way). `exclude_paths[]` bounds what the reviewer judges, not what it may read — the prompt's named project-context reference paths (below) stay readable regardless and are never valid finding locations either. The reviewer resolves all content from the repo — never from manifest payload bytes.

Both phase workflows populate `files[]` = changed-path list at the reviewer's current, post-change working tree — this works identically for both wrapped CLIs regardless of git/shell tool access, since it needs only a file read, never a historical `git show`/`git diff`. For **impl-review only**, `base_ref`/`head_ref` also travel on the manifest so a wrapped CLI with its own git access (e.g. Codex `exec`, unrestricted shell under `--sandbox read-only`) may sharpen scope with `git diff <base_ref>..<head_ref> -- <file>` if it chooses; a wrapped CLI without shell access (Claude `-p --tools "Read,Grep,Glob"`, no Bash) reads current file content directly. design-review's manifest carries `base_ref`/`head_ref` as empty strings — its scope is drafts as they exist per iteration snapshot, not a commit range, so there is no ref to name.

| Phase | scope (`files[]`) | `exclude_paths` |
|---|---|---|
| design-review | sprint design drafts only — `<sprint>/design/**`, minus generated output (only the drafts that exist per `documents.*`) | `c4-full/dist/` |
| impl-review, `self_hosting: disabled` (consumer, default) | changed files anywhere in the repo, minus the exclusions — code and tests in practice | `.asd/**`, `docs/**` |
| impl-review, `self_hosting: enabled` (this repo) | changed files anywhere in the repo — everything here IS framework source (`sprint-lifecycle.md` "Self-hosting") | `.asd/project/**`, `.asd/sprints/**`, generated provider views per `sprint-lifecycle.md` "Self-hosting" |

Cross-phase reference material (concept, custom rules, accessibility baseline, prd/adr/stack/commands) travels as **paths only** in the rendered prompt (`t_prompt-external-{design,impl}.md` "project context"), never inside the scope manifest, never diffed. design-review scope never names source code; consumer-mode impl-review scope never names design/doc files (a doc-vs-code drift finding belongs to the internal Documentation reviewer). `exclude_paths` also keeps C4 schemas out of consumer impl-review: likec4 lives under `<sprint>/design/c4-full/` and `docs/architecture/c4/`.

**Generated output is always in `exclude_paths`.** `**/dist/**` (likec4 build), `design-system.html` — both derived from a source the reviewer already sees (`*.c4`, `DESIGN.md`). Review the source, not the build.

Both impl-review rows start from the whole repo and subtract the exclusions, never an allow-list — so any real source added later (CI configs, root-level configs, anything else) is in scope automatically, with no manifest or rule edit. Agent memory's status in both modes: `artifact-layout.md` "Agent memory".

## Iteration semantics

| Phase | Iteration | Manifest content |
|---|---|---|
| design-review | 1 | `files[]` = full set of in-scope draft paths (reviewer reads full current content), minus `c4-full/dist/` |
| design-review | 2+ | `files[]` = draft paths changed since previous iteration snapshot |
| impl-review | 1 | `files[]` = changed files on `<git.base_branch>...HEAD <exclude_paths>`, `base_ref`=`<git.base_branch>`, `head_ref`=`HEAD` |
| impl-review | 2+ | `files[]` = changed files on `<state.json reviews.impl.iteration_heads["iter-(N-1)"]>...HEAD <exclude_paths>`, `base_ref`=that sha, `head_ref`=`HEAD` |

Iteration 1 covers all sprint work in that phase; later iterations cover every commit since the sha recorded at the start of the previous iteration — not just the last commit, so a multi-commit review-fix cycle stays fully covered. Absent-key fallback (sprint in flight when `iteration_heads` shipped): `sprint-lifecycle.md` "State recovery" (sole SSoT). design-review persists a draft snapshot each iteration and computes its 2+ list from the previous one (`asd-phase-design-review.md` step 7 "Draft list").

**Unreviewed files.** A partial, skip or stopped-batch iteration lists the `files[]` it did not review — a skip: the whole scope it would have sent — as its `Unreviewed files` line in that iteration's `external.md` (`t_review-report.md`). The next iteration's `files[]` is the table row above unioned with that list.

Agent dispatched fresh each iteration (`review-policy.md` clean-context). Incremental manifest narrows *input*, not context.

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

Phase skill supplies the finding set of the latest earlier verdict iteration — partial and skip iterations are skipped — as explicit payload input (from iteration 2). Agent compares against that supplied set only — does not read prior `iter-*/` files.

If two consecutive verdict iterations produce an identical issue set (same files, lines, messages), agent emits `FAIL: stalemate after <N> iterations, identical findings` and escalates to user with options: accept findings as-is, override, abort sprint.

## Aggregation

External Review verdict counts as one reviewer in the DoD check. APPROVE from External Review required when `external_review: enabled`; a skip or partial satisfies its own iteration only (Outcome contract).
