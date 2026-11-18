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

- 2026-11-18 — route Task 1: standard, dispatch HEAD b91b60ad
- 2026-11-18 — route Task 3: standard, dispatch HEAD b91b60ad
- 2026-11-18 — route Task 4: standard, dispatch HEAD b91b60ad
- 2026-11-18 — route Task 5: standard, dispatch HEAD b91b60ad
- 2026-11-18 — route Task 6: standard, dispatch HEAD b91b60ad

## 2026-11-18 — D13 load ceiling superseded by AC-1

- **Decision**: The D13 test (`tests/run.js` sprint-026 AC-16, ratio 0.70 of four baselines) is replaced at impl-test by AC-1's `context-check` ceiling test, its ceilings seeded after this sprint's changes; until then its failure is expected and not a fix target.
- **Rationale**: AC-1, accepted by the user, seeds this repo's ceilings from post-sprint sizes plus headroom — the bound D13 holds, recorded in one place; keeping both would double the same check.
- **Affected docs**: plan.md (impl-test note), friction-log.md F-2

- 2026-11-18 — route Task 2: standard, dispatch HEAD 9e763218
- 2026-11-18 — route Task 7: standard, dispatch HEAD 9e763218
- 2026-11-18 — route Task 8: standard, dispatch HEAD 9e763218
- 2026-11-18 — route Task 9: standard, dispatch HEAD 9e763218
- 2026-11-18 — route Task 10: standard, dispatch HEAD 9e763218

- 2026-11-18 — orchestrator fix aeb46831: Task 9 rule folded into review-policy.md "Change-surface rule" (a new heading reached no reviewer bundle)
- 2026-11-18 — Task 2 flagged choice accepted: `DELTA_EXCLUDED_GLOBS` constant in runtime.js (no view predicate existed to reuse)
- 2026-11-18 — route Task 11: standard, dispatch HEAD fdd66242
- 2026-11-18 — route Task 12: standard, dispatch HEAD fdd66242
- 2026-11-18 — Task 12 flagged choices accepted: new README test FAQ entry (no prior one), root `.agnix.toml` in the folder map, AC-20 omitted from CHANGELOG (repo-internal)

## 2026-11-18 — impl assessment approved

- **Decision**: Impl complete: Tasks 1-12 done in three waves; build, lint, `checks.context` and `checks.agnix` (0 errors, 0 warnings) pass at the gate; context ceilings seeded (111 keys, headroom 10%).
- **Rationale**: Adaptive evidence: every checkbox ticked, flagged choices resolved, no stubs introduced. Fourteen tests fail on pins this sprint changed by design (sandbox_mode, D13, retro and scope wording); impl-test updates them.
- **Affected docs**: plan.md, .asd/project/context-ceilings.json, .asd/project/commands.yaml
- 2026-11-18 — route impl-test entry 1: standard, dispatch HEAD 13292f6a
- 2026-11-18 — orchestrator: `custom-coding-rules.md` D13 self-check line repointed to `context-check` (the D13 test was removed at impl-test entry 1)

## 2026-11-18 — skill size cap waiver

