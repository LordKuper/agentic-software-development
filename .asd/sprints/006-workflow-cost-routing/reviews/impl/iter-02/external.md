[REVIEW-impl-external]: APPROVE

# External Review Report

- **Phase**: impl-review
- **Iteration**: 2
- **Severity floor (this iter)**: medium
- **Provider**: Codex CLI (host = Claude Code)
- **Transport**: scope manifest (first dispatch under it) — [`scope-manifest.json`](scope-manifest.json), `mode: "files"`, 32 paths, `base_ref` `11333cb`, `head_ref` `60a991a`

## Availability skip

Preflight returned `local-ready` (fingerprint `7fdbd8c9…464213`; iteration 1's negative-cache entry had expired and was pruned). The real model request still failed:

- Full-prompt attempt (compact prompt + `scope-manifest.json` piped to `codex exec --model gpt-5.6-sol -c model_reasoning_effort="high" --sandbox read-only -`): `ERROR: You've hit your usage limit. ... try again at 3:19 PM.`
- One-retry minimal probe (`echo "ping" | codex exec …`): same error, same reset time.

Both failed before Codex read a single `files[]` path — provider-side quota exhaustion, not a transport or prompt problem. Recorded via `external-record-failure` with `status=quota`, `retryAfter=now+1h` (max bounded TTL). No fabricated findings.

## Kept findings

None — no review request completed.

## Dropped findings (counts only)

- Below severity floor (iter 2, floor medium): n/a (no review ran)
- Nitpick, by category: n/a

## Scope-manifest transport feedback (first consumer)

- **Invoking-side cost dropped sharply.** No `git diff` needs rendering or piping: the prompt was ~2.9 KB of instruction text plus a ~0.9 KB manifest read straight from the phase-supplied file, comfortably under the command-length cliff that forced iteration 1 into a `--stat`-only fallback. For a 32-file scope this is roughly an order of magnitude cheaper than shipping a diff.
- **Unvalidated**: whether `files[]` alone (no diff) is sufficient for the wrapped model to produce a good review is still open — Codex never got past its quota gate to read any file. First successful run must confirm it.
- **Contract gap**: `.asd/templates/external-review/t_review-scope.json` does not declare `exclude_paths` in its field list, while `external-review.md` and `asd-external-review.md` both require the reviewer to honor it. Cross-file inconsistency, raised on its merits.
- **Operational gap**: `cachePath` has no documented convention anywhere in canon — only `tests/run.js` exercises it, against a throwaway temp path. This dispatch chose `.asd/project/external-cache.json`; the phase orchestrator had used `.asd/project/.external-cache.json` in iteration 1. Reinvented per caller, which is exactly what a negative cache keyed by fingerprint cannot afford.

## Verdict

APPROVE (skipped: quota — Codex usage limit, retry after ~15:19)

## Next action

Record in `state.json.reviews.impl.verdicts["iter-02"].external` as `"APPROVE (skipped: quota — Codex usage limit)"`; never write it to `latched` (availability-skip carve-out). Two iterations in a row have now skipped on the same account limit, so the transport change remains unvalidated end-to-end — worth a deliberate re-dispatch once quota clears rather than letting the sprint close with External Review never having run.
