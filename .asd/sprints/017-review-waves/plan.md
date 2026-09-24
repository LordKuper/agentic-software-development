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
- A task whose value depends on two phases agreeing also carries a `Reachability:` line, same placement; absent = no cross-phase dependency, never a fail-closed default (same section)
- A task declaring a project-settings change carries a `Settings change: <key>=<value>[, …]` line, same placement; plan acceptance approves exactly those pairs, and the task sits alone in its wave: wave 1, ahead of any contract-changing task, or a wave after the task adding its key to t_config.yaml (same section)
- Overview carries one required `Change surface: <n> files` line (same section)
- `## Dependencies` is required and opens with the wave table impl dispatches from; every task sits in exactly one wave (same section)
-->

## Overview
This plan implements `sprint.md` AC-1..AC-8, working from the gaps and risks in `audit.md`. The design decisions below are fixed by this plan. The Tasks cite them as **D1..D10**, and the impl dispatch carries them as the spec.

- **D1 — Wave trigger and count.** Wave count is decided once, at the first `impl-review` entry (no wave node in state) and again after a rollback reset.
  - A new runtime command `review-waves` measures the scope's diff volume: added+deleted lines from `git diff --numstat` over `<base_branch>...HEAD`, restricted to the scope file list.
  - Binary files (`-`) and pure renames count 0.
  - Required wave count: `n = min(3, max(1, ceil(lines / WAVE_THRESHOLD_LINES)))`, with the new constant `WAVE_THRESHOLD_LINES = 3000`.
  - `n = 1` means today's single-review behaviour.
- **D2 — Division.** For `n > 1` the orchestrator groups the scope **files** (not Tasks) into `n` logically cohesive waves. Plan Tasks, `ASD-Task` trailers and directory areas are hints only. A file several Tasks touched, or an untrailered file (agent memory), is placed by judgment into exactly one wave.
  - `review-waves --division <json>` validates the grouping: exactly `n` non-empty lists, disjoint, union == the scope list.
  - It then writes `<sprint>/reviews/impl/waves.json` = `{base, head, lines, threshold, waves: [[files]…]}`. The file lists live there, not in `state.json`.
  - The division gets one decisions-log entry.
- **D3 — State shape.** `reviews.impl` becomes `{ "wave": <K current, 1-based>, "waves": [ {iteration, verdicts, iteration_heads, latched}, … ] }`.
  - Each wave node holds the pre-wave fields unchanged in meaning, so `verdicts`/`iteration_heads` keys stay `iter-NN` inside a node.
  - Legacy fallback (AC-6, `backward_compat: migration`): a `reviews.impl` without `waves` is read as `waves: [<that node>]`, `wave: 1`.
  - The first wave-aware write, at the impl-review entry, rewrites it into the new shape verbatim.
  - No migration script: this follows the reader-fallback precedent, and migrations never reach `.asd/sprints/**`.
  - Rollback reset clears `reviews.impl` to the `t_state.json` seed and deletes nothing on disk. A fresh `waves.json` overwrites the old one at re-division.
- **D4 — Paths and the iteration id.**
  - Review files move to `<sprint>/reviews/impl/wave-<K>/iter-NN/`; the legacy `reviews/impl/iter-NN/` is read as wave 1.
  - One canonical sentence in `sprint-lifecycle.md` "Review iteration counters" defines the impl-review **iteration id** as `wave-<K>/iter-NN`. Every impl-review literal citing `iter-NN` means that id. This covers `review_fixes_pending`, the fix-round tail `for <id>: findings resolved`, the `ASD-Task: impl-review <id> suite` trailer, the interrupted/correlated decisions-log lines and External Review's skip/stalemate references.
  - Sites that must be unambiguous are edited to the id form. Design-review paths and ids are unchanged.
- **D5 — Counter lifecycle and sequencing (AC-2, AC-3).**
  - A wave's counter increments at the start of every iteration of that wave. Floor and cap (`review-policy.md`) are computed from it, and a cap override is per wave.
  - When wave K's roster is all APPROVE/latched and K < n, the same `impl-review` entry proceeds to wave K+1, iteration 1, with no impl/impl-test in between (no code changed).
  - Unresolved findings in wave K route to `impl` review-fix → `impl-test` → re-entry on wave K.
  - The terminal full suite runs once, after wave n's roster is met.
  - The change-surface cap precondition moves from "iteration 0" to "no wave node".
  - The return contract gains `WAVE: <K>`, and `ITER` becomes that wave's counter.
