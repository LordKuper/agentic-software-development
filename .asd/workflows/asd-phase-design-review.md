# ASD Workflow: Design Review

Owner: inline orchestrator; dispatches reviewers (combined, External Review), a memory-fix owner and `asd-advisor` for an escalation consult (`agent-protocol.md` "Relay"); applies fixes to the drafts itself.

## Entry

```json
{"requires": ["active sprint at .asd/sprints/<NNN-slug>/", "whichever of prd.html/ux-spec.html/adr.html the frozen documents.* enabled are present in <sprint>/design/ (checkpoints.md precondition chain)", "state.json phase advanced from design"], "ops": ["context: agent-protocol.md 'Orchestrator phase entry'; agent bundles per 'Dispatch payload'", "append friction: F-N to <sprint>/friction-log.md per sprint-lifecycle.md 'Friction log'", "timing: a review-iteration op from step 4's increment to step 9's resolution (loop or exit); a dispatch op around each ## Dispatch delegation, External Review's of kind external-review (sprint-lifecycle.md 'Operation timing')"]}
```

## Inputs

```json
[".asd/project/config.yaml (review.external_review, review.codex_profile, system.tools, review.iterations_low/medium/high/critical, self_hosting, language.chat, language.docs; mockup settings for legacy state only)", "state.json frozen documents.*, mockup_format and reviews.design", "in-scope drafts in <sprint>/design/, including standalone mockups (step 1)", "previous iteration's review files and snapshot (iter 2+)"]
```

## Steps

1. Read frozen documents and the effective mockup format (`sprint-lifecycle.md` "Mockup format", including its legacy fallback). For `figma`, read the applicable `providers.md` "Conditional grants", reconcile verified entries in `design/mockups/index.md` and pause while required recovery is pending. List existing drafts for enabled documents. When the effective format is other than `none`, include every file under `<sprint>/design/mockups/` at any depth, including mockup-only scope.
2. **No-op path** — a design-block collapse (`sprint-lifecycle.md` "Design/design-review/design-promote collapse") never reaches this phase; this defensive fallback covers an empty intersected scope on a direct re-dispatch: write inline (mechanical, no gate, `sprint-lifecycle.md` "No-op phase rule"): set `phase=design-review`, append `"design-review"` to `state.json.skipped_phases`, append decisions-log "design-review skipped (no in-scope drafts)"; emit phase COMPLETED; skip remaining steps.
3. Read `.asd/project/config.yaml`; `self_hosting: enabled` adds `--self-hosting` to step 7's `emit-manifest`.
3a. When `review.external_review=enabled`, run `node .asd/runtime.js external-preflight --input <path>` before External Review dispatch or diff assembly. Supply the host, profile, command overrides and cache path per `external-review.md` "Detection and negative cache". Pass the ready result to the wrapper unchanged. On non-ready — only then — record the transparent availability skip (`external-review.md` "Outcome contract"), still computing step 7's scope-manifest `files[]` for its `Unreviewed files`; after a real authentication/quota/reachability/command failure call `external-record-failure` with the returned fingerprint, the same cache path, and bounded retry data.
4. **Inline** — Refresh the in-scope draft list using step 1's procedure. Once recovery and enumeration are complete, set phase and increment the review iteration.
5. Compute severity floor for current iteration per `review-policy.md` cumulative-budget algorithm (uses `reviews.design.iteration`).
6. Create folder `<sprint>/reviews/design/iter-NN/` if absent.
7. **Parallel dispatch** per `review-policy.md` "Clean-context review iteration":
   - **Draft list** — the sole home of the design-review iteration snapshot: use the refreshed draft list from step 4. Run `node .asd/runtime.js draft-snapshot --files <current in-scope draft paths, one per line> --out <sprint>/reviews/design/iter-NN/`, adding `--previous <sprint>/reviews/design/iter-(NN-1)/` on iter 2+, and write its stdout to a scratch file. It copies each draft under `<sprint>/reviews/design/iter-NN/snapshot/`, and prints every draft on iter 1, and on iter 2+ only the drafts whose content differs from their previous copy (a missing copy counts as changed). Run it every iteration, latch-skipped reviewers or not.
   - **Emit manifests** — for each internal reviewer not latch-skipped (filter below), run `node .asd/runtime.js emit-manifest --reviewer <name> --phase design-review --files <the draft list above> --out <sprint>/reviews/design/iter-NN/ --custom-rules .asd/project/custom-common-rules.md,.asd/project/custom-design-rules.md`, adding `--snapshot <sprint>/reviews/design/iter-(NN-1)/` on iter 2+. It builds that reviewer's own file list (`review-policy.md` "Reviewer responsibility") and writes `<reviewer>.manifest.json`, plus on iter 2+ its list's `<fingerprint>.diff` against the previous iteration's snapshot copies (none at iter 1, `review-policy.md` "Scope hand-off").
   - **APPROVE latch filter first** (`sprint-lifecycle.md` "APPROVE latch" — sole SSoT for the mechanism): read `state.json.reviews.design.latched`; a reviewer key present there is skipped entirely this iteration — no fresh agent call, no new review file, no ledger gate at step 8 for it. The one internal reviewer, `asd-reviewer-combined`, is dispatched when not latch-skipped, for any non-empty draft set, and counted toward DoD.
   - if `review.external_review=enabled` AND not latch-skipped → set External Review's list inputs to `--files <the draft list above>` and, when carried over, `--full-files <the previous iteration's Unreviewed files>`. Step 3a ready → run `emit-manifest --reviewer external --phase design-review --iteration <N> --out <sprint>/reviews/design/iter-NN/` with those list inputs and the same `--snapshot` on iter 2+. Dispatch with its `external.scope.json` and, on iter 2+, its `<fingerprint>.diff`. Step 3a non-ready → use the same list inputs with `--scope-only` for the skip (`external-review.md` "Phase-scoped payload").
   - payloads per `## Dispatch` and `agent-protocol.md` "Dispatch payload" and `review-policy.md` "Clean-context review iteration"; a step-8a re-dispatch's `interrupted` record comes from `decisions-log.md`
   - Before dispatch and at step 8 persistence, follow `review-policy.md` "Reviewer memory before persistence", including its fix route before other validation failure handling. The commit carrying the review also carries any agent memory that reviewer authored (`git-strategy.md` "Commit before review").
