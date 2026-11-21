'use strict';

// runtime.js task routing, external-review preflight, negative cache and command invocation

const { assert, fs, path, execFileSync, runtime, REPO_ROOT, tests, test, FIXTURE_ROOT, mkTempDir, runtimeCli, runtimeCliResult, readRepoFile, canonText, sectionOf, stepOf, spans, runtimeSpawnAsync } = require('./lib.js');

/** A path to the host's node under a second spelling, so a fingerprint over the command differs while the same executable runs. */
const NODE_ALTERNATE_SPELLING = `${path.dirname(process.execPath)}${path.sep}${path.sep}${path.basename(process.execPath)}`;

/** Runs `body` with every `node` spawned by it exiting 0 at once, so `process.execPath` stands in for a provider CLI whose version and auth probes both pass, without the PowerShell hop a `.cmd` stand-in pays on win32 (the `.cmd` route has its own test below). */
function withExitZeroNode(body) {
  const preload = path.join(FIXTURE_ROOT, 'exit-zero.js');
  fs.writeFileSync(preload, 'process.exit(0);\n', 'utf8');
  const saved = process.env.NODE_OPTIONS;
  process.env.NODE_OPTIONS = `--require "${preload.replace(/\\/g, '/')}"`;
  try {
    return body();
  } finally {
    if (saved === undefined) delete process.env.NODE_OPTIONS;
    else process.env.NODE_OPTIONS = saved;
  }
}

test('AC-10/11: routing is monotonic and only verified deterministic work is a command', () => {
  const base = { objectiveInputs: true, failedObjectiveCheck: false, risks: [], correctionAttempts: 0 };
  assert.deepStrictEqual(runtime.routeTask({ ...base, kind: 'command', checks: ['deterministic-state'] }).execution, 'command');
  assert.deepStrictEqual(runtime.routeTask({ ...base, kind: 'mechanical', checks: ['deterministic-check', 'exhaustive-match-validation'] }).execution, 'agent');
  assert.strictEqual(runtime.routeTask({ ...base, kind: 'standard', checks: [] }).tier, 'standard');
  assert.strictEqual(runtime.routeTask({ ...base, kind: 'mechanical', checks: ['deterministic-check', 'exhaustive-match-validation'], priorTier: 'critical' }).tier, 'standard', 'the retired critical tier no longer exists - a legacy priorTier critical reads standard');
  const mechanicalChecks = ['deterministic-check', 'exhaustive-match-validation'];
  assert.strictEqual(runtime.routeTask({ ...base, kind: 'mechanical', checks: mechanicalChecks, failedObjectiveCheck: true, correctionAttempts: 0 }).tier, 'mechanical', 'a single failed objective check with zero correction attempts must not yet forbid mechanical');
  assert.notStrictEqual(runtime.routeTask({ ...base, kind: 'mechanical', objectiveInputs: false, checks: ['deterministic-check', 'exhaustive-match-validation'] }).tier, 'mechanical', 'a mechanical claim without objective inputs must never route mechanical');
  assert.strictEqual(runtime.routeTask({ ...base, kind: 'command', checks: [] }).execution, 'agent', 'a command with no deterministic-state check is not deterministic and must not execute as a bare command');
  assert.strictEqual(runtime.routeTask({ ...base, kind: 'command', objectiveInputs: false, checks: ['deterministic-state'] }).execution, 'agent', 'a command without objective inputs must never auto-execute even with the deterministic-state check present');
  assert.strictEqual(runtime.routeTask({ ...base, kind: 'standard', checks: [], failedObjectiveCheck: true, correctionAttempts: 0 }).tier, 'standard', 'a single failed objective check with zero correction attempts must not yet escalate');
  assert.deepStrictEqual(runtime.routeTask({ ...base, kind: 'mechanical', checks: ['deterministic-check', 'exhaustive-match-validation'], risks: ['auth'] }), { tier: 'standard', execution: 'agent', reason: 'risk:auth', raiseEffort: false }, 'any named risk must forbid mechanical regardless of otherwise-mechanical evidence');
});

