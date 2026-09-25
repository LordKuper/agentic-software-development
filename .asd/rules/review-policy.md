# Review Policy

## Severity levels

| Level | Definition | Example |
|---|---|---|
| critical | breaks build, security hole, data loss, contract violation | unhandled secret leak, broken migration |
| high | wrong behavior, missing acceptance criterion, test gap on core path | AC-3 not implemented |
| medium | bad pattern with concrete risk, weak edge-case coverage | shared mutable state, no test for empty input |
| low | style, minor clarity, micro-inefficiency | naming inconsistency |

## Iteration severity floor

Config sets `iterations_<severity>` (default: low=1, medium=1, high=2, critical=10). Each tier gets its own consecutive iteration budget in order low → medium → high → critical. On iteration N, the floor is the tier whose **cumulative budget** first covers N. Only findings at floor severity or higher count.

`N` is the **phase-local** counter — `reviews.design.iteration`, or in impl-review the current review wave's counter (`sprint-lifecycle.md` "Review iteration counters"). Each review phase computes its floor from its own counter; each wave has its own floor and cap.

Cumulative budgets with defaults:

- low: cum 1 → iter 1 → floor=low (all)
- medium: cum 2 → iter 2 → floor=medium (drop low)
- high: cum 4 → iters 3-4 → floor=high (drop low, medium)
- critical: cum 14 → iters 5-14 → floor=critical (drop low, medium, high)
- iter ≥ 15 → stop, escalate to user

User may override the cap (per wave in impl-review). On override the counter keeps incrementing (not reset); floor stays pinned at `critical`, so extra rounds do not re-admit lower-severity findings.

## Clean-context review iteration

Every iteration dispatches each reviewer as a **fresh agent invocation** — new context, no carry-over from authoring or prior iterations. Isolates each verdict from creator reasoning and earlier rounds.

- The dispatching phase workflow spawns every required reviewer (and External Review) anew each iteration, unless that reviewer is APPROVE-latched (`sprint-lifecycle.md` "APPROVE latch") — a latched reviewer is not dispatched at all this iteration, never reused or resumed either.
- Reviewer payload carries only: its own emitted manifest path, plus its `.diff` path when one is written ("Scope hand-off"); rule references, severity floor, iteration number, context paths, and — on a re-dispatch — that reviewer's own interrupted-attempt record for this iteration (count and cause, rebuilt from `decisions-log.md` per "Interrupted dispatch"), when it has one. Never authoring rationale or prior verdicts.
- **Scope**: "Scope hand-off" (below).
- Reviewers MUST NOT read another iteration's review files, any wave's. Only the current iteration directory.
- Incremental scoping, in both review phases (iter 2+ reviews only what changed — impl-review since the wave's previous recorded iteration HEAD, `sprint-lifecycle.md` "Review iteration counters"; design-review since its draft snapshot), narrows the *input*, not context. Agent still fresh.
- Where a reviewer genuinely needs prior-iteration data (External Review stalemate detection), the phase workflow supplies it as explicit payload input — scoped data, not context carry-over.

## Scope hand-off

Sole statement, both review phases, every reviewer — the 4 internal reviewers and External Review. Workflows, agents, external prompts and README link here.

1. **List** — the reviewer's file list, written by `node .asd/runtime.js emit-manifest` per reviewer (impl-review: per wave; built as "Reviewer responsibility" states; External Review's scope manifest: `external-review.md` "Phase-scoped payload"), is its only normative scope: its ledger file rows and its valid finding locations. Never a second list, never diff text in the payload.
2. **Diff** — the `<fingerprint>.diff` file `emit-manifest` writes beside it for exactly that list — named by its inputs, so manifests sharing a list and range share one file, and rewritten at every emit, so a reused iteration directory never serves an older file under that name — is the change content, deletions included, read on demand. impl-review: every iteration, over the iteration's range (`sprint-lifecycle.md` "Review iteration counters"). design-review: from iteration 2, against the previous iteration's draft snapshot (`--snapshot`); none at iteration 1 — the drafts are wholly new, so a diff would only duplicate them.
3. **Whole files** — any file, listed or not, is readable as context when the diff is not enough. An unlisted path stays out of scope — for an internal reviewer, save the Change-surface exception below.

