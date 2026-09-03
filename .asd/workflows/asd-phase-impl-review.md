# ASD Workflow: Impl Review

Orchestration body for the `asd-phase-impl-review` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- impl-test COMPLETED signal received with a green full suite; `state.json.phase` advanced from `impl-test`
- **First entry** (after initial impl): all plan.md Task checkboxes ticked; impl assessment approved
- **Cycle re-entry** (after impl review-fix + impl-test): `state.json.review_fixes_pending` cleared by impl fix-mode finalize; `test_defects_pending` null; `<sprint>/test-plan.md` `Suite run` records a pass

## Operations used
- read: `.asd/project/config.yaml`, `state.json`, plan.md, `test-plan.md`, code + tests diff, persistent docs, `.asd/project/stubs.md`, `custom-common-rules.md`, `custom-coding-rules.md`, review files
- run command: `git diff`/`git show` to compute the iteration diff + scope file list (step 1)
- write a file: reduced coverage form of each reviewer's returned text to `<sprint>/reviews/impl/iter-NN/<reviewer>.md` (step 7); `state.json` inline (mechanical, no gate) at steps 2 and 5 — no PM dispatch
- request user decision: escalation on FAIL or iteration cap
- delegate to agent in parallel: reviewers; delegate to agent: PM for state + decisions-log + `review_fixes_pending` routing tied to DoD gates (step 8, 9) only. impl-review does NOT delegate to devs — finding fixes route to impl phase (review-fix mode), which returns via impl-test.

## Reviewer read-only contract

Every reviewer dispatched below is read-only: it evaluates its scope and returns its findings + **complete coverage ledger** + verdict as **final text output**. It never writes the review file itself. This workflow (the phase orchestrator) validates the full returned ledger (step 7), then writes the **reduced coverage form** — findings table, coverage summary line, full n/a list, verbatim finding rows; `checked`/`pass` rows dropped — to `<sprint>/reviews/impl/iter-NN/<reviewer>.md` per `t_review.md`, first-line verdict token `[REVIEW-impl-<reviewer>]: ...` intact (`review-policy.md` "Persistence"). The read-only guarantee is a host-level property of the reviewer agent (no write capability granted on either provider — `.asd/rules/providers.md`), not a textual instruction the reviewer could choose to ignore.

## Workflow

