# Sprint Lifecycle

## Phases (all mandatory)

```
scope → audit → design → design-review → design-promote → plan → impl ⇄ impl-test → impl-review → pr
                                                                   ↑______________________________|
```

`impl`, `impl-test`, `impl-review` form one cycle:

- `impl` always routes to `impl-test`. impl writes **no tests** — its gate is build + lint; a dev may run the impacted set (below) for self-verification only, never as a substitute for `impl-test`/`impl-review`.
- `impl-test` selects the test approach for the whole change scope, prunes redundant tests, writes missing ones, runs the **impacted set** (below) as its suite gate. Code defects → back to `impl` (test-fix mode), then `impl-test` again. Impacted set green → `impl-review`.
- `impl-review` does NOT fix findings — routes back to `impl` (review-fix mode) on unresolved findings; the sprint then re-enters `impl-test` (code changed → tests re-selected + re-run) before returning to `impl-review`. Once every required reviewer returns `APPROVE` or is latched, `impl-review` runs the **full suite exactly once** — the cycle's only full-suite run — via `asd-tester`, before `NEXT: pr`. On red: test defects are fixed by `asd-tester` and the suite re-run; code defects instead become `D-N` rows in `test-plan.md` + `state.json.test_defects_pending`, and the phase exits to `impl` test-fix mode rather than fixing code in place. Either red path also clears every APPROVE latch sprint-wide (`APPROVE latch` below).

No cap on `impl⇄impl-test` rounds: loop until the impacted set is green or a dev blocker escalates (`FAILED`/`QUESTION`). `impl-review` keeps its iteration cap. Phase routing follows the `NEXT:` token in each phase skill's return contract, not a fixed linear chain.


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

Persisted per phase per reviewer key in `state.json.reviews.<phase>.latched` (`t_state.json`) — a map from reviewer key (the same keys used in `verdicts["iter-NN"]`: `correctness`/`efficiency`/`testing`/`documentation`/`external` for impl-review, `correctness`/`efficiency`/`documentation`/`external` for design-review) to the iteration number at which that reviewer returned `APPROVE`. An absent key means that reviewer has never latched, or its latch was cleared. A sprint in flight when this field shipped carries no `latched` object at all under one or both phase nodes — treat a wholly absent `latched` object the same as an empty one (`{}`, no latches), mirroring the `iteration_heads` absent-key fallback above; never an error.

A reviewer key present in `reviews.<phase>.latched` is NOT dispatched on any later iteration of the same phase (`asd-phase-impl-review.md` step 6, `asd-phase-design-review.md` step 7) and counts as satisfied in DoD aggregation exactly as a fresh `APPROVE` would (`review-policy.md` "DoD per review phase"; "State recovery" below covers the `verdicts["iter-NN"]` interaction for impl-review specifically) — no `verdicts["iter-NN"]` entry is written for a latched reviewer on an iteration where it was skipped for this reason; its existing review file from the iteration it actually latched stands as its evidence, unchanged.

The dispatching phase workflow writes a reviewer's latch entry the moment that reviewer's parsed verdict token for the current iteration is `APPROVE` — same step that records the token into `verdicts["iter-NN"]`. A reviewer already latched from an earlier iteration is left untouched (it produced no new token to record, having not been dispatched).

**Availability-skip carve-out.** Only a verdict produced by an actual review latches. External Review's availability skip (`external-review.md` "Detection" — wrapped-CLI probe failure, not a judgment on the diff) is recorded in `verdicts["iter-NN"].external` as `"APPROVE (skipped: <reason>)"` — distinct from the bare `"APPROVE"` token a completed review writes — and satisfies DoD identically (`review-policy.md` "DoD per review phase") but is NEVER written to `latched`: the dispatching phase workflow's latch-write step (`asd-phase-design-review.md` step 9, `asd-phase-impl-review.md` step 8) writes `latched[<key>] = N` only for the bare `"APPROVE"` token, never for the `"APPROVE (skipped: ...)"` form. A latch means "already reviewed, skip re-review"; an availability skip means only "unavailable this iteration" and must not permanently remove External Review from the sprint once availability returns.

