---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

## Overview
`standard`'s design-review moves from two internal reviewers to `asd-reviewer-combined` plus External Review (AC-1..AC-4), and the sprint carries five retro/issue fixes (AC-5..AC-10). All five Tasks run in wave 1 on disjoint paths. New or changed rule homes the Tasks cite by name: the design-review roster is `.asd/workflows/standard.json` `reviewers.design`; combined's design-review inputs live in `.asd/agents/asd-reviewer-combined.md` "## Inputs"; design-review DoD is `.asd/rules/review-policy.md` "DoD per review phase"; per-reviewer concerns are `.asd/rules/review-policy.md` "Reviewer responsibility"; the self-hosting fix-round sync point is `.asd/workflows/asd-phase-impl.md` step 7, restated in `.asd/rules/sprint-lifecycle.md` "Self-hosting".

Removal sweep (grep forms for quality/efficiency leaving design-review, every hit edited by the Task that owns its file): `asd-reviewer-quality + asd-reviewer-efficiency`, `asd-reviewer-quality, asd-reviewer-efficiency`, `Quality + Efficiency + External Review` (design-review rows only), `Quality, Efficiency` (design-review rows only), `` `quality`/`efficiency`/`external` ``, `2 internal reviewers (Quality, Efficiency)` (design-review rows only), `design-review + impl-review`, `dispatched in design-review`, `Quality · Efficiency · External`, `lite has no design-review`, `impl-review only — never dispatched in design-review`, `Lite impl-review reviewer`, `impl-review (\`lite\` only)`. Rubric tags `[design-review, …]` and `[design-review]` in `asd-reviewer-quality.md`/`asd-reviewer-efficiency.md` stay: the combined manifest composes them.

Orchestrator, before the wave-1 dispatch: append to `.asd/project/custom-common-rules.md` the line "On Git Bash, run `git show <ref>:<path>` with `MSYS_NO_PATHCONV=1` set." and commit it (AC-7; `.asd/project/` is outside the dev write allowlist).

External APIs: Task 5 relies on `git diff` argv and the Windows command-line cap — `docs/architecture/tech-reference/git-2.55.md` (written at plan); no other Task calls an external API.

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.
A runtime test emits a `combined` design-review manifest and persists a `[REVIEW-design-combined]` return, since this repo never runs design-review itself.

### Task 1: Design-review roster and dispatch
Material risk: change: design-review dispatch and DoD wording
- [x] `.asd/workflows/standard.json`: `reviewers.design` → `["combined", "external"]`; `reviewers.impl` and `lite.json` untouched (AC-1)
- [x] `.asd/workflows/asd-phase-design-review.md`: owner line, step 7 internal-reviewer bullet ("Every internal reviewer — …"), step 9 verdict keys (`combined`/`external`) and `## Dispatch` agent entry name `asd-reviewer-combined`; the `## Rules` bullet on Quality's UI section becomes the combined reviewer's (UI conformance `n/a: outside phase gate` without a ux-spec/design-system draft) (AC-2)
- [x] `.asd/skills/asd-phase-design-review/SKILL.md`: description dispatches `asd-reviewer-combined` (and `asd-external-review` when enabled); its UI clause names the combined reviewer (AC-2)

