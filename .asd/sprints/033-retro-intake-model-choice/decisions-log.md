---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), .asd/project/retro-backlog.md (retro row dispositions), state.json (state), reviews/ (verdicts)
---

# Decisions Log

Per-sprint, append-only. Never edited or removed. Created at `scope`, rotated at phase entry (`.asd/rules/artifact-layout.md` "Decisions log"), archived with the sprint.

## Entry format

```markdown
## YYYY-MM-DD — <one-line summary>

- **Decision**: <what was decided> (≤3 sentences)
- **Rationale**: <why> (≤3 sentences)
- **Affected docs**: <links> (unrestricted)
```

A no-op skip, other zero-content decision, dispatch routing line or failed-dispatch reconstruction uses the one-line form instead:

```markdown
- YYYY-MM-DD — <phase> skipped: <reason>
- YYYY-MM-DD — route <taskIds>: <tier>, dispatch HEAD <sha>[; risk <declaration>]
- YYYY-MM-DD — reconstruction: landed <ids>; re-dispatched <ids>
- YYYY-MM-DD — stall: <agent> <dispatch ids>
- YYYY-MM-DD — cleanup checkpoint <sha>
- YYYY-MM-DD — cleanup: removed <paths/symbols>; reverted <ids or none>; verified <build, lint, tests @sha>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

- 2026-11-12 — route Task 1: standard, dispatch HEAD ebeac333
- 2026-11-12 — route Task 2: standard, dispatch HEAD ebeac333
- 2026-11-12 — route Task 3: standard, dispatch HEAD ebeac333
- 2026-11-12 — route Task 5: standard, dispatch HEAD ebeac333
- 2026-11-12 — route Task 6a: standard, dispatch HEAD ebeac333
- 2026-11-12 — route Task 6b: standard, dispatch HEAD ebeac333

## 2026-11-12 — wave 1 flagged departures accepted

- **Decision**: Accept Task 5's one-command form with `git diff --cached --check -- <paths>` before `commit-check` and `git commit --only … -- <paths>`; accept Task 6a's `asd:vars` markers wrapping the whole `:root { … }` block (Task 9 emits the full block); leave 8e4018f0's 54-char header unrewritten. `t_review-report.md` below-floor wording joins Task 7's write scope.
- **Rationale**: The lint step and `--only` keep code-style.md §19 and the shared worktree safe; an HTML comment inside a CSS rule drops a declaration; rewriting a shared wave's history costs more than one over-long header.
- **Affected docs**: .asd/rules/git-strategy.md, .asd/templates/t_design-system.html, plan.md Task 7, Task 9
- 2026-11-12 — route Task 4: standard, dispatch HEAD ad03cb51
- 2026-11-12 — route Task 7: standard, dispatch HEAD ad03cb51
- 2026-11-12 — route Task 10: standard, dispatch HEAD ad03cb51

## 2026-11-12 — plan gap: rename-map declaration added to Task 8

- **Decision**: Task 8 gains a subtask documenting AC-24's plan-declared rename map (plan line, sprint tree entry, impl-review passing `--rename-map` to `review-waves` and `emit-manifest`); Task 7's map format (JSON object, longest key first) and its `review-waves --rename-map` extension are accepted.
- **Rationale**: Task 7 shipped the flag but no Task owned the declaration AC-24 names; wave 3 holds only Task 8, so the doc edits collide with nothing.
- **Affected docs**: plan.md Task 8, .asd/rules/sprint-lifecycle.md, .asd/rules/artifact-layout.md, .asd/workflows/asd-phase-impl-review.md
- 2026-11-12 — route Task 8: standard, dispatch HEAD 3d8f1ff4
- 2026-11-12 — route Task 9: standard, dispatch HEAD 64379c28
- 2026-11-12 — route Task 11: standard, dispatch HEAD 64379c28

## 2026-11-12 — impl assessment approved (adaptive)

- **Decision**: Impl complete: Tasks 1-11 ticked over four waves, AC-1..AC-36 (AC-22, AC-29 retired) mapped to commits, AC-7 dispositions written to audit.md "Gaps"; build (`sync.js --check`) and lint clean; no stubs, no manual steps.
- **Rationale**: Flagged choices without a departure stay inside the Overview's names; the two departures (Task 5 commit form, Task 6a vars markers) and the Task 8 rename-map addition are logged above. Known impl-test inputs: tests/run.js pins on pre-sprint text, the `asd-scout` Codex `web_search` render check, and the orchestrator/impl context load (0.72 vs 0.70 ceiling).
- **Affected docs**: plan.md, audit.md
- 2026-11-12 — route impl-test entry 1: standard, dispatch HEAD b1f5b5e8
- 2026-11-12 — memory-fix: asd-reviewer-combined feedback_roster-move-mirror-sweep.md and MEMORY.md drop the removed "Violation = FAIL from" wording (leftover-term hit, impl-test entry 1)
- 2026-11-12 — impl-test: defects D-1, D-2, D-3, D-4 → impl test-fix (digest 1b0eb42a)
- 2026-11-12 — route test-fix D-1, D-2, D-3, D-4: standard, dispatch HEAD 991fac4a; risk D-1, D-2 change: public contract, D-3 change: workflow gate, D-4 artifact: mirror tables via node tests/run.js
- 2026-11-12 — impl test-fix: defects D-1, D-2, D-3, D-4 resolved (b5edbb1f, 6c66383c); orchestrator/impl load 0.6993 of baseline, 148 B under the 0.70 ceiling
- 2026-11-12 — route impl-test entry 2: standard, dispatch HEAD f41b2995
- 2026-11-12 — impl-test: impacted set green (361/361), 0/0 tests
- 2026-11-12 — memory-fix: asd-tester feedback_edit-tool-for-regex-and-mutation-script.md keeps the mutation helper in .asd/tmp (external finding 8, wave-1/iter-01, 37142f68)

## 2026-11-12 — impl-review wave-1/iter-01 routes to review-fix

- **Decision**: combined F1-F10 and external 1-7 (all CONCERNS, no FAIL, no minor test-only finding) route to impl review-fix; external 8 resolved by memory-fix.
- **Rationale**: Every finding is a canon fix inside the self-hosting dev allowlist needing no requirements or architecture decision; combined F5 and external 1 share `t_design-system.html`'s vars region, combined F2 and F8 share two workflow lines.
- **Affected docs**: reviews/impl/wave-1/iter-01/combined.md, external.md
- 2026-11-12 — route review-fix wave-1/iter-01 RF1-RF9: escalated, dispatch HEAD 9bba025f; risk RF1 change: settings writer mirrors, RF2 RF3 RF4 RF8 change: workflow gate, RF5 RF9 change: public contract, RF6 change: security, RF7 change: migration

## 2026-11-12 — impl fix for wave-1/iter-01: findings resolved

- **Decision**: combined F1-F10 and external 1-7 resolved in bcd4f6ac..c6d460a8 by `asd-dev-escalated`; flagged extras accepted: `Skill` also on asd-phase-impl, a runner red at impl-test step 8 goes to a fresh base tester, `applyFloor` rewrites a `FAIL: n` count too.
- **Rationale**: Each extra closes the same gap the finding named at a sibling site; orchestrator/impl load stays 56 B under the AC-16 ceiling. Two design-tokens tests pin the old `asd:vars` HTML markers — for impl-test.
- **Affected docs**: reviews/impl/wave-1/iter-01/
- 2026-11-12 — route impl-test entry 3: standard, dispatch HEAD 9ae24872
- 2026-11-12 — impl-test: impacted set green (362/362), 3/0 tests
- 2026-11-12 — route F3 (wave-1/iter-02): standard, dispatch HEAD ca1ea41f
- 2026-11-12 — impl-review wave-1/iter-02 external 1 (asd-tester memory, pre-fix tree location) resolved by owner memory-fix 50c9f5de
- 2026-11-12 — impl-review wave-1/iter-02: combined F3 resolved by minor test-only fix f830dbab; F1, F2 (runtime.js) route to impl review-fix
- 2026-11-12 — route F1, F2 (wave-1/iter-02): standard, dispatch HEAD d93a7e2a
- 2026-11-12 — impl fix for wave-1/iter-02: findings resolved (F1 a5dbb6a9, F2 a2c3a591); flagged: AC-25 stalemate fixture uses off-grammar `Stalemate: D-1`, now fails — routed to impl-test with the new CONCERNS+`Stalemate: no` case
- 2026-11-12 — route impl-test entry 4: standard, dispatch HEAD 5349e5dc
- 2026-11-12 — impl-test: impacted set green (362/362), 2/0 tests
- 2026-11-12 — impl-review wave-1/iter-03: combined APPROVE, external APPROVE (floor high); reviewer DoD met on wave 1 of 1
- 2026-11-12 — impl-review terminal full suite: reused green run at 373fa77e (`node tests/run.js` unfiltered, 362/362 — the whole suite; no code, test or stub path changed since); impl-review green, DoD met → design-promote
- 2026-11-12 — design-promote (lite): no-op, every promotable document disabled (prd, ux_spec, design_system, adr, c4 false); skipped
- 2026-11-12 — cleanup checkpoint c405758edac07a35233788dc472bb857820a2ae2
- 2026-11-12 — cleanup: removed none; reverted none; verified n/a: no removals
