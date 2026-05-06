#!/usr/bin/env node
/**
 * Stop hook — security reminder.
 * Informatívny: ak sa menili server/* súbory, pripomenie security review.
 * Neblokuje turn.
 */
'use strict';

const { execSync } = require('child_process');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

let stdin = '';
process.stdin.on('data', (c) => (stdin += c));
process.stdin.on('end', () => {
  try {
    const tracked = execSync('git diff --name-only HEAD', { cwd: REPO_ROOT, encoding: 'utf8' });
    const staged = execSync('git diff --name-only --cached', { cwd: REPO_ROOT, encoding: 'utf8' });
    const untracked = execSync('git ls-files --others --exclude-standard', {
      cwd: REPO_ROOT,
      encoding: 'utf8',
    });
    const files = [...tracked.split('\n'), ...staged.split('\n'), ...untracked.split('\n')]
      .map((s) => s.trim())
      .filter((f) => f.startsWith('server/') && /\.(ts|js)$/.test(f));

    if (files.length === 0) process.exit(0);

    const msg = [
      'SECURITY GATE: zmenené serverové súbory:',
      ...files.map((f) => `  - ${f}`),
      '',
      'Spusti security-reviewer subagent (Fáza 5b v /implement).',
      'Kontroluje: secrets v logoch, input validáciu, externé volania, CORS, rate limit.',
    ].join('\n');
    console.error(msg);
    process.exit(0);
  } catch {
    process.exit(0);
  }
});
