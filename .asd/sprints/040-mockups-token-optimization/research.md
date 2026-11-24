---
responsibility:
  owns: scope requirements, sourced findings, conceptual approaches and choice
  delegates_to: sprint.md (acceptance criteria), plan.md (implementation)
---

# Research

## Requirements

- Problem: UI mockup creation is gated by the UX spec and offers an embedded presentation. ASD also incurs workflow context costs that have not been measured by phase.
- Actors: ASD maintainers, consumer-project owners, Codex orchestrators and dispatched agents.
- Mockups: one setting selects Claude Design, Figma, standalone HTML or disabled. Remove embedded UX-spec mockups. Migrate existing projects to preserve their effective mockup behavior, including projects where mockups were disabled by the UX-spec gate.
- Token audit: measure actual Codex token use by phase, establish the baseline before optimization, and compare the same scenarios after changes.
- Optimization: audit all ASD files and generated artifact types. Propose removing unused or redundant ones. Shorten what stays. Use checklists or structured data where they help.
- Config completeness: at the end of each real `asd-update`, check the project config against all current settings and offer values for missing keys. Remove the completeness check from `asd-sprint`.
- Approval order: agree on requirements and practices first. Obtain an ASD advisor verdict for each file. The orchestrator accepts in-scope recommendations under the user's standing authorization.

## Findings

- Keep skill discovery descriptions short and discriminative. Load detailed rules only for the active phase, role and scenario. Keep common instruction files focused on rules applicable throughout the repository. Source: https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra
- Use controlled Codex scenarios and check both artifacts and required workflow steps. Measure runtime input, cached input and output from JSONL usage when available. Record cold and warm behavior separately because cached input is part of input and depends on prefix reuse. Sources: https://developers.openai.com/blog/eval-skills, https://learn.chatgpt.com/docs/non-interactive-mode, https://developers.openai.com/api/docs/guides/prompt-caching
- Validate the mockup mode against an explicit set. ASD already has `project.mockup_format`, the legacy `project.claude_design` lookup, and a UX-spec-dependent creation gate. The migration must resolve existing settings together before writing the new value. Source: https://json-schema.org/understanding-json-schema/reference/enum
- ASD's existing documentation economy rule requires an observable reason to keep each instruction and preserves gates, ownership, recovery, safety and machine-parsed contracts. Repository source: `.asd/rules/artifact-layout.md`, Documentation economy.
- `asd-sprint` runs the entry config check today. `asd-update` points users to that check, and `asd-init` already proposes values for missing keys. Repository sources: the canonical skill definitions.

## Proposed File Review Practices

1. Inventory tracked files and ASD-generated artifact types. Check each file or artifact's purpose, producers, readers and contract dependencies. Propose removing redundant or unused items and record the evidence. Review generated views against their canonical inputs and respect archive immutability.
2. Shorten text in proportion to how often Codex loads it. Inspect skill discovery metadata, shared instructions, phase and role context, dispatch inputs, and tool output separately.
3. Keep each rule in one authoritative location. Use a concise reference if the reader can resolve it at the point of use. Remove repeated rationale, redundant examples and text with no effect on behavior.
4. Use the shortest clear form. Use checklists, tables or structured data when they improve clarity or validation.
5. Preserve gates, roles, safety, compatibility, recovery, and parsed contracts. Verify approved changes and retained behavior with contract tests and scenario checks.
6. Measure both Lite and Standard in Codex. Label phases and modes exercised, including skipped phases and revisits. Compare baseline and candidate with the same model, effort, scenarios, settings and tool availability. Report orchestrator and dispatched-agent usage when separately observable, avoid double counting, and mark missing telemetry. Report per-file or assembled-context estimates separately from observed usage.
7. Have the advisor write each file verdict in Russian (keep, shorten, consolidate or remove), with evidence, affected contracts and expected savings or measurement limits. Record accepted recommendations under the standing authorization.

## Approaches

- **Measured phase context.** Use reproducible Codex scenarios and a phase/role loading map to find the largest recurring costs, then complete the same per-file review and approvals across the inventory. Supports runtime and file-level comparisons. Requires comparable scenarios and reliable usage attribution.
- **File-first compression.** Run the same Codex baseline, then review and shorten files by directory before changing context assembly where results justify it. Easier to inspect locally. Delays work on repeated phase and dispatch costs that span directories.
- Recommended: Measured phase context. It orders the per-file work by observed runtime cost while retaining the full inventory and approval requirements.
- Chosen: Measured phase context. The user approved a Codex baseline before reviewing files in descending order of attributed token cost.
