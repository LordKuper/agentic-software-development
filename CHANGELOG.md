# Changelog

All notable consumer-facing changes to ASD. Format: [Keep a Changelog](https://keepachangelog.com/). Versions follow [SemVer](https://semver.org/). Newest first.

## v3.1.0

Doc-links-and-autonomy revision: gated artifacts are now written to disk first and reviewed in the real file via a path link instead of being dumped into chat, and non-gate agent uncertainty routes to a new read-only advisor agent instead of interrupting the user. No user approval was removed from any gate that decides a phase advance.

### Added
- **`asd-advisor` agent** (`.asd/agents/asd-advisor.md`) — a read-only consultation agent (no `Write`/`Edit`/`Bash`; `sandbox_mode: "read-only"`; `fable`/`sol` model families) that any agent may dispatch when it is uncertain about a non-gate decision. It gives advice only; it cannot write files and it never stands in for a user-facing HARD gate. Agent roster goes 15 → 16.
- **`ADVICE_NEEDED` signal** with a uniform relay branch in all ten `asd-phase-*` workflows: a dispatched agent emitting it gets an advisor consult and execution resumes — it never halts the phase and never becomes a user question. Consults are capped per workflow and the advisor cannot recurse into itself.
- **Write-then-review-accept gate class** defined once in `checkpoints.md`: the creator writes the artifact to its path, posts the absolute path plus a short delta summary in chat, the user reviews the actual file, and an explicit `accept` advances the phase while any other feedback revises the same file in place. Revision is always in place — no `-v2` files, no duplicate drafts — and each `accept` appends a decisions-log entry naming the artifact path.

### Changed
- **Gate table rewritten row by row** in `checkpoints.md` and `asd-pm`'s mirror of it, splitting every gate into two explicit classes (approve-before-write vs write-then-review-accept). Moved to write-then-review-accept: `sprint.md` (scope), `plan.md` (plan), and the design phase's per-artifact rows for `prd.html` / design-system / `ux-spec.html` / `adr.html`, plus `concept.html`, `stack.html`, `DESIGN.md`, `design-system.html`, `accessibility.html` in the standalone setup skills. Unchanged as approve-before-write: `audit` merge approval, `impl` assessment, `impl-test` removal approval, `impl-review` final verdict, `pr` opening confirmation — these gate a decision or phase advance, not an artifact draft.
- **Chat no longer carries artifact bodies.** For every write-then-review-accept gate the chat message is a path link, a brief delta summary, and any open questions. Approval stays explicit and stays recorded in the decisions-log.
- `asd-concept`, `asd-stack`, `asd-design-system` section loops are write-first: each section is written to disk before its lock-in question, and their skeleton writes are now guarded on the target file's own on-disk existence so an edit-mode dispatch can no longer overwrite real content with a placeholder. A revision loop re-runs the affected regeneration/lint passes before re-accepting, so derived artifacts are never accepted stale.
- `language-policy.md` reconciles the accept vocabulary and the chat/docs language split for review messages: the artifact stays in `language.docs`, the link-and-summary message in `language.chat`.

### Removed
- **design-promote's final-mutation gate and its step-8 per-persistent-write gate**, both redundant re-confirmations of draft content the user already accepted at draft time. design-promote's **decomposition** and **new-subsystem** gates are explicitly retained as approve-before-write — they are structural decisions about persistent-doc/C4-registry layout that draft acceptance never showed the user. The phase now writes its own decisions-log entries and `state.json`, then posts a non-blocking post-promotion summary.
- The design phase's `c4-full/` artifact gate — `c4-full/` now carries no approval gate of any kind.

## v3.0.0

Lean-workflow revision: a full audit of the framework's artifacts, phases, and agents, implemented as compressions and conditional dispatch. Sprints produce materially less text per artifact and dispatch fewer agents on unrelated changes; no `checkpoints.md` user approval gate was removed.

### Added
- `state.json` `reviews.impl.iteration_heads["iter-NN"]` field, recording the `git rev-parse HEAD` sha at the start of each impl-review iteration so iteration 2+ diffs scope to commits since the previous iteration, not just the last commit. A sprint already in flight when this field shipped has no entry for earlier iterations — the iteration-2+ diff computation falls back to the iteration-1 base-branch diff instead of resolving an absent key to an empty diff, noting the widened scope in that iteration's decisions-log entry.
- Optional `review.scoped_fan_out` config key (`enabled`/`disabled`, default absent = `disabled` = full fan-out): when `enabled`, the UI and Performance impl-review reviewers are skipped for iterations whose diff contains no UI surface / no executable file and no perf-budgets section, cutting review dispatch cost on unrelated changes. Absent from an existing consumer's `.asd/project/config.yaml` (this repo's own included) — `/asd-update` never touches consumer-owned config, so add `review: { scoped_fan_out: enabled }` manually to opt in; the seeding template for newly-initialized projects already includes it.
- Standing Definition of Done for every sprint declared once in `sprint-lifecycle.md` "Plan file format" (AC coverage, green suite at `impl-test`, reviewers green at `impl-review`). `plan.md`'s own DoD section now carries only sprint-specific additions.
- Explicit rule that an absent optional section in `audit.md` means an empty finding set, not an unperformed check — replacing the mandated placeholder rows that previously carried that distinction.
- `state.json` accepts a `"skipped: <predicate>"` verdict value for a reviewer not dispatched under `review.scoped_fan_out`, distinct from an absent key (dispatch lost) and from `null`. The `pr` DoD check and the SessionStart hook both treat it as satisfied, never as missing.
- `asd-init` seeds a C4 "build to view" command into the generated `commands.yaml`, plus `.gitignore` entries for C4 build output.
- `t_adr.html` gained an optional per-decision "Fold target" line naming the persistent doc that absorbs the decision and the `owns:` clause justifying it.

