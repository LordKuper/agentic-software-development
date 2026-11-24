---
responsibility:
  owns: pre-change Codex usage evidence and context ranking
  delegates_to: audit.md (findings), sprint.md (acceptance)
---

# Codex token baseline

Framework snapshot `4d343b05d34bb1e7a0f7b21cb837067ddb694658`. No framework edits preceded the probes.

## Controlled phase context

Codex CLI 0.171.0, `gpt-6.2-sol`, low effort, fresh ephemeral read-only invocation per row. Load the generated phase skill, canonical phase workflow and orchestrator bundle from `runtime.js context`; use the same one-line response task for each. Control uses the task without the three ASD inputs. Each accepted run recorded 8 output tokens, 0 reasoning output tokens and no tool calls. Startup warnings appeared for two plugin icon definitions. Cache hits were observed, not forced. The raw table reports input and its cached subset, in that order.

| Phase | Lite input / cached | Standard input / cached |
|---|---:|---:|
| control | 31,158 / 7,552 | 31,158 / 27,520 |
| scope | 63,739 / 63,616 | 63,739 / 27,520 |
| audit | 61,891 / 7,552 | 61,891 / 27,520 |
| design | — | 62,282 / 27,520 |
| design-review | — | 79,259 / 31,104 |
| design-promote | 63,100 / 27,520 | 63,100 / 7,552 |
| plan | 55,191 / 7,552 | 55,191 / 0 |
| impl | 67,879 / 27,520 | 67,879 / 27,520 |
| impl-test | 63,953 / 27,520 | 63,953 / 0 |
| impl-review | 78,377 / 27,520 | 78,377 / 27,520 |
| cleanup | 55,345 / 0 | 55,345 / 0 |
| retro | 50,916 / 18,304 | 54,935 / 0 |
| pr | 58,165 / 0 | 58,165 / 31,104 |

Evidence: [24 completed trials](./codex-phase-baseline.json), including 22 phase invocations and two controls. All 24 complete usage events and task responses checked. Treat input minus the 31,158-token control as an approximate phase-context increment. Codex adds host context, and matching phase payloads can give different totals (notably retro). These probes measure context loading. A live phase can add chat, tool results, artifacts, retries and separate agent sessions. Lite has no design or design-review phase.

## Historical Lite execution

Codex local usage events for sprint 039. Matched one main repo session and 25 subagent sessions by working directory and event time within the archived timing ledger. Used per-session cumulative-counter deltas. Sum each request once, assigning it to the phase window containing the event; the cached column is a subset of both input columns. A zero subagent value means no matched usage event. The recorded design-promote visit was a no-op; retries and review-fix visits are included. No equivalent Standard timing trace was found in the archived sprints with an explicit Standard workflow. This is a historical observation with a different task and context, not the controlled before/after comparator.

| Phase | Visits | Main input | Subagent input | Cached input, both | Output, both |
|---|---:|---:|---:|---:|---:|
| scope | 1 | 2,915,148 | 0 | 2,879,488 | 7,025 |
| audit | 1 | 669,998 | 0 | 653,312 | 2,417 |
| design-promote | 1 | 747,947 | 0 | 745,984 | 373 |
| plan | 1 | 1,209,576 | 0 | 1,186,432 | 4,613 |
| impl | 6 | 27,813,557 | 20,003,557 | 46,850,560 | 116,870 |
| impl-test | 6 | 15,732,759 | 9,465,740 | 24,744,960 | 50,651 |
| impl-review | 5 | 26,229,109 | 12,670,508 | 38,055,040 | 86,251 |
| cleanup | 1 | 749,480 | 0 | 748,544 | 855 |
| retro | 1 | 1,129,243 | 0 | 1,126,784 | 2,994 |
| pr | 1 | 1,526,940 | 0 | 1,523,200 | 2,494 |

Evidence: [24 phase windows and usage by role](./codex-sprint-039-usage.json), [sprint 039 timing ledger](../archived/039-figma-codex-prompts/timing.jsonl). No negative counter deltas in the matched data. Timing attribution is approximate at phase boundaries; out-of-window events and external providers are excluded.

## File review order

[Context priority](./context-priority.csv) inventories the tracked snapshot. Rank by bytes assembled from each canonical file across the declared Lite and Standard phase bundles, one occurrence per eligible phase/role. Agent grants represent possible dispatches; conditional roles are not weighted by real frequency. Count phase workflow bodies and loaded phase skills separately; assign generated phase skill bytes to canon. A zero means no match in this map, not proof that a file is unused. Dynamic, conditional and startup context outside the mapped grants requires separate evidence. File attribution is an estimate; the Codex counters are measurements of whole requests.

