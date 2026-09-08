---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 009-retro-008-remediation

## Goal

Resolve every problem identified in the sprint 008 retrospective
(`.asd/sprints/archived/008-retro-007-remediation/retrospective.html`). That file's
**Actions** and **Systemic proposals** tables are the source of truth for scope; each
`AC-N` below traces to one row.

Two classes of work, one sprint:

- **Actions** — remediation of the eight friction entries `F-1`..`F-8`. Four of them were
  recurrences of classes sprint 007 had already identified, and 008's own conclusion
  sharpens 007's: a correction that lands only in a rule does not survive either, when the
  rule states one half of a two-sided obligation. Every fix here therefore states the
  obligation whole, at the place the acting agent already reads.
- **Systemic proposals** — six changes read off how sprint 008 actually ran (six review
  iterations, ~70 findings, three fix rounds, one criterion retired and one added
  mid-flight), each aimed at a recurring cost rather than at a specific failure.

Self-hosting sprint: this repo IS the ASD framework, so the retrospective's `asd` and
`consumer` targets are both edited here.

**Staleness verification** (008 `F-2`: retrospective rows are written against the HEAD of
the sprint that produced them). Every row of both tables was re-checked against current
HEAD `f1b15bf` before being written below. Result: fifteen rows still unresolved and
carried as `AC-1`..`AC-15`; one row closed as already satisfied (below); one row narrowed
by a partial delivery (`AC-13`).

- **`F-6` remaining work — closed at scope, no deliverable.** The row asked for the general
  form: state which emitted agent frontmatter fields the host actually honours.
  `.asd/rules/providers.md:47` already carries it at HEAD — `name`, `description`, `tools`,
  `disallowedTools`, `model`, `memory` host-honoured and observable in dispatch; `effort`
  and `maxTurns` emitted on trust and explicitly not an enforcement boundary. Nothing left
  to do.

## Acceptance

### Actions (friction remediation)

- AC-1: `F-1`/`F-3` — `.asd/rules/git-strategy.md` states the staging half of the
  commit-ownership rule it already carries: a dispatched agent stages only the paths it
  authored, and commits every path it authored before signalling completion. One statement
  closes both the broad-stage sweep that captures a sibling's in-progress edit and the
  ownerless-file case where neither agent commits a file each avoided.
- AC-2: `F-1` — `.asd/workflows/asd-phase-impl.md`'s dispatch payload contract states that
  parallel tasks share one worktree, so a dispatched agent knows why staging discipline
  matters before a collision teaches it.
- AC-3: `F-2` — the scope phase verifies each retrospective-derived acceptance criterion
  against current `HEAD` before writing it into `sprint.md`, and records the verification
  in the sprint artefact. `.asd/workflows/asd-phase-scope.md` implements it;
  `.asd/rules/sprint-lifecycle.md` states the obligation. Sprint 008's audit caught all
  three of its stale premises, but only after they had passed a hard gate and had to be
  revised through another one.
- AC-4: `F-4` — `.asd/rules/review-policy.md`'s interrupted-dispatch contract gains a
  correlated-failure branch: when every dispatch of one iteration is lost to a single cause
  (a session-wide limit), it is recorded once as an iteration-level interruption, not as N
  independent per-reviewer attempts, so the split trigger is not armed once per reviewer by
  one event.
- AC-5: `F-5` — the coverage manifest carries the allowed status vocabulary and the `p`/`f`
  placement rule per row type, in the artefact itself, so the reviewer reads the vocabulary
  off its own input instead of recalling one sentence of rule prose.
  `.asd/rules/review-policy.md` and `.asd/runtime.js` (which already knows the vocabulary,
  being the validator) agree on the shape.
- AC-6: `F-7` — `.asd/rules/code-style.md` names the CRLF editing hazard where agents meet
  it: canon is CRLF on disk on this platform, a scripted replacement must anchor on `\r\n`,
  and a whole-file diff for a small edit is the symptom. Stated as an encoding hazard, not
  left to be rediscovered through a whitespace lint error.
