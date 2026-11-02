# Test plan — sprint 030-english-only-asd-issues, entry 2 segment

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `rotateDecisions` missing-`state.json` guard (superseded by iter-02 combined.md F-1: guard removed) | a no-contract path called with a bare slug or wrong-cwd path exits 0 `{"rotated": false}` and silently skips the rotation, where the unguarded read fails loudly | — | none | the guard is unreachable by contract (`asd-sprint` excludes new-sprint scope, a sprint is active only through its `state.json`); its three `unborn` asserts in the AC-9 rotate-decisions test are dropped with it, the test keeps every reachable-path assert |
| scope step 2a rewrite restricted to a listed marker issue (F-1) | the restriction dropped: a hand-filed issue is rewritten into the marker shape before rule 1 can flag it, then auto-closable by rules 2-3 | content contract | add | review finding F-1 named the missing pin; one assert in the existing AC-3 test on the marker literal ahead of the `gh issue edit` command |
| `artifact-layout.md` "Scratch directory" carve-out (F-4) | the remove-after-use rule contradicts the external-review cache that lives in the scratch directory | content contract | add | one assert in the existing AC-12 test on the cache citation; the existing `after use` assert still matches intent |
| "Rotation" sentence reorder (F-5), `asd-sprint` "None for new-sprint scope" (F-2), README English-issue wording (F-6) | prose-only; behaviour is the runtime's, covered by the AC-9 tests | — | none | no token that cannot be reworded; the cycle exception's behaviour is already asserted by the AC-9 rotate-decisions test |
| `tests/run.js` `.asd/` fixture marker (F-3; superseded by iter-02 combined.md F-2) | a fixture without its own `.asd/` makes `sync.js` `findRepoRoot` and `update.js` resolve live canon | unit (runner isolation) | add | the Task 7 row of entry 1 covers cleanup only, so the marker had no check; one assert in the existing AC-9 rotate-decisions test: `sync.findRepoRoot(mkTempDir())` equals `FIXTURE_ROOT` |
| reviewer agent memory file | a false line in memory | — | none | memory content is gated by `memory-check` at the orchestrator's commit and swept by the leftover-term test |
| leftover terms of the delta's removed lines (superseded rewrite sentence, rotation clause order) | a removed sentence survives in canon, README or agent memory | content contract (sweep) | none | repo grep of the exact removed sentences, agent memory included, returned no hit outside sprint folders and the scratch directory; the existing leftover-term test needs no new phrase (the sentences are rewordings, not a removed mechanism) |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-030 AC-9: rotate-decisions … (fixture-root walk-up assert) | mutation, the marker line `tests/run.js:33` (`fs.mkdirSync(path.join(FIXTURE_ROOT, '.asd'))`) removed: `node tests/run.js --filter "sprint-030 AC-9: rotate-decisions"` → exit 1, that test failing (`findRepoRoot` resolved `REPO_ROOT`, expected `FIXTURE_ROOT`), matched 1; runs: 1; restored: same filter exit 0, matched 1 of 325 |
| tests/run.js: sprint-030 AC-1/AC-2/AC-3/AC-6 … (marker-restriction assert) | mutation, the rewrite sentence restored to the superseded "a listed issue whose title or body is not English": `node tests/run.js --filter "sprint-030 AC-1/AC-2/AC-3/AC-6"` → exit 1, that test failing, matched 1; runs: 1; control: "A non-marker issue keeps its text" reworded to "Any other issue keeps its text" keeps the test green, exit 0, matched 1 |
| tests/run.js: sprint-030 AC-7/AC-8/AC-10/AC-12 … (scratch carve-out assert) | mutation, the carve-out clause removed from the scratch rule: `node tests/run.js --filter "sprint-030 AC-7/AC-8/AC-10/AC-12"` → exit 1, that test failing, matched 1; runs: 1 |

All mutations were applied and restored inside one command each; the worktree held no source diff afterwards.
