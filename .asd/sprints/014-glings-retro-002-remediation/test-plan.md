---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint 014-glings-retro-002-remediation

<!--
Written in impl-test, after the implementation exists. First entry writes this file fresh;
every re-entry AMENDS it (append/update rows) — never a full rewrite. Defects rows persist
(resolved ones kept for the record). Narrative rows of prior entries rotate into
test-plan.entry-NN.md: .asd/rules/artifact-layout.md "Test plan". Change surface is not restated here — it's the diff
itself (`git diff --stat`), computed by asd-phase-impl-test.md step 2 (full on entry 1, delta
since the prior entry's `HEAD analysed` on re-entry).
Rules: .asd/rules/sprint-lifecycle.md (impl-test phase), .asd/rules/code-style.md §17.
-->

## Entry log

Appended each entry, never rewritten. `HEAD analysed` is the commit the strategy/prune passes
were scoped through; the next re-entry's delta is `git diff <this sha>...HEAD`.

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 19dd8a3 | full change surface |
| 2 | fa2bb9a | delta since entry 1 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Failed-dispatch `git log` (COR-3, EXT-2; supersedes entry 1's Task 1/AC-2 row for the command) | The pathspec returns and hides a commit touching only `.asd/sprints/**`, or the format stops printing each of a grouped commit's `ASD-Task` lines, so landed ids re-dispatch | executable git | add | The existing AC-2 temp-repo run used one `src/` commit with one trailer, so both regressions stayed green; it gains a two-trailer commit and a sprint-path-only commit, with the id derived from `git-strategy.md` "Commits" |
| `impl-test entry N` never marks an entry landed (COR-2); `impl-review iter-NN suite` id (EXT-3) | Reconstruction drops the tester entry as landed after its test commit and its suite gate never runs; an id class is deleted from "Commits" | static | add | Both ids derived from the "Commits" bullet; the "Failed dispatch" sentence naming the tester id must keep `never … landed` and the `asd-phase-impl-test.md` step 1 citation, and step 1 must handle the interrupted current entry |
| `git-strategy.md` "one line per covered id" wording (COR-3) | Bullet reworded back to a single trailer line | — | none | The rule's operative effect (every line is read) is pinned executably by the row above. Asserting the `per id` phrase would only lock wording: a synonym defeats it and a correct rewording reddens it. Assertable only if a commit-message linter existed |
| Leftover paths limited to the failed dispatch's authorised paths (COR-1 iter-01; TST-1 iter-02, supersedes this row's `none`) | Payload names orchestrator bookkeeping or a sibling dispatch's paths for the agent to finish or revert, or the orchestrator stages/discards them itself — breaks author-only staging | static | add | The filtering is orchestrator judgement, but the rule is a single-home clause in the same `Failed dispatch` paragraph whose COR-2 clause is already pinned. The `none` reason did not survive: deleting the clause left the suite green. Assert the uncommitted-leftovers sentence limits paths to what the dispatch was authorised for, excludes bookkeeping and in-flight sibling paths under `never`, and has the orchestrator never stage or discard them |
| `D-N` trailer lands only once its Defects row reads `fixed` (correctness iter-02 COR-1) | A test-fix dispatch dying between its fix commit and its row flip leaves the row `pending`; reconstruction drops `D-N` as landed, or re-sends it for a second fix | static | add | `D-N` derived from `git-strategy.md` "Commits", the status from `asd-phase-impl.md`'s test-fix `Status` to `fixed`. Assert the `D-N` clause gates landing on the Defects row reading that status, and its otherwise-branch sets the row from the sha with no second fix |
| External Review skip writes `Unreviewed files` (COR-4) | Skip persists nothing listing the unreviewed files, or impl-review 1b / design-review 3a stop computing `files[]` on non-ready, so a skipped iteration's files never reach External Review | static | add | `Unreviewed files` literal derived from "Iteration semantics" (as entry 1); asserted on the skip bullet, and on the non-ready sentence of impl-review 1b and design-review 3a |
| `t_review-report.md` skip token (EXT-5 follow-up) | Template's first-line alternatives reject the skip form `external.md` now carries | static | add | One assert in the same test that already reads the template |
| impl-review step 8 / design-review step 9 pointers to the skip's `Unreviewed files` | Pointer drifts | — | none | A pointer to the Outcome contract duty, which the row above pins. The corpus citation sweep resolves the cited section; the parenthetical adds no second duty |
| `runtime.js` `SURFACE_CAP_FILES` comment trim | — | — | none | Comment only, no behaviour change; value and citations pinned by entry 1's AC-5 rows |
| `runtime.js` `isTemplated` root-only clause removed (TST-1-2) | — | — | keep | Pinned by the review-fix tester chain (`ff33c76`, rotated entry 1 row); unchanged at this HEAD |
| Verdict-grammar mirrors, stalemate, `--self-hosting` flag, rotation timing and names (EXT-5/6, TST-1-1/2-1/2-2) | — | — | keep | Pinned by `ff33c76` (rotated entry 1 rows); every assertion re-run green at this HEAD |
| `asd-phase-impl-test.md` step 4 unreachable live-row update removed | A re-entry updates a live row that rotation already emptied | — | none | Deleted instruction, no remaining behaviour. The replacement "supersede a rotated one" is the rule `artifact-layout.md` "Test plan" states, and the AC-7 sweep pins that rule's segment name and kept sections |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| — | none | — |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

All proofs are from `node tests/run.js` with one mutation applied, then restored in the same process and byte-compared. Every mutation also fails `release-manifest.json: every upstream_hashes entry matches the actual file`, which is expected hash noise. The suite was 207/207 before and after the batch.

| Test | Regression proof |
|---|---|
| tests/run.js:sprint-014 AC-2: a failed creator or tester dispatch is reconstructed… (grouped and sprint-path-only commits, tester exception, id derivation) | `sprint-lifecycle.md` command regains `-- . ':!.asd/sprints/**'`: exit 1, 205/207, `EXT-2: a commit touching only .asd/sprints/** … must still report its ASD-Task…`. Format gains `separator=%x2C`: exit 1, 205/207, `COR-3: a commit covering several ids carries one ASD-Task line per id…`. Tester exception clause deleted: exit 1, 205/207, `COR-2: reconstruction must never read \`impl-test entry N\` as landed…`. `never marks` changed to `marks`: exit 1, same message. `impl-review iter-NN suite` id deleted from `git-strategy.md`: exit 1, 205/207, `COR-2/EXT-3: git-strategy.md "Commits" must list an id…`. `asd-phase-impl-test.md` `interrupted current entry` changed to `stalled entry`: exit 1, 205/207, `COR-2: asd-phase-impl-test.md step 1, which reconstruction resumes through…`. Reword check: exception changed to `: that id is never read as landed, and the re-dispatched`. Only hash noise failed (206/207), so the test stayed green |
| tests/run.js:AC-8/sprint-010 AC-4/sprint-014 AC-1: external-review.md "Outcome contract"… (skip `Unreviewed files`, template skip token) | Skip bullet reverted to `in the external review output,`: exit 1, 205/207, `COR-4: the availability skip must persist a \`Unreviewed files\` line…`. impl-review 1b non-ready sentence reverted to pre-fix `Skipped when 1a is non-ready…`: exit 1, 205/207, `COR-4: .asd/workflows/asd-phase-impl-review.md step 1b must still compute files[] on a non-ready preflight…`. design-review 3a `still computing … \`Unreviewed files\`` clause removed: exit 1, 205/207, same message for design-review 3a. Template skip alternative removed: exit 1, 205/207, `EXT-5: t_review-report.md's first-line alternatives must admit the skip token…`. Reword check: skip bullet changed to `as \`external.md\`'s first-line token and a \`Unreviewed files\` line listing the would-be \`files[]\``. Only hash noise failed (206/207), so the test stayed green |
| tests/run.js:sprint-014 AC-2: a failed creator or tester dispatch is reconstructed… (leftover paths TST-1, `D-N` landing COR-1) | Each mutation applied to `sprint-lifecycle.md` "Failed dispatch": `the failed dispatch was authorised to touch` dropped → exit 1, 205/207, `TST-1: the failed-dispatch payload must limit uncommitted leftovers to the paths the failed dispatch was authorised to touch`; the `— never … sibling dispatch's paths —` clause dropped → exit 1, 205/207, `TST-1: the failed-dispatch payload must never name orchestrator bookkeeping or an in-flight sibling dispatch's paths…`; only `or an in-flight sibling dispatch's paths` dropped → exit 1, same message; `; the orchestrator never stages, commits or discards them` dropped → exit 1, 205/207, `TST-1: the orchestrator must never stage or discard a failed dispatch's leftovers…`; `never stages` → `stages` → exit 1, same message. Whole `D-N` clause dropped → exit 1, 205/207, `COR-1: reconstruction must read a \`D-N\` trailer as landed only once its Defects row reads \`fixed\`…`; `` `fixed` `` → `` `pending` `` → exit 1, same message; `, no second fix` dropped → exit 1, 205/207, `COR-1: otherwise the re-dispatch must only set the \`D-N\` row from the trailer commit's sha, without a second fix`; `only to set the row from the trailer commit's sha` → `for a fresh pass` → exit 1, same message. Reword checks: leftovers sentence rewritten starting `Uncommitted leftovers go into the payload…`, spelling `authorized`, orchestrator clause passive (`is never done by the orchestrator`); `D-N` clause rewritten to `landed only when the \`Defects\` row … already reads \`fixed\`…; otherwise … solely to record the trailer commit's sha … and is not fixed again`. Each: only hash noise failed (206/207), so the test stayed green |

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once every reviewer is APPROVE/latched. The `pr` gate
always reads whatever is recorded here last — the full-suite record, by the time `pr` runs. Each
per-entry record measures only the tree that entry analysed, not any tree produced later
(`.asd/rules/sprint-lifecycle.md` "Impacted test set").

- Command: `node tests/run.js` (impacted set = whole suite: no affected-test selector, shared infrastructure touched — safety valve)
- Scope: impacted
- Result: pass — 207/207 passed, 0 failed, 0 skipped, exit 0 (entry 2; pre-strategy run 207/207, exit 0). The count did not change because the assertions were added to existing tests
- Lint / build: pass — `git diff --cached --check` exit 0 on the staged set; `node .asd/sync.js --check` exit 0, `ok: true`, 72/72 items `current`
- HEAD: 14498c1 — with this entry's `tests/run.js` edits uncommitted in the worktree. The impl-review terminal gate is the first run at a HEAD that contains this entry's test commit

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/rules/sprint-lifecycle.md` "Impl-test phase"). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
