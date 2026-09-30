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
- YYYY-MM-DD — route <taskIds>: <tier>, dispatch HEAD <sha>
- YYYY-MM-DD — reconstruction: landed <ids>; re-dispatched <ids>
- YYYY-MM-DD — stall: <agent> <dispatch ids>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->
- 2026-09-30 — route Task 1, Task 2, Task 3, Task 4, Task 5: critical, dispatch HEAD a144cd1
- 2026-09-30 — wave 1 landed (T1 117f16e, T2 5638ced+40bd48e, T3 74c2954, T4 274bbd2, T5 107f5f8); flagged choices accepted; D2 retry refined to 'tag or release missing' across T1/T2/T3; orchestrator sync done; route Task 6: standard, dispatch HEAD 4779ab5
- 2026-09-30 — wave 2 landed (T6 9dd3e3c); README working copy renormalised to LF (F-1); route Task 7: settings change user_gates=adaptive via asd-init sprint-mediated
- 2026-09-30 — wave 3 (Task 7) applied through asd-init sprint-mediated: user_gates adaptive → adaptive, comment refreshed; impl assessment approved adaptively; route impl-test entry 1: critical, dispatch HEAD 44d30a7
- 2026-09-30 — impl-test: full suite green (262/262, safety valve), 7 tests added, 4 reworked; no manual-verification rows

## 2026-09-30 — impl-review wave-1/iter-01: external FAIL accepted for fix; combined question answered

- **Decision**: external FAIL #1 (no guard for a PR merged before the version bump) and #2 (retry blocked by an unpushed local tag) are accepted for fix by the user. combined question 1 was answered "ask each time": a release retry that ends `FAILED` prompts on the next `/asd-sprint` to retry, or to continue to the new-sprint flow without the release, recorded in the decisions log. Routed to impl review-fix with combined #1–#5 and external #1–#2; external #2 = combined #4 (deduplicated).
- **Rationale**: FAIL escalation (Complication Approval); reviewer question carrier (`review-policy.md` "Gate Verdict Format").
- **Affected docs**: [reviews/impl/wave-1/iter-01/](reviews/impl/wave-1/iter-01/)
- 2026-09-30 — route combined.md 1-5, external.md 1-2: critical, dispatch HEAD ce77f96
- 2026-09-30 — impl fix for wave-1/iter-01: findings resolved (ca370c3; external 2 = combined 4 deduplicated). Flagged choices accepted: ask whenever the release is missing (the user's answer), the bump check against the parent manifest, the follow-up-PR release commit, no local-tag target check, no gate-inventory row (left to review). route impl-test entry 2: critical, dispatch HEAD 7c39ff3
- 2026-09-30 — impl-test entry 2: impacted set green (262/262), 3 tests extended; no manual-verification rows; halted here at the user's request, before impl-review wave-1/iter-02
