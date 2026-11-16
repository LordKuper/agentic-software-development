---
name: refusal-tests-need-valid-control
description: a "bad input exits non-zero and writes nothing" test passes vacuously on the pre-fix tree where the command does not exist; add a valid-call control and per-case stderr regexes
metadata:
  type: feedback
---

A refusal test (bad input, non-zero exit, file untouched) is satisfied by an unknown command too, so its fail-first run on the pre-fix tree comes back green.

**Why:** the pre-fix archive run showed 1 of 12 new tests passing; an unknown subcommand also exits non-zero with a message and touches nothing.

**How to apply:** start such a test with a valid call that must exit 0, and pin each case's stderr to the command's own refusal text (a flag name or the message stem), then rerun the pre-fix archive and confirm it goes red.
