---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 037-quality-gates-ci-cost-ideas

## Entry log

Appended each entry, never rewritten. `HEAD analysed` is the commit the strategy/prune passes
were scoped through; the next re-entry's delta is `git diff <this sha>...HEAD`.

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | bbb52783 | full change surface |
| 2 | b6f345ae | delta since entry 1 |
| 3 | dc162aad | delta since entry 2 |
| 4 | 7e8c5385 | delta since entry 3 (review-fix `wave-1/iter-01`) |
| 5 | 6104618d | delta since entry 4 (review-fix `wave-1/iter-02`) |
| 6 | 03d77433 | delta since entry 5 (review-fix `wave-1/iter-03`, iter-03 memory fixes) |

## Risk → check decisions

Entry 1's rows, removals and added tests moved to `test-plan.entry-01.md`, entry 2's to `test-plan.entry-02.md`, entry 3's to `test-plan.entry-03.md`, entry 4's (the review-fix `wave-1/iter-01` rows) to `test-plan.entry-04.md`, entry 5's (the review-fix `wave-1/iter-02` rows) to `test-plan.entry-05.md`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `git diff 6104618d...HEAD` outside `.asd/sprints/**`: `checkGapProof` refuses a pipe-less row in `## Added tests` with `Added tests table row lacks a leading pipe` (external 6) | a row typed without its leading pipe is filtered out of the table and never checked, so an empty-proof row closes green | extend `sprint-037 AC-3/AC-13` (`runtime-tools`) with a well-formed table followed by a pipe-less row expecting status 2 and the refusal | extend existing | the AC-3/AC-13 test owns the Gap proof refusals and already holds the valid control (`filled`, status 0). Mutation (the pipe-less `fail` line removed, restored): `node tests/run.js runtime-tools --filter "sprint-037 AC-3/AC-13"` → exit 1, `FAIL - sprint-037 AC-3/AC-13: test-delta splits the sprint diff…` (1/34 matched, 0/1 passed) |
| same function: the placeholder refusal is start-anchored (`cells[column].startsWith('{{')`), so `{{x}} (pending)` is refused and mid-text `{{X}}` still closes (external 7) | a half-replaced template cell with trailing text slips past the whole-cell anchor | extend the same test with a `{{seeded defect}} (pending)` row expecting the placeholder refusal; the mid-text `{{X}}` control from entry 5 stays | extend existing | one assert on the same test. Mutation (`startsWith('{{')` → the whole-cell `/^{{.*}}$/` test, restored): same command → exit 1, same failing test (1/34 matched, 0/1 passed); `git status` after the run shows `.asd/runtime.js` unmodified. runs: 2 (both mutations of this entry) |
| prose changes of `cd79c7ec` and `7c160ef3`: the suite-revision proposed-row route (`asd-phase-impl-test.md` step 9a, `asd-tester.md`), `gh api --hostname <host> --paginate` open-PR number list, `gh auth status --hostname`, the checklist seed after all rows, closing only AC-line `(PR #N)` PRs (`asd-phase-pr.md`) | a machine-parsed token of these steps drifting | none | none | a grep of `tests/contract-*.js` and `tests/runtime-*.test.js` for `gh pr list`, `created-asc`, `gh api`, `auth status`, `--seed`, `(PR #`, `isDraft` hits no pin of any of these tokens; the changes are prose of orchestrator-run `gh` sequences and a dispatch route no machine parses (code-style §17: a prose fix adds a test only for a machine-parsed token) |
| iter-03 memory-fix commits `71b411ea`, `ba739293` and the view sync | none reachable by a test | none | none | agent memory text and generated views; `node .asd/sync.js --check` (`ok: true`) and the full suite cover the views |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Gap proof | Regression proof |
|---|---|---|

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once the last review wave's reviewers are
APPROVE/latched. The review-fix tester also records here the check a finding requires; `impl-test`
step 8 reuses it per "Impacted test set". The `pr` gate always reads whatever is recorded here last — the full-suite
record, by the time `pr` runs. Each per-entry record measures only the tree that entry
analysed, not any tree produced later
(`.asd/rules/sprint-lifecycle.md` "Impacted test set").

