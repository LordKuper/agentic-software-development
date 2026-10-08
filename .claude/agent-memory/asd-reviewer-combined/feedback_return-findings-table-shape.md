---
name: return-findings-table-shape
description: persist-review parses the FIRST pipe table of a reviewer return as the findings table; its first cell is the finding id the ledger's f must match
metadata:
  type: feedback
---

`runtime.js` `reviewFindings` takes the first line starting with `|` as the findings table header, the first cell of each
row as the finding id, the second as a severity from SEVERITIES. The ledger's `findings` and every `f` must use those ids.

**Why:** a table placed before Findings (an AC trace, a summary grid) would be parsed as findings and fail validation,
costing a transcription or a fresh re-dispatch.

**How to apply:**
- Keep the Findings table the first pipe table in the return; put AC traces and notes after it as prose or lists.
- Never put a bare `|` in a cell (shell alternatives, `a|b` enums): write `or`, or escape it as `\|`.
- Rule rows hold one `f`; a finding with several homes goes on its primary rule only. Sections and files carry no `f`.
- Related: [[large-diff-read-budget]].
