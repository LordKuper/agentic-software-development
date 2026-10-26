---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

## Overview
Sprint 028 adds a `cleanup` phase before `retro` in both workflows (AC-1..AC-7), cuts the agent roster to seven specs with the orchestrator doing all creator work inline and three reviewers `quality`/`efficiency`/`combined` (AC-11..AC-19), lands three retro-027 rows (AC-8..AC-10) and decouples sprint-level UX specs from the project-wide design system (AC-20). Inputs: `sprint.md`, `research.md`, `audit.md` (C1-C3, AC-17 reach; site lists per Touched areas). Release: MAJOR, 14.0.0.

Plan decisions:
- D1 (AC-1): `standard.json` `phases` … impl-review, cleanup, retro, pr; `next["impl-review"]` = `["cleanup","impl"]`, `next.cleanup` = `["retro"]`. `lite.json` … design-promote, cleanup, retro, pr; `next["design-promote"]` = `["cleanup"]`, `next.cleanup` = `["retro"]`. Precondition chain: `cleanup` requires review DoD (standard) / design-promote (lite); `retro` requires cleanup or its no-op skip. `pr` never reads a cleanup record. Every chain mirror per audit "Touched areas" (AC-10 site list) moves in its file's Task.
- D2 (AC-2, AC-12): one delegation rule, home `sprint-lifecycle.md` "Orchestration and adaptive gates": the main orchestrator performs all sprint work itself — scope research, audit, design drafts and fixes, design-promote, plan, cleanup removals, retro, Git/PR — and delegates only production code (`asd-dev`), tests (`asd-tester`), review (reviewers, External Review), advice (`asd-advisor`) and memory-fix dispatches to a surviving owner. `core.md` glossary mirrors it.
- D3 (AC-3, C1): cleanup rule home is a new `sprint-lifecycle.md` "Cleanup phase" section. Reach: the sprint diff against `git.base_branch` plus code the sprint's work made superfluous (pre-existing included), only with clear evidence (no reference left, debug-only output, commented-out block, scratch file, fixture/test data no remaining test reads). Kept: stubs and TODOs still needed. Excluded: test files (test-removal gate, C1), `.asd/sprints/**`, `.asd/project/**` except a resolved stub's `stubs.md` row, `.asd/tmp/**`, `.claude/agent-memory/**`, generated views, persistent `docs/**`, `test-plan.md`, `manual-steps.md`, consumer workflow infrastructure; under `self_hosting` canon prose only as residue, never a documentation-economy edit. Order: safest first (debug output, comments, scratch files), then fixtures/test data, then consequential dead code.
- D4 (AC-4): checkpoint — at entry commit a dirty timing ledger alone, then the orchestrator's own bookkeeping; any other dirty path is `FAILED` naming it, never committed or discarded. Before the first removal append `- YYYY-MM-DD — cleanup checkpoint <sha>`. Removals commit via `git-strategy.md` "Commit before review" over named paths, subject `chore(cleanup): <what>`, no `ASD-Task` trailer; a removed TODO marker deletes its `stubs.md` row in the same commit. After verification append one line `- YYYY-MM-DD — cleanup: removed <paths/symbols>; reverted <ids or none>; verified <build, lint, tests @sha>` (new one-line form in `t_decisions-log.md`). Nothing to remove → the same line with `removed none`.
- D5 (AC-5): verification after the removals — build (`commands.yaml` `build`; under `self_hosting` `sync.js --check` judged by its report items, `--apply` over stale views first), lint inside each commit's one-command form, then the impacted tests ("Impacted test set", the safety valve binding the orchestrator here too; this repo's impacted set is the full `node tests/run.js`). A red check: diagnose; fix only consequences of cleanup's own removals, or revert the offending removal from the checkpoint; when reverting every removal still leaves it red, the cause is not cleanup's → `FAILED` (AC-17 advisor consult). No review. The run is recorded only in the decisions-log line; `test-plan.md` stays tester-owned and pr open mode's content-scoped re-run is unchanged.
- D6 (AC-6, C2): `t_config.yaml` top-level `cleanup: enabled` (`enabled | disabled`, "Absent field = enabled"); scope step 3a freezes top-level `state.json.cleanup` from `{{CLEANUP}}` as a bare boolean (the quoted-placeholder rule stated once for `documents` and `cleanup`). An absent snapshot reads `true` (user, C2). `false` → no-op: one write appends `"cleanup"` to `skipped_phases`, advances `phase`, returns `NEXT: retro`. `asd-init` fresh step 2 and step 8a list it; re-init and sprint-mediated mode pick it up from `t_config.yaml`.
- D7 (AC-9, multi-stage resume of cleanup and of per-section authoring): cleanup write points — checkpoint line before any removal; removal commits after it; record line after verification. Re-entry: no checkpoint line → start; checkpoint line, no record line → uncommitted paths are the phase's own and are restored from the checkpoint, committed removals stand, verification re-runs; record line → done. Per-section authoring (D12): each section is written to the artifact on disk at its lock-in; re-entry evidence is a section with content and no `{{` placeholder; the artifact-level accept is its `gate_decisions` entry.
- D8 (AC-11, AC-15, AC-16): specs kept — `asd-dev` sonnet/high (sol/high) with `mechanical` haiku/high (luna/high); `asd-tester` sonnet/high (sol/high), no variants; `asd-reviewer-quality` opus/high (sol/high, web tools as correctness today); `asd-reviewer-efficiency` opus/high (sol/high, no web); `asd-reviewer-combined` opus/high (sol/high); `asd-external-review`, `asd-advisor` unchanged. Deleted: `asd-ba`, `asd-ux`, `asd-architect`, `asd-reviewer-correctness`, `-testing`, `-documentation`, dev `critical`, tester `mechanical`/`critical`. `route-task` tiers `command|mechanical|standard`; a `change` risk only forbids `mechanical`; legacy `priorTier: critical` reads `standard`. `asd-tester` is unrouted; its dispatches keep the decisions-log line `route <ids>: standard, dispatch HEAD <sha>` that "State recovery" "Failed dispatch" anchors on.
- D9 (AC-13, AC-14): `standard.json` `reviewers.design` and `reviewers.impl` = `["quality","efficiency","external"]`; `lite.json` keeps `["combined","external"]`. Rubrics per the audit "AC-14 mapping" table: every former correctness/testing/documentation entry becomes its own `###` section in `asd-reviewer-quality.md` (⚑ rows named in headings); efficiency gains duplication/reuse, runtime token cost and documentation economy, change-size proportionality, test-suite cost; check-ladder fit splits adequacy (quality) / cost (efficiency); `COMBINED_RUBRICS` = quality + efficiency, combined keeps its own "Overall quality" id. Iron-rule FAIL owners: SSoT → quality, documentation economy → efficiency. `runtime.js`: `INTERNAL_REVIEWERS`, `NA_TARGETS`, noDocs, `reviewerFiles` (quality and combined get scope plus `--test-plan`).
- D10 (AC-17, reach settled by user): orchestrator-only consult branch in `agent-protocol.md` "Relay": before relaying an agent `QUESTION`, a `FAILED`, a second stall or interruption, a stalemate (impl-test, External Review), a review-cap override or a reviewer FAIL escalation to the user, the orchestrator dispatches `asd-advisor` once per request (batched items) with the question, options and context paths. The advisor always recommends; on a hard gate it names the gate and never authorizes (its `FAILED`-on-hard-gate return retires; a consulting creator that sees a named hard gate returns `QUESTION`). `core.md` "User-decision presentation format" adds an **Advisor** line for these escalations; the answer's decisions-log entry records the advice. Advisor unavailable → present without it, saying so. Gate-inventory gates, skill preference menus and `BLOCKED_MANUAL` take no consult.
- D11 (AC-12 rule survival): the audit "Rule survival" rules move — Architect's likec4 lint/mermaid fallback and subsystem-id identity → `artifact-layout.md` "Subsystem registry"; no-secrets and canonical-URL `Last verified` → "Tech reference docs"; ADR set before one accept → `asd-phase-design.md` "Rules"; BA's atomic AC/story rules and provenance quoting → `asd-phase-design.md` "Rules" / `artifact-layout.md` "Document provenance"; UX mockup states, token-decision rules, DESIGN.md spec double-fetch halt → `design-system.md`; creator tool bounds (no `likec4 build` in drafts, `designmd-install` once per session) → the workflow step that runs them. Orchestrator role-scoped rows for scope/audit/design/design-review/design-promote and new concept/stack/design-system rows gain the refs the creators held; the `*` row and impl/impl-test/impl-review rows stay within their D13 caps; standalone skills net-shrink (352 B headroom).
- D12 (cadence, user): every document the orchestrator now authors (PRD, ux-spec, ADR, C4 delta, concept, stack, design-system, accessibility) uses `core.md` "Incremental writing" per-section lock-in, then one artifact-level accept.
- D13 (AC-18): `.asd/migrations/14.0.0.js` — (a) deletes the ownership-marked `.claude/agents/<n>.md` and `.codex/agents/<n>.toml` of the nine retired names (4.0.0 pattern); (b) rewrites each active `state.json` (atomic, 6.0.0 pattern): per review node and iteration, `quality` = `APPROVE` when every legacy `correctness`/`testing`/`documentation` value present is satisfied ("State recovery" semantics), else the most severe token; `efficiency` kept; `latched.quality` only when all three were latched; legacy keys kept as history; (c) `task_routing[*].tier: critical` → `standard`. Memory is not migrated; CHANGELOG warns about leftover consumer memory, incl. a pre-4.0.0 `asd-reviewer-quality/`. `4.0.0.js` keeps its retired-name list unchanged.
- D14 (AC-20): new `documents.design_system` (`enabled | disabled`), the per-field fail-closed rule excepted: absent within an existing `documents` group it takes the `ux_spec` value (no behaviour change for existing configs). `ux_spec` gates only the sprint ux-spec draft and persistent ux-spec docs; `design_system` gates the design-system gate, `design-md-delta.yaml` (the orchestrator proposes token deltas whenever the sprint touches UI), DESIGN.md/design-system.html/accessibility.html promotion, and the Node/`designmd-*` commands in `asd-init`. Frozen into `state.json.documents.design_system`; the design-block collapse test (rule, hook) adds it; the per-sprint document skip covers it.
- D15 (AC-8): `asd-external-review.md` return-format text: an empty Kept findings table is its header and separator rows only, never a placeholder row.
- D16 (AC-9, AC-10): two sibling bullets in `sprint-lifecycle.md` "Plan file format" Decomposition rules — a multi-stage interactive step states each stage's on-disk write point and re-entry evidence; a criterion claiming universal reach lists every triggering site a repo grep finds. This plan applies both: D7, and the audit site lists assigned file-by-file below.

