# Test plan segment — sprint 029-upstream-retro-issues, entry 1

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
| tests/run.js: sprint-029 AC-1/AC-2/AC-3/AC-4/AC-5/AC-6/AC-7/AC-8 contract test (extended after review: step 7.2 consumer check, AC-3 skip-and-complete, backlog-duplicate `-r duplicate`, closed list, `-R` on every `gh issue` call) | One mutation per assert, each `node tests/run.js --filter "sprint-029 AC-1/AC-2"` → exit 1, FAIL sprint-029 AC-1/AC-2/AC-3/AC-4/AC-5/AC-6/AC-7/AC-8 (1 test matched), the named assert message the one reported: marker `v1`→`v2` (retro.md); step 7.2 check text → "Glance at the body"; `A failing create skips that row` → `blocks the retro`; scope `exact [asd-retro] title prefixes` → `title prefixes`; retro `upstream_issues is not disabled` → `is disabled`; scope `self_hosting: enabled only` → `any only`; `Ensure labels` → `Make labels`; `--add-label wontfix` → `unwanted`; ensure list drops `duplicate`; `ends (issue #N)` → `(#N)`; git-strategy `each (issue #N) in the merged` → `each issue number`; asd-phase-pr.md `Refs #` → `See #`; git-strategy `Refs #N` → `Refs #N Closes #N`; t_config `upstream_issues: enabled` → `on`; asd-init SKILL `upstream_issues` → `upstream_flag`; scope `-r duplicate -c <link to the row at HEAD>` → `--duplicate-of <original>` (superseded F-2 text); scope closed-list clause removed (F-3); git-strategy post-release `gh issue close <n> -R <repo>` → no `-R` (F-5). Control (retro `Takes no gate` → `Needs no gate`, tokens kept): same command → exit 0, 1 test matched; runs: 19 (18 mutations + 1 control) |
| tests/run.js: sprint-029 AC-10 leftover-term check | mutation review-policy.md re-adds `"Low-severity test-only findings"`: `node tests/run.js --filter "sprint-029 AC-10"` → exit 1, sprint-029 AC-10 leftover-term check (1 test matched); runs: 1 |

Retargeted (existing tests, no new row): sprint-019 AC-1/AC-3/AC-4/AC-5/AC-6 (scope step 4 and gate inventory pins), sprint-019 AC-11/AC-12/AC-13/AC-15/AC-16 (in-place tester grant citation), sprint-020 AC-8 (heading, severity tokens). Mutations restored before the next command; none left on disk.
