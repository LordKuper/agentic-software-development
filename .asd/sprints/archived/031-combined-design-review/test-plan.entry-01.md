# Test plan entry 1 — sprint 031-combined-design-review

Rotated from `test-plan.md` at entry 2; never edited.

## Risk → check decisions

Pre-strategy run (`node tests/run.js`, full): 320/325, five red, all test defects against the old roster; no code defect found.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `standard.json` `reviewers.design`; design-review workflow `## Dispatch`, step 9 keys and skill description (AC-1, AC-2) | a roster key, dispatched agent, verdict key or skill dispatch left on the old pair, so the phase dispatches an agent no roster names | content contract, derived from the roster and the workflow definitions | add | `sprint-031 AC-1/AC-2/AC-3` pins the roster literals, then derives the Dispatch agents, step 9 keys and skill-description agents from them; no existing check read these |
| `asd-reviewer-{combined,quality,efficiency}.md` `## Inputs` and Gate Verdict Format (AC-3) | combined dispatched in design-review without design-review inputs, or quality/efficiency keeping an input block no dispatch reads | content contract, derived | add (Inputs), keep (verdict token) | the same test derives each reviewer's Inputs modes from the rosters; `sprint-020 AC-2/AC-4/AC-6` already derives each agent's `[REVIEW-<phase>-<key>]` token from the rosters and stayed green |
| combined in design-review at runtime (AC-2, AC-3, plan DoD) | the manifest reviews code entries in a draft review, UI conformance stays gated when a ux-spec/design-system draft is in scope, or a `[REVIEW-design-combined]` return fails to persist | component/contract through the CLI | add | `sprint-031 AC-2/AC-3 (DoD)` emits the manifest and persists the return through `persist-review`, and asserts `quality`/`efficiency` refused by both; the plan DoD names it |
| design-review tests written for `quality` | five tests asserted the old roster (`reviewerKeys('design')` now `combined`/`external`) | adapt | keep (adapted) | `review workflow contracts` (dispatch sentence and UI-entry wording), `sprint-015 AC-4/AC-5` and `sprint-017 AC-4/AC-8` (range and `--full-files` refusals through combined), `sprint-017 AC-8 (D9e)` (snapshot diffs through combined), `sprint-020 AC-4` (combined accepted, quality/efficiency refused), `sprint-012 AC-12` no-HTML phase-independence and UI phase-gate lift (combined); each keeps its original assertion on the retained surface |
| `rangePatchInvocations` (AC-9, issue #74) | a scope above the Windows command-line cap fails the diff; a chunk edge parts a rename from its source; an empty list runs git; a scope below the budget changes its single invocation and `.diff` name | component, real git repo with a `child_process` spy preloaded into the runtime CLI | add | observes every git argv the runtime spawns, so the budget, list order, rename pairing, empty list and unchanged single invocation hold on any host, not only where the cap bites; `patchBytes` and `writeManifestDiff` consume the same list |
| `reviewFindings` header check (AC-10, issue #78) | an extra category column read as the location; a header not led by `#`; a translated header rejected | unit | add | pure function with a real failure mode (silent mis-read); a translated header is the language-neutral counterpart the decisions log fixed |
| efficiency return rule (AC-10) | the agent prose tells reviewers to add a category column | none beyond the leftover-term pin | none | the `category column keep-as-is/simplify/escalate` sentence is in the leftover-term check; the runtime now fails such a return before any row is read |
| removed roster wording across canon, README, agent memory | a surviving sentence still sends standard design-review to Quality and Efficiency | content sweep (leftover-term check) | add | `sprint-031 leftover-term check` pins the exact sentences the diff removed, over canon, README, runtime, hook, standard.json and `.claude/agent-memory/**`; sweep ran clean, no memory hit |
| rule docs and README roster mirrors (AC-4) | a mirror still states the old roster | none new | none | DoD rows are derived from the rosters by `sprint-020 AC-2/AC-4/AC-6`, README tables and flowchart by the phase-chain mirror tests, and removed wording by the leftover-term check above |
| `review-policy.md` "Verify before applying" (AC-5) | fixer applies a suggested fix without the over-engineering check | none | none | judgement guidance a reviewer applies, no token, parser or gate to pin; the existing `Verify before applying` pins (heading, impl citation) stay green and cover the rule's home |
| `asd-phase-impl.md` step 7 fix-round sync (AC-6) | sync runs after the tester chain | none | none | orchestrator ordering prose with no parsed token; the dev-before-tester chain ordering pin (`dispatched only after the dev chain completes`) stays green |
| `custom-common-rules.md` Git Bash line (AC-7) | none | none | none | project-owned instruction line, no consumer in code; checked by reading the file |
| `sprint-lifecycle.md` "Scope amendment" contradiction check (AC-8) | amendment accepted against a contradicting criterion | none | none | judgement duty of the orchestrator at a gate; the "Scope amendment" step pins stay green |

Leftover-term check (first entry, `artifact-layout.md` "Agent memory"): the removed sentences taken from `git diff main...HEAD` were searched across the repo, `.claude/agent-memory/**` and the retired agents' directories included; no hit outside tests, sprint folders and rotated logs. The wider free-phrasing search (`design-review` near `quality`/`efficiency`) returns only current statements.

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | each red test still covers a retained surface; adapted, not removed | yes |

## Added tests

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-031 AC-1/AC-2/AC-3 | mutation (scratch copy of `git archive HEAD`; repo tree untouched) restoring the superseded rule per assert: `standard.json` design roster → `quality, efficiency, external`; Dispatch agent → `asd-reviewer-quality, asd-reviewer-efficiency`; step 9 `(keyed ...)` → old keys; skill description → old pair; combined `design-review` Inputs block removed: `node tests/run.js --filter "sprint-031 AC-1/AC-2/AC-3"` → exit 1 each, `sprint-031 AC-1/AC-2/AC-3: ...`, 1/330 matched; reword control (step 9 opening clause reworded, tokens kept) → exit 0, 1/1; runs: 6 |
| tests/run.js: sprint-031 AC-2/AC-3 (DoD) | mutation `standard.json` design roster → `quality, efficiency, external`: `node tests/run.js --filter "sprint-031 AC-2/AC-3 (DoD)"` → exit 1, `sprint-031 AC-2/AC-3 (DoD): ...`, 1/330 matched; runs: 1 |
| tests/run.js: sprint-031 AC-9 (issue #74) | fail-first vs the pre-fix `.asd/runtime.js` (`git show main:.asd/runtime.js` in a scratch copy): `node tests/run.js --filter "sprint-031 AC-9"` → exit 1, `sprint-031 AC-9 (issue #74): ...` (the emit's git call exceeds the command-line cap); mutations of the chunker: per-path split, budget doubled, fixed args uncounted, empty list yields one invocation, `--no-textconv` dropped from the single invocation: each → exit 1, same test, 1/330 matched; runs: 6 |
| tests/run.js: sprint-031 AC-10 (issue #78) | fail-first vs the pre-fix `.asd/runtime.js` (scratch copy): `node tests/run.js --filter "sprint-031 AC-10"` → exit 1, `sprint-031 AC-10 (issue #78): ...`; mutations: column-count check removed, `#` check removed → exit 1, same test, 1/330 matched; runs: 3 |
| tests/run.js: sprint-031 leftover-term check | mutation reinserting a removed sentence (`Lite impl-review reviewer, one pass`) into `README.md`: `node tests/run.js --filter "sprint-031 leftover-term"` → exit 1, `sprint-031 leftover-term check: ...`, 1/330 matched; runs: 1 |
