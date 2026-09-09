---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 010-agent-doc-economy

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl-review | Coverage manifests were emitted with `n_a` keyed flat by rubric id, a shape `validate-ledger` silently degrades instead of rejecting | reviews/impl/iter-01/testing, reviews/impl/iter-01/documentation |
| F-2 | impl-review | Manifests were re-stamped while three dispatches held them, invalidating returns that were already correct | reviews/impl/iter-01/documentation |
| F-3 | impl-review | A reviewer dispatch was lost whole to the host turn limit, and the contract's only remedy re-spends it | reviews/impl/iter-01/correctness |

## F-1 — Coverage manifests emitted with a flat `n_a`, which the validator degrades instead of rejecting

- **Phase**: impl-review
- **Surface**: rule + runtime helper — `.asd/rules/review-policy.md` "Coverage ledger", `.asd/runtime.js` `validateCoverageLedger`
- **What happened**: The phase orchestrator built each reviewer's manifest with `n_a` keyed directly by rubric id. `validateCoverageLedger` reads `manifest.n_a[<files|rules|sections>][<id>]`, so every authorized predicate resolved to an empty allowed set: any truthful `n/a` row would be rejected as an unauthorized predicate, while the malformed manifest itself passed every check, because the unknown-id guard iterates the empty object it just produced. Two reviewers detected it independently — Testing raised it as a blocking escalation and returned its ledger truthfully rather than substituting a false `pass`, and Documentation returned four `n/a` rows that could not have validated. The rule states the manifest's shape only through prose and the row example added this sprint, neither of which covers `n_a` — the one manifest field the orchestrator hand-builds per dispatch.
- **Impact**: Three of five reviewer returns in iteration 1 could not be validated as delivered. The failure was silent by construction: nothing in the emit path, the digest or the validator distinguishes a manifest whose predicates are unreachable from one that authorizes none.
- **Refs**: `reviews/impl/iter-01/testing` finding T-1; `test-plan.md` `D-2`

## F-2 — Manifests re-stamped under running dispatches

- **Phase**: impl-review
- **Surface**: phase orchestration — `.asd/workflows/asd-phase-impl-review.md` steps 6-7
- **What happened**: On learning of F-1, the orchestrator corrected and re-stamped the three affected manifests while their dispatches were still in flight. The digest is the manifest's identity, so each in-flight reviewer was left bound to a digest that no longer exists on disk, and a ledger it had already produced correctly became unvalidatable for a second, different reason. The workflow states the manifest is immutable to the reviewer; nothing states it is immutable to the orchestrator for the life of a dispatch.
- **Impact**: A correct Documentation return was invalidated after the fact. The two failures are now indistinguishable in the artefacts — a ledger rejected for F-1 and one rejected for F-2 both read as a digest or predicate error.
- **Refs**: `reviews/impl/iter-01/documentation`

## F-3 — A reviewer dispatch lost whole to the host turn limit

- **Phase**: impl-review
- **Surface**: rule — `.asd/rules/review-policy.md` "Interrupted dispatch and split dispatch"
- **What happened**: The Correctness dispatch reached the host's 50-turn limit having read most of a 56-file scope, and returned no verdict and no ledger; roughly 210K tokens of review work was discarded. The contract's remedy for a first interruption is a fresh re-dispatch, and its remedy for a second is to split the manifest — so the only route to the split is to spend a second full dispatch proving what the first already demonstrated, that the manifest is too large for one turn. Resumption was unavailable in this host, so the fresh re-dispatch was issued with explicit turn-economy instructions rather than an unchanged prompt.
- **Impact**: One dispatch spent for no artefact. The interruption cause was a scope size the phase could have observed before dispatching, not a transient failure.
- **Refs**: `reviews/impl/iter-01/correctness`
