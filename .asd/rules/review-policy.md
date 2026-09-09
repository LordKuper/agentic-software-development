# Review Policy

## Severity levels

| Level | Definition | Example |
|---|---|---|
| critical | breaks build, security hole, data loss, contract violation | unhandled secret leak, broken migration |
| high | wrong behavior, missing acceptance criterion, test gap on core path | requirement T3 not implemented |
| medium | bad pattern with concrete risk, weak edge-case coverage | shared mutable state, no test for empty input |
| low | style, minor clarity, micro-inefficiency | naming inconsistency |

## Iteration severity floor

Config sets `iterations_<severity>` (default: low=1, medium=1, high=2, critical=10). Each tier gets its own consecutive iteration budget in order low → medium → high → critical. On iteration N, the floor is the tier whose **cumulative budget** first covers N. Only findings at floor severity or higher count.

`N` is the **phase-local** counter — `reviews.design.iteration` or `reviews.impl.iteration` (see `sprint-lifecycle.md`). Each review phase computes its floor from its own counter.

Cumulative budgets with defaults:

- low: cum 1 → iter 1 → floor=low (all)
- medium: cum 2 → iter 2 → floor=medium (drop low)
- high: cum 4 → iters 3-4 → floor=high (drop low, medium)
- critical: cum 14 → iters 5-14 → floor=critical (drop low, medium, high)
- iter ≥ 15 → stop, escalate to user

User may override the cap. On override the counter keeps incrementing (not reset); floor stays pinned at `critical`, so extra rounds do not re-admit lower-severity findings.

## Clean-context review iteration

Every iteration dispatches each reviewer as a **fresh agent invocation** — new context, no carry-over from authoring or prior iterations. Isolates each verdict from creator reasoning and earlier rounds.

- The dispatching phase workflow spawns every required reviewer (and External Review) anew each iteration, unless that reviewer is APPROVE-latched (`sprint-lifecycle.md` "APPROVE latch") — a latched reviewer is not dispatched at all this iteration, never reused or resumed either. No dispatched reviewer is ever reused or resumed.
- Reviewer payload carries only: the artifact/diff under review, rule references, severity floor, iteration number, context paths. Never authoring rationale or prior verdicts.
- Reviewers MUST NOT read prior `reviews/<phase>/iter-*/` files. Only the current `iter-NN/` directory.
- Incremental diff scoping (iter 2+ reviews only what changed — see `external-review.md`) narrows the *input*, not context. Agent still fresh.
- Where a reviewer genuinely needs prior-iteration data (External Review stalemate detection), the phase workflow supplies it as explicit payload input — scoped data, not context carry-over.

## Change-surface rule

Review, at every phase, covers only the change surface — the iteration's diff (impl-review) or draft set (design-review) — never the whole project. A finding about code/content outside that surface is invalid, with one exception: the change itself made that unchanged code/content incorrect (e.g. a renamed function left a caller elsewhere broken). Reviewer agents and workflows link here; this paragraph is the sole statement of the rule.

**Diff reachability.** That surface is computed from commits, so an authored file nobody commits is invisible to review. Agent memory is in-surface hand-authored source (`artifact-layout.md` "Agent memory"), yet a reviewer holds no commit tool — so the phase workflow writing its review file commits those memory writes too (`git-strategy.md` "Commit before review", which owns that bookkeeping). A memory file a concurrent co-author holds mid-edit is ownerless the same way, and the same rule assigns it. Committed there, the write reaches a diff: the next iteration's, else `pr`'s.

## Over-engineering checklist (critical, undroppable)

Efficiency reviewer flags any of these as `critical`:

- Interface with exactly one implementer
- Generic with exactly one concrete type parameter
- Factory for fewer than three classes
- Plugin system with no plugin
- Abstraction with no second use case
- Premature config flag (no caller chooses non-default)
- Defensive code for impossible-by-contract case
- Helper that wraps one stdlib call without added value
- Inheritance depth ≥ 3 without polymorphic dispatch
- Framework wrapping a framework
- Mock of a mock in tests
- Comment that restates code
- Dead code left "in case we need it"

