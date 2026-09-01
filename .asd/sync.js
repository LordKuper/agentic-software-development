#!/usr/bin/env node
// ASD multi-provider sync engine (Stage 0: contracts + engine, no real migration yet).
// Generates Claude Code / Codex provider-views from canonical agent/skill sources.
// Zero deps: fs, path, crypto only. See plans/multi-provider-support.md (SSoT for
// every contract below - ownership classes, digest algorithm, marker formats,
// update.js state machine).
//
// Exposed as a CommonJS module for tests/run.js; also runnable as a CLI:
//   node .asd/sync.js --check
//   node .asd/sync.js --apply <file> [<file> ...]

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SCHEMA_VERSION = 1;
const BLOCK_BEGIN = '<!-- asd:begin v=1 -->';
const BLOCK_END = '<!-- asd:end -->';

// ---------------------------------------------------------------------------
// Normalization + hashing
// ---------------------------------------------------------------------------

// UTF-8, no BOM, LF line endings - applied both before writing and before
// hashing (plan: "Digest и нормализация").
function normalizeText(input) {
  let s = input;
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1); // strip UTF-8 BOM
  s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return s;
}

function sha256Hex(text) {
  return crypto.createHash('sha256').update(Buffer.from(text, 'utf8')).digest('hex');
}

function digestTag(text) {
  return 'sha256:' + sha256Hex(text);
}

function readNormalized(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return normalizeText(raw);
}

function writeNormalized(filePath, text) {
  const normalized = normalizeText(text);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, normalized, { encoding: 'utf8' });
}

// ---------------------------------------------------------------------------
// Path safety (reject traversal / absolute / drive / UNC / symlink targets)
// ---------------------------------------------------------------------------

