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
| 3 | | delta since entry 2 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-1, AC-2 · Update retry | A migration failure leaves current managed files and a pending installed version. A successful-looking zero-write retry or a preview can leave the migration unapplied or mutate the consumer prematurely. | `update` CLI with the real migration and an offline release archive | add | Existing dry-run, migration-runner and `applyPlan` tests bypass the CLI early exit. Exercise failure, repair, zero-write dry preview and real retry in one fixture. Assert the preview names the pending migration and leaves config and manifest byte-identical, then the retry migrates the config and advances the manifest with zero managed writes. Prove the test on the old CLI decision. |
| AC-1 · Installed config touched by the 14.12 migration | A linked `.asd`, `project` or config path can redirect reading or replacement of YAML. | `migrations` with links into a separate fixture | add | Existing migration fixtures use ordinary paths. Require the linked-path refusal, unchanged link identity and destination bytes, and no new files near either config. Use real junctions for directory paths and a real file symlink on a supported host. Prove the check by restoring the old migration path behavior in isolation. |
| AC-2 · Installed config diagnostic | The default CLI reads through a linked `.asd`, `project` or config path. Missing regular config and explicit preview inputs must still return the documented results. | `runtime-routing` CLI with an isolated installed template, linked paths and preview input | add | Current cases exercise explicit `--config <path>` only. Assert exit 2 without leaked linked values or destination changes, exit 1 with missing keys for absent or incomplete plain installed config, and exit 0 for complete plain installed config. Extend explicit file coverage with `--config -` for stdin and prove a failure on the old default CLI path. |
| AC-2 · Supported Node floor | `config-check` exits before reporting missing keys, or sync's check/render aborts during a real update. | Actual Node `v16.7.0` for a named config CLI check and `node .asd/sync.js --check` | keep | The regular suite uses whichever Node runs it. Run the targeted config case and sync once on the exact floor, with an isolated pre-fix comparison. Keep the regular suite zero-dependency with no package downloads or runtime installation. |
| AC-2 · Approved missing settings | A wording-dependent test obscures the intended handoff and write restrictions. | Repair the existing `update` workflow assertion | keep | The pre-strategy failure expects adjacent prose now separated by the recheck before writing. Assert the existing approval choices and the restriction to approved leaves and required parent mappings without matching their adjacency. Keep all other completion checks. |
| AC-1 · Legacy active mockup scope | Frozen UX enables mockups while live format is `none`, so a draftless resume could switch providers. | Trace the updated lifecycle rule and both resume paths | none | This is workflow guidance. Check that a recorded provider is recovered when present and missing evidence stops before provider selection or collapse until an explicit choice is recorded and frozen. The existing contracts cover the frozen format handoff and design collapse. |
| AC-2, AC-5 · Settings authority and migration comments | The approved update-completion writer is missing from the authority chain, or generated views drift from canon. | Read the invariant and its pointers, inspect the migration and use existing sync/contract checks | none | The authority and comment edits affect guidance. Existing manifest and generated-view checks cover the derived files. |
| AC-8 · Matched Codex usage after review fixes | The repair delta pushes either workflow above the accepted token limit. | [Matched review-fix probes and raw readings](./token-baseline.md#review-fix-verification) | none | At `ee94c86`, Lite used 430,941 input tokens (30.3% lower) and Standard used 520,232 (31.9% lower). All 24 probes passed. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

No existing test qualified for removal in the delta since entry 2.

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|

## Suite run

- Entry 3 pre-strategy evidence: `node tests/run.js contract-agents contract-rules contract-templates contract-workflows migrations runtime-review runtime-routing runtime-timing runtime-tools sync-cli sync-render update` under `suite impl-test#3` exited 1. 310 passed, 1 failed, 0 runner-level skips. Seven existing file-link fixture branches bypassed assertions because the Windows host could not create file symlinks. First failure: `FAIL - sprint-040 AC-2: only real update completion offers missing settings through installed asd-init`. `tests/update.test.js:25` still expects `/On acceptance, insert exactly the approved missing leaves/`. The implementation retains both requirements with an installed-config recheck between them. Relevant source, test and stub paths were clean throughout. HEAD moved from `102bbb4` to `bca653a` during the run with only sprint evidence changed. This is pre-strategy evidence only.
- Entry 3 gate selection: full. With the safety valve enabled, `.asd/runtime.js` changes argument parsing shared by phase commands, and `.asd/sync.js` changes agent variant eligibility and ledger checks used by build and update. Use `node tests/run.js` at step 8 on the test-authoring revision.
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
