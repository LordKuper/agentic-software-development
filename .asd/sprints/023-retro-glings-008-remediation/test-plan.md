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

## Risk → check decisions

Entry 5, delta since `d498f12`: `git diff d498f12...HEAD --stat` over the entry-1 pathspec, 11 files, +30 −30: the scope amendment AC-11 / D11 (Tasks 9 and 10, wave 5). `.asd/runtime.js` (`LARGE_WAVE_FILES` 20 → 12 and `WAVE_THRESHOLD_BYTES` 300000 → 180000, `cfa07e3`), the `claude.maxTurns` frontmatter line of nine canon agents → 100 (`54d7b41`: `asd-advisor` was 30; `asd-ba`, `asd-ux`, `asd-external-review` and the five `asd-reviewer-*` 50) and the `release-manifest.json` ledger hashes (+19 −19). The generated Claude views follow by sync; the Codex views are unchanged (no `maxTurns`). The impacted set degrades to the whole `node tests/run.js` by the safety valve: `runtime.js` is read by most tests, the agent frontmatter by the render and §9 `--check` tests. Entry 4's rows rotated into `test-plan.entry-04.md`; no review-fix or in-place tester row sat in the live tables and no removal row carries forward. Entry 4's row on the plan amendment ("no pin added on the old thresholds; the wave-5 entry re-checks") is re-checked here.

Pre-strategy run at `a1100fd`: `node tests/run.js` → exit 0, 272/272.