## Structure / cohesion checklist (critical, undroppable)

Efficiency reviewer flags as `critical` — the under-design counterpart to over-engineering:

- God / sprawling type: one type (class/module) carrying ≥2 unrelated responsibilities, i.e. ≥2 independent reasons to change (e.g. parsing + persistence + transport in one type)

Detection is responsibility-based (SRP), not size-based: evidence = name the distinct responsibility clusters the type mixes. Size alone never flags.

Fix = split along responsibility seams into cohesive types → category `simplify` (decomposition, not new abstraction). Escalate only when split changes ADR-declared subsystem boundaries.

## Autofix vs escalation

Default: the responsible creator autofixes any reviewer issue without user prompt.

**Verify before applying.** A reviewer's proposed fix is a claim about source, not an instruction: the fixer re-reads the cited path/symbol and confirms the finding's premise holds at current `HEAD` before applying anything. An equivalent correct fix stays permitted; an unverified transcription does not. Premise false → apply nothing and report the mismatch in the completion signal, never a silent drop. Premise true but prescription wrong → fix the real defect and say so in the commit body.

**Where the fix happens:**
- **design-review** — the creator (asd-ba / asd-ux / asd-architect) autofixes within the loop; iteration advances.
- **impl-review** — fixes NOT applied inside the review phase. impl-review routes the sprint back to `impl` (review-fix mode); the responsible dev resolves findings; sprint re-enters impl-review via `impl-test`.

**Escalation required** (ask user before fix), format = Complication Approval (`core.md`):

- Change to approved concept, PRD requirement, or API contract
- New abstraction, layer, interface, or dependency
- Scope expansion beyond `sprint.md`
- Complexity increase (any over-engineering check trips)

## Nitpick drop list (reviewers must NOT raise)

- Pure wording polish
- Opinion-only style
- Alternative naming with no concrete bug
- `you could also` without identifying a defect
- Speculative future-proofing

## Coverage ledger (mandatory — blocks verdict)

Applies to all 4 internal reviewers (NOT External Review — Codex self-scopes). Before any verdict, the reviewer MUST emit a coverage ledger proving exhaustive review. Reviewer MUST NOT stop or emit a final verdict while its ledger is incomplete — keep reviewing until every row resolved.

The phase orchestrator derives an ordered machine manifest before dispatch. It enumerates every scoped file, every stable reviewer-rubric/custom-rule ID, named sections where applicable, and the **allowed `n/a` predicates per individual ID**. The manifest contains its SHA-256 digest, calculated by `.asd/runtime.js` over the manifest excluding `digest` — produce/verify it via `node .asd/runtime.js manifest-digest --manifest <path> [--write]`; a reviewer cannot replace it.

**Manifest `vocabulary`** — the row vocabulary travels inside the manifest, so a reviewer reads it off its own input instead of recalling prose:

`"vocabulary": {"files": [...], "rules": [...], "sections": [...], "p": "<the single status that carries p>", "f": "<the single status that carries f>"}`

Per-row-type status list plus the placement rule: `p` is required on the one status named by `p` and forbidden on every other, likewise `f`. This rule fixes the shape only; values come from `.asd/runtime.js`'s one exported vocabulary constant, shared by emitter and validator so published and enforced vocabulary cannot drift. **Required** in every manifest a phase workflow emits, split halves included. **Optional** to `validate-ledger`: absent → validated as before; present → must equal the validator's own constant, mismatch rejected. Digest-covered like every other manifest field.

