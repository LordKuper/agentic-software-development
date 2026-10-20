# Test plan entry 01 — sprint 026-structured-specs

Rotated narrative rows of Entry log entry 1; never edited.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Form of 12 agents, 11 phase workflows, 7 skills, `agent-protocol.md` (D1-D6, D8) | Section set/order, JSON keys, description cap, backslash, return lines drift | static/arch (content contract) | keep | Task 8 §26 form-check tests (5, fail-first proven in its commit 5664f840) cover each category data-driven; no gap |
| Retargeted pins (AC-13 meaning preservation) | A baseline rule pinned before is unpinned after the restructure | static/arch | keep | Task 8 retargeted 51 pins keeping each asserted relation; reviewed against the baseline-pinned rules: none lost. Gap found only in rules this sprint added (next rows) |
| `git-strategy.md` "Forbidden" HEAD-moving ban + "Commits" orchestrator-only squash (AC-10) | Ban or the squash actor reworded away; a dispatched agent again moves the shared HEAD | static/arch (content contract) | add | Stated requirement, no existing pin |
| `sprint-lifecycle.md` "PR phase" Closure write `sprint-closure` (AC-9) | Gate name dropped; the scope-step pin only checks scope against the home's tokens, so both lose it together unnoticed | static/arch | add | Existing pin compares the two sites, never asserts the name exists |
| `sprint-lifecycle.md` "Plan file format" edge-semantics rule (AC-11) | Clause dropped | static/arch | add | Stated requirement, no existing pin |
| `providers.md` "Role-scoped context" load line (AC-4) | Roles stop loading `agent-protocol.md` or load the wrong sections | static/arch | add | Stated requirement, no existing pin on the load line |
| D9 moved sections absent from `sprint-lifecycle.md` | Text left in two homes (workflow and rule doc) drifts | static/arch | add | Existing pins check the new homes, none checks the old home is empty |
| "Input sources" table keys (AC-7) | Key or condition lost | static/arch | none | Covered by existing sprint-lifecycle "Input sources" pin (requirements row, lite/Workflows cite) and the `payload.inputs` pins |
| Reviewers never emit `ADVICE_NEEDED` (C-4) | A reviewer lists the token | static/arch | none | Covered by §26 D6/D8 test (creators-only assertion per agent) and the protocol-row pin |
| `PLAN_DRAFT`/`PLAN_READY` removal | Retired token resurfaces | static/arch | none | Covered by §26 D6/D8 test (canon-wide scan) |
| Retro row ids rename, `Retro intake` move to scope | Citation to old home | static/arch | none | Covered by existing `sectionOf(... 'Retro row ids')` and scope step 2a pins plus the dangling-citation test |
| Generated views, README, AGENTS.md, templates | Mirror drift | build check | none | `node .asd/sync.js --check` and existing README/template pins cover; no behaviour added |

Leftover-term check (`artifact-layout.md` "Agent memory", entry 1): the sprint-022 leftover sweep covers canon and memory for its own terms and is green. For this sprint's removed names (`PLAN_DRAFT`, `PLAN_READY`, "Signal vocabulary", "Dispatch payload header", moved phase-section names, retired agent-body headings, "Operations used", "Retro intake" as a section) a grep of `.claude/agent-memory/**` found three stale references, left unedited (memory outside the tester's dir is not this agent's to edit): `asd-reviewer-correctness/project_operations-block-run-command-convention.md` (names `## Operations used`, now `Entry` `ops`); `asd-tester-critical/project_testability-envelope.md` lines 247 and 408 (name an `asd-advisor.md` `Don'ts` section, now `## Rules`/`## Tools`). No `PLAN_DRAFT`/`PLAN_READY` or moved-section hit in memory.

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no test fails the hypothetical-risk criterion on the change surface; Task 8's retargeted pins keep their asserted relations | n/a |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-026 AC-4/AC-9/AC-10/AC-11/D9 (six asserts) | mutation ban (drop `commit --amend` from the Forbidden bullet): `node tests/run.js` → exit 1, sprint-026 AC-4/AC-9/AC-10/AC-11/D9; mutation squash (restore "squash" without "the main orchestrator alone"): exit 1, same test; mutation closure (drop `sprint-closure`): exit 1, same test; mutation edge (reword the clause): exit 1, same test; mutation load (providers load line stops naming `agent-protocol.md`): exit 1, same test; mutation moved (rename `## Retro row ids` back to `## Retro phase`): exit 1, same test (plus the two citation pins it also breaks); control (reword the ban's tail, tokens kept): added test stays green; runs: 6. Every canon mutation also fails the `release-manifest.json upstream_hashes` pin by design; each was restored by `git checkout` in the same command, worktree verified clean |
