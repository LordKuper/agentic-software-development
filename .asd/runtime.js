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

/** Checks executable and authentication locally without making a model request. */
function externalPreflight(input) {
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
  const flags = parseFlagArgs(argv.slice(3), ['write']);
  if (command === 'manifest-digest') {
    const onDisk = JSON.parse(fs.readFileSync(flags.manifest, 'utf8'));
    const manifest = flags.write ? Object.assign({}, onDisk, { vocabulary: LEDGER_VOCABULARY, row_example: LEDGER_ROW_EXAMPLE }) : onDisk;
    const digest = coverageManifestDigest(manifest);
    if (flags.write) fs.writeFileSync(flags.manifest, JSON.stringify(Object.assign({}, manifest, { digest })) + '\n', 'utf8');
    process.stdout.write(digest + '\n');
    return 0;
  }
  if (command === 'validate-ledger') {
    const result = validateCoverageLedger(JSON.parse(fs.readFileSync(flags.manifest, 'utf8')), JSON.parse(fs.readFileSync(flags.ledger, 'utf8')), JSON.parse(fs.readFileSync(flags.findings, 'utf8')));
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
  fail('usage: manifest-digest, validate-ledger, external-preflight, external-record-failure, or route-task');
}

if (require.main === module) {
  try { process.exitCode = main(process.argv); } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 2; }
}

module.exports = { LEDGER_ROW_EXAMPLE, LEDGER_VOCABULARY, buildInvocation, coverageManifestDigest, externalPreflight, recordExternalFailure, routeTask, validateCoverageLedger, fingerprint };
