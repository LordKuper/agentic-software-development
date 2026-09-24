'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const CACHE_SCHEMA = 1;
const PROBE_TIMEOUT_MS = 3000;
const NEGATIVE_TTL_MS = 300000;
const MAX_NEGATIVE_TTL_MS = 3600000;
const RESERVED_CHANGE_RISKS = ['security', 'authentication', 'migration', 'public contract', 'workflow gate'];
/** The single review-ledger row vocabulary: allowed statuses per row type, plus the one status carrying `p` and the one carrying `f`. Emitted into every manifest and enforced on every ledger from here, so published and enforced vocabulary cannot drift. */
const LEDGER_VOCABULARY = { files: ['checked', 'n/a'], rules: ['pass', 'n/a', 'finding'], sections: ['reviewed', 'n/a'], p: 'n/a', f: 'finding' };
/** One filled ledger row, published beside the vocabulary so a reviewer reads the row shape off its own input too. Its status is taken from the vocabulary constant and paired with the key that status requires, so the example cannot teach a row the validator rejects. */
const LEDGER_ROW_EXAMPLE = { i: '<manifest id>', s: LEDGER_VOCABULARY.p, p: '<allowed n/a predicate>' };
const ROW_TYPES = Object.keys(LEDGER_VOCABULARY).filter((key) => Array.isArray(LEDGER_VOCABULARY[key]));
/** The `n_a` shape: row type, then manifest id, then its allowed predicate list. Published beside the vocabulary under its own key, because `n_a` itself carries per-dispatch content. */
const LEDGER_NA_SHAPE = Object.fromEntries(ROW_TYPES.map((type) => [type, { [LEDGER_ROW_EXAMPLE.i]: [LEDGER_ROW_EXAMPLE.p] }]));
/** A reviewable change surface above this many files blocks plan acceptance and impl-review entry until the user splits the sprint or approves an override bound. */
const SURFACE_CAP_FILES = 100;
/** Changed lines (added plus deleted) one impl-review wave carries; a larger scope divides into more waves, so no review turn holds an oversized diff. */
const WAVE_THRESHOLD_LINES = 3000;
/** Most review waves one scope divides into, so an oversized scope still ends in a bounded number of sequential reviews. */
const MAX_REVIEW_WAVES = 3;
/** An audit whose touched areas track more than this many files gets a batched-read plan in the architect payload. */
const AUDIT_BATCH_THRESHOLD_FILES = 200;
/** Internal reviewers, named as `emit-manifest --reviewer` takes them. */
const INTERNAL_REVIEWERS = ['correctness', 'efficiency', 'testing', 'documentation'];
/** The `emit-manifest --reviewer` name that emits External Review's scope manifest instead of a coverage manifest. */
const EXTERNAL_REVIEWER = 'external';
/** The standing n/a predicates, each the exact text a ledger row records. The emitter authorizes one only where its condition holds; this is their sole home. */
const NA_PREDICATES = {
  phaseGate: 'outside phase gate',
  uiSurface: 'no UI surface in scope',
  perf: 'no perf budgets section and no executable file in scope',
  noBudgets: 'no budgets defined',
  noHtml: 'no HTML file in scope',
  noSelfHosting: 'self_hosting not enabled',
  noTemplated: 'no templated artefact in scope',
  pureRename: 'pure rename: identical content and mode',
};
/** Rubric entries each conditional predicate covers, by reviewer and id prefix; a prefix matching no entry fails the emit closed. */
const NA_TARGETS = {
  ui: { correctness: ['UI conformance'] },
  perf: { efficiency: ['Perf budget compliance', 'Perf anti-patterns', 'Algorithmic complexity', 'Regression detection', 'Hot path identification'] },
  budgetCompliance: { efficiency: ['Perf budget compliance'] },
  html: { documentation: ['HTML shell wrapping', 'Provenance', 'Traceability'] },
  selfHosting: { documentation: ['Framework mode'] },
  templated: { documentation: ['Template adherence'] },
};
const PHASES = ['design-review', 'impl-review'];

function stable(value) {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + stable(value[key])).join(',') + '}';
  return JSON.stringify(value);
}

/** Returns a stable SHA-256 identity for resumable runtime evidence. */
function fingerprint(value) {
  return crypto.createHash('sha256').update(stable(value)).digest('hex');
}

function fail(message) {
  throw new Error(message);
}

function stringArray(value, name) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || item.includes('\0'))) fail(`${name} must be a string array`);
  return value;
}

/** Normalizes one declared risk; an untyped name carries the strictest target, a reserved class fails closed unless declared against the change. */
function riskEntry(value) {
  const entry = typeof value === 'string' ? { name: value, target: 'change' } : value;
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) fail('risks entry must be a name or a typed risk');
  if (typeof entry.name !== 'string' || entry.name.length === 0 || entry.name.includes('\0')) fail('risks entry name must be a non-empty string');
  if (entry.target !== 'change' && entry.target !== 'artifact') fail('risks entry target must be change or artifact');
  if (entry.target === 'artifact' && RESERVED_CHANGE_RISKS.includes(entry.name.toLowerCase().replace(/[\s_-]+/g, ' ').trim())) fail(`reserved risk class is change by definition: ${entry.name}`);
  return { name: entry.name, target: entry.target };
}

function riskArray(value, name) {
  if (!Array.isArray(value)) fail(`${name} must be an array of risks`);
  return value.map(riskEntry);
}

/** Builds the spawn shape for a command: direct argv, or the Windows PowerShell JSON-stdin fallback. */
function buildInvocation(platform, command, args, viaPowerShell) {
  if (platform === 'win32' && (viaPowerShell || /\.(cmd|bat|ps1)$/i.test(command))) {
    return {
      file: 'powershell.exe',
      args: ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', '$ErrorActionPreference = "Stop"; try { $request = [Console]::In.ReadToEnd() | ConvertFrom-Json; $global:LASTEXITCODE = 0; & $request.command @($request.args); exit $LASTEXITCODE } catch { exit 1 }'],
      input: JSON.stringify({ command, args }),
    };
  }
  return { file: command, args };
}

