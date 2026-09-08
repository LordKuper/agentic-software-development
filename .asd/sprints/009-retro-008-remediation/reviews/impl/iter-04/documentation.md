[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 4 (severity floor: high — medium and low dropped at source)
- **Method note**: no shell; the diff surface was derived by reading every scoped path directly.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| DOC4-1 | high | `.asd/workflows/asd-phase-impl-review.md:48`; `.asd/workflows/asd-phase-design-review.md:40` | The narrowed step header leaves an interrupted **External Review** dispatch with no acting site, contradicting the rule that imports the handling for it. Both workflows now open 7a/8a with "split and re-dispatch mechanics: internal reviewers only", and the sentence that follows — "A dispatch returning no verdict token or no ledger takes the same reject-and-re-dispatch-fresh path as a failed validation above" — sits under that header. The late-duplicate bullet was explicitly bought back out of it, which confirms the header binds every bullet that does not restate its own reach. But the interrupted branch does reach External Review, by import: `external-review.md:51` says a return that is neither a verdict nor a skip "is not permitted and is not a verdict. Its disposal is `review-policy.md` 'Interrupted dispatch', imported here whole", `review-policy.md:146` names the phase workflow as the actor, and `review-policy.md:148`'s correlated-interruption branch is explicitly iteration-wide over "every dispatch then in flight" — which routinely includes External Review, dispatched in the same fan-out. Neither workflow cites "Outcome contract" anywhere, so 7a/8a is the only place an orchestrator would look, and it disclaims the case. Wrong action produced: on a cut-short External Review dispatch the orchestrator re-dispatches only the internal reviewers, writes no interrupted-attempt entry, and reaches step 8/9 with no `external` key in `verdicts["iter-NN"]` — an absent key that blocks, so the phase stalls with no durable record. Fail-safe in direction (no gate is passed), hence high rather than critical. | Widen the header (e.g. "split mechanics: internal reviewers only; interruption handling reaches any dispatch"), or add one sibling bullet in both files carrying its own reach, mirroring the late-duplicate bullet's shape: an External Review dispatch returning neither permitted outcome is disposed per `external-review.md` "Outcome contract" (which imports `review-policy.md` "Interrupted dispatch" whole) — re-dispatched fresh and logged, never split. The split trigger legitimately stays internal-only: External Review has no manifest to partition. |

## Checked and clean (no finding at floor)

- **Citations resolve as written** — the cited headings and bold labels all exist; step cross-references are correct on both sides.
- **Late-duplicate reach mirror** — stated at `review-policy.md:144` and restated on the acting bullet in both workflows. A deliberate, test-pinned mirror, line-scoped on both sides, not an SSoT violation; drift fails the suite at the policy assertion first.
- **`tests/run.js` delta** — the line-scoped `find` over the citation sentence plus the rule-side reach assertion are true at HEAD for all three sites. One assertion message overstates the mechanism (it says the workflow mirrors are "checked against" the SSoT, while the code checks three independent literals); the protection holds and drift is still caught — below floor.
- **Artefacts / path map** — both workflows list `.part-1.md`/`.part-2.md` and `<reviewer>.late.md`; `artifact-layout.md:43-44` carries matching rows for both phases.
- **`release-manifest.json`** — `upstream_hashes` entries for both edited workflows; correctly no `canon_hashes` entry and no generated-view re-render, since workflows are not render sources. `managed_paths` correctly excludes `tests/run.js` and `.claude/agent-memory/**`. Hash values not recomputable without a shell — freshness corroborated structurally.
- **Agent-memory durable claims re-verified at HEAD** — the sync helpers are exported, a bare `--apply` returns 1 writing nothing, `canon_hashes` is agents plus skills only, the repo-root `--check` in-suite test is real, and both index links resolve. The claim about a drifting assertion message is still true, and `checkpoints.md` absorbs it by tail match, so no finding.
- **README's absence from scope is correct** — this delta touches no phase list, agent roster, model tier, config-schema field, folder-map row or command list, and README references none of the interrupted/split/late-return mechanics or reviewer artefact names.
- **In-code doc comments** — the changed region in `tests/run.js` adds none; the file's pre-existing ones lie outside this delta's hunks.

## Coverage

Validated compact ledger: [`documentation.ledger.json`](./documentation.ledger.json) against [`documentation.manifest.json`](./documentation.manifest.json), findings [`documentation.findings.json`](./documentation.findings.json). `validate-ledger` → `{"ok":true}`. 7/7 files, 10/10 rules, 9/9 sections resolved.

## Verdict

CONCERNS: 1 (high)

## Next action

Creator autofixes DOC4-1 in both review workflows, refreshes their two `upstream_hashes` entries, and optionally pins the new external-reach bullet the same line-scoped way the late-duplicate one is pinned.

## Escalations

None — the ownership of the interrupted-external branch is unambiguous (`external-review.md` "Outcome contract", importing `review-policy.md` "Interrupted dispatch").
