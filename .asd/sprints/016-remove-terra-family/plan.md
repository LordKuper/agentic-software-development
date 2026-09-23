---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

## Overview
Remove the Codex `terra` model family and move its three users (`asd-dev` base, `asd-tester` base, `asd-external-review` wrapper) to `sol / medium`, per `sprint.md` AC-1..AC-6 and the findings in `audit.md`. One coherent edit set: family map, sync validation regex, three agent canon files, mirrors (`providers.md`, README), test fixtures, then view and hash-ledger regeneration via `sync.js --apply` as the last step. The CHANGELOG `## v12.0.0` section and the `asd_version` bump to 12.0.0 (AC-5) are pr-phase work (`git-strategy.md` "Versioning & Changelog") and carry no Task here.

Change surface: 11 files

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here. Sprint-specific: `node .asd/sync.js --check` reports no drift, and a case-insensitive `terra` grep over the AC-4 live-canon set and generated views returns nothing.

### Task 1: Remove terra family and retier its agents to sol/medium
Covers AC-1, AC-2, AC-3, AC-4, AC-6.
Material risk: change: public contract
- [x] `.asd/release-manifest.json`: delete `model_families.codex.terra` (hand-edit only this key; never hand-edit `canon_hashes`/`upstream_hashes`)
- [x] `.asd/sync.js:175`: Codex model-ID regex `(sol|terra|luna)` → `(sol|luna)`
- [x] `.asd/agents/asd-dev.md`, `.asd/agents/asd-tester.md`: base `codex.model` `"terra"` → `"sol"`, effort `medium` and variants unchanged
- [x] `.asd/agents/asd-external-review.md`: wrapper `codex.model` `"terra"` → `"sol"`, effort `medium` and `wraps_model` values unchanged
- [x] `.asd/rules/providers.md`: drop the `terra` family-table row; tier-matrix rows for `asd-dev, asd-tester (base)` and `asd-external-review wrapper` → `sol / medium`
- [x] `README.md`: ChatGPT section (:38) drops `terra` and rewords the `gpt-5.6` API-style warning to the unsuffixed identifier (e.g. `gpt-6`); roster intro (:195), dev/tester rows (:204–205), task-variant prose (:207), External Review row (:219) → `sol` / `Sol`
- [x] `tests/run.js`: `:136` fixture `sol: 'gpt-5.6-terra'` → `sol: 'gpt-6-luna'` (keeps exercising the family-suffix mismatch branch); `:157` regex → `(sol|luna)`; `:2335` substitute model → `gpt-6-luna`
- [x] Last, after every edit above: `node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply .codex/agents/asd-dev.toml .codex/agents/asd-tester.toml .codex/agents/asd-external-review.toml` (regenerates the three views and both hash ledgers)
- [x] Build/lint gate: `node .asd/sync.js --check` clean; grep confirms zero live `terra`; commit with a breaking marker (`feat(providers)!: …` with `BREAKING CHANGE:` footer) so the pr phase infers MAJOR

## Risks
- Hash-ledger freshness tests fail if `providers.md` or `sync.js` is edited after the last `--apply` — the `--apply` subtask runs strictly last.
- A commit without the breaking marker makes the pr phase infer MINOR instead of MAJOR.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | 1 |

## Out of scope
- CHANGELOG entry and version bump (pr phase).
- `.asd/migrations/12.0.0.js` — rejected at audit (`core.md:30`; decisions-log.002.md).
