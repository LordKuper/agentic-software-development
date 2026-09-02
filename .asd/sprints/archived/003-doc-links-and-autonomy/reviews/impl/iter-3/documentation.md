---
responsibility:
  owns: single reviewer verdict for one iteration, persisted in reduced coverage form
  excludes: other reviewers, other iterations, fixes, the reviewer's full returned ledger, manual-verification spec
  delegates_to: creator agent (fixes), sibling review files (other reviewers), test-plan.md (manual-verification spec)
---

[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 3

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `asd-phase-design.md:49` (step 10, c4-full instruction) | Sprint-local citation "AC-2" survives in permanent canon — `AC-2` is sprint-003-local, but this workflow file ships to every consumer via `/asd-update`, where `AC-N` is a live, always-populated namespace (a consumer's own sprint AC-2, unrelated). Same defect class fixed elsewhere in iter-2, missed here. | Replace with the canonical reference: "still no content dumps — `checkpoints.md`'s link-and-summary rule applies even without a gate". |

Four dispatch-specific checks verified clean: `ADVICE_NEEDED` removal from the 4 creator agents leaves no dangling reference (emitter description stayed generic); `core.md`'s `Lock in`/`Revise this section` tokens exactly match `language-policy.md`'s vocabulary; `checkpoints.md`'s new gate rows match the table's existing style; the `sprint-lifecycle.md` carve-out is narrowly scoped and can't be misread as general permission.

## Coverage summary (internal reviewers only)

**Summary**: `files: 13/13 checked, 0 n/a · rules: 7/13, 2 findings (rows)`

**n/a rows**: HTML shell wrapping, provenance, PRD-ADR traceability, persistent-doc actuality — none applicable (no HTML artifact, no provenance-bearing file, adr/prd disabled, no `docs/` tree).

**Findings rows**: SSoT (each fact one home) → #1. No sprint-local ID leaked into permanent canon → #1.

## Verdict
CONCERNS: 1 (high)

## Next action
Route to `impl` review-fix mode. Fix touches neither an approved requirement, an abstraction, nor sprint scope — no escalation needed.

## Escalations
None.
