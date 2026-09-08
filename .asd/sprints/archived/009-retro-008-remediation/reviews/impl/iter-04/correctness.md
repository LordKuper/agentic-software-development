[REVIEW-impl-correctness]: APPROVE

# Review — correctness

- **Phase**: impl-review
- **Iteration**: 4 (severity floor: high — medium and low dropped at source)
- **Method note**: no shell; the delta surface was derived by reading the current content of the 7 manifest-scoped paths.

## Findings

None at or above floor.

## What was verified

**1. Reach stated correctly and unambiguously at both acting sites.** `review-policy.md:144` is the SSoT ("except where a branch states its own reach … holds for any replaced dispatch, External Review included"). Both workflow headers now scope only "split and re-dispatch mechanics: internal reviewers only", so the narrowing no longer swallows the whole step, and each acting bullet opens "Late duplicate return — applies to any replaced dispatch, External Review included:" with the verbatim citation on the *same* line. Reach and citation are one sentence per site; `Late duplicate return` occurs exactly once per workflow, so no divergent second copy exists.

**2. Nothing else in those steps became false or self-contradictory.** The "Phase bindings" sub-bullet is genuinely split mechanics, so the internal-only header is accurate over it; step-number cross-references are per-phase correct. The late bullet's `verdicts`/`latched`/decisions-log claims stay consistent with step 8/9 for External Review specifically: an availability skip is never latched, so "any APPROVE latch for that reviewer cleared" is a no-op there rather than a contradiction, while a bare external APPROVE does latch and is correctly clearable. Both "Artefacts produced" lists still declare `<reviewer>.late.md`. No prior assertion was invalidated by the reword, and no test pins the old bare header form.

**3. The new line-scoped assertions cannot pass vacuously.** The rule-side check `find`s the line carrying both the branch label and "holds for any replaced dispatch", then requires "External Review included" on it — a `find` miss yields `undefined` and fails, and it binds to the scope line only, so the reach cannot be satisfied from the branch body. The workflow-side check asserts the line exists before dereferencing it, then requires the reach on that same line, so a reach parked in the header, another bullet, or "Artefacts produced" would not satisfy it. Delete either half of the fix and it fails.

**4. Manifest and memory.** `release-manifest.json` carries refreshed `upstream_hashes` for both edited workflows; workflows are non-render canon, so no `canon_hashes` entry and no generated view are expected. Hash freshness corroborated structurally, not recomputed. The three agent-memory files are reviewable source under AC-13 and their falsifiable claims check out at HEAD: `managed_paths` excludes `tests/run.js`, `canon_hashes` covers only agents and skills, the sync helpers are exported, a bare `--apply` fails closed, and the in-suite repo-root `--check` test exists. No false memory line found.

**Considered and judged below floor / pre-existing, therefore not raised**: an External Review return that is neither a verdict nor an availability skip has its disposal only in `external-review.md:51` ("imported here whole"), while the workflow's own re-dispatch sentence sits under the internal-only qualifier. This delta did not introduce that — the qualifier covered the same sentence before — the workflow cites `external-review.md` at steps 1/1a/1b/8 so the binding is reachable, and the outcome is identical either way (re-dispatch fresh).

## Coverage

Validated compact ledger: [`correctness.ledger.json`](./correctness.ledger.json) against [`correctness.manifest.json`](./correctness.manifest.json), findings [`correctness.findings.json`](./correctness.findings.json) (empty). `validate-ledger` → `{"ok":true}`. 7/7 files, 18/18 rules, 6/6 sections resolved.

## Verdict

APPROVE

## Next action

Reviewer done for iteration 4; no fix round required from correctness.

## Escalations

None.
