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
- No test-authoring tasks or subtasks: tests are selected and written in impl-test, after the code exists — the one carve-out is a `Test-only:` task (sprint-lifecycle.md "Plan file format")
- Every task carries a `Material risk:` line, plain text, never a checkbox (see sprint-lifecycle.md "Plan file format")
- A test-only task carries a `Test-only: <test paths or globs>` line, plain text, never a checkbox, directly under the `Material risk` line(s) and ahead of any `Reachability` line; it sits in a wave after every task whose code it covers (same section)
- `## Dependencies` is required and opens with the wave table impl dispatches from; every task sits in exactly one wave, and no two tasks in one wave touch overlapping paths (same section)
- An orchestrator-only action (naming its execution point) or a tests-only stub (`Stub <ref> → impl-test`) is its own plain-text line outside every `### Task N:` block, never a checkbox (same section)
- `## Decision coverage` is a table only, no checkboxes (asd-phase-plan.md)
- The other task decomposition rules: sprint-lifecycle.md "Plan file format"
-->

## Overview
Four strands, each shipped in canon so it holds in a consumer project. (1) Measure and bound: context ceilings, bundle bytes in the ledger, test-line delta (AC-1..AC-3, AC-18). (2) Checks over advice: a `checks` run point at the impl gate, the weakened-check ban, dated accepted debt, check homes for retro guardrails, seeded-violation proof, `/asd-init` naming absent gate classes, agnix for this repo (AC-4..AC-6, AC-8, AC-9, AC-21). (3) Tests: admission by gap proof, valid test requests, the narrowed regression duty, durations, temporary tests, the suite-revision mode and this repo's own revision (AC-13..AC-17, AC-19, AC-20), the selection-miss record (AC-7). (4) Scope intake: open PRs, and the `retro-candidates` fix (AC-11, AC-12).

Decisions fixed here (the shapes the Tasks implement):
- **`checks` (AC-1, AC-6, AC-21)**: `commands.yaml` gains an optional top-level map `checks:` (`<name>: "<command>"`). The impl completion gate (`asd-phase-impl.md` step 9) runs every entry after `build` and `lint`, on synced views; a non-zero exit fails the gate as a lint error does. It is the one run point of a project check: a retro guardrail's check Home in a consumer project is a `checks` entry.
- **Context ceilings (AC-1)**: file `.asd/project/context-ceilings.json`, a flat object key → max bytes. Key `<role>@<phase>` is a context bundle's size, any other key a repo-relative file's size (an absent file is 0). `node .asd/runtime.js context-check [--ceilings <path>]` exits 1 with JSON `{"over":[{"key","bytes","ceiling"}]}` when any key is over, 2 when the file is absent or not an object of positive integers. `context-check --seed [--bundles] [--headroom <percent>]` writes the file: every existing `.asd/project/custom-*-rules.md` and `reliability-checklist.md`, plus with `--bundles` every role of `providers.md` "Role-scoped context" × every phase of both workflow definitions, each value the current bytes plus headroom (default 10), rounded up. `/asd-init` seeds without `--bundles` and adds `checks.context: "node .asd/runtime.js context-check"`; this repo seeds with `--bundles`.
- **Bundle bytes (AC-2)**: `timing --open <id> --kind dispatch` adds `attrs.context_bytes`, the size of the bundle at the `agent-protocol.md` "Dispatch payload" path for that id under `scratch-dir`; no file → the attr is absent. `timing-summary` adds `context_bytes: {total, by_agent, dispatches_without}`.
- **Test-line delta (AC-3)**: `commands.yaml` key `test_paths: "<glob>[, <glob>…]"`; absent → the default list `**/test/**, **/tests/**, **/__tests__/**, **/spec/**, **/*.test.*, **/*.spec.*, **/*_test.*, **/test_*.*`. `node .asd/runtime.js test-delta --base <ref> [--commands <path>]` reads `git diff --numstat -z -M <base>...HEAD`, drops `.asd/sprints/**` and generated provider views, and prints `{"test":{"added","removed","net"},"other":{…},"allowance_required"}`; `allowance_required` = `test.net > 200 && test.net > other.net`, net = added − removed. `impl-test-close --green --base <ref>` writes `- Line delta: tests +A/−R (net N); other +A/−R (net N)` into `Suite run` and refuses, writing nothing, when `allowance_required` and `Suite run` holds no non-empty `- Allowance:` line.
- **Accepted-debt review date (AC-5)**: Reason format `(accepted-debt) review YYYY-MM-DD: <why>`. `node .asd/runtime.js stubs-due --stubs <path> [--today <YYYY-MM-DD>]` prints `{"due":[{"file","state":"missing|invalid|expired","date"}]}`, exit 0; a date is valid only as a real calendar date.
- **Gap proof (AC-13)**: `t_test-plan.md` `Added tests` gains a `Gap proof` column: `seeded <defect>: <command> → exit 0 (<existing tests of the unit>)` or `search <pattern> in <paths>: no test of <unit>`. `impl-test-close` refuses an `Added tests` table that has a row and no `Gap proof` column, or a row whose cell is empty.
- **Durations (AC-16)**: `commands.yaml` key `test_durations`, the test command in its duration-reporting form; the full-suite run uses it when present and `Suite run` records `- Slowest tests:` (ten, name and ms). `tests/run.js` prints each test's ms and a ten-slowest summary on every run.
- **Suite baseline (AC-18)**: `timing-summary` adds `suite_full: {sprint_seconds, baseline_median, over}` — the sprint's longest closed `suite` op with `attrs.scope: "full"`; the median over archived ledgers' such ops, `null` under three samples; `over` = sprint > 1.5 × median.
- **Temporary test (AC-19)**: its name opens `temporary(<NNN>): `, `<NNN>` the sprint number; a prune pass of any later sprint removes it.
- **Suite revision (AC-17, AC-20)**: an `impl-test` mode, run when `sprint.md` asks for it, ledger in `test-plan.md` `## Suite revision` (`Area | State | Tests before → after | Seeded-defect proof`); the orchestrator re-dispatches the tester until no area is `pending`. In this repo `node tests/run.js [<area>…]` loads `tests/<area>.test.js` files; no area argument loads all.
- **Open PRs (AC-12)**: listed by `gh pr list … --json` (`gh-2.90.md`); choices merge (`git-strategy.md` "Merging a PR", executed at the gate), include (`AC-N` ending `(PR #N)`, the PR closed with a comment naming the sprint PR in pr merge mode, where included issues are closed), close (`gh pr close -c`), defer (nothing written, listed again next sprint).
- **Codex sandbox (AC-21)**: `sync.js` neither validates nor renders `sandbox_mode`; a `codex.sandbox_mode` key still present in a consumer's custom agent is ignored. `asd-external-review`'s `wraps_invoke_args` keeps `--sandbox read-only`.
- **agnix (AC-21)**: `checks.agnix: "npx --yes agnix@0.61.0 --strict -c .agnix.toml .claude .codex .agents AGENTS.md CLAUDE.md"` in this repo's `commands.yaml` only; `.agnix.toml` disables CC-SK-007 with its reason.

