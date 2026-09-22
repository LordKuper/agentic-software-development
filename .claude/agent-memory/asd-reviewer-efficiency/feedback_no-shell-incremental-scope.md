---
name: no-shell-incremental-scope
description: Efficiency review has no shell; since sprint 015 the payload carries the manifest's .diff — use it; fall back to sprint records only when no .diff is given
metadata:
  type: feedback
---

Since sprint 015 (AC-4) impl-review payloads carry `<reviewer>[.part-N].diff` beside the manifest — read it, never run git. Fallback when no `.diff` is supplied: rebuild the delta from `plan.md` subtasks, `audit.md` "Touched areas", `test-plan.md` rows/entry segments and `decisions-log.md` (iter 2+: "impl review-fix for iter-NN" entry). Never open earlier `reviews/*/iter-*/` files. `test-plan.entry-NN.md` "none" rows often pre-flag dead/unreachable runtime code for impl-review — check them.

**Why:** a finding must sit on the change surface (`review-policy.md` "Change-surface rule").

**How to apply:** raise a finding only on a changed line. Agent-memory growth is outside "Documentation economy" reach — don't raise it. Test-only micro-costs (tens of ms in one-shot sweeps) fail the complexity-vs-value bar. See [[runtime-js-single-file]].
