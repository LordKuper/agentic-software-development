---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), docs/ (decisions), audit.md (audit)
---

# Sprint 004-review-scoping-and-test-audit

## Goal

Cut the cost of the review loop without weakening its gates, and raise the quality floor of what
each remaining dispatch produces.

Cost side: fewer tests, fewer runs, fewer dispatches. `impl-test` gets an explicit authoring bar so
tests that cover no real risk are never written, and the same hypothetical-risk criterion governs
pruning. Test runs everywhere are scoped to the change surface; the full suite runs exactly once
per sprint cycle, at the end of a fully-approved `impl-review`. Reviewers that already approved are
not re-asked (APPROVE latch), impl-review is explicitly bound to the iteration's change surface,
and `impl-test` confirms the existing impacted tests against the new code *before* selecting new
ones, so risk analysis sees actual behaviour. Five internal code reviewers collapse into two
(`asd-reviewer-correctness`, `asd-reviewer-efficiency`) that carry every predecessor rubric,
turning per-agent dispatch cost into per-rubric-section cost inside one agent.

Quality side: dev/test/orchestration agents get raised reasoning tiers, `code-style.md` §7 bans
in-body comments outright and constrains doc comments to purpose-only, and `core.md` gains a
`Context hygiene` section making disk — not the transcript — the single memory of a sprint.

## Acceptance

- AC-1: **authoring bar in `impl-test` — no test without a real risk.** The test audit STAYS in
  impl-review: `asd-reviewer-testing` is not relocated and keeps its current scope (test-plan
  decisions, test quality and determinism, stub resolution, manual-verification judgment). What
  changes is the authoring side, in `.asd/agents/asd-test-engineer.md` and
  `.asd/workflows/asd-phase-impl-test.md`, which gain an explicit bar:
  - a test is authored only when it covers a real, material risk on the change surface;
  - a test whose risk is hypothetical, whose behaviour is already covered by an existing check, or
    whose only value is a coverage number, is not authored at all;
  - "no new test needed" is a first-class, recorded outcome of the strategy pass — stated and
    justified in `test-plan.md`, never a silent fallback.
  Pairs with AC-4, whose §17 criterion governs both authoring and pruning.

- AC-2: **APPROVE latch for every review phase** (design-review and impl-review). A reviewer that
  returned `APPROVE` on iteration N is not dispatched on iterations N+1 and later within the same
  phase. The latch is persisted in `state.json` under `reviews.<phase>`, counts as satisfied in
  verdict aggregation (so DoD can still be met), and is reset together with the phase's other
  counters by the existing rollback-reset rules in `sprint-lifecycle.md`.
  One explicit invalidation rule beyond those: the latch survives ordinary review-fix cycles, but
  NOT a red full suite (AC-5). A full-suite failure proves previously approved code was wrong, so
  that path clears every latch for the sprint and the full reviewer roster is re-dispatched on the
  next impl-review entry.

