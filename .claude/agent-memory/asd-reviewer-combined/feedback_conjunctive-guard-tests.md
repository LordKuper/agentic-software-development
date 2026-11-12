---
name: conjunctive-guard-tests
description: a guard narrowed to "A and B": check that each conjunct has a test that a revert of that conjunct alone turns red; new cases often pass on either half
metadata:
  type: feedback
---

When a fix narrows a guard to two conditions (e.g. verdict is FAIL AND the line matches the full grammar), check each new negative case against each conjunct on its own. A case that breaks both conditions (a CONCERNS verdict with an informal line) stays green if either half is reverted.

**Why:** a fail-first run against the pre-fix tree goes red because both halves are missing there. That does not show that each half is pinned.

**How to apply:** for every conjunct, name the case where only that conjunct decides the outcome and look for a test of it. If that case is missing, weigh it against the hypothetical-risk criterion (is there archived evidence of that form?) before setting severity. Related: [[none-row-coverage-claims]], [[prose-marker-guards]].
