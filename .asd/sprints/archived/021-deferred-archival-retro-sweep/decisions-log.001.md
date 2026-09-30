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
- YYYY-MM-DD — route <taskIds>: <tier>, dispatch HEAD <sha>
- YYYY-MM-DD — reconstruction: landed <ids>; re-dispatched <ids>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-09-29 — Sprint 021 opened: deferred archival, stalled-agent checks, full retro sweep

- **Decision**: The scope has three strands. (1) Archival moves to the start of the next sprint, with no companion finalize PR (one PR and one CI run per sprint). (2) The orchestrator checks the liveness of in-flight agents at least every 5 minutes (added by the user during scope). (3) Every open retro row in this repo and in `D:\Projects\Glings` is triaged. Workflow: `lite`, a user decision.
- **Rationale**: User request at scope. Both repos run CI (`.github/workflows/`), so the companion PR costs a second CI run.
- **Affected docs**: [sprint.md](sprint.md)

## 2026-09-29 — Retro sweep verified at framework HEAD 5354056, Glings HEAD 76719ce

- **Decision**: 19 retros, 157 rows that are not `covered by:` (14 retros here: 007–020; 5 in Glings: 002–006; 010 P-rows have no Acts on column and are read as `asd`). The runtime intake (latest retro plus deferred rows) offered 11 rows: 020#A-1 partial (dev syncs per task; the once-per-wave orchestrator sync and the denied-command FAILED are missing), 020#A-3 open, 020#A-4 partial (`persist-review --in` exists, but the orchestrator still re-types returns), 020#A-5 open, 020#P-1/P-2 open, 017#P-1 open, 019#A-1/P-1/P-2/P-3 open. Legacy rows, outcome by row:
  - resolved (the verifier cites the home file and section): 007#A-1…A-8, P-1…P-4; 008#A-1…A-9, P-1…P-6; 009#A-1…A-9; 010#A-1, A-2, A-4…A-7, P-2…P-6; 011#A-1, P-1…P-3; 012#A-1, A-2, A-4; 013#A-2, A-4; 014#A-3, P-1, P-3; glings:002#A-4, A-7, A-11, A-12, P-7, P-8; glings:003#A-1…A-7, P-2; glings:004#A-3, P-2; glings:005#P-4; glings:006#A-6, P-2.
  - obsolete (the mechanism was removed): 008#A-10 (cross-sprint availability history, replaced by per-skip F-N); 010#A-3, 012#A-3, 015#P-2, glings:003#P-3, glings:005#A-5 (split dispatch, replaced by review waves); glings:002#A-3, A-5 (wave ladder, partial External outcome).
  - disposed in the Glings backlog: glings:006#A-1, A-5, A-8, A-9.
  - partial: 007#P-5, 009#P-3, 009#P-5, 012#P-2, 012#P-4, 013#A-1, 013#A-3, 013#P-1, 014#A-2, 014#P-2, 015#P-1, 015#P-3, glings:004#A-1, A-4, A-9, P-1, glings:005#A-1, A-3, glings:006#A-2, A-3, A-4, A-7, P-1, P-3.
  - open: 009#P-1, P-2, P-4, P-6; 010#P-1; 012#P-1, P-3; 013#P-2; glings:003#P-1; glings:004#A-2, A-5, A-6, A-8 (verified bug: `isTest('…/Core.Tests/Helpers.cs')` is false); glings:005#A-4, P-1, P-2.
  - Glings consumer rows not resolved (open or partial): 002#A-8, A-9, A-10, P-1, P-2, P-3, P-4; 004#A-7, P-3, P-4; 005#A-2, P-3.
  - Each partial row's remaining half is the AC text it maps to in sprint.md.
- **Rationale**: `sprint-lifecycle.md` "Retro intake" re-verification rule, applied to every retro because the user asked for a full sweep. The evidence came from five read-only verifier dispatches that grepped each row's home at HEAD.
- **Affected docs**: [sprint.md](sprint.md), [.asd/project/retro-backlog.md](../../project/retro-backlog.md)

- 2026-09-29 — audit frozen true: `documents.audit: auto`; the scope changes lifecycle behaviour, gates, the runtime and the state contract (not mechanical)
- 2026-09-29 — documents frozen: prd/ux_spec/adr disabled by config; c4 false (`diagram_tool: none`, decomposition disabled)

## 2026-09-29 — Scope gate accepted; retro dispositions

- **Decision**: The user explicitly accepted sprint.md (AC-1…AC-13) and the recommended dispositions. Included, 30 rows:
  - intake rows 020#A-1, A-3, A-4, A-5, P-1 and 019#A-1, P-1, P-2, P-3;
  - legacy rows 009#P-1, P-2, P-4, P-6; 012#P-1, P-2, P-4; 013#A-1, A-3, P-1, P-2; 014#A-2; 015#P-1, P-3;
  - Glings asd rows glings:004#A-2, A-4, A-5, A-8, A-9, P-1; glings:005#A-1, A-3, A-4, P-1, P-2; glings:006#A-2, A-7.

  Rejected: 020#P-2, 017#P-1, 007#P-5, 009#P-3, 009#P-5, 010#P-1, 012#P-3, 014#P-2, glings:003#P-1, glings:004#A-1, A-6, glings:006#A-3, A-4, P-1, P-3. All 12 unresolved Glings consumer rows are also rejected, at the user's choice: glings:002#A-8, A-9, A-10, P-1, P-2, P-3, P-4; glings:004#A-7, P-3, P-4; glings:005#A-2, P-3. Criterion cost for every included row: 0 iterations charged, 0 fix rounds charged (new sprint).
- **Rationale**: Hard scope gate plus hard retro-intake gate (`checkpoints.md` "Gate policy"), decided by the user. Reasons for rejection: rare or one-off cases (020#P-2, 017#P-1, 012#P-3, glings:004#A-6), already covered well enough (007#P-5, 009#P-3, glings:004#A-1, glings:006#A-3, P-1, P-3), a prior deliberate decision (glings:003#P-1 dropped by sprint 015; glings:006#A-4 conflicts with the no-paid-probe rule; 014#P-2 superseded by once-per-cycle rotation), deliberately parallel initial waves (009#P-5), or a separate sprint needed (010#P-1). The backlog records only the 11 rows the intake offered, since the intake never re-offers legacy or Glings rows. Glings files are untouched.
- **Affected docs**: [sprint.md](sprint.md), [.asd/project/retro-backlog.md](../../project/retro-backlog.md)
