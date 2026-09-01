[REVIEW-impl-quality]: CONCERNS

# Review — quality
- **Phase**: impl-review
- **Iteration**: 2 (floor = medium)

## Findings
| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `asd-phase-impl-test/SKILL.md:5` vs `asd-phase-impl-test.md:13,28,52,54` | impl-test's workflow does inline state.json/decisions-log writes with "no PM dispatch", but the skill still grants only `Read Bash AskUserQuestion Task` — no Write/Edit. Missed in the iter-01 fix batch. | Add `Write Edit`; sync.js --apply. |
| 2 | high | `asd-phase-impl-review.md:11-15,42` vs `asd-phase-impl-review/SKILL.md:5` | Step 6 requires computing `git diff`+scope file list, but the skill has no Bash and every reviewer is read-only with no Bash either — no actor in the phase can produce the diff. | Add `Bash` to the skill + a run-command op to Operations used. |
| 3 | high | `external-review.md:60` + `asd-phase-impl-review.md:42` | Iter 2+ diff defined as "uncommitted + last commit only" — a multi-commit review-fix cycle (this sprint: ~50 commits) means every commit but the last escapes review. | Scope iter 2+ as diff since the sha recorded at the end of iter N-1 (mirror test-plan.md's Entry-log pattern). |
| 4 | high | 5 reviewer agent files (documentation, testing, quality, implementation, performance) | "Never raise low/medium findings on iter 2+" hardcoded — contradicts the actual config-driven floor (medium counts at iter 2 by default). | Delete the line; the floor-from-payload instruction above it already covers this. |
| 5 | high | `asd-architect.md:65`, `asd-ux-designer.md:70` | Write allowlists omit `docs/architecture/tech-reference/<tech>-<version>.md` and `docs/ux/accessibility.html`, which the same files mandate writing elsewhere. | Add both paths to the respective allowlists. |
| 6 | medium | `asd-phase-impl.md:48`, `asd-backend-dev.md:65` | Both re-enumerate the self-hosting write surface and both drop `CHANGELOG.md`/`.gitignore`, contradicting `sprint-lifecycle.md:63`'s "exhaustive allowlist, point back don't restate". | Replace with a pointer to `sprint-lifecycle.md` "Self-hosting". |
| 7 | medium | `t_html-shell.html:48` vs `:61-63` | New `.layout:has(> nav.toc)` selector (specificity 0,2,1) outranks the 880px media query (0,1,0) — mobile breakpoint is dead for any document with a TOC. | Add the `:has()` variant inside the media query too. |
| 8 | medium | `external-review.md:17-18` | Rule doc's wrapped-CLI invocation tails omit the `--sandbox read-only`/`--allowedTools` flags the agent file and tests/run.js actually enforce. | Put the full tails (with flags) in the rule doc. |
| 9 | medium | `asd-init/SKILL.md:53-55,109-116` | Seeds `c4-build` but never creates/patches consumer `.gitignore` for the C4 build-output paths the framework now claims are gitignored everywhere. | Add a `.gitignore` seeding step to asd-init. |

## Coverage summary
`files: 51/51 checked, 0 n/a · rules: 24/24, 9 findings mapped (medium+)`

## Verdict
CONCERNS: 9 (5 high, 4 medium)

## Next action
Route to `impl` review-fix mode. Findings #1,#2,#5 need sync.js --apply in the same task.

## Escalations
None (finding #3's schema addition to state.json is small/additive per the reviewer, offered as a judgment call not an escalation).