**Reset.** The rollback reset above already clears `latched` to `{}` alongside `iteration`/`verdicts` for the affected phase — no second mechanism for that route.

**Red-full-suite invalidation.** A red full suite (the end-of-`impl-review` terminal suite run) proves previously-approved code was wrong: on that failure, clear BOTH `reviews.design.latched` and `reviews.impl.latched` to `{}` sprint-wide — not only the reviewer(s) whose domain the regression touched — before the sprint routes back to `impl`. The next `impl-review` entry then re-dispatches its full required roster, with no latch surviving from before the failure. This is a DISTINCT clearing route from the rollback reset above, not a consequence of it: a red-suite failure routes to `impl` in test-fix mode, and re-entering `impl`/`impl-test` from `impl-review` is normal cycle re-entry, never a rollback — "Setting phase to `impl` or `impl-test` is not earlier than `impl`" above, so the rollback-reset table never fires for this route. The full-suite step's own implementation (where in the workflow this clearing happens, alongside the rest of its red path) is out of this rule's scope; this paragraph is the contract that step must satisfy.

## Impacted test set

Every scoped test run in `impl` and `impl-test` uses the **impacted set** — defined once, here; every other file cross-links this section, never restates it. `impl-review`'s one terminal run is deliberately unscoped (below).

**Definition.** The impacted set is the union of:
1. test files present in the change-surface diff;
2. tests exercising a changed unit, resolved by repo search over references/imports of the changed modules;
3. tests tagged with an AC-N the change touches (the AC-citation convention — the tag lives in the test's name/path, `t_test-plan.md` "Added tests"; the one exception to `code-style.md` §8's in-code document-reference ban).

**Native selector override.** When `commands.yaml` carries a `test_affected` field (a native runner flag such as `--changedSince`/`--onlyChanged`, or a filter expression), that field's result REPLACES the search-derived set above — the runner's own answer is used, not a second derivation. Field absent → fall back to the search-derived set. The field's shape and `t_commands.yaml`/`asd-init` detection are defined where `commands.yaml` is — this section only names the override mechanism and its key.

**Safety valve — mandatory, not heuristic, checked BEFORE the selector or the search-derived set is used.** `asd-tester` MUST apply this test before every scoped run: when the change surface touches shared infrastructure — build config, CI config, shared/common modules, any framework-wide file — the impacted set degrades to the **full suite** for that run. A rule the tester applies on every run, never a judgment call.

**Where impacted-only applies**: `impl` (self-verification only, below — devs never author/modify/prune a test); `impl-test`'s suite gate (below).

**Where the full suite still runs**: exactly once per sprint cycle, at the end of `impl-review`, after every required reviewer returns `APPROVE` or is latched and before `NEXT: pr` — dispatched to `asd-tester` (reviewers are read-only, `providers.md`; the phase gains this capability only through that one dispatch). Recorded in `test-plan.md`'s existing `Suite run` section including `HEAD`; the `pr` gate keeps reading it from there, wording unchanged (`PR phase` below). Red path and latch-clearing: `impl` bullet above and `APPROVE latch` above. Green full suite is part of impl-review's DoD (`review-policy.md` "DoD per review phase").

## Phase table