test('AC-3/4/5, sprint-021 AC-11: preflight permits only fixed local probes and negative cache is bounded - a provider reset capped at one hour, one hour by default - and expires', () => {
  const root = mkTempDir();
  const cachePath = path.join(root, 'external-cache.json');
  const input = { provider: 'codex', command: process.execPath, model: 'gpt-6-sol', cachePath, now: 1000 };
  assert.throws(() => runtime.externalPreflight({ ...input, provider: 'unknown' }), /provider/);
  assert.throws(() => runtime.externalPreflight({ ...input, authArgs: ['exec', 'paid prompt'] }), /authArgs/);
  const fingerprint = 'a'.repeat(64);
  for (const retryAfter of [1000, Infinity, NaN]) {
    assert.throws(() => runtime.recordExternalFailure({ fingerprint, status: 'quota', cachePath, now: 1000, retryAfter }), /bounded future/, `retryAfter ${retryAfter}: a reset at or before now, or no finite reset, is refused`);
  }
  const hourMs = 3600000;
  const stored = (retryAfter) => {
    const clampPath = path.join(root, 'clamp-cache.json');
    runtime.recordExternalFailure({ fingerprint, status: 'quota', cachePath: clampPath, now: 1000, ...(retryAfter === undefined ? {} : { retryAfter }) });
    return JSON.parse(fs.readFileSync(clampPath, 'utf8')).entries[fingerprint].retry_after;
  };
  assert.strictEqual(stored(1000 + hourMs * 5), 1000 + hourMs, 'sprint-021 AC-11: a provider-reported reset past one hour is capped at one hour, never refused - a refusal left the quota failure unrecorded and the next preflight re-dispatched into it');
  assert.strictEqual(stored(undefined), 1000 + hourMs, 'sprint-021 AC-11: with no provider-reported reset the retry-after is one hour, never the 5-minute default that re-hit a quota minutes after it tripped');
  assert.strictEqual(stored(1000 + 90000), 1000 + 90000, 'sprint-021 AC-11: a reported reset inside the hour is kept as reported');
  const preflight = (overrides) => withExitZeroNode(() => runtime.externalPreflight({ ...input, ...overrides }));
  const ready = preflight();
  assert.strictEqual(ready.status, 'local-ready');
  const externalRows = canonText('.asd/rules/external-review.md').split(/\r?\n/);
  const hostRow = (prefix) => externalRows.find((line) => line.startsWith(prefix)) || '';
  assert.ok(hostRow('| Claude Code, any').includes('< <prompt file>') && !hostRow('| Claude Code, any').includes("<<'EOF'") && hostRow('| Codex, `win32`').includes("@'") && hostRow('| Codex, any other').includes("<<'EOF'") && ready.platform === process.platform, `sprint-013 AC-16 (COR-1-1), sprint-034 AC-8: External Review keys stdin syntax on the host shell plus the preflight output's \`platform\` (external-review.md "OS-specific invocation") - Claude Code a prompt file redirected into stdin, Codex here-string on win32 else heredoc - so the Claude Code row must name the file redirect and no heredoc, the Codex win32 row the here-string, the other Codex row the heredoc, and the preflight must report the host platform under that name - got ${JSON.stringify(ready.platform)}`);
  runtime.recordExternalFailure({ fingerprint: ready.fingerprint, status: 'quota', cachePath, now: 1000, retryAfter: 1001 });
  assert.strictEqual(preflight().status, 'negative-cache');
  assert.strictEqual(preflight({ now: 1001 }).status, 'local-ready', 'an expired entry must be ignored in-memory on read, even before any write persists the pruning');
  assert.ok(Object.hasOwn(JSON.parse(fs.readFileSync(cachePath, 'utf8')).entries, ready.fingerprint), 'a read-only preflight call must not itself rewrite the cache file - the expired entry is still on disk');
  runtime.recordExternalFailure({ fingerprint: 'b'.repeat(64), status: 'quota', cachePath, now: 1001, retryAfter: 1002 });
  assert.ok(!Object.hasOwn(JSON.parse(fs.readFileSync(cachePath, 'utf8')).entries, ready.fingerprint), 'the expired entry is pruned from disk on the NEXT actual write, not before');
});

test('AC-5: negative-cache recovers when the fingerprint changes because model, command, or credential state changed - not only on TTL expiry', () => {
  const root = mkTempDir();
  const cachePath = path.join(root, 'external-cache.json');
  const credentialPath = path.join(root, 'credential.json');
  fs.writeFileSync(credentialPath, '{"token":"x"}', 'utf8');

  const input = { provider: 'codex', command: process.execPath, model: 'gpt-6-sol', credentialPath, cachePath, now: 1000 };
  const preflight = (overrides) => withExitZeroNode(() => runtime.externalPreflight({ ...input, ...overrides }));
  const ready = preflight();
  assert.strictEqual(ready.status, 'local-ready');
  runtime.recordExternalFailure({ fingerprint: ready.fingerprint, status: 'quota', cachePath, now: 1000, retryAfter: 1000 + 60000 });
  assert.strictEqual(preflight().status, 'negative-cache', 'sanity: the exact same input must hit the cached entry');

  assert.strictEqual(preflight({ model: 'gpt-6-luna' }).status, 'local-ready', 'a different model must produce a different fingerprint, never reuse a stale negative-cache entry');
  assert.strictEqual(preflight({ command: NODE_ALTERNATE_SPELLING }).status, 'local-ready', 'a different command must produce a different fingerprint');

  fs.writeFileSync(credentialPath, '{"token":"rotated"}', 'utf8');
  const stat = fs.statSync(credentialPath);
  fs.utimesSync(credentialPath, new Date(stat.atimeMs + 1000), new Date(stat.mtimeMs + 1000));
  assert.strictEqual(preflight().status, 'local-ready', 'a rotated credential (changed mtime) must produce a different auth generation and recover, not stay stuck on the old negative-cache entry');
});

test('AC-5: the persisted negative-cache entry never carries anything beyond {status, retry_after} - no secrets or command output', () => {
  const root = mkTempDir();
  const cachePath = path.join(root, 'external-cache.json');
  const ready = withExitZeroNode(() => runtime.externalPreflight({ provider: 'codex', command: process.execPath, model: 'gpt-6-sol', cachePath, now: 1000 }));
  runtime.recordExternalFailure({ fingerprint: ready.fingerprint, status: 'quota', cachePath, now: 1000, retryAfter: 1000 + 60000 });
  const persisted = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  const entry = persisted.entries[ready.fingerprint];
  assert.deepStrictEqual(Object.keys(entry).sort(), ['retry_after', 'status'], 'the persisted entry must carry exactly {status, retry_after} - no secrets, command output, or other input echoed back');
});

