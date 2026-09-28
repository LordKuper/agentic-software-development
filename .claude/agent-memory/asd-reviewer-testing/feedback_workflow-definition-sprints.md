---
name: workflow-definition-sprints
description: Since sprint 020 the chain lives in .asd/workflows/<name>.json; per-workflow predecessor pins reach checkpoints.md only; collapse has 3 acting sites; name-guard cases need an existing target; this memory dir is swept for removed-mechanism terms
metadata:
  type: feedback
---

Since sprint 020, each sprint workflow (`standard`, `lite`) is a definition in `.asd/workflows/<name>.json`, loaded by `runtime.loadWorkflow`. The §16 tests in `tests/run.js` derive everything from `readWorkflowDefinitions()`.

- **Predecessor pins stop at the rule home.** The chain-mirror test checks the "In `<workflow>`" predecessor clauses of `checkpoints.md` against each definition. The acting sites that actually fire `ABORT — precondition not met` are not checked: the `## Preconditions` / step 1 lines of `asd-phase-plan.md`, `asd-phase-retro.md` and `asd-phase-design-promote.md`, each naming a per-workflow predecessor. Raised low in sprint 020 wave-1 iter-01. Re-check this whenever a workflow is added or a predecessor moves.
- **The design collapse has three acting sites**: the audit exit (pinned to "workflows whose phases hold design"), the hook (`phases.includes('design')`, pinned by the probe case), and the `asd-sprint` SKILL.md resume/re-run exception (unpinned in sprint 020 — a real lite stuck-resume defect slipped through, COR-1). Check all three.
- **Name-guard negative cases must target a file that exists.** A traversal value like `../standard` that resolves to a path the fixture never wrote passes with or without the guard; a case variant like `Lite` fails without the guard only on a case-insensitive FS (Windows/macOS), not on Linux. Ask for a value that resolves to an installed definition (`../workflows/lite`).
- **The NEXT-contract check uses the union over definitions.** A target added to one definition that another definition already routes (for example `retro` in lite's `impl-review`) stays green. This is recorded as a known limit.
- **This memory directory is inside a leftover-term sweep.** The sprint-020 AC-1 test greps every `.claude/agent-memory/**/*.md` for the name of the removed hook chain constant and for the removed reset-table phrase. If a memory write quotes either literally, the suite goes red. Paraphrase them.

**Why:** a rule-home pin looks complete, but it guards nothing at the site that executes. Writing to memory while reviewing can also break the suite for the next impl-test.
**How to apply:** in any sprint that edits workflow definitions, grep `.asd/workflows/asd-phase-*.md` and `.asd/skills/asd-sprint/SKILL.md` for per-workflow clauses and compare them with the tests. Before writing memory, check the removed-term regexes in `tests/run.js`. See [[sweep-exemption-granularity]], [[no-shell-review-method]], [[removed-flag-vacuity]].
