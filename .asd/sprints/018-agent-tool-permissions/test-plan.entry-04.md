# Test plan — entry 4 (rotated segment)

Rotated from `test-plan.md` at entry 5's strategy pass (`artifact-layout.md` "Test plan" rotation). A cross-span reader reads this segment in ordinal order, then the live file.

## Risk → check decisions

Entry 4 (delta since entry 3: `git diff 0bd998c...HEAD`, review-fix round 2: dev 9409e90, 099cf64, d12ece2, 3ee9f24 plus tester 9513ce2). Impacted set: the **full suite**. The safety valve fires because the delta touches `core.md`, `review-policy.md` and `release-manifest.json`. Every canon change in the delta was pinned, with a revert-to-parent proof, by 9513ce2 while entry 3 was live (rotated `test-plan.entry-03.md`); nothing after 9513ce2 is canon.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `core.md:47` gate-uncertainty carve-out (3ee9f24) | the reviewer carve-out is lost again | static | none | Already pinned by the widened rules sweep; `core.md` reverted to `3ee9f24~1` fails it (rotated segment, Q1). A new test would duplicate that assertion |
| stalemate routing (d12ece2): option names removed from both workflows; `external-review.md` "stop"/"continue fixing" effects now name the route | workflows restate stale names; an option loses its effect | static | none | Absence of names plus the home citation are pinned (W1/W2, S4/S5), and so is "exactly three options, each with an effect". Whether the effect prose routes correctly is a judgement about the text with no derivable proxy. Owner: the impl-review correctness reviewer. It becomes assertable if the routes are ever given as literal step references |
| `answer:` line (099cf64) | the user's answer never reaches the fixer | static | none | Pinned as a relation across carrier, template, impl step 3 and both workflows (A1–A4) |
| `designmd-install` orchestrator sites (9409e90) | a cited site stops running the install | static | none | Pinned by resolving the `asd-ux.md` citations (I1/I2) |
| `release-manifest.json` hash refresh | stale ledger | static | keep | The existing `upstream_hashes` and `canon_hashes` tests pass at dbc6b60 |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

None this entry. The delta's assertions landed in 9513ce2, with their proofs recorded in the rotated `test-plan.entry-03.md`.

| Test | Regression proof |
|---|---|
