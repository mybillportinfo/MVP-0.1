import { spawn } from 'child_process';

const nextDev = spawn('npx', ['next', 'dev', '-p', '5000'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  shell: true
});

nextDev.on('error', (err) => {
  console.error('Failed to start Next.js:', err);
  process.exit(1);
});

nextDev.on('close', (code) => {
  process.exit(code || 0);
});
