---
name: fixtures-inside-repo-walkups
description: When test fixtures or staging dirs move from OS temp into the repo (.asd/tmp), check every upward root search, not just git's; GIT_CEILING_DIRECTORIES guards git only
metadata:
  type: feedback
---

A fixture or staging directory moved under the repo (e.g. `.asd/tmp/`) changes what any upward root search finds from it. Git is guarded by `GIT_CEILING_DIRECTORIES`. Plain-fs walk-ups are not: `sync.js` `findRepoRoot`, the session-start hook `findUp`, and `update.js` through `findRepoRoot` all look for a `.asd` directory, and from inside the repo they climb to the live repo root.

**Why:** from OS temp those searches used to fall back to the fixture. Inside the repo they silently resolve live canon. A green suite only proves that no current fixture lacks its own `.asd/`.

**How to apply:** for such a change, grep the JS sources for walk-up loops (`path.dirname` in a `for (;;)`, and `existsSync(path.join(dir, '.asd'))`). Check whether the fixture root stops them, for example with a marker `.asd/` at the fixture root. Also compare doc comments and `none` test-plan rows that claim "never resolves the live repo" against what the guard actually covers. Related: [[none-row-coverage-claims]].
