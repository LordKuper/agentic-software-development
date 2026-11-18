'use strict';

// runtime.js review machinery: coverage ledger, emit-manifest, persist-review, record-verdicts, latch-refresh, review waves

const { assert, fs, path, execFileSync, spawnSync, update, runtime, REPO_ROOT, tests, test, mkTempDir, writeFile, declaredScopeFields, runtimeCli, runtimeCliResult, sandboxGitRepo, sandboxGitRepoFrom, importCommits, importCommitsSync, execFileAsync, runtimeCliResultAsync, runtimeSpawnAsync, readWorkflowDefinitions, readRepoFile, internalReviewers, reviewerRubric, canonText, sectionOf, stepOf, spans, RUNTIME_JS } = require('./lib.js');

function buildManifest(files, rules, sections) {
  return {
    files, rules, sections,
    n_a: {
      files: Object.fromEntries(files.map((id) => [id, [`no-${id}`]])),
      rules: Object.fromEntries(rules.map((id) => [id, [`no-${id}`]])),
      sections: Object.fromEntries(sections.map((id) => [id, [`no-${id}`]])),
    },
  };
}

function validCoverageFixture() {
  const manifest = buildManifest(['f-1'], ['r-1'], ['s-1']);
  manifest.digest = runtime.coverageManifestDigest(manifest);
  return {
    manifest,
    ledger: {
      manifest_digest: manifest.digest, findings: ['F-1'],
      files: [{ i: 'f-1', s: 'checked' }],
      rules: [{ i: 'r-1', s: 'finding', f: 'F-1' }],
      sections: [{ i: 's-1', s: 'reviewed' }],
    },
  };
}

test('AC-1/2: compact coverage ledger rejects identity, completeness, predicate, and finding-reference fraud', () => {
  const { manifest, ledger } = validCoverageFixture();
  assert.deepStrictEqual(runtime.validateCoverageLedger(manifest, ledger, ['F-1']), { ok: true });
  const cases = [
    ['wrong digest', () => { const x = structuredClone(ledger); x.manifest_digest = '0'.repeat(64); return x; }, /identity/],
    ['missing row', () => { const x = structuredClone(ledger); x.files = []; return x; }, /incomplete/],
    ['duplicate row', () => { const x = structuredClone(ledger); x.files.push({ i: 'f-1', s: 'checked' }); return x; }, /identity/],
    ['unknown row', () => { const x = structuredClone(ledger); x.files[0].i = 'unknown'; return x; }, /identity/],
    ['invalid n/a predicate', () => { const x = structuredClone(ledger); x.files[0] = { i: 'f-1', s: 'n/a', p: 'invented' }; return x; }, /predicate/],
    ['missing finding reference', () => { const x = structuredClone(ledger); x.rules[0] = { i: 'r-1', s: 'finding', f: 'F-2' }; return x; }, /finding reference/],
  ];
  for (const [label, makeLedger, message] of cases) assert.throws(() => runtime.validateCoverageLedger(manifest, makeLedger(), ['F-1']), message, label);
  const forgeryCases = [
    ['ledger claims an extra finding not actually raised', { findings: ['F-1', 'F-2'] }, ['F-1']],
    ['ledger claims a finding while none was actually raised', { findings: [] }, ['F-1']],
    ['ledger duplicates the same finding id', { findings: ['F-1', 'F-1'] }, ['F-1']],
  ];
  for (const [label, override, actualFindings] of forgeryCases) {
    const forged = structuredClone(ledger);
    Object.assign(forged, override);
    assert.throws(() => runtime.validateCoverageLedger(manifest, forged, actualFindings), /ledger findings invalid/, label);
  }
  const duplicateManifest = structuredClone(manifest);
  duplicateManifest.files.push('f-1');
  duplicateManifest.digest = runtime.coverageManifestDigest(duplicateManifest);
  const duplicateLedger = structuredClone(ledger);
  duplicateLedger.manifest_digest = duplicateManifest.digest;
  assert.throws(() => runtime.validateCoverageLedger(duplicateManifest, duplicateLedger, ['F-1']), /duplicates/);
});

