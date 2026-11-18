'use strict';

// runtime.js operation timing, agent liveness, context bundles and ceilings

const { assert, fs, path, spawnSync, sync, runtime, REPO_ROOT, test, mkTempDir, runtimeCli, runtimeCliResult, readWorkflowDefinitions, readRepoFile, grantRows, sectionOf, RUNTIME_JS, runtimeSpawn } = require('./lib.js');

test('sprint-021 AC-7 (D7): agentLiveness turns a subagent transcript into running, done or a stall with its reason, and agent-liveness prints one STALL line per stalled agent and fails when it finds no transcript', () => {
  const minute = (n) => Date.UTC(2026, 8, 29, 12, n);
  const entry = (type, at, content, stopReason) => JSON.stringify({ type, timestamp: new Date(minute(at)).toISOString(), message: { role: type, content, ...(stopReason === undefined ? {} : { stop_reason: stopReason }) } });
  const toolUse = (id) => ({ type: 'tool_use', id, name: 'Bash', input: {} });
  const transcript = (...lines) => {
    const text = `${lines.join('\n')}\n`;
    return { text, size: Buffer.byteLength(text), mtimeMs: 5 };
  };
  const unchanged = ({ size, mtimeMs }) => ({ size, mtimeMs });
  const opening = [entry('user', 0, [{ type: 'text', text: 'task' }]), entry('assistant', 1, [toolUse('t1')], 'tool_use'), entry('user', 2, [{ type: 'tool_result', tool_use_id: 't1', content: 'ok' }])];
  const idle = transcript(...opening);
  const openCall = transcript(...opening, entry('assistant', 3, [toolUse('t2')], 'tool_use'));
  const done = transcript(...opening, entry('assistant', 4, [{ type: 'text', text: 'COMPLETED' }], 'end_turn'));
  const torn = transcript(...opening, '{"type":"assistant","timest');
  const ceilingMs = 600000;
  const budgetMs = 30 * 60000;
  const running = { status: 'running' };
  const stalled = (reason) => ({ status: 'stalled', reason });
  const cases = [
    ['first check', undefined, idle, minute(5), undefined, running],
    ['transcript grew since the last check', { size: idle.size - 1, mtimeMs: 5 }, idle, minute(5), undefined, running],
    ['transcript mtime moved', { size: idle.size, mtimeMs: 4 }, idle, minute(5), undefined, running],
    ['no progress and no open tool call', unchanged(idle), idle, minute(5), undefined, stalled('no-progress')],
    ['a half-written last line is skipped, not read as progress', unchanged(torn), torn, minute(5), undefined, stalled('no-progress')],
    ['open tool call inside the host command ceiling', unchanged(openCall), openCall, minute(3) + ceilingMs - 1, undefined, running],
    ['open tool call at the host command ceiling', unchanged(openCall), openCall, minute(3) + ceilingMs, undefined, stalled('tool-call-overrun')],
    ['growing but past the elapsed budget', undefined, idle, minute(0) + budgetMs + 1, budgetMs, stalled('over-budget')],
    ['growing at exactly the elapsed budget', undefined, idle, minute(0) + budgetMs, budgetMs, running],
    ['final answer, unchanged and over budget', unchanged(done), done, minute(0) + budgetMs * 2, budgetMs, { status: 'done' }],
    ['transcript missing on the first check', undefined, null, minute(1), undefined, running],
    ['transcript missing on two checks in a row', null, null, minute(1), undefined, { status: 'unobservable' }],
  ];
  for (const [label, previous, current, now, budget, expected] of cases) {
    assert.deepStrictEqual(runtime.agentLiveness(previous, current, now, budget), expected, `${label}: sprint-lifecycle.md "Agent liveness" - a stall is no transcript advance since the last check with no tool call open inside the host's 10-minute command ceiling, or the elapsed budget passed; a just-dispatched agent gets one check to write its transcript`);
  }

  const configDir = mkTempDir();
  const subagents = path.join(configDir, 'projects', 'project', 'session', 'subagents');
  fs.mkdirSync(subagents, { recursive: true });
  fs.writeFileSync(path.join(subagents, 'agent-a1.jsonl'), idle.text, 'utf8');
  fs.writeFileSync(path.join(subagents, 'agent-b2.jsonl'), done.text, 'utf8');
  const env = { ...process.env, CLAUDE_CONFIG_DIR: configDir };
  const watch = (agents) => {
    try {
      return { status: 0, stdout: runtimeCli(['agent-liveness', '--agents', agents, '--interval', '1'], { env, stdio: 'pipe' }) };
    } catch (error) {
      return { status: error.status, stderr: String(error.stderr) };
    }
  };
  assert.deepStrictEqual(watch('a1,b2'), { status: 0, stdout: 'STALL a1 no-progress\n' }, 'the command resolves each transcript under $CLAUDE_CONFIG_DIR/projects/<project>/<session>/subagents/, drops a finished agent silently, prints one STALL line for an agent whose transcript did not move between two checks, and returns once none is left running');
  const missing = watch('zz9');
  assert.ok(missing.status === 2 && /no transcript/.test(missing.stderr), `a transcript missing on two checks fails the command instead of printing a stall - a host whose transcripts it cannot find never gets a healthy agent stopped (providers.md "Agent liveness per host"); got ${JSON.stringify(missing)}`);
});

const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const TIMING_EPOCH_MS = Date.UTC(2026, 0, 1);

/** ISO timestamp `minutes` after the fixed fixture epoch. */
function minuteAt(minutes) {
  return new Date(TIMING_EPOCH_MS + minutes * 60000).toISOString();
}

function ledgerLines(text) {
  return text.split('\n').filter((line) => line !== '').map((line) => JSON.parse(line));
}

/** The open and close lines of one op spanning `[from, to]` minutes. */
function opLines(id, kind, parent, from, to, attrs = {}, outcome = 'done') {
  const base = { id, kind, parent, start: minuteAt(from), attrs };
  return [{ op: 'open', ...base }, { op: 'close', ...base, end: minuteAt(to), outcome }].map((line) => JSON.stringify(line) + '\n').join('');
}

