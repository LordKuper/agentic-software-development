[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| DOC-2-1 | medium | `.asd/rules/artifact-layout.md:187` ("Test plan", added this range) vs `.asd/workflows/asd-phase-impl-test.md:40,43` and `.asd/rules/sprint-lifecycle.md:247` | The new rule writes a duty but nothing carries it through to the reader. The review-fix tester "records a removal finding as a `Risk → check decisions` row, and the next `impl-test` entry … performs the removal and records its reason under `Removed tests`". But impl-test step 4 re-entry says to "**first** rotate the previous entry's narrative rows into `test-plan.entry-NN.md`", and "Rotation" (`artifact-layout.md:189`) leaves those tables empty in the live file. Only then does step 5 "Read `test-plan.md` → collect proposed removals", so the removal row has already left the live file and nothing makes the next entry act on it. Canon also does not say which segment gets review-fix rows, which have no `Entry log` row of their own. Both gaps are covered only by `.claude/agent-memory/asd-tester-critical/project_testability-envelope.md`, whose citation claims more than its home says, and only the critical tier loads that memory. | In impl-test step 4 re-entry (and at the `sprint-lifecycle.md` "Re-entry" pointer if needed), state that review-fix rows rotate with entry N's rows and that a removal row among them joins step 5's removal set before rotation. Add one clause to `artifact-layout.md` "Rotation" naming where review-fix rows go. |
| DOC-2-2 | medium | `.asd/rules/review-policy.md:91` ("Memory-fix dispatch", rewritten this range); mirrors `.asd/workflows/asd-phase-impl.md:55` (step 3), impl Operations "write a file: a memory-fix dispatch's returned text, verbatim (step 3)", step 9 "applied from a memory-fix dispatch", `CHANGELOG.md:21`, pins `tests/run.js` 3764-3765 and 6213 | The same paragraph says the owner fixes the file "with its own write tool — on Claude `memory: project` serves every owner one, reviewers and External Review included", and the dispatch is "Claude only". At HEAD every agent with `"memory": "project"` keeps `Write` (no `disallowedTools` in `.asd/agents/*.md` names it). So "An owner with no write tool at all returns only a `MEMORY-FIX <path>` block…" cannot happen as the paragraph words it, and the branch and its four mirrors change no reading agent's behaviour ("Documentation economy"). | Delete the `MEMORY-FIX` fallback from the home and its mirrors. Alternatively, if a real no-Write owner is intended, replace "serves every owner one" with the real condition and name that owner. |
| DOC-2-3 | medium | `.asd/rules/review-policy.md:91` and the "Gate Verdict Format" paragraph (both changed this range) vs `.asd/rules/providers.md:46` | The host-grant fact ("`memory: project` adds `Write` to every reviewer") now has three canon statements. providers.md holds it and is the home Gate Verdict Format itself names ("`providers.md` only the tool grants"). Gate Verdict Format restates it. "Memory-fix dispatch" restates a wider version ("serves every owner one, reviewers and External Review included") and cites "Gate Verdict Format", which covers only reviewers, so the "every owner" generalization has no home. This is the kind of host-behaviour claim iter-01 showed goes stale, and every copy is another place for it to survive. | Keep the grant fact in providers.md only. In Gate Verdict Format, keep the policy clause and point at `providers.md` for the grant. In "Memory-fix dispatch", say "with its own write tool (`providers.md`)" and drop the "serves every owner one" restatement. Adjust the `tests/run.js` 566 and 6212 asserts to check the citation. |

Checked and clean:
- the README reviewer paragraph and the `/asd-update` row;
- CHANGELOG v13.2.0 apart from DOC-2-2;
- providers.md "Declared tool policy";
- the reviewer memories against HEAD;
- the leftover-term home and its acting sites;
- the tester description, body and impl step 3/5 routing;
- the "Retro intake" failure clause;
- the `t_retrospective.html` pointer and the `retroCandidates` doc;
- the payload-header citations;
- no in-body `//` comments, no sprint stubs, and manifest entries for every changed canon file.

## Coverage (internal reviewers only)

```json
{"manifest_digest":"feef8bfa754bb9e9f1885699d246ea9fff840ec9aa6f0a0d18c0d5a713c0af80","findings":["DOC-2-1","DOC-2-2","DOC-2-3"],"files":[{"i":".asd/agents/asd-external-review.md","s":"checked"},{"i":".asd/agents/asd-tester.md","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/artifact-layout.md","s":"checked"},{"i":".asd/rules/providers.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"},{"i":".asd/templates/t_retrospective.html","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-test.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-correctness/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-correctness/feedback_check-host-claims-against-own-dispatch.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-documentation/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-documentation/project_reviewer-write-scope-declaration.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md","s":"checked"},{"i":".claude/agent-memory/asd-tester-critical/project_testability-envelope.md","s":"checked"},{"i":"CHANGELOG.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"SSoT","s":"finding","f":"DOC-2-3"},{"i":"Template adherence","s":"pass"},{"i":"HTML shell wrapping","s":"pass"},{"i":"Provenance","s":"pass"},{"i":"Traceability","s":"pass"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Stub-resolution verification (impl-review)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"finding","f":"DOC-2-1"},{"i":"Documentation economy","s":"finding","f":"DOC-2-2"},{"i":"Custom rules consistency","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```

## Verdict
CONCERNS: 3

## Next action
The creator (asd-dev, review-fix) fixes DOC-2-1..3 in canon and, per "Consumer search", updates every consumer in the same commit: the impl.md mirrors and `CHANGELOG.md`. The `tests/run.js` pins go to the asd-tester chain.

## Escalations (optional)
- none

Memory written during this review (committed by the orchestrator with this file): `.claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md`.
