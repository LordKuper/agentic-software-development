# Test plan entry 07 — sprint 026-structured-specs

Rotated narrative rows of Entry log entry 7 plus the review-fix wave-3/iter-03 tester rows; never edited.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| D-3 memory fix 51f9a640 (`.claude/agent-memory/asd-tester-critical/project_testability-envelope.md` "Sweep guards") | leftover removed prose-table terms in agent memory | leftover-term grep over `.claude/agent-memory/**` (removed terms: "Additional-context cell", "files named by the consulting question", `## Operations used`, `asd-advisor.md` Don'ts) | none | zero hits; memory is not a test surface and the sweep test (Task 13 §27) already pins the grant table; a memory-text pin is a hypothetical risk (`code-style.md` §17) |
| review-fix wave-3/iter-03 external 1: `markdownSection` edge table (`tests/run.js` §27 SECTION_CASES) - shorter fence inside longer, other-char fence, backtick info string | `markdownHeadings` fence rules (runtime.js) | table cases | added | a mis-closed or mis-opened fence hides or invents a heading and silently changes a section ref's content |
| review-fix wave-3/iter-03 combined 8 (`tests/run.js` banner order) | the `// Runner` banner sat above §27 | none (structure only) | none | moved the §27 block above the banner; no behaviour change, suite 296/296 |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | entry 7 delta removes no test | n/a |

## Added tests

| Test | Regression proof |
|---|---|
| `sprint-026 AC-14 (D11): markdownSection ...` cases `a shorter fence inside a longer one does not close it`, `a fence of the other character does not close it`, `a backtick info string with a backtick opens no fence...` (external 1) | mutation of runtime.js `markdownHeadings`, restored by `git checkout -- .asd/runtime.js`; runs: 3. Drop the length clause: `node tests/run.js` exit 1, `AssertionError: a shorter fence inside a longer one does not close it`. Drop the char clause: exit 1, `AssertionError: a fence of the other character does not close it`. Opener accepts a backtick info string: exit 1, `Error: heading "D": 0 matches` in the same test. Control (restored): 296/296, exit 0 |
| `sprint-012 AC-5/AC-6: providers.md ...` pin narrowed to `providers.md` "Declared tool policy" only (combined 5) | one mutation: `artifact-layout.md` "Agent memory" re-pointed to `providers.md` "Role-scoped context", restored by `git checkout`; runs: 1. `node tests/run.js` exit 1, `AssertionError: .asd/rules/artifact-layout.md "Agent memory" must point at the declared tool policy`. Control (restored): 296/296, exit 0 |
