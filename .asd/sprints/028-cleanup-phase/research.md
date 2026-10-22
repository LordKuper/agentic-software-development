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
- Raw scope: add a `cleanup` phase before retro. It removes everything superfluous born during the sprint — temporary code and fixtures, test data, etc. After removal a build runs to confirm nothing broke.
- Problem: sprint work leaves residue (temporary/debug code, scratch scripts, commented-out blocks, fixtures and test data no final test uses, code made obsolete by the sprint's own changes) that nothing in the chain removes before the sprint closes.
- Actors: main orchestrator (performs the whole phase itself, no agent dispatch); user (sets the config switch only).
- Functional requirements:
  - Removal targets: anything superfluous; stubs and TODOs are kept while still needed.
  - Reach: what the sprint introduced, plus what became superfluous as a consequence of the sprint's work (pre-existing code included in that case).
  - Autonomous: no user approval of the removal list.
  - Verification after removal: build + lint, then the tests the removals impact (stage (c) refinement).
  - On a build/lint failure: the orchestrator diagnoses the cause and fixes it autonomously, reverting a removal when that is the necessary and correct path.
  - Position: immediately before `retro` in both workflows (`standard`: impl-review → cleanup → retro; `lite`: design-promote → cleanup → retro).
  - No review pass over the cleanup changes.
  - Stage (c) refinement: performing removals is an explicit exception to the orchestrator's delegate-only rule; the phase checkpoints (commits) the accepted state first and reverts only its own removals; a broken impacted test is diagnosed and fixed or the removal reverted, autonomously, like build/lint; disabled → no-op phase recorded in `skipped_phases`.
- Constraints:
  - Config switch, default enabled (proposed `cleanup: enabled | disabled`).
  - Framework repo (`self_hosting`) has no build step; its verification command set is whatever `commands.yaml` / the framework's test runner defines.
- Success criteria: a sprint reaching retro carries no superfluous residue from its own work, and build + lint stay green after the removal.

## Findings
- Agent cleanup passes protect behaviour first: name what must stay unchanged and run the narrowest regression checks before deleting. Community skill, not a standard. — source: https://tessl.io/registry/skills/github/Yeachan-Heo/oh-my-claudecode/ai-slop-cleaner
- Bound the pass to the changed files or feature area, list concrete smells before editing, order safest deletion first, keep unrelated refactors out. — source: https://tessl.io/registry/skills/github/Yeachan-Heo/oh-my-claudecode/ai-slop-cleaner
- "Debug leftovers" is a recognised category beside unused code, unreachable branches and stale flags: print/console.log, debugger, commented-out blocks, stale TODO/FIXME, unused imports. — source: https://www.claudepluginhub.com/commands/kylesnowschwartz-sc-refactor-plugins-sc-refactor/commands/sc-cleanup
- Some tooling auto-applies only high-certainty mechanical removals and reports medium/low-certainty findings instead. — source: https://www.claudepluginhub.com/commands/kylesnowschwartz-sc-refactor-plugins-sc-refactor/commands/sc-cleanup
- Suggested exit gates: tests, lint, typecheck and a minimal diff, re-run after each pass. — source: https://tessl.io/registry/skills/github/Yeachan-Heo/oh-my-claudecode/ai-slop-cleaner
- Some skills say the cleanup writer should not self-approve high-impact removals; conflicts with the no-review requirement, so the verification gate and revert path carry that risk. — source: https://skills.cat/skills/yeachan-heo/oh-my-codex/ai-slop-cleaner
- Static dead-code detectors give false positives on dynamically referenced code; confidence thresholds trade coverage for precision. — source: https://pypi.python.org/pypi/vulture/0.6, https://mirror.b10c.me/bitcoin-bitcoin/21096/
- Reachability tools (Knip) flag files unreachable from entry points; dynamic imports, framework conventions and generated files cause false positives. — source: https://knip.dev/guides/handling-issues, https://blog.openreplay.com/remove-unused-files-dependencies-knip/
- Delete dead code rather than keep or comment it out, after verifying it is truly unused (reflection, dynamic dispatch hide usage). — source: https://hackernoon.com/code-smell-09-what-should-you-do-with-dead-code, https://www.oreilly.com/library/view/becoming-a-better/9781491905562/ch04.html
- Version control is the deletion safety net; cleanup goes in commits separate from functional changes and stays visible. — source: https://www.oreilly.com/library/view/becoming-a-better/9781491905562/ch04.html
- The Boy Scout Rule is bounded by locality; out-of-scope problems become follow-ups, not bundled cleanup. — source: https://mnemonikk.org/2017/04/04/boy-scouts-and-yaks/, https://tessl.io/registry/jbaruch/coding-policy/files/rules/boy-scout.md
- Autonomous agents can destroy uncommitted work via git restore/reset --hard/clean; mitigations: checkpoint before the run, revert only the agent's own edits. — source: https://forum.cursor.com/t/cursor-agent-just-delete-my-changes-by-git-restore-in-sandbox/154810, https://codex.danielvaughan.com/2026/04/25/codex-cli-error-recovery-rollback-patterns-git-safety-nets/
- No source found for DoD checklists covering debug-artifact removal or for bounding agent cleanup to a change set plus its consequences; inferred from the scoped-pass pattern.

## Approaches
- **Diff-scoped sweep with a checkpoint**: orchestrator checkpoints the accepted state, builds the removal set from the sprint diff plus pre-existing code made superfluous by it, removes only categories with clear evidence (debug output, scratch files, commented-out blocks, unused fixtures/test data, newly unreferenced code), keeps still-needed stubs/TODOs, runs build + lint, on failure diagnoses and reverts the offending removal from the checkpoint; pros: tight reach matching the requirement, cheap, free revert via version control; cons: relies on orchestrator judgment for consequential residue, build + lint miss behaviour regressions and dynamic usage.
- **Tool-assisted detection with certainty gating**: same reach, consequential candidates come from a dead-code detector and only high-certainty ones are removed, the rest listed; pros: fewer false deletions, objective basis for pre-existing code; cons: detectors fit a mostly Markdown/YAML framework poorly, dynamic references are false-positive prone, per-project tooling dependency, low-certainty residue stays.
- **Batched cleanup behind a safety net**: removals in batches safest → riskiest, each batch gated by build + lint (and tests where present), revert to the last green batch on failure; pros: localized failures, safest-first ordering; cons: more verification runs and turns, heavy for small sprints.
- Recommended: Diff-scoped sweep with a checkpoint — smallest design meeting every requirement; the checkpoint plus targeted revert covers the real risks (false deletion of dynamically used code, loss of uncommitted work); safest-first ordering fits as a light inner rule, detector output as optional input where a project has one.
- Chosen: Diff-scoped sweep with a checkpoint — user choice, stage (c); impacted tests added to the verification
