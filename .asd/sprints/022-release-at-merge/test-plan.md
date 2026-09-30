---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 022-release-at-merge

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
| 1 | 6659c2a | full change surface |
| 2 | 6e51b75 | delta since entry 1 |
| 3 | c85aac7 | delta since entry 2 |
| 4 | 97482ae | delta since entry 3 |
| 5 | ba1bb84 | delta since entry 4 |

## Risk → check decisions

Entry 5's delta is the impl-review wave-1/iter-02 review-fix round: `git-strategy.md` tag creation also checks `origin` and its retry sentence is gone, and `sprint-lifecycle.md` "PR phase" Modes scopes the DoD-gate skip to the release retry (both `7e124bb`); the review-fix tester's `tests/run.js` commit `de99a72` (one hoisted `spans`, two prose locks dropped, the tag pin split in three, the retry asserts removed); the ledger refresh `c3fd828`. The pre-strategy run at HEAD `9f81e7e` was 264/264, exit 0. Entry 4's rows and the review-fix tester's rows added after it are rotated to `test-plan.entry-04.md`. Mutation ids are listed under "Added tests".

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| "PR phase" Modes sentence scoped to the release retry (`7e124bb`, iter-02 combined #1); supersedes the rotated `none` row for it | the DoD-gate skip is credited to open mode's own `MERGED` hit, which open mode finds in its step 2, after step 1 has run the gate; a later edit of the sentence brings the over-claim back | static relation | add (to the `sprint-021 AC-1/AC-2 (D1)` test: one absence assert and one sanity) | The rotated `none` said an absence check would redden a correct sentence that lists both dispatches and scopes the skip apart, and that no other token carries the relation. Neither holds for a clause-scoped read: the absence is tested only on the `;`-clause that names the DoD gate, and only on the dispatches it lists (the text before `merge mode`), so the reviewer's own rewrite (skip clause, then "open mode's own `MERGED` hit continues in merge mode after its step 1") and a second sentence naming the hit stay green (Q1, Q2). The reason the hit skips nothing is derived, not restated: a sanity asserts asd-phase-pr.md open mode names its DoD gate before the `MERGED` hit lookup (P4). `code-style.md` §17 asks every fixed defect for a regression proof, and `7e124bb` had none. Ceilings: a synonym for the hit ("a hit found in step 2") passes, a dispatch list placed after the words `merge mode` passes, and an aside naming the hit after them stays green by design (Q4). Proofs P1–P4, Q1–Q5 |
| Tag-creation and push pins after the origin-aware canon (rotated row: create and push asserts split) | a pin written against the pre-fix text passes on the corrected canon, or one half of the guard is unpinned | static | keep | Re-derived at HEAD `9f81e7e`, not carried on trust: C1 (create clause loses the local check), C2 (loses the `origin` check) and C3 (push loses `unless it exists on origin`) each turn exactly one own assert red; C4 (git-strategy.md at `7e124bb~1`) reaches the `origin` half, the second-clone case; the rewords G1, G2 stay green |
| Retry sentence dropped from git-strategy.md; its two asserts removed (rotated review-fix row, carried to `Removed tests`) | the facts those asserts held (tag OR release missing, the release-commit word, the route to merge mode) are pinned nowhere else | static | keep (removal carried) | Grepped, then mutated: the owners carry them. H1 (home loses `no release commit`) → the `"Merged-unclosed"` release-commit assert; H2 (loses the tag clause) and H3 (loses the `gh release view` clause) → the retry-route assert; K1 (asd-sprint Step 1 loses the tag and release words) and K2 (loses `its release commit`) → the Step 1 condition asserts. `none` stands for "git-strategy.md restates no retry route": whether a file restates a route is a paraphrase judgement, a pointer is legitimate, and the positive half lives at the home |
| `each time` locks dropped at two sites; `spans` hoisted (rotated review-fix rows) | a lock returns in another shape, or a former local copy no longer reaches the helper | static | keep | A1 and A2 (`each time` → `on every invocation` at the home and in the skill) leave the suite green (ledger noise only). B1 (the helper's return altered) reddens seven own tests, one per former site: the count the rotated row recorded |
| Hash ledger refresh (`c3fd828`) | ledger stale after the canon edits | static | keep | The existing `upstream_hashes` and `canon_hashes` tests and `sync.js --check`, green at HEAD |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| Two assertions and their `retry` and `condition` constants inside `sprint-022 AC-1 (D2), …` (the test stays): the tag-and-release condition words plus the `"Merged-unclosed"` citation, and the release-commit word, all on the git-strategy.md retry sentence. Removed by the review-fix tester at `de99a72` and carried from its rotated `Risk → check decisions` row | `7e124bb` dropped the sentence they pinned. The facts stay pinned at their owners, `homeRetry` and asd-sprint Step 1's condition asserts (mutations H1–H3, K1, K2 under "Added tests"), so the assertions were not a duplicate kept for safety but red text the canon no longer holds | yes: `tests/run.js` is inside the sprint change surface |

## Added tests

The mutation ids are `node .asd/tmp/s22e5-mutate.js` runs, 23 in all: 14 red, 9 reword controls. Each is one canon or `tests/run.js` edit, or the pre-fix blob at `7e124bb~1` → `node tests/run.js` → a byte-equal restore in the same process (no `RESTORE MISMATCH`; `git status --porcelain` afterwards listed only `tests/run.js`). The failing test and message are the first own FAIL line after the expected ledger noise (`upstream_hashes`/`canon_hashes`, `sync.js --check`), which only a `managed_paths` file adds; a `tests/run.js` edit fails its own tests alone. The suite was 264/264 after them.

| Test | Regression proof |
|---|---|
| `sprint-021 AC-1/AC-2 (D1), sprint-022 AC-1/AC-2/AC-3: pr ends at await-merge or done, …` (reworked in place: one sanity and one absence assert appended, the title gains "only the release retry skips open mode's DoD gate"; 264 → 264) | P1 sprint-lifecycle.md at `7e124bb~1`, the pre-fix blob → 262/264, exit 1, first own FAIL at `run.js:6887` "…open mode finds its MERGED hit after its DoD gate has run, so it skips nothing and the dispatches the DoD-skip clause lists may not include it, only asd-sprint's release retry…"; P2 `` `asd-sprint`'s release retry or an open-mode `MERGED` hit`` and P3 `` … or open mode's own `MERGED` hit`` in place of the retry alone → the same assert; P4 asd-phase-pr.md open step 1 gains "A `MERGED` hit is looked up first." → `run.js:6884` "sanity: pr open mode runs its DoD gate (step 1) before the head-branch lookup that finds a MERGED hit (step 2)…". Rewords, this test green (263/264, ledger noise only): Q1 the reviewer's suggested rewrite (`; open mode's own `MERGED` hit continues in merge mode after its step 1`), Q2 a second sentence naming the hit, Q3 `skips open mode's DoD gate and enters merge mode`, Q4 an aside naming the hit after `merge mode`, Q5 the retry named first |
| `sprint-022 AC-1 (D2), iter-01 external #1/#2, combined #1, iter-02 combined #2: …` (no edit; pins re-derived at entry 5) | C1 the create clause loses its `refs/tags/v<asd_version>` check → `run.js:7070` "external #2: the tag is created only when it is absent locally…"; C2 loses `or on origin (git ls-remote …)` → `run.js:7071` "iter-02 combined #2: the tag is created only when it is also absent on origin…"; C3 the push loses `unless it exists on origin` → `run.js:7072` "AC-1 (D2): the tag is pushed only when it is absent on origin…"; C4 git-strategy.md at `7e124bb~1` → the `run.js:7071` assert first. Coverage taken over from the removed retry asserts: H1 → `run.js:7089` "\"Merged-unclosed\": external #1: \"no release commit\" is a missing release…"; H2 and H3 → `run.js:7088` "\"Merged-unclosed\" retry route: a tag absent on origin or a failing gh release view sends the sprint back to merge mode"; K1 → `run.js:7105` "asd-sprint Step 1 routes a self-hosting merged-unclosed sprint to the release retry when its tag OR its release is missing"; K2 → `run.js:7106` "asd-sprint Step 1: external #1: \"no release commit\" is a missing release…". Rewords G1 (tag "already in the local repository … already on the remote"), G2 (`unless origin already has it`), A1 and A2 (`each time` → `on every invocation`) stay green (ledger noise only) |
| `function spans` (no edit; the hoist's proof re-run) | B1 the helper's return altered (`${span}x`) → 257/264: the seven tests that use it are red with their own messages, one per former local copy |

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once the last review wave's reviewers are
APPROVE/latched. The `pr` gate always reads whatever is recorded here last — the full-suite
record, by the time `pr` runs. Each per-entry record measures only the tree that entry
analysed, not any tree produced later
(`.asd/rules/sprint-lifecycle.md` "Impacted test set").

- Command: `node tests/run.js`, unscoped: the shared-infrastructure safety valve fires on the `git-strategy.md` and `sprint-lifecycle.md` rule-doc changes and the release-manifest ledger
- Scope: full
- Result (entry 5): pass — 264/264 (exit 0, no FAIL line). The pre-strategy run at the same HEAD was also 264/264, exit 0, so no delta pin was red before authoring. The count does not move: the sanity and the absence assert added sit inside an existing test, and the delta's removed assertions and reworked ones were already counted at `de99a72`
- Lint / build: pass — `git diff --cached --check` clean on the commit's paths (exit 0); `node .asd/sync.js --check` `ok: true`, 74/74 `current`
- HEAD: 9f81e7e plus this entry's `tests/run.js` edit, committed unchanged afterwards (no test reads the test-plan files). The terminal full suite is the first run at a HEAD that contains the commit

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/rules/sprint-lifecycle.md` "Impl-test phase"). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|

## Manual verification (optional)

None. Every AC is a canon or executable contract, pinned above. The live release is owned by this sprint's `pr` merge mode.
