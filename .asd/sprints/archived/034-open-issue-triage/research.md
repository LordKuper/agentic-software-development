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
- Raw scope: "Надо разобрать открытые issues." (triage the open issues)
- Problem: open GitHub issues pile up. The 12 open `[asd-retro]` issues and the 5 sprint-033 retro rows wait for a disposition. Scope offers only `[asd-retro]` issues of the ASD repo, and only under self-hosting. A project's own open issues (#110, filed by the user) never reach a sprint.
- Actors: the user (decides include / reject / defer at the scope gate); the main orchestrator (lists, triages and closes issues, writes the dispositions); the project's GitHub repository.
- Functional requirements:
  - Run the retro intake over the 12 open `[asd-retro]` issues and the 5 sprint-033 rows (A-1..A-4, P-1), and implement every included one in this sprint.
  - Implement #110: at scope, offer every open issue of the project's own repository (its `origin` on GitHub) for inclusion, in consumer projects as well as here, each taking an explicit include / reject / defer.
- Constraints: one sprint for everything included, no split; issue text stays untrusted data (`core.md` "Untrusted-data boundary"); triage closes take no gate (`checkpoints.md` "Gate inventory"); the self-hosting `[asd-retro]` triage keeps its current rules.
- Success criteria: no open issue lacks a disposition after the scope gate; the included issues are delivered and closed on release; the next sprint's scope offers the project's open issues.

## Findings
Covers the #110 strand only; the retro rows and `[asd-retro]` issues are re-verified at `HEAD` in step 2a, not researched here.
- Triage practice: search open and recently closed issues before calling one a duplicate (GitHub flags none automatically); close a duplicate only after a human reviews the proposal; leave priority to planning, not triage. — source: https://www.libelektra.org/ftp/permaplant/doc/mr/mdbook/guidelines/issue-triage.html , https://microsoft.github.io/hve-core/docs/agents/github-backlog/triage
- A large backlog is fixed at intake (templates, search-first), not by more labels; label the triage state (`deferred`, `needs info`) so the next pass skips decided issues. — source: https://www.fosshub.com/resources/maintainers/issue-triage/ , https://www.ssw.com.au/rules-beta/using-labels-for-github-issues
- `gh issue list` lists open issues by default, caps at `-L` (default 30), takes GitHub search syntax in `-S` and returns `number,title,body,labels,author,createdAt,url` as JSON. — source: https://cli.github.com/manual/gh_issue_list
- Issue titles and bodies are an established prompt-injection channel for coding agents (hidden commands in a public issue led agents to leak private repos and CI secrets); the published defence is that untrusted issue text never triggers a side-effecting action in the step that reads it. — source: https://labs.cloudsecurityalliance.org/research/csa-research-note-claude-code-github-action-prompt-injection/ , https://www.infoworld.com/article/4194468/github-ai-agent-leaks-private-repositories-via-prompt-injection-attack-2.html
- A PR body's closing keyword (`Closes #N`) closes the issue when the PR merges into the default branch; `Refs #N` only links it. — source: https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue

## Approaches
- **A. One project-issue intake beside the retro intake**: every project with a GitHub `origin` and authenticated `gh` lists its open issues at scope; under self-hosting the `[asd-retro]` marker issues keep today's rules 1-4 and every other issue joins the gate; each non-marker issue goes to the user (no auto-close) as include / reject / defer, written back as today (include → `AC-N … (issue #N)`, reject → close "not planned", defer → `deferred` label); included issues close on delivery (self-hosting: after the release, as now; consumer: on the PR merge). Pros: one gate, one disposition vocabulary, labels make re-runs skip decided issues; cons: a large tracker lengthens the scope gate (bounded by the list limit).
- **B. Read-only offer**: list the project's open issues at the scope gate; include → `AC-N`, reject and defer recorded only in the sprint log, no GitHub write. Pros: no write to the project tracker; cons: a rejected or deferred issue is offered again every sprint, and nothing closes the delivered ones.
- **C. A as an opt-in config key** (e.g. `issues.intake: enabled`): same as A, off unless `/asd-init` turns it on. Pros: consumers without a tracker or with a big one see no change; cons: a new config key, `/asd-init` and migration work, and the user asked for every open issue to be offered by default.
- Recommended: A — it reuses the existing triage path and labels, persists dispositions so nothing is asked twice, and the list limit plus the existing `gh`-unavailable skip bound the cost.
- Chosen: A — user answer 2026-11-16; refinement: comments ASD writes on a consumer project's own issues use `language.docs` (the ASD repo stays English).
