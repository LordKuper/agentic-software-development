---
name: gh-base-repo-resolution
description: bare `gh repo view` / `gh issue` without -R follow gh's base-repo resolution (set-default, upstream > github > origin ranking), never `origin`; an empty repo argument falls back the same way; `gh label create -f` without --color recolors
metadata:
  type: reference
---

Without an argument or `-R`, gh resolves the base repo from `gh repo set-default`, else by ranking remotes by name (`upstream` above `github` above `origin`); from v2.21 it errors with several remotes until a default is set. Sources: https://cli.github.com/manual/gh_repo_set-default, https://github.com/cli/cli/pull/9083.

An empty argument is no argument: `gh repo view ""` takes the same base-repo path (`pkg/cmd/repo/view/view.go`, `if opts.RepoArg == ""`). So `gh repo view "$(git remote get-url origin)"` with no `origin` silently resolves another remote instead of failing.

`gh label create <name> -f` with no `--color` picks a random color and, on an existing label, PATCHes that color (`pkg/cmd/label/create.go`): not idempotent, it recolors the label every run.

**How to apply:** when a rule or AC says "the repo of `origin`", a bare `gh repo view` does not implement it, and neither does an inline `$(git remote get-url origin)` unless the git failure is checked first. A label "ensure" with `-f` needs `--color` or an existence check.
