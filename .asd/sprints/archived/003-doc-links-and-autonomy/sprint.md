---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 003-doc-links-and-autonomy

## Goal

Reduce chat-side review cost and user decision load in ASD: gated artifacts are **written first and reviewed in the real file via a path link** (no full-content dumps into chat), with feedback revising the file in place; and non-gated agent decisions route to a new `asd-advisor` agent instead of interrupting the user.

## Acceptance

- AC-1: **write-then-review gate mechanic, defined once.** `checkpoints.md` gains one canonical definition: creator writes the artifact to its path → posts the absolute path + a short delta summary in chat → user reviews the actual file → `accept` advances the phase, any feedback loops back to revise-in-place → repeat until explicit `accept`. This sequence explicitly covers `sprint.md` and `plan.md` alongside the content documents.

- AC-2: **no content dumps.** Chat carries link + brief summary + open questions only; never the artifact body. Approval is still explicit and still recorded.

- AC-3: **in-scope artifacts.** `concept.html`, `stack.html`, `DESIGN.md`, `design-system.html`, `accessibility.html`, `prd.html`, `ux-spec.html`, `adr.html`, `sprint.md`, `plan.md`. Out of scope: `c4-full/` — no approval gate of any kind (neither write-then-review nor approve-before-write).

- AC-4: **HARD-gate table, row by row.** In `checkpoints.md` and the `asd-pm.md` gate table:
  - *Moved to write-then-review accept* (AC-1 model): `scope` (`sprint.md`), `plan` (`plan.md`), and the design phase's per-artifact rows for prd / design-system / ux-spec / adr.
  - *Dropped entirely*: the design phase's `c4-full/` artifact gate; design-promote's **final-mutation** gate; design-promote's step-8 **per-persistent-write** gate (duplicated in `asd-ba`/`asd-architect`/`asd-ux-designer`) — both are redundant re-confirmation of draft content the user already accepted under AC-1.
  - *Stay approve-before-write/mutate, unchanged*: design-promote's **decomposition** gate and **new-subsystem** gate — structural decisions about persistent-doc/C4-registry layout that were never shown to the user at draft-acceptance time, so AC-1's acceptance doesn't cover them.
  - *Unchanged*: `audit` merge approval, `impl` assessment, `impl-test` removal approval, `impl-review` final verdict, `pr` opening confirmation — these gate a decision/phase-advance, not an artifact draft.

- AC-5: **revise in place.** Feedback edits the same file; no `-v2` files, no duplicate drafts. Each `accept` appends a decisions-log entry naming the artifact path.

- AC-6: **`asd-advisor` agent.** New canonical agent `.asd/agents/asd-advisor.md`: read-only on both providers (no `Write`/`Edit`/`Bash`; `sandbox_mode: "read-only"`), `claude` model family `fable`, `codex` model family `sol`, dispatchable by any agent on non-gate uncertainty; user-facing HARD gates untouched by it. Generated views produced via `.asd/sync.js --apply`; `.asd/release-manifest.json` gets its `canon_hashes` entry.

- AC-7: **cross-file consistency.** README (agent roster + model tiers both providers — 15→16, gate/phase description, folder map if touched), `core.md` "See also", every `asd-phase-*` workflow naming a gate (now incl. `scope`/`plan` rows), `.asd/release-manifest.json` (`managed_paths`, `canon_hashes`, `model_families`), `node .asd/sync.js --apply` for generated provider views.

- AC-8: **verification.** `node tests/run.js` green; `node .asd/sync.js --check` clean; no dangling references to dropped c4 gate or old approve-before-write phrasing for moved rows.

## Out of scope

- `c4-full/` approval gating of any kind (AC-3).
- design-promote's decomposition and new-subsystem gates — explicitly retained as-is (AC-4).
- Any change to `impl` / `impl-test` / `impl-review` / `pr` gate semantics (AC-4, unchanged rows).

## Bootstrap note

This sprint's own `scope` gate stays chat-text approve-before-write — the new rule cannot apply to its own approval. It goes live starting with this sprint's `plan` gate, and for all future sprints/phases.
