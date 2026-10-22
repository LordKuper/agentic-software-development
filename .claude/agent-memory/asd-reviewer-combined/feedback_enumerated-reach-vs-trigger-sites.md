---
name: enumerated-reach-vs-trigger-sites
description: when a rule home closes its reach to an enumerated phase list, check every phase where its trigger can fire, not only the phases the diff edits
metadata:
  type: feedback
---

When a rule home narrows its reach to a closed list ("fixed inside the phase that found it — A, B, C or D") while a sibling rule fires the trigger generically ("in the current phase"), enumerate every site where the trigger can actually occur, then compare.

**Why:** a memory-check hit fires at every orchestrator-held memory commit. That includes memory writes by creators that hold no commit tool (BA/UX/Architect/advisor) in scope, audit, design and design-promote. A closed four-phase list left those hits with no route, and a suite pin that derived "exactly these phases cite the home" locked the gap in.

**How to apply:** for each trigger, grep the rule that says who commits or fires it (e.g. `git-strategy.md` "Commit before review" commit-tool roles), list the phases those roles are dispatched in, and diff that list against the home's enumeration. A pin that equates "citing phases" with the home's list is part of the fix, not evidence the reach is complete.
