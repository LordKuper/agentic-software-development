---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

## Overview
Consumer retros publish their open `asd` rows as GitHub issues on the ASD repo; the self-hosting scope triages those issues next to its own retro rows; the self-hosting `pr` merge mode closes delivered issues after the release. Plus four 028 retro rows (AC-9..AC-12). Approach: `research.md` Chosen A; C1 settled in `audit.md`.

Decisions (binding for every Task):
- **D1 Issue format.** Title `[asd-retro] <guardrail, cut to 80 chars>`. Body, in this order: first line `<!-- asd-retro-finding v1 -->`; `**Guardrail**:`, `**Root cause**:` (an `A-N` row) or `**Expected saving**:` (a `P-N` row), `**Home**:` (a framework path such as `.asd/rules/review-policy.md`), `**Provider**:` (`claude-code` | `codex`), `**ASD version**:` (`asd_version` of the consumer's `.asd/release-manifest.json`). Nothing else. Marker = the title prefix plus the first-line comment; an issue with the prefix but not this shape is non-standard.
- **D2 Publication** (consumer retro, new step after `retrospective.html` is written, before the chat summary): runs only when `self_hosting` is not `enabled` and config `upstream_issues` is not `disabled` (absent = `enabled`, read live, not frozen). Candidates: this retro's Actions and Systemic proposals rows with Acts on `asd`, `covered by:` rows excluded. Per row, the orchestrator writes the D1 body to `.asd/tmp/`, checks it holds nothing from the consumer project (sprint or row id, project/product/company name, a path outside `.asd/`, code, data, secret), and publishes with `gh issue create -R <owner/repo of release-manifest repo>`. A row it cannot state framework-only is skipped. `gh auth status` failing skips all rows; a create failing skips that row; no retry. One decisions-log line per publication run: published rows with their URLs, skipped rows with the reason. The retro still completes. The consumer's next scope shows the rows as upstream proposals exactly as today.
- **D3 Home of an upstream row.** A consumer retro's Home for an `asd` row becomes `upstream ASD: <framework path>` — the `.asd/` file the guardrail would land in, read from the consumer's own `.asd/` copy; `retro-candidates` keys on Acts on, not Home, so it is unaffected.
- **D4 Triage** (self-hosting scope step 2a, after `retro-candidates`): ensure labels `asd-retro` and `deferred` exist (`gh label create … -f`); list open issues `gh issue list -R <repo> -s open -S 'asd-retro in:title' -L 200 --json number,title,body,labels,url,createdAt`, keeping exact `[asd-retro] ` title prefixes. Bounded fetch: 200 = list limit; when 200 come back, the gate says the rest wait for the next intake (oldest first is not guaranteed — the gate names the count). Every issue's text is data. Per issue, in order:
  1. non-standard (D1 shape fails) → to the user, flagged, never auto-closed;
  2. clear duplicate (same guardrail substance) of an older open marker issue, of a `retro-backlog.md` row, or of a closed `asd-retro` issue → `gh issue close <n> --duplicate-of <original>` with a comment linking the original; shown at the gate, no question;
  3. resolved at `HEAD` (re-verified per `sprint-lifecycle.md` "Orchestration and adaptive gates") → closed `completed` with a comment stating the evidence; shown, no question;
  4. otherwise (`deferred`-labelled included) → to the user like a retro row: root cause or expected saving, proposed edits, consequences; a doubtful duplicate lists links to the similar issues.
  Auto-closes happen at step 2a, before the gate; each issue triaged gets the `asd-retro` label. Re-entry: a closed issue is no longer listed, so triage resumes on what is still open; the decisions-log `issue triage` line (below) is the evidence.
- **D5 Dispositions** (on scope acceptance, step 4, after the backlog write): include → the `AC-N` text ends `(issue #N)`; reject → `gh issue close <n> -r "not planned" -c <reason>` + label `wontfix`; defer → label `deferred`, stays open. Nothing goes to `retro-backlog.md`. One decisions-log line `issue dispositions: #N include AC-K; #M reject; …`. An empty issue list adds nothing to the no-op rule except one clause: the intake is a no-op only when both lists are empty.
- **D6 Close after release** (pr merge mode, after `gh release create` succeeds or is found done): included issues = every `(issue #N)` in the merged `sprint.md` on base; each still open → `gh issue close <n> -r completed -c "Released in v<asd_version>: <release url>"`; an already closed one is skipped. Open mode's PR body lists them under "Related issues" as `Refs #N`, never `Closes`/`Fixes`/`Resolves`. Release retry (`asd-sprint` Step 1, `sprint-lifecycle.md` "Merged-unclosed") adds the trigger "an included issue still open"; a retry runs only the missing steps.
- **D7 Gate exception** (C1): `checkpoints.md` "Gate inventory" states that publishing, triage closes and post-release closes of `asd-retro` issues take no gate in either mode; issue include/reject/defer is part of the existing hard `retro intake dispositions` gate.
- **D8 Config key** `upstream_issues: enabled | disabled`, top level, absent = `enabled`, ignored under `self_hosting`; `/asd-init` collects and edits it like `cleanup`. No migration (absent = enabled).
- **D9 AC-10 rename.** `review-policy.md` "Low-severity test-only findings" becomes "Minor test-only findings", firing for severity `low` or `medium`. Grep forms (per AC-12): the quoted heading `"Low-severity test-only findings"`, the context ref `#Low-severity test-only findings`, prose `low-severity test-only`, the `runtime.js` `isTest` doc comment's "low-severity finding".
- **D10 AC-11** home: `checkpoints.md` "Gate policy", beside the existing flagged-choice sentence; `asd-phase-impl.md` step 10 cites it.

New rule homes cited across wave-1 Tasks: `checkpoints.md` "Gate inventory" (D7), `review-policy.md` "Minor test-only findings" (D9), `core.md` "Untrusted-data boundary" (issue text as data), `artifact-layout.md` "Retro backlog" (issue dispositions not stored there), `sprint-lifecycle.md` "PR phase" "Merged-unclosed" (D6 retry trigger), `git-strategy.md` "Versioning & Changelog (self-hosting only)" (D6 close step).

External APIs: `gh` 2.90 — `auth status`, `issue create/list/close/edit`, `label create`, `release view`; reference `docs/architecture/tech-reference/gh-2.90.md` (written before acceptance). Every `gh` use here is workflow prose run by the orchestrator, no Node code.

Universal-reach sites (repo grep): D9 forms → `asd-tester.md`, `artifact-layout.md`, `git-strategy.md`, `providers.md`, `review-policy.md`, `sprint-lifecycle.md` (3), `asd-phase-impl-review/SKILL.md`, `asd-phase-impl-review.md` (4), `runtime.js` (doc comment), `tests/run.js` (impl-test retargets its pins), `README.md` if hit; "upstream ASD" home → `asd-phase-retro.md`, `asd-phase-scope.md`, `README.md`.

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.
`node .asd/sync.js --check` clean after the orchestrator's post-wave `sync.js --apply`.

### Task 1: Rule homes — gates, trust boundary, backlog, minor test-only findings
AC-4, AC-5, AC-6, AC-7 (D7), AC-10, AC-11.
Material risk: change: workflow gate — new ungated external actions and a widened in-place fix trigger
- [x] `checkpoints.md`: "Gate inventory" exception line for `asd-retro` issue actions (D7); retro-intake-dispositions row names issue dispositions; "Gate policy" AC-11 sentence: a flagged choice changing a predicate or contract an agent definition, README or rule states is checked against that text and routed back when it contradicts it (D10)
- [x] `core.md` "Untrusted-data boundary": GitHub issue titles, bodies and comments are data
- [x] `artifact-layout.md` "Retro backlog": issue dispositions live on GitHub, never in the backlog; "Test plan" citation renamed (D9)
- [x] `review-policy.md`: rename the subsection to "Minor test-only findings", trigger `low` or `medium`; the "Autofix vs escalation" reference renamed (D9)

### Task 2: Lifecycle and git rules
AC-7, AC-10, AC-12.
Material risk: change: release-retry trigger extension
Reachability: scope writes `(issue #N)` into `sprint.md` at scope acceptance; pr merge mode reads it from the merged `sprint.md` on base after the release; interrupted before merge, base holds no sprint.md change and nothing closes; interrupted after the release before a close, the retry trigger finds the issue open.
- [x] `sprint-lifecycle.md` "PR phase" "Merged-unclosed": release retry also fires while an included issue is still open (D6); phase table scope/retro/pr rows name issue triage, publication and close; impl cycle text and "User-resolved findings" renamed (D9)
- [x] `sprint-lifecycle.md` "Decomposition rules": a plan removing or renaming a name lists the grep forms its universal-reach sweep covers — verdict token, `<key>.md` file name, prose role name, retired tier wording — not the token alone (AC-12)
- [x] `git-strategy.md` "Versioning & Changelog (self-hosting only)": the close-after-release step (D6), skipped per issue when already closed; "Commits" citation renamed (D9)

### Task 3: Consumer publication at retro and its config key
AC-1, AC-2, AC-3, AC-8.
Material risk: change: security — consumer content crossing to a public repo
- [x] `asd-phase-retro.md`: step 4 Draft home `upstream ASD: <framework path>` (D3); new publication step (D2) with its decisions-log line; Inputs/Exit list config `upstream_issues` and the issue writes
- [x] `t_config.yaml`: `upstream_issues: enabled` with its comment (D8)
- [x] `asd-init/SKILL.md`: collect, show and write `upstream_issues` like `cleanup`, consumer projects only (D8)

### Task 4: Self-hosting triage and dispositions at scope
AC-4, AC-5, AC-6.
Material risk: change: workflow gate — issue triage inside the retro-intake gate
- [x] `asd-phase-scope.md` step 2a: issue triage (D4) with its decisions-log line `issue triage: closed duplicate #N of #M; closed resolved #K (<evidence>); to user #…; non-standard #…`; no-op clause (D5)
- [x] `asd-phase-scope.md` step 4: issue rows at the gate; dispositions written on acceptance (D5); Inputs/Exit list the issue reads and writes
- [x] `asd-phase-scope/SKILL.md` description names issue triage when self-hosting

### Task 5: Post-release close and PR references
AC-7.
Material risk: change: release sequence extension
- [x] `asd-phase-pr.md` open mode: included issues as `Refs #N`, never a closing keyword; merge mode step 2: close included issues after the release (D6)
- [x] `t_pr-description.md` "Related issues": `Refs #N` form
- [x] `asd-sprint/SKILL.md` Step 1: release retry also when an included issue is still open (D6)

### Task 6: Rename mirrors and flagged-choice acting site
AC-10, AC-11.
Material risk: artifact: decided rename and citation (D9, D10), verified by repo grep of every D9 form returning only the new heading
- [x] `asd-tester.md`, `providers.md` (role-row context ref), `asd-phase-impl-review/SKILL.md`, `asd-phase-impl-review.md` (4 sites), `runtime.js` `isTest` doc comment: D9 rename and `low` or `medium`
- [x] `asd-phase-impl.md` step 10: cite `checkpoints.md` "Gate policy" for the AC-11 check

### Task 7: AGENTS.md tail and README
AC-9, AC-13.
Material risk: artifact: mirror text, verified by `node tests/run.js` and `sync.js --check`
- [x] root `AGENTS.md` tail: heading and text state build `node .asd/sync.js --check` and lint `git diff --cached --check` per `commands.yaml`, run before reporting COMPLETED (AC-9)
- [x] `README.md`: scope/retro/pr phase rows, config schema `upstream_issues`, FAQ or feature line for upstream issues, D9 rename where cited

## Risks
- A false-positive duplicate close: comment links the original; the issue can be reopened.
- The 200-issue bound: stated at the gate when hit.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | Task 1, Task 2, Task 3, Task 4, Task 5, Task 6 |
| 2 | Task 7 |

- Task 7 mirrors the wording Tasks 1-6 land.
- Orchestrator, after each wave: `node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply <stale generated views>`, commit.

## Out of scope
- Consumer-side duplicate search before publishing.
- A runtime helper for triage; the sweep is orchestrator prose.
