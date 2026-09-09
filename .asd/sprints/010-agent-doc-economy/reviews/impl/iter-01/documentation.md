[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 1
- **Severity floor**: low
- **Ledger status**: NOT VALIDATED — see "Ledger deviation" below. Findings stand as evidence for the fix round; the verdict token is not counted toward this iteration's DoD, and this reviewer is re-dispatched fresh next iteration against a corrected manifest.

## Findings

### DOC-1 — medium — SSoT

**Location**: `.asd/agents/asd-reviewer-documentation.md:67`

The new `Documentation economy` rubric bullet re-enumerates `artifact-layout.md`'s `Cut on sight` list inline — four items verbatim, one paraphrased (`emphasis inflation` against the home's `emphasis so frequent it marks nothing`), one dropped — while the same sentence points at the other two lists rather than copying them. A second home for the exclusion taxonomy, already diverged in wording at landing, inside the file that is the rule's only enforcement path. The reviewer loads the home file on every dispatch, so the copy changes nothing it does. `tests/run.js:3638` forbids exactly this for the three tests, leaving the cut list the one list with no guard.

**Suggested fix**: delete the em-dash enumeration only, keeping the lead-in, `is a finding, cut not shortened`, and the two existing pointers. Do not touch the bold lead-in `Documentation economy` — it is the manifest rubric id, pinned at `tests/run.js:3656`.

### DOC-2 — low — documentation economy

**Location**: `.asd/agents/asd-advisor.md:22,23,44,50,58`; `.asd/agents/asd-architect.md:57,94,100,101`; `.asd/agents/asd-reviewer-documentation.md:97`, `-correctness.md:137`, `-efficiency.md:135`, `-testing.md:92`

Residual intra-file restatement of the E-10/E-17 class, applied in part with no reason recorded — the Task-10 decisions-log entry records reasons for E-15, E-10/`asd-dev`, E-5, E-4 and E-22 only. (a) `asd-advisor.md` states the HARD-gate refusal rule four times and "never requests user decisions" twice, though the tool grant already enforces the latter; `audit.md` E-4 named this agent as its sixth member and the enforcement test applies. (b) `asd-architect.md` states the build-output rule four times, whose home is `artifact-layout.md`, granted unconditionally to that role. (c) `Never bury verdict in prose.` survives in all four in-scope reviewer bodies — a prohibition negating the MUST two lines above it, the exact sentence E-17 cut from `review-policy.md` this sprint.

**Suggested fix**: cut `asd-advisor.md:44` and `:50` and the redundant half of `:22`; keep one statement of the build-output rule in `asd-architect.md` Tool policy, where it bounds the `likec4` grant, and cite `artifact-layout.md` from the other three; drop the trailing `Never bury verdict in prose.` from the four reviewer bodies, leaving the MUST and parse sentence. `asd-external-review.md:128` holds a fifth copy but is outside this diff's surface.

## Over-application sweep — no finding

Every deletion was checked against the rule's `Never cut` list and `audit.md` R-1. Exact-form contracts intact: verdict token grammar and its two branches, ledger row shape and the `vocabulary`/`row_example` literals, the `Material risk:`/`Reachability:`/wave-table grammars, `t_plan.md`'s parser-critical comment, the HTML placeholder table. Completeness-is-the-rule enumerations intact: the over-engineering thirteen, the nitpick five, the state-recovery verdict values, the role-scoped context table. Case distinctions and stated failure modes intact: the APPROVE-latch invariant with its availability-skip carve-out and red-full-suite invalidation, the orphan-detection conditions, `code-style.md` §19's EOL and staged-diff paragraphs, §1-§6 baselines. Every fact moved out of a deleted passage kept a reachable home — reviewer read-only prose to `providers.md` and `review-policy.md`, the prior-iteration-files ban to `review-policy.md` "Clean-context review iteration" (not config-enforced, correctly kept), the `asd-update` migration ordering to its skill, the rule-doc list to `core.md` "See also", the shell-CSS §6 carve-out to `design-system.md` §6 cited from both roles granted it. `core.md` "See also" is a bijection with `.asd/rules/*.md`, and both "Rule docs" pointers resolve with no residual copy. Actuality holds: README phase list, agent roster, both provider tier columns, folder map, command list and the plan row's new dispatch-wave clause all agree with canon; the `t_plan.md` wave table matches `sprint-lifecycle.md` and `asd-phase-impl.md`; each of AC-2, AC-3, AC-4, AC-5a, AC-5b, AC-6b and AC-10 landed at the site its criterion names.

## Ledger deviation

This reviewer resolved all 56 file rows, all 10 rule rows (four as `n/a` on the manifest's authorized predicates) and all 4 section rows, and returned them as a compact ledger bound to manifest digest `952271d7…`. That ledger cannot be validated, for two independent orchestrator defects recorded in `friction-log.md`:

- **F-1** — the manifest's `n_a` was keyed flat by rubric id rather than by row-type label, so `validate-ledger` would have rejected all four truthful `n/a` rows as unauthorized.
- **F-2** — the orchestrator corrected and re-stamped that manifest while this dispatch was in flight, so the digest the ledger cites no longer exists on disk.

Neither is a reviewer fault, and the findings above do not depend on the ledger. Per `review-policy.md`, a verdict without a validated ledger does not count toward DoD, so this iteration does not record it as satisfied; the reviewer is re-dispatched fresh next iteration against the corrected manifest, after the fix round.

## Verdict

CONCERNS: 2

## Next action

Route to `impl` review-fix mode. Apply DOC-1 before DOC-2: it edits the file whose rubric ids the next manifest is derived from, and `node .asd/sync.js --apply` for the regenerated documentation-reviewer views must follow it. Grep each sentence in `tests/run.js` before cutting it — the suite pins literal prose in these files.

## Escalations

Two observations outside this diff's surface, for the retro rather than a fix round: `asd-reviewer-efficiency.md`'s rubric copies `review-policy.md`'s thirteen-item over-engineering checklist in full, an unrecorded instance of AC-8's own class in a file every impl-review dispatch loads; and `plan.md` Task 13's first two subtasks were still unticked although both landed.
