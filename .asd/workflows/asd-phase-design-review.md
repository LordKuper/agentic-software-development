# ASD Workflow: Design Review

Orchestration body for the `asd-phase-design-review` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- Whichever of prd.html/ux-spec.html/adr.html the sprint's frozen `documents.*` enabled are present in `<sprint>/design/` (per checkpoints precondition chain). When design was the collapsed no-op (all four `documents.*` disabled), this phase is never separately dispatched — `state.json.phase` already advanced past it to `design-promote` — so this precondition is never evaluated in that case
- Optional drafts honored: design-md-delta.yaml, c4-full/
- `state.json.phase` advanced from `design`

## Operations used
- read: `.asd/project/config.yaml`, `state.json`, drafts in `<sprint>/design/`, review files
- write a file: reduced coverage form of each reviewer's returned text to `<sprint>/reviews/design/iter-NN/<reviewer>.md` (step 8); `state.json` and decisions-log inline for the no-op path's mechanical write (step 2); `state.json` inline (mechanical, no gate) at step 4 — no PM dispatch
- request user decision: escalation on FAIL or iteration cap
- delegate to agent in parallel: reviewers; delegate to agent sequentially: creator autofix; delegate to agent: PM for state + decisions-log tied to DoD-met/override gates (step 9, 10) only

## Reviewer read-only contract

Every reviewer dispatched below is read-only: it evaluates its scope and returns its findings + **complete coverage ledger** + verdict as **final text output**. It never writes the review file itself. This workflow (the phase orchestrator) validates the full returned ledger (step 8), then writes the **reduced coverage form** — findings table, coverage summary line, full n/a list, verbatim finding rows; `checked`/`pass` rows dropped — to `<sprint>/reviews/design/iter-NN/<reviewer>.md` per `t_review.md`, first-line verdict token `[REVIEW-design-<reviewer>]: ...` intact (`review-policy.md` "Persistence"). The read-only guarantee is a host-level property of the reviewer agent (no write capability granted on either provider — `.asd/rules/providers.md`), not a textual instruction the reviewer could choose to ignore.

## Workflow

