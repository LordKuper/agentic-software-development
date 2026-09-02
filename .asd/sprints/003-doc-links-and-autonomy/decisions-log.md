---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), state.json (state), reviews/ (verdicts)
---

# Decisions Log

Per-sprint, append-only. Never edited or removed. Created at `scope`, archived with the sprint.

## Entries

<!-- entries appended below this line -->

## 2026-09-02 — scope approved: doc-links review mechanic + asd-advisor autonomy

- **Decision**: User approved sprint scope with AC-1..AC-8 as written in `sprint.md`. Gated artifacts move to write-then-review-accept (link + delta summary in chat, review in the real file, revise in place); `c4-full/` loses its gate entirely; design-promote loses its final-mutation and per-persistent-write gates but keeps decomposition and new-subsystem gates; a new read-only `asd-advisor` agent absorbs non-gate agent uncertainty.
- **Rationale**: Full-content dumps into chat and redundant re-confirmation of already-accepted drafts are the dominant cost in ASD's user loop. Decomposition/new-subsystem gates are retained because they decide persistent-doc and C4-registry layout, which AC-1's draft acceptance never showed the user.
- **Affected docs**: `.asd/sprints/003-doc-links-and-autonomy/sprint.md`; planned targets `.asd/rules/checkpoints.md`, `.asd/agents/asd-pm.md`, `.asd/agents/asd-advisor.md` (new), `.asd/workflows/asd-phase-*.md`, `.asd/release-manifest.json`, `README.md`.
- **Config note**: per `.asd/project/config.yaml`, `documents.audit: enabled`; `prd`/`ux_spec`/`adr`/`c4` disabled — frozen into `state.json.documents`, so design/design-review/design-promote will collapse to the no-op path after audit.
- **Bootstrap note**: this sprint's own `scope` gate used the old chat-text approve-before-write mechanic; AC-1 goes live starting at this sprint's `plan` gate.

## 2026-09-02 — audit approved

- **Decision**: User approved `audit.md` unchanged (no section re-dispatch). Audit confirms `checkpoints.md` is the gate SSoT with ~6 rule files, 5 workflows, 4 skills, 5 agent files and README/AGENTS.md as mirrors; confirms design-promote has four gate classes, not three, matching AC-4's split; confirms `sync.js` needs no engine change for a 16th agent and `tests/run.js` has no gate/agent-count coverage.
- **Rationale**: Findings are complete and consistent with the approved AC set; the open items it raises are design/plan decisions, not defects in the audit itself.
- **Affected docs**: [audit.md](./audit.md), [sprint.md](./sprint.md)
- **Carried forward to plan phase** (design/design-review/design-promote collapse to a no-op — `documents.prd`/`ux_spec`/`adr`/`c4` all disabled — so these land at `plan`, not `design`):
  - **G-3** — `asd-advisor` dispatch path undecided: (a) agent→agent, adding `Task` to all 15 agents' `claude.tools` (currently zero occurrences, G-4) with Codex subagent-nesting unverified (R-7); vs (b) workflow-mediated relay, new signal token plus a branch in all 10 `asd-phase-*.md`. Requires a user decision, must not be picked silently.
  - **R-2** — advisor consults have no audit trail; needs a durable home (decisions-log line per consult, `<sprint>/advisories/`, or read-only-analysis-only). The clause "never authorizes, never substitutes for a HARD gate" is mandatory regardless.
  - **G-9 / R-6** — `.asd/sync.js --check` is already unclean (`AGENTS.md` `modified-foreign`, pre-existing drift from sprint 002 commit `317aa50`). AC-8 demands a clean `--check`, so the sprint must re-baseline the digest in `.asd/sync-state.json` — a path outside `sprint-lifecycle.md` "Self-hosting"'s exhaustive write allowlist. Route via `/asd-sync`'s `keep-local` path or amend the allowlist; settle at plan time, not mid-impl.
  - **R-5** — live for this repo: `language.chat: ru`, `language.docs: en`, so under write-then-review the user reviews files in a language they do not interact in. Needs a `language-policy.md` rule (self-sufficient delta summary, or key passages quoted-and-translated per the existing quote-translation precedent, without dumping the body).

## 2026-09-02 — design/design-review/design-promote skipped (no documents enabled)

