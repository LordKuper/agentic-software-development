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
- `## Dependencies` is required and opens with the wave table impl dispatches from; every task sits in exactly one wave (same section)
-->

## Overview

Nine tasks in six waves cover AC-1..AC-20 from `sprint.md`. `audit.md` holds the line-level touch map for every AC. Each task's payload cites the audit sections for its ACs and does not restate them here.

- Tasks 1, 2, 3 and 4 are the four hardenings: stalemate breaker, grounded fail-first proof, audit precedence, retro dedup-then-guardrail.
- Task 5 changes the config schema and its writer (`/asd-init`, `pr`). Task 6 then moves every reader onto the new schema.
- Task 7 writes the `9.0.0.js` migration and sanctions it as a config writer. Task 8 runs it against this repo.
- Task 9 closes the mirrors: README, root `AGENTS.md` tail, release manifest, provider views.

Tasks in the same wave never touch the same file. No task changes the dispatch or commit contract impl runs under. `tests/run.js` content contracts that break (audit.md "Tests that must be rewritten") are impl-test input, not a task.

Decisions fixed at plan (bounded in-scope choices, recorded in `decisions-log.md`):

- The `Defects` table gains an `Entry` column: the `Entry log` row of the impl-test entry that routed the row, or `impl-review` for a red-full-suite defect. Only impl-test rows take part in the stalemate comparison.
- The step 9 routing exit fills its `Entry log` `HEAD analysed` sha. This fixes audit C4, and consecutive entries become well-defined.
- `runtime.js defect-stalemate` reads `test-plan.md` and prints `{stalemate, digest}`. `digest` is a hash of the sorted identity tuples. A decisions-log answer naming that digest suppresses re-escalation on the same set.
- `external-preflight` returns `platform` from `process.platform`. External Review keys its stdin syntax on that value, with the same mapping as today's `system.os`.
- A legacy or unknown `documents.audit` value blocks scope.
- `9.0.0.js` rewrites `config.yaml` only, never sprint `state.json`. `state.json.documents.c4` stays as the frozen effective-diagram boolean. `c4: enabled` with no `project.diagram_tool` becomes `likec4`, the `t_config.yaml` default.
- `/asd-init` probes `gh --version` and `gh auth status`. On failure it stops, naming the install step or `gh auth login`.

## Definition of Done

Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.

Sprint-specific additions:

- `node .asd/sync.js --check` is clean after the final `--apply`.
- `.asd/release-manifest.json` `canon_hashes` and `upstream_hashes` are fresh, including a `9.0.0.js` entry.
- This repo's `config.yaml` carries none of the eight removed keys, and it carries `project.diagram_tool: none`.
- `asd_version` is bumped MAJOR to 9.0.0 in `pr` open mode. `CHANGELOG.md` `## v9.0.0` carries the breaking change and the migration notice (AC-19), including the always-on scoped fan-out and mandatory `gh`.

### Task 1: Stalemate breaker for impl⇄impl-test
Material risk: change: workflow gate
Reachability: impl-test writes `Entry`-tagged Defects rows and the routing `HEAD analysed` at step 9; the next impl-test entry reads the previous entry's rows at step 9 through `runtime.js defect-stalemate`, and impl test-fix leaves `Entry`/`Location`/`Symptom`/`Failing test` unchanged when it flips `Status`
- [ ] AC-1: `sprint-lifecycle.md` impl⇄impl-test cycle (:26) and Impl-test phase (:241) state the stalemate rule. The rounds stay uncapped.
- [ ] AC-2: `t_test-plan.md` Defects gains the `Entry` column. `Location` is the file path, `Symptom` is the runner's first failure line verbatim, and `Failing test` is the runner-reported name. Align `asd-tester.md` Failure triage (:69) only if it restates the column meanings.
- [ ] AC-2: add a `defect-stalemate --plan <path>` subcommand to `runtime.js`. It compares the identity-tuple sets of the last two impl-test entries that routed defects, never `D-N`, and prints `{stalemate, digest}`.
- [ ] AC-3: in `asd-phase-impl-test.md` step 9, run the check before routing, and fill `HEAD analysed` on the routing exit. On `stalemate: true` with no decisions-log answer for that digest, emit `FAILED: stalemate`. The detection rule cites `external-review.md` "Stalemate detection". The options are continue with guidance, accept as debt (hard, `stubs.md` `(accepted-debt)`) or abort. Record the answer with the digest. Add stalemate to the phase's user-contact list (:20-25).
- [ ] AC-1: `asd-phase-impl.md` "Fix modes are unbounded by design" (:44) points to the stalemate rule.

