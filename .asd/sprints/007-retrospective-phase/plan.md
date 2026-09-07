---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

<!--
Format rules (parser-critical):
- Overview, Definition of Done — prose only, NO checkboxes
- Checkboxes (- [ ]/- [x]) appear ONLY inside `### Task N:` sections
- Checkboxes in any non-task section break orchestrator task parsing
- Subtask deferred for a manual action stays `- [ ]`, suffixed ` — BLOCKED: MS-N` (see manual-steps.md)
- No test-authoring tasks or subtasks: tests are selected and written in impl-test, after the code exists
-->

## Overview

Adds a per-sprint friction log and an eleventh phase, `retro`, between `impl-review` and `pr`. Acceptance-criteria source is `sprint.md` AC-1..AC-9 (design collapsed; no PRD this sprint). Audit findings are in [audit.md](./audit.md); gap ids `G-N` and risk wording below refer to it.

Three decisions taken at the audit gate, binding on every task below ([decisions-log.md](./decisions-log.md), 2026-09-07): `retro` is **unconditional** (no `documents.retro` flag, no no-op-table row); retro output is **sprint-scoped only** (nothing promoted to a persistent home); `state.json.escalations` is **retired** and subsumed by the friction log.

Version target: **MAJOR**. The chain contract changes (`impl-review` no longer emits `NEXT: pr`) and a declared `state.json` field is removed, so the migration file is named for the resulting major version and the bump is confirmed at `pr` per `git-strategy.md` "Versioning & Changelog".

## Definition of Done

Standing DoD applies, never restated here (`sprint-lifecycle.md` "Plan file format"). Sprint-specific additions: `node .asd/sync.js --check` exits clean with no drift in generated views; `node tests/run.js` green; the migration filename version equals the bumped `asd_version`; every chain-enumeration site listed in Task 4 verified by hand against the new chain.

### Task 1: Rules — define the friction log and the retro phase (AC-1, AC-2, AC-3, AC-4, AC-7)

Sole home for every fact the other tasks reference. Nothing here is restated elsewhere; other files link.

- [x] `sprint-lifecycle.md`: add a `## Friction log` section — what it records (workflow/tooling/agent/skill/rule/gate/provider-CLI problems), what it never records, entry id scheme, append-only, lazily created, sprint-scoped and archived with the sprint
- [x] `sprint-lifecycle.md`: state the boundary against `test-plan.md` `D-N`, `reviews/`, `manual-steps.md` `MS-N`, `decisions-log.md` — entries reference ids, never restate symptom, fix or verdict (G-5)
- [x] `sprint-lifecycle.md`: state the writer mechanism **once** — dispatched agents return friction observations in final text, the dispatching phase workflow appends; reviewers cannot write, by host guarantee (G-8, cite `providers.md`)
- [x] `sprint-lifecycle.md`: add a `## Retro phase` section — owner, input, output, the empty-log branch (record "no friction recorded" and advance, never invent findings), and that it is never gated beyond `checkpoints.md`
- [x] `sprint-lifecycle.md`: insert `retro` into the ASCII chain, the phase table (row between `impl-review` and `pr`), and the "never no-op" list at the end of "Optional documents"
- [x] `core.md`: glossary Phase entry — count `Ten` becomes `Eleven`, add `retro` to the list
- [x] `checkpoints.md`: precondition chain string; per-phase precondition sentence gains a `retro` clause and restates `pr`'s predecessor

Material risk: this is the SSoT for the whole feature; a fact stated here and also restated in a template or workflow is an immediate Documentation `FAIL`.

### Task 2: Templates and layout (AC-1, AC-5)

- [x] `artifact-layout.md`: add `friction-log.md` and `retrospective.html` rows to the sprint-tree path map, next to `manual-steps.md`
- [x] `artifact-layout.md`: classify `friction-log.md` explicitly as a workflow/machine Markdown artifact (class of `plan.md`/`test-plan.md`/`manual-steps.md`), and `retrospective.html` as derived analysis — not a parallel rendering of the log (G-4)
- [x] `artifact-layout.md`: extend the `{{DOC_TYPE}}` enum with the retrospective value and give `{{STATUS}}` a value valid for a terminal report; add the retrospective to the artifact enumeration under "HTML shell wrapping" (G-3)
- [x] `t_html-shell.html`: add the retrospective fragment to the `delegates_to:` list
- [x] Author `.asd/templates/t_friction-log.md` — `responsibility` frontmatter with the `excludes` boundary from Task 1, entry table or block format with stable ids, phase-of-origin column
- [x] Author `.asd/templates/t_retrospective.html` — fragment only (no html/head/body/style/script chrome), leading `responsibility` comment plus `provenance: original`, sections for recorded friction, consumer-project recommendations and ASD-framework recommendations, each recommendation traceable to its entry id

Material risk: fragment must not duplicate shell chrome, and `{{TOC_NAV}}` is creator-computed at the 3-`h2` threshold — a wrong non-empty placeholder is a review `FAIL` while a correctly empty one is compliant.

### Task 3: Retro skill and workflow (AC-3, AC-4, AC-5, AC-6, AC-7)

- [x] `.asd/skills/asd-phase-retro/SKILL.md` — JSON frontmatter matching the shape of the other phase skills; `claude.allowed-tools` must include write capability (the phase writes the HTML artifact); body is the one-sentence delegation to the workflow
- [x] `.asd/workflows/asd-phase-retro.md` — full section set (Preconditions, Operations used, Workflow, Artefacts produced, Agents delegated to, Skills/workflows dispatched, Return contract, References)
- [x] Workflow steps: read the friction log; empty or absent log takes the documented no-op branch; otherwise analyse each entry and derive consumer-side and ASD-side recommendations traced to entry ids
- [x] Workflow: write `retrospective.html` via the shell-wrapping procedure, then post a short `language.chat` summary of problems and proposed approaches
- [x] Workflow: carry the `ADVICE_NEEDED` relay branch every other phase workflow carries
- [x] Return contract emits `NEXT: pr` on both branches

