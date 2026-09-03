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
-->

## Overview

Covers AC-1..AC-15 of [sprint.md](sprint.md), decomposed along the twelve fact-owner rows of
[audit.md](audit.md)'s change map. Every task edits the SSoT of its fact **and every mirror of that
fact in the same task**, so no task ends with the repo half-renamed or with two statements of one
rule.

Self-hosting: implementation means editing `.asd/` canon plus `README.md`, `AGENTS.md` and
`tests/run.js`, then running `node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply <file...>`.
Generated views (`.claude/`, `.codex/`, `.agents/skills/`) are never hand-edited — they are outputs.

Owner for every task: **backend-dev**. This sprint is Markdown/JSON/Node infrastructure with no UI
surface. Owner vocabulary is the current one; `asd-dev` does not exist until Task 3 creates it.

Stub inclusion: `audit.md` has no "Related open stubs" section, which per `t_audit.md` means an empty
finding set — no stub decisions, no stub tasks.

Three roster tests in `tests/run.js` and the new migration-runner tests are **not** planned as tasks:
test selection and authoring belong to `impl-test`. Each task below states only the material risk it
carries, as input for that phase.

## Definition of Done

Standing DoD applies, never restated here (`sprint-lifecycle.md` "Plan file format").

Sprint-specific additions:

- `node tests/run.js` green, including the roster tests updated for the new agent set and the new
  migration-runner coverage (authored in `impl-test`, not here).
- `node .asd/sync.js --check` clean, with no orphaned generated view of any retired agent left in
  `.claude/`, `.codex/` or `.agents/skills/`.
- A repo-wide grep returns zero references to the nine retired agent names (`asd-reviewer-quality`,
  `asd-reviewer-implementation`, `asd-reviewer-ui`, `asd-reviewer-simplification`,
  `asd-reviewer-performance`, `asd-backend-dev`, `asd-frontend-dev`, `asd-test-engineer`,
  `asd-ux-designer`), excluding `.asd/project/decisions-log.md` and `.asd/sprints/archived/**`, which
  name them as facts-of-record.
- No fact stated twice: each rule below lives in the SSoT named by `audit.md`'s change map; every
  other mention is a cross-link.

### Task 1: Author the two merged reviewer agents, retire the five

Satisfies AC-7 (agent side). Fact owner: `.asd/agents/*.md`.

- [x] Author `.asd/agents/asd-reviewer-correctness.md` carrying every rubric item of
      `asd-reviewer-quality`, `-implementation` and `-ui` as explicitly named rubric sections
      (bugs/security/best-practice/contract drift; AC-N coverage trace; UI-vs-ux-spec conformance,
      design-system tokens, accessibility baseline)
- [x] Author `.asd/agents/asd-reviewer-efficiency.md` carrying every rubric item of
      `asd-reviewer-simplification` and `-performance` (over-engineering checklist,
      structure/cohesion smells, design-principles adherence; perf budgets, algorithmic complexity,
      perf anti-patterns, regression detection)
- [x] Give each merged agent a per-phase allowed-section gate: which rubric sections apply in
      design-review versus impl-review, so impl-only rubrics never fire against drafts
- [x] Require a rubric-section coverage ledger in both agents — one row per rubric section, incl.
      `n/a: <predicate>` rows — so a dropped section is a blank row the existing step-7 ledger gate
      already rejects
- [x] Re-aim the self-hosting carve-out inherited from `asd-reviewer-ui.md` at the rubric-section
      predicate instead of the step-5 agent predicate
- [x] Point both agents at `review-policy.md`'s change-surface rule (Task 2) rather than restating it
- [x] Frontmatter: opus/high + sol/high, read-only tool set and `sandbox_mode: read-only`, matching
      the surviving reviewers
- [x] Delete the five superseded agent files
- [x] Update the `description` delegation lists of every remaining agent that named a retired
      reviewer — all surviving reviewers cross-name each other

Material risk: a rubric item silently lost in the merge; coverage regression invisible to a
file-level ledger gate.

### Task 2: Move the reviewer-roster mirrors — policy, layout, templates, workflows

