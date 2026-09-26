---
name: parallel-wave-home-citations
description: In a parallel wave where a rule-doc Task creates homes other Tasks cite, read the siblings' uncommitted working-tree diff before picking the heading a rule lands under
metadata:
  type: project
---

When one wave-3-style Task owns the rule docs and sibling Tasks (workflows, agents) cite those rules at the same time, the plan often names only the file, not the section. The siblings pick a section name while you are still writing. Before placing a rule, run `git diff -- <sibling paths>` and grep for citations of your files. Then put each rule under the heading they already cite, e.g. sprint 019: `review-policy.md` "Autofix vs escalation" for memory-fix, `artifact-layout.md` "Test plan" for the review-fix tester rows.

**Why:** sprint 019 Task 3. The audit suggested `sprint-lifecycle.md` as the AC-15 home, but Task 4 had already cited `artifact-layout.md` "Test plan". Following the audit would have left a dangling citation.

**How to apply:** check this before the first edit. Report sibling-cited homes you could not honour under `Flagged choices`. Related: [[parallel-agent-commit-sweep]].
