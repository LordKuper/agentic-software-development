---
# ASD generated. Edit .asd/skills/asd-phase-retro/SKILL.md. source_digest=sha256:417f9081d1cba742e3530518bc52d501b6330568c45cf8701434c23b0d4779ec content_digest=sha256:ec1f361279d9e4ed358b2a1561d6b3e71774737df89f3930ae525f445db1be14 asd_version=7.1.0 schema=1
name: asd-phase-retro
description: "Runs the ASD retro phase: the phase orchestrator reads the sprint friction log, derives a root cause per F-N entry with consumer-project and ASD-framework remediation traced to those ids, plus systemic proposals from how the sprint actually ran, writes retrospective.html and posts a short chat summary. An absent or entry-free log takes the empty-log branch — remediation skipped, systemic proposals still produced — and still completes to pr. Use when asd-sprint dispatches the retro phase, or when the user explicitly asks to run or re-run retro for the active sprint."
allowed-tools: "Read Write Edit"
---

Operation mapping: see `.asd/rules/providers.md`.

Execute workflow `.asd/workflows/asd-phase-retro.md`.