No reviewer — the wrapped CLI included — runs git to derive, widen or narrow its scope, and no payload tells it to.

## Change-surface rule

Review, at every phase, covers only the change surface — the iteration's diff (impl-review) or draft set (design-review) — never the whole project. A finding about code/content outside that surface is invalid, with one exception: the change itself made that unchanged code/content incorrect (e.g. a renamed function left a caller elsewhere broken). Sole statement of the rule; reviewer agents and workflows link here.

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

**Verify before applying.** A reviewer's proposed fix is a claim about source, not an instruction: the fixer re-reads the cited path/symbol and confirms the finding's premise holds at current `HEAD` before applying anything. The suggested fix is non-binding. An equivalent correct fix stays permitted, as does a different fix that resolves the finding; an unverified transcription does not. Premise false → apply nothing and report the mismatch in the completion signal, never a silent drop. Premise true but prescription wrong → fix the real defect and say so in the commit body.

**Where the fix happens:**
- **design-review** — the creator (asd-ba / asd-ux / asd-architect) autofixes within the loop; iteration advances.
- **impl-review** — fixes NOT applied inside the review phase. impl-review routes the sprint back to `impl` (review-fix mode); the responsible dev resolves findings; sprint re-enters impl-review via `impl-test`.

**Escalation required** (the main orchestrator asks the user before fix — `core.md` "Request user decision"), format = Complication Approval (`core.md`):

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

Applies to all 4 internal reviewers (NOT External Review — same list and diff, "Scope hand-off", but no rubric and no ledger). Before any verdict, the reviewer MUST emit a coverage ledger proving exhaustive review. Reviewer MUST NOT emit a final verdict while its ledger is incomplete.

The phase workflow emits an ordered machine manifest per internal reviewer before dispatch with `node .asd/runtime.js emit-manifest --reviewer <name> --phase <design-review|impl-review> --files <path to a file listing the scope files, one per line> --out <review output dir> [--custom-rules <path,...>] [--test-plan <path,...>] [--base <sha> --head <sha> [--full-files <path> --full-base <sha>]] [--snapshot <previous iteration dir>] [--self-hosting]` — the sole manifest source; never hand-assembled; `--self-hosting` is passed when `config.self_hosting: enabled`. From the scope it builds this reviewer's file list ("Reviewer responsibility"). It enumerates every file in that list, every stable reviewer-rubric/custom-rule ID (a custom rule's id is the `--custom-rules` path as passed), the rubric's section IDs (its `###` headings; none for an unsectioned rubric), and the **allowed `n/a` predicates per individual ID** — the standing predicates, whose target ids and classifier member lists live only in `.asd/runtime.js` (`NA_TARGETS`, `isUiSurface`, `isExecutable`, `isTemplated`); their text is owned by `NA_PREDICATES` there, and any canon quote of it must match — e.g. Documentation's Framework mode is `n/a: self_hosting not enabled` without `--self-hosting`, and its Template adherence is `n/a: no templated artefact in scope` when no scope file is templated. **Rubric ID derivation**: a reviewer's rubric IDs are the top-level entries of its agent file's `## Review rubric` — each `###` heading where that rubric is sectioned, else each bullet's bold lead-in label — in file order, the heading or label text verbatim as the id; nothing nested under an entry is enumerated separately. They are stable because the text IS the id: adding, renaming or deleting an entry is a canonical agent edit that moves the manifest in the same change, and an entry outside this phase or this diff's scope is still enumerated, carrying an authorized `n/a` predicate rather than being dropped. The manifest contains its SHA-256 digest, calculated by `.asd/runtime.js` over the manifest excluding `digest` — `emit-manifest` stamps it, `node .asd/runtime.js manifest-digest --manifest <path>` verifies it; a reviewer cannot replace it. **Immutability**: a dispatched manifest is immutable for the life of that dispatch, to the orchestrator as to the reviewer. Correcting it takes a fresh dispatch carrying a newly emitted manifest, never a re-stamp of the dispatched one.

