[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 3 (severity floor `high`)
- **Scope**: incremental diff `654f8fb...HEAD`, 13 files

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `tests/run.js:1442-1443, 1445` | Three in-body comment lines added by this delta inside the new `test('update driver: planUpdate's pending-migration preview unions …')` callback body. `code-style.md` §7 bans comments inside method/function bodies unconditionally, with `// TODO(sprint-<NNN-slug>):` the only permitted in-body marker; §17 grants tests no carve-out. This repo's own Node code is governed by §7 per the iter-01 user decision recorded in `decisions-log.md` (the `AGENTS.md` exemption removed), and the iter-01 fix cycle already cleaned exactly this class out of `tests/run.js` — the delta reintroduces it, on the sprint's own AC-8 surface. Not a pre-existing-comment case (`sprint.md` non-goal): these lines are new in this diff. | Delete all three lines. The two facts they narrate are already carried by the test name and by the assertion message; if the local-vs-upstream distinction needs to be explicit, encode it in the fixture variable names (`upstreamOnlyMigration` / `localOnlyMigration`) rather than in comments. |

## Coverage

**Summary**: `files: 13/13 checked, 0 n/a · rules: 5/10 pass, 4 n/a, 1 finding`

**`n/a` rows (full list)**

| Item | Reason |
|---|---|
| HTML shell wrapping | no HTML artifact in this iteration's change surface |
| Provenance flag correctness | no provenance-bearing artifact in this iteration's change surface |
| Traceability (PRD AC → ADR) | `documents.prd`/`documents.adr` disabled (self-hosting lean profile); no PRD/ADR exists |
| Persistent actuality vs implementation | no persistent `docs/` tree in this repo; the framework-mode README/`.asd/rules/**` check applies instead |

**Finding rows (verbatim)**

| Rubric item | Finding |
|---|---|
| In-code doc comments (`code-style.md` §7/§8) | finding #1 |

## Invariant verification (the iteration's central question)

The APPROVE-latch invariant reads consistently in every home it touches, with no residual satisfaction-by-latch consultation:

- `sprint-lifecycle.md` — stated once in "APPROVE latch"; the latch-write paragraph, the red-full-suite invalidation ("clears the dispatch-skip optimisation only … can NEVER retroactively change satisfied-vs-blocking") and "State recovery" ("absent key: always blocking, no exception; neither gating consumer consults `latched`") all defer to it rather than restating a competing rule.
- `asd-phase-impl-review.md` step 8 / `asd-phase-design-review.md` step 9 — both write an entry for every required reviewer including latch-skipped, mark the latch write as dispatch bookkeeping only, and instruct aggregation to read `verdicts["iter-NN"]` alone.
- `asd-phase-pr.md` step 4 — "an absent key always blocks, no exception (the invariant guarantees a latch-skipped reviewer's key is written anyway, so this gate never consults `reviews.impl.latched`)". The pre-4.0.0 legacy branch and the availability-skip branch are both preserved, so no upgrade path loses its satisfied case.
- `session-start.js` — `lastReviewVerdict` no longer reads `latched`; the retained comment sits above the function, states purpose, and the old `AC-2`/document references are gone.

The design-review Correctness dispatch rule likewise resolves consistently: `asd-phase-design-review.md` step 7 is the mechanism home, `review-policy.md`'s DoD row and paragraph state the consequence (dispatched and required only when a ux-spec/design-system draft is in the set; otherwise not dispatched and not counted, "an agent-level skip, distinct from the latch"), `asd-reviewer-correctness.md`'s stop condition (3) points at the workflow, and README's paragraph is scoped to impl-review only.

## Judged and dropped below the `high` floor

Recorded so the ledger is not mistaken for an unexercised one:

1. **Aggregation branch labels still read "All APPROVE or latched"** in both review workflows. A stale label, not a residual rule: the imperative sentence immediately preceding each says aggregation reads `verdicts["iter-NN"]` alone, and under the invariant a latch-skipped reviewer's inherited `APPROVE` is already in that map, so the `or latched` disjunct cannot select a satisfied outcome `verdicts` does not already carry. The same reading applies to the outcome-level shorthands in `review-policy.md`, `sprint-lifecycle.md`'s phase table, `checkpoints.md`, `asd-phase-pr.md`'s prerequisite bullet, `t_test-plan.md` and README — all describe the user-visible result, none instructs a consumer to read `latched`. Clarity-grade.
2. **`sprint-lifecycle.md` "State recovery" slightly overstates the hook's legacy-skip handling** — it says the hook counts a legacy `"skipped: …"` value as satisfied, whereas the rewritten `lastReviewVerdict` requires at least one `APPROVE`-shaped value before returning green, so an all-legacy-skip map reads `mixed` (as the rewritten test asserts). Display-only, never a gate; wording-precision grade.
3. **README counts design-review as "3 internal reviewers"** without noting Correctness's conditional dispatch. Pre-existing phrasing, not introduced by this delta; the conditionality is stated in the row below it and in the SSoT.
4. **Two `plan.md` document references survive in unchanged comments** at `tests/run.js:987` and `:1453` (§8). Outside this iteration's change surface and not made incorrect by this delta — information for the `pr` gate, not a finding.

## Verdict

CONCERNS: 1

## Next action

`asd-dev` autofixes finding #1 in place — a three-line deletion, no escalation, no contract or behaviour change; the test's assertions are untouched, so no re-run of impl-test authoring is implied beyond the suite staying green. Everything else in this delta is clean at the `high` floor.

## Escalations

None.
