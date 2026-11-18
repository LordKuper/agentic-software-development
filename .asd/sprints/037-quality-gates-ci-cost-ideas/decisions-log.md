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

## 2026-11-18 — sprint opened

- **Decision**: Sprint 037 opened on `sprint/037-quality-gates-ci-cost-ideas` with workflow `lite` (user answer). Scope: analyse dev-quality-gates and the OpenClaw CI cost article, adopt what applies to ASD beyond CI-literal use.
- **Rationale**: User confirmed start and chose `lite`. Sprint 036 closure write landed as the branch's first commit (04dcbe0f).
- **Affected docs**: `state.json`, `.asd/sprints/archived/036-codex-sol-6-2/`

## 2026-11-18 — approach choice

- **Decision**: Approach B without G7, plus G8 and the F-1 fix: gaps G1-G6 and G8 of `research.md` become criteria; concurrent heavy commands (G7) are out of scope (user answer "everything except G7").
- **Rationale**: The user took every evidenced gap; G7 has no observed failure in this repo.
- **Affected docs**: `research.md`

## 2026-11-18 — scope additions and split

- **Decision**: Scope gains open-PR decisions at scope (AC-12), test admission (AC-13 to AC-15), suite measurement, revision and its trigger (AC-16 to AC-18) and temporary tests (AC-19); every criterion must hold in consumer projects (user). AC-8 to AC-10 as drafted and the first revision of `tests/run.js` are split to the next sprint.
- **Rationale**: User added the three strands and the consumer constraint at the scope gate and accepted the proposed additions and split; the consumer-facing gate bootstrap and the agnix audit change independent contracts.
- **Affected docs**: `sprint.md`, `research.md`

## 2026-11-18 — scope gate

- **Decision**: Scope accepted as AC-1 to AC-20 in one sprint (user answer "accept, everything in one sprint"): the split is withdrawn, AC-8 to AC-10 return and the first revision of this repo's suite joins as AC-20. Retro intake is skipped this sprint; sprint 036's action rows take no disposition and are offered at the next intake. `documents.audit` frozen `true`: the scope changes behaviour, contracts and gates.
- **Rationale**: `retro-candidates` exits 2 on sprint 036's retrospective (`friction-log.md` F-1) and the archived file is immutable, so AC-11 must land first. Every criterion is new: 0 iterations and 0 fix rounds charged each. No disabled document is needed by the scope.
- **Affected docs**: `sprint.md`, `state.json`

- 2026-11-18 — issue triage: no open `[asd-retro]` or project issue (`gh issue list -s open` empty); no write planned, no authorisation request.
