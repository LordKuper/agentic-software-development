---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

## Overview
`asd-update` delegates to a one-behaviour `asd-sync` (AC-1, AC-2), and the `pr` phase merges in the run that opened the PR, waiting on a new bounded runtime command (AC-3..AC-5). The sprint carries seven retro and issue fixes (AC-6..AC-13). All five Tasks run in wave 1 on disjoint paths. New or changed rule homes the Tasks cite by name: `git-strategy.md` "Merging a PR" (wait, merge, blocked merge), `sprint-lifecycle.md` "PR phase" (modes and exits), `.asd/runtime.js` `checks-wait`, whose output values are `pass`, `none`, `fail` and `timeout`.

Done at plan (orchestrator): AC-8's line in `.asd/project/custom-coding-rules.md` and the `gh pr checks`/`gh pr merge` entries in `docs/architecture/tech-reference/gh-2.90.md`, both outside the dev write allowlist.

Orchestrator, after wave 1: sync the changed views per `sprint-lifecycle.md` "Self-hosting".

External APIs: Task 2 calls `gh pr checks <n> --json bucket`; Task 3's rule text names `gh pr merge <n> --squash`. Both are in `docs/architecture/tech-reference/gh-2.90.md`.

Restating sites, from a repo grep of `asd-sync`, `await-merge`, `merge mode` and "later merges": Task 1 owns the two skills and `asd-phase-scope.md` step 1; Task 3 owns `asd-phase-pr.md`, `asd-phase-pr/SKILL.md`, `asd-sprint/SKILL.md`, `sprint-lifecycle.md`, `git-strategy.md` and `artifact-layout.md`; Task 5 owns `README.md`. Unchanged and still correct: `.asd/hooks/session-start.js` (`await-merge` reads as a PR still open), both workflow definitions' `next.pr`, `.asd/runtime.js` `CHAIN_EXITS`, and `update.js`'s "Run `sync.js --apply`" log line, which serves the script's direct run (README "manual fallback").

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.

### Task 1: asd-sync single behaviour; asd-update delegates
Material risk: change: asd-sync decision wording and the orphan case
- [ ] `.asd/skills/asd-sync/SKILL.md` (AC-1): description states unedited files regenerate with no question and only a hand-edited one is asked about, and names `asd-update`'s delegation among its triggers; step 1 lists the statuses `sync.js --check` really reports, `orphan` and `orphan-unmarked` included
- [ ] `.asd/skills/asd-sync/SKILL.md` (AC-1): step 3: `missing`, `stale` and `orphan` (ownership-marked, `sync.js` deletes it) queue for apply with no question; each `modified-foreign` takes the request user decision overwrite / keep as-is / show diff, its overwrite risk flagged; `orphan-unmarked` is a consumer's file, left alone and reported. Step 4 applies the unedited group with no `--force` and the confirmed `modified-foreign` group with `--force`, skipping an empty group. `## Rules` `never` narrows to overwriting a `modified-foreign` file without a per-file decision
- [ ] `.asd/skills/asd-update/SKILL.md` (AC-2): step 5 delegates to `asd-sync` after a real run, a partial update included, never after `--dry-run`; step 7 keeps the reminder that the user's own entries in `.claude/settings.json` and `.codex/hooks.json` are theirs and loses "run sync next"; `## Delegates` lists `asd-sync`; `## Outputs` adds `asd-sync`'s writes; `## Rules` `never: touch` excepts `asd-sync`'s owned-entry merge; `## Return` `NEXT:` is `none`; "Sprint-mediated mode" states the `asd-sync` writes stay uncommitted with the rest
- [ ] `.asd/workflows/asd-phase-scope.md` step 1 "ASD update" (AC-2): remove its own `sync.js --apply` clause, `asd-update` now covering it

