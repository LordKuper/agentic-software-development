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
- `## Dependencies` is required and opens with the wave table impl dispatches from; every task sits in exactly one wave (same section)
-->

## Overview

Seven tasks in five waves cover AC-1..AC-19 from `sprint.md`. `audit.md` holds the line-level touch map for every AC. Each task's payload cites the audit sections for its ACs and does not restate them here.

- Task 1 changes the dispatch and commit contract that every later task runs under, so it goes first and alone.
- Tasks 2 and 4 rebuild coverage-manifest handling in two steps. First the runtime emitter, the published `n_a` shape and the split threshold. Then the rule text built on them.
- Task 5 adds the sprint-mediated settings path.
- Task 6 moves the subsystem registry to `docs/architecture/subsystems.md`.
- Task 7 closes the mirrors: README, provider views, release manifest.

Tasks that run in the same wave never touch the same file, so path-scoped commits cannot sweep in a sibling's edit.

Decisions already fixed, recorded in `decisions-log.md`:

- The split threshold is 25 files, with an N-part partition.
- Registry bootstrap: `/asd-init` creates an empty registry when decomposition is enabled. An enabled project that has no registry gets it built at `audit`, and every added subsystem is confirmed by the user.
- A legacy `c4/` is deleted at `audit` after migration, under a hard gate.
- Plan acceptance approves a declared settings change.

## Definition of Done

Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.

Sprint-specific additions:

- `node .asd/sync.js --check` is clean after the final `--apply`.
- `.asd/release-manifest.json` `canon_hashes` and `upstream_hashes` are fresh, and `t_subsystems.yaml` is removed from them.
- README.md mirrors the resulting phase and agent descriptions, the config schema and the folder map.
- `asd_version` is bumped MAJOR in `pr` open mode, because the registry location and `t_subsystems.yaml` are consumer-visible breaks. CHANGELOG carries the migration notice.

### Task 1: Dispatch and commit contract
Material risk: change: workflow gate
- [x] AC-5: in `providers.md` "Role-scoped context", define an agent's declared tool policy. It is the agent's own definition, plus the phase-granted self-hosting write allowlist (`sprint-lifecycle.md` "Self-hosting"), plus the agent-memory carve-out (`artifact-layout.md` "Agent memory"). A dispatch payload must stay inside that policy. An agent that receives an instruction outside it returns `QUESTION` naming the contradiction and does not comply.
- [x] AC-5: add a one-line cite of that rule in `core.md` "Autonomy and escalation".
- [x] AC-6: in `artifact-layout.md` "Agent memory", require the writing agent to check a memory write against its own definition before the write lands. A practice that contradicts the definition is never recorded.
- [x] AC-7: in `git-strategy.md` "Commit before review", state that agent-memory writes made by a dispatched agent that holds a commit tool are paths it authored and commits. Agents without a commit tool stay under the existing orchestrator clause.
- [x] AC-8: extend the "Verify before applying" paragraph in `review-policy.md` "Autofix vs escalation": the suggested fix is non-binding and a creator may resolve the finding another way. Remove the payload restatement at `asd-phase-impl.md` review-fix payload (~63) and in `asd-phase-design-review.md` creator autofix (~46-48). Add no second statement.
- [x] AC-11: `asd-dev.md` COMPLETED report gains a `Flagged choices:` field (`none` or a list), and `asd-phase-impl.md` step 6 summary contract is updated to match.
- [x] AC-11: at `asd-phase-impl.md` step 10, a non-`none` flagged choice counts as an unresolved material alternative under `checkpoints.md` "Gate policy". The adaptive pass is blocked until the orchestrator resolves the choice or routes it back to the dev.
- [x] Run `node .asd/sync.js --apply` on every generated view of the edited agents and skills. Build and lint per `commands.yaml`.

