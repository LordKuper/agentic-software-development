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

Sole statement, both review phases, every reviewer — each internal reviewer of the sprint's workflow roster (`sprint-lifecycle.md` "Workflows") and External Review. Workflows, agents, external prompts and README link here.

1. **List** — the reviewer's file list, written by `node .asd/runtime.js emit-manifest` per reviewer (impl-review: per wave; built as "Reviewer responsibility" states; External Review's scope manifest: `external-review.md` "Phase-scoped payload"), is its only normative scope: its ledger file rows and its valid finding locations. Never a second list, never diff text in the payload.
2. **Diff** — the `<fingerprint>.diff` file `emit-manifest` writes beside it for exactly that list — named by its inputs, so manifests sharing a list and range share one file, and rewritten at every emit, so a reused iteration directory never serves an older file under that name — is the change content, deletions included, read on demand. impl-review: every iteration, over the iteration's range (`sprint-lifecycle.md` "Review iteration counters"). design-review: from iteration 2, against the previous iteration's draft snapshot (`--snapshot`), with an addition patch for a missing copy. A nonempty delta must produce a nonempty patch. At iteration 1, read the drafts whole.
3. **Whole files** — any file, listed or not, is readable as context when the diff is not enough. An unlisted path stays out of scope — for an internal reviewer, save the Change-surface exception below.

No reviewer — the wrapped CLI included — runs git to derive, widen or narrow its scope, and no payload tells it to.

**Base ref.** Under `self_hosting`, each reviewer's `context` bundle and `emit-manifest` take `--base-ref origin/<git.base_branch>`: the bundle's `review-policy.md`, `external-review.md` and `t_reliability-checklist.md` and each rubric then come from that ref, so a sprint cannot weaken the rules judging it. Limitation: the host-loaded reviewer definition body stays the working-tree view.

## Change-surface rule

Review, at every phase, covers only the change surface — the iteration's diff (impl-review) or draft set (design-review) — never the whole project. A finding about code/content outside that surface is invalid, with two exceptions: the change itself made that unchanged code/content incorrect (e.g. a renamed function left a caller elsewhere broken); or an internal reviewer saw a defect in unchanged code it read that predates the sprint diff — reported with Description prefix `pre-existing:`, never dropped. External Review findings never carry the prefix. Routing: `asd-phase-impl-review.md`. Sole statement of the rule; reviewer agents and workflows link here.

**Diff reachability.** That surface is computed from commits, so an authored file nobody commits is invisible to review. Agent memory is in-surface hand-authored source (`artifact-layout.md` "Agent memory"), yet a reviewer holds no commit tool — so the orchestrator commits a reviewer's memory writes — made while reviewing, with its review file; made in a memory-fix dispatch ("Autofix vs escalation"), when that dispatch returns (`git-strategy.md` "Commit before review", which owns that bookkeeping). A memory file a concurrent co-author holds mid-edit is ownerless the same way, and the same rule assigns it. Committed there, the write reaches a diff: the next iteration's, else `pr`'s.

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

**Verify before applying.** A reviewer's proposed fix is a claim about source, not an instruction: the fixer re-reads the cited path/symbol and confirms the finding's premise holds at current `HEAD` before applying anything. The suggested fix is non-binding. An equivalent correct fix stays permitted, as does a different fix that resolves the finding; an unverified transcription does not. Premise false → apply nothing and report the mismatch in the completion signal, never a silent drop. Premise true but prescription wrong → fix the real defect and say so in the commit body. The fixer holds a suggested fix to the over-engineering checklist before applying it, and adds no callee guard for a case the caller excludes.

**Consumer search.** A review-fix that changes a rule other files consume searches for every consumer of that rule's home, updates them in the same commit, and lists them in its completion signal.

**Deduplication.** Before fix routing, findings from different reviewers that name the same target and the same claim merge into one fix item carrying every source finding id and the highest severity.

**Reach findings.** A finding about a rule's reach is fixed in one pass at every branch of its site: each branch states its own reach, never inheriting it from a section or step header.

