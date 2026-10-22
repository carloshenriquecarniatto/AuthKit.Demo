import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Vite treats "#" as a URL fragment, so a checkout under ".../Dev/C#/..." cannot build Storybook in
 * place. Mirror the project to a temporary directory, build there, and copy the output back. CI and
 * Docker use clean paths and run in place.
 */
const root = process.cwd();
const entries = ['.storybook', 'src', 'package.json', 'package-lock.json'];

function build(cwd, out) {
  const cli = join(cwd, 'node_modules', 'storybook', 'dist', 'bin', 'dispatcher.js');
  const result = spawnSync(process.execPath, [cli, 'build', '-o', out], {
    cwd,
    stdio: 'inherit',
    env: process.env,
  });
  return result.status ?? 1;
}

if (!/[#?%]/.test(root)) {
  process.exit(build(root, 'storybook-static'));
}

const mirror = mkdtempSync(join(tmpdir(), 'authkit-storybook-'));
try {
  for (const entry of entries) {
    if (existsSync(join(root, entry))) {
      cpSync(join(root, entry), join(mirror, entry), { recursive: true });
    }
  }
  cpSync(join(root, 'node_modules'), join(mirror, 'node_modules'), { recursive: true });

  const status = build(mirror, join(mirror, 'storybook-static'));
  if (status === 0) {
    rmSync(join(root, 'storybook-static'), { recursive: true, force: true });
    cpSync(join(mirror, 'storybook-static'), join(root, 'storybook-static'), { recursive: true });
  }
  process.exit(status);
} finally {
  rmSync(mirror, { recursive: true, force: true });
}
