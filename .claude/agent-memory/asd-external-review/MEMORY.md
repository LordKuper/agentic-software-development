# Memory Index

- [Codex invocation mechanics](reference_codex-invocation.md) — stdout echoes payload, verdict at tail; no-disk heredoc+git-diff pipe pattern; foreground/bounded-timeout/stdout-only, never redirect to disk; self-hosting pathspec row
- [Bash tool command-length limit](reference_bash-tool-limits.md) — >~4.5 KB command = bogus quote-EOF error; keep prompt <=3 KB, codex reads template itself; merge stderr; quota error = skip
- [Scope-manifest transport](reference_scope-manifest-transport.md) — files[]-only prompt is cheap; canonical cache path and why preflight/failure-recording are the orchestrator's, not mine; quota-error handling; never redirect codex's stdout to disk
