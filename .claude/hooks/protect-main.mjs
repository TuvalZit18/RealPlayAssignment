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

const writesOnBranch = /\b(commit|merge|rebase|cherry-pick|revert|am|push)\b/;
const pushesToMain = new RegExp(`\\bpush\\b.*(\\s|:|\\+)${PROTECTED}(\\s|$)`);

function block(reason) {
  process.stderr.write(
    `Blocked by .claude/hooks/protect-main.mjs: ${reason}\n` +
      `Create a branch off ${PROTECTED} (e.g. git switch -c feat/<name>) and open a PR instead.\n`,
  );
  process.exit(2);
}

for (const segment of gitSegments) {
  if (pushesToMain.test(segment)) {
    block(`"${segment.trim()}" pushes to ${PROTECTED}.`);
  }
}

if (currentBranch(input?.cwd) === PROTECTED) {
  const offending = gitSegments.find((s) => writesOnBranch.test(s));
  if (offending) {
    block(`"${offending.trim()}" would change ${PROTECTED}, and the current branch is ${PROTECTED}.`);
  }
}

process.exit(0);
