[REVIEW-impl-efficiency]: CONCERNS

# Review — efficiency (part 2 of 2)

- **Phase**: impl-review
- **Iteration**: 1
- **Evidence**: [manifest](./efficiency.part-2.manifest.json) · ledger below

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| EFF-2-1 | low | `.asd/workflows/asd-phase-design-review.md:34` (step 7, internal-reviewer payload bullet), echoed at `:32` (correctness bullet) | **Category: simplify.** Rubric: Complexity-vs-value tradeoff. This sprint reworded the design-review "explicit allowed-section list" as "the sections its manifest does not authorize `n/a: outside phase gate`". That makes the list a second copy of data the reviewer already gets in its emitted manifest: `emit-manifest` computes the phase gate itself (`NA_PREDICATES.phaseGate`, exercised at `tests/run.js:4158-4167`). The same bullet then spells out the per-reviewer values again in a parenthetical ("Correctness = UI section only when… Efficiency = over-engineering + structure/cohesion + …"). So the orchestrator works out by hand what the runtime already worked out, in prose that can drift from `NA_TARGETS`. The impl-review payload (`asd-phase-impl-review.md:42`) sends no such list and relies on the manifest alone, which shows the extra channel is not needed. | Delete the allowed-section list and its parenthetical from the step 7 payload bullet, and the "its allowed-section list is empty" clause at `:32`. Keep the rule that impl-only sections never fire against drafts, as one line pointing at the manifest's `n_a` (`review-policy.md` "Coverage ledger"). Cross-part follow-up (files not in this part): the "Per-phase section gate" / Inputs bullets in `asd-reviewer-correctness.md` and `asd-reviewer-efficiency.md` should then say the gate comes from the manifest, not the payload. This is a deletion, not a new abstraction, so no escalation is needed. |

Checked and not raised:
- The advisory review-scope estimate in `asd-phase-plan.md` step 4 is required by AC-3 and was kept at the plan gate. Keep as is.
- The try/catch-into-`verdict` pattern in `tests/run.js` (3046-3062, 4106-4116) is a deliberate choice recorded in the tester's memory: the assert message carries the real error. It is not a reimplementation of `assert.throws` without added value.
- `tests/run.js:4377-4386` reads each canon file up to three times without caching. This is the test runner, not a hot path, and the cost is negligible. Below nitpick level.
- The new templates `t_subsystems.md` and `t_subsystem.md` are minimal: responsibility frontmatter, one table or two sections, and a conditional diagram block. No over-engineering.
- Structure/cohesion: no god type in the `tests/run.js` additions. Each new test covers one AC. Helpers are small and single-purpose (`internalReviewers`, `stepOf`, `sectionOf`).

## Coverage (internal reviewers only)

Compact ledger below, bound to the manifest digest. Scope: `tests/run.js` is executable, so the conjunctive perf predicate is false and the perf sections were reviewed. `custom-coding-rules.md` has no perf-budgets section, so Perf budget compliance alone is `n/a: no budgets defined`. There is no perf baseline, so regression detection found nothing to compare, and the suite code is not a hot path.

## Verdict
CONCERNS: 1

## Next action
Impl review-fix: the responsible dev removes the duplicated allowed-section list from `asd-phase-design-review.md` step 7 (and the step 7 correctness bullet). The matching agent-file wording is flagged for whoever holds `asd-reviewer-correctness.md` and `asd-reviewer-efficiency.md` in part 1.

## Escalations (optional)
- none

```json
{"manifest_digest": "bff894f65f585fc24a5449e68ab5a49e1456567da08c28c7cec94838c8fefc56", "findings": ["EFF-2-1"], "files": [{"i": ".asd/templates/t_audit.md", "s": "checked"}, {"i": ".asd/templates/t_config.yaml", "s": "checked"}, {"i": ".asd/templates/t_plan.md", "s": "checked"}, {"i": ".asd/templates/t_subsystem.md", "s": "checked"}, {"i": ".asd/templates/t_subsystems.md", "s": "checked"}, {"i": ".asd/templates/t_subsystems.yaml", "s": "checked"}, {"i": ".asd/templates/t_test-plan.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-audit.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-design-promote.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-design-review.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-design.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-impl-review.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-impl.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-plan.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-dev-critical/project_sync-apply-ledger-gotcha.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-tester-critical/project_testability-envelope.md", "s": "checked"}, {"i": ".gitignore", "s": "checked"}, {"i": "AGENTS.md", "s": "checked"}, {"i": "README.md", "s": "checked"}, {"i": "tests/run.js", "s": "checked"}], "rules": [{"i": "Over-engineering checklist [design-review, impl-review] — critical, undroppable", "s": "pass"}, {"i": "Structure / cohesion checklist [design-review, impl-review] — critical, undroppable", "s": "pass"}, {"i": "Complexity-vs-value tradeoff [design-review, impl-review]", "s": "finding", "f": "EFF-2-1"}, {"i": "Perf budget compliance [impl-review]", "s": "n/a", "p": "no budgets defined"}, {"i": "Perf anti-patterns [impl-review]", "s": "pass"}, {"i": "Algorithmic complexity [impl-review]", "s": "pass"}, {"i": "Regression detection [impl-review]", "s": "pass"}, {"i": "Hot path identification [impl-review]", "s": "pass"}, {"i": ".asd/project/custom-common-rules.md", "s": "pass"}, {"i": ".asd/project/custom-coding-rules.md", "s": "pass"}], "sections": [{"i": "Over-engineering checklist [design-review, impl-review] — critical, undroppable", "s": "reviewed"}, {"i": "Structure / cohesion checklist [design-review, impl-review] — critical, undroppable", "s": "reviewed"}, {"i": "Complexity-vs-value tradeoff [design-review, impl-review]", "s": "reviewed"}, {"i": "Perf budget compliance [impl-review]", "s": "n/a", "p": "no budgets defined"}, {"i": "Perf anti-patterns [impl-review]", "s": "reviewed"}, {"i": "Algorithmic complexity [impl-review]", "s": "reviewed"}, {"i": "Regression detection [impl-review]", "s": "reviewed"}, {"i": "Hot path identification [impl-review]", "s": "reviewed"}]}
```
