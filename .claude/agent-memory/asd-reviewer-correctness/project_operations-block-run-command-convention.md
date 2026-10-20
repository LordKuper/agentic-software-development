---
name: operations-block-run-command-convention
description: A workflow's `## Entry` `ops` run-command entry declares only git + commands.yaml operations; `node .asd/runtime.js` invocations are never declared there - check uniformity across sibling workflows before raising an undeclared-operation finding
metadata:
  type: project
---

Before raising "step N runs a command the `## Entry` `ops` array never declared", grep every sibling `asd-phase-*.md` `## Entry` block for the same omission. If it is uniform, it is convention, not a defect.

**Why:** the review workflows run `node .asd/runtime.js external-preflight|emit-manifest|persist-review|...` and `asd-phase-impl.md`/`asd-phase-impl-test.md` run `route-task` from their steps, yet no `ops` run-command entry names runtime.js; those entries list only `git` + `commands.yaml` (+ `sync.js` under self_hosting). A runtime.js mention inside a `write a file` op (the `scratch-dir` path source) is not a run-command declaration. runtime.js is orchestrator-internal tooling, outside the declaration's scope. A single-file view of the gap looks like a clean defect; raising it ships a false finding.

**How to apply:** `ops` IS grant-bearing, so the finding class is real - but it only lands for git or `commands.yaml` operations, and only where the sibling workflows do declare theirs. Same shape as the "rule with no acting-site binding" hunt in [[review-method-no-shell]]: confirm the acting-site convention before calling a gap a gap.
