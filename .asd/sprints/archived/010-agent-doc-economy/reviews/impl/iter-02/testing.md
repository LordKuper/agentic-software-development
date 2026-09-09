[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: 2
- **Severity floor**: medium
- **Manifest**: [testing.manifest.json](./testing.manifest.json) (digest `36ad96c5…`)
- **Validated ledger**: [testing.ledger.json](./testing.ledger.json) — `validate-ledger` → `{"ok":true}`

## Findings

### TST-01 — medium — coverage

**Location**: `test-plan.md` "Risk → check decisions" (no row) against manifest `files[14..19]`; `tests/run.js:3146-3161`

Six scoped `.claude/agent-memory/**` files carry no risk-to-check row and no `none` across all three impl-test entries — the only class in this iteration's scope with no recorded decision, and the omission is silent rather than argued. It is not unassertable prose: `tests/run.js:3146` already covers this exact failure mode, asserting that in each agent-memory directory the sprint writes, `MEMORY.md` and the files beside it are a bijection, and its own message states the cost — an unindexed memory is one the agent never loads, so writing it was a no-op. But its loop is hardcoded to `asd-dev-critical` and `asd-tester-critical`, so three of this round's six files sit outside it: `asd-reviewer-correctness/MEMORY.md`, `asd-reviewer-correctness/project_prompt-snapshot-is-base-branch.md` and `asd-external-review/reference_codex-invocation.md` — including an index file this round edited. Both uncovered directories are bijective at HEAD, so extending the array is green now and costs one line. The test's title and the finding ids inside it show a prior testing review already assigned keeping that loop current to this role.

**Suggested fix**: extend `tests/run.js:3147`'s directory array to `asd-reviewer-correctness` and `asd-external-review`, proving it by a mutation that de-indexes one file in each newly covered directory; or record a scoped `none` per directory naming the risk and its owner. Either way, add the missing row to `test-plan.md`'s decision table.

## Substance checked — no finding

**Fail-first proofs replayed by hand, all genuine.** Removing the D-2 guard leaves four assertions passing and makes `:3393` the first failure, reporting the silent acceptance itself, exactly as transcribed. The flat-lookup mutation fires at `:3384`, and the record honestly downgrades that assertion to a binding between emitted and read shape rather than the sole guard, naming the eight collateral reddenings instead of claiming a clean proof. The truthy-guard mutation leaves the neighbouring assertions passing and yields precisely the missing-exception message at `:3643`. The diagnostic mutation reaches its assertion last, as recorded, and the regex matches the collapsed message. The economy-rule mutation was verified by replay: dropping only the standalone-prohibition clause leaves the normative-class assertion passing and fires the next one.

**§17's tightened restore obligation is met as far as the record can show.** Every mutation target from all three entries is intact at HEAD — the §17 sentences, both `sync.js` sites, the `runtime.js` row-type guard, the corrected rule's three clauses, the role table's single exempt row, `core.md` "See also" bijective with the twelve non-core rule docs, the four banned commands in the consumer mirror, the `run command` grant, and both review workflows' acting sites. Working tree clean at dispatch. Release-manifest freshness corroborated structurally rather than recomputed: the canon and upstream hashes for this reviewer's own file carry identical hex, so no half-patched re-render.

**The entry-3 `none` holds**, checked rather than accepted: all four iteration-1 manifests key `n_a` by row type today, so the declined repo-wide sweep would be green and redundant against the new guard. The row's phrasing — rejects at dispatch — is loose, since the guard fires inside `validateCoverageLedger`, after the dispatch is spent; but a sweep over committed manifests would fire later still, so the decision is unaffected. Sub-floor, not raised.

**T-1, T-2 and T-3 were resolved substantively, not by paperwork.** T-3's exemption set is now compared to the single expected entry before the remainder is looped, closing vacuity on the second side of the sweep. T-2 chose two literal pins over a restated `none`, correctly — the preserve-list protects none of that bullet's classes, so deletion was the live risk. T-1's shape test is honest about binding the nested shape to the validator rather than to any emitter artefact.

No test was removed, and the re-read against §17's prune criteria is credible: no added assertion narrows an existing one, and the new assertions are appended beside pins already reading the same files. All added checks are static file reads or in-process checks over a temp mini-repo — no timing, randomness or ordering dependence. Both `n/a` predicates were verified true rather than accepted: `stubs.md` has zero rows and no sprint TODO marker exists in any touched source; there is no `manual-steps.md`, and no visual, third-party or UX-feel surface is in this diff, so automation was possible everywhere it was claimed.

## Verdict

CONCERNS: 1

## Next action

Route to `impl` review-fix, then `impl-test`: `asd-tester` owns TST-01 — it is test-file work, not production code. No escalation, no user decision, no manual verification requested.
