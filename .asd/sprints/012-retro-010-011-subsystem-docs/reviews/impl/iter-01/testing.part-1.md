[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: 1
- **Evidence**: [manifest](./testing.part-1.manifest.json) · ledger below

This is part 1 of 2. It covers the 20 files in `testing.part-1.manifest.json`. I have no shell, so I worked out the diff by reading the current files, `test-plan.md` and the matching tests in `tests/run.js`. I checked the mutation claims by replaying them by hand, not by running them.

**What checks out**
- **Test count:** `tests/run.js` has 197 top-level `test(` declarations. That matches the reported 197/197: the 187-test pre-strategy baseline plus 10 new tests (lines 4100, 4124, 4174, 4226, 4251, 4267, 4280, 4289, 4301, 4326).
- **Mutation replays:** I replayed six of the recorded mutations against the test bodies. For each one, the first assertion to fail matches what `test-plan.md` says:
  - `Math.ceil` → `Math.floor`
  - slice end `+ 1`
  - the `.asd/templates/` carve-out removed
  - `scopedFanOut` dropped from the UI predicate
  - `!hasBudgets` dropped from the perf predicate
  - the other-phase-only phase gate
- **Dropped assertion:** the rewritten split test drops its "partial ledger" assert. It really is a duplicate: the `missing row` case at `tests/run.js:2253` hits the same `rows incomplete` check.
- **Stubs:** `.asd/project/stubs.md` has no open entries, and there are no `TODO(sprint-` markers in the files in this part.
- **Hashes:** `t_subsystem.md` and `t_subsystems.md` are registered in `upstream_hashes`, and `t_subsystems.yaml` is gone. I confirmed this by reading the files, not by recomputing hashes.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| TST-1-1 | medium | `.asd/runtime.js:360`, `:366`; `tests/run.js:4187` (test-plan row "`emit-manifest` CLI, `parseFlagArgs` booleans…", AC-12) | Both review workflows always call `emit-manifest` with `--custom-rules .asd/project/custom-common-rules.md,.asd/project/custom-coding-rules.md` (`asd-phase-impl-review.md` step 6). The test-plan row says this seam is tested "end to end through the real CLI", but the CLI test at `:4187` never passes `--custom-rules`. How that flag becomes the `customRules` input (flag name, comma split, keyed by path) is only tested through the library object (`:4126`, `:4146`). If that mapping breaks, it breaks quietly rather than with an error: custom-rule ids drop out of every manifest, and a perf-budgets section is never seen, so all five performance sections get `n/a` even when budgets exist. The suite stays green. The only current evidence that it works is this iteration's live manifests, which do list both custom-rule paths. The test-plan also has no row for the `--halve` CLI flag. | In the existing CLI test, emit once with `--custom-rules` pointing at a temp file that has a `## Perf budgets` heading, and once without it. Assert the path shows up in `rules`, and that the perf predicate is absent in the first run and present in the second. |
| TST-1-2 | low | `.asd/runtime.js:313`; `tests/run.js:4159` (test-plan row `rubricIds`, `standingPredicates`… "ux-spec draft", AC-12) | In design-review, the UI phase-gate lift has two triggers: `ux-spec\.html` or `design-md-delta\.yaml`. `asd-phase-design-review.md:32` and `:72` also describe it as "ux-spec/design-system draft". The test only has fixtures for `ux-spec.html`, so deleting the `design-md-delta.yaml` trigger stays green. If a design-review scope then held a design-system delta and no ux-spec draft, the UI conformance section would be `n/a: outside phase gate` and token proposals would not be reviewed. | At `:4159`, add a second scope, `['s/design/prd.html', 's/design/design-md-delta.yaml']`, and assert it lifts the same `uiIds`. |
| TST-1-3 | low | `.asd/runtime.js:352`; `tests/run.js:4211`, `:4221` | The assertion message says `--ledger` must read the one fenced ledger block, "skipping fenced blocks that are no ledger". But the non-ledger block in the fixture is plain text that `JSON.parse` already rejects. The `manifest_digest !== undefined` check, which is what actually tells a JSON ledger apart from other JSON, is never exercised. Removing it stays green, and then a review whose findings quote any JSON (a manifest excerpt, a row example) is rejected as having two ledger blocks, which forces a fresh re-dispatch. It fails closed, but the test claims a property its fixture does not test. | Change the non-ledger block in `returnedText` to a JSON block without `manifest_digest`, for example a `row_example` excerpt. |

## Coverage (internal reviewers only)

The ledger for this part is the JSON block at the end, bound to the digest of `testing.part-1.manifest.json`. Status for each rule:
- **Rule-set conformance:** finding TST-1-3.
- **Coverage:** finding TST-1-1. Every other AC traced to this part's files has at least one check: AC-1..AC-14 and AC-16..AC-19 as static or unit checks, AC-15 through the registry, template and grant asserts.
- **Edge cases:** finding TST-1-2.
- **Stub-resolution verification:** pass.
- **Manual verification:** pass. `test-plan.md` specifies none and none is needed.
- **Both custom-rule files:** pass. `runtime.js` stays zero-dependency, and the sync-after-canon-edit rule is enforced by the §9 `--check` test.

## Verdict
CONCERNS: 3

## Next action
Route to `impl-test` so the tests are fixed: add the `--custom-rules` CLI case (TST-1-1), the `design-md-delta.yaml` lift case (TST-1-2) and a JSON non-ledger fixture block (TST-1-3). Then update the matching `test-plan.md` rows and "Added tests" regression-proof entries. No production code changes.

## Escalations (optional)
None.

```json
{"manifest_digest": "352dd833d32be0a284b420dbfb29fc1a981354717ffcf3f9ee08b2c819388d27", "findings": ["TST-1-1", "TST-1-2", "TST-1-3"], "files": [{"i": ".asd/agents/asd-architect.md", "s": "checked"}, {"i": ".asd/agents/asd-dev.md", "s": "checked"}, {"i": ".asd/agents/asd-reviewer-correctness.md", "s": "checked"}, {"i": ".asd/agents/asd-reviewer-efficiency.md", "s": "checked"}, {"i": ".asd/release-manifest.json", "s": "checked"}, {"i": ".asd/rules/artifact-layout.md", "s": "checked"}, {"i": ".asd/rules/checkpoints.md", "s": "checked"}, {"i": ".asd/rules/code-style.md", "s": "checked"}, {"i": ".asd/rules/core.md", "s": "checked"}, {"i": ".asd/rules/external-review.md", "s": "checked"}, {"i": ".asd/rules/git-strategy.md", "s": "checked"}, {"i": ".asd/rules/providers.md", "s": "checked"}, {"i": ".asd/rules/review-policy.md", "s": "checked"}, {"i": ".asd/rules/sprint-lifecycle.md", "s": "checked"}, {"i": ".asd/runtime.js", "s": "checked"}, {"i": ".asd/skills/asd-init/SKILL.md", "s": "checked"}, {"i": ".asd/skills/asd-sprint/SKILL.md", "s": "checked"}, {"i": ".asd/sync-state.json", "s": "checked"}, {"i": ".asd/templates/external-review/t_prompt-external-design.md", "s": "checked"}, {"i": ".asd/templates/t_AGENTS.md", "s": "checked"}], "rules": [{"i": "Rule-set conformance", "s": "finding", "f": "TST-1-3"}, {"i": "Coverage", "s": "finding", "f": "TST-1-1"}, {"i": "Edge cases", "s": "finding", "f": "TST-1-2"}, {"i": "Stub-resolution verification", "s": "pass"}, {"i": "Manual verification (last resort)", "s": "pass"}, {"i": ".asd/project/custom-common-rules.md", "s": "pass"}, {"i": ".asd/project/custom-coding-rules.md", "s": "pass"}], "sections": []}
```
