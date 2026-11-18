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
| F-2 | impl | audit missed an existing context-load ceiling | research.md G2, audit.md |
| F-3 | impl | clean `sync.js --check` skipped the hash-ledger recompute | test-plan.md D-2 |
| F-4 | impl-review | commit-check before staging skipped the memory check | reviews/impl/wave-1/iter-03 combined F2 |
| F-5 | impl-review | external review kept finding a narrower critical edge of each fix until the iteration cap | reviews/impl/wave-1/iter-05..iter-08 external |
| F-6 | impl-review | `sync.js --apply` with a directory argument silently skips the hash-ledger recompute | — |
| F-7 | impl-review | External Review wrote iteration-specific tokens into its memory again | reviews/impl/wave-1/iter-08 |

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

## F-5 — external review kept finding a narrower critical edge of each fix until the iteration cap

- **Phase**: impl-review
- **Surface**: rule — `review-policy.md` "Iteration severity floor" against the External Review wrapped CLI
- **What happened**: From iter-05 to iter-08 codex returned one or two critical findings per iteration, each a narrower case of the previous fix (gap-proof per table → struck-row rotation → rotate/carry order → segment repair scope → refusal repair at both exits → Entry log/Suite run refusals). The fix briefs named only the cited edge, so each round surfaced the next one; the cap (7) was reached, the user overrode once and the iter-08 finding was cap-accepted.
- **Impact**: Four extra review-fix rounds (dev + tester + external each); one accepted open finding (impl-test-close Entry log/Suite run refusals have no repair route).
- **Refs**: reviews/impl/wave-1/iter-05..iter-08 external.md; state.json gate_decisions review-cap override

## F-6 — `sync.js --apply` with a directory argument silently skips the hash-ledger recompute

- **Phase**: impl-review
- **Surface**: tool — `.asd/sync.js` `--apply`
- **What happened**: `--apply .claude/skills .agents/skills` treated the directories as invalid targets and returned `hashLedger: null` with exit 0 and no error line; the release-manifest upstream hashes stayed stale until a rerun with a file path.
- **Impact**: One extra sync run; a stale ledger would have failed the next suite.
- **Refs**: —

## F-7 — External Review wrote iteration-specific tokens into its memory again

- **Phase**: impl-review
- **Surface**: agent — `asd-external-review` memory write against `git-strategy.md` memory check
- **What happened**: After F-4 was fixed, the iter-08 run again added `iter-08` references to `reference_codex-invocation.md`; commit-check refused them and a memory-fix dispatch removed them.
- **Impact**: One memory-fix dispatch.
- **Refs**: reviews/impl/wave-1/iter-08
