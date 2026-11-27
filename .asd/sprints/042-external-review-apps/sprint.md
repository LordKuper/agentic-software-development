# Sprint 042-external-review-apps

## Goal
Require connected applications to be disabled for external Codex review launched from Codex with a named profile, reducing unnecessary input tokens and cost.

## Acceptance
- AC-1: ASD passes `features.apps=false` to named-profile external Codex review launched from Codex, independently of provider or profile settings.
- AC-2: Primary Codex sessions and review routes launched from Claude Code retain their existing configuration; review filesystem tools and routing remain available.
- AC-3: Tests cover the named-profile invocation and external-review documentation accurately explains the behavior.
