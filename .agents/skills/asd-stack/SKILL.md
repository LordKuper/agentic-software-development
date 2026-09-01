---
# ASD generated. Edit .asd/skills/asd-stack/SKILL.md. source_digest=sha256:a9f4f13862863e5c86844d0dbf107f6e173ad4740f510ab427bfaaafc2fdb04f content_digest=sha256:45d20f5d4094b47b9f90927288fe7313307378f6db5b2007e2b77b158865419a asd_version=1.2.0 schema=1
name: asd-stack
description: "Forms or edits the project tech stack document at docs/architecture/stack.html via asd-architect, branching by silent detection into one of four flows (clean slate / constraints / clear stack / brownfield extraction). Verifies versions via WebFetch, runs knowledge-gap analysis, and maintains a tech-reference doc per chosen tech. Use when the user runs /asd-stack, when asd-init or asd-concept detects a missing stack.html and suggests this skill, or when the user asks to define, draft, refine, edit, upgrade, or reverse-engineer the project technology stack."
---

Operation mapping: see `.asd/rules/providers.md`.

# ASD Stack

## Preconditions
- `.asd/project/config.yaml` exists (run `/asd-init` first)
- `docs/product/concept.html` exists (run `/asd-concept` first; concept is mandatory input)
- No active sprint required

## Operations used
- Read files — `.asd/project/config.yaml`, concept.html, existing stack.html, manifests, source files
- Search repo — silent scan for brownfield signals (manifests, lockfiles, Dockerfile, CI configs)
- Request user decision/input — variant choice, constraints, section approvals, lock-in/revise loop
- Delegate to agents — `asd-architect` (author, fetch external doc to verify versions, create tech-references), `asd-pm` (decisions-log)

## Phase 1 — silent detection (NO asking)

Scan in order:
1. `docs/architecture/stack.html` exists, non-empty → mode = **edit**, skip to Edit-mode flow
2. Manifests / lockfiles / Dockerfile / CI configs detected → brownfield candidate (default variant D)
3. No code, no manifests → greenfield candidate (no default)
4. Continue to Phase 2

## Phase 2 — variant choice (only if Phase 1 did not route to edit)

Request user decision (4 options):
- **A** — Clean slate, architect proposes from concept
- **B** — I have constraints (language, runtime, hosting, budget)
- **C** — Clear stack, will describe
- **D** — Brownfield, extract from existing code

Phase 1 brownfield candidates auto-suggest D as default.

## Phase 3 — flow per variant (each delegates to `asd-architect`)

**Variant A — clean slate**
- Delegate to agent `asd-architect` with payload: concept.html, language settings, target = `t_stack.html`
- Architect reads concept (vision, target users, value prop, declared constraints)
- Proposes 2-3 candidate combinations per relevant section
- Request user decision: pick combination or request alternatives
- Proceed to Phase 4

**Variant B — constrained**
- Request user input, multi-field one-shot:
  - Primary language preference (free-text or "no preference")
  - Runtime/platform target (web / desktop / mobile / server / cli / embedded / no preference)
  - Hosting preference (cloud / self-host / local-only / no preference)
  - Budget tier (zero-cost / low / standard / no constraint)
- Delegate to agent `asd-architect` with concept + constraints
- Architect proposes within constraints
- Proceed to Phase 4

**Variant C — clear stack**
- Delegate to agent `asd-architect` to ask user to describe chosen stack
- Architect validates compatibility with concept; flags conflicts (e.g., "concept implies mobile but stack is server-only")
- Architect fills unstated gaps per `t_stack.html` (proposes defaults; user approves)
- Proceed to Phase 4

**Variant D — brownfield extraction**
- Delegate to agent `asd-architect` with manifest/source paths (repo-search results)
- Architect extracts stack content from package.json / Cargo.toml / pyproject.toml / go.mod / Makefile / Dockerfile / CI configs
- Draft sets `provenance: reverse-engineered` + `source: <primary manifest>` in frontmatter
- Proceed to Phase 4

## Phase 4 — convergence (universal across variants)

Section-by-section in `language.chat`:
- Architect presents current section content
- Per entry: verify current latest version via fetching external doc; flag if user's choice lags or is ahead
- Request user decision (options): **A) Lock in / B) Revise this section / C) Skip (optional sections only)** — labels/descriptions in `language.chat` per `language-policy.md`
- on B: collect feedback, architect revises, re-present, re-ask
- repeat until A
- next section per `t_stack.html` order

## Phase 5 — knowledge gap analysis

Per technology entry in approved stack:
- Architect compares chosen version against LLM training cutoff
- Risk:
  - **LOW** — version pre-dates cutoff, well-known
  - **MEDIUM** — version close to or shortly after cutoff
  - **HIGH** — version released after cutoff; may have breaking changes LLM does not know
- MEDIUM/HIGH: architect fetches official changelog / release notes (external doc); records breaking changes and deprecations in tech-reference doc

## Phase 6 — tech-reference creation/update

Per technology in approved stack:
- Architect creates or updates `docs/architecture/tech-reference/<tech>-<version>.md` per `t_tech-reference.md`
- Includes canonical source URL, API surface used, version-specific notes, deprecations, project conventions, "Last verified" ISO date
- Request user decision before each persistent write

## Phase 7 — final approval + write stack.html

- Architect shows full assembled stack + risk summary
- Request user decision: **A) Approve, write stack.html / B) Revise specific section** (on B re-enter Phase 4) — labels/descriptions in `language.chat`
- on A: translate to `language.docs`, write `docs/architecture/stack.html` per `t_stack.html`
- emit COMPLETED

## Phase 8 — handoff

- Delegate to agent `asd-pm` to append decisions-log entry ("stack defined: <techs>" / "stack edited" / "stack reverse-engineered, risk summary: ...")
- Print handoff suggestion: "Next: run `/asd-sprint` to start the first sprint"
- NO auto-dispatch

## Edit mode (Phase 1 routed here)

- Show existing stack summary + risk re-assessment (versions may have aged since last write)
- Request user decision: multi-select which sections to edit; OR "refresh — re-verify all versions"
- per chosen section: enter Phase 4 loop
- Phase 5-8 as usual

## User-input request shapes

- Multi-field one-shot (constraints) → request as a single multi-field input
- Single-choice branching (A/B/C/D, lock-in/revise) → request as an options choice
- Never mix the two shapes in one request

## Hard rules

- NEVER guess a version — always verify via fetching external doc (architect handles)
- Only add tech to stack when actively integrated, not speculatively
- Speculative additions belong in ADR future-considerations, not stack.html
- Every tech in stack MUST have a matching tech-reference doc before COMPLETED

## Artefacts produced
- `docs/architecture/stack.html` (created, edited, or reverse-engineered)
- `docs/architecture/tech-reference/<tech>-<version>.md` for every chosen tech
- decisions-log entry (with risk summary)

## Agents dispatched
- `asd-architect` (author / scanner / version verifier / tech-reference creator)
- `asd-pm` (decisions-log)

## Skills dispatched
None.

## Return contract (single line)
```
STACK: <fresh|edit|reverse-engineered> | VARIANT: <A|B|C|D|edit> | TECHS: <count> | RISK: <low|medium|high> | STATUS: <complete|aborted> | NEXT: <suggested-skill-or-sprint>
```

## References
- `.asd/templates/t_stack.html` (required vs optional sections — SSoT)
- `.asd/templates/t_tech-reference.md`
- `.asd/rules/core.md`
- `.asd/rules/language-policy.md`
- `.asd/rules/artifact-layout.md` (stack.html path, tech-reference path, provenance)
