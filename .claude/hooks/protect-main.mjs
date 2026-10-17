// PreToolUse hook: blocks git commands that would change `main` directly.
// Workflow rule: never commit to or push to main; work on a branch and open a PR.
// Exit code 2 blocks the tool call and shows stderr to Claude.

import { execFileSync } from 'node:child_process';

const PROTECTED = 'main';

let raw = '';
for await (const chunk of process.stdin) raw += chunk;

let input;
try {
  input = JSON.parse(raw);
} catch {
  process.exit(0);
}

const command = String(input?.tool_input?.command ?? '');
if (!/\bgit\b/.test(command)) process.exit(0);

function currentBranch(cwd) {
  try {
    return execFileSync('git', ['branch', '--show-current'], {
      cwd: cwd || process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

// One git invocation = "git" up to the next shell separator.
const gitSegments = command.match(/\bgit\b[^;&|\n]*/g) ?? [];

// Subcommands that change the current branch or the remote.
const WRITE_SUBCOMMANDS = new Set(['commit', 'merge', 'rebase', 'cherry-pick', 'revert', 'am', 'push']);
// Global options that take a separate value, e.g. `git -C <path> commit`.
const OPTIONS_WITH_VALUE = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace']);

// Returns the subcommand (e.g. "merge-base", not "merge") and its arguments.
function parseGit(segment) {
  const tokens = segment.trim().split(/\s+/).slice(1);
  let i = 0;
  while (i < tokens.length && tokens[i].startsWith('-')) {
    i += OPTIONS_WITH_VALUE.has(tokens[i]) ? 2 : 1;
  }
  return { subcommand: tokens[i] ?? '', args: tokens.slice(i + 1) };
}

// main, HEAD:main, +main, refs/heads/main (quotes stripped).
const targetsMain = (arg) => new RegExp(`(^|[:+/])${PROTECTED}$`).test(arg.replace(/['"]/g, ''));

function block(reason) {
  process.stderr.write(
    `Blocked by .claude/hooks/protect-main.mjs: ${reason}\n` +
      `Create a branch off ${PROTECTED} (e.g. git switch -c feat/<name>) and open a PR instead.\n`,
  );
  process.exit(2);
}

const invocations = gitSegments.map((segment) => ({ segment: segment.trim(), ...parseGit(segment) }));

for (const { segment, subcommand, args } of invocations) {
  if (subcommand === 'push' && args.some(targetsMain)) {
    block(`"${segment}" pushes to ${PROTECTED}.`);
  }
}

if (currentBranch(input?.cwd) === PROTECTED) {
  const offending = invocations.find(({ subcommand }) => WRITE_SUBCOMMANDS.has(subcommand));
  if (offending) {
    block(`"${offending.segment}" would change ${PROTECTED}, and the current branch is ${PROTECTED}.`);
  }
}

process.exit(0);
