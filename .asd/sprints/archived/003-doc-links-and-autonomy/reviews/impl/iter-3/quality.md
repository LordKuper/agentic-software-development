---
responsibility:
  owns: single reviewer verdict for one iteration, persisted in reduced coverage form
  excludes: other reviewers, other iterations, fixes, the reviewer's full returned ledger, manual-verification spec
  delegates_to: creator agent (fixes), sibling review files (other reviewers), test-plan.md (manual-verification spec)
---

[REVIEW-impl-quality]: CONCERNS

# Review — quality

- **Phase**: impl-review
- **Iteration**: 3

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `core.md:57` vs `asd-concept/SKILL.md:71-82`, `asd-stack/SKILL.md:75-81,100-104`, `asd-design-system/SKILL.md:78-84,100-102,105-109`; secondarily `asd-ba.md:53`, `asd-ux-designer.md:61` | Contradictory per-section mechanic for the same 5 AC-3 artifacts. `core.md`'s new "Incremental writing" rule requires write-per-section-then-review-on-disk. All three setup skills instead run their whole `Lock in`/`Revise this section` loop BEFORE any write (full section content posted in chat), only writing at the final phase — the full bodies of concept.html/stack.html/DESIGN.md/design-system.html/accessibility.html still flow through chat section-by-section, violating AC-2's no-content-dumps rule. `asd-ba.md`/`asd-ux-designer.md` now assert "no per-section approval gate before writing" while the skills that dispatch them mandate exactly that. | Convert the 3 skills' pre-write section loops to write-first order matching `core.md:57` (skeleton write at phase entry, write each section, post path+delta, `Lock in`/`Revise this section` on the on-disk file). Alternative (carve-out in `core.md` instead) changes what AC-2 covers — escalate first if chosen. |

## Coverage summary (internal reviewers only)

**Summary**: `files: 13/13 checked, 0 n/a · rules: 20/25, 1 finding (2 rows)`

**n/a rows**: race conditions, resource leaks, timezone/locale — no concurrency/handles/dates in scope. API-signature-drift-vs-ADR, schema migration — neither applicable (adr disabled, no schema change).

**Findings rows**: Contracts — user-facing option vocabulary (mechanic side) → #1. Best practices — SSoT rule vs implementation agreement → #1.

## Verdict
CONCERNS: 1 (high)

## Next action
Route to `impl` review-fix mode. Preferred fix (skeleton-first in the 3 skills) is a plain autofix inside `sprint.md` scope, no escalation needed. Alternative fix (core.md carve-out) needs escalation — see below.

## Escalations
- finding #1: escalation required ONLY if the chosen fix is the `core.md` carve-out route (narrows what AC-2 covers, a scope/AC reinterpretation). The preferred skeleton-first fix needs no approval.
