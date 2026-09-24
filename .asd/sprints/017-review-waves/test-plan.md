---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 017-review-waves

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 8b0c28f58ee83940449709bfdba3a35814daf987 | full change surface |
| 2 | a866c4c8b94c0ec9ea8f5f8f7e5139fd0df5ac50 | dev-chain review-fix delta since entry 1 (testing.md TST-1..TST-3, efficiency.md EFF-4, plus the dev-chain commits `8b0c28f..a866c4c` those findings' fixes touch) |
| 3 | ee7333e334510ce3233afdcd7c7bf9d6837f7215 | delta since entry 2: `tests/run.js` (95aee62, review-fix tester chain) and `.claude/agent-memory/**` (COR-4 memory rewrites, 30f75c3 and e4dd2c0) |
| 4 | 734c215dc1329ad36b7e3f19a4ea33b469cdfa89 | delta since entry 3: `.claude/agent-memory/asd-reviewer-testing/**` (D-1/D-2 test-fix, ace77e4) |

Impacted set: full suite (all entries). The safety valve fires. Entries 1-2 touched `.asd/runtime.js`, `.asd/hooks/session-start.js`, `.asd/release-manifest.json`, rule docs and workflows, and entry 3's delta touches `tests/run.js`, the runner itself. `commands.yaml` has no `test_affected`. Entry 4's delta is memory only, but its search-derived set (the tests walking `.claude/agent-memory/**`) lives in the one test file `tests/run.js`, which the runner executes whole.

Entry 3's `Risk → check decisions`, `Removed tests` and `Added tests` rows are rotated to `test-plan.entry-03.md`. Entries 1-2 are in `test-plan.entry-01.md` and `test-plan.entry-02.md` (`artifact-layout.md` "Test plan"). This entry's own rows follow.

Entry 4 pre-strategy run at `4a1520a`: `node tests/run.js` → exit 0, `224/224 passed`.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| D-1/D-2 fix (ace77e4) under `.claude/agent-memory/asd-reviewer-testing/`: split-part memory deleted, `--halve` anecdote and two other memories rewritten, `MEMORY.md` index updated | a split, part or `--halve` line survives or returns as live contract; the index loses or gains a line without its file | static | none | Existing checks already cover both risks, so no new test qualifies (`code-style.md` §17). The COR-4 memory sweep (entry 3) covers the first. Its fail-first proof against this fix: `git checkout ace77e4^ -- .claude/agent-memory/asd-reviewer-testing`, then `node tests/run.js` → exit 1, `223/224 passed`. The one FAIL is `sprint-017 AC-5/AC-7 (COR-4): no agent memory a dispatched agent loads names a review mechanism review waves replaced as live - only right after a negation in the same clause, or on a line naming it legacy`, with exactly D-1/D-2's 7 leftovers. The dir was restored in the same command (`git restore --source=HEAD --staged --worktree`, re-added file removed), and `git status --short` was empty afterwards. At ace77e4 and later the sweep is green (pre-strategy run above). The second risk is covered by the memory-index bijection test (`T-2/T-4/sprint-010 TST-01`), which caught the fix's own dropped `feedback_value-removal-sprints.md` index line before commit (decisions-log.009.md). |
| COR-1 fix (3cada92) `writeManifestDiff` rewrites its fingerprint-named `.diff` via `.tmp` + rename on every emit, no `existsSync` short-circuit | a reused iteration dir (rollback reset, or a moved impl-review `--base` ref) serves the pre-fix stale `.diff` to every reviewer | unit | add | the D9e test now re-emits into the SAME design-review iteration dir with the same list and `--snapshot` after the draft changed again, and asserts the `.diff` (same fingerprinted path) carries the new revision, not the first |
| TST-1: two differing lists (or ranges) into one shared impl-review out dir could collide on the fingerprint, or the diff-absence check at iteration 1 could no longer fail | a mutation dropping paths (or range) from the fingerprint survives undetected; `documentation.diff`'s literal-name absence check is vacuous now that diffs are fingerprint-named | unit | add | new block in the D6/D9a-c test: correctness and testing (`--test-plan`) emit differing lists into one shared out dir → two distinct `.diff` paths, each carrying only its own list's header, re-emitting the same list+range adds no third file; D9e's iteration-1 check replaced with `fs.readdirSync(iterDir(1)).filter(.diff)` deep-equal `[]` |
| TST-2: the COR-1 file-count cap axis was pinned only at hardcoded `[7000, 2, 2]`, vacuous once `WAVE_THRESHOLD_LINES` is tuned; single-file edge case untested | the cap silently loses coverage as soon as the threshold changes, and a single-file scope's cap-to-1 case has no check | unit | add | replaced `[7000, 2, 2]` with `[2 * threshold + 1, 2, 2]` (derived from the tunable) and added `[threshold + 1, 1, 1]` |
| TST-3: the TST-1 static test duplicated the D3/D4 test's two severity-floor regexes, and D3/D4 is a strict superset | duplicate assertions drift independently and both need updating on any future floor-wording change (`code-style.md` §17) | static | remove | deleted the two duplicate lines from the TST-1 test; TST-1's title trimmed to drop the floor/cap clause it no longer asserts (D3/D4 keeps it) |

## Removed tests

| Test | Reason |
|---|---|
| TST-1 static test's two severity-floor regex assertions (`or in impl-review the current review wave's counter`, `User may override the cap (per wave in impl-review)`) | strict duplicate of the D3/D4 test's own assertions on the same `floor` text — the sole home per `code-style.md` §17; in-scope (`testing.md` TST-3), no approval needed |

Correction to `test-plan.entry-02.md`'s TST-1 row (`Added tests`, the `sprint-017 TST-1 (AC-2/AC-3) …` line): that row's test title and reason no longer match the test after this round's TST-3 fix (the floor/cap pin moved to D3/D4 alone; TST-1's own title is trimmed to `AC-2/AC-3): impl-review step 8 sends K<n …`, dropping the floor/cap clause). `test-plan.entry-02.md` is a closed rotated segment and stays unedited (`artifact-layout.md` "Test plan"); this row is the correction of record.

## Added tests

| Test | Regression proof |
|---|---|
| `tests/run.js:sprint-017 AC-8 (D9e) …` (COR-1: added a second same-dir, same-list, same-`--snapshot` emit after the draft changed again) | fail-first against pre-fix `.asd/runtime.js` (`git show 3cada92^:.asd/runtime.js` swapped in): `node tests/run.js` → exit 1, `222/224 passed`, FAIL `sprint-017 AC-8 (D9e) …` on the new COR-1 assertion at `tests/run.js:5406`. Restored via `cp` from a pre-swap backup, `cmp` byte-verified clean, `git status --short` showed only the intended `tests/run.js` test edit. Post-fix: green (Suite run below). |
| `tests/run.js:sprint-017 AC-4/AC-8 (D6/D9a-c) …` (TST-1: shared-out-dir differing-lists block; D9e's iteration-1 vacuous check replaced) | mutation `fingerprint(invocations)` → `fingerprint(ranges)` at `.asd/runtime.js:606` (drops the file list from the fingerprint) → exit 1, `222/224 passed`, FAIL `sprint-017 AC-4/AC-8 (D6/D9a-c) …` at `tests/run.js:5219` (`1 !== 2` — the two differing lists collided onto one `.diff`). Restored via `cp` from a pre-mutation backup, `cmp` byte-verified clean. |
| `tests/run.js:sprint-017 AC-1 (D1/D2) …` (TST-2: `[2 * threshold + 1, 2, 2]`, `[threshold + 1, 1, 1]`) | derived directly from `runtime.WAVE_THRESHOLD_LINES`/`MAX_REVIEW_WAVES`, so the axis stays a real mutation proof at any tuned threshold; covered by the existing per-case `assert.strictEqual` in the loop, no separate mutation needed beyond that loop's own |

Mutations were applied one at a time to `.asd/runtime.js`, each restored by `cp` from a pre-mutation backup in the same command sequence and byte-compared (`cmp`). The `.asd/runtime.js` swap/mutation runs also failed the `upstream_hashes`/`sync.js --check` guards — expected noise from editing a hashed file, per the entry-3 note this segment inherits.

## Suite run

- Command: `node tests/run.js`
- Scope: full (safety valve, see Entry log)
- Result: pass — `224/224 passed`, 0 failed, 0 skipped (exit 0). The runner has no skip state. Its one `(skipped: … only runs on win32 …)` line is a pre-existing in-test platform branch, not a skipped test.
- Lint / build: pass — `git diff --cached --check` exit 0 on the staged change (`tests/run.js`); `node .asd/sync.js --check` exit 0, `ok: true`
- HEAD: 4a1520ad359f8196ac162f75e587c72e054368eb plus the dev-chain review-fix commits `3cada92` (COR-1) and `2d33b83` (DOC-1), plus this round's staged `tests/run.js`, committed right after as this round's test commit

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 3 | `.claude/agent-memory/asd-reviewer-testing/project_split-part-rubric-rows.md` | AssertionError [ERR_ASSERTION]: COR-4/AC-7: agent memory is loaded on every dispatch, so a line describing a removed split, part or External batch as current contract reloads a false contract that "Scope hand-off" and the wave state contradict. A memory may name one only as absent ("no .part-N") or legacy; its owner rewrites or deletes the rest | sprint-017 AC-5/AC-7 (COR-4): no agent memory a dispatched agent loads names a review mechanism review waves replaced as live - only right after a negation in the same clause, or on a line naming it legacy | fixed | ace77e4 |
| D-2 | 3 | `.claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md` | AssertionError [ERR_ASSERTION]: COR-4/AC-7: agent memory is loaded on every dispatch, so a line describing a removed split, part or External batch as current contract reloads a false contract that "Scope hand-off" and the wave state contradict. A memory may name one only as absent ("no .part-N") or legacy; its owner rewrites or deletes the rest | sprint-017 AC-5/AC-7 (COR-4): no agent memory a dispatched agent loads names a review mechanism review waves replaced as live - only right after a negation in the same clause, or on a line naming it legacy | fixed | ace77e4 |

D-1: the whole memory, lines 3/8/12/14, describes split testing parts as the current contract, and its `MEMORY.md` index line points to it. D-2: line 32's sprint-012 anecdote says `--halve` is passed on interruption. Both files belong to `asd-reviewer-testing`. No impl role may write them, and that reviewer has no write tool (friction F-2/F-4), so the fix needs the COR-4 route: the owner supplies the text.