- Command: `node tests/run.js` (every area, `hooks` and `migrations` included)
- Scope: full — `.asd/runtime.js` changed and every area reaches it through `tests/lib.js`, so no narrower set is honest; the suite op `suite-impl-test-6` brackets the run (the entry 6 mutation runs are `--filter` runs recorded under Risk → check decisions)
- Result: pass — exit 0, 311 passed, 0 failed, 0 skipped (311 tests)
- Lint / build: `git diff --cached --check` exit 0; `node .asd/sync.js --check` exit 0 (`ok: true`)
- Slowest tests: 2038 ms sprint-023 AC-2 git-strategy.md "Branch" commands; 1449 ms sprint-019 AC-8 one-command commit form; 1137 ms sprint-036 AC-14 agent-liveness --returns; 1081 ms sprint-021 AC-7 (D7) agentLiveness
- HEAD: 03d77433 (the run tree includes this entry's staged `tests/runtime-tools.test.js` edit)
- Line delta: tests +8716/−11522 (net -2806); other +790/−196 (net 594)

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | AGENTS.md | AC-20: canon still describes the suite as one file — AGENTS.md "Build and lint" (`tests/run.js` is a real … test runner), "Phase chain" (`tests/run.js` §16), "Conventions" (`tests/run.js` among Node code); sprint-lifecycle.md "Cleanup phase" step 3 (impacted set is the full `node tests/run.js`) | none (AC-20) | fixed | 0c10f603 |
| D-2 | 2 | `.asd/release-manifest.json` `upstream_hashes` | the D-1 fix edited `.asd/rules/sprint-lifecycle.md` and `.asd/workflows/asd-phase-retro.md`; their recorded hashes no longer match the files (recompute after editing) | `release-manifest.json: every upstream_hashes entry matches the actual file (relative to repo root)` | fixed | 33ae3490 |

## Suite revision (optional)

Only when the sprint's accepted scope asks for one (`.asd/agents/asd-tester.md` "Suite revision"). The ledger is the resume point: the orchestrator dispatches again until no area is `pending`.

- Before: 430 tests (416 passing, 14 failing on pins this sprint changed), 11573 `tests/run.js` lines, 70.7 s full run (`node tests/run.js`, one file, at `13292f6a`, before this entry's edits)
- Split: `0b9c1b80` — `tests/run.js` (loader) + `tests/lib.js` + 15 `tests/<area>.test.js`; sorted test-name list identical before and after (433 names, `diff` empty), full run 433/433 green, 82.3 s on a loaded machine (the same tests ran 70.7 s before: spawn-heavy tests vary about 20% between runs)
- After: 310 tests, 8685 lines over `tests/*.js` (`tests/run.js` loader 79 lines, `tests/lib.js`, 15 area files), 40.6 s full run (`suite impl-test#7` at `369eac49`); an area run is `node tests/run.js <area>…`

| Area | State | Tests before → after | Seeded-defect proof |
|---|---|---|---|
| runtime-review | done | 44 → 43 | fdb3515e, 03bc9ea8, 82b1807f: git fixtures built by one `git fast-import` spawn (`importCommits`) or copied from a template repo (`sandboxGitRepoFrom`), latch scenarios async and sharing one base commit, the two validate-ledger CLI tests merged into one; area 30.4 s → 13.7 s. Seeded (each restored in a `finally`, `--filter` run exit 1 naming the owner): `GIT_ARGS_BUDGET` 32000 → 3200000 (sprint-031 AC-9); every rename pure (sprint-015 AC-4/AC-5); `--full-base` read from `--base` (sprint-017 AC-4/AC-8); byte axis of review-waves dropped; line axis dropped; wave-files ignoring renames; substitution discount halved, semantic header dropped, deleted count 0 (rename-map); `--base-ref` reading the tree instead of the ref; latch-refresh without the per-reviewer clear and with an unlisted file keeping latches; floor off by one (persist-review --floor); validate-ledger CLI printing `{ok:false}` for a valid ledger, and its findings check disabled (merged CLI test) |
| runtime-tools | done | 34 → 34 | cc2a58f3, 03bc9ea8: commit-check, impl-test-close, test-delta, commit-form and memory-check cases run as parallel scenarios with their own out dirs and fast-imported fixtures; every test name kept (list identical to HEAD); area 15.6 s → 11.9 s, the rest spawn-bound per test (attribution-check, design-tokens, checks-wait). Seeded (restored, exit 1 on the owner): impl-test-close filling the wrong entry row, accepting a multi-line `--line`, dropping its decisions line; test-delta allowance never required and the allowance line unchecked (sprint-037 AC-3/AC-13); commit header limit 50 → 90; misplaced trailer passing; memory-check reading unstaged, ignoring new file names, counting every diff line |
| runtime-routing | done | 22 → 21 | aa95f2e7: the three preflight cache tests use a stand-in `node` (`withExitZeroNode` preload) instead of `.cmd` stubs, so the PowerShell hop stays in its one `.cmd` test; positiveInteger and unread-flag cases run as async batches; the typed-vs-legacy risk test and two duplicate assertions removed (see Removed tests); area 10.4 s → 2.1 s. Seeded (restored, exit 1 on the owner): fingerprint ignoring model, command or auth generation (AC-5 negative-cache); expiry `>` → `>=`; persisted entry echoing an extra field; positiveInteger refusing zero padding; unread-flag warning dropped; legacy bare-string risk read as artifact, typed change risk read as artifact |
| runtime-timing | done | 21 → 21 | 782c2a21, ccb36289: both agent-liveness CLI tests and the context-check test start their independent runs together (2.1 s → 1.1 s each, 1.05 s → 0.76 s), the host-rule and routed-agent dispatch-fill tests give each case its own ledger and run side by side (0.36 s, 0.41 s → about 0.25 s each); the remaining 17 tests are distinct contracts, no duplicate found; the 1 s liveness poll floor is production behaviour; area now 5.6 s. Seeded (restored, exit 1 on the owner): `STALL ` print renamed; `unobservable` verdict renamed; context-check exit code forced 0; host rule inverted; routed lookup reading the wrong key; a never-opened close writing a line; standard tier given a suffix; command execution given an agent; a given agent overwritten |
| hooks | done | 14 → 10 | 86ea4c89, 3d37e159: one `hookContext` builds the sprint tree once and the hook runs for every case of a contract in one async batch; the Claude/Codex form tests, the three verdict-map tests and the AC-21 test merged into table-driven survivors, every assertion kept (see Removed tests); area 3.6 s → 1.7 s. Seeded (restored, exit 1 on the owner): skill form inverted per provider; APPROVE prefix never matching; legacy skips alone reading green; iterations sorted lexically; merged-unclosed never and always done; conflict warning off; archived done sprint recovered; archived phase outside the chain recovered; `Next phase:` line renamed |
| sync-cli | done | 14 → 10 | seeded, each red: bare `--apply` and not-found batch recomputing the ledger → `each abort the batch`; link guard disabled → `refuse the link`; stderr CR/LF fold weakened → `unsupported or spans CR and LF`; orphan sole-failure → `--check exits 1 when a marked orphan` |
| sweeps | done | 13 → 0 | no survivor: the 13 one-time removal sweeps of sprints 021-036 go wholesale (AC-19); nothing to seed |
| contract-rules | done | 31 → 14 | seeded, each red (`node tests/run.js contract-rules --filter <name>` exit 1, restored): `--cached` dropped from commands.yaml lint → `AC-6: commands.yaml`; `core.md` See-also entry renamed → `is the rule-doc index`; `### Documentation economy` renamed → `Documentation economy id`; `priorTier` renamed in providers.md → `states every input key`; `tmpdir()` appended to sync.js → `no ASD script calls the OS temp`; `--ff-only` dropped in git-strategy.md → `sprint-023 AC-2` |
| contract-workflows | done | 63 → 23 | seeded, each red: `codex_command` renamed in t_config.yaml; `APPROVE (skipped:` altered in t_review-report.md; `findings resolved` reworded in asd-phase-impl.md; `c4` dropped from reserved ids; `test-plan.entry-NN.md` renamed in README; bogus flag on the impl-review `emit-manifest` line; `latched` dropped from t_state.json; `AskUserQuestion` added to asd-advisor; `report_by` altered in agent-protocol.md; `await-merge` dropped from the README pr row; `Grep` dropped from the impl skill allowed-tools; `asd-scout` dropped from the cleanup Owner line; `{{CLEANUP}}` renamed in scope; `safety_valve` flipped in t_config.yaml; two phases swapped in the `core.md` glossary chain — each fails its owner test |
| contract-agents | done | 25 → 8 | seeded, each red: `Write` added to asd-advisor tools → `read-only agents`; Claude view `maxTurns: 99` → `maxTurns cap`; `full` renamed in the t_test-plan.md Scope line → `scope values "Operation timing" lists` |
| contract-templates | done | 34 → 14 | seeded, each red: extra key in t_review-scope.json; `skip_design_phases` appended to t_config.yaml; TOC threshold 9 in artifact-layout.md; `<iteration id>` renamed in README; `checklist-hits` renamed in retro — each fails its owner test |
| sync-render | done | 61 → 56 | seeded, each red: `sonnet/` added to README family list and runner effort `low` → `the model family and effort each agent renders`; `writtenKeys` forced true → `combined F1/F2`; `renderOwnedArray` keep-raw shortcut disabled → `attribution-only json-merge re-render`; `statusJsonMerge` catch → `stale` → `statusJsonMerge stays safe` |
| update | done | 37 → 36 | the canon_hashes agent-coverage test merged into the entry-matches-file test, both assertions kept (see Removed tests); the other 35 split pure state-machine classification (no I/O) from driver write behaviour, different contracts, and cost 0.3 s together, nothing to speed. Seeded (manifest restored in a `finally`): an agent entry renamed away in `.asd/release-manifest.json` → `--filter "canon_hashes has an entry for every"` exit 1; an agent hash altered → same filter exit 1 |
| migrations | done | 19 → 19 | no change: each test owns one migration version or one branch of it (6.0.0: last member / multi-line / nested shadow / printed recovery, 4.0.0: three commands.yaml states), no duplicates, 0.34 s for the area; nothing seeded because no test changed |
| runner | done | 1 → 1 | the `--filter` test no longer reads the loaded test list, so an area run passes; extended with `runtime-timing --filter` pass, `hooks --filter` of a runtime-timing test → exit 1, `no-such-area` → exit 1 `unknown area`; seeded: loader ignores area arguments (`for (const area of known)`) → `--filter "sprint-027 AC-9"` exit 1, 1 matched, fails; unknown-area refusal disabled (`if (false)`) → same filter exit 1, fails |
