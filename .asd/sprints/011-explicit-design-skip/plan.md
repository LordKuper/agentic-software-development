---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

## Overview

Six tasks in four waves cover `sprint.md` AC-1 through AC-7. The acceptance-criteria source is `sprint.md`, because `documents.prd` is disabled. `audit.md` is the input for every task, and its G-/R- ids name the line each edit attaches to. No open stub touches the scope.

**Names fixed here:**
- The config field is `skip_design_phases: enabled | disabled`. It sits at top level beside `self_hosting` and `user_gates`, outside the `documents` group (`audit.md` G-1). Absent means `disabled`.
- The frozen state field is the bare boolean `skip_design_phases`, seeded from the placeholder `"{{SKIP_DESIGN_PHASES}}"`. A `state.json` without it means `false`.

**Mechanism:**
- With the frozen value `true`, scope freezes `documents.prd/ux_spec/adr/c4` as effective `false` (G-3).
- The audit workflow's exit then performs the one skip write and returns `NEXT: plan` (G-4 option A).
- No design skill or workflow is ever loaded.
- The session hook reports `plan` after `audit` (G-6).

## Definition of Done

Standing DoD applies (`sprint-lifecycle.md` "Plan file format") and is not restated here.

Sprint-specific additions:
- `node .asd/sync.js --check` is clean after Task 5.
- AC-6 is verified at `pr` by reading `.asd/project/config.yaml`, which sits outside the review change surface (`audit.md` R-1).

### Task 1: Config field and frozen state contract (AC-1, AC-2, AC-4)
Material risk: change: new config and state contract read by scope, audit and the session hook
Reachability: `scope` writes `state.json.skip_design_phases` and the effective `documents.*` at step 3a; `audit` reads them at its exit step, and `session-start.js` reads `skip_design_phases` when computing the next phase.
- [x] Declare `skip_design_phases: enabled | disabled` in `.asd/templates/t_config.yaml`, top level, with its absent default. Align the line-4 comment with the rule that settings change only via `/asd-init` (R-3).
- [x] Add `"skip_design_phases": "{{SKIP_DESIGN_PHASES}}"` to `.asd/templates/t_state.json`. Keep the file valid JSON.
- [x] Add one home statement to `sprint-lifecycle.md` "Optional documents":
  - the field is frozen at scope as a bare boolean;
  - config absent means `disabled`, and state absent means `false`;
  - when it is `true`, effective `documents.prd/ux_spec/adr/c4` freeze `false`, following the effective-`c4` precedent, while `documents.audit` is untouched (G-2, G-3, R-6).
- [x] Extend `asd-phase-scope.md` step 3a:
  - seed the placeholder, accepting only `enabled|disabled`;
  - apply the effective-document freeze;
  - when any configured design document is suppressed, append one decisions-log line naming those documents (AC-4).

### Task 2: Skip routing through the audit exit (AC-3)
Material risk: change: workflow routing and the plan precondition chain
Reachability: `audit` writes `phase="design-promote"` and appends the three names to `skipped_phases` at its exit; `asd-sprint` reads the returned `NEXT: plan` at step 3, and `plan` reads `skipped_phases` at its preconditions.
- [x] Make both exits of `asd-phase-audit.md` read the frozen `skip_design_phases`: the step 1 skip branch and the step 4 post-gate advance. When it is `true`:
  - perform one inline mechanical write: `phase="design-promote"`, `["design", "design-review", "design-promote"]` appended to `skipped_phases`, and one decisions-log line naming the setting;
  - return `NEXT: plan`.
- [x] Widen the return contract to `NEXT: <design | plan>`, never `plan` alone (R-5). Fix the line-3 "recorded reason" drift (G-12).
- [x] `sprint-lifecycle.md`:
  - add the second trigger to "Multi-phase skip", the no-op table and the collapse line, which currently name the design workflow as the only collapse site (G-9);
  - leave "Eleven mandatory" and the chain line untouched (R-4).
- [x] `checkpoints.md` line 62: `plan` also accepts the explicit skip (G-5).
- [x] `asd-phase-plan.md` preconditions: accept `skipped_phases` containing the design block as design-promote done (G-5).
- [x] `asd-phase-design-review.md` and `asd-phase-design-promote.md`: generalise the collapse wording so it no longer implies a documents-only trigger (G-9).
- [x] `.asd/skills/asd-sprint/SKILL.md` step 3: name audit's `NEXT: plan` route, and design's existing one, beside the other listed exceptions.
- [x] `.asd/skills/asd-sprint/SKILL.md` resume flow: state that resume dispatches the successor of a skipped phase, and that design-block targets are not offered for a re-run when the setting is on (G-7).

### Task 3: Session hook next-phase (AC-5)
Material risk: artifact: hook that must exit 0 and never throw on any state shape
Reachability: `scope` writes `state.json.skip_design_phases`; `.asd/hooks/session-start.js` reads it when computing `next`, and must agree with audit's `NEXT: plan`.
- [x] In `.asd/hooks/session-start.js`, compute `next` as `plan` when `phase === 'audit'` and `state.skip_design_phases === true`, otherwise unchanged (G-6).
- [x] Leave `PHASE_CHAIN` unchanged.

### Task 4: `/asd-init` offers the field in fresh and diff mode (AC-1, AC-6 prerequisite)
Material risk: change: the only skill allowed to write project settings
- [x] Fresh mode: add `skip_design_phases` to the step 2 batch with its default, and to the proposal/write steps and the artefact list (G-8).
- [x] Re-init diff mode: list fields present in `t_config.yaml` but absent from the current config, each with its absent default, so a newly shipped field is offerable (G-8).
- [x] Self-hosting recommendation: suggest `enabled` when every design document is disabled.

### Task 5: Mirrors and generated views (AC-7)
Material risk: none
- [ ] README config schema block: add `skip_design_phases` with values and absent default. Touch the phase table or flowchart only if their wording contradicts the new route (G-10).
- [ ] `AGENTS.md` tail below `<!-- asd:end -->`: extend the lean-profile sentence to name `skip_design_phases: enabled` (G-10).
- [ ] Run `node .asd/sync.js --apply` once over every affected generated view: `.claude/hooks/session-start.js`, `.codex/hooks/session-start.js`, `.claude/skills/asd-sprint/SKILL.md`, `.agents/skills/asd-sprint/SKILL.md`, `.claude/skills/asd-init/SKILL.md`, `.agents/skills/asd-init/SKILL.md`. This refreshes `release-manifest.json` hashes. Then run `--check` (R-8).

### Task 6: Enable the setting in this repo (AC-6)
Material risk: artifact: project config written only by `/asd-init`
- [ ] Register `MS-N`: the user runs `/asd-init` diff mode on the sprint branch and sets `skip_design_phases: enabled` (R-1).
- [ ] Review `git diff` after the run and keep only the config change plus any managed-block drift that is already current (R-2). The orchestrator commits it before `impl-review`.

## Risks
- If a dev edits `sprint-lifecycle.md` beyond its section, Task 1 and Task 2 could collide. Their waves are serialised for that reason.
- Sprint 011 itself runs under the implicit collapse (`audit.md` R-9). The new route is exercised only by tests.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | 1 |
| 2 | 2, 3, 4 |
| 3 | 5 |
| 4 | 6 |

- Tasks 2, 3 and 4 depend on Task 1, because they consume the field and state names it declares.
- Task 5 depends on Tasks 2-4: it syncs their canon edits in one pass, so parallel `--apply` runs never race on `release-manifest.json`.
- Task 6 depends on Task 5: the user invokes `/asd-init` from its generated view.
