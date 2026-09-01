---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests
  excludes: task breakdown, requirements, review verdicts, code
  delegates_to: plan.md (tasks), docs/ docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint 001-rename-design-to-docs

## Change surface

11 commits, 91 files changed (658 insertions, 458 deletions), `git diff main...HEAD --stat`:

- `.asd/rules/*.md` (9 files) — prose/path rename, docs-root segment `design/` → `docs/`
- `.asd/templates/*` incl. `external-review/t_prompt-external-impl.md` (10 files) — path/prose rename, backslash-spelled command aliases
- `.asd/agents/*.md` (14 files) — path/prose rename, incl. 3 write-access allowlist lines
- `.asd/skills/*/SKILL.md` (6 files) — path/prose rename inside JSON frontmatter `description` fields
- `.asd/workflows/*.md` (7 files) — path/prose rename, no generated counterpart
- `.asd/project/config.yaml` — comment + prose rename
- `.asd/release-manifest.json` — hash ledger recompute only (no hand edit)
- `README.md`, `AGENTS.md` — mirror rename
- `CHANGELOG.md` — new migration entry (content addition, not a rename)
- `.claude/agents/*.md`, `.codex/agents/*.toml`, `.claude/skills/*/SKILL.md`, `.agents/skills/*/SKILL.md` — regenerated provider views (sync.js output, not hand-written)

