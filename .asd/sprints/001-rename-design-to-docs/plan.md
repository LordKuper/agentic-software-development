---
responsibility:
  owns: task breakdown, dod, task status (checkboxes)
  excludes: requirements, design decisions, code, review findings
  delegates_to: sprint.md (acceptance criteria), audit.md (file-by-file inventory), reviews/ (findings)
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

Purely textual rename of the project-wide persistent documentation root segment `design/` → `docs/` across every canonical ASD source, followed by regeneration of the provider views. No application code, no folder on disk, no data migration. The real risk is not "breaking the build" but **silently renaming too much** (~180 of the 426 raw `design/` occurrences are legitimate out-of-scope exclusions) or **silently renaming too little** — a half-renamed tree shows three green automated signals at once (audit R-11), so ordering and the final grep carry the whole verification burden.

Owner for every task: `backend-dev`. This is prose/config/markdown infrastructure editing with no UI surface.

## Context

- [sprint.md](./sprint.md) — source of acceptance criteria AC-1..AC-9 (`documents.prd: disabled`, so `sprint.md` is the AC source of record, not a PRD)
- [audit.md](./audit.md) — exhaustive BA + Architect file-by-file inventory with line numbers. **This is the working source for every edit.** Re-scanning the repo instead of following it duplicates work and risks a different classification of the out-of-scope hits.
- No persistent documentation docs are linked: none exist in this repo's lean self-hosting profile (`prd`/`ux_spec`/`adr`/`c4` disabled).
- **Prose-wording convention (audit G-1, resolved as option (a); approved this phase).** Phrases such as "persistent design docs" and "persistent design-artifact counterpart" are rewritten **line by line only where they denote the renamed root**; occurrences that denote the `design` *phase* keep their wording. Target phrasing: "persistent docs". This convention is applied inside whichever task owns the file, not as a separate sweep.
- **File-ownership convention (approved this phase).** One file, one task. The three cross-cutting atomic sets — the `':(exclude)design/**'` git pathspecs (R-4), the backslash-spelled `design\\ux\\DESIGN.md` command aliases (R-10), and the prose reword above (G-1) — live as explicit subtasks inside their owning file-group task. Their integrity is guaranteed by the targeted greps in Task 11, not by a shared task.
- Commands from `.asd/project/commands.yaml`: `test: node tests/run.js`, `build: node .asd/sync.js --check`, `lint: git diff --check`.

## Definition of Done

All of AC-1 through AC-9 are covered by the tasks below and completed. `node tests/run.js` is green. `node .asd/sync.js --check` reports no drift. The AC-7 repository-wide search — run over **both** the `design/` and `design\\` patterns with the exclusion set fixed in AC-7 — returns zero in-scope hits, and the two targeted greps (`exclude)design` and `design\\ux`) return zero. `git diff .asd/release-manifest.json` is non-empty and covers the touched canonical files. All impl-review reviewers are green.

### Task 1: Rename the docs root across `.asd/rules/`
Owner: `backend-dev`. Satisfies AC-1 (and preserves AC-3, AC-4). Start here — `artifact-layout.md` is the SSoT for the layout being renamed and every other file's phrasing is downstream of it. Material risk for impl-test: in-scope and out-of-scope occurrences sit on adjacent (sometimes the same) lines; a regex sweep corrupts the design phase's own paths.

- [x] `artifact-layout.md` — lines 45, 67, 70, 84, 141; do NOT touch 31 (`<sprint>/design/`), 41 (`reviews/design/iter-NN/`), 58, 59, 77, 109 (`DESIGN.md`, `design-system.html` names)
- [x] `core.md` — lines 20, 22; keep the `design-promote` phase name on line 22
- [x] `sprint-lifecycle.md` — lines 49, 52, 105, 122, 135, 136, 137; do NOT touch 42, 49–51 (`<sprint>/design/`, `reviews/design/`), 107, 114, or any phase-name column value
- [x] `checkpoints.md` — line 15; keep the `design-promote` phase name in the same row
- [x] `language-policy.md` — line 8
- [x] `design-system.md` — line 7; the file name `design-system.md` itself stays (AC-4)
- [x] `review-policy.md` — line 136; do NOT touch the `design-review` row of the reviewer table
- [x] `external-review.md` — lines 44, 47, 51; do NOT touch 43, 47 (`<sprint>/design/c4-full/`), 57, 77 (`reviews/design/`), or the `design-review` phase name
- [x] Atomic set R-4 (executable data, not prose): `external-review.md:44,51` carry the git pathspec `':(exclude)design/**'` — the other two members are in Task 2 (`t_prompt-external-impl.md:14`) and Task 3 (`asd-external-review.md:53`); all three must end up consistent, verified by the `exclude)design` grep in Task 11
- [x] Re-grep each edited file and diff the result against audit.md §1's classification table

