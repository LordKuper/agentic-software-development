# Sprint Lifecycle

## Orchestration and adaptive gates

The main orchestrator owns scope and plan writing, phase/state transitions, decision logging, manual-step validation, Git/PR, archival, merge recovery and self-hosting release. It delegates only artefact creation, testing, review or advice.

At scope, normalize audit `enabled` to `always` and `disabled` to `off`; accept `auto|always|off`. Freeze the effective audit boolean in state (`documents.audit`) — the normalization rule below is deterministic, so no separate reason field is stored. `auto` skips only a complete, verifiably mechanical scope with no behaviour, contract, migration or gate impact; unknown/risky scope audits. An accepted scope expansion reevaluates it. Architect owns audit; BA is dispatched only for evidenced material product/domain ambiguity.

Use `checkpoints.md` for every user-gate decision. A closure request is mandatory after merge and all DoD evidence, before `phase=done`, finalization or archival; it cannot be passed adaptively. Existing archived-active recovery remains active until that explicit closure approval.

## Phases (all mandatory)

```
scope → audit → design → design-review → design-promote → plan → impl ⇄ impl-test → impl-review → retro → pr
                                                                   ↑__________________________|
```

`impl`, `impl-test`, `impl-review` form one cycle:

- `impl` always routes to `impl-test`. impl writes **no tests** — its gate is build + lint; a dev may run the impacted set (below) for self-verification only, never as a substitute for `impl-test`/`impl-review`.
- `impl-test` selects the test approach for the whole change scope, prunes redundant tests, writes missing ones, runs the **impacted set** (below) as its suite gate. Code defects → back to `impl` (test-fix mode), then `impl-test` again. Impacted set green → `impl-review`.
- `impl-review` does NOT fix findings — routes back to `impl` (review-fix mode) on unresolved findings; the sprint then re-enters `impl-test` (code changed → tests re-selected + re-run) before returning to `impl-review`. Once every required reviewer returns `APPROVE` or is latched, `impl-review` runs the **full suite exactly once** — the cycle's only full-suite run — via `asd-tester`, before `NEXT: retro`. On red: test defects are fixed by `asd-tester` and the suite re-run; code defects instead become `D-N` rows in `test-plan.md` + `state.json.test_defects_pending`, and the phase exits to `impl` test-fix mode rather than fixing code in place. Either red path also clears every APPROVE latch sprint-wide (`APPROVE latch` below).

No cap on `impl⇄impl-test` rounds: loop until the impacted set is green or a dev blocker escalates (`FAILED`/`QUESTION`). `impl-review` keeps its iteration cap. Phase routing follows the `NEXT:` token in each phase skill's return contract, not a fixed linear chain.

**Impl-review clean-worktree precondition** (home statement; mechanic in `asd-phase-impl-review.md` "Preconditions"): `impl-review` refuses to start while `git status --porcelain` is non-empty, measured at phase entry before any dispatch — the iteration diff is computed from commits, so uncommitted work (including pre-existing sprint bookkeeping files) is invisible to every reviewer. The phase's own later writes (review files, `state.json`, `decisions-log.md`, `test-plan.md`) are produced after this gate and are not subject to it. `design-review` has no matching precondition — it builds its manifest from on-disk drafts, so the git-invisibility blind spot does not exist there.

**Impl-test commits its own output** (home statement; mechanic in `asd-phase-impl-test.md`): `impl-test` commits its authored/pruned tests and `test-plan.md` changes, Conventional Commits, before signalling COMPLETED — it runs immediately before the clean-worktree precondition above, and always writes tests plus `test-plan.md`, so the two rules only compose if `impl-test` leaves a clean worktree behind it (`git-strategy.md` "Commit before review").


## Review iteration counters

Two independent counters in `state.json`, one per review phase:

- `reviews.design.iteration` — design-review iterations
- `reviews.impl.iteration` — impl-review iterations

Each review phase reads, increments, and reports only its own counter. Never shared; severity-floor budget (`review-policy.md`) computed per counter.

**Lifecycle:**

