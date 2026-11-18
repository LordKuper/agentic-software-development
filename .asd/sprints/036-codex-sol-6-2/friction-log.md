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
| F-4 | impl-review | External Review re-raised a fixed critical in a new form every iteration (in-place vs atomic write; link guard widened per round), so the review ran nine iterations | reviews/impl/wave-1/iter-03..iter-09 external |
| F-5 | impl-review | no resolution kind for an External finding that is invalid as out-of-surface; dropping it needed a user gate | reviews/impl/wave-1/iter-07/external |
| F-6 | impl | a review-fix edit to non-render canon (`.asd/sync.js`) left `release-manifest.json` `upstream_hashes` stale; the suite went red until the orchestrator ran `sync.js --apply` on an unrelated current view | ff7b49e0, 2e0e50d3 |
| F-7 | impl | `timing --attrs` takes `;`-separated pairs; `,` and repeated `--attrs` silently record a wrong or partial attrs object | timing.jsonl dispatch ops wave-1/iter-01, iter-05, impl-test entry 7 |

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

## F-4 — External Review re-raised a fixed critical in a new form every iteration

- **Phase**: impl-review
- **Surface**: agent — `asd-external-review` (wrapped Codex); rule — `external-review.md` "Stalemate detection"
- **What happened**: The settings write oscillated across iterations. iter-03 rated the temp-file replace critical because it loses the Windows ACL. iter-04 and iter-05 then rated the in-place write critical because it truncates. After the non-truncating fix, the linked-ledger guard was widened one call site per round: `recordOwnedKeys` (iter-05), the ordering in that function (iter-06), `loadSyncState` for `sync --check`/`--apply` (iter-07, out of surface), then the release-manifest read (iter-08). Stalemate detection never fired, because each round's location and message differed.
- **Impact**: Nine impl-review iterations instead of about four. Five extra review-fix rounds each ran dev, tester, impl-test and two reviewers. Two advisor consults and one user gate were needed to break the loop.
- **Refs**: reviews/impl/wave-1/iter-03..iter-09 external; decisions-log.004.md route notes iter-03..iter-08

## F-5 — no resolution kind for an out-of-surface External finding

- **Phase**: impl-review
- **Surface**: rule — `review-policy.md` "Change surface" (line 53) vs `sprint-lifecycle.md` "State recovery" "User-resolved findings"
- **What happened**: iter-07's only kept critical sat in code the sprint never changed (`loadSyncState`, `runCheck`), which makes it invalid under review-policy.md:53. External findings never carry `pre-existing:`, and the resolution kinds are override, stop, cap-accept, test-fix, memory-fix and issue. None of them lets the orchestrator drop an invalid finding, so the bare CONCERNS stays blocking.
- **Impact**: An advisor consult plus a hard user gate for a finding the policy already declares invalid. The user then chose to fix it, which widened the scope.
- **Refs**: reviews/impl/wave-1/iter-07/external.md; decisions-log.004.md "scope expansion wave-1/iter-07"

## F-6 — review-fix edit to non-render canon left the hash ledger stale

- **Phase**: impl
- **Surface**: phase — `.asd/workflows/asd-phase-impl.md` review-fix chain (orchestrator sync step); provider tool — `.asd/sync.js` `recomputeAndWriteHashLedgers`
- **What happened**: The dev's `.asd/sync.js` fix (ff7b49e0) changed a file tracked by `release-manifest.json` `upstream_hashes`. No generated view went stale, so the orchestrator's "sync once per fix round over stale views" had no target. The tester's full run went red on the hash-ledger test. The only way to recompute was `sync.js --apply` over an unrelated, already-current view path.
- **Impact**: One red suite and a manual ledger commit. The same happened twice more (26c3f66e → 69e01d42, 64b9f1e3 → 17705f04).
- **Refs**: ff7b49e0, 2e0e50d3, 69e01d42, 17705f04

## F-7 — `timing --attrs` separator is undiscoverable

- **Phase**: impl
- **Surface**: provider tool — `.asd/runtime.js` `timingAttrs`
- **What happened**: `--attrs` splits on `;`. `agent=x,tier=y,model=z` recorded one attr `agent` with the value `x,tier=y,model=z`. Repeated `--attrs` flags kept only the last pair. Space-separated pairs failed with "flags require values". Only the "unresolved" warning hinted at the problem.
- **Impact**: Several dispatch ops carry malformed attrs, which skews the per-agent timing aggregates retro reads.
- **Refs**: timing.jsonl ops "dev review-fix wave-1/iter-01", "dev/tester review-fix wave-1/iter-05", "tester impl-test entry 7"
