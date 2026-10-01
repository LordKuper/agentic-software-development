---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 023-retro-glings-008-remediation

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
| 1 | 24141f5 | full change surface |
| 2 | ace6656 | delta since entry 1 |
| 3 | 53e7ffe | delta since entry 2 |
| 4 | d498f12 | delta since entry 3 |
| 5 | b115cbb | delta since entry 4 |
| 6 |  | delta since entry 5 |

## Risk → check decisions

Entry 6, delta since `b115cbb`: `git diff b115cbb...HEAD --stat` over the entry-1 pathspec, 4 files, +24 −3: the impl-review wave-1 iteration-2 review-fix (`51ea24e`, combined finding F1: the two format-rule lines of `.asd/templates/t_plan.md` for `Reachability` and `Settings change`, +2 −2), the ledger refresh (`6001fa0`, the one `upstream_hashes` value of `t_plan.md` in `release-manifest.json`, +1 −1) and the reviewer-authored `asd-reviewer-combined/feedback_re-review-mirror-pointers.md` with its index line (`42b9d67`, +20 and +1). The impacted set degrades to the whole `node tests/run.js` by the safety valve: `t_plan.md` is a template read by the plan-format tests and by the `upstream_hashes` ledger, `release-manifest.json` is the ledger itself, and the memory file is read by the agent-memory sweeps. Entry 5's rows rotated into `test-plan.entry-05.md`; no review-fix or in-place tester row sat in the live tables (the F1 fix was a dev's template edit, the review's "No test change needed" is re-checked below), and no removal row carries forward.

Pre-strategy run at `0318283`: `node tests/run.js` → exit 0, 272/272.

