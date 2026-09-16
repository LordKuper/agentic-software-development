---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 014-glings-retro-002-remediation

## Goal

Carry the ASD-framework proposals from the consumer retrospective of Glings sprint 002-world-map-generation into canon. That sprint reviewed 657 files across 64 review iterations, and its friction came from gaps in the framework, not in the project.

Scope covers only the rows that are still unresolved at `HEAD` 1421e34. Rows the retrospective already marked covered (F-1, F-2, F-5/F-8) are excluded, and so is F-3, which this scope closed as covered (`decisions-log.md`).

1. External Review can report partial coverage honestly.
2. The orchestrator recovers from a failed agent from git evidence, not from memory.
3. `defect-stalemate` stops misreading a test plan that holds more than one `Defects` table.
4. Split coverage manifests stop failing the union check by construction.
5. An oversized sprint is split into sequential sprints before it starts, not partitioned into review waves.
6. Sprint bookkeeping files stay bounded: `state.json` holds machine state only, and the decisions log and test plan rotate.

## Acceptance

- AC-1: External Review gains a partial-coverage outcome `APPROVE (partial: <n>/<m> files; <cause>)`, returned when the wrapped CLI reviewed a strict subset of the scope with no finding at or above floor before it stopped. The outcome is distinct from the availability skip. Like the availability skip, it satisfies only its own iteration and never creates an APPROVE latch. It is logged to `decisions-log.md` and gets an `F-N` entry. `external-review.md` "Outcome contract", the `asd-external-review` agent and both review phase workflows agree on this.
- AC-2: When a dispatched creator or tester (`impl` initial/review-fix/test-fix, `impl-test`) returns no completion signal, the main orchestrator first reconstructs what landed. It reads `git log` since the chain's start commit and `git status`, and only then re-dispatches, sending only the work that did not land. The reconstruction is logged to `decisions-log.md`. The rule has one home in `sprint-lifecycle.md`, and the workflows reference it.
- AC-3: `runtime.js defect-stalemate` considers every `## Defects` section in the test plan. More than one such section fails closed, and the error names each heading's line number. A malformed-table error names the line of the offending header or row. `tests/run.js` covers both failures.
- AC-4: `emit-manifest` grants standing n/a predicates to two documentation rubric entries. `Framework mode` is n/a when `self_hosting` is not enabled. `Template adherence` is n/a when the scope list holds no templated artefact. Both predicates live in `NA_PREDICATES`/`NA_TARGETS`, and the emitter evaluates them from its input, so a split manifest passes union check (c) whenever the predicate holds. `review-policy.md` and `tests/run.js` match.
- AC-5: The plan declares an estimated reviewable change surface, in files. Above a named cap, the plan cannot be accepted until the user either splits the work into sequential sprints (a hard scope gate) or explicitly overrides the cap (a hard waiver). `impl-review` entry measures the actual diff against the same cap and escalates on breach instead of reviewing. The cap is one constant in `.asd/runtime.js`, and its value and rationale are set at plan.
- AC-6: `state.json` holds only the keys `t_state.json` defines, with no free-text notes or prose fields. Prose belongs to `decisions-log.md`. `artifact-layout.md` (or the owning rule) states this once.
- AC-7: `decisions-log.md` and `test-plan.md` rotate so that no single file an orchestrator must read grows without bound. The rotation unit (per phase or per entry), trigger and file naming are decided at audit/plan and stated once in `artifact-layout.md`. Every reader follows rotated files, including `defect-stalemate`, the impl-test re-entry logic, the criterion-cost surfacing in `checkpoints.md`, and interrupted-dispatch recovery.
- AC-8: When a change breaks an active consumer sprint's state or files, `CHANGELOG.md` and a migration (or an explicit no-migration note) cover it per `backward_compat: migration`.
- AC-9: `node tests/run.js` is green, `node .asd/sync.js --check` is clean, README.md matches the changed rules, workflows, agents and templates, and every added line passes `artifact-layout.md` "Documentation economy".

## Out of scope

- F-1, F-2 and F-5/F-8, which the retrospective marked covered, and F-3, which verification at HEAD closed as covered.
- Consumer-scope rows (F-7, F-9, F-10, the consumer half of F-11, the Unity/test-fixture systemic proposals). They belong to the Glings project, not ASD.
- Multi-iteration review waves as a framework feature. AC-5 prevents the need for them instead.
- Hand-edits to generated provider views. Edit canon, then run `sync.js --apply`.
