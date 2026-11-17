---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

## Overview
Implements AC-2..AC-5, AC-7..AC-16 of `sprint.md` (AC-1, AC-6 retired) from `sprint.md`, `audit.md` and `research.md` approach A. Wave 1 holds eleven Tasks on disjoint paths; wave 2 is the README mirror.

Decided names every Task cites (fixed here, so wave-1 Tasks need not wait for each other):
- `.asd/runtime.js` (Task 1):
  - `latch-refresh --state <state.json> --sprint-dir <sprint>`: reads the current impl wave K, its `latched` keys and its last `iteration_heads` sha; diffs that sha to `HEAD` (`git diff --name-status --no-renames`, then `-U0` per file). A changed file is production executable when `isExecutable && !isTest`. A file counts as changed unless every changed line is blank or a comment line of its extension family (c-family: starts with `//`, `/*`, `*`, `*/`; hash family: `#`; dash family: `--`); an unknown extension counts as changed. A changed production file clears a latched key when it is in the union of that reviewer's `files` across the wave's `iter-*/<reviewer>.manifest.json` (`external`: `external.scope.json`), or in no manifest of the wave (then it clears every latched key). Writes `state.json` and prints `{"cleared":[…],"files":[…]}`. No latch, no `iteration_heads` entry, or no changed production file → prints `cleared: []`, writes nothing.
  - `emit-manifest --checklist <path>`: an absent file adds nothing. Otherwise each item whose `Trigger` (comma-separated path globs, `*` within a segment, `**` across segments) matches a file of that reviewer's `--files` adds its id `CL-N` to the manifest `rules` and `{id, check, severity}` to a manifest `checklist` array.
  - `emit-manifest --base-ref <ref>`: reads each reviewer rubric from `git show <ref>:.asd/agents/asd-reviewer-<r>.md`.
  - `context --base-ref <ref>`: reads every bundle ref to `.asd/rules/review-policy.md`, `.asd/rules/external-review.md` or `.asd/templates/t_reliability-checklist.md` from `git show <ref>:<path>`. A path absent at `<ref>` is omitted with a stderr note.
  - `persist-review` findings JSON:
    - each finding gains `pre_existing: true` when its Description starts with `pre-existing:`;
    - each finding gains `checklist: ["CL-N",…]` for every `CL-N` its Description cites.
  - `checklist-hits --checklist <path> --sprint-dir <sprint>`:
    - sets `Last hit` to the sprint's `<NNN-slug>` on every item a findings JSON under `<sprint>/reviews/` cites;
    - prints `{"hit":[…],"candidates":[…]}`.
    - Candidate edge: base = the `Last hit` sprint number, else the sprint number in `Source`. An item is a candidate when the current NNN minus base ≥ 3 and `Severity` is not `critical`.
    - An absent file prints empty lists and writes nothing.
  - Unknown flags: every command warns on stderr `runtime: ignored flag --<name>` for each flag outside its declared set; the exit code is unchanged.
- Checklist file `.asd/project/reliability-checklist.md` from `.asd/templates/t_reliability-checklist.md` (Task 8):
  - one table, columns `ID | Trigger | Check | Severity | Source | Last hit`;
  - ids `CL-N`; `Source` `<NNN-slug>#F-N|A-N|P-N`; `Last hit` `<NNN-slug>` or `—`.
- Config key `safety_valve: enabled|disabled` (Task 8):
  - top level of `t_config.yaml`, absent = `enabled`;
  - read live, never frozen.
- `commands.yaml` key `smoke` (Task 8): optional, absent = skip.
- Rule homes:
  - `.asd/rules/sprint-lifecycle.md` "APPROVE latch" (fix-round clear), "Impacted test set" (valve switch), "State recovery" "User-resolved findings" (`issue` kind) — Task 3;
  - `.asd/rules/review-policy.md` "Change-surface rule" (`pre-existing` marker), "Coverage ledger" (`CL-N` cite), "Scope hand-off" (self-hosting base-ref and its limit) — Task 2;
  - `.asd/rules/artifact-layout.md` "Reliability checklist" (new section) — Task 9.

Load budget (audit Risks): orchestrator/impl has 128 B under the D13 ceiling, so a Task editing a section of that bundle keeps its own bytes there net ≤ 0. It measures this by summing the bytes of its own files' `<!-- <path>[#section] -->` segments in `node .asd/runtime.js context --phase impl --role orchestrator --out .asd/tmp/035-verification-hardening-<task>-load.context.md`, before its first edit and before COMPLETED, and pays for any growth with documentation-economy cuts in those same segments. Bundle files in scope: `sprint-lifecycle.md` (Operation timing, Impacted test set, State recovery), `language-policy.md`, `artifact-layout.md` (both Paths maps, Tech reference docs), `review-policy.md` (Autofix vs escalation, Gate Verdict Format — Task 2 leaves both untouched).

