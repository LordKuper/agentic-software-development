# Checkpoints

## Mandatory pauses (user approval required)

Every pause is a HARD gate: responsible agent MUST receive explicit user approval before advancing phase. Inferring approval from earlier free-text — including the original sprint request — is forbidden. Two gate classes exist, distinguished by *when* the write happens relative to approval:

- **approve-before-write** — write the gated artefact/mutation only AFTER explicit approval. Batching "produce + write + advance" into one turn without the intermediate user-decision request is a protocol violation; agent MUST emit `FAILED` and halt if it notices itself doing so.
- **write-then-review-accept** — write the artefact FIRST, then get approval on the written file. Not a protocol violation for this class; it's the mechanic.

### Write-then-review-accept mechanic (canonical definition)

1. Creator writes the artifact to its real path.
2. Creator posts the absolute path + a short delta summary in chat — **never the artifact body** (no content dumps; chat carries link + brief summary + open questions only).
3. User reviews the actual file on disk.
4. User replies `accept` → phase/gate advances. User replies with feedback instead → creator revises the **same file in place** (no `-v2`, no duplicate drafts) and returns to step 2.
5. Repeat until explicit `accept`.

Approval stays explicit and recorded (see "Approval recording") — silence or an unrelated later message is never `accept`.

### Approve-before-write gates

| After phase / event | Approves | Gate position |
|---|---|---|
| audit | `audit.md` | BEFORE advancing to `design` |
| design-review (final) | reviewer verdicts before promotion |
| design-promote (decomposition) | proposed per-subsystem split |
| design-promote (new subsystem) | each new subsystem before C4 registry update |
| impl assessment | impl summary before `impl-test` — **initial mode only**; fix modes skip this gate |
| impl-test (removal) | deletion of any test **outside** the sprint change scope — conditional gate, skipped when no such removal proposed |
| impl-review (final) | reviewer verdict before `pr` |
| pr | confirms PR opening |

`design-promote (decomposition)` and `design-promote (new subsystem)` stay approve-before-write, unchanged: both are structural decisions about persistent-doc/C4-registry layout that were never shown to the user at draft-acceptance time, so the write-then-review-accept acceptance on the source drafts doesn't cover them — a separate approval is not an oversight here.

### Write-then-review-accept gates

| After phase / event | Approves | Gate position |
|---|---|---|
| scope | `sprint.md` | write-then-review-accept (see mechanic above) |
| design | `prd.html` (if `prd` enabled) | write-then-review-accept |
| design | design-system gate: `DESIGN.md` + `design-system.html` + `accessibility.html` (if `ux_spec` enabled; missing → dispatch `/asd-design-system`) | write-then-review-accept |
| design | `ux-spec.html` (if enabled; inline per-entry approval for any `design-md-delta.yaml` addition remains its own approve-before-write micro-gate, unaffected by this change) | write-then-review-accept |
| design | `adr.html` (if `adr` enabled — **one approval for the sprint's whole ADR set**, not per-decision; ADR count never multiplies this gate) | write-then-review-accept |
| plan | `plan.md` | write-then-review-accept |

`c4-full/` carries no approval gate of any kind (neither class) — dropped entirely. `design-promote (final mutation)` is dropped as a separate gate — its content was already accepted per-artifact under write-then-review-accept during `design`; re-confirming the same content at final persistent-write time is redundant.

## Pause message format

**Approve-before-write** gates use the user-decision format from `core.md` (Problem / Options / Recommended / Consequences). Request user decision when options are discrete; free-form approval (`approve / request changes / reject`) acceptable otherwise.

**Write-then-review-accept** gates use the link-and-summary message from the mechanic above: absolute path + short delta summary + open questions, never the artifact body. User responds `accept` to advance, or gives feedback to trigger a revise-in-place loop.

## Approval recording

Approval advances `phase` in `state.json` and appends an entry to `<sprint>/decisions-log.md` naming the approved/accepted artifact's path. No frontmatter status field. For write-then-review-accept gates: revision rounds are not decisions — only the final explicit `accept` per artifact appends a decisions-log entry (**one entry per artifact**, not one per round).

## Precondition chain

```
audit          requires sprint.md
design         requires audit.md OR (documents.audit disabled) sprint.md directly
design-review  requires design drafts COMPLETED signal (never dispatched when design was the collapsed no-op — see below)
design-promote requires design-review DoD met (never dispatched when design was the collapsed no-op — see below)
plan           requires design-promote done (persistent docs updated), OR (all four documents.* disabled) design's collapsed no-op write (phase=design-promote, skipped_phases=[design, design-review, design-promote]) alone
impl           requires plan.md (initial) OR state.json.review_fixes_pending set (review-fix) OR state.json.test_defects_pending set (test-fix)
impl-test      requires impl COMPLETED signal (build + lint green)
impl-review    requires impl-test COMPLETED signal (full suite green)
pr             requires impl-review DoD met
```

A no-op phase (`sprint-lifecycle.md` "Optional documents") satisfies the next phase's precondition via its `COMPLETED` signal alone — no artifact-existence check on a document that was never applicable this sprint. When all four `documents.*` flags are disabled, `design`'s **collapsed** no-op check satisfies `design-review`'s, `design-promote`'s, AND `plan`'s precondition in that same single write — `design-review` and `design-promote` are never separately dispatched, so their own precondition lines above never fire in this case.

`impl`⇄`impl-test` cycle: impl-test routes back to `impl` test-fix mode on code defects, uncapped; ends when the full suite is green (→ `impl-review`). `impl-review` routes back to `impl` review-fix mode on unresolved issues; the sprint returns via `impl-test`. Cycle ends when impl-review reaches DoD (→ `pr`) or its iteration cap is hit.

## Skill auto-abort

If a phase skill detects a missing or unapproved predecessor, it MUST emit `ABORT — precondition not met: <missing artifact>` and stop. No silent fallback. PM presents the gap to the user.

## Re-running a phase

User may instruct re-run of a completed phase. Phase skill re-runs, downstream artifacts invalidated, `state.json.phase` resets. Decisions-log records the reset.
