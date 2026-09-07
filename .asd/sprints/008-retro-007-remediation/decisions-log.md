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
