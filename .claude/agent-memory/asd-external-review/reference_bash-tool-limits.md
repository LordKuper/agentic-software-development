---
name: bash-tool-command-length-limit
description: Bash tool rejects long commands (observed ~3-9 KB, heredoc bodies included) with a bogus "unexpected EOF while looking for matching quote" parse error before anything runs; size, not quoting; under Claude Code the rendered prompt goes by file, never inline; always merge stderr
metadata:
  type: reference
---

The Bash tool has a hard limit on total command text: a heredoc-bearing command of ~9 KB fails with `unexpected EOF while looking for matching ...` (reported line number varies) BEFORE anything executes; the same shape at ~3 KB passes; 9 KB of benign filler lines fails too, so it is size, not quoting. `run_in_background` and `dangerouslyDisableSandbox` change nothing. Observed threshold lies between ~3 KB and ~9 KB.

**How to apply:** under Claude Code the wrapped-CLI command stays short: `codex exec ... - < <prompt file> 2>&1`, the rendered prompt written by file-write (canon: `external-review.md` "OS-specific invocation"). Never inline the prompt, template or manifest in a heredoc or here-string on this host. If this parse error appears, content was inlined: move it to the prompt file, do not trim the prompt.

Always merge stderr with `2>&1` on the codex call: codex prints its quota error to stderr after echoing the payload, and `2>/dev/null` hides it (empty result). A quota error is not transient: one retry, then return `external review interrupted: quota exhausted` (never an availability skip after invocation; see `external-review.md` "Outcome contract"). See [[codex-invocation-mechanics]].
