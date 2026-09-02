---
responsibility:
  owns: single reviewer verdict for one iteration, persisted in reduced coverage form
  excludes: other reviewers, other iterations, fixes, the reviewer's full returned ledger, manual-verification spec
  delegates_to: creator agent (fixes), sibling review files (other reviewers), test-plan.md (manual-verification spec)
---

[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: 2

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `tests/run.js:1016-1018` (T-1) | Read-only-agent guard reads `tools` with `|| []` fallback — if `tools` is deleted entirely from a read-only agent's frontmatter, both Write/Edit assertions pass vacuously against `[]`, missing the actually-dangerous state (Claude subagent with no explicit tools inherits the full parent set). | Assert `tools` exists and is an array before filtering. |
| 2 | medium | `tests/run.js:1017-1019` vs AC-6/`AGENTS.md` | T-1 claims to assert the AC-6 read-only contract but only covers `Write`/`Edit`, not `Bash` (AC-6 states "no Write/Edit/Bash"). `asd-external-review` is a documented exception (needs Bash for the wrapped CLI). | Extend the loop to assert `!includes('Bash')` for all read-only agents except `asd-external-review`. |
| 3 | medium | `test-plan.md:143-144` vs `decisions-log.md:99` | Two sprint records name different HEADs for the same 83/83 run — `test-plan.md` stamps the test-authoring commit, `decisions-log.md` stamps the pre-test-authoring base (which `test-plan.md` also calls the entry-2 delta base). Self-contradictory record. | Keep `test-plan.md`'s HEAD as authoritative (suite-run commit); correct via a new appended decisions-log entry (never edit the old one). |
| 4 | medium | `test-plan.md:96-108` | Entry 2's Risk→check table has no row for the 4 SKILL.md files in scope (the AC-3 completion skills) — an omitted row, not a recorded "none" decision, violates code-style.md §17's record requirement. | Add one row covering the four skill files with an explicit `none` decision + reason. |

## Coverage summary (internal reviewers only)

**Summary**: `files: 19/19 checked, 0 n/a · rules: 12/17, 4 findings (partial)`

**n/a rows**: removal-reason validity — no test removed; out-of-scope removal approval — no removals.

**Findings rows**: Meaningfulness/edge cases (missing-key case) → #1. AC-6 coverage → #2. Suite-run record accuracy (AC-8) → #3. No-test-decision honesty → #4.

## Verdict
CONCERNS: 4 (all medium)

## Next action
Route to `impl-test` (test-code/record fixes only, no product-prose changes needed for these 4): tighten T-1, add the missing skills decision row, reconcile the HEAD record.

## Escalations
None.
