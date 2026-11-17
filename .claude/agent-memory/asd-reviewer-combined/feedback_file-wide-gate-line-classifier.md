---
name: file-wide-gate-line-classifier
description: A per-line classifier gated by a condition computed over the whole file's change can let an unrelated hunk switch the gate on; trace the exact regex before choosing the counterexample
metadata:
  type: feedback
---

When a review-fix narrows a per-line heuristic with a condition computed across every changed line of a file (e.g. "some line opens or closes a block comment" licensing `*`-led lines as comment bodies), check whether the gating line and the misread line can sit in unrelated hunks or sides. The caller often flattens hunks before the classifier sees them.

**Why:** a fix like this closes only the reported variant (no gate line at all). The unsafe case survives whenever any other line in the file trips the gate, and a self-closed one-line comment counts too.

**How to apply:** read the exact predicate regexes before picking the counterexample. For example, `^\*(?:[\s/]|$)` rejects `*p` and `*gen()`, but leading-operator continuations such as `  * height;` still pass. Suggest a gate scoped to the contiguous run on the same hunk side, plus one assert pairing an unrelated gate line with the misread line. Related: [[conjunctive-guard-tests]], [[fix-overcorrection-vs-ac]].
