---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 023-retro-glings-008-remediation

## Goal
Process the upstream findings of the Glings project's sprint 008 retrospective together with this project's own retro intake (sprint 022's retro rows and the rows still deferred). Four themes: reviewer cost per wave, orchestrator start-up freshness, cheaper test-side work, and intake and routing gaps.

## Acceptance
- AC-1 (Glings 008 A-4 + P-3, retro 022#P-1): impl-review's cost per reviewer is bounded by files, not only lines. Wave division also counts files and diff bytes alongside changed lines, so one reviewer (and one wrapped-CLI invocation) covers a wave within its turn budget. A reviewer payload for a large wave carries a turn plan: read the diff in large chunks, write the ledger by turn 40, return a short complete verdict over an unfinished thorough one. The file and byte thresholds, and what counts as a large wave, are set from the evidence at plan time.
- AC-2 (Glings 008 A-1): before detecting the active sprint, `asd-sprint` runs `git fetch origin` and fast-forwards the local base branch (diverged: halt per `git-strategy.md`). Rules, workflows and phase skills are read only after that fast-forward, so a sprint merged on origin after the last pull is seen and the closure write acts on current framework text. The skill's own text and the session-start files are the pre-fetch copy, and the step states that limit once. An unreachable remote warns and continues on local state.
- AC-3 (Glings 008 A-8): External Review hands the wrapped CLI the scope manifest by path in the prompt, never as inline JSON in a heredoc. `external-review.md`, `asd-external-review.md` and the two prompt templates agree.
- AC-4 (Glings 008 A-6): agent memory carries a stated content rule (method only: no sprint id, Task, wave, iteration or verdict) and a runtime check that rejects a violating write. The check runs where the orchestrator commits memory writes (`git-strategy.md` "Commit before review"), not as a blocking write-time hook: a hook is a new script and settings entry, and a dev's or tester's own memory commit is not gated by this check.
- AC-5 (Glings 008 P-2): a plan may declare test-only Tasks that `impl` dispatches to `asd-tester` inside a wave, so the test side of a code-wide change runs in parallel chunks instead of one serial impl-test entry. The Task shape, `impl` dispatch, the handover to `impl-test` and the plan template state it once.
- AC-6 (retro 022#P-2): the fail-first proof of a static content-contract assert is bounded to one mutation per asserted relation plus one reword control, and the run count is recorded in `test-plan.md`. Home: `code-style.md` §17.
- AC-7 (retro 022#P-3, narrowed at audit): the `providers.md` "Agent tier matrix" is removed, its home becoming the agent frontmatter plus the manifest `model_families`, with the pin tests that read it repointed to the frontmatter. The README model-tier table stays as the one remaining mirror under its existing pin test. No generator, no new `sync.js` class.
- AC-8 (retro 021#A-1): in consumer mode, scope's retro intake shows the latest retro's `asd` rows to the user as upstream proposals for the framework repo, instead of silently dropping them.
- AC-9 (retro 021#P-1): each impl-test re-entry and terminal-suite run is routed from its own delta's risk. The first entry's tier no longer clamps a later prose-only or test-only delta to critical.

## Out of scope (optional)
- Glings 008 rows A-2, A-5, A-7 and P-1: consumer-only (they act on the Glings project's own rules and gate).
- Glings 008 A-3: already covered by `sprint-lifecycle.md` "State recovery" failed-dispatch reconstruction.
