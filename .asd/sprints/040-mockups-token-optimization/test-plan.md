---
responsibility:
  owns: test approach, suite evidence and defects
  delegates_to: plan.md (tasks), sprint.md (acceptance)
---

# Test plan — sprint 040

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | be1c83b2 | full change surface |
| 2 | 17dae23b | delta since entry 1 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-5, AC-7, AC-8 · Phase startup, grants and branch references | Missing common or branch rules, stale context, or continuation after bundle build failure | `contract-workflows`, `contract-rules`, `runtime-routing`, `runtime-timing` and context check | none | Task 9 covers sprint startup and all phase entries. Existing context contracts resolve role and phase references and check required sections and phase boundaries. The named AC-8 fail-first test is recorded below. |
| AC-5, AC-7 · Compacted rules and workflows, rendered sprint skill and release hashes | Changed headings, parsed literals, review contracts or generated targets drift | `contract-agents`, `contract-templates`, `runtime-tools`, `runtime-review`, `sync-render`, `sync-cli`, `update` | none | Existing consumers validate contract shapes, review workflow inputs, runtime command flags, generated views and manifest hashes. No additional test gap surfaced. |
| AC-8 · Matched Codex usage | One workflow exceeds its threshold or the measurement drops a phase or mixes controls into totals | [Matched Codex probes](./token-baseline.md#AC-8-target-verification) and raw readings | none | At `7f4ec78`, Lite used 430,693 input tokens (30.4% lower) and Standard used 519,800 (32.0% lower). The matched runs count cached input, omit controls and cover every phase once. Control-adjusted totals are reported separately. Only tests and sprint records changed between the probe revision and this suite revision. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

No existing test qualified for removal in the delta since entry 1.

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|

Entry 2 added no tests. Test-only Task 9 had already committed the changed contracts in `972c85e`.

## Task 9 regression evidence

`node tests/run.js contract-workflows --filter 'sprint-040 AC-8: sprint startup'` matched one test and exited 1 on the pre-change `1889c3e` snapshot because `Orchestrator phase entry` could not be resolved. The rewording control passed 1/1, exit 0. The implemented test also passed in the impacted run below.

## Suite run

- Pre-strategy evidence: Task 9 self-check `node tests/run.js contract-rules contract-workflows contract-agents contract-templates runtime-routing runtime-tools runtime-timing sync-render sync-cli` passed 208/208 on its final test diff before commit. Entry 2 ran the expanded selection below on the committed tree before choosing any test work.
- Command: `node tests/run.js contract-rules contract-workflows contract-agents contract-templates runtime-routing runtime-tools runtime-timing runtime-review sync-render sync-cli update`
- Scope: impacted
- Scope evidence: The enabled safety valve traced `.asd/rules/providers.md` and its named Markdown sections through runtime context extraction and the phase and sprint entry contracts. The selection includes all changed tests, phase and review contract readers, generated sprint skill checks and the update tests that compare live release hashes. The runner, shared test support, executable runtime, hooks and migrations have no delta since entry 1. The hook tests use isolated fixtures. Eleven of fourteen areas cover the traced consumers.
- Result: pass, exit 0. 290 passed, 0 failed, 0 runner-level skips. Seven existing Windows fixture paths bypassed symlink assertions because the host could not create symlinks. Temporary Git fixtures emitted CRLF warnings.
- Lint / build: pass. `git diff --cached --check` and `node .asd/sync.js --check` exited 0. All 77 sync targets are current. `node .asd/runtime.js context-check` reported no exceeded ceilings. The implementation handoff reported agnix at 0 errors and 0 warnings.
- HEAD: 710d5a8478f4592e3e3d4f5fa5e56e0f1d08d2a2
- Provenance: `suite impl-test#2` under dispatch `impl-test entry 2`. HEAD matched before and after, with clean relevant paths including untracked files. Eligible for the impacted suite gate while code, tests and stubs are unchanged. No smoke command is configured.
- Line delta: tests +223/−41 (net 182); other +816/−825 (net -9)

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