8. Wait all REVIEW_DONE; run `node .asd/runtime.js persist-review --phase design --reviewer <key> --in <return file> --out-dir <sprint>/reviews/design/iter-NN/` per `review-policy.md` "Review persistence". External Review, including late returns, adds that iteration's `--floor`. No token or External Review failure → step 8a. Internal ledger failure → one transcription per `review-policy.md` "Coverage enforcement"; log friction if repaired, else reject and re-dispatch. Never re-stamp a dispatched manifest; correct by emitting a fresh one and re-dispatching.
8a. **Interrupted dispatch** — `review-policy.md` "Interrupted dispatch" owns logs, retries, correlated interruptions and escalation. Use `iter-NN` as the iteration ID.
   - No usable return, External Review included → fresh retry, no transcription. On second consecutive interruption of the same manifest, consult then ask retry fresh or abort; never split scope.
   - Any replaced dispatch, External Review included: admit only under `review-policy.md` "Late duplicate return". After step 9 records the replacement, save admitted evidence with step 8's `--late`, link from its original report and apply the rule's verdict/latch/log updates.
9. Parse first-line tokens from all written reviewer files; record `state.json` `reviews.design.verdicts["iter-NN"]` (keyed `combined`/`external`) and `reviews.design.latched` in one `node .asd/runtime.js record-verdicts --state <sprint>/state.json --phase design --iteration <N> --verdict "<key>=<value>[;<key>=<value>…]"` call, `<N>` the plain integer of `iter-NN`. Apply `sprint-lifecycle.md` "APPROVE latch" and "Review verdict recovery". Interrupted attempts contribute no entry (step 8a). For an availability skip, persist `external.md` through step 8 with `"APPROVE (skipped: <reason>)"` and step 7's scope-only `files[]` as `Unreviewed files`. Apply `design-system.md` "Figma publication and recovery" to any inline Figma fix below.
   - **Reviewer questions first** [GATE hard: reviewer question] — a report carrying `question:` items under `## Escalations` (`review-policy.md` "Gate Verdict Format" question carrier) is verdict-bearing, never interrupted (step 8a): escalation consult, then request user decision per item, append the answers to decisions-log, and write each under its item in that reviewer's file per that carrier, applying it with that reviewer's findings in the fixes below (such a report is at least CONCERNS, per that carrier)
   - **Memory findings** — each finding located in `.claude/agent-memory/<owner>/`, plus each `memory-check` hit of step 8's commit, goes to its owner's memory-fix dispatch per `review-policy.md` "Memory-fix dispatch", its `resolved: <ids> — memory-fix, <YYYY-MM-DD>` lines included — never an inline fix or an extra iteration
   - **All required verdicts satisfied** → DoD met; apply the adaptive gate policy [GATE adaptive: design-review green handoff] and append the decision inline; emit phase COMPLETED
   - **Any FAIL** → escalation [GATE hard: FAIL escalation]:
     - parse FAIL findings; group by escalation cause (concept / requirement / contract change; new abstraction; scope expansion; complexity increase); a FAIL finding fitting no cause is CONCERNS (`review-policy.md` "Verdict format")
     - escalation consult, then request user decision in `language.chat`: present each FAIL using Complication Approval format from `core.md`; collect decisions
     - External Review's stalemate FAIL (`Stalemate:` block, `external-review.md` "Stalemate detection") → escalation consult, then request user decision; options and routing per that section, instead of the accept/override bullets below
     - on override → record that finding resolved (`sprint-lifecycle.md` "User-resolved findings"), continue
     - on accept → apply exactly the approved changes to the drafts inline; loop step 4 (increment iteration)
   - **Only CONCERNS** (no FAIL) → autofix loop; the route of an ambiguous finding is the orchestrator's, `asd-advisor` consulted (`review-policy.md` "Verdict format"):
     - fix every finding in the drafts inline per `review-policy.md` "Autofix vs escalation"
     - loop step 4
