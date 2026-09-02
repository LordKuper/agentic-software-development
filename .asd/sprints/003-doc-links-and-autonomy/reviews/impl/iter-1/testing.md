---
responsibility:
  owns: single reviewer verdict for one iteration, persisted in reduced coverage form
  excludes: other reviewers, other iterations, fixes, the reviewer's full returned ledger, manual-verification spec
  delegates_to: creator agent (fixes), sibling review files (other reviewers), test-plan.md (manual-verification spec)
---

[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: 1

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| T-1 | medium | `test-plan.md:57` vs `tests/run.js:960-994`, `asd-advisor.md:5-10` | AC-6's read-only-contract property (no write tool, `sandbox_mode: read-only`) has no automated check at any level — the existing assertion only checks the file renders/is `current`. | Add a static test parsing every `.asd/agents/*.md` frontmatter, asserting the 8 reviewers + advisor carry no write tool and `sandbox_mode: read-only`. |
| T-2 | medium | `test-plan.md:87-92`, `decisions-log.md:35-46` | "Not applicable" for manual verification hides that AC-4's moved design rows and AC-5's revise-in-place path never executed this sprint (design collapsed to no-op; plan accepted first round). | Replace with a deferred-verification record naming the unexercised rows. |
| T-3 | medium | `test-plan.md:63`, `plan.md:116-120`, `tests/run.js:972-978` | "no executable assertion warranted for narrative accuracy" is wrong for the roster count — it's a directory-driven invariant, same pattern already used 300 lines earlier in `tests/run.js`. | Add the guard or record the residual risk explicitly. |
| T-4 | medium | `test-plan.md:64`, `tests/run.js:991-993`, `plan.md:21,29`, `decisions-log.md:32` | "Zero drift confirms every generated view matches byte-for-byte" is untrue for `AGENTS.md` — it's filtered out of the drift assertion by `SELF_SOURCED_ALLOWLIST`. AC-8/DoD requires it `current`, "not merely tolerated," yet the only automated statement is exempted. A free fail-first regression guard (fails at parent `317aa50`, passes at HEAD) was available and not taken. | Assert the `AGENTS.md` item's status === `current`, or drop the allowlist entry from the test's exemption. |
| T-5 | low | `test-plan.md:36-42,62` vs `tests/run.js:1328-1349` | Ledger-consistency assertion does recompute from disk (verified) but is vacuous for a missing entry — exactly the risk this sprint's new agent introduces. Verified present, so no defect, but the coverage claim overstates. | Same directory-driven guard closes it. |
| T-6 | low | `test-plan.md:59-60` | "nothing for an automated test to assert against" understates existing coverage — all edited rule docs/workflows carry `upstream_hashes` entries asserted fresh by `tests/run.js:1339-1349`. | Record correction only. |
| T-7 | low | `test-plan.md:81` | Suite run stamped HEAD `54176d0`; actual current HEAD is `89cc8f8` — two sprint-artifact-only commits landed since, run remains representative but the record is stale. | Note the delta or re-stamp. |

## Coverage summary (internal reviewers only)

**Summary**: `files: 25/25 checked (mostly n/a-no-test-surface), 0 n/a-blank · rules: 8/12, 4 findings`

**n/a rows**: removal justification — n/a, zero removals; determinism/flaky-pattern — n/a, no test authored; edge cases — n/a, no executable path in scope.

**Findings rows**: Check-ladder risk fit → T-1, T-3, T-4. No-test-decision honesty → T-1, T-4, T-5 (overstated), T-6 (understated). Fail-first regression proof → T-4 (available, unused). AC coverage → T-2 (AC-4/AC-5 rows uncovered by any means).

## Verdict
CONCERNS: 7 (4 medium, 3 low)

## Next action
Add T-1 and T-4's static guards; decide-and-record T-3 and T-5 (guard or explicit residual-risk note); amend `test-plan.md` per T-2, T-4 (claim correction), T-6 (correction), T-7 (HEAD note). Re-enter via impl-test.

## Escalations
None — no manual-verification session possible until a documents-enabled sprint exists; correct remedy is a recorded deferral, not a user-run procedure now.
