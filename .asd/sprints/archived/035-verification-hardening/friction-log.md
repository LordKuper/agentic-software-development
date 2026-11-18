---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 035-verification-hardening

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl-review | External Review never ran: wrapped CLI quota exhausted at iteration 1, negative cache skipped every later iteration | reviews/impl/wave-1/iter-01/external |
| F-2 | impl-test | Tester hand-numbered `suite` op ids: one skipped numbers, one reused an id already in the ledger | — |
| F-3 | impl | Devs introduced `git merge-base` and `git rev-parse --verify` without tech-reference entries; only review caught it | reviews/impl/wave-1/iter-01/combined |
| F-4 | impl-review | `runtime.js timing --attrs` silently kept only the last of repeated flags and stored a comma-joined pair as one value | — |

## F-1 — External Review never ran

- **Phase**: impl-review
- **Surface**: provider tool — `codex exec` (External Review wrapper)
- **What happened**: iteration 1's run hit the provider usage limit (reset 14:41); after `external-record-failure` the negative cache returned an availability skip for every later iteration, so the sprint's impl-review closed on combined review alone.
- **Impact**: no cross-provider review of a sprint that rewrites the verification rules themselves; the skip is permitted, the coverage loss is silent at the pr gate.
- **Refs**: reviews/impl/wave-1/iter-01/external
- **Later**: the cache expired before iteration 4; iterations 4 and 5 ran Codex over every carried-over file.

## F-2 — Tester hand-numbered suite op ids

- **Phase**: impl-test
- **Surface**: agent — `asd-tester` (`sprint-lifecycle.md` "Operation timing" unique `suite <phase>#<n>` ids)
- **What happened**: entry 2 opened `suite impl-test#5`/`#6` (skipping #2–#4); entry 3 reopened `suite impl-test#1`, an id entry 1 had already closed. `runtime.js timing` accepted both.
- **Impact**: the ledger holds a duplicate op id, so `timing-summary` pairs it ambiguously.
- **Refs**: —

## F-3 — New commands reached the code without tech-reference entries

- **Phase**: impl
- **Surface**: rule — `artifact-layout.md` "Tech reference docs" refuse-to-implement (checks the tech, not each command)
- **What happened**: the plan listed the git/gh commands it foresaw; Tasks 1 and 4 added `git rev-parse --verify --quiet <ref>^{commit}` and `git merge-base` on their own, with no entry; the combined reviewer flagged it (AC-13) and the orchestrator added the entries in review-fix.
- **Impact**: one review-fix finding and round for a check the dev could have run before COMPLETED.
- **Refs**: reviews/impl/wave-1/iter-01/combined

## F-4 — Timing attrs accepted malformed input

- **Phase**: impl-test, impl-review
- **Surface**: runtime — `.asd/runtime.js timing --attrs` (`;`-separated `k=v` pairs)
- **What happened**: the orchestrator passed `--attrs` three times (only `model` was recorded) and `--attrs wave=1,iteration=5` (stored `wave` = `1,iteration=5`); both exited 0, the second without a warning. The ledger lines were corrected by hand.
- **Impact**: dispatch ops missing `agent`/`tier` and a review-iteration op with a wrong `wave` would skew `timing-summary`.
- **Refs**: —