Satisfies AC-7 (mirrors), AC-3. Fact owners: `review-policy.md`, `artifact-layout.md`,
`asd-phase-impl-review.md` step 5.

- [x] `review-policy.md` DoD table: impl-review internal = correctness + efficiency + documentation +
      testing; design-review internal = correctness (UI section, conditional on a ux-spec /
      design-system draft) + efficiency + documentation; External Review unchanged
- [x] `review-policy.md` verdict grammar: `<reviewer>` enum becomes
      `correctness | efficiency | testing | documentation | external`; update every example
- [x] Re-attribute the over-engineering and structure/cohesion checklists from "Simplification
      reviewer" to the efficiency reviewer, keeping their "critical, undroppable" status
- [x] Add the change-surface rule to `review-policy.md` (AC-3): review covers the iteration's diff
      only; a finding about unchanged code is invalid unless the change made it incorrect
- [x] `artifact-layout.md`: review-file names `correctness.md` / `efficiency.md`, verdict placeholder
      namespace, and the test-plan note citing `reviews/impl/iter-NN/testing.md` (already generic
      placeholders — verified, no edit needed)
- [x] `t_review.md` and `t_state.json`: reviewer keys and verdict placeholders follow the rename
      (already generic `{{REVIEWER}}` placeholder / dynamic `verdicts` map — verified, no edit needed)
- [x] `asd-phase-impl-review.md`: steps 5-6 dispatch list; convert both diff-derived predicates from
      agent skip to rubric-section skip — the predicate is still evaluated in the workflow, the
      `n/a` verdict is passed into the payload so the agent never loads that domain's inputs; step 8
      parse/aggregate against the new keys
- [x] `asd-phase-design-review.md`: step 7 dispatch list and step 9 verdict recording; payload
      carries the explicit allowed-section list
- [x] `sprint-lifecycle.md` "State recovery": restate `"skipped: <predicate>"` semantics as
      section-level, and `review.scoped_fan_out` accordingly (incl. `t_config.yaml`)
- [x] Affected `asd-phase-*` SKILL descriptions naming reviewers

Material risk: verdict tokens, state keys and file names drifting apart, so aggregation silently
treats a required reviewer as absent (blocking) or a stale key as satisfied.

### Task 3: Merge the dev agents into `asd-dev`

Satisfies AC-10. Fact owners: `.asd/agents/`, `asd-phase-impl.md`.

- [x] Author `.asd/agents/asd-dev.md` as the union of both devs: server/CLI/library plus UI work,
      inputs merged (`stack.html`, folded ADR targets, ux docs, DESIGN.md, design-system.html,
      accessibility.html), the frontend self-hosting no-baseline carve-out and its `code-style.md` §6
      token exception for `t_html-shell.html` preserved verbatim
- [x] Keep authority unchanged: production code only, never tests. No new UI clause — the inherited
      conditional DESIGN.md-token wording stands (decisions-log, 2026-09-03)
- [ ] Frontmatter sonnet/high + terra/high (AC-6), workspace-write sandbox as today — family +
      sandbox carried over this task; effort raise to `high` deferred to Task 5 per orchestrator
      instruction (avoid pre-applying a parallel task's change)
- [x] Delete `asd-backend-dev.md` and `asd-frontend-dev.md`
- [x] `asd-phase-impl.md`: collapse the owner vocabulary — step 3's `owner (backend-dev / frontend-dev)`
      parse and step 6's owner→agent map, in initial, review-fix and test-fix modes alike
- [x] Update every `description` delegation list that named either dev
- [x] `sprint-lifecycle.md` phase table owner column (`impl | Backend Dev + Frontend Dev`) — left to
      Task 4's sweep of that same file (parallel-task collision avoidance, per orchestrator
      instruction); `core.md` glossary creator list, `code-style.md` §3 audience, `artifact-layout.md`
      refuse-to-implement rule — done

Material risk: `asd-phase-impl.md` parses owner tokens literally out of `plan.md`; a missed token
form silently routes a task to no agent. `t_plan.md` and `asd-phase-plan.md` carry no dev names —
verify, do not assume an edit is needed.

### Task 4: Rename `asd-test-engineer` → `asd-tester`, `asd-ux-designer` → `asd-ux`