**Memory-fix dispatch** (Claude only; Codex renders no `memory`). A review finding, leftover-term hit (`artifact-layout.md` "Agent memory") or `memory-check` hit (`git-strategy.md` "Commit before review") located in `.claude/agent-memory/<owner>/` routes to `<owner>`; a non-owner never authors memory text. It is fixed inside the phase that found it — design-review, impl, impl-test or impl-review, at the step its workflow names, or, in a phase whose workflow names no step (such as a `memory-check` hit at an orchestrator memory commit in scope, audit, design or design-promote), at the commit where it arises, before that phase's COMPLETED — never through a test-fix `D-N`, a review-fix route, a phase transition or an extra review iteration. Each distinct owner gets one fresh memory-fix dispatch carrying all its findings and hits; the dispatches run one at a time, ordered by each owner's lowest finding id, then owners holding only hits by name. The owner fixes the file with its own write tool (`providers.md`); its return carries no verdict token, it is not a review. An owner whose definition withholds a write tool (e.g. `Write` in its `disallowedTools`) returns only a `MEMORY-FIX <path>` block holding the replacement text, no verdict token; the orchestrator applies it verbatim. The orchestrator commits the fix when the owner holds no commit tool (`git-strategy.md` "Commit before review"); either way it appends one decisions-log line and `resolved: <finding id, …> — memory-fix, <YYYY-MM-DD>` to each affected reviewer's review file (`sprint-lifecycle.md` "State recovery" "User-resolved findings"). A finding located in the memory directory of an agent that no longer exists has no owner: the orchestrator deletes the stale file, or the whole directory, commits the deletion and appends one decisions-log line — no memory text is authored.

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

The phase workflow emits an ordered machine manifest per internal reviewer before dispatch with `node .asd/runtime.js emit-manifest --reviewer <name> --phase <design-review|impl-review> --files <path to a file listing the scope files, one per line> --out <review output dir> [--custom-rules <path,...>] [--test-plan <path,...>] [--checklist <path>] [--base-ref <ref>] [--base <sha> --head <sha> [--full-files <path> --full-base <sha>]] [--snapshot <previous iteration dir>] [--self-hosting]` — the sole manifest source; never hand-assembled; `--self-hosting` is passed when `config.self_hosting: enabled`. From the scope it builds this reviewer's file list ("Reviewer responsibility"). It enumerates every file in that list, every stable reviewer-rubric/custom-rule ID (a custom rule's id is the `--custom-rules` path as passed), each `--checklist` item whose Trigger matches a listed file (rule id `CL-N`, also a manifest `checklist` entry `{id, check, severity}`; covered like any rule id, and a finding it caught cites its `CL-N` in Description), the rubric's section IDs (its `###` headings; none for an unsectioned rubric), and the **allowed `n/a` predicates per individual ID** — the standing predicates, whose target ids and classifier member lists live only in `.asd/runtime.js` (`NA_TARGETS`, `isUiSurface`, `isExecutable`, `isTemplated`); their text is owned by `NA_PREDICATES` there, and any canon quote of it must match — e.g. Quality's Framework mode is `n/a: self_hosting not enabled` without `--self-hosting`, and its Template adherence is `n/a: no templated artefact in scope` when no scope file is templated. **Rubric ID derivation**: a reviewer's rubric IDs are the top-level entries of its agent file's `## Review rubric` — each `###` heading where that rubric is sectioned, else each bullet's bold lead-in label — in file order, the heading or label text verbatim as the id; nothing nested under an entry is enumerated separately. They are stable because the text IS the id: adding, renaming or deleting an entry is a canonical agent edit that moves the manifest in the same change, and an entry outside this phase or this diff's scope is still enumerated, carrying an authorized `n/a` predicate rather than being dropped. The manifest contains its SHA-256 digest, calculated by `.asd/runtime.js` over the manifest excluding `digest` and the `ledger` skeleton — `emit-manifest` stamps it, `node .asd/runtime.js manifest-digest --manifest <path>` verifies it; a reviewer cannot replace it. **Immutability**: a dispatched manifest is immutable for the life of that dispatch, to the orchestrator as to the reviewer. Correcting it takes a fresh dispatch carrying a newly emitted manifest, never a re-stamp of the dispatched one.