function runLocal(command, args) {
  if (typeof command !== 'string' || command.length === 0 || command.includes('\0')) fail('command must be a non-empty executable path');
  stringArray(args, 'args');
  const direct = buildInvocation(process.platform, command, args);
  let result = direct.input === undefined ? spawnSync(direct.file, direct.args, {
    encoding: 'utf8', shell: false, timeout: PROBE_TIMEOUT_MS, windowsHide: true,
  }) : null;
  if (process.platform === 'win32' && (direct.input !== undefined || (result.error && result.error.code === 'ENOENT'))) {
    const plan = direct.input !== undefined ? direct : buildInvocation(process.platform, command, args, true);
    result = spawnSync(plan.file, plan.args, {
      encoding: 'utf8', input: plan.input, shell: false, timeout: PROBE_TIMEOUT_MS, windowsHide: true,
    });
  }
  return { ok: !result.error && result.status === 0 };
}

function defaultAuthArgs(provider) {
  if (provider === 'codex') return ['login', 'status'];
  if (provider === 'claude') return ['auth', 'status', '--json'];
  fail('provider must be codex or claude');
}

function readCache(cachePath, now) {
  if (!cachePath || !fs.existsSync(cachePath)) return { schema: CACHE_SCHEMA, entries: {} };
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch (_) {
    return { schema: CACHE_SCHEMA, entries: {} };
  }
  if (!parsed || parsed.schema !== CACHE_SCHEMA || !parsed.entries || typeof parsed.entries !== 'object' || Array.isArray(parsed.entries)) return { schema: CACHE_SCHEMA, entries: {} };
  const cutoff = Number.isFinite(now) ? now : Date.now();
  const entries = {};
  for (const [key, entry] of Object.entries(parsed.entries)) {
    if (/^[a-f0-9]{64}$/.test(key) && entry && typeof entry.status === 'string' && Number.isFinite(entry.retry_after) && entry.retry_after > cutoff) entries[key] = { status: entry.status, retry_after: entry.retry_after };
  }
  return { schema: CACHE_SCHEMA, entries };
}

function writeCache(cachePath, cache) {
  if (!cachePath) return;
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify(cache) + '\n', 'utf8');
}

function authGeneration(input) {
  if (typeof input.authGeneration === 'string') return input.authGeneration;
  if (typeof input.credentialPath !== 'string' || !fs.existsSync(input.credentialPath)) return 'unknown';
  try {
    const stat = fs.statSync(input.credentialPath);
    return `${stat.mtimeMs}:${stat.size}`;
  } catch (_) {
    return 'unknown';
  }
}

function cacheKey(input, authReady) {
  return fingerprint({ provider: input.provider, model: input.model, command: input.command, auth_args: defaultAuthArgs(input.provider), auth_ready: authReady, auth_generation: authGeneration(input) });
}

/** Checks executable and authentication locally without making a model request; reports the host platform External Review combines with its host shell to pick stdin syntax. */
function externalPreflight(input) {
  return { ...localReadiness(input), platform: process.platform };
}

function localReadiness(input) {
  if (!input || typeof input !== 'object') fail('preflight input required');
  const provider = input.provider;
  const model = input.model;
  if (provider !== 'codex' && provider !== 'claude') fail('provider must be codex or claude');
  if (input.authArgs !== undefined) fail('authArgs are not supported');
  if (typeof model !== 'string' || model.length === 0) fail('model required');
  const authArgs = defaultAuthArgs(provider);
  const version = runLocal(input.command, ['--version']);
  if (!version.ok) {
    return { status: 'command-unavailable', model_access: 'unknown', fingerprint: cacheKey(input, false) };
  }
  const auth = runLocal(input.command, authArgs);
  const key = cacheKey(input, auth.ok);
  if (!auth.ok) return { status: 'authentication-unavailable', model_access: 'unknown', fingerprint: key };
  const now = Number.isFinite(input.now) ? input.now : Date.now();
  const cached = readCache(input.cachePath, now).entries[key];
  if (cached) {
    return { status: 'negative-cache', reason: cached.status, retry_after: cached.retry_after, model_access: 'unknown', fingerprint: key };
  }
  return { status: 'local-ready', model_access: 'unknown', fingerprint: key };
}

/** Stores one bounded, sanitized external-model failure for later retry control. */
function recordExternalFailure(input) {
  if (!input || !/^[a-f0-9]{64}$/.test(input.fingerprint || '')) fail('valid fingerprint required');
  if (!['authentication', 'quota', 'reachability', 'command'].includes(input.status)) fail('unsupported external failure status');
  const now = Number.isFinite(input.now) ? input.now : Date.now();
  const retryAfter = input.retryAfter || now + NEGATIVE_TTL_MS;
  if (!Number.isFinite(retryAfter) || retryAfter <= now || retryAfter > now + MAX_NEGATIVE_TTL_MS) fail('retryAfter outside bounded future');
  const cache = readCache(input.cachePath, now);
  cache.entries[input.fingerprint] = { status: input.status, retry_after: retryAfter };
  writeCache(input.cachePath, cache);
  return cache.entries[input.fingerprint];
}

