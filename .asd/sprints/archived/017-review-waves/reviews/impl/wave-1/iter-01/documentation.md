[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| DOC-1 | medium | README.md:211 (Reviewers intro paragraph) | The README restates the old hand-off: "payload carries only its own emitted manifest file list (plus, in impl-review, that manifest's `.diff`)". That is now wrong, since design-review also gets a `.diff` from iteration 2. It also cites the old homes instead of "Scope hand-off", the single statement that README should link to. This violates SSoT and AC-7/AC-8. | Replace the restatement with a link: file list + precomputed `.diff` + whole files as context, per `review-policy.md` "Scope hand-off". Keep the "Reviewer responsibility" pointer for the owner map only. |
| DOC-2 | medium | .asd/hooks/session-start.js:106, :141-142 | (a) The comment "(D3)" cites a sprint-017 plan decision id, which code-style.md §8 bans and which goes stale on archive. (b) "`iter-NN` keys sort lexically wrong past 9 iterations" is false: the keys are 2-digit zero-padded, so lexical order breaks only past iter-99. | (a) Drop "(D3)". (b) State the purpose correctly (keys past iter-99 sort wrong lexically). Then `sync.js --apply` the hook views and recompute its `upstream_hashes`. |
| DOC-3 | low | .asd/rules/external-review.md:47 ("Outcome contract"); README.md:34 | "never batched or split; review waves bound its size" also covers design-review, which has no waves, so it claims a size bound that doesn't exist there. | Scope it: "in impl-review, review waves bound its size", and use the same wording in README.md:34. |

## Coverage (internal reviewers only)

Scope: all 35 manifest files, reviewed against `documentation.diff` with whole files as context.
- No leftover split-part, dispatch-ceiling, batch or partial references and no `base_ref`/`head_ref`/`exclude_paths` remain outside the legacy lines.
- Every hand-off site links to "Scope hand-off".
- The `t_state.json` seed, the `[wave-<K>/]iter-NN` paths and the token form all agree.
- No new stubs or in-body comments; runtime JSDoc states purpose.

Ledger: [documentation.manifest.json](./documentation.manifest.json)

```json
{"manifest_digest":"0785fbddfd9cec3acdab9e1265b81d5bb7b4d7fa672fb8eddd377914c72d9f1e","findings":["DOC-1","DOC-2","DOC-3"],"files":[{"i":".asd/agents/asd-dev.md","s":"checked"},{"i":".asd/agents/asd-external-review.md","s":"checked"},{"i":".asd/agents/asd-reviewer-correctness.md","s":"checked"},{"i":".asd/agents/asd-reviewer-documentation.md","s":"checked"},{"i":".asd/agents/asd-reviewer-efficiency.md","s":"checked"},{"i":".asd/agents/asd-reviewer-testing.md","s":"checked"},{"i":".asd/hooks/session-start.js","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/artifact-layout.md","s":"checked"},{"i":".asd/rules/checkpoints.md","s":"checked"},{"i":".asd/rules/core.md","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/git-strategy.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"},{"i":".asd/skills/asd-phase-impl-review/SKILL.md","s":"checked"},{"i":".asd/skills/asd-sprint/SKILL.md","s":"checked"},{"i":".asd/templates/external-review/t_prompt-external-design.md","s":"checked"},{"i":".asd/templates/external-review/t_prompt-external-impl.md","s":"checked"},{"i":".asd/templates/external-review/t_review-report.md","s":"checked"},{"i":".asd/templates/external-review/t_review-scope.json","s":"checked"},{"i":".asd/templates/t_friction-log.md","s":"checked"},{"i":".asd/templates/t_review.md","s":"checked"},{"i":".asd/templates/t_state.json","s":"checked"},{"i":".asd/templates/t_test-plan.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-test.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked"},{"i":".asd/workflows/asd-phase-plan.md","s":"checked"},{"i":".asd/workflows/asd-phase-pr.md","s":"checked"},{"i":".asd/workflows/asd-phase-retro.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"SSoT","s":"finding","f":"DOC-1"},{"i":"Template adherence","s":"pass"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"finding","f":"DOC-2"},{"i":"Stub-resolution verification (impl-review)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"finding","f":"DOC-3"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```

## Verdict
CONCERNS: 3

## Next action
impl review-fix: DOC-1, DOC-2, DOC-3; `node tests/run.js` must stay green.
