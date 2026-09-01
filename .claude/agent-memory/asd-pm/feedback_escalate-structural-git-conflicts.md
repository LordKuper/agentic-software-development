---
name: escalate-structural-git-conflicts
description: When an ASD workflow's literal git instruction conflicts with a hard git-strategy rule or with repo reality, halt and escalate to the user instead of picking a branch target silently.
metadata:
  type: feedback
---

When a phase workflow's literal git instruction is unexecutable or collides with a `git-strategy.md` "Forbidden" rule, HALT and present options rather than choosing. Do not treat "the workflow says X" as settling it when X is impossible.

**Why:** In the sprint 001 `pr` merge phase the workflow said to push the archive commit "to sprint branch", but this repo squash-merges with auto-delete-branch, so the remote sprint branch was already gone and the local one held obsolete pre-squash history. The only other obvious route — committing to `main` — is forbidden outright by `git-strategy.md` and blocked by branch protection. The user explicitly asked to be consulted "on something this structural" and then chose a third option (a follow-up `chore/archive-sprint-NNN` PR off `main`) that neither document named. Guessing would have produced either a resurrected dead branch or a rule violation.

**How to apply:** Escalation is the right call whenever the choice changes where commits permanently live, not merely how they are worded. The validated resolution pattern for post-merge archival: branch off `main`, `git mv` + `state.json` update + decisions-log append, one commit, open a PR, let the user merge — never merge it yourself. Also log the underlying framework defect as its own decisions-log entry so the gap outlives the session; do not fix the workflow file inside a sprint whose scope did not cover it. See [[design-vs-docs-disambiguation]] for the related habit of resolving ambiguity per-site rather than by blanket rule.
