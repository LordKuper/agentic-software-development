---
name: v8-json-error-leak-markers
description: a "no file text leaks" test asserting a long marker is absent from a JSON.parse error message is weak - V8 truncates error context to ~10 chars each side for input >= 21 chars
metadata:
  type: feedback
---

When a test proves "no content of file X reaches the output" by asserting a long marker string is absent, and the leak path is a `JSON.parse` error message, the absence check can never go red. V8 quotes the whole input only when it is under 21 chars; above that it shows about ±10 chars around the error position, so only a fragment of a long marker leaks.

**Why:** seen on a linked-ledger invalid-JSON test. The test was red on revert only through a second conjunct (`stderr.endsWith(warning)`).

**How to apply:** check which conjunct actually makes a leak test red on revert (see [[conjunctive-guard-tests]]). Suggest a marker under 10 chars placed at the error position, or asserting on the exact stderr. Below a critical floor this is only a note.
