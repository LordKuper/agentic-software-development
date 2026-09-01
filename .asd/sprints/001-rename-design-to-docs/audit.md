---
responsibility:
  owns: brownfield findings for sprint scope (existing docs, code, gaps, risks)
  excludes: requirements, decisions, plan, code
  delegates_to: prd.html (requirements), adr.html (decisions), plan.md (tasks)
---

# Audit

## Scope reference
[sprint.md](./sprint.md)

## Touched areas

Repo-wide scan for the root path segment `design/` used as the **project-wide persistent documentation root**. Raw hit set: 426 occurrences of the string `design/` across 101 files. After classification (in-scope root refs vs. out-of-scope `<sprint>/design/`, `reviews/design/`, `design/design-review` phase pairs, `asd-phase-design*` paths, `design-system`/`design-principles`/`design-md-delta` file names), the in-scope surface is **~88 files**: 47 canonical/root files + 40 generated provider-view files + `release-manifest.json` (ledger only).

Neither `design/` nor `docs/` exists on disk in this repo (confirmed by glob; `.gitignore` ignores only `plans/`, no conflict with a future `docs/`). The whole change is textual reference update + provider regeneration.

### 1. `.asd/rules/` — 8 files (SSoT layer, highest blast radius)

| File | In-scope lines / what changes | Out-of-scope in same file (do NOT touch) |
|---|---|---|
| `artifact-layout.md` | 45 (`├── design/` in the decomposition-enabled tree), 67, 70 (flat-layout code block), 84 (`design/architecture/c4/`), 141 (`design/architecture/tech-reference/…`) | 31 (`<sprint>/design/`), 41 (`reviews/design/iter-NN/`), 58/59/77/109 (`DESIGN.md`, `design-system.html` names) |
| `core.md` | 20 ("Persistent doc — living document under `design/`"), 22 (`design/architecture/c4/`) | 22 mentions `design-promote` phase |
| `sprint-lifecycle.md` | 49 (audit inputs `design/`), 52 (design-promote output "persistent docs in `design/`"), 105 (audit scan target), 122 (design-system gate paths `design/ux/DESIGN.md`), 135 (`design/product/requirements/…`), 136 (`design/architecture/adr/…`, `design/architecture/c4/`), 137 (`design/ux/<subsystem>.html`) | 42, 49–51 (`<sprint>/design/`, `reviews/design/`), 107, 114 (`<sprint>/design/`), phase-name column values |
| `checkpoints.md` | 15 ("final write to persistent `design/`") | `design-promote` phase name in same row |
| `language-policy.md` | 8 ("`design/*` docs" in the artifact list) | — |
| `design-system.md` | 7 (`design/ux/DESIGN.md` = SSoT) | file name `design-system.md` itself stays (AC-4) |
| `external-review.md` | 44 (`.asd/**` and `design/**` excluded), 47 (`design/architecture/c4/`), 51 (`':(exclude)design/**'` pathspec) | 43, 47 (`<sprint>/design/c4-full/`), 57, 77 (`reviews/design/`), `design-review` phase name |
| `review-policy.md` | 136 ("independent of persistent `design/` docs") | `design-review` row in the reviewer table |

No occurrences in `providers.md`, `design-principles.md`, `code-style.md`, `git-workflow.md`, or the remaining rule docs.

### 2. `.asd/templates/` — 9 files with path refs (+1 prose-only)

| File | In-scope lines |
|---|---|
| `t_config.yaml` | 13 (`prd: enabled  # design/prd.html + persistent requirements`), 54, 55 (`design/architecture/c4/model/*.c4`, `…/subsystems.yaml`) |
| `t_plan.md` | 5 (`delegates_to: design/ docs`), 23, 24, 25 (relative links `../../design/product/…`, `../../design/architecture/adr/…`, `../../design/ux/…`) |
| `t_audit.md` | 50, 54, 56 (Documentation-migration-plan boilerplate: "persistent docs in `design/`", column header, example cell) — **this template is the source of this very file** |
| `t_commands.yaml` | 27, 29 (commented `designmd-lint` / `designmd-export` invocations: `… design/ux/DESIGN.md`) — the `@google/design.md` package name is NOT part of the rename |
| `t_ux-spec.html` | 49 (`<a href="../../design/ux/DESIGN.md">`) — relative link written for the *promoted* location `docs/ux/<subsystem>.html`; becomes `../../docs/ux/DESIGN.md` |
| `t_test-plan.md` | 5 (`delegates_to: … design/ docs (requirements)`) |
| `t_sprint.md` | 5 (`delegates_to: … design/ docs (decisions)`) |
| `t_design-md-delta.yaml` | 1 (`# proposed changes to design/ux/DESIGN.md`) — file name `t_design-md-delta.yaml` itself stays |
| `external-review/t_prompt-external-impl.md` | 14 (`.asd/**` and `design/**` excluded) |
| `t_AGENTS.md` | **prose only** — 34 "persistent design docs …"; no `design/` path. See Gaps G-1. |

Out-of-scope templates that matched the raw grep: `t_custom-common-rules.md:5` and `t_custom-coding-rules.md:5` (`custom-design-rules.md (design/design-review)` — a *phase pair*, not a path), `external-review/t_prompt-external-design.md:14` (`<sprint>/design/`), `t_prompt-external-impl.md:15` (`design/doc content` — an "or" pair), `t_custom-design-rules.md` / `t_design-system.html` (file names, AC-4).

