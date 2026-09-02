---
responsibility:
  owns: single reviewer verdict for one iteration, persisted in reduced coverage form
  excludes: other reviewers, other iterations, fixes, the reviewer's full returned ledger, manual-verification spec
  delegates_to: creator agent (fixes), sibling review files (other reviewers), test-plan.md (manual-verification spec)
---

[REVIEW-impl-implementation]: FAIL

# Review — implementation

- **Phase**: impl-review
- **Iteration**: 1

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | AC-3 — `asd-concept/SKILL.md:78-81`, `asd-stack/SKILL.md:100-104`, `asd-design-system/SKILL.md:94-96,106-109` | AC-3's in-scope artifact list is only half implemented. Five of ten named artifacts (`concept.html`, `stack.html`, `DESIGN.md`, `design-system.html`, `accessibility.html`) are still approve-before-write; no plan.md task, stub, or deferral note covers them; `decisions-log.md:53` asserts the opposite of the code ("`stack.html` write-then-review"). | Implement F-1 in the three setup skills this sprint, or escalate to narrow AC-3 with a recorded deferral. |
| 2 | medium | AC-8 — `plan.md:124-128` vs the same three skill files | Task 12's grep sweep claims zero stale hits but never opened the three setup skills the audit had explicitly named as touched areas. | Re-run the sweep over `.asd/skills/**` after F-1 resolved. |
| 3 | low | AC-4 — `checkpoints.md:22-31` | New approve-before-write table's "Gate position" column empty for 7/8 rows. | Drop the column or fill it. |
| 4 | low | AC-1/AC-2 — `asd-phase-plan.md:13,25,68`; `asd-phase-design.md:81` | Stale "section approval flow" phrasing, dangling `language-policy.md` reference. | Reword and re-point references. |
| 5 | low | AC-2 — `asd-phase-scope.md:30` | Sub-step 1's "chat only" refine instruction invites posting body content before the step-3 write. | Reword to "refine internally, do not post the body". |
| 6 | low | AC-4 — `asd-phase-audit.md:7` | Precondition still says "sprint.md approved" instead of "accepted". | Reword. |

## Coverage summary (internal reviewers only)

**Summary**: `files: 25/25 checked, 0 n/a · rules: 2/3, 1 finding`

**n/a rows**: none.

**Findings rows**: Every AC-N has a corresponding code path → finding #1. No AC implemented partially without explicit follow-up → finding #1.

## Verdict
FAIL: 1 (high) + 5 (1 medium, 4 low CONCERNS-level)

## Next action
FAIL escalates to the user (Complication Approval format): decide between implementing F-1 in the three setup skills this sprint, or narrowing AC-3 with an explicit recorded deferral. F-2 follows F-1. F-3 through F-6 are autonomous dev fixes regardless of the F-1 decision.

## Escalations
- finding #1: scope question only the user can settle — AC-3 as written is unambiguous but the omission may have been an intended narrowing never written down. Present both options.

**Escalation resolved**: user chose "implement now" — convert `/asd-concept`, `/asd-stack`, `/asd-design-system` final gates to write-then-review-accept this sprint, per AC-3 as originally written. Finding #1 stays in the fix set (not overridden).
