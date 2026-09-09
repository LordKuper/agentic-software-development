---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

## Overview

Thirteen tasks in nine waves, covering `sprint.md` AC-1 through AC-10. Task 13 and AC-10 were added after impl began, on the user's requirement that the documentation-economy rule reach agents for authoring and not only for review. Acceptance-criteria source is `sprint.md`, `documents.prd` being disabled.

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
- [x] Partition the eight `validate-ledger` rejection classes into incomplete-or-unverifiable against wrong-shape-but-complete (`audit.md` G-5), stating the partition where the class list already lives
- [x] Split the enforcement paragraph: the first case rejects and re-dispatches, the second is transcribed by the phase workflow, validated, and recorded as a deviation
- [x] Determine whether `runtime.js` must return a class tag for the workflow to branch on, and add one if so
- [x] Update the one-line version in `asd-phase-impl-review.md` step 7 and `asd-phase-design-review.md` step 8
- [x] Confirm the interrupted-dispatch steps, which route through identical handling to an invalid ledger, are not silently re-routed into the transcription branch

### Task 6: Fix-round exit diff check (AC-5b)
Material risk: change: adds a condition to the impl completion gate
- [x] Add the diff read to `asd-phase-impl.md` step 9, the all-modes gate, not step 11, which is fix-mode only and declared mechanical
- [x] State it as confirming the round's diff touches only paths its agents were authorised to touch, before committing or advancing
- [x] Keep it distinct from `code-style.md` §19's staged-diff paragraph, which uses the same tool for a different purpose

### Task 7: Availability skip is a friction entry (AC-4)
Material risk: artifact: one-line pointer in a rule doc
- [x] Extend the sentence in `external-review.md` that already routes the skip status to `decisions-log.md` so it also appends a friction entry
- [x] Keep it a pointer to `sprint-lifecycle.md` "Friction log", whose writer mechanism is stated once and restated by none

### Task 8: The documentation-economy rule (AC-7)
Material risk: change: a new enforceable rule reaching every creator and reviewer, and a new coverage-manifest rubric entry
- [x] Site the rule in `artifact-layout.md` immediately after the SSoT iron rule, per `audit.md`'s recommendation and the user's accepted scope decision that it covers framework canon and every artifact a later agent reads
- [x] State the exclusions — prose stating no rule, rationale justifying an already-stated rule, examples disambiguating nothing, negative prompting without a positive rule to contrast, emphasis inflation (`audit.md` C-2), and the same fact in a second home
- [x] State the decision procedure (`audit.md` G-7): the removal test, the provenance test, and the enforcement test, which is what makes E-4's class cuttable
- [x] State the preserve-list so `audit.md` R-1's load-bearing text cannot be cut under this rule
- [x] Keep the rule itself within its own budget (`audit.md` R-2): a paragraph plus a short list, no essay
- [x] Add the enforcing bullet to `asd-reviewer-documentation.md` `## Review rubric` — the only path into the blocking coverage ledger
- [x] Resolve `audit.md` G-9: state how rubric IDs are derived and why they are stable, since the manifest must enumerate them and an omitted item invalidates a verdict
- [x] Extend the rule's reach to artifact templates per the accepted scope, so consumer projects inherit it
- [x] Reduce `AGENTS.md`'s hand-written economy paragraph and `code-style.md` §7's sentence to pointers at the new home
- [x] Run `node .asd/sync.js --apply` for the regenerated documentation-reviewer views

### Task 9: Audit the corpus against the accepted rule (AC-8)
Material risk: change: judgment call on which passages the rule reaches
- [x] Extend `audit.md`'s corpus survey to the whole canonical surface rather than the worst offenders, applying the rule text Task 8 actually landed
- [x] Record per finding the file, what is wrong and which authority it violates — AC-7's rule, or a named published-guidance source
- [x] Apply the bytes-read-per-dispatch measurement the user accepted as this sprint's evidence standard (`audit.md` G-8) to the findings that claim a cost
- [x] Carry the existing E-1 through E-9 and C-1 through C-12 findings forward unchanged where the final rule confirms them, and mark any the rule does not reach

### Task 10: Apply the corpus findings to the text (AC-9)
Material risk: change: deletions in text no test can verify (`audit.md` R-6)
- [x] Resolve E-1 by reduction to pointers: delete from both review workflows what `review-policy.md` already owns — which both files already declare its sole SSoT before restating it — leaving each with only its phase-specific remainder. No new abstraction, and nothing moves into the file every reviewer reads in full
- [x] Cut `AGENTS.md` "Architecture" (E-2) to what a directory listing cannot supply, editing the hand-written side below the sync marker
- [x] Resolve E-3 by making `AGENTS.md`/`t_AGENTS.md` "Rule docs" a pointer to `core.md` "See also" rather than a drifting copy, and confirm the drift is gone
- [x] Cut the reviewer prose that restates config-enforced permissions (E-4) and the duplicated line inside `asd-reviewer-efficiency.md`
- [x] Give the shell-CSS §6 carve-out (E-6) one home and make the other file cite it
- [x] Cut the rationale, emphasis and descriptor findings (E-7, E-8, E-9) and the thoroughness exhortations the ledger already enforces deterministically (C-3)
- [x] Decide E-5 by audience per `audit.md` R-3: keep editor-facing annotations if they survive the rule, standardised to one form; cut the rest
- [x] Run `node .asd/sync.js --apply` for every regenerated view and confirm no generated file was hand-edited