**Pure-rename row.** `--base/--head` apply to impl-review only. With them, `emit-manifest` also writes the manifest's `.diff` ("Scope hand-off") and authorizes `NA_PREDICATES.pureRename` in `n_a.files` for each listed file the range renames with identical content and mode. That file's row is then the compact `n/a` row. The runtime proves the class; a reviewer asserting it anywhere else is an unauthorized `n/a`. The rename is neutral for the file, not for its referrers — the Change-surface exception covers those.

**Manifest `vocabulary`** — the row vocabulary travels inside the manifest, so a reviewer reads it off its own input instead of recalling prose:

`"vocabulary": {"files": [...], "rules": [...], "sections": [...], "p": "<the single status that carries p>", "f": "<the single status that carries f>"}`

Per-row-type status list plus the placement rule: `p` is required on the one status named by `p` and forbidden on every other, likewise `f`. This rule fixes the shape only; values come from `.asd/runtime.js`'s one exported vocabulary constant, shared by emitter and validator so published and enforced vocabulary cannot drift. Two more published constants travel beside it on those same seams: one filled row, built from the same constant, `"row_example": {"i": "<manifest id>", "s": "<the single status that carries p>", "p": "<allowed n/a predicate>"}`; and the shape `n_a` is keyed by — row type, then manifest id, then its allowed predicate list — `"n_a_shape": {"<files|rules|sections>": {"<manifest id>": ["<allowed n/a predicate>"]}}`. Each published constant is **required** in every emitted manifest and **optional** to `validate-ledger`: absent → validated as before; present → must equal the validator's own constant, mismatch rejected. Digest-covered like every other manifest field.

The reviewer returns one compact JSON ledger: `manifest_digest`, `findings` (the exact finding IDs), and `files`/`rules`/`sections` row arrays. A row is `{i:<manifest id>,s:<status>,p?:<allowed n/a predicate>,f?:<finding id>}`. Statuses and `p`/`f` placement are the manifest's `vocabulary`, one filled row its `row_example` (both above). The phase parser derives the actual IDs from the returned findings, then invokes `node .asd/runtime.js validate-ledger --manifest <path> --ledger <path> --findings <path>` — `--ledger` takes the reviewer's returned text as-is (its one fenced ledger block is read) or bare JSON; `--findings` is that derived id array, never the ledger's own `findings`. The helper rejects a digest mismatch, duplicate, missing, unknown, blank, unauthorized `n/a`, or invented/missing finding reference. Those eight partition by what the return already holds. **Incomplete or unverifiable** — digest mismatch, missing row, unauthorized `n/a`, invented or missing finding reference, and a row whose status the return never supplied: re-encoding cannot supply the evidence they lack. **Wrong shape, complete content** — a duplicate row agreeing with its twin, a row for an id outside the manifest, a populated row under wrong keys or types: every manifest id already carries a truthful authorized resolution and only the container is wrong.

A verdict whose ledger omits a scoped file, omits a checklist item, omits a required section row, or leaves any row blank/unresolved is INVALID — counts as review-incomplete, never as APPROVE.

**Enforcement (phase-workflow gate):** validation runs before the review file is written; no verdict counts until it passes. A first failure earns one transcription, performed by the phase workflow: re-encode the returned ledger into the required shape — drop rows outside the manifest, collapse agreeing duplicates, re-key values the return already carries — then re-run the helper. Transcription never supplies a status, predicate or finding id the return did not carry, and never runs twice on one return. Re-run passes: the transcript is the persisted ledger, the verdict counts, and the workflow appends the deviation as a friction entry naming the reviewer and the shape defect. Re-run fails: the ledger is rejected and the same reviewer is re-dispatched fresh in the same iteration. So the re-run, not a failure message, decides which half of the partition a return fell in — the generated manifest, not model prose or totals, defines completeness.

