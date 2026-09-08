---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 008-retro-007-remediation

## Goal

Resolve every problem identified in the sprint 007 retrospective
(`.asd/sprints/archived/007-retrospective-phase/retrospective.html`). That file's
**Actions** and **Systemic proposals** tables are the source of truth for scope; each
`AC-N` below traces to one row.

Two classes of work, one sprint:

- **Actions** — remediation of the seven friction entries `F-1`..`F-7`, whose dominant
  signal was recurrence: a correction that landed only in one agent's memory did not
  survive the next dispatch. Every fix here therefore lands as a rule, a contract or a
  tool behaviour, never as guidance in a single agent file.
- **Systemic proposals** — five changes read off how the sprint actually ran (three
  review iterations, forty-two findings, eight implementation dispatches), each aimed
  at a recurring cost rather than at a specific failure.

Self-hosting sprint: this repo IS the ASD framework, so the retrospective's `asd` and
`consumer` targets are both edited here.

## Acceptance

### Actions (friction remediation)

- AC-1: `F-1`/`F-5` — a split read-only review is a documented contract, not an
  improvisation: `.asd/rules/review-policy.md` states when a read-only dispatch is too
  large to complete in one turn, how that reviewer's rubric is partitioned, and the
  shape of the resulting half-verdicts and their merge into one recorded verdict; the
  `*-review` phase workflows implement that contract so a split never has to be invented
  after a failure.
- AC-2: `F-2` — `.asd/rules/providers.md` states that writing a large artifact uses the
  file-write semantic operation, never a shell heredoc, so the shell layer's quoting
  constraints are never imposed on artifact content.
- AC-3: `F-3`/`F-7` — `.asd/rules/artifact-layout.md` states that agent memory lives at
  the provider-view root and never inside a sprint tree, and that a sprint folder holds
  only the artifacts the path map names. The statement is a rule, reachable by any agent
  on any dispatch — not an entry in one agent's memory.
- AC-4: `F-4` — **closed as already satisfied at scope time, no code change.** `.asd/sync.js`
  has failed closed on an unmatched `--apply` target since v4.0.0 (`ok: false`, exit 1,
  whole batch aborted); the audit verified it by running the tool. `F-4`'s remaining live
  cause is the stale wording, which AC-5 fixes, and stale agent memory, which AC-3
  addresses. The deliberate `orphan-unmarked` ok-result (`sync.js:1416`, contracted in
  `providers.md` "Orphan detection") is left as designed.
- AC-5: `F-4` — the sync-step argument wording is corrected at **every real occurrence**:
  `AGENTS.md:74`, `.asd/project/custom-coding-rules.md:14`, `.asd/agents/asd-dev.md:66`,
  `.asd/workflows/asd-phase-impl.md:49`, `README.md:38/106/439`,
  `.asd/skills/asd-update/SKILL.md:37`. `.asd/templates/t_AGENTS.md` is dropped from the
  target list — it contains no sync wording at all. Editing
  `.asd/project/custom-coding-rules.md` is a one-off authorized exception to the
  self-hosting write allowlist, verified by grep because `.asd/project/**` is outside the
  review surface.
- AC-6: `F-6` — an interrupted reviewer dispatch has a defined outcome in
  `.asd/rules/review-policy.md`, and that outcome is **never a skip and never an APPROVE**:
  the reviewer is re-dispatched fresh within the same iteration — the shape the invalid
  coverage ledger already uses — with the interrupted attempt recorded so the loss is
  visible rather than silent. External Review's availability skip stays exclusive to an
  unavailable provider; an internal reviewer is always available and therefore never
  satisfies DoD without a completed verdict.

### Systemic proposals

- AC-7: implementation dispatches carry the same over-engineering and SSoT checklists
  that reviewers judge against — `.asd/rules/code-style.md` and
  `.asd/workflows/asd-phase-impl.md` make the checklist applicable at authoring time, not
  only at design and review time.
