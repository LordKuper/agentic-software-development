---
name: fail-first-and-none-honesty
description: This repo's testing reviewer rejects fail-first records that name the wrong assertion, and `none` decisions whose stated reason is falsifiable
metadata:
  type: feedback
---

Two things the `impl-review` testing reviewer checks hard in `test-plan.md`, and has raised findings on.

## A fail-first record names the assertion that fires FIRST

Transcribe it from the actual runner output, not from the assertion the mutation was aimed at. A guard
assert placed earlier in the same test body will pre-empt the one you meant to prove; if you want the
later one credited, find a mutation that reaches it (e.g. to prove a chain↔files bijection, add an
orphan file rather than deleting the chain entry, which trips the earlier `must be in the chain` guard).

**Why:** a reader who trusts a wrong record deletes the assertion it names, believing that one carries
the proof, and keeps a test whose actual guard is gone.

**How to apply:** run every mutation — procedure in [[testability-envelope]] "Mutate, run, restore —
one bash call" — and paste the assertion message from the FAIL output into the record. Re-derive
records on re-entry: a dev fix commit can rewrite the implementation out from under an entry-1
mutation.

## A `none` decision needs a reason that survives inspection

"It's prose interpreted at runtime, no executable surface" is false for anything that is a literal
token in a tracked file (`NEXT: retro`, an ordered arrow chain, a phase-table row, a count word). If
the suite already asserts one such mirror, every comparable one is on the same rung and costs a regex.

"No file restates it, so there is no drift surface to assert" is the other false reason: for a
single-home rule bullet the live risk is deletion, not drift. Sprint 010 entry 1 recorded `none` on
that ground and the testing reviewer routed it back (T-2). A bullet nothing mirrors is exactly the one
nothing pins, and this framework's own economy rule makes deleting unpinned prose an obligation. Two
`assert.ok`s on the rule text, appended to a test that already reads that file, cost nothing and settle
it. Before accepting a no-mirror argument, check whether the preserve-list (or whatever the local
keep-rule is) actually covers that text's class — a procedural instruction is not a contract token, an
enumeration, a case distinction or a stated failure mode, so nothing protects it.

**Why:** TST-01/TST-03 in sprint 007 — the `none` reason was contradicted by assertions the same test
plan had already written.

**How to apply:** before recording `none`, ask whether the thing is a literal token derivable from
something the suite already reads. Reserve `none` for genuine agent-runtime judgement, rendered
appearance, and items owned by a later phase — and for those, name the owner.
