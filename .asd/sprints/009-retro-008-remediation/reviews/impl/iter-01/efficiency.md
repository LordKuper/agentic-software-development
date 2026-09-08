[REVIEW-impl-efficiency]: CONCERNS

# Review — efficiency

- **Phase**: impl-review
- **Iteration**: 1 (severity floor: low)
- **Scope**: 21 files, `main` (f1b15bf) … `e40343e`

## Findings

| # | Severity | Category | Location | Description | Suggested fix |
|---|---|---|---|---|---|
| E-1 | medium | simplify | `.asd/rules/review-policy.md:42`; mirror gap at `.asd/rules/git-strategy.md:39` | AC-13b's obligation ("the phase workflow that writes a reviewer's review file commits that reviewer's memory writes in the same commit") lands only in review-policy prose. `git-strategy.md:39` — sole home of commit ownership, which the new clause explicitly cites as the rule it carves out of — still enumerates orchestrator-committed bookkeeping as "`state.json`, `decisions-log.md`, review files, `friction-log.md`" and does not name agent memory; neither review workflow has a step for it. By this sprint's own thesis, AC-13b is the one criterion that got no agent/workflow-side landing (AC-1→`asd-dev.md`, AC-2/AC-11→`asd-phase-impl.md`, AC-3→`asd-phase-scope.md`, AC-8→`asd-external-review.md` all did). | Net-zero prose: extend `git-strategy.md:39`'s enumeration with the one file class, and reduce `review-policy.md:42`'s second sentence to a citation of it. |
| E-2 | medium | simplify | `.asd/rules/review-policy.md:150`; `.asd/rules/artifact-layout.md:43-44`, `:68` | AC-14 introduces a new sprint-tree artefact class, `<reviewer>.late.md`, registered nowhere: the path map (edited by this same sprint) lists only `<reviewer>.md, <reviewer>.part-N.md`, and `:68` declares the folder's contents exhaustive. A workflow obeying review-policy writes a file the layout SSoT forbids. Grep confirms `late.md` appears only in `review-policy.md` and `tests/run.js`. | Cheapest: add `<reviewer>.late.md` to both review rows of the path map (the `part-N.md` precedent is the established registration pattern). Simpler still, if the class is unwanted: append admitted late findings as a marked section inside the existing `<reviewer>.md`, which already carries the merged-token shape — no new artefact class at all. |
| E-3 | low | simplify | `.asd/rules/review-policy.md:144` and `:150` (closing sentence) | One fact, two homes, six lines apart, both inside the change surface: `:144` scopes the Late-duplicate-return branch ("holds for any replaced dispatch, External Review included") and `:150`'s closing sentence re-scopes it. | Keep the scoping in `:144` only and drop the closing sentence of `:150` (or the reverse). No test pins the `:150` sentence. |
| E-4 | low | simplify | `.asd/workflows/asd-phase-impl.md:61` | The fix-mode graph bullet ends with historical rationale read on every impl dispatch, restating `sprint.md` AC-10's own justification. The instruction is complete without it. It also has a measured downstream cost, already recorded in the tester memory under review (`project_testability-envelope.md:51-54`): narrating the rejected alternative forces `tests/run.js:3423` to assert absence of three specific phrases instead of the topic word. | Drop the trailing sentence; the rationale is preserved in `sprint.md` AC-10 and `decisions-log.md`. `tests/run.js:3418-3427` stays green. |

## Checked and found clean (premises verified, no finding raised)

- **`.asd/runtime.js` AC-5** — one exported constant genuinely shared by emitter and validator; no second hard-coded status list anywhere; no prose in `.asd/{rules,workflows,agents,templates,skills}` restates the values. The backward-tolerance branch has a real consumer (every manifest written before this sprint), so it is not defensive-for-impossible.
- **SC-1 on `.asd/runtime.js`** — standing user override (single-file); judged only on new code: no dead fields, no unused returns, the new export is consumed by `tests/run.js`.
- **`checkpoints.md` "Criterion cost surfacing"** — tested the premise that "iterations charged" would read 0 by construction (no `AC-N` column in `t_review.md`'s finding table). **False**: sprint 008's review files carry 71 `AC-N` references across 22 files, so the unit is derivable at read time. No new state; measurement point and unit both named.
- **`asd-external-review.md` await obligation in Tool policy `:66` and Don'ts `:104`** — deliberate, matching the repo's positive/negative agent-file convention.
- **`Reachability:` declaration (AC-12)** — conditional, has a named reader (plan approval), absence semantics stated once to prevent conflation with `Material risk`'s fail-closed default; `t_plan.md` mirrors the same comment+placeholder shape.
- **`.gitattributes`** — two lines, repo-scoped, no `managed_paths` entry, no template, no seeding step. Exactly the authorized mechanism, nothing around it.

## Performance sections (executable scope: `.asd/runtime.js`, `tests/run.js`)

- **Perf budget compliance** — `n/a` per the manifest-authorized predicate (no perf-budgets section in `custom-coding-rules.md`).
- **Perf anti-patterns** — none. No n+1, no sync IO on a hot path, no unbounded allocation.
- **Algorithmic complexity** — none. New validator work is O(rows) with `Set`/`Map` lookups.
- **Regression detection** — no baselines exist or are required; nothing in the diff changes an algorithm's complexity class. `validateCoverageLedger` gained two constant-time checks.
- **Hot path identification** — `runtime.js` is a short-lived CLI invoked once per dispatch, so startup dominates; no caching point warranted. The two new full-canon sweeps in `tests/run.js` cost milliseconds and match the existing §16 sweep pattern.

## Coverage

Validated compact ledger: [`efficiency.ledger.json`](./efficiency.ledger.json) against [`efficiency.manifest.json`](./efficiency.manifest.json), findings [`efficiency.findings.json`](./efficiency.findings.json). `validate-ledger` → `{"ok":true}`. 21/21 files, 14/14 rules `pass`, 8/8 sections resolved. None of the four findings is a checklist hit — all four are complexity-vs-value judgments.

## Verdict

CONCERNS: 4 (2 medium, 2 low)

## Next action

Route to `impl` review-fix mode. All four are creator-autofixable — none adds an abstraction, layer, or dependency, so no Complication Approval is required. Per "Verify before applying", re-read each cited path at current `HEAD`: E-1 and E-2 turn on what `git-strategy.md:39` and `artifact-layout.md:43-44`/`:68` say now, and E-2's fix must not break `tests/run.js:3331`.

## Escalations

None.
