'use strict';

const fs = require('fs');
const path = require('path');
const { configEntries } = require('../runtime.js');

const CONFIG = '.asd/project/config.yaml';
const FORMAT = 'project.mockup_format';
const LEGACY = 'project.claude_design';
const UX = 'documents.ux_spec';
const FORMATS = ['none', 'html', 'claude_design', 'figma'];
const TOGGLES = ['enabled', 'disabled'];
const COMMENT = `# ${FORMATS.join(' | ')}`;
const OLD_HEADER = '# Format for UI mockups when they are enabled.';
const HEADER = '# UI mockup format, independent of documents.ux_spec. Use none to skip mockups.';
const LEGACY_COMMENT = '# enabled | disabled';
const LINE_ENDING = /\r?\n$/;

function rewriteSelection(line, entry, mode) {
  const [, indent, originalKey, gap, scalar, tail, ending = ''] = /^( *)([^:]+):( +[ \t]*)(.*?)([ \t]+#.*|[ \t]*)(\r?\n)?$/.exec(line);
  const key = entry.path[1] === 'mockup_format' ? originalKey : 'mockup_format';
  const quote = /^['"]/.exec(scalar)?.[0] ?? '';
  const value = entry.value === mode ? scalar : `${quote}${mode}${quote}`;
  const shippedComment = [LEGACY_COMMENT, '# html | claude_design | figma'].includes(tail.trimStart());
  return `${indent}${key}:${gap}${value}${shippedComment ? ` ${COMMENT}` : tail}${ending}`;
}

function insertSelection(lines, entries, project, mode, defaultEnding) {
  const additions = [];
  let insertion;
  let indent = '  ';
  if (project) {
    const child = entries.find(({ path: parts }) => parts[0] === 'project' && parts.length === 2);
    if (child) indent = /^ */.exec(lines[child.line - 1])[0];
    insertion = project.line;
  } else {
    let last = lines.length - 1;
    while (last >= 0 && /^\s*(?:#.*)?(?:\r?\n)?$/.test(lines[last])) last -= 1;
    insertion = lines[last]?.trimEnd() === '...' ? last : last + 1;
    additions.push('project:');
  }
  additions.push(`${indent}mockup_format: ${mode} ${COMMENT}`);
  const previousEnding = LINE_ENDING.exec(lines[insertion - 1] ?? '')?.[0];
  const nextEnding = LINE_ENDING.exec(lines[insertion] ?? '')?.[0];
  const ending = previousEnding ?? nextEnding ?? defaultEnding;
  const atUnterminatedEnd = insertion === lines.length && !previousEnding;
  if (atUnterminatedEnd && insertion > 0) lines[insertion - 1] += ending;
  lines.splice(insertion, 0, additions.join(ending) + (atUnterminatedEnd ? '' : ending));
}

function replaceConfig(file, text) {
  const mode = fs.statSync(file).mode;
  const tempDir = fs.mkdtempSync(path.join(path.dirname(file), '.asd-migration-'));
  const tempFile = path.join(tempDir, path.basename(file));
  try {
    fs.writeFileSync(tempFile, text, { encoding: 'utf8', flag: 'wx', mode });
    fs.renameSync(tempFile, file);
  } finally {
    fs.rmSync(tempFile, { force: true });
    fs.rmdirSync(tempDir);
  }
}

/** Retires the legacy selector while preserving the old UX-gated effective mode. */
module.exports = function migrate({ repoRoot }) {
  const configPath = path.join(repoRoot, CONFIG);
  if (!fs.existsSync(configPath)) return { status: 'absent', changes: [] };
  const raw = fs.readFileSync(configPath, 'utf8');
  const bom = raw.startsWith('\uFEFF') ? '\uFEFF' : '';
  const body = raw.slice(bom.length);

  // Use the same block-style YAML subset and line numbers as config-check. Fail before writing if
  // the relevant settings cannot be resolved. Unrelated settings are never reserialized.
  const relevant = ['<root>', 'project', 'documents', FORMAT, LEGACY, UX];
  const entries = configEntries(body, CONFIG, ({ path: key, line, reason }) => {
    if (relevant.includes(key)) throw new Error(`${CONFIG}:${line}: ${key}: ${reason}`);
  });
  const byPath = new Map(entries.map((entry) => [JSON.stringify(entry.path), entry]));
  const get = (...parts) => byPath.get(JSON.stringify(parts));
  const project = get('project');
  const documents = get('documents');
  const format = get('project', 'mockup_format');
  const legacy = get('project', 'claude_design');
  const ux = get('documents', 'ux_spec');
  for (const group of [project, documents]) {
    if (group?.kind === 'scalar') throw new Error(`${CONFIG}:${group.line}: ${group.path[0]} must be a mapping`);
  }
  for (const [entry, options] of [[format, FORMATS], [legacy, TOGGLES], [ux, TOGGLES]]) {
    if (entry && !options.includes(entry.value)) {
      throw new Error(`${CONFIG}:${entry.line}: ${entry.path.join('.')} must be ${options.join(' | ')}`);
    }
  }

  const oldUxEnabled = !documents || ux?.value === 'enabled';
  const oldFormat = format?.value ?? (legacy?.value === 'disabled' ? 'html' : 'claude_design');
  const mode = oldUxEnabled ? oldFormat : 'none';
  const lines = body === '' ? [] : body.split(/(?<=\n)/);
  const selection = format ?? legacy;
  if (selection) {
    const index = selection.line - 1;
    lines[index] = rewriteSelection(lines[index], selection, mode);
    if (lines[index - 1]?.trim() === OLD_HEADER) lines[index - 1] = lines[index - 1].replace(OLD_HEADER, HEADER);
  } else {
    insertSelection(lines, entries, project, mode, body.includes('\r\n') ? '\r\n' : '\n');
  }
  if (format && legacy) {
    const index = legacy.line - 1;
    const [, comment, ending = ''] = /[ \t]+(#.*)(\r?\n)?$/.exec(lines[index]) ?? [];
    if (comment && comment !== LEGACY_COMMENT) lines[index] = /^ */.exec(lines[index])[0] + comment + ending;
    else lines.splice(index, 1);
  }

  const next = bom + lines.join('');
  if (next === raw) return { status: 'unchanged', changes: [] };
  replaceConfig(configPath, next);
  const changes = [`${FORMAT}: ${mode}`];
  if (legacy) changes.push(`removed ${LEGACY}`);
  return { status: 'migrated', changes };
};