### Task 11: Close the two mechanical defects the audit found (AC-9)
Material risk: change: validation code whose failure mode is silent
- [x] Validate the Claude `effort` field in `.asd/sync.js` against its documented vocabulary, as the Codex counterpart already is (`audit.md` C-10)
- [x] Add the rule-doc-list mirror to `tests/run.js` so `core.md` "See also" and the `AGENTS.md`/`t_AGENTS.md` list cannot drift again unnoticed (`audit.md` G-12) — REASSIGNED and delivered: `asd-tester` landed it in impl-test as a `core.md` "See also" bijection plus a no-copy assertion, list-against-list having stopped being the invariant once Task 10 made the `AGENTS.md` side a pointer
- [x] Update `.asd/release-manifest.json` hashes for the changed sources

### Task 12: Consistency sweep (AC-9)
Material risk: artifact: mechanical verification across the sprint's whole change surface
- [x] Confirm `README.md` is accurate for every rule, agent, skill, workflow, template and config-schema change this sprint made — phase list, agent roster, model tiers for both providers, folder map, command list
- [x] Confirm `core.md` "See also" lists every rule doc, and the phase-chain mirrors still agree
- [x] Run `node .asd/sync.js --check` clean — 72/72 targets `current`; `node tests/run.js` — 170/171, the one failure being `tests/run.js:2450`'s pre-AC-6b manifest field pin, owned by `asd-tester` in impl-test per plan.md Task 11's second subtask reassignment — not a new failure and not fixable here (dev writes no tests)
- [x] Confirm every AC-8 finding is applied or carries a recorded deferral reason — all 23 `E-N` and 12 `C-N` ids from `audit.md`'s survey and corpus-audit table are accounted for in `decisions-log.md`'s "Task 10 applied E-1 … E-23" entry (five applied-in-part with reasons: E-15, E-10, E-5, E-4, E-22) plus the earlier entries closing C-9/C-10/C-11/C-12 and out-of-scope C-6/C-11

### Task 13: Reach the authoring side (AC-10)
Material risk: change: changes what every creator agent is instructed to do while authoring
Reachability: `artifact-layout.md` states the authoring obligation and every role row already loads that file; each creator reads it at authoring time and the documentation reviewer reads the same rule at review time — both must be reading one statement, not two.
- [x] State in the rule's own home that it binds at authoring time, not only at review, so it reaches every role that loads `artifact-layout.md` — including `asd-ba` and `asd-ux`, which never load `code-style.md`
- [x] Extend `code-style.md` §1's proactive-authoring instruction to name the documentation-economy iron rule alongside the SSoT iron rule it already names
- [x] Verify the review side is closed for both phases, not only impl-review, and record what makes it so — closed in both, no edit needed: `review-policy.md` "DoD per review phase" requires Documentation in design-review and impl-review, and `asd-phase-design-review.md` step 7 dispatches it for any non-empty draft set; its `Documentation economy` rubric bullet carries no phase qualifier (unlike the three marked impl-review) and depends only on `artifact-layout.md`, which `providers.md` grants that reviewer in every phase — the row's `code-style.md` grant is impl-review-only but nothing in the bullet reads it, and the file's one section-scope carve-out names "HTML shell wrapping", not this rule; `review-policy.md` "Coverage ledger" enumerates every rubric id in both phases' manifests and design-review authorizes no `n/a` predicate for this one, so it blocks a verdict there too
- [x] Verify no creator that authors agent-facing text is left unreached, role row by role row — every `providers.md` "Role-scoped context" row that authors persisted text grants `artifact-layout.md` unconditionally: main orchestrator (`sprint.md`, `plan.md`, `audit.md`, decisions-log, review files), `asd-ba`, `asd-architect`, `asd-ux`, `asd-dev`, `asd-tester`, `asd-external-review` and the four internal reviewers. The one row without the grant is `asd-advisor`, which persists nothing — its recommendation is relayed text, not an artifact a later agent reads. `code-style.md` §1 and §7 name the rule for the roles reading them without restating it, so the rule keeps one home and no role meets two


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
| 9 | 13 | changes what every creator is instructed to do while authoring — alone in its wave |

- Task 1 precedes every other task; it lands the ordering rule they run under.
- Task 2 precedes Tasks 3 through 12; it changes the commit contract they are dispatched under.
- Task 3 precedes Task 8: both change the coverage manifest, and the runtime shape must exist before a new rubric entry references it (`audit.md` R-7).
- Task 5 precedes Task 10, which edits the same two review workflows.
- Task 8 precedes Task 9, which audits against the rule Task 8 lands.
- Task 9 precedes Tasks 10 and 11, which apply its findings.
- Task 12 depends on every preceding task.
- Task 13 depends on Task 8, whose rule it wires to the authoring side; it is a contract-changing task and holds wave 9 alone.

## Out of scope
- Model or effort retiering (`sprint.md` "Out of scope"); C-11 stays recorded, not applied.
- Reducing what a dispatch reads by inlining rule text into agent bodies (`audit.md` R-8) — a real economy lever that buys second homes for facts, and a tradeoff this sprint does not take.
