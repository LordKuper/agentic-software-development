---
responsibility:
  owns: project-owner reliability checklist of recurring review findings, each with a diff-readable trigger
  excludes: review findings (reviews/), retro content (retrospective.html), rule text (.asd/rules/)
  delegates_to: .asd/rules/artifact-layout.md "Reliability checklist" (ownership, lifecycle), <sprint>/reviews/ (findings), <sprint>/retrospective.html (retro rows)
---

# Reliability checklist

<!--
Intake, ownership and lifecycle: .asd/rules/artifact-layout.md "Reliability checklist" — not restated here.
One row per check. ID: CL-N. Trigger: comma-separated path globs (* within a segment, ** across segments); the item applies to a review whose files match.
Check: one imperative sentence a reviewer verifies on the diff. Severity: critical | high | medium | low.
Source: <NNN-slug>#F-N | A-N | P-N. Last hit: <NNN-slug> of the latest sprint a finding cited the item, else —. Escape | in cells as \|.
-->

| ID | Trigger | Check | Severity | Source | Last hit |
|---|---|---|---|---|---|
