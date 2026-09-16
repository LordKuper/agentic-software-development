[REVIEW-impl-testing]: CONCERNS

# Review — testing (part 2 of 2)

- **Phase**: impl-review
- **Iteration**: 1
- **Manifest**: [testing.part-2.manifest.json](testing.part-2.manifest.json)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| TST-2-1 | medium | `tests/run.js:4271-4272`; `.asd/workflows/asd-phase-impl-review.md:23`; `.asd/workflows/asd-phase-design-review.md:22`; `test-plan.md` AC-4 row | Assert message claims `--self-hosting` is "a boolean both review workflows pass", but no test checks either workflow passes the flag. Deleting the clause from both workflows leaves every AC-4 assert green; a self-hosting repo would then stamp `n/a: self_hosting not enabled` on Documentation's Framework mode and `validate-ledger` accepts it — fails open. AC-4 row does not name this risk. | In the CLI test's loop over both workflows (`tests/run.js:4212`) assert each workflow names `self_hosting: enabled` and `--self-hosting` with its `emit-manifest` step, taking the flag token from `review-policy.md:101` `[--self-hosting]`; name the risk in the AC-4 row. |
| TST-2-2 | medium | `tests/run.js:4758-4795`; `.asd/skills/asd-sprint/SKILL.md:26`; `test-plan.md` AC-7 rows | AC-7 test never checks **when** rotation happens: the `state.json.phase`-differs condition and "resume or re-run never rotates" (decisions log), and "never when resuming an interrupted current entry" (test plan). Removing the condition stays green; a resume would then rotate away the routing line (State recovery loses its anchor, fails open) and reset the interrupted-attempt count. AC-7 rows don't name this risk. | Assert the decisions-log Rotation paragraph keeps the `state.json.phase` condition and the resume-never-rotates sentence naming its within-phase readers; assert the test-plan paragraph keeps the resume carve-out citing `asd-phase-impl-test.md` step 1; record the risk in the AC-7 row. |

Pointer for part 1 (no finding): nothing checks `sprint-lifecycle.md` "State recovery" names the partial form `pr` reads as satisfied; a miss fails closed.

## Coverage

```json
{"manifest_digest":"f715b93b9bda803a45d1854f3743719538b3e7d3d79a758fbd85149bc63442c3","findings":["TST-2-1","TST-2-2"],"files":[{"i":".asd/skills/asd-sprint/SKILL.md","s":"checked"},{"i":".asd/templates/external-review/t_review-report.md","s":"checked"},{"i":".asd/templates/t_decisions-log.md","s":"checked"},{"i":".asd/templates/t_plan.md","s":"checked"},{"i":".asd/templates/t_test-plan.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-test.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked"},{"i":".asd/workflows/asd-phase-plan.md","s":"checked"},{"i":".asd/workflows/asd-phase-pr.md","s":"checked"},{"i":".asd/workflows/asd-phase-retro.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Rule-set conformance","s":"finding","f":"TST-2-1"},{"i":"Coverage","s":"finding","f":"TST-2-2"},{"i":"Edge cases","s":"pass"},{"i":"Stub-resolution verification","s":"pass"},{"i":"Manual verification (last resort)","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```
