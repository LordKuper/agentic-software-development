---
name: role-removal-inline-work
description: reviewing a change that retires agents and moves their work inline into orchestrator skills - check the skills' tool pre-approvals and the leftover sweep's phrase forms
metadata:
  type: feedback
---

When an agent's work moves into an inline phase or standalone skill, compare the removed agent's `tools` (web, Bash patterns, Write) with each receiving skill's Claude `allowed-tools`. Then grep the live canon for every form of each removed name, not only the forms the sprint's leftover test lists.

**Why:** a roster cut gave web tools to two standalone skills but not to the phase skills that now ran the same inline research and fetches. Its leftover sweep pinned verdict tokens such as `[REVIEW-impl-testing]` but not the file-name form `testing.md`, or tier prose such as "no longer critical", so both kinds survived in the rule docs.

**How to apply:**
- For each retired agent, list the phase steps its work moved to. Check each step's skill frontmatter for the tools that step now needs.
- Grep `.asd/rules`, `workflows`, `agents`, `skills` and `templates` (one call each) for `<key>.md`, the role's prose name and the retired tier word.
- Related: [[enumerated-reach-vs-trigger-sites]], [[dispatch-payload-vs-required]].
