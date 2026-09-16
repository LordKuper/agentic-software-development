---
responsibility:
  owns: brownfield findings for sprint scope (existing docs, code, gaps incl. dependencies/migration, risks)
  excludes: requirements, decisions, plan, code
  delegates_to: prd.html (requirements), adr.html (decisions), plan.md (tasks)
---

# Audit

## Scope reference
[sprint.md](./sprint.md)

## Touched areas
- `.asd/rules/external-review.md`, sections "Detection and negative cache" (33-38), "Outcome contract" (40-49), "Stalemate detection" (97-101) and "Aggregation" (105): AC-1.
- `.asd/agents/asd-external-review.md`: stop conditions (29), preflight skip (81), one retry (103), "two permitted outcomes" (105) and ABORT scope (116): AC-1.
- `.asd/templates/external-review/t_review-report.md` and `t_prompt-external-{design,impl}.md`: no reviewed-files count (AC-1).
- `.asd/workflows/asd-phase-impl-review.md`: steps 1a/1b (23-24), 7a (43-46) and 8 (47) for AC-1. Step 1 diff (22) and Preconditions (5-10) are where the AC-5 entry check goes.
- `.asd/workflows/asd-phase-design-review.md`: steps 3a (23), 8a (38) and 9 (41) for AC-1. Step 3 (22) does not read `self_hosting` (AC-4).
- `.asd/rules/review-policy.md`:
  - AC-1: payload (33), Interrupted (146), Correlated (148), skip exclusivity (152), DoD (166-171).
  - AC-4: Coverage ledger (101), Split trigger (154), Partition (156), Union (158).
- `.asd/rules/sprint-lifecycle.md`:
  - AC-1: APPROVE-latch skip carve-out (68); State recovery verdict values (342-348).
  - AC-7: Impacted test set (91, 93); Impl-test re-entry, defect and stalemate (232, 239, 243).
  - AC-5: pr DoD (290-291); Plan file format (316-330).
  - AC-2: State recovery (336-340) is its home.
- `.asd/workflows/asd-phase-impl.md`: fix chain (60), routing (61), test-fix payload (66), dev `Status`/`Fix commit` edit (77), finalize literals (113-115): AC-2, AC-7.
- `.asd/workflows/asd-phase-impl-test.md`: on-disk recovery (15), Entry log (30), re-entry delta (34), amend (42), step 9 (51-55), green (57), Re-entry (63), Agents (74): AC-2, AC-3, AC-7.
- AC-5: `.asd/workflows/asd-phase-plan.md:40` makes an advisory file estimate against `SPLIT_THRESHOLD_FILES`. `.asd/templates/t_plan.md` has no surface line.
- `.asd/workflows/asd-phase-retro.md:10` and `asd-phase-pr.md:9`: AC-7, AC-1.
- `.asd/runtime.js`:
  - AC-5: `SPLIT_THRESHOLD_FILES` (21).
  - AC-4: `NA_PREDICATES` (23-30), `NA_TARGETS` (32-37), `rubricIds` (287-296), `standingPredicates` (310-327), `naFor` (338-340), `emitManifestCommand` (392-409), CLI flags (432).
  - AC-3/AC-7: `defectStalemate` (370-390), CLI `--plan` (459-462).
- `.asd/agents/asd-reviewer-documentation.md` rubric (59-68): AC-4 targets.
- `.asd/rules/artifact-layout.md`: path map (26-45), single-artifact clause (69), Test plan (179-185), Documentation economy (199-205), Decisions log (233-235): AC-6, AC-7.
- `.asd/rules/checkpoints.md`:
  - AC-6: `gate_decisions` prose (5, 22).
  - AC-5: hard list "review-cap override" (7), Gate inventory (37-50).
  - AC-7: criterion cost (24-35).
- `.asd/templates/t_state.json`, `t_decisions-log.md`, `t_test-plan.md`: AC-6, AC-7, AC-3.
- `.asd/hooks/session-start.js:121,131-132` reads `state.json` verdicts and treats an `APPROVE` prefix as satisfied. This is display only for AC-1.
- `tests/run.js`:
  - AC-1: 2087, 3697-3720.
  - AC-7: 2859, 3750, 3768-3790, 4315-4321.
  - AC-4: ~4117-4180, 4265-4282.
  - AC-5: 3010.
  - AC-3: §21, 4517-4625.
