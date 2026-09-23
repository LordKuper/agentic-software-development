---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint 016-remove-terra-family

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 |  | full change surface |

Impacted set: full suite. Safety valve fires — the surface touches `.asd/sync.js` and `.asd/release-manifest.json`, framework-wide shared infrastructure that every render/hash-ledger test loads. `commands.yaml` carries no `test_affected`. Pre-strategy run at `5b5c91d`: `node tests/run.js` → exit 0, `213/213 passed`.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `release-manifest.json` drops `model_families.codex.terra` (AC-1) | a canonical agent still declaring `codex.model: "terra"` renders instead of failing sync | unit | keep | `tests/run.js` "AC-1/3/5/6/7: Codex renderer rejects invalid delegate config with context", case `unknown family` → `unknown model family`. `terra` is now an absent key, so it takes the same `hasOwnProperty` branch in `resolveModelFamily` as `'unknown'`. A terra-specific case is out of scope (sprint.md) and would duplicate this one |
| `sync.js` Codex regex `(sol\|terra\|luna)` → `(sol\|luna)` (AC-1) | the regex rejects a valid `sol`/`luna` mapping, or the suffix-mismatch branch goes untested | unit | keep | Same test: `legacy unsuffixed model` fails the regex. `mismatched family model` (fixture now `sol: 'gpt-6-luna'`) passes the regex and fails `endsWith('-sol')`, so it still exercises the suffix-mismatch branch that `gpt-5.6-terra` covered before. "AC-3/6/7: every canonical Codex agent renders a supported delegate config" renders all 11 agents against the narrowed regex |
| `asd-dev`/`asd-tester` base, `asd-external-review` wrapper → `sol / medium` (AC-2) | a stale or wrong rendered `.toml` model or effort | static | keep | `node .asd/sync.js --check` (build) catches view/hash drift. The render test above asserts a supported model and effort for every agent. The three views show `model = "gpt-6-sol"` and `model_reasoning_effort = "medium"` |
| `providers.md` family table and tier matrix, README ChatGPT section, roster, task-variant prose and External Review row (AC-3) | a mirror still names `terra`, or states the wrong tier | static | none | No behaviour is added: this is prose. Grep during this pass: `providers.md:59-60,69,72`, `README.md:38,195,204-205,207,219` state `sol`/`sol/medium`. Mirror accuracy belongs to asd-reviewer-documentation. The tier-table drift risk existed before this sprint and this change does not create it |
| Live canon and generated views contain no `terra` (AC-4) | `terra` survives somewhere in live canon | static | none | This is a DoD grep, not a test: `grep -rniI terra` over `.asd` (minus `sprints`), `README.md`, `AGENTS.md`, `tests`, `.codex`, `.claude/agents`, `.claude/skills` and `.agents` returns no match. A permanent test against `terra` is out of scope (sprint.md) |
| `tests/run.js:2335` negative-cache fixture `gpt-5.6-terra` → `gpt-6-luna` | the substitute model equals the base input, so the fingerprint-change assertion passes vacuously | unit | keep | The base input is `model: 'gpt-6-sol'`. `gpt-6-luna` differs, so the fingerprint still changes and the `local-ready` assertion stays meaningful |
| Hash ledgers (`canon_hashes`/`upstream_hashes`) regenerated | a ledger is stale after the canon edits | static | keep | The existing hash-ledger freshness tests in `tests/run.js` and `sync.js --check` both cover this |

## Removed tests

None.

## Added tests

None — every material risk above already has a check, and the strategy decided no additions.

## Suite run

- Command: `node tests/run.js`
- Scope: full (safety valve: `.asd/sync.js`, `.asd/release-manifest.json`)
- Result: pass — 213 passed, 0 failed, 0 skipped (exit 0)
- Lint / build: pass — `git diff --cached --check` exit 0; `node .asd/sync.js --check` exit 0
- HEAD: 5b5c91d22b92eb1dccb4d76e09fb671792a9e20c

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