1. Read `<sprint>/state.json` — read frozen `documents.prd`/`ux_spec`/`adr`/`c4`. Compute review scope as the **intersection** of (a) frozen `documents.*` enabled and (b) the file actually existing in `<sprint>/design/` — a draft that physically exists but whose flag is disabled (e.g. audit pre-formulated it before this repo's own logic gated that — `sprint-lifecycle.md` "Audit phase") is NOT in scope and is NOT reviewed or counted toward DoD; existence alone never puts a file in scope
2. **No-op path** — the all-`documents.*`-disabled case is handled entirely by `asd-phase-design.md` step 2's collapsed check and never reaches this phase as a separate dispatch. This step is the defensive fallback for the residual case of an intersected scope somehow empty on direct/explicit re-dispatch of this phase alone: write inline (mechanical, no gate — no user decision requested, `sprint-lifecycle.md` "No-op phase rule"): set `phase=design-review`, append `"design-review"` to `state.json.skipped_phases`, append decisions-log "design-review skipped (no in-scope drafts)"; emit phase COMPLETED with return contract; skip remaining steps
3. Read `.asd/project/config.yaml` (`review.external_review`, `review.iterations_low/medium/high/critical`, `language.chat`, `language.docs`)
4. **Inline (mechanical, no gate)** — write `<sprint>/state.json` → set `phase=design-review`, increment `reviews.design.iteration` (it is `0` at sprint creation, so `1` on first entry; see `sprint-lifecycle.md` "Review iteration counters" for increment + rollback-reset rules). `NN` = resulting value, zero-padded. No PM dispatch.
5. Compute severity floor for current iteration per `review-policy.md` cumulative-budget algorithm (uses `reviews.design.iteration`)
6. Create folder `<sprint>/reviews/design/iter-NN/` if absent
7. **Parallel dispatch** — every reviewer delegated to as a **fresh agent** each iteration (clean-context dispatch per `review-policy.md`); no reviewer reused across iterations:
   - **APPROVE latch filter first** (AC-2, `sprint-lifecycle.md` "APPROVE latch" — sole SSoT for the mechanism, not restated here): read `state.json.reviews.design.latched` (absent object = `{}`, no latches). A reviewer key present there returned `APPROVE` on that recorded earlier iteration and is skipped entirely this iteration — no fresh agent call, no new review file, no ledger gate at step 8 for it. Documentation and Efficiency are dispatched whenever not latch-skipped (no other agent-level skip for them); Correctness has one additional, non-latch skip condition — see its own bullet below:
   - `asd-reviewer-documentation` — SSoT, template adherence, traceability across the drafts present (always, for any non-empty draft set)
   - `asd-reviewer-efficiency` — over-engineering + structure/cohesion checklists + design-principles.md adherence (always, for any non-empty draft set; its impl-only performance sections are outside this phase's allowed-section list — see below)
   - `asd-reviewer-correctness` — dispatched only when `ux-spec.html` or design-system artifacts are in the draft set this iteration (unless also latch-skipped); its **allowed-section list this phase is UI conformance only** (ux-spec compliance with DESIGN.md + accessibility.html). When no such draft is in scope, the allowed-section list resolves empty and this dispatch is **skipped entirely** — no fresh agent call, no review file, not counted toward DoD — recorded exactly as the retired UI reviewer's conditional dispatch was ("not counted in DoD" per `review-policy.md`'s "a section never applicable is not counted as missing"). This is a second, non-latch skip condition, distinct from the AC-2 latch filter above.
   - if `review.external_review=enabled` AND not latch-skipped → `asd-external-review` with phase=`design-review`, scoped to whichever drafts are present
   - payload to each internal reviewer (latch-skipped reviewers receive no dispatch, hence no payload): in-scope draft paths (the flag-and-existence intersection from step 1 — the **scope set** each internal reviewer must cover in its `review-policy.md` coverage ledger), iteration N, review output dir `<sprint>/reviews/design/iter-NN/`, severity floor, `language.chat`, `language.docs`; for `asd-reviewer-correctness` and `asd-reviewer-efficiency` additionally the **explicit allowed-section list for design-review** (`review-policy.md` "DoD per review phase": Correctness = UI section only, conditional on the draft set; Efficiency = over-engineering + structure/cohesion + design-principles sections, never the performance sections) — impl-only rubric sections MUST NOT fire against drafts; a section not on the list is `n/a: outside phase gate` in that reviewer's section-coverage ledger, not evaluated at all. Payload carries no authoring rationale, no prior-iteration verdicts. For `asd-external-review` on iter ≥ 2, also pass previous iteration's finding set (stalemate detection)
   - each reviewer returns its findings + complete coverage ledger (file, rule, and section) + verdict as final text per `t_review.md` (or `external-review/t_review-report.md` for external), first-line verdict token `[REVIEW-design-<reviewer>]: ...`; **this workflow writes the reduced coverage form of that text to `<sprint>/reviews/design/iter-NN/<reviewer>.md`** (step 8) — the reviewer itself performs no write
8. Wait all REVIEW_DONE, then **coverage-ledger gate** (per `review-policy.md`): per internal reviewer's returned text, validate File-coverage ledger lists every draft in scope set, Rule-coverage ledger has no blank/unresolved row, and (for `asd-reviewer-correctness`/`asd-reviewer-efficiency`) the section-coverage ledger has one row per rubric section with no row omitted or blank (an `n/a: outside phase gate` / draft-set row from step 7 counts as resolved). Any reviewer with missing scoped draft, unresolved rule row, or unresolved/missing section row → reject + re-dispatch fresh, same iteration; wait again. Only complete-ledger reviews proceed to write: this workflow persists findings + a coverage summary line + the full `n/a` list + every `finding #N` row verbatim — `checked`/`pass` rows dropped (`review-policy.md` "Persistence"). External Review exempt (no ledger).
9. Parse first-line tokens from all written reviewer files; record per-reviewer verdicts under `state.json` `reviews.design.verdicts["iter-NN"]` keyed `correctness`/`efficiency`/`documentation`/`external`, one entry per reviewer actually dispatched this iteration — a latch-skipped reviewer (step 7) gets no entry here, and Correctness gets no entry either on an iteration where step 7's non-latch skip fired (no ux-spec/design-system draft in scope). For any reviewer whose parsed token this iteration is the bare `APPROVE` token — a completed review — also write `state.json.reviews.design.latched[<key>] = N` (current iteration; AC-2 APPROVE latch — `sprint-lifecycle.md` "APPROVE latch"). External Review's availability-skip verdict is recorded instead as `"APPROVE (skipped: <reason>)"` (never the bare token) when its wrapped-CLI probe fails (`external-review.md` "Detection") — it satisfies the aggregation below exactly like a bare `APPROVE` but is NEVER written to `latched` (`sprint-lifecycle.md` "APPROVE latch" "Availability-skip carve-out" — only a verdict from an actual review latches). Aggregate, where a `latched` entry counts as satisfied exactly as a fresh `APPROVE` would:
   - **All APPROVE or latched** (every always-dispatched reviewer this iteration) → DoD met; delegate to agent `asd-pm` to append decisions-log "design-review iter NN: APPROVE"; emit phase COMPLETED
   - **Any FAIL** → escalation:
     - parse FAIL findings; group by escalation cause (concept change / new abstraction / scope expansion / contract change)
     - request user decision in `language.chat`: present each FAIL using Complication Approval format from `core.md`; collect decisions
     - on override → mark resolved, continue
     - on accept → delegate to agent corresponding creator (BA / UX / Architect) to apply approved changes; on creator COMPLETED → loop step 4 (increment iteration)
   - **Only CONCERNS** (no FAIL) → autofix loop:
     - delegate to agent responsible creator(s) with finding list; each autofixes per `review-policy.md` (no escalation needed)
     - on all creator COMPLETED → loop step 4
10. Iteration cap reached (no severity tier has remaining budget for next iter):
   - request user decision: override cap and continue / accept current findings / abort sprint
   - on override → loop step 4 (`reviews.design.iteration` keeps incrementing — not reset; severity floor pinned at `critical`)
   - on accept → COMPLETED note "iteration cap reached, user accepted"
   - on abort → emit ABORT
11. Any reviewer QUESTION / FAILED / ABORT → relay, halt
12. On `ADVICE_NEEDED` from any dispatched agent → relay per `sprint-lifecycle.md`'s `ADVICE_NEEDED` protocol; execution resumes, no halt.

## Iteration severity floor (reference)
See `.asd/rules/review-policy.md` cumulative-budget algorithm. This workflow computes floor + passes to reviewer payload so reviewers drop findings below floor.

## Artefacts produced
- `<sprint>/reviews/design/iter-NN/documentation.md` (written by this workflow when dispatched, reduced coverage form of the reviewer's returned text; not written this iteration when latch-skipped — step 7)
- `<sprint>/reviews/design/iter-NN/efficiency.md` (written by this workflow when dispatched; not written this iteration when latch-skipped — step 7)
- `<sprint>/reviews/design/iter-NN/correctness.md` (written by this workflow only when dispatched — step 7's non-latch skip means no file at all when no ux-spec/design-system draft is in scope this iteration; also not written when latch-skipped)
- `<sprint>/reviews/design/iter-NN/external.md` (when `external_review=enabled` and not latch-skipped; written by this workflow)
- Updated `<sprint>/design/` artifacts after autofix or escalation-approved fixes
- Updated `state.json` (phase, `reviews.design.iteration`, `reviews.design.verdicts`, `reviews.design.latched`)
- decisions-log entry on DoD met or override

## Agents delegated to
- 3 internal reviewers (Documentation, Efficiency, Correctness) — parallel. Documentation and Efficiency dispatched for any non-empty draft set unless APPROVE-latched (step 7, AC-2). Correctness has a second, non-latch skip: dispatched only when a ux-spec/design-system draft is in scope this iteration (its only design-review section, UI conformance, would otherwise resolve to an empty allowed-section list) — skipped entirely and not counted in DoD when no such draft exists; when in scope, dispatched unless APPROVE-latched like the other two
- External Review — parallel (when enabled and not latch-skipped)
- Creators (BA, UX, Architect) — sequential, only when autofix or escalation requires
- PM — state updates + decisions-log tied to DoD-met/override gates (step 9, 10); no-op path (step 2) is an inline workflow write, no PM dispatch

## Skills/workflows dispatched
None.

## Return contract (single line)
```
PHASE: design-review | SPRINT: <NNN-slug> | ITER: <N> | STATUS: <complete|blocked|aborted> | NEXT: design-promote
```

## References
- `.asd/rules/sprint-lifecycle.md` (design-review phase contract)
- `.asd/rules/review-policy.md` (severity floor, autofix, escalation, gate verdict format, DoD per phase, reviewer authorship)
- `.asd/rules/design-principles.md`
- `.asd/rules/checkpoints.md`
- `.asd/rules/language-policy.md`
- Templates: `t_review.md`, `external-review/t_review-report.md`
