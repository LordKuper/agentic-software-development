---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

<!--
Format rules (parser-critical):
- Overview, Definition of Done — prose only, NO checkboxes
- Checkboxes (- [ ]/- [x]) appear ONLY inside `### Task N:` sections
- Checkboxes in any non-task section break orchestrator task parsing
- Subtask deferred for a manual action stays `- [ ]`, suffixed ` — BLOCKED: MS-N` (see manual-steps.md)
- No test-authoring tasks or subtasks: tests are selected and written in impl-test, after the code exists
- Every task carries a `Material risk:` line, plain text, never a checkbox (see sprint-lifecycle.md "Plan file format")
-->

## Overview

Remediates the sprint 008 retrospective, `AC-1`..`AC-18` of [sprint.md](./sprint.md), against the placement findings of [audit.md](./audit.md). `AC-9` was closed at the audit gate with no deliverable and has no task here.

Tasks are cut **by file, not by AC**, because four ACs land in `review-policy.md` and three more collide pairwise elsewhere. That grouping is the sprint's own thesis applied to itself: `AC-10` exists because parallel fix rounds over one file each cost a review iteration in sprint 008.

Every obligation lands in exactly one home named by the audit; other files cite it. Two ACs are cross-cutting and run last (`AC-16`, `AC-18`); `AC-17` is not a task — tests are selected in `impl-test`.

## Definition of Done

Standing DoD applies, never restated here (`sprint-lifecycle.md` "Plan file format").

Sprint-specific additions: `tests/run.js:3031-3046` currently asserts the agent-memory statement appears exactly four times, which Task 5 deliberately reduces. That test must be reconciled in `impl-test`, not left red and not deleted — the assertion converts to the owner-plus-citations shape used at `tests/run.js:3048`/`:3068`. Because every file this sprint edits is CRLF in the working tree until Task 10 lands, the standing check for this sprint's own commits is `git diff --cached --check`, never the bare form.

### Task 1: Staging and commit ownership, stated whole
Material risk: change: workflow-gate contract, plus an agent tool-policy grant
- [x] `.asd/rules/git-strategy.md` "Commit before review": extend the ownership paragraph with the two missing halves — a dispatched agent stages only the paths it authored, and commits every path it authored before signalling completion (`AC-1`, closing `F-1` and `F-3` from one sentence)
- [x] `.asd/agents/asd-dev.md` tool policy: grant `git add`/`git commit` for the agent's own work, never push, never `--no-verify` — same shape as `asd-tester.md:74`, without which the new rule is unfollowable by the agent it governs
- [x] Verify no other file restates the rule; `asd-phase-impl.md`, `asd-dev.md`, `asd-tester.md` cite it

### Task 2: review-policy.md — four obligations, one sequential pass
Material risk: change: four contracts in one file, two in the same section
- [x] `AC-5`: state the coverage manifest's vocabulary field in the manifest contract (`:93-105`) — allowed statuses and the `p`/`f` placement rule per row type, carried by the artefact the reviewer is handed, not by prose it must recall
- [x] `AC-4`: give the interrupted-dispatch contract (`:132-148`) a correlated-failure branch — one cause taking every dispatch of an iteration is recorded once as an iteration-level interruption, never as N per-reviewer attempts arming the split trigger N times
- [x] `AC-14`: in the same section, permit a late-returning duplicate dispatch's verdict to be recorded when it carries evidence contradicting the verdict already recorded; state who decides and what is written
- [x] `AC-11`: in "Autofix vs escalation" (`:70-83`), require a reviewer's proposed fix to be verified against source before it is applied; an equivalent correct fix remains permitted, an unverified transcription does not
- [x] `AC-13b`: in "Change-surface rule" (`:38-40`), close the diff-reachability gap — an agent-authored file that no one commits is invisible to review; name who commits reviewer-authored memory so it reaches the reviewed diff
- [x] Keep both `*-review` workflows citing this file, never restating it (`tests/run.js:2988-2993` asserts the citation)

### Task 3: runtime.js — one vocabulary constant, shared by validator and manifest
Material risk: change: validator behaviour and manifest digest shape
- [x] Lift the per-row-type status sets (`:235-237`) and the `p`/`f` placement rule (`:188-191`) into one exported constant, so the emitted vocabulary and the enforced vocabulary cannot drift
- [x] Publish that vocabulary in the manifest per Task 2's contract; decide and record whether `validate-ledger` requires the field or tolerates its absence — a required field breaks every existing manifest fixture
- [x] Confirm `manifest-digest --write` still round-trips the manifest with the new field

### Task 4: External review returns a verdict or a skip, never nothing
Material risk: change: review DoD depends on this outcome contract
- [x] `.asd/agents/asd-external-review.md`: the wrapped CLI is awaited inside the dispatch, never backgrounded; on inability to complete, return the availability skip. Tool policy and Don'ts are the slots (`AC-8`, `F-8`)
- [x] `.asd/rules/external-review.md`: state the outcome contract — exactly two permitted outcomes, a verdict or an availability skip; an empty return is neither and is not permitted
- [x] `.asd/rules/review-policy.md:134`'s scoping sentence points at that contract, so the boundary between the internal interrupted-dispatch rule and External Review stops being a hole
- [x] Record in `decisions-log.md` that `AC-9` is closed with no deliverable, so a later sprint reading the 008 retrospective does not re-open it

