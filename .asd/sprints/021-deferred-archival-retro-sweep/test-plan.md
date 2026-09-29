---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 021-deferred-archival-retro-sweep

## Entry log

Appended each entry, never rewritten. `HEAD analysed` is the commit the strategy/prune passes
were scoped through; the next re-entry's delta is `git diff <this sha>...HEAD`.

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | f4ccc40 | full change surface |
| 2 | 74948d3 | delta since entry 1 |
| 3 | aa58506 | delta since entry 2 |
| 4 | 0eab194 | delta since entry 3 |
| 5 |  | delta since entry 4 |

Entry 2: the delta is `git diff f4ccc40...HEAD` over the self-hosting pathspec. It holds 5 files (+8/−8), README's self-hosting answer and agent memory only: test-fix 4d3a7d3 (D-1..D-3), the asd-dev index line ac11fee and b48906e (D-4). No canon, runtime, hook or test changed, so the safety valve does not fire. The impacted set is every test reading `README.md` or `.claude/agent-memory/**` (the README mirrors, the memory index bijection, the memory sweeps, sprint-021 AC-11 and AC-13). `tests/run.js` has no selector, so the set runs as the whole file. Pre-strategy run (HEAD d9a047c, tests as found): `node tests/run.js` → exit 0, 253/253 passed. Entry 1's rows were rotated into `test-plan.entry-01.md`; it held no live removal row to carry forward.