1. Read `.asd/project/config.yaml` (`review.external_review`, `review.scoped_fan_out`, `review.iterations_low/medium/high/critical`, `backward_compat`, `self_hosting`, `language.chat`, `language.docs`); read `<sprint>/state.json` frozen `documents.prd`. Diff pathspec and payload scope: consumer mode per `external-review.md`'s consumer row; `self_hosting: enabled` per its self-hosting row (the whole repo, since everything here IS framework source, excluding `.asd/project/**`/`.asd/sprints/**`/generated views). Diff source (run via Bash): iteration 1 = `git diff <base_branch>...HEAD <pathspec>`; iteration 2+ = `git diff <state.json reviews.impl.iteration_heads["iter-(NN-1)"]>...HEAD <pathspec>` — every commit since the sha recorded at the start of the previous iteration, not just the last commit. Absent-key fallback: `sprint-lifecycle.md` "State recovery" (sole SSoT), `external-review.md` "Iteration-aware diff". Scope file list derives from this same diff's changed files.
2. **Inline (mechanical, no gate)** — write `<sprint>/state.json` → set `phase=impl-review`, increment `reviews.impl.iteration` (it is `0` at sprint creation, so `1` on first entry; +1 on every impl-review entry of the `impl⇄impl-review` cycle; the intervening `impl` fix-mode phase never touches it; see `sprint-lifecycle.md` "Review iteration counters" for increment + rollback-reset rules). `NN` = resulting value, zero-padded. Record current `git rev-parse HEAD` into `state.json.reviews.impl.iteration_heads["iter-NN"]` (the base the next iteration's diff will scope from). No PM dispatch.
3. Compute severity floor for current iteration per `review-policy.md` cumulative-budget algorithm (uses `reviews.impl.iteration`)
4. Create folder `<sprint>/reviews/impl/iter-NN/` if absent
5. **Diff-scoped fan-out** (every mitigation below is mandatory, not optional) — before dispatch, compute two skip predicates from the iteration's **scope file list only** (the diff's changed files); NEVER from `documents.*` (preserves `review-policy.md` "DoD per review phase" table note verbatim: "absence of a ux-spec draft never implies absence of UI code to review"). Both predicates are evaluated here, in the workflow, regardless of `review.scoped_fan_out` — what the flag controls is whether a `true` predicate degrades the affected rubric section to `n/a`, not whether the agent carrying it is dispatched: **`asd-reviewer-correctness` and `asd-reviewer-efficiency` are always dispatched at step 6, every iteration, unconditionally.**
   - `review.scoped_fan_out: disabled` (or field absent from `config.yaml`) → both predicates evaluate `false` regardless of scope; every rubric section is reviewed in full. This is the full-fan-out escape hatch — a user who prefers guaranteed off-domain coverage keeps it.
   - `review.scoped_fan_out: enabled` — seeded by `/asd-init` for new projects only; absent means disabled — evaluate the two conditional predicates below:
     - **Correctness's UI conformance section n/a'd** only when **no file in the scope list is a UI surface** — a UI surface is any file whose path or extension marks it as UI code or a UI-adjacent artifact: `.html`/`.htm` outside `.asd/` (**except** `.asd/templates/*.html` when `self_hosting: enabled` — framework artifact templates are this repo's UI surface, reviewed under `asd-reviewer-correctness.md`'s reduced/carve-out rubric, never n/a'd or full-rubric-reviewed by omission), `.css`/`.scss`/`.less`, `.jsx`/`.tsx`/`.vue`/`.svelte`, or any file under a path segment literally named `ui`, `components`, `views`, or `pages`. Any such file entering the diff — this iteration or a later one — re-includes the section automatically; the predicate is re-evaluated every iteration, never cached. This predicate is the sole SSoT for what counts as a UI surface; `asd-reviewer-correctness.md`'s carve-out (2) trigger points here rather than restating it.
     - **Efficiency's five performance sections n/a'd** only when **both** (a) `.asd/project/custom-coding-rules.md` has no perf-budgets section **and** (b) the scope file list contains no executable file — source in any language with a build/run/interpret step (e.g. `.js`/`.ts`/`.py`/`.go`/`.java`/`.rb`/`.rs`/`.c`/`.cpp`/`.cs`/`.php`/`.kt`/`.swift`), as distinct from prose/config/markup (`.md`/`.json`/`.yaml`/documentation `.html`). Conjunctive — either condition false means the sections are reviewed as normal (three of its remaining rubric items are budget-independent regardless).
     - The evaluated predicate result is passed into each affected reviewer's dispatch payload (step 6) as an explicit `n/a: <predicate>` instruction for that section — **the reviewer never loads that domain's inputs for an n/a'd section**; this is the whole point of keeping evaluation in the workflow rather than the agent. The reviewer records the section as `n/a: <predicate>` in its own returned section-coverage ledger and still emits one verdict token covering whatever it did review. No separate `state.json` value is written for a section skip — only the reviewer's overall verdict token is recorded, at step 8.
6. **Parallel dispatch** — every reviewer delegated to as a **fresh agent** each iteration (clean-context dispatch per `review-policy.md`); no reviewer reused across iterations:
   - **APPROVE latch filter first** (AC-2, `sprint-lifecycle.md` "APPROVE latch" — sole SSoT for the mechanism, not restated here): read `state.json.reviews.impl.latched` (absent object = `{}`, no latches). A reviewer key present there returned `APPROVE` on that recorded earlier iteration and is skipped entirely this iteration — no fresh agent call, no new review file, no ledger gate at step 7 for it. Distinct from the section-level n/a mechanism below, which still fully dispatches Correctness/Efficiency; the latch skips the whole agent. Every reviewer NOT latch-skipped is always dispatched (no other agent-level skip):
   - `asd-reviewer-correctness` — bugs, security, best-practice, contract drift; AC-N coverage trace vs code/tests (PRD AC-N if `documents.prd` enabled, else `sprint.md`'s own AC-N); UI conformance vs ux-spec mockups + accessibility compliance (section n/a per step 5's UI-surface predicate when applicable)
   - `asd-reviewer-efficiency` — over-engineering + structure/cohesion smells in code; design-principles adherence; perf budgets, regression, anti-patterns (the five performance sections n/a per step 5's conjunctive predicate when applicable)
   - `asd-reviewer-testing` — `test-plan.md` decisions (risk→check fit, justified removals, justified `none` decisions, fail-first regression proof), test quality and determinism, stub-resolution verification, manual verification capture
   - `asd-reviewer-documentation` — persistent docs actuality vs implementation, SSoT, traceability
   - if `review.external_review=enabled` AND not latch-skipped → `asd-external-review` with phase=`impl-review`
   - payload to each internal reviewer (latch-skipped reviewers receive no dispatch, hence no payload): the diff computed in step 1, the **scope file list** (the diff's changed files — set each internal reviewer must cover in its `review-policy.md` coverage ledger), iteration N, review output dir `<sprint>/reviews/impl/iter-NN/`, severity floor, relevant context paths (`<sprint>/test-plan.md` included — Testing reviewer's primary input), `language.chat`, `language.docs`; for `asd-reviewer-correctness` and `asd-reviewer-efficiency` additionally the step-5 predicate results, naming which section(s) (if any) are pre-marked `n/a: <predicate>` this dispatch. Payload carries no authoring rationale, no prior-iteration verdicts; incremental diff scopes the *input*, not reviewer's context. For `asd-external-review` on iter ≥ 2, also pass previous iteration's finding set (stalemate detection)
   - each reviewer returns its findings + complete coverage ledger (file, rule, and section) + verdict as final text per `t_review.md` (or `external-review/t_review-report.md` for external), first-line verdict token `[REVIEW-impl-<reviewer>]: ...`; **this workflow writes the reduced coverage form of that text to `<sprint>/reviews/impl/iter-NN/<reviewer>.md`** (step 7) — the reviewer itself performs no write
7. Wait REVIEW_DONE from every dispatched reviewer, then **coverage-ledger gate** (per `review-policy.md`): per internal reviewer's returned text, validate File-coverage ledger lists every file in scope file list, Rule-coverage ledger has no blank/unresolved row, and (for `asd-reviewer-correctness`/`asd-reviewer-efficiency`) the section-coverage ledger has one row per rubric section with no row omitted or blank (an n/a row from step 5 counts as resolved). Any reviewer with missing scoped file, unresolved rule row, or unresolved/missing section row → reject + re-dispatch fresh, same iteration; wait again. Only complete-ledger reviews proceed to write: this workflow persists findings + a coverage summary line + the full `n/a` list + every `finding #N` row verbatim — `checked`/`pass` rows dropped (`review-policy.md` "Persistence"). External Review exempt (no ledger).
8. Parse first-line verdict tokens from all written reviewer files; record per-reviewer verdicts under `state.json` `reviews.impl.verdicts["iter-NN"]` keyed `correctness`/`efficiency`/`testing`/`documentation`/`external`, one entry per reviewer actually dispatched this iteration — a latch-skipped reviewer (step 6) gets no entry here, per `sprint-lifecycle.md` "State recovery"'s absent-key branch. For any reviewer whose parsed token this iteration is `APPROVE`, also write `state.json.reviews.impl.latched[<key>] = N` (current iteration; AC-2 APPROVE latch — `sprint-lifecycle.md` "APPROVE latch"). Aggregate per `sprint-lifecycle.md` "State recovery" satisfied-vs-blocking semantics, where a `latched` entry counts as satisfied exactly as a fresh `APPROVE` would. impl-review does NOT fix findings itself — fixes route to impl phase (fix mode):
   - **All APPROVE or latched** → DoD met:
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
11. On `ADVICE_NEEDED` from any dispatched agent → relay per `sprint-lifecycle.md`'s `ADVICE_NEEDED` protocol; execution resumes, no halt.

## Iteration severity floor (reference)
See `.asd/rules/review-policy.md` cumulative-budget algorithm. This workflow computes floor + passes to reviewer payload so reviewers drop findings below floor.

## Artefacts produced
- `<sprint>/reviews/impl/iter-NN/correctness.md` (written by this workflow when dispatched, reduced coverage form of the reviewer's returned text; UI conformance section may be n/a per step 5's diff-scoped fan-out; not written this iteration when latch-skipped — step 6)
- `<sprint>/reviews/impl/iter-NN/efficiency.md` (written by this workflow when dispatched; the five performance sections may be n/a per step 5's diff-scoped fan-out; not written this iteration when latch-skipped — step 6)
- `<sprint>/reviews/impl/iter-NN/testing.md` (written by this workflow when dispatched; not written this iteration when latch-skipped — step 6)
- `<sprint>/reviews/impl/iter-NN/documentation.md` (written by this workflow when dispatched; not written this iteration when latch-skipped — step 6)
- `<sprint>/reviews/impl/iter-NN/external.md` (when `external_review=enabled` and not latch-skipped; written by this workflow)
- Updated `state.json` (phase, `reviews.impl.iteration`, `reviews.impl.verdicts`, `reviews.impl.latched`, `review_fixes_pending`)
- decisions-log entry on DoD met, route-to-impl-fix, or override

Note: impl-review produces no code/test/stub changes — those are made by the impl phase (review-fix mode) on the next cycle, followed by impl-test.

## Agents delegated to
- 4 internal reviewers (Correctness, Efficiency, Testing, Documentation) — parallel, dispatched unless APPROVE-latched (step 6, AC-2); `review.scoped_fan_out` degrades a rubric section within Correctness or Efficiency to `n/a` for a dispatched reviewer, never skips the agent by itself (step 5) — the latch is the only agent-level skip
- External Review — parallel (when enabled and not latch-skipped)
- PM — decisions-log + `review_fixes_pending` routing tied to DoD gates (step 8, 9); no-op mechanical state writes (steps 2, 5) are inline workflow writes, no PM dispatch
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
