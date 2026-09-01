# ASD Workflow: Design Review

Orchestration body for the `asd-phase-design-review` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- Whichever of prd.html/ux-spec.html/adr.html the sprint's frozen `documents.*` enabled are present in `<sprint>/design/` (per checkpoints precondition chain); OR (design phase was no-op) design phase COMPLETED signal alone
- Optional drafts honored: design-md-delta.yaml, c4-full/
- `state.json.phase` advanced from `design`

## Operations used
- read: `.asd/project/config.yaml`, `state.json`, drafts in `<sprint>/design/`, review files
- request user decision: escalation on FAIL or iteration cap
- delegate to agent in parallel: reviewers; delegate to agent sequentially: creator autofix; delegate to agent: PM for state + decisions-log

## Reviewer read-only contract

Every reviewer dispatched below is read-only: it evaluates its scope and returns its findings + **complete coverage ledger** + verdict as **final text output**. It never writes the review file itself. This workflow (the phase orchestrator) validates the full returned ledger (step 8), then writes the **reduced coverage form** — findings table, coverage summary line, full n/a list, verbatim finding rows; `checked`/`pass` rows dropped — to `<sprint>/reviews/design/iter-NN/<reviewer>.md` per `t_review.md`, first-line verdict token `[REVIEW-design-<reviewer>]: ...` intact (`review-policy.md` "Persistence"). The read-only guarantee is a host-level property of the reviewer agent (no write capability granted on either provider — `.asd/rules/providers.md`), not a textual instruction the reviewer could choose to ignore.

## Workflow