test('runtime.js CLI: validate-ledger exits 0 with {"ok":true} stdout on valid fixtures', () => {
  const root = mkTempDir();
  const { manifest, ledger } = validCoverageFixture();
  const manifestPath = path.join(root, 'manifest.json');
  const ledgerPath = path.join(root, 'ledger.json');
  const findingsPath = path.join(root, 'findings.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest), 'utf8');
  fs.writeFileSync(ledgerPath, JSON.stringify(ledger), 'utf8');
  fs.writeFileSync(findingsPath, JSON.stringify(['F-1']), 'utf8');

  const out = runtimeCli(['validate-ledger', '--manifest', manifestPath, '--ledger', ledgerPath, '--findings', findingsPath]);
  assert.deepStrictEqual(JSON.parse(out), { ok: true });
});

test('runtime.js CLI: validate-ledger on a tampered ledger exits non-zero and prints no "ok" to stdout', () => {
  const root = mkTempDir();
  const { manifest, ledger } = validCoverageFixture();
  const tampered = structuredClone(ledger);
  tampered.findings = ['F-1', 'F-2'];
  const manifestPath = path.join(root, 'manifest.json');
  const ledgerPath = path.join(root, 'ledger.json');
  const findingsPath = path.join(root, 'findings.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest), 'utf8');
  fs.writeFileSync(ledgerPath, JSON.stringify(tampered), 'utf8');
  fs.writeFileSync(findingsPath, JSON.stringify(['F-1']), 'utf8');

  let error = null;
  try {
    runtimeCli(['validate-ledger', '--manifest', manifestPath, '--ledger', ledgerPath, '--findings', findingsPath]);
  } catch (e) {
    error = e;
  }
  assert.ok(error, 'a tampered ledger must exit non-zero, never silently pass a blocking gate');
  assert.notStrictEqual(error.status, 0);
  assert.ok(!(error.stdout || '').includes('ok'), 'a rejected ledger must never print an "ok" payload to stdout');
});

test('runtime.js CLI: manifest-digest digests a manifest exactly as written and never rewrites it - stamping belongs to emit-manifest alone', () => {
  const root = mkTempDir();
  const manifest = buildManifest(['f-1'], ['r-1'], ['s-1']);
  const manifestPath = path.join(root, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest), 'utf8');

  const out = runtimeCli(['manifest-digest', '--manifest', manifestPath]).trim();
  assert.strictEqual(out, runtime.coverageManifestDigest(manifest), 'the CLI must print exactly what the exported digester computes - a workflow verifies through the CLI while the validator checks through the library, so the two must never disagree');
  assert.strictEqual(out, runtime.fingerprint(manifest), 'a manifest carrying no `vocabulary` must digest to the plain stable hash of its own content: the pre-vocabulary identity, expressed here through the untouched `fingerprint` primitive so the expectation cannot drift with the function under test. Digesting an implied field instead would move the identity of every manifest stamped before that field existed (correctness F-2)');

  let restamp;
  try {
    restamp = runtimeCli(['manifest-digest', '--manifest', manifestPath, '--write'], { stdio: 'pipe' }).trim();
  } catch (error) {
    restamp = `exit ${error.status}`;
  }
  assert.strictEqual(fs.readFileSync(manifestPath, 'utf8'), JSON.stringify(manifest), `EFF-1-1: manifest-digest only verifies - a dispatched manifest is immutable to the orchestrator too (review-policy.md "Coverage ledger"), so no flag may re-stamp the file on disk. Got: ${restamp}`);
});

const SECTIONED_RUBRIC = '# Reviewer\n\n## Review rubric\n\n### Alpha\n\n- **Nested label**: never an id of its own\n\n### Beta\n\n## Signals emitted\n\n### Not a rubric entry\n';

test('sprint-017 AC-1 (D1/D2), sprint-023 AC-1: review-waves counts the most of one wave per WAVE_THRESHOLD_LINES, WAVE_THRESHOLD_FILES and WAVE_THRESHOLD_BYTES begun, at least one and at most min(MAX_REVIEW_WAVES, files); numstat lines count listed files only, a binary file and a pure rename 0; a division is accepted only as exactly n non-empty disjoint lists covering the scope, an empty list only when the scope itself is empty', () => {
  const threshold = runtime.WAVE_THRESHOLD_LINES;
  const cap = runtime.MAX_REVIEW_WAVES;
  assert.ok(cap >= 2, 'sanity: a cap below 2 leaves nothing to divide');
  assert.strictEqual(cap, 3, 'TST-3/AC-1: MAX_REVIEW_WAVES must stay the boundary AC-1 and README:167 name - "up to 3" - not merely >= 2, or the cap could silently widen past what the AC promises');
  assert.ok(readRepoFile('README.md').includes('up to 3 sequential review waves'), `TST-3: README's "up to N" wording must still name the same N as MAX_REVIEW_WAVES (${cap})`);
  for (const [lines, files, expected] of [
    [0, 0, 1], [0, 10, 1], [1, 10, 1], [threshold, 10, 1], [threshold + 1, 10, 2], [2 * threshold, 10, 2],
    [2 * threshold + 1, 10, Math.min(3, cap)], [cap * threshold + 1, 10, cap], [100 * threshold, 10, cap],
    [2 * threshold + 1, 2, 2], [threshold + 1, 1, 1],
  ]) {
    assert.strictEqual(runtime.reviewWaveCount(lines, files), expected, `${lines} changed lines over ${files} files: one wave per ${threshold} lines begun, at least 1, at most min(${cap}, files)`);
  }
  for (const [lines, files] of [[-1, 10], [1.5, 10], [Number.NaN, 10], ['3001', 10], [10, -1], [10, 1.5], [10, Number.NaN]]) {
    assert.throws(() => runtime.reviewWaveCount(lines, files), /non-negative integer/, `${JSON.stringify([lines, files])}: an unusable measurement must fail closed, never size the waves from a guess`);
  }
  const filesLimit = runtime.WAVE_THRESHOLD_FILES;
  const bytesLimit = runtime.WAVE_THRESHOLD_BYTES;
  for (const [lines, files, bytes, expected] of [
    [1, filesLimit, 0, 1], [1, filesLimit + 1, 0, 2], [1, 2 * filesLimit + 1, 0, Math.min(3, cap)], [1, 100 * filesLimit, 0, cap],
    [1, 10, bytesLimit, 1], [1, 10, bytesLimit + 1, 2], [1, 10, 2 * bytesLimit + 1, Math.min(3, cap)], [1, 10, 100 * bytesLimit, cap],
    [threshold + 1, filesLimit + 1, 0, 2], [threshold + 1, 10, 2 * bytesLimit + 1, Math.min(3, cap)], [1, filesLimit + 1, 2 * bytesLimit + 1, Math.min(3, cap)],
    [1, 1, 100 * bytesLimit, 1],
  ]) {
    assert.strictEqual(runtime.reviewWaveCount(lines, files, bytes), expected, `${lines} lines, ${files} files, ${bytes} diff bytes: the wave count is the most of one per ${threshold} lines, ${filesLimit} files and ${bytesLimit} bytes begun, never their sum, at most min(${cap}, files)`);
  }
  for (const bytes of [-1, 1.5, Number.NaN, String(bytesLimit)]) {
    assert.throws(() => runtime.reviewWaveCount(10, 10, bytes), /bytes must be a non-negative integer/, `${JSON.stringify(bytes)}: an unusable byte measurement must fail closed like lines and files, never be read as 0 and collapse the scope into one wave`);
  }

  const numstat = ['12\t3\tsrc/a.js', '-\t-\tassets/logo.png', '0\t0\t', 'src/old.js', 'lib/moved.js', '4\t1\t', 'src/was.js', 'lib/edited.js', '7\t0\tsrc/unlisted.js', ''].join('\0');
  const listed = ['src/a.js', 'assets/logo.png', 'lib/moved.js', 'lib/edited.js'];
  assert.strictEqual(runtime.numstatLines(numstat, listed), 12 + 3 + 4 + 1, 'D1: added plus deleted lines of the listed files; the binary file and the pure rename add 0, an edited rename counts at its destination, an unlisted file never counts');
  assert.strictEqual(runtime.numstatLines(numstat, ['src/old.js', 'src/was.js']), 0, 'a rename is listed by its destination, never its source');
  assert.strictEqual(runtime.numstatLines('', listed), 0, 'an empty range measures 0 lines');
  assert.throws(() => runtime.numstatLines('garbage\0', listed), /malformed/, 'an unparsable numstat entry must fail closed, never read as 0 lines and collapse the scope into one wave');

  const scope = ['a.md', 'b.md', 'c.md', 'd.md'];
  assert.deepStrictEqual(runtime.validateWaveDivision([['a.md', 'c.md'], ['b.md', 'd.md']], scope, 2), [['a.md', 'c.md'], ['b.md', 'd.md']], 'a disjoint division covering the scope in exactly n waves is accepted as given, grouping left to the orchestrator');
  assert.deepStrictEqual(runtime.validateWaveDivision([[]], [], 1), [[]], 'COR-1: an empty scope is accepted as the one wave [[]] - the empty-wave rejection below applies only when the scope is non-empty');
  for (const [label, division, pattern] of [
    ['too few waves', [scope], /exactly 2 waves/],
    ['too many waves', [['a.md'], ['b.md'], ['c.md', 'd.md']], /exactly 2 waves/],
    ['an empty wave', [scope, []], /empty/],
    ['a file in two waves', [['a.md', 'b.md'], ['b.md', 'c.md', 'd.md']], /twice/],
    ['a file outside the scope', [['a.md', 'b.md'], ['c.md', 'd.md', 'e.md']], /outside the scope/],
    ['a scope file in no wave', [['a.md', 'b.md'], ['c.md']], /in no wave/],
    ['a non-array wave', [['a.md', 'b.md'], 'c.md'], /string array/],
  ]) {
    assert.throws(() => runtime.validateWaveDivision(division, scope, 2), pattern, `${label}: a division that is not exactly n non-empty disjoint lists covering the scope leaves a file reviewed twice or by nobody`);
  }
});

test('AC-5: LEDGER_VOCABULARY is the single source validateCoverageLedger enforces - each status is accepted only for its own row type, `p`/`f` sit exactly where the constant says, and widening the constant widens the validator', () => {
  const vocabulary = runtime.LEDGER_VOCABULARY;
  const rowTypes = ['files', 'rules', 'sections'];
  const plainStatus = (rowType) => vocabulary[rowType].find((s) => s !== vocabulary.p && s !== vocabulary.f);

  function fixture(rowType, row) {
    const manifest = buildManifest(['files-1'], ['rules-1'], ['sections-1']);
    manifest.digest = runtime.coverageManifestDigest(manifest);
    const ledger = { manifest_digest: manifest.digest, findings: ['F-1'] };
    for (const type of rowTypes) ledger[type] = [type === rowType ? row : { i: `${type}-1`, s: plainStatus(type) }];
    return { manifest, ledger };
  }
  const decorate = (rowType, status) => {
    const row = { i: `${rowType}-1`, s: status };
    if (status === vocabulary.p) row.p = `no-${rowType}-1`;
    if (status === vocabulary.f) row.f = 'F-1';
    return row;
  };
  const validate = ({ manifest, ledger }) => runtime.validateCoverageLedger(manifest, ledger, ['F-1']);

  for (const rowType of rowTypes) {
    for (const status of vocabulary[rowType]) {
      assert.deepStrictEqual(validate(fixture(rowType, decorate(rowType, status))), { ok: true }, `${rowType}: status "${status}" is published by LEDGER_VOCABULARY, so the validator must accept it. Each fixture carries exactly one id per row type, so a rejection can only come from the row type under test`);
    }
    for (const foreign of [...new Set(rowTypes.flatMap((t) => vocabulary[t]))].filter((s) => !vocabulary[rowType].includes(s))) {
      assert.throws(() => validate(fixture(rowType, decorate(rowType, foreign))), /status invalid/, `${rowType}: status "${foreign}" belongs to another row type only - accepting it would let a reviewer report coverage in a vocabulary its own manifest never offered`);
    }
    const naRow = decorate(rowType, vocabulary.p);
    delete naRow.p;
    assert.throws(() => validate(fixture(rowType, naRow)), /predicate/, `${rowType}: "${vocabulary.p}" must require its predicate - the constant names it as the one status carrying \`p\``);
    const strayP = Object.assign(decorate(rowType, plainStatus(rowType)), { p: `no-${rowType}-1` });
    assert.throws(() => validate(fixture(rowType, strayP)), /predicate only allowed/, `${rowType}: only "${vocabulary.p}" may carry \`p\``);
    if (vocabulary[rowType].includes(vocabulary.f)) {
      const findingRow = decorate(rowType, vocabulary.f);
      delete findingRow.f;
      assert.throws(() => validate(fixture(rowType, findingRow)), /finding reference/, `${rowType}: "${vocabulary.f}" must require its finding reference`);
    }
    const strayF = Object.assign(decorate(rowType, plainStatus(rowType)), { f: 'F-1' });
    assert.throws(() => validate(fixture(rowType, strayF)), /finding reference only allowed/, `${rowType}: only "${vocabulary.f}" may carry \`f\``);
  }

  const savedFiles = vocabulary.files.slice();
  try {
    vocabulary.files.push('provisionally-checked');
    assert.deepStrictEqual(validate(fixture('files', { i: 'files-1', s: 'provisionally-checked' })), { ok: true }, 'the validator must read LEDGER_VOCABULARY itself - a status list re-hardcoded beside the constant is exactly the drift AC-5 exists to prevent');
  } finally {
    vocabulary.files.length = 0;
    vocabulary.files.push(...savedFiles);
  }
  assert.deepStrictEqual(vocabulary.files, savedFiles, 'the constant must be restored - later tests digest manifests through it');
});

test('AC-5/AC-6b/sprint-012 AC-1: validate-ledger tolerates a manifest predating each published constant - every publication-order prefix of them, none included - and rejects a divergent one even when its digest was recomputed', () => {
  const ledgerFor = (manifest) => ({
    manifest_digest: manifest.digest, findings: [],
    files: [{ i: 'f-1', s: 'checked' }], rules: [{ i: 'r-1', s: 'pass' }], sections: [{ i: 's-1', s: 'reviewed' }],
  });

  const prePublicationDigest = (manifest) => {
    const copy = Object.assign({}, manifest);
    delete copy.digest;
    return runtime.fingerprint(copy);
  };
  const validate = (manifest) => runtime.validateCoverageLedger(manifest, ledgerFor(manifest), []);

  const published = [
    ['vocabulary', runtime.LEDGER_VOCABULARY, (value) => { value.files = [...value.files, 'provisionally-checked']; }, /vocabulary/],
    ['row_example', runtime.LEDGER_ROW_EXAMPLE, (value) => { value.p = 'invented predicate'; }, /row example/],
    ['n_a_shape', runtime.LEDGER_NA_SHAPE, (value) => { delete value[Object.keys(value)[0]]; }, /n_a shape/],
  ];

  for (let count = 0; count < published.length; count += 1) {
    const legacy = buildManifest(['f-1'], ['r-1'], ['s-1']);
    for (const [field, constant] of published.slice(0, count)) legacy[field] = structuredClone(constant);
    for (const [field] of published.slice(count)) assert.strictEqual(legacy[field], undefined, `sanity: the backward-tolerance fixture must genuinely lack \`${field}\``);
    legacy.digest = prePublicationDigest(legacy);
    assert.deepStrictEqual(validate(legacy), { ok: true }, `a manifest stamped before \`${published[count][0]}\` was published carries only the ${count} constant(s) ahead of it AND a digest stamped without it - reproduced from the untouched \`fingerprint\` primitive, so the fixture stays a legacy artefact instead of tracking whatever the digester does today. Each published constant must be independently optional, or publishing the next one silently invalidates every manifest the previous ones stamped (correctness F-2)`);
  }

  for (const [field, constant, diverge, rejection] of published) {
    const current = buildManifest(['f-1'], ['r-1'], ['s-1']);
    current[field] = structuredClone(constant);
    current.digest = runtime.coverageManifestDigest(current);
    assert.deepStrictEqual(validate(current), { ok: true }, `a manifest publishing \`${field}\` must validate against a ledger written in it`);

    const divergent = buildManifest(['f-1'], ['r-1'], ['s-1']);
    divergent[field] = structuredClone(constant);
    diverge(divergent[field]);
    divergent.digest = runtime.coverageManifestDigest(divergent);
    assert.throws(() => runtime.validateCoverageLedger(divergent, ledgerFor(divergent), []), rejection, `a hand-edited manifest publishing a \`${field}\` the validator does not enforce must be rejected outright - recomputing its digest makes it self-consistent, so the digest check alone never catches it`);
  }
});

test('AC-6b: the published row example is a row validateCoverageLedger accepts once its placeholders are filled, carries exactly the decoration its own status requires, and review-policy.md publishes the same key set', () => {
  const example = runtime.LEDGER_ROW_EXAMPLE;
  const manifest = buildManifest(['f-1'], ['r-1'], ['s-1']);
  manifest.row_example = structuredClone(example);
  manifest.digest = runtime.coverageManifestDigest(manifest);
  const ledgerWith = (fileRow) => ({
    manifest_digest: manifest.digest, findings: [],
    files: [fileRow], rules: [{ i: 'r-1', s: 'pass' }], sections: [{ i: 's-1', s: 'reviewed' }],
  });
  const placeholders = { i: 'f-1', p: 'no-f-1' };
  const filled = Object.fromEntries(Object.entries(example).map(([key, value]) => [key, key in placeholders ? placeholders[key] : value]));

  assert.strictEqual(example.s, runtime.LEDGER_VOCABULARY.p, 'the example must publish the one status the vocabulary names as carrying `p` - that pairing is the whole reason a single row can demonstrate the shape. Keyed to the vocabulary constant rather than to the status literal, so renaming the status moves both sides together');
  let verdict;
  try {
    verdict = runtime.validateCoverageLedger(manifest, ledgerWith(filled), []);
  } catch (error) {
    verdict = `rejected: ${error.message}`;
  }
  assert.deepStrictEqual(verdict, { ok: true }, 'AC-6b: every reviewer copies this row shape out of its own manifest, so an example the validator rejects would teach every reviewer to return a ledger that fails the blocking gate - a failure visible only as a re-dispatch, never as a bad example. The rejection reason is reported in place of the verdict so the break names itself');

  const undecorated = Object.assign({}, filled);
  delete undecorated.p;
  assert.throws(() => runtime.validateCoverageLedger(manifest, ledgerWith(undecorated), []), /predicate/, 'the example must carry the decorating key its status REQUIRES: dropping `p` from the filled row is rejected, which is what proves the published `p` is load-bearing rather than ornamental');

  const policyLine = readRepoFile('.asd/rules/review-policy.md').split('\n').find((line) => line.includes('"row_example"'));
  assert.ok(policyLine, 'review-policy.md "Coverage ledger" must publish the row example beside `vocabulary` - the orchestrator building a manifest reads the rule, the reviewer reads the manifest');
  for (const key of Object.keys(example)) {
    assert.ok(policyLine.includes(`"${key}"`), `review-policy.md's published example must name every key \`.asd/runtime.js\` actually stamps, \`${key}\` included - a documented shape short of the emitted one is the drift AC-6b's single-constant seam exists to prevent`);
  }
});

test('sprint-010 T-1/D-2: a manifest keying `n_a` by row type - the shape a phase workflow emits - authorizes an n/a row of every row type, while any other keying is rejected by name instead of degrading to no authorized predicate', () => {
  const vocabulary = runtime.LEDGER_VOCABULARY;
  const rowTypes = Object.keys(vocabulary).filter((key) => Array.isArray(vocabulary[key]));
  const ids = { files: ['f-1'], rules: ['r-1'], sections: ['s-1'] };
  const stamp = (manifest) => { manifest.digest = runtime.coverageManifestDigest(manifest); return manifest; };
  const ledgerFor = (manifest, rows) => Object.assign({ manifest_digest: manifest.digest, findings: [] }, rows);
  const verdictOf = (manifest, ledger) => {
    try { return `accepted: ${JSON.stringify(runtime.validateCoverageLedger(manifest, ledger, []))}`; } catch (error) { return `rejected: ${error.message}`; }
  };

  assert.deepStrictEqual(rowTypes, Object.keys(ids), 'both sides derive the row types from the vocabulary constant, so a fourth one must reach this fixture in the same change - otherwise every sweep below silently stops covering it');
  const naRows = Object.fromEntries(rowTypes.map((type) => [type, ids[type].map((id) => ({ i: id, s: vocabulary.p, p: `no-${id}` }))]));
  const plainRows = Object.fromEntries(rowTypes.map((type) => [type, ids[type].map((id) => ({ i: id, s: vocabulary[type][0] }))]));
  assert.ok(rowTypes.every((type) => vocabulary[type][0] !== vocabulary.p), 'the plain ledger must genuinely carry no n/a row: a malformed manifest paired with one is the combination that passed silently before D-2, and a plain status equal to the n/a status would collapse that case into the rejection case beside it');

  const emitted = stamp(buildManifest(ids.files, ids.rules, ids.sections));
  assert.strictEqual(verdictOf(emitted, ledgerFor(emitted, naRows)), 'accepted: {"ok":true}', 'D-2: `n_a` is the one manifest field an orchestrator hand-builds per dispatch (review-policy.md "Coverage ledger": the allowed n/a predicates per individual ID), and nothing bound the shape it writes - row type, then id, then predicate list - to the shape validateCoverageLedger reads back out. One truthful n/a row per row type is what binds them');

  const unauthorized = Object.assign({}, naRows, { files: [{ i: ids.files[0], s: vocabulary.p, p: 'a predicate this manifest never authorized' }] });
  assert.ok(verdictOf(emitted, ledgerFor(emitted, unauthorized)).startsWith('rejected:'), "the predicate must be checked against that id's own list rather than merely be present, or the acceptance above proves only that a well-shaped manifest is ignored consistently");

  const flat = buildManifest(ids.files, ids.rules, ids.sections);
  flat.n_a = Object.fromEntries(rowTypes.flatMap((type) => ids[type].map((id) => [id, [`no-${id}`]])));
  stamp(flat);
  const flatVerdict = verdictOf(flat, ledgerFor(flat, plainRows));
  assert.ok(flatVerdict.startsWith('rejected:') && flatVerdict.includes(ids.files[0]), `D-2: keyed by id instead of by row type, every lookup missed and each id resolved to an empty predicate set - truthful n/a rows rejected as unauthorized while the malformed manifest itself validated, the unknown-id guard iterating an empty object. This exact pairing, a plain ledger over a mis-keyed manifest, is the silent pass, and the rejection must name the offending key or the orchestrator that wrote it has nothing to correct. Got: ${flatVerdict}`);

  for (const malformed of [[], 'files', null, 42]) {
    const broken = stamp(Object.assign(buildManifest(ids.files, ids.rules, ids.sections), { n_a: malformed }));
    assert.ok(verdictOf(broken, ledgerFor(broken, plainRows)).startsWith('rejected:'), `an n_a that is no object of row types (${JSON.stringify(malformed)}) must fail closed: read through the label lookup with its empty-object fallback it degrades to the same empty predicate set as the mis-keyed one above, which rejects truthful rows instead of the manifest`);
  }

  const legacy = buildManifest(ids.files, ids.rules, ids.sections);
  delete legacy.n_a;
  stamp(legacy);
  assert.strictEqual(verdictOf(legacy, ledgerFor(legacy, plainRows)), 'accepted: {"ok":true}', 'a manifest authorizing no n/a at all omits `n_a` entirely, so the shape check must stay conditional on its presence - made mandatory, the fix for D-2 rejects every manifest whose review needed no n/a row');
});

test("sprint-012 AC-1: the published n_a shape keys exactly the vocabulary's row types, is an n_a the validator accepts once its placeholders are filled, and review-policy.md publishes the same row types", () => {
  const shape = runtime.LEDGER_NA_SHAPE;
  const vocabulary = runtime.LEDGER_VOCABULARY;
  const rowTypes = Object.keys(vocabulary).filter((key) => Array.isArray(vocabulary[key]));
  assert.deepStrictEqual(Object.keys(shape), rowTypes, 'the shape must key n_a by exactly the row types the vocabulary publishes - a missing type teaches every reader of the manifest that its ids can never be n/a, an extra one is rejected by the validator as an unknown row type');

  let verdict;
  try {
    const filled = Object.fromEntries(Object.entries(shape).map(([type, byId]) => [type, Object.fromEntries(Object.values(byId).map((predicates) => [`${type}-1`, predicates.map(() => `no-${type}-1`)]))]));
    const manifest = Object.assign(buildManifest(['files-1'], ['rules-1'], ['sections-1']), { n_a: filled, n_a_shape: structuredClone(shape) });
    manifest.digest = runtime.coverageManifestDigest(manifest);
    const ledger = Object.assign({ manifest_digest: manifest.digest, findings: [] }, Object.fromEntries(rowTypes.map((type) => [type, [{ i: `${type}-1`, s: vocabulary.p, p: `no-${type}-1` }]])));
    verdict = runtime.validateCoverageLedger(manifest, ledger, []);
  } catch (error) {
    verdict = `rejected: ${error.message}`;
  }
  assert.deepStrictEqual(verdict, { ok: true }, 'the shape is published so an n_a written to it is one the validator reads back: filled from its own entries - row type, then id, then predicate list - it must authorize an n/a row of every row type. A shape the validator rejects teaches the D-2 mis-keying all over again, now from the manifest itself');

  const policyLine = canonText('.asd/rules/review-policy.md').split('\n').find((line) => line.includes('"n_a_shape"'));
  const published = policyLine && /"n_a_shape": \{"<([^>]+)>"/.exec(policyLine);
  assert.ok(published, 'review-policy.md "Coverage ledger" must publish the n_a shape beside `vocabulary` and `row_example` - the orchestrator reads the rule, the reviewer reads the manifest');
  assert.deepStrictEqual(published[1].split('|'), rowTypes, "review-policy.md's published shape must name the row types the runtime constant keys by, derived from the vocabulary rather than re-listed, so a fourth row type reddens the prose that forgot it");
});

test("sprint-012 AC-12: emit-manifest derives rule and section ids from a reviewer's own rubric, appends custom-rule paths, and grants each standing n/a predicate only where its condition holds - checked against every internal reviewer's real rubric in both phases", () => {
  const fixture = (rubric, customRules) => runtime.emitCoverageManifest({ reviewer: 'fixture', phase: 'impl-review', rubric, files: ['a.md'], customRules });
  const sectioned = fixture(SECTIONED_RUBRIC, { '.asd/project/custom-coding-rules.md': '# Custom Coding Rules\n' });
  assert.deepStrictEqual([sectioned.rules, sectioned.sections], [['Alpha', 'Beta', '.asd/project/custom-coding-rules.md'], ['Alpha', 'Beta']], 'review-policy.md "Rubric ID derivation": a sectioned rubric yields its `###` headings as rule and section ids in file order - nothing nested under a heading, nothing under the next `##` - and a custom rule is enumerated by the path passed');
  const bullets = fixture("## Review rubric\n\n- **Alpha**: detail\n  - **Nested**: not an id\n- **Beta**: detail\n\n## Do's\n\n- **Not a rubric entry**\n", {});
  assert.deepStrictEqual([bullets.rules, bullets.sections], [['Alpha', 'Beta'], []], "an unsectioned rubric yields each top-level bullet's bold lead-in label and no section ids");
  assert.throws(() => fixture('# Reviewer\n\n## Signals emitted\n', {}), /Review rubric/, 'a reviewer file with no `## Review rubric` must fail the emit closed: a manifest with no rubric rows validates while proving nothing was reviewed');

  const agent = (reviewer) => readRepoFile(`.asd/agents/asd-reviewer-${reviewer}.md`);
  const emitReal = (reviewer, phase, files, extra) => runtime.emitCoverageManifest(Object.assign({ reviewer, phase, rubric: reviewerRubric(reviewer), files, customRules: {} }, extra));
  const holders = (manifest, predicate) => Object.entries(manifest.n_a.rules).filter(([, predicates]) => predicates.includes(predicate)).map(([id]) => id);
  const predicates = runtime.NA_PREDICATES;

  const uiHolders = (files) => holders(emitReal('quality', 'impl-review', files, {}), predicates.uiSurface);
  const uiIds = uiHolders(['README.md', '.asd/runtime.js']);
  assert.strictEqual(uiIds.length, 1, 'with no UI surface in scope exactly the one UI conformance entry is n/a - diff-scoped fan-out is always on, with no flag to pass (sprint-013 AC-17)');
  for (const surface of ['.asd/templates/t_prd.html', 'docs/site/index.html', 'app/theme.scss', 'src/components/button.ts', 'src/App.tsx', 'Assets/Menu.uxml', 'Assets/Menu.USS', 'Assets/Theme.tss', 'Assets/Scripts/UI/HudPresenter.cs', 'src/Components/Button.cs']) {
    assert.deepStrictEqual(uiHolders(['README.md', surface]), [], `${surface} is a UI surface, so it must keep UI conformance reviewed - framework .asd/templates/*.html included, the whole subject of the correctness reviewer's self-hosting carve-out; sprint-021 AC-12: Unity UI Toolkit files (.uxml/.uss/.tss) and a UI path segment in any case too`);
  }
  for (const framework of ['.asd/rules/notes.html', '.ASD/rules/notes.html']) {
    assert.strictEqual(uiHolders(['README.md', framework]).length, 1, `${framework}: an .html under .asd/ outside .asd/templates/ is framework infrastructure, not a UI surface - the .asd/ exception is matched case-insensitively like the rest of the classifier (impl-review wave-1/iter-01 external #2)`);
  }

  const htmlHolders = (manifest) => holders(manifest, predicates.noHtml);
  const htmlIds = htmlHolders(emitReal('quality', 'impl-review', ['README.md', '.asd/runtime.js'], {}));
  assert.ok(htmlIds.length > 0, 'a scope with no HTML file must n/a the documentation entries whose evidence lives only in HTML docs - otherwise a prose-only scope forces a review of evidence that cannot exist there (ORC-1)');
  assert.deepStrictEqual(htmlHolders(emitReal(runtime.COMBINED_REVIEWER, 'design-review', ['s/design/adr.md'], {})), htmlHolders(emitReal(runtime.COMBINED_REVIEWER, 'impl-review', ['README.md', '.asd/runtime.js'], {})), 'the no-HTML predicate is phase-independent: a design-review scope of Markdown drafts only (prd and ux-spec disabled) carries it too');
  for (const html of ['docs/product/requirements/core.html', '.asd/rules/notes.html']) {
    assert.deepStrictEqual(htmlHolders(emitReal('quality', 'impl-review', ['README.md', html], {})), [], `${html}: any HTML file in scope keeps the HTML-evidence entries reviewed - framework .asd/ HTML included, since the predicate is about HTML evidence, not about UI surfaces`);
  }
  const frameworkHolders = (extra) => holders(emitReal('quality', 'impl-review', ['README.md'], extra), predicates.noSelfHosting);
  assert.strictEqual(frameworkHolders({}).length, 1, 'sprint-014 AC-4: without self-hosting exactly the Framework mode entry is n/a - a Framework-mode review is meaningless outside a self-hosting repo');
  assert.deepStrictEqual(frameworkHolders({ selfHosting: true }), [], 'sprint-014 AC-4: a self-hosting review keeps Framework mode reviewed - the README/rule-mirror check is its whole subject');
  const templatedHolders = (files) => holders(emitReal('quality', 'impl-review', files, { templates: ['plan.md'] }), predicates.noTemplated);
  assert.strictEqual(templatedHolders(['README.md', '.asd/runtime.js', 'mydocs/guide.md', 'x/myplan.md']).length, 1, 'sprint-014 AC-4: a scope with no templated artefact n/a\'s exactly the Template adherence entry - a docs-like prefix and a basename merely containing a template name are not templated');
  for (const file of ['x/plan.md', '.asd/templates/t_new.md', 'docs/architecture/core.md', '.asd/sprints/001-x/sprint.md']) {
    assert.deepStrictEqual(templatedHolders(['README.md', file]), [], `sprint-014 AC-4: ${file} is a templated artefact, so Template adherence must stay reviewed`);
  }

  const budgets = { '.asd/project/custom-coding-rules.md': '# Custom Coding Rules\n\n## Perf budgets\n\n- p95 under 200ms\n' };
  const efficiency = (files, customRules) => emitReal('efficiency', 'impl-review', files, { customRules });
  const prose = efficiency(['README.md'], {});
  const perfIds = holders(prose, predicates.perf);
  const budgetIds = holders(prose, predicates.noBudgets);
  assert.ok(perfIds.length > 1 && budgetIds.length === 1 && perfIds.includes(budgetIds[0]), `no budgets section and no executable file: every performance entry is n/a, and the budget-compliance one among them also carries "${predicates.noBudgets}". perf: ${perfIds}; no budgets: ${budgetIds}`);
  const executable = efficiency(['README.md', '.asd/runtime.js'], {});
  assert.deepStrictEqual([holders(executable, predicates.perf), holders(executable, predicates.noBudgets)], [[], budgetIds], 'an executable file in scope keeps every performance entry reviewed - the perf predicate is conjunctive - while budget compliance alone stays n/a for want of budgets');
  const budgeted = efficiency(['README.md'], budgets);
  assert.deepStrictEqual([holders(budgeted, predicates.perf), holders(budgeted, predicates.noBudgets)], [[], []], 'a perf-budgets heading in custom-coding-rules.md defeats both predicates');
  assert.deepStrictEqual(holders(efficiency(['tool.unknownext'], {}), predicates.perf), [], 'an unrecognised extension counts as executable, so the emitter fails toward reviewing more');

  const combinedDesignGated = (files) => holders(emitReal(runtime.COMBINED_REVIEWER, 'design-review', files, {}), predicates.phaseGate);
  for (const draft of ['s/design/ux-spec.html', 's/design/design-md-delta.yaml']) {
    assert.deepStrictEqual(combinedDesignGated(['s/design/prd.html']).filter((id) => !combinedDesignGated(['s/design/prd.html', draft]).includes(id)), uiIds, `${draft}: a ux-spec or design-system draft in design-review scope must lift exactly the UI conformance entry out of the phase gate; without either that entry is \`outside phase gate\` and token proposals go unreviewed (asd-phase-design-review.md step 7)`);
  }
  let gatedAnywhere = 0;
  for (const reviewer of internalReviewers()) {
    const designGated = holders(emitReal(reviewer, 'design-review', ['s/design/prd.html'], {}), predicates.phaseGate);
    const implGated = holders(emitReal(reviewer, 'impl-review', ['README.md'], {}), predicates.phaseGate);
    gatedAnywhere += designGated.length + implGated.length;
    assert.deepStrictEqual(designGated.filter((id) => implGated.includes(id)), [], `${reviewer}: no rubric entry may sit outside the phase gate in both phases - reviewed by nobody, ever, while every ledger validates`);
  }
  assert.ok(gatedAnywhere > 0, "the phase gate is assigned by the phase named in each rubric entry, so at least one real entry must be gated - zero means the name match stopped reaching the rubrics and the sweep above compared empty sets");

  const orphaned = agent('quality').replace(`### ${uiIds[0]}`, '### Renamed entry');
  assert.notStrictEqual(orphaned, agent('quality'), 'sanity: the rename must hit the heading the UI predicate targets');
  assert.throws(() => runtime.emitCoverageManifest({ reviewer: 'quality', phase: 'impl-review', rubric: orphaned, files: ['README.md'] }), /rubric entry missing/, 'renaming a rubric entry a standing predicate targets must fail every emit closed, naming the entry - silently dropping the predicate would force a full review where the rule allows n/a, and every run of the loop above proves the real rubrics still resolve');
});

test("runtime.js CLI: emit-manifest writes one stamped manifest per reviewer under the file name both review workflows dispatch from, whatever the scope size, and validate-ledger reads the ledger straight out of a reviewer's returned text", () => {
  const root = mkTempDir();
  const reviewer = 'quality';
  const manifestName = '<reviewer>.manifest.json';
  const selfHostingFlag = /\[(--self-hosting)\]/.exec(sectionOf('.asd/rules/review-policy.md', 'Coverage ledger'))[1];
  for (const rel of ['.asd/workflows/asd-phase-impl-review.md', '.asd/workflows/asd-phase-design-review.md']) {
    const flow = canonText(rel);
    assert.ok(flow.split('\n').some((line) => line.includes('self_hosting: enabled') && line.includes(`\`${selfHostingFlag}\``) && line.includes('emit-manifest')), `TST-2-1: ${rel} must add review-policy.md's \`${selfHostingFlag}\` to its emit-manifest step when self_hosting: enabled - dropped, a self-hosting review n/a's Documentation's Framework mode and validate-ledger accepts it`);
    assert.ok(flow.includes(`\`${manifestName}\``), `${rel} must name the manifest file it dispatches from exactly as emit-manifest writes it, or the orchestrator looks for a path that never appears`);
  }
  const scopeNames = (count) => Array.from({ length: count }, (_, index) => `src/file-${index + 1}.md`);
  const emit = (count, dir, extra = [], name = reviewer) => {
    fs.mkdirSync(dir, { recursive: true });
    const scopePath = path.join(dir, 'scope.txt');
    fs.writeFileSync(scopePath, `${scopeNames(count).join('\r\n')}\r\n\r\n`, 'utf8');
    return JSON.parse(runtimeCli(['emit-manifest', '--reviewer', name, '--phase', 'impl-review', ...extra, '--files', scopePath, '--out', dir], { stdio: 'pipe' }));
  };
  const read = (entry) => JSON.parse(fs.readFileSync(entry.manifest, 'utf8'));

  const small = emit(1, path.join(root, 'small'));
  const largeScope = runtime.WAVE_THRESHOLD_FILES * runtime.MAX_REVIEW_WAVES;
  const large = emit(largeScope, path.join(root, 'large'));
  for (const entry of [small, large]) {
    assert.deepStrictEqual(Object.keys(entry).sort(), ['digest', 'manifest'], 'without a range the CLI reports one manifest and its digest, as a single object - no .diff to name');
    assert.strictEqual(path.basename(entry.manifest), manifestName.replace('<reviewer>', reviewer), 'sprint-017 AC-5 (D7): a scope of any size is one manifest file - review waves bound its size, never a split into parts');
    assert.deepStrictEqual(fs.readdirSync(path.dirname(entry.manifest)).sort(), ['quality.manifest.json', 'scope.txt'], 'sprint-017 AC-5: nothing but the one manifest is written beside the scope list');
  }
  assert.deepStrictEqual(read(large).files, scopeNames(largeScope), 'the manifest carries the whole scope list, nothing dropped - here MAX_REVIEW_WAVES waves of WAVE_THRESHOLD_FILES files - and every path arrives clean from a CRLF list with a trailing blank line, as a Windows git diff --name-only writes it');

  const published = { vocabulary: runtime.LEDGER_VOCABULARY, row_example: runtime.LEDGER_ROW_EXAMPLE, n_a_shape: runtime.LEDGER_NA_SHAPE };
  const content = ['reviewer', 'phase', 'n_a', ...Object.keys(runtime.LEDGER_NA_SHAPE)];
  for (const entry of [small, large]) {
    const label = path.basename(entry.manifest);
    const onDisk = read(entry);
    assert.strictEqual(onDisk.digest, entry.digest, `${label}: the digest printed must be the digest written`);
    assert.strictEqual(onDisk.digest, runtime.coverageManifestDigest(onDisk), `${label}: a written manifest must carry its own digest, since validate-ledger recomputes it from the file`);
    assert.deepStrictEqual(Object.keys(onDisk).filter((key) => !content.includes(key) && key !== 'digest' && key !== 'ledger').sort(), Object.keys(published).sort(), `sprint-012 AC-1: ${label} must stamp exactly the published constants this test knows - one stamped without landing here would move every digest while the per-constant checks below never saw it`);
    const skeletonRows = (ids) => ids.map((i) => ({ i }));
    assert.deepStrictEqual(onDisk.ledger, { manifest_digest: onDisk.digest, findings: [], files: skeletonRows(onDisk.files), rules: skeletonRows(onDisk.rules), sections: skeletonRows(onDisk.sections) }, `sprint-021 AC-10: ${label} must carry the full ledger skeleton - the digest pre-filled, no findings, one row per manifest id in manifest order with only its status left to fill - so a reviewer never re-types a digest or an id`);
    for (const [field, constant] of Object.entries(published)) {
      assert.deepStrictEqual(onDisk[field], constant, `AC-6b/sprint-012 AC-1: ${label} must publish \`${field}\` from the validator's own constant, so the reviewer reads statuses, row shape and n_a shape off its own input instead of recalling rule prose`);
    }
    const withoutDigest = Object.assign({}, onDisk);
    delete withoutDigest.digest;
    delete withoutDigest.ledger;
    assert.strictEqual(onDisk.digest, runtime.fingerprint(withoutDigest), `AC-6b/sprint-021 AC-10: ${label}'s digest must be the hash of every field it carries but \`digest\` and the \`ledger\` skeleton, which holds the digest and so cannot sit inside it - published constants included; a field outside the identity could be edited on disk after stamping while every ledger citing that digest still validates. Expressed through the untouched \`fingerprint\` primitive so a change to the digester cannot move this expectation with it`);
  }
  assert.strictEqual(runtimeCli(['manifest-digest', '--manifest', small.manifest]).trim(), small.digest, 'review-policy.md "Coverage ledger": `manifest-digest --manifest <path>` verifies what emit-manifest stamped, so the two must agree on every emitted file');

  const customCommon = path.join(root, 'custom-common-rules.md');
  const customCoding = path.join(root, 'custom-coding-rules.md');
  fs.writeFileSync(customCommon, '# Custom Common Rules\n', 'utf8');
  fs.writeFileSync(customCoding, '# Custom Coding Rules\n\n## Perf budgets\n\n- p95 under 200ms\n', 'utf8');
  const perfHolders = (manifest) => Object.keys(manifest.n_a.rules).filter((id) => manifest.n_a.rules[id].includes(runtime.NA_PREDICATES.perf));
  const withoutRules = read(emit(1, path.join(root, 'no-custom'), [], 'efficiency'));
  assert.ok(perfHolders(withoutRules).length > 0, 'sanity: without --custom-rules a prose-only scope must n/a the performance sections, or the budgeted run below proves nothing');
  const withRules = read(emit(1, path.join(root, 'custom'), ['--custom-rules', `${customCommon},${customCoding}`], 'efficiency'));
  assert.deepStrictEqual(withRules.rules.slice(-2), [customCommon, customCoding], 'TST-1-1/TST-2-2: both review workflows pass --custom-rules as one comma-separated value, so each path must become its own custom-rule id, verbatim and in the order passed - otherwise every manifest silently drops its custom-rule rows');
  assert.deepStrictEqual(perfHolders(withRules), [], 'TST-1-1: the --custom-rules files must be read as the emitter\'s budgets input - a perf-budgets heading in the passed custom-coding-rules.md keeps every performance section reviewed');

  const nested = fs.readdirSync(path.join(REPO_ROOT, '.asd/templates'), { recursive: true }).map((entry) => String(entry).split(path.sep)).find((parts) => parts.length > 1 && parts[parts.length - 1].startsWith('t_'));
  assert.ok(nested, 'sanity: .asd/templates must hold a nested t_ file for the recursion check below');
  const documentation = (name, files, extra = []) => {
    const dir = path.join(root, name);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'scope.txt'), files.join('\n'), 'utf8');
    const entry = JSON.parse(runtimeCli(['emit-manifest', '--reviewer', 'quality', '--phase', 'impl-review', ...extra, '--files', path.join(dir, 'scope.txt'), '--out', dir], { stdio: 'pipe' }));
    const onDisk = read(entry);
    return (predicate) => Object.keys(onDisk.n_a.rules).filter((id) => onDisk.n_a.rules[id].includes(predicate));
  };
  const plain = documentation('doc-plain', ['src/a.md']);
  assert.ok(plain(runtime.NA_PREDICATES.noSelfHosting).length === 1 && plain(runtime.NA_PREDICATES.noTemplated).length === 1, 'sprint-014 AC-4: a CLI emit without --self-hosting over an untemplated scope carries both new standing predicates');
  const hosted = documentation('doc-hosted', ['src/a.md', `reviews/${nested[nested.length - 1].slice(2)}`], ['--self-hosting']);
  assert.deepStrictEqual([hosted(runtime.NA_PREDICATES.noSelfHosting), hosted(runtime.NA_PREDICATES.noTemplated)], [[], []], `sprint-014 AC-4: --self-hosting ahead of --files must parse as a boolean both review workflows pass, and the CLI must read template names from every depth of .asd/templates - ${nested.join('/')} included`);
  for (const file of ['AGENTS.md', 'CLAUDE.md', 'src/AGENTS.md']) {
    assert.deepStrictEqual(documentation(`doc-${file.replace(/\W/g, '-')}`, ['src/a.md', file])(runtime.NA_PREDICATES.noTemplated), [], `TST-1-2: against the real .asd/templates list ${file} is templated by basename at any depth, so Template adherence must stay reviewed - the rule isTemplated's doc comment states`);
  }

  const manifest = JSON.parse(fs.readFileSync(small.manifest, 'utf8'));
  const vocabulary = runtime.LEDGER_VOCABULARY;
  const ledger = {
    ...manifest.ledger,
    files: manifest.ledger.files.map(({ i }) => ({ i, s: vocabulary.files[0] })),
    rules: manifest.ledger.rules.map(({ i }) => (manifest.n_a.rules[i] ? { i, s: vocabulary.p, p: manifest.n_a.rules[i][0] } : { i, s: vocabulary.rules[0] })),
    sections: manifest.ledger.sections.map(({ i }) => ({ i, s: vocabulary.sections[0] })),
  };
  const findingsPath = path.join(root, 'findings.json');
  fs.writeFileSync(findingsPath, '[]', 'utf8');
  const block = `\`\`\`json\n${JSON.stringify(ledger, null, 2)}\n\`\`\`\n`;
  const returnedText = (ledgerBlocks) => `[REVIEW-impl-${reviewer}]: APPROVE\n\nNo findings.\n\nA row looks like:\n\n\`\`\`json\n${JSON.stringify(runtime.LEDGER_ROW_EXAMPLE)}\n\`\`\`\n\n${ledgerBlocks}`;
  const validate = (text, name) => {
    const ledgerPath = path.join(root, name);
    fs.writeFileSync(ledgerPath, text, 'utf8');
    try {
      return JSON.parse(runtimeCli(['validate-ledger', '--manifest', small.manifest, '--ledger', ledgerPath, '--findings', findingsPath], { stdio: 'pipe' }));
    } catch (error) {
      return `exit ${error.status}: ${String(error.stderr).trim()}`;
    }
  };
  assert.deepStrictEqual(validate(returnedText(block), 'returned.md'), { ok: true }, "AC-12: --ledger must take the reviewer's returned text as-is and read its one fenced block carrying `manifest_digest`, skipping every other fenced block - a quoted JSON excerpt such as a row example included - so the orchestrator no longer extracts the block to bare JSON before validating");
  const twice = validate(returnedText(`${block}\n${block}`), 'twice.md');
  assert.ok(typeof twice === 'string' && twice.startsWith('exit 2'), `returned text carrying two ledger blocks must be rejected rather than resolved by picking one - a reviewer could otherwise ship a ledger the orchestrator never validated. Got: ${JSON.stringify(twice)}`);
});

