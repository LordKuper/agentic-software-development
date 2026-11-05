---
responsibility:
  owns: brownfield findings for sprint scope (existing docs, code, gaps incl. dependencies/migration, risks)
  excludes: requirements, decisions, plan, code
  delegates_to: prd.html (requirements), adr.html (decisions), plan.md (tasks)
---

# Audit

An absent optional section below means an empty finding set for that section, never an unperformed check (`.asd/workflows/asd-phase-audit.md` "Rules"). Omit any optional section entirely when it has no findings — never emit a placeholder row.

The main orchestrator writes all applicable sections. Product/domain ambiguity a source can resolve is resolved from it; ambiguity only authority or preference can settle goes to the user.

## Scope reference
[sprint.md](./sprint.md)

## Touched areas
- `.asd/skills/asd-sync/SKILL.md`: step 3 and its `never` rule (AC-1).
- `.asd/skills/asd-update/SKILL.md`, `.asd/skills/asd-update/update.js`: step 5, step 7, Delegates, Return, the "Run `sync.js --apply`" log line (AC-2).
- `.asd/workflows/asd-phase-scope.md` step 1 "ASD update": its own `--apply` (AC-2).
- `.asd/workflows/asd-phase-pr.md`: open mode step 4, merge mode, Exit, Return (AC-3, AC-5, AC-6).
- `.asd/rules/git-strategy.md`: "Merging a PR" (AC-4, AC-5), "Commit before review" Memory content check (AC-12).
- `.asd/rules/sprint-lifecycle.md`: "PR phase" Modes, "Merged-unclosed" (AC-3, AC-5).
- `.asd/skills/asd-sprint/SKILL.md`: Step 3 pr chain text (AC-3, AC-5).
- `.asd/runtime.js`: a checks wait subcommand (AC-4).
- `.asd/rules/artifact-layout.md`: "Scratch directory" (AC-6), "Agent memory" Content (AC-12).
- `.asd/agents/asd-external-review.md`: Rules (AC-7).
- `.asd/project/custom-coding-rules.md` (AC-8).
- `.asd/workflows/asd-phase-audit.md`: step 3b, step 5, Rules "Contradictions" (AC-9, AC-10).
- `.asd/templates/t_prd.html` line 30 (AC-11).
- `.asd/agents/asd-dev.md`, `.asd/agents/asd-tester.md` (AC-12).
- `.asd/rules/review-policy.md` "Iteration severity floor", `.asd/templates/t_review.md` (AC-13).
- `README.md`: lines 70, 108, 110, 197, 215 and the `gh` allowlist note (mirror).
- `tests/run.js`: the sprint-021/022 pr chain test, the update driver tests, section tests of edited rule text.
- `CHANGELOG.md`, `.asd/release-manifest.json`: version bump at `pr`.

## Existing docs found
- [git-strategy.md](../../rules/git-strategy.md) "Merging a PR": already assigns the merge to the orchestrator ("it never waits for a human to click merge") and reports a blocked merge, never forcing it, but states no check wait and names no bound.
- [sprint-lifecycle.md](../../rules/sprint-lifecycle.md) "PR phase": open mode ends at `NEXT: await-merge`; a resume at `pr.state="open"` enters merge mode. "Merged-unclosed" cites `NEXT: await-merge` as the point `state.json.pr` is published before.
- [asd-phase-pr.md](../../workflows/asd-phase-pr.md) open mode step 2 already hands over to merge mode on a `MERGED` or `OPEN` head-branch hit; only the no-hit path ends at step 4.
- [checkpoints.md](../../rules/checkpoints.md) "Gate inventory": PR publication is approve-before-write in strict; the merge has no gate row, so AC-3 removes no gate.
- [providers.md](../../rules/providers.md) "Role-scoped context": orchestrator `pr` refs already include "Merging a PR"; no new ref needed.
- [gh-2.90.md](../../../docs/architecture/tech-reference/gh-2.90.md): covers `gh issue`/`gh label`/`gh release` only, no `gh pr checks`.
- [README.md](../../../README.md) line 215 states `/asd-sync` is "never a silent bulk overwrite"; line 108 tells the user to run `/asd-sync`; line 197 names `await-merge` as "PR opened".