/** Selects a task class without allowing a task to move to a weaker class. */
function routeTask(input) {
  if (!input || typeof input !== 'object') fail('routing input required');
  if (!['command', 'mechanical', 'standard'].includes(input.kind)) fail('routing kind invalid');
  if (typeof input.objectiveInputs !== 'boolean' || typeof input.failedObjectiveCheck !== 'boolean') fail('routing evidence incomplete');
  const risks = riskArray(input.risks, 'risks');
  const checks = stringArray(input.checks, 'checks');
  if (!Number.isInteger(input.correctionAttempts) || input.correctionAttempts < 0) fail('correctionAttempts invalid');
  const attempted = input.correctionAttempts;
  const ranks = { mechanical: 0, standard: 1, critical: 2 };
  if (input.priorTier !== undefined && !Object.prototype.hasOwnProperty.call(ranks, input.priorTier)) fail('priorTier invalid');
  const changeRisk = risks.find((risk) => risk.target === 'change');
  const artifactRisk = risks.find((risk) => risk.target === 'artifact');
  const deterministicCommand = input.kind === 'command' && input.objectiveInputs === true && checks.includes('deterministic-state');
  const mechanical = input.kind === 'mechanical' && input.objectiveInputs === true && checks.includes('deterministic-check') && checks.includes('exhaustive-match-validation');
  const computedTier = changeRisk || (input.failedObjectiveCheck && attempted >= 1) ? 'critical' : deterministicCommand || mechanical ? 'mechanical' : 'standard';
  const clamped = Boolean(input.priorTier) && ranks[input.priorTier] > ranks[computedTier];
  const tier = clamped ? input.priorTier : computedTier;
  const execution = deterministicCommand && tier === 'mechanical' && risks.length === 0 ? 'command' : 'agent';
  const reason = changeRisk ? `risk:${changeRisk.name}` : input.failedObjectiveCheck && attempted >= 1 ? 'failed-objective-check' : clamped ? 'no-downgrade' : artifactRisk ? `artifact-risk:${artifactRisk.name}` : execution === 'command' ? 'deterministic-command' : tier === 'mechanical' ? 'objective-mechanical' : 'normal';
  return { tier, execution, reason };
}

function rowsById(rows, expected, allowedNa, findings, label) {
  if (!Array.isArray(rows)) fail(`${label} rows must be an array`);
  const allowedStatuses = new Set(LEDGER_VOCABULARY[label]);
  const { p: naStatus, f: findingStatus } = LEDGER_VOCABULARY;
  const seen = new Set();
  for (const row of rows) {
    if (!row || typeof row.i !== 'string' || typeof row.s !== 'string') fail(`${label} row malformed`);
    if (!expected.has(row.i) || seen.has(row.i)) fail(`${label} row identity invalid: ${row.i}`);
    if (!allowedStatuses.has(row.s)) fail(`${label} status invalid: ${row.s}`);
    if (row.s === naStatus && (typeof row.p !== 'string' || !allowedNa.get(row.i).has(row.p))) fail(`${label} n/a predicate invalid: ${row.i}`);
    if (row.s !== naStatus && row.p !== undefined) fail(`${label} predicate only allowed for n/a: ${row.i}`);
    if (row.s === findingStatus && (typeof row.f !== 'string' || !findings.has(row.f))) fail(`${label} finding reference invalid: ${row.i}`);
    if (row.s !== findingStatus && row.f !== undefined) fail(`${label} finding reference only allowed for finding: ${row.i}`);
    seen.add(row.i);
  }
  if (seen.size !== expected.size) fail(`${label} rows incomplete`);
}

/** Returns the required manifest digest for a review coverage ledger: the manifest exactly as written, minus `digest`. A manifest missing a published constant keeps the identity it was stamped with, so one written before that field existed still validates; a divergent one is digested as written and rejected on validation. */
function coverageManifestDigest(manifest) {
  if (!manifest || typeof manifest !== 'object') fail('manifest required');
  const copy = Object.assign({}, manifest);
  delete copy.digest;
  return fingerprint(copy);
}

/** Validates one complete compact review ledger against phase-derived evidence. */
function validateCoverageLedger(manifest, ledger, actualFindings) {
  if (!manifest || !ledger) fail('manifest and ledger required');
  const digest = coverageManifestDigest(manifest);
  if (manifest.digest !== digest || ledger.manifest_digest !== digest) fail('ledger manifest identity invalid');
  if (manifest.vocabulary !== undefined && stable(manifest.vocabulary) !== stable(LEDGER_VOCABULARY)) fail('manifest vocabulary invalid');
  if (manifest.row_example !== undefined && stable(manifest.row_example) !== stable(LEDGER_ROW_EXAMPLE)) fail('manifest row example invalid');
  if (manifest.n_a_shape !== undefined && stable(manifest.n_a_shape) !== stable(LEDGER_NA_SHAPE)) fail('manifest n_a shape invalid');
  if (manifest.n_a !== undefined) {
    if (!manifest.n_a || typeof manifest.n_a !== 'object' || Array.isArray(manifest.n_a)) fail('manifest n_a invalid');
    for (const key of Object.keys(manifest.n_a)) if (!ROW_TYPES.includes(key)) fail(`manifest n_a unknown row type: ${key}`);
  }
  const ids = (name) => {
    if (!Array.isArray(manifest[name]) || manifest[name].some((item) => typeof item !== 'string')) fail(`manifest ${name} invalid`);
    const set = new Set(manifest[name]);
    if (set.size !== manifest[name].length) fail(`manifest ${name} duplicates`);
    return set;
  };
  const allowedNa = (label, expected) => {
    const entries = manifest.n_a && manifest.n_a[label] || {};
    if (!entries || typeof entries !== 'object' || Array.isArray(entries)) fail(`manifest n_a.${label} invalid`);
    const out = new Map();
    for (const id of expected) {
      const predicates = entries[id] || [];
      if (!Array.isArray(predicates) || predicates.some((value) => typeof value !== 'string' || value.length === 0)) fail(`manifest n_a.${label}.${id} invalid`);
      out.set(id, new Set(predicates));
    }
    for (const id of Object.keys(entries)) if (!expected.has(id)) fail(`manifest n_a.${label} unknown id: ${id}`);
    return out;
  };
  const findingIds = Array.isArray(ledger.findings) ? ledger.findings : [];
  if (!Array.isArray(actualFindings) || actualFindings.some((id) => typeof id !== 'string' || id.length === 0)) fail('actual findings invalid');
  if (findingIds.some((id) => typeof id !== 'string' || id.length === 0) || new Set(findingIds).size !== findingIds.length || stable(findingIds.slice().sort()) !== stable(actualFindings.slice().sort())) fail('ledger findings invalid');
  const findings = new Set(findingIds);
  const files = ids('files');
  const rules = ids('rules');
  const sections = ids('sections');
  rowsById(ledger.files, files, allowedNa('files', files), findings, 'files');
  rowsById(ledger.rules, rules, allowedNa('rules', rules), findings, 'rules');
  rowsById(ledger.sections || [], sections, allowedNa('sections', sections), findings, 'sections');
  return { ok: true };
}

