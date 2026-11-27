# External Review

External Review runs a separate CLI alongside the internal reviewers during `design-review` and `impl-review`, merging findings into the common issue pool.

## Enablement

`review.external_review` controls the review. `disabled` produces no call or log entry. When enabled, Claude Code runs Codex; Codex runs Claude CLI with an empty `review.codex_profile` or a separate `codex exec` with the named local profile when set. The primary Codex session keeps its own provider and model. An unavailable selected profile produces an explicit availability skip for that route.

## OS-specific invocation

Select the invocation row with `external-preflight`'s wrapper `host` and Node `platform`. Claude Code uses POSIX Bash, including Git Bash on Windows. Codex uses PowerShell on `win32`.

The rendered prompt alone reaches the wrapped CLI's stdin: under Codex by **here-string/heredoc, never written to disk**; under Claude Code from one scratch file, `<scratch-dir>/<NNN-slug>-external-<phase>-<iteration id, "/" as "-">.prompt.md` (`<scratch-dir>`: the directory of `payload.inputs.context`, `artifact-layout.md` "Scratch directory"), written with the file-write operation, redirected into stdin and deleted after the run, pass or fail. That file is the sole filesystem write of the invocation. The scope manifest travels by path, never in the prompt — the prompt names the review output dir's `external.scope.json`, which `emit-manifest` already wrote ("Phase-scoped payload"). The wrapped CLI's own stdout is captured directly as its final message (the text verdict) — no `-o <out-file>`.

Use `preflight.route.command` as the executable and splat `preflight.route.args` as literal arguments for a named profile. Use the agent file's rendered `wraps_invoke_args` for the default route. Both forms specify the model, effort and read-only boundary. The table shows the default argument tail as a placeholder.

`--allowedTools` alone is not a read-only boundary.

| Host, `platform` | Preflight | Review command |
|---|---|---|
| Codex, `win32` | runtime helper with direct arguments or its fixed PowerShell shim | `@'<rendered prompt>'@ \| <resolved-command> <wraps_invoke_args>` (here-string piped to stdin) |
| Claude Code, any | runtime helper with direct arguments (fixed PowerShell shim allowed on `win32`) | `<resolved-command> <wraps_invoke_args> < <prompt file>`, then delete the file |
| Codex, any other (`linux`, `darwin`) | runtime helper with direct arguments | `<resolved-command> <wraps_invoke_args> <<'EOF'` / `<rendered prompt>` / `EOF` (heredoc piped to stdin) |

All forms read the rendered prompt from stdin; the wrapped CLI's own read-only filesystem tools read `external.scope.json` first, then resolve `files[]` and `diff` content from the repo (never from the manifest bytes) — the command's own stdout is the final message text verdict. No `-o <out-file>` for either CLI.

The selected CLI's nonempty `system.tools.codex_command` or `system.tools.claude_command` overrides its default lookup for both probe and review.

## Detection and negative cache

Before wrapper dispatch or scope manifest emission, call `node .asd/runtime.js external-preflight --input <json>`. Supply wrapper `host` (`claude` or `codex`), `codexProfile` from `review.codex_profile`, `codexCommand` and `claudeCommand` from `system.tools`, and `cachePath` (`external-cache.json` under `scratch-dir`). Input may carry a non-secret `authGeneration` or a `credentialPath` for file metadata. Pass the result with `host`, `platform` and `route` to the wrapper unchanged. `route.provider` names the wrapped CLI. A resolved Codex profile also carries `route.model_provider`.

Preflight runs a bounded local `--version` probe, using a fixed PowerShell shim on Windows if direct lookup fails. Default routes also run fixed `codex login status` or `claude auth status --json`. A named profile requires Codex 0.134.0 or later and a readable `<name>.config.toml` in `CODEX_HOME` (default `~/.codex`). Define `model_provider`, `model` and `model_reasoning_effort` as quoted top-level strings in that file. Preflight checks those fields and pins them in the subprocess arguments so project settings cannot shadow them. It reports `profile-unavailable`, `profile-invalid` or `profile-cli-unsupported` when the selected route fails these checks. `local-ready` for a profile confirms the CLI and profile checks only. Credentials, model access, quota and reachability are established on an actual review request. Keep profile credentials in the provider's local credential environment or store.