Depends on Task 1 (contract) and Task 2 (template).

Material risk: the empty-log branch is what an in-flight consumer sprint hits after upgrading (G-9) — it must be reachable without any sprint-state mutation.

### Task 4: Chain wiring (AC-3, AC-8)

- [x] `.asd/hooks/session-start.js` — insert `'retro'` into `PHASE_CHAIN` between `'impl-review'` and `'pr'`
- [x] `.asd/skills/asd-sprint/SKILL.md` Step 3 — `impl-review` DoD-met branch emits `NEXT: retro`; add the `retro` to `pr` sentence
- [x] `.asd/workflows/asd-phase-impl-review.md` — the emit line, the return contract and the branch prose all change `pr` to `retro`
- [x] `.asd/workflows/asd-phase-pr.md` — open-mode step 1 states whether the retrospective artifact is a DoD input (G-13)
- [x] Regenerate the provider hook views: `node .asd/sync.js --apply .asd/hooks/session-start.js`

Depends on Task 3 (the target phase must exist before anything routes to it).

Material risk: `NEXT:` is authoritative for routing while `PHASE_CHAIN` only drives the session hook's display — updating one and not the other skips `retro` silently, with no error.

### Task 5: Retire `escalations`, wire the append points (AC-2)

- [ ] `.asd/templates/t_state.json` — remove the `escalations` key
- [ ] `.asd/workflows/asd-phase-impl.md` — rewrite the manual-steps halt instruction to append a friction entry instead of writing `escalations[]`
- [ ] Add the one-line friction-append reference to each existing phase workflow, pointing at the Task 1 rule section — never restating the mechanism
- [ ] `.asd/rules/providers.md` — record the friction-append operation in the role-scoped context table if the existing rows do not already cover it

Depends on Task 1.

Material risk: the append reference must stay a reference; ten near-identical restatements would be the SSoT violation this task exists to remove.

### Task 6: Migration (AC-9)

- [ ] Author `.asd/migrations/<major>.js` matching the migration contract (`module.exports = (ctx) => report`, zero dependency, idempotent, helpers from the consumer's own `.asd/sync.js`)
- [ ] Strip the stale `escalations` key from a consumer's active-sprint `state.json` if present; leave `.asd/sprints/**` otherwise untouched, per the `4.0.0.js` precedent
- [ ] Confirm no sprint-state mutation is needed for the chain change — an in-flight sprint reaches `retro` through the new chain and lands on the Task 3 empty-log branch

Depends on Tasks 3 and 5.

Material risk: the filename version must equal the `asd_version` the `pr` phase bumps to, or the bump itself fails its blocking DoD check.

### Task 7: Documentation mirrors (AC-8)

- [ ] `README.md` — phase count words, the mermaid flowchart edge, the phase table row, the folder map, the skill and workflow counts
- [ ] `AGENTS.md` repo section — "ten phases", the skill counts, and the phase-chain consistency contract itself, which must gain the four sites it currently omits (`checkpoints.md`, `asd-sprint/SKILL.md`, `asd-phase-impl-review.md`) (G-10)
- [ ] `.asd/release-manifest.json` — `upstream_hashes` entries for both new templates and for every file whose bytes changed (G-12)
- [ ] `node .asd/sync.js --apply` for the new skill, then `--check` clean

Depends on every preceding task.

### Task 8: Systemic improvement proposals in retro (AC-10)

Scope expansion accepted by the user after Tasks 1-3 were already complete, so it lands as its own task rather than as edits folded back into them.

- [x] `sprint-lifecycle.md` `## Retro phase`: state that the phase emits two distinct output classes — remediation of recorded friction, and systemic proposals for running a future sprint faster and cheaper; the second class is not derived from, and not limited by, the friction entries
- [x] `sprint-lifecycle.md` `## Retro phase`: state that the empty-log branch still produces the systemic-proposals class, so an entry-free log is not an empty retrospective
- [x] `t_retrospective.html`: add the systemic-proposals section, keeping the existing consumer-project / ASD-framework split so a proposal names which side acts on it
- [x] `.asd/workflows/asd-phase-retro.md`: derive the proposals in the analysis step and include them in the chat summary; both branches still return `NEXT: pr`

Depends on Tasks 1, 2, 3 (all complete).

Material risk: the proposals class must not become a second, looser channel for the same facts the friction entries already own — it answers "what would have made this sprint cheaper", not "what went wrong".

## Risks

- Chain-mirror miss routes past `retro` silently (Task 4).
- Restating a Task 1 fact in a template or workflow draws a Documentation `FAIL` (Tasks 2, 5).
- Migration filename and version bump can disagree, which fails the bump, not just the migration (Task 6).
- Nothing in `tests/run.js` asserts chain consistency, so all mirror sites are hand-verified (G-11); an automated check is a candidate for `impl-test`, not a plan task.

## Dependencies

- Task 3 depends on Tasks 1 and 2
- Task 4 depends on Task 3
- Task 5 depends on Task 1
- Task 6 depends on Tasks 3 and 5
- Task 7 depends on Tasks 1-6, 8
- Task 8 depends on Tasks 1, 2, 3

## Out of scope

- Cross-sprint friction history or any new persistent document (decided at the audit gate).
- Automatic execution of retro recommendations.
- Changing what `test-plan.md`, `reviews/`, `stubs.md` or `manual-steps.md` own.
