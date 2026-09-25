---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 019-retro-intake

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
| 1 | 88ceb3b | full change surface |
| 2 | 66bcd9b | delta since entry 1 |
| 3 | c43681a | delta since entry 2 |

## Risk → check decisions

Entry 2's rows are in `test-plan.entry-02.md`, together with the rows the review-fix wave-1/iter-01 tester chain (`694c28f`) added after entry 2 closed. Delta `66bcd9b...HEAD` (review pathspec): the dev chain `0f9f77c..1fc1abe` (11 commits), tester `694c28f`, and memory-fix commits `5c48db2` and `b06232a`. Pre-strategy run (the whole runner is the impacted set) at `365fb61`: `node tests/run.js` → exit 0, 238/238.

Carried input from those rows: none is a removal finding, so nothing carries over to `Removed tests`. The `pendingMemoryFix` closing obligation is discharged below. TST-1-2 is fixed by this entry's `Suite run`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `e107153`, external #1: `review-policy.md` "Autofix vs escalation" Memory-fix dispatch sequencing; impl step 5 points at it | A round with memory findings for several owners has no rule: dispatch count, concurrency, position after the chains and order are left to the orchestrator; test-fix `D-N` rows go unnamed at the home impl step 3 routes them to | static clause asserts, appended to the AC-14/AC-16 test (the one that reads this bullet) | add | Each property is tested on its own clause and token: `D-N` in the routing clause; one dispatch per owner with all its findings; one at a time; after the dev and tester chains; lowest id as the order key. Step 5's memory-fix sentence must say "last" and cite the home. Proof: E1–E5, E9; reword G1 stays green. |
| `fd449af`, COR-3: ownerless memory (home sentence, impl step 3 clause, step 9 authorised-paths gate) | A leftover-term hit in an orphan directory has nobody to dispatch, so the round stalls; or the orchestrator deletes the file and its own step 9 gate then fails the deletion as an unauthorised path | static, same test | add | Home: the sentence names no owner, deletes, commits, logs, and authors no text. Step 3: an ownerless finding is deleted "per the same rule". Step 9: the gate admits a deleted ownerless file. Proof: E6, E7, E8; reword G2 stays green. `Operations used` `git rm` is not pinned: step 3 is the acting site, and the operations list only mirrors it. |
| `8ab3d7d`, COR-4: `artifact-layout.md` "Test plan" (review-fix tester never deletes; the next `impl-test` entry removes and records) and `asd-tester.md` review-fix line | A review-fix tester deletes a test with no `Removed tests` row to record why, or the next entry never learns it owns the removal | static, appended to the AC-11..16 test (it already reads that grant) | add | The home sentence holding `Removed tests` must say never/delete/next/`impl-test`. The tester line must say its review-fix pass deletes no test. Proof: E10, E11. |
| `7cdcb95`, COR-6: payload header cited at impl step 6, impl-test step 1a, impl-review step 9 | A dev or tester dispatch, the case 018 F-2 evidenced, drops the `Repo root:` header line again | static, appended to the AC-9/AC-10 loop over dispatch sites | add | Per site: one dispatch line names `asd-dev`/`asd-tester` and cites `providers.md` "Dispatch payload header". Proof: E15, E16, E17. |
| `33d26ea`, DOC-3: leftover-term check timing and the tester's citation | The home says the check runs "from" the first entry while both acting sites run it at entry 1 only; the tester line narrows the check to agent memory, so nobody acts on its canon and README half | static, AC-16 part of the AC-11..16 test | add | Removed-phrase absence (`from its first`) on the home. At each acting site, the pointer line (already required) must not restate the `.claude/agent-memory/**` scope. Paired with the existing positive pointer assert, so the negative half cannot pass vacuously. Proof: E13, E14. |
| `1fc1abe`, DOC-5: `asd-tester.md` description names the review-fix purpose | The trigger text again reads as if row amendment were the dispatch purpose, which breaks the agent-to-workflow dispatch mirror | static relation, same test | add | The description's review-fix clause must name test files, and impl step 3 must route findings in test files to `asd-tester`. Each token is tested on its own; a clause split on `, ` or `. ` keeps a reword free. Proof: E12. |
| `74a25b1`: `sprint-lifecycle.md` "Retro row id" names the `covered by:` prefix as an English literal | A retro in another `language.docs` translates the prefix, and intake then offers covered rows as candidates | static relation plus run, appended to the TST-1-1 retro-intake test | add | The prefix is derived from the "English" sentence of "Retro row id". The fixture retro row that begins with it must be absent from the candidates the command prints, so the rule's literal and the runtime's drop are asserted as one relation. Proof: E18. |
| Same commit, `t_retrospective.html` comment cut to a pointer (DOC-4) | The pointer dangles after a heading rename | none | none | The comment cites `.asd/rules/sprint-lifecycle.md "Retro phase"` without backticks, and it sits in an `.html` template. The citation sweep matches only backticked `` `<file>.md` "<Section>" `` pointers over `canonMarkdownFiles()`. It becomes assertable if the comment adopts the backticked form and the sweep reaches `t_*.html`, which is an extension to the sweep and no longer this entry's delta. `asd-phase-retro.md` step 6, which the writer reads, cites the same home and is swept. Owner: the documentation reviewer. |
| `pendingMemoryFix` exemption in the AC-14/AC-16 sweep (closing obligation from `test-plan.entry-02.md`) | The two formerly exempted reviewer memory files could reintroduce the refuted claim unseen | static sweep (existing) | keep (rewritten in place) | Both owner memory-fixes landed (`5c48db2`, `b06232a`). The exemption and its filter are deleted, and the sweep compares against `[]`. The assert message keeps one forward instruction (any future exemption names its finding id and is deleted once the fix lands) and drops the text that explained the old exemption. Proof: E19, an appended refuted line in the documentation memory file, which the exemption used to hide, now reddens the sweep. Leftover-term check for this sprint's answer (b) (refuted premise: host serves a reviewer no write tool, `memory: project` only loads it). The sweep is green without the exemption. A wider grep (`no (memory )?write tool`, `only loads`, `host serves`, `no write or commit`, `without one (reviewers`) over canon, README, AGENTS.md, CHANGELOG and all of `.claude/agent-memory/**`, orphan `asd-pm/` included, found only true or historical lines: `review-policy.md`/impl step 3 "owner with no write tool at all" (the fallback); CHANGELOG L263, a past release; correctness memory L10 and documentation memory L36, both narrating that 019 refuted the premise. No `D-N`. |
| `a9ef37c`, COR-5: non-zero exit branch of "Retro intake" | A crashed `retro-candidates` reads as `[]` | static (existing) | keep | Pinned by the TST-1-1 clause assert (M4 in `test-plan.entry-02.md`). Re-run green at `608b417`. |
| `844aa36`, external #2 / EFF-1: deferred candidates sourced from the retro | Drifted backlog copy offered with the wrong side or text | unit (existing, rewritten by `694c28f`) | keep | P1 in `test-plan.entry-02.md`. `.asd/runtime.js` is unchanged since. |
| `0f9f77c` (answer b) canon and its `694c28f` pin rewrites, including the `sprint-lifecycle.md` "Scope per iteration" line (DOC-2) | The refuted contract returns in canon; the iteration scope again names a change source nothing produces | static (existing) | keep | P2–P7 in `test-plan.entry-02.md` ran at `694c28f`. Every canon file they target is unchanged since; only the two memory-fix commits follow. The "Scope per iteration" line is true again under answer (b) because the review-file commit carries reviewer memory, which the AC-13b loop pins at both review workflows (P2). A pin on the line itself would restate that relation from the reader side only. |
| Memory commits `5c48db2`, `b06232a`, the new correctness memory file, and this tester's own `694c28f` memory lines | Refuted claim reintroduced; an index link broken | static (existing) | keep | The AC-14/AC-16 sweep, now without the exemption, and the T-2/T-4 index bijection are both green at `608b417`. |
| `6913672`, COR-7: README `/asd-update` row ("the rest of `.asd/project/**`") | The row again claims `/asd-update` never touches `.asd/project/**` while it migrates `config.yaml` there | none | none | The defect is a contradiction between two clauses of one sentence. The only machine proxy is the fixed phrase "the rest of", a wording lock that a correct reword ("other files under") reddens. It becomes assertable if the row enumerates the untouched files as backticked paths, which could be compared with the `managed_paths` complement. Owner: the documentation reviewer, which reads README against the skill's own carve-out. |
| `.asd/release-manifest.json`, `CHANGELOG.md` L21 | Stale hashes; release note out of step | static (existing) / none | keep / none | The hash-ledger and `canon_hashes` tests are green at `608b417`. CHANGELOG is release prose with no acting reader. Its L21 was checked against the home at HEAD and matches it. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