/** A test plan whose Defects table is t_test-plan.md's own header, plus a row builder keyed by that header's column names. */
function defectPlanFixture() {
  const table = sectionOf('.asd/templates/t_test-plan.md', 'Defects').split('\n').filter((line) => line.startsWith('|'));
  assert.ok(table.length >= 2, 't_test-plan.md "Defects" must keep its table header and separator');
  const columns = table[0].split('|').slice(1, -1).map((cell) => cell.trim());
  const row = (id, entry, [location, symptom, failingTest], status = 'pending') => {
    const cells = { ID: id, Entry: entry, Location: location, Symptom: symptom, 'Failing test': failingTest, Status: status };
    return `| ${columns.map((name) => (Object.hasOwn(cells, name) ? cells[name] : '')).join(' | ')} |`;
  };
  const plan = (rows, eol = '\n') => ['# Test plan', '', '## Defects', '', table[0], table[1], ...rows, '', '## Manual verification (optional)', ''].join(eol);
  return { row, plan };
}

const DEFECT_PARSER = ['tests/run.js:120', 'AssertionError [ERR_ASSERTION]: expected a \\| b', 'parser: rejects a tab indent'];

const DEFECT_SPLITTER = ['.asd/runtime.js:40:7', 'TypeError: Cannot read properties of undefined', 'runtime: splits a table row'];

test('sprint-013 AC-1/AC-2: defect-stalemate compares the identity sets of two consecutive impl-test entries that routed defects - file path without its line, verbatim runner line, failing test - never D-N ids, row order or impl-review rows, and its digest names the latest set', () => {
  const { row, plan } = defectPlanFixture();
  const verdict = (rows, eol) => runtime.defectStalemate(plan(rows, eol));
  const moved = (tuple, location) => [location, tuple[1], tuple[2]];
  const latest = [row('D-3', '2', moved(DEFECT_SPLITTER, '`.asd/runtime.js:88`')), row('D-4', '2', moved(DEFECT_PARSER, 'tests/run.js:131'))];
  const repeat = [row('D-1', '1', DEFECT_PARSER, 'fixed'), row('D-2', '1', DEFECT_SPLITTER, 'fixed'), ...latest];

  const repeated = verdict(repeat);
  assert.strictEqual(repeated.stalemate, true, 'the same file paths, runner lines and failing tests routed twice are a stalemate, although every line number moved, the ids differ and the rows are reordered');
  assert.deepStrictEqual(verdict([...latest].reverse()), { stalemate: false, digest: repeated.digest }, 'the digest is the latest set alone, independent of row order - a decisions-log answer is keyed to it');
  assert.deepStrictEqual(verdict(repeat, '\r\n'), repeated, 'a CRLF test plan must compare exactly as its LF form');

  for (const [field, index, value] of [['file path', 0, 'tests/other.js:131'], ['runner failure line', 1, 'AssertionError [ERR_ASSERTION]: expected a'], ['failing test', 2, 'parser: rejects a tab']]) {
    const changed = DEFECT_PARSER.map((cell, at) => (at === index ? value : cell));
    assert.strictEqual(verdict([row('D-1', '1', DEFECT_PARSER), row('D-2', '2', changed)]).stalemate, false, `a changed ${field} is a different defect - AC-2 compares the runner's text verbatim, so a reworded symptom fails open by design`);
  }
  assert.strictEqual(verdict([row('D-1', '1', DEFECT_PARSER), row('D-2', '1', DEFECT_SPLITTER), row('D-3', '2', DEFECT_PARSER)]).stalemate, false, 'a subset of the previous set is progress, not a stalemate');
  assert.strictEqual(verdict([row('D-1', '1', DEFECT_PARSER), row('D-2', '2', DEFECT_PARSER), row('D-3', '2', DEFECT_SPLITTER)]).stalemate, false, 'a superset of the previous set is not a stalemate');

  assert.strictEqual(verdict([row('D-1', '1', DEFECT_PARSER), row('D-2', '2', DEFECT_PARSER), row('D-3', 'impl-review', DEFECT_SPLITTER)]).stalemate, true, 'an impl-review row never joins an entry set, the latest included');
  assert.strictEqual(verdict([row('D-1', 'impl-review', DEFECT_PARSER), row('D-2', '1', DEFECT_PARSER)]).stalemate, false, 'an impl-review row is not an impl-test entry, so one routing entry has nothing to repeat');
  assert.strictEqual(verdict([row('D-1', '1', DEFECT_SPLITTER), row('D-2', '2', DEFECT_PARSER), row('D-3', '3', DEFECT_PARSER)]).stalemate, true, 'only the last two entries are compared - an older entry routing a different set does not break a consecutive repeat');
  assert.strictEqual(verdict([row('D-1', '1', DEFECT_SPLITTER), row('D-2', '2', DEFECT_PARSER), row('D-3', '4', DEFECT_PARSER)]).stalemate, false, 'a green entry between two routings of the same set breaks the run - entries 2 and 4 are not consecutive (sprint-lifecycle.md "Impl-test phase")');
  assert.strictEqual(verdict([row('D-1', '9', DEFECT_PARSER), row('D-2', '10', DEFECT_PARSER), row('D-3', '2', DEFECT_SPLITTER)]).stalemate, true, 'entries order by number, so entry 10 follows entry 9');

  const single = verdict([row('D-1', '1', DEFECT_PARSER)]);
  assert.ok(single.stalemate === false && /^[0-9a-f]{64}$/.test(single.digest), `a first routing is never a stalemate but still names its set: ${JSON.stringify(single)}`);
  assert.deepStrictEqual(verdict([]), { stalemate: false, digest: null }, 'no defect rows: nothing to compare');
  assert.deepStrictEqual(runtime.defectStalemate(readRepoFile('.asd/templates/t_test-plan.md')), { stalemate: false, digest: null }, 't_test-plan.md as shipped must parse - its placeholder row routes no entry');

  assert.throws(() => runtime.defectStalemate('# Test plan\n'), /Defects/, 'a plan without a Defects section must fail, never report no stalemate');
  assert.throws(() => runtime.defectStalemate(plan([row('D-1', '1', DEFECT_PARSER)]).replace('| Entry |', '| Round |')), /Entry/, 'a Defects table missing an identity column must fail closed');
  assert.throws(() => verdict([row('D-1', '1', ['a.js', 'expected a | b', 'parser'])]), /malformed/, 'an unescaped pipe in a cell shifts every column after it, so the row must fail rather than compare the wrong fields');
});

test('sprint-013 AC-2 D-1: defect-stalemate rejects a Defects row whose Entry is neither an Entry log number nor impl-review - skipping it drops that entry\'s set and a real stalemate fails open', () => {
  const { row, plan } = defectPlanFixture();
  assert.doesNotThrow(() => runtime.defectStalemate(plan([row('D-1', '1', DEFECT_PARSER), row('D-2', 'impl-review', DEFECT_PARSER)])), 'sanity: the two Entry forms t_test-plan.md defines must parse');
  for (const entry of ['Entry 2', '#2', 'impl review', '']) {
    assert.throws(() => runtime.defectStalemate(plan([row('D-1', '1', DEFECT_PARSER), row('D-2', entry, DEFECT_PARSER)])), Error, `Entry ${JSON.stringify(entry)} is off-template (t_test-plan.md: \`Entry log\` N or impl-review) - read as "not an impl-test entry" it hides entry 2's repeat of entry 1 and the loop runs on uncapped`);
  }
});

test('sprint-014 AC-3: defect-stalemate fails closed on a second ## Defects section, exact or suffixed, naming every heading line, and names the line of a missing column, a malformed separator or a malformed row', () => {
  const { row, plan } = defectPlanFixture();
  const rejection = (text) => {
    try {
      return `accepted: ${JSON.stringify(runtime.defectStalemate(text))}`;
    } catch (error) {
      return error.message;
    }
  };
  const lineOf = (text, match) => text.split('\n').findIndex(match) + 1;
  const first = plan([row('D-1', '1', DEFECT_PARSER)]);
  for (const heading of ['## Defects', '## Defects (entry 2)']) {
    const second = plan([row('D-2', '2', DEFECT_PARSER)]).split('\n').slice(2).join('\n').replace('## Defects', heading);
    const doubled = `${first}\n${second}`;
    const lines = doubled.split('\n').flatMap((line, index) => (line.startsWith('## Defects') ? [index + 1] : []));
    assert.strictEqual(lines.length, 2, 'sanity: the fixture must carry exactly two Defects headings');
    const message = rejection(doubled);
    assert.ok(new RegExp(`^test-plan has 2 ## Defects sections at lines ${lines.join(', ')}$`).test(message), `"${heading}": entry 2 repeats entry 1 across two sections, so reading either one alone reports no stalemate and the impl-test loop runs uncapped - more than one section must fail closed and name each heading's line so the author can merge them. Got: ${message}`);
  }

  const rows = [row('D-1', '1', DEFECT_PARSER), row('D-2', '2', DEFECT_PARSER)];
  const readable = plan(rows);
  const headerLine = lineOf(readable, (line) => line.includes('| Entry |'));
  const renamed = readable.replace('| Entry |', '| Round |');
  assert.match(rejection(renamed), new RegExp(`^line ${headerLine}: .*Entry`), 'a missing identity column must name the header line');
  const noSeparator = readable.split('\n').filter((_, index) => index !== headerLine).join('\n');
  assert.match(rejection(noSeparator), new RegExp(`^line ${headerLine + 1}: .*separator`), 'without a separator the first data row would be consumed as one and its defect silently dropped from the entry set - the line that stands where the separator belongs must be named instead');
  const extraCell = plan([rows[0], `${rows[1]} extra |`]);
  assert.match(rejection(extraCell), new RegExp(`^line ${lineOf(extraCell, (line) => line.endsWith('extra |'))}: .*malformed`), 'a malformed row must name its own line, not only its cells');
});

test('sprint-013 AC-3: the defect-stalemate CLI prints {stalemate, digest} and exits 0 on a readable plan, and exits 2 with nothing on stdout when --plan is missing or the Defects table is malformed', () => {
  const root = mkTempDir();
  const { row, plan } = defectPlanFixture();
  const write = (name, text) => {
    const file = path.join(root, name);
    fs.writeFileSync(file, text, 'utf8');
    return file;
  };
  const readable = plan([row('D-1', '1', DEFECT_PARSER), row('D-2', '2', DEFECT_PARSER)]);
  assert.deepStrictEqual(JSON.parse(runtimeCli(['defect-stalemate', '--plan', write('plan.md', readable)])), runtime.defectStalemate(readable), 'the CLI step 9 runs must print what the comparer returns');

  const run = (args) => {
    try {
      return { status: 0, stdout: runtimeCli(['defect-stalemate', ...args], { stdio: 'pipe' }) };
    } catch (error) {
      return { status: error.status, stdout: String(error.stdout) };
    }
  };
  for (const [label, args] of [
    ['missing --plan', []],
    ['no Defects section', ['--plan', write('none.md', '# Test plan\n')]],
    ['row with an extra cell', ['--plan', write('bad.md', plan([`${row('D-1', '1', DEFECT_PARSER)} extra |`]))]],
    ['two Defects sections', ['--plan', write('two.md', `${readable}\n${plan([row('D-3', '3', DEFECT_PARSER)]).split('\n').slice(2).join('\n')}`)]],
  ]) {
    assert.deepStrictEqual(run(args), { status: 2, stdout: '' }, `${label}: step 9 must never read a verdict from a plan the comparer could not parse`);
  }
});

test('sprint-015 AC-4/AC-5: emit-manifest --base/--head writes each manifest\'s .diff over its own files, grants the pure-rename n/a only to a rename git reports with identical content and mode, validate-ledger accepts that row nowhere else, and the range is refused outside impl-review', async () => {
  const sandbox = sandboxGitRepo();
  const { repo, env, git } = sandbox;
  const body = (tag) => Array.from({ length: 20 }, (_, index) => `${tag} line ${index + 1}`).join('\n') + '\n';
  const testPlan = '.asd/sprints/015-x/test-plan.md';
  const [base, head] = await importCommits(sandbox, [
    { 'src/pure.js': body('pure'), 'src/edited.js': body('edited'), 'src/chmod.js': body('chmod'), 'src/kept.js': body('kept'), 'tests/kept.test.js': body('test'), [testPlan]: body('plan') },
    {
      'src/pure.js': null, 'src/edited.js': null, 'src/chmod.js': null,
      'lib/pure.js': body('pure'), 'lib/edited.js': body('edited').replace('line 1\n', 'line one\n'), 'lib/chmod.js': { content: body('chmod'), mode: '100755' },
      'src/kept.js': `${body('kept')}appended\n`, 'tests/kept.test.js': `${body('test')}appended\n`, [testPlan]: `${body('plan')}suite run recorded\n`,
    },
  ]);
  const range = ['--base', base, '--head', head];

  const work = mkTempDir();
  const list = (name, files) => {
    const file = path.join(work, name);
    fs.writeFileSync(file, `${files.join('\n')}\n`, 'utf8');
    return file;
  };
  const scope = git('diff', '--name-only', '-M', `${base}...${head}`, '--', '.', ':!.asd/sprints/**').trim().split('\n');
  assert.deepStrictEqual(scope.slice().sort(), ['lib/chmod.js', 'lib/edited.js', 'lib/pure.js', 'src/kept.js', 'tests/kept.test.js'], 'sanity: the scope is the renamed destinations plus the edits, the sprint folder excluded as the impl-review pathspec excludes it');
  const emit = async (reviewer, files, extra, phase = 'impl-review') => {
    const out = fs.mkdtempSync(path.join(work, `${reviewer}-`));
    const emitted = await runtimeCliResultAsync(['emit-manifest', '--reviewer', reviewer, '--phase', phase, '--files', list(`${path.basename(out)}.txt`, files), '--out', out, ...extra], { cwd: repo, env });
    assert.strictEqual(emitted.status, 0, JSON.stringify(emitted));
    return emitted.result;
  };
  const read = (entry) => JSON.parse(fs.readFileSync(entry.manifest, 'utf8'));
  const headers = (entry) => Object.fromEntries([...fs.readFileSync(entry.diff, 'utf8').matchAll(/^diff --git a\/(\S+) b\/(\S+)$/gm)].map((match) => [match[2], match[1]]));
  const pure = { 'lib/pure.js': [runtime.NA_PREDICATES.pureRename] };

  const [whole, quality, unchangedPlan, empty] = await Promise.all([
    emit('efficiency', scope, range),
    emit('quality', scope, ['--test-plan', testPlan, ...range]),
    emit('quality', scope, ['--test-plan', '.asd/sprints/015-x/test-plan.entry-01.md', ...range]),
    emit('quality', [], range),
  ]);
  const manifest = read(whole);
  assert.deepStrictEqual(manifest.n_a.files, pure, 'AC-5: only the identical-content, identical-mode rename is behaviour-neutral by proof - an edited rename, a mode-changing rename and a plain edit keep their full review');
  assert.deepStrictEqual(headers(whole), { 'lib/chmod.js': 'src/chmod.js', 'lib/edited.js': 'src/edited.js', 'lib/pure.js': 'src/pure.js', 'src/kept.js': 'src/kept.js', 'tests/kept.test.js': 'tests/kept.test.js' }, 'AC-4: the patch covers every listed file, each rename paired with its source so the reviewer sees a rename, not an add');

  assert.deepStrictEqual(read(quality).files, [...scope, testPlan], 'AC-2: the CLI builds Quality\'s list through reviewerFiles, test-plan path appended');
  assert.deepStrictEqual(headers(quality), { ...headers(whole), [testPlan]: testPlan }, 'sprint-017 D9d: Quality\'s .diff covers its whole list over the manifest range, test-plan path included - the diff file is the change content for exactly that list (AC-8), so a test-plan edit it left out would be read by no one as a change');
  assert.deepStrictEqual(Object.keys(headers(unchangedPlan)), Object.keys(headers(whole)), 'a listed test-plan path the range never touched contributes no hunk and no error');
  assert.deepStrictEqual([read(empty).files, fs.readFileSync(empty.diff, 'utf8')], [[], ''], 'an empty list still gets its .diff, empty, so the payload path always resolves');

  const vocabulary = runtime.LEDGER_VOCABULARY;
  const ledger = (naFile) => ({
    manifest_digest: manifest.digest, findings: [],
    files: manifest.files.map((i) => (i === naFile ? { i, s: vocabulary.p, p: runtime.NA_PREDICATES.pureRename } : { i, s: vocabulary.files[0] })),
    rules: manifest.rules.map((i) => (manifest.n_a.rules[i] ? { i, s: vocabulary.p, p: manifest.n_a.rules[i][0] } : { i, s: vocabulary.rules[0] })),
    sections: manifest.sections.map((i) => ({ i, s: vocabulary.sections[0] })),
  });
  assert.deepStrictEqual(runtime.validateCoverageLedger(manifest, ledger('lib/pure.js'), []), { ok: true }, 'AC-5: the compact row validates on the file the runtime proved');
  for (const file of scope.filter((name) => name !== 'lib/pure.js')) {
    assert.throws(() => runtime.validateCoverageLedger(manifest, ledger(file), []), /predicate/, `AC-5: ${file}: a reviewer asserting the pure-rename row on a file the runtime did not prove is an unauthorized n/a`);
  }

  const out = mkTempDir();
  const refused = await runtimeCliResultAsync(['emit-manifest', '--reviewer', runtime.COMBINED_REVIEWER, '--phase', 'design-review', '--files', list('design.txt', scope), '--out', out, ...range], { cwd: repo, env });
  assert.ok(refused.status === 2 && /impl-review only/.test(refused.stderr) && fs.readdirSync(out).length === 0, `design-review has no git range, so --base/--head must exit 2 before writing anything. Got: ${JSON.stringify(refused)}`);
});

