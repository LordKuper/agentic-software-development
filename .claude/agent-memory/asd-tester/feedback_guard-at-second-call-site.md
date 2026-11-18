---
name: guard-at-second-call-site
description: a filter applied at both a status check and a render site needs a test that reaches the render site; how to make sync-state stale rather than foreign, and quote a spaced --require path
metadata:
  type: feedback
---

When one guard is applied at two sites (sync's status check and its apply-time render), a test that only reads status never runs the second site: the apply writes nothing when the status is `current`. Reach the render by making the owned hooks stale on purpose: alter the `_asd` entries in the file AND set the sync-state `content_digest` to `digestTag(stableStringify(alteredOwned))`, so the status is `stale`, not `modified-foreign`. Prove it with a mutation in a `git archive` copy of HEAD, and show the old status-only test stays green under that mutation.

**Why:** reverting the render-side filter turned no test red until a stale-hooks case existed.

**How to apply:** a pre-fix tree proves nothing when the guard already existed before the fix; use a restoring mutation in a scratch archive. Pass a `--require` preload through `NODE_OPTIONS` quoted (`--require "<path>"`) and keep the stub under a directory with a space, so an unquoted path fails at load.

Related: [[feedback_failfirst-pre-fix-tree]], [[feedback_edit-tool-for-regex-and-mutation-script]].
