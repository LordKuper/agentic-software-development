---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 012-retro-010-011-subsystem-docs

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/rules/sprint-lifecycle.md "Retro phase").
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | scope | Start confirmation and free-form scope collected in one discrete-option request; scope text lost | — |
| F-2 | impl | Task 1 dev dispatch terminated by provider session limit mid-task, leaving uncommitted partial edits | — |
| F-3 | impl-review | emit-manifest split parts cannot truthfully cover a rubric id with no evidence anywhere in scope; union check (c) fails by construction | reviews/impl/iter-01/documentation |
| F-4 | impl-review | Orchestrator reviewer payloads instructed `git diff` runs outside the reviewers declared tool policy; reviewers recorded a comply-anyway practice in memory | reviews/impl/iter-02/documentation |

## F-1 — Start confirmation and free-form scope collected in one discrete-option request; scope text lost

- **Phase**: scope
- **Surface**: skill — `.asd/skills/asd-sprint/SKILL.md` Step 2A.3
- **What happened**: Step 2A.3 combines "confirm start" and "collect scope (free-form)" in one request-user-decision operation. The orchestrator offered a "Start, scope in Other" option. The user picked that label, so no scope text arrived. The orchestrator also rendered the options in English although `language.chat` is `ru`, which breaks `language-policy.md` "User-decision options".
- **Impact**: One extra user round trip before scope could be refined.
- **Refs**: —

## F-2 — Task 1 dev dispatch terminated by provider session limit mid-task, leaving uncommitted partial edits

- **Phase**: impl
- **Surface**: provider tool — Claude API session limit (HTTP 429, `rate_limit`) on the `asd-dev-critical` dispatch for plan Task 1
- **What happened**: The dispatch ended with no COMPLETED signal after it had edited 10 canonical files and run `sync.js --apply`. Nothing was committed and no plan checkbox was ticked. `asd-phase-impl.md` has no interrupted-dispatch branch; `review-policy.md` "Interrupted dispatch" covers reviewers only. The orchestrator therefore re-dispatched a fresh dev instructed to verify and finish the partial diff, rather than discarding it.
- **Impact**: The sprint waited for the limit to reset, and the task was re-dispatched with its partial work carried over as unverified on-disk state.
- **Refs**: —

## F-3 — emit-manifest split parts cannot truthfully cover a rubric id with no evidence anywhere in scope

- **Phase**: impl-review
- **Surface**: tool — `.asd/runtime.js` `emit-manifest` (this sprint AC-12) with `review-policy.md` "Union property" (c)
- **What happened**: The iter-01 scope had 40 files and split into two parts per reviewer. The documentation rubric ids `HTML shell wrapping`, `Provenance` and `Traceability` have no evidence anywhere in the scope, because there is no user-facing HTML and no PRD/ADR. The emitted manifests authorised only the out-of-part predicate for them, so both parts truthfully recorded that predicate and union (c) blocked the merge. Hand-built manifests used to authorise scope-derived predicates; the emitter has no channel for them.
- **Impact**: The documentation reviewer counts as incomplete for iter-01, so it must be re-dispatched next iteration. The defect was routed as ORC-1.
- **Refs**: reviews/impl/iter-01/documentation

## F-4 — Orchestrator reviewer payloads instructed shell commands outside the reviewers declared tool policy

- **Phase**: impl-review
- **Surface**: phase — `asd-phase-impl-review.md` step 6 payload, as composed by the orchestrator in iterations 1 and 2
- **What happened**: Every internal reviewer payload said `Diff: git diff main...HEAD -- <file>`. The internal reviewers hold no shell (`providers.md` "Role-scoped context"), so each one worked from direct reads instead. Two of them, correctness and testing, recorded that practice in memory as "state the contradiction instead of halting". That contradicts the "Declared tool policy" refusal rule added by this sprint (AC-5) and the agent-memory check (AC-6). Step 6 says the payload carries "the diff computed in step 1", but it does not say the diff must arrive as content or as a file path the reviewer can read, rather than as a command.
- **Impact**: DOC-1 in iter-02 becomes a memory-fix round. This is the 010 F-5 pattern recurring in the very sprint that remediates it.
- **Refs**: reviews/impl/iter-02/documentation DOC-1
