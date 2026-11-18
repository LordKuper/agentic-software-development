---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 037-quality-gates-ci-cost-ideas

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/workflows/asd-phase-retro.md).
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | scope | `retro-candidates` rejects a retrospective whose Systemic proposals section has no table | — |

## F-1 — `retro-candidates` rejects a retrospective whose Systemic proposals section has no table

- **Phase**: scope
- **Surface**: skill — `.asd/runtime.js` `retroRows` against `.asd/workflows/asd-phase-retro.md` output
- **What happened**: Sprint 036's retro had zero systemic proposals and wrote the section as a "None." paragraph with no `<table>`; `retro-candidates` exits 2 with `retrospective systemic-proposals table has no tbody`. Neither the retro workflow nor `t_retrospective.html` states the zero-row shape.
- **Impact**: Retro intake is blocked for sprint 036's seven action rows until the user decides at the scope gate; the archived retrospective is immutable, so it cannot be repaired in place.
- **Refs**: —

## F-2 — audit missed an existing context-load ceiling

- **Phase**: impl
- **Surface**: workflow — `asd-phase-audit.md` scan of `tests/run.js`
- **What happened**: `tests/run.js:8462-8481` (sprint 026 AC-16, D13) already bounds the per-dispatch load of four role/phase pairs at 0.70 of a recorded baseline. Audit reported no bundle bound (research G2, audit "Gaps"); a Task 3 dev found it when the test failed mid-wave (`orchestrator/impl` 0.7074).
- **Impact**: AC-1's in-repo half duplicates an existing check; the plan carries no Task to supersede it.
- **Refs**: research.md G2, audit.md

## F-3 — clean `sync.js --check` skipped the hash-ledger recompute

- **Phase**: impl
- **Surface**: rule — `sprint-lifecycle.md` "Self-hosting" orchestrator sync against `.asd/sync.js` `--check`
- **What happened**: After the D-1 test-fix (canon edits to `sprint-lifecycle.md` and `asd-phase-retro.md`), `sync.js --check` reported every view current, so the orchestrator skipped `--apply`. Only `--apply` recomputes `release-manifest.json` `upstream_hashes`; `--check` does not report a stale ledger. Impl-test entry 2 went red on `release-manifest.json: every upstream_hashes entry matches the actual file`.
- **Impact**: One extra impl-test → impl test-fix round (D-2).
- **Refs**: test-plan.md D-2

## F-4 — commit-check before staging skipped the memory check

- **Phase**: impl-review
- **Surface**: rule — `git-strategy.md` "Commit before review" message-file form against `.asd/runtime.js` `commit-check`
- **What happened**: The orchestrator ran `commit-check` on reviewer memory before `git add`; its memory check reads only `git diff --cached`, so it scanned nothing and passed. An `asd-external-review` memory edit carrying `wave-1 iter-02` was committed; combined iter-03 F2 caught it.
- **Impact**: One memory-fix dispatch in impl-review.
- **Refs**: reviews/impl/wave-1/iter-03 combined F2
