---
name: relocation-review-method
description: how to check a rule-relocation wave (sections moved out of a rule doc into workflows) without a shell, and the path-map check a new resolution table needs
metadata:
  type: feedback
---

A meaning-preserving relocation wave is checked removed-hunk by removed-hunk: Grep one distinctive phrase per removed
paragraph in its claimed new home at HEAD, not a full read of every home.

**Why:** with no shell, `main` versions of files outside the wave's diff cannot be read; the diff's `-` lines are the
only baseline, and the audit's Gaps/occurrence lists are the only record of out-of-wave baseline prose.

**How to apply:**
- Per removed section, Grep 3-6 distinctive phrases (`-o`, alternation) in the target workflow; read only the hits
  that come back missing (a phrase can be reworded, e.g. "user-approved FAIL" became "FAIL findings the user accepted").
- A new single-home table that hardcodes persistent paths (an inputs/resolution table) is checked against
  `artifact-layout.md` both path maps, decomposition enabled AND "Paths (decomposition disabled)"; the flat variant is the
  usual omission.
- Related: [[large-diff-read-budget]], [[rereview-no-shell-checks]].