### Task 2: Rename the docs root across `.asd/templates/`
Owner: `backend-dev`. Satisfies AC-1, AC-2, AC-4. Material risk for impl-test: two relative links and four separator-blind occurrences that the `design/` pattern cannot see.

- [x] `t_config.yaml` — lines 13, 54, 55; plus prose lines 8, 48 per the G-1 convention
- [x] `t_plan.md` — lines 5, 23, 24, 25. G-5: change **only** the path segment; preserve the `../../` prefix on lines 23–25 exactly
- [x] `t_ux-spec.html` — line 49; same `../../` preservation rule
- [x] `t_audit.md` — lines 50, 54, 56 (Documentation-migration-plan boilerplate)
- [x] `t_commands.yaml` — POSIX lines 27, 29 **and** backslash lines 21, 23 (`design\\ux\\DESIGN.md`, audit R-10 — invisible to a `design/` grep). The `@google/design.md` package name in the same lines is NOT part of the rename
- [x] `t_test-plan.md` — line 5
- [x] `t_sprint.md` — line 5
- [x] `t_design-md-delta.yaml` — line 1; the file name itself stays (AC-4)
- [x] `external-review/t_prompt-external-impl.md` — line 14 (member of atomic set R-4); do NOT touch line 15 (`design/doc content` — an "or" pair)
- [x] `t_AGENTS.md` — line 34, prose only, per the G-1 convention; no path occurrence exists here
- [x] Do NOT touch: `t_custom-common-rules.md:5`, `t_custom-coding-rules.md:5` (the `design/design-review` phase pair — 100% out of scope despite matching the raw grep), `external-review/t_prompt-external-design.md:14`, and the file names `t_custom-design-rules.md` / `t_design-system.html`

### Task 3: Rename the docs root across `.asd/agents/`
Owner: `backend-dev`. Satisfies AC-1. Material risk for impl-test: three of these lines are write-access allowlists — a missed rename there silently revokes an agent's permission to write the promoted doc and only surfaces sprints later (audit R-5).

- [x] Write-access allowlist checklist (verify each individually): `asd-architect.md:65`, `asd-ux-designer.md:70`, `asd-ba.md:61`
- [x] `asd-architect.md` — lines 38–40, 47–50, 65, 106, 107, 115 (heaviest file)
- [x] `asd-ux-designer.md` — lines 41–44, 52, 53, 70
- [x] `asd-frontend-dev.md` — lines 40–45, 106
- [x] `asd-backend-dev.md` — lines 40–42, 102
- [x] `asd-test-engineer.md` — lines 41–43, 126
- [x] `asd-reviewer-ui.md` — lines 43–45, 49–51
- [x] `asd-reviewer-documentation.md` — lines 16, 44, 48, 74, 86; lines 44 and 48 mix in-scope and out-of-scope occurrences within the same line — edit character by character
- [x] `asd-reviewer-quality.md` — lines 40, 41
- [x] `asd-reviewer-performance.md` — lines 39, 40
- [x] `asd-reviewer-testing.md` — line 40
- [x] `asd-reviewer-implementation.md` — line 37
- [x] `asd-ba.md` — lines 39, 76
- [x] `asd-pm.md` — lines 93, 108
- [x] `asd-external-review.md` — line 53 (member of atomic set R-4)
- [x] Reword the ~8 reviewer "Never modify … design docs" prose lines per the G-1 convention
- [x] Do NOT edit `asd-reviewer-simplification.md` at all (line 41 is `<sprint>/design/`, line 98 is phase-scoped prose)