- **Decision**: mechanical, no gate — frozen `state.json.documents` has `prd`/`ux_spec`/`adr`/`c4` all `false`, so per `sprint-lifecycle.md` "No-op phase rule" the three phases collapse to one deterministic skip.
- **Rationale**: no applicable artifact exists for any of the three phases under this sprint's document profile; nothing to gate.
- **Affected docs**: none — `phase` set to `design-promote`, `skipped_phases` gains `["design", "design-review", "design-promote"]`.

## 2026-09-02 — plan approved for sprint 003-doc-links-and-autonomy

- **Decision**: User accepted [plan.md](./plan.md) — 13 tasks, all owner backend-dev, no test-authoring tasks. Acceptance-criteria source is `sprint.md`'s AC-1..AC-8 (`documents.prd` disabled). Every AC has at least one covering task.
- **Rationale**: Task split follows the audit's finding that `checkpoints.md` is the gate SSoT and every other file is a mirror; the dominant risk is a stale mirror surviving unedited (R-1), so the grep sweep is its own task rather than reviewer discretion.
- **Affected docs**: [plan.md](./plan.md), [sprint.md](./sprint.md), [audit.md](./audit.md)
- **Gate mechanic note**: this is the first gate run under the new write-then-review-accept mechanic, per `sprint.md`'s Bootstrap note — `plan.md` was written to disk first, presented as path + delta summary with no body dump, and accepted in place. The `scope` and `audit` gates before it ran under the old approve-before-write mechanic.

### Decisions resolved before decomposition

- **D-1 (audit G-3) — advisor dispatch is workflow-mediated (option b).** A consulting agent emits a new `ADVICE_NEEDED` signal; the dispatching phase workflow catches it, dispatches `asd-advisor`, relays the answer back. **Rationale**: no agent gains `Task`, so the 8 reviewers' read-only contract is untouched; Codex subagent-of-subagent nesting (audit R-7) is unverified in canon and is avoided by construction; matches ASD's existing "workflows delegate, agents return text" topology. **Cost accepted**: a new Signal-vocabulary token plus a uniform relay branch in all 10 `asd-phase-*.md`.
- **D-2 (audit R-2) — advisor consults are not logged (option iii).** **Rationale**: the advisor is read-only, non-binding analysis; the human-visible artifact and its `accept` remain the only gate, so there is no authority to audit. **Binding condition**: `asd-advisor.md` MUST state "never authorizes, never substitutes for a HARD gate" as a hard rule — that clause is what makes the absence of a log safe, and it is not optional.
- **D-3 (audit G-9/R-6) — `.asd/sync-state.json` added to `sprint-lifecycle.md`'s self-hosting write allowlist (option ii).** **Rationale**: it is generated state already written by the sanctioned `sync.js --apply` path, so naming it documents existing behavior rather than loosening the allowlist; that paragraph self-describes as exhaustive, making the omission a defect in the claim. Unblocks AC-8's clean `--check`, which cannot pass while `AGENTS.md` carries pre-existing `modified-foreign` drift from sprint 002 (`317aa50`).
- **G-8 — unlisted gates stay approve-before-write** (clarification, not a user decision). AC-3's artifact list is closed and `sprint.md`'s Out-of-scope section contains nothing contradicting the reading. So `design-md-delta.yaml`'s per-entry gate and `/asd-stack` Phase 6's per-tech-reference write gate are unchanged. **Known seam accepted**: this leaves `/asd-stack` internally mixed (`stack.html` write-then-review, sibling tech-reference writes approve-before-write); recorded in `plan.md` Task 8 so a later reviewer does not "fix" it.

## 2026-09-02 — impl-test: suite green (80/80), 0 added / 0 removed tests

- **Decision**: no-new-test decision for the whole sprint (entry 1, full change surface). Every changed file is rule/agent/workflow/skill prose or auto-recomputed JSON ledger data — no application code changed. `tests/run.js`'s directory-driven per-agent assertion already covers the new `asd-advisor.md` agent generically (no hardcoded agent list), and its ledger-consistency assertion already covers `release-manifest.json`/`sync-state.json`'s recomputed hashes. Prose-correctness verification is impl Task 12's grep sweep + Task 13's `sync.js --check`, both already performed.
- **Rationale**: per `code-style.md` §17, skipping new tests is warranted when the change adds no tested behavior or existing checks already cover the risk — both apply here, verified by reading the actual `tests/run.js` assertions rather than assumed.
- **Suite run**: `node tests/run.js` 80/80 pass; `git diff --check` clean; `node .asd/sync.js --check` 0 drift. HEAD `54176d017`.
- **Affected docs**: [test-plan.md](./test-plan.md)
- **G-5 — decisions-log provenance under revise-in-place**: one entry per artifact at `accept`, not one per revision round (revision rounds are not decisions). To be written as an explicit rule in `checkpoints.md` "Approval recording" by Task 1.

