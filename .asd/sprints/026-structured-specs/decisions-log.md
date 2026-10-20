---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), .asd/project/retro-backlog.md (retro row dispositions), state.json (state), reviews/ (verdicts)
---

# Decisions Log

Per-sprint, append-only. Never edited or removed. Created at `scope`, rotated at phase entry (`.asd/rules/artifact-layout.md` "Decisions log"), archived with the sprint.

## Entry format

```markdown
## YYYY-MM-DD — <one-line summary>

- **Decision**: <what was decided> (≤3 sentences)
- **Rationale**: <why> (≤3 sentences)
- **Affected docs**: <links> (unrestricted)
```

A no-op skip, other zero-content decision, dispatch routing line or failed-dispatch reconstruction uses the one-line form instead:

```markdown
- YYYY-MM-DD — <phase> skipped: <reason>
- YYYY-MM-DD — route <taskIds>: <tier>, dispatch HEAD <sha>[; risk <declaration>]
- YYYY-MM-DD — reconstruction: landed <ids>; re-dispatched <ids>
- YYYY-MM-DD — stall: <agent> <dispatch ids>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-10-20 — sprint opened

- **Decision**: sprint 026 opened on branch sprint/026-structured-specs, workflow lite (user choice; standard was recommended). Sprint 025 archived by closure write (PR 61 merged, v13.8.0 published).
- **Rationale**: user chose lite over the recommended standard; documents.audit=auto resolves true (contract and behaviour impact), prd/ux_spec/adr/c4 disabled by config.
- **Affected docs**: state.json

- 2026-10-20 — retro intake verified at HEAD aafbdf13: 025#A-1 open (sprint-lifecycle.md "PR phase" step 2 says `sprint closure`, asd-phase-scope.md step 1 says `sprint-closure`); 025#A-3 open (git-strategy.md has no HEAD-moving ban for dispatched agents); 025#P-1 open (no edge-semantics rule for plan decisions)

- 2026-10-20 — scope gate partial answers (user): one sprint, no split; optimizations O1-O4 all in this sprint (O4 = split sprint-lifecycle.md per phase); retro rows 025#A-1, 025#A-3, 025#P-1 included; structures sent back for revision: declarative facts as explicit structure (JSON) where feasible

## 2026-10-20 — scope gate

- **Decision**: scope accepted as sprint.md AC-1..AC-13, one sprint. Form: specs stay Markdown with a fixed section set per category (agent, phase workflow, standalone skill), JSON structures inside sections for declarative facts; protocol in a new `.asd/rules/agent-protocol.md` loaded by every role. O1-O4 and retro rows 025#A-1, 025#A-3, 025#P-1 included.
- **Rationale**: user revised the form twice (JSON where feasible, then Markdown with JSON inside sections) and asked whether agents see the signal vocabulary; they do not at baseline (role-scoped context grants agents only their phase section of sprint-lifecycle.md), so the protocol gets its own universally loaded home. Exact keys and types are settled in plan.
- **Affected docs**: sprint.md, .asd/project/retro-backlog.md

## 2026-10-20 — audit contradictions settled

- **Decision**: C-1 phase form gains `## Rules` for agent-facing phase rules; C-2 sprint-lifecycle split by readership (cross-phase sections stay); C-3 AC-13 means meaning not carriage, agent-protocol.md and AC-7 home join the measured total; C-4 reviewers never emit ADVICE_NEEDED, creators list it, relay branches made consistent. sprint.md Form, AC-6, AC-8, AC-13 reworded to match.
- **Rationale**: user chose the recommended option on each hard contradiction gate (audit.md Contradictions).
- **Affected docs**: audit.md, sprint.md

- 2026-10-20 — audit gate (adaptive, orchestrator): all t_audit.md sections present; 2 contradictions settled by canonical precedence, 4 by user; AC-1..AC-13 deliverable per Gaps; NEXT plan (lite)

## 2026-10-20 — plan accepted

