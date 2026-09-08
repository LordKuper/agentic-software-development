[REVIEW-impl-testing]: APPROVE

# Review — testing

- **Phase**: impl-review
- **Iteration**: 5 (severity floor: critical)

## Findings

No finding at or above the critical floor.

## Dropped below floor (6, counted: 2 high, 2 medium, 2 low)

Two are worth naming. The reformulated tool-grant assertion is evadable by a non-enumerated false claim ("this reviewer has a Write grant"), which the token ban it replaced would have caught — recorded as a replacement without naming that residual class. And the anti-restatement half of the AC-15 read-only test guards only `providers.md`, while the same delta added citing or restating variants to both `*-review` workflows, `sprint-lifecycle.md` and `README.md`, none of which carry a risk→check row — against the entry's claim that AC-15's landed changes were each given one.

## Verified this iteration

**The four removals are a retirement, not a coverage regression**, and the record says so: the three `derived_handoff` tests had no surviving subject, and the fourth's removal is argued from mechanism — the hook reads only named keys with no schema validation, so "tolerates an unknown key" is trivially true by construction and no requirement backs a generic version. **The reformulated T-2 assertion** does fail on the named false-claim class in any casing, and no longer reds a correct negative sentence. **The three AC-15 tests**: the non-Latin-script guard pins a real mechanical contract and its scope decision is recorded honestly as a residual in three places rather than silently narrowed. **Entry log**: nine rows chain without a gap; the bookkeeping-only entries say so with the delta enumerated; entry 8's counts agree with the decisions log byte-for-byte, and its own prior-round overstatement is corrected in place. **Determinism**: all added tests are pure file reads and regex comparison against the repo root — no time, network, randomness, ordering or subprocess dependence. **Stub-resolution and manual verification** verified rather than accepted.

## Coverage

Validated compact ledger: [`testing.ledger.json`](./testing.ledger.json) against immutable manifest [`testing.manifest.json`](./testing.manifest.json), findings [`testing.findings.json`](./testing.findings.json). `node .asd/runtime.js validate-ledger` → `{"ok":true}`. 14/14 files, all rules and all sections resolved; `ac-4` and the section predicates verified against source rather than accepted.

## Verdict

APPROVE

## Next action

Reviewer done for this iteration.

## Escalations

None.
