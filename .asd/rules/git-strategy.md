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

## Commit before review

`impl` (and its review-fix/test-fix modes) and `impl-test` each commit all work before the sprint advances to `impl-review` — the clean-worktree precondition there (`sprint-lifecycle.md` "Impl-review clean-worktree precondition") blocks entry on any uncommitted change, since the reviewed diff is computed from commits. `impl-test`'s own commit obligation is stated once, in `sprint-lifecycle.md` "Impl-test commits its own output".

`impl-review` itself also commits: when it dispatches `asd-tester` to fix a test in place, that fix must land as a commit before the phase's `Suite run` records its `HEAD` and before `pr` open-mode's `git diff --quiet` skip check runs — an uncommitted in-place fix is invisible to both.

The main orchestrator commits its own bookkeeping — `state.json`, `decisions-log.md`, review files, `friction-log.md` — at phase exit, same precedent as `impl-test` above. Ownership is symmetric for a dispatched agent: it stages only the paths it authored (never `git add -A`/`-u` or `commit -a` — concurrently dispatched tasks share one worktree, so a broad stage sweeps a sibling's in-progress edit into the wrong commit), commits every path it authored before signalling completion (an authored file no one commits reaches neither the reviewed diff nor `HEAD`), and never commits orchestrator-owned files it did not author, even to leave a clean tree for the next gate.

## PR self-review checklist

The main orchestrator confirms before opening PR:

- Studied existing code in touched areas
- Can explain every changed line
- PR scoped to requested feature; no unrelated improvements
- Commit messages describe why, not what
- Full test suite green, once, at the end of `impl-review` (per `test-plan.md` `Suite run`; `sprint-lifecycle.md` "Impacted test set")
- Documentation reviewer verdict = APPROVE

## PR creation

Triggered only after DoD met and the active `checkpoints.md` policy permits publication. In strict this needs user confirmation; adaptive publication needs recorded authority/evidence and any host permission.

- PR title MUST follow Conventional Commits (`<type>(<scope>): <subject>`) — becomes the squash-merge commit subject
- `gh_enabled: true` + `auto_pr: true` → `gh pr create` with body from `t_pr-description.md`
- `gh_enabled: false` → push branch, print PR-ready summary (title, body, compare URL)
- `auto_pr: false` → push, prepare summary, wait for user to open PR manually

## Finalize after closure

After confirmed merge and explicit hard closure approval, the main orchestrator creates `chore/finalize-sprint-<NNN-slug>` from `git.base_branch`. Its companion PR contains the terminal state and archive move, then merges through the normal configured Git path. No direct base push. If the companion PR cannot merge, leave it open and keep the sprint closure pending.

## Pre-existing uncommitted changes

If working tree is dirty at `/asd-sprint` start, the main orchestrator stops and asks user to commit or stash before sprint creation. No silent stashing.

## Versioning & Changelog (self-hosting only)

Applies only when `self_hosting: enabled` (`sprint-lifecycle.md` "Self-hosting") — a consumer project's own app version is unrelated to ASD's `asd_version`.

`pr` phase, open mode, before composing the PR: bump `asd_version` in `.asd/release-manifest.json` per [SemVer](https://semver.org/), inferred from the sprint's Conventional Commit types (highest wins): `fix`→PATCH, `feat`→MINOR, `!`/`BREAKING CHANGE` footer→MAJOR. Add a matching `## v<version>` section to root `CHANGELOG.md` (newest first, English), grouped `Added|Changed|Deprecated|Removed|Fixed|Security`, describing consumer-facing impact — not implementation detail. Under `backward_compat: migration`, this bump is also the blocking DoD check that `max(.asd/migrations/*.js filename version) <= asd_version` — a migration a consumer never reaches because the version bump does not cover it fails the bump, not just the migration.

After the companion closure PR merges: create annotated tag `v<asd_version>` on that merge commit; `gh release create v<asd_version> --title v<asd_version> --notes-file <extracted CHANGELOG section>`.
