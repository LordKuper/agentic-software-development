---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 034-open-issue-triage

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 5922badb | full change surface |
| 2 | 5a0e9aaa | delta since entry 1 |
| 3 | de82f25f | delta since entry 2 |

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

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| sprint-034 AC-1/AC-3 (combined-3, combined-4, external-3) (new) | Pre-fix tree: `node tests/run.js --filter "sprint-034 AC-1/AC-3 (combined"` in a `git archive 3666182b` extraction with the new `tests/run.js`, exit 1, failing test `sprint-034 AC-1/AC-3 (combined-3, combined-4, external-3)` (1/375 matched), `-f` on the label create. Mutations, same filter, exit 1, same failing test, 1/375 each: add ` -f` to the step 2a create; drop the list before the create; restore `deferred`/`wontfix` to step 2a's ensure list. Control: reword the "creates only a missing label" prose, exit 0, 1/375. runs: 4 |
| sprint-034 AC-10/AC-11 (re-pinned on the restored clause; title fixed) | Pre-fix tree, `--filter "sprint-034 AC-10/AC-11"`, exit 1, failing test `sprint-034 AC-10/AC-11 (033#P-1, issues #86, #119)` (1/375). Mutation: remove ", or an impacted set holding all of them" from `sprint-lifecycle.md` "Impacted test set" **Scope.**, citations kept, exit 1, same test, 1/375. runs: 1 |
| sprint-034 AC-1/AC-2/AC-5/AC-6/AC-7 (re-pinned: checked `<origin>` before `gh repo view`, skip clause, project bullet plans no write) | Pre-fix tree, `--filter "sprint-034 AC-1/AC-2/AC-5"`, exit 1, failing test `sprint-034 AC-1/AC-2/AC-5/AC-6/AC-7 (issue #110)` (1/375). Mutations, exit 1, same test, 1/375: restore the unchecked `"$(git remote get-url origin)"` substitution in step 2a; drop the "`<origin>` lookup with a non-zero exit or empty output" skip clause. runs: 2 |
| sprint-034 AC-4 (issue #110) (re-pinned: checked `<origin>` in pr merge step 2) | Pre-fix tree, `--filter "sprint-034 AC-4 (issue"`, exit 1, failing test `sprint-034 AC-4 (issue #110)` (1/375). Mutations, exit 1, same test, 1/375: restore the unchecked substitution in `asd-phase-pr.md`; drop the "(an `<origin>` lookup with a non-zero exit or empty output included)" clause. runs: 2 |
| sprint-029 AC-1..8 (re-pinned: every label scope applies is ensured, by step 2a or step 4) | Pre-fix tree, `--filter "sprint-029 AC-1/AC-2"`, exit 1, failing test `sprint-029 AC-1/AC-2/AC-3/AC-4/AC-5/AC-6/AC-7/AC-8` (1/375) on step 4 holding no "ensured as in step 2a". Mutation: step 4's "ensured as in step 2a" reworded to "written", exit 1, same test, 1/375. runs: 1 |

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once the last review wave's reviewers are
APPROVE/latched. The review-fix tester also records here the check a finding requires; `impl-test`
step 8 reuses it per "Impacted test set". The `pr` gate always reads whatever is recorded here last — the full-suite
record, by the time `pr` runs. Each per-entry record measures only the tree that entry
analysed, not any tree produced later
(`.asd/rules/sprint-lifecycle.md` "Impacted test set").

- Command: `node tests/run.js`
- Scope: full — unfiltered `node tests/run.js`, every test file, no test filter (review-fix iter-02, after the pin updates for combined-1, combined-2, combined-3, combined-4, external-1, external-2, external-3)
- Result: pass — 375 passed, 0 failed, 0 skipped of 375, exit 0 (before the pin updates 370/374: four pins on contracts the iter-02 fixes changed)
- Lint / build: pass — `git diff --cached --check` exit 0 at the commit, `node .asd/sync.js --check` exit 0
- HEAD: 805b85b1

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/workflows/asd-phase-impl.md | AssertionError [ERR_ASSERTION]: orchestrator/impl: 145288 B is 0.7055 of 205926 B, ceiling 0.7 | sprint-026 AC-16 (D13): per-dispatch load of dev (impl), tester (impl-test), combined reviewer (impl-review) and the orchestrator (impl) is at most 0.70 of its main baseline | fixed | 26326883 |
| D-2 | 1 | .asd/release-manifest.json | AssertionError [ERR_ASSERTION]: upstream_hashes entries out of date (recompute after editing): .asd/rules/providers.md, .asd/workflows/asd-phase-design-review.md, .asd/workflows/asd-phase-impl-review.md, .asd/runtime.js, .asd/rules/agent-protocol.md | release-manifest.json: every upstream_hashes entry matches the actual file (relative to repo root) | fixed | 56e0e1dc |
| D-3 | 1 | .asd/workflows/asd-phase-pr.md | AssertionError [ERR_ASSERTION]: AC-1: every canon file that creates or closes an issue must cite the Matrix row, or its text is written in whatever language the session speaks | sprint-030 AC-1/AC-2/AC-3/AC-6: the Matrix holds the one ASD-repo issue-language row, every canon site writing issue text cites it, retro renders the published issue in English, scope rewrites a non-English marker issue in place before triage rules 1-4 and logs it, and an interview question defines its framework terms | fixed | a7efba4f |
| D-4 | 1 | docs/architecture/tech-reference/gh-2.90.md | AssertionError [ERR_ASSERTION]: AC-4/AC-15: every gh call the consumer close names must be in the gh tech reference | sprint-034 AC-4 (issue #110): pr merge mode closes a consumer project's included issues the merge left open from the (issue #N) of the merged sprint.md, skipping a closed one, with no gate and no FAILED; every gh call it names is in the tech reference and its exit writes and the gate inventory name it | fixed | ba6f6f01 |
| D-5 | 1 | .asd/runtime.js | AC-9 lists `agent` among the dispatch attrs the runtime fills from `task_routing` or the agent's frontmatter; `timing --open --kind dispatch` fills only `tier` and `model`, a dispatch opened without an `agent` attr records none and warns nothing about it (the open of `impl-test-1` in this sprint's ledger carries `attrs: {}`) | none (AC-9) | fixed | 43dd1920 |

D-1 measured: HEAD loads 145288 B (workflow 22197 B + context bundle 123091 B) against a 144148 B ceiling, 1140 B over; at the impl-start commit 4c1f6e66 it was 144092 B (0.6997), 56 B under. The sprint grew `asd-phase-impl.md` +92 B, `agent-protocol.md` +158 B, `checkpoints.md` +179 B, `language-policy.md` +87 B, the "Phase table" section +42 B, "Operation timing" +197 B, "Impacted test set" +348 B and artifact-layout "Test plan" +93 B (+1196 B in all).
D-2: the ledger is recomputed by any valid `node .asd/sync.js --apply` (`asd-phase-impl.md` step 7), an orchestrator step after the last canon edit of D-1/D-3/D-4/D-5's fix round; no test edit applies.
D-4: `gh issue view` is used by this sprint's consumer close and by the older self-hosting release close, and the reference lists neither; the other gh calls of the clause are present.
D-5: neither named source holds the agent name (`task_routing` records `execution`, `tier`, `reason`, `raise_effort`, `resolved_model`; the frontmatter lookup is keyed by the agent), so the fix is an AC or rule wording decision, or the orchestrator passing `agent=` on every dispatch open.
