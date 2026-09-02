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
| 3 | 852e70bb5fa6c122643366e3120f9939193818ad | delta since entry 2 (impl review-fix iter-2) |
| 4 | 487e65fc81221b6ad91c06d19e28523f7c9db049 | delta since entry 3 (impl review-fix iter-3) |
| 5 | 1b9e49fd283ca7dca98c78eec19397e3b14fb4a7 | delta since entry 4 (impl review-fix iter-4) |

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

### Entry 3 (delta since entry 2 — impl review-fix iter-2)

Delta scope: 13 files — `reviews/impl/iter-2/testing.md` (T1-T4 from the review-fix note above,
already applied to `tests/run.js`/`test-plan.md`/`decisions-log.md` before this entry opened),
`checkpoints.md`/`core.md`/`sprint-lifecycle.md` gate-mechanic corrections, `ADVICE_NEEDED`
de-duplication in 4 agent files, `asd-concept`/`asd-design-system`/`asd-stack` skill edits, and a
centralized `sync.js --apply` re-render. Re-verified (not assumed) the four things this entry was
asked to check:

1. **`tests/run.js`'s read-only-agent test, `tools`-array guard** — read the actual assertion
   (`tests/run.js:1016`): `assert.ok(Array.isArray(meta.claude && meta.claude.tools), ...)` runs
   *before* the `Write`/`Edit`/`Bash` absence checks, so a deleted `claude.tools` key now fails loud
   instead of falling back to `[]` and passing vacuously. Confirmed non-vacuous by inspection of
   execution order (line 1016 before 1018-1024) — this was already fixed in the iter-2 review-fix
   round (review-fix note above, "testing #1"); nothing further needed this entry.
2. **Roster-count test, all 5 README claims** — read the actual assertion (`tests/run.js:1037-1071`):
   asserts `dispatches N specialized agents`, the word-form `"<Word> specialized agents are
   canonically defined"`, `N canonical agent specs`, both `N agent definitions` occurrences (via
   `matchAll`, asserted count === 2), and `AGENTS.md`'s `**Agents** (...) — N:` line — 5 README
   claims + 1 AGENTS.md claim, all compared against the live `.asd/agents/*.md` count. Confirmed
   complete; already fixed in iter-2 (review-fix note above, "quality #4").
