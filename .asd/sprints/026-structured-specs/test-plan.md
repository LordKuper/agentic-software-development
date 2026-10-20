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

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| D-3 memory fix 51f9a640 (`.claude/agent-memory/asd-tester-critical/project_testability-envelope.md` "Sweep guards") | leftover removed prose-table terms in agent memory | leftover-term grep over `.claude/agent-memory/**` (removed terms: "Additional-context cell", "files named by the consulting question", `## Operations used`, `asd-advisor.md` Don'ts) | none | zero hits; memory is not a test surface and the sweep test (Task 13 §27) already pins the grant table; a memory-text pin is a hypothetical risk (`code-style.md` §17) |
| review-fix wave-3/iter-03 external 1: `markdownSection` edge table (`tests/run.js` §27 SECTION_CASES) - shorter fence inside longer, other-char fence, backtick info string | `markdownHeadings` fence rules (runtime.js) | table cases | added | a mis-closed or mis-opened fence hides or invents a heading and silently changes a section ref's content |
| review-fix wave-3/iter-03 combined 8 (`tests/run.js` banner order) | the `// Runner` banner sat above §27 | none (structure only) | none | moved the §27 block above the banner; no behaviour change, suite 296/296 |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | entry 7 delta removes no test | n/a |

## Added tests

| Test | Regression proof |
|---|---|
| `sprint-026 AC-14 (D11): markdownSection ...` cases `a shorter fence inside a longer one does not close it`, `a fence of the other character does not close it`, `a backtick info string with a backtick opens no fence...` (external 1) | mutation of runtime.js `markdownHeadings`, restored by `git checkout -- .asd/runtime.js`; runs: 3. Drop the length clause: `node tests/run.js` exit 1, `AssertionError: a shorter fence inside a longer one does not close it`. Drop the char clause: exit 1, `AssertionError: a fence of the other character does not close it`. Opener accepts a backtick info string: exit 1, `Error: heading "D": 0 matches` in the same test. Control (restored): 296/296, exit 0 |
| `sprint-012 AC-5/AC-6: providers.md ...` pin narrowed to `providers.md` "Declared tool policy" only (combined 5) | one mutation: `artifact-layout.md` "Agent memory" re-pointed to `providers.md` "Role-scoped context", restored by `git checkout`; runs: 1. `node tests/run.js` exit 1, `AssertionError: .asd/rules/artifact-layout.md "Agent memory" must point at the declared tool policy`. Control (restored): 296/296, exit 0 |

## Suite run

- Command: `node tests/run.js` (one zero-dependency runner covering every content contract; the changed files are referenced across the whole suite, so the shared-infrastructure safety valve applies and the impacted set is the whole runner)
- Scope: impacted (= whole runner via safety valve)
- Result: pass — 296/296 passed, 0 failed, 0 skipped (entry 7; runner exit 0, no test added)
- Lint / build: pass — `git diff --check` exit 0, `node .asd/sync.js --check` exit 0 (`ok: true`)
- HEAD: c3e29146 (tree analysed by entry 7)

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .claude/agent-memory/asd-reviewer-correctness/project_operations-block-run-command-convention.md | leftover term: names the removed workflow section `## Operations used` (now `## Entry` `ops`) | leftover-term check (artifact-layout.md "Agent memory") | fixed | da0f6e68 |
| D-2 | 1 | .claude/agent-memory/asd-tester-critical/project_testability-envelope.md | leftover term: lines 247, 408 cite the removed agent section `asd-advisor.md` Don'ts (now `## Rules`) | leftover-term check (artifact-layout.md "Agent memory") | fixed | a5e0000e |
| D-3 | 6 | .claude/agent-memory/asd-tester-critical/project_testability-envelope.md | leftover term: line 397 describes each providers.md "Role-scoped context" row's "Additional-context cell" and the advisor row's "files named by the consulting question"; the prose table was replaced by a JSON grant table of `{role, phase, refs}` | leftover-term check (artifact-layout.md "Agent memory") | fixed | 51f9a640 |

## Manual verification (optional)

None: every AC is verifiable by automation (content contracts, sync check).
