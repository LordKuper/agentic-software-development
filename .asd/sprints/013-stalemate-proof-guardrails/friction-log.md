---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 013-stalemate-proof-guardrails

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/rules/sprint-lifecycle.md "Retro phase").
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl | Both wave-1 critical dev dispatches terminated by host rate limit before any edit | — |
| F-2 | impl | Wave-2 Task 2 dev dispatch stalled 600s twice with no edit and no signal | — |
| F-3 | impl-review | Reviewer payload named a `git diff` command but internal reviewers hold no shell | reviews/impl/iter-01/correctness, efficiency, testing, documentation |
| F-4 | impl-review | External Review stalled once, then skipped on Codex quota exhaustion | reviews/impl/iter-01/external |

## F-1 — Both wave-1 critical dev dispatches terminated by host rate limit before any edit

- **Phase**: impl
- **Surface**: provider tool — Claude Code subagent dispatch (`asd-dev-critical`, HTTP 429 session limit)
- **What happened**: Tasks 1 and 5 were dispatched concurrently on the critical tier; both agents died on the session usage limit with no file written and no signal returned. The workflow has no rule for a dispatch lost to a host limit, so the orchestrator re-dispatched from a clean tree.
- **Impact**: One lost wave round-trip; re-dispatch of both tasks.
- **Refs**: —

## F-2 — Wave-2 Task 2 dev dispatch stalled 600s twice with no edit and no signal

- **Phase**: impl
- **Surface**: provider tool — Claude Code subagent dispatch (`asd-dev`, stream watchdog timeout)
- **What happened**: The standard-tier Task 2 dispatch stopped making progress and was killed by the host watchdog after 600s, having written nothing. As in F-1, no rule covers a dispatch lost without a signal; the orchestrator checked the worktree and re-dispatched fresh.
- **Impact**: Wave 2 held open for two extra dispatches; the fresh standard-tier retry stalled identically, so Task 2 was raised to the critical tier for a third dispatch.
- **Refs**: —

## F-3 — Reviewer payload named a `git diff` command but internal reviewers hold no shell

- **Phase**: impl-review
- **Surface**: phase — `.asd/workflows/asd-phase-impl-review.md` step 6 payload ("the diff computed in step 1")
- **What happened**: The orchestrator passed each internal reviewer a `git diff main...HEAD -- <file>` instruction instead of the computed diff. All eight part dispatches reported having no shell and reconstructed the change surface from `plan.md`/`audit.md`/`test-plan.md` citations and on-disk files; two could not verify manifest hash freshness.
- **Impact**: Reviewers spent turns rebuilding the diff indirectly; changed-vs-unchanged lines were inferred, not observed.
- **Refs**: reviews/impl/iter-01/correctness, reviews/impl/iter-01/efficiency, reviews/impl/iter-01/testing, reviews/impl/iter-01/documentation

## F-4 — External Review stalled once, then skipped on Codex quota exhaustion

- **Phase**: impl-review
- **Surface**: provider tool — wrapped Codex CLI via `asd-external-review` (win32 host, Git Bash run-command)
- **What happened**: The first dispatch stalled 600s with no verdict (host watchdog). The re-dispatch, told to use a heredoc under Git Bash and a 540s command timeout, got a Codex usage-limit error on the real run and one retry, and returned the availability skip; `quota` was recorded in the negative cache.
- **Impact**: Iteration 1 has no external verdict; two dispatches spent.
- **Refs**: reviews/impl/iter-01/external