test('sprint-017 AC-4/AC-8 (D6/D9a-c): emit-manifest --full-files/--full-base joins the listed files to the manifest and diffs them over the wider range, and --reviewer external writes the scope manifest t_review-scope.json declares plus its diff for the same list, with no rubric manifest', async () => {
  const sandbox = sandboxGitRepo();
  const { repo, env } = sandbox;
  const body = (tag) => Array.from({ length: 20 }, (_, index) => `${tag} line ${index + 1}`).join('\n') + '\n';
  const [base, mid, head] = await importCommits(sandbox, [
    { 'src/earlier.js': body('earlier'), 'src/current.js': body('current') },
    { 'src/earlier.js': body('earlier').replace('earlier line 1\n', 'earlier wave edit\n') },
    { 'src/earlier.js': body('earlier').replace('earlier line 1\n', 'earlier wave edit\n').replace('earlier line 20\n', 'review fix edit\n'), 'src/current.js': body('current').replace('current line 1\n', 'current wave edit\n') },
  ]);

  const work = mkTempDir();
  let lists = 0;
  const list = (files) => {
    lists += 1;
    const file = path.join(work, `list-${lists}.txt`);
    fs.writeFileSync(file, `${files.join('\n')}\n`, 'utf8');
    return file;
  };
  const cli = async (reviewer, files, extra) => {
    const out = fs.mkdtempSync(path.join(work, `${reviewer}-`));
    return { out, ...(await runtimeCliResultAsync(['emit-manifest', '--reviewer', reviewer, '--files', list(files), '--out', out, ...extra], { cwd: repo, env })) };
  };
  const patch = (file) => fs.readFileSync(file, 'utf8');
  const hunkOf = (text, file) => text.split(/^(?=diff --git )/m).filter((block) => block.startsWith(`diff --git a/${file} `));
  const range = ['--phase', 'impl-review', '--base', mid, '--head', head];
  const full = (files) => ['--full-files', list(files), '--full-base', base];
  const declared = declaredScopeFields();

  const fullRefusals = [
    ['--full-files without a range', ['--phase', 'impl-review', ...full(['src/earlier.js'])], /need --base\/--head/],
    ['--full-base without --full-files', [...range, '--full-base', base], /--full-files <path> required/],
    ['--full-files in design-review', ['--phase', 'design-review', ...full(['src/earlier.js'])], /need --base\/--head/, runtime.COMBINED_REVIEWER],
  ];
  const scopeRefusals = [
    ['impl-review External without --wave', runtime.EXTERNAL_REVIEWER, [...range, '--iteration', '1'], /--wave <k> is required/],
    ['impl-review External without a range', runtime.EXTERNAL_REVIEWER, ['--phase', 'impl-review', '--iteration', '1', '--wave', '1'], /--base\/--head required/],
    ['design-review External with --wave', runtime.EXTERNAL_REVIEWER, ['--phase', 'design-review', '--iteration', '1', '--wave', '1'], /applies to it only/],
    ['External with a non-positive iteration', runtime.EXTERNAL_REVIEWER, [...range, '--iteration', '0', '--wave', '1'], /positive integer/],
    ['an internal reviewer with --iteration', 'quality', [...range, '--iteration', '1'], /apply to --reviewer external only/],
  ];
  const [narrow, joined, both, external, twin, designExternal, fullRefused, scopeRefused] = await Promise.all([
    cli('quality', ['src/earlier.js'], range),
    cli('quality', ['src/current.js'], [...range, ...full(['src/earlier.js'])]),
    cli('quality', ['src/current.js', 'src/earlier.js'], [...range, ...full(['src/earlier.js'])]),
    cli(runtime.EXTERNAL_REVIEWER, ['src/current.js'], [...range, '--iteration', '1', '--wave', '2', ...full(['src/earlier.js'])]),
    cli('efficiency', ['src/current.js'], [...range, ...full(['src/earlier.js'])]),
    cli(runtime.EXTERNAL_REVIEWER, ['s/design/prd.html'], ['--phase', 'design-review', '--iteration', '1']),
    Promise.all(fullRefusals.map(([, extra, , reviewer = 'quality']) => cli(reviewer, ['src/current.js'], extra))),
    Promise.all(scopeRefusals.map(([, reviewer, extra]) => cli(reviewer, ['src/current.js'], extra))),
  ]);
  assert.ok(!patch(narrow.result.diff).includes('earlier wave edit') && patch(narrow.result.diff).includes('review fix edit'), 'sanity: over --base...--head alone the earlier wave\'s edit is out of the patch');

  assert.strictEqual(joined.status, 0, `sanity: the emit must succeed, got ${joined.stderr}`);
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(joined.result.manifest, 'utf8')).files, ['src/current.js', 'src/earlier.js'], 'D9c: --full-files entries join the manifest list after the scope list, so they get ledger rows and valid finding locations (AC-8 (1))');
  const joinedPatch = patch(joined.result.diff);
  const [earlierHunk] = hunkOf(joinedPatch, 'src/earlier.js');
  assert.ok(earlierHunk && earlierHunk.includes('earlier wave edit') && earlierHunk.includes('review fix edit'), 'D6/D9c: a --full-files entry is diffed over --full-base...--head, so wave iteration 1 and a carried-over Unreviewed file show every change since the base branch, not only the incremental range');
  const [currentHunk] = hunkOf(joinedPatch, 'src/current.js');
  assert.ok(currentHunk && currentHunk.includes('current wave edit'), 'a scope-only file keeps the --base...--head range in the same .diff');

  const bothPatch = patch(both.result.diff);
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(both.result.manifest, 'utf8')).files, ['src/current.js', 'src/earlier.js'], 'a file on both lists is listed once');
  assert.ok(hunkOf(bothPatch, 'src/earlier.js').length === 1 && hunkOf(bothPatch, 'src/earlier.js')[0].includes('earlier wave edit'), 'a file on both lists takes the wider range, once - never two overlapping hunks the reviewer must reconcile');

  fullRefusals.forEach(([label, , pattern], index) => {
    const refused = fullRefused[index];
    assert.ok(refused.status === 2 && pattern.test(refused.stderr) && fs.readdirSync(refused.out).length === 0, `${label}: must exit 2 before writing anything. Got: ${JSON.stringify(refused)}`);
  });

  assert.strictEqual(external.status, 0, `sanity: the External emit must succeed, got ${external.stderr}`);
  const externalFiles = fs.readdirSync(external.out).sort();
  const externalDiffNames = externalFiles.filter((name) => name.endsWith('.diff'));
  assert.deepStrictEqual(externalFiles.filter((name) => !name.endsWith('.diff')), ['external.scope.json'], 'D9a: External Review gets its scope manifest - no rubric-derived coverage manifest, since it keeps no ledger');
  assert.strictEqual(externalDiffNames.length, 1, 'EFF-2: exactly one diff file for this list and range - named by its inputs, not by the reviewer');
  const scopeJson = JSON.parse(fs.readFileSync(path.join(external.out, 'external.scope.json'), 'utf8'));
  assert.deepStrictEqual(Object.keys(scopeJson).sort(), declared.slice().sort(), 'D9b: the impl-review scope manifest carries exactly the fields external-review.md declares and t_review-scope.json ships');
  assert.deepStrictEqual(scopeJson, { phase: 'impl-review', iteration: 1, wave: 2, files: ['src/current.js', 'src/earlier.js'], diff: path.join(external.out, externalDiffNames[0]) }, 'AC-8: External Review receives the same explicit list an internal reviewer would, and the path of the precomputed diff for exactly that list');
  assert.deepStrictEqual(external.result, { scope: path.join(external.out, 'external.scope.json'), diff: scopeJson.diff }, 'the CLI names both written paths');
  assert.ok(hunkOf(patch(scopeJson.diff), 'src/earlier.js')[0].includes('earlier wave edit'), 'D9c: a carried-over or wave-list file reaches External Review diffed over the wider range too');

  const twinDiffName = path.basename(twin.result.diff);
  assert.strictEqual(twinDiffName, path.basename(joined.result.diff), 'EFF-2: two manifests sharing the same file list and ranges share the identically fingerprinted .diff name, so a shared file+range never writes a duplicate byte-identical patch');

  const sharedOut = fs.mkdtempSync(path.join(work, 'shared-'));
  const emitInto = (reviewer, files, extra) => runtimeCliResultAsync(['emit-manifest', '--reviewer', reviewer, '--files', list(files), '--out', sharedOut, ...extra], { cwd: repo, env });
  const diffsOf = () => fs.readdirSync(sharedOut).filter((name) => name.endsWith('.diff'));
  const [wholeShared, planShared] = await Promise.all([emitInto('efficiency', ['src/current.js'], range), emitInto('quality', ['src/current.js'], [...range, '--test-plan', 'src/earlier.js'])]);
  assert.strictEqual(diffsOf().length, 2, 'TST-1: two reviewers with differing lists over one shared out dir write two distinct .diff files, never a shared or skipped one');
  assert.notStrictEqual(path.basename(wholeShared.result.diff), path.basename(planShared.result.diff), 'TST-1: differing lists must fingerprint to different names');
  assert.ok(hunkOf(patch(wholeShared.result.diff), 'src/current.js').length === 1 && hunkOf(patch(wholeShared.result.diff), 'src/earlier.js').length === 0, 'TST-1: efficiency\'s .diff carries only its own list\'s headers');
  assert.ok(hunkOf(patch(planShared.result.diff), 'src/earlier.js').length === 1 && hunkOf(patch(planShared.result.diff), 'src/current.js').length === 1, 'TST-1: quality\'s .diff carries its scope list plus the --test-plan path it adds');
  await emitInto('efficiency', ['src/current.js'], range);
  assert.strictEqual(diffsOf().length, 2, 'TST-1: re-emitting the same list and range into the shared dir must not add a second .diff');

  const designScope = JSON.parse(fs.readFileSync(path.join(designExternal.out, 'external.scope.json'), 'utf8'));
  assert.deepStrictEqual(designScope, { phase: 'design-review', iteration: 1, files: ['s/design/prd.html'], diff: null }, 'D9b/D9e: design-review has no waves and, at iteration 1, no diff - the field travels null rather than pointing at a file that was never written');
  assert.deepStrictEqual(Object.keys(designScope).sort(), declared.filter((field) => field !== 'wave').sort(), 'the design-review manifest is the declared set minus the impl-review-only `wave`');
  assert.deepStrictEqual(fs.readdirSync(designExternal.out), ['external.scope.json'], 'no .diff is written when there is nothing to diff against');

  scopeRefusals.forEach(([label, , , pattern], index) => {
    const refused = scopeRefused[index];
    assert.ok(refused.status === 2 && pattern.test(refused.stderr), `${label}: must exit 2. Got: ${JSON.stringify(refused)}`);
    assert.ok(!fs.existsSync(path.join(refused.out, 'external.scope.json')), `${label}: no scope manifest may be written for a refused emit`);
  });
});

test('sprint-017 AC-1 (D1/D2), sprint-023 AC-1, sprint-028 AC-21: review-waves measures a real git range over the scope list - binary files and pure renames 0 lines, an edited rename at its destination, the patch a reviewer reads as bytes - reports the file count, bytes and thresholds it applied, and writes waves.json only for a division it accepts', async () => {
  const sandbox = sandboxGitRepo();
  const { repo, env, git } = sandbox;
  const lines = (tag, count) => Array.from({ length: count }, (_, index) => `${tag} line ${index + 1}`).join('\n') + '\n';
  const threshold = runtime.WAVE_THRESHOLD_LINES;
  const thresholds = { lines: threshold, files: runtime.WAVE_THRESHOLD_FILES, bytes: runtime.WAVE_THRESHOLD_BYTES };
  const [base, head] = await importCommits(sandbox, [
    { 'src/pure.js': lines('pure', 20), 'src/edited.js': lines('edited', 20), 'assets/logo.bin': Buffer.from([0, 1, 2, 3, 0, 255]) },
    {
      'src/pure.js': null, 'src/edited.js': null, 'lib/pure.js': lines('pure', 20), 'lib/edited.js': lines('edited', 20).replace('edited line 1\n', 'edited line one\n'),
      'assets/logo.bin': Buffer.from([0, 9, 9, 9, 0, 255, 7]), 'src/big.js': lines('big', threshold), 'src/unlisted.js': lines('unlisted', 50),
    },
  ]);

  const work = mkTempDir();
  const write = (name, content) => {
    const file = path.join(work, name);
    fs.writeFileSync(file, content, 'utf8');
    return file;
  };
  const run = (args) => runtimeCliResultAsync(['review-waves', ...args], { cwd: repo, env });
  const scope = ['lib/pure.js', 'lib/edited.js', 'assets/logo.bin', 'src/big.js'];
  const scopeFile = write('scope.txt', `${scope.join('\n')}\n`);
  const range = ['--files', scopeFile, '--base', base, '--head', head];

  const patchBytes = (listed) => Buffer.byteLength(git('diff', '-M', '--no-color', `${base}...${head}`, '--', ...listed, 'src/pure.js', 'src/edited.js'));
  const out = path.join(work, 'reviews/impl/waves.json');
  const division = [['src/big.js'], ['lib/pure.js', 'lib/edited.js', 'assets/logo.bin']];
  const smallScope = ['lib/pure.js', 'lib/edited.js', 'assets/logo.bin'];
  const singleOut = path.join(work, 'single/waves.json');
  const refusals = [
    ['a one-wave division of a two-wave scope', [...range, '--division', write('one.json', JSON.stringify([scope])), '--out', path.join(work, 'one/waves.json')], /exactly 2 waves/],
    ['a division missing a scope file', [...range, '--division', write('short.json', JSON.stringify([['src/big.js'], ['lib/pure.js']])), '--out', path.join(work, 'short/waves.json')], /in no wave/],
    ['--division without --out', [...range, '--division', write('lonely.json', JSON.stringify(division))], /go together/],
    ['a missing --head', ['--files', scopeFile, '--base', base], /--head/],
  ];
  const [measured, onlySmall, accepted, single, refused] = await Promise.all([
    run(range),
    run(['--files', write('small.txt', `${smallScope.join('\n')}\n`), '--base', base, '--head', head]),
    run([...range, '--division', write('division.json', JSON.stringify(division)), '--out', out]),
    run([...range, '--single', '--division', write('single.json', JSON.stringify([scope])), '--out', singleOut]),
    Promise.all(refusals.map(([, args]) => run(args))),
  ]);
  assert.deepStrictEqual(measured, { status: 0, result: { lines: threshold + 2, files: scope.length, bytes: patchBytes(scope), thresholds, waves: 2 } }, `D1: ${threshold} added lines plus the edited rename's one changed line (1 added, 1 deleted) - the pure rename and the binary file count 0 and src/unlisted.js is outside the list - so the scope is one line past the threshold and needs 2 waves; bytes is the size of the rename-paired patch git prints for the listed files, never of src/unlisted.js`);
  assert.deepStrictEqual(onlySmall.result, { lines: 2, files: smallScope.length, bytes: patchBytes(smallScope), thresholds, waves: 1 }, 'a scope at or below every threshold is one wave, today\'s single review');

  assert.deepStrictEqual(accepted, measured, 'the division run reports the same measurement it validated against');
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(out, 'utf8')), { base, head, lines: threshold + 2, files: scope.length, bytes: measured.result.bytes, thresholds, waves: division }, 'D2: waves.json records the range, the measurement (lines, files, bytes) with the thresholds applied and the accepted division verbatim - the file lists live there, never in state.json');
  const divisionRule = sectionOf('.asd/rules/sprint-lifecycle.md', 'Review iteration counters').split('\n').find((line) => line.startsWith('- **Division**')) || '';
  const written = Object.keys(JSON.parse(fs.readFileSync(out, 'utf8'))).filter((key) => key !== 'waves');
  assert.deepStrictEqual(written.filter((key) => !spans(divisionRule).includes(key)), [], 'sprint-023 AC-1: sprint-lifecycle.md "Review iteration counters" Division names, as code spans, every waves.json field review-waves writes besides the division itself - a field renamed on the writing side only (threshold to thresholds) leaves the rule describing a file nobody writes');
  const measuredKeys = Object.entries(measured.result).filter(([key, value]) => key !== 'waves' && typeof value === 'number').map(([key]) => key);
  const divisionStep = stepOf(sectionOf('.asd/workflows/asd-phase-impl-review.md', 'Steps'), '1c');
  assert.deepStrictEqual(measuredKeys.filter((key) => !spans(divisionStep).includes(key)), [], 'sprint-023 AC-1: impl-review step 1c\'s decisions-log entry names every quantity review-waves measures - an entry naming lines alone hides that files or bytes forced the division');

  refusals.forEach(([label, , pattern], index) => {
    assert.ok(refused[index].status === 2 && pattern.test(refused[index].stderr), `${label}: must exit 2. Got: ${JSON.stringify(refused[index])}`);
  });
  assert.ok(!fs.existsSync(path.join(work, 'one')) && !fs.existsSync(path.join(work, 'short')), 'a rejected division writes no waves.json, so the orchestrator regroups instead of dispatching an invalid split');

  assert.ok(spans(divisionStep).includes('--single'), 'sprint-028 AC-21: impl-review step 1c names the `--single` flag lite adds to both review-waves runs');
  assert.deepStrictEqual(single, { status: 0, result: { ...measured.result, waves: 1 } }, 'sprint-028 AC-21: --single fixes waves at 1 over the same above-threshold scope the unflagged one-wave division above is refused for, keeping the measured lines, files and bytes');
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(singleOut, 'utf8')), { base, head, lines: threshold + 2, files: scope.length, bytes: measured.result.bytes, thresholds, waves: [scope] }, 'sprint-028 AC-21: waves.json under --single holds the one-wave division with the measured fields');
});

test('sprint-017 AC-1/AC-4 (COR-5): wave-files reads wave K\'s list at its current paths - a later rename mapped to its destination - unions it with the iteration\'s own file list once, and rejects a wave past the division', async () => {
  const sandbox = sandboxGitRepo();
  const { repo, env } = sandbox;
  const lines = (tag) => Array.from({ length: 5 }, (_, index) => `${tag} line ${index + 1}`).join('\n') + '\n';
  const [divisionHead, head] = await importCommits(sandbox, [
    { 'src/kept.js': lines('kept'), 'src/renamed.js': lines('renamed') },
    { 'src/renamed.js': null, 'lib/renamed.js': lines('renamed') },
  ]);

  const work = mkTempDir();
  const write = (name, content) => {
    const file = path.join(work, name);
    fs.writeFileSync(file, content, 'utf8');
    return file;
  };
  const divisionFile = write('waves.json', JSON.stringify({ head: divisionHead, waves: [['src/kept.js', 'src/renamed.js'], ['src/other.js']] }));
  const runWaveFiles = (args) => runtimeCliResultAsync(['wave-files', '--waves', divisionFile, '--head', head, ...args], { cwd: repo, env });

  const out1 = path.join(work, 'wave1.txt');
  const out1Union = path.join(work, 'wave1-union.txt');
  const extra = write('extra.txt', 'lib/renamed.js\nsrc/new.js\n');
  const [mapped, unioned, refused] = await Promise.all([
    runWaveFiles(['--wave', '1', '--out', out1]),
    runWaveFiles(['--wave', '1', '--files', extra, '--out', out1Union]),
    runWaveFiles(['--wave', '3', '--out', path.join(work, 'wave3.txt')]),
  ]);
  assert.deepStrictEqual(mapped, { status: 0, result: { out: out1, files: 2 } }, 'sanity: the CLI must succeed and name the file it wrote plus the count');
  assert.deepStrictEqual(fs.readFileSync(out1, 'utf8').split('\n').filter(Boolean), ['src/kept.js', 'lib/renamed.js'], 'COR-5: a division-time path a later commit renamed is reviewed under its current path, an unrenamed path unchanged');

  assert.deepStrictEqual(unioned.result, { out: out1Union, files: 3 }, 'COR-5: the union of the mapped wave list and the iteration\'s own file list, a file on both counted once');
  assert.deepStrictEqual(fs.readFileSync(out1Union, 'utf8').split('\n').filter(Boolean), ['src/kept.js', 'lib/renamed.js', 'src/new.js'], 'the wave list comes first, its own current-path entries; the iteration\'s extra files follow, duplicates dropped');

  assert.ok(refused.status === 2 && /--wave 3 exceeds the 2 waves/.test(refused.stderr), `a wave index past the division must exit 2 rather than silently returning nothing. Got: ${JSON.stringify(refused)}`);
});

