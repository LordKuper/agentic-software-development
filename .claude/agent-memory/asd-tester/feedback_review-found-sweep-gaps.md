---
name: review-found-sweep-gaps
description: when impl-review finds stale text a leftover-term sweep missed, pin the removed-from-main clauses, not the sprint's own intermediate wording
metadata:
  type: feedback
---

A leftover-term sweep lists sentences taken from the diff's removed lines, so a clause the roster move made false but the diff never touched survives. When a review finds such clauses, extend the existing sweep array with the ones that were on the base branch and are now absent from live canon; skip text the sprint itself wrote and then reworded in a fix round.

**Why:** the first is a real recurring failure mode (the review found it); the second never existed on main and only pins a transient wording.

**How to apply:** at a re-entry after a review-fix, grep each removed clause across the repo first (absent from live canon, present only in review diffs and archived sprints), add it to the sweep array rather than authoring a new test, and prove with one mutation per phrase plus a reword control through `--filter`.
