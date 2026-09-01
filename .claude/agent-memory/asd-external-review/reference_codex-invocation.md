---
name: codex-invocation-mechanics
description: How codex-cli behaves when wrapped via stdin heredoc — payload echo + session log on stderr (piping stdout through tail does NOT shrink captured output), verdict at tail of persisted tool-results file; no-disk heredoc+git-diff pipe pattern; self-hosting pathspec row
metadata:
  type: reference
---

Wrapped Codex CLI (codex-cli 0.150.x) via `codex exec --sandbox read-only -`:

- The captured output ECHOES the entire prompt+diff payload first (banner, `user` block, session log), then a `codex` marker line with the final message, then `tokens used`, then the final message REPEATED. Parse the tail (last occurrence), not the head.
- Appending `| tail -c 6000` to the codex command does NOT shrink what the Bash tool captures — the echo/session log goes to stderr, which the tool merges into the result regardless. A ~100 KB payload → ~equal-size persisted tool-results file; just `tail -c 5000` that file in a second call to reach the verdict. Verified twice (2026-09-01).
- Session log may contain scary-looking ERROR lines about codex's own plugin/skill loading (e.g. pwsh CreateProcess 1920 inside its sandbox trying to read a `~/.codex/plugins` skill) — these are non-fatal noise; the review still completes and the final message is still emitted after them.
- No-disk invocation that satisfies the "never write prompt/diff to disk" rule, including scratchpad: `{ cat <<'PROMPT_EOF' ... PROMPT_EOF; git diff <sha>...HEAD <pathspec>; } | codex exec --sandbox read-only -` — one Bash call, prompt heredoc + live git diff concatenated on stdin. Do NOT pre-write the diff to scratchpad even for size-checking; use `git diff --stat`/`wc -c` on a pipe instead (I slipped once and had to delete the file).
- `--sandbox read-only` accepted and honored (banner confirms `sandbox: read-only`); model resolved to gpt-5.6-sol, high reasoning; ~54-65k tokens for a 97-156 KB delta payload, well under the 600 s timeout.
- Codex line-number citations can be off by a few lines — always verify the cited location with Grep/Read before keeping a finding, and cite the verified line.
- This repo is self-hosting: impl-review pathspec is the `self_hosting: enabled` row of `external-review.md` § Phase-scoped payload (excludes `.asd/project/**`, `.asd/sprints/**`, generated views) — NOT the consumer `':(exclude).asd/**'` row.
- Iteration 2+ diff base: `state.json.reviews.impl.iteration_heads["iter-(N-1)"]` (rule changed sprint 002 iter 3; was "last commit only"). Prior finding set arrives inline in dispatch payload — never read prior `iter-*/` files even if the dispatcher's message suggests it.
