# Test plan — sprint 038-codex-provider-routing, entry 2

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Review 1 · AC-1–AC-2 | Config validation accepts an opt-out the attribution reader ignores | Component/contract | keep | `runtime-routing` distinguishes the supported disabled form from unsupported spellings. `runtime-tools` and `sync-render` check the downstream attribution behavior. |
| Review 2 · AC-20 | A draft absent from the previous snapshot yields an empty delta | Component/contract | keep | `runtime-review` checks addition patches, changed drafts, and snapshot refusals, plus whole-file carryover and the first-iteration exception. |
| Review 3 · AC-17 | Parsing attribute separators cuts a literal comma from the value | Component/contract | keep | `runtime-timing` checks literal commas with adjacent assignments and repeated flags. |
| Review 4 · AC-18 | A POSIX backslash aliases a different path in external review | Component/contract | keep | `runtime-review` checks path selection on Windows through a POSIX preload and checks the emitted literal-backslash Git patch on native POSIX. |
| Review 5–6 | Comment moves or evidence repairs are mistaken for untested behavior | Static | none | The comment moves preserve executable code. The focused failing commands, checked revisions, and gap proofs are recorded in `test-plan.entry-01.md`. |
| Wave 1 iteration 2 finding 1 · AC-18 | Git quoting or the wave handoff changes a path before patch generation | Component/contract | keep | Extend the scope command contract through real Git output, wave files, and manifest emission. Exercise the production command with a literal backslash on POSIX and retain legacy LF and CRLF list coverage. |
| Wave 1 iteration 2 finding 1 · AC-18 | The skip-record check rejects a valid wording change around the carried path field | Static | keep | The first impacted run passed 161/162 at `5ee9d8e1`. The existing interrupted and availability-skip contract failed because it extracted the field using obsolete prose. Check the stable field in the definition and report template. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|
| `tests/runtime-review.test.js` / sprint-015 AC-4 (F-2), sprint-038 AC-18: Git scope paths reach the wave manifest and patch verbatim | The existing scope command test stopped at stdout. The existing AC-18 selector test wrote the literal path directly. Neither test exercised the Git-to-wave-to-manifest handoff. | `node .asd/tmp/038-review-paths-pre-fix/tests/run.js runtime-review --filter 'Git scope paths reach the wave manifest'` matched 1/45 on each run. Runtime at `4064683e` rejected the NUL in the Git argument (exit 1, 0/1). Restoring the old Git scope step left the scratch list absent (exit 1, 0/1). Removing the new wave `--nul` clause produced LF output (exit 1, 0/1). Rewording adjacent prose passed (exit 0, 1/1). The runner named the test in the first cell. Runs: 4. |
