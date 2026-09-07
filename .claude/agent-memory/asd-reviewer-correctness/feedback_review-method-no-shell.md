---
name: review-method-no-shell
description: How correctness review dispatches work in this repo - no shell, manifest-enumerated incremental scope, clean context per iteration
metadata:
  type: feedback
---

Review dispatches in this repo give no shell/Bash. Resolve the diff scope by reading the current content of the paths listed in the dispatch manifest's `files[]` with Read/Grep/Glob; never plan around running `git diff`.

**Why:** reviewers are read-only on both providers (`.asd/rules/providers.md`, AGENTS.md "Agents") — no `Write`/`Edit`/`Bash` in `tools`, `sandbox_mode: "read-only"`. The phase orchestrator computes the diff and hands over the path list plus a `correctness.manifest.json`.

**How to apply:**
- Ledger `files` rows must match the manifest exactly; the orchestrator validates with `node .asd/runtime.js validate-ledger`, so a shape mismatch means a re-dispatch.
- Never open `reviews/<phase>/iter-*/` from an earlier iteration — clean context per iteration is a hard rule, and the severity floor already encodes what earlier iterations settled.
- Cross-file consistency is the dominant defect class here (canon vs generated views vs README/CHANGELOG vs `release-manifest.json`); a deletion in one canonical file usually leaves a dangling reference elsewhere, so grep the repo for removed identifiers even when the referencing file is outside the diff — the change-surface rule permits this when the change is what made the other file wrong.
