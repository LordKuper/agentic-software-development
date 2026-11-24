---
# ASD generated. Edit .asd/skills/asd-update/SKILL.md. source_digest=sha256:0ea87279e88c92a93670701c331642b1a34aa997b17636a8660460e2caa4a7c4 content_digest=sha256:7458bf32a34c2307cce1e790fd99eb275db8e6f0b59e87bfe2300f2754b6c9f9 asd_version=14.11.0 schema=1
name: asd-update
description: "Updates framework-managed files in a consumer project, runs release migrations, and offers values for missing settings. Use when the user runs /asd-update or asks to update, upgrade, or pull the latest ASD framework or workflow version."
---

Operation mapping: see `.asd/rules/providers.md`.

# asd-update

## Purpose

Install the latest ASD framework files and run pending release migrations in a consumer project.

## Preconditions

```json
{"requires": ["self_hosting not enabled (Rules)", "tar on PATH (ships with Win10 1803+/macOS/Linux)", "Node >= 16.7"], "else": "self_hosting enabled: one-line message, stop; else ABORT — precondition not met: <artefact>"}
```

## Modes

```json
{"interactive": "user runs /asd-update", "sprint-mediated": "Sprint-mediated mode"}
```

## Steps

1. Confirm with user (it overwrites framework files): show what will update, offer dry run. Skipped in sprint-mediated mode (below).
2. Run command `node "$(git rev-parse --show-toplevel)/.asd/skills/asd-update/update.js"` (self-locating: works from any repo directory).
   - Preview first: append `--dry-run` (reports the full classification — add/update/delete/conflict — mutates nothing).
3. Updater flow: fetch tarball from `repo`@`branch` → compute the full classification for every `managed_paths` entry (fail-closed on an unfamiliar `schema_version`, unsafe path, or case-collision) → show every conflict and planned action → only THEN write (add/update/delete) → run pending migrations → rewrite `.asd/release-manifest.json` (`asd_version` + `upstream_hashes`).
   - Fetch or validation failure aborts before writes. Skip unresolved conflicts and apply the remaining managed changes. A real retry with no managed file changes still runs pending migrations and records the version reached.
   - A conflict the user explicitly confirms overwriting is re-run with `--force <relPath...>` (one or more of the reported conflict paths) — this is the only way a `conflict`/`conflict-foreign` file is ever written; never force without asking first.
4. Migrations (`.asd/migrations/<version>.js`): run AFTER the managed-path replacement above, in ascending version order, for every migration strictly newer than the consumer's current `release-manifest.json.asd_version` up to this release's target version. Each already-applied version is skipped (never re-run past its own target). The runner stops at the first failing migration and reports which one failed and what it had already done; the recorded `asd_version` afterward is the last migration that succeeded (never an unrecorded intermediate) — or the release's full target version if every pending migration succeeded, including when none were pending.
   - Script contract (also in each script's own header comment): filename (minus `.js`) is the exact target version it migrates a consumer TO, e.g. `.asd/migrations/3.2.0.js`; `module.exports = (ctx) => void | Promise<void>` with `ctx.repoRoot` = the consumer's project root; zero-dependency Node (may `require` `.asd/sync.js` from `ctx.repoRoot` for helpers); idempotent — re-running an already-applied migration is a no-op, never an error.
5. Complete once after the final real attempt in either mode. Proceed if a real attempt printed `Applied <N> change(s).` (including partial updates with a failed migration or declined conflict) or exited successfully with `Already up to date.` Preview, version lookup and failures before either result do not qualify.
   - Delegate to `asd-sync` to refresh provider views. Report its result and continue with the config check.
   - At the repo root run `node .asd/runtime.js config-check` against the installed template. Exit 0 needs no prompt. Exit 1: report `missing`, `duplicates`, and `invalid` by dotted path without dumping config. If keys are missing, request user decision: `Run asd-init for missing settings` | `Leave settings`. On opt-in invoke the installed `asd-init` skill's "Update completion" mode with the missing paths. Direct the user to standalone `/asd-init` for invalid or duplicate entries or if the targeted mode is unavailable. On exit 2 or command failure, relay the diagnostic. A declined offer or config diagnostic leaves the framework update result intact.
6. Report version `old -> new` (or the version actually reached, if a migration failed) + counts from script output.
7. Remind user: `.claude/settings.json` and `.codex/hooks.json` hold user permissions/hook registration; the user's own entries there are theirs, only `asd-sync` merges its owned entries.

### Sprint-mediated mode

Run by `.asd/workflows/asd-phase-scope.md` step 1 when the user chose to update at `asd-sprint`'s new-sprint version check.

- The update choice confirms step 1. Run steps 2–7, including the separate user decisions on conflicts and missing settings.
- Leave all changes uncommitted, including approved `asd-init` and `asd-sync` writes. Report partial updates to scope, which owns the commit and continuation.
- Self-hosting rule (Rules) unchanged: `asd-sprint` never runs the check when `self_hosting: enabled`.

## Rules

- must: read `self_hosting` from `.asd/project/config.yaml` first; missing, unreadable, or a duplicated key → treat as `disabled` (fail closed). If `enabled`: print a one-line message ("asd-update is for consumer projects; this repo develops ASD directly — use a self-hosting sprint instead") and stop. No mutation, no fetch.
- must: limit direct writes to `managed_paths` and the release manifest. Protect `.asd/project/**`, `.asd/sprints/**`, `docs/**`, custom skills/agents/hooks, provider settings, memory, `AGENTS.md` and `CLAUDE.md`. Migrations follow `core.md` "Invariants" for config and may rewrite shipped command values or remove a retired agent's memory directory. Provider reconciliation and approved settings additions belong to the delegated skills.
- never: write a diverged (**conflict**) file without explicit confirmation.

## Delegates

```json
{"agents": [], "skills": ["asd-sync", "asd-init"]}
```

## Outputs

```json
["framework-managed paths in managed_paths (add/update/delete)", ".asd/release-manifest.json (asd_version, upstream_hashes)", "authorized migration changes (Rules)", "asd-sync's provider reconciliation", "approved additions to .asd/project/config.yaml by asd-init"]
```

## Reference

**Managed set** = SSoT in `.asd/release-manifest.json`'s `managed_paths` (canonical `.asd/` trees, `.asd/migrations`, and `sync.js` itself, walked recursively file-by-file) — replacing the old wholesale tree-delete approach with a per-file state machine (`add | update | delete | conflict | conflict-foreign | keep-local-modified | noop`, driven by `classifyUpdateItem` in `.asd/sync.js`). A file whose local hash still matches the last-fetched release is safe to update or delete; a file that diverged is a **conflict**.

**Version check**: `node "$(git rev-parse --show-toplevel)/.asd/skills/asd-update/update.js" --check-version` is read-only. It fetches only the remote `.asd/release-manifest.json` (raw GitHub URL from the local manifest's `repo`/`branch`), reads only its `asd_version` (must match `^\d+(\.\d+)*$`; every other field is untrusted and ignored), prints one JSON line on stdout (e.g. `{"local":"13.7.0","remote":"13.8.0","newer":true}`) and exits 0. Any network, parse or repo error, a body over 1 MiB, or the 5 s total timeout, prints one warning line on stderr and `remote: null, newer: false`.

## Return

```
SKILL: asd-update | MODE: <interactive|sprint-mediated> | VERSION: <old> -> <new> | STATUS: <complete|aborted> | NEXT: none
```

## References
- `.asd/release-manifest.json` (`managed_paths`)
- `.asd/rules/providers.md` (canonical path -> per-provider path)