Satisfies AC-11. Pure renames — no scope, rubric or authority change.

- [x] Rename both agent files; content edits limited to the identifier
- [x] Workflows: every `asd-phase-*` dispatch list, plus the impl review-fix rule routing findings in
      test files to the test agent
- [x] Rules: `sprint-lifecycle.md` (phase table, owners), `review-policy.md`, `artifact-layout.md`
      ("Owner: Test Engineer" for test-plan), `code-style.md` §3, `design-system.md`,
      `ux-principles.md`, `providers.md`
- [x] Other agents' `description` delegation lists, including `asd-reviewer-documentation`'s
      reference to the ux agent
- [x] Skill descriptions and bodies; templates incl. `t_commands.yaml`'s header and
      `t_custom-coding-rules.md` / `t_custom-design-rules.md`; verify no `{{agent:<name>}}`
      placeholder resolves to a retired name after the merge
- [x] This repo's consumer-side copies: `.asd/project/custom-coding-rules.md`,
      `.asd/project/custom-design-rules.md`
- [x] Leave `.asd/project/decisions-log.md` and `.asd/sprints/archived/**` untouched — facts-of-record

Material risk: 37 canonical files carry at least one retired name; a partial pass leaves a dangling
identifier that no build step catches, only the AC-15 grep.

### Task 5: Apply the model/effort tier changes

Satisfies AC-6.

- [x] `asd-dev` and `asd-tester`: effort `high` on both providers, family unchanged (sonnet / terra)
- [x] `asd-pm`: fable + high (claude), sol + high (codex)
- [x] `asd-advisor`: fable + high (claude), sol + high (codex)
- [x] `providers.md` agent tier matrix — a second tier mirror not named in AC-14, per `audit.md` row 8
- [x] README model-tier table, BOTH provider columns

Material risk: `providers.md` and README drift from frontmatter; only a human reading three files
catches it.

### Task 6: APPROVE latch

Satisfies AC-2. Net-new state plus net-new dispatch logic — no latch storage or filter exists today.

- [ ] Add the latch to the `reviews.<phase>` shape in `t_state.json`, keyed per phase per reviewer
      key, so the existing rollback reset clears it with `verdicts`
- [ ] Dispatch filter in `asd-phase-impl-review.md` and `asd-phase-design-review.md`: a reviewer that
      returned APPROVE on iteration N is not dispatched on N+1 and later within the same phase
- [ ] Aggregation rule: a latched reviewer counts as satisfied, so DoD can still be met
- [ ] `sprint-lifecycle.md` "State recovery": add the latch value beside `"skipped: …"` in the
      satisfied-vs-blocking enumeration
- [ ] Red-full-suite invalidation (AC-5, Task 7): write the clause explicitly — a red full suite
      clears every latch sprint-wide, not only the failing reviewer's. Do not infer it from `impl`
      sitting earlier in the chain than impl-review's input-producing phase. Note in the rule whether
      the rollback reset also happens to cover the same route
- [ ] `review-policy.md` DoD table gains the latch satisfied clause

Material risk: a reviewer that approved iteration 1 never sees later fix commits, so a fix can
regress its domain silently; the red-suite invalidation is the only backstop.

### Task 7: Two-tier test running

Satisfies AC-5. Fact owner: `sprint-lifecycle.md`.

- [ ] Author the impacted-set definition once in `sprint-lifecycle.md`: diff test files + tests
      exercising a changed unit via reference/import search + tests tagged with a touched AC-N +
      native runner selector when present, and the mandatory shared-infrastructure safety valve
      degrading to the full suite, checked before every scoped run
- [ ] Scope every test run in `impl`, `impl-test` and `impl-review` to the impacted set; every other
      mention cross-links the definition, never restates it (`asd-phase-{impl,impl-test,impl-review}.md`,
      `code-style.md` §17, `review-policy.md`)
- [ ] `asd-phase-impl-test.md`: step 7 gate becomes impacted-only; rewrite the Re-entry paragraph
      asserting the suite "stays full and unconditional on every entry"; keep the pre-strategy
      impacted run that lets risk analysis see post-impl behaviour