### Changed
- **BREAKING:** ADRs are now **sprint-scoped only** (`<sprint>/design/adr.html`) with sprint-local numbering (`ADR-1`, `ADR-2`, …). The persistent `docs/architecture/adr/` tree is gone and ADRs are never promoted as a standalone document type; the `superseded`/`deprecated` statuses were dropped as unreachable. At `design-promote`, each approved decision folds into whichever existing persistent doc already declares ownership of its subject in `responsibility.owns` — never via a lookup table. When nothing owns it, that is a Complication Approval, not a licence to invent a document. Migration: existing `docs/architecture/adr/` files are consumer-owned and untouched by `/asd-update`; keep them as historical records or fold their content into the owning subsystem docs at your convenience.
- **BREAKING:** the decisions log is now per-sprint (`<sprint>/decisions-log.md`), created at `scope` and archived with the sprint, instead of a single project-wide `.asd/project/decisions-log.md`. A durability rule requires any decision whose value must outlive the sprint to also be written into an existing persistent home (`docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`) — never a new document type. This repo's own prior history in `.asd/project/decisions-log.md` is untouched and frozen (closed with one final entry), not deleted — it was never in `managed_paths`, so existing consumers are unaffected until they adopt this convention via a future full-profile sprint.
- Review files persist a coverage **summary line** plus the verbatim `n/a` list and every non-passing row, instead of full per-file ledger tables. The gate itself is unchanged: reviewers still return a complete ledger and it is still validated on the returned text before the file is written — only what gets archived shrank.
- When every `documents.*` flag is disabled, `design` / `design-review` / `design-promote` collapse into **one** deterministic no-op check at design entry: a single `state.json` write sets `phase = "design-promote"`, records all three names in `skipped_phases`, and emits one decisions-log line. Phase count stays at ten and `PHASE_CHAIN` is unchanged, so a resumed session mechanically advances to `plan`.
- Audit phase dispatches BA and Architect **in parallel**; both now return their sections as text and the workflow assembles `audit.md` (matching the existing reviewer pattern). `audit.md` was removed from both agents' write allowlists.
- Phase workflows write `state.json` inline for mechanical, non-gate field updates instead of dispatching `asd-pm`. PM is still dispatched wherever a user gate is involved (audit approval, plan approval, impl assessment, PR confirmation, design-promote confirmations) and its write allowlist is unchanged.
- `impl-test` re-entry is incremental: the strategy and prune passes scope to the delta since the previous entry and `test-plan.md` is amended rather than rewritten. The suite gate stays a full, unconditional run.
- The `pr` DoD re-runs tests and lint only when content outside `.asd/sprints/**` and `.asd/project/**` actually changed since the `Suite run` recorded in `test-plan.md`, and reads review verdicts from `state.json` with a review-file parse as explicit fallback.
- `design-system.html` regenerates **once per sprint** at `design-promote`, and only when `DESIGN.md` was actually touched, instead of on every token change. The `checkpoints.md` design-gate file triple is unchanged — the same three files are still required.
- The PRD compression applies to the **sprint draft only** (User stories + Acceptance criteria, optional one-line Problem); Goals and Non-goals remain required for the persistent requirements document. The Documentation reviewer's rubric distinguishes the two so a correctly-reduced draft is not failed.
- C4 sprint drafts are **delta patches** against the persistent registry (full-schema authoring only when no registry exists yet), and C4 build output is no longer committed.
- The shared HTML shell emits the mermaid CDN script only for documents containing a diagram and the auto-TOC only above a section-count threshold. Artifacts remain self-contained single files — no shared stylesheet was introduced.
- The AC→code trace now has exactly one owner (the Implementation reviewer). Manual-steps handling, the tech-reference precondition, and stub handling were deduplicated to their rule-doc SSoT with pointers from the consuming agents.
- Template compressions to `audit.md`, `plan.md`, `test-plan.md`, `prd.html`, `ux-spec.html`, and `accessibility.html` reshape those artifacts for every consumer on `/asd-update`. There is no per-project opt-out dial: content already authored is untouched, but newly generated artifacts follow the reduced structure.

