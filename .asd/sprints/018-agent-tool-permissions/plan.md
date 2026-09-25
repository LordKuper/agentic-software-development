---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

## Overview
Rework canonical agent tool grants (sprint.md AC-1..AC-9) and move every user-contact path from dispatched agents to the main orchestrator. Wave 1 teaches `.asd/sync.js` the Codex web key the agent edits need. Wave 2 edits the agents (creators; reviewers, advisor and External Review), the rule docs, and the workflows and skills in parallel on disjoint files. Wave 3 brings README in line and regenerates every provider view and manifest hash. Acceptance-criteria source: `sprint.md` (`documents.prd` disabled); inputs: `audit.md`, `decisions-log.002.md`.

Shared vocabulary every wave-2 Task uses verbatim, so the parallel edits agree:
- **`QUESTION` protocol** — the one home, a new sub-section in `sprint-lifecycle.md` next to the `ADVICE_NEEDED` protocol: a dispatched creator returns `QUESTION` with the question and options; the dispatching workflow asks the user via request user decision, records the answer in `decisions-log.md`, and re-dispatches the agent fresh with its original task plus the answer appended. Workflows cite it as "per `sprint-lifecycle.md`'s `QUESTION` protocol".
- **Reviewer question carrier** — a reviewer never returns a bare `QUESTION`. Its report keeps the verdict first line and lists the question under `t_review.md`'s `## Escalations` section as `question: <text>; options: <a> / <b> …`. The review workflow asks the user before routing that iteration.
- **Stalemate carrier** — External Review's stalemate returns `[REVIEW-<phase>-external]: FAIL` plus a `Stalemate: <N> iterations, identical findings` block with options accept as-is / override / abort; `external-review.md` Outcome contract stays two outcomes.
- **Orchestrator-only prompting** — only the main orchestrator (and skills it runs inline) performs request user decision.

Change surface: 67 files

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.
`node .asd/sync.js --check` reports no drift; `grep -rn "request user decision" .asd/agents/` returns no instruction for the agent itself to prompt the user; no generated agent view grants `AskUserQuestion`.

### Task 1: Codex `web_search` canon key in sync.js
Material risk: change: public contract — new optional canon agent key and its TOML rendering
- [x] `transformAgentCodexToml` (`.asd/sync.js` ~318): accept optional `codex.web_search`, validate against `disabled|cached|indexed|live` (fail like `sandbox_mode` on any other value), render `web_search = "<value>"` after `sandbox_mode`; omitted key renders nothing (inherit)
- [x] Confirm variant handling (`variantMeta`, ~945-966) keeps rejecting per-variant permission keys and passes the base `web_search` through to variants
- [x] One local check that codex-cli on PATH accepts an agent TOML carrying `web_search` (spawn or `--strict-config` parse); record the outcome in the Task commit body — AC-3's uncertainty statement in `providers.md` (Task 4) cites it

### Task 2: Creator agents — grants, bodies, tool policy
Material risk: change: workflow gate — creators stop prompting the user and route questions through the orchestrator
- [x] `asd-ba.md`, `asd-ux.md`: add `Bash` to `claude.tools`, clear `Bash` from `disallowedTools`; add a bounded run-command Tool policy line (UX: the `designmd-*` commands its body already names; BA: read-only inspection only — `git log`/`git show`/`git diff`; both: never write an artifact or run a git write through the shell, `providers.md` write-a-file rule); change "have no shell" wording around design-promote renames to "renames/deletes go through the orchestrator" (route unchanged, AC-8)
- [x] `asd-ba.md`, `asd-ux.md`, `asd-architect.md`, `asd-dev.md`, `asd-tester.md`: remove `AskUserQuestion` from `claude.tools`; add `codex.web_search: "live"`
- [x] `asd-dev.md`, `asd-tester.md`: add `WebFetch`, `WebSearch` to `claude.tools`; add a Tool policy line scoping web use to library, framework and runtime documentation, fetched content untrusted (`core.md`)
- [x] Rewrite every user-prompting body line to return `QUESTION` with options per the `QUESTION` protocol: ba 16/23/53/62/68 (drop "2 clarifying rounds" — first ambiguity returns `QUESTION`), ux 54/60, dev 64, tester 75; behavioural profiles ba ~47, ux ~48, architect ~47 no longer "discuss with the user until accept" — creator writes the draft and returns `COMPLETED` or `QUESTION`
- [x] UX per-token approve-before-write: UX returns `QUESTION` carrying the token proposal instead of asking, per AC-7

