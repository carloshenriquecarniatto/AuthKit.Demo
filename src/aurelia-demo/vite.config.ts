import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

/**
 * Two workarounds, one root cause: this checkout lives under `…/Dev/C#/…`, and
 * Vite's `tryFsResolve` splits every candidate path at `#` (it is the URL
 * fragment separator). Node's own resolution and `tsc` are fine; Vite is not.
 *
 * 1. `@authkit/aurelia2` is installed with `file:` from the sibling SDK repo, so
 *    npm symlinks it to a real path that is not under `node_modules` — Vite's
 *    `#`-in-node_modules special case does not apply. The alias points rollup at
 *    the built entry as a plain filesystem path.
 * 2. Relative imports (`./app`, `./app.html?raw`, the SDK's own `./authkit-client`)
 *    would be split at `#` too. This plugin resolves them with Node's `path`
 *    before Vite's resolver sees them.
 *
 * Neither workaround is needed when the repository is cloned to a path without
 * `#`; both are harmless there. The SDK's own Vitest setup has the same
 * constraint (see AuthKit.Aurelia/authkit-aurelia2/README.md).
 */
const authKitEntry = fileURLToPath(
  new URL('../../../AuthKit.Aurelia/authkit-aurelia2/dist/index.js', import.meta.url),
);

const EXTENSIONS = ['', '.ts', '.mts', '.js', '.mjs', '.css', '.html', '.json'] as const;

function asFile(candidate: string): string | null {
  try {
    return existsSync(candidate) && statSync(candidate).isFile() ? candidate : null;
  } catch {
    return null;
  }
}

function hashSafeResolve(source: string, importer: string): string | null {
  const queryIndex = source.indexOf('?');
  const pathname = queryIndex === -1 ? source : source.slice(0, queryIndex);
  const query = queryIndex === -1 ? '' : source.slice(queryIndex);

  const importerPath = path.isAbsolute(importer) ? importer : path.resolve(importer);
  const base = path.resolve(path.dirname(importerPath), pathname);

  for (const extension of EXTENSIONS) {
    const found = asFile(base + extension);
    if (found !== null) {
      return found + query;
    }
  }

  // `./x.js` in TypeScript source usually means `./x.ts` on disk.
  const jsToTs = base.replace(/\.(m?)js$/, '.$1ts');
  if (jsToTs !== base) {
    const found = asFile(jsToTs);
    if (found !== null) {
      return found + query;
    }
  }

  for (const extension of EXTENSIONS) {
    const found = asFile(path.join(base, `index${extension}`));
    if (found !== null) {
      return found + query;
    }
  }

  return null;
}

const hashSafeResolver: Plugin = {
  name: 'authkit-demo:hash-safe-relative-resolver',
  enforce: 'pre',
  resolveId(source, importer) {
    if (importer === undefined || source.startsWith('\0')) {
      return null;
    }
    if (!source.startsWith('.') && !path.isAbsolute(source)) {
      return null;
    }
    return hashSafeResolve(source, importer);
  },
  // `vite:asset` also strips at `#` when it serves `?raw`, so templates are
  // read here. The returned module is plain JS and needs no further transform.
  load(id) {
    if (!id.endsWith('?raw')) {
      return null;
    }
    const file = id.slice(0, -'?raw'.length);
    return `export default ${JSON.stringify(readFileSync(file, 'utf8'))};`;
  },
};

export default defineConfig({
  // The .NET host serves this build under http://localhost:5080/aurelia/.
  // `base` must stay in sync with the host's static-file mount point, because
  // `import.meta.env.BASE_URL` is also the federation returnUrl.
  base: '/aurelia/',
  plugins: [hashSafeResolver],
  resolve: {
    alias: [{ find: /^@authkit\/aurelia2$/, replacement: authKitEntry }],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
  },
});