Rule homes cited across Tasks: `code-style.md` §17 (test admission, gap proof, temporary tests, seeded-violation proof, weakened-check ban), `asd-phase-impl.md` step 9 (`checks`), `asd-tester.md` "Suite revision", `artifact-layout.md` "Test plan" (file shape), `git-strategy.md` stubs section (review date), `checkpoints.md` "Gate policy" (hard gates), `sprint-lifecycle.md` "Operation timing" (`context_bytes`).

Restating sites of the changed rules, each assigned once: `sandbox_mode` — `sync.js:328,335`, `providers.md:41,42,48,84`, the `codex` frontmatter line of all eight `.asd/agents/*.md`, `asd-external-review.md:105` (Task 4), `README.md:245,264` (Task 12), `tests/run.js:137-181,1039-1070,3690,9452` (impl-test). Sweep forms: `sandbox_mode`, `sandbox mode`, `Codex sandbox`, `read-only sandbox`. Test rules — `asd-reviewer-quality.md:97-118`, `asd-reviewer-efficiency.md:105`, `asd-reviewer-combined.md`, `review-policy.md:53` (Task 9), `asd-phase-impl-test.md` "Rules", `asd-tester.md` (Task 8), README FAQ `:489-493` (Task 12).

External APIs: `gh pr list`, `gh pr view`, `gh pr close` (`docs/architecture/tech-reference/gh-2.90.md`, extended at plan), `git diff --numstat` (`git-2.56.md`), agnix (`agnix-0.61.md`, new at plan).

