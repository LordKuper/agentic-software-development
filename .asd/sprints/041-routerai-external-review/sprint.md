---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md, design/ docs, audit.md
---

# Sprint 041-routerai-external-review

## Goal
Consider open GitHub issues; support RouterAI model `~anthropic/claude-opus-latest` for external review when Codex is the main provider; and add a research agent that carries out research and solution-design operations.

## Acceptance
- AC-1: When Codex is the main host, an explicitly selected external-review route invokes Codex CLI with the RouterAI provider and model `~anthropic/claude-opus-latest`; the main session retains its provider and model.
- AC-2: Existing external-review routes continue to work when RouterAI is not selected. Readiness, failure and unreviewed-scope reporting distinguish the selected route, and credentials remain outside repository files and logs.
- AC-3: A dedicated ASD research agent carries out research and solution-design operations, with explicit responsibilities, inputs, outputs and provider views; the orchestrator retains user-facing decisions and approval gates.
- AC-4: Workflows that currently perform research or solution design route those operations to the research agent consistently, with handoff and failure behavior defined for both supported hosts.
- AC-5: External-review preflight parses canonical agent metadata correctly with CRLF as well as LF line endings, with regression coverage. (issue #149)
- AC-6: Requests for user decisions use the host's interactive choice tool when available; when it cannot be used, questions and options are numbered continuously so users can answer briefly. (issue #150)
- AC-7: Issue-triage label additions run without a separate user confirmation; other issue actions retain their applicable decision requirements.
- AC-8: Stop wrapped review on an explicit account-hold denial, recording the cause and unreviewed scope. (040-mockups-token-optimization#A-1)
- AC-9: Verify read-only child Git access in the same process environment as the full suite. (040-mockups-token-optimization#A-2)
- AC-10: Validate an open phase parent before accepting a dispatch timing operation. (040-mockups-token-optimization#A-3)
- AC-11: Record each concurrent task's actual completion and attribute shared context once in the wave summary. (040-mockups-token-optimization#P-1)
- AC-12: Include the smallest failing migration fixture in the migration task brief before dispatch. (040-mockups-token-optimization#P-2)
- AC-13: Revise the suite to remove redundant workflow assertions while retaining executable update cases. (040-mockups-token-optimization#P-3)
- AC-14: Carry the wrapper host in external-review preflight and use it to select the invocation shell. (039-figma-codex-prompts#A-2)
- AC-15: Check repository discovery in the exact environment used to start the terminal test runner. (039-figma-codex-prompts#A-4)
- AC-16: Trace an interrupted provider-backed artifact through recovery, reconciliation and review in the plan's reachability check. (039-figma-codex-prompts#P-2)
