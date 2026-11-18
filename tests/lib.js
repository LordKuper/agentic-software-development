'use strict';

/** Shared helpers and the test registry every area file under tests/ draws on. */

const assert = require('node:assert');

const fs = require('node:fs');

const path = require('node:path');

const { execFile, execFileSync, spawn, spawnSync } = require('node:child_process');

const { promisify } = require('node:util');

const sync = require('../.asd/sync.js');

const update = require('../.asd/skills/asd-update/update.js');

const migration900 = require('../.asd/migrations/9.0.0.js');

const runtime = require('../.asd/runtime.js');

/** `execFileSync` without blocking: a rejection carries the exit status in `code`; independent slow spawns overlap under `Promise.all`. */
const execFileAsync = promisify(execFile);

const REPO_ROOT = path.resolve(__dirname, '..');

const FIXTURES = path.join(__dirname, 'fixtures');

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

/** The one per-run directory every fixture lives in, under the repo's git-ignored scratch directory so no fixture sits on the system disk; removed on exit, pass or fail, leaving the scratch directory's other files alone. */
const FIXTURE_ROOT = fs.mkdtempSync(path.join(execFileSync(process.execPath, [path.join(REPO_ROOT, '.asd', 'runtime.js'), 'scratch-dir'], { encoding: 'utf8' }).trim(), 'asd-test-run-'));
process.env.GIT_CEILING_DIRECTORIES = FIXTURE_ROOT;
fs.mkdirSync(path.join(FIXTURE_ROOT, '.asd')); // empty marker: stops the `.asd` walk-ups (sync.js findRepoRoot, update.js, the session-start hook findUp)
process.on('exit', () => fs.rmSync(FIXTURE_ROOT, { recursive: true, force: true }));

/** A fresh fixture directory. Two guards keep a fixture that is no repo of its own from resolving the live repo: the git ceiling above stops git's upward search, and the empty `.asd/` marker in `FIXTURE_ROOT` stops every upward `.asd` search at the fixture root. */
function mkTempDir() {
  return fs.mkdtempSync(path.join(FIXTURE_ROOT, 'asd-sync-test-'));
}

function loadManifest() {
  return sync.loadReleaseManifest(REPO_ROOT);
}

