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

## 2026-11-11 — sprint opened

- **Decision**: Sprint 033-retro-intake-model-choice opened on branch `sprint/033-retro-intake-model-choice` from main at 5f3dd335; workflow `lite`.
- **Rationale**: Workflow choice answered by the user: "lite (Рекомендуется)"; sprint 032 closed by the closure write (ba95f4d1), its release v14.4.0 complete.
- **Affected docs**: `state.json`

## 2026-11-12 — approach choice

- **Decision**: Approach B (full) for the model-choice strand: haiku tester run variant, haiku External Review wrapper, Opus tier above `standard` for risky tasks, effort step in the escalation ladder, README orchestrator-model guidance and haiku-alias note, plus a haiku read-only scout agent for orchestrator scans; reviewers keep `high`; Codex untouched.
- **Rationale**: User answer "B полностью" over the recommended B′ (no scout); requirements: token savings without noticeable quality loss, every article recommendation applied or rejected with a reason (research.md F1-F12).
- **Affected docs**: `research.md`

## 2026-11-12 — retro intake verification at HEAD e653a622

- **Decision**: Rows: 032#A-1 open (`asd-phase-impl-review.md` step 7 `--iteration <NN>`); 032#A-2 open (impl step 9 round-diff list, no route for a fix outside the dev allowlist); 032#P-1 open; 031#P-2 partial (grep-based restating sites only) — P-1 and P-2 share one root. Issues: #89 resolved (`artifact-layout.md` "Test plan" removal row, `asd-phase-impl-test.md` step 1 re-entry carry); open — #88 #91 #93 #95 #96 #97 #100 #102 #103 #104 #105 #108 #109 #111 #112 #113 #75 #76 #86 #90; partial — #92 (no migration removes a retired agent's memory dir), #94 (table shape checked, floor not), #98 (only `duplicate of` names a survivor), #101 (handoff unnamed, no idle gaps), #106 (exclusion mechanism exists, delta prose missing), #107 (FAIL still tied to "block DoD" and rubric "= FAIL" lines). #99 not a duplicate of closed #84 (032 widened who runs memory-check; #99 asks enforcement; its "only prints" claim is wrong — exit 1 on hit). All issues match the step 7 shape; no clear duplicate.
- **Rationale**: Each claim checked against canon files at HEAD by read-only scans and spot-checked by the orchestrator (impl-review step 7 flag, asd-sprint rotate subject, impl-review step 8 order, `t_commands.yaml` install line, `artifact-layout.md` test-removal row).
- **Affected docs**: `sprint.md`

## 2026-11-12 — scope gate and retro intake dispositions

- **Decision**: Scope accepted as one sprint (AC-1..AC-34). Rows 032#A-1 A-2 P-1 and 031#P-2 included (AC-9..AC-11); every open `asd-retro` issue included (AC-12..AC-34); #89 closed as resolved; #104 modified: Claude Code mockups are Claude Design artifacts (sources in per-artifact subfolders plus a link index), other hosts one HTML file per screen, in `<sprint>/design/mockups/` promoted to `docs/ux/mockups/`.
- **Rationale**: User answers "Берем все открытые issues, но с поправкой по поводу макетов интерфейса…", "Исходники + ссылка", "Спринт → docs, файл на экран"; criterion cost 0 iterations / 0 fix rounds for every criterion (all new). AC-34's host claim (Claude Design as an Artifact type reachable from Claude Code) rests on the live Artifact tool definition in this session (`intent: design`); audit re-checks it against host docs.
- **Affected docs**: `sprint.md`, `.asd/project/retro-backlog.md`

- 2026-11-12 — issue triage: rewrote none; closed duplicate none; closed resolved #89 (artifact-layout.md "Test plan", asd-phase-impl-test.md step 1); to user #75 #76 #86 #88 #90 #91 #92 #93 #94 #95 #96 #97 #98 #99 #100 #101 #102 #103 #104 #105 #106 #107 #108 #109 #111 #112 #113; non-standard none
- 2026-11-12 — issue dispositions: #91 include AC-12; #97 AC-13; #102 AC-14; #88 AC-15; #98 AC-16; #95 #96 AC-17; #100 #108 #111 AC-18; #92 AC-19; #90 AC-20; #99 AC-21; #93 AC-22; #76 #86 AC-23; #75 AC-24; #94 AC-25; #101 AC-26; #109 AC-27; #107 AC-28; #103 AC-29; #105 AC-30; #106 AC-31; #113 AC-32; #112 AC-33; #104 AC-34 (modified); reject none; defer none