**Pure-rename row.** `--base/--head` apply to impl-review only. With them, `emit-manifest` also writes the manifest's `.diff` ("Scope hand-off") and authorizes `NA_PREDICATES.pureRename` in `n_a.files` for each listed file the range renames with identical content and mode. That file's row is then the compact `n/a` row. The runtime proves the class; a reviewer asserting it anywhere else is an unauthorized `n/a`. The rename is neutral for the file, not for its referrers — the Change-surface exception covers those.

**Manifest `vocabulary`** — the row vocabulary travels inside the manifest, so a reviewer reads it off its own input instead of recalling prose:

`"vocabulary": {"files": [...], "rules": [...], "sections": [...], "p": "<the single status that carries p>", "f": "<the single status that carries f>"}`

Per-row-type status list plus the placement rule: `p` is required on the one status named by `p` and forbidden on every other, likewise `f`. This rule fixes the shape only; values come from `.asd/runtime.js`'s one exported vocabulary constant, shared by emitter and validator so published and enforced vocabulary cannot drift. Two more published constants travel beside it on those same seams: one filled row, built from the same constant, `"row_example": {"i": "<manifest id>", "s": "<the single status that carries p>", "p": "<allowed n/a predicate>"}`; and the shape `n_a` is keyed by — row type, then manifest id, then its allowed predicate list — `"n_a_shape": {"<files|rules|sections>": {"<manifest id>": ["<allowed n/a predicate>"]}}`. Each published constant is **required** in every emitted manifest and **optional** to `validate-ledger`: absent → validated as before; present → must equal the validator's own constant, mismatch rejected. Digest-covered like every other manifest field save the `ledger` skeleton: the compact ledger below, `manifest_digest` pre-filled and one row per manifest id awaiting its status, which the reviewer completes and returns.

The reviewer returns one compact JSON ledger with `manifest_digest`, exact `findings` IDs, and `files`/`rules`/`sections` row arrays. Each row is `{i:<manifest id>,s:<status>,p?:<allowed n/a predicate>,f?:<finding id>}` per manifest `vocabulary` and `row_example`.

**Enforcement (phase-workflow gate):** before writing a report or counting its verdict, `persist-review` validates the digest, one resolved row per `files`/`rules`/`sections` ID (checklist rules included), authorized `n/a` and exact finding references. The check is `node .asd/runtime.js validate-ledger --manifest <path> --ledger <path> --findings <path>`. `--ledger` reads the fenced ledger in returned text or bare JSON. `--findings` takes the IDs derived independently from the Findings table. On failure the workflow transcribes once from returned evidence: drop unknown rows, collapse agreeing duplicates and re-key or retype supplied values. Keep the digest and never fill a missing status, predicate or finding ID. Revalidate the transcript. On pass, persist it, count the verdict and log the reviewer and shape defect as friction. On failure, reject it and re-dispatch the same reviewer fresh in that iteration.

