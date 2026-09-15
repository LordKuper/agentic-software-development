---
name: no-shell-incremental-scope
description: Efficiency review dispatches have no shell; how to recover the change surface (iter 1 and iter 2+) without git diff, and which growth findings are out of reach
metadata:
  type: feedback
---

Dispatches say "`git diff <sha>...HEAD`" but this reviewer has no shell (Read/Glob/Grep only). Read the manifest's `files` on disk and rebuild the delta from the sprint's own records. Iter 1: `plan.md` task subtasks (they cite file:line per edit), `audit.md` "Touched areas"/"Gaps" (line-level touch map), `test-plan.md` "Added tests"/"Risk → check decisions" (names every added/adjusted test in `tests/run.js`, grep by its title), and the `decisions-log.md` "impl assessment approved" entry (flagged choices the orchestrator routed back and had fixed are requested scope, not creep). Iter 2+: the `decisions-log.md` entry "impl review-fix for iter-NN: findings resolved" and `test-plan.md` "Entry log" rows. Never open earlier `reviews/*/iter-*/` files.

**Why:** a finding must sit on the change surface (`review-policy.md` "Change-surface rule"). Without a diff, those records are the only stated list of what changed.

**How to apply:** raise a finding only on a line you can tie to a listed change. Agent-memory growth is outside `artifact-layout.md` "Documentation economy" reach (it lists canon and sprint artifacts only; sprint 012 left 010 P1 out of scope), so do not raise memory-file bloat as an economy finding. Test-only micro-costs (e.g. a RegExp rebuilt per line in a one-shot canon sweep, tens of ms) fail the complexity-vs-value bar; don't spend an iteration on them. See [[runtime-js-single-file]].