New rule homes cited across Tasks (exact file and heading): `.asd/rules/sprint-lifecycle.md` "Cleanup phase" (new; D3-D7); `.asd/rules/sprint-lifecycle.md` "Orchestration and adaptive gates" (D2); `.asd/rules/agent-protocol.md` "Relay" escalation-consult branch (D10); `.asd/rules/core.md` "User-decision presentation format" Advisor line (D10); `.asd/rules/providers.md` "Role-scoped context" orchestrator `cleanup`/`concept`/`stack`/`design-system` rows (D3, D11); `.asd/rules/providers.md` "Task-class variants and routing" (D8); `.asd/rules/review-policy.md` "Reviewer responsibility" (D9); `.asd/rules/design-system.md` token-decision section (D11, D14).

Orchestrator-only actions:
- After wave 1: `node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply` over the stale views plus the nine retired agent views per provider named as orphans; delete `.claude/agent-memory/{asd-architect,asd-dev-critical,asd-reviewer-correctness,asd-reviewer-documentation,asd-reviewer-testing,asd-tester-critical,asd-pm}/` as ownerless (user decision); commit views, manifest ledgers and deletions.
- After every later wave: `sync.js --apply` over views whose canon changed, commit.

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.
`sync.js --check` reports every item `current` (`AGENTS.md` `modified-foreign` excepted); `.claude/agents/` and `.codex/agents/` hold exactly eight definitions each; the leftover-term check finds no live mention of the removed agent names, reviewer keys `correctness`/`testing`/`documentation` or routing tier `critical` outside archived sprints, CHANGELOG, migrations and their tests.

