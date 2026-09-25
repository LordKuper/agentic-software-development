---
responsibility:
  owns: brownfield findings for sprint scope (existing docs, code, gaps incl. dependencies/migration, risks)
  excludes: requirements, decisions, plan, code
  delegates_to: prd.html (requirements), adr.html (decisions), plan.md (tasks)
---

# Audit

## Scope reference
[sprint.md](./sprint.md)

## Touched areas
- `.asd/agents/*.md` (11 canonical): frontmatter `claude.tools`/`disallowedTools`, body rewrites. 14/15 generated Claude views grant `AskUserQuestion` (advisor does not).
  - Body lines that ask the user: asd-ba 16, 23 (assumes BA runs clarifying rounds itself), 53, 62, 68 ("escalate on conflict", target unspecified); asd-dev 64; asd-tester 75; asd-ux 54, 60; asd-reviewer-correctness 69; -documentation 55; -efficiency 59; -testing 21, 22, 47, 51, 77; asd-external-review 22, 27, 28, 67, 96, 104 (conflicts with its own 115 `QUESTION`), 115; asd-advisor 53 ("directs the caller to request user approval"); asd-architect 7 grants `AskUserQuestion` though its body already routes decisions to the orchestrator (59).
  - Tool-policy sections left empty by the removal: correctness 67-69, documentation 53-55, efficiency 57-59. No web-scoping line in dev 60-63, tester 71-74, advisor (no Tool policy section).
- `.asd/rules/core.md` 41 ("Every agent can do this"), 45 ("escalates to the user"), 90 (untrusted-data rule names only `WebFetch`).
- `.asd/rules/providers.md` 34 (request-user-decision row), 37 (claims a "Codex web-fetch tool"), no web-search row, 40 (heredoc ban, reviewer write-grant paragraph), 106 (declared tool policy → `QUESTION`).
- `.asd/rules/sprint-lifecycle.md` 311 (`QUESTION` defined, no resume protocol, unlike `ADVICE_NEEDED` 317-323), 321/323 ("escalates to the user normally").
- `.asd/rules/review-policy.md` 142-152 (first-line verdict contract), 160 (no verdict token = interrupted dispatch → fresh re-dispatch), 93 ("ask user before fix").
- `.asd/rules/external-review.md` 42-49 (Outcome contract, "Nothing else"), 96 (stalemate "escalates to user").
- `.asd/rules/design-principles.md` 47 ("request user decision for final choice"; names `WebSearch + WebFetch`).
- `.asd/rules/git-strategy.md` 40 ("a dispatched agent holding a commit tool … commits every path it authored").
- `.asd/workflows/`: `asd-phase-design.md` 28/37/42 (dispatched creators "discuss each section … loop until explicit `accept`"; UX runs per-token approve-before-write gate itself), 54 ("relay, halt; resumes on user answer", no mechanism); `asd-phase-design-review.md` 56 and `asd-phase-impl-review.md` 72 (reviewer `QUESTION` → relay, halt, after step 7/7a validation); `asd-phase-impl-test.md` 58; `asd-phase-impl.md` 35; `asd-phase-design-promote.md` 8 ("BA/UX have no shell").
- `.asd/skills/`: `asd-concept/SKILL.md` 59 and `asd-stack/SKILL.md` 62 delegate "ask user to describe" to an agent; `asd-sprint/SKILL.md` 51.
- `.asd/sync.js` 318-339 (`transformAgentCodexToml` fixed key set, no web key), 945-966 (variants cannot change permissions).
- `tests/run.js` 3335 (reviewer tools deepStrictEqual incl. `AskUserQuestion`), 5457-5461 (BA/UX "stays shell-less" + rename route), 1014-1040 (read-only contract, holds), 3417-3437 (reviewer Bash carve-out, holds), 83-96 / 150-162 (Codex TOML fixture/render).
- `README.md` 211 (reviewer grants), 229 (advisor); roster tables have no tools column.
- `.asd/release-manifest.json` `canon_hashes`/`upstream_hashes`; `CHANGELOG.md`; generated 15 `.claude/agents/*.md` + 15 `.codex/agents/*.toml`.