- **Decision**: User accepted raising the sprint-026 AC-15 standalone-skills byte cap from 61 051 to 62 351 B in `tests/run.js`.
- **Rationale**: `asd-init` grew 1 300 B carrying AC-3, AC-8 and AC-16, all accepted scope; the AC-4 rule makes a raised cap a quality waiver.
- **Affected docs**: tests/run.js, test-plan.md
- 2026-11-18 — route suite revision 1: standard, dispatch HEAD 239450d9
- 2026-11-18 — route suite revision 2: standard, dispatch HEAD 983ec5e0
- 2026-11-18 — route suite revision 3: standard, dispatch HEAD 983ec5e0
- 2026-11-18 — impl-test: defects D-1 → impl test-fix (digest 5f15122e)
- 2026-11-18 — route D-1: standard, dispatch HEAD 5a103f76; risk artifact: mirror wording of the per-area suite
- 2026-11-18 — impl test-fix: defects D-1 resolved
- 2026-11-18 — route impl-test#2: standard, dispatch HEAD 911db381
- 2026-11-18 — impl-test: defects D-2 → impl test-fix (digest e597bf66)
- 2026-11-18 — impl test-fix: defects D-2 resolved (orchestrator sync --apply recomputed upstream_hashes; F-3)
- 2026-11-18 — route impl-test#3: standard, dispatch HEAD b12d7ce1
- 2026-11-18 — impl-test: impacted set green (205/205, 9 areas), 0/0 tests
- 2026-11-18 — impl-review wave-1/iter-01: combined CONCERNS (F1-F12), external CONCERNS (1-11) → impl review-fix (review_fixes_pending wave-1/iter-01). Dedup: external 1 = combined F2, external 2 = combined F5, external 4 = combined F3, external 6 = combined F9. Routes: dev chain — combined F1 (drop `--headroom`, simplify; departs plan Overview, no caller), F2, F3, F5, F7, F8, F9, F10, F11, F12, external 3, 5, 7, 8, 9, 10; tester chain — combined F4, F6, external 11 (tests/run.js).
- 2026-11-18 — route wave-1/iter-01 R1, R2, R3: standard, dispatch HEAD c0248783; risk workflow gate (change), public contract (change)
- 2026-11-18 — route wave-1/iter-01 tester (combined F4, F6, external 11): standard, dispatch HEAD 0e38c05d
- 2026-11-18 — impl fix for wave-1/iter-01: findings resolved (flagged accepted: external 5 keeps only Line delta/Allowance; sprint PR merge stays on gh default repo; close validates the rotated segment)
- 2026-11-18 — route impl-test#4: standard, dispatch HEAD f86c9bf2
- 2026-11-18 — impl-test: impacted set green (282/282, 12 areas), 0/0 tests (5 extended)
- 2026-11-18 — impl-review wave-1/iter-02: combined CONCERNS (F1-F4), external CONCERNS (1-7) → impl review-fix (review_fixes_pending wave-1/iter-02). Dedup: external 4 = combined F1, external 6 = combined F2, external 7 = combined F3. Routes: dev chain — combined F1 (seed keeps existing ceilings, adds missing; scope step 2a seeds at checklist creation), F2, F3, external 1 (HOST/OWNER/REPO), 2 (`--match-head-commit`), 3 (oldest-first listing under the 200 cap, no pagination), 5; combined F4 → next impl-test entry runs the full suite (`tests/run.js` changed: shared-infrastructure safety valve).
- 2026-11-18 — route wave-1/iter-02 R1, R2, R3: standard, dispatch HEAD 989e2a64; risk workflow gate (change)
- 2026-11-18 — impl fix for wave-1/iter-02: findings resolved (flagged accepted: `<project>` from `gh repo view --json url`; additive seed fails on a malformed ceilings file; ASD-repo `-R` stays host-less, github.com)
- 2026-11-18 — route impl-test#5: standard, dispatch HEAD cc6d78d5
- 2026-11-18 — impl-test: full suite green (311/311), 0/0 tests (3 extended)
- 2026-11-18 — impl-review wave-1/iter-03 memory-fix: combined F2 + external 9 → asd-external-review (71b411ea); combined F3 (pre-existing, memory: fixed in phase per "Memory-fix dispatch", no issue) → asd-reviewer-efficiency (ba739293).
- 2026-11-18 — impl-review wave-1/iter-03: combined CONCERNS (F1; F2-F3 memory-fixed), external CONCERNS (1-9; 10 below floor; 9 memory-fixed) → impl review-fix (review_fixes_pending wave-1/iter-03). Dedup: external 8 = combined F1. Routes, dev chain: combined F1 (uncovered suite-revision removals stay proposed rows, area pending, step 6 before the next revision dispatch), external 1 (close only AC-line `(PR #N)` includes), 2 + 4 (exhaustive `gh api --paginate` number list, then one `gh pr view` per PR carrying summary and `headRefOid` together), 3 (`gh auth status --hostname <host>`), 5 (seed after all accepted checklist rows), 6 (refuse pipe-less rows), 7 (start-anchored placeholder refusal).
- 2026-11-18 — route wave-1/iter-03 R1, R2: standard, dispatch HEAD 7f9cf292; risk workflow gate (change)
- 2026-11-18 — impl fix for wave-1/iter-03: findings resolved
- 2026-11-18 — route impl-test#6: standard, dispatch HEAD 03d77433
- 2026-11-18 — impl-test: full suite green (311/311), 0/0 tests (1 extended)
- 2026-11-18 — impl-review wave-1/iter-04: combined APPROVE (latched), external CONCERNS (1-3; 4 below floor) → impl review-fix (review_fixes_pending wave-1/iter-04). Routes, dev chain: external 1 (validate the contiguous Added tests table only), 2 (rejected proposals stay as struck ledger rows, never re-proposed), 3 (a failed pagination or per-PR read blocks the PR dispositions).
- 2026-11-18 — route wave-1/iter-04 R1: standard, dispatch HEAD 4afd11c1; risk workflow gate (change)
- 2026-11-18 — impl fix for wave-1/iter-04: findings resolved (flagged accepted: table run ends at first blank line; struck rows hold within one entry)
- 2026-11-18 — route impl-test#7: standard, dispatch HEAD f51c903f
- 2026-11-18 — impl-test: full suite green (311/311), 0/0 tests (1 extended)
- 2026-11-18 — latch-refresh wave-1/iter-05: cleared combined (files .asd/runtime.js)
- 2026-11-18 — impl-review wave-1/iter-05: combined APPROVE (latched), external CONCERNS (1-2, critical) → impl review-fix (review_fixes_pending wave-1/iter-05). Routes, dev chain: external 1 (validate every Added tests table block: each contiguous pipe run needs header + well-formed separator, Gap proof checked per block), 2 (struck Removed tests rows stay live across rotation).
- 2026-11-18 — route wave-1/iter-05 R1: standard, dispatch HEAD ef35db06; risk workflow gate (change)
- 2026-11-18 — impl fix for wave-1/iter-05: findings resolved (flagged accepted: Added tests tables split by blank line, a pipe-less line inside a table still refused; header-only table refused)
- 2026-11-18 — route impl-test#8: standard, dispatch HEAD 81f658a7
- 2026-11-18 — impl-test: full suite green (311/311), 0/0 tests (1 extended)
- 2026-11-18 — impl-review wave-1/iter-06: combined APPROVE (latched), external CONCERNS (1-2, critical) → impl review-fix (review_fixes_pending wave-1/iter-06). Routes, dev chain: external 1 (re-entry rotates first, then writes the carried-forward review-fix removal rows live), 2 (segment repair covers any impl-test-close Added tests refusal, structural included).
- 2026-11-18 — route wave-1/iter-06 R1: standard, dispatch HEAD 4d720740; risk workflow gate (change)
- 2026-11-18 — impl fix for wave-1/iter-06: findings resolved