- AC-3: **change-surface rule for impl-review, stated explicitly in `review-policy.md`.** Review
  covers only the change surface (the iteration's diff), never the whole project. A finding about
  unchanged code is invalid — with the single exception that the change made that unchanged code
  incorrect.

- AC-4: **hypothetical-risk criterion, governing authoring AND pruning.** Test work in `impl-test`
  stays change-scoped; `code-style.md` §17 gains a bullet: a test inside the change surface that
  verifies a hypothetical rather than a real risk is a removal candidate when it exists, and is not
  written in the first place when it does not (AC-1).

- AC-5: **two-tier test running — impacted everywhere, full suite once per cycle.**
  - Scoping rule: in `impl`, `impl-test`, and `impl-review`, any test run covers the change surface
    only — impacted tests, not the whole suite.
  - The full suite runs exactly once per sprint cycle: at the END of `impl-review`, after every
    dispatched reviewer has returned APPROVE and before the phase emits `NEXT: pr`. Reviewers are
    read-only and never run commands, so the run is dispatched to `asd-test-engineer`. The result is
    recorded in `test-plan.md`'s existing `Suite run` section including its `HEAD` field; the
    pr-phase gate keeps reading it from there, wording unchanged.
  - Red full suite at that point: test defects → `asd-test-engineer` fixes and re-runs; code defects
    → `D-N` rows in `test-plan.md`, `state.json.test_defects_pending`, route back to `impl` in
    test-fix mode exactly as today. Green → DoD met, `NEXT: pr`. A green full suite is part of
    impl-review's DoD. Either red path also clears every APPROVE latch for the sprint (AC-2).
  - Canonical definition of the **impacted set**, written into `.asd/rules/sprint-lifecycle.md` as
    its single home (every other file cross-links, never restates):
    - test files present in the change-surface diff; plus
    - tests exercising a changed unit, resolved by repo search over references/imports of the
      changed modules; plus
    - tests tagged with an AC-N the change touches, per the existing AC-citation convention in
      `code-style.md` §17.
    - If the project's runner offers a native affected/changed selector (`--changedSince`,
      `--onlyChanged`, a filter expression), it is used INSTEAD of the search-derived set. Add a
      field for it to `.asd/project/commands.yaml` (and `t_commands.yaml`); `/asd-init`'s command
      detection populates it when detectable; absent field → fall back to the search-derived set.
    - Safety valve, mandatory not heuristic: when the change surface touches shared infrastructure
      — build config, CI config, shared/common modules, framework-wide files — the impacted set
      degrades to the full suite. `asd-test-engineer` MUST apply this test before every scoped run.
  - `impl-test`'s own suite gate (its step 7) becomes the impacted-only run, not the full suite.
  - Retained from the current AC-5: before the strategy pass, `asd-phase-impl-test.md` runs the
    existing tests touched by the change surface, so risk analysis observes factual post-impl
    behaviour and catches regressions introduced by `impl` before any new test is authored.
  - `impl`: its completion gate stays build + lint. This is a scoping rule only — a dev in fix mode
    may run the impacted subset for self-verification, but still never authors, modifies, or prunes
    tests. State that explicitly so the dev / test-engineer boundary stays unambiguous.

- AC-6: **agent model/effort tiers raised.** Frontmatter only, both provider blocks
  (`claude.model`/`claude.effort`, `codex.model`/`codex.model_reasoning_effort`):
  - `asd-backend-dev`, `asd-frontend-dev`, `asd-test-engineer`: effort → `high` on both providers;
    model family unchanged (sonnet / terra);
  - `asd-pm`: `fable` + `high` (claude), `sol` + `high` (codex) — was opus/medium + sol/medium;
  - `asd-advisor`: `fable` + `high` (claude), `sol` + `high` (codex) — was fable/medium + sol/medium.
  README's model-tier table is a hard-rule mirror: BOTH provider columns update in the same change.