### 3. `.asd/agents/` — 14 of 15 canonical agents

`asd-architect.md` (38–40, 47–50, 65, 106, 107, 115 — heaviest, incl. write-access allowlist), `asd-ux-designer.md` (41–44, 52, 53, 70), `asd-frontend-dev.md` (40–45, 106), `asd-backend-dev.md` (40–42, 102), `asd-test-engineer.md` (41–43, 126), `asd-reviewer-ui.md` (43–45, 49–51), `asd-reviewer-documentation.md` (16, 44, 48, 74, 86), `asd-reviewer-quality.md` (40, 41), `asd-reviewer-performance.md` (39, 40), `asd-reviewer-testing.md` (40), `asd-reviewer-implementation.md` (37), `asd-ba.md` (39, 76), `asd-pm.md` (93, 108), `asd-external-review.md` (53 — the `':(exclude)design/**'` pathspec).

`asd-reviewer-simplification.md` has **no** in-scope occurrence (line 41 is `<sprint>/design/`, line 98 is prose "design docs").

Note: several of these lines are **write-access allowlists** (`asd-architect.md:65`, `asd-ux-designer.md:70`, `asd-ba.md:61`) — a missed rename there silently revokes an agent's permission to write the promoted doc.

### 4. `.asd/skills/` — 6 of 17 canonical skills

`asd-init/SKILL.md` (4 — the skill `description` string itself says "seeds infrastructure-only design/ docs"; 58–60, 107, 109, 117), `asd-design-system/SKILL.md` (4 description + 15, 16, 28, 94, 101, 110, 142–144), `asd-stack/SKILL.md` (4 description + 15, 27, 96, 104, 134, 135), `asd-concept/SKILL.md` (26, 82, 89, 107), `asd-update/SKILL.md` (4 description prose + 20 "Never touched: … `design/**`"), `asd-phase-design-promote/SKILL.md` (4 description "promote to persistent design/").

Skill `description` strings are the dispatch triggers — editing them changes the generated frontmatter on both providers and invalidates the manifest hash.

### 5. `.asd/workflows/` — 7 of 10

`asd-phase-design-promote.md` (11, 37, 42–45, 50–52, 67–71 — heaviest), `asd-phase-design.md` (12, 28, 32, 36, 40, 57, 59), `asd-phase-plan.md` (7, 11, 19), `asd-phase-impl.md` (12, 68), `asd-phase-impl-test.md` (11, 28), `asd-phase-impl-review.md` (12, 32), `asd-phase-audit.md` (24, 34).

`asd-phase-design-review.md` has **no** in-scope occurrence (all 12 hits are `<sprint>/design/` or `reviews/design/`). `asd-phase-scope.md`, `asd-phase-pr.md` — no hits.

### 6. `.asd/project/` and `.asd/release-manifest.json`

- `config.yaml:15` — comment `prd: disabled  # design/prd.html + persistent requirements`. (Also prose lines 8, 50 — see G-1.)
- `custom-common-rules.md:5`, `custom-coding-rules.md:5` — `design/design-review` phase pair, **out of scope** despite matching. `custom-design-rules.md` — file name stays (AC-4); its body has no path ref.
- `decisions-log.md:48–51` — historical entry describing this very rename; append-only, excluded by AC-7.
- `release-manifest.json` — **no in-scope occurrence**. Every `design`-containing string there is a *file name* of a design-phase skill/rule/template (`skills/asd-phase-design/SKILL.md`, `.asd/rules/design-system.md`, `t_design-md-delta.yaml`, …), all AC-3/AC-4 exclusions. `managed_paths` is `.asd/`-only and path-agnostic. The only change is the `canon_hashes` / `upstream_hashes` ledger, which `.asd/sync.js` recomputes automatically (`sync.js:950-955`). See Gap G-2.

### 7. Root docs

- `README.md` — 83 (never-touched table: "`design/` (your persistent docs)"), 154 (design-promote row), 172/173/174 (`/asd-concept`, `/asd-stack`, `/asd-design-system` command table target paths), 227 (config-schema excerpt), 306 + the folder-map block 306–320 (`├── design/` and its whole subtree). AC-8 mirror obligation.
- `AGENTS.md` — 32 ("artifacts into consumer's `.asd/sprints/<NNN-slug>/` and `design/`").

### 8. Generated provider views — ~40 files, regenerate only

Never hand-edit (`AGENTS.md` hard rule). Regenerated by `node .asd/sync.js --apply` from the canon edits above:
- `.claude/agents/*.md` — 14 mirrors of the in-scope canonical agents
- `.codex/agents/*.toml` — the same 14
- `.claude/skills/<name>/SKILL.md` — 6
- `.agents/skills/<name>/SKILL.md` — 6 (Codex reads skills from `.agents/skills/`, not `.codex/`)

`.asd/workflows/` has no generated counterpart (read directly by both providers), so workflow edits are canon-only.

### 9. Confirmed NOT touched