### Task 2: Runtime coverage-manifest emitter, n_a shape and split threshold
Material risk: change: workflow gate
Material risk: artifact: runtime.js coverage validator
- [ ] AC-1: publish the `n_a` shape as a `.asd/runtime.js` constant beside `LEDGER_VOCABULARY` and `LEDGER_ROW_EXAMPLE`, under a manifest key distinct from `n_a`. Stamp it from the single stamping function used by `manifest-digest --write` and the new emitter. The validator checks equality exactly as it does for the two existing constants, and tolerates the field's absence in legacy manifests. Export it.
- [ ] AC-3: add constant `SPLIT_THRESHOLD_FILES = 25`. When the scope file list exceeds it, the emitter emits `ceil(files / 25)` disjoint part manifests in manifest order. Each part carries the full rubric, its own digest and the out-of-half predicate per `review-policy.md` "Partition", generalised to N parts.
- [ ] AC-12: add an emitter subcommand with these inputs: reviewer name, phase, iteration scope file list, and optional `custom-*-rules.md` paths. Rule ids come from the reviewer's `## Review rubric` headings or bold-label bullets, parsed from `.asd/agents/asd-reviewer-<name>.md`. Section ids come from the rubric sections. The standing n/a predicates become code constants: UI-surface, perf, `outside phase gate`, `no budgets defined`, out-of-half.
- [ ] AC-12: the subcommand writes one stamped manifest per part. Update the usage string.
- [ ] AC-12: `validate-ledger --ledger` accepts either the reviewer's full returned text, from which it extracts the fenced ledger block, or bare JSON. Findings stay sourced from the separate `--findings` input, so the invented/missing-finding check is not made vacuous.
- [ ] AC-1, AC-3, AC-12: in `review-policy.md` "Coverage ledger" and "Interrupted dispatch and split dispatch":
  - state the published `n_a` shape;
  - add the pre-dispatch threshold split beside the existing two-interruption halving;
  - name the subcommand as the manifest source.

  The prose cites the runtime constant values and does not restate them.
- [ ] AC-12: switch `asd-phase-impl-review.md` steps 1, 5, 6, 7 and 7a, and `asd-phase-design-review.md` steps 7, 8 and 8a, to the subcommand. Step 5's predicates are re-homed to the runtime constant, and `asd-reviewer-correctness.md` keeps citing step 5. Rubric-heading edits needed for parseable ids go into the reviewer agents only where the parser requires them.
- [ ] Sync the generated views. Build and lint.

### Task 3: Derive-over-enumerate rule and suite-record lag
Material risk: artifact: rule doc wording
- [x] AC-9: in `code-style.md` §17 Tests, require a test or rule that names the members of a set to derive the set from its source, wherever such a source exists.
- [x] AC-10: in `t_test-plan.md` "Entry log"/"Suite run" and `sprint-lifecycle.md` "Impacted test set", state that a per-entry suite record measures the tree that entry analysed. Only the terminal full-suite run measures the final tree. Write it in one home and cite it from the other.

### Task 4: Manifest immutability, interrupted-attempt payload, plan review-scope sizing
Material risk: change: workflow gate
Reachability: plan writes the expected review scope size into plan.md Risks at step 4; impl-review reads the emitted part count at step 7 — the plan line is advisory and the runtime threshold decides the split.
- [ ] AC-2: in `review-policy.md` "Coverage ledger", make a manifest that has already been dispatched immutable for the life of that dispatch, for the orchestrator too. Correcting it requires a fresh dispatch with a newly emitted manifest, never a re-stamp. Stamping pre-dispatch parts is not a re-stamp. Mirror this in `asd-phase-impl-review.md` step 7 and `asd-phase-design-review.md` step 8.
- [ ] AC-4: admit the reviewer's interrupted-attempt record (count and cause, rebuilt from `decisions-log.md`) in the "Clean-context review iteration" "Reviewer payload carries only" list. Update both workflows' payload bullets. `core.md` "Context hygiene" #6 is not edited.
- [ ] AC-3: in `asd-phase-plan.md` step 4, the plan estimates the iteration-1 review scope in files from the tasks' touched paths. When the estimate exceeds the runtime threshold, the plan names the expected part count in `## Risks`.

