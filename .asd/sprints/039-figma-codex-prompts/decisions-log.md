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

- 2026-11-22 — Workflow choice: the user selected Lite for the Figma and Codex App prompt scope.
- 2026-11-22 — Approach choice: the user selected direct native Figma authoring with host-provided choice questions.
- 2026-11-22 — Retro intake choices: user chose to include A-2, P-1 and P-2. Apply the dispositions when scope is accepted.
- 2026-11-22 — Retro intake re-verified at `493511ed3ab3fd937fccdd86e502e44234166341`: A-2 remains open since `.asd/agents/asd-tester.md` requires the report and exit but does not require capturing them before the tool truncates output; P-1 remains open since `.asd/rules/code-style.md` covers fixed defects and contract assertions but `.asd/workflows/asd-phase-impl.md` has no general fail-first evidence check at Test-only Task acceptance; P-2 remains open since `.asd/rules/code-style.md` does not require tests of review paths to use the Git-produced scope list. The tool truncation in A-2 is reproduced by the capped local tool response during scope at the sprint 038 archival commit. No open issues, open PRs, or due stubs.
- 2026-11-22 — Scope accepted: user approved AC-1 through AC-8 together. Included A-2 as AC-6, P-1 as AC-7, and P-2 as AC-8. Audit is enabled because the scope changes host behavior, configuration, and gates.
