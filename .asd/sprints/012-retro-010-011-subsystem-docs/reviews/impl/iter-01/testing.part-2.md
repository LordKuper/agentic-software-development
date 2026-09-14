[REVIEW-impl-testing]: CONCERNS

# Review — testing (part 2 of 2)

- **Phase**: impl-review
- **Iteration**: 1
- **Evidence**: [manifest](./testing.part-2.manifest.json) · ledger below

I had no shell, so I built the diff by reading the files directly. I checked the reported suite numbers by arithmetic:
- `tests/run.js` has 197 top-level `test(` declarations, which matches "197 passed".
- 187 + 10 new tests = 197, which matches the pre-strategy run of 186/187 at `8fa5d97`.

I replayed the recorded mutations that hit files in my part by hand, against each test's assertion order. Each one fires the assertion the transcript names:
- the design-review hand-stamp mutation
- the impl-review attempt-record mutation
- `emit-manifests` (it fires in two tests)
- `Flagged decisions:`
- `mode runs it too`
- the README tree mutation
- reserved ids missing `c4`
- `t_subsystem.md` missing `excludes:`
- asd-init `Also:`

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| TST-2-1 | low | `tests/run.js:4392-4393` (`sprint-012 AC-14..AC-18` test; AC-14, AC-16; `test-plan.md` row 38) | The seed assertion's message says asd-init "must seed c4/ only under the documents.c4 condition, **while the registry seed precedes it unconditionally**". The code only checks `seed.indexOf('c4/model') > seed.indexOf('documents.c4')`. The sites loop at :4341 only checks that step 13 names `docs/architecture/subsystems.md`, not where. So a mutation that moves the condition ahead of the registry sentence stays green. Example: `13. Only if documents.c4 is also enabled: if decomp enabled: write an empty registry …`. That puts the registry back behind `documents.c4`, which is the coupling this sprint removes (AC-16: "subsystems are still registered through AC-14"). The message claims a property the code does not check. Audit backfill (AC-17) limits the damage, so severity is low. | Add the missing half to the same assert: `seed.indexOf(registry) !== -1 && seed.indexOf(registry) < seed.indexOf('documents.c4')`. `registry` is already in scope from :4329. Record the reorder mutation in "Added tests". |
| TST-2-2 | low | `tests/run.js:4187` (`runtime.js CLI: emit-manifest writes one stamped manifest per part …`; AC-12; `test-plan.md` row 28) | Both review workflows call `emit-manifest` with `--custom-rules <path,path>` (`asd-phase-impl-review.md` step 6, `asd-phase-design-review.md` step 7). `emitManifestCommand` splits that value on commas and reads each file (`.asd/runtime.js:360,366`). No test reaches this path through the CLI. The end-to-end test omits the flag, and unit tests only pass the `customRules` object. Row 28 names the risk of a boolean flag swallowing the next argument, but only covers it for `--scoped-fan-out`. If `--custom-rules` stops parsing, every manifest loses its custom-rule ids and the perf-budgets input, and every ledger still validates. Nothing is broken today: this iteration's emitted manifests carry both custom-rule ids. The finding is the missing guard. | In the existing CLI test, pass `--custom-rules` with two temp files and assert both paths appear in `rules` in the same order. Alternatively, record a scoped `none` in row 28 with its reason. |

## Coverage

Coverage JSON is in the block below. Notes on the rows:
- **Stub-resolution verification:** passes. `.asd/project/stubs.md` has no rows, and there are no `TODO(sprint-` markers outside docs.
- **Manual verification:** passes. `test-plan.md` specifies none, and no UI surface is in scope.
- **Custom rules:** passes. The tests use only `fs`/`path`/`assert`/`child_process`, with no YAML dependency. The canon edits sit alongside their re-rendered views (the `sync.js --check` test is kept in row 40).
- **Rule-set conformance and determinism:** the `none` rows 29, 41 and 42 hold up:
  - I checked that the mermaid draft path `c4-full/subsystems.md` is consistent across `asd-phase-design.md`, `asd-architect.md`, `sprint-lifecycle.md` and `t_prompt-external-design.md`.
  - Only the architect writes and reads that exact filename; design-review and external review work on the `c4-full/` folder and `<sprint>/design/**`.
  - The dropped "partial ledger vs unpartitioned manifest" assert does duplicate `missing row` (`tests/run.js:2253`).
  - Fixtures use `mkTempDir`, with no timing or ordering dependence.
- **Rubric rows in this part:** I resolved every rubric row here as `pass` or `finding` instead of the out-of-part `n/a`, because `tests/run.js` and the workflow and template surfaces it exercises are in this part (union property (c)).

## Verdict
CONCERNS: 2

## Next action
Route both findings to `asd-tester` in review-fix mode, since both are located in test files. TST-2-1 needs one clause added to an existing assert. For TST-2-2, either extend the CLI test or record a scoped `none` in `test-plan.md` row 28.

## Escalations (optional)
None.

```json
{"manifest_digest": "b4e9b76a308bf5f541d7b84a4096a3c1219ea6d0c45f0ce2e4da3c8ab874764e", "findings": ["TST-2-1", "TST-2-2"], "files": [{"i": ".asd/templates/t_audit.md", "s": "checked"}, {"i": ".asd/templates/t_config.yaml", "s": "checked"}, {"i": ".asd/templates/t_plan.md", "s": "checked"}, {"i": ".asd/templates/t_subsystem.md", "s": "checked"}, {"i": ".asd/templates/t_subsystems.md", "s": "checked"}, {"i": ".asd/templates/t_subsystems.yaml", "s": "checked"}, {"i": ".asd/templates/t_test-plan.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-audit.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-design-promote.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-design-review.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-design.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-impl-review.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-impl.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-plan.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-dev-critical/project_sync-apply-ledger-gotcha.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-tester-critical/project_testability-envelope.md", "s": "checked"}, {"i": ".gitignore", "s": "checked"}, {"i": "AGENTS.md", "s": "checked"}, {"i": "README.md", "s": "checked"}, {"i": "tests/run.js", "s": "checked"}], "rules": [{"i": "Rule-set conformance", "s": "finding", "f": "TST-2-1"}, {"i": "Coverage", "s": "finding", "f": "TST-2-2"}, {"i": "Edge cases", "s": "pass"}, {"i": "Stub-resolution verification", "s": "pass"}, {"i": "Manual verification (last resort)", "s": "pass"}, {"i": ".asd/project/custom-common-rules.md", "s": "pass"}, {"i": ".asd/project/custom-coding-rules.md", "s": "pass"}], "sections": []}
```
