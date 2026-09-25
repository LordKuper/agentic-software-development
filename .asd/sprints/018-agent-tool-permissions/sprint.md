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
- AC-3: Codex parity: every agent granted web access by AC-2 (and those that already have it) gets the equivalent Codex web capability wherever the Codex agent config can express it; any grant Codex cannot express is stated once in `providers.md`, not silently dropped. Read-only reviewer sandboxing (`sandbox_mode: "read-only"`) is unchanged.
- AC-4: No canonical agent grants `AskUserQuestion`. Every agent body instruction to "request user decision" (BA, UX, dev, tester, the four internal reviewers, External Review) is rewritten to return `QUESTION` with options to the orchestrator, which asks the user — including `asd-reviewer-testing`'s manual-verification request and `asd-external-review`'s stalemate decision. A reviewer's `QUESTION` path is compatible with its verdict-first-line contract (`review-policy.md`), and the aggregating phase workflows handle it.
- AC-5: `core.md` "Request user decision" states that only the main orchestrator (and skills it runs inline) prompts the user; `providers.md` and any rule doc that says or implies a dispatched agent can prompt the user are corrected to match.
- AC-6: Every mirror is updated in the same change: README.md agent roster/tools, `.asd/release-manifest.json` `canon_hashes`, generated `.claude/`, `.codex/`, `.agents/skills/` views via `.asd/sync.js --apply`, and `tests/run.js` (including the reviewer-tools assertion at line 3335). `node tests/run.js` is green and `node .asd/sync.js --check` reports no drift.

## Out of scope
- Skills' `allowed-tools` (orchestrator-side skills keep `AskUserQuestion`).
- Model tiers, effort, `maxTurns`, `memory` settings.
- Changes to External Review's wrapped-CLI invocation (`wraps_invoke_args`).