`.asd/sync.js`, `.asd/skills/asd-update/update.js`, `.asd/hooks/session-start.js`, `tests/run.js`, `.claude/settings.json`, `.codex/hooks.json`, `CHANGELOG.md`, `.gitignore` — zero occurrences of `design` in any of them. The sync/update engines are path-agnostic, so the rename cannot break them by construction.

## Existing docs found

This sprint is a framework-internal path rename, not a migration of external product documentation. The relevant "existing docs" are the framework's own canonical descriptions of the layout being renamed:

- [`.asd/rules/artifact-layout.md`](../../rules/artifact-layout.md): **SSoT for the layout being renamed.** Declares the tree twice — "Paths (decomposition enabled)" with `├── design/ ├── product/ … ├── architecture/ … └── ux/`, and "Paths (decomposition disabled)": "`design/` becomes flat". Also fixes `design/architecture/c4/` as the subsystem registry home and `design/architecture/tech-reference/<tech>-<version>.md` as mandatory per-tech reference. Any rename must start here; every other file's phrasing is downstream of this one.
- [`.asd/rules/core.md`](../../rules/core.md): glossary definition — "**Persistent doc** — living document under `design/`. Updated across sprints." This is the one-line definition of the concept being renamed; it is the canonical wording other docs echo.
- [`README.md`](../../../README.md): the user-facing **mirror** of the layout (folder map lines 306–320, command table 172–174, config excerpt 227, never-touched table 83). Per `AGENTS.md` hard rule it must be updated in the same change (AC-8). It is a mirror, not a second SSoT — content must stay derived from `artifact-layout.md`.
- [`.asd/rules/sprint-lifecycle.md`](../../rules/sprint-lifecycle.md): defines the phase I/O contract that names the root — audit "persistent docs in `design/`", design-promote "persistent docs in `design/`", plus the concrete promotion targets per creator agent (`design/product/requirements/<subsystem>.html`, `design/architecture/adr/<subsystem>/…`, `design/ux/<subsystem>.html`).
- [`.asd/rules/external-review.md`](../../rules/external-review.md): the only place where the root appears as **executable data** rather than prose — the git pathspec `-- . ':(exclude).asd/**' ':(exclude)design/**'` (line 51, restated line 44 and mirrored in `asd-external-review.md:53` and `t_prompt-external-impl.md:14`). Highest-risk single string in the sprint: a stale `design/**` exclusion silently changes what an external reviewer sees.
- [`.asd/templates/t_audit.md`](../../templates/t_audit.md): its "Documentation migration plan" boilerplate hardcodes the root three times ("should become persistent docs in `design/`", the `Proposed target in design/` column header, the `{{design/.../*.html}}` example). Every future `audit.md` inherits this text — this document instance already had to work around it (see G-4).
- [`.asd/project/decisions-log.md`](../decisions-log.md) entry `2026-09-01`: records the approved rationale for this sprint (`docs/` is conventional; `design/` collides with the `design` phase and its sprint-local draft folder). Append-only, out of scope for rewriting (AC-7), but it is the authoritative statement of *why* the rename is reference-only here.
- [`.asd/templates/t_AGENTS.md`](../../templates/t_AGENTS.md) + [`.asd/project/config.yaml`](../config.yaml): consumer-facing prose describing "persistent design docs" without a path. Relevant because AC-1 names `t_AGENTS.md` "where applicable" yet no path-level occurrence exists there — see G-1.

No documentation outside the ASD layout was found (no `docs/`, no wiki export, no Confluence/Notion dump, no RST/PDF, no README outside root). `plans/` is gitignored and not part of the framework.

## Existing implementation found

N/A in the usual sense — this repo ships no application code. What exists is:

- `.asd/sync.js` (canon → provider-view generator, `--check` / `--apply`) and `.asd/skills/asd-update/update.js` — both **path-agnostic**: zero `design` occurrences. They operate on `managed_paths` (`.asd/` trees only) and recompute `canon_hashes`/`upstream_hashes` from actual file bytes (`sync.js:950-955`). Renaming the docs root requires no code change in either; it only changes the ledger values they produce.
- `tests/run.js` — covers the sync/update engines only; no rules/templates/agents content assertions, no `design` string. Expected to stay green with no edit (AC-6).
- `.asd/hooks/session-start.js` — `PHASE_CHAIN` holds phase names (`design`, `design-review`, `design-promote`), which are explicitly out of scope (AC-3). No docs-root reference.

So the "implementation" of the current `design/` root is entirely the prose/config text enumerated under Touched areas. There is no code, schema, or on-disk artifact to migrate.

## Gaps

Things AC-1..AC-8 imply that a naive find/replace of `design/` → `docs/` would get wrong. Each needs an explicit decision or a hand-written edit.

