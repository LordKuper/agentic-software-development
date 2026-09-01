[REVIEW-impl-quality]: CONCERNS

# Review — quality

- **Phase**: impl-review
- **Iteration**: 2
- **Severity floor**: medium (low findings listed for information only, excluded from the verdict)

> Method note: my tool policy is read-only with no shell, so I could not execute `git diff 2397633...HEAD`. I verified every scoped file's current on-disk state directly against the claimed fixes, against `.asd/rules/artifact-layout.md` (path SSoT), against the generated provider views, and against `.asd/sync.js`'s actual behaviour. Every rubric item below was resolved from file content, not from the diff summary.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `tests/run.js:950-965` | The strengthened drift assertion is correct Node and does catch the intended failure (a canon file edited without `sync.js --apply` shows as `stale` and lands in `drifted`), but it can pass **vacuously**: it only asserts that no *enumerated* item drifted, never that the plan enumerated anything or covered the canon set. `buildSyncPlan` documents this exact hole — `.asd/sync.js:1094-1095`: "A missing canon dir is still a normal, empty partial-plan outcome". So if `.asd/agents` or `.asd/skills` is renamed/dropped from enumeration (or a future canon class is added and never wired into `buildSyncPlan`), the committed `.claude/`/`.codex/`/`.agents/skills/` views for that tree go completely unchecked and this — the repo's only end-to-end drift guard — stays green. `assert.ok(Array.isArray(parsed.items))` does not close this; an empty or partial array satisfies it. | Assert coverage, not just cleanliness. Build the expected target set from disk (`fs.readdirSync('.asd/agents')` + `.asd/skills/*/SKILL.md`) and assert each expected target appears in `parsed.items` before filtering for drift; at minimum add `assert.ok(parsed.items.length >= <known floor>, 'sync plan enumerated nothing — check is vacuous')`. |
| 2 | low (not counted) | `tests/run.js:962-963` | `SELF_SOURCED_ALLOWLIST` exempts `AGENTS.md` at **any** status. `statusSelfSourcedManagedBlock` (`.asd/sync.js:1196-1203`) returns `'missing'` both when the file is absent and when the `<!-- asd:begin -->` markers are stripped — both are masked. The inline comment also asserts the status is `modified-foreign`, which is only true once the sync-state digest goes stale; a matching digest yields `current`. | Narrow to the expected status: `!(item.target === 'AGENTS.md' && item.status === 'modified-foreign')`, or drop the status claim from the comment. |
| 3 | low (not counted) | `tests/run.js:951` | `const { execFileSync } = require('node:child_process')` re-requires and shadows the module-level binding already imported at line 12. | Delete the inner require. |
| 4 | low (not counted) | `CHANGELOG.md:8` | Both migration branches are individually correct (see verification below), but they are asymmetric: `git mv design docs` moves the whole root, while `git mv design/product design/architecture design/ux docs/` moves only the three ASD-owned subtrees — anything else a consumer parked under `design/` (e.g. image assets referenced by promoted HTML) is silently left behind. Also, `git mv` with three sources aborts wholesale if a consumer never created one of them (e.g. no `design/ux` because `/asd-design-system` was never run) — loud, but undocumented. Considered and rejected as medium: this branch targets consumers already curating their own `docs/` tree, and the entry already tells them to resolve collisions file by file. | Add one clause: "check `design/` for anything outside those three subtrees and move it deliberately; drop any subtree you never created from the command". |

Explicitly dropped as nitpick (not raised as findings): duplicate section numbering in `tests/run.js` (two `## 7` headers, `6b` after `10`); `'node'` vs `process.execPath` inconsistency in `runHook`; `asd-phase-impl-review.md:77` wording "6 internal reviewers (…) + Performance" for what is 7; the `design/ docs` phrasing in the reverted `delegates_to` lines.

## Verification of the specific fix claims

