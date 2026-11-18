---
name: owned-key-toggle-flip-back
description: A config toggle that makes sync write an owned key only when set: check what flipping it back does, whether the release can tell its own value from a hand-set one, and whether every writer of the value records ownership
metadata:
  type: feedback
---

A setting that makes a generator (sync json-merge, a settings rewrite) add a key only under one value: trace the reverse flip. If the "off" render adds nothing and never removes the key the "on" render wrote, the old effect persists silently after the user flips back.

**Why:** "absent = default, no behaviour change" holds for a fresh project but not for one that was toggled; a suite assertion that pins "never removes the carried key" can hide the gap as intended behaviour. The opposite fix has its own trap: a release rule "drop the key while it equals the owned value" also drops a user's hand-set identical value (e.g. Claude Code's documented `attribution` off value) in every project on the default, a behaviour change for projects that never toggled.

**How to apply:** for each new owned key, ask whether the status check or render ever deletes it. Suggest a removal rule keyed on recorded ownership (the generator's state file noting it wrote the key), never on value equality alone; when reviewing a value-equality release, test it against a project on the default that hand-set exactly the owned value. Once ownership is recorded, list every other writer of the owned value (a runtime check inserting "the value sync renders"): a writer that does not record it leaves a value no flip-back releases. Related: [[fix-overcorrection-vs-ac]], [[conjunctive-guard-tests]].
