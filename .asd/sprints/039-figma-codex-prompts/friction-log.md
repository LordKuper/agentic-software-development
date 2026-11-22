# Friction log

## F-1 — Combined review manifest lacked the framework flag

- **Phase**: impl-review
- **Surface**: internal review dispatch
- **What happened**: The first combined manifest omitted `--self-hosting`, which gated its framework-consistency rubric out. The reviewer spotted the mismatch before returning a verdict.
- **Impact**: Interrupted one dispatch and regenerated the manifest before a fresh review.
- **Refs**: reviews/impl/wave-1/iter-01/combined.manifest.json and timing.jsonl.

## F-2 — External review confused the wrapper host with the wrapped CLI

- **Phase**: impl-review
- **Surface**: external-review dispatch
- **What happened**: The first wrapper dispatch looked for a Claude Code Bash timeout setting even though its host was Codex on Windows. It aborted before invoking the selected Claude CLI.
- **Impact**: Re-dispatched with the Codex PowerShell route and explicit foreground deadline.
- **Refs**: decisions-log.md and timing.jsonl.

## F-3 — Wrapped Claude review account was on hold

- **Phase**: impl-review
- **Surface**: external-review provider authentication
- **What happened**: Local preflight was ready, but both actual wrapped invocations exited before reporting a review because the Claude account was on hold.
- **Impact**: External review was skipped after the configured negative cache was recorded.
- **Refs**: reviews/impl/wave-1/iter-01/external.md.

## F-4 — External review remained unavailable at the next iteration

- **Phase**: impl-review
- **Surface**: external-review provider availability
- **What happened**: Preflight reused the current authentication failure record in iteration 2.
- **Impact**: External review remained unavailable for the carried scope and the review-fix delta.
- **Refs**: reviews/impl/wave-1/iter-02/external.md.

## F-5 — External review was unavailable for the recovery fixes

- **Phase**: impl-review
- **Surface**: external-review provider availability
- **What happened**: Iteration 3 preflight returned the same cached authentication failure.
- **Impact**: The recovery-fix delta and prior scope were carried as unreviewed by the external provider.
- **Refs**: reviews/impl/wave-1/iter-03/external.md.

## F-6 — External review remained unavailable after the partial-recovery fixes

- **Phase**: impl-review
- **Surface**: external-review provider availability
- **What happened**: Iteration 4 preflight returned the same cached authentication failure.
- **Impact**: The carried scope and latest changes remained unreviewed by the external provider.
- **Refs**: reviews/impl/wave-1/iter-04/external.md.

## F-7 — External review remained unavailable for the review-order change

- **Phase**: impl-review
- **Surface**: external-review provider availability
- **What happened**: Iteration 5 preflight retained the cached authentication failure.
- **Impact**: The carried scope and review-order changes remained externally unreviewed.
- **Refs**: reviews/impl/wave-1/iter-05/external.md.

## F-8 — Terminal Git routing check lost its ownership configuration

- **Phase**: impl-review
- **Surface**: terminal suite, runtime-routing area outside the last impacted selection
- **What happened**: The runner did not pass the process-scoped Git configuration into the Node invocation. A Git attribute assertion failed at repository discovery.
- **Impact**: Required a corrected terminal run. The routing assertion passed with the configuration inherited unchanged.
- **Refs**: test-plan.md Suite run and terminal triage evidence.

## F-9 — Terminal timing check lost the same ownership configuration

- **Phase**: impl-review
- **Surface**: terminal suite, runtime-timing area outside the last impacted selection
- **What happened**: The timing assertion's child Git command encountered the same process configuration gap as F-8.
- **Impact**: Required a corrected terminal run. The timing assertion passed unchanged with the configuration inherited.
- **Refs**: test-plan.md Suite run and terminal triage evidence.

## F-10 — Windows denied the migration fixture's file symlink

- **Phase**: impl-review
- **Surface**: terminal suite, migrations area outside the last impacted selection
- **What happened**: The existing PM migration fixture could not create its external file link in the non-elevated Windows process.
- **Impact**: The migration assertion could not run until the fixture used a Windows junction to the same external file.
- **Refs**: test-plan.md terminal triage evidence.
