---
name: none-row-coverage-claims
description: a test-plan `none` row citing "existing suite checks cover it" - grep tests/run.js for the exact token the fix added before accepting the claim
metadata:
  type: feedback
---

When a `Risk → check decisions` row decides `none` because existing suite contracts already cover a fix, grep `tests/run.js` for the exact token the fix added, such as a tool name in a skill's `allowed-tools`. Then ask whether reverting the fix would turn any assert red.

**Why:** a review-fix row claimed the suite covered skill `allowed-tools`. The only assert on that field checked an unrelated tool (`Bash` for timing), and the web-tool asserts read agent `tools`, not skill frontmatter. Reverting the fix would have stayed green.

**How to apply:**
- For each cited "existing check", find the assert line and confirm it reads the same file field and token the fix changed.
- A derived-set pin, built from the workflows that need the capability, can also expose sibling sites the fix missed. Name them in the fix text when they are outside the manifest.
- Related: [[repurposed-fixture-coverage]], [[rereview-no-shell-checks]].
