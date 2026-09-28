---
name: persist-review-return-shape
description: Since sprint 020 my return is parsed by runtime.js persist-review - first table by column position, bare APPROVE must carry only the `—` placeholder row
metadata:
  type: reference
---

Since sprint 020 the orchestrator persists my returned text with `node .asd/runtime.js persist-review` (`runtime.js` `reviewFindings`/`persistReview`). It reads the FIRST markdown table in the text by column position: id, severity, location.

- `#` cell: a bare id; Severity cell exactly `low|medium|high|critical`.
- A bare `APPROVE` with any real findings row is rejected; with no findings, leave the single `| — | — | — | no findings | — |` row.
- CONCERNS/FAIL with no findings row is rejected.
- Do not put any other table before the Findings table.
- Files rows in the ledger stay `checked`/`n/a` (never `finding`); finding ids go on rules rows as `f`.

**How to apply:** check this shape before handing back; a failed parse costs a transcription or a fresh re-dispatch. Related: [[review-method-no-shell]].