test('sprint-025 AC-1/AC-4 (D2, D4), sprint-034 AC-13: timingAppend closes before it opens, numbers a phase by entry, parents an op on the open phase, appends nothing for an unmatched close, skips a duplicate open, and starts a fresh line after a half-written tail', () => {
  const scope = runtime.timingAppend('', { open: 'scope', kind: 'phase' }, minuteAt(0));
  assert.deepStrictEqual(ledgerLines(scope.text), [{ op: 'open', id: 'scope#1', kind: 'phase', parent: null, start: minuteAt(0), attrs: {} }]);

  const dispatch = runtime.timingAppend(scope.text, { open: 'asd-tester impl-test#1', kind: 'dispatch', attrs: 'agent=asd-tester;tier=mechanical' }, minuteAt(5));
  assert.deepStrictEqual(ledgerLines(dispatch.text), [{ op: 'open', id: 'asd-tester impl-test#1', kind: 'dispatch', parent: 'scope#1', start: minuteAt(5), attrs: { agent: 'asd-tester', tier: 'mechanical' } }]);

  const handover = runtime.timingAppend(scope.text, { close: 'scope', open: 'plan', kind: 'phase' }, minuteAt(10));
  assert.deepStrictEqual(ledgerLines(handover.text).map((line) => [line.op, line.id]), [['close', 'scope#1'], ['open', 'plan#1']], 'a close is written before the open of the same call');
  assert.deepStrictEqual(ledgerLines(handover.text)[0], { op: 'close', id: 'scope#1', kind: 'phase', parent: null, start: minuteAt(0), end: minuteAt(10), outcome: 'done', attrs: {} }, 'a close carries the full entry of the op it ends');

  const reentry = runtime.timingAppend(scope.text + handover.text, { close: 'plan', open: 'scope', kind: 'phase' }, minuteAt(20));
  assert.deepStrictEqual(ledgerLines(reentry.text).map((line) => line.id), ['plan#1', 'scope#2'], 'a phase opened again is a separate entry');

  const stray = runtime.timingAppend(scope.text, { close: 'ghost', outcome: 'interrupted' }, minuteAt(30));
  assert.strictEqual(stray.text, '', 'sprint-034 AC-13: a close of an id never opened appends nothing - an unpaired close line has no start to measure');
  assert.ok(stray.warnings.some((warning) => warning.includes('ghost')));

  const duplicate = runtime.timingAppend(scope.text + dispatch.text, { open: 'asd-tester impl-test#1', kind: 'dispatch' }, minuteAt(40));
  assert.strictEqual(duplicate.text, '', 'an open of an id already open writes nothing');
  assert.strictEqual(duplicate.warnings.length, 1);

  const torn = runtime.timingAppend(scope.text + '{"op":"op', { close: 'scope' }, minuteAt(50));
  assert.deepStrictEqual(ledgerLines(torn.text).map((line) => line.id), ['scope#1'], 'a half-written tail is ignored and the append starts a new line');
  assert.ok(torn.text.startsWith('\n'));
});

test('sprint-033 AC-18 (issues #100, #108, #111): a close of an open op cascades to its open children with a warning, an op a recovery closed interrupted closes again as continued from that close, and any other repeat close writes nothing and warns', () => {
  const scope = runtime.timingAppend('', { open: 'scope', kind: 'phase' }, minuteAt(0));
  const child = runtime.timingAppend(scope.text, { open: 'dev', kind: 'dispatch' }, minuteAt(5));
  const open = scope.text + child.text;

  const cascade = runtime.timingAppend(open, { close: 'scope', outcome: 'interrupted' }, minuteAt(10));
  assert.deepStrictEqual(ledgerLines(cascade.text).map((line) => [line.op, line.id, line.outcome, line.end]), [['close', 'dev', 'interrupted', minuteAt(10)], ['close', 'scope#1', 'interrupted', minuteAt(10)]], 'AC-18: the open child closes first, at the parent\'s end and with its outcome');
  assert.ok(cascade.warnings.some((warning) => warning.includes('dev')), 'the cascade names the child it closed');

  const recovered = open + runtime.timingRecover(open, minuteAt(20)).text;
  const continued = runtime.timingAppend(recovered, { close: 'dev' }, minuteAt(40));
  assert.deepStrictEqual(ledgerLines(continued.text).map((line) => [line.op, line.id, line.outcome, line.start, line.end]), [['close', 'dev', 'continued', minuteAt(20), minuteAt(40)]], 'AC-18: the close after a recovery runs from the recovery close and records continued');
  assert.deepStrictEqual(continued.warnings, []);

  const repeat = runtime.timingAppend(recovered + continued.text, { close: 'dev' }, minuteAt(50));
  assert.strictEqual(repeat.text, '', 'AC-18: a second close of the same id writes no line');
  assert.ok(repeat.warnings.some((warning) => warning.includes('already closed')));
  const repeatDone = runtime.timingAppend(scope.text + runtime.timingAppend(scope.text, { close: 'scope' }, minuteAt(8)).text, { close: 'scope' }, minuteAt(9));
  assert.strictEqual(repeatDone.text, '', 'a repeat close of a done op is skipped too');

  const suite = runtime.timingAppend(scope.text, { open: 'suite full', kind: 'suite', attrs: 'scope=full' }, minuteAt(2));
  const suiteClosed = suite.text + runtime.timingAppend(scope.text + suite.text, { close: 'suite full' }, minuteAt(3)).text;
  const second = runtime.timingAppend(scope.text + suiteClosed, { open: 'suite full 2', kind: 'suite', attrs: 'scope=full' }, minuteAt(4));
  assert.deepStrictEqual(ledgerLines(second.text).map((line) => [line.op, line.id]), [['open', 'suite full 2']], 'AC-18: a repeat suite run opens under a new id and is never a reopening of the closed one');
});

test('sprint-033 AC-26 (issue #101): timingSummary lists as idle every stretch over SLOW_MINUTES of a closed phase that no other op covers, and nothing for a covered or shorter one', () => {
  const limit = runtime.SLOW_MINUTES;
  const ledger = opLines('impl#1', 'phase', null, 0, 3 * limit)
    + opLines('dev', 'dispatch', 'impl#1', 0, 5)
    + opLines('wait', 'user-wait', 'impl#1', 5 + limit - 5, 5 + limit - 5 + 3)
    + opLines('dev-2', 'dispatch', 'impl#1', 5 + limit - 5 + 3 + limit + 1, 3 * limit)
    + opLines('plan#1', 'phase', null, 3 * limit, 3 * limit + limit - 1);
  const { timing } = runtime.timingSummary(ledger, []);
  assert.deepStrictEqual(timing.gaps.idle, [{ phase: 'impl#1', start: minuteAt(5 + limit - 5 + 3), seconds: (limit + 1) * 60 }], 'AC-26: only the stretch past the limit is listed, at its start, with its length; a stretch of at most the limit and a phase with no children are not idle');
});

test('sprint-025 AC-2 (D2): every kind sprint-lifecycle.md "Operation timing" lists is accepted by the runtime and no other kind is', () => {
  const kindsLine = sectionOf('.asd/rules/sprint-lifecycle.md', 'Operation timing').split('\n').find((line) => line.startsWith('Kinds (attrs):')) || '';
  const kinds = kindsLine.split(';').map((entry) => /^(?:Kinds \(attrs\):)?\s*`([a-z-]+)`/.exec(entry)).filter(Boolean).map((match) => match[1]);
  assert.ok(kinds.length > 0, '"Operation timing" must keep its "Kinds (attrs):" line');
  for (const kind of kinds) {
    assert.doesNotThrow(() => runtime.timingAppend('', { open: 'probe', kind }, minuteAt(0)), `the rule lists kind ${kind}, so the runtime must record it`);
  }
  assert.throws(() => runtime.timingAppend('', { open: 'probe', kind: 'bogus' }, minuteAt(0)), /--kind/);
  assert.throws(() => runtime.timingAppend('', { open: 'probe' }, minuteAt(0)), /--kind/);
});

