---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

## Overview

Twelve tasks in eight waves, covering `sprint.md` AC-1 through AC-9. Acceptance-criteria source is `sprint.md`, `documents.prd` being disabled.

The wave order is itself the sprint's first deliverable. Task 1 lands AC-1 — the rule that a task changing the dispatch or commit contract runs ahead of everything dispatched under it, alone in its wave — and is therefore dispatched alone, before any task that would otherwise run under the old rule. Every later wave obeys the rule Task 1 writes. Tasks 2, 5, 6 and 8 are the other contract-changing tasks (`audit.md` R-9) and each holds its wave against the tasks that follow it.

`audit.md` is the input for every task: its Existing-docs section states, per criterion, which passage the new text attaches to and which mirrors move with it. No task invents a second home for a fact that already has one.

## Definition of Done

Standing DoD applies, never restated here (`sprint-lifecycle.md` "Plan file format").

Sprint-specific additions: every canonical edit to `.asd/agents/`, `.asd/skills/` or `.asd/hooks/` is followed by `node .asd/sync.js --apply <generated-view-path...>` in the same task; `node .asd/sync.js --check` is clean and `node tests/run.js` is green at Task 12; and no finding recorded under AC-8 is left neither applied nor explicitly deferred with a reason.

### Task 1: Wave ordering for contract-changing tasks (AC-1)
Material risk: change: defines new plan vocabulary and a scheduling constraint the impl phase must honour
Reachability: `plan` writes each task's wave assignment into `plan.md` at authoring time; `impl` reads it at step 5 when it builds the execution graph and at step 6 when it decides what to dispatch concurrently — both must read the same wave number for the constraint to bind.
- [x] Define `wave` once — the vocabulary is absent from canon entirely (`audit.md` G-2) — in `sprint-lifecycle.md` "Plan file format", as a plan-level ordering property rather than a fourth per-Task line grammar
- [x] State the rule: a task changing the dispatch or commit contract is ordered ahead of every task dispatched under it, and is alone in its wave
- [x] Resolve `audit.md` G-1: `asd-phase-plan.md` computes no dependency graph today, so give the plan phase the step that assigns waves, and make the plan's dependency section carry them rather than staying optional
- [x] Update `t_plan.md` so the wave assignment has a slot and the parser-critical comment block still enumerates every line rule
- [x] Update `asd-phase-impl.md` steps 5 and 6 to schedule from the declared waves rather than from an independently derived topological sort
- [x] Check the mirror set: `README.md` if the plan format is described there, `tests/run.js` if it asserts the plan grammar

### Task 2: Whole-tree git commands and co-authored memory ownership (AC-2, AC-3)
Material risk: change: extends the commit-ownership contract every dispatched agent runs under
- [x] Extend the existing parenthetical in `git-strategy.md` "Commit before review" to name `git add --renormalize` and `git stash` alongside the commands it already bans, rather than opening a second paragraph
- [x] Resolve `audit.md` G-3: a dispatched agent cannot observe whether a sibling dispatch is in flight, so state the agent-facing half as an unconditional ban and hold the conditional permission with the orchestrator, which can observe it
- [x] Extend the agent-memory commit carve-out beyond the reviewer case: when the author cannot commit because a concurrent co-author holds the file, the orchestrator commits it at phase exit
- [x] Resolve `audit.md` G-4: state when two agents can co-author one memory file, since memory is otherwise defined per-agent
- [x] Name the concurrency case in `review-policy.md` "Diff reachability", which already defers ownership to `git-strategy.md` — a pointer, not a copy
- [x] Mirror the staging rule into `.asd/project/custom-coding-rules.md`, its only new-text home

### Task 3: Ledger row-shape example in the manifest (AC-6b)
Material risk: change: alters the digested manifest shape every reviewer's ledger validates against
- [x] Add a sibling exported constant beside `LEDGER_VOCABULARY` in `.asd/runtime.js` carrying one example row
- [x] Inject it under `--write` and validate it by the same equality test as the vocabulary, keeping the backward-compatibility branch for manifests stamped before the field existed
- [x] Document it beside the `vocabulary` paragraph in `review-policy.md` "Coverage ledger"
- [x] Update `.asd/release-manifest.json` `upstream_hashes` for the changed runtime source

