---
# ASD generated. Edit .asd/skills/asd-phase-retro/SKILL.md. source_digest=sha256:3dfe067abca4bb49216b5c53a88cb401f7c570e9e7c75b2b272849748592df7d content_digest=sha256:7edaa883c23ad0e58b20a5bb64aa9a021a0907f686641a948c56dc629daad8e6 asd_version=5.0.0 schema=1
name: asd-phase-retro
description: "Runs the ASD retro phase: the phase orchestrator reads the sprint friction log, derives a root cause per F-N entry plus consumer-project and ASD-framework recommendations traced to those ids, writes retrospective.html and posts a short chat summary. Unconditional and never no-op — an absent or entry-free log takes the empty-log branch and still completes to pr. Use when asd-sprint dispatches the retro phase, or when the user explicitly asks to run or re-run retro for the active sprint."
allowed-tools: "Read Write Edit AskUserQuestion Task"
---

Operation mapping: see `.asd/rules/providers.md`.

Triggers when the sprint orchestrator dispatches the retro phase, or when the user explicitly asks to run or re-run retro for the active sprint. Execute workflow `.asd/workflows/asd-phase-retro.md`.
