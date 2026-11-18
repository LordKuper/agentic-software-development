---
name: impacted-scope-claims
description: A Suite run Scope line naming areas that "read none" of the changed files: check the shared test helper's imports and whether the runner itself changed (safety valve)
metadata:
  type: feedback
---

When a test plan's impacted run excludes areas because they "read none" of the changed files, check (1) whether every area loads a shared helper that imports the changed module (then every area is impacted by import, rule 2 of the impacted-set definition), (2) whether the excluded area spawns the changed script directly, and (3) whether the runner or a shared helper itself changed — shared infrastructure, so the safety valve requires the full suite.

**Why:** an exclusion read off which areas mention a file name misses import-level and spawn-level reach; the terminal full suite backstops it, but the recorded gate is then non-conforming.

**How to apply:** grep the excluded area's test file and the shared helper for the changed module's path or its spawn constant before accepting the Scope line. Related: [[reuse-scope-labels]].