| Phase | Owner | Input | Output | Exit criteria |
|---|---|---|---|---|
| scope | PM | user request | `sprint.md`, sprint id, branch | `sprint.md` accepted, branch created |
| audit | Architect + BA | `sprint.md`, codebase, `docs/`, existing docs any format/location | `audit.md`; optional reverse-engineered/migrated drafts in `<sprint>/design/` | audit approved |
| design | BA → UX → Architect | `audit.md` | drafts in `<sprint>/design/` | drafts complete |
| design-review | Correctness (UI section, conditional) + Efficiency + Documentation + External Review | `<sprint>/design/` | `reviews/design/iter-NN/<reviewer>.md` | DoD met |
| design-promote | PM + Architect + BA + UX | approved drafts | persistent docs in `docs/` | drafts merged, decisions-log entry |
| plan | PM | promoted persistent docs | `plan.md` | `plan.md` accepted |
| impl | Dev | `plan.md` (initial), `reviews/impl/iter-NN/` findings (review-fix), or `test-plan.md` Defects (test-fix) | code, `manual-steps.md` | all tasks/findings/defects done; build + lint pass (completion gate) |
| impl-test | Tester | code diff, `plan.md`, PRD ACs, existing tests | `test-plan.md`, tests in repo | impacted set green (`Impacted test set` above) → `impl-review`; code defects → `impl` test-fix mode |
| impl-review | Correctness + Efficiency + Testing + Documentation + External Review | code + tests + `test-plan.md` | `reviews/impl/iter-NN/<reviewer>.md` | all reviewers APPROVE/latched AND terminal full suite green (`Impacted test set` above) → `pr`; red suite → `impl` test-fix mode, latches cleared; unresolved findings → `impl` review-fix mode |
| pr | PM | everything | PR + sprint archive (open mode), then terminal state (merge mode) | PR opened, folder archived on the branch; `phase=done` set on a later re-entry once PR merged |

## Self-hosting

`self_hosting: enabled` in `.asd/project/config.yaml` — sole source of truth, no marker file. Absent field or `disabled` = consumer mode (backward compatible, unchanged behavior).

