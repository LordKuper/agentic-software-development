---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets, CHANGELOG.md, .asd/project/stubs.md, .asd/project/retro-backlog.md, state.json, reviews/
---

# Decisions Log

## Entries

## 2026-11-27 — Workflow choice

- **Decision**: Use the Lite workflow.
- **Rationale**: User selected Lite at scope entry.
- **Affected docs**: state.json

## 2026-11-27 — RouterAI selection requirement

- **Decision**: RouterAI is a configurable external-review option; retain existing routes and keep credentials outside the repository.
- **Rationale**: User selected option 1 during requirements clarification.
- **Affected docs**: research.md

## 2026-11-27 — Issue triage authorisation

- **Decision**: Authorise adding issue-triage labels without asking for separate confirmation; add `asd-retro` to issue #149.
- **Rationale**: User explicitly requested automatic label additions.
- **Affected docs**: issue #149

- 2026-11-27 — issue triage authorised: add asd-retro to #149; issue triage: labelled #149, to user #149 and project issue #150. No open PRs or due stubs.
- 2026-11-27 — retro HEAD check at 63882135: 040 A-1 external-review.md has generic authentication failure after retry, not an explicit account-hold stop; A-2 custom-coding-rules.md has no same-process child-Git check; A-3 runtime.js openParent accepts a missing explicit parent; P-1 runtime.js contextByteTotals sums dispatch bytes and impl workflow waits for the wave; P-2 sprint-lifecycle.md has no migration-fixture brief rule; P-3 code-style.md has no sprint-specific suite revision. 039 A-2 preflight returns platform but no explicit wrapper host; A-4 no terminal-runner repository-discovery guard found; P-2 reachability covers cross-phase values and push/merge interruption but not provider artifact recovery and reconciliation specifically. Proposed rows remain for user disposition; no host-behaviour claim is accepted as an AC without host evidence.

## 2026-11-27 — Scope accepted and retro intake

- **Decision**: User accepted the proposed scope and included all nine retro proposals in this sprint, as AC-8 through AC-16; issues #149 and #150 are AC-5 and AC-6.
- **Rationale**: User explicitly requested all proposals in the current sprint after the full scope and dispositions were presented.
- **Affected docs**: sprint.md; .asd/project/retro-backlog.md

- 2026-11-27 — issue dispositions: #149 include AC-5; #150 include AC-6. Audit auto enabled: scope changes contracts and behavior.

## 2026-11-27 — Approach choice

- **Decision**: Invoke RouterAI through Codex CLI with provider selection; add a research agent for research and solution-design operations.
- **Rationale**: User explicitly specified the Codex CLI route and corrected the Claude CLI proposal.
- **Affected docs**: research.md
