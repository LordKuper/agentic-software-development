[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02 (floor medium)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| TST-2-1 | medium | `tests/run.js:5759-5761`; `test-plan.md` entry-3 row "ADVICE_NEEDED steps 4/6 reviewer carve-out (5746479)" (AC-4/AC-5); `.asd/rules/core.md:47` | The sweep matches only the literal `returns \`QUESTION\``, yet the row claims it covers "any new generic line automatically". `core.md:47` (Autonomy/Gate-uncertainty, rewritten this sprint) routes "a dispatched agent via `QUESTION` to the orchestrator" with no reviewer carve-out — the D-1 class a third time, green under the sweep. | Widen the sweep to any rules line routing a generic/dispatched agent to `QUESTION` (excluding creator-scoped lines like `design-principles.md:47`); it then fails on `core.md:47` → canon carve-out. Or narrow the row's claim and record a `none` row. |
| TST-2-2 | medium | `tests/run.js:5787`; `test-plan.entry-02.md` row "review-fix wave-1/iter-01 correctness 2 / dev 0ae55c7" (AC-4); `.asd/workflows/asd-phase-design-review.md:47`, `.asd/workflows/asd-phase-impl-review.md:56` | The `keep` reason says workflows no longer restate option names, but both lines do ("stop / continue fixing / abort"). Only the citation is checked, so a home rename leaves stale names offered to the user with the test green. | Compare each workflow's stalemate options against the derived home set (`optionList` accepting `options (`), or remove the names from the workflows; re-record S4/S5 proofs. |
| TST-2-3 | medium | `tests/run.js:5660-5662`; `test-plan.md` entry-3 row "BA/UX/Architect web search scope … (d802f2c, f590a76)" (AC-9) | The `keep` row cites an assert needing only a `web`/`URL` word; pre-fix fetch-only lines pass it, so correctness 5's fix has no fail-first proof. The structural "<fetch> / <search> only for" check (`:5666-5669`) runs only on `asd-dev`. | Run the `:5666` form over every web-granted agent whose policy names the fetch op (derived, not hand-listed); record a revert-to-`d802f2c~1` proof. |

Holding: TST-1-1, TST-1-2, at-least-CONCERNS assert, sweep sanity (4 lines), stalemate home set, 228 declarations = 228 passed, entry-3 HEAD 0bd998c, review-fix → proof mapping; no Manual verification needed.

## Coverage (internal reviewers only)

```json
{"manifest_digest":"f518ac19ec3a69a3e32de6f25aed3a8305ec86d1f7bedc0921c487baa9df3204","findings":["TST-2-1","TST-2-2","TST-2-3"],"files":[{"i":"tests/run.js","s":"checked"},{"i":".asd/sprints/018-agent-tool-permissions/test-plan.md","s":"checked"},{"i":".asd/sprints/018-agent-tool-permissions/test-plan.entry-01.md","s":"checked"},{"i":".asd/sprints/018-agent-tool-permissions/test-plan.entry-02.md","s":"checked"}],"rules":[{"i":"Rule-set conformance","s":"finding","f":"TST-2-2"},{"i":"Coverage","s":"finding","f":"TST-2-3"},{"i":"Edge cases","s":"finding","f":"TST-2-1"},{"i":"Manual verification (last resort)","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```

## Verdict
CONCERNS: 3

## Escalations (optional)
None.