test('sprint-025 AC-4 (D4): timingRecover closes every open op as interrupted at the latest of its start, the ledger\'s last timestamp and the HEAD commit date, and leaves a closed ledger alone', () => {
  const ledger = opLines('wait', 'user-wait', 'impl#1', 2, 3)
    + JSON.stringify({ op: 'open', id: 'impl#1', kind: 'phase', parent: null, start: minuteAt(0), attrs: {} }) + '\n'
    + JSON.stringify({ op: 'open', id: 'dev', kind: 'dispatch', parent: 'impl#1', start: minuteAt(5), attrs: {} }) + '\n';

  const afterHead = ledgerLines(runtime.timingRecover(ledger, minuteAt(20)).text);
  assert.deepStrictEqual(afterHead.map((line) => [line.op, line.id, line.outcome, line.end]), [['close', 'impl#1', 'interrupted', minuteAt(20)], ['close', 'dev', 'interrupted', minuteAt(20)]]);

  const beforeHead = ledgerLines(runtime.timingRecover(ledger, minuteAt(1)).text);
  assert.ok(beforeHead.every((line) => line.end === minuteAt(5)), 'a HEAD date older than the ledger\'s last timestamp never moves an end before recorded activity');

  assert.strictEqual(runtime.timingRecover(opLines('impl#1', 'phase', null, 0, 9), minuteAt(30)).text, '');
  assert.throws(() => runtime.timingRecover(ledger, 'not a date'), /HEAD commit date/);
});

test('sprint-025 AC-5 (D5, D6): timingSummary reports totals, wall/machine/user-wait/unaccounted time, the slow set with its excess, every user wait, rework, the archived median and the gaps - deterministically, and {"timing": null} without a ledger', () => {
  const step = runtime.SLOW_MINUTES + runtime.SLOW_TOP_N + 5;
  const slowMinutes = Array.from({ length: runtime.SLOW_TOP_N + 1 }, (unused, index) => runtime.SLOW_MINUTES + 1 + index);
  const waitMinutes = runtime.SLOW_MINUTES + 15;
  const phaseEnd = (slowMinutes.length + 1) * step + waitMinutes;
  const reentryStart = phaseEnd + 20;
  const reentryEnd = reentryStart + 20;
  const outsidePhase = phaseEnd + 5;
  const ledger = opLines('impl#1', 'phase', null, 0, phaseEnd)
    + slowMinutes.map((minutes, index) => opLines(`dev-${index}`, 'dispatch', 'impl#1', index * step, index * step + minutes, index < 2 ? { agent: 'asd-dev', tier: 'standard', model: 'm1' } : {})).join('')
    + opLines('quick', 'dispatch', 'impl#1', slowMinutes.length * step, slowMinutes.length * step + 2, {}, 'interrupted')
    + opLines('wait', 'user-wait', 'impl#1', slowMinutes.length * step + 3, slowMinutes.length * step + 3 + waitMinutes, { gate: 'approve' })
    + opLines('review iter-02', 'review-iteration', 'impl#1', 3, 4, { wave: '1', iteration: '2' })
    + opLines('outside', 'dispatch', null, outsidePhase, outsidePhase + 1)
    + opLines('impl#2', 'phase', null, reentryStart, reentryEnd)
    + JSON.stringify({ op: 'close', id: 'ghost', kind: null, parent: null, start: null, end: null, outcome: 'done', attrs: {} }) + '\n'
    + JSON.stringify({ op: 'open', id: 'late', kind: 'dispatch', parent: 'impl#2', start: minuteAt(reentryStart + 1), attrs: {} }) + '\n';

  const { timing } = runtime.timingSummary(ledger, []);
  const kindMedian = [1, 2, ...slowMinutes].sort((a, b) => a - b);
  const median = (kindMedian[kindMedian.length / 2 - 1] + kindMedian[kindMedian.length / 2]) / 2;
  assert.deepStrictEqual(
    [timing.wall_seconds, timing.machine_seconds, timing.user_wait_seconds, timing.unaccounted_seconds],
    [reentryEnd * 60, (phaseEnd + 20) * 60 - waitMinutes * 60, waitMinutes * 60, (reentryEnd - phaseEnd - 20) * 60],
    'wall, machine (phase union minus waits), user-wait and unaccounted (wall outside every phase) time'
  );
  assert.deepStrictEqual(timing.by_phase, { impl: { count: 2, seconds: (phaseEnd + 20) * 60 } });
  assert.strictEqual(timing.by_kind['user-wait'].count, 1);
  assert.deepStrictEqual(timing.by_model.find((row) => row.agent === 'asd-dev'), { agent: 'asd-dev', tier: 'standard', model: 'm1', count: 2, seconds: (slowMinutes[0] + slowMinutes[1]) * 60 });

  const slowest = timing.slow.map((op) => op.id);
  assert.deepStrictEqual(slowest, slowMinutes.map((unused, index) => `dev-${index}`).reverse(), `the top ${runtime.SLOW_TOP_N} leaf ops plus every one over ${runtime.SLOW_MINUTES} minutes, longest first; a short op, a review iteration and a user wait never`);
  assert.strictEqual(timing.slow[0].excess_seconds, Math.round((slowMinutes[slowMinutes.length - 1] - median) * 60), 'excess is the op\'s time over the median of its kind in this sprint');

  assert.deepStrictEqual(timing.user_waits.map((wait) => [wait.gate, wait.seconds]), [['approve', waitMinutes * 60]], 'a user wait is listed whatever its length');
  assert.deepStrictEqual([timing.rework.reentries.ids, timing.rework.iterations.ids, timing.rework.interrupted.ids], [['impl#2'], ['review iter-02'], ['quick']]);
  assert.deepStrictEqual([timing.gaps.close_without_open, timing.gaps.outside_phase, timing.gaps.open.map((entry) => entry.id)], [['ghost'], ['outside'], ['late']]);
  assert.strictEqual(timing.baseline, null);

  const shortMinutes = Array.from({ length: runtime.SLOW_TOP_N + 2 }, (unused, index) => index + 1);
  const shortLedger = shortMinutes.map((minutes) => opLines(`d${minutes}`, 'dispatch', null, 0, minutes)).join('');
  assert.deepStrictEqual(
    runtime.timingSummary(shortLedger, []).timing.slow.map((op) => op.id),
    shortMinutes.slice(-runtime.SLOW_TOP_N).reverse().map((minutes) => `d${minutes}`),
    'with nothing over the minutes limit the slow set is still the top-N longest'
  );

  const archived = [opLines('impl#1', 'phase', null, 0, 10), opLines('impl#1', 'phase', null, 0, 30)];
  assert.deepStrictEqual(runtime.timingSummary(ledger, archived).timing.baseline.by_phase, { impl: { median_seconds: 20 * 60, sprints: 2 } });
  assert.strictEqual(runtime.timingSummary(ledger, archived).timing.baseline.ledgers, 2);
  assert.deepStrictEqual(runtime.timingSummary(ledger, []), runtime.timingSummary(ledger, []), 'no clock is read');
  assert.deepStrictEqual(runtime.timingSummary(null, []), { timing: null });
});