### Task 1: Agent roster and its runtime/generator contract
Material risk: change: reviewer rubric split and routing tier removal
- [x] Delete `.asd/agents/asd-ba.md`, `asd-ux.md`, `asd-architect.md`, `asd-reviewer-correctness.md`, `asd-reviewer-testing.md`, `asd-reviewer-documentation.md` (AC-11)
- [x] New `.asd/agents/asd-reviewer-quality.md` per D8/D9: frontmatter, description ≤300 chars, rubric `###` sections per the audit mapping table (AC-11, AC-14, AC-15)
- [x] `asd-reviewer-efficiency.md` (opus/high, new rubric sections per D9) and `asd-reviewer-combined.md` (composes quality + efficiency, own "Overall quality") (AC-14, AC-15)
- [x] `asd-dev.md`: drop `critical`, base sonnet/high + sol/high, `mechanical` haiku/high + luna/high; `asd-tester.md`: drop `variants`, base sonnet/high + sol/high (AC-11, AC-15, AC-16)
- [x] `asd-advisor.md`: always-recommend contract, names a hard gate, never authorizes, orchestrator escalation consults per D10 (AC-17)
- [x] `asd-external-review.md`: empty Kept findings table rule per D15 (AC-8)
- [x] Remaining agent bodies and descriptions: no delegation target names a removed agent (AC-11)
- [x] `.asd/runtime.js`: `INTERNAL_REVIEWERS`, `COMBINED_RUBRICS`, `NA_TARGETS`, noDocs, `reviewerFiles` per D9; `routeTask` per D8 (legacy `priorTier: critical` → `standard`); `AUDIT_BATCH_THRESHOLD_FILES` recipient comment (AC-13, AC-14, AC-16)
- [x] `.asd/sync.js` `VARIANT_SUFFIXES` drops `critical` (AC-16)

