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
| 3 | 342683c98124eb15340978010362130c735b1539 | delta since entry 2 |
| 4 | 842537733e50459b01537a5fa0e05889d0823f16 | delta since entry 3 |
| 5 | 3e609b704f300ea1f3df8040a2bcdeaa8f11273d | delta since entry 4 |
| 6 | fc5d22097ec13c354662829d77821e6c28ec8066 | delta since entry 5 |
| 7 | e62af1475be8363f44ffab4079e0258a7a9abc71 | delta since entry 6 |
| 8 | 7c60eb2b84f4d39944b9cbb4c0aba4f92d488490 | delta since entry 7 |
| 9 | ee731ab434c738b7d5f7c3ec4b8246dbc3247a62 | delta since entry 8 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `runtime.js` `contextRefs` in-body comment moved into its JSDoc (57569248) | behaviour change from the comment move | existing §27 `contextRefs` cases and the real-table sweep | none | comment-only edit, no behaviour change; a test would be a hypothetical risk (`code-style.md` §17) |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | entry 9 delta removes no test | n/a |

## Added tests

| Test | Regression proof |
|---|---|
| none | no new test this entry (see Risk → check decisions) |

## Suite run

- Command: `node tests/run.js` (one zero-dependency runner covering every content contract; the changed files are referenced across the whole suite, so the shared-infrastructure safety valve applies and the impacted set is the whole runner)
- Scope: impacted (= whole runner via safety valve)
- Result: pass — 296/296 passed, 0 failed, 0 skipped (entry 9; runner exit 0, no test added)
- Lint / build: pass — `git diff --check` exit 0, `node .asd/sync.js --check` exit 0 (`ok: true`)
- HEAD: ee731ab4 (tree analysed by entry 9)
- Terminal full-suite run (impl-review wave-3/iter-05): `node tests/run.js` exit 0, 296/296 passed, 0 failed; `git diff --check` exit 0; `node .asd/sync.js --check` exit 0 (`ok: true`). Scope full, HEAD 10cd6409.

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .claude/agent-memory/asd-reviewer-correctness/project_operations-block-run-command-convention.md | leftover term: names the removed workflow section `## Operations used` (now `## Entry` `ops`) | leftover-term check (artifact-layout.md "Agent memory") | fixed | da0f6e68 |
| D-2 | 1 | .claude/agent-memory/asd-tester-critical/project_testability-envelope.md | leftover term: lines 247, 408 cite the removed agent section `asd-advisor.md` Don'ts (now `## Rules`) | leftover-term check (artifact-layout.md "Agent memory") | fixed | a5e0000e |
| D-3 | 6 | .claude/agent-memory/asd-tester-critical/project_testability-envelope.md | leftover term: line 397 describes each providers.md "Role-scoped context" row's "Additional-context cell" and the advisor row's "files named by the consulting question"; the prose table was replaced by a JSON grant table of `{role, phase, refs}` | leftover-term check (artifact-layout.md "Agent memory") | fixed | 51f9a640 |

## Manual verification (optional)

None: every AC is verifiable by automation (content contracts, sync check).
