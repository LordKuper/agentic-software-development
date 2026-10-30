---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 030-english-only-asd-issues

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | f334866b03b06470cadb74a21a92e1ba1692d024 | full change surface |
| 2 | ef2247b8f9c37f1ee6913c095488e66c4a10de6e | delta since entry 1 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `rotateDecisions` missing-`state.json` branch (review-fix F-2; new-sprint scope has no sprint folder state yet) | the CLI throws on a sprint folder with no `state.json`, or writes into it, aborting new-sprint scope | unit (CLI behaviour, fixture dir) | add | new branch with observable output; amended into the existing AC-9 rotate-decisions test, no new test |
| scope step 2a rewrite restricted to a listed marker issue (F-1) | the restriction dropped: a hand-filed issue is rewritten into the marker shape before rule 1 can flag it, then auto-closable by rules 2-3 | content contract | add | review finding F-1 named the missing pin; one assert in the existing AC-3 test on the marker literal ahead of the `gh issue edit` command |
| `artifact-layout.md` "Scratch directory" carve-out (F-4) | the remove-after-use rule contradicts the external-review cache that lives in the scratch directory | content contract | add | one assert in the existing AC-12 test on the cache citation; the existing `after use` assert still matches intent |
| "Rotation" sentence reorder (F-5), `asd-sprint` "None for new-sprint scope" (F-2), README English-issue wording (F-6) | prose-only; behaviour is the runtime's, covered by the AC-9 tests | — | none | no token that cannot be reworded; the cycle exception's behaviour is already asserted by the AC-9 rotate-decisions test |
| `tests/run.js` `.asd/` fixture marker (F-3), reviewer agent memory file | fixtures resolving the live repo; a false line in memory | — | none | the marker is covered by the Task 7 row of entry 1 (runner isolation exercised on every run); memory content is gated by `memory-check` at the orchestrator's commit and swept by the leftover-term test |
| leftover terms of the delta's removed lines (superseded rewrite sentence, rotation clause order) | a removed sentence survives in canon, README or agent memory | content contract (sweep) | none | repo grep of the exact removed sentences, agent memory included, returned no hit outside sprint folders and the scratch directory; the existing leftover-term test needs no new phrase (the sentences are rewordings, not a removed mechanism) |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-030 AC-9: rotate-decisions … (missing `state.json` assert) | mutation, the `existsSync` guard line removed from `rotateDecisions`: `node tests/run.js --filter "sprint-030 AC-9: rotate-decisions"` → exit 1, that test failing, matched 1; runs: 1 |
| tests/run.js: sprint-030 AC-1/AC-2/AC-3/AC-6 … (marker-restriction assert) | mutation, the rewrite sentence restored to the superseded "a listed issue whose title or body is not English": `node tests/run.js --filter "sprint-030 AC-1/AC-2/AC-3/AC-6"` → exit 1, that test failing, matched 1; runs: 1; control: "A non-marker issue keeps its text" reworded to "Any other issue keeps its text" keeps the test green, exit 0, matched 1 |
| tests/run.js: sprint-030 AC-7/AC-8/AC-10/AC-12 … (scratch carve-out assert) | mutation, the carve-out clause removed from the scratch rule: `node tests/run.js --filter "sprint-030 AC-7/AC-8/AC-10/AC-12"` → exit 1, that test failing, matched 1; runs: 1 |

All mutations were applied and restored inside one command each; the worktree held no source diff afterwards.

## Suite run

- Command: `node tests/run.js`
- Scope: full (the delta touches `.asd/runtime.js` and `tests/run.js`, shared infrastructure: safety valve at the step 8 gate); step 3 pre-authoring run `--filter "sprint-030"` (impacted set), 7/7 passed, exit 0
- Result: pass — 325 passed, 0 failed, 0 skipped (exit 0)
- Lint / build: pass — `git diff --cached --check` exit 0, `node .asd/sync.js --check` exit 0, `ok: true`
- HEAD: 70b4d6814abcbe3e769f012ea9ac3e92a026001b

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second defects section.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
