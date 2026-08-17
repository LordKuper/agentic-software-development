---
name: asd-phase-impl-review
description: "Runs the ASD impl-review phase iteratively until DoD met: dispatches seven internal reviewers (and asd-external-review when enabled) in parallel against the sprint's code and tests, aggregates verdicts, and on unresolved findings sets state.json.review_fixes_pending and routes back to impl review-fix mode. Use when asd-sprint dispatches impl-review, or when the user explicitly asks to run or re-run impl-review for the active sprint."
metadata:
  asd-role: phase
  asd-order: "9"
  version: "0.1"
allowed-tools: "Read AskUserQuestion Task"
---

# ASD Phase: Impl Review

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- impl-test COMPLETED signal received with a green full suite; `state.json.phase` advanced from `impl-test`
- **First entry** (after initial impl): all plan.md Task checkboxes ticked; impl assessment approved
- **Cycle re-entry** (after impl review-fix + impl-test): `state.json.review_fixes_pending` cleared by impl fix-mode finalize; `test_defects_pending` null; `<sprint>/test-plan.md` `Suite run` records a pass

## Tool policy
- Read — `.asd/project/config.yaml`, `state.json`, plan.md, `test-plan.md`, code + tests diff, persistent design/ docs, `.asd/project/stubs.md`, `custom-common-rules.md`, `custom-coding-rules.md`, review files
- AskUserQuestion — escalation on FAIL or iteration cap
- Task — parallel reviewer dispatch; PM for state + decisions-log. impl-review does NOT dispatch devs — finding fixes route to impl phase (review-fix mode), which returns via impl-test.

## Workflow

1. Read `.asd/project/config.yaml` (`review.external_review`, `review.iterations_low/medium/high/critical`, `backward_compat`, `language.chat`, `language.docs`)
2. Read `<sprint>/state.json` → set `phase=impl-review`, increment `reviews.impl.iteration` (it is `0` at sprint creation, so `1` on first entry; +1 on every impl-review entry of the `impl⇄impl-review` cycle; the intervening `impl` fix-mode phase never touches it; see `sprint-lifecycle.md` "Review iteration counters" for increment + rollback-reset rules). `NN` = resulting value, zero-padded.
3. Compute severity floor for current iteration per `review-policy.md` cumulative-budget algorithm (uses `reviews.impl.iteration`)
4. Create folder `<sprint>/reviews/impl/iter-NN/` if absent
5. **Parallel dispatch** via Task — every reviewer spawned as **fresh agent** each iteration (clean-context dispatch per `review-policy.md`); no reviewer reused across iterations:
   - `asd-reviewer-quality` — bugs, security, best-practice, contract drift
   - `asd-reviewer-implementation` — PRD AC-N coverage trace vs code/tests
   - `asd-reviewer-testing` — `test-plan.md` decisions (risk→check fit, justified removals, justified `none` decisions, fail-first regression proof), test quality and determinism, stub-resolution verification, manual verification capture
   - `asd-reviewer-ui` — UI code vs ux-spec mockups + accessibility compliance
   - `asd-reviewer-simplification` — over-engineering smells in code; design-principles adherence
   - `asd-reviewer-documentation` — persistent design/ actuality vs implementation, SSoT, traceability
   - `asd-reviewer-performance` — perf budgets, regression, anti-patterns
   - if `review.external_review=enabled` → `asd-external-review` with phase=`impl-review`
   - payload to each: diff (iter 1 = `git diff <base>...HEAD`; iter 2+ = `git diff` + last commit), the **scope file list** (the diff's changed files — set each internal reviewer must cover in its `review-policy.md` coverage ledger), iteration N, review output dir `<sprint>/reviews/impl/iter-NN/`, severity floor, relevant context paths (`<sprint>/test-plan.md` included — Testing reviewer's primary input), `language.chat`, `language.docs`. Payload carries no authoring rationale, no prior-iteration verdicts; incremental diff scopes the *input*, not reviewer's context. For `asd-external-review` on iter ≥ 2, also pass previous iteration's finding set (stalemate detection)
   - each reviewer writes `<sprint>/reviews/impl/iter-NN/<reviewer>.md` per `t_review.md` (or `external-review/t_review-report.md` for external) with first-line verdict token `[REVIEW-impl-<reviewer>]: ...`
