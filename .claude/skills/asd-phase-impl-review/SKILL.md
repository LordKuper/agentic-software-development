---
name: asd-phase-impl-review
description: "Runs the ASD impl-review phase iteratively until DoD met. Updates state.json to phase=impl-review and increments iteration. In parallel dispatches asd-reviewer-quality, asd-reviewer-implementation, asd-reviewer-testing, asd-reviewer-ui, asd-reviewer-simplification, asd-reviewer-documentation, asd-reviewer-performance, and (when review.external_review=enabled) asd-external-review against the sprint's code and tests. Each reviewer writes its verdict file under <sprint>/reviews/iter-NN/ with a first-line gate verdict token. Aggregates verdicts: all APPROVE on same iteration → DoD met → COMPLETED with NEXT pr. Any unresolved finding → impl-review does NOT fix it; asd-pm sets state.json.review_fixes_pending=iter-NN and routes the sprint back to the impl phase (fix mode) via NEXT impl, forming an impl⇄impl-review cycle. Any FAIL → escalation via AskUserQuestion (Complication Approval) before routing. Applies iteration severity floor per review-policy.md cumulative-budget algorithm; stops and escalates when cap reached. Use when asd-sprint dispatches impl-review, or when the user explicitly asks to run or re-run impl-review for the active sprint."
metadata:
  asd-role: phase
  asd-order: "8"
  version: "0.1"
allowed-tools: "Read AskUserQuestion Task"
---

# ASD Phase: Impl Review

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- impl COMPLETED signal received; `state.json.phase` advanced from `impl`
- **First entry** (after initial impl): all plan.md Task checkboxes ticked; impl assessment approved
- **Cycle re-entry** (after impl fix mode): `state.json.review_fixes_pending` cleared by impl fix-mode finalize; the impl completion gate (build + tests green) passed

## Tool policy
- Read — `.asd/config.yaml`, `state.json`, plan.md, code + tests diff, persistent design/ docs, `.asd/project/stubs.md`, `.asd/project/custom-rules.md`, review files
- AskUserQuestion — escalation on FAIL or iteration cap reached
- Task — parallel reviewer dispatch; PM for state + decisions-log. impl-review does NOT dispatch devs — finding fixes are routed to the impl phase (fix mode).

## Workflow

1. Read `.asd/config.yaml` (`review.external_review`, `review.iterations_low/medium/high/critical`, `backward_compat`, `language.chat`, `language.docs`)
2. Read `<sprint>/state.json` → set `phase=impl-review`, initialize or increment `iteration` (start at 1 on first entry)
3. Compute severity floor for current iteration per `review-policy.md` cumulative-budget algorithm
4. Create folder `<sprint>/reviews/iter-NN/` if absent
5. **Parallel dispatch** via Task:
   - `asd-reviewer-quality` — bugs, security, best-practice, contract drift
   - `asd-reviewer-implementation` — PRD AC-N coverage trace vs code/tests
   - `asd-reviewer-testing` — test coverage, edge cases, determinism, stub-resolution verification, manual verification capture
   - `asd-reviewer-ui` — UI code vs ux-spec mockups + accessibility compliance
   - `asd-reviewer-simplification` — over-engineering smells in code; design-principles adherence
   - `asd-reviewer-documentation` — persistent design/ actuality vs implementation, SSoT, traceability
   - `asd-reviewer-performance` — perf budgets, regression, anti-patterns
   - if `review.external_review=enabled` → `asd-external-review` with phase=`impl-review`
   - payload to each: diff (iter 1 = `git diff <base>...HEAD`; iter 2+ = `git diff` + last commit), iteration N, severity floor, relevant context paths, `language.chat`, `language.docs`
   - each reviewer writes `<sprint>/reviews/iter-NN/<reviewer>.md` per `t_review.md` (or `t_review-report.md` for external) with first-line verdict token `[REVIEW-impl-<reviewer>]: ...`
