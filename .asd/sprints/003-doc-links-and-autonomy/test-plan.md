---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint 003-doc-links-and-autonomy

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 54176d0172cd8d6683109d12c11c85f1eedf2c02 | full change surface |

## Strategy summary

Every changed file this sprint is Markdown rule/agent/workflow/skill prose, a JSON agent-frontmatter
block, or JSON state/manifest data (`.asd/release-manifest.json`, `.asd/sync-state.json`, both
auto-recomputed ledgers). No application code, no runtime function, no business logic changed —
the repo's only executable surface (`.asd/sync.js`, `.asd/skills/asd-update/update.js`,
`.asd/hooks/*.js`) is untouched this sprint. Per code-style.md §17, the check ladder starts from
static/architecture checks; there is no logic here for a unit/property/component/e2e test to run
against — the prose changes a gate *mechanic* (approve-before-write → write-then-review-accept for
several rows) that only the runtime dispatch reads, not code `tests/run.js` exercises.

Two genuine automated-check questions were investigated rather than assumed:

1. **New agent `asd-advisor.md` frontmatter** — does `tests/run.js` already generically cover a
   16th agent file, or only a fixed enumerated list? Read the actual assertion
   (`tests/run.js:960-994`, `` `node .asd/sync.js --check` reports every item current... `` ):
   it does `fs.readdirSync(.asd/agents)` and asserts, for every `*.md` found, that
   `.claude/agents/<name>.md` and `.codex/agents/<name>.toml` are both in the sync plan and
   `current`. This is a directory-driven generic assertion, not an enumerated list — `asd-advisor.md`
   is automatically covered with zero new test code. Confirmed green in this run (below).
2. **Ledger consistency for `.asd/release-manifest.json` / `.asd/sync-state.json`** — does an
   existing assertion catch a desynced `canon_hashes`/`upstream_hashes` entry? Yes:
   `tests/run.js:1328-1349` (`release-manifest.json: every canon_hashes/upstream_hashes entry
   matches the actual file`) recomputes each ledger entry's hash from the actual file on disk and
   fails on any mismatch. This sprint's manifest edits (new `asd-advisor` canon_hash entry, bumped
   entries for the 4 edited agents) are exercised by this existing check, not a gap. No new
   assertion needed.

Conclusion: no-new-test decision for the whole sprint, per code-style.md §17 "skipping new tests is
allowed... when the change adds no behaviour [to tested code] or existing checks already cover the
risk." The actual verification for prose-correctness was impl Task 12 (grep sweep for dangling
references to the dropped c4 gate / old approve-before-write phrasing) and Task 13
(`node tests/run.js` + `node .asd/sync.js --check`, both already run there and re-run independently
in this phase below). AC-8 itself defines the sprint's verification bar as exactly these two
commands plus the grep sweep — this test-plan's suite run satisfies it without adding new test
surface.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `.asd/agents/asd-advisor.md` (new) | frontmatter fails to parse / doesn't generate a Claude+Codex pair | static (sync.js render + generic per-agent `--check` assertion) | none | already covered by `tests/run.js`'s directory-driven agent-coverage assertion (`.asd/agents/*.md` enumerated from disk, not hardcoded) — confirmed green |
| `.asd/agents/asd-architect.md`, `asd-ba.md`, `asd-pm.md`, `asd-ux-designer.md` (gate-table/dispatch prose edits) | frontmatter still valid, generated views still render | static (same generic per-agent assertion) | none | same coverage as above; content is prose, no logic to unit-test |
| `.asd/rules/checkpoints.md`, `core.md`, `language-policy.md`, `providers.md`, `sprint-lifecycle.md` (gate-mechanic rewrite) | dangling references to dropped c4 gate / stale approve-before-write phrasing | manual grep sweep (impl Task 12, already performed) | none | pure prose read by agents at dispatch time — no executable path in this repo parses or validates rule-doc content; nothing for an automated test to assert against |
| `.asd/workflows/asd-phase-*.md` (8 files: gate-row updates, new advisor-dispatch mentions) | workflow orchestration text drifts from the rules it implements | manual cross-file consistency check (impl, already performed) | none | same — orchestration is prose consumed by the agent runtime, not by any test-runner-executable code path |
| `.asd/skills/asd-phase-design-promote/SKILL.md` | thin trigger delegates correctly to the updated workflow | none | none | single-line delegation pointer, unchanged mechanism |
| `.asd/release-manifest.json`, `.asd/sync-state.json` (recomputed ledgers) | stale hash entry silently misclassifies a future upstream change | unit (existing) | keep | already covered — `release-manifest.json: every canon_hashes/upstream_hashes entry matches the actual file` recomputes and compares; confirmed green |
| `AGENTS.md`, `README.md` (cross-file consistency prose) | roster/gate-table drift vs actual agent/rule files | manual cross-file check (impl, already performed) | none | prose mirror of source-of-truth files; no executable assertion exists or is warranted for narrative accuracy |
| generated `.claude/agents/`, `.codex/agents/`, `.claude/skills/`, `.agents/skills/` views | drift between canon and generated view | build (`node .asd/sync.js --check`) | keep | run below; zero drift confirms every generated view matches its canon source byte-for-byte |

## Removed tests

None. No test in this sprint's change scope was found trivial, duplicate, mock-confirming,
implementation-coupled, or flaky.

## Added tests

None. Existing generic/ledger assertions in `tests/run.js` already cover every risk surface this
sprint touches (see Strategy summary).

## Suite run

- Command: `node tests/run.js`
- Result: pass — 80/80 passed, 0 failed, 0 skipped
- Lint / build: pass — `git diff --check` exit 0 (no whitespace errors); `node .asd/sync.js --check` `ok: true`, 0 items with non-`current` status (zero drift)
- HEAD: 54176d0172cd8d6683109d12c11c85f1eedf2c02

## Defects

None found.

## Manual verification (optional)

Not applicable. This sprint's only user-facing surface — the write-then-review-accept chat flow —
was already exercised live during this sprint's own scope/audit/plan phases (which ran under the
new mechanic per sprint.md's "Bootstrap note"), and `impl-test` does not re-run prior-phase manual
flows. No visual UI, third-party live integration, or UX-feel surface was added.
