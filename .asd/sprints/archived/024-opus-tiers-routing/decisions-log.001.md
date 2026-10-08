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
- YYYY-MM-DD — stall: <agent> <dispatch ids>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-10-07 — sprint opened

- **Decision**: Sprint 024 opened on workflow `lite` (user answer in chat). The scope combines moving four agents to opus with the critical-routing fix. The user confirmed both strands in one sprint.
- **Rationale**: once dev-critical runs on opus, every unneeded escalation costs more, so the routing fix lands together with it.
- **Affected docs**: [sprint.md](sprint.md)

- 2026-10-07 — scope evidence verified at HEAD 762101f: task_routing tallies of sprints 009–023 (critical share ≈80–90%; 023 had 18/21 critical, reason risk:workflow gate); 023 plan.md Task 7/9 declare `change: workflow gate`; `runtime.js` RESERVED_CHANGE_RISKS includes `workflow gate`/`public contract`; `providers.md` L123 says entry 1 and the first terminal run take every Task's risks
- 2026-10-07 — retro intake candidates verified open at HEAD: 023#A-2 (no lint pathspec excludes reviews/**/*.diff), 023#A-4 (no ordering rule for an amendment while review_fixes_pending is set), 023#P-1 (derived ids inherit Task change risks, providers.md L123), 023#P-2 (code-style.md L126 still bounds the proof per asserted relation), 023#P-3 (sprint-lifecycle.md L405 rebases the floor for the whole wave)
- 2026-10-07 — audit frozen true: documents.audit=auto, and the scope changes routing behaviour and contracts
- 2026-10-07 — scope gate: user accepted AC-1..AC-3; asked for a detailed breakdown of retro rows 023#A-2, A-4, P-2, P-3 before deciding, and for that breakdown to become a standing rule → AC-4 added at the user's request inside the same gate

## 2026-10-07 — scope gate

- **Decision**: The user accepted scope AC-1..AC-3 with no split. After the detailed breakdown, retro rows 023#A-2 (AC-5), A-4 (AC-6) and P-2 (AC-7) were included, and P-1 is folded into AC-3. 023#P-3 is rejected. AC-4 records the user's standing rule: the gate shows each retro row's cause, edits, consequences and a recommendation before asking.
- **Rationale**: AC-1..AC-3 share one cost theme. The three included rows are small and verified open at HEAD. P-3 would need per-file severity floors in the review gate, so the user rejected it.
- **Affected docs**: [sprint.md](sprint.md), [retro-backlog.md](../../project/retro-backlog.md)

- 2026-10-07 — audit input: retro-backlog 016#P-3 (rejected in 019) refused letting a reserved `public contract` risk be typed `artifact`. AC-2 must narrow the class definitions instead and keep the reserved-typing ban
