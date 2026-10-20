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

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Task 9 `runtime.js` `markdownSection`/`contextRefs`/`contextBundle` cores, `section`/`context` CLI (b800e8c5 delta) | wrong section slice (fence, CRLF, prefix, duplicate heading), grant resolution (tier variant, `*`, dedupe), a partial bundle written for an unresolved ref | existing §27 tests | none | Task 13 (4d76b073) pins each: `markdownSection` cases and fails, `contextRefs` variant/`*`/first-occurrence, `contextBundle` ref comment and unresolved-ref failure, CLI no-file-on-failure and variant-equals-base, and a sweep resolving every role-phase pair of the real grant table. Not re-authored |
| `section` CLI (`sectionCommand`) and the malformed-grant-table errors (`!= 1` json blocks, bad row shape) | a flag typo or a shape error surfaces as a different message | none | none | `sectionCommand` is a two-flag wrapper over the tested `markdownSection`; the real table is parsed by the sweep, so a malformed table fails there; an error-message-only mutation is a hypothetical risk (`code-style.md` §17) |
| Skills' context build, `###` headings, Tasks 10-12 workflow/agent/core.md prose, README | prose drift; role/phase names unresolved | existing checks | none | D14 empty `ops`/`User decisions` shape asserts, AC-15 byte caps and AC-16 D13 load test (fail-first recorded in Task 13) cover; no `## User decisions` remains in a skill |
| Regenerated views, manifest hashes | Mirror drift | build check | none | `node .asd/sync.js --check` and the hash pins cover |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | entry 6 delta removes no test; no test fails the hypothetical-risk criterion | n/a |

## Added tests

| Test | Regression proof |
|---|---|
| none | no new test this entry (see Risk → check decisions); Task 13's §27 tests are the delta's coverage | n/a |

## Suite run

- Command: `node tests/run.js` (one zero-dependency runner covering every content contract; the changed files are referenced across the whole suite, so the shared-infrastructure safety valve applies and the impacted set is the whole runner)
- Scope: impacted (= whole runner via safety valve)
- Result: pass — 296/296 passed, 0 failed, 0 skipped (entry 6; runner exit 0, no test added this entry, Task 13 added the §27 tests)
- Lint / build: pass — `git diff --check` exit 0, `node .asd/sync.js --check` exit 0 (`ok: true`)
- HEAD: b800e8c5 (tree analysed by entry 6)

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .claude/agent-memory/asd-reviewer-correctness/project_operations-block-run-command-convention.md | leftover term: names the removed workflow section `## Operations used` (now `## Entry` `ops`) | leftover-term check (artifact-layout.md "Agent memory") | fixed | da0f6e68 |
| D-2 | 1 | .claude/agent-memory/asd-tester-critical/project_testability-envelope.md | leftover term: lines 247, 408 cite the removed agent section `asd-advisor.md` Don'ts (now `## Rules`) | leftover-term check (artifact-layout.md "Agent memory") | fixed | a5e0000e |
| D-3 | 6 | .claude/agent-memory/asd-tester-critical/project_testability-envelope.md | leftover term: line 397 describes each providers.md "Role-scoped context" row's "Additional-context cell" and the advisor row's "files named by the consulting question"; the prose table was replaced by a JSON grant table of `{role, phase, refs}` | leftover-term check (artifact-layout.md "Agent memory") | fixed | 51f9a640 |

## Manual verification (optional)

None: every AC is verifiable by automation (content contracts, sync check).