### Removed
- **BREAKING:** the `t_api.html` template is deleted outright. API contracts fold through the same open-set rule as ADRs — into a subsystem doc, `stack.html`, a project-generated OpenAPI/SDL/proto artifact, or, only when nothing owns them, a new document via ordinary Complication Approval with no pre-made template. Migration: existing `api.html` files are consumer-owned and are not deleted or rewritten by `/asd-update`; fold their content into the owning doc when you next touch that surface.
- Dead `state.json` fields `subsystems_touched` and `new_subsystems` (declared and written, read by nothing). Archived sprints keep them; the resume path assumes neither their presence nor their absence.
- `test-plan.md`'s "Change surface" section (recomputable via `git diff --stat`, and the workflow computes it anyway); "Added tests" reduced to the Regression-proof column.
- The Manual-verification section from `t_review.md` — `test-plan.md` is now its single home.
- `ux-spec.html`'s "New components" section (duplicated by `design-md-delta.yaml`, which is what `design-promote` actually applies); "Component usage" is now optional and off by default.
- `accessibility.html`'s per-domain scope paragraphs; the i18n section is now opt-in.
- The terminal decisions-log append in `pr` merge mode — it wrote into an already-archived folder, and `state.json` plus the merged PR already record the fact.
- The decisions-log dispatch from `asd-concept`, `asd-stack`, `asd-design-system` (the authored document is the record) and from `asd-init` (config changes get no durable trail).

### Deprecated
- Project-wide `.asd/project/decisions-log.md`. Frozen with one closing entry, never deleted; new decisions go to `<sprint>/decisions-log.md`.

## v2.0.0

### Changed
- **BREAKING:** the project-wide persistent documentation root moves from `design/` to `docs/` across every canonical ASD source and generated provider view. Migrate an existing consumer as follows:
  1. Move the old root:
     - No existing `docs/` directory: `git mv design docs`.
     - Already have a `docs/` directory (e.g. your own project docs): do NOT run `git mv design docs` (it would nest `design/` inside your existing `docs/`, producing `docs/design/...` and silently splitting the corpus) — instead move the three subtrees individually: `git mv design/product design/architecture design/ux docs/` (only correct if `docs/product`, `docs/architecture`, `docs/ux` don't already exist in your `docs/`; if any of them do, resolve the collision manually file by file before continuing).
  2. Fix the `designmd-lint` / `designmd-export` aliases in your own `.asd/project/commands.yaml` (these are consumer-owned and are never touched by `/asd-update`).
  3. Run `/asd-update`.
  4. Run `/asd-sync` immediately after.

  Between `/asd-update` and `/asd-sync` there is a split-brain window where `.asd/rules` already say `docs/` but your generated `.claude/`, `.codex/`, and `.agents/skills/` views still say `design/` — do not skip or delay the `/asd-sync` step. Nothing auto-migrates and nothing errors: a skipped step produces a silently split documentation corpus (e.g. `DESIGN.md` linted at the old path while agents author/review the new one), not a crash.

## v1.2.0

### Added
- SemVer + `CHANGELOG.md` discipline for self-hosting sprints: `pr` phase bumps `asd_version` and adds a changelog section before PR open, tags and publishes a GitHub Release on merge (`git-strategy.md` "Versioning & Changelog").
- Mandatory `git fetch` + fast-forward check against `origin/<base_branch>` before creating a sprint branch, and an explicit rule against committing or pushing directly to `git.base_branch`.
- PR title now required to follow Conventional Commits (becomes the squash-merge commit subject); PR body template gained Verification, Version, and Related issues sections.

### Changed
- Branch protection enabled on `main` (no force-push, no deletion, required `sync-check` status); squash-merge is now the only allowed merge strategy with auto-delete of merged branches.

## v1.1.0

Baseline — pre-dates this changelog; see git history and `.asd/project/decisions-log.md` for prior changes (self-hosting bootstrap, multi-provider support, impl-test phase).