3. **`readRaw` removal** — grepped the whole repo: zero occurrences in `tests/run.js` or any other
   executable file; the only remaining hits are inert prose mentions in sprint docs (this
   `test-plan.md`, `decisions-log.md`, `reviews/impl/iter-2/simplification.md`, and an archived
   sprint's review file) recording that the removal happened. Nothing broke — full suite run below
   confirms (83/83, same count as before removal, since `readRaw` had zero call sites left to lose
   coverage over).
4. **`core.md`'s `Lock in`/`Revise this section` token swap** — read the actual line
   (`core.md:57`): pure prose in a rule doc consumed by agents at dispatch time. Grepped
   `tests/run.js` for any assertion touching `core.md` content — none exists (the file greps
   `t_AGENTS.md`/`AGENTS.md` for a fixed string in an unrelated fixture-generation test, not
   `core.md`'s actual body). No executable path parses `core.md` for this token; prose-only,
   consistent with entries 1-2's finding for the rest of the gate-mechanic rewrite. No test added.
5. **`checkpoints.md`'s two new gate-table rows** (`/asd-concept`→concept.html,
   `/asd-stack`→stack.html) — same reasoning: `checkpoints.md` is read by agents at dispatch, not
   parsed by any test. `tests/run.js` has no assertion against `checkpoints.md` content. Prose-only,
   no test added — consistent with entry 2's identical row for the rest of `checkpoints.md`'s
   gate-mechanic rewrite (Risk → check decisions table above).
6. **`sprint-lifecycle.md`'s consult-cap fix + new "State recovery" carve-out sentence** — same
   reasoning: no executable path parses `sprint-lifecycle.md`; prose consumed by agent runtime only.
   Prose-only, no test added.

Conclusion: this delta needed zero new tests. The four hardenings requested for re-verification
(items 1-3 above) were already correctly and completely applied during the iter-2 review-fix round
itself — this entry's job was confirmation, not further code change, and confirmation is done by
reading the actual assertions/greps above rather than re-trusting the prior entry's own claim.

### Entry 4 (delta since entry 3 — impl review-fix iter-3)

Delta scope: 6 files — `.asd/release-manifest.json` (ledger re-render for the 5 edited canon files
below), `.asd/rules/checkpoints.md` (reworded "Approval recording" rule: one decisions-log entry per
accepted *gate* naming every covered path, not per artifact; new "Recording scope" clause
distinguishing sprint-phase gates from standalone skill gates run outside an active sprint),
`.asd/skills/asd-concept/SKILL.md` / `asd-design-system/SKILL.md` / `asd-stack/SKILL.md` (Phase 4/6
section loops converted from present-in-chat-then-write to write-first: each section is now written
to the target file on disk *before* the user is asked to lock in / revise, with a skeleton write
before the first section), `.asd/workflows/asd-phase-design.md` (one sprint-local `AC-2` citation
replaced with a canonical `checkpoints.md` reference — the "link-and-summary" rule, not a new rule).

This is the first delta since the write-then-review-accept mechanic landed (entry 1) where the
actual *user-facing behaviour* of a setup skill's section loop changed shape, not just gate
vocabulary — worth checking fresh rather than pattern-matching to entries 2/3's "prose-only"
conclusion.

1. **Does anything in `tests/run.js` verify a skill's section-loop write-order (write-before-lock-in,
   not lock-in-before-write)?** Grepped `tests/run.js` for any reference to `SKILL.md`, `checkpoints.md`,
   `Lock in`, or `write-then-review` (output above): the only `SKILL.md`-touching tests are (a) two
   fixture-render tests comparing a synthetic `canon/skills/demo-skill/SKILL.md` fixture against its
   generated `.claude`/`.agents` output — fixture content is static test data, unrelated to the 3
   real setup skills' bodies — and (b) the directory-driven skills-coverage assertion
   (`tests/run.js:977-979`) that only checks `.claude/skills/<name>/SKILL.md` and
   `.agents/skills/<name>/SKILL.md` exist in the sync plan and are `current` (byte-identical render of
   canon, nothing about the prose sequence inside). No test parses a real SKILL.md's Markdown body,
   walks its numbered Phase/bullet structure, or asserts one instruction precedes another semantically.