**Persistence:** persist the validated compact ledger and immutable manifest beside the verdict/findings report, with relative evidence links. No full prose ledger is generated first; no second compression pass discards the evidence needed for deterministic revalidation.

## Verdict format

Every reviewer ends with exactly one:

- `APPROVE` — no issues at or above floor severity
- `CONCERNS: <list>` — issues exist but the creator can autofix without escalation
- `FAIL: <list>` — issues require escalation or block DoD

Next action: APPROVE → reviewer done · CONCERNS → creator autofixes, next iteration · FAIL → escalate to user.

## Gate Verdict Format (machine-parseable first line)

Reviewers write no review artifact, code or doc — that is why the phase workflow, never the reviewer, writes the review file (tool grants: `providers.md`). Not absolute: `memory: project` is a separate write channel reviewers do use and the host serves. Sole statement of that scope in canon — what the read-only claim covers and the one channel it excludes; canon acting sites state only the write they perform, `providers.md` only the tool grants. Hand-authored agent memory is outside canon and outside this claim (`artifact-layout.md` "Agent memory"). Every reviewer's **returned findings text** (its final text output) MUST begin (after any preamble) with a single-line verdict token:

```
[REVIEW-<phase>-<reviewer>]: <APPROVE | CONCERNS | FAIL>
```

- `<phase>` = `design` (design-review) or `impl` (impl-review)
- `<reviewer>` = `correctness | efficiency | testing | documentation | external`
- External Review's first line may also be the skip form, per `external-review.md` "Outcome contract"

Examples: `[REVIEW-impl-correctness]: APPROVE` · `[REVIEW-design-documentation]: FAIL` · `[REVIEW-impl-external]: CONCERNS`

**Reviewer question carrier.** A reviewer never returns a bare `QUESTION` — without the verdict token it reads as an interrupted dispatch ("Interrupted dispatch"). A question needing the user stays in the verdict-bearing report, listed under `t_review.md`'s `## Escalations` as `question: <text>; options: <a> / <b> …`; the review workflow asks the user before routing that iteration and writes each answer into that reviewer's review file directly under its item, as `  answer: <text>` — the fixer reads it as part of that reviewer's finding set. A reviewer holding an open question returns at least `CONCERNS`, never `APPROVE`, so the answer rides with its findings into the fix route and no latch drops it.

The dispatching phase workflow writes the verdict token, findings, and the validated compact coverage evidence (above) to `<sprint>/reviews/<phase>/[wave-<K>/]iter-NN/<reviewer>.md`; phase orchestration reads the first non-empty content line of that written file.

## Interrupted dispatch

Applies to the 4 internal reviewers, except where a branch states its own reach (**Late duplicate return**, below, holds for any replaced dispatch, External Review included). What External Review may return at all — its permitted outcomes, its unavailability path, and the disposal of anything else, which imports **Interrupted dispatch** below — is `external-review.md` "Outcome contract". `<id>` below is the iteration id (`sprint-lifecycle.md` "Review iteration counters").

**Interrupted dispatch.** A dispatch returning no verdict token or no ledger (cut short mid-turn) is not a verdict: no `verdicts["iter-NN"]` entry, no latch. The same reviewer is re-dispatched fresh in the same iteration — identical handling to a rejected ledger, never the transcription branch, which has no returned ledger to re-encode ("Coverage ledger" enforcement). The attempt is recorded so the loss is visible rather than silent: the workflow appends `<reviewer> interrupted attempt <count> in <id> (<cause>)` to `decisions-log.md` **at the moment of the interruption** — never deferred to the verdict parse, which an interrupted dispatch never reaches. That log is the durable record; the count is per-iteration working state, never a `state.json` field, and a resume rebuilds it from those entries for the current iteration, in the live log (`artifact-layout.md` "Decisions log"). The review file finally written for that reviewer additionally carries `Interrupted attempts: <count> (<cause>)`.

