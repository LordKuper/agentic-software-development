[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| TST-1 | medium | `tests/run.js` (no check); `test-plan.md:40`; AC-2, AC-3 | Per code-style.md §17 every AC must have a check at some level; AC-2 and AC-3 have none. `tests/run.js` checks none of these: the floor counter is the current wave's (`review-policy.md:16`); the next wave starts in the same entry with no impl/impl-test between, and K = n goes to the terminal suite (`asd-phase-impl-review.md:52`); the terminal suite runs once, after the last wave; the return contract carries `WAVE: <K>` (:100). The AC-1 division decisions-log entry (:87) and AC-4's "iteration 2+ covers changed files whichever wave they were divided into" are unchecked too. | Add one static contract test pinning: the review-policy floor names the wave counter and a per-wave cap; step 8 sends K<n to wave K+1 with no impl/impl-test between and K=n to step 9; the return contract carries `WAVE: <K>`; the division decisions-log artefact line exists. Add a test-plan row for it. |
| TST-2 | low | `test-plan.md:40`; `tests/run.js:5405` | Two records claim more than the tests check. (a) The `none` reason for wave sequencing says "literals are pinned by the static checks", but no D5 literal is pinned. (b) The test title at :5405 says "every reader of the counter uses the per-wave form", yet it does not check the severity-floor or State-recovery readers that AC-6 lists. | After TST-1, name the pinning test in the row, or give `none` a true reason. Either add the floor and State-recovery reader checks or narrow the test title. |
| TST-3 | low | `tests/run.js:3053-3055`; AC-1 | The boundary test reads the cap from `runtime.MAX_REVIEW_WAVES` and asserts only `cap >= 2`. Changing the constant to 4 or 5 would still pass, even though AC-1 and README:167 say "up to 3". | Assert `runtime.MAX_REVIEW_WAVES === 3`, or derive the README/skill "up to N" from the constant and assert they match. |

## Coverage (internal reviewers only)

- Removals are justified: they fall under the decisions-log pre-authorisation, and each removed assertion's only subject was a removed mechanism.
- Every added logic test records a fail-first proof: a targeted mutation, restored with `cp` and verified with `cmp`.
- The tests are deterministic: git fixtures run with isolated config, and nothing depends on timing, randomness or order.
- AC-5, AC-7 and AC-8, plus the runtime parts of AC-1, AC-4 and AC-6, are each checked at the right level.
- Manual verification: none specified, none needed.

Ledger: [testing.manifest.json](./testing.manifest.json)

```json
{"manifest_digest":"157d7a15f6c39706d11c147dde24e68ebc43f7d73b1b0ddff5f6f421eec7447b","findings":["TST-1","TST-2","TST-3"],"files":[{"i":"tests/run.js","s":"checked"},{"i":".asd/sprints/017-review-waves/test-plan.md","s":"checked"}],"rules":[{"i":"Rule-set conformance","s":"finding","f":"TST-2"},{"i":"Coverage","s":"finding","f":"TST-1"},{"i":"Edge cases","s":"finding","f":"TST-3"},{"i":"Manual verification (last resort)","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```

## Verdict
CONCERNS: 3

## Next action
impl review-fix, then impl-test, then wave-1 again: TST-1, TST-2, TST-3.