### Task 4: Fail-first mutation must be restored (AC-5a)
Material risk: artifact: small, objectively verifiable edit in a rule doc five files cite
- [x] Extend the `code-style.md` §17 fail-first bullet: a mutation made to prove fail-first is restored before the agent's next tool call
- [x] State that a mutation left on disk is a defect regardless of what the suite reports
- [x] Confirm the five citing files reach it by citation and need no edit, as `audit.md` records

### Task 5: Split the coverage-ledger enforcement (AC-6a)
Material risk: change: changes what a review phase does with a failed validation
- [ ] Partition the eight `validate-ledger` rejection classes into incomplete-or-unverifiable against wrong-shape-but-complete (`audit.md` G-5), stating the partition where the class list already lives
- [ ] Split the enforcement paragraph: the first case rejects and re-dispatches, the second is transcribed by the phase workflow, validated, and recorded as a deviation
- [ ] Determine whether `runtime.js` must return a class tag for the workflow to branch on, and add one if so
- [ ] Update the one-line version in `asd-phase-impl-review.md` step 7 and `asd-phase-design-review.md` step 8
- [ ] Confirm the interrupted-dispatch steps, which route through identical handling to an invalid ledger, are not silently re-routed into the transcription branch

### Task 6: Fix-round exit diff check (AC-5b)
Material risk: change: adds a condition to the impl completion gate
- [ ] Add the diff read to `asd-phase-impl.md` step 9, the all-modes gate, not step 11, which is fix-mode only and declared mechanical
- [ ] State it as confirming the round's diff touches only paths its agents were authorised to touch, before committing or advancing
- [ ] Keep it distinct from `code-style.md` §19's staged-diff paragraph, which uses the same tool for a different purpose

### Task 7: Availability skip is a friction entry (AC-4)
Material risk: artifact: one-line pointer in a rule doc
- [ ] Extend the sentence in `external-review.md` that already routes the skip status to `decisions-log.md` so it also appends a friction entry
- [ ] Keep it a pointer to `sprint-lifecycle.md` "Friction log", whose writer mechanism is stated once and restated by none

### Task 8: The documentation-economy rule (AC-7)
Material risk: change: a new enforceable rule reaching every creator and reviewer, and a new coverage-manifest rubric entry
- [ ] Site the rule in `artifact-layout.md` immediately after the SSoT iron rule, per `audit.md`'s recommendation and the user's accepted scope decision that it covers framework canon and every artifact a later agent reads
- [ ] State the exclusions — prose stating no rule, rationale justifying an already-stated rule, examples disambiguating nothing, negative prompting without a positive rule to contrast, emphasis inflation (`audit.md` C-2), and the same fact in a second home
- [ ] State the decision procedure (`audit.md` G-7): the removal test, the provenance test, and the enforcement test, which is what makes E-4's class cuttable
- [ ] State the preserve-list so `audit.md` R-1's load-bearing text cannot be cut under this rule
- [ ] Keep the rule itself within its own budget (`audit.md` R-2): a paragraph plus a short list, no essay
- [ ] Add the enforcing bullet to `asd-reviewer-documentation.md` `## Review rubric` — the only path into the blocking coverage ledger
- [ ] Resolve `audit.md` G-9: state how rubric IDs are derived and why they are stable, since the manifest must enumerate them and an omitted item invalidates a verdict
- [ ] Extend the rule's reach to artifact templates per the accepted scope, so consumer projects inherit it
- [ ] Reduce `AGENTS.md`'s hand-written economy paragraph and `code-style.md` §7's sentence to pointers at the new home
- [ ] Run `node .asd/sync.js --apply` for the regenerated documentation-reviewer views

### Task 9: Audit the corpus against the accepted rule (AC-8)
Material risk: change: judgment call on which passages the rule reaches
- [ ] Extend `audit.md`'s corpus survey to the whole canonical surface rather than the worst offenders, applying the rule text Task 8 actually landed
- [ ] Record per finding the file, what is wrong and which authority it violates — AC-7's rule, or a named published-guidance source
- [ ] Apply the bytes-read-per-dispatch measurement the user accepted as this sprint's evidence standard (`audit.md` G-8) to the findings that claim a cost
- [ ] Carry the existing E-1 through E-9 and C-1 through C-12 findings forward unchanged where the final rule confirms them, and mark any the rule does not reach

