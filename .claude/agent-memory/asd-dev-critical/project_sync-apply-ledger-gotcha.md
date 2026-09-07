---
name: sync-apply-ledger-gotcha
description: node .asd/sync.js --apply recomputes release-manifest.json hash ledgers repo-wide, which bites when splitting commits or working in parallel with other agents
metadata:
  type: project
---

Every `node .asd/sync.js --apply <target>` rewrites `.asd/release-manifest.json`'s `canon_hashes`/`upstream_hashes` for the **whole repo**, not just the requested target.

**Why:** the ledgers are pure functions of on-disk canon content, so the apply step recomputes them unconditionally. `tests/run.js` asserts every `upstream_hashes` entry matches the actual file, so a commit whose canon content and ledger disagree fails the suite.

**How to apply:**
- Splitting one canonical file's changes across two commits: re-run `--apply` between them so each commit carries a ledger matching its own content. Otherwise the intermediate commit is red.
- Working in parallel with sibling agents: your `--apply` sweeps up their uncommitted canon edits into the ledger. Check `git diff .asd/release-manifest.json` before staging and prefer to run it after siblings have committed.
