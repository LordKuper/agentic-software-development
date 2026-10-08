---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

<!--
Format rules (parser-critical):
- Overview, Definition of Done — prose only, NO checkboxes
- Checkboxes (- [ ]/- [x]) appear ONLY inside `### Task N:` sections
- Every task carries a `Material risk:` line, plain text, never a checkbox (see sprint-lifecycle.md "Plan file format")
- `## Dependencies` is required and opens with the wave table impl dispatches from
- The other task decomposition rules: sprint-lifecycle.md "Plan file format"
-->

## Overview

Two strands from `sprint.md`: operation timing with retro analysis (AC-1..AC-7), and an ASD version check at new-sprint start (AC-8). Inputs: `sprint.md`, `audit.md` (Touched areas, Contradictions, Gaps, Risks, Open plan inputs).

**Plan decisions** (D1-D9; the user settled D3, D5, D6 and D8 at plan time, the rest follow `audit.md`):

- **D1 Capture**: the main orchestrator runs deterministic `runtime.js` commands at operation boundaries. No host hooks (audit Gaps "Capture mechanism").
- **D2 Ledger**: `<sprint>/timing.jsonl`, append-only JSONL, always named "timing ledger" (never bare "ledger", which is the review coverage ledger). An open line holds `{op:"open", id, kind, parent, start, attrs}`. A close line holds the full entry `{op:"close", id, kind, parent, start, end, outcome, attrs}`, with `outcome` `done` or `interrupted`. Timestamps are ISO 8601 UTC from the runtime's clock, never written by a model. Kinds: `phase`, `dispatch`, `review-iteration`, `suite`, `external-review`, `user-wait`. Attrs: `dispatch` → `agent`, `tier`, `model` (from `state.json.task_routing` when routed); `external-review` → `model` (the wrapped CLI's); `review-iteration` → `wave`, `iteration`; `suite` → `scope` (`impacted` or `full`); `user-wait` → `gate` (gate name or a short question label). Ids are caller-built and unique: the `task_routing` id for routed dispatches; `<reviewer key> wave-<K>/iter-NN` for reviewers; `<agent> <phase>#<n>` for other dispatches. A phase op is opened by phase name, and the runtime appends the entry ordinal `#<n>`; closing by the bare phase name closes its open entry.
- **D3 Ledger commits** (user): the ledger stays in the sprint folder. The orchestrator commits a dirty ledger with its phase-exit bookkeeping and, alone (`git commit --only -- <ledger>`, subject `chore(sprint): <NNN> timing`), before every clean-tree check or diff-reading gate. Dispatched agents never stage it. impl's authorised-path gate allows it.
- **D4 Commands** (`runtime.js`):
  - `timing --ledger <path> [--create] [--close <id,…> [--outcome done|interrupted]] [--open <id,…> --kind <kind> [--parent <id>] [--attrs <k=v;…>]]` closes first, then opens, in one append. It prints nothing on success. On any failure it prints one warning line to stderr and exits 0. Without `--create`, a missing ledger makes it a no-op.
  - `timing-recover --ledger <path>` closes every open op as `interrupted`. Its `end` is the latest of the op's start, the ledger's last timestamp, and the HEAD committer date when that is later than the start.
  - `timing-summary --ledger <path> --archive <archived sprints dir>` prints deterministic JSON, with no clock read. It gives totals by phase, by kind and by agent/tier/model; wall, machine, user-wait and unaccounted time (machine = union of phase time minus union of user-wait time; unaccounted = wall minus phase union); the slow set (D5); every user wait (D6); rework (review-fix and test-fix rounds, phase entries after the first, iterations ≥ 2, interrupted ops); per phase and kind, the median over archived ledgers when any exist, with their count; and gaps (close without open, op outside a phase, still open). A missing ledger yields `{"timing": null}`.
