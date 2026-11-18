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

## 2026-11-18 — agnix download and run permitted

- **Decision**: The user permitted downloading and running npm `agnix@0.61.0` read-only (no `--fix`). Nothing is added to the repository by the run.
- **Rationale**: AC-10's one-off run needs an external binary; downloading it is the user's call.
- **Affected docs**: audit.md

## 2026-11-18 — scope amendment AC-21

- **Decision**: User request: agnix runs in every sprint of this repo (self-hosting) and its errors and warnings are fixed. AC-21 added; AC-10 retired by it; the out-of-scope line on a permanent agnix check removed. Task and wave assigned at plan.
- **Rationale**: The first run found 26 warnings that content-contract tests never caught, one of them a false host claim in `providers.md`.
- **Affected docs**: sprint.md, state.json

## 2026-11-18 — agnix findings

- **Decision**: User answers at the audit-contradiction gate: CDX-SUB-002 — remove `codex.sandbox_mode` from canon and rendering, state Codex read-only for advisor, scout and External Review as policy-bound; CC-SK-007 — exclude the rule in `.agnix.toml` with its reason (quality waiver).
- **Rationale**: Codex documentation confirms a subagent inherits the parent sandbox; phase skills run project-defined commands canon cannot enumerate.
- **Affected docs**: audit.md, sprint.md AC-21
