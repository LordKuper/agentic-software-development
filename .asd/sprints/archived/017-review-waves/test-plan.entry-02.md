# Test plan — entry 2 (rotated segment)

Rotated from `test-plan.md` at entry 3's strategy pass (`artifact-layout.md` "Test plan" rotation). A cross-span reader reads this segment in ordinal order, then the live file.

Carried from the live file's preamble; it records entry 1's pre-strategy run:

Pre-strategy run at `5b8ad95`: `node tests/run.js` → exit 1, `194/213 passed`. 19 FAILs:
- 18 pin contracts this sprint changed on purpose: t_review-scope.json keys, prompt transport, the `exclude_paths[]` carve-out, the split partition, the interrupted/split citation, `.part-N` naming, the correlated-interruption literal, the partial outcome, the `for iter-NN` tail, `emitCoverageManifests` (G-9, sprint-012 AC-12), the red-suite latch wording, the per-part CLI files, the `SPLIT_THRESHOLD_FILES`/`DISPATCH_CEILING` citers, surface-check `dispatches` (sprint-014 AC-5 and sprint-015 AC-11), the `.part-N` finding-id prefix, and the sprint-015 AC-4/AC-5 part output.
- 1 is a test defect: `SessionStart hook: Codex gets $asd-* form` ran the hook against the live sprint, whose branch `claude/asd-sprint-4y74bx` contains `/asd-sprint`.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `reviewWaveCount(lines, files)` file-count cap (COR-1 fallout) | a 2-file/7000-line scope still gets 3 waves, so a wave holds no file | unit | add | the existing boundary test grows a `[files, expected]` axis at the one shape the cap changes (2 files, 7000 lines → 2 waves), alongside the untouched line-only cases |
| `validateWaveDivision([[]], [], 1)` (COR-1) | an empty scope's one empty wave is rejected as "empty" instead of accepted | unit | add | direct call at the one boundary the fix changed: `inScope.size > 0` guards the rejection now |
| `wave-files` command: rename mapping + union (COR-5) | a division-time path renamed since the division is reviewed under its stale path, or the iteration's own extra files are dropped or duplicated | component/contract | add | fixture repo: division at one commit, a rename after it; asserts the mapped list, the union with an extra file list (dedup, order), and a `--wave` past the division rejected |
| Shared `.diff` naming + skipped rewrite (EFF-2 fallout) | two manifests over the same list+range write two byte-identical patches, or a stale patch is served for a changed range | component/contract | add | the external + amended emit-manifest test asserts one `.diff` file (not `external.diff`) and a twin emit for the same list+range shares its basename |
| Design-review `--full-files` excludes a listed draft from the snapshot diff (COR-3) | a `--full-files` draft that changed since the previous snapshot still gets a hunk, defeating "listed, no hunk" | component/contract | add | extends the D9e fixture: a changed draft passed via `--full-files` joins the manifest list but its diff carries none of its content |
| Hook node choice once a wave has iterated (COR-6) | outside a review phase, the summary compares impl wave 2's fresh counter against design's and wrongly shows design's verdict | component | add | temp-repo hook run: before any wave iterates shows design's verdict, after a later wave iterates shows that wave's instead |
| impl-review step 8 branch order + closed-wave `.late.md` placement (COR-2) | a closed wave's late-admitted finding is written into the closed wave's own dir (never reached again) or step 8's roster-met branch runs before an admitted late finding is checked | static | add | static contract on step 7a's closed-wave bullet (target dir, "joins step 8's unresolved set") and step 8's three-branch order (FAIL → unresolved findings → roster-met Otherwise) |
| review-policy.md floor + return contract + division log entry (TST-1: AC-2/AC-3) | AC-2/AC-3 had no check at any level per code-style.md §17 | static | add | one contract pinning the per-wave floor citation, step 8's K<n/K=n routing, the `WAVE: <K>` return-contract literal, and the division decisions-log artefact bullet |
| `MAX_REVIEW_WAVES` boundary (TST-3: AC-1) | the cap silently widens past "up to 3" while `cap >= 2` keeps passing | static | add | `assert.strictEqual(cap, 3)` plus a README `"up to 3"` cross-check |
| review-policy.md floor + State-recovery readers of the per-wave counter (TST-2) | the `none` reason for wave-sequencing orchestration claimed a pinning test that didn't exist; the D3/D4 test title claimed floor/State-recovery coverage it didn't check | static | add | added floor-citation and State-recovery reviews-green/hook-reader assertions to the existing D3/D4 test; named the new TST-1 test in the `none` row below |
| Four sandboxed-git fixtures + two hand-rolled CLI try/catch wrappers (EFF-4) | drifted fixtures (one missing `core.autocrlf=false`) and duplicated try/catch shapes | refactor, no new test | keep | extracted `sandboxGitRepo()` and `runtimeCliResult()`; all four git fixtures and the two JSON-CLI closures now share them — behavior unchanged, so the pre-existing tests are the regression proof |
| Wave sequencing orchestration in `asd-phase-impl-review.md` (D5, D6) | the orchestrator advances or reopens waves wrongly | — | none | orchestration prose run by the main orchestrator, with no executable surface beyond the runtime commands tested above. TST-1 above is the pinning test its literals rely on. This sprint's own impl-review runs it live (plan Risks "Self-hosting bootstrap") |

