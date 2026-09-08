[REVIEW-impl-external]: APPROVE (skipped: external review unavailable: codex quota exhausted — "You've hit your usage limit", confirmed on one permitted retry)

# External Review Report

- **Phase**: impl-review
- **Iteration**: 1
- **Severity floor (this iter)**: low
- **Interrupted attempts**: 1 (session-wide usage limit, attempt lost mid-dispatch before returning; re-dispatched fresh in the same iteration per `review-policy.md` "Interrupted dispatch")

## Outcome

Availability skip. The wrapped Codex CLI was invoked in the foreground, awaited inside the dispatch, and returned an active quota error (`You've hit your usage limit`) on both the review pass and the one permitted minimal retry — the identical message verbatim, so not a transient or malformed-request failure.

This is the `external-review.md` "Outcome contract" path this sprint's own `AC-8` added: the wrapper could not complete, so it returned the skip naming the cause rather than an empty return. Local readiness (`local-ready`) predicted only that the executable and local auth existed, never paid-request success — exactly the distinction the preflight contract states.

## Kept findings

None — the review could not run. No findings were fabricated in place of the missing pass.

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): 0
- Nitpick: n/a

## Verdict

APPROVE (skipped: external review unavailable — codex quota)

Satisfies DoD aggregation exactly like a bare `APPROVE`, and is NEVER written to `latched` (`sprint-lifecycle.md` "APPROVE latch", availability-skip carve-out) — so External Review is re-dispatched on the next iteration once availability returns.

## Recorded by the phase

- Negative cache: `node .asd/runtime.js external-record-failure` → `{"status":"quota","retry_after":1788864794615}` against fingerprint `3dba9a29…f991e2`, cache `.asd/project/external-cache.json` (gitignored, machine-local).
- Skip reason appended to `decisions-log.md`.
- Friction entry `F-4` records the recurrence: this is the third consecutive sprint in which external review was unavailable at the iteration where a second opinion carried the most value.
