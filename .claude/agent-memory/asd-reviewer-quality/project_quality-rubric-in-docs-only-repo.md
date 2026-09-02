---
name: quality-rubric-in-docs-only-repo
description: How the Quality bug/security/contract rubric maps onto this Markdown-only framework repo, plus known non-findings not to re-raise
metadata:
  type: project
---

In this repo the "code" under impl-review is Markdown specs (rules, skills, workflows) plus JSON/JS. The rubric still applies, but translated:

- **Bugs** → spec-execution defects: a loop-back path that skips a derivation step it depended on (final gate re-enters an earlier phase without re-running the regeneration/lint/sub-artifact phase in between); an unconditional write instruction reachable from an "edit existing file" flow (clobbers an approved persistent doc = data loss); a write guard whose predicate is a session-global mode flag derived from a *different* artifact than the one being written (multi-artifact skills like `asd-design-system` set mode from one file and reuse it for siblings — always check the guard names the same path as the write); an enumeration that reads exhaustive but omits a real case.
- **Security** → almost always `n/a`: no runtime, no untrusted input, no secrets. Say `n/a: <reason>` in the ledger rather than fabricating findings.
- **Contracts** → rule-doc SSoT vs its mirrors (workflow/agent/README), and gate obligations: every gate in `checkpoints.md`'s tables must have a defined recording obligation for BOTH the in-sprint and standalone (`/asd-concept`, `/asd-stack`, `/asd-design-system` with no active sprint) dispatch paths.
- **Sync check** (custom-coding-rules): after a canonical `.asd/skills|agents|hooks` edit, verify the generated `.claude/` and `.agents/skills/` views carry the same text — grep a distinctive new phrase across `!.asd/**`. Cheap and catches a real violation even when the diff pathspec excludes provider views.

**Human-in-loop "infinite loop" claims:** a revise→re-post→`accept` loop in a setup skill is not a non-termination bug — the user's explicit `accept` is the termination condition, and no step self-triggers feedback. Don't raise these; do check that each re-entry re-runs the derived-artifact steps (lint, regeneration, per-tech reference) before `accept` can be requested again.

**Known non-findings — do not raise:**
- The "write is not deferred — only the `accept` gate is" rationale clause repeated across the 3 setup skills. Sub-floor duplication / wording (a sibling reviewer already logged this).
- Skeleton written "per Google Labs DESIGN.md format" before the spec fetch in `asd-design-system` Phase 4 — medium at most, sequencing wrinkle only.
- `.asd/release-manifest.json` hash freshness cannot be verified read-only (no hashing tool) — check `managed_paths`/`canon_hashes`/`upstream_hashes` key coverage and JSON validity instead, and say so in the ledger.
- `asd-design-system` Edit-mode artifact-level force-include reaching the section-level loop: verified whole. design-system.html needs no loop (Phase 5 is unconditional), accessibility.html's Phase 6 loop offers only Lock-in/Revise (no Skip), and DESIGN.md can never be the missing one in Edit mode (Phase 1 routes to edit only when it exists non-empty). Don't re-derive this chain.
- Phase 4's "C) Skip → remove the section from the on-disk file" deleting real content in Edit mode: user-initiated, documented in the same line, git-recoverable — medium at most.

**Why:** iterations 3-6 of sprint `003-doc-links-and-autonomy` converted the setup skills to write-first order; the real defects were all spec-contract gaps of the shapes above, never classic code bugs.

**How to apply:** at high/critical floors in this repo, hunt loop-back paths, edit-mode re-entry into create-mode steps, and guard-predicate/target mismatches; do not pad the findings list with prose issues (they belong to the Documentation reviewer).
