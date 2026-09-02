---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), state.json (state), reviews/ (verdicts)
---

# Decisions Log

Per-sprint, append-only. Never edited or removed. Created at `scope`, archived with the sprint.

## Entries

<!-- entries appended below this line -->

## 2026-09-02 — scope approved: doc-links review mechanic + asd-advisor autonomy

- **Decision**: User approved sprint scope with AC-1..AC-8 as written in `sprint.md`. Gated artifacts move to write-then-review-accept (link + delta summary in chat, review in the real file, revise in place); `c4-full/` loses its gate entirely; design-promote loses its final-mutation and per-persistent-write gates but keeps decomposition and new-subsystem gates; a new read-only `asd-advisor` agent absorbs non-gate agent uncertainty.
- **Rationale**: Full-content dumps into chat and redundant re-confirmation of already-accepted drafts are the dominant cost in ASD's user loop. Decomposition/new-subsystem gates are retained because they decide persistent-doc and C4-registry layout, which AC-1's draft acceptance never showed the user.
- **Affected docs**: `.asd/sprints/003-doc-links-and-autonomy/sprint.md`; planned targets `.asd/rules/checkpoints.md`, `.asd/agents/asd-pm.md`, `.asd/agents/asd-advisor.md` (new), `.asd/workflows/asd-phase-*.md`, `.asd/release-manifest.json`, `README.md`.
- **Config note**: per `.asd/project/config.yaml`, `documents.audit: enabled`; `prd`/`ux_spec`/`adr`/`c4` disabled — frozen into `state.json.documents`, so design/design-review/design-promote will collapse to the no-op path after audit.
- **Bootstrap note**: this sprint's own `scope` gate used the old chat-text approve-before-write mechanic; AC-1 goes live starting at this sprint's `plan` gate.
