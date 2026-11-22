---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 038-codex-provider-routing

## Goal

Identify the model assignments ASD uses with Codex as the primary harness and check them against OpenAI's Model selection guide. Make Claude Design usage configurable. Support Codex as both the primary harness and the external review CLI, with a separate inference provider for review, for example a ChatGPT subscription for primary work and RouterAI with `~anthropic/claude-opus-latest` for external review.

Propose specific model changes where warranted and obtain agreement in this sprint. On every `asd-sprint` invocation require each supported project setting to be explicitly present in the config and direct users with missing settings to `asd-init`. Have `asd-init` write an explicit value for every project setting.

## Acceptance

- AC-1: Every `asd-sprint` invocation checks the project config against the shipped set of settings before starting or resuming a phase. Absent settings are reported by dotted key and halt with an `asd-init` instruction. An explicit empty or disabled value satisfies presence where that setting allows it. Duplicate or malformed entries cannot satisfy the check.
- AC-2: Fresh init and re-init write explicit values for every supported project setting, including settings inactive for the current configuration. Re-init presents proposed values for missing fields and preserves existing valid choices unless the user edits them. Sprint-mediated init still applies only the approved pairs and verifies that its result is complete. Updating ASD directs an incomplete project to init at the next sprint entry.
- AC-3: An explicit project setting controls use of Claude Design for UI mockups in lite scope and standard design. The enabled path uses the existing Claude Design artifact flow on supported hosts. The disabled path and hosts without the tool use the existing local HTML flow. UX-spec enablement and the existing publication approval rules apply.
- AC-4: With external review enabled under Codex, a configured local Codex profile runs the wrapped reviewer in its own read-only Codex process with the profile's inference provider, model, and effort. The main session and its agents keep their own provider. An explicitly empty profile selection retains the existing wrapped-CLI defaults. The resolved route is shared by init, preflight and invocation. Availability and negative-cache handling distinguish review profiles and retain the existing review outcomes.
- AC-5: Document setup and verification for a ChatGPT-backed Codex session using a separate RouterAI review profile with `~anthropic/claude-opus-latest` at `medium`. Project config stores the profile name. The example keeps provider credentials in the user's local environment or credential helper. Verify the selected route and report the outcome of an authenticated run when credentials are available.
- AC-6: Generated Codex agents apply the agreed assignments. `asd-dev-escalated` is GPT-6.2 Sol/`xhigh`, `asd-tester` is GPT-6.2 Sol/`medium`, `asd-tester-runner` is GPT-6 Luna/`medium`, `asd-advisor` is GPT-6.2 Astra/`medium`, and the `asd-external-review` wrapper is GPT-6 Luna/`high`. Canon, generated views and the published model tables agree. The documentation distinguishes the primary session, the wrapper and the wrapped reviewer.
- AC-7: Verify the named-profile route and compatibility paths. Exercise the external-review wrapper with a report containing material and minor findings, and check that it preserves material findings, severity and the verdict. Exercise the tester runner's reporting for a failed suite.
- AC-8: For a Task that changes a public contract, the plan schedules compile-only repairs of affected test callers with the contract Task or first in the next wave. A wave exits with its applicable build green, and build-dependent work waits for the callers to compile. (issue #130)
- AC-9: A review-fix tester records the committed HEAD as the verified suite revision when the tested tree and committed tree match. The next impl-test entry can reuse that run under the existing reuse rules. (issue #131)
- AC-10: A migration that introduces a required test-plan column backfills the live plan and rotated segments or explicitly exempts pre-migration rows. Current rows still require the column. (issue #132)
- AC-11: Plan acceptance verifies tech references for infrastructure commands used by deployment Tasks and confirms pinned image tags in their registries. (issue #133)
- AC-12: When the host rejects a dispatch because of a model quota, re-dispatch it on an available model if one can serve the role. Record the override in the decisions log. (issue #134)
- AC-13: The test-plan template requires escaping literal pipes in table cells, including inside code spans, and the close parser reads those cells correctly. (issue #135)
- AC-14: Plan decisions about alert-episode and deduplication keys state behavior under history retention, threshold changes, recovery without new data, and a backward clock adjustment. (issue #136)
- AC-15: If the Claude Design canvas host is unreachable during lite scope while Claude Design is enabled, record deferred publication and retry at design-promote. Scope can proceed with the available mockup material for review. (issue #137)
- AC-16: Before a review-fix dispatch, verify tech references for commands and APIs the proposed fix requires and write missing entries. (issue #138)
- AC-17: The `timing --attrs` interface accepts multiple key-value pairs in repeated flags or a comma-separated value. The existing semicolon-separated form remains supported. (issue #140)
- AC-18: The external impl-review manifest generator applies consumer-mode path exclusions to `files[]` and the matching diff. Verify that eligible source and test files remain in scope and that self-hosting can still review canonical ASD sources. (issue #141)
- AC-19: `persist-review` accepts numeric finding IDs in a coverage ledger by normalizing them to strings before matching. Duplicate and invalid references still fail validation. (issue #142)
- AC-20: `draft-snapshot --previous` and `emit-manifest --snapshot` reject a path already ending in `snapshot/`. Snapshot diff emission fails when the changed-file list is nonempty and its patch is empty. (issue #143)
- AC-21: Claude Code's external-review invocation explicitly sets a Bash timeout of at least 600000 ms. The wrapper contract forbids polling by PID in payloads and memory. (issue #144)
- AC-22: The first impl-test entry of a large sprint can run as separate change-area dispatches with an impacted run per area. Subsequent progress preserves completed areas when one stalls. (issue #145)
- AC-23: Before reporting a missing check or bound, audit searches `tests/` for the concern's key names and cites the hit or confirms the absence. Source: 037#A-2.
- AC-24: `sync.js --check` reports a stale release hash ledger as a non-current item. `--apply` exits nonzero and names invalid targets. Source: 037#A-3.
- AC-25: `commit-check` fails when a named path has unstaged changes or has no staged change, including correct handling of both paths in a rename. Source: 037#A-4.
- AC-26: A critical review-fix brief identifies the finding's class and covers all sites using the mechanism. Source: 037#A-5.
- AC-27: Steps 9 and 10 route every `impl-test-close` refusal, including Entry log and Suite run refusals, to the repair tester with the failing check and its affected file. Source: 037#A-6.
- AC-28: `persist-review` runs the memory content check for the reviewer's changed agent-memory files and refuses to persist a hit. Source: 037#A-7.
- AC-29: Review the test areas the shared-infrastructure safety valve widens to a full run. Where existing evidence supports narrower impacted areas, update their routing and checks while retaining full verification for changes that genuinely span the suite. Source: 037#P-1.
- AC-30: For a review-fix touching only prose that no test parses, the orchestrator runs the affected contract areas and records `none` directly, omitting the impl-test tester dispatch. Source: 037#P-2.