### Task 2: Combined reviewer reviews drafts; context rows
Material risk: change: combined design-review input and verdict contract
- [x] `.asd/agents/asd-reviewer-combined.md` (AC-3): description ≤300 chars in the `<what>; <phase/dispatch purpose>. Not: …` form — one-pass reviewer of standard design-review and lite impl-review, `Not:` naming `asd-reviewer-quality`/`asd-reviewer-efficiency` for standard impl-review only; Role names both phases; `## Inputs` phase-keyed like `asd-reviewer-quality.md` — common (`payload.manifest`, `payload.iteration`, `payload.floor`, return file, `payload.inputs.requirements`, the composed rubrics), `design-review` (the listed drafts, `payload.diff` from iteration 2, existing `docs/` for the SSoT cross-check, `payload.inputs.audit` optional, `payload.inputs.ux` only when the manifest keeps UI conformance), `impl-review` (today's `payload.diff`, `plan.md`, `test-plan.md` and segments); drop the "impl-review only — never dispatched in design-review" rule; scope the persistent-actuality rule to impl-review; `## Gate Verdict Format` `[REVIEW-<phase>-combined]` with `<phase>` `design`/`impl` and both return paths; `### Overall quality` fits drafts ("plan Task" only in impl-review)
- [x] `.asd/agents/asd-reviewer-quality.md`, `.asd/agents/asd-reviewer-efficiency.md` (AC-3): description and Role line dispatch only in standard impl-review, their design-review rubric entries composed by `asd-reviewer-combined`; drop their `design-review` input blocks and design-review-only Rules/Escalation clauses no dispatch reads any more; keep every rubric tag and entry
- [x] `.asd/rules/providers.md` (AC-3, AC-4): line 48 internal reviewers per workflow and phase (`combined` in standard design-review and lite impl-review; `quality`/`efficiency` in standard impl-review); Role-scoped context: drop the `asd-reviewer-quality`/`asd-reviewer-efficiency` `design-review` rows, split the `asd-reviewer-combined` `*` row into `*` (phase-neutral refs), `design-review` (`asd-phase-design-review.md#Rules`, `custom-design-rules.md`) and `impl-review` (`asd-phase-impl-review.md#Rules`, `custom-coding-rules.md`, `code-style.md`, `artifact-layout.md#Manual steps`, `#Test plan`)

### Task 3: Rule docs — roster mirrors, fix hold, sync point, amendment check
Material risk: change: rule wording for the fix-application hold, sync point and amendment check
- [x] `.asd/rules/review-policy.md` (AC-4): "Reviewer responsibility" — Combined's design-review cell carries Quality's and Efficiency's design-review concerns plus overall quality · every scoped draft; Quality's and Efficiency's design-review cells state their concerns are judged there by Combined (each cell non-empty); "DoD per review phase" design-review (standard) row → Combined plus External Review (if enabled), Combined's UI conformance `n/a: outside phase gate` without a ux-spec/design-system draft; the paragraph under the table ("Quality still dispatches …") follows
- [x] `.asd/rules/review-policy.md` "Verify before applying" (AC-5): the fixer holds a suggested fix to the over-engineering checklist before applying it, and a case the caller excludes gets no callee guard
- [x] `.asd/rules/sprint-lifecycle.md` (AC-4, AC-6, AC-8): "Phase table" design-review row Owner → Combined + External Review; "Self-hosting" sync sentence → after a wave's last canon-editing dispatch (initial) or after the dev chain and before the tester chain (fix modes); "Scope amendment" — before the criterion joins the plan, its rule text is checked against every accepted criterion's rule for a contradiction
- [x] `.asd/workflows/asd-phase-impl.md` step 7 (AC-6): fix modes run the sync (the changed views, or `--apply AGENTS.md` for canon with no view) once the dev chain has signalled and before the tester chain is dispatched; initial mode unchanged
- [x] `.asd/rules/design-system.md` lines 3 and 83, `.asd/rules/ux-principles.md` line 3 (AC-4): the UI conformance verifier is the Quality rubric's UI conformance section, applied by `asd-reviewer-quality` (standard impl-review) or `asd-reviewer-combined` (standard design-review, lite impl-review)

### Task 4: README mirrors
Material risk: artifact: README roster mirror rows
- [x] `README.md` (AC-4): line 134 `standard` bullet (design-review: one combined internal reviewer plus External Review; impl-review: Quality, Efficiency plus External Review); flowchart node line 162 `Combined · External`; phase table line 189 design-review row; agent roster lines 246-248 `Phase(s)` and Scope cells (quality/efficiency: standard impl-review; combined: standard design-review + lite impl-review); every other README hit of the Overview removal sweep

### Task 5: Runtime — chunked git path lists, findings header check
Material risk: change: command-line budget and rename-pair chunk edges
- [x] `.asd/runtime.js` `rangePatchInvocations` (AC-9): split each range's `patchPaths` list into consecutive invocations, in list order, each a whole number of path units (a rename's source and destination are one unit), so that per invocation the sum over all its arguments of (2 × length + 3) stays ≤ 32,000; an empty list yields no invocation, a single unit always fits; `writeManifestDiff` and `patchBytes` consume the invocation list unchanged
- [x] `.asd/runtime.js` `reviewFindings` (AC-10): the header cells must equal `#`, `Severity`, `Location`, `Description`, `Suggested fix` (the `t_review.md` and `external-review/t_review-report.md` header) before any row is read; any other header fails with a message naming the expected columns

## Risks (optional)
- Tests emitting design-review manifests or persisting design-review returns for `quality`/`efficiency` (`tests/run.js` ≈ 2088, 4595, 4620-4626, 5345-5360, 5438, 5733) go red once `reviewerKeys('design')` is `combined`/`external`; impl-test adapts them to `combined`.
- Chunking changes the `.diff` fingerprint name for scopes above the budget only; below it the single invocation, and so the name, is unchanged.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | Task 1, Task 2, Task 3, Task 4, Task 5 |

- Tasks 1, 2 and 4 mirror the same roster decision (AC-1); each takes its wording from the Overview's homes, not from another Task's diff.

## Out of scope (optional)
- `standard` impl-review roster; a config key restoring two design-review reviewers; in-flight sprint migration (`sprint.md` Out of scope).
