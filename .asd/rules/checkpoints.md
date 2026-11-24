# Checkpoints

## Gate policy

Freeze `user_gates` at scope in `state.json.user_gates`. Without a sprint, standalone concept, stack and design-system read config. Accept `strict|adaptive`; absent = `strict`; invalid/unreadable blocks.

Hard in both modes: unauthorized scope, acceptance criteria or user-value changes ("Scope amendment"); unauthorized initial/material UX, brand, accessibility or stack direction; migration deletion of project files; audit contradictions not settled by precedence (audit step 3b); material architecture change; debt or review-date renewal; reviewer, coverage or quality waivers; review-cap overrides per wave; abort; inventory rows marked hard. Checks confer no authority.

`strict` requires explicit approval per gate class. In `adaptive`, routine gates may pass with exact user authority, documented constraints, understood effects/resources, green checks and no unresolved material alternative. Candidates: routine inventory rows, in-bounds ADRs, mechanical docs updates and bounded complication decisions. Investigate facts; ask for authority, preference or material trade-offs. Reuse exact authorization and record it per "Approval recording".

Widen an unmeetable plan fix to the needed files or seek a scope decision to drop its requirement. Verify flagged predicate/contract changes against agent definitions, README or rules; route contradictions back.

## Gate mechanics

For hard or unqualified routine gates, **approve-before-write** asks before mutation; **write-then-review-accept** follows its mechanic below. Optional choices and free text need an explicit answer for `decision_actor=user`; preselection, silence, incomplete answers, clarifications or unrelated text leave it pending. Policy changes cannot approve pending hard gates. No-op phases have no artifact gate.

## Approval recording

Save `{gate, decision_actor, reason, evidence, artifact_revision}` with short refs in `state.json.gate_decisions`, plus narrative in the sprint decisions log. A routine adaptive pass uses `decision_actor:"orchestrator"`. Standalone concept, stack and design-system use the accepted artifact and git history instead of state/log. Invalidate only the materially changed artifact's decision.

## Criterion cost surfacing

Before deciding an AC addition, change, retirement or closure (including retro intake) or review-cap override, state and record in gate `evidence` for each affected AC:

- Iterations: count review dirs with findings naming that AC, including `reviews/impl/wave-*/iter-NN/` and legacy flat dirs. State this as a lower bound because some findings omit AC IDs.
- Fix rounds: count live and rotated decisions-log entries for those iteration IDs, matched on the stable tail `for <id>: findings resolved` (`asd-phase-impl.md` step 11).

Show explicit zero for untouched criteria. For cap override cover every AC with unresolved findings in that iteration. Measure from disk each time. Counts never trigger a decision.

## Gate inventory

The normal gate class is retained for `strict`, and is the fallback when an adaptive decision cannot be justified:

| Gate | Class |
|---|---|
| audit, design/impl-review green handoff, initial impl assessment, decomposition | approve-before-write |
| new subsystem boundary or material ADR, public contract or compatibility change | hard approve-before-write |
| scope, plan, concept, stack, PRD, UX, design-system, ADR draft | write-then-review-accept |
| factual tech-reference and mechanical design-system update | approve-before-write in strict; routine in adaptive |
| test removal, PR publication, expense or external action | approve-before-write in strict; evidence rule in adaptive; never bypass host permissions/checks |
| per-sprint document skip (scope gate or audit exit, `sprint-lifecycle.md` "Optional documents") | hard approve-before-write |
| retro intake dispositions (`asd-phase-scope.md` step 2a: one explicit include/reject/defer per retro row, `asd-retro` issue or project issue put to the user; written on scope acceptance) | hard approve-before-write |
| open-PR disposition (`asd-phase-scope.md` step 2a: one explicit merge/include/close/defer per open PR) | hard approve-before-write |
| approach choice (scope step 2 before the `AC-N`, `sprint-lifecycle.md` "Staged solution design") | hard approve-before-write |
| workflow choice (scope step 1, `sprint-lifecycle.md` "Workflows") | hard approve-before-write |
| ASD update choice (new-sprint start, `asd-sprint` SKILL) | hard approve-before-write |

Ungated: retro issue publication, scope triage closes (one user decision before the first triage write), post-release closes, consumer included-issue and included-PR closes. Intake dispositions stay gated. Cleanup removals are ungated and exclude tests. No standalone gate for `c4-full/` or extra mandatory pause for per-section QODDA.

## Write-then-review-accept mechanic

Write the artifact to its real path, post its absolute path with a short delta summary, and revise it in place until explicit `accept`.

## Precondition chain

```
audit → design → design-review → design-promote → plan → impl ⇄ impl-test → impl-review → cleanup → retro → pr
```

`audit` requires accepted scope; `design` requires audit or an audit skip; `design-review` requires produced in-scope drafts; `design-promote` requires review DoD; `plan` requires promotion or the design-block collapse; `impl` requires plan or pending fix state; `impl-test` requires impl build/lint; `impl-review` requires impacted tests; `cleanup` requires review DoD; `retro` requires `cleanup` or its no-op skip; `pr` requires review DoD plus a completed `retro`. Missing predecessor emits `ABORT — precondition not met: <artifact>`.

The chain above is `standard`'s. In `lite` (`sprint-lifecycle.md` "Workflows") `plan` requires audit or an audit skip, `design-promote` requires impl-review DoD, `cleanup` requires design-promote and `retro` requires `cleanup` or its no-op skip; every other requirement is as above.

## Re-run

Re-running a phase invalidates downstream artifacts and records the reset. A no-op phase satisfies its successor via its `COMPLETED` signal.
