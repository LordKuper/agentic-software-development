# Code Style

Dev and Tester follow these rules in `impl` and `impl-test`. Verify them at `impl-review`. Write code in English.

## 1. Engineering Principles

- Follow SOLID, KISS, DRY, YAGNI.
- Small atomic functions, single clear responsibility.
- Readability over cleverness.
- No hidden coupling, global state, or action at a distance.
- While authoring, apply both `review-policy.md` checklists (over-engineering, structure/cohesion) and both `artifact-layout.md` iron rules (SSoT, documentation economy).

## 2. Naming

- Names reveal intent. Abbreviations only when domain-standard.
- Casing follows language convention. No Hungarian or type prefixes.
- Booleans read as predicates (`is`, `has`, `should`).
- One concept, one name across the codebase.

## 3. Scope Discipline

- Touch only what the task requires; every changed line traces to the task.
- Match surrounding code style.
- Do not refactor adjacent code the task did not ask for.
- Remove only the code and dependencies your change introduced.

## 4. Functions and Modules

- Prefer guard clauses to deep nesting.
- Pass explicit parameters; no implicit globals or ambient state.
- A function needing a paragraph to explain itself is too big — split it.

## 5. Root Cause Over Patch

- Fix the underlying cause, not the symptom.
- No temporary workarounds, no masking of failures.
- Never disable, skip or downgrade a check (lint rule, type check, test, validator) or add an inline suppression to make a change pass. Exception: one path and one rule with a reason, returned as `QUESTION` under the quality-waiver hard gate (`checkpoints.md` "Gate policy").

## 6. Error Handling

- Propagate or handle errors. Empty catches are forbidden.
- Validate input at system boundaries; reject bad state early.
- Errors carry context (what failed, with which inputs).
- Do not use errors/exceptions as control flow for expected cases.

## 7. Comments and Documentation

