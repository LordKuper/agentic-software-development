---
responsibility:
  owns: single reviewer verdict for one iteration, persisted in reduced coverage form
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

## Coverage summary (internal reviewers only)

Reviewer returns the complete file+rule(+section, Correctness/Efficiency only) coverage ledger (mandatory — verdict INVALID if incomplete; see `review-policy.md` "Coverage ledger"). This file persists only the reduced form below — the gate itself runs on the full returned ledger, before write.

**Summary**: `files: {{checked}}/{{total}} checked, {{n/a}} n/a · rules: {{pass}}/{{total}}, {{findings}} findings`{{ · sections: {{reviewed}}/{{total}}, none blank — Correctness/Efficiency only}}

**Section-coverage ledger** (Correctness, Efficiency only — one row per named rubric section, every dispatch):
| Rubric section | Status |
|---|---|
| {{section name}} | {{reviewed — findings/pass \| n/a: <reason>}} |

**n/a rows** (verbatim, full list — file, rule, or section, with reason):
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
