---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), docs/ docs (decisions), audit.md (audit)
---

# Sprint 001-rename-design-to-docs

## Goal
Rename the ASD framework's project-wide persistent documentation root from `design/` to `docs/` throughout the framework source in this self-hosting repository. This is a pure rename of the root path segment: the subtree beneath it (`product/`, `architecture/`, `ux/` and everything under them) keeps its current structure, file names, and contents. Because this repo's own persistent documentation folder does not currently exist on disk (prd/ux_spec/adr/c4 are disabled in the lean self-hosting profile), the change is entirely a reference update across framework source plus a regeneration of the provider views.

## Acceptance
- AC-1: Every canonical ASD source that names the project-wide persistent documentation root as `design/` names it `docs/` instead — covering `.asd/rules/*`, `.asd/templates/*` (including `t_config.yaml`, `t_plan.md`, `t_audit.md`, `t_test-plan.md`, `t_commands.yaml`, `t_ux-spec.html`, `t_design-md-delta.yaml`, the `t_custom-*-rules.md` set, `external-review/t_prompt-external-*.md`, and `t_AGENTS.md` where applicable), `.asd/agents/*`, `.asd/skills/*`, `.asd/workflows/*`, `.asd/release-manifest.json`, `.asd/project/*.md` rule files and `config.yaml` comments, `README.md`, and root `AGENTS.md`. A `design/` occurrence is in scope only where it denotes the persistent root; per-site classification uses the corroboration test (does the phase or workflow that writes/consumes the file name the persistent root at that moment?). **Approved exception** (impl-review iter-01 escalation, see `decisions-log.md`): `t_sprint.md:5`'s `delegates_to:` reference keeps `design/ docs (decisions)` — `sprint.md` is authored at `scope`, before design-promote, and its sibling `delegates_to` items (`plan.md`, `audit.md`) are all sprint-local, so the reference denotes the sprint-local draft folder (AC-3), not the root. Note `t_test-plan.md` is *not* an exception: it is authored at `impl-test`, after design-promote, so its line 5 reads `persistent docs (requirements)`.
- AC-2: The subtree under the renamed root is unchanged: `docs/product/…`, `docs/architecture/…`, `docs/ux/…` keep the same relative paths and file names as their `design/…` predecessors; only the leading segment differs.
- AC-3: The sprint-local draft folder `<sprint>/design/` and the `design` / `design-review` / `design-promote` phase names, together with the `asd-phase-design*` skills, workflows, and their agent dispatch, remain literally unchanged.
- AC-4: The `DESIGN.md` file name, the `design-system.html` file name, the rule documents `design-principles.md` / `design-system.md`, and `.asd/project/custom-design-rules.md` remain unchanged; only their containing root segment moves (for example `design/ux/DESIGN.md` becomes `docs/ux/DESIGN.md`).
- AC-5: Generated provider views (`.claude/`, `.codex/`, `.agents/skills/`) are regenerated from canon via `node .asd/sync.js --apply` after canon edits, and `node .asd/sync.js --check` reports no drift.
- AC-6: `node tests/run.js` passes.
- AC-7: A repository-wide search for the patterns `design/` **and** `design\\` finds no remaining reference to the project-wide persistent documentation root, using an exclusion pattern covering `<sprint>/design/`, `reviews/design/`, `asd-phase-design*`, the `design/design-review` phase pair, `design-system*`, `design-principles*`, `t_design-md-delta.yaml`, `.asd/sprints/**`, `.asd/project/decisions-log.md`, `CHANGELOG.md`, and the AC-1 approved exception `.asd/templates/t_sprint.md:5` (its `delegates_to:` sprint-sibling reference). The `t_sprint.md` hit is the sole expected in-scope-looking match and must be verified as that exact line rather than treated as a failure. Prose phrases denoting the renamed root (for example "persistent design docs", "persistent design-artifact counterpart") are reworded line by line where they mean the root; prose denoting the `design` phase keeps its wording.
- AC-8: `README.md` mirrors (folder map, phase and artifact paths, any config-schema excerpt naming the folder) are updated in the same change, per the AGENTS.md hard rule that every workflow change is checked against `README.md`.
- AC-9: A `CHANGELOG.md` entry documents the breaking rename and states the consumer migration steps (`git mv design docs`, update `commands.yaml` `designmd-*` aliases, then `/asd-update` followed by `/asd-sync`).

## Out of scope
- The sprint draft folder `.asd/sprints/<NNN-slug>/design/` (holding `prd.html`, `ux-spec.html`, `adr.html`, `c4-full/`, `design-md-delta.yaml`) — its name is tied to the `design` phase, not to the project-wide documentation root, and stays `design/`.
- The `design`, `design-review`, and `design-promote` phase names and the `asd-phase-design*` skills, workflows, and agent dispatch.
- The `DESIGN.md` file and the `design-system.html` file name (Google Labs design-system spec — an unrelated concept despite the name), and the `design-principles.md` / `design-system.md` / `custom-design-rules.md` file names.
- Any convention for a `tests/` folder or a "test data" location — deferred by the user; left to individual consumer projects.
- Restructuring, splitting, merging, or renaming anything inside the documentation subtree.
- Rewriting historical `decisions-log.md` / `CHANGELOG.md` entries that mention the old path.
