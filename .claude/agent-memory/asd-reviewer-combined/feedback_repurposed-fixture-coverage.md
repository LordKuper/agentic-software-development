---
name: repurposed-fixture-coverage
description: when a fix changes a fixture case's expectation or drops one, list what that case alone exercised (a path, a directory read) and check another case still reaches it
metadata:
  type: feedback
---

When a review-fix changes a test fixture so that a case's expected output disappears or changes, ask what that case alone proved before the change. Typical examples are a per-wave directory read, a resolved-finding lookup, or one branch of a mapper.

**Why:** a fixture case was changed to cover a new guard. The new guard now returns before the helper that case used to drive, so that helper's path lost its only coverage. The assert message still claimed the old behaviour, and the fixture still wrote a file that nothing read. The suite stayed green.

**How to apply:** for each removed or changed `expected` line, trace the old case through the code under test. Check that some remaining case still reaches every call it used to reach. A fixture write that no code path reads anymore is the tell.
