---
# ASD generated. Edit .asd/skills/asd-phase-pr/SKILL.md. source_digest=sha256:f92c938eb06136c8295452e69d56cc0e8340bb2242ecce209ec7f93ffb99fb72 content_digest=sha256:108af0dc9ab674a2b34240927bd679fa433b20b76ca356d18880bee51d6ee3bd asd_version=14.3.0 schema=1
name: asd-phase-pr
description: "Runs the final ASD pr phase: the phase orchestrator verifies DoD, opens the sprint PR and merges it in the same run, publishing the self-hosting release after the merge; it never archives or marks the sprint done, which the next sprint's scope does. Use when asd-sprint dispatches the pr phase, or when the user explicitly asks to run or re-run the pr phase for the active sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

Execute workflow `.asd/workflows/asd-phase-pr.md`.
