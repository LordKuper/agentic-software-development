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

## 2026-09-24 — D-1/D-2: testing reviewer memory text applied (user decision)

- **Decision**: The user approved the same exception as COR-4 for `asd-reviewer-testing`: the orchestrator applied the owner's returned text verbatim (ace77e4). The owner's whole-file `MEMORY.md` replacement had dropped the existing `feedback_value-removal-sprints.md` index line, and the memory-index bijection test caught it. That line was restored verbatim from HEAD.
- **Rationale**: The owner authored the text, and the restore only undoes an accidental deletion.
- **Affected docs**: .claude/agent-memory/asd-reviewer-testing/

- 2026-09-24 — impl test-fix: defects D-1, D-2 resolved