**Escalation.** A second consecutive interruption of the same reviewer on the same manifest digest within one iteration requests a user decision: retry fresh or abort. The manifest is never split or narrowed; each further consecutive interruption asks again.

**Correlated interruption.** One cause taking every dispatch in flight in an iteration (session-wide limit, host outage) is one iteration-level event, never N per-reviewer attempts. The phase workflow classifies it — it alone sees all dispatches — as: same cause, same moment, every dispatch then in flight; anything narrower stays per-reviewer. It appends `iteration <id> interrupted (<cause>), all dispatches` to `decisions-log.md` once, raises no reviewer's attempt count (so one event never arms the escalation above), leaves it off every review file's `Interrupted attempts:` line, and re-dispatches every reviewer fresh. A re-dispatch afterwards interrupted on its own is that reviewer's attempt 1.

**Late duplicate return.** A replaced dispatch delivering after its replacement's verdict was recorded is discarded; bookkeeping stays the replacement's. One exception, evidence only: it carries a finding at or above floor contradicting the recorded verdict. The phase workflow, never the returning agent, verifies that finding against source ("Autofix vs escalation"); unverified, discard it. Verified, record it: findings + ledger to `<reviewer>.late.md` in the replaced dispatch's iteration directory, linked from `<reviewer>.md`; `<reviewer> late return admitted on verified evidence (<finding id>)` appended to `decisions-log.md`; `verdicts["iter-NN"]` becomes the more severe of the two tokens (`FAIL` > `CONCERNS` > `APPROVE`); any APPROVE latch for that reviewer cleared. A return for a closed review wave leaves that wave's `verdicts` and `latched` untouched; its `<reviewer>.late.md` goes to the current iteration's directory instead, still linked from the closed wave's `<reviewer>.md`, so its finding joins the current wave's unresolved set and reaches review-fix. Never the reverse — a late APPROVE never displaces a recorded CONCERNS/FAIL — and a late return never latches.

An internal reviewer is NEVER recorded as skipped and never satisfies DoD without a completed verdict — it is always available, so `APPROVE (skipped: ...)` stays exclusive to External Review (`sprint-lifecycle.md` "APPROVE latch" Availability-skip carve-out). Its absent key blocks (`sprint-lifecycle.md` "State recovery").

## Reviewer responsibility

Sole owner map: each concern below has exactly one reviewer; agent rubrics hold the detail. "Receives" is the reviewer's manifest file list, built from the iteration's scope by `.asd/runtime.js` `reviewerFiles`.

| Reviewer | design-review: judges · receives | impl-review: judges · receives |
|---|---|---|
| Correctness | draft correctness (AC completeness, contract and ADR decision soundness), UI conformance of ux-spec/design-system drafts · every scoped draft | bugs, security, contracts, best practices, AC→code trace, UI conformance · every scope file |
| Efficiency | over-engineering, structure/cohesion, complexity-vs-value · every scoped draft | the same plus performance · every scope file |
| Testing | not dispatched; testability is unowned in design-review — no tests exist before impl | test-plan decisions, AC→check coverage, edge cases, manual-verification necessity · the `isTest` scope files plus `test-plan.md` and its segments (`--test-plan`) |
| Documentation | SSoT, template adherence, provenance, traceability, custom rules, documentation economy · every scoped draft | the same plus persistent-doc actuality, in-code doc comments, stub resolution, Framework mode · every scope file |
| External Review | the wrapped CLI's own review · every scope file ("Scope hand-off") plus carried-over `Unreviewed files` (`external-review.md` "Iteration semantics") | same |