- **G-1 (needs user decision): prose occurrences of "design docs" / "persistent design docs" / "design-artifact" are not covered by any AC.** AC-1 targets the spelling `design/`; AC-7's second sentence, read literally, additionally requires that *every* remaining occurrence of the word `design` be an AC-3/AC-4 exclusion or a historical log entry. These prose lines satisfy neither: `README.md:14` ("Persistent design docs (concept, stack, ADRs, UX) update on every sprint"), `README.md:176`, `README.md:306` (folder-map comment "persistent design docs"), `.asd/project/config.yaml:8,50` and `t_config.yaml:8,48` ("persistent design-artifact counterpart", "persistent design docs are organized per subsystem"), `t_AGENTS.md:34`, `asd-update/SKILL.md:4` description, `asd-phase-design-promote/SKILL.md:4` description, plus ~8 "Never modify … design docs" don't-lines across reviewer agents. Ambiguous: some of these mean "docs produced by the design phase" (legitimately still `design`), others mean "docs living under the root being renamed". **Options: (a) rewrite only where it denotes the root, leave phase-scoped uses; (b) rewrite all to "persistent docs"; (c) leave all prose untouched and narrow AC-7 to the `design/` path spelling.** Recommend (a), but the split must be adjudicated line by line, not by regex.
- **G-2: AC-1 names `.asd/release-manifest.json`, but the scan finds no in-scope occurrence there.** All `design`-bearing strings in it are AC-3/AC-4-excluded file names. The only real change is the auto-recomputed hash ledger. AC-1 is therefore vacuously satisfied for that file — needs confirming so nobody "fixes" the manifest by hand and corrupts the ledger.
- **G-3: AC-1 names `.asd/project/*.md` rule files, but `custom-common-rules.md:5` / `custom-coding-rules.md:5` (and their templates `t_custom-common-rules.md:5` / `t_custom-coding-rules.md:5`) match only via the phase pair `custom-design-rules.md (design/design-review)`.** That slash is an "or" separator between two phase names, not a path. These four lines must be left alone; AC-1's enumeration is misleading here.
- **G-4: `t_audit.md`'s migration-plan boilerplate is self-referential.** Renaming it changes the text every future `audit.md` inherits, but existing sprint artifacts generated from the old template (including this file) then contain the old spelling. This document already avoided that by phrasing its own migration-plan section without the literal root. Decide whether AC-7's repo-wide search excludes `.asd/sprints/**` artifacts; if not, this file needs re-checking after the rename lands.
- **G-5: relative-link depth in `t_plan.md:23-25` and `t_ux-spec.html:49` must be preserved, not just the segment.** These are `../../design/...` links written relative to a *promoted* doc location. The rename changes the segment only; a replace that also normalises the `../../` prefix would break the links. `t_plan.md`'s links are relative from `<sprint>/plan.md` and are already depth-questionable — verify, don't blindly propagate.
- **G-6: no sequencing constraint is stated for canon-vs-generated edits.** AC-5 requires `sync.js --check` clean at the end, but a partial canon edit followed by `--apply` produces a *consistent but half-renamed* tree that passes `--check`. `--check` cannot detect a missed rename — only a repo-wide grep (AC-7) can. The plan needs an explicit "all canon edits, then one `--apply`, then grep" order.
- **G-7: AC-7's own phrasing ("no remaining reference to the … root spelled `design/`") has no mechanical test.** A bare `rg "design/"` returns ~180 legitimate out-of-scope hits (`<sprint>/design/`, `reviews/design/`, `asd-phase-design*`, `design/design-review`, `t_design-md-delta`, `design-system`). The verification step needs a stated exclusion pattern, or AC-7 is unverifiable in practice.
- **G-8: `t_AGENTS.md` is not regenerated into this repo's root `AGENTS.md`** (self-hosting keeps root `AGENTS.md` self-sourced). Both need editing independently; a change to one does not propagate.

## Risks

- **R-1: mis-renaming an out-of-scope occurrence.** ~180 of the 426 raw `design/` hits are exclusions. Highest-confusion classes: `<sprint>/design/` (adjacent to in-scope root refs in the *same line* — e.g. `sprint-lifecycle.md:49`, `asd-phase-design-promote.md:45`, `asd-architect.md:65`, `asd-reviewer-documentation.md:44+48`), and `reviews/design/iter-NN/`. impact=high (breaks the design phase / review file paths, silently), mitigation=no global regex replace; edit line by line; after editing, re-grep each touched file and diff the classification against the Touched-areas tables above.
- **R-2: missing a generated-view file, so `.claude/`/`.codex/`/`.agents/skills/` drift from canon.** impact=medium, mitigation=never hand-edit generated views; run one `node .asd/sync.js --apply` after *all* canon edits, then `--check` (AC-5).
- **R-3: `sync.js --check` passes while the rename is incomplete.** `--check` verifies canon↔view consistency, not rename completeness — see G-6. impact=high (false green), mitigation=treat AC-7's repo-wide grep with an agreed exclusion pattern (G-7) as the real completeness gate, run *after* `--apply`.
- **R-4: stale `':(exclude)design/**'` git pathspec.** Appears three times (`external-review.md:44,51`, `asd-external-review.md:53`, `t_prompt-external-impl.md:14`) and is executable data, not prose. A missed one changes the external-review payload without any error. impact=high, mitigation=treat those three as a single atomic edit set; grep `exclude)design` to confirm zero remain.
- **R-5: agent write-access allowlists silently narrowed.** `asd-architect.md:65`, `asd-ux-designer.md:70`, `asd-ba.md:61` enumerate writable paths. A missed rename there revokes an agent's permission to write the promoted doc — surfaces only at design-promote, sprints later. impact=high, mitigation=explicit checklist entry per allowlist line.
- **R-6: skill `description` strings are dispatch triggers.** Four in-scope skills carry the root inside their JSON `description` (`asd-init`, `asd-design-system`, `asd-stack`, `asd-phase-design-promote`, plus `asd-update`). Editing them changes generated frontmatter on both providers and invalidates `canon_hashes`. impact=medium, mitigation=verify JSON still parses after each edit; rely on `sync.js --apply` for the ledger.
- **R-7: README mirror drift.** AC-8 + the `AGENTS.md` hard rule require README updated in the same change; the folder map (306–320) and command table (172–174) are easy to half-update. impact=medium, mitigation=README is the last file edited and is diffed against `artifact-layout.md` line for line.
- **R-8: consumer-facing breakage is out of this repo's reach.** Renaming the root changes where `/asd-init`, `/asd-concept`, `/asd-stack`, `/asd-design-system` write in *consumer* projects; an existing consumer that runs `/asd-update` gets rules pointing at `docs/` while their docs sit in `design/`. `update.js` never touches consumer content (`asd-update/SKILL.md:20` explicitly excludes it), so nothing auto-migrates. `backward_compat: migration` in this repo's config requires a documented migration path. impact=high for downstream, mitigation=**escalate to PM** — sprint.md's "Out of scope" list does not mention a consumer migration note, and no AC covers it. Either add a CHANGELOG/migration note as scope expansion, or record the decision to defer.
- **R-9: `t_audit.md` self-reference.** See G-4. impact=low, mitigation=re-run the AC-7 grep after the template edit and decide on `.asd/sprints/**` exclusion.

