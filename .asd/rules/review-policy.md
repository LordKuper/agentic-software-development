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

Three parts (template `t_review.md`); the third applies only to a reviewer that declares named rubric sections (Correctness, Efficiency — Testing and Documentation have none):

1. **File coverage** — every file in review scope listed once. Scope = the iteration's diff file list (impl-review) or the draft set under review (design-review), supplied in dispatch payload. Each file marked `checked` (reviewed against every applicable rubric item) or `n/a: <reason>` (outside this reviewer's concern, e.g. the correctness reviewer's UI section on a backend-only file). No scoped file omitted or left blank.
2. **Rule coverage** — every item in this reviewer's checklist (its agent Review rubric + any `.asd/project/custom-*-rules.md`) listed once, each marked `pass`, `finding #<n>`, or `n/a: <reason>`. No item omitted or blank.
3. **Section coverage** (Correctness, Efficiency only) — one row per named rubric section in the reviewer's own agent file, every dispatch: `reviewed` (findings/pass already recorded under file+rule coverage above) or `n/a: <reason>`, reason one of `outside phase gate` (section not on this phase's allowed-section list), the diff-derived predicate name that n/a'd it (`review-policy.md` "Diff-scoped impl-review fan-out"), or a target-artefact-missing note. No section omitted or left blank, regardless of `review.scoped_fan_out`.

A verdict whose ledger omits a scoped file, omits a checklist item, omits a required section row, or leaves any row blank/unresolved is INVALID — counts as review-incomplete, never as APPROVE.

**Enforcement (phase-workflow gate):** the dispatching phase workflow validates each internal reviewer's ledger — read from the reviewer's returned text, before that text is written to the review file — against the known scope file list, and, for Correctness/Efficiency, against that phase's rubric-section list. Any reviewer whose ledger omits a scoped file, has an unresolved/blank rule row, or (Correctness/Efficiency) omits/blanks a section row → review rejected, nothing written → re-dispatch that reviewer (fresh) this same iteration. Verdict not counted, file not written, until ledger complete. Makes coverage fail-proof: a skipped file, unchecked rule, or unresolved section cannot pass silently. Gate always runs on the reviewer's full **returned** ledger — unaffected by what gets persisted below.

**Persistence (compression, gate unaffected):** the returned ledger, once validated, is never written to disk in full. The dispatching phase workflow persists only: a coverage summary line (`files: {{checked}}/{{total}} checked, {{n/a}} n/a · rules: {{pass}}/{{total}}, {{findings}} findings`, plus for Correctness/Efficiency `· sections: {{reviewed}}/{{total}}, none blank`), the full `n/a` list verbatim (file, rule, and section rows, with reason), and every rule-coverage row resolved `finding #N` verbatim. `checked`/`pass`/`reviewed` rows carry no information beyond the count and are dropped from the written file. This is a write-time reduction only — the gate above always validates the reviewer's full returned text, never the reduced written form.

## Verdict format

Every reviewer ends with exactly one:

- `APPROVE` — no issues at or above floor severity
- `CONCERNS: <list>` — issues exist but the creator can autofix without escalation
- `FAIL: <list>` — issues require escalation or block DoD

Next action: APPROVE → reviewer done · CONCERNS → creator autofixes, next iteration · FAIL → escalate to user.

## Gate Verdict Format (machine-parseable first line)

Reviewers are read-only (`providers.md`): a reviewer never writes its own review file. Every reviewer's **returned findings text** (its final text output) MUST begin (after any preamble) with a single-line verdict token:

```
[REVIEW-<phase>-<reviewer>]: <APPROVE | CONCERNS | FAIL>
```

- `<phase>` = `design` (design-review) or `impl` (impl-review)
- `<reviewer>` = `correctness | efficiency | testing | documentation | external`

Examples: `[REVIEW-impl-correctness]: APPROVE` · `[REVIEW-design-documentation]: FAIL` · `[REVIEW-impl-external]: CONCERNS`

Never bury the verdict in prose. The dispatching phase workflow writes the verdict token, findings, and the reduced coverage form (above) to `<sprint>/reviews/<phase>/iter-NN/<reviewer>.md`; PM reads the first non-empty content line of that written file.

