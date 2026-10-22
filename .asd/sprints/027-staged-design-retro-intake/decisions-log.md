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

## 2026-10-22 — sprint opened

- **Decision**: Sprint 027 opened on workflow `lite` (user answer in chat); 026-structured-specs closed by this branch's first commit (PR #62 merged at d352100f, release v13.9.0 published, no retry).
- **Rationale**: Rule-doc edits only; the design block would collapse under `standard` anyway (prd/ux_spec/adr disabled).
- **Affected docs**: sprint.md, state.json

- 2026-10-22 — retro intake verified at HEAD 8d5f2137: 026#A-1 open (providers.md names none of route-task's input keys); 026#A-2 open (no empty-findings-table rule in review-policy.md); 026#P-1 open (no per-dispatch load rule); 026#P-2 open (artifact-layout.md "Leftover-term check" defines no in-entry memory fix); 026#P-3 open (code-style.md bounds mutation count, not the runner scope); 026#P-4 open (in-place fix limited to low-severity test-only findings)
- 2026-10-22 — staged design (AC-3) verified absent at HEAD 8d5f2137: no interview or research step in asd-phase-scope/audit/design/plan.md

## 2026-10-22 — scope gate

- **Decision**: sprint.md AC-1..AC-10 accepted as one sprint (no split). Staged design lives in scope for both workflows, is always mandatory and stays at concept/functional level; the orchestrator conducts both interviews, `asd-ba` performs the web search. Retro 026#P-2 included generalised: any agent-memory edit stays in the current phase.
- **Rationale**: Both strands edit the scope phase; the user directed placement, mandatoriness, roles and the P-2 generalisation.
- **Affected docs**: sprint.md

## 2026-10-22 — retro intake

- **Decision**: 026#A-1, A-2, P-3 included (AC-7..AC-9); 026#P-2 included generalised (AC-10); 026#P-1 and 026#P-4 rejected.
- **Rationale**: User decision per row after cause, edits and consequences were shown.
- **Affected docs**: .asd/project/retro-backlog.md

- 2026-10-22 — audit frozen true: documents.audit=auto and scope changes behaviour and gates

## 2026-10-22 — audit contradiction C1 settled

- **Decision**: A retro row verified resolved at HEAD is written `closed` without a question and shown at the scope gate with its evidence; the explicit three-way choice covers open rows only. AC-2 amended to "included, rejected or closed".
- **Rationale**: User chose the recommended option; avoids one question per stale row each scope.
- **Affected docs**: sprint.md, audit.md

- 2026-10-22 — audit contradictions C2-C5 settled canonically/by accepted scope (audit.md "Contradictions")
- 2026-10-22 — audit gate (adaptive): all sections present, C1 settled by user, C2-C5 resolved, AC-1..AC-10 deliverable; risks R1 (workflow byte cap, 106 B headroom) and R6/R7 carried to plan
- 2026-10-22 — plan: no related open stubs (audit.md; stubs.md has none)

## 2026-10-22 — `<sprint>/plan.md` accepted

- **Decision**: plan.md D1-D10, Tasks 1-6 in 3 waves accepted by the user (explicit `accept`). D6 removes the phase-workflow byte cap (sprint-026 AC-15 assert) by user decision; the skills cap and D13 ceilings stay. D5 adds a user-decided skip of stage (b) when web research is unavailable.
- **Rationale**: User answers to R1 ("remove the cap entirely") and R6 ("also allow a skip by user decision").
- **Affected docs**: plan.md
- 2026-10-22 — route Task 1: critical, dispatch HEAD b9c6c03a
- 2026-10-22 — route Task 2: critical, dispatch HEAD b9c6c03a
- 2026-10-22 — route Task 5: standard, dispatch HEAD b9c6c03a
- 2026-10-22 — route Task 3: critical, dispatch HEAD 8222783b
- 2026-10-22 — route Task 4: critical, dispatch HEAD 8222783b
- 2026-10-22 — impl Task 4 flagged choice resolved: AC-10 covers impl, so a memory-check hit on step 7's MEMORY.md commit goes to the owner's memory-fix inside impl (d6bc4204)
- 2026-10-22 — impl Task 3 flagged choices accepted: state/log seeded before stages; research.md Requirements written before BA dispatch; approach choice is its own hard gate `approach choice` at step 2 (departs from D2 fold under scope gate; rule homes aligned 87bf8b9b); inputs.research in audit/design payloads; BA scope behaviour self-contained in asd-ba.md (R12); asd-ba description reworded (294 chars)
- 2026-10-22 — route Task 6: standard, dispatch HEAD 7b9edc1a
- 2026-10-22 — memory-fix (orchestrator plan line): asd-reviewer-correctness 4be59c27, asd-reviewer-combined d0ca0c69, asd-tester-critical 57284955
- 2026-10-22 — impl assessment (adaptive): Tasks 1-6 ticked, memory-fix line done, flagged choices resolved (decisions-log), build (sync --check) and lint clean, round diff within authorised paths, no sprint stubs; suite 291/296 with 5 content-contract pins on replaced wording for impl-test; HEAD 23d34bb4
- 2026-10-22 — route impl-test entry 1: standard, dispatch HEAD 83783226; risk artifact: content-contract pins via node tests/run.js
- 2026-10-22 — impl-test step 7a: memory hits fixed in entry 1 by owner memory-fix (asd-reviewer-correctness 4fd7a2d7, asd-reviewer-documentation 9b27aa70); suite gate re-run green 302/302
- 2026-10-22 — impl-test: impacted set green (302/302), 6/0 tests
- 2026-10-22 — impl-review divided into 2 waves (lines 534, files 34, bytes 211476): wave 1 staged design + retro intake (scope/BA/research, README); wave 2 memory-fix in phase, route-task keys, empty findings table, runner filter
- 2026-10-22 — impl-review wave-1/iter-01: combined CONCERNS (CB-1 high, CB-2..CB-4 medium, CB-5 low), external CONCERNS (F1, F2 medium) → impl review-fix (wave-1/iter-01)
