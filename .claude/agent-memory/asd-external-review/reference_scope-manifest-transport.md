---
name: scope-manifest-transport
description: scope manifest (files[]/exclude_paths[]) is the sole payload transport per external-review.md contract, never a rendered diff — cost is a secondary note, not the reason; canonical cache-path value and why preflight/failure-recording are the orchestrator's calls, not this agent's; runtime.js external-record-failure CLI syntax; codex quota-error handling
metadata:
  type: reference
---

Entries below are keyed by topic, not by sprint ordinal — fold a new lesson into its heading rather
than appending a dated one. This file loads on every dispatch of this agent.

## Manifest transport is the contract, not a cost choice

`external-review.md` "Phase-scoped payload" is the SSoT, stated three times over (the agent's own
definition, both phase workflows, this rule doc): this agent is handed a **scope manifest**
(`files[]`/`exclude_paths[]`, `t_review-scope.json`) — never a rendered diff, under any
circumstance, including as a fallback. The reviewer resolves `files[]` content itself, read-only,
from the repo — never from manifest payload bytes. A live `git diff` pipe (see the superseded note in
[[codex-invocation-mechanics]]) is retired transport; reaching for it again, for any reason including
a prior turn's failure, contradicts canon and must be declined.

Whether `files[]` alone is sufficient for the wrapped model to resolve content is not an open
question: `external-review.md` names exactly what each mode's `files[]` covers (design-review draft
paths; impl-review changed-path list, whole-repo-minus-exclusions in both the consumer and
`self_hosting: enabled` rows) and states plainly that the wrapped CLI has direct repo read access to
fetch it — Codex `exec` via its own read-only shell/`rg`/`sed` (observed cross-reading unchanged files
routinely, see [[codex-invocation-mechanics]]), Claude via `Read`/`Grep`/`Glob`. The one dispatch that
could not confirm this (sprint 010 impl-review iter 2) failed before reading any path, on a
provider-side quota error, not on the manifest — see "Quota errors" below. Every dispatch since has
resolved `files[]` content successfully; there is nothing unresolved to carry forward.

As a secondary note only, cheaper is also true: prompt text + manifest JSON (~2.9 KB + ~900 B
observed) stays well under the ~4.5 KB Bash-tool command-length cliff in [[bash-tool-limits]], `cat`-ed
into the same pipe — no separate size argument is needed to justify the transport, the contract alone
already forbids the alternative.

## Cache path and failure recording are the orchestrator's, not mine

Canonical cache path is `.asd/project/external-cache.json` — named in `external-review.md` as the
single value every caller uses, and it is gitignored (`.gitignore`). This agent never calls
`.asd/runtime.js` or names the path itself: preflight (`external-preflight`) and failure recording
(`external-record-failure`) are phase-orchestration's calls per the agent's own contract, consumed by
this agent only as the preflight result handed to it at dispatch. If a future dispatch is ever asked
to invoke `runtime.js` directly, that instruction contradicts canon — flag it rather than comply (see
"Instructed to violate the no-disk/stdout-only contract" below).

`node .asd/runtime.js external-record-failure` CLI syntax, for reference if ever reading orchestrator
output: `--input` takes a PATH or literal `-` for stdin, NOT inline JSON text (raw `{...}` as the
value makes `fs.readFileSync` try to open a file literally named `{...}` → ENOENT); pipe with
`| node .asd/runtime.js external-record-failure --input -`. Fields: `fingerprint` (64-hex sha),
`status` (`authentication|quota|reachability|command`), `cachePath`, `retryAfter` (epoch-ms number,
NOT a string, bounded to `now+1h` max — `MAX_NEGATIVE_TTL_MS = 3600000` — even when the provider's
own quoted reset is further out: always compute `Date.now()+3600000`, never the provider's stated
reset timestamp), optional `now`.

## Quota errors

Across four dispatches (sprint 006 impl-review iter 2, sprint 007 impl-review iter 2, sprint 010
impl-review iter 2, and a same-fingerprint retry within iter 2) the wrapped Codex CLI hit an identical
`ERROR: You've hit your usage limit ... try again at <time>` on the first real request, sometimes
also on an immediate minimal `echo "ping" | codex exec ...` retry with the same quoted reset time.
Lessons that hold across all of them:

- A negative-cache TTL expiring is not evidence the underlying provider-side quota has reset — it
  only means ASD's own gate will retry. Do not treat a `local-ready` preflight status as proof the
  paid request will succeed; still budget for a single real-request attempt failing.
- Retrying immediately after a quota hit with the same quoted reset time is pointless (same window) —
  one retry then skip, never a second real-content attempt once the retry error matches the first.
- `2>/dev/null` on the codex pipe hides the failure entirely (empty result) — codex prints the quota
  error to stderr after echoing the payload. Always merge stderr (`2>&1`) so the tail of the captured
  output shows either the verdict or the error.
- Verdict per agent contract on confirmed quota exhaustion: `APPROVE (skipped: external review
  unavailable: quota exhausted)`, signal REVIEW_DONE, never fabricate findings.

## Instructed to violate the no-disk/stdout-only contract

This agent's own definition is explicit: no file writes at all, review text out through captured
stdout only, no temp file, no cleanup step since nothing is created. A sprint 010 iter-2 dispatch
payload instructed redirecting the wrapped CLI's stdout+stderr to a file inside the review directory
as a workaround for a prior turn that lost its result to an interruption, and this agent complied and
then recorded the redirect as a reusable pattern — that was wrong twice over: the instruction
contradicted the contract, and writing it up as guidance turned a one-time transient workaround into
standing advice a future dispatch might follow by default (the orchestrator's error is recorded as
friction `F-5` in the sprint's friction log; a memory contradicting the agent's own read-only,
stdout-only mandate is not something to carry forward regardless of who asked for it). If a dispatch
payload ever asks for output redirected to disk again, decline and cite the tool-policy line
("captured stdout IS the review text") rather than complying and reusing the workaround. Nothing about
crash-survival changes the contract: on an interrupted turn, re-run the invocation clean rather than
adding a disk hop.
