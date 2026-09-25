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
| 016-remove-terra-family#P-1 | asd | deferred | 019-retro-intake | Fix low-severity findings located only in test files or `test-plan.md` in place via the impl-review `asd-tester` dispatch, instead of routing a full impl review-fix → impl-test → impl-review cycle. |
| 016-remove-terra-family#P-2 | asd | included | 019-retro-intake | Rotate the decisions log at phase entry only when the live file exceeds a size threshold, not whenever it holds any entry. |
| 016-remove-terra-family#P-3 | asd | rejected | 019-retro-intake | Allow a `public contract` risk to be declared against the artifact when the contract decision itself was already recorded at a hard scope or audit gate and the Task is an objectively verifiable value swap. |
| 017-review-waves#A-1 | consumer | rejected | 019-retro-intake | A remote or cloud session for this repo installs the wrapped CLI in its environment setup script; otherwise, treat every External Review there as availability-skipped and do not count it toward review coverage. |
| 017-review-waves#A-2 | asd | included | 019-retro-intake | Route a finding in agent memory to that memory's owner. When the host gives the owner no write tool, the orchestrator applies the owner's returned text verbatim and records it; never let a non-owner author memory text. |
| 017-review-waves#A-3 | asd | included | 019-retro-intake | A review-fix tester amends `test-plan.md` risk and added-test rows only. The Entry log and entry-segment rotation belong to impl-test alone. |
| 017-review-waves#P-1 | asd | deferred | 019-retro-intake | A plan decision that introduces a counting or partition formula states what it does on degenerate input (an empty scope, fewer items than buckets) before plan acceptance. |
| 017-review-waves#P-2 | asd | included | 019-retro-intake | When a sprint removes a mechanism or term, its leftover-term check covers `.claude/agent-memory/**` from the first impl-test entry. |
| 017-review-waves#P-3 | asd | deferred | 019-retro-intake | Persist each reviewer's returned text through one runtime command that writes the token, findings and ledger. The orchestrator should not re-author review files by hand. |
| 018-agent-tool-permissions#A-1 | asd | included | 019-retro-intake | A dispatched agent commits in one command, `git commit --only -- <paths>` (never-tracked paths added in that same command), and never leaves a path staged between commands. |
| 018-agent-tool-permissions#A-2 | asd | included | 019-retro-intake | Return the shell to the repo root before every dispatch, and name the repo root as an absolute path in every dispatch payload. |
| 018-agent-tool-permissions#A-3 | asd | included | 019-retro-intake | Treat `maxTurns` as host-enforced: every reviewer payload states its turn budget and the turn by which the report must be emitted. |
| 018-agent-tool-permissions#P-1 | asd | included | 019-retro-intake | A review-fix that changes a rule other files consume greps every consumer of that rule's home and updates them in the same commit, listing them in its completion signal. |
| 018-agent-tool-permissions#P-2 | asd | included | 019-retro-intake | Rotate the decisions log once per entry into the impl / impl-test / impl-review cycle, not at each transition inside it. |
| 018-agent-tool-permissions#P-3 | asd | included | 019-retro-intake | Dispatch a fresh tester for each impl-test entry and each terminal suite run, with `test-plan.md` as the only hand-off; never resume a tester across entries. |