## Existing implementation found
- `.asd/sync.js`: `--check` reports `current|missing|stale|modified-foreign`; `--apply <file...>` writes `missing`/`stale` and refuses `modified-foreign` without `--force`. Everything AC-1 needs exists; `--apply` takes an explicit list.
- `.asd/skills/asd-update/update.js`: `applyPlan` already runs a fresh `sync.js --check` and `main()` logs the stale list with a "Run ... --apply" instruction; `--dry-run` returns before it.
- `.asd/workflows/asd-phase-scope.md` step 1 already runs `--apply` over stale views after a sprint-mediated update, so that path already skips the prompts.
- `.asd/runtime.js`: `main()` dispatches subcommands by name and already shells out through `spawnSync`; `CHAIN_EXITS` lists `await-merge` and `done`.
- `.asd/hooks/session-start.js`: reports `await-merge` for any `phase="pr"` not detected merged; stays correct, the PR being open.
- `.claude/settings.json` allows `Bash(gh pr:*)`, so `gh pr checks` needs no new grant; `asd-update` and `asd-sync` carry no `allowed-tools` restriction.

## Gaps
- `asd-sync` has no silent path: its `never` rule demands a per-file decision for every target.
- `asd-update` delegates to nothing; step 7 only reminds.
- No rule or tool waits for PR checks, and `gh pr checks --watch` alone cannot supply AC-4's two bounds: verified live on gh 2.90, a PR with no checks exits 1 printing "no checks reported on the '<branch>' branch" in both the plain and the `--json` form, the exit a failed check also gives. A portable bounded wait (bash `timeout` is not available in PowerShell) needs a small `.asd/runtime.js` subcommand polling `gh pr checks <n> --json bucket`.
- No phase step deletes scratch files (477 in `.asd/tmp/`, 255 of them `<NNN-slug>-*` from earlier sprints).
- Audit step 5 writes `phase="audit"` only when step 1 skipped audit, so a run path leaves `phase="scope"`.
- External dependency gaps: none; `gh` is already required. `docs/architecture/tech-reference/gh-2.90.md` gains the `gh pr checks` entry and its verified no-checks behaviour.
- Migration gaps: none; no config, state or artifact shape changes. `await-merge` stays a valid exit in both workflow definitions, narrowed to a blocked merge.

## Risks
- A slow CI start on a repository without required checks: a check registering after the 60 s grace is missed and the PR merges ahead of it: impact=merge before CI on such a repository; mitigation=user-accepted bound, required checks hold the merge at GitHub whatever the grace, stated in the rule.
- A 30 min blocking command exceeds a host's foreground limit (Claude Code 10 min): impact=the wait is killed; mitigation=`asd-phase-pr.md` names it a long-running command, run in the background or with a matching host timeout.
- Under `self_hosting` the merge chains into tag, release and issue closes with no user turn: impact=a released mistake needs a follow-up PR; mitigation=DoD gate before publication; the user accepted this at the scope gate.
- `tests/run.js` pins `NEXT: await-merge` as open mode's last step: impact=the sprint-021/022 test fails after AC-3; mitigation=updated at impl-test.
- `--apply` with an empty list in `asd-sync`: impact=usage error when only `modified-foreign` remain; mitigation=the skill already skips an empty group.
- AC-6 deletes only `<NNN-slug>-*`, so scratch files named otherwise survive: impact=partial cleanup; mitigation=AC-6 is scoped to that form; earlier leftovers are out of scope.
- A partial update leaves canon mixed; AC-2 still syncs it: impact=views reflect the partial canon; mitigation=views then match what is on disk, which is what `--check` demands; the failed migration is still reported.
