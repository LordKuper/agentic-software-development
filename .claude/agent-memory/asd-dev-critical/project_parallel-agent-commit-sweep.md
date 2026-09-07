---
name: parallel-agent-commit-sweep
description: In parallel impl dispatches on this repo, a sibling task's commit can swallow your still-uncommitted source edits under its own message
metadata:
  type: project
---

When `impl` dispatches several tasks concurrently on one working tree, a sibling agent that stages broadly (`git add -A` / `git commit -a`) commits **your** uncommitted files under **its** message. Observed 2026-09-07 in sprint 008: Task 6's commit carried Task 9's whole `.asd/runtime.js` change, so Task 9's own commit could not contain its primary source edit.

**Why:** one shared checkout, no per-task branch, no locking — only the sibling's staging discipline separates the tasks.

**How to apply:**
- Stage explicitly by path, never `-A`/`-a`, so you never swallow a sibling's work.
- Commit each file as soon as its edit is complete and verified, rather than batching all edits until the end of the task.
- Before committing, check `git log -1 -- <your files>` / `git hash-object` against `HEAD:<path>`: an edit that shows no diff may already be inside a sibling's commit. Do not rewrite history to reclaim it — report the mix-up in the COMPLETED summary so the orchestrator can log the friction.
- Related ledger hazard: [[sync-apply-ledger-gotcha]].
