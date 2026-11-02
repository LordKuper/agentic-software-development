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

## 2026-10-30 — sprint opened

- **Decision**: Sprint 030-english-only-asd-issues opened on workflow `lite` (user choice); 029 archived by this scope's closure write.
- **Rationale**: Single-rule change; design documents are disabled in config, so `standard`'s design block would collapse anyway.
- **Affected docs**: `state.json`

## 2026-10-30 — approach choice

- **Decision**: Approach A — a `language-policy.md` row makes ASD-repo issue titles, bodies and comments English always; retro publishes in English, intake rewrites non-English marker issues in place, #67–#72 rewritten at this intake. Manual issues out of scope.
- **Rationale**: One rule home, no new dependency, fixes both new and already-published issues (`research.md` Approaches).
- **Affected docs**: `research.md`
- 2026-10-30 — retro intake: HEAD e522bfe8; candidates 029#A-3, 029#P-1, 029#P-2 re-verified unresolved (`custom-common-rules.md`, `custom-coding-rules.md`, `asd-phase-scope.md` step 2 hold no such rule); none resolved
- 2026-10-30 — issue translation: #67 #68 #69 #70 #71 #72 rewritten in place to English (title and body, marker and field order kept) per the stage (a) answer, before triage
- 2026-10-30 — issue triage: closed duplicate none; closed resolved none (#67 1-hour cap at `runtime.js` MAX_NEGATIVE_TTL_MS; #68 no ignore entry in asd-init/migrations; #69 no suite-op duty in `asd-tester.md`; #70 no rotation command in `runtime.js`; #71 no mockup round in scope; #72 safety valve still degrades the pre-authoring run); to user #67 #68 #69 #70 #71 #72; non-standard none
- 2026-10-30 — audit freeze: `documents.audit` auto → true (scope changes retro publish and intake behaviour); no optional document enabled, no document skip to offer

## 2026-10-30 — retro intake dispositions

- **Decision**: Included 029#A-3, 029#P-1, 029#P-2 (AC-4..AC-6) and issues #68, #69, #70, #72 (AC-7..AC-10); rejected issues #67 and #71. Each row and issue was shown with root cause or expected saving, proposed edits and consequences; criterion cost 0 iterations / 0 fix rounds for every new criterion (none existed).
- **Rationale**: User choice per item; the recommendation to defer the issues to a dedicated sprint was declined for #68, #69, #70, #72.
- **Affected docs**: `sprint.md`, `.asd/project/retro-backlog.md`
- 2026-10-30 — issue dispositions: #68 include AC-7; #69 include AC-8; #70 include AC-9; #72 include AC-10; #67 reject; #71 reject

## 2026-10-30 — scope gate

- **Decision**: `sprint.md` AC-1..AC-11 accepted as one sprint, no split; the open Russian issues were rewritten in English at this intake.
- **Rationale**: Explicit user `accept` at the write-then-review-accept scope gate.
- **Affected docs**: `sprint.md`, `research.md`
