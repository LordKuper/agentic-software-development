# Changelog

All notable consumer-facing changes to ASD. Format: [Keep a Changelog](https://keepachangelog.com/). Versions follow [SemVer](https://semver.org/). Newest first.

## Unreleased

### Changed
- **BREAKING:** the project-wide persistent documentation root moves from `design/` to `docs/` across every canonical ASD source and generated provider view. Migrate an existing consumer in this order: move the old root — if you have no existing `docs/` directory, `git mv design docs`; if you already have a `docs/` directory (e.g. your own project docs), do NOT run `git mv design docs` (it would nest `design/` inside your existing `docs/`, producing `docs/design/...` and silently splitting the corpus) — instead move the three subtrees individually, `git mv design/product design/architecture design/ux docs/` (only correct if `docs/product`, `docs/architecture`, `docs/ux` don't already exist in your `docs/`; if any of them do, resolve the collision manually file by file before continuing) — then fix the `designmd-lint` / `designmd-export` aliases in your own `.asd/project/commands.yaml` (these are consumer-owned and are never touched by `/asd-update`) → run `/asd-update` → run `/asd-sync` immediately after. Between `/asd-update` and `/asd-sync` there is a split-brain window where `.asd/rules` already say `docs/` but your generated `.claude/`, `.codex/`, and `.agents/skills/` views still say `design/` — do not skip or delay the `/asd-sync` step. Nothing auto-migrates and nothing errors: a skipped step produces a silently split documentation corpus (e.g. `DESIGN.md` linted at the old path while agents author/review the new one), not a crash.

## v1.2.0

### Added
- SemVer + `CHANGELOG.md` discipline for self-hosting sprints: `pr` phase bumps `asd_version` and adds a changelog section before PR open, tags and publishes a GitHub Release on merge (`git-strategy.md` "Versioning & Changelog").
- Mandatory `git fetch` + fast-forward check against `origin/<base_branch>` before creating a sprint branch, and an explicit rule against committing or pushing directly to `git.base_branch`.
- PR title now required to follow Conventional Commits (becomes the squash-merge commit subject); PR body template gained Verification, Version, and Related issues sections.

### Changed
- Branch protection enabled on `main` (no force-push, no deletion, required `sync-check` status); squash-merge is now the only allowed merge strategy with auto-delete of merged branches.

## v1.1.0

Baseline — pre-dates this changelog; see git history and `.asd/project/decisions-log.md` for prior changes (self-hosting bootstrap, multi-provider support, impl-test phase).
