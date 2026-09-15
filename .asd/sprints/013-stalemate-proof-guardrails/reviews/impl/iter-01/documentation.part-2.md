[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 1 (part 2 of 2)
- **Manifest**: [documentation.part-2.manifest.json](documentation.part-2.manifest.json)

## Findings

| ID | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| DOC-1 | high | `tests/run.js:2906` | In-body comment `// ponytail: a bare leaf is searched only when it carries _; ...` inside new test `sprint-013 AC-13..AC-18/AC-20`. `code-style.md` §7 bans in-body comments except the `// TODO(sprint-<NNN-slug>): <reason>` marker, and `AGENTS.md` applies it to `tests/run.js`. Only in-body comment in a sprint-013 test. | Move the meaning into code (e.g. a named predicate `const searchedBare = (name) => name.includes('_')`, or a name for the `needles` derivation carrying the dotted-vs-bare rule), then delete the comment. |
| DOC-2 | low | `README.md:223` | Rewritten fan-out paragraph cites `review-policy.md` "Diff-scoped impl-review fan-out" "for the SSoT", but that section (`review-policy.md:177`) names `asd-phase-impl-review.md` step 5 as the SSoT. | Point README at `asd-phase-impl-review.md` step 5, or drop "for the SSoT". |
| DOC-3 | low | `README.md:155` | README says stalemate is "two consecutive impl-test entries routing the same defect set"; the rule (`sprint-lifecycle.md:243`) and `defectStalemate` compare the last two impl-test entries that routed defects (`tests/run.js:4575`: a green entry in between does not reset). | Reword to "the last two impl-test entries that routed defects routing the same set (compared by `node .asd/runtime.js defect-stalemate`) escalate `FAILED: stalemate`". |

Checked and consistent (condensed): stalemate rule vs impl-test step 9 and impl.md pointer; `t_test-plan.md` Entry column / identity lock / `accepted-debt` / proof cell; audit step 2, 3b vs "Audit phase" and hard list, `t_audit.md` Contradictions; retro order and `Guardrail`/`Home`; `t_config.yaml` 20 settings = migration fixture; `t_state.json`; collapse at audit exit + fallbacks; scope audit values; `platform` in payloads; pr `gh` failure path; README schema/folder map/pr/audit/FAQ/gh prerequisite; `AGENTS.md` managed block = `t_AGENTS.md`, tail updated. No shell available: files read at HEAD f400f3a.

## Coverage ledger

```json
{"manifest_digest":"16ef176e3d494a822edb338085d06bbdb565cabd9b7938476f51c2fbae4ad587","findings":["DOC-1","DOC-2","DOC-3"],"files":[{"i":".asd/templates/t_audit.md","s":"checked"},{"i":".asd/templates/t_config.yaml","s":"checked"},{"i":".asd/templates/t_retrospective.html","s":"checked"},{"i":".asd/templates/t_state.json","s":"checked"},{"i":".asd/templates/t_subsystems.md","s":"checked"},{"i":".asd/templates/t_test-plan.md","s":"checked"},{"i":".asd/workflows/asd-phase-audit.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-promote.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-design.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-test.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked"},{"i":".asd/workflows/asd-phase-pr.md","s":"checked"},{"i":".asd/workflows/asd-phase-retro.md","s":"checked"},{"i":".asd/workflows/asd-phase-scope.md","s":"checked"},{"i":"AGENTS.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/fixtures/migrations/9.0.0/t_config-8.0.0.yaml","s":"checked"},{"i":"tests/fixtures/migrations/9.0.0/t_config-9.0.0.yaml","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"SSoT","s":"finding","f":"DOC-2"},{"i":"Template adherence","s":"pass"},{"i":"HTML shell wrapping","s":"pass"},{"i":"Provenance","s":"pass"},{"i":"Traceability","s":"pass"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"finding","f":"DOC-1"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"finding","f":"DOC-3"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```
