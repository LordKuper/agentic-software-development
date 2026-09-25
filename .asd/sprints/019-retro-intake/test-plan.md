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

## Risk → check decisions

Entry 1's rows are in `test-plan.entry-01.md`. Delta `88ceb3b...HEAD` (review pathspec): two reviewer agent-memory files, rewritten by the test-fix memory-fix dispatch (`1353ea8`, `3cf27e5`). No canon, runtime or test file changed. Pre-strategy run (whole runner = impacted set, at `d7a9e68`): `node tests/run.js` → exit 0, 238/238.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `asd-reviewer-testing/feedback_no-shell-review-method.md` L8 (D-1 fix) | The removed claim that `memory: project` is a write channel the reviewer uses comes back into memory the agent reloads on every dispatch | static sweep (existing) | keep | Entry 1's AC-14/AC-16 sweep is the regression test. Proof against the pre-fix blob: see `Added tests` note. The new text (no write tool; a `MEMORY-FIX <path>` block with no verdict token; the orchestrator applies it verbatim) was read against `review-policy.md` "Autofix vs escalation" at HEAD and matches it. |
| `asd-reviewer-documentation/project_reviewer-write-scope-declaration.md` L9 (D-2 fix) | Same risk: the "`memory: project` channel" exclusion comes back | static sweep (existing) | keep | Same test. Proof: see `Added tests` note. |
| Same file, pre-fix L19 (External Review "carve-out scopes that rule to its own memory directory"), removed by the D-2 fix | That sentence comes back, telling a reviewer that External Review may write its own memory | none | none | The canon half of this claim, `asd-external-review.md`'s old "Carve-out: this agent's own memory writes", is already pinned (entry 1 M19, AC-15/iter-05 test). The memory sentence shares no removed token with canon. The only proxy is an order-bound co-occurrence regex. Measured: `carve-out[^.]*memory` over canon, README, AGENTS.md and `.claude/agent-memory/**` hits a legitimate line (`artifact-layout.md:94`, the generated-view carve-out). The fixed line itself says "no memory carve-out", so a looser regex would redden it. Pinning the one old sentence verbatim is a wording lock that any paraphrase gets past. It becomes assertable only if canon names a removed phrase shared with memory. Owner: the memory's owning reviewer, through the memory-fix dispatch. |
| Same file, new "How to apply" claims about what `tests/run.js` AC-15 and the AC-14/AC-16 sweep check, and what README and `providers.md` state | The memory describes the suite or its mirrors wrongly, and a later SSoT finding rests on that false premise | none | none | Read at HEAD, every claim holds. AC-15 pins the agent-memory carve-out with the `artifact-layout.md` pointer, the memory-fix dispatch with the "Autofix vs escalation" pointer, and `claude.memory === 'project'` on External Review. The sweep fails on a `write channel` line. README L215 names the memory-fix dispatch. The `providers.md` pin forbids a copy of the `MEMORY-FIX` contract. Asserting a memory file's own summary of the suite would pin one agent's paraphrase of assertions that already exist. Its drift misleads only that agent. |
| Same file, frontmatter `description` (`3cf27e5`) vs its `MEMORY.md` index line | Index ↔ file bijection breaks | static (existing) | keep | The T-2/T-4 bijection test covers the link and is green. The index hook ("bounded to canon, agent memory excluded") is still true and states no removed claim. |
| Review-fix wave-1/iter-01, TST-1-1: `sprint-lifecycle.md` "Retro intake" disposition clauses (non-zero exit, empty, resolved, include/reject/undecided) and `asd-phase-scope.md` step 4 backlog write | An undecided row is never written and is lost once the next retro archives; a resolved row is re-asked; an empty intake writes the backlog; a crashed run reads as `[]`; step 4's write is dropped or aimed at another path, so disposed rows come back every scope | static clause asserts, appended to the one test that reads "Retro intake" (retitled `sprint-019 AC-1/AC-3/AC-4/AC-5/AC-6: …`) | add | Supersedes entry 1's AC-3/AC-5 `none` for these rule literals (`test-plan.entry-01.md` row 30 keeps HEAD verification, the recommendation and the log line as runtime judgement). Each clause is sliced by sentence and each token tested on its own; dispositions are located by stem, so a correct reword stays green (G1). The step 4 path is derived from step 2a's `--backlog` argument, not a literal. Proof: `Added tests`. |
| Review-fix wave-1/iter-01, dev round `0f9f77c`/`e107153` (answer b: `memory: project` serves a reviewer `Write`) vs four pins that asserted the refuted "no write tool" contract | Pins keep the false claim in canon, or a blind deletion leaves the new contract unpinned | static (existing, rewritten in place) | keep (rewritten in place) | Four tests rewritten to assert the new contract, none deleted. (1) AC-15/sprint-019 AC-14: the scope sentence names `memory: project`, `Write`, own memory, the memory-fix dispatch and its home; new config binding: all five reviewers keep `memory: project` and no `Write` in `disallowedTools`, the fact `providers.md` and `review-policy.md` now state. (2) AC-15/iter-05: External Review's bullet names its own-memory `Write` exception. (3) AC-13b: the review-file write step, inverted, must say its commit carries memory the reviewer authored and cite `git-strategy.md` "Commit before review". (4) AC-14/AC-16: new clause assert (owner fixes with its own write tool, `memory: project` serves reviewers one); sweep retargeted from `write channel` (now true) to the refuted phrases `serves/gives a reviewer\|it no write tool` and `only loads it/its memory`. Entry 2's rows above describe the old sweep; their premise is superseded here. |
| Same sweep: pending-memory-fix exemption | COR-1/DOC-1 leave three stale lines in two reviewer memory files (documentation L10, L23; testing L8), owned by reviewers whose memory-fix dispatches run after this tester chain; an exact pin would redden when those land, and shipping red blocks the round | exemption list in the sweep, both files named with their finding ids in the assert message | keep | Measured load-bearing (P7: emptying it reddens with exactly those three lines). Closing obligation for the next `impl-test` entry: once the owners' fixes land, delete `pendingMemoryFix` and its filter; until then a reintroduction in those two files passes. The correctness reviewer's memory narrates the refuted claim as "no memory write tool", which the sweep does not match, so no permanent exemption is needed. |
| Review-fix wave-1/iter-01, `844aa36` (`retroCandidates` deferred rows as the retro states them) | A deferred candidate takes Acts on or guardrail from the backlog's human-readable copy, so a drifted copy is offered with the wrong text or passes the wrong project filter | unit (existing AC-1/AC-2 test, fixture changed) | keep (rewritten in place) | Fixture row `017-b#A-4` now differs from its retro in both fields (backlog: `consumer`, extra text; retro: `asd`, `Deferred latest action`). Expected candidate reads the retro; the consumer-filter assert now also proves the filter reads the retro's Acts on. Proof: P1. |
| TST-1-2: entry 2 `Suite run` note ("This entry's own commit changes only `.asd/sprints/**`, which no test reads") | Record inaccuracy only | none | none | Correction, recorded here because a review-fix tester may not edit `Suite run`: the commit after `d7a9e68`, `66bcd9b` (entry 2's `HEAD analysed`), also edited `.claude/agent-memory/asd-tester-critical/project_mutation-runs-trip-the-hash-ledger.md`, which the AC-14/AC-16 sweep and the T-2/T-4 index bijection both read. Statically inert for both (no sweep match, still indexed), and this round's own run at the review-fix HEAD covers it. The next `impl-test` entry, or the terminal full-suite run, rewrites `Suite run` and should drop the claim. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

None. The delta touches no test file, and no existing test lost its risk.

## Added tests

| Test | Regression proof |
|---|---|

None this entry. §17 no-new-test rule: every risk above is either covered by an existing check or recorded as `none`. Regression proof for the D-1/D-2 fixes, both run on the existing sprint-019 AC-14/AC-16 sweep. Scratchpad script: write the pre-fix blob (`git show 1353ea8~1:<path>`, argv form), run `node tests/run.js`, restore in `finally` with a byte compare. Worktree clean afterwards.
- D-1, `feedback_no-shell-review-method.md` reverted → exit 1, 237/238. Only failure: `sprint-019 AC-14/AC-16: review-policy.md "Autofix vs escalation" routes a memory finding …`, first assertion "AC-14/AC-16: the host serves a reviewer no memory write tool, so a line calling `memory: project` a write channel it uses restates the claim this sprint removed … Found: .claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md:8".
- D-2, `project_reviewer-write-scope-declaration.md` reverted → exit 1, 237/238. Same test and assertion, "Found: .claude/agent-memory/asd-reviewer-documentation/project_reviewer-write-scope-declaration.md:9".
- No hash-ledger noise: agent memory is not in `managed_paths`.

Review-fix wave-1/iter-01 (TST-1-1 plus the answer-(b) pin rewrites). No new `test(`; count stays 238. Scratchpad script: mutate one file in memory, `node tests/run.js` (stdout and stderr both parsed), restore in `finally` with a byte compare; worktree clean after every run. Each canon mutation also fails the `upstream_hashes` ledger test (agents add `canon_hashes` and `--check` drift), which is mutation noise; the FAIL named below is each run's only other failure, first assertion quoted.

| Test | Regression proof |
|---|---|
| `sprint-019 AC-1/AC-3/AC-4/AC-5/AC-6: scope step 2a runs retro intake …` (TST-1-1 clause asserts) | M1 `undecided → dropped` → 236/238, "sprint-019 TST-1-1/AC-3: an undecided row is written deferred …". M2 resolved one asked like the rest → "… a candidate re-verification finds resolved is written closed without asking …". M3 `, no backlog write` removed → "sprint-019 TST-1-1/AC-5: an empty candidate list is a no-op …". M4 non-zero-exit sentence deleted → "sprint-019 TST-1-1: a failed retro-candidates run blocks intake …". M5 `reject → skipped this sprint` → "… a rejected row is never offered again". M6 `include → a note` → "… an included row becomes an AC-N of this sprint". M7 step 4 backlog write deleted and M8 step 4 path → `retro-log.md` → both "sprint-019 TST-1-1/AC-4: scope step 4 writes step 2a's dispositions to the backlog path step 2a reads …". Reword direction: G1 dispositions reworded end to end ("an included row becomes …, a row left undecided is written `deferred`") and G2 step 4 reworded ("persist the step 2a dispositions into") → 237/238, ledger only: not a wording lock. |
| `sprint-019 AC-1/AC-2/AC-5: retroCandidates …` (fixture rewrite) | P1 `.asd/runtime.js` reverted to `844aa36~1` → 236/238, "AC-1: 017-b is the latest archived sprint …". |
| `AC-13b/sprint-010 AC-3/sprint-019 AC-14: …` (write step inverted) | P2 impl-review step's ", and the commit carrying it also carries any agent memory that reviewer authored (…)" removed → 236/238, "sprint-019 AC-14 (iter-01 answer b): .asd/workflows/asd-phase-impl-review.md: … committed with its review file …". |
| `AC-15/sprint-019 AC-14: review-policy.md is sole SSoT …` (scope sentence, config binding) | P3 `"Write"` added to `asd-reviewer-testing` `disallowedTools` → 234/238, "sprint-019 AC-14: asd-reviewer-testing: … no reviewer's disallowedTools names it …". P3b scope sentence → "serves a reviewer no write tool, it only loads its memory" → 235/238, "sprint-019 AC-14 (iter-01 answer b): on Claude `memory: project` serves a reviewer `Write`, so the scope statement must say so …", plus the sweep (next row). |
| `AC-15/iter-05: providers.md names External Review …` (bullet names the `Write` exception) | P4 ", with the `Write` `memory: project` serves on Claude" removed → 234/238, "sprint-019 AC-14 (iter-01 answer b): External Review's write ban is blanket for the review itself …". |
| `sprint-019 AC-14/AC-16: … still claims the host serves a reviewer no memory write tool` (clause assert, retargeted sweep) | P6 memory-fix clause "— on Claude `memory: project` serves every owner one, reviewers and External Review included (…)" removed → 236/238, "AC-14 (iter-01 answer b): the owner fixes the file with its own write tool …". P5 orphan `asd-pm/MEMORY.md` + "`memory: project` only loads it." → 237/238 (no ledger noise), sweep "AC-14/AC-16 (iter-01 answer b): … restates the claim iter-01 refuted …". P5d same file + "The host serves a reviewer no write tool." → same. P3b above fires it on canon. P5c `review-policy.md` reverted to `0f9f77c~1` → 235/238, the clause assert fires first in this test, not the sweep. P7 exemption emptied → 237/238, Found: documentation L10, L23, testing L8. |

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
- Result: pass — 238/238 passed, 0 failed, 0 skipped (exit 0). Entry 2 run; replaces entry 1's 237/238 at `685ff27`, whose one failure was the D-1/D-2 sweep, now fixed
- Lint / build: pass — `git diff --check` over this entry's two files exit 0 (the `--cached` form runs inside the commit command); `node .asd/sync.js --check` exit 0, `ok: true`, 0 non-current of 72 items
- HEAD: d7a9e68 — commit this run was verified at; pr phase compares current HEAD against this to decide whether to skip re-running. This entry's own commit changes only `.asd/sprints/**`, which no test reads

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/rules/sprint-lifecycle.md` "Impl-test phase"). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md | AssertionError [ERR_ASSERTION]: AC-14/AC-16: the host serves a reviewer no memory write tool, so a line calling `memory: project` a write channel it uses restates the claim this sprint removed - its owner rewrites it through the memory-fix dispatch. Found: .claude/agent-memory/asd-reviewer-documentation/project_reviewer-write-scope-declaration.md:9, .claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md:8 | sprint-019 AC-14/AC-16: review-policy.md "Autofix vs escalation" routes a memory finding to its owner through the memory-fix dispatch, and no canon, README or agent-memory file - orphan agent directories included - still claims a reviewer writes its own memory | fixed | 1353ea8 |
| D-2 | 1 | .claude/agent-memory/asd-reviewer-documentation/project_reviewer-write-scope-declaration.md | AssertionError [ERR_ASSERTION]: AC-14/AC-16: the host serves a reviewer no memory write tool, so a line calling `memory: project` a write channel it uses restates the claim this sprint removed - its owner rewrites it through the memory-fix dispatch. Found: .claude/agent-memory/asd-reviewer-documentation/project_reviewer-write-scope-declaration.md:9, .claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md:8 | sprint-019 AC-14/AC-16: review-policy.md "Autofix vs escalation" routes a memory finding to its owner through the memory-fix dispatch, and no canon, README or agent-memory file - orphan agent directories included - still claims a reviewer writes its own memory | fixed | 3cf27e5 |