### Task 5: Sprint-mediated settings change through /asd-init
Material risk: change: workflow gate
Reachability: plan writes a `Settings change:` line in a Task block at plan step 4; impl reads it at `asd-phase-impl.md` step 8 and applies it through `/asd-init` before dispatching later waves.
- [ ] AC-13: add grammar to `sprint-lifecycle.md` "Plan file format": a `Settings change: <key>=<value>[, …]` plain-text line in a Task block. Plan acceptance is the approval of record for exactly those pairs. A task carrying the line sits alone in the first wave, and the change never affects the running sprint's frozen state. Mirror it in the `t_plan.md` format comment.
- [ ] AC-13: `asd-init/SKILL.md` gains a sprint-mediated invocation. Input is the declared pairs, and only those pairs are applied. It posts the diff without a full dump or `accept-all`, and skips "Always first" managed-block sync. The "no sprint context yet" line changes to match.
- [ ] AC-13: `asd-phase-impl.md` step 8: orchestrator applies a declared settings change through that invocation instead of registering an MS-N. Step 9 counts `.asd/project/config.yaml` as an authorised path.
- [ ] AC-13: update the `core.md` Invariants settings line, the `t_AGENTS.md` hard rule, and the `asd-sprint/SKILL.md` "Skills dispatched" line (`asd-init` is allowed for a declared settings change). Regenerate the root `AGENTS.md` managed block with `sync.js --apply AGENTS.md`.
- [ ] Sync the generated views. Build and lint.

### Task 6: Subsystem registry in docs/architecture/subsystems.md
Material risk: change: migration
Material risk: change: public contract
Reachability: audit or design-promote write `docs/architecture/subsystems.md` at audit step 2 or promote step 4; plan reads it at plan step 3 and audit reads it at step 2 to locate subsystem code.
- [ ] AC-14, AC-16: rewrite `artifact-layout.md`:
  - "Subsystem registry": `subsystems.md` is the sole registry; reserved ids `subsystems`, `stack`, `c4`, `tech-reference`.
  - Path maps: registry and `<id>.md` in the decomposed tree. `c4/` appears only with effective c4 and likec4. The mermaid sprint draft is `<sprint>/design/c4-full/subsystems.md`.
  - Line 5 carve-out.
  - "Document representation rule": add an exception for the agent-facing `.md` registry and subsystem files.
  - Retire `architecture.html` from the shell list and `DOC_TYPE`.
- [ ] AC-14: update `core.md` Glossary "Subsystem".
- [ ] AC-14, AC-17: update `sprint-lifecycle.md`: phase-table audit output, "Optional documents" C4 inputs, "Audit phase", "Design phase" c4-full, "Design-promote phase" steps 2 and 4, decomposition-disabled paragraph.
- [ ] AC-15: new template(s) with responsibility frontmatter for `subsystems.md` (registry list with links, optional inline Mermaid block for mermaid mode) and `<id>.md` (purpose, key paths). Delete `t_subsystems.yaml`.
- [ ] AC-16: in mermaid mode, the diagram lives inline in `subsystems.md`. No `c4/`, `subsystems.yaml` or `architecture.html`. Update:
  - `asd-phase-design.md` c4-full step and template list;
  - `external-review.md` 67/69;
  - `t_prompt-external-design.md` artifacts list and checklist;
  - `asd-reviewer-efficiency.md` inputs;
  - `asd-phase-design-review.md` 8/32.
