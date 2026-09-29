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
- No test-authoring tasks or subtasks: tests are selected and written in impl-test, after the code exists
- Every task carries a `Material risk:` line, plain text, never a checkbox (see sprint-lifecycle.md "Plan file format")
- A task whose value depends on two phases agreeing also carries a `Reachability:` line, same placement; absent = no cross-phase dependency, never a fail-closed default (same section)
- A task declaring a project-settings change carries a `Settings change: <key>=<value>[, …]` line, same placement; plan acceptance approves exactly those pairs, and the task sits alone in its wave: wave 1, ahead of any contract-changing task, or a wave after the task adding its key to t_config.yaml (same section)
- Overview carries one required `Change surface: <n> files` line (same section)
- `## Dependencies` is required and opens with the wave table impl dispatches from; every task sits in exactly one wave (same section)
-->

## Overview
The acceptance-criteria source is `sprint.md` AC-1…AC-13 (workflow `lite`). The inputs are `audit.md`, which lists every home and restating site, and its settled contradictions C1–C7. AC-6 was delivered at scope and has no Task.

Tasks are cut by file ownership, not by AC. This follows AC-8 on this very plan: every edit to a rule doc that several ACs touch sits in one Task, and no two Tasks in one wave touch the same path. Every restating site the audit lists is assigned to exactly one Task below.

**Fixed design decisions.** Every Task implements these as stated; none is re-decided in impl.

- **D1, closure flow (AC-1…AC-4).**
  - `pr` merge mode merges the sprint PR, confirms the merge, writes nothing on `git.base_branch` and returns the new `NEXT:` token `await-closure`. `asd-sprint` handles that token itself.
  - `asd-sprint` also handles a later invocation that detects a **merged-unclosed** sprint. Detection: a sprint folder at the active path with `phase="pr"` and a `pr.number` that `gh pr view <n> --json state,mergeCommit` reports `MERGED`.
  - In both cases `asd-sprint` requests the hard closure approval, presenting the completion evidence, before anything else.
  - On approval it enters the new-sprint flow and carries the approval as a parameter. Scope step 1 then runs the **closure write** right after creating the new branch and before seeding the new sprint:
    - `git mv` the closing sprint folder to `archived/`;
    - write `pr.state="merged"`, `pr.merge_commit`, `phase="done"`, `updated_at`, `archived_at` and a `sprint closure` `gate_decisions` entry (`decision_actor: user`);
    - add one decisions-log entry to the closing sprint;
    - commit, as the new branch's first commit.
  - With `self_hosting`, it then creates the tag and release (D4).
  - If the scope aborts before the branch exists, nothing is written and the question is asked again next time. If the user refuses closure, the sprint stays active and resumable.
  - Because pr never reaches a terminal state itself, `NEXT: done` leaves `pr`'s `next`. The `pr` entry becomes `["await-merge", "await-closure"]` in both workflow JSONs and in `runtime.js` `CHAIN_EXITS`.
- **D2, legacy shapes (AC-3).**
  - A local `closure-pending` sprint, whose base copy still says `open`, resolves through D1.
  - An archived non-done sprint gets its terminal write in place, inside the D1 closure write (the one "Sprint immutability" exception).
  - An existing `chore/finalize-sprint-<slug>` PR, found via `gh pr list --head`, is merged when open and approved. The D1 write is then skipped for that sprint.
  - The one-active-sprint rule exempts a merged-unclosed sprint once its closure is approved in the same flow.
- **D3, hook (AC-3).** `session-start.js` reports merged-unclosed offline: `phase="pr"`, `pr.number` set, and `state.branch` ≠ the current branch read from `.git/HEAD`. Its `next` text is `await-closure`. It makes no network call, and a missing or odd `.git` degrades silently.
- **D4, tag and release (AC-4).**
  - Target: `pr.merge_commit` from `gh pr view`.
  - Version: `asd_version` read via `git show <merge>:.asd/release-manifest.json`.
  - Idempotent: skipped when the tag already exists.
  - Runs at the D1 closure write.
- **D5, scratch directory (AC-10, AC-11).** Every helper file the workflows today write to "a temp file outside the repo" lives in `.asd/tmp/`. That directory ignores itself with its own `.gitignore` containing `*`, so no root `.gitignore` edit and no consumer migration is needed. The new runtime command `node .asd/runtime.js scratch-dir` creates it on first use and prints its absolute path. Callers are the plan, design-review and impl-review workflows.
- **D6, reviewer return file (AC-10, user answer C5).**
  - Every internal reviewer writes its final return verbatim to `.asd/tmp/<sprint>-<phase>-<iteration id>-<reviewer>.return.md`, named in its payload. `persist-review --in` reads that file, so the orchestrator never re-types a return.
  - Grants: Claude reviewers get this one path by policy; `Write` already comes through `memory: project`. Codex reviewers move to `sandbox_mode: "workspace-write"`, bounded by policy to their memory directory plus the return file. `providers.md` states that this trades away the host-enforced read-only guarantee.
