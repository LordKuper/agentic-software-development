---
name: perf-budget-interpretation
description: How to run performance review in the ASD framework repo — no conventional perf budgets exist, so use AGENTS.md's runtime-token rule as surrogate budget; also how to reconstruct diff scope without a shell
metadata:
  type: project
---

In this repo (the ASD framework, `self_hosting: enabled`), `.asd/project/custom-coding-rules.md` has **no perf budgets section** — its three rules are zero-dependency/sync-discipline constraints, not latency/memory/throughput budgets. `custom-common-rules.md` has none either. (Re-verified 2026-09-01, sprint 001.) The formal stop condition ("no budgets → APPROVE with note") therefore fires on almost every sprint here.

The only executable surfaces that can carry real perf risk are six files: `.asd/sync.js`, `.asd/skills/asd-update/update.js`, `tests/run.js`, and the three `session-start.js` hooks (two of which are generated).

**Why:** the "product" is agent-runtime instructions, so the closest thing to a perf budget is `AGENTS.md`'s hard rule "Every change must minimize runtime tokens". Treating that as the surrogate budget makes the review substantive instead of a rubber stamp on prose-only sprints.

**How to apply:** when a diff touches none of the six executable files, mark the classic rubric (`anti-patterns`, `algorithmic complexity`, `hot path`) `n/a` with that evidence, but still actively check (a) net prose/token delta against the AGENTS.md rule, and (b) any string that is *executable data* rather than prose — the `':(exclude)…'` git pathspecs in `external-review.md` / `asd-external-review.md` / `t_prompt-external-impl.md` (they size the external-review diff payload) and `.asd/release-manifest.json` `managed_paths` cardinality (it sizes what `update.js` parses; `canon_hashes`/`upstream_hashes` churn is value-only and free). Escalate to a real finding only if one of those grows. `managed_paths` is directory-level (7 entries), so file renames *inside* a tracked tree never grow it.

**Scope reconstruction without a shell:** this agent has no `Bash` tool (tools = Read/Glob/Grep), so a dispatcher instruction like "run this `git diff` yourself" cannot be honored. Reconstruct the changed-file set from `Glob` results, which are **mtime-ascending (oldest first)** — the iteration's files are the tail. Cross-directory ordering needs anchor files present in two overlapping globs. Say so explicitly in the coverage ledger rather than silently trusting the dispatcher's file list.

**Glob truncation trap:** Glob caps output at 100 paths and drops the *overflow* — with mtime-ascending order that silently removes the newest files, i.e. exactly the ones under review. A broad pattern like `.asd/**/*.md` overflows. Narrow until the result count is under 100; a pattern that works repo-wide: `{.asd/rules/*.md,.asd/workflows/*.md,.asd/agents/*.md,.asd/templates/t_*.md,tests/**/*.js,*.md,.asd/*.js,.asd/*.json,.asd/skills/*/SKILL.md}` (~77 hits, excludes `.asd/sprints/**` and `.asd/project/**` which the diff pathspec excludes anyway).

**Note on prior-iteration files:** a repo-wide `Grep` will surface `.asd/sprints/*/reviews/impl/iter-*/` content incidentally. `review-policy.md` forbids *reading* those — scope greps with `path` to avoid it, and disregard any snippet that leaks through. Same applies to Glob: iter-NN review filenames appear in mtime order and are useful as *timeline anchors* (they date each iteration) without opening them.
