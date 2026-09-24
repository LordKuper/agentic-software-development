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
| 1 | 8b0c28f58ee83940449709bfdba3a35814daf987 | full change surface |
| 2 | a866c4c8b94c0ec9ea8f5f8f7e5139fd0df5ac50 | dev-chain review-fix delta since entry 1 (testing.md TST-1..TST-3, efficiency.md EFF-4, plus the dev-chain commits `8b0c28f..a866c4c` those findings' fixes touch) |
| 3 | ee7333e334510ce3233afdcd7c7bf9d6837f7215 | delta since entry 2: `tests/run.js` (95aee62, review-fix tester chain) and `.claude/agent-memory/**` (COR-4 memory rewrites, 30f75c3 and e4dd2c0) |

Impacted set: full suite (all entries). The safety valve fires. Entries 1-2 touched `.asd/runtime.js`, `.asd/hooks/session-start.js`, `.asd/release-manifest.json`, rule docs and workflows, and entry 3's delta touches `tests/run.js`, the runner itself. `commands.yaml` has no `test_affected`.

Entry 2's `Risk → check decisions`, `Removed tests` and `Added tests` rows are rotated to `test-plan.entry-02.md`. Entry 1's are in `test-plan.entry-01.md` (`artifact-layout.md` "Test plan"). This entry's own rows follow.

Entry 3 pre-strategy run at `032357a`: `node tests/run.js` → exit 0, `223/223 passed`.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| COR-4 memory rewrites under `.claude/agent-memory/{asd-external-review,asd-reviewer-correctness,asd-reviewer-documentation,asd-reviewer-efficiency}/` | memory is loaded on every dispatch, so a line that still describes split parts, `--halve`, the out-of-part predicate or `exclude_paths` as current reloads a false contract. This is a real risk: COR-4 found it, and one owner, `asd-reviewer-testing`, was missed. A later memory write can also bring it back | static | add | COR-4 is a fixed defect, so `code-style.md` §17 requires a regression check, and entry 2 had no COR-4 row. The AC-5 canon sweep does not reach memory. A second sweep over the memory dirs of every roster agent now uses the canon sweep's needle set, which is extracted into the shared `REPLACED_REVIEW_MECHANISMS`. Memory lines are allowed to say a mechanism is absent (e.g. "no `.part-N`"), so a term passes when a negation comes right before it in the same clause (40-char window) or the line says legacy. A negation word anywhere on the line would exempt too much. |
| `tests/run.js` from 95aee62 (review-fix tester chain) | tests written outside impl-test's own pass (F-3) might lack their proof | — | none | Entry 2 (`test-plan.entry-02.md`) already analysed this commit and recorded a mutation proof for each added or updated test. The pre-strategy run is green at 223/223. The one gap found, no COR-4 row, is closed by the row above, so there is no re-analysis. |
| `REPLACED_REVIEW_MECHANISMS` extraction in the AC-5 canon sweep | the canon sweep changes behaviour | refactor, no new test | keep | The canon sweep reads the same regexes from the constant. Its behaviour is unchanged, and it stays green before and after the extraction. |

## Removed tests

None this entry.

## Added tests

| Test | Regression proof |
|---|---|
| `tests/run.js:sprint-017 AC-5/AC-7 (COR-4): no agent memory a dispatched agent loads names a review mechanism review waves replaced as live - only right after a negation in the same clause, or on a line naming it legacy` | Mutation: restore the pre-COR-4 text of the 11 memory files COR-4 rewrote (`git show a866c4c:<f> > <f>`), then run `node tests/run.js` → exit 1. This test FAILs with 23 leftovers, 16 more than the 7 at HEAD (D-1/D-2), and they span all four COR-4 owners' dirs. The files were restored in the same command with `git checkout -- <f>`, and `git status --short .claude/agent-memory` was empty afterwards. At HEAD the test is red only on D-1/D-2 |

## Suite run

- Command: `node tests/run.js`
- Scope: full (safety valve, see Entry log)
- Result: fail — `223/224 passed`, 1 failed, 0 skipped (exit 1). The only FAIL is the new COR-4 memory sweep, which fails on D-1/D-2. The runner has no skip state. Its one `(skipped: … only runs on win32 …)` line is a pre-existing in-test platform branch, not a skipped test.
- Lint / build: pass — `git diff --cached --check` exit 0 on the staged change; `node .asd/sync.js --check` exit 0, `ok: true`
- HEAD: 032357a8942863f6b8dd8f9d99e306257237f080 — the working tree plus this entry's staged `tests/run.js`, `test-plan.md`, `test-plan.entry-02.md` and `.claude/agent-memory/asd-tester/**`, committed right after as the entry's test commit

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 3 | `.claude/agent-memory/asd-reviewer-testing/project_split-part-rubric-rows.md` | AssertionError [ERR_ASSERTION]: COR-4/AC-7: agent memory is loaded on every dispatch, so a line describing a removed split, part or External batch as current contract reloads a false contract that "Scope hand-off" and the wave state contradict. A memory may name one only as absent ("no .part-N") or legacy; its owner rewrites or deletes the rest | sprint-017 AC-5/AC-7 (COR-4): no agent memory a dispatched agent loads names a review mechanism review waves replaced as live - only right after a negation in the same clause, or on a line naming it legacy | pending | |
| D-2 | 3 | `.claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md` | AssertionError [ERR_ASSERTION]: COR-4/AC-7: agent memory is loaded on every dispatch, so a line describing a removed split, part or External batch as current contract reloads a false contract that "Scope hand-off" and the wave state contradict. A memory may name one only as absent ("no .part-N") or legacy; its owner rewrites or deletes the rest | sprint-017 AC-5/AC-7 (COR-4): no agent memory a dispatched agent loads names a review mechanism review waves replaced as live - only right after a negation in the same clause, or on a line naming it legacy | pending | |

D-1: the whole memory, lines 3/8/12/14, describes split testing parts as the current contract, and its `MEMORY.md` index line points to it. D-2: line 32's sprint-012 anecdote says `--halve` is passed on interruption. Both files belong to `asd-reviewer-testing`. No impl role may write them, and that reviewer has no write tool (friction F-2/F-4), so the fix needs the COR-4 route: the owner supplies the text.
