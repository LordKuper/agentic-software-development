---
name: new-agent-write-vs-deny-list
description: A canon rule making a dispatched agent write a new file (e.g. a commit message file in the scratch dir) must fit that agent's own Tools write/deny lists
metadata:
  type: feedback
---

When a rule change makes `asd-dev`/`asd-tester` (or any dispatched agent) write a file it never wrote before — a helper under `.asd/tmp/`, a message file, a report — open each affected agent's `## Tools` JSON and compare: `write` must list it and no `deny` entry (e.g. "writes elsewhere in .asd/ or .claude/") may cover it.

**Why:** the declared tool policy (`providers.md` "Declared tool policy") makes a compliant agent refuse an action outside its definition, so a rule the definitions deny breaks every dispatch that follows it, even when the suite is green and the sprint's own agents happened to comply.

**How to apply:** for each new write a diff assigns to an agent, grep the agent files' `"deny"` and `"write"` lines; the fix is a write-list entry in the agent canon, raised as a contract finding. Related: [[delegation-vs-never-list]], [[new-command-vs-skill-grant]].