No file under `.asd/sync.js` or `.asd/skills/asd-update/update.js` (the two engines `tests/run.js` covers) appears in the diff. Confirmed by `git grep -l design .asd/sync.js .asd/skills/asd-update/update.js tests/run.js` → no matches in any of the three: the rename touched zero engine code.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `.asd/rules/*.md` rename (Task 1) | in-scope/out-of-scope `design/` occurrences on adjacent or same lines, regex sweep corrupts `design`-phase paths | static (repo-wide grep with fixed exclusion set) | none | No executable logic — a prose/path string change. Completeness already verified mechanically in impl Task 11 via two grep patterns (`design/` and `design\\`) over a fixed exclusion set, re-run here independently (see Suite run) with zero unexplained hits. A unit/property/component test cannot express "is this markdown string correct" more reliably than the grep already does. |
| `.asd/templates/*` incl. backslash-spelled command aliases (Task 2) | separator-blind occurrences (`design\\ux\\DESIGN.md`) invisible to a `design/` grep | static (second grep pattern `design\\`) | none | Same reasoning — impl Task 11 ran a second, separator-aware grep specifically to close this gap (audit R-10). Re-verified independently below. |
| `.asd/agents/*.md` write-access allowlists (Task 3) | a missed rename silently revokes an agent's write permission to the promoted doc, surfacing sprints later | static (targeted line-level grep against audit.md's per-file line list) | none | This is a permission-string content risk, not a behaviour a unit test can exercise — there is no code path in this repo that reads/enforces these allowlist strings at runtime (they are consumed by an LLM reading its own prompt in a downstream project, not by any engine in `tests/run.js`'s coverage). Re-confirmed by inspection during this pass: all three lines carry `docs/product/...` etc., none still read `design/`. |
| `.asd/skills/*/SKILL.md` frontmatter (dispatch-trigger `description` strings) (Task 4) | malformed JSON edit breaks dispatch on both providers | static (JSON parse) | none | `node .asd/sync.js --check` parses every skill's frontmatter as part of computing sync status; a parse failure would surface as a build failure, not a silent pass. Build gate below is green, so all 6 edited `SKILL.md` frontmatters parse. No new test needed — `sync.js --check`'s own JSON parsing is the correct-level check and it already ran. |
| `.asd/workflows/*.md` (Task 5) — no sync target at all (audit G-10) | `sync.js --check` cannot see this directory; a stale rename here is invisible to the build gate | static (repo-wide grep, same exclusion set) | none | Same as rules/templates — covered by the grep re-run below, which does not exclude `.asd/workflows/`. |
| `.asd/release-manifest.json` hash ledger recompute (Task 10) | hand-edit would corrupt the hash ledger; stale `upstream_hashes` would make a consumer's `update.js` silently skip renamed files | unit (existing) | keep | Already covered by the two existing `tests/run.js` cases "release-manifest.json: every canon_hashes entry matches the actual file" and "...every upstream_hashes entry matches the actual file" — both ran green in this suite pass, proving the ledger is internally consistent post-recompute. No new test needed. |
| Provider view regeneration `.claude/`, `.codex/`, `.agents/` (Task 9) | drift between canon and generated view | unit (existing, sync fixtures) + build (`sync.js --check`) | keep | These are sync.js output, not hand-written — no independent test risk beyond what `sync.js --check` already verifies (per phase brief). Build gate below reports `ok: true`, all touched targets `current`. |
| `CHANGELOG.md` migration entry (Task 7) | new prose content, not a rename — could be wrong/misleading guidance | manual read | none | Pure documentation content with no acceptance-testable behaviour; verified by inspection during this pass, matches plan.md Task 7's required elements (breaking-change framing, `git mv design docs` migration steps, split-brain window note). Not a candidate for automated test — no runtime behaviour to assert. |
| Whole-sprint regression risk: could `design/` as the root spelling silently reappear in a future change | future dev accidentally reintroducing `design/` into a rule/template/agent/skill/workflow prose or path, unnoticed because it's not code | considered: static architecture check as a new `tests/run.js` fixture | none (deliberately not added) | Rejected. `tests/run.js`'s existing fixtures are scoped to `.asd/sync.js`/`update.js` behaviour via synthetic in-memory fixtures — they do not, and structurally cannot without new test infrastructure, assert content of the ~40 hand-authored `.asd/rules|templates|agents|skills|workflows` files (that would require a new fixture class: "grep the live repo tree for a banned string," which is a different kind of test than anything currently in the suite — a Simplicity Default trigger for new test infrastructure, requiring Complication Approval, not something to add unilaterally here). It would also be low value: this string only reappears via a hand-edit of markdown prose, which impl-review's documentation/quality reviewers already read line-by-line every sprint: cheaper, already-in-place coverage for a low-probability content regression. Decision: no test added; if a future sprint wants a standing repo-content guard, it should go through Complication Approval as new test infrastructure, not be smuggled in here. |

## Removed tests

None. No test in `tests/run.js` was made obsolete, duplicate, or otherwise stale by this change — the suite's 77 tests all cover `.asd/sync.js`/`update.js` engine behaviour, none of which the rename touched. Confirmed by full green run (see Suite run) with identical pass count/names to the pre-sprint baseline noted in `plan.md` Task 11.

## Added tests

None. See Risk → check decisions — every material risk in this sprint is already discharged by an existing mechanical check (impl's own repo-wide grep, `sync.js --check`'s JSON-parse-as-part-of-status-computation, or the two existing hash-ledger unit tests), and the one candidate new check (a standing "no bare `design/`" content-guard fixture) was deliberately rejected as new test infrastructure out of proportion to a one-time rename's regression risk.

## Suite run

- Command: `test` — `node tests/run.js`
- Result: pass — 77/77 passed, 0 failed, 0 skipped
- Lint: `git diff main...HEAD --check` — pass, exit 0, no whitespace errors
- Build: `node .asd/sync.js --check` — pass, exit 0, `"ok": true`; all touched `.claude/`/`.codex/`/`.agents/` targets report `status: "current"`. `AGENTS.md` reports `status: "modified-foreign"` — expected and correct: `self_hosting: enabled` makes `AGENTS.md` self-sourced/hand-edited per `AGENTS.md`'s own documented rule, not a sync target; this status is unrelated to the rename and does not fail the build gate (`ok: true`, exit 0).
- Independent re-verification of impl Task 11's completeness grep (re-run fresh in this phase, not merely trusted): `git grep -n "design/"` repo-wide excluding `.asd/sprints/**`, `CHANGELOG.md`, `decisions-log.md`, filtered against the documented exclusion classes (`<sprint>/design/`, `reviews/design/`, `asd-phase-design*`, `design/design-review` phase pair, `design-system*`, `design-principles*`, `t_design-md-delta.yaml`) → 7 residual hits, all inspected and confirmed legitimate out-of-scope: 4 in `.asd/project/decisions-log.md` (prose narrating the rename itself, append-only per plan.md's AC-7 exclusion), 2 in `.asd/rules/artifact-layout.md:31,41` (`<sprint>/design/`, `reviews/design/iter-NN/` — sprint-local draft paths, explicitly out of scope per plan.md Task 1), 1 in `external-review/t_prompt-external-impl.md:15` (`design/doc content` — the "or" pair explicitly called out as not-in-scope in plan.md Task 2). Zero unexplained hits.

## Defects

None found.

## Manual verification (optional)

None. This sprint has no visual UI, no third-party live integration, and no UX-feel surface — it is a textual rename of infrastructure prose/paths, fully covered by the static checks above.
