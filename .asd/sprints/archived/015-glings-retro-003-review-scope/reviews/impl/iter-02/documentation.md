[REVIEW-impl-documentation]: CONCERNS

Manifest: [documentation.manifest.json](./documentation.manifest.json) · Patch: [documentation.diff](./documentation.diff)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| DOC-1 | medium | `.claude/agent-memory/asd-reviewer-testing/feedback_temp-repo-git-determinism.md:13` ("How to apply", 2nd sentence) | This memory tells the Testing reviewer to re-read the AC-7 message at `tests/run.js` ~3770, "which claims to be 'the suite's only call to the git binary'". The same range already fixed that message, so the claim is false at HEAD. It is a stale memory line that every dispatch pays for, and it fails the Documentation-economy removal test. | Delete that sentence. The rest of the file is accurate. |

## Checked

The iter-01 fixes hold at HEAD:
- The cap-override clause has a single home.
- The deleted helpers are fully gone.
- The draft snapshot has a single home in design-review step 7, and the external rule, prompt and README agree with it.
- The `<doc>` log literal matches everywhere.
- The audit-exit skip is user-initiated.
- BA/UX "propose in final text" matches promote step 4.
- The README FAQ is updated.
- The ponytail note moved into the JSDoc.
- No stub markers changed.
- The ledger hashes line up structurally.

## Verdict
CONCERNS: 1

```json
{"manifest_digest":"1a58c7371ad3f3a3de819c4b0b30ed600e66f2c4c4aba20f920ccbfa169ede57","findings":["DOC-1"],"files":[{"i":".asd/agents/asd-ba.md","s":"checked"},{"i":".asd/agents/asd-ux.md","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/checkpoints.md","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"},{"i":".asd/workflows/asd-phase-audit.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-promote.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-scope.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-efficiency/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-efficiency/feedback_no-shell-incremental-scope.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/feedback_temp-repo-git-determinism.md","s":"checked"},{"i":".claude/agent-memory/asd-tester-critical/project_testability-envelope.md","s":"checked"},{"i":"CHANGELOG.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"SSoT","s":"pass"},{"i":"Template adherence","s":"n/a","p":"no templated artefact in scope"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Stub-resolution verification (impl-review)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"pass"},{"i":"Documentation economy","s":"finding","f":"DOC-1"},{"i":"Custom rules consistency","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```
