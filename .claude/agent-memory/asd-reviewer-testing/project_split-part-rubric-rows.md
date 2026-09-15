---
name: split-part-rubric-rows
description: In a split testing review every rule id carries the out-of-part n/a in every part, so the parts must resolve rubric rows themselves (the source-only part too, reading tests/run.js as context); also check assert messages claim nothing their predicate skips
metadata:
  type: project
---

Since sprint 012 `emit-manifest` gives every rule id in EVERY part the out-of-part predicate ("evidence outside this part; covered by the other parts") — even ids like "Stub-resolution verification" or "Manual verification (last resort)" that have no standing predicate. `review-policy.md` "Union property" (c) blocks the merge when an id is out-of-part `n/a` in every part.

**Why:** the authorization is mechanical, not a statement that the other part really holds the evidence; if both parts take the easy `n/a`, the reviewer counts as incomplete.

**How to apply:** in a testing split, the part whose files include `tests/run.js` and `test-plan.md`'s exercised surfaces resolves every rubric row as `pass`/`finding` (stubs.md and `TODO(sprint-` grep take one call each). The part holding only source files (sprint 013 iter-01 part 1: `runtime.js`, migrations, hooks, rules, skills) can also resolve rows as `pass`/`finding`: read the matching `tests/run.js` tests as context and judge whether its own files' behaviour is covered. Use the out-of-part `n/a` only for an id you truly could not judge from your part's files. A defect that lives in `tests/run.js` itself belongs to the part that holds that file, even when the source site it fails to guard is in your part. Examples: a sweep exemption that is too broad ([[sweep-exemption-granularity]]), or a record-shape problem such as sprint 013's off-template `Decision` value `adjust` with an empty Removed tests table after a test was replaced. The manifest limits findings to the part's own files. Give the other part a one-line pointer in Next action, not a finding.

Test-quality pattern worth checking each review: an assert whose message claims two properties while its predicate checks one (sprint 012 iter-01: asd-init step-13 seed assert says "registry seed precedes it unconditionally" but only checks `documents.c4` precedes `c4/model`). Replay a mutation that breaks only the unchecked half; green means a finding. See [[no-shell-review-method]].
