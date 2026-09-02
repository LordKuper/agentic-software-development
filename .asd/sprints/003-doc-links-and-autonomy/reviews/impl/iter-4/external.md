---
responsibility:
  owns: single reviewer verdict for one iteration, persisted in reduced coverage form
  excludes: other reviewers, other iterations, fixes, the reviewer's full returned ledger, manual-verification spec
  delegates_to: creator agent (fixes), sibling review files (other reviewers), test-plan.md (manual-verification spec)
---

[REVIEW-impl-external]: CONCERNS

# Review — external

- **Phase**: impl-review
- **Iteration**: 4
- **Wrapped CLI**: codex-cli 0.150.1, sandbox read-only, gpt-5.6-sol

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `checkpoints.md:62` vs `sprint-lifecycle.md:231`, all 3 setup skills | "Recording scope" clause (b)'s "append if a sprint exists" branch has no permitted writer — no skill contains an active-sprint detection step or a decisions-log append; two secondary gaps: /asd-design-system unlisted (same as quality#4), and phase-advance exemption for standalone gates only implied. | Drop the "append if sprint exists" branch entirely (accepted file in git history is the record — simplest, matches skills' "no active sprint required"); add /asd-design-system to the list; state explicitly standalone gates never advance phase. |
| 2 | high | `asd-concept:75`, `asd-stack:80`, `asd-design-system:83` | Regression from this round's write-first conversion: skeleton now written with placeholder sections up front; option C) Skip has no removal step, so a skipped optional section's placeholder remains in the artifact presented at the accept gate — old flow only wrote locked-in sections, so Skip meant omit; now it means leave a stub. | Add: "on C: remove that optional section (heading + placeholder) from the on-disk file, then continue". |

**Stalemate check**: iter-3 P1 (design-system combined entry) resolved. P2 (standalone gate obligation) partially resolved — no-sprint case fixed, active-sprint case still unassigned (this iteration's finding #1, narrower). Finding #2 is new (introduced by iter-3's fix round).

## Coverage summary (internal reviewers only)

External reviewer — exempt from File-coverage ledger requirement per `review-policy.md`.

## Verdict
CONCERNS: 2 (both high)

## Next action
Route to `impl` review-fix mode. Both autofixable. Note for iter-5: floor moves to critical — ensure #1 is actually closed this round.

## Escalations
None.