## Removed tests

None this entry — every finding was a broken-on-purpose test to update (`code-style.md` §17), a coverage gap to fill, or a fixture refactor with the same assertions.

## Added tests

| Test | Regression proof |
|---|---|
| `tests/run.js:sprint-017 AC-1 (D1/D2): review-waves counts one wave per WAVE_THRESHOLD_LINES begun … at least one and at most min(MAX_REVIEW_WAVES, files) …` (updated for the file-count cap and the empty-scope acceptance) | mutation drop the file-count cap from `reviewWaveCount` → exit 1, this test FAILs; mutation drop `inScope.size > 0` from the empty-wave rejection → exit 1, this test FAILs |
| `tests/run.js:sprint-017 AC-1/AC-4 (COR-5): wave-files reads wave K's list at its current paths …` | mutation drop the rename mapping (`return stringArray(...)` unmapped) → exit 1, this test FAILs |
| `tests/run.js:sprint-017 AC-4/AC-8 (D6/D9a-c) …` (updated: derives the External `.diff` name from the CLI's own returned path instead of the literal `external.diff`; added a twin-emit shared-name assertion) | mutation append `Math.random()` into the fingerprint input → exit 1, the twin-name assertion FAILs |
| `tests/run.js:sprint-017 AC-8 (D9e) …` (updated: `draft-snapshot --out`/`--previous` now take iteration dirs, no `snapshot.json`; added the COR-3 `--full-files` exclusion case) | mutation have `draftSnapshot` also write a `snapshot.json` → exit 1, this test + the EXT-1 test FAIL; mutation drop the `--full-files` exclusion filter in `writeManifestDiff` → exit 1, this test FAILs |
| `tests/run.js:sprint-015 AC-2 (EXT-1) …` (updated: iteration dirs, no `snapshot.json`, asserts the `snapshot/` copies directly) | mutation have `draftSnapshot` also write a `snapshot.json` → exit 1, this test FAILs |
| `tests/run.js:sprint-017 (COR-6): outside a review phase, SessionStart prefers the impl-review wave node …` | mutation drop the wave-iterated branch from `reviewNodeForPhase` (fall through to design's node) → exit 1, this test FAILs |
| `tests/run.js:sprint-017 (COR-2): a closed wave's late-admitted finding lands in the CURRENT iteration's dir …` | mutation reword the closed-wave finding's step-8 mention → exit 1, this test FAILs |
| `tests/run.js:sprint-017 TST-1 (AC-2/AC-3): review-policy.md pins the severity floor … the return contract carries WAVE: <K> …` | mutation drop `WAVE: <K> \|` from the return contract → exit 1, this test FAILs |
| `tests/run.js:sprint-017 AC-1/AC-6 (D3/D4) …` (extended: floor citation + State-recovery reviews-green/hook-reader assertions, TST-2) | covered by the existing D3/D4 mutation set; the new assertions read literals already pinned there, no additional mutation needed |

Mutations were applied one at a time to `.asd/runtime.js`, `.asd/hooks/session-start.js` or `.asd/workflows/asd-phase-impl-review.md`, each restored by `cp`/`git checkout --` in the same command and byte-compared (`cmp`/`git diff --stat`). Every `runtime.js`/hook mutated run also failed the `upstream_hashes` guard (and the hook one the `sync.js --check` guard) — expected noise from editing a hashed file.
