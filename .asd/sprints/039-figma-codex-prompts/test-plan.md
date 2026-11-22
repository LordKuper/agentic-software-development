---
responsibility:
  owns: test approach, runner evidence, defects and manual verification
  excludes: requirements, production code and review verdicts
  delegates_to: sprint.md, plan.md and impl-review
---

# Test plan — sprint 039-figma-codex-prompts

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 71a70a21 | full change surface |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-1/AC-5, mockup configuration | A consumer update blocks a valid legacy config, or a mixed config bypasses validation | CLI contract in `runtime-routing` and trace the init, selection and README rules | add | Extend the existing config-check owner after its previous assertions passed against the old runtime. The extended case covers HTML, Claude Design, Figma, both legacy values, valid mixed keys, missing keys and invalid or duplicate values. The rule trace confirms explicit precedence, legacy mapping, and fresh and repair init entry points. |
| AC-2/AC-5, Figma authoring and handoff | A write targets the wrong file or publishes twice, or handoff drops a frame link | Workflow-rule trace plus live Figma remote MCP authoring and read-back | none | Lite scope and Standard design reach the same mockup rule. It requires destination confirmation and write authorization, identity and revision logging before attempts, native frames, verification and link indexing. Recovery reads the live and rotated logs, checks uncertain outcomes before retry and reuses confirmed identities. Design-promote preserves remote URLs and the reviewer and dev receive the index. The live result is recorded below. |
| AC-3/AC-5, unavailable Figma writes | Access loss stalls recovery or silently changes the configured format | Workflow-rule trace | none | The rule records access failure or uncertainty, offers temporary HTML or wait, preserves the format and records the decision and publication status before continuing or pausing. Re-entry honors that record. Existing Claude Design rules retain local previews and deferred publish. This is rule evidence for the unavailable-Figma branch. |
| AC-4/AC-5, Codex choice delivery | An enqueue, default, clarification or unrelated reply is treated as approval | Provider and gate-rule trace plus live Codex App choice | none | Structured callers route to the provider mapping. An acknowledgment or uncertain delivery remains pending. The gate requires the actual explicit reply and retains optional and free-text handling. The same options move to chat if widget delivery is definitively unavailable, with an explicit reply still required. Open-ended prompts stay in chat and Claude Code keeps AskUserQuestion. The unavailable-widget, preselected option and free-text gate branches have rule evidence. The live answer is recorded below. |
| AC-6, runner capture | Tool truncation loses failure evidence and forces a rerun | Observe the capture used for this entry | none | Both streams and the exit code were retained together before summary extraction. The captured red output preserved the exact test name, assertion and totals; only bounded output was returned. |
| AC-7, Test-only Task completion | A test change is accepted without evidence of catching its claimed regression | Trace the tester return and impl workflow completion and recovery branches | none | Added or extended behavior regressions require proof before a Task is ticked, including reconstructed completion. Task 7 adapted the fixture only and did not extend behavior coverage. |
| AC-8, review scope selection | Hand-authored fixture lists conceal path handling defects in the workflow's actual input | Existing Git-generated scope regression in `runtime-review` and trace code-style §17 | keep | The existing regression gets the file-list command from the review workflow and exercises its Git output and platform path cases. This sprint changes the test rule. |
| Removed routing and mockup wording | Old instructions survive outside their canonical home | Search exact removed Codex chat wording, mockup heading and legacy template comment across the repo and agent memory | none | Exact hits in archived evidence are historical. No current source or agent-memory hits. The legacy key itself remains an intentional compatibility input. |

## Removed tests

No removals. Search found no prior sprint temporary test, and the impacted tests exercised distinct contracts.

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|
| `tests/runtime-routing.test.js` — extended `Sprint 038 AC-1/AC-2: config-check requires explicit valid values and names missing, duplicate and invalid keys` | In an isolated checkout fixture with the sprint template and pre-sprint runtime `dac8b396e575ab7c1c647ee71c114b36f98e6e49`, `node tests/run.js runtime-routing --filter 'config-check requires explicit valid values'` matched 1 test and exited 0 before the extension. | With the extension, the same command against pre-sprint runtime matched 1 test and exited 1 in `Sprint 038 AC-1/AC-2: config-check requires explicit valid values and names missing, duplicate and invalid keys` because `claude_design: enabled` exited 1 where 0 was expected. The entry suite passed that test against the current runtime. Mutation runs: 1. |

## Suite run

- Command: `node tests/run.js contract-agents contract-rules contract-templates contract-workflows runner runtime-review runtime-routing runtime-timing runtime-tools sync-cli sync-render update`
- Scope: impacted
- Scope evidence: The runtime diff is confined to the config-check command and its template. The selection covers config validation, readers of the changed rules, workflow and template contracts, reviewer inputs, context-bundle sizes, sync consumers and the release manifest. The change leaves runner setup, hook behavior and historical migration inputs semantically unchanged. The enabled safety valve permits the named areas.
- Result: fail — 286 passed, 1 failed, 0 skipped (exit 1). First failure is the standalone skills byte-cap check (D-1).
- Lint / build: pass
- HEAD: f87ba059e598d62ab388c93ce46f1191a04d6b73

The pre-strategy run passed 284/285 with the same byte-cap failure, and the separate `runner` area passed 2/2. Full console reports and their exit codes are in sprint-prefixed scratch captures.

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/skills/asd-init/SKILL.md | AssertionError [ERR_ASSERTION]: standalone skills total 62390 B, cap 62351 | sprint-026 AC-15: the standalone skills total at most their baseline of 62,351 bytes (61,051 on main plus the asd-init adoption text of sprint 037) | fixed | 0b4d860258c72558979a65b06069ca776a84324b |

## Manual verification

| AC | Steps | Expected observation |
|---|---|---|
| AC-2/AC-5 | In an authorized Figma Design draft, use the remote MCP file session to create a native frame, read its node structure back and open the stable node link. | Live Figma remote MCP passed. An independently inspected 480 × 198 native frame had one child FRAME, three editable TEXT descendants, a bound background variable and zero image nodes. The stable link resolved and the frame was visually inspected. |
| AC-4/AC-5 | Present a choice in the Codex App async widget, observe enqueue and wait for the explicit choice. | Live Codex App passed. The widget delivered the explicit draft-creation answer after enqueue. The orchestrator used that answer to run the authorized Figma check. |
