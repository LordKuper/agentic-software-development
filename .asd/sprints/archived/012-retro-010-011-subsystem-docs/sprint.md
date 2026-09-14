---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 012-retro-010-011-subsystem-docs

## Goal

Two strands.

1. Remediate the sprint 010 and 011 retrospectives. The work is the seven actions still open and the seven systemic proposals the user selected. Every row was re-verified against `HEAD` 62464ac at scope. The record is in `decisions-log.md`.
2. When `project.subsystem_decomposition` is enabled, `docs/architecture/` gains one Markdown file per subsystem and a project-composition file, `subsystems.md`, that lists the subsystems. `subsystems.md` becomes the subsystem registry and replaces `docs/architecture/c4/` in that role, so `c4/` exists only when C4 is enabled. Agents use these files to find a subsystem's code without scanning the repo.

## Acceptance

- AC-1: (010 F-1) The coverage manifest's `n_a` shape is published as a `.asd/runtime.js` constant, beside `LEDGER_VOCABULARY` and `LEDGER_ROW_EXAMPLE`. It is stamped into every emitted manifest and covered by the digest. The validator reads the same constant. `review-policy.md` "Coverage ledger" states the shape.
- AC-2: (010 F-2) A stamped manifest is immutable for the life of the dispatch that holds it, and that includes the orchestrator. Correcting it requires a re-dispatch, never a re-stamp. This is stated in `review-policy.md` "Coverage ledger" and in both review-phase workflows.
- AC-3: (010 F-3, 010 P2) The split trigger in `review-policy.md` "Interrupted dispatch and split dispatch" also fires on evidence the phase already holds. A manifest whose scope file list exceeds a stated threshold is split before its first dispatch. `asd-phase-plan.md` states the expected review scope size, so a large first iteration is split by design.
- AC-4: (010 F-3) A reviewer re-dispatched after an interruption receives that reviewer's interrupted-attempt record (count and cause) in its payload.
- AC-5: (010 F-5) A dispatch payload never instructs an agent to act outside its own declared tool policy. An agent that receives such an instruction reports the contradiction and does not comply. Stated in `providers.md` "Role-scoped context" and `core.md` "Autonomy and escalation".
- AC-6: (010 F-5) Before an agent-memory write lands, it is checked against the writing agent's own definition. A practice that contradicts the definition is never recorded as standing guidance (`artifact-layout.md` "Agent memory").
- AC-7: (011 F-1) `git-strategy.md` "Commit before review" states that the agent-memory writes a dispatched agent made are paths it authored, so that agent commits them.
- AC-8: (010 P4) `review-policy.md` "Autofix vs escalation" makes a reviewer's suggested fix non-binding. A creator may resolve the finding with a different fix. Dispatch payloads no longer need to say this.
- AC-9: (010 P5) `code-style.md` requires a test or rule that names the members of a set to derive the set from its source rather than enumerate it, wherever such a source exists.
- AC-10: (010 P6) `t_test-plan.md` and `sprint-lifecycle.md` "Impacted test set" state that a per-entry suite record measures the tree that entry analysed, not the tree that includes the tests it added. Only the terminal full-suite run measures the final tree.
- AC-11: (011 P1) A choice that a dev explicitly flags for checking in its completion report is an unresolved material alternative. It blocks the adaptive impl-assessment pass until the orchestrator resolves it or routes it back (`asd-phase-impl.md` step 10, `checkpoints.md`).
- AC-12: (010 P3, 011 P2) A `.asd/runtime.js` subcommand emits each internal reviewer's coverage manifest from three inputs: the canonical rubric headings, the iteration diff's scope file list and the standing n/a predicates. It then stamps the manifest's digest. `validate-ledger` accepts the reviewer's fenced ledger block directly. Both review-phase workflows use the subcommand instead of assembling manifests by hand.
- AC-13: (011 P3) A plan task may declare a project-settings change. After plan acceptance, the orchestrator applies it through `/asd-init` diff mode instead of halting on a manual step, so `/asd-init` stays the only writer of settings. The `t_AGENTS.md` hard rules, `asd-sprint` "Skills dispatched" and `asd-phase-impl.md` all state the same thing.
- AC-14: When decomposition is enabled, the project-composition file `docs/architecture/subsystems.md` is the subsystem registry. It is the sole source of truth for which subsystems exist and what their ids are, in both diagram modes and whether effective `documents.c4` is enabled or not. It lists every subsystem, each linked to its AC-15 file. `core.md` "Glossary", `artifact-layout.md` "Subsystem registry" and `sprint-lifecycle.md` "Design-promote phase" state this.
- AC-15: When decomposition is enabled, every registered subsystem has `docs/architecture/<subsystem-id>.md`. Each file holds a short statement of the subsystem's purpose and a list of the files and folders that hold its key parts, such as its source root. When decomposition is disabled, neither this file nor the AC-14 registry is written.
- AC-16: When effective `documents.c4` is disabled, nothing is written under `docs/architecture/c4/` and the folder does not exist, while subsystems are still registered through AC-14. When it is enabled, what gets written depends on the diagram tool:
  - likec4: the C4 model (`c4/model/*.c4`, `views.c4`) is a diagram source only, and its subsystem ids match the registry.
  - mermaid: the Mermaid diagram is written straight into `docs/architecture/subsystems.md`. No `c4/` folder, `subsystems.yaml` or `architecture.html` is created. The mermaid registry template `t_subsystems.yaml` and every reference to those files are retired, and the mermaid sprint draft takes a matching form.
- AC-17: At `design-promote`, whenever a subsystem is registered or changed, Architect writes it to the registry and to its AC-15 file. Architect patches C4 as well only when effective `documents.c4` is enabled. At `audit`, Architect creates the registry and any missing AC-15 file, taking both from an existing C4 registry, so projects that were decomposed before this change are migrated. `audit` and `plan` read the registry to locate the code of the subsystems a sprint touches.
- AC-18: The `artifact-layout.md` path map and "Document representation rule" admit these agent-facing Markdown files. A template defines their shape. README.md (folder map, config schema), the `asd-architect` description, `asd-init` (a `c4/` folder only when c4 is enabled), `.asd/release-manifest.json` and `tests/run.js` are updated to match.
- AC-19: `node tests/run.js` is green, `node .asd/sync.js --check` is clean, and README.md is consistent with the resulting rules, agents, skills and templates.

## Out of scope

- 010 F-4 (quota failure suppressing the next dispatch): already satisfied at `HEAD` 62464ac and closed at scope.
- 010 P1 (audit `.claude/agent-memory/**` under the documentation-economy rule): not selected; left for its own sprint.
- Enabling subsystem decomposition for this repo, or rendering the subsystem Markdown files to HTML.
- A `.asd/migrations/` script for the registry move. A script cannot write a subsystem's purpose, so AC-17's audit backfill is the migration path, and `CHANGELOG.md` announces the move under `backward_compat: migration`. A consumer with `documents.audit: off` gets the registry only when it next runs audit.
- Hand-edits to the generated provider views (`.claude/`, `.codex/`, `.agents/skills/`): edit canon, then run `sync.js --apply`.
