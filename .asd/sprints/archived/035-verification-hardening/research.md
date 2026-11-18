---
responsibility:
  owns: staged-design research for sprint scope (functional requirements, best-practice findings with sources, conceptual approaches and the chosen one)
  excludes: acceptance criteria, technical design, plan, code
  delegates_to: sprint.md (AC-N), design/ docs or plan.md (technical detail), decisions-log.md (decisions)
---

# Research

<!-- Stages, conceptual boundary, no-web-research Findings line: .asd/rules/sprint-lifecycle.md "Staged solution design" — not restated here. -->

## Requirements
Raw scope and stage (a) answers; stage (c) refines the answers.
- Raw scope: adopt seven verification practices from the Claude Code team article (https://claude.dev/blog/how-the-claude-code-team-thinks-about-verification/): (1) APPROVE latch bound to the shipped code; (2) reliability checklist with diff-readable triggers; (3) run the change itself (smoke command); (4) prune stale rules; (5) a Pre-existing finding class routed to an issue; (6) self-hosting: verification rules cannot modify themselves; (7) differential tests in the tester strategy table.
- Problem: verification is partly decoupled from the code that merges (a latched reviewer never sees later fix-round code), guardrails only grow and load whole on every dispatch, the change itself is never run, a pre-existing bug inflates the sprint, and under self-hosting a sprint can rewrite the very rules that review it.
- Actors: main orchestrator, impl-review reviewers (Combined / Quality / Efficiency / External Review), `asd-tester`, retro, `asd-init`, consumer projects via `/asd-update`.
- Functional requirements:
  - FR-1 latch: a fix round (review-fix or test-fix) that changes at least one production executable file the latched reviewer already reviewed clears that reviewer's latch. A fix touching only documentation, comments, tests or other non-production files never clears a latch (user answer).
  - FR-2 checklist: a consumer-owned `.asd/project/reliability-checklist.md`; each item has id, diff-readable trigger, check, source (`<sprint>#F-N|A-N`) and `last_hit`. Retro adds items as guardrails; the owner may edit by hand. Reviewers load only items whose trigger matches the diff. Existing `custom-*-rules.md` prose is not migrated.
  - FR-3 smoke: optional `commands.yaml` key `smoke`, detected by `asd-init`; `asd-tester` runs it once at impl-test's green exit; a failure is a code defect `D-N`; an absent key skips the step.
  - FR-4 pruning: retro updates `last_hit` of items that fired; an item with no hit for 3 consecutive sprints becomes a removal candidate, removal decided by the user at retro intake (user answer: 3, not 5).
  - FR-5 pre-existing: a finding below `critical` on a defect that predates the sprint goes to a GitHub issue (project repo; the ASD repo under self-hosting), never to review-fix; `critical` (security, data loss) stays in review-fix.
  - FR-6 self-hosting: when the sprint diff touches verification rules (`review-policy.md`, `external-review.md`, `asd-reviewer-*` and `asd-external-review` definitions, the checklist), the reviewer context is built from `origin/<base_branch>`.
  - FR-7 differential tests: one row in the tester strategy table — old version as the oracle for behaviour-preserving refactors and migrations.
- Constraints: `backward_compat: migration` — new keys optional, consumer `custom-*-rules.md` untouched; documentation economy (no prose a reading agent does not act on); every cross-file mirror (README, `tests/run.js` §16, `release-manifest.json`) kept in sync.
- Success criteria: `node tests/run.js` green with coverage of the new `runtime.js` logic; README accurate; a reviewer dispatch's token load does not grow (checklist loaded selectively).

## Findings
- Source article: verification loops let one person delegate to many agents; a diff-triggered 39-item reliability checklist runs only 3-10 matching items; review is bound to the commit that ships; verification rules live where the change cannot modify them; findings classed Important / Nit / Pre-existing; verification layer pruned routinely — source: https://claude.dev/blog/how-the-claude-code-team-thinks-about-verification/
- GitHub "dismiss stale approvals": the approved diff state is recorded and an approval is dismissed when the diff changes; pushes that change no code (a base merge) do not count; a community request asks for diff-hash comparison so no-file-change rebases keep approval — source: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches ; https://github.com/orgs/community/discussions/12876
- Gerrit sticky approvals: `copyCondition = changekind:NO_CODE_CHANGE` (or `TRIVIAL_REBASE`) carries a vote to the next patch set only when code did not change — the industry precedent for FR-1's "non-code change keeps the latch" — source: https://gerrit.googlesource.com/gerrit/+/master/Documentation/config-labels.txt
- SonarQube "Clean as You Code": the quality gate judges new code only; pre-existing issues do not fail it but still surface when touched code is changed and are fixed incrementally — precedent for FR-5 — source: https://docs.sonarsource.com/sonarqube-server/user-guide/about-new-code
- GitHub `pull_request_target`: the workflow definition is read from the base branch so a PR cannot alter the check that judges it; danger begins only when the job pulls PR-head code into the privileged run — precedent for FR-6 — source: https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target
- Danger.js: per-PR rules keyed on `danger.git.modified_files` / `created_files`, each warning or failing only when its path condition matches — precedent for FR-2's diff-readable trigger — source: https://danger.systems/js/
- Smoke / build verification test: shallow, critical-path-only, run right after build; a failure halts deeper testing; a pass does not mean bug-free — source: https://en.wikipedia.org/wiki/Smoke_testing_(software)
- Rule pruning: Microsoft found a few noisy rules caused most "won't fix / false positive" resolutions and weeds them individually; hit rate alone is a risky retirement signal — high-consequence rules should never auto-retire — source: https://devblogs.microsoft.com/engineering-at-microsoft/separating-the-signal-from-the-noise/ ; https://dev.to/xinandeq/how-i-shrunk-my-agents-core-from-15-to-9-why-hit-rate-alone-cant-tell-you-which-rules-to-retire-5ag
- Differential testing: the old implementation is the executable spec; assert new = old on the same inputs; each mismatch is triaged (bug, intended change, representation, undocumented behaviour), not auto-failed — source: https://www.freecodecamp.org/news/differential-testing-legacy-migration/

## Approaches
- **A — one sprint, deterministic where machine-checkable**: all seven strands; latch clearing (FR-1), checklist trigger matching (FR-2) and the base-branch context build (FR-6) become `runtime.js` mechanics with tests, the rest (FR-3, FR-4, FR-5, FR-7) rule/agent prose at their existing homes; pros: decisions that gate review are not left to model judgment, matches the article's "verification layer as a production system"; cons: largest change, touches `runtime.js` plus several rule docs and mirrors.
- **B — one sprint, prose only**: all seven strands as orchestrator/reviewer instructions, no `runtime.js` change; pros: smallest diff, fastest; cons: file-intersection and trigger matching done by the model each time — unreliable, and costs tokens on every dispatch, against the success criterion.
- **C — split**: this sprint FR-1, FR-5, FR-6, FR-7 (bounded, independent); next sprint FR-2, FR-3, FR-4 (checklist format, smoke, pruning), once the checklist shape is settled; pros: smaller review surface each; cons: two sprints of overhead, FR-4 depends on FR-2 anyway so splitting delays the token saving.
- Recommended: A — the three gate-critical mechanics are exactly the ones a model gets wrong under load; the rest are short prose additions.
- Chosen: A — user answer "A: всё + runtime"; refinement: `last_hit` counts only a reviewer finding citing the item (a bare trigger match is no hit), and an item of severity `critical` never becomes a removal candidate (user answer "Находка")
