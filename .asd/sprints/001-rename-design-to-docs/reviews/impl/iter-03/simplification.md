[REVIEW-impl-simplification]: APPROVE

# Review — simplification

- **Phase**: impl-review
- **Iteration**: 3
- **Severity floor**: high (low/medium dropped; over-engineering + structure/cohesion checklist hits remain undroppable `critical`)

## Findings

| # | Severity | Location | Category | Description | Suggested fix |
|---|---|---|---|---|---|
| — | — | — | — | no findings at or above floor; no over-engineering or structure/cohesion checklist item tripped | — |

Both iter-2 findings verified resolved, and resolved *without* added complexity:

- **iter-2 #1 (vocabulary consistency)** — resolved. A repo-wide grep for the old root spellings (`design/product|architecture|ux`, "design docs", "persistent `design/`") returns zero hits anywhere in `.asd/rules/`, `.asd/templates/`, `.asd/agents/`, `.asd/workflows/` — remaining hits live only in `.asd/sprints/**` and `.asd/project/decisions-log.md` (out of scope; append-only historical record). `.asd/templates/t_test-plan.md` now says "persistent docs"; `.asd/workflows/asd-phase-impl.md:68` carries the renamed `docs/architecture/tech-reference/<tech>-<version>.md`. Fixed by word substitution only — no glossary file, no indirection layer, no shared "docs root" placeholder token introduced.
- **iter-2 #2 (CHANGELOG guard)** — **guard held**. The migration content is a plain 4-step numbered list inside the existing `## Unreleased` → `### Changed` bullet in `CHANGELOG.md`, followed by one warning paragraph about the `/asd-update` → `/asd-sync` split-brain window. Confirmed no escape hatch was built: no `MIGRATION.md` or any `migrat*` file exists anywhere in the repo (glob), no `scripts/` directory, no new skill/command, and `.asd/release-manifest.json`'s `managed_paths` gained no entry (still the same 7) and its top-level key set is unchanged (8 keys). The step-1 sub-bullets (the "you already have a `docs/`" case) are substantive correctness — they prevent a real silent `docs/design/...` nesting — not speculative branching.

**`tests/run.js` coverage-guard block (lines 956–974): proportionate, no complexity added.** It is 14 lines inline inside the existing `--check` test, and it clears every trap I was watching for:

- No new helper, no new abstraction, no new fixture layer — two plain `for` loops over `fs.readdirSync`, asserting membership in a `Set` built from `parsed.items`.
- No new dependency: reuses `fs`/`path` already imported at module top.
- Not a "helper wrapping one stdlib call" — it is assertion code at the call site, not a wrapper.
- The apparent duplication of `buildSyncPlan()`'s enumeration is the *point*, not a smell: enumerating from disk independently of `sync.js` is exactly what makes the guard non-vacuous, and the comment states that reason rather than restating the code (so it does not trip "comment that restates code").
- Not "defensive code for an impossible-by-contract case" — a canon directory silently dropping out of `buildSyncPlan()` is a plausible regression, and the pre-existing drift filter passes vacuously against it.

Scope-limited note (not a finding): the guard covers the agents and skills trees only, not every planned target class. That is a coverage-breadth question owned by the Testing reviewer; from a simplification standpoint the narrower guard is the *correct* choice — it buys the real regression protection without growing a generalized plan-completeness framework.

**Cross-reviewer guard**: I found no fix proposed elsewhere in this diff that would itself add an abstraction, layer, or dependency. Nothing here requires Complication Approval.

## Coverage ledger

### File coverage

| File | Status |
|---|---|
| `.asd/release-manifest.json` | checked — change is hash-ledger refresh only; verified no new top-level key, no new `managed_paths` entry, no new `model_families` alias. Cannot trip any rubric item. |
| `.asd/templates/t_test-plan.md` | checked — read in full (58 lines); vocabulary-only change to the `responsibility` block/prose; no new section, no new template variable, no new indirection. |
| `.asd/workflows/asd-phase-impl.md` | checked — read in full (162 lines); path-referent update (`docs/architecture/tech-reference/...`); no new step, mode, gate, agent, or config flag added to the workflow. |
| `CHANGELOG.md` | checked — read in full; migration guidance restructured in place as a numbered list; guard against new file/script/command verified externally (glob + manifest). |
| `tests/run.js` | checked — coverage-guard block at 956–974 read in context, plus full-file scan for helper/abstraction growth. |

### Rule coverage (over-engineering checklist — critical, undroppable)

| Rubric item | Status |
|---|---|
| Interface with exactly one implementer | pass — no interface/type introduced anywhere in the diff |
| Generic with exactly one concrete type parameter | pass — no generics; JS test code and Markdown/JSON only |
| Factory for fewer than three classes | pass — no factory or constructor indirection introduced |
| Plugin system with no plugin | pass — no extension point added |
| Abstraction with no second use case | pass — the coverage guard is inline assertion code, deliberately not extracted; no shared "docs root" token introduced for the rename |
| Premature config flag (no caller chooses non-default) | pass — no flag, option, or config key added (`release-manifest.json` top-level keys unchanged; `managed_paths` unchanged) |
| Defensive code for impossible-by-contract case | pass — the coverage guard defends a plausible regression (a canon dir dropping out of `buildSyncPlan()`), which the pre-existing drift filter passes vacuously; CHANGELOG step-1 branch covers a real consumer state |
| Helper that wraps one stdlib call without added value | pass — no helper added; guard calls `fs.readdirSync`/`fs.existsSync` directly at the assertion site |
| Inheritance depth ≥ 3 without polymorphic dispatch | n/a: no classes or inheritance in scope |
| Framework wrapping a framework | pass — test file remains the zero-dependency `test()`/`assert` runner; nothing layered on top |
| Mock of a mock in tests | pass — guard reads the real repo tree and the real `sync.js --check` output; no mock introduced |
| Comment that restates code | pass — comment at 956–960 states the *why* (vacuous-pass hazard, independent enumeration), not the what |
| Dead code left "in case we need it" | pass — no commented-out, unreferenced, or "future" code added; no orphaned old-root text left behind |

### Rule coverage (structure / cohesion checklist — critical, undroppable)

| Rubric item | Status |
|---|---|
| God / sprawling type (≥2 unrelated responsibilities / independent reasons to change) | pass — no type added. `tests/run.js` gained assertions inside an existing test whose single responsibility (verify `--check` reports no drift) is unchanged: enumerating targets and asserting they are current are the same reason to change. `asd-phase-impl.md` gained no new responsibility. Size growth alone does not flag. |

### Rule coverage (generic + cross-reviewer)

| Rubric item | Status |
|---|---|
| Complexity vs value — does each complication earn its weight? | pass — 14 inline test lines buy a real non-vacuity guarantee; CHANGELOG prose buys migration correctness at zero structural cost |
| Cross-reviewer guard (another reviewer's fix that itself adds complexity) | pass — no complexity-adding fix present in this diff |
| Escalation triggers (`review-policy.md`) — new abstraction/layer/dependency/scope/contract change | pass — none triggered; no Complication Approval required |

## Verdict

APPROVE

## Next action

Reviewer done. No fixes required from simplification; sprint does not route back to `impl` on my account. My prior-iteration guard against a separate `MIGRATION.md`/script/command is confirmed held — if a later iteration reintroduces one, it must come to the user as a Complication Approval (new artefact + new maintenance surface for content that fits in the changelog).

## Escalations

None.
</content>