- **Decision**: `plan.md` accepted: D1-D10, Tasks 1-8 in 4 waves (wave 1 protocol/contract alone, wave 2 five parallel restructure Tasks, wave 3 lifecycle split and mirrors, wave 4 test-only). No stubs touch scope (audit has no Related open stubs).
- **Rationale**: user `accept` at the plan gate.
- **Affected docs**: plan.md

- 2026-10-20 — route Task 1: critical, dispatch HEAD f35eaeef; risk change: public contract
- 2026-10-20 — route Task 2, Task 3, Task 4, Task 5, Task 6: critical, dispatch HEAD d9462a7e; risk change: meaning-preserving restructure
- 2026-10-20 — route Task 7: critical, dispatch HEAD 15dee4f8; risk change: rule relocation
- 2026-10-20 — route Task 8: standard, dispatch HEAD 3f96033e; risk artifact: content-contract pins via node tests/run.js
- 2026-10-20 — route impl assessment fix-1: standard, dispatch HEAD 78e80d1c; risk artifact: citation repair via node tests/run.js

## 2026-10-20 — impl assessment

- **Decision**: initial impl accepted adaptively: Tasks 1-8 done and ticked, fix-1 restored the reviewer "Scope hand-off" citation and the tester fresh-instance citation; build (sync --check) and lint clean; authorised paths only; suite 286/286 at 941b9075; D10 measured 376,476 → 360,274 B (−16,202 B). Flagged choices accepted: single-quoted section names inside JSON (D1 backslash ban); extra workflow role payload keys (admitted by review-policy.md and agent-protocol.md "Dispatch payload"); self-assigned `[GATE …]` labels are labels only, checkpoints.md stays the class SSoT; contradictory baseline signals resolved to ABORT for missing preconditions (BA input missing, UX spec unreachable); asd-init return MODE→REPO plus STATUS/NEXT; core.md untrusted-data boundary adds .asd/workflows/; BA scope grant dropped (scope dispatches no agent); consumer retro-backlog comment unmigratable (audit Gaps). No earlier decisions-log disposition departed from. No sprint stubs.
- **Rationale**: checkpoints.md adaptive evidence complete; standalone skills grew +7.7 KB (JSON sections) but the D10 total still drops.
- **Affected docs**: plan.md, state.json
- 2026-10-20 — route impl-test entry 1: standard, dispatch HEAD 2fe18dcb; risk artifact: content-contract pins via node tests/run.js
- 2026-10-20 — impl-test: defects D-1, D-2 → impl test-fix (digest bfbd526cde1e94a5508416c8218b0203d37e75f43971147c5ac770a7593a4f4b); suite 287/287, entry 1 added 1 test, removed 0
- 2026-10-20 — route test-fix D-1, test-fix D-2: memory-fix to owners asd-reviewer-correctness, asd-tester-critical, dispatch HEAD b421aacf; risk artifact: memory leftover term via grep
- 2026-10-20 — impl test-fix: defects D-1, D-2 resolved (memory-fix by owners; da0f6e68, a5e0000e)
- 2026-10-20 — route impl-test entry 2: standard, dispatch HEAD 5abc40b7; risk none via node tests/run.js
- 2026-10-20 — impl-test: impacted set green (287/287), entry 2 0/0 tests (entry 1: 1 added, 0 removed)

