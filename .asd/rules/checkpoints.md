# Checkpoints

## Gate policy

`config.yaml`'s top-level `user_gates` is the source; `state.json.user_gates` is the frozen per-sprint copy, seeded at scope from config (`asd-phase-scope.md`) — a later config edit never changes an active sprint. Value is `strict` or `adaptive`; absent legacy value means `strict`. Invalid or unreadable policy blocks. A standalone skill with no active sprint (`/asd-concept`, `/asd-stack`, `/asd-design-system`) reads `config.user_gates` directly, default `strict`. `strict` uses the gate classes below with explicit approval. In `adaptive`, the main orchestrator may advance a routine gate only when exact user authority and documented constraints cover the choice, effects/resources are understood, applicable checks pass, and no unresolved material alternative remains. It records `{gate, decision_actor:"orchestrator", reason, evidence, artifact_revision}` in `state.json.gate_decisions` and the decisions log. Confidence alone is insufficient. Missing facts require investigation; missing authority, preference or material trade-off requires the user. A semantic revision makes its prior decision stale. Exact existing user authorization may be reused.

Hard in both modes: new or changed scope, acceptance criteria or user value not already explicitly authorized; initial/material UX, brand, accessibility or stack direction not already authorized; a new subsystem boundary; material architecture, public contract or compatibility change; debt or any reviewer/coverage/quality waiver; review-cap override; abort; and sprint closure. Machine checks never become approvals.

Routine candidates: audit/plan acceptance, initial impl assessment, green review handoff, in-bounds ADR, factual tech reference, mechanical docs/design-system update, approved decomposition, and bounded complication decisions. Expenses, external actions, out-of-scope test deletion and PR publication use the same evidence rule; host permissions and machine checks remain mandatory.

## Gate mechanics

For a hard gate, or a routine gate that does not qualify adaptively:

- **approve-before-write**: request a decision before the gated mutation.
- **write-then-review-accept**: write the artifact, post its absolute path and short delta summary, then revise in place until explicit `accept`.

Record user decisions with `decision_actor=user`; silence and unrelated text are never approval. A routine adaptive pass is recorded as above instead. A policy mode change never approves a pending hard gate. No-op phases have no artifact gate.

## Approval recording

For an active sprint, record the actor, gate, artifact revision, evidence and reason in `state.json.gate_decisions` and append the sprint decision log. A standalone `/asd-concept`, `/asd-stack` or `/asd-design-system` has no state/log write: the accepted artifact and git history are its evidence. A material semantic change invalidates only the decision governing that artifact.

## Criterion cost surfacing

Gates are keyed by gate name, never by `AC-N`, so a criterion’s running cost is stated in the request rather than looked up. **Measurement point**: any request at the hard `scope, acceptance criteria or user value` gate that adds, changes, retires or closes a criterion, plus any review-cap override request — stated before the decision, never after it.

**Unit**, per criterion the request names, derived at read time from artefacts the sprint already writes (no counter is stored, so nothing can drift):

- *iterations charged* — count of `<sprint>/reviews/<phase>/iter-NN/` iterations whose findings name that `AC-N`. A finding is not required to cite an AC (only Correctness traces AC-N), so this count is a lower bound and is stated as one;
- *fix rounds charged* — count of `<sprint>/decisions-log.md` `impl fix for iter-NN: findings resolved` entries whose `iter-NN` is one of those iterations.

State `0` explicitly for an untouched criterion; a review-cap override states the pair for every criterion carrying an unresolved finding at that iteration.

The actor decides with the pair visible and writes it into the `evidence` of the record that gate already makes (above). Evidence only: no threshold fires, and a high count neither retires a criterion nor authorizes a new one.

## Gate inventory

The normal gate class is retained for `strict`, and is the fallback when an adaptive decision cannot be justified:

| Gate | Class |
|---|---|
| audit, design/impl-review green handoff, initial impl assessment, decomposition | approve-before-write |
| new subsystem or material ADR/contract/compatibility choice | hard approve-before-write |
| scope, plan, concept, stack, PRD, UX, design-system, ADR draft | write-then-review-accept |
| factual tech-reference and mechanical design-system update | approve-before-write in strict; routine in adaptive |
| test removal, PR publication, expense or external action | approve-before-write in strict; evidence rule in adaptive; never bypass host permissions/checks |
| sprint closure | hard approve-before-finalize/archive |

`c4-full/` has no standalone artifact gate. Per-section QODDA uses this same policy; it does not create a second mandatory pause.

## Write-then-review-accept mechanic

Write the artifact to its real path, post its absolute path with a short delta summary, and revise that same artifact until explicit `accept`. In strict this is mandatory for its listed inventory rows; in adaptive it is the fallback when routine evidence is insufficient.

## Precondition chain

```
audit → design → design-review → design-promote → plan → impl ⇄ impl-test → impl-review → retro → pr
```

`audit` requires accepted scope; `design` requires audit or an audit skip; `design-review` requires produced in-scope drafts; `design-promote` requires review DoD; `plan` requires promotion or collapsed design no-op; `impl` requires plan or pending fix state; `impl-test` requires impl build/lint; `impl-review` requires impacted tests; `retro` requires review DoD; `pr` requires review DoD plus a completed `retro`. Missing predecessor emits `ABORT — precondition not met: <artifact>`.

## Re-run

Re-running a phase invalidates downstream artifacts and records the reset. A no-op phase satisfies its successor via its `COMPLETED` signal.
