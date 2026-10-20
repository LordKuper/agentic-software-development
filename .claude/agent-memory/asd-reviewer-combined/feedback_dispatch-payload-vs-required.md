---
name: dispatch-payload-vs-required
description: how to check a workflow ## Dispatch payload list against each agent's ## Inputs required/modes - where the gaps hide (fix rows, standard-mode promote rows, External Review keys)
metadata:
  type: feedback
---

Cross-check every `## Dispatch` row's `payload` against the dispatched agent's `## Inputs` JSON: top-level `required`
applies unless the matching mode says "replaces the top-level required"; only `payload.*` items must be sent, file
paths the agent reads itself need not be.

**Why:** sprint 026 wave-3 found the gaps not in the main dispatch rows but in secondary ones: design-review's creator
fix row, design-promote's standard-mode rows (only the lite row named `inputs.requirements`), and design-review's
External Review row missing `iteration` that impl-review's twin sends.

**How to apply:**
- Grep `^\{"rules"` in `.asd/agents` and read each long line with `Read` offset/limit 1 (Grep omits it).
- Compare twin rows across design-review and impl-review for key names and core keys (`turn_budget`, stalemate set key).
- Related: [[large-diff-read-budget]], [[return-findings-table-shape]].
