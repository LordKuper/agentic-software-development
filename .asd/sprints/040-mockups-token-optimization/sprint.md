---
responsibility:
  owns: sprint scope and acceptance criteria
  delegates_to: audit.md (findings), plan.md (tasks)
---

# Sprint 040-mockups-token-optimization

## Goal

Simplify mockup and configuration workflows. Measure ASD token use in Codex and reduce recurring context costs with evidence and file-by-file approval.

## Acceptance

- AC-1: One setting selects Claude Design, Figma, standalone HTML or no mockups, independent of UX-spec enablement. Remove embedded UX-spec mockups and migrate old settings to preserve effective mockup creation behavior.
- AC-2: A real `asd-update` checks the resulting config against the current settings and offers values for missing keys. `asd-sprint` no longer checks config completeness at entry.
- AC-3: Before framework changes, record actual Codex usage by phase on reproducible Lite and Standard scenarios. Separate input, cached input and output when observable. Identify skipped phases, revisits and telemetry gaps. Map recurring phase and role context to the files that contribute to it and order the file review by attributed token cost.
- AC-4: Inventory ASD files and generated artifact types. Obtain an ASD advisor verdict for each file on keeping, shortening, consolidating or removing it, with evidence of purpose, consumers, dependencies and expected savings. Obtain explicit user approval for each proposed file edit or removal before applying it.
- AC-5: Apply approved optimizations using the shortest clear form, including checklists or structured data where useful. Preserve required contracts and behavior. Re-run the Codex scenarios against the revised framework and report before/after usage by phase separately from estimated per-file savings. Verify the mockup and config behavior with targeted checks.
- AC-6: `context-check` checks the existing aggregate byte cap for standalone skills before a change reaches the contract suite (retro 039#P-1).

## Out of scope

- Claude Code token measurement.
