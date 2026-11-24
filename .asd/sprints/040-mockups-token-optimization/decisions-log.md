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

- 2026-11-24 — Plan accepted adaptively. AC-7 supersedes AC-4 and is carried in Tasks 2–6 in waves 1–3. Baseline build is green. The user authorized all in-scope advisor recommendations. The tasks preserve compatibility and run affected contract verification before measured comparison.
- 2026-11-24 — route Task 1: escalated, dispatch HEAD 474972a83c18c88ae58196f8d4b9a796dbf98cb4; risk migration
- 2026-11-24 — route Task 3: standard, dispatch HEAD 474972a83c18c88ae58196f8d4b9a796dbf98cb4; risk artifact section and literal contract
- 2026-11-24 — route Task 4: standard, dispatch HEAD 474972a83c18c88ae58196f8d4b9a796dbf98cb4; risk artifact provider discovery contract
- 2026-11-24 — Wave 1 verified: Task 1 a8ecb89; Task 3 bf6324b; Task 4 3b689d7; generated views synced in 8473947. Context ceilings and all 77 sync statuses pass.
- 2026-11-24 — route Task 2: escalated, dispatch HEAD 8473947f3b6cb7f0ae7f0a641dad74380ba2b20e; risk broad-reasoning
- 2026-11-24 — route Task 5: escalated, dispatch HEAD 8473947f3b6cb7f0ae7f0a641dad74380ba2b20e; risk broad-reasoning
- 2026-11-24 — Accepted Combined memory-index shortening remains blocked. Claude Code refused the role-owner request because the account is on hold; repository trust was also absent. The owner-authored index is separate from the Codex measurements.
- 2026-11-24 — Wave 2 verified: Task 2 6f9c6d4; Task 5 76fd446; Node 16 migration compatibility fix 6ff3528; generated views synced in 9feb273.
- 2026-11-24 — route Task 6: test-only, dispatch HEAD 9feb273ba507078764ed0e5a00c1ad90c9fd7bdb
- 2026-11-24 — Task 6 completed at 6f65ff7. Verified eight fail-first cases (mockup snapshot, Standard collapse, none mode, update-only completion, scoped recovery grants, cap overflow, UX gating migration and invalid migration scalar), each 1 selected/exit 1 before the change or in a controlled defective snapshot. Structural reword control 1/1. Impacted suite 310/310, exit 0; exact commands recorded with impl-test evidence.
- 2026-11-24 — Matched Codex context probes on 9feb273: 24/24. Phase input fell from 618,556 to 551,019 in Lite and from 764,116 to 676,204 in Standard. Control-adjusted reductions: 12.3% and 13.4%. See token-baseline.md for cached input and limits.
- 2026-11-24 — Refreshed all 24 probes after recovery-reference corrections (48e521a). Phase input changed from 618,556 to 551,031 in Lite and 764,116 to 676,213 in Standard; raw evidence and limitations updated in token-baseline.md.
- 2026-11-24 — impl-test: impacted set green (320/320), 0/0 tests
- 2026-11-24 — AC-8 scope amendment: user requires at least 25% Codex input reduction. Apply independently to Lite (max 463,917) and Standard (max 573,087), against the original matched baseline. Tasks 7–8 wave 4, Task 9 wave 5. Zero review iterations and fix rounds; floor_base=wave-1/0. Interrupted the undispatched review and returned to implementation. Existing contracts remain in scope.
- 2026-11-24 — Accepted AC-8 advisor verdicts under AC-7. Compress the ordinary path and defer event-specific instructions with exact references. Keep mandatory bootstrap in the measured context or account for it separately within the same boundary.
- 2026-11-24 — route Task 7: escalated, dispatch HEAD 1889c3e; risk broad-reasoning
- 2026-11-24 — route Task 8: escalated, dispatch HEAD 1889c3e; risk broad-reasoning
- 2026-11-24 — AC-8 wave 4 implementation: canonical compression 8bab6f8, phase-specific grants and startup reference a2ce105, provider sync 206c371. Context ceilings and sync target checks passed. Measuring exact Codex usage.
- 2026-11-24 — route Task 9: test-only, dispatch HEAD 206c37187417f6e9ca29082ea3d1a83598a4c4f5
- 2026-11-24 — AC-8 Codex threshold met on 206c371. All 24 probes passed: Lite 618,556 → 430,393 input (−30.4%); Standard 764,116 → 515,421 input (−32.5%). Scope and cache limitations in token-baseline.md.
- 2026-11-24 — Repeated all 24 probes at 7f4ec78 after adding the fail-closed entry guard. Lite 618,556 → 430,693 (−30.4%); Standard 764,116 → 519,800 (−32.0%). Both retain AC-8 headroom.
- 2026-11-24 — Task 9 completed at 972c85e, impacted tests 208/208. Startup regression reproduced on isolated 1889c3e (1 selected, exit 1, missing phase-entry heading) and the isolated rewording control passed (1/1). Checked 29 named sections and unchanged agent-grant rows. All 77 sync targets current, context overages none, agnix 0 errors and 0 warnings. NEXT: impl-test.
- 2026-11-24 — impl-test: impacted set green (290/290), 0/0 tests
- 2026-11-24 — Resumed Lite impl-review at wave-1/iter-01. External Review: negative-cache (authentication) after real Claude Code account-hold denial; full unreviewed scope recorded.
- 2026-11-24 — wave-1/iter-01: Combined CONCERNS (1–6, two critical). Route to impl review-fix for migration retry, legacy frozen mockup selection, minimum-Node config check, settings-write authority, linked config paths and migration comments. No terminal suite on this iteration.
- 2026-11-24 — route review-fix wave-1/iter-01: escalated, dispatch HEAD 65888ea494d0d4c05b828e3839debd8b30d3ea27; risk change: migration, change: security
- 2026-11-24 — Review fixes 1–6 committed at bd73e08 and provider sync at ee94c86. All 77 sync targets current. Build, lint and the context check passed. Agnix reported 0 errors and 0 warnings. Actual Node 16.7 verified default and stdin config diagnostics and sync.
- 2026-11-24 — impl fix for wave-1/iter-01: findings resolved
- 2026-11-24 — route impl-test entry 3 strategy: standard, dispatch HEAD 102bbb4fd25500c76c634115bb80bfdde966b6b2
- 2026-11-24 — All 24 matched Codex probes passed after the review fixes and provider sync at ee94c86. Lite 618,556 → 430,941 (−30.3%); Standard 764,116 → 520,232 (−31.9%). Both pass AC-8. See token-baseline.md and codex-phase-review-fix.json.
- 2026-11-24 — route impl-test entry 3 author: standard, dispatch HEAD 25bd4c3eca84a5287d78b1f6b9411813f7a547fe
- 2026-11-24 — impl-test: impacted set green (326/326, full safety valve), 3/0 tests
- 2026-11-24 — wave-1/iter-02: Combined CONCERNS (1–2), external availability skip with 69 paths. Finding 1 is an impossible-by-contract pending-list guard: the migration interval is empty once the installed version reaches the target. Search found the only CLI early return at this guard. Finding 2 is a test-file wording pin. Route both to review-fix, Dev then Tester.
- 2026-11-24 — Советник подтвердил плановое поручение владельцу asd-reviewer-combined в Codex. Правило Claude-only применяется к маршруту Memory-fix для находок ревью, хвостов и memory-check, а не к согласованному сокращению индекса владельцем. Контроль: те же 44 ссылки, меньше текста; отдельный коммит и следующий обзор изменений.
- 2026-11-24 — route review-fix wave-1/iter-02: standard, dispatch HEAD 2cc248dbad96bd511ed79e68da6e2318a879808a; risk none via CLI and managed-version range check
- 2026-11-24 — route plan memory owner index: standard, dispatch HEAD 2cc248dbad96bd511ed79e68da6e2318a879808a
- 2026-11-24 — route combined.md 2: standard, dispatch HEAD 7156ff74df95d4619aef36ae18f4c975317628db
- 2026-11-24 — F-1 owner path resolved: Combined authored its accepted index reduction in Codex, committed at d24d80a. Verified all 44 labels, targets and order; index 8,246 → 4,747 bytes. Memory check passed. All 22 measured Codex phase bundles still match their probe inputs byte for byte.
- 2026-11-24 — Review fixes at d7c0795 and 41eea73, build 77 targets current, lint and context checks green, agnix 0 errors and 0 warnings. Focused updater area 38/38 (a51ad16).
- 2026-11-24 — impl fix for wave-1/iter-02: findings resolved
- 2026-11-24 — route impl-test entry 4 strategy: standard, dispatch HEAD c5b1feda4d9eebce86b0af681590106044f0c658
- 2026-11-24 — impl-test: impacted set green (152/152 reused at c5b1feda), 0/0 tests
- 2026-11-24 — wave-1/iter-03: Combined CONCERNS (1); external availability skip with 70 paths. The static trace and menu check do not independently guard the write step. Preserve the earlier de-brittling with the existing accept-all decision and missing diagnostic field in the write step, then test those literals with fail-first and reword control.
