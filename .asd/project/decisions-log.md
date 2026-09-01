---
responsibility:
  owns: append-only chronology of approved decisions across project lifetime
  excludes: sprint state, code review notes, custom rules
  delegates_to: .asd/sprints/ (sprint state), reviews/ (review notes), custom-common-rules.md / custom-design-rules.md / custom-coding-rules.md (rules)
---

# Decisions Log

Append-only. Never edited or removed.

## Entry format

```markdown
## YYYY-MM-DD — <one-line summary>

- **Decision**: <what was decided>
- **Rationale**: <why>
- **Affected docs**: <links> (optional)
```

## Entries

## 2026-08-31 — ASD self-hosting bootstrap

- **Decision**: Enabled `self_hosting: enabled` and per-sprint `documents.*` toggles (audit only for this repo); bootstrapped `.asd/project/` for the framework repo itself.
- **Rationale**: Lets ASD's own future changes flow through `/asd-sprint` instead of ad-hoc edits, per `plans/self-hosting-and-optional-documents.md`. This bootstrap patch itself was applied directly (no ASD-managed source to bootstrap from before this point).
- **Affected docs**: `.asd/rules/sprint-lifecycle.md` ("Self-hosting", "Optional documents"), `.asd/templates/t_config.yaml`, `.asd/templates/t_state.json`, `.asd/sync.js`, all `.asd/workflows/asd-phase-*.md`, `.asd/rules/review-policy.md`, `.asd/rules/external-review.md`, `.asd/agents/asd-backend-dev.md`, `.asd/agents/asd-frontend-dev.md`, `.asd/skills/asd-init/SKILL.md`, `.asd/skills/asd-update/SKILL.md`, `README.md`, `AGENTS.md`.

## 2026-09-01 — Re-init: enable external review, tighten critical-review cap, auto_pr

- **Decision**: `review.external_review`: disabled → enabled; `review.iterations_critical`: 10 → 3; `git.auto_pr`: false → true.
- **Rationale**: Codex CLI confirmed on PATH (`codex-cli 0.150.1`), so Codex-wrapped external review can run alongside internal reviewers during design-review/impl-review. Critical-severity review loop capped tighter (3 instead of 10) to bound iteration cost. PR auto-opens once Definition of Done is met, no extra confirmation step.
- **Affected docs**: `.asd/project/config.yaml`.

## 2026-09-01 — Adopt forge-inspired git/PR/release practices

- **Decision**: Fetch+fast-forward verification and explicit no-direct-push-to-main rule added to branch creation; PR title required to follow Conventional Commits; PR body template gained Verification/Version/Related-issues sections; self-hosting sprints now bump `asd_version` (SemVer) and update `CHANGELOG.md` at PR open, tag + `gh release create` at PR merge. GitHub repo: squash-merge only (merge-commit/rebase-merge disabled), auto-delete branch on merge, branch protection on `main` (required `sync-check` status, no force-push, no deletion, enforced for admins too). `asd_version` bumped 1.1.0 → 1.2.0 as the first application of this policy (`canon_hashes`/`upstream_hashes` recomputed for every changed managed-path file).
- **Rationale**: Evaluated `LordKuper/forge`'s `AGENTS.md` per user request; adopted the practices with real value for a framework repo with a load-bearing version (`asd_version` already consumed by `/asd-update` but never bumped since introduction) and no branch protection at all. Skipped forge's portability/.NET rules (not applicable — no compiled code) and its post-PR-open inline-review-comment loop (ASD's pre-PR-open, coverage-ledger-gated review is already stricter).
- **Affected docs**: `.asd/rules/git-strategy.md`, `.asd/rules/sprint-lifecycle.md`, `.asd/workflows/asd-phase-scope.md`, `.asd/workflows/asd-phase-pr.md`, `.asd/agents/asd-pm.md`, `.asd/templates/t_pr-description.md`, `.asd/release-manifest.json`, `CHANGELOG.md` (new), GitHub repo settings + branch protection on `main`.

## 2026-09-01 — Automate release-manifest.json hash-ledger recompute

- **Decision**: `node .asd/sync.js --apply <file...>` now recomputes `canon_hashes` and `upstream_hashes` in `.asd/release-manifest.json` from actual on-disk content after every apply (whole-repo, independent of which targets were requested), writing back only when a value actually changed. `posixJoin`/`walkDir`/`expandManagedPath`/`hashIfFile` moved from `.asd/skills/asd-update/update.js` into `.asd/sync.js` (exported, aliased back in update.js) to avoid duplicating the same file-tree walk in both places.
- **Rationale**: Editing a canonical file previously left both hash ledgers stale until someone hand-wrote a throwaway script to recompute them (`tests/run.js` catches the drift but doesn't fix it) — exactly the gap hit while adopting the forge-inspired versioning practices above. Folded into `--apply` per AGENTS.md's existing "run sync.js --apply after editing canon" instruction, so it's the same step, not a new one to remember.
- **Affected docs**: `.asd/sync.js`, `.asd/skills/asd-update/update.js`, `.asd/release-manifest.json` (recomputed `.asd/sync.js`/`.asd/skills/asd-update/update.js` entries).
