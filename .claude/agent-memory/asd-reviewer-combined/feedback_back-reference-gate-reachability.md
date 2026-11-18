---
name: back-reference-gate-reachability
description: A fix routing a case to "waits for step N" from a later step: check the flow ever returns to step N, and that the agent's own Escalation row does not route the same case differently
metadata:
  type: feedback
---

When a review-fix narrows an authority ("cites the scope item only where it covers X; any other case waits for step N"), read the step that now carries the clause: if it runs after step N and its exit goes forward (e.g. "then step 8"), the uncovered case reaches no gate in that entry, and a later re-entry's rotation may carry its row away. Also compare the agent file's Escalation table: a second route for the same case (`QUESTION`) beside the prose route is a contradiction.

**Why:** a narrowed authority reads correct in isolation; the defect is only visible by walking the step order.

**How to apply:** for every "waits for / goes to step N" a diff adds, list the steps that can run after the clause's step and confirm one returns to N; grep the agent's Escalation JSON for the same case. Related: [[inserted-dispatch-reachability]], [[redefined-boundary-local-lists]].
