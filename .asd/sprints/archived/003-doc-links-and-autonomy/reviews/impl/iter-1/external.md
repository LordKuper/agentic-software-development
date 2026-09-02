---
responsibility:
  owns: single reviewer verdict for one iteration, persisted in reduced coverage form
  excludes: other reviewers, other iterations, fixes, the reviewer's full returned ledger, manual-verification spec
  delegates_to: creator agent (fixes), sibling review files (other reviewers), test-plan.md (manual-verification spec)
---

[REVIEW-impl-external]: CONCERNS

# Review — external

- **Phase**: impl-review
- **Iteration**: 1
- **Wrapped CLI**: codex-cli 0.150.1, sandbox read-only, model gpt-5.6-sol/high

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `asd-concept/SKILL.md:81`, `asd-stack/SKILL.md:100-103`, `asd-design-system/SKILL.md:106-109` | AC-3 names 5 artifacts whose producing skills still end in approve-before-write; independently confirms the same gap internal reviewers found, plus the live `checkpoints.md:41` ↔ skill contradiction. | Convert the three skills' final-write phase, or record the exclusion. |
| 2 | high | `asd-pm.md:92-98` | PM's approve-before-write table omits `design-review (final)`, `impl-test (removal)`, `impl-review (final)` rows `checkpoints.md` carries — pre-existing gap on `main`, but AC-4 and Task 7 both claim an exact mirror. | Add the three rows. |
| 3 | high | `asd-phase-design.md:47,64` | Per-artifact `accept`s (prd/ux-spec/adr) produce no decisions-log entry at the gate; line 64 claims all writes here are mechanical/no-gate, contradicting `checkpoints.md:56` (one entry per artifact) and AC-5. | Have each creator step record an accept entry immediately, or amend "State recovery" explicitly and keep line 64 consistent. |
| 4 | high | `asd-phase-design-promote.md:55` | Step 10 inline-composes decisions-log entries for decomposition/new-subsystem — gates step 6 already delegates to `asd-pm`, which records its own approvals. Overlap/double-record, not omission. | Limit step 10 to the ungated items only. |
| 5 | high | `sprint-lifecycle.md:214` | `ADVICE_NEEDED` protocol requires resuming "the same in-flight turn", but `providers.md`'s semantic-operations table has no resume/continue-agent operation for either host — the round-trip isn't executable from the canonical mapping. | Add a "resume in-flight agent" semantic operation mapped per host, or reword to a re-dispatch-with-answer contract. |
| 6 | medium | `asd-phase-plan.md:43` | Accept entry text has no artifact path, required by AC-5/checkpoints.md:56. | Name `<sprint>/plan.md` in the entry. |
| 7 | high | `core.md:57` | "Incremental writing" reuses the `accept` token for per-section lock-in, but `checkpoints.md:15` defines `accept` as advancing the phase/gate — two contradictory readings of the same token mid-artifact. | Use a distinct section-level control (existing Lock in/Revise options); reserve `accept` for the artifact-level gate. |
| 8 | medium | `asd-phase-design-promote.md:14` | "Operations used" still says "PM + creators handle per-doc/per-subsystem approvals" — stale, only PM's decomposition/new-subsystem gates remain. | Reword. |

## Coverage summary (internal reviewers only)

External reviewer — exempt from File-coverage ledger requirement per `review-policy.md`.

## Verdict
CONCERNS: 8 (7 high/major, 1 medium/minor by codex mapping)

## Next action
Merge with internal iter-1 findings into the common pool, route to `impl` review-fix mode. Highest-leverage: #1 (needs scope decision, same as internal implementation/documentation findings), #3/#4 (decide who records gate-linked accepts, align design + design-promote workflows), #5 (make the advisor round-trip executable on both hosts — new finding not caught internally). #2, #6, #7, #8 are local edits.

## Escalations
- finding #1: same scope decision as internal findings — whether the three setup skills are in this sprint's scope.
