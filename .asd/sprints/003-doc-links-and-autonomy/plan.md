---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

## Overview

Implements sprint `003-doc-links-and-autonomy` (AC-1..AC-8 in [sprint.md](./sprint.md); `documents.prd` disabled, so `sprint.md` is the acceptance-criteria source). Two independent changes land together:

1. **Write-then-review gate mechanic.** `checkpoints.md` is the SSoT; every other rule, agent, workflow and skill file restating the old approve-before-write invariant is a mirror that must move with it. The dominant risk is not the SSoT edit but a stale mirror surviving unedited (audit R-1), so a literal grep sweep is its own task rather than reviewer discretion.
2. **`asd-advisor` agent**, an advisory tier between "resolve autonomously" and "interrupt the user".

Three architectural decisions were taken with the user before decomposition and are binding on the tasks below:

- **D-1 (audit G-3) — advisor dispatch is workflow-mediated**, not agent→agent. A consulting agent emits a new `ADVICE_NEEDED` signal; the dispatching phase workflow catches it, dispatches `asd-advisor`, relays the answer back. No agent gains `Task`; the 8 reviewers' read-only contract is untouched; Codex subagent-nesting (audit R-7) is avoided by construction.
- **D-2 (audit R-2) — advisor consults are not logged.** The advisor is read-only, non-binding analysis; the human-visible artifact and its `accept` remain the only gate. The "never authorizes, never substitutes for a HARD gate" clause in `asd-advisor.md` is what makes this safe and is mandatory, not optional.
- **D-3 (audit G-9/R-6) — `.asd/sync-state.json` is added to the self-hosting write allowlist** in `sprint-lifecycle.md`. It is generated state already written by the sanctioned `sync.js --apply` path; naming it documents existing behavior. Without this, AC-8's clean `--check` cannot be met, since `AGENTS.md` carries pre-existing `modified-foreign` drift from sprint 002 (`317aa50`) and this sprint edits `AGENTS.md` again.

**Gate scope clarification (audit G-8).** AC-3's artifact list is closed. Gates not named there stay approve-before-write: `design-md-delta.yaml`'s per-entry token gate, and `/asd-stack` Phase 6's per-tech-reference write gate. This is deliberate, not an oversight, and Task 8 records it in-file so a later reviewer does not "fix" it. It does leave `/asd-stack` internally mixed — `stack.html` write-then-review, sibling tech-reference writes approve-before-write — which is consistent with the ACs and is called out as a known seam in Task 8, not silently left.

## Definition of Done

Standing DoD applies, never restated here (`sprint-lifecycle.md` "Plan file format").

Sprint-specific additions: `node .asd/sync.js --check` reports every item `current` — including `AGENTS.md`, whose pre-existing drift must be re-baselined, not merely tolerated; no generated file under `.claude/`, `.codex/`, `.agents/skills/` was hand-edited (canon edited, then regenerated); and the Task 12 grep sweep returns no surviving approve-before-write phrasing for any moved or dropped row.

### Task 1: `checkpoints.md` — split the gate invariant, rewrite the table
Owner: backend-dev. Covers AC-1, AC-2, AC-4, AC-5.
- [ ] Split the "Mandatory pauses" preamble into two named gate classes: **approve-before-write** (existing semantics, unchanged) and **write-then-review-accept** (new). The current preamble states approve-before-write as a global invariant applying to every row — a partial edit leaves the rule contradicting its own table (audit R-1)
- [ ] Define the write-then-review-accept mechanic once, canonically: creator writes the artifact to its path → posts absolute path + short delta summary in chat → user reviews the actual file → `accept` advances, any feedback revises in place → loop until explicit `accept`
- [ ] State the no-content-dumps rule: chat carries link + brief summary + open questions only, never the artifact body; approval stays explicit and recorded
- [ ] State the revise-in-place rule: same file, no `-v2`, no duplicate drafts
- [ ] Move rows to write-then-review-accept: `scope` (`sprint.md`), `plan` (`plan.md`), and the design phase's per-artifact rows for prd / design-system / ux-spec / adr
- [ ] Drop the design phase's `c4-full/` gate row entirely
- [ ] Drop the `design-promote (final mutation)` row; keep `design-promote (decomposition)` and `design-promote (new subsystem)` rows explicitly unchanged, with a one-line note saying why (structural decisions never shown at draft-acceptance time) so a later reader does not read the asymmetry as an oversight
- [ ] Leave `audit`, `impl` assessment, `impl-test` removal, `impl-review` final verdict, `pr` opening rows untouched — they gate a decision or phase advance, not an artifact draft
- [ ] Update "Pause message format" and "Approval recording" for `accept` vocabulary; per AC-5 the decisions-log entry must name the artifact path
- [ ] Resolve audit G-5 in "Approval recording": specify explicitly whether multi-round feedback yields one entry per artifact or one per round. Pick one entry per artifact at `accept` (revision rounds are not decisions), and say so — leaving it implicit is what created the gap

