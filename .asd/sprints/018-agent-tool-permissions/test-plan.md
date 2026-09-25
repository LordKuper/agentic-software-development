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
| 5 | b986d17 | delta since entry 4 |

## Risk → check decisions

Entry 5 (delta since entry 4: `git diff 7d16856...HEAD`, review-fix round 3: dev e5d36b4, 308c214; no test findings). Impacted set: the **full suite**. The safety valve fires because the delta touches `sprint-lifecycle.md`, `review-policy.md` and `release-manifest.json`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| e5d36b4: every `question:` names its finding id (`review-policy.md` carrier, `t_review.md`) | the binding is dropped from both sites at once, so an answer again has no finding to ride with. The existing carrier↔template shape comparison catches one side drifting, not both | static | add (carriers test) | The carrier's form must open with a `<…finding…>` placeholder. Together with the existing shape comparison, this pins the template too |
| 308c214: user-resolved findings (`sprint-lifecycle.md` "State recovery" home; `resolved:` line cited from `external-review.md` stop, both review workflows, `asd-phase-impl.md` step 3) | a resolution with no recording site (override/stop/cap-accept) leaves no `resolved:` line, so review-fix re-fixes the finding or the pr/DoD gate stays blocked on a bare CONCERNS/FAIL; the collector does not skip named findings | static | add (new test) | Everything is derived from the home. The reasons come from its `resolved:` form; the sites are the canon files that cite it; the review workflows are derived by filename. Every reason must have a citing recording site. Each review workflow must record override and `cap-accept`. The impl review-fix collector must name the form's `resolved:` prefix and cite the home. The home must state both effects (skip, satisfied) |
| 308c214: design-review DoD branch "All APPROVE, latched or user-resolved"; pr-gate "or for a user-resolved entry" | the satisfied semantics are misapplied at a gate | — | none | Both gates aggregate per the home's satisfied-vs-blocking semantics. The home's "satisfied" statement is pinned above, and the branch wording itself is a pointer to it. Checking whether each gate applies it correctly is a runtime judgement with no machine-checkable form here. Owner: the impl-review correctness reviewer |
| `release-manifest.json` hash refresh | stale ledger | static | keep | The existing `upstream_hashes` and `canon_hashes` tests pass |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

Mutations were run with `MUT=./mut6.js node <scratchpad>/mutate.js`: a `git show <sha>~1` revert or an anchor-exact edit, restored in `finally` with a byte compare. `upstream_hashes` noise is not listed; every mutation run exited 1.

| Test | Regression proof |
|---|---|
| tests/run.js:`sprint-018 AC-4/AC-5/AC-7: a reviewer's question and External Review's stalemate …` (finding-id placeholder) | Y1: `review-policy.md` reverted to `e5d36b4~1` → exit 1, "AC-4: every question names the finding it qualifies (no finding, no question)". The new assert sits before the shape comparison, so it fires first |
| tests/run.js:`sprint-018 AC-4: a finding the user resolves without a fix is recorded by one resolved: line form …` | U1: `sprint-lifecycle.md` reverted to `308c214~1` → exit 1, "the user-resolved record must be defined once, as a line form naming every resolving reason"; U2: `external-review.md` reverted → "resolving reason \"stop\" must be recorded at a site that cites the home"; U3/U4: design-review / impl-review reverted → "… resolves findings without a fix, so it must cite the user-resolved home"; U5: `asd-phase-impl.md` reverted → "impl review-fix must skip each finding a resolved: line names, citing the home"; U6: impl-review cap-accept recording removed (citation left) → "… an iteration-cap accept must record the open findings resolved"; U7: design-review override recording set back to "mark resolved" (citation left elsewhere) → "… a FAIL override must be recorded as resolved"; U8: "skips" → "fixes" in the home → "the home must state both effects". Rewording R5 ("is skipped by the review-fix collector") first reddened the `/\bskips?\b/` check, which exposed a wording lock. It was relaxed to `/\bskip/` before commit, and R5 then left this test green |

## Suite run

- Command: `node tests/run.js`
- Scope: impacted = full (safety valve: the delta touches `sprint-lifecycle.md`, `review-policy.md` and `release-manifest.json`)
- Result: pass — 229/229 passed, 0 failed, 0 skipped (exit 0) at the suite gate (step 8). The pre-strategy run (step 3) was 228/228, exit 0; this entry added one test
- Lint / build: pass — `git diff --check` exit 0; `node .asd/sync.js --check` exit 0, `"ok": true`
- HEAD: 03fea36, worktree carrying this entry's uncommitted `tests/run.js` assertions; they land in the commit that records this run

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/rules/providers.md | AssertionError [ERR_ASSERTION]: AC-4/AC-5: the out-of-policy refusal must route a reviewer through its question carrier - "an agent ... returns `QUESTION`" alone makes a reviewer return a bare QUESTION, which reads as an interrupted dispatch | sprint-018 AC-4/AC-5/AC-7: a reviewer's question and External Review's stalemate ride the verdict-bearing report - one carrier form across template, rule, agents and both review workflows - and impl-review collects manual-verification results before dispatching the testing reviewer | fixed | 0533ef8 |
| D-2 | 1 | .asd/workflows/asd-phase-audit.md | AssertionError [ERR_ASSERTION]: AC-7: every workflow dispatching a role that can return QUESTION must cite the QUESTION protocol, or that question has no handling path in the phase | sprint-018 AC-4/AC-5/AC-7: only the main orchestrator prompts the user - core.md says so, the QUESTION protocol carries every dispatched question, every creator/dev/tester-dispatching workflow cites it, and no agent body, skill or design step hands user contact to a dispatched agent | fixed | 4df9bf4 |
