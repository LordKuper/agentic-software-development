---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 028-cleanup-phase

## Goal
Add a `cleanup` phase before retro. It removes everything superfluous born during the sprint — temporary code and fixtures, test data, etc. After removal a build runs to confirm nothing broke. Approach and refined requirements: `research.md`.

## Acceptance
- AC-1: Both workflows gain a `cleanup` phase immediately before `retro` — `standard`: impl-review → cleanup → retro; `lite`: design-promote → cleanup → retro — in each workflow definition (`phases`, `next`), the precondition chain, and every phase-chain mirror.
- AC-2: The main orchestrator performs the cleanup phase itself, with no agent dispatch; this is stated as an explicit exception to its delegate-only rule.
- AC-3: Removal reach is the residue the sprint introduced (temporary/debug code, scratch files, commented-out blocks, fixtures and test data no final test uses) plus anything that became superfluous as a consequence of the sprint's work, pre-existing code included; stubs and TODOs still needed are kept. Removal needs clear evidence that the item is superfluous.
- AC-4: Before removing anything the phase starts from a committed checkpoint and reverts only its own removals; removals land in their own commit(s), and the removed items are recorded in `decisions-log.md`. No user approval of the removal list.
- AC-5: After removal the phase runs build, lint and the tests the removals impact; on a failure the orchestrator diagnoses the cause and fixes it autonomously, reverting a removal when that is the necessary and correct path. No review pass runs over the cleanup changes.
- AC-6: A config switch (`cleanup: enabled | disabled`, absent = `enabled`) controls the phase, frozen per sprint at scope; disabled makes the phase a no-op recorded in `skipped_phases`. `/asd-init` collects and edits it.
- AC-7: README.md and every cross-file mirror reflect AC-1..AC-6 and AC-8..AC-10; `node tests/run.js` is green and `sync.js --check` is clean.
- AC-8 (retro 027#A-1): `asd-external-review.md`'s own return-format text states that an empty Kept findings table is its header and separator rows only, never a placeholder row.
- AC-9 (retro 027#P-1): a plan decision adding a multi-stage interactive step states, before plan acceptance, each stage's on-disk write point and the re-entry evidence that marks it done.
- AC-10 (retro 027#P-2): a criterion claiming universal reach ("any", "every") lists, before plan acceptance, every site that triggers it by repo grep, not only the phases that already act on it.
- AC-11 (amendment): The agent roster is reduced to seven specs — `asd-dev` (plus its `mechanical` variant), `asd-tester` (single variant), `asd-reviewer-quality`, `asd-reviewer-efficiency`, `asd-reviewer-combined`, `asd-external-review`, `asd-advisor`; `asd-ba`, `asd-ux`, `asd-architect`, `asd-reviewer-correctness`, `asd-reviewer-testing`, `asd-reviewer-documentation`, the `asd-dev` `critical` variant and both `asd-tester` variants are removed.
- AC-12 (amendment): The main orchestrator performs inline all work previously delegated to BA, UX and Architect — scope best-practice research, audit, design drafts, design-review fixes, design-promote, and the standalone skills `asd-concept`, `asd-stack`, `asd-design-system`; it delegates only code (`asd-dev`), tests (`asd-tester`), review (reviewers, External Review) and advice (`asd-advisor`).
- AC-13 (amendment): `standard` design-review and impl-review dispatch `quality` and `efficiency` (plus External Review when enabled); `lite` impl-review dispatches `combined` (plus External Review); verdict tokens read `[REVIEW-<phase>-quality|efficiency|combined]`.
- AC-14 (amendment): Reviewer rubrics — `quality`: completeness against every AC-N and plan Task (AC → code → test trace), conformance to requirements and recorded decisions, correctness (bugs, edge cases, error handling, security, contracts, compatibility), test adequacy (AC coverage, fail-first regressions, no flaky or meaningless tests, manual-verification necessity), documentation accuracy (SSoT, traceability, actuality, stub resolution), UI and accessibility when in scope; `efficiency`: simplicity (no unneeded abstraction, layer, dependency, config or speculative code), structure (cohesion, duplication, reuse of what exists), performance (algorithmic cost, I/O, hot paths), runtime token cost and documentation economy, change size proportional to value, test-suite cost; `combined`: both rubrics in one pass. Every check the removed reviewers performed maps to `quality` or `efficiency`; none is dropped.
- AC-15 (amendment): Models and effort — `asd-dev` sonnet/high (codex sol/high); `asd-dev-mechanical` haiku/high (codex luna/high); `asd-tester` sonnet/high (codex sol/high); `asd-reviewer-quality` opus/high (codex sol/high, web tools); `asd-reviewer-efficiency` opus/high (codex sol/high, no web); `asd-reviewer-combined` opus/high (codex sol/high); `asd-external-review` and `asd-advisor` unchanged.
- AC-16 (amendment): Task routing drops the `critical` tier: `asd-dev` routes `mechanical` or `standard`; `asd-tester` is unrouted.
- AC-17 (amendment): Before every user escalation outside the phase-transition gates of `checkpoints.md` "Gate inventory" (an agent `QUESTION`, a `FAILED`, a repeated stall, a stalemate, a review-cap override, and the like), the orchestrator obtains an `asd-advisor` recommendation and presents it with the options; the advice is non-binding and the user decides.
- AC-18 (amendment): An upgrading consumer is migrated: generated views of removed agents are removed as orphans, and an in-flight sprint keyed on removed reviewer or tier names resumes; the release is MAJOR.
- AC-19 (amendment): README.md and every cross-file mirror reflect AC-11..AC-18; `node tests/run.js` is green and `sync.js --check` is clean.

## Out of scope (optional)
- A dead-code detector dependency (rejected approach, `research.md`).
- A review pass over cleanup changes.
