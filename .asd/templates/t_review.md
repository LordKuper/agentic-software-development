---
responsibility:
  owns: single reviewer verdict and validated compact coverage for one iteration
  excludes: other reviewers, other iterations, fixes, the reviewer's full returned ledger (validated pre-write, never persisted verbatim — `review-policy.md`), manual-verification spec (test-plan.md's single home)
  delegates_to: creator agent (fixes), sibling review files (other reviewers), test-plan.md (manual-verification spec)
---

[REVIEW-{{REVIEW_PHASE}}-{{REVIEWER}}]: {{APPROVE | CONCERNS | FAIL}}

# Review — {{REVIEWER}}

- **Phase**: {{design-review | impl-review}}
- **Iteration**: {{N}}

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | {{low/medium/high/critical}} | {{file:line or doc section}} | {{what}} | {{how}} |

<!-- when no findings, leave one row: -->
<!-- | — | — | — | no findings | — | -->

## Coverage (internal reviewers only)

Return and persist the compact JSON ledger defined by `review-policy.md` "Coverage ledger", bound to the dispatcher manifest digest. Validate files, every rubric/custom-rule item, applicable section IDs, n/a predicates and finding references before accepting the verdict. The phase writes manifest/ledger evidence alongside this report; reference their relative paths here. Do not generate full prose coverage tables before compression.

## Verdict
{{APPROVE | CONCERNS: <count> | FAIL: <count>}}

## Next action
{{what creator/orchestrator must do next}}

## Escalations (optional)
- finding #{{N}}: requires user approval ({{reason: concept change / new abstraction / scope expansion / contract change}})
