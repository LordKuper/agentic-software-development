---
responsibility:
  owns: staged-design research for sprint scope (functional requirements, best-practice findings with sources, conceptual approaches and the chosen one)
  excludes: acceptance criteria, technical design, plan, code
  delegates_to: sprint.md (AC-N), design docs or plan.md (technical detail), decisions-log.md (decisions)
---

# Research

## Requirements

- Raw scope: Add Figma alongside Claude Design and local HTML for UI mockups. In the ChatGPT app, use a widget with options for Codex questions.
- Problem: ASD currently offers two mockup formats, and its Codex mapping directs the orchestrator to ask structured decisions in chat.
- Actors: ASD project owners configuring mockups and answering questions, and the Codex or Claude Code orchestrator.
- Functional requirements: Create editable Figma Design screens when Figma is selected. Use the Codex App widget for every question with predefined options.
- Constraints: Keep Claude Design and local HTML available. Where Codex has no widget, present the options in chat and wait for an explicit reply. Ask open-ended questions in chat.
- Success criteria: A project can use editable Figma Design mockups. A user can select predefined options in the Codex App and answer the same decision in chat on a host without the widget.
- Refinement: When ASD cannot write to Figma, offer a choice between temporary HTML mockups and waiting for access.
- Destination: Use the existing Figma Design file supplied by URL or ask for approval to create a new file when none was supplied.

## Findings

- The remote Figma MCP server can create and edit native frames and components. Direct authoring supports libraries and variables and requires a supported client with edit access. Source: https://developers.figma.com/docs/figma-mcp-server/write-to-canvas/
- Figma can also convert self-contained HTML into editable layers, but the conversion produces plain layers without library components or variables. Source: https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/
- Figma documents its remote integration for Codex and Claude Code. Tool and skill availability depends on the active client and connection. Source: https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/
- Live evidence: the Codex App rendered the workflow choice and three requirements questions using its choice widget, then delivered the selected answers to this session. ASD maps structured Codex decisions to chat in `.asd/rules/providers.md` today. The live result verifies widget availability for this session.

## Approaches

- **Native Figma authoring and host-provided questions**: author editable frames directly in Figma and route structured decisions through the active host's built-in question mechanism. Pros: native design structure, no mandatory HTML step, and the decision retains ASD's gate semantics. Cons: depends on Figma write access and the host's tool availability.
- **HTML conversion and host-provided questions**: use HTML as the intermediate mockup and convert it to editable Figma layers. Use the host's built-in question mechanism. Pros: can reuse HTML mockup material during recovery. Cons: creates a second representation for Figma and loses native library bindings during conversion.
- Recommended: Native Figma authoring and host-provided questions, since both outputs use the user's chosen surfaces directly.
- Chosen: Native Figma authoring and host-provided questions. The user selected direct creation of editable layers in Figma.
