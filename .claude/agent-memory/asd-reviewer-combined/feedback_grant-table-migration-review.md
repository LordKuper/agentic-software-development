---
name: feedback_grant-table-migration-review
description: Reviewing a role-grant table rewrite (prose rows to section refs) — check dropped preamble grants, conditional-grant acting sites, and reading-rule carve-outs
metadata:
  type: feedback
---

When a grant table moves from whole-file prose rows to section refs, compare more than row against row:

- The preamble's generic grants (e.g. "a gate proposal additionally reads X") are grants too. A role whose body still cites X needs a ref to it.
- Every "conditional grant" needs an acting site. Some role must read the condition list (in its bundle or in a workflow op) and name the refs in the payload. Otherwise the grant is dead text.
- A "never open a rule file whole" reading rule must exempt files in the agent's own write or review scope. Without that it contradicts review-policy "Scope hand-off" item 3, and under self-hosting it blocks devs who edit rules.
- A runtime regex that copies a set another script owns (e.g. tier suffixes in sync.js) is an SSoT drift risk. Grep the owner and compare the two sets.

**Why:** these gaps survive a row-level comparison and every "ref resolves" test, because the refs that are missing are simply absent.
**How to apply:** for each old whole-file grant, list the sections the receiving agent's body cites, then confirm each one is in its bundle or named through a wired conditional. Related: [[feedback_relocation-review-method]].
