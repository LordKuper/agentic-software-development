---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), state.json (state), reviews/ (verdicts)
---

# Decisions Log

Per-sprint, append-only. Never edited or removed. Created at `scope`, archived with the sprint.

## Entry format

```markdown
## YYYY-MM-DD — <one-line summary>

- **Decision**: <what was decided> (≤3 sentences)
- **Rationale**: <why> (≤3 sentences)
- **Affected docs**: <links> (unrestricted)
```

A no-op skip or other zero-content decision uses the one-line form instead:

```markdown
- YYYY-MM-DD — <phase> skipped: <reason>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, or `.asd/project/stubs.md`. Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-09-03 — Sprint 004 scope accepted

- **Decision**: User accepted `sprint.md` with AC-1..AC-11: test-authoring bar and hypothetical-risk criterion in `impl-test`, APPROVE latch (cleared by a red full suite), impl-review change-surface rule, two-tier test running with one full suite at the end of impl-review and a canonical impacted-set definition, raised agent model/effort tiers, five internal code reviewers merged into `asd-reviewer-correctness` + `asd-reviewer-efficiency`, tightened `code-style.md` §7 documentation rules, and a new `Context hygiene` section in `core.md`. Two earlier drafts were reversed on user feedback: the test audit stays in impl-review (not relocated to impl-test), and two-tier test running is adopted (not rejected).
- **Rationale**: Cut review-loop and test-run cost without weakening any gate, while raising the quality floor of each remaining dispatch. Slug `004-review-scoping-and-test-audit` still fits the widened scope; no rename.
- **Affected docs**: [`sprint.md`](sprint.md), [`state.json`](state.json)
- **Documents config**: only `audit` enabled; `prd`, `ux_spec`, `adr`, `c4` disabled — design/design-review/design-promote will collapse into a single no-op at design entry.
