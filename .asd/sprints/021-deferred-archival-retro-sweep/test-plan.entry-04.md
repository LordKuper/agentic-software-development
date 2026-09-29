# Test plan — sprint 021-deferred-archival-retro-sweep, entry 4

Rotated narrative rows of entry 4 (`artifact-layout.md` "Test plan"). No review-fix or in-place tester rows were added after it. Never edited; a changed risk gets a superseding row in live `test-plan.md`.

## Risk → check decisions

Mutations M-J to M-N are listed under Added tests. Each edits `asd-phase-pr.md`, a `managed_paths` file, so each run also fails the `upstream_hashes` ledger test. That is expected noise and is not recorded as the failing test.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `asd-phase-pr.md` merge mode step 1 confirms `origin/<state.branch>`'s `state.json` holds `pr.number`, and commits and pushes it if not, before merging (b0f0daf, iter-02 external #1) | the check is dropped or moved after the merge; an open-mode push that failed or never ran then squashes `pr=null` onto base, and asd-sprint never requests closure | contract | add | §17: the step fixes a medium finding that no test pinned, and it has a single acting site. Entry 3 pinned open mode's commit and push on the same ground. Three asserts go into the sprint-021 AC-1/AC-2 test, which already reads merge mode. They take the merge-mode text before its `git-strategy.md` "Merging a PR" citation, located by the citation and not by step number. The first requires a code span naming both `origin/` and `state.json`. The other two require `commit` and `push` in the prose, each on its own, with code spans stripped and each clause naming `FAILED` dropped. Without the clause filter, "a push failure is `FAILED`" alone satisfies `push`. M-L keeps that clause, drops only the instruction, and the push assert fires. M-N rewrites the check end to end in its own `1a.` step and the test stays green |
| the same step's "a push failure is `FAILED`" | a failed republish push does not halt, and the merge proceeds | — | none | a `FAILED` presence assert proves the clause mentions the signal, not that it halts. "a push failure is not `FAILED`" would pass. Halting on `FAILED` is the workflow's generic signal handling. A machine-readable failure-route list would make it assertable |
| `release-manifest.json` hash refresh (7a9b496) | a stale ledger | — | keep | the `upstream_hashes` test reads every entry, and it passed at HEAD 3a0b7a4 |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

None in entry 4.

## Added tests

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-021 AC-1/AC-2 (D1): … pr merge mode republishes it if the PR head lacks it before merging … (three asserts and one sanity assert added, iter-02 external #1) | M-J restores `asd-phase-pr.md` from `b0f0daf~1` → exit 1, 251/253, FAIL sprint-021 AC-1/AC-2 …, "AC-2: pr merge mode must read state.json from the remote sprint branch before merging …". M-K drops only ``commit the local `state.json.pr` write if uncommitted, `` → exit 1, 251/253, FAIL …, "AC-2: pr merge mode must commit a local state.json.pr write the remote branch lacks before merging …". M-L drops only `push the sprint branch and ` → exit 1, 251/253, FAIL …, "AC-2: pr merge mode must push the sprint branch when the remote lacks pr.number, before merging …". M-M moves the whole check after the merge sentence → exit 1, 251/253, FAIL …, "AC-2: pr merge mode must read state.json from the remote sprint branch before merging …". M-N rewrites the check with the same substance as its own step `1a.` → exit 1, 252/253. The only FAIL is the ledger noise, and this test stays green. After each run the file was restored byte-equal |
