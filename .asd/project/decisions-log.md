---
responsibility:
  owns: append-only chronology of approved decisions across project lifetime
  excludes: sprint state, code review notes, custom rules
  delegates_to: .asd/sprints/ (sprint state), reviews/ (review notes), custom-common-rules.md / custom-design-rules.md / custom-coding-rules.md (rules)
---

# Decisions Log

Append-only. Never edited or removed.

## Entry format

```markdown
## YYYY-MM-DD — <one-line summary>

- **Decision**: <what was decided>
- **Rationale**: <why>
- **Affected docs**: <links> (optional)
```

## Entries

## 2026-08-31 — ASD self-hosting bootstrap

- **Decision**: Enabled `self_hosting: enabled` and per-sprint `documents.*` toggles (audit only for this repo); bootstrapped `.asd/project/` for the framework repo itself.
- **Rationale**: Lets ASD's own future changes flow through `/asd-sprint` instead of ad-hoc edits, per `plans/self-hosting-and-optional-documents.md`. This bootstrap patch itself was applied directly (no ASD-managed source to bootstrap from before this point).
- **Affected docs**: `.asd/rules/sprint-lifecycle.md` ("Self-hosting", "Optional documents"), `.asd/templates/t_config.yaml`, `.asd/templates/t_state.json`, `.asd/sync.js`, all `.asd/workflows/asd-phase-*.md`, `.asd/rules/review-policy.md`, `.asd/rules/external-review.md`, `.asd/agents/asd-backend-dev.md`, `.asd/agents/asd-frontend-dev.md`, `.asd/skills/asd-init/SKILL.md`, `.asd/skills/asd-update/SKILL.md`, `README.md`, `AGENTS.md`.
