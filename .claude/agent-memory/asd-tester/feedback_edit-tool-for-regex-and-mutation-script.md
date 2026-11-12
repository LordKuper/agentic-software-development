---
name: edit-tool-for-regex-and-mutation-script
description: backslashes in Bash-tool node/sed scripts are halved, so edit regex-bearing test code with the Edit tool; prove fail-first with a restoring mutation script
metadata:
  type: feedback
---

Edit `tests/run.js` lines that hold regex literals or `\n`/`\b` escapes with the Edit tool, never a heredoc `node -e`/script rewrite. The Bash tool halves backslashes in script text, so a `rep(find, replace)` helper reports "count 0" or silently writes a different regex.

**Why:** a find string with `\\b` or `\\s` never matched the file; the same edit through the Edit tool applied cleanly and kept LF endings.

**How to apply:** use a scripted rewrite only for backslash-free substitutions. For a mutation proof, keep one small script outside the repo that takes file, find, replace and a `--filter` name, applies the mutation, runs the filtered suite, prints exit code, matched count and the FAIL/ok lines, and restores the file in a `finally` — then confirm `git status` shows no canon file modified. Build a find string that contains a backslash from `String.fromCharCode(92)`.

Related: [[feedback_universal-reach-sweeps]].
