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
| 2 | 2974ba1d5be8dc62930d1b5fbbb3503e8af4cf84 | delta since entry 1 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| D-1, AC-1/AC-5, `asd-init` prose and generated views | Standalone skills exceed the byte cap or the shorter instructions change mockup format selection or repair | Existing standalone skill cap, config validation, provider sync and release hash contracts, plus a trace of each changed instruction | none | The cap test exposed D-1 on entry 1. The revised prose retains prior-effective and template defaults, the Claude Design proposal when both keys are absent, explicit-key precedence, legacy mapping, validation of both keys and the repair sequence. Existing tests cover the executable validation and artifact integrity. |

## Removed tests

No removals. The affected existing checks cover separate contracts.

## Added tests

No additions. The existing standalone skill cap test already reproduces D-1.

## Suite run

- Command: `node tests/run.js contract-rules contract-workflows runtime-routing sync-cli update`
- Scope: impacted
- Scope evidence: From entry 1, the only non-sprint changes are `asd-init` prose, its Claude and Codex views, and their source hash entries in `.asd/release-manifest.json`. Searches for `asd-init`, `mockup_format`, `claude_design`, skill discovery globs, sync plan consumers and manifest hashes identified these five areas. They cover the cap, provider-tree exclusions and current views, config validation and source hashes. The runner and context inputs are unchanged. The enabled safety valve permits the named areas.
- Result: pass — 106 passed, 0 failed, 0 skipped (exit 0). The pre-strategy run supplies the suite gate evidence. HEAD matched and relevant paths were clean before and after the run.
- Lint / build: pass
- HEAD: 2974ba1d5be8dc62930d1b5fbbb3503e8af4cf84

Complete runner output and exit code are in `.asd/tmp/039-impl-test-entry-2-pre-strategy.log`. Entry 1's original red run remains in Git at `71a70a21`.

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/skills/asd-init/SKILL.md | AssertionError [ERR_ASSERTION]: standalone skills total 62390 B, cap 62351 | sprint-026 AC-15: the standalone skills total at most their baseline of 62,351 bytes (61,051 on main plus the asd-init adoption text of sprint 037) | fixed | 0b4d860258c72558979a65b06069ca776a84324b |

## Manual verification

| AC | Steps | Expected observation |
|---|---|---|
| AC-2/AC-5 | In an authorized Figma Design draft, use the remote MCP file session to create a native frame, read its node structure back and open the stable node link. | Live Figma remote MCP passed. An independently inspected 480 × 198 native frame had one child FRAME, three editable TEXT descendants, a bound background variable and zero image nodes. The stable link resolved and the frame was visually inspected. |
| AC-4/AC-5 | Present a choice in the Codex App async widget, observe enqueue and wait for the explicit choice. | Live Codex App passed. The widget delivered the explicit draft-creation answer after enqueue. The orchestrator used that answer to run the authorized Figma check. |
