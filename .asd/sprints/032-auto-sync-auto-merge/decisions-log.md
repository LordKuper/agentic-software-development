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

## 2026-11-05 — sprint opened

- **Decision**: Sprint 032-auto-sync-auto-merge opened on branch `sprint/032-auto-sync-auto-merge` from main at 5dbd020c; workflow `lite`.
- **Rationale**: Workflow choice answered by the user: "Старт, lite (рекомендую)"; sprint 031 closed by the closure write (7fdbb288), its release v14.3.0 complete.
- **Affected docs**: `state.json`

## 2026-11-05 — approach choice

- **Decision**: M1: pr open mode hands over to merge mode in the same run, which waits for checks (60 s registration grace, 30 min total), then merges; a blocked merge or an exceeded wait exits `await-merge`. S1: one `asd-sync` behaviour, `missing`/`stale` applied with no question, `modified-foreign` asked per file, standalone included; `asd-update` delegates to it. No config key.
- **Rationale**: User answers: "M1: ждёт оркестратор (рекомендую)", "S1: везде (рекомендую)", "Всегда, без настройки (рекомендую)". `gh pr merge --auto` needs a repository setting that is off here and the release waits for the merge anyway; `sync.js` already separates unedited from hand-edited targets.
- **Affected docs**: `research.md`

## 2026-11-05 — retro candidates verified at HEAD

- **Decision**: All open candidates stand at 7fdbb288: 031#A-2 (no phase step deletes scratch files, 477 in `.asd/tmp/`), 031#A-3 and #83 (`asd-external-review.md` cites the id and source with no column pin, floor not tied to the payload), 031#P-1, 031#P-2, #75, #76, #80 (audit step 5 sets `phase="audit"` only when step 1 skipped), #81 (audit "Contradictions" has no planned-change case, step 3b no Scope amendment route), #82 (`t_prd.html` line 30), #84 (`git-strategy.md` "A dev's or tester's own memory commit is not gated"), #85 (`review-policy.md` floor names no place for below-floor findings), #86.
- **Rationale**: Step 2 requires each retrospective-derived criterion verified against current `HEAD` before it is written; every check above is a grep or read of the named rule, no host behaviour involved.
- **Affected docs**: `sprint.md`

- 2026-11-05 — issue triage: rewrote none; closed none; to user #75 #76 #80 #81 #82 #83 #84 #85 #86; non-standard none

## 2026-11-05 — scope gate

- **Decision**: Scope accepted as `sprint.md` AC-1..AC-13, one sprint, no split; audit frozen `true` (`auto`: merge, sync and gate behaviour changes are not mechanical). Sprint 032's own PR merges under the new rule, with no further approval.
- **Rationale**: User answer: "accept", to a gate stating that consequence and recommending one sprint; criterion cost per new AC-1..AC-13: 0 iterations charged (lower bound), 0 fix rounds charged.
- **Affected docs**: `sprint.md`, `state.json`

## 2026-11-05 — retro intake dispositions

- **Decision**: 031#A-2 include AC-6; 031#A-3 include AC-7; 031#P-1 include AC-8, its home moved from `language-policy.md` to `.asd/project/custom-coding-rules.md`; 031#P-2 defer.
- **Rationale**: User answer: "accept", to per-row recommendations with cause, edits and consequences; the P-1 home move spares consumers a line that only framework authors use.
- **Affected docs**: `.asd/project/retro-backlog.md`, `sprint.md`

- 2026-11-05 — issue dispositions: #83 include AC-7; #80 include AC-9; #81 include AC-10; #82 include AC-11; #84 include AC-12; #85 include AC-13; #75 defer; #76 defer; #86 defer
