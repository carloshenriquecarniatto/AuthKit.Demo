import type { StorybookConfig } from '@storybook/html-vite';

/**
 * Blazor has no official Storybook renderer. These stories embed the real, interactive component
 * from the running demo host in an iframe, with the arguments translated into query parameters.
 * The host renders the component with the same code the demo uses — no second implementation.
 */
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
};

export default config;
