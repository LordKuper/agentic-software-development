# ASD Workflow: Impl Review

Orchestration body for the `asd-phase-impl-review` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- impl-test COMPLETED signal received with a green full suite; `state.json.phase` advanced from `impl-test`
- **First entry** (after initial impl): all plan.md Task checkboxes ticked; impl assessment approved
- **Cycle re-entry** (after impl review-fix + impl-test): `state.json.review_fixes_pending` cleared by impl fix-mode finalize; `test_defects_pending` null; `<sprint>/test-plan.md` `Suite run` records a pass

## Operations used
- read: `.asd/project/config.yaml`, `state.json`, plan.md, `test-plan.md`, code + tests diff, persistent docs, `.asd/project/stubs.md`, `custom-common-rules.md`, `custom-coding-rules.md`, review files
- write a file: reduced coverage form of each reviewer's returned text to `<sprint>/reviews/impl/iter-NN/<reviewer>.md` (step 7)
- request user decision: escalation on FAIL or iteration cap
- delegate to agent in parallel: reviewers; delegate to agent: PM for state + decisions-log. impl-review does NOT delegate to devs — finding fixes route to impl phase (review-fix mode), which returns via impl-test.

## Reviewer read-only contract

Every reviewer dispatched below is read-only: it evaluates its scope and returns its findings + **complete coverage ledger** + verdict as **final text output**. It never writes the review file itself. This workflow (the phase orchestrator) validates the full returned ledger (step 7), then writes the **reduced coverage form** — findings table, coverage summary line, full n/a list, verbatim finding rows; `checked`/`pass` rows dropped — to `<sprint>/reviews/impl/iter-NN/<reviewer>.md` per `t_review.md`, first-line verdict token `[REVIEW-impl-<reviewer>]: ...` intact (`review-policy.md` "Persistence"). The read-only guarantee is a host-level property of the reviewer agent (no write capability granted on either provider — `.asd/rules/providers.md`), not a textual instruction the reviewer could choose to ignore.

## Workflow

1. Read `.asd/project/config.yaml` (`review.external_review`, `review.scoped_fan_out`, `review.iterations_low/medium/high/critical`, `backward_compat`, `self_hosting`, `language.chat`, `language.docs`); read `<sprint>/state.json` frozen `documents.prd`. Diff pathspec and payload scope: consumer mode per `external-review.md`'s consumer row; `self_hosting: enabled` per its self-hosting row (the whole repo, since everything here IS framework source, excluding `.asd/project/**`/`.asd/sprints/**`/generated views).
2. Read `<sprint>/state.json` → set `phase=impl-review`, increment `reviews.impl.iteration` (it is `0` at sprint creation, so `1` on first entry; +1 on every impl-review entry of the `impl⇄impl-review` cycle; the intervening `impl` fix-mode phase never touches it; see `sprint-lifecycle.md` "Review iteration counters" for increment + rollback-reset rules). `NN` = resulting value, zero-padded.
3. Compute severity floor for current iteration per `review-policy.md` cumulative-budget algorithm (uses `reviews.impl.iteration`)
4. Create folder `<sprint>/reviews/impl/iter-NN/` if absent
5. **Diff-scoped fan-out** (every mitigation below is mandatory, not optional) — before dispatch, compute two skip predicates from the iteration's **scope file list only** (the diff's changed files); NEVER from `documents.*` (preserves `review-policy.md` "DoD per review phase" table note verbatim: "absence of a ux-spec draft never implies absence of UI code to review"):
   - `review.scoped_fan_out: disabled` (or field absent from `config.yaml`) → skip nothing; dispatch every reviewer below unconditionally, exactly as before this task. This is the full-fan-out escape hatch — a user who prefers guaranteed off-domain coverage keeps it.
   - `review.scoped_fan_out: enabled` (default) → apply the two conditional skips below:
     - **UI reviewer skipped** only when **no file in the scope list is a UI surface** — a UI surface is any file whose path or extension marks it as UI code or a UI-adjacent artifact: `.html`/`.htm` outside `.asd/`, `.css`/`.scss`/`.less`, `.jsx`/`.tsx`/`.vue`/`.svelte`, or any file under a path segment literally named `ui`, `components`, `views`, or `pages`. Any such file entering the diff — this iteration or a later one — re-enables the reviewer automatically; the predicate is re-evaluated every iteration, never cached.
     - **Performance reviewer skipped** only when **both** (a) `.asd/project/custom-coding-rules.md` has no perf-budgets section **and** (b) the scope file list contains no executable file — source in any language with a build/run/interpret step (e.g. `.js`/`.ts`/`.py`/`.go`/`.java`/`.rb`/`.rs`/`.c`/`.cpp`/`.cs`/`.php`/`.kt`/`.swift`), as distinct from prose/config/markup (`.md`/`.json`/`.yaml`/documentation `.html`). Conjunctive — either condition false means dispatch as normal (three of its five rubric items are budget-independent).
     - A skipped reviewer is **not dispatched**. In its place, write `state.json.reviews.impl.verdicts["iter-NN"].ui` or `.performance` = `"skipped: <predicate>"` (e.g. `"skipped: no UI surface in scope"`, `"skipped: no perf budgets section and no executable file in scope"`) instead of a parsed verdict token. No review file is written for a skipped reviewer. This value is distinct from an absent key (dispatch lost/crashed/ledger-rejected) and from `null` — see `sprint-lifecycle.md` "State recovery". Per `review-policy.md` "DoD per review phase" table note, a skipped reviewer is not counted as missing at the DoD or pr-phase gate.
