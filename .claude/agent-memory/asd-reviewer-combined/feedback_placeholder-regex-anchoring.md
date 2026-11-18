---
name: placeholder-regex-anchoring
description: A check refusing an unreplaced {{…}} template placeholder anywhere in a cell false-refuses legit text citing a template placeholder (common in this framework repo); compare with the start-anchored precedent
metadata:
  type: feedback
---

A runtime check that refuses a table cell matching `/\{\{.*\}\}/` anywhere also refuses real content that mentions a placeholder, e.g. a gap proof "seeded `{{CLEANUP}}` left unfilled: … → exit 0". In a self-hosting framework repo, tests about templates cite placeholders often.

**Why:** the check aims at a placeholder never replaced, which fills the whole cell; an anywhere-match turns a valid proof into a refusal the tester can only dodge by rewording.

**How to apply:** for a new placeholder guard, grep the runtime for an existing one (e.g. the `Allowance:` check's start-anchored `(?!\{\{)`) and grep archived test plans for `\{\{[A-Z_]+\}\}` in the guarded column; ask for a whole-cell or start anchor plus a control row with an embedded placeholder. Related: [[warning-remedy-trace]].
