[REVIEW-impl-testing]: APPROVE

# Review — testing

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings | — |

## Coverage (internal reviewers only)

```json
{"manifest_digest":"39f1b6901815ccef4741bf3755c5510bb1e43ac07efd04c346c68ad5821dc9fb","findings":[],"files":[{"i":"tests/run.js","s":"checked"},{"i":".asd/sprints/020-multi-workflow-lite/test-plan.md","s":"checked"},{"i":".asd/sprints/020-multi-workflow-lite/test-plan.entry-01.md","s":"checked"},{"i":".asd/sprints/020-multi-workflow-lite/test-plan.entry-02.md","s":"checked"}],"rules":[{"i":"Rule-set conformance","s":"pass"},{"i":"Coverage","s":"pass"},{"i":"Edge cases","s":"pass"},{"i":"Manual verification (last resort)","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```

Scope: diff `dd4dcfda85fb9e2b.diff` — the review-fix tester rows (rotated into `test-plan.entry-02.md`) and entry 3 in `test-plan.md`, plus their `tests/run.js` edits. `test-plan.entry-01.md` carries no hunk in this diff; checked only for the rows entries 2/3 supersede.

Fix-id → proof map (decisions-log "impl fix for wave-1/iter-01"): every fixed finding maps to a regression-proof cell or an honest `none` — correctness 1 → F1a (+F1b proving the loop reaches both Step 2B sites); correctness 2 → F4; correctness 3 → F6a–d (one mutation per site); correctness 4 → README-mirror `none` row; external 1 → R1 (replayed: without the guard at `runtime.js:514`, `status 0` is plausible for the new case since its ledger is otherwise valid); external 2 → C1–C5 (C5 proves wording is not locked); efficiency 1 → `none`, efficiency 2 → `keep` backed by R2/R3 mutations; F-1 → H1–H3 (verified against `session-start.js:83`: each fixture isolates one disjunct — `780` fails the chain check, `781` no definition non-done, `782` no definition done; the `done` check is only observable via `782` since `done` is in no chain); F-2 → P1 (row openly states a revert does not redden); F-3 → G1–G3; F-4 → `none`; testing 1–6 → each an added test with a mutation record.

Recorded pass/fail counts reconciled against the hash-noise pattern per mutated file kind: README mutation → no noise line (README not in `upstream_hashes`); rule doc → +1 (`upstream_hashes`); agent/skill → +3 (`canon_hashes`, `upstream_hashes`, `sync --check`); hook → +2. All recorded counts are consistent.

Predicates re-verified against today's canon: `inputsOf` handles all 5 "in place of drafts" sites (`sprint-lifecycle.md:27`, `asd-phase-design-promote.md:8`, architect/ba/ux Inputs lines) — the citation strip + backtick scan survive the `lastIndexOf('lite')` slice; the predecessor regex matches `plan.md:8`, `retro.md:7`, `design-promote.md:5`; the Step 2B sentence split keeps `.md` citations whole.

AC trace (`sprint.md`): iter-01 trace holds; AC-3 gains the reader-citation sweep and the lite promote-inputs relation, AC-4 the combined carve-out pin, AC-6 the resume-flow collapse relation and the widened no-default sweep, AC-9 the bare-APPROVE refusal and the four External skip-path sites.

Determinism: hook cases run in per-case temp roots with literal fixtures; no sleep/clock. The `'Lite'` case is host-FS-dependent but passes on every host (not flaky). Manual verification: none specified, none warranted (every risk automatable).

Dropped below the medium floor (low):
1. `tests/run.js:6596-6597` — the carve-out step predicate (`creators` + `` `lite` ``) is also satisfied by `asd-phase-design-promote.md` step 5 (the "wait for creators" step); the message overstates what the predicate checks.
2. `tests/run.js:3002` — the acting-predecessor regex scans the whole workflow file, not only its Preconditions line.
3. The README-mirror `none` reason for correctness 4 addresses reviewer sets, not the persistence sentence.
4. The F-2 pin catches grant deletion, not asd-tester.md re-restating it (the row states this honestly).

## Verdict
APPROVE

## Next action
No testing action — orchestrator aggregates with the other iter-02 reviewers.

## Escalations (optional)
- none