### Task 2: sprint-lifecycle.md
Material risk: change: cleanup phase rule shape and delegation rule rewrite
- [x] "Orchestration and adaptive gates" per D2; lite and standard chains, Phase table (cleanup row, scope/audit/design/design-promote owners, impl-review exit), "No-op phase rule" cleanup row (AC-1, AC-2, AC-12)
- [x] New "Cleanup phase" section per D3-D7; "Impacted test set" (cleanup joins impacted-only, safety valve binds the orchestrator, "final tree" sentence amended keeping `final tree`/`entry analysed`) (AC-3..AC-6)
- [x] "Self-hosting": the orchestrator may write canon in cleanup; sync point after its removals (AC-3)
- [x] "Optional documents": `cleanup` and `design_system` freeze, absent-snapshot rules, placeholder→boolean rule stated once, collapse test and per-sprint skip with `design_system`, "Independent design docs" split per D14 (AC-6, AC-20)
- [x] "Staged solution design", "Design-promote phase", lite design-promote, "Input sources": creator work inline per D2/D11 (AC-12)
- [x] "Task-class" citations, "Test-only declaration" (`asd-tester`, unrouted), "State recovery" failed-dispatch roster per D8 (AC-16)
- [x] "Plan file format" Decomposition rules: D16's two bullets (AC-9, AC-10)

### Task 3: checkpoints.md, core.md, agent-protocol.md
Material risk: change: advisor escalation contract
- [x] `checkpoints.md`: precondition chain and lite line per D1; gate inventory notes per D6/D14 (AC-1, AC-6, AC-20)
- [x] `core.md`: glossary phase list, creator/reviewer/advisor/orchestrator entries per D2/D8; "Autonomy and escalation"; "User-decision presentation format" Advisor line per D10 (AC-1, AC-2, AC-12, AC-17)
- [x] `agent-protocol.md`: Signals emitters, advisor `FAILED` row retired, "Relay" escalation-consult branch per D10 (AC-17)

### Task 4: providers.md, artifact-layout.md, git-strategy.md
Material risk: change: role-scoped context rows within D13 caps
- [x] `providers.md` "Role-scoped context": remove creator and removed-reviewer rows, add quality rows, orchestrator rows per D11 incl. `cleanup`, `concept`, `stack`, `design-system`; "Conditional grants"; "Task-class variants and routing" per D8 (AC-3, AC-11, AC-12, AC-16)
- [x] `artifact-layout.md`: owner lines (Architect, Documentation agent) → orchestrator; iron-rule FAIL owners per D9; rule survival per D11 ("Subsystem registry", "Tech reference docs", "Document provenance") (AC-12, AC-14)
- [x] `git-strategy.md`: cleanup commit form and stub-row deletion per D4; `testing.md F-1` example and "Documentation reviewer verdict" line per D9 (AC-4, AC-14)