### Task 2: `core.md` — QODDA, incremental writing, advisor glossary and escalation rule
Owner: backend-dev. Covers AC-1, AC-6. Depends on Task 1.
- [ ] Rewrite QODDA step 5, currently "**Approval** (user confirms; agent translates to `language.docs`, writes file, proceeds)" — hard-codes approve-then-write. Reference `checkpoints.md`'s two gate classes rather than restating either
- [ ] Rewrite "Incremental writing" ("per section draft → user approval → write → next") for the write-then-review path
- [ ] Add an Advisor term to the glossary, which currently defines only Creator and Reviewer agent
- [ ] Add the autonomy/escalation rule distinguishing gate uncertainty (goes to the user) from non-gate uncertainty (may go to `asd-advisor`). Audit found no rule text anywhere making this distinction today — this is the natural home
- [ ] Keep the "See also" list accurate if any rule doc is added (none expected)

### Task 3: `sprint-lifecycle.md` — design-promote steps, signal token, allowlist
Owner: backend-dev. Covers AC-4, AC-6, AC-7, AC-8; implements D-1 and D-3. Depends on Task 1.
- [ ] Drop "Design-promote phase" step 4's "Each creator requests user decision before each persistent write" and step 5's "PM final user confirmation before persistent mutation"; renumber
- [ ] Keep steps 1-2 (decomposition, new subsystem) explicitly unchanged
- [ ] **Relocate, do not delete, the bookkeeping orphaned by dropping step 5** (audit G-6): composing design-promote's decisions-log entries and writing `state.json` phase-done. These are non-gate mechanical writes; re-home them per the established two-writers rule in "State recovery". Also decide and record what happens to the "partial rollback" affordance, which otherwise disappears with no replacement
- [ ] Reword phase-table exit criteria that say "scope approved" / "plan approved" to match `accept` vocabulary
- [ ] Re-point the "No-op phase rule" closing clause (which contrasts no-ops against "its normal gate in `checkpoints.md`") at the split gate classes
- [ ] Add `ADVICE_NEEDED` to the "Signal vocabulary" section (~L200), defining emitter (any agent, non-gate uncertainty only), payload, and the workflow's relay obligation
- [ ] Add `.asd/sync-state.json` to the "Self-hosting" write allowlist (~L63) per D-3. That paragraph self-describes as exhaustive, so the omission is a defect in the claim; keep the exhaustiveness wording intact

### Task 4: `providers.md` — advisor tier row
Owner: backend-dev. Covers AC-6, AC-7. Depends on Task 6.
- [ ] Add an `asd-advisor` row to the "Agent tier matrix": claude `fable`, codex `sol`. `model_families` already contains both — no change there
- [ ] **Do not add a "post artifact link" row to the semantic-op table** (audit G-1). Posting an absolute path is ordinary final-message text and is identical on both providers; a near-empty mirror row would itself be an SSoT violation. `checkpoints.md` owns the mechanic in prose. Record this as a deliberate decision in the task's completion note so it is not later filed as a missing row

### Task 5: `language-policy.md` — accept vocabulary and the chat/docs language split
Owner: backend-dev. Covers AC-1, AC-2. Depends on Task 1.
- [ ] Reconcile L29 ("Free-text approval … is NOT a substitute for a user-decision request at any HARD gate") with the new model, where `accept` is discrete but revision feedback is deliberately free-text
- [ ] Fix audit R-5, live for this repo (`language.chat: ru`, `language.docs: en`): under write-then-review the user reviews a file in a language they do not interact in. Add a rule — the delta summary must be self-sufficient for review in `language.chat`, and key changed passages may be quoted-and-translated per the existing quote-translation precedent (L21) without dumping the body, which would violate AC-2

### Task 6: new agent `.asd/agents/asd-advisor.md`
Owner: backend-dev. Covers AC-6.
- [ ] Author the file with strict JSON frontmatter: `name`, `description`, `claude` block (model family `fable`, tools WITHOUT `Write`/`Edit`/`Bash`), `codex` block (model family `sol`, `sandbox_mode: "read-only"`). Frontmatter is parsed fail-closed by `sync.js` before any write
- [ ] Body states as a hard rule: **never authorizes, never substitutes for a HARD gate** (mandatory per D-2 — the clause is what makes "no consult log" safe)
- [ ] Define the operating contract audit G-2 found missing: what counts as non-gate uncertainty; input contract (does the caller pass paths, or does the advisor read the repo itself); output contract (free text vs structured recommendation — no verdict token, it is not a reviewer)
- [ ] Mirror the existing 8 reviewers' read-only contract wording rather than inventing a parallel formulation
- [ ] State explicitly that consults are not logged (D-2), so the absence of a trail reads as deliberate

