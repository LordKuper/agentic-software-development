[REVIEW-impl-documentation]: CONCERNS

# Review — documentation (part 1 of 2)

- **Phase**: impl-review
- **Iteration**: 1
- **Manifest**: [documentation.part-1.manifest.json](documentation.part-1.manifest.json)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| DOC-1 | medium | `.asd/runtime.js:22` (`SURFACE_CAP_FILES` doc comment) | Second sentence "set at sprint 014 plan against ASD sprints 001-013 (max 87 files) and Glings 002 (657)" references sprint history — `code-style.md` §8 bans project-document/sprint references in code comments (no framework exemption); the rationale already lives in plan and decisions log. | Keep "… approves an override bound. Four split parts (4 * SPLIT_THRESHOLD_FILES)."; delete the sprint-history clause. |
| DOC-2 | medium | `.asd/rules/review-policy.md:131-133` (Gate Verdict Format grammar) vs `.asd/agents/asd-external-review.md:126`, `.asd/rules/external-review.md:46` | Verdict-token mirror broken: External Review's first line may now be `APPROVE (partial: <n>/<m> files; <cause>)`, but the grammar block still allows only `<APPROVE \| CONCERNS \| FAIL>`; a parser applying it rejects a valid partial return. | Under the grammar block add one line: External Review's first line may also be the partial form, per `external-review.md` "Outcome contract" (link, no restatement). |
| DOC-3 | medium | `.asd/rules/git-strategy.md:15`; `.asd/rules/sprint-lifecycle.md:342`; `.asd/agents/asd-tester.md:25` | (a) Tester commits always need the trailer, but the id list has no id for impl-review step 9's in-place test fix. (b) Reconstruction's `':!.asd/sprints/**'` pathspec hides an impl-test entry whose only commit is `test-plan.md`, so it reads as not landed and is re-dispatched. | (a) Add an id for the impl-review suite test fix (e.g. `impl-review iter-NN suite`) or scope the trailer to impl/impl-test. (b) Keep `<sprint>/test-plan*.md` visible in the pathspec, or read trailers without pathspec and ignore trailer-less commits. |

## Coverage

```json
{"manifest_digest":"c63b0e4fc60a66a9028b722862be0a333e80adb09a34501207abcb17ad0dc101","findings":["DOC-1","DOC-2","DOC-3"],"files":[{"i":".asd/agents/asd-dev.md","s":"checked"},{"i":".asd/agents/asd-external-review.md","s":"checked"},{"i":".asd/agents/asd-reviewer-testing.md","s":"checked"},{"i":".asd/agents/asd-tester.md","s":"checked"},{"i":".asd/hooks/session-start.js","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/artifact-layout.md","s":"checked"},{"i":".asd/rules/checkpoints.md","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/git-strategy.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"}],"rules":[{"i":"SSoT","s":"pass"},{"i":"Template adherence","s":"n/a","p":"evidence outside this part; covered by the other parts"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"finding","f":"DOC-3"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"finding","f":"DOC-1"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"finding","f":"DOC-2"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```
