[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: 2
- **Severity floor (this iter)**: medium
- **Wrapped provider**: codex (`gpt-5.6-sol`, high reasoning, read-only sandbox), awaited inside this dispatch. Iteration 1's quota block had expired; preflight `local-ready` and the run completed.

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| X-1 | high | `.asd/workflows/asd-phase-impl.md:61` | Carry-over of an iteration-1 finding in a narrower residual form: the "one ordered chain, never a concurrent set" invariant is stated for fix-mode dispatch, but the same clause routes test-file findings to `asd-tester` as a second, separately dispatched chain. The doc never states how the dev chain and the tester chain serialize against each other, so two agents can legitimately be in flight at once — contradicting the guarantee the clause itself asserts. | State explicit serialization between the two chains (dev chain completes and hands its full resulting context to the tester chain, or a stated reverse order) so at most one agent is ever in flight; route each chain to its role/tier per the existing step 5a rule, and ensure the later chain receives the complete preceding-fix context. |

## Dropped findings (counts only)

- Below severity floor (iter 2, floor medium): 0
- Nitpick: none

## Stalemate check

Iteration 1's finding set was supplied for stalemate detection. Every other class from it — the unregistered late artefact, the one-sided reviewer-memory commit obligation, the third external outcome, the falsified CRLF memory, the manifest-digest identity break, the missing latch route, the false lint equivalence, the missing `.gitattributes` allowlist entry, the overstated cost unit, the in-body comments and the `test-plan.md` record gaps — verified resolved in this delta and explicitly not re-opened. Only the AC-10 class survives, in the narrower two-chain form above; this is its second appearance and is flagged as such rather than raised as new.

## Note on the wrapped run's own self-test

Codex ran `node tests/run.js` inside its read-only sandbox and reported 85/171 with `EPERM mkdtemp` failures. That is sandbox noise, not a review finding — the suite's temp-directory tests cannot run without write access. The repo's real suite state is the one recorded in `test-plan.md` `Suite run` and `decisions-log.md`.

## Verdict

CONCERNS: 1 (high)

## Next action

Route to `impl` review-fix mode with the internal findings. Either state the dev-chain/tester-chain serialization in `asd-phase-impl.md` step 5 — closing the AC-10 class for real — or record an explicit rationale if concurrency between the two chains is the accepted design, in which case the finding converts to a documented exception rather than a defect.

## Escalations

None.
