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
| 2 | 7347537fa851ae8970cf24306b323be77e8b5474 | delta since entry 1 (impl review-fix iter-1) |

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

### Entry 2 (delta since entry 1 — impl review-fix iter-1)

Delta scope: 18 files, agent-file cleanups / SSoT rule fixes / setup-skill AC-3 completion / one
centralized `sync.js --apply` re-render (see dispatcher's change-surface list). No new application
behaviour — same "no application code, prose + auto-recomputed ledgers only" character as entry 1.
But `reviews/impl/iter-1/testing.md` (T-1..T-7) reopened entry 1's own no-new-test reasoning on three
points where an automated check was genuinely available and skipped, and flagged entry 1's record
itself as inaccurate on four points. Each is re-judged here against the actual `tests/run.js`
assertions (not assumed):

- **T-1 (add)** — the 8 reviewers' + `asd-advisor`'s read-only contract (no `Write`/`Edit` tool,
  `sandbox_mode: read-only`) was asserted nowhere; only file-renders/is-`current` was covered. Added
  a static test parsing every read-only agent's frontmatter, directory-driven off `.asd/agents/*.md`
  filenames (`asd-external-review` + `asd-reviewer-*` + `asd-advisor` = 9), not a hardcoded list —
  `tests/run.js` "read-only agents (8 reviewers + asd-advisor): no Write/Edit tool, codex
  sandbox_mode read-only".
- **T-3 (add)** — README.md's/AGENTS.md's stated agent count (16) vs `.asd/agents/` directory count
  was an unasserted narrative claim, same directory-driven-invariant shape already used 300 lines
  earlier in `tests/run.js` for the sync-plan coverage guard. Added
  "README.md / AGENTS.md agent-count claims match the actual .asd/agents/*.md file count".
- **T-4 (add)** — the drift assertion's `SELF_SOURCED_ALLOWLIST` exempted `AGENTS.md` from the
  `current` check entirely, so the sprint's own DoD claim ("`AGENTS.md` re-baselined, not merely
  tolerated") had no automated backing. Verified `AGENTS.md`'s actual `--check` status is now
  `current` (Task 13's re-baseline landed in entry 1) — the exemption was no longer needed, so it
  was removed rather than hardened: the test now requires every item `current` with no allowlist.
  Fails at parent `317aa50` (`AGENTS.md` was `modified-foreign` there); passes at current HEAD —
  genuine fail-first regression guard, taken.
- **T-5 (add)** — the ledger-consistency test recomputes and compares every *recorded*
  `canon_hashes`/`upstream_hashes` entry, which is vacuous for a *missing* entry — exactly the risk
  a new agent file introduces (verified present for `asd-advisor` in entry 1, but by manual check,
  not an assertion). Added "release-manifest.json canon_hashes has an entry for every
  .asd/agents/*.md file", scoped to the agents tree specifically (where this sprint's actual risk
  lives, and where the key-derivation is a simple `agents/<name>.md` string, unlike the recursive
  templates/ tree which was not touched this sprint and is left alone to avoid an untested,
  overreaching guard).
- **T-2, T-6, T-7** — not code fixes; record corrections only, applied directly below (Manual
  verification section, Risk → check decisions rows, Suite run section).

No test was removed or found to no longer earn its keep in this delta.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `.asd/agents/asd-advisor.md` (new) | frontmatter fails to parse / doesn't generate a Claude+Codex pair | static (sync.js render + generic per-agent `--check` assertion) | none | already covered by `tests/run.js`'s directory-driven agent-coverage assertion (`.asd/agents/*.md` enumerated from disk, not hardcoded) — confirmed green |
| `.asd/agents/asd-advisor.md` + the 8 reviewer agent files (AC-6 read-only contract) | a read-only agent's frontmatter silently gains a write tool or drops `sandbox_mode: read-only` | static (frontmatter parse + tool-list/sandbox_mode assertion) | **add** (entry 2, T-1) | previously unasserted — `--check` only verified the file renders/is `current`, not its tool contract; added directory-driven test (9 read-only agents derived from `.asd/agents/*.md` filenames) |
| `.asd/agents/asd-architect.md`, `asd-ba.md`, `asd-pm.md`, `asd-ux-designer.md` (gate-table/dispatch prose edits) | frontmatter still valid, generated views still render | static (same generic per-agent assertion) | none | same coverage as above; content is prose, no logic to unit-test |
| `.asd/rules/checkpoints.md`, `core.md`, `language-policy.md`, `providers.md`, `sprint-lifecycle.md` (gate-mechanic rewrite) | dangling references to dropped c4 gate / stale approve-before-write phrasing | manual grep sweep (impl Task 12, already performed) | none | pure prose read by agents at dispatch time — no executable path in this repo parses or validates rule-doc content; nothing for an automated test to assert against |
| `.asd/workflows/asd-phase-*.md` (8 files: gate-row updates, new advisor-dispatch mentions) | workflow orchestration text drifts from the rules it implements | manual cross-file consistency check (impl, already performed) | none | same — orchestration is prose consumed by the agent runtime, not by any test-runner-executable code path |
| `.asd/skills/asd-phase-design-promote/SKILL.md` | thin trigger delegates correctly to the updated workflow | none | none | single-line delegation pointer, unchanged mechanism |
| `.asd/release-manifest.json`, `.asd/sync-state.json` (recomputed ledgers) | stale *recorded* hash entry silently misclassifies a future upstream change | unit (existing) | keep | already covered — `release-manifest.json: every canon_hashes/upstream_hashes entry matches the actual file` recomputes and compares; confirmed green. Corrected (entry 2, T-6): this recompute-and-compare check does cover every edited rule doc/workflow's `upstream_hashes` freshness — entry 1's "nothing for an automated test to assert against" (below) understated this |
| a *missing* `canon_hashes` entry for a new agent file (T-5) | new agent silently has no ledger entry; existing check above is vacuous for absence, not staleness | static | **add** (entry 2, T-5) | added "release-manifest.json canon_hashes has an entry for every .asd/agents/*.md file" — verified present for `asd-advisor` (entry 1) is now an assertion, not a manual check |
| `AGENTS.md`, `README.md` (cross-file consistency prose, incl. agent-count claim) | roster/gate-table drift vs actual agent/rule files | manual cross-file check (impl, already performed) + static (agent-count claim only) | **partially add** (entry 2, T-3) | the agent-count claim (README "dispatches N specialized agents", AGENTS.md "Agents (...) — N:") is a directory-driven invariant like the sync-plan coverage guard already in `tests/run.js` — added "README.md / AGENTS.md agent-count claims match the actual .asd/agents/*.md file count". Remaining prose (roster tables, gate descriptions, `checkpoints.md` mirror rows) has no comparable single-number invariant to assert and stays a manual cross-file check — residual risk accepted, not a gap |
| `.asd/rules/checkpoints.md`, `core.md`, `language-policy.md`, `providers.md`, `sprint-lifecycle.md` (gate-mechanic rewrite) — restated for entry 2 (T-6 correction) | dangling references to dropped c4 gate / stale approve-before-write phrasing | manual grep sweep (impl Task 12) **+ static** (`upstream_hashes` freshness, existing) | none | corrected from entry 1: "nothing for an automated test to assert against" was inaccurate — every edited rule/workflow file carries an `upstream_hashes` entry asserted fresh by the existing ledger-consistency test; that check catches a hash mismatch (file changed but ledger not updated), not prose *correctness*, which remains manual |
| generated `.claude/agents/`, `.codex/agents/`, `.claude/skills/`, `.agents/skills/`, `AGENTS.md` views | drift between canon and generated/self-sourced view | build (`node .asd/sync.js --check`) | keep, **hardened** (entry 2, T-4) | corrected from entry 1: "byte-for-byte" was not true for `AGENTS.md` — it was allowlisted out of the drift check entirely (`SELF_SOURCED_ALLOWLIST`), so the DoD's "re-baselined, not merely tolerated" claim had no automated backing. Verified `AGENTS.md`'s `--check` status is genuinely `current` now (Task 13's re-baseline); removed the allowlist exemption so the test requires every item `current` with none exempted — fail-first: fails at parent `317aa50`, passes at HEAD |

## Removed tests

None. No test in this sprint's change scope was found trivial, duplicate, mock-confirming,
implementation-coupled, or flaky.

## Added tests

Entry 1: none. Entry 2 (per `reviews/impl/iter-1/testing.md` T-1/T-3/T-5), all in `tests/run.js`:

| Test | Regression proof |
|---|---|
| `read-only agents (8 reviewers + asd-advisor): no Write/Edit tool, codex sandbox_mode read-only` | n/a — new invariant, no prior code path exercised it; verified it fails if a write tool is injected into any of the 9 agents' `claude.tools` (manually mutated `asd-advisor.md`'s fixture during authoring, reverted) |
| `README.md / AGENTS.md agent-count claims match the actual .asd/agents/*.md file count` | n/a — new invariant; verified it fails on a count mismatch by manually editing the asserted number during authoring, reverted |
| `release-manifest.json canon_hashes has an entry for every .asd/agents/*.md file` | n/a — new invariant; verified it fails when a `canon_hashes` key is deleted during authoring, reverted |
| `` `node .asd/sync.js --check` reports every item current (no drift), including AGENTS.md `` (hardened, not new) | fail-first — fails at parent `317aa50` (`AGENTS.md` was `modified-foreign`), passes at current HEAD after Task 13's re-baseline |

## Suite run

**Entry 1** (superseded by entry 2 below; kept for record):
- Command: `node tests/run.js`
- Result: pass — 80/80 passed, 0 failed, 0 skipped
- Lint / build: pass — `git diff --check` exit 0 (no whitespace errors); `node .asd/sync.js --check` `ok: true`, 0 items with non-`current` status (zero drift)
- HEAD: 54176d0172cd8d6683109d12c11c85f1eedf2c02 — corrected (entry 2, T-7): two sprint-artifact-only
  commits (`ea4a845`, and impl-review-fix commits) landed on top of this before entry 2 started; the
  result stayed representative (no code changed underneath it), but the stamped HEAD undersold how
  stale the record was by the time entry 2 opened.

**Entry 2** (current, latest — this is the result the `pr` phase compares against):
- Command: `node tests/run.js`
- Result: pass — 83/83 passed, 0 failed, 0 skipped (80 pre-existing + 3 added this entry: T-1/T-3/T-5)
- Lint / build: pass — `git diff --check` exit 0 (no whitespace errors, warnings only for
  line-ending-normalization notices on unrelated files); `node .asd/sync.js --check` `ok: true`, 72
  items, 0 with non-`current` status (zero drift, `AGENTS.md` included — no longer exempted, T-4)
- HEAD: 03b492036c4c46f284651235daa980871e9d6aaa (commit `test: add read-only agent, roster-count,
  and ledger-completeness guards; harden AGENTS.md drift check`)

## Defects

None found.

## Manual verification (optional)

**Corrected (entry 2, T-2)**: entry 1's "Not applicable" claim went too far. Automation genuinely
cannot exercise these two rows — recorded here as a deferred-verification note, not silently
dropped:

| AC | What is unexercised | Why deferred | Expected observation (when it next runs) |
|---|---|---|---|
| AC-4 | The design phase's per-artifact write-then-review-accept rows (prd/design-system/ux-spec/adr moved rows in `checkpoints.md`) never ran live this sprint — `design`/`design-review`/`design-promote` collapsed to a no-op path because `documents.prd`/`ux_spec`/`adr`/`c4` are all disabled in this repo's config (decisions-log.md "design/design-review/design-promote skipped"). | No documents-enabled sprint exists yet in this repo to exercise the moved rows live; nothing in this sprint's scope can create one without going out of scope. | The next documents-enabled sprint's design phase should show: creator writes artifact to path → posts path + delta summary (no body dump) → user reviews the file → `accept` advances, feedback revises in place. |
| AC-5 | The write-then-review-accept revise-in-place loop (same file, no `-v2`, no duplicate drafts) never executed a revision round this sprint — every gate this sprint ran under the new mechanic (`plan`, `impl`, `impl-test`, this entry) was accepted on its first round, so the "loop until explicit `accept`" branch is unexercised. | Requires the user to give substantive feedback on a write-then-review artifact rather than accepting first-round; not something this test-plan can force without fabricating a rejection. | Next time a write-then-review artifact draws feedback: the creator edits the same file in place (no new path, no `-v2` suffix), reposts a delta summary of just the changed part, and the decisions-log gains exactly one entry at eventual `accept` (not one per round, per `checkpoints.md`'s resolved G-5). |

No visual UI, third-party live integration, or UX-feel surface was added this sprint — the two rows
above are process-mechanic gaps in live exercise, not ADVISORY-gate manual-QA items in the
evidence-routing sense.
