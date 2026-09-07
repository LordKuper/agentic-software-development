---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 008-retro-007-remediation

## Goal

Resolve every problem identified in the sprint 007 retrospective
(`.asd/sprints/archived/007-retrospective-phase/retrospective.html`). That file's
**Actions** and **Systemic proposals** tables are the source of truth for scope; each
`AC-N` below traces to one row.

Two classes of work, one sprint:

- **Actions** — remediation of the seven friction entries `F-1`..`F-7`, whose dominant
  signal was recurrence: a correction that landed only in one agent's memory did not
  survive the next dispatch. Every fix here therefore lands as a rule, a contract or a
  tool behaviour, never as guidance in a single agent file.
- **Systemic proposals** — five changes read off how the sprint actually ran (three
  review iterations, forty-two findings, eight implementation dispatches), each aimed
  at a recurring cost rather than at a specific failure.

Self-hosting sprint: this repo IS the ASD framework, so the retrospective's `asd` and
`consumer` targets are both edited here.

## Acceptance

### Actions (friction remediation)

- AC-1: `F-1`/`F-5` — a split read-only review is a documented contract, not an
  improvisation: `.asd/rules/review-policy.md` states when a read-only dispatch is too
  large to complete in one turn, how that reviewer's rubric is partitioned, and the
  shape of the resulting half-verdicts and their merge into one recorded verdict; the
  `*-review` phase workflows implement that contract so a split never has to be invented
  after a failure.
- AC-2: `F-2` — `.asd/rules/providers.md` states that writing a large artifact uses the
  file-write semantic operation, never a shell heredoc, so the shell layer's quoting
  constraints are never imposed on artifact content.
- AC-3: `F-3`/`F-7` — `.asd/rules/artifact-layout.md` states that agent memory lives at
  the provider-view root and never inside a sprint tree, and that a sprint folder holds
  only the artifacts the path map names. The statement is a rule, reachable by any agent
  on any dispatch — not an entry in one agent's memory.
- AC-4: `F-4` — `.asd/sync.js` reports an `--apply` target that matches nothing as an
  error instead of folding it into an ok result, so a wrong argument can no longer
  succeed silently.
- AC-5: `F-4` — the sync-step argument wording is corrected everywhere it is described:
  `.asd/templates/t_AGENTS.md`, root `AGENTS.md`, and
  `.asd/project/custom-coding-rules.md`, so a fresh consumer project does not inherit
  the misleading instruction.
- AC-6: `F-6` — an interrupted reviewer dispatch has a defined outcome in
  `.asd/rules/review-policy.md`: recorded as an availability skip for that iteration, the
  way an unavailable external reviewer already is, rather than requiring a full re-run
  with no record that the first attempt happened.

### Systemic proposals

- AC-7: implementation dispatches carry the same over-engineering and SSoT checklists
  that reviewers judge against — `.asd/rules/code-style.md` and
  `.asd/workflows/asd-phase-impl.md` make the checklist applicable at authoring time, not
  only at design and review time.
- AC-8: the external-review negative cache is checked before the scope manifest is
  assembled and the agent dispatched, not after — `.asd/workflows/asd-phase-impl-review.md`
  and `.asd/rules/external-review.md` agree on that order, so a known-unavailable provider
  costs no manifest assembly and no dispatch.
- AC-9: `.asd/rules/git-strategy.md` states plainly that the main orchestrator commits its
  own bookkeeping at phase exit, so a dispatched agent never commits orchestrator-owned
  files defensively to satisfy the next gate's clean-tree precondition.
- AC-10: the plan's material-risk declaration distinguishes risk-to-the-change from
  risk-to-the-artifact, and task routing reads that distinction — `.asd/rules/sprint-lifecycle.md`
  plan format and `.asd/runtime.js` routing input agree — so a mechanical edit to a
  high-stakes artifact no longer routes to the most expensive tier by that fact alone.
- AC-11: a phase states the artifacts it hands to the next one — `.asd/templates/t_state.json`
  and `.asd/rules/sprint-lifecycle.md` — so a cycle re-entry reads the derived scope list
  and diff base instead of rebuilding what the previous phase already knew.

### Cross-cutting

- AC-12: cross-file consistency holds for every change above — `README.md` mirrors
  (phase list, agent roster and model tiers for both providers, config schema, folder
  map, command list), `core.md` "See also", the eleven-phase chain, template variables,
  and `.asd/release-manifest.json` (`managed_paths`, `canon_hashes`, `model_families`).
- AC-13: `node tests/run.js` is green, with coverage extended to the new behaviour that
  is machine-checkable — at minimum the `.asd/sync.js` unmatched-target error of AC-4.
- AC-14: every canonical edit is reflected in the generated provider views via
  `.asd/sync.js --apply`; no generated file is hand-edited and no view is left stale.

## Out of scope

- The `F-1`/`F-5` recommendation to "keep sprint scope small enough that one reviewer
  dispatch covers the diff" — a scoping practice for future sprints, not a change to any
  file in this repository. Recorded here so its absence is deliberate rather than missed.
- Any behaviour not named by a row of the sprint 007 retrospective's two tables.
