---
name: workflow-definition-keys
description: Workflow definitions' stored next/rollback_reset are derivable from phases but judged keep-as-is; persist-review parses Findings columns by position
metadata:
  type: project
---

`.asd/workflows/<name>.json` stores `next` and `rollback_reset` though both are mostly derivable from `phases`. Judged keep-as-is: they bind the plan Overview, the orchestrator (an LLM) reads them directly instead of re-deriving them, and `tests/run.js` asserts `rollback_reset` equals the derivation.

**Why:** flipping this call without new evidence causes churn and inconsistent verdicts.

**How to apply:** do not raise the stored-derivable keys unless the test guard is dropped or a new consumer appears. `persist-review` (`runtime.js` `reviewFindings`) reads a review's first table by column position (id, severity, location), so a Category column goes after Location, never before it. Related: [[runtime-js-single-file]].
