[REVIEW-impl-quality]: APPROVE

# Review — quality

- **Phase**: impl-review
- **Iteration**: 3 (severity floor: `high`)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings at or above floor (`high`) | — |

## Verification notes (why each iter-02 fix holds)

**`tests/run.js:956-983` — coverage guard.** Verified line by line against `.asd/sync.js:1090-1119` (`buildSyncPlan`) and `sync.js:1229` (`runCheck`):
- The guard's enumeration mirrors `buildSyncPlan`'s exactly: same `.endsWith('.md')` filter and `f.slice(0, -3)` stem for agents, same `fs.existsSync(<name>/SKILL.md)` gate for skills. No off-by-one in the stem slice (`.md` = 3 chars).
- Target-string format matches. `runCheck` emits `target: path.relative(repoRoot, item.targetPath).replace(/\\/g, '/')`, so the guard's forward-slash literals (`.claude/agents/${name}.md`, `.codex/agents/${name}.toml`, `.claude/skills/${name}/SKILL.md`, `.agents/skills/${name}/SKILL.md`) match on Windows too. The Codex skill path correctly uses `.agents/skills/`, not `.codex/skills/`.
- The defect class it targets is genuinely closed for agents/skills: an empty `items` array, a dropped agents/skills branch in `buildSyncPlan`, or a missing `target` field now all fail the guard rather than passing vacuously. `readdirSync` on a missing canon dir throws (fails loud), so the guard cannot be silenced by canon disappearing.
- Guard (membership) + the existing drift filter (status) compose correctly: every canon-derived target is proven both planned and `current`.

**`CHANGELOG.md:8-16` — restructured migration entry.** Content is complete after the reflow; nothing lost or garbled versus the dense-bullet version:
- Branch A (no `docs/`): `git mv design docs` — correct semantics.
- Branch B (existing `docs/`): the "do NOT `git mv design docs`, it nests to `docs/design/...`" warning is intact and technically accurate (git mv into an existing directory moves rather than renames), plus the per-subtree command and the pre-existing-collision caveat.
- The three-subtree list `design/product design/architecture design/ux` is exhaustive — `artifact-layout.md:45-61` and `:70-77` define `docs/` as exactly those three subtrees in both decomposition modes, with no root-level files, so nothing is silently left behind at the old root.
- The `commands.yaml` step names exactly the two aliases that embed a path (`designmd-lint`, `designmd-export`); `designmd-install`/`-diff` carry no path (`t_commands.yaml:20-22`), so their omission is correct, not an oversight. The "never touched by `/asd-update`" claim checks out: `managed_paths` (`release-manifest.json:7-15`) is `.asd/rules|templates|agents|skills|workflows|hooks|sync.js` only — `.asd/project/` is excluded.
- Split-brain paragraph retains all three load-bearing elements: the window (between step 3 and step 4), the direction (rules say `docs/`, generated views still say `design/`), and the failure mode (silent split corpus, no crash, nothing auto-migrates).
- Markdown nesting is valid: `  1.` sublist and the trailing paragraph both sit at the `- ` bullet's content indent (2), sub-bullets at 5 match `  1. `'s content column — the warning renders inside the entry, not detached from it.
- Contract check: `backward_compat: migration` (`.asd/project/config.yaml:33`) requires a documented migration path for a breaking change; this entry supplies it. Satisfied.

