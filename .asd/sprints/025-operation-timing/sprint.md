---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 025-operation-timing

## Goal
Record how long the workflow's operations take at every phase of a sprint, and have the retro phase analyse that record: what took too long, why, and what to change to shorten it and make the process cheaper overall. Today a sprint keeps only `state.json` `created_at`/`updated_at` and commit times, so a retro cannot tell where the hours went or separate machine time from time spent waiting on the user.

## Acceptance
- AC-1: every sprint keeps one machine-readable timing ledger in its folder. An entry records an operation's kind, its id, its start and end (ISO 8601) and the parent operation it ran inside. Entries are written through a deterministic `.asd/runtime.js` command, never hand-computed by a model. The ledger is a new artefact: `artifact-layout.md` names its path, owner and format, and it is archived with the sprint.
- AC-2: the recorded operation kinds are: phase (each entry to exit, re-entries and re-runs counted separately); agent dispatch (agent, dispatch id, tier, resolved model); review iteration (wave and iteration); test-suite run (impacted or full); External Review CLI call; user wait (a user decision or free-text question asked, to its answer). User wait is recorded apart from machine time, so neither total hides the other.
- AC-3: recording covers every phase of both `standard` and `lite`, on both Claude Code and Codex. It relies on no host-only mechanism, so each `asd-phase-*` workflow states where it opens and closes its operations.
- AC-4: recording never gates the workflow. A failed write warns and the phase continues. An operation left open by a lost session is closed on resume as `interrupted`, at the last evidence of activity, and is never silently dropped or counted as finished. A sprint without a ledger, such as one started before this release, reads as "no timing data" downstream and fails nothing.
- AC-5: a `.asd/runtime.js` summary command turns the ledger into totals by phase, by kind and by agent/tier/model. It reports wall time, machine time and user-wait time; the longest operations; rework time (review-fix and test-fix rounds, re-runs, interrupted operations); and, when earlier archived sprints have ledgers, how each phase and kind compares with their median. Its output is deterministic for a given ledger.
- AC-6: the retro phase reads that summary as part of the run record. `retrospective.html` gains a duration section: the summary table plus the slowest operations. Each operation the summary flags as slow becomes a systemic proposal, giving what took long, its cause from the run record, the proposed change, and the expected time saving. Proposals go through the existing findings order (merge, coverage check, `Guardrail`/`Home`) and nothing is applied. Like every other retro finding, each one's `Home` is split into a consumer-project action (the project's own config, commands, tests or docs, such as a slow suite or build) and an ASD-framework action (rules, workflows, agents, routing), and either half may be empty. With no ledger, the section says there is no timing data and the retro proceeds as today.
- AC-7: the mirrors follow in the same change: `sprint-lifecycle.md` ("Retro phase", "State recovery"), the `t_retrospective.html` and any new template, README (folder map, retro description), `release-manifest.json` `managed_paths` and `canon_hashes` for new canon, the generated provider views, CHANGELOG, and `tests/run.js` contract pins for the ledger command, the summary command and the retro section.
- AC-8 (scope amendment, user request): when `/asd-sprint` starts a new sprint (its new-sprint flow, before scope), a consumer project compares its `release-manifest.json` `asd_version` with the version on the configured ASD repo (`repo`/`branch` in the same manifest). When the remote one is newer, the user gets a decision: update now through `/asd-update`, then start the sprint, or continue on the current version. Nothing is updated without that choice. An unreachable remote warns and continues. The check is skipped under `self_hosting: enabled` and on resuming an active sprint, since a framework update mid-sprint is risky. Mirrors: the `asd-sprint` skill, README, CHANGELOG and `tests/run.js` pins.

## Out of scope (optional)
- Token or cost accounting. This sprint covers duration only.
- Backfilling timing for archived sprints, or reconstructing it from git or host transcripts.
- Dashboards or charts outside `retrospective.html`.
- Applying retro proposals automatically, or adding speed budgets that block a phase.
