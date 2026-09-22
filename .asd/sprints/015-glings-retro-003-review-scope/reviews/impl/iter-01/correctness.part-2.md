[REVIEW-impl-correctness]: CONCERNS

Manifest: [correctness.part-2.manifest.json](./correctness.part-2.manifest.json) · Patch: [correctness.part-2.diff](./correctness.part-2.diff)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| P2-1 | medium | `.asd/workflows/asd-phase-audit.md:9` (step 5), AC-8 | Step 5 always opens with a hard prompt offering the per-sprint skip for each frozen-`true` document. It fires on every audit exit with an enabled document, including under `user_gates: adaptive` and after a mechanical step-1 audit skip. The user was already offered the skip at the scope gate. AC-8 requires only that a requested skip be a hard gate. | Keep audit-exit skips user-initiated: fold the offer into step 4's presentation when a decision is already awaited, or apply the skip only on user request. Never add a standalone prompt to an adaptive or mechanical exit. |
| P2-2 | medium | `.asd/workflows/asd-phase-design-promote.md:8` (step 4), AC-6 | "User approves → orchestrator runs `git mv`/`git rm` inline → creator updates content and links" cannot run as written. Creators are single parallel dispatches awaited once at step 5, so none can pause mid-dispatch for git. There is no return-proposal/re-dispatch step, and `asd-ba.md`/`asd-ux.md` have no way to return a proposal. | Creator returns the proposal in its final text; the orchestrator gates it and runs git, then re-dispatches that creator fresh before step 5 to fix content and links. Add a "propose, never perform" line to the BA/UX bodies, then run sync. |
| P2-3 | low | `.asd/workflows/asd-phase-scope.md:8` (step 3a), AC-8 | The log line is written `"skipped this sprint by user"`, but `sprint-lifecycle.md:129` defines `"<doc> skipped this sprint by user"`. The AC-8 test checks only the suffix. | Quote the full form. |
| P2-4 | low | `CHANGELOG.md:14`; `README.md:297`; `README.md:211` | (a) CHANGELOG says `git diff --raw -M100%` and README says "proven R100 renames". The runtime actually uses `-M` and requires the same blob and the same mode, so a mode-changing R100 rename is refused. (b) `README.md:211` says "Each reviewer's payload carries only its own emitted manifest … `.diff`", but External Review gets a scope manifest with `base_ref`/`head_ref`. | (a) Say "identical content and mode" and drop `-M100%`/`R100`. (b) Say "Each internal reviewer's payload…". |

## Coverage notes

Checked: all 13 files; workflows against AC-2/4/6/7/8/9/10/11; the new tests against the runtime; CHANGELOG 11.0.0 against `asd_version`; the no-migration note; `maxTurns` 150; the memory files.

## Verdict
CONCERNS: 4 (2 medium, 2 low)

## Escalations
P2-1: narrowing the audit-exit offer changes a plan-declared behaviour (`plan.md:18`/`:66` "offered at … the audit exit"), so it needs user approval.

```json
{"manifest_digest":"c2c41d18908bb744f0e0bcb52a337f7b3ed6f73823038b95f7507c89aed8f324","findings":["P2-1","P2-2","P2-3","P2-4"],"files":[{"i":".asd/skills/asd-sprint/SKILL.md","s":"checked"},{"i":".asd/workflows/asd-phase-audit.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-promote.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked"},{"i":".asd/workflows/asd-phase-scope.md","s":"checked"},{"i":".claude/agent-memory/asd-dev-critical/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-dev-critical/project_json-frontmatter-quotes.md","s":"checked"},{"i":".claude/agent-memory/asd-tester-critical/feedback_fail-first-and-none-honesty.md","s":"checked"},{"i":"CHANGELOG.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"finding","f":"P2-1"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"finding","f":"P2-3"},{"i":"Best practices [impl-review]","s":"finding","f":"P2-4"},{"i":"AC coverage trace [impl-review]","s":"finding","f":"P2-2"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"}]}
```
