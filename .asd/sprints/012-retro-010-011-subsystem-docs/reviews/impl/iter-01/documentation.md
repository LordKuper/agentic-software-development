# Review — documentation (merged, split dispatch) — MERGE BLOCKED

- **Phase**: impl-review
- **Iteration**: 1
- **Parts**: [part 1](./documentation.part-1.md) (CONCERNS) · [part 2](./documentation.part-2.md) (CONCERNS)
- **Union property**: (a) pass; (b) pass; **(c) fail**: `HTML shell wrapping`, `Provenance` and `Traceability` are `n/a` under the out-of-part predicate in both parts.
- **Result**: per `review-policy.md` "Union property", the reviewer counts as incomplete for iter-01. No verdict token and no `verdicts["iter-01"].documentation` entry.
- **Cause**: an orchestrator-observed defect in `emit-manifest`. It authorises no scope-derived `n/a` (no user-facing HTML in scope; PRD/ADR disabled), so the only truthful status available was out-of-part in both halves. The hand-built manifests of sprint 011 authorised these predicates. Routed as ORC-1 (`decisions-log.md`); friction F-3.
- Both parts' findings route to review-fix regardless.
