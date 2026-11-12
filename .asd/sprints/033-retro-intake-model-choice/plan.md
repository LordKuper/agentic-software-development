---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

## Overview
Two strands: model choice per `research.md` approach B (AC-1..AC-8) and the retro intake (AC-9..AC-36; AC-22 and AC-29 retired). Tasks are cut by rule-doc ownership — every rule doc several ACs edit sits in one Task — and `.asd/runtime.js` is split across waves 1-3 by function group. Devs edit no `tests/run.js`; impl-test adapts the content-contract tests. Release 14.5.0.

Decided names and shapes every Task uses (the home Task in brackets):
- Tier `escalated` above `standard` [Task 1]: `route-task` routes change risks `migration`, `broad-reasoning`, `cross-domain` there (`broad-reasoning`, `cross-domain` become reserved classes beside `migration`); dispatched as `asd-dev-escalated` (Claude opus/high; Codex = base sol/high). Ladder: `route-task` input `effortRaised` (boolean, default false); a failed objective check after its correction attempt with `effortRaised` false keeps the prior tier and returns `raiseEffort: true`, `reason: effort-step`; with `effortRaised` true it moves one tier up (mechanical → standard → escalated). `task_routing[id]` gains `raise_effort` (boolean). On Claude Code the orchestrator passes the agent's declared effort one level higher as the dispatch `effort` parameter (new semantic op argument in `providers.md` "Semantic operations"); Codex ignores it.
- Variant suffixes [Task 1]: `VARIANT_SUFFIXES = ['escalated', 'mechanical', 'runner']` (`standard` dropped — policy forbids it).
- `asd-tester-runner` [Task 5]: Claude haiku/medium, Codex luna/high; runs a named suite scope and reports pass/fail with the runner's first failure lines — no authoring, pruning or triage. Dispatched for impl-review's terminal full suite and for an impacted re-run with no test change; any red run goes to the base `asd-tester` for triage.
- `asd-scout` [Task 1]: read-only (Read, Glob, Grep), Claude haiku/medium, Codex luna/medium, maxTurns 100; input a question and paths, return `COMPLETED` with a path:line-cited summary body, no writes. Dispatched by audit step 2, plan step 4 and cleanup candidate scan; the orchestrator reads every cited section it relies on before deciding.
- External Review wrapper [Task 2]: Claude haiku/high (Codex block untouched).
- Runtime commands and flags: `emit-manifest --rename-map <file>` and whole-file-deletion collapse lines `# collapsed: <path>: deleted, <N> lines` / `# collapsed: <path>: <K> rename-map substitutions` [Task 7]; `persist-review --floor <low|medium|high|critical>` drops below-floor rows, records `dropped: <n>` and rewrites an all-dropped CONCERNS to APPROVE [Task 7]; `commit-check --subject "<header>" [-- <paths…>]` fails on a header over 50 characters or a memory-check hit among the named staged paths [Task 8]; `impl-test-close --test-plan <path> --entry <N> --decisions <path> --line <text>` [Task 8]; `design-tokens --design <DESIGN.md> --html <design-system.html>` rewrites the regions between `<!-- asd:tokens:start -->`/`<!-- asd:tokens:end -->` and `<!-- asd:vars:start -->`/`<!-- asd:vars:end -->` [Task 9]; timing outcome `continued` and summary gap key `idle` [Task 8].
- One-command commit form [Task 5]: `git add <paths> && node .asd/runtime.js commit-check --subject "<header>" -- <paths> && git commit -m "<header>" [-m "<body>"]`.
- Rotate subject [Task 5]: `chore(sprint): rotate log for <phase>`.
- Review reset folders [Task 4]: a reset moves `reviews/<node>/` to `reviews/<node>.reset-<n>/` (n = next free ordinal) before the first new iteration.
- Mockups [Task 6a, 6b, 10]: `<sprint>/design/mockups/` → `docs/ux/mockups/` (decomposition: `mockups/<subsystem>/`); Claude Code with the Artifact tool: one subfolder per Design canvas holding `project/canvas.json` and `project/*.dc.html`, published from it, plus `mockups/index.md` linking each canvas; otherwise one `<screen>.html` per screen or state (`t_html-shell.html`); only with `ux_spec` enabled; `lite`: made at scope.
- Scope settings change [Task 4, 10]: optional `sprint.md` line `Settings change: <key>=<value>[, …]` for keys audit or design read; scope applies it via `asd-init` sprint-mediated mode before step 3a's freeze; the scope gate approves it.
- Migration `.asd/migrations/14.5.0.js` [Task 6a]: deletes `.claude/agent-memory/<name>/` for every name in earlier migrations' retired lists that is not a live canonical agent or variant; rewrites `.asd/project/commands.yaml` `designmd-install` from exactly `npm install @google/design.md` to `npm install --no-save @google/design.md`.

