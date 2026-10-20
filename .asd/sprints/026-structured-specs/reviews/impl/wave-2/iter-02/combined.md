[REVIEW-impl-combined]: APPROVE

## Findings

| id | severity | location / AC-N | description | fix |
|---|---|---|---|---|

## Section-coverage ledger

```json
{"manifest_digest":"b6b6a29ca73ba55546e72f82370d234f85d7b519ca1826f027a6b962e0d64dc8","findings":[],"files":[{"i":".asd/agents/asd-architect.md","s":"checked"},{"i":".asd/agents/asd-ba.md","s":"checked"},{"i":".asd/agents/asd-dev.md","s":"checked"},{"i":".asd/agents/asd-reviewer-combined.md","s":"checked"},{"i":".asd/agents/asd-reviewer-correctness.md","s":"checked"},{"i":".asd/agents/asd-reviewer-documentation.md","s":"checked"},{"i":".asd/agents/asd-reviewer-efficiency.md","s":"checked"},{"i":".asd/agents/asd-reviewer-testing.md","s":"checked"},{"i":".asd/agents/asd-ux.md","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"pass"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"pass"},{"i":"Best practices [impl-review]","s":"pass"},{"i":"AC coverage trace [impl-review]","s":"pass"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"pass"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"pass"},{"i":"Algorithmic complexity [impl-review]","s":"pass"},{"i":"Regression detection [impl-review]","s":"pass"},{"i":"Hot path identification [impl-review]","s":"pass"},{"i":"SSoT","s":"pass"},{"i":"Template adherence","s":"n/a","p":"no templated artefact in scope"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Stub-resolution verification (impl-review)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"pass"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":"Overall quality","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"reviewed"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"reviewed"},{"i":"Algorithmic complexity [impl-review]","s":"reviewed"},{"i":"Regression detection [impl-review]","s":"reviewed"},{"i":"Hot path identification [impl-review]","s":"reviewed"},{"i":"Overall quality","s":"reviewed"}]}
```

Fix trace for iteration 1 (scope: the 11-file incremental diff):

- Combined F1 is resolved. `asd-reviewer-combined.md:43` and `asd-reviewer-testing.md:37` no longer carry "(design-review: from iteration 2)". The three dual-phase reviewers keep that clause in their `optional` lists.
- Combined F2 is resolved. `asd-ba.md:52` now maps "missing audit input" to `ABORT`, and "other required input missing, or unrecoverable contradiction" to `FAILED`. This matches the baseline split and the other agents.
- External E1 is resolved.
  - `decisions` and `contracts` moved from `required` to `optional` in dev, correctness (impl-review) and efficiency (impl-review). `audit` moved to `optional` in documentation (design-review). This agrees with the conditional rows in `sprint-lifecycle.md:166-169`.
  - Dev's "required design doc missing" ABORT (`asd-dev.md:58`) now applies only to the required inputs that remain, so no conditional key can trigger it.
  - `ux` stays required for asd-ux on purpose: its hard design-system precondition owns that case, and the new test scopes `ux` out.
- External E2 is resolved. BA `concept`, Architect `stack` and UX `design-system` modes now exist, each flagged "no sprint required".
  - Each mode's required list matches its skill's delegate payloads: `asd-concept` variants A-D, `asd-stack` variants A-D (`SKILL.md:52-76`), and `asd-design-system` variants A-C (`SKILL.md:51-68`). Edit mode is covered in all three.
  - The UX ABORT on unreadable requirements is now limited to sprint dispatches.
  - The `checkpoints.md` "Gate policy" citation resolves at l.22, the standalone `/asd-concept`, `/asd-stack`, `/asd-design-system` clause.
  - The Architect `stack` mode replaces only `requirements`. It keeps `commands.yaml` and the backward_compat policy, both of which exist after `/asd-init` (the skill's own precondition; `asd-init` step 12 writes `commands.yaml`). Below floor, not a finding.
- External E3 is resolved. The UX precondition note now puts the cause and the fix in `agent-protocol.md` "Return" fields. No workflow or test parses the old literal (grep over canon: only the `.codex` view and archived diffs).
- New test `tests/run.js:8044-8055` pins E1 and E2.
  - It uses the existing `jsonOf` (l.3734) and `FORM_CATEGORIES.agents.files()` (l.7906).
  - The regex lookahead `(?![-a-z])` and the "when present" exemption match the lite-promote `payload.inputs.audit when present` entries.
  - It adds O(agents) file reads and no hot path.
  - The test-plan record shows 288/288 green after the added test.
- `release-manifest.json`: all 9 changed agents have their `canon_hashes` and `upstream_hashes` bumped in pairs, and each pair carries the same digest. I did not recompute the hashes (no shell). They are backed by the green suite record.

## Verdict

APPROVE: no findings at or above the high floor. All 11 scope files, all rules and all sections are resolved, and every iteration-1 finding (F1, F2, E1-E3) is fixed.

## Next action

Wave 2 impl-review can close for the combined reviewer. The orchestrator persists the manifest and ledger.

## Escalations

none
