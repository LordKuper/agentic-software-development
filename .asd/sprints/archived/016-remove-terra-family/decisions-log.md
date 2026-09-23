---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), state.json (state), reviews/ (verdicts)
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

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, or `.asd/project/stubs.md`. Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-09-23 — `<sprint>/retrospective.html` written

- **Decision**: Retro complete, empty-log branch (no friction-log.md): 0 entries analysed, 4 systemic proposals (3 new, 1 covered by `code-style.md` §17). Nothing applied or promoted.
- **Rationale**: Systemic class derived from the run record (iter-01 low-finding cycle, decisions-log rotation churn, critical routing of a value swap).
- **Affected docs**: retrospective.html

## 2026-09-23 — PR #47 published; autonomous completion authorized

- **Decision**: User instructed in chat: publish, then carry the sprint autonomously through completion and release publication. Branch pushed; PR #47 opened (`feat(providers)!: replace codex terra with sol`). The same instruction is recorded as explicit closure approval for the post-merge hard gate.
- **Rationale**: PR publication and sprint closure need explicit user authority; the user's message grants both.
- **Affected docs**: state.json, https://github.com/LordKuper/agentic-software-development/pull/47

## 2026-09-23 — Sprint 016 closed and archived

- **Decision**: PR #47 squash-merged at `234ac47`; closure approved by the user's explicit instruction to finish the sprint autonomously through release. Terminal state written and sprint archived via companion PR; tag `v12.0.0` and GitHub release follow its merge.
- **Rationale**: Hard closure gate satisfied by explicit user authority, not by the merge.
- **Affected docs**: state.json
