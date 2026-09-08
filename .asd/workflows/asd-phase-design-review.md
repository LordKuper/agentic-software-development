# ASD Workflow: Design Review

Orchestration body for the `asd-phase-design-review` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- Whichever of prd.html/ux-spec.html/adr.html the sprint's frozen `documents.*` enabled are present in `<sprint>/design/` (per checkpoints precondition chain). When design was the collapsed no-op (all four `documents.*` disabled), this phase is never separately dispatched — `state.json.phase` already advanced past it to `design-promote` — so this precondition is never evaluated in that case
- Optional drafts honored: design-md-delta.yaml, c4-full/
- `state.json.phase` advanced from `design`

## Operations used
- read: `.asd/project/config.yaml`, `state.json`, drafts in `<sprint>/design/`, review files
- write validated compact reviewer coverage and orchestrator state inline
- request user decision: escalation on FAIL or iteration cap
- delegate to agent in parallel: reviewers; delegate to agent sequentially: creator autofix; the orchestrator writes state and decisions-log inline
- append friction: `F-N` entries to `<sprint>/friction-log.md` per `sprint-lifecycle.md` "Friction log"

## Reviewer read-only contract

Every reviewer returns its verdict, findings and compact machine ledger as text (what read-only covers: `review-policy.md`). The workflow validates that ledger, then writes the compact ledger plus verdict and finding rows directly; it never expands checked/pass prose. The reviewer never writes the file.

## Workflow