The delta has no test file, so the question per row is whether a pin went red or stopped pinning and whether the fix left a risk nothing asserts. Measured, not read: baseline B1, the pre-fix text of both lines restored against the unchanged suite (exit 1, 271/272, ledger noise only, no own FAIL).

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `t_plan.md` format rules for `Reachability` (line 19) and `Settings change` (line 20): ", same placement;" replaced by the placement spelled out, ", under the `Material risk` line(s) and any `Test-only` line;" and ", under the `Material risk`, `Test-only` and `Reachability` lines;" (review F1) | the template, the text a plan author reads, states an order the rule home does not: chained, "same placement" put `Settings change` ahead of `Reachability` and `Reachability` into the slot the line above gives `Test-only`; entry 4 recorded these two lines as an unread ceiling, and no assert reads their placement | static relation over code spans | add (extends the AC-5 test; supersedes the entry-4 ceiling "lines 19-20 are not read") | The review's "No test change needed" is measured: baseline B1 (both ", same placement;" clauses restored) against the unchanged suite shows no own FAIL, so the defect the review found is a silent de-pin and the fix is pinned by nothing. A defect found in review with an identified failure mode (a plan author reads the reverse order) qualifies under `code-style.md` §17. Added inside the AC-5 test, no new test: a loop over `Reachability` and `Settings change` takes the template's `- ` rule line carrying that declaration's code span and requires the code spans in the text before its first `;`, minus its own declaration span, to equal as a sequence the list the home declaration gives, read with the same `placement` helper the home asserts above use, so no member is hand-listed and the home's own list is already asserted there. The pins on the same lines hold at the pre-strategy run and at the gate: the first line with the `Reachability:` line span still carries the `interruption point` clause, the example blocks are untouched, the `Settings change` line is found by its `<key>=<value>` literal and still names `t_config.yaml`, and line 18 stays the only line holding the full `Test-only: <…>` shape (lines 19 and 20 name `Test-only` without the colon). Ceilings: the check reads the spans, not the connector word, so a reversal by a connector synonym ("above" for "under") passes, as for the `Test-only` rule; a correct reword that moves the placement clause past the line's first `;` reddens; a reorder of either home list reddens the template until it follows, the intent being one order |
| `release-manifest.json`: the `upstream_hashes` value of `t_plan.md` (`6001fa0`) | a stale ledger value against the edited template | static | none | The `upstream_hashes` test (`every upstream_hashes entry matches the actual file`) is green at the pre-strategy run and at the gate, and red exactly while the template is mutated in the runs below, as expected. `canon_hashes` holds no entry for a template; `node .asd/sync.js --check` exit 0, `ok: true` at the gate |
| Memory: reviewer-authored `asd-reviewer-combined/feedback_re-review-mirror-pointers.md` and its index line (`42b9d67`); own `asd-tester-critical/project_testability-envelope.md` (one method lesson folded into the placement-order paragraph) | a work-history ordinal or id in memory; a dangling index link; an instruction outside the agent's tool policy | static (existing sweeps) | none | The `sprint-023 leftover-term check` (reads every `.md` under agent memory) and the agent-memory index bijection are green at the pre-strategy run and at the gate. The reviewer's file was read: no sprint, Task, wave, iteration or verdict id, and its instructions (grep the mirrors, read the test-plan entry files' ceilings) are reads inside the reviewer's grant. `node .asd/runtime.js memory-check` on this entry's staged memory diff prints `[]` |
| the removed strings of `git diff b115cbb HEAD` (leftover-term check) | the removed ", same placement;" survives in the two template lines, or elsewhere as a current pointer | static (existing sweeps) | none | `git grep -nF "same placement"` over the worktree minus `.asd/sprints/` and `CHANGELOG.md`: `t_plan.md` holds none (not only lines 19 and 20); canon, README, the other templates and the generated views hold none. It survives in `tests/run.js` (the new assert message, naming the idiom as the defect) and in the reviewer's memory file and index line (quoting it as the defect class), none an instruction to use it. Not appended to the `sprint-023 leftover-term check` list although the pre-sprint base `86e7706` held both clauses: the defect was the unread chain, now pinned by relation, and a phrase ban would also forbid a harmless adjacent-clause idiom and flag the memory's quotation. Flagged in the return as the orchestrator's call |

## Removed tests

None this entry; no test deleted. Entries 3 to 5 deleted none; entry 2's removals are in `test-plan.entry-02.md`.

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here. Entry 6 adds no new test: one loop of two members (five lines) is added to one existing test, so the count stays 272. Every mutation is one edit of `.asd/templates/t_plan.md`, run as `node tests/run.js` by the scratch runner `.asd/tmp/mutate-e6.js` (not committed) and restored in the same process by a byte-equal write (`restoreFailed=false` on every run; `git status --porcelain` afterwards listed only this entry's own files). Each mutated run also fails the expected ledger noise (`release-manifest.json: every upstream_hashes entry matches the actual file`); the failing test is the own FAIL line after it, its message transcribed from the runner. Baseline B1 measures the unchanged suite and proves no assertion; it is not counted in the bound of `code-style.md` §17.

| Test | Regression proof |
|---|---|
| (a) `sprint-023 AC-5: the Test-only declaration is defined once in sprint-lifecycle.md "Plan file format", t_plan.md mirrors its shape…` (existing test extended: a loop over the `Reachability` and `Settings change` rule lines of `t_plan.md`, each compared with the placement its home declaration gives) | baseline B1, both ", same placement;" clauses restored, unchanged suite: `node tests/run.js` → exit 1, 271/272, no own FAIL; M1 the `Reachability` rule's placement back to ", same placement;": `node tests/run.js` → exit 1, 270/272, own FAIL `sprint-023 AC-5: the Test-only declaration is defined once…`, "t_plan.md's Reachability rule must place the line under the same lines, in the same order, as sprint-lifecycle.md "Plan file format" - "same placement" chains from the rule above it and can order the line ahead of one the home puts before it; the asserts above read only the Test-only rule"; M2 the `Settings change` rule's list reordered to `Material risk`, `Reachability` and `Test-only`, the `Reachability` rule intact so the loop's second member is reached: `node tests/run.js` → exit 1, 270/272, the same test, "t_plan.md's Settings change rule must place the line under the same lines, in the same order, as sprint-lifecycle.md "Plan file format" - …"; control C1 the "under" of both rules reworded "directly beneath": `node tests/run.js` → exit 1, 271/272, no own FAIL (ledger noise only); runs: 3 (2 red, 1 control) |

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once the last review wave's reviewers are
APPROVE/latched. The `pr` gate always reads whatever is recorded here last — the full-suite
record, by the time `pr` runs. Each per-entry record measures only the tree that entry
analysed, not any tree produced later
(`.asd/rules/sprint-lifecycle.md` "Impacted test set").

- Command: `node tests/run.js` (the safety valve degrades the impacted set to the whole suite: the delta touches `t_plan.md`, read by the plan-format tests and the `upstream_hashes` ledger, and `release-manifest.json`, the ledger itself)
- Scope: impacted, degraded to full by the safety valve
- Result: pass — 272/272 (exit 0; 272 `ok -` lines, 0 `FAIL -`, no failing names), run on the worktree after this entry's test and memory edits. Net 272 → 272: 0 tests added, 0 removed; one loop of two members added to one existing test
- Lint / build: pass — `node .asd/sync.js --check` exit 0, `ok: true`; `git diff --check` over this entry's paths exit 0 and `git diff --cached --check` exit 0 with only this entry's own files staged; `node .asd/runtime.js memory-check` on the staged memory diff `[]`
- HEAD: 0318283 — the commit the delta was measured at (the pre-strategy run and the strategy are at the same commit). The run covers 0318283 plus this entry's uncommitted `tests/run.js`, memory and `test-plan` files, which the entry's commit follows, so it is the first run at a tree holding that edit; no test reads a live sprint file

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/rules/sprint-lifecycle.md` "Impl-test phase"). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 2 | `.claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md` | `AssertionError [ERR_ASSERTION]: each phrase is from a line this sprint deleted (git diff 86e7706 HEAD), taken exactly - one surviving restates the tier table, the manifest in the prompt, the re-entry tier clamp, the change-surface cap or a removed shape as current. A later sprint that re-adopts a phrase deletes its entry here. CHANGELOG.md and sprint folders are history and stay out of the sweep` — actual: `.claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md:67 surfaceCheck`; line 60 of the same file also cites the removed cap-override request as an example, which no exact removed string covers | `sprint-023 leftover-term check: no canon, README, AGENTS.md, template, runtime, hook, workflow definition or agent-memory line keeps a sentence or term the sprint removed - the tier matrix heading, the inline scope manifest, the clamped priorTier and its re-entry wording, the line-only wave division and its waves.json shape, the dropped asd intake rows, the unconditional branch fast-forward, the unqualified "impl writes no tests" and the change-surface cap - its constant, subcommand, plan line and override gate` | fixed | 887bbb1 |

## Manual verification (optional)

No row for a user smoke check. One path is verifiable only by a live dispatch and stays open by the audit's own decision (audit "Risks", AC-3 residual): the wrapped CLI on the Codex host reading `external.scope.json` by path with its read-only tools. The Claude-host direction has prior `external.md` files showing it read `files[]` and the diff by path. This entry does not add a smoke-check row because the user gate at `asd-phase-impl-test.md` step 10 cannot run a Codex-host dispatch; the check is the orchestrator's after merge. Flagged in the return.
