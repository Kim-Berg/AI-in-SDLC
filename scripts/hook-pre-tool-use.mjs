import process from 'node:process';

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
  });
}

const input = await readStdin();
const payload = input ? JSON.parse(input) : {};
const toolName = payload.tool_name ?? payload.toolName ?? '';
const toolInput = payload.tool_input ?? payload.toolInput ?? {};
const command = String(toolInput.command ?? '');

const dangerousCommandPattern = /(rm\s+-rf\s+\/|git\s+push\s+--force|drop\s+database|remove-item\b.*-recurse\b.*-force\b|del\s+\/s\s+\/q)/i;
const isTerminalTool = toolName === 'run_in_terminal' || toolName === 'runInTerminal';

if (isTerminalTool && dangerousCommandPattern.test(command)) {
  process.stdout.write(
    JSON.stringify({
      continue: true,
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: 'Dangerous terminal command blocked by workspace policy.',
      },
    }),
  );
  process.exit(0);
}

process.stdout.write(
  JSON.stringify({
    continue: true,
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'allow',
    },
  }),
);