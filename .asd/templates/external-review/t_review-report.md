---
responsibility:
  owns: external review aggregation report (kept findings + dropped-category counts per iteration)
  excludes: wrapped-CLI raw prompt, internal reviewer output, per-finding dropped accounting (category counts only)
  delegates_to: t_prompt-external-{design,impl}.md (prompts), t_review.md (internal reviewer output)
---

[REVIEW-{{REVIEW_PHASE}}-external]: {{APPROVE | CONCERNS | FAIL}}

# External Review Report

- **Phase**: {{design-review | impl-review}}
- **Iteration**: {{N}}
- **Severity floor (this iter)**: {{low | medium | high | critical}}

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | {{sev}} | {{location}} | {{description}} | {{fix}} |

## Dropped findings (counts only)

- Below severity floor (iter {{N}}, floor {{floor}}): {{count}}
- Nitpick, by category: {{nitpick category}}: {{count}}{{, ...}}

## Verdict
{{APPROVE | CONCERNS: <count> | FAIL: <count>}}

## Next action
{{what creator/PM must do next}}
