---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

## Overview
Ten Tasks in three waves deliver AC-1..AC-15. Decisions every Task applies:
- **D1 project repo** (AC-1, AC-5): `gh repo view --json nameWithOwner -q .nameWithOwner` in the repo root names the project repo; a missing or unauthenticated `gh`, or a failing `gh repo view` (no GitHub `origin`), skips project-issue triage with one decisions-log line. List: `gh issue list -R <project> -s open -L 200 --json number,title,body,labels,url,createdAt`; 200 returned is named at the gate, the rest wait. Under `self_hosting` an issue whose body's first line is the `<!-- asd-retro-finding v1 -->` marker stays in the existing rules 1-4 triage, never in this list.
- **D2 triage authorisation** (AC-6): after step 2a computes every triage write (label ensures, rewrites, closes, label adds) and before the first, one request user decision lists them all. Approve → run them; decline → no write, and each issue it would have closed goes to the user at the gate with that evidence as the recommendation. No planned write → no request. Write point and re-entry evidence: one decisions-log line `issue triage authorised: <writes>` or `issue triage declined`, read on re-entry so the request is never repeated. Not a gate-inventory gate.
- **D3 consumer issue close** (AC-4): pr open mode lists each `(issue #N)` as `Closes #N` in a consumer project, `Refs #N` under `self_hosting` (unchanged). Consumer merge mode, after the merge is confirmed: each included issue still open (base branch not the default) is closed `gh issue close <n> -R <project> -r completed -c "<PR url>"`, comment in `language.docs`; a failed close is named in the merge report, not retried.
- **D4 language** (AC-3): new `language-policy.md` Matrix row "Issue comments ASD writes on a consumer project's own repository → `language.docs`"; the ASD-repo row stays English.
- **D5 dispatch attrs** (AC-9): on `timing --open --kind dispatch`, a missing `tier`/`model` comes from `<ledger dir>/state.json` `task_routing[<id>]` (`tier`, `resolved_model`), else from `.asd/agents/<base agent>.md` via `sync.js` `parseCanonicalFrontmatter`: tier = the `agent` attr's variant suffix (`VARIANT_SUFFIXES`) or `standard`; model = the variant's, else the agent's, host model — host `claude` when env `CLAUDECODE` is `1`, else `codex`. No `agent` attr and no routed id, or any attr still unresolved: warn. Never fails (exit 0).
- **D6 never-opened close** (AC-13): `timing --close` of an id with no open op and no earlier close appends nothing and warns `close of <id> matches no open op`.
- **D7 Suite run Scope** (AC-10): `full` when the run executed the whole suite (unscoped command, safety valve, or a selection covering every test file); else `impacted`.
- **D8 review-fix tester run** (AC-11): the review-fix tester runs the check a finding requires (impacted set or the named test) and writes `Suite run` (Command, Scope, Result, HEAD); impl-test step 8's existing reuse counts it when no code, test or stub path changed after its HEAD.
- **D9 findings header** (AC-12): reviewer role key `findings_header` = the literal findings header row of `t_review.md`, in every internal reviewer (`quality`, `efficiency`, `combined`) payload; External Review unchanged.
- **D10 `record-verdicts`** (AC-14): `node .asd/runtime.js record-verdicts --state <sprint>/state.json --phase design|impl --iteration <N> --verdict "<key>=<value>[;<key>=<value>…]"` merges the values into `reviews.design.verdicts["iter-NN"]` or the current impl wave node's (`reviews.impl.waves[reviews.impl.wave - 1]`), sets `latched[<key>] = N` for a bare `APPROVE`, deletes `latched[<key>]` for any other value (a late admission's clear), never latches `APPROVE (skipped: …)`; bad input exits non-zero writing nothing. Iteration increment, `iteration_heads`, red-suite and amendment latch clears stay inline.
- **D11 External prompt file** (AC-8): Claude Code host only — the wrapper writes the rendered prompt with the file-write operation to `<scratch-dir>/<NNN-slug>-external-<phase>-<iteration id, "/" as "-">.prompt.md`, runs `<resolved-command> <wraps_invoke_args> < <file>`, and deletes the file after the run, pass or fail. Codex rows unchanged.

New rule homes cited across Tasks: `asd-phase-scope.md` step 2a "Project-issue triage" (Task 1); `asd-phase-pr.md` open mode step 2 and merge mode (Task 2); `language-policy.md` "Matrix" and `artifact-layout.md` "Test plan" (Task 3); `sprint-lifecycle.md` "Operation timing", "Impacted test set", "APPROVE latch" (Task 4); `external-review.md` "OS-specific invocation" (Task 7); `agent-protocol.md` "Dispatch payload" (Task 9).

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.

### Task 1: Scope project-issue triage, authorisation and deliverability check
Material risk: change: workflow gate
- [ ] `asd-phase-scope.md` step 2a: add "Project-issue triage" per D1 (every project, not self-hosting only), each listed issue to the user at the step 4 gate with number, title, link and a short summary as data, no auto-close, `deferred`-labelled included (AC-1, AC-2, AC-5); ensure `deferred` and `wontfix` on the project repo before disposition writes
- [ ] Step 2a: the D2 authorisation request before the first triage write, covering the `[asd-retro]` and project lists, with its decisions-log write point and re-entry read (AC-6)
- [ ] Step 2: before the scope gate, check each `AC-N` drafted from a retro row or issue against the change surface it may touch and the phase that applies it; an undeliverable one is redrafted or shown at the gate (AC-7)
- [ ] Step 4: project-issue dispositions as for `[asd-retro]` issues, `-R <project>`; reject comment in `language.docs` in a consumer project, English on the ASD repo (AC-3); Inputs, Exit and the decisions-log triage line name project issues
- [ ] `.asd/skills/asd-phase-scope/SKILL.md` description: issue triage of the project's own open issues in every project

