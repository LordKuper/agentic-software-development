---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

## Overview
The plan covers sprint.md AC-1..AC-17. Acceptance-criteria source: `sprint.md` (`documents.prd` disabled). Inputs: `audit.md`, `decisions-log.001.md` (triage and HEAD evidence) and `decisions-log.002.md` (AC-8 contradiction answer).

Waves:
- Wave 1 changes the commit contract every later dispatch runs under.
- Wave 2 changes the dispatch payload contract.
- Wave 3 edits rule docs, workflows, templates plus runtime, and agents plus memory. The four Tasks run in parallel on disjoint files.
- Wave 4 aligns README, regenerates the provider views and manifest, and bumps the version.

After wave 4 passes the impl completion gate, the orchestrator writes the AC-4 backlog seed inline. It commits the seed as its own bookkeeping, because the backlog is orchestrator-owned and no dispatched agent writes it.

Shared vocabulary every wave-3 Task uses verbatim, so the parallel edits agree:
- **Retro row id.** `A-N` names the Nth row of a retro's Actions table; `P-N` names the Nth row of its Systemic proposals table.
  - N is the 1-based `<tbody>` ordinal, and `covered by:` rows are counted.
  - New retros emit the id as `<tr id="A-N">`. Legacy retros get the same ids from the same ordinal, so one algorithm reads both.
  - The cross-sprint address is `<NNN-slug>#A-N`.
  - Row ids and `Acts on` values are English literals under any `language.docs`.
- **Retro backlog.** Path: `.asd/project/retro-backlog.md`, template `t_retro-backlog.md`.
  - It is one table: `| Row | Acts on | Disposition | Decided in | Guardrail |`.
  - `Disposition` is one of `deferred | included | rejected | closed`. `closed` means verified already resolved at `HEAD`.
  - Each retro row has one line, updated in place; `Decided in` is the sprint that last decided it.
  - The orchestrator owns it and creates it lazily at the first intake write. `asd-init` does not seed it and no migration creates it, and `/asd-update` never touches it (`.asd/project/**`).
- **Retro intake.** Its sole normative home is a new `sprint-lifecycle.md` sub-section "Retro intake", placed beside "Retrospective-derived criteria are re-verified at scope". `asd-phase-scope.md` step 2a and `checkpoints.md` cite it.
  - Candidates come from `node .asd/runtime.js retro-candidates --sprints <dir> --backlog <path> [--self-hosting]`. The source is the rows of the most recent `archived/` sprint with `phase=done` and a `retrospective.html`, minus rows the backlog already disposes, plus the backlog's `deferred` rows. `covered by:` rows are dropped, and so are `asd` rows unless `--self-hosting`.
  - The helper outputs a JSON array `{row, acts_on, guardrail, home}`. An empty array is the AC-5 no-op: one decisions-log line and no question.
  - The orchestrator verifies each candidate at `HEAD`, recording evidence in `decisions-log.md` (existing rule). Resolved candidates are written `closed` without asking.
  - The rest go to the user inside the hard scope gate with a recommendation each. Include becomes an `AC-N`, reject is permanent, and undecided means `deferred`.
  - Dispositions are written to the backlog on scope acceptance and land with the sprint PR. An aborted sprint loses them, which is fail-safe because they are offered again.
- **Rotation boundary (AC-12).** No rotation when both the phase being left and the phase being entered are in {impl, impl-test, impl-review}. Rotation still fires on plan→impl, on rollback re-entry, and on impl-review→retro. Every within-cycle reader reads the live file.
- **Dispatch payload header (AC-9/AC-10).** Every dispatch runs from the repo root, and the payload opens with `Repo root: <absolute path>`. A reviewer, External Review or advisor payload also carries `Turn budget: <maxTurns>; report by turn <maxTurns − 5>`. Enforcement is host-scoped: on Claude the host enforces `maxTurns` and a cap stop counts as an interrupted dispatch (wave division, never resume, is the lever); on Codex the budget is advisory.
- **Memory-fix dispatch (AC-14).** A finding located in `.claude/agent-memory/<owner>/` routes to `<owner>`.
  - An owner that holds a write tool fixes the finding itself in the review-fix chain.
  - An owner without one (reviewers) gets a fresh memory-fix dispatch. It returns only a `MEMORY-FIX <path>` block holding the replacement text, with no verdict token, since this is not a review. The orchestrator applies that text verbatim, commits it, and logs one decisions-log line.
  - The impl step 9 round-diff gate admits exactly those paths.
  - The rule applies on Claude only, because Codex renders no `memory`.

