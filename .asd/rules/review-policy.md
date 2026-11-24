# Review Policy

## Severity levels

| Level | Definition | Example |
|---|---|---|
| critical | breaks build, security hole, data loss, contract violation | unhandled secret leak, broken migration |
| high | wrong behavior, missing acceptance criterion, test gap on core path | AC-3 not implemented |
| medium | bad pattern with concrete risk, weak edge-case coverage | shared mutable state, no test for empty input |
| low | style, minor clarity, micro-inefficiency | naming inconsistency |

## Iteration severity floor

Config sets `iterations_<severity>` (default: low=1, medium=1, high=2, critical=10). Each tier gets its own consecutive iteration budget in order low → medium → high → critical. On iteration N, the floor is the tier whose **cumulative budget** first covers N. Only findings at floor severity or higher count: a below-floor observation goes neither in the Findings table nor in the ledger's `findings`, and an APPROVE report's Findings table is empty.

`N` is the **phase-local** counter — `reviews.design.iteration`, or in impl-review the current review wave's counter (`sprint-lifecycle.md` "Review iteration counters") minus that wave's amendment base `A` from a `floor_base=wave-<K>/<A>` record (`sprint-lifecycle.md` "Scope amendment"). Each review phase computes its floor and cap from its own `N`; each wave has its own floor and cap.

Cumulative budgets with defaults:

- low: cum 1 → iter 1 → floor=low (all)
- medium: cum 2 → iter 2 → floor=medium (drop low)
- high: cum 4 → iters 3-4 → floor=high (drop low, medium)
- critical: cum 14 → iters 5-14 → floor=critical (drop low, medium, high)
- iter ≥ 15 → stop, escalate to user

User may override the cap (per wave in impl-review). On override the counter keeps incrementing (not reset); floor stays pinned at `critical` until a later scope amendment rebases `N` (above), so extra rounds do not re-admit lower-severity findings.

## Clean-context review iteration

- Dispatch every required reviewer fresh each iteration, except APPROVE-latched reviewers (`sprint-lifecycle.md` "APPROVE latch"). Reviewers read only the current iteration's reports.
- Use `agent-protocol.md` "Dispatch payload" with this workflow's `## Dispatch` keys and "Scope hand-off" below. Set `interrupted` only on re-dispatch, from `decisions-log.md` ("Interrupted dispatch"). Keep `answers`, `advice` and `consults_left` empty. Route reviewer questions via `question:` ("Gate Verdict Format").
- Iteration 2+ narrows the input to changes since the previous iteration's draft snapshot or wave HEAD. Pass required prior-iteration data explicitly (External Review's stalemate findings). Exclude authoring rationale and prior verdicts.

## Scope hand-off

Every reviewer and wrapped CLI uses:

1. **List**: only the per-reviewer `emit-manifest` file list defines ledger rows and valid finding paths, subject to "Change-surface rule". Never supply a second list or paste diffs.
2. **Diff**: read emitted `<fingerprint>.diff` on demand, including deletions. Same list/range shares a file, rewritten every emit. Impl-review uses the iteration range every time. Design iteration 1 reads whole drafts; later iterations use `--snapshot` (missing copy is an addition). Nonempty deltas require nonempty patches.
3. **Context**: open whole files when needed, without expanding scope. Never use git to calculate or alter scope.

**Base ref.** Under `self_hosting`, each reviewer's `context` bundle and `emit-manifest` take `--base-ref origin/<git.base_branch>`: the bundle's `review-policy.md`, `external-review.md` and `t_reliability-checklist.md` and each rubric then come from that ref, so a sprint cannot weaken the rules judging it. Limitation: the host-loaded reviewer definition body stays the working-tree view.

## Change-surface rule

Review the iteration diff or draft set. Out-of-surface findings qualify only for a regression caused by the change, or an internal reviewer's observed defect in unchanged code predating the sprint diff. Report the latter with Description prefix `pre-existing:`; External Review never uses it. Route per impl-review.

**Diff reachability.** The orchestrator commits reviewer memory with its report, memory-fix edits on return, and shared files held by a concurrent co-author when their writers cannot commit them (`git-strategy.md` "Commit before review"). They reach the next iteration or PR diff.