### Task 2: Grounded fail-first proof
Material risk: artifact: rule SSoT
Reachability: impl-test writes the `Regression proof` cell in `test-plan.md` Added tests; impl-review's `asd-reviewer-testing` reads it against `code-style.md` §17
- [ ] AC-4: in the `code-style.md` §17 fail-first bullet (:120), a proof record carries the exact command, its non-zero exit code and the failing test name. A mutation proof carries the same for the mutated run, and a bare claim does not satisfy it. Keep the sentences `tests/run.js` :3912, :3930 and :4310 read.
- [ ] AC-5: the `t_test-plan.md` `Regression proof` cell (:46) takes the AC-4 shape.
- [ ] AC-5: `asd-reviewer-testing.md` rubric (:55) flags a proof row without that evidence, citing §17. Add a line only if the existing §17 citation does not already reach it (audit risk "Economy failure").

### Task 3: Audit completeness and canonical precedence
Material risk: change: workflow gate
- [ ] AC-10: `sprint-lifecycle.md` "Audit phase" (:165), `asd-phase-audit.md` step 2 and `asd-architect.md` audit instructions (:34, :93) require reading every `docs/` document bearing on touched areas. `audit.md` "Existing docs found" lists each one analysed.
- [ ] AC-11: the same homes (rule statement in `sprint-lifecycle.md` only, pointers elsewhere) define a canonical ASD document and say it wins a contradiction. Record both sources and the winner.
- [ ] AC-12: an unsettled contradiction (canonical vs canonical, or no canonical side) is a hard user decision before the audit gate. Add it to the `checkpoints.md` hard list (:7), keeping the `deletion … migration` wording `tests/run.js:4493` reads. `asd-phase-audit.md` records the answer in `decisions-log.md` and `audit.md`.
- [ ] AC-11/12: `t_audit.md` gains one optional contradictions section holding both record kinds. "Subsystems map" is unchanged.

### Task 4: Retro dedup, then guardrail
Material risk: change: ambiguous judgment
- [ ] AC-6: `sprint-lifecycle.md` "Retro phase" (:268-273) orders the work: merge entries and proposals sharing one root cause into one finding citing every `F-N`, check it against rules already in its candidate home, and drop a covered finding with the rule cited.
- [ ] AC-7: each surviving finding gets `Guardrail` (one imperative line) and `Home`, from the amended AC-7 list. A merged finding citing any `F-N` stays in Actions.
- [ ] AC-8: `asd-phase-retro.md` (:10, :19-21) applies the AC-6 then AC-7 order, with home files in its read list. It still applies and promotes nothing, and the empty-log branch still yields proposals.
- [ ] AC-7/8: in `t_retrospective.html`, both tables replace `Recommendation`/`Target` with `Guardrail`/`Home`, keeping `F-N` and `consumer | asd` (`tests/run.js:2963-2995`).

### Task 5: Config schema, init and always-gh PR
Material risk: change: public contract
- [ ] AC-13: in `t_config.yaml`, remove `documents.c4` and give `project.diagram_tool` the values `none | likec4 | mermaid`, with a diagram still requiring decomposition.
- [ ] AC-14/15/16/17/18: in `t_config.yaml`, remove `skip_design_phases`, `git.gh_enabled`, `git.auto_pr`, `system.os`, `system.tools.likec4`, `system.tools.designmd` and `review.scoped_fan_out`. `documents.audit` lists only `auto | always | off`.
- [ ] AC-14: `t_state.json` drops `skip_design_phases`. `documents.c4` stays as the frozen effective diagram boolean.
- [ ] AC-13..18: `asd-init/SKILL.md` stops writing and asking for the removed keys (:30-39, :53-65, :79, :134, :139, :151). It collects `diagram_tool` including `none`, probes likec4 only for `likec4` and Node only for `ux_spec`, and detects OS for commands without a flag. It requires `gh --version` plus `gh auth status`, and stops otherwise.
- [ ] AC-15: `git-strategy.md` (:57-65) drops the `gh_enabled`/`auto_pr` matrix, so the PR is always opened and merged through `gh`. In `asd-phase-pr.md` (:16-17), a `gh` failure is `FAILED` naming the fix. The closure gate is unchanged.

### Task 6: Move config readers onto the new schema
Material risk: change: public contract
Reachability: scope writes frozen `documents.*` (with effective `c4`); the audit exit, design fallback, `asd-sprint` resume and `session-start.js` read the same documents-only collapse test
- [ ] AC-13/14: `sprint-lifecycle.md` "Optional documents", no-op table, collapse and "Design"/"Design-promote" c4 lines (:123-157, :169, :174, :182-184, :198): effective `c4` = `diagram_tool != none` AND decomposition enabled. The collapse test becomes documents-only, taken at the audit exit, with the design workflow's collapse kept as a defensive fallback.
- [ ] AC-14: in `asd-phase-audit.md` (:3, :8), `asd-phase-scope.md` (:7-8), `asd-phase-design.md`, `asd-phase-design-review.md` (:7, :20-21) plus its SKILL description, `asd-phase-design-promote.md` (:5, :8), `asd-sprint/SKILL.md` (:42, :47), `checkpoints.md:62` and `session-start.js:159`, drop `skip_design_phases`. A legacy state carrying it still resolves by its frozen documents.
- [ ] AC-13: `artifact-layout.md` (:36, :59, :96, :100), `core.md` glossary (:25), `asd-architect.md` (:41, :43, :60, :99) and `t_subsystems.md` (:3, :16) name `diagram_tool` instead of `documents.c4`.
- [ ] AC-16: `external-review.md` (:11, :19-23) and `asd-external-review.md` (:4, :39, :72, :76-77) take the platform from the `external-preflight` output. `runtime.js` `externalPreflight` returns `platform`.
- [ ] AC-17: remove `scopedFanOut` and the `--scoped-fan-out` flag from `runtime.js` (:319-320, :370, :401) and `asd-phase-impl-review.md` (:22, :28-30, :35, :90) together. Delete `review-policy.md` :101 flag and :177 "absent means disabled", reword :179 and `sprint-lifecycle.md:335`, and keep :337.
- [ ] AC-18: `sprint-lifecycle.md:9` and `asd-phase-scope.md` (:7) accept only `auto | always | off`, and any other value blocks.

