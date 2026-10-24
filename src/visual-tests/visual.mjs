import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

/**
 * Pixel-by-pixel regression check for the demo pages.
 *
 * It is not a design review: it proves the rendered pages are identical to the committed
 * baselines, so a change to the shared sheet, a component or a build cannot move a pixel without
 * someone noticing. Run `npm run update` after an intended visual change.
 *
 * The host must be running. `DEMO_ORIGIN` defaults to http://localhost:5080; set it to 5089 when
 * testing a local build. `CHROME_PATH` overrides the browser used.
 */
const here = dirname(fileURLToPath(import.meta.url));
const baselineDir = join(here, 'baselines');
const origin = (process.env.DEMO_ORIGIN ?? 'http://localhost:5080').replace(/\/$/, '');
const update = process.argv.includes('--update');

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'blazor', path: '/blazor' },
  { name: 'angular', path: '/angular/' },
];

function findChrome() {
  if (process.env.CHROME_PATH) {
    return process.env.CHROME_PATH;
  }

  const cache = join(homedir(), '.cache', 'puppeteer', 'chrome');
  if (!existsSync(cache)) {
    throw new Error('No Chrome found. Set CHROME_PATH or run the demo with Puppeteer installed.');
  }

  for (const build of readdirSync(cache).sort().reverse()) {
    const candidates = [
      join(cache, build, 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
      join(cache, build, 'chrome-mac-x64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
      join(cache, build, 'chrome-linux64', 'chrome'),
    ];
    const found = candidates.find((candidate) => existsSync(candidate));
    if (found) {
      return found;
    }
  }

  throw new Error('No Chrome binary found under ~/.cache/puppeteer/chrome. Set CHROME_PATH.');
}

function readPng(path) {
  return PNG.sync.read(readFileSync(path));
}

async function capture(page, url, height) {
  await page.setViewportSize({ width: 1280, height });
  await page.goto(url, { waitUntil: 'networkidle' });
  // The galleries fetch /session and the Angular app bootstraps asynchronously.
  await page.waitForFunction(() => document.querySelector('h1') !== null, null, { timeout: 10_000 });
  await page.waitForTimeout(600);
  return page.screenshot({ fullPage: true, animations: 'disabled', caret: 'hide' });
}

async function main() {
  mkdirSync(baselineDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: findChrome(), headless: true });
  const page = await browser.newPage();
  let failed = 0;

  for (const target of PAGES) {
    const baselinePath = join(baselineDir, `${target.name}.png`);
    const screenshot = await capture(page, `${origin}${target.path}`, 900);

    if (update || !existsSync(baselinePath)) {
      writeFileSync(baselinePath, screenshot);
      console.log(`baseline  ${target.name.padEnd(8)} written (${screenshot.length} bytes)`);
      continue;
    }

    const expected = readPng(baselinePath);
    const actual = PNG.sync.read(screenshot);

    if (expected.width !== actual.width || expected.height !== actual.height) {
      console.error(
        `FAIL      ${target.name.padEnd(8)} size ${expected.width}x${expected.height} → ${actual.width}x${actual.height}`,
      );
      failed += 1;
      continue;
    }

    const diff = new PNG({ width: actual.width, height: actual.height });
    const changed = pixelmatch(expected.data, actual.data, diff.data, actual.width, actual.height, {
      threshold: 0.1,
      includeAA: false,
    });
    const total = actual.width * actual.height;
    const ratio = ((changed / total) * 100).toFixed(4);

    if (changed === 0) {
      console.log(`ok        ${target.name.padEnd(8)} 0 px changed (${total} compared)`);
    } else {
      writeFileSync(join(baselineDir, `${target.name}.diff.png`), PNG.sync.write(diff));
      console.error(`FAIL      ${target.name.padEnd(8)} ${changed} px changed (${ratio}%)`);
      failed += 1;
    }
  }

  await browser.close();

  if (failed > 0) {
    console.error(`\n${failed} page(s) differ. Inspect baselines/*.diff.png.`);
    process.exit(1);
  }

  console.log('\nAll pages match their baselines pixel for pixel.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
