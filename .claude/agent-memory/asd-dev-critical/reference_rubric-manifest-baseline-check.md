---
name: rubric-manifest-baseline-check
description: How to prove a reviewer-agent edit leaves runtime.js emit-manifest ids/n_a unchanged, without moving HEAD or adding a worktree
metadata:
  type: reference
---

`.asd/runtime.js` reads reviewer rubrics via `path.join(__dirname, 'agents', ...)` and templates/workflows beside it. So a baseline manifest needs no worktree: copy `runtime.js`, `workflows/`, `templates/` into `<scratch>/base/.asd/`, put `git show HEAD:.asd/agents/asd-reviewer-<r>.md` into `<scratch>/base/.asd/agents/`, run `emit-manifest --reviewer <r> --phase <p> --files <list> --out <dir> --self-hosting` with both copies, and compare `rules`/`sections`/`n_a`. Skip design-review for `combined` and `testing` (never dispatched there).

**Why:** rubric `###`/bold-label text IS the manifest id; a byte check of `## Review rubric` alone misses the combined reviewer's composition.
**How to apply:** any edit near a reviewer `## Review rubric` (see [[tests-pin-literal-prose]]).