Orchestrator-only lines:
- After each wave's last canon-editing dispatch: `node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply <generated view paths>` and commit the views (`sprint-lifecycle.md` "Self-hosting").
- After wave 4, before impl's completion gate: the orchestrator checks `research.md` F1-F12 against canon and appends to `audit.md` "Gaps" one line per F-N — reflected (file) or rejected (one-line reason) (AC-7).

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.
`node .asd/sync.js --check` clean after the final view sync; README model-tier and roster tables match rendered canon.

### Task 1: Routing tier, effort step, variants, scout agent
Material risk: change: routing ladder edges (effort step vs tier climb, priorTier clamp)
Material risk: change: public contract (route-task input/output fields, task_routing key)
- [x] `.asd/runtime.js` `routeTask`: add tier `escalated`, reserved classes `broad-reasoning`, `cross-domain`, `effortRaised` input, `raiseEffort` output, `reason: effort-step`; keep fail-closed and no-downgrade; legacy `critical` still reads `standard` (AC-3, AC-4).
- [x] `.asd/sync.js` `VARIANT_SUFFIXES` per Overview (AC-1, AC-3).
- [x] `.asd/agents/asd-dev.md`: `escalated` variant (AC-3, AC-8).
- [x] New `.asd/agents/asd-scout.md` per Overview, description in the `<what>; <purpose>. Not: …` form (AC-5, AC-8).
- [x] `.asd/templates/t_state.json`: document `raise_effort` in `task_routing` entries if the template carries an entry shape; else no change (AC-4).

### Task 2: FAIL semantics, minor test-only path, external floor, wrapper model
Material risk: change: workflow gate (FAIL vs CONCERNS escalation boundary)
- [x] `.asd/rules/review-policy.md`: FAIL only for a fix needing a design decision that changes requirements or complicates the architecture; map the escalation list's new-abstraction, API-contract and complexity rows onto it; every other finding CONCERNS, decided by the orchestrator, advisor consulted on an ambiguous case; stalemate FAIL kept as its own route (AC-28).
- [x] Same file: a checklist finding whose every location is a test file and which the orchestrator judges behaviour-neutral takes the minor test-only path whatever its severity (AC-20).
- [x] `.asd/agents/asd-reviewer-quality.md`, `asd-reviewer-efficiency.md`, `asd-reviewer-combined.md`, `.asd/templates/t_prompt-external-design.md`, `t_prompt-external-impl.md`: replace severity-driven "= FAIL" lines and FAIL format text with the new boundary (AC-28).
- [x] `.asd/rules/external-review.md`, `.asd/agents/asd-external-review.md`: floor applied by `persist-review --floor`, stalemate compares floored sets; wrapper Claude model haiku/high (AC-2, AC-25, AC-28).

### Task 3: Provider and core model text
Material risk: artifact: mirror prose (verified by `sync.js --check` and tests/run.js tier-sentence checks)
- [x] `.asd/rules/providers.md`: grant row for `asd-scout`; variant paragraph names `mechanical`, `escalated`, `runner`; `asd-tester` routing sentence (base for authoring/triage, `runner` for runs); routing paragraphs for `escalated`, the effort step and the dispatch `effort` argument (Claude Code only) (AC-1, AC-3, AC-4, AC-5, AC-8).
- [x] `.asd/rules/core.md`: glossary "Main orchestrator" delegation list adds scout scans and orchestrator-applied review findings outside the dev allowlist (AC-5, AC-10).