test('buildInvocation: direct path keeps a metacharacter-containing command as a literal argv element (D-2 security property)', () => {
  const direct = runtime.buildInvocation('win32', '/path/with;metachar/cmd', ['a b']);
  assert.deepStrictEqual(direct, { file: '/path/with;metachar/cmd', args: ['a b'] });
  assert.strictEqual(direct.input, undefined, 'the direct shape must never carry a shell-interpreted input string');
});

test('buildInvocation: .cmd/.bat/.ps1 on win32 route through PowerShell, metacharacters reach only the JSON stdin payload', () => {
  for (const ext of ['cmd', 'bat', 'ps1']) {
    const command = `x.${ext}`;
    const plan = runtime.buildInvocation('win32', command, ['a']);
    assert.strictEqual(plan.file, 'powershell.exe', `${ext}: must dispatch through powershell.exe`);
    assert.ok(Array.isArray(plan.args) && plan.args.every((arg) => typeof arg === 'string' && !arg.includes(command)), `${ext}: fixed PowerShell args must never interpolate the command`);
    assert.strictEqual(plan.input, JSON.stringify({ command, args: ['a'] }), `${ext}: command/args travel only via JSON stdin, never an interpolated command string`);
  }
});

test('buildInvocation: viaPowerShell forces the PowerShell shape on win32 regardless of extension (the ENOENT-retry path, previously unreachable off Windows)', () => {
  const command = 'plain-exe-with;metachar';
  const plan = runtime.buildInvocation('win32', command, ['a'], true);
  assert.strictEqual(plan.file, 'powershell.exe');
  assert.ok(plan.args.every((arg) => typeof arg === 'string' && !arg.includes(command)), 'the metacharacter-bearing command must never appear inside an argument string');
  assert.strictEqual(plan.input, JSON.stringify({ command, args: ['a'] }));
});

test('buildInvocation: non-win32 platforms always stay direct, even when viaPowerShell is true', () => {
  for (const platform of ['linux', 'darwin']) {
    const plan = runtime.buildInvocation(platform, 'x.cmd', ['a'], true);
    assert.deepStrictEqual(plan, { file: 'x.cmd', args: ['a'] }, `${platform}: the PowerShell fallback is locked to win32`);
  }
});

test('AC-4: Windows .cmd preflight executes a metacharacter-containing path literally (end-to-end bonus, buildInvocation above is the host-independent evidence)', () => {
  if (process.platform !== 'win32') {
    console.log('  (skipped: end-to-end spawn proof for the .cmd/metacharacter PowerShell fallback branch - only runs on win32; buildInvocation tests above cover the branch shape on any host)');
    return;
  }
  const root = fs.mkdtempSync(path.join(FIXTURE_ROOT, 'asd & runtime-'));
  const shim = path.join(root, 'external & shim.cmd');
  fs.writeFileSync(shim, '@echo off\r\nexit /b 0\r\n', 'utf8');
  const result = runtime.externalPreflight({ provider: 'codex', command: shim, model: 'gpt-6-sol', cachePath: path.join(root, 'cache.json') });
  assert.strictEqual(result.status, 'local-ready');
});

test('runtime.js CLI: external-preflight exits 1 on command-unavailable', () => {
  const root = mkTempDir();
  const inputPath = path.join(root, 'input.json');
  fs.writeFileSync(inputPath, JSON.stringify({ provider: 'codex', command: path.join(root, 'does-not-exist'), model: 'gpt-6-sol', cachePath: path.join(root, 'cache.json') }), 'utf8');

  let error = null;
  let stdout = '';
  try {
    stdout = runtimeCli(['external-preflight', '--input', inputPath]);
  } catch (e) {
    error = e;
    stdout = e.stdout;
  }
  assert.ok(error, 'a missing/unavailable CLI must exit non-zero, not report local-ready');
  assert.strictEqual(error.status, 1);
  assert.strictEqual(JSON.parse(stdout).status, 'command-unavailable');
});

