[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| F-1 | medium | `.claude/agent-memory/asd-reviewer-testing/feedback_workflow-definition-sprints.md:3,10,11`; `.claude/agent-memory/asd-reviewer-testing/MEMORY.md:9` | New in this range, the memory describes the suite as it stood before this same range's fixes and two of its claims are false at HEAD: (a) "Predecessor pins stop at the rule home … The acting sites that actually fire `ABORT — precondition not met` are not checked" (also the description and the MEMORY.md hook "predecessor pins stop at checkpoints.md") — this diff adds the acting-site check (`tests/run.js:3002-3003`: for each `lite` predecessor differing from `standard`, `readWorkflow(phase)` is tested for an "advanced from … (`lite`)" / "`lite`: … advanced from" binding, covering `asd-phase-plan.md:8`, `asd-phase-retro.md:7`, `asd-phase-design-promote.md:5`); (b) the `asd-sprint` SKILL.md collapse exception is called "unpinned in sprint 020" — the new AC-6 `collapseSentences` relation (`tests/run.js:6624-6629`) pins both resume-flow collapse clauses to the workflows whose chain holds `design`. A future Testing reviewer would re-raise closed coverage gaps (`artifact-layout.md` "Agent memory": durable claims must hold at HEAD). | Testing reviewer's memory-fix dispatch: restate both bullets as closed history (predecessor pins now reach `checkpoints.md` and the three acting-site workflow lines; the SKILL.md collapse clauses are pinned since wave-1 review-fix), keep the "grep and compare on every new workflow" how-to-apply, and update the description and MEMORY.md index hook to match. |

## Coverage (internal reviewers only)

```json
{"manifest_digest":"19e3991176e3a595257dc291b9fc7e8af23e46eb7aeb8bb6244abc16f80fc861","findings":["F-1"],"files":[{"i":".asd/agents/asd-reviewer-combined.md","s":"checked"},{"i":".asd/agents/asd-tester.md","s":"checked"},{"i":".asd/hooks/session-start.js","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/artifact-layout.md","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"},{"i":".asd/skills/asd-sprint/SKILL.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".claude/agent-memory/asd-external-review/reference_codex-invocation.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-efficiency/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-efficiency/project_020-workflow-definition-keys.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/feedback_workflow-definition-sprints.md","s":"checked"},{"i":".claude/agent-memory/asd-tester-critical/project_testability-envelope.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"SSoT","s":"pass"},{"i":"Template adherence","s":"n/a","p":"no templated artefact in scope"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"finding","f":"F-1"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Stub-resolution verification (impl-review)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"pass"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```

Checked and passing:
- Iter-01 fixes resolved (F-1..F-4): `session-start.js` carries no in-body/trailing narration comments in the diff and its "t1-contract" anchor is replaced by a `sprint-lifecycle.md` "Workflows" citation; the `artifact-layout.md` "Test plan" in-place tester reach ("same reach", "reports a finding outside it unfixed") now agrees with `asd-tester.md`, and the unfixed branch has an acting site in `review-policy.md` "Low-severity test-only findings" ("any other routes the iteration to review-fix"); design-promote inputs (`audit.md` when present) agree between `sprint-lifecycle.md` "Workflows" and `asd-phase-design-promote.md` step 4; the hand-listed docs predicate is gone from `NA_TARGETS` and the `NA_TARGETS`/`standingPredicates` member docs match the new code.
- External Review availability skip: routed through `persist-review` consistently in `review-policy.md` Persistence, `external-review.md` "Detection and negative cache", and both review workflows' step 9/step 8; README § Outcome contract still homes the skip form correctly.
- Combined reviewer carve-out (`asd-reviewer-combined.md` "Persistent actuality before promotion"): names a real Documentation rubric entry; the step citation is right (design-promote step 4 is the creator step; the Architect writes stack there too).
- README Framework mode: persistence sentence, "one reviewer per concern per workflow roster", "(in `lite`, Combined) are always dispatched", combined reviewer in the `settings.json` web-grant list, FAQ lite answer — all updated.
- Other agent memory in scope verified at HEAD (efficiency memory: `reviewFindings` column order id/severity/location, `rollback_reset` derivation test at `tests/run.js:6448`; tester-critical: sentence-scoped sweep; external-review: timeout guidance; my own).
- `release-manifest.json`: every changed render/canonical file has an updated `canon_hashes`/`upstream_hashes` entry (sha values corroborated structurally, not recomputed).
- Stubs: none opened or resolved this sprint; no `TODO(sprint-020…)` markers.
- Dropped below the medium floor: README.md:17 "dedicated Documentation reviewer" (lite uses Combined); `tests/run.js:2064` assertion message attributes the chain-membership check to `sprint-lifecycle.md` "State recovery", which states only the non-done clause. Both low.

## Verdict
CONCERNS: 1

## Next action
Route F-1 to the Testing reviewer's memory-fix dispatch (`review-policy.md` "Autofix vs escalation"); no canon or code change needed. Orchestrator commits the memory fix.

## Escalations (optional)
None.