1. Read `<sprint>/state.json` — read frozen `documents.prd`/`ux_spec`/`adr`/`c4`. Compute review scope as the **intersection** of (a) frozen `documents.*` enabled and (b) the file actually existing in `<sprint>/design/` — a draft that physically exists but whose flag is disabled (e.g. audit pre-formulated it before this repo's own logic gated that — `sprint-lifecycle.md` "Audit phase") is NOT in scope and is NOT reviewed or counted toward DoD; existence alone never puts a file in scope
2. **No-op path** — if the intersected scope is empty (design phase was no-op, or every existing draft's flag is disabled): delegate to agent `asd-pm` to set `phase=design-review`, append `"design-review"` to `state.json.skipped_phases`, append decisions-log "design-review skipped (no in-scope drafts)" — **no user decision requested** (`sprint-lifecycle.md` "No-op phase rule"); emit phase COMPLETED with return contract; skip remaining steps
3. Read `.asd/project/config.yaml` (`review.external_review`, `review.iterations_low/medium/high/critical`, `language.chat`, `language.docs`)
4. Read `<sprint>/state.json` → set `phase=design-review`, increment `reviews.design.iteration` (it is `0` at sprint creation, so `1` on first entry; see `sprint-lifecycle.md` "Review iteration counters" for increment + rollback-reset rules). `NN` = resulting value, zero-padded.
5. Compute severity floor for current iteration per `review-policy.md` cumulative-budget algorithm (uses `reviews.design.iteration`)
6. Create folder `<sprint>/reviews/design/iter-NN/` if absent
7. **Parallel dispatch** — every reviewer delegated to as a **fresh agent** each iteration (clean-context dispatch per `review-policy.md`); no reviewer reused across iterations; dispatched reviewers per `review-policy.md` DoD table:
   - `asd-reviewer-documentation` — SSoT, template adherence, traceability across the drafts present (always, for any non-empty draft set)
   - `asd-reviewer-simplification` — over-engineering smells + design-principles.md adherence (always, for any non-empty draft set)
   - `asd-reviewer-ui` — ux-spec compliance with DESIGN.md + accessibility.html — **only when `ux-spec.html` or design-system artifacts are in the draft set this iteration**; skipped entirely otherwise (not counted in DoD)
   - if `review.external_review=enabled` → `asd-external-review` with phase=`design-review`, scoped to whichever drafts are present
   - payload to each: in-scope draft paths (the flag-and-existence intersection from step 1 — the **scope set** each internal reviewer must cover in its `review-policy.md` coverage ledger), iteration N, review output dir `<sprint>/reviews/design/iter-NN/`, severity floor, `language.chat`, `language.docs`. Payload carries no authoring rationale, no prior-iteration verdicts. For `asd-external-review` on iter ≥ 2, also pass previous iteration's finding set (stalemate detection)
   - each reviewer returns its findings + complete coverage ledger + verdict as final text per `t_review.md` (or `external-review/t_review-report.md` for external), first-line verdict token `[REVIEW-design-<reviewer>]: ...`; **this workflow writes the reduced coverage form of that text to `<sprint>/reviews/design/iter-NN/<reviewer>.md`** (step 8) — the reviewer itself performs no write
8. Wait all REVIEW_DONE, then **coverage-ledger gate** (per `review-policy.md`): per internal reviewer's returned text, validate File-coverage ledger lists every draft in scope set and no ledger row (file or rule) blank/unresolved. Any reviewer with missing scoped draft or unresolved row → reject + re-dispatch fresh, same iteration; wait again. Only complete-ledger reviews proceed to write: this workflow persists findings + a coverage summary line + the full `n/a` list + every `finding #N` row verbatim — `checked`/`pass` rows dropped (`review-policy.md` "Persistence"). External Review exempt (no ledger).
9. Parse first-line tokens from all written reviewer files; record per-reviewer verdicts under `state.json` `reviews.design.verdicts["iter-NN"]`; aggregate:
   - **All APPROVE** (across the reviewers actually dispatched this iteration) → DoD met; delegate to agent `asd-pm` to append decisions-log "design-review iter NN: APPROVE"; emit phase COMPLETED
   - **Any FAIL** → escalation:
     - parse FAIL findings; group by escalation cause (concept change / new abstraction / scope expansion / contract change)
     - request user decision in `language.chat`: present each FAIL using Complication Approval format from `core.md`; collect decisions
     - on override → mark resolved, continue
     - on accept → delegate to agent corresponding creator (BA / UX Designer / Architect) to apply approved changes; on creator COMPLETED → loop step 4 (increment iteration)
   - **Only CONCERNS** (no FAIL) → autofix loop:
     - delegate to agent responsible creator(s) with finding list; each autofixes per `review-policy.md` (no escalation needed)
     - on all creator COMPLETED → loop step 4
10. Iteration cap reached (no severity tier has remaining budget for next iter):
   - request user decision: override cap and continue / accept current findings / abort sprint
   - on override → loop step 4 (`reviews.design.iteration` keeps incrementing — not reset; severity floor pinned at `critical`)
   - on accept → COMPLETED note "iteration cap reached, user accepted"
   - on abort → emit ABORT
11. Any reviewer QUESTION / FAILED / ABORT → relay, halt

## Iteration severity floor (reference)
See `.asd/rules/review-policy.md` cumulative-budget algorithm. This workflow computes floor + passes to reviewer payload so reviewers drop findings below floor.

## Artefacts produced
- `<sprint>/reviews/design/iter-NN/documentation.md` (written by this workflow, reduced coverage form of the reviewer's returned text)
- `<sprint>/reviews/design/iter-NN/simplification.md` (written by this workflow)
- `<sprint>/reviews/design/iter-NN/ui.md` (only when `ux-spec.html`/design-system artifacts are in scope this iteration — step 7; UI reviewer not dispatched otherwise, so this file does not exist that iteration)
- `<sprint>/reviews/design/iter-NN/external.md` (when `external_review=enabled`; written by this workflow)
- Updated `<sprint>/design/` artifacts after autofix or escalation-approved fixes
- Updated `state.json` (phase, `reviews.design.iteration`, `reviews.design.verdicts`)
- decisions-log entry on DoD met or override

## Agents delegated to
- 2 internal reviewers (Documentation, Simplification) — parallel, always for any non-empty draft set
- UI reviewer — parallel, only when a ux-spec/design-system draft is in scope this iteration (step 7)
- External Review — parallel (when enabled)
- Creators (BA, UX Designer, Architect) — sequential, only when autofix or escalation requires
- PM — state updates + decisions-log

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
