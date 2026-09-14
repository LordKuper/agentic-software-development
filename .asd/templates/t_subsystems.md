---
responsibility:
  owns: which subsystems exist and their ids (sole subsystem registry); mermaid mode with documents.c4: the subsystem diagram
  excludes: a subsystem's purpose and key paths, requirements, decisions, stack
  delegates_to: <id>.md (purpose, key paths), c4/ (likec4 diagram source), stack.html
---

# Subsystems

| Id | Name | Role |
|---|---|---|
| [{{id}}](./{{id}}.md) | {{name}} | {{one-line role}} |

## Diagram

Mermaid mode with `documents.c4` enabled only; omit this section otherwise.

```mermaid
C4Container
  title {{PROJECT_NAME}}
  Container({{id}}, "{{name}}", "{{tech}}", "{{one-line role}}")
  Rel({{id}}, {{other id}}, "{{label}}")
```
