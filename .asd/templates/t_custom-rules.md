---
responsibility:
  owns: project-owner custom rules read by all agents alongside .asd/rules/
  excludes: workflow infrastructure rules
  delegates_to: .asd/rules/ (workflow rules)
---

# Custom Rules

Project-specific rules added by the project owner. ASD agents read this file in addition to standard rules in `.asd/rules/`. Edit freely. ASD never overwrites this file.
