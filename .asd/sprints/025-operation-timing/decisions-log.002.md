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

## 2026-10-08 — scope amendment AC-8: ASD version check at new-sprint start

- **Decision**: The user added AC-8 during audit: a new sprint start in a consumer project checks the configured ASD repo for a newer `asd_version` and offers `/asd-update` or continue; skipped under self-hosting and on resume; never updates unasked. No plan exists yet, so the Task and its wave are assigned by the plan phase; no review has run, so no `floor_base`.
- **Rationale**: User request mid-audit; the user chose to keep it in 025 rather than split it to 026. Audit stays `true` and is extended to cover AC-8.
- **Affected docs**: [sprint.md](sprint.md)

## 2026-10-08 — audit accepted (adaptive)

- **Decision**: `audit.md` accepted by the orchestrator: every section is present, all seven contradictions are settled by canonical precedence (none needs the user), and AC-1..AC-8 are deliverable as stated. Capture mechanism: orchestrator-run `runtime.js` `timing-*` commands writing `<sprint>/timing.jsonl`, not host hooks. Preference items (slow-flag constants, user-wait flagging, Codex post-update halt, hard-list entry) go to the plan gate as open plan inputs.
- **Rationale**: `checkpoints.md` routine audit acceptance in adaptive mode, with valid evidence; host-hook capability verified against the Claude Code and Codex docs cited in `audit.md`.
- **Affected docs**: [audit.md](audit.md)
