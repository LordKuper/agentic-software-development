---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 035-verification-hardening

## Goal
Adopt seven verification practices from the Claude Code team article "How the Claude Code team thinks about verification" (https://claude.dev/blog/how-the-claude-code-team-thinks-about-verification/), approach A of `research.md`: review is bound to the code that merges, guardrails load only when their diff trigger matches and are pruned when they stop catching anything, the change itself is run, pre-existing defects leave the sprint as issues, verification rules cannot review themselves under self-hosting, and the tester knows differential tests.

## Acceptance
- AC-1: A review-fix or test-fix round that changes at least one production executable file inside an APPROVE-latched reviewer's reviewed scope clears that reviewer's latch, so it is dispatched again on the next iteration; a round changing only documentation, comments, tests or other non-production files keeps every latch. The decision is a `.asd/runtime.js` computation over the round's changed files and the latched reviewer's scope, covered by `tests/run.js`.
- AC-2: A consumer-owned reliability checklist (`.asd/project/reliability-checklist.md`, shipped as a `.asd/templates/` template, created lazily, never overwritten by ASD) holds items with id, diff-readable trigger, check, severity, source (`<NNN-slug>#F-N|A-N|P-N`) and `last_hit`. An impl-review reviewer receives only the items whose trigger matches its scope; the matching is a `.asd/runtime.js` computation covered by `tests/run.js`; an absent checklist adds nothing to any dispatch. Existing `custom-*-rules.md` content is not migrated.
- AC-3: An optional `smoke` command in `commands.yaml` (template and `asd-init` detection) is run by `asd-tester` once at impl-test's green exit; a failure is recorded as a code defect `D-N` and routes to impl test-fix mode; an absent key skips the step with no failure.
- AC-4: Retro sets `last_hit` to the current sprint on every checklist item a reviewer finding cited this sprint, and lists as removal candidates the items with no hit in the last 3 sprints, `critical` items excepted; each candidate is put to the user at the next scope's retro intake, and only an accepted removal deletes the item.
- AC-5: A reviewer marks a finding `pre-existing` when its defect predates the sprint diff. A pre-existing finding below `critical` is not routed to review-fix: the orchestrator opens a GitHub issue for it (the project's repository; the ASD repository under `self_hosting`) and records the issue on the finding as resolved; a `critical` pre-existing finding routes to review-fix as today.
- AC-6: Under `self_hosting`, when the sprint diff touches a verification rule file (`review-policy.md`, `external-review.md`, the `asd-reviewer-*` and `asd-external-review` agent definitions, the reliability checklist template), every reviewer's context bundle takes those files from `origin/<git.base_branch>` rather than the working tree; built by `.asd/runtime.js`, covered by `tests/run.js`.
- AC-7: The tester's strategy table carries a differential-test row: for a behaviour-preserving refactor or migration, the previous version is the oracle, outputs compared on the same inputs, each mismatch triaged rather than auto-failed.
- AC-8: README, `core.md` "See also" (if a rule doc is added), `release-manifest.json` and `tests/run.js` mirrors match the changes above; `node tests/run.js` and `node .asd/sync.js --check` pass; the per-dispatch load test keeps every role under its ceiling.
- AC-9: Every `.asd/runtime.js` command warns on stderr for each flag it does not recognise, naming the flag, instead of silently ignoring it; the exit code is unchanged. (retro 034#A-1)
- AC-10: `sprint-lifecycle.md` "Operation timing" admits every `Suite run` Scope value (`full`, `impacted`, `named`) as a `suite` op's `scope` attr. (retro 034#A-3)
- AC-11: Before COMPLETED, a dev who edited a file of an always-loaded context bundle runs the per-dispatch load check and keeps every role under its ceiling. (retro 034#P-1)
- AC-12: A review-fix that narrows or rewrites a rule re-reads every `AC-N` that rule implements and keeps each case that AC names. (retro 034#P-2)
- AC-13: Before a Task uses a command, its tech reference records the command's default-target resolution and any mutation of existing state, verified against the tool's help or source. (retro 034#P-3)
- AC-14: A project-owner config switch, default off (safety valve kept), turns the shared-infrastructure safety valve off for impl-test's suite gate and cleanup's verification and lets the pr gate accept cleanup's impacted verification instead of a full re-run, so the full suite runs once per review cycle; `asd-init`, the config template and README carry it. (issue #120)

## Out of scope (optional)
- Migrating existing `custom-*-rules.md` prose into the checklist.
- A reviewer eval harness (replaying past incidents) and commit verification stamps.