On a real-request `authentication`, `account-hold`, `quota`, `reachability`, or `command` failure, call `node .asd/runtime.js external-record-failure --input <json>` with the preflight fingerprint and the provider's reported reset as retry-after. The runtime caps retry-after at one hour and uses one hour when no reset was reported. The cache stores only status and retry-after under a fingerprint of the command, model, local auth status and non-secret generation, with profile routing and file metadata for profile routes. Expiry or changed identity restores an attempt. Preflight reruns local checks before honoring a negative cache and sends no inference request.

For an availability skip ("Outcome contract"), persist the skip token and `Unreviewed files` line in that iteration's `external.md` via `persist-review` (`review-policy.md` "Coverage ledger"). Use the dispatched manifest's `files[]` when present, else the same scope assembled with `--scope-only` ("Iteration semantics"). Include the wrapped CLI and, when resolved, its model provider and model in the skip reason alongside the status and cached cause. Log the same reason with sprint/iteration id in `decisions-log.md` and an `F-N` in the friction log. Keep raw provider diagnostics, command arguments and credentials out of those records. Continue without a user prompt and dispatch normally on a later ready preflight.

## Outcome contract

- **Verdict:** the findings over the whole `files[]` begin `[REVIEW-<phase>-external]: APPROVE|CONCERNS|FAIL` (`review-policy.md` "Gate Verdict Format").
- **Availability skip:** `APPROVE (skipped: external review unavailable: <specific status>)` on non-ready preflight (including negative cache) or explicit account hold. Counts for that iteration alone and never creates an APPROVE latch.
- **Account hold:** on a failed invocation with an explicit provider denial that the account is on hold, stop immediately and return `external review interrupted: account-hold`. The orchestrator records `account-hold` against the fingerprint and persists the availability skip with the full manifest scope in that iteration. Neither the CLI invocation nor its wrapper is retried for this denial.
- **Interrupted dispatch:** any other real invocation failure after its one retry returns `external review interrupted: <cause>`. Record recognized provider causes with `external-record-failure` before re-dispatch preflight to surface cached unavailability. Handle retries and empty or unclassified returns via `review-policy.md` "Interrupted dispatch".
- **Missing precondition:** abort before invocation, e.g. on an absent prompt template. Surface the framework defect to the orchestrator.

Run the read-only wrapped CLI once over all `files[]` with at most one retry. Never split or batch the scope. Impl-review waves bound size (`sprint-lifecycle.md` "Review iteration counters"). Run in the foreground with a timeout of at least 10 minutes (`timeout: 600000` on Claude Code Bash) and capture stdout directly ("OS-specific invocation"). Await completion inside the dispatch, including host background completion notifications. Keep PID polling out of payloads and agent memory.

## Phase-scoped payload

External Review gets the hand-off every reviewer gets — list, diff file, whole files as context (`review-policy.md` "Scope hand-off", not restated here); this section holds only its External-specific form. The wrapper's dispatch payload is the reviewer payload object (`review-policy.md` "Clean-context review iteration"), `manifest` naming `external.scope.json`. `node .asd/runtime.js emit-manifest --reviewer external --iteration <N> [--wave <K>]` (impl-review: `--wave` and a range required) writes `external.scope.json` per `external-review/t_review-scope.json` plus its diff file into the review output dir — no rubric, no ledger. The prompt names the manifest by path; the wrapped CLI reads it first, then `files[]` and the `diff` file from the repo with its own read-only tools, never content from the manifest bytes, and never computes a diff itself.

Manifest fields: `phase`; `iteration`; `wave` (impl-review only); `files[]`; `diff` — the diff file's path, `null` at design-review iteration 1. The diff file sits under `<sprint>/reviews/`, outside every scope below, so the prompt names it as readable context — never a finding location.

The runtime applies these exclusions to the union of `--files` and `--full-files` before writing the list or building its patch, including rename sources. Pass `--self-hosting` in self-hosting impl-review. For an availability skip use the same phase, reviewer, mode and file inputs with `emit-manifest --scope-only`; its stdout supplies `files[]` without writing a manifest or patch.

| Phase | scope (`files[]`) | exclusions |
|---|---|---|
| design-review | sprint design drafts only — `<sprint>/design/**`, minus generated output (only the drafts that exist per `documents.*`) | `c4-full/dist/` |
| impl-review, `self_hosting: disabled` (consumer, default) | changed files anywhere in the repo, minus the exclusions — code and tests in practice | `.asd/**`, `docs/**`, generated provider views (`.claude/{agents,skills,hooks}/**`, `.codex/{agents,hooks}/**`, `.agents/skills/**`) |
| impl-review, `self_hosting: enabled` (this repo) | changed files anywhere in the repo — everything here IS framework source (`sprint-lifecycle.md` "Self-hosting") | `.asd/project/**`, `.asd/sprints/**`, generated provider views per `sprint-lifecycle.md` "Self-hosting" |

