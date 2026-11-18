---
name: owned-key-toggle-flip-back
description: A config toggle that makes sync write an owned key only when set: check what flipping it back does to the key already written
metadata:
  type: feedback
---

A setting that makes a generator (sync json-merge, a settings rewrite) add a key only under one value: trace the reverse flip. If the "off" render adds nothing and never removes the key the "on" render wrote, the old effect persists silently after the user flips back.

**Why:** "absent = default, no behaviour change" holds for a fresh project but not for one that was toggled; a suite assertion that pins "never removes the carried key" can hide the gap as intended behaviour.

**How to apply:** for each new owned key, ask whether the status check or render ever deletes it; if not, raise it against the AC's "no behaviour change" wording with a concrete removal rule (e.g. drop the key only while it equals the exact owned value) or a documented manual step. Related: [[fix-overcorrection-vs-ac]].
