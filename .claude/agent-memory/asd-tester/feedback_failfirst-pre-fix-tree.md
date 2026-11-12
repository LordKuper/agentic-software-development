---
name: failfirst-pre-fix-tree
description: Fail-first proof for a runtime/migration fix without mutating production - run the new tests/run.js in a git-archive of the pre-fix commit
metadata:
  type: feedback
---

When the fix is already committed and production edits are out of scope, prove fail-first by extracting the pre-fix commit (`git archive <sha> | tar -x -f -` run from inside the target dir) outside the repo, copying the new `tests/run.js` over its copy, and running `node tests/run.js --filter "<name>"` there; record the non-zero exit and the failing test name, then delete the extraction.

**Why:** a mutation of production is forbidden to this role, and the old-tree run proves the same thing with nothing to restore.

**How to apply:** `tar -x -C C:/...` fails ("Cannot connect to C") - `cd` into the target instead. The system temp volume can be full; extract on the project drive, beside the repo, never inside it.
