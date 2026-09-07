[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 2 (severity floor: medium — low findings withheld)
- **Scope**: incremental diff of the iteration-1 review fixes, 12 files

## Findings

| # | Sev | Location | Description | Failure scenario |
|---|---|---|---|---|
| DOC2-1 | high | `AGENTS.md:80`, bullet at `:82` | The "No build / test / lint" section still asserts that `tests/run.js` covers only the sync engine, the update script and the migrations, and "does not test rules/agents/skills/templates content", and its verification bullet requires a green suite only for changes touching those three paths. This sprint made both statements false: the new test sections assert rule-doc and README content (the `core.md` glossary list, the `sprint-lifecycle.md` chain line, the `checkpoints.md` precondition chain, README's phase table, flowchart and count words), the retrospective template's section contract and TOC threshold, and the skill/workflow file set. `AGENTS.md` is loaded into every session, so this is the highest-traffic stale claim in the repo. | A dev agent edits the `core.md` phase list, the `checkpoints.md` precondition chain or the retrospective template, consults `AGENTS.md`'s own verification list, sees its file class explicitly excluded from test coverage, and marks the task done without running the suite. The break surfaces only at impl-review's terminal full-suite run — a full review-fix round-trip — or, for an edit made during `retro` or `pr` where no suite re-run occurs, ships red. |
| DOC2-2 | medium | `README.md:436` | The lean-sprint FAQ still enumerates the always-run tail without `retro`, while its SSoT now lists retro among the never-no-op phases and `AGENTS.md` mirrors it correctly. This is exactly the site class the rewritten chain-consistency contract names — "every phase table or enumeration in the rule docs and README" — and no test catches it: the new README assertions check the phase table rows, the flowchart node set and the count words, none of which match this inline enumeration. | A user configuring a lean sprint reads this FAQ, plans for a five-phase tail, and is surprised when retro runs anyway and produces a retrospective and a chat summary before `pr`. The same drift class the AC-8 mirror work exists to close, surviving in the user-facing entry point. |
| DOC2-3 | medium | `.asd/rules/sprint-lifecycle.md:250` | The writer-mechanism paragraph declares that a dispatched agent returns its friction observations in its final text and the dispatching workflow appends them as `F-N` entries. No reachable instruction implements the agent half. No file under `.asd/agents/**` contains the word `friction`, and no dispatch payload asks for it — the longest dispatch in the sprint lists ten instruction bullets to the dev agent and none mentions returning friction observations; its only `F-N` write is the orchestrator's own conditional manual-steps entry. `providers.md` compounds it: the dev and tester role rows load only their phase's section of the lifecycle rules, so they never read the friction-log section that declares the obligation. Every workflow's uniform append operation therefore has an input source that is never populated. | The dev agent hits an ambiguous or contradictory rule during a long impl run — the exact malfunction class this sprint added the log for, and the most likely one under self-hosting. It emits `COMPLETED` with a files-touched summary; the workflow has nothing to append; retro reads an entry-free log, takes the empty-log branch, and reports no friction for a sprint that had friction. Remediation is then structurally limited to whatever the main orchestrator personally observed. |

## Checked and clean

In-body comments: the migration has none inside any function body — all four comments are member-level docs above their declarations, plus the file header — and the new test assertions add none; every comment added this sprint sits at column zero between functions. The absolute ban holds for the change surface.

Count words verified against the filesystem rather than prose: 18 canonical skills, 11 phase skills, 11 workflows, 11 canonical agents, 15 generated per-provider agents, 18 generated skills per provider. Every count word in README and `AGENTS.md` matches, including after the retro-skill edit.

`AGENTS.md`'s managed block is byte-identical to its template; nothing was hand-edited above the end marker.

AC-1 through AC-10 all trace to artifacts. AC-10 specifically: the class definition and anti-double-channel rule in the lifecycle rules, the clause making it survive the empty-log branch, the template's merged actions table alongside its separate systemic-proposals table, the retro workflow, the skill description, README's row, and the new template assertion.

HTML shell wrapping: the retrospective template is a clean fragment, its TOC threshold is correctly documented as filled on the four-`h2` full branch and empty on the two-`h2` empty-log branch, and provenance is original with the badge omitted.

Manifest reverse coverage holds: both new templates, the new skill in both ledgers, and the new workflow plus the migration in the upstream ledger only, per the non-render-canon rule. The version still sitting at the pre-bump value against a higher-numbered migration is not a finding — the bump is placed in `pr` open mode with its own blocking DoD check.

## Verdict

CONCERNS: 3 (1 high, 2 medium). All are autofixable doc edits: no scope change, no new abstraction, no contract change, so none meets the escalation bar.

## Next action

Route to `impl` review-fix mode. DOC2-1: correct the verification section to state what the suite now covers and widen its bullet to require a green run for rule-doc, README, template, skill and workflow edits. DOC2-2: add retro to the FAQ enumeration. DOC2-3: either give dispatched agents the obligation — a friction-return line in the creator agent bodies or in each workflow's dispatch instruction list, plus the friction-log section added to the affected role rows in `providers.md` — or narrow the rule to the writers that actually exist.

## Escalations

None.

## Coverage ledger

```json
{"manifest_digest":null,"findings":["DOC2-1","DOC2-2","DOC2-3"],
"files":[{"i":".asd/migrations/6.0.0.js","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/artifact-layout.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked","f":"DOC2-3"},{"i":".asd/skills/asd-phase-retro/SKILL.md","s":"checked"},{"i":".asd/templates/t_friction-log.md","s":"checked"},{"i":".asd/templates/t_retrospective.html","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked","f":"DOC2-3"},{"i":".asd/workflows/asd-phase-retro.md","s":"checked"},{"i":"AGENTS.md","s":"checked","f":"DOC2-1"},{"i":"README.md","s":"checked","f":"DOC2-2"},{"i":"tests/run.js","s":"checked","f":"DOC2-1"}],
"rules":[{"i":"DOC-SSOT","s":"finding","f":"DOC2-3"},{"i":"DOC-TEMPLATE-RESPONSIBILITY","s":"pass"},{"i":"DOC-PRD-SCOPE-CONDITIONAL","s":"n/a","p":"documents.prd disabled; no PRD draft or persistent requirements doc in scope"},{"i":"DOC-HTML-SHELL","s":"pass"},{"i":"DOC-PROVENANCE","s":"pass"},{"i":"DOC-TRACEABILITY","s":"finding","f":"DOC2-2"},{"i":"DOC-PERSISTENT-ACTUALITY","s":"n/a","p":"self-hosting repo has no persistent docs tree; the framework-mode rule substitutes"},{"i":"DOC-INCODE-COMMENTS","s":"pass"},{"i":"DOC-FRAMEWORK-MODE","s":"finding","f":"DOC2-1"},{"i":"DOC-CUSTOM-RULES","s":"pass"}],
"sections":[{"i":"scope/friction-log","s":"reviewed"},{"i":"scope/retro-phase","s":"reviewed"},{"i":"scope/phase-chain-mirrors","s":"reviewed"},{"i":"scope/placeholder-table","s":"reviewed"},{"i":"scope/migration-and-tests","s":"reviewed"}]}
```
