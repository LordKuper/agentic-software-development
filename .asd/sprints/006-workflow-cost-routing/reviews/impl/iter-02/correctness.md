[REVIEW-impl-correctness]: CONCERNS

# Review — correctness

- **Phase**: impl-review
- **Iteration**: 2
- **Severity floor**: medium
- **Scope**: incremental, 32 paths (`11333cb…60a991a`)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| F1 | high | `.asd/workflows/asd-phase-impl-test.md:29` (same defect `.asd/workflows/asd-phase-impl.md:61`) | Both dispatch sites derive the agent id from the routed tier — impl-test: "`execution="agent"` selects `asd-tester-<tier>`"; impl: "selects the role suffix matching `tier`". `routeTask` returns `tier: 'standard'` for all normal work (`.asd/runtime.js:143`), and this iteration deleted the `standard` variants, so `asd-dev-standard`/`asd-tester-standard` no longer exist (only `-mechanical`/`-critical` are generated). Followed literally, the default routing path dispatches a non-existent agent. The base-agent fallback exists only in `providers.md:101`, which neither step cites for suffix selection. | In both steps state the mapping explicitly: "`mechanical`/`critical` → `<base>-<tier>`; `standard` → the base agent id (`asd-dev`/`asd-tester`), which has no variant (`providers.md` "Task-class variants and routing")." |
| F2 | medium | `.asd/templates/external-review/t_review-scope.json:1-9` | The scope-manifest template has no `exclude_paths` key, but `exclude_paths[]` is a declared manifest field (`external-review.md:46`), is populated by both review workflows, is described to the wrapped CLI in both prompts, and backs the agent's boundary rule "Never read a path outside the manifest's `files[]` or inside `exclude_paths`". A manifest rendered from this template silently drops every exclusion, so the wrapped read-only CLI has no machine-readable boundary for `.asd/project/**`, `.asd/sprints/**`, generated views (self-hosting) or `.asd/**`/`docs/**` (consumer). | Add `"exclude_paths": ["{{PATH}}"]` to the template, ordered as in `external-review.md`'s field list. |
| F3 | medium | `.asd/rules/git-strategy.md:35` (mechanic: `.asd/workflows/asd-phase-impl-review.md:58-60`) | The new "Commit before review" contract names only `impl` and `impl-test` as committing phases, yet impl-review step 9 has `asd-tester` fix a test **in place** and re-run, then on green go straight to `NEXT: pr` with no commit step. That fix stays uncommitted: `Suite run`'s recorded `HEAD` predates it, and pr open-mode's skip check `git diff --quiet <recorded HEAD>...HEAD` cannot see worktree-only changes — so the re-run is skipped and the PR ships without the fix that made the suite green. `sprint-lifecycle.md:237` explicitly assumes "the rare in-phase test-defect fix … shows up as a non-empty diff", which only holds if it is committed. | Give step 9's test-defect branch an explicit commit obligation (Conventional Commits, before re-running and before recording `Suite run` `HEAD`), and add impl-review to `git-strategy.md` "Commit before review". |
| F4 | medium | `.asd/agents/asd-tester.md:74` (contradicts `:25`) | Authority now says the tester commits its own work before phase COMPLETED, but Tool policy still limits its run-command scope to "commands from `commands.yaml` (test, lint, build, …) plus a diff command for the change surface" — no git staging/commit. An agent obeying its declared tool policy cannot satisfy its declared authority, and `impl-test` step 10's "`git status --porcelain` MUST be empty" then fails impl-review's new clean-worktree precondition. | Extend the Tool policy bullet to permit the git staging/commit commands its Authority requires (still no push, no `--no-verify`, per `git-strategy.md`). |
| F5 | medium | `.asd/runtime.js:148` / `.asd/rules/providers.md:103` | AC-11 requires a task's "tier, reason, **selector**, and resolved model identifier when available … recorded as resumable evidence". `selector` was dropped from `routeTask`'s result this iteration; the persisted record is `{execution,tier,reason,resolved_model}` and no rule, workflow or template records a selector anywhere. No `stubs.md` entry and no decisions-log entry covers the removal — an AC element narrowed without a traceable follow-up (AC-2). | Either restore a `selector` field naming the rule that decided the tier, or record an explicit decision that `execution` is AC-11's selector-of-record (decisions-log + one clause in `providers.md` "Task-class variants and routing"). |
| F6 | medium | `README.md:205` (same claim `CHANGELOG.md:10`) | Both still advertise a generated `-standard` variant ("`-standard` Sonnet/Terra medium"; "standard (Sonnet/Terra)"). No such agent is generated anymore, and README's own folder map says "11 roles + 4 tier variants". Consumer-facing docs name an agent id that resolves to nothing — the mirror rule in `AGENTS.md` "Hard rules" requires this in the same change. | Reword both to "`-mechanical` and `-critical` only; tier `standard` dispatches the base agent (`asd-dev`/`asd-tester`)". |

**Residuals recorded below the `medium` floor (not findings):** `sprint-lifecycle.md:281` cites "asd-phase-pr.md step 4" for the verdict-map gate consumer, but the compressed pr workflow's DoD check is open-mode step 1; `asd-phase-design-review.md:35` builds its scope manifest without `base_ref`/`head_ref`; `t_prompt-external-impl.md:20` says the manifest is "below" when it is rendered above; `t_review-scope.json:3` quotes `{{ITERATION}}` with no de-quoting instruction; `tests/run.js:472-473` names its case "WITHOUT `.asd/project/config.yaml` (the framework repo itself)" though this repo does have one; `runtime.js:45` returns `timedOut: undefined` (not `false`) when no error occurred, and the field is unused.

## AC coverage trace (`documents.prd: disabled` → `sprint.md` AC-N)

Traced against the iteration-2 change surface only. AC-1, AC-2, AC-3/AC-6, AC-4/AC-5, AC-7/AC-14, AC-8/AC-9, AC-10/AC-12, AC-13, AC-15, AC-16, AC-17, AC-18..AC-23 — covered, with two qualifications: **AC-11** partially covered, see F5 (`selector` evidence dropped, no follow-up); **AC-17** covered except the mirror drift in F6; **AC-22** covered, but F3 weakens the pr-side re-run trigger in one path. Every changed path maps to plan Tasks 1-6.

## Coverage

Manifest: [`correctness.manifest.json`](correctness.manifest.json) (digest `356a80c4…b9e96`). Validated ledger: [`correctness.ledger.json`](correctness.ledger.json). Findings: [`correctness.findings.json`](correctness.findings.json). `validate-ledger` → `{"ok":true}`.

`UI_CONFORMANCE` and rules `UI-1`..`UI-7` are `n/a: no-ui-surface-in-scope`.

## Verdict
CONCERNS: 6

## Next action
Route to `impl` review-fix mode. All six are creator-autofixable without escalation. F1 and F6 share a root cause (removed `standard` variants not propagated to the two dispatch sites and the two consumer-facing mirrors) and should be fixed together; F3+F4 are the commit-ownership hole left by the new clean-worktree contract; F2 is a one-key template addition; F5 needs either a restored field or one recorded decision.

## Escalations
- finding F5: borderline — AC-11 names `selector` explicitly, but `execution` + `tier` + `resolved_model` already determine the dispatched executor. If the orchestrator judges `execution` to be AC-11's selector, that reading is an AC-text interpretation and belongs in `decisions-log.md` rather than being closed silently in code.
