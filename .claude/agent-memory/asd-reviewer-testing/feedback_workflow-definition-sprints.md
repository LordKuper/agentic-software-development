---
name: workflow-definition-sprints
description: Since sprint 020 the chain lives in .asd/workflows/<name>.json; predecessor and collapse acting sites now pinned (iter-02); name-guard cases need an existing target; step-citation pins keyed on words shared by several steps; this memory dir is swept for removed-mechanism terms
metadata:
  type: feedback
---

Since sprint 020, each sprint workflow (`standard`, `lite`) is a definition in `.asd/workflows/<name>.json`, loaded by `runtime.loadWorkflow`. The §16 tests in `tests/run.js` derive everything from `readWorkflowDefinitions()`.

- **Predecessor pins.** Raised low in sprint 020 wave-1 iter-01 because they stopped at `checkpoints.md`. Fixed in iter-02: the chain-mirror loop now also checks each differing predecessor in `asd-phase-<phase>.md`. That regex matches anywhere in the file, not only on the Preconditions line (low). Re-check whenever a workflow is added or a predecessor moves.
- **The design collapse has three acting sites**: the audit exit, the hook (`phases.includes('design')`), and `asd-sprint` SKILL.md Step 2B (re-run menu + resume exception). All three were pinned by sprint 020 iter-02. Check all three again when a workflow gains or loses `design`.
- **Name-guard negative cases must target a file that exists.** A traversal value like `../standard` that resolves to a path the fixture never wrote passes with or without the guard. A case variant like `Lite` fails without the guard only on a case-insensitive FS (Windows/macOS), not on Linux. Use a value that resolves to an installed definition (`../workflows/lite`).
- **Step-citation pins.** Check which step the predicate actually picks out. The sprint-020 combined carve-out test requires the cited `asd-phase-design-promote.md` step to contain `creators` and `` `lite` ``, but step 5 (the "wait for creators" step) also matches. So the message "the step whose creators write the docs" claims more than the predicate checks. Judged low.
- **The NEXT-contract check uses the union over definitions.** A target added to one definition that another definition already routes (for example `retro` in lite's `impl-review`) stays green. This is recorded as a known limit.
- **This memory directory is inside a leftover-term sweep.** The sprint-020 AC-1 test greps every `.claude/agent-memory/**/*.md` for the name of the removed hook chain constant and for the removed reset-table phrase. If a memory write quotes either literally, the suite goes red. Paraphrase them.
- **Ledger arithmetic.** README.md is not in `release-manifest.json` `upstream_hashes`, so a README-only mutation adds no hash-noise FAIL line. Rule docs add 1 noise line (`upstream_hashes`). Agents and skills add 3 (`canon_hashes`, `upstream_hashes`, `sync --check`). The hook adds 2.

**Why:** a rule-home pin looks complete, but it guards nothing at the site that executes. Writing to memory while reviewing can also break the suite for the next impl-test.
**How to apply:** in any sprint that edits workflow definitions, grep `.asd/workflows/asd-phase-*.md` and `.asd/skills/asd-sprint/SKILL.md` for per-workflow clauses and compare them with the tests. Before writing memory, check the removed-term regexes in `tests/run.js`. See [[sweep-exemption-granularity]], [[no-shell-review-method]], [[removed-flag-vacuity]].