- AC-7: `F-7` — a root `.gitattributes` declares the line-ending policy explicitly, so the
  behaviour no longer depends on each machine's `core.autocrlf`. No such file exists at
  HEAD.
- AC-8: `F-8` — `.asd/agents/asd-external-review.md` and `.asd/rules/external-review.md`
  require the wrapper to await the wrapped CLI within its own dispatch and to return an
  availability skip if it cannot complete. An empty return — neither verdict nor skip — is
  not a permitted outcome.
- AC-9: `F-8`/`F-4` — `.asd/rules/external-review.md` records the wrapper's availability
  history across sprints, not only within one. Three sprints running, external review has
  been unavailable at the iteration where a second opinion was most useful, while the DoD
  treats it as an independent check.

### Systemic proposals

- AC-10: fix rounds run sequentially under one agent — `.asd/workflows/asd-phase-impl.md`
  review-fix mode. At HEAD the workflow marks fix tasks "parallel where independent,
  sequential where they collide"; sprint 008's two parallel rounds each closed their targets
  while introducing a fresh cross-file contradiction, and the three sequential rounds that
  followed introduced none of that class. Cost of the current behaviour: one review
  iteration per parallel fix round.
- AC-11: a reviewer's proposed fix is verified against source before it is applied, not
  merely applied — `.asd/rules/review-policy.md` and `.asd/workflows/asd-phase-impl.md`.
  Twice in sprint 008 a finding's own prescription was wrong and was caught only because
  the dev measured instead of transcribing.
- AC-12: a criterion's reachability is part of accepting it — `.asd/rules/sprint-lifecycle.md`
  plan format. A plan task whose value depends on two phases agreeing states which two and
  on what. Sprint 008's `AC-11` survived three fix rounds before anyone traced whether its
  stated purpose could occur at all; it could not, by construction.
- AC-13: agent memory is in the review surface by default rather than by exception —
  `.asd/rules/external-review.md`, `.asd/rules/sprint-lifecycle.md`. **Partially delivered at
  HEAD**: both files already state that `.claude/agent-memory/**` is not excluded under
  `self_hosting: enabled`. Remaining gap, and the whole of this criterion: state the property
  once for both modes rather than twice inside the self-hosting carve-out, and make a
  mid-sprint memory write reach the reviewed diff (the change-surface rule reviews commits;
  an uncommitted memory edit is invisible to every reviewer).
- AC-14: a reviewer's verdict may be recorded when a late-returning duplicate dispatch
  contradicts it — `.asd/rules/review-policy.md`. At sprint 008 iteration 5 an interrupted
  external dispatch delivered after its replacement had returned `APPROVE`, carrying a
  verified critical finding the replacement missed. "The interrupted verdict never counts"
  is right for bookkeeping and wrong for evidence; the orchestrator had to reason outside
  the rule to avoid shipping a known-false claim.
- AC-15: a criterion's running cost is surfaced, not only whether it is met —
  `.asd/rules/checkpoints.md`. Sprint 008 retired one criterion, closed one as already
  satisfied and added one mid-flight, each through a hard gate, because nothing surfaces
  cost until a reviewer objects.

### Cross-cutting

- AC-16: cross-file consistency holds for every change above — `README.md` mirrors (phase
  list, agent roster and model tiers for both providers, config schema, folder map, command
  list), `core.md` "See also", the eleven-phase chain, template variables, and
  `.asd/release-manifest.json` (`managed_paths`, `canon_hashes`, `model_families`).
- AC-17: `node tests/run.js` is green, with coverage extended to the machine-checkable
  behaviour this sprint actually introduces.
- AC-18: every canonical edit is reflected in the generated provider views via
  `.asd/sync.js --apply`; no generated file is hand-edited and no view is left stale.

## Out of scope

- The `F-6` remaining row, closed at scope as already satisfied at HEAD (see **Staleness
  verification**). Recorded here so its absence is deliberate rather than missed.
- Any behaviour not named by a row of the sprint 008 retrospective's two tables.