test('sprint-015 AC-2 (EXT-1): draft-snapshot copies each design-review iteration\'s drafts and prints every draft on iteration 1, on 2+ only the drafts whose content changed, every draft when the previous snapshot is missing, and the design-review workflow runs it with those flags', () => {
  const root = mkTempDir();
  const drafts = ['prd.html', 'ux.html'].map((name) => path.join(root, name));
  drafts.forEach((file, index) => fs.writeFileSync(file, `draft ${index}\n`, 'utf8'));
  const list = path.join(root, 'drafts.txt');
  fs.writeFileSync(list, drafts.join('\n') + '\n', 'utf8');
  const iterDir = (iteration) => path.join(root, `iter-${iteration}`);
  const copyOf = (iteration, file) => path.join(iterDir(iteration), 'snapshot', path.relative(path.parse(file).root, file));
  const snapshot = (iteration, previous) => {
    fs.mkdirSync(iterDir(iteration), { recursive: true });
    return runtimeCli(['draft-snapshot', '--files', list, '--out', iterDir(iteration), ...(previous === undefined ? [] : ['--previous', iterDir(previous)])]).split('\n').filter(Boolean);
  };
  assert.deepStrictEqual(snapshot(1), drafts, 'iteration 1 reviews every in-scope draft');
  assert.deepStrictEqual(drafts.map((file) => fs.readFileSync(copyOf(1, file), 'utf8')), drafts.map((file) => fs.readFileSync(file, 'utf8')), 'EFF-3: each draft is copied under <iter dir>/snapshot/ - the sole record of the previous snapshot, no separate snapshot.json hash file');
  assert.ok(!fs.existsSync(path.join(iterDir(1), 'snapshot.json')), 'EFF-3: snapshot.json is retired - the snapshot/ copies are the one record');
  assert.deepStrictEqual(snapshot(2, 1), [], 'an unchanged draft set leaves iteration 2+ nothing to review');
  fs.writeFileSync(drafts[1], 'draft 1 revised\n', 'utf8');
  assert.deepStrictEqual(snapshot(3, 2), [drafts[1]], 'iteration 2+ reviews only the draft whose content changed since the previous snapshot');
  assert.deepStrictEqual(snapshot(4, 99), drafts, 'a missing previous snapshot widens to every draft, never drops one');
  const draftList = stepOf(canonText('.asd/workflows/asd-phase-design-review.md'), 7).split('\n').find((line) => line.includes('node .asd/runtime.js draft-snapshot'));
  assert.ok(draftList && ['--files', '--out', '--previous'].every((flag) => draftList.includes(flag)), 'design-review step 7 must run draft-snapshot with the flags this test drives, or iteration 2+ never narrows');
});

test('sprint-017 AC-8 (D9e): draft-snapshot copies each draft beside its snapshot, and emit-manifest --snapshot diffs the listed drafts against the previous iteration\'s copies - no diff at iteration 1, none for a draft the snapshot lacks, refused outside design-review', () => {
  const root = mkTempDir();
  const drafts = ['prd.html', 'adr.html'].map((name) => path.join(root, 'design', name));
  drafts.forEach((file, index) => writeFile(root, path.relative(root, file), `draft ${index} line 1\ndraft ${index} line 2\n`));
  const iterDir = (iteration) => path.join(root, 'reviews/design', `iter-0${iteration}`);
  const list = (name, files) => {
    const file = path.join(root, name);
    fs.writeFileSync(file, `${files.join('\n')}\n`, 'utf8');
    return file;
  };
  const snapshot = (iteration) => {
    fs.mkdirSync(iterDir(iteration), { recursive: true });
    runtimeCli(['draft-snapshot', '--files', list('drafts.txt', drafts), '--out', iterDir(iteration)]);
  };
  const emit = (reviewer, iteration, files, extra = [], phase = 'design-review') => {
    try {
      return JSON.parse(runtimeCli(['emit-manifest', '--reviewer', reviewer, '--phase', phase, '--files', list(`scope-${reviewer}-${iteration}.txt`, files), '--out', iterDir(iteration), ...extra], { stdio: 'pipe' }));
    } catch (error) {
      return { status: error.status, stderr: String(error.stderr).trim() };
    }
  };

  snapshot(1);
  const copies = drafts.map((file) => path.join(iterDir(1), 'snapshot', path.relative(path.parse(file).root, file)));
  assert.deepStrictEqual(copies.map((copy) => fs.readFileSync(copy, 'utf8')), drafts.map((file) => fs.readFileSync(file, 'utf8')), 'each draft is copied under <iter dir>/snapshot/, so the next iteration has content to diff against, not only a hash');
  const first = emit(runtime.COMBINED_REVIEWER, 1, drafts);
  assert.deepStrictEqual(Object.keys(first).sort(), ['digest', 'manifest'], 'iteration 1 has no --snapshot and writes no .diff - the drafts are wholly new and a diff would only duplicate them');
  assert.deepStrictEqual(fs.readdirSync(iterDir(1)).filter((name) => name.endsWith('.diff')), [], 'TST-1: no .diff of any name at iteration 1 - diffs are fingerprint-named now, so a check for the literal documentation.diff can no longer fail');

  fs.writeFileSync(drafts[0], 'draft 0 line 1\ndraft 0 revised\n', 'utf8');
  const added = path.join(root, 'design', 'ux-spec.html');
  fs.writeFileSync(added, 'new draft\n', 'utf8');
  snapshot(2);
  const second = emit(runtime.COMBINED_REVIEWER, 2, [drafts[0], added], ['--snapshot', iterDir(1)]);
  const patch = fs.readFileSync(second.diff, 'utf8');
  assert.ok(patch.includes('-draft 0 line 2') && patch.includes('+draft 0 revised'), 'iteration 2+ diffs a changed draft against the previous iteration\'s copy');
  assert.ok(!patch.includes('new draft') && !patch.includes('draft 1'), 'a draft the previous snapshot lacks gets no hunk - it is read whole - and an unlisted draft never appears');
  const external = emit(runtime.EXTERNAL_REVIEWER, 2, [drafts[0]], ['--iteration', '2', '--snapshot', iterDir(1)]);
  assert.ok(external.diff && fs.readFileSync(external.diff, 'utf8').includes('+draft 0 revised'), 'External Review gets the same snapshot diff for its list');

  fs.writeFileSync(drafts[0], 'draft 0 line 1\ndraft 0 revised again\n', 'utf8');
  const secondAgain = emit(runtime.COMBINED_REVIEWER, 2, [drafts[0], added], ['--snapshot', iterDir(1)]);
  assert.strictEqual(secondAgain.diff, second.diff, 'sanity: the same list and --snapshot dir must still fingerprint to the same .diff path');
  const patchAgain = fs.readFileSync(secondAgain.diff, 'utf8');
  assert.ok(patchAgain.includes('+draft 0 revised again') && !patchAgain.includes('+draft 0 revised\n'), 'COR-1: a second emit into the same iteration dir with the same list and --snapshot, after the draft changed again, must rewrite the .diff with the new content - a stale existsSync-skipped file would still read the first revision');

  const cor3Dir = path.join(root, 'reviews/design/iter-cor3');
  fs.mkdirSync(cor3Dir, { recursive: true });
  const cor3 = JSON.parse(runtimeCli(['emit-manifest', '--reviewer', runtime.COMBINED_REVIEWER, '--phase', 'design-review', '--files', list('scope-cor3.txt', [added]), '--out', cor3Dir, '--snapshot', iterDir(1), '--full-files', list('full-cor3.txt', [drafts[0]])], { stdio: 'pipe' }));
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(cor3.manifest, 'utf8')).files, [added, drafts[0]], 'COR-3: a design-review --full-files entry joins the manifest list after the scope list, same as impl-review D9c');
  const cor3Patch = fs.readFileSync(cor3.diff, 'utf8');
  assert.ok(!cor3Patch.includes('draft 0 revised') && !cor3Patch.includes('draft 0 line'), 'COR-3: --full-files in design-review means listed, no hunk - drafts[0] changed since iteration 1\'s snapshot, yet --full-files keeps it out of the diff entirely, unlike an ordinary changed draft');

  const refused = emit('quality', 3, [drafts[0]], ['--snapshot', iterDir(1)], 'impl-review');
  assert.ok(refused.status === 2 && /design-review only/.test(refused.stderr), `--snapshot is a design-review input; impl-review diffs a commit range. Got: ${JSON.stringify(refused)}`);
  fs.writeFileSync(path.join(root, 'climb.html'), 'outside the design tree\n', 'utf8');
  let climbed = null;
  try {
    runtimeCli(['draft-snapshot', '--files', list('climb.txt', ['../climb.html']), '--out', iterDir(3)], { cwd: path.join(root, 'design'), stdio: 'pipe' });
  } catch (error) {
    climbed = { status: error.status, stderr: String(error.stderr).trim() };
  }
  assert.ok(climbed && climbed.status === 2 && /must not climb out/.test(climbed.stderr) && !fs.existsSync(path.join(iterDir(3), 'climb.html')), `a draft path climbing out with .. must fail before a copy lands outside the snapshot directory. Got: ${JSON.stringify(climbed)}`);
});

test('sprint-015 AC-4 (F-2): the impl-review scope-list command prints a non-ASCII path unquoted, so it still matches as a literal pathspec', () => {
  const { repo, env, git } = sandboxGitRepo();
  writeFile(repo, 'README.md', 'base\n');
  git('add', '.');
  git('commit', '-q', '-m', 'base');
  writeFile(repo, 'docs/résumé.md', 'new\n');
  git('add', '.');
  git('commit', '-q', '-m', 'add');
  const command = /running the diff above as `git ([^`]+)`/.exec(stepOf(canonText('.asd/workflows/asd-phase-impl-review.md'), 1));
  assert.ok(command, 'impl-review step 1 must still name the command that derives the scope file list');
  assert.deepStrictEqual(git(...command[1].split(/\s+/), 'HEAD~1', 'HEAD').split('\n').filter(Boolean), ['docs/résumé.md'], 'the scope list must carry the raw path: a C-quoted one matches nothing as a pathspec and drops out of the reviewers\' .diff');
});

test('sprint-020 AC-9: persist-review validates a returned review and writes it with its findings JSON in one command - token, roster and ledger checked first, the preamble dropped, the late form beside, an existing review never overwritten, and any failure exits 2 writing nothing', () => {
  const root = mkTempDir();
  const scopePath = path.join(root, 'scope.txt');
  fs.writeFileSync(scopePath, 'src/a.md\n', 'utf8');
  const iter = path.join(root, 'iter');
  fs.mkdirSync(iter);
  runtimeCli(['emit-manifest', '--reviewer', 'quality', '--phase', 'impl-review', '--files', scopePath, '--out', iter], { stdio: 'pipe' });
  const manifestText = fs.readFileSync(path.join(iter, 'quality.manifest.json'), 'utf8');
  const manifest = JSON.parse(manifestText);
  const vocabulary = runtime.LEDGER_VOCABULARY;
  const ledgerFor = (findings) => ({
    manifest_digest: manifest.digest,
    findings,
    files: manifest.files.map((i) => ({ i, s: vocabulary.files[0] })),
    rules: manifest.rules.map((i, index) => (index === 0 && findings.length > 0 ? { i, s: vocabulary.f, f: findings[0] } : manifest.n_a.rules[i] ? { i, s: vocabulary.p, p: manifest.n_a.rules[i][0] } : { i, s: vocabulary.rules[0] })),
    sections: manifest.sections.map((i) => ({ i, s: vocabulary.sections[0] })),
  });
  const table = (rows) => ['| # | Severity | Location | Description | Suggested fix |', '|---|---|---|---|---|', ...rows].join('\n');
  const review = (first, rows, findings, preamble = '') => `${preamble}${first}\n\n# Review - quality\n\n## Findings\n\n${table(rows)}\n\n## Coverage\n\n\`\`\`json\n${JSON.stringify(ledgerFor(findings))}\n\`\`\`\n`;
  let inputs = 0;
  const persist = (dir, reviewer, phase, text, extra = []) => {
    inputs += 1;
    const input = path.join(root, `returned-${inputs}.md`);
    fs.writeFileSync(input, text, 'utf8');
    return runtimeCliResult(['persist-review', '--phase', phase, '--reviewer', reviewer, '--in', input, '--out-dir', dir, ...extra]);
  };

  const finding = { id: '1', severity: 'low', location: 'tests/run.js:10' };
  const concerns = review('[REVIEW-impl-quality]: CONCERNS', ['| 1 | low | `tests/run.js:10` | stale pin | re-pin |'], ['1'], 'Reviewed every file; returning now.\n\n');
  assert.deepStrictEqual(persist(iter, 'quality', 'impl', concerns), { status: 0, result: { token: 'CONCERNS', findings: [finding] } }, 'review-policy.md "Coverage ledger" Persistence: a valid return prints its token and its findings as {id, severity, location}, the location read from the Findings table');
  const written = fs.readFileSync(path.join(iter, 'quality.md'), 'utf8');
  assert.ok(written.startsWith('[REVIEW-impl-quality]: CONCERNS\n'), `the review file is the return from its token line on - a preamble before it would make the first line no verdict token for every later parser (got: ${JSON.stringify(written.slice(0, 60))})`);
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(path.join(iter, 'quality.findings.json'), 'utf8')), [finding], 'the findings JSON beside the review is what the minor test-only route reads (review-policy.md "Minor test-only findings"), so it must carry what was printed');

  const resolved = 'resolved: 1 — test-fix, 2026-09-28\n';
  fs.appendFileSync(path.join(iter, 'quality.md'), resolved, 'utf8');
  const again = persist(iter, 'quality', 'impl', concerns);
  assert.ok(again.status === 2 && fs.readFileSync(path.join(iter, 'quality.md'), 'utf8').endsWith(resolved), `a persisted review is never overwritten - the orchestrator's later resolved:/answer: appends must survive a second run (got: ${JSON.stringify(again)})`);
  assert.deepStrictEqual(persist(iter, 'quality', 'impl', concerns, ['--late']).status, 0, 'an admitted late return persists beside the original with --late');
  assert.ok(['quality.late.md', 'quality.late.findings.json'].every((file) => fs.existsSync(path.join(iter, file))), 'review-policy.md "Late duplicate return": --late writes <reviewer>.late.md and its own findings JSON, never touching <reviewer>.md');

  const rejected = [
    ['no verdict token (an interrupted dispatch)', 'quality', 'impl', 'I ran out of turns before the ledger.\n'],
    ['another reviewer\'s token', 'quality', 'impl', review('[REVIEW-impl-efficiency]: APPROVE', [], [])],
    ['another phase\'s token', 'quality', 'impl', review('[REVIEW-design-quality]: APPROVE', [], [])],
    ['the availability-skip form from an internal reviewer', 'quality', 'impl', review('[REVIEW-impl-quality]: APPROVE (skipped: busy)', [], [])],
    ['a ledger whose findings disagree with the table', 'quality', 'impl', review('[REVIEW-impl-quality]: CONCERNS', ['| 1 | low | `a.md` | d | f |'], [])],
    ['CONCERNS listing no finding', 'quality', 'impl', review('[REVIEW-impl-quality]: CONCERNS', [], [])],
    ['a severity outside the four levels', 'quality', 'impl', review('[REVIEW-impl-quality]: CONCERNS', ['| 1 | minor | `a.md` | d | f |'], ['1'])],
    ['a bare APPROVE listing findings, which would persist them as a clean verdict', 'quality', 'impl', review('[REVIEW-impl-quality]: APPROVE', ['| 1 | low | `tests/run.js:10` | d | f |'], ['1'])],
  ];
  const definitions = readWorkflowDefinitions();
  const rosterOf = (node) => new Set(definitions.flatMap((definition) => definition.reviewers[node]));
  for (const [node, other] of [['design', 'impl'], ['impl', 'design']]) {
    for (const key of [...rosterOf(other)].filter((candidate) => !rosterOf(node).has(candidate))) {
      rejected.push([`${key}, which no workflow dispatches in ${node}-review`, key, node, `[REVIEW-${node}-${key}]: APPROVE\n\n${table([])}\n`, /--reviewer must be one of/]);
    }
  }
  assert.ok(rejected.length > 8, 'sanity: some roster key must be dispatched in one review phase only (combined), or the roster check below compares nothing');
  rejected.forEach(([label, reviewer, node, text, reason], index) => {
    const dir = path.join(root, `rejected-${index}`);
    fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, `${reviewer}.manifest.json`), manifestText, 'utf8');
    const result = persist(dir, reviewer, node, text);
    assert.ok(result.status === 2 && (!reason || reason.test(result.stderr)), `persist-review must refuse ${label}${reason ? ` on its roster check (${reason})` : ''} (got: ${JSON.stringify(result)})`);
    assert.deepStrictEqual(fs.readdirSync(dir), [`${reviewer}.manifest.json`], `a refused return (${label}) must write nothing - the transcription re-run or a fresh dispatch starts from an empty slot`);
  });

  const externalDir = path.join(root, 'external');
  fs.mkdirSync(externalDir);
  assert.deepStrictEqual(persist(externalDir, 'external', 'impl', '[REVIEW-impl-external]: APPROVE (skipped: external review unavailable: not installed)\n'), { status: 0, result: { token: 'APPROVE (skipped: external review unavailable: not installed)', findings: [] } }, 'External Review\'s availability skip is its one tableless return, and carries no ledger to validate');
  const kept = `[REVIEW-impl-external]: CONCERNS\n\n## Kept findings\n\n${table(['| 1 | low | `tests/run.js:3` | d | f |'])}\n`;
  const externalLate = persist(externalDir, 'external', 'impl', kept, ['--late']);
  assert.deepStrictEqual(externalLate, { status: 0, result: { token: 'CONCERNS', findings: [{ id: '1', severity: 'low', location: 'tests/run.js:3' }] } }, 'External Review\'s Kept findings table yields its findings too - the minor test-only route counts External Review\'s findings');
});