The reviewer returns one compact JSON ledger: `manifest_digest`, `findings` (the exact finding IDs), and `files`/`rules`/`sections` row arrays. A row is `{i:<manifest id>,s:<status>,p?:<allowed n/a predicate>,f?:<finding id>}`. Statuses and `p`/`f` placement are the manifest's `vocabulary` (above). The phase parser derives the actual IDs from the returned findings, then invokes `node .asd/runtime.js validate-ledger --manifest <path> --ledger <path> --findings <path>`. The helper rejects a digest mismatch, duplicate, missing, unknown, blank, unauthorized `n/a`, or invented/missing finding reference.

A verdict whose ledger omits a scoped file, omits a checklist item, omits a required section row, or leaves any row blank/unresolved is INVALID — counts as review-incomplete, never as APPROVE.

**Enforcement (phase-workflow gate):** validation runs before the review file is written. Any invalid ledger is rejected and the same reviewer is re-dispatched fresh in the same iteration; its verdict never counts. The generated manifest, not model prose or totals, defines completeness.

**Persistence:** persist the validated compact ledger and immutable manifest beside the verdict/findings report, with relative evidence links. No full prose ledger is generated first; no second compression pass discards the evidence needed for deterministic revalidation.

## Verdict format

Every reviewer ends with exactly one:

- `APPROVE` — no issues at or above floor severity
- `CONCERNS: <list>` — issues exist but the creator can autofix without escalation
- `FAIL: <list>` — issues require escalation or block DoD

Next action: APPROVE → reviewer done · CONCERNS → creator autofixes, next iteration · FAIL → escalate to user.

## Gate Verdict Format (machine-parseable first line)

Reviewers write no review artifact, code or doc — that is why the phase workflow, never the reviewer, writes the review file (tool grants: `providers.md`). Not absolute: `memory: project` is a separate write channel reviewers do use and the host serves. Sole home of this claim — elsewhere cite it, never restate. Every reviewer's **returned findings text** (its final text output) MUST begin (after any preamble) with a single-line verdict token:

```
[REVIEW-<phase>-<reviewer>]: <APPROVE | CONCERNS | FAIL>
```

- `<phase>` = `design` (design-review) or `impl` (impl-review)
- `<reviewer>` = `correctness | efficiency | testing | documentation | external`

Examples: `[REVIEW-impl-correctness]: APPROVE` · `[REVIEW-design-documentation]: FAIL` · `[REVIEW-impl-external]: CONCERNS`

Never bury the verdict in prose. The dispatching phase workflow writes the verdict token, findings, and the validated compact coverage evidence (above) to `<sprint>/reviews/<phase>/iter-NN/<reviewer>.md`; phase orchestration reads the first non-empty content line of that written file. Carve-out: under a split dispatch (below) findings and evidence live in the part files instead, and that path holds the merged token plus links.

## Interrupted dispatch and split dispatch

Applies to the 4 internal reviewers, except where a branch states its own reach (**Late duplicate return**, below, holds for any replaced dispatch, External Review included). What External Review may return at all — its permitted outcomes, its unavailability path, and the disposal of anything else, which imports **Interrupted dispatch** below — is `external-review.md` "Outcome contract".

**Interrupted dispatch.** A dispatch returning no verdict token or no ledger (cut short mid-turn) is not a verdict: no `verdicts["iter-NN"]` entry, no latch. The same reviewer is re-dispatched fresh in the same iteration — identical handling to an invalid ledger ("Coverage ledger" enforcement). The attempt is recorded so the loss is visible rather than silent: the workflow appends `<reviewer> interrupted attempt <count> (<cause>)` to `decisions-log.md` **at the moment of the interruption**, and again when a twice-interrupted half escalates — never deferred to the verdict parse, which an interrupted dispatch never reaches. That log is the durable record; the count is per-iteration working state, never a `state.json` field, and a resume rebuilds it from those entries for the current iteration. The review file finally written for that reviewer additionally carries `Interrupted attempts: <count> (<cause>)`.

