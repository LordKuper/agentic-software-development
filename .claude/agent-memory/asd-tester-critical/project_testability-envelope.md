---
name: testability-envelope
description: What is and is not testable in the ASD framework repo, the two accepted test patterns for its mostly-documentation change surfaces, and the mutation/fixture/authoring traps that keep biting
metadata:
  type: project
---

In this repo (ASD framework source), almost every change is Markdown/YAML/JSON/HTML. `tests/run.js`
is the only runner and there is deliberately no documentation-content harness. Two patterns are the
accepted answer for a mostly-docs change surface:

1. **Explicit `none` decisions** in `test-plan.md` for prose/rule/template edits — first-class per
   `code-style.md` §17, not a gap. Building a doc-content test framework is an over-engineering
   finding, and a new test dependency trips the Simplicity Default.
2. **Static canon-consistency assertions inside `tests/run.js`** where a machine-checkable invariant
   exists across files (derive the value from its SSoT, assert every mirror). Precedents in-file:
   the retired-`asd-pm` canon scan, `upstream_hashes`/`canon_hashes` checks, and (added sprint 007)
   the `PHASE_CHAIN` ↔ skill/workflow bijection + ordered prose mirrors.

**Why:** the repo ships no application code, so the naive reading is "nothing is testable"; the real
line is executable Node (`sync.js`, `update.js`, `.asd/migrations/**`, `.asd/runtime.js`,
`.asd/hooks/**`) plus cross-file invariants that a regex can derive. Sprint 007's audit logged both
gaps that pattern 2 closes (G-11 chain mirrors, G-12 forward-only manifest check).

**How to apply:** during the strategy pass, split the change surface into executable vs prose. Give
executable changes real unit tests; give prose changes a `none` with its reason, unless the prose
encodes an ordered/enumerable invariant that mirrors an SSoT — then pattern 2 applies.

Two traps when proving these by mutation:
- A purely defensive guard may be unmutatable (e.g. `6.0.0.js`'s `ARCHIVE_DIR` skip is a no-op
  because the sprint listing is already non-recursive). Record the limitation instead of claiming
  a proof that did not happen.
- Any mutation of a file under `managed_paths` also fails the `upstream_hashes` test; that extra
  FAIL is expected noise, not signal — look for your own test's name in the output.

Two recurring impl-review findings against pattern 1, both seen in sprint 007:
- A **blanket `none`** covering several artefacts at once ("the rest is genuinely prose") is read as
  a completeness claim and gets rejected. Scope each `none` to one artefact and one named risk, and
  say what *would* make it assertable. A `none` whose own risk sentence describes a machine-checkable
  literal ("a workflow that never appends") is dishonest by construction.
- **Prose is not exempt just because it is prose**: a stable literal token repeated across a file set
  (a `NEXT:` target, a reference line, a phase-count word) is the same rung as any other static
  assertion — one substring check inside a loop that already reads those files. Prefer adding an
  assertion to an existing loop over adding a test; the suite count going *down* while coverage goes
  up is a good outcome here.

Third mutation trap: an assertion late in a multi-fixture test is only proven by a mutation that
leaves the earlier fixtures passing. Changing *which* key/branch the code touches (e.g. top-level
`delete` → recursive strip) reaches it; a wholesale pre-fix restore does not.

Fourth trap, on the *authoring* side: rule prose here routinely narrates the alternative it just
rejected inside the same bullet (`asd-phase-impl.md`'s fix-mode line explains why parallel rounds
were dropped). A bare keyword absence check (`!/parallel/i`) therefore goes red against unmutated
HEAD. Assert the absence of the specific *removed instruction phrases*, never of a topic word.

Fifth: an "at least one example without X" assertion (template conditionality) is only proven by a
mutation that adds X to **every** remaining block - a single-site edit leaves the claim true and the
mutation uncaught. Same family as the third trap: match the mutation to what the assertion claims.

Also durable: `runtime.js` `routeTask` takes a structured input object and contains **no plan-file
parser** - the `Material risk` extraction is the orchestrator's. Any proposed test of plan-grammar
routing "through route-task" is unfalsifiable by construction; record it as a checked-and-false
premise rather than writing a test that only proves a pure function is deterministic.

Sixth trap, on fixtures rather than mutations: a **backward-compatibility fixture built by calling the
function under test** is not a fixture. Sprint 009's legacy-manifest row stamped its digest with
`coverageManifestDigest` itself, so it tracked whatever that function did and stayed green straight
through the identity break it claimed to cover. Build a legacy artefact from the *untouched primitive*
the old code used (`runtime.fingerprint` + the old key handling), so it stays frozen at the old
behaviour when the current one changes.

