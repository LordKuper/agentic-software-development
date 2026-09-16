---
name: review-fix-defect-proof
description: Code defects found by impl-review (COR-*) and fixed in a review-fix round never enter the test-plan Defects table, so their §17 fail-first record is easy to skip; also re-read existing assert messages a prose fix made false; compare each fix's `none` reason with its sibling rows; sentence splitters break at "e.g."
metadata:
  type: feedback
---

A correctness finding fixed in an impl-review fix round (sprint 013 iter-02: COR-1-2, `defectStalemate` consecutive entries) is still a "fixed defect" under `code-style.md` §17. It needs a recorded fail-first run or mutation: command, non-zero exit, failing test name. The test-plan `Defects` table only holds impl-test `D-N` rows, so the fix shows up only as an inverted assertion plus a `keep` row saying "each bound has a case that fails if it flips". That is the bare claim §17 rejects.

**Why:** the regression test can be fine (replaying it against the pre-fix code shows it would fail) while the proof record is still missing. The iteration-2 Entry log row makes the record look settled.

**How to apply:** at iter ≥ 2, map each code-fix id in the decisions-log `impl fix for iter-NN` line to an `Added tests` Regression-proof cell. A `keep` or `n/a` there means a medium finding. Replay the assert against the pre-fix code to decide whether the fix is only a record gap or also a real test gap. Separately, when a finding fixes a prose rule that an existing assert already pins by word match, re-read that assert's message. Sprint 013: `tests/run.js` AC-16 still said stdin syntax is picked from `platform` after COR-1-1 keyed it on the host shell. See [[no-shell-review-method]], [[split-part-rubric-rows]].

Asymmetric `none` (sprint 014 iter-02): framework "code" fixes are often prose rules the orchestrator executes. The tester pinned COR-2's prose carve-out statically (`never … landed` regex) but gave COR-1's equally prose carve-out (leftovers limited to the failed dispatch's authorised paths) `none` with "assertable only if moved into runtime.js". The reason is false by the entry's own sibling row. Check every fix-id `none` against how sibling fix rows in the same entry were checked; a clause deletion with a silent data-loss effect and no effect-level pin elsewhere is medium.

Sentence-split asserts (sprint 014 iter-03, AC-2): `text.split(/(?<=\.) /)` also splits at `e.g. `, so the "sentence" an assert reads may start mid-clause. Replay which fragment the `.find()` returns before trusting a mutation record; it held there, but a later `e.g.` inserted before a pinned clause silently moves it into another fragment. Also `\bnever\b[^;]*\bX\b` regexes accept X in a positive clause after an unrelated `never` — below high floor alone.