### Task 7: creator agent files
Owner: backend-dev. Covers AC-4; mitigates audit R-4. Depends on Tasks 1, 6.
- [ ] `asd-pm.md`: its "Phase-specific approval gates" table mirrors `checkpoints.md` exactly — apply the same moved/dropped rows
- [ ] `asd-pm.md`: **split "Rules common to every gate" into two blocks** — gates that precede the write vs gates that follow it. Three of its five bullets assume write follows approval; under write-then-review an agent obeying them literally would self-emit `FAILED` on correct behavior (audit R-4). This is a restructure, not a bullet-by-bullet patch
- [ ] `asd-pm.md`: update Authority / Approval-triggers / Behavioral-profile lines that assume the old ordering
- [ ] `asd-ba.md`: approval triggers and behavioral profile ("per-section approve before write")
- [ ] `asd-ux-designer.md`: same, plus an explicit note that the `design-md-delta.yaml` per-entry gate **stays approve-before-write** (audit G-8) so it is not swept up by mistake
- [ ] `asd-architect.md`: "one approval covering the complete sprint ADR set" must survive as one `accept` for the whole set, not per-decision; update c4 phrasing for the dropped gate
- [ ] Add the `ADVICE_NEEDED` emission affordance to agents per D-1 — as one canonical rule referenced from `core.md` (Task 2), not duplicated into each file

### Task 8: phase workflows — scope, plan, design
Owner: backend-dev. Covers AC-1, AC-2, AC-3, AC-4. Depends on Tasks 1, 7.
- [ ] `asd-phase-scope.md` step 8 sub-steps 3/4/6 (present → loop → "only after explicit `approve`: write") rewritten to write-then-review
- [ ] `asd-phase-scope.md` "Hard gates" block: an independent second copy of the old invariant phrased as a `FAILED` trigger — carries the same R-4 hazard as `asd-pm.md` and needs the same two-class split, not deletion
- [ ] `asd-phase-plan.md` step 4 ("on approval translate to `language.docs` + write `<sprint>/plan.md`") rewritten
- [ ] `asd-phase-design.md` steps 6/8/9 ("on approval translate + write") rewritten for prd / ux-spec / adr
- [ ] `asd-phase-design.md` **step 10 (c4-full) rewritten to a pure write + link-post**, not a deleted clause (audit G-7): with the gate gone the step has no terminating signal, and a bare content dump would violate AC-2
- [ ] Record in-file that unlisted gates stay approve-before-write (audit G-8), and note the resulting `/asd-stack` internal seam as known and accepted

