---
name: split-part-rubric-rows
description: In a split testing review every rule id carries the out-of-part n/a in every part, so the part holding tests/run.js must resolve rubric rows itself; also check assert messages claim nothing their predicate skips
metadata:
  type: project
---

Since sprint 012 `emit-manifest` gives every rule id in EVERY part the out-of-part predicate ("evidence outside this part; covered by the other parts") — even ids like "Stub-resolution verification" or "Manual verification (last resort)" that have no standing predicate. `review-policy.md` "Union property" (c) blocks the merge when an id is out-of-part `n/a` in every part.

**Why:** the authorization is mechanical, not a statement that the other part really holds the evidence; if both parts take the easy `n/a`, the reviewer counts as incomplete.

**How to apply:** in a testing split, the part whose files include `tests/run.js` and `test-plan.md`'s exercised surfaces resolves every rubric row as `pass`/`finding` (stubs.md and `TODO(sprint-` grep take one call each). Use the out-of-part `n/a` only for an id you truly could not judge from your part's files.

Test-quality pattern worth checking each review: an assert whose message claims two properties while its predicate checks one (sprint 012 iter-01: asd-init step-13 seed assert says "registry seed precedes it unconditionally" but only checks `documents.c4` precedes `c4/model`). Replay a mutation that breaks only the unchecked half; green means a finding. See [[no-shell-review-method]].