test('Sprint 038 AC-4/AC-7: named Codex review profiles use a separate route and only probe CLI version', () => {
  const root = mkTempDir();
  const profile = path.join(root, 'routerai.config.toml');
  const trace = path.join(root, 'probes.jsonl');
  const windows = process.platform === 'win32';
  const command = path.join(root, windows ? 'review.cmd' : 'review');
  const script = windows
    ? '@echo off\r\necho %*>>"%ASD_TEST_CLI_TRACE%"\r\necho %ASD_TEST_CLI_VERSION%\r\n'
    : '#!/bin/sh\nprintf "%s\\n" "$*" >> "$ASD_TEST_CLI_TRACE"\nprintf "%s\\n" "$ASD_TEST_CLI_VERSION"\n';
  fs.writeFileSync(command, script, { mode: 0o700 });
  const saved = { ...process.env };
  process.env.CODEX_HOME = root;
  process.env.ASD_TEST_CLI_TRACE = trace;
  process.env.ASD_TEST_CLI_VERSION = 'codex-cli 0.134.0';
  const input = { host: 'codex', codexProfile: 'routerai', codexCommand: command, cachePath: path.join(root, 'cache.json'), now: 1000 };
  try {
    assert.strictEqual(runtime.externalPreflight(input).status, 'profile-unavailable');
    const model = 'model = "~anthropic/claude-opus-latest"\nmodel_reasoning_effort = "medium"\n';
    fs.writeFileSync(profile, `${model}[irrelevant]\nmodel_provider = "routerai"\n`);
    assert.strictEqual(runtime.externalPreflight(input).status, 'profile-invalid');
    fs.writeFileSync(profile, `${model}model_provider = "routerai"\n`);
    process.env.ASD_TEST_CLI_VERSION = 'codex-cli 0.133.9';
    assert.strictEqual(runtime.externalPreflight(input).status, 'profile-cli-unsupported');
    process.env.ASD_TEST_CLI_VERSION = 'codex-cli 0.134.0';
    const ready = runtime.externalPreflight(input);
    assert.deepStrictEqual([ready.status, ready.route], ['local-ready', {
      provider: 'codex', command, profile: 'routerai', model: '~anthropic/claude-opus-latest',
      args: ['exec', '--profile', 'routerai', '--model=~anthropic/claude-opus-latest', '-c', 'model_provider="routerai"', '-c', 'model_reasoning_effort="medium"', '-c', 'approval_policy="never"', '--sandbox', 'read-only', '--ephemeral', '-'],
    }]);
    assert.deepStrictEqual(fs.readFileSync(trace, 'utf8').trim().split(/\r?\n/), ['--version', '--version']);
    const defaultRoute = withExitZeroNode(() => runtime.externalPreflight({ ...input, codexProfile: '', claudeCommand: process.execPath }));
    assert.deepStrictEqual([defaultRoute.status, defaultRoute.route.provider, defaultRoute.route.command], ['local-ready', 'claude', process.execPath]);
  } finally {
    for (const key of ['CODEX_HOME', 'ASD_TEST_CLI_TRACE', 'ASD_TEST_CLI_VERSION']) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  }
});

test('Sprint 038 AC-1/AC-2: config-check requires explicit valid values and names missing, duplicate and invalid keys', async () => {
  const root = mkTempDir();
  const config = path.join(root, 'config.yaml');
  const template = canonText('.asd/templates/t_config.yaml');
  const check = (settings) => {
    fs.writeFileSync(config, settings);
    return runtimeSpawnAsync(['config-check', '--config', config]);
  };
  const complete = await check(template);
  assert.deepStrictEqual([complete.status, JSON.parse(complete.stdout)], [0, { ok: true, missing: [], duplicates: [], invalid: [] }]);
  const incomplete = await check(template.replace(/^  codex_profile:.*$/m, '').replace(/^  claude_design:.*$/m, '  claude_design: [redacted-value]\n  claude_design: disabled'));
  const { missing, duplicates, invalid } = JSON.parse(incomplete.stdout);
  assert.deepStrictEqual([incomplete.status, missing, duplicates, invalid.map(({ path: key }) => key)], [1, ['review.codex_profile'], ['project.claude_design'], ['project.claude_design']]);
  assert.doesNotMatch(incomplete.stdout + incomplete.stderr, /redacted-value/);
});

test('AC-10: a typed target:"artifact" risk never escalates by itself - it routes on the task\'s own evidence and only annotates the reason', () => {
  const mechanicalEvidence = { objectiveInputs: true, failedObjectiveCheck: false, correctionAttempts: 0, kind: 'mechanical', checks: ['deterministic-check', 'exhaustive-match-validation'], risks: [{ name: 'critical-config', target: 'artifact' }] };
  assert.deepStrictEqual(
    runtime.routeTask(mechanicalEvidence),
    { tier: 'mechanical', execution: 'agent', reason: 'artifact-risk:critical-config', raiseEffort: false },
    'otherwise-mechanical evidence plus an artifact risk must still route mechanical, with the reason recording that a risk was seen and deliberately not escalated'
  );
  const standardEvidence = { objectiveInputs: true, failedObjectiveCheck: false, correctionAttempts: 0, kind: 'standard', checks: [], risks: [{ name: 'critical-config', target: 'artifact' }] };
  assert.deepStrictEqual(
    runtime.routeTask(standardEvidence),
    { tier: 'standard', execution: 'agent', reason: 'artifact-risk:critical-config', raiseEffort: false },
    'standard evidence plus an artifact risk must route standard, not escalate'
  );
});