6. Wait all REVIEW_DONE, then **coverage-ledger gate** (per `review-policy.md`): per internal reviewer file, validate File-coverage ledger lists every file in scope file list and no ledger row (file or rule) blank/unresolved. Any reviewer with missing scoped file or unresolved row → reject + re-dispatch fresh, same iteration; wait again. Only complete-ledger reviews proceed. External Review exempt.
7. Parse first-line verdict tokens from all reviewer files; record per-reviewer verdicts under `state.json` `reviews.impl.verdicts["iter-NN"]`; aggregate. impl-review does NOT fix findings itself — fixes route to impl phase (fix mode):
   - **All APPROVE** → DoD met:
     - dispatch `asd-pm` via Task: append decisions-log "impl-review iter NN: APPROVE", clear `state.json.review_fixes_pending` (set null)
     - emit phase COMPLETED with `NEXT: pr`
   - **Any FAIL** → escalation (impl-review owns review escalation):
     - parse FAIL findings; group by escalation cause (concept / requirement / contract change; new abstraction; scope expansion; complexity increase)
     - AskUserQuestion in `language.chat`: present each FAIL using Complication Approval format from `core.md`; collect decisions
     - on override → mark that finding resolved (no fix needed); exclude from fix set
     - on accept → keep finding in fix set; note approved change in its reviewer file
     - then continue to routing step below with surviving findings
   - **Any unresolved finding remains** (CONCERNS findings, plus FAIL findings user accepted for fix) → route to impl review-fix mode (the sprint returns here via impl-test):
     - dispatch `asd-pm` via Task: set `state.json.review_fixes_pending = "iter-NN"` (current impl-review iteration; impl review-fix mode reads findings from `<sprint>/reviews/impl/iter-NN/`); append decisions-log "impl-review iter NN: <CONCERNS/FAIL summary> → impl fix"
     - emit phase COMPLETED with `NEXT: impl`
   - **All FAIL overridden, no CONCERNS** (escalation left zero unresolved findings) → treat as DoD met by user override: PM appends decisions-log "impl-review iter NN: APPROVE by override", clears `review_fixes_pending`; emit COMPLETED with `NEXT: pr`
8. Iteration cap reached (next impl-review iteration would exceed all severity-tier budgets per `review-policy.md`) — checked when step 7 would route to impl review-fix mode:
   - AskUserQuestion: override cap and continue / accept current findings / abort sprint
   - on override → route to impl review-fix mode (`reviews.impl.iteration` keeps incrementing — not reset; severity floor pinned at `critical`; PM sets `review_fixes_pending`, emit COMPLETED `NEXT: impl`)
   - on accept → emit COMPLETED with `NEXT: pr`, note "iteration cap reached, user accepted"
   - on abort → emit ABORT
9. Any reviewer QUESTION / FAILED / ABORT → relay, halt

## Iteration severity floor (reference)
See `.asd/rules/review-policy.md` cumulative-budget algorithm. Phase skill computes floor + passes to reviewer payload so reviewers drop findings below floor.

## Artefacts produced
- `<sprint>/reviews/impl/iter-NN/quality.md`
- `<sprint>/reviews/impl/iter-NN/implementation.md`
- `<sprint>/reviews/impl/iter-NN/testing.md`
- `<sprint>/reviews/impl/iter-NN/ui.md`
- `<sprint>/reviews/impl/iter-NN/simplification.md`
- `<sprint>/reviews/impl/iter-NN/documentation.md`
- `<sprint>/reviews/impl/iter-NN/performance.md`
- `<sprint>/reviews/impl/iter-NN/external.md` (when `external_review=enabled`)
- Updated `state.json` (phase, `reviews.impl.iteration`, `reviews.impl.verdicts`, `review_fixes_pending`)
- decisions-log entry on DoD met, route-to-impl-fix, or override

Note: impl-review produces no code/test/stub changes — those are made by the impl phase (review-fix mode) on the next cycle, followed by impl-test.

## Agents dispatched
- 6 internal reviewers (Quality, Implementation, Testing, UI, Simplification, Documentation) + Performance — parallel
- External Review — parallel (when enabled)
- PM — state updates + decisions-log + `review_fixes_pending` routing
- No devs — finding fixes performed by impl phase (review-fix mode)

## Skills dispatched
None.

## Return contract (single line)
```
PHASE: impl-review | SPRINT: <NNN-slug> | ITER: <N> | STATUS: <complete|blocked|aborted> | NEXT: <pr|impl>
```
`NEXT: pr` on DoD met (or cap-accept); `NEXT: impl` when unresolved findings route the sprint to impl review-fix mode.

## References
- `.asd/rules/sprint-lifecycle.md` (impl-review phase contract)
- `.asd/rules/review-policy.md` (severity floor, autofix, escalation, gate verdict format, DoD per phase)
- `.asd/rules/design-principles.md`
- `.asd/rules/checkpoints.md`
- `.asd/rules/language-policy.md`
- `.asd/rules/git-strategy.md` (stubs handling)
- Templates: `t_review.md`, `external-review/t_review-report.md`
