---
responsibility:
  owns: staged-design research for sprint scope (functional requirements, best-practice findings with sources, conceptual approaches and the chosen one)
  excludes: acceptance criteria, technical design, plan, code
  delegates_to: sprint.md (AC-N), design/ docs or plan.md (technical detail), decisions-log.md (decisions)
---

# Research

<!-- Stages, conceptual boundary, no-web-research Findings line: .asd/rules/sprint-lifecycle.md "Staged solution design" — not restated here. -->

## Requirements
Raw scope and stage (a) answers; stage (c) refines the answers.
- Raw scope: make an update through `asd-update` immediately run `asd-sync` with no user confirmation; make the branch merge after PR creation run immediately too, with no confirmation and no additional `asd-sprint` invocation.
- Problem: both flows stop at a pause that adds no decision. `asd-update` only reports stale provider views and leaves regeneration to a later `/asd-sync`, whose per-file prompts cover files nobody edited. The `pr` phase halts at `await-merge` after opening the PR, so every sprint needs another invocation or a chat approval to reach a merge the rules already assign to the orchestrator.
- Actors: the user running `/asd-update` or `/asd-sprint`; the main orchestrator; consumer projects that install ASD.
- Functional requirements:
  - After `asd-update` finishes, generated provider views (`.claude/`, `.codex/`, `.agents/skills/`) ASD regenerates are synced in the same run, with no question for a file nobody edited by hand.
  - A provider-view file edited by hand (`modified-foreign`) is not overwritten silently: the user is asked per file (user answer, stage (a)). The rule holds for standalone `/asd-sync` too (stage (c)).
  - After the sprint PR is created, the orchestrator merges it in the same run, with no confirmation and no further `/asd-sprint`, once its checks finish green: up to 60 s for checks to register, up to 30 min for them to finish (stage (c)). A PR with no checks after the grace merges; a blocked merge or an exceeded wait leaves the PR open and the sprint resumable (stage (c)).
- Constraints:
  - One behaviour for every project: no new `config.yaml` key (user answer, stage (a)).
  - `user_gates: strict` keeps its PR publication approval; only the merge after it stops pausing.
  - A blocked merge (failing check, conflict, branch protection) stays reported, never forced (`git-strategy.md` "Merging a PR").
- Success criteria: `/asd-update` ends with provider views current except files the user chose to keep; a sprint PR with green checks ends merged, and under `self_hosting` released, with no user turn after PR creation.

## Findings
- `gh pr checks` has an exit code for pending checks (8) and `--watch`, `--fail-fast` and `--required` flags; it has no time limit flag — source: https://cli.github.com/manual/gh_pr_checks
- `gh pr checks --watch` run right after a push or PR creation can exit before the checks register, reporting "no checks reported", the same message a PR with no checks at all gets; users work around it with a bounded registration grace window before watching (not official documentation) — source: https://github.com/blogic-cz/agent-tools/pull/137 , https://github.com/jlong/shelbi/issues/1122
- A merge issued before checks register can land ahead of CI on a repository without required checks, so a same-run merge must wait for the checks itself rather than rely on the merge being refused — source: https://github.com/peter-evans/enable-pull-request-automerge/issues/343
- GitHub auto-merge needs the repository's "Allow auto-merge" setting and is offered only on a PR that cannot merge immediately; this repository has `allow_auto_merge: false` (`gh api`, checked 2026-11-05) — source: https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/automatically-merging-a-pull-request
- Generators that regenerate safely classify each target first, using a digest of the last generated output, overwrite only clean files and refuse a dirty one; a silent fallback to overwriting is the recurring failure. `.asd/sync.js` already classifies `current|missing|stale|modified-foreign` this way and refuses `modified-foreign` without `--force` — source: https://pypi.org/project/evergen/ , https://dev.to/samanthaparas/jostraca-review-a-good-merge-engine-with-unsafe-defaults-47fi

## Approaches
Merge strand:
- **M1, same-run hand-over**: pr open mode continues into merge mode in the same run; merge mode waits for checks with a bounded registration grace and a bounded total wait, then merges with `gh pr merge --squash`, a PR with no checks merging after the grace. A red check, conflict, branch protection or the wait limit is reported, the PR stays open and the phase exits `await-merge`, which a later resume re-enters as today; pros: no repository setting, works for every consumer, release and issue closes follow in the same run; cons: the session stays busy while CI runs, two wait limits enter the rule.
- **M2, host auto-merge**: open mode enables `gh pr merge --auto` and GitHub merges when requirements are met; pros: no wait logic for the merge itself; cons: needs "Allow auto-merge" and branch protection on every consumer, off here, and the release and issue closes need the merge anyway, so the wait stays.
- Recommended: M1 — it needs nothing from the repository and the release step has to wait for the merge either way.
- Chosen: M1 — user answer: "M1: ждёт оркестратор (рекомендую)", with a 60 s registration grace and a 30 min total wait.

Sync strand:
- **S1, one `asd-sync` behaviour**: `asd-sync` applies `missing` and `stale` targets with no question and asks per file only for `modified-foreign`, standalone `/asd-sync` included; `asd-update` delegates to it after its run; pros: one behaviour, the post-update reminders and the scope step's own `--apply` drop out; cons: standalone `/asd-sync` no longer previews an overwrite of an unedited file.
- **S2, post-update mode**: `asd-sync` gains a mode with that behaviour for `asd-update` only, standalone keeping per-file questions; pros: standalone unchanged; cons: two behaviours to state and test for a file nobody edited.
- Recommended: S1 — a target `sync.js` classifies as unedited holds nothing to lose, in either entry point.
- Chosen: S1 — user answer: "S1: везде (рекомендую)".