- AC-8: the external-review negative cache is checked before the scope manifest is
  assembled and the agent dispatched, not after — `.asd/workflows/asd-phase-impl-review.md`
  and `.asd/rules/external-review.md` agree on that order, so a known-unavailable provider
  costs no manifest assembly and no dispatch.
- AC-9: `.asd/rules/git-strategy.md` states plainly that the main orchestrator commits its
  own bookkeeping at phase exit, so a dispatched agent never commits orchestrator-owned
  files defensively to satisfy the next gate's clean-tree precondition.
- AC-10: the plan's material-risk declaration distinguishes risk-to-the-change from
  risk-to-the-artifact, and task routing reads that distinction — `.asd/rules/sprint-lifecycle.md`
  plan format and `.asd/runtime.js` routing input agree — so a mechanical edit to a
  high-stakes artifact no longer routes to the most expensive tier by that fact alone.
- AC-11: **retired at impl-review iteration 4, no deliverable.** The criterion was that a
  cycle re-entry reads the derived scope list instead of rebuilding it. Three review rounds
  established that the stated purpose is unreachable by construction: `impl-test` stamps its
  `HEAD analysed` before its own bookkeeping commit while `impl-review` records
  `iteration_heads` after it, so writer and reader bases differ on every iteration ≥ 2 and only
  the first handoff can ever hit. Each attempt to repair it closed its own finding and left the
  purpose unmet. `derived_handoff` is removed entirely — the state field, its rule paragraph,
  the workflow wiring and its tests — and this criterion is closed as not delivered rather than
  recorded as met. The underlying retrospective proposal stays open for a future sprint.
- AC-15: **scope expansion, authorized 2026-09-08 after impl-review iteration 4.** The reviewer
  read-only property must match what the host actually grants. `review-policy.md` states
  reviewers "cannot write at all, by host guarantee"; the canonical grant is
  `[Read, Glob, Grep, AskUserQuestion]` with `memory: project`, and the host adds a
  file-writing capability to serve that memory channel — so the absolute claim is false while
  the artifact-level claim it was written about is true. Reconcile the two: state what reviewers
  actually cannot write (review artifacts, code, docs) and account for the memory channel, or
  change the config so the guarantee holds. In the same pass, record which emitted agent
  frontmatter fields are host-verified and which are emitted on trust — `.asd/sync.js`'s own
  comment admits `effort` is undocumented for the host, and that distinction belongs in the
  rules rather than in a code comment. Finally, `.asd/sync.js` and
  `.asd/skills/asd-update/update.js` carry comments written in Russian that quote a project plan
  document, violating both `language-policy.md` (workflow infrastructure is English always) and
  `code-style.md` §8 (no code comment references a project document) — translate or delete them.

### Cross-cutting

- AC-12: cross-file consistency holds for every change above — `README.md` mirrors
  (phase list, agent roster and model tiers for both providers, config schema, folder
  map, command list), `core.md` "See also", the eleven-phase chain, template variables,
  and `.asd/release-manifest.json` (`managed_paths`, `canon_hashes`, `model_families`).
- AC-13: `node tests/run.js` is green, with coverage extended to the new machine-checkable
  behaviour this sprint actually introduces — AC-1's manifest-partition union property,
  AC-6's re-dispatch record, AC-10's routing input (both accepted shapes) and AC-11's
  state field. The AC-4 unmatched-target error needs no new test: `tests/run.js` §11
  already asserts it twice. Append as `§19`; the existing section numbering has
  pre-existing collisions and is left alone.
- AC-14: every canonical edit is reflected in the generated provider views via
  `.asd/sync.js --apply`; no generated file is hand-edited and no view is left stale.

## Out of scope

- The `F-1`/`F-5` recommendation to "keep sprint scope small enough that one reviewer
  dispatch covers the diff" — a scoping practice for future sprints, not a change to any
  file in this repository. Recorded here so its absence is deliberate rather than missed.
- Any behaviour not named by a row of the sprint 007 retrospective's two tables.
