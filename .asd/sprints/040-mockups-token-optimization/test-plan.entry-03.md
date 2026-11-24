# Test plan entry 03 — sprint 040-mockups-token-optimization

Rotated at entry 4. Entry 3 analysed `bcc7edda`.

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

## Entry 3 suite evidence

The pre-strategy run passed 310/311 and identified the stale approval-prose assertion. After authoring, both affected-area runs passed 84/84. The exact Node 16.7.0 config diagnostic and sync build passed. The full suite passed 326/326 at `1734f03`, with lint and build passing. The first complete run and its host caveats are recorded in `bcc7edda:test-plan.md` under this sprint directory.

The next review-fix ran the `update` area after both findings and the memory change. All 38 tests passed at `d24d80a` (`suite impl#15`).
