[REVIEW-impl-testing]: CONCERNS

# Review — testing (part 1 of 2)

- **Phase**: impl-review
- **Iteration**: 1
- **Manifest**: [testing.part-1.manifest.json](testing.part-1.manifest.json)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| TST-1-1 | low | `.asd/rules/external-review.md:110`; `test-plan.md` row "External Review batching loop, n/m accounting, stalemate over verdict iterations only" | The row's `none` reason fits batching and n/m but not "partial and skip iterations are skipped" in stalemate comparison, which the phase skill (not the agent) executes and no row pins; a workflow comparing against a partial iteration would miss a stalemate (review cap still bounds the loop). | Correct the reason (phase skill executes; `external-review.md` "Stalemate detection" sole home, both workflows cite it) or assert the clause survives. |
| TST-1-2 | low | `.asd/runtime.js:315-317` (`isTemplated`); `tests/run.js:4171-4172` | Unit test fixture `templates: ['plan.md']` asserts nested `src/AGENTS.md` is not templated; with real `templateNames` (`AGENTS.md`, `CLAUDE.md`, … present) the basename rule marks it templated, so the root-only clause never changes the result and the AC-4 row's "boundary non-match" is false in production (fails safe). | Decide the rule; either drop `src/AGENTS.md` from non-matches and simplify, or exclude root-file names from the basename match; pin via real `templateNames` output. |

## Coverage

```json
{"manifest_digest":"6536f307421b55f1bb2b301691975bdb50d84133e977b21d0e7bc04a80268659","findings":["TST-1-1","TST-1-2"],"files":[{"i":".asd/agents/asd-dev.md","s":"checked"},{"i":".asd/agents/asd-external-review.md","s":"checked"},{"i":".asd/agents/asd-reviewer-testing.md","s":"checked"},{"i":".asd/agents/asd-tester.md","s":"checked"},{"i":".asd/hooks/session-start.js","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/artifact-layout.md","s":"checked"},{"i":".asd/rules/checkpoints.md","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/git-strategy.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"}],"rules":[{"i":"Rule-set conformance","s":"finding","f":"TST-1-1"},{"i":"Coverage","s":"pass"},{"i":"Edge cases","s":"finding","f":"TST-1-2"},{"i":"Stub-resolution verification","s":"pass"},{"i":"Manual verification (last resort)","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```
