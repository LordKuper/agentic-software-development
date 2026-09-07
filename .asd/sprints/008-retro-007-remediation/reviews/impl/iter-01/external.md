[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: 1
- **Severity floor (this iter)**: low
- **Provider**: codex (`gpt-5.6-sol`), preflight `local-ready`, fingerprint `3dba9a29…`

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| X-1 | major | `sprint-lifecycle.md:112` (self-hosting change-surface list) + `external-review/t_review-scope.json` `exclude_paths` (self-hosting row) | `.claude/agent-memory/**` is defined earlier in the same section as legitimate hand-authored Dev output (not generated), but the self-hosting review change-surface exclusion is `.claude/**` as a blanket glob, and the `exclude_paths` this dispatch shipped matches it literally. Verified against this sprint's own diff: `.claude/agent-memory/asd-dev-critical/MEMORY.md` and `project_parallel-agent-commit-sweep.md` were added by this sprint but never entered `files[]`, so no reviewer — internal or external — covers hand-authored memory content this or any future sprint. | Narrow the self-hosting exclusion glob to the actually-generated `.claude/` subtrees (whatever `sync.js --apply` writes) and keep `.claude/agent-memory/**` in scope, or state the carve-out explicitly next to the exclusion list. |
| X-2 | major | `artifact-layout.md` sprint-folder tree + its "holds only the artifacts named above" sentence | `review-policy.md`'s split-dispatch mechanism (and `asd-phase-impl-review.md` step 7a / `asd-phase-design-review.md` step 8a) requires writing `<reviewer>.part-1.md`/`.part-2.md` into the same `iter-NN` folder, but the path map — the sole SSoT for what is allowed there — names only `<reviewer>.md`. As written, the documented split-review output violates the authoritative path map the first time it fires. (Independently found by correctness as C-3, which additionally covers the coverage-manifest/ledger files.) | Add `<reviewer>.part-{1,2}.md` to the `reviews/<phase>/iter-NN/` tree entry, or point that tree line at `review-policy.md` "Interrupted dispatch and split dispatch" as the allowed-content SSoT for the folder. |
| X-3 | major | `review-policy.md:145` + `asd-phase-impl-review.md` step 7a/8, `asd-phase-design-review.md` step 8a/9 | Interrupted-attempt counts are explicitly "never a `state.json` field" and are only durably recorded (review-file `Interrupted attempts:` line + decisions-log append) at step 8/9, which runs only once a verdict token exists. The user-decision escalation for a twice-interrupted split half is reached *before* any verdict exists for that half, so nothing durable records that the reviewer already burned two interrupted attempts. A session loss at that escalation point loses the interruption history entirely — resume has no on-disk signal to avoid silently retrying the same failure path, nor context for why escalation triggered. (Overlaps correctness C-8, which proposes persisting the counter.) | Append the interruption count and cause to `decisions-log.md` at the moment escalation is triggered, not deferred to the verdict-parse step, independent of whether a verdict is ever produced for that half. |
| X-4 | low | `.asd/runtime.js:34-40` (`riskEntry`) | A typed risk object with extra unrecognized keys (e.g. `{name, target:"artifact", unknown:true}`) is silently accepted and stripped to `{name, target}` rather than rejected. `name`/`target` are still independently validated, so routing is unaffected — a schema-strictness gap, not a live routing bug, and AC-10's own coverage does not require rejecting extra keys. | Optional: tighten `riskEntry` to reject unknown own-keys if strict-schema is desired; not required for correctness. |
| X-5 | low | `sprint-lifecycle.md:316` (`derived_handoff`) | The cache-reuse rule is deterministic by construction — a matching-key read reproduces exactly what fresh derivation would produce, so the "matching-key but corrupted cache" scenario the wrapped model raised is a general defensive-coding concern rather than a defect specific to this design. Recorded only because the wrapped model rated it critical and that rating did not survive verification against the actual invariant. | None required; optionally add a `tests/run.js` case asserting cache-hit output equals fresh-derivation output for the same `base`/`head`/`pathspec`, as a regression guard. |

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): 0
- Nitpick, by category: none dropped

Two of the wrapped model's five findings (its F1 rated critical, F2 rated major) were downgraded to low after verification against the actual rule text and code — see X-4 and X-5. Nothing was dropped outright.

## Iteration semantics

Iteration 1 — no previous finding set, so no stalemate detection this round.

## Verdict

CONCERNS: 5

## Next action

Route X-1, X-2 and X-3 to impl review-fix mode. X-1 needs an exclusion-glob or carve-out fix in `sprint-lifecycle.md` (and confirmation that `t_review-scope.json`'s self-hosting-row exclude list follows); X-2 needs an `artifact-layout.md` path-map addition or SSoT pointer, and converges with correctness C-3; X-3 needs the `decisions-log.md` append moved earlier in the escalation path in both `*-review` workflows, and converges with correctness C-8. X-4 and X-5 are informational — no fix required to close this iteration on their account.
