---
name: warning-remedy-trace
description: a warning that names a repair command ("run /asd-sync", "restore it from git") - trace whether that command really repairs the reported state
metadata:
  type: feedback
---

When a failure warning tells the user to run a command as the remedy, trace that command's code path on the exact post-failure state, and check whether the remedy applies to every file the warning can name.

**Why:** a recording step that runs after a successful write can fail, and the warning then sends the user to the normal writer. That writer can treat the value as already in place and the user's own (a value-equality "written keys" filter), so it records nothing. The remedy does nothing. "Restore it from git" also cannot help an untracked file. An open() failure that happens before truncation makes the restore fail too, so an intact file is reported as damaged.

**How to apply:** for each warning that carries a remedy, set up the state after the failure, walk through the remedy command, and ask whether it changes that state. Rate the result by the floor. A wrong remedy is usually medium or high, not critical. Related: [[owned-key-toggle-flip-back]].
