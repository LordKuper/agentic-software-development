---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 031-combined-design-review

Entry 1 rows: `test-plan.entry-01.md`.

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | ce7373c5 | full change surface (`git diff main...HEAD`) |
| 2 | caba7c4f | delta since entry 1 (`git diff ce7373c5...HEAD`): impl-review wave-1/iter-01 review-fix |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| README roster Scope cells and gating paragraph (F1, F2) | a Scope cell or the gating paragraph still says Quality judges design-review drafts, or Efficiency's cell implies a design-review dispatch | content sweep (leftover-term check) | add (two phrases) | the two clauses F1 found were on `main` and removed by this sprint, yet the sweep missed them: its list is taken from removed lines and these were never listed; `design-review judges draft correctness (AC completeness, contract/ADR soundness)` and `impl-review adds test-suite cost and perf budgets` are pinned exactly, both absent from live canon today. F2's parenthetical was the sprint's own intermediate wording, never on `main`, so not pinned |
| `asd-reviewer-combined.md` category-in-Description rule (F3) | a combined return with a category column | none | none | `reviewFindings` fails any six-column table before a row is read (`sprint-031 AC-10`), the enforcement the entry-1 efficiency-rule row already relies on; the prose adds a hint, no token to pin |
| `sprint-lifecycle.md` "Scope amendment" contradiction check moved into the approval (F4) | the orchestrator skips the contradiction check | none | none | judgement duty at a hard gate; the "Scope amendment" pins read steps 1-3 and stay green |
| `git-2.55.md` MSYS bullet to a pointer (F5) | two homes for one rule | none | none | SSoT of prose in a tech reference, no consumer in code |
| `artifact-layout.md` SSoT/economy attribution, README SSoT line (F6) | an iron rule attributed to one agent only | none | none | attribution prose with no parsed token; `FAIL` from `asd-reviewer-quality`/`-efficiency` literals stay, additions only |
| `review-policy.md` Efficiency impl-review cell, `runtime.js` `COMBINED_REVIEWER` JSDoc (F7), agent-memory note | none | none | none | a table cell restating the concerns already in the Efficiency rubric, and a comment; no behaviour change in `runtime.js`; leftover-term sweep over the delta (agent memory included) found no hit |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no test is duplicated or trivial in the delta | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-031 leftover-term check (two phrases added, entry 2) | mutation (scratch copy of `git archive HEAD` plus the edited `tests/run.js`; repo tree untouched) appending each removed clause to `README.md`: `design-review judges draft correctness (AC completeness, contract/ADR soundness)` → `node tests/run.js --filter "sprint-031 leftover-term"` exit 1, `sprint-031 leftover-term check: ...`, 1/330 matched; `impl-review adds test-suite cost and perf budgets, regression` → exit 1, same test, 1/330 matched; reword control (both clauses reworded, tokens broken) → exit 0, 1/1; runs: 2 |

## Suite run

- Command: `node tests/run.js` (impl-review step 9 terminal run, wave-1/iter-02 suite)
- Scope: full, unscoped
- Result: pass — exit 0, 330/330 passed, 0 failed, 0 skipped
- Lint / build: pass — `git diff --cached --check` exit 0; `node .asd/sync.js --check` exit 0, `ok: true`
- HEAD: a99cb214bc8309d292579df6d9c9f2bd51b1113a

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
