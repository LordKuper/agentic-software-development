---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 015-glings-retro-003-review-scope

## Goal

Bring the ASD-framework findings from the consumer retrospective of Glings sprint 003-subsystem-layout-migration into canon. Also make three changes the user requested directly:

1. Context management no longer asks anyone to clear the session. Between sprint phases the context is compacted automatically, with no human involved.
2. Each internal reviewer always receives its scope as an explicit list of files to review on the current iteration.
3. Each reviewer has a defined area of responsibility in each review phase.

Only retrospective rows still unresolved at `HEAD` 8649c9c are carried here. Per-row verification is in `decisions-log.md`.

## Acceptance

- AC-1: `core.md` "Context hygiene" no longer mentions clearing the session, or preferring a clear over compaction. At a phase boundary the orchestrator moves on to the next phase itself, and context is compacted automatically without asking the user. The compaction-summary contents and the never-mid-gate rule stay. The recovery path from `state.json` stays. Any other canon or README text that tells anyone to clear the context is removed or changed to match.
- AC-2: Every internal reviewer dispatch, in both `design-review` and `impl-review`, gets its scope as an explicit list of files. The list is built for that reviewer and that iteration, and the payload names no other scope source. An unlisted file is out of that reviewer's scope. The list comes from the reviewer's area of responsibility (AC-3), and `emit-manifest` builds the manifest from it. The rule has one home in `review-policy.md`, and both review workflows reference it.
- AC-3: `review-policy.md` has one table giving each reviewer's area of responsibility in each review phase. It covers Correctness, Efficiency, Testing, Documentation and External Review in design-review and in impl-review. For each reviewer the table says what the reviewer judges and which files it receives, and the file side is the AC-2 selector. Every agent's `description`/"Does NOT handle" text and both review workflows agree with the table. No concern is left without an owner.
- AC-4: Reviewers with no shell can see the change itself, not only the post-change files. The phase workflow writes the iteration's diff as files under `reviews/impl/iter-NN/` and puts their paths in the payload. The payload never tells a reviewer to run git (Glings F-7, F-8).
- AC-5: The coverage ledger may use a compact row class for a file whose change the runtime machine-verifies as behaviour-neutral. That covers a pure rename with 100% similarity, and an edit confined to namespace/import lines if audit finds it verifiable. The runtime proves the class and `validate-ledger` enforces it. A reviewer can never assert it (Glings F-9).
- AC-6: An owner may approve renaming or deleting one of its own BA or UX persistent docs. `asd-phase-design-promote.md` then explicitly routes the git operation to the main orchestrator, because those two agents have no shell. This path is used instead of widening their tool policy (Glings F-4).
- AC-7: `asd-sprint` and the scope workflow collect free-form scope text as a plain chat message. They never collect it through a discrete-option user-decision prompt. `core.md` "Request user decision" says it is never used for free-form input (Glings F-3).
- AC-8: The user can skip an enabled optional document for one sprint only. This is a hard gate. The skip is recorded as a frozen `false` in `state.json.documents` plus one decisions-log line, and `config.yaml` is not changed (Glings F-1).
- AC-9: An `audit` dispatch whose scope is more than 200 files carries a batched-read plan in its payload. The architect's turn budget is sized for whole-codebase audits (Glings F-2, audit half).
- AC-10: Before the scope gate, the scope workflow asks explicitly about cleanup and quality criteria: legacy removal, warning budget and doc consolidation. It skips the question when the raw scope already covers them (Glings systemic 1).
- AC-11: The number of concurrent agent dispatches in one phase step has a ceiling (default 20, one constant in `.asd/runtime.js`). Parts above the ceiling are dispatched in sequential waves. A change-surface cap-override request states the dispatch count it implies (Glings systemic 3).
- AC-12: When a change breaks an active consumer sprint's state or files, `CHANGELOG.md` and a migration (or an explicit no-migration note) cover it per `backward_compat: migration`. `asd_version` is bumped.
- AC-13: `node tests/run.js` is green, and new runtime behaviour (AC-2, AC-5, AC-11) has tests. `node .asd/sync.js --check` is clean. README.md matches the changed rules, workflows, agents and templates. Every added line passes `artifact-layout.md` "Documentation economy".

## Out of scope

- Consumer-scope rows F-5, F-6 and the consumer systemic proposal on migration commit shape. They belong to Glings.
- F-2's reviewer half, already covered by `SPLIT_THRESHOLD_FILES` split dispatch.
- Widening BA/UX tool policy with a shell. AC-6 routes through the orchestrator instead.
- Hand-edits to generated provider views. Edit canon, then run `sync.js --apply`.