### Task 5: review-policy.md, external-review.md, design-system.md, ux-principles.md
Material risk: change: reviewer responsibility table rewrite
- [x] `review-policy.md`: "Reviewer responsibility", DoD, fan-out, inputs, creator-fix wording per D2/D9 (AC-12..AC-14)
- [x] `external-review.md` creator-fix wording (AC-12)
- [x] `design-system.md`: owner lines, UX rule survival and token-decision rules per D11, design-system flow under `design_system` per D14 (AC-12, AC-20)
- [x] `ux-principles.md` owner lines (AC-12)

### Task 6: Templates
Material risk: artifact: config/state template keys, verified by `node tests/run.js`
- [x] `t_config.yaml`: `cleanup` per D6, `documents.design_system` per D14, `ux_spec` comment narrowed (AC-6, AC-20)
- [x] `t_state.json`: top-level `"cleanup": "{{CLEANUP}}"`, `documents.design_system` placeholder (AC-6, AC-20)
- [x] `t_decisions-log.md`: cleanup checkpoint and record one-line forms per D4 (AC-4)
- [x] `t_audit.md`, `t_c4-model.c4`, `t_c4-views.c4`, `t_custom-design-rules.md`, `t_test-plan.md`, `t_manual-steps.md`, `t_review.md`, `external-review/t_prompt-external-design.md`: removed role names per audit (AC-11, AC-12)

### Task 7: Migration 14.0.0
Material risk: migration: rewrites active sprint state.json and deletes retired generated views
- [x] New `.asd/migrations/14.0.0.js` per D13, header comment stating what it does and why (AC-18)

### Task 8: Phase chain, cleanup workflow and creator-free phase workflows (cleanup side)
Material risk: change: cleanup workflow steps and routing into retro
Reachability: impl-review (standard) / design-promote (lite) writes `NEXT: cleanup` at exit; asd-sprint reads it against `next[<phase>]` from the live definition at Step 3
- [x] `.asd/workflows/standard.json`, `lite.json` per D1 and D9 (AC-1, AC-13)
- [x] New `.asd/workflows/asd-phase-cleanup.md` (owner inline orchestrator, dispatches `asd-advisor` only on escalation; steps per D3-D7; lite binding "advanced from … design-promote (lite)") and `.asd/skills/asd-phase-cleanup/SKILL.md` (AC-1..AC-6)
- [x] `asd-phase-impl-review.md`: exit, return, UI predicate owner, tester routing, reviewer input rule per D1/D8/D9 (AC-1, AC-13, AC-16)
- [x] `asd-phase-design-promote.md`: exit/return per D1, promotion inline per D2/D11, design-system promotion per D14 (AC-1, AC-12, AC-20)
- [x] `asd-phase-retro.md` entry, `asd-phase-pr.md` precondition note per D1 (AC-1)
- [x] `.asd/hooks/session-start.js` design-block collapse test adds `design_system` per D14 (AC-20)

### Task 9: Creator-free phase workflows (design side, routing)
Material risk: change: inline creator steps and advisor consult sites
- [x] `asd-phase-scope.md`: stage (b) research inline, Owner line, Dispatch, `{{CLEANUP}}`/`design_system` seeding (sentence without the word "ask") per D2/D6/D14 (AC-6, AC-12, AC-20)
- [x] `asd-phase-audit.md`: inline audit, batched-read plan for the orchestrator, Dispatch per D2 (AC-12)
- [x] `asd-phase-design.md`: inline drafts with per-section lock-in per D12, design-system gate under `design_system`, rule survival "Rules" per D11/D14 (AC-12, AC-20)
- [x] `asd-phase-design-review.md`: roster `quality`/`efficiency`, inline fixes, advisor consults per D9/D10 (AC-12, AC-13, AC-17)
- [x] `asd-phase-impl.md`, `asd-phase-impl-test.md`: routing per D8, advisor consults at FAILED/stalemate relays per D10 (AC-16, AC-17)

