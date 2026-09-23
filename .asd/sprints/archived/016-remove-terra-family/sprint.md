---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 016-remove-terra-family

## Goal
Drop the Codex `terra` model family from ASD. Every agent tier that resolves to `terra` today (`asd-dev` base, `asd-tester` base, `asd-external-review` wrapper — all `terra / medium`) moves to `sol` at the same `medium` reasoning effort, so only the family changes and the base/critical split stays an effort split (`sol / medium` vs `sol / high`). The family is removed outright, not deprecated.

## Acceptance
- AC-1: `terra` is gone from the Codex family map — `.asd/release-manifest.json` `model_families.codex` and `.asd/rules/providers.md` family table — and `.asd/sync.js` Codex model validation accepts only the remaining families, so a canonical agent declaring `codex.model: "terra"` fails sync instead of rendering.
- AC-2: `asd-dev` and `asd-tester` base Codex tier and the `asd-external-review` wrapper Codex tier are `sol / medium`; their generated `.codex/agents/*.toml` views are regenerated and resolve to `gpt-6-sol` with `model_reasoning_effort = "medium"`.
- AC-3: Every mirror of the tiers states the new values: `providers.md` agent tier matrix, README Codex/ChatGPT section, agent roster and External Review rows, and any other README prose naming `terra`/`Terra`.
- AC-4: No case-insensitive `terra` match remains in live canon — `.asd/**` except `.asd/sprints/**`, `README.md`, `AGENTS.md`, `tests/**` — or in the generated provider views. Released `CHANGELOG.md` sections, archived sprints and `plans/` stay untouched.
- AC-5: The removal ships as a breaking change under `backward_compat: migration`: MAJOR `asd_version` bump and a `CHANGELOG.md` section with a Removed entry and a migration note telling consumers to replace `codex.model: "terra"` with `sol` in their own custom agents. Whether an automated `.asd/migrations/<version>.js` rewrite is warranted is settled at audit.
- AC-6: `node tests/run.js` is green and `node .asd/sync.js --check` reports no drift.

## Out of scope
- Claude-side tiers (`sonnet / medium` for these agents stays).
- Any other family's model ID or effort change.
- A deprecation window or `terra` alias.
- A new regression test that specifically rejects `terra`.
