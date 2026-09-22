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

## 2026-09-22 — Glings retro 003 rows verified at HEAD 8649c9c

- **Decision**: Carry F-1 (AC-8), F-3 (AC-7), F-4 (AC-6), F-7/F-8 (AC-4), F-9 (AC-5), systemic cleanup-criteria (AC-10), all unresolved. F-2 narrowed to its audit half (AC-9); systemic fan-out narrowed to a concurrency ceiling plus cap-override disclosure (AC-11). F-5, F-6 and the consumer systemic row are excluded as consumer scope.
- **Rationale**: F-1: no per-sprint skip exists, only config `documents.*`. F-2: reviewers already split at `SPLIT_THRESHOLD_FILES`=25, but architect `maxTurns` is 50 and the audit payload has no batched-read rule. F-3: `asd-sprint` SKILL step 2A.3 still collects scope via a request-user-decision prompt, and this session reproduced it. F-4: `asd-ba`/`asd-ux` tools have no Bash, and design-promote has no rename/delete route. F-7/F-8: the impl-review payload passes "the diff" to Read/Glob/Grep-only reviewers. F-9: the ledger has no rename row class. Cleanup criteria: the scope workflow has no such prompt. Fan-out: `SURFACE_CAP_FILES`=100 (sprint 014) bounds default fan-out to about 17 dispatches, but a cap override is unbounded.
- **Affected docs**: sprint.md AC-4..AC-11

- 2026-09-22 — audit frozen `true`: scope changes behaviour, contracts and gates (not mechanical)
- 2026-09-22 — prd, ux_spec, adr skipped: disabled in config; c4 `false` (diagram_tool none)

## 2026-09-22 — Scope accepted

- **Decision**: User accepted sprint.md AC-1..AC-13 at the hard scope gate.
- **Rationale**: Explicit `accept`; the AC-2 per-reviewer file subset and the AC-11 ceiling-plus-waves interpretation were surfaced for review before accept.
- **Affected docs**: sprint.md

## 2026-09-22 — Audit contradictions settled

- **Decision**: C-1: Correctness owns the AC→code trace and Testing owns the AC→check coverage. C-2: incremental scope everywhere, so design-review internal reviewers also get only the changed drafts on iteration 2+. C-3: "the wrapped CLI self-scopes". C-4: the gate answer is written to disk before any further work.
- **Rationale**: Hard user decisions on canonical-vs-canonical contradictions (`sprint-lifecycle.md` "Audit phase"). C-2 overrides the architect's proposed resolution.
- **Affected docs**: audit.md "Contradictions"

## 2026-09-22 — Audit accepted (adaptive)

- **Decision**: Orchestrator advanced the routine audit gate.
- **Rationale**: Every `t_audit.md` section was returned, every contradiction was settled by the user, there is no product ambiguity, and decomposition is disabled. The plan carries the open choices the audit named: design-review Correctness with an empty list, patch files committed vs gitignored, c4 skippable under AC-8.
- **Affected docs**: audit.md

- 2026-09-22 — design/design-review/design-promote skipped (no documents enabled)

## 2026-09-22 — `plan.md` accepted

- **Decision**: The user accepted a plan of 7 Tasks in 4 waves, with a change surface of 25 files. The plan settles the choices the audit left open:
  - design-review Correctness gets every changed draft and a new "Draft correctness" rubric entry.
  - Only Testing narrows in impl-review.
  - Compact rows cover R100 renames only.
  - Patch files are committed.
  - `c4` is skippable.
  - Architect `maxTurns` is 150.
  - Version 11.0.0, with no migration.
- **Rationale**: These are material choices the user had not authorized before, so the gate was explicit rather than adaptive. No open stubs.
- **Affected docs**: plan.md
- 2026-09-22 — route Task 1: critical, dispatch HEAD 5b9c7d0
- 2026-09-22 — route Task 2, Task 3, Task 5: critical, dispatch HEAD 5288f86
- 2026-09-22 — wave 1-2 flagged choices accepted by orchestrator:
  - Task 1: `dispatchWaves` has no CLI; the ceiling rule is cited by its section heading; `dispatches` is an upper bound.
  - Task 2: pure rename proven by identical content and mode via `git diff --raw -z -M` over `base...head`, which proves at least as much as R100; `INTERNAL_REVIEWERS` is an array; the predicate is cited by symbol; test-plan paths are left out of patches.
  - Task 3: the skip is applied at the step 4 gate; the rule text "never a prompt to clear" is a ban.
  - Task 5: short wording for the hard gate.
- 2026-09-22 — route Task 4, Task 6: critical, dispatch HEAD 4389577
- 2026-09-22 — wave 3 flagged choices accepted by orchestrator:
  - Task 4: the skip line names the document; "(no further gate)" rewording.
  - Task 6: phase-tagged rubric headings reuse the existing phase gate, with no runtime change; `--test-plan` is passed to every reviewer; `t_review.md` is unchanged because it has no scope text; External Review's row is a pointer; design iteration 2+ reuses External Review's snapshot rule.
- 2026-09-22 — route Task 7: standard, dispatch HEAD f987651

## 2026-09-22 — impl assessment approved (adaptive)

