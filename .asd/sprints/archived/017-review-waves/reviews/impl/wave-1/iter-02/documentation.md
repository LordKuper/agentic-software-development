[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| DOC-1 | medium | `.asd/workflows/asd-phase-impl-review.md:83` ("Artefacts produced") | The fix moved a closed wave's admitted `.late.md` into the current iteration dir: `review-policy.md:166` (SSoT) and step 7a (:50) both say so. The artefact line still says only "in the replaced dispatch's iteration dir", so the same file gives two locations. An orchestrator following it would write into the closed wave's dir, and review-fix (`asd-phase-impl.md:55`, which reads only `reviews/impl/<id>/`) would never see the finding. | Update line 83 to cover the closed-wave location, or cite `review-policy.md` "Late duplicate return" instead of restating it. |
| DOC-2 | medium | `.claude/agent-memory/asd-external-review/reference_codex-invocation.md:22` | The line rewritten this iteration names `reviews.impl.waves[K]`, but wave K is `waves[K-1]` (1-based; `sprint-lifecycle.md` "Division"; hook `impl.waves[wave - 1]`). The whole "diff base" clause is also unused, since `emit-manifest` precomputes the diff and the wrapped CLI never computes one. It is a false line reloaded on every dispatch. | Delete the "Iteration 2+ diff base: …" clause, keeping only "Prior finding set arrives inline in dispatch payload — never read other iterations' `iter-*/` files, any wave's". |

## Coverage (internal reviewers only)

Passing rows: no new in-body comments; `stubs.md` has no open entries; README reflects `wave-files`, the `draft-snapshot` dir form, design-review `--full-files` and the shared `.diff`; generated hook views are current; manifest hashes were corroborated structurally only; no live canon names `snapshot.json`, `external.diff` or `<reviewer>.diff`.

Ledger: [documentation.manifest.json](./documentation.manifest.json)

```json
{"manifest_digest":"28d51b8c286cbba9b3d8d38bb4bc8ca94e202f136ed835de5eb610c67a0d3422","findings":["DOC-1","DOC-2"],"files":[{"i":".asd/hooks/session-start.js","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"},{"i":".asd/templates/external-review/t_prompt-external-design.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked"},{"i":".claude/agent-memory/asd-external-review/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-external-review/reference_codex-invocation.md","s":"checked"},{"i":".claude/agent-memory/asd-external-review/reference_scope-manifest-transport.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-correctness/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-correctness/feedback_review-method-no-shell.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-correctness/project_prompt-snapshot-is-base-branch.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-documentation/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-documentation/project_external-review-prompt-duplication.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-efficiency/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-efficiency/feedback_no-shell-incremental-scope.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/feedback_review-fix-defect-proof.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/feedback_temp-repo-git-determinism.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/project_split-part-rubric-rows.md","s":"checked"},{"i":".claude/agent-memory/asd-tester/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-tester/project_asd-self-hosting-testing.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"SSoT","s":"finding","f":"DOC-1"},{"i":"Template adherence","s":"pass"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"finding","f":"DOC-2"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Stub-resolution verification (impl-review)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"pass"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```

## Verdict
CONCERNS: 2

## Next action
impl review-fix: DOC-1 (workflow artefact line); DOC-2 (External Review memory owner removes the wrong, unused diff-base clause).
