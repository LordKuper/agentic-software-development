---
name: reuse-scope-labels
description: a rule letting a recorded run substitute for a gate by its Scope label - check every run kind that can write that label (named test, name filter in a one-file suite)
metadata:
  type: feedback
---

When a rule lets a recorded test run stand in for a later gate because of its Scope label (e.g. `full` ≥ `impacted` reuse), list every run kind that can write that label, then check it against the gate's real selection.

**Why:** a binary Scope (`full` or `impacted`) labels a single named-test run `impacted`, and the reuse rule then accepts it as the impacted-set gate. In a one-file suite (`tests/run.js`), a `--filter` run "selects every test file", so it can even be labelled `full` and skip the terminal full-suite run.

**How to apply:** for each new writer of `Suite run` (a review-fix or in-place tester), ask what its narrowest allowed run records as Scope. Then read the consuming gate's reuse condition (impl-test step 8, the terminal-run reuse, the pr skip) and see whether that label passes it.
