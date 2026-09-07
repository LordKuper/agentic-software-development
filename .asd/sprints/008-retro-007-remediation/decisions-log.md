---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), state.json (state), reviews/ (verdicts)
---

# Decisions Log

Per-sprint, append-only. Never edited or removed. Created at `scope`, archived with the sprint.

## Entry format

```markdown
## YYYY-MM-DD — <one-line summary>

- **Decision**: <what was decided> (≤3 sentences)
- **Rationale**: <why> (≤3 sentences)
- **Affected docs**: <links> (unrestricted)
```

A no-op skip or other zero-content decision uses the one-line form instead:

```markdown
- YYYY-MM-DD — <phase> skipped: <reason>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, or `.asd/project/stubs.md`. Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-09-07 — audit phase runs (documents.audit: auto)

- **Decision**: `documents.audit` normalizes to enabled for this sprint; the audit phase runs.
- **Rationale**: `auto` skips only a complete, verifiably mechanical scope with no behaviour, contract, migration or gate impact. This scope changes tool behaviour (`.asd/sync.js` unmatched-target error), a review contract (split review, interrupted-dispatch outcome), routing input (`.asd/runtime.js`) and the state schema (`t_state.json` handoff artifacts) — none of it mechanical.
- **Affected docs**: [state.json](state.json), [sprint.md](sprint.md)

## 2026-09-07 — scope accepted in full, all 14 AC

- **Decision**: The user accepted the initial scope as written, keeping both the friction remediation (AC-1..AC-6) and the systemic proposals (AC-7..AC-11) in one sprint, over the alternative of deferring the systemic half to a later sprint.
- **Rationale**: The retrospective's own scoping advice argues for a smaller diff, but the two systemic proposals with the largest expected saving are in the deferred half; AC-1 lands the split-review contract in this same sprint, so an oversize review diff has a documented shape to fall back on.
- **Affected docs**: [sprint.md](sprint.md), [state.json](state.json), [retrospective 007](../archived/007-retrospective-phase/retrospective.html)

## 2026-09-07 — audit accepted; AC-4 closed as satisfied, AC-5/AC-6/AC-13 revised

- **Decision**: AC-4 is closed with no code change — `.asd/sync.js` has failed closed on an unmatched `--apply` target since v4.0.0, verified by running the tool during audit; the deliberate `orphan-unmarked` ok-result stays as contracted. AC-5 retargets to every real occurrence of the misleading sync wording and drops `.asd/templates/t_AGENTS.md`, which contains none. AC-13 re-points from the already-covered AC-4 assertion to the behaviour this sprint actually introduces.
- **Rationale**: The retrospective was written against sprint 007's HEAD, and F-4's root cause reflected a stale agent-memory note rather than the current code. Re-implementing a working fail-closed path risks regressing it, and a third assertion of what `tests/run.js` §11 already asserts twice is churn.
- **Affected docs**: [sprint.md](sprint.md), [audit.md](audit.md), [state.json](state.json)

## 2026-09-07 — AC-6: an internal reviewer is never skipped

- **Decision**: An interrupted internal reviewer dispatch is re-dispatched fresh within the same iteration, with the interrupted attempt recorded. It is never written as a skip and never satisfies DoD without a completed verdict. External Review's `APPROVE (skipped: ...)` stays exclusive to an unavailable provider.
- **Rationale**: The user rejected the audit's bounded-skip proposal as still letting an incomplete review satisfy DoD. Re-dispatch within the iteration is the shape `review-policy.md` already uses for an invalid coverage ledger, so F-6 is answered by making the loss recorded rather than by weakening the gate. An internal reviewer, unlike a wrapped external CLI, is always available.
- **Affected docs**: [sprint.md](sprint.md), [audit.md](audit.md)

## 2026-09-07 — one-off write authorization outside the self-hosting allowlist

- **Decision**: Editing `.asd/project/custom-coding-rules.md` is authorized for this sprint only, for AC-5's wording fix. The `sprint-lifecycle.md` "Self-hosting" allowlist is not changed.
- **Rationale**: The file carries the same misleading sync wording and is read on every impl dispatch, so leaving it would reproduce F-4; widening the allowlist to `.asd/project/**` would also cover `config.yaml` and `sprints/`, which is outside this sprint's scope. `.asd/project/**` is excluded from the review surface, so the plan verifies this edit by grep.
- **Affected docs**: [sprint.md](sprint.md), [audit.md](audit.md)

- 2026-09-07 — design/design-review/design-promote skipped (no documents enabled)

## 2026-09-07 — plan.md accepted (adaptive)

- **Decision**: `plan.md` accepted through an adaptive routine pass, with eleven tasks covering AC-1..AC-3 and AC-5..AC-14. AC-1 and AC-6 are one task because they share a file and an insertion point; AC-12's mirrors are one closing sweep because only the last writer sees the final state.
- **Rationale**: The plan decomposes acceptance criteria the user accepted at the scope gate and revised at the audit gate; it introduces no scope, no new criteria and no unresolved material alternative, which is what `checkpoints.md` requires for a routine adaptive pass. No stubs needed routing — `.asd/project/stubs.md` is empty.
- **Affected docs**: [plan.md](plan.md), [sprint.md](sprint.md), [audit.md](audit.md), [state.json](state.json)

## 2026-09-07 — impl assessment approved

- **Decision**: The user approved the impl assessment; the sprint advances to `impl-test`. All eleven plan tasks are COMPLETED, AC-1..AC-3 and AC-5..AC-14 are implemented, and AC-4 stands closed as satisfied at HEAD.
- **Rationale**: Build (`node .asd/sync.js --check`) is `ok: true` with every target current and no orphans; lint (`git diff --check`) is clean; `tests/run.js` is 136/136 after Task 11 refreshed the `upstream_hashes` Task 7 left stale; no stub was introduced this sprint. Task 10's two deviations from its subtask wording — writing the handoff record at derivation time rather than phase exit, and wiring impl-test's delta at step 2 where it is actually computed — were accepted as keeping the field honest rather than decorative.
- **Affected docs**: [plan.md](plan.md), [sprint.md](sprint.md), [friction-log.md](friction-log.md), [state.json](state.json)

## 2026-09-07 — impl-test: impacted set green, 9 tests added

- **Decision**: The impacted set is green (145/145) with 9 tests added and 0 removed; the sprint advances to `impl-review`. No `D-N` defect was raised — the implementation held under every new test.
- **Rationale**: The impacted-set safety valve fired immediately and degraded the run to the full suite, because the change surface touches `.asd/runtime.js` and the `.asd/rules`/`templates`/`workflows` trees, which are framework-wide under self-hosting, and because the repo has one flat test file with no subset selector. Nine `none` decisions are recorded with reasons in `test-plan.md`, mostly prose contracts already covered by the existing mirror sections or with no scripted parser to validate against.
- **Affected docs**: [test-plan.md](test-plan.md), [plan.md](plan.md), [state.json](state.json)
