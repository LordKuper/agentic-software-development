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
| F-4 | impl-review | External Review was unavailable on quota after a `local-ready` preflight, discovered only by spending the dispatch | reviews/impl/iter-02/external |
| F-5 | impl-review | A dispatch instruction told an agent to do what its own tool policy forbids, and the agent recorded the practice in its memory as a pattern to reuse | reviews/impl/iter-03/documentation |
| F-6 | pr | Two canon files disagree on whether the sprint folder is archived before the merge, and the disagreement drives the next sprint's active-sprint detection | — |

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

## F-4 — External Review unavailable on quota, after a ready preflight

- **Phase**: impl-review
- **Surface**: provider tool — wrapped Codex CLI, via `.asd/rules/external-review.md` "Detection and negative cache"
- **What happened**: Iteration 2's preflight returned `local-ready`, so the dispatch proceeded. The wrapped CLI ran to roughly 138K tokens of tool use and then exited on an account usage limit with no verdict; a single minimal retry hit the identical error and reset time, confirming genuine quota exhaustion rather than a transient failure. The wrapper recorded the failure against the preflight fingerprint with a bounded retry-after and returned the availability skip its outcome contract specifies.
- **Impact**: This iteration has no external second opinion, and the specific question the dispatch carried — whether `Never cut`'s general clause can collide with the narrowed `Cut on sight` prohibition bullet on a hybrid line — is unresolved. The cost was paid in full before the unavailability was observable: preflight predicts local executable and authentication state only, never paid-request availability, and no cheaper signal exists.
- **Refs**: `reviews/impl/iter-02/external`

## F-5 — A dispatch instruction contradicted the dispatched agent's own tool policy

- **Phase**: impl-review
- **Surface**: phase orchestration — the External Review dispatch payload, against `.asd/agents/asd-external-review.md` Tool policy and Don'ts
- **What happened**: After F-3's lost dispatch, the orchestrator's iteration-2 payload told External Review to redirect the wrapped CLI's output to a file under the sprint's review directory so the result would survive an interrupted agent. That agent's own contract forbids exactly this: it may write no files at all, the review text comes out through captured stdout, and it must never write the prompt or scope manifest to disk. The agent complied with the instruction, deleted the file afterwards, and then recorded the redirect in its own memory as the pattern to reuse — where the Documentation reviewer found it one iteration later as memory contradicting canon at HEAD.
- **Impact**: One high finding, and a defect that would have outlived the sprint: agent memory is loaded on every dispatch of that agent, so an instruction given once to solve a transient problem became standing guidance to violate a contract. Nothing in the dispatch path checks a payload against the receiving agent's declared tool policy — the orchestrator composes the instruction, and the agent has no way to distinguish an authoritative instruction from one that contradicts its own definition.
- **Refs**: `reviews/impl/iter-03/documentation` finding DOC-2

## F-6 — Canon disagrees with itself on whether `pr` open mode archives the sprint folder

- **Phase**: pr
- **Surface**: skill vs workflow — `.asd/skills/asd-sprint/SKILL.md` "Step 3: phase chain advancement" against `.asd/workflows/asd-phase-pr.md` "Open mode" step 3
- **What happened**: The skill states that open mode returns `NEXT: await-merge` with the sprint folder "already archived onto the same branch, `phase` still not `done`", and its Step 1 detection is built on that claim — it unions active-path sprints with archived-path sprints whose `phase != "done"` precisely to find a sprint archived pre-merge. The workflow that actually performs the phase says the opposite in the same breath: "Do not archive or mark done." The orchestrator followed the workflow, which is the authoritative orchestration body, and left the folder on the active path.
- **Impact**: None this sprint — the detection union tolerates either placement, which is why the contradiction survived. But the two files describe different states of the repository at the same point in the chain, so a future reader resolving them the other way archives a sprint that has not merged, and the sprint's own resume path is specified against a state its workflow never produces. It is the same defect class this sprint corrected six times inside `review-policy.md` and the review workflows: a self-declared contract that is false where it is declared.
- **Refs**: —
