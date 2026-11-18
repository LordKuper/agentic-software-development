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
- Raw scope: bump the Codex `sol` model family to 6.2 — `model_families.codex.sol` `gpt-6.1-sol` → `gpt-6.2-sol` (`.asd/release-manifest.json`), its mirror in `.asd/rules/providers.md`, `README.md`, the expected sync fixture `tests/fixtures/expected/agents/demo-agent.codex.toml`; regenerate the provider views that render the ID; `luna` unchanged.
- Problem: Codex-hosted agents (dev, tester, reviewers, advisor, external review) and External Review under Claude Code run on `gpt-6.1-sol`; the newer `gpt-6.2-sol` is available.
- Actors: framework maintainer; consumer projects running ASD under Codex; External Review wrapping the Codex CLI under Claude Code.
- Functional requirements: the `sol` alias resolves to `gpt-6.2-sol` in every rendered view; effort levels, `luna` and agent definitions unchanged; the minimum Codex client version (0.167.0) is stated in `CHANGELOG.md` and beside the existing model-ID guidance in `README.md`.
- Constraints: no runtime version check, no migration — the host's `model_not_found` error is self-explanatory. Live check (2026-11-18): codex-cli 0.159.2 → HTTP 400 `model_not_found` ("not supported when using Codex with a ChatGPT account"); 0.167.0-alpha.3.2 and 0.169.1 → OK. The exact lower bound between 0.159.2 and 0.167.0 is not sought.
- Success criteria: `node .asd/sync.js --check` green; `gpt-6.1-sol` appears nowhere outside history (`CHANGELOG.md`, archived/closed sprint folders); `node tests/run.js` green; a live `codex exec --model gpt-6.2-sol` returns OK.

## Findings
- GPT-6.2 Sol shipped for Codex in Nov 2026; a third-party tracking issue states the model declares a minimum client version 0.166.0 (unofficial, unverified; consistent with the live check: 0.159.2 refused, 0.167.0-alpha accepted) — source: https://github.com/Wladefant/veyyon/issues/1167
- An outdated client gets a model refusal rather than an upgrade hint; OpenAI tracks improving that error — source: https://github.com/openai/codex/issues/60691
- A model the client predates can surface as "not supported when using Codex with a ChatGPT account", the exact error seen live with 0.159.2 — source: https://smartscope.blog/en/blog/codex-gpt-6-1-sol-not-supported-chatgpt-account-2026/
- Multi-agent Codex setups should pin a concrete model ID per agent TOML and audit `.codex/agents/` on a model change; pin the CLI version where automation depends on it — source: https://codex.danielvaughan.com/2026/04/07/codex-cli-model-lifecycle-deprecations-migrations/

## Approaches
- **A. Map bump + documented client minimum**: change the one `model_families` entry and its mirror, regenerate views, state "Codex CLI 0.167.0 or later" in CHANGELOG and README; pros: one-line canon change (the family map exists for exactly this), no new code; cons: an old client fails at first dispatch, explained only by docs and the host error.
- **B. A + client-version preflight**: also check `codex --version` in External Review readiness (`runtime.js`) and skip with an actionable reason below the minimum; pros: fail-fast message under Claude Code; cons: new code path and a version constant to maintain, covers only External Review (Codex-hosted agents never pass through it), duplicates the host's own refusal.
- **C. New family alias**: add a second family (e.g. `sol-6.2`) and move agents to it one by one; pros: per-agent rollout; cons: two live `sol` IDs, every agent frontmatter and README tier table touched, against the rolling-alias rule in `providers.md` "Model family resolution".
- Recommended: A — matches the family-map design and the interview's "no runtime check" constraint.
- Chosen: A — user answer "A: map + docs" (2026-11-18); stage (c) refinement: README and CHANGELOG state the verified minimum 0.167.0, not the unverified 0.166.0.
