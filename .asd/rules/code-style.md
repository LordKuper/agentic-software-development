# Code Style

Implementation-level rules for code-writing agents (Backend Dev, Frontend Dev,
Test Engineer). Binding during the `impl` phase and verified against during
`impl-review`. These rules govern how code is written; architecture-level
design rules are out of scope here. All code is written in English.

## 1. Engineering Principles

- Follow SOLID, KISS, DRY, YAGNI.
- Small, atomic functions with a single clear responsibility.
- Readability and maintainability over cleverness.
- No hidden coupling, global state, or action at a distance.

## 2. Naming

- Names reveal intent. Abbreviations only when domain-standard.
- Casing follows the language convention. No Hungarian or type prefixes.
- Booleans read as predicates (`is`, `has`, `should`).
- One concept, one name across the codebase.

## 3. Scope Discipline

- Touch only what the task requires. Every changed line traces to the task.
- Match the style of the surrounding code.
- Do not refactor or "improve" adjacent code that the task did not ask for.
- Remove only the code and dependencies your own change introduced.

## 4. Functions and Modules

- Guard clauses over deep nesting. Keep nesting shallow.
- Pass explicit parameters; do not reach into implicit globals or ambient state.
- A function that needs a paragraph to explain what it does is too big — split it.

## 5. Root Cause Over Patch

- Fix the underlying cause, not the visible symptom.
- No temporary workarounds, no masking of failures.

## 6. Error Handling

- No swallowed errors. An empty catch block is forbidden.
- Validate input at system boundaries; reject bad state early rather than
  letting it propagate.
- Errors carry context (what failed, with which inputs).
- Do not use errors or exceptions as control flow for expected cases.

## 7. Comments and Documentation

- Comments explain WHY, not WHAT. Code that needs a comment to be understood
  should usually be rewritten instead.
- Doc comments are mandatory on every public or exported type and member.
  Internal and private code documents only what a clear name cannot carry.
- Use the language-native doc format (XML-doc for C#, docstrings for Python,
  JSDoc for TypeScript, etc.).
- When code changes, its doc comments are updated to stay accurate.
- No commented-out code. No dead code kept "in case we need it".
- A `TODO` uses the marker `// TODO(sprint-<NNN-slug>): <reason>` and has a
  matching entry in the project stub registry.

## 8. References to Project Documents

- Code — including comments, XML documentation, docstrings, and string
  literals — must not reference project documents (rules, ADR, PRD, UX spec,
  decisions log, sprint files, etc.).
- Code is the single source of truth for behavior; document references in code
  rot and mislead once those documents move or change.
- Exception: `TODO` markers may carry a reference, since they are tracked and
  removed.

## 9. Types and Contracts

- Explicit types at boundaries. Untyped escape hatches (`any` and equivalents)
  only with a written justification.
- Make illegal states unrepresentable where the language makes it cheap.
- Honor declared API and interface contracts exactly.

## 10. State

- Prefer immutable and local data. No shared mutable state without explicit
  synchronization.
- No hidden side effects in functions that look pure.
- Keep variable scope and lifetime as small as possible.

## 11. Determinism

- Prefer logic that produces the same outputs for the same inputs, unless the
  task explicitly requires otherwise.
- Avoid incidental time-dependent or order-dependent behavior in core logic.
- When nondeterminism is intended, isolate it behind a small interface and
  test the deterministic part separately.

## 12. No Hardcoded Values

- Tuning and configuration values live in external config files, not in code.
- UI visual values (color, typography, spacing, radii) bind to design tokens.
  No raw hex, px, or pt literals in UI code.

## 13. Dependencies

- A new third-party dependency requires explicit user approval before use.
- Prefer the standard library. Pin dependency versions.

## 14. External API Verification

- Do not rely on training data for the API of a library, framework, or runtime.
- Verify signatures and behavior against the documentation of the pinned
  version before using an external API.

## 15. Security

- No secrets in code, logs, or commits.
- Validate and sanitize all external input.
- Use parameterized queries and APIs; never build SQL, shell, or other
  commands by string concatenation.
- Apply least privilege to every credential, token, and access scope.

## 16. Logging

- Logs are structured and carry context.
- Never log secrets or personally identifiable information.
- Log levels are meaningful: error for failures, warn for recoverable
  anomalies, info for state changes, debug for detail.

## 17. Tests

- Tests for a new system are written before its implementation
  (verification-driven): expected output is compared against actual before
  the work is marked complete.
- Every acceptance criterion has test coverage.
- Tests verify observable behavior, not implementation detail.
- No meaningless assertions and no tests written only to inflate coverage.
- Tests are deterministic: no reliance on `sleep`, wall-clock timing, random
  seeds, or execution order.
- Tests are isolated: no calls to real external APIs, databases, or file I/O;
  use dependency injection.
- No hardcoded test data: build fixtures from named constants or factory
  functions (exception: boundary-value tests where the literal is the point).
- Test files are named `<system>_<feature>_test.<ext>`; test functions are
  named `test_<scenario>_<expected>`.
- A test that mutates global or static state saves and restores it in setup
  and teardown to prevent cross-test leakage.
- Structure each test as Arrange — Act — Assert.
- Global test coverage must not fall below 80%.

## 18. Concurrency

- No data races. Document the thread-safety of every shared component.
- Every blocking I/O call has a timeout.
- Keep the main and UI threads free: offload CPU-heavy and I/O-bound work.
  No `sleep`, busy-wait, or synchronous locks on the main or UI thread.

## 19. Formatting

- The project formatter and linter decide style; no manual style debate.
- Style is consistent within a file.
- Build, test, and lint must pass before any commit.

## 20. Per-Language Rules

Language- and stack-specific rules are added below as the project stack is
fixed. Empty until then.