## Dependencies

- `node .asd/sync.js --apply` / `--check` — mandatory regeneration + drift gate (AC-5).
- `node tests/run.js` — must stay green (AC-6); no edit expected, since neither engine references the path.
- No external service, package, or network dependency. `@google/design.md` appears only inside commented example commands in `t_commands.yaml` / `asd-init/SKILL.md` and is a package name, unaffected by the rename.

## Migration notes

- `design/` → `docs/` (leading segment only). Subtree unchanged per AC-2: `docs/product/{concept.html, requirements/…}`, `docs/architecture/{stack.html, c4/, adr/, api/, tech-reference/}`, `docs/ux/{DESIGN.md, design-system.html, accessibility.html, <subsystem>.html}`.
- No on-disk move required in this repo: neither folder exists (glob-confirmed). Zero data migration, zero git `mv`.
- File names inside the subtree keep their `design`-bearing spellings per AC-4: `docs/ux/DESIGN.md`, `docs/ux/design-system.html`.

## Related open stubs

Open stubs from `.asd/project/stubs.md` touching files/subsystems in this sprint's scope. Surfaced for user decision in plan phase: resolve this sprint, defer, or migrate.

`.asd/project/stubs.md` read: the registry holds only the `| — | — | no open stubs | — |` placeholder row — no entries at all, therefore none whose File:Line touches a file referencing the docs root.

| Sprint of origin | File:Line | Reason | Owner |
|---|---|---|---|
| — | — | no related open stubs | — |

## Documentation migration plan

Items outside ASD format/location that should become persistent docs under the project-wide documentation root.
Items addressed by sprint design drafts are NOT listed here (they flow through design → design-promote).
Items outside sprint scope but worth promoting wait for design-promote.

**No migrations needed.** This sprint renames a path segment inside ASD's own layout scheme; it does not import external documentation. The repo-wide scan found no documentation outside the ASD layout (no `docs/`, no wiki/Confluence/Notion export, no RST/DOCX/PDF, no README outside root; `plans/` is gitignored and explicitly not part of the framework). `documents.prd` is `disabled` in `.asd/project/config.yaml`, so no reverse-engineered or migrated PRD draft was produced and none may be written to `<sprint>/design/`; there is likewise no PRD-shaped finding to record here.

| # | Source (path/URL) | Format | Proposed target | Type | Notes |
|---|---|---|---|---|---|
| — | — | — | — | — | no migrations |

<!-- Section wording deliberately avoids the literal old root spelling so this artifact does not itself become an AC-7 hit; see Gaps G-4. -->

---

# Code-side scan (architect)

Companion to the docs-side sections above. Scope: the repo's actual executable surface — `.asd/sync.js`, `.asd/skills/asd-update/update.js`, hook scripts, `tests/run.js`, `.asd/release-manifest.json`, and the JSON/YAML config targets. Numbering continues BA's series (G-9+, R-10+).

## Touched areas — code side (merge with §1–9 above)