### Task 4: Rename the docs root across `.asd/skills/`
Owner: `backend-dev`. Satisfies AC-1. Material risk for impl-test: skill `description` strings are the dispatch triggers and live inside JSON frontmatter — a malformed edit breaks dispatch on both providers (audit R-6).

- [x] `asd-init/SKILL.md` — line 4 (description), 58–60, 107, 109, **and backslash lines 101, 103** (`design\\ux\\DESIGN.md`, R-10)
- [x] `asd-design-system/SKILL.md` — line 4 (description), 15, 16, 28, 94, 101, 110, 142–144
- [x] `asd-stack/SKILL.md` — line 4 (description), 15, 27, 96, 104, 134, 135
- [x] `asd-concept/SKILL.md` — lines 26, 82, 89, 107
- [x] `asd-update/SKILL.md` — line 4 (description prose, G-1 convention) and line 20. Resolution of G-13: the "Never touched" line becomes `docs/**`; the migration window is covered by the CHANGELOG entry in Task 7, not by listing both roots
- [x] `asd-phase-design-promote/SKILL.md` — line 4 (description) only; the skill name and the phase name stay unchanged (AC-3)
- [x] After each frontmatter edit, confirm the JSON still parses
- [x] Never hand-edit the generated mirrors under `.claude/skills/` or `.agents/skills/` — they are the output of Task 9

### Task 5: Rename the docs root across `.asd/workflows/`
Owner: `backend-dev`. Satisfies AC-1 (preserving AC-3). `.asd/workflows/` has no generated counterpart, so these edits are canon-only and — per audit G-10 — are invisible to `sync.js --check`.

- [x] `asd-phase-design-promote.md` — lines 11, 37, 42–45, 50–52, 67–71 (heaviest)
- [x] `asd-phase-design.md` — lines 12, 28, 32, 36, 40, 57, 59
- [x] `asd-phase-plan.md` — lines 7, 11, 19
- [x] `asd-phase-impl.md` — lines 12, 68
- [x] `asd-phase-impl-test.md` — lines 11, 28
- [x] `asd-phase-impl-review.md` — lines 12, 32
- [x] `asd-phase-audit.md` — lines 24, 34 (plus line 50, a same-class in-scope occurrence the line enumeration missed)
- [x] Do NOT edit `asd-phase-design-review.md` (all 12 hits are `<sprint>/design/` or `reviews/design/`), `asd-phase-scope.md`, or `asd-phase-pr.md`
- [x] Keep every `asd-phase-design*` file name, phase name, and dispatch reference literally unchanged (AC-3)

### Task 6: Update `.asd/project/` and confirm the manifest needs no hand edit
Owner: `backend-dev`. Satisfies AC-1. Material risk for impl-test: this task's main content is a set of things that must NOT change — a hand edit to `release-manifest.json` corrupts the hash ledger.

- [x] `config.yaml` — line 15 (comment); plus prose lines 8, 50 per the G-1 convention
- [x] Confirm (do not edit) `.asd/release-manifest.json`: every `design`-bearing string is an AC-3/AC-4 file name and `managed_paths` is `.asd/`-only (audit G-2). Its only legitimate change is the hash ledger, recomputed in Task 10
- [x] Do NOT touch `custom-common-rules.md:5`, `custom-coding-rules.md:5` (phase pair), `custom-design-rules.md` (file name, AC-4), `decisions-log.md` (append-only, excluded by AC-7), `stubs.md`, or `commands.yaml` (zero occurrences)

### Task 7: Author the `CHANGELOG.md` migration entry
Owner: `backend-dev`. Satisfies AC-9. This entry is the implementation of option (a) from escalation R-13 (documentation-only consumer migration); options (b) and (c) were rejected as out of scope.

