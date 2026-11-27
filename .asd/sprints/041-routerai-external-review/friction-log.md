---
responsibility:
  owns: workflow friction in sprint 041
  delegates_to: retrospective.html
---

# Friction log

## F-1 — Combined review manifest omitted self-hosting mode

- **Phase**: impl-review
- **Surface**: review manifest emission
- **What happened**: The orchestrator emitted the Combined manifest without `--self-hosting`; the reviewer detected the incorrect framework rubric exclusion before a verdict.
- **Impact**: One dispatch interrupted; manifest regenerated and reviewer dispatched fresh.
- **Resolution**: Re-emitted with `--self-hosting` and the required base reference.

## F-2 — External review account on hold

- **Phase**: impl-review
- **Surface**: external reviewer CLI
- **What happened**: The configured Claude CLI returned an explicit account-hold denial despite local readiness.
- **Impact**: External review was skipped for all 32 scope files in wave-1/iter-01.
- **Resolution**: Recorded the account-hold status and full unreviewed scope without retrying.

## F-3 — Compact sprint reviews block rejected

- **Phase**: impl-review
- **Surface**: sprint state and verdict persistence
- **What happened**: The initial sprint state used a valid but compact reviews object that `record-verdicts` does not accept.
- **Impact**: Verdict persistence required a formatting-only correction.
- **Resolution**: Re-rendered the reviews block in the expected multiline shape and persisted both verdicts.
