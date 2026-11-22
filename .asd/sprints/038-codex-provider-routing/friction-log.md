---
responsibility:
  owns: per-sprint log of workflow friction
  excludes: code defects, artifact-quality findings and verdicts, human operational actions, decisions taken
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 038-codex-provider-routing

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl-review | Claude CLI refused the authenticated account after local readiness passed | reviews/impl/wave-1/iter-01/external |
| F-2 | impl-test | Tool output truncation forced a second full-suite run | test-plan.md Suite run |

## F-1 — Claude CLI refused the authenticated account after local readiness passed

- **Phase**: impl-review
- **Surface**: provider tool — Claude CLI authentication at inference
- **What happened**: The CLI passed the local readiness probe, then reported an account hold on both invocation attempts. A fresh preflight surfaced the recorded authentication failure.
- **Impact**: External review could not run in this iteration.
- **Refs**: reviews/impl/wave-1/iter-01/external

## F-2 — Tool output truncation forced a second full-suite run

- **Phase**: impl-test
- **Surface**: provider tool — full-suite output capture on entry 3
- **What happened**: The first run returned exit 0, but the tool truncated the runner report before the agent could record its required counts. The attempt was closed as interrupted and a second run captured the complete result.
- **Impact**: One duplicate full-suite invocation.
- **Refs**: test-plan.md Suite run