10. Iteration cap reached (no severity tier has remaining budget for next iter) [GATE hard: review-cap override]:
   - escalation consult, then request user decision: override cap and continue / accept current findings / abort sprint
   - on override → loop step 4 (`reviews.design.iteration` keeps incrementing — not reset; severity floor pinned at `critical`)
   - on accept → record every open finding resolved (`cap-accept`, same home); COMPLETED note "iteration cap reached, user accepted"
   - on abort → emit ABORT
11. Any reviewer or memory-fix owner FAILED / ABORT → escalation consult, relay, halt.

## Rules

- Reviewer: return findings + complete coverage ledger (file, rule, and section) + verdict as final text per `t_review.md` (External Review: `external-review/t_review-report.md`), first-line verdict token `[REVIEW-design-<reviewer>]: ...`; an internal reviewer also writes it verbatim to its return file `.asd/tmp/<NNN-slug>-design-iter-NN-<reviewer>.return.md` (`review-policy.md` "Review persistence"). A reviewer never writes `<reviewer>.md` itself.
- Reviewer: cover every id in the manifest, `n/a` authorizations included; impl-only rubric sections never fire against drafts — the manifest's `n_a` carries that phase gate.
- `asd-reviewer-combined` judges every draft. Its UI conformance entry is `n/a: outside phase gate` only when no UX-spec, design-system or standalone mockup draft is in scope.
- A reviewer never returns a bare `QUESTION`: its question rides the verdict `question:` carrier (`review-policy.md` "Gate Verdict Format").

## Dispatch

```json
[{"agent": "asd-reviewer-combined", "when": "step 7", "payload": ["turn_budget", "inputs.context", "inputs", "manifest", "diff (iter 2+, else null)", "iteration", "floor", "findings_header", "interrupted (step 8a re-dispatch, else null)", "out_dir (<sprint>/reviews/design/iter-NN/)", "return_file", "language"], "signals": ["REVIEW_DONE", "FAILED", "ABORT"]}, {"agent": "asd-external-review", "when": "step 7", "payload": ["turn_budget", "inputs.context", "manifest (external.scope.json)", "diff (iter 2+, else null)", "iteration", "out_dir", "floor", "preflight (step 3a result, route and platform included)", "findings (stalemate set, iter 2+, external-review.md 'Stalemate detection')", "language"], "signals": ["REVIEW_DONE"]}, {"agent": "asd-advisor", "when": "escalation consult before a user escalation; routing consult on an ambiguous CONCERNS route (agent-protocol.md 'Relay')", "payload": ["turn_budget", "inputs.context", "question, options, context paths"], "signals": []}, {"agent": "<owner> of .claude/agent-memory/<owner>/", "when": "step 9 memory finding or memory-check hit (Claude only)", "payload": ["mode", "task", "work", "inputs.context", "write_scope"], "signals": ["COMPLETED", "FAILED"]}]
```

## Exit

```json
{"writes": ["<sprint>/reviews/design/iter-NN/: <reviewer>.md and <reviewer>.findings.json (step 8), snapshot/, <reviewer>.manifest.json, external.scope.json, <fingerprint>.diff (step 7)", "<sprint>/reviews/design/iter-NN/<reviewer>.late.md (step 8a)", "<sprint>/design/ drafts (steps 1 and 4 Figma index recovery, step 9 fixes)", "resolved: lines in reviewer files and memory-fix commits by the owner or orchestrator (step 9)", "state.json phase, reviews.design (verdicts and latched through record-verdicts, steps 8a, 9)", "decisions-log.md"], "next": [{"if": "DoD met or cap accepted", "next": "design-promote"}]}
```

## Return

```
PHASE: design-review | SPRINT: <NNN-slug> | ITER: <N> | STATUS: <complete|blocked|aborted> | NEXT: design-promote
```

## References

- `.asd/rules/sprint-lifecycle.md`
- `.asd/rules/review-policy.md`
- `.asd/rules/design-principles.md`
- `.asd/rules/checkpoints.md`
- `.asd/rules/language-policy.md`
- Templates: `t_review.md`, `external-review/t_review-report.md`
