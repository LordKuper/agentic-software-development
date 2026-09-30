---
responsibility:
  owns: cross-sprint dispositions of retro rows
  excludes: retro content (retrospective.html), sprint decisions and HEAD verification evidence (decisions-log.md)
  delegates_to: <sprint>/retrospective.html (row content, home), <sprint>/decisions-log.md (sprint decisions, verification evidence)
---

# Retro backlog

<!--
Intake, ownership and lifecycle: .asd/rules/sprint-lifecycle.md "Retro intake" — not restated here.
One line per retro row, updated in place. Row: <NNN-slug>#A-N | <NNN-slug>#P-N. Row, Acts on and Disposition are English literals.
Disposition: deferred | included | rejected | closed (closed = verified already resolved at HEAD).
Decided in: the sprint that last decided the row. Guardrail: the row's text; escape | as \|.
-->

| Row | Acts on | Disposition | Decided in | Guardrail |
|---|---|---|---|---|
| 016-remove-terra-family#P-1 | asd | included | 020-multi-workflow-lite | Fix low-severity findings located only in test files or `test-plan.md` in place via the impl-review `asd-tester` dispatch, instead of routing a full impl review-fix → impl-test → impl-review cycle. |
| 016-remove-terra-family#P-2 | asd | included | 019-retro-intake | Rotate the decisions log at phase entry only when the live file exceeds a size threshold, not whenever it holds any entry. |
| 016-remove-terra-family#P-3 | asd | rejected | 019-retro-intake | Allow a `public contract` risk to be declared against the artifact when the contract decision itself was already recorded at a hard scope or audit gate and the Task is an objectively verifiable value swap. |
| 017-review-waves#A-1 | consumer | rejected | 019-retro-intake | A remote or cloud session for this repo installs the wrapped CLI in its environment setup script; otherwise, treat every External Review there as availability-skipped and do not count it toward review coverage. |
| 017-review-waves#A-2 | asd | included | 019-retro-intake | Route a finding in agent memory to that memory's owner. When the host gives the owner no write tool, the orchestrator applies the owner's returned text verbatim and records it; never let a non-owner author memory text. |
| 017-review-waves#A-3 | asd | included | 019-retro-intake | A review-fix tester amends `test-plan.md` risk and added-test rows only. The Entry log and entry-segment rotation belong to impl-test alone. |
| 017-review-waves#P-1 | asd | rejected | 021-deferred-archival-retro-sweep | A plan decision that introduces a counting or partition formula states what it does on degenerate input (an empty scope, fewer items than buckets) before plan acceptance. |
| 017-review-waves#P-2 | asd | included | 019-retro-intake | When a sprint removes a mechanism or term, its leftover-term check covers `.claude/agent-memory/**` from the first impl-test entry. |
| 017-review-waves#P-3 | asd | included | 020-multi-workflow-lite | Persist each reviewer's returned text through one runtime command that writes the token, findings and ledger. The orchestrator should not re-author review files by hand. |
| 018-agent-tool-permissions#A-1 | asd | included | 019-retro-intake | A dispatched agent commits in one command, `git commit --only -- <paths>` (never-tracked paths added in that same command), and never leaves a path staged between commands. |
| 018-agent-tool-permissions#A-2 | asd | included | 019-retro-intake | Return the shell to the repo root before every dispatch, and name the repo root as an absolute path in every dispatch payload. |
| 018-agent-tool-permissions#A-3 | asd | included | 019-retro-intake | Treat `maxTurns` as host-enforced: every reviewer payload states its turn budget and the turn by which the report must be emitted. |
| 018-agent-tool-permissions#P-1 | asd | included | 019-retro-intake | A review-fix that changes a rule other files consume greps every consumer of that rule's home and updates them in the same commit, listing them in its completion signal. |
| 018-agent-tool-permissions#P-2 | asd | included | 019-retro-intake | Rotate the decisions log once per entry into the impl / impl-test / impl-review cycle, not at each transition inside it. |
| 018-agent-tool-permissions#P-3 | asd | included | 019-retro-intake | Dispatch a fresh tester for each impl-test entry and each terminal suite run, with `test-plan.md` as the only hand-off; never resume a tester across entries. |
| 019-retro-intake#A-1 | asd | included | 021-deferred-archival-retro-sweep | A plan Task holds only work its dispatched agent may perform. An action reserved to the orchestrator or another owner, such as a memory-fix or a backlog write, is its own plan line with a named execution point, never a subtask inside a dev Task. |
| 019-retro-intake#P-1 | asd | included | 021-deferred-archival-retro-sweep | A retrospective-derived criterion that asserts host behaviour (the tools an agent actually holds, what a frontmatter field enforces) is verified against a live dispatch or the host docs at scope, not against the canon tool list, before it becomes an `AC-N`. |
| 019-retro-intake#P-2 | asd | included | 021-deferred-archival-retro-sweep | When a plan runs Tasks in parallel that cite each other's new rule homes, the plan Overview names each new home's exact file and section heading, not only its concept. |
| 019-retro-intake#P-3 | asd | included | 021-deferred-archival-retro-sweep | A leftover-term check pins the exact sentences the sprint removed (taken from its diff), never a free-phrasing regex over agent-memory prose that quotes or discusses the refuted claim. |
| 020-multi-workflow-lite#A-1 | asd | included | 021-deferred-archival-retro-sweep | Run generated-view sync (`sync.js --apply`) as the orchestrator, once, after the last canon-editing dispatch of a wave or fix round. A dispatched agent edits canon only, and a dispatched agent whose host denies a command commits its edits and returns `FAILED` naming that command; it never calls the command's internals. |
| 020-multi-workflow-lite#A-3 | asd | included | 021-deferred-archival-retro-sweep | Escape every literal `\|` inside a Findings-table cell as `\\|`, code spans included, and state this beside the table shape in the reviewer contract. |
| 020-multi-workflow-lite#A-4 | asd | included | 021-deferred-archival-retro-sweep | Persist reviewer returns without a model re-emission. Either the reviewer writes its final text verbatim to one designated return file in the iteration directory, which `persist-review --in` reads, or the host's own output capture feeds `persist-review` directly. The orchestrator never re-types a return. |
| 020-multi-workflow-lite#A-5 | asd | included | 021-deferred-archival-retro-sweep | Invoke the wrapped CLI with an explicit shell timeout of at least 10 minutes so the host never auto-backgrounds it, and never redirect its stdout to a file. |
| 020-multi-workflow-lite#P-1 | asd | included | 021-deferred-archival-retro-sweep | When a plan changes a rule that other files restate (for example an acceptance-criteria source, a roster or a phase predecessor), the plan lists every restating site found by a repo grep at plan time and assigns each site to a Task, not only the sample the audit named. |
| 020-multi-workflow-lite#P-2 | asd | rejected | 021-deferred-archival-retro-sweep | When a review-fix round changes only `.claude/agent-memory/**`, the orchestrator runs `commands.yaml` `test` itself as the impl-test re-entry and records it in `test-plan.md`, instead of dispatching a tester. |
| 021-deferred-archival-retro-sweep#A-1 | asd | deferred | 022-release-at-merge | In consumer mode, show the latest retro's `asd` rows to the user at scope as upstream proposals for the framework repo, instead of silently dropping them. |
| 021-deferred-archival-retro-sweep#A-3 | asd | included | 022-release-at-merge | When a wave dispatches more than one Task, devs never edit `plan.md` or a shared memory index. The orchestrator ticks the wave's checkboxes after its last signal. |
| 021-deferred-archival-retro-sweep#A-5 | asd | included | 022-release-at-merge | Make the head-branch PR lookup tolerate an unreachable `gh` outside `phase="pr"`: warn and resume instead of `FAILED`. Name "host unreachable, retry online" as the fix for that cause. Treat a `CLOSED` hit as no hit. |
| 021-deferred-archival-retro-sweep#A-6 | asd | included | 022-release-at-merge | Review code added by a scope amendment at the floor of its own first iteration: its first iteration counts from the amendment, not from the wave's counter. |
| 021-deferred-archival-retro-sweep#P-1 | asd | deferred | 022-release-at-merge | Route each impl-test re-entry and terminal-suite run from its own delta's risk. The first entry's tier does not clamp a later prose-only or test-only delta to critical. |
| 021-deferred-archival-retro-sweep#P-2 | asd | included | 022-release-at-merge | A `Reachability` line whose value crosses a push or merge also names the value each interruption point leaves on the receiving branch, before plan acceptance. |