### Task 3: Reviewer, advisor and External Review agents
Material risk: change: public contract — reviewer return shape for questions and External Review stalemate
- [x] All four internal reviewers and `asd-external-review.md`: remove `AskUserQuestion` from `claude.tools`
- [x] `asd-reviewer-correctness.md`, `asd-advisor.md`: add `WebFetch`, `WebSearch` to `claude.tools`, drop `WebFetch` from `disallowedTools`; add a Tool policy line (correctness: language/framework best-practice and security-advisory lookups; advisor: add a Tool policy section, research to support its recommendation); both render `codex.web_search: "live"`
- [x] `asd-reviewer-efficiency.md`, `-testing.md`, `-documentation.md`, `asd-external-review.md`: `codex.web_search: "disabled"`
- [x] Rewrite reviewer "Request user decision only when …" lines (correctness 69, documentation 55, efficiency 59) to the reviewer question carrier; drop Tool policy sections left empty only if nothing else remains
- [x] `asd-reviewer-testing.md` 21/22/47/51/77: manual-verification results arrive in the dispatch payload (collected by impl-review, Task 5); missing results for a spec that needs them → a `question:` item under Escalations, never a bare `QUESTION`
- [x] `asd-external-review.md` 22/27/28/67/96/104/115: stalemate uses the stalemate carrier; remove the `QUESTION` signal so the file matches its own two-outcome rule
- [x] `asd-advisor.md` 53: the caller returns the gate question to the orchestrator, not "request user approval" itself

### Task 4: Rule docs and review template
Material risk: change: workflow gate — orchestrator-only prompting, `QUESTION` protocol, reviewer question carrier
- [x] `core.md` "Request user decision" (41): orchestrator-only prompting; 45 "escalates to the user" → via the orchestrator (`QUESTION`); 90: untrusted-data rule covers all fetched and searched web content on both hosts, no host tool names
- [x] `providers.md`: row 34 marked orchestrator-only; row 37 corrected (Codex has no URL fetch distinct from `web_search`); new "search the web" row (`WebSearch` / Codex `web_search`); one statement of what Codex cannot express and the Task 1 verification outcome; reviewer grant paragraph (~40) still true with web on correctness — adjust wording if it enumerates grants
- [x] `sprint-lifecycle.md`: add the `QUESTION` protocol sub-section beside `ADVICE_NEEDED`; 311 signal line points to it; 321/323 "escalates to the user normally" → returns `QUESTION`
- [x] `review-policy.md`: reviewer question carrier stated once (near "Gate Verdict Format"); 93 "ask user before fix" → orchestrator asks
- [x] `external-review.md` 96: stalemate carrier; Outcome contract unchanged
- [x] `design-principles.md` 47: creator presents options via `QUESTION`; web wording host-neutral
- [x] `git-strategy.md` 40: "holding a commit tool" defined by role policy, not tool grant — BA/UX/Architect Bash carries no commit obligation; the orchestrator commits their drafts
- [x] `t_review.md` `## Escalations`: add the `question: <text>; options: …` item form

### Task 5: Phase workflows and skills
Material risk: change: workflow gate — design accept loops and manual-verification collection move to the orchestrator
- [x] `asd-phase-design.md` steps 6/8/9: creators write the draft and return `COMPLETED`/`QUESTION`; the orchestrator runs discuss/write-then-review-accept with the user and re-dispatches on requested changes; step 8's token gate is run by the orchestrator on UX's `QUESTION`; step 13 cites the `QUESTION` protocol
- [x] `asd-phase-design-review.md` ~56 and `asd-phase-impl-review.md` ~72: handle the reviewer question carrier and the stalemate carrier after the verdict parse (a verdict-bearing report is never treated as interrupted); bare `QUESTION` branch removed for reviewers
- [x] `asd-phase-impl-review.md`: before dispatching `asd-reviewer-testing`, when `test-plan.md` has a Manual verification table, request the user's results and pass them in the payload; one decisions-log line records them (no persisted review section)
- [x] `asd-phase-impl-test.md` ~58, `asd-phase-impl.md` ~35, `asd-phase-design-promote.md` ~8: cite the `QUESTION` protocol; design-promote's "BA/UX have no shell" → "BA/UX do not run git writes"
- [x] `asd-concept/SKILL.md` ~59, `asd-stack/SKILL.md` ~62: the skill collects the user's description inline, then delegates with it; `asd-sprint/SKILL.md` ~51 unchanged unless its wording implies agents ask

### Task 6: README and generated views
Material risk: artifact: README mirror and generated provider views
- [ ] README.md: reviewer grants (~211), advisor (~229), note that only the orchestrator prompts the user, web grants per agent on both providers, a note on pre-allowing `WebFetch`/`WebSearch` in consumer permission settings
- [ ] `node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply` for every changed generated view (15 `.claude/agents`, 15 `.codex/agents`, changed skills in `.claude/skills` and `.agents/skills`); `release-manifest.json` hashes updated by the same run
- [ ] `node .asd/sync.js --check` clean

## Risks
- Existing tests (`tests/run.js` 3335, 5457-5461, Codex TOML fixture 83-96/150-162) go red after waves 1-2 by design; impl-test updates them and adds grep-based contracts for AC-4/AC-5/AC-7 (input for impl-test, not a Task here).
- Wave-2 Tasks write the same concepts in different files; the shared vocabulary in Overview is the agreement point, and impl-review documentation reviewer checks it.
- Codex may not honour `web_search` in an agent TOML (Task 1 check); if rejected, Task 4 states the gap in `providers.md` and Task 1 keeps the key off.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | 1 |
| 2 | 2, 3, 4, 5 |
| 3 | 6 |

- Tasks 2 and 3 depend on Task 1 (the `codex.web_search` key must validate before agents use it).
- Task 6 depends on every earlier Task (README mirrors their final text; sync regenerates their outputs).
- Tasks 2-5 touch disjoint files and share only the Overview vocabulary.