Orchestrator: after wave 1's sync, write `.agnix.toml` (`[rules] disabled_rules = ["CC-SK-007"]`, comment: phase skills run project-defined commands canon cannot enumerate; sprint 037).
Orchestrator: after wave 2's sync, edit `.asd/project/commands.yaml` — `test_paths: "tests/**"`, `test_durations: "node tests/run.js"`, `checks.agnix` and `checks.context` as above; the comment on `test_affected` names the area arguments once AC-20's split lands.
Orchestrator: at the impl completion gate of wave 3, run `node .asd/runtime.js context-check --seed --bundles` and commit `.asd/project/context-ceilings.json`, then run every `checks` entry.
Suite revision of `tests/**` → impl-test (AC-20), after the sprint's own tests are written; before: 430 tests, 11 555 lines, 59.4 s.

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.
`checks.agnix` exits 0 at the impl completion gate and at the terminal full-suite HEAD (AC-21). `git grep sandbox_mode` outside `CHANGELOG.md`, `.asd/sprints/**` and `docs/**` is empty. `test-plan.md` records the suite's test count, line count and duration before and after the revision, and its ledger has no `pending` area (AC-20). `node .asd/runtime.js retro-candidates` over sprint 036's retrospective returns seven action rows (AC-11).

### Task 1: Runtime — context ceilings, bundle bytes, retro zero rows, suite baseline
Material risk: change: bundle-path derivation from a dispatch id and role×phase enumeration have edges no named test establishes
- [x] `.asd/runtime.js`: `context-check` and `context-check --seed` per Overview "Context ceilings", sharing `contextCommand`'s bundle builder; add both to the command table (AC-1)
- [x] `fillDispatchAttrs`: `context_bytes` per Overview "Bundle bytes"; `timingSummary`: `context_bytes` block (AC-2)
- [x] `retroRows`: a section holding no `<table>` returns zero rows, a required table included; a `<table>` without `<tbody>` still exits 2 (AC-11)
- [x] `timingSummary` / `timingBaseline`: `suite_full` per Overview "Suite baseline" (AC-18)

### Task 2: Runtime — test delta, stub dates, close checks
Material risk: change: numstat edge cases (renames, binary files) and the allowance refusal order in `impl-test-close`
- [x] `.asd/runtime.js`: a reader of one top-level scalar key of `commands.yaml`, used by `test-delta` for `test_paths` (AC-3)
- [x] `test-delta` per Overview "Test-line delta", globs through `globRegex`, generated views excluded by the predicate the review manifest already uses (AC-3)
- [x] `implTestClose`: `--green --base <ref>` writes the `Line delta` line and applies the allowance refusal; every close applies the `Gap proof` check; both validated before any file is written (AC-3, AC-13)
- [x] `stubs-due` per Overview "Accepted-debt review date" (AC-5)

### Task 3: code-style.md — check and test rules
Material risk: change: wording of the admission, suppression and regression-duty rules
- [x] `.asd/rules/code-style.md`: no disabling, skipping or downgrading a check and no inline suppression to make a change pass; the exception is one path and one rule with a reason, returned as `QUESTION` under the quality-waiver hard gate (AC-4)
- [x] §17: a sprint adding or changing a deterministic check records one seeded-violation run exiting non-zero, in the existing proof-record shape, the violation restored (AC-9)
- [x] §17: test admission — gap proof before a test is added, decision `none` citing the existing test that already fails, a new case extends the owner test, a new test function only for an unowned contract (AC-13)
- [x] §17 regression-test bullet (`:120`) and content-contract bullet (`:126`): the duty covers a behaviour defect reproducible by running code; a prose, rule or document fix adds a test only when it changes a machine-parsed token (AC-15)
- [x] §17: a test guarding a one-time change is named `temporary(<NNN>): …` and removed by a later sprint's prune pass (AC-19)

### Task 4: Codex sandbox key removal
Material risk: change: wording of the Codex read-only guarantee in providers.md
- [x] `.asd/sync.js:328,335`: drop the `sandbox_mode` validation and rendering; a present key is ignored (AC-21)
- [x] `.asd/agents/*.md` (eight files): remove `sandbox_mode` from the `codex` frontmatter line only (AC-21)
- [x] `.asd/rules/providers.md:41,42,48,84`: a Codex subagent inherits the parent session's sandbox; read-only of advisor, scout and External Review on Codex is policy-bound, External Review's wrapped CLI keeps `--sandbox read-only`; the internal reviewers' Codex carve-out sentence reduces to that one statement (AC-21)
- [x] `.asd/agents/asd-external-review.md:105`: align with the above where it cites the agent's own sandbox (AC-21)

