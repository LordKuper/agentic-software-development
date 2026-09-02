---
responsibility:
  owns: single reviewer verdict for one iteration, persisted in reduced coverage form
  excludes: other reviewers, other iterations, fixes, the reviewer's full returned ledger, manual-verification spec
  delegates_to: creator agent (fixes), sibling review files (other reviewers), test-plan.md (manual-verification spec)
---

[REVIEW-impl-performance]: CONCERNS

# Review — performance

- **Phase**: impl-review
- **Iteration**: 1

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | low | `sprint-lifecycle.md:209-216`, `core.md:45` | No cap on how many times an agent may emit `ADVICE_NEEDED` — not per dispatch, per phase, or per sprint; each consult is a full `fable`-tier dispatch. D-2 (no consult log) means an unbounded, unmeasured hot-path cost driver. Every comparable loop in this corpus is bounded (BA's 2-round cap, review's 15-iteration cap) or explicitly marked uncapped; this is the one new loop with neither. | Add a per-dispatch consult cap to protocol step 5, or state explicitly "uncapped, deliberately" matching the `impl⇄impl-test` precedent. |
| 2 | low | `sprint-lifecycle.md:209,212` | Emitter is stated as "any agent" and the relay branch reads "any dispatched agent" — since the advisor is itself dispatched by the workflow, a literal reading permits advisor→advisor self-recursion with no termination; the only guard is in the advisor's own file, not the caller's branch. | Narrow the SSoT to "any dispatched agent other than `asd-advisor`". |

## Coverage summary (internal reviewers only)

**Summary**: `files: 25/25 checked, 0 n/a · rules: 3/5, 2 findings`

**n/a rows**: Budget compliance — no perf budgets defined in `custom-coding-rules.md`/`custom-common-rules.md`; surrogate = `AGENTS.md`'s token-minimization hard rule (applied throughout, no violation beyond the write-then-review duplication already flagged by simplification).

**Findings rows**: Anti-patterns (hot-path measurement, unbounded loop) → findings #1, #2.

## Verdict
CONCERNS: 2

## Next action
One paragraph fix in `sprint-lifecycle.md`'s `ADVICE_NEEDED` protocol section covers both findings; no workflow file edits needed. Net direction of the sprint is token/round-trip-reducing, not regressive — confirmed, not merely claimed.

## Escalations
None.
