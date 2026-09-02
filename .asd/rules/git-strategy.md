# Git Strategy

## Branch

Created in `scope` from `git.base_branch` per `git.branch_pattern`. Default pattern `sprint/{n}-{slug}`. `{n}` zero-padded to 3 digits. `{slug}` kebab-case, max 30 chars, derived from scope.

Before creating: `git fetch origin`, fast-forward local `git.base_branch` to `origin/<base_branch>` (diverged → halt, ask user to resolve), working tree clean (see "Pre-existing uncommitted changes"). Never commit or push directly to `git.base_branch` — every change lands via PR.

## Commits

- Conventional Commits: `<type>(<scope>): <subject>`
- Subject ≤ 50 chars, imperative mood, English
- Body describes WHY, not WHAT
- One commit per task when possible; phase-grouped acceptable for small tasks
- Before push: squash local WIP/fixup commits into task-level commits (`git reset --soft` + recommit, or non-interactive rebase). Applies to unpushed commits only — published history stays untouched (see Forbidden)

## Forbidden

- Never force-push
- Never rebase published commits
- Never use `--no-verify` or skip hooks
- Never commit `.env`, credentials, or `.gitignore`-matching files
- Never commit or push directly to `git.base_branch`

## TODO stubs

In-code TODO created during a sprint must be marked `// TODO(sprint-NNN): <reason>` and registered in **project-global** `.asd/project/stubs.md` (open stubs only) with: sprint of origin (NNN-slug), file path and line, reason (prefix `(accepted-debt)` for known debt that should not block PR), owner agent.

On resolution: row **deleted** from stubs.md (no status column; deletion = resolution). On migration: deleted, new row created under the receiving sprint.

`pr` phase blocks if any stub has `Sprint = <current-NNN-slug>` and Reason does NOT start with `(accepted-debt)`. Devs must resolve, migrate, or mark accepted-debt before PR.

## PR self-review checklist

PM confirms before opening PR:

- Studied existing code in touched areas
- Can explain every changed line
- PR scoped to requested feature; no unrelated improvements
- Commit messages describe why, not what
- Full test suite green at `impl-test` (per `test-plan.md` `Suite run`)
- Documentation reviewer verdict = APPROVE

## PR creation

Triggered only after DoD met AND user confirmation.

- PR title MUST follow Conventional Commits (`<type>(<scope>): <subject>`) — becomes the squash-merge commit subject
- `gh_enabled: true` + `auto_pr: true` → `gh pr create` with body from `t_pr-description.md`
- `gh_enabled: false` → push branch, print PR-ready summary (title, body, compare URL)
- `auto_pr: false` → push, prepare summary, wait for user to open PR manually

## Finalize PR (autonomous)

The `pr` phase merge-mode terminal-state write (`sprint-lifecycle.md` "PR phase") still lands on `git.base_branch` only via a PR — the branch rule above has no exceptions. What's different for this one PR class: PM opens **and merges it itself**, no user confirmation gate. Scope is fixed and mechanical — a `chore(sprint-<NNN-slug>): finalize terminal state — PR #<N> merged` branch off `git.base_branch` touching only the archived sprint's own `state.json` (`phase`/`pr.state`/`updated_at`), created after the sprint's own PR is already confirmed merged. `gh_enabled: true` → `gh pr create` then `gh pr merge --squash` immediately; merge failure (branch protection this agent can't satisfy) → halt, leave the PR open for manual merge, do not retry indefinitely. `gh_enabled: false` → no autonomous path exists (no `gh` to merge with); falls back to the standard push + manual PR flow, same as any other PR under this config. Every other PR — the sprint's own — is unaffected: always requires user confirmation per "PR creation" above.

## Pre-existing uncommitted changes

If working tree is dirty at `/asd-sprint` start, PM stops and asks user to commit or stash before sprint creation. No silent stashing.

## Versioning & Changelog (self-hosting only)

Applies only when `self_hosting: enabled` (`sprint-lifecycle.md` "Self-hosting") — a consumer project's own app version is unrelated to ASD's `asd_version`.

`pr` phase, open mode, before composing the PR: bump `asd_version` in `.asd/release-manifest.json` per [SemVer](https://semver.org/), inferred from the sprint's Conventional Commit types (highest wins): `fix`→PATCH, `feat`→MINOR, `!`/`BREAKING CHANGE` footer→MAJOR. Add a matching `## v<version>` section to root `CHANGELOG.md` (newest first, English), grouped `Added|Changed|Deprecated|Removed|Fixed|Security`, describing consumer-facing impact — not implementation detail.

`pr` phase, merge mode, after confirming merge: create annotated tag `v<asd_version>` on the merge commit; `gh release create v<asd_version> --title v<asd_version> --notes-file <extracted CHANGELOG section>`.
