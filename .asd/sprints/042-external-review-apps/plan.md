# Plan

## Overview
Enforce the app override on the named-profile Codex route and describe its boundary. The scoped researcher identified the route and CLI override in `research.md`; Claude Code routes remain untouched at the user's request.

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format").

### Task 1: Enforce the named-profile override
Material risk: change: CLI argument precedence and preserving the existing route contract.
- [x] Add `-c features.apps=false` to the named-profile route arguments and update external-review documentation and README (AC-1, AC-2, AC-3).

### Task 2: Adapt route contract tests
Material risk: none
Test-only: tests/runtime-routing.test.js
- [x] Adapt the named-profile route expectation and verify that other routes are unaffected (AC-1, AC-2, AC-3).

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | Task 1 |
| 2 | Task 2 |

The public argument contract changes in Task 1; Task 2 repairs its exact test caller. The build `node .asd/sync.js --check` is independent of the argument assertion and must pass after Task 1.

## Decision coverage

| Decision | Covered by |
|---|---|
| Require app disabling for named-profile Codex external review; leave Claude Code routes unchanged. | AC-1, AC-2, Task 1 |
