---
# ASD generated. Edit .asd/skills/asd-sync/SKILL.md. source_digest=sha256:165a055eced48c9f264110d4e19504a1f2e9fcdb0d94cc22dccd9114bba33343 content_digest=sha256:a3de55df68d672fe6aca5883fd185556ee3e65f7eb1b5f97de77cd484148b602 asd_version=14.3.0 schema=1
name: asd-sync
description: "Reconciles this project's generated provider views (.claude/, .codex/, .agents/skills/) with the canonical ASD sources (.asd/agents, .asd/skills, .asd/hooks) via .asd/sync.js's check/apply flow: unedited files regenerate with no question, only a hand-edited (modified-foreign or orphan-modified) one is asked about (overwrite or delete, keep, or diff). Use when the user runs /asd-sync, asks to sync, regenerate, or reconcile the Claude/Codex agent and skill files after editing canonical ASD sources, or when asd-update delegates after a real run."
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
1. Run command `node "$SYNC" --check`. Parse its JSON report (`items[]`: `target`, `status` — `current | missing | stale | modified-foreign | foreign | orphan | orphan-modified | orphan-unmarked`).
2. If every item is `current`, report that and stop — nothing to do.
3. Queue `missing`, `stale` and `orphan` (ownership-marked, unedited; `sync.js` deletes it) for apply, no question. For each `modified-foreign` item (hand-edited outside ASD's ownership markers) and each `orphan-modified` item (marked orphan whose body was hand-edited), request user decision: **overwrite** (`orphan-modified`: **delete**) regenerates it from canon (deletes it), queued with `--force`, flagging the risk — it discards the hand edit; **keep as-is** skips it this run; **show diff** reads the target and its canon source (`orphan-modified`: just the target, no source exists), presents the difference, then re-asks overwrite/delete or keep. `orphan-unmarked` and `foreign` (symlink) are not ASD's: leave alone, report.
4. Apply in two groups, skipping an empty one:
   - Unedited (`missing`/`stale`/`orphan`): `node "$SYNC" --apply <file...>` (no `--force`).
   - Confirmed `modified-foreign` and `orphan-modified`: `node "$SYNC" --apply <file...> --force` — without `--force` the CLI silently refuses and the file stays untouched.
5. Report per-file outcome (applied / kept / still stale / left alone) from the apply result(s) plus a final `node "$SYNC" --check` summary.

## Rules

- never: overwrite a `modified-foreign` file or delete an `orphan-modified` one without a per-file decision.

## Delegates

```json
{"agents": [], "skills": []}
```

## Outputs

```json
["regenerated or deleted generated views: .claude/, .codex/, .agents/skills/", "managed blocks of AGENTS.md and CLAUDE.md", "owned entries in .claude/settings.json, .codex/hooks.json"]
```

## Return

```
SKILL: asd-sync | STATUS: <complete|aborted> | NEXT: none
```

## References
- `.asd/rules/providers.md` (canonical path -> per-provider path, ownership markers)