### Task 10: Skills
Material risk: change: standalone skills authored inline within the byte cap
- [x] `asd-concept`, `asd-stack`, `asd-design-system` SKILL.md: delegation → inline steps, per-section lock-in per D12, net-shrink per D11 (AC-12)
- [x] `asd-sprint` SKILL.md: Step 3 `cleanup` returns `NEXT: retro`; advisor consult on relayed `QUESTION`/`FAILED` per D10 (AC-1, AC-17)
- [x] `asd-init` SKILL.md: `cleanup` and `documents.design_system` in fresh step 2 / 8a; Node/`designmd-*` keyed on `design_system`; :74 owner (AC-6, AC-12, AC-20)
- [x] Phase SKILL.md descriptions naming removed agents or `retro` as successor (scope, audit, design, design-review, design-promote, impl-review) (AC-1, AC-12)

### Task 11: README.md and AGENTS.md
Material risk: artifact: mirror counts and tables, verified by `node tests/run.js` §16 and the README tier-table tests
- [x] `README.md`: phase counts/flowchart/tables with cleanup, roster/model table (both providers), reviewer table/tokens, config schema (`cleanup`, `documents.design_system`), folder map counts, FAQ per audit sites (AC-7, AC-19)
- [x] `AGENTS.md` tail: phase counts, skill count, agent roster sentence (AC-7, AC-19)

### Task 12: Adapt tests to the new roster and chain
Material risk: artifact: test fixtures and pins, verified by `node tests/run.js`
Test-only: tests/run.js
- [x] Update pins and fixtures listed in audit "Tests" (amendment) and "Risks" (removed agents, reviewer keys, routing `critical`, memory files, `Seven`, scope Owner pin, 4.0.0 fixture name) to the code of Tasks 1-11 (AC-7, AC-19)

### Task 13: Lite impl-review reviews one wave
Material risk: change: division rule split per workflow
- [x] `sprint-lifecycle.md` "Review iteration counters" Division/Division point: under `lite` the division is always one wave holding the whole scope, whatever `review-waves` measures; `standard` unchanged (AC-21)
- [x] `asd-phase-impl-review.md` step 1c: lite writes the single-wave division; `.asd/runtime.js` `review-waves` accepts that one-wave division for lite (e.g. a flag the step passes), its measured fields still recorded (AC-21)
- [x] Mirrors: `review-policy.md` / `core.md` "Review wave" wording if it states size-only division, `asd-phase-impl-review/SKILL.md` description, `README.md` (:15, :194, :255, :455 and any other site a grep finds) (AC-21)

### Task 14: Tests for the lite single-wave rule
Material risk: artifact: test pins, verified by `node tests/run.js`
Test-only: tests/run.js
- [x] Adapt or add asserts so `review-waves` accepts a one-wave division for lite over an above-threshold scope and still rejects it for standard; pins on the division prose follow Task 13 (AC-21)

## Risks
- The orchestrator/impl D13 cap has 8,930 B headroom and standalone skills 352 B: Tasks 3, 4, 10 check loads with `node tests/run.js --filter` before committing.
- Untrusted web content now enters the orchestrator (stage-(b) research, tech-reference and DESIGN.md fetches); `core.md` "Untrusted-data boundary" applies unchanged.
- This sprint dogfoods its own changes: after wave 1, impl-review's `combined` is the new composition, and cleanup runs at the end (absent snapshot = enabled).

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | 1 |
| 2 | 2, 3, 4, 5, 6, 7 |
| 3 | 8, 9, 10 |
| 4 | 11 |
| 5 | 12 |
| 6 | 13 |
| 7 | 14 |

- Task 1 changes the dispatch contract (agent roster, routing tiers) every later wave is dispatched under, so it is alone in wave 1.
- Tasks 2-7 write the rule homes Tasks 8-10 cite; Task 11 mirrors the finished canon; Task 12 adapts tests to all of it.

## Out of scope
- A dead-code detector dependency; a review pass over cleanup changes.
- Migrating agent memory of removed agents (deleted as ownerless, user decision).
