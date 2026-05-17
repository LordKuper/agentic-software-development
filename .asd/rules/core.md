# Core

ASD (Agentic Software Development) is a multi-agent workflow for Claude Code. It manages software projects through fixed-shape sprints with one sprint active at a time.

## Entry points

- `/asd-init` — initialize or edit workflow settings
- `/asd-sprint` — start new sprint or continue active one

All project work goes through `/asd-sprint`.

## Glossary

- **Sprint** — one unit of scoped work. One active at a time. Closed sprints are archived and immutable.
- **Phase** — fixed step in sprint lifecycle. Nine mandatory: scope, audit, design, design-review, design-promote, plan, impl, impl-review, pr.
- **Iteration** — single pass of the review loop in `review` phase.
- **Creator agent** — produces artifacts (PM, BA, UX Designer, Architect, Backend Dev, Frontend Dev, Test Engineer).
- **Reviewer agent** — evaluates artifacts (Quality, Implementation, Testing, UI, Simplification, Documentation, Performance, External Review).
- **Artifact** — file produced by an agent. User-facing (PRD, ADR, plan, …) or machine-readable (state.json, config.yaml).
- **Persistent doc** — living document under `design/`. Updated across sprints.
- **Workflow infrastructure** — `.asd/rules/`, `.asd/templates/`, `.claude/`, `CLAUDE.md`. Never modified during sprint work.
- **Subsystem** — unit of project decomposition. Registered in the LikeC4 model at `design/architecture/c4/model/` when `project.subsystem_decomposition: enabled`. Persistent design docs are organized per subsystem. New subsystems are added only in `design-promote` phase with user approval.

## Invariants

- One active sprint. New sprint blocked until current archived.
- Infrastructure files are read-only during sprint work. Only `/asd-init` may edit settings.
- Every project task flows through a sprint. Ad-hoc edits forbidden.
- Folder structure follows `artifact-layout.md`.

## Interaction protocol (QODDA)

Every multi-step user interaction follows:

1. **Question** — agent identifies the decision point
2. **Options** — explicit choices presented to user (use AskUserQuestion when discrete)
3. **Decision** — user selects
4. **Draft** — agent composes the section content in `language.chat` for review
5. **Approval** — user confirms, then agent translates to `language.docs` and writes to file before moving to next section or phase

See `language-policy.md` for the section approval flow and quote translation rules.

## AskUserQuestion

Canonical channel when prompting the user with discrete options. Every agent has this tool. Use it whenever the agent needs a choice rather than free-form input.

## Simplicity Default

No new abstraction, layer, interface, dependency, config flag, or generalization without explicit user approval via Complication Approval format:

- **What** — exact change proposed
- **Why** — problem it solves
- **Justification** — why simpler options fail
- **Alternatives** — list of simpler options considered

## User-decision presentation format

When asking the user to choose, always present:

- **Problem** — one sentence
- **Options** — labeled list
- **Recommended** — one option with reason
- **Consequences** — per option

Never present `Approve?` without options.

## Incremental writing

For long artifacts, write the skeleton first. Then per section: draft → user approval → write → next. Keeps live context small.

## Template variables

Skill and agent prompts may use:

- `{{SPRINT}}` — current sprint id (e.g. `001-add-auth`)
- `{{ITERATION}}` — current review iteration
- `{{PHASE}}` — current phase name
- `{{agent:<name>}}` — resolved agent definition

## Compaction

Before context compaction, agent dumps minimal recovery state to `state.json`. After compaction, agent reloads `state.json` to resume.

## See also

- `sprint-lifecycle.md` — phase model
- `checkpoints.md` — pause points and approval flow
- `artifact-layout.md` — file paths and ownership
- `review-policy.md` — review loop semantics
- `external-review.md` — Codex CLI integration
- `git-strategy.md` — branches, commits, PR
- `language-policy.md` — languages per artifact type
