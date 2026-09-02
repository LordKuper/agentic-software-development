---
responsibility:
  owns: single reviewer verdict for one iteration, persisted in reduced coverage form
  excludes: other reviewers, other iterations, fixes, the reviewer's full returned ledger, manual-verification spec
  delegates_to: creator agent (fixes), sibling review files (other reviewers), test-plan.md (manual-verification spec)
---

[REVIEW-impl-quality]: CONCERNS

# Review — quality

- **Phase**: impl-review
- **Iteration**: 4

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `asd-concept:71,97-98`; `asd-stack:75,117`; `asd-design-system:78,102,128` | The skeleton-write step is unconditional and sits inside Phase 4 (and design-system Phase 6), but Edit mode routes back into those same phases. A literal execution overwrites an already-approved persistent doc with placeholders — content loss. | Qualify: skeleton write only when the target file doesn't yet exist (create mode); edit mode enters the per-section loop directly, no skeleton write. |
| 2 | high | `asd-design-system:96,113-117,142,144` | Phase 7's feedback loop-back re-enters Phase 4/6 but never re-runs Phase 5 (design-system.html regen) or the designmd-lint check — a DESIGN.md token revised at the final gate leaves design-system.html stale, contradicting the file's own "regenerated once, at Phase 5 (never left stale)" hard rule. | Phase 7 feedback re-entering Phase 4 must re-run designmd-lint + Phase 5 regen before re-posting the summary. |
| 3 | high | `asd-stack:104-106,85-99,131` | Same loop-back defect: Phase 7 feedback re-enters Phase 4 only, never re-runs Phase 5-6 (knowledge-gap/tech-reference) — COMPLETED can emit with a tech that has no matching tech-reference doc, violating the file's own hard rule. | Phase 7 feedback changing a tech/version must re-run Phases 5-6 for the affected entries before re-posting/COMPLETED. |
| 4 | high | `checkpoints.md:62` vs `:40-48`, `asd-design-system:16-17,113-117` | "Recording scope" clause (b) enumerates only `/asd-concept`/`/asd-stack` as standalone gates — `/asd-design-system` is equally standalone-invocable but unlisted, and has no table row of its own. Its recording obligation is unspecified. | Add `/asd-design-system` to clause (b) and to the write-then-review-accept table; mark clause (a)'s parenthetical non-exhaustive. |

## Coverage summary (internal reviewers only)

**Summary**: `files: 6/6 checked, 0 n/a · rules: 6/13, 4 findings`

**n/a rows**: off-by-one, resource leaks, timezone/locale, security (injection/crypto/authz) — no such surface in this prose/JSON diff.

**Findings rows**: null/undefined paths (recording target undefined) → #4. Destructive/overwriting operations → #1. Unhandled error/undefined state → #2, #3. Contract self-consistency (own hard rules) → #2, #3.

## Verdict
CONCERNS: 4 (all high)

## Next action
Route to `impl` review-fix mode. All four are clarifying clauses inside files already in sprint scope — no escalation, no AC change.

## Escalations
None.
