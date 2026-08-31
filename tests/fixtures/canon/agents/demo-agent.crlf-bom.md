---
{
  "name": "asd-demo",
  "description": "Demo agent used only by tests/run.js fixtures for sync.js transforms.",
  "claude": {
    "model": "opus",
    "effort": "high",
    "tools": ["Read", "Grep"],
    "disallowedTools": ["Bash"],
    "maxTurns": 10,
    "memory": "project"
  },
  "codex": {
    "model": "sol",
    "model_reasoning_effort": "high",
    "sandbox_mode": "workspace-write"
  }
}
---

# Role

Demo agent. Exists only to exercise sync.js canonical-agent transforms in tests/run.js.

## Operating contract

- Scope: fixture testing only.
- Authority: none - never dispatched by real workflows.