| Artefact | `design` hits | Verdict |
|---|---|---|
| `.asd/sync.js` (65 KB) | **0** | Confirms BA. Every path is composed as `path.join(repoRoot, '.asd', …)`; the only externally-supplied path set is `managed_paths`. No allowlist, exclusion list, or ignore pattern names any documentation root. Reads `config.yaml` for exactly **one** field — `self_hosting` (`readSelfHostingField`, ~1013) — so the docs root is not a config value anywhere (see G-11). |
| `.asd/skills/asd-update/update.js` | **0** | Confirms BA. File universe = union of `expandManagedPath()` over `managed_paths` from both old and new manifests (`buildFileUniverse`, ~109). No hardcoded path literal, no exclusion list. |
| `.asd/hooks/session-start.js` (+ `.claude/hooks/`, `.codex/hooks/` mirrors) | **5 each** | **Correction to §9's "zero occurrences" claim.** Lines 27–29 `PHASE_CHAIN` (`'design'`, `'design-review'`, `'design-promote'`), lines 91/93 `reviews.design`. All phase names / `reviews/` state keys → AC-3 out of scope, so §9's *conclusion* holds — but a checklist built on "zero occurrences" would skip the file unread. Re-confirm at verification, do not edit. |
| `tests/run.js` (70 KB) | **0** | Confirms BA. Fixtures are synthetic (`.asd/rules/a.md`, `.asd/rules/new-rule.md`, …). Rename cannot break it (AC-6 safe) **and** it provides zero regression cover for the rename. |
| `.asd/release-manifest.json` | 19 ledger keys | Confirms BA + G-2. `managed_paths` = 7 entries, all `.asd/` (`rules`, `templates`, `agents`, `skills`, `workflows`, `hooks`, `sync.js`). Ledgers: 32 `canon_hashes` + 92 `upstream_hashes`. All 19 `design`-bearing keys are AC-3/AC-4 file names (`skills/asd-phase-design*/SKILL.md`, `.asd/rules/design-system.md`, `t_design-md-delta.yaml`, `agents/asd-ux-designer.md`, …). **No hand edit.** |
| `.claude/settings.json` | **4** | **Correction to §9's "zero occurrences" claim.** Lines 21–25: `Bash(designmd:*)`, `Bash(npx @google/design.md:*)`, `Bash(npm install @google/design.md)`, `Bash(npm install @google/design.md:*)`. Package/CLI names, not paths → out of scope. Note it is a `json-merge` sync target — see R-14. |
| `.codex/hooks.json`, `.asd/project/commands.yaml`, `.asd/sync-state.json` | 0 | Clean. |

### New finding: 4 in-scope occurrences the `design/` grep cannot see

The scan pattern `design/` is **separator-blind**. The Windows variants of the design.md command aliases spell the path with escaped backslashes and were therefore absent from §2/§4:

| File:Line | Literal | Status in §2/§4 |
|---|---|---|
| `.asd/templates/t_commands.yaml:21` | `… lint design\\ux\\DESIGN.md` | **missed** (only POSIX twins 27, 29 listed) |
| `.asd/templates/t_commands.yaml:23` | `… export --format json-tailwind design\\ux\\DESIGN.md` | **missed** |
| `.asd/skills/asd-init/SKILL.md:101` | `designmd-lint: "…design.md.cmd lint design\\ux\\DESIGN.md"` | **missed** (only POSIX twins 107, 109 listed) |
| `.asd/skills/asd-init/SKILL.md:103` | `designmd-export: "…design\\ux\\DESIGN.md"` | **missed** |
| `.claude/skills/asd-init/SKILL.md:100,102` · `.agents/skills/asd-init/SKILL.md:99,101` | same | generated mirrors — regenerate only |

These are **executable command text**, not prose: they become the consumer's `commands.yaml` `custom.designmd-lint` / `designmd-export` values via `/asd-init`. In-scope for AC-1 (the leading `design` segment is the documentation root); the `design.md` binary/package name in the same line is not. Verification must run `design\\` (and `design\\ux`) alongside `design/`.

## Existing implementation found — code side (merge)

Confirms and sharpens BA's "N/A in the usual sense". The mechanical facts that constrain the rename:

- **The docs root exists nowhere in code.** It is a prose literal repeated across ~47 canon files. No constant, no config key, no resolver function. Both engines are path-agnostic by construction and need no edit.
- **`sync.js` plan surface = 70 targets** (`buildSyncPlan`, ~1097–1163): `.claude/agents/*.md` + `.codex/agents/*.toml`, `.claude/skills/*/SKILL.md` + `.agents/skills/*/SKILL.md`, `.claude/hooks/*.js` + `.codex/hooks/*.js`, `CLAUDE.md`, `AGENTS.md` (self-sourced here — check-only, never applied), `.claude/settings.json`, `.codex/hooks.json`. Verified live: `--check` reports 70/70 `current`, **zero** targets under `.asd/rules|templates|workflows`.
- **`runApply` (1250) writes only explicitly listed files.** There is no "apply everything" mode. `--apply` additionally calls `recomputeAndWriteHashLedgers` (1356) whole-repo, independent of what was requested; `runCheck` (1222) is pure read and never touches the ledger.
- **`update.js` write vocabulary is `add | update | delete`, confined to `managed_paths`.** Classification is driven by `oldManifest.upstream_hashes` via `sync.classifyUpdateItem`; a diverged local file becomes `conflict` and is **skipped** unless `--force`d. `applyPlan` runs `sync.js --check` afterwards and, per its own comment, "deliberately does NOT" auto-apply.
- **No ASD script can move a folder.** `renameSync` / `fs.rename` / `mv`: zero hits across `sync.js`, `update.js`, `session-start.js`.

## Gaps (architect)

