---
name: memory-lines-vs-history-patterns
description: Agent-memory lines in a review diff: match each added line against runtime.js MEMORY_HISTORY_PATTERNS (wave/iter/sprint/Task tokens); a committed hit bypassed the memory-check gate
metadata:
  type: feedback
---

For every agent-memory file in scope, Grep its added lines for the tokens `MEMORY_HISTORY_PATTERNS` in `.asd/runtime.js` rejects (a wave or iteration label with digits, a sprint id or slug, `Task <digits>`, a verdict line). An "Observed (<wave label> <iteration label>)" qualifier is the common form.

**Why:** the content rule (`artifact-layout.md` "Agent memory") is enforced only on the staged diff at commit time; once committed, no later check reruns over unchanged lines, and the line is paid on every dispatch of that agent.

**How to apply:** one Grep of `.claude/agent-memory` for those token shapes per review; report a diff hit as a finding routed to the owner's memory-fix dispatch, older hits seen in the same Grep as `pre-existing:`. Avoid digits after "wave"/"iter" in own memory text.
