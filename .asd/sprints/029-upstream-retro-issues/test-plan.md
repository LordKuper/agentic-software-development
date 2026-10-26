---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 029-upstream-retro-issues

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 78ab90ca72a6f8c02682ca2fcfd0534a1a77a63a | full change surface |
| 2 | adffa79cb39b086699bee06e83ff584c60584e16 | delta since entry 1 |
| 3 | | delta since entry 2 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Retro step 7.3 states the title strip set inline (backtick, `$`, `\`, `"`, `“`, `”`, `„`) and drops the unshipped `docs/architecture/tech-reference/gh-2.90.md` citation (X-1); gh-2.90.md points at step 7.3 | A strip-set member dropped or reworded away leaves a consumer-derived title expanding or closing the quote in the shell (command injection, evidenced by the review finding); a `docs/` path back in the consumer-run step points at a file consumers do not have | content contract | add | The set is a fixed literal list and step 7.3 is its only shipped home; nothing else ties it. The `docs/` assert is the cheap derived form of X-1: it covers the class (retro step 7 cites no `docs/` path), not the one file. scope step 2a also cites gh-2.90.md but runs under `self_hosting: enabled` only, where the file exists, so no repo-wide ban on `tech-reference/` citations is warranted |
| release-manifest hash refresh, gh-2.90.md wording | Mechanical | none | none | Hash refresh is checked by the existing manifest and sync checks; gh-2.90.md is reference prose with no parsed literal |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | | |

## Added tests

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-029 AC-1/AC-2/AC-3/AC-4/AC-5/AC-6/AC-7/AC-8 contract test, new asserts (step 7.3 strip set; no `docs/` path in retro step 7) | Each `node tests/run.js --filter "sprint-029 AC-1/AC-2"` → exit 1, FAIL sprint-029 AC-1/AC-2/AC-3/AC-4/AC-5/AC-6/AC-7/AC-8 (1 test matched), the named assert the one reported: `”` removed from the step 7.3 strip list (AC-1 strip-set assert); `docs/architecture/tech-reference/gh-2.90.md` citation restored in step 7.3 (AC-1 `docs/` assert). Control (parenthetical reworded, set unchanged): same command → exit 0, 1 test matched. Mutations restored before the next command; runs: 3 (2 mutations + 1 control) |

## Suite run

- Command: `node tests/run.js`
- Scope: full (change surface touches framework-wide files: safety valve degrades the impacted set to the full suite)
- Result: pass — 318 passed, 0 failed, 0 skipped, exit 0 (pre-strategy 318/318 exit 0 before the new asserts; they extend an existing test, so the count is unchanged)
- Lint / build: pass — `git diff --cached --check` clean at commit, `node .asd/sync.js --check` ok
- HEAD: pending (filled at the entry exit)

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| none | | | | | | |

## Manual verification (optional)

None: every AC is verifiable by content contract or review; gh-live behaviour (AC-1, AC-3, AC-4, AC-6, AC-7) is orchestrator prose exercised at the next consumer retro and scope.
