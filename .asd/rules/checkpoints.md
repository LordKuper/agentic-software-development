# Checkpoints

## Gate policy

Freeze `config.yaml`'s `user_gates` in `state.json.user_gates` at scope. Standalone `/asd-concept`, `/asd-stack` and `/asd-design-system` without an active sprint read config directly. Values: `strict` or `adaptive`; absent means `strict`; invalid or unreadable blocks.

Hard in both modes: new or changed scope, acceptance criteria or user value not already explicitly authorized (`sprint-lifecycle.md` "Scope amendment"); initial/material UX, brand, accessibility or stack direction not already authorized; deletion of project files during migration; audit contradiction precedence cannot settle (`asd-phase-audit.md` step 3b); material architecture change; debt (including review-date renewal) or any reviewer/coverage/quality waiver; review-cap override (per impl-review wave); abort; and rows marked hard below. Machine checks never supply approval.

`strict` requires explicit approval per inventory class. In `adaptive`, the orchestrator may advance a routine gate only with exact user authority, documented constraints, understood effects and resources, passing checks and no unresolved material alternative. Routine candidates include the applicable inventory rows, in-bounds ADRs, mechanical docs updates and bounded complication decisions. Investigate missing facts; ask the user for missing authority, preference or material trade-off. Reuse exact authorization and record decisions per "Approval recording". Confidence alone is insufficient.

A flagged choice reporting an unmeetable plan decision must meet it by widening the fix to the needed files; dropping its requirement is a `new or changed scope` decision. Check a flagged predicate or contract change against its agent definition, README or rule and route contradictions back.

## Gate mechanics

For a hard gate, or a routine gate that does not qualify adaptively:

- **approve-before-write**: request a decision before the gated mutation.
- **write-then-review-accept**: follow the mechanic below.

Apply gate rules to free text and optional choices alike. Only an explicit answer permits `decision_actor=user`; preselection, silence, incomplete answers, clarifications and unrelated text leave the gate pending. A policy change cannot approve a pending hard gate. No-op phases have no artifact gate.

## Approval recording

For an active sprint, record `{gate, decision_actor, reason, evidence, artifact_revision}` in `state.json.gate_decisions` (short refs only, `artifact-layout.md` "State file") and append the narrative to the sprint decision log. Use `decision_actor:"orchestrator"` for a routine adaptive pass. A standalone `/asd-concept`, `/asd-stack` or `/asd-design-system` uses the accepted artifact and git history as evidence, with no state/log write. A material semantic change invalidates only its artifact's decision.

## Criterion cost surfacing

Gates are keyed by gate name, so a criterion’s running cost is stated in the request, not looked up. **Measurement point**: any request at the hard `scope, acceptance criteria or user value` gate that adds, changes, retires or closes a criterion — an included retro intake candidate among them — plus any review-cap override request, stated before the decision.

**Unit**, per criterion the request names, derived at read time from artefacts the sprint already writes (no counter is stored, so nothing can drift):

- *iterations charged* — count of iteration directories (`<sprint>/reviews/<phase>/iter-NN/`; in impl-review `<sprint>/reviews/impl/wave-*/iter-NN/` plus legacy `<sprint>/reviews/impl/iter-NN/`) whose findings name that `AC-N`. A finding need not cite an AC (only Correctness traces AC-N), so the count is a lower bound, stated as one;
- *fix rounds charged* — count of fix-round entries across `<sprint>/decisions-log.md` and its segments (`artifact-layout.md` "Decisions log"), whose iteration id (`wave-<K>/iter-NN`, legacy `iter-NN`; `sprint-lifecycle.md` "Review iteration counters") is one of those iterations, matched on the stable tail `for <id>: findings resolved` however the mode is named (`asd-phase-impl.md` step 11 is the emitting SSoT).

State `0` explicitly for an untouched criterion; a review-cap override states the pair for every criterion carrying an unresolved finding at that iteration.

The pair goes into the `evidence` of the record that gate already makes (above), with the actor deciding on it visible. Evidence only: no threshold fires, and a high count neither retires a criterion nor authorizes a new one.

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

Publishing an `asd-retro` issue (retro), triage closes of one (scope step 2a), post-release closes, a consumer's included-issue closes and every included-PR close (pr merge) take no gate in either mode; an issue's include/reject/defer is the retro intake dispositions gate above. Step 2a's triage writes are authorised by one request user decision before the first write, which is not a gate-inventory gate.

`cleanup` removals take no gate: test files are outside its reach, so test removal stays the gate above. `c4-full/` has no standalone artifact gate. Per-section QODDA uses this same policy; it does not create a second mandatory pause.

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
