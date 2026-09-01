# Sprint Lifecycle

## Phases (all mandatory)

```
scope → audit → design → design-review → design-promote → plan → impl ⇄ impl-test → impl-review → pr
                                                                   ↑______________________________|
```

`impl`, `impl-test`, `impl-review` form one cycle:

- `impl` always routes to `impl-test`. impl writes **no tests and runs none** — its gate is build + lint.
- `impl-test` selects the test approach for the whole change scope, prunes redundant tests, writes missing ones, runs the full suite. Code defects → back to `impl` (test-fix mode), then `impl-test` again. Suite green → `impl-review`.
- `impl-review` does NOT fix findings — routes back to `impl` (review-fix mode); the sprint then re-enters `impl-test` (code changed → tests re-selected + re-run) before returning to `impl-review`.

No cap on `impl⇄impl-test` rounds: loop until the suite is green or a dev blocker escalates (`FAILED`/`QUESTION`). `impl-review` keeps its iteration cap. Phase routing follows the `NEXT:` token in each phase skill's return contract, not a fixed linear chain.


## Review iteration counters

Two independent counters in `state.json`, one per review phase:

- `reviews.design.iteration` — design-review iterations
- `reviews.impl.iteration` — impl-review iterations

Each review phase reads, increments, and reports only its own counter. Never shared; severity-floor budget (`review-policy.md`) computed per counter.

**Lifecycle:**