test('AC-10: the no-downgrade clamp outranks an artifact-risk reason, and any declared risk - change or artifact - forces execution:agent even for an otherwise-deterministic command', () => {
  const clamped = runtime.routeTask({
    objectiveInputs: true, failedObjectiveCheck: false, correctionAttempts: 0, kind: 'mechanical',
    checks: ['deterministic-check', 'exhaustive-match-validation'], risks: [{ name: 'critical-config', target: 'artifact' }], priorTier: 'standard',
  });
  assert.deepStrictEqual(clamped, { tier: 'standard', execution: 'agent', reason: 'no-downgrade', raiseEffort: false }, 'an artifact risk must never let a task fall out of a priorTier it already earned - the clamp reason wins over the artifact-risk reason');

  const commandBase = { objectiveInputs: true, failedObjectiveCheck: false, correctionAttempts: 0, kind: 'command', checks: ['deterministic-state'] };
  assert.strictEqual(runtime.routeTask({ ...commandBase, risks: [{ name: 'auth', target: 'change' }] }).execution, 'agent', 'a change risk on an otherwise-deterministic command must still force execution:agent');
  assert.strictEqual(runtime.routeTask({ ...commandBase, risks: [{ name: 'audit-log', target: 'artifact' }] }).execution, 'agent', 'an artifact risk on an otherwise-deterministic command must still force execution:agent - no declared risk of either kind ever auto-executes');
});

test('AC-10: routing fails closed on every malformed risks shape - a task never routes lower on invalid evidence', () => {
  const base = { objectiveInputs: true, failedObjectiveCheck: false, correctionAttempts: 0, kind: 'standard', checks: [] };
  const cases = [
    ['non-array risks', 'not-an-array', /risks must be an array of risks/],
    ['null entry', [null], /risks entry must be a name or a typed risk/],
    ['number entry', [5], /risks entry must be a name or a typed risk/],
    ['array entry', [[]], /risks entry must be a name or a typed risk/],
    ['empty name', [{ name: '', target: 'change' }], /risks entry name must be a non-empty string/],
    ['NUL-bearing name', [{ name: 'a\0b', target: 'change' }], /risks entry name must be a non-empty string/],
    ['missing target', [{ name: 'x' }], /risks entry target must be change or artifact/],
    ['unknown target', [{ name: 'x', target: 'other' }], /risks entry target must be change or artifact/],
  ];
  for (const [label, risks, message] of cases) {
    assert.throws(() => runtime.routeTask({ ...base, risks }), message, label);
  }
});

test('AC-10: a mixed array of one change risk and one artifact risk still routes standard, never mechanical, with the reason naming the change risk', () => {
  const result = runtime.routeTask({
    objectiveInputs: true, failedObjectiveCheck: false, correctionAttempts: 0, kind: 'mechanical',
    checks: ['deterministic-check', 'exhaustive-match-validation'],
    risks: [{ name: 'auth', target: 'change' }, { name: 'config-file', target: 'artifact' }],
  });
  assert.deepStrictEqual(result, { tier: 'standard', execution: 'agent', reason: 'risk:auth', raiseEffort: false }, 'a change risk anywhere in the array must win the tier and the reason over a co-occurring artifact risk');
});

test('AC-10, sprint-033 AC-4: a failed objective check with a correction attempt outranks a co-occurring artifact risk in the reason - the effort step first, the tier climb after it - so state.json.task_routing never mislabels an escalated task as merely risk-annotated', () => {
  const failedWithArtifactRisk = {
    objectiveInputs: true, failedObjectiveCheck: true, correctionAttempts: 1, kind: 'standard',
    checks: [], risks: [{ name: 'config-file', target: 'artifact' }],
  };
  assert.deepStrictEqual(runtime.routeTask(failedWithArtifactRisk), { tier: 'standard', execution: 'agent', reason: 'effort-step', raiseEffort: true }, 'a failed objective check with at least one correction attempt must win the reason over a co-occurring artifact risk, and keeps the tier for one effort step');
  assert.deepStrictEqual(runtime.routeTask({ ...failedWithArtifactRisk, effortRaised: true }), { tier: 'escalated', execution: 'agent', reason: 'failed-objective-check', raiseEffort: false }, 'the raised-effort attempt failing too climbs one tier and names the failed check');
});

test('AC-10: an artifact risk whose priorTier does not outrank the computed tier keeps the artifact-risk reason - the no-downgrade clamp must not fire merely because priorTier is set', () => {
  const result = runtime.routeTask({
    objectiveInputs: true, failedObjectiveCheck: false, correctionAttempts: 0, kind: 'mechanical',
    checks: ['deterministic-check', 'exhaustive-match-validation'], risks: [{ name: 'critical-config', target: 'artifact' }], priorTier: 'mechanical',
  });
  assert.deepStrictEqual(result, { tier: 'mechanical', execution: 'agent', reason: 'artifact-risk:critical-config', raiseEffort: false }, 'priorTier equal to the computed tier must not clamp - the reason must still name the artifact risk, not no-downgrade');
});

