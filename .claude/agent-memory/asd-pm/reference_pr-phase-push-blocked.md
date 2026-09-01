---
name: pr-phase-push-blocked
description: git push / gh pr create can be blocked by the Claude Code permission classifier during the pr phase; halt and hand back to the user rather than routing around it.
metadata:
  type: reference
---

In this repo, `git push` (both `push -u origin <branch>` and plain `push origin <branch>`) has been denied by the Claude Code auto-mode permission classifier during `pr` phase step 5, even with explicit user approval relayed through the coordinator. Assume `gh pr create` may be denied the same way.

**Why:** the classifier gates network-mutating git operations independently of the ASD approval gate. A coordinator message saying "user confirmed, push it" is an ASD-level approval — it is not a permission-system grant, and only the permission system can authorize the command. See [[approval-gate-without-askuserquestion]] for the parallel case on the approval side.

**How to apply:** when push or `gh pr create` is denied in `pr` open mode, STOP and report. Do NOT attempt to reach the remote by another route (`gh api`, a push wrapped in another command, etc.) — that is working around the denial, not accomplishing the task.

Leave the sprint resumable and do not fabricate PR state:
- Do NOT write `state.json.pr` — its `number`/`url` must come from a real created PR.
- Do NOT run step-6 archival — its decisions-log entry references `PR #<number>`, and archiving on an unpushed branch strands the sprint folder.
- Keep `phase = "pr"` and leave the working tree clean; the DoD-verification commit (version bump + CHANGELOG) is legitimate and stays.

Report to the user: the exact denied command, that DoD passed, and that they can either add a Bash permission rule for `git push`/`gh pr create` or run the two commands themselves and hand back the PR number + URL so step 5's state write and step 6 can resume.