Change surface: 33 files

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format"); it is not restated here.
Sprint-specific additions:
- `node .asd/sync.js --check` reports no drift.
- `.asd/project/retro-backlog.md` holds the AC-4 seed: 016 `P-2`; 017 `A-2`, `A-3`, `P-2`; 018 `A-1..A-3` and `P-1..P-3` `included`. 016 `P-1`, 017 `P-1` and `P-3` `deferred`. 016 `P-3` and 017 `A-1` `rejected`.
- `node .asd/runtime.js retro-candidates` run on this repo returns exactly the three deferred rows.

### Task 1: Atomic path-scoped commit contract
Material risk: change: workflow gate — commit contract every dispatched agent runs under
- [ ] `git-strategy.md` "Commit before review" (L40): a dispatched agent commits in one compound command, `git add -- <paths> && git diff --cached --check -- <paths> && git commit --only -- <paths>`, runs `git reset -q -- <paths>` on failure, and never leaves a path staged between commands. Never-tracked paths are covered by the same `git add`, and a rename names both paths. Keep the existing whole-tree-ban sentence intact, because `custom-coding-rules.md`'s mirror is derived from it.
- [ ] `git-strategy.md` "Commits": point to that one-command form. `code-style.md` §19 and `commands.yaml` stay unchanged (decisions-log.002.md).

### Task 2: Dispatch payload header — repo root and turn budget
Material risk: change: public contract — dispatch and reviewer payload shape
- [ ] `providers.md` "delegate to agent" operation: add the dispatch payload header rule (repo root reset before every dispatch, the `Repo root:` line). Replace L50's "Emitted on trust: `effort` and `maxTurns`" with the host-scoped statement: `maxTurns` is host-enforced on Claude and absent on Codex. Keep an `effort` claim only as far as the host docs support it.
- [ ] `review-policy.md` L33 exhaustive payload list: admit the `Repo root:` and `Turn budget:` lines, citing providers.md.
- [ ] `external-review.md` "Phase-scoped payload": admit the same two lines.
- [ ] `asd-phase-design-review.md` step 7 and `asd-phase-impl-review.md` step 6: the payload carries the header (a one-line cite, never restated).

### Task 3: Rule docs — intake home, rotation, tester lifecycle, review-fix rules
Material risk: change: workflow gate — new scope-time intake gate, rotation trigger and review-fix routing
Reachability: retro writes row ids at `asd-phase-retro.md` step 6; scope reads them through `retro-candidates` at `asd-phase-scope.md` step 2a
- [ ] `sprint-lifecycle.md`:
  - new "Retro intake" sub-section per Overview (AC-1..AC-5); "Retro phase" wording: the backlog holds scope-time dispositions, never retro content;
  - "Impl-test phase": fresh tester per entry and per terminal suite run, `test-plan.md` the only hand-off (AC-13);
  - review-fix tester amends only `test-plan.md`'s risk and added-test rows, while `Entry log` and segment rotation stay with impl-test (AC-15);
  - "State recovery": the failed-dispatch anchor is the *latest* routing line naming those ids (AC-12);
  - phase-table `scope` row mentions intake.
- [ ] `artifact-layout.md`:
  - path map `.asd/project/retro-backlog.md` and a short "Retro backlog" section (owner, lazy creation, never overwritten by update);
  - "Decisions log" Rotation per the rotation boundary (AC-12);
  - "Test plan": owner split impl-test vs review-fix tester (AC-15);
  - "Agent memory": a leftover-term check covering `.claude/agent-memory/**`, orphan agent directories included, from the first impl-test entry of a sprint that removes a mechanism or term (AC-16).
- [ ] `checkpoints.md`: the hard list and the inventory gain "retro intake dispositions" (part of the hard scope gate; reject permanent, undecided = deferred). "Criterion cost surfacing" covers included candidates.
- [ ] `review-policy.md`:
  - "Autofix vs escalation": a review-fix that changes a rule other files consume searches for every consumer of that rule's home, updates them in the same commit, and lists them in its completion signal (AC-11);
  - L142: the memory-channel claim is corrected to the memory-fix dispatch, per Overview (AC-14).

### Task 4: Phase workflows — scope intake, retro row ids, impl routing
Material risk: change: workflow gate — scope step order, review-fix memory routing, tester dispatch
Reachability: impl-review writes a memory finding location at step 7; impl reads it at step 3 routing
- [ ] `asd-phase-scope.md`: step 2 drops the cleanup/quality-criteria question (AC-6). A new step 2a, after the decisions log is seeded and before step 4, runs retro intake by citing "Retro intake". Step 4 writes the dispositions to the backlog on acceptance. The References list gains `t_retro-backlog.md`.
- [ ] `asd-phase-retro.md` step 6: emit the `A-N`/`P-N` row ids and keep the English literals (AC-7).
- [ ] `asd-phase-impl.md`:
  - step 3 routes memory findings to their owner, with the memory-fix dispatch for owners without a write tool (AC-14);
  - steps 5/6: the review-fix tester chain cites the AC-15 row limit and the AC-11 consumer-search rule;
  - L66 stalemate-answer reader reads the live `decisions-log.md` (AC-12);
  - step 9's round-diff gate admits memory-fix paths the orchestrator applied.