The delta has no test file and re-values three tunables, so the question per row is whether a test sized from an old number went red or stopped proving, and whether anything reads the new value. Both are measured, not read: a search of `tests/run.js` for the old and new numbers, and three baseline runs of the unchanged suite against one reverted value each (B1 to B3, all exit 1 with the expected ledger noise; no own FAIL for B1 and B2, the render mirror alone for B3).

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `runtime.js`: `LARGE_WAVE_FILES` 20 → 12 (AC-11) | a test or fixture sized from 20 goes red or stops proving; the boundary the AC moves (a wave of 13 to 20 files now gets the turn plan) is asserted nowhere | unit (boundary) | none | No code branch reads the constant: `git grep -n LARGE_WAVE_FILES` finds its declaration and export in `runtime.js`, the turn-plan sentence in `providers.md` that cites it, and two lines of `tests/run.js` (the `sprint-012 AC-3/AC-12` symbol-sweep row and the turn-budget test, which finds that sentence by the code span). The turn plan fires when the orchestrator reads the export while building a payload, so a "13 to 20 files" boundary test could only compare the number with itself. A search of `tests/run.js` for `\b(30\|50\|20\|12\|100\|180000)\b` finds nothing near the constants: the hits are `lines('pure', 20)` git fixtures, the `numstat` literal `12\t3`, the `Twelve` word map and `iter-100`. Baseline B2 (the constant back to 20): exit 1, 271/272, no own FAIL, so no test reads the value. `none` on this sprint's precedent for the literal 34 (entry 2, `test-plan.entry-02.md`): a tunable, and pinning the number repeats the literal (`code-style.md` §12). Ceiling: a revert to 20 is caught by no test; the review that follows reads the diff. The one derivable relation between the tunables, `LARGE_WAVE_FILES < WAVE_THRESHOLD_FILES` (12 < 34, true before and after), would be a two-symbol assert; declined as hypothetical, since only a later retune error can break it and nothing in this delta moves toward it |
| `runtime.js`: `WAVE_THRESHOLD_BYTES` 300000 → 180000 (AC-11) | a fixture sized from 300000 stops proving the byte axis; the new value's boundary is untested; the value is read by no test | unit + component | change (one input of an existing assertion) / none for the value | Every reader derives from the symbol: the `reviewWaveCount` table (`bytesLimit`, `+ 1`, `2 *` and `100 *` it), the `review-waves` byte scenario (two files of `ceil(WAVE_THRESHOLD_BYTES / 2)` characters, whose patch passes the limit by git's per-file headers at any value, with its `bytes >` sanity assert and the file scenario's `bytes <`), and the `emit-manifest` large fixture (files only). The line-axis scenarios keep their axes apart at the new value: the real-range test's 3000-line `src/big.js` patch is about 44 KB, a quarter of 180000, so its two waves still come from the lines axis. The table's own boundary rows (`bytesLimit` → 1, `bytesLimit + 1` → 2) are green at the new value. One input was sized from the old number: the string `'300000'` in the `bytes` rejection loop. Equal to the old limit it coerced to a count of exactly one, the silent collapse its assert message names; at 180000 it coerces to two, so it no longer showed that. The rejection never depended on the value (a string fails `Number.isInteger`), so this is a stale fixture, not a red test; changed to `String(bytesLimit)`, the same shape at any limit (Added tests (a)). The value: baseline B1 (back to 300000): exit 1, 271/272, no own FAIL; `none` as above. The sprint's own first impl-review scope (1084 lines, 30 files, 315074 bytes, decisions log) divides into 2 waves at either limit, so no scope-level before/after exists to pin; the AC acts on the size of a single wave, which the orchestrator's grouping decides, not `reviewWaveCount` |
| nine canon agents' `claude.maxTurns` → 100, the Claude views and `release-manifest.json` hashes (AC-11) | a canon cap changed while its Claude view or the ledger is stale; a cap that breaks the Turn budget offsets (`<maxTurns − 5>` report, `<maxTurns − 10>` ledger); the cap value asserted nowhere; a Codex view gaining a cap | static (existing relations) | none | Every relation holds and is derived from canon: the per-agent render test (`sprint-019 AC-10`: the Claude view renders the canon cap, the Codex views none), the turn-budget test (each internal reviewer, `asd-external-review` and `asd-advisor` declare an integer cap above both offsets, read from canon frontmatter), `upstream_hashes`, `canon_hashes` and the §9 `--check`. All green at the pre-strategy run and at the gate; `node .asd/sync.js --check` exit 0, `ok: true`. The caps sat far above the offsets before (30 against 10 at the tightest) and sit further now; no assertion or fixture names 30 or 50 as a cap (search above). Baseline B3, `asd-reviewer-combined.md` back to 50 in canon only: exit 1, 268/272, own FAIL the render test alone ("asd-reviewer-combined: providers.md says Claude enforces maxTurns, so the Claude view must render the canon cap 50"), beside `--check`, `canon_hashes` and `upstream_hashes` noise; the turn-budget test stays green at 50. So the value is read as a mirror and as an offset floor only. A reversion made through canon and a regenerated view together is read by no test (derived from B3, not run: editing a view is outside this role's grant). `asd-ba` and `asd-ux` get no Turn budget header, so no relation reaches their caps. `none` for the value on the entry-2 precedent. A floor over every canon agent's `claude.maxTurns` (AC-11's "no agent below 100", derivable from the frontmatter, three lines in the render test) was weighed and declined: it repeats the tuning literal at a second home, reddens at the next calibration, and the failure it catches, a reverted frontmatter line, is a one-line diff in the review that follows. Flagged in the return as the orchestrator's call |
| the removed strings of `git diff d498f12 HEAD` (leftover-term check) | an old number survives where it is meant to be current: canon, README, templates, views, agent memory, tests | static (existing sweeps) | none | `git grep -nE` for `300000`, `LARGE_WAVE_FILES = 20`, `180000`, `(30\|40\|50) turns`, `turn (30\|40\|50)`, `20 files` and `300 KB` over the worktree minus `.asd/sprints/` and `CHANGELOG.md`: `300000` survives once in `providers.md` (Codex `wait_agent(timeout_ms ≤ 300000)`, a millisecond timeout, unrelated) and, before this entry, as the `bytes` string in `tests/run.js` (changed above). The old turn caps survive only in `.asd/project/retro-backlog.md` (a backlog row proposing to raise the combined reviewer's `maxTurns` above 50, the proposal AC-11 answered: a project record, not canon) and as `asd-architect`'s own 150. `README.md`, the Claude views (their `maxTurns:` lines read 100, 150 and 1000 only), `CHANGELOG.md` (no current statement of either number) and every agent memory hold none. Not appended to the leftover-sweep list: `LARGE_WAVE_FILES` and `WAVE_THRESHOLD_BYTES` first appear inside the sprint (absent from canon at the base `86e7706`), and a frontmatter value is a tunable a later retune may legitimately re-adopt |
| Memory: `asd-tester-critical/project_testability-envelope.md` (own: one lesson folded under "Fills and guards that hide the fixture") | a work-history ordinal or removed phrase in memory; a dangling index link | static (existing sweeps) | none | The `sprint-023 leftover-term check` (reads every `.md` under agent memory) and the agent-memory index bijection are green at the gate; `node .asd/runtime.js memory-check` on this entry's staged memory diff prints `[]`. The lesson names no number from the delta and no ordinal |

## Removed tests

None this entry; no test deleted. Entries 3 and 4 deleted none; entry 2's removals are in `test-plan.entry-02.md`.

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here. Entry 5 adds no new test: one input of one existing assertion is re-derived, so the count stays 272. The one proof run is a single edit to `.asd/runtime.js`, run as `node tests/run.js` by the scratch runner `.asd/tmp/mutate6.js` (not committed) and restored in the same process by a byte-equal write (no `restoreFailed`; `git status --porcelain` afterwards listed only this entry's own files). Each mutated run also fails the expected `upstream_hashes` ledger noise; the failing test is the first own FAIL line after that noise, its message transcribed from the runner. The three baseline runs B1 to B3 measure which tests read a reverted value; they prove no assertion and are not counted in the bound of `code-style.md` §17.

| Test | Regression proof |
|---|---|
| (a) `sprint-017 AC-1 (D1/D2), sprint-023 AC-1: review-waves counts the most of one wave per WAVE_THRESHOLD_LINES, WAVE_THRESHOLD_FILES and WAVE_THRESHOLD_BYTES begun…` (existing test: the `bytes` rejection loop's string input is now `String(bytesLimit)`, was the literal `'300000'`) | S1 the `bytes` guard coerces a numeric string (`Number.isInteger(Number(bytes))`) → exit 1, 270/272, "Missing expected exception: "180000": an unusable byte measurement must fail closed like lines and files, never be read as 0 and collapse the scope into one wave". S1 proves the changed row live; the edit's own value is the fixture's purpose, a string equal to the limit, which a stale literal had stopped being. No reword control: a literal re-derivation asserts no reworded relation; runs: 1 (1 red, 0 control) |

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once the last review wave's reviewers are
APPROVE/latched. The `pr` gate always reads whatever is recorded here last — the full-suite
record, by the time `pr` runs. Each per-entry record measures only the tree that entry
analysed, not any tree produced later
(`.asd/rules/sprint-lifecycle.md` "Impacted test set").

- Command: `node tests/run.js` (the safety valve degrades the impacted set to the whole suite: the delta touches `runtime.js`, read by most tests, and the agent frontmatter the render and §9 `--check` tests read)
- Scope: impacted, degraded to full by the safety valve
- Result: pass — 272/272 (exit 0; 272 `ok -` lines, 0 `FAIL -`, no failing names), run on the worktree after this entry's test and memory edits. Net 272 → 272: 0 tests added, 0 removed; one input of one existing test re-derived
- Lint / build: pass — `node .asd/sync.js --check` exit 0, `ok: true`; `git diff --cached --check` exit 0 with only this entry's own files staged; `node .asd/runtime.js memory-check` on the staged memory diff `[]`
- HEAD: a1100fd — the commit the delta was measured at (the pre-strategy run and the strategy are at the same commit). The run covers a1100fd plus this entry's uncommitted `tests/run.js` and memory change, which the entry's commit follows, so it is the first run at a tree holding that edit; no test reads a live sprint file

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/rules/sprint-lifecycle.md` "Impl-test phase"). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 2 | `.claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md` | `AssertionError [ERR_ASSERTION]: each phrase is from a line this sprint deleted (git diff 86e7706 HEAD), taken exactly - one surviving restates the tier table, the manifest in the prompt, the re-entry tier clamp, the change-surface cap or a removed shape as current. A later sprint that re-adopts a phrase deletes its entry here. CHANGELOG.md and sprint folders are history and stay out of the sweep` — actual: `.claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md:67 surfaceCheck`; line 60 of the same file also cites the removed cap-override request as an example, which no exact removed string covers | `sprint-023 leftover-term check: no canon, README, AGENTS.md, template, runtime, hook, workflow definition or agent-memory line keeps a sentence or term the sprint removed - the tier matrix heading, the inline scope manifest, the clamped priorTier and its re-entry wording, the line-only wave division and its waves.json shape, the dropped asd intake rows, the unconditional branch fast-forward, the unqualified "impl writes no tests" and the change-surface cap - its constant, subcommand, plan line and override gate` | fixed | 887bbb1 |

## Manual verification (optional)

No row for a user smoke check. One path is verifiable only by a live dispatch and stays open by the audit's own decision (audit "Risks", AC-3 residual): the wrapped CLI on the Codex host reading `external.scope.json` by path with its read-only tools. The Claude-host direction has prior `external.md` files showing it read `files[]` and the diff by path. This entry does not add a smoke-check row because the user gate at `asd-phase-impl-test.md` step 10 cannot run a Codex-host dispatch; the check is the orchestrator's after merge. Flagged in the return.
