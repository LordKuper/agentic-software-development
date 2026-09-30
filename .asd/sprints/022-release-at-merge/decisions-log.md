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

## 2026-09-30 — Scope amendment: AC-8 (opus/haiku → sonnet tiers)

- **Decision**: The user decided the Claude-side tiers:
  - ba and ux: sonnet/high;
  - architect and the five reviewers: sonnet/xhigh ("extra");
  - the `critical` variants of dev and tester: sonnet/xhigh;
  - the `mechanical` variants: sonnet/low;
  - the `haiku` and `opus` families stay in `model_families`.

  Carried by Task 8 in the new wave 4; change surface 37/100. This is the first run of AC-7: the amendment comes after the division point (wave 1, counter 1), so the record carries `floor_base=wave-1/1`, and wave 1's latches are cleared (none held). Out of scope: the Codex-host wrapped model (`wraps_model: "opus"`) and every Codex-side tier.
- **Rationale**: Hard scope gate decided by the user. Host behaviour was verified before the AC per 019#P-1: the code.claude.com sub-agents doc lists `effort` values `low|medium|high|xhigh|max`; the model-config doc says Sonnet 5.5 supports all five and falls back downward; the field needs Claude Code ≥ v2.1.242. `sync.js` already accepts `xhigh`.
- **Affected docs**: [sprint.md](sprint.md), [plan.md](plan.md)
- 2026-09-30 — route Task 8: critical, dispatch HEAD 8950b32
- 2026-09-30 — wave 4 (Task 8, 8730e31) landed and synced; flagged choices accepted (matrix row split, README intro, Claude column only); halted before impl-test entry 3 at the user's request

## 2026-09-30 — Scope amendment: AC-9 (mechanical back to haiku; Codex-host wrapped Claude sonnet/xhigh)

- **Decision**: The user asked for two changes. First, revert the mechanical variants to `haiku` with no effort, which supersedes AC-8's mechanical clause. Second, move the Codex-host External Review wrapped Claude from `opus`/`high` to `sonnet`/`xhigh`. Both are carried by Task 9 in the new wave 5. The change surface stays 37, because every file is already counted (`asd-external-review.md` adds one → 38/100). The record carries `floor_base=wave-1/1`, since wave 1 is still at counter 1, and latches were cleared (none held).
- **Rationale**: Hard scope gate, decided by the user. The host was verified per 019#P-1: the code.claude.com CLI reference lists `--effort` as `low|medium|high|xhigh|max` and `--model` as accepting the `sonnet` alias.
- **Affected docs**: [sprint.md](sprint.md), [plan.md](plan.md)
- 2026-09-30 — route Task 9: critical, dispatch HEAD 46e0187
- 2026-09-30 — wave 5 (Task 9, d83ea8e) landed and synced; flagged choice accepted (providers.md External review symmetry alias sol/sonnet); halted before impl-test entry 3 at the user's request
- 2026-09-30 — impl assessment (Task 9, wave 5) approved adaptively: plan fully ticked, build+lint clean, sync clean, flagged choice already accepted; no sprint stubs; route impl-test entry 3
- 2026-09-30 — route impl-test entry 3: critical, dispatch HEAD 1b243b4
- 2026-09-30 — impl-test: impacted set green (263/263), 1/0 tests added/removed (entry 3); no manual-verification rows

## 2026-09-30 — Scope amendment: AC-10 (sol resolves to gpt-6.1-sol)

- **Decision**: The user asked, in chat, to update the `sol` model to `gpt-6.1-sol`. Read as: the concrete ID behind the `sol` family alias changes from `gpt-6-sol` to `gpt-6.1-sol`; the alias, all tiers and `luna` stay. Carried by Task 10 in the new wave 6; the change surface stays 37 (the manifest, `providers.md` and README are already counted). The record carries `floor_base=wave-1/1`, since wave 1 is still at counter 1, and latches were cleared (none held). The ID is user-supplied and unchecked against a host doc.
- **Rationale**: Hard scope gate, decided by the user's request. `sync.js` validator `gpt-<n>[.<n>]-(sol|luna)` accepts the ID.
- **Affected docs**: [sprint.md](sprint.md), [plan.md](plan.md)
- 2026-09-30 — route Task 10: critical, dispatch HEAD 4fe03f1
- 2026-09-30 — wave 6 (Task 10, e22b23d) landed and synced; no flagged choices; impl assessment approved adaptively; route impl-test entry 4
- 2026-09-30 — route impl-test entry 4: critical, dispatch HEAD a26b22d
- 2026-09-30 — impl-test: impacted set green (264/264), 1/1 tests added/removed (entry 4: one new AC-10 pin, one duplicate assertion deleted); no manual-verification rows
- 2026-09-30 — combined interrupted attempt 1 in wave-1/iter-02 (50-turn cap, no report or return file)

- 2026-09-30 — impl-review wave-1/iter-02: combined CONCERNS (4 low: #1 sprint-lifecycle Modes over-claim, #2 tag creation ignores origin, #3 duplicated `spans` helper in tests, #4 git-strategy retry sentence restates its home), external CONCERNS (1 low: #1 prose pin in tests/run.js:7085). No FAIL, no reviewer question. Findings span canon, so the test-only in-place fix does not fire: routed to impl review-fix (review_fixes_pending=wave-1/iter-02). F-2 logged (combined read iter-01 file).
- 2026-09-30 — route combined.md 1-4, external.md 1: critical, dispatch HEAD 716d5ec
- 2026-09-30 — impl fix for wave-1/iter-02: findings resolved (dev 7e124bb: combined.md 1, 2, 4; tester de99a72: external.md 1, combined.md 3 plus pin follow-ups for 2 and 4). Flagged choices accepted (second "each time" pin at asd-sprint Step 1 also dropped; `listed`/`expand` folded into the `spans` helper; ls-remote assert split into create/push asserts; combined.md 1 fixed without the reviewer's extra clause, combined.md 4 dropped rather than pointered). route impl-test entry 5: critical
- 2026-09-30 — route impl-test entry 5: critical, dispatch HEAD 08e03ca
- 2026-09-30 — impl-test: impacted set green (264/264), 0/0 tests added/removed (entry 5: two asserts added to an existing test, one review-fix removal carried); no manual-verification rows
- 2026-09-30 — impl-review wave-1/iter-03: combined APPROVE, external APPROVE (gpt-6.1-sol ran normally); both latched. Reviewer DoD met on wave 1 of 1; terminal full-suite gate next
