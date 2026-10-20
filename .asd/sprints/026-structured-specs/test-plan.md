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

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Review-fix 558722d8 F1/F2/F3/F5: dispatch payload keys added to design-promote and design-review rows (`inputs.requirements`, `inputs.ux`, `iteration`, `findings`); bare gate markers and reviewer-question gate; retro wording; impl-review Exit split, MEMORY-FIX moved to impl | F1 class: a Dispatch row omits an input the dispatched agent declares required, so the dispatch reads as a missing required input | none | none | Prototype scan of every workflow Dispatch row against agent top-level `required` `payload.inputs.*` keys: 14 hits, all false positives or unresolvable without per-mode and per-row allowlists (mode-replaced `required`, multi-agent rows where one key serves one agent, rows passing the whole `inputs` object); an allowlist would restate canon, so no `code-style.md` §17 parsed-literal pin qualifies. F2/F3/F5 are marker/prose wording already covered by the AC-12 Dispatch/Signals shape sweep, the phase-chain and Exit-route tests |
| Skills asd-update/asd-init/asd-sync F4, regenerated views, manifest hashes | Mirror drift; wording | build check | none | `node .asd/sync.js --check` and the `release-manifest.json` hash pins cover |
| Review-fix tester 6cc4c42b (C-4 relay sweep, sprint-018 AC-8 run-vs-deny relation) | already analysed by that tester | static/arch | add (done) | Rows rotated to `test-plan.entry-04.md`; mutation/control proof stands, suite green below |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | entry 5 delta removes no test; no test fails the hypothetical-risk criterion | n/a |

## Added tests

| Test | Regression proof |
|---|---|
| none | no new test this entry (see Risk → check decisions); the review-fix tester's 6cc4c42b tests are in `test-plan.entry-04.md` | n/a |

## Suite run

- Command: `node tests/run.js` (one zero-dependency runner covering every content contract; the changed files are referenced across the whole suite, so the shared-infrastructure safety valve applies and the impacted set is the whole runner)
- Scope: impacted (= whole runner via safety valve)
- Result: pass — 289/289 passed, 0 failed, 0 skipped (entry 5; runner exit 0, no test added this entry)
- Lint / build: pass — `git diff --check` exit 0, `node .asd/sync.js --check` exit 0 (`ok: true`)
- HEAD: 6fe43a2c (no tests/run.js change this entry)

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .claude/agent-memory/asd-reviewer-correctness/project_operations-block-run-command-convention.md | leftover term: names the removed workflow section `## Operations used` (now `## Entry` `ops`) | leftover-term check (artifact-layout.md "Agent memory") | fixed | da0f6e68 |
| D-2 | 1 | .claude/agent-memory/asd-tester-critical/project_testability-envelope.md | leftover term: lines 247, 408 cite the removed agent section `asd-advisor.md` Don'ts (now `## Rules`) | leftover-term check (artifact-layout.md "Agent memory") | fixed | a5e0000e |

## Manual verification (optional)

None: every AC is verifiable by automation (content contracts, sync check).
