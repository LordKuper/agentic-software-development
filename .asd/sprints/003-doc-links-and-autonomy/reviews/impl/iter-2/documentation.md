---
responsibility:
  owns: single reviewer verdict for one iteration, persisted in reduced coverage form
  excludes: other reviewers, other iterations, fixes, the reviewer's full returned ledger, manual-verification spec
  delegates_to: creator agent (fixes), sibling review files (other reviewers), test-plan.md (manual-verification spec)
---

[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 2

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `asd-ba.md:61`, `asd-architect.md:66`, `asd-ux-designer.md:73` | Same-turn-resume claim contradicts SSoT (`sprint-lifecycle.md:214`) — the rule was corrected this round, 3 of 4 consuming mirrors weren't. `asd-pm.md:67` is correct. | Match `asd-pm.md:67`'s shape in all three. |
| 2 | medium | `sprint-lifecycle.md:217` vs `:214` | Consult cap counts a unit (per-dispatch) that step 3 recreates every relay — unenforceable as written. | Name the workflow as counter-holder, per consulting-agent task not per dispatch. |
| 3 | medium | `asd-phase-design.md:13,28,36,41,67` vs `sprint-lifecycle.md`'s two-writers rule | Design's steps 6/8/9 append decisions-log entries inline by the workflow itself, explicitly "no PM dispatch" — but the two-writers rule reserves gate-tied (accept-attached) appends to `asd-pm`. `asd-phase-scope.md`/`asd-phase-plan.md` route the same kind of append through PM; design is the lone outlier. | Add an explicit carve-out to "State recovery" for this case, or route design's appends through PM. |
| 4 | medium | `asd-ux-designer.md:25` | Cites a "moved-rows list" in `checkpoints.md` that doesn't exist (that file has two gate-class tables, no such construct). | Repoint to the actual `design | ux-spec.html` row. |
| 5 | medium | `checkpoints.md:33,44,48`; `asd-phase-design.md:35,40` | Canonical docs narrate the sprint's diff ("unaffected by this change", "audit G-8") rather than current state — `audit G-8` is a sprint-local finding id that won't resolve once the sprint archives. | State the invariant timelessly; drop sprint-artifact citations from permanent canon. |
| 6 | medium | `asd-design-system/SKILL.md:100` vs `:94`,`:105-108` | Phase 5 correctly says design-system.html write is deferred to Phase 7's combined gate; Phase 6 has no equivalent deferral qualifier for accessibility.html — asymmetric treatment of the same risk. | Mirror the Phase 5 qualifier in Phase 6. |

## Coverage summary (internal reviewers only)

**Summary**: `files: 19/19 checked, 0 n/a · rules: 3/8, 5 n/a, 6 findings`

**n/a rows**: Template adherence — no templated artifact in scope. HTML shell wrapping — no HTML artifact. Provenance — none in scope. Traceability (PRD→ADR) — both disabled this sprint. Persistent actuality — no `docs/` tree in this repo.

**Findings rows**: SSoT (each fact one home) → #3. Framework mode consistency → #1, #2, #4, #5, #6.

## Verdict
CONCERNS: 6 (1 high, 5 medium)

## Next action
Route to `impl` review-fix mode; all text-only edits, no escalation. Fix #1 needs re-sync of 3 agent files' generated views; #2/#3 each need both sides (rule + consumer) edited together to avoid reopening a mirror gap.

## Escalations
None.
