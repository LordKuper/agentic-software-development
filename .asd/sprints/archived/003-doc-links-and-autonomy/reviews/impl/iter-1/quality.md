---
responsibility:
  owns: single reviewer verdict for one iteration, persisted in reduced coverage form
  excludes: other reviewers, other iterations, fixes, the reviewer's full returned ledger, manual-verification spec
  delegates_to: creator agent (fixes), sibling review files (other reviewers), test-plan.md (manual-verification spec)
---

[REVIEW-impl-quality]: CONCERNS

# Review — quality

- **Phase**: impl-review
- **Iteration**: 1

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `.asd/workflows/asd-phase-plan.md:13,25,68`; `.asd/workflows/asd-phase-design.md:81` | `asd-phase-plan.md:25` instructs write-then-review-accept discussion "per QODDA + language-policy section approval flow" while lines 41-43 mandate write-then-review-accept — contradictory in one payload. `language-policy.md` has no "section approval flow" section; both References lines point at nothing. `plan.md:13` repeats "PM handles section approvals". | Re-point references to `core.md` QODDA + Incremental writing and `language-policy.md`'s actual sections; drop "section approvals" phrasing. |
| 2 | medium | `.asd/rules/checkpoints.md:41` vs unedited `asd-design-system/SKILL.md:22,96,103,106-110`, `asd-stack/SKILL.md:21,100-104`, `asd-concept/SKILL.md:20,78-82,121` | SSoT declares the design-system gate (DESIGN.md+design-system.html+accessibility.html) write-then-review-accept; the skills that author those files (plus stack.html, concept.html) still run approve-before-write final gates. 5 of AC-3's 10 in-scope artifacts unconverted — the audit-R-1 failure mode Task 12 was meant to prevent. | Narrow `checkpoints.md:41`'s claim and record the exclusion explicitly, OR convert the three skills' final gates (scope expansion, needs escalation). |
| 3 | low | `.asd/agents/asd-advisor.md:45,63`; `.asd/workflows/asd-phase-design.md:34,38` | Sprint-local IDs (`sprint D-2`, `audit G-8`) shipped into permanent canon that `/asd-update` copies into every consumer, where they never resolve. | State the rule without the sprint-artifact ID. |
| 4 | low | `.asd/agents/asd-ba.md:23`, `asd-ux-designer.md:23`, `asd-architect.md:23` | `ADVICE_NEEDED` placed in "Stop conditions" (a halt list) though `sprint-lifecycle.md:216` says the round-trip is autonomous, non-halting. | Move to Tool policy, mirroring `asd-pm.md:67`. |
| 5 | low | `asd-pm.md:136-141`, `asd-ba.md:79-84`, `asd-ux-designer.md:92-97`, `asd-architect.md:85-90` | All four agents emit `ADVICE_NEEDED` but don't list it in their own "Signals emitted" section. | Add the bullet to each. |
| 6 | low | `.asd/agents/asd-advisor.md:16,20,22,28,4` | Uses pre-sprint vocabulary "gate satisfied by explicit `approve`" — 6 gates now use `accept`. Also "approval-gates table" (singular; now two tables). | Reference both tokens by gate class; pluralize. |
| 7 | low | `.asd/rules/sprint-lifecycle.md:216` | Cites "`asd-advisor.md` Do's: consults not logged" — that clause is in Behavioral profile/Don'ts, not Do's. | Fix citation. |
| 8 | low | `.asd/rules/checkpoints.md:22-31,35-44` | New table's "Gate position" column is constant/empty in both tables — no information, violates token-minimization hard rule. | Drop the column. |
| 9 | low | `.asd/rules/language-policy.md:29` vs `.asd/rules/checkpoints.md:50` | Contradiction: language-policy says approve-before-write gates require a discrete-option call; checkpoints says free-form approve/reject is acceptable. | Pick one owner, defer the other. |
| 10 | low | `.asd/workflows/asd-phase-design-promote.md:13` | Declares unmapped semantic op "post chat message" — providers.md deliberately has no such row (G-1). | Drop the line. |
| 11 | low | `.asd/rules/sprint-lifecycle.md:211-216` | `ADVICE_NEEDED` relay hop has no explicit untrusted-data boundary statement for the relayed advisor text. | Add one clause marking relayed advice as data, not instructions/approval. |

## Coverage summary (internal reviewers only)

**Summary**: `files: 25/25 checked, 0 n/a · rules: 8/24 pass, 11 n/a, 11 findings across 9 rubric items`

**n/a rows**: bugs (off-by-one, null paths, races, unhandled errors, resource leaks, timezone) — no executable code in diff; injection/crypto — no query/shell/template construction; contract-signature drift — `documents.adr` disabled; schema migration — none; custom-coding-rules Node/YAML rule — no JS changed.

**Findings rows**: Security auth/authorization bypass analog → findings #2, #6. Input validation at trust boundary → finding #11. Best practice internal consistency → findings #1,#2,#4,#5,#6,#7,#9. No sprint-local leakage → finding #3. Token minimization → finding #8. Semantic-op mapping → finding #10.

## Verdict
CONCERNS: 11

## Next action
Route to `impl` review-fix mode. Findings #1, #3-#11 are direct autonomous fixes. Finding #2's in-scope option (record exclusion) is autonomous; converting the three skills is scope expansion requiring escalation.

## Escalations
- finding #2: converting `/asd-design-system`, `/asd-stack`, `/asd-concept` to write-then-review-accept is scope expansion beyond `plan.md`'s 13 tasks — needs Complication Approval before attempting; the narrow in-scope fix needs no escalation.