test('AC-10: a reserved change-risk class name declared target:"artifact" fails closed, case- and separator-normalized, without over-matching a merely-similar name', () => {
  const base = { objectiveInputs: true, failedObjectiveCheck: false, correctionAttempts: 0, kind: 'standard', checks: [] };
  const reservedAsArtifact = ['security', 'SECURITY', 'Authentication', 'migration', 'public contract', 'public-contract', 'public_contract', 'Workflow  Gate'];
  for (const name of reservedAsArtifact) {
    assert.throws(() => runtime.routeTask({ ...base, risks: [{ name, target: 'artifact' }] }), /reserved risk class is change by definition/, name);
  }
  assert.doesNotThrow(() => runtime.routeTask({ ...base, risks: [{ name: 'security', target: 'change' }] }), 'the same reserved name typed target:"change" is exactly the intended usage, never rejected');
  assert.doesNotThrow(() => runtime.routeTask({ ...base, risks: [{ name: 'security-audit-tool', target: 'artifact' }] }), 'a name that merely contains a reserved word must not be caught - the reserved check is exact-match after normalization, not substring');
  assert.doesNotThrow(() => runtime.routeTask({ ...base, risks: [{ name: 'config-file', target: 'artifact' }] }), 'a non-reserved artifact risk name must keep routing on evidence, unaffected by the new guard');
});

test('sprint-024 AC-2/AC-3/AC-4/AC-5/AC-6/AC-8/AC-9: every reserved risk class has a definition in "Plan file format", the routing rule and plan step cite it and no tier above standard exists, retro intake presents each row before its disposition and scope step 4 cites it, review diffs are exempt from the whitespace lint in .gitattributes and code-style.md §19, "Scope amendment" and impl cite each other for the review-fix then initial order, an unmeetable plan decision is met by widening the fix and dropping it is a new-or-changed-scope decision, and the fail-first mutation of a changed-rule pin restores the superseded text', () => {
  const lifecycle = '.asd/rules/sprint-lifecycle.md';
  const declaration = canonText(lifecycle).split('\n').filter((line) => line.startsWith('**Material risk declaration**') || line.startsWith('A reserved class')).join('\n');
  const reserved = [...(/const RESERVED_CHANGE_RISKS = \[([^\]]+)\]/.exec(readRepoFile('.asd/runtime.js')) || [, ''])[1].matchAll(/'([^']+)'/g)].map(([, name]) => name);
  assert.ok(reserved.length > 0, 'AC-2: the reserved classes must be derived from runtime.js RESERVED_CHANGE_RISKS, the set the router enforces');
  assert.deepStrictEqual(reserved.filter((name) => !declaration.includes(`\`${name}\` — `)), [], 'AC-2: "Plan file format" must define each reserved class (`name` — definition), or the class stays reserved by the file touched');
  const providers = sectionOf('.asd/rules/providers.md', 'Task-class variants and routing');
  const cite = 'Material risk declaration';
  assert.ok(providers.includes(`"Plan file format" ${cite}`) && sectionOf('.asd/workflows/asd-phase-plan.md', 'Steps').includes('`sprint-lifecycle.md` "Plan file format" (declarations') && sectionOf('.asd/workflows/asd-phase-plan.md', 'Steps').includes('`Material risk` declaration'),`AC-2: providers.md must cite "Plan file format" ${cite} for the criteria, and asd-phase-plan.md must send the planner to the "Plan file format" declarations and note each Task's Material risk declaration`);
  const logLine = providers.split(/(?<=\.)\s/).find((sentence) => sentence.includes('decisions-log routing line')) || '';
  assert.ok(logLine.includes('ends `; risk <declaration>`') && logLine.includes('via <check>'), 'AC-3: the decisions-log routing line must end `; risk <declaration>` with `via <check>` after a none/artifact value');
  const suiteRule = providers.split(/(?<=\.)\s/).find((sentence) => spans(sentence).some((span) => span.startsWith('impl-review <id> suite')));
  assert.strictEqual(suiteRule, undefined, 'AC-3: a terminal-suite run is an asd-tester dispatch and asd-tester is unrouted, so the rule keeps no routed suite id');
  assert.ok(!/tier: critical|\bcritical tier\b/.test(providers) && /never `mechanical`/.test(providers), 'AC-3: every declared risk routes standard, never mechanical - the critical tier is retired, so no tier above standard exists to route a suite run to');

  const intake = stepOf(sectionOf('.asd/workflows/asd-phase-scope.md', 'Steps'), '2a');
  assert.ok(['root cause', 'proposed edits', 'consequences', 'Expected saving'].every((token) => intake.includes(token)), 'AC-4: scope step 2a (the retro intake home) must state what each row shows before its disposition - root cause, proposed edits, consequences, and a P-N row\'s Expected saving');
  assert.ok(stepOf(sectionOf('.asd/workflows/asd-phase-scope.md', 'Steps'), 4).includes('as step 2a requires'), 'AC-4: scope step 4 cites step 2a for the per-row presentation');

  const pattern = '.asd/sprints/**/reviews/**/*.diff';
  assert.ok(readRepoFile('.gitattributes').split('\n').some((line) => line.startsWith(`${pattern} `) && /\s-whitespace\s*$/.test(line)), `AC-5: .gitattributes must mark ${pattern} -whitespace`);
  const attr = execFileSync('git', ['check-attr', 'whitespace', '--', '.asd/sprints/s/reviews/impl/wave-1/iter-01/x.diff', 'README.md'], { cwd: REPO_ROOT, encoding: 'utf8' }).trim().split('\n');
  assert.deepStrictEqual(attr.map((line) => line.split(': ').pop()), ['unset', 'unspecified'], 'AC-5: git check-attr must report whitespace unset for a review diff and unspecified for any other file, so `git diff --cached --check` skips only the review diffs');
  assert.ok(sectionOf('.asd/rules/code-style.md', '19. Formatting').includes(`\`${pattern}\``),'AC-5: code-style.md must state the same exemption for a consumer project\'s configured lint');

  const amendment = sectionOf(lifecycle, 'Scope amendment');
  assert.ok(amendment.includes('review_fixes_pending'), 'AC-6: "Scope amendment" must define the amendment accepted while review_fixes_pending is set');
  assert.ok(/review-fix mode first.*initial mode over the plan's unticked Tasks only.*one `NEXT: impl-test`/.test(amendment), 'AC-6: "Scope amendment" must run review-fix first, then initial mode over unticked Tasks only (never a ticked one again), before one NEXT: impl-test');
  const impl = sectionOf('.asd/workflows/asd-phase-impl.md', 'Steps');
  const resume = canonText('.asd/workflows/asd-phase-impl.md').split('\n').find((line) => line.includes('- review-fix: clear')) || '';
  assert.ok(/wave whose Tasks are all ticked is skipped/.test(stepOf(impl, 5)) && /continue in initial mode.*before step 12/.test(resume), 'AC-6: impl step 5 must skip fully ticked waves and step 11 must continue into initial mode before step 12');
  assert.ok(stepOf(impl, 5).includes('"Scope amendment"') && canonText('.asd/workflows/asd-phase-impl.md').split('\n').find((line) => line.includes('- review-fix: clear')).includes('"Scope amendment"'), 'AC-6: impl must cite "Scope amendment" where it detects the mode and where review-fix finalizes');

  const gate = sectionOf('.asd/rules/checkpoints.md', 'Gate policy');
  const unmet = gate.split(/(?<=\.)\s/).find((sentence) => /flagged choice/i.test(sentence) && sentence.includes('plan decision')) || '';
  const scopeClass = 'new or changed scope';
  assert.ok(unmet.includes(`\`${scopeClass}\``), `AC-8: "Gate policy" must carry a flagged-choice sentence about an unmeetable plan decision that names the ${scopeClass} class`);
  assert.ok(gate.includes(`Hard in both modes: ${scopeClass}`), `AC-8: the ${scopeClass} class the flagged-choice sentence names must be the hard class "Gate policy" lists`);
  const mutation = sectionOf('.asd/rules/code-style.md', '17. Tests').split('\n').find((line) => line.startsWith('- A content-contract test pins')) || '';
  assert.ok(mutation.includes('superseded') && mutation.includes('citation'), 'AC-9: code-style.md §17 must bound the representative mutation of a changed-rule pin (superseded text, new clause removed with its citation kept)');
});

