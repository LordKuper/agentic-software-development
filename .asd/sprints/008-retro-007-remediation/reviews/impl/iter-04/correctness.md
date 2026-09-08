[REVIEW-impl-correctness]: FAIL

# Review — correctness

- **Phase**: impl-review
- **Iteration**: 4 (severity floor: high — 5 findings dropped below floor)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| C-1 | high | `.asd/rules/sprint-lifecycle.md:316` + `.asd/workflows/asd-phase-impl-test.md:52` + `.asd/workflows/asd-phase-impl-review.md:26` (AC-11) | The narrowed one-writer/one-reader contract is internally consistent, but its `base` arithmetic makes the surviving handoff edge **unreachable on every cycle re-entry** — the exact case AC-11's own text names. Writer base (impl-test step 2, re-entry branch) is the prior `Entry log` row's `HEAD analysed`; reader base (impl-review step 1, iteration ≥ 2) is `reviews.impl.iteration_heads["iter-(NN-1)"]`. Concrete sequence: impl-test entry 1 stamps `HEAD analysed = H1` **before** its step-10 bookkeeping commit, which lands as `H2`; impl-review iter-1 step 2 records `iteration_heads["iter-1"] = H2`; the sprint routes to impl; impl-test entry 2 writes `derived_handoff.base = H1`; impl-review iter-2 computes its base as `H2`. `H1 ≠ H2` is guaranteed, because step 10 always commits test-plan, decisions-log and state.json between the two. So `base` mismatches by construction on every iteration ≥ 2 and the reader always re-derives. Iteration 1 is the only edge that ever hits — there the full triple was verified: same `base_branch`, same pathspec, and `head` survives the out-of-pathspec bookkeeping commit. **Secondary hazard in the same wiring**: the re-entry writer stores the *delta* file list while impl-review iteration ≥ 2 wants the cumulative-since-`iter-(NN-1)` list. If the two bases ever did coincide, reuse would silently **under-scope the review**; only the `base` equality check prevents it, and nothing states that constraint. No follow-up is recorded in `stubs.md`, a migration entry, or the decisions log — the 2026-09-08 entries record "one handoff edge" but never that the edge cannot fire on a re-entry. | Escalation, not a mechanical fix — pick one and record it: **(a)** make impl-test's re-entry change-surface base `iteration_heads["iter-(NN-1)"]` instead of the prior `HEAD analysed`, so writer and reader agree on every cycle (a contract change touching both workflows and the `Re-entry` section); **(b)** keep the wiring and amend AC-11 in `sprint.md` to claim only the first handoff, recording the cycle-re-entry case as explicitly out of scope; or **(c)** delete `derived_handoff` and retire AC-11. Whichever is chosen, add to `sprint-lifecycle.md:316` the sentence the delta/cumulative hazard needs: the reuse check must reject a writer record whose diff span is narrower than the reader's, not merely a different sha. |

Dropped below floor: 5 (4 medium/low wording-and-mirror observations, 1 low vestigial-prose note). Notable among them, at `medium`: `project_sync-apply-ledger-gotcha.md:16`, where the newly inserted `EXCEPT t_AGENTS.md/t_CLAUDE.md` clause now sits between the example list and the trailing qualifier, so the qualifier grammatically attaches to the two exceptions and states the opposite of the correction's intent.

## Verified, no finding

- **The three / two / one arithmetic** in the reviewer memory is correct against source: `computeCanonHashes` (`sync.js:914-932`) emits only `agents/*.md` and `skills/*/SKILL.md`; `tests/run.js:1919` and `:1930` are the two §6b ledger tests; `tests/run.js:969` is a real repo-root `--check` subprocess test. So an agents/skills revert trips 3, `.asd/hooks/session-start.js` / `t_AGENTS.md` / `t_CLAUDE.md` trip 2 (both are render sources), other ledgered canon trips 1. This third version is right.
- The other three corrected memory statements — tool grant, the §9 test's existence, the ledger encoding — all match their homes.
- `project_sync-apply-target-form.md`'s target list matches `buildSyncPlan` exactly; the "parenthetical lives only in `AGENTS.md`" claim is true and guarded.
- `project_crlf-canon-edits.md`: the mechanism claim is accurate — git treats a lone CR as binary, so CRLF normalization is skipped for the whole file, which is exactly the described symptom. No `.gitattributes` contradicts the `core.autocrlf` premise.
- **Deletion hygiene**: no dangling reference to the removed step 13 or to "phase-exit re-record" outside historical sprint artefacts; `t_state.json` still ships `{}`; impl-test's artefacts line still names step 10; impl-review's correctly dropped the field.
- **AC-4 predicate verified**: `sync.js` is untouched this iteration; the unmatched-`--apply` fail-closed behaviour is still asserted; the deliberate `orphan-unmarked` ok-result stands.
- No security-relevant surface in the diff. No UI surface in scope.

## Coverage

Validated compact ledger: [`correctness.ledger.json`](./correctness.ledger.json) against [`correctness.manifest.json`](./correctness.manifest.json), findings [`correctness.findings.json`](./correctness.findings.json). `validate-ledger` → `{"ok":true}`. 10/10 files, 14/14 rules, 6/6 sections.

## Verdict

FAIL: 1 (high) — `FAIL` rather than `CONCERNS` solely because C-1 requires a user decision.

## Next action

Escalate C-1 as a Complication Approval: choose (a) contract change, (b) AC-11 scope narrowing recorded in `sprint.md` and the decisions log, or (c) field retirement. No code fix should be attempted before that decision.

## Escalations

- **C-1** — see the fix column. This is the third consecutive iteration in which this field has produced a finding, and each previous fix closed its target while leaving the stated purpose unmet.