### Task 4: Sprint lifecycle rules
Material risk: change: workflow gate (suite-run reuse, review reset, scope-time settings change)
- [ ] `.asd/rules/sprint-lifecycle.md` "Orchestration and adaptive gates": delegation list adds `asd-scout` (AC-5).
- [ ] "Plan file format": Material risk reserved classes `broad-reasoning`, `cross-domain`; Settings change declaration points at the scope-time line for keys audit or design read (AC-3, AC-36); Decomposition rules gain AC-11's bullet: a plan moving a responsibility between roles, adding a delegation or removing a routing clause lists, per affected file, each sentence attributing it to a role, the delegate's write classes read from its definition, and each case the clause routed (AC-11).
- [ ] "Self-hosting": review-fix findings outside the dev allowlist are applied by the orchestrator (AC-10).
- [ ] "Rollback reset" and "Scope amendment": reset moves folders aside per Overview; an amendment accepted after design-review and before plan resets `reviews.design` (`standard`) (AC-17).
- [ ] "Impacted test set": home of the content-scoped reuse rule — an earlier green run at or above the needed scope, after the last latch clear, counts as the next required impl-test or terminal run when no code, test or stub path changed since its HEAD; the full suite runs once or is reused (AC-23).
- [ ] "Operation timing": continuation close, repeat-close skip, cascade close, repeat suite run new id, handoff user-wait (AC-18, AC-26).
- [ ] "State recovery" "Failed dispatch" anchor line covers routed tiers `runner`/`escalated`; `ux` input row adds the mockups folder (AC-1, AC-34).

### Task 5: Agent protocol, commits, tester
Material risk: change: public contract (one-command commit form)
- [x] `.asd/rules/agent-protocol.md` "Return": stop every background process before any signal; name any not stopped in the body (AC-13).
- [x] `.asd/rules/git-strategy.md`: header limit ≤ 50 characters, one-command form per Overview with `commit-check` (AC-12, AC-21).
- [x] `.asd/skills/asd-sprint/SKILL.md`: rotate subject per Overview (AC-12).
- [x] `.asd/agents/asd-tester.md`: `runner` variant per Overview; an AC deviation without a failing test becomes a `D-N` row (`Failing test: none (AC-N)`, Symptom naming the AC and the deviation), never rated acceptable; a redundancy removal names the surviving test and branch; a repeat suite run opens a new timing id (AC-1, AC-15, AC-16, AC-18).
- [x] `.asd/templates/t_test-plan.md`: Defects row and removal reason shapes for AC-15, AC-16; Suite run records HEAD and scope (AC-15, AC-16, AC-23).

### Task 6a: Design system, migration, init
Material risk: change: migration (memory dirs, commands.yaml value)
- [x] `.asd/rules/design-system.md`: per-subsystem token prefix (AC-30); delta prose and runtime-token orphan exclusions (AC-31); generator use (AC-32); no-save install wording (AC-33); mockups home per Overview (AC-34); its "Violation = FAIL" lines per AC-28 (AC-28).
- [x] `.asd/templates/t_design-md-delta.yaml` prose section and prefix example; `t_design-system.html` regeneration markers and a `:root` vars block; `t_commands.yaml` no-save install (AC-30..AC-33).
- [x] `.asd/skills/asd-design-system/SKILL.md`: generator step and prefix guidance; `.asd/skills/asd-init/SKILL.md`: no-save install, scope as a sprint-mediated invoker (AC-30, AC-32, AC-33, AC-36).
- [x] `.asd/skills/asd-update/SKILL.md` migration contract: memory-dir removal and `commands.yaml` value rewrites allowed (AC-19, AC-33).
- [x] New `.asd/migrations/14.5.0.js` per Overview (AC-19, AC-33).

### Task 6b: Artifact layout
Material risk: artifact: decided path and wording edits (verified by tests/run.js layout checks)
- [x] `.asd/rules/artifact-layout.md`: mockups paths in both path maps and the sprint tree; Agent memory: retiring release removes the dir; Test plan row shapes for AC-15/AC-16; its "Violation = FAIL" lines per AC-28 (AC-15, AC-16, AC-19, AC-28, AC-34).
- [x] `.asd/templates/t_ux-spec.html`: mockups referenced from the folder, not embedded (AC-34).

### Task 7: Runtime review pipeline
Material risk: change: public contract (manifest diff shape, persist-review floor)
Reachability: impl-review step 6 writes the collapsed diff via `emit-manifest`; reviewers read it in the same iteration
- [ ] `.asd/runtime.js` `positiveInteger` accepts leading zeros (AC-9).
- [ ] `writeManifestDiff`: collapse whole-file deletions and, with `--rename-map`, pure map-substitution hunks; `fingerprint` hashes the map; `numstatLines`/`reviewWaveCount` count only the remainder (AC-35, AC-24).
- [ ] `persistReview` `--floor` per Overview (AC-25).
- [ ] Design-review UI predicate matches `design/mockups/**` (AC-34).

