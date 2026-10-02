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
| 6 | 24dd0d0 | delta since entry 5 |
| 7 |  | delta since entry 6 |

## Risk → check decisions

Entry 7, delta since `24dd0d0`: `git diff 24dd0d0...HEAD --stat` over the entry-1 pathspec, 6 files, +32 −5: the impl-review wave-2 iteration-1 review-fix (`bf36941`, combined finding F1 and external finding F1: the fresh-id sentence of `.asd/rules/providers.md` "Task-class variants and routing" plus a sentence giving each terminal-suite run its own id, and the `Red, test defect` bullet of `.asd/workflows/asd-phase-impl-review.md` step 9, +1 −1 each), the ledger refresh (`5fd6485`, the two `upstream_hashes` values of those files in `release-manifest.json`, +2 −2) and the reviewer-authored `asd-reviewer-combined` memory committed with the review (`1d3e49e`: one new file +21, two bullets +5 in one existing file, an index line reworded and one added, +2 −1). The impacted set degrades to the whole `node tests/run.js` by the safety valve: `providers.md` is a framework-wide rule doc read by most content tests, `release-manifest.json` is the `upstream_hashes` ledger itself, and the memory files are read by the agent-memory sweeps. Entry 6's rows rotated into `test-plan.entry-06.md`; no review-fix or in-place tester row sat in the live tables (the review-fix was a dev's rule and workflow edit), and no removal row carries forward.

Pre-strategy run at `6913eb1`: `node tests/run.js` → exit 0, 272/272.

The delta has no test file, and both reviewers found the same gap: the AC-9 test requires one sentence naming the original three ids and a citation at four sites, so the five-id list, the per-run id and the bullet's own citation may be pinned by nothing. Measured, not read: baselines B1 to B3, each part of the fix restored to its pre-fix text against the unchanged suite (each exit 1, 271/272, ledger noise only, no own FAIL).

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `providers.md` "Task-class variants and routing": the fresh-id sentence now also names `test-fix <D-ids>` and `impl-review <id> test-fix` (the in-place low-severity test fix), and a new sentence gives each terminal-suite run its own id, `impl-review <id> suite` then `impl-review <id> suite <n>` for run n ≥ 2, a re-run after a test-defect fix included (reviews F1) | a later edit drops one of the two added ids or the per-run rule silently: a test-fix round then has no `risks` source, the in-place test fix shares a `task_routing` record with its iteration's dev review-fix round (which then reads the tester's tier as `priorTier`), and a re-run after a test-defect fix reuses the first run's key, so a later test-only delta inherits that run's tier | static relation over code spans | add (extends the AC-9 test; no new test) | Baselines B1 (both added ids restored to the three-id list) and B2 (the per-run sentence deleted) show no own FAIL: the existing test finds the first sentence naming its three ids and asserts nothing about further ids, so the review-fix is a defect found in review whose pin is absent, with an identified failure mode (a clamped tier on the wrong dispatch), which qualifies under `code-style.md` §17. Added inside the AC-9 test: `ids` gains the two entries in the one list the test already holds, so the sentence must name all five (the home is read from the file; the test names the ids once, where the assertion must), the terminal-suite id is lifted into a constant `suite`, and a second sentence lookup requires a sentence carrying `suite` and a span that extends it by a space-separated suffix, derived from `suite` so `<n>` is not hand-listed. Ceilings: the per-run check reads the span, not "n ≥ 2" or "a re-run included", which stay prose; a reword that drops the extended span (a bare "a numbered id") reddens, a different suffix spelling stays green; an id the home adds later is unpinned until added to `ids` |
| `asd-phase-impl-review.md` step 9, `Red, test defect` bullet: the re-run is "a new terminal run, routed with its own id per `providers.md` "Task-class variants and routing"" (external F1) | the bullet loses the pointer: a re-run is then routed from the step's first-run dispatch sentence two bullets above, under the first run's id and tier | static (citation) | add (same test) | Baseline B3 (the clause dropped, the pre-fix bullet) shows no own FAIL: the existing loop checks `stepOf(…, 9)` for the citation, and the step's dispatch sentence satisfies it, so the bullet's own pointer was pinned by nothing. Added: the line of the step 9 block holding the bold label `**Red, test defect**` must include the citation. The substance (each run takes its own id) lives in the home's per-run sentence, pinned above; this pins the acting site's pointer, the one machine-decidable property of a citation. Ceilings: the pointer, not the sentence around it; renaming the label reddens with a message naming it; the sibling bullets are not pinned by this check |
| `release-manifest.json`: the `upstream_hashes` values of `providers.md` and `asd-phase-impl-review.md` (`5fd6485`) | a stale ledger value against the edited files | static | none | The `upstream_hashes` test is green at the pre-strategy run and at the gate, and red exactly while a mutated file is on disk in the runs below, as expected. `canon_hashes` holds no entry for a rule doc or workflow; `node .asd/sync.js --check` exit 0, `ok: true` at the gate |
| Memory: reviewer-authored `asd-reviewer-combined/feedback_doc-economy-pinned-clauses.md`, two bullets of `feedback_large-diff-read-budget.md` and the `MEMORY.md` index (`1d3e49e`); own `asd-tester-critical/project_testability-envelope.md` (one lesson folded into the cross-file-citation paragraph) | a work-history ordinal or id in memory; a dangling index link; an instruction outside the agent's tool policy | static (existing sweeps) | none | The `sprint-023 leftover-term check` (reads every `.md` under agent memory) and the agent-memory index bijection are green at the pre-strategy run and at the gate. The reviewer's files were read: no sprint, Task, wave, iteration or verdict id, and their instructions (grep `tests/run.js` for the step's heading, read the plan decision, scope a `Grep` to a canon subdirectory, `Read` with an offset) are reads inside the reviewer's grant. `node .asd/runtime.js memory-check` on this entry's staged memory diff prints `[]` |
| the removed strings of `git diff 24dd0d0 HEAD` (leftover-term check) | the three-id sentence or the bullet's bare "re-runs this step; loop until" survives as a current instruction | static (existing sweeps) | none | `git grep -nF` over the worktree minus `.asd/sprints/` and `CHANGELOG.md` for "re-runs this step; loop until", "`review-fix <id>` or `impl-review <id> suite` id" and "An `impl-test entry N`, `review-fix <id>` or": no hit in canon, README, templates, generated views or agent memory; the only copies sit in the ignored scratch directory `.asd/tmp/`, not committed. The two removed ledger hashes are values, not terms. Not appended to the `sprint-023 leftover-term check` list: the old text was an enumeration and a bare re-run clause, now pinned by relation (five ids, the per-run id, the bullet's pointer), and a phrase ban would also forbid a harmless re-adoption. Flagged in the return as the orchestrator's call |

