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
