---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 017-review-waves

## Goal
Refine how `impl-review` handles a large change scope. Today a large scope is split per reviewer into parts that all run inside one iteration, sharing one iteration counter, and the Dispatch ceiling sends them out in sequential "waves". This sprint turns that into a **review wave**: at `impl-review` entry the orchestrator logically divides a large scope into at most 3 waves. Each wave goes through the standard review process with its own iteration counter, and the waves are reviewed one after another.

## Acceptance
- AC-1: At the first `impl-review` entry (and again after a rollback reset), the orchestrator divides the iteration scope into review waves when it exceeds a deterministic size threshold. The threshold value is set at plan; the check is a runtime constant, not judgment. The waves are logically cohesive groups of scope files (for example by plan Task or by area), with **at most 3** waves, disjoint and together covering the whole scope. A scope at or below the threshold is one wave, which is today's behaviour. The division is recorded in `state.json` and `decisions-log.md` at that entry, and each wave's reviewers receive only that wave's files.
- AC-2: Each wave runs the standard `impl-review` process: full reviewer roster, External Review when enabled, coverage ledger, APPROVE latch, iteration severity floor, iteration cap and escalation. Each wave keeps its **own iteration counter**. Severity floor and cap are computed from that wave's counter, and verdicts and latches are held per wave.
- AC-3: Waves are reviewed **sequentially**. Wave k+1 starts only after wave k's roster is all APPROVE or latched. Unresolved findings in wave k route to `impl` review-fix, then `impl-test`, then back into `impl-review` on the same wave k. The terminal full-suite run happens once, after the last wave's roster is met, and nothing else about impl-review's DoD changes.
- AC-4: A change committed after the waves were set (a review-fix, test-fix or red-full-suite fix) is reviewed in the **current** wave's incremental diff, even when it touches files of an earlier, already approved wave. An approved wave is never reopened.
- AC-5: Review waves and the review-dispatch waves described today in `sprint-lifecycle.md` "Dispatch ceiling" and `review-policy.md` "Interrupted dispatch and split dispatch" are one concept with one canonical definition. The existing text is reconciled so no second, contradictory mechanism remains for impl-review. Where parts inside a wave still exist, their relation to waves is stated once.
- AC-6: `state.json` and the review file layout carry the per-wave counters, verdicts, latches and iteration heads. Every reader of the impl-review counter uses the per-wave form: rollback reset, severity floor, Criterion cost surfacing, State recovery, `asd-sprint` resume display, `pr` DoD and `.asd/runtime.js`. Under `backward_compat: migration`, a sprint in flight with the pre-wave `reviews.impl` shape is read as a single wave without error.
- AC-7: Every mirror is updated in the same change (README.md, `.asd/rules/**`, `asd-phase-impl-review.md` and other affected workflows and skills, `t_state.json`, `.asd/runtime.js`). `node tests/run.js` is green and `node .asd/sync.js --check` reports no drift.

## Out of scope
- Waves for `design-review`: its part splitting and dispatch stay as they are.
- Plan-level Task waves (the `## Dependencies` wave table and `impl` Task dispatch).
- Parallel review of waves.
- Changing the `DISPATCH_CEILING` value.
