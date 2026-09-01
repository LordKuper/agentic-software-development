# Checkpoints

## Mandatory pauses (user approval required)

Every pause is a HARD gate: responsible agent MUST request user decision and receive explicit `approve` (or equivalent discrete option) BEFORE writing the gated artefact or advancing phase. Inferring approval from earlier free-text — including the original sprint request — is forbidden. Batching "produce + write + advance" into one turn without the intermediate user-decision request is a protocol violation; agent MUST emit `FAILED` and halt if it notices itself doing so.

| After phase / event | Approves | Gate position |
|---|---|---|
| scope | `sprint.md` | BEFORE writing `sprint.md` / `state.json` — refined scope presented in chat first |
| audit | `audit.md` | BEFORE advancing to `design` |
| design (per artifact, enabled documents only — `sprint-lifecycle.md` "Optional documents") | `prd.html` (if `prd` enabled), then design-system gate (only if `ux_spec` enabled: existence of `DESIGN.md` + `design-system.html` + `accessibility.html`; missing → `/asd-design-system`), then `ux-spec.html` (if enabled; inline per-entry approval for any `design-md-delta.yaml` addition), then `adr.html` (if `adr` enabled), then `c4-full/` (if effective `c4` enabled) |
| design-review (final) | reviewer verdicts before promotion |
| design-promote (decomposition) | proposed per-subsystem split |
| design-promote (new subsystem) | each new subsystem before C4 registry update |
| design-promote (final mutation) | final write to persistent `design/` |
| plan | `plan.md` |
| impl assessment | impl summary before `impl-test` — **initial mode only**; fix modes skip this gate |
| impl-test (removal) | deletion of any test **outside** the sprint change scope — conditional gate, skipped when no such removal proposed |
| impl-review (final) | reviewer verdict before `pr` |
| pr | confirms PR opening |

## Pause message format

Every pause uses the user-decision format from `core.md` (Problem / Options / Recommended / Consequences). Request user decision when options are discrete. Free-form approval (`approve / request changes / reject`) acceptable for artifact reviews.

## Approval recording

Approval advances `phase` in `state.json` and appends a decisions-log entry. No frontmatter status field.

## Precondition chain

```
audit          requires sprint.md
design         requires audit.md OR (documents.audit disabled) sprint.md directly
design-review  requires design drafts COMPLETED signal, OR (design was no-op) design COMPLETED signal alone
design-promote requires design-review DoD met, OR (design-review was no-op) design-review COMPLETED signal alone
plan           requires design-promote done (persistent docs updated), OR (design-promote was no-op) design-promote COMPLETED signal alone
impl           requires plan.md (initial) OR state.json.review_fixes_pending set (review-fix) OR state.json.test_defects_pending set (test-fix)
impl-test      requires impl COMPLETED signal (build + lint green)
impl-review    requires impl-test COMPLETED signal (full suite green)
pr             requires impl-review DoD met
```

A no-op phase (`sprint-lifecycle.md` "Optional documents") satisfies the next phase's precondition via its `COMPLETED` signal alone — no artifact-existence check on a document that was never applicable this sprint.

`impl`⇄`impl-test` cycle: impl-test routes back to `impl` test-fix mode on code defects, uncapped; ends when the full suite is green (→ `impl-review`). `impl-review` routes back to `impl` review-fix mode on unresolved issues; the sprint returns via `impl-test`. Cycle ends when impl-review reaches DoD (→ `pr`) or its iteration cap is hit.

## Skill auto-abort

If a phase skill detects a missing or unapproved predecessor, it MUST emit `ABORT — precondition not met: <missing artifact>` and stop. No silent fallback. PM presents the gap to the user.

## Re-running a phase

User may instruct re-run of a completed phase. Phase skill re-runs, downstream artifacts invalidated, `state.json.phase` resets. Decisions-log records the reset.