### Task 7: 9.0.0 migration and sanctioned config writer
Material risk: change: migration
- [ ] AC-19: add `.asd/migrations/9.0.0.js` per the `6.0.0.js` contract. It is line-based, preserves comments and EOL, writes atomically, is idempotent, and skips and warns on an unrecognized shape. It maps `c4`, `skip_design_phases` and legacy audit values as AC-19 states, drops the eight removed keys, and never touches sprint state. Its header names the self-hosting plan-declared run (Task 8) as the only non-consumer use.
- [ ] AC-19: `core.md` invariant (:30), `t_AGENTS.md` (:46) and `asd-update/SKILL.md` (:4) name a release migration run by `/asd-update` as a sanctioned config writer, limited to release-mandated key renames and removals.

### Task 8: Migrate this repo's config
Material risk: change: migration
- [ ] AC-20: from the repo root, run `node -e "require('./.asd/migrations/9.0.0.js')({ repoRoot: process.cwd() })"` against `.asd/project/config.yaml`, as authorized by the user (decisions-log 2026-09-15 audit questions). The result drops the eight keys, sets `project.diagram_tool: none`, and leaves `prd`/`ux_spec`/`adr` disabled and `audit: auto`.
- [ ] AC-20: a second run reports no change (idempotence). Commit the config change.

### Task 9: Mirrors, manifest and provider views
Material risk: artifact: release manifest
- [ ] AC-9/20: update README.md: prerequisites (:27, :42), phase table pr row (:169), scoped fan-out paragraph (:223), config schema (:246-290), folder map (:344), tools (:371-392) and FAQ (:435, :441). Keep the diagram-tool enum equal to `t_config.yaml`'s.
- [ ] AC-9: remove `c4` and `skip_design_phases` from the root `AGENTS.md` hand-edited tail (:60).
- [ ] AC-9: run `node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply` for every generated view that audit.md "Touched areas" lists, plus the root `AGENTS.md` managed block. `--check` must be clean.
- [ ] AC-9: in `.asd/release-manifest.json`, refresh `canon_hashes` for changed agents/skills and `upstream_hashes` for changed managed files, and add `9.0.0.js`.

## Risks
- Iteration-1 review scope is about 40 files, above `SPLIT_THRESHOLD_FILES` 25, so expect 2 parts per internal reviewer.
- Stalemate identity fails open if a tester paraphrases `Symptom`. The template column rule plus the verbatim runner line are the only guard. impl-test should cover `defect-stalemate` with fixtures for a line shift, a reworded symptom and an equal set.
- The `9.0.0.js` YAML rewrite has no parser. impl-test needs fixtures for CRLF, an absent `documents` group, `skip_design_phases` with no group, and an already-migrated config.
- The stale `--scoped-fan-out` flag would swallow the next argument, so Task 6 changes runtime and workflow in one commit.
- This sprint's frozen `state.json` carries `skip_design_phases: true` while Task 6 removes its readers. Its documents are all `false`, so resume and the hook still collapse.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | 1, 5 |
| 2 | 2, 3, 7 |
| 3 | 4 |
| 4 | 6 |
| 5 | 8 |
| 6 | 9 |

- Task 2 depends on Task 1 (`t_test-plan.md`).
- Task 3 depends on Task 1 (`sprint-lifecycle.md`).
- Task 7 depends on Task 5 (final schema).
- Task 4 depends on Task 3 (`sprint-lifecycle.md`).
- Task 6 depends on Tasks 4 and 5 (`sprint-lifecycle.md`), and on Task 3 (`checkpoints.md`, `asd-phase-audit.md`, `asd-architect.md`), Task 7 (`core.md`) and Task 1 (`runtime.js`).
- Task 8 depends on Tasks 5, 6 and 7, and is alone in its wave because it rewrites project settings.
- Task 9 depends on every other task.

## Out of scope
- `.asd/project/custom-design-rules.md:12` still names `documents.c4`. The file is user-owned and outside the self-hosting allowlist, so it is left for the user.
- Rewriting sprint `state.json` in `9.0.0.js`.
- A CHANGELOG version section before `pr` open mode.