**Test-request and suppression findings.**

- A finding asking for a test, or more tests, names the failure mode it catches and the existing tests checked against it; without both it is invalid and never routed to a fix round.
- A suppression or weakened check (a disabled, skipped or downgraded lint rule, type check, test or validator; an inline suppression) the reviewed diff adds with no recorded user decision is a `high` finding. Ban and exception: `code-style.md` §5; the decision is the quality-waiver gate (`checkpoints.md` "Gate policy").

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

Default: the responsible fixer autofixes any reviewer issue without user prompt — the main orchestrator for a design draft, `asd-dev`/`asd-tester` for code and tests.

### Verify before applying

Re-read cited source at current `HEAD`. False premise → no edit, report mismatch. True premise with wrong prescription → fix the defect and explain in commit body. Choose a verified fix within the over-engineering checklist; no callee guards for caller-excluded cases.

**Consumer search.** A review-fix that changes a rule other files consume searches for every consumer of that rule's home, updates them in the same commit, and lists them in its completion signal.

**Deduplication.** Before fix routing, findings from different reviewers that name the same target and the same claim merge into one fix item carrying every source finding id and the highest severity.

**Reach findings.** A finding about a rule's reach is fixed in one pass at every branch of its site: each branch states its own reach, never inheriting it from a section or step header.

### Memory-fix dispatch

(Claude only). Route review findings, leftover terms and `memory-check` hits in `.claude/agent-memory/<owner>/` to the owner locally before phase COMPLETED (named step or originating commit). Never use a defect round, review-fix or extra iteration. One fresh dispatch per owner with all items, serial by lowest finding ID, then hit-only owners by name. Only the owner authors memory; with no write grant it returns `MEMORY-FIX <path>` containing replacement text, applied verbatim by the orchestrator. No verdict. Orchestrator commits when owner lacks commit grant and always logs the fix plus `resolved: <finding id, …> — memory-fix, <YYYY-MM-DD>` in each affected report. For retired owners, orchestrator deletes stale files/directory, commits and logs.

**Where the fix happens:**
- **design-review** — the main orchestrator autofixes the drafts it authored within the loop; iteration advances. A memory finding: "Memory-fix dispatch".
- **impl-review** — fixes NOT applied inside the review phase, save "Minor test-only findings" (below) and "Memory-fix dispatch". impl-review routes the sprint back to `impl` (review-fix mode); the responsible dev resolves findings; sprint re-enters impl-review via `impl-test`.

**Escalation required** (the main orchestrator asks the user before fix — `core.md` "Request user decision"), format = Complication Approval (`core.md`):

- Change to approved concept, PRD requirement, or API contract
- New abstraction, layer, interface, or dependency
- Scope expansion beyond `sprint.md`
- Complexity increase (an over-engineering finding categorised `escalate`)

### Minor test-only findings

Both workflows, impl-review only. Fires when the current wave iteration has no `FAIL` verdict short of satisfied (`sprint-lifecycle.md` "State recovery" "User-resolved findings") and every unresolved finding at or above floor, External Review's included, has severity `low` or `medium` — or is an over-engineering/structure checklist finding the orchestrator judges behaviour-neutral, whatever its severity — and a location whose every path is a test file (`.asd/runtime.js` `isTest`), `test-plan.md` or one of its segments — read from each reviewer's `persist-review` findings JSON ("Coverage ledger" Persistence); a location with no parseable path does not qualify. Otherwise the iteration routes to review-fix.

When it fires, impl-review dispatches a fresh `asd-tester` with those findings to fix them in place, committing with one `ASD-Task: <finding id>` trailer per finding (`git-strategy.md` "Commits"). The orchestrator appends `resolved: <finding id, …> — test-fix, <YYYY-MM-DD>` to each affected review file (`sprint-lifecycle.md` "State recovery" "User-resolved findings"), naming only findings the tester reports fixed; any other routes the iteration to review-fix. Once every finding is resolved, the wave's roster is met: the next wave starts, or after the last wave the terminal full suite runs. The fix is not re-reviewed; the terminal full suite checks it.

