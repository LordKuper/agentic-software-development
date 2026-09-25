---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 018-agent-tool-permissions

## Entry log

Appended each entry, never rewritten. `HEAD analysed` is the commit the strategy/prune passes
were scoped through; the next re-entry's delta is `git diff <this sha>...HEAD`.

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 6c9d8d7 | full change surface |
| 2 | 67cc9a8 | delta since entry 1 |
| 3 | 0bd998c | delta since entry 2 |
| 4 | 7d16856 | delta since entry 3 |

## Risk → check decisions

Entry 4 (delta since entry 3: `git diff 0bd998c...HEAD`, review-fix round 2: dev 9409e90, 099cf64, d12ece2, 3ee9f24 plus tester 9513ce2). Impacted set: the **full suite**. The safety valve fires because the delta touches `core.md`, `review-policy.md` and `release-manifest.json`. Every canon change in the delta was pinned, with a revert-to-parent proof, by 9513ce2 while entry 3 was live (rotated `test-plan.entry-03.md`); nothing after 9513ce2 is canon.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `core.md:47` gate-uncertainty carve-out (3ee9f24) | the reviewer carve-out is lost again | static | none | Already pinned by the widened rules sweep; `core.md` reverted to `3ee9f24~1` fails it (rotated segment, Q1). A new test would duplicate that assertion |
| stalemate routing (d12ece2): option names removed from both workflows; `external-review.md` "stop"/"continue fixing" effects now name the route | workflows restate stale names; an option loses its effect | static | none | Absence of names plus the home citation are pinned (W1/W2, S4/S5), and so is "exactly three options, each with an effect". Whether the effect prose routes correctly is a judgement about the text with no derivable proxy. Owner: the impl-review correctness reviewer. It becomes assertable if the routes are ever given as literal step references |
| `answer:` line (099cf64) | the user's answer never reaches the fixer | static | none | Pinned as a relation across carrier, template, impl step 3 and both workflows (A1–A4) |
| `designmd-install` orchestrator sites (9409e90) | a cited site stops running the install | static | none | Pinned by resolving the `asd-ux.md` citations (I1/I2) |
| `release-manifest.json` hash refresh | stale ledger | static | keep | The existing `upstream_hashes` and `canon_hashes` tests pass at dbc6b60 |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

None this entry. The delta's assertions landed in 9513ce2, with their proofs recorded in the rotated `test-plan.entry-03.md`.

| Test | Regression proof |
|---|---|

## Suite run

- Command: `node tests/run.js`
- Scope: impacted = full (safety valve: the delta touches `core.md`, `review-policy.md` and `release-manifest.json`)
- Result: pass — 228/228 passed, 0 failed, 0 skipped (exit 0), at both the pre-strategy run (step 3) and the suite gate (step 8). This entry changed no test code
- Lint / build: pass — `git diff --check` exit 0; `node .asd/sync.js --check` exit 0, `"ok": true`
- HEAD: dbc6b60

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/rules/providers.md | AssertionError [ERR_ASSERTION]: AC-4/AC-5: the out-of-policy refusal must route a reviewer through its question carrier - "an agent ... returns `QUESTION`" alone makes a reviewer return a bare QUESTION, which reads as an interrupted dispatch | sprint-018 AC-4/AC-5/AC-7: a reviewer's question and External Review's stalemate ride the verdict-bearing report - one carrier form across template, rule, agents and both review workflows - and impl-review collects manual-verification results before dispatching the testing reviewer | fixed | 0533ef8 |
| D-2 | 1 | .asd/workflows/asd-phase-audit.md | AssertionError [ERR_ASSERTION]: AC-7: every workflow dispatching a role that can return QUESTION must cite the QUESTION protocol, or that question has no handling path in the phase | sprint-018 AC-4/AC-5/AC-7: only the main orchestrator prompts the user - core.md says so, the QUESTION protocol carries every dispatched question, every creator/dev/tester-dispatching workflow cites it, and no agent body, skill or design step hands user contact to a dispatched agent | fixed | 4df9bf4 |