**Persistence** (both review phases, both workflows, every reviewer — External Review's return and a late return included): the phase workflow persists each return with one command, `node .asd/runtime.js persist-review --phase <design|impl> --reviewer <key> --in <file holding the returned text> --out-dir <iteration dir> [--late] [--manifest <path>] [--floor <low|medium|high|critical>]` (`--floor`: External Review only, `external-review.md` "Output mapping"). For an internal reviewer, `--in` is its return file, `.asd/tmp/<sprint>-<phase>-<iteration id>-<reviewer>.return.md` (`artifact-layout.md` "Scratch directory"): the payload names it, the reviewer writes its final return there verbatim, and the orchestrator never re-types a return; a dispatch that leaves no such file is an interrupted dispatch ("Interrupted dispatch"). External Review writes no return file: the workflow writes its returned text to a file in that directory — or, for its availability skip (`external-review.md` "Detection and negative cache"), which returns no text, the skip's token line and `Unreviewed files` line — and persists it the same way. It checks the first-line token ("Gate Verdict Format") and, for an internal reviewer, the ledger against `<out-dir>/<reviewer>.manifest.json` (`--manifest`: a closed wave's manifest, for a late return); then writes `<reviewer>.md` — the return from its token line on — and `<reviewer>.findings.json` (`[{id, severity, location}]`), `<reviewer>.late.*` with `--late`, and prints `{token, findings}`. A failure writes nothing; the transcription above re-runs it on the transcript; an existing `<reviewer>.md` is never overwritten. The orchestrator never hand-writes or re-authors a review file: its later writes there are appended lines only — `resolved:` (`sprint-lifecycle.md` "State recovery"), `answer:` ("Gate Verdict Format"), `Interrupted attempts:` ("Interrupted dispatch"). `state.json` stays orchestrator-written, from the printed token. The validated compact ledger and immutable manifest stay beside the verdict/findings report, with relative evidence links. No full prose ledger is generated first; no second compression pass discards the evidence needed for deterministic revalidation.

**Reviewer memory before persistence** (Claude only). Before each reviewer dispatch, including fresh retries, capture `node .asd/runtime.js review-memory-baseline --reviewer <key>` stdout as JSON at a unique dispatch scratch path. Pass that path to `persist-review --memory-baseline <path>` for its return, transcription or late return; omit the flag for availability skips. A `review memory check failed` result lists new work-history hits in that reviewer's own memory files and writes neither output. Route the hits to the owner through "Memory-fix dispatch", then retry persistence with the original baseline. Preserve unrelated or pre-existing memory changes.

## Verdict format

Every reviewer ends with exactly one:

- `APPROVE` — no issues at or above floor severity
- `CONCERNS: <list>` — every issue at or above floor not FAIL, whatever its severity
- `FAIL: <list>` — only an issue whose fix needs a design decision that changes requirements or complicates the architecture: the four "Escalation required" rows above — change to concept, PRD requirement or API contract, new abstraction/layer/interface/dependency, scope expansion, complexity increase (`simplify` and `keep-as-is` are CONCERNS). Severity alone never makes a FAIL. External Review's stalemate FAIL is its own route (`external-review.md` "Stalemate detection"), not this boundary.

Next action: APPROVE → reviewer done · CONCERNS → the orchestrator decides each finding's route, consulting `asd-advisor` on an ambiguous case (`agent-protocol.md` "Relay"); the responsible fixer autofixes, next iteration · FAIL → escalate to user.

## Gate Verdict Format (machine-parseable first line)

Reviewers write no review artifact, code or doc: the phase workflow writes the review file (tool grants: `providers.md`). Their own memory directory and, for an internal reviewer, the return file its payload names ("Coverage ledger" Persistence) are the only places they write, and policy, not the host, keeps them there (the host grant: `providers.md`); a finding located in that memory goes to that reviewer's memory-fix dispatch ("Autofix vs escalation"). Sole statement of that scope in canon — what the read-only claim covers and how a reviewer's memory is written; canon acting sites state only the write they perform, `providers.md` only the tool grants. Hand-authored agent memory is outside canon, so what a memory file restates is outside this sole-statement claim (`artifact-layout.md` "Agent memory"). Every reviewer's **returned findings text** (its final text output) MUST begin (after any preamble) with a single-line verdict token:

```
[REVIEW-<phase>-<reviewer>]: <APPROVE | CONCERNS | FAIL>
```

- `<phase>` = `design` (design-review) or `impl` (impl-review)
- `<reviewer>` = `quality | efficiency | combined | external`
- External Review's first line may also be the skip form, per `external-review.md` "Outcome contract"


**Findings table.** The report's Findings table takes `t_review.md`'s column shape; a literal `|` inside a cell, code spans included, is written `\|`, since `persist-review` splits cells on every unescaped `|`. An empty table is its header and separator rows only, never a placeholder row.

**Reviewer question carrier.** A reviewer never returns a bare `QUESTION` — without the verdict token it reads as an interrupted dispatch ("Interrupted dispatch"). A question needing the user stays in the verdict-bearing report, listed under `t_review.md`'s `## Escalations` as `question: <finding id> — <text>; options: <a> / <b> …`; the review workflow asks the user before routing that iteration and writes each answer into that reviewer's review file directly under its item, as `  answer: <text>` — the fixer reads it as part of that reviewer's finding set. A reviewer holding an open question returns at least `CONCERNS`, never `APPROVE`, so the answer rides with its findings into the fix route and no latch drops it. Every question qualifies one finding of the same report, named by its id — no finding, no question. A reviewer refusing an out-of-policy instruction (`providers.md` "Declared tool policy") records the refusal as a finding located at the dispatch payload, and its question names that finding.

The dispatching phase workflow persists the verdict token, findings, and the validated compact coverage evidence (above) to `<sprint>/reviews/<phase>/[wave-<K>/]iter-NN/<reviewer>.md` ("Coverage ledger" Persistence); phase orchestration reads the first non-empty content line of that written file.

## Interrupted dispatch

Applies to every internal reviewer, except where a branch states its own reach (**Late duplicate return**, below, holds for any replaced dispatch, External Review included). What External Review may return at all — its permitted outcomes, its unavailability path, and the disposal of anything else, which imports **Interrupted dispatch** below — is `external-review.md` "Outcome contract". `<id>` below is the iteration id (`sprint-lifecycle.md` "Review iteration counters").

**Interrupted dispatch.** A dispatch returning no verdict token or no ledger (cut short mid-turn, or stopped as stalled — `sprint-lifecycle.md` "Agent liveness") is not a verdict: no `verdicts["iter-NN"]` entry, no latch. The same reviewer is re-dispatched fresh in the same iteration — identical handling to a rejected ledger, never the transcription branch, which has no returned ledger to re-encode ("Coverage ledger" enforcement). The attempt is recorded so the loss is visible rather than silent: the workflow appends `<reviewer> interrupted attempt <count> in <id> (<cause>)` to `decisions-log.md` **at the moment of the interruption** — never deferred to the verdict parse, which an interrupted dispatch never reaches. That log is the durable record; the count is per-iteration working state, never a `state.json` field, and a resume rebuilds it from those entries for the current iteration, in the live log (`artifact-layout.md` "Decisions log"). The review file finally written for that reviewer additionally carries `Interrupted attempts: <count> (<cause>)`.

**Escalation.** A second consecutive interruption of the same reviewer on the same manifest digest within one iteration requests a user decision: retry fresh or abort. The manifest is never split or narrowed; each further consecutive interruption asks again.

**Correlated interruption.** One cause taking every dispatch in flight in an iteration (session-wide limit, host outage) is one iteration-level event, never N per-reviewer attempts. The phase workflow classifies it — it alone sees all dispatches — as: same cause, same moment, every dispatch then in flight; anything narrower stays per-reviewer. It appends `iteration <id> interrupted (<cause>), all dispatches` to `decisions-log.md` once, raises no reviewer's attempt count (so one event never arms the escalation above), leaves it off every review file's `Interrupted attempts:` line, and re-dispatches every reviewer fresh. A re-dispatch afterwards interrupted on its own is that reviewer's attempt 1.

**Late duplicate return.** A replaced dispatch delivering after its replacement's verdict was recorded is discarded; bookkeeping stays the replacement's. One exception, evidence only: it carries a finding at or above floor contradicting the recorded verdict. The phase workflow, never the returning agent, verifies that finding against source ("Autofix vs escalation"); unverified, discard it. Verified, record it: findings + ledger to `<reviewer>.late.md` in the replaced dispatch's iteration directory, linked from `<reviewer>.md`; `<reviewer> late return admitted on verified evidence (<finding id>)` appended to `decisions-log.md`; `verdicts["iter-NN"]` becomes the more severe of the two tokens (`FAIL` > `CONCERNS` > `APPROVE`); any APPROVE latch for that reviewer cleared. A return for a closed review wave leaves that wave's `verdicts` and `latched` untouched; its `<reviewer>.late.md` goes to the current iteration's directory instead, still linked from the closed wave's `<reviewer>.md`, so its finding joins the current wave's unresolved set and reaches review-fix. Never the reverse — a late APPROVE never displaces a recorded CONCERNS/FAIL — and a late return never latches.

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
