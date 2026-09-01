[REVIEW-impl-testing]: APPROVE

# Review — testing

- **Phase**: impl-review
- **Iteration**: 3 (severity floor: `high`)

## Tooling limitation (disclosed up front)

My toolset this invocation is read-only (`Read`/`Glob`/`Grep` only; no shell), and my agent contract forbids shell commands. I therefore **could not execute** `node tests/run.js`, `git diff 3524b39...HEAD`, or the greps. Everything below is verified by reading the actual files at HEAD. Where a claim in `test-plan.md` is only confirmable by execution, I say so rather than asserting I re-ran it.

Static corroboration of the Suite run record:
- `tests/run.js` contains exactly **77 top-level `test(` registrations** (grep `^test\(` → 77) — matches the recorded `77/77` and the recorded "same registration count": the hardening is an in-place extension of the existing fixture at `tests/run.js:950-984`, adding **no** new registration.
- `.asd/release-manifest.json` carries `canon_hashes` for exactly the 15 agents + 17 skills (lines 30-61) and `upstream_hashes` entries for both canon files touched this round (`.asd/templates/t_test-plan.md:144`, `.asd/workflows/asd-phase-impl.md:152`), so the two existing ledger tests would fail loudly had `191ad36` not recomputed. `tests/run.js` is not manifest-tracked, so its edit needs no recompute. Consistent with a green run.
- `.asd/templates/t_test-plan.md:5` reads `delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)` — the Documentation iter-02 fix is present as recorded.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings at or above the `high` floor | — |

## Answer to the direct question: is the new coverage-guard genuine, and can it pass despite a real gap?

