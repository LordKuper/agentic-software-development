---
name: memory-fix-fallback-keep
description: review-policy.md memory-fix dispatch's MEMORY-FIX fallback (owner with no write tool) looks unreachable but an AC mandates it; judged keep-as-is
metadata:
  type: project
---

Every canonical agent carries `memory: project` with no `Write` in `disallowedTools`, so on Claude every memory owner holds `Write`. The `MEMORY-FIX <path>` fallback ("an owner with no write tool at all") in `review-policy.md` "Autofix vs escalation" and `asd-phase-impl.md` step 3 therefore never fires for canon agents.

**Why:** not a dead branch. An accepted AC requires it by name ("when the host gives the owner no write tool..."), and a consumer's custom agent with `memory: project` and `Write` in `disallowedTools` still reaches it. Judged keep-as-is, not an OE "impossible-by-contract" hit.

**How to apply:** don't raise that fallback as dead or defensive code unless an AC or the user removes the requirement. Related: [[no-shell-incremental-scope]].
