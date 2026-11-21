---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 037-quality-gates-ci-cost-ideas, entry 4 (rotated, never edited)

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Review-fix `wave-1/iter-01` combined F4: two `//` comments inside test bodies of `tests/runtime-timing.test.js` | a body comment against code-style §7 | none (static rule) | none | the two WHY lines moved into header comments above their tests; no behaviour changed |
| combined F6: the dispatch id to bundle file name mapping in `contextBundleBytes` (`.asd/runtime.js`) | a `/`, space or `#<n>` id maps to the wrong file name and `context_bytes` stays unfilled | extend the sprint-037 AC-2/AC-18 test with a `timing --open` case over scratch bundle files | extend existing | the AC-2/AC-18 test owns the `context_bytes` fill contract; the case reaches the real mapping through the CLI for `combined wave-1/iter-01` and `Task 2#2`, files cleaned in `finally` |
| external 11: `tests/run.js` logs a test that throws or rejects `null` as passing | a null throw reads as green, hiding a failing test | new runner-area test over a copied runner | new test | no test of the runner's pass/fail verdict on a falsy throw existed |
| behaviour-change fallout of combined F5: `checkGapProof` fails closed on a plan without `## Added tests` | the sprint-033 AC-27 fixture plan has no such section | fixture fix, an empty `## Added tests` table | test defect, fixed | not a code defect; the other new behaviours are left to the impl-test re-entry |
| `git diff dc162aad...HEAD` outside `.asd/sprints/**`: `context-check` reports a present `custom-*-rules.md` or `reliability-checklist.md` with no ceiling key as `ceiling: null` (combined F3 / external 4) | a project rules file created after the seed escapes every ceiling and the check stays green | extend `sprint-037 AC-1` (`runtime-timing`) with a ceilings file missing one project key | extend existing | the AC-1 test owns the context-check exit contract; the new case expects exit 1 and `[[<key>, null]]`. Fail-first mutation (`return { over: over.concat(unbounded) };` → `return { over };`, restored): `node tests/run.js runtime-timing --filter "sprint-037 AC-1"` → exit 1, `FAIL - sprint-037 AC-1: context-check exits 0 over the committed ceilings…` (1/21 matched, 0/1 passed) |
| `checkGapProof` fails closed on a plan with no `## Added tests` section and rejects a `{{…}}` Gap proof (combined F5 / external 9) | a plan whose Added tests heading was dropped, or whose template placeholder was never replaced, closes green | extend `sprint-037 AC-3/AC-13` (`runtime-tools`) with a plan lacking the section and a placeholder-proof plan | extend existing | the AC-3/AC-13 test owns the impl-test-close Gap proof refusals; two more refused cases in its existing batch. Mutations (restored): section guard → `return` and placeholder line disabled, each `node tests/run.js runtime-tools --filter "sprint-037 AC-3/AC-13"` → exit 1, `FAIL - sprint-037 AC-3/AC-13: test-delta splits the sprint diff…` (1/34 matched, 0/1 passed) |
| `impl-test-close` also validates the `test-plan.entry-NN.md` segment its re-entry rotated (external 8) | a rotated segment with an empty Gap proof closes green | extend `sprint-033 AC-27` (`runtime-tools`): a `--entry 2` refusal case with a bad entry-01 segment and a valid-segment control | extend existing | the AC-27 test owns impl-test-close's write-nothing-on-invalid-input contract. Mutation (`Number(flags.entry) > 1 && fs.existsSync(segment)` → `false && …`, restored): `node tests/run.js runtime-tools --filter "sprint-033 AC-27"` → exit 1, `FAIL - sprint-033 AC-27 (issue #109): impl-test-close fills the Entry log HEAD analysed…` (1/34 matched, 0/1 passed) |
| `checks-wait --repo <owner/repo>` is validated and forwards `-R` (combined F2) | a repo-scoped wait reads the default repo's PR, or a malformed repo reaches `gh` | extend `sprint-032 AC-4/AC-5` (`runtime-tools`) with a forwarded-argv case and a malformed-repo refusal | extend existing | the test owns the gh argv and the pre-gh refusal. Mutations (restored): `-R` forwarding dropped, and the `--repo` regex check dropped, each `node tests/run.js runtime-tools --filter "sprint-032 AC-4/AC-5"` → exit 1, `FAIL - sprint-032 AC-4/AC-5: checks-wait prints…` (2/34 matched, 1/2 passed) |
| the suite-baseline `over` compares in milliseconds (external 10) | a run past 1.5 times the median reads as not over because each side was rounded to whole seconds first | extend `sprint-037 AC-2/AC-18` (`runtime-timing`) with a millisecond case (2500 ms against a 1600 ms median) | extend existing | whole-minute ledgers never expose the rounding, so the case builds its ops in milliseconds. Mutation (`sprintMs > SUITE_OVER_FACTOR * baselineMs` → the rounded-seconds comparison, restored): `node tests/run.js runtime-timing --filter "sprint-037 AC-2/AC-18"` → exit 1, `FAIL - sprint-037 AC-2/AC-18: a dispatch open takes context_bytes…` (1/21 matched, 0/1 passed) |
| `--headroom` removed from `context-check` (combined F1) | a caller still passing `--headroom` | none | none | no test or canonical text passes it (`grep headroom` over `tests/` and `.asd/` rules, workflows, skills, agents, project is empty); an unknown flag is already warned by the generic ignored-flag path. No test added |
| `defectStalemate` reuses `planSection` (F12) | the Defects section lookup changes behaviour for the stalemate check | none (existing owner) | none | the existing stalemate tests in `runtime-review` own it and are green on this tree. No test added |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|
| tests/runner.test.js: sprint-037 external 11 | seeded `tests/run.js` defect (`if (!threw)` back to `if (failure == null)`): `node tests/run.js runner` → exit 1, `sprint-027 AC-9 (D9)` still ok, only the new test fails | mutation the same defect: `node tests/run.js runner --filter "sprint-037 external 11"` → exit 1, `sprint-037 external 11: the runner fails a test that throws or rejects with null…` (1/2 matched), restored; runs: 1 |
