[REVIEW-impl-external]: CONCERNS
Interrupted attempts: 1 (session rate limit)

# External Review Report

- **Phase**: impl-review
- **Iteration**: 2
- **Severity floor**: medium
- **Provider**: codex (`gpt-5.6-sol`), real request completed (242,819 tokens; no quota/auth/reachability error) — a genuine external verdict, not an availability fallback.

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| X-1 | high | `.asd/workflows/asd-phase-impl-review.md:74` | Step 13 ("Phase-exit re-record"), added fresh in this round's diff, sets `derived_handoff.head = git rev-parse HEAD`. This directly contradicts `sprint-lifecycle.md`'s `derived_handoff` definition, *also rewritten in this same diff*, which now reads: `head` = the newest commit in `<base>..HEAD` touching `pathspec`, "never raw HEAD, so a bookkeeping commit never invalidates the record". The new step contradicts the very clause it was written to satisfy — a bookkeeping/exit commit will invalidate the cache exactly as the fix was meant to prevent. Verified new-in-round, not carried over: no step 13 existed before this diff. (Converges with correctness C-2, efficiency E-3, documentation D-1 and testing T-1 — five independent reviewers.) | Rewrite step 13 to compute `head` via the scoped `git log -1 --format=%H <base>..HEAD -- <pathspec>` (falling back to empty per the sole-SSoT definition), matching step 2's derivation. |
| X-2 | medium | `.asd/rules/review-policy.md` "Union property, checked before merge" (condition d) / `tests/run.js:2875` | The merge gained condition (d) — "every rule id and section id resolves non-`n/a` in at least one half" — but no `validate-partition` helper exists in `.asd/runtime.js` (`module.exports` lists only `validateCoverageLedger`), and the new §19 test only proves (a)/(c)-shaped properties: a half validates against its own manifest, and a partial ledger is rejected against the unpartitioned whole. Nothing exercises the both-halves-`n/a` case (d) is meant to catch. `review-policy.md` is honest that this is manual, so it is not a hidden regression — but the round's stated goal of "closing the manufactured-evidence hole" is prose so far; the hole is documented, not closed. | Either implement `validate-partition` and cover condition (d) in §19, or explicitly scope AC-13 and `test-plan.md` to say (d) remains a manual orchestrator check pending automation, so the DoD claim matches what shipped. |
| X-3 | medium | `.asd/rules/sprint-lifecycle.md:298` vs `.asd/rules/providers.md:111` | New in this round: sprint-lifecycle's "Material risk declaration" section added "Those five classes are reserved: declaring one `artifact` is invalid input, rejected by `route-task`" — restating logic providers.md already owns in full, and which `sprint-lifecycle.md` itself cites one line below as the owner of routing semantics. Two SSoT-owning statements of the same rule in two always-loaded rule docs is exactly the duplication class this project's own hard rule flags. (Converges with efficiency E-6 and documentation D-4.) | Drop the added sentence from sprint-lifecycle.md and link to providers.md's statement instead. |

## Dropped

- **Re-litigated deliberate design, excluded from the count**: the wrapped model initially raised `sync.js`'s `--check` failing only on `orphan` status (not `stale`/`missing`) as a defect. Verified intentional, documented and pre-existing: `sync.js`'s CLI-entry comment, `providers.md:23`, and `tests/run.js:995` all lock this in with an explicit rationale. Unrelated to this round's `--apply` guard.
- **Below floor (1)**: `riskEntry` silently accepting unknown extra keys — carry-over from iteration 1, still open, still below the medium floor.

Accounting: 3 kept (1 high, 2 medium) / 1 dropped below floor / 1 re-litigation excluded.

## Stalemate section (iteration-1 findings)

- **X-1 (iter 1) — resolved.** `sprint-lifecycle.md`, `external-review.md` and `t_prompt-external-impl.md` all narrow the self-hosting exclusion to generated subtrees only; the scope manifest actually used this dispatch confirms `.claude/agent-memory/**` is not excluded.
- **X-2 (iter 1) — resolved.** `artifact-layout.md:43-44` now names `<reviewer>.part-N.md` explicitly in the folder map for both review dirs.
- **X-3 (iter 1) — resolved.** `review-policy.md:136` confirms the decisions-log append moved to "the moment of the interruption, and again when a twice-interrupted half escalates — never deferred to the verdict parse."

**No stalemate**: all three prior major findings are genuinely resolved, not relocated.

**Pattern worth flagging to the dispatcher**: two fix rounds in a row have each closed their targeted findings while introducing at least one new cross-file contradiction in the same diff.

## Availability note

`.asd/project/external-cache.json` holds a stale `quota` entry under a different fingerprint (`00dbcbeb…`, `retry_after` already elapsed) — unrelated to this dispatch's fingerprint (`3dba9a29…`); no action needed.

## Verdict

CONCERNS: 3

## Next action

Route X-1, X-2 and X-3 to impl review-fix mode. X-1 converges with four internal findings and should be fixed once, in one place. X-2 is a decision about whether AC-13's claim is narrowed or the helper is built. X-3 is a one-sentence deletion.
