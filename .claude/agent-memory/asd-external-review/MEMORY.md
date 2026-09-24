# Memory Index

- [Codex invocation mechanics](reference_codex-invocation.md) — stdout echoes payload, verdict at tail; no-disk heredoc+scope-manifest pattern (git-diff pipe superseded); foreground/bounded-timeout/stdout-only, never redirect to disk; self-hosting pathspec row
- [Bash tool command-length limit](reference_bash-tool-limits.md) — >~4.5 KB command = bogus quote-EOF error; keep prompt <=3 KB, codex reads template itself; merge stderr; quota error = skip
- [Scope-manifest transport](reference_scope-manifest-transport.md) — current manifest fields (phase/iteration/wave/files[]/diff, no exclude_paths[]); diff is a real precomputed diff-file path read by the wrapped CLI itself, never bytes inline in the manifest; canonical cache path and why preflight/failure-recording are the orchestrator's, not mine; quota-error handling; never redirect codex's stdout to disk
