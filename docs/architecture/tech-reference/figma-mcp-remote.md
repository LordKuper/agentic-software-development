---
responsibility:
  owns: verified Figma remote MCP design authoring interfaces
  excludes: credentials, project destination, authorization
  delegates_to: .asd/rules/providers.md, .asd/rules/design-system.md
---

# Figma MCP remote

## Canonical source

- [Write to canvas](https://developers.figma.com/docs/figma-mcp-server/write-to-canvas/), [tools](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/), and [host setup](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/). Verified 2026-11-22.

## API surface used in project

- `use_figma` targets a Figma file key from the supplied Design URL. It can inspect or mutate native nodes through the Plugin API, depending on the script. Write access and the remote server are required.
- `create_new_file` creates a blank Design file in drafts. Select the plan or team explicitly when there is a choice. The returned file identity is the target for authoring.
- The Codex App Figma plugin exposes `create_session` for a specified file key. It returns a session ID for subsequent file tool calls and leaves the canvas unchanged. The live smoke used this setup.

## Version-specific notes

- The remote service is unversioned in ASD. Host tool availability, plan and edit rights govern writes.

## Project conventions

- See [provider operation mapping](../../../.asd/rules/providers.md) and [mockup publication and recovery](../../../.asd/rules/design-system.md#12-authoring-token-decisions-rule-survival).