test('sprint-025 AC-5 (D5, D6): the slow set ranks machine time with user-wait overlap subtracted, skips an op another machine op names as its parent, and keeps parallel siblings eligible; a duplicate phase open is skipped', () => {
  const slow = (ledger) => runtime.timingSummary(ledger, []).timing.slow;
  const filler = Array.from({ length: runtime.SLOW_TOP_N + 1 }, (unused, index) => opLines(`f${index}`, 'dispatch', null, 100, 110 + index)).join('');

  const waited = slow(filler + opLines('waited', 'dispatch', null, 0, runtime.SLOW_MINUTES + 10) + opLines('w', 'user-wait', null, 0, runtime.SLOW_MINUTES + 5));
  assert.ok(!waited.some((op) => op.id === 'waited'), 'a dispatch long only for the user wait over it is neither over the limit nor in the top-N');
  const [partial] = slow(opLines('p', 'dispatch', null, 0, 20) + opLines('w', 'user-wait', null, 10, 30));
  assert.deepStrictEqual([partial.seconds, partial.excess_seconds], [600, 0], 'only the overlap is subtracted from the duration');

  const nested = slow(opLines('outer', 'dispatch', 'impl#1', 0, 50) + opLines('inner', 'suite', 'outer', 5, 10) + opLines('x', 'dispatch', 'impl#1', 60, 70) + opLines('y', 'dispatch', 'impl#1', 62, 72));
  assert.deepStrictEqual(nested.map((op) => op.id).sort(), ['inner', 'x', 'y'], 'a dispatch with a child op is not ranked; parallel siblings under one phase both are');

  const phase = JSON.stringify({ op: 'open', id: 'impl#1', kind: 'phase', parent: null, start: minuteAt(0), attrs: {} }) + '\n';
  const again = runtime.timingAppend(phase, { open: 'impl', kind: 'phase' }, minuteAt(5));
  assert.strictEqual(again.text, '', 'a phase whose bare name is already open is not opened again');
  assert.strictEqual(again.warnings.length, 1);
});

test('sprint-025 AC-1/AC-4/AC-5 (D4): the timing commands write ISO-stamped, paired lines, are a no-op without --create, never fail the caller, and timing-summary reads the ledger and archived sprints', () => {
  const { spawnSync } = require('node:child_process');
  const root = mkTempDir();
  const ledger = path.join(root, 'timing.jsonl');
  const run = (...args) => spawnSync(process.execPath, [path.join(REPO_ROOT, '.asd', 'runtime.js'), ...args], { cwd: REPO_ROOT, encoding: 'utf8' });

  assert.strictEqual(run('timing', '--ledger', ledger, '--open', 'scope', '--kind', 'phase').status, 0);
  assert.ok(!fs.existsSync(ledger), 'without --create a missing ledger is a no-op');

  assert.strictEqual(run('timing', '--ledger', ledger, '--create', '--open', 'scope', '--kind', 'phase').status, 0);
  assert.strictEqual(run('timing', '--ledger', ledger, '--open', 'asd-tester impl-test#1', '--kind', 'dispatch', '--attrs', 'agent=asd-tester').status, 0);
  const unchanged = fs.readFileSync(ledger, 'utf8');
  const bad = run('timing', '--ledger', ledger, '--open', 'x', '--kind', 'bogus');
  assert.strictEqual(bad.status, 0, 'a recording failure never fails the caller');
  assert.ok(bad.stderr.includes('warning'));
  assert.strictEqual(fs.readFileSync(ledger, 'utf8'), unchanged, 'a rejected call writes nothing');

  assert.strictEqual(run('timing', '--ledger', ledger, '--close', 'asd-tester impl-test#1').status, 0);
  assert.strictEqual(run('timing-recover', '--ledger', ledger).status, 0);
  const lines = ledgerLines(fs.readFileSync(ledger, 'utf8'));
  assert.ok(lines.every((line) => ISO_UTC.test(line.op === 'open' ? line.start : line.end)), 'every stamp is runtime-written ISO 8601 UTC');
  assert.deepStrictEqual(lines.map((line) => `${line.op} ${line.id}`), ['open scope#1', 'open asd-tester impl-test#1', 'close asd-tester impl-test#1', 'close scope#1']);
  assert.deepStrictEqual(lines.map((line) => line.outcome), [undefined, undefined, 'done', 'interrupted'], 'recovery closes what is still open as interrupted and leaves a closed op alone');

  const archive = path.join(root, 'archived');
  fs.mkdirSync(path.join(archive, '001-old'), { recursive: true });
  const older = opLines('impl#1', 'phase', null, 0, 10);
  fs.writeFileSync(path.join(archive, '001-old', 'timing.jsonl'), older);
  fs.mkdirSync(path.join(archive, '002-none'));
  const summary = run('timing-summary', '--ledger', ledger, '--archive', archive);
  assert.deepStrictEqual(JSON.parse(summary.stdout), runtime.timingSummary(fs.readFileSync(ledger, 'utf8'), [older]), 'the CLI prints what timingSummary returns; a sprint without a ledger is skipped');
  assert.deepStrictEqual(JSON.parse(run('timing-summary', '--ledger', path.join(root, 'none.jsonl'), '--archive', archive).stdout), { timing: null });
  const usage = run('no-such-command');
  assert.ok(['timing', 'timing-recover', 'timing-summary'].every((command) => usage.stderr.includes(command)), 'the usage line names the new commands');
});

const SECTION_DOC = '# T\n## B\nb\n### C\nc\n## D\nd\n';

const SECTION_CASES = [
  ['nested sub-headings stay inside their parent', SECTION_DOC, 'B', '## B\nb\n### C\nc\n'],
  ['a deeper section stops at the next same-or-higher heading', SECTION_DOC, 'C', '### C\nc\n'],
  ['the last section runs to the end of the file', SECTION_DOC, 'D', '## D\nd\n'],
  ['a # line inside a code fence is no heading', '## B\n```\n# x\n```\n## D\n', 'B', '## B\n```\n# x\n```\n'],
  ['CRLF input is read as LF', '## B\r\nb\r\n## D\r\n', 'B', '## B\nb\n'],
  ['a shorter fence inside a longer one does not close it', '## B\n````\n```\n# x\n````\n## D\n', 'B', '## B\n````\n```\n# x\n````\n'],
  ['a fence of the other character does not close it', '## B\n```\n~~~\n# x\n```\n## D\n', 'B', '## B\n```\n~~~\n# x\n```\n'],
  ['a backtick info string with a backtick opens no fence, so the heading after it counts', '## B\n``` a`b\n## D\nd\n', 'D', '## D\nd\n'],
];

const SECTION_FAILS = [
  ['zero matches', SECTION_DOC, 'Z'],
  ['several matches', '## B\n## B\n', 'B'],
  ['a prefix is no match', '## Bee\n', 'B'],
];

test('sprint-026 AC-14 (D11): markdownSection returns the heading through the line before the next same-or-higher heading, and fails on zero or several matches', () => {
  for (const [name, text, heading, expected] of SECTION_CASES) assert.strictEqual(runtime.markdownSection(text, heading), expected, name);
  for (const [name, text, heading] of SECTION_FAILS) assert.throws(() => runtime.markdownSection(text, heading), /matches/, name);
});