- **D6 — Per-iteration scope (AC-4).**
  - Wave K, iteration 1: its division list ∪ files changed since the latest recorded iteration head of any earlier wave, whole list diffed over `<base_branch>...HEAD`. The union catches review-fix commits and reviewer memory writes (review-policy "Diff reachability").
  - Iteration 2+: files changed in `iteration_heads[prev]...HEAD` of the same wave, whatever wave they were divided into, new files included.
  - A closed wave is never reopened.
  - Red full-suite invalidation keeps clearing every latch sprint-wide; a closed wave is never dispatched again, so this only re-arms the current (last) wave.
  - A verified late duplicate return for a closed wave is written to its `.late.md` as evidence, and its finding joins the current wave's unresolved set. The closed wave's `verdicts`/`latched` stay untouched.
- **D7 — Waves replace parts (AC-5).**
  - Split dispatch parts are removed in both review phases: the size trigger (`SPLIT_THRESHOLD_FILES`), the interruption trigger (`--halve`), `.part-N` manifests/diffs/review files, `NA_PREDICATES.outOfPart`, the union property and the part merge. Every reviewer gets one manifest, one `.diff` and one review file per iteration.
  - An internal reviewer interrupted twice in a row on the same manifest in one iteration escalates to the user (retry fresh / abort), with no re-split.
  - `surface-check` drops `dispatches` and `--test-plan-files`: without parts, a wave-iteration dispatches at most 5 agents. `SURFACE_CAP_FILES` stays 100 as a plain literal, and the cap-override request no longer states a dispatch count.
  - External Review's in-dispatch file batches are removed. One dispatch makes one wrapped-CLI invocation over its whole list, retried once.
    - The `partial` outcome goes too, so the Outcome contract keeps verdict and availability skip only.
    - A failure after invocation is an interrupted dispatch, and `Unreviewed files` comes only from a skip.
    - A legacy `"APPROVE (partial: …)"` already recorded in an in-flight sprint still reads as satisfied (`sprint-lifecycle.md` "State recovery" legacy line), under `backward_compat: migration`.
  - The Dispatch ceiling is removed: `DISPATCH_CEILING`, the `sprint-lifecycle.md` paragraph, and the `asd-phase-impl.md` sub-wave clause, so every Task of an impl wave dispatches concurrently. "Correlated interruption" is judged over every dispatch in flight in the iteration.
  - "Wave" then means only plan Task waves (`sprint-lifecycle.md` "Wave declaration") and review waves (defined once, in "Review iteration counters").
- **D8 — Scope hand-off home (AC-8).** A new `review-policy.md` "Scope hand-off" section is the sole home for both review phases and every reviewer, External Review included. It replaces the scope bullet of "Clean-context review iteration" and the scope half of `external-review.md` "Phase-scoped payload".
  - **(1) List.** The per-agent file list (`emit-manifest` output, per wave) is the only normative scope: ledger rows and valid finding locations.
  - **(2) Diff file.** A diff file written by `.asd/runtime.js` for exactly that list is the change content, read on demand.
  - **(3) Whole files.** Whole files are context only.
  - The agent never runs git to derive, widen or narrow scope. Workflows, agents, external prompts and README link to this section.
- **D9 — Runtime for AC-8.**
  - (a) `emit-manifest --reviewer external` writes `external.scope.json` (per `t_review-scope.json`) plus `external.diff`, with no rubric and no ledger.
  - (b) `t_review-scope.json` keeps `phase`, `iteration` and `files[]`, and gains `wave` (impl-review) and `diff` (path). It drops `base_ref`, `head_ref` and `exclude_paths`, which the explicit list makes redundant. This is a breaking template change: `feat!`, with a CHANGELOG migration note for custom external prompts.
  - (c) A new `--full-files <path> --full-base <sha>` pair diffs the listed files over the wider range. It serves D6 wave iteration 1 and External Review's carried-over `Unreviewed files` (diffed over `<base_branch>...HEAD`).
  - (d) Testing's `--test-plan` paths are included in its `.diff`.
  - (e) Design-review: `draft-snapshot` also copies draft content into the iteration dir. From iteration 2, `emit-manifest --phase design-review --snapshot <prev iter dir>` writes a `--no-index` diff against it. Iteration 1 has no diff, because the drafts are wholly new and a diff would duplicate them.
