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
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-10-20 — sprint opened

- **Decision**: sprint 026 opened on branch sprint/026-structured-specs, workflow lite (user choice; standard was recommended). Sprint 025 archived by closure write (PR 61 merged, v13.8.0 published).
- **Rationale**: user chose lite over the recommended standard; documents.audit=auto resolves true (contract and behaviour impact), prd/ux_spec/adr/c4 disabled by config.
- **Affected docs**: state.json

- 2026-10-20 — retro intake verified at HEAD aafbdf13: 025#A-1 open (sprint-lifecycle.md "PR phase" step 2 says `sprint closure`, asd-phase-scope.md step 1 says `sprint-closure`); 025#A-3 open (git-strategy.md has no HEAD-moving ban for dispatched agents); 025#P-1 open (no edge-semantics rule for plan decisions)

- 2026-10-20 — scope gate partial answers (user): one sprint, no split; optimizations O1-O4 all in this sprint (O4 = split sprint-lifecycle.md per phase); retro rows 025#A-1, 025#A-3, 025#P-1 included; structures sent back for revision: declarative facts as explicit structure (JSON) where feasible

## 2026-10-20 — scope gate

- **Decision**: scope accepted as sprint.md AC-1..AC-13, one sprint. Form: specs stay Markdown with a fixed section set per category (agent, phase workflow, standalone skill), JSON structures inside sections for declarative facts; protocol in a new `.asd/rules/agent-protocol.md` loaded by every role. O1-O4 and retro rows 025#A-1, 025#A-3, 025#P-1 included.
- **Rationale**: user revised the form twice (JSON where feasible, then Markdown with JSON inside sections) and asked whether agents see the signal vocabulary; they do not at baseline (role-scoped context grants agents only their phase section of sprint-lifecycle.md), so the protocol gets its own universally loaded home. Exact keys and types are settled in plan.
- **Affected docs**: sprint.md, .asd/project/retro-backlog.md

## 2026-10-20 — audit contradictions settled

- **Decision**: C-1 phase form gains `## Rules` for agent-facing phase rules; C-2 sprint-lifecycle split by readership (cross-phase sections stay); C-3 AC-13 means meaning not carriage, agent-protocol.md and AC-7 home join the measured total; C-4 reviewers never emit ADVICE_NEEDED, creators list it, relay branches made consistent. sprint.md Form, AC-6, AC-8, AC-13 reworded to match.
- **Rationale**: user chose the recommended option on each hard contradiction gate (audit.md Contradictions).
- **Affected docs**: audit.md, sprint.md

- 2026-10-20 — audit gate (adaptive, orchestrator): all t_audit.md sections present; 2 contradictions settled by canonical precedence, 4 by user; AC-1..AC-13 deliverable per Gaps; NEXT plan (lite)

## 2026-10-20 — plan accepted

- **Decision**: `plan.md` accepted: D1-D10, Tasks 1-8 in 4 waves (wave 1 protocol/contract alone, wave 2 five parallel restructure Tasks, wave 3 lifecycle split and mirrors, wave 4 test-only). No stubs touch scope (audit has no Related open stubs).
- **Rationale**: user `accept` at the plan gate.
- **Affected docs**: plan.md

- 2026-10-20 — route Task 1: critical, dispatch HEAD f35eaeef; risk change: public contract
- 2026-10-20 — route Task 2, Task 3, Task 4, Task 5, Task 6: critical, dispatch HEAD d9462a7e; risk change: meaning-preserving restructure
- 2026-10-20 — route Task 7: critical, dispatch HEAD 15dee4f8; risk change: rule relocation
