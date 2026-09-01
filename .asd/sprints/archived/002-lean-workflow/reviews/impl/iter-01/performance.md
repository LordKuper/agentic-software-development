[REVIEW-impl-performance]: CONCERNS

# Review — performance

- **Phase**: impl-review
- **Iteration**: 1

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `asd-phase-impl-review.md:27` + `review-policy.md:138` + `t_config.yaml:49` + `release-manifest.json` + `CHANGELOG.md` | P-9's largest claimed saving (−6 opus/high dispatches) doesn't land anywhere: field absent ⇒ disabled (full fan-out) per the workflow, but review-policy.md calls `enabled` "the default"; no consumer ever receives the key via `/asd-update`; this very sprint's own repo lacks it and ran full fan-out. | Make absent ≡ enabled (matching the stated default), or add a CHANGELOG migration note telling consumers to opt in. |
| 2 | medium | `asd-phase-pr.md:38` + `sprint-lifecycle.md:203` | P-10's "skip suite re-run" predicate compares HEAD to a commit no step actually makes right after writing Suite run — unreliable in both directions. | Add a `HEAD` field to `t_test-plan.md`'s Suite run section, compare against that instead of inferring from git log. |
| 3 | medium | `asd-phase-impl-test.md:33,44,57-63` | P-8 claims dispatch-count savings, but re-entry still dispatches `asd-test-engineer` the same number of times — only payload size shrinks. | Add a no-delta short-circuit: skip steps 3/6 entirely when the delta touches nothing the suite covers. |
| 4 | low | `asd-phase-design.md:21`, `asd-phase-audit.md:19`, `asd-phase-pr.md:30` | Three residual PM dispatches on paths carrying no gate — the exact class Task 15 converted elsewhere. | Convert to inline writes. |
| 5 | low | `asd-phase-audit.md:26,32,37` | Task 16's parallelization buys a serial round but pays the audit body's tokens twice (returned then re-emitted verbatim). | Instruct verbatim splicing at assembly, cap cost at exactly 2x. |
| 6 | low | `t_html-shell.html:206-209` vs `:58-65,194,226-244` | TOC trim is only half-realized — ~30 lines of TOC/scrollspy CSS+script still inline unconditionally even when no TOC renders. | Fold into the same conditional as `{{TOC_NAV}}`. |
| 7 | low | `asd-phase-design-promote.md:40`, `t_adr.html:47` | Fold rule adds an unpriced per-decision search and a possible new pause at promote time. | Make the "Fold target" article line required at design time, so promote does cheap verification instead of open-set search. |
| 8 | low | `asd-external-review.md:53` vs `external-review.md:51` | Same stale consumer-only pathspec as Quality/Documentation findings — under self-hosting, reviews an empty payload. | Repoint to the rule. |

## Coverage summary (internal reviewers only)

**Summary**: `files: 55/55 checked, 0 n/a`

**n/a rows**: none at file level; two rubric rows n/a (R1 no perf-budgets section exists to measure against; R2/R3 no executable file in scope).

**Findings rows**:
| Rubric item | Finding |
|---|---|
| Regression vs baseline (sprint-001 dispatch inventory) | finding #1, #2, #3 |
| Hot-path identification | finding #4, #5, #6, #7, #8 |

## Verdict
CONCERNS: 8 (3 medium, 5 low)

## Next action
Route to `impl` review-fix mode. Findings #1 and #3 decide whether this sprint's two largest claimed savings actually reach a running installation — fix before pr.

## Escalations
None.