**Correlated interruption.** One cause taking every dispatch in flight in an iteration (session-wide limit, host outage) is one iteration-level event, never N per-reviewer attempts. The phase workflow classifies it — it alone sees all dispatches — as: same cause, same moment, every dispatch then in flight; anything narrower stays per-reviewer. It appends `iteration <N> interrupted (<cause>), all dispatches` to `decisions-log.md` once, raises no reviewer's attempt count (so one event never arms the split trigger below), leaves it off every review file's `Interrupted attempts:` line, and re-dispatches every reviewer fresh. A re-dispatch afterwards interrupted on its own is that reviewer's attempt 1.

**Late duplicate return.** A replaced dispatch delivering after its replacement's verdict was recorded is discarded; bookkeeping stays the replacement's. One exception, evidence only: it carries a finding at or above floor contradicting the recorded verdict. The phase workflow, never the returning agent, verifies that finding against source ("Autofix vs escalation"); unverified, discard it. Verified, record it: findings + ledger to `<sprint>/reviews/<phase>/iter-NN/<reviewer>.late.md`, linked from `<reviewer>.md`; `verdicts["iter-NN"]` becomes the more severe of the two tokens (severity order per "Half verdicts, files, merge"); any APPROVE latch for that reviewer cleared; `<reviewer> late return admitted on verified evidence (<finding id>)` appended to `decisions-log.md`. Never the reverse — a late APPROVE never displaces a recorded CONCERNS/FAIL — and a late return never latches.

An internal reviewer is NEVER recorded as skipped and never satisfies DoD without a completed verdict — it is always available, so `APPROVE (skipped: ...)` stays exclusive to an unavailable external provider (`sprint-lifecycle.md` "APPROVE latch" Availability-skip carve-out). Its absent key blocks (`sprint-lifecycle.md` "State recovery").

**Split trigger.** A second consecutive interruption of the same reviewer on the same manifest digest, within one iteration: the manifest is thereby proven too large for one turn. No size threshold — one interruption re-dispatches, two split.

**Partition.** Split the manifest's `files` list into two disjoint halves (manifest order, near-even) and build two complete manifests: own file half, full rubric (`rules`, `sections`), own digest (`manifest-digest --write`), and `n_a` filtered to retained ids **plus, for every rule and section id, the out-of-half predicate `evidence outside this half; covered by <reviewer>.part-N`** — the only truthful status for an id whose evidence that half does not hold. Each half is a whole manifest over its own subset, so `validate-ledger` accepts it unchanged.

**Union property, checked before merge.** The orchestrator checks these by hand, over both half manifests and their validated ledgers against the unpartitioned manifest: (a) the halves' file ids are disjoint and union to exactly the unpartitioned `files` list; (b) `rules`/`sections` equal the unpartitioned arrays in both; (c) no rule or section id carries the out-of-half predicate `evidence outside this half; covered by <reviewer>.part-N` in **both** halves — that means nobody reviewed it. An id the unpartitioned manifest already authorizes `n/a` under a different predicate may be `n/a` in both halves and never blocks the merge; a half holding no evidence for an id records that truthful `n/a`, never a vacuous `pass`. Any check failing blocks the merge — that reviewer counts as incomplete.

**Two fresh dispatches**, one per half ("Clean-context review iteration" holds verbatim). A half interrupted twice escalates to the user; the split is never applied recursively.

**Half verdicts, files, merge.** Each half returns the normal first-line verdict token (above) over its own subset, written to `<sprint>/reviews/<phase>/iter-NN/<reviewer>.part-1.md`/`.part-2.md` with its own findings and validated ledger. The merged `<reviewer>.md` holds the merged token as its first content line plus links to both parts, no content copied — so every reader of that one path is unchanged. Merged verdict = the more severe half token (`FAIL` > `CONCERNS` > `APPROVE`), findings = the union of both halves. `verdicts["iter-NN"]` receives that single merged string; the bare `APPROVE` (hence the latch) requires both halves bare `APPROVE`.

## DoD per review phase

