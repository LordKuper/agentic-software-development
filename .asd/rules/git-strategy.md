# Git Strategy

## Branch

Created in `scope` phase from `git.base_branch` per `git.branch_pattern`. Default pattern: `sprint/{n}-{slug}`. `{n}` zero-padded to 3 digits. `{slug}` kebab-case, max 30 chars, derived from scope.

## Commits

- Conventional Commits format: `<type>(<scope>): <subject>`
- Subject ≤ 50 chars, imperative mood, English
- Commit message body describes WHY, not WHAT
- One commit per task when possible; phase-grouped acceptable for small tasks

## Forbidden

- Never force-push
- Never rebase published commits
- Never use `--no-verify` or skip hooks
- Never commit `.env`, credentials, or files matching `.gitignore`

## TODO stubs

In-code TODO created during a sprint must be marked:

```
// TODO(sprint-NNN): <reason>
```

and registered in **project-global** `.asd/project/stubs.md` (contains only currently open stubs) with:

- sprint of origin (NNN-slug)
- file path and line
- reason (prefix with `(accepted-debt)` for known debt that should not block PR)
- owner agent

On resolution: entry is **deleted** from stubs.md (no status column; deletion = resolution). On migration: deleted, new entry created under the receiving sprint.

`pr` phase blocks if any stub in stubs.md has `Sprint = <current-NNN-slug>` and Reason does NOT start with `(accepted-debt)`. Devs must either resolve (delete row), migrate (move to new sprint via decisions-log entry), or mark accepted-debt before PR.

## PR self-review checklist

PM must confirm before opening PR:

- Studied existing code in touched areas
- Can explain every changed line
- PR scoped to requested feature; no unrelated improvements
- Commit messages describe why, not what
- All tests pass locally
- Documentation reviewer verdict = APPROVE

## PR creation

Triggered only after DoD met AND user confirmation.

- `git.gh_enabled: true` and `git.auto_pr: true`: `gh pr create` with body from `t_pr-description.md`
- `git.gh_enabled: false`: push branch, print PR-ready summary (title, body, link to compare URL)
- `git.auto_pr: false`: push, prepare summary, wait for user to open PR manually

## Pre-existing uncommitted changes

If the working tree is dirty at `/asd-sprint` start, PM stops and asks the user to commit or stash before sprint creation. No silent stashing.