test('sprint-033 AC-3/AC-4: route-task sends migration, broad-reasoning and cross-domain change risks to escalated whatever stands beside them, keeps every other change risk at standard, refuses such a class typed artifact, and climbs the failed-check ladder - effort first, then one tier, capped at escalated', () => {
  const base = { objectiveInputs: true, failedObjectiveCheck: false, correctionAttempts: 0, kind: 'standard', checks: [], risks: [] };
  const mechanicalChecks = ['deterministic-check', 'exhaustive-match-validation'];
  const route = (overrides) => runtime.routeTask({ ...base, ...overrides });
  for (const name of ['migration', 'broad-reasoning', 'cross domain', 'Cross_Domain']) {
    assert.deepStrictEqual(route({ risks: [name] }), { tier: 'escalated', execution: 'agent', reason: `risk:${name}`, raiseEffort: false }, `AC-3: ${name} is an escalated class`);
  }
  assert.deepStrictEqual(route({ risks: ['auth', 'public contract', 'migration'] }), { tier: 'escalated', execution: 'agent', reason: 'risk:migration', raiseEffort: false }, 'AC-3: an escalated class wins the tier and the reason over a standard-class risk listed before it');
  for (const name of ['security', 'authentication', 'public contract', 'workflow gate', 'ambiguous judgment']) {
    assert.strictEqual(route({ risks: [name] }).tier, 'standard', `AC-3: ${name} keeps standard`);
  }
  for (const name of ['migration', 'broad-reasoning', 'cross-domain']) {
    assert.throws(() => route({ risks: [{ name, target: 'artifact' }] }), /reserved risk class/, `AC-3: ${name} typed artifact is rejected, or a mistyped declaration would route it off the escalated tier`);
  }

  const failed = { failedObjectiveCheck: true, correctionAttempts: 1 };
  const effortStep = (tier) => ({ tier, execution: 'agent', reason: 'effort-step', raiseEffort: true });
  const climbed = (tier) => ({ tier, execution: 'agent', reason: 'failed-objective-check', raiseEffort: false });
  assert.deepStrictEqual(route({ ...failed, kind: 'mechanical', checks: mechanicalChecks }), effortStep('mechanical'), 'AC-4: the first failure raises effort and keeps the tier');
  assert.deepStrictEqual(route({ ...failed, kind: 'mechanical', checks: mechanicalChecks, effortRaised: true }), climbed('standard'), 'AC-4: the raised-effort attempt failing climbs mechanical to standard');
  assert.deepStrictEqual(route(failed), effortStep('standard'));
  assert.deepStrictEqual(route({ ...failed, effortRaised: true }), climbed('escalated'), 'AC-4: standard climbs to escalated');
  assert.deepStrictEqual(route({ ...failed, priorTier: 'escalated' }), effortStep('escalated'), 'AC-4: the top tier still takes its effort step');
  assert.deepStrictEqual(route({ ...failed, effortRaised: true, priorTier: 'escalated' }), climbed('escalated'), 'AC-4: no tier above escalated exists, so the climb is capped');
  assert.deepStrictEqual(route({ failedObjectiveCheck: true, correctionAttempts: 0 }), { tier: 'standard', execution: 'agent', reason: 'normal', raiseEffort: false }, 'AC-4: a failure before its correction attempt starts no ladder');
  assert.deepStrictEqual(route({ kind: 'mechanical', checks: mechanicalChecks, priorTier: 'escalated' }), { tier: 'escalated', execution: 'agent', reason: 'no-downgrade', raiseEffort: false }, 'a task never routes below a tier it earned, escalated included');
  assert.strictEqual(route({ kind: 'command', checks: ['deterministic-state'], ...failed }).execution, 'agent', 'a failed command is no longer deterministic work, so it never runs as a bare command');
  assert.throws(() => route({ effortRaised: 'yes' }), /effortRaised invalid/, 'a non-boolean effortRaised fails closed');

  const input = path.join(mkTempDir(), 'route.json');
  fs.writeFileSync(input, JSON.stringify({ ...base, ...failed, risks: [] }), 'utf8');
  assert.deepStrictEqual(runtimeCliResult(['route-task', '--input', input]), { status: 0, result: effortStep('standard') }, 'the CLI prints raiseEffort beside the tier');
});

