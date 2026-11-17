---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 036-codex-sol-6-2

## Goal
Bump the Codex `sol` model family to 6.2: `model_families.codex.sol` resolves to `gpt-6.2-sol` instead of `gpt-6.1-sol`, every rendered provider view follows, and the docs state the minimum Codex client that serves it (approach A, `research.md`). Retro intake adds the four open rows of retro 035 and issues #123-#127 (AC-6..AC-14).

## Acceptance
- AC-1: `.asd/release-manifest.json` `model_families.codex.sol` is `gpt-6.2-sol` and the `providers.md` "Model family resolution" table mirrors it; `luna`, effort levels and agent frontmatter are unchanged.
- AC-2: Every generated view rendering the `sol` ID (`.codex/agents/*.toml`, `.claude/agents/asd-external-review.md`) and the expected sync fixture `tests/fixtures/expected/agents/demo-agent.codex.toml` carry `gpt-6.2-sol`; `node .asd/sync.js --check` and `node tests/run.js` are green.
- AC-3: `README.md`'s Codex model-ID paragraph names `gpt-6.2-sol` and "Codex CLI 0.167.0 or later"; the release's `CHANGELOG.md` entry states that minimum and the `model_not_found` refusal an older client gets.
- AC-4: `git grep gpt-6.1-sol` hits only `CHANGELOG.md` history and `.asd/sprints/**`.
- AC-5: A live `codex exec --model gpt-6.2-sol -c model_reasoning_effort="high" --sandbox read-only -` returns a reply, recorded in `test-plan.md`.
- AC-6: `pr` open mode lists in the PR body every impl-review wave whose last External Review verdict was an availability skip (`APPROVE (skipped: …)`), with that wave's files External Review never reviewed. (retro 035#A-1)
- AC-7: `runtime.js timing --open` refuses, appending nothing and warning, an id the ledger already holds, open or closed; a `timing` call given `--attrs` more than once warns. Covered by `tests/run.js`. (retro 035#A-2)
- AC-8: Before COMPLETED, a dev checks every command or subcommand its diff newly invokes against the tech reference and returns `FAILED — tech-reference missing for <command>` for each one without an entry, so the orchestrator writes it before review (`artifact-layout.md` refuse-to-implement rule owns the write). (retro 035#A-3)
- AC-9: The impl-review fix-round latch clear counts any change to a production executable file in a reviewer's scope, comment- and blank-only hunks included; the comment-only exception in `sprint-lifecycle.md` "Fix-round clear" and its lexer code in `runtime.js` are removed, with their tests. (retro 035#P-1)
- AC-10: Before the scope gate, scope checks every `documents.*` entry that would freeze `false` against the requirements the drafted scope states; a scope needing a disabled document is shown at the gate with the choice of a `Settings change:` line enabling it or a narrowed scope, never frozen silently. (issue #123)
- AC-11: The plan phase runs the `commands.yaml` build once before plan acceptance and stops with `FAILED` naming the missing toolchain (the failing command and its first error lines) when it fails, before any impl dispatch. (issue #124)
- AC-12: `runtime.js commit-check` reads the full commit message and rejects one whose `ASD-Task` line is not in its last paragraph (git's trailer block, together with any `Co-Authored-By`); the one-command commit form in `git-strategy.md` "Commit before review" passes the message to it. Covered by `tests/run.js`. (issue #125)
- AC-13: Before plan acceptance, the plan maps every user decision recorded in the sprint's decisions log, and every decision in an accepted ux-spec when one exists, to an `AC-N`/Task or an explicit `Out of scope` line. (issue #126)
- AC-14: `runtime.js agent-liveness` reports a dispatch whose return file exists and passes `validate-ledger` as finished, never `STALL`. Covered by `tests/run.js`. (issue #127)

## Out of scope (optional)
- A Codex client-version check in External Review readiness or anywhere at runtime (approach B, not chosen).
- A migration script: consumers receive the new ID through `/asd-update`.
