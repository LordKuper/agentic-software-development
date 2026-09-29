---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 021-deferred-archival-retro-sweep

## Goal
Two parts.

1. Move the archival of a closed sprint to the start of the next sprint. Today, closing a sprint opens a second, companion PR (`chore/finalize-sprint-<NNN-slug>`) carrying only the terminal state and the archive move. That PR triggers a second CI/CD run on the base branch, when the project has CI (this repo and Glings both do). After this sprint, each sprint produces exactly one PR. The closed sprint's terminal write and archive move ride the next sprint's branch.
2. Triage every open retro row across both this repo and `D:\Projects\Glings`: every row of every archived retrospective that the retro backlog does not dispose of, not only the rows the current intake offers (the latest retro plus deferred ones). Each row is verified at `HEAD` and then closed, included or rejected.

## Acceptance
- AC-1: The `pr` phase opens no companion finalize branch or PR. Merge mode ends once the sprint PR is merged. It makes no write on `git.base_branch`, so the base-branch tree stays clean.
- AC-2: The hard closure gate stays explicit and still follows the merge. `/asd-sprint` detects a sprint whose PR is merged but which is not yet `phase=done` (the "merged-unclosed" state). It then requests closure approval with the completion evidence, before it starts or resumes anything else. On approval, the new sprint's scope writes the closing sprint's terminal state (`pr.state="merged"`, `phase="done"`, `updated_at`, `archived_at`) and moves its folder to `archived/`. Both are committed on the new sprint branch and land with that sprint's PR. On refusal, the sprint stays active and resumable.
- AC-3: Detection and recovery cover every pre-existing shape:
  - a merged-unclosed sprint does not block the one-active-sprint rule once its closure is approved;
  - a sprint left `closure-pending` by the old companion flow, and the legacy archived-non-done shape, still resolve;
  - the session-start hook reports the merged-unclosed state.
