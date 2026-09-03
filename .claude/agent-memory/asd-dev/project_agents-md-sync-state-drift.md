---
name: agents-md-sync-state-drift
description: AGENTS.md is self-sourced under self_hosting — sync.js --apply cannot re-baseline its sync-state.json digest, so every hand-edit reds tests/run.js until manually fixed
metadata:
  type: project
---

Every hand-edit to this repo's root `AGENTS.md` (self-sourced managed block under `self_hosting: enabled`, see `.asd/sync.js`'s `isSelfSourcedAgentsMd`/`statusSelfSourcedManagedBlock`) leaves `.asd/sync-state.json`'s tracked `AGENTS.md` digest stale. `node .asd/sync.js --apply AGENTS.md` does NOT fix this — for a `selfSourced` managed-block item, `runApply` takes the early-return branch (`applied: false`, note: "self-sourced: author content directly, sync only verifies it was not hand-edited out of band") and never touches `sync-state.json`. Result: `node .asd/sync.js --check` reports `AGENTS.md` as `modified-foreign` and the `tests/run.js` build-gate test (`` `node .asd/sync.js --check` reports every item current…" ``) fails red, even though the content is correct and intentional.

**Why:** confirmed while fixing D-1 in sprint `004-review-scoping-and-test-audit` (test-fix mode) — a prior fix-group edited `AGENTS.md`'s prose but never re-baselined the digest, and there was no documented or scripted way to do so; had to hand-write a throwaway node script requiring `sync.js`'s internal `readNormalized`/`findManagedBlock`/`digestTag` exports to compute the new digest and hand-patch `sync-state.json`'s `entries["AGENTS.md"].content_digest`.

**How to apply:** if `D-1`-shaped ("AGENTS.md modified-foreign") recurs, the fix is: compute `sync.digestTag(sync.findManagedBlock(sync.readNormalized(<repoRoot>/AGENTS.md)).inner)` and write it into `.asd/sync-state.json`'s `entries["AGENTS.md"].content_digest`, leaving `AGENTS.md` itself byte-unchanged (verify via `git diff -- AGENTS.md` empty). This is a genuine tooling/design gap, not just a missing workflow step — flagged to impl-review as a candidate finding for [[asd-sync-self-sourced-gap]] (adding a proper re-baseline path to `sync.js --apply` for self-sourced managed-block targets), not fixed as part of the test-fix dispatch (out of scope — test-fix mode only fixes the filed defect, doesn't redesign `sync.js`).
