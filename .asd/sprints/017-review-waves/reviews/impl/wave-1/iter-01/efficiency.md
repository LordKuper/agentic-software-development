[REVIEW-impl-efficiency]: CONCERNS

# Review — efficiency

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01

## Findings

| # | Severity | Category | Location | Description | Suggested fix |
|---|---|---|---|---|---|
| EFF-1 | low | simplify | `asd-phase-impl-review.md:25,38`; `runtime.js:538` `manifestRanges`, `:568` `rangePatchInvocations` | At wave iteration 1, `--full-base` and `--base` are both `<base_branch>`, so the "wider range" is not wider. The two-list path costs two lists, an extra flag pair, a duplicate `rangeRenames` git run and a split patch, and gains nothing. `--full-files` does real work only for External's carried-over Unreviewed files at iteration 2+. | At iteration 1, pass one union list as `--files` with `--base <base_branch>`. Keep `--full-files/--full-base` only for External's iteration-2+ carry-over, and trim the matching canon wording. |
| EFF-2 | medium | simplify | `runtime.js:594` `writeManifestDiff`, `:622-639`, `:607-615` | Each emit writes its own byte-identical `.diff`. Correctness, Efficiency and Documentation (and External) share one list and one range, so this iteration holds about 1.2 MB of committed duplicates in immutable sprint archives. That grows with reviewers × iterations × waves, and each emit re-runs the same git calls. | Name the diff by its inputs (a fingerprint of files + ranges/snapshot), skip the write when that file already exists, and return its path as now. |
| EFF-3 | low | simplify | `runtime.js:445` `draftSnapshot`, `:437` `snapshotCopyPath` | `snapshot.json` hashes and the `snapshot/` copies are two records of one snapshot. | Derive changed drafts by comparing against `<prev iter dir>/snapshot/<path>`, treating a missing copy as changed. Then drop `snapshot.json`, and `--previous` takes the previous iteration dir. |
| EFF-4 | low | simplify | `tests/run.js:5100-5103`, `:5198-5201` (new); `:5022-5025`, `:5335-5338` | There are now four copies of the sandboxed-git fixture, and they have drifted (`:5338` lacks `core.autocrlf=false`). The two new tests each also hand-roll a `runtimeCli` try/catch wrapper. | Extract a `sandboxGitRepo()` factory and a `runtimeCliResult()` wrapper and use them in the four tests. |

Checklist scan: over-engineering (13 items) is clean, with every new helper called or reused. Structure/cohesion is clean, since `review-waves` joins the sizing cluster.

## Coverage (internal reviewers only)

Ledger: [efficiency.manifest.json](./efficiency.manifest.json)

```json
{"manifest_digest":"2b6a84fe10bfb29909a8b85c980389581d1d4715a811622e18e2e52cf31e3474","findings":["EFF-1","EFF-2","EFF-3","EFF-4"],"files":[{"i":".asd/agents/asd-dev.md","s":"checked"},{"i":".asd/agents/asd-external-review.md","s":"checked"},{"i":".asd/agents/asd-reviewer-correctness.md","s":"checked"},{"i":".asd/agents/asd-reviewer-documentation.md","s":"checked"},{"i":".asd/agents/asd-reviewer-efficiency.md","s":"checked"},{"i":".asd/agents/asd-reviewer-testing.md","s":"checked"},{"i":".asd/hooks/session-start.js","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/artifact-layout.md","s":"checked"},{"i":".asd/rules/checkpoints.md","s":"checked"},{"i":".asd/rules/core.md","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/git-strategy.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"},{"i":".asd/skills/asd-phase-impl-review/SKILL.md","s":"checked"},{"i":".asd/skills/asd-sprint/SKILL.md","s":"checked"},{"i":".asd/templates/external-review/t_prompt-external-design.md","s":"checked"},{"i":".asd/templates/external-review/t_prompt-external-impl.md","s":"checked"},{"i":".asd/templates/external-review/t_review-report.md","s":"checked"},{"i":".asd/templates/external-review/t_review-scope.json","s":"checked"},{"i":".asd/templates/t_friction-log.md","s":"checked"},{"i":".asd/templates/t_review.md","s":"checked"},{"i":".asd/templates/t_state.json","s":"checked"},{"i":".asd/templates/t_test-plan.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-test.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked"},{"i":".asd/workflows/asd-phase-plan.md","s":"checked"},{"i":".asd/workflows/asd-phase-pr.md","s":"checked"},{"i":".asd/workflows/asd-phase-retro.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"finding","f":"EFF-1"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"finding","f":"EFF-2"},{"i":"Algorithmic complexity [impl-review]","s":"pass"},{"i":"Regression detection [impl-review]","s":"pass"},{"i":"Hot path identification [impl-review]","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"reviewed"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"reviewed"},{"i":"Algorithmic complexity [impl-review]","s":"reviewed"},{"i":"Regression detection [impl-review]","s":"reviewed"},{"i":"Hot path identification [impl-review]","s":"reviewed"}]}
```

## Verdict
CONCERNS: 4

## Next action
impl review-fix: EFF-1..EFF-4. None adds an abstraction, layer or dependency.
