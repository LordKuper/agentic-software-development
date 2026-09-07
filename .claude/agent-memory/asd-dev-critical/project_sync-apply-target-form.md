---
name: sync-apply-target-form
description: node .asd/sync.js --apply takes GENERATED view paths (.claude/…, .codex/…, .agents/skills/…), not the canonical .asd/ source path, despite AGENTS.md wording
metadata:
  type: project
---

`node .asd/sync.js --apply <targets>` matches its arguments against the generated targets produced by `buildSyncPlan()` — i.e. `.claude/skills/<n>/SKILL.md`, `.agents/skills/<n>/SKILL.md`, `.claude/hooks/*.js`, `.codex/hooks/*.js`, `.codex/agents/*.toml`. Passing the canonical `.asd/...` source path returns `status: "not-found"` and applies nothing (silently `ok: true` unless you inspect `results`).

**Why:** AGENTS.md, `custom-coding-rules.md` and sprint plans all phrase it as `--apply <canonical file>`, which reads as the `.asd/` path and costs a wasted round-trip. Reliable recipe: run `node .asd/sync.js --check`, read the entries whose `status` is `stale`/`missing`, pass exactly those `target` values to `--apply`.

**How to apply:** any time a canonical `.asd/agents/`, `.asd/skills/`, or `.asd/hooks/` file is edited in this repo. `--apply` also refreshes `.asd/release-manifest.json`'s hash ledger, so that file belongs in the same commit. Verify with `--check`: `ok: true`, zero non-`current` items, empty `orphans`.
