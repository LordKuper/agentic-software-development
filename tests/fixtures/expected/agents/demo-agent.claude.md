---
# ASD generated. Edit .asd/agents/demo-agent.md. source_digest=sha256:2b4ab6273b26818263b14a6960d9913e55e7b8ee716d2143cc911078004404e3 content_digest=sha256:a6c3ff3982edbf930620cb1c5710bf390a5222bf9892afa2fd42edf3fc065b40 asd_version=1.1.0 schema=1
name: asd-demo
description: "Demo agent used only by tests/run.js fixtures for sync.js transforms."
tools: [Read, Grep]
disallowedTools: [Bash]
model: opus
effort: high
maxTurns: 10
memory: project
---

# Role

Demo agent. Exists only to exercise sync.js canonical-agent transforms in tests/run.js.

## Operating contract

- Scope: fixture testing only.
- Authority: none - never dispatched by real workflows.
