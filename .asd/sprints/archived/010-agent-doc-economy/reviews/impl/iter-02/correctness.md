[REVIEW-impl-correctness]: APPROVE

# Review — correctness

- **Phase**: impl-review
- **Iteration**: 2
- **Severity floor**: medium
- **Manifest**: [correctness.manifest.json](./correctness.manifest.json) (digest `c3e89d39…`)
- **Validated ledger**: [correctness.ledger.json](./correctness.ledger.json) — `validate-ledger` → `{"ok":true}`

## Findings

None at or above the iteration-2 floor.

## What was checked hardest

**The corrected economy rule is coherent.** `removal` as the controlling test is universally quantified, so it gates the `Cut on sight` list too, not only the corroborating tests: a restated normative rule in a file whose reading role never loads the home file fails removal and is kept, which closes the OR-joined phrasing's hole. The `at its home` scoping prevents collision with the SSoT iron rule without re-protecting duplicates — a gate or ownership statement away from its home is not in the preserve-list, so the cut list still reaches it, while removal independently keeps the copies whose reader has no route to the home; the two clauses compose in the right order. Every class in `audit.md` R-1 and in the corpus audit's considered-and-cleared list maps onto the preserve-list or an unchanged file: the verdict token and its per-agent pre-substituted copies onto exact-form-is-the-contract; the role-scoped context table, the HTML-shell placeholder table, the UI-surface and executable enumerations and the over-engineering and nitpick lists onto completeness-is-the-rule; `code-style.md` §19 onto failure-mode-with-its-symptom; the APPROVE-latch invariant and the fail-closed default onto case-distinction. No R-1 class falls outside. The narrowed prohibition bullet now requires the positive rule to be stated beside the prohibition, and the preserve-list covers the residue that narrowing exposed.

**The `.asd/sync.js` collapse preserves Codex behaviour.** The single diagnostic closure reproduces the Codex message shape byte-for-byte against the sibling `fail`, with the same sentinels. The new `agent.effort !== undefined` guard opens no hole: an undefined Codex reasoning effort still throws one line later — the message changes, the fail-closed behaviour does not. The guard is also load-bearing for the wrapped-CLI path, which resolves a Codex family with an empty agent object and would otherwise throw on External Review's wrapped model.

**The `n_a` shape check is correct, and this manifest validates under it.** Row types are derived from the vocabulary's array-valued keys, so a manifest keying `n_a` by a status is rejected by name; the check is conditional on presence, so a manifest authorising no `n/a` still validates.

**No deletion took a real rule.** Each rule an in-scope deletion could have removed was checked at its surviving home: the advisor's HARD-gate non-authorisation survives in three places, and the three-consult cap was never the agent's to hold — it lives in the workflow that owns the counter. The architect's never-build-output rule survives in Tool policy plus a pointer, with the layout rule still carrying it. Read-only and never-autofix survive at least once per reviewer file, and every agent `description` is intact. The eight `validate-ledger` rejection classes still partition exactly and disjointly into the two enforcement branches, with the branch decision resting on the re-run rather than a class tag the helper does not emit — G-5 is genuinely closed. The severity example's invented id is now a real `AC-N`, and the exhortation clause is gone while its rule sentence stands. The E-6 pointer resolves to a paragraph marked as the sole statement of that carve-out. Rubric-id derivation still yields ids for all four reviewers, and `Documentation economy` is derivable from its bullet — the rule's only path into the blocking ledger.

**AC trace.** AC-5b, AC-6a, AC-6b, AC-7, AC-9 and AC-10 each have a code path in this round's scope with a named assertion. AC-1 through AC-4 and AC-8 land in files outside this round's diff; re-tracing them here would violate the change-surface rule. No in-scope change lacks a traceable AC or plan task.

**Agent memory in scope**: every file is indexed in its own `MEMORY.md`, every link resolves, and the one falsifiable claim checkable off disk is true at HEAD, so it is not a false line re-paid per dispatch.

## Below floor — dropped, recorded so the orchestrator can overrule

- `low` — `sprint-lifecycle.md:295` cites the advisor's Do's for a rule the advisor states under Don'ts. Costs a lookup; the same sentence states the rule inline, so nothing changes behaviour.
- `low` — the buried-verdict prohibition was cut from `review-policy.md` and three reviewer agents but survives in `asd-reviewer-correctness.md`. Inconsistent application of E-17, not a broken contract.

Commands were unavailable to this read-only dispatch, so AC-9's green-suite half rests on the phase's own gate rather than on this review.

## Verdict

APPROVE

## Next action

Reviewer done. Bare `APPROVE`, so this reviewer qualifies for the APPROVE latch.
