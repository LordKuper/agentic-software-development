---
{
  "name": "asd-phase-retro",
  "description": "Runs the ASD retro phase: the phase orchestrator reads the sprint friction log, derives a root cause per F-N entry with consumer-project and ASD-framework remediation traced to those ids, plus systemic proposals from how the sprint actually ran, writes retrospective.html and posts a short chat summary. An absent or entry-free log takes the empty-log branch — remediation skipped, systemic proposals still produced — and still completes to pr. Use when asd-sprint dispatches the retro phase, or when the user explicitly asks to run or re-run retro for the active sprint.",
  "claude": { "allowed-tools": "Read Write Edit" },
  "codex": {}
}
---

Execute workflow `.asd/workflows/asd-phase-retro.md`.
