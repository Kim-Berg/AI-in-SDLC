import { existsSync, readFileSync } from 'node:fs';
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

// Heuristics tuned for the Zava repo (JWT_SECRET, API keys, .env writes).
const SECRET_PATTERNS = [
  { label: 'hard-coded JWT secret', re: /JWT_SECRET\s*=\s*['"][^'"]+['"]/i },
  { label: 'AWS access key', re: /AKIA[0-9A-Z]{16}/ },
  {
    label: 'generic API key',
    re: /(api[_-]?key|secret|token)\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i,
  },
  { label: 'private key block', re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
];
const PROTECTED_FILE = /(^|\/)\.env(\.|$)/;

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      continue: true,
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

const input = await readStdin();
const payload = input ? JSON.parse(input) : {};
const toolName = payload.tool_name ?? payload.toolName ?? '';
const toolInput = payload.tool_input ?? payload.toolInput ?? {};

const editTools = new Set(['create_file', 'replace_string_in_file', 'editFiles']);
if (editTools.has(toolName)) {
  const filePath = String(toolInput.filePath ?? '');

  // Block edits to committed secrets files outright.
  if (PROTECTED_FILE.test(filePath)) {
    deny(`Editing ${filePath} is blocked — keep secrets out of source.`);
  }

  // Scan proposed content; fall back to current file if no payload content.
  const content =
    toolInput.content ??
    toolInput.newString ??
    (filePath && existsSync(filePath) ? readFileSync(filePath, 'utf8') : '');

  for (const { label, re } of SECRET_PATTERNS) {
    if (re.test(content)) {
      deny(`Blocked: possible ${label} in ${filePath || 'edit'}. Use env vars, not literals.`);
    }
  }
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
