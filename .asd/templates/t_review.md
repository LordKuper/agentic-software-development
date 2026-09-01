---
responsibility:
  owns: single reviewer verdict for one iteration, persisted in reduced coverage form
  excludes: other reviewers, other iterations, fixes, the reviewer's full returned ledger (validated pre-write, never persisted verbatim — `review-policy.md`)
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

## Coverage summary (internal reviewers only)

Reviewer returns the complete file+rule coverage ledger (mandatory — verdict INVALID if incomplete; see `review-policy.md`). This file persists only the reduced form below — the gate itself runs on the full returned ledger, before write.

**Summary**: `files: {{checked}}/{{total}} checked, {{n/a}} n/a · rules: {{pass}}/{{total}}, {{findings}} findings`

**n/a rows** (verbatim, full list — file or rule, with reason):
| Item | Reason |
|---|---|
| {{path or checklist item}} | {{n/a reason}} |

**Findings rows** (verbatim, full list — rule-coverage rows resolved `finding #N`; `checked`/`pass` rows dropped):
| Rubric item | Finding |
|---|---|
| {{checklist item}} | finding #{{N}} |

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
