---
name: redefined-boundary-local-lists
description: when a verdict/gate boundary is redefined, diff every workflow's local cause list against the home; a new "fits no cause → downgrade" clause turns a missing item into a silent demotion
metadata:
  type: feedback
---

When a change redefines a boundary (e.g. FAIL vs CONCERNS), each phase workflow often keeps its own enumerated copy of the causes (FAIL grouping lists in design-review and impl-review). Compare every copy item by item with the home's list and with each reviewer agent's rule.

**Why:** one workflow's copy lacked "complexity increase". The same change added "a finding fitting no cause is CONCERNS", so `escalate` findings in that phase would have been silently autofixed instead of reaching the user.

**How to apply:** grep for the list's anchor phrase (e.g. "group by escalation cause") in every workflow. Check that the home's own enumeration is complete too, and that the cited section is the one that actually holds the rule. Related: [[enumerated-reach-vs-trigger-sites]], [[dispatch-payload-vs-required]].
