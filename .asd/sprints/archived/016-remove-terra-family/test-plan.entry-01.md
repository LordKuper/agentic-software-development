# Test plan — sprint 016-remove-terra-family, entry 1 (rotated)

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `release-manifest.json` drops `model_families.codex.terra` (AC-1) | a canonical agent still declaring `codex.model: "terra"` renders instead of failing sync | unit | keep | `tests/run.js` "AC-1/3/5/6/7: Codex renderer rejects invalid delegate config with context", case `unknown family` → `unknown model family`. `terra` is now an absent key, so it takes the same `hasOwnProperty` branch in `resolveModelFamily` as `'unknown'`. A terra-specific case is out of scope (sprint.md) and would duplicate this one |
| `sync.js` Codex regex `(sol\|terra\|luna)` → `(sol\|luna)` (AC-1) | the regex rejects a valid `sol`/`luna` mapping, or the suffix-mismatch branch goes untested | unit | keep | Same test: `legacy unsuffixed model` fails the regex. `mismatched family model` (fixture now `sol: 'gpt-6-luna'`) passes the regex and fails `endsWith('-sol')`, so it still exercises the suffix-mismatch branch that `gpt-5.6-terra` covered before. "AC-3/6/7: every canonical Codex agent renders a supported delegate config" renders all 11 agents against the narrowed regex. Review fix (T-1): the assertion's alternation is now built from `Object.keys(manifest.model_families.codex)` instead of a hand-listed `(sol\|luna)`, so it can't drift from the manifest again |
| AC-5: MAJOR `asd_version` bump + CHANGELOG `## v12.0.0` Removed/migration note | wrong or missing version/changelog entry for a breaking removal | n/a | none | Release prose, not sprint code — `tests/run.js` "the changelog heads the released version" (~:5173-5174) already pins the newest CHANGELOG heading to equal `asd_version`; that's a standing check, not new to this sprint. MAJOR-ness itself is inferred at pr phase from the `BREAKING CHANGE:` marker on 79d0d98 (git-strategy.md "Versioning & Changelog"), so there's nothing to decide or add here |
| `asd-dev`/`asd-tester` base, `asd-external-review` wrapper → `sol / medium` (AC-2) | a stale or wrong rendered `.toml` model or effort | static | keep | `node .asd/sync.js --check` (build) catches view/hash drift. The render test above asserts a supported model and effort for every agent. The three views show `model = "gpt-6-sol"` and `model_reasoning_effort = "medium"` |
| `providers.md` family table and tier matrix, README ChatGPT section, roster, task-variant prose and External Review row (AC-3) | a mirror still names `terra`, or states the wrong tier | static | none | No behaviour is added: this is prose. Grep during this pass: `providers.md:59-60,69,72`, `README.md:38,195,204-205,207,219` state `sol`/`sol/medium`. Mirror accuracy belongs to asd-reviewer-documentation. The tier-table drift risk existed before this sprint and this change does not create it |
| Live canon and generated views contain no `terra` (AC-4) | `terra` survives somewhere in live canon | static | none | This is a DoD grep, not a test: `grep -rniI terra` over `.asd` (minus `sprints`), `README.md`, `AGENTS.md`, `tests`, `.codex`, `.claude/agents`, `.claude/skills` and `.agents` returns no match. A permanent test against `terra` is out of scope (sprint.md) |
| `tests/run.js:2335` negative-cache fixture `gpt-5.6-terra` → `gpt-6-luna` | the substitute model equals the base input, so the fingerprint-change assertion passes vacuously | unit | keep | The base input is `model: 'gpt-6-sol'`. `gpt-6-luna` differs, so the fingerprint still changes and the `local-ready` assertion stays meaningful |
| Hash ledgers (`canon_hashes`/`upstream_hashes`) regenerated | a ledger is stale after the canon edits | static | keep | The existing hash-ledger freshness tests in `tests/run.js` and `sync.js --check` both cover this |

## Removed tests

None.

## Added tests

None — every material risk above already has a check, and the strategy decided no additions.