Seventh: when generalizing a scoped assertion (one directory → a whole tree), check the tree first.
Widening the `asd-dev-critical/MEMORY.md` index-link test over all of `.claude/agent-memory/**` goes
red at HEAD on `asd-pm/MEMORY.md`'s dangling `feedback_flag-gate-semantics-before-applying.md` link —
pre-existing and outside any current change surface. Scope the loop to the directories the sprint
writes and record why in `test-plan.md`, rather than importing an out-of-scope failure.

Eighth: a precondition guard with no mutable source (a spawn that needs `git` on PATH) is provable by
**environment** instead: re-run the whole suite with `PATH` reduced to node's own directory. Three
external-CLI preflight tests fail alongside it — check which failures are yours before claiming a
test is the suite's only environment-dependent one.

Ninth, authoring style: `tests/run.js` gets reviewed against `code-style.md` §7, which forbids
in-body comments with no framework exemption — the ~60 pre-existing ones are not a licence, and new
ones draw a Documentation finding every time. Put the reasoning in the `assert` message; it is read
at the moment of failure, which a comment above the line is not.

Tenth, on re-pinning after a canon fix invalidates an assertion: pin the **relation between two sites**,
never a fresh literal on one of them. Sprint 009 iter-02 — `checkpoints.md` counts fix rounds by a tail
match while `asd-phase-impl.md` step 11 emits the whole heading; the durable check derives the emitted
literal from the workflow and asserts it *ends with* the tail read out of `checkpoints.md`, so either
side may be reworded freely as long as the counter still selects the emitter. String equality between
the two would have gone red on the correct fix, exactly as it did.

Eleventh, matching rule prose: key the locator to the sentence's **citation**, never its ordinal or
adverb. `sprint-lifecycle.md`'s latch-clearing route was renamed "A THIRD" → "A further" mid-sprint; a
`find` on the citation (`` `review-policy.md` "Late duplicate return" ``) survives that, an
ordinal-keyed one reddens on a correct edit. Same family as the fourth trap (assert removed instruction
phrases, not topic words).

Twelfth, worktree line endings: canon files here still sit CRLF in the worktree from before
`.gitattributes` (`* text=auto eol=lf`) landed, so `git checkout -- <file>` after a mutation
re-materialises that file as LF. Tracked content is unchanged (`git status` clean, index `i/lf`), but
"restored byte-for-byte" is only true of tracked content — say so rather than overclaiming, and expect
a `CRLF will be replaced by LF` warning when staging a file that was never checked out.

Thirteenth, mutation discipline under interruption (sprint 009 `F-5`): restore the mutated file in the
tool call immediately after reading the failure, never after "one more check" - a session limit between
mutate and restore leaves corrupted canon on disk, and the next dispatch inherits it as a diff it did
not author. Two things worth knowing when that happens. (1) The pair is self-revealing, not silent: an
added assertion plus the mutation it was aimed at makes the suite RED (the assertion fires), so a claim
that "the suite was green with the corrupted file" is worth re-checking by reproducing the exact byte
state rather than repeating. (2) The real exposure is at commit time, not suite time - the danger is a
round committed without reading the diff. On re-entry into someone else's unrestored work, re-derive
every assertion against source and re-run every proof: their outputs did not survive, and a proof you
did not run is not a proof you can record.

Fourteenth, fixtures whose *bytes* are the input: never commit one whose distinguishing bytes cannot
survive checkout. Sprint 009 shipped `demo-agent.crlf-bom.md` as the CRLF/BOM input; its blob carried
zero CR from day one and the CRLF came entirely from `core.autocrlf=true` converting on checkout, so
the same sprint’s `.gitattributes` (`* text=auto eol=lf`) made the test fail its own sanity assert on
every clean clone, at 170/171. Committing real CRLF bytes plus a `-text` override is the trap answer:
it re-breaks the `every tracked blob must be LF in the index` assertion AND makes
`git diff --cached --check` report trailing whitespace on every line. Build such an input in the test
body instead (read the clean fixture, hard-normalize to LF, re-expand, prepend the BOM, write under
`mkTempDir()`), and assert against doubled CRs so the construction is correct in a CRLF working tree
too.

**Why:** any assertion about the bytes on disk is really an assertion about checkout configuration
unless the test produces those bytes itself — and a suite run inside a stale working tree cannot see it.

**How to apply:** when a test opens with a "fixture sanity" assert about line endings, encoding or a
BOM, treat that as the signal and move the construction into the test. Verify with
`git show HEAD:<path> | od -c`, not by reading the worktree copy. Two corollaries: this is why a green
suite in a long-lived worktree is not evidence about a fresh clone, and mutating `normalizeText` to
prove such a test never reaches the output-equality assertion — CRLF and BOM each break the frontmatter
fence first, so record the thrown parse error as the first failure instead of claiming the assertion
you aimed at.
