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

## 2026-09-25 — Audit contradiction: AC-8 vs code-style §19 staged lint

- **Decision**: Option (a). A dispatched agent commits in one compound command, `git add -- <paths> && git diff --cached --check -- <paths> && git commit --only -- <paths>`, and runs `git reset -q -- <paths>` on failure. `code-style.md` §19, `commands.yaml` `lint` and `tests/run.js:3858-3866` stay unchanged.
- **Rationale**: Staging exists only inside that one command, so AC-8's no-staged-between-commands guarantee holds, §19's staged lint still inspects real content, and never-tracked paths commit. The change stays inside AC-8's named home.
- **Affected docs**: [audit.md](audit.md) Contradictions #1

## 2026-09-25 — Audit accepted (adaptive)

- **Decision**: `audit.md` accepted by the orchestrator under `user_gates: adaptive`.
- **Rationale**: The one unsettled contradiction was answered by the user. The remaining contradictions are settled by precedence or by accepted ACs. The gaps are plan-level choices inside accepted AC-1..AC-17. No new scope, criteria or authority is implied.
- **Affected docs**: [audit.md](audit.md)
- 2026-09-25 — design/design-review/design-promote skipped (no documents enabled)
