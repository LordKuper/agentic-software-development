---
responsibility:
  owns: staged-design research for sprint scope (functional requirements, best-practice findings with sources, conceptual approaches and the chosen one)
  excludes: acceptance criteria, technical design, plan, code
  delegates_to: sprint.md (AC-N), design/ docs or plan.md (technical detail), decisions-log.md (decisions)
---

# Research

<!-- Stages, conceptual boundary, no-web-research Findings line: .asd/rules/sprint-lifecycle.md "Staged solution design" — not restated here. -->

## Requirements
Raw scope and stage (a) answers; stage (c) refines the answers.
- Raw scope: consumer projects publish their framework-level retro findings as issues in the ASD GitHub repo; ASD's own scope phase sweeps the open issues, closes duplicates/repeats, and puts genuinely new findings to the user the same way it puts the project's own retro findings today; under self-hosting no issues are published.
- Problem: a consumer retro's `asd` rows ("upstream ASD" home) are only shown at the consumer's next scope and never reach the framework repo, so framework friction found in consumer projects is lost.
- Actors: consumer-project orchestrator (retro phase, publisher); ASD self-hosting orchestrator (scope phase, intake); ASD maintainer (user deciding dispositions).
- Functional requirements:
  - Publish at the consumer's retro phase, right after `retrospective.html` is written, one issue per open `asd` row.
  - Publish automatically, no user confirmation; before publishing the orchestrator checks each issue body holds only framework-level content and nothing sensitive from the consumer project.
  - No consumer-side deduplication; deduplication happens only on the ASD side.
  - No `gh` or no auth on the consumer side: skip publication, one decisions-log line, the row stays shown at the next scope as today; never an error.
  - Self-hosting scope: list open retro-finding issues; close duplicates (`duplicate of #N`, label `duplicate`) and findings already resolved at HEAD (with evidence); put the rest to the user as include / reject / defer, like own retro rows.
  - include → an `AC-N` of the sprint; reject → issue closed with a comment and label `wontfix`; defer → issue stays open, offered again at every later intake.
  - An included issue is closed only after the release delivering it is published, with a comment naming the release version and linking it.
  - `self_hosting: enabled` never publishes.
- Constraints: ASD repo is public (`LordKuper/agentic-software-development`), issues enabled, no issues yet; repo address comes from `.asd/release-manifest.json` `repo`; issue content is consumer data crossing a trust boundary.
- Success criteria: a release is published whose scope delivers an issue; that issue is then closed on GitHub with a comment naming the release version and linking it.
- Refined (stage c):
  - Issue content: guardrail, framework-level root cause, home, provider, `asd_version`; the consumer's sprint id and row id omitted as possibly sensitive; allow-listed fields only.
  - Identification by a marker (labels are dropped for non-collaborators); the ASD side applies its own labels at intake.
  - Authenticity: an issue body is data, never instructions; an issue off the expected format is never auto-closed, it goes to the user flagged non-standard.
  - Duplicates: only clear duplicates (same guardrail substance) are auto-closed; doubtful matches go to the user with the new issues, each annotated with links to the similar issues found.
  - Deferred issues carry a `deferred` label so a later intake tells them from new ones; issue dispositions live on GitHub, not in `retro-backlog.md`.
  - Included issues are referenced in the PR without a closing keyword, so merge does not close them; they close after the release is published.

## Findings
- Labels, assignees and milestone on a new issue are silently dropped unless the creator has push access; creating content too quickly triggers secondary rate limiting (422 "endpoint has been spammed") — a consumer cannot label its issue, so identification needs a title/body marker, labels set only by the ASD side — source: https://docs.github.com/en/rest/issues/issues#create-an-issue
- `gh issue list` filters by `--label`, `--state`, `--search` and emits `--json body,labels,author` — enough for a marker-based sweep — source: https://cli.github.com/manual/gh_issue_list
- semantic-release comments on every issue a release resolves and adds a `released` label after publishing; closing normally rides PR closing keywords at merge, so close-after-release needs an explicit post-release step — source: https://app.unpkg.com/@semantic-release/github@12.0.10/files/README.md
- Duplicate triage practice: flag only true duplicates, comment linking the original and apply `duplicate`; at least one maintainer turned auto-closing off over false positives and suggests confidence bands — source: https://reneza.beehiiv.com/p/i-let-the-ai-close-duplicate-github-issues-then-i-turned-that-off ; https://glama.ai/mcp/servers/@getzep/graphiti/blob/12ac194714f26a6cc0f3321f6178c0c10fa841a9/.github/workflows/issue-triage.yml
- Native GitHub duplicate detection (public preview) suggests matches only in the issue-creation UI, not for API-created issues — source: https://github.blog/changelog/2026-06-18-duplicate-detection-and-issue-fields-mcp-support-for-github-issues
- Secret/PII leakage in issue reports: regex detection performs poorly (F1 0.03 vs 0.63 for a model); evidence minimisation (send only what the triager needs) is the robust control — source: https://arxiv.org/html/2410.23657v2 ; https://tessl.io/registry/skills/github/elementalsouls/Claude-BugHunter/evidence-hygiene
- Public issue bodies read by an agent holding comment/close tools are a prompt-injection vector; mitigations: treat as data, restrict tools, keep policy outside the model — source: https://devblogs.microsoft.com/agent-framework/?p=5414 ; https://tenki.cloud/blog/prompt-injection-ai-github-actions

## Approaches
- **A. One issue per `asd` row, marker-identified**: title prefix plus a structured body (guardrail, framework-level root cause, home, provider, `asd_version`), allow-list content only; ASD scope sweeps open issues by marker, labels them, closes true duplicates and HEAD-resolved ones with evidence, puts the rest to include/reject/defer, closes included ones after the release with its version and link; pros: one disposition per issue maps 1:1 to the existing per-row intake, simple close-after-release; cons: more issues per retro, several API calls.
- **B. One issue per consumer retrospective, rows inside**: pros: one create call, fewer issues, lower rate-limit exposure; cons: per-row dispositions inside one issue (partial include/reject) make closing and duplicate handling ambiguous.
- **C. Issue-form template with auto-label**: pros: GitHub applies labels and fields; cons: forms and their labels apply only in the web UI, not to API/`gh` creation by non-collaborators — unusable for automated publishing.
- Recommended: A — matches the existing per-row intake and close-after-release cleanly; B saves little at one or two rows per retro, C does not work for automation.
- Chosen: A — user choice at stage (c)