- `.asd/migrations/`, `.asd/release-manifest.json` (`asd_version` 9.0.0, `canon_hashes`) and `CHANGELOG.md`: AC-8.
- `README.md` lines 171, 223-225, 297, 313 and 423: AC-9.

## Existing docs found
There is no `docs/` tree (self-hosting). Canon is `.asd/rules/**`.
- [external-review.md](../../rules/external-review.md) "Outcome contract": exactly two outcomes. Any inability to complete after invocation returns the availability skip.
- [review-policy.md](../../rules/review-policy.md) "Union property": check (c) fails when an id is out-of-part `n/a` in every part. A standing-predicate `n/a` never blocks.
- [sprint-lifecycle.md](../../rules/sprint-lifecycle.md):
  - "APPROVE latch": only a bare `"APPROVE"` latches.
  - "State recovery": enumerates four verdict values.
  - "Impl-test phase": defines stalemate identity.
- [artifact-layout.md](../../rules/artifact-layout.md) "Decisions log" and "Test plan": one per-sprint file each, append-only for the decisions log and amended for the test plan.
- [checkpoints.md](../../rules/checkpoints.md) "Criterion cost surfacing": counts `for iter-NN: findings resolved` entries in `decisions-log.md`.
- [core.md](../../rules/core.md) Context hygiene 1-4: a decision goes to the decisions log, state to `state.json`.
- [git-strategy.md](../../rules/git-strategy.md) "Commit before review": agents commit only their own paths, and the orchestrator commits bookkeeping.
- [asd-sprint SKILL.md](../../skills/asd-sprint/SKILL.md) Step 2B: resume is state-driven, with no agent-failure reconstruction.
- [CHANGELOG.md](../../../CHANGELOG.md) v9.0.0: an active sprint keeps working from its frozen `state.json`. Migration 6.0.0 is the only precedent for rewriting active state; 4.0.0 only warns.
- Consumer evidence (data only): Glings `002-world-map-generation`, at `phase=impl-test`, `asd_version` 9.0.0.
  - `state.json` is 1.5 MB, with invented keys (`phase_note` 272 KB, `open_obligations` 912 KB, `plan`, `reviews.impl.waves`, …).
  - `decisions-log.md` is 1.1 MB.
  - `test-plan.md` is 10 962 lines, with 7 exact and 27 suffixed `## Defects` headings.

## Contradictions
- `sprint-lifecycle.md:68,344`, `asd-phase-impl-review.md:47` and `asd-phase-design-review.md:41` write the skip only on a non-ready preflight or an active negative cache. `external-review.md:47` and `asd-external-review.md:105,116` also return the skip after invocation on a crash, hang, timeout, unusable output or exhausted retry. winner=unsettled → user: `sprint-lifecycle.md` (narrow skip). A failure after invocation is an interrupted dispatch, re-dispatched per `review-policy.md` "Interrupted dispatch", never a skip. A quota/auth failure still records the negative cache, so the re-dispatch preflight then yields the skip. `external-review.md:47` and `asd-external-review.md:105,116` must be narrowed in this sprint (AC-1).

## Existing implementation found
- AC-1:
  - The skip string, the no-latch rule, and the decisions-log and F-N duties exist (`external-review.md:35-38`).
  - The latch requires a bare `"APPROVE"` (`sprint-lifecycle.md:68`), so a partial string never latches, by construction.
  - The hook treats an `APPROVE` prefix as satisfied (`session-start.js:132`).
- AC-2:
  - On-disk anchors: `reviews.impl.iteration_heads`; test-plan Entry log `HEAD analysed` (an empty last row marks an interrupted entry); `Suite run` HEAD; Defects `Fix commit`; plan checkboxes; `task_routing`; `review_fixes_pending`/`test_defects_pending`; routing log lines.
  - impl-test already recovers "from on-disk evidence only after session loss" (`asd-phase-impl-test.md:15,74`).