- **D5 Slow set** (user): the top 5 longest leaf machine operations (`dispatch`, `suite`, `external-review`), plus every leaf machine operation over 30 minutes. Each one carries its excess over the median of its kind in this sprint. These are named constants `SLOW_TOP_N = 5` and `SLOW_MINUTES = 30`.
- **D6 User waits** (user): every user wait is recorded and listed in the summary. Retro checks each one for whether the escalation could be avoided (adaptive evidence, a deterministic rule, a decision already authorised). An avoidable one becomes a proposal to remove that escalation, never a proposal to speed up the user. User waits are never in the slow set.
- **D7 Phase boundaries**: `asd-sprint` opens a phase op before each phase-skill delegation and closes it when the skill returns (`done` on COMPLETED, `interrupted` on FAILED or ABORT). On a QUESTION halt the phase stays open and a user wait opens under it. Exceptions: scope creates the ledger and opens its own op at folder creation; pr open mode closes its own op before its final commit and push. pr merge mode and the release retry are not recorded, because merge mode writes no commit and the wait for the merge is the host's and the user's, not the workflow's. `asd-sprint` Step 2B runs `timing-recover` before the resume menu. Pre-ledger time (scope collection, the AC-8 check and its answer) is not recorded.
- **D8 AC-8 flow** (user: commit, then stop on both hosts): `asd-sprint` Step 2A runs `node .asd/skills/asd-update/update.js --check-version` after the dirty-tree check, unless `self_hosting: enabled`. When the remote is newer, it requests a user decision (update now or continue) and carries the answer into scope.
  - On *update*, scope step 1 runs: create the branch, the closure write, then create the folder and ledger. Next it seeds `state.json` (phase=scope) and writes `sprint.md` with the raw scope text as Goal. It then runs `asd-update` in sprint-mediated mode and `sync.js --apply` over the stale views. One commit `chore(asd): update ASD <old> → <new>` carries all of these plus the decisions-log line. The run then halts with "restart the session, then run /asd-sprint".
  - The resume re-enters scope. Step 1 skips what is already done (branch, closure, folder, state, Goal) and continues at step 2. Resume never re-runs the check.
  - A partial update (a failed migration, or a conflict the user declines to force) is reported, then the user decides: commit what landed and halt, or abort.
  - `--check-version` reads only the remote `release-manifest.json` (raw GitHub URL built from `repo`/`branch`). It validates `asd_version` against `^\d+(\.\d+)*$` and ignores every other field. It prints `{local, remote, newer}`, exits 0, and on any network, parse or repo error or a 5 s timeout prints one warning with `remote: null, newer: false`.
  - The update choice joins `checkpoints.md`'s hard list.
- **D9 Retro output**: `t_retrospective.html` gains `<section id="duration">`, kept on both branches. It holds the summary table, the slow set, and the user waits. Each slow op or avoidable wait names its cause and links its P-N or A-N row. Proposals use the existing 4-cell rows: a finding with both a consumer-project and an ASD-framework half becomes two rows. `retro-candidates` is unchanged. With no ledger, the section reads "No timing data".

**Rule homes** (cited across Tasks in one wave):
- `.asd/rules/sprint-lifecycle.md` "Operation timing" (new section; Task 1).
- `.asd/rules/git-strategy.md` "Commit before review" (ledger bookkeeping commits; Task 5).
- `.asd/rules/artifact-layout.md` sprint path map (Task 5).
- `.asd/rules/checkpoints.md` "Gate policy" (update choice; Task 5).
- `.asd/skills/asd-update/SKILL.md` "Sprint-mediated mode" (new section; Task 2).
- `.asd/skills/asd-sprint/SKILL.md` "Step 2A" (version check; Task 3).

External APIs: Node stdlib (`fs`, `https`, `child_process` for `git log -1 --format=%cI`) and the raw GitHub content URL. No tech reference exists or is needed (`audit.md` Gaps, External dependency gaps).

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.