- [x] Add the entry under a `## Unreleased` heading. Approved placement decision: authored now, in impl; the `pr` phase only renames the heading to the concrete version alongside the `asd_version` bump per `.asd/rules/git-strategy.md` "Versioning & Changelog". impl and pr therefore never contend for this file
- [x] Document the change as breaking: the project-wide persistent documentation root moves from `design/` to `docs/`
- [x] State the consumer migration steps in order: `git mv design docs` → fix the `designmd-lint` / `designmd-export` aliases in the consumer's own `.asd/project/commands.yaml` (never updated by `/asd-update`) → run `/asd-update` → run `/asd-sync`
- [x] Note the split-brain window (audit R-13, third order): between `/asd-update` and `/asd-sync` the consumer's `.asd/rules` say `docs/` while their generated agent/skill views still say `design/`, so `/asd-sync` must follow immediately
- [x] Note that nothing auto-migrates and nothing errors — the failure mode is a silently split documentation corpus, not a crash

### Task 8: Update the `README.md` and `AGENTS.md` mirrors
Owner: `backend-dev`. Satisfies AC-8 (and the `AGENTS.md` hard rule that every workflow change is checked against `README.md`). Last content edits of the sprint — they must reflect the final state of Tasks 1–7. Material risk for impl-test: the folder map and command table are easy to half-update (audit R-7).

- [x] `README.md` line 83 — never-touched table
- [x] `README.md` line 154 — design-promote row
- [x] `README.md` lines 172, 173, 174 — `/asd-concept`, `/asd-stack`, `/asd-design-system` command-table target paths
- [x] `README.md` line 227 — config-schema excerpt
- [x] `README.md` lines 306–320 — the whole folder-map block
- [x] `README.md` prose lines 14, 176, 306 per the G-1 convention
- [x] `AGENTS.md` line 32
- [x] Diff the finished README folder map line for line against the final `artifact-layout.md`; README is a mirror, not a second SSoT

### Task 9: Regenerate the provider views
Owner: `backend-dev`. Satisfies AC-5. Must run after every canon edit in Tasks 1–8. Material risk for impl-test: the obvious invocation is a no-op, and an accidental edit under `.claude/` poisons a `json-merge` target.

- [x] Run `node .asd/sync.js --check` and capture every target whose status is not `current`
- [x] Run `node .asd/sync.js --apply <file...>` **passing those targets explicitly** (or every touched canonical agent/skill file). A bare `node .asd/sync.js --apply` with no file arguments writes zero targets — it only recomputes the hash ledgers (audit G-9), so it is useless as a regeneration step
- [x] Confirm the regenerated set covers the expected ~40 views: `.claude/agents/*.md` and `.codex/agents/*.toml` (14 each), `.claude/skills/*/SKILL.md` and `.agents/skills/*/SKILL.md` (6 each)
- [x] Never hand-edit anything under `.claude/`, `.codex/`, or `.agents/`. In particular, `.claude/settings.json` is a `json-merge` target holding `Bash(designmd:*)` / `@google/design.md` permission strings — those are package and CLI names, never paths; editing them flips the file to `modified-foreign` (audit R-14)
- [x] Record in the task notes that `.asd/rules`, `.asd/templates`, and `.asd/workflows` have **no sync target at all** (audit G-10): a green `--check` proves nothing about those ~24 files

### Task 10: Recompute the release-manifest hash ledgers
Owner: `backend-dev`. Satisfies AC-5. Runs after every per-file apply in Task 9. Material risk for impl-test: skipping this is invisible in this repo and only manifests as a broken `/asd-update` in a consumer.

- [x] Run a single bare `node .asd/sync.js --apply` (no arguments) — the one thing this form does is run `recomputeAndWriteHashLedgers` whole-repo
- [x] Assert `git diff .asd/release-manifest.json` is non-empty and that the changed entries cover the canonical files touched in Tasks 1–6
- [x] Do not hand-edit any ledger value (audit G-2). Rationale for the step: stale `upstream_hashes` make a consumer's `update.js` classify untouched files as locally modified, so it **skips** them and the consumer never receives the renamed rules (audit R-12)

### Task 11: Final verification
Owner: `backend-dev`. Satisfies AC-5, AC-6, AC-7. Strictly the last task in the sprint. Material risk for impl-test: this is the sprint's only real completeness gate — `--check` and `tests/run.js` prove nothing about rename completeness (audit R-11).