First five: `sprint-lifecycle.md` (1,056,749 B), `artifact-layout.md` (563,048 B), `review-policy.md` (414,835 B), `core.md` (381,990 B), `agent-protocol.md` (314,977 B).

## Matched comparison

Candidate framework snapshot `48e521ad4621ee90ec0f60e0a1b1f8a8fb9a8325`. Same Codex CLI, model, effort, phase inputs, one-line response and read-only invocation. [Raw candidate usage](./codex-phase-after.json). All 24 probes passed, with no tool calls and 8 output tokens per probe.

| Workflow | Phase | Input before → after | Cached input before → after | Input change | Prompt byte change |
|---|---|---:|---:|---:|---:|
| lite | control | 31,158 → 28,190 | 7,552 → 26,240 | -2,968 | 0 |
| lite | scope | 63,739 → 56,813 | 63,616 → 0 | -6,926 | -17,019 |
| lite | audit | 61,891 → 54,291 | 7,552 → 18,304 | -7,600 | -20,008 |
| lite | design-promote | 63,100 → 54,477 | 27,520 → 7,552 | -8,623 | -24,976 |
| lite | plan | 55,191 → 48,436 | 7,552 → 0 | -6,755 | -16,327 |
| lite | impl | 67,879 → 61,223 | 27,520 → 26,240 | -6,656 | -15,920 |
| lite | impl-test | 63,953 → 56,894 | 27,520 → 18,304 | -7,059 | -17,597 |
| lite | impl-review | 78,377 → 70,657 | 27,520 → 18,304 | -7,720 | -20,818 |
| lite | cleanup | 55,345 → 48,242 | 0 → 18,304 | -7,103 | -17,749 |
| lite | retro | 50,916 → 47,699 | 18,304 → 0 | -3,217 | -18,396 |
| lite | pr | 58,165 → 52,299 | 0 → 26,240 | -5,866 | -12,610 |
| standard | control | 31,158 → 28,190 | 27,520 → 18,304 | -2,968 | 0 |
| standard | scope | 63,739 → 56,813 | 27,520 → 0 | -6,926 | -17,019 |
| standard | audit | 61,891 → 54,291 | 27,520 → 0 | -7,600 | -20,008 |
| standard | design | 62,282 → 54,428 | 27,520 → 18,304 | -7,854 | -21,610 |
| standard | design-review | 79,259 → 70,754 | 31,104 → 26,240 | -8,505 | -24,974 |
| standard | design-promote | 63,100 → 54,477 | 7,552 → 28,032 | -8,623 | -24,976 |
| standard | plan | 55,191 → 48,436 | 0 → 26,240 | -6,755 | -16,327 |
| standard | impl | 67,879 → 61,223 | 27,520 → 26,240 | -6,656 | -15,920 |
| standard | impl-test | 63,953 → 56,894 | 0 → 26,240 | -7,059 | -17,597 |
| standard | impl-review | 78,377 → 70,657 | 27,520 → 26,240 | -7,720 | -20,818 |
| standard | cleanup | 55,345 → 48,242 | 0 → 28,032 | -7,103 | -17,749 |
| standard | retro | 54,935 → 47,699 | 0 → 26,240 | -7,236 | -18,396 |
| standard | pr | 58,165 → 52,299 | 31,104 → 7,552 | -5,866 | -12,610 |

| Workflow | Phase input before → after | Reduction | Control-adjusted input before → after | Reduction |
|---|---:|---:|---:|---:|
| lite | 618,556 → 551,031 | 10.9% | 306,976 → 269,131 | 12.3% |
| standard | 764,116 → 676,213 | 11.5% | 390,220 → 337,933 | 13.4% |

Totals count each declared phase once and exclude control. The control fell from 31,158 to 28,190 input tokens. The control-adjusted column subtracts the corresponding run's control from each phase and approximates the phase-specific contribution. Cache hits varied between probe sets. These measurements capture context loading in Codex and do not extrapolate to live spend or cache-adjusted billing. The historical execution data has no matched post-change rollout.

Holding the pre-wave-2 inputs constant, Task 5 reduced 56 static bundles. The orchestrator's per-phase bundles shrank by 5,068–14,725 UTF-8 bytes across 12 phases after the reference correction. This byte comparison excludes on-demand provider sections and is separate from measured tokens.
