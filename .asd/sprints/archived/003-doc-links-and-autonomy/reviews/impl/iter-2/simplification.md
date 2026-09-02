---
responsibility:
  owns: single reviewer verdict for one iteration, persisted in reduced coverage form
  excludes: other reviewers, other iterations, fixes, the reviewer's full returned ledger, manual-verification spec
  delegates_to: creator agent (fixes), sibling review files (other reviewers), test-plan.md (manual-verification spec)
---

[REVIEW-impl-simplification]: CONCERNS

# Review — simplification

- **Phase**: impl-review
- **Iteration**: 2

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | critical | `tests/run.js:29-31` | `readRaw(p)` defined and never called anywhere in `tests/**`; wraps exactly one stdlib call with no added value. Undroppable checklist hits: unused-helper + dead code. | Delete lines 29-31. |
| 2 | medium | `asd-pm.md:112-125` | The write-then-review-accept block points at `checkpoints.md` and then restates it anyway (4 bullets + a verbatim copy of "Approval recording"). | Delete the restated bullets, keep only the pointer + the PM-specific fact. |
| 3 | medium | `asd-concept/SKILL.md:81`; `asd-design-system/SKILL.md:108`; `asd-stack/SKILL.md:103` | Each points at the mechanic then re-spells steps 2-4 of it; only the artifact-specific tail is worth keeping. | Reduce to pointer + deviation only. |
| 4 | medium | `asd-ux-designer.md:22,25,62` | The `design-md-delta.yaml` approve-before-write carve-out is stated three times in one file with slightly different wording. | Keep one home (the Note at :25), reduce the other two to cross-references. |
| 5 | medium | `asd-ba.md:61`, `asd-architect.md:66`, `asd-ux-designer.md:73` | Restate `ADVICE_NEEDED` resume semantics as "same turn" — now contradicts its own SSoT (`sprint-lifecycle.md:214`, "fresh dispatch"). A restated fact that already drifted. | Delete the trailing clause; resume semantics live only in `sprint-lifecycle.md`. |
| 6 | medium | `sprint-lifecycle.md:217` | Consult cap counts against a unit (`per consulting-agent dispatch`) that step 3 recreates every round-trip — no counter exists anywhere in canon, so the cap is inert or unbounded. | Bind the count to the phase workflow, persisting across re-dispatches. |

## Coverage summary (internal reviewers only)

**Summary**: `files: 19/19 checked, 0 n/a · rules: 10/19, 6 findings`

**n/a rows**: interface/generic/factory/inheritance-depth checklist items — no such constructs exist in Markdown/JSON/plain-JS scope.

**Findings rows**: Helper wrapping one stdlib call + dead code → #1. Complexity-vs-value / SSoT restatement → #2, #3, #4, #5, #6.

## Verdict
CONCERNS: 6

## Next action
Route to `impl` review-fix mode; all six are deletions or one-clause rewordings, no Complication Approval needed.

## Escalations
None.
