---
name: canned-gh-and-fake-clock-preload
description: how to run a runtime CLI that shells out to gh and sleeps, without a real gh or a real wait, and how to keep an includes-pin on a rule section from passing vacuously
metadata:
  type: feedback
---

To test a `.asd/runtime.js` subcommand that spawns `gh` and polls with `timers/promises` `setTimeout`, run it in a child with `node --require <stub.js>`: the stub replaces `child_process.spawnSync` with a queue of canned `{status, stdout, stderr}` / `{error: {message}}` answers (last one repeats), logs each argv to a file named by an env var, and also sets `Date.now = () => clock` and `timers.setTimeout = async (ms) => { clock += ms; }`. The runtime destructures both at load, so the stub must be preloaded; exit codes, stdout and the logged argv are then assertable, and a 60 s grace or 30 min limit costs nothing. A pure loop with injected read/sleep/now is tested in-process the same way.

**Why:** a first draft that only covered pass and fail left the `none` and `timeout` exit codes unproven, because those paths would really sleep; a mutation flipping the `none` exit code went uncaught until the fake clock made those cases cheap.

**How to apply:** for each exit-code branch of such a CLI add a case, then mutate that branch and confirm the test fails. For a content pin that a rule section "includes" some token, check the section does not hold the token twice (two path forms, two sentences): mutate one occurrence and rerun; if it stays green, assert over every occurrence instead of `includes`.
