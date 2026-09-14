[REVIEW-impl-testing]: CONCERNS

# Review: testing

- **Phase**: impl-review
- **Iteration**: 1
- **Severity floor**: low
- **Evidence**: [manifest](./testing.manifest.json) · [ledger](./testing.ledger.json) · [findings](./testing.findings.json). `validate-ledger`: ok.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| TST-01 | low | `.asd/workflows/asd-phase-audit.md:7`; `tests/run.js:2840-2871`; `test-plan.md:29` (audit row), AC-3 | AC-3's skip write has three parts: `phase`, `skipped_phases`, and **one decisions-log line naming the setting**. The test pins only the first two (lines 2851-2856). The test-plan audit row does not decide on the third, and no `none` row covers it. The line matters because the explicit skip and the all-documents-disabled collapse leave identical state (`sprint-lifecycle.md:131`), so this log line is the only record of which one fired. The plan already pins the matching scope line for that reason (M20, `tests/run.js:2906`), and the audit row breaks that pattern without a reason. Deleting the clause keeps all 187 tests green. | Add one assertion after line 2856 in the existing sprint-011 AC-3 test (e.g. `exit.includes('decisions-log')`), and record it in the audit row with a mutation proof. If the line carries no real risk, add a single `none` row with an honest reason instead. |

## Coverage

The reviewer had no shell and reviewed by reading. It cross-checked the counts: there are 187 top-level `test(` declarations, and 3 of them are the sprint-011 tests (184 + 3). It replayed mutation proofs M2, M5, M10, M11 and M18 against the test bodies, and they match the recorded results.

- **Rule-set conformance** (pass):
  - The hook is exercised on real state fixtures, with the field name derived from `t_state.json`.
  - Prose sites get cross-reference static checks.
  - The `none`/`keep` rows are each single-item with sound reasons.
  - The tests are deterministic.
- **Coverage** (TST-01):
  - AC-1, AC-2 and AC-4 through AC-7 are traced to checks or justified `none` rows.
  - AC-3 is covered except for its decisions-log line.
- **Edge cases** (pass): absent, `false`, the unseeded placeholder, and another phase with the value `true` are all covered. "Setting wins over enabled documents" is pinned through the scope freeze.
- **Stub-resolution verification**: n/a. No stub is registered by this sprint.
- **Manual verification**: n/a. `test-plan.md` specifies none.

## Verdict
CONCERNS: 1

## Next action
`impl` review-fix mode. The fix touches only `tests/run.js` and the `test-plan.md` audit row, with a recorded mutation proof. The terminal full-suite gate covers it.