## Removed tests

None this entry; no test deleted. Entries 3 to 6 deleted none; entry 2's removals are in `test-plan.entry-02.md`.

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here. Entry 7 adds no new test: a list of one existing test gains two members, a constant is lifted and two asserts are added to it (+8 −3 lines), so the count stays 272. Every mutation is one edit of `.asd/rules/providers.md` or `.asd/workflows/asd-phase-impl-review.md` (the control is three edits, one per relation), run as `node tests/run.js` by the scratch runner `.asd/tmp/mutate-e7.js` (not committed) and restored in the same process by a byte-equal write (`restoreFailed=false` on every run; `git status --porcelain` afterwards listed only this entry's own files). Each mutated run also fails the expected ledger noise (`release-manifest.json: every upstream_hashes entry matches the actual file`); the failing test is the own FAIL line after it, its message transcribed from the runner. Baselines B1 to B3 measure the unchanged suite and prove no assertion; they are not counted in the bound of `code-style.md` §17.

| Test | Regression proof |
|---|---|
| (a) `sprint-023 AC-9: providers.md "Task-class variants and routing" gives priorTier only to a re-dispatch of the same task_routing key and routes…` (existing test extended: the fresh-id sentence names five ids, a sentence gives a later terminal-suite run an id extending `impl-review <id> suite`, and step 9's `Red, test defect` bullet cites the routing rule; its name now lists the added ids) | baselines on the unchanged suite: B1 the two added ids dropped, B2 the per-run sentence deleted, B3 the bullet's clause dropped: each `node tests/run.js` → exit 1, 271/272, no own FAIL; M1 `test-fix <D-ids>` dropped from the list: `node tests/run.js` → exit 1, 270/272, own FAIL `sprint-023 AC-9: providers.md "Task-class variants and routing" gives priorTier only to a re-dispatch of the s…`, "the rule must name the ids impl-test entry N, review-fix <id>, test-fix <D-ids>, impl-review <id> test-fix, impl-review <id> suite as new each time - no priorTier - and route them from the Material risk lines of the Tasks their delta touches, none declared meaning standard; unnamed, a prose-only delta is clamped to critical by the first entry's tier, a test-fix round or the in-place test fix has no risks source, and the in-place one shares a task_routing record with its iteration's dev review-fix round, which then reads the tester's tier as priorTier"; M2 `impl-review <id> test-fix` and its parenthetical dropped: exit 1, 270/272, the same test and message; M3 the per-run sentence deleted: exit 1, 270/272, the same test, "the rule must give a later terminal-suite run an id of its own - impl-review <id> suite plus a run suffix; without it a re-run after a test-defect fix reuses the first run's task_routing key and a later test-only delta inherits that run's tier as priorTier"; M4 the bullet's clause dropped (the pre-fix bullet): exit 1, 270/272, the same test, ".asd/workflows/asd-phase-impl-review.md step 9 must keep a **Red, test defect** bullet that cites the routing rule for the re-run's own id - the step's dispatch sentence cites it for the first run only, and a re-run left to that one is routed under the first run's id and clamped to its tier"; control C1 the fresh-id sentence reordered and reworded ("Each of … is a new id every time"), the per-run sentence reworded with the id `impl-review <id> suite 2`, the bullet's clause reworded ("whose id comes from `providers.md` …"): exit 1, 271/272, no own FAIL (ledger noise only); runs: 5 (4 red, 1 control) |

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once the last review wave's reviewers are
APPROVE/latched. The `pr` gate always reads whatever is recorded here last — the full-suite
record, by the time `pr` runs. Each per-entry record measures only the tree that entry
analysed, not any tree produced later
(`.asd/rules/sprint-lifecycle.md` "Impacted test set").

- Command: `node tests/run.js` (the safety valve degrades the impacted set to the whole suite: the delta touches `providers.md`, a framework-wide rule doc read by most content tests, `asd-phase-impl-review.md`, `release-manifest.json`, the `upstream_hashes` ledger itself, and agent memory read by the sweeps)
- Scope: impacted, degraded to full by the safety valve
- Result: pass — 272/272 (exit 0; 272 `ok -` lines, 0 `FAIL -`, no failing names), run on the worktree after this entry's test and memory edits. Net 272 → 272: 0 tests added, 0 removed; one list extended, one constant lifted and two asserts added to one existing test
- Lint / build: pass — `node .asd/sync.js --check` exit 0, `ok: true`; `git diff --check` over this entry's paths exit 0 and `git diff --cached --check` exit 0 with only this entry's own files staged; `node .asd/runtime.js memory-check` on the staged memory diff `[]`
- HEAD: 6913eb1 — the commit the delta was measured at (the pre-strategy run and the strategy are at the same commit). The run covers 6913eb1 plus this entry's uncommitted `tests/run.js`, memory and `test-plan` files, which the entry's commit follows, so it is the first run at a tree holding that edit; no test reads a live sprint file

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/rules/sprint-lifecycle.md` "Impl-test phase"). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 2 | `.claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md` | `AssertionError [ERR_ASSERTION]: each phrase is from a line this sprint deleted (git diff 86e7706 HEAD), taken exactly - one surviving restates the tier table, the manifest in the prompt, the re-entry tier clamp, the change-surface cap or a removed shape as current. A later sprint that re-adopts a phrase deletes its entry here. CHANGELOG.md and sprint folders are history and stay out of the sweep` — actual: `.claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md:67 surfaceCheck`; line 60 of the same file also cites the removed cap-override request as an example, which no exact removed string covers | `sprint-023 leftover-term check: no canon, README, AGENTS.md, template, runtime, hook, workflow definition or agent-memory line keeps a sentence or term the sprint removed - the tier matrix heading, the inline scope manifest, the clamped priorTier and its re-entry wording, the line-only wave division and its waves.json shape, the dropped asd intake rows, the unconditional branch fast-forward, the unqualified "impl writes no tests" and the change-surface cap - its constant, subcommand, plan line and override gate` | fixed | 887bbb1 |

## Manual verification (optional)

No row for a user smoke check. One path is verifiable only by a live dispatch and stays open by the audit's own decision (audit "Risks", AC-3 residual): the wrapped CLI on the Codex host reading `external.scope.json` by path with its read-only tools. The Claude-host direction has prior `external.md` files showing it read `files[]` and the diff by path. This entry does not add a smoke-check row because the user gate at `asd-phase-impl-test.md` step 10 cannot run a Codex-host dispatch; the check is the orchestrator's after merge. Flagged in the return.