- AC-3: `defectStalemate` fails closed on a missing section, a missing column or a malformed row, and normalises CRLF. Tests: 4565, 4600, 4608.
- AC-4:
  - The standing-predicate mechanism, prefix targeting and a fail-closed missing rubric entry exist (`runtime.js:312`).
  - `noHtml` is a precedent.
  - `Framework mode` is already `outside phase gate` in design-review.
- AC-5: plan estimates the iteration-1 file count against `SPLIT_THRESHOLD_FILES` (`asd-phase-plan.md:40`), advisory only.
- AC-6: `t_state.json` defines no prose key. Only `gate_decisions[].reason/evidence` carry prose, and no workflow instructs other prose into state.

## Gaps
- AC-1:
  - (a) The two-outcome literal is in `external-review.md:42`, `asd-external-review.md:105` and test 3715.
  - (b) The wrapper cannot know n/m. It makes one invocation over all `files[]`, reads stdout at exit, and no prompt or report has a reviewed-files line. n/m becomes knowable only with sequential batching or a reviewed-files report line. Batching is a new mechanism (Complication Approval), with batch size = `SPLIT_THRESHOLD_FILES`.
  - (c) State recovery needs a fifth value: satisfied, never latched. The pr DoD and verdict-parse steps must accept it.
  - (d) The skip exclusivity in `review-policy.md:152` needs the partial form.
  - (e) The partial suffix must never attach to CONCERNS or FAIL.
  - (f) External stalemate detection must exclude partial and skip iterations.
  - (g) Hook test 2087 covers only the skip.
- AC-2:
  - Initial mode records no chain start commit. It can be derived from `git merge-base` or the plan-accept commit.
  - No mapping from commit to Task exists.
  - No rule covers a killed agent's uncommitted leftovers, and agents may not stage the whole tree.
  - The rule has no single home and no binding in `asd-phase-impl.md`.
- AC-3:
  - The parser splits on the first exact `## Defects` only; suffixed headings are invisible.
  - Line numbers are discarded, and the separator row is not validated.
  - No tests cover multiple or suffixed sections or line numbers.
- AC-4:
  - Rubric ids: `Template adherence` and ``Framework mode (`self_hosting: enabled`, impl-review only)``.
  - `emit-manifest` has no config input. Impl-review step 1 and design-review step 3 would pass a self-hosting flag.
  - A templated artefact is derivable from the path list: its basename matches a `.asd/templates/**/t_<name>`; or its path is under `.asd/templates/`, `docs/` or `.asd/sprints/`; or it is `AGENTS.md`/`CLAUDE.md`.
  - The new predicate text must be quoted exactly in canon.
- AC-5:
  - Missing: a constant, a plan declaration line, a gate row, an impl-review entry check.
  - "review-cap override" already names the iteration cap, so the surface cap needs a distinct name in the hard list.
  - A deferred remainder has no persistent home: either sprint.md "Out of scope" plus the decisions log only, or Complication Approval.
- AC-5 evidence:
  - Reviewable files per merged ASD sprint 001-013: 55, 87, 41, 76, 20, 80, 40, 36, 35, 71, 21, 52, 54 (median 42, max 87; 2-6 iterations).
  - Glings: 657 files, 64 iterations.
  - Proposed cap: 100 (= 4 × `SPLIT_THRESHOLD_FILES`), counted as impl-review iteration 1's `git diff --name-only <base>...HEAD <pathspec>`.
- AC-6: `artifact-layout.md` has no machine-only statement for `state.json`. The `gate_decisions` prose must be cut to short refs or moved to the log.
- AC-7: every reader listed under Risks is unaware of rotation. `artifact-layout.md:69,181,235`, `t_decisions-log.md`, `t_test-plan.md` and README line 313 assume single files.
- Migration gaps:
  - Multiple Defects sections: a silent read of the first section becomes a fail-closed error. Glings breaks at its next routing, and its tables cannot be consolidated automatically. Needs a CHANGELOG manual step or a warn-only migration.
  - Surface cap: grandfather plans that have no declaration line (wave-table fallback precedent), plus a CHANGELOG note.
  - Rotation: absent segments are read as legacy, so no migration is needed.
  - AC-6 as a rule only: no migration. Enforcing it would lose Glings data, so warn only.

