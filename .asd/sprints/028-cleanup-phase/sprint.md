---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 028-cleanup-phase

## Goal
Add a `cleanup` phase before retro. It removes everything superfluous born during the sprint — temporary code and fixtures, test data, etc. After removal a build runs to confirm nothing broke. Approach and refined requirements: `research.md`.

## Acceptance
- AC-1: Both workflows gain a `cleanup` phase immediately before `retro` — `standard`: impl-review → cleanup → retro; `lite`: design-promote → cleanup → retro — in each workflow definition (`phases`, `next`), the precondition chain, and every phase-chain mirror.
- AC-2: The main orchestrator performs the cleanup phase itself, with no agent dispatch; this is stated as an explicit exception to its delegate-only rule.
- AC-3: Removal reach is the residue the sprint introduced (temporary/debug code, scratch files, commented-out blocks, fixtures and test data no final test uses) plus anything that became superfluous as a consequence of the sprint's work, pre-existing code included; stubs and TODOs still needed are kept. Removal needs clear evidence that the item is superfluous.
- AC-4: Before removing anything the phase starts from a committed checkpoint and reverts only its own removals; removals land in their own commit(s), and the removed items are recorded in `decisions-log.md`. No user approval of the removal list.
- AC-5: After removal the phase runs build, lint and the tests the removals impact; on a failure the orchestrator diagnoses the cause and fixes it autonomously, reverting a removal when that is the necessary and correct path. No review pass runs over the cleanup changes.
- AC-6: A config switch (`cleanup: enabled | disabled`, absent = `enabled`) controls the phase, frozen per sprint at scope; disabled makes the phase a no-op recorded in `skipped_phases`. `/asd-init` collects and edits it.
- AC-7: README.md and every cross-file mirror reflect AC-1..AC-6 and AC-8..AC-10; `node tests/run.js` is green and `sync.js --check` is clean.
- AC-8 (retro 027#A-1): `asd-external-review.md`'s own return-format text states that an empty Kept findings table is its header and separator rows only, never a placeholder row.
- AC-9 (retro 027#P-1): a plan decision adding a multi-stage interactive step states, before plan acceptance, each stage's on-disk write point and the re-entry evidence that marks it done.
- AC-10 (retro 027#P-2): a criterion claiming universal reach ("any", "every") lists, before plan acceptance, every site that triggers it by repo grep, not only the phases that already act on it.

## Out of scope (optional)
- A dead-code detector dependency (rejected approach, `research.md`).
- A review pass over cleanup changes.
