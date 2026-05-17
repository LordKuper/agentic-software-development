# Checkpoints

## Mandatory pauses (user approval required)

| After phase / event | Approves |
|---|---|
| scope | `sprint.md` |
| audit | `audit.md` |
| design (per artifact) | `prd.html`, then `ux-spec.html`, then `adr.html`, then `c4-full/` + `design-md-delta.yaml` |
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
