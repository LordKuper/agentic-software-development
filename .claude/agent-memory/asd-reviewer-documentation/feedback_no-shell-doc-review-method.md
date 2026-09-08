---
name: no-shell-doc-review-method
description: How documentation review runs in this framework repo - no shell, manifest-driven ledger vocabulary, and the two defect shapes that actually pay off (acting-site scope contradicting the cited SSoT, and agent-memory claims stale at HEAD)
metadata:
  type: feedback
---

Dispatches give no Bash even when the payload says "diff under review: `git diff A...HEAD`". Resolve the
surface by reading the manifest's scoped paths with Read/Grep/Glob and say once that the diff was derived
from file reads. Ledger statuses, `n/a` predicates and `p`/`f` placement come off the dispatched
`documentation.manifest.json` `vocabulary`/`n_a` fields, copied byte-identically; `review-policy.md`
"Coverage ledger" is the shape rule only. Files-row vocabulary here is `checked`/`n/a` with no `finding`
status, so a file carrying a finding is still `checked` and the finding id hangs off the rules row.

**Why:** reviewers hold no command-runner grant on either provider (write scope: `review-policy.md`
"Gate Verdict Format"), and an invalid ledger is not a verdict - the phase rejects and re-dispatches.

**How to apply — the two highest-yield checks in this repo:**
- **Acting-site scope vs cited SSoT.** A rule doc's branch and its binding in `.asd/workflows/asd-phase-*.md`
  must agree on *reach*, not just wording. The recurring defect is a new sub-bullet dropped under a step
  whose header narrows scope (e.g. "internal reviewers only") while the cited rule states a wider reach -
  the citation reads fine in isolation and the orchestrator still acts on the narrower header. Read the
  step header, not only the bullet.
- **Agent-memory files are reviewable source** (`artifact-layout.md` "Agent memory"): a false line is paid
  on every dispatch of that agent. Verify durable claims against HEAD - exported helpers
  (`sync.sha256Hex`/`readNormalized`), CLI exit behaviour (bare `--apply` exits 1, writes nothing),
  manifest reach (`canon_hashes` = agents + skills only; `managed_paths` excludes `tests/run.js`), and
  index links in each `MEMORY.md` resolving to a real file.
- Assertion messages in `tests/run.js` are prose that can drift from canon (one currently quotes a
  decisions-log literal the workflow does not emit verbatim). Cheap to check, usually low severity.
