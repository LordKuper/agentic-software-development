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