- Both created at `0` when the sprint is initialised in `scope` (per `t_state.json`).
- Each incremented at the **start of every entry** of its phase (`1` on first entry). `design-review` entered once, loops internally. `impl-review` re-entered each cycle; the intervening `impl` and `impl-test` phases do not touch the counter — it accumulates across the whole cycle.
- **Rollback reset.** When `state.json.phase` is set strictly earlier in the chain than a review's input-producing phase, that counter resets to `0`, its severity floor resets, its `verdicts` clear, and its `latched` map clears to `{}` (APPROVE latch, below — same reset, no second mechanism). Input-producing phases: `design` for design-review, `impl` for impl-review.

  | Counter | Resets when phase set to |
  |---|---|
  | `reviews.design.iteration` | `scope`, `audit` |
  | `reviews.impl.iteration` | `scope`, `audit`, `design`, `design-review`, `design-promote`, `plan` |

  Setting phase to `impl` or `impl-test` is not earlier than `impl` — normal cycle re-entry never resets. Reset fires only on a genuine rollback (the `asd-sprint` resume menu's *re-run earlier phase*). Rationale: once the artifact under review is re-created from an earlier phase, prior review rounds are void.
- On iteration-cap override, the counter keeps incrementing — not reset. Severity floor stays pinned at `critical`.

Verdict files: design-review → `<sprint>/reviews/design/iter-NN/`, impl-review → `<sprint>/reviews/impl/iter-NN/`, `NN` = that phase's own counter.

## APPROVE latch

**Invariant** (closes the class of bugs this mechanism used to produce by hand-reconciling three places): a reviewer's key is ALWAYS written to `state.json.reviews.<phase>.verdicts["iter-NN"]` for every iteration of that phase that runs. A latch-skipped reviewer gets its inherited `APPROVE` recorded there without being dispatched. `latched` is purely a dispatch-time optimisation — it decides whether a reviewer is called again — and NEVER participates in DoD or pr-gate aggregation; both read `verdicts["iter-NN"]` alone. Consequence: clearing `latched` can never change satisfied-vs-blocking for any iteration, because the verdict keys it would have gated are already there.

Persisted per phase per reviewer key in `state.json.reviews.<phase>.latched` (`t_state.json`) — a map from reviewer key (the same keys used in `verdicts["iter-NN"]`: `correctness`/`efficiency`/`testing`/`documentation`/`external` for impl-review, `correctness`/`efficiency`/`documentation`/`external` for design-review) to the iteration number at which that reviewer returned `APPROVE`. An absent key means that reviewer has never latched, or its latch was cleared. A sprint in flight when this field shipped carries no `latched` object at all under one or both phase nodes — treat a wholly absent `latched` object the same as an empty one (`{}`, no latches), mirroring the `iteration_heads` absent-key fallback above; never an error.

A reviewer key present in `reviews.<phase>.latched` is NOT dispatched on any later iteration of the same phase (`asd-phase-impl-review.md` step 6, `asd-phase-design-review.md` step 7). Per the invariant above, its inherited `APPROVE` is still written into that iteration's `verdicts["iter-NN"]` — its existing review file from the iteration it actually latched stands as the evidence backing that entry, unchanged.

The dispatching phase workflow writes a reviewer's latch entry the moment that reviewer's parsed verdict token for the current iteration is `APPROVE` — same step that records the token into `verdicts["iter-NN"]`. A reviewer already latched from an earlier iteration is left untouched by the latch write itself (it produced no new token, having not been dispatched) but still receives this iteration's `verdicts["iter-NN"]` entry per the invariant.

**Availability-skip carve-out.** Only a verdict produced by an actual review latches — an availability skip is not one. External Review's availability skip (`external-review.md` "Detection and negative cache" — phase-supplied preflight returns non-ready, or an active negative cache, not a judgment on the diff) is recorded in `verdicts["iter-NN"].external` as `"APPROVE (skipped: <reason>)"` — distinct from the bare `"APPROVE"` token a completed review writes — and satisfies DoD identically (`review-policy.md` "DoD per review phase") but is NEVER written to `latched`: the dispatching phase workflow's latch-write step (`asd-phase-design-review.md` step 9, `asd-phase-impl-review.md` step 8) writes `latched[<key>] = N` only for the bare `"APPROVE"` token, never for the `"APPROVE (skipped: ...)"` form. A latch means "already reviewed, skip re-review"; an availability skip means only "unavailable this iteration" and must not permanently remove External Review from the sprint once availability returns.

**Reset.** The rollback reset above already clears `latched` to `{}` alongside `iteration`/`verdicts` for the affected phase — no second mechanism for that route.

**Red-full-suite invalidation.** A red full suite (the end-of-`impl-review` terminal suite run) proves previously-approved code was wrong: on that failure, clear BOTH `reviews.design.latched` and `reviews.impl.latched` to `{}` sprint-wide — not only the reviewer(s) whose domain the regression touched — before the sprint routes back to `impl`. This clears the dispatch-skip optimisation only: the next `impl-review` entry re-dispatches its full required roster, with no latch surviving from before the failure, so every reviewer produces a fresh verdict against the code that follows the fix. It can NEVER retroactively change satisfied-vs-blocking for an iteration already recorded — the invariant above already wrote every latch-skipped reviewer's inherited `APPROVE` into that iteration's own `verdicts["iter-NN"]` at the moment it was skipped, and clearing `latched` afterward does not touch those entries. This is a DISTINCT clearing route from the rollback reset above, not a consequence of it: a red-suite failure routes to `impl` in test-fix mode, and re-entering `impl`/`impl-test` from `impl-review` is normal cycle re-entry, never a rollback — "Setting phase to `impl` or `impl-test` is not earlier than `impl`" above, so the rollback-reset table never fires for this route. The full-suite step's own implementation (where in the workflow this clearing happens, alongside the rest of its red path) is out of this rule's scope; this paragraph is the contract that step must satisfy.

## Impacted test set

Every scoped test run in `impl` and `impl-test` uses the **impacted set** — defined once, here; every other file cross-links this section, never restates it. `impl-review`'s one terminal run is deliberately unscoped (below).

**Definition.** The impacted set is the union of:
1. test files present in the change-surface diff;
2. tests exercising a changed unit, resolved by repo search over references/imports of the changed modules;
3. tests tagged with an AC-N the change touches (the AC-citation convention — the tag lives in the test's name/path, `t_test-plan.md` "Added tests"; the one exception to `code-style.md` §8's in-code document-reference ban).

**Native selector override.** When `commands.yaml` carries a `test_affected` field (a native runner flag such as `--changedSince`/`--onlyChanged`, or a filter expression), that field's result REPLACES the search-derived set above — the runner's own answer is used, not a second derivation. Field absent → fall back to the search-derived set. The field's shape and `t_commands.yaml`/`asd-init` detection are defined where `commands.yaml` is — this section only names the override mechanism and its key.

**Safety valve — mandatory, not heuristic, checked BEFORE the selector or the search-derived set is used.** `asd-tester` MUST apply this test before every scoped run: when the change surface touches shared infrastructure — build config, CI config, shared/common modules, any framework-wide file — the impacted set degrades to the **full suite** for that run. A rule the tester applies on every run, never a judgment call.

**Where impacted-only applies**: `impl` (self-verification only, below — devs never author/modify/prune a test); `impl-test`'s suite gate (below).

**Where the full suite still runs**: exactly once per sprint cycle, at the end of `impl-review`, after every required reviewer returns `APPROVE` or is latched and before `NEXT: retro` — dispatched to `asd-tester` (reviewers are read-only, `providers.md`; the phase gains this capability only through that one dispatch). Recorded in `test-plan.md`'s existing `Suite run` section including `HEAD`; the `pr` gate keeps reading it from there, wording unchanged (`PR phase` below). Red path and latch-clearing: `impl` bullet above and `APPROVE latch` above. Green full suite is part of impl-review's DoD (`review-policy.md` "DoD per review phase").

## Phase table

| Phase | Owner | Input | Output | Exit criteria |
|---|---|---|---|---|
| scope | Main orchestrator | user request | `sprint.md`, sprint id, branch | scope gate passed, branch created |
| audit | Architect (BA conditional) | `sprint.md`, codebase, `docs/`, existing docs any format/location | `audit.md`; optional reverse-engineered/migrated drafts in `<sprint>/design/` | audit gate passed |
| design | BA → UX → Architect | `audit.md` | drafts in `<sprint>/design/` | drafts complete |
| design-review | Correctness (UI section, conditional) + Efficiency + Documentation + External Review | `<sprint>/design/` | `reviews/design/iter-NN/<reviewer>.md` | DoD met |
| design-promote | Orchestrator + Architect + BA + UX | approved drafts | persistent docs in `docs/` | drafts merged, decisions-log entry |
| plan | Main orchestrator | promoted persistent docs | `plan.md` | plan gate passed |
| impl | Dev | `plan.md` (initial), `reviews/impl/iter-NN/` findings (review-fix), or `test-plan.md` Defects (test-fix) | code, `manual-steps.md` | all tasks/findings/defects done; build + lint pass (completion gate) |
| impl-test | Tester | code diff, `plan.md`, PRD ACs, existing tests | `test-plan.md`, tests in repo | impacted set green (`Impacted test set` above) → `impl-review`; code defects → `impl` test-fix mode |
| impl-review | Correctness + Efficiency + Testing + Documentation + External Review | code + tests + `test-plan.md` | `reviews/impl/iter-NN/<reviewer>.md` | all reviewers APPROVE/latched AND terminal full suite green (`Impacted test set` above) → `retro`; red suite → `impl` test-fix mode, latches cleared; unresolved findings → `impl` review-fix mode |
| retro | Main orchestrator | `friction-log.md` (may be absent) | `retrospective.html` | retrospective written, empty-log branch included → `pr` |
| pr | Main orchestrator | everything | PR, then terminal archive | merged and explicit closure approval |

## Self-hosting

`self_hosting: enabled` in `.asd/project/config.yaml` — sole source of truth, no marker file. Absent field or `disabled` = consumer mode (backward compatible, unchanged behavior).

When enabled: Dev may write canonical `.asd/rules/`, `.asd/templates/`, `.asd/agents/`, `.asd/skills/`, `.asd/workflows/`, `.asd/hooks/`, `.asd/runtime.js`, `.asd/migrations/`, `.asd/sync.js`, `.asd/sync-state.json`, `.asd/release-manifest.json`, root `AGENTS.md`, `README.md`, `CHANGELOG.md`, `.gitignore`, `tests/**`, plus its own `.claude/agent-memory/<agent>/` (not generated output — `artifact-layout.md` "Agent memory"). Generated provider views stay read-only; edit canon then sync.

Root `AGENTS.md`'s managed-block/hand-edited-tail split: `providers.md` "Canonical path -> per-provider path" (ownership home). `asd-update` is a no-op here (it pulls framework files INTO a consumer; this repo IS the framework).

Versioning: bump `asd_version` and update `CHANGELOG.md` before PR review; tag/release only after closure finalization.

Framework impl-review/External Review change surface: the whole repo diff (everything here IS framework source — canonical `.asd/**`, `README.md`, `AGENTS.md`, `tests/**`, and anything else added later, e.g. CI configs), minus `.asd/project/**`, `.asd/sprints/**`, generated `.claude/**`/`.codex/**`/`.agents/skills/**`, build output — never an allow-list of named paths, so nothing new needs a matching rule edit to be reviewed.

## Optional documents

`documents.<name>` in config (`audit | prd | ux_spec | adr | c4`), frozen into `state.json.documents` at `scope` — phases read that frozen snapshot, never live config, so a mid-sprint config edit never changes an active sprint's preconditions. Old config without the `documents` group, or an active sprint's `state.json` without a `documents` snapshot, means every value `enabled` (no behavior change). Fail-closed default is per-field, not per-group: when the `documents` group is present but a given field is absent from it, that field is `disabled` — only a wholly-absent group defaults everything to `enabled`. Effective `documents.c4` (computed once, here, at `scope` — never recomputed later) is `enabled` only when `project.subsystem_decomposition: enabled` too; otherwise disabled regardless of the flag.

**Config string → state boolean**: `t_state.json`'s `documents` map holds `"{{DOC_AUDIT}}"`/`"{{DOC_PRD}}"`/`"{{DOC_UX_SPEC}}"`/`"{{DOC_ADR}}"`/`"{{DOC_C4}}"` as quoted placeholders — quoted so the template file itself stays valid, parseable JSON as shipped. At `scope` write time, replace each entire quoted token (**including its surrounding quotes**) with the bare JSON boolean `true`/`false` matching that document's normalized `enabled`/`disabled` value — the written `state.json` must end up with `"audit": true`, never `"audit": "{{DOC_AUDIT}}"` or `"audit": "true"`. Never leave a placeholder token, quoted or not, in a written `state.json`.

**Skip record**: `t_state.json.skipped_phases` starts `[]`. A no-op phase (below) appends its own phase name to this array in the same write that advances `phase` — this is what lets a resumed sprint or a later audit tell "phase legitimately skipped, empty applicable-artifact set" apart from "phase ran and produced nothing," which the `phase`/`updated_at` fields alone cannot distinguish. Never removed or reordered; a phase re-run after a rollback (`checkpoints.md` "Re-running a phase") that turns out non-empty this time does not retroactively remove its earlier skip entry — the array is a historical record, not current status.

**Multi-phase skip**: when one deterministic check subsumes several consecutive no-op phases in a single write — the `design`/`design-review`/`design-promote` collapse below — that one write appends **every** subsumed phase name to `skipped_phases` (`["design", "design-review", "design-promote"]`) and sets `phase` to the **last** subsumed phase name, never one array append per phase and never the first. This way `PHASE_CHAIN[idx+1]` mechanically yields the next real phase and a resumed session cannot re-enter the collapsed block. The subsumed phases are never separately dispatched, so they never make their own individual `skipped_phases` write.

Never optional: `sprint.md`, `state.json`, `plan.md`, `test-plan.md`, impl-review reports, `manual-steps.md` (already lazy), `friction-log.md` (already lazy), `retrospective.html`, `<sprint>/decisions-log.md`, `stubs.md`. A disabled document is never written as an empty stub — skip recorded in `state.json` plus one decisions-log line.

**Acceptance-criteria source**: PRD AC-N when `documents.prd` enabled; else `sprint.md`'s own `AC-N` list (`t_sprint.md`). Every phase citing AC-N (plan, impl, impl-test, impl-review, pr) uses whichever source the sprint's frozen `documents.prd` selects.

**Independent design docs** (replaces the old hard PRD→UX→ADR chain):
- PRD (`prd`) reads `sprint.md` + `audit.md` (if `audit` enabled).
- UX-spec (`ux_spec`) reads PRD if enabled, else `sprint.md`; audit optional. Disabling `ux_spec` also disables the design-system gate, `design-md-delta.yaml`, and UX promotion.
- ADR (`adr`) reads whichever of PRD/UX-spec exist, else `sprint.md`; audit optional. ADRs are sprint-scoped only (`<sprint>/design/adr.html`, sprint-local `ADR-1`, `ADR-2`, … numbering) and are never promoted as a standalone persistent document — see "Design-promote phase" fold rule.
- C4 (effective `c4`) reads whichever design drafts exist, current stack, `sprint.md`; ADR not required.
- Audit disabled → creators scan the repo themselves for context; the plan workflow greps touched files and reads `.asd/project/stubs.md` directly instead of `audit.md`'s "Related open stubs" section.

**No-op phase rule**: a phase whose entire applicable-artifact set is empty skips dispatch, records its skip inline and returns `COMPLETED`. It has no artifact gate.

| Phase | No-op when |
|---|---|
| audit | `audit` disabled |
| design | `prd`, `ux_spec`, `adr`, effective `c4` all disabled |
| design-review | design phase produced zero drafts |
| design-promote | zero approved drafts to promote |

`plan`, `impl`, `impl-test`, `impl-review`, `retro`, `pr` are never no-op.

**Design/design-review/design-promote collapse**: the design workflow performs one deterministic no-op write when all documents are disabled; design-review and design-promote are not dispatched.

## Audit phase

No-op when `documents.audit: disabled` (see "Optional documents").

An absent optional section in `audit.md` (`t_audit.md`) means an empty finding set for that check — the check ran and found nothing — never that the check was skipped. BA/Architect omit an optional section entirely when it has no findings; they never emit a mandated placeholder row to signal "none". A check that could not run at all is a `FAILED`/`ABORT` from the responsible agent, not a silently-omitted section.

Scans: existing source in touched areas; existing docs in **any format/location** (MD, RST, Confluence/Notion exports, HTML, Wiki, text-extractable PDF, READMEs outside ASD layout); persistent docs in `docs/`.

Output `audit.md` — findings (touched areas, existing docs/code, gaps, risks) plus **Documentation migration plan** listing found external docs to promote into ASD format. Where sprint scope directly overlaps found content, the agent may pre-formulate reverse-engineered/migrated drafts in `<sprint>/design/` (prd.html / adr.html) — **only for documents whose frozen `documents.*` flag is enabled**; a disabled document is never draft-created here either, its finding stays migration-plan text — with `provenance` + `source` frontmatter; these flow through design and design-review like any draft. Migration items not covered by drafts wait for design-promote.


## Design phase

No-op when `prd`, `ux_spec`, `adr`, and effective `c4` are all disabled (see "Optional documents").

Agents produce a draft set for the whole sprint scope in `<sprint>/design/`, one artifact per enabled document only — a disabled document produces no draft, no gate, no dependency on it:

- `prd.html` — requirements + acceptance criteria (`documents.prd`)
- `ux-spec.html` — flows + accessibility notes (`documents.ux_spec`)
- `adr.html` — architecture decisions (`documents.adr`)
- `design-md-delta.yaml` — proposed DESIGN.md token changes, produced inline during UX-spec authoring (only on token gap; each entry user-approved)
- `c4-full/` — delta patch against the persistent C4 registry for sprint scope (`model/*.c4`, `views.c4`); full schema only when the persistent registry does not yet exist (effective `documents.c4`). Never build `dist/` here — generated output no reviewer sees (`external-review.md`).

Order among enabled documents: PRD (if enabled) before design-system gate. Design-system gate (existence check on `docs/ux/DESIGN.md`, `design-system.html`, `accessibility.html`; dispatches `/asd-design-system` when any missing) applies only when `ux_spec` enabled, and blocks UX-spec. UX-spec (if enabled) before ADR. ADR (if enabled) before c4-full. If effective `documents.c4: disabled` (flag off, or `subsystem_decomposition: disabled`), `c4-full/` omitted.


## Design-promote phase

No-op when the design phase produced zero drafts (see "Optional documents"). Otherwise each domain creator promotes only the draft(s) that exist for its domain.

The main orchestrator handles gates; three domain creators promote (Documentation reviewer NOT involved):

1. The main orchestrator applies the adaptive gate policy to decomposition.
2. A new subsystem remains hard; after approval Architect patches C4 and creates folders.
3. The main orchestrator distributes audit migration items to the matching domain.
4. Parallel promotion:
   - `asd-ba` → per-subsystem (or flat) `docs/product/requirements/<subsystem>.html` from prd draft; product migration items.
   - `asd-architect` → folds every ADR approved in `adr.html` into whichever existing persistent doc's `responsibility.owns` frontmatter already declares ownership of that decision's subject (see fold rule below); updates `stack.html`, `tech-reference/`; applies the sprint's c4 delta patch (or, when the persistent registry did not exist before this sprint, writes the full schema directly) to persistent `docs/architecture/c4/`; architecture migration items. Rendering (`dist/` or `architecture.html`) is not regenerated here — build on demand via the `commands.yaml` build-to-view command.
   - `asd-ux` → `docs/ux/<subsystem>.html` from ux-spec draft; patches `DESIGN.md` from `design-md-delta.yaml`; regenerates `design-system.html`; ux migration items.
5. The dispatching workflow composes promotion records and writes state inline.

Dropping the per-persistent-write and final-mutation gates (former steps 4's trailing sentence and step 5) also drops the **partial rollback** affordance they used to offer (confirm / rollback / partial rollback on the whole batch) — no direct replacement exists at this gate level. The compensating control is a non-blocking post-promotion summary the dispatching workflow posts after all writes land (implemented in `asd-phase-design-promote.md`, not this rule doc).

**ADR fold rule**: every architectural decision approved in a sprint's `adr.html` is folded, at `design-promote`, into whichever existing persistent doc already declares ownership of that decision's subject in its `responsibility.owns` frontmatter — never from a lookup table. The `adr.html` article's optional "Fold target" line names the candidate and the matched `owns:` clause; the Architect verifies the match, not invents it. A binding rejected alternative folds as one line into the target doc's Constraints-equivalent section (or the fold target's nearest analogous section); a non-binding rejected alternative stays sprint-archive-only, never promoted. When no existing doc's `owns` matches, that is a Complication Approval, not a licence to invent a document — API contracts fold the same way: into a subsystem requirements/architecture doc, `stack.html`, a project-generated OpenAPI/SDL/proto artifact, or, only via Complication Approval, a brand-new doc with no pre-made template. The design gate stays **one approval for the sprint's whole ADR set** — fold-target selection happens after that gate, during promotion, and never re-opens it.

If `subsystem_decomposition: disabled`: drafts merge into flat project-level docs (`requirements.html`, `ux-spec.html`); ADRs still fold per the rule above, never into a flat `adr/` tree. No subsystem folders, no c4 model.

## Impl phase

Devs implement plan tasks. A human-only operational action is registered as `MS-N`; the main orchestrator validates necessity and presents validated pending entries. On resume the dev verifies and completes them.

Devs write **production code only** — no tests, no test runs, except self-verification: a dev may run the impacted set (`Impacted test set` above) to self-check work in progress, but never authors, modifies, or prunes a test, and this run never substitutes for or satisfies the `impl-test`/`impl-review` gates. All test work belongs to `impl-test`.

**Modes** — detected from `state.json`:

- **Initial** (`review_fixes_pending` and `test_defects_pending` both null) — implement `plan.md` tasks. Ends with the user-facing impl assessment gate.
- **Review-fix** (`review_fixes_pending` = `iter-NN`) — entered when impl-review routed back. Devs read findings in `<sprint>/reviews/impl/iter-NN/`, resolve every CONCERNS finding plus every user-approved FAIL finding. Clears `review_fixes_pending` on completion.
- **Test-fix** (`test_defects_pending` = `true`) — entered when impl-test found code defects. Devs resolve every open defect in the `Defects` section of `<sprint>/test-plan.md`, marking each `fixed` with the fixing commit. Clears `test_defects_pending` on completion.

Only one fix flag is ever set: each fix mode clears its own before routing on. Fix modes skip the impl assessment gate; blockers escalate as in initial mode. All modes return `NEXT: impl-test`.

**Completion gate** (all modes) — impl MUST NOT emit `COMPLETED` until, verified via `commands.yaml`: `build` and `lint` ran with no errors and no warnings. The gate itself never runs tests — the optional self-verification run above is not part of it. On failure: devs fix and re-run; unrecoverable failure escalates as `FAILED`. Automatic verification, not a user pause.

## Impl-test phase

Owner: Tester. Runs after every `impl` exit. Selects the test approach **after** the implementation exists, so tests follow the real change surface instead of a speculative one. Before selecting anything new, it runs the existing impacted tests (`Impacted test set` above) so the strategy pass observes actual post-impl behaviour and catches an `impl` regression before any new test is authored.

**Principles**: check-ladder selection, prune criteria, no-new-test decision rule, and fail-first regression proof are all defined once in `code-style.md` §17 (SSoT) — binding here, not restated.

**Workflow**: change-surface analysis → pre-strategy impacted run (existing tests) → `test-plan.md` (risk → chosen check → decision) → prune + author → impacted-set suite run.

**Re-entry** (every `impl` exit after the first re-enters this phase): the strategy and prune passes scope to the **delta since the prior entry** (the review-fix/test-fix commits, via `test-plan.md`'s `Entry log`), not the whole change surface again — `test-plan.md` is amended, not rewritten. The **suite gate re-runs on every entry**, scoped per `Impacted test set` above (never the whole repo, subject to its safety valve). Bounded risk: a defect introduced by a fix outside the impacted set's reach is not caught here — the end-of-`impl-review` full suite (`Impacted test set` above) is the backstop.

**Removal gate** — deleting a test outside scope uses `checkpoints.md`: explicit approval in strict, or adaptive evidence when authority and checks cover it. In-scope removals record a reason.

**Suite gate** — verdict comes from the actual `test` runner output (exit code plus report), never from an agent's claim, scoped to the impacted set (`Impacted test set` above) — the full suite runs only once, at the end of `impl-review`. Failures triaged:

- **test defect** (bad assertion, wrong fixture, flaky pattern) → fixed inside impl-test, suite re-run.
- **code defect** → appended to the `Defects` section of `test-plan.md`, `state.json.test_defects_pending = true`, `NEXT: impl` (test-fix mode).

Loops until the impacted set passes. No iteration cap — an unfixable state surfaces as a dev/tester `FAILED`, not as a silent exit.

## Friction log

`<sprint>/friction-log.md` per `t_friction-log.md`. Sprint-scoped, created lazily on the first entry, append-only, archived with the sprint. Never promoted; no cross-sprint history. Entry id `F-N`, sequential, never reused; every entry names the phase it arose in.

**Records** workflow malfunction only: an ambiguous, contradictory or unfollowable rule; a phase, gate or routing step that misfired; an agent or skill that behaved wrong; a template or artefact shape that could not be conformed to; a provider CLI or host tool that failed. One entry per distinct problem.

**Never records** what another file owns — the entry cites that owner's id and stops:

| Owner | Log may record | Log never records |
|---|---|---|
| `test-plan.md` `D-N` | that finding or fixing the defect was obstructed | the symptom or the fix |
| `reviews/<phase>/iter-NN/` | that the review process itself misbehaved | the finding or the verdict |
| `manual-steps.md` `MS-N` | that the step was unexpected or unworkable | the steps or their verification |
| `decisions-log.md` | that deciding was blocked | the decision |

One problem that is both a code defect and a workflow malfunction (routine under `self_hosting`, where workflow source IS the code) gets a `D-N` row for the defect and an `F-N` entry for the malfunction, cross-referenced by id — never the same content twice.

**Writer mechanism** — stated once here, referenced by every phase workflow, restated by none: the main orchestrator running the phase workflow appends every entry itself, from what it observes — including what a dispatched agent's return text, signal or failure reveals. No agent writes the file and none is asked to self-report friction; reviewers cannot write at all, by host guarantee (`providers.md`). This is the single channel for workflow friction; `state.json` holds no parallel escalation list.

## Retro phase

Runs between `impl-review` and `pr`. Unconditional (never no-op). Owner: main orchestrator (`asd-phase-retro.md`).

Input `<sprint>/friction-log.md`; output `<sprint>/retrospective.html` per `t_retrospective.html` — derived analysis, sprint-scoped, archived with the sprint. Nothing is promoted to a persistent doc.

**Two output classes.** Both are split into consumer-project and ASD-framework actions so every row names the side that acts and its target path; both are proposals the phase never executes and never promotes.

1. **Remediation** — answers *what went wrong*. Every `F-N` entry analysed to a root cause and a recommendation, each traced to the entry id it addresses. Bounded by the log.
2. **Systemic proposals** — answers *what would have made this sprint cheaper*, never *what went wrong*. Evidence is how the sprint actually ran (review iterations, rework loops, gate waits, task churn, dispatch cost), not the entry set: a proposal may cite an `F-N` as supporting evidence, but is neither derived from nor limited by the log. A fact a friction entry already owns is remediation only — rewording it as a proposal is the double-channel duplication this split exists to prevent.

**Empty-log branch**: an absent or entry-free log is a legitimate outcome — record "no friction recorded" and skip class 1; class 2 is still produced, so an entry-free log is never an empty retrospective. Never invent friction entries; never mutate sprint state to reach this branch.

Closes with a short `language.chat` summary covering both classes, then `NEXT: pr`. Adds no gate of its own; only `checkpoints.md`'s existing gates apply.

## PR phase

Modes are `pr=null` (open/prepare PR), `pr.state="open"` (await merge), `pr.state="closure-pending"` (merged, awaiting hard closure approval), and `pr.state="merged"` (done). DoD checks gate publication but are not user approvals. After merge, the main orchestrator records `closure-pending`; only explicit closure approval allows a companion PR to `git.base_branch` containing the terminal state and archive move. Legacy archived non-done sprints remain active/recoverable.

**Open mode's DoD verification is conditional on two checks, neither a `checkpoints.md` gate** (`asd-phase-pr.md` open mode step 1 — internal verification only, gates PR opening, never a user-facing pause):
- **Tests/lint re-run**: content-scoped, not HEAD-sha-equality (HEAD always moves past the recorded sha — the recording commit itself, plus later phase-transition commits, guarantee it). Skipped when `git diff --quiet <recorded HEAD>...HEAD -- <code/test/stub pathspec, excluding .asd/sprints/** and .asd/project/**>` is empty, where `<recorded HEAD>` is the sha in test-plan.md's `Suite run` section — the commit impl-review's terminal full-suite step (`Impacted test set` above) last verified the full suite at, which is also the last point any code/test/stub file can change before `pr`. The check is sha-independent, not read-only-dependent: whatever landed since that recording — a review-fix commit, or the rare in-phase test-defect fix — shows up as a non-empty diff and forces a re-run; an empty diff means nothing changed, full stop.
- **Reviews-green source**: read `state.json.reviews.impl.verdicts["iter-NN"]` for the highest iteration first; parse review files under `<sprint>/reviews/impl/iter-NN/` only as an explicit fallback when `state.json` data is missing or stale. Satisfied-vs-blocking semantics for each entry: "State recovery" below.

## Signal vocabulary

- `COMPLETED` — phase work done, ready for next
- `FAILED` — cannot proceed, reason in body
- `REVIEW_DONE` — reviewer finished, verdict in body
- `QUESTION` — needs user input, body has options
- `PLAN_DRAFT` — plan written, not approved
- `PLAN_READY` — plan approved
- `BLOCKED_MANUAL` — task needs a human-performed manual action; entry registered in `manual-steps.md`
- `ADVICE_NEEDED` — emitter: any dispatched agent other than `asd-advisor`, on non-gate uncertainty only (analysis/judgment question, never a HARD-gate approval decision — see `core.md`'s autonomy/escalation rule for the gate-vs-non-gate distinction). Payload: the question plus relevant context paths. Relay obligation: the dispatching phase workflow catches the signal, dispatches `asd-advisor`, then re-dispatches the consulting agent with its answer appended — the per-workflow relay branch is implemented in each `asd-phase-*.md`.

**`ADVICE_NEEDED` protocol** (every `asd-phase-*.md`'s relay branch is this exact sequence, invoked as "relay per `sprint-lifecycle.md`'s `ADVICE_NEEDED` protocol"):
1. Dispatching phase workflow catches `ADVICE_NEEDED` from a dispatched agent other than `asd-advisor`, mid-task.
2. Dispatches `asd-advisor` with the question plus the context paths as given by the consulting agent — no other context injected.
3. On the advisor's returned recommendation → re-dispatch the consulting agent (`delegate to agent X`, `providers.md`) with its original task context plus the advisor's answer appended; no other context injected except the running consult count/remaining budget (step 6). Not a same-turn resume (no host tool suspends and resumes a dispatched agent mid-execution — `providers.md` has no such operation); it is a fresh dispatch carrying forward the same task.
4. On `asd-advisor` `FAILED` (question turned out to be a HARD gate) → relay that finding to the consulting agent unchanged; the consulting agent then treats it as gate uncertainty per `core.md`'s Autonomy and escalation rule and escalates to the user normally.
5. No halt, no user contact, no logged trail — the round-trip is autonomous and intra-phase (`asd-advisor.md` Do's: consults are not logged).
6. Capped at 3 consults per consulting-agent **task** — the dispatching phase workflow owns this counter (the consulting agent does not; each re-dispatch in step 3 is a fresh dispatch and would otherwise reset a self-held count), increments it once per completed advisor round-trip, and does not reset it across the task's re-dispatches. At the cap, the workflow stops relaying further `ADVICE_NEEDED` signals for that task; the agent proceeds on its own judgment or re-classifies the question as gate uncertainty and escalates per `core.md`'s Autonomy and escalation rule.

## Plan file format

See `t_plan.md` for canonical structure.

**Standing Definition of Done** (constant across every sprint, never restated in `plan.md`): all AC-N from the acceptance-criteria source covered by Tasks; impacted test set green at `impl-test` (`Impacted test set` above); full test suite green once, at the end of `impl-review`; all required reviewers green at `impl-review`. `plan.md`'s own Definition of Done section holds only sprint-specific additions to this standing set, referencing it rather than repeating it.

## Sprint immutability

A sprint folder under `.asd/sprints/archived/<NNN-slug>/` is read-only. Archival itself happens only after explicit closure approval (this file's "PR phase"), so the normal path never writes to an archived folder. The one narrow exception is legacy recovery: a sprint archived pre-merge by an older workflow version gets the terminal write (`pr.state="merged"`, `phase=done`, `updated_at`) applied in place on resume. Once `phase=done`, truly immutable — follow-up work creates a new sprint.

## State recovery

`state.json` is the single recovery point. The dispatching main orchestrator is its sole writer for transitions, verdicts and gate evidence; no delegated agent writes it. After confirmed merge it records `pr.state="closure-pending"` while the sprint remains active. Only explicit closure approval permits the terminal `pr.state="merged"`, `phase="done"`, `archived_at` and archive move. Legacy archived, non-done sprints remain recoverable.

`reviews.impl.iteration_heads["iter-NN"]` (`t_state.json` schema) holds the `git rev-parse HEAD` sha recorded when iteration NN's review starts (written by `asd-phase-impl-review.md` step 2, same step that increments `reviews.impl.iteration`). Iteration NN's diff, for NN ≥ 2, is scoped `git diff reviews.impl.iteration_heads["iter-(NN-1)"]...HEAD <pathspec>` — every commit made during the intervening review-fix + impl-test cycle, not just the last one — mirroring `test-plan.md`'s `Entry log` → `HEAD analysed` pattern (`external-review.md` "Iteration semantics"). Iteration 1 has no prior entry to diff from; its diff stays `git diff <base_branch>...HEAD`. If `iteration_heads["iter-(NN-1)"]` is absent or empty (a sprint in flight when this field shipped), the same base-branch-diff fallback applies — never an empty left operand — with the widened scope noted in that iteration's decisions-log entry.

`reviews.impl.verdicts["iter-NN"]` (`t_state.json` schema) holds one entry per reviewer name (`correctness`/`efficiency`/`testing`/`documentation`/`external`) — every one of these reviewers is always dispatched (`review-policy.md` "DoD per review phase") UNLESS the APPROVE latch above skips it, and per that section's invariant a latch-skipped reviewer still gets its inherited `APPROVE` written here. Each value is one of four distinct things, never conflated:
- a bare verdict token string (`"APPROVE"`/`"CONCERNS"`/`"FAIL"`, parsed from that reviewer's written review file, covering whatever rubric sections it reviewed that dispatch — a section the reviewer itself marked `n/a: <predicate>` in its own returned section-coverage ledger per `review.scoped_fan_out` is bookkeeping internal to that reviewer's file, never a separate state value);
- External Review's availability-skip verdict, `"APPROVE (skipped: <reason>)"` — never the bare token — written when the phase-supplied preflight returns a non-ready status (unavailable command/auth, or active negative cache; `external-review.md` "Detection and negative cache"); satisfies DoD identically to a bare `"APPROVE"` but is never written to `latched` ("APPROVE latch" "Availability-skip carve-out" above);
- a legacy `"skipped: <predicate>"` string (no `APPROVE` prefix, never written by any current-version workflow) — may still be present in `state.json` when a consumer upgrades mid-sprint from a pre-4.0.0 `scoped_fan_out`-driven agent-level dispatch skip; every consumer of this map treats it as **satisfied**, identically to `APPROVE` (`asd-phase-pr.md` open mode step 1's legacy branch);
- an absent key for the current iteration — the reviewer was required, dispatched, and its dispatch was lost, crashed, or ledger-rejected without ever producing a recorded verdict. Always **blocking**, no exception: the APPROVE latch invariant above guarantees a latch-skipped reviewer's key is written anyway, so an absent key never has a second, satisfied meaning.

`null` is never written deliberately. Two gating consumers of this map — `asd-phase-pr.md` step 4, and impl-review's own DoD aggregation (this rule's "Impl-review" phase-table row / `review-policy.md` "DoD per review phase") — treat an absent key for a required reviewer as blocking, full stop; neither consults `latched`. `.asd/hooks/session-start.js`'s `lastReviewVerdict` is a third, display-only consumer (session-summary text, never a gate): it reads only `verdicts["iter-NN"]` for the relevant review node — no `latched` awareness — counting any value starting with `"APPROVE"` (bare or availability-skip) or a legacy `"skipped: ..."` string as satisfied, and — like every hook — must keep failing silently (exit 0, never throw) on any malformed or missing shape.