Restating sites:
- Safety valve: `sprint-lifecycle.md` (Task 3); `asd-phase-impl-test.md`, `asd-tester.md` (Task 5); `asd-phase-cleanup.md`, `asd-phase-pr.md` (Task 6); `t_config.yaml` (Task 8); `asd-init/SKILL.md` (Task 10); README (Task 12).
- User-resolved kinds: `sprint-lifecycle.md` (Task 3); `asd-phase-impl-review.md` (Task 4).
- APPROVE latch clears: `sprint-lifecycle.md` (Task 3); `asd-phase-impl-review.md` (Task 4); README "APPROVE latch" paragraph (Task 12).
- Change-surface rule: its only restatement of the unchanged-code clause is `review-policy.md` (Task 2). `artifact-layout.md`, `git-strategy.md` and `providers.md` cite the rule without restating that clause.

External APIs:
- Task 1: `git diff --name-status`, `git diff -U0`, `git show <ref>:<path>` — `docs/architecture/tech-reference/git-2.56.md`, extended this phase with default target and mutation.
- Task 4: `gh issue create -R <owner/repo> -t <title> -F <file>` — `docs/architecture/tech-reference/gh-2.90.md`. Default target: `-R` given, so never the current-directory remote. Mutation: creates one issue.

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.
`node tests/run.js --filter "(D13)"` green at every wave end: every role under its load ceiling (AC-8, AC-11).

### Task 1: Runtime mechanics for latch refresh, checklist, base-ref, findings markers, unknown flags
Material risk: change: comment-only hunk classification misreading code as a comment keeps a latch (unsafe direction)
Material risk: change: trigger glob grammar and the 3-sprint candidate edge
- [ ] AC-15: add `latch-refresh` per `## Overview`, a second runtime latch writer beside `recordVerdicts`; reuse `isExecutable`, `isTest`, the wave/iteration path helpers and `INTERNAL_REVIEWERS`/`EXTERNAL_REVIEWER`; legacy flat `reviews.impl` reads as wave 1
- [ ] AC-2: `emit-manifest --checklist` per `## Overview`, matching each item trigger against that reviewer's `--files`
- [ ] AC-16: `context --base-ref` and `emit-manifest --base-ref` per `## Overview`, reading via `git show` with no shell
- [ ] AC-5, AC-4: `persist-review` findings JSON `pre_existing` and `checklist` fields per `## Overview`
- [ ] AC-4: `checklist-hits` per `## Overview`, preserving the file's other bytes and EOL
- [ ] AC-9: per-command declared flag sets; warn on stderr for each other flag; `commit-check`/`memory-check` keep their own rejection

### Task 2: Review policy: pre-existing marker, checklist citation, base-ref statement
Material risk: change: wording of the change-surface exception for pre-existing defects
- [ ] AC-5: "Change-surface rule" — a defect the reviewer sees in unchanged code it read, predating the sprint diff, is reported with Description prefix `pre-existing:` instead of being dropped; External Review findings never carry it; routing lives in `asd-phase-impl-review.md`
- [ ] AC-2: "Coverage ledger" — manifest `checklist` items are covered like any rule id; a finding an item caught cites its `CL-N` in Description
- [ ] AC-16: "Scope hand-off" — under `self_hosting` the bundle's `review-policy.md`, `external-review.md`, `t_reliability-checklist.md` and each rubric come from `origin/<git.base_branch>`; the host-loaded reviewer definition body stays the working-tree view (stated limitation)
- [ ] leave "Autofix vs escalation" and "Gate Verdict Format" untouched (load budget)

### Task 3: Sprint lifecycle: fix-round latch clear, valve switch, suite scopes, issue resolution
Material risk: change: valve-off reach across impl-test, cleanup and the pr gate
- [ ] AC-15: "APPROVE latch" — add the fix-round clear trigger computed by `latch-refresh`; name it beside `record-verdicts` as a runtime latch writer
- [ ] AC-14: "Impacted test set" safety valve — `safety_valve: disabled` (live read) skips the valve at impl-test's suite gate and cleanup's verification; the pr gate then accepts cleanup's green verification record when no code, test or stub path changed since its sha
- [ ] AC-10: "Operation timing" `suite` scope attr `full`|`impacted`|`named`
- [ ] AC-5: "State recovery" "User-resolved findings" — add kind `issue #<N>` for a pre-existing finding filed as an issue
- [ ] AC-5: `language-policy.md` "Matrix" — the consumer-repo issue row covers titles, bodies and comments
- [ ] keep this Task's bytes in the orchestrator/impl bundle net ≤ 0 (`## Overview` Load budget)

### Task 4: Impl-review workflow: latch refresh, checklist, base-ref, pre-existing routing
Material risk: change: issue filing as an external action and its pre-existing verification
- [ ] AC-15: at each iteration start after the first in a wave, run `latch-refresh` before the APPROVE latch filter; record cleared keys in the decisions log
- [ ] AC-2: pass `--checklist .asd/project/reliability-checklist.md` to `emit-manifest`
- [ ] AC-16: under `self_hosting`, pass `--base-ref origin/<git.base_branch>` to every reviewer's `context` and to `emit-manifest`
- [ ] AC-5: after `persist-review`, before routing — each `pre_existing` finding below `critical` from an internal reviewer: the orchestrator confirms the cited lines are unchanged since the sprint's merge-base, files `gh issue create -R <repo>` (project repo; the ASD repo under `self_hosting`) [GATE adaptive: external action] and appends `resolved: <id> — issue #<N>, <date>`; unconfirmed routes as a normal finding; `critical` routes to review-fix

