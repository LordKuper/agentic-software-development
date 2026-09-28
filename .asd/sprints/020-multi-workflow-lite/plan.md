---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

## Overview
This plan implements sprint 020 (AC-1..AC-9 from `sprint.md`; `documents.prd` is disabled, so `sprint.md` is the acceptance-criteria source). The sprint adds two declarative workflow definitions, `standard` (today's lifecycle) and `lite`. It freezes the chosen workflow in `state.json`, rewires every hard-coded chain and roster site found in `audit.md` to read from the definitions, adds lite's combined internal reviewer, a `persist-review` runtime command (AC-9) and an in-place fix for low-severity test-only findings (AC-8). AC-8 and AC-9 apply to both workflows (decisions-log.002.md). The sprint itself runs on the current lifecycle.

Plan-level decisions. Wave-2 Tasks cite these names and homes before they exist, so each home is fixed here by exact file and heading:
- **Definition files**: `.asd/workflows/standard.json` and `.asd/workflows/lite.json`. They are JSON because every consumer is zero-dependency. Keys, and nothing else:
  - `name`;
  - `phases` (ordered, ending before the `done` pseudo-phase);
  - `next` (phase → allowed `NEXT:` targets, including the impl cycle and `pr`'s `await-merge`/`done`);
  - `reviewers.design` and `reviewers.impl` (verdict keys; lite has `design: []` and `impl: ["combined", "external"]`);
  - `rollback_reset` (review node → phases that reset it: standard `design: [scope, audit]` and `impl: [scope, audit, design, design-review, design-promote, plan]`; lite `design: []` and `impl: [scope, audit, plan]`).

  Semantics stay as prose in the rule docs. The design-block collapse applies only to a workflow whose `phases` contain `design`. Design-promote works from drafts when `design` precedes it, and from the accepted implementation when it follows `impl-review`. Both rules are derived from `phases`, never stored as a flag.
- **Frozen choice**: `state.json.workflow` (`"{{WORKFLOW}}"` in `t_state.json`, seeded at scope). An absent field reads `standard`. It is chosen by a hard user decision in `asd-phase-scope.md` step 1, which is its single home; `asd-sprint` does not ask it again. The choice is listed on `checkpoints.md` "Gate policy" hard list and in the "Gate inventory" as `workflow choice`.
- **Rule home**: a new `## Workflows` section in `.asd/rules/sprint-lifecycle.md`, placed directly before `## Phases (all mandatory)`. It holds the definition-file contract, the selection and freeze rule, and every lite delta: chain, AC source always `sprint.md`, design-promote after impl-review with no drafts and no review but hard gates kept, the no-op rule, the rollback reset read from `rollback_reset`, retro after design-promote, and the impl-review roster. Other files cite `sprint-lifecycle.md` "Workflows" and never restate these rules.
- **Combined reviewer**: a new agent, `.asd/agents/asd-reviewer-combined.md`, verdict key `combined`, model opus/high and codex sol/high like the other internal reviewers. Its `## Review rubric` holds only its own `Overall quality` entry. `runtime.js emit-manifest --reviewer combined` composes the rubric entries of the correctness, efficiency and documentation agents plus that entry, and never copies rubric text. The documentation entries are n/a'd by a new predicate, `no documentation file in scope`, which lives in `runtime.js` `NA_PREDICATES`. It is listed in the `review-policy.md` "Reviewer responsibility" and "DoD per review phase" tables (a lite impl-review row).
- **AC-9 command**: `node .asd/runtime.js persist-review --phase <design|impl> --reviewer <key> --in <path> --out-dir <iter dir> [--late]`. It validates the first-line token, and the ledger for internal reviewers. It writes `<reviewer>.md` (`.late.md` with `--late`) and `<reviewer>.findings.json`, then prints `{token, findings:[{id,severity,location}]}`. `state.json` stays orchestrator-written. The orchestrator's later appends (`resolved:`, `answer:`, `Interrupted attempts:`) remain appends and are never a re-authoring of reviewer text. Home: `review-policy.md` "Coverage ledger" Persistence paragraph.
- **AC-8 route**: home is a new `### Low-severity test-only findings` subsection under `review-policy.md` "Autofix vs escalation". It fires only when every unresolved finding of the current wave iteration, External included, is severity `low` and every path in its location (from `persist-review`'s findings JSON) is a test file (`runtime.js` `isTest`) or `test-plan.md` or one of its segments. Otherwise it falls through to review-fix. When it fires, impl-review dispatches `asd-tester` to fix in place and commit with an `ASD-Task: <finding id>` trailer, and the orchestrator appends `resolved: <ids> — test-fix, <date>`. `sprint-lifecycle.md` "State recovery" "User-resolved findings" gains the `test-fix` kind, so that verdict counts as satisfied. The wave then advances, or the terminal full suite runs.

Change surface: 40 files

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format"); it is not restated here.
Sprint-specific additions:
- `node .asd/sync.js --check` is clean after the final sync.
- A grep over canon, README and AGENTS.md for a hard-coded eleven-phase chain, "eleven"/"11 phases" count words, "4 internal reviewers" and `PHASE_CHAIN` finds only sites that cite a definition file or are scoped to `standard`.
- Sprint 020's own `state.json`, which has no `workflow` field, still resolves as `standard` in the session-start hook.

### Task 1: Workflow definitions and runtime roster/persistence core
AC: AC-1, AC-2, AC-3, AC-4, AC-6, AC-9
Material risk: change: public contract (state.json schema, runtime CLI)
Reachability: scope writes `state.json.workflow` at step 1; the hook, `asd-sprint` resume and the phase workflows read it at entry (absent = `standard`)
- [x] Add `.asd/workflows/standard.json` and `.asd/workflows/lite.json` with exactly the keys in Overview; the `standard` values must reproduce today's chain, `NEXT:` targets, rosters and rollback-reset table (`sprint-lifecycle.md` lines 17-20, 56-63)
- [x] Add `"workflow": "{{WORKFLOW}}"` to `.asd/templates/t_state.json`
- [x] `.asd/runtime.js`: add a zero-dependency definition loader (read + shape-validate, throw on unknown name or malformed file) and derive the accepted reviewer keys from the union of every definition's `reviewers`; add `combined` to `INTERNAL_REVIEWERS`
- [x] `.asd/runtime.js` `emit-manifest --reviewer combined`: compose the correctness + efficiency + documentation rubric entries plus the combined agent's own entry; add the `no documentation file in scope` predicate to `NA_PREDICATES` and wire the documentation entries to it in `NA_TARGETS`
- [x] `.asd/runtime.js`: add the `persist-review` command per Overview (token and ledger validation reuse `ledgerFromText`/`validateCoverageLedger`; findings parsed from the Findings table of `t_review.md` / `external-review/t_review-report.md`), plus its usage string and export

### Task 2: Session-start hook reads the frozen workflow
AC: AC-1, AC-6
Material risk: artifact: hook must exit 0 and never throw
- [x] `.asd/hooks/session-start.js`: remove the `PHASE_CHAIN` literal. Resolve `<root>/.asd/workflows/<state.workflow || 'standard'>.json` and use its `phases` for the archived check, `nextPhase` and the display. Apply the design-collapse special case only when the definition's `phases` contain `design`. A missing, malformed or unknown definition degrades silently: no chain info, exit 0.

### Task 3: Lifecycle rule docs — workflow model and lite deltas
AC: AC-1, AC-2, AC-3, AC-5, AC-6, AC-8
Material risk: change: workflow-gate rules
- [x] `.asd/rules/sprint-lifecycle.md`:
  - add the `## Workflows` section per Overview;
  - scope "Phases (all mandatory)", the chain line, the phase table, "Multi-phase skip", the no-op table and collapse, "Design-promote phase", "Retro phase" placement and the AC-source line to `standard`, or cite "Workflows";
  - make the rollback-reset table read from each definition's `rollback_reset`;
  - add the `test-fix` kind to "State recovery" "User-resolved findings".
- [x] `.asd/rules/checkpoints.md`: add `workflow choice` to the "Gate policy" hard list and "Gate inventory" (hard approve-before-write), and make the precondition chain per-workflow by citing `sprint-lifecycle.md` "Workflows" for lite's predecessors.
- [x] `.asd/rules/core.md`: in the glossary, the Phase entry names the two workflows and cites the definition files instead of "Eleven mandatory"; add a `Workflow` glossary entry (a sprint lifecycle definition, distinct from the ASD workflow as a whole and from the `asd-phase-*.md` orchestration bodies); the reviewer roster entry mentions the combined reviewer.
- [x] `.asd/rules/artifact-layout.md`: the "Decisions log" rotation exit becomes "impl-review → its successor"; the `{{STATUS}}` note covers docs that lite writes unreviewed; the "Test plan" grants cover the AC-8 tester's rows.
- [x] `.asd/rules/git-strategy.md` "Commits": the AC-8 in-place tester commit uses the existing finding-id trailer form (one clause).

### Task 4: Review policy, providers and the combined reviewer agent
AC: AC-4, AC-8, AC-9
Material risk: change: reviewer roster and verdict contract
- [x] Add `.asd/agents/asd-reviewer-combined.md`: JSON frontmatter mirroring the other reviewers' tools, disallowedTools, model tiers, memory and maxTurns; its description lists what it covers and what it does not; its role body states the composed rubric, the conditional Documentation rubric and its own `Overall quality` rubric entry.
- [x] `.asd/rules/review-policy.md`:
  - "4 internal reviewers" becomes per-workflow wording citing `sprint-lifecycle.md` "Workflows";
  - add `combined` to the verdict enum and a row to the "Reviewer responsibility" table (the design-review cell is `n/a (lite has no design-review)`);
  - add a lite impl-review row to the "DoD per review phase" table;
  - add the Persistence paragraph for `persist-review` (AC-9);
  - add the `### Low-severity test-only findings` subsection (AC-8).
- [x] `.asd/rules/providers.md`: add the combined reviewer to the reviewer-grant sentence, the tier-matrix count and the role-scoped context row.
- [x] `.asd/agents/asd-tester.md`: add the AC-8 in-place test-fix dispatch to its description and operating contract.

### Task 5: Phase workflows, sprint skill and creators follow the frozen workflow
AC: AC-3, AC-5, AC-6
Material risk: change: phase routing and gates
Reachability: impl-review writes `NEXT: design-promote` (lite) at its green exit; `asd-sprint` Step 3 and `asd-phase-design-promote.md` preconditions read it
- [x] `asd-phase-scope.md`: step 1 asks the hard workflow choice (`standard` / `lite`, never defaulted) and seeds `{{WORKFLOW}}`; record it in `gate_decisions` and the decisions log.
- [x] `asd-phase-audit.md`: the lite exit always sets `NEXT: plan` with no collapse write; the return contract stays valid.
- [x] `asd-phase-plan.md`: the precondition becomes design-promote done, or the collapse (standard), or audit done (lite); the lite AC source is always `sprint.md`.
- [x] `asd-phase-design-promote.md`: add lite mode:
  - precondition impl-review DoD;
  - no-op when no document is enabled;
  - otherwise creators write or update persistent docs from `sprint.md`, `plan.md` and the sprint diff;
  - hard gates kept;
  - commit before `NEXT: retro`.
- [x] `asd-phase-retro.md`: the precondition names the predecessor per workflow. `asd-phase-design.md`: remove the `PHASE_CHAIN[idx+1]` wording.
- [x] `.asd/skills/asd-sprint/SKILL.md`:
  - resume display, re-run menu (only phases of the frozen workflow) and Step 3 routing follow `state.json.workflow`;
  - update the "Skills dispatched" wording.
- [x] Skill descriptions: `asd-phase-impl-review`, `asd-phase-design-promote`, `asd-phase-plan`, `asd-phase-design`, `asd-phase-scope`.
- [x] Creator agents `asd-architect.md`, `asd-ba.md`, `asd-ux.md`: add promote-from-implementation inputs for lite. `asd-dev.md`, `asd-reviewer-correctness.md`, `asd-reviewer-testing.md`: in lite the AC source is always `sprint.md` (cite "Workflows").

### Task 6: Review phase workflows — per-workflow roster, persist-review, AC-8
AC: AC-4, AC-8, AC-9
Material risk: change: review routing and DoD aggregation
Reachability: impl-review step 8 reads `persist-review`'s findings JSON to test the AC-8 condition; the same step writes the `resolved: … — test-fix` line that DoD aggregation reads
- [x] `asd-phase-impl-review.md`:
  - step 6 dispatches `reviewers.impl` of the frozen workflow;
  - the lite manual-verification decision moves to the orchestrator;
  - steps 6-7 persist every return through `persist-review`;
  - step 8 gains the AC-8 branch per `review-policy.md` "Low-severity test-only findings";
  - the green exit is `NEXT: retro` (standard) or `NEXT: design-promote` (lite), and the return contract is updated.
- [x] `asd-phase-design-review.md`: persist returns through `persist-review`.

### Task 7: README, AGENTS.md, release and sync
AC: AC-7
Material risk: artifact: cross-file mirrors
- [x] `README.md`:
  - add a workflows section (standard/lite chains, selection at sprint start, a lite phase table);
  - change "11/eleven phases" wording to a per-workflow form;
  - add the combined reviewer to the roster, model-tier table (both providers), agent counts, verdict enum, `runtime.js` command inventory and folder map.
- [x] `AGENTS.md` (the repo tail below `<!-- asd:end -->` only): update the phase-chain and agent-roster lines.
- [x] Bump `asd_version` (minor, per `CHANGELOG.md` convention) in `.asd/release-manifest.json`, add the `CHANGELOG.md` entry (the new sprint-start question; in-flight sprints read `standard`, nothing migrates), then run `node .asd/sync.js --apply` for every generated view and refresh `canon_hashes`/`upstream_hashes`.

## Risks
- Hard-coded chain and roster sites can drift (`audit.md` Risks). The mitigation is the DoD grep plus impl-test's per-definition §16 checks.
- Wave-2 Tasks run in parallel and cite homes that do not exist yet. The homes are fixed by file and heading in Overview, so a Task never invents one.
- `tests/run.js` is red after Tasks 1-2 (hook literal removed, new reviewer file). This is expected; impl-test rewrites the affected tests.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | Task 1 |
| 2 | Task 2, Task 3, Task 4, Task 5, Task 6 |
| 3 | Task 7 |

- Tasks 2, 4 and 6 depend on Task 1 (definition schema, `combined` key, `persist-review` CLI).
- Task 7 depends on every other Task (mirrors and sync run last).
- Wave-2 Tasks touch disjoint files.

## Out of scope
- Test authoring and `tests/run.js` changes (impl-test).
- Consumer-authored workflows, a config default, and switching workflow mid-sprint (`sprint.md`).
