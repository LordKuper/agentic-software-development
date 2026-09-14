[REVIEW-impl-efficiency]: CONCERNS

# Review — efficiency

- **Phase**: impl-review
- **Iteration**: 1 (part 1 of 2)
- **Evidence**: [manifest](./efficiency.part-1.manifest.json) · ledger below

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| EFF-1-1 | critical | `.asd/runtime.js:398-402` (`manifest-digest --write` branch, `'write'` boolean flag), `.asd/runtime.js:274` (`stampManifest` doc comment) | **Over-engineering checklist: Dead code left "in case we need it".** Category: `simplify`. This sprint makes `emit-manifest` "the sole manifest source; never hand-assembled". It also makes a dispatched manifest immutable: "never a re-stamp" (`review-policy.md:101`, `asd-phase-impl-review.md:44`, `asd-phase-design-review.md:36`). The canon instruction to run `manifest-digest ... --write` was removed, and `tests/run.js:4259` checks that it stays gone. After those changes, nothing in canon calls `--write`. A grep of `.asd/` outside `sprints/` finds no caller, and only `tests/run.js:2461-2489` still runs it. What is left is a working re-stamp path on the CLI, which is the exact action the rule now forbids and the cause of the 010 F-2 incident that AC-2 closes. The new doc comment at `:274` ("the one stamping seam for emitted and re-stamped manifests alike") still describes re-stamping as a supported use. `plan.md:66` mentioned `--write` only as an existing seam that already stamped the constants. The later Task 2/4 rule text is what removed its purpose. | Delete the `--write` branch so `manifest-digest` only verifies: `const manifest = JSON.parse(...)`, then print `coverageManifestDigest(manifest)`. Remove `'write'` from the `parseFlagArgs` boolean list. `stampManifest` then has one caller, the emitter, so change its comment to say it stamps emitted manifests only. Move the published-constant and digest-coverage checks in `tests/run.js:2461-2489` onto `emitCoverageManifests` output; `:3033` already checks part digests there. Keep the plain-digest assertion. |

## Coverage (internal reviewers only)

Every one of the 20 scoped files was checked against all 8 rubric sections and both custom-rule files.
- **`.asd/runtime.js`**: this is the only executable file in this part, so the four perf sections that have criteria (anti-patterns, algorithmic complexity, regression, hot path) were reviewed.
  - All inputs are tiny (manifest id lists, one rubric file) and nothing runs on a hot path.
  - There is no baseline to compare against.
  - Perf budget compliance is `n/a: no budgets defined`, because `custom-coding-rules.md` has no perf-budget section.
- **Structure / cohesion (SC-1) for `runtime.js`**: pass. The user earlier ruled that this file stays one file, so only the new code was judged.
  - `emitCoverageManifests`, `standingPredicates`, `rubricIds` and `ledgerFromText` each have one purpose.
  - The fail-closed `NA_TARGETS` prefix check exists to catch a renamed rubric entry, and `tests/run.js:4171` tests it.
- **Rule docs, agents, skills and templates** (registry move, tool-policy refusal, `Settings change:` grammar, sprint-mediated `asd-init`): no over-engineering or structure hits.
  - Each new rule has one home, and the other files point to it.
  - `release-manifest.json` and `sync-state.json` changes are hash bookkeeping only.

## Verdict
CONCERNS: 1

## Next action
Route EFF-1-1 back to `impl` in review-fix mode. The dev deletes the `--write` branch, fixes the `stampManifest` comment, and moves the stamping assertions onto the emitter. Then the sprint goes back through impl-test.

## Escalations (optional)
- none. EFF-1-1 is a deletion with no new abstraction. If the orchestrator treats `plan.md:66` as having approved keeping `--write`, confirm with the user before applying the fix.

```json
{"manifest_digest": "aee2c8bcaa8c826e043be1eb888f02c57f45b8e63c77ee03665d1bdd6dd90dfd", "findings": ["EFF-1-1"], "files": [{"i": ".asd/agents/asd-architect.md", "s": "checked"}, {"i": ".asd/agents/asd-dev.md", "s": "checked"}, {"i": ".asd/agents/asd-reviewer-correctness.md", "s": "checked"}, {"i": ".asd/agents/asd-reviewer-efficiency.md", "s": "checked"}, {"i": ".asd/release-manifest.json", "s": "checked"}, {"i": ".asd/rules/artifact-layout.md", "s": "checked"}, {"i": ".asd/rules/checkpoints.md", "s": "checked"}, {"i": ".asd/rules/code-style.md", "s": "checked"}, {"i": ".asd/rules/core.md", "s": "checked"}, {"i": ".asd/rules/external-review.md", "s": "checked"}, {"i": ".asd/rules/git-strategy.md", "s": "checked"}, {"i": ".asd/rules/providers.md", "s": "checked"}, {"i": ".asd/rules/review-policy.md", "s": "checked"}, {"i": ".asd/rules/sprint-lifecycle.md", "s": "checked"}, {"i": ".asd/runtime.js", "s": "checked"}, {"i": ".asd/skills/asd-init/SKILL.md", "s": "checked"}, {"i": ".asd/skills/asd-sprint/SKILL.md", "s": "checked"}, {"i": ".asd/sync-state.json", "s": "checked"}, {"i": ".asd/templates/external-review/t_prompt-external-design.md", "s": "checked"}, {"i": ".asd/templates/t_AGENTS.md", "s": "checked"}], "rules": [{"i": "Over-engineering checklist [design-review, impl-review] — critical, undroppable", "s": "finding", "f": "EFF-1-1"}, {"i": "Structure / cohesion checklist [design-review, impl-review] — critical, undroppable", "s": "pass"}, {"i": "Complexity-vs-value tradeoff [design-review, impl-review]", "s": "pass"}, {"i": "Perf budget compliance [impl-review]", "s": "n/a", "p": "no budgets defined"}, {"i": "Perf anti-patterns [impl-review]", "s": "pass"}, {"i": "Algorithmic complexity [impl-review]", "s": "pass"}, {"i": "Regression detection [impl-review]", "s": "pass"}, {"i": "Hot path identification [impl-review]", "s": "pass"}, {"i": ".asd/project/custom-common-rules.md", "s": "pass"}, {"i": ".asd/project/custom-coding-rules.md", "s": "pass"}], "sections": [{"i": "Over-engineering checklist [design-review, impl-review] — critical, undroppable", "s": "reviewed"}, {"i": "Structure / cohesion checklist [design-review, impl-review] — critical, undroppable", "s": "reviewed"}, {"i": "Complexity-vs-value tradeoff [design-review, impl-review]", "s": "reviewed"}, {"i": "Perf budget compliance [impl-review]", "s": "n/a", "p": "no budgets defined"}, {"i": "Perf anti-patterns [impl-review]", "s": "reviewed"}, {"i": "Algorithmic complexity [impl-review]", "s": "reviewed"}, {"i": "Regression detection [impl-review]", "s": "reviewed"}, {"i": "Hot path identification [impl-review]", "s": "reviewed"}]}
```
