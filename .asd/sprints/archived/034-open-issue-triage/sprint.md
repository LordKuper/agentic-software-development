---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 034-open-issue-triage

## Goal
Triage the open issues: run the retro intake over the open `[asd-retro]` issues and the sprint-033 retro rows and deliver every included one, and implement #110 — scope offers every open issue of the project's own GitHub repository for inclusion, in consumer projects as well as here (approach A, `research.md`).

## Acceptance
- AC-1: Scope step 2a lists the open issues of the project's own repository (the GitHub owner/repo of `origin`) in every project, consumer and self-hosting alike, up to the existing 200-issue limit; under `self_hosting` the `[asd-retro]` marker issues keep triage rules 1-4 unchanged and every other open issue joins the project-issue list. (issue #110)
- AC-2: Every listed project issue (a non-marker issue, `deferred`-labelled included) goes to the user at the scope gate with its number, title, link and a short summary treated as untrusted data; none is auto-closed as duplicate or resolved, and each takes one explicit include / reject / defer. (issue #110)
- AC-3: Project-issue dispositions are written on scope acceptance as for `[asd-retro]` issues: include → an `AC-N` ending `(issue #N)`; reject → closed "not planned" with a reason comment and the `wontfix` label; defer → `deferred` label, left open. Comments ASD writes on a consumer project's own issues use `language.docs`; the ASD repo stays English (`language-policy.md` "Matrix"). (issue #110)
- AC-4: An included project issue closes on delivery: under `self_hosting` by the existing post-release close; in a consumer project the sprint PR body lists it with a closing keyword (`Closes #N`) so the merge into `git.base_branch` closes it. (issue #110)
- AC-5: Project-issue triage is skipped with one decisions-log line, and scope continues, when `gh` is missing or unauthenticated or `origin` is not a GitHub repository. (issue #110)
- AC-6: Before scope triage's first GitHub write (label, close or edit), the orchestrator asks the host's permission once for every planned issue write, so a host permission refusal never lands mid-triage. (033#A-1)
- AC-7: Before the scope gate, each `AC-N` drafted from a retro row or issue is checked against the change surface it may touch and the phase that applies it; an undeliverable one is redrafted or shown to the user at that gate. (033#A-2)
- AC-8: Under Claude Code, External Review feeds the rendered prompt to the wrapped CLI's stdin from a git-ignored `.asd/tmp/` file removed after the run, never a heredoc; the Codex/PowerShell form is unchanged. (033#A-3)
- AC-9: `runtime.js timing --open --kind dispatch` fills a missing `agent`, `tier` or `model` attr from `state.json.task_routing` (a routed id) or the agent's canon frontmatter, and warns when neither supplies it. (033#A-4)
- AC-10: A `Suite run` whose run executed the whole suite records Scope `full`, even when invoked as the impacted set, so the terminal-run reuse holds mechanically. (033#P-1)
- AC-11: A review-fix tester runs the check a finding requires and records it in `test-plan.md` `Suite run`; an `impl-test` re-entry then reuses that green run under the existing reuse rule when no code, test or stub path changed after it. (issue #86) (issue #119)
- AC-12: Every internal reviewer dispatch payload carries the literal findings-table header row of `t_review.md`. (issue #114)
- AC-13: `timing --close` of an id that was never opened appends nothing and warns, instead of recording an unpaired close. (issue #115)
- AC-14: One runtime command records an iteration's verdicts and APPROVE latch entries in `state.json` for design-review and impl-review, replacing the hand edits. (issue #118)
- AC-15: README, `language-policy.md`, `checkpoints.md` "Gate inventory", `docs/architecture/tech-reference/gh-2.90.md` and `tests/run.js` match AC-1..AC-14.

## Out of scope (optional)
- Auto-closing project issues as duplicate or resolved (user choice: every project issue goes to the user).
