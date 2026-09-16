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
| 3 |  | delta since entry 2 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Review finding id defined in `git-strategy.md` "Commits", review-fix payload carries it (DOC-1) | The definition is deleted, so a dev writes a trailer reconstruction cannot match. The split-part prefix is dropped: parts' findings are a union and are never renumbered (`review-policy.md` "Part verdicts, files, merge"), so a bare shared `COR-1` reads the other part's fix as landed. The payload loses the id, so the dev has no id to write | static | add | Appended to the AC-2 test, which already parses the "Commits" id list. The ledger key comes from `runtime.js`'s `ledger.findings` read and must be one of the listed ids. The part-file form comes from `review-policy.md` `<reviewer>.part-N.md`, and some listed id must be that form plus a finding id. The review-fix payload segment of `asd-phase-impl.md` must name an id with the `git-strategy.md` "Commits" pointer |
| `D-N` trailer landing clause (COR-1 iter-02), leftover paths (TST-1) | — | — | keep | Pinned by the iter-02 tester chain `c9cf9b7` (rotated entry 2 rows), green at this HEAD. DOC-1 adds backticked tokens to the "Commits" id list, but the `D-N`/tester/suite lookups match by prefix and stay unaffected |
| `release-manifest.json` hashes for the three edited canon files | Stale hash | static | keep | Existing `upstream_hashes` test, green at this HEAD |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| — | none | — |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| tests/run.js:sprint-014 AC-2: a failed creator or tester dispatch is reconstructed… (DOC-1 finding id, payload) | Each proof ran `node tests/run.js` with one mutation, restored in the same process and byte-compared. Every run also failed `release-manifest.json: every upstream_hashes entry matches the actual file`, which is hash noise. `its id in the reviewer's ledger \`findings\`, ` dropped from `git-strategy.md`: exit 1, 205/207, `DOC-1: git-strategy.md "Commits" must define a review finding id as its id in the reviewer's ledger \`findings\`…`. Whole DOC-1 parenthetical reverted: exit 1, 205/207, same message. `, prefixed by its review file … \`correctness.part-2.md COR-1\`` dropped: exit 1, 205/207, `DOC-1: git-strategy.md "Commits" must show a review finding id prefixed by its <reviewer>.part-N.md file…`. Example changed to a bare `` `COR-1` ``: exit 1, 205/207, same message. `each finding's id per \`git-strategy.md\` "Commits", ` dropped from `asd-phase-impl.md`: exit 1, 205/207, `DOC-1: the review-fix payload must carry each finding's id per git-strategy.md "Commits"…`. Reword checks: the definition was rewritten to `(the entry it has in the \`findings\` array of the reviewer's ledger; where two files of one iteration share that id, the review file name goes in front, e.g. \`security.part-3.md SEC-12\`)`, and the payload to `severity, the finding id (form: \`git-strategy.md\` "Commits")`. In each, only hash noise failed (206/207), so the test stayed green |

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once every reviewer is APPROVE/latched. The `pr` gate
always reads whatever is recorded here last — the full-suite record, by the time `pr` runs. Each
per-entry record measures only the tree that entry analysed, not any tree produced later
(`.asd/rules/sprint-lifecycle.md` "Impacted test set").

- Command: `node tests/run.js` (impacted set = whole suite: no affected-test selector, shared infrastructure touched — safety valve)
- Scope: impacted
- Result: pass — 207/207 passed, 0 failed, 0 skipped, exit 0 (entry 3; pre-strategy run 207/207, exit 0). The count did not change because the assertions were added to existing tests
- Lint / build: pass — `git diff --cached --check` exit 0 on the staged set; `node .asd/sync.js --check` exit 0, `ok: true`, 72/72 items `current`
- HEAD: 56827af — with this entry's `tests/run.js` edits uncommitted in the worktree. The impl-review terminal gate is the first run at a HEAD that contains this entry's test commit

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/rules/sprint-lifecycle.md` "Impl-test phase"). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
