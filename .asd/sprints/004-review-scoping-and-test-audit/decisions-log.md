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