- **D10 — Readers (AC-6).** The session-start hook reads both shapes, shows `wave K/n, iter N`, and never throws. `asd-sprint` resume shows the wave and its counter. `pr` DoD requires `wave == n` with every wave's highest iteration satisfied. Retro, the friction-log/test-plan templates and `asd-dev` cite the id form. `checkpoints.md` "Criterion cost surfacing" counts `wave-*/iter-NN/` dirs plus legacy ones.

Change surface: 35 files

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.
Sprint-specific additions:
- `node .asd/sync.js --check` reports no drift.
- `.asd/release-manifest.json` `upstream_hashes` match every touched managed file.
- Grepping live canon for "wave" finds only the plan Task-wave and review-wave meanings.

### Task 1: Runtime — review-waves command and scope hand-off emission
Material risk: change: new runtime commands and a changed emit-manifest contract (D1, D2, D9)
Reachability: impl-review writes `waves.json` at first entry via `review-waves`; impl-review reads it at every wave's iteration 1 to build the division list for `emit-manifest --full-files`.
- [x] Add `WAVE_THRESHOLD_LINES = 3000` with a JSDoc line. Remove `DISPATCH_CEILING` and its export (D7).
- [x] Remove parts (D7): `SPLIT_THRESHOLD_FILES`, `--halve`, part naming in `emitCoverageManifests`/`emitManifestCommand`, `NA_PREDICATES.outOfPart`. `surfaceCheck` loses `dispatches`/`--test-plan-files`, and the `SURFACE_CAP_FILES` JSDoc loses the parts rationale.
- [x] Add a `review-waves` command: `--files --base --head` measures numstat lines (binary and pure-rename 0) and returns `{lines, threshold, waves}`. With `--division <json> --out <path>`, it validates exactly `n` non-empty disjoint lists covering the scope, then writes `waves.json` (D1, D2).
- [x] `emit-manifest --reviewer external`: write `external.scope.json` per `t_review-scope.json` plus `external.diff` for its list, with no rubric read and no ledger (D9a, D9b).
- [x] Add the `--full-files <path> --full-base <sha>` pair: listed files join the manifest list, and their patch hunks are taken over `<full-base>...<head>` in the same `.diff` (D9c).
- [x] Include Testing's `--test-plan` paths in its `.diff` over the manifest range (D9d).
- [x] `draft-snapshot` also copies draft content under the iteration dir. `emit-manifest --phase design-review --snapshot <prev iter dir>` writes a `--no-index` diff per manifest. `--base/--head` stay impl-review-only (D9e).
- [x] Export the new constant and functions beside the existing ones.

### Task 2: Session-start hook reads per-wave state
Material risk: artifact: hook must exit 0 and never throw on either state shape (D3, D10)
- [x] `reviewNodeForPhase`/`lastReviewVerdict` read `reviews.impl.waves[wave-1]` with the legacy flat-node fallback, and pick the highest `iter-NN` numerically.
- [x] The summary shows `wave K/n, iter N` when `waves.length > 1`, otherwise the unchanged single-wave text.

### Task 3: Rules — review waves, state shape, iteration id
Material risk: change: workflow-gate and state-schema contract across rule docs (AC-1..AC-6, D1-D7, D10)
- [x] `sprint-lifecycle.md` "Review iteration counters":
  - define the review wave once (D1, D2, D7) and the impl-review iteration id (D4);
  - per-wave counter lifecycle and sequencing (D5);
  - per-iteration scope (D6);
  - rollback reset clearing `reviews.impl` and the division (D3);
  - legacy-shape fallback (D3).
