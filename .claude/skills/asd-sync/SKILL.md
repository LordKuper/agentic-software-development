---
# ASD generated. Edit .asd/skills/asd-sync/SKILL.md. source_digest=sha256:4b323bf154eb63a22ba2b3c332268ceb7e7219db7fcb96578defc17acd0623d5 content_digest=sha256:1cf786ec62207c3d716ddf9b4e478414a6ea8aafd3d0d698ad8523a86675135e asd_version=14.3.0 schema=1
name: asd-sync
description: "Reconciles this project's generated provider views (.claude/, .codex/, .agents/skills/) with the canonical ASD sources (.asd/agents, .asd/skills, .asd/hooks) via .asd/sync.js's check/apply flow: unedited files regenerate with no question, only a hand-edited (modified-foreign) one is asked about (overwrite, keep, or diff). Use when the user runs /asd-sync, asks to sync, regenerate, or reconcile the Claude/Codex agent and skill files after editing canonical ASD sources, or when asd-update delegates after a real run."
---

Operation mapping: see `.asd/rules/providers.md`.

# asd-sync

## Purpose

Reconcile generated provider views with canonical `.asd/` sources.

## Preconditions

```json
{"requires": [".asd/sync.js in this git repo"]}
```

## Steps

0. **Resolve the script path once**, self-locating so it works from any repo directory: `SYNC="$(git rev-parse --show-toplevel)/.asd/sync.js"`. Every command below is `node "$SYNC" ...`.
1. Run command `node "$SYNC" --check`. Parse its JSON report (`items[]`: `target`, `status` — `current | missing | stale | modified-foreign | foreign | orphan | orphan-unmarked`).
2. If every item is `current`, report that and stop — nothing to do.
3. Queue `missing`, `stale` and `orphan` (ownership-marked; `sync.js` deletes it) for apply, no question. For each `modified-foreign` item (hand-edited outside ASD's ownership markers), request user decision: **overwrite** regenerates it from canon (queued), flagging the risk — it discards the hand edit; **keep as-is** skips it this run; **show diff** reads the target and the canon source, presents the difference, then re-asks overwrite/keep. `orphan-unmarked` and `foreign` (symlink) are not ASD's: leave alone, report.
4. Apply in two groups, skipping an empty one:
   - Unedited (`missing`/`stale`/`orphan`): `node "$SYNC" --apply <file...>` (no `--force`).
   - Confirmed `modified-foreign`: `node "$SYNC" --apply <file...> --force` — without `--force` the CLI silently refuses and the file stays untouched.
5. Report per-file outcome (applied / kept / still stale / left alone) from the apply result(s) plus a final `node "$SYNC" --check` summary.

## Rules

- never: overwrite a `modified-foreign` file without a per-file decision.

## Delegates

```json
{"agents": [], "skills": []}
```

## Outputs

```json
["regenerated or deleted generated views: .claude/, .codex/, .agents/skills/"]
```

## Return

```
SKILL: asd-sync | STATUS: <complete|aborted> | NEXT: none
```

## References
- `.asd/rules/providers.md` (canonical path -> per-provider path, ownership markers)