- [ ] `asd-phase-impl-review.md`: new terminal step, after every dispatched reviewer returned
      APPROVE and before `NEXT: pr` — dispatch `asd-tester` to run the full suite; record the result
      in `test-plan.md`'s existing `Suite run` incl. `HEAD`. Reviewers stay read-only; the phase
      gains the capability only through that dispatch
- [ ] Red path: test defects → `asd-tester` fixes and re-runs; code defects → `D-N` rows,
      `state.json.test_defects_pending`, exit to `impl` test-fix mode. Never fix code in place inside
      impl-review
- [ ] Green full suite becomes part of impl-review's DoD (`review-policy.md`, `sprint-lifecycle.md`)
- [ ] `asd-phase-impl.md`: completion gate stays build + lint; state explicitly that a dev may run the
      impacted subset for self-verification but never authors, modifies or prunes tests
- [ ] `checkpoints.md` precondition chain and cycle prose; `code-style.md` §19; `git-strategy.md`
      PR self-review checklist line ("full test suite green at `impl-test`")
- [ ] `asd-phase-pr.md`: restate the gate's justification in terms of its own sha-independent diff
      check — "impl-review produces no code/test/stub changes" is now false; the `HEAD` read itself is
      unchanged
- [ ] `t_test-plan.md`, README mermaid edge and phase table, `asd-phase-impl-test` SKILL description

Material risk: moving the suite breaks impl-review's read-only-ness, which the pr gate's
justification and impl-test's precondition text both lean on; under-selection by the search-derived
impacted set defers a real regression to the single end-of-cycle run.

### Task 8: Native affected-test selector in `commands.yaml`

Satisfies AC-5 (config surface).

- [ ] Add the selector field to `t_commands.yaml` and document it as optional; absent → fall back to
      the search-derived impacted set
- [ ] `asd-init` steps 8/8a/12: detect the runner's affected/changed flag where detectable, surface
      it in the consolidated proposal, write it
- [ ] Populate this repo's own `.asd/project/commands.yaml` if its runner supports one

Material risk: detection keyed on runner strings rather than flags; a wrong flag silently narrows
every scoped run.

### Task 9: Test-authoring bar and the hypothetical-risk criterion

Satisfies AC-1, AC-4. `asd-reviewer-testing` stays in the impl-review fan-out, scope unchanged.

- [ ] `asd-tester` agent + `asd-phase-impl-test.md` strategy pass: author a test only for a real,
      material risk on the change surface; do not author when the risk is hypothetical, the behaviour
      is already covered, or the only value is a coverage number
- [ ] Make "no new test needed" a first-class recorded outcome, stated and justified in
      `test-plan.md`, never a silent fallback
- [ ] `code-style.md` §17: the hypothetical-risk bullet, governing pruning (removal candidate) and
      authoring (not written at all)

Material risk: the bar reads as licence to skip tests; it must bind to the change surface and to a
recorded justification, not to the agent's discretion.

### Task 10: Code documentation rules

Satisfies AC-8. Fact owner: `code-style.md` §7.

- [x] Ban comments inside method/function bodies; sole permitted marker stays
      `// TODO(sprint-<NNN-slug>): <reason>`; a body needing narration is renamed, split or rewritten
- [x] Reconcile "Comments explain WHY, not WHAT" — the WHY allowance applies to doc comments only
- [x] Tighten the type-doc bullet (purpose only, never summarising members) and the member-doc bullet
      (purpose, never implementation)
- [x] `asd-reviewer-documentation`: explicit rubric item enforcing all three, and a `description`
      widened to state it also reviews in-code doc comments
- [ ] `review-policy.md` severity taxonomy: a violation is `high` — owned by a parallel task already
      touching `review-policy.md`; this task's rubric item cites the taxonomy without restating it
- [x] `t_custom-coding-rules.md` if it mirrors §7 — verified: neither `t_custom-coding-rules.md` nor
      the project's own `custom-coding-rules.md` restates §7 content, so no edit needed

Material risk: §8 and §17 are cross-link anchors for AC-4 and AC-6 — renumbering or removing bullets
breaks those links.

### Task 11: Context hygiene in `core.md`

Satisfies AC-9.