function isSafeRelPath(relPath) {
  if (typeof relPath !== 'string' || relPath.length === 0) return false;
  if (path.isAbsolute(relPath)) return false;
  if (/^[A-Za-z]:/.test(relPath)) return false; // drive letter
  if (/^\\\\/.test(relPath) || /^\/\//.test(relPath)) return false; // UNC
  const parts = relPath.split(/[\\/]/);
  if (parts.some((p) => p === '..')) return false;
  return true;
}

function isSymlink(targetPath) {
  try {
    return fs.lstatSync(targetPath).isSymbolicLink();
  } catch (_) {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Canonical source parsing: JSON frontmatter (no YAML parser - JSON.parse only)
// ---------------------------------------------------------------------------

// Invalid JSON must fail closed, before any write (plan: "Invalid JSON/TOML/
// frontmatter останавливает sync до первой записи").
function parseCanonicalFrontmatter(rawNormalizedText) {
  if (!rawNormalizedText.startsWith('---\n')) {
    throw new Error('canonical source must start with a "---" frontmatter fence');
  }
  const closeIdx = rawNormalizedText.indexOf('\n---\n', 4);
  const closeAtEof = rawNormalizedText.indexOf('\n---', 4) === rawNormalizedText.length - 4;
  let jsonText;
  let bodyStart;
  if (closeIdx !== -1) {
    jsonText = rawNormalizedText.slice(4, closeIdx + 1);
    bodyStart = closeIdx + 5;
  } else if (closeAtEof) {
    jsonText = rawNormalizedText.slice(4, rawNormalizedText.length - 4);
    bodyStart = rawNormalizedText.length;
  } else {
    throw new Error('canonical source frontmatter fence not closed');
  }
  let meta;
  try {
    meta = JSON.parse(jsonText);
  } catch (err) {
    throw new Error('canonical frontmatter is not valid JSON: ' + err.message);
  }
  const body = rawNormalizedText.slice(bodyStart).replace(/^\n+/, '');
  return { meta, body };
}

// ---------------------------------------------------------------------------
// Model family resolution (release-manifest table; canon speaks in aliases)
// ---------------------------------------------------------------------------

function resolveModelFamily(manifest, provider, familyAlias) {
  const table = manifest && manifest.model_families && manifest.model_families[provider];
  if (!table || !Object.prototype.hasOwnProperty.call(table, familyAlias)) {
    throw new Error(`unknown model family "${familyAlias}" for provider "${provider}"`);
  }
  return table[familyAlias];
}

// ---------------------------------------------------------------------------
// Full-file ownership marker (first line; TOML uses a # comment)
// ---------------------------------------------------------------------------

function buildFullFileMarker({ format, sourceRelPath, sourceDigest, contentDigest, asdVersion }) {
  const text = `ASD generated. Edit .asd/${sourceRelPath}. source_digest=sha256:${sourceDigest} content_digest=sha256:${contentDigest} asd_version=${asdVersion} schema=${SCHEMA_VERSION}`;
  if (format === 'toml') return `# ${text}`;
  if (format === 'js') return `// ${text}`;
  // 'md' marker lands inside the frontmatter block (see renderFullFile) - must
  // be a YAML-legal comment, not an HTML comment, or the frontmatter fails to
  // parse.
  if (format === 'md') return `# ${text}`;
  return `<!-- ${text} -->`;
}

const MARKER_RE = /^(?:<!--|#|\/\/)\s*ASD generated\. Edit (\.asd\/[^.]+\.[^\s]+)\. source_digest=sha256:([0-9a-f]{64}) content_digest=sha256:([0-9a-f]{64}) asd_version=(\S+) schema=(\d+)\s*(?:-->)?\s*$/;

function parseFullFileMarker(line) {
  const m = MARKER_RE.exec(line.trim());
  if (!m) return null;
  return {
    sourceRelPath: m[1],
    sourceDigest: m[2],
    contentDigest: m[3],
    asdVersion: m[4],
    schema: Number(m[5]),
  };
}

// Markdown targets (agents, skills) carry YAML/JSON frontmatter that Claude
// Code / Codex require to start at byte 0 (`---` as line 1). A marker line
// prepended before that fence breaks frontmatter parsing entirely - so for
// 'md' format the marker lives as line 2, right after the opening `---`,
// instead of line 1. TOML (`#` comment) and JS (`//` comment) targets have no
// such constraint and keep the marker as the literal first line.
function splitMarkerAndBody(text) {
  const lines = text.split('\n');
  if (parseFullFileMarker(lines[0] || '')) {
    return { parsed: parseFullFileMarker(lines[0]), body: lines.slice(1).join('\n') };
  }
  if ((lines[0] || '').trim() === '---' && parseFullFileMarker(lines[1] || '')) {
    return { parsed: parseFullFileMarker(lines[1]), body: [lines[0], ...lines.slice(2)].join('\n') };
  }
  return { parsed: null, body: text };
}

// ---------------------------------------------------------------------------
// Transforms: canonical agent -> Claude .md / Codex .toml
// ---------------------------------------------------------------------------

function yamlQuote(str) {
  return '"' + String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

function yamlFlowList(arr) {
  return '[' + arr.join(', ') + ']';
}

// Generic per-provider body templating: replaces `{{key}}` with values[key]
// ONLY when key is an own property of values (i.e. the canonical frontmatter
// actually set it under claude{}/codex{}) - any other `{{...}}` placeholder
// (e.g. runtime-resolved ones like {{SPRINT}}, {{PHASE}}) is left untouched
// since it never appears as a key here. A typo'd placeholder name that never
// matches an actual meta key is left in the output verbatim (loud, not
// silently blanked) rather than swallowed.
function substitutePlaceholders(body, values) {
  return body.replace(/\{\{(\w+)\}\}/g, (m, key) => (Object.prototype.hasOwnProperty.call(values, key) ? values[key] : m));
}

// Only these agent-wrapper keys are wired up (asd-external-review is the sole
// consumer today) - narrow on purpose, any agent COULD use these placeholder
// names in its body, but this isn't a general templating engine.
// wraps_invoke_args: the wrapped CLI's non-interactive-mode argument tail -
// genuinely differs per CLI (Codex's `exec -` vs Claude Code's `-p "..."
// --output-format text`), not just the binary name, so it's a separate key
// from wraps_cli rather than assumed to be a fixed suffix.
function wrapsCliValues(providerMeta) {
  const values = {};
  if (providerMeta.wraps_cli !== undefined) values.wraps_cli = providerMeta.wraps_cli;
  if (providerMeta.wraps_config_key !== undefined) values.wraps_config_key = providerMeta.wraps_config_key;
  if (providerMeta.wraps_invoke_args !== undefined) values.wraps_invoke_args = providerMeta.wraps_invoke_args;
  return values;
}

function transformAgentClaude(meta, body, manifest) {
  const c = meta.claude || {};
  const lines = ['---'];
  lines.push(`name: ${meta.name}`);
  lines.push(`description: ${yamlQuote(meta.description)}`);
  if (Array.isArray(c.tools)) lines.push(`tools: ${yamlFlowList(c.tools)}`);
  // ponytail: emit disallowedTools only when non-empty - avoids `disallowedTools: []`
  // noise on every generated agent; plan doesn't specify empty-array behavior.
  if (Array.isArray(c.disallowedTools) && c.disallowedTools.length > 0) {
    lines.push(`disallowedTools: ${yamlFlowList(c.disallowedTools)}`);
  }
  if (c.model) lines.push(`model: ${resolveModelFamily(manifest, 'claude', c.model)}`);
  // ASSUMPTION: plan's "Канонический формат агента" section literally lists
  // `effort` as a field the plan says Claude frontmatter supports ("Claude
  // frontmatter поддерживает tools, disallowedTools, model, effort, maxTurns,
  // memory (подтверждено docs)") - followed literally here, even though this
  // is not a documented Claude Code subagent field today.
  if (c.effort) lines.push(`effort: ${c.effort}`);
  if (c.maxTurns !== undefined) lines.push(`maxTurns: ${c.maxTurns}`);
  if (c.memory) lines.push(`memory: ${c.memory}`);
  lines.push('---');
  lines.push('');
  const substitutedBody = substitutePlaceholders(body, wrapsCliValues(c));
  lines.push(substitutedBody.replace(/\n+$/, ''));
  lines.push('');
  return lines.join('\n');
}

function tomlEscapeBasic(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function tomlMultilineBody(body) {
  const trimmed = body.replace(/\n+$/, '');
  if (trimmed.includes('"""')) {
    throw new Error('developer_instructions body contains a literal """ - not supported by the stage-0 TOML writer');
  }
  return `"""\n${trimmed}\n"""`;
}

function transformAgentCodexToml(meta, body, manifest) {
  const c = meta.codex || {};
  const lines = [];
  lines.push(`name = "${tomlEscapeBasic(meta.name)}"`);
  lines.push(`description = "${tomlEscapeBasic(meta.description)}"`);
  if (c.model) lines.push(`model = "${tomlEscapeBasic(resolveModelFamily(manifest, 'codex', c.model))}"`);
  if (c.model_reasoning_effort) lines.push(`model_reasoning_effort = "${tomlEscapeBasic(c.model_reasoning_effort)}"`);
  if (c.sandbox_mode) lines.push(`sandbox_mode = "${tomlEscapeBasic(c.sandbox_mode)}"`);
  const substitutedBody = substitutePlaceholders(body, wrapsCliValues(c));
  lines.push(`developer_instructions = ${tomlMultilineBody(substitutedBody)}`);
  lines.push('');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Transforms: canonical skill -> Claude SKILL.md / Codex SKILL.md
//
// ASSUMPTION: the plan fixes agent frontmatter fields exactly but only says
// skills get "provider-frontmatter + short preamble" without naming the
// canonical skill JSON schema. Narrowest reading used here: name + description
// (required by both providers per the plan's own Codex skills reference), plus
// an optional claude.allowed-tools passthrough matching this repo's existing
// SKILL.md convention. Codex gets name+description only (plan: "frontmatter
// name+description; progressive disclosure").
// ---------------------------------------------------------------------------

const PROVIDERS_PREAMBLE = 'Operation mapping: see `.asd/rules/providers.md`.';

function transformSkillClaude(meta, body) {
  const c = meta.claude || {};
  const lines = ['---'];
  lines.push(`name: ${meta.name}`);
  lines.push(`description: ${yamlQuote(meta.description)}`);
  if (c['allowed-tools']) lines.push(`allowed-tools: ${yamlQuote(c['allowed-tools'])}`);
  lines.push('---');
  lines.push('');
  lines.push(PROVIDERS_PREAMBLE);
  lines.push('');
  lines.push(body.replace(/\n+$/, ''));
  lines.push('');
  return lines.join('\n');
}

function transformSkillCodex(meta, body) {
  const lines = ['---'];
  lines.push(`name: ${meta.name}`);
  lines.push(`description: ${yamlQuote(meta.description)}`);
  lines.push('---');
  lines.push('');
  lines.push(PROVIDERS_PREAMBLE);
  lines.push('');
  lines.push(body.replace(/\n+$/, ''));
  lines.push('');
  return lines.join('\n');
}

// Hooks have no per-provider content difference (plan doesn't specify one for
// session-start.js): the "transform" is an identity copy, ownership proof is
// carried entirely by the marker line prepended by renderFullFile.
function transformHookCopy(_meta, body) {
  return body.replace(/\n+$/, '') + '\n';
}

const TRANSFORMS = {
  'agent-claude': { fn: transformAgentClaude, format: 'md' },
  'agent-codex': { fn: transformAgentCodexToml, format: 'toml' },
  'skill-claude': { fn: transformSkillClaude, format: 'md' },
  'skill-codex': { fn: transformSkillCodex, format: 'md' },
  'hook-claude': { fn: transformHookCopy, format: 'js' },
  'hook-codex': { fn: transformHookCopy, format: 'js' },
};

// ---------------------------------------------------------------------------
// Full-file class: render + status + apply
// ---------------------------------------------------------------------------

function renderFullFile({ kind, sourceRelPath, canonRawNormalized, meta, body, manifest, asdVersion }) {
  const t = TRANSFORMS[kind];
  if (!t) throw new Error(`unknown transform kind "${kind}"`);
  const rendered = t.fn(meta, body, manifest);
  const bodyOut = normalizeText(rendered).replace(/\n*$/, '\n');
  const contentDigest = sha256Hex(bodyOut);
  const sourceDigest = sha256Hex(canonRawNormalized);
  const marker = buildFullFileMarker({
    format: t.format,
    sourceRelPath,
    sourceDigest,
    contentDigest,
    asdVersion,
  });
  // 'md' targets (agents, skills) need frontmatter's `---` as the literal
  // first byte for Claude Code / Codex to parse it - splice the marker in as
  // line 2 instead of prepending it. See splitMarkerAndBody for the read side.
  let output;
  if (t.format === 'md' && bodyOut.startsWith('---\n')) {
    output = '---\n' + marker + '\n' + bodyOut.slice(4);
  } else {
    output = marker + '\n' + bodyOut;
  }
  return { output, body: bodyOut, marker, contentDigest, sourceDigest, format: t.format };
}

// Returns one of: missing | foreign | modified-foreign | current | stale
function statusFullFile(targetPath, expectedContentDigest) {
  if (!fs.existsSync(targetPath)) return 'missing';
  if (isSymlink(targetPath)) return 'foreign';
  const text = readNormalized(targetPath);
  const { parsed, body: actualBody } = splitMarkerAndBody(text);
  // No marker at all = no ownership proof = modified-foreign; sync must never
  // silently overwrite (plan + task conflict-scenario requirement).
  if (!parsed) return 'modified-foreign';
  const actualContentDigest = sha256Hex(actualBody);
  // The marker's own content_digest records what sync itself last wrote. If
  // the actual body no longer matches it, the file was hand-edited outside
  // sync - that is modified-foreign regardless of whether canon has also
  // since changed. Only when the body still matches what sync last wrote do
  // we compare against a fresh re-render to decide current vs stale (plan:
  // "stale определяется re-render'ом", but that formula only applies to
  // untampered files - re-render was never meant to launder a hand-edit).
  if (actualContentDigest !== parsed.contentDigest) return 'modified-foreign';
  return actualContentDigest === expectedContentDigest ? 'current' : 'stale';
}

function applyFullFile(targetPath, output) {
  writeNormalized(targetPath, output);
}

// ---------------------------------------------------------------------------
// Managed-block class: AGENTS.md / CLAUDE.md
// ---------------------------------------------------------------------------

// Skips exactly one line ending (`\r\n` or `\n`) starting at idx, if present.
// applyManagedBlock reads RAW (non-normalized) text to preserve foreign bytes
// byte-for-byte, so the boundary right after BLOCK_BEGIN/BLOCK_END may
// legitimately be CRLF, not just LF - a single-`\n`-only skip left the `\r`
// behind (folded into `inner`, corrupting its digest) or left the whole
// `\r\n` behind after BLOCK_END (producing a duplicate line break once our
// own LF-terminated marker line was prepended - the reported "\n\r\n before
// the user tail" bug). Blocks WE write are always plain-LF internally; this
// only matters for the boundary against pre-existing raw content.
function skipEol(text, idx) {
  if (text[idx] === '\r' && text[idx + 1] === '\n') return idx + 2;
  if (text[idx] === '\n') return idx + 1;
  return idx;
}

function findManagedBlock(text) {
  const beginIdx = text.indexOf(BLOCK_BEGIN);
  if (beginIdx === -1) return null;
  const innerStart = skipEol(text, beginIdx + BLOCK_BEGIN.length);
  const endIdx = text.indexOf(BLOCK_END, innerStart);
  if (endIdx === -1) return null;
  const inner = text.slice(innerStart, endIdx);
  const afterEnd = endIdx + BLOCK_END.length;
  const blockEnd = skipEol(text, afterEnd);
  return { beginIdx, endIdx, innerStart, inner, blockEnd };
}

function statusManagedBlock(targetPath, relKey, renderedBlockBody, syncState) {
  if (!fs.existsSync(targetPath)) return 'missing';
  if (isSymlink(targetPath)) return 'foreign';
  const text = readNormalized(targetPath);
  const block = findManagedBlock(text);
  if (!block) return 'missing'; // safe to insert without touching existing bytes
  const currentDigest = sha256Hex(block.inner);
  const stateEntry = syncState.entries && syncState.entries[relKey];
  // No sync-state record for a block that already exists = we can't prove we
  // wrote it = modified-foreign (mirrors full-file's "no marker" rule).
  if (!stateEntry || stateEntry.content_digest !== digestTag(block.inner)) return 'modified-foreign';
  const expectedDigest = sha256Hex(normalizeText(renderedBlockBody).replace(/\n*$/, '\n'));
  return currentDigest === expectedDigest ? 'current' : 'stale';
}

function applyManagedBlock(targetPath, relKey, renderedBlockBody, syncState) {
  const body = normalizeText(renderedBlockBody).replace(/\n*$/, '\n');
  // Read RAW (not normalized) so any foreign content outside the block - its
  // own BOM, CRLF, whatever the user's editor wrote - survives byte-for-byte.
  // findManagedBlock's indexOf-based marker search works fine on raw/mixed
  // line-ending text: the marker lines we control are always plain-LF, since
  // we're the only writer of the block's own boundary lines.
  const existingRaw = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, 'utf8') : '';
  const block = existingRaw ? findManagedBlock(existingRaw) : null;
  let next;
  if (block) {
    next = existingRaw.slice(0, block.beginIdx) + BLOCK_BEGIN + '\n' + body + BLOCK_END + '\n' + existingRaw.slice(block.blockEnd);
  } else if (existingRaw.length > 0) {
    const sep = existingRaw.endsWith('\n') ? '' : '\n';
    next = existingRaw + sep + '\n' + BLOCK_BEGIN + '\n' + body + BLOCK_END + '\n';
  } else {
    next = BLOCK_BEGIN + '\n' + body + BLOCK_END + '\n';
  }
  // Raw write, deliberately NOT writeNormalized: normalizing here would
  // re-launder the foreign bytes we just took care to preserve above.
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, next, { encoding: 'utf8' });
  syncState.entries = syncState.entries || {};
  syncState.entries[relKey] = { kind: 'managed-block', content_digest: digestTag(body) };
}

// ---------------------------------------------------------------------------
// Structural JSON-merge class: .claude/settings.json / .codex/hooks.json
//
// Owned entries are identified by a stable ASD key (`_asd: true`) inside an
// array at `ownedPathArr` (e.g. ['hooks', 'SessionStart']). Every other key
// in the target JSON is left untouched - never read for merge decisions
// beyond navigating down to ownedPathArr, never rewritten.
// ---------------------------------------------------------------------------

function stableStringify(value) {
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return '{' + keys.map((k) => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}';
  }
  return JSON.stringify(value);
}

function getOwnedArray(obj, ownedPathArr) {
  let cur = obj;
  for (const key of ownedPathArr) {
    if (cur == null || typeof cur !== 'object') return [];
    cur = cur[key];
  }
  return Array.isArray(cur) ? cur : [];
}

function setOwnedArray(obj, ownedPathArr, arr) {
  let cur = obj;
  for (let i = 0; i < ownedPathArr.length - 1; i++) {
    const key = ownedPathArr[i];
    if (cur[key] == null || typeof cur[key] !== 'object') cur[key] = {};
    cur = cur[key];
  }
  cur[ownedPathArr[ownedPathArr.length - 1]] = arr;
}

// ---------------------------------------------------------------------------
// Minimal JSON byte-span scanner (zero-dep). NOT a general JSON editor - just
// enough to locate the exact source-text span of the value at a known
// key-path inside a raw JSON object, so applyJsonMerge can splice the new
// owned-array text into that one span and leave every byte outside it -
// other keys, their original whitespace/indentation/order, BOM - untouched.
// Plain JSON.parse -> mutate -> JSON.stringify (the old approach) reformats
// the ENTIRE document; this only regenerates the one array ASD owns.
// ---------------------------------------------------------------------------

const JSON_WS = new Set([' ', '\t', '\n', '\r']);

function skipJsonWs(text, i) {
  while (i < text.length && JSON_WS.has(text[i])) i++;
  return i;
}

function scanJsonString(text, i) {
  // text[i] === '"'
  let j = i + 1;
  while (j < text.length) {
    if (text[j] === '\\') { j += 2; continue; }
    if (text[j] === '"') return j + 1;
    j++;
  }
  return j; // malformed (unterminated) - caller already validated via JSON.parse upstream in practice
}

// Scans one JSON value (any type) starting at index i and returns the index
// just past it. Recurses into objects/arrays only to skip over them
// correctly (nesting, strings-with-braces, etc.) - never inspects their
// content beyond that.
function scanJsonValueEnd(text, i) {
  i = skipJsonWs(text, i);
  const c = text[i];
  if (c === '"') return scanJsonString(text, i);
  if (c === '{' || c === '[') return scanJsonContainerEnd(text, i, c === '{' ? '}' : ']');
  if (c === 't') return i + 4; // true
  if (c === 'f') return i + 5; // false
  if (c === 'n') return i + 4; // null
  let j = i; // number
  while (j < text.length && /[-+0-9.eE]/.test(text[j])) j++;
  return j;
}

function scanJsonContainerEnd(text, i, closeCh) {
  const openCh = text[i];
  let j = skipJsonWs(text, i + 1);
  if (text[j] === closeCh) return j + 1; // empty
  for (;;) {
    if (openCh === '{') {
      j = scanJsonString(text, j); // key
      j = skipJsonWs(text, j);
      j++; // ':'
    }
    j = scanJsonValueEnd(text, j); // value / element
    j = skipJsonWs(text, j);
    if (text[j] === ',') { j = skipJsonWs(text, j + 1); continue; }
    break;
  }
  j = skipJsonWs(text, j);
  return j + 1; // closing bracket
}

// Finds { keyStart, valueStart, valueEnd } for `key` inside the JSON OBJECT
// whose opening `{` is at text[objStart]. Returns null if not present at
// this object's own top level (caller falls back to structural insert -
// nothing to byte-preserve at a location that doesn't exist yet).
function findObjectKeySpan(text, objStart, key) {
  if (text[objStart] !== '{') return null;
  let j = skipJsonWs(text, objStart + 1);
  if (text[j] === '}') return null; // empty object
  for (;;) {
    const keyStrStart = j;
    const keyStrEnd = scanJsonString(text, j);
    const keyName = JSON.parse(text.slice(keyStrStart, keyStrEnd));
    j = skipJsonWs(text, keyStrEnd);
    j++; // ':'
    const valueStart = skipJsonWs(text, j);
    const valueEnd = scanJsonValueEnd(text, valueStart);
    if (keyName === key) return { keyStrStart, valueStart, valueEnd };
    j = skipJsonWs(text, valueEnd);
    if (text[j] === ',') { j = skipJsonWs(text, j + 1); continue; }
    break;
  }
  return null;
}

// Walks ownedPathArr from the document root, returning the FINAL segment's
// value span, or null if any segment along the way is missing or the root
// isn't a JSON object.
function findPathSpan(text, pathArr) {
  let objStart = skipJsonWs(text, 0);
  let span = null;
  for (const key of pathArr) {
    span = findObjectKeySpan(text, objStart, key);
    if (!span) return null;
    objStart = span.valueStart; // only valid for non-final segments, which must themselves be objects (true for every real ownedPathArr this engine uses, e.g. ['hooks','SessionStart'])
  }
  return span;
}

// Returns the exact [start,end) span of every element in the JSON array
// starting at text[arrStart] === '[', in source order. Lets the merge logic
// keep each FOREIGN element's own bytes untouched (its internal formatting,
// key order, whitespace) while only regenerating the elements ASD itself
// owns - splicing a whole array's text can't preserve "the byte layout of
// the array" once membership changes (that's not a gap, it's logically
// unavoidable), but every individual element that survives keeps its exact
// original bytes.
function scanArrayElements(text, arrStart) {
  const elements = [];
  let j = skipJsonWs(text, arrStart + 1);
  if (text[j] === ']') return elements;
  for (;;) {
    const start = j;
    const end = scanJsonValueEnd(text, j);
    elements.push({ start, end });
    j = skipJsonWs(text, end);
    if (text[j] === ',') { j = skipJsonWs(text, j + 1); continue; }
    break;
  }
  return elements;
}

// Walks pathArr as far as EXISTING intermediate objects allow. Returns the
// deepest existing object's opening-brace index plus whatever path segments
// still need to be created under it (as nested objects, with the final
// segment holding the array). Used only when the full path isn't present yet
// - inserts the missing structure via splice, not a whole-document rewrite.
function findDeepestExistingObject(text, pathArr) {
  let objStart = skipJsonWs(text, 0);
  if (text[objStart] !== '{') return { objStart: null, remainingPath: pathArr.slice() };
  for (let i = 0; i < pathArr.length - 1; i++) {
    const span = findObjectKeySpan(text, objStart, pathArr[i]);
    if (!span || text[span.valueStart] !== '{') {
      return { objStart, remainingPath: pathArr.slice(i) };
    }
    objStart = span.valueStart;
  }
  return { objStart, remainingPath: [pathArr[pathArr.length - 1]] };
}

// Inserts `"key": valueText` into the object starting at text[objStart],
// right before its closing `}`, preserving every other byte of the document.
function insertKeyIntoObject(text, objStart, key, valueText) {
  const closeIdx = scanJsonContainerEnd(text, objStart, '}') - 1; // index of the '}' itself
  const innerStart = skipJsonWs(text, objStart + 1);
  const isEmpty = text[innerStart] === '}';
  const insertion = (isEmpty ? '\n  ' : ',\n  ') + JSON.stringify(key) + ': ' + valueText + '\n';
  return text.slice(0, closeIdx) + insertion + text.slice(closeIdx);
}

function statusJsonMerge(targetPath, relKey, ownedPathArr, renderedOwnedEntries, syncState) {
  if (!fs.existsSync(targetPath)) return 'missing';
  if (isSymlink(targetPath)) return 'foreign';
  const text = readNormalized(targetPath);
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (_) {
    // Fail closed: an unparsable target we're supposed to merge into is never
    // safe to touch.
    return 'modified-foreign';
  }
  const ownedEntries = getOwnedArray(parsed, ownedPathArr).filter((e) => e && e._asd === true);
  const currentDigest = sha256Hex(stableStringify(ownedEntries));
  const stateEntry = syncState.entries && syncState.entries[relKey];
  if (!stateEntry) {
    return ownedEntries.length === 0 ? 'missing' : 'modified-foreign';
  }
  if (stateEntry.content_digest !== digestTag(stableStringify(ownedEntries))) return 'modified-foreign';
  const expectedDigest = sha256Hex(stableStringify(renderedOwnedEntries));
  return currentDigest === expectedDigest ? 'current' : 'stale';
}

// Indents every line after the first by `pad`, so a multi-line
// JSON.stringify(_, null, 2) render nests visually inside its new container.
function indentContinuationLines(text, pad) {
  return text.split('\n').map((line, i) => (i === 0 ? line : pad + line)).join('\n');
}

// Pure render, zero side effects, THROWS on invalid pre-existing JSON (never
// swallowed here - callers that need a safe status check use statusJsonMerge
// instead, which does catch; this function backs the actual write path and
// must fail loud so a bad target aborts a multi-file --apply batch BEFORE
// any write, same contract as full-file's renderFullFile).
//
// Byte-for-byte outside the owned key-path: every other top-level key, a
// leading BOM, and - inside the owned array itself - every FOREIGN element's
// own exact bytes (internal formatting, key order) all survive untouched via
// text splicing. Only elements ASD itself owns (`_asd: true`) are
// regenerated, and the array's own container-level layout is rebuilt when
// membership changes - preserving "the byte layout of a container" while
// changing which elements it holds isn't a preservation gap, it's logically
// impossible; every individual foreign VALUE is what's actually preserved.
function renderJsonMerge(targetPath, ownedPathArr, renderedOwnedEntries) {
  const exists = fs.existsSync(targetPath);
  const rawExisting = exists ? fs.readFileSync(targetPath, 'utf8') : '';

  if (!exists) {
    const obj = {};
    setOwnedArray(obj, ownedPathArr, renderedOwnedEntries);
    return JSON.stringify(obj, null, 2) + '\n';
  }

  const hasBom = rawExisting.charCodeAt(0) === 0xfeff;
  const scanText = hasBom ? rawExisting.slice(1) : rawExisting;
  const bomPrefix = hasBom ? '﻿' : '';
  // Throws here (invalid JSON) is intentional and required - propagates up
  // through the caller to abort the whole --apply batch before any write.
  JSON.parse(scanText);

  const span = findPathSpan(scanText, ownedPathArr);
  if (span) {
    const elements = scanArrayElements(scanText, span.valueStart);
    const foreignTexts = [];
    for (const el of elements) {
      const elText = scanText.slice(el.start, el.end);
      let val;
      try { val = JSON.parse(elText); } catch (_) { val = null; }
      if (!(val && val._asd === true)) foreignTexts.push(elText);
    }
    const ownedTexts = renderedOwnedEntries.map((e) => indentContinuationLines(JSON.stringify(e, null, 2), '  '));
    const allTexts = foreignTexts.concat(ownedTexts);
    const arrayText = allTexts.length === 0 ? '[]' : '[\n  ' + allTexts.join(',\n  ') + '\n]';
    return bomPrefix + scanText.slice(0, span.valueStart) + arrayText + scanText.slice(span.valueEnd);
  }

  // Key path doesn't exist yet in this pre-existing file - nothing to byte-
  // preserve at a location that isn't there. Splice the missing structure in
  // (not a whole-document rewrite) - this only happens once, the first time
  // ASD's key is introduced into a file that predates it.
  const arrayText = renderedOwnedEntries.length === 0
    ? '[]'
    : '[\n  ' + renderedOwnedEntries.map((e) => indentContinuationLines(JSON.stringify(e, null, 2), '  ')).join(',\n  ') + '\n]';
  const { objStart, remainingPath } = findDeepestExistingObject(scanText, ownedPathArr);
  if (objStart === null) {
    // Root isn't even a JSON object - not a realistic settings.json/
    // hooks.json shape, but stay safe rather than guess.
    const obj = JSON.parse(scanText);
    setOwnedArray(obj, ownedPathArr, renderedOwnedEntries);
    return bomPrefix + JSON.stringify(obj, null, 2) + '\n';
  }
  let valueText = arrayText;
  for (let i = remainingPath.length - 1; i >= 1; i--) {
    valueText = '{\n    ' + JSON.stringify(remainingPath[i]) + ': ' + indentContinuationLines(valueText, '  ') + '\n  }';
  }
  return bomPrefix + insertKeyIntoObject(scanText, objStart, remainingPath[0], valueText);
}

// Write-only half, taking an ALREADY-RENDERED string - lets runApply's
// preflight pass call renderJsonMerge() early (so an invalid target throws
// before any write in the whole --apply batch) and pass 2 just write the
// result, without a second render/throw opportunity mid-write-pass.
function writeJsonMergeRendered(targetPath, relKey, nextRaw, renderedOwnedEntries, syncState) {
  // Raw write, deliberately not writeNormalized: normalizing here would
  // re-launder the foreign bytes the render step just preserved.
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, nextRaw, 'utf8');
  syncState.entries = syncState.entries || {};
  syncState.entries[relKey] = { kind: 'json-merge', content_digest: digestTag(stableStringify(renderedOwnedEntries)) };
}

function applyJsonMerge(targetPath, relKey, ownedPathArr, renderedOwnedEntries, syncState) {
  const nextRaw = renderJsonMerge(targetPath, ownedPathArr, renderedOwnedEntries);
  writeJsonMergeRendered(targetPath, relKey, nextRaw, renderedOwnedEntries, syncState);
}

// ---------------------------------------------------------------------------
// update.js state machine (pofile status classification per plan section
// "update.js: пофайловая state machine"). Pure/stateless: caller supplies the
// hashes it already computed (local file, old release manifest, new upstream).
// ---------------------------------------------------------------------------

// Returns one of:
//   'add'                 - new upstream file, not present locally -> write
//   'update'               - local unchanged since last release, upstream changed -> write
//   'noop'                 - nothing to do (already matches, or nothing tracked)
//   'delete'                - upstream removed the file, local matches old release -> delete
//   'keep-local-modified'   - upstream removed the file, local diverged -> keep + report
//   'conflict'              - local changed vs old release hash -> refuse, report
//   'conflict-foreign'      - new upstream path lands on pre-existing untracked local file -> refuse, report
//   'reject'                - unsafe path (traversal / absolute / drive / UNC)
//   'foreign'               - target is a symlink
function classifyUpdateItem({ relPath, existsLocally, localHash, oldReleaseHash, newUpstreamHash, upstreamExists, targetPathForSymlinkCheck }) {
  if (!isSafeRelPath(relPath)) return 'reject';
  if (targetPathForSymlinkCheck && isSymlink(targetPathForSymlinkCheck)) return 'foreign';

  if (!upstreamExists) {
    if (!existsLocally) return 'noop';
    return localHash === oldReleaseHash ? 'delete' : 'keep-local-modified';
  }

  if (!existsLocally) return 'add';

  if (!oldReleaseHash) {
    // File exists locally but manifest never tracked it before (pre-existing
    // foreign file, or first-ever manifest run).
    return localHash === newUpstreamHash ? 'noop' : 'conflict-foreign';
  }

  if (localHash === oldReleaseHash) {
    return oldReleaseHash === newUpstreamHash ? 'noop' : 'update';
  }

  // Local diverged from what we shipped last release.
  return localHash === newUpstreamHash ? 'noop' : 'conflict';
}

// ---------------------------------------------------------------------------
// Manifest / sync-state IO
// ---------------------------------------------------------------------------

function findRepoRoot(startDir) {
  let dir = path.resolve(startDir || process.cwd());
  for (;;) {
    if (fs.existsSync(path.join(dir, '.asd'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return path.resolve(startDir || process.cwd());
    dir = parent;
  }
}

function loadReleaseManifest(repoRoot) {
  const p = path.join(repoRoot, '.asd', 'release-manifest.json');
  const manifest = JSON.parse(readNormalized(p));
  if (manifest.schema_version !== SCHEMA_VERSION) {
    throw new Error(`release-manifest.json schema_version ${manifest.schema_version} is not supported (expected ${SCHEMA_VERSION}) - fail-closed`);
  }
  return manifest;
}

function loadSyncState(repoRoot) {
  const p = path.join(repoRoot, '.asd', 'sync-state.json');
  if (!fs.existsSync(p)) return { schema_version: SCHEMA_VERSION, entries: {} };
  const state = JSON.parse(readNormalized(p));
  if (state.schema_version !== SCHEMA_VERSION) {
    throw new Error(`sync-state.json schema_version ${state.schema_version} is not supported (expected ${SCHEMA_VERSION}) - fail-closed`);
  }
  state.entries = state.entries || {};
  return state;
}

function saveSyncState(repoRoot, state) {
  const p = path.join(repoRoot, '.asd', 'sync-state.json');
  writeNormalized(p, JSON.stringify(state, null, 2) + '\n');
}

// ---------------------------------------------------------------------------
// CLI (Stage 0: engine only - real canon trees land in Stage 1, so an empty
// canon directory is a normal, green outcome here, not an error).
// ---------------------------------------------------------------------------

// Repo-root managed-block contract.
//
// CLAUDE.md's body is generated from `.asd/templates/t_CLAUDE.md` - reading
// the actual template file (not a hardcoded copy of its expected content) so
// an edit to the template is what makes this target 'stale', propagating
// through the normal generator contract like every other canonical source.
// Falls back to the plan's documented default only if the template is
// somehow missing (shouldn't happen post-bootstrap, but never crash on it).
const CLAUDE_MD_BLOCK_BODY_FALLBACK = '@AGENTS.md\n';

function readClaudeMdBlockBody(repoRoot) {
  const templatePath = path.join(repoRoot, '.asd', 'templates', 't_CLAUDE.md');
  if (!fs.existsSync(templatePath)) return CLAUDE_MD_BLOCK_BODY_FALLBACK;
  return readNormalized(templatePath);
}

// AGENTS.md has two genuinely different sources depending on WHOSE repo this
// is, and sync.js is the same script shipped to both:
// - The ASD framework's OWN repo: AGENTS.md is hand-authored framework-dev
//   guidance, unrelated to t_AGENTS.md (that template is for CONSUMERS, a
//   completely different document/audience). No generator exists for this -
//   it stays "self-sourced": sync.js can only verify nobody edited the block
//   without going through sync (drift detection), never that the prose
//   matches a formula.
// - A consumer project: AGENTS.md's managed block IS generated from
//   `.asd/templates/t_AGENTS.md`, exactly like CLAUDE.md's - so a template
//   update actually reaches the consumer's file via the normal
//   check/stale/apply flow instead of silently never propagating.
//
// Distinguishing signal: `.asd/project/config.yaml` only exists after
// `/asd-init` has run - which never happens in the framework's own repo (its
// own docs explicitly say so) and always happens before a consumer's
// AGENTS.md is ever synced. No new file/flag needed.
function isInitializedConsumerProject(repoRoot) {
  return fs.existsSync(path.join(repoRoot, '.asd', 'project', 'config.yaml'));
}

// Fail-closed top-level `self_hosting:` field reader - a minimal line scanner,
// not a YAML parser (this repo has none). Returns 'enabled' only when the
// field occurs EXACTLY ONCE at top level (column 0) with exactly that value;
// every other case (file missing, field missing, any other/malformed value,
// OR a duplicated top-level key - ambiguous, must not silently take "the
// first" or "the last" match) returns 'disabled' - the safe default that
// never mistakes an ordinary consumer project for the framework repo. Plan
// SSoT: self_hosting is the ONLY signal for self-hosting mode, no separate
// marker file.
function readSelfHostingField(repoRoot) {
  const p = path.join(repoRoot, '.asd', 'project', 'config.yaml');
  if (!fs.existsSync(p)) return 'disabled';
  let text;
  try {
    text = readNormalized(p);
  } catch (_) {
    return 'disabled';
  }
  const matches = [];
  for (const line of text.split('\n')) {
    const m = /^self_hosting:\s*([^\s#]+)/.exec(line);
    if (m) matches.push(m[1]);
  }
  if (matches.length !== 1) return 'disabled';
  return matches[0] === 'enabled' ? 'enabled' : 'disabled';
}

function isSelfHostingRepo(repoRoot) {
  return readSelfHostingField(repoRoot) === 'enabled';
}

// AGENTS.md ownership: self-sourced (framework-dev guidance, never generated)
// when EITHER no config.yaml exists yet (pre-init consumer clone - nothing to
// generate from until /asd-init runs) OR the project explicitly declares
// self_hosting: enabled (this repo, post-bootstrap, even though its own
// config.yaml exists). Otherwise (initialized consumer project, self_hosting
// disabled/absent) AGENTS.md is generated from t_AGENTS.md as before.
function isSelfSourcedAgentsMd(repoRoot) {
  return !isInitializedConsumerProject(repoRoot) || isSelfHostingRepo(repoRoot);
}

function readAgentsMdTemplateBody(repoRoot) {
  const templatePath = path.join(repoRoot, '.asd', 'templates', 't_AGENTS.md');
  return readNormalized(templatePath);
}

// Owned SessionStart hook-registration entries. Kept next to each other so
// the two host conventions (Claude's matcher+hooks wrapper vs a flat Codex
// command entry) stay obviously in sync when the invocation changes.
// Claude Code hook commands run with an unspecified cwd (not guaranteed to be
// the project root - confirmed via Claude Code's own hooks-guide.md, which is
// exactly why it exposes `$CLAUDE_PROJECT_DIR`: "use absolute paths or
// ${CLAUDE_PROJECT_DIR} to reference scripts"). A bare relative path like
// `.asd/hooks/session-start.js` fails to even locate the file when cwd isn't
// the repo root - the script's own internal repo-root walk-up never gets a
// chance to run, because `node <bad-relative-path>` throws before Node
// executes anything. Quoting the whole expanded path guards against spaces.
function claudeSessionStartOwnedEntries() {
  return [
    {
      _asd: true,
      matcher: '.*',
      hooks: [{ type: 'command', command: 'node "$CLAUDE_PROJECT_DIR/.asd/hooks/session-start.js" --provider claude' }],
    },
  ];
}

// Codex hook commands run with the session's cwd (confirmed via Codex's own
// hooks doc: "Commands run with the session cwd as their working directory")
// - there is no Codex analogue to `$CLAUDE_PROJECT_DIR` (docs: "Standard
// Codex hooks don't receive special environment variables beyond what's
// inherited from the session"). The docs' own recommended fix for repo-local
// hooks is to resolve via git rather than a relative path: "prefer resolving
// from the git root... Codex may be started from a subdirectory."
// Schema: event -> array of matcher-groups -> `hooks[]` -> {type, command},
// `command` a single shell string (not an argv array) - matches Claude
// Code's own hook shape, confirmed against Codex's hooks.json docs example.
function codexSessionStartOwnedEntries() {
  return [
    {
      _asd: true,
      matcher: '.*',
      hooks: [{ type: 'command', command: 'node "$(git rev-parse --show-toplevel)/.asd/hooks/session-start.js" --provider codex' }],
    },
  ];
}

function buildSyncPlan(repoRoot) {
  // Discovers full-file-generated sources under .asd/agents, .asd/skills, and
  // .asd/hooks, plus the fixed repo-root managed-block (AGENTS.md/CLAUDE.md)
  // and json-merge (.claude/settings.json/.codex/hooks.json) targets. A
  // missing canon dir is still a normal, empty partial-plan outcome (e.g. a
  // repo that hasn't migrated agents/skills yet).
  const plan = [];
  const agentsDir = path.join(repoRoot, '.asd', 'agents');
  if (fs.existsSync(agentsDir)) {
    for (const f of fs.readdirSync(agentsDir)) {
      if (!f.endsWith('.md')) continue;
      const canonPath = path.join(agentsDir, f);
      const name = f.slice(0, -3);
      plan.push({ class: 'full-file', kind: 'agent-claude', canonPath, parse: true, targetPath: path.join(repoRoot, '.claude', 'agents', `${name}.md`) });
      plan.push({ class: 'full-file', kind: 'agent-codex', canonPath, parse: true, targetPath: path.join(repoRoot, '.codex', 'agents', `${name}.toml`) });
    }
  }
  // Every .asd/skills/<name>/SKILL.md is a canonical skill source, regardless
  // of whether <name> is a phase skill or not - target trees per plan's
  // "Целевая структура" (Codex skills live under .agents/skills/, not
  // .codex/).
  const skillsDir = path.join(repoRoot, '.asd', 'skills');
  if (fs.existsSync(skillsDir)) {
    for (const name of fs.readdirSync(skillsDir)) {
      const canonPath = path.join(skillsDir, name, 'SKILL.md');
      if (!fs.existsSync(canonPath)) continue;
      plan.push({ class: 'full-file', kind: 'skill-claude', canonPath, parse: true, targetPath: path.join(repoRoot, '.claude', 'skills', name, 'SKILL.md') });
      plan.push({ class: 'full-file', kind: 'skill-codex', canonPath, parse: true, targetPath: path.join(repoRoot, '.agents', 'skills', name, 'SKILL.md') });
    }
  }
  const hooksDir = path.join(repoRoot, '.asd', 'hooks');
  if (fs.existsSync(hooksDir)) {
    for (const f of fs.readdirSync(hooksDir)) {
      if (!f.endsWith('.js')) continue;
      const canonPath = path.join(hooksDir, f);
      const name = f.slice(0, -3);
      // No frontmatter on hook sources - the whole file is JS, runnable
      // directly as `node .asd/hooks/<name>.js` (plan's invocation contract).
      plan.push({ class: 'full-file', kind: 'hook-claude', canonPath, parse: false, targetPath: path.join(repoRoot, '.claude', 'hooks', `${name}.js`) });
      plan.push({ class: 'full-file', kind: 'hook-codex', canonPath, parse: false, targetPath: path.join(repoRoot, '.codex', 'hooks', `${name}.js`) });
    }
  }
  plan.push({
    class: 'managed-block',
    relKey: 'CLAUDE.md',
    targetPath: path.join(repoRoot, 'CLAUDE.md'),
    renderBody: () => readClaudeMdBlockBody(repoRoot),
  });
  if (isSelfSourcedAgentsMd(repoRoot)) {
    plan.push({
      class: 'managed-block',
      relKey: 'AGENTS.md',
      targetPath: path.join(repoRoot, 'AGENTS.md'),
      selfSourced: true,
    });
  } else {
    plan.push({
      class: 'managed-block',
      relKey: 'AGENTS.md',
      targetPath: path.join(repoRoot, 'AGENTS.md'),
      renderBody: () => readAgentsMdTemplateBody(repoRoot),
    });
  }
  plan.push({
    class: 'json-merge',
    relKey: '.claude/settings.json',
    targetPath: path.join(repoRoot, '.claude', 'settings.json'),
    ownedPathArr: ['hooks', 'SessionStart'],
    renderEntries: claudeSessionStartOwnedEntries,
  });
  plan.push({
    class: 'json-merge',
    relKey: '.codex/hooks.json',
    targetPath: path.join(repoRoot, '.codex', 'hooks.json'),
    ownedPathArr: ['hooks', 'SessionStart'],
    renderEntries: codexSessionStartOwnedEntries,
  });
  return plan;
}

function renderFullFileItem(item, repoRoot, manifest) {
  const canonRawNormalized = readNormalized(item.canonPath);
  let meta = {};
  let body = canonRawNormalized;
  if (item.parse) {
    const parsed = parseCanonicalFrontmatter(canonRawNormalized);
    meta = parsed.meta;
    body = parsed.body;
  }
  const sourceRelPath = path.relative(path.join(repoRoot, '.asd'), item.canonPath).replace(/\\/g, '/');
  return renderFullFile({
    kind: item.kind,
    sourceRelPath,
    canonRawNormalized,
    meta,
    body,
    manifest,
    asdVersion: manifest.asd_version,
  });
}

// Self-sourced managed blocks (no independent generator) can only be checked
// against their own last-tracked digest: read the block as it exists on disk
// and status it against itself, so the only possible outcomes are
// missing/foreign/modified-foreign/current - never a "stale" a re-render
// could produce, because there is no formula to re-render from.
function statusSelfSourcedManagedBlock(targetPath, relKey, syncState) {
  if (!fs.existsSync(targetPath)) return 'missing';
  if (isSymlink(targetPath)) return 'foreign';
  const text = readNormalized(targetPath);
  const block = findManagedBlock(text);
  if (!block) return 'missing';
  return statusManagedBlock(targetPath, relKey, block.inner, syncState);
}

function statusForPlanItem(item, repoRoot, manifest, syncState) {
  if (item.class === 'full-file') {
    const rendered = renderFullFileItem(item, repoRoot, manifest);
    return { status: statusFullFile(item.targetPath, rendered.contentDigest), rendered };
  }
  if (item.class === 'managed-block') {
    if (item.selfSourced) return { status: statusSelfSourcedManagedBlock(item.targetPath, item.relKey, syncState) };
    const body = item.renderBody();
    return { status: statusManagedBlock(item.targetPath, item.relKey, body, syncState), body };
  }
  if (item.class === 'json-merge') {
    const entries = item.renderEntries();
    return { status: statusJsonMerge(item.targetPath, item.relKey, item.ownedPathArr, entries, syncState), entries };
  }
  throw new Error(`unknown sync plan item class "${item.class}"`);
}

function runCheck(repoRoot) {
  const manifest = loadReleaseManifest(repoRoot);
  const syncState = loadSyncState(repoRoot);
  const plan = buildSyncPlan(repoRoot);
  const report = [];
  for (const item of plan) {
    const { status } = statusForPlanItem(item, repoRoot, manifest, syncState);
    report.push({ target: path.relative(repoRoot, item.targetPath).replace(/\\/g, '/'), status });
  }
  return report;
}

// Apply writes only the explicitly listed target files (repo-relative or
// absolute paths), matched against buildSyncPlan()'s targets across all three
// ownership classes. missing/stale -> write always; modified-foreign -> write
// ONLY when the caller passes it in `options.force` (a user-confirmed
// overwrite, e.g. from `/asd-sync`'s per-file "overwrite" choice) - current/
// foreign is never written (plan: "apply только явно перечисленного", "never
// overwrite silently" - force is the one explicit exception to "silently").
// Self-sourced managed blocks (AGENTS.md) have no generator to apply from -
// they are authored directly and only ever checked, never auto-applied here.
//
// Two-pass: every requested item is resolved AND rendered/statused in pass 1,
// before pass 2 writes anything. A bad canon source (invalid JSON/TOML
// frontmatter) throws during pass 1's render step, aborting the whole call
// with zero writes performed - even if it's the last file in a multi-file
// request and earlier ones would otherwise have rendered fine (plan: "Invalid
// JSON/TOML/frontmatter останавливает sync до первой записи").
function runApply(repoRoot, requestedFiles, options) {
  const manifest = loadReleaseManifest(repoRoot);
  const syncState = loadSyncState(repoRoot);
  const plan = buildSyncPlan(repoRoot);
  const planByRel = new Map();
  for (const item of plan) {
    const rel = path.relative(repoRoot, item.targetPath).replace(/\\/g, '/');
    planByRel.set(rel, item);
  }
  const forceSet = new Set((options && options.force) || []);

  // Pass 1: resolve + render/status every request. Throws here (invalid
  // canon) propagates before any write in pass 2 runs.
  const resolved = [];
  for (const reqRaw of requestedFiles) {
    const reqAbs = path.resolve(repoRoot, reqRaw);
    const rel = path.relative(repoRoot, reqAbs).replace(/\\/g, '/');
    const item = planByRel.get(rel);
    if (!item) {
      resolved.push({ rel, item: null });
      continue;
    }
    if (item.class === 'full-file') {
      const rendered = renderFullFileItem(item, repoRoot, manifest);
      const status = statusFullFile(item.targetPath, rendered.contentDigest);
      resolved.push({ rel, item, status, rendered });
    } else if (item.class === 'managed-block') {
      if (item.selfSourced) {
        resolved.push({ rel, item, status: statusSelfSourcedManagedBlock(item.targetPath, item.relKey, syncState), selfSourced: true });
      } else {
        const body = item.renderBody();
        const status = statusManagedBlock(item.targetPath, item.relKey, body, syncState);
        resolved.push({ rel, item, status, body });
      }
    } else if (item.class === 'json-merge') {
      const entries = item.renderEntries();
      const status = statusJsonMerge(item.targetPath, item.relKey, item.ownedPathArr, entries, syncState);
      // Eagerly render (not just status-check) anything this call would
      // actually write - renderJsonMerge throws on invalid pre-existing JSON,
      // and that throw must happen HERE, in the preflight pass, so it aborts
      // the whole batch before any write - including the force-a-conflict
      // case, which is exactly what a plain statusJsonMerge status check
      // (safe, try/catch) would not catch on its own.
      const willWrite = status === 'missing' || status === 'stale' || (status === 'modified-foreign' && forceSet.has(rel));
      const nextRaw = willWrite ? renderJsonMerge(item.targetPath, item.ownedPathArr, entries) : null;
      resolved.push({ rel, item, status, entries, nextRaw });
    }
  }

  // Pass 2: every render above already succeeded - write.
  const results = [];
  let stateChanged = false;
  for (const r of resolved) {
    if (!r.item) {
      results.push({ target: r.rel, status: 'unknown', applied: false });
      continue;
    }
    if (r.selfSourced) {
      results.push({
        target: r.rel,
        status: r.status,
        applied: false,
        note: 'self-sourced: author content directly, sync only verifies it was not hand-edited out of band',
      });
      continue;
    }
    const writable = r.status === 'missing' || r.status === 'stale' || (r.status === 'modified-foreign' && forceSet.has(r.rel));
    if (!writable) {
      results.push({ target: r.rel, status: r.status, applied: false });
      continue;
    }
    if (r.item.class === 'full-file') {
      applyFullFile(r.item.targetPath, r.rendered.output);
    } else if (r.item.class === 'managed-block') {
      applyManagedBlock(r.item.targetPath, r.item.relKey, r.body, syncState);
      stateChanged = true;
    } else if (r.item.class === 'json-merge') {
      writeJsonMergeRendered(r.item.targetPath, r.item.relKey, r.nextRaw, r.entries, syncState);
      stateChanged = true;
    }
    results.push({ target: r.rel, status: r.status, applied: true, forced: r.status === 'modified-foreign' });
  }
  if (stateChanged) saveSyncState(repoRoot, syncState);
  return results;
}

function main(argv) {
  const repoRoot = findRepoRoot(process.cwd());
  const args = argv.slice(2);
  if (args[0] === '--check') {
    const report = runCheck(repoRoot);
    process.stdout.write(JSON.stringify({ ok: true, items: report }, null, 2) + '\n');
    return 0;
  }
  if (args[0] === '--apply') {
    // `--force` is a trailing bare flag: when present, every listed file is
    // allowed to overwrite a `modified-foreign` status too (a user-confirmed
    // overwrite), not just missing/stale. It applies to the whole listed
    // batch because a caller (e.g. /asd-sync) invokes --apply per already-
    // confirmed file, never as a blanket "force everything unconditionally".
    const rest = args.slice(1);
    const forceIdx = rest.indexOf('--force');
    const force = forceIdx !== -1;
    const files = force ? rest.filter((_, i) => i !== forceIdx) : rest;
    const forceRels = force ? files.map((f) => path.relative(repoRoot, path.resolve(repoRoot, f)).replace(/\\/g, '/')) : [];
    const results = runApply(repoRoot, files, { force: forceRels });
    process.stdout.write(JSON.stringify({ ok: true, applied: results }, null, 2) + '\n');
    return 0;
  }
  process.stdout.write('usage: node .asd/sync.js --check | --apply <file...> [--force]\n');
  return 0;
}

if (require.main === module) {
  process.exitCode = main(process.argv);
}

module.exports = {
  SCHEMA_VERSION,
  BLOCK_BEGIN,
  BLOCK_END,
  normalizeText,
  sha256Hex,
  digestTag,
  readNormalized,
  writeNormalized,
  isSafeRelPath,
  isSymlink,
  parseCanonicalFrontmatter,
  resolveModelFamily,
  buildFullFileMarker,
  parseFullFileMarker,
  substitutePlaceholders,
  transformAgentClaude,
  transformAgentCodexToml,
  transformSkillClaude,
  transformSkillCodex,
  renderFullFile,
  statusFullFile,
  applyFullFile,
  findManagedBlock,
  statusManagedBlock,
  applyManagedBlock,
  stableStringify,
  statusJsonMerge,
  renderJsonMerge,
  writeJsonMergeRendered,
  applyJsonMerge,
  classifyUpdateItem,
  findRepoRoot,
  loadReleaseManifest,
  loadSyncState,
  saveSyncState,
  buildSyncPlan,
  runCheck,
  runApply,
  CLAUDE_MD_BLOCK_BODY_FALLBACK,
  readClaudeMdBlockBody,
  isInitializedConsumerProject,
  readSelfHostingField,
  isSelfHostingRepo,
  isSelfSourcedAgentsMd,
  readAgentsMdTemplateBody,
  claudeSessionStartOwnedEntries,
  codexSessionStartOwnedEntries,
  statusSelfSourcedManagedBlock,
};
