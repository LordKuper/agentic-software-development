---
# ASD generated. Edit .asd/skills/asd-stack/SKILL.md. source_digest=sha256:f4bc5bc225b817de97d03dd82d4c9f9b6cd84b77ef7d16aed1321ed275474223 content_digest=sha256:8c5101d463f235ea30b2697b93b2e734106c966957f9e15e67e6b1915f553c73 asd_version=14.12.0 schema=1
name: asd-stack
description: "Define or edit docs/architecture/stack.html from a clean slate, constraints, a chosen stack or an existing codebase. Delegates version research and solution options, and maintains a tech reference per chosen technology. Use on /asd-stack, when referred by asd-init or asd-concept, or for a stack definition, refresh or extraction."
allowed-tools: "Read Write Edit Glob Grep Task AskUserQuestion Bash(node .asd/runtime.js:*)"
---

Operation mapping: see `.asd/rules/providers.md`.

# ASD Stack

## Purpose

Create or edit `docs/architecture/stack.html` and its tech-reference docs, authored by the main orchestrator itself.

## Preconditions

```json
{"requires": [".asd/project/config.yaml exists", "docs/product/concept.html exists", "no active sprint required"], "else": "no config: run /asd-init first; no concept: run /asd-concept first"}
```

## Modes

```json
{"edit": "Phase 1 step 1", "fresh": "Phase 2 variant A|B|C", "reverse-engineered": "Phase 2 variant D"}
```

## Steps

Build the orchestrator bundle first and read it: `node .asd/runtime.js context --role orchestrator --phase stack --out <scratch-dir>/orchestrator-stack.context.md` (`agent-protocol.md` "Dispatch payload").

### Phase 1 — silent detection (NO asking)

Scan in order:
1. `docs/architecture/stack.html` exists, non-empty → mode = **edit**, skip to Edit-mode flow
2. Manifests / lockfiles / Dockerfile / CI configs detected → brownfield candidate (default variant D)
3. No code, no manifests → greenfield candidate (no default)
4. Continue to Phase 2

### Phase 2 — variant choice (only if Phase 1 did not route to edit)

Request user decision (a brownfield candidate defaults D):
- **A** — Clean slate, propose from the concept
- **B** — I have constraints (language, runtime, hosting, budget)
- **C** — Clear stack, will describe
- **D** — Brownfield, extract from existing code

### Phase 3 — flow per variant

Read `concept.html` first (vision, target users, value prop, declared constraints).

**A — clean slate**
- Delegate 2–3 candidate combinations per relevant section to `asd-researcher`; ask the user to pick or request alternatives.

**B — constrained**
- Request user input, multi-field one-shot: primary language, runtime/platform target (web / desktop / mobile / server / cli / embedded), hosting (cloud / self-host / local-only), budget tier (zero-cost / low / standard), each with "no preference"
- Delegate proposals within the constraints.

**C — clear stack**
- Collect the chosen stack. Delegate fit, conflict and gap analysis against the concept; ask the user to approve proposed defaults per `t_stack.html`.

**D — brownfield extraction**
- Extract from package.json / Cargo.toml / pyproject.toml / go.mod / Makefile / Dockerfile / CI configs; frontmatter `provenance: reverse-engineered`, `source: <primary manifest>`

### Phase 4 — convergence (universal across variants)

- Create mode only (file absent): write a skeleton per `t_stack.html` with placeholder sections first. Edit mode enters the loop against the existing file.
- Delegate verification of current versions and flag lagging or leading choices. Draft each section per `core.md` "Incremental writing".
  - Apply `checkpoints.md`: an adaptive pass only for already-authorized factual content; new or material stack direction stays a hard decision. Otherwise request **Lock in / Revise this section / Skip**.
  - Revise: collect feedback, rewrite in place, re-post. Skip: remove the section (heading and placeholder) from the file.
  - Next section per `t_stack.html` order.

### Phase 5 — knowledge gap analysis

Per technology compare the chosen version with the training cutoff: **LOW** predates it; **MEDIUM** close to it; **HIGH** released after it. For MEDIUM/HIGH, have the researcher check official release notes for breaking changes and deprecations, then record them in the tech reference.

### Phase 6 — tech-reference creation/update

Per technology create or update `docs/architecture/tech-reference/<tech>-<version>.md` per `t_tech-reference.md` and `artifact-layout.md` "Tech reference docs". Request user decision before each persistent write: approve | revise.

### Phase 7 — final artifact-level gate: stack.html

- The file already holds every locked-in section. Write-then-review-accept per `checkpoints.md` (delta summary includes the risk summary): `accept` advances, feedback revises in place (a feedback naming a section may re-enter Phase 4 for it)
- Feedback changing a tech entry or its version re-runs Phases 5-6 for the affected entries (per-tech approve micro-gate included) before the delta summary is re-posted and before COMPLETED
- emit COMPLETED

### Phase 8 — handoff

- Print: "Next: run `/asd-sprint` to start the first sprint". NO auto-dispatch

### Edit mode (Phase 1 routed here)

- Show the existing stack summary with a risk re-assessment (versions age); request user decision: multi-select sections to edit, or "refresh — re-verify all versions"
- Per chosen section enter Phase 4; Phases 5-8 as usual

## Rules

- Researcher dispatch and recovery: `design-principles.md` §11. Batch independent research.
- never: guess a version — always verify from external docs
- never: add tech speculatively — only when actively integrated; speculative additions belong in stack.html's own `#considered` section (`t_stack.html` "Considered / not adopted") or `.asd/project/stubs.md`, not the main stack list (ADRs are sprint-scoped and lost at archival)
- must: give every tech in stack a matching tech-reference doc before COMPLETED
- never: mix the multi-field and options request shapes in one request.

## Delegates

```json
{"agents": ["asd-researcher"], "skills": []}
```

## Outputs

```json
["docs/architecture/stack.html (created, edited, or reverse-engineered)", "docs/architecture/tech-reference/<tech>-<version>.md for every chosen tech"]
```

## Return

```
SKILL: asd-stack | MODE: <fresh|edit|reverse-engineered> | VARIANT: <A|B|C|D|edit> | TECHS: <count> | RISK: <low|medium|high> | STATUS: <complete|aborted> | NEXT: <suggested-skill-or-sprint>
```

## References

- `.asd/templates/t_stack.html` (required vs optional sections — SSoT)
- `.asd/templates/t_tech-reference.md`
- `.asd/rules/core.md`
- `.asd/rules/language-policy.md`
- `.asd/rules/artifact-layout.md` (stack.html path, tech-reference path, provenance)
