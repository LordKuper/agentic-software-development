---
responsibility:
  owns: task breakdown, dod, task status (checkboxes)
  excludes: requirements, design decisions, code, review findings
  delegates_to: audit.md (verdicts + rationale), sprint.md (scope + AC), .asd/project/decisions-log.md (approved decisions)
---

# Plan

<!--
Format rules (parser-critical):
- Overview, Context, Definition of Done — prose only, NO checkboxes
- Checkboxes (- [ ]/- [x]) appear ONLY inside `### Task N:` sections
- Checkboxes in any non-task section break orchestrator task parsing
- Subtask deferred for a manual action stays `- [ ]`, suffixed ` — BLOCKED: MS-N` (see manual-steps.md)
- No test-authoring tasks or subtasks: tests are selected and written in impl-test, after the code exists
-->

## Overview

Implements the user-accepted verdicts of [audit.md](./audit.md) as edits to canonical `.asd/` sources. Tasks are organised **per audit verdict**, never per file type, so no verdict can be half-landed (audit R-5, R-16); a verdict's full cross-file mirror set moves inside the one task that owns it. Every task cites the verdict ids it implements and the `sprint.md` AC it satisfies.

Acceptance-criteria source: `sprint.md`'s own `AC-1 … AC-6` list — `documents.prd` is disabled for this sprint, so there is no PRD (`sprint-lifecycle.md` "Optional documents"). Every task satisfies **AC-6**; the "Affected canonical files" line inside each task is that task's **AC-4** evidence. AC-1/AC-2/AC-3 are satisfied by `audit.md` itself and are re-tagged per task by axis. AC-5 is satisfied by the decisions-log entries recording the accept/reject pass.

Owner for every task: **backend-dev**. All work is editing Markdown / JSON / YAML canonical framework files; this repo has no UI or application-backend surface, so `asd-frontend-dev` is a guaranteed no-op here (audit AG-6).

Two standing subtasks apply to every task below and are written out only once here, to avoid restating them twenty times:

- **Frontmatter obligation (gap G-2)**: whenever a task drops or moves a section, update that template's `responsibility: owns / excludes / delegates_to` block in the same edit — otherwise the Documentation reviewer FAILs the next artifact produced from it for under-covering its declared scope.
- **Mirror + regenerate obligation**: whenever a task edits `.asd/agents/**`, `.asd/skills/**` or `.asd/hooks/**`, update `README.md` and `.asd/release-manifest.json` (`managed_paths` / `canon_hashes`) in the same task and run `node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply <file...>`. Never hand-edit `.claude/`, `.codex/` or `.agents/skills/`.

**Stub inclusion**: none. `audit.md` "Related open stubs" reports **no related open stubs** — `.asd/project/stubs.md` holds only its empty-state placeholder row — so no `Resolve stub` task exists and no stub was deferred or marked accepted-debt.

**Verification reality (gap G-13)**: `node tests/run.js` covers only `.asd/sync.js` / `update.js`, and `sync.js --check` sees canon→generated drift for `agents` / `skills` / `hooks` only — never for `rules`, `templates` or `workflows`, which have no generated counterpart. No task below touches `PHASE_CHAIN` or `nextPhase()` in `.asd/hooks/session-start.js`, so no task is machine-verifiable beyond those two commands; per-task cross-file inspection is the verification, and Task 20 is its closure.

## Context

- [sprint.md](./sprint.md) — scope and the AC-1 … AC-6 acceptance source
- [audit.md](./audit.md) — the 62 verdicts (A-1…A-36, P-1…P-11, AG-1…AG-15), gaps G-1…G-13, risks R-1…R-16
- [AGENTS.md](../../../AGENTS.md) — "Cross-file consistency" is the binding mirror checklist for AC-6
- [.asd/project/decisions-log.md](../../project/decisions-log.md) — AC-5 evidence home under the currently live convention
- No persistent `docs/` tree exists in this repo (`documents.prd` / `ux_spec` / `adr` / `c4` all disabled), so there are no per-subsystem requirement, ADR or UX docs to link.

## Definition of Done

All `sprint.md` acceptance criteria AC-1 … AC-6 are covered by the tasks below and satisfied. Every accepted verdict is implemented in canonical `.asd/` sources with its full mirror set landed in the same task; every rejected verdict is recorded as declined in `.asd/project/decisions-log.md` (AC-5). `node .asd/sync.js --check` is clean. `node tests/run.js` is green. Every mirror listed in `AGENTS.md` "Cross-file consistency" is verified consistent: README phase list, agent roster, model tiers (both provider columns), config schema, folder map and command table; `core.md` "See also"; the reviewer verdict token; the four homes of the phase list; agent↔workflow dispatch targets; template variables; `release-manifest.json` `managed_paths` and `canon_hashes`. The full test suite is green at impl-test and all required reviewers are green at impl-review.

### Task 1: Compress review files — ledger summary instead of passing rows

Verdicts: **A-14**, **A-13**, **A-15**. AC: AC-1, AC-4, AC-6. Owner: **backend-dev**.
Affected canonical files: `.asd/templates/t_review.md`, `.asd/templates/external-review/t_review-report.md`, `.asd/rules/review-policy.md` (Coverage ledger + enforcement paragraph), `.asd/rules/external-review.md` (Output mapping), `.asd/workflows/asd-phase-impl-review.md` (steps 5-6), `.asd/workflows/asd-phase-design-review.md` (steps 7-8), all seven `.asd/agents/asd-reviewer-*.md`, `.asd/agents/asd-external-review.md`, `README.md`.
Material risk: audit R-3 — archived sprints lose the per-file proof that reviewer X inspected file Y; gate strength is unchanged because the ledger gate runs on the reviewer's **returned text before the file is written**. Eight agent files regenerate into sixteen provider files: `sync.js --check` goes dirty unless `--apply` runs inside this task.

