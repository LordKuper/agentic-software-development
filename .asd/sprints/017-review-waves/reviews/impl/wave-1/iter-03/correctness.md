[REVIEW-impl-correctness]: APPROVE

# Review — correctness

- **Phase**: impl-review
- **Iteration**: wave-1/iter-03

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings | — |

Checked, all passing:
- `writeManifestDiff` always rewrites, with a per-process `.tmp` and a rename; there is no handle leak.
- The "Scope hand-off" item 2 wording matches the code.
- The `.late.md` artefact line cites an SSoT that covers both cases.
- The new tests are correct: the wave-count cases, the shared-dir distinct diffs, the COR-1 same-name rewrite and the DOC-2 sweep.
- The removed duplicate floor asserts are still covered at `tests/run.js:5553-5554`.
- The memory line matches the hand-off contract, and every change traces to AC-1/4/5/6/7/8.

One note below the floor: a failed `runGit` can leave a per-pid `.tmp` behind (low).

## Coverage (internal reviewers only)

Ledger: [correctness.manifest.json](./correctness.manifest.json)

```json
{"manifest_digest":"19e32831757d5a07545941b939f9b39709468cacf17269110428f8d4c2c03763","findings":[],"files":[{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".claude/agent-memory/asd-external-review/reference_codex-invocation.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"pass"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"pass"},{"i":"Best practices [impl-review]","s":"pass"},{"i":"AC coverage trace [impl-review]","s":"pass"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"}]}
```

## Verdict
APPROVE

## Next action
None; eligible for the APPROVE latch.
