---
{
  "name": "demo-wraps",
  "description": "Demo agent used only by tests/run.js to exercise the wraps_cli/wraps_config_key body substitution in sync.js.",
  "claude": {
    "model": "opus",
    "wraps_cli": "codex",
    "wraps_config_key": "system.tools.codex_command"
  },
  "codex": {
    "model": "sol",
    "model_reasoning_effort": "high",
    "sandbox_mode": "read-only",
    "wraps_cli": "claude",
    "wraps_config_key": "system.tools.claude_command"
  }
}
---

Wraps `{{wraps_cli}}` CLI. Override via `{{wraps_config_key}}`.