### Task 5: Tester: smoke at green exit, differential tests, valve switch
Material risk: none
- [ ] AC-3: `asd-phase-impl-test.md` step 10 — run `commands.yaml` `smoke` once at green exit when present; failure → code defect `D-N`, route to impl test-fix; absent → skip
- [ ] AC-3: `asd-tester.md` suite-run rules and `t_test-plan.md` `Suite run` — a `Smoke:` line (command, pass/fail)
- [ ] AC-7: `asd-tester.md` "Evidence routing" row — behaviour-preserving refactor or migration → differential test, previous version as oracle, same inputs, each mismatch triaged (bug, intended change, representation, undocumented behaviour), never auto-failed
- [ ] AC-14: `asd-phase-impl-test.md` step 8 and `asd-tester.md` valve line — skipped when `safety_valve: disabled`

### Task 6: Cleanup and pr: valve switch
Material risk: change: pr gate reuse of cleanup's impacted verification
- [ ] AC-14: `asd-phase-cleanup.md` step 5 — valve skipped when `safety_valve: disabled`; step 6 record keeps `tests @sha`
- [ ] AC-14: `asd-phase-pr.md` open mode step 1 — with `safety_valve: disabled`, a green cleanup record whose sha has no code/test/stub change to `HEAD` satisfies the re-run check

### Task 7: Retro and scope intake: checklist hits and removal candidates
Material risk: change: first retro write to a project file and intake apply point
- [ ] AC-4: `asd-phase-retro.md` — run `checklist-hits`; each candidate becomes a P-row (Guardrail: remove `CL-N`; Home: the checklist); Exit lists the checklist write; Home options include the checklist for a new item
- [ ] AC-4, AC-2: `asd-phase-scope.md` step 2a — an included checklist row is applied by the orchestrator at intake (add an item, creating the file from the template if absent; or delete the item); rejected/deferred leaves it

### Task 8: Templates
Material risk: none
- [ ] AC-2: new `.asd/templates/t_reliability-checklist.md` per `## Overview` (frontmatter `responsibility`, table header only)
- [ ] AC-3: `t_commands.yaml` optional `smoke`
- [ ] AC-14: `t_config.yaml` top-level `safety_valve: enabled` with a one-line comment
- [ ] AC-13: `t_tech-reference.md` API surface entry shape names default target and mutation

### Task 9: Artifact layout: checklist home, tech-reference clause
Material risk: none
- [ ] AC-2: both Paths maps gain `reliability-checklist.md  # lazy, "Reliability checklist"`; new section "Reliability checklist" (owner orchestrator, lazily created at intake, never overwritten by ASD or `/asd-update`, format = template, written by scope intake and retro `checklist-hits`)
- [ ] AC-13: "Tech reference docs" — each API surface entry records default-target resolution and any state mutation, verified against help or source, before a Task uses it
- [ ] keep this Task's bytes in the orchestrator/impl bundle net ≤ 0 (`## Overview` Load budget)

### Task 10: asd-init: smoke detection, safety_valve setting
Material risk: none
- [ ] AC-3: command detection proposes `smoke` from a detected smoke script or target; none → key omitted
- [ ] AC-14: fresh and re-init prompts carry `safety_valve` (default `enabled`)

### Task 11: Dev rule: re-read implemented ACs on rule narrowing
Material risk: none
- [ ] AC-12: `asd-dev.md` `## Rules` — a review-fix that narrows or rewrites a rule re-reads every `AC-N` that rule implements and keeps each case it names

### Task 12: README mirrors
Material risk: artifact: mirror edits verified by `node tests/run.js`
- [ ] AC-8: Configuration (`safety_valve`, `commands.yaml` `smoke`), Folder structure (`reliability-checklist.md`, `t_reliability-checklist.md`, `runtime.js` new commands), "APPROVE latch" paragraph (fix-round clear)

AC-11 → orchestrator, at impl wave 1 open before any dispatch: add to `.asd/project/custom-coding-rules.md` "Framework repo specifics" — before COMPLETED, a dev that edited a file of a baselined role's always-loaded bundle runs `node tests/run.js --filter "(D13)"` and keeps every role under its ceiling; commit it.
Sync and version → orchestrator: `sync.js --apply` per wave (`release-manifest.json` hash ledgers included); `asd_version` bump and `CHANGELOG.md` at pr.

## Risks (optional)
- Wave 1 runs eleven concurrent Tasks in one worktree. Commits follow `git-strategy.md` "Commit before review" over named paths only.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | Task 1, Task 2, Task 3, Task 4, Task 5, Task 6, Task 7, Task 8, Task 9, Task 10, Task 11 |
| 2 | Task 12 |

- Task 12 depends on Tasks 1–11: it mirrors their final wording.
- Wave-1 Tasks cite each other only through the names and homes fixed in `## Overview`.
