import type { StorybookConfig } from '@storybook/html-vite';

/**
 * Blazor has no official Storybook renderer. These stories embed the real, interactive component
 * from the running demo host in an iframe, with the arguments translated into query parameters.
 * The host renders the component with the same code the demo uses — no second implementation.
 *
 * This build is the manager for both stacks: the Angular Storybook is composed as a ref, so one
 * sidebar lists every component of the SDK family.
 *
 * On GitHub Pages (`PAGES=1`) the Blazor stories are excluded: their frames need the .NET host.
 * The manager keeps a static introduction and the Angular ref, whose stories use an in-memory
 * provider and work without a backend.
 */
const pages = process.env.PAGES === '1';
const base = (process.env.PAGES_BASE ?? '').replace(/\/$/, '');

const config: StorybookConfig = {
  stories: pages ? ['../src/intro.stories.ts'] : ['../src/**/*.stories.ts'],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  refs: {
    angular: { title: 'Angular', url: `${base}/storybook/angular/` },
  },
  core: {
    disableTelemetry: true,
  },
};

export default config;