- [x] `node tests/run.js` — green (AC-6). Note: it contains no `design` fixture, so it provides zero regression cover for the rename
- [x] `node .asd/sync.js --check` — no drift (AC-5). Informational only, per the G-10 caveat above
- [x] AC-7 repository-wide grep, pattern `design/`, with the AC-7 exclusion set: `<sprint>/design/`, `reviews/design/`, `asd-phase-design*`, the `design/design-review` phase pair, `design-system*`, `design-principles*`, `t_design-md-delta.yaml`, `.asd/sprints/**`, `decisions-log.md`, `CHANGELOG.md`. Zero in-scope hits required
- [x] AC-7 repository-wide grep, pattern `design\\`, same exclusion set. Zero in-scope hits required (audit R-10 — the `design/` pattern is separator-blind)
- [x] Targeted grep `exclude)design` — must return zero (atomic set R-4 fully applied)
- [x] Targeted grep `design\\ux` — must return zero (atomic set R-10 fully applied)
- [x] Re-read `.asd/hooks/session-start.js` and `.claude/settings.json` and confirm their `design` occurrences are phase names (`PHASE_CHAIN`, `reviews.design`) and package/CLI names respectively — both out of scope. Do not edit; this corrects audit §9's "zero occurrences" claim, which would otherwise cause the files to be skipped unread
- [x] Confirm AC-2 by inspection: every renamed path keeps its subtree intact (`docs/product/…`, `docs/architecture/…`, `docs/ux/…`) and only the leading segment changed
- [x] Confirm AC-4 by inspection: `DESIGN.md`, `design-system.html`, `design-principles.md`, `design-system.md`, `custom-design-rules.md` file names are unchanged

## Risks

- R-11: a half-renamed tree passes every automated gate simultaneously — `--check` cannot see rules/templates/workflows, `tests/run.js` has no `design` fixture, and a bare `--apply` regenerates nothing. Mitigated by the strict Task 1–8 → 9 → 10 → 11 ordering and by treating the Task 11 greps as the only completeness gate.
- R-1: mis-renaming an out-of-scope occurrence. ~180 of 426 raw hits are exclusions, and the highest-confusion classes sit on the same line as in-scope refs. Mitigated by line-numbered, per-file subtasks and explicit do-NOT-touch lists; no global regex replace.
- R-4: a stale `':(exclude)design/**'` git pathspec silently changes what an external reviewer sees. Mitigated by the atomic-set subtasks in Tasks 1–3 and the `exclude)design` grep.
- R-5: a missed rename in an agent write-access allowlist silently revokes write permission, surfacing sprints later. Mitigated by the explicit three-line checklist opening Task 3.
- R-10: the verification grep is separator-blind; four real occurrences use `design\\`. Mitigated by the explicit backslash subtasks in Tasks 2 and 4 and the second grep pattern in Task 11.
- R-12: shipping stale `upstream_hashes` makes consumers silently skip the renamed rules. Mitigated by Task 10.
- R-6: skill `description` strings are dispatch triggers inside JSON frontmatter. Mitigated by the parse check in Task 4.
- R-7: README mirror drift. Mitigated by Task 8 running last among content tasks and diffing against `artifact-layout.md`.

## Dependencies

- Task 8 depends on Tasks 1–6 (README/AGENTS must mirror the final canon state)
- Task 9 depends on Tasks 1–8 (all canon edits must land before regeneration)
- Task 10 depends on Task 9
- Task 11 depends on Task 10
- Tasks 1–7 are mutually independent and may proceed in parallel

## Out of scope

- Everything listed under "Out of scope" in [sprint.md](./sprint.md)
- Hand-editing `.asd/release-manifest.json` (audit G-2)
- Hand-editing anything under `.claude/`, `.codex/`, or `.agents/` — regeneration output only (audit R-14)
- Consumer-migration options (b) one-shot rename in `asd-update` and (c) a dual-root config key from escalation R-13 — rejected in favour of option (a), the CHANGELOG entry in Task 7
- Any test-authoring work — the test approach is selected in `impl-test`, after the change exists
