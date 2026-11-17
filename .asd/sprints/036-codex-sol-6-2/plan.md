---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

<!--
Format rules (parser-critical):
- Overview, Definition of Done — prose only, NO checkboxes
- Checkboxes (- [ ]/- [x]) appear ONLY inside `### Task N:` sections
- Checkboxes in any non-task section break orchestrator task parsing
- Subtask deferred for a manual action stays `- [ ]`, suffixed ` — BLOCKED: MS-N` (see manual-steps.md)
- No test-authoring tasks or subtasks: tests are selected and written in impl-test, after the code exists — the one carve-out is a `Test-only:` task (sprint-lifecycle.md "Plan file format")
- Every task carries a `Material risk:` line, plain text, never a checkbox (see sprint-lifecycle.md "Plan file format")
- A test-only task carries a `Test-only: <test paths or globs>` line, plain text, never a checkbox, directly under the `Material risk` line(s) and ahead of any `Reachability` line; it sits in a wave after every task whose code it covers (same section)
- A task whose value depends on two phases agreeing also carries a `Reachability:` line, under the `Material risk` line(s) and any `Test-only` line; a value crossing a push or merge also names what each interruption point leaves on the receiving branch; absent = no cross-phase dependency, never a fail-closed default (same section)
- A task declaring a project-settings change carries a `Settings change: <key>=<value>[, …]` line, under the `Material risk`, `Test-only` and `Reachability` lines; plan acceptance approves exactly those pairs, and the task sits alone in its wave: wave 1, ahead of any contract-changing task, or a wave after the task adding its key to t_config.yaml (same section)
- `## Dependencies` is required and opens with the wave table impl dispatches from; every task sits in exactly one wave, and no two tasks in one wave touch overlapping paths (same section)
- An orchestrator-only action (naming its execution point) or a tests-only stub (`Stub <ref> → impl-test`) is its own plain-text line outside every `### Task N:` block, never a checkbox (same section)
- A plan that renames text across many files may carry one plan-level `Rename map: <sprint-relative JSON path>` line, plain text outside every `### Task N:` block, never a checkbox; the review manifest diff collapses hunks that only apply its substitutions (same section)
- The other task decomposition rules: sprint-lifecycle.md "Plan file format"
-->

## Overview
Two strands. (1) The Codex `sol` family moves to `gpt-6.2-sol` (AC-1..AC-5): one manifest value, its `providers.md` mirror, README, regenerated views. (2) Retro 035 rows and issues #123-#127 (AC-6..AC-14): `runtime.js` (commit-check, timing, latch-refresh, agent-liveness) and workflow/agent prose.

