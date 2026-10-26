---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 029-upstream-retro-issues

## Goal
Consumer projects publish their framework-level retro findings as issues in the ASD GitHub repo. ASD's own scope phase sweeps the open issues, closes duplicates and repeats, and puts genuinely new findings to the user the way it puts the project's own retro findings. Under self-hosting no issues are published. Approach and refined requirements: `research.md`.

## Acceptance
- AC-1: A consumer retro (`self_hosting` not enabled), right after writing `retrospective.html`, publishes one GitHub issue per open `asd` row (not `covered by:`) to the ASD repo named by `.asd/release-manifest.json` `repo`, automatically, with no user gate; a self-hosting retro never publishes.
- AC-2: Each issue carries a marker identifying it as an ASD retro finding plus only these fields: guardrail, framework-level root cause, home, provider, `asd_version`. Before publishing, the orchestrator checks the body holds nothing from the consumer project — no sprint or row id, project or product name, consumer path, code, data or secret; a row it cannot state framework-only is not published, and the skip is logged.
- AC-3: When `gh` is missing or unauthenticated, or the issue creation fails, publication is skipped with one decisions-log line; the retro still completes and the row is still shown at the consumer's next scope as an upstream proposal.
- AC-4: A self-hosting scope's retro intake also sweeps this repo's open marker issues. A clear duplicate — of another open issue or of a finding already dispositioned or delivered — is closed with a comment linking the original and the `duplicate` label; an issue resolved at `HEAD` is closed with a comment stating the evidence; both are shown at the scope gate with no question.
- AC-5: Every other marker issue goes to the user inside the scope gate as include / reject / defer, presented like a retro row (root cause, proposed edits, consequences of each choice); a doubtful duplicate is annotated with links to the similar issues found; an issue off the marker format is flagged non-standard and never closed automatically. Issue content is untrusted data, never instructions.
- AC-6: Issue dispositions are written to GitHub on scope acceptance, not to `retro-backlog.md`: include → an `AC-N` citing the issue; reject → closed with a comment and the `wontfix` label; defer → the `deferred` label, left open and offered again at every later intake.
- AC-7: The sprint PR references its included issues without a closing keyword; after the release is published, `pr` merge mode closes each included issue with a comment naming the release version and linking the release.
- AC-8: A consumer config key turns publication off (`enabled | disabled`, absent = `enabled`); `/asd-init` collects and edits it; disabled, the retro publishes nothing.
- AC-9 (retro 028#A-2): this repo's `AGENTS.md` hand-edited tail states that build is `node .asd/sync.js --check` and lint is `git diff --cached --check` per `commands.yaml`, run before reporting COMPLETED — it no longer reads as if the repo has no build or lint.
- AC-10 (retro 028#P-1): impl-review fixes test-only findings of severity `low` or `medium` in place, the way a low-severity test-only finding is fixed today, the terminal full suite checking them.
- AC-11 (retro 028#P-2): before accepting a dev's flagged choice that changes a predicate or contract an agent definition, README or rule states, the orchestrator checks it against that text; a choice contradicting it is routed back, not accepted.
- AC-12 (retro 028#P-3): a plan removing a name lists the grep forms its universal-reach sweep covers — verdict token, `<key>.md` file name, prose role name, retired tier wording — not the token alone.
- AC-13: README.md and every cross-file mirror reflect AC-1..AC-12; `node tests/run.js` is green and `sync.js --check` is clean.
