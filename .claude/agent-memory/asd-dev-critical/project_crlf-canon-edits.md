---
name: crlf-canon-edits
description: Canon files here are CRLF in the worktree but LF in git; a scripted literal edit that eats only the LF leaves a lone CR, which makes git show the whole file as rewritten and fails git diff --check
metadata:
  type: project
---

`.asd/**` markdown is checked out CRLF (`core.autocrlf=true`, index is LF). A scripted literal replacement whose search string *starts* with `\n` matches only the LF half of a `\r\n`, so deleting a whole line leaves a stray `\r` behind.

**Why:** git skips CRLF→LF normalization for a file containing a lone CR, so that one orphan byte turns a two-line edit into a whole-file rewrite in `git diff` and makes `git diff --check` flag trailing whitespace on every line — hiding the real change from the reviewer and from the per-commit history the `pr` phase relies on.

**How to apply:**
- Deleting a line by script: anchor the search string on `\r?\n` (or the full `\r\n`), never a bare `\n`; afterwards check `(content.match(/\r(?!\n)/g) || []).length === 0`.
- Sanity-check every scripted edit with `git diff --numstat` — a line count far larger than the edit means a line-ending problem, not a content problem.
- `git diff --check` must be clean before committing; a wall of "trailing whitespace" on untouched lines is this bug, not real whitespace.
- Writing a file with plain LF is harmless (git stores LF anyway) — only *mixed* endings inside one file break normalization.
- Related: [[sync-apply-ledger-gotcha]] for the ledger refresh the same canon edit needs.