None. No removal carry-over row exists (see above). The `pendingMemoryFix` deletion is an assertion filter inside a kept test, recorded as `keep (rewritten in place)`.

## Added tests

No new `test(`; the count stays 238. The assertions were appended to four existing tests. Scratchpad script: mutate one file in memory (anchor must hit exactly once), run `node tests/run.js` with stdout and stderr both parsed, restore in `finally` with a byte compare. The worktree was clean (bar `tests/run.js`, then uncommitted) after all 21 runs. Every canon mutation also fails the `upstream_hashes` ledger test, and a mutation of `asd-tester.md` additionally fails `canon_hashes` and `sync.js --check`. That is mutation noise. The FAIL named below is each run's only other failure, with its first assertion quoted.

| Test | Regression proof |
|---|---|
| `sprint-019 AC-14/AC-16: review-policy.md "Autofix vs escalation" routes a memory finding …` (external #1, COR-3, exemption deleted) | E1 routing clause loses "or test-fix `D-N`" → exit 1, 236/238, "sprint-019 external #1: impl step 3 routes a test-fix D-N located in agent memory …". E2 "carrying all its findings" → "carrying its findings" → "… each distinct owner gets one memory-fix dispatch carrying all its findings …". E3 "one at a time, " removed → "… memory-fix dispatches run one at a time …". E4 "after the round's dev and tester chains" removed → "… run after the round's dev and tester chains". E5 order key removed → "… ordered by each owner's lowest finding or D-N id …". E6 "deletes … commits the deletion" → "keeps … commits nothing" → "sprint-019 COR-3: a finding in the memory directory of an agent that no longer exists has no owner …". E7 impl step 3 ownerless clause removed → "sprint-019 COR-3: impl step 3 is where a memory finding meets its owner …". E8 step 9 " or deleted as ownerless" removed → "sprint-019 COR-3: impl step 9's authorised-paths gate must admit …". E9 step 5 "in the order `review-policy.md` "Autofix vs escalation" sets" → "in finding-id order" → "sprint-019 external #1: impl step 5 runs memory-fix dispatches last …". E19 "`memory: project` only loads it." appended to `asd-reviewer-documentation/project_reviewer-write-scope-declaration.md` → 237/238, no ledger noise, "AC-14/AC-16 (iter-01 answer b): … restates the claim iter-01 refuted …". Reword direction: G1 (sequencing sentence reworded end to end, "single" for "one", owners and order reshuffled) and G2 (ownerless sentence reworded, "no owner" moved before a `;`) → 237/238, ledger only. Neither assert locks wording. |
| `sprint-019 AC-11/AC-12/AC-13/AC-15/AC-16: …` (COR-4, DOC-3, DOC-5) | E10 `artifact-layout.md` "It never deletes a test: …" sentence removed → 236/238, "sprint-019 COR-4: the review-fix tester may not touch Removed tests …". E11 `asd-tester.md` " and deletes no test" removed → 234/238, "sprint-019 COR-4: the tester body bounds its review-fix pass …". E12 description reverted to "to amend only" → 234/238, "sprint-019 DOC-5: impl step 3 dispatches the tester in review-fix for findings located in test files …". E13 home reverted to its `33d26ea~1` text → 236/238, "sprint-019 DOC-3: both acting sites run the check at entry 1 only …". E14 tester Do's line reverted to its `33d26ea~1` text → 234/238, "sprint-019 DOC-3: .asd/agents/asd-tester.md must cite the whole check, not restate a scope …". |
| `sprint-019 AC-9/AC-10: the dispatch payload header …` (COR-6) | E15 impl step 6 "with payload opening with the header per …" → "with payload:" → 236/238, "sprint-019 COR-6: .asd/workflows/asd-phase-impl.md step 6 dispatches a dev or tester …". E16 impl-test 1a clause removed → "… asd-phase-impl-test.md step 1a …". E17 impl-review step 9 clause removed → "… asd-phase-impl-review.md step 9 …". |
| `sprint-019 AC-1/AC-3/AC-4/AC-5/AC-6: scope step 2a runs retro intake …` (`74a25b1`) | E18 "Row ids, `Acts on` values and the `covered by:` prefix are" → the pre-fix "Row ids and `Acts on` values are" → 236/238, "sprint-019 74a25b1: "Retro row id" must name the covered-by prefix among its English literals … (got undefined)". |

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once the last review wave's reviewers are
APPROVE/latched. The `pr` gate always reads whatever is recorded here last — the full-suite
record, by the time `pr` runs. Each per-entry record measures only the tree that entry
analysed, not any tree produced later
(`.asd/rules/sprint-lifecycle.md` "Impacted test set").

- Command: `node tests/run.js` (the impacted set is the whole runner)
- Scope: impacted
- Result: pass. 238/238 passed, 0 failed, 0 skipped (exit 0). Entry 3 run. It replaces entry 2's record, whose note wrongly said the commit after its run touched only `.asd/sprints/**` (TST-1-2: `66bcd9b` also edited this tester's agent memory, which two tests read).
- Lint / build: pass. `git diff --check 365fb61 608b417` exit 0, and the `--cached` form ran inside each commit command. `node .asd/sync.js --check` exit 0, `ok: true`, 0 non-current of 72 items.
- HEAD: 608b417. This is the commit the run was verified at, and the pr phase compares current HEAD against it to decide whether to skip re-running. Unlike entries 1 and 2, it includes the entry's own test commit (`382d147`, also green at 238/238) and its tester-memory commit, which the sweep and the index bijection read. The one commit after it changes only `test-plan.md` in this sprint's directory. No test reads `.asd/sprints/019-retro-intake/`: the suite's only two live-tree sprint reads (the sprint-019 AC-4 backlog tests) resolve under `.asd/sprints/archived/`.

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/rules/sprint-lifecycle.md` "Impl-test phase"). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md | AssertionError [ERR_ASSERTION]: AC-14/AC-16: the host serves a reviewer no memory write tool, so a line calling `memory: project` a write channel it uses restates the claim this sprint removed - its owner rewrites it through the memory-fix dispatch. Found: .claude/agent-memory/asd-reviewer-documentation/project_reviewer-write-scope-declaration.md:9, .claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md:8 | sprint-019 AC-14/AC-16: review-policy.md "Autofix vs escalation" routes a memory finding to its owner through the memory-fix dispatch, and no canon, README or agent-memory file - orphan agent directories included - still claims a reviewer writes its own memory | fixed | 1353ea8 |
| D-2 | 1 | .claude/agent-memory/asd-reviewer-documentation/project_reviewer-write-scope-declaration.md | AssertionError [ERR_ASSERTION]: AC-14/AC-16: the host serves a reviewer no memory write tool, so a line calling `memory: project` a write channel it uses restates the claim this sprint removed - its owner rewrites it through the memory-fix dispatch. Found: .claude/agent-memory/asd-reviewer-documentation/project_reviewer-write-scope-declaration.md:9, .claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md:8 | sprint-019 AC-14/AC-16: review-policy.md "Autofix vs escalation" routes a memory finding to its owner through the memory-fix dispatch, and no canon, README or agent-memory file - orphan agent directories included - still claims a reviewer writes its own memory | fixed | 3cf27e5 |
