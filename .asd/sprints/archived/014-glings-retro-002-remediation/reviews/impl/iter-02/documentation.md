[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 2 (floor medium)
- **Manifest**: [documentation.manifest.json](documentation.manifest.json)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| DOC-1 | medium | `.asd/rules/git-strategy.md:15`; binding `.asd/workflows/asd-phase-impl.md:66` | One `ASD-Task` line per covered id includes "a review finding id", and reconstruction matches ids (`sprint-lifecycle.md:342`), but canon never defines a review finding id's form: report templates number rows per file, and the review-fix payload carries severity/location/description without an id. The file-plus-number convention lives only in the sprint's decisions log. | Define the id once in `git-strategy.md` "Commits" (the ledger finding id, or `<reviewer>.md #N` for a row without one) and add it to the review-fix payload in `asd-phase-impl.md` step 6. |

## Coverage

```json
{"manifest_digest":"a3d5746eefa8ad08e29b1391ff03b37015baa9e45e1343f0732cbdc25ae073df","findings":["DOC-1"],"files":[{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/git-strategy.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"},{"i":".asd/skills/asd-sprint/SKILL.md","s":"checked"},{"i":".asd/templates/external-review/t_review-report.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-test.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"SSoT","s":"pass"},{"i":"Template adherence","s":"pass"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"finding","f":"DOC-1"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```
