[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| TST-1-1 | low | `tests/run.js:5777-5778`; `test-plan.md` entry 2 row "`providers.md` 'Declared tool policy' D-1 fix (0533ef8)" (AC-4/AC-5) | Message claims the refusal line "must route a reviewer through its question carrier", but the check only confirms the line contains `` `review-policy.md` "Gate Verdict Format" ``. Rewording the carve-out to `(see \`review-policy.md\` "Gate Verdict Format")` stays green while the line again tells every agent, reviewers included, to return a bare `QUESTION` (audit's high-impact risk). Entry 2's `none` over-claims; the sibling signal-vocabulary check already pins subject + citation together (`/\breviewer\b/.test(signal) && signal.includes(...)`). | Add `/\breviewer\b/.test(declared)` (or tie `reviewer` and the citation to the same `—`-delimited clause), then re-record the F1 revert proof or narrow the entry-2 risk wording. |
| TST-1-2 | low | `tests/run.js:5481-5485` (sprint-015 BA/UX Run-command asserts); `test-plan.entry-01.md` row "`asd-ba.md`/`asd-ux.md` Bash (AC-1, AC-8)" | AC-8 bounds BA/UX shell by (a) named commands and (b) no artifact/git writes. Asserts check only (b); a BA line widened to "any command; never write an artifact or run a git write …" passes. No `none` row covers the allowlist half. | Per BA/UX Run-command line assert it names ≥1 backticked command under an `only` scope (e.g. `/\bonly\b/.test(line) && /\`[^\`]+\`/.test(line)`), or record a `none` row with its reason. |

Checked statically: 228 `^test\(` declarations match the 228/228 run; Suite-run HEAD dd8f6ba matches the decisions log; mutation proofs M36/M37/M38/M9 replay; D-2 fix double-pinned; derived sets (5 creators, 4 web-less, one self-prompt hit containing "never") non-vacuous; `none` rows (README split, Codex URL-fetch gap, Architect Bash) honest; AC-1..AC-9 each covered by an automated check (AC-6 README half → documentation); no Manual verification needed.

## Coverage (internal reviewers only)

```json
{"manifest_digest":"eda6aa270d7631b1777c3e2ae1652e7806670f34ec9cea26169b899c33cd18ed","findings":["TST-1-1","TST-1-2"],"files":[{"i":"tests/run.js","s":"checked"},{"i":".asd/sprints/018-agent-tool-permissions/test-plan.md","s":"checked"},{"i":".asd/sprints/018-agent-tool-permissions/test-plan.entry-01.md","s":"checked"}],"rules":[{"i":"Rule-set conformance","s":"finding","f":"TST-1-1"},{"i":"Coverage","s":"finding","f":"TST-1-2"},{"i":"Edge cases","s":"pass"},{"i":"Manual verification (last resort)","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```

## Verdict
CONCERNS: 2

## Escalations (optional)
None.
