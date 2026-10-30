---
name: double-fix-caller-and-callee
description: A review-fix that both excludes a case at the caller's rule and guards it in the callee CLI: the callee guard is often unreachable by contract and turns a loud failure into a silent no-op
metadata:
  type: feedback
---

When a fix for "command X breaks in case C" both adds a caller-side exclusion ("None for C") and a callee-side guard returning success for C, check whether any contract path still reaches C after the exclusion.

**Why:** if no path reaches C, the guard is the over-engineering item "Defensive code for impossible-by-contract case". It also tends to swallow misuse: a guard keyed on a missing file (e.g. `existsSync(state.json)` returning `{changed: false}`) makes a wrong path argument exit 0 silently where it used to fail with ENOENT.

**How to apply:** trace who calls the CLI (grep the command name across canon) and what precondition defines the case (e.g. sprint detection keyed on `state.json`). Keep the caller rule as the one contract, and recommend deleting the guard or making it `fail()` loudly. Also flag the test asserts pinning the unreachable case. Related: [[none-row-coverage-claims]].
