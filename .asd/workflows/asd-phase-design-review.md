# ASD Workflow: Design Review

Orchestration body for the `asd-phase-design-review` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- Required drafts present in `<sprint>/design/`: prd.html, ux-spec.html, adr.html (per checkpoints precondition chain)
- Optional drafts honored: design-md-delta.yaml, c4-full/
- `state.json.phase` advanced from `design`

## Operations used
- read: `.asd/project/config.yaml`, `state.json`, drafts in `<sprint>/design/`, review files
- request user decision: escalation on FAIL or iteration cap
- delegate to agent in parallel: reviewers; delegate to agent sequentially: creator autofix; delegate to agent: PM for state + decisions-log

## Reviewer read-only contract

Every reviewer dispatched below is read-only: it evaluates its scope and returns its findings + verdict as **final text output**. It never writes the review file itself. This workflow (the phase orchestrator) is what writes that returned text verbatim to `<sprint>/reviews/design/iter-NN/<reviewer>.md` per `t_review.md`, first-line verdict token `[REVIEW-design-<reviewer>]: ...` intact. The read-only guarantee is a host-level property of the reviewer agent (no write capability granted on either provider — `.asd/rules/providers.md`), not a textual instruction the reviewer could choose to ignore.

## Workflow

1. Read `.asd/project/config.yaml` (`review.external_review`, `review.iterations_low/medium/high/critical`, `language.chat`, `language.docs`)
2. Read `<sprint>/state.json` → set `phase=design-review`, increment `reviews.design.iteration` (it is `0` at sprint creation, so `1` on first entry; see `sprint-lifecycle.md` "Review iteration counters" for increment + rollback-reset rules). `NN` = resulting value, zero-padded.
3. Compute severity floor for current iteration per `review-policy.md` cumulative-budget algorithm (uses `reviews.design.iteration`)
4. Create folder `<sprint>/reviews/design/iter-NN/` if absent
5. **Parallel dispatch** — every reviewer delegated to as a **fresh agent** each iteration (clean-context dispatch per `review-policy.md`); no reviewer reused across iterations:
   - `asd-reviewer-documentation` — SSoT, template adherence, traceability across drafts
   - `asd-reviewer-ui` — ux-spec compliance with DESIGN.md + accessibility.html
   - `asd-reviewer-simplification` — over-engineering smells + design-principles.md adherence
   - if `review.external_review=enabled` → `asd-external-review` with phase=`design-review`
   - payload to each: drafts paths (the **scope set** each internal reviewer must cover in its `review-policy.md` coverage ledger), iteration N, review output dir `<sprint>/reviews/design/iter-NN/`, severity floor, `language.chat`, `language.docs`. Payload carries no authoring rationale, no prior-iteration verdicts. For `asd-external-review` on iter ≥ 2, also pass previous iteration's finding set (stalemate detection)
   - each reviewer returns its findings + verdict as final text per `t_review.md` (or `external-review/t_review-report.md` for external), first-line verdict token `[REVIEW-design-<reviewer>]: ...`; **this workflow writes that text to `<sprint>/reviews/design/iter-NN/<reviewer>.md`** — the reviewer itself performs no write
6. Wait all REVIEW_DONE, then **coverage-ledger gate** (per `review-policy.md`): per internal reviewer's returned text, validate File-coverage ledger lists every draft in scope set and no ledger row (file or rule) blank/unresolved. Any reviewer with missing scoped draft or unresolved row → reject + re-dispatch fresh, same iteration; wait again. Only complete-ledger reviews proceed (and only then are their files written per step 5). External Review exempt.
7. Parse first-line tokens from all written reviewer files; record per-reviewer verdicts under `state.json` `reviews.design.verdicts["iter-NN"]`; aggregate:
   - **All APPROVE** → DoD met; delegate to agent `asd-pm` to append decisions-log "design-review iter NN: APPROVE"; emit phase COMPLETED
   - **Any FAIL** → escalation:
     - parse FAIL findings; group by escalation cause (concept change / new abstraction / scope expansion / contract change)
     - request user decision in `language.chat`: present each FAIL using Complication Approval format from `core.md`; collect decisions
     - on override → mark resolved, continue
     - on accept → delegate to agent corresponding creator (BA / UX Designer / Architect) to apply approved changes; on creator COMPLETED → loop step 2 (increment iteration)
   - **Only CONCERNS** (no FAIL) → autofix loop:
     - delegate to agent responsible creator(s) with finding list; each autofixes per `review-policy.md` (no escalation needed)
     - on all creator COMPLETED → loop step 2
8. Iteration cap reached (no severity tier has remaining budget for next iter):
   - request user decision: override cap and continue / accept current findings / abort sprint
   - on override → loop step 2 (`reviews.design.iteration` keeps incrementing — not reset; severity floor pinned at `critical`)
   - on accept → COMPLETED note "iteration cap reached, user accepted"
   - on abort → emit ABORT
9. Any reviewer QUESTION / FAILED / ABORT → relay, halt

## Iteration severity floor (reference)
See `.asd/rules/review-policy.md` cumulative-budget algorithm. This workflow computes floor + passes to reviewer payload so reviewers drop findings below floor.

## Artefacts produced
- `<sprint>/reviews/design/iter-NN/documentation.md` (written by this workflow from the reviewer's returned text)
- `<sprint>/reviews/design/iter-NN/ui.md` (written by this workflow)
- `<sprint>/reviews/design/iter-NN/simplification.md` (written by this workflow)
- `<sprint>/reviews/design/iter-NN/external.md` (when `external_review=enabled`; written by this workflow)
- Updated `<sprint>/design/` artifacts after autofix or escalation-approved fixes
- Updated `state.json` (phase, `reviews.design.iteration`, `reviews.design.verdicts`)
- decisions-log entry on DoD met or override

## Agents delegated to
- 3 internal reviewers (Documentation, UI, Simplification) — parallel
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