**Genuine — yes, for what it covers.** `tests/run.js:956-974` (current lines; the plan's `958-969` is slightly off) builds `targets` from `parsed.items.map(item => item.target)`, then walks `.asd/agents` and `.asd/skills` with `fs.readdirSync` **directly off disk**, not through `sync.js`. The constructed strings match `sync.js`'s own `target` field verbatim (`.asd/sync.js:1229`, `path.relative(...).replace(/\\/g,'/')`) and mirror `buildSyncPlan`'s own target construction (`.asd/sync.js:1103-1104`, `1116-1117`), including the `.agents/skills/` (not `.codex/`) asymmetry. A dropped `.asd/agents` or `.asd/skills` enumeration now fails loud instead of shrinking `parsed.items` to a still-all-`current` set. The claim holds for those two trees.

**Yes, a passing-despite-gap scenario is constructible.** `buildSyncPlan` walks **three** conditional canon dirs, not two: `.asd/hooks` (`.asd/sync.js:1120-1131`) also emits full-file targets `.claude/hooks/<name>.js` and `.codex/hooks/<name>.js`, and `.asd/hooks/session-start.js` exists at HEAD. The guard never enumerates it. So: rename/guard-break the hooks block (or flip its `existsSync`, or change the `.endsWith('.js')` filter) → `parsed.items` loses both hook targets → every remaining item is still `current` → the agents/skills expectations all still hold → **test green on a genuinely partial plan**, the exact vacuous-pass class the fix set out to close. Same, weaker, for the four unconditional items (`CLAUDE.md`, `AGENTS.md`, `.claude/settings.json`, `.codex/hooks.json`) — unguarded, though unconditional pushes make silent loss less plausible; note `AGENTS.md` vanishing entirely would also be masked by the `SELF_SOURCED_ALLOWLIST`. Secondarily, the guard is one-directional (canon → plan): an orphan generated file with no canon source is invisible to it.

I rate this **medium** ("weak edge-case coverage" — a guard against a hypothetical future regression in `sync.js`, which this sprint did not touch at all), so under the iteration-3 `high` floor it does **not** count toward the verdict. Recorded below as a sub-floor observation, not a finding.

## Sub-floor observations (do NOT count toward verdict; carry forward, do not fix this iteration)

1. *(medium)* `tests/run.js:962-974` — coverage guard omits the `.asd/hooks` tree that `buildSyncPlan` also enumerates; the vacuous-pass gap is closed for 2 of 3 conditional canon dirs, while `test-plan.md:38,57` states it "genuinely closes the vacuous-pass gap" without qualification. A four-line third loop over `.asd/hooks/*.js` asserting `.claude/hooks/<name>.js` + `.codex/hooks/<name>.js` would make the claim true.
2. *(low)* `test-plan.md:57` — "14 agents, 16 skills at HEAD" is wrong in both counts: HEAD has **15** `.asd/agents/*.md` and **17** `.asd/skills/*/SKILL.md` (corroborated by the 32 `canon_hashes` entries at `.asd/release-manifest.json:30-61`). The conclusion drawn is unaffected, but the parenthetical weakens the "independently inspected" record.
3. *(low)* `test-plan.md:57` cites the guard as `tests/run.js:958-969`; actual span is `956-974`.

## Coverage ledger

### File coverage

Diff file list inferred from the Suite run's commit record (`5f39c1a`, `0e6cd2e`, `0781e9b`, `191ad36`) and cross-checked against file contents at HEAD, since I cannot run `git diff`; the five below match the stated count.

| File | Status |
|---|---|
| `tests/run.js` | checked — fixture `950-984` read in full; guard logic, target-string construction, allowlist, drift filter all verified against `.asd/sync.js:1090-1168,1229`; 77 registrations counted |
| `.asd/templates/t_test-plan.md` | checked — line 5 vocabulary fix present; template's own Risk/Removed/Added/Suite/Defects/Manual sections unchanged and still match what `test-plan.md` fills in |
| `.asd/workflows/asd-phase-impl.md` | checked — "persistent docs" wording at lines 12/35/41/69; prose-only, no test-relevant behaviour change; stub-marker protocol at 80-81 intact |
| `CHANGELOG.md` | checked — migration entry (numbered list, `git mv design docs`, split-brain warning) is documentation content; no acceptance-testable behaviour, `none` decision at `test-plan.md:41` is honest |
| `.asd/release-manifest.json` | checked — ledger recompute only; both changed canon files have `upstream_hashes` entries and the 32 `canon_hashes` entries are structurally intact; hash values not recomputable without shell, but the two existing ledger unit tests are the correct-level check and gate the suite |
| `.asd/sprints/001-rename-design-to-docs/test-plan.md` (primary input, outside diff scope) | checked — every row, removal, no-test decision, and Suite run claim assessed |

### Rule coverage

| Rubric item | Status |
|---|---|
| Risk fit (cheapest reliable check per row) | pass — all 12 rows sit at the correct tier: prose/path renames get static grep (no executable logic to unit-test), JSON frontmatter gets `sync.js --check`'s own parse, the hash ledger reuses two existing unit tests, provider-view drift stays at the existing unit fixture. No e2e proposed where a unit would do; no unit proposed for a boundary risk |
| Removals | pass — none removed; the "no test made obsolete" reason holds, since all 77 tests cover `sync.js`/`update.js` engine behaviour and no engine file is in the diff |
| No-test decisions | pass — each `none` is true. The strongest one (`test-plan.md:42`, rejecting a standing "no bare `design/`" content guard) now argues on **value** (allowlist decay vs one-time rename), not the earlier false "structurally impossible", and cites real precedent lines in `tests/run.js` proving feasibility. Honest reasoning, defensible call |
| Regression proof | n/a — no `D-N` defects recorded this sprint (`test-plan.md:69`), so no fail-first obligation. The hardening is not a code-defect fix; its "proof" is the constructive argument I re-derived above (independent enumeration), which I verified holds for agents/skills |
| Coverage (every AC has a behavioural check) | pass — AC-1/AC-7 covered by completeness greps 1-2, AC-3/AC-4 (must-NOT-rename) by the inverse over-rename grep, AC-8 by the README/AGENTS mirror row. The exact grep commands are recorded verbatim and reproducible, which is what makes them auditable even though I could not execute them |
| Edge cases | pass — separator-blind `design\` variant (R-10), same-line in/out-of-scope collisions (R-1), sprint-local vs persistent doc-root ambiguity, and the `AGENTS.md` self-sourced special case are each explicitly handled. Guard's own `readdirSync` filters (`.endsWith('.md')`, `existsSync(SKILL.md)`) correctly exclude non-targets |
| Meaningfulness | pass — the strengthened assertion tests observable output of a separate process (`--check` JSON), not the implementation's internals; it would have failed on the real iter-01 defect (`--check` always exits 0). No coverage-number-driven test, no implementation re-assertion |
| Determinism | pass — `execFileSync` on a local process, no sleeps, no network, no timing. `targets` is a `Set` and the drift assertion compares against `[]`, so no order dependence; `readdirSync` order is irrelevant to both loops. `// flaky-pattern:` marker not warranted anywhere |
| Stub-resolution verification | pass — `.asd/project/stubs.md:16` records "no open stubs"; every `TODO(sprint-` hit repo-wide is rule/agent prose *describing* the marker format (`code-style.md:54`, `git-strategy.md:27`, workflow/agent files), none is an in-code marker. No orphan marker, no undeleted stub |
| Manual verification (last resort) | n/a — no visual UI, no third-party live integration, no ux-feel surface. `test-plan.md:73`'s "none" is correct; automation/static verification is possible and was used |

## Verdict
APPROVE

## Next action
Testing gate passes for iteration 3. No fix required from the dev before this reviewer. Carry sub-floor observation #1 (`.asd/hooks` unguarded in the coverage guard) into the sprint's follow-up backlog or the next sprint touching `.asd/sync.js` — it is not actionable under this iteration's `high` floor and must not reopen the impl loop. If the PM wants the `test-plan.md:57` count/line-number inaccuracies (#2, #3) corrected, that is a documentation-reviewer call, not a testing blocker.

## Escalations
None.

## Manual verification
None required — see Rule coverage.
</content>
