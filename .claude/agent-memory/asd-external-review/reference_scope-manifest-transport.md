---
name: scope-manifest-transport
description: current scope-manifest fields (phase/iteration/wave/files[]/diff, no exclude_paths) per external-review.md "Phase-scoped payload"; the diff field is a real precomputed diff-file path, read by the wrapped CLI itself, never bytes inline in the manifest; canonical cache-path value and why preflight/failure-recording are the orchestrator's calls, not this agent's; runtime.js external-record-failure CLI syntax; codex quota-error handling
metadata:
  type: reference
---

Entries below are keyed by topic, not by sprint ordinal — fold a new lesson into its heading rather
than appending a dated one. This file loads on every dispatch of this agent.

## Manifest shape and the files[]/diff split

`external-review.md` "Phase-scoped payload" is the SSoT (the agent's own definition, `review-policy.md`
"Scope hand-off", both phase workflows, this rule doc): `node .asd/runtime.js emit-manifest --reviewer
external --iteration <N> [--wave <K>]` writes `external.scope.json` (`t_review-scope.json`: `phase`,
`iteration`, `wave` [impl-review only], `files[]`, `diff`) plus its diff file into the review output
dir. There is no `exclude_paths[]` field — pathspec exclusions are applied by the phase when it builds
`files[]`, never sent to the reviewer as a separate field (`external-review.md` "Phase-scoped payload"
table). `files[]` is the sole normative scope and the only valid finding-location set.

`diff` is the path of a runtime-written, fingerprint-named `.diff` file covering exactly that `files[]`
list — real change content, deletions included — sitting under `.asd/sprints/**`, outside review scope
but readable context; `null` only at design-review iteration 1 (drafts are wholly new, a diff would
just duplicate them). This is NOT the retired "rendered diff inline in the payload" transport: the
manifest carries a path, never diff bytes as a field value, and the wrapped CLI reads both `files[]`
content and the diff file from the repo itself with its own read-only tools — never from manifest
bytes, and it never computes a diff itself. Treat the diff file as context only; a finding location is
always a `files[]` path, never the diff file's own path.

As a secondary note, cheaper is also true: prompt text + manifest JSON stays well under the ~4.5 KB
Bash-tool command-length cliff in [[bash-tool-limits]] — no separate size argument needed, the contract
alone already shapes the transport.

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
