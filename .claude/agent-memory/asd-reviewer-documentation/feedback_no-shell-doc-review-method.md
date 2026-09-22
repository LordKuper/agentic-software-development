---
name: no-shell-doc-review-method
description: How documentation review runs in this framework repo - no shell, manifest-driven ledger vocabulary (emitter-produced, possibly split into parts, with a per-part .diff since sprint 015), and the defect shapes that actually pay off (acting-site scope contradicting the cited SSoT, partial mirror updates when a rule gains a trigger, sole-home claims wider than the code, authority bounds narrower than their only instance, a fix narrowing code while the file's second description of it stays wide, new failure branches missing from an exhaustive blocker list, a new record-and-carry rule bound only on its read side, new in-body `// ponytail:` comments in Node sources, README FAQ answers left stale by a new feature, and agent-memory claims stale at HEAD or contradicting the writer's definition)
metadata:
  type: feedback
---

Dispatches give no Bash. Since sprint 015 impl-review ships `<reviewer>[.part-N].diff` beside the manifest
(`emit-manifest --base/--head`) - read it, it IS the surface; the manifest file list is the only scope.
Without a diff: the sprint's `audit.md` "Gaps" and `plan.md` task lines cite `file:line` for changed lines.
The impl-test decisions-log entry often carries "Tester notes for impl-review" naming drift worth checking.
Ledger statuses, `n/a` predicates and `p`/`f` placement come off the dispatched manifest's
`vocabulary`/`n_a` fields, copied byte-identically; `review-policy.md` "Coverage ledger" is the shape rule
only. A scope above 25 files arrives as `documentation.part-N.manifest.json`, where every rule id carries
the out-of-part predicate - still review the part's files and mark `finding` (or `pass`) where this part
holds the evidence. Files-row vocabulary is `checked`/`n/a` with no `finding` status, so a file carrying a
finding is still `checked` and the finding id hangs off the rules row (one `f` per row: spread two findings
over the two rubric ids they best fit). Sha256 freshness (`upstream_hashes`) cannot be recomputed - say it
was corroborated structurally. Iter 2+: the decisions-log "impl fix for iter-NN: findings resolved" entry
names what changed; prior `reviews/` iterations stay unread - glob only the current `iter-NN/`, and scope
greps to canon (a grep over the sprint folder hits sibling reviewers' files).

**Why:** reviewers hold no command-runner grant on either provider (write scope: `review-policy.md`
"Gate Verdict Format"), and an invalid ledger is not a verdict - the phase rejects and re-dispatches.

**How to apply — the highest-yield checks in this repo:**
- **Acting-site scope vs cited SSoT.** A rule doc's branch and its binding in `.asd/workflows/asd-phase-*.md`
  must agree on *reach* and on quoted literals (015: scope step 3a's log line drops the SSoT's `<doc>`;
  the test only checks the substring). Read the step header, not only the bullet.
- **A rule gaining a second trigger/site leaves unnamed mirrors stale.** Grep the old attribution phrase
  across the whole phase's files - sibling steps AND the skill `description` (always-loaded, in no
  manifest). Valid under the change-surface exception (change made unchanged text wrong).
- **README FAQ vs a new feature.** A feature adding an exception to a stated invariant leaves the FAQ that
  asks exactly that question stale (015: per-sprint document skip vs "Can I skip PRD/UX-spec/ADR/C4 for a
  lean sprint?"). Grep README FAQ for the feature's question, not only tables and folder map.
- **Record-and-carry rules: check both sides.** When a rule says "iteration X records list L, next
  iteration reads L", find who writes L in every case the rule names. Anything keyed to "the reviewer's
  ledger" misses External Review, which returns no ledger.
- **Accepted flagged choices vs exhaustive lists.** A decisions-log "Accepted flagged choices" line that
  routes a new failure must land in the dispatching workflow's closed enumerations.
- **Sole-home claims wider than their home.** Check "lives only in X" against the code and grep for
  restatements. New facts added to both a rule's prose and `checkpoints.md`'s gate table are a common
  two-home duplication (015: cap-override request's `dispatches`).
- **Authority bounds narrower than their only instance.** A sanctioned writer's "limited to X" vs what the
  one script actually does. Read the code.
- **Fix narrows code, file's other description stays wide.** Grep the file header for every statement of it.
- **In-body `// ponytail:` comments in Node sources** (`tests/run.js`, `.asd/runtime.js`): the dev agents
  leave them; each is §7 high. Grep `^\s+// ` in changed files; in `tests/run.js` keep only hits inside
  tests named for the current sprint (013 run.js, 015 runtime.js `surfaceCheck`).
- Migration comments in `.asd/migrations/*.js` follow the `6.0.0.js` precedent (member docs carrying WHY);
  that style alone is not a §7 finding.
- **Agent-memory files are reviewable source** (`artifact-layout.md` "Agent memory"): verify durable claims
  against HEAD AND against the writer's own definition. A stale line in *your own* memory is corrected in
  the dispatch that finds it, not raised. A memory line is in Documentation economy's Reach.
- The documentation-economy preserve-list keeps per-case tables whole: a logically subsumed clause in a
  table row is not a cut candidate.
- The session-start AGENTS.md/CLAUDE.md snapshot in context can predate the branch's last sync - grep the
  file before raising managed-block drift.
- A sprint plan's accepted rewording (e.g. 015 C-4: "never compact mid-gate" → "write gate answer first",
  since host compaction is automatic) is not an AC violation; grep `plan.md` before raising.