- [x] Add `## Context hygiene` to `core.md` with the seven rules from AC-9, in core.md's terse
      imperative style
- [x] **Absorb and replace** the existing `## Compaction` section (50% threshold) — it directly
      contradicts rule 7's ~70%/prefer-clear. One threshold survives, not two
- [x] Rule 6 cross-links `review-policy.md`'s clean-context rule; never restates it
- [x] Update `core.md`'s `## See also` / section order if the new section changes it
- [x] Verify the fresh-dispatch lines in `asd-phase-design-review.md` step 7,
      `asd-phase-impl-review.md` step 6 and `external-review.md` still agree with rule 6

Material risk: leaving both thresholds live gives agents two conflicting rules and no tie-breaker.

### Task 12: Orphan detection in `sync.js`

Satisfies AC-14. Today `sync.js` does neither detect nor delete: `buildSyncPlan` is source-driven, so
a deleted canonical agent produces no plan item and both generated views survive silently.

- [x] Implement detect + delete, marker-gated: enumerate the generated trees, compare against canon,
      and treat a generated file with no surviving canonical source as an orphan
- [x] `--check` reports every orphan and exits non-zero
- [x] `--apply` deletes an orphan ONLY when the file carries the ASD ownership marker
- [x] A file in a generated tree without the marker is reported and never touched — it is a
      consumer's own agent or skill, not an orphan
- [x] Document the behaviour where `sync.js` behaviour is described (`providers.md`, `AGENTS.md`,
      README if it states the contract)

Material risk: deletion logic that walks generated trees can remove a consumer's custom
`.claude/agents/*.md`; ownership markers must be verified before any removal.

### Task 13: Migration mechanism

Satisfies AC-12. Sequencing is fixed: migrations run AFTER the managed-path replacement
(decisions-log, 2026-09-03); no `pre`/`post` mode knob is introduced.

- [x] Create `.asd/migrations/` — one zero-dependency Node script per target ASD version, named by
      that version, exporting a function the runner invokes, idempotent (re-run = no-op, never error).
      Contract documented via a header-comment convention (in `update.js`'s own doc comment and
      `SKILL.md`) plus `ctx = { repoRoot }` passed to the exported function; no script exists yet in
      this tree since the sole file this release ships is Task 14's cleanup migration
- [x] Add `.asd/migrations` to `release-manifest.json` `managed_paths`, without which the mechanism
      cannot bootstrap into a consumer at all
- [x] Runner in `update.js`: read the consumer's installed version from
      `release-manifest.json.asd_version` (it already exists and is already read by `planUpdate`),
      build the ordered list of migrations greater than it up to the target, execute ascending
- [x] Load the runner and the scripts from the freshly written tree, the way `loadFreshSync` already
      does for `sync.js` — the scripts arrive in the same apply they sequence against
- [x] Resolve the version-recording conflict: `writeUpdatedManifest` copies the whole new manifest
      atomically, which cannot record a per-migration version. Split the write or give it a
      version-override parameter, so the recorded version is the last successfully applied migration
      and never an unrecorded intermediate
- [x] Failure handling: stop at the first failing migration, report which one failed and what it had
      already done, leave the recorded version at the last success
- [x] Keep the self-hosting guard short-circuiting `/asd-update` before any migration runs — guard is
      unchanged, gates the whole skill invocation before `update.js` (and thus any migration) runs
- [x] `asd-update` SKILL description done (frontmatter + body, incl. migration script contract); README
      `## Updating ASD` + folder map (`migrations/`) and AGENTS.md skills bullet left to Task 15
      (cross-file consistency sweep owns README/AGENTS.md, per orchestrator task boundary)

Material risk: a half-applied migration set combined with an all-or-nothing version write leaves a
consumer at a version that does not describe its files — the one outcome AC-12 forbids.

### Task 14: Cleanup migration for this release

Satisfies AC-13. Consumer projects only — this repo does its own cleanup by editing canon and running
`sync.js --apply` (Task 15), never by running this script (decisions-log, 2026-09-03).

- [ ] Author the migration for the version this sprint produces, satisfying Task 13's contract
- [ ] Delete the generated views of the nine retired agents — five merged reviewers, two merged devs,
      two old names of the renamed agents — across `.claude/agents/*.md`, `.codex/agents/*.toml` and
      any stale `.agents/skills/` entry