- AC-7: **internal code reviewers merged, five agents → two.** Naming is decided, not open:
  - `asd-reviewer-correctness` = `asd-reviewer-quality` + `asd-reviewer-implementation` +
    `asd-reviewer-ui`. Scope: bugs, security, best-practice and contract drift; AC-N coverage trace;
    UI conformance to ux-spec, design-system token usage, accessibility baseline.
  - `asd-reviewer-efficiency` = `asd-reviewer-simplification` + `asd-reviewer-performance`. Scope:
    over-engineering checklist, structure/cohesion smells, design-principles adherence; performance
    budgets, algorithmic complexity, perf anti-patterns, regression detection.
  - The five old agent files are deleted. Each merged file carries every predecessor rubric item as
    an explicitly named rubric section — no rubric item silently dropped.
  - Verdict tokens become `[REVIEW-<phase>-correctness]` / `[REVIEW-<phase>-efficiency]`; review
    files are named `correctness.md` / `efficiency.md`.
  - Every reviewer-keyed structure follows the rename: `state.json.reviews.<phase>.verdicts["iter-NN"]`
    keys, the AC-2 APPROVE-latch keys, `t_state.json`, and the
    `<sprint>/reviews/{design|impl}/iter-NN/<reviewer>.md` file names.
  - The two diff-derived skip predicates in `asd-phase-impl-review.md` step 5 (UI-surface predicate;
    perf-budgets + executable-file predicate) survive but degrade from *agent* skip to
    *rubric-section* skip: the merged agent is always dispatched, and the section is marked
    `n/a: <predicate>` in its coverage ledger. `review.scoped_fan_out` semantics update to match.
  - `asd-reviewer-testing` is NOT part of the merge — it stays a separate agent in the impl-review
    fan-out (AC-1).
  - Resulting rosters: impl-review internal = correctness + efficiency + documentation + testing
    (four); design-review internal = correctness (UI rubric section only,
    conditional on a ux-spec/design-system draft being in the set) + efficiency (over-engineering
    and design-principles sections) + documentation. External Review unchanged.
  - Updates required in: `review-policy.md` "DoD per review phase" table, its conditional-dispatch
    paragraph, and the simplification-checklist sections currently attributed to "Simplification
    reviewer"; the dispatch lists in `asd-phase-design-review.md` and `asd-phase-impl-review.md`;
    and every remaining cross-reference to a deleted agent name — other agents' `description`
    delegation lists, `artifact-layout.md`, `release-manifest.json`, README agent roster and
    model-tier table, `t_review.md` where it names reviewers.

- AC-8: **code documentation rules tightened (`code-style.md` §7).**
  - No comments inside method/function bodies, at all. Meaning belongs in the name, the signature,
    or the member's doc comment; a body that needs narration is renamed, split, or rewritten. The
    only permitted in-body marker remains `// TODO(sprint-<NNN-slug>): <reason>`. The existing
    "Comments explain WHY, not WHAT" bullet is reconciled: the WHY allowance now applies to doc
    comments only, never to in-body comments.
  - Type-level doc: short, states the type's purpose ONLY; never duplicates or summarizes its
    members' docs (tightens the existing "A type's doc does not describe its members" bullet).
  - Member-level doc: short, states the member's purpose, never its implementation.
  - `asd-reviewer-documentation` gains an explicit rubric item enforcing all three; a violation is
    severity `high` per the `review-policy.md` severity taxonomy. Its `description` frontmatter
    widens to state that it also reviews in-code doc comments, so the delegation lists in the two
    merged reviewers stay truthful.

