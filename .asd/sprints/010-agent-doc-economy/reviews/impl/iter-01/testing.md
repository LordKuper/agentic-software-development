[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: 1
- **Severity floor**: low
- **Ledger status**: NOT VALIDATED — see "Ledger deviation" below. Findings stand as evidence for the fix round; the verdict token is not counted toward this iteration's DoD, and this reviewer is re-dispatched fresh next iteration against a corrected manifest.

## Findings

### T-1 — medium — coverage

**Location**: `.asd/runtime.js:224-235,194`; `test-plan.md` AC-6b rows; evidence in this iteration's own manifests

AC-6b gave `vocabulary` and `row_example` a one-constant seam, digest coverage and a validator equality check, so a manifest can never teach a shape the validator rejects. `n_a` — the one manifest field an orchestrator hand-builds per dispatch — got neither a published example nor a check, and no test binds the emitted manifest shape to the shape `validateCoverageLedger` reads. The gap is realized, not hypothetical: all four iteration-1 manifests emitted `n_a` flat, keyed by rubric id, while `allowedNa` reads `manifest.n_a[<row-type label>]`. Every id therefore resolved to an empty predicate set, so any authorized `n/a` row is rejected at `:194`, while the malformed manifest itself passes silently because the unknown-id guard iterates an empty object. That is exactly the incomplete-or-unverifiable re-dispatch cost AC-6a exists to reduce, and it is invisible except as a re-dispatch.

**Suggested fix**: add a unit case beside the AC-6b tests — (a) validate a ledger against a manifest whose `n_a` is built the way a phase workflow builds one, the shape `buildManifest` already models at `tests/run.js:2196`; (b) assert that a manifest whose `n_a` keys are not the three row-type labels is rejected rather than silently degraded to "no predicate allowed". (b) needs a production change in `validateCoverageLedger`, so it is routed as defect `D-2` rather than pinning current behaviour.

### T-2 — low — rule-set conformance

**Location**: `test-plan.md` "Risk → check decisions", AC-5a row (`none`); `.asd/rules/code-style.md:120`

The `none` reason — single home, no mirror, so no drift surface — answers drift but not deletion, and deletion is this sprint's own evidenced mechanism: roughly 18.7 KB cut under a new rule that authorizes removing rationale changing no behaviour, which is how §17's second clause reads to a future economy pass. AC-5a is the only criterion this sprint whose own text nothing pins at any level; `tests/run.js:3692-3693` pins the AC-5b workflow gate, not the rule sentence the reviewer and tester actually read. Every other AC-N got a one-line literal pin at its home, so the decision is also inconsistent with the tester's own standard.

**Suggested fix**: two `assert.ok`s on `code-style.md` §17 appended to the existing AC-5b test at `tests/run.js:3684` — same file already read, no new fixture. Or restate the `none` reason to name deletion and explain why the preserve-list is judged a sufficient guard.

### T-3 — low — edge cases

**Location**: `tests/run.js:3718`

The AC-10 reach sweep guards against vacuity on the row set but not on the exemption set: the continue clause silently exempts any number of rows whose context matches. `test-plan.md`'s own AC-10 row claims the singular — one row granting per consulting question — and that singular is asserted in the plan and not in the test, so a second row acquiring that wording would drop out of the sweep with the suite green.

**Suggested fix**: collect the exempted rows and assert their count is exactly one, naming `asd-advisor`, then loop the remainder.

## Assessment of the dispatched questions

**`none` decisions — four of five sound, one under-argued (T-2).** The AC-6a partition `none` is correct: the re-run, not the class, is the decider, so no code reads the partition. The AC-8 corpus-audit `none` is correct: `audit.md` has no canonical mirror and no machine-read token. The `sync.js` variant-path `none` is verified against the code — `variantMeta` requires `claude.model` to be a string and variants render through the same emission line, so a second path genuinely does not exist. The AC-10 per-agent-copies `none` is correctly declined: a reworded copy defeats a literal sweep while reporting coverage.

**Fail-first proofs — every transcript replays to the named first-firing assertion.** Replayed by hand: the stamped-field sweep fires only after the identity pin survives; the dropped-predicate mutation reaches its assertion with a verdict text only the corrected fixture fill can produce, which makes the tester's own record of that first-draft defect self-verifying; the AC-1, AC-5b, AC-2, AC-3, AC-4, AC-6a, G-12 and G-9 mutations each land on the transcribed assertion. The one case where a test goes green on its mutation is recorded honestly rather than claimed. Restoration verified on disk, which is the tightened §17 obligation: no mutation remains.

**D-1's routing and the fixture guard hold.** The entry-1 test's last case is the emission-site path and the fix moved the check to it, with the Codex counterpart correctly left inside family resolution where the cheapest-family rejection needs it. The guard is well-targeted: the mutation is a literal replace over shared canon, and a reformat would silently re-run the model-present path. The recorded first-draft failure checks out against the fixture.

**Coverage of the sprint's code changes.** `LEDGER_ROW_EXAMPLE` is stamped, digest-covered by a sweep over every stamped field rather than a fixed list — strictly stronger than the assertion it replaced — equality-validated, backward-compatible on both the neither-constant and the vocabulary-only manifest, with each fixture built through the untouched primitive so it cannot track the digester under test, and the example's status keyed to the vocabulary constant so the two cannot desync. Claude `effort` has vocabulary boundary, absence, Codex asymmetry and emission-site coverage. Both named silent failure modes are closed; the third, which nobody looked for, is T-1.

Also verified: no test removals, and the one replaced pin is strictly stronger; the full-suite decision is correct given `commands.yaml` declares no `test_affected`; determinism holds, with the one global-state mutation saved and restored in `finally`; every new test matches the flat zero-dependency runner; entry-2's delta scope matches the decisions log with no unrecorded file; both `n/a` predicates are true — `stubs.md` is empty and there is no `manual-steps.md`.

## Ledger deviation

This reviewer resolved all 56 file rows, all 5 rule rows (two as `n/a` on the manifest's authorized predicates) and all 4 section rows, and raised the manifest defect as a blocking escalation rather than substituting a false `pass` — the correct behaviour under `review-policy.md`. The ledger cannot be validated because of orchestrator defect **F-1** in `friction-log.md`: `n_a` was keyed flat by rubric id, so `validate-ledger` rejects both truthful `n/a` rows as unauthorized predicates. Not a reviewer fault, and the findings do not depend on the ledger. Per `review-policy.md`, a verdict without a validated ledger does not count toward DoD, so this iteration does not record it as satisfied; the reviewer is re-dispatched fresh next iteration against the corrected manifest, after the fix round.

## Verdict

CONCERNS: 3

## Next action

`asd-tester` applies T-1(a), T-2 and T-3 in a test round; T-1(b) is routed to `impl` as defect `D-2`, since it needs a production change in `validateCoverageLedger`. No escalation required — all are inside the tester's own scope and add no abstraction.
