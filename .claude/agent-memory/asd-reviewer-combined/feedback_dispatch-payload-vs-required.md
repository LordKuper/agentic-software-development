---
name: dispatch-payload-vs-required
description: how to check a workflow ## Dispatch payload list against each agent's ## Inputs required/modes - where the gaps hide (fix rows, per-mode rows, External Review twins)
metadata:
  type: feedback
---

Cross-check every `## Dispatch` row's `payload` against the dispatched agent's `## Inputs` JSON: top-level `required`
applies unless the matching mode says "replaces the top-level required"; only `payload.*` items must be sent, file
paths the agent reads itself need not be.

**Why:** the gaps hide not in the main dispatch rows but in secondary ones: fix rows (e.g. impl-review's test-fix row),
rows split per workflow mode where only one mode names a key (e.g. `inputs.requirements`), and an External Review row
missing a key (`iteration`) that its twin in the other review phase sends.

**How to apply:**
- Grep `^\{"rules"` in `.asd/agents` and read each long line with `Read` offset/limit 1 (Grep omits it).
- Compare twin rows across design-review and impl-review for key names and core keys (`turn_budget`, stalemate set key).
- Related: [[large-diff-read-budget]], [[return-findings-table-shape]].
