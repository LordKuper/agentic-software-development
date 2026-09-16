---
name: no-shell-doc-review-method
description: How documentation review runs in this framework repo - no shell, manifest-driven ledger vocabulary (emitter-produced, possibly split into parts), and the defect shapes that actually pay off (acting-site scope contradicting the cited SSoT, partial mirror updates when a rule gains a trigger, sole-home claims wider than the code, authority bounds narrower than their only instance, a fix narrowing code while the file's second description of it stays wide, new failure branches missing from an exhaustive blocker list, a new record-and-carry rule bound only on its read side, new in-body comments in tests/run.js, and agent-memory claims stale at HEAD or contradicting the writer's definition)
metadata:
  type: feedback
---

Dispatches give no Bash even when the payload says "diff under review: `git diff A...HEAD`". Resolve the
surface by reading the manifest's scoped paths with Read/Grep/Glob and say once that the diff was derived
from file reads. When the dispatch ships an `iteration.diff` file under `reviews/<phase>/iter-NN/`, read it -
it IS the surface. The sprint's `audit.md` "Gaps" names every pre-change reader as `file:line`, and `plan.md`
task lines cite the same - together they locate the changed lines without a diff. The impl-test
decisions-log entry often carries "Tester notes for impl-review" naming drift worth checking. Ledger statuses, `n/a`
predicates and `p`/`f` placement come off the dispatched
manifest's `vocabulary`/`n_a` fields, copied byte-identically; `review-policy.md` "Coverage ledger" is the
shape rule only. Since sprint 012 manifests come from `runtime.js emit-manifest`; a scope above 25 files
arrives as `documentation.part-N.manifest.json`, where every rule id carries the out-of-part predicate -
still review the part's files and mark `finding` (or `pass`) where this part holds the evidence.
Files-row vocabulary is `checked`/`n/a` with no `finding` status, so a file carrying a finding is still
`checked` and the finding id hangs off the rules row (one `f` per row: spread two findings over the two
rubric ids they best fit). Sha256 freshness (`upstream_hashes`) cannot be recomputed - say it was
corroborated structurally. Iter 2+ with no shell: the decisions-log "review-fix ... resolved" entry names
what changed; prior `reviews/` iterations stay unread.

**Why:** reviewers hold no command-runner grant on either provider (write scope: `review-policy.md`
"Gate Verdict Format"), and an invalid ledger is not a verdict - the phase rejects and re-dispatches.

**How to apply — the highest-yield checks in this repo:**
- **Acting-site scope vs cited SSoT.** A rule doc's branch and its binding in `.asd/workflows/asd-phase-*.md`
  must agree on *reach*, not just wording. Read the step header, not only the bullet: a header that narrows
  scope silently swallows the branches under it. Resolved shape since 009 (both review workflows' step
  7a/8a): the header carries no reach and each branch states its own; `tests/run.js` pins it.
- **A rule gaining a second trigger/site leaves unnamed mirrors stale.** Grep the old attribution phrase
  across the whole phase's files - sibling steps AND the skill `description` (always-loaded, in no
  manifest). Valid under the change-surface exception (change made unchanged text wrong).
- **Record-and-carry rules: check both sides.** When a rule says "iteration X records list L, next
  iteration reads L", tests usually pin only the read. Find who writes L in every case the rule names -
  sprint 014: External Review skip's `Unreviewed files` had no writer and step 1b skipped the scope work.
- **Accepted flagged choices vs exhaustive lists.** A decisions-log "Accepted flagged choices" line that
  routes a new failure ("... → `FAILED` → phase blocker") must land in canon. Check the dispatching
  workflow's closed enumerations ("A blocker is exactly one of", "The only reasons ... contacts the user")
  - sprint 012 iter-03 found `asd-init` sprint-mediated `FAILED` absent from `asd-phase-impl.md`'s.
- **Sole-home claims wider than their home.** When a sprint moves content into code (012: n/a predicates
  into `runtime.js`), the new "lives only in X" sentence tends to claim more than X holds while the same
  rule doc still restates the rest. Check the claim against the code and grep for restatements - e.g.
  quoted `` `n/a: <predicate>` `` literals in canon (deliberate, pinned by a test) falsify "predicate text
  lives only in runtime.js".
- **Authority bounds narrower than their only instance.** The mirror image: a sprint sanctioning a new
  writer names a limit ("limited to X") and the one script it sanctions does more than X. Sprint 013:
  `core.md`/`t_AGENTS.md`/`asd-update` bound release migrations to "key renames and removals" while
  `9.0.0.js` also rewrites surviving keys' values, inserts keys and rewords shipped comments. Read the code.
- **Fix narrows code, file's other description stays wide.** When a review fix deletes behaviour to fit a
  bound (013 iter-02: `9.0.0.js` dropped three shipped-comment mappings), the same file's header often
  describes that behaviour a second time in its old reach. Grep the header for every statement of it.
- **In-body comments in `tests/run.js`.** It holds dozens of pre-existing in-body `//` comments, out of
  surface. Without a diff, find the new ones by grepping `^\s{2,}//` and keeping only hits inside tests named
  for the current sprint (`sprint-NNN`) - 013 found a `// ponytail:` note there (§7, high).
- Migration comments in `.asd/migrations/*.js` follow the `6.0.0.js` precedent (member docs carrying WHY,
  "Temp file plus rename: ..."); that style alone is not a §7 finding.
- **Agent-memory files are reviewable source** (`artifact-layout.md` "Agent memory"): verify durable claims
  against HEAD (exported helpers, CLI exit behaviour, manifest reach, `MEMORY.md` links) AND against the
  writer's own definition - sprint 012 reviewer memories told the agent to proceed silently on an
  out-of-policy payload instruction where `providers.md` "Declared tool policy" requires `QUESTION`.
  A stale line in *your own* memory is corrected in the dispatch that finds it, not raised.
  Documentation economy's Reach ("every artifact a later agent reads") states no agent-memory exclusion,
  and "Agent memory" gives the same re-paid-per-dispatch cost: a memory line is in reach, judged by the
  economy tests, citing that Reach wording.
- The documentation-economy preserve-list keeps per-case tables whole: a logically subsumed clause in a
  table row is not a cut candidate.
- The session-start AGENTS.md/CLAUDE.md snapshot in context can predate the branch's last sync - grep the
  file before raising managed-block drift.