## DoD per review phase

| Phase | Required reviewers (all APPROVE or APPROVE-latched, same iteration; External Review's skip form counts, `external-review.md` "Outcome contract") |
|---|---|
| design-review | Correctness, Efficiency, Documentation — dispatched for any non-empty draft set unless APPROVE-latched (below); Correctness's UI rubric section is `n/a: outside phase gate` when no ux-spec/design-system artifact is in scope; External Review (if enabled) |
| impl-review | Correctness, Efficiency, Documentation, Testing — dispatched unless APPROVE-latched (below); External Review (if enabled) — met in every review wave, in order (`sprint-lifecycle.md` "Review iteration counters") |

Every internal reviewer above is dispatched in its listed phase(s) unless already APPROVE-latched. When design-review has no ux-spec/design-system draft, Correctness still dispatches and marks its UI section `n/a: outside phase gate`. Separately, "Diff-scoped impl-review fan-out" below is a section-level mechanism scoped to impl-review only: it never skips a reviewer's dispatch, only marks a rubric SECTION `n/a` inside a still-dispatched reviewer. External Review counts as one reviewer when `review.external_review: enabled`, scoped to whichever draft set actually exists that iteration (`sprint-lifecycle.md` "Optional documents"). PR-phase DoD checks the reviewers this table requires; a section n/a for its phase or predicate is not missing. On DoD met, the phase advances.

**impl-review's DoD has a second, non-reviewer condition**: this table's reviewer roster all APPROVE/latched in every wave is necessary but not sufficient — impl-review also requires a green **full test suite**, run exactly once per cycle by its terminal step after the last wave's roster is met (`sprint-lifecycle.md` "Impacted test set"). A red full suite blocks `NEXT: retro` exactly as an unmet reviewer roster would.

**APPROVE latch**: a reviewer that already returned `APPROVE` on an earlier iteration of the same review phase (impl-review: same wave) is not re-dispatched on a later iteration and counts toward this table's "all APPROVE" requirement exactly as a fresh `APPROVE` would — so DoD stays reachable without re-running it. Persisted state and the dispatch-skip mechanics are `sprint-lifecycle.md` "APPROVE latch" — not restated here.

**Diff-scoped impl-review fan-out** (always on; `asd-phase-impl-review.md` step 5 is the SSoT): the two diff-derived predicates below never skip a reviewer's dispatch — both merged reviewers (Correctness, Efficiency) are always dispatched — they mark a rubric SECTION `n/a: <predicate>` in that reviewer's section-coverage ledger, so the agent never loads that domain's inputs for the n/a'd section. Correctness's UI conformance section is marked n/a only when no file in the iteration's scope list is a UI surface; Efficiency's five performance sections are marked n/a only when both no perf-budgets section exists in `custom-coding-rules.md` and the scope list contains no executable file (conjunctive). A section-level skip is recorded within the reviewer's own returned ledger, never as a separate `state.json` verdict value — the reviewer still returns one verdict token covering its dispatched sections. Satisfied-vs-blocking semantics for the reviewer's overall verdict: `sprint-lifecycle.md` "State recovery". The n/a'd section is re-included automatically the moment a qualifying file re-enters the diff.

Correctness's AC→code trace and Testing's AC→check coverage read PRD AC-N when `documents.prd` enabled, else `sprint.md`'s own AC-N list (`sprint-lifecycle.md` "Optional documents"). Impl-review's Correctness UI section always applies regardless of `ux_spec` — absence of a ux-spec draft never implies absence of UI code to review; it checks against accessibility.html/DESIGN.md directly when no ux-spec exists; the section is included or marked n/a per the diff-derived UI-surface predicate above, never per `documents.ux_spec`. Documentation reviewer, in `self_hosting: enabled` mode, additionally checks `README.md`/`.asd/rules/**` consistency against the framework diff, independent of persistent docs.
