'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { setTimeout: delay } = require('timers/promises');

const CACHE_SCHEMA = 1;
const PROBE_TIMEOUT_MS = 3000;
const MAX_NEGATIVE_TTL_MS = 3600000;
/** The longest a tool call may run before its silent transcript counts as a stall: the host's maximum command timeout. */
const TOOL_CALL_CEILING_MS = 600000;
const ESCALATED_CHANGE_RISKS = ['migration', 'broad reasoning', 'cross domain'];
const RESERVED_CHANGE_RISKS = ['security', 'authentication', 'public contract', 'workflow gate', ...ESCALATED_CHANGE_RISKS];
/** The single review-ledger row vocabulary: allowed statuses per row type, plus the one status carrying `p` and the one carrying `f`. Emitted into every manifest and enforced on every ledger from here, so published and enforced vocabulary cannot drift. */
const LEDGER_VOCABULARY = { files: ['checked', 'n/a'], rules: ['pass', 'n/a', 'finding'], sections: ['reviewed', 'n/a'], p: 'n/a', f: 'finding' };
/** One filled ledger row, published beside the vocabulary so a reviewer reads the row shape off its own input too. Its status is taken from the vocabulary constant and paired with the key that status requires, so the example cannot teach a row the validator rejects. */
const LEDGER_ROW_EXAMPLE = { i: '<manifest id>', s: LEDGER_VOCABULARY.p, p: '<allowed n/a predicate>' };
const ROW_TYPES = Object.keys(LEDGER_VOCABULARY).filter((key) => Array.isArray(LEDGER_VOCABULARY[key]));
/** The `n_a` shape: row type, then manifest id, then its allowed predicate list. Published beside the vocabulary under its own key, because `n_a` itself carries per-dispatch content. */
const LEDGER_NA_SHAPE = Object.fromEntries(ROW_TYPES.map((type) => [type, { [LEDGER_ROW_EXAMPLE.i]: [LEDGER_ROW_EXAMPLE.p] }]));
/** Changed lines (added plus deleted) one impl-review wave carries; a larger scope divides into more waves, so no review turn holds an oversized diff. */
const WAVE_THRESHOLD_LINES = 3000;
/** Most review waves one scope divides into, so an oversized scope still ends in a bounded number of sequential reviews. */
const MAX_REVIEW_WAVES = 3;
/** Files one impl-review wave carries, so a many-file scope divides into waves even when its diff is small. */
const WAVE_THRESHOLD_FILES = 34;
/** Diff bytes one impl-review wave carries; a larger scope divides into more waves, so no review turn reads an oversized patch. */
const WAVE_THRESHOLD_BYTES = 180000;
/** Files above which one review wave gets a turn plan in its reviewer payload. */
const LARGE_WAVE_FILES = 12;
/** An audit whose touched areas track more than this many files gets a batched-read plan, which the orchestrator follows while auditing. */
const AUDIT_BATCH_THRESHOLD_FILES = 200;
/** Internal reviewers, named as `emit-manifest --reviewer` takes them. */
const INTERNAL_REVIEWERS = ['quality', 'efficiency', 'combined'];
/** The `emit-manifest --reviewer` name that emits External Review's scope manifest instead of a coverage manifest. */
const EXTERNAL_REVIEWER = 'external';
/** The single-pass internal reviewer: its manifest composes these reviewers' rubrics by reference, in order, then its own agent's rubric. */
const COMBINED_REVIEWER = 'combined';
const COMBINED_RUBRICS = ['quality', 'efficiency'];
/** Sprint workflow definitions, one `<name>.json` each, beside the phase orchestration bodies. */
const WORKFLOWS_DIR = path.join(__dirname, 'workflows');
/** The exact key set of a workflow definition; its semantics stay prose in the rule docs. */
const WORKFLOW_KEYS = ['name', 'next', 'phases', 'reviewers', 'rollback_reset'];
/** Review nodes a definition's `reviewers` and `rollback_reset` are keyed by, as `persist-review --phase` takes them. */
const REVIEW_NODES = ['design', 'impl'];
/** `NEXT:` targets that end the chain instead of naming a phase: `pr` merge mode's blocked and merged exits; `done` names completion, the closure write follows at the next sprint's start. */
const CHAIN_EXITS = ['await-merge', 'done'];
/** Severities a finding row may carry (`review-policy.md` "Severity levels"). */
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const FINDINGS_COLUMNS = ['#', 'Severity', 'Location', 'Description', 'Suggested fix'];
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
  noDocs: 'no documentation file in scope',
};
/** Rubric entries each conditional predicate covers, by reviewer and id prefix, a combined manifest taking those of every rubric it composes; a prefix matching no entry fails the emit closed; `docs`, the documentation entries, is granted to a combined manifest only. */
const NA_TARGETS = {
  ui: { quality: ['UI conformance'] },
  perf: { efficiency: ['Perf budget compliance', 'Perf anti-patterns', 'Algorithmic complexity', 'Regression detection', 'Hot path identification'] },
  budgetCompliance: { efficiency: ['Perf budget compliance'] },
  html: { quality: ['HTML shell wrapping', 'Provenance', 'Traceability'] },
  selfHosting: { quality: ['Framework mode'] },
  templated: { quality: ['Template adherence'] },
  docs: { quality: ['SSoT', 'Template adherence', 'HTML shell wrapping', 'Provenance', 'Traceability', 'Persistent actuality', 'In-code doc comments', 'Stub resolution', 'Framework mode', 'Custom rules consistency'], efficiency: ['Documentation economy'] },
};
const PHASES = ['design-review', 'impl-review'];
/** The phases whose mutual transitions never rotate the decisions log: the log is read live across the whole cycle. */
const IMPL_CYCLE = ['impl', 'impl-test', 'impl-review'];
/** A decisions-log entry line, heading or one-line form; the template's example lines carry placeholders, never digits. */
const DECISION_ENTRY = /^(## |- )\d{4}-\d{2}-\d{2} /m;
/** A retro row's acting side; like its row id, an English literal under any docs language, so intake can filter on it. */
const ACTS_ON = ['consumer', 'asd'];
/** The retro tables intake reads: row-id prefix and cell positions, fixed by the retrospective template because translated headers cannot locate them. Actions may be absent (empty friction log); systemic proposals never are. */
const RETRO_TABLES = [
  { section: 'actions', prefix: 'A', cells: 4, guardrail: 1, actsOn: 2, home: 3, required: false },
  { section: 'systemic-proposals', prefix: 'P', cells: 4, guardrail: 0, actsOn: 1, home: 2, required: true },
];
/** The retro backlog's one table header. */
const BACKLOG_HEADER = ['Row', 'Acts on', 'Disposition', 'Decided in', 'Guardrail'];
/** Retro backlog dispositions; `closed` is a row verified already resolved at HEAD. */
const BACKLOG_DISPOSITIONS = ['deferred', 'included', 'rejected', 'closed'];
/** The agent-memory tree as a git top-relative pathspec, so a check run from any directory scans the same files. */
const AGENT_MEMORY_PATHSPEC = ':/.claude/agent-memory';
/** Concrete work-history ordinals agent memory must not record: a sprint id, a Task, wave or iteration number, or a recorded review verdict. A placeholder such as `iter-NN` or `Task <N>` carries no digits and passes; a bare verdict word is not scanned. */
const MEMORY_HISTORY_PATTERNS = [
  /\b\d{3}-[a-z][a-z0-9]*(-[a-z0-9]+)+\b/i,
  /\bsprint[ -]?\d+\b/i,
  /\bTask \d+\b/,
  /\bwave[- ]\d+\b/i,
  /\biter-\d+\b/i,
  /\biteration \d+\b/i,
  /\[REVIEW-(design|impl)-[a-z]+\]: *(APPROVE|CONCERNS|FAIL)/,
];
/** A sprint's timing ledger file name, the one each archived sprint is scanned for. */
const TIMING_LEDGER = 'timing.jsonl';
/** Operation kinds a timing ledger records. */
const TIMING_KINDS = ['phase', 'dispatch', 'review-iteration', 'suite', 'external-review', 'user-wait'];
/** Kinds timing a single machine operation, the only ones the slow set ranks; user waits are never slow. */
const LEAF_MACHINE_KINDS = ['dispatch', 'suite', 'external-review'];
/** Close outcomes; `continued` closes an operation a recovery had closed as `interrupted` and the orchestrator carried on. */
const TIMING_OUTCOMES = ['done', 'interrupted', 'continued'];
/** Longest leaf machine operations the timing summary always lists as slow. */
const SLOW_TOP_N = 5;
/** Minutes past which a leaf machine operation is slow, and a phase stretch covered by no operation is idle. */
const SLOW_MINUTES = 30;
/** Longest commit header, `<type>(<scope>): <subject>` whole, in characters. */
const COMMIT_HEADER_MAX = 50;

/** How long a PR may report no check before it counts as having none. */
const CHECKS_GRACE_MS = 60000;
/** How long checks may stay pending before the wait gives up. */
const CHECKS_LIMIT_MS = 1800000;
/** Gap between two check reads. */
const CHECKS_POLL_MS = 10000;
/** Ceiling for one `gh pr checks` call. */
const CHECKS_READ_TIMEOUT_MS = 60000;
/** `gh` check buckets that fail a PR. */
const CHECK_FAIL_BUCKETS = ['fail', 'cancel'];

/** The `providers.md` section holding the role grant table `context` reads. */
const CONTEXT_SECTION = 'Role-scoped context';

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
  if (entry.target === 'artifact' && RESERVED_CHANGE_RISKS.includes(normalizedRiskName(entry.name))) fail(`reserved risk class is change by definition: ${entry.name}`);
  return { name: entry.name, target: entry.target };
}

function riskArray(value, name) {
  if (!Array.isArray(value)) fail(`${name} must be an array of risks`);
  return value.map(riskEntry);
}

/** Reads and shape-validates one workflow definition, `.asd/workflows/<name>.json`; an unknown name or a malformed file throws. */
function loadWorkflow(name) {
  if (typeof name !== 'string' || !/^[a-z]+$/.test(name)) fail(`workflow name invalid: ${name}`);
  const file = path.join(WORKFLOWS_DIR, `${name}.json`);
  if (!fs.existsSync(file)) fail(`unknown workflow: ${name}`);
  const malformed = (what) => fail(`${file} malformed: ${what}`);
  let definition;
  try {
    definition = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    malformed(error.message);
  }
  const isMap = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  const distinct = (value, what, allowed, empty) => {
    if (!Array.isArray(value) || (!empty && value.length === 0) || new Set(value).size !== value.length || value.some((item) => typeof item !== 'string' || !allowed(item))) malformed(`${what} must be a list of distinct valid names`);
  };
  const keyed = (value, what, keys) => {
    if (!isMap(value) || stable(Object.keys(value).sort()) !== stable(keys.slice().sort())) malformed(`${what} keys must be exactly ${keys.join(', ')}`);
  };
  keyed(definition, 'definition', WORKFLOW_KEYS);
  if (definition.name !== name) malformed(`name must be ${name}`);
  const { phases } = definition;
  distinct(phases, 'phases', (phase) => /^[a-z]+(-[a-z]+)*$/.test(phase), false);
  keyed(definition.next, 'next', phases);
  phases.forEach((phase) => distinct(definition.next[phase], `next.${phase}`, (target) => phases.includes(target) || CHAIN_EXITS.includes(target), false));
  keyed(definition.reviewers, 'reviewers', REVIEW_NODES);
  keyed(definition.rollback_reset, 'rollback_reset', REVIEW_NODES);
  REVIEW_NODES.forEach((node) => {
    distinct(definition.reviewers[node], `reviewers.${node}`, (key) => /^[a-z]+$/.test(key), true);
    distinct(definition.rollback_reset[node], `rollback_reset.${node}`, (phase) => phases.includes(phase), true);
  });
  return definition;
}

