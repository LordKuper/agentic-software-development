---
name: sync-apply-target-form
description: node .asd/sync.js --apply takes GENERATED view paths (.claude/…, .codex/…, .agents/skills/…), never the canonical .asd/ source path, and refuses to run with no targets at all
metadata:
  type: project
---

`node .asd/sync.js --apply <generated-view-path...>` matches its arguments against the generated targets produced by `buildSyncPlan()` — `.claude/agents/<name>.md`, `.codex/agents/<name>.toml`, `.claude/skills/<name>/SKILL.md`, `.agents/skills/<name>/SKILL.md`, `.claude/hooks/*.js`, `.codex/hooks/*.js`, plus the full-file/merge targets `AGENTS.md`, `CLAUDE.md`, `.claude/settings.json`, `.codex/hooks.json`. A canonical `.asd/...` path matches nothing → `status: "not-found"`, `ok: false`, exit 1, whole batch aborted (since sprint 004). An **empty** target list is also rejected — `ok: false`, exit 1, no ledger write (added sprint 008 for finding C-1: bare `--apply` used to write zero views yet still refresh the hash ledgers, hiding stale views behind a green `--check`).

**Why:** docs used to phrase it as `--apply <file>`, which reads as the `.asd/` path, then briefly as a bare `--apply`, which silently did nothing. All eight doc sites now carry one grep-able wording, `--apply <generated-view-path...>`; since sprint 008 iter-02 the explanatory parenthetical naming the four view path shapes lives only in `AGENTS.md` (SSoT, guarded by a test) and the other seven cite `providers.md` "Canonical path -> per-provider path" instead.

**How to apply:** after any canonical `.asd/agents/`, `.asd/skills/`, `.asd/hooks/` edit. Reliable recipe: run `node .asd/sync.js --check`, take every entry whose `status` is `stale`/`missing`, pass exactly those `target` values (an in-sync item reports `current`, not `in-sync`).

Non-render canon (`.asd/sync.js`, `.asd/runtime.js`, `.asd/migrations/**`) has no generated view, so a `--check` after editing it lists nothing stale — yet `upstream_hashes` is now wrong and `tests/run.js` fails on it. Refresh by passing any already-`current` view path (e.g. `.claude/agents/asd-dev.md`): `runApply` returns `applied: false` and writes no view, while the whole-repo ledger recompute still runs and moves exactly the one changed hash. The empty-list rejection is what forces this indirection. `.asd/release-manifest.json` changes in the same run, so commit it together. Verify with `--check`: `ok: true`, zero non-`current` items, empty `orphans`. Ledger side effects: [[sync-apply-ledger-gotcha]].
