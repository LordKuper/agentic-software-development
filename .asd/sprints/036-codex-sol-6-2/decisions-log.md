---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), .asd/project/retro-backlog.md (retro row dispositions), state.json (state), reviews/ (verdicts)
---

# Decisions Log

Per-sprint, append-only. Never edited or removed. Created at `scope`, rotated at phase entry (`.asd/rules/artifact-layout.md` "Decisions log"), archived with the sprint.

## Entry format

```markdown
## YYYY-MM-DD — <one-line summary>

- **Decision**: <what was decided> (≤3 sentences)
- **Rationale**: <why> (≤3 sentences)
- **Affected docs**: <links> (unrestricted)
```

A no-op skip, other zero-content decision, dispatch routing line or failed-dispatch reconstruction uses the one-line form instead:

```markdown
- YYYY-MM-DD — <phase> skipped: <reason>
- YYYY-MM-DD — route <taskIds>: <tier>, dispatch HEAD <sha>[; risk <declaration>]
- YYYY-MM-DD — reconstruction: landed <ids>; re-dispatched <ids>
- YYYY-MM-DD — stall: <agent> <dispatch ids>
- YYYY-MM-DD — cleanup checkpoint <sha>
- YYYY-MM-DD — cleanup: removed <paths/symbols>; reverted <ids or none>; verified <build, lint, tests @sha>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->
- 2026-11-18 — route Task 1: standard, dispatch HEAD 6e04b0c2
- 2026-11-18 — route Task 2: standard, dispatch HEAD 55c00255
- 2026-11-18 — route Task 3: standard, dispatch HEAD 55c00255
- 2026-11-18 — route Task 4: standard, dispatch HEAD 55c00255
- 2026-11-18 — route Task 5: standard, dispatch HEAD 55c00255
- 2026-11-18 — route Task 6: standard, dispatch HEAD 55c00255
- 2026-11-18 — route Task 7: standard, dispatch HEAD 5d6d71a4

## 2026-11-18 — scope amendment: AI attribution setting (AC-15..AC-17)

- **Decision**: Add `git.ai_attribution` (AC-15) with a deterministic check on every `asd-sprint` run that removes re-enabling entries from the project-level Claude Code settings only, plus a `commit-check` guard, a PR-body rule and a one-line hint for Codex (AC-16). This repo sets it `disabled` (AC-17). Task 8 runs in wave 4 and Task 9 alone in wave 5.
- **Rationale**: The user requested it mid-sprint and chose the options at the amendment gate. Codex has no local key: since openai/codex PR #22412, attribution is the ChatGPT workspace's `commit_attribution_enabled`, and its injected instructions override any disabling prompt. That is why the guard works on the commit message.
- **Affected docs**: [sprint.md](sprint.md), [plan.md](plan.md)
- 2026-11-18 — route Task 8: standard, dispatch HEAD 630d2547

## 2026-11-18 — impl assessment approved (adaptive)

- **Decision**: Accept Task 1's and Task 8's additive `commit-check` report fields (`misplaced`, `ai_attribution`): the existing keys and exit codes are unchanged, so the "shape unchanged" predicate holds for current readers. Accept the net-neutral D13 trims in `git-strategy.md` and `sprint-lifecycle.md`, which reviewers verify. Accept Task 8's `attribution-check` resetting a re-enabling value to its off value (`""`/`false`) rather than deleting the key: the re-enabling entry is gone and the off state holds even without the project key, which meets AC-16.
- **Rationale**: Nine Tasks, every checkbox ticked. Build and lint are clean and the round diff stays inside authorised paths. No earlier disposition of these choices exists in any log segment. The known red tests (sync fixture, sprint-019 AC-8, sprint-035 AC-15) are impl-test's.
- **Affected docs**: [plan.md](plan.md)
- 2026-11-18 — route impl-test entry 1: standard, dispatch HEAD fc3e672a
- 2026-11-18 — impl-test memory check: no memory fix; asd-reviewer-combined `feedback_lexer-ceiling-claims.md` and `feedback_fix-overcorrection-vs-ac.md` cite the removed lexer only as an example of a general review method that stays valid
- 2026-11-18 — impl-test: defects D-1 → impl test-fix (digest 65b1c04be98e50e39d753482a02354ea494c2a27398d6c8e96be59b2d9e208bd)
- 2026-11-18 — route D-1: standard, dispatch HEAD 5e7fbe08; risk change: json-merge render of a user-co-owned settings file
- 2026-11-18 — impl test-fix: defects D-1 resolved (2d190ca6; the dev's out-of-scope manifest hash edit was correctly blocked, and the ledger was recomputed by the orchestrator's sync --apply; `.claude/settings.json` was restored from 6dd7a354^ and re-rendered, 7478e40a; full suite 404/404)
- 2026-11-18 — route impl-test entry 2: standard, dispatch HEAD 527f694b
- 2026-11-18 — impl-test: impacted set green (405/405), 1/0 tests
- 2026-11-18 — impl-review wave-1/iter-01: combined CONCERNS (F-1..F-8), external CONCERNS (1-13; 1 critical, 2-9 high; single codex run, exit 0); no pre-existing findings, no memory findings, no reviewer questions; minor test-only branch does not fire (non-test findings) → impl review-fix (review_fixes_pending=wave-1/iter-01). Combined F-2 (AC-5 record) is met by the orchestrator's Manual verification entry in test-plan.md; combined F-3 and external 13 are one finding.
- 2026-11-18 — route review-fix wave-1/iter-01 (A: combined F-1, external 4, 6, 10; B: combined F-4, F-5, F-6, external 1, 2, 9, 11, 12; C: combined F-7, external 3, 7, 8; D: external 5): standard, dispatch HEAD b50180466ceafc88c262a4d39666514109d7f7d1; risk A change: commit contract every agent commits under, B change: security, C change: workflow gate, D change: reviewer return validation
- 2026-11-18 — route review-fix tester wave-1/iter-01 (combined F-3 = external 13, combined F-8, combined F-5 test part, external 8 test part): standard, dispatch HEAD 4ea39611019339a2f18b8b72260f894f77192733
- 2026-11-18 — impl fix for wave-1/iter-01: findings resolved (dev 76b90101, 5c3af791, d9fba3c2, a44f5e38 — subjects reworded to Conventional Commits before push, friction F-3; views 4ea39611; tester 843c0199, full suite 405/405; combined F-2 met by the AC-5 Manual verification record, b5018046). Flagged choices accepted: external 9 reads an invalid, nested or duplicate `ai_attribution` as `enabled`, the field's documented absent default; external 11 splices the last duplicate key, the one JSON.parse reads; F-5 `releasedKeys` beside `ownedKeys`; F-7 attribution check runs on the sprint branch only, skipped while a tracked settings file is user-modified; external 8 `FAILED — tech-reference missing for <command>` (D13 orchestrator/impl load at ceiling 0.7000); external 5 binds phase and reviewer from the manifest.
- 2026-11-18 — route impl-test entry 3: standard, dispatch HEAD fb92c2182e673b51e0f6b95106ec24315d1e3c46
- 2026-11-18 — impl-test: impacted set green (413/413), 8/0 tests
- 2026-11-18 — impl-review wave-1/iter-02 (floor medium): combined CONCERNS (F1-F4), external CONCERNS (1 critical, 2-3 high; no stalemate); combined F1 = external 2, combined F2 = external 1; no pre-existing, memory or question items; minor test-only branch does not fire; iteration cap not reached (next iter-03, floor high) → impl review-fix (review_fixes_pending=wave-1/iter-02).
- 2026-11-18 — route review-fix wave-1/iter-02 (A: combined F1, external 2; B: combined F2, external 1; C: combined F3, external 3): standard, dispatch HEAD 04608fb13cf10125e14c4d545e04a0e17e692998; risk A change: public contract, B change: security, C change: workflow gate
- 2026-11-18 — route review-fix tester wave-1/iter-02 (combined F4; test parts of combined F1/external 2, combined F2/external 1, combined F3, external 3): standard, dispatch HEAD 44bd775a022136cbb07804cf5367a09c29de39a0
- 2026-11-18 — impl fix for wave-1/iter-02: findings resolved (dev 0702af2d, 92c4bb8c, 8185f58b; views and owned_keys seed 44bd775a; tester 5b71f711, full suite 417/417). Flagged choices accepted: an owned key missing from the sync-state record reads stale once and the next apply seeds it byte-identically; `attribution-check -- <files>` skip list over the runtime calling git; artifact-layout wording trimmed to keep D13 under 0.70; attribution-check insert reads stale until the next apply; the POSIX 0600 assert has no fail-first run on this win32 host (recorded in test-plan).
- 2026-11-18 — route impl-test entry 4: standard, dispatch HEAD 46758e681fa3def3c7c0ece6291a04b41b4e6aba
- 2026-11-18 — impl-test: impacted set green (417/417 reused from 44bd775a), 0/0 tests
- 2026-11-18 — impl-review wave-1/iter-03 (floor high): combined CONCERNS (F1-F2), external CONCERNS (1-5 kept, 6 dropped below floor; no stalemate); no pre-existing, memory or question items; minor test-only branch does not fire; cap not reached (next iter-04, floor high) → impl review-fix (review_fixes_pending=wave-1/iter-03).
- 2026-11-18 — route note wave-1/iter-03: external 2-4 all stem from the temp-file-plus-rename write added for iter-01 external 1 (atomic replacement) and hardened in iter-02 (combined F2 / external 1). Reversing that part of the earlier disposition: `cleanSettingsFile` writes in place again (`fs.writeFileSync` on the existing file keeps its mode and ACL on every OS, no temp file to clean up); the iter-01 refusal of a settings path resolving outside the repo stays, and a settings file that is itself a symlink is refused (warning, untouched), which also closes external 4. Ownership (combined F1, external 5): one writer records it — attribution-check no longer inserts the missing key itself; the asd-sprint check delegates that to `sync.js --apply .claude/settings.json`, and sync records `owned_keys` only for a key whose value it changed. The asd-sprint commit stages only tracked files (external 1).
