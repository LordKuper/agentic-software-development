---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 039-figma-codex-prompts

## Goal

Add Figma as a UI mockup option alongside Claude Design and local HTML. When Codex runs ASD in the ChatGPT app, present questions to users through a widget with answer choices.

## Acceptance

- AC-1: ASD lets a project choose Figma Design, Claude Design, or local HTML for UI mockups. Existing settings continue to select their prior format across framework updates.
- AC-2: For UI work with mockups enabled, the Figma option produces editable native frames for the in-scope screens and states using the applicable design system. It works at Lite scope and Standard design. Use the supplied Figma Design file or obtain approval to create one. Apply the external-action gate to Figma writes. Record links to the frames for review, handoff, and promotion, and reuse a confirmed result on re-entry.
- AC-3: When ASD cannot write to Figma, offer temporary local HTML mockups or wait for access. Preserve the selected Figma format in project settings and record the user's decision and the publication status so a resumed phase can recover without duplicating results.
- AC-4: In the Codex App, every orchestrator question with predefined choices uses the available native decision widget. Record the selected answer under the existing gate rules and wait for an explicit answer before proceeding. Optional and free-text replies retain their existing meaning. Where the widget is unavailable, present the same choices in chat and wait for an explicit response. Open-ended prompts remain in chat, and Claude Code retains its current decision tool.
- AC-5: Verify all three mockup selections, Figma link handoff and failure handling, and Codex widget and chat flows. Record live evidence where the host supports the feature and distinguish it from rule or fixture checks.
- AC-6: The tester captures the complete test runner report and exit code in the same invocation before returning a bounded summary, so tool output truncation does not require a repeat suite run. (038-codex-provider-routing#A-2)
- AC-7: Before accepting a Test-only Task that adds or extends a behavior regression test, require a recorded fail-first run against the previous behavior or an equivalent targeted mutation under the existing proof rules. (038-codex-provider-routing#P-1)
- AC-8: Tests of a change to review scope selection exercise the Git-produced file list that the workflow supplies, including the applicable path conditions. (038-codex-provider-routing#P-2)