| Phase | Required reviewers (all APPROVE or APPROVE-latched, same iteration) |
|---|---|
| design-review | Correctness, Efficiency, Documentation — dispatched for any non-empty draft set unless APPROVE-latched (below); Correctness's UI rubric section is `n/a: outside phase gate` when no ux-spec/design-system artifact is in scope; External Review (if enabled) |
| impl-review | Correctness, Efficiency, Documentation, Testing — dispatched unless APPROVE-latched (below); External Review (if enabled) |

Every internal reviewer above is dispatched in its listed phase(s) unless already APPROVE-latched. When design-review has no ux-spec/design-system draft, Correctness still dispatches and marks its UI section `n/a: outside phase gate`. Separately, "Diff-scoped impl-review fan-out" below is a section-level mechanism scoped to impl-review only: it never skips a reviewer's dispatch, only marks a rubric SECTION `n/a` inside a still-dispatched reviewer. External Review counts as one reviewer when `review.external_review: enabled`, scoped to whichever draft set actually exists that iteration (`sprint-lifecycle.md` "Optional documents"). PR-phase DoD checks the reviewers this table requires; a section n/a for its phase or predicate is not missing. On DoD met, the phase advances.

**impl-review's DoD has a second, non-reviewer condition**: this table's reviewer roster all APPROVE/latched is necessary but not sufficient — impl-review also requires a green **full test suite**, run exactly once per cycle by its terminal step after the reviewer roster is met (`sprint-lifecycle.md` "Impacted test set"). A red full suite blocks `NEXT: retro` exactly as an unmet reviewer roster would, and additionally clears every APPROVE latch sprint-wide (below).

**APPROVE latch**: a reviewer that already returned `APPROVE` on an earlier iteration of the same review phase is not re-dispatched on a later iteration and counts toward this table's "all APPROVE" requirement exactly as a fresh `APPROVE` would — so DoD stays reachable without re-running it. Persisted state, the dispatch-skip mechanics, and its red-full-suite invalidation are `sprint-lifecycle.md` "APPROVE latch" — sole home, not restated here or in either review workflow.

**Diff-scoped impl-review fan-out** (`review.scoped_fan_out: enabled` — seeded `enabled` by `/asd-init` for NEW projects only; absent from an existing project's `config.yaml` means `disabled` (full fan-out), see `asd-phase-impl-review.md` step 5 for the SSoT): the two diff-derived predicates below no longer skip a reviewer's dispatch — both merged reviewers (Correctness, Efficiency) are always dispatched — they mark a rubric SECTION `n/a: <predicate>` in that reviewer's section-coverage ledger, so the agent never loads that domain's inputs for the n/a'd section. Correctness's UI conformance section is marked n/a only when no file in the iteration's scope list is a UI surface; Efficiency's five performance sections are marked n/a only when both no perf-budgets section exists in `custom-coding-rules.md` and the scope list contains no executable file (conjunctive). A section-level skip is recorded within the reviewer's own returned ledger, never as a separate `state.json` verdict value — the reviewer still returns one verdict token covering its dispatched sections. Satisfied-vs-blocking semantics for the reviewer's overall verdict: `sprint-lifecycle.md` "State recovery". The n/a'd section is re-included automatically the moment a qualifying file re-enters the diff. `review.scoped_fan_out: disabled` restores unconditional review of every section, exactly as if this paragraph did not exist.

Correctness reviewer traces AC-N coverage against PRD AC-N when `documents.prd` enabled, else against `sprint.md`'s own AC-N list (`sprint-lifecycle.md` "Optional documents"). Impl-review's Correctness UI section always applies regardless of `ux_spec` — absence of a ux-spec draft never implies absence of UI code to review; it checks against accessibility.html/DESIGN.md directly when no ux-spec exists; when `review.scoped_fan_out: enabled`, the section is included or marked n/a per the diff-derived UI-surface predicate above, never per `documents.ux_spec`. Documentation reviewer, in `self_hosting: enabled` mode, additionally checks `README.md`/`.asd/rules/**` consistency against the framework diff, independent of persistent docs.