**`.asd/release-manifest.json`** — consistent with the other four files and nothing else. `.asd/templates/t_test-plan.md` (`:144`) and `.asd/workflows/asd-phase-impl.md` (`:152`) are both still present in `upstream_hashes` (not dropped, which would silently degrade a consumer's next `/asd-update` into `conflict-foreign`). `tests/run.js` and `CHANGELOG.md` are outside `managed_paths`, so correctly absent from both ledgers; neither is a `canon_hashes` key (that map covers agent/skill sources only). `schema_version`/`asd_version`/`model_families`/`managed_paths` unchanged. Ledger accuracy itself is machine-enforced by `tests/run.js:1318-1339`.

**`.asd/templates/t_test-plan.md:5`** — reads `delegates_to: plan.md (tasks), persistent docs (requirements), ...`. Correct final state: reworded to the vocabulary-neutral term rather than reverted to `design/` or mechanically flipped to `docs/`.

**`.asd/workflows/asd-phase-impl.md:35,41`** — both now read "persistent docs" (`:35` blocker definition, `:41` dev-autonomy scope), matching `:69`'s instruction text. Real path references elsewhere in the file (e.g. `:68` `docs/architecture/tech-reference/...`) correctly use the new root.

## Below-floor observations (informational — do NOT count toward DoD, per iteration floor `high`)

- `medium` — `tests/run.js:961-974`: the coverage guard covers the agents and skills canon trees but not the third full-file tree `.asd/hooks/*.js` (`sync.js:1120-1131` → `.claude/hooks/<n>.js`, `.codex/hooks/<n>.js`) nor the four fixed plan targets (`CLAUDE.md`, `AGENTS.md`, `.claude/settings.json`, `.codex/hooks.json`). Dropping the hooks branch from `buildSyncPlan` would still pass green — the same vacuity class, one tree narrower. Optional hardening: add a hooks loop and a fixed-target `assert.ok(targets.has(...))` set.
- `low` — `tests/run.js:951`: `const { execFileSync } = require('node:child_process')` shadows the identical module-level import at `:12`. Redundant, harmless (block-scoped, declared before use).
- `low` — `tests/run.js:981-982`: `SELF_SOURCED_ALLOWLIST` exempts `AGENTS.md` from *any* status, so `missing` would also pass. Pre-existing, not introduced by this diff; could be narrowed to `status === 'modified-foreign'`.

## Coverage ledger

### File coverage
| File | Status |
|---|---|
| `.asd/release-manifest.json` | checked |
| `.asd/templates/t_test-plan.md` | checked |
| `.asd/workflows/asd-phase-impl.md` | checked |
| `CHANGELOG.md` | checked |
| `tests/run.js` | checked |

### Rule coverage
| Rubric item | Status |
|---|---|
| Bugs — off-by-one | pass (`run.js:965` `slice(0,-3)` verified against `sync.js:1102`) |
| Bugs — null/undefined paths | pass (`item.target` always present from `runCheck`; missing canon dir throws rather than yielding `undefined`) |
| Bugs — race conditions | n/a: single-threaded synchronous test code, no concurrency introduced |
| Bugs — unhandled errors | pass (`execFileSync`/`readdirSync` throw → test fails loud; runner at `:1370-1378` catches per-test and sets non-zero exit) |
| Bugs — resource leaks | n/a: no handles/sockets/db connections opened in the diff |
| Bugs — timezone/locale assumptions | n/a: no date/time or locale-sensitive logic in the diff |
| Security — secrets in code or logs | pass (no credentials, tokens, or URLs with secrets added) |
| Security — injection (SQL/command/XSS/path traversal) | pass (`execFileSync` with an argv array, no shell; all paths built from `REPO_ROOT` + `readdirSync` output, no user input; CHANGELOG shell snippets are documentation for the human operator, no interpolation) |
| Security — auth/authorization bypass | n/a: no auth surface in the diff |
| Security — input validation at trust boundary | pass (`--check` output parsed with `JSON.parse` inside a test harness; malformed output throws) |
| Security — crypto misuse | n/a: no crypto added; existing sha256 ledger use unchanged by this diff |
| Contracts — API signature drift from ADR | n/a: `documents.adr: disabled` in this repo (`AGENTS.md`); no exported `sync.js`/`update.js` signature changed |
| Contracts — schema migration reversibility | pass (manifest `schema_version` unchanged at 1; ledger edits are hash-value updates, `git revert`-able) |
| Contracts — breaking change w/o migration when `backward_compat != none` | pass (`backward_compat: migration`; `CHANGELOG.md:8-16` documents the full migration path — both branches, collision caveat, ordering, failure mode) |
| Best practices — idiomatic Node/test style | pass (assertions carry explanatory messages; guard enumerates from disk independently of the system under test, which is the correct way to avoid a self-referential vacuous assertion) |
| Best practices — framework cross-file consistency (`AGENTS.md` hard rules) | pass (no rule/agent/skill roster, phase list, model tier, or config-schema change in this diff → no README.md sync obligation; canon edits are to `.asd/templates` + `.asd/workflows`, whose ledger entries were updated) |
| `.asd/project/custom-common-rules.md` | n/a: file does not exist in this repo |
| `.asd/project/custom-coding-rules.md` | n/a: file does not exist in this repo |

## Verdict
APPROVE

## Next action
Quality reviewer done for iteration 3. No fixes required from this reviewer; no route back to `impl` on Quality's account. PM aggregates with the other reviewers' iteration-3 verdicts for impl-review DoD.

## Escalations
None.
</content>