test("sprint-020 AC-4: emit-manifest --reviewer combined composes the rubrics its agent names, in order, its own entries last, n/a's every Documentation entry - and only those - when no documentation file is in scope, and is the only internal reviewer emit-manifest accepts for design-review", () => {
  const root = mkTempDir();
  let runs = 0;
  const emit = (reviewer, phase, files, extraFlags = []) => {
    runs += 1;
    const dir = path.join(root, `run-${runs}`);
    fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, 'scope.txt'), `${files.join('\n')}\n`, 'utf8');
    const result = runtimeCliResult(['emit-manifest', '--reviewer', reviewer, '--phase', phase, '--files', path.join(dir, 'scope.txt'), '--out', dir, ...extraFlags]);
    return result.status === 0 ? JSON.parse(fs.readFileSync(result.result.manifest, 'utf8')) : result;
  };
  const noDocs = runtime.NA_PREDICATES.noDocs;
  const holders = (manifest) => manifest.rules.filter((id) => (manifest.n_a.rules[id] || []).includes(noDocs));
  const composed = reviewerRubric(runtime.COMBINED_REVIEWER);
  const idsOf = (reviewer) => runtime.emitCoverageManifest({ reviewer, phase: 'impl-review', rubric: reviewerRubric(reviewer), files: [] }).rules;
  const own = composed[runtime.COMBINED_REVIEWER].split('\n## Review rubric')[1].split('\n## ')[0];
  const ownIds = [...own.matchAll(/^### (.+)$/gm)].map((match) => match[1].trim());
  assert.ok(ownIds.length > 0, 'asd-reviewer-combined.md must keep its own ### rubric entries (Overall quality)');

  const code = emit(runtime.COMBINED_REVIEWER, 'impl-review', ['src/a.js']);
  const parts = Object.keys(composed).filter((name) => name !== runtime.COMBINED_REVIEWER);
  assert.deepStrictEqual(code.rules, [...parts.flatMap(idsOf), ...ownIds], `the combined manifest must enumerate the rubrics asd-reviewer-combined.md says it composes (${parts.join(', ')}), in that order, then its own entries - the agent reads each entry's detail from the home its body names, so runtime and body must compose the same list`);
  const documentationEntries = ['SSoT', 'Template adherence', 'HTML shell wrapping', 'Provenance', 'Traceability', 'Persistent actuality', 'In-code doc comments', 'Stub resolution', 'Framework mode', 'Custom rules consistency', 'Documentation economy'];
  const isDocumentationEntry = (id) => documentationEntries.some((entry) => id.startsWith(entry));
  assert.ok(code.rules.some(isDocumentationEntry) && code.rules.some((id) => !isDocumentationEntry(id)), 'sanity: the composed rubric must hold both documentation and non-documentation entries, or the predicate check below compares one side with nothing');
  assert.deepStrictEqual(holders(code), code.rules.filter(isDocumentationEntry), `with no documentation file in scope every documentation entry of the composed Quality and Efficiency rubrics - and nothing else - must carry "n/a: ${noDocs}": a rubric entry the predicate misses is reviewed against nothing, one it over-reaches is a code concern silently skipped`);
  assert.deepStrictEqual(holders(emit(runtime.COMBINED_REVIEWER, 'impl-review', ['src/a.js', 'README.md'])), [], 'one documentation file in scope keeps the whole Documentation rubric reviewed (AC-4)');
  assert.deepStrictEqual(holders(emit(runtime.COMBINED_REVIEWER, 'impl-review', ['src/a.js'], ['--test-plan', '.asd/sprints/001-x/test-plan.md'])), holders(code), 'sprint-028 wave-1/iter-01 F-3: the test-plan path the CLI appends to the combined file list is not diff scope - judged by the docs predicate it would void the n/a of every lite code-only review');
  for (const reviewer of parts) assert.deepStrictEqual(holders(emit(reviewer, 'impl-review', ['src/a.js'])), [], `the predicate reaches only the combined manifest - standard's ${reviewer} reviewer is dispatched for its rubric and never n/a's its documentation entries wholesale`);
  const designRoster = runtime.loadWorkflow('standard').reviewers.design;
  assert.ok(emit(runtime.COMBINED_REVIEWER, 'design-review', ['s/design/prd.md']).rules, 'sprint-031: standard dispatches combined in design-review, so emit-manifest must accept it there');
  for (const reviewer of parts.filter((name) => !designRoster.includes(name))) {
    const refused = emit(reviewer, 'design-review', ['s/design/prd.md']);
    assert.ok(refused.status === 2 && /one of/.test(refused.stderr), `no workflow dispatches ${reviewer} in design-review, so emit-manifest must refuse it there (got: ${JSON.stringify(refused)})`);
  }

  const reviewsBeforePromote = readWorkflowDefinitions().some(({ phases, reviewers }) => reviewers.impl.includes(runtime.COMBINED_REVIEWER) && phases.includes('design-promote') && phases.indexOf('impl-review') < phases.indexOf('design-promote'));
  const carves = canonText('.asd/agents/asd-reviewer-combined.md').split('\n').filter((line) => /`asd-phase-design-promote\.md` step \d+/.test(line));
  assert.strictEqual(carves.length, reviewsBeforePromote ? 1 : 0, 'external.md 2 (wave-1/iter-01): a workflow that runs combined in impl-review before its design-promote writes the persistent docs needs exactly one asd-reviewer-combined.md bullet scoping the inherited actuality entry to the diff, citing the design-promote step that writes those docs - without it every lite sprint FAILs on docs not yet promoted');
  if (reviewsBeforePromote) {
    const label = carves[0].slice(0, 80);
    assert.ok(parts.flatMap(idsOf).filter(isDocumentationEntry).some((id) => carves[0].toLowerCase().includes(id.replace(/\s*[\[(].*$/, '').toLowerCase())), `the carve-out "${label}" must name the documentation rubric entry it narrows, so a rename of that entry cannot leave it pointing at nothing`);
    assert.ok(carves[0].includes('`sprint-lifecycle.md` "Workflows"'), 'the carve-out must cite sprint-lifecycle.md "Workflows", the rule ordering impl-review before design-promote');
    const step = /`asd-phase-design-promote\.md` step (\d+)/.exec(carves[0])[1];
    const promoteStep = canonText('.asd/workflows/asd-phase-design-promote.md').split('\n').find((line) => line.startsWith(`${step}. `)) || '';
    assert.ok(/\bpersistent doc/.test(promoteStep) && promoteStep.includes('`lite`'), `the carve-out cites asd-phase-design-promote.md step ${step}, which must be the step that writes the lite persistent docs - a renumbered workflow leaves it scoping the wrong docs`);
  }
});

test('sprint-021 F-4/F-5, sprint-027 D8: each review template\'s empty findings table (header and separator only) and Severity values parse through reviewFindings, the parser persist-review runs on them - a template row the runtime rejects is a verdict no reviewer can persist', () => {
  for (const [rel, heading] of [['.asd/templates/t_review.md', 'Findings'], ['.asd/templates/external-review/t_review-report.md', 'Kept findings']]) {
    const lines = sectionOf(rel, heading).split('\n');
    const table = lines.filter((line) => line.startsWith('|'));
    assert.ok(table.length >= 3, `sanity: ${rel} "${heading}" must ship a header, a separator and a sample row`);
    assert.ok(!lines.some((line) => /^<!--\s*\|/.test(line)), `sprint-027 D8: ${rel} "${heading}" shows no placeholder row for an empty table - the rule is header and separator only, and a comment row teaches the reviewer to write the very row persist-review used to reject`);
    assert.deepStrictEqual(runtime.reviewFindings([table[0], table[1]].join('\n')), [], `${rel} "${heading}": the template's header and separator alone must parse to no findings through runtime.reviewFindings - F-5`);
    assert.deepStrictEqual(runtime.reviewFindings([table[0], table[1], '| — | — | — | no findings | — |'].join('\n')), [], `sprint-027 D8: ${rel} "${heading}": the legacy placeholder row stays tolerated, or a review file written before this rule stops persisting`);
    const severities = /\{\{([a-z/]+)\}\}/.exec(table[2].split('|')[2]);
    assert.ok(severities, `sanity: ${rel} "${heading}" sample row must list the Severity values as {{a/b/...}}`);
    const stated = lines.map((line) => /^<!--.*\bone of ([a-z|]+)/.exec(line)).filter(Boolean).flatMap((match) => match[1].split('|'));
    for (const severity of [...new Set([...severities[1].split('/'), ...stated])]) {
      let found;
      try {
        found = runtime.reviewFindings([table[0], table[1], `| 1 | ${severity} | a.md | d | f |`].join('\n')).map((finding) => finding.severity);
      } catch (error) {
        found = `rejected: ${error.message}`;
      }
      assert.deepStrictEqual(found, [severity], `${rel} "${heading}": Severity value "${severity}" the template offers must be one runtime.reviewFindings accepts - F-4`);
    }
  }
});

test('sprint-023 AC-1: review-waves divides a scope that is small in changed lines but large in files or in diff bytes - the file count and the patch bytes drive the wave count beside the lines', async () => {
  const sandbox = sandboxGitRepo();
  const { repo, env } = sandbox;
  const bulk = ['bulk/a.txt', 'bulk/b.txt'];
  const many = Array.from({ length: runtime.WAVE_THRESHOLD_FILES + 1 }, (_, index) => `many/f${index}.txt`);
  const [base, head] = await importCommits(sandbox, [
    { 'empty.txt': 'base\n' },
    { ...Object.fromEntries(bulk.map((file) => [file, `${'x'.repeat(Math.ceil(runtime.WAVE_THRESHOLD_BYTES / 2))}\n`])), ...Object.fromEntries(many.map((file) => [file, 'one\n'])) },
  ]);
  const work = mkTempDir();
  const measure = (name, scope) => {
    const list = path.join(work, `${name}.txt`);
    fs.writeFileSync(list, `${scope.join('\n')}\n`, 'utf8');
    return runtimeCliResultAsync(['review-waves', '--files', list, '--base', base, '--head', head], { cwd: repo, env });
  };

  const [byBytes, byFiles] = await Promise.all([measure('bulk', bulk), measure('many', many)]);
  assert.deepStrictEqual([byBytes.status, byBytes.result.lines, byBytes.result.files, byBytes.result.waves], [0, bulk.length, bulk.length, 2], `${bulk.length} files of one huge line each are ${bulk.length} changed lines and ${bulk.length} files - far under the line and file thresholds - yet their patch is over ${runtime.WAVE_THRESHOLD_BYTES} bytes, so the byte axis alone must divide them: ${JSON.stringify(byBytes)}`);
  assert.ok(byBytes.result.bytes > runtime.WAVE_THRESHOLD_BYTES, `the reported bytes must be the patch size that forced the division, got ${byBytes.result.bytes}`);
  assert.deepStrictEqual([byFiles.status, byFiles.result.lines, byFiles.result.files, byFiles.result.waves], [0, many.length, many.length, 2], `${many.length} one-line files are one file over WAVE_THRESHOLD_FILES with ${many.length} changed lines and a tiny patch, so the file axis alone must divide them: ${JSON.stringify(byFiles)}`);
  assert.ok(byFiles.result.bytes < runtime.WAVE_THRESHOLD_BYTES, 'sanity: the many-file scope must be under the byte threshold, or it is not the file axis that divided it');
});

test('sprint-031 AC-2/AC-3 (DoD): emit-manifest builds the combined design-review manifest - impl-review entries n/a outside the phase gate, UI conformance gated out without a ux-spec or design-system draft - persist-review persists its [REVIEW-design-combined] return, and the reviewers no roster dispatches in design-review are refused by both', () => {
  const root = mkTempDir();
  const designRoster = runtime.loadWorkflow('standard').reviewers.design;
  const emit = (reviewer, files) => {
    const dir = fs.mkdtempSync(path.join(root, `${reviewer}-`));
    const scope = path.join(dir, 'scope.txt');
    fs.writeFileSync(scope, `${files.join('\n')}\n`, 'utf8');
    const emitted = runtimeCliResult(['emit-manifest', '--reviewer', reviewer, '--phase', 'design-review', '--files', scope, '--out', dir]);
    return emitted.status === 0 ? { dir, manifest: JSON.parse(fs.readFileSync(emitted.result.manifest, 'utf8')) } : emitted;
  };
  const gated = (manifest) => manifest.rules.filter((id) => (manifest.n_a.rules[id] || []).includes(runtime.NA_PREDICATES.phaseGate));
  const prdOnly = emit(runtime.COMBINED_REVIEWER, ['s/design/prd.html']);
  assert.ok(prdOnly.manifest, `AC-2: standard dispatches combined in design-review, so emit-manifest accepts it there (got ${JSON.stringify(prdOnly)})`);
  const implTagged = prdOnly.manifest.rules.filter((id) => id.includes('[impl-review]'));
  assert.ok(implTagged.length > 0, 'sanity: the composed rubric holds impl-review-tagged entries, or the gate check below compares nothing');
  assert.deepStrictEqual(implTagged.filter((id) => !gated(prdOnly.manifest).includes(id)), [], 'AC-2: every [impl-review]-tagged entry is n/a outside phase gate in a design-review manifest - reviewing code that is not there');
  assert.ok(prdOnly.manifest.rules.some((id) => id.includes('[design-review') && !gated(prdOnly.manifest).includes(id)), 'AC-3: the design-review rubric entries stay reviewed');
  const uiConformance = gated(prdOnly.manifest).filter((id) => !id.includes('[impl-review]'));
  assert.strictEqual(uiConformance.length, 1, `AC-2: with no ux-spec/design-system draft exactly the UI conformance entry is gated out beyond the impl-review-tagged ones (got ${uiConformance})`);
  for (const draft of ['s/design/ux-spec.html', 's/design/design-md-delta.yaml']) {
    assert.ok(!gated(emit(runtime.COMBINED_REVIEWER, ['s/design/prd.html', draft]).manifest).includes(uiConformance[0]), `AC-2: a ${draft} draft in scope lifts UI conformance into the combined review`);
  }

  const vocabulary = runtime.LEDGER_VOCABULARY;
  const { manifest } = prdOnly;
  const ledger = {
    manifest_digest: manifest.digest,
    findings: [],
    files: manifest.files.map((i) => ({ i, s: vocabulary.files[0] })),
    rules: manifest.rules.map((i) => (manifest.n_a.rules[i] ? { i, s: vocabulary.p, p: manifest.n_a.rules[i][0] } : { i, s: vocabulary.rules[0] })),
    sections: manifest.sections.map((i) => ({ i, s: vocabulary.sections[0] })),
  };
  const empty = '| # | Severity | Location | Description | Suggested fix |\n|---|---|---|---|---|';
  const returned = (token) => `${token}\n\n# Review - combined\n\n## Findings\n\n${empty}\n\n## Coverage\n\n\`\`\`json\n${JSON.stringify(ledger)}\n\`\`\`\n`;
  let inputs = 0;
  const persist = (reviewer, text) => {
    inputs += 1;
    const input = path.join(root, `returned-${inputs}.md`);
    fs.writeFileSync(input, text, 'utf8');
    return runtimeCliResult(['persist-review', '--phase', 'design', '--reviewer', reviewer, '--in', input, '--out-dir', prdOnly.dir]);
  };
  const wrongPhase = persist(runtime.COMBINED_REVIEWER, returned('[REVIEW-impl-combined]: APPROVE'));
  assert.ok(wrongPhase.status === 2 && !fs.existsSync(path.join(prdOnly.dir, 'combined.md')), `AC-2: a design-review return carrying the impl token is refused and writes nothing (got ${JSON.stringify(wrongPhase)})`);
  assert.deepStrictEqual(persist(runtime.COMBINED_REVIEWER, returned('[REVIEW-design-combined]: APPROVE')), { status: 0, result: { token: 'APPROVE', findings: [] } }, 'AC-2: the combined design-review return validates against its manifest and persists');
  assert.ok(fs.readFileSync(path.join(prdOnly.dir, 'combined.md'), 'utf8').startsWith('[REVIEW-design-combined]: APPROVE\n'), 'the review file is the return from its token line on, the file the design-review iteration reads');

  for (const reviewer of runtime.INTERNAL_REVIEWERS.filter((name) => !designRoster.includes(name))) {
    const refusedEmit = emit(reviewer, ['s/design/prd.html']);
    assert.ok(refusedEmit.status === 2 && /one of/.test(refusedEmit.stderr), `AC-2: ${reviewer} is no design-review reviewer, so emit-manifest refuses it (got ${JSON.stringify(refusedEmit)})`);
    const refusedPersist = persist(reviewer, `[REVIEW-design-${reviewer}]: APPROVE\n\n${empty}\n`);
    assert.ok(refusedPersist.status === 2 && /--reviewer must be one of/.test(refusedPersist.stderr), `AC-2: ${reviewer} is no design-review reviewer, so persist-review refuses its return (got ${JSON.stringify(refusedPersist)})`);
  }
});

test('sprint-031 AC-9 (issue #74): emit-manifest splits a scope above the command-line budget into consecutive git invocations in list order, each within the budget, never parting a rename from its source; no file gives no invocation; below the budget the one invocation, and so the .diff name, is unchanged', async () => {
  const commandLineBudget = 32000;
  const argumentCost = (arg) => 2 * arg.length + 3;
  const sandbox = sandboxGitRepo();
  const { repo, env } = sandbox;
  const body = (tag) => Array.from({ length: 20 }, (_, index) => `${tag} line ${index + 1}`).join('\n') + '\n';
  const scope = Array.from({ length: 400 }, (_, index) => `s/${'n'.repeat(52 + ((index * 7) % 13))}${String(index).padStart(4, '0')}.js`);
  const sourceOf = new Map(scope.filter((_, index) => (index * 5) % 3 !== 0).map((file) => [file, file.replace('s/', 'o/')]));
  const baseState = Object.fromEntries(scope.map((file) => [sourceOf.get(file) || file, body(file)]));
  const headState = Object.fromEntries(scope.flatMap((file) => (sourceOf.has(file) ? [[sourceOf.get(file), null], [file, body(file)]] : [[file, `${body(file)}edited\n`]])));
  const [base, head] = await importCommits(sandbox, [baseState, headState]);

  const work = mkTempDir();
  const spy = path.join(work, 'spy.js');
  fs.writeFileSync(spy, "const cp = require('child_process');\nconst fs = require('fs');\nconst real = cp.spawnSync;\ncp.spawnSync = (file, args, options) => {\n  if (file === 'git' && args.includes('--literal-pathspecs')) fs.appendFileSync(process.env.SPY_LOG, `${JSON.stringify(args)}\\n`);\n  return real(file, args, options);\n};\n", 'utf8');
  let runs = 0;
  const emit = async (files) => {
    runs += 1;
    const list = path.join(work, `scope-${runs}.txt`);
    fs.writeFileSync(list, files.map((file) => `${file}\n`).join(''), 'utf8');
    const out = fs.mkdtempSync(path.join(work, 'out-'));
    const log = path.join(work, `git-${runs}.log`);
    const emitted = JSON.parse((await execFileAsync(process.execPath, ['--require', spy, path.join(REPO_ROOT, '.asd', 'runtime.js'), 'emit-manifest', '--reviewer', 'efficiency', '--phase', 'impl-review', '--files', list, '--out', out, '--base', base, '--head', head], { cwd: repo, env: { ...env, SPY_LOG: log }, encoding: 'utf8' })).stdout);
    const invocations = fs.existsSync(log) ? fs.readFileSync(log, 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line)) : [];
    return { invocations, diff: emitted.diff, patch: fs.readFileSync(emitted.diff, 'utf8') };
  };
  const pathsOf = (args) => args.slice(args.indexOf('--') + 1);
  const unitsOf = (files) => files.flatMap((file) => (sourceOf.has(file) ? [sourceOf.get(file), file] : [file]));

  const few = scope.slice(0, 3);
  const [whole, shifted, none, small] = await Promise.all([emit(scope), emit(scope.slice(1)), emit([]), emit(few)]);
  for (const [dropped, { invocations, patch }] of [[0, whole], [1, shifted]]) {
    const listed = scope.slice(dropped);
    assert.ok(invocations.length > 1, `sanity: ${listed.length} long paths must exceed one invocation's budget, or nothing is split`);
    assert.deepStrictEqual(invocations.flatMap(pathsOf), unitsOf(listed), `AC-9: the chunks together hold every listed path once, in list order, each rename's source before its destination (scope starting at file ${dropped})`);
    assert.strictEqual(invocations.filter((args) => args.reduce((sum, arg) => sum + argumentCost(arg), 0) > commandLineBudget).length, 0, `AC-9: every invocation's arguments, counted 2 x length + 3 each, stay within ${commandLineBudget} (scope starting at file ${dropped})`);
    invocations.forEach((args) => pathsOf(args).forEach((file, index, chunk) => assert.ok(!sourceOf.has(file) || chunk[index - 1] === sourceOf.get(file), `AC-9: ${file} opens a chunk away from its source`)));
    assert.strictEqual((patch.match(/^diff --git /gm) || []).length, listed.length, 'AC-9: the one .diff holds a hunk per listed file');
    assert.strictEqual((patch.match(/^rename from /gm) || []).length, listed.filter((file) => sourceOf.has(file)).length, 'AC-9: every renamed file reads as a rename in the patch, never an add and a delete');
    assert.ok(!/^(new|deleted) file mode/m.test(patch), 'AC-9: no file at a chunk edge degraded into an add or a delete');
  }

  assert.deepStrictEqual([none.invocations, none.patch], [[], ''], 'AC-9: an empty file list runs no git invocation and writes an empty patch');

  const single = ['--literal-pathspecs', 'diff', '-M', '--no-color', '--no-ext-diff', '--no-textconv', `${base}...${head}`, '--', ...unitsOf(few)];
  assert.deepStrictEqual(small.invocations, [single], 'AC-9: a scope within the budget is still one invocation');
  assert.strictEqual(path.basename(small.diff), `${runtime.fingerprint([{ args: single }]).slice(0, 16)}.diff`, 'AC-9: below the budget the .diff keeps the name the single invocation always gave it');
});

test('sprint-031 AC-10 (issue #78): reviewFindings reads a findings table only under a five-column header led by #, so an extra category column or a non-# id column fails before any row is read, while a translated header still parses', () => {
  const header = sectionOf('.asd/templates/t_review.md', 'Findings').split('\n').filter((line) => line.startsWith('|'))[0];
  const canonical = header.split('|').slice(1, -1).map((cell) => cell.trim());
  assert.strictEqual(canonical.length, 5, 'sanity: the template findings table has the five columns the parser reads by position');
  const table = (cells, rows = []) => [`| ${cells.join(' | ')} |`, `|${cells.map(() => '---').join('|')}|`, ...rows].join('\n');
  const row = '| 1 | high | a.md:3 | simplify: over-built | inline it |';
  assert.deepStrictEqual(runtime.reviewFindings(table(canonical, [row])), [{ id: '1', severity: 'high', location: 'a.md:3' }], 'the canonical layout parses');
  const translated = ['#', 'Серьёзность', 'Расположение', 'Описание', 'Исправление'];
  assert.deepStrictEqual(runtime.reviewFindings(table(translated, [row])).map((finding) => finding.id), ['1'], 'AC-10: reviews follow language.docs, so a translated header led by # parses - the check is the column count and the id column, never the English cell text');

  const withCategory = [canonical[0], canonical[1], 'Category', ...canonical.slice(2)];
  const categoryRow = '| 1 | high | simplify | a.md:3 | over-built | inline it |';
  assert.throws(() => runtime.reviewFindings(table(withCategory, [categoryRow])), /5 columns/, 'AC-10: a category column between Severity and Location used to be read as the location - it must fail instead');
  assert.throws(() => runtime.reviewFindings(table(withCategory)), /5 columns/, 'AC-10: the header is checked before any row, so an empty six-column table fails too');
  assert.throws(() => runtime.reviewFindings(table(canonical.slice(1), ['| high | a.md:3 | d | f |'])), /5 columns/, 'AC-10: a four-column header fails');
  assert.throws(() => runtime.reviewFindings(table(['ID', ...canonical.slice(1)], [row])), /led by #/, 'AC-10: five columns whose first is not # fail - the id column is the one the parser keys findings by');
});

test('sprint-033 AC-34: a design-review manifest lifts the UI conformance entry out of the phase gate for a draft under design/mockups/ at any depth, and not for a similarly named path', () => {
  const root = mkTempDir();
  const emit = (files) => {
    const dir = fs.mkdtempSync(path.join(root, 'emit-'));
    const scope = path.join(dir, 'scope.txt');
    fs.writeFileSync(scope, `${files.join('\n')}\n`, 'utf8');
    const emitted = runtimeCliResult(['emit-manifest', '--reviewer', runtime.COMBINED_REVIEWER, '--phase', 'design-review', '--files', scope, '--out', dir]);
    assert.strictEqual(emitted.status, 0, JSON.stringify(emitted));
    return JSON.parse(fs.readFileSync(emitted.result.manifest, 'utf8'));
  };
  const gated = (manifest) => manifest.rules.filter((id) => (manifest.n_a.rules[id] || []).includes(runtime.NA_PREDICATES.phaseGate) && !id.includes('[impl-review]'));
  const prdOnly = gated(emit(['s/design/prd.html']));
  assert.strictEqual(prdOnly.length, 1, 'sanity: without a UI draft exactly the UI conformance entry is gated beyond the impl-review-tagged ones');
  for (const mockup of ['s/design/mockups/login.html', 's/design/mockups/billing/canvas/project/home.dc.html']) {
    assert.deepStrictEqual(gated(emit(['s/design/prd.html', mockup])), [], `AC-34: ${mockup} is a UI draft, so UI conformance is reviewed`);
  }
  for (const other of ['s/design/mockups-old/login.html', 's/design/mockupsx/login.html', 's/docs/mockups/login.html']) {
    assert.deepStrictEqual(gated(emit(['s/design/prd.html', other])), prdOnly, `AC-34: ${other} is no mockup folder, so the gate stays`);
  }
});

test('sprint-033 AC-35, AC-24: emit-manifest collapses a whole-file deletion to one line naming the path and its deleted line count, with --rename-map a hunk that only applies the map to one line per file with the substitution count - an edited line keeps its hunk - and review-waves counts only what the collapse leaves', async () => {
  const sandbox = sandboxGitRepo();
  const { repo, env, git } = sandbox;
  const GONE_LINES = 30;
  const FILE_LINES = 40;
  const OLD = 'oldName';
  const NEW = 'newName';
  const lines = (count, edits = {}) => `${Array.from({ length: count }, (unused, index) => edits[index + 1] || `line ${index + 1}`).join('\n')}\n`;
  const named = (name) => ({ 3: `use ${name} here`, 35: `use ${name} again` });
  const [base, head] = await importCommits(sandbox, [
    { 'src/gone.js': lines(GONE_LINES), 'src/pure.js': lines(FILE_LINES, named(OLD)), 'src/mixed.js': lines(FILE_LINES, { 3: `use ${OLD} here` }) },
    { 'src/gone.js': null, 'src/pure.js': lines(FILE_LINES, named(NEW)), 'src/mixed.js': lines(FILE_LINES, { 3: `use ${NEW} here`, 35: 'edited line 35' }) },
  ]);

  const scope = ['src/gone.js', 'src/pure.js', 'src/mixed.js'];
  const work = mkTempDir();
  const write = (name, text) => {
    const file = path.join(work, name);
    fs.writeFileSync(file, text, 'utf8');
    return file;
  };
  const scopeFile = write('scope.txt', `${scope.join('\n')}\n`);
  const mapFile = write('map.json', JSON.stringify({ [OLD]: NEW }));
  const range = ['--base', base, '--head', head];
  const emit = async (extra) => {
    const out = fs.mkdtempSync(path.join(work, 'out-'));
    const emitted = await runtimeCliResultAsync(['emit-manifest', '--reviewer', 'efficiency', '--phase', 'impl-review', '--files', scopeFile, '--out', out, ...range, ...extra], { cwd: repo, env });
    assert.strictEqual(emitted.status, 0, JSON.stringify(emitted));
    return fs.readFileSync(emitted.result.diff, 'utf8');
  };
  const measure = async (extra) => (await runtimeCliResultAsync(['review-waves', '--files', scopeFile, ...range, ...extra], { cwd: repo, env })).result;
  const arrayMap = write('array.json', JSON.stringify([OLD]));
  const [plain, mapped, plainMeasure, mappedMeasure, refused, designReview] = await Promise.all([
    emit([]),
    emit(['--rename-map', mapFile]),
    measure([]),
    measure(['--rename-map', mapFile]),
    runtimeCliResultAsync(['review-waves', '--files', scopeFile, ...range, '--rename-map', arrayMap], { cwd: repo, env }),
    runtimeCliResultAsync(['emit-manifest', '--reviewer', runtime.COMBINED_REVIEWER, '--phase', 'design-review', '--files', scopeFile, '--out', work, '--rename-map', mapFile]),
  ]);

  assert.ok(plain.includes(`# collapsed: src/gone.js: deleted, ${GONE_LINES} lines\n`) && !plain.includes('deleted file mode'), 'AC-35: the deleted file is one line naming its path and deleted line count');
  assert.ok(plain.includes('diff --git a/src/pure.js b/src/pure.js') && plain.includes(`-use ${OLD} here\n+use ${NEW} here\n`) && !plain.includes('rename-map'), 'without a map, substitution hunks stay whole');

  assert.ok(mapped.includes('# collapsed: src/pure.js: 2 rename-map substitutions\n') && !mapped.includes('diff --git a/src/pure.js'), 'AC-24: a file whose every hunk only applies the map is one line with the count');
  assert.ok(mapped.includes('diff --git a/src/mixed.js b/src/mixed.js') && mapped.includes('-line 35\n+edited line 35\n') && mapped.includes('# collapsed: src/mixed.js: 1 rename-map substitutions\n') && !mapped.includes(`-use ${OLD} here`), 'AC-24: the substitution hunk of a mixed file collapses, its edited line keeps its hunk');
  assert.ok(mapped.includes(`# collapsed: src/gone.js: deleted, ${GONE_LINES} lines\n`), 'the deletion collapse applies with a map too');

  const raw = git('diff', '-M', '--no-color', `${base}...${head}`, '--', ...scope);
  assert.deepStrictEqual([plainMeasure.bytes, mappedMeasure.bytes], [Buffer.byteLength(plain), Buffer.byteLength(mapped)], 'AC-35: the wave sizing reads the same collapsed patch a reviewer gets');
  assert.ok(mappedMeasure.bytes < plainMeasure.bytes && plainMeasure.bytes < Buffer.byteLength(raw), 'each collapse shrinks the measured patch');
  assert.deepStrictEqual([plainMeasure.lines, mappedMeasure.lines], [2 * 2 + 2 * 2, 2 * 1], 'AC-35, AC-24: the deleted file adds no lines, a map substitution counts as no changed line - the pure file 4 lines and the mixed file 4 lines drop to 0 and 2');

  assert.ok(refused.status === 2 && /--rename-map must be a JSON object/.test(refused.stderr), `a map that is no object of strings is refused (got ${JSON.stringify(refused)})`);
  assert.ok(designReview.status === 2 && /impl-review with --base\/--head only/.test(designReview.stderr), `--rename-map outside an impl-review range is refused (got ${JSON.stringify(designReview)})`);
});

test('sprint-033 AC-24 (review-fix): a rename-map collapse keeps the rename and mode header lines of a file it collapses whole, and names and discounts a C-quoted non-ASCII path, substituted or deleted, by its literal name', async () => {
  const sandbox = sandboxGitRepo();
  const { repo, env } = sandbox;
  const OLD = 'oldName';
  const NEW = 'newName';
  const NON_ASCII = 'src/é.js';
  const DELETED_NON_ASCII = 'src/ü.js';
  const body = (name) => `${Array.from({ length: 40 }, (unused, index) => (index === 2 ? `use ${name} here` : `line ${index + 1}`)).join('\n')}\n`;
  const [base, head] = await importCommits(sandbox, [
    Object.fromEntries(['src/before.js', NON_ASCII, DELETED_NON_ASCII, 'src/run.sh'].map((file) => [file, body(OLD)])),
    { 'src/before.js': null, [DELETED_NON_ASCII]: null, 'src/after.js': body(NEW), [NON_ASCII]: body(NEW), 'src/run.sh': { content: body(NEW), mode: '100755' } },
  ]);

  const work = mkTempDir();
  const scopeFile = path.join(work, 'scope.txt');
  const mapFile = path.join(work, 'map.json');
  fs.writeFileSync(scopeFile, ['src/before.js', 'src/after.js', NON_ASCII, DELETED_NON_ASCII, 'src/run.sh'].join('\n') + '\n', 'utf8');
  fs.writeFileSync(mapFile, JSON.stringify({ [OLD]: NEW }), 'utf8');
  const range = ['--base', base, '--head', head, '--rename-map', mapFile];
  const [emitted, measured] = await Promise.all([
    runtimeCliResultAsync(['emit-manifest', '--reviewer', 'efficiency', '--phase', 'impl-review', '--files', scopeFile, '--out', work, ...range], { cwd: repo, env }),
    runtimeCliResultAsync(['review-waves', '--files', scopeFile, ...range], { cwd: repo, env }),
  ]);
  assert.strictEqual(emitted.status, 0, JSON.stringify(emitted));
  const patch = fs.readFileSync(emitted.result.diff, 'utf8');
  assert.ok(patch.includes('rename from src/before.js\nrename to src/after.js\n# collapsed: src/after.js: 1 rename-map substitutions\n'), `AC-24: a renamed file whose only edit applies the map still shows the rename (got ${patch})`);
  assert.ok(patch.includes('old mode 100644\nnew mode 100755\n# collapsed: src/run.sh: 1 rename-map substitutions\n'), 'AC-24: a mode change survives the collapse of its only hunk');
  assert.ok(patch.includes(`# collapsed: ${NON_ASCII}: 1 rename-map substitutions\n`) && !patch.includes('\\303'), 'AC-24: a C-quoted path is named by its decoded characters');
  assert.ok(patch.includes(`# collapsed: ${DELETED_NON_ASCII}: deleted, 40 lines\n`) && !patch.includes('\\303') && !patch.includes('\\274'), 'AC-35, AC-24: a deleted C-quoted path is named by its decoded characters in the deletion collapse');
  assert.ok(!patch.includes(`use ${NEW} here`), 'every substitution hunk is collapsed');
  assert.strictEqual(measured.result.lines, 0, `AC-24: each collapsed file, the C-quoted substituted and deleted ones included, is discounted from the changed-line count (got ${JSON.stringify(measured)})`);
});

test('sprint-033 AC-25: persist-review --floor drops each external finding below the floor and records the count, rewrites a CONCERNS whose rows all dropped to APPROVE, leaves the skip form alone, and refuses a non-external reviewer or a floor outside the four levels', async () => {
  const root = mkTempDir();
  const header = ['| # | Severity | Location | Description | Suggested fix |', '|---|---|---|---|---|'];
  const rows = { low: '| 1 | low | `a.md:1` | d | f |', high: '| 2 | high | `b.md:2` | d | f |', medium: '| 3 | medium | `c.md:3` | d | f |' };
  const external = `[REVIEW-impl-external]: CONCERNS\n\n## Kept findings\n\n${[...header, rows.low, rows.high, rows.medium].join('\n')}\n`;
  let runs = 0;
  const persist = async (text, reviewer, floor, extra = []) => {
    runs += 1;
    const dir = path.join(root, `run-${runs}`);
    fs.mkdirSync(dir);
    const input = path.join(root, `returned-${runs}.md`);
    fs.writeFileSync(input, text, 'utf8');
    return { dir, ...(await runtimeCliResultAsync(['persist-review', '--phase', 'impl', '--reviewer', reviewer, '--in', input, '--out-dir', dir, ...(floor === undefined ? [] : ['--floor', floor]), ...extra])) };
  };
  const failing = `[REVIEW-impl-external]: FAIL\nFAIL: 1\n\n${[...header, rows.low].join('\n')}\n`;
  const STALEMATE_LINE = 'Stalemate: 2 iterations, identical findings — options: stop / continue fixing / abort';
  const skipped = '[REVIEW-impl-external]: APPROVE (skipped: external review unavailable: not installed)\n';

  const [partial, all, kept, failFloored, stalemate, notStalemate, concernsWithCount, skippedRun, nonExternal, badFloor, unfloored] = await Promise.all([
    persist(external, 'external', 'medium'),
    persist(external, 'external', 'critical'),
    persist(external, 'external', 'low'),
    persist(failing, 'external', 'medium'),
    persist(failing.replace('FAIL: 1', `FAIL: 1\n${STALEMATE_LINE}`), 'external', 'medium'),
    persist(external.replace('\n\n', '\nStalemate: no\n\n'), 'external', 'critical'),
    persist(external.replace('\n\n', `\n${STALEMATE_LINE}\n\n`), 'external', 'critical'),
    persist(skipped, 'external', 'high'),
    persist(external.replace('external', 'quality'), 'quality', 'medium'),
    persist(external, 'external', 'urgent'),
    persist(external, 'external'),
  ]);
  assert.deepStrictEqual(partial.result, { token: 'CONCERNS', findings: [{ id: '2', severity: 'high', location: 'b.md:2' }, { id: '3', severity: 'medium', location: 'c.md:3' }], dropped: 1 }, 'AC-25: the low row is dropped, the rest kept, and the count is reported');
  const written = fs.readFileSync(path.join(partial.dir, 'external.md'), 'utf8');
  assert.ok(written.endsWith('dropped: 1\n') && !written.includes('a.md:1') && written.includes('b.md:2') && written.includes('c.md:3'), 'the persisted review lacks the dropped row and records the count');
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(path.join(partial.dir, 'external.findings.json'), 'utf8')), partial.result.findings, 'the findings JSON is the floored set the minor test-only route reads');

  assert.deepStrictEqual(all.result, { token: 'APPROVE', findings: [], dropped: 3 }, 'AC-25: a CONCERNS whose every row dropped becomes APPROVE');
  assert.ok(fs.readFileSync(path.join(all.dir, 'external.md'), 'utf8').startsWith('[REVIEW-impl-external]: APPROVE\n'), 'the persisted verdict line is rewritten too');
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(path.join(all.dir, 'external.findings.json'), 'utf8')), []);

  assert.deepStrictEqual([kept.result.token, kept.result.dropped, kept.result.findings.length], ['CONCERNS', 0, 3], 'a floor at the lowest level drops nothing');

  assert.deepStrictEqual(failFloored.result, { token: 'APPROVE', findings: [], dropped: 1 }, 'AC-25: a FAIL whose every row dropped becomes APPROVE');
  assert.ok(fs.readFileSync(path.join(failFloored.dir, 'external.md'), 'utf8').startsWith('[REVIEW-impl-external]: APPROVE\nAPPROVE\n'), 'the verdict line and the FAIL count line are rewritten');
  assert.deepStrictEqual([stalemate.result.token, stalemate.result.dropped], ['FAIL', 1], 'AC-25: a stalemate FAIL keeps its verdict whatever the floor drops');
  assert.ok(fs.readFileSync(path.join(stalemate.dir, 'external.md'), 'utf8').startsWith('[REVIEW-impl-external]: FAIL\n'), 'the persisted stalemate verdict line stays FAIL');
  assert.deepStrictEqual([notStalemate.result.token, notStalemate.result.dropped], ['APPROVE', 3], 'AC-25: a "Stalemate: no" line is no stalemate FAIL - a CONCERNS whose every row dropped still becomes APPROVE');
  assert.deepStrictEqual([concernsWithCount.result.token, concernsWithCount.result.dropped], ['APPROVE', 3], 'AC-25: only a FAIL verdict is a stalemate - a CONCERNS carrying the count line becomes APPROVE when every row dropped');

  assert.deepStrictEqual(skippedRun.result, { token: skipped.trim().slice('[REVIEW-impl-external]: '.length), findings: [] }, 'the availability skip carries no table and no floor');

  assert.ok(nonExternal.status === 2 && /--floor <low\|medium\|high\|critical> applies to external only/.test(nonExternal.stderr), `AC-25: an internal reviewer's severity floor is the dispatch payload's, never persist-review's (got ${JSON.stringify(nonExternal)})`);
  assert.strictEqual(badFloor.status, 2, 'a floor outside the four severity levels is refused');
  assert.deepStrictEqual(fs.readdirSync(badFloor.dir), [], 'a refused floor writes nothing');
  assert.deepStrictEqual(unfloored.result, { token: 'CONCERNS', findings: [{ id: '1', severity: 'low', location: 'a.md:1' }, { id: '2', severity: 'high', location: 'b.md:2' }, { id: '3', severity: 'medium', location: 'c.md:3' }] }, 'without --floor nothing is dropped and no count is reported');
});

