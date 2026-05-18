# Checkpoints

## Mandatory pauses (user approval required)

Every pause is a HARD gate: the responsible agent MUST call `AskUserQuestion` and receive an explicit `approve` (or equivalent discrete option) BEFORE writing the gated artefact or advancing phase. Inferring approval from the user's earlier free-text — including the original sprint request — is forbidden. Batching "produce + write + advance" into a single turn without the intermediate `AskUserQuestion` is a protocol violation; the agent MUST emit `FAILED` and halt if it notices itself doing so.

| After phase / event | Approves | Gate position |
|---|---|---|
| scope | `sprint.md` | BEFORE writing `sprint.md` / `state.json` — refined scope is presented in chat first |
| audit | `audit.md` | BEFORE advancing to `design` |
| design (per artifact) | `prd.html`, then design-system gate (existence of `design/ux/DESIGN.md` + `design-system.html` + `accessibility.html`; missing → `/asd-design-system`), then `ux-spec.html` (with inline per-entry approval for any `design-md-delta.yaml` addition), then `adr.html`, then `c4-full/` |
| design-review (final) | reviewer verdicts before promotion |
| design-promote (decomposition) | proposed per-subsystem split |
| design-promote (new subsystem) | each new subsystem before C4 registry update |
| design-promote (final mutation) | final write to persistent `design/` |
| plan | `plan.md` |
| impl assessment | impl summary before `impl-review` starts |
| impl-review (final) | reviewer verdict before `pr` phase |
| pr | confirms PR opening |

## Pause message format

Every pause uses the user-decision format from `core.md`:

```
Problem: <one sentence>
Options:
  A. <option>
  B. <option>
  C. <option>
Recommended: <A|B|C> — <reason>
Consequences:
  A. <impact>
  B. <impact>
  C. <impact>
```

Use AskUserQuestion when options are discrete. Free-form approval (`approve / request changes / reject`) is acceptable for artifact reviews.

## Approval recording

Approval advances `phase` in `state.json` and appends a decisions-log entry. No frontmatter status field.

## Precondition chain

```
audit          requires sprint.md
design         requires audit.md
design-review  requires design drafts COMPLETED signal
design-promote requires design-review DoD met
plan           requires design-promote done (persistent docs updated)
impl           requires plan.md
impl-review    requires impl COMPLETED signal
pr             requires impl-review DoD met
```

## Skill auto-abort

If a phase skill detects a missing or unapproved predecessor, it MUST emit:

```
ABORT — precondition not met: <missing artifact>
```

and stop. No silent fallback. PM presents the gap to the user.

## Re-running a phase

User may instruct re-run of a completed phase. The corresponding phase skill re-runs, downstream artifacts are invalidated, `state.json.phase` resets. Decisions-log records the reset.