## DoD per review phase

| Phase | Required reviewers (all APPROVE or APPROVE-latched, same iteration) |
|---|---|
| design-review | Correctness (UI rubric section only, conditional on the draft set including ux-spec or design-system artifacts), Efficiency (over-engineering + structure/cohesion + complexity-vs-value tradeoff sections), Documentation — all dispatched for any non-empty draft set unless APPROVE-latched (below); External Review (if enabled) |
| impl-review | Correctness, Efficiency, Documentation, Testing — dispatched unless APPROVE-latched (below); External Review (if enabled) |

Every internal reviewer above is dispatched in its listed phase(s) unless already APPROVE-latched (below) — see "Diff-scoped impl-review fan-out" below for the separate, section-level mechanism: what used to skip an agent now skips only a rubric SECTION inside a still-dispatched reviewer. External Review counts as one reviewer when `review.external_review: enabled`, scoped to whichever draft set actually exists that iteration (`sprint-lifecycle.md` "Optional documents"). PR-phase DoD checks only the reviewers/sections this table actually required for the sprint's document profile — a section never applicable (e.g. Correctness's UI section with no ux-spec) is not counted as missing. On DoD met, the phase advances.

**impl-review's DoD has a second, non-reviewer condition**: this table's reviewer roster all APPROVE/latched is necessary but not sufficient — impl-review also requires a green **full test suite**, run exactly once per cycle by its terminal step after the reviewer roster is met (`sprint-lifecycle.md` "Impacted test set"). A red full suite blocks `NEXT: pr` exactly as an unmet reviewer roster would, and additionally clears every APPROVE latch sprint-wide (below).

**APPROVE latch**: a reviewer that already returned `APPROVE` on an earlier iteration of the same review phase is not re-dispatched on a later iteration and counts toward this table's "all APPROVE" requirement exactly as a fresh `APPROVE` would — so DoD stays reachable without re-running it. Persisted state, the dispatch-skip mechanics, and its red-full-suite invalidation are `sprint-lifecycle.md` "APPROVE latch" — sole home, not restated here or in either review workflow.

**Diff-scoped impl-review fan-out** (`review.scoped_fan_out: enabled` — seeded `enabled` by `/asd-init` for NEW projects only; absent from an existing project's `config.yaml` means `disabled` (full fan-out), see `asd-phase-impl-review.md` step 5 for the SSoT): the two diff-derived predicates below no longer skip a reviewer's dispatch — both merged reviewers (Correctness, Efficiency) are always dispatched — they mark a rubric SECTION `n/a: <predicate>` in that reviewer's section-coverage ledger, so the agent never loads that domain's inputs for the n/a'd section. Correctness's UI conformance section is marked n/a only when no file in the iteration's scope list is a UI surface; Efficiency's five performance sections are marked n/a only when both no perf-budgets section exists in `custom-coding-rules.md` and the scope list contains no executable file (conjunctive). A section-level skip is recorded within the reviewer's own returned ledger, never as a separate `state.json` verdict value — the reviewer still returns one verdict token covering its dispatched sections. Satisfied-vs-blocking semantics for the reviewer's overall verdict: `sprint-lifecycle.md` "State recovery". The n/a'd section is re-included automatically the moment a qualifying file re-enters the diff. `review.scoped_fan_out: disabled` restores unconditional review of every section, exactly as if this paragraph did not exist.

Correctness reviewer traces AC-N coverage against PRD AC-N when `documents.prd` enabled, else against `sprint.md`'s own AC-N list (`sprint-lifecycle.md` "Optional documents"). Impl-review's Correctness UI section always applies regardless of `ux_spec` — absence of a ux-spec draft never implies absence of UI code to review; it checks against accessibility.html/DESIGN.md directly when no ux-spec exists; when `review.scoped_fan_out: enabled`, the section is included or marked n/a per the diff-derived UI-surface predicate above, never per `documents.ux_spec`. Documentation reviewer, in `self_hosting: enabled` mode, additionally checks `README.md`/`.asd/rules/**` consistency against the framework diff, independent of persistent docs.
