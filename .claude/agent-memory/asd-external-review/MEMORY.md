# Memory Index

- [Codex invocation mechanics](reference_codex-invocation.md) — prompt-only stdin from the scratch prompt file; stdout echoes payload, verdict at tail; foreground, 600000 ms, stdout-only
- [Bash tool command-length limit](reference_bash-tool-limits.md) — long commands (~3-9 KB) fail with bogus quote-EOF error; prompt goes by file, never inline; merge stderr
- [Scope-manifest transport](reference_scope-manifest-transport.md) — emit-manifest writes external.scope.json, prompt names its path; wrapped CLI reads files[]/diff itself; cache/failure recording are the orchestrator's; quota handling