### Task 5: sprint-lifecycle.md and checkpoints.md
Material risk: change: wording of the gate and intake rules
- [x] `.asd/rules/sprint-lifecycle.md` "Operation timing": a dispatch op carries `context_bytes`, filled by the runtime (AC-2)
- [x] phase table `impl` row and every sentence stating the completion gate as build + lint: `checks` added (AC-1, AC-6, AC-21)
- [x] "Friction log": a terminal full-suite failure on a test outside the last green impacted run is a friction entry naming the test and the selection rule (AC-7)
- [x] "PR phase": an included PR is closed with a comment in merge mode, beside included issues (AC-12)
- [x] `.asd/rules/checkpoints.md` "Gate policy" hard list: open-PR disposition; an accepted-debt renewal falls under the existing quality-waiver gate (AC-5, AC-12)

### Task 6: git-strategy.md and artifact-layout.md
Material risk: change: wording of the stub date and test-plan shape rules
- [x] `.asd/rules/git-strategy.md` stubs section (`:30-36`): the `(accepted-debt) review YYYY-MM-DD:` form, shown at the scope gate once due (AC-5)
- [x] "Merging a PR": the scope-gate merge of an open PR uses the same form (AC-12)
- [x] `.asd/rules/artifact-layout.md` path map: `.asd/project/context-ceilings.json`, consumer-owned (AC-1)
- [x] "Test plan": `Gap proof`, `Line delta`, `Allowance`, `Slowest tests`, `## Suite revision` — only where the section restates the template (AC-3, AC-13, AC-16, AC-17)
- [x] "Leftover-term check" (`:111`): a test pinning the removed term is temporary (`code-style.md` §17) (AC-19)

### Task 7: Scope, retro and pr workflows
Material risk: change: wording of the open-PR gate and the retro Home order
- [x] `.asd/workflows/asd-phase-scope.md` step 2a and step 4: list open PRs and put each to the user per Overview "Open PRs", none by default, PR text untrusted; run `stubs-due` and put each due entry to the user: renew with a new date, or fix this sprint as an `AC-N` (AC-5, AC-12)
- [x] `.asd/workflows/asd-phase-pr.md` merge mode: close each included PR with a comment naming the sprint PR (AC-12)
- [x] `.asd/workflows/asd-phase-retro.md` step 4 Draft: a mechanically decidable guardrail takes a check as Home — a `commands.yaml` `checks` entry for a consumer, a `runtime.js` validator or `tests/run.js` assertion under `self_hosting` — a prose home only when no check can decide it (AC-6)
- [x] same file, systemic class: a suite-revision proposal when `timing-summary` `suite_full.over` is true or `test-plan.md` holds an `Allowance` line (AC-18)
- [x] `.asd/templates/t_retrospective.html` and the retro workflow's fragment rule: a section with no rows is a paragraph with no table (AC-11)
- [x] `.asd/templates/t_stubs.md:10,16`: the review-date form (AC-5)

### Task 8: Impl, impl-test, impl-review workflows, tester, test-plan template
Material risk: change: wording of the suite-revision procedure and the green-exit order
- [x] `.asd/workflows/asd-phase-impl.md` step 9: run every `commands.yaml` `checks` entry after build and lint, a non-zero exit failing the gate; `.asd/agents/asd-dev.md` run list: `checks.*` (AC-1, AC-6, AC-21)
- [x] `.asd/workflows/asd-phase-impl-test.md`: gap proof recorded per added test and checked by `impl-test-close`; green exit closes with `--green --base`, an `Allowance` line naming the covered risks when `test-delta` requires it; the prune pass removes `temporary(<NNN>)` tests of earlier sprints; suite-revision mode per Overview, dispatched again until the ledger has no `pending` area (AC-3, AC-13, AC-17, AC-19)
- [x] `.asd/workflows/asd-phase-impl-review.md` terminal full suite (`:61-66`): run through `test_durations` when present and record `Slowest tests`; on red, each failing test is marked inside or outside the last green impacted run's Scope, and one outside it gets the orchestrator's friction entry (AC-7, AC-16)
- [x] `.asd/agents/asd-tester.md`: "Suite revision" section — per area: production code read first, contracts named, one strongest owner each, duplicates, implementation mirrors, tests an enforced static check covers and unused fixtures removed; shared setup built once and reset per test, in-process call over a spawned process where the unit is importable, cheapest level that still catches the defect, a monolithic file split by area, parallel run where the runner supports it; a seeded defect proves each surviving owner; the ledger row written per area (AC-17)
- [x] same file: admission and durations cite `code-style.md` §17 and `commands.yaml`, no restatement (AC-13, AC-16)
- [x] `.asd/templates/t_test-plan.md`: `Added tests` `Gap proof` column; `Suite run` `Line delta`, `Allowance`, `Slowest tests` lines; optional `## Suite revision` ledger (AC-3, AC-13, AC-16, AC-17)

