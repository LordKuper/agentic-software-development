[REVIEW-impl-testing]: APPROVE

# Review — testing

- **Phase**: impl-review
- **Iteration**: 3 (severity floor: high)
- **Scope**: incremental diff of the iteration-2 review fixes, 7 files

## Findings

None at or above the `high` floor. Nothing medium or low is reported, per the floor.

## Evidence

**Fail-first proofs re-derived this entry are plausible and, where checked, exact.** For the folded fixture, the presence-guard mutation leaves the empty-array sprint unstripped, so the first assertion to fail in body order is the final-member one, exactly as recorded; the second mutation reaches the folded nested assertion, and since the delete operates on a parsed object no smaller edit can touch a nested member, which is the recorded premise. For the derived threshold, lowering the stated value makes the kept-count comparison false at the assertion the record names — the assertions above it are untouched by that mutation, so it is genuinely first — and replacing the numeral with a word defeats the digit capture and fires the parser's own guard, called after those same passing assertions. For the friction assertion, the loop checks friction before the routing target per phase and `pr` is the chain tail, so deleting the line from the `pr` workflow fails exactly where recorded; the record also discloses the collateral ledger failure rather than hiding it.

**The fold lost no coverage.** The deleted standalone test's contract survives verbatim as a fourth fixture plus its assertion and its report-membership check, including the nested-member-serialized-above ordering the original fixture existed to pin. The removal is in scope — the test was authored by this sprint — so no out-of-scope removal approval was owed, and the recorded reason is verifiable. Determinism is preserved: sorting the report array removes the only directory-order dependency the fold introduced.

**The derived TOC threshold is safe coupling.** The rule doc is the genuine SSoT — the threshold is agent-executed placeholder fill, with no machine artifact to read instead — and the parse fails closed with a message naming the owning document and section. A reworded rule yields a loud, self-explaining failure where a restated literal would have yielded a silent green while the shell contract moved. The parse also cannot go false-green: raising the stated threshold trips the total-count assertion, lowering it trips the kept-count one.

**Both new scoped `none` decisions are honest.** The lean-profile enumeration in the always-loaded file describes this repo's document-profile config, not the chain, so a chain-derived assertion there would fail on a correct config change — and its count word is covered anyway, since that site is one of the two the minimum-sites guard demands. The sprint skill's routing restatement is descriptive, its only checkable slice (the target token set) is asserted at the authoritative site, and a presence check on hardcoded phase names would not catch the named failure mode, a wrong branch condition.

**Also verified.** The friction assertion matches the post-narrowing mechanism: the rule states the writer once and all eleven workflows carry the reference verbatim with no restatement, so the assertion pins a plan-mandated invariant rather than a hypothetical. The suite-count claim checks out — exactly 136 top-level registrations, matching the recorded drop from 137. The version-bump `none` is truthfully owned downstream, with the manifest still at the pre-bump value and the plan carrying the bump as a `pr`-phase DoD item. No stub was closed this sprint and no in-code sprint marker exists in any scoped file. No manual-verification request is warranted: all three advisory rows are correctly deferred to `retro`, downstream of this gate, so none blocks DoD.

## Verdict

APPROVE

## Escalations

None.

## Coverage ledger

```json
{"manifest_digest":null,"findings":[],
"files":[{"i":".asd/migrations/6.0.0.js","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/workflows/asd-phase-retro.md","s":"checked"},{"i":"AGENTS.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],
"rules":[{"i":"RS-1-check-ladder-risk-fit","s":"pass"},{"i":"RS-2-removal-reason-validity","s":"pass"},{"i":"RS-3-no-test-decision-honesty","s":"pass"},{"i":"RS-4-fail-first-regression-proof","s":"pass"},{"i":"RS-5-meaningfulness-and-determinism","s":"pass"},{"i":"COV-1-ac-coverage","s":"pass"},{"i":"EDGE-1-edge-cases-on-core-paths","s":"pass"},{"i":"STUB-1-stub-resolution","s":"n/a","p":"no stub closed by this sprint and no in-code sprint marker in any scoped file"},{"i":"MAN-1-manual-verification-necessity","s":"n/a","p":"manual rows are advisory and executable only downstream of this gate, at retro"}],
"sections":[{"i":"test-plan/risk-check-decisions","s":"reviewed"},{"i":"test-plan/removed-tests","s":"reviewed"},{"i":"test-plan/added-tests","s":"reviewed"},{"i":"test-plan/suite-run","s":"reviewed"},{"i":"test-plan/defects","s":"reviewed"},{"i":"test-plan/manual-verification","s":"reviewed"}]}
```