## Existing docs found
No `docs/` tree (lean self-hosting profile); canonical sources are `.asd/rules/`.
- [core.md](../../rules/core.md):41 — request user decision: "Every agent can do this."
- [providers.md](../../rules/providers.md):34 — `AskUserQuestion` / "ask in chat, block on reply"; :37 "Codex web-fetch tool"; :106 out-of-policy instruction → `QUESTION`.
- [sprint-lifecycle.md](../../rules/sprint-lifecycle.md):311 — "`QUESTION` — needs user input, body has options".
- [review-policy.md](../../rules/review-policy.md):145 — `[REVIEW-<phase>-<reviewer>]: <APPROVE | CONCERNS | FAIL>`; :160 no token = interrupted.
- [external-review.md](../../rules/external-review.md):42 — "exactly one of two outcomes"; :96 stalemate emits `FAIL: stalemate…` and escalates to user.
- [git-strategy.md](../../rules/git-strategy.md):77-83 — versioning, CHANGELOG, migration-version DoD.
- [t_review.md](../../templates/t_review.md) — optional "Escalations" section can carry a user-decision item under a verdict token.
- [t_test-plan.md](../../templates/t_test-plan.md):73-79 — Manual verification spec "consumed by asd-reviewer-testing"; no results column.
- [README.md](../../../README.md):211 — internal reviewers carry no `Write`/`Edit`/`Bash`.
- Archived [015 sprint.md](../archived/015-glings-retro-003-review-scope/sprint.md):27,40 — BA/UX renames routed through orchestrator "instead of widening their tool policy"; "Widening BA/UX tool policy with a shell" rejected.
- External, Claude Code: `AskUserQuestion` unavailable inside subagents (sub-agents docs; anthropics/claude-code#18721); confirmed by this audit dispatch (architect granted it, session lacked it).
- External, Codex: agent TOML accepts "other supported `config.toml` keys", omitted keys inherit; `web_search = disabled|cached|indexed|live`, default `cached` (no external web access); `sandbox_workspace_write.network_access` boolean; codex-cli on PATH is 0.156.1 (`--search` = live).

## Contradictions
- external-review.md:42-49 (Outcome contract: verdict or skip, "Nothing else") vs external-review.md:96 + asd-external-review.md:115 (stalemate escalates to user / `QUESTION`); AC-4 asks for `QUESTION` here. winner=unsettled → user: keep the two-outcome contract; stalemate returns first line `[REVIEW-<phase>-external]: FAIL` plus a `Stalemate` block with options (accept as-is / override / abort), the orchestrator asks the user (2026-09-25)
- review-policy.md:145,160 (every reviewer return starts with a verdict token) vs asd-phase-design-review.md:56 / asd-phase-impl-review.md:72 / asd-reviewer-testing.md:77 (bare reviewer `QUESTION` → relay, halt); winner=review-policy.md (canonical rule over workflow/agent). A reviewer question must travel inside a verdict-bearing report.
- archived sprint 015 AC-6 (encoded in tests/run.js:5459, asd-phase-design-promote.md:8) vs sprint 018 AC-1 (Bash for BA/UX); winner=sprint 018 AC-1 (newer explicit user authority, scope gate 2026-09-25). Rename route left to plan.
- core.md:41 vs host behaviour (subagents cannot reach the user); not a precedence case — accepted scope AC-4/AC-5 amends canon to match the host.

## Existing implementation found
- AC-1: `asd-architect` already grants `Bash`; Codex BA/UX already have a shell (`workspace-write`).
- AC-2: `asd-dev`/`asd-tester` `disallowedTools` already `[]` (removal is a no-op there; real edit only for advisor and correctness). The four keep-disallowed agents already disallow `WebFetch`. Variants inherit base grants; `variantMeta` rejects per-variant permission keys (sync.js:957-961).
- AC-3: read-only sandbox for all 6 read-only agents already enforced (`tests/run.js:1038`).
- AC-4: advisor grants no `AskUserQuestion`; ux:54 and architect:59 already route through the orchestrator; providers.md:106 already uses `QUESTION`; every workflow has a `QUESTION → relay, halt` branch.
- AC-6: `sync.js --apply` recomputes `canon_hashes`/`upstream_hashes` whole-repo (sync.js:1486-1491, 1018-1029); `sync --check` currently 72/72 current.

## Gaps
- Design-phase creator loops: `asd-phase-design.md:28,37,42` have dispatched BA/UX/Architect discuss sections with the user until `accept`, and UX run the per-token approve gate itself. These must move to the orchestrator (creator writes draft → `COMPLETED`, or `QUESTION` + proposal; orchestrator asks and re-dispatches). Behavioural profiles ba:47, ux:48, architect:47 and ba:23 need matching wording.
- Skills delegating user contact: `asd-concept/SKILL.md:59`, `asd-stack/SKILL.md:62` — the skill must collect input inline, then delegate.
- `QUESTION` resume protocol missing (`sprint-lifecycle.md:311`); no host resumes a dispatched agent. Needed: orchestrator asks, records the answer, re-dispatches fresh with it; workflows cite the protocol.
- Reviewer question carrier and its placement ahead of/inside step 7/7a validation in both review workflows.
- Manual verification: only asd-reviewer-testing asks the user and cannot; impl-review has no results-collection step. Results storage (payload only vs decisions-log) is a decision; `t_review.md`/`t_test-plan.md` forbid a dedicated persisted section.
- Remaining rule text implying agents prompt the user: core.md:45, sprint-lifecycle.md:321/323, design-principles.md:47, external-review.md:96, asd-advisor.md:53, providers.md:34.
- Web tool-policy lines for dev/tester (library/framework/runtime docs), advisor, correctness; core.md:90 must cover search results and Codex `web_search`, without host tool names.
- BA/UX Bash has no stated purpose/bounds: UX's `designmd-*` commands (ux:73-74) cannot run today; BA needs none yet. Each needs a bounded run-command line (never write artifacts through the shell, providers.md:40).
- git-strategy.md:40 "holding a commit tool" undefined (grant vs policy); decide whether BA/UX commit their own drafts/memory, and whether design-promote keeps the orchestrator `git mv`/`git rm` route (design-promote.md:8, ba:69, ux:78). "have no shell" prose and tests/run.js:5459 change either way.
- Codex parity (AC-3): sync.js cannot express web; needs an optional validated canon key (e.g. `codex.web_search`) rendered to TOML, plus fixture/render tests. Codex BA/UX/architect today inherit `web_search = cached` (no live access, no URL fetch) — no equivalent of Claude `WebFetch`. Codex reviewers inherit cached search that the Claude side disallows; setting `disabled` for the four keep-disallowed agents is needed for true parity (not required by AC-3). Codex has no URL-fetch tool distinct from `web_search`; providers.md:37 inaccurate.
- providers.md has no web-search operation row.
- Tests: rewrite :3335, :5459; add: no agent grants `AskUserQuestion`; AC-2 grant matrix; Codex web key rendering; core.md orchestrator-only statement; reviewer question carrier.
- README: line 211 still true but silent on web grants and orchestrator-only prompting.
- External dependency gaps: Codex `web_search` in custom agent TOML documented only generally, unverified on 0.156.1; Claude subagent `WebFetch`/`WebSearch` depends on consumer permission settings.
- Migration gaps: no `state.json`/`config.yaml` shape change → no `.asd/migrations/<version>.js`. Generated views update via standard `sync --check`/`--apply` after update. Consumer-visible contract changes (grants, creators no longer run the accept loop, reviewer/External stalemate return shape) → `CHANGELOG.md` section at `pr`; MAJOR only if External Review's outcome contract/signal set changes, else MINOR.

## Risks
- Reviewer question misparsed as interrupted dispatch (bare `QUESTION` hits review-policy.md:160, question lost): impact=high, mitigation=carry the question under the verdict token; test it.
- Prompt injection via web on agents that write/commit/run shell (dev, tester); URL query exfiltration; Codex `live` on `workspace-write` agents: impact=high, mitigation=extend core.md:90 to all web content, scope policy to docs lookups, prefer `indexed` over `live` on Codex or document the choice, keep reviewers' web read-only, no secrets in URLs.
- BA/UX Bash bypasses providers.md:40 heredoc ban and write allowlists; design phase has no diff gate: impact=medium, mitigation=bounded per-agent run-command list; test asserting the policy line.
- Bash may create a commit obligation for BA/UX (git-strategy.md:40) and whole-tree git misuse in parallel design-promote: impact=medium, mitigation=define "commit tool" by policy, keep creator commits with the orchestrator.
- Rewritten creator/`QUESTION` path not exercised in this sprint (design collapses): impact=medium, mitigation=content-contract tests; CHANGELOG note.
- Codex `web_search` key ignored/rejected by older versions or `--strict-config`: impact=medium, mitigation=one local spawn check during impl; state uncertainty once in providers.md.
- Subagent web calls may prompt or be auto-denied per consumer permission mode / background dispatch: impact=low-medium, mitigation=README note on pre-allowing `WebFetch`/`WebSearch`.
- Grants-only tests miss body/workflow lines (host already strips `AskUserQuestion`, the real change is text): impact=medium, mitigation=grep-based tests for "request user decision" in agent bodies and dispatched-agent accept loops.
- README/test drift on reviewer-grant prose (README:211, providers.md:40, tests 3417-3437): impact=low, mitigation=edit together.