## Risks
- AC-7 readers to update: impact=high, mitigation=one rotation statement in `artifact-layout.md`; readers read the live file first and segments in order when crossing. Hooks read neither file. Readers:
  - decisions-log:
    - rules: `checkpoints.md:5,31`, `review-policy.md:33,146,148`, `sprint-lifecycle.md:7`, `core.md:73,83`;
    - workflows: `asd-phase-impl-review.md:40`, `asd-phase-design-review.md:34`, `asd-phase-impl-test.md:52`, `asd-phase-impl.md:66`, `asd-phase-retro.md:10`;
    - tests: 2859, 3750, 3768-3790.
  - test-plan:
    - runtime: `runtime.js:370-390,459-462`;
    - workflows: `asd-phase-impl-test.md:30,34,42,51-57,63`, `asd-phase-impl.md:9,12,52,56,77`, `asd-phase-impl-review.md:10,37,40,59,81`, `asd-phase-pr.md:9`;
    - rules: `sprint-lifecycle.md:24,91,93,232,239,243,290`, `git-strategy.md:49`, `code-style.md:118`;
    - agents: `asd-tester.md:47,64,69`, `asd-dev.md:38,65`, `asd-reviewer-testing.md:23,33,55,59`;
    - tests: 4315-4321, 4517-4625.
- Per-phase rotation stays unbounded for looping phases (64 impl-review iterations): impact=high, mitigation=reject.
- Per-entry test-plan rotation causes three problems: impact=medium.
  - It mutates frozen segments, because devs edit `Status`/`Fix commit`.
  - It splits the stalemate input.
  - The Testing reviewer reads every segment anyway.
  - Mitigation:
    - test-plan: rotate only the narrative sections (Risk→check, Removed, Added), per Entry log number, into `test-plan.entry-NN.md`. The live `test-plan.md` keeps the Entry log, Suite run and all Defects.
    - decisions-log: rotate by rename at phase entry into `decisions-log.NNN.md`, which keeps it append-only.
    - Current-fact readers read the live file; cross-span readers glob segments.
- AC-1 coverage hole: files left unreviewed in a partial or skip iteration never re-enter the next external manifest unless they change: impact=medium, mitigation=carry the unreviewed `files[]` forward, or state the hole.
- AC-1 cost: batching multiplies quota use: impact=medium, mitigation=sequential batches; stop at the first quota failure and return partial.
- AC-2 misattribution when bookkeeping commits interleave: impact=medium, mitigation=a pathspec excluding `.asd/sprints/**`. Uncommitted leftovers are decided (committed after build/lint, or handed to the re-dispatch), never swept.
- AC-3: suffixed headings stay invisible if only exact headings count: impact=medium, mitigation=count every `^## Defects\b`.
- AC-4: a false negative in templated-artefact detection hides review: impact=medium, mitigation=a conservative classifier derived from `.asd/templates/`.
- AC-4 residual: other doc ids (e.g. `Persistent actuality`) can still fail union check (c) on a code-only scope: impact=low, mitigation=out of scope, note at plan.
- AC-5: a breach found at impl-review, after the work landed, is late: impact=medium, mitigation=the plan gate is primary. The entry check escalates with override-or-abort, and an accepted override records the approved bound.
- AC-5: the estimate undercounts sync and test files: impact=low, mitigation=the measured diff binds.
- AC-6: a validator rejecting unknown keys breaks active consumer sprints (Glings; legacy `skip_design_phases`, `escalations`): impact=high if enforced, mitigation=rule only, plus a CHANGELOG note.
- Documentation economy: rules restated at workflow sites: impact=medium, mitigation=one home per rule, pointer-only bindings.
- README drift (`README.md:297` already omits `defect-stalemate`): impact=low, mitigation=update in the same change.
