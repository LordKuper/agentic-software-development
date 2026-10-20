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

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Review-fix b2e4608e E1: conditional input keys (`decisions`, `contracts`, `audit`) moved from `required` to `optional` in dev, correctness, efficiency, documentation | A conditional key listed as unconditionally required again: a dispatch without it reads as a missing required input (ABORT/FAILED) | static/arch (content contract) | add | Stated review finding, no pin: the D2 sweep checks only that `required` is a list; `code-style.md` §17 parsed-literal pin |
| Same commit E2: standalone modes `concept`/`stack`/`design-system` in BA/Architect/UX `## Inputs` `modes`; E3 UX plain FAILED; F1 reviewer design-review clause dropped; F2 BA ABORT/FAILED split | E2: mode dropped, the skill dispatch hits sprint-only top-level required inputs. E3/F1/F2: signal wording and prose | static/arch (E2); none (E3, F1, F2) | add (E2); none (E3, F1, F2) | E2 is a stated finding with no pin (same test). E3/F1/F2 are signal-wording prose; the D2/D3 sweep pins the Escalation and Signals shapes and token set; per-clause wording would restate canon |
| Review-fix wave-3 iter-01 F6: C-4 relay branches (workflow Dispatch `ADVICE_NEEDED` rows) and the sprint-018 AC-8 run-vs-deny relation | A Dispatch row lists `ADVICE_NEEDED` with no "Relay" branch (signal dropped), or a relay branch survives with no sender (plan); a run grant reaching a command the agent's own deny list refuses, once the pin hardcoded one command | static/arch (content contract) | add (sweep); adjust (relation) | Stated review finding; AC-6 (C-4) has no machine pin on the workflow side; the narrowed relation hid any new `<command> (reason)` deny item; `code-style.md` §17 parsed-literal pin |
| Regenerated views, manifest hashes, reviewer memory | Mirror drift; memory prose | build check | none | `node .asd/sync.js --check` and the `release-manifest.json` hash pins cover; memory prose is not testable behaviour |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | entry 4 delta touches no test; no test fails the hypothetical-risk criterion | n/a |

## Added tests

| Test | Regression proof |
|---|---|
| tests/run.js: `sprint-026 AC-13 (E1/E2)`: no agent `required` (top-level or mode) names `payload.inputs.decisions|contracts|audit` without "when present"; BA `concept`, Architect `stack`, UX `design-system` modes keep "no sprint required" | mutation E1 (asd-dev: `payload.inputs.decisions` moved back into `required`): `node tests/run.js` → 284/288, the new test fails (plus sync/manifest hash pins, by design); mutation E2 (drop "no sprint required" from asd-ba `concept`): new test fails (same by-design pins); control (asd-dev `required` gains `payload.inputs.contracts when present`): new test stays green, only the 3 hash pins fail; runs: 3. Canon restored by `git checkout`, worktree verified clean |
| tests/run.js: `sprint-026 AC-6 (C-4)` relay sweep; adjusted sprint-018 AC-8 `neverRun` (leading `<command> (` token of every deny item) | mutation (design-review step 12 drops the "Relay" `ADVICE_NEEDED` citation): new test fails, 1 failure; control (impl-test step 12 quote style `'Relay'`, same citation): stays green; mutation (asd-ux run grant gains `designmd-install`): sprint-018 AC-8 relation fails; control (unrelated run grant added): stays green; canon restored by `git checkout`, worktree verified clean |

## Suite run

- Command: `node tests/run.js` (one zero-dependency runner covering every content contract; the changed files are referenced across the whole suite, so the shared-infrastructure safety valve applies and the impacted set is the whole runner)
- Scope: impacted (= whole runner via safety valve)
- Result: pass — 288/288 passed, 0 failed, 0 skipped (entry 4; runner exit 0, after the added test)
- Lint / build: pass — `git diff --check` exit 0, `node .asd/sync.js --check` exit 0 (`ok: true`)
- HEAD: 8a185759 plus this entry's tests/run.js change

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .claude/agent-memory/asd-reviewer-correctness/project_operations-block-run-command-convention.md | leftover term: names the removed workflow section `## Operations used` (now `## Entry` `ops`) | leftover-term check (artifact-layout.md "Agent memory") | fixed | da0f6e68 |
| D-2 | 1 | .claude/agent-memory/asd-tester-critical/project_testability-envelope.md | leftover term: lines 247, 408 cite the removed agent section `asd-advisor.md` Don'ts (now `## Rules`) | leftover-term check (artifact-layout.md "Agent memory") | fixed | a5e0000e |

## Manual verification (optional)

None: every AC is verifiable by automation (content contracts, sync check).