### Task 5: Agent memory is reviewable in both modes, said once
Material risk: change: deleting content a currently-green test asserts
- [x] `.asd/rules/artifact-layout.md` "Agent memory": state the property once, mode-independently — agent memory is hand-authored source inside the review surface, never excluded (`AC-13a`)
- [x] Reduce the four mode-specific restatements (`sprint-lifecycle.md:115`, `external-review.md:54` and `:60`, `t_prompt-external-impl.md:20`) to citations of that home
- [x] Close the consumer-mode hole: `external-review.md:53`'s consumer scope reads as an allow-list, leaving `.claude/agent-memory/**` undefined; state it the way the self-hosting row does — start from the whole repo, subtract the exclusions
- [x] Note for `impl-test`: `tests/run.js:3045`'s `totalMatches === 4` assertion is invalidated by this task by design

### Task 6: asd-phase-impl.md — shared worktree, sequential fix rounds
Material risk: change: dispatch routing and concurrency semantics
- [x] `AC-2`: the dispatch payload contract states that concurrently dispatched tasks share one worktree, citing Task 1's sentence rather than restating it
- [x] `AC-10`: review-fix mode runs its fix rounds sequentially under one agent. Only `:61` changes — `:64` is shared with initial mode and stays as it is
- [x] Check `:62` routing and `:83` "Wait all task signals" still read correctly once review-fix is no longer a concurrent set
- [x] `AC-11` impl side: the fix instruction (`:77`) cites Task 2's verification requirement

### Task 7: sprint-lifecycle.md — retro-derived criteria and criterion reachability
Material risk: change: two rule contracts, one of them parser-critical
- [x] `AC-3`: state in "Orchestration and adaptive gates" that a retrospective-derived acceptance criterion is verified against current `HEAD` before it is written into `sprint.md`, and that the verification is recorded in `decisions-log.md` — that log alone, decided at the audit gate; `t_sprint.md` gains no section
- [x] `AC-3`: `.asd/workflows/asd-phase-scope.md` step 2 implements and cites it
- [x] `AC-12`: in "Plan file format", make a criterion's reachability part of accepting it — a task whose value depends on two phases agreeing names which two and on what
- [x] `AC-12`: mirror the declaration in `t_plan.md`, and re-read the fail-closed grammar at `:302` so two declaration lines' absence semantics do not collide

### Task 8: checkpoints.md — a criterion's running cost is surfaced
Material risk: change: gate obligation with no enforcement mechanism behind it
- [x] `AC-15`: state the surfacing obligation on gates that already exist, with no new state — the count is read off `reviews/<phase>/iter-NN/` and the fix-round history in `decisions-log.md`, as decided at the audit gate
- [x] Name the measurement point and the unit explicitly, so the obligation is reviewable rather than decorative

### Task 9: code-style.md — the line-ending editing hazard and the blind lint
Material risk: change: a rule shipped to every consumer, so it may not assert this repo's platform
- [x] `AC-6`: §19 states that a scripted replacement anchors on the file's actual EOL, and that a whole-file diff for a small edit is the symptom — platform-neutral, since `code-style.md` ships via `managed_paths`
- [x] `AC-6`: state the measured blind spot — `git diff --check` exits 0 once the damage is staged, so the pre-commit check is `git diff --cached --check`
- [x] Update `.asd/project/commands.yaml`'s `lint` to the `--cached` form, so this repo's own configured check is the one the rule describes. `.asd/project/**` is outside the review surface, so verify this edit by grep at `impl-review` rather than expecting a reviewer to see it

### Task 10: .gitattributes
Material risk: artifact: a repo-wide checkout-behaviour change
- [x] `AC-7`: add a root `.gitattributes` declaring `* text=auto eol=lf`, this repository only — no template, no `/asd-init` seeding, no `managed_paths` entry
- [x] Confirm the measured premise still holds before committing: every index blob is LF, so no blob changes and `git add --renormalize .` is a no-op; the working tree normalizes to LF on the next checkout

### Task 11: Cross-file consistency and generated views
Material risk: artifact: mechanical mirrors whose staleness is caught by CI and tests
- [x] `AC-16`: re-check `README.md` (phase list, agent roster, model tiers, config schema, folder map, command list), `core.md` "See also", the phase chain and template variables against every change above; update whatever the changes actually touched, and record deliberately if nothing did
- [x] `AC-16`: update `.asd/release-manifest.json` `canon_hashes` for every edited agent — `agents/asd-external-review.md`, and `agents/asd-dev.md` if Task 1 edited it
- [x] `AC-18`: run `node .asd/sync.js --apply` for the generated views of every edited canonical agent, passing generated view paths; hand-edit no generated file
- [x] Confirm `node .asd/sync.js --check` is clean, as CI runs exactly that

## Dependencies

- Task 3 depends on Task 2 (the manifest's vocabulary shape is defined in the rule before the code emits it).
- Task 5 depends on Task 4 (both edit `external-review.md`; sequential, never concurrent).
- Task 6 depends on Task 1 and Task 2 (it cites both).
- Task 7's `AC-3` half touches `sprint-lifecycle.md`, as does Task 5's citation edit — run Task 7 after Task 5.
- Task 11 depends on every other task, being the mirror pass.
- Task 9 and Task 10 are independent of everything else and of each other; Task 10 changes no file content.

## Risks

- Four tasks (1, 4, 5, 11) touch canonical agents or their mirrors; each mis-sequenced pair leaves a stale generated view that CI catches but a reviewer does not.
- Task 3's "required vs tolerated" decision on the manifest field is the only place this sprint can break existing green tests silently; it is called out as a task subtask precisely so `impl-test` sees it.
- Task 8 delivers an obligation with no machine check behind it. If the wording cannot name a measurement point and a unit, the honest outcome is to report that rather than to ship decorative prose.

## Out of scope

- Cross-sprint storage of external-review availability (`AC-9`), closed at the audit gate.
- A consumer-facing `.gitattributes` (template, `/asd-init` seeding, `managed_paths`).
- Expanding CI to run `tests/run.js`; noted by the audit, named by no AC.
