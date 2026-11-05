---
name: delegation-vs-never-list
description: when a skill starts delegating to another, compare the delegate's real write set with the caller's never-list and Outputs; when a rewrite drops a clause, ask which case only it routed
metadata:
  type: feedback
---

A new delegation inherits the delegate's writes, so the caller's `never: touch` list can turn false. Take the write set from the delegate's code (`.asd/sync.js` `buildSyncPlan`, its three ownership classes), not from its `## Outputs` line, which can be narrower.

**Why:** a plan-listed exception covered the JSON-merge targets only, while the delegate also wrote managed blocks and paths outside `managed_paths`; the suite stayed green because no pin reads a never-list.

**How to apply:**
- Per new delegation, list every target class the delegate writes and grep each in the caller's `## Rules` and `## Outputs`.
- For a reworded workflow step, take each removed clause and name the case it routed. "Confirm X before proceeding" with its else-branch cut leaves that case with no exit; check the `## Exit` table for a row.
- Check an external CLI's exit-0-without-effect cases in its manual, not only its failure cases.
- Related: [[enumerated-reach-vs-trigger-sites]], [[new-command-vs-skill-grant]].
