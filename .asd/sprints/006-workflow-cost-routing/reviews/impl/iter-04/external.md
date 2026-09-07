[REVIEW-impl-external]: APPROVE

# External Review Report

- **Phase**: impl-review
- **Iteration**: 4
- **Severity floor (this iter)**: high
- **Provider**: Codex CLI (host = Claude Code)

## Availability skip — no dispatch occurred

`node .asd/runtime.js external-preflight` returned, before any agent was spawned:

```json
{"status":"negative-cache","reason":"quota","retry_after":1788776126934,"model_access":"unknown","fingerprint":"7fdbd8c96f72305a6852f13de84b2dae5349297dba64ba8539a2234418464213"}
```

exit 1. The quota failure recorded in iteration 2 is still inside its bounded TTL, so the phase skipped External Review without dispatching the agent — the second consecutive iteration where the negative cache converted a doomed round trip into one local probe pair.

## Kept findings

None — no review request was made.

## Dropped findings (counts only)

- Below severity floor (iter 4, floor high): n/a (no review ran)
- Nitpick, by category: n/a

## Verdict

APPROVE (skipped: negative-cache — quota)

## Next action

Record as `"APPROVE (skipped: negative-cache — quota)"`; never write to `latched`.

**Standing risk for sprint closure**: External Review has now been unavailable for four consecutive iterations. The scope-manifest transport this sprint introduced — and then twice corrected, once for a missing `exclude_paths[]` field and once for semantics that made the reviewer's own inputs unreadable — has never been exercised by a real wrapped-CLI run. Both corrections were found by internal review reading the contract, not by running it. The transport should be validated end-to-end before the sprint closes, or the residual risk recorded explicitly as accepted.