### Task 2: PR closes a consumer project's included issues
Material risk: change: public contract
Reachability: scope writes `(issue #N)` into `sprint.md` `AC-N` text at step 4; pr reads it at open mode step 2 (PR body) and merge mode (close); `sprint.md` is committed on the sprint branch before the PR opens; interrupted at the push, `git.base_branch` holds no `(issue #N)` of this sprint and nothing is closed
- [ ] `asd-phase-pr.md` open mode step 2: `Closes #N` in a consumer project, `Refs #N` under `self_hosting` (D3)
- [ ] `asd-phase-pr.md` merge mode: consumer close of each still-open included issue after the confirmed merge, failure named in the report (D3); Exit writes
- [ ] `t_pr-description.md` "Related issues": both forms with their condition

### Task 3: Issue and test-plan rule mirrors
Material risk: artifact: mirror prose
- [ ] `language-policy.md` "Matrix": D4 row (AC-3)
- [ ] `checkpoints.md` "Gate inventory": retro intake dispositions row covers project issues; the gate-free closes line names the D2 authorisation request and the D3 consumer merge-mode close (AC-1..AC-4, AC-6)
- [ ] `artifact-layout.md` "Retro backlog": issue dispositions (any issue) live on GitHub; "Test plan": the review-fix tester may also write `Suite run` for a check a finding requires (D8, AC-11)
- [ ] `docs/architecture/tech-reference/gh-2.90.md`: add `gh repo view --json nameWithOwner`; the `-R` convention names the project repo for project issues and the manifest repo for ASD-repo issues (AC-15)

### Task 4: sprint-lifecycle.md rule edits
Material risk: artifact: mirror prose
- [ ] Phase table scope row: project issues triaged in every project (AC-1)
- [ ] "Operation timing": the runtime fills a dispatch op's missing `tier`/`model` per D5; a close of a never-opened id writes nothing (D6) (AC-9, AC-13)
- [ ] "Impacted test set": Scope `full` per D7; a review-fix tester's recorded run counts for reuse (D8) (AC-10, AC-11)
- [ ] "APPROVE latch": verdicts and latch entries are written through `record-verdicts` (D10) (AC-14)

### Task 5: Timing dispatch attrs and never-opened close
Material risk: change: host detection and ledger close edge
- [ ] `runtime.js` `timingAppend`/`timingRequest`: D5 fill for `--kind dispatch` opens, reading `state.json` beside the ledger and the agent frontmatter through `sync.js` exports (AC-9)
- [ ] `runtime.js` `timingCloses`: D6, update its doc comment (AC-13)

### Task 6: Suite run Scope and review-fix tester run
Material risk: change: public contract
- [ ] `t_test-plan.md` "Suite run": Scope `full` per D7; who writes it includes the review-fix tester (D8) (AC-10, AC-11)
- [ ] `asd-tester.md`: the runner and base tester record Scope per D7; review-fix mode runs and records the check a finding requires (D8)
- [ ] `asd-phase-impl.md` step 5: the test-file findings chain's tester runs and records that check (D8)

### Task 7: External Review prompt from a scratch file under Claude Code
Material risk: change: invocation form
- [ ] `external-review.md` "OS-specific invocation": D11 row for Claude Code, Codex rows unchanged; the "never written to disk" sentence narrowed to the D11 file (AC-8)
- [ ] `asd-external-review.md` `## Tools` run/deny and `## Invocation`: D11 form, write grant limited to that file

### Task 8: record-verdicts runtime command
Material risk: change: state.json writer
- [ ] `runtime.js`: `record-verdicts` per D10, usage string, CLI dispatch (AC-14)

### Task 9: Review workflows use record-verdicts; reviewer payload header
Material risk: change: workflow gate
Reachability: impl-review writes `verdicts["iter-NN"]` through `record-verdicts` at step 8 (late return step 7a); pr open mode step 1 reads it from `state.json` on the same branch
- [ ] `asd-phase-impl-review.md` steps 7a and 8, `asd-phase-design-review.md` steps 8a and 9: record verdicts and latches through `record-verdicts` (D10); Exit lines (AC-14)
- [ ] `agent-protocol.md` "Dispatch payload" reviewer keys, impl-review step 6 payload and both workflows' Dispatch JSON: `findings_header` (D9, AC-12)

### Task 10: README mirrors
Material risk: artifact: mirror tables
- [ ] `README.md`: scope and pr phase rows, FAQ :485-486, runtime row :345 (`record-verdicts`, timing fill), External Review invocation, asd-tester rows — matching AC-1..AC-14 (AC-15)

## Risks
- D5 host detection rests on `CLAUDECODE=1` (verified in this Claude Code session's shell); a Codex shell is assumed otherwise.
- D3 relies on GitHub closing keywords only for merges into the default branch; the merge-mode close covers any other base.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | Task 1, Task 2, Task 3, Task 4, Task 5, Task 6, Task 7 |
| 2 | Task 8, Task 9 |
| 3 | Task 10 |

- Task 8 follows Task 5: both edit `runtime.js`.
- Task 9 uses the D10 interface Task 8 implements; both land in wave 2 on disjoint paths.
- Task 10 mirrors every earlier Task.
- Orchestrator, after each wave's last canon edit: `node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply` over the views whose canon changed, then commit them.
