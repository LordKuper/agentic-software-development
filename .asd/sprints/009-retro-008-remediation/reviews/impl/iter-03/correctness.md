[REVIEW-impl-correctness]: CONCERNS

# Review — correctness

- **Phase**: impl-review
- **Iteration**: 3 (severity floor: high — medium and low dropped at source, not recorded)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `.asd/workflows/asd-phase-impl-review.md:48`, `:50`; `.asd/workflows/asd-phase-design-review.md:40`, `:42` (AC-14) | The new late-duplicate binding sits under a step whose scope line reads "**Interrupted dispatch / split dispatch** — internal reviewers only", and the bullet states no reach of its own — it cites `review-policy.md` "Late duplicate return" as sole SSoT for the admission test and every action it mandates, not for its reach. `review-policy.md:144` says the opposite: the section "Applies to the 4 internal reviewers, **except where a branch states its own reach** (**Late duplicate return**, below, holds for any replaced dispatch, **External Review included**)" — that carve-out exists because the narrow reading is the default. The preceding step's line ends "External Review is exempt", reinforcing it. Consequence at the acting site: a late-returning **external** dispatch carrying a verified at-or-above-floor finding that contradicts the recorded verdict reads as out of scope for the only step that binds the disposal route, so it is discarded — precisely the sprint 008 iteration 5 incident AC-14 exists to prevent. The obligation then has no acting-site binding for its motivating case. | State the branch's reach where it is bound: amend the step header to "— split and re-dispatch mechanics: internal reviewers only", or open the bullet with "applies to any replaced dispatch, External Review included". One clause per file; no rule-doc change — `review-policy.md:144` already owns the reach. |

## Verified correct, no high/critical finding

- **`asd-phase-impl.md` serialization** — step 5 builds one ordered chain dispatched to one agent and orders the tester chain strictly after the dev chain with fixes already committed (matching `git-strategy.md`); step 5a routes every chain task then dispatches at the highest returned tier; step 6's surviving `parallel where independent` is scoped "initial mode only". No step authorizes what another forbids.
- **`checkpoints.md:31`** — the tail `for iter-NN: findings resolved` genuinely selects: it is a suffix of the emitting SSoT's literal and of the wording the orchestrator actually writes (`impl review-fix for iter-01: …`), which the old whole-heading literal was not. The test-fix entry carries no `iter-NN` and cannot be miscounted.
- **`tests/run.js` AC-15 re-pin is not vacuous** — it derives the emitted literal from the workflow by regex, asserts the match is unique, asserts it ends with the tail read out of `checkpoints.md`, and re-derives the owning step number from the workflow's own numbering, so a rewording on either side or a renumbering reddens. The AC-10 test pins both the fix-mode invariants and the surviving initial-mode parallelism.
- **`sprint-lifecycle.md:72`** — the ordinal rename stays coherent with the routes above and below it, and the test matches that line by citation rather than ordinal, so the rename cannot silently break the locator.
- **Agent memory in scope** — durable claims spot-checked and hold: `canon_hashes` really covers only agents and skills, `managed_paths` excludes `tests/run.js`, a bare `--apply` errors and writes nothing, the ledger-output keys are real, the vocabulary claim matches `runtime.js`, the root `.gitattributes` exists as described, and every index link resolves.
- **AC trace** — every AC's landing site verified present at HEAD; AC-14 alone carries finding 1. AC-16/AC-18 unaffected: this delta touched only non-render canon plus the hash ledger, so no generated view or README mirror is implicated.

## Coverage

Validated compact ledger: [`correctness.ledger.json`](./correctness.ledger.json) against [`correctness.manifest.json`](./correctness.manifest.json), findings [`correctness.findings.json`](./correctness.findings.json). `validate-ledger` → `{"ok":true}`. 12/12 files, 18/18 rules, 6/6 sections resolved.

## Verdict

CONCERNS: 1 (high)

## Next action

Route to `impl` review-fix mode: add the reach clause to the late-duplicate binding in both review workflows. Consider extending the AC-14 test to pin the reach as well as the citation, so a binding narrower than `review-policy.md:144` reddens.

## Escalations

None — a one-clause scope correction inside two files this delta already edits.
