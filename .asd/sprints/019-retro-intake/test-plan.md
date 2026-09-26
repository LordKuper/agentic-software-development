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
| 4 | b179046 | delta since entry 3 |

## Risk → check decisions

Entry 3's rows are in `test-plan.entry-03.md`, together with the rows the review-fix wave-1/iter-02 tester chain (`0453431`) added after entry 3 closed. That chain filed no removal row (its decisions are `add (re-pin)`, `add` and `keep`), so no `Removed tests` row was carried forward. Delta `c43681a...HEAD` (review pathspec): dev `6ed5150` (COR-1, DOC-2-2, DOC-2-3) and `5db902a` (DOC-2-1), tester `0453431`, and memory commits: the reviewer memories in `512571a`, dev-critical `73ee52d` and `c8f2e28`, tester-critical `d40dad5` and `89ffa46`. Pre-strategy run (the whole runner is the impacted set) at `e927938`: `node tests/run.js` → exit 0, 238/238. All five iter-02 reviews were read. Every finding (COR-1, DOC-2-1..3) has a pin from the `0453431` chain, and each pin has a mutation proof in `test-plan.entry-03.md`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `6ed5150`, `5db902a` canon (`review-policy.md`, `artifact-layout.md` "Test plan", `asd-phase-impl.md` steps 3/9, `asd-phase-impl-test.md` step 4) | The COR-1, DOC-2-1, DOC-2-2 and DOC-2-3 fixes regress | static (existing) | keep | The `0453431` chain pinned each fix with proofs M1–M12 and reword checks G1–G4 (`test-plan.entry-03.md`). No canon file those pins read has changed since `0453431`. The only later commits are memory and sprint bookkeeping. Green at `e927938`. |
| Memory commits `512571a` (reviewer correctness, documentation, efficiency, testing), `73ee52d`/`c8f2e28` (dev-critical), `d40dad5`/`89ffa46` (tester-critical) | A memory file reintroduces the refuted "no write tool" claim; an index link breaks | static (existing) | keep | The AC-14/AC-16 sweep, now with the code-span strip, and the T-2/T-4 index bijection are both green at `e927938`. The rotation citations corrected in `89ffa46` (`artifact-layout.md` "Test plan" Rotation, `asd-phase-impl-test.md` step 4 re-entry) were read against canon at HEAD and are correct. |
| AC-14/AC-16 sweep regex vs the variant "no memory write tool" (testing reviewer iter-02 below-floor note a) | A memory or canon line says "serves a reviewer no memory write tool", and the sweep misses it | none | none | This is outside the delta: `0453431` changed only the code-span strip, not the claim regex. Measured at HEAD: a widened `(?:serves\|gives) … no (?:memory )?write tool` would match `asd-reviewer-correctness/feedback_check-host-claims-against-own-dispatch.md:10`. That line narrates the refuted premise as history and is true. Adding the variant therefore needs a negation-or-history guard that no token can derive, or an exemption naming a file that is not a defect. It becomes assertable once that memory line is quoted in backticks, which the strip already skips. Owner: the testing reviewer, whose note (a) raised it below floor. |
| `CHANGELOG.md` L20–L21 (v13.2.0 "Fresh tester per entry", "Memory-finding routing") | The release note is out of step with its homes | none | none | CHANGELOG is release prose that no workflow step reads. Both lines were checked against HEAD. L20's rotation clause matches `artifact-layout.md` "Test plan" Rotation and impl-test step 4. L21's withheld-write-tool fallback and orchestrator-set `fixed` match `review-policy.md` "Autofix vs escalation". |
| `.asd/release-manifest.json` hashes for `artifact-layout.md`, `review-policy.md`, `asd-phase-impl.md`, `asd-phase-impl-test.md` | Stale hash ledger | static (existing) | keep | The `upstream_hashes` and `canon_hashes` tests are green at `e927938`. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

None. The review-fix chain filed no removal row, and this entry found no test that has stopped earning its keep.

## Added tests

None. This entry makes no test edit, so the count stays 238. The delta's material risks are already pinned by the `0453431` chain, whose mutation proofs are in `test-plan.entry-03.md`. The one residual gap is recorded as `none` above, with its measurement.

| Test | Regression proof |
|---|---|

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
- Result: pass. 238/238 passed, 0 failed, 0 skipped (exit 0). This is entry 4's run, and it replaces entry 3's record.
- Lint / build: pass. `git diff --check c43681a HEAD -- . ':!.asd/sprints/**'` exited 0. The unscoped form flags only blank context lines inside the review-archived `.diff` files under `reviews/impl/wave-1/iter-02/`, which is sprint bookkeeping. `node .asd/sync.js --check` exited 0 with `ok: true`.
- HEAD: e927938. This is the commit the run was verified at; the pr phase compares current HEAD against it to decide whether to skip re-running. This entry changes no test or canon file. Its only commit touches `test-plan.md` and `test-plan.entry-03.md` in this sprint's directory, and no test reads `.asd/sprints/019-retro-intake/`.

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/rules/sprint-lifecycle.md` "Impl-test phase"). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md | AssertionError [ERR_ASSERTION]: AC-14/AC-16: the host serves a reviewer no memory write tool, so a line calling `memory: project` a write channel it uses restates the claim this sprint removed - its owner rewrites it through the memory-fix dispatch. Found: .claude/agent-memory/asd-reviewer-documentation/project_reviewer-write-scope-declaration.md:9, .claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md:8 | sprint-019 AC-14/AC-16: review-policy.md "Autofix vs escalation" routes a memory finding to its owner through the memory-fix dispatch, and no canon, README or agent-memory file - orphan agent directories included - still claims a reviewer writes its own memory | fixed | 1353ea8 |
| D-2 | 1 | .claude/agent-memory/asd-reviewer-documentation/project_reviewer-write-scope-declaration.md | AssertionError [ERR_ASSERTION]: AC-14/AC-16: the host serves a reviewer no memory write tool, so a line calling `memory: project` a write channel it uses restates the claim this sprint removed - its owner rewrites it through the memory-fix dispatch. Found: .claude/agent-memory/asd-reviewer-documentation/project_reviewer-write-scope-declaration.md:9, .claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md:8 | sprint-019 AC-14/AC-16: review-policy.md "Autofix vs escalation" routes a memory finding to its owner through the memory-fix dispatch, and no canon, README or agent-memory file - orphan agent directories included - still claims a reviewer writes its own memory | fixed | 3cf27e5 |
