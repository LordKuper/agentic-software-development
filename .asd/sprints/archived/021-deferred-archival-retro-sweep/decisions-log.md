---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), .asd/project/retro-backlog.md (retro row dispositions), state.json (state), reviews/ (verdicts)
---

# Decisions Log

Per-sprint, append-only. Never edited or removed. Created at `scope`, rotated at phase entry (`.asd/rules/artifact-layout.md` "Decisions log"), archived with the sprint.

## Entry format

```markdown
## YYYY-MM-DD — <one-line summary>

- **Decision**: <what was decided> (≤3 sentences)
- **Rationale**: <why> (≤3 sentences)
- **Affected docs**: <links> (unrestricted)
```

A no-op skip, other zero-content decision, dispatch routing line or failed-dispatch reconstruction uses the one-line form instead:

```markdown
- YYYY-MM-DD — <phase> skipped: <reason>
- YYYY-MM-DD — route <taskIds>: <tier>, dispatch HEAD <sha>
- YYYY-MM-DD — reconstruction: landed <ids>; re-dispatched <ids>
- YYYY-MM-DD — stall: <agent> <dispatch ids>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-09-30 — Scope amendment: AC-14 (merged-unclosed at any phase)

- **Decision**: At the pr publication gate the user asked to fix, now, the residual that iter-05 dropped below the floor. It is added as AC-14, carried by Task 11 in the new wave 3: the head-branch lookup runs for every active sprint without `pr.number`, and a `MERGED` hit is merged-unclosed at any phase. The change surface is unchanged: Task 11 edits only `sprint-lifecycle.md` and the `asd-sprint` SKILL, both already counted (plan estimate 56, real scope 69/100). Audit stays true. The phase goes back to `impl`, which is not strictly earlier than impl-review's input phase, so review counters are kept (wave 1 continues at iteration 6, floor critical). Both review latches are cleared by this user-authorised amendment, because post-APPROVE code needs a review. The 13.4.0 bump commit stays: the pr step 2 bump is idempotent.
- **Rationale**: `sprint-lifecycle.md` "Scope amendment", run for the first time on the sprint that introduced it. The hard `new or changed scope` gate was satisfied by the user's explicit request.
- **Affected docs**: [sprint.md](sprint.md), [plan.md](plan.md)
- 2026-09-30 — route Task 11: critical, dispatch HEAD d590220
- 2026-09-30 — impl wave 3 (Task 11, 5645459) assessed adaptively. Flagged choices were accepted: plan D1 detection wording now lags canon (AC-14 supersedes it); the OPEN rule sits on the resume bullet; the "State recovery" sentence was aligned.
- 2026-09-30 — route impl-test entry 7: critical, dispatch HEAD 56db444
- 2026-09-30 — impl-test: impacted set green (255/255), 0/0 tests (1 rewritten for AC-14); no manual-verification rows
- 2026-09-30 — impl-review wave-1/iter-06: combined APPROVE, external APPROVE (both latched at 6) → terminal full suite. Dropped below the critical floor: (high) Step 1's lookup at every phase makes every `/asd-sprint` need `gh` online; (medium) a CLOSED hit is unspecified; (medium) a refused closure at an earlier phase blocks the remaining phases; (low) CHANGELOG does not mention the per-invocation `gh` call
- 2026-09-30 — route impl-review wave-1/iter-06 suite: critical, dispatch HEAD 76cd684
- 2026-09-30 — impl-review DoD met after the AC-14 amendment: 6 iterations; terminal full suite green (255/255, HEAD 0c7eb7a) → design-promote
- 2026-09-30 — design-promote skipped: frozen prd/ux_spec/adr/c4 all false (lite empty scope; already in skipped_phases)
- 2026-09-30 — retro re-run after the AC-14 amendment: no new friction entries and no new systemic evidence beyond P-2 (the handoff gaps, which AC-14 closes); `retrospective.html` stands unchanged
- 2026-09-30 — retro amended: F-6 (late-iteration floor dropped a high finding) → A-5 (gh-offline tolerance, CLOSED hit), A-6 (amended code reviewed at its own first-iteration floor). The user chose to publish and carry these forward through the next intake.
- 2026-09-30 — pr open mode: DoD verified (plan 11/11 Tasks, AC-1…AC-14 traced, wave 1 reviews green at iter-06, full suite 255/255 at 0c7eb7a with only CHANGELOG/sprint files since, re-run 255/255; no sprint stubs; retrospective present; v13.4.0 + CHANGELOG; migrations ≤ 13.4.0); the user approved PR publication and merge; head-branch lookup: no PR
- 2026-09-30 — PR opened: https://github.com/LordKuper/agentic-software-development/pull/57

## 2026-09-30 — Sprint closed

- **Decision**: The user approved closure ("Закрывай спринт"). PR #57 is merged as 8934231, and the full DoD evidence was presented before merge (reviews green at iter-06, full suite 255/255, retrospective). Closure write done: the folder moved to `archived/` and the terminal state was written as the first commit of `sprint/022-release-at-merge`. Tag/release v13.4.0 is created on 8934231.
- **Rationale**: `sprint-lifecycle.md` "PR phase" closure write, first live run of the D1 flow this sprint introduced.
- **Affected docs**: [state.json](state.json)