6. **Parallel dispatch** — every non-skipped reviewer delegated to as a **fresh agent** each iteration (clean-context dispatch per `review-policy.md`); no reviewer reused across iterations:
   - `asd-reviewer-quality` — bugs, security, best-practice, contract drift
   - `asd-reviewer-implementation` — AC-N coverage trace vs code/tests (PRD AC-N if `documents.prd` enabled, else `sprint.md`'s own AC-N)
   - `asd-reviewer-testing` — `test-plan.md` decisions (risk→check fit, justified removals, justified `none` decisions, fail-first regression proof), test quality and determinism, stub-resolution verification, manual verification capture
   - `asd-reviewer-ui` — UI code vs ux-spec mockups + accessibility compliance (unless skipped per step 5)
   - `asd-reviewer-simplification` — over-engineering smells in code; design-principles adherence
   - `asd-reviewer-documentation` — persistent docs actuality vs implementation, SSoT, traceability
   - `asd-reviewer-performance` — perf budgets, regression, anti-patterns (unless skipped per step 5)
   - if `review.external_review=enabled` → `asd-external-review` with phase=`impl-review`
   - payload to each: diff (iter 1 = `git diff <base>...HEAD`; iter 2+ = `git diff` + last commit), the **scope file list** (the diff's changed files — set each internal reviewer must cover in its `review-policy.md` coverage ledger), iteration N, review output dir `<sprint>/reviews/impl/iter-NN/`, severity floor, relevant context paths (`<sprint>/test-plan.md` included — Testing reviewer's primary input), `language.chat`, `language.docs`. Payload carries no authoring rationale, no prior-iteration verdicts; incremental diff scopes the *input*, not reviewer's context. For `asd-external-review` on iter ≥ 2, also pass previous iteration's finding set (stalemate detection)
   - each reviewer returns its findings + complete coverage ledger + verdict as final text per `t_review.md` (or `external-review/t_review-report.md` for external), first-line verdict token `[REVIEW-impl-<reviewer>]: ...`; **this workflow writes the reduced coverage form of that text to `<sprint>/reviews/impl/iter-NN/<reviewer>.md`** (step 7) — the reviewer itself performs no write
7. Wait REVIEW_DONE from every **dispatched** (non-skipped) reviewer, then **coverage-ledger gate** (per `review-policy.md`): per internal reviewer's returned text, validate File-coverage ledger lists every file in scope file list and no ledger row (file or rule) blank/unresolved. Any reviewer with missing scoped file or unresolved row → reject + re-dispatch fresh, same iteration; wait again. Only complete-ledger reviews proceed to write: this workflow persists findings + a coverage summary line + the full `n/a` list + every `finding #N` row verbatim — `checked`/`pass` rows dropped (`review-policy.md` "Persistence"). External Review exempt (no ledger). Skipped reviewers (step 5) never enter this gate — their `state.json` value was already written in step 5.
8. Parse first-line verdict tokens from all written reviewer files; record per-reviewer verdicts under `state.json` `reviews.impl.verdicts["iter-NN"]` (skipped reviewers already recorded in step 5); aggregate, treating a `"skipped: <predicate>"` value as satisfied for DoD purposes (not counted as missing, not counted as a finding). impl-review does NOT fix findings itself — fixes route to impl phase (fix mode):
   - **All APPROVE** → DoD met:
     - delegate to agent `asd-pm`: append decisions-log "impl-review iter NN: APPROVE", clear `state.json.review_fixes_pending` (set null)
     - emit phase COMPLETED with `NEXT: pr`
   - **Any FAIL** → escalation (impl-review owns review escalation):
     - parse FAIL findings; group by escalation cause (concept / requirement / contract change; new abstraction; scope expansion; complexity increase)
     - request user decision in `language.chat`: present each FAIL using Complication Approval format from `core.md`; collect decisions
     - on override → mark that finding resolved (no fix needed); exclude from fix set
     - on accept → keep finding in fix set; note approved change in its reviewer file
     - then continue to routing step below with surviving findings
   - **Any unresolved finding remains** (CONCERNS findings, plus FAIL findings user accepted for fix) → route to impl review-fix mode (the sprint returns here via impl-test):
     - delegate to agent `asd-pm`: set `state.json.review_fixes_pending = "iter-NN"` (current impl-review iteration; impl review-fix mode reads findings from `<sprint>/reviews/impl/iter-NN/`); append decisions-log "impl-review iter NN: <CONCERNS/FAIL summary> → impl fix"
     - emit phase COMPLETED with `NEXT: impl`
   - **All FAIL overridden, no CONCERNS** (escalation left zero unresolved findings) → treat as DoD met by user override: delegate to agent `asd-pm` to append decisions-log "impl-review iter NN: APPROVE by override", clear `review_fixes_pending`; emit COMPLETED with `NEXT: pr`
9. Iteration cap reached (next impl-review iteration would exceed all severity-tier budgets per `review-policy.md`) — checked when step 8 would route to impl review-fix mode:
   - request user decision: override cap and continue / accept current findings / abort sprint
   - on override → route to impl review-fix mode (`reviews.impl.iteration` keeps incrementing — not reset; severity floor pinned at `critical`; PM sets `review_fixes_pending`, emit COMPLETED `NEXT: impl`)
   - on accept → emit COMPLETED with `NEXT: pr`, note "iteration cap reached, user accepted"
   - on abort → emit ABORT
10. Any reviewer QUESTION / FAILED / ABORT → relay, halt

## Iteration severity floor (reference)
See `.asd/rules/review-policy.md` cumulative-budget algorithm. This workflow computes floor + passes to reviewer payload so reviewers drop findings below floor.

## Artefacts produced
- `<sprint>/reviews/impl/iter-NN/quality.md` (written by this workflow, reduced coverage form of the reviewer's returned text)
- `<sprint>/reviews/impl/iter-NN/implementation.md` (written by this workflow)
- `<sprint>/reviews/impl/iter-NN/testing.md` (written by this workflow)
- `<sprint>/reviews/impl/iter-NN/ui.md` (written by this workflow; absent when UI skipped per step 5)
- `<sprint>/reviews/impl/iter-NN/simplification.md` (written by this workflow)
- `<sprint>/reviews/impl/iter-NN/documentation.md` (written by this workflow)
- `<sprint>/reviews/impl/iter-NN/performance.md` (written by this workflow; absent when Performance skipped per step 5)
- `<sprint>/reviews/impl/iter-NN/external.md` (when `external_review=enabled`; written by this workflow)
- Updated `state.json` (phase, `reviews.impl.iteration`, `reviews.impl.verdicts`, `review_fixes_pending`)
- decisions-log entry on DoD met, route-to-impl-fix, or override

Note: impl-review produces no code/test/stub changes — those are made by the impl phase (review-fix mode) on the next cycle, followed by impl-test.

## Agents delegated to
- 6 internal reviewers (Quality, Implementation, Testing, UI, Simplification, Documentation) + Performance — parallel; UI and/or Performance may be skipped per step 5's diff-scoped fan-out (`review.scoped_fan_out`)
- External Review — parallel (when enabled)
- PM — state updates + decisions-log + `review_fixes_pending` routing
- No devs — finding fixes performed by impl phase (review-fix mode)

## Skills/workflows dispatched
None.

## Return contract (single line)
```
PHASE: impl-review | SPRINT: <NNN-slug> | ITER: <N> | STATUS: <complete|blocked|aborted> | NEXT: <pr|impl>
```
`NEXT: pr` on DoD met (or cap-accept); `NEXT: impl` when unresolved findings route the sprint to impl review-fix mode.

## References
- `.asd/rules/sprint-lifecycle.md` (impl-review phase contract)
- `.asd/rules/review-policy.md` (severity floor, autofix, escalation, gate verdict format, DoD per phase, reviewer authorship)
- `.asd/rules/design-principles.md`
- `.asd/rules/checkpoints.md`
- `.asd/rules/language-policy.md`
- `.asd/rules/git-strategy.md` (stubs handling)
- Templates: `t_review.md`, `external-review/t_review-report.md`