- Keep method/function bodies comment-free except `// TODO(sprint-<NNN-slug>): <reason>` markers. Rename, split or rewrite code that needs narration.
- Document every public/exported type and member. For internal code, document only what a clear name cannot carry. Use doc comments for rationale.
- Type-level doc: short, states the type's purpose ONLY — never duplicates or summarizes its members' docs. Member-level doc: short, states the member's purpose, never its implementation. Each member carries its own doc; state each fact once.
- Apply `artifact-layout.md` "Documentation economy" to comments.
- Inherit docs (`<inheritdoc/>`, `@inheritDoc`, etc.) wherever an override or implementation matches the base contract; do not restate inherited text.
- Use the language-native doc format (XML-doc C#, docstrings Python, JSDoc TypeScript, etc.).
- Update doc comments when code changes.
- No commented-out code, no dead code kept "in case".
- Register each `TODO` marker in the project stub registry.

## 8. References to Project Documents

- Code (comments, doc strings, string literals) must not reference project documents (rules, ADR, PRD, UX spec, decisions log, sprint files).
- Do not quote or paraphrase document text in code; replace with a brief standalone rationale (e.g. `not deterministic by design`).
- Exception: `TODO` markers may carry a reference, since they are tracked and removed.
- Exception: a test file's name or path may carry an `AC-N` id (the impacted-set AC-citation convention, `sprint-lifecycle.md` "Impacted test set") — an id only, never prose referencing a document.

## 9. Types and Contracts

- Explicit types at boundaries. Untyped escape hatches (`any` and equivalents) only with written justification.
- Make illegal states unrepresentable where the language makes it cheap.
- Honor declared API and interface contracts exactly.

## 10. State

- Prefer immutable, local data. No shared mutable state without explicit synchronization.
- No hidden side effects in functions that look pure.
- Keep variable scope and lifetime minimal.

## 11. Determinism

- Prefer logic producing the same outputs for the same inputs, unless the task requires otherwise.
- Avoid incidental time- or order-dependent behavior in core logic.
- When nondeterminism is intended, isolate it behind a small interface; test the deterministic part separately.

## 12. No Hardcoded Values

- Tuning/configuration values live in external config files, not code.
- UI visual values (color, typography, spacing, radii) bind to design tokens. No raw hex, px, or pt in UI code.

## 13. Dependencies

- A new third-party dependency follows `checkpoints.md` decision policy before use; retain trust-boundary and compatibility checks.
- Prefer the standard library. Pin dependency versions.

## 14. External API Verification

- Do not rely on training data for the API of a library, framework, or runtime.
- Verify signatures and behavior against the pinned version's documentation before use.

## 15. Security

- No secrets in code, logs, or commits.
- Validate and sanitize all external input.
- Use parameterized queries/APIs; never build SQL, shell, or other commands by string concatenation.
- Least privilege for every credential, token, access scope.

## 16. Logging

- Logs are structured and carry context.
- Never log secrets or PII.
- Meaningful log levels: error (failures), warn (recoverable anomalies), info (state changes), debug (detail).

## 17. Tests

Write and run tests in `impl-test` after implementation acceptance. In `impl`, only `asd-tester` handles a plan-declared `Test-only` Task (`sprint-lifecycle.md` "Plan file format").

- Cover every acceptance criterion with the cheapest reliable check for its material risk: static/architecture → focused unit or property → component or boundary contract → essential e2e journey. Verify observable behavior. For review scope selection, exercise applicable path cases with the Git-generated file list passed to manifest generation.
- **Hypothetical-risk criterion — single home, governs both authoring and pruning:** require a material risk on the change surface evidenced by actual behavior, a named failure mode or a stated requirement. Hypothetical, already-covered or coverage-only checks are ineligible additions and removal candidates. Reject trivial, implementation-coupled, mock-confirming and flaky tests. Delete duplicates. Coverage numbers help locate gaps and do not gate or set a quota.
- **Admission:** record gap proof in `Added tests`: the seeded defect leaves the unit's existing tests green, or search found no test of the unit. With no qualifying gap, record `none` and why in `test-plan.md` (cite any existing test that fails on the seeded defect). Extend the existing test for its contract. Add a function only for an unowned contract.
- Every fixed behaviour defect reproducible by running code leaves a regression test proven against the pre-fix behavior (fail-first run recorded) or an equivalent targeted mutation. A fix to prose, a rule or a document adds a test only when it changes a token a machine parses. The record names the exact command, its non-zero exit code and the runner-reported name of the failing test; a mutation proof records the same for the mutated run. A bare claim ("proved", "fails without the fix") is no proof. A mutation made to prove fail-first is restored before the agent's next tool call. A mutation left on disk is a defect regardless of what the suite reports.
- A sprint adding or changing a deterministic check (a `commands.yaml` command, lint rule, validator) records one run with a seeded violation exiting non-zero, in that record shape, the violation restored as above.
- Deterministic: no `sleep`, wall-clock timing, random seeds, or execution-order reliance.
- Isolated: no real external APIs, databases, or file I/O; use dependency injection.
- No hardcoded test data: build fixtures from named constants or factories (exception: boundary-value tests where the literal is the point).
- Derive a test or rule's named set from its source when available.
- A content-contract test pins a token that cannot be reworded without changing the contract — a heading, a command, a field name, a parsed literal — never the surrounding prose, and is added only for a changed token a machine parses. Its fail-first proof is bounded per entry: one representative mutation per added assert plus one reword control for the entry (the same assert reworded must stay green); for a pin of a changed rule the representative mutation restores the superseded rule text, or removes the new clause while keeping its citation, never a token rename the old rule would also satisfy; each mutation and control run executes only the asserting test, through the runner's test-name filter (ASD's own `tests/run.js`: `--filter <substring>`), never the whole suite, its record adding the matched test count; the `test-plan.md` "Added tests" row's `Regression proof` cell records the row's mutation runs as `runs: <n>`, the entry's single control counted in its first content-contract row.
- Test files named `<system>_<feature>_test.<ext>`; test functions `test_<scenario>_<expected>`.
- Name a one-sprint sweep or migration test `temporary(<NNN>): …` with the sprint number. Remove it in a later sprint's prune pass.
- A test mutating global/static state saves and restores it in setup/teardown.
- Structure each test as Arrange — Act — Assert.

## 18. Concurrency

- No data races. Document thread-safety of every shared component.
- Every blocking I/O call has a timeout.
- Keep main/UI threads free: offload CPU-heavy and I/O-bound work. No `sleep`, busy-wait, or synchronous locks on the main/UI thread.

## 19. Formatting

- The project formatter and linter decide style; no manual style debate.
- Style consistent within a file.
- Preserve existing line endings. Anchor scripted edits on the file's actual EOL. Prefer an EOL-preserving editor and check diff size before staging.
- Build and lint must pass before any commit; the impacted test set (`sprint-lifecycle.md` "Impacted test set") gates `impl-test`, not each commit — the full suite runs once, at the end of `impl-review`.
- Configure pre-commit lint as `git diff --cached --check` and exempt generated review diff files (`.asd/sprints/**/reviews/**/*.diff`), e.g. via the `-whitespace` gitattribute. `git diff --check` checks unstaged edits alone. Use `git diff --check HEAD` only when the worktree holds exclusively the staged change.

## 20. Per-Language Rules

Language- and stack-specific rules are added below as the project stack is fixed. Empty until then.
