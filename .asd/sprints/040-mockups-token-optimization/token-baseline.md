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
