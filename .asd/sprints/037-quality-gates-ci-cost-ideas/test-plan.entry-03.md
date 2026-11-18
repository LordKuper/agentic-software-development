---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 037-quality-gates-ci-cost-ideas, entry 3 (rotated, never edited)

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `git diff b6f345ae...HEAD` outside `.asd/sprints/**` is `.asd/release-manifest.json` alone: two `upstream_hashes` values (`.asd/rules/sprint-lifecycle.md`, `.asd/workflows/asd-phase-retro.md`) recomputed by `sync.js --apply` for D-2 | a recorded hash drifts from its file again, or a changed value is not a hash of the file | content contract (existing owner) | none | `release-manifest.json: every upstream_hashes entry matches the actual file (relative to repo root)` already owns it and is the test that went red on D-2; it is green on this tree. A second test would repeat the same comparison (§17). No test added |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|