- **G-9: AC-5's stated command is a no-op.** AC-5 says "regenerated from canon via `node .asd/sync.js --apply`", and R-2/G-6's mitigation repeats "run one `node .asd/sync.js --apply`". With no file list, `runApply` iterates an empty `requestedFiles` and writes **zero targets** — it only rewrites the hash ledgers. `--check` then stays green because nothing was ever regenerated *and* nothing was flagged. The plan must enumerate the stale targets (from `--check`'s `items[]` where `status != "current"`) and pass them explicitly to `--apply <file...>`, or drive it through `/asd-sync`, which does exactly that per file. AGENTS.md's own instruction uses the `<file...>` form; AC-5 dropped it.
- **G-10: `sync.js --check` is structurally blind to most of this sprint's edits.** No sync target exists under `.asd/rules`, `.asd/templates`, or `.asd/workflows` — those trees are read directly by both providers, not generated. That is ~24 of the sprint's in-scope canon files (8 rules + 10 templates + 7 workflows) with **no sync gate at all**. AC-5 therefore certifies only the agent/skill slice (~20 canon files → 40 views). This is the mechanical root of BA's G-6/R-3, and it is stronger than stated there: `--check` isn't merely unable to detect an *incomplete* rename, it cannot observe the rules/templates/workflows edits in any state.
- **G-11: the docs root is not configurable — there is no cheap shim point.** `sync.js` parses `config.yaml` for `self_hosting` only; no `docs_root`/`design_root` key exists and nothing resolves the root at runtime. Consequences: (a) the rename is necessarily textual, there is no single switch; (b) a backward-compatible "either root works" mode would require a new config key *plus* a resolver referenced by every creator/reviewer agent — a new abstraction needing Complication Approval, and outside AC-1..AC-8. Recorded so the R-13 migration decision is not taken on the assumption that a config-level compatibility shim is cheap. It is not.
- **G-12: no ASD mechanism can migrate a consumer's folder.** Zero `fs.rename`/`renameSync` in any script; `update.js` can only `add|update|delete` inside `managed_paths` (`.asd/` trees + `sync.js`). Neither engine can create, move, or even enumerate a documentation root. Any consumer migration is necessarily a human/agent step. Not a defect — it is the invariant that keeps `/asd-update` safe — but it removes "just automate it" from the option set.
- **G-13: `asd-update/SKILL.md:20`'s "Never touched: … `design/**`" is documentation, not enforcement.** The real guarantee is that `managed_paths` contains only `.asd/` entries, so nothing outside it is ever written under any spelling. Good news: a consumer's existing folder is in no danger of deletion. Bad news: after the rename that line reads `docs/**` and documents protection for a folder an un-migrated consumer does not yet have, while saying nothing about the one they do. Decide whether the line names both roots during the migration window (ties to R-13).

## Risks (architect)

- **R-10: AC-7's grep is separator-blind — 4 known misses today.** See the backslash finding above. impact=medium: a shipped `commands.yaml` alias would lint a path that no longer exists, so `designmd-lint` fails at the consumer's design-system gate, surfacing sprints later and far from the cause. mitigation=verification runs `design/` **and** `design\\` patterns, before and after the edit; add the four lines to the edit checklist explicitly.
- **R-11: a half-renamed tree passes every automated gate simultaneously.** Compose G-9 + G-10 + R-3: `--check` cannot see rules/templates/workflows (G-10); `tests/run.js` contains no `design` fixture; a bare `--apply` regenerates nothing (G-9). A rename that touched only `.asd/agents/` would yield green `--check`, green tests, and a freshly rewritten manifest ledger — three positive signals on a broken tree. impact=high. mitigation=state in the plan that `--check` and `tests/run.js` prove *nothing* about rename completeness; the AC-7 grep (with G-7's exclusion pattern and R-10's second separator) is the only completeness gate, and it runs last.
- **R-12: stale `upstream_hashes` ship silently and then suppress the update downstream.** `recomputeAndWriteHashLedgers` runs on `--apply` only (1356), never on `--check` (1222). If the sprint's final action is a rules/templates/workflows-only edit — which makes nothing stale, so no `--apply` is prompted — `release-manifest.json` is committed with hashes describing the *pre-rename* bytes of those ~24 files. Downstream effect in a consumer: `update.js` classifies each file against `oldManifest.upstream_hashes`; a stale entry makes an untouched local file look locally modified → `keep-local-modified` / `conflict` → **the file is skipped**, and the consumer never receives the renamed rule at all. Invisible in this repo; manifests as a partial update in someone else's. impact=high. mitigation=mandatory final `node .asd/sync.js --apply` (which recomputes the ledger even with no targets — the one thing the no-arg form *does* do, cf. G-9), then assert `git diff .asd/release-manifest.json` is non-empty and covers the touched files.
- **R-13 (ESCALATION — user decision required, deliberately not resolved here): the rename is a breaking change for every existing consumer, and ASD has no migration machinery.** Sharpens BA's R-8 with the mechanical detail.
  - *What actually breaks.* After `/asd-update`, a consumer's `.asd/rules|templates|agents|skills|workflows` name `docs/`, while their persistent documentation sits on disk at `design/`. **Nothing errors.** Creator agents write *new* files under `docs/`; reviewers, the design-system gate, and every promotion target read `docs/`; the existing `design/` tree stays on disk and in git, and is never read again. The failure mode is not a crash but a **silently split documentation corpus** — worst case `design/ux/DESIGN.md`, the design-system SSoT, keeps being linted by the consumer's own `designmd-lint` alias while agents author and review `docs/ux/DESIGN.md`.
  - *Why nothing auto-migrates.* `managed_paths` is `.asd/`-only by construction; no `fs.rename` exists anywhere (G-12); there is no root indirection to flip (G-11). `update.js` cannot see the folder, by design — this is the same invariant that makes `/asd-update` safe to run at all.
  - *Second-order — consumer-owned config is also stale.* `.asd/project/commands.yaml` is never updated by `/asd-update`. Its `designmd-lint` / `designmd-export` aliases keep pointing at `design\ux\DESIGN.md` (Windows) or `design/ux/DESIGN.md` (POSIX) even after a manual folder move. That is a **second, independent** migration step, and one this repo's AC-7 grep structurally cannot catch because the file lives in the consumer.
  - *Third-order — split-brain window.* `applyPlan` runs `sync.js --check` after updating and, per its own comment, "deliberately does NOT" auto-apply; `asd-update/SKILL.md` step 4 says "report this, do not auto-apply". So between `/asd-update` and the user's next `/asd-sync`, the consumer's `.asd/rules` say `docs/` while `.claude/agents/*` and `.agents/skills/*` still say `design/`. Any agent dispatched in that window reads two contradictory roots.
  - *Fourth-order — conflict-skip leaves canon permanently half-renamed.* A consumer who hand-edited any managed file (e.g. their own `.asd/rules/artifact-layout.md`) gets `conflict` for it; `update.js` skips it. Their rules keep `design/` while their agents move to `docs/`, until they resolve it with `--force`.
  - *Migration-path options (for the user to choose — this audit does not pick one).* **(a) Documentation-only:** CHANGELOG + release note instructing consumers to `git mv design docs`, hand-fix `commands.yaml`, then `/asd-update` → `/asd-sync`. Zero code, satisfies `backward_compat: migration`'s "documented migration path", relies entirely on the consumer reading the note. **(b) One-shot migration step in `asd-update`'s skill body:** detect `design/` present + `docs/` absent → prompt → `git mv`. Would be the first time `/asd-update` touches consumer-owned content, breaking its core invariant; needs Complication Approval and a careful abort path (both roots present, partial move, dirty tree). **(c) Dual-root tolerance via a new `config.yaml` key:** highest cost, requires a resolver referenced by every agent, worst fit for a design where the root is a prose literal (G-11). **(d) Defer:** ship the rename, accept the break; defensible while the set of external consumers is empty, but must be a recorded decision, not an omission.
  - *Scope note.* `sprint.md`'s Out-of-scope list does not mention consumer migration and no AC covers it. Whichever option is chosen needs either a scope expansion (new AC) or an explicit deferral in `.asd/project/decisions-log.md`. `backward_compat: migration` makes silence the one unavailable answer.
- **R-14: `.claude/settings.json` is a `json-merge` sync target containing `designmd` strings.** A regex sweep over `.claude/**` — which must not be edited at all under the never-hand-edit rule — that also rewrote `Bash(designmd:*)` would flip the file to `modified-foreign`; `--apply` then silently refuses to repair it without `--force`, and `/asd-sync` surfaces it as a scary hand-edit conflict unrelated to the sprint. impact=low-medium. mitigation=exclude `.claude/`, `.codex/`, `.agents/` from every edit pass (regeneration-only); the owned entries in `settings.json` are package/CLI names and are never paths.

## Tech-reference check

**No new technology enters scope, so no tech-reference document is created or updated for this sprint.** Stated explicitly rather than skipped.

The sprint uses only what already ships and is already relied upon: Node.js (>= 16.7, per `asd-update/SKILL.md`) for `sync.js` / `update.js` / `session-start.js` / `tests/run.js`; `git` for the working tree; `grep`/ripgrep for the AC-7 verification. `tar` is an `update.js` fetch prerequisite but that path is not exercised by this sprint (and `/asd-update` refuses to run in this self-hosting repo anyway). `@google/design.md` appears only inside commented example command text and in `settings.json` permission strings — it is not adopted, invoked, version-bumped, or otherwise brought into scope by the rename. `likec4` is not in play (`subsystem_decomposition: disabled`). No new library, framework, runtime, or external service is introduced, and no existing one changes version or API surface.

Consequently no tech-reference gate applies to implementation for this sprint. (`docs/architecture/tech-reference/` does not exist on disk here and this sprint does not create it — that folder belongs to the *consumer* layout being renamed, not to this repo's lean self-hosting profile.)

## Related open stubs — code side

Confirms BA; nothing to merge. `.asd/project/stubs.md` re-read independently: it contains only the `| — | — | no open stubs | — |` placeholder row. No stub carries a File:Line in `.asd/sync.js`, `.asd/skills/asd-update/update.js`, `.asd/hooks/session-start.js`, `tests/run.js`, or any provider hook script. BA's "no related open stubs" covers the code side as well.

## Note on this artifact

This section adds further literal occurrences of the old root under `.asd/sprints/**`, reinforcing G-4/G-7: the AC-7 verification pattern must state its `.asd/sprints/**` exclusion explicitly, or the audit that proves the rename will itself fail the rename's own acceptance check.
