---
name: prose-marker-guards
description: a runtime guard keyed on a line an agent writes in free text (e.g. ^Stalemate: ): grep archived reports for informal forms of that line, and check the guard is limited to the verdict it is meant for
metadata:
  type: feedback
---

When runtime code changes behaviour based on a line that a model writes into a report (for example `^Stalemate: ` in an External Review body), the template grammar is not enough evidence. Grep the archived review files for that prefix and for nearby informal wording ("Stalemate: no.", "Stalemate check:"). Also check whether the guard runs for verdicts that can never carry the marker, such as a CONCERNS verdict guarded by a FAIL-only marker.

**Why:** a guard that is too loose suppresses a rewrite whenever the agent adds commentary. The reports already contain such commentary, and the suite stays green because its fixture uses only the template form.

**How to apply:** anchor the guard on the template's full grammar (e.g. `Stalemate: \d+ iterations`) and on the verdict it belongs to. Ask for a negative test with the informal form. Related: [[none-row-coverage-claims]].
