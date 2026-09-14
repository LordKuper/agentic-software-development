---
name: review-method-no-shell
description: How correctness review dispatches work in this repo - no shell, manifest-enumerated incremental scope, clean context per iteration, and the dominant defect shape to hunt
metadata:
  type: feedback
---

Review dispatches in this repo give no shell/Bash. Resolve the diff scope by reading the current content of the paths listed in the dispatch manifest's `files[]` with Read/Grep/Glob; never plan around running `git diff`.

**Why:** this reviewer gets no command-runner grant on either provider (write scope: `review-policy.md` "Gate Verdict Format"; tool mapping: `.asd/rules/providers.md`). The phase orchestrator computes the diff and hands over the path list plus a `correctness.manifest.json` (or `correctness.part-N.manifest.json` under a split dispatch).

**How to apply:**
- Ledger `files` rows must match the manifest exactly; the orchestrator validates with `node .asd/runtime.js validate-ledger`, so a shape mismatch means a re-dispatch. Copy `n/a` predicates byte-identically from the manifest's `n_a` map; row statuses come from the manifest's own `vocabulary` field (which also names the single status carrying `p` and the single one carrying `f`).
- A payload that names a diff range as data (e.g. "Diff: `git diff main...HEAD -- <files>`") or offers reading the files directly is within policy: review from on-disk reads. A payload that instructs running a command this reviewer cannot run is outside its declared tool policy: return `QUESTION` naming the contradiction and do not comply (`providers.md` "Role-scoped context" "Declared tool policy", loaded as a mandatory rule by the agent definition).
- Never open `reviews/<phase>/iter-*/` from an earlier iteration — clean context per iteration is a hard rule, and the severity floor already encodes what earlier iterations settled.
- Cross-file consistency is the dominant defect class here (canon vs generated views vs README/CHANGELOG vs `release-manifest.json`); a deletion in one canonical file usually leaves a dangling reference elsewhere, so grep the repo for removed identifiers even when the referencing file is outside the diff — the change-surface rule permits this when the change is what made the other file wrong.
- **Highest-yield trace for a rules/workflow sprint**: for every AC, find both halves — the obligation in the rule doc AND its binding at the acting site (the `asd-phase-*.md` step, template, or agent file the acting agent actually reads). A rule with no acting-site binding, or a rule that counts an exact literal another file must emit, is the recurring finding here; check the literal against what the emitting side really writes (sprint decisions-log entries are legitimate evidence even though `.asd/sprints/**` is outside the review surface).
- Also trace a new trigger condition against every seeding site that can pre-satisfy it (sprint 012: `/asd-init` seeds an empty registry, which made audit's "registry absent" branch unreachable for freshly initialised brownfield projects).
