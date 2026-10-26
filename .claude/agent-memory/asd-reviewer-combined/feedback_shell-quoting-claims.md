---
name: shell-quoting-claims
description: A canon rule claiming a quoted string is safe in both bash and PowerShell — check PowerShell's typographic quotes (U+201C/U+201D/U+201E act as ")
metadata:
  type: feedback
---

When canon or a tech-reference states a character-stripping rule that makes interpolated text "safe" in bash and PowerShell, check the stripped set against both shells: PowerShell treats typographic double quotes “ ” „ (U+201C, U+201D, U+201E) as `"` (Microsoft `about_Quoting_Rules`), and backtick and `$` expand in its double-quoted strings; bash needs backtick, `$`, `"`, `\` (`!` only in interactive shells).

**Why:** Codex on Windows runs PowerShell; consumer-derived text (e.g. a guardrail in a non-English docs language) can carry typographic quotes the ASCII-only strip list misses, ending the string early.

**How to apply:** raise as medium at the rule's line, fix = add the typographic quotes to the removed set. Related: [[new-command-vs-skill-grant]].