- [ ] AC-17 promote: in `asd-phase-design-promote.md`, Architect writes a new or changed subsystem to the registry and to `<id>.md`. It patches likec4 C4 only when effective c4 is enabled. A new subsystem stays a hard gate.
- [ ] AC-17 audit: in `asd-phase-audit.md` step 2, when decomposition is enabled and the registry is absent, Architect proposes the registry and `<id>.md` files from an existing C4 registry, or from code when none exists. Each subsystem added needs explicit user confirmation (hard). Only after confirmation does Architect write the files. Missing `<id>.md` files for registered subsystems are backfilled. A legacy `c4/` that is redundant under the new rules (effective c4 disabled, or mermaid mode) is deleted after migration under a hard gate, together with its `.gitignore` `architecture.html` line.
- [ ] AC-17: `audit` and `plan` read the registry. Update `asd-phase-plan.md` step 3 and `t_audit.md` "Subsystems map".
- [ ] AC-17, AC-18: in `asd-architect.md`, update the description, write access (registry, `<id>.md`, audit-phase writes after confirmation), "Diagram tool modes" and stop conditions.
- [ ] AC-17, AC-18: `asd-init/SKILL.md` and `t_config.yaml`:
  - enabling decomposition creates an empty `docs/architecture/subsystems.md`;
  - `diagram_tool` and the `c4/` seeding only when C4 is enabled;
  - mermaid seeds no `c4/` and no `c4-build`;
  - no `architecture.html` `.gitignore` entry.
- [ ] Update this repo's `.gitignore` `architecture.html` line. Sync the generated views. Build and lint.

### Task 7: Mirrors and release manifest
Material risk: artifact: release manifest hashes
- [ ] AC-18, AC-19: update README.md for this sprint's changes. Sections: feature list (18), phase and agent descriptions, config schema (`diagram_tool`, decomposition), folder map (342), the runtime.js description (306), the LikeC4/Mermaid tool section (357, 369-378, 436), and the hard-rule mirror (181).
- [ ] AC-18: in `.asd/release-manifest.json`, remove `t_subsystems.yaml` and register the new template(s) in `managed_paths` and `upstream_hashes`. Recompute every `canon_hashes` and `upstream_hashes` entry changed by Tasks 1-6.
- [ ] AC-19: run `node .asd/sync.js --check` until clean. Build and lint.

## Risks

- Iteration-1 review scope is estimated at over 60 files, well above the 25-file threshold, so expect the emitter (once Task 2 lands) to produce three or more parts per internal reviewer. Task 2 changes the manifest mechanism this sprint's own impl-review will use. If Task 2 is red at impl-review entry, fall back to hand-built manifests per the pre-sprint rule and log the fallback.
- Task 6 is the largest surface and a consumer-visible break. A missed reference to `docs/architecture/c4/` as the registry leaves two homes. Before commit, grep for `c4/` and `subsystems.yaml` and account for every hit.
- AC-3's plan-sizing half is advisory once the runtime threshold decides the split (Task 4 Reachability). Narrowing AC-3 to drop it would need a scope decision. It stays in the plan unless the user narrows it at the plan gate.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | 1 |
| 2 | 2, 3 |
| 3 | 4, 5 |
| 4 | 6 |
| 5 | 7 |

- Task 1 changes the dispatch and commit contract (tool-policy refusal, memory commit ownership, `Flagged choices:` report field), so every later task runs under it.
- Task 4 depends on Task 2: its rule text cites the emitter, the threshold and the published shape, and both edit `review-policy.md` and the review workflows.
- Task 5 is ordered after Task 1 (shared `core.md` and `asd-phase-impl.md`) and runs with Task 4 on disjoint files.
- Task 6 depends on Tasks 2, 4 and 5: shared `asd-phase-design-review.md`, `asd-reviewer-efficiency.md`, `asd-init/SKILL.md`, `sprint-lifecycle.md` and `core.md`.
- Task 7 depends on all: hashes and README are computed last.

## Out of scope

- Test authoring. That is `impl-test`.
- The CHANGELOG entry and `asd_version` bump. Both belong to `pr` open mode.
