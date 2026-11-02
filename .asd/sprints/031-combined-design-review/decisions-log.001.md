---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), .asd/project/retro-backlog.md (retro row dispositions), state.json (state), reviews/ (verdicts)
---

# Decisions Log

Per-sprint, append-only. Never edited or removed. Created at `scope`, rotated at phase entry (`.asd/rules/artifact-layout.md` "Decisions log"), archived with the sprint.

## Entry format

```markdown
## YYYY-MM-DD — <one-line summary>

- **Decision**: <what was decided> (≤3 sentences)
- **Rationale**: <why> (≤3 sentences)
- **Affected docs**: <links> (unrestricted)
```

A no-op skip, other zero-content decision, dispatch routing line or failed-dispatch reconstruction uses the one-line form instead:

```markdown
- YYYY-MM-DD — <phase> skipped: <reason>
- YYYY-MM-DD — route <taskIds>: <tier>, dispatch HEAD <sha>[; risk <declaration>]
- YYYY-MM-DD — reconstruction: landed <ids>; re-dispatched <ids>
- YYYY-MM-DD — stall: <agent> <dispatch ids>
- YYYY-MM-DD — cleanup checkpoint <sha>
- YYYY-MM-DD — cleanup: removed <paths/symbols>; reverted <ids or none>; verified <build, lint, tests @sha>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-11-02 — sprint opened

- **Decision**: Sprint 031-combined-design-review opened on branch `sprint/031-combined-design-review` from main at c95fe2dc; workflow `lite`.
- **Rationale**: Workflow choice answered by the user: "lite"; sprint 030 closed by the closure write (10f5458e), its release v14.2.0 complete.
- **Affected docs**: `state.json`

## 2026-11-02 — approach choice

- **Decision**: Approach A: reuse `asd-reviewer-combined` in `standard`'s design-review (roster `combined` + `external`), always; no new agent, no config key, no migration.
- **Rationale**: User answer: "A: переиспользовать combined (рекомендую)"; it cuts one of two equal-tier internal dispatches per iteration and the duplicated documentation checks, and the manifest emitter already supports combined in design-review.
- **Affected docs**: `research.md`

## 2026-11-02 — retro intake verified at HEAD

- **Decision**: Verified at HEAD 10f5458e: 030#A-1 open (`review-policy.md` "Verify before applying" checks the premise only); 030#A-2 open (`asd-phase-impl.md` step 7 syncs after the round's last canon-editing dispatch, after the tester chain); 030#A-4 open (`custom-common-rules.md` has no MSYS rule; the same failure recurred at this sprint's closure check); 030#P-1 covered by `sprint-lifecycle.md` "Decomposition rules" bullet 1 (020-multi-workflow-lite#P-1, every restating site a repo grep finds); 030#P-2 open (`sprint-lifecycle.md` "Scope amendment" has no contradiction check).
- **Rationale**: Issues: #74 open (`runtime.js` `buildInvocation` passes every path in one `git diff`; Windows caps `lpCommandLine` at 32,767 chars, https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw; live: git 2.55 `diff` rejects `--pathspec-from-file`, so only chunking applies); #75 open (no rename-map collapse); #76 open (only `asd-phase-pr.md` has the content-scoped re-run skip); #78 open (`reviewFindings` accepts any header of 3+ columns and reads location by position).
- **Affected docs**: `.asd/project/retro-backlog.md` (on acceptance)

- 2026-11-02 — issue triage: rewrote none; closed duplicate #77 of #74; closed resolved none; to user #74 #75 #76 #78; non-standard none

## 2026-11-02 — scope gate

- **Decision**: Scope accepted as `sprint.md` AC-1..AC-10, one sprint, no split; audit frozen `true` (`auto`: roster, gate and runtime contract changes are not mechanical).
- **Rationale**: User answer: "По рекомендации (рекомендую)"; criterion cost per new AC-1..AC-10: 0 iterations charged (lower bound), 0 fix rounds charged.
- **Affected docs**: `sprint.md`, `state.json`

## 2026-11-02 — retro intake dispositions

- **Decision**: 030#A-1 include AC-5; 030#A-2 include AC-6; 030#A-4 include AC-7; 030#P-1 reject (covered by `sprint-lifecycle.md` "Decomposition rules" bullet 1); 030#P-2 include AC-8.
- **Rationale**: User answer at the scope gate: "По рекомендации (рекомендую)", each row shown with cause, edits and consequences.
- **Affected docs**: `.asd/project/retro-backlog.md`, `sprint.md`

- 2026-11-02 — issue dispositions: #74 include AC-9; #78 include AC-10; #75 defer; #76 defer
