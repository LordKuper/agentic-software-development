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