- [x] `review-policy.md`: keep the mandatory coverage ledger exactly as-is on the **returned text** (gate unchanged, enforcement unchanged); add the rule that the dispatching phase workflow persists only non-passing rows plus a coverage summary line and the full `n/a` list
- [x] `t_review.md`: replace the two-part ledger tables with a coverage summary line (`files: 88/88 checked, 0 n/a · rules: 14/14, 3 findings`), the verbatim `n/a` list, and every non-pass row verbatim
- [x] `asd-phase-impl-review.md` steps 5-6 and `asd-phase-design-review.md` steps 7-8: validate the full returned ledger, then write the reduced file
- [x] All seven `asd-reviewer-*.md`: keep the obligation to **return** a complete ledger; state that the workflow, not the reviewer, decides what is persisted
- [x] `t_review-report.md` + `asd-external-review.md` + `external-review.md`: replace both dropped-findings tables (below-severity-floor, nitpick) with counts plus one line per category
- [x] `README.md`: update the coverage-ledger description to match
- [x] Run `node .asd/sync.js --apply` for the eight edited agent files; confirm `--check` clean

### Task 2: Compress audit.md and define the absent-section rule

Verdicts: **A-3**, gap **G-8**. AC: AC-1, AC-4, AC-6. Owner: **backend-dev**.
Affected canonical files: `.asd/templates/t_audit.md`, `.asd/workflows/asd-phase-audit.md` (steps 5-6), `.asd/rules/sprint-lifecycle.md` (Audit phase), `.asd/agents/asd-ba.md`, `.asd/agents/asd-architect.md`.
Material risk: without the G-8 rule landed in the same edit, the plan phase can no longer distinguish "no stubs found" from "BA never checked", because today only the placeholder row carries that distinction.

- [x] `t_audit.md`: remove every mandated placeholder row; an empty optional section is omitted entirely rather than emitted with `| — | — | none | — |`
- [x] `sprint-lifecycle.md` (Audit phase): add the explicit rule that an **absent section means an empty finding set**, not an unperformed check
- [x] `t_audit.md`: fold "Dependencies" and "Migration notes" into "Gaps"
- [x] Keep "Related open stubs" intact — it has a named downstream consumer in `asd-phase-plan.md` step 4
- [x] `asd-phase-audit.md` steps 5-6 and both creator agents' Outputs: match the reduced section set
- [x] Update the template's `responsibility` frontmatter for the folded sections

### Task 3: Compress plan.md and move the standing Definition of Done to the rule doc

Verdicts: **A-10**, **P-6(a)**. AC: AC-1, AC-2, AC-4, AC-6. Owner: **backend-dev**.
Affected canonical files: `.asd/templates/t_plan.md`, `.asd/workflows/asd-phase-plan.md` (step 4), `.asd/rules/sprint-lifecycle.md` (Plan file format), `.asd/agents/asd-pm.md`.
Material risk: `plan.md` is parser-critical — checkboxes must stay confined to `### Task N:` blocks or impl task parsing breaks.

- [x] `sprint-lifecycle.md`: declare the three constant DoD clauses (AC coverage, green suite at impl-test, reviewers green at impl-review) as the **standing DoD** for every sprint
- [x] `asd-phase-plan.md` step 4: instruct the PM to author only sprint-specific DoD additions and reference the standing DoD
- [x] `t_plan.md`: drop the Context link list (the impl dispatch payload already carries those paths) and shrink the DoD section accordingly
- [x] `asd-pm.md`: align its plan-authoring output description
- [x] Re-confirm the parser-critical comment block in `t_plan.md` survives unchanged

### Task 4: Compress test-plan.md and give Manual verification a single home

Verdict: **A-11**. AC: AC-1, AC-4, AC-6. Owner: **backend-dev**. Depends on Task 1.
Affected canonical files: `.asd/templates/t_test-plan.md`, `.asd/templates/t_review.md`, `.asd/rules/artifact-layout.md` (Test plan), `.asd/workflows/asd-phase-impl-test.md` (steps 3, 7), `.asd/agents/asd-test-engineer.md`, `.asd/agents/asd-reviewer-testing.md`.
Material risk: the Testing reviewer loses an authoring slot it owns today — its rubric must be repointed at `test-plan.md` in the same edit or a mandated capture path silently disappears.

- [x] `t_test-plan.md`: drop "Change surface" (recomputable via `git diff --stat`, and `asd-phase-impl-test.md` step 2 computes it anyway)
- [x] `t_test-plan.md`: reduce "Added tests" to the Regression-proof column, the only part the Testing reviewer cannot derive from the diff
- [x] `t_review.md`: remove the Manual-verification section; `test-plan.md` becomes its single home
- [x] `asd-reviewer-testing.md`: rubric consumes the manual-verification spec from `test-plan.md` instead of authoring it
- [x] `artifact-layout.md` + `asd-test-engineer.md`: reflect the single home
- [x] Update both templates' `responsibility` frontmatter

### Task 5: Fix the state.json schema — remove dead fields, document archived_at

Verdict: **A-2**, plus the residue defect (2) recorded in the project decisions log. AC: AC-1, AC-4, AC-6. Owner: **backend-dev**.
Affected canonical files: `.asd/templates/t_state.json`, `.asd/rules/sprint-lifecycle.md` (State recovery), `.asd/workflows/asd-phase-scope.md` (step 8.6), `.asd/workflows/asd-phase-pr.md` (step 6), `.asd/release-manifest.json` (`canon_hashes`).
Material risk: audit R-8 — archived sprints keep the removed fields, so the resume path must assume neither their presence nor their absence. Breaks `node tests/run.js` / `sync.js --check` if `canon_hashes` is not updated in this same task.

