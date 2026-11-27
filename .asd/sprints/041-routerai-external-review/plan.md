---
responsibility:
  owns: task breakdown, task status, sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, standing DoD
  delegates_to: reviews/; persistent docs
---

# Plan

## Overview

Reuse the existing named Codex profile route to select RouterAI and the requested model, adding only the missing setup, verification and compatibility behavior. Add a researcher role and route research and solution-design work to it while retaining user decisions and gates with the orchestrator. Address both GitHub issues and all nine accepted retrospective items. Divide work by non-overlapping ownership, order shared contract changes before their consumers, and validate generated views for both providers.

## Definition of Done

Standing DoD applies (`sprint-lifecycle.md` "Plan file format").

### Task 1: External review and timing runtime
Material risk: change: public contract
Material risk: change: authentication
Reachability: review phases write preflight host and route at dispatch; external wrapper reads them before invocation and carries failure scope to the next review iteration.
- [x] Cover AC-1, AC-2, AC-5, AC-8, AC-10, AC-11, AC-14 and AC-15 in `.asd/runtime.js`, `.asd/rules/external-review.md`, `.asd/agents/asd-external-review.md` and the review workflows: use the existing named Codex profile and literal provider/model overrides; normalize canonical metadata; preserve existing routes and secret boundaries; carry the actual wrapper host; classify an explicit account hold without retry while retaining scope; validate phase parents and report individual completion and shared context.
- [x] Specify timing behavior for overlapping work, nested operations, missing or closed parent, legacy ledger and retries. Attribute shared context once per wave while counting each distinct dispatch completion; report incomplete/missing context rather than inventing values. Preserve existing ledger compatibility.
- [x] Implement the terminal runner's repository-discovery check in the actual child environment, without changing global Git configuration. Use existing Codex and RouterAI tech references; verify behavior when credentials or provider are unavailable.

### Task 2: Runtime contract callers
Material risk: change: public contract
Test-only: tests/runtime-routing.test.js, tests/runtime-timing.test.js
- [x] Adapt affected test callers to Task 1's public interfaces without weakening their existing assertions. Regression-test authoring beyond caller repairs remains in impl-test.

### Task 3: Researcher and workflow contracts
Material risk: change: workflow gate
Material risk: change: broad-reasoning
Reachability: scope writes research and chosen approach at their stage boundaries; design and plan read the accepted research and the researcher return, including after interrupted dispatch recovery.
- [ ] Cover AC-3, AC-4, AC-6, AC-7, AC-12 and AC-16: define the researcher agent's tools, model tiers, role boundaries, outputs, failure recovery and both host views; route applicable research and solution-design operations through it while keeping user decisions and gates with the orchestrator.
- [ ] Update role-attribution and dispatch sites in `.asd/rules/core.md`, `sprint-lifecycle.md` (Staged solution design, Orchestration and adaptive gates, Phase table and Plan author checklist), `providers.md`, `agent-protocol.md`, `design-principles.md`, scope/design/plan workflows, affected standalone skills, agent definitions, release manifest and README. Sweep `orchestrator.*(research|design)`, `research.*(inline|orchestrator)`, `research only` and `staged solution design` and assign each actual responsibility to the right owner; preserve design authoring and user gate authority where appropriate.
- [ ] Add interactive-question fallback numbering and make triage label additions ungated without changing issue dispositions; update all call sites and README mirrors. Add the migration-fixture task-brief rule and provider-backed recovery/reconciliation/review reachability check.

### Task 4: Workflow contract callers and suite revision
Material risk: change: coverage
Test-only: tests/contract-agents.test.js, tests/contract-workflows.test.js, tests/contract-rules.test.js, tests/sync-render.test.js, tests/update*.test.js
- [ ] Adapt callers and roster assertions for Task 3. For AC-13, identify redundant workflow assertions by behavior, remove only those with named surviving coverage, and retain executable update cases. Follow the test-removal gate and record evidence; do not author unrelated new regression tests here.

Orchestrator-only action, after plan acceptance and before the terminal test runner is used: update `.asd/project/custom-coding-rules.md` to require a read-only child Git check in the same process environment as the full suite (AC-9), and commit that named project-owned path. The runtime check in Task 1 covers AC-15.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | Task 1 |
| 2 | Task 2 |
| 3 | Task 3 |
| 4 | Task 4 |

- Task 2 repairs callers immediately after Task 1. The build is `node .asd/sync.js --check`; Task 1 retains compatible interfaces until those callers are repaired, and build-dependent work waits for the wave check.
- Task 3 follows Task 1 because the research role and the review wrapper share provider and workflow contracts. Task 4 repairs its test callers before impl-test.

## Decision coverage

| Decision | Covered by |
|---|---|
| Configurable RouterAI route, existing routes retained, credentials outside repository | AC-1–2 / Task 1 |
| Codex CLI provider switch, not Claude CLI | AC-1 / Task 1 |
| Add researcher and delegate research and solution design | AC-3–4 / Task 3 |
| Add triage labels without separate confirmation | AC-7 / Task 3 |
| Include both issues and all nine retro proposals | AC-5–16 / Tasks 1–4 and orchestrator action |
