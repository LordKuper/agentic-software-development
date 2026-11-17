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

- **Decision**: Sprint 036 opened on `sprint/036-codex-sol-6-2` with workflow `lite` (user answer). Scope: Codex `sol` family `gpt-6.1-sol` → `gpt-6.2-sol`.
- **Rationale**: Mechanical model-ID bump with no project documents enabled; `lite` covers it. Sprint 035 closure write landed as the branch's first commit (b673ea5d).
- **Affected docs**: `state.json`, `.asd/sprints/archived/035-verification-hardening/`
## 2026-11-18 — approach choice

- **Decision**: Approach A: bump `model_families.codex.sol` to `gpt-6.2-sol`, mirror and regenerate, document "Codex CLI 0.167.0 or later" in CHANGELOG and README; no runtime version check, no migration (user answer).
- **Rationale**: The family map exists for one-line model bumps; live probe showed 0.159.2 refused and 0.167.0-alpha/0.169.1 accepted, so the verified floor is stated rather than the unofficial 0.166.0.
- **Affected docs**: `research.md`
- 2026-11-18 — issue triage authorised: add label asd-retro to #123 #124 #125 #126 #127
- 2026-11-18 — issue triage: rewrote none; closed none; to user #123 #124 #125 #126 #127; non-standard none; project to user none
- 2026-11-18 — retro intake verified at HEAD b673ea5d: 035-verification-hardening#A-1 open (asd-phase-pr.md names no availability-skip coverage); #A-2 open (runtime.js timing reopens a closed id, repeated --attrs keeps the last); #A-3 open (asd-dev.md cites only the per-tech refuse-to-implement rule, artifact-layout.md:188); #P-1 open (sprint-lifecycle.md Fix-round clear keeps the comment-only exception, runtime.js COMMENT_LEXERS); issues #123-#127 open at HEAD (no matching check in asd-phase-scope.md, asd-phase-plan.md, runtime.js commit-check/agent-liveness)
## 2026-11-18 — scope gate and retro intake dispositions

- **Decision**: Scope accepted with AC-1..AC-14 (user). Retro 035#A-1, #A-2, #A-3, #P-1 included as AC-6..AC-9; issues #123..#127 included as AC-10..AC-14. AC-8 redrafted: the dev returns `FAILED — tech-reference missing` per new command instead of writing the entry, since `docs/**` is outside the self-hosting dev allowlist and `artifact-layout.md` makes the orchestrator the tech-reference writer.
- **Rationale**: User chose "include all" for both groups, then accepted the drafted criteria; each included criterion's cost is 0 iterations / 0 fix rounds (new). Audit stays on (`auto`): the client-minimum bump is a compatibility change and the intake adds runtime behaviour.
- **Affected docs**: `sprint.md`, `.asd/project/retro-backlog.md`
- 2026-11-18 — issue dispositions: #123 include AC-10; #124 include AC-11; #125 include AC-12; #126 include AC-13; #127 include AC-14