### Task 10: Apply the corpus findings to the text (AC-9)
Material risk: change: deletions in text no test can verify (`audit.md` R-6)
- [ ] Resolve E-1 by reduction to pointers: delete from both review workflows what `review-policy.md` already owns — which both files already declare its sole SSoT before restating it — leaving each with only its phase-specific remainder. No new abstraction, and nothing moves into the file every reviewer reads in full
- [ ] Cut `AGENTS.md` "Architecture" (E-2) to what a directory listing cannot supply, editing the hand-written side below the sync marker
- [ ] Resolve E-3 by making `AGENTS.md`/`t_AGENTS.md` "Rule docs" a pointer to `core.md` "See also" rather than a drifting copy, and confirm the drift is gone
- [ ] Cut the reviewer prose that restates config-enforced permissions (E-4) and the duplicated line inside `asd-reviewer-efficiency.md`
- [ ] Give the shell-CSS §6 carve-out (E-6) one home and make the other file cite it
- [ ] Cut the rationale, emphasis and descriptor findings (E-7, E-8, E-9) and the thoroughness exhortations the ledger already enforces deterministically (C-3)
- [ ] Decide E-5 by audience per `audit.md` R-3: keep editor-facing annotations if they survive the rule, standardised to one form; cut the rest
- [ ] Run `node .asd/sync.js --apply` for every regenerated view and confirm no generated file was hand-edited

### Task 11: Close the two mechanical defects the audit found (AC-9)
Material risk: change: validation code whose failure mode is silent
- [ ] Validate the Claude `effort` field in `.asd/sync.js` against its documented vocabulary, as the Codex counterpart already is (`audit.md` C-10)
- [ ] Add the rule-doc-list mirror to `tests/run.js` so `core.md` "See also" and the `AGENTS.md`/`t_AGENTS.md` list cannot drift again unnoticed (`audit.md` G-12)
- [ ] Update `.asd/release-manifest.json` hashes for the changed sources

### Task 12: Consistency sweep (AC-9)
Material risk: artifact: mechanical verification across the sprint's whole change surface
- [ ] Confirm `README.md` is accurate for every rule, agent, skill, workflow, template and config-schema change this sprint made — phase list, agent roster, model tiers for both providers, folder map, command list
- [ ] Confirm `core.md` "See also" lists every rule doc, and the phase-chain mirrors still agree
- [ ] Run `node .asd/sync.js --check` clean and `node tests/run.js` green
- [ ] Confirm every AC-8 finding is applied or carries a recorded deferral reason

## Risks
- A green suite does not prove a prose deletion safe (`audit.md` R-6); Task 12's verification is necessary, not sufficient, and the documentation reviewer's new rubric bullet is the real check.
- Task 10 is the sprint's largest change surface and the one most able to break the review loop (`audit.md` R-4).
- Sprint 010's own artifacts fall under the rule it writes, per the accepted wider scope (`audit.md` R-10).

## Dependencies

| Wave | Tasks | Why grouped |
|---|---|---|
| 1 | 1 | AC-1 changes the dispatch contract every later wave runs under |
| 2 | 2 | AC-2/AC-3 change the staging and commit contract |
| 3 | 3, 4 | disjoint files, neither a contract change |
| 4 | 5, 6, 7 | disjoint files; 5 changes the review contract but no task in this wave is dispatched under it |
| 5 | 8 | AC-7's rule and its rubric bullet change the coverage manifest |
| 6 | 9 | the audit needs the final rule text |
| 7 | 10, 11 | disjoint files, both applying audit findings |
| 8 | 12 | consistency sweep over everything the sprint changed |

- Task 1 precedes every other task; it lands the ordering rule they run under.
- Task 2 precedes Tasks 3 through 12; it changes the commit contract they are dispatched under.
- Task 3 precedes Task 8: both change the coverage manifest, and the runtime shape must exist before a new rubric entry references it (`audit.md` R-7).
- Task 5 precedes Task 10, which edits the same two review workflows.
- Task 8 precedes Task 9, which audits against the rule Task 8 lands.
- Task 9 precedes Tasks 10 and 11, which apply its findings.
- Task 12 depends on every preceding task.

## Out of scope
- Model or effort retiering (`sprint.md` "Out of scope"); C-11 stays recorded, not applied.
- Reducing what a dispatch reads by inlining rule text into agent bodies (`audit.md` R-8) — a real economy lever that buys second homes for facts, and a tradeoff this sprint does not take.
