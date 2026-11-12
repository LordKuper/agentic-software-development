---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 033-retro-intake-model-choice

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 97cdd2f3 | full change surface |
| 2 | 14898f4a | delta since entry 1 (D-1..D-4 fixes) |
| 3 | 245bed7a | delta since entry 2 (review-fix wave-1/iter-01, bcd4f6ac..c6d460a8) |

## Risk → check decisions

Entry 3 delta (`14898f4a...HEAD`, canon only: runtime, migration 14.5.0, rule/workflow/agent prose, README, templates, release-manifest hashes). Entry 2 rows rotated to `test-plan.entry-02.md`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `persist-review --floor` `applyFloor`: FAIL rewritten like CONCERNS, stalemate FAIL kept | an all-dropped external FAIL stays a blocking verdict; a stalemate FAIL turned into APPROVE | component | add | Two cases added to the existing AC-25 test (FAIL to APPROVE with its count line, stalemate FAIL unchanged); the existing CONCERNS cases never reach the FAIL branch |
| `collapsePatch`/`sectionPath`/`gitPath`: rename and mode header lines kept, C-quoted path decoded | a collapsed rename or chmod invisible to the reviewer; a non-ASCII file named by its quoted form and never discounted from the wave size | component (real git repo) | add | One new test over a renamed file, a chmod file and an `é.js` file, all substitution-only, asserting patch text and `review-waves` lines; the existing AC-35 test has none of these shapes |
| migration `14.5.0.js` `liveAgentNames`: an unparsable agent frontmatter returns null with a warning | a live variant's memory deleted because its frontmatter failed to parse | component | add | One case appended to the existing AC-19/AC-33 test beside the missing-agents-directory case |
| `design-tokens` vars region moved to `/* asd:vars:start */`...`/* asd:vars:end */` | an HTML comment inside `<style>` breaks the `:root` selector; a stale marker pair accepted | component | keep | Existing AC-32 tests re-pointed (fixture markers, missing-end-marker pattern): they were red at this entry's start (test defects, pinned the old markers); the byte-exact expected output now has no `<!--` inside `<style>`, so one fixture covers the validity risk |
| prose-only fixes: `core.md`, `agent-protocol.md`, `review-policy.md`, `sprint-lifecycle.md`, `artifact-layout.md`, `external-review.md`, `providers.md`, `design-system.md`, workflows (design-review, impl-review, impl-test), `asd-advisor`/`asd-tester`/`asd-reviewer-quality` agents, skills, `t_AGENTS.md`/`t_design-system.html`, README, `release-manifest.json` | a reworded rule dropping a token another file or test reads | contract | none | No parsed token ties files together beyond the ones the surviving pins already read (sprint-010/018/020/026/027/028/032/033 pins, phase-chain, form sweeps, README mirrors) — all green at this HEAD; impl-review's quality reviewer judges the prose |
| sprint-026 AC-16 load ceiling (headroom now about 56 B of the 0.70 ceiling) | the next prose addition to an orchestrator/impl-loaded section re-breaches the ceiling | contract | keep | Existing byte-exact pin is the guard, green at this HEAD; a second budget test would duplicate it. Risk recorded: any later canon edit in those sections re-runs it |

## Removed tests

None. No test is redundant with a surviving one in this delta; none was touched.

| Test | Reason | In change scope |
|---|---|---|
| — | — | — |

## Added tests

Fail-first proof is a run of the new `tests/run.js` against the pre-fix tree (`git archive 14898f4a` extracted outside the repo, new runner copied in) — no production file was touched; the extraction was deleted afterwards.

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-033 AC-24 (review-fix): a rename-map collapse keeps the rename and mode header lines… | `node tests/run.js --filter "AC-24 (review-fix)"` in the pre-fix tree → exit 1, that test (1 matched), patch lacked `rename from` and named the file `"a/src/\303\251.js" "b/src/\303\251.js"`; green at HEAD; runs: 1 |
| tests/run.js: sprint-033 AC-25: persist-review --floor… (FAIL and stalemate cases added) | `--filter "AC-25: persist-review"` in the pre-fix tree → exit 1, that test (1 matched), `a FAIL whose every row dropped becomes APPROVE`; runs: 1 |
| tests/run.js: sprint-033 AC-19/AC-33: the 14.5.0 migration… (unparsable-frontmatter case added) | `--filter "AC-19/AC-33"` in the pre-fix tree → exit 1, that test (1 matched), `.claude/agent-memory/asd-pm` deleted; runs: 1 |
| tests/run.js: sprint-033 AC-32: design-tokens (both tests, markers re-pointed) | `--filter "AC-32"` in the pre-fix tree → exit 1, 2 matched, the new CSS-comment fixture refused for lacking `<!-- asd:vars:start -->`; runs: 1 |

## Suite run

- Command: `node tests/run.js`
- Scope: impacted (the one runner holds every impacted test; the shared-infrastructure valve would give the same set)
- Result: pass — 362 passed, 0 failed, 0 skipped of 362, exit 0
- Lint / build: `node .asd/sync.js --check` exit 0 (`ok: true`); lint runs at commit (`git diff --cached --check`)
- HEAD: a6109932

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/agents/asd-scout.md | AssertionError [ERR_ASSERTION]: sprint-018 AC-3: asd-scout must render web_search = "disabled" - Codex parity with its canonical Claude web grant, variants inheriting the base key | AC-3/6/7: every canonical Codex agent renders a supported delegate config | fixed | b5edbb1f |
| D-2 | 1 | .asd/agents/asd-scout.md | AssertionError [ERR_ASSERTION]: AC-2: asd-scout keeps WebFetch in disallowedTools | sprint-018 AC-1/AC-2/AC-4/AC-8/AC-9: no agent grants AskUserQuestion, web access is granted whole or withheld whole with every grant scoped by policy, and every shell is bounded with commit holders matching git-strategy.md | fixed | b5edbb1f |
| D-3 | 1 | .asd/rules/providers.md | AssertionError [ERR_ASSERTION]: orchestrator/impl: 148496 B is 0.7211 of 205926 B, ceiling 0.7 | sprint-026 AC-16 (D13): per-dispatch load of dev (impl), tester (impl-test), combined reviewer (impl-review) and the orchestrator (impl) is at most 0.70 of its main baseline | fixed | 6c66383c |
| D-4 | 1 | README.md | AssertionError [ERR_ASSERTION]: AC-25: persist-review --floor applies the floor, but the README roster row of asd-external-review still says the wrapper does | sprint-033 AC-25: README no longer says the External Review wrapper applies the severity floor - persist-review does, so its roster row names no wrapper-applied floor | fixed | b5edbb1f |
