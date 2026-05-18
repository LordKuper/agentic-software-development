# Language Policy

## Matrix

| Artifact type | Language |
|---|---|
| Chat with user | `language.chat` from config |
| User-facing artifacts (PRD, ADR, UX-spec, plan.md, sprint.md, reviews, design/* docs) | `language.docs` from config |
| Machine-readable files (state.json, config.yaml, settings.json, env files) | English caveman-style, always |
| Workflow infrastructure (rules, agents, skills, hooks, CLAUDE.md) | English normal prose, always |
| File names, git branches, commit subjects, PR titles | English, always |
| `DESIGN.md` (Google Labs format) | English, format-mandated YAML frontmatter + Markdown body |
| LikeC4 `.c4` files | English, format-mandated DSL |

## Translate at write time

Agents may reason internally in `language.chat`. Before `Write` or `Edit` to a user-facing artifact, translate to `language.docs`. Before writing to a machine file, render in English caveman-style.

## Quote translation

When an agent quotes from a user-facing artefact during chat communication, the quote MUST be rendered in `language.chat`, even if the source file is in a different language. Translate inline. Cite the source path so the user can open the original.