- AC-9: **context-management rules — new `## Context hygiene` section in `.asd/rules/core.md`.**
  In the hub doc itself: not a new rule file, not a new doc. Terse imperative, core.md style, seven
  rules:
  1. Disk is the memory. Decision → `decisions-log.md`; state → `state.json`; artifact → its real
     path. Anything living only in the transcript is not done. Corollary: any session is clearable
     at a phase boundary without loss.
  2. Clear at phase boundaries. Once a phase emits COMPLETED and its state write lands, the
     orchestrator transcript holds nothing unique — prefer clear over compaction; re-enter via the
     sprint orchestrator, recovering from `state.json` per `sprint-lifecycle.md` "State recovery".
  3. Compact only within a phase (long `impl` runs, fix loops). The compaction summary MUST
     preserve: sprint id; phase and mode; outstanding signals (`QUESTION`, `BLOCKED_MANUAL`,
     `ADVICE_NEEDED`); any gate answer not yet written to disk; paths written this phase; remaining
     task / finding / defect ids.
  4. Never clear or compact mid-gate — between posting a gate message and recording the answer.
     Record the answer to `decisions-log.md`/`state.json` first, then compact.
  5. Dispatch payloads carry paths and explicit parameters, never transcript excerpts. A dispatched
     agent never inherits the orchestrator's conversation.
  6. Reviewers get fresh context per iteration and never receive prior-iteration findings (external
     review's stalemate set excepted) — cross-link `review-policy.md`, do not restate its rules.
  7. Threshold: past ~70% context with no phase boundary in reach → compact; boundary in reach →
     finish the phase, then clear.

- AC-10: **cross-file consistency.** Expected touch set: `.asd/workflows/asd-phase-impl-test.md`,
  `asd-phase-impl-review.md` (full-suite step + DoD), `asd-phase-design-review.md`,
  `asd-phase-impl.md`, `asd-phase-pr.md` (only if its gate wording names impl-test as the phase that
  records the suite run), `.asd/agents/asd-test-engineer.md`, `.asd/rules/review-policy.md`
  (DoD per review phase), `.asd/rules/sprint-lifecycle.md` (impl / impl-test / impl-review phase
  contracts and the impl⇄impl-test⇄impl-review cycle), `.asd/rules/checkpoints.md` (only if its
  precondition chain references the suite), `.asd/rules/code-style.md` §17,
  `.asd/templates/t_test-plan.md`, `.asd/templates/t_state.json`, `.asd/templates/t_commands.yaml`
  plus the consumer's `.asd/project/commands.yaml` handling and the `asd-init` skill's command
  detection (native affected-test selector field, AC-5), `README.md`, plus
  `.asd/release-manifest.json` (`canon_hashes`) and `node .asd/sync.js --apply` for every edited
  canonical source. Related skill descriptions (`asd-phase-impl-test`, `asd-phase-impl-review`)
  must match the new dispatch and suite-run topology. Widened by AC-6..AC-9 to additionally cover:
  - README agent roster and BOTH provider model-tier columns;
  - `core.md` "See also" / section list, if the new `Context hygiene` section affects it;
  - `.asd/release-manifest.json`: `managed_paths`, `canon_hashes`, and `model_families` if touched;
  - every skill `description` naming a reviewer;
  - `.asd/rules/code-style.md` §7, `.asd/rules/review-policy.md` (DoD table, conditional-dispatch
    paragraph, simplification checklist, severity taxonomy), `.asd/rules/artifact-layout.md`,
    `.asd/templates/t_review.md`;
  - `node .asd/sync.js --apply` for every canonical edit, plus deletion of the generated views of
    the five removed agents (`.claude/agents/*.md`, `.codex/agents/*.toml`).

- AC-11: **verification.** `node tests/run.js` green; `node .asd/sync.js --check` clean; no place
  left where the full suite is still described as `impl-test`'s gate, and `asd-reviewer-testing`
  still enumerated wherever the impl-review fan-out is listed. Additionally: a repo-wide grep
  proving zero dangling
  references to the five deleted agent names (`asd-reviewer-quality`, `asd-reviewer-implementation`,
  `asd-reviewer-ui`, `asd-reviewer-simplification`, `asd-reviewer-performance`) across canonical
  sources, generated provider views, README, and templates.

## Out of scope

- Relocating, deleting, or merging `asd-reviewer-testing` (AC-1, AC-7 — it stays a separate agent in
  the impl-review fan-out, scope unchanged).
- A test-audit step, `Audit` section, round cap, or fix loop inside `impl-test` (AC-1).
- Any change to iteration counters or severity-floor semantics for design-review and impl-review.
- Re-litigating the merged reviewer names or their scope split (AC-7 — decided).
- Merging, renaming, or retiring `asd-reviewer-documentation`, `asd-external-review`, or any
  non-reviewer agent; the merge in AC-7 covers exactly the five named agents.
- Removing either diff-derived skip predicate (AC-7 — they degrade to rubric-section skips, they do
  not disappear).
- Model-family changes for `asd-backend-dev` / `asd-frontend-dev` / `asd-test-engineer` (AC-6 —
  effort only), and tier changes for any agent not named in AC-6.
- A new rule doc for context management (AC-9 — a section inside `core.md`, nothing else).
- Rewriting existing in-code comments anywhere in this repo: AC-8 changes the rule and its reviewer
  rubric; it is not a cleanup pass over prior code.
