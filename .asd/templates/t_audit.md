---
responsibility:
  owns: brownfield findings for sprint scope (existing docs, code, gaps incl. dependencies/migration, risks)
  excludes: requirements, decisions, plan, code
  delegates_to: prd.html (requirements), adr.html (decisions), plan.md (tasks)
---

# Audit

An absent optional section below means an empty finding set for that section, never an unperformed check (`.asd/rules/sprint-lifecycle.md` "Audit phase"). Omit any optional section entirely when it has no findings — never emit a placeholder row.

## Scope reference
[sprint.md](./sprint.md)

## Touched areas
- {{path or area}}: {{what scope touches here}}

## Existing docs found
- [{{title}}]({{path}}): {{quote or summary of relevant part}}

## Existing implementation found
- {{path}}: {{what scope already covered by current code}}

## Gaps
- {{missing piece needed by scope}}
- External dependency gaps: {{external dep}}: {{usage}}
- Migration gaps: {{what migrates}}: {{from → to}}

## Risks
- {{risk}}: impact={{impact}}, mitigation={{mitigation}}

## Subsystems map (optional, decomposition enabled)
- {{subsystem id from c4 model}}: {{relation to scope}}

## Related open stubs (optional)

Open stubs from `.asd/project/stubs.md` touching files/subsystems in this sprint's scope. Surfaced for user decision in plan phase: resolve this sprint, defer, or migrate. Omit this section entirely when no stub matches scope.

| Sprint of origin | File:Line | Reason | Owner |
|---|---|---|---|
| {{NNN-slug}} | {{path:N}} | {{why}} | {{agent}} |

## Documentation migration plan

Items outside ASD format/location that should become persistent docs in `docs/`.
Items addressed by sprint design drafts NOT listed here (they flow through design → design-promote).
Items outside sprint scope but worth promoting wait for design-promote.
Omit this section entirely when no migrations are needed.

| # | Source (path/URL) | Format | Proposed target in `docs/` | Type | Notes |
|---|---|---|---|---|---|
| 1 | {{path}} | {{md/rst/html/wiki/...}} | {{docs/.../*.html}} | {{migrated / reverse-engineered}} | {{notes}} |
