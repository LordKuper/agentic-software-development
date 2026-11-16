# Test plan entry 03 — sprint 034-open-issue-triage

Rotated narrative rows of `Entry log` entry 3 (HEAD analysed de82f25f), review-fix rows included. Never edited.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| review-fix iter-02 delta `3666182b...4bc78661` (`909aa105` Scope `full` for an impacted set holding every file, `2b71716c` checked `<origin>` before `gh repo view` in scope and pr, `ff55b8a9` list-then-create label ensure without `-f`, `9bcbce7c` step 4 the one `deferred`/`wontfix` ensure, sync `4bc78661`) | a regression of any of the four fixes, or a pin left on the superseded contract (4 of 374 red) | re-pinned sprint-029 AC-1..8, sprint-034 AC-1/AC-2/AC-5/AC-6/AC-7, AC-4 and AC-10/AC-11, plus one new sprint-034 AC-1/AC-3 test | author | each changed contract is pinned on its restored clause with a fail-first and mutation proof (Added tests); the origin step is pinned at both sites (scope step 2a, pr merge step 2), every `gh label create` in canon and the gh reference is derived from source and checked for no `-f`, and step 4's labels are derived from its `--add-label` writes, so none can be re-ensured in step 2a unnoticed |
| review-fix delta `5a0e9aaa...HEAD` (`faf97aec` origin-URL project repo, `e32635b7` `[asd-retro] ` prefix list, `853ec77a` step 4 `gh label create -f`, `920b16b8` Scope `full`/`impacted`/`named`, sync `8c2ca8c5`) | a regression of any of the four fixes, or a stale generated mirror | existing tests (the review-fix pins of `4b7caea4`) and `node .asd/sync.js --check` | none | each fix is pinned with recorded fail-first and mutation proof in the rotated `entry-02` rows: origin URL and the prefix list and the label ensure by sprint-034 AC-1/AC-2 and AC-4 (issue), Scope `named` by sprint-034 AC-10/AC-11; mirrors by the build check. No unpinned behaviour remains, so a new test would duplicate a check (`code-style.md` §17 hypothetical-risk) |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no review-fix removal row to carry forward, and no test is trivial, redundant, mock-confirming, implementation-coupled or flaky on the delta | yes |

## Added tests

| Test | Regression proof |
|---|---|
| sprint-034 AC-1/AC-3 (combined-3, combined-4, external-3) (new) | Pre-fix tree: `node tests/run.js --filter "sprint-034 AC-1/AC-3 (combined"` in a `git archive 3666182b` extraction with the new `tests/run.js`, exit 1, failing test `sprint-034 AC-1/AC-3 (combined-3, combined-4, external-3)` (1/375 matched), `-f` on the label create. Mutations, same filter, exit 1, same failing test, 1/375 each: add ` -f` to the step 2a create; drop the list before the create; restore `deferred`/`wontfix` to step 2a's ensure list. Control: reword the "creates only a missing label" prose, exit 0, 1/375. runs: 4 |
| sprint-034 AC-10/AC-11 (re-pinned on the restored clause; title fixed) | Pre-fix tree, `--filter "sprint-034 AC-10/AC-11"`, exit 1, failing test `sprint-034 AC-10/AC-11 (033#P-1, issues #86, #119)` (1/375). Mutation: remove ", or an impacted set holding all of them" from `sprint-lifecycle.md` "Impacted test set" **Scope.**, citations kept, exit 1, same test, 1/375. runs: 1 |
| sprint-034 AC-1/AC-2/AC-5/AC-6/AC-7 (re-pinned: checked `<origin>` before `gh repo view`, skip clause, project bullet plans no write) | Pre-fix tree, `--filter "sprint-034 AC-1/AC-2/AC-5"`, exit 1, failing test `sprint-034 AC-1/AC-2/AC-5/AC-6/AC-7 (issue #110)` (1/375). Mutations, exit 1, same test, 1/375: restore the unchecked `"$(git remote get-url origin)"` substitution in step 2a; drop the "`<origin>` lookup with a non-zero exit or empty output" skip clause. runs: 2 |
| sprint-034 AC-4 (issue #110) (re-pinned: checked `<origin>` in pr merge step 2) | Pre-fix tree, `--filter "sprint-034 AC-4 (issue"`, exit 1, failing test `sprint-034 AC-4 (issue #110)` (1/375). Mutations, exit 1, same test, 1/375: restore the unchecked substitution in `asd-phase-pr.md`; drop the "(an `<origin>` lookup with a non-zero exit or empty output included)" clause. runs: 2 |
| sprint-029 AC-1..8 (re-pinned: every label scope applies is ensured, by step 2a or step 4) | Pre-fix tree, `--filter "sprint-029 AC-1/AC-2"`, exit 1, failing test `sprint-029 AC-1/AC-2/AC-3/AC-4/AC-5/AC-6/AC-7/AC-8` (1/375) on step 4 holding no "ensured as in step 2a". Mutation: step 4's "ensured as in step 2a" reworded to "written", exit 1, same test, 1/375. runs: 1 |
