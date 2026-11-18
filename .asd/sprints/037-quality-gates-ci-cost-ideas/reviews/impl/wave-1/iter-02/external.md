[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02
- **Severity floor (this iter)**: medium

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | critical | .asd/workflows/asd-phase-scope.md:49 | [codex F1, wrapped CLI] PR intake takes `<project>` as owner/repo without the origin hostname. When `gh` defaults to another host, listing and mutating PRs (merge, close, included-PR cleanup) can hit the same owner/name on that host. | Resolve the canonical repository hostname; use host/owner/repo for listing, checks, merge, close and included-PR cleanup. |
| 2 | high | .asd/rules/git-strategy.md:77 | [codex F2, wrapped CLI] The scope gate approves a summarized PR revision, but checks-wait and merge target only the PR number. A push while checks are polling can replace the reviewed revision, so a different head can be merged. | Record the approved head SHA, pass it to `gh pr merge --match-head-commit`, and return a changed PR to the scope gate. |
| 3 | high | .asd/workflows/asd-phase-scope.md:49 | [codex F3, wrapped CLI] The fixed `-L 200` list limit omits open PRs beyond 200 from the scope gate; older PRs can be omitted on every intake (AC-12). | Fetch all open PR pages; batch disposition prompts as needed. |
| 4 | high | .asd/runtime.js:2247 | [codex F4, wrapped CLI] Fresh init seeds ceilings only for existing files. The reliability-checklist file created later by an approved item has no ceiling, so the new fail-closed check blocks that sprint's impl gate. | Record an initial ceiling when scope creates the checklist, preserving every existing ceiling. |
| 5 | medium | .asd/runtime.js:2343 | [codex F5, wrapped CLI] The gap-proof gate assumes the second pipe-prefixed line is the separator. A header followed directly by one added-test row with an empty proof is accepted, because that row is discarded as the separator. | Validate the separator and row shape before accepting zero data rows. |
| 6 | medium | .asd/runtime.js:2347 | [codex F6, wrapped CLI] The placeholder check rejects completed proofs containing literal double braces anywhere. A valid parser-test proof that names the literal seeded input is rejected. | Reject only cells that consist of a template placeholder; allow double-brace literals within completed proof records. |
| 7 | high | .asd/workflows/asd-phase-impl-test.md:48 | [codex F7, wrapped CLI] Suite revision bypasses the deletion gate whenever accepted scope asks for a revision, while the removal rule and the tester's escalation rule still require that gate for out-of-scope deletions. A generic revision request can remove tests beyond the approved area or removal criteria. | Reuse scope approval only where it covers the affected area and removal criteria; route other deletions through step 6 and align the tester's escalation rule. |

## Dropped findings (counts only)

- Below severity floor (iter 2, floor medium): 0
- Nitpick, by category: none reported

## Verdict
CONCERNS: 7
dropped: 0
