# Test plan — sprint 023-retro-glings-008-remediation, entry 3

Rotated narrative rows of entry 3 (`artifact-layout.md` "Test plan"). No review-fix or in-place tester rows were added after it. Never edited; a changed risk gets a superseding row in live `test-plan.md`.

## Risk → check decisions

Entry 3, delta since `ace6656`: `git diff ace6656...HEAD --stat` over the entry-1 pathspec, 1 file, +17 −17: `.claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md`, the memory owner's fix of `D-1` (`887bbb1`; two lines naming the removed change-surface cap reworded, legacy ordinals made method-only). No test, runtime or canon changed. The impacted set degrades to the whole `node tests/run.js` by the safety valve. Entry 2's rows rotated into `test-plan.entry-02.md`; no review-fix or in-place tester row was added since, and no removal row carries forward.

Pre-strategy run at `e8371f9`: `node tests/run.js` → exit 0, 272/272 (the sweep `D-1` reddened is green).

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Memory rewrite of `feedback_no-shell-doc-review-method.md` (`D-1` fix) | a removed-mechanism string survives in agent memory; the rewrite damaged a lesson the memory index or another test relies on | static (the existing `sprint-023 leftover-term check`) | none | The sweep reads every `.md` under `.claude/agent-memory/**` (`AGENT_MEMORY_ROOT`, sanity assert that every directory is reached) with the exact removed strings, `surfaceCheck` and `surface-check` among them, and is green; `git grep` of `surfaceCheck`, `cap-override`, `cap override` and `change-surface cap` over `.claude/agent-memory` is empty. The only references to the file are its own `name`, the owner's `MEMORY.md` index line and a `[[no-shell-doc-review-method]]` link, all intact (the bijection test `T-2/T-4/sprint-010 TST-01` green); no test reads its text. The sprint-023 `memory-check` pins method-only text, and the file's remaining `wave-<K>/iter-NN` is a placeholder it passes. No new test qualifies |

## Removed tests

None this entry; no test deleted. Entry 2's removals are in `test-plan.entry-02.md`.

## Added tests

None this entry: no new test (see the decision above); entry 2's proofs are in `test-plan.entry-02.md`.