const GRANT_FIXTURE = [
  { role: 'asd-dev', phase: '*', refs: ['a.md', 'b.md#X'] },
  { role: 'asd-dev', phase: 'impl', refs: ['b.md#X', 'c.md'] },
  { role: 'asd-dev', phase: 'impl-test', refs: ['d.md'] },
  { role: 'orchestrator', phase: '*', refs: ['o.md'] },
];

const GRANT_CASES = [
  ['a repeated ref keeps its first occurrence, in table order', 'asd-dev', 'impl', ['a.md', 'b.md#X', 'c.md']],
  ['a tier variant reads its base agent row, and * joins the phase row', 'asd-dev-mechanical', 'impl-test', ['a.md', 'b.md#X', 'd.md']],
  ['a * row matches every phase', 'asd-dev', 'retro', ['a.md', 'b.md#X']],
];

/** A providers.md stand-in holding only the grant table `rows`. */
function grantFixture(rows) {
  return `# P\n\n## Role-scoped context\n\n\`\`\`json\n${JSON.stringify(rows)}\n\`\`\`\n`;
}

test('sprint-026 AC-14 (D11): contextRefs collects the rows of the role (variant to base) for the phase or *, first occurrence wins, and a role without a row fails', () => {
  for (const [name, role, phase, expected] of GRANT_CASES) assert.deepStrictEqual(runtime.contextRefs(grantFixture(GRANT_FIXTURE), role, phase), expected, name);
  assert.throws(() => runtime.contextRefs(grantFixture(GRANT_FIXTURE), 'asd-tester', 'impl'), /no grant row/);
});