Cross-phase reference material (concept, custom rules, accessibility baseline, prd/adr/stack/commands) travels as **paths only** in the rendered prompt (`t_prompt-external-{design,impl}.md` "project context"), never inside the scope manifest, never diffed. design-review scope never names source code; consumer-mode impl-review scope never names design/doc files (a doc-vs-code drift finding belongs to the internal Quality reviewer). The exclusions also keep C4 schemas out of consumer impl-review: likec4 lives under `<sprint>/design/c4-full/` and `docs/architecture/c4/`.

**Generated output is always excluded.** `**/dist/**` (likec4 build), `design-system.html` — both derived from a source the reviewer already sees (`*.c4`, `DESIGN.md`). Review the source, not the build.

Both impl-review rows start from the whole repo and subtract the exclusions, never an allow-list — so any real source added later (CI configs, root-level configs, anything else) is in scope automatically, with no manifest or rule edit. Agent memory's status in both modes: `artifact-layout.md` "Agent memory".

## Iteration semantics

`files[]` each iteration = the iteration's scope list — impl-review per the current wave (`sprint-lifecycle.md` "Review iteration counters"); design-review every in-scope draft at iteration 1, then the drafts changed since the previous iteration's snapshot (`asd-phase-design-review.md` step 7 "Draft list") — unioned with the carried-over `Unreviewed files` below. Absent `iteration_heads` key fallback: `sprint-lifecycle.md` "State recovery" (sole SSoT).

**Unreviewed files.** An availability skip's `external.md` records the entire `files[]` in its `Unreviewed files` line (`t_review-report.md`). The next iteration adds these paths to its scope with `--full-files`. In impl-review, serialize the array as JSON on that line and decode it into a NUL-delimited scratch list. Accept older reports in their recorded format. Carry paths only within the same wave and pass `--full-base <base_branch>` to diff them over `<base_branch>...HEAD`. In design-review, read the carried drafts whole.

Agent dispatched fresh each iteration (`review-policy.md` clean-context). Incremental manifest narrows *input*, not context.

## Output mapping

Wrapped-CLI severity terms in the captured stdout mapped to ASD severity:

| Wrapped CLI | ASD |
|---|---|
| blocker, critical | critical |
| major | high |
| minor | medium |
| info, suggestion | low |

Findings rendered to the review output dir supplied by the dispatching phase skill (`reviews/design/iter-NN/external.md` or `reviews/impl/wave-<K>/iter-NN/external.md`), using verdict format from `review-policy.md`. The agent drops nitpicks and returns every other finding at any severity; the severity floor is applied by `persist-review --floor <payload floor>` ("Persistence", `review-policy.md`), which drops each below-floor row, records `dropped: <n>` and rewrites a CONCERNS or FAIL whose rows all dropped to APPROVE, a stalemate FAIL excepted. Dropped findings (below floor, nitpick) are never rendered as per-finding rows — only a count, per `t_review-report.md`; nothing downstream reads a dropped finding's detail.

## Stalemate detection

Phase skill supplies the finding set of the latest earlier verdict iteration — skip iterations are skipped; in impl-review of the same wave, by iteration id — as explicit payload input (from iteration 2). Agent compares against that supplied set only — does not read another iteration's review files. The supplied set is the persisted, floored one, so the agent compares its own findings at or above `payload.floor` with it: floored sets on both sides.

If two consecutive verdict iterations produce an identical floored issue set (same files, lines, messages), the agent returns a verdict ("Outcome contract"): first line `[REVIEW-<phase>-external]: FAIL`, plus a `Stalemate: <N> iterations, identical findings` block (`t_review-report.md` `## Stalemate`). The orchestrator asks the user (`core.md` "Request user decision") and applies the choice to the stalemated findings; the review workflows' generic FAIL accept/override bullets do not apply:

- **stop** — accept the current state: the orchestrator records the findings resolved without fix (`sprint-lifecycle.md` "State recovery" user-resolved findings), and routing continues with the rest
- **continue fixing** — the findings stay in the fix set: impl-review routes them to review-fix, design-review to the orchestrator fix and the next iteration
- **abort** — emit ABORT

## Aggregation

When `review.external_review: enabled`, include External Review in the DoD roster and count results per "Outcome contract".
