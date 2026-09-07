---
# ASD generated. Edit .asd/skills/asd-phase-retro/SKILL.md. source_digest=sha256:d72a91da05c632bbffdec7a3585c4ce0547d292930dfb0b4a3f5a4f76a3e72d8 content_digest=sha256:3652a959b427dec531677693aab754b13b65f9bde941748cf3f2e78db71972b7 asd_version=5.0.0 schema=1
name: asd-phase-retro
description: "Runs the ASD retro phase: the phase orchestrator reads the sprint friction log, derives a root cause per F-N entry with consumer-project and ASD-framework remediation traced to those ids, plus systemic proposals from how the sprint actually ran, writes retrospective.html and posts a short chat summary. An absent or entry-free log takes the empty-log branch — remediation skipped, systemic proposals still produced — and still completes to pr. Use when asd-sprint dispatches the retro phase, or when the user explicitly asks to run or re-run retro for the active sprint."
allowed-tools: "Read Write Edit"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the retro phase, or when the user explicitly asks to run or re-run retro for the active sprint. Execute workflow `.asd/workflows/asd-phase-retro.md`.