### Task 2: checks-wait runtime command
Material risk: change: gh output parsing and wait bounds
- [ ] `.asd/runtime.js` (AC-4): named constants for the 60 s grace, the 30 min limit and a 10 s poll; a function reading `gh pr checks <n> --json bucket` through `spawnSync` into `pass`, `pending`, `fail` or `none`: stderr `no checks reported` is `none`, any `fail` or `cancel` bucket is `fail`, any `pending` is `pending`, else `pass` (`skipping` counts as pass); any other `gh` failure throws
- [ ] `.asd/runtime.js` (AC-4, AC-5): `waitForChecks` loops that read with injected read, sleep and clock (the tester's stubs are its caller): `none` past the grace returns `none`, `fail` returns at once, `pending` past the limit returns `timeout`, `pass` returns once no check is pending; `none` inside the grace polls on
- [ ] `.asd/runtime.js` (AC-4): subcommand `checks-wait --pr <n>` prints `{"checks":"<value>"}`, exits 0 on `pass`/`none`, 1 on `fail`/`timeout`, 2 on a `gh` failure (the existing `fail` path); added to the usage line and `module.exports`

### Task 3: Same-run merge rules, scratch cleanup, memory check
Material risk: change: pr mode hand-over and blocked-merge exit
Reachability: pr open mode writes `state.json.pr` at step 3; pr merge mode reads it at step 1 from `origin/<state.branch>`; interrupted before the merge, `<state.branch>` holds `pr.number` and a later resume re-enters merge mode.
- [ ] `.asd/rules/git-strategy.md` "Merging a PR" (AC-3, AC-4, AC-5): the orchestrator merges in the run that opened the PR, no user gate and no further `/asd-sprint`: `node .asd/runtime.js checks-wait --pr <n>`, a long-running command (host background, or a host timeout above its 30 min limit), then `gh pr merge <n> --squash` on `pass` or `none`. State the two bounds and that a required check holds the merge at the host whatever the grace. The blocked-merge paragraph covers a failing check (`fail`), the exceeded wait (`timeout`), a conflict and a branch-protection rule: reported, not forced, the PR stays open, the phase exits `NEXT: await-merge` and a later `/asd-sprint` resumes merge mode
- [ ] `.asd/rules/git-strategy.md` "Commit before review" Memory content check (AC-12): a dev or tester runs `node .asd/runtime.js memory-check` on its own memory commit and fixes a hit before committing; the "not gated" clause goes
- [ ] `.asd/rules/artifact-layout.md` (AC-6, AC-12): "Scratch directory" adds that pr open mode deletes every `<scratch-dir>/<NNN-slug>-*` file the sprint wrote (`asd-phase-pr.md`); "Agent memory" Content says the check runs at every memory commit
- [ ] `.asd/workflows/asd-phase-pr.md` (AC-3, AC-5, AC-6): `## Entry` `merge` mode adds open mode's hand-over; open mode step 4 deletes the sprint's scratch files and continues in merge mode, the sprint staying at its normal path; merge mode step 1 waits and merges per "Merging a PR", a blocked merge writing nothing, reporting its cause and emitting `NEXT: await-merge`; `## Exit` routes merged → `done`, blocked merge → `await-merge`; `## Return` keeps its tokens, `pr-open` meaning a blocked merge
- [ ] `.asd/skills/asd-phase-pr/SKILL.md` (AC-3): description says it merges in the same run
- [ ] `.asd/skills/asd-sprint/SKILL.md` Step 3 (AC-3, AC-5): the `pr` phase runs open mode into merge mode in one dispatch, `NEXT: done` halting the chain; `NEXT: await-merge` is a blocked merge (PR open, `phase="pr"`), halt, a later resume re-entering merge mode
- [ ] `.asd/rules/sprint-lifecycle.md` "PR phase" (AC-3, AC-5): Modes: `pr=null` opens the PR and continues in merge mode in the same run; `pr.state="open"` merges on a resume; merge mode returns `NEXT: done`, or `NEXT: await-merge` on a blocked merge. "Merged-unclosed": `state.json.pr` is pushed before merge mode, not before `NEXT: await-merge`

### Task 4: External Review, audit, PRD template, severity floor
Material risk: change: audit contradiction and severity-floor wording
- [ ] `.asd/agents/asd-external-review.md` `## Rules` (AC-7): apply the floor from `payload.floor`, never one of its own or the CLI's; cite the `{{wraps_cli}}` finding id and source inside the Description cell; the Kept findings table keeps the template's five columns verbatim
- [ ] `.asd/workflows/asd-phase-audit.md` step 5 (AC-9): `phase="audit"` is written on every non-collapse exit, the "only when step 1 skipped audit" clause gone
- [ ] `.asd/workflows/asd-phase-audit.md` (AC-10): `## Rules` "Contradictions": a sprint criterion that deliberately changes a canonical document is a planned change, not a contradiction; step 3b: an answer changing a sprint criterion goes through `sprint-lifecycle.md` "Scope amendment" with a new id, never an in-place edit, `plan` carrying its Task
- [ ] `.asd/templates/t_prd.html` line 30 (AC-11): the three connectives become `{{story_as}}`, `{{story_i_want}}`, `{{story_so_that}}`, filled in `language.docs`
- [ ] `.asd/rules/review-policy.md` "Iteration severity floor" (AC-13): a below-floor observation goes neither in the Findings table nor in the ledger's `findings`, and an APPROVE report's Findings table is empty

### Task 5: README mirrors
Material risk: artifact: README mirror rows
- [ ] `README.md` line 108 (AC-2): `/asd-update` runs `/asd-sync` itself; running `update.js` directly still needs `/asd-sync` or `sync.js --apply`
- [ ] `README.md` line 215 (AC-1): `/asd-sync` row: unedited files regenerated with no question, hand-edited ones per-file overwrite/keep/diff, run automatically after `/asd-update`
- [ ] `README.md` line 197 (AC-3, AC-4, AC-5): pr row: ASD waits for checks (60 s to register, 30 min to finish) and merges in the same run, with no confirmation; exit tokens are `done` (merge confirmed) and `await-merge` (merge blocked, PR open, a later `/asd-sprint` resumes it)

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | Task 1, Task 2, Task 3, Task 4, Task 5 |

Task 3 names Task 2's `checks-wait` in rule text only, so neither waits on the other; the command's name and output values are fixed in the Overview.
