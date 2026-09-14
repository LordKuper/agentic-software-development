---
name: no-shell-incremental-scope
description: Efficiency review dispatches have no shell; how to recover an iter-2+ incremental delta without git diff, and which growth findings are out of reach
metadata:
  type: feedback
---

Dispatches say "`git diff <sha>...HEAD`" but this reviewer has no shell. Read the manifest's `files` on disk and rebuild the delta from the sprint's own records: the `decisions-log.md` entry "impl review-fix for iter-NN: findings resolved" (finding ids, accepted flagged choices) and `test-plan.md` "Entry log" rows (per-entry scope and commit ranges). Never open earlier `reviews/*/iter-*/` files.

**Why:** a finding must sit on the change surface (`review-policy.md` "Change-surface rule"). Without a diff, those two records are the only stated list of what changed.

**How to apply:** raise a finding only on a line you can tie to a listed fix. Agent-memory growth is outside `artifact-layout.md` "Documentation economy" reach (it lists canon and sprint artifacts only; sprint 012 left 010 P1 out of scope), so do not raise memory-file bloat as an economy finding. See [[runtime-js-single-file]].
