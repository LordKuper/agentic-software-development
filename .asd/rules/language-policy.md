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

## AskUserQuestion options

Every interactive option presented to the user — `AskUserQuestion` `question`, `header`, every option `label` and `description`, the Problem/Options/Recommended/Consequences block from `core.md`, and any free-text approval prompt — MUST be rendered in `language.chat`. This applies to standard control options too: `Lock in` / `Revise this section` / `Skip` / `Approve` / `Edit` / `Reject` / `Approve and write` / `Revise specific section` / `Confirm` / `Rollback` / etc. Translate at the call site; do not emit English option labels when `language.chat` is non-English.

Internal signal tokens that cross the agent boundary (`COMPLETED`, `FAILED`, `QUESTION`, `ABORT`, `APPROVE`, `CONCERNS`, return-contract strings) stay in English — they are machine signals, not user-facing text.

Free-text approval ("ok", "да", "approve") is NOT a substitute for `AskUserQuestion` at any HARD gate listed in `checkpoints.md`. The gate requires a discrete-option call so the approval is unambiguous and auditable.