/** The shipped state template as a sprint `state.json` text in `eol`, its impl node replaced by `implNode` when given; the replaced line is asserted present, so a template layout change fails loudly here. */
function verdictStateText({ eol = '\n', implNode = null } = {}) {
  const seed = fs.readFileSync(path.join(REPO_ROOT, '.asd/templates/t_state.json'), 'utf8').replace(/\r\n/g, '\n');
  const implLine = seed.split('\n').find((line) => line.startsWith('    "impl":')) || '';
  assert.ok(implLine, 'sanity: t_state.json must keep its one-line reviews.impl node');
  return (implNode === null ? seed : seed.replace(implLine, `    "impl": ${implNode}`)).replace(/\n/g, eol);
}

/** Runs `record-verdicts` over `statePath` and returns the CLI result. */
function recordVerdicts(statePath, phase, iteration, verdict) {
  return runtimeCliResult(['record-verdicts', '--state', statePath, '--phase', phase, '--iteration', String(iteration), '--verdict', verdict]);
}

test('sprint-034 AC-14 (issue #118): record-verdicts merges an iteration into the design node, latches a bare APPROVE only for an unlatched key and keeps an existing latch\'s iteration, deletes the latch of any other value, and never latches an availability skip', () => {
  const [combined, external] = [runtime.COMBINED_REVIEWER, runtime.EXTERNAL_REVIEWER];
  const statePath = path.join(mkTempDir(), 'state.json');
  fs.writeFileSync(statePath, verdictStateText());
  const design = () => JSON.parse(fs.readFileSync(statePath, 'utf8')).reviews.design;
  const record = (iteration, verdict) => {
    const outcome = recordVerdicts(statePath, 'design', iteration, verdict);
    assert.strictEqual(outcome.status, 0, outcome.stderr);
    return design();
  };

  let node = record(1, `${combined}=APPROVE;${external}=APPROVE (skipped: no codex)`);
  assert.deepStrictEqual(node.verdicts['iter-01'], { [combined]: 'APPROVE', [external]: 'APPROVE (skipped: no codex)' }, 'AC-14: both values are recorded under the zero-padded iteration key, a skipped value whole');
  assert.deepStrictEqual(node.latched, { [combined]: 1 }, 'AC-14: a bare APPROVE latches at this iteration; the availability skip never latches');

  node = record(2, `${combined}=APPROVE;${external}=CONCERNS`);
  assert.deepStrictEqual(node.latched, { [combined]: 1 }, 'AC-14: an already latched key keeps its first iteration - a bare APPROVE does not move it, and a non-APPROVE value leaves no latch');
  assert.deepStrictEqual(Object.keys(node.verdicts), ['iter-01', 'iter-02'], 'AC-14: a later call merges, never replacing an earlier iteration');

  node = record(3, `${combined}=FAIL`);
  assert.deepStrictEqual(node.latched, {}, 'AC-14: any value other than a bare APPROVE deletes that key\'s latch');
  assert.deepStrictEqual(node.verdicts['iter-03'], { [combined]: 'FAIL' }, 'AC-14: only the keys named are written to the iteration');

  node = record(4, `${external}=APPROVE`);
  assert.deepStrictEqual(node.latched, { [external]: 4 }, 'AC-14: an unlatched key latches at the iteration it first returns a bare APPROVE');
});

test('sprint-034 AC-14 (issue #118): record-verdicts writes the current impl wave node only, rewrites nothing outside the reviews block and keeps the file\'s line endings', () => {
  const [approved, failed] = runtime.reviewerKeys('impl');
  const seedNode = '{ "iteration": 0, "verdicts": {}, "iteration_heads": {}, "latched": {} }';
  const implNode = `{ "wave": 2, "waves": [ ${seedNode}, ${seedNode} ] }`;
  for (const eol of ['\n', '\r\n']) {
    const statePath = path.join(mkTempDir(), 'state.json');
    const before = verdictStateText({ eol, implNode });
    fs.writeFileSync(statePath, before);
    const outcome = recordVerdicts(statePath, 'impl', 3, `${approved}=APPROVE;${failed}=FAIL`);
    assert.strictEqual(outcome.status, 0, outcome.stderr);
    const text = fs.readFileSync(statePath, 'utf8');
    const { reviews } = JSON.parse(text);
    assert.deepStrictEqual(reviews.impl.waves[1].verdicts['iter-03'], { [approved]: 'APPROVE', [failed]: 'FAIL' }, 'AC-14: the verdicts land in waves[wave - 1]');
    assert.deepStrictEqual(reviews.impl.waves[1].latched, { [approved]: 3 }, 'AC-14: the latch lands in the same wave node');
    assert.deepStrictEqual(reviews.impl.waves[0], JSON.parse(seedNode), 'AC-14: another wave node is left as it was');
    const reviewsAt = (source) => source.indexOf('  "reviews": {');
    const tailAt = (source) => source.indexOf('  "created_at"');
    assert.strictEqual(text.slice(0, reviewsAt(text)), before.slice(0, reviewsAt(before)), 'AC-14: the bytes before the reviews block are untouched');
    assert.strictEqual(text.slice(tailAt(text)), before.slice(tailAt(before)), 'AC-14: the bytes after the reviews block are untouched');
    assert.ok(text.split(eol).some((line) => line.startsWith('    "impl": { "wave": 2')), 'AC-14: the impl node keeps the one-line layout of the state template');
    assert.ok(eol === '\r\n' ? !/[^\r]\n/.test(text) : !text.includes('\r'), `AC-14: the file keeps its ${JSON.stringify(eol)} line endings throughout`);
  }
});

test('sprint-034 AC-14 (issue #118): record-verdicts exits non-zero and writes nothing for an unknown reviewer key, a malformed value, a repeated key, a missing or non-positive iteration, an unknown phase, a missing flag and an impl node without waves', () => {
  const [reviewer] = runtime.reviewerKeys('design');
  const flatImpl = '{ "iteration": 0, "verdicts": {}, "latched": {} }';
  const cases = [
    { name: 'unknown reviewer key', phase: 'design', iteration: '1', verdict: 'nobody=APPROVE', refusal: /not a reviewer key/ },
    { name: 'lower-case value', phase: 'design', iteration: '1', verdict: `${reviewer}=approve`, refusal: /must be APPROVE/ },
    { name: 'skip without a reason', phase: 'design', iteration: '1', verdict: `${reviewer}=APPROVE (skipped: )`, refusal: /must be APPROVE/ },
    { name: 'repeated key', phase: 'design', iteration: '1', verdict: `${reviewer}=APPROVE;${reviewer}=FAIL`, refusal: /repeats a key/ },
    { name: 'pair without a value', phase: 'design', iteration: '1', verdict: reviewer, refusal: /key=value/ },
    { name: 'iteration zero', phase: 'design', iteration: '0', verdict: `${reviewer}=APPROVE`, refusal: /--iteration/ },
    { name: 'fractional iteration', phase: 'design', iteration: '1.5', verdict: `${reviewer}=APPROVE`, refusal: /--iteration/ },
    { name: 'unknown phase', phase: 'plan', iteration: '1', verdict: `${reviewer}=APPROVE`, refusal: /--phase/ },
    { name: 'impl node without waves', phase: 'impl', iteration: '1', verdict: `${runtime.reviewerKeys('impl')[0]}=APPROVE`, implNode: flatImpl, refusal: /no impl review node/ },
  ];
  const control = path.join(mkTempDir(), 'state.json');
  fs.writeFileSync(control, verdictStateText());
  assert.strictEqual(recordVerdicts(control, 'design', '1', `${reviewer}=APPROVE`).status, 0, 'sanity: the same command with a valid verdict succeeds, so every refusal below is the command\'s own');
  for (const { name, phase, iteration, verdict, implNode, refusal } of cases) {
    const statePath = path.join(mkTempDir(), 'state.json');
    const before = verdictStateText({ implNode: implNode || null });
    fs.writeFileSync(statePath, before);
    const outcome = recordVerdicts(statePath, phase, iteration, verdict);
    assert.ok(outcome.status !== 0 && refusal.test(outcome.stderr), `AC-14: ${name} must exit non-zero with ${refusal}, got ${JSON.stringify(outcome)}`);
    assert.strictEqual(fs.readFileSync(statePath, 'utf8'), before, `AC-14: ${name} must leave the state file byte for byte`);
  }
  const noVerdict = runtimeCliResult(['record-verdicts', '--state', control, '--phase', 'design', '--iteration', '1']);
  assert.ok(noVerdict.status !== 0 && /--verdict/.test(noVerdict.stderr), `AC-14: a missing --verdict exits non-zero naming the flag, got ${JSON.stringify(noVerdict)}`);
});