### Task 8: Runtime timing and commit commands
Material risk: change: ledger close semantics (continuation vs repeat close)
- [ ] `.asd/runtime.js` `timingAppend`: continuation, repeat-close skip, cascade close, outcome `continued`; `timingSummary` gaps `idle` (> `SLOW_MINUTES` uncovered phase window) (AC-18, AC-26).
- [ ] `commit-check` command per Overview, reusing `memoryCheck` with a path filter (AC-12, AC-21).
- [ ] `impl-test-close` command per Overview (AC-27).

### Task 9: Design token generator
Material risk: change: parser edge (DESIGN.md front-matter subset)
- [ ] `.asd/runtime.js` `design-tokens` command per Overview: parses DESIGN.md front matter (zero-dependency subset: nested maps of scalars), rewrites only the marked regions, fails naming the line on unsupported YAML (AC-32).

### Task 10: Phase workflows
Material risk: change: workflow gate (memory-before-FAIL order, orchestrator-applied findings, scope-time mockups and settings)
- [ ] `.asd/workflows/asd-phase-impl-review.md`: step 6 `--iteration <N>`; step 8 memory findings before Any FAIL, minor test-only per AC-20, FAIL grouping per AC-28; step 9 terminal suite via `asd-tester-runner`, reuse per AC-23 (AC-1, AC-9, AC-14, AC-20, AC-23, AC-28).
- [ ] `asd-phase-impl.md`: 5a tier map adds `escalated`, effort step dispatch; review-fix orchestrator-apply branch; step 9 round diff names each orchestrator-edited path by finding id (AC-3, AC-4, AC-10).
- [ ] `asd-phase-impl-test.md`: step 8 reuse; AC deviation and removal shapes; entry close via `impl-test-close`; impacted re-run with no test change via `asd-tester-runner` (AC-1, AC-15, AC-16, AC-23, AC-27).
- [ ] `asd-phase-pr.md`: suite skip cites the "Impacted test set" home (AC-23).
- [ ] `asd-phase-scope.md`: scope-time settings change before 3a; `lite` mockups at scope when `ux_spec` enabled; `.asd/templates/t_sprint.md`: optional `Settings change:` line (AC-34, AC-36).
- [ ] `asd-phase-audit.md`, `asd-phase-plan.md`, `asd-phase-cleanup.md`, `.asd/skills/asd-phase-audit/SKILL.md`: `asd-scout` dispatch rows and Owner lines (AC-5); cleanup's one-command mirror (AC-21).
- [ ] `asd-phase-design.md`, `asd-phase-design-promote.md`, `asd-phase-design-review.md`: mockups step and promotion, delta prose apply, `design-tokens` rebuild, FAIL grouping per AC-28 (AC-28, AC-31, AC-32, AC-34).

### Task 11: README, roster, release
Material risk: artifact: mirror tables (verified by tests/run.js README checks)
- [ ] `README.md`: roster (8 roles + 3 variants), model-tier table both providers, runtime command list, mockups folder map, orchestrator session-model guidance (Opus `medium` default, Fable for long unattended or large runs) and the `haiku` alias note (AC-6, AC-8).
- [ ] `AGENTS.md` agent count line below `<!-- asd:end -->` (AC-5).
- [ ] `CHANGELOG.md` 14.5.0 section; `.asd/release-manifest.json` `asd_version` 14.5.0 and `canon_hashes` entry for `asd-scout` (AC-5).

## Risks
- AC-28 changes how every reviewer escalates; Task 2 lands it in wave 1 so the workflows of Task 10 cite settled text.
- `runtime.js` is edited in three waves; each wave's dev reads the file at dispatch HEAD.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | Task 1, Task 2, Task 3, Task 5, Task 6a, Task 6b |
| 2 | Task 4, Task 7, Task 10 |
| 3 | Task 8 |
| 4 | Task 9, Task 11 |

- Task 10 cites the runtime flags of Tasks 7-9 and the rule homes of Tasks 2-6b by the names in Overview.
- Task 11 mirrors every canon change, so it runs last.
- Tasks 7, 8, 9 share `.asd/runtime.js`, so each takes its own wave.