/** The reviewer keys one review node accepts: the union of every definition's `reviewers[node]`. */
function reviewerKeys(node) {
  const names = fs.readdirSync(WORKFLOWS_DIR).filter((file) => file.endsWith('.json')).map((file) => file.slice(0, -'.json'.length));
  return [...new Set(names.flatMap((name) => loadWorkflow(name).reviewers[node]))];
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

/** Stores one sanitized external-model failure for later retry control: retry-after is the provider-reported reset, capped at one hour, and one hour when none was reported, so a quota never reads as reset minutes after it hit. */
function recordExternalFailure(input) {
  if (!input || !/^[a-f0-9]{64}$/.test(input.fingerprint || '')) fail('valid fingerprint required');
  if (!['authentication', 'quota', 'reachability', 'command'].includes(input.status)) fail('unsupported external failure status');
  const now = Number.isFinite(input.now) ? input.now : Date.now();
  const cap = now + MAX_NEGATIVE_TTL_MS;
  const reported = input.retryAfter === undefined || input.retryAfter === null ? cap : input.retryAfter;
  if (!Number.isFinite(reported) || reported <= now) fail('retryAfter outside bounded future');
  const retryAfter = Math.min(reported, cap);
  const cache = readCache(input.cachePath, now);
  cache.entries[input.fingerprint] = { status: input.status, retry_after: retryAfter };
  writeCache(input.cachePath, cache);
  return cache.entries[input.fingerprint];
}

function normalizedRiskName(name) {
  return name.toLowerCase().replace(/[\s_-]+/g, ' ').trim();
}

/** Selects a task class without allowing a task to move to a weaker class. A change risk forbids `mechanical`, and migration, broad reasoning and cross-domain risks select `escalated`. A failed objective check after its correction attempt first keeps the tier and asks for one effort level higher (`raiseEffort`); once `effortRaised`, it moves one tier up. A legacy `critical` prior tier reads `standard`. */
function routeTask(input) {
  if (!input || typeof input !== 'object') fail('routing input required');
  if (!['command', 'mechanical', 'standard'].includes(input.kind)) fail('routing kind invalid');
  if (typeof input.objectiveInputs !== 'boolean' || typeof input.failedObjectiveCheck !== 'boolean') fail('routing evidence incomplete');
  if (input.effortRaised !== undefined && typeof input.effortRaised !== 'boolean') fail('effortRaised invalid');
  const risks = riskArray(input.risks, 'risks');
  const checks = stringArray(input.checks, 'checks');
  if (!Number.isInteger(input.correctionAttempts) || input.correctionAttempts < 0) fail('correctionAttempts invalid');
  const tiers = ['mechanical', 'standard', 'escalated'];
  const priorTier = input.priorTier === 'critical' ? 'standard' : input.priorTier;
  if (priorTier !== undefined && !tiers.includes(priorTier)) fail('priorTier invalid');
  const changeRisks = risks.filter((risk) => risk.target === 'change');
  const escalatingRisk = changeRisks.find((risk) => ESCALATED_CHANGE_RISKS.includes(normalizedRiskName(risk.name)));
  const changeRisk = escalatingRisk || changeRisks[0];
  const artifactRisk = risks.find((risk) => risk.target === 'artifact');
  const deterministicCommand = input.kind === 'command' && input.objectiveInputs === true && checks.includes('deterministic-state');
  const mechanical = input.kind === 'mechanical' && input.objectiveInputs === true && checks.includes('deterministic-check') && checks.includes('exhaustive-match-validation');
  const failed = input.failedObjectiveCheck && input.correctionAttempts >= 1;
  const computedRank = escalatingRisk ? 2 : !changeRisk && (deterministicCommand || mechanical) ? 0 : 1;
  const priorRank = priorTier === undefined ? 0 : tiers.indexOf(priorTier);
  const clamped = priorRank > computedRank;
  const baseRank = Math.max(computedRank, priorRank);
  const raiseEffort = failed && input.effortRaised !== true;
  const tier = tiers[failed && !raiseEffort ? Math.min(baseRank + 1, 2) : baseRank];
  const execution = deterministicCommand && tier === 'mechanical' && risks.length === 0 && !failed ? 'command' : 'agent';
  const reason = raiseEffort ? 'effort-step' : changeRisk ? `risk:${changeRisk.name}` : failed ? 'failed-objective-check' : clamped ? 'no-downgrade' : artifactRisk ? `artifact-risk:${artifactRisk.name}` : execution === 'command' ? 'deterministic-command' : tier === 'mechanical' ? 'objective-mechanical' : 'normal';
  return { tier, execution, reason, raiseEffort };
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

/** Returns the required manifest digest for a review coverage ledger: the manifest exactly as written, minus `digest` and the `ledger` skeleton, which carries the digest and so cannot be inside it. A manifest missing a published constant keeps the identity it was stamped with, so one written before that field existed still validates; a divergent one is digested as written and rejected on validation. */
function coverageManifestDigest(manifest) {
  if (!manifest || typeof manifest !== 'object') fail('manifest required');
  const copy = Object.assign({}, manifest);
  delete copy.digest;
  delete copy.ledger;
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

/** Stamps every published constant into an emitted manifest, sets its digest, and adds the ledger skeleton the reviewer completes: the digest pre-filled, no findings, one row per manifest id with its status left to fill. */
function stampManifest(manifest) {
  const stamped = Object.assign({}, manifest, { vocabulary: LEDGER_VOCABULARY, row_example: LEDGER_ROW_EXAMPLE, n_a_shape: LEDGER_NA_SHAPE });
  const digest = coverageManifestDigest(stamped);
  const rows = (ids) => ids.map((id) => ({ i: id }));
  return Object.assign(stamped, { digest, ledger: { manifest_digest: digest, findings: [], files: rows(stamped.files), rules: rows(stamped.rules), sections: rows(stamped.sections) } });
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

/** A UI surface: `.html`/`.htm` outside `.asd/` or under `.asd/templates/`, a stylesheet, component-framework or Unity UI Toolkit file, or any file under a `ui`/`components`/`views`/`pages` path segment, matched case-insensitively. */
function isUiSurface(file) {
  const lower = file.toLowerCase();
  if (/\.html?$/.test(lower)) return !lower.startsWith('.asd/') || lower.startsWith('.asd/templates/');
  return /\.(css|scss|less|jsx|tsx|vue|svelte|uxml|uss|tss)$/i.test(file) || /(^|\/)(ui|components|views|pages)\//i.test(file);
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

/** A documentation file: prose (Markdown, reStructuredText, AsciiDoc, plain text) or a templated artefact, whatever its extension. */
function isDocumentation(file, templates) {
  return /\.(md|mdx|markdown|rst|adoc|txt)$/i.test(file) || isTemplated(file, templates);
}

/** Maps every rule id to the standing n/a predicates its condition authorizes for this dispatch; `parts` maps each reviewer whose rubric the manifest holds to its rule ids. */
function standingPredicates(input, parts, ids, customRules, templates) {
  const rubrics = Object.keys(parts);
  const granted = new Map(ids.map((id) => [id, []]));
  const targets = (key) => rubrics.flatMap((name) => NA_TARGETS[key][name] || []).map((prefix) => ids.find((id) => id.startsWith(prefix)) || fail(`rubric entry missing for n/a predicate: ${prefix}`));
  const grant = (key, predicate) => targets(key).forEach((id) => granted.get(id).push(predicate));
  const otherPhase = PHASES.find((phase) => phase !== input.phase);
  const hasBudgets = Object.entries(customRules).some(([file, text]) => file.endsWith('custom-coding-rules.md') && /^#+ [^\n]*perf[^\n]*budget/im.test(text));
  Object.keys(NA_TARGETS).forEach(targets);
  ids.filter((id) => id.includes(otherPhase) && !id.includes(input.phase)).forEach((id) => granted.get(id).push(NA_PREDICATES.phaseGate));
  if (!input.files.some((file) => /\.html?$/i.test(file))) grant('html', NA_PREDICATES.noHtml);
  if (input.selfHosting !== true) grant('selfHosting', NA_PREDICATES.noSelfHosting);
  if (!input.files.some((file) => isTemplated(file, templates))) grant('templated', NA_PREDICATES.noTemplated);
  if (rubrics.includes(COMBINED_REVIEWER) && !(input.scopeFiles || input.files).some((file) => isDocumentation(file, templates))) grant('docs', NA_PREDICATES.noDocs);
  if (input.phase === 'design-review') {
    if (!input.files.some((file) => /(^|\/)(ux-spec\.html|design-md-delta\.yaml)$|(^|\/)design\/mockups\//.test(file))) grant('ui', NA_PREDICATES.phaseGate);
    return granted;
  }
  if (!input.files.some(isUiSurface)) grant('ui', NA_PREDICATES.uiSurface);
  if (!hasBudgets && !input.files.some(isExecutable)) grant('perf', NA_PREDICATES.perf);
  if (!hasBudgets) grant('budgetCompliance', NA_PREDICATES.noBudgets);
  return granted;
}

/** Emits one reviewer's stamped coverage manifest over its whole file list; `scopeFiles` (default `files`) is the diff scope the docs predicate judges, so appended test-plan paths never void it; `rubric` is its agent markdown, or a combined reviewer's `{reviewer: markdown}` map whose rubrics compose in order. */
function emitCoverageManifest(input) {
  if (!input || typeof input !== 'object') fail('emit input required');
  if (!PHASES.includes(input.phase)) fail('phase must be design-review or impl-review');
  const files = stringArray(input.files, 'files');
  const customRules = input.customRules || {};
  const composed = input.rubric !== null && typeof input.rubric === 'object' ? input.rubric : { [input.reviewer]: input.rubric };
  const rubrics = Object.values(composed).map(rubricIds);
  const rubric = { rules: rubrics.flatMap((part) => part.rules), sections: rubrics.flatMap((part) => part.sections) };
  const rules = rubric.rules.concat(Object.keys(customRules));
  if (new Set(rules).size !== rules.length) fail('rubric and custom-rule ids must be distinct');
  const templates = input.templates === undefined ? [] : stringArray(input.templates, 'templates');
  const granted = standingPredicates(input, Object.fromEntries(Object.keys(composed).map((name, i) => [name, rubrics[i].rules])), rules, customRules, templates);
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

/** A test file: under a `test`/`tests`/`__tests__`/`spec`/`specs` path segment or a dotted one carrying it (`Core.Tests/`, `Game.Tests.Unit/`), or a basename in a common test naming convention. Heuristic: a miss only sends a minor test-only finding through review-fix instead of the in-place test fix. */
function isTest(file) {
  return /(^|\/)([^/]*\.)?(test|tests|__tests__|spec|specs)(\.[^/]*)?\//i.test(file) || /\.(test|spec)\.|^test_|_test\.|Tests?\./.test(file.split('/').pop());
}

/** One reviewer's file list, the single selector every manifest is built from: every reviewer gets the whole scope, impl-review Quality and Combined plus the explicitly passed test-plan paths, which the scope pathspec excludes. */
function reviewerFiles(phase, reviewer, files, testPlan) {
  if (phase !== 'impl-review' || (reviewer !== 'quality' && reviewer !== COMBINED_REVIEWER)) return files;
  return [...new Set(files.concat(testPlan))];
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
  return line.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, '|').replace(/^`([^`]*)`$/, '$1'));
}

/** A review's findings as `{id, severity, location}`, read by column position from its first table: `t_review.md`'s Findings or the external report's Kept findings, whose header must have `FINDINGS_COLUMNS.length` columns led by `#`, so an extra column is never read as another. Headings follow the docs language, so the check is the column count and the `#` id column, not the heading text (a reordered translated header is not detectable). An empty table is header and separator only; a `—` id row is skipped as legacy tolerance. */
function reviewFindings(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const start = lines.findIndex((line) => line.startsWith('|'));
  if (start === -1) fail('review has no findings table');
  const end = lines.findIndex((line, i) => i > start && !line.startsWith('|'));
  const [header, separator, ...rows] = lines.slice(start, end === -1 ? lines.length : end).map(tableCells);
  if (header.length !== FINDINGS_COLUMNS.length || header[0] !== '#') fail(`findings table must have ${FINDINGS_COLUMNS.length} columns led by #, as ${FINDINGS_COLUMNS.join(' | ')} in the template layout: ${header.join(' | ')}`);
  if (separator === undefined || separator.length !== header.length || !separator.every((cell) => /^:?-+:?$/.test(cell))) fail('findings table separator malformed');
  const seen = new Set();
  return rows.filter((cells) => cells[0] !== '—').map((cells) => {
    const [id, severity, location] = cells;
    if (cells.length !== header.length || id === '' || seen.has(id)) fail(`findings row malformed or id repeated: ${cells.join(' | ')}`);
    if (!SEVERITIES.includes(severity)) fail(`finding ${id} severity must be one of ${SEVERITIES.join(', ')}: ${severity}`);
    seen.add(id);
    return { id, severity, location };
  });
}

/** Drops the findings-table rows below `floor` from a validated review body, appends `dropped: <n>`, and rewrites a CONCERNS verdict to its kept count, or to APPROVE when no row is kept. */
function applyFloor(body, floor) {
  const rank = SEVERITIES.indexOf(floor);
  const lines = body.split('\n');
  const start = lines.findIndex((line) => line.trim().startsWith('|'));
  const end = lines.findIndex((line, i) => i > start && !line.trim().startsWith('|'));
  const tableEnd = end === -1 ? lines.length : end;
  const isBelow = (line) => tableCells(line)[0] !== '—' && SEVERITIES.indexOf(tableCells(line)[1]) < rank;
  const kept = lines.filter((line, i) => i < start + 2 || i >= tableEnd || !isBelow(line));
  const dropped = lines.length - kept.length;
  const keptRows = tableEnd - start - 2 - dropped;
  const verdict = /^\[REVIEW-\w+-\w+\]: CONCERNS$/.test(kept[0].trimEnd()) && keptRows === 0 ? kept[0].replace('CONCERNS', 'APPROVE') : kept[0];
  const text = [verdict, ...kept.slice(1)].map((line) => (/^CONCERNS: \d+\s*$/.test(line) ? (keptRows === 0 ? 'APPROVE' : `CONCERNS: ${keptRows}`) : line)).join('\n');
  return { text: `${text.trimEnd()}\ndropped: ${dropped}\n`, dropped, keptRows };
}

/** Validates one reviewer's returned text and persists it, from its verdict token on, as `<reviewer>.md` (`<reviewer>.late.md` for a late return) plus `<stem>.findings.json`; an internal reviewer's ledger must first validate against its manifest (default `<outDir>/<reviewer>.manifest.json`). `floor` (External Review only) drops below-floor rows and records the count (`applyFloor`). A written review is never overwritten, so the orchestrator's later appends survive. */
function persistReview(input) {
  const { phase, reviewer, text, outDir } = input;
  if (!REVIEW_NODES.includes(phase)) fail(`--phase must be ${REVIEW_NODES.join(' or ')}`);
  const keys = reviewerKeys(phase);
  if (!keys.includes(reviewer)) fail(`--reviewer must be one of ${keys.join(', ')}`);
  if (typeof text !== 'string' || typeof outDir !== 'string') fail('review text and output dir required');
  if (input.floor !== undefined && (reviewer !== EXTERNAL_REVIEWER || !SEVERITIES.includes(input.floor))) fail(`--floor <${SEVERITIES.join('|')}> applies to ${EXTERNAL_REVIEWER} only`);
  const start = /^[ \t]*\[REVIEW-/m.exec(text);
  if (start === null) fail('returned text carries no verdict token: an interrupted dispatch, not a verdict');
  const body = text.slice(start.index).trimStart();
  const skip = reviewer === EXTERNAL_REVIEWER ? '|APPROVE \\(skipped: .+\\)' : '';
  const token = new RegExp(`^\\[REVIEW-${phase}-${reviewer}\\]: (APPROVE|CONCERNS|FAIL${skip})$`).exec(body.split(/\r?\n/, 1)[0].trimEnd());
  if (token === null) fail(`first line must be [REVIEW-${phase}-${reviewer}]: APPROVE|CONCERNS|FAIL`);
  const verdict = token[1];
  const findings = verdict.startsWith('APPROVE (') ? [] : reviewFindings(body);
  if (!verdict.startsWith('APPROVE') && findings.length === 0) fail(`${verdict} verdict lists no finding`);
  if (verdict === 'APPROVE' && findings.length > 0) fail('APPROVE verdict lists findings');
  if (INTERNAL_REVIEWERS.includes(reviewer)) {
    const manifest = JSON.parse(fs.readFileSync(input.manifest || path.join(outDir, `${reviewer}.manifest.json`), 'utf8'));
    validateCoverageLedger(manifest, ledgerFromText(body), findings.map((finding) => finding.id));
  }
  const stem = path.join(outDir, input.late ? `${reviewer}.late` : reviewer);
  if (fs.existsSync(`${stem}.md`)) fail(`${stem}.md already persisted`);
  if (input.floor === undefined || verdict.startsWith('APPROVE (')) {
    fs.writeFileSync(`${stem}.findings.json`, JSON.stringify(findings) + '\n', 'utf8');
    fs.writeFileSync(`${stem}.md`, body.endsWith('\n') ? body : `${body}\n`, 'utf8');
    return { token: verdict, findings };
  }
  const floored = applyFloor(body, input.floor);
  const flooredFindings = findings.filter((finding) => SEVERITIES.indexOf(finding.severity) >= SEVERITIES.indexOf(input.floor));
  const flooredVerdict = verdict === 'CONCERNS' && floored.keptRows === 0 ? 'APPROVE' : verdict;
  fs.writeFileSync(`${stem}.findings.json`, JSON.stringify(flooredFindings) + '\n', 'utf8');
  fs.writeFileSync(`${stem}.md`, floored.text, 'utf8');
  return { token: flooredVerdict, findings: flooredFindings, dropped: floored.dropped };
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

function htmlText(fragment) {
  return fragment.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

function retroRow(table, attributes, content, ordinal) {
  const id = `${table.prefix}-${ordinal}`;
  const declared = /(?:^|\s)id="([^"]*)"/.exec(attributes);
  if (declared !== null && declared[1] !== id) fail(`${table.section} row ${ordinal} declares id ${declared[1]}, expected ${id}`);
  const cells = [...content.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map((cell) => cell[1]);
  if (cells.length !== table.cells) fail(`${table.section} row ${id} has ${cells.length} cells, expected ${table.cells}`);
  const actsOn = htmlText(cells[table.actsOn]);
  if (!ACTS_ON.includes(actsOn)) fail(`${table.section} row ${id} Acts on must be ${ACTS_ON.join(' or ')}: ${actsOn}`);
  return { id, acts_on: actsOn, guardrail: htmlText(cells[table.guardrail].replace(/<\/?code>/g, '`')), home: htmlText(cells[table.home]) };
}

/** Parses a retrospective's Action and Systemic-proposal rows: each id is `A-N`/`P-N` from its 1-based `<tbody>` ordinal, `covered by:` rows counted, so a retro with or without `<tr id>` yields the same ids; a declared id disagreeing with its ordinal fails. */
function retroRows(html) {
  if (typeof html !== 'string') fail('retrospective html required');
  return RETRO_TABLES.flatMap((table) => {
    const section = new RegExp(`<section id="${table.section}"[^>]*>([\\s\\S]*?)</section>`).exec(html);
    if (section === null) return table.required ? fail(`retrospective has no ${table.section} section`) : [];
    const body = /<tbody\b[^>]*>([\s\S]*?)<\/tbody>/.exec(section[1]);
    if (body === null) fail(`retrospective ${table.section} table has no tbody`);
    return [...body[1].matchAll(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/g)].map((row, index) => retroRow(table, row[1], row[2], index + 1));
  });
}

/** Parses the retro backlog's one table, one row per `<NNN-slug>#A-N`/`#P-N` address; an unknown disposition, acting side or repeated address fails. */
function backlogRows(markdown) {
  if (typeof markdown !== 'string') fail('retro backlog markdown required');
  const lines = markdown.replace(/\r\n/g, '\n').split('\n').map((line) => line.trim());
  const headers = lines.flatMap((line, i) => (line.startsWith('|') && stable(tableCells(line)) === stable(BACKLOG_HEADER) ? [i] : []));
  if (headers.length !== 1) fail(`retro backlog must hold exactly one | ${BACKLOG_HEADER.join(' | ')} | table, found ${headers.length}`);
  const after = lines.slice(headers[0] + 1);
  const end = after.findIndex((line) => !line.startsWith('|'));
  const [separator, ...rows] = after.slice(0, end === -1 ? after.length : end).map(tableCells);
  if (separator === undefined || separator.length !== BACKLOG_HEADER.length || !separator.every((cell) => /^:?-+:?$/.test(cell))) fail('retro backlog table separator malformed');
  const seen = new Set();
  return rows.map((cells) => {
    const [row, actsOn, disposition, decidedIn, guardrail] = cells;
    if (cells.length !== BACKLOG_HEADER.length) fail(`retro backlog row malformed: ${cells.join(' | ')}`);
    if (!/^\d+-[a-z0-9-]+#[AP]-[1-9]\d*$/.test(row) || seen.has(row)) fail(`retro backlog Row invalid or repeated: ${row}`);
    if (!ACTS_ON.includes(actsOn)) fail(`retro backlog ${row} Acts on must be ${ACTS_ON.join(' or ')}: ${actsOn}`);
    if (!BACKLOG_DISPOSITIONS.includes(disposition)) fail(`retro backlog ${row} Disposition must be one of ${BACKLOG_DISPOSITIONS.join(', ')}: ${disposition}`);
    seen.add(row);
    return { row, acts_on: actsOn, disposition, decided_in: decidedIn, guardrail };
  });
}

function sprintPhase(dir) {
  const file = path.join(dir, 'state.json');
  let state;
  try {
    state = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`${file} unreadable: ${error.message}`);
  }
  if (!state || typeof state.phase !== 'string') fail(`${file} has no phase`);
  return state.phase;
}

/** The highest-numbered archived sprint that reached `done` with a retrospective, or null. */
function latestRetroSprint(archived) {
  if (!fs.existsSync(archived)) return null;
  const sprints = fs.readdirSync(archived, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort((a, b) => b.localeCompare(a, 'en', { numeric: true }));
  return sprints.find((sprint) => fs.existsSync(path.join(archived, sprint, 'retrospective.html')) && sprintPhase(path.join(archived, sprint)) === 'done') || null;
}

/** Retro intake candidates as `{row, acts_on, guardrail, home}`: the latest closed retrospective's rows the backlog does not dispose, then the backlog's deferred rows as their retrospective states them (the backlog's Acts on/Guardrail are human-readable copies); `covered by:` rows drop. Outside a self-hosting project the latest retrospective's `asd` rows stay tagged `upstream: true`, proposals for the framework that are never dispositioned, while a deferred `asd` row drops. An absent backlog reads as empty. */
function retroCandidates(sprintsDir, backlogPath, selfHosting) {
  if (!fs.statSync(sprintsDir).isDirectory()) fail(`--sprints is not a directory: ${sprintsDir}`);
  const archived = path.join(sprintsDir, 'archived');
  const backlog = fs.existsSync(backlogPath) ? backlogRows(fs.readFileSync(backlogPath, 'utf8')) : [];
  const disposed = new Set(backlog.map((entry) => entry.row));
  const rowsOf = (sprint) => retroRows(fs.readFileSync(path.join(archived, sprint, 'retrospective.html'), 'utf8')).map((row) => ({ row: `${sprint}#${row.id}`, acts_on: row.acts_on, guardrail: row.guardrail, home: row.home }));
  const isOpen = (candidate) => !/^covered by:/i.test(candidate.guardrail);
  const isOwn = (candidate) => selfHosting || candidate.acts_on === 'consumer';
  const latest = latestRetroSprint(archived);
  const fresh = (latest === null ? [] : rowsOf(latest).filter((candidate) => !disposed.has(candidate.row) && isOpen(candidate))).map((candidate) => (isOwn(candidate) ? candidate : { ...candidate, upstream: true }));
  const deferred = backlog.filter((entry) => entry.disposition === 'deferred').map((entry) => rowsOf(entry.row.split('#')[0]).find((candidate) => candidate.row === entry.row) || fail(`retro backlog row not in its retrospective: ${entry.row}`));
  return fresh.concat(deferred.filter((candidate) => isOpen(candidate) && isOwn(candidate)));
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

/** Copies each draft under the `snapshot/` directory of design-review iteration dir `out`, so the next iteration can diff against it, and returns the drafts whose content differs from their copy under the `previous` iteration dir; a missing copy counts as changed, so a missing snapshot widens scope rather than dropping a draft. */
function draftSnapshot(files, out, previous) {
  const changed = files.filter((file) => {
    const before = previous === undefined ? null : snapshotCopyPath(previous, file);
    return before === null || !fs.existsSync(before) || !fs.readFileSync(before).equals(fs.readFileSync(file));
  });
  files.forEach((file) => {
    const copy = snapshotCopyPath(out, file);
    fs.mkdirSync(path.dirname(copy), { recursive: true });
    fs.copyFileSync(file, copy);
  });
  return changed;
}

/** Added lines of a zero-context unified diff as `{file, line, text}`, each at its line number in the new file. */
function addedLines(diff) {
  const added = [];
  let file = null;
  let line = 0;
  let inHunk = false;
  diff.split('\n').forEach((text) => {
    if (text.startsWith('diff --git ')) inHunk = false;
    else if (!inHunk && text.startsWith('+++ ')) file = text.slice(4).replace(/\t.*$/, '');
    else if (text.startsWith('@@')) {
      inHunk = true;
      line = Number(/\+(\d+)/.exec(text)[1]);
    } else if (inHunk && text.startsWith('+')) {
      added.push({ file, line, text: text.slice(1) });
      line += 1;
    }
  });
  return added;
}

/** Work-history violations among the added lines of a staged agent-memory diff and the names of its newly added files, as `{path, line, token}`; `line` is null for a file name, whose `_` separators count as word breaks so `project_<ordinal>-topic.md` is caught. */
function memoryViolations(diff, names) {
  const scanned = names.map((name) => ({ file: name, line: null, text: name.replace(/_/g, ' ') })).concat(addedLines(diff));
  return scanned.flatMap(({ file, line, text }) => MEMORY_HISTORY_PATTERNS.map((pattern) => pattern.exec(text)).filter(Boolean).map((match) => ({ path: file, line, token: match[0] })));
}

/** Runs the work-history check over the staged agent-memory changes, only those under `paths` (files or directories, repo-root relative) when any are given. */
function memoryCheck(flags, paths = []) {
  if (Object.keys(flags).length > 0) fail('memory-check takes no flags');
  const diff = runGit(['diff', '--cached', '-U0', '--no-color', '--no-ext-diff', '--no-prefix', '--', AGENT_MEMORY_PATHSPEC]);
  const names = runGit(['diff', '--cached', '--name-only', '-z', '--diff-filter=ACR', '--', AGENT_MEMORY_PATHSPEC]).split('\0').filter(Boolean);
  const named = paths.map((entry) => entry.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/$/, ''));
  const isNamed = (violation) => named.length === 0 || named.some((target) => violation.path === target || violation.path.startsWith(`${target}/`));
  return memoryViolations(diff, names).filter(isNamed);
}

/** The pre-commit report for a commit of `paths` (all staged when none): the header's length and the memory-check hits among those paths; `ok` only when the header fits and there is no hit. */
function commitCheck(flags, paths) {
  const unknown = Object.keys(flags).filter((name) => name !== 'subject');
  if (unknown.length > 0 || typeof flags.subject !== 'string' || flags.subject === '') fail('commit-check takes --subject "<header>" [-- <paths...>]');
  const headerLength = Array.from(flags.subject).length;
  const memory = memoryCheck({}, paths);
  return { ok: headerLength <= COMMIT_HEADER_MAX && memory.length === 0, header: { length: headerLength, max: COMMIT_HEADER_MAX }, memory };
}

/** Runs `commit-check`: `--subject` flag, then the named paths after `--`; prints the report as JSON and exits 1 when it is not ok. */
function commitCheckCommand(args) {
  const split = args.indexOf('--');
  const report = commitCheck(parseFlagArgs(split === -1 ? args : args.slice(0, split)), split === -1 ? [] : args.slice(split + 1));
  process.stdout.write(JSON.stringify(report) + '\n');
  return report.ok ? 0 : 1;
}

/** Sums added plus deleted lines of `git diff --numstat -z -M` output over the listed paths, a rename counted at its destination; a binary file (`-`) and a pure rename (0 and 0) add nothing, and a path in `discounts` (path to lines) counts only what its collapse leaves. */
function numstatLines(output, files, discounts = new Map()) {
  const listed = new Set(stringArray(files, 'files'));
  const tokens = output.split('\0');
  let lines = 0;
  let at = 0;
  while (at < tokens.length - 1) {
    const entry = /^(-|\d+)\t(-|\d+)\t([\s\S]*)$/.exec(tokens[at]);
    if (!entry) fail(`numstat entry malformed: ${tokens[at]}`);
    const [, added, deleted, file] = entry;
    const isRename = file === '';
    const counted = isRename ? tokens[at + 2] : file;
    if (added !== '-' && listed.has(counted)) lines += Number(added) + Number(deleted) - (discounts.get(counted) || 0);
    at += isRename ? 3 : 1;
  }
  return lines;
}

/** Review waves a scope of `files` files, `lines` changed lines and `bytes` of diff needs: the most of one per WAVE_THRESHOLD_LINES, WAVE_THRESHOLD_FILES and WAVE_THRESHOLD_BYTES begun, at least one, at most MAX_REVIEW_WAVES and never more than `files`, so every wave can hold a file. */
function reviewWaveCount(lines, files, bytes = 0) {
  if (!Number.isInteger(lines) || lines < 0) fail('lines must be a non-negative integer');
  if (!Number.isInteger(files) || files < 0) fail('files must be a non-negative integer');
  if (!Number.isInteger(bytes) || bytes < 0) fail('bytes must be a non-negative integer');
  const needed = Math.max(Math.ceil(lines / WAVE_THRESHOLD_LINES), Math.ceil(files / WAVE_THRESHOLD_FILES), Math.ceil(bytes / WAVE_THRESHOLD_BYTES));
  return Math.min(MAX_REVIEW_WAVES, Math.max(1, files), Math.max(1, needed));
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

/** Command-line budget of one git invocation: Windows caps it at 32,767 characters and Node's argument quoting can double one, so each argument counts `2 × length + 3`, kept under 32,000. */
const GIT_ARGS_BUDGET = 32000;

/** Patch pathspec units for files one range diffs, a rename paired with its source so the patch shows a rename rather than an add; a unit is never split across invocations. */
function patchUnits(files, renames) {
  return files.map((file) => (renames.has(file) ? [renames.get(file).source, file] : [file]));
}

/** An impl-review manifest's commit ranges: `--base...--head` for the scope, and `--full-base...--head` for `--full-files`, whose entries join the list and take that wider range even when also in the scope. Null without `--base/--head`. */
function manifestRanges(flags) {
  const hasRange = flags.base !== undefined || flags.head !== undefined;
  const hasFull = flags['full-files'] !== undefined || flags['full-base'] !== undefined;
  if (hasRange && flags.phase !== 'impl-review') fail('--base/--head apply to impl-review only');
  if (hasFull && !hasRange && (flags.snapshot === undefined || flags['full-base'] !== undefined)) fail('--full-files/--full-base need --base/--head; in design-review --full-files needs --snapshot and takes no --full-base');
  if (!hasRange) return null;
  const head = gitRef(flags.head, '--head');
  const base = gitRef(flags.base, '--base');
  const scopeRange = { base, head, renames: rangeRenames(base, head) };
  if (!hasFull) return { scope: scopeRange, full: null, fullFiles: new Set() };
  if (typeof flags['full-files'] !== 'string') fail('--full-files <path> required with --full-base');
  const fullBase = gitRef(flags['full-base'], '--full-base');
  return { scope: scopeRange, full: { base: fullBase, head, renames: rangeRenames(fullBase, head) }, fullFiles: new Set(readFileList(flags['full-files'])) };
}

/** A design-review manifest's snapshot diff source: the previous iteration dir, and the `--full-files` drafts left out of the diff so each is read whole. Null without `--snapshot`. */
function snapshotSource(flags) {
  if (flags.snapshot === undefined) return null;
  if (flags.phase !== 'design-review') fail('--snapshot applies to design-review only');
  return { dir: flags.snapshot, whole: new Set(flags['full-files'] === undefined ? [] : readFileList(flags['full-files'])) };
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

/** Git invocations writing one patch for `files`, each file's hunks over its own range; a range's path units split, in list order, into consecutive invocations within `GIT_ARGS_BUDGET`, a single unit always fitting. */
function rangePatchInvocations(ranges, files) {
  const cost = (arg) => 2 * arg.length + 3;
  return [ranges.scope, ranges.full].filter((range) => range !== null).flatMap((range) => {
    const fixed = ['--literal-pathspecs', 'diff', '-M', '--no-color', '--no-ext-diff', '--no-textconv', `${range.base}...${range.head}`, '--'];
    const fixedCost = fixed.reduce((sum, arg) => sum + cost(arg), 0);
    const chunks = [];
    let used = Infinity;
    patchUnits(files.filter((file) => rangeOf(ranges, file) === range), range.renames).forEach((unit) => {
      const unitCost = unit.reduce((sum, arg) => sum + cost(arg), 0);
      if (used + unitCost > GIT_ARGS_BUDGET) {
        chunks.push([]);
        used = fixedCost;
      }
      chunks[chunks.length - 1].push(...unit);
      used += unitCost;
    });
    return chunks.map((paths) => ({ args: [...fixed, ...paths] }));
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

/** Writes the diff of a manifest's file list into `dir` and returns its path: over the commit ranges in impl-review, against the previous snapshot in design-review, minus the drafts it leaves whole; null when there is nothing to diff against, as in design-review iteration 1. Named by the fingerprint of the git invocations producing it, so manifests sharing a list and range share one file; rewritten on every call, since those invocations name refs and paths rather than content and a reused directory may hold an older file under the same name, and renamed into place so it is never seen half-written. */
function writeManifestDiff(dir, files, ranges, snapshot, renameMap = null) {
  if (ranges === null && snapshot === null) return null;
  const invocations = ranges !== null ? rangePatchInvocations(ranges, files) : snapshotPatchInvocations(snapshot.dir, files.filter((file) => !snapshot.whole.has(file)));
  const diff = path.join(dir, `${fingerprint(renameMap === null ? invocations : { invocations, renameMap }).slice(0, 16)}.diff`);
  const partial = `${diff}.${process.pid}.tmp`;
  if (ranges === null) writeGitOutput(partial, invocations);
  else fs.writeFileSync(partial, collapsedPatch(invocations, renameMap).text);
  fs.renameSync(partial, diff);
  return diff;
}

/** Reads a rename map: a JSON object of old text to new text, each key a non-empty literal substring a plan's rename replaced everywhere; null when no file is given. */
function readRenameMap(file) {
  if (file === undefined) return null;
  const map = JSON.parse(fs.readFileSync(file, 'utf8'));
  const isMap = map !== null && typeof map === 'object' && !Array.isArray(map) && Object.keys(map).length > 0;
  if (!isMap || !Object.entries(map).every(([old, now]) => old !== '' && typeof now === 'string')) fail('--rename-map must be a JSON object of non-empty old text to new text strings');
  return map;
}

/** A function applying every rename-map substitution to a line at once, longest key first, so one entry's output is never rewritten by another. */
function substituter(map) {
  const pattern = new RegExp(Object.keys(map).sort((a, b) => b.length - a.length).map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
  return (line) => line.replace(pattern, (match) => map[match]);
}

/** Substituted line count of a hunk that only applies the substitutions, else 0: each run of changed lines between context lines must be its removed lines mapped equal to its added lines, with equal end-of-file markers, so a moved or edited line never qualifies. */
function substitutedLines(hunk, substitute) {
  let removed = [];
  let added = [];
  let markers = [0, 0];
  let side = null;
  let count = 0;
  let isPure = true;
  const flush = () => {
    isPure = isPure && removed.length === added.length && markers[0] === markers[1] && removed.every((line, i) => substitute(line) === added[i]);
    count += removed.filter((line) => substitute(line) !== line).length;
    [removed, added, markers] = [[], [], [0, 0]];
  };
  hunk.split('\n').slice(1).forEach((line) => {
    if (line.startsWith('-')) [side, removed] = [0, [...removed, line.slice(1)]];
    else if (line.startsWith('+')) [side, added] = [1, [...added, line.slice(1)]];
    else if (line.startsWith('\\')) markers[side === null ? 0 : side] += 1;
    else flush();
  });
  flush();
  return isPure ? count : 0;
}

/** The path a patch section names: its rename target or `+++` path, else for a deletion the shared path of its `diff --git` line (a quoted pair stays quoted). */
function sectionPath(head) {
  const named = /^(?:rename to |\+\+\+ b\/)(.*?)\t?$/m.exec(head);
  if (named !== null) return named[1];
  const pair = head.split('\n', 1)[0].slice('diff --git '.length);
  return pair.startsWith('"') ? pair : pair.slice(2, (pair.length - 1) / 2);
}

/** Replaces each whole-file deletion in a git patch with `# collapsed: <path>: deleted, <N> lines`, and with a `substitute` each hunk only applying the rename map with one `# collapsed: <path>: <K> rename-map substitutions` line per file; `discounts` maps each such file to the numstat lines (added plus deleted) it no longer contributes. */
function collapsePatch(patch, substitute) {
  const discounts = [];
  const text = patch.split(/^(?=diff --git )/m).map((section) => {
    if (!section.startsWith('diff --git ')) return section;
    const [head, ...hunks] = section.split(/^(?=@@ )/m);
    const removedLines = (parts) => parts.join('').split('\n').filter((line) => line.startsWith('-')).length;
    if (/^deleted file mode /m.test(head)) {
      discounts.push([sectionPath(head), removedLines(hunks)]);
      return `# collapsed: ${sectionPath(head)}: deleted, ${removedLines(hunks)} lines\n`;
    }
    const counts = substitute === null ? hunks.map(() => 0) : hunks.map((hunk) => substitutedLines(hunk, substitute));
    const total = counts.reduce((sum, count) => sum + count, 0);
    if (total === 0) return section;
    discounts.push([sectionPath(head), 2 * total]);
    const kept = hunks.filter((hunk, i) => counts[i] === 0);
    return `${kept.length === 0 ? '' : head + kept.join('')}# collapsed: ${sectionPath(head)}: ${total} rename-map substitutions\n`;
  }).join('');
  return { text, discounts };
}

/** Runs each patch invocation and collapses its output (`collapsePatch`) under `renameMap`; `discounts` is a Map of collapsed file to the numstat lines it no longer contributes. */
function collapsedPatch(invocations, renameMap) {
  const substitute = renameMap === null ? null : substituter(renameMap);
  const results = invocations.map((invocation) => collapsePatch(runGit(invocation.args), substitute));
  return { text: results.map((result) => result.text).join(''), discounts: new Map(results.flatMap((result) => result.discounts)) };
}

function positiveInteger(value, name) {
  if (typeof value !== 'string' || !/^0*[1-9]\d*$/.test(value)) fail(`${name} <n> must be a positive integer`);
  return Number(value);
}

/** Writes External Review's scope manifest and its diff: the same explicit list and precomputed change content an internal reviewer gets, with no rubric and no ledger. */
function emitExternalScope(flags, files, ranges, snapshot, renameMap) {
  const isImplReview = flags.phase === 'impl-review';
  if (isImplReview && ranges === null) fail('--base/--head required for impl-review External Review');
  if (isImplReview !== (flags.wave !== undefined)) fail('--wave <k> is required for impl-review and applies to it only');
  const stem = path.join(flags.out, EXTERNAL_REVIEWER);
  const scope = Object.assign(
    { phase: flags.phase, iteration: positiveInteger(flags.iteration, '--iteration') },
    isImplReview ? { wave: positiveInteger(flags.wave, '--wave') } : {},
    { files, diff: writeManifestDiff(flags.out, files, ranges, snapshot, renameMap) },
  );
  fs.writeFileSync(`${stem}.scope.json`, JSON.stringify(scope) + '\n', 'utf8');
  return scope.diff === null ? { scope: `${stem}.scope.json` } : { scope: `${stem}.scope.json`, diff: scope.diff };
}

/** Writes one internal reviewer's coverage manifest and its diff. */
function emitInternalManifest(flags, files, ranges, snapshot, renameMap) {
  if (flags.iteration !== undefined || flags.wave !== undefined) fail(`--iteration/--wave apply to --reviewer ${EXTERNAL_REVIEWER} only`);
  const customPaths = typeof flags['custom-rules'] === 'string' ? flags['custom-rules'].split(',') : [];
  const testPlan = typeof flags['test-plan'] === 'string' ? flags['test-plan'].split(',') : [];
  const reviewed = reviewerFiles(flags.phase, flags.reviewer, files, testPlan);
  const rubricOf = (reviewer) => fs.readFileSync(path.join(__dirname, 'agents', `asd-reviewer-${reviewer}.md`), 'utf8');
  const manifest = emitCoverageManifest({
    reviewer: flags.reviewer,
    phase: flags.phase,
    rubric: flags.reviewer === COMBINED_REVIEWER ? Object.fromEntries(COMBINED_RUBRICS.concat(COMBINED_REVIEWER).map((reviewer) => [reviewer, rubricOf(reviewer)])) : rubricOf(flags.reviewer),
    files: reviewed,
    scopeFiles: files,
    customRules: Object.fromEntries(customPaths.map((file) => [file, fs.readFileSync(file, 'utf8')])),
    selfHosting: flags['self-hosting'] === true,
    templates: templateNames(path.join(__dirname, 'templates')),
    pureRenames: pureRenames(ranges, reviewed),
  });
  const stem = path.join(flags.out, flags.reviewer);
  fs.writeFileSync(`${stem}.manifest.json`, JSON.stringify(manifest) + '\n', 'utf8');
  const diff = writeManifestDiff(flags.out, manifest.files, ranges, snapshot, renameMap);
  return diff === null ? { manifest: `${stem}.manifest.json`, digest: manifest.digest } : { manifest: `${stem}.manifest.json`, digest: manifest.digest, diff };
}

function emitManifestCommand(flags) {
  if (typeof flags.files !== 'string' || typeof flags.out !== 'string') fail('--files <path> and --out <dir> required');
  if (!PHASES.includes(flags.phase)) fail('phase must be design-review or impl-review');
  const keys = reviewerKeys(flags.phase.replace(/-review$/, ''));
  if (!keys.includes(flags.reviewer)) fail(`--reviewer <name> required, one of ${keys.join(', ')}`);
  const snapshot = snapshotSource(flags);
  const ranges = manifestRanges(flags);
  const whole = ranges !== null ? ranges.fullFiles : snapshot !== null ? snapshot.whole : new Set();
  const files = [...new Set(readFileList(flags.files).concat([...whole]))];
  const renameMap = readRenameMap(flags['rename-map']);
  if (renameMap !== null && ranges === null) fail('--rename-map applies to impl-review with --base/--head only');
  return flags.reviewer === EXTERNAL_REVIEWER ? emitExternalScope(flags, files, ranges, snapshot, renameMap) : emitInternalManifest(flags, files, ranges, snapshot, renameMap);
}

/** Bytes of the collapsed patch a reviewer reads for `files` over `base...head`, a rename paired with its source so a move is not counted as an add, and the numstat lines each collapsed file no longer contributes; zero bytes for no files. */
function measurePatch(base, head, files, renameMap) {
  const ranges = { scope: { base, head, renames: rangeRenames(base, head) }, full: null, fullFiles: new Set() };
  const { text, discounts } = collapsedPatch(rangePatchInvocations(ranges, files), renameMap);
  return { bytes: Buffer.byteLength(text), discounts };
}

/** Measures the scope and, with `--division`, records it; `--single` fixes the wave count at 1 whatever the measure says, so a one-wave division over a scope above a threshold is accepted and the reported and recorded `waves` is 1. Without it the measured count rules. */
function reviewWavesCommand(flags) {
  if (typeof flags.files !== 'string') fail('--files <path> required');
  if ((flags.division === undefined) !== (flags.out === undefined)) fail('--division <json path> and --out <path> go together');
  const base = gitRef(flags.base, '--base');
  const head = gitRef(flags.head, '--head');
  const scope = readFileList(flags.files);
  const files = new Set(scope).size;
  const { bytes, discounts } = measurePatch(base, head, scope, readRenameMap(flags['rename-map']));
  const lines = numstatLines(runGit(['diff', '--numstat', '-z', '-M', `${base}...${head}`]), scope, discounts);
  const thresholds = { lines: WAVE_THRESHOLD_LINES, files: WAVE_THRESHOLD_FILES, bytes: WAVE_THRESHOLD_BYTES };
  const measured = { lines, files, bytes, thresholds, waves: flags.single === true ? 1 : reviewWaveCount(lines, files, bytes) };
  if (flags.division === undefined) return measured;
  const waves = validateWaveDivision(JSON.parse(fs.readFileSync(flags.division, 'utf8')), scope, measured.waves);
  fs.mkdirSync(path.dirname(flags.out), { recursive: true });
  fs.writeFileSync(flags.out, JSON.stringify({ base, head, lines, files, bytes, thresholds, waves }) + '\n', 'utf8');
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

/** The git-ignored directory every helper file lives in, created on first use with a `.gitignore` of `*` so it ignores itself without a root `.gitignore` entry; returns its absolute path. */
function scratchDir() {
  const dir = path.join(__dirname, 'tmp');
  const ignore = path.join(dir, '.gitignore');
  fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(ignore)) fs.writeFileSync(ignore, '*\n', 'utf8');
  return dir;
}

/** Moves the sprint's live decisions log to the next `decisions-log.NNN.md` segment and recreates it from the template, unless the phase does not change, both phases sit in the impl cycle, or the log holds no entry; reports what it did. */
function rotateDecisions(flags) {
  if (typeof flags.sprint !== 'string' || typeof flags.to !== 'string') fail('--sprint <sprint dir> and --to <phase> required');
  const from = JSON.parse(fs.readFileSync(path.join(flags.sprint, 'state.json'), 'utf8')).phase;
  const live = path.join(flags.sprint, 'decisions-log.md');
  const unchanged = { rotated: false, from, to: flags.to, segment: null };
  const withinCycle = IMPL_CYCLE.includes(from) && IMPL_CYCLE.includes(flags.to);
  if (from === flags.to || withinCycle || !DECISION_ENTRY.test(fs.readFileSync(live, 'utf8'))) return unchanged;
  const ordinals = fs.readdirSync(flags.sprint).map((name) => /^decisions-log\.(\d+)\.md$/.exec(name)).filter(Boolean).map((match) => Number(match[1]));
  const segment = path.join(flags.sprint, `decisions-log.${String(Math.max(0, ...ordinals) + 1).padStart(3, '0')}.md`);
  fs.renameSync(live, segment);
  fs.copyFileSync(path.join(__dirname, 'templates', 't_decisions-log.md'), live);
  return { ...unchanged, rotated: true, segment };
}

/** What a liveness decision reads off a Claude subagent transcript (JSONL): when the agent started, when its newest still-unanswered tool call began (null when none is open), and whether its last message is a final assistant answer. An unparseable line, such as a half-written tail, is skipped. */
function transcriptProgress(text) {
  const parse = (line) => {
    try { return JSON.parse(line); } catch (_) { return null; }
  };
  const messages = text.split('\n').map(parse).filter((entry) => entry && (entry.type === 'assistant' || entry.type === 'user') && entry.message);
  const blocks = (entry, type) => (Array.isArray(entry.message.content) ? entry.message.content.filter((block) => block && block.type === type) : []);
  const answered = new Set(messages.flatMap((entry) => blocks(entry, 'tool_result').map((block) => block.tool_use_id)));
  const open = messages.flatMap((entry) => blocks(entry, 'tool_use').filter((block) => !answered.has(block.id)).map(() => Date.parse(entry.timestamp)));
  const last = messages[messages.length - 1];
  return {
    startedAt: messages.length === 0 ? NaN : Date.parse(messages[0].timestamp),
    openCallSince: open.length === 0 ? null : Math.max(...open),
    done: last !== undefined && last.type === 'assistant' && last.message.stop_reason === 'end_turn' && blocks(last, 'tool_use').length === 0,
  };
}

/** One liveness check of one agent, as `{status, reason?}`: `done` once its last message is a final answer; `stalled` when over `budgetMs` since it started (`over-budget`), or when its transcript neither grew nor changed mtime since `previous` while no tool call is open (`no-progress`) or its open call has passed the host's command ceiling (`tool-call-overrun`); `unobservable` when the transcript is missing on this and the previous check; else `running`. `previous` is the last check's `{size, mtimeMs}`, null when the transcript was missing then, undefined before the first check; `current` is `{size, mtimeMs, text}`, or null when missing. A first miss waits a check, since a just-dispatched agent may not have written its transcript yet. */
function agentLiveness(previous, current, now, budgetMs) {
  if (current === null) return previous === null ? { status: 'unobservable' } : { status: 'running' };
  const progress = transcriptProgress(current.text);
  if (progress.done) return { status: 'done' };
  if (budgetMs !== undefined && now - progress.startedAt > budgetMs) return { status: 'stalled', reason: 'over-budget' };
  if (!previous || previous.size !== current.size || previous.mtimeMs !== current.mtimeMs) return { status: 'running' };
  if (progress.openCallSince !== null && now - progress.openCallSince < TOOL_CALL_CEILING_MS) return { status: 'running' };
  return { status: 'stalled', reason: progress.openCallSince === null ? 'no-progress' : 'tool-call-overrun' };
}

/** The transcript of subagent `id` under `<projectsDir>/<project>/<session>/subagents/`, or null. */
function findTranscript(projectsDir, id) {
  if (!fs.existsSync(projectsDir)) return null;
  const subdirs = (dir) => fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => path.join(dir, entry.name));
  return subdirs(projectsDir).flatMap(subdirs).map((session) => path.join(session, 'subagents', `agent-${id}.jsonl`)).find((file) => fs.existsSync(file)) || null;
}

function transcriptSnapshot(file) {
  if (file === null || !fs.existsSync(file)) return null;
  const stat = fs.statSync(file);
  return { size: stat.size, mtimeMs: stat.mtimeMs, text: fs.readFileSync(file, 'utf8') };
}

/** Checks each `--agents` Claude subagent's transcript, under `$CLAUDE_CONFIG_DIR/projects` when that is set and `~/.claude/projects` otherwise, every `--interval` seconds and prints one `STALL <id> <reason>` line per stalled agent, which it then stops watching; silent while agents progress, it returns once every agent is done or stalled. A transcript missing on two consecutive checks fails the command with a non-zero exit instead of a stall line, so a host whose transcripts it cannot find never gets a healthy agent stopped. */
async function agentLivenessCommand(flags) {
  if (typeof flags.agents !== 'string') fail('--agents <id,...> required');
  const ids = [...new Set(flags.agents.split(','))];
  const invalid = ids.find((id) => !/^[A-Za-z0-9_-]+$/.test(id));
  if (invalid !== undefined) fail(`--agents id invalid: ${invalid}`);
  const intervalMs = positiveInteger(flags.interval, '--interval') * 1000;
  const budgetMs = flags['budget-min'] === undefined ? undefined : positiveInteger(flags['budget-min'], '--budget-min') * 60000;
  const projectsDir = path.join(process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude'), 'projects');
  const watched = new Map(ids.map((id) => [id, { file: null, previous: undefined }]));
  for (;;) {
    for (const [id, agent] of watched) {
      agent.file = agent.file || findTranscript(projectsDir, id);
      const current = transcriptSnapshot(agent.file);
      const verdict = agentLiveness(agent.previous, current, Date.now(), budgetMs);
      if (verdict.status === 'unobservable') fail(`agent-liveness: no transcript for agent ${id} under ${projectsDir} ($CLAUDE_CONFIG_DIR/projects, else ~/.claude/projects)`);
      if (verdict.status === 'stalled') process.stdout.write(`STALL ${id} ${verdict.reason}\n`);
      if (verdict.status !== 'running') watched.delete(id);
      agent.previous = current === null ? null : { size: current.size, mtimeMs: current.mtimeMs };
    }
    if (watched.size === 0) return 0;
    await delay(intervalMs);
  }
}

/** A timing ledger's open and close entries in order; an unparseable line, such as a half-written tail, is skipped. */
function timingEntries(text) {
  const parse = (line) => {
    try { return JSON.parse(line); } catch (_) { return null; }
  };
  return text.split('\n').map(parse).filter((entry) => entry && (entry.op === 'open' || entry.op === 'close') && typeof entry.id === 'string');
}

/** Replays ledger entries: the ops still open keyed by id, the close entries, and the ids of closes no open preceded; a `continued` close needs none, it continues an op an earlier close ended. */
function ledgerState(entries) {
  const open = new Map();
  const closed = [];
  const unpaired = [];
  for (const entry of entries) {
    if (entry.op === 'open') {
      open.set(entry.id, entry);
      continue;
    }
    if (!open.delete(entry.id) && entry.outcome !== 'continued') unpaired.push(entry.id);
    closed.push(entry);
  }
  return { open, closed, unpaired };
}

/** Each id's latest close entry, dropped when the id was opened again after it. */
function latestCloses(entries) {
  const closes = new Map();
  for (const entry of entries) {
    closes.delete(entry.id);
    if (entry.op === 'close') closes.set(entry.id, entry);
  }
  return closes;
}

function phaseName(id) {
  return id.replace(/#\d+$/, '');
}

function phaseOrdinal(id) {
  const match = /#(\d+)$/.exec(id);
  return match === null ? 1 : Number(match[1]);
}

/** The op an id names in `ops` (open ops by id, or latest closes): its exact id, else the latest phase op its bare phase name names. */
function resolveOp(ops, id) {
  if (ops.has(id)) return ops.get(id);
  return [...ops.values()].reverse().find((entry) => entry.kind === 'phase' && phaseName(entry.id) === id);
}

function closeEntry(entry, end, outcome) {
  return { op: 'close', id: entry.id, kind: entry.kind, parent: entry.parent, start: entry.start, end, outcome, attrs: entry.attrs };
}

/** Text appending `entries` to a ledger holding `text`, starting a fresh line after a half-written tail. */
function ledgerAppendText(text, entries) {
  if (entries.length === 0) return '';
  const separator = text !== '' && !text.endsWith('\n') ? '\n' : '';
  return separator + entries.map((entry) => `${JSON.stringify(entry)}\n`).join('');
}

function timingIds(value, name) {
  if (value === undefined) return [];
  const ids = typeof value === 'string' ? value.split(',').map((id) => id.trim()) : [];
  if (ids.length === 0 || ids.includes('')) fail(`${name} <id,...> must list non-empty ids`);
  return ids;
}

function timingAttrs(value) {
  if (value === undefined) return {};
  return Object.fromEntries(value.split(';').map((pair) => {
    const at = pair.indexOf('=');
    if (at < 1) fail(`--attrs entry must be k=v: ${pair}`);
    return [pair.slice(0, at).trim(), pair.slice(at + 1).trim()];
  }));
}

/** Validates `timing`'s flags into `{close, outcome, open, kind, parent, attrs}`. */
function timingRequest(flags) {
  const close = timingIds(flags.close, '--close');
  const open = timingIds(flags.open, '--open');
  if (close.length === 0 && open.length === 0) fail('--close <id,...> or --open <id,...> required');
  if (flags.outcome !== undefined && close.length === 0) fail('--outcome applies to --close only');
  const outcome = flags.outcome === undefined ? 'done' : flags.outcome;
  if (!TIMING_OUTCOMES.includes(outcome)) fail(`--outcome must be ${TIMING_OUTCOMES.join(' or ')}`);
  if (open.length === 0 && [flags.kind, flags.parent, flags.attrs].some((value) => value !== undefined)) fail('--kind/--parent/--attrs apply to --open only');
  if (open.length > 0 && !TIMING_KINDS.includes(flags.kind)) fail(`--kind must be one of ${TIMING_KINDS.join(', ')}`);
  const badPhase = flags.kind === 'phase' ? open.find((name) => !/^[a-z]+(-[a-z]+)*$/.test(name)) : undefined;
  if (badPhase !== undefined) fail(`--open of a phase takes its bare phase name: ${badPhase}`);
  return { close, outcome, open, kind: flags.kind, parent: flags.parent, attrs: timingAttrs(flags.attrs) };
}

/** The close entries for one `--close` id, given the `entries` so far and the `open` ops (updated). An open op closes after its still-open children, which take its outcome (warns); an id closed as `interrupted` by a recovery closes again as `continued`, running from that close's end; any other already-closed id is skipped (warns); an id never opened is recorded, unpaired, so the summary reports it (warns). */
function timingCloses(entries, open, id, outcome, now, warnings) {
  const entry = resolveOp(open, id);
  if (entry !== undefined) return closeWithChildren(open, entry, now, outcome, warnings);
  const previous = resolveOp(latestCloses(entries), id);
  if (previous === undefined) {
    warnings.push(`close of ${id} matches no open op`);
    return [closeEntry({ id, kind: null, parent: null, start: null, attrs: {} }, now, outcome)];
  }
  if (previous.outcome === 'interrupted' && outcome !== 'interrupted') return [closeEntry({ ...previous, start: previous.end }, now, 'continued')];
  warnings.push(`close of ${previous.id} skipped: already closed`);
  return [];
}

/** Closes `entry` and, before it, every op still open under it, deepest first, all at `end` with `outcome`; each child warns. */
function closeWithChildren(open, entry, end, outcome, warnings) {
  const children = [...open.values()].filter((child) => child.parent === entry.id);
  const closes = children.flatMap((child) => {
    warnings.push(`close of ${entry.id} closed open child ${child.id}`);
    return closeWithChildren(open, child, end, outcome, warnings);
  });
  open.delete(entry.id);
  return closes.concat(closeEntry(entry, end, outcome));
}

/** One `timing` call against a ledger holding `text`, as `{text, warnings}`: the text to append, closes before opens, each stamped `now` (ISO 8601 UTC); closes follow `timingCloses`. An open of an id already open, or of a phase whose bare name is already open, is skipped and warns. A phase opens as `<name>#<n>`, n its entry ordinal; an open without `parent` takes the open phase. */
function timingAppend(text, flags, now) {
  const request = timingRequest(flags);
  const entries = timingEntries(text);
  const { open } = ledgerState(entries);
  const warnings = [];
  const written = [];
  for (const id of request.close) written.push(...timingCloses(entries.concat(written), open, id, request.outcome, now, warnings));
  const phaseOpens = entries.filter((entry) => entry.op === 'open' && entry.kind === 'phase').map((entry) => phaseName(entry.id));
  for (const name of request.open) {
    const id = request.kind === 'phase' ? `${name}#${phaseOpens.filter((opened) => opened === name).length + 1}` : name;
    if (open.has(id) || (request.kind === 'phase' && [...open.values()].some((entry) => entry.kind === 'phase' && phaseName(entry.id) === name))) {
      warnings.push(`open of ${request.kind === 'phase' ? name : id} skipped: already open`);
      continue;
    }
    const entry = { op: 'open', id, kind: request.kind, parent: openParent(open, request), start: now, attrs: request.attrs };
    open.set(id, entry);
    if (request.kind === 'phase') phaseOpens.push(name);
    written.push(entry);
  }
  return { text: ledgerAppendText(text, written), warnings };
}

/** A new op's parent: the open op `--parent` names, kept verbatim when none is open; without `--parent`, the open phase op for any op but a phase. */
function openParent(open, request) {
  if (request.parent !== undefined) {
    const named = resolveOp(open, request.parent);
    return named === undefined ? request.parent : named.id;
  }
  const phase = request.kind === 'phase' ? undefined : [...open.values()].reverse().find((entry) => entry.kind === 'phase');
  return phase === undefined ? null : phase.id;
}

/** The `{text, warnings}` closing every op a ledger holding `text` leaves open as `interrupted`, at the latest of its start, the ledger's last timestamp and `headDate` (the HEAD commit's ISO 8601 date). */
function timingRecover(text, headDate) {
  const head = Date.parse(headDate);
  if (!Number.isFinite(head)) fail(`HEAD commit date unreadable: ${headDate}`);
  const entries = timingEntries(text);
  const end = new Date(Math.max(head, ...entries.flatMap((entry) => [entry.start, entry.end]).map(Date.parse).filter(Number.isFinite))).toISOString();
  const closes = [...ledgerState(entries).open.values()].map((entry) => closeEntry(entry, end, 'interrupted'));
  return { text: ledgerAppendText(text, closes), warnings: [] };
}

/** Runs `timing` or `timing-recover` as one append to `--ledger`, a missing ledger a no-op unless `timing --create`. Any failure, a malformed command line included, prints one stderr warning and still exits 0, so recording never stops the workflow. */
function timingCommand(command, args) {
  try {
    const flags = parseFlagArgs(args, ['create']);
    if (typeof flags.ledger !== 'string') fail('--ledger <path> required');
    const exists = fs.existsSync(flags.ledger);
    if (!exists && !(command === 'timing' && flags.create === true)) return 0;
    const text = exists ? fs.readFileSync(flags.ledger, 'utf8') : '';
    const result = command === 'timing' ? timingAppend(text, flags, new Date().toISOString()) : timingRecover(text, runGit(['log', '-1', '--format=%cI']).trim());
    if (result.text !== '') fs.appendFileSync(flags.ledger, result.text, 'utf8');
    if (result.warnings.length > 0) process.stderr.write(`${command}: ${result.warnings.join('; ')}\n`);
  } catch (error) {
    process.stderr.write(`${command}: warning, nothing recorded: ${error.message}\n`);
  }
  return 0;
}

/** Closed ops as `{id, kind, parent, start, end, ms, negative, outcome, attrs}`, times in epoch ms; a close without a readable start and end is left out, a negative duration clamped to 0 and marked. */
function closedOps(closed) {
  return closed.filter((entry) => Number.isFinite(Date.parse(entry.start)) && Number.isFinite(Date.parse(entry.end))).map((entry) => {
    const start = Date.parse(entry.start);
    const end = Date.parse(entry.end);
    return { id: entry.id, kind: entry.kind, parent: entry.parent, start, end, ms: Math.max(0, end - start), negative: end < start, outcome: entry.outcome, attrs: entry.attrs || {} };
  });
}

function seconds(ms) {
  return Math.round(ms / 1000);
}

function median(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Length of the union of `{start, end}` intervals, in ms. */
function unionMs(intervals) {
  let total = 0;
  let reach = -Infinity;
  for (const { start, end } of intervals.slice().sort((a, b) => a.start - b.start)) {
    total += Math.max(0, end - Math.max(start, reach));
    reach = Math.max(reach, end);
  }
  return total;
}

function groupTotals(ops, keyOf) {
  const groups = new Map();
  ops.forEach((op) => {
    const group = groups.get(keyOf(op)) || { count: 0, ms: 0 };
    groups.set(keyOf(op), { count: group.count + 1, ms: group.ms + op.ms });
  });
  return groups;
}

function phaseAndKindTotals(ops) {
  return { by_phase: groupTotals(ops.filter((op) => op.kind === 'phase'), (op) => phaseName(op.id)), by_kind: groupTotals(ops, (op) => op.kind) };
}

function totalsInSeconds(groups) {
  return Object.fromEntries([...groups].map(([key, group]) => [key, { count: group.count, seconds: seconds(group.ms) }]));
}

function modelTotals(ops) {
  const timed = ops.filter((op) => op.kind === 'dispatch' || op.kind === 'external-review');
  return [...groupTotals(timed, (op) => JSON.stringify([op.attrs.agent || null, op.attrs.tier || null, op.attrs.model || null]))].map(([key, group]) => {
    const [agent, tier, model] = JSON.parse(key);
    return { agent, tier, model, count: group.count, seconds: seconds(group.ms) };
  });
}

/** The slow set: the SLOW_TOP_N longest leaf machine ops (no other machine op names them as `parent`) plus every one over SLOW_MINUTES, longest first. Durations are machine time, overlapping user-wait ops subtracted; each op carries its excess over its kind's median in this sprint. */
function slowOps(ops) {
  const waits = ops.filter((op) => op.kind === 'user-wait');
  const machine = ops.filter((op) => LEAF_MACHINE_KINDS.includes(op.kind)).map((op) => ({
    ...op, ms: op.ms - unionMs(waits.map((wait) => ({ start: Math.max(wait.start, op.start), end: Math.min(wait.end, op.end) }))),
  }));
  const parents = new Set(machine.map((op) => op.parent));
  const leaves = machine.filter((op) => !parents.has(op.id));
  const kindMedian = (kind) => median(leaves.filter((op) => op.kind === kind).map((op) => op.ms));
  return leaves.slice().sort((a, b) => b.ms - a.ms).filter((op, rank) => rank < SLOW_TOP_N || op.ms > SLOW_MINUTES * 60000).map((op) => ({
    id: op.id, kind: op.kind, parent: op.parent, seconds: seconds(op.ms), excess_seconds: seconds(op.ms - kindMedian(op.kind)), outcome: op.outcome, attrs: op.attrs,
  }));
}

function reworkTotals(ops) {
  const total = (picked) => ({ count: picked.length, seconds: seconds(picked.reduce((sum, op) => sum + op.ms, 0)), ids: picked.map((op) => op.id) });
  return {
    reentries: total(ops.filter((op) => op.kind === 'phase' && phaseOrdinal(op.id) > 1)),
    iterations: total(ops.filter((op) => op.kind === 'review-iteration' && Number(op.attrs.iteration) >= 2)),
    interrupted: total(ops.filter((op) => op.outcome === 'interrupted')),
  };
}

/** Per phase and kind, the median of archived sprints' totals and how many sprints recorded it; null with no archived ledger. */
function timingBaseline(archivedTexts) {
  if (archivedTexts.length === 0) return null;
  const sprints = archivedTexts.map((text) => phaseAndKindTotals(closedOps(ledgerState(timingEntries(text)).closed)));
  const medians = (field) => {
    const samples = new Map();
    sprints.forEach((totals) => totals[field].forEach((group, key) => samples.set(key, (samples.get(key) || []).concat(group.ms))));
    return Object.fromEntries([...samples].map(([key, values]) => [key, { median_seconds: seconds(median(values)), sprints: values.length }]));
  };
  return { ledgers: archivedTexts.length, by_phase: medians('by_phase'), by_kind: medians('by_kind') };
}

/** Stretches over SLOW_MINUTES inside a closed phase op that no other op overlaps, as `{phase, start, seconds}` by start; an op still open covers to the phase's end. */
function idleStretches(all) {
  const limitMs = SLOW_MINUTES * 60000;
  return all.filter((phase) => phase.kind === 'phase' && Number.isFinite(phase.end)).flatMap((phase) => {
    const covers = all.filter((op) => op.kind !== 'phase').map((op) => ({ start: Math.max(op.start, phase.start), end: Math.min(op.end, phase.end) }))
      .filter((cover) => cover.end > cover.start).sort((a, b) => a.start - b.start);
    const stretches = [];
    let reach = phase.start;
    for (const cover of covers.concat({ start: phase.end, end: phase.end })) {
      if (cover.start - reach > limitMs) stretches.push({ phase: phase.id, start: new Date(reach).toISOString(), seconds: seconds(cover.start - reach) });
      reach = Math.max(reach, cover.end);
    }
    return stretches;
  }).sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
}

function timingGaps(ops, open, unpaired) {
  const openOps = [...open.values()].map((entry) => ({ id: entry.id, kind: entry.kind, start: Date.parse(entry.start), end: Infinity }));
  const all = ops.concat(openOps);
  const phases = all.filter((op) => op.kind === 'phase');
  const inPhase = (op) => phases.some((phase) => op.start >= phase.start && op.start <= phase.end);
  return {
    close_without_open: unpaired,
    outside_phase: all.filter((op) => op.kind !== 'phase' && !inPhase(op)).map((op) => op.id),
    open: [...open.values()].map((entry) => ({ id: entry.id, kind: entry.kind, start: entry.start })),
    negative: ops.filter((op) => op.negative).map((op) => op.id),
    idle: idleStretches(all),
  };
}

/** The deterministic timing summary of a ledger holding `text` (null when it is missing) against archived sprints' ledger texts; it reads no clock, so an op still open is reported open, never measured. Machine time is the phase union minus the user-wait union; unaccounted time is wall time outside every phase; `gaps.idle` lists phase stretches no op covers. */
function timingSummary(text, archivedTexts) {
  if (text === null) return { timing: null };
  const entries = timingEntries(text);
  const { open, closed, unpaired } = ledgerState(entries);
  const ops = closedOps(closed);
  const ofKind = (kind) => ops.filter((op) => op.kind === kind);
  const stamps = entries.flatMap((entry) => [entry.start, entry.end]).map(Date.parse).filter(Number.isFinite);
  const wallMs = stamps.length === 0 ? 0 : Math.max(...stamps) - Math.min(...stamps);
  const waitMs = unionMs(ofKind('user-wait'));
  const totals = phaseAndKindTotals(ops);
  return {
    timing: {
      wall_seconds: seconds(wallMs),
      machine_seconds: seconds(unionMs(ofKind('phase').concat(ofKind('user-wait'))) - waitMs),
      user_wait_seconds: seconds(waitMs),
      unaccounted_seconds: seconds(wallMs - unionMs(ofKind('phase'))),
      by_phase: totalsInSeconds(totals.by_phase),
      by_kind: totalsInSeconds(totals.by_kind),
      by_model: modelTotals(ops),
      slow: slowOps(ops),
      user_waits: ofKind('user-wait').sort((a, b) => a.start - b.start).map((op) => ({ id: op.id, gate: op.attrs.gate || null, parent: op.parent, start: new Date(op.start).toISOString(), seconds: seconds(op.ms), outcome: op.outcome })),
      rework: reworkTotals(ops),
      baseline: timingBaseline(archivedTexts),
      gaps: timingGaps(ops, open, unpaired),
    },
  };
}

function timingSummaryCommand(flags) {
  if (typeof flags.ledger !== 'string' || typeof flags.archive !== 'string') fail('--ledger <path> and --archive <archived sprints dir> required');
  const sprints = fs.existsSync(flags.archive) ? fs.readdirSync(flags.archive, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort() : [];
  const archived = sprints.map((sprint) => path.join(flags.archive, sprint, TIMING_LEDGER)).filter((file) => fs.existsSync(file)).map((file) => fs.readFileSync(file, 'utf8'));
  return timingSummary(fs.existsSync(flags.ledger) ? fs.readFileSync(flags.ledger, 'utf8') : null, archived);
}

/** Every Markdown heading outside fenced code blocks: its line index, level and exact text. A fence closes only on its opener's character, at least the opener's length, with nothing but whitespace after (CommonMark). */
function markdownHeadings(lines) {
  const headings = [];
  let fence = null;
  lines.forEach((line, index) => {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && /^[ \t]*$/.test(marker[2])) fence = null;
      return;
    }
    if (marker && !(marker[1][0] === '`' && marker[2].includes('`'))) {
      fence = marker[1];
      return;
    }
    const match = line.match(/^(#{1,6})[ \t]+(.*?)[ \t]*$/);
    if (match) headings.push({ index, level: match[1].length, text: match[2] });
  });
  return headings;
}

/** The section of `text` whose heading text is exactly `heading`: the heading line through the line before the next heading of the same or higher level, LF-normalized. Zero or several matches fail. */
function markdownSection(text, heading) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n');
  const headings = markdownHeadings(lines);
  const matches = headings.filter((entry) => entry.text === heading);
  if (matches.length !== 1) fail(`heading "${heading}": ${matches.length} matches`);
  const [start] = matches;
  const end = headings.find((entry) => entry.index > start.index && entry.level <= start.level);
  return `${lines.slice(start.index, end ? end.index : lines.length).join('\n')}\n`;
}

function refFile(ref) {
  const cut = ref.indexOf('#');
  return cut === -1 ? ref : ref.slice(0, cut);
}

/** The refs the grant table in `tableText` (providers.md) gives `role` in `phase`: every row of the role — a tier variant reads as its base agent — whose phase is `phase` or `*`, in table order, a repeated ref keeping its first occurrence. Tier-variant suffixes are owned by sync.js, required lazily so role-free commands never load it. */
function contextRefs(tableText, role, phase) {
  const blocks = [...markdownSection(tableText, CONTEXT_SECTION).matchAll(/^```json\n([\s\S]*?)\n```$/gm)];
  if (blocks.length !== 1) fail(`"${CONTEXT_SECTION}" must hold one json block, found ${blocks.length}`);
  const rows = JSON.parse(blocks[0][1]);
  if (!Array.isArray(rows) || rows.some((row) => !row || typeof row.role !== 'string' || typeof row.phase !== 'string')) fail('grant rows must be {role, phase, refs}');
  const { VARIANT_SUFFIXES } = require('./sync.js');
  const base = role.replace(new RegExp(`-(${VARIANT_SUFFIXES.join('|')})$`), '');
  const matched = rows.filter((row) => row.role === base && (row.phase === '*' || row.phase === phase));
  if (matched.length === 0) fail(`no grant row for role "${role}" in phase "${phase}"`);
  return [...new Set(matched.flatMap((row) => stringArray(row.refs, `refs of ${row.role} ${row.phase}`)))];
}

/** The context bundle: per ref, one `<!-- <ref> -->` line, then its section — or the whole file for a ref without `#` — in ref order. `files` maps each repo path to its text, null when absent; any unresolved ref fails. */
function contextBundle(refs, files) {
  return refs.map((ref) => {
    const text = files[refFile(ref)];
    if (typeof text !== 'string') fail(`ref "${ref}": file not found`);
    if (ref === refFile(ref)) return `<!-- ${ref} -->\n${text.replace(/\r\n/g, '\n').replace(/\n?$/, '\n')}`;
    try {
      return `<!-- ${ref} -->\n${markdownSection(text, ref.slice(ref.indexOf('#') + 1))}`;
    } catch (error) {
      return fail(`ref "${ref}": ${error.message}`);
    }
  }).join('');
}

function sectionCommand(flags) {
  if (typeof flags.file !== 'string' || typeof flags.heading !== 'string') fail('--file <path> and --heading <text> required');
  return markdownSection(fs.readFileSync(flags.file, 'utf8'), flags.heading);
}

/** Builds the bundle for `--role` in `--phase` and writes it to `--out` only once every ref resolved. */
function contextCommand(flags) {
  if (typeof flags.role !== 'string' || typeof flags.phase !== 'string' || typeof flags.out !== 'string') fail('--role <agent|orchestrator>, --phase <phase> and --out <file> required');
  const root = path.join(__dirname, '..');
  const refs = contextRefs(fs.readFileSync(path.join(__dirname, 'rules', 'providers.md'), 'utf8'), flags.role, flags.phase);
  const files = Object.fromEntries([...new Set(refs.map(refFile))].map((file) => [file, fs.existsSync(path.join(root, file)) ? fs.readFileSync(path.join(root, file), 'utf8') : null]));
  const bundle = contextBundle(refs, files);
  fs.writeFileSync(flags.out, bundle, 'utf8');
  return { out: flags.out, refs: refs.length, bytes: Buffer.byteLength(bundle) };
}

/** Reads one PR's check state as `pass`, `pending`, `fail` or `none`; any other `gh` failure, unparseable or non-array output included, throws. */
function readChecks(pr) {
  const result = spawnSync('gh', ['pr', 'checks', String(pr), '--json', 'bucket'], { encoding: 'utf8', timeout: CHECKS_READ_TIMEOUT_MS, windowsHide: true });
  if (result.error) fail(`gh pr checks ${pr} failed: ${result.error.message}`);
  if (/no checks reported/.test(result.stderr || '')) return 'none';
  let rows = null;
  try {
    rows = JSON.parse(result.stdout);
  } catch (error) {
    fail(`gh pr checks ${pr} failed: ${error.message}; ${(result.stderr || '').trim()}`);
  }
  if (!Array.isArray(rows)) fail(`gh pr checks ${pr} failed: output is not a check array`);
  if (rows.length === 0) return 'none';
  const buckets = rows.map((row) => row.bucket);
  if (buckets.some((bucket) => CHECK_FAIL_BUCKETS.includes(bucket))) return 'fail';
  return buckets.includes('pending') ? 'pending' : 'pass';
}

/** Polls `read` until checks settle: `fail` and `pass` return at once, `none` past the grace and `pending` past the limit give up. `read`, `sleep` and `now` are injected so the bounds stay deterministic. */
async function waitForChecks({ read, sleep, now }) {
  const start = now();
  for (;;) {
    const state = read();
    const elapsed = now() - start;
    if (state === 'fail' || state === 'pass') return state;
    if (state === 'none' && elapsed >= CHECKS_GRACE_MS) return 'none';
    if (state === 'pending' && elapsed >= CHECKS_LIMIT_MS) return 'timeout';
    await sleep(CHECKS_POLL_MS);
  }
}

/** Test-plan text whose one `Entry log` row for entry `entry` (a row opening with that number alone) has its second cell, `HEAD analysed`, set to `head`; no such row, or several, fails. */
function fillHeadAnalysed(text, entry, head) {
  const row = new RegExp(`^(\\|[ \\t]*${entry}[ \\t]*\\|)[^|\\n]*(\\|[^\\n]*)$`, 'gm');
  const rows = (text.match(row) || []).length;
  if (rows !== 1) fail(`test plan holds ${rows} Entry log rows for entry ${entry}, expected 1`);
  return text.replace(row, `$1 ${head} $2`);
}

/** Closes an impl-test entry: fills its `Entry log` `HEAD analysed` with the current short HEAD and appends `--line`, dated `now`, to the decisions log; both inputs are validated before either file is written. */
function implTestClose(flags, now = new Date()) {
  const missing = ['test-plan', 'entry', 'decisions', 'line'].filter((name) => typeof flags[name] !== 'string');
  if (missing.length > 0) fail(`impl-test-close requires ${missing.map((name) => `--${name}`).join(', ')}`);
  if (!/^[1-9]\d*$/.test(flags.entry)) fail('--entry <positive integer> required');
  if (flags.line.trim() === '' || /[\r\n]/.test(flags.line)) fail('--line must be one non-empty line');
  const head = runGit(['rev-parse', '--short=8', 'HEAD']).trim();
  const filled = fillHeadAnalysed(fs.readFileSync(flags['test-plan'], 'utf8'), flags.entry, head);
  const log = fs.readFileSync(flags.decisions, 'utf8');
  fs.writeFileSync(flags['test-plan'], filled, 'utf8');
  fs.appendFileSync(flags.decisions, `${log === '' || log.endsWith('\n') ? '' : '\n'}- ${now.toISOString().slice(0, 10)} — ${flags.line}\n`, 'utf8');
  return { entry: Number(flags.entry), head };
}

const DESIGN_KEY_LINE = /^([A-Za-z0-9_.-]+):(?: +(.*))?$/;
const DESIGN_PLAIN_FORBIDDEN_START = /^[[{&*!|>%@`]/;
const DESIGN_CSS_UNSAFE = /[;{}<>]/;
const DESIGN_REFERENCE = /^\{([A-Za-z0-9_.-]+)\}$/;
const DESIGN_COLOR = /^#[0-9a-f]{3,8}$/i;
const DESIGN_DIMENSION = /^-?\d*\.?\d+(?:px|rem|em|%|pt|vh|vw|ch)$/i;
const DESIGN_REGIONS = { tokens: 'asd:tokens', vars: 'asd:vars' };

/** One scalar of a DESIGN.md front-matter line: a quoted or plain string, trailing comment dropped; flow collections, anchors, tags and block scalars fail naming `where`. */
function designScalar(rest, where) {
  if (/^["']/.test(rest)) {
    const quoted = rest[0] === '"' ? /^"((?:[^"\\]|\\.)*)"\s*(?:#.*)?$/.exec(rest) : /^'((?:[^']|'')*)'\s*(?:#.*)?$/.exec(rest);
    if (!quoted) fail(`${where}: unterminated or trailing-text quoted scalar`);
    if (rest[0] === "'") return quoted[1].replace(/''/g, "'");
    try {
      return JSON.parse(`"${quoted[1]}"`);
    } catch (error) {
      return fail(`${where}: unsupported escape in quoted scalar`);
    }
  }
  if (DESIGN_PLAIN_FORBIDDEN_START.test(rest)) fail(`${where}: unsupported YAML (flow collection, anchor, tag or block scalar); only nested maps of scalars are supported`);
  return rest.replace(/\s+#.*$/, '').trim();
}

/** Leaf tokens `{path, value, line}` of a DESIGN.md front matter in document order; only nested maps of scalars parse, anything else fails naming its line. */
function designLeaves(text, file) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);
  if (lines[0].trimEnd() !== '---') fail(`${file}:1: front matter must open with ---`);
  const close = lines.findIndex((line, index) => index > 0 && line.trimEnd() === '---');
  if (close === -1) fail(`${file}: front matter is not closed with ---`);
  const leaves = [];
  const stack = [{ indent: 0, path: [], keys: new Set() }];
  let pending = null;
  for (let index = 1; index < close; index += 1) {
    const where = `${file}:${index + 1}`;
    const line = lines[index];
    if (/^\s*(?:#.*)?$/.test(line)) continue;
    if (/^ *\t/.test(line)) fail(`${where}: tab indentation is not valid YAML`);
    const indent = line.length - line.trimStart().length;
    const match = DESIGN_KEY_LINE.exec(line.trim());
    if (!match) fail(`${where}: unsupported YAML; expected "key: value" or "key:" (nested maps of scalars only)`);
    if (pending && indent > pending.indent) {
      stack.push({ indent, path: pending.path, keys: new Set() });
    } else if (!pending && indent > stack[stack.length - 1].indent) {
      fail(`${where}: unexpected indentation (multi-line scalar or unsupported construct)`);
    }
    pending = null;
    while (indent < stack[stack.length - 1].indent) stack.pop();
    const frame = stack[stack.length - 1];
    if (indent !== frame.indent) fail(`${where}: inconsistent indentation`);
    if (frame.keys.has(match[1])) fail(`${where}: duplicate key "${match[1]}"`);
    frame.keys.add(match[1]);
    const rest = (match[2] || '').trim();
    const keyPath = [...frame.path, match[1]];
    if (rest === '' || rest.startsWith('#')) {
      pending = { indent, path: keyPath };
      continue;
    }
    leaves.push({ path: keyPath.join('.'), value: designScalar(rest, where), line: index + 1 });
  }
  return leaves;
}

/** Token-reference `Type` chip for one leaf: reference, color, dimension, else typography (font family, weight, line height and other typographic scalars). */
function designTokenType(leaf) {
  if (DESIGN_REFERENCE.test(leaf.value)) return 'reference';
  if (DESIGN_COLOR.test(leaf.value)) return 'color';
  if (leaf.path.startsWith('typography.')) return 'typography';
  return DESIGN_DIMENSION.test(leaf.value) ? 'dimension' : 'typography';
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function designVarName(tokenPath) {
  return `--${tokenPath.replace(/\./g, '-')}`;
}

function designCssValue(leaf, file) {
  const reference = DESIGN_REFERENCE.exec(leaf.value);
  const value = reference ? `var(${designVarName(reference[1])})` : leaf.value;
  if (DESIGN_CSS_UNSAFE.test(value)) fail(`${file}:${leaf.line}: value of ${leaf.path} holds a character unsafe in a CSS declaration`);
  return value;
}

/** Text with the content between the `name` start/end markers replaced by `content`; the markers must each appear exactly once, start first. */
function replaceMarkedRegion(html, name, content, eol, file) {
  const start = `<!-- ${name}:start -->`;
  const end = `<!-- ${name}:end -->`;
  const from = html.indexOf(start);
  const to = html.indexOf(end);
  if (from === -1 || to === -1 || to < from || html.indexOf(start, from + 1) !== -1 || html.indexOf(end, to + 1) !== -1) fail(`${file}: needs exactly one ${start} ... ${end} marker pair`);
  return `${html.slice(0, from + start.length)}${eol}${content}${eol}${html.slice(to)}`;
}

/** Rebuilds the token-reference rows and the `:root` CSS variables of `--html` from `--design`'s grouped tokens (top-level scalars such as `name` are metadata), touching only the two marked regions. */
function designTokensCommand(flags) {
  if (typeof flags.design !== 'string' || typeof flags.html !== 'string') fail('--design <DESIGN.md> and --html <design-system.html> required');
  const leaves = designLeaves(fs.readFileSync(flags.design, 'utf8'), flags.design).filter((leaf) => leaf.path.includes('.'));
  if (leaves.length === 0) fail(`${flags.design}: front matter holds no tokens`);
  const html = fs.readFileSync(flags.html, 'utf8');
  const eol = html.includes('\r\n') ? '\r\n' : '\n';
  const rows = leaves.map((leaf) => `      <tr><td><code>${escapeHtml(leaf.path)}</code></td><td>${escapeHtml(leaf.value)}</td><td><span class="chip area">${designTokenType(leaf)}</span></td></tr>`);
  const declarations = leaves.map((leaf) => `  ${designVarName(leaf.path)}: ${designCssValue(leaf, flags.design)};`);
  const withRows = replaceMarkedRegion(html, DESIGN_REGIONS.tokens, rows.join(eol), eol, flags.html);
  const rebuilt = replaceMarkedRegion(withRows, DESIGN_REGIONS.vars, [':root {', ...declarations, '}'].join(eol), eol, flags.html);
  fs.writeFileSync(flags.html, rebuilt, 'utf8');
  return { tokens: leaves.length };
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

async function main(argv) {
  const command = argv[2];
  if (command === 'timing' || command === 'timing-recover') return timingCommand(command, argv.slice(3));
  if (command === 'commit-check') return commitCheckCommand(argv.slice(3));
  const flags = parseFlagArgs(argv.slice(3), ['self-hosting', 'late', 'single']);
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
  if (command === 'persist-review') {
    if (typeof flags.in !== 'string' || typeof flags['out-dir'] !== 'string') fail('--in <path> and --out-dir <iteration dir> required');
    const result = persistReview({ phase: flags.phase, reviewer: flags.reviewer, text: fs.readFileSync(flags.in, 'utf8'), outDir: flags['out-dir'], late: flags.late === true, manifest: flags.manifest, floor: flags.floor });
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
  if (command === 'memory-check') {
    const violations = memoryCheck(flags);
    process.stdout.write(JSON.stringify(violations) + '\n');
    return violations.length === 0 ? 0 : 1;
  }
  if (command === 'impl-test-close') {
    process.stdout.write(JSON.stringify(implTestClose(flags)) + '\n');
    return 0;
  }
  if (command === 'design-tokens') {
    process.stdout.write(JSON.stringify(designTokensCommand(flags)) + '\n');
    return 0;
  }
  if (command === 'draft-snapshot') {
    if (typeof flags.files !== 'string' || typeof flags.out !== 'string') fail('--files <path> and --out <iteration dir> required');
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
  if (command === 'retro-candidates') {
    if (typeof flags.sprints !== 'string' || typeof flags.backlog !== 'string') fail('--sprints <dir> and --backlog <path> required');
    process.stdout.write(JSON.stringify(retroCandidates(flags.sprints, flags.backlog, flags['self-hosting'] === true)) + '\n');
    return 0;
  }
  if (command === 'scratch-dir') {
    process.stdout.write(`${scratchDir()}\n`);
    return 0;
  }
  if (command === 'rotate-decisions') {
    process.stdout.write(JSON.stringify(rotateDecisions(flags)) + '\n');
    return 0;
  }
  if (command === 'section' || command === 'context') {
    try {
      process.stdout.write(command === 'section' ? sectionCommand(flags) : JSON.stringify(contextCommand(flags)) + '\n');
      return 0;
    } catch (error) {
      process.stderr.write(`${error.message}\n`);
      return 1;
    }
  }
  if (command === 'agent-liveness') return agentLivenessCommand(flags);
  if (command === 'timing-summary') {
    process.stdout.write(JSON.stringify(timingSummaryCommand(flags)) + '\n');
    return 0;
  }
  if (command === 'checks-wait') {
    if (!/^[1-9]\d*$/.test(flags.pr)) fail('--pr <positive integer> required');
    const checks = await waitForChecks({ read: () => readChecks(flags.pr), sleep: delay, now: Date.now });
    process.stdout.write(JSON.stringify({ checks }) + '\n');
    return checks === 'pass' || checks === 'none' ? 0 : 1;
  }
  fail('usage: emit-manifest, manifest-digest, validate-ledger, persist-review, external-preflight, external-record-failure, route-task, defect-stalemate, memory-check, commit-check, impl-test-close, design-tokens, draft-snapshot, review-waves, wave-files, retro-candidates, scratch-dir, rotate-decisions, section, context, agent-liveness, timing, timing-recover, timing-summary, or checks-wait');
}

if (require.main === module) {
  main(process.argv).then((code) => { process.exitCode = code; }, (error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 2; });
}

module.exports = { AUDIT_BATCH_THRESHOLD_FILES, CHECKS_GRACE_MS, CHECKS_LIMIT_MS, CHECKS_POLL_MS, COMBINED_REVIEWER, EXTERNAL_REVIEWER, INTERNAL_REVIEWERS, LARGE_WAVE_FILES, LEDGER_NA_SHAPE, LEDGER_ROW_EXAMPLE, LEDGER_VOCABULARY, MAX_REVIEW_WAVES, NA_PREDICATES, SLOW_MINUTES, SLOW_TOP_N, WAVE_THRESHOLD_BYTES, WAVE_THRESHOLD_FILES, WAVE_THRESHOLD_LINES, agentLiveness, backlogRows, buildInvocation, contextBundle, contextRefs, coverageManifestDigest, defectStalemate, draftSnapshot, emitCoverageManifest, externalPreflight, isDocumentation, isTest, loadWorkflow, markdownSection, numstatLines, persistReview, recordExternalFailure, retroCandidates, readChecks, retroRows, reviewFindings, reviewWaveCount, reviewerFiles, reviewerKeys, routeTask, timingAppend, timingRecover, timingSummary, validateCoverageLedger, validateWaveDivision, waitForChecks, waveFiles, fingerprint };
