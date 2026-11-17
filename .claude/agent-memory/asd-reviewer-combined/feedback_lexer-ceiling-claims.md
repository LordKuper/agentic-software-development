---
name: lexer-ceiling-claims
description: a hand-written comment/string lexer whose doc names a "safe-direction" ceiling - trace regex literals and multi-line non-backtick strings through it before accepting the claim
metadata:
  type: feedback
---

A hand-rolled lexer that classifies lines as comment or code often documents its limit as safe ("code may be read as a string, a string is never read as a comment"). Test the claim by tracing inputs, not by reading it.

**Why:** a c-family lexer that resets `'`/`"` strings at end of line and opens a block at any `/*` in code state reads `s.replace(/\/*$/, '')` as a block opener, so every later code line up to the next `*/` becomes "comment-only". Multi-line strings legal in Kotlin, Java text blocks, PHP, Rust, Swift, C# and C++ raw strings get their content lines lexed as code, so a `//` or `/*` there reads as a comment. Both are the unsafe direction.

**How to apply:**
- Trace at least: a regex holding `\/*`, a regex holding a quote or backtick, a `"""` text block with a `//` line, an unclosed `/*` inside such a string.
- A fix that stays cheap: stop marking at the first construct that crosses a line end in a way the lexer cannot follow (unterminated `'`/`"`, a block opened after code on its line); later lines count as code.
- Even with that stop rule, same-line misreads remain: `//` in a regex class `/[//]/`, scss unquoted `url(//cdn/x)`, `#` lines in a shell heredoc, a comment gluing tokens (`a/**/b` vs `ab` under projection equality). These are edge wrong-behaviour (high at most), so they drop under a `critical` floor; rate them before listing.
- Related: [[fix-overcorrection-vs-ac]].