## 2026-09-02 — impl assessment approved

- **Phase**: impl
- **Decision**: impl assessment approved — 13/13 tasks complete, AC-1..AC-8 covered, build (`sync.js --check` 72/72) and lint (`git diff --check`) clean, no sprint-introduced stubs. Advance to impl-test.
- **Rationale**: All plan.md checkboxes ticked; Task 12 grep sweep returned zero stale approve-before-write hits; Task 13 re-baseline landed with a clean `--check`. Two beyond-literal-plan judgment calls presented and accepted: design-promote bookkeeping relocated inline (T3/T9, audit G-6) and the non-blocking post-promotion summary retained as the audit-R-3 compensating control.
- **Alternatives considered**: request changes (no defect found to justify); abort (no blocker).

## 2026-09-02 — impl-review iter-1: FAIL(implementation, documentation) + CONCERNS(quality, testing, simplification, performance, external) → impl fix

- **Phase**: impl-review, iteration 1
- **Decision**: route back to `impl` in review-fix mode. `review_fixes_pending = "iter-1"`; fix set = every finding across all 8 reviewer files, no override, no deferral.
- **FAIL escalation resolved with user** (Complication Approval format, presented and answered): both FAILs share one root cause. AC-3 names 10 in-scope artifacts (`concept.html`, `stack.html`, `DESIGN.md`, `design-system.html`, `accessibility.html`, `prd.html`, `ux-spec.html`, `adr.html`, `sprint.md`, `plan.md`), but only 5 were converted to write-then-review-accept; the five owned by `/asd-concept`, `/asd-stack`, `/asd-design-system` were never touched, leaving `checkpoints.md`'s design-system gate row contradicting the very skill it dispatches. **User chose: implement now** — convert those three skills' final gates to write-then-review-accept in this sprint, honoring AC-3 as originally written rather than narrowing scope. Both FAIL review files carry an "Escalation resolved" note recording this.
- **Rationale**: narrowing AC-3 would ship a rule set whose SSoT (`checkpoints.md`) disagrees with its own dispatch targets — the exact stale-mirror risk (R-1) this sprint exists to eliminate. The gap is mechanical conversion of already-designed mechanics, not new design.
- **Fix-set totals per reviewer** (findings live in the already-written review files, not restated here):
  - [quality.md](./reviews/impl/iter-1/quality.md) — CONCERNS, 11 findings
  - [implementation.md](./reviews/impl/iter-1/implementation.md) — FAIL, 1 high + 5 lower
  - [testing.md](./reviews/impl/iter-1/testing.md) — CONCERNS, 7 findings
  - [simplification.md](./reviews/impl/iter-1/simplification.md) — CONCERNS, 4 findings
  - [documentation.md](./reviews/impl/iter-1/documentation.md) — FAIL, 2 high + 5 lower
  - [performance.md](./reviews/impl/iter-1/performance.md) — CONCERNS, 2 findings
  - [ui.md](./reviews/impl/iter-1/ui.md) — APPROVE, 0 findings (clean; no UI-surface regression from the gate-mechanic change)
  - [external.md](./reviews/impl/iter-1/external.md) — CONCERNS, 8 findings
- **Affected docs**: [state.json](./state.json), [plan.md](./plan.md), `reviews/impl/iter-1/*`; fix targets add `.asd/skills/asd-concept/SKILL.md`, `.asd/skills/asd-stack/SKILL.md`, `.asd/skills/asd-design-system/SKILL.md` to the existing `checkpoints.md` mirror set.
- **Alternatives considered**: narrow AC-3 to the 5 sprint-artifact gates and defer the three skills to a follow-up sprint (rejected by user — leaves `checkpoints.md` self-contradictory in the shipped state); override the FAILs (not offered; no reviewer finding was disputed).
