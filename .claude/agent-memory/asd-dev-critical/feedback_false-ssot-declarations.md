---
name: false-ssot-declarations
description: Fixing a "not restated here" declaration that sits above surviving restated text - narrow the denial, keep the text that acts at its site
metadata:
  type: feedback
---

When a review finds an SSoT denial ("X is `other-file.md` — not restated here") contradicted by text below it, the default fix is to **narrow or drop the denial**, not to delete the text it mis-describes. Delete the text only where it genuinely adds nothing at the acting site (a workflow step that must perform the mechanic keeps its phase bindings; a DoD paragraph restating a fact another file owns does not). Never fix by adding compensating prose.

**Why:** the audit's own decision keeps these declarations because a later reviewer uses them as the premise of an SSoT finding — a false denial converts a self-declared contract into a trap, which is worse than no declaration. Sprint 010 iter-02 raised the same defect from two reviewers (efficiency + documentation) after iter-01's restatement cut reproduced it one level up.

**How to apply:** for each clause of the denial, grep the reach it claims ("here", "in either review workflow") and test it at HEAD. Drop the clauses that are false; keep the pointer to the home. If a list loses a member, restore the `and` conjunction. Where two reviewers disagree on whether a sentence counts as a restatement, the more specific reviewer's enumeration decides. See [[fix-the-class]] and [[sequential-fix-rounds]].
