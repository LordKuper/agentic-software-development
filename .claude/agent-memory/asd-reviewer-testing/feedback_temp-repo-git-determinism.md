---
name: temp-repo-git-determinism
description: tests/run.js temp-git-repo tests pin their own git calls with -c flags, but git spawned inside runtime.js inherits host global/system config (diff.noprefix etc.); also since sprint 015 impl-review Testing's manifest holds only isTest files + test-plan paths
metadata:
  type: feedback
---

Sprint 015 added a temp-repo `emit-manifest --base/--head` test. The test's own `git(...)` helper passes `-c user.name/... core.autocrlf=false`, but the git that `runtime.js` spawns (`rangeRenames`, `writePatch`) runs with no `-c` and no env isolation, so it reads the developer's global config. The test parses `diff --git a/X b/Y` headers, so `diff.noprefix=true` on a host breaks it with no code change.

**Why:** the -c flags on the fixture helper make the test look hermetic; the subprocess under test is where host config leaks in.

**How to apply:** for any test that runs a runtime subcommand calling git, check whether the child env sets `GIT_CONFIG_NOSYSTEM`/`GIT_CONFIG_GLOBAL` or production pins prefixes.

Scope note: since sprint 015 `reviewerFiles` narrows impl-review Testing to `isTest` scope files plus `--test-plan` paths. Source files are context only; judge their coverage by reading them, but findings attach only to the manifest's files. See [[no-shell-review-method]].