### Task 9: `asd-phase-design-promote.md` + its skill description
Owner: backend-dev. Covers AC-4; implements audit G-6. Depends on Tasks 1, 3.
- [ ] Drop step 8's three near-identical "request user decision before each persistent write" lines from the `asd-ba` / `asd-architect` / `asd-ux-designer` payloads
- [ ] Drop step 10 "Final mutation confirmation" as a gate, **relocating its decisions-log composition and `state.json` phase-done write** as an inline mechanical write per Task 3's relocation decision — step 10 is currently the only site doing either
- [ ] Consider retaining a non-blocking post-promotion summary (link + per-domain file list, no decision requested) per audit R-3: dropping the final gate removes the only rollback point for fold-target *selection*, which happens after the design gate and is never re-opened by it. This also satisfies AC-2's shape
- [ ] Leave step 6 decomposition + new-subsystem gates explicitly unchanged
- [ ] Update the now-stale "Agents delegated to" and "References" lines (the latter cites `checkpoints.md`'s "per-promotion approval, final mutation confirm")
- [ ] Fix `.asd/skills/asd-phase-design-promote/SKILL.md`'s `description` string — "gated by a final user confirmation" is stale and is copied verbatim into both provider views

### Task 10: `ADVICE_NEEDED` relay across all 10 phase workflows
Owner: backend-dev. Covers AC-6; implements D-1. Depends on Tasks 3, 6.
- [ ] Add a uniform relay branch to each `asd-phase-*.md`: catch `ADVICE_NEEDED` from a dispatched agent, dispatch `asd-advisor`, relay the answer back to the consulting agent, resume
- [ ] Keep the branch identical across all ten files so it reads as one mechanism; if it grows past a few lines, define it once in `sprint-lifecycle.md` and reference it rather than duplicating prose ten times
- [ ] Verify no agent gains `Task` in `claude.tools` and no reviewer's read-only contract is touched — the point of choosing D-1(b)

### Task 11: `README.md` and `AGENTS.md`
Owner: backend-dev. Covers AC-7. Depends on Tasks 6, 1.
- [ ] README agent count 15→16 in all occurrences ("dispatches 15 specialized agents", "Fifteen specialized agents are canonically defined…", folder-map "15 canonical agent specs" / "15 agent definitions" ×3, one per provider view)
- [ ] README roster tables: `asd-advisor` fits neither Creators nor Reviewers — add a third category rather than forcing it into one
- [ ] README model-tier table: `fable` (Claude) / `sol` (Codex) row, both provider columns — required same-change per this repo's own hard rule
- [ ] README gate prose, including "pausing for your approval at every checkpoint", and the phase-table gate descriptions
- [ ] `AGENTS.md` roster sentence ("**Agents** … — 15: 7 creators …, 8 reviewers …") gains the third category. Note `AGENTS.md` is self-sourced under `self_hosting: enabled` — hand-edited, `sync.js --apply` deliberately no-ops on it

### Task 12: stale-phrasing grep sweep
Owner: backend-dev. Covers AC-8; mitigates audit R-1. Depends on Tasks 1-11.
- [ ] Run a literal grep for `before writ|BEFORE writ|on approval|after explicit .approve|approve before` across `.asd/**`, `README.md`, `AGENTS.md`
- [ ] Triage every hit into: correctly-unchanged (a retained approve-before-write gate), or stale (a moved/dropped row) — fix the latter
- [ ] Check the known stragglers explicitly: `asd-phase-design-promote/SKILL.md`'s frontmatter description (gate prose hidden in frontmatter), `asd-pm.md`'s common-rules block, `asd-phase-scope.md`'s Hard-gates block, `core.md` QODDA, `language-policy.md`
- [ ] Read `asd-external-review`'s prompt templates for embedded gate assumptions (audit R-9) — an external reviewer judging new artifacts against the old contract would produce false findings
- [ ] Record the surviving-hit triage in the task note so impl-review can verify the sweep rather than redo it

### Task 13: regenerate, re-baseline, verify
Owner: backend-dev. Covers AC-7, AC-8. Depends on Tasks 1-12.
- [ ] `node .asd/sync.js --apply` for all edited canon (new agent auto-discovered by `buildSyncPlan()`; no engine change needed)
- [ ] Re-baseline `AGENTS.md`'s stale managed-block digest in `.asd/sync-state.json` (pre-existing drift from `317aa50`), now permitted by Task 3's allowlist amendment; prefer `/asd-sync`'s `keep-local` path over hand-editing
- [ ] `.asd/release-manifest.json`: verify only — `canon_hashes`/`upstream_hashes` are auto-recomputed by `--apply`; `managed_paths` already lists `.asd/agents` as a tree; `model_families` already has `fable`/`sol`. Commit the regenerated diff, never hand-edit
- [ ] `node .asd/sync.js --check` → every item `current`
- [ ] `node tests/run.js` → green (baseline 80/80; no gate or agent-count coverage exists, so this guards only the sync engine)

## Risks

- Stale approve-before-write phrasing surviving in an unedited mirror (audit R-1, high) — Task 12 is the mitigation, deliberately a task rather than reviewer discretion.
- `asd-pm.md` / `asd-phase-scope.md` gate blocks break under a mixed model and would make a correct agent self-emit `FAILED` (audit R-4) — Tasks 7 and 8 restructure rather than patch.
- Dropping the design-promote final gate removes the only rollback point for fold-target selection (audit R-3) — Task 9's non-blocking summary is the compensating control.
- `--check` cannot go clean without the `sync-state.json` re-baseline (audit G-9/R-6) — resolved by D-3 in Task 3, executed in Task 13.

## Dependencies

- Task 2, 3, 5, 7, 8 depend on Task 1 (`checkpoints.md` is the SSoT they reference)
- Task 4 depends on Task 6; Task 7 depends on Tasks 1 and 6
- Task 9 depends on Tasks 1 and 3; Task 10 depends on Tasks 3 and 6
- Task 11 depends on Tasks 1 and 6
- Task 12 depends on Tasks 1-11; Task 13 depends on Tasks 1-12

## Out of scope

- Gating of `c4-full/` in any form (AC-3)
- design-promote's decomposition and new-subsystem gates — retained unchanged (AC-4)
- `impl` / `impl-test` / `impl-review` / `pr` gate semantics (AC-4)
- `design-md-delta.yaml` per-entry gate and `/asd-stack` per-tech-reference write gate — unlisted in AC-3, therefore unchanged (audit G-8)
- Test authoring — no test-authoring tasks here; `tests/run.js` covers only the sync engine and gains no gate/agent-count coverage this sprint