- [x] `sprint-lifecycle.md` other sections:
  - "Dispatch ceiling" paragraph removed (D7);
  - "APPROVE latch" per wave, with closed waves never re-dispatched (D6); availability-skip carve-out without the partial form (D7);
  - phase table impl-review row;
  - "Impacted test set" terminal suite after the last wave;
  - "State recovery" per-wave reads, the partial token kept only as a legacy satisfied value (D7), fixing the stale pointers audit found at :64, :354, :357;
  - "PR phase" reviews-green over all waves (D10);
  - "Plan file format" Change surface declaration: the cap-override request no longer states a `dispatches` count (D7).
- [x] `review-policy.md`:
  - "Iteration severity floor": `N` = the current wave's counter, with the cap per wave;
  - "Interrupted dispatch and split dispatch" becomes "Interrupted dispatch". Split trigger, Partition, Union property, One-fresh-dispatch-per-part and Part merge are removed; two consecutive interruptions escalate (D7). The internal-reviewer never-skipped/never-partial sentence stays;
  - "Late duplicate return": the closed-wave branch (D6);
  - interrupted/correlated literals in id form (D4);
  - "Coverage ledger": no part stamping or out-of-part text (D7);
  - "DoD per review phase": impl-review DoD = every wave's roster met plus the terminal suite; "Gate Verdict Format" and the DoD table drop the partial form (D7).
- [x] `checkpoints.md`: "Criterion cost surfacing" counts wave dirs plus legacy ones, with the fix-round tail in id form; the review-cap override is per wave (D4, D10).
- [x] `artifact-layout.md`: `reviews/impl/wave-<K>/iter-NN/…` and `reviews/impl/waves.json` in the path map, plus the legacy read, with the `.part-N` entries removed; the test-plan note in id form (D2, D4, D7).
- [x] `git-strategy.md`: the `ASD-Task: impl-review <id> suite` trailer (D4); finding-id prefix example without `.part-N` (D7).
- [x] `core.md` glossary: extend "Iteration" with "Review wave" in one line, pointing to `sprint-lifecycle.md`.
- [x] `t_state.json`: seed `reviews.impl` as `{ "wave": 1, "waves": [ { "iteration": 0, "verdicts": {}, "iteration_heads": {}, "latched": {} } ] }` (D3).

### Task 4: Scope hand-off — single home and External Review alignment
Material risk: change: public External Review scope-manifest contract and the reviewer payload contract (AC-8, D8, D9)
- [x] `review-policy.md`: a new "Scope hand-off" section as the sole home (D8). Trim "Clean-context review iteration" to a link, and point the "Coverage ledger" `.diff` sentence and the "Reviewer responsibility" External row at it.
- [x] `external-review.md`:
  - "Phase-scoped payload" keeps only the External-specific manifest fields and the diff-file hand-off (D9a, D9b), linking to "Scope hand-off", with no self-computed diff;
  - "Iteration semantics": carried-over `Unreviewed files` via `--full-files` (D9c), plus wave-scoped carry-over and stalemate lookups in id form (D4);
  - "Batching" section removed; "Outcome contract" without partial or stopped-batch branches; "Unreviewed files" from skip only (D7).
- [x] `external-review/t_review-scope.json`, `t_prompt-external-impl.md`, `t_prompt-external-design.md`: the new fields. The prompts name the diff file as readable context despite its `.asd/sprints/**` location, and no longer grant `git diff`.
- [x] Agents `asd-external-review.md` (no "resolve files/commits yourself"; scope = list + diff; one invocation, no batches, no partial outcome) and the four `asd-reviewer-*.md` Inputs lines: link to "Scope hand-off" instead of restating it, and mention the design-review `.diff` from iteration 2.
- [x] Regenerate the provider views for every edited agent with `node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply <view paths>`.

### Task 5: Workflows and sprint skill
Material risk: change: phase orchestration for impl-review wave sequencing and design-review diff hand-off (AC-1..AC-4, AC-6, AC-8)
Reachability: impl-review writes `review_fixes_pending = "wave-<K>/iter-NN"` at step 8; impl review-fix mode reads it to locate findings, and impl-test reads it as its precondition.
- [x] `asd-phase-impl-review.md`:
  - preconditions: cap at "no wave node", plus legacy normalization (D3, D5);
  - new step 1c: `review-waves` measurement and division on first entry;
  - step 1: per-wave scope (D6);
  - step 1b: External list/diff via `emit-manifest --reviewer external` (D9);
  - step 2: per-wave increment;
  - steps 3-4: floor and dir per wave;
  - step 6: emit flags `--full-files` (D6);
  - step 7a: split-dispatch branch removed, twice-interrupted escalation (D7);
  - step 8: routing to the next wave in-entry vs impl review-fix (D5);
  - steps 9-10: per-wave cap;
  - artefacts list;
  - return contract with `WAVE`.
