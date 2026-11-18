---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 036-codex-sol-6-2

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/workflows/asd-phase-retro.md).
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl | `agent-liveness` reports STALL for dev agents that already returned COMPLETED | — |
| F-2 | impl-review | combined manifest emitted without `--self-hosting`, so Framework mode was marked n/a | reviews/impl/wave-1/iter-01/combined |
| F-3 | impl | review-fix dev committed with `change: <risk>` subjects; `commit-check` does not validate the Conventional Commits type | 76b90101, 5c3af791, d9fba3c2, a44f5e38 |

## F-1 — `agent-liveness` reports STALL for dev agents that already returned COMPLETED

- **Phase**: impl
- **Surface**: provider tool — `.asd/runtime.js` `agentLiveness` / `transcriptProgress`
- **What happened**: Task 1 and all five wave-2 `asd-dev` dispatches returned COMPLETED via a subagent hand-back within minutes; each Monitor-run `agent-liveness --interval 300` later printed `STALL <id> no-progress` for every one of them. The transcript of a finished agent stops growing, and `transcriptProgress` did not mark it done.
- **Impact**: six false stall events; the orchestrator had to recognise them as benign by hand. A stall acted on literally would `TaskStop` a finished agent and trigger a needless failed-dispatch reconstruction. AC-14 covers reviewers with a return file only; creator dispatches that return in chat are still exposed.
- **Refs**: —

## F-2 — combined manifest emitted without `--self-hosting`, so Framework mode was marked n/a

- **Phase**: impl-review
- **Surface**: phase — `.asd/workflows/asd-phase-impl-review.md` steps 1/6 (`emit-manifest --self-hosting`)
- **What happened**: The orchestrator ran step 6's `emit-manifest` for `combined` without the `--self-hosting` flag that step 1 requires in this repo. The manifest marked "Framework mode" as `n/a: self_hosting not enabled`, and the reviewer flagged the discrepancy in its report. The `--self-hosting` flag is stated only in step 1 prose, away from the step 6 command template the orchestrator copies.
- **Impact**: One full combined review was discarded. The manifest was re-emitted and the reviewer re-dispatched fresh, adding about 10 minutes and one reviewer run of tokens.
- **Refs**: reviews/impl/wave-1/iter-01/combined

## F-3 — review-fix dev committed with `change: <risk>` subjects; `commit-check` does not validate the Conventional Commits type

- **Phase**: impl
- **Surface**: provider tool — `.asd/runtime.js` `commitCheck`; phase — `.asd/workflows/asd-phase-impl.md` step 6 fix-chain payload
- **What happened**: The review-fix dispatch labelled each finding group with its Material risk declaration (`change: workflow gate`). The dev used those labels as commit subjects (`change: security`, …). `commit-check` passed all four: it checks header length, trailer placement and AI trailers, never the `<type>(<scope>):` shape that `git-strategy.md` "Commits" requires.
- **Impact**: The orchestrator rewrote the four unpushed subjects non-interactively (`git-strategy.md` "Commits" squash/reword of local commits). Pushed, they would have reached the PR with an invalid type, and the release bump that infers SemVer from commit types would have missed them.
- **Refs**: 76b90101, 5c3af791, d9fba3c2, a44f5e38