2. **Could a genuinely new automatable invariant be written here?** Considered and rejected: verifying
   "write happens before the lock-in question" would require either (a) parsing SKILL.md prose for
   ordering between two English sentences — a string-position heuristic, not a real invariant (would
   pass/fail on paraphrasing, not on behaviour), or (b) actually running the skill (dispatching a BA/
   architect/designer agent through Phase 4, simulating a mock user session, and asserting the target
   file's mtime/content changed before the lock-in prompt was emitted) — a live agent-dispatch
   simulation, which is new test infrastructure of a kind this repo has never had (no harness anywhere
   drives an agent skill end-to-end; `tests/run.js` only tests `sync.js`/`update.js`, per this sprint's
   Strategy summary and the project memory on this repo's test scope) and would be a Complication
   Approval-gated addition, not something to add unilaterally for a wording-order change. No code path
   simulates or replays a skill's phase sequence — only frontmatter + render is asserted, and that
   remains true after this delta exactly as before it. Conclusion: still prose-only, no new
   automatable invariant exists for this specific risk (write-before-lock-in ordering) — confirmed by
   inspection of the actual grep hits, not assumed by analogy to prior entries.
3. **`checkpoints.md`'s reworded "Approval recording" rule + new "Recording scope" clause** — grepped
   `tests/run.js` for `checkpoints.md` (output above): zero hits. Same as entries 2-3's finding for
   the rest of this file's gate-mechanic prose: read by agents at dispatch time, parsed by no
   executable path in this repo. Prose-only, no test added — this delta's specific new clauses (gate-
   level vs artifact-level entry granularity; sprint-phase vs standalone-skill decisions-log routing)
   don't change that; they're the same category of un-testable prose as every prior `checkpoints.md`
   edit this sprint.
4. **`asd-phase-design.md`'s `AC-2` → `checkpoints.md` citation swap** — a reference-target rename in
   a code comment-equivalent (a citation string), not a behaviour change; the underlying rule
   (link-and-summary, never a content dump) is unchanged. No test surface.
5. **`release-manifest.json` re-render for the 5 edited files** — covered by the existing
   ledger-consistency check (`release-manifest.json: every canon_hashes/upstream_hashes entry matches
   the actual file`), confirmed green below; no gap, same as every prior entry's identical finding.

Conclusion: this delta needed zero new tests. The write-first conversion is a genuine, deliberate
user-facing behaviour change, but it has no automatable invariant available without new agent-dispatch
simulation infrastructure — out of scope for a wording/ordering fix and not requested. Manual
cross-file consistency review (impl-review reviewers) remains the only verification for this class of
change, consistent with the existing Risk → check decisions row for these same 3 skill files (added
entry 3, row: "AC-3 completion: final gates converted to write-then-review-accept" — this delta
extends that same row's reasoning to the earlier per-section loop, not a new risk category).

### Entry 5 (delta since entry 4 — impl review-fix iter-4)

Delta scope: 5 files — `.asd/release-manifest.json` (ledger re-render), `.asd/rules/checkpoints.md`
(dropped the unreachable "if an active sprint happens to exist, append to its decisions-log.md"
branch from the standalone-skill "Recording scope" clause — standalone skill gates now unconditionally
never write to a decisions-log or advance `phase`), `.asd/skills/asd-concept/SKILL.md` /
`asd-design-system/SKILL.md` / `asd-stack/SKILL.md` (Phase 4/6 skeleton-write guarded to create-mode-
only, was unconditional and reachable in Edit mode — a genuine content-loss bug, since Edit mode means
the file already has real content the skeleton write would have clobbered; `asd-concept`/`asd-stack`
Skip option now deletes the section from disk instead of leaving an orphaned placeholder; `asd-stack`
Phase 7 loop-back now re-runs Phases 5-6 — including the per-tech approve-before-write micro-gate —
for affected tech entries before re-accepting, was silently re-accepting over stale derived artifacts;
`asd-design-system` Phase 7 loop-back now re-runs `designmd-lint` to a clean pass and Phase 5's
regeneration before re-accepting, same stale-derived-artifact bug; `asd-design-system`'s lint-before-
write Hard rule reworded from "before write" (contradicted the write-first per-section mechanic) to
"before Phase 5 regeneration and before Phase 7's accept gate").

Explicitly re-examined, not assumed from entries 2-4's pattern, per this entry's brief:

1. **Did anything add a simulation/parsing harness for SKILL.md phase logic?** Re-grepped
   `tests/run.js` for `SKILL.md`, `checkpoints.md`, `skeleton`, `Edit mode`, `create-mode`,
   `loop-back`, `Phase 7` (fresh grep, this entry, not carried over from entry 4's grep) — same two
   hits as entry 4: the two static fixture-render tests (`canonical skill -> Claude/Codex SKILL.md
   matches fixture`, lines 93/106, comparing a synthetic `demo-skill` fixture, unrelated to the 3 real
   setup skills' bodies) and the directory-driven skills-coverage assertion (lines 977-979, file-
   exists + `current`-status only). Zero hits for `checkpoints.md` content anywhere in `tests/run.js`.
   Confirmed: still true that no code path parses or simulates a real SKILL.md's phase logic — nothing
   in this delta (or any prior delta) added one.
2. **Fresh call, not a restated conclusion: given this round is genuine conditional logic (create-
   mode-only guards, re-run-on-loop-back requirements), not just gate vocabulary — is a cheap,
   non-heuristic, non-simulation check available now that wasn't before?** Considered specifically the
   option raised in the brief: a structural anchor-phrase check (e.g., assert the string "create mode"
   or "Edit mode" appears near "skeleton" in each of the 3 SKILL.md files) as a fail-first regression
   guard, the way entry 2's T-4 added a fail-first `AGENTS.md`-drift assertion. Rejected, on a
   materially different basis than "no infra exists" — the T-4 precedent doesn't transfer: T-4 asserted
   an *external, observable state* (`sync.js --check`'s computed `current`/`modified-foreign` status,
   a real value the render engine produces), not the *presence of specific wording* in prose the test
   itself would have to string-match. A "create mode" anchor-phrase test has none of a real invariant's
   properties: (a) it doesn't verify the guard actually gates the write — a SKILL.md could contain the
   phrase "create mode" anywhere (e.g. in this very entry's own risk-row prose if copied into the file)
   and pass vacuously; (b) it rot-fails on any correct rewording (e.g. "only if the target file doesn't
   already exist" is equivalent behavior, wrong test result); (c) it can't express the actual guard
   condition (file-existence-at-dispatch-time) at all — only a live dispatch checking the real
   filesystem state before/after Phase 4 could verify that, which is exactly the agent-dispatch
   simulation harness entry 4 correctly identified as out-of-scope new infrastructure. Concretely: the
   3 fixes this round (skeleton-write guard, Skip-deletes-section, Phase-7-reruns-regeneration) are
   each a runtime behavior conditioned on prior conversation/filesystem state (does the target file
   exist yet; did the user pick Skip; did a loop-back land in Phase 4 vs Phase 6) — none of that state
   exists at static-analysis time, so no string-level check on the SKILL.md file, however carefully
   anchored, can distinguish "the guard is present and correct" from "the guard's words are present but
   the logic is subtly wrong (e.g. inverted condition)." A test that can't fail on the actual bug this
   round fixed (an inverted or missing condition) while still passing on correct prose isn't a
   regression guard, it's decoration. Conclusion unchanged from entry 4, but arrived at via a different,
   round-specific argument (behavioral-invariant-expressibility, not merely "infra doesn't exist yet")
   as the brief asked for.
3. **`checkpoints.md`'s dropped unreachable branch** — same as every prior entry's finding for this
   file: zero `checkpoints.md` references anywhere in `tests/run.js`; prose consumed by agent runtime
   at dispatch time only.
4. **`release-manifest.json` re-render for the 5 files** — covered by the existing ledger-consistency
   check (`release-manifest.json: every canon_hashes/upstream_hashes entry matches the actual file`),
   confirmed green below.

Conclusion: this delta needed zero new tests, including after a fresh, round-specific re-examination
of the automatable-check question (not a default to entries 2-4's conclusion) — the behavioral fixes
in this round are runtime-state-conditioned, which no static string/structural check on SKILL.md prose
can express without becoming either vacuous or paraphrase-fragile; a real invariant still requires
agent-dispatch simulation infrastructure this repo doesn't have, unrequested and out of scope here.

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
| `.asd/skills/asd-concept/SKILL.md`, `asd-stack/SKILL.md`, `asd-design-system/SKILL.md`, `asd-phase-scope/SKILL.md` (AC-3 completion: final gates converted to write-then-review-accept) | gate-mechanic prose drifts from `checkpoints.md`'s SSoT | manual cross-file consistency check (impl-review reviewers) | none | prose consumed by the agent runtime; no executable path parses SKILL.md bodies; frontmatter render/`--check` already covered by the directory-driven skills assertion in `tests/run.js` |
| `.asd/agents/asd-architect.md`, `asd-ba.md`, `asd-pm.md`, `asd-ux-designer.md` (entry 3: `ADVICE_NEEDED` de-duplication) | frontmatter still valid, generated views still render; read-only/tool contract unaffected (none of these 4 are read-only agents) | static (same generic per-agent assertion + read-only-agent test, which correctly excludes these 4) | none | prose de-dup only, no frontmatter/tool change; confirmed still `current` via `sync.js --check` below |
| `.asd/release-manifest.json` (entry 3: centralized `sync.js --apply` re-render) | stale recorded hash entry for one of the 13 touched files | static (existing) | keep | already covered — `release-manifest.json: every canon_hashes/upstream_hashes entry matches the actual file`; confirmed green below |
| `.asd/rules/checkpoints.md` (entry 3: 2 new gate-table rows for `/asd-concept`→concept.html, `/asd-stack`→stack.html), `core.md` (entry 3: `Lock in`/`Revise this section` token swap replacing `accept` for per-section lock-in), `sprint-lifecycle.md` (entry 3: consult-cap counter-ownership fix + new "State recovery" carve-out sentence) | dangling references / stale token usage | manual grep + read of actual lines (this entry, items 4-6 above) + static `upstream_hashes` freshness (existing) | none | verified prose-only by reading the actual changed lines and confirming `tests/run.js` has zero assertions parsing these 3 files' content (only unrelated fixture-generation tests reference `core.md` by path) — same category as entry 2's identical row, extended to this delta's specific new lines rather than assumed to still apply |
| `tests/run.js` (entry 3: `readRaw` deletion, `tools`-array guard, `Bash` check, roster-count extension to 5 claims — all applied in the iter-2 review-fix round, before this entry opened) | test-file-only change could itself regress the suite | full suite run (this entry) | none, re-verified | re-ran `node tests/run.js` clean (83/83) in this entry to confirm the review-fix round's own test-file edits didn't break anything; see Suite run |
| `.asd/skills/asd-concept/SKILL.md`, `asd-design-system/SKILL.md`, `asd-stack/SKILL.md` (entry 4: Phase 4/6 section loops converted write-first — write to disk before the lock-in question, was present-then-write) | a skill silently reverts to lock-in-before-write, or the write-first ordering drifts from `checkpoints.md`'s mechanic | manual cross-file consistency check (impl-review reviewers) | none | genuinely re-investigated (entry 4 strategy, item 1-2): no executable path in this repo parses SKILL.md prose or simulates a skill's phase sequence — only fixture-render + frontmatter/`current`-status coverage exists; a real invariant would require new agent-dispatch simulation infrastructure, out of scope here. Same category as the existing "AC-3 completion" row above, extended to the earlier per-section loop |
| `.asd/rules/checkpoints.md` (entry 4: "Approval recording" reworded to gate-level entry granularity + new "Recording scope" clause) | decisions-log entries silently regress to per-artifact (not per-gate), or standalone-skill gates write to a nonexistent sprint's decisions-log | manual grep + read of actual lines (this entry) + static `upstream_hashes` freshness (existing) | none | prose-only, confirmed by grep — zero `checkpoints.md` references in `tests/run.js`; same as every prior entry's finding for this file |
| `.asd/workflows/asd-phase-design.md` (entry 4: `AC-2` citation replaced with canonical `checkpoints.md` reference) | dangling reference to a sprint-local AC number outside sprint scope | manual grep sweep | none | citation-target rename only, underlying rule unchanged; no test surface |
| `.asd/release-manifest.json` (entry 4: re-render for the 5 files above) | stale recorded hash entry for one of the 5 touched files | static (existing) | keep | already covered — `release-manifest.json: every canon_hashes/upstream_hashes entry matches the actual file`; confirmed green below |
| `.asd/skills/asd-concept/SKILL.md`, `asd-design-system/SKILL.md`, `asd-stack/SKILL.md` (entry 5: skeleton-write gated to create-mode-only, was unconditionally reachable in Edit mode — content-loss bug) | Edit-mode dispatch silently overwrites real section content with a placeholder skeleton | manual cross-file consistency review (impl-review reviewers) | none | genuinely re-investigated this entry (strategy items 1-2): no static check can express a runtime file-existence-at-dispatch condition without either being vacuous (word-presence only) or requiring an agent-dispatch simulation harness this repo doesn't have — same conclusion as entry 4's row above, reached via a fresh round-specific argument since this round is real conditional logic, not gate vocabulary |
| `.asd/skills/asd-stack/SKILL.md`, `asd-design-system/SKILL.md` (entry 5: Phase 7 loop-back now re-runs Phase 5-6 regeneration/lint for affected entries before re-accepting, was silently re-accepting over stale derived artifacts) | a revision round leaves `design-system.html`/`stack.html` stale relative to the just-revised source, but the gate re-accepts anyway | manual cross-file consistency review (impl-review reviewers) | none | same reasoning — re-run-on-loop-back is a runtime sequencing requirement, unverifiable by static SKILL.md parsing without simulating the dispatch |
| `.asd/rules/checkpoints.md` (entry 5: dropped unreachable decisions-log branch for standalone gates) | dangling/contradictory recording-scope clause | manual grep + read of actual lines (this entry) + static `upstream_hashes` freshness (existing) | none | zero `checkpoints.md` references in `tests/run.js`; same as every prior entry's finding for this file |
| `.asd/release-manifest.json` (entry 5: re-render for the 5 files above) | stale recorded hash entry for one of the 5 touched files | static (existing) | keep | already covered — `release-manifest.json: every canon_hashes/upstream_hashes entry matches the actual file`; confirmed green below |

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

Entry 3: none added. The iter-2 review-fix round's hardenings to the 3 tests above (`tools`-array
guard, `Bash` check, roster-count extended to 5 claims, `readRaw` deletion) were already applied and
recorded in the "Review-fix note (iter-2)" section below before this entry opened; this entry
re-verified them by reading the actual assertions (Entry 3 strategy, items 1-3) rather than adding
new test code.

Entry 4: none added. Investigated fresh whether the write-first section-loop conversion in the 3
setup skills introduces a check-ladder-eligible invariant (Entry 4 strategy, items 1-2) — concluded no
executable path exists to assert prose ordering without new agent-dispatch simulation infrastructure,
which is out of scope for this delta. No test removed.

Entry 5: none added. Re-examined fresh (not by analogy to entry 4) whether the round's genuine
conditional-logic fixes (create-mode-only skeleton guards, Phase-7-loop-back re-run requirements)
cross into check-ladder-eligible territory now that they're real behavior, not vocabulary (Entry 5
strategy, item 2) — concluded a structural anchor-phrase check would be vacuous-or-fragile, not a real
invariant, since none of the guard conditions exist at static-analysis time. No test removed.

## Suite run

**Entry 1** (superseded by entry 2 below; kept for record):
- Command: `node tests/run.js`
- Result: pass — 80/80 passed, 0 failed, 0 skipped
- Lint / build: pass — `git diff --check` exit 0 (no whitespace errors); `node .asd/sync.js --check` `ok: true`, 0 items with non-`current` status (zero drift)
- HEAD: 54176d0172cd8d6683109d12c11c85f1eedf2c02 — corrected (entry 2, T-7): two sprint-artifact-only
  commits (`ea4a845`, and impl-review-fix commits) landed on top of this before entry 2 started; the
  result stayed representative (no code changed underneath it), but the stamped HEAD undersold how
  stale the record was by the time entry 2 opened.

**Entry 2** (superseded by entry 3 below; kept for record):
- Command: `node tests/run.js`
- Result: pass — 83/83 passed, 0 failed, 0 skipped (80 pre-existing + 3 added this entry: T-1/T-3/T-5)
- Lint / build: pass — `git diff --check` exit 0 (no whitespace errors, warnings only for
  line-ending-normalization notices on unrelated files); `node .asd/sync.js --check` `ok: true`, 72
  items, 0 with non-`current` status (zero drift, `AGENTS.md` included — no longer exempted, T-4)
- HEAD: 03b492036c4c46f284651235daa980871e9d6aaa (commit `test: add read-only agent, roster-count,
  and ledger-completeness guards; harden AGENTS.md drift check`)
- Note: the review-fix note below records a *partial* interim run (80/83, 3 pre-existing failures
  from in-flight parallel canon edits) taken mid-round, before this entry's formal full run.

**Entry 3** (superseded by entry 4 below; kept for record):
- Command: `node tests/run.js`
- Result: pass — 83/83 passed, 0 failed, 0 skipped (no tests added or removed this entry; the 3
  tests hardened during the iter-2 review-fix round — `tools`-array guard, `Bash` check,
  roster-count extended to 5 README claims — all pass)
- Lint / build: pass — `git diff --check` exit 0 (no diff-check errors; warnings only for
  line-ending-normalization notices on unrelated `.claude/agent-memory/` files);
  `node .asd/sync.js --check` `ok: true`, 72 items, 0 with non-`current` status (zero drift)
- HEAD: 852e70bb5fa6c122643366e3120f9939193818ad

**Entry 4** (superseded by entry 5 below; kept for record):
- Command: `node tests/run.js`
- Result: pass — 83/83 passed, 0 failed, 0 skipped (no tests added or removed this entry)
- Lint / build: pass — `git diff --check` exit 0 (no diff-check errors; warnings only for
  line-ending-normalization notices on unrelated `.claude/agent-memory/` files);
  `node .asd/sync.js --check` `ok: true`, 72 items, 0 with non-`current` status (zero drift)
- HEAD: 487e65fc81221b6ad91c06d19e28523f7c9db049

**Entry 5** (current, latest — this is the result the `pr` phase compares against):
- Command: `node tests/run.js`
- Result: pass — 83/83 passed, 0 failed, 0 skipped (no tests added or removed this entry)
- Lint / build: pass — `git diff --check` exit 0 (no diff-check errors; warnings only for
  line-ending-normalization notices on unrelated `.claude/agent-memory/` files);
  `node .asd/sync.js --check` `ok: true`, 72 items, 0 with non-`current` status (zero drift)
- HEAD: 1b9e49fd283ca7dca98c78eec19397e3b14fb4a7

## Defects

None found.

## Review-fix note (iter-2, addresses testing/quality/simplification findings)

Not a fresh Entry-log row — a formal entry N+1 follows at next impl-test once this review-fix round
completes. Findings resolved here, all in `tests/run.js` / this file / `decisions-log.md`:

- **testing #1** — the read-only-agent test's `claudeTools` fallback (`|| []`) made the Write/Edit
  absence assertions vacuous if `claude.tools` were deleted entirely. Added an explicit
  `assert.ok(Array.isArray(...))` allowlist check before the absence assertions.
- **testing #2 / quality #3** — the same test checked `Write`/`Edit` but not `Bash` (AC-6: "no
  Write/Edit/Bash"). Added a `Bash` absence check for all 9 read-only agents except
  `asd-external-review`, which legitimately invokes `Bash` to shell out to the wrapped Codex CLI
  (confirmed its `claude.tools` includes `Bash`) — commented inline.
- **quality #4** — the roster-count guard only checked one README claim and one AGENTS.md claim;
  README has 4 more count occurrences (`Sixteen specialized agents...`, `16 canonical agent specs`,
  two `16 agent definitions`). Extended the test to assert all of them against the live
  `.asd/agents/` count.
- **simplification #1** — deleted dead `readRaw()` helper (verified zero call sites beyond its own
  definition).
- **testing #3** — `test-plan.md`'s Suite-run HEAD and `decisions-log.md`'s stamped HEAD for entry 2
  disagreed. Kept `test-plan.md`'s Suite-run HEAD as authoritative (the actual suite-run commit);
  appended a new, non-destructive correction entry to `decisions-log.md` (append-only) rather than
  editing the original.
- **testing #4** — added a Risk → check decisions row for the 4 setup-skill files
  (`asd-concept`/`asd-stack`/`asd-design-system`/`asd-phase-scope` `SKILL.md`) that were part of
  entry 2's actual diff but had no recorded decision.

**Suite run (this pass)**: `node tests/run.js` — 80/83 passed. The 3 failures
(`release-manifest.json canon_hashes`/`upstream_hashes` freshness for `asd-architect.md`,
`asd-ba.md`, `asd-pm.md`, `asd-ux-designer.md`, and 3 setup-skill files/2 rule docs/1 workflow) are
pre-existing drift from parallel iter-2 review-fix dispatches editing those non-test canon files
concurrently with this pass — not caused by, or fixable from, this test-file-only change. The two
new/hardened assertions from this pass (`read-only agents...`, `agent-count claims...`) both pass.
`git diff --check`: clean (no whitespace errors). `node .asd/sync.js --check`: not re-run standalone
here — result depends on the same in-flight canon edits; deferred to the formal entry N+1 suite run
once all parallel iter-2 fixes land.

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
