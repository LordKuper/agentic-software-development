---
name: no-shell-review-method
description: This reviewer has no Bash tool even when the dispatch says "run the diff yourself" — derive everything from file reads, and corroborate reported fail-first/suite runs by hash-ledger and test-count arithmetic
metadata:
  type: feedback
---

Dispatch payloads for `impl-review` routinely say "run `git diff ...` yourself", but this agent is granted only Read/Glob/Grep/Write (read-only reviewer per `providers.md`). Do not stall or ABORT on that — review from direct file reads and say once, briefly, that the diff was derived by reading files.

**Why:** reviewers are read-only by host-level design so a verdict can never be self-fulfilling; the dispatch wording is boilerplate, not a grant.

**How to apply:** to independently corroborate a test-engineer's reported fail-first run without a shell, use the framework repo's own ledger arithmetic — `.asd/release-manifest.json` tracks `.asd/hooks/**`, `.asd/agents/**`, `.asd/skills/**`, `.asd/templates/**` but NOT `tests/run.js`. So a temporary revert of canonical *ledgered* source (e.g. `.asd/hooks/session-start.js`) must produce exactly two collateral failures — the `sync.js --check` all-items-current test (generated `.claude/`/`.codex/` copies go stale) and the `upstream_hashes` recompute test — on top of the intended failing test. If a reported fail-first count matches that prediction, the run was almost certainly real; if it doesn't, probe harder. Editing only `tests/run.js` produces zero collateral failures.

**Corroborating a reported green suite / sync count without a shell** (used sprint 003 iter-4 and iter-6, worked both times):
- Reported `N/N` tests: `Grep -c '^test\('` in `tests/run.js` — top-level `test(` declarations equal the runner's total (83 matched a reported 83/83; 118 matched sprint 006's 118/118).
- A reported earlier partial run (e.g. "103/111 at <old HEAD>, 118/118 now") is checkable: `111 + <count of "+test(" lines in the sprint diff> == 118` proves the earlier run predates the new tests, so it can NOT be the fail-first evidence for any of them.
- Reported `sync.js --check` item count: `.asd/agents/*.md` count x2 (`.claude/agents/*.md` + `.codex/agents/*.toml`) + `.asd/skills/*/SKILL.md` count x2 (`.claude/skills/` + `.agents/skills/`, never `.codex/`) + the handful of full-file targets (`AGENTS.md`, `CLAUDE.md`, ...). 16 agents + 17 skills = 66 + 6 = 72. Since sprint 006, an agent may declare `variants` in frontmatter, each rendering two MORE generated views — count from `buildSyncPlan`, not from the canon file count alone.
- Reported "zero drift" after a canon prose edit: grep the changed sentence in all three trees (`.asd/`, `.claude/`, `.agents/`) — present in all three means `sync.js --apply` really ran.
- Ledger freshness: sha256 can't be recomputed here, but for a file in both maps, `canon_hashes["skills/x/SKILL.md"]` and `upstream_hashes[".asd/skills/x/SKILL.md"]` must carry the *identical* hex; a partial/hand-patched re-render desyncs them. Say explicitly in the review that hash freshness was corroborated structurally, not recomputed.
- Directory-driven assertions can be evaluated statically: e.g. the "canon_hashes has an entry for every `.asd/agents/*.md`" test — count `"agents/*.md"` keys in the manifest and compare to the glob count (16 = 16 → that test really is green).
- Cross-check the Suite-run HEAD stamped in `test-plan.md` against the HEAD in the matching `.asd/sprints/<sprint>/decisions-log.md` entry. A prior iteration of sprint 003 had these disagree (recorded as testing finding #3); when they agree, the run record is internally consistent.

**A green suite can be bought by narrowing an assertion — always diff the EXISTING tests, not just the added ones.** Sprint 006 turned `items.filter(i => i.status !== 'current')` into `items.filter(i => i.target !== 'AGENTS.md' && i.status !== 'current')`, making 118/118 green while `AGENTS.md` was really `modified-foreign`. Root cause worth remembering: `AGENTS.md` is a *self-sourced* managed block under `self_hosting: enabled`, and `runApply` explicitly never writes/re-baselines self-sourced items — so every hand-edit of `AGENTS.md` leaves permanent drift until `.asd/sync-state.json`'s `AGENTS.md` digest is updated in the same change. Check for that pairing (AGENTS.md edited ⇒ sync-state.json edited) in every framework-repo diff, and treat any new exemption inside an existing assertion as an unrecorded test removal (`test-plan.md` "Removed tests" must carry it).
