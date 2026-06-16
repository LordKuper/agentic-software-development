---
responsibility:
  owns: single reviewer verdict for one iteration
  excludes: other reviewers, other iterations, fixes
  delegates_to: creator agent (fixes), sibling review files (other reviewers)
---

[REVIEW-{{PHASE}}-{{REVIEWER}}]: {{APPROVE | CONCERNS | FAIL}}

# Review — {{REVIEWER}}

- **Phase**: {{design-review | impl-review}}
- **Iteration**: {{N}}

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | {{low/medium/high/critical}} | {{file:line or doc section}} | {{what}} | {{how}} |

<!-- when no findings, leave one row: -->
<!-- | — | — | — | no findings | — | -->

## Coverage ledger (mandatory — verdict INVALID if incomplete; see `review-policy.md`)

Every scoped file + every rubric item, no row blank. Internal reviewers only.

### File coverage
| File | Status |
|---|---|
| {{path}} | {{checked / n/a: reason}} |

### Rule coverage
| Rubric item | Status |
|---|---|
| {{checklist item}} | {{pass / finding #N / n/a: reason}} |

## Verdict
{{APPROVE | CONCERNS: <count> | FAIL: <count>}}

## Next action
{{what creator/PM must do next}}

## Escalations (optional)
- finding #{{N}}: requires user approval ({{reason: concept change / new abstraction / scope expansion / contract change}})

## Manual verification (optional, Testing reviewer only)

Only when automated verification is impossible (visual ui, third-party integration, ux interaction).

| # | Requirement (AC-ID) | Steps for user | Result reported by user |
|---|---|---|---|
| 1 | AC-X | 1. {{step}}<br>2. {{step}} | {{pass / fail + notes, filled after user reports back}} |
