---
responsibility:
  owns: approved decisions for this sprint
  excludes: durable decisions, state, review verdicts
  delegates_to: docs, state.json, reviews
---

# Decisions Log

## Entries

<!-- entries appended below this line -->

- 2026-11-24 — Workflow choice: user selected Lite.
- 2026-11-24 — Scope interview opened. User requests a single UI mockup setting (Claude Design, Figma, HTML, or disabled), removal of embedded UX-spec mockups, and a repository-wide audit and optimization of ASD token use by phase. Agree on requirements and practices first. An ASD advisor gives each file a verdict before the user approves its edits individually. Decisions pending: legacy migration behavior and measurement coverage across Codex and Claude Code.
- 2026-11-24 — Scope interview answers: preserve prior effective behavior on migration. Measure tokens in Codex only.
- 2026-11-24 — Scope refinement: assess whether each ASD file and artifact is needed and propose removals where justified. Keep retained content short. Check config completeness and offer values for missing settings at the end of asd-update. Remove the completeness check from asd-sprint.
- 2026-11-24 — Audit requirements and practices approved by the user, including concise prose, checklists or structured data where useful, advisor verdicts and separate approval before each proposed file edit or removal.
- 2026-11-24 — Approach choice: baseline in Codex first, then review files in descending order of attributed token cost.
- 2026-11-24 — Retro intake re-verified at `a3f3e55`: A-2 open (preflight reports platform/route; shell choice still relies on wrapper host instructions; live Codex shell is PowerShell Core). A-4 open (live Node subprocess inherits scoped Git configuration; suite runner has no discovery preflight). P-1 open (aggregate cap is in contract-workflows tests; runtime context-check measures individual files and bundles). P-2 open (reachability declaration names push/merge interruptions; no equivalent provider artifact recovery requirement). No open GitHub issues, PRs or due stubs.
- 2026-11-24 — Scope accepted: user approved AC-1 through AC-5 and requested starting the Codex baseline.
- 2026-11-24 — Retro intake accepted: user included P-1 as AC-6 and deferred A-2, A-4 and P-2. Each criterion has 0 review iterations and 0 fix rounds.
- 2026-11-24 — Codex baseline recorded at `4d343b0`: 22 phase-context probes, two controls and a separate 24-window historical Lite trace. Context attribution ranks lifecycle first. Advisor recommends retaining and shortening the lifecycle file and narrowing its grants. File approval pending.
- 2026-11-24 — User requires all advisor file verdicts to be written in Russian. Translated the lifecycle verdict in audit.md.
- 2026-11-24 — File approval: user approved all three proposals for `.asd/rules/sprint-lifecycle.md` in audit.md (phase-specific recovery, on-demand phase table, separate plan-author checklist). Related files retain separate approval gates.
- 2026-11-24 — Next verdict: advisor recommends retaining `.asd/rules/artifact-layout.md` and shortening its paths, HTML shell and agent memory sections. File approval pending.
- 2026-11-24 — File approval: user approved all three proposals for `.asd/rules/artifact-layout.md` in audit.md (paths, HTML shell and agent memory).
- 2026-11-24 — Next verdict: advisor recommends retaining `.asd/rules/review-policy.md` and shortening ledger enforcement, fresh reviewer inputs and review DoD. File approval pending.
- 2026-11-24 — File approval: user approved all three proposals for `.asd/rules/review-policy.md` in audit.md (ledger validation, clean review context and review DoD).
- 2026-11-24 — Next verdict: advisor recommends retaining `.asd/rules/core.md` and shortening its introduction, orchestrator definition and rule index descriptions. File approval pending.
- 2026-11-24 — File approval: user approved all three proposals for `.asd/rules/core.md` in audit.md (introduction, orchestrator definition and rule index descriptions).
- 2026-11-24 — Next verdict: advisor recommends retaining `.asd/rules/agent-protocol.md` and shortening signals, dispatch payload, return and relay instructions. File approval pending.
- 2026-11-24 — Scope amendment AC-7 replaces AC-4. User authorized the orchestrator to accept file recommendations without further individual approvals. Advisor verdicts remain per file and in Russian. No review iterations or fix rounds. The plan will assign AC-7 when the plan phase opens.
- 2026-11-24 — Accepted all four `.asd/rules/agent-protocol.md` proposals under AC-7. Closed the pending file-approval wait.
- 2026-11-24 — Accepted advisor verdicts for ranks 6–46 and deterministic per-path verdicts covering 2,258 zero-attribution paths. The complete tracked baseline inventory has 2,304 files. Audit preserves the distinction between observed Codex usage and estimated file contribution.
- 2026-11-24 — Audit accepted adaptively. Baseline covers both phase matrices and historical Lite execution, and the inventory plus contract scans support the implementation. NEXT: plan under Lite.
