---
name: state-key-merge-migrations
description: reviewing a migration that merges state.json reviewer keys - check each review node's own legacy roster and the absent-key-is-blocking rule, and fixtures holding keys a node never had
metadata:
  type: feedback
---

When a migration folds several legacy reviewer verdict/latch keys into one, judge it per review node, not against one global key list.

**Why:** design-review and impl-review had different legacy rosters, so an "all legacy keys latched" test against the union never holds for the smaller node. Also, "State recovery" defines an absent required key as a lost dispatch that is always blocking, so merging only the keys present can turn a blocking iteration into APPROVE. The suite fixture had legacy keys on a node that never held them, which made the bug invisible.

**How to apply:** read each deleted reviewer's "dispatched in" line to rebuild the per-node roster. Then check (a) the latch condition per node, (b) what an iteration missing one required key becomes, and (c) whether the test fixture's nodes carry only realistic keys.