- [ ] Delete only from an explicit hardcoded name list; verify the ownership marker before removing;
      treat a missing file as success
- [ ] Remove other ASD files left over from earlier versions that are no longer in `managed_paths`
- [ ] Add the affected-test-selector field to a consumer's `commands.yaml` when absent — additive and
      idempotent
- [ ] Never touch consumer-owned content: `config.yaml` values, sprints, persistent docs, custom
      rules, custom skills/agents/hooks
- [ ] Stale reviewer keys in a consumer's in-flight sprint are TOLERATED — sprints stay out of
      migration scope and no sprint state is rewritten
- [ ] Print a warning when the consumer has an active sprint whose phase is a review phase, telling
      them to finish that review iteration or re-run it

Material risk: this is the only destructive code in the sprint, and it runs outside `managed_paths`
where `update.js`'s own `delete` classification cannot reach.

### Task 15: Consistency sweep and regeneration

Satisfies AC-14, and prepares AC-15's verification.

- [ ] README: agent roster (Creators / Reviewers / Advisor tables), both provider tier columns,
      "Sixteen specialized agents" and every other count string, verdict-token line, fan-out
      paragraph ("all 7 internal reviewers"), mermaid, phase table, folder map (`agents/ # 16`,
      `skills/ # 17`, new `migrations/`)
- [ ] `AGENTS.md`: agent counts (16 → 11, 7 creators → 6, 8 reviewers → 5), reviewer verdict-token
      bullet, release-manifest hard rule, `/asd-update` self-hosting refusal note
- [ ] `release-manifest.json`: `managed_paths` (`.asd/migrations`), `model_families` if touched, and
      `canon_hashes` / `upstream_hashes` ending consistent — one entry per surviving agent file, no
      entry for a deleted one
- [ ] Run `node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply <file...>` for every canonical
      edit, and remove this repo's own orphaned generated views of the nine retired agents
- [ ] Verify no fact acquired a second home: each rule sits in the SSoT named by `audit.md`'s change
      map, every other mention a cross-link
- [ ] Run the AC-15 grep (nine names, excluding `.asd/project/decisions-log.md` and
      `.asd/sprints/archived/**`) and fix what it finds

Material risk: `canon_hashes` is auto-maintained by `--apply` but `managed_paths` is hand-maintained;
a missed hand edit is invisible until a consumer updates.

## Risks

- The suite move (Task 7) and the latch (Task 6) interact: the latch's only backstop is the red-suite
  invalidation, and the suite now runs inside the phase whose verdicts it invalidates.
- The rename/merge waves (Tasks 1-5) touch 37 canonical files; the repo has no compiler to catch a
  dangling identifier — only the AC-15 grep and the roster tests do.
- `tests/run.js` roster tests are expected to be red between Tasks 1-5 and `impl-test`. The `impl`
  gate is build + lint, so this does not block the phase, but it must not be mistaken for a defect.
- In this repo nearly every canonical edit is framework-wide, so Task 7's shared-infrastructure valve
  fires almost always. Verify the degradation path is cheap rather than assuming it is rare.

## Dependencies

- Task 2 depends on Task 1 (mirrors follow the agent files).
- Task 5 depends on Tasks 1, 3, 4 (tiers are set on the final agent set).
- Task 6 depends on Task 2 (latch keys are the merged reviewer keys) and pairs with Task 7's red path.
- Task 8 depends on Task 7 (the selector field is a fallback of the impacted-set definition).
- Task 9 depends on Task 4 (`asd-tester` must exist under its new name).
- Task 14 depends on Task 13 (contract) and on Tasks 1, 3, 4 (the retired-name list).
- Task 15 depends on every preceding task and must run last.

## Out of scope

- Authoring or updating tests, including the three failing roster tests and the migration-runner
  coverage — `impl-test` owns them.
- Rewriting existing in-code comments to satisfy Task 10's new rules.
- Migration scripts for any version other than the one this sprint produces.
- Rewriting `.asd/project/decisions-log.md` or `.asd/sprints/archived/**`.