- **Decision**: Tasks 1-7 are done and the phase advances to impl-test.
- **Rationale**: Every plan box is ticked, every flagged choice was resolved inside plan scope (logged above), build and lint are clean, all diff paths are authorised, and no stubs were added this sprint. Two existing tests pin the old `surfaceCheck`/`emit-manifest` behaviour; test changes are impl-test's job.
- **Affected docs**: plan.md
- 2026-09-22 — route impl-test entry 1: critical, dispatch HEAD 082cd31
- 2026-09-22 — impl-test: defects D-1 → impl test-fix (digest 51fc5d2bde6461502eb0dbd2ff312500801b21a077b11417369b36172c05f674)
- 2026-09-22 — route D-1: critical, dispatch HEAD 3352fd5
- 2026-09-22 — D-1 flagged choices accepted by orchestrator:
  - The dispatch bound adds one Testing part for at most 25 test-plan paths.
  - The halved-retry bound is out of scope; it predates this sprint.
- 2026-09-22 — impl test-fix: defects D-1 resolved
- 2026-09-22 — route impl-test entry 2: critical, dispatch HEAD 9452acf
- 2026-09-22 — impl-test: impacted set green (211/211 full suite), 0/0 tests (entry 2)

## 2026-09-22 — impl-review iter-01: 17 findings → review-fix

- **Decision**: Every reviewer returned CONCERNS and none returned FAIL. The findings route to impl review-fix mode. The user decided P2-1: at the audit exit, the document skip applies only when the user requests it or when a decision is already awaited at the audit gate. There is no standalone prompt, and the flip stays a hard gate.
- **Rationale**: Orchestrator fix choices:
  - E1 (delete `dispatchWaves`) also resolves EXT-3, because no untested dead export is left.
  - E2: delete `assertReviewerUnion`.
  - F-2: step 1 uses `git -c core.quotePath=false diff --name-only`.
  - EXT-4: resolved by the doc-comment move under D-1/EXT-2.
  - EXT-1: implement the design-review snapshot write/read.
  - Test-file findings TST-1 and TST-2 go to `asd-tester` after the dev chain.
- **Affected docs**: reviews/impl/iter-01/, plan.md Task 4
- 2026-09-22 — route review-fix iter-01 dev chain: critical, dispatch HEAD 0b790b8
- 2026-09-22 — route review-fix iter-01 tester chain: critical, dispatch HEAD 7566611
- 2026-09-22 — review-fix flagged choices accepted by orchestrator:
  - `draft-snapshot` subcommand (the smallest real implementation of the EXT-1 snapshot), with snapshots committed alongside the reviews.
  - Extra consistent wording cuts in CHANGELOG and README.
  - The surface-cap count left without `quotePath`.
  - Tester: one commit carrying 4 trailers; entry-01 rows edited in place as the findings named them.
- 2026-09-22 — impl fix for iter-01: findings resolved
- 2026-09-22 — route impl-test entry 3: critical, dispatch HEAD 351dd3f
- 2026-09-22 — impl-test: impacted set green (213/213 full suite), 2/0 tests (entry 3)

## 2026-09-22 — impl-review iter-02: 3 findings → review-fix

- **Decision**: Correctness and Efficiency approved and are latched at iter 2. Three medium findings route to review-fix. EXT-4 carries over: `surfaceCheck` takes an optional test-plan path count, replacing the doc-comment-only resolution chosen at iter-01. DOC-1 removes the stale sentence from the testing-reviewer memory. TST-3 (widen the AC-8 capture, with fail-first proof) goes to `asd-tester`.
- **Rationale**: External Review verified 4 of 5 iter-01 findings resolved, so there is no stalemate. Each fix is small and in scope, and fixing EXT-4 now avoids another carry-over.
- **Affected docs**: reviews/impl/iter-02/
- 2026-09-22 — route review-fix iter-02 dev chain: critical, dispatch HEAD 36be875
- 2026-09-22 — route review-fix iter-02 tester chain: critical, dispatch HEAD 695b43d
- 2026-09-22 — EXT-4 flagged choice accepted by orchestrator: with the default of 1, the count is lower but still an upper bound at caps that are not a multiple of 25
- 2026-09-22 — impl fix for iter-02: findings resolved
- 2026-09-22 — route impl-test entry 4: critical, dispatch HEAD b8abf24
- 2026-09-22 — impl-test: impacted set green (213/213 full suite), 1 extended/0 removed (entry 4)
- 2026-09-22 — impl-review iter-03: all reviewers APPROVE (correctness/efficiency latched at iter 2); reviewer DoD met → terminal full suite
- 2026-09-22 — route impl-review terminal suite: standard, dispatch HEAD 31dd56c
- 2026-09-22 — impl-review DoD met: full suite green 213/213 at 25cdce5; green handoff passed adaptively → retro
- 2026-09-22 — `<sprint>/retrospective.html` written: 2 entries (both covered by canon), 3 systemic proposals, analysed branch
- 2026-09-22 — pr open mode DoD verified: plan 7/7, AC-1..AC-13 traced, iter-03 all APPROVE/latched, full suite 213/213 at 25cdce5 with no code diff since, sync clean, retrospective present, no sprint stubs; version 11.0.0 with CHANGELOG (no migration)
