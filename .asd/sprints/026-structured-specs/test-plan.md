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

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Entry 2 delta: agent-memory prose for D-1 (`asd-reviewer-correctness` method file + MEMORY.md) and D-2 (`asd-tester-critical` testability envelope) | Memory still names a removed term (`## Operations used`, advisor `Don'ts`); prose-only, no behaviour | leftover-term grep over `.claude/agent-memory/**` | none | Grep of the removed names (`PLAN_DRAFT`, `PLAN_READY`, `Signal vocabulary`, `Dispatch payload header`, `Operations used`, `Retro intake`, `Don'ts`) returns zero hits; memory prose is not a testable behaviour, so no test qualifies under `code-style.md` §17 |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | entry 2 delta is memory prose only; no test touched | n/a |

## Added tests

| Test | Regression proof |
|---|---|
| none | no test qualifies for the entry 2 delta | n/a |

## Suite run

- Command: `node tests/run.js` (one zero-dependency runner covering every content contract; the changed files are referenced across the whole suite, so the shared-infrastructure safety valve applies and the impacted set is the whole runner)
- Scope: impacted (= whole runner via safety valve)
- Result: pass — 287/287 passed, 0 failed, 0 skipped (entry 2; runner exit 0, pre-strategy and gate runs identical: delta is memory prose, no test touched)
- Lint / build: pass — `git diff --check` exit 0, `node .asd/sync.js --check` exit 0 (`ok: true`)
- HEAD: 5c7c8fcb — tree the entry 2 run was verified at (this file and its rotated segment are the only later change)

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .claude/agent-memory/asd-reviewer-correctness/project_operations-block-run-command-convention.md | leftover term: names the removed workflow section `## Operations used` (now `## Entry` `ops`) | leftover-term check (artifact-layout.md "Agent memory") | fixed | da0f6e68 |
| D-2 | 1 | .claude/agent-memory/asd-tester-critical/project_testability-envelope.md | leftover term: lines 247, 408 cite the removed agent section `asd-advisor.md` Don'ts (now `## Rules`) | leftover-term check (artifact-layout.md "Agent memory") | fixed | a5e0000e |

## Manual verification (optional)

None: every AC is verifiable by automation (content contracts, sync check).
