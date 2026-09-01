---
# ASD generated. Edit .asd/skills/asd-concept/SKILL.md. source_digest=sha256:05ba1c94c5c90251b7469696d294ad8990c0b3466fe11f91359dd7c1d8914a60 content_digest=sha256:12e79c768ec41d56c184e04170dd5a79d52f7c0497818ffeec1c2d64c3174455 asd_version=1.2.0 schema=1
name: asd-concept
description: "Forms or edits the project concept document via asd-ba, branching by silent detection into one of four flows (no idea / vague idea / clear vision / brownfield extraction) and converging through a per-section lock-in loop. Use when the user runs /asd-concept, when asd-init detects a missing concept.html and suggests this skill, or when the user asks to define, draft, refine, edit, rewrite, or reverse-engineer the project concept, vision, target users, or value proposition."
---

Operation mapping: see `.asd/rules/providers.md`.

# ASD Concept

## Preconditions
- `.asd/project/config.yaml` exists (run `/asd-init` first)
- No active sprint required (concept is project-lifetime artefact)

## Operations used
- Read files — `.asd/project/config.yaml`, existing concept.html, candidate brownfield sources
- Search repo — silent scan for brownfield signals + candidate content
- Request user decision/input — variant choice (only when no silent signal), lens choice, section approvals, lock-in/revise loop
- Delegate to agents — `asd-ba` (author), `asd-pm` (decisions-log)

## Phase 1 — silent detection (NO asking)

Scan in order:
1. `docs/product/concept.html` exists, non-empty → mode = **edit**, skip to Edit-mode flow
2. Brownfield signals: `README*`, `docs/**`, root `*.md`, any source files, recent git commits → brownfield candidate (default variant D)
3. Greenfield (no code, no docs) → greenfield candidate (no default)
4. Continue to Phase 2

## Phase 2 — variant choice (only if Phase 1 did not route to edit)

Request user decision, four options:
- **A** — No idea yet, want to explore
- **B** — Vague idea, need shaping
- **C** — Clear vision, will describe
- **D** — Work already started (brownfield), extract what exists

Phase 1 brownfield candidates auto-suggest D as default; user may override.

## Phase 3 — flow per variant (each delegates to `asd-ba`)

**Variant A — divergent brainstorm**
- Request user input, multi-field one-shot:
  - Lens: Problem-first / User-first / Market-first / Tech-first / Capability-first
  - Horizon: weeks / months / 1-2 years / multi-year
  - Maturity: first product / shipped before / domain expert
- Delegate to agent `asd-ba`: generate 3 distinct concept directions anchored on chosen lens
- Request user decision (options): pick 1 of 3 / regenerate
- Proceed to Phase 4

**Variant B — seeded brainstorm**
- Skip lens question
- Delegate to agent `asd-ba` with raw user hint; generate 3 directions
- Request user decision: pick 1 of 3 / regenerate
- Proceed to Phase 4

**Variant C — clear vision**
- Delegate to agent `asd-ba` to ask user to describe in own words
- BA drafts per `t_concept.html` (required sections first; optional offered per-section)
- Proceed to Phase 4

**Variant D — brownfield extraction**
- Delegate to agent `asd-ba` with payload: candidate paths (repo-search results), template
- BA scans, extracts draft per template; each filled section tagged `source: <path:line>` or `source: inferred`
- Draft sets `provenance: reverse-engineered` and `source: <primary origin>` in frontmatter
- Proceed to Phase 4

## Phase 4 — convergence (universal across variants)

Section-by-section in `language.chat`:
- BA presents current section content
- Request user decision (options): **A) Lock in / B) Revise this section / C) Skip (optional sections only)** — labels/descriptions in `language.chat` per `language-policy.md`
- on B: collect feedback, BA revises, re-present, re-ask
- repeat until A
- next section per `t_concept.html` order (required first, then per-optional inclusion choice)

## Phase 5 — final approval + write

- BA shows full assembled concept summary
- Request user decision: **A) Approve and write / B) Revise specific section** (on B re-enter Phase 4 for chosen section) — labels/descriptions in `language.chat`
- on A: translate to `language.docs`, write `docs/product/concept.html` per `t_concept.html`
- emit COMPLETED

## Phase 6 — handoff

- Delegate to agent `asd-pm` to append decisions-log entry ("concept formed" / "concept edited: <sections>" / "concept reverse-engineered from brownfield")
- Print handoff suggestion in `language.chat`:
  - if `docs/architecture/stack.html` absent → "Next: run `/asd-stack` to define the tech stack"
  - else → "Next: run `/asd-sprint` to start a sprint"
- NO auto-dispatch

## Edit mode (Phase 1 routed here)

- Show existing concept summary
- Request user decision: multi-select which sections to edit (per template) or add new optional
- per chosen section: enter Phase 4 lock-in loop
- Phase 5 + 6 as usual

## User-input request shapes (encoded)

- Multi-field one-shot (e.g. Lens + Horizon + Maturity) → request as a single multi-field input
- Single-choice branching (A/B/C/D, lock-in/revise) → request as an options choice
- Never mix the two shapes in one request

## Artefacts produced
- `docs/product/concept.html` (created, edited, or reverse-engineered)
- decisions-log entry

## Agents dispatched
- `asd-ba` (author / scanner / refiner)
- `asd-pm` (decisions-log)

## Skills dispatched
None.

## Return contract (single line)
```
CONCEPT: <fresh|edit|reverse-engineered> | VARIANT: <A|B|C|D|edit> | STATUS: <complete|aborted> | NEXT: <suggested-skill-or-sprint>
```

## References
- `.asd/templates/t_concept.html` (required vs optional sections — SSoT)
- `.asd/rules/core.md` (QODDA, Simplicity Default)
- `.asd/rules/language-policy.md` (section approval flow, chat-vs-docs)
- `.asd/rules/artifact-layout.md` (concept.html path, provenance)
