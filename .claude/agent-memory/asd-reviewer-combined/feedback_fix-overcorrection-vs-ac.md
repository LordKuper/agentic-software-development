---
name: fix-overcorrection-vs-ac
description: a review-fix that narrows a rule's definition can drop the case the AC was written for; re-read the AC text against the new wording
metadata:
  type: feedback
---

When a review-fix narrows a definition to close a loophole, re-read the AC the definition implements and check that every case the AC names still lands on the AC's outcome.

**Why:** a Scope rule fixed to stop a name-filtered run passing as `full` was rewritten to "`full` for the unscoped command, `impacted` for the impacted set", which also dropped the AC's own case ("executed the whole suite, even when invoked as the impacted set"). The suite stayed green because the pins were rewritten to the new text.

**How to apply:** for each changed pin in a review-fix, put the AC sentence beside the new rule text. A pin whose old literal was the AC's wording is the place to look. Also check agent lines that still restate the old rule: they now disagree with the home.
