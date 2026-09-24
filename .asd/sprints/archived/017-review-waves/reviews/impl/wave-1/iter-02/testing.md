[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| TST-1 | medium | `tests/run.js:5210-5212`, `:5377`; `test-plan.entry-02.md:18` (EFF-2; AC-8) | The row's second risk, a stale patch served for a changed range, is unchecked. No test emits two different lists or ranges into one out dir, which is where skip-on-exist could serve stale content. So a mutation that drops paths or range from the fingerprint survives. Separately, :5377's `documentation.diff` absence check can no longer fail, now that diffs are fingerprint-named. | In one shared out dir, emit two differing lists and assert distinct `.diff` files, each holding only its own headers; emitting the same list twice must leave exactly one. Replace :5377 with an assertion that no `*.diff` exists. Record a mutation proof. |
| TST-2 | medium | `tests/run.js:3097`; `test-plan.entry-02.md:15` (COR-1; AC-1) | The COR-1 cap rests on the hardcoded `[7000, 2, 2]`, which proves the cap only while threshold < 3500. If the threshold is tuned, the mutation proof goes vacuous. The single-file edge case is also missing. | Use `[2*threshold+1, 2, 2]` and add `[threshold+1, 1, 1]`. |
| TST-3 | medium | `tests/run.js:5530-5531` vs `:5521-5522`; `test-plan.entry-02.md:22,24` (AC-2) | The TST-1 test duplicates the D3/D4 test's two severity-floor regexes, and the D3/D4 test is a strict superset. §17 says duplicates are deleted. | Delete :5530-5531 and amend the entry-02 TST-1 row. |

## Coverage (internal reviewers only)

What passed:
- Entry 4's `none` row is honest: fail-first is recorded and the bijection test exists.
- The COR-4 memory sweep has its proof.
- The entry-2 fixed-defect tests each have mutation proofs.
- AC-1..AC-8 each have a behavioural check.
- No manual verification is needed.

Ledger: [testing.manifest.json](./testing.manifest.json)

```json
{"manifest_digest":"4b900fb540366d812779c812cc3d4c907e3e899d3f366bc4134ae337b8960053","findings":["TST-1","TST-2","TST-3"],"files":[{"i":"tests/run.js","s":"checked"},{"i":".asd/sprints/017-review-waves/test-plan.md","s":"checked"},{"i":".asd/sprints/017-review-waves/test-plan.entry-01.md","s":"checked"},{"i":".asd/sprints/017-review-waves/test-plan.entry-02.md","s":"checked"},{"i":".asd/sprints/017-review-waves/test-plan.entry-03.md","s":"checked"}],"rules":[{"i":"Rule-set conformance","s":"finding","f":"TST-3"},{"i":"Coverage","s":"finding","f":"TST-1"},{"i":"Edge cases","s":"finding","f":"TST-2"},{"i":"Manual verification (last resort)","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```

## Verdict
CONCERNS: 3

## Next action
impl review-fix tester chain: TST-1..TST-3.
