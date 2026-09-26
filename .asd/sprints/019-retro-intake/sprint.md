---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 019-retro-intake

## Goal
Three changes:

1. **Triage the open retro findings of sprints 016–018.** Every row was verified against `HEAD` `ae09bac` and the user decided each one (`decisions-log.md`). Nine are included here (AC-8..AC-16). Three are deferred and three rejected, and those six seed the backlog from AC-4.
2. **Retro intake at sprint start.** Today retro findings reach a new sprint only when someone remembers them. From now on, the scope phase offers the relevant open findings automatically, and the user decides per finding: include it in this sprint, defer it to a later sprint, or reject it for good.
3. **Drop the mandatory cleanup/quality-criteria question** from the scope phase.

## Acceptance
- AC-1: Retro intake runs at scope, after the raw scope is collected and before the scope gate. The candidates are every Action and Systemic-proposal row of the most recent archived `retrospective.html`, plus every row the backlog holds as deferred. A row the backlog records as included or rejected is never a candidate, and neither is a `covered by:` row.
- AC-2: The project type filters the candidates. A consumer project (`self_hosting` not enabled) gets only rows with `Acts on: consumer`. A self-hosting project gets `consumer` and `asd` rows.
- AC-3: Each candidate is verified against current `HEAD` under the existing re-verification rule (`sprint-lifecycle.md` "Retrospective-derived criteria are re-verified at scope"). A candidate that is already resolved is closed and recorded, not offered. The rest go to the user with a recommendation each, and the user decides every one or only some. Include makes it an `AC-N`. Defer offers it again at every later sprint start until it is included or rejected. Reject means it is never offered again. A candidate the user leaves undecided stays deferred.
- AC-4: Dispositions (deferred / included / rejected, with the sprint that decided them) live in one persistent, orchestrator-owned home that survives sprint archival and that `/asd-update` never overwrites in a consumer. Each retro row is addressable across sprints by a stable identifier (sprint id plus a row id). The backlog is seeded with this sprint's triage: items 1–9 included, "degenerate-input formula" (017), "runtime-persisted reviewer text" (017) and "low test findings fixed in place" (016) deferred, "cloud Codex install" (017 F-1) and "public-contract artifact risk" (016) rejected.
- AC-5: If there is no prior retrospective, or no candidates after filtering, intake is a silent no-op: no question and no log noise beyond one line.
- AC-6: `asd-phase-scope.md` step 2 no longer requires an explicit question about cleanup and quality criteria (legacy removal, warning budget, doc consolidation). Such criteria enter the scope only when the raw scope or an included retro candidate states them.
- AC-7: A retro row carries the identifier AC-4 needs, starting with retros written after this sprint. `t_retrospective.html` and the retro phase emit it. For retros that predate it, rows are addressed by a deterministic derivation (for example sprint id plus table plus row ordinal) that the plan fixes.
- AC-8: (018 F-1) A dispatched agent commits in one command, `git commit --only -- <paths>`, with never-tracked paths added in that same command, and never leaves a path staged between commands (`git-strategy.md`).
- AC-9: (018 F-2) The orchestrator returns the shell to the repo root before every dispatch, and every dispatch payload names the repo root as an absolute path (`providers.md`).
- AC-10: (018 F-3) `maxTurns` is treated as host-enforced. Every reviewer payload states its turn budget and the turn by which the report must be emitted. The `providers.md` statement that `maxTurns` is emitted on trust is corrected.
- AC-11: (018 proposal) A review-fix that changes a rule other files consume searches for every consumer of that rule's home, updates them in the same commit, and lists them in its completion signal (`review-policy.md`).
- AC-12: (016 + 018 proposals) The decisions log rotates once per entry into the `impl`/`impl-test`/`impl-review` cycle, not at each transition inside it (`artifact-layout.md` "Decisions log"). Readers that assume the current rotation points (interrupted-attempt count, failed-dispatch routing line, impl-test stalemate answer) stay correct.
- AC-13: (018 proposal) Each `impl-test` entry and each terminal full-suite run dispatches a fresh tester, with `test-plan.md` as the only hand-off. A tester is never resumed across entries.
- AC-14: (017 F-2/F-4) A finding in agent memory routes to that memory's owner. When the host gives the owner no write tool, the orchestrator applies the owner's returned text verbatim and records it, and a non-owner never authors memory text. The `review-policy.md` claim that reviewers' memory channel is host-served is corrected to match the host.
- AC-15: (017 F-3) A review-fix tester amends only the risk and added-test rows of `test-plan.md`. The `Entry log` and entry-segment rotation belong to `impl-test` alone.
- AC-16: (017 proposal) When a sprint removes a mechanism or term, its leftover-term check covers `.claude/agent-memory/**` from the first `impl-test` entry.
- AC-17: Every mirror is updated in the same change: README.md, `.asd/release-manifest.json`, generated views via `.asd/sync.js --apply`, and `tests/run.js`. `node tests/run.js` is green and `node .asd/sync.js --check` reports no drift.

## Out of scope
- Deferred findings: degenerate-input formula (017), runtime-persisted reviewer text (017), low test findings fixed in place (016). They are seeded as deferred and offered again by AC-1.
- Rejected findings: cloud Codex install (017 F-1), public-contract artifact risk (016).
- Open findings of retros 012–015. They are not triaged and not seeded into the backlog.
- Editing any archived sprint artefact, including retro 017's `covered by: asd-phase-scope.md step 2` row.
