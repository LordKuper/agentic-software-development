---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), state.json (state), reviews/ (verdicts)
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
- YYYY-MM-DD — route <taskIds>: <tier>, dispatch HEAD <sha>
- YYYY-MM-DD — reconstruction: landed <ids>; re-dispatched <ids>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, or `.asd/project/stubs.md`. Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-09-25 — Retro 016–018 findings verified at HEAD and triaged

- **Decision**: Verified every Action/Systemic-proposal row of retros 016–018 against HEAD `ae09bac`; all 15 unresolved (016/018 rotation proposals merged into one → 14 items). User accepted the recommendation: include 018 F-1, F-2, F-3, 018 consumer-grep, 016+018 rotation, 018 fresh-tester, 017 F-2/F-4, 017 F-3, 017 agent-memory leftover check; defer 017 degenerate-input formula, 017 runtime-persisted reviewer text, 016 low-test-findings-in-place; reject 017 F-1 cloud Codex install, 016 public-contract artifact risk.
- **Rationale**: Evidence per row — `git-strategy.md` has no `--only` commit rule; `providers.md` has no repo-root dispatch rule and still calls `maxTurns` "emitted on trust" (L50); `review-policy.md` has no consumer-grep rule and still claims reviewers' memory channel is host-served (L142); `artifact-layout.md` L246 rotates at every phase change; impl-test/impl-review workflows state no fresh-tester rule; no rule scopes the review-fix tester's `test-plan.md` sections; no leftover-term rule covers `.claude/agent-memory/**`; no degenerate-input rule; `asd-phase-impl-review.md` step 7 still has the orchestrator write review text; low test findings still route through a full review-fix cycle; `providers.md` L121 still reserves `public contract`; `custom-common-rules.md` has no cloud-install line. Rejections: preflight already availability-skips External Review (017 F-1), and a reserved risk class must not be weakened (016).
- **Affected docs**: [sprint.md](sprint.md) AC-4, AC-8..AC-16

## 2026-09-25 — Retro intake semantics (scope items 2–3)

- **Decision**: Candidates are the last retro's rows plus the backlog's deferred rows, never included/rejected/`covered by:` rows. Consumer projects see only `Acts on: consumer` rows, self-hosting sees `consumer` + `asd`. A deferred row stays offered until decided. Intake runs after raw scope, before the scope gate. Retros scope: 016–018 only (012–015 not seeded). The mandatory cleanup/quality question is dropped.
- **Rationale**: Taken from the user's answers to the scope clarification questions.
- **Affected docs**: [sprint.md](sprint.md) AC-1..AC-7

## 2026-09-25 — Scope accepted

- **Decision**: User accepted `sprint.md` (AC-1..AC-17) at the hard scope gate; audit runs (`documents.audit: auto`, scope has behaviour and gate impact).
- **Rationale**: Explicit `accept`.
- **Affected docs**: [sprint.md](sprint.md)
