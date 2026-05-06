#!/usr/bin/env node
/**
 * Stop hook — test gate.
 * Pri konci turn-u zistí čo sa zmenilo (tracked + untracked) a spustí
 * type-check + test pre dotknuté časti (client / server / oba).
 * Ak niečo zlyhá → výstup na stderr + exit 2 (zablokuje stop, Claude musí opraviť).
 */
'use strict';

const { execSync, spawnSync } = require('child_process');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

function changedFiles() {
  try {
    const tracked = execSync('git diff --name-only HEAD', { cwd: REPO_ROOT, encoding: 'utf8' });
    const staged = execSync('git diff --name-only --cached', { cwd: REPO_ROOT, encoding: 'utf8' });
    const untracked = execSync('git ls-files --others --exclude-standard', {
      cwd: REPO_ROOT,
      encoding: 'utf8',
    });
    return [...tracked.split('\n'), ...staged.split('\n'), ...untracked.split('\n')]
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function isCodeFile(p) {
  return /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(p);
}

function run(label, cmd, cwd) {
  const r = spawnSync('sh', ['-c', cmd], { cwd, encoding: 'utf8' });
  return {
    label,
    ok: r.status === 0,
    stdout: r.stdout || '',
    stderr: r.stderr || '',
    code: r.status,
  };
}

let stdin = '';
process.stdin.on('data', (c) => (stdin += c));
process.stdin.on('end', () => {
  try {
    const files = changedFiles().filter(isCodeFile);
    const hasClient = files.some((f) => f.startsWith('client/'));
    const hasServer = files.some((f) => f.startsWith('server/'));
    if (!hasClient && !hasServer) process.exit(0);

    const jobs = [];
    if (hasClient) {
      jobs.push(run('client type-check', 'npm run type-check --silent', path.join(REPO_ROOT, 'client')));
      jobs.push(run('client test', 'npm test --silent', path.join(REPO_ROOT, 'client')));
    }
    if (hasServer) {
      jobs.push(run('server type-check', 'npm run type-check --silent', path.join(REPO_ROOT, 'server')));
      jobs.push(run('server test', 'npm test --silent', path.join(REPO_ROOT, 'server')));
    }

    const failed = jobs.filter((j) => !j.ok);
    if (failed.length === 0) {
      console.error('TEST GATE: ✅ všetky type-checky a testy prešli.');
      process.exit(0);
    }

    let msg = 'TEST GATE: ❌ niektoré checky zlyhali — oprav pred dokončením turnu.\n';
    for (const j of failed) {
      msg += `\n--- ${j.label} (exit ${j.code}) ---\n`;
      msg += (j.stdout + j.stderr).split('\n').slice(-30).join('\n');
    }
    console.error(msg);
    // exit 2 = blokuje Stop, Claude dostane stderr a musí pokračovať
    process.exit(2);
  } catch (e) {
    console.error(`TEST GATE warning: ${e.message}`);
    process.exit(0);
  }
});