- **D7, liveness (AC-7, user answers C6/C7).**
  - New runtime command `node .asd/runtime.js agent-liveness --agents <id,…> --interval 300 [--budget-min <n>]`. It resolves each Claude subagent transcript under `~/.claude/projects/*/*/subagents/agent-<id>.jsonl` and emits one `STALL <id> <reason>` line per stall.
  - A stall is: no size/mtime advance since the previous check, with no open tool call still inside its timeout (last `tool_use` without its `tool_result`, a 10-minute ceiling). The elapsed-over-budget backstop counts as a stall too.
  - It stays silent otherwise, and exits when every transcript's last entry is a final assistant message.
  - Claude orchestrator: a `Monitor` running that command, falling back to `CronCreate */5`. Codex: `wait_agent(timeout_ms ≤ 300000)` with the elapsed budget only, best-effort per openai/codex#24951.
  - Neither available: checks happen only at completion notifications, and the degraded mode is logged once per sprint as an `F-N`.
  - On a stall: stop the agent, then handle it as an interrupted or failed dispatch. A second stall of the same dispatch escalates.

**New homes cited across parallel Tasks** (019#P-2):

| New home | Section heading | Content | Task |
|---|---|---|---|
| `.asd/rules/sprint-lifecycle.md` | `## Agent liveness` (new, directly after `## State recovery`) | D7 | Task 1 |
| `.asd/rules/sprint-lifecycle.md` | `## Scope amendment` (new, directly after `## Plan file format`) | AC-9 amendment | Task 1 |
| `.asd/rules/sprint-lifecycle.md` | `## PR phase` (rewritten) | D1–D4 | Task 1 |
| `.asd/rules/artifact-layout.md` | `## Scratch directory` (new, directly after `## Agent memory`) | D5 | Task 2 |
| `.asd/rules/providers.md` | `### Agent liveness per host` (new, under `## Semantic operations -> host convention`) | D7 host mapping | Task 3 |
| `.asd/rules/review-policy.md` | the existing "Coverage ledger" Persistence paragraph | D6 | Task 3 |

Every subordinate contract change (the pr token, the sync-by-orchestrator rule, the return file) binds from the files as edited. The generated views are regenerated once per wave by the orchestrator (the Orchestrator lines below). Devs edit canon only and run `node .asd/sync.js --check` as their build gate, never `--apply`. This sprint already applies AC-11's sync rule, so no Task changes the contract that another Task in the same wave is dispatched under.

Change surface: 56 files

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.
Sprint-specific additions:
- `node .asd/sync.js --check` is clean after the orchestrator's final sync.
- `node .asd/runtime.js retro-candidates … --self-hosting` still returns `[]`.
- A repo grep finds no leftover `finalize-sprint`, `companion`, `closure-pending` or "temp file outside the repo" wording outside the legacy-recovery sentences D2 keeps. The pinned sentences come from the diff (AC-13).

### Task 1: sprint-lifecycle.md — archival, liveness, plan/scope/audit rules, dispatch recovery
Material risk: change: workflow gate
Reachability: pr writes `NEXT: await-closure` at merge-mode exit; asd-sprint reads it at Step 3 and the scope closure write consumes the approval it collects at scope step 1
- [x] AC-1…AC-5 (D1, D2, D4): rewrite `## PR phase`; update the `pr` row of `## Phase table`, L13 in `## Orchestration and adaptive gates`, `## Self-hosting` L143 (tag timing), `## Sprint immutability` (in-place write only in the D1 closure write) and `## State recovery` L373 (no `closure-pending` record; merged-unclosed detection).
- [x] AC-7 (D7): add `## Agent liveness`. In `## State recovery` "Failed dispatch", extend the scope to creator and tester dispatches that end without a signal, and count one host-wide cause as one event, modelled on `review-policy.md` "Correlated interruption" (AC-11, 013#A-1).
- [x] AC-8: in `## Plan file format` add the rules: restating sites grepped and assigned; each new home named by file and heading; one Task per multi-AC rule doc; a Task holds only agent-performable work, with orchestrator actions as their own lines and an execution point; no overlapping paths within a wave; no helper, guard or export without a named caller or reachable failure; external APIs listed and the tech reference extended; stub inclusion states verified cost and behaviour change; a tests-only stub routes to impl-test.
- [x] AC-9:
  - extend L7's re-verification: a host-behaviour criterion is checked against host docs or a live dispatch;
  - in `## Audit phase`, add the per-criterion deliverability and consistency check;
  - at L11, send authority- or preference-only ambiguity straight to the user, and dispatch BA only when a source can resolve it;
  - add `## Scope amendment`: the AC, the plan Task and its wave, the gate records, and a re-run of the change-surface estimate.
- [x] AC-11: `## Self-hosting` L139 — dev edits canon; the orchestrator syncs once, after a wave's or fix round's last canon-editing dispatch.
- [x] AC-10: move the manual-verification smoke check to impl-test's first green entry wherever `## Impl-test phase` or the impl-review text states its timing.

### Task 2: git-strategy, artifact-layout, checkpoints, core, t_AGENTS — archival and scratch wording
Material risk: change: workflow gate
- [x] AC-1…AC-4 in `git-strategy.md`: `## Merging a PR` (one PR per sprint, no closure-pending record), delete `## Finalize after closure` and move the D2 legacy-PR sentence into `## Merging a PR`, and `## Versioning & Changelog (self-hosting only)` (D4 tag target and timing).
- [x] `artifact-layout.md`:
  - `## Sprint archival`: point to D1;
  - add `## Scratch directory` (D5), and add the path to the path map;
  - `## Test plan` L193: smoke timing (AC-10);
  - "Leftover-term check": pin the removed sentences taken from the diff (AC-13, 019#P-3).
- [x] `checkpoints.md`: the L52 sprint-closure row wording (approval before the next scope's closure write), and cite `## Scope amendment` beside the hard "new or changed scope" gate.
- [x] AC-3: `core.md` L14 and L31, and `.asd/templates/t_AGENTS.md` L48 (the one-active-sprint exemption for an approved merged-unclosed sprint).

### Task 3: review-policy, providers, code-style, t_review — review contract, liveness mapping, test contracts
Material risk: change: public contract
- [x] AC-10 in `review-policy.md`:
  - `|` escaping beside the Findings table shape;
  - D6 in "Coverage ledger" Persistence and "Gate Verdict Format";
  - the ledger skeleton in "Manifest vocabulary";
  - "Autofix vs escalation": deduplicate findings across reviewers by target and claim before fix routing, and a reach finding's fix states the reach for every branch at the site;
  - "Interrupted dispatch": cite `sprint-lifecycle.md` `## Agent liveness`.
- [x] `t_review.md` "## Findings": the `\|` escape note.
- [x] `providers.md`:
  - new semantic-operation rows "observe in-flight agent" and "stop in-flight agent" (Claude: `agent-liveness` via `Monitor`/`CronCreate`, `TaskStop`; Codex: `wait_agent`, `close_agent`);
  - `### Agent liveness per host` with the verified facts, source URLs and verification date from `audit.md`;
  - on the `delegate to agent` row: a return is read from the completion notification, never the task output file (AC-11, glings:004#A-2);
  - L46: D6, including the Codex `workspace-write` trade-off.
- [x] AC-13 in `code-style.md` §17: a content-contract test pins a token that cannot be reworded, never surrounding prose.

### Task 4: external-review rule and wrapper — timeout, retry-after, consumer pathspec
Material risk: change: public contract
- [x] AC-11 in `external-review.md` "Outcome contract" and in `asd-external-review.md` L59/L66/L103: invoke the wrapped CLI with an explicit shell timeout of ≥10 minutes and never redirect its stdout.
- [x] AC-11 in `external-review.md` L31 "Detection and negative cache": retry-after comes from the provider-reported reset and is capped at 1 hour, never the 5-minute default.
- [x] AC-12 in `external-review.md` "Phase-scoped payload", consumer row L62: also exclude the generated provider views (`.claude/{agents,skills,hooks}/**`, `.claude/settings.json`, `.codex/**`, `.agents/skills/**`).

### Task 5: runtime.js and workflow definitions — classifiers, surface, retry clamp, ledger skeleton, scratch, liveness, chain exit
Material risk: change: public contract
- [x] AC-12:
  - `isTest` also matches dotted test directories (`Core.Tests/`, `Game.Tests.Unit/`);
  - `isUiSurface` becomes case-insensitive, gains `.uxml`/`.uss`/`.tss`, and is exported (caller: impl-test's fail-first check);
  - `surfaceCheck` excludes the generated provider views;
  - `surface-check` accepts `--base <ref> --head <ref>`, which counts the diff's paths minus pure renames (`--name-status -M`, `R100` dropped), for impl-review's division-point check.
- [x] AC-11: `recordExternalFailure` clamps retry-after to 1 hour instead of throwing. Its default is the provider-reported reset when the caller passes one, and 1 hour otherwise, never 5 minutes. `NEGATIVE_TTL_MS` goes.
- [x] AC-10:
  - `emitCoverageManifest` adds a ledger skeleton (manifest digest, empty findings, files/rules/sections rows to fill), pre-filled with the digest;
  - `persist-review --in` reads the D6 return file unchanged.
- [x] D5: `scratch-dir` command. D7: `agent-liveness` command.
- [x] D1: `CHAIN_EXITS` becomes `['await-merge', 'await-closure']`, and `next.pr` in `.asd/workflows/standard.json` and `.asd/workflows/lite.json` becomes `["await-merge", "await-closure"]`. Update the usage string.

### Task 6: session-start hook — merged-unclosed report
Material risk: artifact: hook display
- [x] AC-3 (D3) in `.asd/hooks/session-start.js`: `findActiveSprints` classifies merged-unclosed offline, and `next` reports `await-closure`. The `closure-pending` branch is dropped. Exit 0 and never throw on any malformed shape.

### Task 7: pr and scope workflows, asd-sprint and asd-phase-pr skills — closure flow
Material risk: change: workflow gate
Reachability: asd-sprint collects the closure approval at Step 1 or at Step 3's `await-closure`; asd-phase-scope step 1 performs the closure write after branch creation
- [x] AC-1/AC-4 in `.asd/workflows/asd-phase-pr.md` "Merge and closure mode": merge, confirm, no base write, return `NEXT: await-closure`. Steps 3-5 become the D1/D4 closure write and move to the scope workflow; update the return contract. Update the `.asd/skills/asd-phase-pr/SKILL.md` description to match.
- [x] AC-2/AC-3 in `.asd/skills/asd-sprint/SKILL.md` (Preconditions, Step 1, Step 3, return contract): merged-unclosed detection (D1, confirmed via `gh`), the closure request before new-sprint or resume, the one-active exemption, the legacy shapes (D2), and the `await-closure` handling. Fix the stale "archived pre-merge" text (audit C1).
- [x] AC-2 in `.asd/workflows/asd-phase-scope.md` step 1: the closure write (D1, D2) plus the tag (D4), before seeding.
- [x] AC-9 in `asd-phase-scope.md`: step 2 verifies host-behaviour criteria against host docs or a live dispatch; step 4's gate offers to split unrelated strands or independent contracts into consecutive sprints.

### Task 8: plan and audit workflows, templates, architect/BA agents — plan and audit rules
Material risk: change: workflow gate
- [x] AC-8 in `.asd/workflows/asd-phase-plan.md` step 4 (the "Task decomposition rules" and "Stub inclusion step"): the acting-site form of the Task 1 rules. Resolve the L31/L38 conflict: a tests-only stub goes to impl-test with no Task. The L40 surface list is written under `.asd/tmp/` (D5).
- [x] AC-8 in the `.asd/templates/t_plan.md` format-rules comment: only the parser-relevant lines change; cite `sprint-lifecycle.md` for the rest.
- [x] AC-9 in `.asd/workflows/asd-phase-audit.md`:
  - step 2 payload: the per-criterion deliverability and consistency check;
  - step 3 and Delegates: authority- or preference-only ambiguity becomes a `QUESTION` straight to the user, and BA is dispatched only for source-resolvable ambiguity.
- [x] The same AC-9 wording lands in `.asd/templates/t_audit.md` L12, `.asd/agents/asd-architect.md` Outputs L40 and `.asd/agents/asd-ba.md` L16.

### Task 9: impl, impl-test, impl-review and design-review workflows, dev and reviewer agents — fix routing, return file, sync
Material risk: change: security
- [x] AC-10 in `.asd/workflows/asd-phase-impl.md`:
  - step 3 review-fix: deduplicate findings across reviewers by target and claim before grouping;
  - step 6: a reach finding's fix states the reach for every branch;
  - steps 10-11: check the decisions log for an earlier disposition before accepting a flagged choice, and record any reversal (also `.asd/agents/asd-dev.md` L93).
- [x] AC-11 in `asd-phase-impl.md`:
  - step 1 L48: devs never `--apply`; the orchestrator syncs once per wave or fix round;
  - step 9's authorised-paths gate admits orchestrator-regenerated views;
  - "Execution mode": a denied command means commit, then return `FAILED` naming the command (also the `asd-dev.md` Signals).
- [x] AC-10/D6 in `.asd/workflows/asd-phase-impl-review.md` (L9, L17, L24, L25, L49) and `.asd/workflows/asd-phase-design-review.md` (L13, L37): the return file path in the payload, `persist-review --in` on it, and `.asd/tmp/` for every helper file.
- [x] Move the smoke check from `asd-phase-impl-review.md` step 6 to `.asd/workflows/asd-phase-impl-test.md`'s first green entry. The Inputs of `asd-reviewer-testing.md`/`asd-reviewer-combined.md` read the result from `test-plan.md`.
- [x] AC-12: `asd-phase-impl-test.md` L33, the consumer pathspec restated with the generated views excluded.
- [x] D6 in the Output sections of `.asd/agents/asd-reviewer-{correctness,efficiency,testing,documentation,combined}.md`: write the final return verbatim to the payload's return file. Codex frontmatter `sandbox_mode: "workspace-write"`, with a policy line naming the two permitted paths.

### Task 10: README, AGENTS.md tail, decisions-log template
Material risk: artifact: documentation mirror
- [ ] Root `AGENTS.md` hand-edited tail (below `<!-- asd:end -->`): drop the per-task `--apply` wording; devs edit canon only, the orchestrator syncs once per wave (`sprint-lifecycle.md` "Self-hosting") — restating site found by Task 1.
- [ ] `.asd/templates/t_decisions-log.md`: add the one-line form `- YYYY-MM-DD — stall: <agent> <dispatch ids>` that `sprint-lifecycle.md` "Agent liveness" introduced.
- [ ] Update README for:
  - the `pr` phase row and the flowchart exit tokens;
  - the folder map (`.asd/tmp/`);
  - the FAQ at L448 (stale archive claim, audit C2);
  - the reviewer sandbox column (Codex `workspace-write`);
  - the runtime command list (`scratch-dir`, `agent-liveness`, `surface-check --base/--head`).

  Confirm that the phase lists, roster, model tiers, config schema and command list are otherwise accurate.

## Orchestrator lines (not dev Tasks, 019#A-1)
- After wave 1's last dispatch: run `node .asd/sync.js --apply` on every generated view whose canon changed, then run `sync.js --check`. Commit the views and the root `AGENTS.md` managed block.
- After wave 1's sync, and before wave 2: memory fixes, routed to each owner per `artifact-layout.md` "Agent memory". Owners and files:
  - `asd-dev-critical`: `project_sync-apply-target-form.md`, `project_sync-apply-ledger-gotcha.md`, `project_parallel-wave-home-citations.md`, `project_tests-pin-literal-prose.md`;
  - `asd-external-review`: `reference_codex-invocation.md`;
  - `asd-reviewer-correctness`: `reference_persist-review-return-shape.md`;
  - `asd-reviewer-documentation`: `project_reviewer-write-scope-declaration.md`.

  Each owner is dispatched only where its memory contradicts the edited canon. The orchestrator deletes the ownerless `.claude/agent-memory/asd-pm/` files that restate the finalize flow (audit C3).
- After wave 2: the final sync and `--check`.
- At `pr` open mode: the `asd_version` bump plus a CHANGELOG section covering AC-5's migration note (in-flight `closure-pending` and a legacy finalize PR resolve via D2; no migration script).

## Risks
- Task 1 is large (seven ACs in one file). Its dispatch carries the D1–D7 text and the new-home table, and it routes to critical.
- Tests pin literal prose that Tasks 1–9 reword. Expected breaks are fixed in impl-test, since devs do not edit tests.
- D6 weakens Codex reviewer isolation, by the user's choice (C5). The policy line and the `providers.md` trade-off statement are the only guards.
- Liveness transcript reads sit outside the repo (`~/.claude/…`), so the host may prompt for permission the first time.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | 1, 2, 3, 4, 5, 6, 7, 8, 9 |
| 2 | 10 |

- Task 10 depends on Tasks 1–9 (README mirrors their final text).
- Tasks 1–9 touch disjoint paths. Cross-references between them use only the new homes in the Overview table.

## Out of scope (optional)
- Tag or release for past sprints. 13.3.0's tag stays on the companion commit.
- A `pr` sub-key schema in `t_state.json`. D1 writes only `pr.merge_commit` beside the existing keys.