test('sprint-026 AC-14 (D11): contextBundle prefixes each section with its ref comment in ref order, takes a bare ref whole, and fails on any unresolved ref', () => {
  const files = { 'a.md': 'A1\nA2', 'b.md': '# T\n## X\nx\n## Y\ny\n', 'missing.md': null };
  assert.strictEqual(runtime.contextBundle(['a.md', 'b.md#X'], files), '<!-- a.md -->\nA1\nA2\n<!-- b.md#X -->\n## X\nx\n');
  for (const refs of [['a.md', 'missing.md'], ['b.md#Z'], ['b.md#X', 'a.md#Q']]) assert.throws(() => runtime.contextBundle(refs, files), /ref "/, refs.join(','));
});

test('sprint-026 AC-14 (D11): the context CLI writes no file for an unresolved role and, for a tier variant, writes its base agent\'s bundle', () => {
  const dir = mkTempDir();
  const missing = path.join(dir, 'none.md');
  const failed = runtimeCliResult(['context', '--role', 'asd-nobody', '--phase', 'impl', '--out', missing]);
  assert.strictEqual(failed.status, 1);
  assert.ok(!fs.existsSync(missing), 'a failed build must leave no file for the dispatch to read');
  const [base, variant] = ['asd-dev', 'asd-dev-mechanical'].map((role) => {
    const out = path.join(dir, `${role}.md`);
    runtimeCli(['context', '--role', role, '--phase', 'impl', '--out', out], { stdio: 'pipe' });
    return fs.readFileSync(out, 'utf8');
  });
  assert.strictEqual(variant, base);
});

/** The distinct phases a role's grant rows name, with * expanded to every workflow phase. */
function grantPhases(role, rows, workflowPhases) {
  const named = rows.filter((row) => row.role === role).map((row) => row.phase);
  return [...new Set(named.includes('*') ? [...named.filter((phase) => phase !== '*'), ...workflowPhases] : named)];
}

test('sprint-026 AC-14 (D11): every role of the grant table is an agent or the orchestrator, every phase it names is a workflow phase, and every ref resolves at HEAD for each of its role-phase pairs', () => {
  const rows = grantRows();
  const providers = readRepoFile('.asd/rules/providers.md');
  const workflowPhases = [...new Set(readWorkflowDefinitions().flatMap((definition) => definition.phases))];
  const agents = fs.readdirSync(path.join(REPO_ROOT, '.asd/agents')).filter((file) => file.endsWith('.md')).map((file) => file.slice(0, -3));
  const roles = [...new Set(rows.map((row) => row.role))];
  assert.deepStrictEqual(roles.filter((role) => role !== 'orchestrator' && !agents.includes(role)), [], 'a grant row for a role that is no agent is never read');
  assert.deepStrictEqual(agents.filter((agent) => !roles.includes(agent)), [], 'an agent without a grant row has no context bundle');
  const skillPhases = fs.readdirSync(path.join(REPO_ROOT, '.asd/skills')).filter((name) => !name.startsWith('asd-phase-')).flatMap((name) => [...readRepoFile(`.asd/skills/${name}/SKILL.md`).matchAll(/--role orchestrator --phase ([a-z-]+)/g)].map((match) => match[1]));
  assert.deepStrictEqual(skillPhases.slice().sort(), ['concept', 'design-system', 'stack'], 'sanity: the standalone skills the orchestrator runs inline outside any workflow build their own bundle - each names the phase its grant row carries');
  assert.deepStrictEqual(rows.map((row) => row.phase).filter((phase) => phase !== '*' && !workflowPhases.includes(phase) && !skillPhases.includes(phase)), [], 'a phase no workflow or standalone skill runs');
  assert.deepStrictEqual(skillPhases.filter((phase) => !rows.some((row) => row.role === 'orchestrator' && row.phase === phase)), [], 'a standalone skill building an orchestrator bundle for a phase with no grant row fails its own context build');
  let pairs = 0;
  for (const role of roles) {
    for (const phase of grantPhases(role, rows, workflowPhases)) {
      const refs = runtime.contextRefs(providers, role, phase);
      const files = Object.fromEntries(refs.map((ref) => ref.split('#')[0]).map((file) => [file, fs.existsSync(path.join(REPO_ROOT, file)) ? readRepoFile(file) : null]));
      assert.ok(runtime.contextBundle(refs, files).length > 0, `${role} in ${phase}`);
      pairs += 1;
    }
  }
  assert.ok(pairs >= 40, `sanity: the sweep must reach the role-phase pairs (got ${pairs})`);
});

test('sprint-034 AC-9 (033#A-4): a dispatch open fills its missing tier and model from the routed record, else from the agent lookup, never overwrites a given attr, warns for an attr no lookup supplies or a failing lookup, and leaves every other kind untouched', () => {
  const routedHits = { 'Task 1': { tier: 'standard', model: 'sonnet' } };
  const lookupLog = [];
  const lookups = {
    routed: (id) => { lookupLog.push(`routed ${id}`); return routedHits[id]; },
    agentAttrs: (agent) => { lookupLog.push(`agent ${agent}`); return { tier: 'mechanical', model: 'haiku' }; },
  };
  const open = (id, attrs, given = lookups, kind = 'dispatch') => runtime.timingAppend('', { open: id, kind, attrs }, minuteAt(0), given);
  const attrsOf = (result) => ledgerLines(result.text)[0].attrs;

  const routed = open('Task 1', 'agent=asd-dev');
  assert.deepStrictEqual(attrsOf(routed), { agent: 'asd-dev', tier: 'standard', model: 'sonnet' }, 'AC-9: a routed id supplies tier and model');
  assert.deepStrictEqual([routed.warnings, lookupLog], [[], ['routed Task 1']], 'AC-9: the agent lookup is not read once the routed record supplies both');

  lookupLog.length = 0;
  assert.deepStrictEqual(attrsOf(open('Task 9', 'agent=asd-dev-mechanical')), { agent: 'asd-dev-mechanical', tier: 'mechanical', model: 'haiku' }, 'AC-9: an id with no routed record falls to the agent\'s frontmatter lookup');
  assert.deepStrictEqual(lookupLog, ['routed Task 9', 'agent asd-dev-mechanical'], 'AC-9: the routed record is read first, then the agent lookup');

  assert.deepStrictEqual(attrsOf(open('Task 9', 'agent=asd-dev;tier=escalated')), { agent: 'asd-dev', tier: 'escalated', model: 'haiku' }, 'AC-9: an attr the caller gave is never overwritten; only the missing one is filled');

  const bare = open('Task 9', undefined, { routed: () => undefined });
  assert.deepStrictEqual(attrsOf(bare), {}, 'AC-9: with no routed record and no agent attr nothing is invented');
  assert.ok(bare.warnings.some((warning) => warning.includes('tier, model unresolved')), 'AC-9: an unresolved attr warns');

  const broken = open('Task 9', 'agent=asd-dev', { routed: () => { throw new Error('state unreadable'); } });
  assert.strictEqual(ledgerLines(broken.text).length, 1, 'AC-9: a failing lookup never stops the open from being recorded');
  assert.ok(broken.warnings.some((warning) => warning.includes('state unreadable')), 'AC-9: a failing lookup warns with its cause');

  lookupLog.length = 0;
  assert.deepStrictEqual(attrsOf(open('suite one', 'scope=full', lookups, 'suite')), { scope: 'full' }, 'AC-9: only a dispatch open is filled');
  assert.deepStrictEqual(lookupLog, [], 'AC-9: no lookup runs for another kind');
});

test('sprint-034 AC-9/AC-13: the timing command fills a dispatch open from the state.json beside the ledger and from the agent canon by the host rule (CLAUDECODE=1 reads the Claude model, any other shell the Codex one), and a close of a never-opened id appends nothing, warns and exits 0', () => {
  const { spawnSync } = require('node:child_process');
  const dir = mkTempDir();
  const ledger = path.join(dir, 'timing.jsonl');
  fs.writeFileSync(path.join(dir, 'state.json'), JSON.stringify({ task_routing: { 'Task 1': { tier: 'standard', resolved_model: 'routed-model' } } }));
  const devMeta = sync.parseCanonicalFrontmatter(sync.readNormalized(path.join(REPO_ROOT, '.asd/agents/asd-dev.md'))).meta;
  assert.notStrictEqual(devMeta.claude.model, devMeta.codex.model, 'sanity: the host rule is observable only when the two hosts name different models');
  const hostEnv = (claudeCode) => {
    const env = { ...process.env };
    delete env.CLAUDECODE;
    return claudeCode ? { ...env, CLAUDECODE: '1' } : env;
  };
  const timing = (args, env = hostEnv(false)) => {
    const outcome = spawnSync(process.execPath, [RUNTIME_JS, 'timing', '--ledger', ledger, ...args], { encoding: 'utf8', env });
    assert.strictEqual(outcome.status, 0, `timing never stops the workflow: ${outcome.stderr}`);
    return outcome;
  };
  const lastAttrs = () => ledgerLines(fs.readFileSync(ledger, 'utf8')).pop().attrs;

  timing(['--create', '--open', 'impl', '--kind', 'phase']);
  timing(['--open', 'Task 1', '--kind', 'dispatch']);
  assert.deepStrictEqual(lastAttrs(), { tier: 'standard', model: 'routed-model' }, 'AC-9: a routed id is filled from task_routing of the state.json beside the ledger');
  timing(['--open', 'dev-claude', '--kind', 'dispatch', '--attrs', 'agent=asd-dev-mechanical'], hostEnv(true));
  assert.deepStrictEqual(lastAttrs(), { agent: 'asd-dev-mechanical', tier: 'mechanical', model: devMeta.variants.mechanical.claude.model }, 'AC-9: under CLAUDECODE=1 the variant suffix names the tier and the variant\'s Claude model is recorded');
  timing(['--open', 'dev-codex', '--kind', 'dispatch', '--attrs', 'agent=asd-dev-mechanical']);
  assert.deepStrictEqual(lastAttrs(), { agent: 'asd-dev-mechanical', tier: 'mechanical', model: devMeta.variants.mechanical.codex.model }, 'AC-9: in any other shell the variant\'s Codex model is recorded');
  timing(['--open', 'dev-base', '--kind', 'dispatch', '--attrs', 'agent=asd-dev'], hostEnv(true));
  assert.deepStrictEqual(lastAttrs(), { agent: 'asd-dev', tier: 'standard', model: devMeta.claude.model }, 'AC-9: a base agent is tier standard with its own host model');

  const before = fs.readFileSync(ledger, 'utf8');
  const ghost = timing(['--close', 'never-opened']);
  assert.strictEqual(fs.readFileSync(ledger, 'utf8'), before, 'AC-13: the ledger is untouched by a close of an id never opened');
  assert.ok(ghost.stderr.includes('never-opened matches no open op'), `AC-13: the close warns on stderr, got ${JSON.stringify(ghost.stderr)}`);
});

test('sprint-034 AC-9 (D-5): a routed execution-agent id is filled with asd-dev for tier standard and asd-dev-<tier> otherwise, an execution-command id gets no agent and warns naming it, and a given agent attr is never overwritten', () => {
  const { spawnSync } = require('node:child_process');
  const dir = mkTempDir();
  const ledger = path.join(dir, 'timing.jsonl');
  const route = (execution, tier) => ({ execution, tier, resolved_model: `${tier}-model` });
  const routing = {
    'Task standard': route('agent', 'standard'),
    'Task escalated': route('agent', 'escalated'),
    'Task mechanical': route('agent', 'mechanical'),
    'Task command': route('command', 'mechanical'),
    'Task given': route('agent', 'escalated'),
  };
  fs.writeFileSync(path.join(dir, 'state.json'), JSON.stringify({ task_routing: routing }));
  const timing = (args) => {
    const outcome = spawnSync(process.execPath, [RUNTIME_JS, 'timing', '--ledger', ledger, ...args], { encoding: 'utf8' });
    assert.strictEqual(outcome.status, 0, `timing never stops the workflow: ${outcome.stderr}`);
    return outcome;
  };
  const openDispatch = (id, ...attrs) => timing(['--open', id, '--kind', 'dispatch', ...attrs]);
  const lastAttrs = () => ledgerLines(fs.readFileSync(ledger, 'utf8')).pop().attrs;

  timing(['--create', '--open', 'impl', '--kind', 'phase']);
  for (const [id, agent] of [['Task standard', 'asd-dev'], ['Task escalated', 'asd-dev-escalated'], ['Task mechanical', 'asd-dev-mechanical']]) {
    const outcome = openDispatch(id);
    assert.deepStrictEqual(lastAttrs(), { agent, tier: routing[id].tier, model: routing[id].resolved_model }, `AC-9: ${id} is recorded with its agent, tier and model from task_routing`);
    assert.ok(!outcome.stderr.includes('unresolved'), `AC-9: ${id} resolves every attr, got ${JSON.stringify(outcome.stderr)}`);
  }

  const command = openDispatch('Task command');
  assert.deepStrictEqual(lastAttrs(), { tier: 'mechanical', model: 'mechanical-model' }, 'AC-9: an execution-command id names no agent');
  assert.ok(command.stderr.includes('Task command: agent unresolved'), `AC-9: the unresolved agent is named in the warning, got ${JSON.stringify(command.stderr)}`);

  openDispatch('Task given', '--attrs', 'agent=my-agent');
  assert.strictEqual(lastAttrs().agent, 'my-agent', 'AC-9: an agent attr the caller gave is never overwritten by the routed one');
});

test('sprint-036 AC-7: timing --open of an id the ledger holds, open or closed, appends nothing and warns with the next free #<n>, a repeat op takes that id, the task_routing lookup strips the #<n>, and a flag given twice warns on stderr with the last value winning', () => {
  const dir = mkTempDir();
  const ledger = path.join(dir, 'timing.jsonl');
  fs.writeFileSync(path.join(dir, 'state.json'), JSON.stringify({ task_routing: { 'Task 1': { tier: 'standard', resolved_model: 'routed-model' } } }));
  const timing = (args) => {
    const outcome = runtimeSpawn(['timing', '--ledger', ledger, ...args]);
    assert.strictEqual(outcome.status, 0, `timing never stops the workflow: ${outcome.stderr}`);
    return outcome;
  };
  const ledgerText = () => fs.readFileSync(ledger, 'utf8');

  timing(['--create', '--open', 'impl', '--kind', 'phase']);
  timing(['--open', 'Task 1', '--kind', 'dispatch']);
  let before = ledgerText();
  const whileOpen = timing(['--open', 'Task 1', '--kind', 'dispatch']);
  assert.deepStrictEqual([ledgerText(), /next free id Task 1#2/.test(whileOpen.stderr)], [before, true], 'AC-7: an open of an id still open appends nothing and names the next free id');
  timing(['--close', 'Task 1']);
  before = ledgerText();
  const afterClose = timing(['--open', 'Task 1', '--kind', 'dispatch']);
  assert.deepStrictEqual([ledgerText(), /next free id Task 1#2/.test(afterClose.stderr)], [before, true], 'AC-7: an open of a closed id appends nothing either - a closed id is never reopened');

  timing(['--open', 'Task 1#2', '--kind', 'dispatch']);
  const repeat = ledgerLines(ledgerText()).pop();
  assert.deepStrictEqual([repeat.id, repeat.attrs], ['Task 1#2', { tier: 'standard', model: 'routed-model' }], 'AC-7: the repeat op opens under the suggested id and its attrs fill from the Task 1 routing entry, the #<n> stripped for the lookup');
  before = ledgerText();
  const third = timing(['--open', 'Task 1#2', '--kind', 'dispatch']);
  assert.deepStrictEqual([ledgerText(), /next free id Task 1#3/.test(third.stderr)], [before, true], 'AC-7: with #2 held too the next free id is #3');

  const twice = timing(['--open', 'Task 2', '--kind', 'dispatch', '--attrs', 'agent=asd-dev', '--attrs', 'agent=asd-tester']);
  assert.deepStrictEqual([/flag --attrs given more than once, the last value wins/.test(twice.stderr), ledgerLines(ledgerText()).pop().attrs.agent], [true, 'asd-tester'], 'AC-7: a repeated flag warns and the last value still wins');
  const once = timing(['--open', 'Task 3', '--kind', 'dispatch', '--attrs', 'agent=asd-dev']);
  assert.ok(!/more than once/.test(once.stderr), 'AC-7: a flag given once warns of nothing');
});

test('sprint-036 AC-14: agent-liveness --returns reports an agent whose return file passes the persist-review checks as done, without a transcript and silently, and leaves an agent whose return file is missing, interrupted or checked against a missing manifest, or whose returns file is unparseable, to the transcript verdict', () => {
  const root = mkTempDir();
  const scope = path.join(root, 'scope.txt');
  fs.writeFileSync(scope, 'src/a.md\n', 'utf8');
  runtimeCli(['emit-manifest', '--reviewer', 'quality', '--phase', 'impl-review', '--files', scope, '--out', root], { stdio: 'pipe' });
  const manifestPath = path.join(root, 'quality.manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const vocabulary = runtime.LEDGER_VOCABULARY;
  const ledger = {
    manifest_digest: manifest.digest,
    findings: [],
    files: manifest.files.map((i) => ({ i, s: vocabulary.files[0] })),
    rules: manifest.rules.map((i) => (manifest.n_a.rules[i] ? { i, s: vocabulary.p, p: manifest.n_a.rules[i][0] } : { i, s: vocabulary.rules[0] })),
    sections: manifest.sections.map((i) => ({ i, s: vocabulary.sections[0] })),
  };
  const valid = path.join(root, 'valid.md');
  fs.writeFileSync(valid, `[REVIEW-impl-quality]: APPROVE\n\n# Review - quality\n\n## Findings\n\n| # | Severity | Location | Description | Suggested fix |\n|---|---|---|---|---|\n\n## Coverage\n\n\`\`\`json\n${JSON.stringify(ledger)}\n\`\`\`\n`, 'utf8');
  const interrupted = path.join(root, 'interrupted.md');
  fs.writeFileSync(interrupted, 'I ran out of turns before the ledger.\n', 'utf8');
  const otherReviewer = path.join(root, 'other-reviewer.md');
  fs.writeFileSync(otherReviewer, fs.readFileSync(valid, 'utf8').replace('[REVIEW-impl-quality]', '[REVIEW-impl-efficiency]'), 'utf8');
  const externalManifest = path.join(root, 'external.scope.json');
  fs.writeFileSync(externalManifest, JSON.stringify({ phase: 'design-review', iteration: 1, files: [], diff: null }), 'utf8');
  const externalReturn = (phase) => {
    const file = path.join(root, `external-${phase}.md`);
    fs.writeFileSync(file, `[REVIEW-${phase}-external]: APPROVE\n\n# Review - external\n\n## Findings\n\n| # | Severity | Location | Description | Suggested fix |\n|---|---|---|---|---|\n`, 'utf8');
    return file;
  };
  const returns = path.join(root, 'returns.json');
  fs.writeFileSync(returns, JSON.stringify({
    a1: { return: valid, manifest: manifestPath },
    b2: { return: interrupted, manifest: manifestPath },
    c3: { return: path.join(root, 'absent.md'), manifest: manifestPath },
    d4: { return: valid, manifest: path.join(root, 'absent.manifest.json') },
    e5: { return: otherReviewer, manifest: manifestPath },
    g7: { return: externalReturn('design'), manifest: externalManifest },
    h8: { return: externalReturn('impl'), manifest: externalManifest },
  }), 'utf8');

  const configDir = mkTempDir();
  const subagents = path.join(configDir, 'projects', 'project', 'session', 'subagents');
  fs.mkdirSync(subagents, { recursive: true });
  const idle = `${JSON.stringify({ type: 'user', timestamp: '2026-09-29T12:00:00.000Z', message: { role: 'user', content: [{ type: 'text', text: 'task' }] } })}\n`;
  ['b2', 'c3', 'd4', 'e5', 'h8'].forEach((id) => fs.writeFileSync(path.join(subagents, `agent-${id}.jsonl`), idle, 'utf8'));
  const env = { ...process.env, CLAUDE_CONFIG_DIR: configDir };
  const watch = (agents, returnsFile) => runtimeSpawn(['agent-liveness', '--agents', agents, '--interval', '1', '--returns', returnsFile], { env });

  const withReturns = watch('a1,b2,c3,d4,e5,g7,h8', returns);
  assert.deepStrictEqual([withReturns.status, withReturns.stdout], [0, 'STALL b2 no-progress\nSTALL c3 no-progress\nSTALL d4 no-progress\nSTALL e5 no-progress\nSTALL h8 no-progress\n'], 'AC-14: a1 is done by its valid return file though no transcript exists - without --returns it would fail for want of one - and so is g7, an External Review return against its scope manifest, while an interrupted, missing or manifest-less return, and a return whose verdict line names another reviewer (e5) or another phase (h8, against a scope manifest, which expects External Review) than its manifest change nothing');

  const unparseable = path.join(root, 'unparseable.json');
  fs.writeFileSync(unparseable, '{ not json', 'utf8');
  const ignored = watch('b2', unparseable);
  assert.deepStrictEqual([ignored.status, ignored.stdout], [0, 'STALL b2 no-progress\n'], 'AC-14: an unparseable returns file changes nothing');
});

const CONTEXT_CEILINGS_FILE = '.asd/project/context-ceilings.json';

const BUNDLE_KEY = /@/;

test('sprint-037 AC-1: context-check exits 0 over the committed ceilings, exits 1 naming the one bundle whose ceiling a seeded edit lowered below its size, and --seed --bundles writes a ceiling for the same role-phase keys the committed file holds, which a clean check then passes', () => {
  const committed = JSON.parse(readRepoFile(CONTEXT_CEILINGS_FILE));
  const clean = runtimeSpawn(['context-check']);
  assert.deepStrictEqual([clean.status, JSON.parse(clean.stdout)], [0, { over: [] }], 'every committed ceiling holds its bundle');

  const [lowered] = Object.keys(committed).filter((key) => BUNDLE_KEY.test(key));
  const loweredFile = path.join(mkTempDir(), 'ceilings.json');
  fs.writeFileSync(loweredFile, JSON.stringify({ ...committed, [lowered]: 1 }), 'utf8');
  const violated = runtimeSpawn(['context-check', '--ceilings', loweredFile]);
  assert.strictEqual(violated.status, 1, 'a bundle over its ceiling fails the check');
  assert.deepStrictEqual(JSON.parse(violated.stdout).over.map((entry) => entry.key), [lowered], 'only the lowered key is reported');

  const seededFile = path.join(mkTempDir(), 'seeded.json');
  assert.strictEqual(runtimeSpawn(['context-check', '--seed', '--bundles', '--ceilings', seededFile]).status, 0, '--seed writes the file');
  const seeded = JSON.parse(fs.readFileSync(seededFile, 'utf8'));
  assert.deepStrictEqual(Object.keys(seeded), Object.keys(committed), 'the committed ceilings cover exactly the role-phase pairs and project rule files a fresh seed derives - a role or phase added without a ceiling fails here');
  assert.strictEqual(runtimeSpawn(['context-check', '--ceilings', seededFile]).status, 0, 'a seeded file passes the check it was seeded for');
});

test('sprint-037 AC-2/AC-18: a dispatch open takes context_bytes from its bundle lookup unless the caller gave one, timing-summary totals bundle bytes per agent and names unsized dispatches, and suite_full holds the sprint\'s longest full suite, a baseline median only from three archived full suites, and over only past 1.5 times it', () => {
  const lookups = { contextBytes: (id) => (id === 'sized' ? 1000 : undefined) };
  const attrsOf = (id, attrs) => ledgerLines(runtime.timingAppend('', { open: id, kind: 'dispatch', attrs }, minuteAt(0), lookups).text)[0].attrs;
  const base = 'agent=asd-dev;tier=standard;model=m';
  assert.strictEqual(Number(attrsOf('sized', base).context_bytes), 1000, 'the bundle size fills a dispatch open');
  assert.strictEqual(Number(attrsOf('sized', `${base};context_bytes=5`).context_bytes), 5, 'a size the caller gave wins');
  assert.ok(!('context_bytes' in attrsOf('unsized', base)), 'no bundle file leaves the attr absent');

  const dispatch = (id, agent, bytes) => opLines(id, 'dispatch', 'impl#1', 1, 2, bytes === undefined ? { agent } : { agent, context_bytes: bytes });
  const bundles = opLines('impl#1', 'phase', null, 0, 30) + dispatch('d1', 'asd-dev', 100) + dispatch('d2', 'asd-dev', 200) + dispatch('d3', 'asd-tester', 50) + dispatch('d4', 'asd-dev');
  assert.deepStrictEqual(runtime.timingSummary(bundles, []).timing.context_bytes, { total: 350, by_agent: { 'asd-dev': { count: 2, bytes: 300 }, 'asd-tester': { count: 1, bytes: 50 } }, dispatches_without: ['d4'] });

  const suite = (minutes, scope = 'full') => opLines('suite impl-review#1', 'suite', null, 0, minutes, { scope });
  const archived = (...minutes) => minutes.map((value) => suite(value));
  const suiteFull = (sprint, older) => runtime.timingSummary(sprint, older).timing.suite_full;
  const sprintLedger = (minutes) => opLines('impl#1', 'phase', null, 0, 40) + suite(minutes) + opLines('suite impl-test#1', 'suite', null, 0, 35, { scope: 'impacted' });
  assert.deepStrictEqual(suiteFull(sprintLedger(10), archived(2, 4, 6)), { sprint_seconds: 600, baseline_median: 240, over: true }, 'ten minutes against a four-minute median is past 1.5 times it; the longer impacted run is not counted');
  assert.deepStrictEqual(suiteFull(sprintLedger(5), archived(2, 4, 6)), { sprint_seconds: 300, baseline_median: 240, over: false });
  assert.deepStrictEqual(suiteFull(sprintLedger(10), archived(2, 4)), { sprint_seconds: 600, baseline_median: null, over: false }, 'two archived samples give no baseline');
  assert.deepStrictEqual(suiteFull(opLines('impl#1', 'phase', null, 0, 5), archived(2, 4, 6)), { sprint_seconds: null, baseline_median: 240, over: false }, 'a sprint with no full suite is never over');
});
