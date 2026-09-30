---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 022-release-at-merge

<!--
Written in impl-test, after the implementation exists. First entry writes this file fresh;
every re-entry AMENDS it (append/update rows) — never a full rewrite. Defects rows persist
(resolved ones kept for the record). Narrative rows of prior entries rotate into
test-plan.entry-NN.md: .asd/rules/artifact-layout.md "Test plan". Change surface is not restated here — it's the diff
itself (`git diff --stat`), computed by asd-phase-impl-test.md step 2 (full on entry 1, delta
since the prior entry's `HEAD analysed` on re-entry).
Rules: .asd/rules/sprint-lifecycle.md (impl-test phase), .asd/rules/code-style.md §17.
-->

## Entry log

Appended each entry, never rewritten. `HEAD analysed` is the commit the strategy/prune passes
were scoped through; the next re-entry's delta is `git diff <this sha>...HEAD`.

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 6659c2a | full change surface |
| 2 | 6e51b75 | delta since entry 1 |
| 3 | c85aac7 | delta since entry 2 |

## Risk → check decisions

Entry 3's delta is Tasks 8 and 9 (AC-8, AC-9): the Claude-side tiers in agent frontmatter, their `providers.md` and README mirrors, and the wrapped-reviewer args. `tests/run.js` has no change in the delta: the 61 changed lines the dispatch cited are entry 2's own commit `6e51b75`, already inside the prior `HEAD analysed`. Before this entry nothing compared a tier value with a mirror; the matrix's sandbox column was the only cell compared. All checks are static canon-consistency assertions in `tests/run.js`. Mutation ids (`M-N`) are listed under "Added tests".

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Agent frontmatter tiers (`claude.model`/`effort`, variants, `codex.wraps_model`/`wraps_invoke_args`) against `providers.md` "Agent tier matrix" (AC-8, AC-9) | 11 agents retiered across three mirrors; a one-site edit leaves a mirror on the old tier, and the mechanical variants moved twice (sonnet/low, then back to haiku/none) | static relation | add `sprint-022 AC-8/AC-9` | Each agent's tier is derived from the `sync.buildSyncPlan` metas, so a variant's dropped effort is sync's own resolved value, not a second derivation. Every matrix row's Claude and Codex cell must equal it. Each agent is claimed by exactly one row, so a stale, missing or doubled row reddens. The wrapped-reviewer row equals the wrapper's `wraps_model` plus the effort in its `wraps_invoke_args` (`model_reasoning_effort="…"` for the Claude host, `--effort …` for the Codex host). Proofs R1, Ma–Md, Mn–Mq, Mstale |
| README "Agents" tables and family list (AC-8, AC-9; the AGENTS.md hard rule that a tier change updates the README table) | README rows, the family list or a tier sentence keep the old tier | static relation | add (same test) | Each canonical agent has exactly one README row and both cells equal the rendered tier. The `(Claude: …; Codex: …)` list equals the families agents render. No family the manifest keeps but no agent renders (`opus`) is named in the section. Proofs R2, Mr–Mw |
| Variant-tier prose: `providers.md` "Task-class variants and routing" sentence (an AC-9 named mirror) and the README variant sentence | prose keeps a retired tier (mechanical on sonnet/low) | static relation | add (same test) | The whole-word family and effort vocabulary in each sentence equals the set the variants render; README's adds the base tier it falls back to. Order and phrasing are free. Ceiling: which effort pairs with which family inside the sentence is not compared, so a swap passes. Proofs Mx, My, Mz, Mz2; rewords Gs, Gt, Gv, Gw stay green |
| `providers.md` "External review symmetry" alias pair (`sol` / `sonnet`) | the wrapped alias still names the retired `opus` | static relation | add (same test) | The sentence carrying the `wraps_config_key` span must carry both hosts' `wraps_model` as code spans. Ceiling: an extra stale span beside the two passes. Proofs Mk, Mk2 |
| "Codex sides unchanged" (AC-8) | — | — | none | A claim about the past. The relation above reddens any one-sided Codex edit, and an absolute Codex tier pinned by literal is a change detector the next deliberate retier must edit |
| `asd-external-review` Codex-side `--model sonnet --effort xhigh` rendering into the `.codex` wrapper | the wrapped Claude family unresolved or unrendered | — | none | `{{wraps_model}}` resolution is unchanged (`sync.js` is not in the delta); only the alias value moved. The values are pinned by rows 1 and 4, the committed `.codex` view by `sync.js --check`. The Claude-family direction of the substitution has no dedicated assert (the existing one moves the Codex family); that gap predates the delta |
| `model_families` keeps `opus` and `haiku` (AC-8) | a family dropped while an agent names it | — | keep | The manifest is unchanged beyond the hash ledger. `haiku` is rendered by the mechanical variants, so a missing family fails `sync.js --check`; `opus` is the existing `model_families.claude.opus` assert |
| Claude `effort: xhigh` accepted by the render validator | validator narrower than the host | — | keep | The existing `sprint-010 AC-9 (C-10)` test admits `xhigh` and rejects `ultra` |
| Host facts: Sonnet 5.5 supports `xhigh`, an unsupported level falls back downward, the `claude` CLI accepts `--model sonnet --effort xhigh`, Claude Code ≥ v2.1.242 | the host rejects or ignores the retier | — | none | Third-party live behaviour. AC-8 and AC-9 record the doc verification (2026-09-30); a live probe needs the CLI and the network, which breaks the suite's isolation (`code-style.md` §17). No `Manual verification` row was authored; see the report's flagged choice |
| `.asd/release-manifest.json` hashes, regenerated `.claude/`/`.codex/` views | hash ledger or views stale | static | keep | The existing `upstream_hashes`/`canon_hashes` tests and `sync.js --check` (green; 74/74 current) |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

The mutation ids are `node .asd/tmp/mutate3.js` runs, 27 in all: 23 red, 4 reword controls. Each is one canon or mirror edit → `node tests/run.js` → exit 1 → a byte-equal restore in the same process. `R-N` restores one whole file from `git show 6e51b75:<path>`, the pre-delta blob: one mirror left at the old tier while the rest carry the new, the half-applied state the test exists for. The failing test and message are the first FAIL line after the expected ledger noise (`upstream_hashes`/`canon_hashes`, `sync.js --check`), which only a `managed_paths` file (`providers.md`, agent canon) adds; a README edit fails this test alone. No run skipped an anchor or restored unequal, and the suite was 263/263 after them. The `sentenceOf` uniqueness guard fired unprompted while authoring (`2 !== 1`, the matrix table read as a sentence) and was fixed by excluding table and heading lines. The `listed`, `plan.some(metaOverride)` and `wrappedEffort` guards guard against a vacuous loop and were not mutated.

| Test | Regression proof |
|---|---|
| `sprint-022 AC-8/AC-9: the model family and effort each agent renders - both providers, mechanical and critical variants, the wrapped reviewer - is the tier providers.md "Agent tier matrix" and README state, …` (new, 262 → 263) | R1 providers.md = 6e51b75 → "providers.md \"Agent tier matrix\" row \"asd-ba\": asd-ba's Claude cell must be the model/effort canon renders for it"; Ma matrix mechanical Claude cell `haiku / none` → `sonnet / low`, the AC-8 state AC-9 reverted → "row \"asd-dev-*\": asd-dev-mechanical's Claude cell must be…"; Mb matrix mechanical Codex cell `luna / low` → `luna / medium` → "row \"asd-dev-*\": asd-dev-mechanical's Codex cell must be…"; Mc wrapped-reviewer row `sonnet / xhigh` → `opus / high` → "row \"asd-external-review wrapped reviewer\": asd-external-review's Codex cell must be…"; Md `asd-ba, asd-ux` → `asd-ba` → "each agent canon renders, variants included, appears in exactly one matrix row"; Mstale a `asd-ghost` row added → "row \"asd-ghost\" names no agent canon renders - a stale or misspelled row"; Mn canon `--effort xhigh` → `--effort high` → the Mc message; Mo canon architect `xhigh` → `high` → "row \"asd-architect\": asd-architect's Claude cell must be…"; Mp canon tester critical `xhigh` → `high` → "row \"asd-tester-*\": asd-tester-critical's Claude cell must be…"; Mq canon tester mechanical gains `"effort": "low"` (AC-9's no-override) → "row \"asd-tester-*\": asd-tester-mechanical's Claude cell must be…"; R2 README = 6e51b75 → "README \"Agents\" row asd-ba: its Claude and Codex cells must be the model/effort canon renders for it"; Mr README reviewer-testing `sonnet/xhigh` → `sonnet/high` → the same message for asd-reviewer-testing; Ms README asd-dev Codex cell `sol/medium` → `sol/high` → the same for asd-dev; Mt README advisor row removed → "README's agent tables list each canonical agent once"; Mu family list gains `opus` and Mv loses `haiku` → "README's per-provider family list is the families the agents render"; Mw README `-critical` `Sonnet` → `Opus` → "README \"Agents\" names a model family no agent renders"; Mx README `Haiku (no effort)` → `Sonnet low` and My `Sonnet xhigh` → `Sonnet high` → "AC-9: README's variant sentence names exactly the families and efforts the variants and the base agent they fall back to render"; Mz providers sentence `sonnet/xhigh` → `sonnet/high` and Mz2 `haiku` → `sonnet` → "AC-9: providers.md \"Task-class variants and routing\" names exactly the families and efforts the variants render"; Mk alias `sonnet` → `opus` and Mk2 `sol` → `luna` → "AC-9: providers.md \"External review symmetry\" names the wrapped provider's family alias for both hosts as canon sets it". Rewords, this test green (Gs and Gw 263/263, Gt and Gv ledger noise only): Gs README `Haiku (no effort)/Luna low` → `Haiku, without an effort setting, and Luna low`; Gt providers sentence reordered to `critical uses sol/high or sonnet/xhigh; mechanical uses luna/low, or haiku with no effort`; Gv matrix `(standard: no variant, dispatches base)` → `(standard: no variant)`; Gw README role text `Business analyst:` → `Analyst:` |

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once the last review wave's reviewers are
APPROVE/latched. The `pr` gate always reads whatever is recorded here last — the full-suite
record, by the time `pr` runs. Each per-entry record measures only the tree that entry
analysed, not any tree produced later
(`.asd/rules/sprint-lifecycle.md` "Impacted test set").

- Command: `node tests/run.js`, unscoped: the shared-infrastructure safety valve fires on the agent-frontmatter, rule-doc and README changes
- Scope: full
- Result (entry 3): pass — 263/263 (exit 0, no FAIL line). The pre-strategy run at the same HEAD was 262/262, exit 0: Tasks 8 and 9 changed no existing pin, and none of their tier values was pinned before this entry. The count moves by the one new test
- Lint / build: pass — `git diff --cached --check` clean on the commit's paths; `node .asd/sync.js --check` `ok: true`, 74/74 `current`
- HEAD: 57b224f plus this entry's uncommitted `tests/run.js` and test-plan files. The entry's own test commit lands after this record, so the terminal full suite is the first run at a HEAD that contains it

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/rules/sprint-lifecycle.md` "Impl-test phase"). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|

## Manual verification (optional)

None. Every AC is a canon or executable contract, pinned above. The live release is owned by this sprint's `pr` merge mode.