## Nitpick drop list (reviewers must NOT raise)

- Pure wording polish
- Opinion-only style
- Alternative naming with no concrete bug
- `you could also` without identifying a defect
- Speculative future-proofing

## Coverage ledger (mandatory — blocks verdict)

Applies to every internal reviewer (NOT External Review — same list and diff, "Scope hand-off", but no rubric and no ledger). Before any verdict, the reviewer MUST emit a coverage ledger proving exhaustive review. Reviewer MUST NOT emit a final verdict while its ledger is incomplete.

Emit each ordered manifest with `node .asd/runtime.js emit-manifest --reviewer <name> --phase <design-review|impl-review> --files <scope file list> --out <review dir> [--custom-rules <path,...>] [--test-plan <path,...>] [--checklist <path>] [--base-ref <ref>] [--base <sha> --head <sha> [--full-files <path> --full-base <sha>]] [--snapshot <previous iteration dir>] [--self-hosting]`. Use `--self-hosting` when enabled. Never hand-assemble. The manifest lists its files, rules, sections, matching checklist IDs (`CL-N`, `checklist: [{id, check, severity}]`; cite the ID in a finding's Description) and allowed `n/a` predicates per ID. Classifiers and text come only from `.asd/runtime.js` (`NA_TARGETS`, `isUiSurface`, `isExecutable`, `isTemplated`, `NA_PREDICATES`).

**Rubric ID derivation.** In file order, take each top-level `###` heading of a sectioned rubric or each bold bullet lead-in of an unsectioned rubric, verbatim. No nested IDs. Custom rule ID = supplied path. Out-of-scope entries stay with an authorized `n/a`. Changing a label changes its ID.

**Immutability.** `emit-manifest` stamps a SHA-256 excluding `digest` and `ledger`; `node .asd/runtime.js manifest-digest --manifest <path>` verifies it. Neither reviewer nor orchestrator edits or re-stamps a dispatched manifest. Correct it by re-emitting and dispatching fresh.

**Pure-rename row.** `--base/--head` apply to impl-review only. With them, `emit-manifest` also writes the manifest's `.diff` ("Scope hand-off") and authorizes `NA_PREDICATES.pureRename` in `n_a.files` for each listed file the range renames with identical content and mode. That file's row is then the compact `n/a` row. The runtime proves the class; a reviewer asserting it anywhere else is an unauthorized `n/a`. The rename is neutral for the file, not for its referrers — the Change-surface exception covers those.

**Manifest `vocabulary`** — the row vocabulary travels inside the manifest, so a reviewer reads it off its own input instead of recalling prose:

`"vocabulary": {"files": [...], "rules": [...], "sections": [...], "p": "<the single status that carries p>", "f": "<the single status that carries f>"}`

Per-row-type status list plus the placement rule: `p` is required on the one status named by `p` and forbidden on every other, likewise `f`. This rule fixes the shape only; values come from `.asd/runtime.js`'s one exported vocabulary constant, shared by emitter and validator so published and enforced vocabulary cannot drift. Two more published constants travel beside it on those same seams: one filled row, built from the same constant, `"row_example": {"i": "<manifest id>", "s": "<the single status that carries p>", "p": "<allowed n/a predicate>"}`; and the shape `n_a` is keyed by — row type, then manifest id, then its allowed predicate list — `"n_a_shape": {"<files|rules|sections>": {"<manifest id>": ["<allowed n/a predicate>"]}}`. Each published constant is **required** in every emitted manifest and **optional** to `validate-ledger`: absent → validated as before; present → must equal the validator's own constant, mismatch rejected. Digest-covered like every other manifest field save the `ledger` skeleton: the compact ledger below, `manifest_digest` pre-filled and one row per manifest id awaiting its status, which the reviewer completes and returns.

The reviewer returns one compact JSON ledger with `manifest_digest`, exact `findings` IDs, and `files`/`rules`/`sections` row arrays. Each row is `{i:<manifest id>,s:<status>,p?:<allowed n/a predicate>,f?:<finding id>}` per manifest `vocabulary` and `row_example`.

### Coverage enforcement

Before writing or counting an internal verdict, validate digest, one resolved row per file/rule/section (including checklist), authorized `n/a` and exact finding refs via `node .asd/runtime.js validate-ledger --manifest <path> --ledger <path> --findings <path>`. Supply fenced returned ledger or bare JSON and IDs extracted independently from Findings. On failure transcribe once: drop unknown rows, collapse agreeing duplicates and re-key/retype supplied values. Preserve digest and never invent a status, predicate or finding ID. On revalidation pass, persist/count and log reviewer and shape defect as friction; otherwise reject and dispatch same reviewer fresh in this iteration.

### Review persistence

**Persistence** (all reviews, including External Review and late returns): `node .asd/runtime.js persist-review --phase <design|impl> --reviewer <key> --in <return file> --out-dir <iteration dir> [--late] [--manifest <path>] [--floor <low|medium|high|critical>]`. Internal reviewer writes its return verbatim to payload-named `.asd/tmp/<sprint>-<phase>-<iteration id>-<reviewer>.return.md`; absent → interrupted. External Review writes no file: orchestrator saves returned text to scratch (availability skip: token and `Unreviewed files` lines), adds its `--floor` and persists the same way.

Validate first-line token and internal ledger against `<reviewer>.manifest.json` (`--manifest` selects a closed wave's manifest for late returns). On success write `<reviewer>.md` from token onward and `<reviewer>.findings.json` (`[{id, severity, location}]`), or `<reviewer>.late.*` with `--late`; print `{token, findings}`. Failure writes nothing; apply coverage enforcement. Never overwrite or hand-retype a report. The orchestrator appends only `resolved:`, `answer:`, `Interrupted attempts:` and writes state from validated token. Keep compact ledger and immutable manifest beside report, with relative evidence links.

### Reviewer memory before persistence

(Claude only). Before each reviewer dispatch, including fresh retries, capture `node .asd/runtime.js review-memory-baseline --reviewer <key>` stdout as JSON at a unique dispatch scratch path. Pass that path to `persist-review --memory-baseline <path>` for its return, transcription or late return; omit the flag for availability skips. A `review memory check failed` result lists new work-history hits in that reviewer's own memory files and writes neither output. Route the hits to the owner through "Memory-fix dispatch", then retry persistence with the original baseline. Preserve unrelated or pre-existing memory changes.

## Verdict format

Every reviewer ends with exactly one:

- `APPROVE` — no issues at or above floor severity
- `CONCERNS: <list>` — every issue at or above floor not FAIL, whatever its severity
- `FAIL: <list>` — only an issue whose fix needs a design decision that changes requirements or complicates the architecture: the four "Escalation required" rows above — change to concept, PRD requirement or API contract, new abstraction/layer/interface/dependency, scope expansion, complexity increase (`simplify` and `keep-as-is` are CONCERNS). Severity alone never makes a FAIL. External Review's stalemate FAIL is its own route (`external-review.md` "Stalemate detection"), not this boundary.

Next action: APPROVE → reviewer done · CONCERNS → the orchestrator decides each finding's route, consulting `asd-advisor` on an ambiguous case (`agent-protocol.md` "Relay"); the responsible fixer autofixes, next iteration · FAIL → escalate to user.

## Gate Verdict Format (machine-parseable first line)

Reviewer write scope is only owned memory and, for internal reviewers, the payload-named return file ("Review persistence"). Route memory findings to the owner. After any preamble, start returned findings with one verdict line:

```
[REVIEW-<phase>-<reviewer>]: <APPROVE | CONCERNS | FAIL>
```

- `<phase>` = `design` (design-review) or `impl` (impl-review)
- `<reviewer>` = `quality | efficiency | combined | external`
- External Review's first line may also be the skip form, per `external-review.md` "Outcome contract"


**Findings table.** The report's Findings table takes `t_review.md`'s column shape; a literal `|` inside a cell, code spans included, is written `\|`, since `persist-review` splits cells on every unescaped `|`. An empty table is its header and separator rows only, never a placeholder row.

**Reviewer question carrier.** Never return bare `QUESTION`. In a report at least `CONCERNS`, put `question: <finding id> — <text>; options: <a> / <b> …` under `## Escalations`, tied to a finding in that report. For refused out-of-policy instructions locate the finding at the payload. Before routing, the workflow asks the user and appends `  answer: <text>` beneath the item for the fixer.

The dispatching phase workflow persists the verdict token, findings, and the validated compact coverage evidence (above) to `<sprint>/reviews/<phase>/[wave-<K>/]iter-NN/<reviewer>.md` ("Coverage ledger" Persistence); phase orchestration reads the first non-empty content line of that written file.

## Interrupted dispatch

Applies to every internal reviewer, except where a branch states its own reach (**Late duplicate return**, below, holds for any replaced dispatch, External Review included). What External Review may return at all — its permitted outcomes, its unavailability path, and the disposal of anything else, which imports **Interrupted dispatch** below — is `external-review.md` "Outcome contract". `<id>` below is the iteration id (`sprint-lifecycle.md` "Review iteration counters").

**Interrupted dispatch.** A dispatch returning no verdict token or no ledger (cut short mid-turn, or stopped as stalled — `sprint-lifecycle.md` "Agent liveness") is not a verdict: no `verdicts["iter-NN"]` entry, no latch. The same reviewer is re-dispatched fresh in the same iteration — identical handling to a rejected ledger, never the transcription branch, which has no returned ledger to re-encode ("Coverage ledger" enforcement). The attempt is recorded so the loss is visible rather than silent: the workflow appends `<reviewer> interrupted attempt <count> in <id> (<cause>)` to `decisions-log.md` **at the moment of the interruption** — never deferred to the verdict parse, which an interrupted dispatch never reaches. That log is the durable record; the count is per-iteration working state, never a `state.json` field, and a resume rebuilds it from those entries for the current iteration, in the live log (`artifact-layout.md` "Decisions log"). The review file finally written for that reviewer additionally carries `Interrupted attempts: <count> (<cause>)`.

**Escalation.** A second consecutive interruption of the same reviewer on the same manifest digest within one iteration requests a user decision: retry fresh or abort. The manifest is never split or narrowed; each further consecutive interruption asks again.

**Correlated interruption.** One cause taking every dispatch in flight in an iteration (session-wide limit, host outage) is one iteration-level event, never N per-reviewer attempts. The phase workflow classifies it — it alone sees all dispatches — as: same cause, same moment, every dispatch then in flight; anything narrower stays per-reviewer. It appends `iteration <id> interrupted (<cause>), all dispatches` to `decisions-log.md` once, raises no reviewer's attempt count (so one event never arms the escalation above), leaves it off every review file's `Interrupted attempts:` line, and re-dispatches every reviewer fresh. A re-dispatch afterwards interrupted on its own is that reviewer's attempt 1.

### Late duplicate return

A replaced dispatch delivering after its replacement's verdict was recorded is discarded; bookkeeping stays the replacement's. One exception, evidence only: it carries a finding at or above floor contradicting the recorded verdict. The phase workflow, never the returning agent, verifies that finding against source ("Autofix vs escalation"); unverified, discard it. Verified, record it: findings + ledger to `<reviewer>.late.md` in the replaced dispatch's iteration directory, linked from `<reviewer>.md`; `<reviewer> late return admitted on verified evidence (<finding id>)` appended to `decisions-log.md`; `verdicts["iter-NN"]` becomes the more severe of the two tokens (`FAIL` > `CONCERNS` > `APPROVE`); any APPROVE latch for that reviewer cleared. A return for a closed review wave leaves that wave's `verdicts` and `latched` untouched; its `<reviewer>.late.md` goes to the current iteration's directory instead, still linked from the closed wave's `<reviewer>.md`, so its finding joins the current wave's unresolved set and reaches review-fix. Never the reverse — a late APPROVE never displaces a recorded CONCERNS/FAIL — and a late return never latches.

An internal reviewer is NEVER recorded as skipped and never satisfies DoD without a completed verdict — it is always available, so `APPROVE (skipped: ...)` stays exclusive to External Review (`sprint-lifecycle.md` "APPROVE latch" Availability-skip carve-out). Its absent key blocks (`sprint-lifecycle.md` "State recovery").

## Reviewer responsibility

Sole owner map: each concern below has exactly one reviewer per workflow roster (`reviewers.<node>`, `sprint-lifecycle.md` "Workflows"); agent rubrics hold the detail. "Receives" is the reviewer's manifest file list, built from the iteration's scope by `.asd/runtime.js` `reviewerFiles`.

| Reviewer | design-review: judges · receives | impl-review: judges · receives |
|---|---|---|
| Quality | judged by Combined (`asd-reviewer-quality` is not dispatched) | bugs, security, contracts, best practices, AC→code trace, AC→check coverage, test adequacy and removal validity, fail-first proof, manual-verification necessity, documentation accuracy (persistent-doc actuality, in-code doc comments, stub resolution, Framework mode), UI conformance · every scope file plus `test-plan.md` and its segments (`--test-plan`) |
| Efficiency | judged by Combined (`asd-reviewer-efficiency` is not dispatched) | over-engineering, structure/cohesion, complexity-vs-value, duplication/reuse, documentation economy, runtime token cost, change-size proportionality, test-suite cost, performance · every scope file |
| Combined | Quality's and Efficiency's design-review concerns (draft correctness, AC completeness, contract and ADR decision soundness, SSoT, template adherence, provenance, traceability, custom rules, UI conformance of ux-spec, design-system and standalone mockup drafts; over-engineering, structure/cohesion, complexity-vs-value, duplication/reuse, documentation economy, runtime token cost, change-size proportionality), overall quality · every scoped draft | Quality's and Efficiency's impl-review concerns, their documentation entries when a documentation file is in scope, overall quality · every scope file plus `test-plan.md` and its segments |
| External Review | the wrapped CLI's own review · every scope file ("Scope hand-off") plus carried-over `Unreviewed files` (`external-review.md` "Iteration semantics") | same |

## DoD per review phase

| Phase | Required reviewers (all APPROVE or APPROVE-latched, same iteration; External Review's skip form counts, `external-review.md` "Outcome contract"; so does a user-resolved verdict, `sprint-lifecycle.md` "State recovery") |
|---|---|
| design-review (standard) | Combined — dispatched for any non-empty draft set unless APPROVE-latched (below); its UI conformance section is `n/a: outside phase gate` when no ux-spec, design-system or standalone mockup artifact is in scope; External Review (if enabled) |
| impl-review (standard) | Quality, Efficiency — dispatched unless APPROVE-latched (below); External Review (if enabled) — met in every review wave, in order (`sprint-lifecycle.md` "Review iteration counters") |
| impl-review (lite) | Combined — dispatched unless APPROVE-latched (below); External Review (if enabled) — met in every review wave, in order |

PR checks this roster and accepts authorized section `n/a` rows, including `n/a: outside phase gate`. Advance on DoD.

**impl-review** also requires a green **full test suite**, run exactly once per cycle after the last wave's roster is met (`sprint-lifecycle.md` "Impacted test set").

**APPROVE latch**: a prior `APPROVE` counts and suppresses re-dispatch within the same review phase and, in impl-review, the same wave (`sprint-lifecycle.md` "APPROVE latch").

**Diff-scoped impl-review fan-out** (always on): `asd-phase-impl-review.md` step 5 defines UI and performance predicates. A qualifying predicate marks a section `n/a: <predicate>` in its reviewer's ledger and omits that section's inputs. The reviewer still dispatches and returns one overall verdict. Reinclude the section when its predicate no longer holds.

Quality's AC→code trace and AC→check coverage and lite's Combined read the `requirements` input (`sprint-lifecycle.md` "Input sources"). Impl-review's Quality UI section always applies regardless of `ux_spec` — absence of a ux-spec draft never implies absence of UI code to review; it checks against accessibility.html/DESIGN.md directly when no ux-spec exists; the section is included or marked n/a per the diff-derived UI-surface predicate above, never per `documents.ux_spec`. Quality's Framework mode, in `self_hosting: enabled` mode, additionally checks `README.md`/`.asd/rules/**` consistency against the framework diff, independent of persistent docs.
