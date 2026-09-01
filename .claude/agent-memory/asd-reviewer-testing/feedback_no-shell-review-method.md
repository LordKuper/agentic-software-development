---
name: no-shell-review-method
description: This reviewer has no Bash tool even when the dispatch says "run the diff yourself" — derive everything from file reads, and corroborate reported fail-first/suite runs by hash-ledger arithmetic
metadata:
  type: feedback
---

Dispatch payloads for `impl-review` routinely say "run `git diff ...` yourself", but this agent is granted only Read/Glob/Grep/Write (read-only reviewer per `providers.md`). Do not stall or ABORT on that — review from direct file reads and say once, briefly, that the diff was derived by reading files.

**Why:** reviewers are read-only by host-level design so a verdict can never be self-fulfilling; the dispatch wording is boilerplate, not a grant.

**How to apply:** to independently corroborate a test-engineer's reported fail-first run without a shell, use the framework repo's own ledger arithmetic — `.asd/release-manifest.json` tracks `.asd/hooks/**`, `.asd/agents/**`, `.asd/skills/**`, `.asd/templates/**` but NOT `tests/run.js`. So a temporary revert of canonical *ledgered* source (e.g. `.asd/hooks/session-start.js`) must produce exactly two collateral failures — the `sync.js --check` all-items-current test (generated `.claude/`/`.codex/` copies go stale) and the `upstream_hashes` recompute test — on top of the intended failing test. If a reported fail-first count matches that prediction, the run was almost certainly real; if it doesn't, probe harder. Editing only `tests/run.js` produces zero collateral failures.
