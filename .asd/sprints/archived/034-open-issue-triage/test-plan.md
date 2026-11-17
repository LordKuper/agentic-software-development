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
| 4 | 6917dfd4 | delta since entry 3 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| review-fix iter-02 delta `de82f25f...HEAD` (`909aa105`, `2b71716c`, `ff55b8a9`, `9bcbce7c`, sync `4bc78661`) | a regression of any of the four fixes, or a stale generated mirror | existing tests (the iter-02 pins of `805b85b1`, rotated in `entry-03`) and `node .asd/sync.js --check` | none | each fix is pinned with recorded fail-first and mutation proof in the rotated `entry-03` rows; the full run below at `805b85b1` is green and nothing but sprint bookkeeping and `test-plan.md` changed after it. A new test would duplicate a check (`code-style.md` §17 hypothetical-risk) |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no test is trivial, redundant, mock-confirming, implementation-coupled or flaky on the delta | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| none | decision `none` above: the iter-02 pins already cover the delta | — |

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
- Scope: full — unfiltered `node tests/run.js`, every test file, no test filter (review-fix iter-02 run, reused at entry 4 as the step-3 observation and the step-8 gate: `805b85b1` is the last commit touching code, tests or stubs, and `HEAD` differs only in sprint bookkeeping and `test-plan.md`)
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
