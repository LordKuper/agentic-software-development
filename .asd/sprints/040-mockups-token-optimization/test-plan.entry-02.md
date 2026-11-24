# Test plan entry 02 — sprint 040-mockups-token-optimization

Rotated at entry 3. Entry 2 analysed `17dae23b`.

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

`node tests/run.js contract-workflows --filter 'sprint-040 AC-8: sprint startup'` matched one test and exited 1 on the pre-change `1889c3e` snapshot because `Orchestrator phase entry` could not be resolved. The rewording control passed 1/1, exit 0. The implemented test also passed in the impacted run for entry 2.