- **`t_config.yaml:13` / `t_sprint.md:5` / `t_test-plan.md:5` reverts** — all three correctly read the sprint-draft form again (`# design/prd.html + persistent requirements`, `delegates_to: … design/ docs …`). Nothing else on those lines broke: `t_config.yaml:13` is still a valid YAML comment; both `delegates_to` scalars contain no `:` or `#` so the frontmatter still parses as plain scalars. `README.md:227` and `.asd/project/config.yaml:15` (outside my pathspec, checked anyway) match. No stale `docs/prd.html`-class string survives anywhere in canon or the generated views.
- **`t_plan.md:23-25` depth** — now `../../../docs/…`. From `.asd/sprints/<NNN-slug>/plan.md` that is `.asd/sprints` → `.asd` → repo root → `docs/…`. Correct, and consistent with `t_plan.md:5`'s `delegates_to: persistent docs` and with `asd-phase-plan.md:19` (plan reads persistent docs, not sprint drafts).
- **`CHANGELOG.md` migration** — both branches are valid git. `git mv design docs` renames when `docs/` is absent; `git mv design/product design/architecture design/ux docs/` is legal multi-source form (destination directory exists by the branch condition) and the entry states the `docs/product|architecture|ux` pre-existence caveat. The three subtrees do cover the whole documented layout (`c4/`, `adr/`, `api/`, `tech-reference/` all sit under `architecture/`). The `commands.yaml` alias step is real and necessary — `t_commands.yaml:21-29` now ships `docs\ux\DESIGN.md` / `docs/ux/DESIGN.md` while a consumer's own `commands.yaml` is never touched by `/asd-update` (`README.md:81-85`). Only finding #4 above remains.
- **`release-manifest.json` ledger** — not hand-edited: `--apply` calls `recomputeAndWriteHashLedgers` for the whole repo on every run (`.asd/sync.js:879-885`, `1356-1362`), and two integrity tests (`tests/run.js:1299-1320`) assert every `canon_hashes`/`upstream_hashes` entry against actual file bytes. Structural cross-check passes: every dual-tracked path carries the identical digest in both maps (`asd-reviewer-simplification`, `asd-init`, `asd-phase-impl-review`, …) — a partial hand-edit would have desynced them. Ledger completeness re-verified against disk: all 13 `.asd/rules/*`, 34 templates, 1 hook, both engines are present in `upstream_hashes`; no orphan entries.
- **No new over-rename introduced** — repo-wide grep for `design/(ux|product|architecture)` returns only intentional survivors: the `CHANGELOG` migration command, sprint-local `<sprint>/design/ux-spec.html` in `asd-ux-designer`/`asd-reviewer-ui`/`asd-architect`/`asd-phase-design` (all correct), and historical sprint artefacts. Inverse grep for `docs/(prd|adr|ux-spec|c4-full|design-md-delta)` returns zero canon hits.
- **Custom coding rule `custom-coding-rules.md:14`** — the two canonical agent/skill edits propagated: "Never modify code or persistent docs" is present in `.asd/`, `.claude/agents/`, and `.codex/agents/*.toml`; "seeds infrastructure-only persistent docs" is present in `.asd/`, `.claude/skills/`, and `.agents/skills/`. Sync was run.

## Coverage ledger

### File coverage
| File | Status |
|---|---|
| `.asd/agents/asd-reviewer-simplification.md` | checked — l.41 keeps sprint-local `<sprint>/design/prd.html, ux-spec.html, adr.html, c4-full/, design-md-delta.yaml` (correct, not over-renamed); l.98 "persistent docs" wording applied; propagated to both provider views |
| `.asd/release-manifest.json` | checked — see ledger verification above; valid JSON, `schema_version: 1`, `managed_paths` complete against disk, both hash maps mutually consistent |
| `.asd/rules/language-policy.md` | checked — l.8 "persistent docs" in the artifact matrix; no path token, no signal-token drift (`COMPLETED`/`APPROVE`/`CONCERNS` intact l.27) |
| `.asd/rules/review-policy.md` | checked — severity floor / cumulative budget table, verdict token grammar `[REVIEW-<phase>-<reviewer>]`, coverage-ledger gate, DoD table all internally consistent; matches `asd-phase-impl-review.md:18,36` |
| `.asd/skills/asd-init/SKILL.md` | checked — JSON frontmatter description l.4, seed paths l.58-60, `designmd-*` aliases l.107/109, c4 output l.117 all on `docs/`; correct (these are persistent-doc targets, not sprint drafts) |
| `.asd/templates/t_config.yaml` | checked — l.13 revert correct; whole file still valid YAML; `documents` group semantics unchanged |
| `.asd/templates/t_plan.md` | checked — l.23-25 depth correct; l.5 `delegates_to: persistent docs`; parser-critical checkbox rules block untouched |
| `.asd/templates/t_sprint.md` | checked — l.5 revert correct, frontmatter still parses |
| `.asd/templates/t_test-plan.md` | checked — l.5 revert correct; `Defects`/`Removed tests` table contracts consumed by `asd-phase-impl-test.md` unchanged |
| `.asd/workflows/asd-phase-impl-review.md` | checked — "persistent docs" at l.12/32; dispatch roster, iteration/floor logic, `NEXT: pr\|impl` return contract, ledger gate at step 6 all coherent |
| `.asd/workflows/asd-phase-impl-test.md` | checked — l.28 pathspec text (`consumer default excludes .asd/**`/`docs/**`; self-hosting includes repo minus project/sprints/generated) matches `external-review.md:44,51` exactly |
| `.asd/workflows/asd-phase-impl.md` | checked — l.68 `docs/architecture/tech-reference/…` matches `artifact-layout.md:141`; l.12/35 "persistent docs" |
| `.asd/workflows/asd-phase-plan.md` | checked — l.7/11/19/21 "persistent docs"; consistent with `t_plan.md`'s Context links |
| `CHANGELOG.md` | checked — finding #4 (low); Keep-a-Changelog structure and `Unreleased` placement intact; breaking change carries a migration path, satisfying `backward_compat: migration` |
| `README.md` | checked — l.227 matches `t_config.yaml:13`; folder map l.306-320 matches `artifact-layout.md`; update-safety table l.79-85 still names `docs/` as never-touched |
| `tests/run.js` | checked — findings #1 (medium), #2, #3 (low); no off-by-one; allowlist key form (`'AGENTS.md'`, bare relKey) matches `runCheck`'s `item.target`; `execFileSync` invoked without a shell, no injection surface |

