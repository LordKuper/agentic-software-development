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
| AC-2 · Installed config diagnostic | The default CLI reads through a linked `.asd`, `project` or config path. Missing regular config and explicit preview inputs must still return the documented results. | `migrations` shared link fixture and `runtime-routing` installed and preview input fixture | add | Current cases exercise explicit `--config <path>` only. Assert exit 2 without leaked linked values or destination changes, exit 1 with missing keys for absent or incomplete plain installed config, and exit 0 for complete plain installed config. Extend explicit file coverage with `--config -` for stdin and prove a failure on the old default CLI path. |
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
| `tests/update.test.js:sprint-040 AC-1 and AC-2: update CLI retries a pending migration with zero managed writes` | Existing `node tests/run.js migrations runtime-routing update` passed 81/81 on isolated pre-fix `bd73e08^`. Driver tests missed the CLI early exit. | Fail-first at `bd73e08^`: `node tests/run.js update --filter 'update CLI retries a pending migration'` → exit 1, 1 matched, `sprint-040 AC-1 and AC-2: update CLI retries a pending migration with zero managed writes`. The preview and real retry both printed `Already up to date.` against an installed version with a pending migration. runs: 2 |
| `tests/migrations.test.js:sprint-040 AC-1 and AC-2: installed config migration and check refuse linked paths` | Existing `node tests/run.js migrations runtime-routing update` passed 81/81 on isolated pre-fix `bd73e08^`. The existing installed migration and the explicit CLI file checks left linked default paths uncovered. | `node tests/run.js migrations --filter 'installed config migration and check refuse linked paths'` → exit 1, 1 matched, `sprint-040 AC-1 and AC-2: installed config migration and check refuse linked paths` on pre-fix `bd73e08^` (default check follows `.asd`, exit 1) and on the same snapshot with only runtime restored to current (migration does not refuse). runs: 2 |
| `tests/runtime-routing.test.js:sprint-040 AC-2: config-check accepts installed, explicit file and stdin input` | Existing `node tests/run.js migrations runtime-routing update` passed 81/81 on its ordinary Node. Runtime routing exercised explicit files alone. Search `config-check`, `--config` and installed-path fixtures found no default/stdin contract or exact Node floor coverage. | Fail-first at `bd73e08^`: `npx --offline --yes --package node@16.7.0 node tests/run.js runtime-routing --filter 'config-check accepts installed'` → exit 1, 1 matched, `sprint-040 AC-2: config-check accepts installed, explicit file and stdin input` because `Object.hasOwn is not a function`. A proof-only preload bootstrapped the test scratch path to reach `config-check` on the old CLI. runs: 1 |

The Windows runner used directory junctions for `.asd` and `project`, and a junction at the config path after Windows refused a file symlink. On a host that permits file symlinks, the same test exercises a real config file symlink. The test runs both installed-config entry points in each case and checks the link, destination bytes and directory listings afterward.

## Suite run

- Entry 3 pre-strategy evidence: `node tests/run.js contract-agents contract-rules contract-templates contract-workflows migrations runtime-review runtime-routing runtime-timing runtime-tools sync-cli sync-render update` under `suite impl-test#3` exited 1. 310 passed, 1 failed, 0 runner-level skips. Seven existing file-link fixture branches bypassed assertions because the Windows host could not create file symlinks. First failure: `FAIL - sprint-040 AC-2: only real update completion offers missing settings through installed asd-init`. `tests/update.test.js:25` still expects `/On acceptance, insert exactly the approved missing leaves/`. The implementation retains both requirements with an installed-config recheck between them. Relevant source, test and stub paths were clean throughout. HEAD moved from `102bbb4` to `bca653a` during the run with only sprint evidence changed. This is pre-strategy evidence only.
- Entry 3 authoring evidence: `node tests/run.js migrations runtime-routing update` passed 84/84, exit 0, after each test batch (`suite impl-test#4` and `#15`). Node `v16.7.0`: `npx --offline --yes --package node@16.7.0 node tests/run.js runtime-routing --filter 'config-check accepts installed'` passed 1/1 (`#11`). `npx --offline --yes --package node@16.7.0 node .asd/sync.js --check` exited 0 (`#12`), compared with exit 1 and `sync: Object.hasOwn is not a function` on isolated `bd73e08^` (`#9`).
- Allowance: Entry 3 covers the AC-1 and AC-2 zero-write migration retry and dry preview, linked installed-config refusal at both entry points, and default and explicit CLI input on the supported Node floor. The added fixture lines exercise those boundaries through the actual CLIs and the release migration.
- Command: `node tests/run.js`
- Scope: full
- Scope evidence: With the safety valve enabled, `.asd/runtime.js` changes argument parsing shared by phase commands, and `.asd/sync.js` changes agent variant eligibility and ledger checks used by build and update.
- Result: pass, exit 0. 326 passed, 0 failed, 0 runner-level skips. Seven existing Windows fixture branches bypassed file-symlink assertions because the host could not create them. The new linked-config test ran with junctions on this host, including a junction at the config path.
- Lint / build: pass. `git diff --cached --check` and `node .asd/sync.js --check` exited 0. All 77 sync targets are current.
- HEAD: 1734f03a97209fb549d4d0f5e45cdc8f6a06ca77
- Provenance: `suite impl-test#16` under dispatch `impl-test entry 3 author`. HEAD matched before and after. Relevant project settings, generated views, source, tests and stubs were clean, including untracked files. The project defines no smoke command.

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
