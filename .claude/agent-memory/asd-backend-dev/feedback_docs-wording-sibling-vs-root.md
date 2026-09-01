---
name: feedback-docs-wording-sibling-vs-root
description: When renaming/wording persistent-docs references in ASD canon, disambiguate sprint-sibling refs from persistent-root refs before mechanically applying a rename or wording convention
metadata:
  type: feedback
---

In this repo's `design/` → `docs/` rename sprint, a mechanical find-replace over-renamed several `delegates_to:`/comment lines that actually meant the **sprint-local sibling** draft folder (`<sprint>/design/`, sibling of `plan.md`/`audit.md`/`reviews/`) into the **persistent repo-root** `docs/`, producing wrong doc pointers caught by 5 independent reviewers.

**Rule:** before applying a root-rename or a wording convention (e.g. "persistent docs") to any line mentioning a docs-like path, check whether the file's own context (an explicit relative link elsewhere in the same file, or its sibling `excludes:`/`delegates_to:` items) proves the reference means the persistent repo root, vs. being a sprint-local sibling reference that should stay pointing at the sprint draft folder. `t_plan.md` had corroborating `../../../docs/...` links proving root; `t_sprint.md`/`t_test-plan.md` had no such corroboration and their sibling `delegates_to` items (plan.md, audit.md, reviews/) proved sprint-local.

**Why:** the reviewers' fix instructions explicitly asked to re-run this disambiguation test on every `X/ docs`-style line before deciding revert-vs-reword, rather than trusting the original mechanical rename.
**How to apply:** for any repo-wide rename or phrasing sweep across doc-path references in `.asd/templates`/`.asd/rules`/`.asd/workflows`, grep all occurrences first, then judge root-vs-sibling per file via corroborating context before editing — don't blindly replace_all.
