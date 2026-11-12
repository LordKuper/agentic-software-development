# Test plan entry 03 — sprint 033-retro-intake-model-choice

Rotated narrative rows of `Entry log` entry 3 (HEAD analysed 245bed7a), plus the review-fix wave-1/iter-01 in-place tester rows. Never edited.

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
| tests/run.js: sprint-033 AC-24 (review-fix): a rename-map collapse keeps the rename and mode header lines… | `node tests/run.js --filter "AC-24 (review-fix)"` in the pre-fix tree → exit 1, that test (1 matched), patch lacked `rename from` and named the file `"a/src/\303\251.js" "b/src/\303\251.js"`; green at HEAD; runs: 1. Review finding F3 (iter-02): the sandbox also deletes `src/ü.js` (40 lines) and asserts `# collapsed: src/ü.js: deleted, 40 lines` with no `Ã`/`¼` escape and `review-waves` `lines` 0; `node tests/run.js --filter "AC-24 (review-fix)"` in `git archive 70c67011` (before the sectionPath decode fix) under `.asd/tmp/`, the earlier rename/mode/substitution asserts dropped from the copy so the new one is first → exit 1, that test (1 matched), `a deleted C-quoted path is named by its decoded characters in the deletion collapse`, output `"a/src/Ã¼.js" "b/src/Ã¼.js": deleted, 40 lines`; green at HEAD; runs: 1 |
| tests/run.js: sprint-033 AC-25: persist-review --floor… (FAIL and stalemate cases added) | `--filter "AC-25: persist-review"` in the pre-fix tree → exit 1, that test (1 matched), `a FAIL whose every row dropped becomes APPROVE`; runs: 1 |
| tests/run.js: sprint-033 AC-19/AC-33: the 14.5.0 migration… (unparsable-frontmatter case added) | `--filter "AC-19/AC-33"` in the pre-fix tree → exit 1, that test (1 matched), `.claude/agent-memory/asd-pm` deleted; runs: 1 |
| tests/run.js: sprint-033 AC-32: design-tokens (both tests, markers re-pointed) | `--filter "AC-32"` in the pre-fix tree → exit 1, 2 matched, the new CSS-comment fixture refused for lacking `<!-- asd:vars:start -->`; runs: 1 |

## Suite run

- Command: `node tests/run.js`
- Scope: impacted (the one runner holds every impacted test; the shared-infrastructure valve would give the same set)
- Result: pass — 362 passed, 0 failed, 0 skipped of 362, exit 0
- Lint / build: `node .asd/sync.js --check` exit 0 (`ok: true`); lint runs at commit (`git diff --cached --check`)
- HEAD: 50c9f5de (F3 in-place test fix: `--filter "sprint-033"` 21/21, full 362/362, exit 0)