/** Stamps every published constant into an emitted manifest and sets its digest. */
function stampManifest(manifest) {
  const stamped = Object.assign({}, manifest, { vocabulary: LEDGER_VOCABULARY, row_example: LEDGER_ROW_EXAMPLE, n_a_shape: LEDGER_NA_SHAPE });
  return Object.assign(stamped, { digest: coverageManifestDigest(stamped) });
}

/** Parses a reviewer's `## Review rubric`: rule ids are its `###` headings, else its bullets' bold lead-in labels; section ids are its `###` headings. */
function rubricIds(markdown) {
  if (typeof markdown !== 'string') fail('rubric markdown required');
  const rubric = markdown.replace(/\r\n/g, '\n').split(/^## Review rubric *$/m)[1];
  if (rubric === undefined) fail('reviewer has no ## Review rubric');
  const body = rubric.split(/^## /m)[0];
  const sections = [...body.matchAll(/^### (.+)$/gm)].map((match) => match[1].trim());
  const rules = sections.length > 0 ? sections : [...body.matchAll(/^- \*\*(.+?)\*\*/gm)].map((match) => match[1]);
  if (rules.length === 0) fail('reviewer rubric has no entries');
  return { rules, sections };
}

/** A UI surface: `.html`/`.htm` outside `.asd/` or under `.asd/templates/`, a stylesheet or component-framework file, or any file under a `ui`/`components`/`views`/`pages` path segment. */
function isUiSurface(file) {
  if (/\.html?$/i.test(file)) return !file.startsWith('.asd/') || file.startsWith('.asd/templates/');
  return /\.(css|scss|less|jsx|tsx|vue|svelte)$/i.test(file) || /(^|\/)(ui|components|views|pages)\//.test(file);
}

/** An executable file is anything that is not prose, config or markup, so an unrecognised extension keeps the performance sections reviewed. */
function isExecutable(file) {
  return !/\.(md|json|ya?ml|toml|html?|txt)$/i.test(file);
}

/** A templated artefact: basename equal to a template name (so `AGENTS.md`/`CLAUDE.md` at any depth), or a path under `.asd/templates/`, `docs/` or `.asd/sprints/`. */
function isTemplated(file, templates) {
  return templates.includes(file.split('/').pop()) || /^(\.asd\/templates\/|docs\/|\.asd\/sprints\/)/.test(file);
}

/** Every `t_<name>` file under a templates directory, at any depth, as `<name>`. */
function templateNames(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? templateNames(path.join(dir, entry.name)) : entry.name.startsWith('t_') ? [entry.name.slice(2)] : []));
}

/** Maps every rule id to the standing n/a predicates its condition authorizes for this dispatch. */
function standingPredicates(input, ids, customRules, templates) {
  const granted = new Map(ids.map((id) => [id, []]));
  const targets = (key) => (NA_TARGETS[key][input.reviewer] || []).map((prefix) => ids.find((id) => id.startsWith(prefix)) || fail(`rubric entry missing for n/a predicate: ${prefix}`));
  const grant = (key, predicate) => targets(key).forEach((id) => granted.get(id).push(predicate));
  const otherPhase = PHASES.find((phase) => phase !== input.phase);
  const hasBudgets = Object.entries(customRules).some(([file, text]) => file.endsWith('custom-coding-rules.md') && /^#+ [^\n]*perf[^\n]*budget/im.test(text));
  Object.keys(NA_TARGETS).forEach(targets);
  ids.filter((id) => id.includes(otherPhase) && !id.includes(input.phase)).forEach((id) => granted.get(id).push(NA_PREDICATES.phaseGate));
  if (!input.files.some((file) => /\.html?$/i.test(file))) grant('html', NA_PREDICATES.noHtml);
  if (input.selfHosting !== true) grant('selfHosting', NA_PREDICATES.noSelfHosting);
  if (!input.files.some((file) => isTemplated(file, templates))) grant('templated', NA_PREDICATES.noTemplated);
  if (input.phase === 'design-review') {
    if (!input.files.some((file) => /(^|\/)(ux-spec\.html|design-md-delta\.yaml)$/.test(file))) grant('ui', NA_PREDICATES.phaseGate);
    return granted;
  }
  if (!input.files.some(isUiSurface)) grant('ui', NA_PREDICATES.uiSurface);
  if (!hasBudgets && !input.files.some(isExecutable)) grant('perf', NA_PREDICATES.perf);
  if (!hasBudgets) grant('budgetCompliance', NA_PREDICATES.noBudgets);
  return granted;
}

/** Emits one reviewer's stamped coverage manifest over its whole file list. */
function emitCoverageManifest(input) {
  if (!input || typeof input !== 'object') fail('emit input required');
  if (!PHASES.includes(input.phase)) fail('phase must be design-review or impl-review');
  const files = stringArray(input.files, 'files');
  const customRules = input.customRules || {};
  const rubric = rubricIds(input.rubric);
  const rules = rubric.rules.concat(Object.keys(customRules));
  const templates = input.templates === undefined ? [] : stringArray(input.templates, 'templates');
  const granted = standingPredicates(input, rules, customRules, templates);
  const naFor = (ids) => Object.fromEntries(ids.map((id) => [id, granted.get(id)]).filter(([, predicates]) => predicates.length > 0));
  const renamed = new Set(input.pureRenames === undefined ? [] : stringArray(input.pureRenames, 'pureRenames'));
  return stampManifest({
    reviewer: input.reviewer,
    phase: input.phase,
    files,
    rules,
    sections: rubric.sections,
    n_a: { files: Object.fromEntries(files.filter((file) => renamed.has(file)).map((file) => [file, [NA_PREDICATES.pureRename]])), rules: naFor(rules), sections: naFor(rubric.sections) },
  });
}

/** A test file: under a `test`/`tests`/`__tests__`/`spec`/`specs` path segment, or a basename in a common test naming convention. Heuristic, so Correctness's full list stays the backstop for a miss. */
function isTest(file) {
  return /(^|\/)(test|tests|__tests__|spec|specs)\//i.test(file) || /\.(test|spec)\.|^test_|_test\.|Tests?\./.test(file.split('/').pop());
}

/** One reviewer's file list, the single selector every manifest is built from: impl-review Testing narrows to test files plus the explicitly passed test-plan paths, which the scope pathspec excludes; every other reviewer gets the whole scope. */
function reviewerFiles(phase, reviewer, files, testPlan) {
  if (phase !== 'impl-review' || reviewer !== 'testing') return files;
  return [...new Set(files.filter(isTest).concat(testPlan))];
}

/** Reads a reviewer ledger from bare JSON, or from the one fenced block carrying `manifest_digest` inside the reviewer's returned text. */
function ledgerFromText(text) {
  const parse = (candidate) => {
    try { return JSON.parse(candidate); } catch (_) { return undefined; }
  };
  const bare = parse(text);
  if (bare !== undefined) return bare;
  const blocks = [...text.matchAll(/^```[^\n]*\r?\n([\s\S]*?)^```/gm)].map((match) => parse(match[1])).filter((value) => value && typeof value === 'object' && value.manifest_digest !== undefined);
  if (blocks.length !== 1) fail('ledger must be JSON or returned text with exactly one fenced ledger block');
  return blocks[0];
}

/** Splits one markdown table row into trimmed cells, honouring `\|` escapes and dropping one enclosing backtick pair. */
function tableCells(line) {
  return line.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, '|').replace(/^`(.*)`$/, '$1'));
}

/** Compares the code-defect identity sets (file path without line, runner failure line, failing test) of the last two impl-test entries that routed defects in a test plan's `Defects` table, a stalemate only when those entry numbers are consecutive; `D-N` ids and `impl-review` rows never take part. `digest` identifies the latest set, so a recorded answer can be keyed to it. */
function defectStalemate(markdown) {
  if (typeof markdown !== 'string') fail('test-plan markdown required');
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const headings = lines.flatMap((line, i) => (/^## Defects\b/.test(line) ? [i + 1] : []));
  if (headings.length === 0) fail('test-plan has no ## Defects section');
  if (headings.length > 1) fail(`test-plan has ${headings.length} ## Defects sections at lines ${headings.join(', ')}`);
  const end = lines.findIndex((line, i) => i >= headings[0] && /^## /.test(line));
  const [header, separator, ...rows] = lines.slice(headings[0], end === -1 ? lines.length : end).flatMap((line, i) => (line.trim().startsWith('|') ? [{ at: `line ${headings[0] + i + 1}`, cells: tableCells(line) }] : []));
  if (header === undefined) fail(`line ${headings[0]}: Defects table missing`);
  const [entry, location, symptom, test] = ['Entry', 'Location', 'Symptom', 'Failing test'].map((name) => (header.cells.includes(name) ? header.cells.indexOf(name) : fail(`${header.at}: Defects table has no ${name} column`)));
  if (separator === undefined || separator.cells.length !== header.cells.length || !separator.cells.every((cell) => /^:?-+:?$/.test(cell))) fail(`${(separator || header).at}: Defects table separator malformed`);
  const byEntry = new Map();
  for (const { at, cells } of rows) {
    if (cells.length !== header.cells.length) fail(`${at}: Defects row malformed: ${cells.join(' | ')}`);
    if (cells[entry] === 'impl-review' || /^\{\{.*\}\}$/.test(cells[entry])) continue;
    if (!/^\d+$/.test(cells[entry])) fail(`${at}: Defects row Entry must be an Entry log number or impl-review: ${cells.join(' | ')}`);
    const tuples = byEntry.get(Number(cells[entry])) || new Set();
    tuples.add(stable([cells[location].replace(/:\d+(?::\d+)?$/, ''), cells[symptom], cells[test]]));
    byEntry.set(Number(cells[entry]), tuples);
  }
  const [latestEntry, previousEntry] = [...byEntry.keys()].sort((a, b) => b - a);
  if (latestEntry === undefined) return { stalemate: false, digest: null };
  const [latest, previous] = [latestEntry, previousEntry].map((key) => [...(byEntry.get(key) || [])].sort());
  return { stalemate: previousEntry === latestEntry - 1 && stable(latest) === stable(previous), digest: fingerprint(latest) };
}

function readFileList(file) {
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

/** Where an iteration directory keeps its snapshot copy of a draft: the draft's path mirrored under `snapshot/`, an absolute path with its root dropped; a path climbing out with `..` fails, so a copy never lands outside the snapshot. */
function snapshotCopyPath(iterationDir, file) {
  const normalized = path.normalize(file);
  const relative = path.isAbsolute(normalized) ? path.relative(path.parse(normalized).root, normalized) : normalized;
  if (relative === '..' || relative.startsWith(`..${path.sep}`)) fail(`draft path must not climb out of its tree: ${file}`);
  return path.join(iterationDir, 'snapshot', relative);
}

/** Writes one design-review iteration's draft content hashes to `out`, copies each draft under the `snapshot/` directory beside it so the next iteration can diff against it, and returns the drafts whose hash differs from the `previous` iteration's snapshot; every draft when there is no previous snapshot, so a missing one widens scope rather than dropping a draft. */
function draftSnapshot(files, out, previous) {
  const hashes = Object.fromEntries(files.map((file) => [file, fingerprint(fs.readFileSync(file, 'utf8'))]));
  const before = previous !== undefined && fs.existsSync(previous) ? JSON.parse(fs.readFileSync(previous, 'utf8')) : {};
  files.forEach((file) => {
    const copy = snapshotCopyPath(path.dirname(out), file);
    fs.mkdirSync(path.dirname(copy), { recursive: true });
    fs.copyFileSync(file, copy);
  });
  fs.writeFileSync(out, JSON.stringify(hashes) + '\n', 'utf8');
  return files.filter((file) => before[file] !== hashes[file]);
}

/** Measures a file list against SURFACE_CAP_FILES, or against the user-approved override bound when one is recorded. */
function surfaceCheck(files, bound) {
  if (bound !== undefined && !(Number.isInteger(bound) && bound > 0)) fail('--bound must be a positive integer');
  const cap = bound === undefined ? SURFACE_CAP_FILES : bound;
  const count = new Set(files).size;
  return { files: count, cap, breach: count > cap };
}

/** Sums added plus deleted lines of `git diff --numstat -z -M` output over the listed paths, a rename counted at its destination; a binary file (`-`) and a pure rename (0 and 0) add nothing. */
function numstatLines(output, files) {
  const listed = new Set(stringArray(files, 'files'));
  const tokens = output.split('\0');
  let lines = 0;
  let at = 0;
  while (at < tokens.length - 1) {
    const entry = /^(-|\d+)\t(-|\d+)\t([\s\S]*)$/.exec(tokens[at]);
    if (!entry) fail(`numstat entry malformed: ${tokens[at]}`);
    const [, added, deleted, file] = entry;
    const isRename = file === '';
    if (added !== '-' && listed.has(isRename ? tokens[at + 2] : file)) lines += Number(added) + Number(deleted);
    at += isRename ? 3 : 1;
  }
  return lines;
}

/** Review waves a scope of `files` files and `lines` changed lines needs: one per WAVE_THRESHOLD_LINES begun, at least one, at most MAX_REVIEW_WAVES and never more than `files`, so every wave can hold a file. */
function reviewWaveCount(lines, files) {
  if (!Number.isInteger(lines) || lines < 0) fail('lines must be a non-negative integer');
  if (!Number.isInteger(files) || files < 0) fail('files must be a non-negative integer');
  return Math.min(MAX_REVIEW_WAVES, Math.max(1, files), Math.max(1, Math.ceil(lines / WAVE_THRESHOLD_LINES)));
}

/** Accepts a review-wave division only as exactly `count` file lists, disjoint and together equal to the scope, so every scope file is reviewed in exactly one wave; a list may be empty only when the scope is, as the one wave `[[]]`. */
function validateWaveDivision(division, scope, count) {
  if (!Array.isArray(division) || division.length !== count) fail(`division must hold exactly ${count} waves`);
  const inScope = new Set(scope);
  const placed = new Set();
  division.forEach((wave, index) => {
    if (stringArray(wave, `division wave ${index + 1}`).length === 0 && inScope.size > 0) fail(`division wave ${index + 1} is empty`);
    wave.forEach((file) => {
      if (placed.has(file)) fail(`division places a file twice: ${file}`);
      placed.add(file);
    });
  });
  const outside = [...placed].find((file) => !inScope.has(file));
  if (outside !== undefined) fail(`division file outside the scope: ${outside}`);
  const unplaced = [...inScope].find((file) => !placed.has(file));
  if (unplaced !== undefined) fail(`scope file in no wave: ${unplaced}`);
  return division;
}

/** Runs git without a shell, returning its stdout, or streaming it into an open file descriptor so a large patch never hits a buffer cap; `okStatuses` admits git's documented non-error exits, such as `--no-index` reporting a difference with 1. */
function runGit(args, outFd, okStatuses = [0]) {
  const result = spawnSync('git', args, { encoding: 'utf8', maxBuffer: Infinity, stdio: ['ignore', outFd === undefined ? 'pipe' : outFd, 'pipe'], windowsHide: true });
  if (result.error || !okStatuses.includes(result.status)) fail(`git ${args.join(' ')} failed: ${result.error ? result.error.message : result.stderr.trim()}`);
  return result.stdout;
}

function gitRef(value, name) {
  if (typeof value !== 'string' || !/^[^-\s]\S*$/.test(value)) fail(`${name} <sha> required`);
  return value;
}

/** Every rename in the range, destination to source; `pure` only when git reports the identical blob and mode on both sides, so the rename is behaviour-neutral by proof, never by assertion. */
function rangeRenames(base, head) {
  const tokens = runGit(['diff', '--raw', '-z', '-M', '--no-abbrev', `${base}...${head}`]).split('\0');
  const renames = new Map();
  let at = 0;
  while (at < tokens.length - 1) {
    const [srcMode, dstMode, srcBlob, dstBlob, status] = tokens[at].slice(1).split(' ');
    if (status.startsWith('R')) renames.set(tokens[at + 2], { source: tokens[at + 1], pure: srcBlob === dstBlob && srcMode === dstMode });
    at += /^[RC]/.test(status) ? 3 : 2;
  }
  return renames;
}

/** A patch pathspec for files one range diffs, each rename paired with its source so the patch shows a rename rather than an add. */
function patchPaths(files, renames) {
  return files.flatMap((file) => (renames.has(file) ? [renames.get(file).source, file] : [file]));
}

/** An impl-review manifest's commit ranges: `--base...--head` for the scope, and `--full-base...--head` for `--full-files`, whose entries join the list and take that wider range even when also in the scope. Null without `--base/--head`. */
function manifestRanges(flags) {
  const hasRange = flags.base !== undefined || flags.head !== undefined;
  const hasFull = flags['full-files'] !== undefined || flags['full-base'] !== undefined;
  if (hasRange && flags.phase !== 'impl-review') fail('--base/--head apply to impl-review only');
  if (hasFull && !hasRange) fail('--full-files/--full-base need --base/--head');
  if (!hasRange) return null;
  const head = gitRef(flags.head, '--head');
  const base = gitRef(flags.base, '--base');
  const scopeRange = { base, head, renames: rangeRenames(base, head) };
  if (!hasFull) return { scope: scopeRange, full: null, fullFiles: new Set() };
  if (typeof flags['full-files'] !== 'string') fail('--full-files <path> required with --full-base');
  const fullBase = gitRef(flags['full-base'], '--full-base');
  return { scope: scopeRange, full: { base: fullBase, head, renames: rangeRenames(fullBase, head) }, fullFiles: new Set(readFileList(flags['full-files'])) };
}

/** The range a listed file's patch hunks come from; a file on neither list, such as an appended test-plan path, takes the manifest range. */
function rangeOf(ranges, file) {
  return ranges.full !== null && ranges.fullFiles.has(file) ? ranges.full : ranges.scope;
}

/** Listed files each range renames with identical content and mode. */
function pureRenames(ranges, files) {
  if (ranges === null) return [];
  return files.filter((file) => {
    const rename = rangeOf(ranges, file).renames.get(file);
    return rename !== undefined && rename.pure;
  });
}

/** Git invocations writing one patch for `files`, each file's hunks over its own range. */
function rangePatchInvocations(ranges, files) {
  return [ranges.scope, ranges.full].filter((range) => range !== null).flatMap((range) => {
    const paths = patchPaths(files.filter((file) => rangeOf(ranges, file) === range), range.renames);
    return paths.length === 0 ? [] : [{ args: ['--literal-pathspecs', 'diff', '-M', '--no-color', '--no-ext-diff', '--no-textconv', `${range.base}...${range.head}`, '--', ...paths] }];
  });
}

/** Git invocations diffing each draft against its copy in the previous iteration's snapshot; a draft that snapshot lacks gets none. */
function snapshotPatchInvocations(previousDir, files) {
  return files.flatMap((file) => {
    const copy = snapshotCopyPath(previousDir, file);
    return fs.existsSync(copy) ? [{ args: ['diff', '--no-index', '--no-color', '--no-ext-diff', '--no-textconv', '--', copy, file], okStatuses: [0, 1] }] : [];
  });
}

/** Streams each git invocation's stdout, in order, into one freshly written file. */
function writeGitOutput(file, invocations) {
  const fd = fs.openSync(file, 'w');
  try {
    invocations.forEach((invocation) => runGit(invocation.args, fd, invocation.okStatuses));
  } finally {
    fs.closeSync(fd);
  }
}

/** Writes `<stem>.diff` for a manifest's file list and returns its path: over the commit ranges in impl-review, against the previous snapshot in design-review; null when there is nothing to diff against, as in design-review iteration 1. */
function writeManifestDiff(stem, files, ranges, snapshot) {
  if (ranges === null && snapshot === undefined) return null;
  const diff = `${stem}.diff`;
  writeGitOutput(diff, ranges !== null ? rangePatchInvocations(ranges, files) : snapshotPatchInvocations(snapshot, files));
  return diff;
}

function positiveInteger(value, name) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) fail(`${name} <n> must be a positive integer`);
  return Number(value);
}

/** Writes External Review's scope manifest and its diff: the same explicit list and precomputed change content an internal reviewer gets, with no rubric and no ledger. */
function emitExternalScope(flags, files, ranges) {
  const isImplReview = flags.phase === 'impl-review';
  if (isImplReview && ranges === null) fail('--base/--head required for impl-review External Review');
  if (isImplReview !== (flags.wave !== undefined)) fail('--wave <k> is required for impl-review and applies to it only');
  const stem = path.join(flags.out, EXTERNAL_REVIEWER);
  const scope = Object.assign(
    { phase: flags.phase, iteration: positiveInteger(flags.iteration, '--iteration') },
    isImplReview ? { wave: positiveInteger(flags.wave, '--wave') } : {},
    { files, diff: writeManifestDiff(stem, files, ranges, flags.snapshot) },
  );
  fs.writeFileSync(`${stem}.scope.json`, JSON.stringify(scope) + '\n', 'utf8');
  return scope.diff === null ? { scope: `${stem}.scope.json` } : { scope: `${stem}.scope.json`, diff: scope.diff };
}

/** Writes one internal reviewer's coverage manifest and its diff. */
function emitInternalManifest(flags, files, ranges) {
  if (flags.iteration !== undefined || flags.wave !== undefined) fail(`--iteration/--wave apply to --reviewer ${EXTERNAL_REVIEWER} only`);
  const customPaths = typeof flags['custom-rules'] === 'string' ? flags['custom-rules'].split(',') : [];
  const testPlan = typeof flags['test-plan'] === 'string' ? flags['test-plan'].split(',') : [];
  const reviewed = reviewerFiles(flags.phase, flags.reviewer, files, testPlan);
  const manifest = emitCoverageManifest({
    reviewer: flags.reviewer,
    phase: flags.phase,
    rubric: fs.readFileSync(path.join(__dirname, 'agents', `asd-reviewer-${flags.reviewer}.md`), 'utf8'),
    files: reviewed,
    customRules: Object.fromEntries(customPaths.map((file) => [file, fs.readFileSync(file, 'utf8')])),
    selfHosting: flags['self-hosting'] === true,
    templates: templateNames(path.join(__dirname, 'templates')),
    pureRenames: pureRenames(ranges, reviewed),
  });
  const stem = path.join(flags.out, flags.reviewer);
  fs.writeFileSync(`${stem}.manifest.json`, JSON.stringify(manifest) + '\n', 'utf8');
  const diff = writeManifestDiff(stem, manifest.files, ranges, flags.snapshot);
  return diff === null ? { manifest: `${stem}.manifest.json`, digest: manifest.digest } : { manifest: `${stem}.manifest.json`, digest: manifest.digest, diff };
}

function emitManifestCommand(flags) {
  if (!/^[a-z]+$/.test(flags.reviewer || '')) fail('--reviewer <name> required');
  if (typeof flags.files !== 'string' || typeof flags.out !== 'string') fail('--files <path> and --out <dir> required');
  if (!PHASES.includes(flags.phase)) fail('phase must be design-review or impl-review');
  if (flags.snapshot !== undefined && flags.phase !== 'design-review') fail('--snapshot applies to design-review only');
  const ranges = manifestRanges(flags);
  const scope = readFileList(flags.files);
  const files = ranges === null ? scope : [...new Set(scope.concat([...ranges.fullFiles]))];
  return flags.reviewer === EXTERNAL_REVIEWER ? emitExternalScope(flags, files, ranges) : emitInternalManifest(flags, files, ranges);
}

function reviewWavesCommand(flags) {
  if (typeof flags.files !== 'string') fail('--files <path> required');
  if ((flags.division === undefined) !== (flags.out === undefined)) fail('--division <json path> and --out <path> go together');
  const base = gitRef(flags.base, '--base');
  const head = gitRef(flags.head, '--head');
  const scope = readFileList(flags.files);
  const lines = numstatLines(runGit(['diff', '--numstat', '-z', '-M', `${base}...${head}`]), scope);
  const measured = { lines, threshold: WAVE_THRESHOLD_LINES, waves: reviewWaveCount(lines, new Set(scope).size) };
  if (flags.division === undefined) return measured;
  const waves = validateWaveDivision(JSON.parse(fs.readFileSync(flags.division, 'utf8')), scope, measured.waves);
  fs.mkdirSync(path.dirname(flags.out), { recursive: true });
  fs.writeFileSync(flags.out, JSON.stringify({ base, head, lines, threshold: WAVE_THRESHOLD_LINES, waves }) + '\n', 'utf8');
  return measured;
}

/** Wave `k`'s list from a `waves.json` division, each path a later commit renamed mapped to its destination at `head` (renames over the division's `head...head`), so a file renamed after the division is reviewed under its current path. */
function waveFiles(division, k, head) {
  if (!division || typeof division !== 'object' || !Array.isArray(division.waves)) fail('waves.json must hold a waves array');
  if (k > division.waves.length) fail(`--wave ${k} exceeds the ${division.waves.length} waves of the division`);
  const moved = new Map([...rangeRenames(gitRef(division.head, 'waves.json head'), head)].map(([destination, rename]) => [rename.source, destination]));
  return stringArray(division.waves[k - 1], `wave ${k}`).map((file) => moved.get(file) || file);
}

/** Writes a review wave's iteration-1 list: its current-path `waves.json` list unioned with the `--files` list, one path per line. */
function waveFilesCommand(flags) {
  if (typeof flags.waves !== 'string' || typeof flags.out !== 'string') fail('--waves <path> and --out <path> required');
  const listed = waveFiles(JSON.parse(fs.readFileSync(flags.waves, 'utf8')), positiveInteger(flags.wave, '--wave'), gitRef(flags.head, '--head'));
  const files = [...new Set(listed.concat(typeof flags.files === 'string' ? readFileList(flags.files) : []))];
  fs.writeFileSync(flags.out, files.map((file) => `${file}\n`).join(''), 'utf8');
  return { out: flags.out, files: files.length };
}

function parseFlagArgs(argv, booleanFlags) {
  const bools = booleanFlags || [];
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith('--')) fail('flags require values');
    const name = argv[i].slice(2);
    if (bools.includes(name)) { out[name] = true; continue; }
    if (argv[i + 1] === undefined) fail('flags require values');
    out[name] = argv[i + 1];
    i += 1;
  }
  return out;
}

function inputJson(flags) {
  if (typeof flags.input !== 'string') fail('--input <path|-> required');
  return JSON.parse(flags.input === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(flags.input, 'utf8'));
}

function main(argv) {
  const command = argv[2];
  const flags = parseFlagArgs(argv.slice(3), ['self-hosting']);
  if (command === 'manifest-digest') {
    process.stdout.write(coverageManifestDigest(JSON.parse(fs.readFileSync(flags.manifest, 'utf8'))) + '\n');
    return 0;
  }
  if (command === 'emit-manifest') {
    process.stdout.write(JSON.stringify(emitManifestCommand(flags)) + '\n');
    return 0;
  }
  if (command === 'validate-ledger') {
    const result = validateCoverageLedger(JSON.parse(fs.readFileSync(flags.manifest, 'utf8')), ledgerFromText(fs.readFileSync(flags.ledger, 'utf8')), JSON.parse(fs.readFileSync(flags.findings, 'utf8')));
    process.stdout.write(JSON.stringify(result) + '\n');
    return 0;
  }
  if (command === 'external-preflight') {
    const result = externalPreflight(inputJson(flags));
    process.stdout.write(JSON.stringify(result) + '\n');
    return result.status === 'local-ready' ? 0 : 1;
  }
  if (command === 'external-record-failure') {
    process.stdout.write(JSON.stringify(recordExternalFailure(inputJson(flags))) + '\n');
    return 0;
  }
  if (command === 'route-task') {
    process.stdout.write(JSON.stringify(routeTask(inputJson(flags))) + '\n');
    return 0;
  }
  if (command === 'defect-stalemate') {
    if (typeof flags.plan !== 'string') fail('--plan <path> required');
    process.stdout.write(JSON.stringify(defectStalemate(fs.readFileSync(flags.plan, 'utf8'))) + '\n');
    return 0;
  }
  if (command === 'surface-check') {
    if (typeof flags.files !== 'string') fail('--files <path> required');
    const result = surfaceCheck(readFileList(flags.files), flags.bound === undefined ? undefined : Number(flags.bound));
    process.stdout.write(JSON.stringify(result) + '\n');
    return result.breach ? 1 : 0;
  }
  if (command === 'draft-snapshot') {
    if (typeof flags.files !== 'string' || typeof flags.out !== 'string') fail('--files <path> and --out <path> required');
    process.stdout.write(draftSnapshot(readFileList(flags.files), flags.out, flags.previous).map((file) => `${file}\n`).join(''));
    return 0;
  }
  if (command === 'review-waves') {
    process.stdout.write(JSON.stringify(reviewWavesCommand(flags)) + '\n');
    return 0;
  }
  if (command === 'wave-files') {
    process.stdout.write(JSON.stringify(waveFilesCommand(flags)) + '\n');
    return 0;
  }
  fail('usage: emit-manifest, manifest-digest, validate-ledger, external-preflight, external-record-failure, route-task, defect-stalemate, surface-check, draft-snapshot, review-waves, or wave-files');
}

if (require.main === module) {
  try { process.exitCode = main(process.argv); } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 2; }
}

module.exports = { AUDIT_BATCH_THRESHOLD_FILES, EXTERNAL_REVIEWER, INTERNAL_REVIEWERS, LEDGER_NA_SHAPE, LEDGER_ROW_EXAMPLE, LEDGER_VOCABULARY, MAX_REVIEW_WAVES, NA_PREDICATES, SURFACE_CAP_FILES, WAVE_THRESHOLD_LINES, buildInvocation, coverageManifestDigest, defectStalemate, draftSnapshot, emitCoverageManifest, externalPreflight, isTest, numstatLines, recordExternalFailure, reviewWaveCount, reviewerFiles, routeTask, surfaceCheck, validateCoverageLedger, validateWaveDivision, waveFiles, fingerprint };