function makeMiniRepo() {
  const root = mkTempDir();
  fs.mkdirSync(path.join(root, '.asd', 'agents'), { recursive: true });
  const manifest = loadManifest();
  fs.writeFileSync(path.join(root, '.asd', 'release-manifest.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(root, '.asd', 'sync-state.json'), JSON.stringify({ schema_version: 1, entries: {} }, null, 2));
  return root;
}

function writeAgentCanon(root, name, canonText) {
  fs.writeFileSync(path.join(root, '.asd', 'agents', name + '.md'), canonText.replace('"name": "asd-demo"', `"name": "${name}"`), 'utf8');
}

const GOOD_AGENT_CANON = sync.readNormalized(path.join(FIXTURES, 'canon/agents/demo-agent.md'));

function writeFile(root, relPath, content) {
  const abs = path.join(root, ...relPath.split('/'));
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf8');
}

// Builds ownership-marker-bearing file content for a generated-view fixture.
// 'md' format needs the marker on line 2 (after the opening '---' fence,
// splitMarkerAndBody's frontmatter-safe convention); 'toml' keeps it as the
// literal first line. Uses the real buildFullFileMarker/sha256Hex so this
// stays byte-compatible with whatever sync.js itself considers a valid
// marker, instead of hand-rolling a regex-matching string that could drift.
function markedFileContent(format, manifest, { edited = false } = {}) {
  const body = format === 'md' ? '---\nbody\n---\nrest of body\n' : 'body\n';
  const marker = sync.buildFullFileMarker({
    format,
    sourceRelPath: 'agents/retired-fixture-agent.md',
    sourceDigest: sync.sha256Hex('fixture-source'),
    contentDigest: sync.sha256Hex(edited ? 'body-before-the-hand-edit' : body),
    asdVersion: manifest.asd_version,
  });
  if (format === 'md') return body.replace('---\n', '---\n' + marker + '\n');
  return marker + '\n' + body;
}

/** The External Review scope-manifest field names external-review.md "Phase-scoped payload" declares on its `Manifest fields:` line, `[]` suffixes dropped. */
function declaredScopeFields() {
  const line = sectionOf('.asd/rules/external-review.md', 'Phase-scoped payload').split('\n').find((candidate) => candidate.startsWith('Manifest fields:'));
  assert.ok(line, 'external-review.md "Phase-scoped payload" must declare the scope-manifest fields on its own `Manifest fields:` line');
  return [...line.split(' — ')[0].matchAll(/`([a-z_]+)(?:\[\])?`/g)].map((match) => match[1]);
}

function runtimeCli(args, options) {
  return execFileSync(process.execPath, [path.join(REPO_ROOT, '.asd', 'runtime.js'), ...args], { encoding: 'utf8', ...options });
}

/** Runs the runtime CLI and returns `{status: 0, result: <parsed JSON stdout>}` on success or `{status, stderr}` on a non-zero exit - the try/catch shape every JSON-returning CLI fixture repeats (EFF-4). */
function runtimeCliResult(args, options) {
  try {
    return { status: 0, result: JSON.parse(runtimeCli(args, { stdio: 'pipe', ...options })) };
  } catch (error) {
    return { status: error.status, stderr: String(error.stderr).trim() };
  }
}

/** Binds git to `repo`, isolated from the host's config - no signing, no autocrlf, a throwaway identity - so a git fixture's line endings and commits never depend on the machine running it (EFF-4). */
function sandboxGit(repo) {
  const emptyGlobalConfig = path.join(mkTempDir(), 'gitconfig');
  fs.writeFileSync(emptyGlobalConfig, '', 'utf8');
  const env = { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: emptyGlobalConfig };
  const git = (...args) => execFileSync('git', ['-c', 'user.name=asd-test', '-c', 'user.email=asd-test@example.invalid', '-c', 'commit.gpgsign=false', '-c', 'core.autocrlf=false', ...args], { cwd: repo, env, encoding: 'utf8' });
  return { repo, env, git };
}

const sandboxTemplates = new Map();

/** A sandbox git repo copied from the template `build(sandbox)` populates once per `key` for the whole run, so the init and the base commits are paid once, not per test; `shared` carries what `build` returned (a base commit id). The default template is an empty initialised repo. */
function sandboxGitRepoFrom(key, build) {
  if (!sandboxTemplates.has(key)) {
    const template = sandboxGit(mkTempDir());
    template.git('init', '-q');
    sandboxTemplates.set(key, { repo: template.repo, shared: build ? build(template) : undefined });
  }
  const { repo: source, shared } = sandboxTemplates.get(key);
  const repo = mkTempDir();
  fs.cpSync(source, repo, { recursive: true });
  return { ...sandboxGit(repo), shared };
}

/** A temp git repo isolated from the host's config; see `sandboxGitRepoFrom`. */
function sandboxGitRepo() {
  return sandboxGitRepoFrom('empty');
}

/** The `git fast-import` command stream and the marks file for `states` (see `importCommits`). */
function fastImportRequest(sandbox, states, parent) {
  const branch = /^ref: (\S+)/.exec(fs.readFileSync(path.join(sandbox.repo, '.git', 'HEAD'), 'utf8'))[1];
  const marksFile = path.join(mkTempDir(), 'marks');
  const stream = [];
  const data = (bytes) => stream.push(Buffer.from(`data ${bytes.length}\n`), bytes, Buffer.from('\n'));
  states.forEach((state, index) => {
    stream.push(Buffer.from(`commit ${branch}\nmark :${index + 1}\ncommitter asd-test <asd-test@example.invalid> ${index + 1} +0000\n`));
    data(Buffer.from(`state ${index + 1}`));
    if (index === 0 && parent) stream.push(Buffer.from(`from ${parent}\n`));
    for (const [file, entry] of Object.entries(state)) {
      if (entry === null) {
        stream.push(Buffer.from(`D ${file}\n`));
        continue;
      }
      const { content, mode = '100644' } = typeof entry === 'string' || Buffer.isBuffer(entry) ? { content: entry } : entry;
      stream.push(Buffer.from(`M ${mode} inline ${file}\n`));
      data(Buffer.from(content));
    }
  });
  const readIds = () => fs.readFileSync(marksFile, 'utf8').trim().split('\n').map((line) => line.split(' ')[1]);
  return { args: ['fast-import', '--quiet', `--export-marks=${marksFile}`], input: Buffer.concat(stream), readIds };
}

/** Commits each state of `states` to the sandbox's current branch, on top of `parent` when given, through one `git fast-import` and returns the commit ids, oldest first. A state maps a path to its content (string or Buffer), to `{content, mode}` or to null (deleted); it touches no index and no worktree, which a diff between commits never reads, so a fixture with many files pays one spawn where `git add` and `git commit` pay several each. */
async function importCommits(sandbox, states, { parent } = {}) {
  const { args, input, readIds } = fastImportRequest(sandbox, states, parent);
  const pending = execFileAsync('git', args, { cwd: sandbox.repo, env: sandbox.env });
  pending.child.stdin.end(input);
  await pending;
  return readIds();
}

/** `importCommits` without waiting: for a template build `sandboxGitRepoFrom` must finish before it copies the repo. */
function importCommitsSync(sandbox, states, { parent } = {}) {
  const { args, input, readIds } = fastImportRequest(sandbox, states, parent);
  execFileSync('git', args, { cwd: sandbox.repo, env: sandbox.env, input });
  return readIds();
}

/** Every sprint workflow definition, loaded and shape-checked by the runtime's own loader - the chain, routing and roster source since sprint 020. */
function readWorkflowDefinitions() {
  const names = fs.readdirSync(path.join(REPO_ROOT, '.asd/workflows')).filter((file) => file.endsWith('.json')).map((file) => file.slice(0, -'.json'.length)).sort();
  assert.ok(names.includes('standard'), 'sprint-lifecycle.md "Workflows": a state.json without `workflow` reads standard, so .asd/workflows/standard.json must exist');
  return names.map((name) => runtime.loadWorkflow(name));
}

/** The agent file each reviewer key of any definition's rosters dispatches, sorted. */
function workflowReviewerAgents() {
  const keys = new Set(readWorkflowDefinitions().flatMap((definition) => [...definition.reviewers.design, ...definition.reviewers.impl]));
  return [...keys].map((key) => (key === runtime.EXTERNAL_REVIEWER ? 'asd-external-review' : `asd-reviewer-${key}`)).sort();
}

/** The first arrow chain (`a → b ⇄ c`) in a text, as its phase names, or null. */
function arrowChain(text) {
  const chain = /[a-z-]+(?:\s*(?:→|⇄)\s*[a-z-]+)+/.exec(text);
  return chain ? chain[0].split(/\s*(?:→|⇄)\s*/) : null;
}

function readRepoFile(rel) {
  return fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');
}

/** Every internal reviewer, named as `emit-manifest --reviewer` takes it, derived from the canonical agents it reads rubrics from. */
function internalReviewers() {
  return fs.readdirSync(path.join(REPO_ROOT, '.asd/agents')).map((file) => /^asd-reviewer-([a-z]+)\.md$/.exec(file)).filter(Boolean).map((match) => match[1]);
}

/** A reviewer's rubric as `emitCoverageManifest` takes it: its agent file, or for the combined reviewer the `{reviewer: markdown}` map of the rubrics its "compose the rubric" Rules line names, in order, its own last. */
function reviewerRubric(reviewer) {
  const own = readRepoFile(`.asd/agents/asd-reviewer-${reviewer}.md`);
  if (reviewer !== runtime.COMBINED_REVIEWER) return own;
  const composed = own.split('\n').find((line) => line.startsWith('- must: compose the rubric')) || '';
  const parts = [...composed.matchAll(/`asd-reviewer-([a-z]+)\.md`/g)].map((match) => match[1]);
  assert.ok(parts.length > 0, 'asd-reviewer-combined.md must name the rubrics it composes on its "compose the rubric" Rules line');
  return Object.fromEntries([...parts, reviewer].map((name) => [name, readRepoFile(`.asd/agents/asd-reviewer-${name}.md`)]));
}

/** A canon file with line endings normalized, so `^`/`$` anchors hold in a CRLF working tree. */
function canonText(rel) {
  return readRepoFile(rel).replace(/\r\n/g, '\n');
}

/** The body of one heading's section (heading line dropped), at any heading level. */
function headingBody(rel, heading) {
  return runtime.markdownSection(readRepoFile(rel), heading).split('\n').slice(1).join('\n').trim();
}

/** The rows of the providers.md "Role-scoped context" grant table, parsed from its one json block. */
function grantRows() {
  const match = /```json\n([\s\S]*?)\n```/.exec(runtime.markdownSection(readRepoFile('.asd/rules/providers.md'), 'Role-scoped context'));
  return JSON.parse(match[1]);
}

/** Every ref a role is granted across all its rows, in table order. */
function grantedRefs(role) {
  return grantRows().filter((row) => row.role === role).flatMap((row) => row.refs);
}

/** The body of the first `## <heading>` section, prefix-matched as canon citations are. */
function sectionOf(rel, heading) {
  const body = canonText(rel).split(`\n## ${heading}`)[1];
  assert.ok(body !== undefined, `${rel} must keep its "${heading}" section`);
  return body.split('\n## ')[0];
}

/** The parsed JSON block of the first `## <heading>` section (form D1: the section's whole content). */
function jsonOf(rel, heading) {
  const match = /```json\n([\s\S]*?)\n```/.exec(sectionOf(rel, heading));
  assert.ok(match, `${rel} "${heading}" must carry a json block`);
  return JSON.parse(match[1]);
}

/** Every string leaf of the JSON block in a section's text (arrays, objects, nested), in order. */
function jsonText(section) {
  const leaves = [];
  const walk = (node) => (typeof node === 'string' ? leaves.push(node) : node && typeof node === 'object' ? Object.values(node).forEach(walk) : undefined);
  walk(JSON.parse(/```json\n([\s\S]*?)\n```/.exec(section)[1]));
  return leaves;
}

/** The body of the first `### <heading>` subhead inside a section's text, prefix-matched. */
function subOf(text, heading) {
  const body = text.split(`\n### ${heading}`)[1];
  assert.ok(body !== undefined, `the "${heading}" subhead must still exist`);
  return body.split('\n### ')[0];
}

/** One numbered step of a workflow section, sub-bullets included. */
function stepOf(section, step) {
  const block = section.split(/\n(?=\d+[a-z]?\. )/).find((candidate) => candidate.startsWith(`${step}. `));
  assert.ok(block, `step ${step} must still exist`);
  return block;
}

/** Every backtick code span in `text`, in order. */
function spans(text) {
  return [...text.matchAll(/`([^`]+)`/g)].map(([, span]) => span);
}

/** Every canonical Markdown file ASD ships - the search space for a "sole home" claim. */
function canonMarkdownFiles() {
  const out = [];
  for (const root of ['.asd/rules', '.asd/workflows', '.asd/agents', '.asd/skills', '.asd/templates']) {
    for (const entry of fs.readdirSync(path.join(REPO_ROOT, root), { recursive: true })) {
      const rel = `${root}/${String(entry).split(path.sep).join('/')}`;
      if (rel.endsWith('.md') && fs.statSync(path.join(REPO_ROOT, rel)).isFile()) out.push(rel);
    }
  }
  return out;
}

/** The key list 9.0.0.js drops, read from its literal array - the removed-key checks take their set from the migration itself. */
function readRemovedConfigKeys() {
  const block = /const REMOVED_KEYS = \[([\s\S]*?)\];/.exec(canonText('.asd/migrations/9.0.0.js'));
  assert.ok(block, '9.0.0.js must keep REMOVED_KEYS as a literal array');
  const keys = (block[1].match(/'([^']+)'/g) || []).map((quoted) => quoted.slice(1, -1));
  assert.ok(keys.length > 0, 'REMOVED_KEYS must still list keys, or every removed-key check passes over nothing');
  return keys;
}

/** Runs 9.0.0.js on `text` as a project's config.yaml; stdout is captured, `rerun` migrates the same project again. */
function migrateConfig900(text) {
  const root = mkTempDir();
  const configPath = path.join(root, '.asd', 'project', 'config.yaml');
  if (text !== undefined) writeFile(root, '.asd/project/config.yaml', text);
  const run = () => {
    const captured = [];
    const realWrite = process.stdout.write;
    process.stdout.write = (chunk) => {
      captured.push(String(chunk));
      return true;
    };
    let report;
    try {
      report = migration900({ repoRoot: root });
    } finally {
      process.stdout.write = realWrite;
    }
    return { report, output: captured.join(''), text: fs.existsSync(configPath) ? fs.readFileSync(configPath, 'utf8') : undefined, rerun: run };
  };
  return run();
}

/** Terms naming a review mechanism sprint 017's review waves replaced (AC-5); shared by the canon sweep and the agent-memory sweep. */
const REPLACED_REVIEW_MECHANISMS = [/\.part-|part-N|--halve|outOfPart|out-of-part|SPLIT_THRESHOLD|split trigger|union property|part merge|split dispatch|DISPATCH_CEILING|dispatch ceiling|sub-wave|APPROVE \(partial:|--test-plan-files/i, /\b(?:base_ref|head_ref|exclude_paths)\b/];

const AGENT_MEMORY_ROOT = '.claude/agent-memory';

/** Asserts a sweep's file list holds a file of every agent-memory directory that has one, those of agents no longer on the roster included. */
function assertSweepReachesMemory(files) {
  const root = path.join(REPO_ROOT, AGENT_MEMORY_ROOT);
  const populated = fs.readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory() && fs.readdirSync(path.join(root, entry.name)).some((name) => name.endsWith('.md'))).map((entry) => entry.name);
  assert.ok(populated.length > 0, 'sanity: the memory root must hold a populated directory, or the sweep reach check compares nothing');
  assert.deepStrictEqual(populated.filter((dir) => !files.some((rel) => rel.startsWith(`${AGENT_MEMORY_ROOT}/${dir}/`))), [], 'sanity: the sweep must reach every memory directory (artifact-layout.md "Leftover-term check")');
}

/** Every memory file a dispatched roster agent loads: the `.md` files under `.claude/agent-memory/<agent>/`, for each agent `.claude/agents/` defines. */
function rosterMemoryFiles() {
  const roster = fs.readdirSync(path.join(REPO_ROOT, '.claude/agents')).filter((name) => name.endsWith('.md')).map((name) => name.slice(0, -3));
  return fs.readdirSync(path.join(REPO_ROOT, AGENT_MEMORY_ROOT)).filter((dir) => roster.includes(dir)).flatMap((dir) => fs.readdirSync(path.join(REPO_ROOT, AGENT_MEMORY_ROOT, dir)).filter((name) => name.endsWith('.md')).map((name) => `${AGENT_MEMORY_ROOT}/${dir}/${name}`));
}

function canonAgents() {
  return fs.readdirSync(path.join(REPO_ROOT, '.asd/agents')).filter((file) => file.endsWith('.md')).sort().map((file) => {
    const rel = `.asd/agents/${file}`;
    const { meta, body } = sync.parseCanonicalFrontmatter(sync.readNormalized(path.join(REPO_ROOT, rel)));
    return { rel, name: meta.name, meta, body };
  });
}

/** The `#`/`##` headings of a canon file outside code fences, as `[level, title]`. */
function headingsOf(rel) {
  let fenced = false;
  const found = [];
  for (const line of canonText(rel).split('\n')) {
    if (/^```/.test(line)) fenced = !fenced;
    const match = !fenced && /^(#{1,2}) (.+)$/.exec(line);
    if (match) found.push([match[1].length, match[2]]);
  }
  return found;
}

const FORM_DOMAIN_SECTIONS = ['Review rubric', 'Section coverage ledger', 'Gate Verdict Format', 'Severity mapping', 'Invocation', 'Test selection rubric', 'Suite revision', 'Failure triage', 'Manual steps', 'Evidence routing', 'Diagram modes', 'Token decisions', 'Tech reference'];

const FORM_CATEGORIES = {
  agents: {
    files: () => fs.readdirSync(path.join(REPO_ROOT, '.asd/agents')).filter((file) => file.endsWith('.md')).map((file) => `.asd/agents/${file}`),
    title: /^Role$/,
    spec: [...['Inputs', 'Outputs', 'Rules', 'Tools', 'Escalation', 'Signals'].map((name) => [name, true]), ...FORM_DOMAIN_SECTIONS.map((name) => [name, false])],
  },
  workflows: {
    files: () => fs.readdirSync(path.join(REPO_ROOT, '.asd/workflows')).filter((file) => /^asd-phase-.*\.md$/.test(file)).map((file) => `.asd/workflows/${file}`),
    title: /^ASD Workflow: \S/,
    spec: [['Entry', true], ['Inputs', true], ['Steps', true], ['Rules', false], ['Dispatch', false], ['Signals', false], ['Exit', true], ['Return', true], ['References', true]],
  },
  skills: {
    files: () => fs.readdirSync(path.join(REPO_ROOT, '.asd/skills')).filter((name) => !name.startsWith('asd-phase-')).sort().map((name) => `.asd/skills/${name}/SKILL.md`),
    title: /^\S/,
    spec: [['Purpose', true], ['Preconditions', true], ['Modes', false], ['Steps', true], ['Rules', false], ['User decisions', false], ['Delegates', true], ['Outputs', true], ['Reference', false], ['Return', true], ['References', true]],
  },
};

/** The nine retired agent names, read from the migration's own constant so the test and the deleter cannot disagree. */
function retiredAgentNames1400() {
  return [...(/const RETIRED_AGENTS = \[([\s\S]*?)\];/.exec(canonText('.asd/migrations/14.0.0.js'))[1]).matchAll(/'([a-z-]+)'/g)].map((match) => match[1]);
}

/** The legacy reviewer keys the merged `quality` verdict replaces, read from the migration's own constant. */
function legacyReviewerKeys1400() {
  return [...(/const LEGACY_REVIEWERS = \[([^\]]*)\];/.exec(canonText('.asd/migrations/14.0.0.js'))[1]).matchAll(/'([a-z]+)'/g)].map((match) => match[1]);
}

/** Runs `waitForChecks` over scripted reads (the last repeats, an Error is thrown) on a fake clock only the injected sleep advances. */
async function scriptedWait(reads) {
  const queue = [...reads];
  let clock = 0;
  let polls = 0;
  const read = () => {
    const next = queue.length > 1 ? queue.shift() : queue[0];
    if (next instanceof Error) throw next;
    return next;
  };
  const sleep = async (ms) => {
    clock += ms;
    polls += 1;
  };
  const checks = await runtime.waitForChecks({ read, sleep, now: () => clock });
  return { checks, elapsed: clock, polls };
}

const RUNTIME_JS = path.join(REPO_ROOT, '.asd', 'runtime.js');

/** The runtime CLI's exit status, stdout and stderr for `args`; `options` join the `spawnSync` call and a non-zero exit is data, never a throw. */
function runtimeSpawn(args, options = {}) {
  const ran = spawnSync(process.execPath, [RUNTIME_JS, ...args], { encoding: 'utf8', ...options });
  return { status: ran.status, stdout: ran.stdout, stderr: ran.stderr };
}

/** `runtimeSpawn` without blocking: resolves the same `{status, stdout, stderr}`, so independent slow CLI runs overlap. */
function runtimeSpawnAsync(args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [RUNTIME_JS, ...args], options);
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8').on('data', (chunk) => { stdout += chunk; });
    child.stderr.setEncoding('utf8').on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (status) => resolve({ status, stdout, stderr }));
  });
}

/** `runtimeCliResult` without blocking: independent CLI runs overlap under `Promise.all`; the same `{status, result}` or `{status, stderr}` shape. */
async function runtimeCliResultAsync(args, options) {
  const ran = await runtimeSpawnAsync(args, options);
  if (ran.status !== 0) return { status: ran.status, stderr: ran.stderr.trim() };
  return { status: 0, result: JSON.parse(ran.stdout) };
}

/** A mini repo whose `.claude/settings.json` sync applied, then `extra` top-level keys added to it and `git.ai_attribution` set to disabled: sync's record of the file exists and its owned attribution value is missing. */
function disabledAttributionRepo(extra = {}) {
  const settingsRel = '.claude/settings.json';
  const root = makeMiniRepo();
  sync.runApply(root, [settingsRel]);
  const settingsPath = path.join(root, settingsRel);
  fs.writeFileSync(settingsPath, `${JSON.stringify({ ...JSON.parse(fs.readFileSync(settingsPath, 'utf8')), ...extra }, null, 2)}\n`, 'utf8');
  writeFile(root, '.asd/project/config.yaml', 'git:\n  ai_attribution: disabled\n');
  const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
  return {
    root,
    read,
    check: () => runtimeSpawn(['attribution-check'], { cwd: root }),
    statusOf: () => sync.runCheck(root).find((item) => item.target === settingsRel).status,
    entry: () => JSON.parse(read('.asd/sync-state.json')).entries[settingsRel],
  };
}

const OFF_VALUE = { commit: '', pr: '' };

function linkedLedgerRepo() {
  const repo = disabledAttributionRepo();
  const behind = path.join(mkTempDir(), 'sync-state.json');
  const ledger = path.join(repo.root, '.asd', 'sync-state.json');
  fs.copyFileSync(ledger, behind);
  fs.unlinkSync(ledger);
  try {
    fs.symlinkSync(behind, ledger, 'file');
  } catch (_) {
    return null;
  }
  return { repo, behind };
}

function linkedAsdDirRepo() {
  const repo = disabledAttributionRepo();
  const real = path.join(repo.root, 'asd-real');
  fs.renameSync(path.join(repo.root, '.asd'), real);
  fs.symlinkSync(real, path.join(repo.root, '.asd'), 'junction');
  return { repo, behind: path.join(real, 'sync-state.json') };
}

function linkedLedgerCases() {
  const cases = [['a linked .asd directory', linkedAsdDirRepo()]];
  const fileLink = linkedLedgerRepo();
  if (fileLink === null) console.log('  (skipped the ledger-file link assertions: fs.symlinkSync unsupported in this environment)');
  else cases.push(['a symlinked ledger', fileLink]);
  return cases;
}

/** The `owned_keys` the sync-state record of `.claude/settings.json` holds under `root`, undefined when it holds none. */
function recordedOwnedKeys(root) {
  return JSON.parse(fs.readFileSync(path.join(root, '.asd', 'sync-state.json'), 'utf8')).entries['.claude/settings.json'].owned_keys;
}

module.exports = {
  assert,
  fs,
  path,
  execFileSync,
  spawnSync,
  sync,
  update,
  migration900,
  runtime,
  REPO_ROOT,
  FIXTURES,
  tests,
  test,
  FIXTURE_ROOT,
  mkTempDir,
  loadManifest,
  makeMiniRepo,
  writeAgentCanon,
  GOOD_AGENT_CANON,
  writeFile,
  markedFileContent,
  declaredScopeFields,
  runtimeCli,
  runtimeCliResult,
  sandboxGitRepo,
  sandboxGitRepoFrom,
  importCommits,
  importCommitsSync,
  readWorkflowDefinitions,
  workflowReviewerAgents,
  arrowChain,
  readRepoFile,
  internalReviewers,
  reviewerRubric,
  canonText,
  headingBody,
  grantRows,
  grantedRefs,
  sectionOf,
  jsonOf,
  jsonText,
  subOf,
  stepOf,
  spans,
  canonMarkdownFiles,
  readRemovedConfigKeys,
  migrateConfig900,
  REPLACED_REVIEW_MECHANISMS,
  AGENT_MEMORY_ROOT,
  assertSweepReachesMemory,
  rosterMemoryFiles,
  canonAgents,
  headingsOf,
  FORM_DOMAIN_SECTIONS,
  FORM_CATEGORIES,
  retiredAgentNames1400,
  legacyReviewerKeys1400,
  scriptedWait,
  RUNTIME_JS,
  execFileAsync,
  runtimeSpawn,
  runtimeSpawnAsync,
  runtimeCliResultAsync,
  disabledAttributionRepo,
  OFF_VALUE,
  linkedLedgerRepo,
  linkedAsdDirRepo,
  linkedLedgerCases,
  recordedOwnedKeys,
};
