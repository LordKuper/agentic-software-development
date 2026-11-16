---
name: gh-base-repo-resolution
description: bare `gh repo view` / `gh issue` without -R follow gh's base-repo resolution (set-default, upstream > github > origin ranking, or an error with several remotes), never `origin` by definition
metadata:
  type: reference
---

Without an argument or `-R`, gh resolves the base repo from `gh repo set-default`, else by ranking remotes by name (`upstream` above `github` above `origin`); from v2.21 it errors with several remotes until a default is set. Sources: https://cli.github.com/manual/gh_repo_set-default, https://github.com/cli/cli/pull/9083.

**How to apply:** when a rule or AC says "the repo of `origin`", a bare `gh repo view` does not implement it. Pass the URL: `git remote get-url origin`, then `gh repo view <url>`.
