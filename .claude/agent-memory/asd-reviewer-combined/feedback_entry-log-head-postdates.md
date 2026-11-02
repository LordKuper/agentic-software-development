---
name: entry-log-head-postdates
description: test-plan.md Entry log "HEAD analysed" is filled by the orchestrator at impl-test route time, so it legitimately names a commit after the entry's own test and memory commits
metadata:
  type: feedback
---

An `Entry log` row's `HEAD analysed` sha can be a descendant of the commits that authored that entry's tests and test-plan rows. That is not a recording defect: `asd-phase-impl-test.md` fills it at route time with `git rev-parse HEAD`, after the tester's commits and memory commit, and the next entry's delta base is that sha.

**Why:** reading `.git/logs/HEAD` order against the row looks like a time-travel inconsistency and invites a false finding.

**How to apply:** before flagging an Entry log sha, grep `HEAD analysed` in `asd-phase-impl-test.md` and compare it with the previous entry's row; flag only when the next entry's `git diff <sha>...HEAD` base differs from it. See [[rereview-no-shell-checks]].
