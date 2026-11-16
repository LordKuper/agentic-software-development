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

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `.asd/runtime.js` `fillDispatchAttrs` agent fill (AC-9, D-5) | a wrong agent name (`asd-dev-standard`), an agent given to an `execution: command` id, an overwritten caller `agent` or an unnamed unresolved agent mis-records every dispatch | CLI over a real `state.json` (the lookups are not exported) | add | one test over five routed ids: standard gives `asd-dev`, the other tiers `asd-dev-<tier>`, a command id no agent and the warning `agent unresolved`, a given `agent=` kept |
| `sprint-lifecycle.md` "Operation timing" agent sentence (D-5) | prose restating the code mapping drifts | none | none | the mapping is pinned in behaviour by the row above; a prose pin would copy the same fact (`code-style.md` §17 hypothetical-risk) |
| D-1 trim of six rule docs and `asd-phase-impl.md` (no meaning change intended) | a removed clause carried a rule no other text states | review of the commit's word diff against each clause's remaining or cited home | none | every changed fragment kept its meaning or its home; three removed standalone sentences are reported, none tied to an AC-N, none a gate or safety clause: the `null` verdict write (`sprint-lifecycle.md`), `Reviewers stay strong and fresh` (`providers.md`), the `where the clearing happens is out of scope` clause (`sprint-lifecycle.md`) |
| D-3 Matrix cite, D-4 `gh issue view` | the fixed assertions regress | existing tests | keep | the sprint-030 Matrix test and the sprint-034 AC-4 test, red at entry 1, are green and pin both fixes; no gap |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no test is trivial, redundant, mock-confirming, implementation-coupled or flaky on the delta | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-034 AC-9 (D-5): a routed execution-agent id is filled with asd-dev for tier standard and asd-dev-<tier> otherwise, an execution-command id gets no agent and warns naming it, and a given agent attr is never overwritten | fail-first vs 43dd1920~1 (git archive plus the new run.js): `node tests/run.js --filter "sprint-034 AC-9 (D-5)"` → exit 1, this test (`AC-9: Task standard is recorded with its agent, tier and model from task_routing`, 1 matched); mutations on the fixed runtime, each in the scratch copy: M7 (command ids also get an agent), M8 (standard gives `asd-dev-standard`), M9 (fill overwrites a given agent), M10 (agent dropped from the unresolved list): same filter → exit 1 each, this test (1 matched); runs: 4 |

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
- Scope: full — the suite is the one file `tests/run.js`, which references every changed path, so the impacted set is the whole suite
- Result: pass — 374 passed, 0 failed, 0 skipped of 374, exit 0
- Lint / build: pass — `git diff --cached --check` exit 0, `node .asd/sync.js --check` exit 0
- HEAD: 48ec3ece

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
