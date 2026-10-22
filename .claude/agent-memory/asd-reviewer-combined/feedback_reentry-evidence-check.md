---
name: reentry-evidence-check
description: reviewing a workflow step whose Re-entry skips sub-stages by on-disk evidence - check each stage writes its evidence at that stage and that a template placeholder cannot fake it
metadata:
  type: feedback
---

When a workflow step lists "Re-entry: skip each stage <artifact> already evidences — <section/line>", trace where each
evidence key is written. A defect has shown up in two forms:
- a stage's output is written only by a later stage, so its key never holds alone, and a lost session discards that
  output (it also breaks `core.md` "Context hygiene" 1, disk is the memory);
- the artifact is created from a template that already contains the evidence heading or a literal line (`- Chosen:`),
  so the placeholder alone satisfies the key and a hard gate is skipped.

**Why:** both forms pass the content-contract pins, which only check that the key words appear in the step and the
template.

**How to apply:** for every Re-entry key, name the stage that writes it and ask whether the template already has that
text. Fix: each stage writes its own output when it finishes, and a key counts only as filled, placeholder-free
content. Related: [[return-findings-table-shape]].
