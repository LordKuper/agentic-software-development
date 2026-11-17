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

## 2026-11-17 — sprint opened

- **Decision**: Sprint 035 opened on `sprint/035-verification-hardening` with workflow `lite`; documents frozen audit=true (scope changes gate behaviour), prd/ux_spec/design_system/adr/c4=false, cleanup=true, user_gates=adaptive.
- **Rationale**: Workflow choice answered by the user: "lite"; sprint 034 closed by the closure write (471a6afe), its release v14.6.0 complete.
- **Affected docs**: `state.json`

## 2026-11-17 — approach chosen

- **Decision**: Approach A: all seven strands in this sprint; latch clearing, checklist trigger matching and the base-branch reviewer context are `runtime.js` mechanics with tests, the rest rule/agent prose. FR-1 limited to production executable files; FR-4 window 3 sprints, `last_hit` = a reviewer finding citing the item, `critical` items never removal candidates.
- **Rationale**: User answers at the approach-choice gate and the requirements/refinement interviews; precedents in research.md Findings (Gerrit NO_CODE_CHANGE, Danger.js path rules, pull_request_target, hit-rate caveat).
- **Affected docs**: `research.md`
- 2026-11-17 — issue triage authorised: add label asd-retro to #120
- 2026-11-17 — issue triage: rewrote none; closed none; to user #120; non-standard none; project to user none (project list empty after the [asd-retro] filter)
- 2026-11-17 — retro intake verification @471a6afe: 034#A-1 open (`timing --bogus 1` exits 0, no warning); 034#A-3 open (sprint-lifecycle.md "Operation timing" suite scope lists impacted|full only, runtime accepts named); 034#P-1 open (asd-phase-impl.md has no load-check rule; tests/run.js D13 test exists); 034#P-2 open (asd-dev.md has no AC re-read rule); 034#P-3 open (artifact-layout.md "Tech reference docs" and t_tech-reference.md record no default-target or state mutation)

## 2026-11-17 — scope gate and retro intake dispositions

- **Decision**: Scope accepted as one sprint, AC-1..AC-14, no split. Retro rows 034#A-1, A-3, P-1, P-2, P-3 included as AC-9..AC-13; issue #120 included as AC-14. No row closed, none upstream (self_hosting).
- **Rationale**: User answers at the scope gate ("Принять одним спринтом") and the retro-intake dispositions (all "Включить"); cost per included criterion: 0 iterations charged, 0 fix rounds charged (new criteria). Every AC deliverable by impl under the self-hosting allowlist (`.asd/` canon, `tests/**`, README); AC-2's checklist ships as a template, its consumer file created lazily.
- **Affected docs**: `sprint.md`, `.asd/project/retro-backlog.md`
- 2026-11-17 — issue dispositions: #120 include AC-14
- 2026-11-17 — audit frozen true: scope changes gate, review and test-routing behaviour (documents.audit auto)
