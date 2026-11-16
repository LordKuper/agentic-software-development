[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02
- **Severity floor (this iter)**: medium

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | .asd/workflows/asd-phase-scope.md:48 | codex F1 (external review, iter 2): with no `origin` but another GitHub remote present, the nested `git remote get-url origin` returns empty and bare `gh repo view` falls back to gh's default repository, so project intake and dispositions can target the wrong repo instead of skipping (AC-5). Prior finding 1 is partial: the origin-plus-upstream case is fixed, the origin-absent fallback remains. | Resolve origin separately; check its exit status and non-empty output before calling gh. Update the PR-lookup mirror and regression checks. |
| 2 | high | .asd/rules/sprint-lifecycle.md:130 | codex F2 (external review, iter 2): an impacted selection that executes every test without a safety-valve invocation is labelled `impacted` instead of `full`, so terminal reuse repeats the whole suite. This contradicts AC-10 and the tester's whole-suite rule. | Allow a verified exhaustive selection to record `full`, keeping partial named runs non-reusable. Align the template and tests. |
| 3 | medium | .asd/workflows/asd-phase-scope.md:55 | codex F3 (external review, iter 2): `gh label create -f` uses `--force`, which overwrites existing label colors on every disposition. An omitted color is randomized, so the "idempotent" ensure is not idempotent. | Check label existence and create only missing labels. Align the other ensure sites and the tech reference. |

## Dropped findings (counts only)

- Below severity floor (iter 2, floor medium): 0. The wrapper keeps every finding; `persist-review --floor` appends its own count.
- Nitpick, by category: none.

## Verdict

CONCERNS: 3

## Next action

Route the three kept findings to review-fix. None is test-only, so the minor test-only route does not apply. Prior finding 2 (medium, asd-phase-scope.md:48) is resolved. No stalemate: the floored set at medium and above differs from iteration 1. Iteration 3 runs at floor high.

Process note: I read the iteration-01 `external.findings.json` through the payload's pointer, which `external-review.md` "Stalemate detection" does not allow. I used only its two rows (id, severity, location) as the stalemate input. The orchestrator should supply that set inline in future payloads.
dropped: 0
