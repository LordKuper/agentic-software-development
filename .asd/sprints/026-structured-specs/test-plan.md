---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 026-structured-specs

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | e5da7e1348f880a6128b216681df16b9d7ccefbc | full change surface |
| 2 | 37050b1aa5b4c3171e4b700f3b1499b8770e599f | delta since entry 1 |
| 3 |  | delta since entry 2 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Review-fix 93160397: `sprint-lifecycle.md` "Input sources" `requirements`/`ux` rows gain the decomposition-disabled flat paths (`requirements.html`, `ux-spec.html`), reviewer finding F-1 | Clause dropped or reworded away: an agent resolving the input in a non-decomposed project has no path | static/arch (content contract) | add | Stated requirement (F-1) with no pin: the existing "Input sources" pin checks only the lite `sprint.md` clause; flat path tokens are parsed literals under `code-style.md` §17 |
| Same commit: release-manifest hash refresh, reviewer agent-memory | Mirror drift; memory prose | build check | none | `release-manifest.json upstream_hashes` pin and `node .asd/sync.js --check` cover; memory prose is not testable behaviour |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | entry 3 delta touches no test; no test fails the hypothetical-risk criterion | n/a |

## Added tests

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-026 AC-4/AC-9/AC-10/AC-11/D9 test, one added assert (AC-7 flat paths) | mutation flat (drop the ` (flat \`requirements.html\` with decomposition disabled)` clause from the `requirements` row): `node tests/run.js` → exit 1, `sprint-026 AC-4/AC-9/AC-10/AC-11/D9` (plus the `release-manifest.json upstream_hashes` pin, by design); control (reword the clause to `(the non-decomposed form is \`requirements.html\`)`, token kept): added assert stays green, only the manifest pin fails; runs: 1. Canon restored by `git checkout` in the same command, worktree verified clean |

## Suite run

- Command: `node tests/run.js` (one zero-dependency runner covering every content contract; the changed files are referenced across the whole suite, so the shared-infrastructure safety valve applies and the impacted set is the whole runner)
- Scope: impacted (= whole runner via safety valve)
- Result: pass — 287/287 passed, 0 failed, 0 skipped (entry 3; runner exit 0, after the added assert; pre-strategy run also 287/287)
- Lint / build: pass — `git diff --check` exit 0, `node .asd/sync.js --check` exit 0 (`ok: true`)
- HEAD: 96de9b94 plus this entry's tests/run.js change — tree the entry 3 run was verified at

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .claude/agent-memory/asd-reviewer-correctness/project_operations-block-run-command-convention.md | leftover term: names the removed workflow section `## Operations used` (now `## Entry` `ops`) | leftover-term check (artifact-layout.md "Agent memory") | fixed | da0f6e68 |
| D-2 | 1 | .claude/agent-memory/asd-tester-critical/project_testability-envelope.md | leftover term: lines 247, 408 cite the removed agent section `asd-advisor.md` Don'ts (now `## Rules`) | leftover-term check (artifact-layout.md "Agent memory") | fixed | a5e0000e |

## Manual verification (optional)

None: every AC is verifiable by automation (content contracts, sync check).
