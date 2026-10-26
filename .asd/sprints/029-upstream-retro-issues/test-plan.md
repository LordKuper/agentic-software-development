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
| 1 | | full change surface |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Pre-strategy run: 3 pins red (scope step 4 and gate inventory wording, artifact-layout in-place tester citation, review-policy heading) | Pins of superseded wording read as regressions | content contract | keep, retarget | All three are intended 029 changes (AC-5 adds issues to the per-row choice, AC-10 renames the heading and widens severity to low\|medium). The asd-tester.md line still states the in-place tester's reach and artifact-layout.md "Test plan" still cites the route under its new name, so no code defect. Pins retargeted to the new tokens: "row or issue put to the user lacks a choice", the gate-inventory "per retro row or `asd-retro` issue put to the user", `### Minor test-only findings`, `` `low` or `medium` `` |
| retro step 7 ↔ scope step 2a issue shape (AC-1, AC-2, AC-4, AC-5) | Writer and reader drift on the marker comment or `[asd-retro] ` title prefix: every published issue reads non-standard, or none does | content contract | add | One parsed literal pair across two phases; no other check ties them |
| scope labels ensured vs applied; `(issue #N)` write vs pr/git-strategy read; `Refs #N` without a closing keyword (AC-4, AC-6, AC-7) | `--add-label` fails on a label never created; included issues never closed after release, or closed by the merge before it | content contract | add | Cross-phase literal agreement; the plan's Reachability declaration (scope writes, pr reads) has no other check. Label list is derived from the step text, not enumerated |
| `upstream_issues` key (AC-8) | Key dropped from template, asd-init, retro gate or README | content contract | add | Presence only (in the same test); value enumeration and README mirror already covered by the existing t_config.yaml leaf sweep |
| Rename of review-policy.md "Low-severity test-only findings" and AGENTS.md "No build / lint" statement (AC-9, AC-10) | A surviving mention points at a section that no longer exists (providers.md context ref, agent memory, doc comments) | static sweep | add | Leftover-term check required on the first entry of a sprint removing a term; sweep includes agent memory. Memory hits: none |
| AC-3 (gh missing or create failure skips), AC-11 (flagged-choice check), AC-12 (grep forms) | Prose behaviour of the orchestrator | none | none | Orchestrator prose with no deterministic assert that is not prose pinning; the retro step 7 wording is covered by review, not a pin |
| Doc comment in `.asd/runtime.js`, README/AGENTS.md mirrors | No behaviour added | none | none | README and schema mirrors covered by existing sweeps; leftover sweep above covers the doc comment |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | | |

## Added tests

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-029 AC-1/AC-2/AC-4/AC-5/AC-6/AC-7/AC-8 ... | mutation git-strategy.md `Refs #N` → `Closes #N`: `node tests/run.js --filter "sprint-029 AC-1/AC-2"` → exit 1, sprint-029 AC-1/AC-2/AC-4/AC-5/AC-6/AC-7/AC-8 (1 test matched); control (asd-phase-pr.md sentence reworded, tokens kept): same command → exit 0; runs: 3 |
| tests/run.js: sprint-029 AC-10 leftover-term check | mutation review-policy.md re-adds `"Low-severity test-only findings"`: `node tests/run.js --filter "sprint-029 AC-10"` → exit 1, sprint-029 AC-10 leftover-term check (1 test matched); runs: 1 |

Retargeted (existing tests, no new row): sprint-019 AC-1/AC-3/AC-4/AC-5/AC-6 (scope step 4 and gate inventory pins), sprint-019 AC-11/AC-12/AC-13/AC-15/AC-16 (in-place tester grant citation), sprint-020 AC-8 (heading, severity tokens). Mutations restored before the next command; none left on disk.

## Suite run

- Command: `node tests/run.js`
- Scope: full (change surface touches framework-wide files: safety valve degrades the impacted set to the full suite)
- Result: pass — 318 passed, 0 failed, 0 skipped (pre-strategy 313/316; exit 1 on the 3 retargeted pins)
- Lint / build: pass — `git diff --cached --check` clean at commit, `node .asd/sync.js --check` ok
- HEAD: filled by the orchestrator

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| none | | | | | | |

## Manual verification (optional)

None: every AC is verifiable by content contract or review; gh-live behaviour (AC-1, AC-3, AC-4, AC-6, AC-7) is orchestrator prose exercised at the next consumer retro and scope.
