---
name: pr-phase-push-blocked
description: git push / gh pr create can be blocked by the Claude Code permission classifier during the pr phase; halt and hand back to the user rather than routing around it.
metadata:
  type: reference
---

In this repo, both `git push` and `gh pr create` have been denied by the Claude Code auto-mode permission classifier during `pr` phase step 5, even with explicit user approval relayed through the coordinator. The two are gated independently — on sprint 003 (2026-09-02) `git push -u origin <branch>` was ALLOWED and the immediately following `gh pr create --title ... --body-file ... --base main` was DENIED, so a successful push is no signal that PR creation will pass. On sprint 002 the push itself was denied. Expect either to block on any given run.

**Why:** this is **auto mode's irreversible-action classifier**, NOT a missing `settings.json` permission rule — confirmed on sprint 003, where `Bash(gh pr:*)` was already allowed and `gh pr create` was still denied. Suggesting "add a permission rule" as the fix is therefore wrong and wastes the user's time; the real unblock is the user leaving auto mode or running the command themselves. Separately, the classifier gates network-mutating git operations independently of the ASD approval gate: a coordinator message saying "user confirmed, push it" is an ASD-level approval, not a permission grant. See [[approval-gate-without-askuserquestion]] for the parallel case on the approval side.

**How to apply:** when push or `gh pr create` is denied in `pr` open mode, STOP and report. Do NOT attempt to reach the remote by another route (`gh api`, a push wrapped in another command, etc.) — that is working around the denial, not accomplishing the task.

Leave the sprint resumable and do not fabricate PR state. A push that already succeeded is fine to leave standing — the branch on the remote is harmless without a PR:
- Do NOT write `state.json.pr` — its `number`/`url` must come from a real created PR.
- Do NOT run step-6 archival — its decisions-log entry references `PR #<number>`, and archiving on an unpushed branch strands the sprint folder.
- Keep `phase = "pr"` and leave the working tree clean; the DoD-verification commit (version bump + CHANGELOG) is legitimate and stays.

Report to the user: the exact denied command, that DoD passed, and that they can run it themselves (or re-run outside auto mode) and hand back the PR number + URL so step 5's state write and step 6 archival resume. On resume, verify the PR independently with `gh pr view <n> --json number,url,state` (read-only, not classifier-gated) before writing `state.json.pr` — never take the number/url on trust — and record the real provenance in the decisions-log: who answered the ASD gate, who actually ran `gh pr create`, and that the agent verified the result.
