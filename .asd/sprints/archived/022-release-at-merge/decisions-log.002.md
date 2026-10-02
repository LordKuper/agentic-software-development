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

## 2026-09-30 — Audit accepted (adaptive), one contradiction decided by user

- **Decision**: `audit.md` written. Five contradictions were settled by precedence; the later user-accepted AC wins in each case:
  - the orchestrator ticks `plan.md` for every wave;
  - the 021 leftover-sweep entries for `done` are deleted;
  - an amendment after division clears the wave's latches;
  - the floor/cap is computed on the amendment base;
  - the `gh` fix list is given per cause.

  The user decided the sixth: `.asd/project/config.yaml`'s stale closure comment is fixed through `/asd-init` inside the sprint. Design inputs for plan: the terminal token `done`; release in merge mode after `git fetch` of base, idempotent per step, with a retry route from `asd-sprint` Step 1 for a missing tag; AC-7 `floor_base=wave-<K>/<A>` in the amendment's gate evidence.
- **Rationale**: Audit gate, adaptive: every section is present, every contradiction is settled, and there is no BA ambiguity.
- **Affected docs**: [audit.md](audit.md)
