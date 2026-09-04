[REVIEW-impl-correctness]: APPROVE

# Review — correctness

- **Phase**: impl-review
- **Iteration**: 3 (severity floor `high`)
- **Scope**: incremental diff `654f8fb...HEAD`, 13 files

## Findings

| # | Severity | Location / AC | Description | Fix |
|---|---|---|---|---|
| — | — | — | *(empty — nothing at or above the `high` floor)* | — |

Sub-floor observations, classified `medium`/`low` and dropped per the floor rather than reported: residual stale "APPROVE or latched" phrasing in `review-policy.md` and the two workflow branch labels; the pr-gate file-fallback having no way to recognise a latch-skipped reviewer's missing review file; the hook's all-legacy-`skipped:` map now reading `mixed` while `sprint-lifecycle.md` still calls that value satisfied; `4.0.0.js` still throwing on a pre-4.0.0 engine that also lacks `hasOwnershipMarker`. None blocks or endangers the release: each is either outcome-equivalent under the new invariant, or fail-safe (blocks rather than passes) in an already-degraded state.

## Judgment on the three questions posed

1. **Does the invariant hold end-to-end?** Yes. Traced dispatch filter (both workflows read `latched` only to decide dispatch) → verdict write (every required reviewer gets an entry this iteration, no exception; a latch-skipped reviewer's inherited `APPROVE` is written without dispatch) → DoD aggregation (reads `verdicts["iter-NN"]` alone) → pr gate (an absent key always blocks, never consults `latched`) → hook (`lastReviewVerdict` no longer reads `latched` at all). No path consults `latched` for *satisfaction*. The surviving "All APPROVE or latched" strings are branch labels whose operative instruction, in the same step, is verdicts-only.
2. **Does the rewrite break a previously-held AC?** No. AC-2's operative requirement — a latched reviewer is not re-dispatched and DoD stays reachable — is now satisfied through the written inherited `APPROVE` instead of a latch lookup; rollback reset and red-full-suite invalidation still clear `latched`, and the new text correctly notes that clearing it can no longer retroactively change a recorded iteration. AC-7's design-review section rename resolves to a real section (`### Complexity-vs-value tradeoff`); the previous `design-principles` payload name matched no section and would have produced an unresolvable ledger row. AC-8: `t_test-plan.md`'s AC-tag channel now reads "(name, path)", matching `code-style.md` §8 and `sprint-lifecycle.md`. AC-14: `release-manifest.json` carries a refreshed hash for all 11 changed canonical files, and the provider views are genuinely resynced (verified the new agent text and hook comment in both `.claude/` and `.codex/` trees; both are excluded from this phase's pathspec by design, so their absence from the 13-file scope list is correct, not drift).
3. **Is the migration fallback safe against a half-applied destructive state?** Yes. `deleteMarkedView` orders `existsSync` → `hasOwnershipMarker` → `fs.rmSync` → `removeIfEmptyDir`; the only mutation-then-throw window was the last call, and the local fallback closes exactly that. The fallback is byte-equivalent to `sync.js`'s implementation, so behaviour is identical on both engines. Any *other* missing helper on a pre-4.0.0 engine (`hasOwnershipMarker`) throws before the first `rmSync`, and the `commands.yaml` read/write is reached only after all deletes have completed idempotently — so no reachable path leaves a half-applied delete; a failure leaves `reachedVersion` at the last successful migration per AC-12.

## Coverage

**Summary**: `files: 13/13 checked, 0 n/a · rules: 17/17, 0 findings · sections: 6/6, none blank`

**`n/a` rows (full list)**

| Item | Reason |
|---|---|
| `code-style.md` | *(as returned by the reviewer: "governs code written by consumer dev agents; this repo's own sources are exempt (AGENTS.md)")* — **see orchestrator note below; this reason is stale and the row should have been `checked`** |
| `design-system.md` | no UI surface in the change surface |
| `ux-principles.md` | no UI surface in the change surface |

**Section-coverage ledger**

| Rubric section | Status |
|---|---|
| Bugs | reviewed — pass |
| Security | reviewed — pass |
| Contracts | reviewed — pass (all export/schema changes additive; `latched` semantics narrow only within the release that introduces the field, so no consumer state can pre-date it) |
| Best practices | reviewed — pass |
| AC coverage trace | reviewed — pass (AC-2, AC-7, AC-8, AC-12, AC-13, AC-14 touched by this delta; each traced to a code path, none partially implemented, no change without an AC) |
| UI conformance | reviewed — pass: `scoped_fan_out` disabled so the section was not pre-marked n/a and was evaluated; the 13-file change surface contains no UI surface, so no token, component-fidelity or accessibility rule has an application point |

## Orchestrator note — one ledger row is wrong

This reviewer marked `code-style.md` as `n/a` on the grounds that it "governs code written by consumer dev agents; this repo's own sources are exempt (AGENTS.md)". That reason is **stale**: the iteration-1 escalation was decided the other way by the user, and `AGENTS.md` now states the opposite explicitly — "`code-style.md` governs code written by consumer dev agents AND this repo's own Node code … no exemption for framework code". The row should have been `checked`.

Consequence: this reviewer did not apply §7/§8 to the delta's Node code and therefore missed the three in-body comments newly added to `tests/run.js`. That defect was independently caught by `asd-reviewer-documentation` in the same iteration, whose rubric owns the item under AC-8, so iteration coverage held. The verdict stands as returned; the miss is recorded here rather than silently corrected, and the finding is carried in the documentation review.

## Verdict

APPROVE — the empty findings table is the correct answer: the invariant rewrite is coherent across all five consumers of the latch, no AC regressed, and the migration fallback closes the only half-apply window that existed.

## Next action

None from this reviewer. The iteration's fix set comes from the documentation review.

## Escalations

None.
