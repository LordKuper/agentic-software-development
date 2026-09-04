---
name: bash-tool-command-length-limit
description: Bash tool rejects long commands (~>4.5 KB, incl. heredoc body) with a bogus "unexpected EOF while looking for matching `''" parse error before anything runs; keep the inline codex prompt <=3 KB and have codex read the template file itself; always merge stderr (2>&1) so a codex quota error is visible
metadata:
  type: reference
---

Bash tool hard limit on total command text (verified 2026-09-04): a heredoc-bearing command of ~9 KB fails with `/usr/bin/bash: -c: line N: unexpected EOF while looking for matching `''` (N varies: 1 or 34) BEFORE the command executes; the same shape at ~3 KB passes; 9 KB of benign `aaaa` lines fails too, so it is size, not quoting. `run_in_background` and `dangerouslyDisableSandbox` change nothing. Threshold is somewhere between 3.1 KB and 9 KB — stay <=3 KB to be safe.

**How to apply:** never inline the full `t_prompt-external-impl.md` rubric in the command. Compact prompt pattern that works (~2.9 KB): "FIRST read .asd/templates/external-review/t_prompt-external-impl.md and follow its Inputs/Anti-nitpick/rubric/verdict format exactly" + slot values + framework-mode scope note + 6 seeded checks + output tail. The 390 KB diff payload is `cat`-ed from the dispatcher's pre-written scratchpad file (or live `git diff`) inside the same `{ ...; } | codex exec --sandbox read-only -` pipe, so it never counts toward command length. Bisect a failing command by piping the heredoc to `wc -c` instead of codex.

Also: `2>/dev/null` on the codex pipe hid the failure entirely (empty result) — codex prints its quota error `ERROR: You've hit your usage limit ... try again at <date>` to stderr after echoing the payload. Always use `2>&1 | tail -c 14000` so the tail of the merged stream shows either the verdict or the error. A quota error is NOT transient (reset date days away) — one retry then skip + decisions-log line, verdict per agent contract (APPROVE with explicit "external review skipped" note), signal REVIEW_DONE; never fabricate findings. See [[codex-invocation-mechanics]].