const LATCH_BASE_FILES = {
  'src/a.js': 'const a = 1;\n',
  'src/b.js': 'const b = 1;\n',
  'src/c.py': 'c = 1\n',
  'src/doc.js': '/**\n * Adds.\n */\nfunction add() {}\nconst total = a\n  * b;\n',
  'notes.xyz': 'one\n',
  'docs/guide.md': 'one\n',
  'tests/x.js': 'const x = 1;\n',
  '.asd/sprints/035-x/tool.js': 'const t = 1;\n',
};

/** Runs `latch-refresh` over a sandbox repo whose wave 1 latched `latched` at `LATCH_BASE_FILES`, with `change` committed afterwards and `manifests` (reviewer to listed files) on disk in the wave's first iteration; `flat` lays the state and manifests out as the legacy flat impl node, `heads: false` leaves the iteration heads empty. Returns the CLI result, the state text before and after, and the latch map after. */
async function latchScenario({ change, manifests, latched, flat = false, heads = true }) {
  const write = (root, rel, text) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text, 'utf8');
  };
  const sandbox = sandboxGitRepoFrom('latch-base', (template) => importCommitsSync(template, [LATCH_BASE_FILES])[0]);
  const { repo, env, shared: base } = sandbox;
  await importCommits(sandbox, [change], { parent: base });
  const sprintDir = path.join(mkTempDir(), '035-x');
  const iterationDir = flat ? path.join('reviews', 'impl', 'iter-01') : path.join('reviews', 'impl', 'wave-1', 'iter-01');
  Object.entries(manifests).forEach(([reviewer, files]) => {
    const name = reviewer === runtime.EXTERNAL_REVIEWER ? `${reviewer}.scope.json` : `${reviewer}.manifest.json`;
    write(sprintDir, path.join(iterationDir, name), JSON.stringify({ files }));
  });
  const node = `{ "iteration": 2, "verdicts": {}, "iteration_heads": ${heads ? `{ "iter-01": "${base}" }` : '{}'}, "latched": ${JSON.stringify(latched)} }`;
  const statePath = path.join(sprintDir, 'state.json');
  write(sprintDir, 'state.json', verdictStateText({ implNode: flat ? node : `{ "wave": 1, "waves": [ ${node} ] }` }));
  const before = fs.readFileSync(statePath, 'utf8');
  const outcome = await runtimeCliResultAsync(['latch-refresh', '--state', statePath, '--sprint-dir', sprintDir], { cwd: repo, env });
  const text = fs.readFileSync(statePath, 'utf8');
  const impl = JSON.parse(text).reviews.impl;
  return { outcome, before, text, latchedAfter: (flat ? impl : impl.waves[0]).latched };
}

test('sprint-035 AC-15: latch-refresh clears the latch of each reviewer whose manifests listed a changed production file, every latch for a file no manifest listed, and keeps them all for a docs, test or sprint-artefact change', async () => {
  const [quality, efficiency] = runtime.INTERNAL_REVIEWERS;
  const external = runtime.EXTERNAL_REVIEWER;
  const latched = { [quality]: 1, [efficiency]: 1, [external]: 1 };
  const manifests = { [quality]: ['src/a.js'], [efficiency]: ['src/b.js'], [external]: ['src/a.js'] };

  const [listed, flat, unlisted, inert, noHeads, noLatch] = await Promise.all([
    latchScenario({ change: { 'src/a.js': 'const a = 2;\n' }, manifests, latched }),
    latchScenario({ change: { 'src/b.js': 'const b = 2;\n' }, manifests, latched, flat: true }),
    latchScenario({ change: { 'src/c.py': 'c = 2\n' }, manifests, latched }),
    latchScenario({ change: { 'docs/guide.md': 'two\n', 'tests/x.js': 'const x = 2;\n', '.asd/sprints/035-x/tool.js': 'const t = 2;\n' }, manifests, latched }),
    latchScenario({ change: { 'src/a.js': 'const a = 2;\n' }, manifests, latched, heads: false }),
    latchScenario({ change: { 'src/a.js': 'const a = 2;\n' }, manifests, latched: {} }),
  ]);
  assert.deepStrictEqual(listed.outcome.result, { cleared: [quality, external], files: ['src/a.js'] }, `AC-15: a code change in a file Quality and External Review listed clears exactly their latches (got ${JSON.stringify(listed.outcome)})`);
  assert.deepStrictEqual(listed.latchedAfter, { [efficiency]: 1 }, 'AC-15: the state keeps the latch of the reviewer that never listed the file');
  assert.deepStrictEqual([flat.outcome.result.cleared, flat.latchedAfter], [[efficiency], { [quality]: 1, [external]: 1 }], 'AC-15: a legacy flat reviews.impl node reads as wave 1, its manifests under reviews/impl/iter-NN');
  assert.deepStrictEqual([unlisted.outcome.result.cleared, unlisted.latchedAfter], [[quality, efficiency, external], {}], 'AC-15: a production file in no manifest of the wave clears every latch');
  assert.deepStrictEqual(inert.outcome.result, { cleared: [], files: [] }, 'AC-15: a docs file, a test file and a sprint artefact are not production executable changes');
  assert.strictEqual(inert.text, inert.before, 'AC-15: nothing cleared writes nothing');
  assert.deepStrictEqual([noHeads.outcome.result.cleared, noHeads.text === noHeads.before], [[], true], 'AC-15: a wave with no iteration head has nothing to diff against and writes nothing');
  assert.deepStrictEqual([noLatch.outcome.result.cleared, noLatch.text === noLatch.before], [[], true], 'AC-15: a wave with no latch writes nothing');
});

test('sprint-035 AC-2: a trigger glob keeps * inside a path segment, lets ** cross segments and match no directory, takes a comma list and backtick-wrapped globs, and anchors on the whole path', () => {
  const matches = runtime.triggerMatches;
  assert.ok(matches('src/*.js', ['src/a.js']) && !matches('src/*.js', ['src/x/a.js']), 'AC-2: * never crosses a segment');
  assert.ok(matches('src/**', ['src/x/y/a.js']), 'AC-2: ** crosses segments');
  assert.ok(matches('**/*.js', ['a.js']) && matches('**/*.js', ['x/y/a.js']), 'AC-2: **/ also matches no directory');
  assert.ok(matches('docs/*.md, `README.md`', ['README.md']) && !matches('docs/*.md, README.md', ['other.md']), 'AC-2: a comma list matches any member, a backtick-wrapped glob is read without its backticks');
  assert.ok(!matches('docs/*.md', ['.asd/docs/a.md']) && !matches('a.js', ['xa.js', 'a.jsx']), 'AC-2: a glob is anchored on the whole path');
  assert.ok(matches('src/*.js', ['src\\a.js']), 'AC-2: a backslash path reads as a slash path');
});

test('sprint-035 AC-2: emit-manifest --checklist adds each item whose trigger matches the reviewer\'s files to the manifest rules and a checklist array, and an absent checklist file adds nothing', () => {
  const root = mkTempDir();
  const checklist = path.join(root, 'reliability-checklist.md');
  fs.writeFileSync(checklist, ['# Reliability checklist', '', '| ID | Trigger | Check | Severity | Source | Last hit |', '|---|---|---|---|---|---|', '| CL-1 | src/** | Guard every parse | critical | 030-a#F-1 | — |', '| CL-2 | docs/** | Link every claim | low | 030-a#F-2 | — |', ''].join('\n'), 'utf8');
  const scope = path.join(root, 'scope.txt');
  fs.writeFileSync(scope, 'src/app.js\n', 'utf8');
  const [quality] = runtime.INTERNAL_REVIEWERS;
  const emit = (name, extra) => {
    const out = path.join(root, name);
    fs.mkdirSync(out);
    const emitted = runtimeCliResult(['emit-manifest', '--reviewer', quality, '--phase', 'impl-review', '--files', scope, '--out', out, ...extra]);
    assert.strictEqual(emitted.status, 0, JSON.stringify(emitted));
    return JSON.parse(fs.readFileSync(emitted.result.manifest, 'utf8'));
  };

  const withList = emit('with', ['--checklist', checklist]);
  assert.deepStrictEqual(withList.checklist, [{ id: 'CL-1', check: 'Guard every parse', severity: 'critical' }], 'AC-2: only the item whose trigger matches a scope file is added, as {id, check, severity}');
  assert.ok(withList.rules.includes('CL-1') && !withList.rules.includes('CL-2'), 'AC-2: the matched id joins the rules the ledger must cover, the unmatched one does not');

  const absent = emit('absent', ['--checklist', path.join(root, 'missing.md')]);
  const without = emit('without', []);
  assert.deepStrictEqual([absent.checklist, absent.rules], [undefined, without.rules], 'AC-2: an absent checklist file adds neither a checklist array nor a rule');
});

test('sprint-035 AC-16: --base-ref reads each reviewer rubric and the bundle\'s base-ref files from that git ref, omits a bundle file, or a granted section, absent there with a stderr note, and refuses a ref naming no commit or a rubric absent at it', async () => {
  const sandbox = sandboxGitRepo();
  const { repo, env } = sandbox;
  const [quality] = runtime.INTERNAL_REVIEWERS;
  const SENTINEL = 'BASEREF-SENTINEL';
  const GRANTED = '.asd/rules/review-policy.md#Nitpick drop list (reviewers must NOT raise)';
  const rubricRel = `.asd/agents/asd-reviewer-${quality}.md`;
  const policyRel = '.asd/rules/review-policy.md';
  const [withoutRubric, withRubric, withoutHeading, withDuplicate] = await importCommits(sandbox, [
    { 'keep.txt': 'x\n' },
    {
      [rubricRel]: readRepoFile(rubricRel).replace(/^## Review rubric *$/m, `## Review rubric\n\n### ${SENTINEL}\n`),
      [policyRel]: readRepoFile(policyRel).replace(/^## Severity levels *$/m, `## Severity levels\n\n${SENTINEL} line.\n`),
    },
    { [policyRel]: readRepoFile(policyRel).replace(/^## Nitpick drop list.*$/m, 'Nitpick drop list') },
    { [policyRel]: readRepoFile(policyRel).replace(/^## Nitpick drop list.*$/m, (heading) => `${heading}\n\n${heading}`) },
  ]);

  const scope = path.join(mkTempDir(), 'scope.txt');
  fs.writeFileSync(scope, 'src/app.js\n', 'utf8');
  const emit = async (extra) => {
    const out = mkTempDir();
    const emitted = await runtimeCliResultAsync(['emit-manifest', '--reviewer', quality, '--phase', 'impl-review', '--files', scope, '--out', out, ...extra], { cwd: repo, env });
    return emitted.status === 0 ? { rules: JSON.parse(fs.readFileSync(emitted.result.manifest, 'utf8')).rules } : emitted;
  };
  const bundle = async (extra) => {
    const out = path.join(mkTempDir(), 'bundle.md');
    const ran = await runtimeSpawnAsync(['context', '--role', 'asd-external-review', '--phase', 'impl-review', '--out', out, ...extra], { cwd: repo, env });
    return { status: ran.status, stderr: ran.stderr, text: ran.status === 0 ? fs.readFileSync(out, 'utf8') : '' };
  };
  const [fromRubricRef, fromRubricTree, unknown, absentRubric, fromRef, fromTree, missingSection, duplicateSection] = await Promise.all([
    emit(['--base-ref', withRubric]),
    emit([]),
    emit(['--base-ref', 'no-such-ref']),
    emit(['--base-ref', withoutRubric]),
    bundle(['--base-ref', withRubric]),
    bundle([]),
    bundle(['--base-ref', withoutHeading]),
    bundle(['--base-ref', withDuplicate]),
  ]);
  assert.ok(fromRubricRef.rules.includes(SENTINEL), 'AC-16: the rubric comes from the ref - the sentinel exists only in the committed copy');
  assert.ok(!fromRubricTree.rules.includes(SENTINEL), 'AC-16: without --base-ref the rubric is the working-tree one');
  assert.ok(unknown.status !== 0 && /names no commit/.test(unknown.stderr), `AC-16: an unresolvable ref fails naming it (got ${JSON.stringify(unknown)})`);
  assert.ok(absentRubric.status !== 0 && /not found at/.test(absentRubric.stderr), `AC-16: a rubric absent at the ref fails (got ${JSON.stringify(absentRubric)})`);

  assert.strictEqual(fromRef.status, 0, fromRef.stderr);
  assert.ok(fromRef.text.includes(SENTINEL), 'AC-16: a bundle review-policy section comes from the ref');
  assert.ok(!fromRef.text.includes('<!-- .asd/rules/external-review.md#') && fromRef.stderr.includes(`external-review.md absent at ${withRubric}, omitted`), 'AC-16: external-review.md is absent at the ref, so its sections are omitted with a stderr note');
  assert.ok(fromTree.text.includes('<!-- .asd/rules/external-review.md#') && !fromTree.text.includes(SENTINEL) && fromTree.stderr === '', 'AC-16: without --base-ref every file reads from the working tree, nothing omitted');

  assert.ok(fromTree.text.includes(`<!-- ${GRANTED} -->`), 'sanity: the role is granted that review-policy section');
  assert.strictEqual(missingSection.status, 0, `AC-16: a section absent at the ref omits that ref instead of failing the bundle (got ${missingSection.stderr})`);
  assert.ok(missingSection.stderr.includes(`runtime: ${GRANTED} absent at ${withoutHeading}, omitted`), `AC-16: the omission is noted on stderr, naming the section (got ${missingSection.stderr})`);
  assert.ok(!missingSection.text.includes(`<!-- ${GRANTED} -->`) && missingSection.text.includes('<!-- .asd/rules/review-policy.md#Severity levels -->'), 'AC-16: only the absent section is omitted, the file\'s other granted sections stay');

  assert.ok(duplicateSection.status !== 0 && /2 matches/.test(duplicateSection.stderr) && !duplicateSection.stderr.includes(`runtime: ${GRANTED} absent`), `AC-16: a granted heading present twice at the ref fails the bundle, it is not read as absent (got ${JSON.stringify(duplicateSection)})`);
});

test('sprint-035 AC-5, AC-2: persist-review gives each finding pre_existing when its Description opens with `pre-existing:` and checklist as the distinct CL-N ids it cites, and no marker otherwise', () => {
  const root = mkTempDir();
  const header = ['| # | Severity | Location | Description | Suggested fix |', '|---|---|---|---|---|'];
  const rows = [
    '| 1 | high | `a.js:1` | pre-existing: unchecked null; CL-3 and CL-3 again | f |',
    '| 2 | low | `b.js:2` | notes the pre-existing: wording mid-text | f |',
    '| 3 | medium | `c.js:3` | cites CL-12 then CL-1 | f |',
    '| 4 | medium | `d.js:4` | plain | f |',
  ];
  const input = path.join(root, 'returned.md');
  fs.writeFileSync(input, `[REVIEW-impl-external]: CONCERNS\n\n## Kept findings\n\n${[...header, ...rows].join('\n')}\n`, 'utf8');
  const persisted = runtimeCliResult(['persist-review', '--phase', 'impl', '--reviewer', runtime.EXTERNAL_REVIEWER, '--in', input, '--out-dir', root]);
  assert.strictEqual(persisted.status, 0, JSON.stringify(persisted));
  const expected = [
    { id: '1', severity: 'high', location: 'a.js:1', pre_existing: true, checklist: ['CL-3'] },
    { id: '2', severity: 'low', location: 'b.js:2' },
    { id: '3', severity: 'medium', location: 'c.js:3', checklist: ['CL-12', 'CL-1'] },
    { id: '4', severity: 'medium', location: 'd.js:4' },
  ];
  assert.deepStrictEqual(persisted.result.findings, expected, 'AC-5: the markers ride each finding, a mid-text mention is no marker');
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(path.join(root, `${runtime.EXTERNAL_REVIEWER}.findings.json`), 'utf8')), expected, 'AC-4: the findings JSON checklist-hits reads carries the same markers');
});

/** A checklist file: a title line, then one row per `[id, severity, source, lastHit]`, in `eol`. */
function checklistText(rows, eol = '\n') {
  const lines = ['# Reliability checklist', '', '| ID | Trigger | Check | Severity | Source | Last hit |', '|---|---|---|---|---|---|', ...rows.map(([id, severity, source, lastHit]) => `| ${id} | src/** | Check ${id} | ${severity} | ${source} | ${lastHit} |`), ''];
  return lines.join(eol);
}

test('sprint-035 AC-4: checklist-hits stamps the sprint as Last hit on each cited item and nothing else, and lists as candidates the non-critical items unhit for three sprints, counted from Last hit else Source', () => {
  const SPRINT = '045-current';
  const rows = [
    ['CL-1', 'high', '030-a#F-1', '—'],
    ['CL-2', 'high', '030-a#F-2', '041-b'],
    ['CL-3', 'high', '030-a#F-3', '042-c'],
    ['CL-4', 'high', '030-a#F-4', '043-d'],
    ['CL-5', 'critical', '010-a#F-5', '—'],
    ['CL-6', 'medium', '042-e#A-1', '—'],
    ['CL-7', 'medium', '043-e#A-1', '—'],
  ];
  const stamped = rows.map((row) => (row[0] === 'CL-1' ? [...row.slice(0, 3), SPRINT] : row));
  const setup = (eol) => {
    const sprintDir = path.join(mkTempDir(), SPRINT);
    const iterationDir = path.join(sprintDir, 'reviews', 'impl', 'wave-1', 'iter-01');
    fs.mkdirSync(iterationDir, { recursive: true });
    fs.writeFileSync(path.join(iterationDir, 'quality.findings.json'), JSON.stringify([{ id: '1', severity: 'high', location: 'a.js:1', checklist: ['CL-1', 'CL-9'] }, { id: '2', severity: 'low', location: 'b.js:2' }]), 'utf8');
    const checklist = path.join(mkTempDir(), 'reliability-checklist.md');
    fs.writeFileSync(checklist, checklistText(rows, eol), 'utf8');
    return { sprintDir, checklist };
  };

  for (const eol of ['\n', '\r\n']) {
    const { sprintDir, checklist } = setup(eol);
    const run = () => runtimeCliResult(['checklist-hits', '--checklist', checklist, '--sprint-dir', sprintDir]);
    const first = run();
    assert.deepStrictEqual(first.result, { hit: ['CL-1'], candidates: ['CL-2', 'CL-3', 'CL-6'] }, `AC-4: only the cited existing item is a hit; 4 sprints (Last hit), exactly 3 (Last hit), and 3 counted from Source are candidates, 2 sprints and a critical item are not (got ${JSON.stringify(first)})`);
    assert.strictEqual(fs.readFileSync(checklist, 'utf8'), checklistText(stamped, eol), `AC-4: exactly CL-1's Last hit cell changed, every other byte and the ${JSON.stringify(eol)} line endings kept`);
    assert.deepStrictEqual(run().result, first.result, 'AC-4: a second run reports the same');
    assert.strictEqual(fs.readFileSync(checklist, 'utf8'), checklistText(stamped, eol), 'AC-4: the second run leaves the file as the first left it');
  }

  const missing = path.join(mkTempDir(), 'reliability-checklist.md');
  const absent = runtimeCliResult(['checklist-hits', '--checklist', missing, '--sprint-dir', setup('\n').sprintDir]);
  assert.deepStrictEqual(absent.result, { hit: [], candidates: [] }, 'AC-4: an absent checklist reports empty lists');
  assert.ok(!fs.existsSync(missing), 'AC-4: an absent checklist is never created');
});

test('sprint-036 AC-9: latch-refresh counts a comment-only, blank-only or doc-block change to a production file like any code change, clearing the latch of each reviewer whose manifest listed it', async () => {
  const [quality] = runtime.INTERNAL_REVIEWERS;
  const clearsFor = async (rel, text) => (await latchScenario({ change: { [rel]: text }, manifests: { [quality]: [rel] }, latched: { [quality]: 1 } })).outcome.result.cleared;
  const changes = [
    ['an added comment line and a blank line', 'src/a.js', 'const a = 1;\n// note\n\n'],
    ['an added blank line only', 'src/a.js', 'const a = 1;\n\n'],
    ['an edited doc-block body', 'src/doc.js', LATCH_BASE_FILES['src/doc.js'].replace('Adds.', 'Adds two numbers.')],
    ['a hash-family comment', 'src/c.py', 'c = 1\n# note\n'],
    ['an unknown extension', 'notes.xyz', 'one\n// only a comment\n'],
  ];
  const cleared = await Promise.all(changes.map(([, rel, text]) => clearsFor(rel, text)));
  assert.deepStrictEqual(changes.map(([what], index) => [what, cleared[index]]), changes.map(([what]) => [what, [quality]]), 'AC-9: no change to a production executable file keeps the latch, a comment or blank line included');
});