- [x] `asd-phase-design-review.md`: split dispatch/parts removed (D7); `draft-snapshot` content copy plus `--snapshot` diff from iteration 2 (D9e); External via `emit-manifest --reviewer external`; payload links to "Scope hand-off".
- [x] `asd-phase-impl.md`, `asd-phase-impl-test.md`: `review_fixes_pending` and the findings path in id form (D4); impl step 6 without the dispatch-ceiling sub-wave clause (D7).
- [x] `asd-phase-pr.md` step 1: reviews-green over all waves (D10).
- [x] `asd-phase-retro.md`: review evidence paths in id form.
- [x] `asd-phase-plan.md`: the part-count note and the `dispatches` reference removed (D7).
- [x] `.asd/skills/asd-sprint/SKILL.md`: the resume display shows wave K/n and that wave's counter; rollback resets the wave node.
- [x] Templates `t_review.md` (part text removed, D7), `external-review/t_review-report.md` (iteration header carries the wave; partial form removed, D7), `t_friction-log.md`, `t_test-plan.md` (id form).
- [x] `asd-dev.md`: findings path in id form.
- [x] Regenerate the provider views for the edited skill and agent (`sync.js --apply`).

### Task 6: README and release bookkeeping
Material risk: artifact: mirror accuracy and manifest hashes (AC-7)
- [ ] `README.md`:
  - impl-review description, waves and the hand-off triple;
  - External Review row (:219) with no "base/head refs", batches or partial outcome;
  - no Dispatch ceiling mention;
  - latch per wave (:225);
  - runtime.js entry (:297) with `review-waves`, external emission, `--full-files`, `--snapshot`, with no parts and no `dispatches`;
  - the floor note (:420) per wave;
  - folder map `wave-<K>/`.
- [ ] Recompute `.asd/release-manifest.json` `upstream_hashes` for every touched managed file. Check whether `managed_paths` or `canon_hashes` need an entry; no new agent or skill is added.
- [ ] Run `node .asd/sync.js --check`: no drift.

## Risks
- **Scope size:** the change surface is 35 files. Parts no longer exist once this sprint lands, and the sprint's own impl-review runs under the new canon (next item), so `WAVE_THRESHOLD_LINES` governs its size.
- **Oversized wave:** without parts or External batches, a wave far above the threshold (3 waves cap it) goes to each reviewer and the wrapped CLI unsplit. Two consecutive interruptions escalate to the user instead of re-splitting.
- **Unbounded concurrency:** with no dispatch ceiling, an impl wave with many Tasks dispatches all of them at once. The plan author keeps waves reasonably sized.
- **Self-hosting bootstrap:** this sprint's own impl-review runs under the canon it rewrites, from a pre-wave `state.json`. D3's legacy fallback must be exact, and the impl-test suite covers the legacy shape before impl-review entry.
- **Test churn:** `tests/run.js` pins many of these contracts (audit "Risks" list). Impl-test updates them after the code exists.
- **Review cost:** each wave carries its own floor and cap. D1's line threshold keeps waves rare; D5's per-wave cap adds cap requests surfacing per-wave counts.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | 1, 2 |
| 2 | 3 |
| 3 | 4 |
| 4 | 5 |
| 5 | 6 |

- Task 3 depends on Task 1 (the rules cite runtime command and constant names).
- Task 4 depends on Task 3 (`review-policy.md` is edited by both; "Scope hand-off" builds on the per-wave text).
- Task 5 depends on Tasks 3 and 4 (the workflows bind the rule text).
- Task 6 depends on all (the README mirrors the final canon; hashes last).

## Out of scope
- Automated `.asd/migrations/*.js` rewriting of in-flight `state.json` (D3 reader fallback instead).
- Changing the `SURFACE_CAP_FILES` value.
