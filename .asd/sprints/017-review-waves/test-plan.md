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
| 1 |  | full change surface |

Impacted set: full suite. The safety valve fires: the surface touches `.asd/runtime.js`, `.asd/hooks/session-start.js`, `.asd/release-manifest.json`, rule docs and workflows. These are framework-wide files that the `tests/run.js` runtime, hook, hash-ledger and content-contract tests all load. `commands.yaml` has no `test_affected`.

Pre-strategy run at `5b8ad95`: `node tests/run.js` → exit 1, `194/213 passed`. 19 FAILs:
- 18 pin contracts this sprint changed on purpose: t_review-scope.json keys, prompt transport, the `exclude_paths[]` carve-out, the split partition, the interrupted/split citation, `.part-N` naming, the correlated-interruption literal, the partial outcome, the `for iter-NN` tail, `emitCoverageManifests` (G-9, sprint-012 AC-12), the red-suite latch wording, the per-part CLI files, the `SPLIT_THRESHOLD_FILES`/`DISPATCH_CEILING` citers, surface-check `dispatches` (sprint-014 AC-5 and sprint-015 AC-11), the `.part-N` finding-id prefix, and the sprint-015 AC-4/AC-5 part output.
- 1 is a test defect: `SessionStart hook: Codex gets $asd-* form` ran the hook against the live sprint, whose branch `claude/asd-sprint-4y74bx` contains `/asd-sprint`.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `.asd/runtime.js` `reviewWaveCount`/`numstatLines`/`validateWaveDivision` (D1, D2) | wrong wave count at the boundaries, a binary file or rename counted, a division that places a file twice or nowhere accepted | unit/property | add | pure functions whose boundaries (0, threshold, threshold+1, cap) and rejection cases are the contract; cheapest exact check |
| `review-waves` CLI over real `git diff --numstat -z -M` (D1, D2) | the `-z` rename record parsed against the wrong token, `waves.json` written for a rejected division | component/contract | add | only a real git range proves the parser against git's actual rename/binary output; fixture repo, no network |
| `emit-manifest --reviewer external` (D9a, D9b) | scope.json drifts from `t_review-scope.json`/external-review.md, a rubric manifest written, `wave` missing in impl-review | component/contract | add | public External Review contract; the key set is derived from the rule's `Manifest fields:` line |
| `--full-files`/`--full-base` (D6, D9c) | wave-list or carried-over files diffed over the incremental range only, listed twice, flags accepted without a range | component/contract | add | fixture repo with base, mid and head commits separates the two ranges |
| Testing `--test-plan` in `.diff` (D9d) | a changed test-plan left out of Testing's diff | component/contract | add | extends the existing sprint-015 AC-4/AC-5 fixture: the test-plan changes in range |
| `draft-snapshot` copies + `--snapshot` diff (D9e) | no content to diff at iteration 2+, a diff written at iteration 1, a copy landing outside `snapshot/` | component/contract | add | temp-dir drafts over `git diff --no-index`; one test covers iteration 1, iteration 2 and the rejections |
| Parts removed from `emit-manifest` (D7) | a large scope is still split, or extra files are written | component/contract | keep | the rewritten CLI test asserts one manifest for a `SURFACE_CAP_FILES`-file scope and nothing else in the dir |
| `surfaceCheck` without `dispatches` (D7) | the result shape still carries the field, or the override request still quotes it | unit + static | keep | updated sprint-014 AC-5 test: exact `{files, cap, breach}` plus a declaration-line check |
| `.asd/hooks/session-start.js` both `reviews.impl` shapes (D3, D10) | throws on a malformed shape, reads wave 1 instead of the current wave, picks the latest iteration lexically | component | add | runs the hook in a temp repo over the seed, a multi-wave shape, the legacy flat shape, iter-99/iter-100 and 7 malformed shapes |
| Rules: review wave, iteration id, `t_state.json` seed, readers (Task 3, D3, D4, D10) | a second wave definition, a seed node whose fields differ from the definition, stale `reviews/impl/iter-NN` paths, readers ignoring waves | static/arch | add | set derived from the definition line; sweep over canon Markdown and README |
| "Scope hand-off" single home (Task 4, D8) | the triple restated elsewhere, or a hand-off site that does not link it | static/arch | add | citer set includes every internal reviewer, derived from the agent files |
| Removed mechanisms (AC-5, AC-7) | a live canon, README, runtime or hook line still telling an orchestrator to split, halve, batch or quote dispatches | static/arch | add | one sweep; a line only passes when it names legacy handling |
| External Outcome contract without partial (D7) | the partial outcome survives at an emitting or rendering site | static | keep | Outcome-contract test rewritten: exactly two outcomes, the partial only on the legacy State-recovery line |
| Interrupted-dispatch escalation (D7) | the workflows still re-split after a second interruption | static | keep | AC-6a test extended with the Escalation rule and both workflow bullets |
| Wave sequencing orchestration in `asd-phase-impl-review.md` (D5, D6) | the orchestrator advances or reopens waves wrongly | — | none | orchestration prose run by the main orchestrator, with no executable surface beyond the runtime commands tested above. Its literals are pinned by the static checks. This sprint's own impl-review runs it live (plan Risks "Self-hosting bootstrap") |
| README / `release-manifest.json` (Task 6) | mirror drift, stale hashes | static | keep | the existing `upstream_hashes` and `sync.js --check` tests already cover it |
| `tests/run.js` `runHook` (test defect) | the provider-form check depends on the live sprint's branch name | component | keep (fixed) | `runHook` now runs a copy of the hook in a temp repo with a fixture sprint |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| `tests/run.js:AC-1/6/sprint-012 AC-3: emit-manifest partitions a scope above SPLIT_THRESHOLD_FILES into ceil(files / threshold) disjoint near-even parts …` | implementation-coupled to a removed mechanism: split parts, `SPLIT_THRESHOLD_FILES`, `--halve`, `outOfPart` | no — pre-authorized, decisions-log.md 2026-09-24 (removed mechanism) |
| `tests/run.js:sprint-015 AC-11: surface-check dispatches bounds the impl-review dispatches its bound implies …` | implementation-coupled to a removed mechanism: surface-check `dispatches` and `--test-plan-files` | no — pre-authorized, decisions-log.md 2026-09-24 (removed mechanism) |
| assertions inside rewritten tests (AC-4/AC-11/AC-14 split bullet; sprint-012 AC-12 ORC-1 per-part predicates; CLI per-part/`--halve` files; symbol citers `SPLIT_THRESHOLD_FILES`/`DISPATCH_CEILING`; DOC-1 `.part-N` prefix; sprint-015 AC-4/AC-5 `--halve` parts; t_review-scope `base_ref`/`head_ref`/`exclude_paths`; prompt `exclude_paths[]` carve-out) | implementation-coupled to removed mechanisms; each test keeps its other assertions, updated to the new contract | no — pre-authorized, decisions-log.md 2026-09-24 (removed mechanism) |