Decisions fixed here (the shapes the Tasks implement):
- **Commit message file (AC-12)**: a dispatched agent writes its full commit message (header, optional body, final trailer paragraph holding every `ASD-Task:` line together with any `Co-Authored-By:`) to `<scratch-dir>/<NNN-slug>-<dispatch id>.commit-msg` with the file-write operation, then runs `git add -- <paths> && git diff --cached --check -- <paths> && node .asd/runtime.js commit-check --message-file <file> -- <paths> && git commit --only -F <file> -- <paths>`, deleting the file afterwards. `commit-check` takes exactly one of `--subject` (unchanged, kept for trailer-less commits: the orchestrator's bookkeeping and cleanup removals) or `--message-file`; with the file it checks the first line as the header (≤50 code points) and fails when any `ASD-Task:` line is outside the message's last paragraph (text after the last blank line). The check is plain text parsing — no new git command.
- **Id reuse (AC-7)**: `timing --open` skips with a warning, appending nothing, any id the ledger holds — still open (as today) or closed. Every op that repeats takes the next free `#<n>` suffix (`suite` already does): a re-dispatched agent after a done or interrupted close (failed dispatch, effort step, interrupted reviewer), a re-asked gate's `user-wait`. The warning names the next free id. Dispatch attr fill looks up `task_routing` by the id with a trailing `#<n>` removed. `parseFlagArgs` warns on stderr for any flag given more than once (last value still wins).
- **Liveness return files (AC-14)**: `agent-liveness` takes optional `--returns <json path>`, a file mapping agent id → `{"return": <return file path>, "manifest": <manifest path>}` the orchestrator writes for reviewer dispatches. An id whose return file exists and passes the same checks `persist-review` applies before writing (verdict token, findings table, coverage ledger against the manifest) is reported done, never `STALL`; a missing or invalid file changes nothing. The checks are shared with `persistReview`, not copied.
- **Decision coverage (AC-13)**: `t_plan.md` gains an optional `## Decision coverage` table (`Decision | Covered by`), one row per user decision in the sprint's decisions log (every segment) that sets or changes a requirement, behaviour or design choice, and per decision of an accepted ux-spec, each mapped to an `AC-N`/Task or an `Out of scope` line; process gates (workflow choice, triage authorisation, retro dispositions, ASD update, approach choice already reflected in `research.md`) are not rows. Omitted when no such decision exists.

Rule homes cited across Tasks: `git-strategy.md` "Commit before review" (commit form), `sprint-lifecycle.md` "Operation timing" (id rules), `providers.md` "Agent liveness per host" (liveness invocation), `artifact-layout.md` "Tech reference docs" (refuse-to-implement).

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.
`git grep gpt-6.1-sol` outside `CHANGELOG.md` and `.asd/sprints/**` is empty (AC-4); the live `codex exec --model gpt-6.2-sol` probe is recorded in `test-plan.md` (AC-5).

### Task 1: Commit message file and trailer check
Material risk: change: commit contract every agent commits under
- [x] `.asd/runtime.js` `commitCheck`: accept exactly one of `--subject` / `--message-file`; with the file, header = first line, and fail when an `ASD-Task:` line lies outside the last paragraph; JSON result and exit codes unchanged (AC-12)
- [x] `.asd/rules/git-strategy.md` "Commits" trailer bullet and "Commit before review" one-command form: the message-file form above for a dispatched agent's commit, `--subject` kept for trailer-less commits; the trailer paragraph rule stated once there (AC-12)
- [x] `.asd/workflows/asd-phase-impl.md` step 5 fix-mode wording that a commit "carries its `ASD-Task` trailer": cite the form, no restatement (AC-12)
- [x] `README.md` runtime command list: `commit-check` form (AC-12)

### Task 2: Codex sol 6.2 mapping and README rows
Material risk: artifact: model-ID literal swap verified by tests/run.js providers/README mirror test and git grep
- [x] `.asd/release-manifest.json` `model_families.codex.sol` → `gpt-6.2-sol` (AC-1)
- [x] `.asd/rules/providers.md` "Model family resolution" table `sol` row (AC-1)
- [x] `README.md:38`: `sol` → `gpt-6.2-sol` and "Codex CLI 0.167.0 or later" (older clients get HTTP 400 `model_not_found`) (AC-3)
- [x] `README.md` plan row (:191): plan runs the build once and maps user decisions (AC-11, AC-13); pr row (:197): PR body lists External Review availability skips (AC-6)

### Task 3: PR body lists External Review skips
Material risk: change: PR body section shape
- [x] `.asd/workflows/asd-phase-pr.md` open mode step 2: for each impl-review wave whose highest iteration's `external.md` verdict is `APPROVE (skipped: …)`, list the wave and that file's `Unreviewed files` (AC-6)
- [x] `.asd/templates/t_pr-description.md`: optional section for those waves, omitted when none (AC-6)

### Task 4: Dev checks tech reference per new command
Material risk: change: refuse-to-implement rule scope
- [x] `.asd/rules/artifact-layout.md` "Tech reference docs" refuse-to-implement rule: extend from per tech to every command or subcommand a diff newly invokes, `FAILED — tech-reference missing for <command>` (AC-8)
- [x] `.asd/agents/asd-dev.md` Rules: before COMPLETED, check each command or subcommand the diff newly invokes against the tech reference per that rule (AC-8)

### Task 5: Scope checks disabled documents against the scope
Material risk: change: scope gate content
- [x] `.asd/workflows/asd-phase-scope.md` steps 3a/4: before the scope gate, check every `documents.*` freezing `false` against the requirements the drafted scope states; a needed one is shown at the gate with the choice of a `sprint.md` `Settings change:` line enabling it (step 2b) or a narrowed scope (AC-10)

### Task 6: Plan runs the build and maps user decisions
Material risk: change: plan acceptance preconditions
- [x] `.asd/workflows/asd-phase-plan.md`: Inputs add the sprint's decisions log (every segment) and an accepted ux-spec; step 4 runs the `commands.yaml` `build` once and stops with `FAILED` naming the failing command and its first error lines; step 4 fills `## Decision coverage` per the Overview decision before the step 5 gate (AC-11, AC-13)
- [x] `.asd/templates/t_plan.md`: optional `## Decision coverage` table (AC-13)

### Task 7: Timing id reuse, latch clear without lexer, liveness return files
Material risk: change: op id convention across recovery and re-dispatch
Material risk: change: liveness done semantics for a written return file
- [x] `.asd/runtime.js` `timingAppend`: skip and warn on an open of any id the ledger holds, naming the next free `#<n>`; dispatch attr fill strips a trailing `#<n>` for the `task_routing` lookup (AC-7)
- [x] `.asd/runtime.js` `parseFlagArgs`: warn on stderr per repeated flag (AC-7)
- [x] `.asd/runtime.js`: remove `COMMENT_LEXERS`, `projectExecutable`, its helpers and `isCommentOnlyChange` (and its export); `changedProductionFiles` counts every changed production executable file (AC-9)
- [x] `.asd/runtime.js` `agent-liveness`: optional `--returns <json path>`; an id whose return file passes the `persist-review` checks (shared function extracted from `persistReview`) is done (AC-14)
- [x] `.asd/rules/sprint-lifecycle.md` "Operation timing": ids are never reused, a repeated op takes the next free `#<n>` (user-wait and re-dispatch included); "Fix-round clear": drop the comment-only exception (AC-7, AC-9)
- [x] `.asd/rules/providers.md` "Agent liveness per host" Claude Code bullets: pass `--returns` for reviewer dispatches (AC-14)
- [x] `README.md` runtime command list: `agent-liveness --returns`, `timing` id refusal (AC-7, AC-14)

### Task 8: AI attribution setting and its sprint-start check
Material risk: change: commit contract every agent commits under
Material risk: change: rewrite of the user's Claude Code settings files
- [ ] `.asd/templates/t_config.yaml`: `git.ai_attribution: enabled | disabled`, absent = `enabled` (AC-15)
- [ ] `.asd/sync.js` json-merge of `.claude/settings.json`: with `disabled`, carry `"attribution": {"commit": "", "pr": ""}` as an ASD-owned key; with `enabled` or absent, add nothing (AC-15)
- [ ] `.asd/runtime.js`: a deterministic attribution check run by `asd-sprint` — reads `git.ai_attribution`; when `disabled` and the Claude view exists, removes every re-enabling entry (non-empty `attribution.commit`/`attribution.pr`, `includeCoAuthoredBy: true`) from `.claude/settings.json` and `.claude/settings.local.json`, printing one line per fix; when the Codex view exists, prints the one-line ChatGPT workspace hint; silent no-op when `enabled` (AC-16)
- [ ] `.asd/runtime.js` `commitCheck`: with `disabled`, fail on a `Co-authored-by:` trailer naming Claude or Codex (case-insensitive key) (AC-16)
- [ ] `.asd/skills/asd-sprint/SKILL.md` Step 0: run the check on every invocation; `.asd/workflows/asd-phase-pr.md` open mode: with `disabled`, no AI attribution line in the PR body; `.asd/rules/git-strategy.md` "Commits": the trailer rule names the rejection once (AC-16)
- [ ] `.asd/skills/asd-init/SKILL.md`: ask/edit `git.ai_attribution`; `README.md`: config schema row and runtime command list (AC-15, AC-16)

### Task 9: Disable AI attribution in this repository
Material risk: artifact: one config value verified by the AC-16 check output
Settings change: git.ai_attribution=disabled
- [ ] `.asd/project/config.yaml`: `git.ai_attribution: disabled` through `asd-init` sprint-mediated mode, then the AC-16 check run once (AC-17)

## Risks (optional)
- Task 1 changes the commit form Tasks 2-7 commit under, so it runs alone in wave 1 and its agents commit with the new form from wave 2 on.
- Task 7 removes code `tests/run.js` covers (comment-only cases); impl-test prunes or adapts those tests and the expected sync fixture.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | Task 1 |
| 2 | Task 2, Task 3, Task 4, Task 5, Task 6 |
| 3 | Task 7 |
| 4 | Task 8 |
| 5 | Task 9 |

- Task 7 follows wave 2 because it shares `.asd/rules/providers.md` with Task 2 and `README.md` with Tasks 1 and 2; Task 2 owns every wave-2 README edit.
- Task 8 (scope amendment) follows Task 7: both touch `.asd/runtime.js` and `README.md`. Task 9 carries a `Settings change:` and sits alone in the wave after Task 8, which adds its key to `t_config.yaml`.

Orchestrator after wave 2: `node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply` over `.codex/agents/` and `.claude/agents/asd-external-review.md` (and any view whose canon changed), commit the regenerated views (AC-2).
Orchestrator at impl-test: run `codex exec --model gpt-6.2-sol -c model_reasoning_effort="high" --sandbox read-only -` once and record the reply in `test-plan.md` (AC-5).
Orchestrator at pr open mode: CHANGELOG section states `gpt-6.2-sol`, the Codex CLI 0.167.0 minimum and the `model_not_found` refusal of older clients (AC-3), with the `asd_version` bump.

## Decision coverage

| Decision | Covered by |
|---|---|
| 2026-11-18 approach A: no runtime client-version check, no migration | Out of scope (`sprint.md`) |
| 2026-11-18 documented minimum is 0.167.0, not the unverified 0.166.0 | Task 2, AC-3 |
| 2026-11-18 AC-8 redraft: dev returns `FAILED`, orchestrator writes tech reference | Task 4 |
| 2026-11-18 scope amendment: AI attribution setting, project-level Claude Code settings only | Task 8, AC-15, AC-16 |
| 2026-11-18 scope amendment: Codex gets commit-check guard, PR body rule and workspace hint (no local key exists) | Task 8, AC-16 |
| 2026-11-18 scope amendment: this repo sets `git.ai_attribution: disabled` | Task 9, AC-17 |