- [x] `t_state.json`: delete `subsystems_touched` and `new_subsystems` (declared, written, read by nothing)
- [x] `sprint-lifecycle.md` "State recovery": document `archived_at` — it is written by `asd-phase-pr.md` but described nowhere, closing the second half of the standing defect
- [x] `asd-phase-scope.md` step 8.6: stop seeding the removed fields (verified — current step 8.6 already never seeded them; nothing to remove)
- [x] Verify the resume path and `session-start.js` read neither field; make no assumption about archived sprints that still carry them (grep confirmed no references in `.asd/hooks/`)
- [x] Update `release-manifest.json` `canon_hashes`; confirm `node tests/run.js` green and `sync.js --check` clean (recomputed `upstream_hashes` for `t_state.json`/`sprint-lifecycle.md` — `canon_hashes` does not track templates/rules, only agents/skills; `sync.js --check` clean, hashes computed via the same `sync.sha256Hex(sync.readNormalized())` the self-consistency test uses — `node tests/run.js` itself is impl-test's gate, not run here per role scope)

### Task 6: Make the decisions log sprint-scoped and deprecate the project log

Verdicts: **A-16**, **A-17**, gap **G-1** (final redesigned resolution — supersedes the interim G-1 resolution recorded in the project log on 2026-09-01). AC: AC-1, AC-4, AC-5, AC-6. Owner: **backend-dev**.
Affected canonical files: `.asd/rules/artifact-layout.md`, `.asd/rules/sprint-lifecycle.md:79`, `.asd/rules/checkpoints.md:28`, `.asd/rules/external-review.md:34`, `.asd/templates/t_decisions-log.md` (rewrite), `.asd/templates/t_stubs.md:5`, `.asd/agents/asd-pm.md`, `.asd/workflows/asd-phase-scope.md` (step 6), `.asd/workflows/asd-phase-design-promote.md:60`, `.asd/workflows/asd-phase-pr.md` (merge-mode step 2), `.asd/skills/asd-init/SKILL.md`, `.asd/skills/asd-concept/SKILL.md`, `.asd/skills/asd-stack/SKILL.md`, `.asd/skills/asd-design-system/SKILL.md`, `README.md:290`, `CHANGELOG.md`, `sync.js --apply`.
Material risk: this reverses an already-recorded resolution, so a half-landed edit leaves two contradictory rules about where approvals are recorded. The durability rule is the load-bearing part — without it, a decision that must outlive the sprint is archived out of reach.

- [x] `<sprint>/decisions-log.md` becomes the sole canonical decisions log: created at `scope`, archived with the sprint. Land this in `artifact-layout.md`, `sprint-lifecycle.md:79`, `checkpoints.md:28`, `external-review.md:34`, `README.md:290`
- [x] `asd-phase-scope.md` step 6: create the sprint-local log as part of sprint setup
- [x] Deprecate `.asd/project/decisions-log.md`: freeze it with one closing entry. Sprint 001's entries are immutable and stay untouched; sprint 002's six existing entries relocate **verbatim** into `.asd/sprints/002-lean-workflow/decisions-log.md`
- [x] `t_decisions-log.md`: rewrite for the new entry format — Decision ≤ 3 sentences, Rationale ≤ 3 sentences, Affected docs unrestricted, one-line form for no-op skips. Not retroactive; relocated entries keep their original shape
- [x] Add the **durability rule**: a decision whose value must survive archival is ALSO written into an existing persistent home (a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`). Never invent a new document type for this. Reflect in `t_stubs.md:5`
- [x] `asd-phase-pr.md` merge-mode step 2: **delete** the terminal decisions-log append outright — it writes into an already-archived folder, and `state.json` plus the merged PR already record that fact. Do not extend the immutability exception
- [x] Drop the decisions-log dispatch entirely from `asd-concept`, `asd-stack`, `asd-design-system` (the authored document IS the record) and from `asd-init` (config changes get no durable trail; do not add explanatory comments to `config.yaml` either — it holds settings only)
- [x] `asd-phase-design-promote.md:60` and `asd-pm.md`: repoint every append site at the sprint-local log
- [x] `CHANGELOG.md`: note the deprecation; run `sync.js --apply` for the four edited skill files and `asd-pm.md`

### Task 7: Scope the PRD compression to the sprint draft only

Verdicts: **A-4**, gap **G-5**, risk **R-4**. AC: AC-1, AC-4, AC-6. Owner: **backend-dev**.
Affected canonical files: `.asd/templates/t_prd.html`, `.asd/rules/artifact-layout.md` (`{{STATS}}` row), `.asd/agents/asd-ba.md` (skeleton line 52, Output format line 88), `.asd/workflows/asd-phase-design.md` (step 6), `.asd/workflows/asd-phase-design-promote.md` (step 8), `.asd/agents/asd-reviewer-documentation.md`.
Material risk: audit R-4 — `t_prd.html` serves both the sprint draft and the persistent per-subsystem requirements doc. An unconditional cut guts the persistent document, which has no `sprint.md` to link back to. Per G-4 this reshapes the artifact for every consumer on `/asd-update`; no per-project dial is introduced (that would be a new config surface requiring Complication Approval).

- [x] `t_prd.html`: sprint draft = User stories + Acceptance criteria, plus an optional one-line Problem. Goals / Non-goals become **required for the persistent requirements document only** — mark the conditional in the template
- [x] `asd-reviewer-documentation.md`: rubric must distinguish sprint draft from persistent document so it does not FAIL a correctly-reduced draft
- [x] `artifact-layout.md`: fix the hardcoded `{{STATS}}` string `N goals · N stories · N AC · N non-goals`
- [x] `asd-ba.md`: fix the hardcoded skeleton prose (line 52) and Output format (line 88), which name sections the draft no longer carries
- [x] `asd-phase-design.md` step 6 and `asd-phase-design-promote.md` step 8: align with the split
- [x] Update the template `responsibility` frontmatter; run `sync.js --apply` for the two edited agent files

### Task 8: Compress ux-spec.html and accessibility.html

Verdicts: **A-5**, **A-32**. AC: AC-1, AC-4, AC-6. Owner: **backend-dev**.
Affected canonical files: `.asd/templates/t_ux-spec.html`, `.asd/templates/t_accessibility.html`, `.asd/agents/asd-ux-designer.md`, `.asd/agents/asd-reviewer-ui.md`, `.asd/rules/artifact-layout.md` (`{{STATS}}`), `.asd/skills/asd-design-system/SKILL.md`.
Material risk: the UI reviewer's rubric is defined against flows and mockups — those must survive untouched, or a reviewer input disappears with no replacement.

- [x] `t_ux-spec.html`: drop "New components" — the template itself declares it duplicated by `design-md-delta.yaml`, which is the file design-promote actually applies
- [x] `t_ux-spec.html`: make "Component usage" optional and off by default (derivable from the mockups)
- [x] `t_accessibility.html`: drop the per-domain scope paragraphs (they describe the category, not the project) and make the i18n section opt-in; keep Overall commitment, the domain rule lists, Known intentional limitations, and Test plan — the UI reviewer checks against those
- [x] `artifact-layout.md`: fix the `N flows · N mockups` `{{STATS}}` string if the section set changed (unchanged — stat already counts only flows/mockups, unaffected by the section-set edit)
- [x] `asd-ux-designer.md`, `asd-reviewer-ui.md`, `asd-design-system/SKILL.md`: align; run `sync.js --apply` (no drift found — neither file references the dropped/optional sections; `sync.js --check` reports `ok: true`)
- [x] Update both templates' `responsibility` frontmatter

### Task 9: ADRs become sprint-scoped and fold into existing docs; drop api.html entirely

Verdicts: **A-6**, **A-26**, gap **G-3**, risk **R-2**. AC: AC-1, AC-2, AC-4, AC-6. Owner: **backend-dev**.
Affected canonical files: `.asd/templates/t_adr.html`, **delete** `.asd/templates/t_api.html`, `.asd/rules/artifact-layout.md` (sprint tree, ADR naming, lines 55 and 75), `.asd/rules/sprint-lifecycle.md` (Design phase, Design-promote phase, lines 136 and 142), `.asd/rules/checkpoints.md` (design row), `.asd/workflows/asd-phase-design.md` (step 9), `.asd/workflows/asd-phase-design-review.md` (step 1 scope set), `.asd/workflows/asd-phase-design-promote.md` (steps 8 and 43), `.asd/workflows/asd-phase-impl-test.md:29`, `.asd/agents/asd-architect.md` (Role / Scope / Authority / Outputs / write-access / Output format), `.asd/agents/asd-test-engineer.md:43`, `.asd/agents/asd-backend-dev.md:42`, `.asd/agents/asd-frontend-dev.md:45`, `.asd/agents/asd-reviewer-documentation.md:73`, `.asd/agents/asd-reviewer-quality.md:65`, `.asd/templates/external-review/t_prompt-external-design.md`, `README.md` (lines 194 and 314).
Material risk: audit R-2 — the design gate stays exactly one approval for the sprint's ADR set; a naively per-file gate would multiply user pauses. Removing an entire persistent document type and a template touches the largest reference surface of any task in this plan, and `sync.js --check` cannot see rules / templates / workflows drift, so a missed reference is invisible to tooling.

- [ ] ADRs become **sprint-scoped only** at `<sprint>/design/adr.html`; `docs/architecture/adr/` disappears from `artifact-layout.md`'s persistent tree, and ADRs are never promoted as a standalone persistent document type
- [ ] Switch to sprint-local numbering (`ADR-1`, `ADR-2`, …); drop the `superseded` and `deprecated` statuses, which become unreachable once ADRs are sprint-local
- [ ] Land the **fold rule** verbatim in `sprint-lifecycle.md` (Design-promote phase): "Every architectural decision approved in a sprint's `adr.html` is folded, at `design-promote`, into whichever existing persistent doc already declares ownership of that decision's subject in its `responsibility.owns` frontmatter… never from a lookup table… When no existing doc's `owns` matches, that is a Complication Approval, not a licence to invent a document"
- [ ] Binding **rejected** alternatives fold as one line into whatever the target doc's Constraints-equivalent section is; non-binding alternatives stay sprint-archive-only
- [ ] `t_adr.html`: add an optional per-article "Fold target" line naming the chosen document plus the `owns:` clause that justifies it — auditability for an open-set rule
- [ ] `checkpoints.md` design row: state explicitly that the gate remains **one approval for the sprint's ADR set**
- [ ] **Delete `.asd/templates/t_api.html` outright** — no template is kept anywhere; API contracts fold through the same open-set rule (a subsystem doc, `stack.html`, a project-generated OpenAPI/SDL/proto artifact, or — only if nothing owns it — a new document via ordinary Complication Approval with no pre-made template)
- [ ] Remove every `api.html` reference across canon: `sprint-lifecycle.md:136,142`, `asd-phase-design-promote.md:43`, `asd-test-engineer.md:43`, `asd-backend-dev.md:42`, `asd-frontend-dev.md:45`, `asd-phase-impl-test.md:29`, `asd-reviewer-documentation.md:73`, `asd-reviewer-quality.md:65`, `asd-architect.md` (all six sites), `artifact-layout.md:55,75`, `README.md:314,194`
- [ ] `asd-phase-design.md` step 9, `asd-phase-design-review.md` step 1, `t_prompt-external-design.md`: align with the sprint-scoped ADR shape
- [ ] `release-manifest.json`: drop the deleted template from `canon_hashes` / `managed_paths`; run `sync.js --apply` for every edited agent file; grep the whole repo for residual `api.html` and `adr/` path references

### Task 10: C4 drafts become deltas; stop committing build output

Verdicts: **A-8**, **A-9**, **A-28**, risk **R-7**. AC: AC-1, AC-4, AC-6. Owner: **backend-dev**.
Affected canonical files: `.asd/rules/sprint-lifecycle.md` (design phase, design-promote step 4), `.asd/rules/artifact-layout.md` (both path trees), `.asd/workflows/asd-phase-design.md` (step 10), `.asd/workflows/asd-phase-design-promote.md` (steps 7-8), `.asd/agents/asd-architect.md`, `.asd/skills/asd-init/SKILL.md` (lines 54-55, 60), `README.md` folder map, `.gitignore`.
Material risk: audit R-7 — dropping the render removes the only human-viewable form of the C4 model, mitigated by the build-to-view command. The command must be added to `asd-init`'s **seeding template**, not written into the live `.asd/project/commands.yaml`, which is consumer-owned and out of scope per `sprint.md`.

- [ ] `sprint-lifecycle.md` + `asd-phase-design.md` step 10: the sprint draft is a **delta patch** against the persistent registry; full-schema authoring survives only when the persistent registry does not yet exist
- [ ] Never build `dist/` inside `<sprint>/design/` — the framework's own `external-review.md` already classifies it as generated output no reviewer sees
- [ ] Persistent `docs/architecture/c4/dist/` and the mermaid `architecture.html` stop being committed: add to `.gitignore`, remove from `artifact-layout.md`'s tree and from the README folder map
- [ ] `asd-init/SKILL.md`: seed a "build to view" command in the generated `commands.yaml` template and name it in README, so the render is one command away rather than absent
- [ ] `asd-phase-design-promote.md` steps 7-8 and `asd-architect.md`: remove the mandated regeneration steps
- [ ] Run `sync.js --apply` for the edited agent and skill files

### Task 11: Trim the inline HTML shell

Verdict: **A-34**, risk **R-6** (trim variant; the shared-stylesheet variant is declined). AC: AC-1, AC-4, AC-6. Owner: **backend-dev**.
Affected canonical files: `.asd/templates/t_html-shell.html`, `.asd/rules/artifact-layout.md` (HTML shell wrapping, placeholder table), `.asd/agents/asd-ba.md`, `.asd/agents/asd-architect.md`, `.asd/agents/asd-ux-designer.md`, `.asd/agents/asd-reviewer-documentation.md`, `.asd/skills/asd-design-system/SKILL.md`, `AGENTS.md` (conventions).
Material risk: the rejected shared-`docs/assets/asd.css` variant would have broken self-contained single-file artifacts and added a path `/asd-update` does not manage. The trim variant preserves self-containment; the residual risk is that reviewers are instructed to FAIL fragments duplicating shell chrome, so the reviewer rubric must move with the shell.

- [ ] `t_html-shell.html`: drop the mermaid CDN `<script>` from documents that contain no diagram (make it conditional, not unconditional)
- [ ] `t_html-shell.html`: drop the auto-TOC for documents below a stated section count
- [ ] Artifacts stay **self-contained single files** — do not introduce `docs/assets/asd.css` or any sibling-file dependency
- [ ] `artifact-layout.md`: update the HTML-shell wrapping rule and the placeholder table for any placeholder that is no longer always computed
- [ ] `asd-reviewer-documentation.md`: align the duplicate-chrome FAIL rule with the trimmed shell
- [ ] `asd-ba.md`, `asd-architect.md`, `asd-ux-designer.md`, `asd-design-system/SKILL.md`, `AGENTS.md` conventions: align; run `sync.js --apply`

### Task 12: Change design-system.html regeneration frequency (gate untouched)

Verdict: **A-31**, risk **R-1** — narrowed variant, separately approved. AC: AC-1, AC-4, AC-6. Owner: **backend-dev**.
Affected canonical files: `.asd/rules/design-system.md` (§10 step 4), `.asd/workflows/asd-phase-design-promote.md`, `.asd/workflows/asd-phase-design.md`, `.asd/agents/asd-ux-designer.md` (line 77), `.asd/skills/asd-design-system/SKILL.md` (phase 5), `README.md`.
Material risk: audit R-1 concerned removing a file from a mandated gate; **this variant does not do that**. The `checkpoints.md` design-gate file-existence triple stays exactly as it is — the same three files are required, and `checkpoints.md` is not edited by this task. Only the regeneration trigger granularity changes. Any edit that widens this into a gate change is out of scope and must be escalated.

- [ ] `design-system.md` §10: change the regeneration trigger from "every `DESIGN.md` token change" to **once per sprint, at `design-promote`, and only if `DESIGN.md` was actually touched this sprint**
- [ ] Do **not** make generation fully on-demand / manual-only, and do **not** leave it unconditional-per-change
- [ ] `asd-phase-design-promote.md`: add the conditional regeneration step keyed on `DESIGN.md` having changed this sprint
- [ ] `asd-phase-design.md` and `asd-ux-designer.md` line 77: remove the per-token-change re-emit mandate
- [ ] `asd-design-system/SKILL.md` phase 5: align with the new trigger
- [ ] Verify `checkpoints.md` design row is **unchanged** and still requires `DESIGN.md` + `design-system.html` + `accessibility.html`
- [ ] `README.md`: align; run `sync.js --apply` for the edited agent and skill files

### Task 13: Diff-scoped reviewer fan-out at impl-review

Verdicts: **P-9**, **AG-11**, **AG-14**, gap **G-12**, risk **R-10** — separately approved, with all mitigations mandatory. AC: AC-2, AC-3, AC-4, AC-6. Owner: **backend-dev**.
Affected canonical files: `.asd/workflows/asd-phase-impl-review.md` (step 5), `.asd/rules/review-policy.md` (DoD table, lines 134 and 136), `.asd/agents/asd-reviewer-ui.md`, `.asd/agents/asd-reviewer-performance.md` (line 23), `.asd/workflows/asd-phase-pr.md` (step 4), `.asd/templates/t_state.json` (verdict slot), `README.md` reviewer table.
Material risk: audit R-10 — this trades away guaranteed off-domain vigilance. In sprint 001 the UI reviewer, dispatched into a diff it described as containing zero UI surface, still found a real relative-link defect. The `checkpoints.md` line-19 impl-review gate is untouched. Every mitigation below is part of the accepted trade, not optional.

- [ ] Predicates are **strictly diff-derived, never keyed on `documents.*`** — this preserves `review-policy.md` line 136 verbatim ("absence of a ux-spec draft never implies absence of UI code to review")
- [ ] UI reviewer skipped only when **no file in the iteration's scope list is a UI surface**; any UI-extension file entering the diff re-enables it automatically
- [ ] Performance reviewer skipped only when **both** no perf-budgets section exists in `custom-coding-rules.md` **and** the diff contains no executable file (conjunctive — three of its five rubric items are budget-independent)
- [ ] Gap G-12: every skip writes an **explicit verdict value** `"ui": "skipped: <predicate>"` into `state.json.reviews.impl.verdicts["iter-NN"]` — distinct from an absent key (dispatch lost / crashed / ledger-rejected) and from `null`. Document the slot in `t_state.json`
- [ ] `asd-phase-pr.md` step 4: teach the "reviewers actually required this sprint" parse to read the skip value
- [ ] `asd-reviewer-ui.md`: add the no-UI-surface carve-out to its `accessibility.html missing → ABORT` guard
- [ ] `asd-reviewer-performance.md` line 23: promote the existing stop condition to a dispatch-time predicate, conjunctively
- [ ] Make the whole scoping **switchable off**, so a user preferring full fan-out keeps today's behaviour
- [ ] `review-policy.md` DoD table and `README.md` reviewer table: mirror the conditional dispatch; run `sync.js --apply`

### Task 14: Collapse the three no-op design phases into one deterministic check

Verdicts: **P-3** (covering **P-4**, **P-5**), gap **G-11**, risk **R-13**. AC: AC-2, AC-4, AC-6. Owner: **backend-dev**.
Affected canonical files: `.asd/workflows/asd-phase-design.md` (step 2), `.asd/workflows/asd-phase-design-review.md` (step 2), `.asd/workflows/asd-phase-design-promote.md` (step 2), `.asd/rules/sprint-lifecycle.md` (no-op phase rule, no-op table, line 77), `.asd/rules/checkpoints.md` (precondition chain), `.asd/agents/asd-pm.md` (No-op exception), the three `.asd/skills/asd-phase-{design,design-review,design-promote}/SKILL.md` dispatch triggers, `README.md` phase table.
Material risk: audit R-13 — this changes an observable phase sequence that three consumers read: `nextPhase()` in `session-start.js`, the `asd-sprint` resume menu, and the rollback-reset table. **`PHASE_CHAIN` and `nextPhase()` are not edited**, so per G-13 no `tests/run.js` case is required or possible; verification is inspection. Phase count stays at ten and no gate is removed — a no-op phase has none by rule.

- [ ] At design entry, when all four `documents.*` flags are false, perform **one** deterministic check instead of three separate PM dispatches
- [ ] Gap G-11 resolution: the collapsed write sets **`phase = "design-promote"`** — the last collapsed phase — so `PHASE_CHAIN[idx+1]` mechanically yields `plan` and a resumed session cannot re-enter the collapsed block
- [ ] The same write puts all three names in `skipped_phases: ["design","design-review","design-promote"]` and emits `NEXT: plan`
- [ ] `sprint-lifecycle.md` line 77: extend the one-phase-at-a-time contract with the explicit multi-phase case
- [ ] Emit exactly **one** decisions-log line for the collapse, not three
- [ ] Verify the rollback-reset table still behaves correctly for a sprint that never individually entered the three phases
- [ ] `checkpoints.md` precondition chain, `asd-pm.md` No-op exception, the three SKILL.md triggers, `README.md` phase table: align; run `sync.js --apply`

### Task 15: Phase workflows write state.json inline for non-gate writes

Verdicts: **P-11**, **AG-1**, gap **G-10**, risk **R-14**. AC: AC-2, AC-3, AC-4, AC-6. Owner: **backend-dev**. Depends on Task 5 (same "State recovery" block).
Affected canonical files: `.asd/workflows/asd-phase-audit.md` (step 7), `.asd/workflows/asd-phase-design.md` (steps 5, 11), `.asd/workflows/asd-phase-plan.md` (step 4), `.asd/workflows/asd-phase-impl.md` (steps 4, 11), `.asd/workflows/asd-phase-impl-test.md` (steps 1, 8, 9), `.asd/rules/sprint-lifecycle.md` (State recovery), `.asd/agents/asd-pm.md`.
Material risk: audit R-14 — without the G-10 writer sentence landed in the **same** change, the framework describes one writer while two exist, and the next workflow edit re-introduces the split. PM's write allowlist must stay unchanged: it keeps the right, it merely stops being dispatched for it.

- [ ] Convert pure `state.json` field writes and mechanical decisions-log appends to inline workflow writes at all five sites
- [ ] Keep the `asd-pm` dispatch wherever a **user gate** is involved: audit approval, plan approval, impl assessment, PR confirmation, design-promote confirmations
- [ ] Gap G-10: add the explicit writer sentence to `sprint-lifecycle.md` "State recovery" naming the phase workflow as a permitted writer, in this same change
- [ ] Leave `asd-pm.md`'s write allowlist untouched
- [ ] Update the "Agents delegated to" block in every workflow file whose dispatch set changed
- [ ] Run `sync.js --apply` for `asd-pm.md`

### Task 16: Parallelize the audit phase

Verdict: **P-2**. AC: AC-2, AC-3, AC-4, AC-6. Owner: **backend-dev**. Depends on Task 2 (same files).
Affected canonical files: `.asd/workflows/asd-phase-audit.md` (steps 5-7), `.asd/agents/asd-ba.md` (Outputs, write allowlist), `.asd/agents/asd-architect.md` (Outputs, write allowlist), `.asd/templates/t_audit.md` (section ownership).
Material risk: this removes a write right from two agents — the same allowlist trap class as R-14. A permission fact that lives in a file whose diff is elsewhere is exactly what half-lands.

- [ ] BA and Architect **return** their audit sections as text; the workflow assembles `audit.md` — the pattern the framework already uses for reviewer files
- [ ] Dispatch both creators in parallel; they write disjoint sections and share no content dependency
- [ ] PM keeps only the approval gate at step 7
- [ ] Remove `audit.md` from both agents' write allowlists and update their Outputs sections
- [ ] `t_audit.md`: state section ownership explicitly so the assembly is unambiguous
- [ ] Run `sync.js --apply` for both agent files

### Task 17: Make impl-test re-entry incremental

Verdicts: **P-8**, **AG-7**, risk **R-15**. AC: AC-2, AC-3, AC-4, AC-6. Owner: **backend-dev**. Depends on Task 4 (same template).
Affected canonical files: `.asd/workflows/asd-phase-impl-test.md` (steps 2-3, 6, Re-entry), `.asd/rules/sprint-lifecycle.md` (Impl-test phase), `.asd/templates/t_test-plan.md`, `.asd/agents/asd-test-engineer.md`.
Material risk: audit R-15 — a defect introduced by a review-fix in a file outside the fix diff is not re-analysed for coverage. Bounded by the suite gate, which stays full-scope and unconditional.

- [ ] On re-entry, scope the strategy and prune passes to the **delta since the previous entry** (the review-fix commits), not the whole change surface
- [ ] **Amend** `test-plan.md` on re-entry instead of rewriting it from scratch
- [ ] The suite gate (step 7) stays a **full, unconditional** run — it is the gate, and it is not narrowed
- [ ] The removal gate (step 5) is unaffected
- [ ] `sprint-lifecycle.md`, `t_test-plan.md`, `asd-test-engineer.md`: align; run `sync.js --apply` for the agent file

### Task 18: Make the two redundant pr DoD checks conditional

Verdict: **P-10**. AC: AC-2, AC-4, AC-6. Owner: **backend-dev**. Depends on Task 13 (verdict-slot semantics).
Affected canonical files: `.asd/workflows/asd-phase-pr.md` (step 4), `.asd/rules/sprint-lifecycle.md` (PR phase).
Material risk: neither check is a `checkpoints.md` user pause — the pr row gates PR opening only, so nothing is weakened. If `state.json` verdicts are ever stale the file-parse fallback must actually fire, or a non-green review could pass the DoD.

- [ ] Re-run tests and lint only when `HEAD` has moved since the `Suite run` recorded in `test-plan.md`; impl-review produces no code, test or stub changes, so the intervening phase cannot invalidate a green suite
- [ ] Read review verdicts from `state.json.reviews.impl.verdicts["iter-NN"]`, with a review-file parse as the explicit fallback
- [ ] Handle the Task 13 `"skipped: <predicate>"` verdict values correctly in that read
- [ ] `sprint-lifecycle.md` (PR phase): document both conditionals

### Task 19: Give each review edge one owner and dedupe the impl procedures

Verdicts: **AG-9**, **AG-13**, gap **G-9**. AC: AC-3, AC-4, AC-6. Owner: **backend-dev**.
Affected canonical files: `.asd/agents/asd-reviewer-implementation.md` (rubric), `.asd/agents/asd-reviewer-testing.md` (rubric), `.asd/agents/asd-reviewer-documentation.md` (line 72), `.asd/agents/asd-backend-dev.md`, `.asd/agents/asd-frontend-dev.md`, `.asd/agents/asd-test-engineer.md`, `.asd/rules/sprint-lifecycle.md` (Impl phase), `.asd/workflows/asd-phase-impl.md` (step 6), `.asd/rules/git-strategy.md`.
Material risk: the dedup must **link** to the rule-doc SSoT, never simply delete — a dev agent that loses the manual-steps or tech-reference precondition loses a mandated refuse-to-implement guard. Review coverage improves: the AC→code edge stops having three owners that could return contradictory verdicts.

- [ ] `asd-reviewer-implementation.md` owns the AC→code trace **exclusively**; delete its test-presence rubric item (Testing owns it and judges the check, not its presence)
- [ ] `asd-reviewer-documentation.md` line 72: delete "and to code (in impl-review)" from its traceability item
- [ ] Gap G-9: dedupe the **manual-steps procedure** to its SSoT in `sprint-lifecycle.md` "Impl phase" and link from `asd-backend-dev.md`, `asd-frontend-dev.md`, `asd-test-engineer.md`, `asd-phase-impl.md` step 6 — five near-verbatim homes today
- [ ] Same for the **tech-reference precondition** block duplicated across all three dev-side agents
- [ ] Same for **stub handling**, duplicated across both dev agents, `asd-phase-impl.md` step 6 and `git-strategy.md`
- [ ] Verify every deduped agent still lists the owning rule doc under its Mandatory rules block
- [ ] Run `sync.js --apply` for all six edited agent files

### Task 20: Final consistency sweep and verification (AC-6 closure)

Verdicts: none — verification only. AC: AC-6. Owner: **backend-dev**. Depends on all preceding tasks.
Affected canonical files: none; this task reads and verifies, and must **not** absorb mirror duty from the tasks above (audit R-5, R-16 — mirrors land inside the task that owns the verdict).
Material risk: per gap G-13, nothing on the phase or agent axis is machine-checkable. This sweep is inspection, and it is the last line before impl-review's Documentation reviewer, whose self-hosting mandate is the only automated backstop.

- [ ] `node .asd/sync.js --check` clean
- [ ] `node tests/run.js` green
- [ ] `README.md` verified against the phase list, agent roster, model tiers (both provider columns), config schema, folder map and command table
- [ ] `core.md` "See also" lists every rule doc that still exists
- [ ] Reviewer verdict token `[REVIEW-<phase>-<reviewer>]: APPROVE|CONCERNS|FAIL` consistent across `review-policy.md`, both review workflows and all reviewer agent files
- [ ] The phase list identical in all four homes: `session-start.js` `PHASE_CHAIN`, `sprint-lifecycle.md`, `core.md` glossary, `README.md`
- [ ] Every agent named in a workflow dispatch site exists with matching capabilities; every delegation target named in an agent description is real
- [ ] Only `{{SPRINT}}`, `{{ITERATION}}`, `{{PHASE}}`, `{{agent:<name>}}` appear as template variables in skill, agent and workflow bodies
- [ ] `.asd/release-manifest.json`: `managed_paths` covers every canonical tree, `canon_hashes` has an entry per canonical source and none for deleted ones
- [ ] Repo-wide grep for references to anything this sprint deleted (`t_api.html`, `api.html`, `docs/architecture/adr/`, `subsystems_touched`, `new_subsystems`) returns nothing

## Risks

- Audit **R-5 / R-16**: every accepted verdict carries a mirror obligation larger than its template set, and `sync.js --check` sees drift only in `agents` / `skills` / `hooks` — never in `rules`, `templates` or `workflows`. A half-landed verdict leaves the framework internally contradictory and invisible to tooling. Mitigated by per-verdict task organisation and by Task 20.
- Audit **R-10** (Task 13): guaranteed off-domain review coverage is reduced. Accepted with all four mitigations mandatory, including the switch to restore full fan-out.
- Audit **R-3** (Task 1): archived per-file coverage evidence is lost; the runtime gate is unchanged.
- Audit **R-13** (Task 14) and **R-14** (Task 15): both change observable state contracts that the resume path reads; neither is machine-verifiable.
- Task 6 reverses a resolution already recorded in `.asd/project/decisions-log.md` on 2026-09-01. Until Task 6 lands in impl, the **live convention remains the project-wide log**; this plan's own approval entry is written there.
- Gap **G-4**: the template compressions in Tasks 2, 3, 4, 7, 8 reshape artifacts for **every consumer** on `/asd-update`, with no per-project dial. A dial would be a new config surface requiring Complication Approval; deliberately not proposed.
- Gap **G-7 / R-9**: savings for the full-profile artifacts (Tasks 7, 8, 9, 10, 11, 12) have never been exercised in this repo and rest on structural duplication visible in the templates, not on measured volume.

## Dependencies

- Task 4 depends on Task 1 (both edit `.asd/templates/t_review.md`)
- Task 15 depends on Task 5 (both edit `sprint-lifecycle.md` "State recovery")
- Task 16 depends on Task 2 (both edit `asd-phase-audit.md`, `t_audit.md`, `asd-ba.md`, `asd-architect.md`)
- Task 17 depends on Task 4 (both edit `t_test-plan.md`)
- Task 18 depends on Task 13 (consumes the `"skipped: <predicate>"` verdict slot)
- Task 20 depends on every preceding task

## Out of scope

- **R-11 — merging `scope` into `audit` (or `audit` into `design`): rejected.** Deletes a row from `checkpoints.md`'s mandatory-pause table. The scope gate is where `documents.*` is frozen and the AC-N list — the acceptance source for the whole lean profile — is fixed. Proposed, considered, declined; recorded here so the option is visibly rejected rather than silently omitted.
- **R-12 — dropping the impl assessment gate: rejected.** Deletes a mandated gate worth exactly one user pause per sprint (fix modes already skip it); it is the only user-facing checkpoint between the plan gate and the PR gate.
- **A-34 shared-stylesheet variant (`docs/assets/asd.css`): declined** in favour of the Task 11 trim variant. It would break single-file artifact portability and add a path `/asd-update` does not manage.
- **A-31 full on-demand generation and gate-triple reduction: declined** in favour of the Task 12 frequency change. The `checkpoints.md` design-gate file set is not touched by this sprint.
- **A-26 keeping `t_api.html` as an approval-triggered template: declined.** The template is deleted outright; API contracts fold through the open-set rule with no pre-made template.
- **G-6 — creating an artifact size-budget mechanism: not done.** Every compression here is structural (remove a section, replace a table with a summary). Recorded as a deliberate choice.
- **G-3 — adding an API draft stage / a `documents.api` flag: not done.** It would add a document, a config surface, a checkpoint row and a design-review scope entry — the opposite of this sprint's goal.
- Hand-editing generated provider views (`.claude/`, `.codex/`, `.agents/skills/`) — regenerated via `sync.js --apply` only.
- Consumer-owned content (`.asd/project/config.yaml`, `.asd/project/commands.yaml`, archived sprints). Task 10's build-to-view command is added to `asd-init`'s seeding template, not to the live `commands.yaml`.
- Sprint 001's decisions-log entries: immutable, untouched by Task 6.