When enabled: Dev may write canonical `.asd/rules/`, `.asd/templates/`, `.asd/agents/`, `.asd/skills/`, `.asd/workflows/`, `.asd/hooks/`, `.asd/sync.js`, `.asd/sync-state.json`, `.asd/release-manifest.json`, root `AGENTS.md`, `README.md`, `CHANGELOG.md`, `.gitignore`, `tests/**` — the normal "infrastructure read-only during sprint work" invariant (`core.md`) lifts for exactly these paths. This is the exhaustive allowlist — any other citation of the self-hosting write surface (`core.md`, `asd-pm.md`, this section's own versioning note below) points back here rather than restating it. Generated `.claude/`, `.codex/`, `.agents/skills/` stay read-only always — edit canon, then `node .asd/sync.js --apply <targets>`; the generated diff is verified by `sync.js --check`, never re-reviewed as prose.

`asd-init`/`sync.js` never replace root `AGENTS.md`'s managed block from `t_AGENTS.md` while self-hosting — it stays self-sourced framework-dev prose (`providers.md` ownership table). `asd-update` is a no-op here (it pulls framework files INTO a consumer; this repo IS the framework).

Versioning: self-hosting sprints bump `asd_version` and update `CHANGELOG.md` at `pr` open, tag+release at `pr` merge — `git-strategy.md` "Versioning & Changelog".

Framework impl-review/External Review change surface: the whole repo diff (everything here IS framework source — canonical `.asd/**`, `README.md`, `AGENTS.md`, `tests/**`, and anything else added later, e.g. CI configs), minus `.asd/project/**`, `.asd/sprints/**`, generated `.claude/**`/`.codex/**`/`.agents/skills/**`, build output — never an allow-list of named paths, so nothing new needs a matching rule edit to be reviewed.

## Optional documents

`documents.<name>` in config (`audit | prd | ux_spec | adr | c4`), frozen into `state.json.documents` at `scope` — phases read that frozen snapshot, never live config, so a mid-sprint config edit never changes an active sprint's preconditions. Old config without the `documents` group, or an active sprint's `state.json` without a `documents` snapshot, means every value `enabled` (no behavior change). Fail-closed default is per-field, not per-group: when the `documents` group is present but a given field is absent from it, that field is `disabled` — only a wholly-absent group defaults everything to `enabled`. Effective `documents.c4` (computed once, here, at `scope` — never recomputed later) is `enabled` only when `project.subsystem_decomposition: enabled` too; otherwise disabled regardless of the flag.

**Config string → state boolean**: `t_state.json`'s `documents` map holds `"{{DOC_AUDIT}}"`/`"{{DOC_PRD}}"`/`"{{DOC_UX_SPEC}}"`/`"{{DOC_ADR}}"`/`"{{DOC_C4}}"` as quoted placeholders — quoted so the template file itself stays valid, parseable JSON as shipped. At `scope` write time, replace each entire quoted token (**including its surrounding quotes**) with the bare JSON boolean `true`/`false` matching that document's normalized `enabled`/`disabled` value — the written `state.json` must end up with `"audit": true`, never `"audit": "{{DOC_AUDIT}}"` or `"audit": "true"`. Never leave a placeholder token, quoted or not, in a written `state.json`.

**Skip record**: `t_state.json.skipped_phases` starts `[]`. A no-op phase (below) appends its own phase name to this array in the same write that advances `phase` — this is what lets a resumed sprint or a later audit tell "phase legitimately skipped, empty applicable-artifact set" apart from "phase ran and produced nothing," which the `phase`/`updated_at` fields alone cannot distinguish. Never removed or reordered; a phase re-run after a rollback (`checkpoints.md` "Re-running a phase") that turns out non-empty this time does not retroactively remove its earlier skip entry — the array is a historical record, not current status.

**Multi-phase skip**: when one deterministic check subsumes several consecutive no-op phases in a single write — the `design`/`design-review`/`design-promote` collapse below — that one write appends **every** subsumed phase name to `skipped_phases` (`["design", "design-review", "design-promote"]`) and sets `phase` to the **last** subsumed phase name, never one array append per phase and never the first. This way `PHASE_CHAIN[idx+1]` mechanically yields the next real phase and a resumed session cannot re-enter the collapsed block. The subsumed phases are never separately dispatched, so they never make their own individual `skipped_phases` write.

Never optional: `sprint.md`, `state.json`, `plan.md`, `test-plan.md`, impl-review reports, `manual-steps.md` (already lazy), `<sprint>/decisions-log.md`, `stubs.md`. A disabled document is never written as an empty stub — skip recorded in `state.json` plus one decisions-log line.

**Acceptance-criteria source**: PRD AC-N when `documents.prd` enabled; else `sprint.md`'s own `AC-N` list (`t_sprint.md`). Every phase citing AC-N (plan, impl, impl-test, impl-review, pr) uses whichever source the sprint's frozen `documents.prd` selects.

**Independent design docs** (replaces the old hard PRD→UX→ADR chain):
- PRD (`prd`) reads `sprint.md` + `audit.md` (if `audit` enabled).
- UX-spec (`ux_spec`) reads PRD if enabled, else `sprint.md`; audit optional. Disabling `ux_spec` also disables the design-system gate, `design-md-delta.yaml`, and UX promotion.
- ADR (`adr`) reads whichever of PRD/UX-spec exist, else `sprint.md`; audit optional. ADRs are sprint-scoped only (`<sprint>/design/adr.html`, sprint-local `ADR-1`, `ADR-2`, … numbering) and are never promoted as a standalone persistent document — see "Design-promote phase" fold rule.
- C4 (effective `c4`) reads whichever design drafts exist, current stack, `sprint.md`; ADR not required.
- Audit disabled → creators scan the repo themselves for context; Plan PM greps touched files and reads `.asd/project/stubs.md` directly instead of `audit.md`'s "Related open stubs" section.

**No-op phase rule**: a phase whose entire applicable-artifact set is empty for this sprint skips agent dispatch, writes no artifact, appends its phase name to `state.json.skipped_phases` and one line to decisions-log, then returns `COMPLETED` immediately — same phase-chain position, same return-contract shape. **No user approval gate** — a no-op is a deterministic consequence of frozen `state.json.documents`, not a decision; PM advances `phase` and records the skip without requesting user decision (contrast with a phase that DID produce artifacts, which still goes through its normal approve-before-write or write-then-review-accept gate — the two gate classes defined in `checkpoints.md`).

| Phase | No-op when |
|---|---|
| audit | `audit` disabled |
| design | `prd`, `ux_spec`, `adr`, effective `c4` all disabled |
| design-review | design phase produced zero drafts |
| design-promote | zero approved drafts to promote |

`plan`, `impl`, `impl-test`, `impl-review`, `pr` are never no-op.

**Design/design-review/design-promote collapse**: `design-review`'s and `design-promote`'s no-op conditions above are only ever true when `design`'s no-op condition is also true (design produces a draft for every enabled document, so an empty design-review/design-promote scope implies all four `documents.*` were disabled). `design`'s step 2 therefore performs **one** deterministic check for all three at design entry instead of three separate PM dispatches: it writes `phase="design-promote"`, `skipped_phases: ["design", "design-review", "design-promote"]`, and `NEXT: plan` in a single write ("Skip record" multi-phase case above) — `design-review` and `design-promote` are never separately entered in this case. Their own no-op steps remain only as a defensive fallback for a direct/explicit re-dispatch of one of those phases alone.

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

PM orchestrates; three domain creators promote (Documentation reviewer NOT involved):

1. PM proposes per-subsystem decomposition (only when `subsystem_decomposition: enabled`); user approves split.
2. PM proposes new subsystems inferred from drafts; user approves each (name, parent container, description). On approve: Architect patches C4 registry, creates folders.
3. PM distributes `audit.md` migration items to the matching domain (architecture/product/ux).
4. Parallel promotion:
   - `asd-ba` → per-subsystem (or flat) `docs/product/requirements/<subsystem>.html` from prd draft; product migration items.
   - `asd-architect` → folds every ADR approved in `adr.html` into whichever existing persistent doc's `responsibility.owns` frontmatter already declares ownership of that decision's subject (see fold rule below); updates `stack.html`, `tech-reference/`; applies the sprint's c4 delta patch (or, when the persistent registry did not exist before this sprint, writes the full schema directly) to persistent `docs/architecture/c4/`; architecture migration items. Rendering (`dist/` or `architecture.html`) is not regenerated here — build on demand via the `commands.yaml` build-to-view command.
   - `asd-ux` → `docs/ux/<subsystem>.html` from ux-spec draft; patches `DESIGN.md` from `design-md-delta.yaml`; regenerates `design-system.html`; ux migration items.
5. The dispatching phase workflow (`asd-phase-design-promote.md`) composes the decisions-log entries for this promotion and writes `state.json` phase-done — a mechanical non-gate write, not a PM-gated step; per this file's "State recovery" two-writers rule (dispatching phase workflow writes inline for non-gate mechanical writes, site named there).

Dropping the per-persistent-write and final-mutation gates (former steps 4's trailing sentence and step 5) also drops the **partial rollback** affordance they used to offer (confirm / rollback / partial rollback on the whole batch) — no direct replacement exists at this gate level. The compensating control is a non-blocking post-promotion summary the dispatching workflow posts after all writes land (implemented in `asd-phase-design-promote.md`, not this rule doc).

**ADR fold rule**: every architectural decision approved in a sprint's `adr.html` is folded, at `design-promote`, into whichever existing persistent doc already declares ownership of that decision's subject in its `responsibility.owns` frontmatter — never from a lookup table. The `adr.html` article's optional "Fold target" line names the candidate and the matched `owns:` clause; the Architect verifies the match, not invents it. A binding rejected alternative folds as one line into the target doc's Constraints-equivalent section (or the fold target's nearest analogous section); a non-binding rejected alternative stays sprint-archive-only, never promoted. When no existing doc's `owns` matches, that is a Complication Approval, not a licence to invent a document — API contracts fold the same way: into a subsystem requirements/architecture doc, `stack.html`, a project-generated OpenAPI/SDL/proto artifact, or, only via Complication Approval, a brand-new doc with no pre-made template. The design gate stays **one approval for the sprint's whole ADR set** — fold-target selection happens after that gate, during promotion, and never re-opens it.

If `subsystem_decomposition: disabled`: drafts merge into flat project-level docs (`requirements.html`, `ux-spec.html`); ADRs still fold per the rule above, never into a flat `adr/` tree. No subsystem folders, no c4 model.

## Impl phase

Devs implement plan tasks. When a subtask needs a human-only operational action (secret, cloud resource, hand-run migration, env var, third-party account), the dev registers an `MS-N` entry in `<sprint>/manual-steps.md`, marks the subtask `BLOCKED: MS-N` in `plan.md`, emits `BLOCKED_MANUAL`, continues all unblocked work. PM validates each `MS-N` for necessity (`artifact-layout.md`); autonomously-doable entries rejected and returned to the dev. Once all unblocked work COMPLETED and validated `pending` entries remain, the phase halts: PM presents `manual-steps.md`, waits for a continue command. On resume the dev verifies each entry per its `Verification` field, flips it to `done`, finishes the blocked subtasks.

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

**Removal gate** — deleting a test **outside** the sprint change scope needs user approval (Complication Approval format, `core.md`). In-scope removals proceed autonomously with a recorded reason.

**Suite gate** — verdict comes from the actual `test` runner output (exit code plus report), never from an agent's claim, scoped to the impacted set (`Impacted test set` above) — the full suite runs only once, at the end of `impl-review`. Failures triaged:

- **test defect** (bad assertion, wrong fixture, flaky pattern) → fixed inside impl-test, suite re-run.
- **code defect** → appended to the `Defects` section of `test-plan.md`, `state.json.test_defects_pending = true`, `NEXT: impl` (test-fix mode).

Loops until the impacted set passes. No iteration cap — an unfixable state surfaces as a dev/tester `FAILED`, not as a silent exit.

## PR phase

Two modes, detected from `state.json.pr`:

- **Open** (`pr` null) — DoD verification, then compose + open (or prepare) the PR; records `state.json.pr = {number, url, state:"open"}`. Immediately after, moves the sprint folder to `.asd/sprints/archived/<NNN-slug>/` as a dedicated commit on the same branch — bundled into the same PR so it survives squash-merge + auto-delete-branch (a later push to a merged-and-deleted sprint branch is impossible). `phase` stays `pr` (not `done` — the folder moved, the sprint has not actually merged yet). Emits `STATUS=pr-open NEXT=await-merge`. Sprint still counts as active.
- **Merge** (`pr.state="open"`) — entered on a later `/asd-sprint` resume, reading `state.json` from wherever it now lives (usually already `archived/`). Checks merge (`gh pr view` state, or user confirm when `gh_enabled=false`); only when merged does it write the terminal state (`pr.state="merged"`, `phase=done`) — the one deliberate exception to "archived sprints never modified" (`artifact-layout.md` "Sprint archival"). This write still lands on `git.base_branch` only via a PR — but PM opens and merges that one PR itself, autonomously (`git-strategy.md` "Finalize PR (autonomous)"). Not merged → halt, retry after merge.

The folder move is gated on DoD + PR creation, not on merge; the `phase=done` terminal signal is still gated on a confirmed merge, never on PR creation or the folder move. A sprint whose folder already lives under `archived/` but whose `phase` is not yet `done` still counts as the one active sprint (`asd-sprint` step 1 checks both locations).

**Open mode's DoD verification is conditional on two checks, neither a `checkpoints.md` gate** (`asd-phase-pr.md` step 4 — internal verification only, gates PR opening, never a user-facing pause):
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

A sprint folder under `.asd/sprints/archived/<NNN-slug>/` is read-only, with one narrow exception: the `pr` phase's merge-mode terminal write (`pr.state="merged"`, `phase=done`, `updated_at`) to a sprint archived pre-merge (`sprint-lifecycle.md` "PR phase"). Once `phase=done`, truly immutable — follow-up work creates a new sprint.

## State recovery

`state.json` is the single recovery point. Updated on every phase transition, task status change, review verdict. Session-start hook reads it and prints a summary into context. Two writers are permitted: `asd-pm`, for user-gated transitions (approval-gated phase advances, decisions-log entries tied to a gate); and the dispatching phase workflow itself, inline, for purely mechanical non-gate writes (phase-field bumps, decisions-log appends with no approval attached) — named per site in each `asd-phase-*.md`. No other agent writes `state.json`. Named exception: write-then-review-accept per-artifact `accept` appends may be written inline by the dispatching phase workflow when that phase's steps don't otherwise dispatch PM for the artifact (named case: `asd-phase-design.md`'s prd/ux-spec/adr/design-system steps). `archived_at` (ISO8601, null until then) is set by `asd-phase-pr.md`'s **open**-mode step 6 (pre-merge archival), when the sprint folder moves to `.asd/sprints/archived/<NNN-slug>/`; `phase`/`pr.state` stay unchanged at that point (still `pr`/`"open"` — folder moved, not yet merged). A sprint archived before this sprint's schema change may still carry now-removed fields (`subsystems_touched`, `new_subsystems`); the resume path and session-start hook must assume neither their presence nor their absence.

`reviews.impl.iteration_heads["iter-NN"]` (`t_state.json` schema) holds the `git rev-parse HEAD` sha recorded when iteration NN's review starts (written by `asd-phase-impl-review.md` step 2, same step that increments `reviews.impl.iteration`). Iteration NN's diff, for NN ≥ 2, is scoped `git diff reviews.impl.iteration_heads["iter-(NN-1)"]...HEAD <pathspec>` — every commit made during the intervening review-fix + impl-test cycle, not just the last one — mirroring `test-plan.md`'s `Entry log` → `HEAD analysed` pattern (`external-review.md` "Iteration-aware diff"). Iteration 1 has no prior entry to diff from; its diff stays `git diff <base_branch>...HEAD`. If `iteration_heads["iter-(NN-1)"]` is absent or empty (a sprint in flight when this field shipped), the same base-branch-diff fallback applies — never an empty left operand — with the widened scope noted in that iteration's decisions-log entry.

`reviews.impl.verdicts["iter-NN"]` (`t_state.json` schema) holds one entry per reviewer name (`correctness`/`efficiency`/`testing`/`documentation`/`external`) — every one of these reviewers is always dispatched (`review-policy.md` "DoD per review phase") UNLESS the APPROVE latch above skips it. Each value is one of four distinct things, never conflated:
- a bare verdict token string (`"APPROVE"`/`"CONCERNS"`/`"FAIL"`, parsed from that reviewer's written review file, covering whatever rubric sections it reviewed that dispatch — a section the reviewer itself marked `n/a: <predicate>` in its own returned section-coverage ledger per `review.scoped_fan_out` is bookkeeping internal to that reviewer's file, never a separate state value);
- External Review's availability-skip verdict, `"APPROVE (skipped: <reason>)"` — never the bare token — written when its wrapped-CLI probe fails (`external-review.md` "Detection"); satisfies DoD identically to a bare `"APPROVE"` but is never written to `latched` ("APPROVE latch" "Availability-skip carve-out" above);
- a legacy `"skipped: <predicate>"` string (no `APPROVE` prefix, never written by any current-version workflow) — may still be present in `state.json` when a consumer upgrades mid-sprint from a pre-4.0.0 `scoped_fan_out`-driven agent-level dispatch skip; every consumer of this map treats it as **satisfied**, identically to `APPROVE` (`asd-phase-pr.md` step 4's legacy branch);
- an absent key for the current iteration, meaning one of two distinct things, never conflated: the reviewer was required, dispatched, and its dispatch was lost, crashed, or ledger-rejected without ever producing a recorded verdict (**blocking**); or the reviewer carries an entry in `reviews.impl.latched[<key>]` (APPROVE latch above) and so was not dispatched this iteration by design (**satisfied**, counts exactly as `APPROVE`).

`null` is never written deliberately. Two gating consumers of this map — `asd-phase-pr.md` step 4, and impl-review's own DoD aggregation (this rule's "Impl-review" phase-table row / `review-policy.md` "DoD per review phase") — treat an absent key for a required reviewer as blocking UNLESS `reviews.impl.latched` carries that key, in which case it is satisfied. `.asd/hooks/session-start.js`'s `lastReviewVerdict` is a third, display-only consumer (session-summary text, never a gate): it reads both `verdicts["iter-NN"]` and `latched` for the relevant review node, counts a bare/skip-APPROVE token or a legacy `"skipped: ..."` value as satisfied and any present `latched` key as satisfied even with no matching `verdicts` entry, and — like every hook — must keep failing silently (exit 0, never throw) on any malformed or missing shape.