- AC-4: In self-hosting mode, the `v<asd_version>` tag and GitHub release are created from the sprint PR's merge commit, after closure approval. No companion merge commit exists.
- AC-5: Every rule, workflow, template and test that states the old companion-PR sequence is updated in the same change: `sprint-lifecycle.md` "PR phase"/"State recovery"/"Sprint immutability", `git-strategy.md` "Merging a PR"/"Finalize after closure", `artifact-layout.md` "Sprint archival", `asd-phase-pr.md`, `asd-phase-scope.md`, `asd-sprint`, `checkpoints.md`, the session-start hook, README and `tests/run.js`. Under `backward_compat: migration`, CHANGELOG states the behaviour change and the in-flight migration path. `node tests/run.js` is green.
- AC-6: The retro sweep covers every archived retrospective in both repos: 19 retros, 157 rows that are not `covered by:`. Each row not disposed in a backlog is verified at framework `HEAD` 5354056 and Glings `HEAD` 76719ce. `decisions-log.md` records its outcome (`resolved`/`obsolete`/`partial`/`open`) and its disposition. The 11 rows the runtime intake offered are written to `.asd/project/retro-backlog.md` as `included` or `rejected`, and none stays `deferred`. Legacy rows the intake never re-offers (this repo's 007–015 and every Glings row) are recorded in the decisions log only.
- AC-7: While any dispatched agent is in flight, the main orchestrator checks each one's status at least every 5 minutes, to catch a stalled ("hung") agent. A check is a liveness read of the agent's progress, not a wait for its completion. An agent with no progress since the previous check is stalled; it is stopped and handled as an interrupted/failed dispatch through the existing recovery (`review-policy.md` "Interrupted dispatch", `sprint-lifecycle.md` "State recovery" "Failed dispatch"). A second stall of the same dispatch escalates to the user. The rule is written as a provider-neutral semantic operation, with its host mapping for Claude Code and Codex in `providers.md`. That mapping is verified against the host docs or a live dispatch, not assumed.
- AC-8 (plan authoring; retro 020#P-1, 019#P-2, 013#P-2, 019#A-1, glings:005#A-4, 015#P-1, glings:005#P-1, glings:005#P-2, glings:004#A-5): The plan phase enforces the following before acceptance.
  - When the plan changes a rule that other files restate, it lists every restating site found by a repo grep and assigns each to a Task.
  - Tasks that run in parallel and cite each other's new rule homes name each home's exact file and section heading.
  - All edits to one rule doc that several ACs touch sit in one Task.
  - A Task holds only work its dispatched agent may perform. An orchestrator-only action is its own plan line with a named execution point.
  - No two Tasks in one wave touch overlapping paths.
  - A subtask adds no helper, guard or export unless it names a caller or a reachable failure.
  - The plan lists the external APIs each Task needs and extends the tech reference where one is missing.
  - A stub offered for inclusion states its verified cost and behaviour change.
  - A stub whose files are tests only routes to impl-test.
- AC-9 (scope and audit; retro 019#P-1, 009#P-4, 012#P-4, 013#P-1, glings:005#A-1, glings:004#P-1): Scope and audit enforce the following.
  - A retro-derived criterion that asserts host behaviour is verified against the host docs or a live dispatch before it becomes an `AC-N`.
  - Audit checks that each criterion is deliverable as stated and consistent with the others.
  - At scope, the orchestrator offers to split unrelated strands, or ACs that change independent contracts, into consecutive sprints.
  - An audit ambiguity that only authority or preference can settle goes straight to the user. `asd-ba` is dispatched only for ambiguity its sources can resolve.
  - A mid-sprint scope amendment has a defined procedure: the AC, the plan Task and its wave, the gate records, and a re-run of the change-surface estimate.
- AC-10 (review and fix; retro 020#A-3, 020#A-4, 012#P-2, 015#P-3, glings:004#A-4, 014#A-2, 009#P-2, 009#P-1, 012#P-1, glings:006#A-7): Review and fix handling enforces the following.
  - A literal `|` inside a Findings-table cell is escaped as `\|`, code spans included.
  - The reviewer writes its final return verbatim to one designated file, which `persist-review --in` reads. The orchestrator never re-types a return.
  - The emitted manifest carries the full ledger skeleton, pre-filled with the digest.
  - Findings are deduplicated across reviewers by target and claim before fix routing.
  - A fix for a finding about a rule's reach states that reach for every branch at the site, in one pass.
  - Before a flagged choice is accepted, the decisions log is checked for an earlier disposition of it, and any reversal is recorded.
  - When an AC is verified manually, the user smoke check runs at impl-test's first green entry.
- AC-11 (dispatch and host robustness; retro 020#A-1, 020#A-5, 013#A-3, 013#A-1, glings:004#A-2, glings:006#A-2): Dispatch handling enforces the following.
  - The orchestrator runs generated-view sync once, after the last canon-editing dispatch of a wave or fix round. A dev whose host denies a command commits its edits and returns `FAILED` naming that command.
  - The wrapped CLI runs with an explicit shell timeout of at least 10 minutes, and its stdout is never redirected.
  - The quota `retry-after` is taken from the provider-reported reset, capped at 1 hour, never the 5-minute default.
  - A creator or tester dispatch that ends without a signal is handled by the failed-dispatch recovery. A single host-wide cause counts as one event.
  - A background agent's return is read from its completion notification, never from its task output file.
  - Helper inputs and scripts live under the sprint folder or a git-ignored repo path, never in OS temp.
- AC-12 (runtime classifiers; retro glings:004#A-8, glings:004#A-9, glings:005#A-3): `.asd/runtime.js` is corrected in three places:
  - `isUiSurface` matches paths case-insensitively and includes `.uxml`/`.uss`/`.tss`;
  - `isTest` matches dotted test directories (`Core.Tests/`);
  - the consumer impl-review pathspec and `surface-check` exclude generated provider views, and `surface-check` excludes pure renames.

  Each fix is proven by a fail-first test.
- AC-13 (test contracts; retro 019#P-3, 009#P-6): A leftover-term check pins the exact sentences the sprint removed, taken from its diff, never a free-phrasing regex. A content-contract test pins a token that cannot be reworded, never the surrounding prose.

## Out of scope (optional)
- Editing `D:\Projects\Glings` code or rules. Glings has its own active sprint 007. Its `consumer` rows belong to Glings' own retro intake.
- Rejected retro rows (decisions log): 020#P-2, 017#P-1, 007#P-5, 009#P-3, 009#P-5, 010#P-1, 012#P-3, 014#P-2, glings:003#P-1, glings:004#A-1, glings:004#A-6, glings:006#A-3, glings:006#A-4, glings:006#P-1, glings:006#P-3.
