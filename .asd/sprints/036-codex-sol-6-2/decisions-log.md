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
- 2026-11-18 — route Task 1: standard, dispatch HEAD 6e04b0c2
- 2026-11-18 — route Task 2: standard, dispatch HEAD 55c00255
- 2026-11-18 — route Task 3: standard, dispatch HEAD 55c00255
- 2026-11-18 — route Task 4: standard, dispatch HEAD 55c00255
- 2026-11-18 — route Task 5: standard, dispatch HEAD 55c00255
- 2026-11-18 — route Task 6: standard, dispatch HEAD 55c00255
- 2026-11-18 — route Task 7: standard, dispatch HEAD 5d6d71a4

## 2026-11-18 — scope amendment: AI attribution setting (AC-15..AC-17)

- **Decision**: Add `git.ai_attribution` (AC-15) with a deterministic check on every `asd-sprint` run that removes re-enabling entries from the project-level Claude Code settings only, plus a `commit-check` guard, a PR-body rule and a one-line hint for Codex (AC-16). This repo sets it `disabled` (AC-17). Task 8 runs in wave 4 and Task 9 alone in wave 5.
- **Rationale**: The user requested it mid-sprint and chose the options at the amendment gate. Codex has no local key: since openai/codex PR #22412, attribution is the ChatGPT workspace's `commit_attribution_enabled`, and its injected instructions override any disabling prompt. That is why the guard works on the commit message.
- **Affected docs**: [sprint.md](sprint.md), [plan.md](plan.md)
- 2026-11-18 — route Task 8: standard, dispatch HEAD 630d2547

## 2026-11-18 — impl assessment approved (adaptive)

- **Decision**: Accept Task 1's and Task 8's additive `commit-check` report fields (`misplaced`, `ai_attribution`): the existing keys and exit codes are unchanged, so the "shape unchanged" predicate holds for current readers. Accept the net-neutral D13 trims in `git-strategy.md` and `sprint-lifecycle.md`, which reviewers verify. Accept Task 8's `attribution-check` resetting a re-enabling value to its off value (`""`/`false`) rather than deleting the key: the re-enabling entry is gone and the off state holds even without the project key, which meets AC-16.
- **Rationale**: Nine Tasks, every checkbox ticked. Build and lint are clean and the round diff stays inside authorised paths. No earlier disposition of these choices exists in any log segment. The known red tests (sync fixture, sprint-019 AC-8, sprint-035 AC-15) are impl-test's.
- **Affected docs**: [plan.md](plan.md)
- 2026-11-18 — route impl-test entry 1: standard, dispatch HEAD fc3e672a
- 2026-11-18 — impl-test memory check: no memory fix; asd-reviewer-combined `feedback_lexer-ceiling-claims.md` and `feedback_fix-overcorrection-vs-ac.md` cite the removed lexer only as an example of a general review method that stays valid
- 2026-11-18 — impl-test: defects D-1 → impl test-fix (digest 65b1c04be98e50e39d753482a02354ea494c2a27398d6c8e96be59b2d9e208bd)
- 2026-11-18 — route D-1: standard, dispatch HEAD 5e7fbe08; risk change: json-merge render of a user-co-owned settings file
- 2026-11-18 — impl test-fix: defects D-1 resolved (2d190ca6; the dev's out-of-scope manifest hash edit was correctly blocked, and the ledger was recomputed by the orchestrator's sync --apply; `.claude/settings.json` was restored from 6dd7a354^ and re-rendered, 7478e40a; full suite 404/404)
- 2026-11-18 — route impl-test entry 2: standard, dispatch HEAD 527f694b
- 2026-11-18 — impl-test: impacted set green (405/405), 1/0 tests
