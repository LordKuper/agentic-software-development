---
name: suite-split-and-cost-levers
description: tests/ is split into tests/<area>.test.js + lib.js + a loader run.js; what actually costs time in this suite and which levers worked
metadata:
  type: project
---

`tests/run.js` is a loader (`node tests/run.js [area...] [--filter s]`); helpers sit in `tests/lib.js`, tests in `tests/<area>.test.js` (area = file name). Suite time is spawn cost, not logic: on Windows a node spawn is ~55 ms, `git add`/`git commit` ~100-150 ms each, `git init` ~60 ms, a `.cmd` preflight via powershell ~385 ms; `agent-liveness --interval 1` is a 1 s floor per CLI run.

**Why:** a suite revision found the 10 slowest tests held ~45% of the time.

**How to apply:** levers that worked, in order of yield: (1) overlap independent CLI/hook runs with `runtimeSpawnAsync` / `execFileAsync` + `Promise.all` (lib.js), test body made `async`; (2) `sandboxGitRepoFrom(key, build)` copies a once-built template repo instead of init + base commit per test; (3) shrink a fixture that only needs to cross a threshold (longer paths, fewer files). Full-run wall time varies +/-15% between runs on this machine, so compare per-test ms in one run pair, not totals. Prove a change with a restoring mutation script run through `--filter <substring>`, never the whole suite.
