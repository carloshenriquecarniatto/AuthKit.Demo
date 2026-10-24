import type { StorybookConfig } from '@storybook/html-vite';

/**
 * Blazor has no official Storybook renderer. These stories embed the real, interactive component
 * from the running demo host in an iframe, with the arguments translated into query parameters.
 * The host renders the component with the same code the demo uses — no second implementation.
 *
 * This build is the manager for both stacks: the Angular Storybook is composed as a ref, so one
 * sidebar lists every component of the SDK family.
 */
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  refs: {
    angular: { title: 'Angular', url: '/storybook/angular' },
  },
  core: {
    disableTelemetry: true,
  },
};

export default config;
