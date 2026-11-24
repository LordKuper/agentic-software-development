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
