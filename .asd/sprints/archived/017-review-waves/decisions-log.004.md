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

- 2026-09-24 — route Task 1: critical, dispatch HEAD c2bf1db
- 2026-09-24 — route Task 2: standard, dispatch HEAD c2bf1db

## 2026-09-24 — Wave 1 flagged choices resolved

- **Decision**: All Task 1 flags (af26202) and Task 2 flags (52d91d7) accepted as in-plan implementation choices. Task 1: snapshot copies go to `<iter dir>/snapshot/<path>`; External gets `--iteration`/`--wave` and requires a range in impl-review; `emit-manifest` prints a single object; new exports. Task 2: the wave display is impl-review only; an out-of-range `wave` falls back to 1 in the hook display. `t_review-scope.json` is already done by Task 1, so Task 4 does not touch it again.
- **Rationale**: Every choice stays inside D1/D2/D7/D9/D10, and none opens a material alternative. Later Tasks bind the rule text to these names.
- **Affected docs**: plan.md

- 2026-09-24 — route Task 3: critical, dispatch HEAD 2e2e133

## 2026-09-24 — Task 3 flagged choices resolved

- **Decision**: All eight Task 3 flags (e2cf698) are accepted. The main one: the division point is `reviews.impl.waves[0].iteration == 0`, because the seed already carries a wave node and so plan D1/D5 "no wave node" could never be true; Task 5 binds to this. `waves.json` is written for n = 1 too, the literals use the id form, and "Review wave" gets its own glossary line. Leftovers (7) go to Task 4 and stale workflow cites (8) to Task 5.
- **Rationale**: The flags fix a plan inconsistency or pick wording inside D1-D7 scope, and none opens a material alternative.
- **Affected docs**: plan.md

- 2026-09-24 — route Task 4: critical, dispatch HEAD 138e261

## 2026-09-24 — Task 4 flagged choices resolved

- **Decision**: All six Task 4 flags (b18786a) accepted:
  - `t_review-report.md` handled here, not in Task 5, and its "Reviewed files n/m" line dropped;
  - Unreviewed carry-over is scoped to its wave;
  - a carried-over design draft is read whole;
  - External Review stays strict to `files[]`;
  - Gate-line paths in id form;
  - interim `release-manifest.json` hashes.
- **Rationale**: Each flag stays inside D4/D7/D8/D9 and keeps prior behaviour where the plan is silent (a skip on the final iteration never carried over before either).
- **Affected docs**: plan.md

- 2026-09-24 — route Task 5: critical, dispatch HEAD 64680d0

## 2026-09-24 — Task 5 flagged choices resolved

- **Decision**: All Task 5 flags (d43bf8a) accepted:
  - `--full-files` for the wave list at iteration 1, giving a deterministic union;
  - External emission moved to step 6;
  - legacy normalization as a precondition;
  - cap-accept or all-FAIL override in wave K < n advances to wave K+1.

  Task 6 also changes the `session-start.js` comment to "legacy partial". The other loose ends need no change. CHANGELOG stays with the pr phase, per git-strategy "Versioning".
- **Rationale**: Each flag follows from D5/D6/D9 and the per-wave roster, and none opens a material alternative.
- **Affected docs**: plan.md

- 2026-09-24 — route Task 6: standard, dispatch HEAD e725b7a

## 2026-09-24 — Impl assessment approved (adaptive)

- **Decision**: Initial impl is complete at e6dcaa4. Tasks 1-6 are ticked, and `sync.js --check` (build) and `git diff --cached --check` (lint) are clean. All 56 changed paths are authorized: the planned surface plus their generated views, plus `asd-phase-impl-review` SKILL.md, which the Task 5 dispatch named. `tests/run.js` is knowingly red on pinned contracts; impl-test updates it.
- **Rationale**: Routine gate with complete objective evidence. No flagged choice is left open, and no stub was added this sprint.
- **Affected docs**: plan.md
