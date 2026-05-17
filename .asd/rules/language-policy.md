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

## Section approval flow

When an agent drafts an artefact section by section:

1. Compose and discuss the section content with the user in `language.chat`
2. Iterate via AskUserQuestion or free-form approval until the section is approved
3. Translate the approved content into `language.docs`
4. Write the translated section to the artefact file (HTML/MD/YAML)
5. Move to next section

The user never sees the docs-language version during discussion unless they ask for it. The file on disk is always `language.docs`.

## Quote translation

When an agent quotes from a user-facing artefact during chat communication, the quote MUST be rendered in `language.chat`, even if the source file is in a different language. Translate inline. Cite the source path so the user can open the original.

## Caveman-style for machine files

- Drop articles (a/an/the)
- Fragments OK
- Terse keys and values
- No filler words
- No prose explanations — use keys and values

Example:
- Bad: `"description": "This is the user's authentication token used to verify the request"`
- Good: `"description": "user auth token, verifies request"`
