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
| 3 |  | delta since entry 2 |

## Risk → check decisions

Entry 3, delta since `ace6656`: `git diff ace6656...HEAD --stat` over the entry-1 pathspec, 1 file, +17 −17: `.claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md`, the memory owner's fix of `D-1` (`887bbb1`; two lines naming the removed change-surface cap reworded, legacy ordinals made method-only). No test, runtime or canon changed. The impacted set degrades to the whole `node tests/run.js` by the safety valve. Entry 2's rows rotated into `test-plan.entry-02.md`; no review-fix or in-place tester row was added since, and no removal row carries forward.

Pre-strategy run at `e8371f9`: `node tests/run.js` → exit 0, 272/272 (the sweep `D-1` reddened is green).

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Memory rewrite of `feedback_no-shell-doc-review-method.md` (`D-1` fix) | a removed-mechanism string survives in agent memory; the rewrite damaged a lesson the memory index or another test relies on | static (the existing `sprint-023 leftover-term check`) | none | The sweep reads every `.md` under `.claude/agent-memory/**` (`AGENT_MEMORY_ROOT`, sanity assert that every directory is reached) with the exact removed strings, `surfaceCheck` and `surface-check` among them, and is green; `git grep` of `surfaceCheck`, `cap-override`, `cap override` and `change-surface cap` over `.claude/agent-memory` is empty. The only references to the file are its own `name`, the owner's `MEMORY.md` index line and a `[[no-shell-doc-review-method]]` link, all intact (the bijection test `T-2/T-4/sprint-010 TST-01` green); no test reads its text. The sprint-023 `memory-check` pins method-only text, and the file's remaining `wave-<K>/iter-NN` is a placeholder it passes. No new test qualifies |

## Removed tests

None this entry; no test deleted. Entry 2's removals are in `test-plan.entry-02.md`.

## Added tests

None this entry: no new test (see the decision above); entry 2's proofs are in `test-plan.entry-02.md`.

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once the last review wave's reviewers are
APPROVE/latched. The `pr` gate always reads whatever is recorded here last — the full-suite
record, by the time `pr` runs. Each per-entry record measures only the tree that entry
analysed, not any tree produced later
(`.asd/rules/sprint-lifecycle.md` "Impacted test set").

- Command: `node tests/run.js` (the safety valve degrades the impacted set to the whole suite: the shared sweep reads agent memory and the tree the delta touches is read by every test)
- Scope: impacted, degraded to full by the safety valve
- Result: pass — 272/272 (exit 0; 272 `ok -` lines, 0 `FAIL -`, no failing names); `sprint-023 leftover-term check` green. Entry 2's fail on `D-1` is cleared. Net 272 → 272: 0 tests added, 0 removed
- Lint / build: pass — `node .asd/sync.js --check` exit 0, `ok: true`; `git diff --cached --check` exit 0 (nothing staged before this entry's own files)
- HEAD: e8371f9 — the commit this run verified; this record's own commit follows, and no test reads a live sprint file

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/rules/sprint-lifecycle.md` "Impl-test phase"). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 2 | `.claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md` | `AssertionError [ERR_ASSERTION]: each phrase is from a line this sprint deleted (git diff 86e7706 HEAD), taken exactly - one surviving restates the tier table, the manifest in the prompt, the re-entry tier clamp, the change-surface cap or a removed shape as current. A later sprint that re-adopts a phrase deletes its entry here. CHANGELOG.md and sprint folders are history and stay out of the sweep` — actual: `.claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md:67 surfaceCheck`; line 60 of the same file also cites the removed cap-override request as an example, which no exact removed string covers | `sprint-023 leftover-term check: no canon, README, AGENTS.md, template, runtime, hook, workflow definition or agent-memory line keeps a sentence or term the sprint removed - the tier matrix heading, the inline scope manifest, the clamped priorTier and its re-entry wording, the line-only wave division and its waves.json shape, the dropped asd intake rows, the unconditional branch fast-forward, the unqualified "impl writes no tests" and the change-surface cap - its constant, subcommand, plan line and override gate` | fixed | 887bbb1 |

## Manual verification (optional)

No row for a user smoke check. One path is verifiable only by a live dispatch and stays open by the audit's own decision (audit "Risks", AC-3 residual): the wrapped CLI on the Codex host reading `external.scope.json` by path with its read-only tools. The Claude-host direction has prior `external.md` files showing it read `files[]` and the diff by path. This entry does not add a smoke-check row because the user gate at `asd-phase-impl-test.md` step 10 cannot run a Codex-host dispatch; the check is the orchestrator's after merge. Flagged in the return.
