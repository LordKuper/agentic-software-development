[REVIEW-impl-correctness]: CONCERNS

# Review — correctness

- **Phase**: impl-review
- **Iteration**: 2 (severity floor: medium — low findings dropped, none raised)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| F-1 | medium | `.asd/rules/checkpoints.md:31` + `.asd/workflows/asd-phase-impl.md:112` (AC-15) | The *fix rounds charged* unit counts `decisions-log.md` entries matching the exact literal `impl fix for iter-NN: findings resolved`. The literal is brittle and already wrong on real data: this sprint's own fix round is recorded as `## 2026-09-08 — impl review-fix for iter-01: findings resolved`, which the stated match does not select. A gate reading the unit literally surfaces `0` fix rounds for a criterion that cost one — a false evidence number at a hard gate, failing silently (`tests/run.js:3446` only proves the two canon files agree with each other, never that the emitted entry matches). | Match on the stable part rather than the whole heading — e.g. "the fix-round entry for that `iter-NN` (`asd-phase-impl.md` step 11's `… for iter-NN: findings resolved` entry, however the mode is named)". Keep `asd-phase-impl.md:112` as the emitting SSoT; if the strict literal is retained, make step 11's wording the one the orchestrator actually writes. |
| F-2 | medium | `.asd/workflows/asd-phase-impl.md:61`, `:64` (AC-10) | Step 5's fix-mode bullet says "one ordered chain, never a concurrent set … exactly one is in flight at a time", then carves out "test-file findings still route to `asd-tester` as their own chain" without stating how the two chains order against each other, while step 6's preserved bullet (`sequential where dependent; parallel where independent`) reads as authorization to dispatch two independent chains concurrently. Two agents in one shared worktree during a fix round is exactly the sprint-008 shape AC-10 exists to remove; this sprint's own run avoided it by orchestrator judgment, not by the rule. | Add the ordering to step 5's fix-mode bullet: when a round yields both a dev chain and an `asd-tester` chain they run one after the other (dev first), never concurrently — so "exactly one is in flight at a time" holds across the whole round. Optionally extend the AC-10 assertion at `tests/run.js:3449`. |
| F-3 | medium | `.asd/workflows/asd-phase-impl-review.md:47-50`, `:84`; `.asd/workflows/asd-phase-design-review.md:39-42`, `:68` (AC-14) | The late-duplicate-return branch obliges the phase workflow to verify the late finding against source, write `<reviewer>.late.md`, link it from `<reviewer>.md`, move `verdicts["iter-NN"]` to the more severe token, clear that reviewer's latch and append a decisions-log line. No acting site carries any of it: step 7a/8a cites the section only for interrupted/split concerns, the verdict-recording step never mentions a late return, and both "Artefacts produced" lists omit `.late.md` — which `artifact-layout.md:43-44` now says the sprint tree may contain. Same one-sided-obligation shape the sprint set out to close. | Add a sub-bullet to step 7a/8a in both workflows naming the part they must execute, citing `review-policy.md` "Late duplicate return" rather than restating it, and add `<reviewer>.late.md` to each "Artefacts produced" list. |

## Behavioural check requested by the dispatch (`coverageManifestDigest`) — no finding

- Emitter and validator agree: `manifest-digest --write` stamps `LEDGER_VOCABULARY` into the file then digests the stamped content; `validateCoverageLedger` recomputes over the manifest exactly as written minus `digest`. Round-trip holds; a second `--write` is byte-idempotent.
- Pre-vocabulary manifests still validate: with no injection a legacy manifest digests to `fingerprint(manifest)`, the identity it was stamped with; the fixture at `tests/run.js:3290-3293` is built from the untouched `fingerprint` primitive rather than the function under test.
- Prose is true of the code: `review-policy.md:101`, `:107` both match `.asd/runtime.js:202-214`. Divergent-but-self-consistent manifests are rejected.

## Other sections

- **Bugs / Security / Best practices** — no medium-or-above finding. `runtime.js` adds no unhandled path, no secret or injection surface (`spawnSync` stays `shell: false` with bounded argv), no in-body comments.
- **Contracts** — no drift. `backward_compat` is not violated; the digest change is backward-tolerant by construction with a dedicated legacy fixture. `release-manifest.json` lists every edited canonical path; both freshness directions are machine-checked. `asd_version` at `7.0.0` is the expected pre-`pr` state.
- **AC coverage trace** — every AC traces to a change; `ac-9` n/a per manifest. AC-10 → F-2, AC-14 → F-3, AC-15 → F-1. AC-13's diff reachability is proven live by this dispatch's own scope list containing both memory files. AC-18 corroborated by both generated views carrying the new clauses.
- **Agent memory (in-surface source)** — `project_crlf-canon-edits.md` is accurate at HEAD; both `MEMORY.md` indexes resolve; the tester memory's load-bearing claims check out, including the dangling `asd-pm/MEMORY.md` link (pre-existing, outside this change surface).
- **UI conformance** — `n/a: no UI surface in scope file list` (phase-supplied predicate).

## Coverage

Validated compact ledger: [`correctness.ledger.json`](./correctness.ledger.json) against [`correctness.manifest.json`](./correctness.manifest.json), findings [`correctness.findings.json`](./correctness.findings.json). `validate-ledger` → `{"ok":true}`. 18/18 files, 18/18 rules, 6/6 sections resolved.

## Verdict

CONCERNS: 3 (all medium)

## Next action

Route to `impl` review-fix mode. All three are prose edits inside files already in the sprint's write scope — no escalation, no new abstraction, no scope expansion. Re-verify each premise at HEAD before applying; F-1's is checkable by reading the cited decisions-log entry.

## Escalations

None.
