---
name: roster-move-mirror-sweep
description: when a review roster moves between reviewers (who reviews which phase), the mirrors a removal sweep misses — README Scope cells, gating paragraphs, "Violation = a finding from <agent>" attributions, return-format rules on one composed reviewer only
metadata:
  type: feedback
---

A roster-move diff updates the obvious roster literals (workflow JSON, Dispatch rows, DoD table, README Phase(s) column) and its leftover sweep pins only the sentences it removed. Missed sites hide in text the diff left untouched or half-edited:

- README agent table: the **Scope** cell of a row whose Phase(s) cell changed (e.g. a reviewer no longer dispatched in a phase still "judges" in it; "Receives … test-plan.md" on a phase that has none).
- A gating paragraph that gains the moved reviewer in a parenthetical while the gate it describes is limited to one phase (`asd-phase-impl-review.md` step 5 predicates; `runtime.js` `standingPredicates` returns before them in design-review).
- Agent attributions of an iron rule (`artifact-layout.md` "Violation = a finding from asd-reviewer-…", README "enforced by the Quality reviewer").
- A return-format rule added to one composed reviewer (e.g. where the keep-as-is/simplify/escalate category goes) but not to `asd-reviewer-combined`, which composes that reviewer's entries.
- Runtime JSDoc naming the moved reviewer's old workflow (`COMBINED_REVIEWER`).

**Why:** the sweep and the suite only see removed text and roster literals; a Scope cell or attribution survives with no assertion touching it.

**How to apply:** for each reviewer whose phase set changed, grep its name forms (agent id, `Quality`/`Combined` capitalised, `quality.md`) across README, rules and runtime, and read each hit's whole cell or sentence, not only the column the plan named. See [[relocation-review-method]].
