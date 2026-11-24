# Language Policy

## Matrix

| Artifact type | Language |
|---|---|
| Chat with user | `language.chat` from config |
| User-facing artifacts (PRD, ADR, UX-spec, plan.md, sprint.md, reviews, persistent docs) | `language.docs` from config |
| Machine-readable files (state.json, config.yaml, settings.json, env files) | English, dense, always |
| Workflow infrastructure (rules, agents, skills, hooks, CLAUDE.md) | English, dense imperative prose, always |
| File names, git branches, commit subjects, PR titles | English, always |
| Issue titles, bodies and comments ASD writes to the ASD repo | English, always, whatever `language.chat`/`language.docs` |
| Issue titles, bodies and comments ASD writes on a consumer project's own repository | `language.docs` |
| `DESIGN.md` (Google Labs format) | English, format-mandated YAML + Markdown |
| LikeC4 `.c4` files | English, format-mandated DSL |

## Translate at write time

Agents may reason in `language.chat`. Render each write in its Matrix language.

## Quote translation

Translate artifact quotes inline to `language.chat` and cite the source path.

## User-decision options

Translate at the call site to `language.chat`: choice `question` and `header`, every `label` and `description` including standard controls (`Lock in`, `Revise this section`, etc.), Problem/Options/Recommended/Consequences, and free-text approval prompts.

Keep internal signals (`COMPLETED`, `FAILED`, `QUESTION`, `ABORT`, `APPROVE`, `CONCERNS`, return-contract strings), JSON keys and return-object fields in English (`agent-protocol.md`).

Follow `checkpoints.md` for gate class, exact authorization reuse and adaptive evidence. A required hard-gate decision needs its specified answer. A strict write-then-review-accept gate requires explicit `accept`. Revision feedback is free text.

## Write-then-review-accept: chat-language self-sufficiency

For write-then-review-accept, summarize what changed and why in `language.chat` so the user can give informed feedback from chat. Quote and translate key passages as needed. Keep the full body in the artifact (`checkpoints.md`).
