---
name: inserted-dispatch-reachability
description: a new agent or skill dispatched at a step: check that no other single dispatch already spans that step, and check the caller's Delegates/hard-rule/never-list for the new invocation site
metadata:
  type: feedback
---

A workflow step can gain a new dispatch: a cheaper variant, a skill run at a new phase, or a new advisor consult kind. Check that it is reachable and authorised:

- Does another agent's single dispatch already cover that step? Look for "the one live X runs steps …" lines and a Dispatch row "when" such as "steps 3-9". If so, the new dispatch never fires unless the earlier agent returns before that step.
- Is the new invocation site listed in the dispatching skill's `## Delegates` (guarded by "never: delegate outside `## Delegates`")? Is it named in core.md "Invariants" and the t_AGENTS.md hard rule when it writes settings? Does the README command row mention it? Does the phase skill's `allowed-tools` include `Skill`?
- For a new consult kind, check the callee's `description` and Inputs `required`, the agent-protocol "Relay" cases, and every Dispatch row "when".

**Why:** each of these gaps leaves the new path unreachable, or refusable under "Declared tool policy", while the suite stays green.

**How to apply:** for every Dispatch row the diff adds, grep the receiving agent or skill name across `.asd/skills/*/SKILL.md` `## Delegates`, core.md, t_AGENTS.md and README. Related: [[delegation-vs-never-list]], [[dispatch-payload-vs-required]].