### Task 1: Timing ledger commands and the "Operation timing" rule
Material risk: change: public contract
Reachability: every phase writes `timing.jsonl` entries at its boundaries (asd-sprint around delegation, phase workflows at their dispatch, iteration, suite and user-wait sites); retro reads them through `timing-summary` at its read step; pr open mode writes its last close before its final commit, so the base branch holds a closed pr op after the push
- [x] `.asd/runtime.js`: add `timing`, `timing-recover` and `timing-summary` (D2, D4, D5, D6) as pure cores with injected `now` and ledger text, plus thin CLI wrappers in `main` and the usage string. Use comma lists (repeated flags are dropped by `parseFlagArgs`). One `appendFileSync` per call. A write failure gives a stderr warning and exit 0. A half-written tail line is skipped when parsing. Export the cores. Constants: `SLOW_TOP_N`, `SLOW_MINUTES`.
- [x] `.asd/rules/sprint-lifecycle.md`: add the section "Operation timing", the single home for D2-D7. It covers the ledger format, kinds and attrs, ids, which role writes which boundary, never gating, recovery, the user-wait open/close tied to the `QUESTION` protocol and every request user decision, what is not recorded, and the commit rule citing `git-strategy.md` "Commit before review".
- [x] `.asd/rules/sprint-lifecycle.md` "Retro phase": add the `timing-summary` output to the systemic evidence; add the D5 slow set and the D6 user waits as systemic candidates, each going through the existing findings order with the `Home` split into consumer-project and ASD-framework rows; add the duration section (D9) and the no-ledger reading.
- [x] `.asd/rules/sprint-lifecycle.md` "State recovery": cite `timing-recover` at resume. "Impl-review clean-worktree precondition": the ledger is committed before the check.

### Task 2: Version check and sprint-mediated update
Material risk: change: public contract
- [x] `.asd/skills/asd-update/update.js`: add a `--check-version` mode per D8, built on a pure exported helper `(localManifestText, remoteManifestText) → {local, remote, newer}` that reuses `compareVersions`. Fix `get` at the shared root: reject on error instead of throwing inside the listener, add a timeout, and cap redirects. The tarball fetch uses the same fix.
- [x] `.asd/skills/asd-update/SKILL.md`: add the "Sprint-mediated mode" section. Run by scope step 1 on the user's AC-8 choice, it skips step 1's confirmation (the choice is the confirmation). Conflicts and `--force` still go to the user, and the orchestrator commits the result. State that `--check-version` is read-only. The self-hosting guard is unchanged, since `asd-sprint` never runs the check when self-hosting.

### Task 3: asd-sprint and scope flow (phase boundaries, recovery, AC-8)
Material risk: change: workflow gate
Reachability: asd-sprint writes the AC-8 choice at Step 2A; scope reads it at step 1; interrupted at the post-update halt, the sprint branch holds `state.json` phase=scope, `sprint.md` Goal and the update commit, and the resume re-enters scope at step 2
- [ ] `.asd/skills/asd-sprint/SKILL.md`: in Step 2A, after the dirty check, add the version check and its decision per D8, with the skip on `self_hosting: enabled` and warn-and-continue. Add the phase op open and close around every phase-skill delegation (D7, citing `sprint-lifecycle.md` "Operation timing"). Merge mode and the release retry are not recorded. Step 2B runs `timing-recover` before the resume menu. Add the update choice to "Operations used"/"Request user decision", and add `asd-update` sprint-mediated mode to "Skills dispatched".
- [ ] `.asd/workflows/asd-phase-scope.md` step 1: create the ledger and open the scope phase op at folder creation (`--create`). Add the D8 update sub-step: seed state, write the Goal, run `asd-update` sprint-mediated, `sync.js --apply`, make one commit, halt. Re-entry skips completed sub-steps. Step 2 records the AC-8 choice (`gate: asd update`, `decision_actor: user`) when one was carried.

### Task 4: Phase workflow timing bindings
Material risk: artifact: workflow binding lines
- [ ] One binding line in each of `asd-phase-audit.md`, `asd-phase-design.md`, `asd-phase-design-review.md`, `asd-phase-design-promote.md`, `asd-phase-plan.md`, `asd-phase-impl.md`, `asd-phase-impl-test.md`, `asd-phase-impl-review.md`, `asd-phase-retro.md`, `asd-phase-pr.md`. Each names the steps where that workflow opens and closes its `dispatch`, `review-iteration`, `suite`, `external-review` and `user-wait` ops per `sprint-lifecycle.md` "Operation timing". Mirror the existing "Append friction" line form.
- [ ] `asd-phase-impl-test.md` and `asd-phase-impl-review.md`: the tester payload carries the ledger path, and the tester brackets each suite run with a `suite` op. Before the step-10 porcelain check (impl-test) and the entry clean-worktree check (impl-review), commit the ledger per `git-strategy.md` "Commit before review".
- [ ] `asd-phase-impl.md`: add `<sprint>/timing.jsonl` to the authorised-path gate's allowed paths.
- [ ] `asd-phase-retro.md`: add a `timing-summary` call to the read list. Steps 4 and 6 derive the D5/D6 candidates and fill the duration section (D9).
- [ ] `asd-phase-pr.md` open mode: close the pr phase op before the final bookkeeping commit and push. Merge mode records nothing.

