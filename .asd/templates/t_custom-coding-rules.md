---
responsibility:
  owns: project-owner custom rules read during impl and impl-review phases
  excludes: universal rules, design-only rules
  delegates_to: custom-common-rules.md (all phases), custom-design-rules.md (design/design-review)
---

# Custom Coding Rules

Project rules applying only to code and tests. Read by `asd-backend-dev`, `asd-frontend-dev`, `asd-test-engineer`, impl-review reviewers.

Put here: forbidden libraries/APIs, perf budgets (latency, memory, throughput, regression tolerances), security policy, test coverage thresholds, code-style constraints beyond `.asd/rules/code-style.md`. ASD never overwrites this file.
