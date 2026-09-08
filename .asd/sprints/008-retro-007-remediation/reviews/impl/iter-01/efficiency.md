[REVIEW-impl-efficiency]: CONCERNS

# Review — efficiency

- **Phase**: impl-review
- **Iteration**: 1 (severity floor: low — all severities reported)

## Findings

| # | Severity | Category | Location | Description | Suggested fix |
|---|---|---|---|---|---|
| E-1 | medium | simplify | `asd-phase-design-review.md:40-44`, `asd-phase-impl-review.md:48-52` vs `review-policy.md:140-148` | The split-dispatch procedure is stated three times. Both workflow blocks open with "`review-policy.md` … is the sole SSoT for trigger, partition, union property and merge rule, **not restated here**" and then restate all four: the partition recipe, the digest stamp, the union-before-merge gate, and the part-file/merge layout. The two workflow blocks are also near byte-identical to each other. ~5 dense lines × 2 always-loaded workflow files duplicating an always-loaded rule doc — the exact prose-duplication cost this sprint's retro targets. | Cut each workflow block to the phase-local bindings only, e.g. "8a. Interrupted/split dispatch per `review-policy.md` 'Interrupted dispatch and split dispatch'. Phase bindings: payload = step 7's, narrowed per half; part files under `<sprint>/reviews/design/iter-NN/`; step 9 parses the merged `<reviewer>.md`; a half interrupted twice → request user decision." Delete the partition recipe, the `manifest-digest --write` restatement, the union-property sentence and the merge-layout sentence from both workflows. |
| E-2 | medium | simplify | `sprint-lifecycle.md:316` (+ `asd-phase-impl-test.md:34`, `asd-phase-impl-review.md:26,29,89`, `t_state.json:14`) | `derived_handoff` pays an unconditional cost for a benefit unreachable in the case AC-11 names. Cost: a ~250-word paragraph in an always-loaded rule doc, read/write clauses in two workflows, two Artefacts-produced edits, a shipped state field, plus a `git rev-parse HEAD` **and** a state write on *every* impl-test step 2 and impl-review step 2 — paid whether or not the slot is ever read. Benefit: skipping one `git diff --name-only`. The advertised cross-phase hit is structurally impossible — impl-test commits tests before impl-review, so `head` never matches, and the pathspecs differ; the paragraph itself concedes hits are "within one phase". Net: the maintenance write costs more per run than the cache saves. | Minimal, autofixable: compress `:316` to the rule only — shape literal, the three-field equality condition, absent/empty → re-derive and overwrite, "pure optimisation, never a gate". Delete the four justification clauses; the equality condition already implies every one. Target ≤ 4 lines. Deleting the field outright would retire AC-11 and is a user scope decision, not an autofix (see Escalations). |
| E-3 | low | simplify | `review-policy.md:142` (2nd clause), `:146` (2nd clause); `artifact-layout.md:89` | Rejected-alternative and justification prose in always-loaded rule docs. `:142`'s "two partial ledgers against one manifest are rejected as incomplete and are never the mechanism" documents a path nobody can take — the positive rule already fully determines behaviour, and the rejected alternative is preserved in `tests/run.js:2631-2637` where it belongs. `artifact-layout.md:89` gives four independent reasons for one carve-out. | Delete `:142`'s trailing clause after the semicolon. In `:146` drop "never a resume, never a reused agent" (the cited "Clean-context review iteration" says exactly that). Collapse `artifact-layout.md:89` to one clause naming the mechanism only. |
| E-4 | low | simplify | `artifact-layout.md:87` vs `:68` | Same fact stated twice, 19 lines apart in one file: `:68` "A sprint folder holds **only** the artifacts named above…"; `:87` re-states "`.asd/sprints/**` holds only the path-map artifacts above". | Trim `:87` to "Never inside a sprint tree (see above)". |
| E-5 | low | simplify | `tests/run.js:2867-2878` vs `:2194-2198`, `:2425` | The new `buildManifest` helper introduces a second construction path for a fixture the suite already builds inline twice, so the manifest fixture shape now lives in three places. | No new abstraction needed — hoist the existing helper above `:2194` and use it at `:2194-2198` and `:2425`, deleting those inline literals. |

## Checked and cleared

- **AC-7 "zero checklist items copied" — verified true.** `code-style.md:11`, `providers.md:93` and `asd-phase-impl.md:72` each carry a pointer plus applicability statement; no over-engineering or structure/cohesion item text is reproduced. `asd-phase-impl.md:72` matches the file's existing "see X — do not restate here" bullet precedent, so it earns its place — keep as-is.
- **oe-6 against `riskArray(value, name)` (`.asd/runtime.js:42-45`)**: single call site, `name` always `'risks'`. Resolved pass — it mirrors the neighbouring `stringArray(value, name)` validator shape exactly; collapsing it would break the file's uniform validator signature for one saved token. The two-shape acceptance in `riskEntry` is the minimum preserving consumer compatibility — bare string normalises to the strictest target, no third shape, no options object — and its `\0` check matches `stringArray:29`'s precedent, so it is not oe-7 defensive code.
- **sc-1 against `.asd/runtime.js`**: pass. Per the standing user override the module-split finding is not re-raised; only new code judged — no dead field, no unused return, and the added `risks.length === 0` guard at `:171` is load-bearing for the artifact-risk path.
- **Perf anti-patterns**: none. No n+1, no sync IO on a hot path, no unbounded allocation. `tests/run.js:2705-2722` spawns three node processes for one test, ~3× the surrounding per-test cost, but the three-way byte-identity comparison genuinely needs three runs — keep as-is.
- **Algorithmic complexity**: `routeTask` adds one `map` and two `find` passes over `risks`, length 0–3 in practice. Constant-factor.
- **Regression**: `riskArray` replaces `stringArray` for `risks`; a legacy bare-string array produces byte-identical output (asserted `tests/run.js:2606-2611`). The only behavioural delta is intended. Error-message text changed for the `risks` argument; no other assertion or caller depends on the old string.
- **Hot paths**: none introduced.

## Coverage

Validated compact ledger: [`efficiency.ledger.json`](./efficiency.ledger.json) against immutable manifest [`efficiency.manifest.json`](./efficiency.manifest.json), findings [`efficiency.findings.json`](./efficiency.findings.json). `node .asd/runtime.js validate-ledger` → `{"ok":true}`. 19/19 files, 14/14 rules, 8/8 sections resolved; `perf-budget-compliance` `n/a` per the phase-supplied predicate. No over-engineering or structure/cohesion checklist item tripped — all five findings arise from the complexity-vs-value section.

## Verdict

CONCERNS: 5

## Next action

Creator (impl fix mode) applies E-1, E-3, E-4, E-5 and E-2's minimal compression — all deletions or collapses of duplicated prose plus one test-fixture reuse. None adds an abstraction, layer or dependency, so none needs Complication Approval. Re-run `node tests/run.js` after E-5 (shared fixtures) and after E-2 (`tests/run.js:2724-2736` asserts the `derived_handoff` shape literal is present in `sprint-lifecycle.md` and absent from both workflows — keep the literal when compressing).

## Escalations

None required as a reviewer escalation. Note for the orchestrator: the stronger fix for E-2 — deleting `derived_handoff` outright, with its rule paragraph, both workflow clauses, both Artefacts lines and the three AC-11 tests — would retire AC-11 and is therefore a user scope decision. The minimal compression captures most of the token cost without touching AC coverage.