### Task 5: Cross-cutting rule homes
Material risk: artifact: rule wording
- [ ] `.asd/rules/artifact-layout.md`: add a sprint path-map line for `timing.jsonl` (owner: main orchestrator, written only through `runtime.js` `timing*`, archived with the sprint), in at most two sentences.
- [ ] `.asd/rules/git-strategy.md` "Commit before review": add the timing ledger to the orchestrator bookkeeping list, plus the D3 rule (commit it alone before any clean-tree check or diff-reading gate; agents never stage it).
- [ ] `.asd/rules/checkpoints.md` "Gate policy": add the ASD update choice to the hard list, and a gate-inventory row (hard approve-before-write).
- [ ] `.asd/rules/core.md` "Invariants": add the read-only-infrastructure exception for `/asd-update` sprint-mediated mode at a new sprint's scope.

### Task 6: Retrospective duration section
Material risk: artifact: template section
- [ ] `.asd/templates/t_retrospective.html`: add `<section id="duration">` per D9 (summary table, slow set, user waits, links to rows, "No timing data" fallback) with its placeholder-fill guidance. The empty-log comment now names three h2 sections.

### Task 7: Phase skills pre-approve the runtime
Material risk: none
- [ ] Add `Bash(node .asd/runtime.js:*)` to `claude.allowed-tools` of the phase skills lacking `Bash`: `asd-phase-audit`, `asd-phase-design`, `asd-phase-design-review`, `asd-phase-design-promote`, `asd-phase-impl`, `asd-phase-plan`, `asd-phase-pr`, `asd-phase-retro` (`.asd/skills/<name>/SKILL.md`).

### Task 8: README mirrors
Material risk: artifact: mirror doc
- [ ] `README.md`: update the retro row (duration section, slow set, avoidable user waits); the `runtime.js` description (`timing`, `timing-recover`, `timing-summary`); the sprint folder map (`timing.jsonl`); the `/asd-sprint` behaviour and "Updating ASD" section (version check at new-sprint start, update-then-restart, skipped when self-hosting); and the `/asd-update` command row (sprint-mediated mode).

Orchestrator: after wave 1 and again after wave 2, run `node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply` over the generated views of edited canon (recomputing `canon_hashes`), and commit.
Orchestrator: CHANGELOG v13.8.0 at pr open mode ("No migration script"; sprints started before 13.8.0 show "No timing data").

## Risks (optional)
- Forgotten marks skew totals. The summary's gaps list surfaces them, and retro raises an F-N.
- `timing` on Codex/PowerShell: no `&&` chaining, no JSON on the command line, and ids with spaces are quoted.
- Sprint 025 itself has no ledger: the folder predates the scope step that creates it, so its own retro reads "No timing data".

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | Task 1, Task 2 |
| 2 | Task 3, Task 4, Task 5, Task 6, Task 7, Task 8 |

- Tasks 3-8 cite the contracts Tasks 1-2 define (the commands, "Operation timing", `--check-version`, "Sprint-mediated mode"), so those land first, alone in wave 1.
- Task 3 owns `asd-phase-scope.md`, and Task 4 owns the other ten workflows; Task 7 edits only skill frontmatter, and Task 3 edits only `asd-sprint`'s body. No path overlaps within a wave.

## Out of scope (optional)
- Recording pr merge mode and the release retry (D7).
- Archived-ledger baselines as a slow-flag criterion (they are reported, not flagged; D5).
