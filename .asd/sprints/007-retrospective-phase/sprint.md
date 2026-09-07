---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 007-retrospective-phase

## Goal

Give every ASD sprint a memory of its own *process* friction, and a phase that acts on it.

Two additions to the framework:

1. **Friction log** — one Markdown file in the sprint folder where any phase records
   problems encountered *while running the workflow*: a tool that would not launch, an
   agent that misbehaved or stalled, a skill that dispatched wrong, a rule that was
   ambiguous or contradicted another, a gate that fired at the wrong time, provider/CLI
   breakage. Explicitly NOT a defect tracker for the sprint's own feature work — code
   defects keep going to `test-plan.md` Defects, review findings to `reviews/`.

2. **Retrospective phase** — a new phase running after `impl-review` and before `pr`.
   It reads the friction log, analyses the recorded entries, and produces recommendations
   along two axes: what the *consumer project using ASD* should change, and what *ASD
   itself* should change. Output is a user-facing HTML file in the sprint folder. A short
   summary is posted to chat, then the phase completes and routes to `pr` (finalization:
   archival + autonomous PR).

## Acceptance

- AC-1: A friction-log file exists as a defined sprint artifact with a template, an owner, a documented entry format, and a documented boundary against `test-plan.md` Defects / review findings / `manual-steps.md`.
- AC-2: Any phase may append friction entries to that file at any point in the sprint; the mechanism and its writer(s) are stated once in the rules and referenced, not restated, elsewhere.
- AC-3: A `retro` phase exists in the phase chain between `impl-review` and `pr`, with a phase skill and workflow, dispatched by `asd-sprint` like every other phase.
- AC-4: The `retro` phase analyses every friction entry and emits recommendations split into consumer-project actions and ASD-framework actions, each traceable to the entry it addresses.
- AC-5: The phase writes a user-facing HTML artifact into the sprint folder from a dedicated `t_`-prefixed template in `.asd/templates/`, built on the shared `t_html-shell.html` shell, carrying a `responsibility` block and placeholders consistent with the other artifact templates. Both new templates (friction log, retrospective) are registered wherever templates are tracked.
- AC-6: The phase posts a short chat summary (in `language.chat`) of the problems found and proposed approaches, then returns `NEXT: pr`. It is never a user-blocking gate beyond what `checkpoints.md` already mandates.
- AC-7: An empty friction log is a legitimate outcome: the phase records that and advances without inventing findings.
- AC-8: Every cross-file mirror of the phase chain stays consistent — `sprint-lifecycle.md`, `core.md` glossary, `session-start.js` `PHASE_CHAIN`, `asd-sprint`/`asd-phase-*` return contracts, `README.md`, `artifact-layout.md`, `.asd/release-manifest.json`.
- AC-10: The retro phase also produces **systemic improvement proposals** — what could be changed so a future sprint runs faster and cheaper — independent of whether any friction entry was recorded. These are a distinct output class from problem remediation: they may cite friction entries but are not limited to them, and an entry-free friction log still yields this section.
- AC-9: Under `backward_compat: migration`, an in-flight consumer sprint created before this change still resumes: a migration handles the state/chain delta, and the version bump covers it.

## Out of scope

- Cross-sprint aggregation of friction (a project-wide friction history under `docs/` or `.asd/project/`) — this sprint keeps friction per-sprint, archived with the sprint.
- Automatic execution of the recommendations (auto-filing follow-up sprints, auto-editing rules). Recommendations are text for the user to act on.
- Changing what `test-plan.md`, `reviews/`, `stubs.md` or `manual-steps.md` already own.
