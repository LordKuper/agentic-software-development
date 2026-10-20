# Test plan entry 02 — sprint 026-structured-specs

Rotated narrative rows of Entry log entry 2; never edited.

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
