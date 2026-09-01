---
name: project-self-hosting-repo
description: This repo IS the ASD framework source (self-hosting) — canon/generated-view split, sync.js usage quirks
metadata:
  type: project
---

This working directory (`D:\Projects\agentic-software-development`) is the ASD framework's own source repo, not a project built with ASD. `.asd/project/config.yaml` has `self_hosting: enabled`, so `/asd-sprint` runs ASD's own phases against ASD's own canon.

- Canon lives in `.asd/rules/`, `.asd/templates/`, `.asd/agents/`, `.asd/skills/`, `.asd/workflows/`. Generated per-provider views live in `.claude/`, `.codex/`, `.agents/skills/` — never hand-edit these, always edit canon then sync.
- `node .asd/sync.js --apply <target...>` requires **generated target paths** (e.g. `.claude/agents/foo.md`, `.codex/agents/foo.toml`), NOT the canonical source path — passing the canon path silently no-ops (`"status": "unknown", "applied": false`). Find the right targets from `node .asd/sync.js --check`'s per-item `target` field first.
- After per-file `--apply`, still run a bare `node .asd/sync.js --apply` (no args) to recompute `.asd/release-manifest.json`'s hash ledger — per-file apply alone doesn't update it.
- `AGENTS.md` is intentionally exempt from sync (`status: "modified-foreign"` is expected/correct there, not drift) — it's self-sourced/hand-edited even under self-hosting, per AGENTS.md's own documented rule.

**Why:** repo README/AGENTS.md hard rule: every canon edit must be followed by sync + a README.md consistency check; getting sync target paths wrong silently produces stale generated views that look fine until `--check` is re-run.
**How to apply:** whenever editing anything under `.asd/rules|templates|agents|skills|workflows`, after edits run `--check` to find real stale targets, `--apply <those targets>`, then a bare `--apply` for the ledger, before committing.

See also [[feedback-docs-wording-sibling-vs-root]].