6. Wait all REVIEW_DONE signals
7. Parse first-line verdict tokens from all reviewer files; aggregate. impl-review does NOT fix findings itself — fixes are routed to the impl phase (fix mode):
   - **All APPROVE** → DoD met:
     - dispatch `asd-pm` via Task: append decisions-log entry "impl-review iter NN: APPROVE", clear `state.json.review_fixes_pending` (set null)
     - emit phase COMPLETED with `NEXT: pr`
   - **Any FAIL** → escalation (impl-review owns review escalation):
     - parse FAIL findings; group by escalation cause (concept / requirement / contract change; new abstraction; scope expansion; complexity increase)
     - AskUserQuestion in `language.chat`: present each FAIL using Complication Approval format from `core.md`; collect decisions
     - on user override → mark that finding resolved (no fix needed); exclude it from the fix set
     - on user accept → keep that finding in the fix set; note the approved change in its reviewer file
     - then continue to the routing step below with the surviving findings
   - **Any unresolved finding remains** (CONCERNS findings, plus FAIL findings the user accepted for fix) → route to impl fix mode:
     - dispatch `asd-pm` via Task: set `state.json.review_fixes_pending = "iter-NN"` (the current iteration folder holding the findings); append decisions-log entry "impl-review iter NN: <CONCERNS/FAIL summary> → impl fix"
     - emit phase COMPLETED with `NEXT: impl`
   - **All FAIL overridden, no CONCERNS** (escalation left zero unresolved findings) → treat as DoD met by user override: PM appends decisions-log "impl-review iter NN: APPROVE by override", clears `review_fixes_pending`; emit COMPLETED with `NEXT: pr`
8. Iteration cap reached (the next impl-review iteration would exceed all severity-tier budgets per `review-policy.md`) — checked when step 7 would route to impl fix mode:
   - AskUserQuestion: override cap and continue / accept current findings / abort sprint
   - on override → reset relevant counter; route to impl fix mode (PM sets `review_fixes_pending`, emit COMPLETED `NEXT: impl`)
   - on accept → emit COMPLETED with `NEXT: pr`, note "iteration cap reached, user accepted"
   - on abort → emit ABORT
9. Any reviewer QUESTION / FAILED / ABORT → relay, halt

## Iteration severity floor (reference)
See `.asd/rules/review-policy.md` for the cumulative-budget algorithm. Phase skill computes floor and passes to reviewer payload so reviewers drop findings below floor.

## Artefacts produced
- `<sprint>/reviews/iter-NN/quality.md`
- `<sprint>/reviews/iter-NN/implementation.md`
- `<sprint>/reviews/iter-NN/testing.md`
- `<sprint>/reviews/iter-NN/ui.md`
- `<sprint>/reviews/iter-NN/simplification.md`
- `<sprint>/reviews/iter-NN/documentation.md`
- `<sprint>/reviews/iter-NN/performance.md`
- `<sprint>/reviews/iter-NN/external.md` (when `external_review=enabled`)
- Updated `state.json` (phase, iteration, reviews map, `review_fixes_pending`)
- decisions-log entry on DoD met, route-to-impl-fix, or override

Note: impl-review produces no code/test/stub changes — those are made by the impl phase (fix mode) on the next cycle.

## Agents dispatched
- 6 internal reviewers (Quality, Implementation, Testing, UI, Simplification, Documentation) + Performance — parallel
- External Review — parallel (when enabled)
- PM — state updates + decisions-log + `review_fixes_pending` routing
- No devs — finding fixes are performed by the impl phase (fix mode)

## Skills dispatched
None.

## Return contract (single line)
```
PHASE: impl-review | SPRINT: <NNN-slug> | ITER: <N> | STATUS: <complete|blocked|aborted> | NEXT: <pr|impl>
```
`NEXT: pr` on DoD met (or cap-accept); `NEXT: impl` when unresolved findings route the sprint to impl fix mode.

## References
- `.asd/rules/sprint-lifecycle.md` (impl-review phase contract)
- `.asd/rules/review-policy.md` (severity floor, autofix, escalation, gate verdict format, DoD per phase)
- `.asd/rules/design-principles.md`
- `.asd/rules/checkpoints.md`
- `.asd/rules/language-policy.md`
- `.asd/rules/git-strategy.md` (stubs handling)
- Templates: `t_review.md`, `t_review-report.md`
