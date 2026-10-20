[REVIEW-impl-combined]: APPROVE

## Findings

| id | severity | location / AC-N | description | fix |
|---|---|---|---|---|

## Section-coverage ledger

```json
{"manifest_digest":"4411a588e0436bb85ba06a148272f90ca0c16389265135b4fc11dd018391a284","findings":[],"files":[{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/skills/asd-init/SKILL.md","s":"checked"},{"i":".asd/skills/asd-sync/SKILL.md","s":"checked"},{"i":".asd/skills/asd-update/SKILL.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-promote.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-test.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked"},{"i":".asd/workflows/asd-phase-retro.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-combined/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-combined/feedback_dispatch-payload-vs-required.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"pass"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"pass"},{"i":"Best practices [impl-review]","s":"pass"},{"i":"AC coverage trace [impl-review]","s":"pass"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"pass"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"pass"},{"i":"Algorithmic complexity [impl-review]","s":"pass"},{"i":"Regression detection [impl-review]","s":"pass"},{"i":"Hot path identification [impl-review]","s":"pass"},{"i":"SSoT","s":"pass"},{"i":"Template adherence","s":"n/a","p":"no templated artefact in scope"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Stub-resolution verification (impl-review)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"pass"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":"Overall quality","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"reviewed"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"reviewed"},{"i":"Algorithmic complexity [impl-review]","s":"reviewed"},{"i":"Regression detection [impl-review]","s":"reviewed"},{"i":"Hot path identification [impl-review]","s":"reviewed"},{"i":"Overall quality","s":"reviewed"}]}
```

Iteration-1 finding resolution (the whole 307-line incremental diff was read):

- F1 (high) resolved. design-promote now sends `inputs.requirements` in its step-3 row and in both modes of its step-4 row. design-review's creator fix row sends `inputs.requirements` and `inputs.ux` (asd-ux). Its External Review row sends `iteration`. This matches `asd-architect.md:21`, `asd-ux.md:21` and `asd-external-review.md:28`.
- F2 resolved. No backticked `[GATE …]` is left in canon. impl-review's reviewer-question branch now carries design-review's `[GATE hard: reviewer question]` marker.
- F3 resolved (retro Draft item now says "re-runs Coverage (item 2 above)").
- F4 resolved. asd-update says "steps 2-7", and asd-update's last step is 7. The invented `else` values are gone from asd-init and asd-sync, and the §26 shape `{requires, else?, ops}` (`tests/run.js:7989`) treats `else` as optional.
- F5 resolved. The stalemate set key is `findings` in both review workflows. `turn_budget` is listed in both; it is a core payload key (`agent-protocol.md` "Dispatch payload"). impl-review's Exit route is split into standard→retro and lite→design-promote, which the §26 `{if, next}` shape and the §16 return-contract union accept. `MEMORY-FIX` moved into `when`, so `signals` holds protocol tokens only.
- F6 resolved. A new sweep pins ADVICE_NEEDED listed ⇔ "Relay" branch for every workflow. `neverRun` now takes the leading `<command> (` token of each deny item, which still yields `designmd-install` for asd-ux (`asd-ux.md:45`).
- Manifest hashes: the tester recorded 289/289 green and `sync.js --check` ok for entry 5 (`test-plan.md:44-45`). I did not recompute these (no shell).
- Below floor, not raised: design-promote's `## Inputs` (l.14) lists no sprint.md for standard mode, yet the step-4 row now sends `inputs.requirements` in both modes. This is low severity, because the orchestrator always holds the path to `sprint.md`.

## Verdict

APPROVE. All six iteration-1 findings are resolved, and the incremental diff adds no new high or critical finding.

## Next action

Continue the impl-review aggregation for wave 3.

## Escalations

none
