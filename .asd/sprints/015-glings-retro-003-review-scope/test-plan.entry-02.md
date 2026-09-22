# Test plan — sprint 015-glings-retro-003-review-scope — entry 02

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `runtime.js` `surfaceCheck.dispatches` (D-1 fix, e3baf5b): `+ 1` → `+ 2` | the bound again undercounts Testing's parts, or overcounts everywhere so the override request asks for more than runs | unit against real emitted parts | keep | supersedes entry 1's "Red, D-1" row. The existing sprint-015 AC-11 test is the fail-first proof: red at 3352fd5, green at 9452acf, and its `tight` assert stops an overcount from passing (bound 25 is tight: 4 non-Testing parts + 2 Testing parts + External Review = 6 = `dispatches`). Known ceiling, recorded not tested: the `+ 2` holds while Testing's `--test-plan` paths (test-plan.md + one segment per re-entry) number at most `SPLIT_THRESHOLD_FILES` (25), i.e. 24 re-entries, beyond the review-iteration cap. A test for more paths would pin a case the workflow cannot reach |
| `release-manifest.json` hash for `runtime.js` | ledger drift | static | keep | the existing `upstream_hashes` ledger test covers it |
| review-fix iter-01: `checkpoints.md` gate row loses its `surface-check` parenthetical (documentation.part-1.md D-2, 8c0cedd) | the cap-override request names a count `surface-check` does not return | static | keep (re-pointed) | the AC-11 field assert now reads the single home, `sprint-lifecycle.md` "Plan file format" `**Change surface declaration**`. It is not weakened |
| review-fix iter-01: `isTest` folder match case-folded (correctness.part-1.md F-1) | a capitalised test folder (Unity/.NET `Tests/`) misses Testing | unit | keep (extended) | `Assets/Tests/EditMode/Fixture.cs` was added to the AC-2/AC-3 cases |
| review-fix iter-01: AC-8 record (testing.md TST-1) | the per-sprint skip stops recording the frozen `false`, so the document is still produced | static | keep (extended) | one assert on the `Record:` clause |
| review-fix iter-01: AC-4/AC-5 runtime-spawned git (testing.md TST-2) | the host's global or system git config (e.g. `diff.noprefix`) changes the `.diff` headers, which makes the test flaky | test isolation | keep (hardened) | the test's own git calls and its `runtimeCli` calls run with `GIT_CONFIG_NOSYSTEM=1` and an empty `GIT_CONFIG_GLOBAL`. The AC-7 git message no longer claims to be the suite's only git call |
| `draft-snapshot` subcommand (7566611) | — | deferred | — | this is outside review-fix mode and goes to the next impl-test strategy pass |

## Removed tests

None this entry.

## Added tests

None this entry. The delta changes one arithmetic term that the AC-11 test already asserts (above).

Review-fix iter-01 amendments (tests/run.js). Each proof is a replay: mutate, run the suite, restore, and byte-compare. Ledger noise (`upstream_hashes`) is not counted:

| Test | Regression proof |
|---|---|
| sprint-015 AC-11, field assert re-pointed (D-2) | `dispatches` → `dispatchez` in the sprint-lifecycle declaration → exit 1, `the cap-override request "Plan file format" defines must quote a field surface-check returns, or the request states a count nobody computes` |
| sprint-015 AC-2/AC-3, `Assets/Tests/EditMode/Fixture.cs` (F-1) | drop the `i` flag from the `isTest` folder regex (pre-fix form) → exit 1, `each path-segment and basename convention the plan names must classify as a test file, or Testing never receives it` |
| sprint-015 AC-8, frozen `false` (TST-1) | drop "the frozen `false` plus" from sprint-lifecycle.md → exit 1, `` AC-8: the skip records the frozen `false` later phases read - the log line alone leaves the document produced `` |
| sprint-015 AC-4/AC-5 git isolation (TST-2) | host `GIT_CONFIG_GLOBAL` with `diff.noprefix=true`: the pre-fix test → exit 1 (AC-4/AC-5 fails), the fixed test → 211/211 |
