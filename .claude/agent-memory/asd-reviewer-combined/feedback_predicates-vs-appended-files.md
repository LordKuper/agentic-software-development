---
name: predicates-vs-appended-files
description: an emit-manifest n/a predicate evaluated over the reviewer file list can be silently disabled when reviewerFiles appends always-present paths such as test-plan.md
metadata:
  type: feedback
---

When `runtime.js` `reviewerFiles` changes which paths a reviewer's list gets, re-check every `standingPredicates` condition that scans `input.files`. Ask whether an appended path that is always there (test-plan.md is `.md` under `.asd/sprints/`, so it counts as documentation and as templated) makes a "no X in scope" predicate impossible.

**Why:** a combined reviewer's `no documentation file in scope` became dead once test-plan paths joined its list. Unit tests that call `emitCoverageManifest` with a hand-built file list skip the CLI step that appends those paths, so they stay green.

**How to apply:** trace the CLI path (`emit-manifest` → `reviewerFiles` → `emitCoverageManifest`) with the flags the impl-review workflow always passes, then evaluate each predicate on that list.
