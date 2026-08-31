---
# ASD generated. Edit .asd/skills/asd-update/SKILL.md. source_digest=sha256:87b4d5668226db4d171afcc448650765e6e13ea4b5cae530c7f0140ef797ebcd content_digest=sha256:6bc277e09b9ae494ca1455fe7b31ea934bc80b103b85980ab7d5f4592fd07400 asd_version=1.1.0 schema=1
name: asd-update
description: "Updates the ASD framework infrastructure (.asd/rules, .asd/templates, ASD agents/skills/hooks) in a consumer project to the latest version by fetching them from the configured ASD repo's main branch, replacing only framework-managed paths and never touching consumer-owned config, sprints, design docs, or custom skills/agents/hooks. Use when the user runs /asd-update or asks to update, upgrade, or pull the latest ASD framework / workflow version."
---

Operation mapping: see `.asd/rules/providers.md`.

# asd-update

Pull latest ASD framework files into this consumer project. Overwrites **framework-managed** paths only; leaves consumer-owned files intact.

## What it touches

Managed set = SSoT in `.asd/release-manifest.json`'s `managed_paths` (canonical `.asd/` trees + `sync.js` itself, walked recursively file-by-file) — replacing the old wholesale tree-delete approach with a per-file state machine (`add | update | delete | conflict | conflict-foreign | keep-local-modified | noop`, driven by `classifyUpdateItem` in `.asd/sync.js`). A file whose local hash still matches the last-fetched release is safe to update or delete; a file that diverged is a **conflict** and is never touched without explicit confirmation.

Never touched: `.asd/project/**`, `.asd/sprints/**`, `design/**`, `AGENTS.md`, `CLAUDE.md`, `.claude/settings.json`, `.codex/hooks.json`, any non-ASD skill/agent/hook, anything outside `managed_paths`.

## Run

1. Confirm with user (it overwrites framework files): show what will update, offer dry run.
2. Run command `node "$(git rev-parse --show-toplevel)/.asd/skills/asd-update/update.js"` — self-locating, so this works from any directory in the repo (a bare relative path only resolves from the repo root).
   - Preview first: append `--dry-run` (reports the full classification — add/update/delete/conflict — mutates nothing).
3. Updater flow: fetch tarball from `repo`@`branch` → compute the full classification for every `managed_paths` entry (fail-closed on an unfamiliar `schema_version`, unsafe path, or case-collision) → show every conflict and planned action → only THEN write (add/update/delete) → rewrite `upstream_hashes` in `.asd/release-manifest.json`.
   - Fetch/validation failure, or any conflict left unresolved = that file is skipped, everything else proceeds.
   - A conflict the user explicitly confirms overwriting is re-run with `--force <relPath...>` (one or more of the reported conflict paths) — this is the only way a `conflict`/`conflict-foreign` file is ever written; never force without asking first.
4. Automatically runs `node .asd/sync.js --check` afterward — canon changed upstream means the provider-views (`.claude/`, `.codex/`, `.agents/`) are now stale; report this, do not auto-apply.
5. Report version `old -> new` + counts from script output.

## After

- Remind user: `.claude/settings.json` and `.codex/hooks.json` are **not** auto-updated by this step (they hold user permissions/hook registration; `.asd/sync.js --apply` handles their own owned entries separately). If update changed hook files or added skills, run sync next.
- Requires `tar` on PATH (ships with Win10 1803+/macOS/Linux) and Node >= 16.7.