- 2026-10-20 — impl-review division: 3 waves (3,911 lines, 54 files, 777,777 bytes vs thresholds 3,000/34/180,000): wave 1 rules, templates and mirrors (18 files); wave 2 agents and agent memory (17); wave 3 phase workflows, standalone skills and tests/run.js (19)
- 2026-10-20 — impl-review wave-1/iter-01: combined CONCERNS (F-1 medium), external CONCERNS (1 high), same defect: "Input sources" requirements/ux rows lack decomposition-disabled flat paths → impl review-fix (review_fixes_pending wave-1/iter-01)
- 2026-10-20 — route review-fix wave-1/iter-01: standard, dispatch HEAD e73f9d18; risk artifact: path table via node tests/run.js
- 2026-10-20 — impl fix for wave-1/iter-01: findings resolved (F-1, 1; 93160397)
- 2026-10-20 — route impl-test entry 3: standard, dispatch HEAD 18122b93; risk none via node tests/run.js
- 2026-10-20 — impl-test: impacted set green (287/287), entry 3 1/0 tests
- 2026-10-20 — impl-review wave-1/iter-02: combined APPROVE (one transcription, F-2), external APPROVE; wave 1 roster met → wave 2
- 2026-10-20 — impl-review wave-2/iter-01: combined CONCERNS (F1, F2 low), external CONCERNS (E1, E2 high, E3 medium) → impl review-fix (review_fixes_pending wave-2/iter-01)
- 2026-10-20 — route review-fix wave-2/iter-01: critical, dispatch HEAD 3bdb6edb; risk change: input requiredness and standalone mode
- 2026-10-20 — impl fix for wave-2/iter-01: findings resolved (F1, F2, E1, E2, E3; b2e4608e). Open item for the wave-3 fix round: asd-phase-design-promote.md standard Architect/UX dispatches omit inputs.requirements although both agents require it (flagged by the fix dev)
- 2026-10-20 — route impl-test entry 4: standard, dispatch HEAD b3cfe286; risk none via node tests/run.js
- 2026-10-20 — impl-test: impacted set green (288/288), entry 4 1/0 tests
- 2026-10-20 — impl-review wave-2/iter-02: combined APPROVE, external APPROVE; wave 2 roster met → wave 3
- 2026-10-20 — impl-review wave-3/iter-01: combined CONCERNS (F1 high, F2-F6 low), external APPROVE (latched) → impl review-fix (review_fixes_pending wave-3/iter-01); F1 covers the open design-promote requirements item
- 2026-10-20 — route review-fix wave-3/iter-01: standard, dispatch HEAD 32dafff2; risk artifact: payload keys and consistency via node tests/run.js; tester chain F6: standard; risk artifact: content-contract pins via node tests/run.js
- 2026-10-20 — impl fix for wave-3/iter-01: findings resolved (F1-F5 558722d8, F6 6cc4c42b); reviewer-question gate marked in both review workflows
- 2026-10-20 — route impl-test entry 5: standard, dispatch HEAD 118b98ea; risk none via node tests/run.js
- 2026-10-20 — impl-test: impacted set green (289/289), entry 5 0/0 tests
- 2026-10-20 — impl-review wave-3/iter-02: combined APPROVE, external latched APPROVE; wave 3 (last) roster met → step 9 terminal full suite pending

## 2026-10-20 — scope amendment AC-14..AC-16

- **Decision**: AC-14 (section-scoped context bundle via `runtime.js context` and a JSON grant table), AC-15 (remove JSON restating Steps; skills ≤ 61,051 B, workflows ≤ 125,501 B) and AC-16 (per-dispatch load ≥ 30% below `main`, plan D13) added to sprint 026; Task 9 in wave 5, Tasks 10-12 in wave 6, Task 13 in wave 7 (plan D11-D13). Accepted after the impl-review division point: floor_base=wave-3/2; wave 3 `latched` cleared.
- **Rationale**: measurement showed total spec bytes −4% but per-dispatch reads up (dev +6%, tester +12%, reviewer-combined +9%) because agents now open the protocol, a workflow and still `sprint-lifecycle.md` whole; skills +12%, workflows +7%. User chose to extend 026 over a follow-up sprint.
- **Affected docs**: sprint.md, plan.md, state.json
- 2026-10-20 — route Task 9: critical, dispatch HEAD 35264ddf; risk change: public contract
- 2026-10-20 — Task 9 accepted: D13 ratios dev 0.423, tester 0.447, reviewer-combined 0.525, orchestrator 0.650 (all ≤ 0.70); flagged items assigned: core.md untrusted-data boundary → Task 10, README runtime line → Task 11 (plan amended, waves unchanged)
- 2026-10-21 — route Task 10, Task 11, Task 12: critical, dispatch HEAD c963b99f; risk change: reading contract / dispatch procedure / meaning-preserving trim