test('sprint-033 AC-9: positiveInteger accepts a zero-padded integer, so an external-review --iteration 02 names iteration 2, and still refuses zero, a fraction and text', async () => {
  const dir = mkTempDir();
  const scope = path.join(dir, 'scope.txt');
  fs.writeFileSync(scope, 'docs/a.md\n', 'utf8');
  const emit = (iteration) => runtimeSpawnAsync(['emit-manifest', '--reviewer', runtime.EXTERNAL_REVIEWER, '--phase', 'design-review', '--iteration', iteration, '--files', scope, '--out', mkTempDir()]);
  const accepted = [['02', 2], ['007', 7], ['3', 3]];
  const refusedInputs = ['0', '00', '1.5', 'two'];
  const ran = await Promise.all([...accepted.map(([padded]) => emit(padded)), ...refusedInputs.map(emit)]);
  accepted.forEach(([padded, expected], index) => {
    assert.strictEqual(ran[index].status, 0, `--iteration ${padded} is a positive integer`);
    assert.strictEqual(JSON.parse(fs.readFileSync(JSON.parse(ran[index].stdout).scope, 'utf8')).iteration, expected, `--iteration ${padded} is read as ${expected}`);
  });
  refusedInputs.forEach((bad, index) => {
    const refused = ran[accepted.length + index];
    assert.ok(refused.status === 2 && /--iteration <n> must be a positive integer/.test(refused.stderr), `--iteration ${bad} stays refused (got ${JSON.stringify(refused)})`);
  });
});

test('sprint-035 AC-9: a flag a command does not read warns once on stderr naming it, a declared flag never warns, and the exit status and the command\'s own failure are unchanged', async () => {
  const guide = path.join(mkTempDir(), 'guide.md');
  fs.writeFileSync(guide, '## Intro\n\nbody\n', 'utf8');
  const warning = (name) => `runtime: ignored flag --${name}\n`;

  const [plain, extra, declared, unreadSection, refused, refusedPlain] = await Promise.all([
    runtimeSpawnAsync(['scratch-dir']),
    runtimeSpawnAsync(['scratch-dir', '--bogus', '1', '--state', 'x']),
    runtimeSpawnAsync(['section', '--file', guide, '--heading', 'Intro']),
    runtimeSpawnAsync(['section', '--file', guide, '--heading', 'Intro', '--typo', '1']),
    runtimeSpawnAsync(['section', '--typo', 'x']),
    runtimeSpawnAsync(['section']),
  ]);
  assert.deepStrictEqual([plain.status, plain.stderr], [0, ''], 'sanity: the command alone exits 0 and warns of nothing');
  assert.deepStrictEqual([extra.status, extra.stdout, extra.stderr], [0, plain.stdout, warning('bogus') + warning('state')], 'AC-9: each unread flag warns, a flag of another command included, and the output is untouched');
  assert.deepStrictEqual([declared.status, declared.stderr], [0, ''], 'AC-9: a declared flag never warns');
  assert.deepStrictEqual([unreadSection.status, unreadSection.stdout, unreadSection.stderr], [0, declared.stdout, warning('typo')], 'AC-9: a command that reads flags keeps its result when another is unread');
  assert.ok(refusedPlain.status !== 0 && refused.status === refusedPlain.status, 'AC-9: a failing call exits with the same non-zero status with or without the unread flag');
  assert.ok(refused.stderr.startsWith(warning('typo')) && refused.stderr.includes(refusedPlain.stderr.trim()), 'AC-9: the warning precedes the command\'s own failure message, which is unchanged');
});
