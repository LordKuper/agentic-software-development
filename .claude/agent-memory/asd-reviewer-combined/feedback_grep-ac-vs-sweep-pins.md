---
name: grep-ac-vs-sweep-pins
description: An AC or DoD of the form "git grep <old literal> hits only X" is broken by the sprint's own leftover-sweep test pinning that literal; also check where a live-probe record lives
metadata:
  type: feedback
---

When an acceptance criterion or plan DoD says `git grep <removed literal>` may hit only some paths (CHANGELOG, sprint folders), run that grep over the repo minus the allowed paths. A leftover-term sweep test in `tests/run.js` that lists the removed literal in its `removed` array or its title is itself a hit, and it fails the AC as written.

**Why:** the sweep's exclusion list (history, tests) is not the AC's exclusion list, so a green suite says nothing about the literal grep.

**How to apply:** Grep the literal over the whole repo with `!.asd/sprints/**` and compare it with the AC's allowed paths. Suggested fix: build the literal from parts in the test. Related: a live-probe AC "recorded in test-plan.md" that is parked in `Suite run` is lost when impl-review's terminal runner overwrites that section; its home is a `Manual verification` row. See [[reuse-scope-labels]].
