---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 024-opus-tiers-routing

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 64c1898 | full change surface (`git diff main...HEAD`, sprint/project/generated paths excluded) |
| 2 | 888bdf3 | delta since entry 1 |
| 3 | 4f3ce96 | delta since entry 2 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-8 `checkpoints.md` "Gate policy" flagged-choice sentence (D8) | an adaptive gate accepts dropping a plan decision that could not be met in its Task's files, instead of meeting it or escalating | static/arch | add | token pin: the sentence carries `meeting the decision`, the `new or changed scope` class and `never an adaptive acceptance`, and the class matches the "Hard in both modes" head; prose around it stays unpinned |
| AC-9 `code-style.md` §17 fail-first bound for a changed rule (D9) | the bound loses the clause and a proof passes on a token rename the old rule also satisfies | static/arch | add | token pin on `restores the superseded rule text` and `keeping its citation` in the content-contract bullet |
| `release-manifest.json` hash refresh, CHANGELOG | hashes stale | static/arch | none | the existing `upstream_hashes` test covers it |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no review-fix removal row to carry; the delta superseded no pinned wording | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-024 AC-2/AC-3/AC-4/AC-5/AC-6/AC-8/AC-9 (extended, retitled) | mutation per added assert, each `node tests/run.js` → exit 1, this test failing: M1 restore the pre-amendment `checkpoints.md` (`888bdf3`, no flagged-choice sentence), M2 `Hard in both modes: new or changed scope` → `changed scope` (new clause kept, its citation broken), M3 restore the pre-amendment `code-style.md` §17 (`888bdf3`); reword control (`is resolved by` → `is settled by`) stays green; runs: 4 |

Every canon mutation also fails the unrelated `release-manifest.json: every upstream_hashes entry` test (hash of the mutated file); incidental, not evidence. Each mutation was restored (`git checkout -- <file>`) before the next run.

## Suite run

- Command: `node tests/run.js` (`commands.yaml` `test`)
- Scope: full, unscoped (`node tests/run.js` is the whole suite; entry 3 pre-run and gate)
- Pre-run (step 3, before authoring): green — 273 passed, 0 failed (exit 0)
- Result: green — 273 passed, 0 failed, 0 skipped (exit 0)
- Lint: `git diff --cached --check` (`commands.yaml` `lint`) runs on the staged paths in the commit command, exit 0
- Build: `node .asd/sync.js --check` (`commands.yaml` `build`) exit 0, `ok: true`, every target `current`
- HEAD: 4b694966e70fbd0fa8ed641a7aadee644567f803

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
