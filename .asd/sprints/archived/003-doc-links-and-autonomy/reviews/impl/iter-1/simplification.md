---
responsibility:
  owns: single reviewer verdict for one iteration, persisted in reduced coverage form
  excludes: other reviewers, other iterations, fixes, the reviewer's full returned ledger, manual-verification spec
  delegates_to: creator agent (fixes), sibling review files (other reviewers), test-plan.md (manual-verification spec)
---

[REVIEW-impl-simplification]: CONCERNS

# Review — simplification

- **Phase**: impl-review
- **Iteration**: 1

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `asd-phase-design.md:27,34,38`; `asd-phase-plan.md:41-43`; `asd-phase-scope.md:32-33,39-42`; `asd-ba.md:53`; `asd-ux-designer.md:61`; `asd-architect.md:56`; `asd-pm.md:57` | The write-then-review-accept loop's canonical definition (`checkpoints.md:10-18`) is restated near-verbatim at ~10 further sites instead of referenced — three full copies inside `asd-phase-design.md` alone. Same sprint's own `ADVICE_NEEDED` pattern (define once, reference ×10) shows the cheaper alternative was known and used elsewhere. | Replace generic loop tails with "write-then-review-accept per `checkpoints.md` mechanic"; keep only artifact-specific deviations inline (ADR's one-accept-for-set, design-md-delta carve-out). |
| 2 | low | `asd-advisor.md:67`; `sprint-lifecycle.md:214` vs `:200-209` | `ADVICE_GIVEN` signal token defined in the advisor's Signals-emitted but absent from the "Signal vocabulary" SSoT list; carries no info beyond "advisor returned text". | Drop `ADVICE_GIVEN`, or add it to the vocabulary SSoT if kept. |
| 3 | low | `asd-pm.md:67` vs `:136-141`; `asd-ba.md:23` vs `:79-84`; `asd-ux-designer.md:23` vs `:92-97`; `asd-architect.md:23` vs Signals section | Four creators gained the `ADVICE_NEEDED` affordance in Stop conditions/Tool policy but none lists it under "Signals emitted". | Add one bullet to each agent's Signals-emitted section. |
| 4 | low | `asd-pm.md:92-98` vs `checkpoints.md:22-31` | `plan.md` Task 7 claims the PM approve-before-write table "mirrors checkpoints.md exactly" — it lists 5 of 8 rows, with no scoping note explaining the narrower set. | Add a one-line scope note, or restore the missing rows. |

## Explicit judgements (no findings, recorded so not re-litigated)

A. `asd-advisor.md` — real abstraction, not premature generalization. **keep-as-is**: ≥10 dispatch sites, universal enabler in core.md's mandatory rules, cost proportionate, mirrors reviewer read-only contract correctly.
B. Two gate classes — proportionate complexity, not excessive. **keep-as-is**: the single-change alternative is not viable (pre-existing rule makes pre-approval-write a `FAILED` trigger); net gate count went down (c4-full, final-mutation dropped).
C. Post-promotion summary — deliberate compensating control (audit R-3), not scope creep. **keep-as-is**: unconditional, non-blocking, answers a real gap (fold-target selection never re-opened after design gate).
D. `ADVICE_NEEDED` relay duplication across 10 workflows — correctly deduplicated (single-line pointer to one canonical protocol, the best achievable form given no-includes constraint). **keep-as-is**.

## Coverage summary (internal reviewers only)

**Summary**: `files: 24/25 checked, 1 n/a · rules: 15/15 resolved, 4 findings`

**n/a rows**: `.asd/sync-state.json` — machine-generated digest state, no design/complexity surface.

**Findings rows**: Comment restates code → finding #1. All other 14 checklist items → pass or n/a (no code added this sprint); complexity-vs-value → findings #1-#4 (mechanisms earn their weight per A-D above; excess is duplication/enumeration gaps, not design).

## Verdict
CONCERNS: 4

## Next action
Creator resolves findings #1-#4 in `impl` review-fix mode; none needs Complication Approval (all `simplify`, no new abstraction/layer/dependency/config flag).

## Escalations
None.
