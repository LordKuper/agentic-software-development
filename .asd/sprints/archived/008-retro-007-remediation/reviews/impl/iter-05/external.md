[REVIEW-impl-external]: CONCERNS
Interrupted attempts: 1 (dispatch returned without a verdict, waiting on a background process)

# External Review Report

- **Phase**: impl-review
- **Iteration**: 5
- **Severity floor**: critical
- **Provider**: codex (`gpt-5.6-sol`, high reasoning, `--sandbox read-only`), real dispatch, no quota failure — the negative cache from iterations 3 and 4 had genuinely expired.

## Dispatch history for this iteration

The first dispatch returned no verdict and no report; it was recorded as an interrupted attempt and re-dispatched fresh per `review-policy.md`. Both runs subsequently delivered: the re-dispatch returned `APPROVE`, and the original run completed late with `CONCERNS` and one critical finding.

**The orchestrator recorded CONCERNS**, having independently verified the finding on disk. The re-dispatch's `APPROVE` was reached without noticing a contradiction the other run found and that inspection confirms; recording `APPROVE` would ship a known-false, security-relevant claim. The two runs do not in fact disagree about the underlying state — the `APPROVE` run flagged the same defect class as a `high` finding, dropped only because the iteration floor is `critical`.

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| X-1 | critical | `.asd/rules/providers.md:43` vs `README.md:211` | `providers.md:43` claims universally: "Reviewer agents carry no artifact-write grant on either host: Claude reviewer agents carry no `Write` in `tools` … Enforced by config, not by a textual instruction repeated in reviewer bodies." **This is false for `asd-external-review`**, which is a reviewer agent and carries `"tools": ["Read", "Glob", "Grep", "Bash", "AskUserQuestion"]` — verified in canon. `Bash` is a write capability, so that reviewer's read-only property is not config-enforced on itself; it rests on its own tool-policy prose plus `--sandbox read-only` on the *wrapped subprocess*. `README.md:211` already states this correctly, with the carve-out named explicitly. Two always-loaded documents now contradict each other on a security-relevant claim, and it is precisely the claim AC-15 was scoped to reconcile this round — so the reconciliation is incomplete, not merely imprecise. | Scope `providers.md:43`'s "Enforced by config" sentence to the four internal reviewers, and carry the External-Review carve-out `README.md:211` already states: `Bash` present because a command-runner is required to invoke the wrapped CLI at all, with enforcement moved to the wrapped subprocess. |
| X-2 | high (below floor; recorded because it is the same incomplete reconciliation) | `.asd/agents/asd-reviewer-{correctness,efficiency,testing,documentation}.md` | All four reviewer bodies still read "reviewer never writes files" unqualified — an unmigrated restatement of the pre-AC-15 absolute claim, contradicting `review-policy.md:119`'s corrected scoped version, which acknowledges the `memory: project` channel. These are agent bodies loaded on every dispatch, and they are render sources, so the generated views carry the stale claim too. | Replace the unqualified sentence with a citation of `review-policy.md` "Gate Verdict Format", or scope it to exclude the memory channel. Re-run `node .asd/sync.js --apply <generated-view-path...>` for the eight affected views. |

## Dropped below floor (counts only)

3 — a stale `derived_handoff (AC-11)` mention in the `tests/run.js` §19 section-header comment; a `sync.js` header line describing a migration stage that has since completed; and one wrapped-model finding that did not survive verification (it read `README.md`'s agent-roster table and a hand-authored agent-memory file as illegitimate restatements of the `review-policy.md` "sole home" claim — both are authorized: the README table is a declared mirror per `AGENTS.md` "Cross-file consistency", and agent memory is not canon).

## Stalemate re-check — three rounds overdue

- **X-1 from iteration 2 (`derived_handoff.head` contradicting its own rule) — resolved by removal, confirmed complete.** A repo-wide search finds the identifier in no canon file, rule, workflow, template or test body. The only survivor is the stale section-header comment noted above.
- **X-2 from iteration 2 (union property's fourth condition unenforced) — resolved by reduction, and the survivor still blocks a genuinely half-reviewed merge.** Traced by hand: an id genuinely missed by both halves has no other authorized `n/a` predicate, so it must carry the out-of-half predicate in both and is correctly blocked; an id the unpartitioned manifest already authorizes `n/a` under a different predicate may be `n/a` in both without tripping, which is the intended escape hatch rather than a hole. `validate-partition` is confirmed absent and correctly documented as not built.
- **X-3 from iteration 2 (reserved-class rule duplicated) — resolved.** `providers.md` is now the only place asserting the normative rule; `sprint-lifecycle.md` retains the five names as illustrative examples of a `Material risk: change:` line, immediately followed by a citation of the home.

Not a stalemate by the strict definition: iterations 3 and 4 never completed, so there is no adjacent completed iteration to compare against. This was the first real re-check since iteration 2, and all three prior findings are resolved.

## Verdict

CONCERNS: 1 critical (X-1), plus X-2 recorded as the same incomplete reconciliation.

## Next action

Creator autofixes both in impl review-fix mode. X-1 is a one-sentence scoping edit; X-2 is one sentence in four agent bodies plus a `--apply` for the generated views. Neither needs escalation.