### Rule coverage
| Rubric item | Status |
|---|---|
| Bugs — off-by-one / boundary | pass — only boundary logic in the diff is the `t_plan.md` relative-link depth (verified correct) and the drift filter (no index arithmetic) |
| Bugs — null / undefined / missing-file paths | pass — `parsed.items` guarded by `Array.isArray`; `manifest.canon_hashes \|\| {}` guards retained; `statusSelfSourcedManagedBlock` handles absent file |
| Bugs — race conditions / concurrency | n/a: diff is Markdown/YAML/JSON plus a synchronous single-process test runner; no async, no shared state |
| Bugs — unhandled errors / silent failure | finding #1 (vacuous-pass path is exactly a silent-failure mode); elsewhere pass — the runner catches per-test and sets `process.exitCode` |
| Bugs — resource leaks | pass — no handles/sockets/db; `mkdtempSync` temp dirs are intentionally leaked to the OS temp reaper, pre-existing and harmless |
| Bugs — timezone / locale / encoding | pass — no date or locale logic added; CRLF/BOM normalization paths untouched by this diff |
| Security — secrets in code or logs | pass — no credentials, tokens, or URLs with secrets introduced |
| Security — injection (shell / path / SQL / XSS / traversal) | pass — `execFileSync` with an argv array, no shell; `CHANGELOG` commands are literal `git mv` with no interpolation; `isSafeRelPath` traversal guards untouched |
| Security — auth / authorization bypass | n/a: no auth surface in this framework repo |
| Security — input validation at trust boundary | pass — the update/sync trust boundary (schema_version fail-closed, foreign-status refusal, force-only overwrite) is unchanged by this diff |
| Security — crypto misuse | pass — sha256 digests used only as content identity, no homebrew crypto, no key material |
| Contracts — API / signature drift vs ADR | n/a: `documents.adr: disabled` for this repo; the equivalent contract surface (README/rules/workflow mirrors) checked instead — see rows below |
| Contracts — verdict-token / phase-chain / roster mirrors | pass — `[REVIEW-impl-<reviewer>]` grammar identical in `review-policy.md:112-125` and `asd-phase-impl-review.md:18,36`; DoD reviewer set matches the dispatch list; `README.md:227` matches `t_config.yaml:13` |
| Contracts — migration reversibility | pass — `git mv` is fully reversible; the `--apply` hash-ledger recompute is idempotent and regenerable from disk |
| Contracts — breaking change without migration path (`backward_compat: migration`) | pass — `CHANGELOG.md:8` documents the BREAKING root move with an ordered, both-cases migration path and an explicit split-brain warning |
| Best practices — Node.js idiom (`tests/run.js`) | finding #3 (low, shadowed require); otherwise pass — `node:` prefixed core imports, `assert.deepStrictEqual` with message, `process.execPath` over PATH lookup |
| Custom rule — zero-dependency Node, no YAML parser (`custom-coding-rules.md:13`) | pass — no dependency added; no YAML parsing introduced |
| Custom rule — canon edit followed by `sync.js --apply` (`custom-coding-rules.md:14`) | pass — both canon agent/skill edits verified present in `.claude/`, `.codex/`, and `.agents/skills/`; hash ledgers recomputed accordingly |
| Custom rule — never hand-edit generated views (`custom-coding-rules.md:15`) | pass — no generated file in scope; provider views match canon content |
| Custom common rule — self-hosting vocabulary / scope (`custom-common-rules.md:12`) | pass — canonical/provider-view/consumer terminology used consistently in the edited prose |

## Verdict
CONCERNS: 1 (1 medium at floor; 3 low noted but excluded from the verdict per the iteration severity floor)

## Next action
Route to `impl` (review-fix mode) for finding #1 only: harden `tests/run.js:950-965` so the drift check cannot pass on an empty or partial sync plan (assert plan coverage against the canon file set, not just per-item `status`). Findings #2-#4 are optional pickups in the same touch — they must not, on their own, hold the gate. Re-enter `impl-review` via `impl-test` with a green `node tests/run.js`.

## Escalations
None. The fix is a local test assertion — no architecture change, no new abstraction, no contract break, no scope expansion beyond `sprint.md`.
</content>