- [ ] `asd-phase-impl-test.md` L15/L74: a fresh tester per entry, never resumed across entries (AC-13). Step 1 cites the AC-16 leftover-term check on entry 1.
- [ ] `asd-phase-impl-review.md` step 9: dispatch a fresh tester for each terminal suite run (AC-13).

### Task 5: Templates and runtime helper
Material risk: change: public contract — new runtime command, new persistent template, retro row-id format
- [ ] New `t_retro-backlog.md`: `responsibility` frontmatter (owns: cross-sprint dispositions of retro rows; excludes: retro content, sprint decisions), the table header per Overview, and a short comment giving the disposition vocabulary.
- [ ] `t_retrospective.html`: `id="A-N"` / `id="P-N"` on Action and Systemic `<tr>`s, plus a comment that row ids and `Acts on` values stay English literals. Keep the `tests/run.js:3069-3101` shape (section ids, `F-N`, `consumer | asd`).
- [ ] `t_decisions-log.md` "Durability rule": add `.asd/project/retro-backlog.md` to the list of persistent homes.
- [ ] `.asd/runtime.js`: a `retro-candidates` command per Overview (zero dependencies, deterministic, fail-closed on unreadable input). An absent backlog reads as empty. It exports the parsing function for tests.

### Task 6: Agents and agent memory
Material risk: artifact: tester and External Review agent bodies plus hand-authored memory
- [ ] `asd-tester.md`: the description names the review-fix dispatch; the body cites the AC-15 row limit, the fresh-per-entry lifecycle (AC-13) and the AC-16 leftover-term check.
- [ ] `asd-external-review.md` L67: the memory carve-out is aligned with the corrected review-policy statement (AC-14).
- [ ] Memory `asd-reviewer-documentation/project_reviewer-write-scope-declaration.md` L9 and `asd-tester-critical/feedback_fail-first-and-none-honesty.md` L55: stop restating the host-served memory channel. The tester-critical file is the dispatched owner's own memory, so that owner edits it. The reviewer file's owner has no write tool, so the orchestrator applies the owner-approved text per AC-14 and records it.
- [ ] `node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply` for `.claude/agents/asd-tester{,-mechanical,-critical}.md`, `.claude/agents/asd-external-review.md` and the matching `.codex/agents/*.toml`.

### Task 7: README, manifest, version
Material risk: artifact: README mirror, release manifest and changelog
- [ ] README.md:
  - L159 scope row (retro intake, no cleanup question);
  - L168 retro row (row ids);
  - L215 memory channel (AC-14);
  - folder map (`.asd/project/retro-backlog.md`);
  - update-ownership table (backlog never touched).
- [ ] `.asd/release-manifest.json`: `upstream_hashes` for `t_retro-backlog.md` and the edited templates, and `canon_hashes` via `sync.js --apply`. Bump `asd_version` (minor, for the new runtime command and backlog) and add a `CHANGELOG.md` entry.
- [ ] `node .asd/sync.js --check` is clean.

## Risks
- Tests pinned to current wording go red by design and are updated in impl-test: `tests/run.js` 5462/5505 (AC-6), 3412/3417 (AC-14), 3427 (AC-10), 3452-3453, 4932-4937 (rotation), 3704-3714 (only if the whole-tree clause moves). impl-test also adds a `retro-candidates` unit test and a backlog shape and seed assertion (input for impl-test, not a Task here).
- The wave-3 Tasks write the same concepts in different files. The Overview vocabulary is the agreement point, and the impl-review documentation reviewer checks it.
- The backlog is outside every review surface (`.asd/project/**`). The DoD seed check and the impl-test backlog assertion are its only guards.
- A consumer mid-cycle at upgrade may hold a stalemate answer in a segment rotated under the old rule. The live-file reader misses it and asks again, which is fail-safe.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | 1 |
| 2 | 2 |
| 3 | 3, 4, 5, 6 |
| 4 | 7 |

- Task 1 goes first and alone: it changes the commit contract every later Task commits under.
- Task 2 goes alone before wave 3: it changes the dispatch payload every wave-3 dispatch carries. It touches `review-policy.md` L33 only; Task 3 edits the other `review-policy.md` sections afterwards.
- Tasks 3-6 touch disjoint files and share only the Overview vocabulary.
- Task 7 depends on every earlier Task: README mirrors their final text, and sync regenerates their outputs.
- The backlog seed (orchestrator, after wave 4) depends on Task 5's template.

## Out of scope
- `code-style.md` §19, `commands.yaml` `lint` and `custom-coding-rules.md` (decisions-log.002.md, option a).
- Seeding the backlog from retros 012–015.