- Both created at `0` when the sprint is initialised in `scope` (per `t_state.json`).
- Each incremented at the **start of every entry** of its phase (`1` on first entry). `design-review` entered once, loops internally. `impl-review` re-entered each cycle; the intervening `impl` and `impl-test` phases do not touch the counter — it accumulates across the whole cycle.
- **Rollback reset.** When `state.json.phase` is set strictly earlier in the chain than a review's input-producing phase, that counter resets to `0`, its severity floor resets, and its `verdicts` clear. Input-producing phases: `design` for design-review, `impl` for impl-review.

  | Counter | Resets when phase set to |
  |---|---|
  | `reviews.design.iteration` | `scope`, `audit` |
  | `reviews.impl.iteration` | `scope`, `audit`, `design`, `design-review`, `design-promote`, `plan` |

  Setting phase to `impl` or `impl-test` is not earlier than `impl` — normal cycle re-entry never resets. Reset fires only on a genuine rollback (the `asd-sprint` resume menu's *re-run earlier phase*). Rationale: once the artifact under review is re-created from an earlier phase, prior review rounds are void.
- On iteration-cap override, the counter keeps incrementing — not reset. Severity floor stays pinned at `critical`.

Verdict files: design-review → `<sprint>/reviews/design/iter-NN/`, impl-review → `<sprint>/reviews/impl/iter-NN/`, `NN` = that phase's own counter.

## Phase table

| Phase | Owner | Input | Output | Exit criteria |
|---|---|---|---|---|
| scope | PM | user request | `sprint.md`, sprint id, branch | scope approved, branch created |
| audit | Architect + BA | `sprint.md`, codebase, `design/`, existing docs any format/location | `audit.md`; optional reverse-engineered/migrated drafts in `<sprint>/design/` | audit approved |
| design | BA → UX Designer → Architect | `audit.md` | drafts in `<sprint>/design/` | drafts complete |
| design-review | Documentation + UI + Simplification + External Review | `<sprint>/design/` | `reviews/design/iter-NN/<reviewer>.md` | DoD met |
| design-promote | PM + Architect + BA + UX Designer | approved drafts | persistent docs in `design/` | drafts merged, decisions-log entry |
| plan | PM | promoted persistent docs | `plan.md` | plan approved |
| impl | Backend Dev + Frontend Dev | `plan.md` (initial), `reviews/impl/iter-NN/` findings (review-fix), or `test-plan.md` Defects (test-fix) | code, `manual-steps.md` | all tasks/findings/defects done; build + lint pass (completion gate) |
| impl-test | Test Engineer | code diff, `plan.md`, PRD ACs, existing tests | `test-plan.md`, tests in repo | full suite green → `impl-review`; code defects → `impl` test-fix mode |
| impl-review | Quality + Implementation + Testing + UI + Simplification + Documentation + Performance + External Review | code + tests + `test-plan.md` | `reviews/impl/iter-NN/<reviewer>.md` | DoD met → `pr`; else route to `impl` review-fix mode |
| pr | PM | everything | PR (open mode), then sprint archive (merge mode) | PR opened; sprint archived on a later re-entry once PR merged |

## Self-hosting

`self_hosting: enabled` in `.asd/project/config.yaml` — sole source of truth, no marker file. Absent field or `disabled` = consumer mode (backward compatible, unchanged behavior).

When enabled: Backend Dev / Frontend Dev may write canonical `.asd/rules/`, `.asd/templates/`, `.asd/agents/`, `.asd/skills/`, `.asd/workflows/`, `.asd/hooks/`, `.asd/sync.js`, `.asd/release-manifest.json`, root `AGENTS.md`, `README.md`, `tests/**` — the normal "infrastructure read-only during sprint work" invariant (`core.md`) lifts for exactly these paths. Generated `.claude/`, `.codex/`, `.agents/skills/` stay read-only always — edit canon, then `node .asd/sync.js --apply <targets>`; the generated diff is verified by `sync.js --check`, never re-reviewed as prose.

`asd-init`/`sync.js` never replace root `AGENTS.md`'s managed block from `t_AGENTS.md` while self-hosting — it stays self-sourced framework-dev prose (`providers.md` ownership table). `asd-update` is a no-op here (it pulls framework files INTO a consumer; this repo IS the framework).

Versioning: self-hosting sprints bump `asd_version` and update `CHANGELOG.md` at `pr` open, tag+release at `pr` merge — `git-strategy.md` "Versioning & Changelog".

Framework impl-review/External Review change surface: the whole repo diff (everything here IS framework source — canonical `.asd/**`, `README.md`, `AGENTS.md`, `tests/**`, and anything else added later, e.g. CI configs), minus `.asd/project/**`, `.asd/sprints/**`, generated `.claude/**`/`.codex/**`/`.agents/skills/**`, build output — never an allow-list of named paths, so nothing new needs a matching rule edit to be reviewed.

## Optional documents

`documents.<name>` in config (`audit | prd | ux_spec | adr | c4`), frozen into `state.json.documents` at `scope` — phases read that frozen snapshot, never live config, so a mid-sprint config edit never changes an active sprint's preconditions. Old config without the `documents` group, or an active sprint's `state.json` without a `documents` snapshot, means every value `enabled` (no behavior change). Effective `documents.c4` (computed once, here, at `scope` — never recomputed later) is `enabled` only when `project.subsystem_decomposition: enabled` too; otherwise disabled regardless of the flag.

**Config string → state boolean**: `t_state.json`'s `documents` map holds `"{{DOC_AUDIT}}"`/`"{{DOC_PRD}}"`/`"{{DOC_UX_SPEC}}"`/`"{{DOC_ADR}}"`/`"{{DOC_C4}}"` as quoted placeholders — quoted so the template file itself stays valid, parseable JSON as shipped. At `scope` write time, replace each entire quoted token (**including its surrounding quotes**) with the bare JSON boolean `true`/`false` matching that document's normalized `enabled`/`disabled` value — the written `state.json` must end up with `"audit": true`, never `"audit": "{{DOC_AUDIT}}"` or `"audit": "true"`. Never leave a placeholder token, quoted or not, in a written `state.json`.

**Skip record**: `t_state.json.skipped_phases` starts `[]`. A no-op phase (below) appends its own phase name to this array in the same write that advances `phase` — this is what lets a resumed sprint or a later audit tell "phase legitimately skipped, empty applicable-artifact set" apart from "phase ran and produced nothing," which the `phase`/`updated_at` fields alone cannot distinguish. Never removed or reordered; a phase re-run after a rollback (`checkpoints.md` "Re-running a phase") that turns out non-empty this time does not retroactively remove its earlier skip entry — the array is a historical record, not current status.

Never optional: `sprint.md`, `state.json`, `plan.md`, `test-plan.md`, impl-review reports, `manual-steps.md` (already lazy), `.asd/project/decisions-log.md`, `stubs.md`. A disabled document is never written as an empty stub — skip recorded in `state.json` plus one decisions-log line.

**Acceptance-criteria source**: PRD AC-N when `documents.prd` enabled; else `sprint.md`'s own `AC-N` list (`t_sprint.md`). Every phase citing AC-N (plan, impl, impl-review, pr) uses whichever source the sprint's frozen `documents.prd` selects.

**Independent design docs** (replaces the old hard PRD→UX→ADR chain):
- PRD (`prd`) reads `sprint.md` + `audit.md` (if `audit` enabled).
- UX-spec (`ux_spec`) reads PRD if enabled, else `sprint.md`; audit optional. Disabling `ux_spec` also disables the design-system gate, `design-md-delta.yaml`, and UX promotion.
- ADR (`adr`) reads whichever of PRD/UX-spec exist, else `sprint.md`; audit optional.
- C4 (effective `c4`) reads whichever design drafts exist, current stack, `sprint.md`; ADR not required.
- Audit disabled → creators scan the repo themselves for context; Plan PM greps touched files and reads `.asd/project/stubs.md` directly instead of `audit.md`'s "Related open stubs" section.

**No-op phase rule**: a phase whose entire applicable-artifact set is empty for this sprint skips agent dispatch, writes no artifact, appends its phase name to `state.json.skipped_phases` and one line to decisions-log, then returns `COMPLETED` immediately — same phase-chain position, same return-contract shape. **No user approval gate** — a no-op is a deterministic consequence of frozen `state.json.documents`, not a decision; PM advances `phase` and records the skip without requesting user decision (contrast with a phase that DID produce artifacts, which still goes through its normal gate in `checkpoints.md`).

| Phase | No-op when |
|---|---|
| audit | `audit` disabled |
| design | `prd`, `ux_spec`, `adr`, effective `c4` all disabled |
| design-review | design phase produced zero drafts |
| design-promote | zero approved drafts to promote |

`plan`, `impl`, `impl-test`, `impl-review`, `pr` are never no-op.

## Audit phase

No-op when `documents.audit: disabled` (see "Optional documents").

Scans: existing source in touched areas; existing docs in **any format/location** (MD, RST, Confluence/Notion exports, HTML, Wiki, text-extractable PDF, READMEs outside ASD layout); persistent docs in `design/`.

Output `audit.md` — findings (touched areas, existing docs/code, gaps, risks) plus **Documentation migration plan** listing found external docs to promote into ASD format. Where sprint scope directly overlaps found content, the agent may pre-formulate reverse-engineered/migrated drafts in `<sprint>/design/` (prd.html / adr.html) — **only for documents whose frozen `documents.*` flag is enabled**; a disabled document is never draft-created here either, its finding stays migration-plan text — with `provenance` + `source` frontmatter; these flow through design and design-review like any draft. Migration items not covered by drafts wait for design-promote.


## Design phase

No-op when `prd`, `ux_spec`, `adr`, and effective `c4` are all disabled (see "Optional documents").

Agents produce a draft set for the whole sprint scope in `<sprint>/design/`, one artifact per enabled document only — a disabled document produces no draft, no gate, no dependency on it:

- `prd.html` — requirements + acceptance criteria (`documents.prd`)
- `ux-spec.html` — flows + accessibility notes (`documents.ux_spec`)
- `adr.html` — architecture decisions (`documents.adr`)
- `design-md-delta.yaml` — proposed DESIGN.md token changes, produced inline during UX-spec authoring (only on token gap; each entry user-approved)
- `c4-full/` — full LikeC4 schema for sprint scope (`model/*.c4`, `views.c4`, `dist/`) (effective `documents.c4`)

Order among enabled documents: PRD (if enabled) before design-system gate. Design-system gate (existence check on `design/ux/DESIGN.md`, `design-system.html`, `accessibility.html`; dispatches `/asd-design-system` when any missing) applies only when `ux_spec` enabled, and blocks UX-spec. UX-spec (if enabled) before ADR. ADR (if enabled) before c4-full. If effective `documents.c4: disabled` (flag off, or `subsystem_decomposition: disabled`), `c4-full/` omitted.


## Design-promote phase

No-op when the design phase produced zero drafts (see "Optional documents"). Otherwise each domain creator promotes only the draft(s) that exist for its domain.

PM orchestrates; three domain creators promote (Documentation reviewer NOT involved):

1. PM proposes per-subsystem decomposition (only when `subsystem_decomposition: enabled`); user approves split.
2. PM proposes new subsystems inferred from drafts; user approves each (name, parent container, description). On approve: Architect patches C4 registry, creates folders, runs `likec4 build` if applicable.
3. PM distributes `audit.md` migration items to the matching domain (architecture/product/ux/api).
4. Parallel promotion:
   - `asd-ba` → per-subsystem (or flat) `design/product/requirements/<subsystem>.html` from prd draft; product migration items.
   - `asd-architect` → `design/architecture/adr/<subsystem>/adr-NNNN-<slug>.html`; updates `api/<subsystem>.html`, `stack.html`, `tech-reference/`; applies c4 delta to persistent `design/architecture/c4/`; regenerates `dist/` (likec4) or `architecture.html` (mermaid); architecture migration items.
   - `asd-ux-designer` → `design/ux/<subsystem>.html` from ux-spec draft; patches `DESIGN.md` from `design-md-delta.yaml`; regenerates `design-system.html`; ux migration items.
   - Each creator requests user decision before each persistent write.
5. PM final user confirmation before persistent mutation (confirm / rollback / partial rollback).
6. PM appends decisions-log entries, finalises `state.json`.

If `subsystem_decomposition: disabled`: drafts merge into flat project-level docs (`requirements.html`, `adr/adr-NNNN-<slug>.html`, `api.html`, `ux-spec.html`). No subsystem folders, no c4 model.

## Impl phase

Devs implement plan tasks. When a subtask needs a human-only operational action (secret, cloud resource, hand-run migration, env var, third-party account), the dev registers an `MS-N` entry in `<sprint>/manual-steps.md`, marks the subtask `BLOCKED: MS-N` in `plan.md`, emits `BLOCKED_MANUAL`, continues all unblocked work. PM validates each `MS-N` for necessity (`artifact-layout.md`); autonomously-doable entries rejected and returned to the dev. Once all unblocked work COMPLETED and validated `pending` entries remain, the phase halts: PM presents `manual-steps.md`, waits for a continue command. On resume the dev verifies each entry per its `Verification` field, flips it to `done`, finishes the blocked subtasks.

Devs write **production code only** — no tests, no test runs. All test work belongs to `impl-test`.

**Modes** — detected from `state.json`:

- **Initial** (`review_fixes_pending` and `test_defects_pending` both null) — implement `plan.md` tasks. Ends with the user-facing impl assessment gate.
- **Review-fix** (`review_fixes_pending` = `iter-NN`) — entered when impl-review routed back. Devs read findings in `<sprint>/reviews/impl/iter-NN/`, resolve every CONCERNS finding plus every user-approved FAIL finding. Clears `review_fixes_pending` on completion.
- **Test-fix** (`test_defects_pending` = `true`) — entered when impl-test found code defects. Devs resolve every open defect in the `Defects` section of `<sprint>/test-plan.md`, marking each `fixed` with the fixing commit. Clears `test_defects_pending` on completion.

Only one fix flag is ever set: each fix mode clears its own before routing on. Fix modes skip the impl assessment gate; blockers escalate as in initial mode. All modes return `NEXT: impl-test`.

**Completion gate** (all modes) — impl MUST NOT emit `COMPLETED` until, verified via `commands.yaml`: `build` and `lint` ran with no errors and no warnings. Tests are not run here. On failure: devs fix and re-run; unrecoverable failure escalates as `FAILED`. Automatic verification, not a user pause.

## Impl-test phase

Owner: Test Engineer. Runs after every `impl` exit. Selects the test approach **after** the implementation exists, so tests follow the real change surface instead of a speculative one.

**Principles** (binding; rubric detail in `code-style.md` §17):

- Risk-based and change-scoped: cheapest reliable check per material risk — static/architecture check → focused unit or property test for logic → component or contract test at boundaries → only essential e2e journeys.
- Prune: delete trivial, implementation-coupled, mock-confirming, redundant, and flaky tests within the change scope.
- A **no-new-test decision** is legitimate only when the change adds no behaviour or existing checks already cover the material risk — and must be recorded with its reason in `test-plan.md`.
- Coverage numbers are a signal for finding untested code, never a quota.
- Every fixed defect leaves a regression test proven against the pre-fix behaviour (fail-first run recorded) or an equivalent targeted mutation.

**Workflow**: change-surface analysis → `test-plan.md` (risk → chosen check → decision) → prune + author → full suite run.

**Removal gate** — deleting a test **outside** the sprint change scope needs user approval (Complication Approval format, `core.md`). In-scope removals proceed autonomously with a recorded reason.

**Suite gate** — verdict comes from the actual `test` runner output (exit code plus report), never from an agent's claim. Failures triaged:

- **test defect** (bad assertion, wrong fixture, flaky pattern) → fixed inside impl-test, suite re-run.
- **code defect** → appended to the `Defects` section of `test-plan.md`, `state.json.test_defects_pending = true`, `NEXT: impl` (test-fix mode).

Loops until the full suite passes. No iteration cap — an unfixable state surfaces as a dev/test-engineer `FAILED`, not as a silent exit.

## PR phase

Two modes, detected from `state.json.pr`:

- **Open** (`pr` null) — DoD verification, then compose + open (or prepare) the PR. On success records `state.json.pr = {number, url, state:"open"}`, keeps `phase=pr`, emits `STATUS=pr-open NEXT=await-merge`. **No archival.** Sprint stays active.
- **Merge** (`pr.state="open"`) — entered on a later `/asd-sprint` resume. Checks merge (`gh pr view` state, or user confirm when `gh_enabled=false`); only when merged does it archive the sprint (`pr.state="merged"`, `phase=done`). Not merged → halt, retry after merge.

Archival is gated on merge, never on PR creation.

## Signal vocabulary

- `COMPLETED` — phase work done, ready for next
- `FAILED` — cannot proceed, reason in body
- `REVIEW_DONE` — reviewer finished, verdict in body
- `QUESTION` — needs user input, body has options
- `PLAN_DRAFT` — plan written, not approved
- `PLAN_READY` — plan approved
- `BLOCKED_MANUAL` — task needs a human-performed manual action; entry registered in `manual-steps.md`

## Plan file format

See `t_plan.md` for canonical structure.

## Sprint immutability

A closed sprint folder under `.asd/sprints/archived/<NNN-slug>/` is read-only. Follow-up work creates a new sprint.

## State recovery

`state.json` is the single recovery point. Updated on every phase transition, task status change, review verdict. Session-start hook reads it and prints a summary into context.
