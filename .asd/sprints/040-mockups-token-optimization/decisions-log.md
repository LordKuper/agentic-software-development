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
