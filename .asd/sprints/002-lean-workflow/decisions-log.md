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

## 2026-09-01 — Sprint 002 scope approved: lean-workflow revision with in-sprint implementation (migrated from sprint-local log)

- **Decision**: Scope approved as written in `.asd/sprints/002-lean-workflow/sprint.md`. The sprint audits the ASD framework along three axes (artifact usefulness/structure, phase usefulness/count, agent count/roles) and implements the accepted recommendations as canonical `.asd/` edits within this same sprint, including structural phase and agent removals, running the full chain through `impl`/`impl-test`/`impl-review`. Acceptance criteria AC-1 … AC-6 fixed; AC-6 requires the implementation, cross-file mirror consistency, a clean `node .asd/sync.js --check`, and a green `node tests/run.js`.
- **Rationale**: The raw scope asked for reductions in sprint duration and artifact volume without material quality loss, and stated recommendations were to be implemented. The user resolved the ambiguity in "впоследствии" in favour of implementing now rather than deferring to a separate sprint, accepting the larger single-sprint scope over a two-sprint split.
- **Decision**: Sprint slug renamed `002-lean-workflow-audit` → `002-lean-workflow`; branch renamed `sprint/002-lean-workflow-audit` → `sprint/002-lean-workflow`.
- **Rationale**: The sprint is not audit-only — it also implements the accepted recommendations, so the `-audit` suffix was misleading.
- **Decision**: Optional documents frozen for this sprint: `audit` enabled; `prd`, `ux_spec`, `adr`, `c4` disabled. The `design`, `design-review`, and `design-promote` phases are therefore no-ops for this sprint.
- **Rationale**: Matches the repo's lean self-hosting profile in `.asd/project/config.yaml`; the framework's specification lives in `.asd/rules/`, so PRD/UX-spec/ADR/C4 artifacts would add churn without informing the work.
- **Provenance note**: The clarification and the approve/edit/reject gate were executed by the orchestrating skill on the agent's behalf (the dispatched agent's toolset lacked a discrete user-decision tool); the skill relayed the user's explicit decisions "implement now" and "rename to 002-lean-workflow", and an explicit approval of the presented draft. Recorded for audit accuracy.
- **Migration note**: Originally written on 2026-09-01 to `.asd/sprints/002-lean-workflow/decisions-log.md`, a file no canonical rule defined at the time. Migrated to `.asd/project/decisions-log.md` verbatim in content when G-1 was interim-resolved in favour of the project-wide log; relocated back here verbatim, in its original chronological position, when Task 6 (A-16/A-17) superseded that interim resolution and made the per-sprint log the sole canonical home.
- **Affected docs**: `.asd/sprints/002-lean-workflow/sprint.md`, `.asd/sprints/002-lean-workflow/state.json`

## 2026-09-01 — Sprint 002 audit approved as-is; flagged risk items explicitly NOT pre-approved