### Task 9: Reviewer rules
Material risk: change: wording of the invalid-finding condition
- [x] `.asd/rules/review-policy.md` (`:53` invalid-finding rules): a finding asking for a test names the failure mode and the existing tests checked, else it is invalid and not routed (AC-14)
- [x] same file: a suppression or weakened check in the reviewed diff without a recorded user decision is a finding (AC-4)
- [x] `.asd/agents/asd-reviewer-quality.md:97-118`, `asd-reviewer-efficiency.md:105`, `asd-reviewer-combined.md` test rubric: cite the two rules, no restatement (AC-4, AC-14)

### Task 10: /asd-init and commands template
Material risk: change: diff-mode detection scope
- [x] `.asd/templates/t_commands.yaml`: optional `test_paths`, `test_durations` and `checks` with their comments (AC-1, AC-3, AC-16)
- [x] `.asd/skills/asd-init/SKILL.md` step 8: fill `test_paths` from the detected layout and `test_durations` from the detected runner, omitting either when none is found; run `context-check --seed` and add `checks.context` (AC-1, AC-3, AC-16)
- [x] same step: name each gate class with no detected command (lint or format, type check) and the adoption path — a sprint adopting the gates per dev-quality-gates `docs/adopt.md`; install nothing (AC-8)
- [x] diff mode (`:89-98`): the same detection for each of those keys still absent, and the same naming (AC-3, AC-8, AC-16)

### Task 11: Runner durations
Material risk: none
Test-only: tests/run.js
- [x] `runAll`: print each test's duration in ms on its `ok`/`FAIL` line and a ten-slowest summary after the count line; adapt any test that parses runner output (AC-16)

### Task 12: README, changelog, version
Material risk: artifact: mirror edits verified by tests/run.js README mirror tests and git grep
- [x] `README.md`: runtime command list (`context-check`, `test-delta`, `stubs-due`, `impl-test-close --green`), `commands.yaml` schema (`test_paths`, `test_durations`, `checks`), folder map (`context-ceilings.json`), phase rows (`:182-196`: scope lists open PRs and due stubs, impl gate runs `checks`, retro check Home), reviewer and scout read-only text (`:245,264`), test FAQ (`:489-493`), `/asd-init` gate-class note (AC-1, AC-3, AC-5, AC-8, AC-12, AC-16, AC-21)
- [x] `CHANGELOG.md` and `.asd/release-manifest.json` `asd_version`: 14.9.0

## Risks
- A check written in wave 2 (`impl-test-close`) gates this sprint's own `impl-test`: the tester records gap proofs from entry 1.
- AC-20 moves 11.5k test lines under one review wave: the split is its own commit, verified by an equal test-name set before and after and a green suite; revision edits follow in separate commits.
- Rule text added by twelve Tasks grows the bundles AC-1 bounds: each edit replaces or tightens text where a home exists; ceilings are seeded at the end of impl.
- `checks.agnix` needs npm and, on first use, network: a run that cannot start fails the gate and goes to the user.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | 1, 3, 4, 5, 6 |
| 2 | 2, 7, 8, 9, 10 |
| 3 | 11, 12 |

- Task 2 follows Task 1 (same file). Tasks 7-10 cite the rule homes Tasks 3, 5 and 6 write. Tasks 8 and 9 edit agent bodies after Task 4's frontmatter edit of the same files.
- Task 12 mirrors every earlier Task. Task 11 covers no production code; it waits for Task 8's `test_durations` wording.

## Decision coverage

| Decision | Covered by |
|---|---|
| Scope considers every open PR and takes a decision on each | AC-12 / Tasks 5, 6, 7 |
| A procedure that lightens the test suite | AC-16..AC-18, AC-20 / Tasks 1, 7, 8, 11; suite revision → impl-test |
| Unnecessary tests are never added | AC-13..AC-15, AC-19 / Tasks 2, 3, 8, 9 |
| Everything works in consumer projects | every Task edits shipped canon; this repo's settings are the orchestrator lines |
| One sprint, no split | all AC in this plan |
| agnix mandatory under self-hosting, errors and warnings fixed | AC-21 / Tasks 4, 5, 8; orchestrator lines |
| CDX-SUB-002: remove the key, correct the rules | AC-21 / Tasks 4, 12 |
| CC-SK-007: exclude the rule with a reason | AC-21 / orchestrator line `.agnix.toml` |

## Out of scope
- `test_affected` for this repo: area arguments serve the search-derived impacted set.
- agnix info findings (skill listing budget CC-SK-025 / CX-SK-004, `<version>` tag CC-SK-031): reported, not gated.
