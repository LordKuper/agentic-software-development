---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), state.json (state), reviews/ (verdicts)
---

# Decisions Log

Per-sprint, append-only. Never edited or removed. Created at `scope`, archived with the sprint.

## Entry format

```markdown
## YYYY-MM-DD — <one-line summary>

- **Decision**: <what was decided> (≤3 sentences)
- **Rationale**: <why> (≤3 sentences)
- **Affected docs**: <links> (unrestricted)
```

A no-op skip or other zero-content decision uses the one-line form instead:

```markdown
- YYYY-MM-DD — <phase> skipped: <reason>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, or `.asd/project/stubs.md`. Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-09-03 — Sprint 004 scope accepted

- **Decision**: User accepted `sprint.md` with AC-1..AC-11: test-authoring bar and hypothetical-risk criterion in `impl-test`, APPROVE latch (cleared by a red full suite), impl-review change-surface rule, two-tier test running with one full suite at the end of impl-review and a canonical impacted-set definition, raised agent model/effort tiers, five internal code reviewers merged into `asd-reviewer-correctness` + `asd-reviewer-efficiency`, tightened `code-style.md` §7 documentation rules, and a new `Context hygiene` section in `core.md`. Two earlier drafts were reversed on user feedback: the test audit stays in impl-review (not relocated to impl-test), and two-tier test running is adopted (not rejected).
- **Rationale**: Cut review-loop and test-run cost without weakening any gate, while raising the quality floor of each remaining dispatch. Slug `004-review-scoping-and-test-audit` still fits the widened scope; no rename.
- **Affected docs**: [`sprint.md`](sprint.md), [`state.json`](state.json)
- **Documents config**: only `audit` enabled; `prd`, `ux_spec`, `adr`, `c4` disabled — design/design-review/design-promote will collapse into a single no-op at design entry.

## 2026-09-03 — Rollback audit → scope, sprint.md re-opened

- **Decision**: The `audit` phase was interrupted by the user before producing anything — no `audit.md`, no drafts, working tree clean at `beca8d8`. `state.json.phase` set back to `scope` and `sprint.md` re-opened for revision and a fresh `accept`.
- **Rationale**: The user has further scope to add; revising the accepted `sprint.md` is only legitimate from the `scope` phase. Rollback-reset rules (`sprint-lifecycle.md`) applied — both review counters and their `verdicts` were already empty, so the reset was a confirmation, not a change.
- **Affected docs**: [`sprint.md`](sprint.md), [`state.json`](state.json)

## 2026-09-03 — Revised sprint 004 scope accepted (AC-1..AC-15)

- **Decision**: User accepted the revised `sprint.md`. It keeps AC-1..AC-9 (test-authoring bar, APPROVE latch cleared by a red full suite, impl-review change-surface rule, two-tier test running with a canonical impacted-set definition, raised agent tiers, five reviewers merged into `asd-reviewer-correctness` + `asd-reviewer-efficiency`, tightened `code-style.md` §7, `Context hygiene` in `core.md`) and adds AC-10 `asd-backend-dev` + `asd-frontend-dev` → `asd-dev`, AC-11 renames `asd-test-engineer` → `asd-tester` and `asd-ux-designer` → `asd-ux`, AC-12 a versioned `.asd/migrations/` mechanism run in order by `asd-update`, and AC-13 the cleanup migration for this release; AC-14 (cross-file consistency) and AC-15 (verification) close the set.
- **Rationale**: Cut review-loop and test-run cost without weakening any gate, raise the quality floor of each remaining dispatch, and give consumer projects a supported upgrade path for the resulting agent-roster churn. Slug unchanged — it still fits.
- **Open decision deferred to plan**: where a consumer's current ASD version is stored (its `release-manifest.json` vs `config.yaml`); whatever holds it is written only after a migration succeeds (AC-12).
- **Affected docs**: [`sprint.md`](sprint.md), [`state.json`](state.json)
- **Documents config**: only `audit` enabled; `prd`, `ux_spec`, `adr`, `c4` disabled — design/design-review/design-promote collapse into a single no-op at design entry.

## 2026-09-03 — Three scope clarifications answered after acceptance

- **Decision**: (1) AC-12 sequencing — migrations always run AFTER the managed-path replacement; no `pre`/`post` mode knob is introduced. (2) AC-13 applicability — the cleanup migration is the mechanism for CONSUMER projects only; this self-hosted repo does its equivalent cleanup by editing canon and running `.asd/sync.js --apply`, covered by AC-14. (3) AC-10 — `asd-dev` needs no extra UI clause; it inherits `asd-frontend-dev`'s existing conditional wording about consuming DESIGN.md tokens.
- **Rationale**: (1) After replacement the files are current, and this release's migration exists precisely to remove what has just fallen out of `managed_paths`; a future migration needing pre-replacement state can add a mode knob when such a case actually exists. (2) Keeps one cleanup mechanism per audience and avoids a second, script-driven path into this repo's own canon. (3) The inherited wording is already conditional, so no new rule is needed.
- **Affected docs**: [`sprint.md`](sprint.md) (accepted and committed — recorded here rather than reopened)

## 2026-09-03 — Audit approved

- **Decision**: User accepted [`audit.md`](audit.md) (BA + Architect sections merged by the audit workflow). Audit phase closed; sprint advances toward design, which is a collapsed no-op for this sprint (only `documents.audit` enabled).
- **Rationale**: The merged findings cover the full AC-1..AC-15 touch surface and surface several constraints that change how the work must be planned; they are carried forward below rather than re-derived at plan time.
- **Carried forward to plan**:
  - `sync.js` has no orphan detection — a deleted or renamed canonical agent leaves BOTH generated views behind silently. AC-14's expectation therefore resolves to new work in `sync.js` or to explicit manual deletion; the plan must choose.
  - The consumer's installed version already lives in `release-manifest.json.asd_version`, which settles AC-12's open storage decision — but `writeUpdatedManifest` writes the whole manifest atomically, conflicting with AC-12's requirement to record the version after each individual migration. Reconciling the two is plan work.
  - `.asd/migrations` must be added to `managed_paths`, otherwise the mechanism cannot bootstrap into a consumer at all.
  - The migration runner must be loaded from the freshly written tree, the way `loadFreshSync` already does for `sync.js`.
  - No latch storage and no dispatch filter exist today — AC-2 is net-new state plus net-new dispatch logic, not a tweak.
  - `impl-review` is read-only today, and the pr gate's justification depends on that; AC-5's end-of-phase full-suite run via `asd-tester` must not break that property.
  - Three roster tests in `tests/run.js` will fail on the agent churn (AC-7, AC-10, AC-11) and must be updated in the same change.
  - `core.md`'s existing 50%-compaction rule must be ABSORBED by the new `Context hygiene` section (AC-9), not left sitting beside it as a second, conflicting threshold.
- **Affected docs**: [`audit.md`](audit.md), [`state.json`](state.json)

## 2026-09-03 — Plan accepted

- **Decision**: User accepted [`plan.md`](plan.md) — 15 tasks covering AC-1..AC-15, decomposed along `audit.md`'s twelve fact-owner rows, owner `backend-dev` throughout, with sprint-specific DoD additions (green `tests/run.js`, clean `sync.js --check` with no orphaned views, the nine-name grep excluding `.asd/project/decisions-log.md` and `.asd/sprints/archived/**`, and a no-fact-stated-twice check). Three narrowing decisions were folded into the task bodies before acceptance closed.
- **Rationale**: Grouping by fact-owner rather than file type keeps every rename/merge wave atomic — no task leaves the repo half-renamed. Test work stays out of the plan entirely; `impl-test` owns the three breaking roster tests and the new migration-runner coverage.
- **Task 12 — `sync.js` orphan handling**: detect + delete, marker-gated. `--check` reports orphaned generated views and exits non-zero; `--apply` deletes only files carrying the ASD ownership marker; an unmarked file in a generated tree is reported and never touched. Rationale: the marker gate is what prevents deleting a consumer's own agent or skill, which is otherwise indistinguishable from an orphan by path alone.
- **Task 6 — latch invalidation**: the red-full-suite clause is written explicitly, clearing every latch sprint-wide, with a note on whether the rollback reset happens to cover the same route. Rationale: an explicit clause beats an implicit chain-position argument that a later edit to the phase chain could silently break.
- **Task 14 — consumer sprints**: stale reviewer keys in an in-flight sprint are tolerated and no sprint state is rewritten; the migration prints a warning when the active sprint's phase is a review phase, telling the user to finish or re-run that iteration. Rationale: sprint state stays untouched per AC-13, and a warning covers the consequence without a migration reaching into sprint data.
- **Affected docs**: [`plan.md`](plan.md), [`state.json`](state.json)

- 2026-09-03 — design/design-review/design-promote skipped (no documents enabled)

## 2026-09-04 — Impl assessment approved

- **Decision**: User approved the impl assessment (initial mode). All 15 `plan.md` tasks COMPLETED, every checkbox ticked; 26 commits on the sprint branch (117 files, +3274/−2618). Completion gate passed: `node .asd/sync.js --check` exit 0 (64/64 `current`), `git diff --check` exit 0. No stubs introduced. Sprint routes to `impl-test`.
- **Rationale**: Tasks by AC — T1/T2 reviewer merge + change-surface rule (AC-7, AC-3); T3 `asd-dev` (AC-10); T4 renames to `asd-tester`/`asd-ux` (AC-11); T5 tiers (AC-6); T6 APPROVE latch (AC-2); T7/T8 two-tier running + selector field (AC-5); T9 authoring bar + §17 (AC-1, AC-4); T10 `code-style.md` §7 (AC-8); T11 `Context hygiene` (AC-9); T12 `sync.js` orphan handling and T15 sweep (AC-14); T13/T14 migrations (AC-12, AC-13). Agent roster 16 → 12.
- **Carried forward to impl-test** (never impl's to resolve):
  - `node tests/run.js` is 73/83. Two roster tests fail by design of this change — the read-only-agents test still expects 9 agents, and the README/AGENTS count test has no word→number entry for "Twelve". Eight update-driver tests fail because the Task 13/14 migration mechanism outpaced them. All ten are impl-test's.
  - An unplanned `sync.js --apply` fail-open fix landed during impl: a target matching no plan entry used to report `applied: true`; it now reports `not-found`, `ok: false`, exit 1, and the whole batch aborts. Needs test coverage.
  - `.claude/agent-memory/` still holds directories for deleted agents (`asd-reviewer-performance`, `-quality`, `-implementation`, `-simplification`, `-ui`, `asd-backend-dev`, `asd-test-engineer`, `asd-ux-designer`). Outside the dev's write scope and outside AC-15's grep surface. User was asked at this gate and did not answer — unresolved; raise again at the pr gate if nothing settles it sooner.
- **Affected docs**: [`plan.md`](plan.md), [`state.json`](state.json)
