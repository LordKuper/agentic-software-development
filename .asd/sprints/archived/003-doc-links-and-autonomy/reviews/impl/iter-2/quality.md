---
responsibility:
  owns: single reviewer verdict for one iteration, persisted in reduced coverage form
  excludes: other reviewers, other iterations, fixes, the reviewer's full returned ledger, manual-verification spec
  delegates_to: creator agent (fixes), sibling review files (other reviewers), test-plan.md (manual-verification spec)
---

[REVIEW-impl-quality]: CONCERNS

# Review — quality

- **Phase**: impl-review
- **Iteration**: 2

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `sprint-lifecycle.md:217` (with `:214`) | Consult cap ("3 per consulting-agent dispatch") unenforceable: step 3 makes every relay a fresh dispatch with "no other context injected", so the count resets to 0 each round — no party owns a counter. | Name the workflow as counter-holder, scoped per consulting-agent task (not per dispatch); carve an exception into step 3 for the budget line. |
| 2 | medium | `asd-ba.md:61`, `asd-architect.md:66`, `asd-ux-designer.md:73` | All three still say `ADVICE_NEEDED` "execution resumes in the same turn" — contradicts `sprint-lifecycle.md:214`'s corrected "fresh dispatch" model. `asd-pm.md:67` is already correct. | Reword the three to match `asd-pm.md:67`. |
| 3 | medium | `tests/run.js:1006-1021` | AC-6 read-only test asserts only `Write`/`Edit` absence, not `Bash` — an advisor/reviewer gaining `Bash` would still pass. | Add `!claudeTools.includes('Bash')` for all 9 read-only agents except `asd-external-review`. |
| 4 | medium | `tests/run.js:1030-1043` | Roster-count guard checks only 2 of README's 5 count claims (misses "Sixteen specialized agents", "16 canonical agent specs", ×2 "16 agent definitions"). | Extend to match all count-claim occurrences. |
| 5 | medium | `asd-pm.md:67` vs `:136-141` | PM emits `ADVICE_NEEDED` (Tool policy) but doesn't list it in "Signals emitted" — unlike the other three creator agents. | Add the bullet. |
| 6 | medium | `asd-ba.md:62`, `asd-architect.md:67`, `asd-ux-designer.md:74` vs the 3 setup skills | AC-3 completion made these agents write concept.html/stack.html/design-system files at the new gate, but their "Write access restricted to:" lists still say "(promote only)" or omit the path entirely — an agent honoring its own restriction would refuse the new write. | Widen the three write-access lists to name the setup-skill writes. |
| 7 | medium | `checkpoints.md:35-48` | `/asd-concept` and `/asd-stack`'s new HARD gates (concept.html, stack.html) appear in no table row, though `asd-advisor.md` defines its gate/non-gate boundary purely by this table. | Add two rows for the skill-level gates. |

## Coverage summary (internal reviewers only)

**Summary**: `files: 19/19 checked, 0 n/a · rules: 11/19, 7 findings`

**n/a rows**: timezone/locale (no date logic); crypto misuse (none added); schema migration (unchanged); backward-compat breaking change (framework prose, handled at pr phase).

**Findings rows**: unbounded loop → #1. Contract drift → #2, #5, #6. Test quality (vacuous assertion) → #3, #4. Gate/authorization boundary → #7.

## Verdict
CONCERNS: 7

## Next action
Route to `impl` review-fix mode; all seven autofixable, no escalation. Re-run `sync.js --apply` for touched agent/skill files.

## Escalations
None.