## Added tests

| Test | Regression proof |
|---|---|
| `tests/run.js:sprint-017 AC-1 (D1/D2): review-waves counts one wave per WAVE_THRESHOLD_LINES begun …` | mutation `numstatLines` counts a rename at its source: `node tests/run.js` → exit 1, this test + the review-waves CLI test FAIL; mutation drop `MAX_REVIEW_WAVES` cap → exit 1, this test FAILs; mutation drop the unplaced-file check → exit 1, this test + CLI test FAIL |
| `tests/run.js:sprint-017 AC-1 (D1/D2): review-waves measures a real git range over the scope list …` | same runs as above (rename-source and unplaced-file mutations) → exit 1, this test FAILs |
| `tests/run.js:sprint-017 AC-4/AC-8 (D6/D9a-c): emit-manifest --full-files/--full-base joins the listed files …` | mutation `rangeOf` always returns the scope range: `node tests/run.js` → exit 1, this test FAILs; mutation External scope drops `wave` → exit 1, this test FAILs |
| `tests/run.js:sprint-017 AC-8 (D9e): draft-snapshot copies each draft beside its snapshot …` | mutation `snapshotPatchInvocations` emits nothing: `node tests/run.js` → exit 1, this test FAILs |
| `tests/run.js:sprint-017 AC-6 (D3/D10): SessionStart reads the current review wave's node …` | mutation hook sorts `iter-NN` keys lexically: `node tests/run.js` → exit 1, this test FAILs; mutation hook always reads `waves[0]` → exit 1, this test FAILs |
| `tests/run.js:sprint-015 AC-4/AC-5 …` (added D9d assertion: test-plan path in Testing's `.diff`) | mutation diff written for the scope `files` instead of `manifest.files`: `node tests/run.js` → exit 1, this test FAILs |
| `tests/run.js:sprint-017 AC-5/AC-7: no live canon, README, runtime or hook keeps a mechanism review waves replaced …` | n/a (static sweep, green on current canon) |
| `tests/run.js:sprint-017 AC-1/AC-6 (D3/D4): the review wave and the impl-review iteration id are defined once …` | n/a (static contract) |
| `tests/run.js:sprint-017 AC-8 (D8): review-policy.md "Scope hand-off" is the sole home …` | n/a (static contract) |

Mutations were applied one at a time to `.asd/runtime.js` or `.asd/hooks/session-start.js`, each restored by `cp` in the same command and byte-compared (`cmp`). Every mutated run also failed the `upstream_hashes` guard, and the hook ones the `sync.js --check` guard. Both are expected noise from editing a hashed file.

## Suite run

- Command: `node tests/run.js`
- Scope: full (safety valve, see Entry log)
- Result: pass — `219/219 passed`, 0 failed, 0 skipped (exit 0). The runner has no skip state. Its one `(skipped: … only runs on win32 …)` line is a pre-existing in-test platform branch, not a skipped test.
- Lint / build: pass — `git diff --cached --check` exit 0 on the staged change; `node .asd/sync.js --check` exit 0, `ok: true`, 72/72 items `current`
- HEAD: 5b8ad95 — the working tree plus this entry's staged `tests/run.js` and this file, committed right after as the entry's test commit

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
