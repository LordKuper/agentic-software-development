---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

## Overview

Restructure agents, phase workflows and standalone skills into one form per category, move orchestrator↔agent communication into one protocol file, and apply O1-O4 plus retro rows 025#A-1/A-3/P-1 (`sprint.md` AC-1..AC-13). Inputs: `sprint.md` (Form, AC-N), `audit.md` (Contradictions C-1..C-4 settled, Gaps, Risks). Every Task preserves meaning: each baseline rule, gate, signal and constraint ends stated once, moved, merged or cited (AC-13); each Task's `COMPLETED` report lists `moved: <old section> → <new home>` for every relocated rule.

**Plan decisions** (D1-D10):

- **D1 JSON inside Markdown**: a JSON block is one fenced ```` ```json ```` block, the whole content of its section unless the section says otherwise. JSON carries flat declarative facts only (paths, names, conditions, signals, keys); a value is one line of plain text, never multi-paragraph Markdown. Keys are English (`language-policy.md`). No backslash anywhere in an agent body (Codex TOML writer, audit Risks). Rubric text and reviewer verdict/findings stay verbatim Markdown (runtime.js parses them, audit Existing implementation).
- **D2 Agent form** (`.asd/agents/*.md` body, sections in this order, no others):
  1. `# Role` — one or two sentences: who, and the goal. Never restates `description`.
  2. `## Inputs` — JSON `{"rules": [...], "required": [...], "optional": [...], "modes": {"<mode>": {"when": "<payload/state condition>", "required": [...]}}}`. `rules` is always `["core.md", "agent-protocol.md (agent sections)", "providers.md \"Role-scoped context\" row <name>"]` plus role-specific extras; `custom-common-rules.md` stays implied by `providers.md`. Requirement, decision, UX and contract inputs are payload keys resolved by the orchestrator from `sprint-lifecycle.md` "Input sources" (D7), named as `"payload.inputs.<key>"`, never re-derived from `documents.*`/workflow/`self_hosting` in the agent. `modes` omitted for a single-mode agent.
  3. `## Outputs` — JSON array of `"<path or artifact> (<format ref>)"`.
  4. `## Rules` — Markdown list, each line starting `must:` or `never:`; absorbs Behavioral profile, Do's, Don'ts, Output format, Operating contract Scope.
  5. `## Tools` — JSON `{"run": [...], "deny": [...], "write": [...], "write_self_hosting": "...", "web": "..."}`, keys present only when they apply; absorbs Operating contract Authority and Tool policy. `asd-reviewer-testing` gains one (read-only, write own review file).
  6. `## Escalation` — JSON array `[{"when": "...", "signal": "<TOKEN>", "note": "..."}]`; absorbs Approval triggers and Stop conditions. `note` optional.
  7. `## Signals` — JSON array of the tokens the agent emits; return shapes cited from `agent-protocol.md` "Return", never restated.
  8. Domain sections, closed list, only where the agent has one, headings exact: `## Review rubric` (verbatim), `## Section coverage ledger`, `## Gate Verdict Format`, `## Severity mapping`, `## Invocation`, `## Test selection rubric`, `## Failure triage`, `## Manual steps`, `## Evidence routing`, `## Diagram modes`, `## Token decisions`, `## Tech reference`. External Review's `` `{{wraps_cli}}` invocation (…) `` and `Severity mapping (…)` headings normalize to `## Invocation` / `## Severity mapping`; UX's `Precondition check (hard)` paragraph goes to `## Escalation`. `## Mandatory rules`, `## Operating contract`, `## Behavioral profile`, `## Tool policy`, `## Do's`, `## Don'ts`, `## Signals emitted`, `## Output format` disappear.
- **D3 Description cap (O1)**: frontmatter `description` ≤ 300 chars: `<what it does>; <phase/dispatch purpose>. Not: <x> → <agent>; …`. Generated variant suffixes (`sync.js` l.968) are exempt; the cap applies to the canonical base. `asd-tester` keeps its review-fix/test-files clause (test l.6429). AGENTS.md tail's description convention is rewritten to match (Task 7).
- **D4 Phase workflow form** (`.asd/workflows/asd-phase-*.md`, in order): `# ASD Workflow: <Phase>`; owner line `Owner: <inline orchestrator | …>; dispatches <agents|none>.`; `## Entry` JSON `{"requires": [...], "modes": {"<mode>": "<state.json condition>"}, "ops": [...]}` (`ops` absorbs "Operations used", "Timing:" and "Append friction" lines; `modes` omitted for single-mode phases); `## Inputs` JSON array; `## Steps` numbered, numbers unchanged from baseline where a step survives (audit Risks: ~346 step refs), gates marked inline `[GATE <hard|adaptive|write-then-review-accept>: <name>]`, `### ` subheads allowed for modes (pr Open/Merge mode, impl modes); `## Rules` (optional) agent-facing phase rules, Markdown list, the section `providers.md` rows grant to dispatched agents (C-1); `## Dispatch` (optional) JSON `[{"agent": "...", "when": "...", "payload": ["<key>", ...], "signals": [...]}]`; `## Signals` (optional) JSON `{"<TOKEN>": "<deviation from agent-protocol.md>"}`; `## Exit` JSON `{"writes": [...], "next": [{"if": "...", "next": "<phase|await-merge|done>"}]}`; `## Return` (D6); `## References` list. "Preconditions", "Operations used", "Artefacts produced", "Agents delegated to", "Delegates", "Execution mode", "Modes", "Re-entry", "Escalation (…)" disappear into those slots.
- **D5 Standalone skill form** (`asd-sprint`, `asd-init`, `asd-concept`, `asd-design-system`, `asd-stack`, `asd-sync`, `asd-update`; in order): `# <Title>`; the existing `Operation mapping: see .asd/rules/providers.md.` line where present; `## Purpose` one line; `## Preconditions` JSON `{"requires": [...], "else": "...", "ops": [...]}`; `## Modes` JSON `{"<mode>": "<detection>"}` (omit for single-mode); `## Steps` numbered, `### ` subheads per mode/phase allowed — existing cited subheads keep their names (`### Sprint-mediated mode` in asd-update, asd-sprint `### Step 0`..`### Step 3`, asd-init `### Always first`, `### Fresh`, `### Re-init`, `### Sprint-mediated`); `## Rules` (optional) must/never list (absorbs "Hard rules", "Self-hosting guard"); `## User decisions` JSON `[{"step": "...", "gate": "...", "class": "...", "options": [...]}]` (absorbs "User-input request shapes"); `## Delegates` JSON `{"agents": [...], "skills": [...]}`; `## Outputs` JSON array; `## Reference` (optional, data tables such as asd-init "AGENTS.md sync", "OS-specific commands …"); `## Return` (D6); `## References`. `asd-phase-*` triggers unchanged.
- **D6 Return lines (AC-5)**: phase `PHASE: <p> | SPRINT: <id> | [WAVE: <K> | ][ITER: <N> | ]STATUS: <…> | NEXT: <…>` (pr keeps its STATUS/NEXT values); skill `SKILL: <name> | [MODE: <m> | ][<skill keys> | ]STATUS: <…> | NEXT: <…>` — asd-sprint `SKILL: asd-sprint | SPRINT: <id> | PHASE: <p> | STATUS | NEXT`, asd-init `SKILL: asd-init | MODE: <fresh|re-init|sprint-mediated> | …` keeping its keys, asd-sync/asd-update gain `SKILL: asd-sync|asd-update | STATUS: <complete|aborted> | NEXT: <…>`. Section heading is `## Return` everywhere, one fenced line. `NEXT:` stays the key asd-sprint Step 3 reads.
- **D7 Input sources (O2, AC-7)**: new subsection `sprint-lifecycle.md` "Input sources" inside "Optional documents": table `key | resolves to | condition`, keys `requirements` (PRD subsystem doc when `documents.prd` and `standard`, else `sprint.md` AC-N; `lite` always `sprint.md`), `decisions` (persistent doc folding the relevant ADR), `contracts` (`stack.html` + fold doc), `ux` (ux-spec, DESIGN.md, design-system.html, accessibility.html when present; `self_hosting` no-baseline → `stack.html` + existing `t_*.html`), `audit` (`<sprint>/audit.md` when it ran). The orchestrator resolves keys into `payload.inputs` at dispatch; agents and workflows cite the subsection by name and never repeat the conditions.
- **D8 Protocol file (AC-4, AC-6, C-4)**: new `.asd/rules/agent-protocol.md`, sections in order:
  - `## Signals` — table `token | emitter | handler`: `COMPLETED`, `QUESTION` (creators; reviewers use the verdict `question:` carrier), `ADVICE_NEEDED` (creators only — BA, UX, Architect, Dev, Tester; never reviewers, never advisor), `BLOCKED_MANUAL` (dev, tester), `FAILED`, `ABORT` (`ABORT — precondition not met: <artefact>` first line), `REVIEW_DONE` (reviewers: the return whose first line is the verdict line, `review-policy.md` "Gate Verdict Format"). `PLAN_DRAFT`/`PLAN_READY` removed. Out-of-band forms named: External Review skip/interrupted (`external-review.md` "Outcome contract"), `FAILED: stalemate`.
  - `## Dispatch payload` — the payload is one fenced JSON object opening every dispatch: `repo_root`, `sprint`, `phase`, `mode`, `task` (ids), `inputs` (`{"<key>": path|[paths]}`, D7 keys plus phase-specific ones), `write_scope` (globs), `turn_budget` (`{"max", "report_by", "plan"}` or null; values and the large-wave plan from today's "Dispatch payload header"), `answers` (`[{"question", "answer"}]`), `advice` (text or null), `consults_left` (int or null). Role-specific keys a workflow's `## Dispatch` names (reviewer: `manifest`, `diff`, `floor`, `iteration`, `interrupted`) join the same object. Host enforcement (Claude maxTurns enforced, Codex advisory) stays in `providers.md`.
  - `## Return` — line 1 the signal token (reviewer: the verdict line); then one fenced JSON object; then an optional Markdown body (audit sections, proposals, recommendation). Fields: `COMPLETED` `{"changed": [], "commits": [], "resolved": [], "flagged": [{"choice", "departs_from"}], "memory_index": null}`; `QUESTION` `{"problem", "options": [{"id", "label", "consequence"}], "recommended": {"id", "reason"}, "complication": null | {"what", "why", "justification", "alternatives"}}`; `ADVICE_NEEDED` `{"question", "context": []}`; `BLOCKED_MANUAL` `{"task", "manual_step"}`; `FAILED` `{"cause", "fix", "committed": []}`; `ABORT` `{"missing"}`. Reviewer and External Review returns stay as `review-policy.md`/`external-review.md` define (verdict line, findings table, one ledger JSON block).
  - `## Relay` (orchestrator only) — the QUESTION protocol (3 steps) and ADVICE_NEEDED protocol (6 steps) moved verbatim from `sprint-lifecycle.md` "Signal vocabulary", reviewer exclusion per C-4.
  - Section scope: agents read `## Signals`, `## Dispatch payload`, `## Return`; the orchestrator reads all (`providers.md` "Role-scoped context", audit Risks).
- **D9 sprint-lifecycle split (O4, AC-8, C-2)**: move — `## Audit phase` → `asd-phase-audit.md` (`## Rules`: scans, criterion check, subsystem registry; `## Steps`: contradictions gate); `## Design phase` → `asd-phase-design.md`; `## Impl phase` → `asd-phase-impl.md`; `## Impl-test phase` → `asd-phase-impl-test.md`; `## Retro phase` except the row-id grammar → `asd-phase-retro.md`; "Retro intake" paragraph → `asd-phase-scope.md`; "PR phase" open-mode DoD block → `asd-phase-pr.md`; agent-facing review-phase rules the `providers.md` rows call "review-phase section" (today unresolved headings, audit Gaps AC-8) → `## Rules` of `asd-phase-design-review.md` / `asd-phase-impl-review.md`, sourced from the review workflows' own steps. Stay: Orchestration (minus Retro intake), Workflows, Phases, Review iteration counters, APPROVE latch, Impacted test set, Phase table, Self-hosting, Optional documents (+ Input sources), Design-promote phase, PR phase (minus open DoD), Plan file format, Retro row-id grammar (as `## Retro row ids`), Friction log, Operation timing, Scope amendment, Sprint immutability, State recovery, Agent liveness. "Signal vocabulary" leaves for `agent-protocol.md` (D8). Wave 2 copies moved text into workflows; wave 3 deletes it from `sprint-lifecycle.md` and repoints every citation.
- **D10 Byte measure (AC-13; edge semantics per AC-11)**: measured set = `.asd/agents/*.md` + `.asd/workflows/asd-phase-*.md` + the 7 standalone `SKILL.md` + `.asd/rules/sprint-lifecycle.md` + `.asd/rules/agent-protocol.md`; bytes = sum of `git show <rev>:<path> | wc -c` (LF, committed content); baseline 376,476 B at 9f4e8b5b (agent-protocol.md absent = 0). Measured once at impl assessment and once at impl-review green; result recorded in decisions-log. "Drop measurably" = after < baseline; no target figure.

**Rule homes** (cited across Tasks in one wave, exact file and heading):
- `.asd/rules/agent-protocol.md` "Signals", "Dispatch payload", "Return", "Relay" (Task 1, wave 1).
- `.asd/rules/sprint-lifecycle.md` "Input sources" (Task 7, wave 3; wave-2 Tasks cite the name only).
- `.asd/workflows/asd-phase-<phase>.md` "Rules" (Tasks 2-3, wave 2; `providers.md` rows repointed in Task 7).
- `.asd/rules/git-strategy.md` "Forbidden" (Task 1).

External APIs: none (Markdown, JSON, Node stdlib in tests). No tech reference needed.

Orchestrator-only: after each wave's last signal, run `node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply` over the views `--check` reports stale, and measure D10 at the wave-4 impl assessment.

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.
D10 byte total below the 376,476 B baseline, recorded in decisions-log; `node .asd/sync.js --check` clean; no `PLAN_DRAFT`/`PLAN_READY` left in canon.

### Task 1: Protocol file, payload and commit contract
Material risk: change: public contract
- [x] Create `.asd/rules/agent-protocol.md` per D8 (frontmatter-free rule doc, terse imperative); move `sprint-lifecycle.md` "Signal vocabulary" content into it (Signals table + Relay), dropping `PLAN_DRAFT`/`PLAN_READY`, adding `ABORT`, applying C-4 (reviewers never emit `ADVICE_NEEDED`); leave in `sprint-lifecycle.md` only a one-line pointer heading `## Signal vocabulary` → `agent-protocol.md` (Task 7 removes it after repointing).
- [x] `.asd/rules/providers.md`: replace "Dispatch payload header" with a pointer to `agent-protocol.md` "Dispatch payload" keeping only host enforcement facts; "Role-scoped context" load line → every role loads `core.md`, `agent-protocol.md` (agents: Signals, Dispatch payload, Return; orchestrator: all) and `custom-common-rules.md`.
- [x] `.asd/rules/review-policy.md` l.33 reviewer payload list → the `agent-protocol.md` payload keys incl. reviewer keys (`manifest`, `diff`, `floor`, `iteration`, `interrupted`); state reviewers never emit `ADVICE_NEEDED`. `.asd/rules/external-review.md` "Phase-scoped payload" → same payload object.
- [x] `.asd/rules/core.md`: "See also" adds `agent-protocol.md`; Glossary "Advisor agent", "Request user decision", "Autonomy and escalation" cite `agent-protocol.md` "Relay" instead of `sprint-lifecycle.md`'s protocols. `.asd/rules/language-policy.md` l.27: JSON keys and return-object fields stay English.
- [x] `.asd/rules/git-strategy.md` (AC-10): "Forbidden" gains "A dispatched agent never moves HEAD in the shared worktree (`git reset <commit>`/`--soft`/`--mixed`/`--hard`, `commit --amend`, `rebase`); it corrects a wrong commit with a follow-up commit of its own paths"; the "Commits" squash bullet names the main orchestrator as its only actor; index-only `git reset -q -- <paths>` ("Commit before review") stays allowed.

### Task 2: Phase workflows — scope, audit, design, design-review, design-promote, plan, retro, pr
Material risk: change: meaning-preserving restructure
- [x] Rewrite `.asd/workflows/asd-phase-{scope,audit,design,design-review,design-promote,plan,retro,pr}.md` to the D4 form; step numbers kept; return line per D6; dispatch payloads named by `agent-protocol.md` keys; requirement inputs cite `sprint-lifecycle.md` "Input sources".
- [x] Copy in moved sprint-lifecycle text per D9: Audit phase → audit, Design phase → design, Retro phase minus row-id grammar → retro, Retro intake paragraph → scope, PR open-mode DoD → pr, review-phase agent rules → design-review `## Rules`; do not edit `sprint-lifecycle.md` (Task 7).
- [x] ADVICE_NEEDED (C-4): plan drops its dead relay step; audit and design-promote gain the relay branch citing `agent-protocol.md` "Relay"; design-review relays only from non-reviewer agents.

### Task 3: Phase workflows — impl, impl-test, impl-review
Material risk: change: meaning-preserving restructure
- [x] Rewrite `.asd/workflows/asd-phase-{impl,impl-test,impl-review}.md` to the D4 form; step numbers kept; return line per D6; payloads per `agent-protocol.md` (impl step 6, impl-test step 1a, impl-review steps 6 and 9 cite "Dispatch payload" instead of `providers.md` "Dispatch payload header").
- [x] Copy in moved text per D9: Impl phase → impl, Impl-test phase → impl-test, review-phase agent rules → impl-review `## Rules` (incl. the tester's impl-review terminal-suite rules); do not edit `sprint-lifecycle.md`.
- [x] ADVICE_NEEDED (C-4): impl-review relays only from non-reviewer agents (tester).

### Task 4: Creator and advisor agents
Material risk: change: meaning-preserving restructure
- [x] Rewrite `.asd/agents/asd-{ba,ux,architect,dev,tester,advisor}.md` to the D2 form; descriptions per D3; conditional input prose (audit Gaps AC-7 lines) replaced by `payload.inputs.<key>`; `ADVICE_NEEDED` listed in each creator's `## Signals` (not advisor); returns cite `agent-protocol.md` "Return".
- [x] Phase-rule citations repointed to the D9 homes (`asd-phase-<p>.md` "Rules") where the cited section moves; ones staying in `sprint-lifecycle.md` unchanged.

### Task 5: Reviewer and External Review agents
Material risk: change: meaning-preserving restructure
- [x] Rewrite `.asd/agents/asd-reviewer-{combined,correctness,documentation,efficiency,testing}.md` and `asd-external-review.md` to the D2 form; descriptions per D3; `## Review rubric` text, `###` headings and bold labels byte-identical (runtime.js `rubricIds`, `NA_TARGETS`); `## Gate Verdict Format` and the verdict first line unchanged; no `ADVICE_NEEDED` in any reviewer's `## Signals`.
- [x] External Review: `## Invocation`, `## Severity mapping` headings normalized; `{{wraps_*}}` placeholders untouched.

### Task 6: Standalone skills
Material risk: change: meaning-preserving restructure
- [x] Rewrite `.asd/skills/{asd-sprint,asd-init,asd-concept,asd-design-system,asd-stack,asd-sync,asd-update}/SKILL.md` to the D5 form; return lines per D6; cited subheads keep names; asd-sprint Step 3 reads `NEXT:` unchanged.
- [x] asd-sprint relays `QUESTION` per `agent-protocol.md` "Relay"; grep every consumer of each changed return line (tests excluded — Task 8) and keep it consistent.

### Task 7: sprint-lifecycle split, Input sources, retro rows, mirrors
Material risk: change: rule relocation
- [x] `.asd/rules/sprint-lifecycle.md`: delete the D9 moved sections (text now in workflows) and the `## Signal vocabulary` pointer; add "Input sources" (D7) inside "Optional documents"; rename the retro row-id grammar to `## Retro row ids`; AC-9 `sprint-closure` in "PR phase" Closure write step 2; AC-11 edge-semantics rule in "Plan file format" Decomposition rules ("A plan decision defining a computed metric or a bounded fetch states its edge semantics — interval overlap, nesting versus concurrency, re-entry of an open operation, total versus idle deadline — before acceptance").
- [x] `.asd/rules/providers.md` "Role-scoped context" rows: grants of a "<phase> section of `sprint-lifecycle.md`" → `asd-phase-<phase>.md` "Rules" for moved sections; "review-phase section" → the review workflow's "Rules".
- [x] Repoint every citation of a moved section or of "Signal vocabulary"/"Dispatch payload header" outside Tasks 1-6 files: `artifact-layout.md`, `checkpoints.md`, `code-style.md`, `review-policy.md` (l.217 AC source → "Input sources"), templates (`t_audit.md`, `t_test-plan.md`, `t_plan.md`, `t_retrospective.html`, `t_friction-log.md`, `t_retro-backlog.md`, `t_adr.html`, `t_stack.html`, `t_tech-reference.md` — fold-rule citations stay), `.asd/project/retro-backlog.md` comment, `README.md` (l.222, step-5 citation, folder map adds `agent-protocol.md`, any agent-roster description text), `AGENTS.md` tail (description convention per D3, verdict-token mirror unchanged); one repo grep per moved heading, zero stale hits outside archives.

### Task 8: Tests for the new forms
Material risk: artifact: content-contract pins
Test-only: tests/run.js
- [ ] Adapt every pin broken by Tasks 1-7 (audit Risks: ~54 section pins, `sectionOf`/`stepOf`, return-line regexes, payload-header patterns) to the new homes and headings, keeping each pin's asserted relation.
- [ ] Add form checks (AC-12): per category the exact section set and order (D2, D4, D5); every ```` ```json ```` block in those files parses and carries its D2/D4/D5/D8 keys; base agent `description` ≤ 300 chars (D3); no backslash in agent bodies (D1); `agent-protocol.md` lists every token of D8 and no `PLAN_DRAFT`/`PLAN_READY`; return lines match D6.

## Risks (optional)
- The sprint changes its own dispatch contract: Task 1 runs alone in wave 1, then the orchestrator syncs and dispatches waves 2-4 with the D8 JSON payload.
- Meaning loss in restructure: every Task reports `moved:` lines; reviewers diff baseline vs new per file.
- Wave-2 Tasks 2-3 copy text Task 7 deletes in wave 3: until wave 3 the text exists twice; impl-review sees only the final state.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | Task 1 |
| 2 | Task 2, Task 3, Task 4, Task 5, Task 6 |
| 3 | Task 7 |
| 4 | Task 8 |

- Task 1 is the dispatch/commit contract every later dispatch runs under (D8, AC-10).
- Task 7 deletes what Tasks 2-3 copied and repoints what Tasks 4-6 cite, so it follows them.
- Task 8 covers code of Tasks 1-7.

## Out of scope (optional)
- Changing runtime.js rubric parsing, persist-review, or the reviewer findings format.
- `asd-phase-*` trigger skills, `standard.json`/`lite.json`.
- Generating phase triggers from workflows (low value, 600 B each).