1. Read `<sprint>/state.json` — read frozen `documents.prd`/`ux_spec`/`adr`/`c4`. Compute review scope as the **intersection** of (a) frozen `documents.*` enabled and (b) the file actually existing in `<sprint>/design/` — a draft that physically exists but whose flag is disabled (e.g. audit pre-formulated it before this repo's own logic gated that — `sprint-lifecycle.md` "Audit phase") is NOT in scope and is NOT reviewed or counted toward DoD; existence alone never puts a file in scope
2. **No-op path** — the all-`documents.*`-disabled case is handled entirely by `asd-phase-design.md` step 2's collapsed check and never reaches this phase as a separate dispatch. This step is the defensive fallback for the residual case of an intersected scope somehow empty on direct/explicit re-dispatch of this phase alone: write inline (mechanical, no gate — no user decision requested, `sprint-lifecycle.md` "No-op phase rule"): set `phase=design-review`, append `"design-review"` to `state.json.skipped_phases`, append decisions-log "design-review skipped (no in-scope drafts)"; emit phase COMPLETED with return contract; skip remaining steps
3. Read `.asd/project/config.yaml` (`review.external_review`, `review.iterations_low/medium/high/critical`, `language.chat`, `language.docs`)
3a. Before External Review dispatch or diff assembly, run `node .asd/runtime.js external-preflight --input <path>`, `cachePath` set to the canonical path from `external-review.md` "Detection and negative cache" (sole SSoT — not restated here). Its local-ready result means only executable/auth readiness; model access remains `unknown`. On non-ready, record the transparent availability skip; after a real authentication/quota/reachability/command failure call `external-record-failure` with the returned fingerprint, the same cache path, and bounded retry data.
4. **Inline** — set phase and increment the review iteration.
5. Compute severity floor for current iteration per `review-policy.md` cumulative-budget algorithm (uses `reviews.design.iteration`)
6. Create folder `<sprint>/reviews/design/iter-NN/` if absent
7. **Parallel dispatch** — every reviewer delegated to as a **fresh agent** each iteration (clean-context dispatch per `review-policy.md`); no reviewer reused across iterations:
   - **APPROVE latch filter first** (`sprint-lifecycle.md` "APPROVE latch" — sole SSoT for the mechanism, not restated here): read `state.json.reviews.design.latched` (absent object = `{}`, no latches). A reviewer key present there returned `APPROVE` on that recorded earlier iteration and is skipped entirely this iteration — no fresh agent call, no new review file, no ledger gate at step 8 for it. Every internal reviewer is dispatched when not latch-skipped:
   - `asd-reviewer-documentation` — SSoT, template adherence, traceability across the drafts present (always, for any non-empty draft set)
   - `asd-reviewer-efficiency` — over-engineering + structure/cohesion + complexity-vs-value tradeoff sections (always, for any non-empty draft set; its impl-only performance sections are outside this phase's allowed-section list — see below)
   - `asd-reviewer-correctness` — UI conformance only (ux-spec compliance with DESIGN.md + accessibility.html). When no `ux-spec.html` or design-system artifact is in scope, its allowed-section list is empty and the UI section is `n/a: outside phase gate`; the reviewer still dispatches and is counted toward DoD.
   - if `review.external_review=enabled` AND not latch-skipped → `asd-external-review` with phase=`design-review`, scoped to whichever drafts are present. Build its **scope manifest** per `external-review/t_review-scope.json`: `phase: "design-review"`, `iteration: N`, `base_ref`/`head_ref` = empty string (design-review scopes by on-disk draft snapshot, not a commit range — `external-review.md` "Phase-scoped payload"), `files[]` = the in-scope draft paths (iter 1: the full flag-and-existence intersection from step 1; iter 2+: only paths changed since the previous iteration's persisted snapshot), `exclude_paths[]` = `c4-full/dist/` plus any other generated output — never a rendered diff, the agent reads each `files[]` path itself
   - payload to each internal reviewer (latch-skipped reviewers receive no dispatch, hence no payload): in-scope draft paths (the flag-and-existence intersection from step 1 — the **scope set** each internal reviewer must cover in its `review-policy.md` coverage ledger), iteration N, review output dir `<sprint>/reviews/design/iter-NN/`, severity floor, `language.chat`, `language.docs`; for `asd-reviewer-correctness` and `asd-reviewer-efficiency` additionally the **explicit allowed-section list for design-review** (`review-policy.md` "DoD per review phase": Correctness = UI section only when a ux-spec/design-system artifact is in scope; otherwise its list is empty and the section is `n/a: outside phase gate`; Efficiency = over-engineering + structure/cohesion + complexity-vs-value tradeoff sections, never the performance sections) — impl-only rubric sections MUST NOT fire against drafts; a section not on the list is `n/a: outside phase gate` in that reviewer's section-coverage ledger, not evaluated at all. Payload carries no authoring rationale, no prior-iteration verdicts. Payload to `asd-external-review` is the scope manifest above plus review output dir, severity floor, `language.chat`, `language.docs` — never the internal reviewers' draft-path payload verbatim. For `asd-external-review` on iter ≥ 2, also pass previous iteration's finding set (stalemate detection)
   - each reviewer returns its findings + complete coverage ledger (file, rule, and section) + verdict as final text per `t_review.md` (or `external-review/t_review-report.md` for external), first-line verdict token `[REVIEW-design-<reviewer>]: ...`; **this workflow writes the validated compact coverage evidence of that text to `<sprint>/reviews/design/iter-NN/<reviewer>.md`** (step 8) — the reviewer itself performs no write, and the commit carrying that file also carries any agent memory that reviewer authored (`git-strategy.md` "Commit before review")
8. Wait all REVIEW_DONE; write the exact manifest, returned ledger and finding-id array, then run `node .asd/runtime.js validate-ledger --manifest <path> --ledger <path> --findings <path>` for each internal reviewer. A failure rejects and re-dispatches fresh. External Review is exempt.
8a. **Interrupted dispatch / split dispatch** — internal reviewers only; `review-policy.md` "Interrupted dispatch and split dispatch" is the sole SSoT for trigger, partition, union property, merge rule and durable record, not restated here. A dispatch returning no verdict token or no ledger takes the same reject-and-re-dispatch-fresh path as a failed validation above.
   - Phase bindings: stamp each half manifest with `node .asd/runtime.js manifest-digest --manifest <path> --write`; dispatch each half as its own fresh agent carrying the step 7 payload narrowed to that half, gated by `validate-ledger` as above; part files are `<sprint>/reviews/design/iter-NN/<reviewer>.part-1.md`/`.part-2.md` and step 9 parses the merged `<reviewer>.md` only; a half interrupted twice → request user decision.
9. Parse first-line tokens from all written reviewer files; record per-reviewer verdicts under `state.json` `reviews.design.verdicts["iter-NN"]` keyed `correctness`/`efficiency`/`documentation`/`external` — **every required reviewer gets an entry this iteration, no exception** (`sprint-lifecycle.md` "APPROVE latch" invariant): a reviewer dispatched this iteration writes its freshly parsed token; a reviewer latch-skipped at step 7 instead has its inherited `APPROVE` written here directly, without being dispatched. A reviewer split at step 8a contributes exactly one entry, parsed from its merged `<reviewer>.md` first line like any other; an interrupted attempt contributes none and never latches — it produced no verdict, and its absent key blocks (`sprint-lifecycle.md` "State recovery") until a re-dispatch returns one — its interrupted attempts were already logged at step 8a, not here. For any reviewer whose parsed token this iteration is the bare `APPROVE` token — a completed review — also write `state.json.reviews.design.latched[<key>] = N` (current iteration; `sprint-lifecycle.md` "APPROVE latch") — dispatch-skip bookkeeping for future iterations only, separate from the `verdicts` write above. External Review's availability-skip verdict is recorded instead as `"APPROVE (skipped: <reason>)"` (never the bare token) when the phase-supplied preflight returns a non-ready status (unavailable command/auth, or an active negative cache; `external-review.md` "Detection and negative cache"); append the same reason to decisions-log. It satisfies the aggregation below exactly like a bare `APPROVE` but is NEVER written to `latched` (`sprint-lifecycle.md` "APPROVE latch" "Availability-skip carve-out" — only a verdict from an actual review latches). Aggregate by reading `verdicts["iter-NN"]` alone — `latched` plays no part in aggregation:
   - **All APPROVE or latched** → DoD met; apply the adaptive gate policy and append the decision inline; emit phase COMPLETED
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
- `<sprint>/reviews/design/iter-NN/documentation.md` (written by this workflow when dispatched, validated compact coverage evidence of the reviewer's returned text; not written this iteration when latch-skipped — step 7)
- `<sprint>/reviews/design/iter-NN/efficiency.md` (written by this workflow when dispatched; not written this iteration when latch-skipped — step 7)
- `<sprint>/reviews/design/iter-NN/correctness.md` (written by this workflow when dispatched; its UI section may be `n/a: outside phase gate`; not written when latch-skipped)
- `<sprint>/reviews/design/iter-NN/external.md` (when `external_review=enabled` and not latch-skipped; written by this workflow)
- `<sprint>/reviews/design/iter-NN/<reviewer>.part-1.md`/`.part-2.md` (only for a reviewer split at step 8a; its `<reviewer>.md` then holds the merged token plus links to both parts)
- Updated `<sprint>/design/` artifacts after autofix or escalation-approved fixes
- Updated `state.json` (phase, `reviews.design.iteration`, `reviews.design.verdicts`, `reviews.design.latched`)
- decisions-log entry on DoD met or override

## Agents delegated to
- 3 internal reviewers (Documentation, Efficiency, Correctness) — parallel, dispatched for any non-empty draft set unless APPROVE-latched (step 7); Correctness's UI section is `n/a: outside phase gate` when no ux-spec/design-system draft is in scope
- External Review — parallel (when enabled and not latch-skipped)
- Creators (BA, UX, Architect) — sequential, only when autofix or escalation requires
- The orchestrator records state and decisions inline; no orchestration agent is dispatched.

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
