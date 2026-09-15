[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: 1 (part 2 of 2)
- **Manifest**: [testing.part-2.manifest.json](testing.part-2.manifest.json)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| TST-2-1 | medium | `tests/run.js:2905-2907`, `tests/run.js:4495-4496`; `test-plan.md:34`, `:38` | AC-13 regression guard gap: the removed-key sweep drops every key `t_state.json` still carries (`frozenInState`), so `documents.c4` (same dotted name as the frozen state field) is never a needle. The remaining asd-init asserts (:4495 checks `diagram_tool` placement, :4496 `includes('likec4')`) do not assert absence, so a step 13/14 re-keyed on `documents.c4` would pass — the exact risk in `test-plan.md` row :38. HEAD is clean today; the gap is the guard. | Assert `!seed.includes('documents.c4')` in steps 13 and 14; in the sweep, collect `documents.c4` hit lines and `deepStrictEqual` them against the expected frozen-state reader lines. |
| TST-2-2 | medium | `tests/run.js:2912` | The `legacy` exemption (`if (/legacy/i.test(line)) return`) skips whole one-line paragraphs — at least 13 canon lines (`sprint-lifecycle.md` :9, :155, :169, :287, :334, :338, :345, :348; one each in `asd-phase-scope.md`, `asd-phase-pr.md`, `asd-phase-audit.md`, `checkpoints.md`, `artifact-layout.md`), including former reader paragraphs. Any removed key re-added there stays green; only :155 (`skip_design_phases`) and :345 (`scoped_fan_out`) legitimately hold a needle today. | Collect `rel:line:needle` hits on exempted lines and `deepStrictEqual` them against the two expected entries (a new hit or an empty set fails), or narrow the skip to the sentence containing "legacy". |

Checked with no finding (condensed): defect-stalemate unit cases (line shift incl. `:40:7`, backticks, escaped pipe, order, ids, CRLF, sub/superset, each identity field, `impl-review` rows, 9→10 order, empty table, template, missing section/column, unescaped pipe); D-1 test and its fail-first proof replayed by hand (symptom matches verbatim; §17 evidence shape present); CLI exit contract; 9.0.0 migration fixture pair, LF and CRLF+BOM, idempotence, mapping rows, skip shapes; rewritten hook/audit-exit/preflight/emit-manifest tests; 203 declarations = 203/203; fixture byte-identical to `t_config.yaml`; no open stubs; no manual verification needed; zero-dependency kept. No shell available: reviewed on-disk files at HEAD.

## Coverage ledger

```json
{"manifest_digest":"cf0b9cc7df35b53ba8db3ce13921778caa8d1ed00224851bcfb942350eb29bbe","findings":["TST-2-1","TST-2-2"],"files":[{"i":".asd/templates/t_audit.md","s":"checked"},{"i":".asd/templates/t_config.yaml","s":"checked"},{"i":".asd/templates/t_retrospective.html","s":"checked"},{"i":".asd/templates/t_state.json","s":"checked"},{"i":".asd/templates/t_subsystems.md","s":"checked"},{"i":".asd/templates/t_test-plan.md","s":"checked"},{"i":".asd/workflows/asd-phase-audit.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-promote.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-design.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-test.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked"},{"i":".asd/workflows/asd-phase-pr.md","s":"checked"},{"i":".asd/workflows/asd-phase-retro.md","s":"checked"},{"i":".asd/workflows/asd-phase-scope.md","s":"checked"},{"i":"AGENTS.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/fixtures/migrations/9.0.0/t_config-8.0.0.yaml","s":"checked"},{"i":"tests/fixtures/migrations/9.0.0/t_config-9.0.0.yaml","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Rule-set conformance","s":"finding","f":"TST-2-2"},{"i":"Coverage","s":"finding","f":"TST-2-1"},{"i":"Edge cases","s":"pass"},{"i":"Stub-resolution verification","s":"pass"},{"i":"Manual verification (last resort)","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```
