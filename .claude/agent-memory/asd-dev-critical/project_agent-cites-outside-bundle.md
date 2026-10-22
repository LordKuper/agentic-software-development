---
name: agent-cites-outside-bundle
description: an agent opens a rule section only if its context bundle or the payload names it; a cite outside both is unreadable
metadata:
  type: project
---

A dispatched agent reads its own definition, `inputs.context` (its `providers.md` "Role-scoped context" rows) and sections the payload names — never a rule file at will (`agent-protocol.md` "Dispatch payload" "Reading").

**Why:** a new agent rule citing a rule-doc section absent from that role's grant rows points the agent at text it may not open, so the behaviour silently depends on the cite.

**How to apply:** before adding an agent-facing cite, check the role's grant rows; if the section is missing, state the acting behaviour in the agent text and keep the cite as traceability only, or have the dispatching workflow's payload name the section.
