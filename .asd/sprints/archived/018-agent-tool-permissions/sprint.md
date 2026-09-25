---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 018-agent-tool-permissions

## Goal
Rework the tool grants of the canonical agents so they match how agents are actually used. Content creators get a shell, web access moves to the agents that benefit from it, and no dispatched agent carries a user-prompting tool it cannot use: a subagent never reaches the user, so every user question goes through the main orchestrator via the `QUESTION` signal (`sprint-lifecycle.md` signals).

## Acceptance
- AC-1: `asd-ba` and `asd-ux` grant `Bash` on Claude (`tools`, and removed from `disallowedTools`). `asd-architect` keeps its existing `Bash` grant.
- AC-2: `asd-dev`, `asd-tester` (base plus `mechanical`/`critical` variants), `asd-advisor` and `asd-reviewer-correctness` grant `WebFetch` and `WebSearch` on Claude, and `WebFetch` is removed from their `disallowedTools`. `asd-reviewer-efficiency`, `asd-reviewer-testing`, `asd-reviewer-documentation` and `asd-external-review` keep `WebFetch` disallowed.
- AC-3: Codex parity: every agent with Claude web access (architect, BA, UX, dev, tester, advisor, correctness) renders Codex `web_search = "live"`; efficiency, testing, documentation and External Review render `web_search = "disabled"`. `.asd/sync.js` gains a validated optional canon key for this. Anything Codex cannot express (e.g. a URL fetch distinct from search) is stated once in `providers.md`, not silently dropped. Read-only reviewer sandboxing (`sandbox_mode: "read-only"`) is unchanged.
- AC-4: No canonical agent grants `AskUserQuestion`. Every agent body instruction to "request user decision" (BA, UX, dev, tester, the four internal reviewers, External Review, advisor) is rewritten to return the question with options to the orchestrator, which asks the user. Creators return `QUESTION`. A reviewer's question travels inside its verdict-bearing report, never as a bare `QUESTION` (`review-policy.md` first-line contract). External Review's stalemate returns `[REVIEW-<phase>-external]: FAIL` plus a `Stalemate` block with options; its two-outcome contract is unchanged. The aggregating phase workflows handle both carriers.
- AC-5: `core.md` "Request user decision" states that only the main orchestrator (and skills it runs inline) prompts the user; `providers.md` and any rule doc that says or implies a dispatched agent can prompt the user are corrected to match.
- AC-7: User contact that workflows and skills delegate to dispatched agents moves to the orchestrator: the design-phase section discuss/accept loops and UX's per-token approve-before-write gate (`asd-phase-design.md`), and `asd-concept`/`asd-stack` "ask user to describe" steps (collected inline before delegating). `sprint-lifecycle.md` gains one `QUESTION` protocol (orchestrator asks, records the answer, re-dispatches fresh with it) that workflows cite. Before dispatching `asd-reviewer-testing`, impl-review collects manual-verification results from the user and passes them in the payload.
- AC-8: `asd-ba`/`asd-ux` `Bash` is bounded by a run-command policy line (named commands, e.g. `designmd-*`; never artifact writes or git writes through the shell). Commits and design-promote `git mv`/`git rm` stay with the orchestrator; `git-strategy.md` defines "holding a commit tool" by policy, not by grant.
- AC-9: Web grants carry scoped tool-policy lines (dev/tester: library, framework and runtime docs), and `core.md`'s untrusted-data rule covers all fetched and searched web content on both hosts.
- AC-6: Every mirror is updated in the same change: README.md agent roster/tools, `.asd/release-manifest.json` `canon_hashes`, generated `.claude/`, `.codex/`, `.agents/skills/` views via `.asd/sync.js --apply`, and `tests/run.js` (including the reviewer-tools assertion at line 3335). `node tests/run.js` is green and `node .asd/sync.js --check` reports no drift.

## Out of scope
- Skills' `allowed-tools` (orchestrator-side skills keep `AskUserQuestion`).
- Model tiers, effort, `maxTurns`, `memory` settings.
- Changes to External Review's wrapped-CLI invocation (`wraps_invoke_args`).
