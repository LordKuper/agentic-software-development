---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 030-english-only-asd-issues

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/workflows/asd-phase-retro.md).
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl | review-fix applied a reviewer's two-site fix (caller carve-out and callee guard); the next iteration flagged the guard as critical over-engineering | reviews/impl/wave-1/iter-01/combined, reviews/impl/wave-1/iter-02/combined |
| F-2 | impl | review-fix tester chain ran the full suite before the orchestrator's self-hosting sync, so a stale `upstream_hashes` entry turned it red | — |
| F-3 | impl | impl assessment accepted Task 7's flagged isolation gap adaptively; impl-review raised the same gap as a finding | reviews/impl/wave-1/iter-01/combined |
| F-4 | scope | Git Bash rewrote the `<ref>:<path>` argument of `git show origin/main:<path>` | — |

## F-1 — two-site fix applied, callee half reverted next iteration

- **Phase**: impl (review-fix, wave-1/iter-01)
- **Surface**: rule — `.asd/rules/review-policy.md` "Verify before applying"; orchestrator review-fix payload
- **What happened**: one bug (`rotate-decisions` run before a new sprint's `state.json` exists) drew a suggested fix at two sites: exclude the case in the `asd-sprint` rule and guard it in `rotateDecisions`. The orchestrator's payload said "fix both" and the dev did. With the caller exclusion in place the guard was unreachable, and iter-02 raised it as a critical over-engineering finding.
- **Impact**: one extra review-fix round, impl-test entry and review iteration (dev, tester, combined reviewer dispatches).
- **Refs**: reviews/impl/wave-1/iter-01/combined, reviews/impl/wave-1/iter-02/combined

## F-2 — fix-round suite ran before the manifest-ledger sync

- **Phase**: impl (review-fix, wave-1/iter-02)
- **Surface**: phase — `.asd/workflows/asd-phase-impl.md` step 7 (self-hosting sync point)
- **What happened**: the dev chain edited `.asd/runtime.js`, which has no generated view. Step 7 places the sync after "the round's last canon-editing dispatch", so the tester chain that follows the dev chain ran the full suite first; `release-manifest.json`'s `upstream_hashes` test failed on the stale hash.
- **Impact**: a red 324/325 run and one extra orchestrator exchange before impl-test.
- **Refs**: —

## F-3 — adaptive impl assessment passed a flagged predicate gap

- **Phase**: impl (initial impl assessment)
- **Surface**: gate — `checkpoints.md` "Gate policy" (flagged choice against a stated predicate)
- **What happened**: Task 7 flagged that `GIT_CEILING_DIRECTORIES` caps git only and the `.asd` walk-ups (`sync.js` `findRepoRoot`, the hook's `findUp`) could reach the live repo from a fixture without its own `.asd/`. The orchestrator accepted it because no current fixture does that, although the plan's predicate says a fixture must never resolve the live repo's `.asd/`.
- **Impact**: impl-review iter-01 raised it (medium), costing a review-fix tester dispatch and, at iter-02, a missing-regression-check finding.
- **Refs**: reviews/impl/wave-1/iter-01/combined

## F-4 — Git Bash path conversion broke `git show <ref>:<path>`

- **Phase**: scope
- **Surface**: provider tool — Git Bash (MSYS) on Windows, running `git-strategy.md`'s `git show origin/<base>:<path>` form
- **What happened**: MSYS converted the `origin/main:.asd/...` argument as a POSIX path list, so `git show` received a mangled path; the command succeeded only after `export MSYS_NO_PATHCONV=1`.
- **Impact**: one failed command and a retry during the merged-unclosed closure check.
- **Refs**: —
