[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: 2 (severity floor: medium)
- **Method note**: this reviewer holds no shell, so the delta was derived by reading files, `decisions-log.md` and the current `tests/run.js`; the reported suite total was corroborated structurally (171 `test(` declarations ↔ reported 171/171), not by executing the runner.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| T-1 | medium | `.asd/rules/external-review.md:49` ↔ `.asd/agents/asd-external-review.md:116`; `test-plan.md` AC-8 row | This delta landed a new two-site coupling with no row and no assertion. The rule half is `external-review.md:49` ("a precondition missing before any invocation … aborts the dispatch instead"); the acting half is the agent's `ABORT — precondition not met: <artefact>` signal, which cites "Outcome contract" back. The AC-8 test asserts the two permitted outcomes, the never-background clause, the not-a-verdict clause, the interrupted-dispatch hand-off and the skip literal — nothing on either half of the carve-out. Drop the rule clause and the agent still emits a third outcome the contract forbids; drop the agent's scoping and a missing prompt template returns an availability skip that passes a gate on a broken artefact — the `F-8` class itself, silent both ways. The AC-8 row still reads as authored at entry 1; entry 2 amended seven tests but not this one. | Extend the AC-8 test with the two literals (`aborts the dispatch instead` in the rule, the pre-invocation scoping plus the "Outcome contract" citation in the agent — the three-site idiom AC-13b uses), or record an explicit `none` in `test-plan.md` with a reason that survives the "prose is not exempt just because it is prose" bar. |
| T-2 | medium | `.asd/rules/sprint-lifecycle.md:72` ↔ `.asd/rules/review-policy.md:150`; `test-plan.md` entry-2 scope line | Entry 2 names `sprint-lifecycle.md` among the delta's changed files, but no entry-2 row records any decision for it. The one late-return coupling in it is unbound: `sprint-lifecycle.md:72`'s third clearing route depends on `review-policy.md:150`'s `any APPROVE latch for that reviewer cleared`, and `latch` appears in `tests/run.js` exactly once, unrelated. The AC-4/AC-11/AC-14 test asserts the branch heading, the artefact name, the severity-merge and the never-reverse clause but not the latch-clearing clause. Reword or drop it and the sole home of latch persistence keeps claiming it names every route that clears it while one route no longer exists — the same rot the `.late.md` ↔ path-map binding was added this round to prevent, left unbound in its sibling half. | Add the two literals to the existing AC-4/AC-11/AC-14 test — one loop, no new test — or record what changed in `sprint-lifecycle.md` this entry and why it is a `none`. |

## Verified, no finding

1. **The re-pinned `manifest-digest` assertion is sound and stronger than what it replaced.** `runtime.js:270` stamps `vocabulary` before digesting and `:202-206` digests the manifest as written, so stamping genuinely moves identity while a never-stamped manifest keeps its pre-vocabulary one. `tests/run.js:2439` pins that through the untouched `fingerprint` primitive — `buildManifest` emits neither `digest` nor `vocabulary`, so the equality is exact and non-tautological. Five assertions replace one; no weakening.
2. **The legacy fixture is genuinely pre-vocabulary** — built from a local `{...manifest}`-minus-`digest` plus `runtime.fingerprint`, with a sanity assert that the fixture really lacks the field. It no longer tracks the function under test.
3. **New cross-file bindings fail loud, not silent.** Every locator has its own "must still carry" assertion with a message, so a rewording reddens rather than passing vacuously. Both acting sites exist as asserted, and the path map carries `<reviewer>.late.md` on both rows.
4. **The memory-test scoping decision is honest and independently true.** `.claude/agent-memory/asd-pm/MEMORY.md` does index a file that does not exist, so a repo-wide loop would import a pre-existing out-of-scope failure. Both in-scope directories are true bijections, so the new reverse direction is live, not vacuous.
5. **Comment removal lost nothing readable** — all five gone, the two folded contents present in assertion messages; the ~60 pre-existing comments untouched and out of surface.
6. **The AC-16 `none`→`add` correction is honest**, and the still-`none` classes are really covered (`release-manifest.json` by the live freshness tests, sync staleness by the repo-root `--check`). `ac-9` n/a matches its authorized predicate. Stub-resolution n/a verified: `stubs.md` empty, no in-code `TODO(sprint-` marker. The AC-5 widening probe saves, restores and asserts restoration — deterministic.

## Coverage

Validated compact ledger: [`testing.ledger.json`](./testing.ledger.json) against [`testing.manifest.json`](./testing.manifest.json), findings [`testing.findings.json`](./testing.findings.json). `validate-ledger` → `{"ok":true}`. 18/18 files, 18/18 rules, 5/5 sections resolved.

## Verdict

CONCERNS: 2 (both medium)

## Next action

`impl` review-fix mode, one ordered chain: bind T-1's two literals into the existing AC-8 test and T-2's two literals into the existing AC-4/AC-11/AC-14 test — both are additions to loops that already read those files, no new `test(` declaration needed — or record each as an explicit `none` in `test-plan.md` with its reason. Amend the entry-2 rows either way and prove each new assertion by the mutation named in its row.

Also: entry 2's provenance sentence in `test-plan.md` is missing its sha ("Entry 2 stamps  — the tree…"); the Entry-log row and `decisions-log.md` agree on `66a2a1f`, so fill it while touching the file.

This reviewer wrote one memory file (`.claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md`) — per the AC-13b rule this sprint just landed, the orchestrator's commit carrying this review file must also carry it.

## Escalations

None — both findings are creator-fixable inside existing tests and need no scope, contract or abstraction change.