Entry 3: the delta is `git diff 74948d3...HEAD` over the self-hosting pathspec. It holds 10 files (+32/−17): the impl-review wave-1/iter-01 review-fix commits f9df1c3 (C-1), 4d6286a (external #1), 9e88920 (C-4, external #2), 73745d4 (C-2, external #3) and fcb9d2c (C-3), the ledger refresh a284a0d, and a new `asd-reviewer-combined` memory. `.asd/runtime.js` changed, and `tests/run.js` requires it, so the safety valve fires. `tests/run.js` has no selector, so the set runs as the whole file either way. Pre-strategy run (HEAD 43c604a, tests as found): `node tests/run.js` → exit 1, 252/253 passed, FAIL sprint-021 AC-12: surface-check never counts a generated provider view …, "every provider-tree file sync.js writes is regenerated from canon, never reviewable change surface, so none may count against the cap", `2 !== 0`. That is a test defect: the test took every sync-plan target containing `/` as a view, including the two JSON-merge targets that 4d6286a now counts on purpose. Entry 2's rows were rotated into `test-plan.entry-02.md`. It held no live removal row to carry forward, and no review-fix tester rows were added after it.

Entry 4: the delta is `git diff aa58506...HEAD` over the self-hosting pathspec. Outside the sprint folder it holds 2 files (+2/−2): the review-fix commit b0f0daf (iter-02 external #1, `asd-phase-pr.md` merge mode step 1) and the ledger refresh 7a9b496 (`release-manifest.json`). No runtime, hook, sync or test source changed, so the safety valve does not fire. The impacted set is every test reading `asd-phase-pr.md` or `release-manifest.json`: the sprint-021 AC-1/AC-2 test, the phase-chain mirrors, the corpus citation sweep and the ledger tests. `tests/run.js` has no selector, so the set runs as the whole file. Pre-strategy run (HEAD 3a0b7a4, tests as found): `node tests/run.js` → exit 0, 253/253 passed. Entry 3's rows were rotated into `test-plan.entry-03.md`. It held no live removal row to carry forward, and no review-fix tester rows were added after it.

Entry 5: the delta is `git diff 0eab194...HEAD` over the self-hosting pathspec. Outside the sprint folder and the generated views it holds 6 files (+18/−14): the review-fix commit fd0a5b0 (iter-03 external #1, the head-branch lookup in `sprint-lifecycle.md` "PR phase", the `asd-sprint` SKILL Step 1/1A, `asd-phase-pr.md` open mode step 2 and `asd-phase-scope.md` step 1), ff0ef0c (friction F-5/F-4, `t_review-report.md`), and the ledger refresh 0307c65. The view regeneration d476b02 falls outside the pathspec. No runtime, hook, sync or test source changed, so the safety valve does not fire. The impacted set is every test reading those files, `t_review.md` and `runtime.reviewFindings`: the sprint-021 AC-1/AC-2 and AC-3 tests, the persist-review tests, the phase-chain mirrors, the corpus citation sweep, the leftover-term sweep and the ledger and sync tests. `tests/run.js` has no selector, so the set runs as the whole file. Pre-strategy run (HEAD d476b02, tests as found): `node tests/run.js` → exit 0, 253/253 passed. Entry 4's rows were rotated into `test-plan.entry-04.md`. It held no live removal row to carry forward, and no review-fix tester rows were added after it.

## Risk → check decisions

Entry 1's rows are in `test-plan.entry-01.md`, entry 2's in `test-plan.entry-02.md`, entry 3's in `test-plan.entry-03.md`, entry 4's in `test-plan.entry-04.md`. Mutations M-O to M-AC are listed under Added tests. Each edits a `managed_paths` file, so each run also fails the `upstream_hashes` ledger test, and an `asd-sprint` SKILL edit also fails the `sync.js --check` and `canon_hashes` tests. That is expected noise and is not recorded as the failing test.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| "PR phase" "Merged-unclosed" defines the head-branch lookup `gh pr list --head <state.branch> --state all …`: a `MERGED` hit is merged-unclosed, an `OPEN` hit resumes merge mode (fd0a5b0, iter-03 external #1). `asd-sprint` Step 1 runs the same command, and `asd-phase-pr.md` open mode step 2 runs it before opening a PR | a PR merged before open mode's `state.json.pr` write reached the branch leaves base at `pr=null`: without the lookup asd-sprint never requests closure, and a pr re-run opens a second PR. Dropping `--state all` hides the `MERGED` PR, since `gh pr list` lists open PRs by default | contract | add | §17: a fix of a high finding with three acting sites and no pin. New test sprint-021 AC-2 (iter-03 external #1). It takes the lookup command from the home's code spans. It requires `--state all`, and it requires a `MERGED` clause that says merged-unclosed and an `OPEN` clause that says merge mode. It requires the same command in a Step 1 line of `asd-sprint`, and that line must say merged-unclosed. That relation pins the two sites against each other, with no literal written in the test. In pr open mode, the steps before the one citing `git-strategy.md` "PR creation" must cite "Merged-unclosed". They must also hold a `MERGED` clause emitting `NEXT: await-closure` and an `OPEN` clause naming merge mode. The locator is the citation, not a step number. M-AB rewords open mode step 2 end to end and the test stays green, so the asserts do not lock wording |
| `asd-sprint` Step 1A carries the lookup's PR number with the approval, and `asd-phase-scope.md` step 1's closure write writes `pr.number` when `pr` is null (fd0a5b0) | the closing sprint is archived with `pr=null`, and `gh pr view <pr.number>` cannot read its merge commit | contract | add | the AC-1/AC-2 token relation already requires scope step 1 to name every closure-write token, `pr.number` included. The `pr.number` token was satisfied vacuously, though, by the older `gh pr view <pr.number>` span, so M-U (scope from `fd0a5b0~1`) is green on it. The new test requires `pr.number` as a code span of its own in scope step 1, and requires Step 1A's approve item to name the number, with code spans stripped |
| session-start hook: the home now says the offline report misses a sprint without `pr.number` | the hook reports a false closure for a sprint without `pr.number` | unit | keep | the hook did not change. The sprint-021 AC-3 test already runs the hook on a `no PR number yet` fixture and expects `await-merge`, and it passed at HEAD d476b02 |
| `t_review-report.md` Kept findings gains the empty row `\| — \| — \| — \| no findings \| — \|` and a Severity-cell comment (ff0ef0c, friction F-5/F-4) | the template shows an empty row, or a Severity value, that `runtime.reviewFindings` rejects. persist-review then refuses a verdict the reviewer wrote to the template, which is F-5 exactly | contract | add | §17: a cross-file contract between a template and the parser that reads what it produces. The mismatch already cost one external iteration. New test sprint-021 F-4/F-5 runs both review templates, `t_review.md` Findings and the external Kept findings. It builds each template's header, separator and the empty row taken from its HTML comment, and runs them through `runtime.reviewFindings`, which must return `[]`. It then runs one row per Severity value the template offers, from the sample row's `{{a/b/…}}` placeholder and from any `one of a\|b\|…` comment, and each must parse to that severity. The template side is derived and the runtime is called directly, so no severity list is copied into the test |
| sprint-021 AC-1/AC-2 test's `unpublished` and `unconfirmed` message strings still said "asd-sprint never requests closure" | a reader of a red run is told a consequence that fd0a5b0's fallback lookup made false | — | keep (rewritten in place) | a test defect, fixed. Both messages now say the merged sprint is found only by the head-branch fallback lookup. The messages changed and no assertion did, so there is nothing to mutate |
| `release-manifest.json` ledger refresh (0307c65) and the regenerated `asd-sprint` views (d476b02) | a stale ledger or view | — | keep | the `upstream_hashes`, `canon_hashes` and `sync.js --check` tests read every entry and view, and they passed at HEAD d476b02 |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

None in entry 5.

## Added tests

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-021 AC-2 (iter-03 external #1): a phase="pr" sprint without pr.number is looked up by head branch … (new) | M-R restores `sprint-lifecycle.md` from `fd0a5b0~1` → exit 1, 253/255, FAIL sprint-021 AC-2 (iter-03 external #1) …, "AC-2: "Merged-unclosed" must define the head-branch lookup for a phase="pr" sprint without pr.number …". M-W drops only `--state all` from the home's command → 253/255, "AC-2: the head-branch lookup must list every PR state …". M-AA makes the home's `MERGED` hit "ignored" → 253/255, "AC-2: "Merged-unclosed" must read a MERGED head-branch hit as merged-unclosed …". M-Z makes the `OPEN` hit "ignored" → 253/255, "AC-2: "Merged-unclosed" must resume merge mode on an OPEN head-branch hit …". M-S restores the `asd-sprint` SKILL from `fd0a5b0~1` → 251/255, "AC-2: asd-sprint Step 1 must run the lookup "Merged-unclosed" defines, the same command, …". M-T drops only Step 1A's ``, plus the head-branch lookup's PR number when `pr` is null`` → 251/255, "AC-2: asd-sprint Step 1A must carry the head-branch lookup's PR number with the closure approval …". M-U restores `asd-phase-scope.md` from `fd0a5b0~1` → 253/255, "AC-2: asd-phase-scope.md step 1's closure write must write pr.number as a field of its own …". M-V restores `asd-phase-pr.md` from `fd0a5b0~1` → 253/255, "AC-2: pr open mode must run the head-branch lookup ("PR phase" "Merged-unclosed") before opening a PR …". M-AC moves the lookup unchanged from step 2 to the end of step 3, after the PR is opened, and fails with the same message. M-Y makes open mode's `MERGED` hit "continues below" → 253/255, "AC-2: pr open mode must emit NEXT: await-closure on a MERGED head-branch hit, opening nothing …". M-X makes the `OPEN` hit "continues below" → 253/255, "AC-2: pr open mode must adopt an OPEN head-branch hit into merge mode instead of opening a second PR …". M-AB rewords open mode's lookup end to end with the same substance → 254/255, and the only FAIL is the ledger noise. Each run exited 1, and after each run the file was restored byte-equal |
| tests/run.js: sprint-021 F-4/F-5: each review template's empty findings row and Severity values parse through reviewFindings … (new) | M-O restores `t_review-report.md` from `ff0ef0c~1` → exit 1, 253/255, FAIL sprint-021 F-4/F-5 …, ".asd/templates/external-review/t_review-report.md "Kept findings" must show the row a reviewer leaves when there are no findings - F-5 …". M-P writes the report's empty row with `-` → 253/255, "… "Kept findings": the empty row the template shows must parse to no findings through runtime.reviewFindings - F-5". M-Q adds `nit` to the sample row's Severity placeholder → 253/255, "… "Kept findings": Severity value "nit" the template offers must be one runtime.reviewFindings accepts - F-4". M-Q3 adds `\|nit` to the Severity-cell comment only → the same message. M-Q2 deletes `t_review.md`'s empty-row comment → 253/255, ".asd/templates/t_review.md "Findings" must show the row a reviewer leaves when there are no findings …". M-O's first failure is the empty-row assert, because the pre-fix placeholder `{{sev}}` is only reached after it, so M-Q and M-Q3 carry the Severity proof. After each run the file was restored byte-equal |

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once the last review wave's reviewers are
APPROVE/latched. The `pr` gate always reads whatever is recorded here last — the full-suite
record, by the time `pr` runs. Each per-entry record measures only the tree that entry
analysed, not any tree produced later
(`.asd/rules/sprint-lifecycle.md` "Impacted test set").

- Command: `node tests/run.js`
- Scope: impacted set (entry 5). The safety valve does not fire, and the runner has no selector, so the whole file runs
- Result: pass. 255/255 passed, 0 failed, 0 skipped (exit 0). The count rose by 2, the two tests this entry added
- Lint / build: pass. `git diff --cached --check` is clean at commit; `node .asd/sync.js --check` exits 0, `ok: true`, 74/74 items current
- HEAD: d476b02, plus this entry's uncommitted test edit, committed right after this record

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/rules/sprint-lifecycle.md` "Impl-test phase"). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .claude/agent-memory/asd-dev/project_agents-md-sync-state-drift.md | AssertionError [ERR_ASSERTION]: a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md) | sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply | fixed | 4d3a7d3 |
| D-2 | 1 | .claude/agent-memory/asd-dev/project_asd-self-hosting.md | AssertionError [ERR_ASSERTION]: a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md) | sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply | fixed | 4d3a7d3 |
| D-3 | 1 | README.md | AssertionError [ERR_ASSERTION]: a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md) | sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply | fixed | 4d3a7d3 |
| D-4 | 1 | .claude/agent-memory/asd-tester/project_asd-self-hosting-testing.md | leftover-term sweep (manual, no runner line): "Always a test/repo-state defect for a dev to fix via `sync-apply`" routes a stale hash ledger to a dev, who never runs `--apply` since this sprint | none (manual leftover-term check, `artifact-layout.md` "Leftover-term check") | fixed | b48906e |
