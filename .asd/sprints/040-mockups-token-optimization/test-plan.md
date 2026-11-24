---
responsibility:
  owns: test approach, suite evidence and defects
  delegates_to: plan.md (tasks), sprint.md (acceptance)
---

# Test plan — sprint 040

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | | full change surface |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-1 · Mockup migration and config schema | Upgrades change the old effective format, damage unrelated settings or fail on retry | `migrations`, `runtime-routing`, `contract-templates` | none | Existing cases cover legacy and explicit selections, absent and disabled UX, preservation, retry, invalid input and the four allowed values. |
| AC-1 · Frozen mode, paths and handoffs | Standard collapses a mockup-only sprint, Lite loses promotion, or UX-spec output embeds previews | `contract-workflows`, `contract-templates`, `contract-agents` and source trace | none | Existing contracts cover the state field, legacy state fallback, non-UI and `none`, collapse, mockup-only review and promotion, and links in UX-spec. Provider publication, recovery and HTML fallback are covered at the instruction and handoff level. |
| AC-2 · Update completion and init | The completeness offer runs at sprint entry or on previews, uses the wrong schema or changes settings without approval | `update`, `runtime-routing`, `contract-workflows` | none | Existing CLI and workflow checks cover installed config diagnostics, the post-update handoff in both modes, partial outcomes, preview and version lookup, and the absence of a sprint-entry check. |
| AC-6 · Early size check | The CLI accepts overflow, rejects the exact cap or counts phase shims | `runtime-timing`, `contract-workflows` | none | Existing tests check the exact boundary, overflow and shim exclusion, with one shared file set and byte cap. |
| AC-5, AC-7 · Context, rules, workflows and rendered views | Missing or overbroad grants, broken references, drift in reviewer or workflow contracts | `runtime-timing`, `runtime-tools`, `runtime-review`, `contract-rules`, `contract-workflows`, `contract-agents`, `hooks`, `sync-render`, `sync-cli`, context and sync checks | none | Existing tests cover parsed structure, scoped recovery and plan grants, references, reviewer records, render output and sync drift. The audit records the accepted edits and their dispositions, including the blocked owner-only memory-index edit. |
| AC-3, AC-5, AC-7 · Codex usage and file dispositions | Attribution estimates are mistaken for measured usage, or a comparison loses a phase or control | Read the audit and [matched probe evidence](./token-baseline.md) | none | Raw baseline and candidate measurements record 24 candidate probes and separate input, cache and output. The audit and file inventory document attribution, dispositions and evidence limits. |

The leftover-term search used the removed sprint-entry config check wording, UX-spec gates for authoring and promotion, old format enumeration and `.mockup-preview` selector from the diff. It included hidden provider files, agent memory and sprint history. No stale live guidance or agent-memory hit was found. Prior history and the legacy selector in the migration, pre-upgrade fallback and regression fixtures retain their compatibility purpose.

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

No prior-sprint `temporary(NNN):` tests or redundant tests qualified for removal in the affected set.

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|

Entry 1 added no tests.

## Task 6 regression evidence

Entry 1 used the tests already committed by Test-only Task 6 (`6f65ff7`). Task 6 reported these isolated fail-first runs. Each matched one test, exited 1 on the old behavior or seeded fault, and passed on the implemented behavior.

| Command | Failing test and fault |
|---|---|
| `node tests/run.js contract-workflows --filter 'frozen mockup selection'` | Frozen mockup selection reaches Standard drafts and Lite promotion independently of the UX spec. Pre-feature `474972a`. |
| `node tests/run.js contract-workflows --filter 'audit, plan and resume'` | Audit, plan and resume agree on the frozen design-block collapse and audit records every skip in one exit write. Pre-feature `474972a`. |
| `node tests/run.js runtime-routing --filter 'including none'` | Config-check requires valid values, including none, and names missing, duplicate and invalid keys. Pre-feature `474972a`. |
| `node tests/run.js update --filter 'only real update completion'` | Only real update completion offers missing settings through installed asd-init. Pre-feature `474972a`. |
| `node tests/run.js runtime-timing --filter 'split recovery and plan grants'` | Split recovery and plan grants reach only their consuming phases. Pre-feature `474972a`. |
| `node tests/run.js runtime-timing --filter 'exact standalone byte cap'` | Context-check allows the exact standalone byte cap, excludes phase shims and reports overflow. Removed the overflow guard in the isolated snapshot. |
| `node tests/run.js migrations --filter 'migration preserves the old effective'` | Migration preserves the old effective mockup mode and is idempotent. Forced the legacy UX flag on in the isolated snapshot. |
| `node tests/run.js migrations --filter 'migration rejects unresolved'` | Migration rejects unresolved legacy settings without rewriting YAML. Bypassed the scalar guard in the isolated snapshot. |

Task 6 also reworded Lite authoring in isolation. `node tests/run.js contract-workflows --filter 'frozen mockup selection'` matched one test and passed with exit 0.

## Suite run

- Pre-strategy evidence: `node tests/run.js contract-workflows contract-rules contract-templates contract-agents runtime-tools runtime-routing runtime-timing migrations update hooks sync-render runtime-review` passed 310/310, exit 0, reported by Task 6 at `6f65ff7`. The subsequent implementation bookkeeping changed only sprint records.
- Command: `node tests/run.js contract-workflows contract-rules contract-templates contract-agents runtime-tools runtime-routing runtime-timing migrations update hooks sync-render runtime-review sync-cli`
- Scope: impacted
- Scope evidence: The enabled safety valve traced `.asd/runtime.js` to the existing config-scanner export used by the migration and to the standalone-skill cap used by `context-check`. The affected tests include all changed test files, readers of the changed workflow and provider contracts, and the real-repository sync check for changed canonical and generated files. The runner and its fixtures are unchanged. The `runner` area exercises unchanged selection/filter handling, `markdownSection` behavior and the unchanged §17 filter token. The 13 selected areas leave the terminal full suite to impl-review.
- Result: pass, exit 0. 320 passed, 0 failed, 0 runner-level skips. Temporary Git fixtures warned about CRLF conversion and historical migration fixtures emitted expected diagnostics. Seven existing Windows fixture paths bypassed symlink assertions because the host could not create symlinks.
- Lint / build: pass. `git diff --cached --check` exited 0. `node .asd/sync.js --check` reported all 77 items current. `node .asd/runtime.js context-check` exited 0 with no exceeded ceilings.
- HEAD: 5db3b1eac6b5cc5b4f57bbbada67c4243d73461d
- Provenance: suite timing `suite impl-test#1` under dispatch `impl-test entry 1`. HEAD matched before and after, with clean relevant code, generated views and tests including untracked paths. No smoke command is configured.

The suite checked publication contracts using local sources and fixtures. No live Figma or Claude Design publication occurred in this framework sprint.

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