- **Decision**: `audit` phase gate passed. `.asd/sprints/002-lean-workflow/audit.md` (272 lines) approved as written, no changes requested. All three acceptance criteria are satisfied by its verdict tables: AC-1 by "Artifact axis verdicts" (36 rows, A-1…A-36 — keep 18 · compress 12 · merge 1 · drop 5), AC-2 by "Phase axis verdicts" (11 rows, P-1…P-11 — phase count stays 10, no `checkpoints.md` row removed), AC-3 by "Agent axis verdicts" (15 rows, AG-1…AG-15 — roster stays 15, merge 0 · remove 0). `state.json` advanced `phase: "scope"` → `"audit"`. Sprint proceeds to `plan`, where every verdict is decomposed into an individually accept/rejectable task per AC-5.
- **Decision**: Approval of the audit document is **not** approval of any individual verdict, and specifically does **not** blanket-approve the flagged items. These remain open and each requires its own explicit user sign-off when it surfaces as a plan task: **R-1** (A-31 — removes `design-system.html` from the design gate's three-file existence triple; the pause itself stays, the tested file set shrinks), **R-10** (P-9 / AG-11 / AG-14 — diff-scoped reviewer fan-out; trades away off-domain review vigilance for −6 opus/high dispatches per 3-iteration sprint), **R-11** (scope↔audit merge — recorded as rejected by default, deletes a mandated gate), **R-12** (dropping the impl assessment gate — recorded as rejected by default), **G-1** (per-sprint vs project decisions-log SSoT split; determines where this sprint's own AC-5 evidence lives). Also carried forward as decision-blocked and not pre-approved: **G-11** (state.json `phase` landing value under a collapsed multi-phase skip, blocks P-3), **G-12** (explicit `skipped` verdict slot required before P-9 is implementable), **G-4**/**R-6** (compress verdicts change artifact shape for every `/asd-update` consumer; a per-project dial or the A-34 shared stylesheet would each need Complication Approval).
- **Rationale**: The audit is findings-only — it authorises no canonical edit by itself, so approving it is cheap and reversible, while the changes that actually cost something (gate file-set changes, review-coverage reductions) are exactly the ones the sprint's own Out-of-scope list protects: "any reduction that removes a user approval gate mandated by `checkpoints.md` without explicit user sign-off". Splitting the approval this way keeps the phase moving without letting a document-level "approve" launder itself into consent for the two HIGH-risk verdicts. The audit itself flags both (R-1: "flagged here, not assumed"; R-10: "do not accept P-9 silently"), so the split follows the document's own instruction.
- **Provenance note**: The approve/request-changes/reject gate was executed by the orchestrating skill on the agent's behalf (the dispatched agent's toolset lacked a working discrete user-decision tool at runtime); the skill presented the audit summary and relayed the user's explicit decision "approve", together with the explicit qualification that the flagged risk items are not pre-approved. Recorded for audit accuracy, consistent with the same note on the 002 scope decision.
- **Affected docs**: `.asd/sprints/002-lean-workflow/audit.md` (approved, unchanged), `.asd/sprints/002-lean-workflow/state.json` (`phase`, `updated_at`)

## 2026-09-01 — Sprint 002 design skipped (no documents enabled)

- **Decision**: `design` phase skipped as a no-op for sprint `002-lean-workflow` — the frozen `documents` snapshot has `prd`, `ux_spec`, `adr`, and `c4` all disabled, so the phase's entire applicable-artifact set is empty. No creator dispatched, no approval gate, phase appended to `state.json.skipped_phases`.
- **Rationale**: Deterministic consequence of the frozen `documents` config per `.asd/rules/sprint-lifecycle.md` "No-op phase rule", not a decision requiring approval.
- **Affected docs**: `.asd/sprints/002-lean-workflow/state.json` (`phase: design`, `skipped_phases: ["design"]`, `updated_at`).

## 2026-09-01 — Sprint 002 design-review skipped (no in-scope drafts)

- **Decision**: `design-review` skipped as a no-op for sprint `002-lean-workflow` — design phase produced no drafts in `.asd/sprints/002-lean-workflow/design/` (prd/ux_spec/adr/c4 all disabled in the frozen `documents` snapshot), so the review scope is empty per `.asd/workflows/asd-phase-design-review.md` step 2 (No-op path). No reviewer dispatched, no approval gate.
- **Rationale**: Deterministic consequence of the frozen `documents` config per `.asd/rules/sprint-lifecycle.md` "No-op phase rule", not a decision requiring approval.
- **Affected docs**: `.asd/sprints/002-lean-workflow/state.json` (`phase: design-review`, `skipped_phases: ["design", "design-review"]`, `updated_at`).

## 2026-09-01 — Sprint 002 design-promote skipped (nothing to promote)

- **Decision**: `design-promote` skipped as a no-op for sprint `002-lean-workflow` — both `design` and `design-review` were themselves no-ops and no drafts exist in `.asd/sprints/002-lean-workflow/design/`, so promotion scope is empty per `.asd/workflows/asd-phase-design-promote.md` step 2 (No-op path). No decomposition, no creator dispatched, no C4 registry mutation, no persistent `docs/` writes, no approval gate.
- **Rationale**: Deterministic consequence of the frozen `documents` config per `.asd/rules/sprint-lifecycle.md` "No-op phase rule", not a decision requiring approval.
- **Affected docs**: `.asd/sprints/002-lean-workflow/state.json` (`phase: design-promote`, `skipped_phases: ["design", "design-review", "design-promote"]`, `updated_at`).

## 2026-09-01 — Plan approved for sprint 002-lean-workflow (20 tasks, per-verdict decomposition)

- **Decision**: `.asd/sprints/002-lean-workflow/plan.md` approved: 20 tasks, every task owned by `backend-dev` (no UI or application-backend surface in this repo, per audit AG-6), organised **per audit verdict** rather than per file type so no verdict can be half-landed (audit R-5/R-16). Acceptance source is `sprint.md`'s own AC-1…AC-6 (`documents.prd` disabled). Stub inclusion was a no-op — `audit.md` "Related open stubs" reports none.
- **Rationale**: The audit produced 62 individually decidable verdicts whose cross-file mirror sets overlap heavily; grouping by verdict keeps each one separately accept/reject-able at implementation time while letting a verdict's whole mirror set move in one commit. Verdicts marked `keep` with no affected files carry no task — they are accepted as-is and recorded by this entry.
- **Decision**: Per-task decisions taken at this gate. Tasks 1-5, 7, 8, 10, 11 and 16-20 approved as drafted. **Task 6** (decisions log) redesigned: `<sprint>/decisions-log.md` becomes the sole canonical log, created at `scope` and archived with the sprint; `.asd/project/decisions-log.md` is deprecated and frozen with a closing entry; sprint 001 stays immutable; sprint 002's six entries relocate verbatim; a durability rule requires sprint-surviving decisions to be written also into an existing persistent home, never a new document type; the pr merge-mode decisions-log append is deleted outright; `asd-concept`/`asd-stack`/`asd-design-system`/`asd-init` stop appending at all. **Tasks 9 and 11 of the draft merged**: ADRs become sprint-scoped only with sprint-local numbering and fold at `design-promote` into whichever existing persistent doc's `responsibility.owns` already covers the subject (open-set judgment, Complication Approval when nothing owns it), and `t_api.html` is **deleted outright** with every `api.html` reference removed from canon. **Task 12** (A-31) takes a narrowed variant: only the `design-system.html` regeneration trigger changes (once per sprint at `design-promote`, if `DESIGN.md` was touched) — the `checkpoints.md` design-gate file-existence triple is untouched. **Task 13** (P-9/AG-11/AG-14) approved with all four R-10 mitigations mandatory: diff-derived predicates only, conjunctive Performance predicate, explicit `"skipped: <predicate>"` verdict values (G-12), and a switch to restore full fan-out.
- **Rationale**: The two HIGH-risk verdicts were flagged by the audit as not pre-approved (R-1 "flagged here, not assumed"; R-10 "do not accept P-9 silently") and were each given a distinct decision at this gate rather than being folded into the plan-level approval. A-31 was taken in its gate-neutral form because `sprint.md`'s Out-of-scope protects the checkpoints file set; P-9 was accepted with its coverage trade recorded, since it is the largest cost saving on the phase and agent axes.
- **Decision**: **R-11** (merging `scope`↔`audit`) and **R-12** (dropping the impl assessment gate) are **rejected**; both delete a `checkpoints.md`-mandated user gate. Also declined: the A-34 shared-stylesheet variant (breaks single-file artifact portability), a G-6 artifact size-budget mechanism, a G-3 API draft stage or `documents.api` flag, and a per-project dial for the template compressions (G-4 — a new config surface would require Complication Approval). All are recorded in `plan.md` "Out of scope" for traceability rather than silently omitted.
- **Rationale**: `sprint.md` Out of scope item 3 forbids removing a mandated gate without explicit sign-off, and neither R-11 nor R-12 is worth its oversight cost. The declined variants each trade a documented invariant or add a config surface for a saving that a cheaper, reversible option already captures.
- **Resolutions baked into tasks (not left open)**: **G-11** — a collapsed no-op skip sets `state.json.phase = "design-promote"` (the last collapsed phase) so `PHASE_CHAIN[idx+1]` yields `plan` and a resumed session cannot re-enter the block, with all three names in `skipped_phases` and `sprint-lifecycle.md:77` extended for the multi-phase case (Task 14). **G-12** — a scoped-out reviewer writes an explicit string verdict `"skipped: <predicate>"`, distinct from an absent key or `null`, documented in `t_state.json` (Task 13).
- **Bootstrapping note**: This entry was originally written to `.asd/project/decisions-log.md` under the convention live at plan-approval time (the interim G-1 resolution). Task 6 changed that convention and relocated this entry here, verbatim, in its original chronological position.
- **Provenance note**: The plan-level and the two per-task approval gates were executed by the orchestrating skill on the agent's behalf (the dispatched agent's toolset lacked a discrete user-decision tool at runtime). The skill presented the drafted task list, the two HIGH-risk per-task questions, the G-11/G-12 resolution proposals and the process-vs-artifact scope question, and relayed the user's consolidated explicit decisions in one message. Recorded for audit accuracy, consistent with the same note on the 002 scope and audit-approval entries.
- **Affected docs**: `.asd/sprints/002-lean-workflow/plan.md` (created), `.asd/sprints/002-lean-workflow/state.json` (`phase: plan`, `updated_at`), `.asd/sprints/002-lean-workflow/audit.md` (verdict source, unchanged).

## 2026-09-01 — Task 6 landed: `<sprint>/decisions-log.md` is now the sole canonical decisions log, superseding the interim G-1 resolution

- **Decision**: Implemented plan.md Task 6 (verdicts A-16/A-17, gap G-1, final redesigned resolution). `<sprint>/decisions-log.md` is now created at `scope` and archived with the sprint; it is the sole canonical decisions log going forward. `.asd/project/decisions-log.md` is deprecated and frozen with a closing entry — sprint 001's entries stay immutable, sprint 002's six pre-existing entries (this sprint's scope approval, audit approval, the three design/design-review/design-promote no-op skips, and the plan approval) are relocated verbatim, in chronological order, into this file, above. `t_decisions-log.md` rewritten for the new entry format (Decision/Rationale ≤3 sentences each, Affected docs unrestricted, one-line no-op-skip form) plus the durability rule. The `pr` merge-mode terminal decisions-log append is deleted outright (it would write into an already-archived, immutable folder). `asd-concept`/`asd-stack`/`asd-design-system`/`asd-init` no longer dispatch a decisions-log append at all — the authored persistent document (or config change) is itself the record.
- **Rationale**: This supersedes the interim G-1 resolution recorded in `.asd/project/decisions-log.md` on 2026-09-01 ("G-1 resolved: `.asd/project/decisions-log.md` is the sole canonical decisions log"), which was itself superseded by the plan-approval entry above before implementation ever reached it. Implementing now, in `impl`, rather than leaving the plan-approved design undelivered, closes the gap between the recorded decision and the canonical rule text it should have produced.
- **Affected docs**: `.asd/rules/artifact-layout.md`, `.asd/rules/sprint-lifecycle.md`, `.asd/rules/checkpoints.md`, `.asd/rules/external-review.md`, `.asd/templates/t_decisions-log.md`, `.asd/templates/t_stubs.md`, `.asd/agents/asd-pm.md`, `.asd/workflows/asd-phase-scope.md`, `.asd/workflows/asd-phase-design-promote.md`, `.asd/workflows/asd-phase-pr.md`, `.asd/skills/asd-init/SKILL.md`, `.asd/skills/asd-concept/SKILL.md`, `.asd/skills/asd-stack/SKILL.md`, `.asd/skills/asd-design-system/SKILL.md`, `README.md`, `CHANGELOG.md`, `.asd/project/decisions-log.md` (closing entry appended there).
